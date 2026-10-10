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
// Document affiché dans l'aperçu (19.7 ter, 10/10/2026) : pid → id ; fichiers déjà lus : id → adresse locale (blob)
const SEL = {}, URLS = {};
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
    // Fenêtre coupée en deux : la liste à gauche, l'aperçu du document choisi à droite (sur téléphone : l'un sous l'autre)
    (L.length ? '<div class="fi-split"><div id="fiListe" class="fi-g">' + listeHtml(x) + '</div><div class="fi-v" id="fiVue"></div></div>' : '<div id="fiListe">' + listeHtml(x) + "</div>");
  if (L.length) setTimeout(() => afficherVue(x), 0); // aperçu rempli une fois la page affichée
  return h;
}
// Document choisi : celui cliqué, sinon le premier de la liste filtrée
const visibles = (x) => { const L = FI[x.id] || [], F = FQ[x.id] || { q: "", t: "" }, mots = sansAcc(F.q).split(/\s+/).filter(Boolean);
  return L.filter((f) => (!F.t || f.type === F.t) && mots.every((w) => sansAcc([f.titre, f.type, f.nom, f.creeParNom].join(" ")).indexOf(w) >= 0)); };
const choisi = (x) => { const V = visibles(x); return V.find((f) => f.id === SEL[x.id]) || V[0] || null; };
const genre = (f) => { const i = icone(f); return i === "PDF" ? "pdf" : i === "IMG" ? "img" : ""; };
async function afficherVue(x) {
  const z = $("fiVue"); if (!z) return; const f = choisi(x), esc = A.esc;
  if (!f) { z.innerHTML = '<p class="sous" style="margin:12px">Aucun document à afficher.</p>'; return; }
  // Aperçu seul (sans en-tête, qui doublait la liste) ; actions dans le menu « ⋯ » flottant, en bas à droite de l'aperçu
  SEL[x.id] = f.id; const qf = "'" + x.id + "','" + f.id + "'", it = (lib, fn, cls) => '<button class="' + (cls || "") + '" onclick="fiMenu(false);' + fn + "(" + qf + ')">' + lib + "</button>";
  z.innerHTML = '<div class="fi-vc" id="fiVueC"><p class="sous" style="margin:12px">Chargement du document…</p></div>' +
    '<div class="fi-menu"><div class="fi-mm cache" id="fiMm" role="menu"><span class="t" title="' + esc(f.titre || f.nom) + '">' + esc(f.titre || f.nom) + "</span>" + it("Plein écran", "fiPleinEcran") + it("Nouvelle fenêtre", "fiOuvrir") + it("Télécharger", "fiTelecharger") + (peutDeposer() ? it("Modifier (nom, date, type)", "fiModifier") : "") + (peutSupprimer(f) ? it("Supprimer", "fiSupprimer", "r") : "") + "</div>" +
    '<button class="fi-mb" onclick="fiMenu()" title="Nouvelle fenêtre, télécharger, modifier, supprimer" aria-label="Actions sur le document" aria-haspopup="menu">⋯</button></div>';
  const g = genre(f);
  if (!g) { $("fiVueC").innerHTML = '<div class="fi-sans"><span class="fi-ic fi-' + icone(f).toLowerCase() + '">' + icone(f) + "</span><p>Aperçu impossible pour ce type de fichier (" + esc(f.nom) + ').</p><p class="mesures">Utilisez « Télécharger » ou « Nouvelle fenêtre ».</p></div>'; return; }
  try {
    if (!URLS[f.id]) { const b = await lireFichier(f); URLS[f.id] = URL.createObjectURL(b.type ? b : new Blob([b], { type: f.mime || (g === "pdf" ? "application/pdf" : "image/jpeg") })); }
    const c = $("fiVueC"); if (!c || SEL[x.id] !== f.id) return; // un autre document a été choisi entre-temps
    c.innerHTML = g === "pdf" ? '<iframe src="' + URLS[f.id] + '" title="' + esc(f.titre || f.nom) + '"></iframe>' : '<img src="' + URLS[f.id] + '" alt="' + esc(f.titre || f.nom) + '">';
  } catch (e) { const c = $("fiVueC"); if (c) c.innerHTML = '<p class="err" style="margin:12px">' + esc(e && /unauthorized|permission/.test(e.code || "") ? "Vous n'avez pas accès à ce document." : "Aperçu impossible : " + ((e && e.message) || e)) + "</p>"; }
}
// Plein écran (19.7 ter) : l'aperçu prend tout l'écran (la barre d'outils du lecteur PDF a toute la place) ; Échap pour revenir
window.fiPleinEcran = () => { const v = $("fiVue"); if (!v) return; if (document.fullscreenElement) document.exitFullscreen(); else if (v.requestFullscreen) v.requestFullscreen().catch(() => A.toast("Plein écran refusé par le navigateur : utilisez « Nouvelle fenêtre »."));
  else if (v.webkitRequestFullscreen) v.webkitRequestFullscreen(); else A.toast("Plein écran non disponible : utilisez « Nouvelle fenêtre »."); };
window.fiMenu = (ouvrir) => { const m = $("fiMm"); if (m) m.classList.toggle("cache", ouvrir === false ? true : !m.classList.contains("cache")); };
window.fiChoisir = (pid, id) => { const x = trouver(pid); if (!x) return; SEL[pid] = id; document.querySelectorAll("#fiListe .fi").forEach((e) => e.classList.toggle("on", e.dataset.id === id)); afficherVue(x); };
const icone = (f) => { const m = String(f.mime || ""), n = sansAcc(f.nom); return /pdf/.test(m) || /\.pdf$/.test(n) ? "PDF" : /^image\//.test(m) ? "IMG" : /word|officedocument\.wordprocessing|msword/.test(m) || /\.docx?$/.test(n) ? "DOC" : /sheet|excel/.test(m) || /\.xlsx?$/.test(n) ? "XLS" : "FIC"; };
const taille = (o) => (o >= 1048576 ? (o / 1048576).toFixed(1).replace(".", ",") + " Mo" : Math.max(1, Math.round(o / 1024)) + " Ko");
function listeHtml(x) {
  const esc = A.esc, L = FI[x.id] || [], F = FQ[x.id] || { q: "", t: "" };
  const mots = sansAcc(F.q).split(/\s+/).filter(Boolean);
  const V = L.filter((f) => (!F.t || f.type === F.t) && mots.every((w) => sansAcc([f.titre, f.type, f.nom, f.creeParNom].join(" ")).indexOf(w) >= 0));
  if (!L.length) return '<p class="vide-c">Aucun document dans ce dossier.' + (peutDeposer() ? " « Ajouter un document » pour en déposer un (PDF, Word, photo…)." : "") + "</p>";
  if (!V.length) return '<p class="vide-c">Aucun document ne correspond' + (F.t ? " (type « " + esc(F.t) + " »)" : "") + ".</p>";
  const sel = choisi(x);
  return (V.length < L.length ? '<p class="mesures" style="margin:8px 0 0">' + V.length + " document" + (V.length > 1 ? "s" : "") + " sur " + L.length + "</p>" : "") + '<div class="fi-liste">' + V.map((f) => {
    // une seule ligne : titre, date, type (150 documents restent lisibles ; la liste défile à la hauteur de l'aperçu)
    return '<button type="button" class="fi' + (sel && sel.id === f.id ? " on" : "") + '" data-id="' + esc(f.id) + '" title="' + esc((f.titre || f.nom) + " · " + f.nom + " · " + taille(f.taille || 0) + (f.creeParNom ? " · déposé par " + f.creeParNom : "")) + '" onclick="fiChoisir(\'' + x.id + "','" + f.id + '\')"><b>' + esc(f.titre || f.nom) + '</b><span class="d">' + esc(A.dfrA(f.d)) + "</span>" + (f.type ? '<span class="badge b-gr">' + esc(f.type) + "</span>" : "") + "</button>";
  }).join("") + "</div>";
}
// Recherche et filtre : seule la liste est redessinée (le curseur reste dans la recherche)
window.fiFiltre = (pid) => { const x = trouver(pid); if (!x) return; FQ[pid] = { q: $("fiQ") ? $("fiQ").value : "", t: $("fiT") ? $("fiT").value : "" }; const avant = SEL[pid]; $("fiListe").innerHTML = listeHtml(x); const c = choisi(x); if (!c || c.id !== avant) afficherVue(x); };

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
    '<label class="fi-depot" id="fiDepot" for="fiF"><input type="file" id="fiF" class="cache-vis" multiple><b>Choisir un ou plusieurs fichiers</b><span class="mesures">ou les glisser ici · tout est enregistré en PDF (photos, Word .docx, Excel convertis) · 25 Mo au plus par fichier</span><span id="fiNom" class="fi-nom"></span></label>' +
    '<label class="chk cache" id="fiPdfZ" style="margin:8px 0 2px"><input type="checkbox" id="fiPdf" checked> Regrouper les images en un seul document PDF (une page par image, dans l\'ordre des noms de fichiers)</label>' +
    champs(null, types) + '<p class="mesures cache" id="fiPlus" style="margin:-4px 0 6px">Plusieurs fichiers : chacun est enregistré avec son nom comme titre, le type et la date choisis ci-dessus.</p>' +
    '<div class="fi-prog cache" id="fiProg"><div id="fiBarre"></div></div><p class="mesures cache" id="fiEtape" style="margin:4px 0 0"></p>' +
    '<div class="err" id="fErr"></div><div class="boutons"><button class="bt gris" id="fiAnn" onclick="fiAnnuler()">Annuler</button><button class="bt plein" id="fiOk" onclick="fiEnvoyer()">Enregistrer</button></div>');
  const choisir = (liste) => {
    const L = [...(liste || [])]; if (!L.length) return;
    const lourds = L.filter((f) => f.size > MAX), autres = L.filter((f) => f.size <= MAX && !convertible(f)), ok = L.filter((f) => f.size <= MAX && convertible(f));
    A.erreur([lourds.length ? "Trop lourd (25 Mo au plus) : " + lourds.map((f) => f.name + " (" + taille(f.size) + ")").join(", ") + "." : "", autres.length ? "Format non convertible en PDF ici : " + autres.map((f) => f.name).join(", ") + ". Ouvrez-le et enregistrez-le en PDF (Word : Fichier › Enregistrer sous › PDF), puis déposez le PDF." : ""].filter(Boolean).join(" "));
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
  return pdfDePages(P);
}
// PDF à partir de pages déjà en JPEG [{ data, w, h }] (A4 portrait ou paysage selon la page)
function pdfDePages(P) {
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
// ───── Tout en PDF (11/10/2026, décision de Dr Bentahila) : photos, Word (.docx), Excel (.xlsx, .xls, .csv, .ods), texte convertis
// dans le navigateur avant l'envoi ; anciens formats illisibles ici (.doc, PowerPoint…) refusés avec la marche à suivre ─────
const ext = (f) => (String(f.name || "").match(/\.([a-z0-9]+)$/i) || ["", ""])[1].toLowerCase();
const estPdf = (f) => /pdf/i.test(f.type || "") || ext(f) === "pdf";
const estWord = (f) => ext(f) === "docx";
const estTableur = (f) => ["xlsx", "xls", "csv", "ods", "xlsm"].indexOf(ext(f)) >= 0;
const estTexte = (f) => ext(f) === "txt" || (/^text\/plain/.test(f.type || "") && ext(f) !== "rtf");
const convertible = (f) => estPdf(f) || estImage(f) || estWord(f) || estTableur(f) || estTexte(f);
const SCRIPTS = {};
const script = (url) => SCRIPTS[url] || (SCRIPTS[url] = new Promise((ok, ko) => { const e = document.createElement("script"); e.src = url; e.onload = ok; e.onerror = () => { delete SCRIPTS[url]; ko(new Error("Outil de conversion indisponible (connexion ?)")); }; document.head.appendChild(e); }));
const CDN = "https://cdnjs.cloudflare.com/ajax/libs/";
// Page HTML (Word, tableur, texte) → images A4 → PDF : mise en page à 96 ppp (A4 = 794 × 1123 px), coupée entre deux lignes de texte
async function htmlEnPdf(html, paysage) {
  await script(CDN + "html2canvas/1.4.1/html2canvas.min.js");
  const W = paysage ? 1123 : 794, H = paysage ? 794 : 1123, d = document.createElement("div");
  d.style.cssText = "position:fixed;left:-20000px;top:0;width:" + W + "px;padding:0 52px;box-sizing:border-box;background:#fff;color:#000;font:12.5px/1.45 Arial,Helvetica,sans-serif";
  d.innerHTML = '<style>.cv img{max-width:100%}.cv table{border-collapse:collapse;max-width:100%}.cv td,.cv th{border:1px solid #999;padding:3px 6px;font-size:11px;vertical-align:top}.cv p{margin:0 0 6px}.cv h1,.cv h2,.cv h3{margin:8px 0}.cv pre{white-space:pre-wrap;font:12px/1.4 Arial}</style><div class="cv">' + html + "</div>";
  document.body.appendChild(d);
  try {
    // marges de 48 px en haut et en bas de chaque page ; hp = hauteur de texte par page
    const k = 1.6, c = await window.html2canvas(d, { scale: k, backgroundColor: "#ffffff", logging: false, useCORS: true }), g = c.getContext("2d"), mg = 48 * k, hp = H * k - 2 * mg, P = [];
    // ligne blanche la plus proche au-dessus de la coupe (pour ne pas couper une ligne de texte en deux)
    const coupe = (y) => { for (let z = y; z > y - 160 * k && z > 0; z -= 2) { const px = g.getImageData(0, z, c.width, 1).data; let blanc = true; for (let i = 0; i < px.length; i += 16) if (px[i] < 235 || px[i + 1] < 235 || px[i + 2] < 235) { blanc = false; break; } if (blanc) return z; } return y; };
    for (let y = 0; y < c.height - 2;) {
      const fin = y + hp >= c.height ? c.height : coupe(y + hp), h = Math.max(1, fin - y), pc = document.createElement("canvas");
      pc.width = c.width; pc.height = H * k; const pg = pc.getContext("2d"); pg.fillStyle = "#fff"; pg.fillRect(0, 0, pc.width, pc.height); pg.drawImage(c, 0, y, c.width, h, 0, mg, c.width, h);
      const b = await new Promise((ok) => pc.toBlob(ok, "image/jpeg", 0.8)); P.push({ data: new Uint8Array(await b.arrayBuffer()), w: pc.width, h: pc.height }); y = fin;
    }
    return pdfDePages(P);
  } finally { d.remove(); }
}
const echapper = (t) => String(t).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
async function enPdf(f) {
  if (estPdf(f)) return f;
  const nom = String(f.name || "document").replace(/\.[^.]+$/, "") + ".pdf";
  let b;
  if (estImage(f)) b = await imagesEnPdf([f]);
  else if (estWord(f)) { await script(CDN + "mammoth/1.6.0/mammoth.browser.min.js"); const r = await window.mammoth.convertToHtml({ arrayBuffer: await f.arrayBuffer() }); b = await htmlEnPdf(r.value || "<p>(document vide)</p>"); }
  else if (estTableur(f)) {
    await script(CDN + "xlsx/0.18.5/xlsx.full.min.js");
    // CSV : lu comme texte UTF-8, valeurs gardées telles quelles (pas de dates retraduites) ; Excel : tel qu'affiché dans le fichier
    const wb = ext(f) === "csv" ? window.XLSX.read(await f.text(), { type: "string", raw: true }) : window.XLSX.read(await f.arrayBuffer(), { type: "array" });
    const html = wb.SheetNames.map((n) => (wb.SheetNames.length > 1 ? "<h3>" + echapper(n) + "</h3>" : "") + window.XLSX.utils.sheet_to_html(wb.Sheets[n], { header: "", footer: "" })).join("");
    b = await htmlEnPdf(html, true);
  } else if (estTexte(f)) b = await htmlEnPdf("<pre>" + echapper(await f.text()) + "</pre>");
  else throw new Error("« " + f.name + " » : ce format ne peut pas être converti en PDF ici. Ouvrez-le et enregistrez-le en PDF (Word : Fichier › Enregistrer sous › PDF), puis déposez le PDF.");
  if (b.size > MAX) throw new Error("« " + f.name + " » donne un PDF trop lourd (" + taille(b.size) + ") : 25 Mo au plus.");
  return new File([b], nom, { type: "application/pdf" });
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
  SEL[x.id] = r.id; // le document déposé s'affiche dans l'aperçu
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
      $("fiEtape").classList.remove("cache"); $("fiEtape").textContent = (plusieurs ? "Fichier " + (faits + 1) + " / " + L.length + " : " : "") + (estPdf(fl) ? "envoi de " : "conversion en PDF de ") + fl.name + "…"; $("fiBarre").style.width = "0%";
      const pf = await enPdf(fl); // tout est enregistré en PDF
      await envoyerUn(x, pf, plusieurs ? titreDe(fl) : titre, d, type); faits++;
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
