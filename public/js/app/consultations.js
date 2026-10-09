// Onco360 – journal des consultations du dossier (étape 1B, 07/10/2026), onglet « Consultation ».
// Une fiche par consultation : espaces/{e}/consultations/{c} = { patientId, etablissementId, d (AAAA-MM-JJ), type (menu),
// titre (libre, ex. « J1C1 FOLFOX »), note,
// lignes: [{ id, t: "medic"|"exam"|"ordo"|"analyse"|"courrier", d, lib, par, med, html, format, taille }] (une ligne = une
// ordonnance : html = la feuille, med = médecin signataire), o (ordre de création), creePar, creeParNom, cree,
// majPar, maj }. Lecture : tous les membres (périmètre) ; écriture : droit « ecrireConsultations » ; suppression : médecin (toutes), secrétaire
// (celles qu'elle a créées).
// Les prescriptions (barre en bas de l'onglet, indépendante des consultations) s'ajoutent en ligne dans la consultation du
// jour : étapes 1C à 1E. Ici : créer, modifier, supprimer, plier / déplier.
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "../config.js";

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
const nomCs = (c) => [c.type, c.titre].filter(Boolean).join(" · ") || "Consultation";
const libLigne = (t) => (FAMILLES.find((f) => f.t === t) || { lib: t }).lib;
const TYPES = ["Consultation de suivi", "Consultation d'annonce", "RCP", "Consultation de contrôle", "Consultation de chimiothérapie", "Consultation en cours de radiothérapie", "Consultation de fin de traitement"];

// Lecture des consultations d'un patient (filtre d'établissement pour un membre limité à certains établissements)
function charger(x) {
  const f = [where("patientId", "==", x.id)];
  if (!D().membre.tousEtablissements) f.push(where("etablissementId", "==", x.doc.etablissementId || ""));
  return getDocs(query(col(), ...f))
    .then((s) => { CS[x.id] = s.docs.map((d) => Object.assign({ id: d.id }, d.data())).sort(tri); })
    .catch((e) => { console.warn("consultations", e); CS[x.id] = null; });
}
// À l'ouverture du dossier : relire (une consultation a pu être ajoutée depuis un autre poste)
export function oublierConsultations(pid) { delete CS[pid]; delete OUV[pid]; }
export const nbConsultations = (x) => (CS[x.id] || []).length;

// ───── Onglet « Consultation » ─────
export function htmlConsultations(x) {
  const esc = A.esc, q = "'" + x.id + "'";
  if (!(x.id in CS)) { CS[x.id] = undefined; charger(x).then(() => { if (D().page === "dossier/" + encodeURIComponent(x.id)) A.pageDossier(x.id); }); }
  const L = CS[x.id];
  let h = peutEcrire() ? '<div class="entete"><button class="bt clair petit" onclick="csNouvelle(' + q + ')">' + A.ic("plus") + "Nouvelle consultation</button></div>" : "";
  if (L === undefined) return h + '<p class="sous" style="margin:2px 0 0">Chargement des consultations…</p>';
  if (L === null) return h + '<p class="sous" style="margin:2px 0 0;color:var(--rouge)">Les consultations n\'ont pas pu être lues. Rechargez la page.</p>';
  if (!L.length) return h + '<p class="sous" style="margin:2px 0 0">Aucune consultation.' + (peutEcrire() ? " « Nouvelle consultation » pour en ajouter une." : "") + "</p>" + barre(x);
  const ouv = ouverte(x.id);
  // Liste dans une zone qui défile (environ 10 consultations fermées visibles), la plus récente en haut
  h += (L.length > 10 ? '<p class="mesures" style="margin:6px 0 0">' + L.length + " consultations : faites défiler la liste pour voir les plus anciennes.</p>" : "") + '<div class="cs-liste" id="csListe">';
  L.forEach((c) => {
    const on = c.id === ouv, qc = q + ",'" + c.id + "'";
    h += '<div class="cs' + (on ? " on" : "") + '"><button class="cs-t" aria-expanded="' + on + '" onclick="csTog(' + qc + ')"><span class="fl">' + (on ? "▾" : "▸") + '</span><span class="dt">' + A.dfrA(c.d) + '</span><span class="ti">' + esc(nomCs(c)) + '</span><span class="au">' + esc(c.creeParNom || "") + "</span></button>";
    if (on) {
      h += '<div class="cs-c"><table class="cs-l"><tr><th>Note</th><td>' + (c.note ? esc(c.note) : '<span class="mesures">—</span>') + '</td><td class="au">' + esc(c.creeParNom || "") + "</td></tr>" +
        (c.lignes || []).map((l) => "<tr><th>" + esc(libLigne(l.t)) + "</th><td>" + (l.html ? '<button class="lien-l" title="Voir, modifier ou réimprimer l\'ordonnance" onclick="ordVoir(' + qc + ",'" + l.id + '\')">' + esc(l.lib || "Ordonnance") + "</button>" : l.t === "doc" && l.docId ? '<button class="lien-l" title="Rouvrir le document remis" onclick="docOuvrirLigne(\'' + esc(l.docId) + '\')">' + esc(l.lib || "") + "</button>" : esc(l.lib || "")) + '</td><td class="au">' + esc(l.par || "") + "</td></tr>").join("") + "</table>";
      if (peutEcrire()) {
        h += '<div class="actr" style="justify-content:flex-start;margin-top:10px"><button class="mini" onclick="csModifier(' + qc + ')">Modifier</button>' + (peutSupprimer(c) ? '<button class="mini r" onclick="csSupprimer(' + qc + ')">Supprimer</button>' : "") + "</div>";
      }
      h += "</div>";
    }
    h += "</div>";
  });
  return h + "</div>" + barre(x);
}
// Bibliothèque de chaque bouton (réglage du cabinet, 10/10/2026 : une bibliothèque retirée cache son bouton)
const BIB_DE = { medic: "medicaments", ordo: "ordostypes", analyse: "analyses", exam: "examens", courrier: "courriers", doc: "documentation" };
// Barre des prescriptions, en bas de l'onglet, indépendante des consultations : une ordonnance faite ici s'ajoute en ligne
// dans la consultation du jour
function barre(x) {
  if (!peutEcrire()) return "";
  const q = "'" + x.id + "'";
  return '<div class="presc-bas"><div class="lbl">Prescriptions</div><div class="presc">' + FAMILLES.map((f) => '<div class="pr" data-mod="prescriptions" data-fn="prescriptions.' + f.t + '" data-bib="' + (BIB_DE[f.t] || "") + '"><button onclick="csPrescrire(' + q + ",'" + f.t + '\')" title="' + f.titre + ' : nouvelle prescription"><svg class="pi"><use href="#i-' + f.ic + '"/></svg>' + f.lib + '</button><button class="fl" data-fn="prescriptions.antecedents" onclick="csAntecedents(' + q + ",'" + f.t + '\')" title="' + f.titre + ' : antécédents des prescriptions" aria-label="' + f.titre + ' : antécédents des prescriptions">▾</button></div>').join("") +
    // « + RCP » (09/10/2026, rcp.js) : inscription à la prochaine RCP ; flèche = inscriptions du patient
    '<div class="pr" data-mod="rcp"><button onclick="rcpInscrire(' + q + ')" title="Inscrire le patient à la prochaine RCP"><svg class="pi"><use href="#i-rcp"/></svg>+ RCP</button><button class="fl" onclick="rcpHistorique(' + q + ')" title="RCP du patient" aria-label="RCP du patient">▾</button></div>' + "</div></div>";
}
// Consultation dépliée : celle qu'on vient d'ouvrir, d'ajouter ou de compléter ; à l'ouverture du dossier, toutes sont fermées
function ouverte(pid) {
  const L = CS[pid] || [];
  return L.some((c) => c.id === OUV[pid]) ? OUV[pid] : null;
}
// Plier / déplier : la zone qui défile garde sa position
window.csTog = (pid, cid) => {
  const z = document.getElementById("csListe"), pos = z ? z.scrollTop : 0;
  OUV[pid] = ouverte(pid) === cid ? "—" : cid; A.pageDossier(pid);
  const z2 = document.getElementById("csListe"); if (z2) z2.scrollTop = pos;
};

// ───── Nouvelle consultation / modifier : titre, date (du jour par défaut), note ─────
// pre { type, titre, d, note } : nouvelle consultation déjà remplie ; apres(id, champs) : appelé une fois enregistrée
// (décision de RCP, rcp.js 09/10/2026)
function formulaire(x, c, pre, apres) {
  pre = c ? null : pre || null;
  A.fenetre("<h3>" + (c ? "Modifier la consultation" : "Nouvelle consultation") + "</h3>" +
    '<div class="form"><div><label for="csType">Consultation</label><select id="csType">' + TYPES.concat(c && c.type && TYPES.indexOf(c.type) < 0 ? [c.type] : []).map((t) => '<option' + ((c || pre) && (c || pre).type === t ? " selected" : "") + ">" + A.esc(t) + "</option>").join("") + "</select></div>" +
    '<div><label for="csDate">Date</label><input id="csDate" type="date" value="' + A.esc(c ? c.d : (pre && pre.d) || D().t) + '"></div>' +
    '<div class="large"><label for="csTitre">Titre de la consultation</label><input id="csTitre" value="' + A.esc(c ? c.titre || "" : (pre && pre.titre) || "") + '" placeholder="Ex. J1C1 FOLFOX"></div>' +
    '<div class="large"><label for="csNote">Note</label><textarea id="csNote" rows="9" class="cs-note" placeholder="Examen, poids, PS, conduite à tenir…">' + A.esc(c ? c.note || "" : (pre && pre.note) || "") + "</textarea></div></div>" +
    '<div class="err" id="fErr"></div><div class="boutons"><button class="bt gris" onclick="fermerFenetre()">Annuler</button><button class="bt plein" id="csOk">Enregistrer</button></div>');
  if (pre && pre.note) setTimeout(() => { const n = document.getElementById("csNote"); if (n) { n.focus(); n.setSelectionRange(n.value.length, n.value.length); } }, 80); // décision de RCP : curseur après « Décision : »
  document.getElementById("csOk").onclick = async () => {
    const type = A.val("csType"), titre = A.val("csTitre"), d = A.val("csDate"), note = String(document.getElementById("csNote").value || "").replace(/\s+$/, "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) { A.erreur("Choisissez la date de la consultation."); return; }
    A.occupe(document.getElementById("csOk"), true);
    try {
      const base = { type, titre, d, note, majPar: D().u.uid, majParNom: nomConnecte(), maj: serverTimestamp() };
      if (c) {
        await updateDoc(doc(db, "espaces", A.ESPACE, "consultations", c.id), base);
        Object.assign(c, base); CS[x.id].sort(tri); A.journal(x, "Consultation modifiée : " + nomCs(base));
        if (apres) await apres(c.id, base);
      } else {
        const n = Object.assign({ patientId: x.id, etablissementId: x.doc.etablissementId || "", lignes: [], o: Date.now(), creePar: D().u.uid, creeParNom: nomConnecte(), cree: serverTimestamp() }, base);
        const r = await addDoc(col(), n);
        CS[x.id] = (CS[x.id] || []).concat([Object.assign({ id: r.id }, n)]).sort(tri); OUV[x.id] = r.id; A.journal(x, "Consultation ajoutée : " + nomCs(base));
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
