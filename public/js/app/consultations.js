// Onco360 – journal des consultations du dossier (étape 1B, 07/10/2026), onglet « Consultation ».
// Une fiche par consultation : espaces/{e}/consultations/{c} = { patientId, etablissementId, d (AAAA-MM-JJ), titre, note,
// lignes: [{ t: "medic"|"exam"|"ordo"|"analyse"|"courrier", lib, par }], o (ordre de création), creePar, creeParNom, cree,
// majPar, maj }. Lecture : tous les membres (périmètre) ; écriture : droit « ecrireConsultations » ; suppression : médecin.
// Les prescriptions (lignes) arrivent avec les étapes 1C à 1E ; ici : créer, modifier, supprimer, plier / déplier.
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
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
const peutSupprimer = () => peutEcrire() && D().membre.role === "medecin";
const nomConnecte = () => document.getElementById("nomMenu").textContent;

// Les 5 familles de prescriptions (barre sous la consultation), libellé de leur ligne dans la consultation
export const FAMILLES = [
  { t: "medic", lib: "Médic.", ic: "pilule", titre: "Médicaments" },
  { t: "exam", lib: "Examens compl.", ic: "loupe", titre: "Examens complémentaires" },
  { t: "ordo", lib: "Ordo. type", ic: "presse", titre: "Ordonnances types" },
  { t: "analyse", lib: "Analyses", ic: "tube", titre: "Analyses" },
  { t: "courrier", lib: "Courriers", ic: "courrier", titre: "Courriers" },
];
const libLigne = (t) => (FAMILLES.find((f) => f.t === t) || { lib: t }).lib;
const TITRES = ["Consultation de suivi", "Consultation d'annonce", "Consultation de contrôle", "Consultation de chimiothérapie", "Consultation en cours de radiothérapie", "Consultation de fin de traitement"];

// Lecture des consultations d'un patient (filtre d'établissement pour un membre limité à certains établissements)
function charger(x, apres) {
  const f = [where("patientId", "==", x.id)];
  if (!D().membre.tousEtablissements) f.push(where("etablissementId", "==", x.doc.etablissementId || ""));
  getDocs(query(col(), ...f))
    .then((s) => { CS[x.id] = s.docs.map((d) => Object.assign({ id: d.id }, d.data())).sort(tri); })
    .catch((e) => { console.warn("consultations", e); CS[x.id] = null; })
    .then(apres);
}
// À l'ouverture du dossier : relire (une consultation a pu être ajoutée depuis un autre poste)
export function oublierConsultations(pid) { delete CS[pid]; delete OUV[pid]; }
export const nbConsultations = (x) => (CS[x.id] || []).length;

// ───── Onglet « Consultation » ─────
export function htmlConsultations(x) {
  const esc = A.esc, q = "'" + x.id + "'";
  if (!(x.id in CS)) { CS[x.id] = undefined; charger(x, () => { if (D().page === "dossier/" + encodeURIComponent(x.id)) A.pageDossier(x.id); }); }
  const L = CS[x.id];
  let h = peutEcrire() ? '<div class="entete"><button class="bt clair petit" onclick="csNouvelle(' + q + ')">' + A.ic("plus") + "Nouvelle consultation</button></div>" : "";
  if (L === undefined) return h + '<p class="sous" style="margin:2px 0 0">Chargement des consultations…</p>';
  if (L === null) return h + '<p class="sous" style="margin:2px 0 0;color:var(--rouge)">Les consultations n\'ont pas pu être lues. Rechargez la page.</p>';
  if (!L.length) return h + '<p class="sous" style="margin:2px 0 0">Aucune consultation.' + (peutEcrire() ? " « Nouvelle consultation » pour en ajouter une." : "") + "</p>";
  const ouv = ouverte(x.id);
  L.forEach((c) => {
    const on = c.id === ouv, qc = q + ",'" + c.id + "'";
    h += '<div class="cs' + (on ? " on" : "") + '"><button class="cs-t" aria-expanded="' + on + '" onclick="csTog(' + qc + ')"><span class="fl">' + (on ? "▾" : "▸") + '</span><span class="dt">' + A.dfrA(c.d) + '</span><span class="ti">' + esc(c.titre || "Consultation") + '</span><span class="au">' + esc(c.creeParNom || "") + "</span></button>";
    if (on) {
      h += '<div class="cs-c"><table class="cs-l"><tr><th>Note</th><td>' + (c.note ? esc(c.note) : '<span class="mesures">—</span>') + '</td><td class="au">' + esc(c.creeParNom || "") + "</td></tr>" +
        (c.lignes || []).map((l) => "<tr><th>" + esc(libLigne(l.t)) + "</th><td>" + esc(l.lib || "") + '</td><td class="au">' + esc(l.par || "") + "</td></tr>").join("") + "</table>";
      if (peutEcrire()) {
        h += '<div class="presc">' + FAMILLES.map((f) => '<div class="pr"><button onclick="csPrescrire(' + qc + ",'" + f.t + '\')" title="' + f.titre + ' : nouvelle prescription"><svg class="pi"><use href="#i-' + f.ic + '"/></svg>' + f.lib + '</button><button class="fl" onclick="csAntecedents(' + q + ",'" + f.t + '\')" title="' + f.titre + ' : antécédents des prescriptions" aria-label="' + f.titre + ' : antécédents des prescriptions">▾</button></div>').join("") + "</div>" +
          '<div class="actr" style="justify-content:flex-start;margin-top:10px"><button class="mini" onclick="csModifier(' + qc + ')">Modifier</button>' + (peutSupprimer() ? '<button class="mini r" onclick="csSupprimer(' + qc + ')">Supprimer</button>' : "") + "</div>";
      }
      h += "</div>";
    }
    h += "</div>";
  });
  return h;
}
// Consultation dépliée : celle choisie, aucune si on l'a repliée (« — »), sinon la plus récente
function ouverte(pid) {
  const L = CS[pid] || []; if (OUV[pid] === "—") return null;
  return L.some((c) => c.id === OUV[pid]) ? OUV[pid] : L[0] && L[0].id;
}
window.csTog = (pid, cid) => { OUV[pid] = ouverte(pid) === cid ? "—" : cid; A.pageDossier(pid); };

// ───── Nouvelle consultation / modifier : titre, date (du jour par défaut), note ─────
function formulaire(x, c) {
  A.fenetre("<h3>" + (c ? "Modifier la consultation" : "Nouvelle consultation") + "</h3>" +
    '<div class="form"><div><label for="csTitre">Titre de la consultation</label><input id="csTitre" list="lCsTitre" value="' + A.esc(c ? c.titre || "" : "") + '" placeholder="Ex. Consultation de suivi"></div>' +
    '<div><label for="csDate">Date</label><input id="csDate" type="date" value="' + A.esc(c ? c.d : D().t) + '"></div>' +
    '<div class="large"><label for="csNote">Note</label><textarea id="csNote" rows="9" class="cs-note" placeholder="Examen, poids, PS, conduite à tenir…">' + A.esc(c ? c.note || "" : "") + "</textarea></div></div>" +
    '<datalist id="lCsTitre">' + TITRES.map((t) => '<option value="' + A.esc(t) + '">').join("") + "</datalist>" +
    '<div class="err" id="fErr"></div><div class="boutons"><button class="bt gris" onclick="fermerFenetre()">Annuler</button><button class="bt plein" id="csOk">Enregistrer</button></div>');
  document.getElementById("csOk").onclick = async () => {
    const titre = A.val("csTitre"), d = A.val("csDate"), note = String(document.getElementById("csNote").value || "").replace(/\s+$/, "");
    if (!titre) { A.erreur("Donnez un titre à la consultation."); return; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) { A.erreur("Choisissez la date de la consultation."); return; }
    A.occupe(document.getElementById("csOk"), true);
    try {
      const base = { titre, d, note, majPar: D().u.uid, majParNom: nomConnecte(), maj: serverTimestamp() };
      if (c) {
        await updateDoc(doc(db, "espaces", A.ESPACE, "consultations", c.id), base);
        Object.assign(c, base); CS[x.id].sort(tri); A.journal(x, "Consultation modifiée : " + titre);
      } else {
        const n = Object.assign({ patientId: x.id, etablissementId: x.doc.etablissementId || "", lignes: [], o: Date.now(), creePar: D().u.uid, creeParNom: nomConnecte(), cree: serverTimestamp() }, base);
        const r = await addDoc(col(), n);
        CS[x.id] = (CS[x.id] || []).concat([Object.assign({ id: r.id }, n)]).sort(tri); OUV[x.id] = r.id; A.journal(x, "Consultation ajoutée : " + titre);
      }
      A.fermerFenetre(); A.toast("Consultation enregistrée."); A.pageDossier(x.id);
    } catch (e) {
      A.occupe(document.getElementById("csOk"), false);
      A.erreur(e && e.code === "permission-denied" ? "Vous n'avez pas le droit d'écrire les consultations." : "Enregistrement impossible : " + ((e && e.message) || e));
    }
  };
}
window.csNouvelle = (pid) => { const x = trouver(pid); if (x && peutEcrire()) formulaire(x, null); };
window.csModifier = (pid, cid) => { const x = trouver(pid), c = (CS[pid] || []).find((z) => z.id === cid); if (x && c && peutEcrire()) formulaire(x, c); };
window.csSupprimer = async (pid, cid) => {
  const x = trouver(pid), c = (CS[pid] || []).find((z) => z.id === cid); if (!x || !c || !peutSupprimer()) return;
  if (!confirm("Supprimer la consultation du " + A.dfrA(c.d) + " (« " + (c.titre || "Consultation") + " ») ?\n\nSa note et ses prescriptions seront effacées.")) return;
  try { await deleteDoc(doc(db, "espaces", A.ESPACE, "consultations", cid)); CS[pid] = CS[pid].filter((z) => z.id !== cid); A.journal(x, "Consultation supprimée : " + (c.titre || "") + " du " + A.dfrA(c.d)); A.toast("Consultation supprimée."); A.pageDossier(pid); }
  catch (e) { A.toast(e && e.code === "permission-denied" ? "Vous n'avez pas le droit de supprimer cette consultation." : "Suppression impossible."); }
};

// ───── Barre des prescriptions : construite aux étapes 1C (médicaments), 1D (antécédents), 1E (autres familles) ─────
window.csPrescrire = (pid, cid, t) => { const f = FAMILLES.find((z) => z.t === t); A.toast((f ? f.titre : "Prescriptions") + " : bientôt disponible (ordonnances en cours de construction)."); };
window.csAntecedents = (pid, t) => { const f = FAMILLES.find((z) => z.t === t); A.toast((f ? f.titre : "Prescriptions") + " : les antécédents des prescriptions seront bientôt disponibles."); };

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
