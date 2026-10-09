// Onco360 – bouton « Doc. » de l'onglet Consultation (08/10/2026) : documentation du cabinet à remettre aux patients (fiches
// PDF : régimes, consignes, effets secondaires…). Liste : espaces/{e}/bibliotheques/documentation = { data: JSON [{ id,
// titre, cat, nom, taille, chemin (Cloud Storage espaces/{e}/documentation/{id}/{nom}) ou url (fiche de départ servie par
// le site), fav, le, par }] } ; départ : donnees/documentation.js. Le médecin ajoute (+, PDF seulement), modifie, supprime
// et met en favori ; tous ceux qui prescrivent ouvrent et remettent. « Remettre au patient » ouvre le PDF (pour l'imprimer) et
// note une ligne « Doc. » dans la consultation du jour ({ t: "doc", lib: titre, docId }) ; la petite flèche liste ce qui a
// déjà été remis à ce patient.
import { doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref, uploadBytesResumable, getBlob, deleteObject } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { app, db } from "../config.js";
import { DOCUMENTATION0, CATEGORIES_DOC0 } from "../donnees/documentation.js";
import { enregistrerPrescription, assurerConsultations, lignesType, supprimerPrescription } from "./consultations.js";

let A = null;
export function installer(api) { A = api; }
const D = () => A.D();
const $ = (i) => document.getElementById(i);
const st = () => getStorage(app);
const trouver = (pid) => D().patients.find((p) => p.id === pid);
const peutRemettre = () => A.peut("ecrireConsultations");
const gere = () => peutRemettre() && D().membre.role === "medecin"; // ajouter, modifier, supprimer, favoris : le médecin
const sansAcc = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const ico = (n) => '<svg class="pi"><use href="#i-' + n + '"/></svg>';
const MAX = 25 * 1024 * 1024;
const taille = (o) => (o >= 1048576 ? (o / 1048576).toFixed(1).replace(".", ",") + " Mo" : Math.max(1, Math.round((o || 0) / 1024)) + " Ko");

// ───── Liste du cabinet ─────
const refListe = () => doc(db, "espaces", A.ESPACE, "bibliotheques", "documentation");
const DEPART = () => DOCUMENTATION0.map((d, i) => ({ id: "d" + (i + 1), titre: d.titre, cat: d.cat, url: d.url, nom: d.url.split("/").pop(), taille: d.taille || 0, le: "2026-10-07" }));
let DOCS = null;
async function lire() {
  if (DOCS) return DOCS;
  const s = await getDoc(refListe()).catch(() => null);
  return (DOCS = s && s.exists() ? JSON.parse(s.data().data || "[]") : DEPART());
}
// Bibliothèque de référence (10/10/2026) : la liste de départ enregistrée telle quelle (mise de côté)
export async function figerDocumentation() {
  const s = await getDoc(refListe()).catch(() => null);
  if (s && !s.exists()) { await setDoc(refListe(), { data: JSON.stringify(DEPART()), maj: serverTimestamp(), majPar: D().u.uid }); return 1; }
  return 0;
}
async function modifier(fn) {
  const s = await getDoc(refListe()).catch(() => null), L = s && s.exists() ? JSON.parse(s.data().data || "[]") : DEPART();
  fn(L); await setDoc(refListe(), { data: JSON.stringify(L), maj: serverTimestamp(), majPar: D().u.uid });
  return (DOCS = L);
}
const erreurDroit = (e, quoi) => (e && /permission|unauthorized/.test(e.code || "") ? "Vous n'avez pas le droit de " + quoi + "." : null);

// ───── Fenêtre « Documentation » : recherche, catégorie, tri, liste ─────
let V = null; // { pid, q, cat, tri }
const TRIS = [["fav", "Favoris, puis A → Z"], ["recent", "Plus récents d'abord"], ["cat", "Par catégorie"]];
// Gestion de la liste sans patient (Paramètres › Bibliothèques, 10/10/2026) : ajouter, modifier, supprimer, favoris
window.ordDocumentationGestion = async () => {
  if (!gere()) { A.toast("Réservé au médecin."); return; }
  V = { q: "", cat: "", tri: "fav", pid: null };
  A.fenetre('<p class="sous">Chargement de la documentation…</p>', "large");
  await lire(); vue();
};
window.ordDocumentation = async (pid) => {
  const x = trouver(pid); if (!x || !peutRemettre()) return;
  V = Object.assign({ q: "", cat: "", tri: "fav" }, V && V.pid === pid ? V : {}, { pid });
  A.fenetre('<p class="sous">Chargement de la documentation…</p>', "large");
  await Promise.all([lire(), assurerConsultations(x)]); vue();
};
function vue() {
  const x = V.pid ? trouver(V.pid) : null, esc = A.esc, cats = [...new Set(DOCS.map((d) => d.cat).filter(Boolean))].sort((a, b) => sansAcc(a).localeCompare(sansAcc(b)));
  A.fenetre("<h3>Documentation" + (x ? " — " + esc(x.r.nm) : " à remettre aux patients") + "</h3>" +
    '<div class="md-barre"><div class="recherche">' + A.ic("loupe") + '<input id="dcQ" type="search" autocomplete="off" placeholder="Rechercher un document (titre, catégorie)…" value="' + esc(V.q) + '"></div>' +
    '<select id="dcCat" aria-label="Catégorie"><option value="">Toutes les catégories</option>' + cats.map((c) => "<option" + (V.cat === c ? " selected" : "") + ">" + esc(c) + "</option>").join("") + "</select>" +
    '<select id="dcTri" aria-label="Trier">' + TRIS.map(([k, l]) => '<option value="' + k + '"' + (V.tri === k ? " selected" : "") + ">" + l + "</option>").join("") + "</select>" +
    (gere() ? '<button class="bt clair petit" onclick="dcAjouter()">' + A.ic("plus") + "Ajouter un PDF</button>" : "") + "</div>" +
    '<div class="md-liste" id="dcListe"></div>' +
    '<p class="mesures" style="margin:6px 0 0">' + (x ? "« Remettre » ouvre le PDF pour l\'imprimer et le note dans la consultation du jour ; la petite flèche à côté de « Doc. » montre ce qui a déjà été remis à ce patient." : "Liste du bouton « Doc. » du dossier.") + (gere() ? " Vous seul (médecin) ajoutez, modifiez et supprimez les documents." : "") + "</p>" +
    '<div class="boutons"><button class="bt gris" onclick="fermerFenetre()">Fermer</button></div>', "large");
  $("dcQ").oninput = () => { V.q = $("dcQ").value; liste(); };
  $("dcCat").onchange = () => { V.cat = $("dcCat").value; liste(); };
  $("dcTri").onchange = () => { V.tri = $("dcTri").value; liste(); };
  liste(); setTimeout(() => { const q = $("dcQ"); if (q) q.focus(); }, 60);
}
const alpha = (a, b) => sansAcc(a.titre).localeCompare(sansAcc(b.titre));
function liste() {
  const esc = A.esc, mots = sansAcc(V.q).split(/\s+/).filter(Boolean);
  const remis = {}; (V.pid ? lignesType(V.pid, "doc") : []).forEach(({ l }) => { if (l.docId && (!remis[l.docId] || l.d > remis[l.docId])) remis[l.docId] = l.d; });
  const L = DOCS.filter((d) => (!V.cat || d.cat === V.cat) && mots.every((w) => sansAcc(d.titre + " " + (d.cat || "") + " " + (d.nom || "")).indexOf(w) >= 0))
    .sort(V.tri === "recent" ? (a, b) => String(b.le || "").localeCompare(String(a.le || "")) || alpha(a, b)
      : V.tri === "cat" ? (a, b) => sansAcc(a.cat || "~").localeCompare(sansAcc(b.cat || "~")) || alpha(a, b)
      : (a, b) => (b.fav ? 1 : 0) - (a.fav ? 1 : 0) || alpha(a, b));
  let cat = null;
  $("dcListe").innerHTML = L.length ? '<table class="md-t"><tr><th>Document</th><th>Catégorie</th><th></th></tr>' + L.map((d) => {
    const q = "'" + d.id + "'", sep = V.tri === "cat" && d.cat !== cat ? ((cat = d.cat), '<tr class="dc-sep"><td colspan="3">' + esc(d.cat || "Sans catégorie") + "</td></tr>") : "";
    const etoile = gere() ? '<button class="ico etoile' + (d.fav ? " on" : "") + '" aria-pressed="' + !!d.fav + '" title="' + (d.fav ? "Retirer des favoris" : "Mettre en favori (en tête de liste)") + '" aria-label="Favori : ' + esc(d.titre) + '" onclick="dcFavori(' + q + ')">' + ico("etoile") + "</button>"
      : d.fav ? '<span class="ico etoile on" title="Favori">' + ico("etoile") + "</span>" : "";
    return sep + '<tr><td><b>' + esc(d.titre) + '</b><div class="cl">PDF · ' + taille(d.taille) + (remis[d.id] ? ' · <span class="badge b-ch">remis le ' + A.dfrA(remis[d.id]) + "</span>" : "") + "</div></td><td>" + esc(d.cat || "") + '</td><td class="act">' + etoile +
      '<button class="mini" onclick="dcOuvrir(' + q + ')">Ouvrir</button>' + (V.pid ? '<button class="mini v" title="Ouvrir pour imprimer et noter dans la consultation du jour" onclick="dcRemettre(' + q + ')">Remettre</button>' : "") +
      (gere() ? '<button class="ico" title="Modifier le titre ou la catégorie" aria-label="Modifier ' + esc(d.titre) + '" onclick="dcFiche(' + q + ')">' + ico("crayon") + '</button><button class="ico rouge" title="Supprimer le document" aria-label="Supprimer ' + esc(d.titre) + '" onclick="dcSupprimer(' + q + ')">' + ico("croix") + "</button>" : "") + "</td></tr>";
  }).join("") + "</table>" : '<p class="sous" style="padding:12px">Aucun document ne correspond.' + (gere() ? " « Ajouter un PDF » pour en ajouter un." : "") + "</p>";
}

// ───── Ouvrir / remettre ─────
async function blobDe(d) { if (d.url) { const r = await fetch(d.url); if (!r.ok) throw new Error("fichier introuvable"); return r.blob(); } return getBlob(ref(st(), d.chemin)); }
async function ouvrir(d, w) {
  try { const b = await blobDe(d), u = URL.createObjectURL(new Blob([b], { type: "application/pdf" })); if (w) w.location.href = u; else A.toast("Ouverture bloquée par le navigateur : autorisez les fenêtres pour Onco360."); setTimeout(() => URL.revokeObjectURL(u), 300000); return true; }
  catch (e) { if (w) w.close(); A.toast(erreurDroit(e, "lire ce document") || "Ouverture impossible : " + ((e && e.message) || e)); return false; }
}
const fenetreVide = (d) => { let w = null; try { w = window.open("", "_blank"); } catch (e) { w = null; } if (w) try { w.document.title = d.titre; w.document.body.innerHTML = '<p style="font-family:Arial;color:#555;padding:20px">Ouverture de « ' + A.esc(d.titre) + " »…</p>"; } catch (e) {} return w; };
window.dcOuvrir = (id) => { const d = (DOCS || []).find((z) => z.id === id); if (d) ouvrir(d, fenetreVide(d)); };
window.dcRemettre = async (id) => {
  const d = DOCS.find((z) => z.id === id), x = V && trouver(V.pid); if (!d || !x || !peutRemettre()) return;
  const w = fenetreVide(d); // ouverte tout de suite, sinon le navigateur la bloque
  if (!(await ouvrir(d, w))) return;
  try { await enregistrerPrescription(x, { t: "doc", d: D().t, lib: d.titre, docId: d.id, par: document.getElementById("nomMenu").textContent }); A.toast("« " + d.titre + " » noté dans la consultation du jour."); liste(); }
  catch (e) { A.toast("Le document est ouvert, mais n'a pas pu être noté dans la consultation : " + ((e && e.message) || e)); }
};
// Ligne « Doc. » d'une consultation : rouvrir le document
window.docOuvrirLigne = async (docId) => { await lire(); const d = DOCS.find((z) => z.id === docId); if (!d) { A.toast("Ce document a été retiré de la documentation."); return; } ouvrir(d, fenetreVide(d)); };

// ───── Ajouter (PDF), modifier, supprimer, favori : le médecin ─────
let NV = null;
const champs = (d) => {
  const esc = A.esc, cats = [...new Set(CATEGORIES_DOC0.concat((DOCS || []).map((z) => z.cat).filter(Boolean)))];
  return '<div class="form"><div class="large"><label for="dcTitre">Titre</label><input id="dcTitre" value="' + esc(d ? d.titre : "") + '" placeholder="Ex. Conseils pendant la chimiothérapie orale"></div>' +
    '<div class="large"><label for="dcCatF">Catégorie <span class="mesures">(choisir ou écrire)</span></label><input id="dcCatF" list="lDcCat" value="' + esc(d ? d.cat || "" : "") + '" placeholder="Ex. Régimes"></div></div>' +
    '<datalist id="lDcCat">' + cats.map((c) => '<option value="' + esc(c) + '">').join("") + "</datalist>";
};
window.dcAjouter = () => {
  if (!gere()) return; NV = { fichier: null };
  A.fenetre("<h3>Ajouter un document à la documentation</h3>" +
    '<label class="fi-depot" id="dcDepot" for="dcF"><input type="file" id="dcF" accept="application/pdf,.pdf" class="cache-vis"><b>Choisir un PDF</b><span class="mesures">ou le glisser ici · PDF seulement · 25 Mo au plus</span><span id="dcNom" class="fi-nom"></span></label>' +
    champs(null) + '<div class="fi-prog cache" id="dcProg"><div id="dcBarre"></div></div>' +
    '<div class="err" id="fErr"></div><div class="boutons"><button class="bt gris" onclick="dcRetour()">Annuler</button><button class="bt plein" id="dcOk" onclick="dcEnvoyer()">Enregistrer</button></div>');
  const choisir = (f) => {
    if (!f) return;
    if (!/pdf$/i.test(f.type || "") && !/\.pdf$/i.test(f.name)) { A.erreur("Seuls les fichiers PDF sont acceptés."); return; }
    if (f.size > MAX) { A.erreur("Fichier trop lourd (" + taille(f.size) + ") : 25 Mo au plus."); return; }
    NV.fichier = f; A.erreur(""); $("dcNom").textContent = f.name + " · " + taille(f.size);
    if (!A.val("dcTitre")) $("dcTitre").value = f.name.replace(/\.pdf$/i, "").replace(/[_]+/g, " ");
  };
  $("dcF").onchange = () => choisir($("dcF").files[0]);
  const z = $("dcDepot");
  z.ondragover = (e) => { e.preventDefault(); z.classList.add("on"); };
  z.ondragleave = () => z.classList.remove("on");
  z.ondrop = (e) => { e.preventDefault(); z.classList.remove("on"); choisir(e.dataTransfer.files[0]); };
};
window.dcRetour = () => { NV = null; if (V) vue(); else A.fermerFenetre(); };
window.dcEnvoyer = async () => {
  if (!NV || !gere()) return; const f = NV.fichier, titre = A.val("dcTitre"), cat = A.val("dcCatF");
  if (!f) { A.erreur("Choisissez un PDF."); return; }
  if (!titre) { A.erreur("Donnez un titre au document."); return; }
  if ((DOCS || []).some((z) => sansAcc(z.titre) === sansAcc(titre))) { A.erreur("Un document porte déjà ce titre."); return; }
  A.occupe($("dcOk"), true); A.erreur(""); $("dcProg").classList.remove("cache");
  const id = "d" + Date.now().toString(36), nom = f.name.replace(/[\/\\#?\[\]*]/g, "_").slice(-120) || "document.pdf", chemin = "espaces/" + A.ESPACE + "/documentation/" + id + "/" + nom, sr = ref(st(), chemin);
  try {
    await new Promise((ok, ko) => {
      const t = uploadBytesResumable(sr, f, { contentType: "application/pdf", customMetadata: { creePar: D().u.uid } });
      t.on("state_changed", (s) => { const b = $("dcBarre"); if (b && s.totalBytes) b.style.width = Math.round((s.bytesTransferred / s.totalBytes) * 100) + "%"; }, ko, ok);
    });
    try { await modifier((L) => L.push({ id, titre, cat, nom, taille: f.size, chemin, le: D().t, par: document.getElementById("nomMenu").textContent })); }
    catch (e) { await deleteObject(sr).catch(() => {}); throw e; }
    A.toast("Document ajouté à la documentation."); dcRetour();
  } catch (e) { A.occupe($("dcOk"), false); $("dcProg").classList.add("cache"); A.erreur(erreurDroit(e, "ajouter un document") || "Envoi impossible : " + ((e && e.message) || e)); }
};
window.dcFiche = (id) => {
  const d = DOCS.find((z) => z.id === id); if (!d || !gere()) return;
  A.fenetre("<h3>Modifier le document</h3><p class=\"mesures\">" + A.esc(d.nom || "") + " · " + taille(d.taille) + "</p>" + champs(d) +
    '<div class="err" id="fErr"></div><div class="boutons"><button class="bt gris" onclick="dcRetour()">Annuler</button><button class="bt plein" id="dcOk">Enregistrer</button></div>');
  $("dcOk").onclick = async () => {
    const titre = A.val("dcTitre"), cat = A.val("dcCatF");
    if (!titre) { A.erreur("Donnez un titre au document."); return; }
    if (DOCS.some((z) => z.id !== id && sansAcc(z.titre) === sansAcc(titre))) { A.erreur("Un document porte déjà ce titre."); return; }
    A.occupe($("dcOk"), true);
    try { await modifier((L) => { const z = L.find((y) => y.id === id); if (z) Object.assign(z, { titre, cat }); }); A.toast("Document modifié."); dcRetour(); }
    catch (e) { A.occupe($("dcOk"), false); A.erreur(erreurDroit(e, "modifier la documentation") || "Enregistrement impossible : " + ((e && e.message) || e)); }
  };
};
window.dcSupprimer = async (id) => {
  const d = DOCS.find((z) => z.id === id); if (!d || !gere()) return;
  if (!confirm("Supprimer « " + d.titre + " » de la documentation ?\n\nLes mentions « remis » dans les consultations restent, mais le document ne pourra plus être rouvert.")) return;
  try {
    if (d.chemin) await deleteObject(ref(st(), d.chemin)).catch((e) => { if (!e || e.code !== "storage/object-not-found") throw e; });
    await modifier((L) => { const i = L.findIndex((z) => z.id === id); if (i >= 0) L.splice(i, 1); }); A.toast("Document supprimé."); liste();
  } catch (e) { A.toast(erreurDroit(e, "supprimer ce document") || "Suppression impossible : " + ((e && e.message) || e)); }
};
window.dcFavori = async (id) => {
  if (!gere()) return;
  try { await modifier((L) => { const z = L.find((y) => y.id === id); if (z) z.fav = !z.fav; }); liste(); }
  catch (e) { A.toast(erreurDroit(e, "modifier la documentation") || "Modification impossible."); }
};

// ───── Petite flèche : documents déjà remis à ce patient ─────
window.docHistorique = async (pid) => {
  const x = trouver(pid); if (!x) return;
  A.fenetre('<p class="sous">Chargement…</p>', "large"); await Promise.all([lire(), assurerConsultations(x)]); hist(pid);
};
function hist(pid) {
  const x = trouver(pid), esc = A.esc, L = lignesType(pid, "doc").sort((a, b) => (b.l.d || "").localeCompare(a.l.d || ""));
  A.fenetre("<h3>Documentation remise — " + esc(x.r.nm) + "</h3>" +
    (L.length ? '<table class="md-t"><tr><th>Date</th><th>Document</th><th>Remis par</th><th></th></tr>' + L.map(({ l }) => "<tr><td>" + A.dfrA(l.d) + "</td><td><b>" + esc(l.lib || "") + "</b></td><td>" + esc(l.par || "") + '</td><td class="act">' +
      (DOCS.some((d) => d.id === l.docId) ? '<button class="mini" onclick="docOuvrirLigne(\'' + esc(l.docId) + '\')">Ouvrir</button>' : '<span class="mesures">retiré</span>') +
      (peutRemettre() ? '<button class="mini r" onclick="docRetirerMention(\'' + pid + "','" + l.id + '\')">Supprimer</button>' : "") + "</td></tr>").join("") + "</table>"
      : '<p class="sous">Aucun document de la documentation remis à ce patient.</p>') +
    '<div class="boutons"><button class="bt gris" onclick="docFermer(\'' + pid + '\')">Fermer</button></div>', "large");
}
window.docFermer = (pid) => { A.fermerFenetre(); A.pageDossier(pid); };
window.docRetirerMention = async (pid, lid) => {
  const x = trouver(pid); if (!x || !confirm("Retirer cette mention de la consultation ?")) return;
  try { await supprimerPrescription(x, lid); A.toast("Mention retirée."); hist(pid); }
  catch (e) { A.toast(e && e.code === "permission-denied" ? "Vous n'avez pas le droit de modifier cette consultation." : "Suppression impossible."); }
};
