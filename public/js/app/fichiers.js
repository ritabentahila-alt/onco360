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
// Plusieurs fichiers d'un coup (19.7, 10/10/2026) : même type et même date ; un seul fichier → titre libre, plusieurs → titre = nom du fichier
window.fiAjouter = async (pid) => {
  const x = trouver(pid); if (!x || !peutDeposer()) return; NV = { pid, fichiers: [] };
  const types = await typesDocuments();
  A.fenetre("<h3>Ajouter des documents — " + A.esc(x.r.nm) + "</h3>" +
    '<label class="fi-depot" id="fiDepot" for="fiF"><input type="file" id="fiF" class="cache-vis" multiple><b>Choisir un ou plusieurs fichiers</b><span class="mesures">ou les glisser ici · PDF, Word, photo (JPEG, PNG…) ou autre · 25 Mo au plus par fichier</span><span id="fiNom" class="fi-nom"></span></label>' +
    '<label class="chk cache" id="fiPdfZ" style="margin:8px 0 2px"><input type="checkbox" id="fiPdf" checked> Regrouper les images en un seul document PDF (une page par image, dans l\'ordre des noms de fichiers)</label>' +
    champs(null, types) + '<p class="mesures cache" id="fiPlus" style="margin:-4px 0 6px">Plusieurs fichiers : chacun est enregistré avec son nom comme titre, le type et la date choisis ci-dessus.</p>' +
    '<div class="fi-prog cache" id="fiProg"><div id="fiBarre"></div></div><p class="mesures cache" id="fiEtape" style="margin:4px 0 0"></p>' +
    '<div class="err" id="fErr"></div><div class="boutons"><button class="bt gris" id="fiAnn" onclick="fiAnnuler()">Annuler</button><button class="bt plein" id="fiOk" onclick="fiEnvoyer()">Enregistrer</button></div>');
  const choisir = (liste) => {
    const L = [...(liste || [])]; if (!L.length) return;
    const lourds = L.filter((f) => f.size > MAX), ok = L.filter((f) => f.size <= MAX);
    A.erreur(lourds.length ? "Trop lourd (25 Mo au plus) : " + lourds.map((f) => f.name + " (" + taille(f.size) + ")").join(", ") + "." : "");
    NV.fichiers = ok.slice().sort((a, b) => a.name.localeCompare(b.name, "fr", { numeric: true })); const n = ok.length;
    $("fiNom").innerHTML = NV.fichiers.map((f) => A.esc(f.name) + " · " + taille(f.size)).join("<br>");
    // plusieurs images (photos d'une bio de 4 pages…) : regroupées en un seul PDF par défaut (19.7 bis, 10/10/2026)
    const images = n > 1 && NV.fichiers.every(estImage); $("fiPdfZ").classList.toggle("cache", !images); if (!images) $("fiPdf").checked = false; else $("fiPdf").checked = true;
    majPlus();
  };
  const majPlus = () => {
    const n = NV.fichiers.length, pdf = n > 1 && $("fiPdf").checked, zt = $("fiTitre") && $("fiTitre").closest("div");
    if (zt) zt.classList.toggle("cache", n > 1 && !pdf); $("fiPlus").classList.toggle("cache", n < 2 || pdf);
    if ((n === 1 || pdf) && !A.val("fiTitre")) $("fiTitre").value = n === 1 ? titreDe(NV.fichiers[0]) : "";
    $("fiOk").textContent = pdf ? "Enregistrer le PDF (" + n + " pages)" : n > 1 ? "Enregistrer les " + n + " documents" : "Enregistrer";
  };
  $("fiPdf").onchange = majPlus;
  $("fiF").onchange = () => choisir($("fiF").files);
  const z = $("fiDepot");
  z.ondragover = (e) => { e.preventDefault(); z.classList.add("on"); };
  z.ondragleave = () => z.classList.remove("on");
  z.ondrop = (e) => { e.preventDefault(); z.classList.remove("on"); choisir(e.dataTransfer.files); };
};
const estImage = (f) => /^image\/(jpeg|png|webp|gif|bmp|heic|heif)$/i.test(f.type || "") || /\.(jpe?g|png|webp|gif|bmp|heic|heif)$/i.test(f.name || "");
// Images → un PDF (une page A4 par image, portrait ou paysage selon l'image, marges 20 pt) ; chaque image est réduite (2000 px au
// plus, JPEG) : PDF écrit ici, sans bibliothèque extérieure
function enJpeg(f) {
  return new Promise((ok, ko) => {
    const u = URL.createObjectURL(f), img = new Image();
    img.onerror = () => { URL.revokeObjectURL(u); ko(new Error("Image illisible : " + f.name + " (format non pris en charge par le navigateur ?)")); };
    img.onload = () => {
      const k = Math.min(1, 2000 / Math.max(img.naturalWidth, img.naturalHeight)), c = document.createElement("canvas");
      c.width = Math.max(1, Math.round(img.naturalWidth * k)); c.height = Math.max(1, Math.round(img.naturalHeight * k));
      const g = c.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(u);
      c.toBlob((b) => { if (!b) { ko(new Error("Conversion impossible : " + f.name)); return; } b.arrayBuffer().then((a) => ok({ data: new Uint8Array(a), w: c.width, h: c.height })); }, "image/jpeg", 0.85);
    };
    img.src = u;
  });
}
export async function imagesEnPdf(fichiers) {
  const P = []; for (const f of fichiers) P.push(await enJpeg(f));
  const te = new TextEncoder(), parts = [], offs = []; let len = 0;
  const push = (x) => { const b = typeof x === "string" ? te.encode(x) : x; parts.push(b); len += b.length; };
  const obj = (n, f) => { offs[n] = len; push(n + " 0 obj\n"); f(); push("\nendobj\n"); };
  push("%PDF-1.4\n"); push(new Uint8Array([37, 226, 227, 207, 211, 10]));
  obj(1, () => push("<< /Type /Catalog /Pages 2 0 R >>"));
  obj(2, () => push("<< /Type /Pages /Kids [" + P.map((_, i) => 3 + 3 * i + " 0 R").join(" ") + "] /Count " + P.length + " >>"));
  P.forEach((p, i) => {
    const pay = p.w > p.h, W = pay ? 842 : 595, H = pay ? 595 : 842, m = 20, k = Math.min((W - 2 * m) / p.w, (H - 2 * m) / p.h), dw = p.w * k, dh = p.h * k;
    const c = "q " + dw.toFixed(2) + " 0 0 " + dh.toFixed(2) + " " + ((W - dw) / 2).toFixed(2) + " " + ((H - dh) / 2).toFixed(2) + " cm /Im" + i + " Do Q";
    obj(3 + 3 * i, () => push("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 " + W + " " + H + "] /Resources << /XObject << /Im" + i + " " + (5 + 3 * i) + " 0 R >> >> /Contents " + (4 + 3 * i) + " 0 R >>"));
    obj(4 + 3 * i, () => push("<< /Length " + c.length + " >>\nstream\n" + c + "\nendstream"));
    obj(5 + 3 * i, () => { push("<< /Type /XObject /Subtype /Image /Width " + p.w + " /Height " + p.h + " /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length " + p.data.length + " >>\nstream\n"); push(p.data); push("\nendstream"); });
  });
  const nb = 3 + 3 * P.length, x0 = len;
  push("xref\n0 " + nb + "\n0000000000 65535 f \n" + Array.from({ length: nb - 1 }, (_, i) => String(offs[i + 1]).padStart(10, "0") + " 00000 n \n").join(""));
  push("trailer\n<< /Size " + nb + " /Root 1 0 R >>\nstartxref\n" + x0 + "\n%%EOF\n");
  return new Blob(parts, { type: "application/pdf" });
}
const titreDe = (fl) => fl.name.replace(/\.[^.]+$/, "").replace(/[_]+/g, " ");
let TACHE = null;
window.fiAnnuler = () => { if (TACHE) try { TACHE.cancel(); } catch (e) {} TACHE = null; NV = null; A.fermerFenetre(); };
// Un fichier : envoi dans le stockage, puis fiche du document (retirée du stockage si la fiche est refusée)
async function envoyerUn(x, fl, titre, d, type) {
  const r = doc(col()), nom = fl.name.replace(/[\/\\#?\[\]*]/g, "_").slice(-120) || "document";
  const chemin = "espaces/" + A.ESPACE + "/patients/" + x.id + "/fichiers/" + r.id + "/" + nom, sr = ref(st(), chemin);
  await new Promise((ok, ko) => {
    TACHE = uploadBytesResumable(sr, fl, { contentType: fl.type || "application/octet-stream", customMetadata: { creePar: D().u.uid, patientId: x.id } });
    TACHE.on("state_changed", (s) => { const b = $("fiBarre"); if (b && s.totalBytes) b.style.width = Math.round((s.bytesTransferred / s.totalBytes) * 100) + "%"; }, ko, ok);
  });
  TACHE = null;
  const f = { patientId: x.id, etablissementId: x.doc.etablissementId || "", titre, d, type, nom, taille: fl.size, mime: fl.type || "", chemin, o: Date.now(), creePar: D().u.uid, creeParNom: nomConnecte(), cree: serverTimestamp(), majPar: D().u.uid, majParNom: nomConnecte(), maj: serverTimestamp() };
  try { await setDoc(r, f); } catch (e) { await deleteObject(sr).catch(() => {}); throw e; }
  FI[x.id] = (FI[x.id] || []).concat([Object.assign({ id: r.id }, f)]).sort(tri);
  A.journal(x, "Document ajouté (" + type + ") : " + titre);
}
window.fiEnvoyer = async () => {
  if (!NV) return; const x = trouver(NV.pid), L = NV.fichiers || []; if (!x) return;
  const pdf = L.length > 1 && $("fiPdf") && $("fiPdf").checked, plusieurs = L.length > 1 && !pdf, titre = A.val("fiTitre"), d = A.val("fiDate"), type = A.val("fiType");
  if (!L.length) { A.erreur("Choisissez un fichier."); return; }
  if (!plusieurs && !titre) { A.erreur("Donnez un titre au document" + (pdf ? " PDF (ex. Bilan biologique du 12/10)." : ".")); return; }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) { A.erreur("Indiquez la date du document."); return; }
  if (!type) { A.erreur("Choisissez le type de document."); return; }
  A.occupe($("fiOk"), true); A.erreur(""); $("fiProg").classList.remove("cache");
  let faits = 0;
  try {
    if (pdf) {
      $("fiEtape").classList.remove("cache"); $("fiEtape").textContent = "Préparation du PDF (" + L.length + " pages)…";
      const b = await imagesEnPdf(L); if (b.size > MAX) throw new Error("PDF trop lourd (" + taille(b.size) + ") : 25 Mo au plus. Déposez les images en plusieurs fois.");
      $("fiEtape").textContent = "Envoi du PDF (" + taille(b.size) + ")…";
      await envoyerUn(x, new File([b], (titre.replace(/[\/\\#?\[\]*:"<>|]/g, " ").trim().slice(0, 100) || "document") + ".pdf", { type: "application/pdf" }), titre, d, type);
      NV = null; A.fermerFenetre(); A.toast("Document PDF (" + L.length + " pages) ajouté au dossier."); A.pageDossier(x.id); return;
    }
    for (const fl of L) {
      if (plusieurs) { $("fiEtape").classList.remove("cache"); $("fiEtape").textContent = "Fichier " + (faits + 1) + " / " + L.length + " : " + fl.name; $("fiBarre").style.width = "0%"; }
      await envoyerUn(x, fl, plusieurs ? titreDe(fl) : titre, d, type); faits++;
    }
    NV = null; A.fermerFenetre(); A.toast(plusieurs ? faits + " documents ajoutés au dossier." : "Document ajouté au dossier."); A.pageDossier(x.id);
  } catch (e) {
    TACHE = null; A.occupe($("fiOk"), false); $("fiProg").classList.add("cache");
    if (faits) { NV.fichiers = L.slice(faits); A.pageDossier(x.id); }
    if (e && e.code === "storage/canceled") return;
    A.erreur((faits ? faits + " fichier(s) enregistré(s). " : "") + (e && /unauthorized|permission/.test(e.code || "") ? "Vous n'avez pas le droit de déposer un document dans ce dossier." : "Envoi impossible : " + ((e && e.message) || e)));
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
