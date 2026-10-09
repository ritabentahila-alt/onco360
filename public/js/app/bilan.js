// Onco360 – Bilan (étape C6), repris de l'application actuelle : période et filtres, totaux, journal détaillé avec
// « Payé / à recevoir », référents, radiothérapies prévisionnelles, autres versements, règlements reçus des cliniques (hors
// bilan), export Excel et PDF.
// Réservé au droit « finances ». Les calculs viennent du moteur v2 (même résultat au dirham près que la v1).
import { doc, getDoc, getDocs, setDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "../config.js";
import { evtsFin } from "../moteur/finances.js";
import { calculerBilan, dh, clePaye, estPaye } from "../moteur/bilan.js";
import { num } from "../moteur/outils.js";
import { activite } from "../moteur/tarifs.js";

let A = null;
export function installer(api) { A = api; }
const D = () => A.D();
let F = { per: "mois", du: "", au: "", hop: "tous", typ: "tous", q: "", cor: "tous", pay: "tous", rmode: "tous", renc: "tous" }, B = null, RES = null, DATA = null;
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

// ───── Relevé financier du comptable (étape 9 S2, 09/10/2026) ─────
// espaces/{e}/comptabilite/releve_0…n = { data: JSON [{ id, nm, num, cor, hop, c1, fin }] } (fin = lignes du bilan : date, acte,
// établissement, libellé, brut, taux, net, statut), meta = { n, le, par, parNom, sig } : préparé par un médecin qui a le droit
// « finances » (ouverture d'Onco360, enregistrement d'un dossier), sans diagnostic ni contenu médical ; le comptable ne lit que ça.
const estComptable = () => D().membre.role === "comptable";
let SIG = null, RELEVE_LE = null;
const signature = (s) => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return s.length + "-" + (h >>> 0).toString(36); };
export async function publierReleve() {
  if (!A.peut("finances") || estComptable() || !D().tarifs) return;
  await charger(); RES = null;
  const R = resumes().map((x) => ({ id: x.id, nm: x.nm, num: A.numDossier((D().patients || []).find((p) => p.id === x.id)), cor: x.cor, hop: x.hop, c1: x.c1, fin: x.fin }));
  const tout = JSON.stringify(R), sig = signature(tout), E = (i) => doc(db, "espaces", A.ESPACE, "comptabilite", i);
  if (SIG === null) { const m = await getDoc(E("meta")).catch(() => null); SIG = m && m.exists() ? m.data().sig || "" : ""; }
  if (sig === SIG) return; // rien n'a changé depuis le dernier relevé
  const parts = []; let cur = [], taille = 0; // documents de 600 Ko au plus (limite Firestore : 1 Mo)
  R.forEach((r) => { const t = JSON.stringify(r).length; if (cur.length && taille + t > 600000) { parts.push(cur); cur = []; taille = 0; } cur.push(r); taille += t; });
  parts.push(cur);
  for (let i = 0; i < parts.length; i++) await setDoc(E("releve_" + i), { data: JSON.stringify(parts[i]) });
  await setDoc(E("meta"), { n: parts.length, le: serverTimestamp(), par: D().u.uid, parNom: [D().profil.titre || "Dr", D().profil.prenom, D().profil.nom].filter(Boolean).join(" "), sig, nb: R.length });
  SIG = sig;
}
async function chargerReleve() {
  const E = (c, i) => doc(db, "espaces", A.ESPACE, c, i), m = await getDoc(E("comptabilite", "meta"));
  const meta = m.exists() ? m.data() : { n: 0 }, parts = await Promise.all(Array.from({ length: meta.n || 0 }, (_, i) => getDoc(E("comptabilite", "releve_" + i))));
  RES = [].concat(...parts.map((p) => (p.exists() ? JSON.parse(p.data().data || "[]") : []))).map((x) => Object.assign({ diag: "" }, x));
  RELEVE_LE = !meta.le ? null : meta.le.toDate ? meta.le.toDate() : new Date(meta.le);
  const [sp, sv, sr] = await Promise.all([getDoc(E("finances", "paiements")).catch(() => null), getDoc(E("finances", "versements")).catch(() => null), getDoc(E("finances", "reglements")).catch(() => null)]);
  B = { M: {}, paiements: sp && sp.exists() ? JSON.parse(sp.data().data || "{}") : {}, versements: sv && sv.exists() ? JSON.parse(sv.data().data || "[]") : [], reglements: liste(sr) };
}
// Lien vers le dossier depuis une ligne du bilan (pas pour le comptable : il n'ouvre aucun dossier)
const lienDossier = (id) => (id && !estComptable() ? ' class="cl" onclick="ouvrirDossier(\'' + id + "')\"" : "");

// Chargement : montants de tous les dossiers, paiements, versements (une fois par session ; « Actualiser » recharge)
async function charger() {
  const E = (c, i) => doc(db, "espaces", A.ESPACE, c, i);
  const [sf, sp, sv, sr] = await Promise.all([getDocs(collection(db, "espaces", A.ESPACE, "patientsFinances")), getDoc(E("finances", "paiements")).catch(() => null), getDoc(E("finances", "versements")).catch(() => null), getDoc(E("finances", "reglements")).catch(() => null)]);
  const M = {}; sf.forEach((d) => { try { M[d.id] = JSON.parse(d.data().montantsJson || "{}"); } catch (e) { M[d.id] = {}; } });
  B = { M, paiements: sp && sp.exists() ? JSON.parse(sp.data().data || "{}") : {}, versements: sv && sv.exists() ? JSON.parse(sv.data().data || "[]") : [], reglements: liste(sr) };
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
  if (!B) { A.$("page").innerHTML = '<div class="chargement">Calcul du bilan…</div>'; try { await (estComptable() ? chargerReleve() : charger()); } catch (e) { A.$("page").innerHTML = '<section class="carte"><p class="sous">Bilan indisponible : ' + A.esc(e.message) + "</p></section>"; return; } }
  dessiner();
}
function dessiner() {
  const esc = A.esc, R = resumes(), b = (PE = paiementsEffectifs(R), calculerBilan(R, B.versements, PE, F.per === "perso" ? Object.assign({}, F, { per: "" }) : F, D().t)), T = b.tot, all = b.all;
  DATA = b;
  const sel = (id, v, opts, f) => '<select id="' + id + '" onchange="biF(\'' + f + '\',this.value)">' + opts.map((o) => '<option value="' + esc(o[0]) + '"' + (o[0] === v ? " selected" : "") + ">" + esc(o[1]) + "</option>").join("") + "</select>";
  const refs = [...new Set(R.map((x) => x.cor || ""))].sort((a, z) => a.localeCompare(z, "fr"));
  const etabs = (D().etabsTous || D().etabs).map((e) => [e.code, e.code]);
  let h = '<section class="accueil"><div><h2>Bilan</h2><p>Du ' + A.dfrA(b.pr[0] > "0001" ? b.pr[0] : "") + " au " + A.dfrA(b.pr[1] < "9999" ? b.pr[1] : "") +
    (estComptable() ? " · " + (RELEVE_LE ? "relevé à jour au " + RELEVE_LE.toLocaleDateString("fr-FR") + " " + RELEVE_LE.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "aucun relevé : il est préparé quand un médecin ouvre Onco360") : "") + "</p></div>" +
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
      return "<tr" + lienDossier(o.id) + "><td>" + A.dfrA(o.d) + "</td><td>" + esc(o.nm) + (cor ? '<div class="mesures">' + esc(cor) + "</div>" : "") + "</td><td>" + esc(o.hop || "—") + "</td><td>" + esc(o.lib) + "</td><td>" + esc(o.st) + '</td><td class="n">' + dh(o.brut) + '</td><td class="n">' + tauxTxt(o) + '</td><td class="n"><b>' + dh(o.net) + "</b></td>" +
        '<td onclick="event.stopPropagation()">' + (o.t === "kl" ? '<span class="badge b-ch">Reçu</span>' : '<button class="mini ' + (estPaye(o, PE) ? "vert" : "") + '" title="' + (estPaye(o, PE) ? (B.paiements[clePaye(o)] ? "Payé le " + A.dfrA(PE[clePaye(o)]) + " – cliquer pour annuler" : "Payé automatiquement à la validation (Paramètres)") : "Cliquer quand la clinique a payé") + '" onclick="biPaye(' + i + ')">' + (estPaye(o, PE) ? (B.paiements[clePaye(o)] ? "✓ Payé" : "✓ Payé (auto.)") : "Payé") + "</button>") + "</td></tr>";
    }).join("") + '<tr class="tot"><td colspan="7" class="n"><b>Total</b></td><td class="n"><b>' + dh(T.caNet) + "</b></td><td></td></tr>" : '<tr><td colspan="9" class="mesures">Aucun acte sur la période.</td></tr>') + "</table></div></section>";
  // Référents
  if (F.cor !== "tous") {
    const l = R.filter((x) => (x.cor || "") === F.cor).sort((a, z) => String(z.c1).localeCompare(String(a.c1)));
    h += '<section class="carte"><h3><span class="ic">' + A.ic("patients") + "</span>Patients adressés par " + esc(F.cor || "— (sans référent)") + " (" + l.length + ')</h3><div class="tableau"><table class="tcures bilan"><tr><th>1re venue</th><th>Patient</th><th>Diagnostic</th><th>Hôpital</th><th class="n">NET sur la période</th><th class="n">NET total</th></tr>' +
      l.map((x) => "<tr" + lienDossier(x.id) + "><td>" + (x.c1 ? A.dfrA(x.c1) : "—") + "</td><td>" + esc(x.nm) + "</td><td>" + esc(x.diag) + "</td><td>" + esc(x.hop || "—") + '</td><td class="n">' + dh(netPer(x, b.pr)) + '</td><td class="n">' + dh(netPer(x, ["0000", "9999"])) + "</td></tr>").join("") + '</table></div><button class="mini" style="margin-top:8px" onclick="biF(\'cor\',\'tous\')">← Tous les référents</button></section>';
  } else {
    const m = {}; R.forEach((x) => { const c = x.cor || ""; m[c] = m[c] || { n: 0, np: 0, net: 0 }; m[c].n++; if (x.c1 && x.c1 >= b.pr[0] && x.c1 <= b.pr[1]) m[c].np++; m[c].net += netPer(x, b.pr); });
    const l = Object.keys(m).sort((a, z) => m[z].n - m[a].n || m[z].net - m[a].net);
    h += '<section class="carte"><h3><span class="ic">' + A.ic("patients") + '</span>Référents</h3><p class="sous">Touchez un référent pour voir les patients qu\'il vous a adressés.</p><div class="tableau"><table class="tcures bilan"><tr><th>Référent</th><th class="n">Patients adressés</th><th class="n">Nouveaux sur la période</th><th class="n">NET sur la période</th></tr>' +
      l.map((c) => '<tr class="cl" onclick="biF(\'cor\',' + esc(JSON.stringify(c)) + ')"><td>' + esc(c || "— (sans référent)") + '</td><td class="n">' + m[c].n + '</td><td class="n">' + m[c].np + '</td><td class="n">' + dh(m[c].net) + "</td></tr>").join("") + "</table></div></section>";
  }
  if (b.prev.length) h += '<section class="carte"><h3><span class="ic">☢️</span>Radiothérapies en cours ou prévues (prévisionnel, non comptées)</h3><div class="tableau"><table class="tcures bilan"><tr><th>Fin prévue</th><th>Patient</th><th>Hôpital</th><th>Acte</th><th class="n">NET prévisionnel</th></tr>' +
    b.prev.map((o) => "<tr" + lienDossier(o.id) + "><td>" + (o.d ? A.dfrA(o.d) : "—") + "</td><td>" + esc(o.nm) + "</td><td>" + esc(o.hop || "—") + "</td><td>" + esc(o.lib) + '</td><td class="n">' + dh(o.net) + "</td></tr>").join("") + "</table></div></section>";
  const KL = B.versements.map((e, i) => ({ e, i })).sort((a, z) => z.e.d.localeCompare(a.e.d));
  h += '<section class="carte"><h3><span class="ic"><svg class="i"><use href="#i-banque"/></svg></span>Versements autres</h3><p class="sous">Sommes reçues hors patients (KL, laboratoire…), ajoutées au bilan à leur date, établissement « Non renseigné ».</p>' +
    (KL.length ? '<div class="tableau"><table class="tcures bilan"><tr><th>Date</th><th>Libellé</th><th class="n">Montant</th><th></th></tr>' + KL.map(({ e, i }) => "<tr><td>" + A.dfrA(e.d) + "</td><td>" + esc(e.lib || "KL") + '</td><td class="n">' + dh(e.m) + '</td><td><button class="mini rouge" onclick="biKlSup(' + i + ')">✕</button></td></tr>').join("") + "</table></div>" : '<p class="mesures">Aucun versement.</p>') +
    '<div class="actr" style="justify-content:flex-start;margin-top:10px"><input id="klD" type="date" class="champ" style="max-width:170px;font-size:15px;padding:8px" value="' + D().t + '"><input id="klM" inputmode="decimal" class="champ mt" style="max-width:150px;font-size:15px;padding:8px" placeholder="Montant DH"><input id="klL" class="champ" style="flex:1;min-width:180px;font-size:15px;padding:8px" placeholder="Libellé * (ex. KL, laboratoire…)"><button class="bt clair petit" onclick="biKlAj()">+ Ajouter</button></div></section>';
  h += htmlReglements(b, R);
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

// ───── Règlements reçus des cliniques (étape 15, 09/10/2026) ─────
// finances/reglements = { data: JSON [{ id, d (date de réception), hop (clinique), mode vir|chq, m, ref (n° du chèque ou référence
// du virement), banque, per (période ou actes concernés), enc (encaissé le), note, par, parNom, le }] }.
// Pour la comptabilité seulement : jamais comptés dans le bilan (le bilan compte déjà les actes). Écrits par le médecin
// (droit « finances »), lus par le comptable (règle : il n'écrit que paiements et versements).
const liste = (s) => { try { return s && s.exists() ? JSON.parse(s.data().data || "[]") : []; } catch (e) { return []; } };
const MODES = { vir: "Virement", chq: "Chèque" };
const peutRg = () => A.peut("finances") && !estComptable();
const somme = (l) => l.reduce((a, r) => a + (num(r.m) || 0), 0);
const moisTxt = (m) => { const t = new Date(m + "-15T12:00:00").toLocaleDateString("fr-FR", { month: "long", year: "numeric" }); return t.charAt(0).toUpperCase() + t.slice(1); };
const etabNom = (c) => { const e = (D().etabsTous || D().etabs || []).find((z) => z.code === c); return "<b>" + A.esc(c || "—") + "</b>" + (e && e.nom ? '<div class="mesures">' + A.esc(e.nom) + "</div>" : ""); };
// Règlements de la période et de l'établissement choisis en haut de la page, puis mode et encaissement
function reglementsFiltres(pr) {
  return (B.reglements || []).filter((r) => r.d >= pr[0] && r.d <= pr[1] && (F.hop === "tous" || (r.hop || "—") === F.hop) &&
    (F.rmode === "tous" || r.mode === F.rmode) && (F.renc === "tous" || (F.renc === "oui" ? !!r.enc : !r.enc))).sort((a, z) => z.d.localeCompare(a.d) || (z.le || 0) - (a.le || 0));
}
function htmlReglements(b, R) {
  const esc = A.esc, L = reglementsFiltres(b.pr), tot = somme(L), ed = peutRg();
  DATA.rg = L;
  const sel = (v, opts, f) => '<select onchange="biF(\'' + f + '\',this.value)">' + opts.map((o) => '<option value="' + o[0] + '"' + (o[0] === v ? " selected" : "") + ">" + o[1] + "</option>").join("") + "</select>";
  let h = '<section class="carte" id="biRg"><h3><span class="ic"><svg class="i"><use href="#i-banque"/></svg></span>Règlements reçus des cliniques</h3>' +
    '<p class="sous">Virements et chèques reçus des cliniques, avec leur date de réception, pour la comptabilité. <b>Non comptés dans le bilan</b> (le bilan compte déjà les actes). Période et établissement : ceux choisis en haut de la page.' + (ed ? "" : " Lecture seule.") + "</p>" +
    '<div class="form" style="grid-template-columns:repeat(auto-fit,minmax(170px,1fr));margin-bottom:10px"><div><label>Mode</label>' + sel(F.rmode, [["tous", "Virements et chèques"], ["vir", "Virements"], ["chq", "Chèques"]], "rmode") + "</div>" +
    "<div><label>Encaissement</label>" + sel(F.renc, [["tous", "Tous"], ["oui", "Encaissés"], ["non", "Pas encore encaissés"]], "renc") + "</div></div>";
  if (L.length) {
    // Par clinique, avec pour information les actes de la même période dans le bilan (NET, payé, à recevoir)
    const cl = [...new Set(L.map((r) => r.hop || "—"))].sort();
    h += '<div class="kpi" style="margin-bottom:10px"><div class="k fort"><b>' + dh(tot) + "</b><span>Total reçu – " + L.length + " règlement" + (L.length > 1 ? "s" : "") + "</span></div>" +
      cl.map((c) => { const l = L.filter((r) => (r.hop || "—") === c); return '<div class="k"><b>' + dh(somme(l)) + "</b><span>" + esc(c) + " – " + l.length + "</span></div>"; }).join("") + "</div>";
    h += '<div class="tableau"><table class="tcures bilan"><tr><th>Clinique</th><th class="n">Virements</th><th class="n">Chèques</th><th class="n">Total reçu</th><th class="n">Actes de la période (NET)</th><th class="n">dont payé</th><th class="n">dont à recevoir</th></tr>' +
      cl.map((c) => {
        const l = L.filter((r) => (r.hop || "—") === c), T = calculerBilan(R, [], PE, { per: "", du: b.pr[0], au: b.pr[1], hop: c }, D().t).tot;
        return "<tr><td>" + etabNom(c) + '</td><td class="n">' + dh(somme(l.filter((r) => r.mode === "vir"))) + '</td><td class="n">' + dh(somme(l.filter((r) => r.mode === "chq"))) + '</td><td class="n"><b>' + dh(somme(l)) + '</b></td><td class="n">' + dh(T.caNet) + '</td><td class="n">' + dh(T.paye) + '</td><td class="n">' + dh(T.aRecevoir) + "</td></tr>";
      }).join("") + '</table></div><p class="mesures" style="margin:4px 0 12px">Actes de la période : pour information seulement (un règlement reçu un mois paie souvent les actes d\'un mois précédent).</p>';
    // Par mois, si la période en couvre plusieurs
    const mois = [...new Set(L.map((r) => r.d.slice(0, 7)))].sort().reverse();
    if (mois.length > 1) h += '<div class="tableau"><table class="tcures bilan"><tr><th>Mois de réception</th><th>Par clinique</th><th class="n">Total reçu</th></tr>' +
      mois.map((m) => { const l = L.filter((r) => r.d.slice(0, 7) === m), parC = {}; l.forEach((r) => { parC[r.hop || "—"] = (parC[r.hop || "—"] || 0) + (num(r.m) || 0); });
        return "<tr><td>" + moisTxt(m) + "</td><td>" + Object.keys(parC).sort().map((c) => esc(c) + " " + dh(parC[c])).join(" · ") + '</td><td class="n"><b>' + dh(somme(l)) + "</b></td></tr>"; }).join("") + "</table></div>";
    h += '<div class="tableau" style="margin-top:12px"><table class="tcures bilan"><tr><th>Reçu le</th><th>Clinique</th><th>Mode</th><th>Référence</th><th>Banque</th><th>Période concernée</th><th class="n">Montant</th><th>Encaissé le</th><th>Note</th>' + (ed ? "<th></th>" : "") + "</tr>" +
      L.map((r) => "<tr><td>" + A.dfrA(r.d) + "</td><td>" + esc(r.hop || "—") + "</td><td>" + (MODES[r.mode] || "—") + "</td><td>" + esc(r.ref || "") + "</td><td>" + esc(r.banque || "") + "</td><td>" + esc(r.per || "") + '</td><td class="n"><b>' + dh(r.m) + "</b></td><td>" +
        (r.enc ? A.dfrA(r.enc) : '<span style="color:var(--orange);font-weight:bold">Pas encore</span>') + '</td><td class="mesures">' + esc(r.note || "") + "</td>" +
        (ed ? '<td style="white-space:nowrap"><button class="mini" title="Modifier" onclick="biRgFiche(\'' + esc(r.id) + '\')">✎</button> <button class="mini rouge" title="Supprimer" onclick="biRgSup(\'' + esc(r.id) + '\')">✕</button></td>' : "") + "</tr>").join("") +
      '<tr class="tot"><td colspan="6" class="n"><b>Total</b></td><td class="n"><b>' + dh(tot) + '</b></td><td colspan="' + (ed ? 3 : 2) + '"></td></tr></table></div>';
  } else h += '<p class="mesures">' + ((B.reglements || []).length ? "Aucun règlement reçu sur cette période." : "Aucun règlement enregistré.") + "</p>";
  if (ed) h += '<div class="actr" style="justify-content:flex-start;margin-top:10px"><button class="bt clair petit" onclick="biRgFiche()">+ Nouveau règlement reçu</button></div>';
  return h + "</section>";
}
// Écriture : la liste est relue juste avant (deux personnes peuvent saisir en même temps), puis réécrite
async function sauverRg(op) {
  const R = doc(db, "espaces", A.ESPACE, "finances", "reglements"), l = op(liste(await getDoc(R)));
  await setDoc(R, { data: JSON.stringify(l) }); B.reglements = l;
}
const redessinerRg = () => { const y = window.scrollY; dessiner(); window.scrollTo(0, y); };
window.biRgFiche = (id) => {
  if (!peutRg()) return;
  const r = id ? (B.reglements || []).find((z) => z.id === id) : null; if (id && !r) return;
  const esc = A.esc, v = (k, d) => esc(r ? r[k] || "" : d || ""), etabs = (D().etabsTous || D().etabs || []).filter((e) => e.actif !== false || (r && r.hop === e.code));
  const hop0 = r ? r.hop : F.hop !== "tous" && F.hop !== "—" ? F.hop : (D().etabs[0] || {}).code || "";
  A.fenetre("<h3>" + (r ? "Modifier le règlement reçu" : "Nouveau règlement reçu") + '</h3><p class="sous">Virement ou chèque reçu d\'une clinique. Pour la comptabilité : non compté dans le bilan.</p><div class="form">' +
    '<div><label for="rgD">Date de réception *</label><input id="rgD" type="date" value="' + v("d", D().t) + '"></div>' +
    '<div><label for="rgHop">Clinique *</label><select id="rgHop"><option value="">—</option>' + etabs.map((e) => '<option value="' + esc(e.code) + '"' + (e.code === hop0 ? " selected" : "") + ">" + esc(e.code + (e.nom ? " – " + e.nom : "")) + "</option>").join("") + "</select></div>" +
    '<div><label for="rgMode">Mode *</label><select id="rgMode">' + Object.keys(MODES).map((k) => '<option value="' + k + '"' + ((r ? r.mode : "vir") === k ? " selected" : "") + ">" + MODES[k] + "</option>").join("") + "</select></div>" +
    '<div><label for="rgM">Montant (DH) *</label><input id="rgM" inputmode="decimal" value="' + (r ? esc(String(r.m)) : "") + '"></div>' +
    '<div><label for="rgRef">N° du chèque ou référence du virement</label><input id="rgRef" value="' + v("ref") + '"></div>' +
    '<div><label for="rgBq">Banque</label><input id="rgBq" value="' + v("banque") + '"></div>' +
    '<div><label for="rgPer">Période ou actes concernés</label><input id="rgPer" value="' + v("per") + '" placeholder="ex. honoraires septembre 2026"></div>' +
    '<div><label for="rgEnc">Encaissé le (banque)</label><input id="rgEnc" type="date" value="' + v("enc") + '"></div>' +
    '<div class="large"><label for="rgNote">Note</label><textarea id="rgNote" rows="2">' + v("note") + "</textarea></div></div>" +
    '<div class="err" id="fErr"></div><div class="boutons"><button class="bt gris" onclick="fermerFenetre()">Annuler</button><button class="bt plein" id="rgOk">Enregistrer</button></div>');
  A.$("rgOk").onclick = async () => {
    const n = { d: A.val("rgD"), hop: A.val("rgHop"), mode: A.val("rgMode"), m: num(A.val("rgM")), ref: A.val("rgRef"), banque: A.val("rgBq"), per: A.val("rgPer"), enc: A.val("rgEnc"), note: A.val("rgNote") };
    if (!/^\d{4}-\d{2}-\d{2}$/.test(n.d)) { A.erreur("Indiquez la date de réception."); return; }
    if (!n.hop) { A.erreur("Choisissez la clinique."); return; }
    if (n.m == null || !(n.m > 0)) { A.erreur("Indiquez le montant reçu."); return; }
    if (n.enc && n.enc < n.d) { A.erreur("La date d'encaissement est avant la date de réception."); return; }
    const p = D().profil || {}, qui = { par: D().u.uid, parNom: [p.titre || "Dr", p.prenom, p.nom].filter(Boolean).join(" "), le: Date.now() };
    A.occupe(A.$("rgOk"), true);
    try {
      if (r) await sauverRg((l) => l.map((z) => (z.id === r.id ? Object.assign({}, z, n, qui) : z)));
      else await sauverRg((l) => l.concat([Object.assign({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6) }, n, qui)]));
      A.journal({ id: "", r: { nm: "" } }, (r ? "Règlement reçu modifié : " : "Règlement reçu ajouté : ") + MODES[n.mode] + " " + n.hop + " (" + n.m + " DH)");
      A.fermerFenetre(); A.toast(r ? "Règlement modifié." : "Règlement enregistré."); redessinerRg();
    } catch (e) { A.occupe(A.$("rgOk"), false); A.erreur(e && e.code === "permission-denied" ? "Vous n'avez pas le droit d'enregistrer un règlement." : "Enregistrement impossible : " + ((e && e.message) || e)); }
  };
};
window.biRgSup = async (id) => {
  const r = (B.reglements || []).find((z) => z.id === id); if (!r || !peutRg()) return;
  if (!confirm("Supprimer le règlement reçu le " + A.dfrA(r.d) + " de " + (r.hop || "—") + " (" + (MODES[r.mode] || "") + ", " + dh(r.m) + ") ?")) return;
  try { await sauverRg((l) => l.filter((z) => z.id !== id)); A.journal({ id: "", r: { nm: "" } }, "Règlement reçu supprimé : " + (r.hop || "") + " (" + r.m + " DH)"); redessinerRg(); }
  catch (e) { A.toast("Suppression impossible : " + ((e && e.message) || e)); }
};

// ───── Exports ─────
const filtresTxt = () => ["Période : du " + A.dfrA(DATA.pr[0] > "0001" ? DATA.pr[0] : "") + " au " + A.dfrA(DATA.pr[1] < "9999" ? DATA.pr[1] : ""), "Établissement : " + (F.hop === "tous" ? "tous" : F.hop), "Type d'acte : " + (typesActes().find((t) => t[0] === F.typ) || [0, F.typ])[1], "Paiement : " + ({ tous: "payés et à recevoir", paye: "payés", att: "à recevoir" }[F.pay]), "Référent : " + (F.cor === "tous" ? "tous" : F.cor || "sans référent")].concat(F.q ? ["Recherche : " + F.q] : []);
const nomMed = () => { if (estComptable()) return String((D().medTitulaire && D().medTitulaire.nom) || D().nomTitulaire || ""); const p = D().profil || {}; return [p.titre || "Dr", p.prenom, String(p.nom || "").replace(/^Dr\.?\s*/i, "").toLowerCase().replace(/(^|[\s-])\S/g, (c) => c.toUpperCase())].filter(Boolean).join(" "); };
const indic = () => { const T = DATA.tot; return [["CA NET médecin", T.caNet, T.nbActes], ["Chimio (séances)", T.chimio, T.nbChimio], ["Consultations", T.consultations, T.nbConsultations], ["Hospitalisations", T.hospit, T.nbHospit], ["Radiothérapie (terminées)", T.rt, T.nbRt], ["Autres versements", T.versements, T.nbVersements], ["Payé", T.paye, ""], ["À recevoir", T.aRecevoir, ""]]; };
window.biExport = async (fmt) => {
  if (!DATA) return;
  const nom = "Bilan_" + DATA.pr[0] + "_" + DATA.pr[1];
  if (fmt === "pdf") {
    const td = 'style="border:1px solid #ccc;padding:3px 5px"', tr = 'style="border:1px solid #ccc;padding:3px 5px;text-align:right"', esc = A.esc;
    const html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + nom + '</title><style>@page{size:A4 landscape;margin:12mm}body{font-family:Arial,sans-serif;font-size:9pt;color:#222}table{border-collapse:collapse;width:100%;margin-top:8px}th{background:#2B2D5C;color:#fff;padding:4px 5px;text-align:left}</style></head><body>' +
      '<div style="font-size:15pt;font-weight:bold;color:#2B2D5C">BILAN – ' + esc(nomMed()) + '</div><div style="color:#666">Édité le ' + A.dfrA(D().t) + "</div><div style=\"margin:6px 0\">" + filtresTxt().map(esc).join("<br>") + "</div>" +
      "<table><tr><th>Indicateur</th><th>Montant NET</th><th>Nombre</th></tr>" + indic().map((k) => "<tr><td " + td + ">" + k[0] + "</td><td " + tr + ">" + dh(k[1]) + "</td><td " + tr + ">" + k[2] + "</td></tr>").join("") + "</table>" +
      "<table><tr><th>Date</th><th>Patient</th><th>Hôpital</th><th>Acte / prestation</th><th>Statut</th><th>Brut</th><th>Taux</th><th>NET</th><th>Paiement</th></tr>" + DATA.all.map((o) => "<tr><td " + td + ">" + A.dfrA(o.d) + "</td><td " + td + ">" + esc(o.nm) + "</td><td " + td + ">" + esc(o.hop || "—") + "</td><td " + td + ">" + esc(o.lib) + "</td><td " + td + ">" + esc(o.st) + "</td><td " + tr + ">" + dh(o.brut) + "</td><td " + tr + ">" + tauxTxt(o) + "</td><td " + tr + "><b>" + dh(o.net) + "</b></td><td " + td + ">" + payeTxt(o) + "</td></tr>").join("") + "</table>" +
      (DATA.rg && DATA.rg.length ? '<div style="font-size:12pt;font-weight:bold;color:#2B2D5C;margin-top:14px">Règlements reçus des cliniques (non comptés dans le bilan)</div><table><tr><th>Reçu le</th><th>Clinique</th><th>Mode</th><th>Référence</th><th>Banque</th><th>Période concernée</th><th>Montant</th><th>Encaissé le</th><th>Note</th></tr>' +
        DATA.rg.map((r) => "<tr><td " + td + ">" + A.dfrA(r.d) + "</td><td " + td + ">" + esc(r.hop || "—") + "</td><td " + td + ">" + (MODES[r.mode] || "") + "</td><td " + td + ">" + esc(r.ref || "") + "</td><td " + td + ">" + esc(r.banque || "") + "</td><td " + td + ">" + esc(r.per || "") + "</td><td " + tr + ">" + dh(r.m) + "</td><td " + td + ">" + (r.enc ? A.dfrA(r.enc) : "pas encore") + "</td><td " + td + ">" + esc(r.note || "") + "</td></tr>").join("") +
        "<tr><td " + td + ' colspan="6"><b>Total reçu</b></td><td ' + tr + "><b>" + dh(somme(DATA.rg)) + "</b></td><td " + td + ' colspan="2"></td></tr></table>' : "") + "</body></html>";
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
    if (DATA.rg && DATA.rg.length) feuilles.push(["Règlements reçus", [["Reçu le", "Clinique", "Mode", "Référence", "Banque", "Période concernée", "Montant (DH)", "Encaissé le", "Note"]].concat(DATA.rg.map((r) => [A.dfrA(r.d), r.hop || "—", MODES[r.mode] || "", r.ref || "", r.banque || "", r.per || "", num(r.m) || 0, r.enc ? A.dfrA(r.enc) : "pas encore", r.note || ""])).concat([["", "", "", "", "", "TOTAL (non compté dans le bilan)", Math.round(somme(DATA.rg) * 100) / 100, "", ""]]), [11, 10, 10, 18, 14, 30, 14, 12, 30]]);
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
