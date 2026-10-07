// Onco360 – médicaments et ordonnance (étape 1C, 07/10/2026), bouton « Médic. » de l'onglet Consultation.
// Bibliothèque du cabinet : espaces/{e}/bibliotheques/medicaments = { data: JSON [{ id, nom, poso, classe }] } ; tant qu'elle
// n'existe pas, la liste de départ (donnees/medicaments.js) est affichée, et la 1re modification (+, ✎, ✕) l'enregistre.
// Ordonnance : médicaments choisis par double-clic, affichée sur une feuille A5 ou A4 modifiable (papier à en-tête : le haut
// de la feuille reste vide), signée au nom du médecin (celui de la secrétaire si c'est elle qui la fait), enregistrée en
// ligne « Médic. » dans la consultation du jour (consultations.js).
// Antécédents (petite flèche, étape 1D) : dates à gauche, ordonnance au centre ; Imprimer · Supprimer · Modifier (même date,
// la ligne de sa consultation suit) · Renouveler (nouvelle ordonnance à la date du jour) · Fermer.
import { doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "../config.js";
import { MEDICAMENTS0 } from "../donnees/medicaments.js";
import { enregistrerPrescription, trouverLigne, assurerConsultations, prescriptionsDe, supprimerPrescription, FAMILLES } from "./consultations.js";

let A = null;
export function installer(api) { A = api; }
const D = () => A.D();
const $ = (i) => document.getElementById(i);
const trouver = (pid) => D().patients.find((p) => p.id === pid);
const peutEcrire = () => A.peut("ecrireConsultations");
const sansAcc = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const alpha = (a, b) => sansAcc(a.nom).localeCompare(sansAcc(b.nom));
const ico = (n) => '<svg class="pi"><use href="#i-' + n + '"/></svg>';

// ───── Bibliothèque des médicaments du cabinet ─────
const refBib = () => doc(db, "espaces", A.ESPACE, "bibliotheques", "medicaments");
const depart = () => MEDICAMENTS0.map((m, i) => ({ id: "m" + (i + 1), nom: m[0], poso: m[1], classe: m[2] || "" }));
let BIB = null;
async function chargerBib() {
  if (BIB) return BIB;
  const s = await getDoc(refBib()).catch(() => null);
  BIB = s && s.exists() ? JSON.parse(s.data().data || "[]") : depart();
  return BIB;
}
// Modification : relue juste avant (un autre poste a pu modifier la liste), puis enregistrée en entier
async function modifierBib(fn) {
  const s = await getDoc(refBib()).catch(() => null), L = s && s.exists() ? JSON.parse(s.data().data || "[]") : depart();
  fn(L); L.sort(alpha);
  await setDoc(refBib(), { data: JSON.stringify(L), maj: serverTimestamp(), majPar: D().u.uid });
  BIB = L;
}

// ───── Fenêtre « Médicaments » : recherche, liste, ordonnance en préparation ─────
let S = null; // { pid, q, items: [{ nom, poso }], modif (ordonnance enregistrée qu'on modifie) }
window.ordMedicaments = async (pid) => {
  const x = trouver(pid); if (!x || !peutEcrire()) return;
  S = { pid, q: "", items: [] };
  A.fenetre('<p class="sous">Chargement des médicaments…</p>', "large");
  await chargerBib(); vueListe();
};
function vueListe() {
  const x = trouver(S.pid);
  A.fenetre("<h3>" + (S.modif ? "Modifier l'ordonnance du " + A.dfrA(S.modif.d) : "Médicaments") + " — " + A.esc(x.r.nm) + "</h3>" +
    '<div class="md-barre"><div class="recherche">' + A.ic("loupe") + '<input id="mdQ" type="search" autocomplete="off" placeholder="Rechercher un médicament, une posologie, une classe…" value="' + A.esc(S.q) + '"></div>' +
    '<button class="bt clair petit" onclick="mdFiche()">' + A.ic("plus") + "Nouveau médicament</button></div>" +
    '<div class="md-liste" id="mdListe"></div><p class="mesures" style="margin:6px 0 0">Double-cliquez sur un médicament (ou touchez ' + ico("plus") + ") pour l'ajouter à l'ordonnance.</p>" +
    '<h4 class="soustitre">Ordonnance</h4><div id="mdOrdo" class="md-ordo"></div>' +
    '<div class="boutons"><button class="bt gris" onclick="fermerFenetre()">Annuler</button><button class="bt plein" onclick="mdAfficher()">Afficher l\'ordonnance</button></div>', "large");
  $("mdQ").oninput = () => { S.q = $("mdQ").value; liste(); };
  liste(); ordo();
  setTimeout(() => { const q = $("mdQ"); if (q) q.focus(); }, 60);
}
function liste() {
  const mots = sansAcc(S.q).split(/\s+/).filter(Boolean);
  const L = BIB.filter((m) => { const t = sansAcc(m.nom + " " + m.poso + " " + m.classe); return mots.every((w) => t.indexOf(w) >= 0); });
  $("mdListe").innerHTML = L.length ? '<table class="md-t"><tr><th>Médicament</th><th>Posologie</th><th></th></tr>' + L.map((m) => {
    const q = "'" + m.id + "'";
    return '<tr class="m" ondblclick="mdAjouter(' + q + ')"><td><b>' + A.esc(m.nom) + "</b>" + (m.classe ? '<div class="cl">' + A.esc(m.classe) + "</div>" : "") + "</td><td>" + A.esc(m.poso) + '</td><td class="act">' +
      '<button class="ico vert" title="Ajouter à l\'ordonnance" aria-label="Ajouter ' + A.esc(m.nom) + ' à l\'ordonnance" onclick="mdAjouter(' + q + ')">' + ico("plus") + "</button>" +
      '<button class="ico" title="Modifier" aria-label="Modifier ' + A.esc(m.nom) + '" onclick="mdFiche(' + q + ')">' + ico("crayon") + "</button>" +
      '<button class="ico rouge" title="Supprimer de la liste" aria-label="Supprimer ' + A.esc(m.nom) + '" onclick="mdSupprimer(' + q + ')">' + ico("croix") + "</button></td></tr>";
  }).join("") + "</table>" : '<p class="sous" style="padding:12px">Aucun médicament ne correspond. « Nouveau médicament » pour l\'ajouter à la liste.</p>';
}
function ordo() {
  $("mdOrdo").innerHTML = S.items.length ? S.items.map((it, i) => '<div class="it"><b class="n">' + (i + 1) + '/</b><div class="tx"><b>' + A.esc(it.nom) + '</b><div class="mesures">' + A.esc(it.poso) + "</div></div>" +
    '<div class="actr"><button class="ico" title="Monter" aria-label="Monter" onclick="mdBouger(' + i + ',-1)"' + (i ? "" : " disabled") + ">↑</button>" +
    '<button class="ico" title="Descendre" aria-label="Descendre" onclick="mdBouger(' + i + ',1)"' + (i < S.items.length - 1 ? "" : " disabled") + ">↓</button>" +
    '<button class="ico rouge" title="Retirer de l\'ordonnance" aria-label="Retirer" onclick="mdRetirer(' + i + ')">' + ico("croix") + "</button></div></div>").join("")
    : '<p class="sous" style="margin:0">Aucun médicament choisi : « Afficher l\'ordonnance » donnera une ordonnance vierge, à remplir à la main.</p>';
}
window.mdAjouter = (id) => { const m = BIB.find((z) => z.id === id); if (!m || !S) return; S.items.push({ nom: m.nom, poso: m.poso }); ordo(); A.toast(m.nom + " ajouté à l'ordonnance."); };
window.mdRetirer = (i) => { S.items.splice(i, 1); ordo(); };
window.mdBouger = (i, s) => { const j = i + s; if (j < 0 || j >= S.items.length) return; const t = S.items[i]; S.items[i] = S.items[j]; S.items[j] = t; ordo(); };

// Nouveau médicament / modifier : nom, posologie, classe thérapeutique
window.mdFiche = (id) => {
  const m = id ? BIB.find((z) => z.id === id) : null, classes = [...new Set(BIB.map((z) => z.classe).filter(Boolean))].sort();
  A.fenetre("<h3>" + (m ? "Modifier le médicament" : "Nouveau médicament") + "</h3>" +
    '<div class="form"><div class="large"><label for="mdNom">Nom du médicament</label><input id="mdNom" value="' + A.esc(m ? m.nom : "") + '" placeholder="Ex. ABIRATÉRONE 250 mg"></div>' +
    '<div class="large"><label for="mdPoso">Posologie</label><textarea id="mdPoso" rows="3" placeholder="Ex. 4 comprimés par jour le matin pendant 1 mois">' + A.esc(m ? m.poso : "") + "</textarea></div>" +
    '<div class="large"><label for="mdClasse">Classe thérapeutique <span class="mesures">(facultatif)</span></label><input id="mdClasse" list="lMdClasse" value="' + A.esc(m ? m.classe : "") + '"></div></div>' +
    '<datalist id="lMdClasse">' + classes.map((c) => '<option value="' + A.esc(c) + '">').join("") + "</datalist>" +
    '<div class="err" id="fErr"></div><div class="boutons"><button class="bt gris" onclick="mdRetour()">Annuler</button><button class="bt plein" id="mdOk">Valider</button></div>');
  $("mdOk").onclick = async () => {
    const nom = A.val("mdNom"), poso = A.val("mdPoso"), classe = A.val("mdClasse");
    if (!nom) { A.erreur("Indiquez le nom du médicament."); return; }
    if (BIB.some((z) => z.id !== (m && m.id) && sansAcc(z.nom) === sansAcc(nom) && sansAcc(z.poso) === sansAcc(poso))) { A.erreur("Ce médicament, avec cette posologie, est déjà dans la liste."); return; }
    A.occupe($("mdOk"), true);
    try {
      await modifierBib((L) => { const z = m && L.find((y) => y.id === m.id); if (z) Object.assign(z, { nom, poso, classe }); else L.push({ id: "m" + Date.now().toString(36), nom, poso, classe }); });
      A.toast(m ? "Médicament modifié." : "Médicament ajouté à la liste."); mdRetour();
    } catch (e) { A.occupe($("mdOk"), false); A.erreur(e && e.code === "permission-denied" ? "Vous n'avez pas le droit de modifier la liste des médicaments." : "Enregistrement impossible : " + ((e && e.message) || e)); }
  };
};
window.mdRetour = () => { if (S) vueListe(); else A.fermerFenetre(); };
window.mdSupprimer = async (id) => {
  const m = BIB.find((z) => z.id === id); if (!m || !confirm("Retirer « " + m.nom + " » de la liste des médicaments ?\n\nLes ordonnances déjà faites ne changent pas.")) return;
  try { await modifierBib((L) => { const i = L.findIndex((y) => y.id === id); if (i >= 0) L.splice(i, 1); }); A.toast("Médicament retiré de la liste."); liste(); }
  catch (e) { A.toast(e && e.code === "permission-denied" ? "Vous n'avez pas le droit de modifier la liste des médicaments." : "Suppression impossible."); }
};

// ───── L'ordonnance : feuille A5 / A4 modifiable, Valider / Valider + Imprimer / Fermer ─────
const fmtStock = () => { try { return localStorage.getItem("onco360.formatOrdo") === "A4" ? "A4" : "A5"; } catch (e) { return "A5"; } };
const dateFr = (d) => d.slice(8, 10) + "/" + d.slice(5, 7) + "/" + d.slice(0, 4);
const civilite = (x) => (x.P.sexe === "F" ? "Mme " : x.P.sexe === "H" ? "M. " : "");
const medecin = () => { const n = (A.medecinFiche() || {}).nom || ""; return n || "Dr "; };
// Contenu de départ : date à droite, patient, médicaments numérotés (nom souligné, posologie dessous), signature
function contenu(x, items, d, med) {
  const e = A.esc;
  return '<p class="or-date">Le ' + dateFr(d) + "</p>" +
    '<p class="or-pat"><b>' + e(civilite(x) + x.r.nm) + "</b></p>" +
    (items.length ? items.map((it, i) => '<p class="or-m"><b><u>' + (i + 1) + "/ " + e(it.nom) + "</u></b></p>" + '<p class="or-p">' + e(it.poso).replace(/\n/g, "<br>") + "</p>").join("") : "<p><br></p>".repeat(8)) +
    '<p class="or-sig">Cachet et signature du médecin :<br><b>' + e(med) + "</b></p>";
}
// Le texte modifié est nettoyé avant d'être gardé : seulement du texte, gras, souligné, italique, retours à la ligne, tableaux
// (documents de radiothérapie) ; classes de mise en page or-… (ordonnance) et dc-… (documents) uniquement
const BALISES = { B: 1, STRONG: 1, U: 1, I: 1, EM: 1, BR: 1, P: 1, DIV: 1, SPAN: 1, UL: 1, OL: 1, LI: 1, MARK: 1, TABLE: 1, THEAD: 1, TBODY: 1, TR: 1, TD: 1, TH: 1 };
function propre(n) {
  const f = document.createDocumentFragment();
  n.childNodes.forEach((c) => {
    if (c.nodeType === 3) { f.appendChild(document.createTextNode(c.textContent)); return; }
    if (c.nodeType !== 1 || /^(SCRIPT|STYLE|IFRAME|OBJECT|EMBED|SVG|TEMPLATE)$/i.test(c.tagName)) return;
    if (!BALISES[c.tagName]) { f.appendChild(propre(c)); return; }
    const e = document.createElement(c.tagName), cl = String(c.getAttribute("class") || "").split(/\s+/).filter((k) => /^(or|dc)-[a-z]+$/.test(k));
    if (cl.length) e.className = cl.join(" ");
    const ta = c.style && c.style.textAlign; if (/^(left|right|center|justify)$/.test(ta || "")) e.style.textAlign = ta;
    e.appendChild(propre(c)); f.appendChild(e);
  });
  return f;
}
export const nettoyer = (html) => { const t = document.createElement("template"); t.innerHTML = html; const d = document.createElement("div"); d.appendChild(propre(t.content)); return d.innerHTML; };
// Libellé de la ligne « Médic. » de la consultation : les médicaments de l'ordonnance (ou le début du texte)
function libelle(html) {
  const d = document.createElement("div"); d.innerHTML = html;
  const noms = [...d.querySelectorAll(".or-m")].map((p) => p.textContent.replace(/^\s*\d+\s*\/\s*/, "").trim()).filter(Boolean);
  if (noms.length) return noms.join(" ; ");
  [".or-date", ".or-pat", ".or-sig"].forEach((s) => d.querySelectorAll(s).forEach((p) => p.remove()));
  const t = d.textContent.replace(/\s+/g, " ").trim();
  return t ? (t.length > 140 ? t.slice(0, 140) + "…" : t) : "Ordonnance vierge";
}

let O = null; // ordonnance ouverte : { pid, t, ligne (si déjà enregistrée), format, taille, lecture }
window.mdAfficher = () => {
  if (!S) return; const x = trouver(S.pid), l = S.modif;
  // Modification : même date de prescription, même signataire, même format ; la ligne de sa consultation sera mise à jour
  if (l) ouvrirOrdonnance({ pid: S.pid, t: l.t, ligne: l, html: contenu(x, S.items, l.d, l.med || medecin()), format: l.format || "A5", taille: l.taille || 0 });
  else ouvrirOrdonnance({ pid: S.pid, t: "medic", html: contenu(x, S.items, D().t, medecin()), format: fmtStock(), taille: 0 });
};
// Médicaments d'une ordonnance enregistrée, relus sur la feuille (avec les corrections faites à la main) : nom + posologie
function medicamentsDe(html) {
  const d = document.createElement("div"); d.innerHTML = html; const L = [];
  d.querySelectorAll("br").forEach((b) => b.replaceWith("\n"));
  [...d.children].forEach((p) => {
    if (p.classList.contains("or-m")) L.push({ nom: p.textContent.replace(/^\s*\d+\s*\/\s*/, "").trim(), poso: "" });
    else if (L.length && !p.classList.contains("or-sig") && !p.classList.contains("or-date") && !p.classList.contains("or-pat")) { const t = p.textContent; const z = L[L.length - 1]; z.poso = (z.poso ? z.poso + "\n" : "") + String(t).trim(); }
  });
  L.forEach((z) => { z.poso = z.poso.replace(/\n{2,}/g, "\n").trim(); });
  return L.filter((z) => z.nom);
}
// Une ordonnance déjà enregistrée (clic sur sa ligne dans la consultation) : ses antécédents, elle sélectionnée
window.ordVoir = (pid, cid, lid) => { const l = trouverLigne(pid, cid, lid); if (l) window.ordAntecedents(pid, l.t, lid); };

// ───── Antécédents des prescriptions d'une famille ─────
const peutSupprimer = () => peutEcrire(); // médecin et secrétaire (07/10/2026)
// Date de l'ordonnance remplacée par celle du jour ; signature remplacée par le médecin du jour (renouvellement)
function auJour(html, signer) {
  const d = document.createElement("div"); d.innerHTML = html;
  let p = d.querySelector(".or-date"); if (!p) { p = document.createElement("p"); p.className = "or-date"; d.prepend(p); }
  p.textContent = "Le " + dateFr(D().t);
  if (signer) { const g = d.querySelector(".or-sig"); if (g) g.innerHTML = "Cachet et signature du médecin :<br><b>" + A.esc(medecin()) + "</b>"; }
  return d.innerHTML;
}
let H = null; // { pid, t, sel }
window.ordAntecedents = async (pid, t, sel) => {
  const x = trouver(pid); if (!x) return;
  H = { pid, t, sel: sel || null }; S = null;
  A.fenetre('<p class="sous">Chargement des antécédents…</p>', "large");
  await assurerConsultations(x); vueAntecedents();
};
function vueAntecedents() {
  const x = trouver(H.pid), f = FAMILLES.find((z) => z.t === H.t) || { titre: "Prescriptions" }, L = prescriptionsDe(H.pid, H.t);
  if (!L.some((o) => o.l.id === H.sel)) H.sel = L[0] ? L[0].l.id : null;
  const o = L.find((z) => z.l.id === H.sel), ok = peutEcrire();
  const bt = (lib, fn, cls, icone) => '<button class="bt ' + (cls || "gris") + '" onclick="' + fn + '"' + (o ? "" : " disabled") + ">" + (icone ? A.ic(icone) : "") + lib + "</button>";
  A.fenetre("<h3>Antécédents — " + A.esc(f.titre) + " — " + A.esc(x.r.nm) + "</h3>" +
    (L.length ? '<div class="an"><div class="an-l" role="listbox" aria-label="Ordonnances">' + L.map(({ l }) => '<button role="option" aria-selected="' + (l.id === H.sel) + '" class="' + (l.id === H.sel ? "on" : "") + '" onclick="anChoisir(\'' + l.id + '\')"><b>' + A.dfrA(l.d) + "</b>" + (l.dm && l.dm !== l.d ? '<span class="mesures">modifiée le ' + A.dfrA(l.dm) + "</span>" : "") + "<span>" + A.esc(l.lib || "") + "</span></button>").join("") + "</div>" +
      '<div class="an-d"><div class="or-zone"><div class="or-feuille ' + String((o && o.l.format) || "A5").toLowerCase() + '" style="font-size:' + (((o && o.l.format) === "A4" ? 15 : 14) + ((o && o.l.taille) || 0)) + 'px">' + (o ? o.l.html : "") + "</div></div>" +
      (o ? '<p class="mesures" style="margin:6px 0 0">Édition ' + A.esc(o.l.format || "A5") + " · faite par " + A.esc(o.l.par || "") + (o.l.med ? " · signée " + A.esc(o.l.med) : "") + "</p>" : "") + "</div>" +
      '<div class="an-b">' + (ok ? bt("Imprimer", "anImprimer()", "clair", "imprimer") + (peutSupprimer() ? bt("Supprimer", "anSupprimer()", "gris rouge-t") : "") + bt("Modifier", "anModifier()", "gris") + bt("Renouveler", "anRenouveler()", "plein") : "") +
      '<button class="bt gris" onclick="anFermer()">Fermer</button></div></div>'
      : '<p class="sous">Aucune ordonnance (' + A.esc(f.titre.toLowerCase()) + ') pour ce patient.</p><div class="boutons"><button class="bt gris" onclick="anFermer()">Fermer</button></div>'), "large");
}
const choisie = () => { const o = H && prescriptionsDe(H.pid, H.t).find((z) => z.l.id === H.sel); return o && o.l; };
window.anChoisir = (id) => { H.sel = id; vueAntecedents(); };
window.anFermer = () => { const pid = H && H.pid; H = null; A.fermerFenetre(); if (pid) A.pageDossier(pid); };
window.anImprimer = () => { const l = choisie(); if (!l) return; let w = null; try { w = window.open("", "_blank"); } catch (e) { w = null; } if (w) imprimer(w, l.html, l.format || "A5", l.taille || 0); else A.toast("Impression bloquée par le navigateur : autorisez les fenêtres pour Onco360."); };
window.anSupprimer = async () => {
  const l = choisie(), x = H && trouver(H.pid); if (!l || !x || !peutSupprimer()) return;
  if (!confirm("Supprimer l'ordonnance du " + A.dfrA(l.d) + " ?\n\n« " + (l.lib || "") + " »\n\nElle disparaît aussi de sa consultation.")) return;
  try { await supprimerPrescription(x, l.id); A.toast("Ordonnance supprimée."); H.sel = null; vueAntecedents(); }
  catch (e) { A.toast(e && e.code === "permission-denied" ? "Vous n'avez pas le droit de supprimer cette ordonnance." : "Suppression impossible."); }
};
// Modifier : la même ordonnance, à sa date de prescription ; enregistrée, elle change aussi dans sa consultation
// (rouvre la liste des médicaments avec ceux de l'ordonnance : ajouter, retirer, réordonner, puis « Afficher l'ordonnance »)
window.anModifier = async () => {
  const l = choisie(); if (!l || !peutEcrire()) return; const pid = H.pid; H = null;
  // ordonnance écrite à la main (sans médicament de la liste) : elle s'ouvre telle quelle, pour ne rien perdre
  if (l.t !== "medic" || !medicamentsDe(l.html).length) { ouvrirOrdonnance({ pid, t: l.t, ligne: l, html: l.html, format: l.format || "A5", taille: l.taille || 0 }); return; }
  S = { pid, q: "", items: medicamentsDe(l.html), modif: l };
  A.fenetre('<p class="sous">Chargement des médicaments…</p>', "large"); await chargerBib(); vueListe();
};
// Renouveler : une nouvelle ordonnance du jour, même contenu, signée par le médecin du jour
window.anRenouveler = () => { const l = choisie(); if (!l || !peutEcrire()) return; const pid = H.pid; H = null; ouvrirOrdonnance({ pid, t: l.t, renouv: l, html: auJour(l.html, true), format: l.format || "A5", taille: l.taille || 0 }); };
function ouvrirOrdonnance(o) {
  O = o; const x = trouver(o.pid), l = o.ligne;
  A.fenetre("<h3>Ordonnance — " + A.esc(x.r.nm) + (l ? ' <span class="mesures">(du ' + A.dfrA(l.d) + ", modification)</span>" : o.renouv ? ' <span class="mesures">(renouvellement de celle du ' + A.dfrA(o.renouv.d) + ")</span>" : "") + "</h3>" +
    '<div class="or-outils"><div class="ag-vues" role="radiogroup" aria-label="Format">' + ["A5", "A4"].map((f) => '<button role="radio" aria-checked="' + (o.format === f) + '" class="' + (o.format === f ? "on" : "") + '" onclick="orFormat(\'' + f + '\')">Édition ' + f + "</button>").join("") + "</div>" +
    (o.lecture ? "" : '<span class="sep"></span><button class="ico" title="Gras" aria-label="Gras" onmousedown="event.preventDefault()" onclick="orStyle(\'bold\')"><b>G</b></button><button class="ico" title="Souligné" aria-label="Souligné" onmousedown="event.preventDefault()" onclick="orStyle(\'underline\')"><u>S</u></button>' +
      '<button class="ico" title="Texte plus petit" aria-label="Texte plus petit" onclick="orTaille(-1)">A−</button><button class="ico" title="Texte plus grand" aria-label="Texte plus grand" onclick="orTaille(1)">A+</button>') + "</div>" +
    (o.lecture ? "" : '<p class="mesures" style="margin:0 0 8px">L\'ordonnance reste modifiable : cliquez dans la feuille pour corriger le texte. Le haut de la feuille est laissé libre pour l\'en-tête du papier.</p>') +
    '<div class="or-zone"><div id="orPage" class="or-feuille" ' + (o.lecture ? "" : 'contenteditable="true" spellcheck="true"') + "></div></div>" +
    '<div class="err" id="fErr"></div><div class="boutons"><button class="bt gris" onclick="orFermer()">Fermer</button>' +
    (o.lecture ? "" : '<button class="bt clair" id="orOk" onclick="orValider(false)">Valider</button><button class="bt plein" id="orImp" onclick="orValider(true)">' + A.ic("imprimer") + "Valider + Imprimer</button>") + "</div>", "large");
  $("orPage").innerHTML = o.html; miseEnPage();
}
function miseEnPage() { const p = $("orPage"); if (!p) return; p.className = "or-feuille " + O.format.toLowerCase(); p.style.fontSize = (O.format === "A4" ? 15 : 14) + O.taille + "px"; }
window.orFormat = (f) => {
  if (!O) return; O.format = f; try { localStorage.setItem("onco360.formatOrdo", f); } catch (e) {}
  document.querySelectorAll(".or-outils [role=radio]").forEach((b) => { const on = b.textContent.indexOf(f) >= 0; b.classList.toggle("on", on); b.setAttribute("aria-checked", on); });
  miseEnPage();
};
window.orStyle = (c) => { try { document.execCommand(c, false, null); } catch (e) {} };
window.orTaille = (s) => { if (!O) return; O.taille = Math.max(-4, Math.min(6, O.taille + s)); miseEnPage(); };
window.orFermer = () => { O = null; A.fermerFenetre(); };

// Impression : feuille seule, sans en-tête (papier à en-tête), au format choisi
function imprimer(w, html, format, taille) {
  const a4 = format === "A4", pt = (a4 ? 12 : 11) + taille * 0.75;
  const css = "@page{size:" + (a4 ? "A4" : "A5") + " portrait;margin:0}html,body{margin:0}body{font-family:Arial,Helvetica,sans-serif;color:#000;-webkit-print-color-adjust:exact;print-color-adjust:exact}" +
    ".pg{padding:" + (a4 ? "48mm 20mm 18mm" : "36mm 13mm 12mm") + ";font-size:" + pt + "pt;line-height:1.45}.or-date{text-align:right;margin:0 0 6mm}.or-pat{margin:0 0 7mm}.or-m{margin:4mm 0 1mm}.or-p{margin:0 0 0 6mm}.or-sig{margin-top:10mm;text-align:right}p{margin:0 0 1.5mm}";
  w.document.open(); w.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>&#8203;</title><style>' + css + '</style></head><body><div class="pg">' + html + "</div></body></html>"); w.document.close();
  setTimeout(() => { try { w.focus(); w.print(); } catch (e) {} }, 400);
}
window.orValider = async (imp) => {
  if (!O || O.lecture) return; const x = trouver(O.pid); if (!x) return;
  const html = nettoyer($("orPage").innerHTML);
  // La fenêtre d'impression s'ouvre tout de suite (sinon le navigateur la bloque après l'enregistrement)
  let w = null; if (imp) { try { w = window.open("", "_blank"); } catch (e) { w = null; } }
  ["orOk", "orImp"].forEach((i) => A.occupe($(i), true));
  try {
    const l = O.ligne;
    await enregistrerPrescription(x, Object.assign(l ? { id: l.id, d: l.d, dm: D().t, med: l.med, par: l.par } : { t: O.t, d: D().t, med: medecin(), par: document.getElementById("nomMenu").textContent }, { t: O.t, lib: libelle(html), html, format: O.format, taille: O.taille }));
    if (imp) { if (w) imprimer(w, html, O.format, O.taille); else A.toast("Impression bloquée par le navigateur : autorisez les fenêtres pour Onco360, puis réimprimez depuis la consultation."); }
    const pid = O.pid, renouv = !!O.renouv; O = null; S = null; A.fermerFenetre(); A.toast(l ? "Ordonnance modifiée (et dans sa consultation)." : renouv ? "Ordonnance renouvelée dans la consultation du jour." : "Ordonnance enregistrée dans la consultation du jour."); A.pageDossier(pid);
  } catch (e) {
    if (w) try { w.close(); } catch (er) {}
    ["orOk", "orImp"].forEach((i) => A.occupe($(i), false));
    A.erreur(e && e.code === "permission-denied" ? "Vous n'avez pas le droit d'enregistrer une ordonnance." : "Enregistrement impossible : " + ((e && e.message) || e));
  }
};
