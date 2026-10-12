// Onco360 – documents de radiothérapie (étape 1A bis, 07/10/2026) : pli confidentiel, compte rendu de fin, rendez-vous.
// Plus de fichier Word ni Excel : un clic sur le bouton de la carte radiothérapie ouvre une fenêtre avec le document rempli
// depuis le dossier (feuille A4 modifiable). Médecin et secrétaire (droit « documents ») le modifient, l'impriment (papier à
// en-tête : ni logo ni signature) et l'enregistrent ; un nouveau clic rouvre la version enregistrée.
// espaces/{e}/documentsRT/{patient}_{radiothérapie}_{pli|cr|rdv} = { patientId, etablissementId, rtId, type, html, maj,
// majPar, majParNom }. Mise en page reprise des modèles Word du médecin (modeles/*.docx, gardés comme référence).
import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, updateDoc, query, where, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "../config.js";
import { addJ, ouvre, accordMedecin } from "../moteur/outils.js";
import { finRT, joursSeances, volumesRT, texteVolume, libRythme } from "../moteur/rt.js";
import { assurerConsultations, consultationsDe } from "./consultations.js"; // bilan de contrôle (3.6)
import { diagnosticComplet, tumeurDe } from "../moteur/statut.js"; // fiche tumeur (3.1 bis)
import { nettoyer, modeleRT } from "./ordonnances.js";
import { MODELES_RT0, remplirModele } from "../donnees/modelesrt.js"; // modèles modifiables (12/10/2026)
import { margesMm } from "./reglages.js"; // marges d'impression réglables (Paramètres › Impression)

let A = null;
export function installer(api) { A = api; }
const D = () => A.D();
const $ = (i) => document.getElementById(i);
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const dfrA = (d) => (d ? d.slice(8, 10) + "/" + d.slice(5, 7) + "/" + d.slice(0, 4) : "");
const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const dateLongue = (d) => { const x = new Date(d + "T12:00:00"); return x.getDate() + (x.getDate() === 1 ? "er" : "") + " " + MOIS[x.getMonth()] + " " + x.getFullYear(); };
const vGy = (n) => (n || n === 0 ? String(Math.round(n * 100) / 100).replace(".", ",") : "");
const TECH = { stereo: "Stéréotaxie", vmat: "VMAT", imrt: "IMRT", "3d": "3D conformationnelle" };
export const TITRES_DOC = { pli: "Pli confidentiel", cr: "Compte rendu de fin de traitement", rdv: "Rendez-vous de radiothérapie" };

// Dates des séances : exactement autant de dates que de fractions.
// Traitement terminé (date de fin réelle) : jours de traitement entre la 1re séance et la fin réelle ; s'il y en a trop
// (interruptions), on retire des jours au milieu, répartis régulièrement, en gardant la 1re et la dernière séance.
export function datesSeancesRT(r, ctx) {
  const nb = parseInt(r.nb, 10), F = ctx.feries || [];
  if (!r.deb || !nb) return { dates: [], ajuste: false };
  // 3.5 : jours de séance selon le rythme (moteur/rt.js), une date par fraction (deux le même jour en « 2 par jour »)
  const fin = r.fin || null, l = joursSeances(r, F, fin ? { jusqua: fin } : null).reduce((t, z) => t.concat(Array(z.n).fill(z.d)), []);
  if (fin && l[l.length - 1] !== fin && ouvre(fin, F)) l.push(fin);
  let ajuste = false;
  if (l.length > nb && nb >= 2) {
    const milieu = l.slice(1, -1), garder = nb - 2, pris = [];
    for (let i = 0; i < garder; i++) pris.push(milieu[Math.round((i * (milieu.length - 1)) / Math.max(garder - 1, 1))]);
    const uniques = [...new Set(pris)];
    let k = 0; while (uniques.length < garder && k < milieu.length) { if (uniques.indexOf(milieu[k]) < 0) uniques.push(milieu[k]); k++; }
    uniques.sort(); l.splice(0, l.length, l[0], ...uniques, l[l.length - 1] || fin); ajuste = true;
  }
  return { dates: l, ajuste, manquantes: Math.max(0, nb - l.length) };
}
// Durée : nombre de jours ouvrés nécessaires (1 jour sur 2 en stéréotaxie) ramené en semaines de 5 jours
// (3.5 : séances par semaine selon le rythme : 5, 2,5, 10 en « 2 par jour », 1 par semaine, ou le nombre de jours choisis)
export function dureeSemainesRT(r) {
  const nb = parseInt(r.nb, 10); if (!(nb > 0)) return "";
  const ryt = r.ryt || "1", parSem = ryt === "2" ? 2.5 : ryt === "bid" ? 10 : ryt === "hebdo" ? 1 : ryt === "jours" ? (r.jours || []).length || 5 : 5;
  const sem = Math.max(1, ryt === "2" ? Math.ceil((nb * 2 - 1) / 5) : Math.ceil(nb / parSem));
  return sem + " semaine" + (sem > 1 ? "s" : "") + " (" + nb + " séance" + (nb > 1 ? "s" : "") + (ryt !== "1" ? ", " + libRythme(r) : "") + ")";
}

// ───── Contenu des documents (modèles Word du médecin, en HTML) ─────
// Information absente du dossier : « À REMPLIR » surligné (pli) ou « à compléter par le médecin » en gris (compte rendu)
const AR = (v) => (v ? esc(v) : '<mark class="dc-ar">À REMPLIR</mark>');
const AF = (v) => (v ? esc(v) : '<span class="dc-af">à compléter par le médecin</span>');
const signature = (o) => '<p class="dc-sig"><b>Cachet et signature du médecin</b><br><b>' + AR(o.medecin) + "</b>" + (o.specialite ? "<br>" + esc(o.specialite) : "") + "</p>";
const SAUT = '<div class="dc-saut"></div>';
// 3.6 (12/10/2026, décision de Dr Bentahila) : Onco360 remplit ce qu'il sait : volumes et doses (3.5), dates (fin renseignée, sinon fin
// calculée), prochain rendez-vous (pris dans « + Rendez-vous »), bilan de contrôle (ordonnance d'examens ou d'analyses de la dernière
// consultation), diagnostic complet et localisation (3.1 bis) ; le reste (toxicités, rendez-vous et bilan absents) est complété par le
// médecin (mentions grises jamais imprimées).
function prochainRdv(P, fin, ctx) {
  const apres = fin && fin > ctx.aujourdhui ? fin : ctx.aujourdhui;
  const v = (P.rdvs || []).filter((z) => (z.st || "prevu") === "prevu" && !z.rtc && z.d && z.d >= apres).sort((a, b) => (a.d + (a.h || "")).localeCompare(b.d + (b.h || "")))[0];
  return v ? dfrA(v.d) + (v.h ? " à " + v.h : "") + (v.type ? " – " + v.type : "") : "";
}
function bilanControle(pid, ctx) {
  const c = consultationsDe(pid).filter((z) => z.d && z.d <= ctx.aujourdhui).sort((a, b) => (b.d || "").localeCompare(a.d || "") || (b.o || 0) - (a.o || 0))[0];
  const l = c ? (c.lignes || []).filter((z) => z.t === "exam" || z.t === "analyse").map((z) => String(z.lib || "").trim()).filter(Boolean) : [];
  return l.length ? l.join(" ; ") + " (prescrit le " + dfrA(c.d) + ")" : "";
}
// Valeurs des champs des modèles (donnees/modelesrt.js) : HTML prêt à placer ; vide → « À REMPLIR » (pli, calendrier) ou « à compléter
// par le médecin » (compte rendu), jamais imprimé
function valeursPli(P, r, ctx, o) {
  const acte = (r.acte || "") + (r.acte && r.vmat && !/vmat/i.test(r.acte) ? " + VMAT" : ""), resume = (P.notes || r.note || "").trim().replace(/\s*[.;]\s*$/, "");
  const civ = P.sexe === "F" ? "Madame" : P.sexe === "H" ? "Monsieur" : "", patient = AR(civ) + " " + AR((P.nomF || "").toUpperCase()) + " " + AR(P.prenom || "");
  const diag = diagnosticComplet(P); // localisation, côté, histologie, stade, précision (3.1 bis)
  const ARr = (v) => (v ? esc(v) : '<mark class="dc-ar">À REMPLIR : résumé du patient (dossier)</mark>');
  return { ville: AR(o.ville), ville_maj: AR(String(o.ville || "").toUpperCase()), date_longue: dateLongue(ctx.aujourdhui), patient, acte: AR(acte), duree: AR(dureeSemainesRT(r)),
    // 12/10/2026 : renseignements = le résumé du patient (case « Résumé du patient » du dossier), sinon le diagnostic complet
    renseignements: resume ? esc(resume) : diag ? esc(diag) : ARr(""), soussigne: accordMedecin("soussigné", o.genre), medecin: AR(o.medecin), etablissement: AR(o.etabNom), diagnostic: AR(diag),
    resume: resume ? resume.split(/\n+/).map((l) => "<p>" + esc(l) + "</p>").join("") : "<p>" + ARr("") + "</p>", signature: signature(o) };
}
function valeursCr(P, r, ctx, o) {
  const { dates } = datesSeancesRT(r, ctx), deb = dates[0] || r.deb || "", fin = r.fin || dates[dates.length - 1] || finRT(r, ctx.feries) || "";
  const vol = volumesRT(r), T = tumeurDe(P);
  const nb = parseInt(r.nb, 10) || "", dose = parseFloat(String(r.dose || "").replace(",", ".")), dpf = dose && nb ? Math.round((dose / nb) * 100) / 100 : "";
  const puce = (lib, v, suite) => '<p class="dc-li">•&nbsp; <b>' + lib + " : </b>" + AF(v) + (v && suite ? suite : "") + "</p>";
  return { nom_prenom: AF(((P.nomF || "").toUpperCase() + " " + (P.prenom || "")).trim()), naissance: AF(dfrA(P.ddn)), sexe: AF(P.sexe === "F" ? "Féminin" : P.sexe === "H" ? "Masculin" : ""),
    referent: AF(P.cor || ""), etablissement: AF(o.etabNom || r.hop || P.hop || ""), debut: AF(dfrA(deb)), fin: AF(dfrA(fin)), diagnostic: AF(diagnosticComplet(P)), oms: AF(T.oms),
    resume_clinique: AF(r.note || P.notes || ""), visee: AF(r.intent === "curative" ? "Curative" : r.intent === "palliative" ? "Palliative" : ""), technique: AF(TECH[r.tech] || (r.vmat ? "VMAT" : "")),
    localisation: AF(r.loc || [T.localisation, T.cote ? "côté " + T.cote.toLowerCase() : ""].filter(Boolean).join(", ")),
    doses: vol.length > 1 || (vol[0] && vol[0].nom) ? '<p class="dc-li">•&nbsp; <b>Volumes et doses : </b></p>' + vol.map((v) => '<p class="dc-li">&nbsp;&nbsp;&nbsp;&nbsp;– ' + esc(texteVolume(v, vol)) + "</p>").join("")
      : puce("Dose prescrite", vGy(dose), " <b>Gy</b>") + puce("Dose par fraction", vGy(dpf), " <b>Gy</b>"),
    seances: AF(nb ? String(nb) + (r.ryt && r.ryt !== "1" ? " (" + libRythme(r) + ")" : "") : ""), toxicites: AF(""), prochain_rdv: AF(prochainRdv(P, fin, ctx)), bilan: AF(o.bilan || ""), signature: signature(o) };
}
function valeursRdv(P, r, ctx, o) {
  // 2.5 (12/10/2026, audit) : calendrier théorique (dates calculées, séances réelles suivies dans ARIA) : état « Prévu », plus de
  // « Terminé » inventé ; l'ajustement des dates est imprimé
  const { dates, ajuste } = datesSeancesRT(r, ctx), ressource = String(o.medecin || "").replace(/^Dr\.?\s*/i, "");
  return { debut: dfrA(dates[0]), fin: dfrA(dates[dates.length - 1]), patient: esc((P.nomF || "").toUpperCase() + (P.prenom ? ", " + P.prenom : "")), medecin: AR(o.medecin), radiotherapie: AR(r.acte || ""),
    tableau_seances: '<table class="dc-tab dc-rdv"><tbody><tr><th>Date du rendez-vous</th><th>Durée (min)</th><th>Activité</th><th>Ressource</th><th>État du rendez-vous</th></tr>' +
      dates.map((d, i) => "<tr><td>" + dfrA(d) + "</td><td>" + (i === 0 ? 15 : 20) + "</td><td>" + (i === 0 ? "Mise en place RA" : i === dates.length - 1 ? "Fin de Traitement RA" : "Traitement Journalier RA") + "</td><td>" + esc(ressource) + "</td><td>Prévu</td></tr>").join("") + "</tbody></table>",
    note_calendrier: "Dates calculées d'après le calendrier (jours ouvrés, jours fériés exclus)" + (ajuste ? ", ajustées au nombre de fractions" : "") + ". Les séances réellement faites sont suivies par le service de radiothérapie." };
}

// ───── Documents enregistrés : une fiche par radiothérapie et par type ─────
const col = () => collection(db, "espaces", A.ESPACE, "documentsRT");
const idDoc = (pid, rid, type) => pid + "_" + rid + "_" + type;
const DOCS = {}; // documents enregistrés par patient : { idDoc: { maj, majParNom } } ; absent = à lire
export function oublierDocs(pid) { delete DOCS[pid]; }
// Liste des documents enregistrés d'un patient (pour cocher les boutons) ; relue à l'ouverture du dossier
export function docsDe(x, quandLu) {
  if (x.id in DOCS) return DOCS[x.id];
  DOCS[x.id] = {};
  const f = [where("patientId", "==", x.id)]; if (!D().membre.tousEtablissements) f.push(where("etablissementId", "==", x.doc.etablissementId || ""));
  getDocs(query(col(), ...f)).then((s) => { const o = {}; s.docs.forEach((d) => { o[d.id] = { majLe: d.data().majLe || "", majParNom: d.data().majParNom || "" }; }); DOCS[x.id] = o; if (s.docs.length && quandLu) quandLu(); }).catch((e) => console.warn("documentsRT", e));
  return DOCS[x.id];
}
// Bouton d'un document dans la carte radiothérapie : coché s'il a déjà été enregistré
export function boutonDoc(x, r, type, lib) {
  const e = (DOCS[x.id] || {})[idDoc(x.id, r.id, type)];
  return '<button data-fn="documents.rt rt.documents" class="mini' + (e ? " doc-ok" : "") + '" onclick="docRT(\'' + x.id + "','" + r.id + "','" + type + '\')"' + (e ? ' title="Enregistré' + (e.majLe ? " le " + dfrA(e.majLe) : "") + (e.majParNom ? " par " + esc(e.majParNom) : "") + ' : un clic le rouvre"' : "") + ">" + (e ? '<svg class="pi"><use href="#i-check"/></svg>' : "") + lib + "</button>";
}

// ───── Fenêtre du document ─────
let F = null; // { pid, rid, type }
function infos(x, r) {
  const et = (D().etabsTous || D().etabs).find((e) => e.code === (r.hop || x.doc.etablissementId)) || {}, M = A.medecinFiche() || {};
  // ville du lieu (Paramètres › Lieux d'exercice) ; vide : « À REMPLIR » (1.7 : plus de « Casablanca » par défaut) ; genre du médecin (accords)
  return { medecin: M.nom || "", specialite: M.specialite || "", etabNom: et.nom || "", ville: et.ville || "", genre: M.genre || "" };
}
// Document neuf : le modèle du cabinet (Bibliothèques › Courriers, modèles « radiothérapie »), sinon celui d'origine, rempli pour le patient
const MOD = {}; // modèles lus : { pli, cr, rdv }
function contenuNeuf(x, r, type) {
  const o = Object.assign(infos(x, r), { bilan: bilanControle(x.id, D().ctx) }), ctx = D().ctx;
  const V = type === "pli" ? valeursPli(x.P, r, ctx, o) : type === "cr" ? valeursCr(x.P, r, ctx, o) : valeursRdv(x.P, r, ctx, o);
  return remplirModele(MOD[type] || MODELES_RT0[type], V);
}
window.docRT = async (pid, rid, type) => {
  if (!A.peut("documents")) { A.toast("Vous n'avez pas le droit d'ouvrir les documents."); return; }
  const x = D().patients.find((p) => p.id === pid), r = x && (x.P.rts || []).find((v) => v.id === rid); if (!r) return;
  if (type === "rdv" && !datesSeancesRT(r, D().ctx).dates.length) { A.toast("Indiquez la date de la 1re séance et le nombre de fractions."); return; }
  A.fenetre('<p class="sous">Ouverture du document…</p>', "large");
  if (type === "cr") await assurerConsultations(x).catch(() => null); // bilan de contrôle de la dernière consultation (3.6)
  MOD[type] = await modeleRT(type).catch(() => null); // modèle modifié par le cabinet (12/10/2026)
  const s = await getDoc(doc(col(), idDoc(pid, rid, type))).catch(() => null), e = s && s.exists() ? s.data() : null;
  F = { pid, rid, type, enreg: e };
  vue(x, r, e ? nettoyer(e.html) : contenuNeuf(x, r, type)); // version enregistrée nettoyée à l'affichage (audit du 10/10)
};
function vue(x, r, html) {
  const e = F.enreg, d = F.type === "rdv" ? datesSeancesRT(r, D().ctx) : null;
  A.fenetre("<h3>" + TITRES_DOC[F.type] + " — " + esc(x.r.nm) + "</h3>" +
    '<p class="mesures" style="margin:0 0 8px">' + esc(r.acte || "Radiothérapie") + " · " +
    (e ? "version enregistrée le " + dfrA(e.majLe) + (e.majParNom ? " par " + esc(e.majParNom) : "") : "nouveau document rempli depuis le dossier : complétez les mentions surlignées, puis enregistrez") +
    (d && d.ajuste ? " · dates ajustées au nombre de fractions" : "") + (d && d.manquantes ? " · attention : " + d.manquantes + " séance(s) manquent avant la fin réelle" : "") + "</p>" +
    '<div class="or-outils"><button class="ico" title="Gras" aria-label="Gras" onmousedown="event.preventDefault()" onclick="orStyle(\'bold\')"><b>G</b></button><button class="ico" title="Souligné" aria-label="Souligné" onmousedown="event.preventDefault()" onclick="orStyle(\'underline\')"><u>S</u></button>' +
    (e ? '<span class="sep"></span><button class="bt gris petit" onclick="dcRepartir()" title="Remplacer le texte par un document neuf, rempli avec les informations actuelles du dossier">Repartir du dossier</button>' : "") + "</div>" +
    '<div class="or-zone"><div id="dcPage" class="or-feuille a4 dc" contenteditable="true" spellcheck="true"></div></div>' +
    '<div class="err" id="fErr"></div><div class="boutons"><button class="bt gris" onclick="dcFermer()">Fermer</button><button class="bt clair" id="dcOk" onclick="dcEnregistrer(false)">Enregistrer</button><button class="bt plein" id="dcImp" onclick="dcEnregistrer(true)">' + A.ic("imprimer") + "Enregistrer + Imprimer</button></div>", "large");
  $("dcPage").innerHTML = html;
  $("dcPage").querySelectorAll(".dc-saut").forEach((z) => z.setAttribute("contenteditable", "false"));
}
window.dcFermer = () => { const pid = F && F.pid; F = null; A.fermerFenetre(); if (pid) A.pageDossier(pid); };
window.dcRepartir = () => {
  if (!F || !confirm("Remplacer le texte par un document neuf, rempli avec les informations actuelles du dossier ?\n\nVos modifications ne seront perdues que si vous enregistrez ensuite.")) return;
  const x = D().patients.find((p) => p.id === F.pid), r = x && (x.P.rts || []).find((v) => v.id === F.rid); if (!r) return;
  $("dcPage").innerHTML = contenuNeuf(x, r, F.type); $("dcPage").querySelectorAll(".dc-saut").forEach((z) => z.setAttribute("contenteditable", "false"));
};
// Impression A4, sur papier à en-tête : marges de la page (haut laissé libre), saut de page entre les parties du pli
function imprimer(w, html) {
  // 2.5 : les mentions « À REMPLIR » / « à compléter par le médecin » ne s'impriment pas (avertissement avant, dcEnregistrer)
  const css = ".dc .dc-ar,.dc .dc-af{display:none}@page{size:A4 portrait;margin:" + margesMm("doc") + "}html,body{margin:0}body{font-family:Arial,Helvetica,sans-serif;font-size:11pt;line-height:1.4;color:#000;-webkit-print-color-adjust:exact;print-color-adjust:exact}" + CSS_DOC;
  w.document.open(); w.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>&#8203;</title><style>' + css + '</style></head><body><div class="dc">' + html + "</div></body></html>"); w.document.close();
  setTimeout(() => { try { w.focus(); w.print(); } catch (e) {} }, 400);
}
// Mise en page commune (fenêtre et impression)
const CSS_DOC = ".dc p{margin:0 0 7px}.dc .dc-titre{text-align:center;font-weight:bold;font-size:15pt;margin:4px 0 16px}.dc .dc-cr{font-size:14pt}.dc .dc-d{text-align:right;margin-bottom:14px}.dc .dc-c{text-align:center}.dc .dc-g{font-size:13pt}" +
  ".dc .dc-rub{font-weight:bold;border-bottom:1px solid #9AA3B5;padding-bottom:3px;margin:14px 0 6px}.dc .dc-h{font-weight:bold;font-size:12pt;margin:14px 0 6px}.dc .dc-li{margin-left:14px}.dc .dc-sig{text-align:right;margin-top:22px;margin-bottom:60px;break-inside:avoid;page-break-inside:avoid;break-before:avoid;page-break-before:avoid}.dc .dc-note{font-size:9pt;color:#555;margin-top:6px}" +
  ".dc .dc-ar{background:#FFF200;font-weight:bold}.dc .dc-af{color:#8A8A8A;font-style:italic}.dc .dc-saut{page-break-before:always;break-before:page;height:0}" +
  ".dc .dc-tab{width:100%;border-collapse:collapse;margin:4px 0 8px}.dc .dc-tab th,.dc .dc-tab td{border:1px solid #8C8C8C;padding:5px 7px;vertical-align:top;text-align:left}.dc .dc-tab th{background:#DCE6F2}.dc .dc-tab td p{margin:0 0 3px}" +
  ".dc .dc-rdv th{background:#2B2D5C;color:#fff;font-size:10pt}.dc .dc-rdv td{font-size:10pt;padding:3px 7px}";
window.dcEnregistrer = async (imp) => {
  if (!F) return; const x = D().patients.find((p) => p.id === F.pid), r = x && (x.P.rts || []).find((v) => v.id === F.rid); if (!r) return;
  const html = nettoyer($("dcPage").innerHTML);
  // 2.5 : mentions encore à compléter → avertissement avant d'imprimer (elles ne s'impriment pas)
  const reste = $("dcPage").querySelectorAll(".dc-ar, .dc-af").length;
  if (imp && reste && !confirm("Il reste " + reste + " mention" + (reste > 1 ? "s" : "") + " à compléter (« À REMPLIR » ou « à compléter par le médecin »).\nElle" + (reste > 1 ? "s" : "") + " ne s'imprimeront pas : la ligne restera vide.\n\nEnregistrer et imprimer quand même ?")) return;
  let w = null; if (imp) { try { w = window.open("", "_blank"); } catch (e) { w = null; } }
  ["dcOk", "dcImp"].forEach((i) => A.occupe($(i), true));
  try {
    const nom = document.getElementById("nomMenu").textContent;
    await setDoc(doc(col(), idDoc(F.pid, F.rid, F.type)), { patientId: F.pid, etablissementId: x.doc.etablissementId || "", rtId: F.rid, type: F.type, html, majLe: D().t, maj: serverTimestamp(), majPar: D().u.uid, majParNom: nom });
    (DOCS[F.pid] = DOCS[F.pid] || {})[idDoc(F.pid, F.rid, F.type)] = { majLe: D().t, majParNom: nom };
    A.journal(x, TITRES_DOC[F.type] + " enregistré (" + (r.acte || "radiothérapie") + ")");
    if (imp) { if (w) imprimer(w, html); else A.toast("Impression bloquée par le navigateur : autorisez les fenêtres pour Onco360, puis rouvrez le document."); }
    const pid = F.pid; F = null; A.fermerFenetre(); if (!imp || w) A.toast("Document enregistré : un clic sur son bouton le rouvre."); A.pageDossier(pid);
  } catch (e) {
    if (w) try { w.close(); } catch (er) {}
    ["dcOk", "dcImp"].forEach((i) => A.occupe($(i), false));
    A.erreur(e && e.code === "permission-denied" ? "Vous n'avez pas le droit d'enregistrer ce document." : "Enregistrement impossible : " + ((e && e.message) || e));
  }
};
// Style de la feuille à l'écran (même mise en page qu'à l'impression)
(() => { const st = document.createElement("style"); st.textContent = CSS_DOC.replace(/(\d+(?:\.\d+)?)pt/g, (m, n) => Math.round(n * 1.333) + "px") + ".or-feuille.dc{font-size:14.5px}.or-feuille.dc .dc-saut{height:0;border-top:2px dashed #C9D2E2;margin:26px 0;position:relative}.or-feuille.dc .dc-saut::after{content:'Page suivante';position:absolute;top:-9px;left:50%;transform:translateX(-50%);background:#fff;padding:0 8px;color:#A6AEBE;font-size:11px}@media (max-width:640px){.or-feuille.dc .dc-rdv th,.or-feuille.dc .dc-rdv td{font-size:10.5px;padding:3px 3px;word-break:break-word}.or-feuille.dc .dc-tab th,.or-feuille.dc .dc-tab td{padding:4px}}"; document.head.appendChild(st); })();

// ───── Suivi du dossier ─────
// Hôpital du patient changé : ses documents suivent ; patient supprimé : ses documents aussi
export async function suivreEtablissementDocs(x, etab) {
  const s = await getDocs(query(col(), where("patientId", "==", x.id))).catch(() => null); if (!s) return;
  for (const d of s.docs) if (d.data().etablissementId !== etab) await updateDoc(d.ref, { etablissementId: etab, maj: serverTimestamp(), majPar: D().u.uid }).catch((e) => console.warn("documentsRT", d.id, e));
}
export async function supprimerDocs(x) {
  const s = await getDocs(query(col(), where("patientId", "==", x.id))).catch(() => null); if (!s) return;
  for (const d of s.docs) await deleteDoc(d.ref).catch((e) => console.warn("documentsRT", d.id, e));
  delete DOCS[x.id];
}
