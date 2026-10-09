// Onco360 – onglet « Documents » du dossier (08/10/2026) : fichiers venus d'ailleurs (PDF, Word, photos…) déposés dans le
// dossier, avec un titre, la date du document et son type ; liste du plus récent au plus ancien, recherche, filtre par type.
// Fichier : Cloud Storage espaces/{e}/patients/{p}/fichiers/{id}/{nom} (règles : storage.rules, droit « documents » et
// périmètre du membre) ; fiche : espaces/{e}/fichiers/{id} = { patientId, etablissementId, titre, d (date du document), type,
// nom, taille, mime, chemin, creePar, creeParNom, cree, majPar, majParNom, maj }.
// Suppression : le médecin (tous), les autres seulement ceux qu'ils ont déposés. Types : parametres/typesDocuments
// = { data: JSON [noms] } (Configuration › Documents, droit « paramètres »), sinon la liste de départ TYPES_DOCUMENTS0.
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref, uploadBytesResumable, getBlob, deleteObject } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { app, db } from "../config.js";

let A = null;
export function installer(api) { A = api; }
const D = () => A.D();
const $ = (i) => document.getElementById(i);
const st = () => getStorage(app);
const col = () => collection(db, "espaces", A.ESPACE, "fichiers");
const trouver = (pid) => D().patients.find((p) => p.id === pid);
const peutDeposer = () => A.peut("documents");
const peutSupprimer = (f) => peutDeposer() && (D().membre.role === "medecin" || f.creePar === D().u.uid);
const nomConnecte = () => document.getElementById("nomMenu").textContent;
const sansAcc = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const MAX = 25 * 1024 * 1024; // 25 Mo par fichier (règles de stockage)

export const TYPES_DOCUMENTS0 = ["Pièces d'identité", "Fiches d'admission & Consentements", "Couverture médicale & Prise en charge", "Comptes-rendus", "Courriers", "Certificats", "RCP", "Anatomopathologie", "Biologie", "Immunohistochimie & Biologie moléculaire", "Imagerie", "Ordonnance", "Fiche de Protocole"];
let TYPES = null;
export async function typesDocuments() {
  if (TYPES) return TYPES;
  const s = await getDoc(doc(db, "espaces", A.ESPACE, "parametres", "typesDocuments")).catch(() => null);
  let L = null; try { L = s && s.exists() ? JSON.parse(s.data().data || "[]") : null; } catch (e) { L = null; }
  return (TYPES = L && L.length ? L : TYPES_DOCUMENTS0.slice());
}
export async function enregistrerTypes(L) {
  await setDoc(doc(db, "espaces", A.ESPACE, "parametres", "typesDocuments"), { data: JSON.stringify(L), maj: serverTimestamp(), majPar: D().u.uid });
  TYPES = L.slice();
}

// ───── Fiches des documents d'un patient ─────
const FI = {}; // pid → tableau ; null si la lecture a échoué ; absent = à charger
const FQ = {}; // pid → { q, t } (recherche, type choisi)
const tri = (a, b) => (b.d || "").localeCompare(a.d || "") || String(b.o || "").localeCompare(String(a.o || ""));
function charger(x) {
  const f = [where("patientId", "==", x.id)];
  if (!D().membre.tousEtablissements) f.push(where("etablissementId", "==", x.doc.etablissementId || ""));
  return Promise.all([getDocs(query(col(), ...f)), typesDocuments()])
    .then(([s]) => { FI[x.id] = s.docs.map((d) => Object.assign({ id: d.id }, d.data())).sort(tri); })
    .catch((e) => { console.warn("documents", e); FI[x.id] = null; });
}
export function oublierFichiers(pid) { delete FI[pid]; }
export const nbFichiers = (x) => (FI[x.id] || []).length;
const redessiner = (pid) => { if (D().page === "dossier/" + encodeURIComponent(pid)) A.pageDossier(pid); };

// ───── Onglet « Documents » ─────
export function htmlFichiers(x) {
  const esc = A.esc, q = "'" + x.id + "'";
  if (!(x.id in FI)) { FI[x.id] = undefined; charger(x).then(() => redessiner(x.id)); }
  const L = FI[x.id], F = FQ[x.id] || (FQ[x.id] = { q: "", t: "" });
  let h = "";
  if (L === undefined) return '<p class="sous" style="margin:2px 0 0">Chargement des documents…</p>';
  if (L === null) return '<p class="sous" style="margin:2px 0 0;color:var(--rouge)">Les documents n\'ont pas pu être lus. Rechargez la page.</p>';
  const types = (TYPES || TYPES_DOCUMENTS0).concat(L.map((f) => f.type).filter((t) => t && (TYPES || TYPES_DOCUMENTS0).indexOf(t) < 0));
  const presents = types.filter((t, i) => types.indexOf(t) === i);
  h += '<div class="fi-barre"><div class="recherche">' + A.ic("loupe") + '<input id="fiQ" type="search" autocomplete="off" placeholder="Rechercher un document (titre, type, fichier)…" value="' + esc(F.q) + '" oninput="fiFiltre(' + q + ')" aria-label="Rechercher un document"></div>' +
    '<select id="fiT" data-fn="documents.types" onchange="fiFiltre(' + q + ')" aria-label="Type de document"><option value="">Tous les types</option>' + presents.map((t) => '<option' + (F.t === t ? " selected" : "") + ">" + esc(t) + "</option>").join("") + "</select>" +
    (peutDeposer() ? '<button class="bt clair petit" onclick="fiAjouter(' + q + ')">' + A.ic("plus") + "Ajouter un document</button>" : "") + "</div>" +
    '<div id="fiListe">' + listeHtml(x) + "</div>" +
    '<p class="mesures" style="margin:8px 0 0">PDF, Word, photos (JPEG, PNG…) ou autre, 25 Mo au plus par fichier. Le pli confidentiel, le compte rendu de fin et les rendez-vous restent dans la carte de leur radiothérapie ; les ordonnances et les courriers, dans l\'onglet Consultation.</p>';
  return h;
}
const icone = (f) => { const m = String(f.mime || ""), n = sansAcc(f.nom); return /pdf/.test(m) || /\.pdf$/.test(n) ? "PDF" : /^image\//.test(m) ? "IMG" : /word|officedocument\.wordprocessing|msword/.test(m) || /\.docx?$/.test(n) ? "DOC" : /sheet|excel/.test(m) || /\.xlsx?$/.test(n) ? "XLS" : "FIC"; };
const taille = (o) => (o >= 1048576 ? (o / 1048576).toFixed(1).replace(".", ",") + " Mo" : Math.max(1, Math.round(o / 1024)) + " Ko");
function listeHtml(x) {
  const esc = A.esc, L = FI[x.id] || [], F = FQ[x.id] || { q: "", t: "" };
  const mots = sansAcc(F.q).split(/\s+/).filter(Boolean);
  const V = L.filter((f) => (!F.t || f.type === F.t) && mots.every((w) => sansAcc([f.titre, f.type, f.nom, f.creeParNom].join(" ")).indexOf(w) >= 0));
  if (!L.length) return '<p class="sous" style="margin:10px 0 0">Aucun document dans ce dossier.' + (peutDeposer() ? " « Ajouter un document » pour en déposer un (PDF, Word, photo…)." : "") + "</p>";
  if (!V.length) return '<p class="sous" style="margin:10px 0 0">Aucun document ne correspond' + (F.t ? " (type « " + esc(F.t) + " »)" : "") + ".</p>";
  return (V.length < L.length ? '<p class="mesures" style="margin:8px 0 0">' + V.length + " document" + (V.length > 1 ? "s" : "") + " sur " + L.length + "</p>" : "") + '<div class="fi-liste">' + V.map((f) => {
    const qf = "'" + x.id + "','" + f.id + "'";
    return '<div class="fi"><span class="fi-ic fi-' + icone(f).toLowerCase() + '" aria-hidden="true">' + icone(f) + '</span><div class="tx"><b>' + esc(f.titre || f.nom) + '</b><div class="fi-m"><span class="badge b-co">' + esc(A.dfrA(f.d)) + "</span>" + (f.type ? '<span class="badge b-gr">' + esc(f.type) + "</span>" : "") + "</div>" +
      '<div class="mesures">' + esc(f.nom) + " · " + taille(f.taille || 0) + (f.creeParNom ? " · déposé par " + esc(f.creeParNom) : "") + "</div></div>" +
      '<div class="actr"><button class="mini" onclick="fiOuvrir(' + qf + ')">Ouvrir</button><button class="mini" onclick="fiTelecharger(' + qf + ')">Télécharger</button>' +
      (peutDeposer() ? '<button class="mini" onclick="fiModifier(' + qf + ')">Modifier</button>' : "") + (peutSupprimer(f) ? '<button class="mini r" onclick="fiSupprimer(' + qf + ')">Supprimer</button>' : "") + "</div></div>";
  }).join("") + "</div>";
}
// Recherche et filtre : seule la liste est redessinée (le curseur reste dans la recherche)
window.fiFiltre = (pid) => { const x = trouver(pid); if (!x) return; FQ[pid] = { q: $("fiQ") ? $("fiQ").value : "", t: $("fiT") ? $("fiT").value : "" }; $("fiListe").innerHTML = listeHtml(x); };

// ───── Ajouter : fichier (choisi ou déposé), titre, date du document, type ─────
let NV = null; // { pid, fichier }
const champs = (f, types) => {
  const esc = A.esc, liste = types.concat(f && f.type && types.indexOf(f.type) < 0 ? [f.type] : []);
  return '<div class="form"><div class="large"><label for="fiTitre">Titre</label><input id="fiTitre" value="' + esc(f ? f.titre || "" : "") + '" placeholder="Ex. Compte rendu anatomopathologique de la biopsie"></div>' +
    '<div><label for="fiDate">Date du document</label><input id="fiDate" type="date" value="' + esc(f ? f.d : D().t) + '"></div>' +
    '<div data-fn="documents.types"><label for="fiType">Type de document</label><select id="fiType"><option value=""></option>' + liste.map((t) => "<option" + (f && f.type === t ? " selected" : "") + ">" + esc(t) + "</option>").join("") + "</select></div></div>";
};
window.fiAjouter = async (pid) => {
  const x = trouver(pid); if (!x || !peutDeposer()) return; NV = { pid, fichier: null };
  const types = await typesDocuments();
  A.fenetre("<h3>Ajouter un document — " + A.esc(x.r.nm) + "</h3>" +
    '<label class="fi-depot" id="fiDepot" for="fiF"><input type="file" id="fiF" class="cache-vis"><b>Choisir un fichier</b><span class="mesures">ou le glisser ici · PDF, Word, photo (JPEG, PNG…) ou autre · 25 Mo au plus</span><span id="fiNom" class="fi-nom"></span></label>' +
    champs(null, types) +
    '<div class="fi-prog cache" id="fiProg"><div id="fiBarre"></div></div>' +
    '<div class="err" id="fErr"></div><div class="boutons"><button class="bt gris" id="fiAnn" onclick="fiAnnuler()">Annuler</button><button class="bt plein" id="fiOk" onclick="fiEnvoyer()">Enregistrer</button></div>');
  const choisir = (fl) => {
    if (!fl) return; if (fl.size > MAX) { A.erreur("Fichier trop lourd (" + taille(fl.size) + ") : 25 Mo au plus."); return; }
    NV.fichier = fl; A.erreur(""); $("fiNom").textContent = fl.name + " · " + taille(fl.size);
    if (!A.val("fiTitre")) $("fiTitre").value = fl.name.replace(/\.[^.]+$/, "").replace(/[_]+/g, " ");
  };
  $("fiF").onchange = () => choisir($("fiF").files[0]);
  const z = $("fiDepot");
  z.ondragover = (e) => { e.preventDefault(); z.classList.add("on"); };
  z.ondragleave = () => z.classList.remove("on");
  z.ondrop = (e) => { e.preventDefault(); z.classList.remove("on"); choisir(e.dataTransfer.files[0]); };
};
let TACHE = null;
window.fiAnnuler = () => { if (TACHE) try { TACHE.cancel(); } catch (e) {} TACHE = null; NV = null; A.fermerFenetre(); };
window.fiEnvoyer = async () => {
  if (!NV) return; const x = trouver(NV.pid), fl = NV.fichier; if (!x) return;
  const titre = A.val("fiTitre"), d = A.val("fiDate"), type = A.val("fiType");
  if (!fl) { A.erreur("Choisissez un fichier."); return; }
  if (!titre) { A.erreur("Donnez un titre au document."); return; }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) { A.erreur("Indiquez la date du document."); return; }
  if (!type) { A.erreur("Choisissez le type de document."); return; }
  A.occupe($("fiOk"), true); A.erreur("");
  const r = doc(col()), nom = fl.name.replace(/[\/\\#?\[\]*]/g, "_").slice(-120) || "document";
  const chemin = "espaces/" + A.ESPACE + "/patients/" + x.id + "/fichiers/" + r.id + "/" + nom, sr = ref(st(), chemin);
  $("fiProg").classList.remove("cache");
  try {
    await new Promise((ok, ko) => {
      TACHE = uploadBytesResumable(sr, fl, { contentType: fl.type || "application/octet-stream", customMetadata: { creePar: D().u.uid, patientId: x.id } });
      TACHE.on("state_changed", (s) => { const b = $("fiBarre"); if (b && s.totalBytes) b.style.width = Math.round((s.bytesTransferred / s.totalBytes) * 100) + "%"; }, ko, ok);
    });
    TACHE = null;
    const f = { patientId: x.id, etablissementId: x.doc.etablissementId || "", titre, d, type, nom, taille: fl.size, mime: fl.type || "", chemin, o: Date.now(), creePar: D().u.uid, creeParNom: nomConnecte(), cree: serverTimestamp(), majPar: D().u.uid, majParNom: nomConnecte(), maj: serverTimestamp() };
    try { await setDoc(r, f); } catch (e) { await deleteObject(sr).catch(() => {}); throw e; }
    FI[x.id] = (FI[x.id] || []).concat([Object.assign({ id: r.id }, f)]).sort(tri);
    A.journal(x, "Document ajouté (" + type + ") : " + titre);
    NV = null; A.fermerFenetre(); A.toast("Document ajouté au dossier."); A.pageDossier(x.id);
  } catch (e) {
    TACHE = null; A.occupe($("fiOk"), false); $("fiProg").classList.add("cache");
    if (e && e.code === "storage/canceled") return;
    A.erreur(e && /unauthorized|permission/.test(e.code || "") ? "Vous n'avez pas le droit de déposer un document dans ce dossier." : "Envoi impossible : " + ((e && e.message) || e));
  }
};

// ───── Ouvrir, télécharger (fichier relu avec les droits du membre), modifier, supprimer ─────
const fiche = (pid, id) => (FI[pid] || []).find((f) => f.id === id);
async function lireFichier(f) { return getBlob(ref(st(), f.chemin)); }
window.fiOuvrir = async (pid, id) => {
  const f = fiche(pid, id); if (!f) return;
  let w = null; try { w = window.open("", "_blank"); } catch (e) { w = null; } // ouverte tout de suite (sinon bloquée)
  if (w) try { w.document.title = f.titre || f.nom; w.document.body.innerHTML = '<p style="font-family:Arial;color:#555;padding:20px">Ouverture de « ' + A.esc(f.nom) + " »…</p>"; } catch (e) {}
  try { const b = await lireFichier(f), u = URL.createObjectURL(b.type ? b : new Blob([b], { type: f.mime || "application/octet-stream" })); if (w) w.location.href = u; else A.toast("Ouverture bloquée par le navigateur : utilisez « Télécharger »."); setTimeout(() => URL.revokeObjectURL(u), 120000); }
  catch (e) { if (w) w.close(); A.toast(e && /unauthorized|permission/.test(e.code || "") ? "Vous n'avez pas accès à ce document." : "Ouverture impossible : " + ((e && e.message) || e)); }
};
window.fiTelecharger = async (pid, id) => {
  const f = fiche(pid, id); if (!f) return;
  try { const b = await lireFichier(f), u = URL.createObjectURL(b), a = document.createElement("a"); a.href = u; a.download = f.nom; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 60000); }
  catch (e) { A.toast(e && /unauthorized|permission/.test(e.code || "") ? "Vous n'avez pas accès à ce document." : "Téléchargement impossible : " + ((e && e.message) || e)); }
};
window.fiModifier = async (pid, id) => {
  const x = trouver(pid), f = fiche(pid, id); if (!x || !f || !peutDeposer()) return;
  const types = await typesDocuments();
  A.fenetre("<h3>Modifier le document</h3><p class=\"mesures\">" + A.esc(f.nom) + " · " + taille(f.taille || 0) + "</p>" + champs(f, types) +
    '<div class="err" id="fErr"></div><div class="boutons"><button class="bt gris" onclick="fermerFenetre()">Annuler</button><button class="bt plein" id="fiOk">Enregistrer</button></div>');
  $("fiOk").onclick = async () => {
    const titre = A.val("fiTitre"), d = A.val("fiDate"), type = A.val("fiType");
    if (!titre) { A.erreur("Donnez un titre au document."); return; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) { A.erreur("Indiquez la date du document."); return; }
    if (!type) { A.erreur("Choisissez le type de document."); return; }
    A.occupe($("fiOk"), true);
    try {
      const maj = { titre, d, type, majPar: D().u.uid, majParNom: nomConnecte(), maj: serverTimestamp() };
      await updateDoc(doc(db, "espaces", A.ESPACE, "fichiers", id), maj); Object.assign(f, maj); FI[pid].sort(tri);
      A.journal(x, "Document modifié : " + titre); A.fermerFenetre(); A.toast("Document modifié."); A.pageDossier(pid);
    } catch (e) { A.occupe($("fiOk"), false); A.erreur(e && e.code === "permission-denied" ? "Vous n'avez pas le droit de modifier ce document." : "Enregistrement impossible : " + ((e && e.message) || e)); }
  };
};
window.fiSupprimer = async (pid, id) => {
  const x = trouver(pid), f = fiche(pid, id); if (!x || !f || !peutSupprimer(f)) return;
  if (!confirm("Supprimer le document « " + (f.titre || f.nom) + " » du " + A.dfrA(f.d) + " ?\n\nLe fichier est effacé du dossier.")) return;
  try {
    await deleteObject(ref(st(), f.chemin)).catch((e) => { if (!e || e.code !== "storage/object-not-found") throw e; });
    await deleteDoc(doc(db, "espaces", A.ESPACE, "fichiers", id));
    FI[pid] = FI[pid].filter((z) => z.id !== id); A.journal(x, "Document supprimé : " + (f.titre || f.nom)); A.toast("Document supprimé."); A.pageDossier(pid);
  } catch (e) { A.toast(e && /unauthorized|permission/.test(e.code || "") ? "Vous n'avez pas le droit de supprimer ce document." : "Suppression impossible : " + ((e && e.message) || e)); }
};

// ───── Suivi du dossier ─────
// Hôpital du patient changé : ses documents suivent (membres limités à certains établissements)
export async function suivreEtablissementFichiers(x, etab) {
  const s = await getDocs(query(col(), where("patientId", "==", x.id))).catch(() => null); if (!s) return;
  for (const d of s.docs) if (d.data().etablissementId !== etab) await updateDoc(d.ref, { etablissementId: etab, majPar: D().u.uid, majParNom: nomConnecte(), maj: serverTimestamp() }).catch((e) => console.warn("document", d.id, e));
  delete FI[x.id];
}
// Patient supprimé : ses documents (fichiers et fiches) aussi
export async function supprimerFichiers(x) {
  const s = await getDocs(query(col(), where("patientId", "==", x.id))).catch(() => null); if (!s) return;
  for (const d of s.docs) { await deleteObject(ref(st(), d.data().chemin)).catch(() => {}); await deleteDoc(d.ref).catch((e) => console.warn("document", d.id, e)); }
  delete FI[x.id];
}
