// Onco360 – journal des consultations du dossier (étape 1B, 07/10/2026), onglet « Consultation ».
// Une fiche par consultation : espaces/{e}/consultations/{c} = { patientId, etablissementId, d (AAAA-MM-JJ), type (menu),
// titre (libre, ex. « J1C1 FOLFOX »), note,
// lignes: [{ id, t: "medic"|"exam"|"ordo"|"analyse"|"courrier", d, lib, par, med, html, format, taille }] (une ligne = une
// ordonnance : html = la feuille, med = médecin signataire), o (ordre de création), creePar, creeParNom, cree,
// majPar, maj }. Lecture : tous les membres (périmètre) ; écriture : droit « ecrireConsultations » ; suppression : médecin (toutes), secrétaire
// (celles qu'elle a créées).
// Les prescriptions (barre d'actions du dossier depuis le lot R-G, indépendante des consultations) s'ajoutent en ligne dans la consultation du
// jour : étapes 1C à 1E. Ici : créer, modifier, supprimer, plier / déplier.
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "../config.js";
import { CONSULT, consultEffective, libDe, formulairesDe, champDuType } from "../donnees/catalogue.js";
import { nomActuel } from "../moteur/typesconsult.js";

let A = null;
export function installer(api) { A = api; }
const D = () => A.D();
const CS = {}; // consultations chargées par patient : tableau ; null si la lecture a échoué ; absent = à charger
const OUV = {}; // consultation dépliée par patient (id), sinon la plus récente
const col = () => collection(db, "espaces", A.ESPACE, "consultations");
const tri = (a, b) => (b.d || "").localeCompare(a.d || "") || (b.o || 0) - (a.o || 0);
const trouver = (pid) => D().patients.find((p) => p.id === pid);
const peutEcrire = () => A.peut("ecrireConsultations");
// Suppression d'une consultation : le médecin toutes, les autres (secrétaire) seulement celles qu'ils ont créées (07/10/2026)
const peutSupprimer = (c) => peutEcrire() && (D().membre.role === "medecin" || (!!c && c.creePar === D().u.uid));
const nomConnecte = () => document.getElementById("nomMenu").textContent;

// Les 5 familles de prescriptions (barre en bas de l'onglet), libellé de leur ligne dans la consultation
export const FAMILLES = [
  { t: "medic", lib: "Médic.", ic: "pilule", titre: "Médicaments" },
  { t: "exam", lib: "Examens compl.", ic: "loupe", titre: "Examens complémentaires" },
  { t: "ordo", lib: "Ordo. type", ic: "presse", titre: "Ordonnances types" },
  { t: "analyse", lib: "Analyses", ic: "tube", titre: "Analyses" },
  { t: "courrier", lib: "Courriers", ic: "courrier", titre: "Courriers" },
  { t: "doc", lib: "Doc.", ic: "document", titre: "Documentation (fiches à remettre au patient)" },
];
// Nom affiché : type (menu) · titre (libre) ; les premières consultations n'avaient qu'un titre
// 3.13 : type affiché sous son nom actuel (renommé dans Paramètres › Types de consultation : l'ancien nom reste enregistré)
const TL = () => (A.typesC ? A.typesC() : []);
const nomCs = (c) => [c.type ? nomActuel(TL(), c.type) : "", c.titre].filter(Boolean).join(" · ") || "Consultation";
const libLigne = (t) => (FAMILLES.find((f) => f.t === t) || { lib: t }).lib;
// Formulaire de consultation réglable (16.7, 10/10/2026) : celui de la spécialité (le même pour tous les packs) + retouches du cabinet
// (D().reg.consultation) : ordre, champs présents, nom affiché, liste des types, champs ajoutés (valeurs dans extra { id: valeur }).
// Sans réglage : la fenêtre d'aujourd'hui (type, date, titre, note).
const FORM = () => (D().reg && D().reg.consultation) || consultEffective(null, null);
const lib = (k) => libDe(CONSULT, k, FORM());
const champsAjoutes = () => FORM().ajouts;
const texteDe = (a, v) => (v == null || v === "" ? "" : a.type === "date" ? A.dfrA(v) : a.type === "ouinon" ? (v === "oui" ? "Oui" : "Non") : String(v) + (a.type === "nombre" && a.unite ? " " + a.unite : ""));

// 3.4 (12/10/2026, décision de Dr Bentahila) : note signée mais toujours modifiable, sans anciennes versions : « Signée le … par … ·
// modifiée le … et le … » ; modifs [{ le, par, parNom }] : une entrée par jour et par personne, sauf l'auteur le jour même (20 au plus)
const jourDe = (ms) => { const d = new Date(ms); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); };
function modifsApres(c) {
  const l = (c.modifs || []).slice(), maint = Date.now(), j = jourDe(maint), u = D().u.uid, der = l[l.length - 1];
  if (c.creePar === u && c.o && jourDe(c.o) === j) return l; // l'auteur, le jour même : pas une modification
  if (der && der.par === u && jourDe(Date.parse(der.le)) === j) return l;
  return l.concat([{ le: new Date(maint).toISOString(), par: u, parNom: nomConnecte() }]).slice(-20);
}
function htmlSignature(c) {
  const esc = A.esc, m = (c.modifs || []).map((z) => A.dfrA(jourDe(Date.parse(z.le))) + (z.parNom && z.parNom !== c.creeParNom ? " (" + z.parNom + ")" : "")), dj = [...new Set(m)];
  const sig = c.creeParNom ? "Signée le " + A.dfrA(c.o ? jourDe(c.o) : c.d) + " par " + c.creeParNom : "";
  return sig || dj.length ? '<p class="mesures cs-sig">' + esc([sig, dj.length ? "modifiée le " + dj.join(", le ").replace(/, le ([^,]*)$/, " et le $1") : ""].filter(Boolean).join(" · ")) + "</p>" : "";
}
// Lecture des consultations d'un patient (filtre d'établissement pour un membre limité à certains établissements)
function charger(x) {
  const f = [where("patientId", "==", x.id)];
  if (!D().membre.tousEtablissements) f.push(where("etablissementId", "==", x.doc.etablissementId || ""));
  return getDocs(query(col(), ...f))
    .then((s) => { CS[x.id] = s.docs.map((d) => Object.assign({ id: d.id }, d.data())).sort(tri); })
    .catch((e) => { console.warn("consultations", e); CS[x.id] = null; });
}
// À l'ouverture du dossier : relire (une consultation a pu être ajoutée depuis un autre poste)
export function oublierConsultations(pid) { delete CS[pid]; delete OUV[pid]; delete OUVS[pid]; delete NSEUL[pid]; delete PLUS[pid]; }
export const nbConsultations = (x) => (CS[x.id] || []).length;
export const datesConsultations = (pid) => (CS[pid] || []).map((c) => c.d).filter(Boolean); // dernières nouvelles (3.3)

// ───── Onglet « Consultation » ─────
// R-G c (audit n° 5, 19/10/2026) : « + Nouvelle consultation » en tête ; consultation fermée = une ligne serrée (date · type · début de la note ·
// nombre d'ordonnances · initiales) ; ouverte = la note en pleine largeur, l'auteur une seule fois sur la ligne de titre ; à l'ouverture du
// dossier, seule la dernière est dépliée ; « Tout déplier », « Notes seulement », Imprimer ; sur téléphone et tablette : les 10 dernières, puis
// « Afficher les plus anciennes ». La barre des prescriptions est dans la barre d'actions du dossier (boutonsPrescription).
const OUVS = {}, NSEUL = {}, PLUS = {}; // consultations dépliées (pid → Set), « Notes seulement », plus anciennes affichées (téléphone)
const initiales = (n) => String(n || "").replace(/^(Dr|Pr|Mme|M)\.?\s+/i, "").split(/[\s-]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
const typeCourt = (c) => { const t = c.type ? nomActuel(TL(), c.type) : ""; return t.replace(/^Consultation (d'|de |en cours de )?/i, "").replace(/^\w/, (m) => m.toUpperCase()) || c.titre || "Consultation"; };
function ouvertes(pid) {
  const L = CS[pid] || [];
  if (!OUVS[pid]) { if (!L.length) return new Set(); OUVS[pid] = new Set([L[0].id]); } // la plus récente (liste triée)
  if (OUV[pid] && OUV[pid] !== "—") { OUVS[pid].add(OUV[pid]); delete OUV[pid]; } // celle qu'on vient d'ajouter ou de compléter
  return OUVS[pid];
}
export function htmlConsultations(x) {
  const esc = A.esc, q = "'" + x.id + "'";
  if (!(x.id in CS)) { CS[x.id] = undefined; charger(x).then(() => { if (D().page === "dossier/" + encodeURIComponent(x.id)) A.pageDossier(x.id); }); }
  const L = CS[x.id], ns = !!NSEUL[x.id];
  let h = '<div class="entete cs-outils">' + (peutEcrire() ? '<button class="bt clair petit" onclick="csNouvelle(' + q + ')">' + A.ic("plus") + "Nouvelle consultation</button>" : "") +
    (L && L.length ? '<span class="cs-esp"></span><label class="chk cs-ns"><input type="checkbox" onchange="csNotesSeules(' + q + ')"' + (ns ? " checked" : "") + ">Notes seulement</label>" +
      (ns ? "" : '<button type="button" class="mini" onclick="csTout(' + q + ')">' + (L.every((c) => ouvertes(x.id).has(c.id)) ? "Tout replier" : "Tout déplier") + "</button>") +
      '<button type="button" class="mini" onclick="csImprimer(' + q + ')">' + A.ic("imprimer") + "Imprimer</button>" : "") + "</div>";
  if (L === undefined) return h + '<p class="sous" style="margin:2px 0 0">Chargement des consultations…</p>';
  if (L === null) return h + '<p class="sous" style="margin:2px 0 0;color:var(--rouge)">Les consultations n\'ont pas pu être lues. Rechargez la page.</p>';
  if (!L.length) return h + '<p class="vide-c">Aucune consultation.' + (peutEcrire() ? " « Nouvelle consultation » pour en ajouter une." : "") + "</p>";
  setTimeout(apresAffichage, 0);
  const ouv = ouvertes(x.id);
  h += '<div class="cs-liste' + (PLUS[x.id] ? " tous" : "") + (ns ? " ns" : "") + '" id="csListe" data-defile="cs">';
  L.forEach((c) => {
    const on = ns || ouv.has(c.id), qc = q + ",'" + c.id + "'", nl = (c.lignes || []).length;
    // 19/10/2026 (demande de Dr Bentahila : plus compact) : consultation ouverte = auteur, « signée le … », Modifier et Supprimer sur la ligne de titre
    const sig = on && !ns ? '<span class="cs-act"><span class="cs-sg" title="' + esc(htmlSignature(c).replace(/<[^>]+>/g, "")) + '">' + (c.creeParNom ? "signée le " + A.dfrA(c.o ? jourDe(c.o) : c.d) : "") + ((c.modifs || []).length ? " · modifiée" : "") + "</span>" +
      (peutEcrire() ? '<button class="mini" onclick="csModifier(' + qc + ')">Modifier</button>' + (peutSupprimer(c) ? '<button class="mini r" onclick="csSupprimer(' + qc + ')">Supprimer</button>' : "") : "") + "</span>" : "";
    h += '<div class="cs' + (on ? " on" : "") + '"><div class="cs-h"><button class="cs-t" aria-expanded="' + on + '" onclick="csTog(' + qc + ')" title="' + esc(A.dfrA(c.d) + " · " + nomCs(c) + (c.creeParNom ? " · " + c.creeParNom : "")) + '"><span class="fl">' + (on ? "▾" : "▸") + '</span><span class="dt">' + A.dfrA(c.d) + '</span><span class="ti">' + esc(typeCourt(c)) + '</span><span class="tt">' + esc(c.titre && typeCourt(c) !== c.titre ? c.titre : "") + "</span>" +
      // 19/10/2026 (demande de Dr Bentahila) : pliée ou dépliée, la même ligne : date · type · titre · ordonnances · initiales (plus le début de la note)
      (nl ? '<span class="no" title="' + nl + " ordonnance" + (nl > 1 ? "s" : "") + '">' + A.ic("document") + nl + "</span>" : "") + '<span class="in" title="' + esc(c.creeParNom || "") + '">' + esc(initiales(c.creeParNom)) + "</span></button>" + sig + "</div>";
    if (on && ns) h += '<div class="cs-c">' + (c.note ? '<div class="cs-nl">' + esc(c.note) + "</div>" : '<span class="mesures">Pas de note.</span>') + "</div>";
    else if (on) {
      // Note : écrite directement dans la consultation ouverte, enregistrée toute seule (11/10/2026) ; « Modifier » pour le reste
      const noteH = peutEcrire() ? '<textarea class="cs-note" id="csN-' + c.id + '" rows="1" placeholder="Écrire la note de consultation…" aria-label="' + esc(lib("note")) + '" oninput="csNote(' + qc + ')" onblur="csNoteFin(' + qc + ')">' + esc(c.note || "") + '</textarea><span class="mesures cs-etat" id="csE-' + c.id + '"></span>'
        : c.note ? '<div class="cs-nl">' + esc(c.note) + "</div>" : "";
      // nom de la note (« Conclusion »…) : au-dessus quand le formulaire a d'autres champs ou que la note a été renommée
      const ex = htmlExtra(c), libN = (ex || (FORM().libs || {}).note) && (FORM().champs.note !== false || c.note) ? '<div class="cs-xs">' + esc(lib("note")) + "</div>" : "";
      h += '<div class="cs-c">' + (FORM().champs.note !== false || c.note ? libN + noteH : "") + ex +
        // ordonnances sur une ligne courte : « Médic. : ondansétron 8 mg · Analyses : NFS… » (auteur seulement s'il n'est pas celui de la consultation)
        ((c.lignes || []).length ? '<div class="cs-o">' + [...new Set(c.lignes.map((l) => l.t))].map((t) => '<span class="cs-ol2"><span class="ck">' + esc(libLigne(t)) + " :</span> " + c.lignes.filter((l) => l.t === t).map((l) => '<span class="cs-ol">' + (l.html ? '<button class="lien-l" title="Voir, modifier ou réimprimer l\'ordonnance" onclick="ordVoir(' + qc + ",'" + l.id + '\')">' + esc(String(l.lib || "Ordonnance").replace(/^(Ordonnance|Analyses|Examens|Courrier)\s*:\s*/i, "")) + "</button>" : l.t === "doc" && l.docId ? '<button class="lien-l" title="Rouvrir le document remis" onclick="docOuvrirLigne(\'' + esc(l.docId) + '\')">' + esc(l.lib || "") + "</button>" : esc(l.lib || "")) + (l.par && l.par !== c.creeParNom ? ' <span class="au">(' + esc(l.par) + ")</span>" : "") + "</span>").join('<span class="sep"> · </span>') + "</span>").join("") + "</div>" : "") + "</div>";
    }
    h += "</div>";
  });
  return h + "</div>" + (L.length > 10 && !PLUS[x.id] ? '<button type="button" class="mini cs-plus" onclick="csPlusAnciennes(' + q + ')">Afficher les plus anciennes (' + (L.length - 10) + ")</button>" : "");
}
// Champs ajoutés d'une consultation (lecture) : « Libellé : valeur », sans colonne de libellés ; un titre de section n'apparaît que s'il est
// suivi d'une valeur
function htmlExtra(c) {
  const ex = c.extra || {}, R = FORM(), esc = A.esc; let h = "", sec = null;
  R.ordre.forEach((k) => { const a = R.ajouts.find((z) => z.id === k); if (!a || R.champs[k] === false && ex[k] == null) return;
    if (a.type === "section") { sec = a; return; }
    const t = texteDe(a, ex[k]); if (!t) return;
    if (sec) { h += '<div class="cs-xs">' + esc(sec.lib) + "</div>"; sec = null; }
    h += '<div class="cs-x"><span class="ck">' + esc(a.lib) + " :</span> " + esc(t).replace(/\n/g, "<br>") + "</div>"; });
  return h ? '<div class="cs-ex">' + h + "</div>" : "";
}
// Bibliothèque de chaque bouton (réglage du cabinet, 10/10/2026 : une bibliothèque retirée cache son bouton)
const BIB_DE = { medic: "medicaments", ordo: "ordostypes", analyse: "analyses", exam: "examens", courrier: "courriers", doc: "documentation" };
// Boutons de prescription de la barre d'actions du dossier (R-G a) : Médic., Ordo. type, Analyses, Examens compl., Courriers, Doc. (avec,
// dessous, le nombre d'ordonnances déjà faites pour ce patient : fonction facultative « prescriptions.compteur »), puis « + RCP ». Une ordonnance
// faite ici s'ajoute en ligne dans la consultation du jour ; ▾ = antécédents des prescriptions.
export function boutonsPrescription(x) {
  if (!peutEcrire()) return "";
  const q = "'" + x.id + "'", n = {};
  (CS[x.id] || []).forEach((c) => (c.lignes || []).forEach((l) => { n[l.t] = (n[l.t] || 0) + 1; }));
  return ["medic", "ordo", "analyse", "exam", "courrier", "doc"].map((t) => FAMILLES.find((f) => f.t === t)).map((f) => '<div class="pr" data-mod="prescriptions" data-fn="prescriptions.' + f.t + '" data-bib="' + (BIB_DE[f.t] || "") + '"><button type="button" onclick="csPrescrire(' + q + ",'" + f.t + '\')" title="' + f.titre + ' : nouvelle prescription"><svg class="pi"><use href="#i-' + f.ic + '"/></svg><span class="lb">' + (f.t === "exam" ? '<span class="lg">Examens compl.</span><span class="sm">Examens</span>' : f.lib) + "</span>" + (n[f.t] ? '<small class="br-n" data-fn="prescriptions.compteur" title="' + n[f.t] + " déjà faite" + (n[f.t] > 1 ? "s" : "") + ' pour ce patient">' + n[f.t] + "</small>" : "") + '</button><button type="button" class="fl" data-fn="prescriptions.antecedents" onclick="csAntecedents(' + q + ",'" + f.t + '\')" title="' + f.titre + ' : antécédents des prescriptions" aria-label="' + f.titre + ' : antécédents des prescriptions">▾</button></div>').join("") +
    // « + RCP » (09/10/2026, rcp.js) : inscription à la prochaine RCP ; flèche = inscriptions du patient
    '<div class="pr" data-mod="rcp"><button type="button" onclick="rcpInscrire(' + q + ')" title="Inscrire le patient à la prochaine RCP"><svg class="pi"><use href="#i-rcp"/></svg><span class="lb">+ RCP</span></button><button type="button" class="fl" onclick="rcpHistorique(' + q + ')" title="RCP du patient" aria-label="RCP du patient">▾</button></div>';
}
// Note écrite directement : enregistrée 1,5 s après la dernière frappe, et en quittant la zone ; le texte est gardé en mémoire à
// chaque frappe (un dossier redessiné entre-temps le réaffiche, curseur remis à sa place)
const NOTE = { t: null, cid: null, pid: null, pos: null };
// R-G c (demande du 19/10/2026) : la note dépliée s'affiche en entier, même très longue (pas de défilement dans la note)
const hauteurNote = (z) => { z.style.height = "auto"; z.style.height = Math.max(z.scrollHeight + 2, 24) + "px"; }; // la note s'arrête à sa dernière ligne
async function sauverNote(pid, cid) {
  const c = (CS[pid] || []).find((z) => z.id === cid), z = document.getElementById("csN-" + cid), e = document.getElementById("csE-" + cid); if (!c) return;
  const v = z ? z.value : c.note || ""; if (v === (c.noteEnr != null ? c.noteEnr : c.note || "") && c.noteEnr != null) return;
  try {
    const modifs = modifsApres(c);
    await updateDoc(doc(db, "espaces", A.ESPACE, "consultations", cid), { note: v, modifs, majPar: D().u.uid, majParNom: nomConnecte(), maj: serverTimestamp() });
    c.note = v; c.noteEnr = v; c.modifs = modifs; const e2 = document.getElementById("csE-" + cid); if (e2) e2.textContent = "Enregistré";
  } catch (er) { if (e) { e.textContent = "Non enregistré : " + (er && er.code === "permission-denied" ? "droit refusé" : (er && er.message) || er); e.style.color = "var(--rouge)"; } }
}
window.csNote = (pid, cid) => {
  const z = document.getElementById("csN-" + cid), c = (CS[pid] || []).find((y) => y.id === cid); if (!z || !c) return;
  if (c.noteEnr == null) c.noteEnr = c.note || ""; c.note = z.value; hauteurNote(z);
  Object.assign(NOTE, { cid, pid, pos: z.selectionStart }); const e = document.getElementById("csE-" + cid); if (e) { e.textContent = "…"; e.style.color = ""; }
  clearTimeout(NOTE.t); NOTE.t = setTimeout(() => sauverNote(pid, cid), 1500);
};
window.csNoteFin = (pid, cid) => { clearTimeout(NOTE.t); NOTE.cid = null; sauverNote(pid, cid); };
// Après chaque affichage de l'onglet : hauteur des notes, et curseur remis dans la note en cours d'écriture
function apresAffichage() {
  document.querySelectorAll("textarea.cs-note").forEach(hauteurNote);
  if (NOTE.cid) { const z = document.getElementById("csN-" + NOTE.cid); if (z && document.activeElement !== z) { z.focus({ preventScroll: true }); try { z.setSelectionRange(NOTE.pos, NOTE.pos); } catch (e) { /* zone changée */ } } }
}
// Plier / déplier une consultation ; tout déplier / replier ; notes seulement ; plus anciennes (téléphone) : le dossier garde ses positions
window.csTog = (pid, cid) => { if (NSEUL[pid]) return; const s = ouvertes(pid); if (s.has(cid)) s.delete(cid); else s.add(cid); A.pageDossier(pid); };
window.csTout = (pid) => { const L = CS[pid] || [], s = ouvertes(pid), tout = L.every((c) => s.has(c.id)); OUVS[pid] = new Set(tout ? [] : L.map((c) => c.id)); A.pageDossier(pid); };
window.csNotesSeules = (pid) => { NSEUL[pid] = !NSEUL[pid]; A.pageDossier(pid); };
window.csPlusAnciennes = (pid) => { PLUS[pid] = true; A.pageDossier(pid); };
// Imprimer le journal des consultations (date, type, auteur, note, ordonnances)
window.csImprimer = (pid) => {
  const x = trouver(pid), L = CS[pid] || [], esc = A.esc; if (!x) return;
  let w = null; try { w = window.open("", "_blank"); } catch (er) { w = null; } if (!w || !w.document) { A.toast("Autorisez l'ouverture des fenêtres pour imprimer."); return; }
  const corps = L.map((c) => "<h2>" + esc(A.dfrA(c.d) + " · " + nomCs(c)) + (c.creeParNom ? ' <span class="au">' + esc(c.creeParNom) + "</span>" : "") + "</h2>" + (c.note ? '<p class="n">' + esc(c.note) + "</p>" : "") +
    ((c.lignes || []).length ? "<ul>" + c.lignes.map((l) => "<li>" + esc(libLigne(l.t) + " : " + (l.lib || "")) + "</li>").join("") + "</ul>" : "")).join("");
  w.document.open(); w.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Consultations – ' + esc(x.r.nm) + '</title><style>@page{size:A4;margin:14mm}body{font-family:Arial,sans-serif;font-size:11.5px;color:#1E2A44}h1{font-size:17px;margin:0 0 10px}h2{font-size:13px;margin:14px 0 4px;border-bottom:1px solid #CCD3E0;padding-bottom:3px}.au{font-weight:normal;color:#64708A;font-size:11px}.n{white-space:pre-wrap;margin:4px 0}ul{margin:4px 0 0 18px;padding:0}</style></head><body><h1>Consultations – ' + esc(x.r.nm) + "</h1>" + (corps || "<p>Aucune consultation.</p>") + "</body></html>");
  w.document.close(); setTimeout(() => { w.focus(); w.print(); }, 400);
};

// ───── Nouvelle consultation / modifier : titre, date (du jour par défaut), note ─────
// pre { type, titre, d, note } : nouvelle consultation déjà remplie ; apres(id, champs) : appelé une fois enregistrée
// (décision de RCP, rcp.js 09/10/2026)
function formulaire(x, c, pre, apres) {
  pre = c ? null : pre || null;
  const esc = A.esc, R = FORM(), FO = formulairesDe(R), v0 = (k) => (c ? c[k] || "" : (pre && pre[k]) || ""), ex = (c && c.extra) || (pre && pre.extra) || {};
  // Un champ existant retiré reste affiché s'il a déjà une valeur (consultation ancienne, décision de RCP)
  const visible = (k) => R.champs[k] !== false || (k !== "d" && !!v0(k));
  // 3.4 : la secrétaire écrit dans le même journal (« Note du secrétariat », proposé d'office pour elle)
  const sec = D().membre && D().membre.role === "assistante", NS = "Note du secrétariat";
  // 3.13 : types du référentiel (tous : pris en rendez-vous ou non) ; sans référentiel : liste du formulaire d'avant
  const base = TL().length ? TL().map((t) => t.nom) : R.choixs.type || [], vt = v0("type") ? nomActuel(TL(), v0("type")) : "";
  const types = base.concat([vt, sec ? NS : ""].filter((t) => t && base.indexOf(t) < 0));
  const suivi = (TL().find((t) => t.k === "suivi") || {}).nom, type0 = vt || (sec && !c ? NS : !c && suivi ? suivi : ""); // nouvelle consultation : suivi, comme avant
  const champ = (k) => {
    const a = R.ajouts.find((z) => z.id === k);
    if (!a) {
      if (!visible(k)) return "";
      if (k === "type") return '<div><label for="csType">' + esc(lib("type")) + '</label><select id="csType">' + types.map((t) => "<option" + (type0 === t ? " selected" : "") + ">" + esc(t) + "</option>").join("") + "</select></div>";
      if (k === "d") return '<div><label for="csDate">' + esc(lib("d")) + '</label><input id="csDate" type="date" value="' + esc(c ? c.d : (pre && pre.d) || D().t) + '"></div>';
      if (k === "titre") return '<div class="large"><label for="csTitre">' + esc(lib("titre")) + '</label><input id="csTitre" value="' + esc(v0("titre")) + '" placeholder="Ex. J1C1 FOLFOX"></div>';
      if (k === "note") return '<div class="large"><label for="csNote">' + esc(lib("note")) + '</label><textarea id="csNote" rows="' + (R.ajouts.length ? 5 : 9) + '" class="cs-note" placeholder="Examen, poids, PS, conduite à tenir…">' + esc(v0("note")) + "</textarea></div>";
      return "";
    }
    if (R.champs[k] === false && ex[k] == null) return "";
    // 3.12 : champ du formulaire du type de consultation (Paramètres › Dossier patient › Formulaire de consultation), recalculé quand le type
    // change ; une valeur déjà saisie reste visible
    const v = ex[k] == null ? "" : ex[k], id = "cx_" + a.id, cache = !champDuType(R, a, type0 || (types[0] || ""), FO) && ex[k] == null, csA = ' data-cs="' + a.id + '"' + (cache ? ' style="display:none"' : ""), lab = '<label for="' + id + '">' + esc(a.lib) + (a.type === "nombre" && a.unite ? " (" + esc(a.unite) + ")" : "") + "</label>";
    if (a.type === "section") return '<div class="large cs-sec"' + csA + ">" + esc(a.lib) + "</div>";
    if (a.type === "textelong") return '<div class="large"' + csA + ">" + lab + '<textarea id="' + id + '" rows="3">' + esc(v) + "</textarea></div>";
    if (a.type === "choix") return "<div" + csA + ">" + lab + '<select id="' + id + '"><option value=""></option>' + (a.choix || []).concat(v && (a.choix || []).indexOf(v) < 0 ? [v] : []).map((t) => "<option" + (t === v ? " selected" : "") + ">" + esc(t) + "</option>").join("") + "</select></div>";
    if (a.type === "ouinon") return "<div" + csA + ">" + lab + '<select id="' + id + '"><option value=""></option><option value="oui"' + (v === "oui" ? " selected" : "") + '>Oui</option><option value="non"' + (v === "non" ? " selected" : "") + ">Non</option></select></div>";
    return "<div" + (a.type === "texte" ? ' class="large"' : "") + csA + ">" + lab + '<input id="' + id + '"' + (a.type === "date" ? ' type="date"' : a.type === "nombre" ? ' inputmode="decimal"' : "") + ' value="' + esc(v) + '"></div>';
  };
  A.fenetre("<h3>" + (c ? "Modifier la consultation" : "Nouvelle consultation") + "</h3>" +
    '<div class="form">' + R.ordre.map(champ).join("") + "</div>" +
    '<div class="err" id="fErr"></div><div class="boutons"><button class="bt gris" onclick="fermerFenetre()">Annuler</button><button class="bt plein" id="csOk">Enregistrer</button></div>');
  const selT = document.getElementById("csType");
  if (selT) selT.onchange = () => document.querySelectorAll("#fenetre [data-cs]").forEach((z) => { const a = R.ajouts.find((y) => y.id === z.dataset.cs), e = document.getElementById("cx_" + z.dataset.cs); z.style.display = a && (champDuType(R, a, selT.value, FO) || (e && e.value && ex[a.id] != null)) ? "" : "none"; });
  if (pre && pre.note) setTimeout(() => { const n = document.getElementById("csNote"); if (n) { n.focus(); n.setSelectionRange(n.value.length, n.value.length); } }, 80); // décision de RCP : curseur après « Décision : »
  document.getElementById("csOk").onclick = async () => {
    const el = (i) => document.getElementById(i), type = el("csType") ? A.val("csType") : type0, titre = el("csTitre") ? A.val("csTitre") : v0("titre"), d = A.val("csDate");
    const note = el("csNote") ? String(el("csNote").value || "").replace(/\s+$/, "") : v0("note");
    // Champs ajoutés : valeurs saisies (vides retirées) ; celles des champs absents du formulaire sont gardées
    const extra = Object.assign({}, ex); R.ajouts.forEach((a) => { const e = el("cx_" + a.id); if (!e) return; if (!champDuType(R, a, type, FO) && ex[a.id] == null) return; /* formulaire d'un autre type : valeurs gardées */ const v = String(e.value || "").replace(/\s+$/, "").trim(); if (v === "") delete extra[a.id]; else extra[a.id] = a.type === "nombre" ? v.replace(",", ".") : v; });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) { A.erreur("Choisissez la date de la consultation."); return; }
    A.occupe(document.getElementById("csOk"), true);
    try {
      const base = Object.assign({ type, titre, d, note, majPar: D().u.uid, majParNom: nomConnecte(), maj: serverTimestamp() }, Object.keys(extra).length || (c && c.extra) ? { extra } : {});
      if (c) {
        base.modifs = modifsApres(c); // « modifiée le … » (3.4)
        await updateDoc(doc(db, "espaces", A.ESPACE, "consultations", c.id), base);
        Object.assign(c, base); CS[x.id].sort(tri); A.journal(x, "Consultation modifiée : " + nomCs(base));
        if (apres) await apres(c.id, base);
      } else {
        const n = Object.assign({ patientId: x.id, etablissementId: x.doc.etablissementId || "", lignes: [], o: Date.now(), creePar: D().u.uid, creeParNom: nomConnecte(), cree: serverTimestamp() }, base);
        const r = await addDoc(col(), n);
        CS[x.id] = (CS[x.id] || []).concat([Object.assign({ id: r.id }, n)]).sort(tri); OUV[x.id] = r.id; Object.assign(NOTE, { cid: r.id, pid: x.id, pos: (n.note || "").length }); A.journal(x, "Consultation ajoutée : " + nomCs(base)); // curseur dans la note
        if (apres) await apres(r.id, base);
      }
      A.fermerFenetre(); A.toast("Consultation enregistrée."); A.pageDossier(x.id);
    } catch (e) {
      A.occupe(document.getElementById("csOk"), false);
      A.erreur(e && e.code === "permission-denied" ? "Vous n'avez pas le droit d'écrire les consultations." : "Enregistrement impossible : " + ((e && e.message) || e));
    }
  };
}
window.csNouvelle = (pid) => { const x = trouver(pid); if (x && peutEcrire()) formulaire(x, null); };
export const nouvelleConsultation = (pid, pre, apres) => { const x = trouver(pid); if (x && peutEcrire()) formulaire(x, null, pre, apres); };
export const modifierConsultation = (pid, cid, apres) => { const x = trouver(pid), c = (CS[pid] || []).find((z) => z.id === cid); if (x && c && peutEcrire()) { OUV[pid] = cid; formulaire(x, c, null, apres); } };
window.csModifier = (pid, cid) => { const x = trouver(pid), c = (CS[pid] || []).find((z) => z.id === cid); if (x && c && peutEcrire()) formulaire(x, c); };
window.csSupprimer = async (pid, cid) => {
  const x = trouver(pid), c = (CS[pid] || []).find((z) => z.id === cid); if (!x || !c || !peutSupprimer(c)) return;
  if (!confirm("Supprimer la consultation du " + A.dfrA(c.d) + " (« " + nomCs(c) + " ») ?\n\nSa note et ses prescriptions seront effacées.")) return;
  try { await deleteDoc(doc(db, "espaces", A.ESPACE, "consultations", cid)); CS[pid] = CS[pid].filter((z) => z.id !== cid); A.journal(x, "Consultation supprimée : " + nomCs(c) + " du " + A.dfrA(c.d)); A.toast("Consultation supprimée."); A.pageDossier(pid); }
  catch (e) { A.toast(e && e.code === "permission-denied" ? "Vous n'avez pas le droit de supprimer cette consultation." : "Suppression impossible."); }
};

// ───── Barre des prescriptions : construite aux étapes 1C (médicaments), 1D (antécédents), 1E (autres familles) ─────
window.csPrescrire = (pid, t) => {
  if (t === "medic") { window.ordMedicaments(pid); return; }
  if (t === "ordo") { window.ordTypes(pid); return; }
  if (t === "analyse") { window.ordAnalyses(pid); return; }
  if (t === "exam") { window.ordExamens(pid); return; }
  if (t === "courrier") { window.ordCourriers(pid); return; }
  if (t === "doc") { window.ordDocumentation(pid); return; }
  const f = FAMILLES.find((z) => z.t === t); A.toast((f ? f.titre : "Prescriptions") + " : bientôt disponible (en cours de construction).");
};
// Consultations du patient lues (pour les antécédents des prescriptions)
export async function assurerConsultations(x) { if (CS[x.id] === undefined) await charger(x); return CS[x.id]; }
export const consultationsDe = (pid) => CS[pid] || []; // compte rendu de fin de radiothérapie (3.6) : bilan de la dernière consultation
// Antécédents d'une famille (médicaments, examens…) : toutes les ordonnances du patient, la plus récente d'abord
export function prescriptionsDe(pid, t) {
  const r = [];
  (CS[pid] || []).forEach((c) => (c.lignes || []).forEach((l) => { if (l.t === t && l.html) r.push({ cid: c.id, l }); }));
  return r.sort((a, b) => (b.l.d || "").localeCompare(a.l.d || "") || String(b.l.id).localeCompare(String(a.l.id)));
}
// Toutes les lignes d'une famille (même sans feuille : documentation remise, « Doc. »)
export function lignesType(pid, t) {
  const r = []; (CS[pid] || []).forEach((c) => (c.lignes || []).forEach((l) => { if (l.t === t) r.push({ cid: c.id, l }); })); return r;
}
// Ordonnance supprimée : retirée de sa consultation ; la consultation créée automatiquement pour elle seule disparaît aussi
export async function supprimerPrescription(x, lid) {
  const c = (CS[x.id] || []).find((z) => (z.lignes || []).some((l) => l.id === lid)); if (!c) return;
  const ref = doc(db, "espaces", A.ESPACE, "consultations", c.id), s = await getDoc(ref);
  const avant = (s.exists() && s.data().lignes) || c.lignes || [], l = avant.find((z) => z.id === lid), lignes = avant.filter((z) => z.id !== lid);
  if (!lignes.length && c.titre === "Ordonnance" && !c.type && !c.note) {
    // vidée d'abord : la secrétaire peut supprimer une consultation « Ordonnance » vide (règles), le médecin toute consultation
    await updateDoc(ref, { lignes: [], majPar: D().u.uid, majParNom: nomConnecte(), maj: serverTimestamp() });
    await deleteDoc(ref); CS[x.id] = CS[x.id].filter((z) => z.id !== c.id);
  }
  else { const maj = { lignes, majPar: D().u.uid, majParNom: nomConnecte(), maj: serverTimestamp() }; await updateDoc(ref, maj); Object.assign(c, maj); }
  A.journal(x, "Ordonnance supprimée (" + libLigne((l || {}).t) + ") : " + ((l || {}).lib || ""));
}
// Une ordonnance (ligne) retrouvée par sa consultation
export function trouverLigne(pid, cid, lid) { const c = (CS[pid] || []).find((z) => z.id === cid); return c && (c.lignes || []).find((l) => l.id === lid); }
// Ordonnance validée : nouvelle → ligne ajoutée à la consultation du jour (créée si elle n'existe pas, avec seulement
// l'ordonnance) ; déjà enregistrée (même id) → ligne mise à jour là où elle est. La consultation est relue juste avant
// (un autre poste a pu y ajouter une ligne).
export async function enregistrerPrescription(x, ligne) {
  if (CS[x.id] === undefined || !(x.id in CS)) await charger(x);
  if (CS[x.id] === null) throw new Error("les consultations n'ont pas pu être lues");
  const maj = { majPar: D().u.uid, majParNom: nomConnecte(), maj: serverTimestamp() };
  let c = ligne.id ? CS[x.id].find((z) => (z.lignes || []).some((l) => l.id === ligne.id)) : null;
  if (!c) {
    ligne = Object.assign({ id: "l" + Date.now().toString(36) }, ligne);
    c = CS[x.id].filter((z) => z.d === D().t).sort((a, b) => (b.o || 0) - (a.o || 0))[0];
    if (!c) {
      const n = Object.assign({ patientId: x.id, etablissementId: x.doc.etablissementId || "", type: "", titre: "Ordonnance", d: D().t, note: "", lignes: [ligne], o: Date.now(), creePar: D().u.uid, creeParNom: nomConnecte(), cree: serverTimestamp() }, maj);
      const r = await addDoc(col(), n);
      CS[x.id] = CS[x.id].concat([Object.assign({ id: r.id }, n)]).sort(tri); OUV[x.id] = r.id;
      A.journal(x, "Ordonnance (" + libLigne(ligne.t) + ") : " + ligne.lib); return;
    }
  }
  const ref = doc(db, "espaces", A.ESPACE, "consultations", c.id), s = await getDoc(ref);
  const lignes = ((s.exists() && s.data().lignes) || c.lignes || []).slice(), i = lignes.findIndex((l) => l.id === ligne.id);
  if (i >= 0) lignes[i] = Object.assign({}, lignes[i], ligne); else lignes.push(ligne);
  await updateDoc(ref, Object.assign({ lignes }, maj));
  Object.assign(c, s.exists() ? s.data() : {}, { lignes }, maj); OUV[x.id] = c.id;
  A.journal(x, (i >= 0 ? "Ordonnance modifiée (" : "Ordonnance (") + libLigne(ligne.t) + ") : " + ligne.lib);
}
window.csAntecedents = (pid, t) => (t === "doc" ? window.docHistorique(pid) : window.ordAntecedents(pid, t));

// ───── Suivi du dossier ─────
// Hôpital du patient changé : ses consultations suivent (pour les membres limités à certains établissements)
export async function suivreEtablissement(x, etab) {
  const s = await getDocs(query(col(), where("patientId", "==", x.id))).catch(() => null); if (!s) return;
  for (const d of s.docs) if (d.data().etablissementId !== etab) await updateDoc(d.ref, { etablissementId: etab, majPar: D().u.uid, majParNom: nomConnecte(), maj: serverTimestamp() }).catch((e) => console.warn("consultation", d.id, e));
  delete CS[x.id];
}
// Patient supprimé : ses consultations aussi
export async function supprimerConsultations(x) {
  const s = await getDocs(query(col(), where("patientId", "==", x.id))).catch(() => null); if (!s) return;
  for (const d of s.docs) await deleteDoc(d.ref).catch((e) => console.warn("consultation", d.id, e));
  delete CS[x.id];
}
