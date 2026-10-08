// Onco360 – Bilan (étape C6), repris de l'application actuelle : période et filtres, totaux, journal détaillé avec
// « Payé / à recevoir », référents, radiothérapies prévisionnelles, autres versements, export Excel et PDF.
// Réservé au droit « finances ». Les calculs viennent du moteur v2 (même résultat au dirham près que la v1).
import { doc, getDoc, getDocs, setDoc, collection } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "../config.js";
import { evtsFin } from "../moteur/finances.js";
import { calculerBilan, dh, clePaye, estPaye } from "../moteur/bilan.js";
import { num } from "../moteur/outils.js";
import { activite } from "../moteur/tarifs.js";

let A = null;
export function installer(api) { A = api; }
const D = () => A.D();
let F = { per: "mois", du: "", au: "", hop: "tous", typ: "tous", q: "", cor: "tous", pay: "tous" }, B = null, RES = null, DATA = null;
const TYPES0 = [["tous", "Tous les actes"], ["seance", "Séances chimio"], ["cchimio", "Consultations chimio"], ["annonce", "Consultations annonce"], ["suivi", "Consultations suivi"], ["controle", "Contrôles"], ["hospit", "Hospitalisations"], ["rt", "Radiothérapie"], ["kl", "Autres versements"]];
// Types d'actes : liste de base + activités ajoutées dans les Paramètres (2nd avis…)
const typesActes = () => { const l = TYPES0.slice(), T = D().tarifs || {}; Object.values(T.etablissements || {}).forEach((e) => (e.activites || []).forEach((a) => { if (!l.some((x) => x[0] === a.type)) l.splice(l.length - 1, 0, [a.type, a.libelle]); })); return l; };
const PER = [["semaine", "Semaine en cours"], ["mois", "Mois en cours"], ["moisprec", "Mois dernier"], ["annee", "Année civile"], ["perso", "Période personnalisée"]];
const impot = () => { const T = D().tarifs || {}; const h = T.etablissements && Object.values(T.etablissements)[0]; const a = h && h.activites.find((x) => x.type === "seance"); const v = a && a.historique && a.historique[a.historique.length - 1]; return v && v.impot != null ? v.impot : 10; };
const tauxTxt = (o) => (o.t === "rt" ? (o.taux == null ? "ancien calcul" : o.taux + " % − " + impot() + " %") : o.t === "seance" || o.t === "hospit" ? "− " + impot() + " %" : "100 %");
// Paiements : ceux cochés dans le bilan, plus les actes « payés automatiquement » (Paramètres, case « Payé auto. » de l'activité
// de l'établissement, actes à partir de la date où elle a été cochée : 08/10/2026)
let PE = {};
const autoPaye = (o) => { const T = D().tarifs; if (!T || !o.t || o.t === "kl" || o.t === "rtprev" || !o.d) return false; const a = activite(T, o.hop, o.t); return !!(a && a.payeAuto && o.d >= a.payeAuto); };
function paiementsEffectifs(R) {
  const p = Object.assign({}, B.paiements);
  R.forEach((x) => (x.fin || []).forEach((e) => { const o = { id: x.id, t: e[1], d: e[0], lib: e[3], hop: e[2] || "" }, k = clePaye(o); if (!p[k] && autoPaye(o)) p[k] = o.d; }));
  return p;
}
const payeTxt = (o) => (o.t === "kl" ? "Reçu" : estPaye(o, PE) ? (B.paiements[clePaye(o)] ? "Payé le " + A.dfrA(PE[clePaye(o)]) : "Payé (automatique)") : "À recevoir");

// Chargement : montants de tous les dossiers, paiements, versements (une fois par session ; « Actualiser » recharge)
async function charger() {
  const E = (c, i) => doc(db, "espaces", A.ESPACE, c, i);
  const [sf, sp, sv] = await Promise.all([getDocs(collection(db, "espaces", A.ESPACE, "patientsFinances")), getDoc(E("finances", "paiements")).catch(() => null), getDoc(E("finances", "versements")).catch(() => null)]);
  const M = {}; sf.forEach((d) => { try { M[d.id] = JSON.parse(d.data().montantsJson || "{}"); } catch (e) { M[d.id] = {}; } });
  B = { M, paiements: sp && sp.exists() ? JSON.parse(sp.data().data || "{}") : {}, versements: sv && sv.exists() ? JSON.parse(sv.data().data || "[]") : [] };
  RES = null;
}
function resumes() {
  if (RES) return RES;
  const ctx = Object.assign({}, D().ctx, { table: D().tarifs });
  RES = D().patients.map((x) => {
    let fin = null; try { fin = JSON.parse(JSON.stringify(evtsFin(x.P, B.M[x.id] || {}, ctx))); } catch (e) { fin = null; }
    const dates = (fin || []).map((e) => e[0]).filter(Boolean).sort();
    return { id: x.id, nm: x.r.nm, cor: x.P.cor || "", diag: x.r.diag || "", hop: x.P.hop || "", c1: x.P.cree || dates[0] || "", fin };
  });
  return RES;
}
const netPer = (x, pr) => (x.fin || []).filter((e) => e[1] !== "rtprev" && e[0] && e[0] >= pr[0] && e[0] <= pr[1]).reduce((a, e) => a + (num(e[6]) || 0), 0);

export async function pagePageBilan() {
  if (!A.peut("finances") || !D().tarifs) { A.$("page").innerHTML = '<section class="accueil"><div><h2>Bilan</h2></div></section><section class="carte"><p class="sous">Le bilan est réservé au droit « finances ».</p></section>'; return; }
  if (!B) { A.$("page").innerHTML = '<div class="chargement">Calcul du bilan…</div>'; try { await charger(); } catch (e) { A.$("page").innerHTML = '<section class="carte"><p class="sous">Bilan indisponible : ' + A.esc(e.message) + "</p></section>"; return; } }
  dessiner();
}
function dessiner() {
  const esc = A.esc, R = resumes(), b = (PE = paiementsEffectifs(R), calculerBilan(R, B.versements, PE, F.per === "perso" ? Object.assign({}, F, { per: "" }) : F, D().t)), T = b.tot, all = b.all;
  DATA = b;
  const sel = (id, v, opts, f) => '<select id="' + id + '" onchange="biF(\'' + f + '\',this.value)">' + opts.map((o) => '<option value="' + esc(o[0]) + '"' + (o[0] === v ? " selected" : "") + ">" + esc(o[1]) + "</option>").join("") + "</select>";
  const refs = [...new Set(R.map((x) => x.cor || ""))].sort((a, z) => a.localeCompare(z, "fr"));
  const etabs = (D().etabsTous || D().etabs).map((e) => [e.code, e.code]);
  let h = '<section class="accueil"><div><h2>Bilan</h2><p>Du ' + A.dfrA(b.pr[0] > "0001" ? b.pr[0] : "") + " au " + A.dfrA(b.pr[1] < "9999" ? b.pr[1] : "") + "</p></div>" +
    '<div class="actions"><button class="bt clair" onclick="biExport(\'xlsx\')"><svg class="pi"><use href="#i-telecharger"/></svg>Excel</button><button class="bt clair" onclick="biExport(\'pdf\')"><svg class="pi"><use href="#i-telecharger"/></svg>PDF</button><button class="bt gris" onclick="biActualiser()"><svg class="pi"><use href="#i-actualiser"/></svg>Actualiser</button></div></section>' +
    '<section class="carte"><div class="form" style="grid-template-columns:repeat(auto-fit,minmax(190px,1fr))">' +
    "<div><label>Période</label>" + sel("biPer", F.per, PER, "per") + "</div>" +
    (F.per === "perso" ? '<div><label>Du</label><input type="date" value="' + esc(F.du) + '" onchange="biF(\'du\',this.value)"></div><div><label>Au</label><input type="date" value="' + esc(F.au) + '" onchange="biF(\'au\',this.value)"></div>' : "") +
    "<div><label>Établissement</label>" + sel("biHop", F.hop, [["tous", "Tous les centres"]].concat(etabs).concat([["—", "Non renseigné / autres"]]), "hop") + "</div>" +
    "<div><label>Type d'acte</label>" + sel("biTyp", F.typ, typesActes(), "typ") + "</div>" +
    "<div><label>Paiement</label>" + sel("biPay", F.pay, [["tous", "Payés et à recevoir"], ["paye", "Payés"], ["att", "À recevoir"]], "pay") + "</div>" +
    "<div><label>Référent</label>" + sel("biCor", F.cor, [["tous", "Tous les référents"]].concat(refs.map((c) => [c, c || "Sans référent"])), "cor") + "</div>" +
    '<div style="grid-column:1/-1"><label>Rechercher un acte ou un patient</label><input id="biQ" value="' + esc(F.q) + '" placeholder="ex. FOLFOX, prostate, VMAT, Zometa, nom…"></div></div>' +
    (b.manque ? '<p class="mesures"><svg class="pi"><use href="#i-alerte"/></svg>' + b.manque + " dossier(s) n'ont pas pu être calculés.</p>" : "") + "</section>";
  const k = (v, lib, cls) => '<div class="k' + (cls ? " " + cls : "") + '"><b>' + dh(v) + "</b><span>" + lib + "</span></div>";
  h += '<section class="carte"><div class="kpi">' + k(T.caNet, "CA NET médecin", "fort") + k(T.chimio, "Chimio – " + T.nbChimio + " séance(s)") + k(T.consultations, "Consultations – " + T.nbConsultations) + k(T.hospit, "Hospitalisations – " + T.nbHospit) + k(T.rt, "Radiothérapie – " + T.nbRt + " terminée(s)") + k(T.versements, "Autres versements – " + T.nbVersements) + "</div>" +
    '<div class="actr" style="justify-content:flex-start;gap:16px;margin-top:12px"><b style="color:var(--vert)"><svg class="pi"><use href="#i-check"/></svg>Payé : ' + dh(T.paye) + '</b><b style="color:var(--orange)"><svg class="pi"><use href="#i-sablier"/></svg>À recevoir : ' + dh(T.aRecevoir) + "</b></div>" +
    '<p class="mesures" style="margin:8px 0 0">Consultations : chimio ' + dh(T.cchimio) + " · annonce " + dh(T.annonce) + " · suivi " + dh(T.suivi) + " · contrôle " + dh(T.controle) + "</p>" +
    (T.nbPrev ? '<p class="mesures" style="margin:4px 0 0">☢️ Radiothérapies en cours ou prévues (non comptées) : ' + T.nbPrev + " – NET prévisionnel " + dh(T.netPrev) + "</p>" : "") + "</section>";
  h += '<section class="carte"><h3><span class="ic">' + A.ic("liste") + "</span>Journal détaillé (" + all.length + " acte" + (all.length > 1 ? "s" : "") + ')</h3><div class="tableau"><table class="tcures bilan"><tr><th>Date</th><th>Patient</th><th>Hôpital</th><th>Acte / prestation</th><th>Statut</th><th class="n">Brut</th><th class="n">Taux</th><th class="n">NET médecin</th><th>Paiement</th></tr>' +
    (all.length ? all.map((o, i) => {
      const cor = o.id ? (R.find((x) => x.id === o.id) || {}).cor : "";
      return "<tr" + (o.id ? ' class="cl" onclick="ouvrirDossier(\'' + o.id + "')\"" : "") + "><td>" + A.dfrA(o.d) + "</td><td>" + esc(o.nm) + (cor ? '<div class="mesures">' + esc(cor) + "</div>" : "") + "</td><td>" + esc(o.hop || "—") + "</td><td>" + esc(o.lib) + "</td><td>" + esc(o.st) + '</td><td class="n">' + dh(o.brut) + '</td><td class="n">' + tauxTxt(o) + '</td><td class="n"><b>' + dh(o.net) + "</b></td>" +
        '<td onclick="event.stopPropagation()">' + (o.t === "kl" ? '<span class="badge b-ch">Reçu</span>' : '<button class="mini ' + (estPaye(o, PE) ? "vert" : "") + '" title="' + (estPaye(o, PE) ? (B.paiements[clePaye(o)] ? "Payé le " + A.dfrA(PE[clePaye(o)]) + " – cliquer pour annuler" : "Payé automatiquement à la validation (Paramètres)") : "Cliquer quand la clinique a payé") + '" onclick="biPaye(' + i + ')">' + (estPaye(o, PE) ? (B.paiements[clePaye(o)] ? "✓ Payé" : "✓ Payé (auto.)") : "Payé") + "</button>") + "</td></tr>";
    }).join("") + '<tr class="tot"><td colspan="7" class="n"><b>Total</b></td><td class="n"><b>' + dh(T.caNet) + "</b></td><td></td></tr>" : '<tr><td colspan="9" class="mesures">Aucun acte sur la période.</td></tr>') + "</table></div></section>";
  // Référents
  if (F.cor !== "tous") {
    const l = R.filter((x) => (x.cor || "") === F.cor).sort((a, z) => String(z.c1).localeCompare(String(a.c1)));
    h += '<section class="carte"><h3><span class="ic">' + A.ic("patients") + "</span>Patients adressés par " + esc(F.cor || "— (sans référent)") + " (" + l.length + ')</h3><div class="tableau"><table class="tcures bilan"><tr><th>1re venue</th><th>Patient</th><th>Diagnostic</th><th>Hôpital</th><th class="n">NET sur la période</th><th class="n">NET total</th></tr>' +
      l.map((x) => '<tr class="cl" onclick="ouvrirDossier(\'' + x.id + "')\"><td>" + (x.c1 ? A.dfrA(x.c1) : "—") + "</td><td>" + esc(x.nm) + "</td><td>" + esc(x.diag) + "</td><td>" + esc(x.hop || "—") + '</td><td class="n">' + dh(netPer(x, b.pr)) + '</td><td class="n">' + dh(netPer(x, ["0000", "9999"])) + "</td></tr>").join("") + '</table></div><button class="mini" style="margin-top:8px" onclick="biF(\'cor\',\'tous\')">← Tous les référents</button></section>';
  } else {
    const m = {}; R.forEach((x) => { const c = x.cor || ""; m[c] = m[c] || { n: 0, np: 0, net: 0 }; m[c].n++; if (x.c1 && x.c1 >= b.pr[0] && x.c1 <= b.pr[1]) m[c].np++; m[c].net += netPer(x, b.pr); });
    const l = Object.keys(m).sort((a, z) => m[z].n - m[a].n || m[z].net - m[a].net);
    h += '<section class="carte"><h3><span class="ic">' + A.ic("patients") + '</span>Référents</h3><p class="sous">Touchez un référent pour voir les patients qu\'il vous a adressés.</p><div class="tableau"><table class="tcures bilan"><tr><th>Référent</th><th class="n">Patients adressés</th><th class="n">Nouveaux sur la période</th><th class="n">NET sur la période</th></tr>' +
      l.map((c) => '<tr class="cl" onclick="biF(\'cor\',' + esc(JSON.stringify(c)) + ')"><td>' + esc(c || "— (sans référent)") + '</td><td class="n">' + m[c].n + '</td><td class="n">' + m[c].np + '</td><td class="n">' + dh(m[c].net) + "</td></tr>").join("") + "</table></div></section>";
  }
  if (b.prev.length) h += '<section class="carte"><h3><span class="ic">☢️</span>Radiothérapies en cours ou prévues (prévisionnel, non comptées)</h3><div class="tableau"><table class="tcures bilan"><tr><th>Fin prévue</th><th>Patient</th><th>Hôpital</th><th>Acte</th><th class="n">NET prévisionnel</th></tr>' +
    b.prev.map((o) => '<tr class="cl" onclick="ouvrirDossier(\'' + o.id + "')\"><td>" + (o.d ? A.dfrA(o.d) : "—") + "</td><td>" + esc(o.nm) + "</td><td>" + esc(o.hop || "—") + "</td><td>" + esc(o.lib) + '</td><td class="n">' + dh(o.net) + "</td></tr>").join("") + "</table></div></section>";
  const KL = B.versements.map((e, i) => ({ e, i })).sort((a, z) => z.e.d.localeCompare(a.e.d));
  h += '<section class="carte"><h3><span class="ic"><svg class="i"><use href="#i-banque"/></svg></span>Versements autres</h3><p class="sous">Sommes reçues hors patients (KL, laboratoire…), ajoutées au bilan à leur date, établissement « Non renseigné ».</p>' +
    (KL.length ? '<div class="tableau"><table class="tcures bilan"><tr><th>Date</th><th>Libellé</th><th class="n">Montant</th><th></th></tr>' + KL.map(({ e, i }) => "<tr><td>" + A.dfrA(e.d) + "</td><td>" + esc(e.lib || "KL") + '</td><td class="n">' + dh(e.m) + '</td><td><button class="mini rouge" onclick="biKlSup(' + i + ')">✕</button></td></tr>').join("") + "</table></div>" : '<p class="mesures">Aucun versement.</p>') +
    '<div class="actr" style="justify-content:flex-start;margin-top:10px"><input id="klD" type="date" class="champ" style="max-width:170px;font-size:15px;padding:8px" value="' + D().t + '"><input id="klM" inputmode="decimal" class="champ mt" style="max-width:150px;font-size:15px;padding:8px" placeholder="Montant DH"><input id="klL" class="champ" style="flex:1;min-width:180px;font-size:15px;padding:8px" placeholder="Libellé * (ex. KL, laboratoire…)"><button class="bt clair petit" onclick="biKlAj()">+ Ajouter</button></div></section>';
  A.$("page").innerHTML = h;
  const q = A.$("biQ"); q.oninput = () => { clearTimeout(q.t); q.t = setTimeout(() => { F.q = q.value; dessiner(); const i = A.$("biQ"); i.focus(); i.setSelectionRange(i.value.length, i.value.length); }, 300); };
}
window.biF = (f, v) => { F[f] = v; dessiner(); };
window.biActualiser = async () => { B = null; await pagePageBilan(); A.toast("Bilan actualisé."); };
window.biPaye = async (i) => {
  const o = DATA.all[i]; if (!o || o.t === "kl") return; const k = clePaye(o), avant = B.paiements[k];
  if (!avant && PE[k]) { A.toast("Payé automatiquement à la validation : décochez « Payé auto. » dans les Paramètres pour gérer ce paiement à la main."); return; }
  if (avant) { if (!confirm("Remettre « " + o.lib + " » en attente de paiement ?")) return; delete B.paiements[k]; } else B.paiements[k] = D().t;
  try { await setDoc(doc(db, "espaces", A.ESPACE, "finances", "paiements"), { data: JSON.stringify(B.paiements) }); dessiner(); }
  catch (e) { if (avant) B.paiements[k] = avant; else delete B.paiements[k]; A.toast("Enregistrement impossible : " + e.message); }
};
async function sauverKL() { await setDoc(doc(db, "espaces", A.ESPACE, "finances", "versements"), { data: JSON.stringify(B.versements) }); dessiner(); }
window.biKlAj = async () => {
  const d = A.val("klD"), m = num(A.val("klM")), l = A.val("klL");
  if (!d || m == null || !l) { A.toast("Date, montant et libellé obligatoires."); return; }
  B.versements.push({ d, m, lib: l }); try { await sauverKL(); A.journal({ id: "", r: { nm: "" } }, "Versement ajouté : " + l + " (" + m + " DH)"); } catch (e) { B.versements.pop(); A.toast(e.message); }
};
window.biKlSup = async (i) => { const e = B.versements[i]; if (!confirm("Supprimer le versement « " + (e.lib || "KL") + " » de " + dh(e.m) + " ?")) return; B.versements.splice(i, 1); try { await sauverKL(); } catch (er) { B.versements.splice(i, 0, e); A.toast(er.message); } };

// ───── Exports ─────
const filtresTxt = () => ["Période : du " + A.dfrA(DATA.pr[0] > "0001" ? DATA.pr[0] : "") + " au " + A.dfrA(DATA.pr[1] < "9999" ? DATA.pr[1] : ""), "Établissement : " + (F.hop === "tous" ? "tous" : F.hop), "Type d'acte : " + (typesActes().find((t) => t[0] === F.typ) || [0, F.typ])[1], "Paiement : " + ({ tous: "payés et à recevoir", paye: "payés", att: "à recevoir" }[F.pay]), "Référent : " + (F.cor === "tous" ? "tous" : F.cor || "sans référent")].concat(F.q ? ["Recherche : " + F.q] : []);
const nomMed = () => { const p = D().profil || {}; return [p.titre || "Dr", p.prenom, String(p.nom || "Bentahila").replace(/^Dr\.?\s*/i, "").toLowerCase().replace(/(^|[\s-])\S/g, (c) => c.toUpperCase())].filter(Boolean).join(" "); };
const indic = () => { const T = DATA.tot; return [["CA NET médecin", T.caNet, T.nbActes], ["Chimio (séances)", T.chimio, T.nbChimio], ["Consultations", T.consultations, T.nbConsultations], ["Hospitalisations", T.hospit, T.nbHospit], ["Radiothérapie (terminées)", T.rt, T.nbRt], ["Autres versements", T.versements, T.nbVersements], ["Payé", T.paye, ""], ["À recevoir", T.aRecevoir, ""]]; };
window.biExport = async (fmt) => {
  if (!DATA) return;
  const nom = "Bilan_" + DATA.pr[0] + "_" + DATA.pr[1];
  if (fmt === "pdf") {
    const td = 'style="border:1px solid #ccc;padding:3px 5px"', tr = 'style="border:1px solid #ccc;padding:3px 5px;text-align:right"', esc = A.esc;
    const html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + nom + '</title><style>@page{size:A4 landscape;margin:12mm}body{font-family:Arial,sans-serif;font-size:9pt;color:#222}table{border-collapse:collapse;width:100%;margin-top:8px}th{background:#2B2D5C;color:#fff;padding:4px 5px;text-align:left}</style></head><body>' +
      '<div style="font-size:15pt;font-weight:bold;color:#2B2D5C">BILAN – ' + esc(nomMed()) + '</div><div style="color:#666">Édité le ' + A.dfrA(D().t) + "</div><div style=\"margin:6px 0\">" + filtresTxt().map(esc).join("<br>") + "</div>" +
      "<table><tr><th>Indicateur</th><th>Montant NET</th><th>Nombre</th></tr>" + indic().map((k) => "<tr><td " + td + ">" + k[0] + "</td><td " + tr + ">" + dh(k[1]) + "</td><td " + tr + ">" + k[2] + "</td></tr>").join("") + "</table>" +
      "<table><tr><th>Date</th><th>Patient</th><th>Hôpital</th><th>Acte / prestation</th><th>Statut</th><th>Brut</th><th>Taux</th><th>NET</th><th>Paiement</th></tr>" + DATA.all.map((o) => "<tr><td " + td + ">" + A.dfrA(o.d) + "</td><td " + td + ">" + esc(o.nm) + "</td><td " + td + ">" + esc(o.hop || "—") + "</td><td " + td + ">" + esc(o.lib) + "</td><td " + td + ">" + esc(o.st) + "</td><td " + tr + ">" + dh(o.brut) + "</td><td " + tr + ">" + tauxTxt(o) + "</td><td " + tr + "><b>" + dh(o.net) + "</b></td><td " + td + ">" + payeTxt(o) + "</td></tr>").join("") + "</table></body></html>";
    const w = window.open("", "_blank"); if (!w) { A.toast("Autorisez l'ouverture des fenêtres pour imprimer le bilan."); return; }
    w.document.open(); w.document.write(html); w.document.close(); setTimeout(() => { w.focus(); w.print(); }, 500); return;
  }
  try {
    const syn = [["BILAN – " + nomMed()], ["Édité le " + A.dfrA(D().t)], []].concat(filtresTxt().map((x) => [x])).concat([[], ["Indicateur", "Montant NET (DH)", "Nombre"]]).concat(indic().map((k) => [k[0], Math.round(k[1] * 100) / 100, k[2]]));
    if (DATA.prev.length) syn.push([], ["Radiothérapies en cours ou prévues (non comptées)", Math.round(DATA.tot.netPrev), DATA.prev.length]);
    const cor = (id) => ((RES || []).find((x) => x.id === id) || {}).cor || "";
    const jr = [["Date", "Patient", "Référent", "Hôpital", "Acte / prestation", "Statut", "Brut (DH)", "Taux", "NET médecin (DH)", "Paiement"]].concat(DATA.all.map((o) => [A.dfrA(o.d), o.nm, o.id ? cor(o.id) : "", o.hop || "—", o.lib, o.st, num(o.brut) || 0, tauxTxt(o), Math.round((num(o.net) || 0) * 100) / 100, payeTxt(o)]));
    jr.push(["", "", "", "", "", "", "", "TOTAL", Math.round(DATA.tot.caNet * 100) / 100, ""]);
    const feuilles = [["Synthèse", syn, [48, 18, 10]], ["Journal", jr, [11, 28, 22, 9, 52, 11, 12, 16, 16, 18]]];
    if (DATA.prev.length) feuilles.push(["RT prévisionnel", [["Fin prévue", "Patient", "Hôpital", "Acte", "NET prévisionnel (DH)"]].concat(DATA.prev.map((o) => [o.d ? A.dfrA(o.d) : "—", o.nm, o.hop || "—", o.lib, num(o.net) || 0])), [11, 28, 9, 45, 18]]);
    await excel(feuilles, nom + ".xlsx");
  } catch (e) { A.toast("Export Excel impossible : " + e.message); }
};
let zipP = null;
const chargerZip = () => window.JSZip ? Promise.resolve(window.JSZip) : (zipP = zipP || new Promise((ok, ko) => { const s = document.createElement("script"); s.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"; s.onload = () => ok(window.JSZip); s.onerror = () => ko(new Error("connexion ?")); document.head.appendChild(s); }));
async function excel(feuilles, nom) {
  const JSZip = await chargerZip(), x = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const col = (i) => (i >= 26 ? String.fromCharCode(64 + Math.floor(i / 26)) : "") + String.fromCharCode(65 + (i % 26));
  const z = new JSZip(), ct = [], rels = [], sh = [];
  feuilles.forEach(([n, rows, w], k) => {
    const data = rows.map((r, i) => '<row r="' + (i + 1) + '">' + r.map((v, j) => { const ref = col(j) + (i + 1), s = (n === "Journal" && i === 0) || (n !== "Journal" && i === 0) ? ' s="1"' : ""; return typeof v === "number" ? '<c r="' + ref + '"' + s + "><v>" + v + "</v></c>" : '<c r="' + ref + '"' + s + ' t="inlineStr"><is><t xml:space="preserve">' + x(v) + "</t></is></c>"; }).join("") + "</row>").join("");
    z.file("xl/worksheets/sheet" + (k + 1) + ".xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><cols>' + w.map((v, j) => '<col min="' + (j + 1) + '" max="' + (j + 1) + '" width="' + v + '" customWidth="1"/>').join("") + "</cols><sheetData>" + data + "</sheetData></worksheet>");
    ct.push('<Override PartName="/xl/worksheets/sheet' + (k + 1) + '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>');
    rels.push('<Relationship Id="rId' + (k + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet' + (k + 1) + '.xml"/>');
    sh.push('<sheet name="' + x(n) + '" sheetId="' + (k + 1) + '" r:id="rId' + (k + 1) + '"/>');
  });
  const n = feuilles.length;
  z.file("[Content_Types].xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' + ct.join("") + "</Types>");
  z.file("_rels/.rels", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>');
  z.file("xl/workbook.xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>' + sh.join("") + "</sheets></workbook>");
  z.file("xl/_rels/workbook.xml.rels", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + rels.join("") + '<Relationship Id="rId' + (n + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>');
  z.file("xl/styles.xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="10"/><name val="Arial"/></font><font><b/><sz val="10"/><name val="Arial"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf/></cellStyleXfs><cellXfs count="2"><xf/><xf fontId="1" applyFont="1"/></cellXfs></styleSheet>');
  const blob = await z.generateAsync({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = nom; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
}
