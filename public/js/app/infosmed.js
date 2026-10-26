// Onco360 – Informations médicales du dossier (lot A §4 et §6, 25/10/2026, demande de Dr Bentahila) : antécédents médicaux, chirurgicaux et
// familiaux, allergies, traitements en cours (une ligne par élément : libellé + note ; dosage facultatif pour un traitement, jamais de posologie
// imposée), mode de vie (un texte). Colonne Patient : chaque sous-partie affichée (« non renseigné » cliquable), « + » bleu pour rouvrir (26/10 ; le « + Ajouter »
// du début a été retiré le 25/10 : « non renseigné » ou le titre de la rubrique) ; petite fenêtre d'ajout (liste du cabinet + saisie libre, ajoutée à la liste pour les fois
// suivantes ; doublon signalé) ; le même éditeur dans le formulaire entier (clic sur le titre de la rubrique, fichepatient.js).
// Rangement : le champ texte d'avant (clinique.atcdMed, atcdChir, atcdFam, traitCours, allergies), un élément par ligne (« libellé — note »,
// traitement « libellé — dosage — note ») : tout ce qui lisait ces champs (contrôle d'allergie de la chimiothérapie, interactions, courriers,
// impressions, export) continue de marcher ; un ancien texte libre devient la première ligne de sa sous-partie, rien n'est réécrit tant que
// personne n'enregistre. Listes du cabinet : parametres/listes { allergies, atcdMed, atcdChir, atcdFam, traitCours } (absentes = listes de départ).
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "../config.js";
import { ATCD_MED0, ATCD_CHIR0, ATCD_FAM0, ALLERGIES0 } from "../donnees/listes.js";
import { MEDICAMENTS0 } from "../donnees/medicaments.js";
import { TRAITEMENTS_MA } from "../donnees/traitements.js";
import * as ficheP from "./fichepatient.js";
let A = null;
export function installer(api) { A = api; }
const D = () => A.D();

// Sous-parties, dans leur ordre d'affichage
export const SOUS = [["atcdMed", "Antécédents médicaux"], ["atcdChir", "Antécédents chirurgicaux"], ["atcdFam", "Antécédents familiaux"], ["allergies", "Allergies"], ["traitCours", "Traitements en cours"], ["modeVie", "Mode de vie"]];
export const CLES = SOUS.map((z) => z[0]);
export const LISTES_MED = SOUS.filter(([k]) => k !== "modeVie"); // listes du cabinet (Paramètres › Bibliothèques › Listes)
const SEP = " — ";
// Traitements de départ : les médicaments de la bibliothèque Médic. de départ, sans dose (« ABIRANAT (abiratérone) 250 mg » → « ABIRANAT (abiratérone) »)
export const sansDose = (n) => String(n || "").replace(/\s+\d[\d.,/ ]*\s*(mg|µg|mcg|g|ml|UI|U|%)(\/\s*\S+)?(\s.*)?$/i, "").trim();
const alpha = (a, b) => a.localeCompare(b, "fr", { sensitivity: "base" });
const DEPART = { atcdMed: ATCD_MED0, atcdChir: ATCD_CHIR0, atcdFam: ATCD_FAM0, allergies: ALLERGIES0 };
// 26/10/2026 : + traitements courants de médecine générale (donnees/traitements.js, fichier de Dr Bentahila), sans doublon
export const departMed = (k) => { if (k !== "traitCours") return (DEPART[k] || []).slice(); const vus = new Set(), L = [];
  MEDICAMENTS0.map((m) => sansDose(m[0])).concat(TRAITEMENTS_MA).forEach((t) => { const n = norm(t); if (t && !vus.has(n)) { vus.add(n); L.push(t); } }); return L.sort(alpha); };
export const listeMed = (k) => { const L = (D() && D().listes) || {}; return Array.isArray(L[k]) ? L[k].slice() : departMed(k); };
const norm = (t) => String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
const propre = (t) => String(t == null ? "" : t).replace(/\s*[—]\s*/g, " - ").replace(/\s+/g, " ").trim().slice(0, 200);
// Éléments d'une sous-partie ↔ texte rangé (une ligne par élément)
export const elements = (txt, k) => String(txt || "").split(/\n+/).map((l) => l.trim()).filter(Boolean).map((l) => {
  const p = l.split(SEP); return k === "traitCours" ? { lib: p[0], dosage: p[1] || "", note: p.slice(2).join(SEP) } : { lib: p[0], note: p.slice(1).join(SEP) }; });
export const texteDe = (L, k) => L.map((e) => { const p = k === "traitCours" ? [propre(e.lib), propre(e.dosage), propre(e.note)] : [propre(e.lib), propre(e.note)];
  while (p.length > 1 && !p[p.length - 1]) p.pop(); return p.join(SEP); }).filter((l) => l && !l.startsWith(SEP)).join("\n");
export const doublon = (L) => { const v = L.map((e) => norm(e.lib)); const i = v.findIndex((t, j) => t && v.indexOf(t) !== j); return i >= 0 ? L[v.indexOf(v[i])].lib : null; };
const flag = (C) => String((C || {}).allergie || "").toLowerCase();

// Sous-parties présentes dans la fiche du cabinet (partie Informations médicales), avec leur nom affiché
const champs = () => ficheP.champsFiche().filter((c) => c.present && c.section === "med");
export const sousPresentes = () => { const L = champs(); return SOUS.map(([k, lib]) => { const c = L.find((z) => z.k === k); return c ? [k, c.lib || lib] : null; }).filter(Boolean); };
const peutModifier = () => A.traitMod() || A.peut("fichePatient");
const liste = (x, k) => elements(((x.doc.clinique || {})[k]) || "", k);
const ligneEl = (e, k) => '<li><span class="im-e">' + A.esc(e.lib) + "</span>" + (k === "traitCours" && e.dosage ? " " + A.esc(e.dosage) : "") + (e.note ? '<span class="im-n"> · ' + A.esc(e.note) + "</span>" : "") + "</li>";

// 25/10/2026 (2e demande de Dr Bentahila) : plus de « + Ajouter » : on ajoute en cliquant sur « non renseigné » (petite fenêtre) ou sur le titre
// « Informations médicales » (tout le formulaire au centre) ; « non renseigné » aussi sur les autres champs vides de la partie (OMS, taille…)
export const nonRenseigne = (x, k) => (peutModifier() ? '<button type="button" class="im-nr" onclick="imOuvrir(\'' + x.id + "','" + k + "')\">non renseigné</button>" : '<span class="im-nr">non renseigné</span>');
// Colonne Patient (rubrique Informations médicales) : chaque sous-partie ; nombre de sous-parties remplies (n)
export function htmlColonne(x) {
  const esc = A.esc, C = x.doc.clinique || {}, ok = peutModifier(), q = "'" + x.id + "'", S = sousPresentes();
  const nr = (k) => nonRenseigne(x, k);
  // 26/10/2026 (demande de Dr Bentahila) : petit « + » bleu à droite du titre (au lieu du crayon) : la fenêtre s'ouvre avec les éléments déjà notés
  // (modifiables) et une ligne vide pour en ajouter
  const crayon = (k, lib) => (ok ? '<button type="button" class="im-cr im-ajt" onclick="imOuvrir(' + q + ",'" + k + '\',true)" title="Ajouter ou modifier « ' + esc(lib) + ' »" aria-label="Ajouter ou modifier « ' + esc(lib) + ' »">' + A.ic("plus") + "</button>" : "");
  let n = 0;
  const corps = S.map(([k, lib]) => {
    let h = "";
    if (k === "modeVie") h = C.modeVie ? '<p class="im-txt">' + esc(C.modeVie) + "</p>" : "";
    else if (k === "allergies") { const f = flag(C), L = liste(x, k);
      h = f === "non" ? '<p class="im-txt">Aucune allergie connue</p>' : L.length ? '<ul class="im-ul im-al">' + L.map((e) => ligneEl(e, k)).join("") + "</ul>" : f === "oui" ? '<p class="im-txt im-al">Oui (non précisé)</p>' : ""; }
    else { const L = liste(x, k); h = L.length ? '<ul class="im-ul">' + L.map((e) => ligneEl(e, k)).join("") + "</ul>" : ""; }
    if (h) n++;
    return '<div class="im-s" data-im="' + k + '"><div class="im-h"><span class="im-l">' + esc(lib) + "</span>" + (h ? crayon(k, lib) : "") + "</div>" + (h || nr(k)) + "</div>";
  }).join("");
  return { html: corps ? '<div class="im">' + corps + "</div>" : "", n };
}

// Lignes de l'éditeur (petite fenêtre et formulaire entier) : libellé (liste du cabinet + saisie libre), dosage (traitement), note, ✕
const ligneEd = (k, e) => '<div class="im-r"><input class="im-lib" list="imDl-' + k + '" value="' + A.esc((e && e.lib) || "") + '" placeholder="' + (k === "traitCours" ? "Médicament" : k === "allergies" ? "Allergie" : "Antécédent") + ' (liste ou saisie libre)" aria-label="Élément">' +
  (k === "traitCours" ? '<input class="im-dz" value="' + A.esc((e && e.dosage) || "") + '" placeholder="Dosage (facultatif)" aria-label="Dosage">' : "") +
  '<input class="im-no" value="' + A.esc((e && e.note) || "") + '" placeholder="Note (facultatif)" aria-label="Note">' +
  '<button type="button" class="ico im-x" onclick="imRetirer(this)" title="Supprimer cette ligne" aria-label="Supprimer cette ligne">✕</button></div>';
export function htmlEditeur(k, L, vide) {
  const dl = '<datalist id="imDl-' + k + '">' + listeMed(k).map((t) => '<option value="' + A.esc(t) + '">').join("") + "</datalist>";
  return '<div class="im-ed" data-ed-im="' + k + '"><div class="im-lignes">' + L.map((e) => ligneEd(k, e)).join("") + (vide || !L.length ? ligneEd(k, null) : "") + "</div>" +
    '<button type="button" class="bt clair petit im-plus" onclick="imLigne(this,\'' + k + '\')">' + A.ic("plus") + "Ajouter une ligne</button>" + dl + "</div>";
}
window.imLigne = (b, k) => { const z = b.parentNode.querySelector(".im-lignes"); z.insertAdjacentHTML("beforeend", ligneEd(k, null)); const l = z.querySelectorAll(".im-lib"); l[l.length - 1].focus(); };
window.imRetirer = (b) => { const r = b.closest(".im-r"), z = r.parentNode; r.remove(); if (!z.querySelector(".im-r")) { const ed = z.closest(".im-ed"); z.insertAdjacentHTML("beforeend", ligneEd(ed.dataset.edIm, null)); } };
// Lecture d'un éditeur : éléments (lignes sans libellé ignorées) ; erreur = doublon
export function lireEditeur(racine) {
  const ed = racine && racine.querySelector ? (racine.matches && racine.matches(".im-ed") ? racine : racine.querySelector(".im-ed")) : null; if (!ed) return null;
  const k = ed.dataset.edIm, L = [...ed.querySelectorAll(".im-r")].map((r) => ({ lib: propre(r.querySelector(".im-lib").value), dosage: r.querySelector(".im-dz") ? propre(r.querySelector(".im-dz").value) : "", note: propre(r.querySelector(".im-no").value) })).filter((e) => e.lib);
  const d = doublon(L);
  return { k, L, erreur: d ? (k === "allergies" ? "Cette allergie est déjà notée : « " + d + " »." : k === "traitCours" ? "Ce traitement est déjà noté : « " + d + " »." : "Cet élément est déjà noté : « " + d + " ».") : "" };
}
// Saisie libre : les éléments absents de la liste du cabinet y sont ajoutés (parametres/listes, relue avant d'écrire)
export async function enrichir(ajouts) {
  const ks = Object.keys(ajouts || {}).filter((k) => (ajouts[k] || []).length); if (!ks.length) return;
  const ref = doc(db, "espaces", A.ESPACE, "parametres", "listes"), s = await getDoc(ref).catch(() => null);
  let L = D().listes || {}; try { if (s && s.exists()) L = JSON.parse(s.data().data || "{}"); } catch (e) { /* liste locale */ }
  let ch = false;
  ks.forEach((k) => { const base = Array.isArray(L[k]) ? L[k].slice() : departMed(k), vus = new Set(base.map(norm));
    ajouts[k].forEach((t) => { const v = propre(t); if (v && !vus.has(norm(v))) { base.push(v); vus.add(norm(v)); ch = true; } }); L[k] = base; });
  D().listes = L;
  if (ch) await setDoc(ref, { data: JSON.stringify(L) }).catch((e) => console.warn("listes", e));
}
const nouveaux = (k, L) => { const vus = new Set(listeMed(k).map(norm)); return L.map((e) => e.lib).filter((t) => !vus.has(norm(t))); };

// Petite fenêtre d'une sous-partie (ajout : une ligne vide en plus ; ✎ ou « non renseigné » : les éléments déjà notés) ; autre champ de la partie
// (OMS, taille, poids, ligne ajoutée par le cabinet) : son champ seul, avec le formulaire de la fiche
window.imOuvrir = (pid, k, ajout) => {
  const x = D().patients.find((p) => p.id === pid); if (!x) return;
  if (!peutModifier()) { A.toast("Vous n'avez pas le droit de modifier les informations médicales."); return; }
  const esc = A.esc, C = x.doc.clinique || {}, lib = (sousPresentes().find((z) => z[0] === k) || SOUS.find((z) => z[0] === k) || [])[1];
  if (!lib) { // autre champ de la partie : son champ seul, avec le formulaire de la fiche
    const c = champs().find((z) => z.k === k); if (!c) return;
    A.fenetre("<h3>" + esc(c.lib) + '</h3><p class="mesures" style="margin:-4px 0 10px">' + esc(x.r.nm) + "</p>" + ficheP.htmlFormulaire(x, { sec: "med", seul: k, off: () => false, etabs: [] }) +
      '<div class="err" id="fErr"></div><div class="boutons"><button class="bt gris" onclick="fermerFenetre()">Annuler</button><button class="bt plein" id="imOk">Enregistrer</button></div>');
    A.$("imOk").onclick = async () => { const lu = ficheP.lireFormulaire(x); if (lu.erreur) { A.erreur(lu.erreur); return; }
      const ch = c.partie === "clinique" ? { clinique: lu.clinique } : { identite: lu.identite };
      await sauver(x, ch, "Informations médicales modifiées : " + c.lib, {}); };
    return;
  }
  let corps = "";
  if (k === "modeVie") corps = '<label for="imTxt">' + esc(lib) + '</label><textarea id="imTxt" rows="5" class="champ-t">' + esc(C.modeVie || "") + "</textarea>";
  else if (k === "allergies") { const f = flag(C);
    corps = '<label for="imAl">Allergie connue</label><select id="imAl" onchange="document.getElementById(\'imAlZ\').classList.toggle(\'cache\',this.value!==\'oui\')"><option value="">—</option><option value="non"' + (f === "non" ? " selected" : "") + '>Non</option><option value="oui"' + (f === "oui" || (!f && ajout) || (!f && C.allergies) ? " selected" : "") + ">Oui</option></select>" +
      '<div id="imAlZ"' + (f === "oui" || (!f && (ajout || C.allergies)) ? "" : ' class="cache"') + ' style="margin-top:10px"><label>Laquelle ou lesquelles ?</label>' + htmlEditeur(k, liste(x, k), !!ajout) + "</div>"; }
  else corps = htmlEditeur(k, liste(x, k), !!ajout);
  A.fenetre("<h3>" + esc(lib) + '</h3><p class="mesures" style="margin:-4px 0 10px">' + esc(x.r.nm) + "</p>" + corps +
    '<div class="err" id="fErr"></div><div class="boutons"><button class="bt gris" onclick="fermerFenetre()">Annuler</button><button class="bt plein" id="imOk">Enregistrer</button></div>');
  if (ajout) setTimeout(() => { const l = document.querySelectorAll("#fenetreCorps .im-lib"); if (l.length) l[l.length - 1].focus(); }, 60);
  A.$("imOk").onclick = async () => {
    const C2 = Object.assign({}, x.doc.clinique || {}), aj = {};
    if (k === "modeVie") { const v = A.val("imTxt"); if (v) C2.modeVie = v; else delete C2.modeVie; }
    else { const r = lireEditeur(A.$("fenetreCorps")); if (r.erreur) { A.erreur(r.erreur); return; }
      if (k === "allergies") { const f = A.val("imAl"); if (f) C2.allergie = f; else delete C2.allergie;
        const t = f === "non" ? "" : texteDe(r.L, k); if (t) C2.allergies = t; else delete C2.allergies; if (f !== "non") aj[k] = nouveaux(k, r.L); }
      else { const t = texteDe(r.L, k); if (t) C2[k] = t; else delete C2[k]; aj[k] = nouveaux(k, r.L); } }
    await sauver(x, { clinique: C2 }, "Informations médicales modifiées : " + lib, aj);
  };
};
async function sauver(x, ch, quoi, aj) {
  const avant = JSON.stringify({ c: x.doc.clinique || {}, i: x.doc.identite || {} }), apres = JSON.stringify({ c: ch.clinique || x.doc.clinique || {}, i: ch.identite || x.doc.identite || {} });
  if (avant === apres) { A.fermerFenetre(); return; }
  A.occupe(A.$("imOk"), true);
  try { await A.enregistrer(x, ch, quoi); await enrichir(aj); A.fermerFenetre(); A.toast("Dossier enregistré."); A.pageDossier(x.id); }
  catch (e) { A.occupe(A.$("imOk"), false); A.erreur((e && e.message) || String(e)); }
}
