// Onco360 – fiche patient réglable (étape 16, 10/10/2026). La fiche de la spécialité (la même pour tous les packs), puis les retouches
// du cabinet (D().reg.fiche) disent quels champs sont présents, dans quel ordre, sous quel nom, et ajoutent des champs (texte,
// nombre, date, liste de choix, oui / non).
// Les formulaires (Nouveau patient, Modifier, Afficher, en-tête du dossier) marquent chaque champ existant (data-champ="clé") ;
// appliquerFiche() les remet dans l'ordre, cache ceux qui sont retirés (leur valeur est gardée) et place les champs ajoutés.
// Valeurs des champs ajoutés : identite.extra { id: valeur } ou clinique.extra (selon la partie du champ).
let A = null;
export function installer(api) { A = api; }
const D = () => A.D();
const F = () => (D().reg && D().reg.fiche) || { ordre: [], champs: {}, libs: {}, ajouts: [] };
export const champsAjoutes = () => F().ajouts;
// En tête du dossier ? (réglé champ par champ : spécialité, puis retouches du cabinet ; sans réglage : l'en-tête d'aujourd'hui)
const ENTETE0 = ["ddn", "sexe", "taille", "poids", "diag", "tel", "tel2", "etab", "ald", "cor", "mut"];
export const enTete = (k) => { const R = F(), a = R.ajouts.find((z) => z.id === k); return R.champs[k] !== false && (R.entetes && k in R.entetes ? R.entetes[k] : a ? a.entete === true : ENTETE0.indexOf(k) >= 0); };
const valeurDe = (x, a) => { const d = (x && x.doc) || {}, src = a.partie === "clinique" ? d.clinique : d.identite; return ((src && src.extra) || {})[a.id]; };
const texteDe = (a, v) => (v == null || v === "" ? "" : a.type === "date" ? A.dfrA(v) : a.type === "ouinon" ? (v === true || v === "oui" ? "Oui" : "Non") : String(v));

// Champs ajoutés d'un formulaire de saisie : off(partie) = vrai si la personne ne peut pas modifier cette partie
export function htmlSaisie(x, off) {
  const esc = A.esc;
  return champsAjoutes().map((a) => {
    const v = x ? valeurDe(x, a) : "", dis = off && off(a.partie) ? " disabled" : "", id = "fx_" + a.id, lab = '<label for="' + id + '">' + esc(a.lib) + "</label>";
    const champ = a.type === "choix" ? '<select id="' + id + '"' + dis + '><option value=""></option>' + (a.choix || []).map((c) => "<option" + (c === v ? " selected" : "") + ">" + esc(c) + "</option>").join("") + "</select>"
      : a.type === "ouinon" ? '<select id="' + id + '"' + dis + '><option value=""></option><option value="oui"' + (v === "oui" || v === true ? " selected" : "") + '>Oui</option><option value="non"' + (v === "non" || v === false ? " selected" : "") + ">Non</option></select>"
      : '<input id="' + id + '"' + (a.type === "date" ? ' type="date"' : a.type === "nombre" ? ' inputmode="decimal"' : "") + ' value="' + esc(v == null ? "" : v) + '"' + dis + ">";
    return '<div data-champ="' + a.id + '"' + (a.type === "texte" ? ' class="large"' : "") + ">" + lab + champ + "</div>";
  }).join("");
}
// Lecture des champs ajoutés saisis : { identite: {…}, clinique: {…} } (valeurs vides retirées)
export function lireSaisie() {
  const out = { identite: {}, clinique: {} };
  champsAjoutes().forEach((a) => { const e = document.getElementById("fx_" + a.id); if (!e || e.disabled) return; const v = String(e.value || "").trim(); if (v !== "") out[a.partie === "clinique" ? "clinique" : "identite"][a.id] = a.type === "nombre" ? v.replace(",", ".") : v; });
  return out;
}
// Fusion dans la partie du dossier : extra mis à jour pour les champs de cette partie que la personne peut modifier
export function fusionnerExtra(partieDoc, partie, saisie) {
  const ex = Object.assign({}, (partieDoc && partieDoc.extra) || {});
  champsAjoutes().filter((a) => (a.partie === "clinique" ? "clinique" : "identite") === partie).forEach((a) => { const e = document.getElementById("fx_" + a.id); if (!e || e.disabled) return; if (saisie[partie][a.id] != null) ex[a.id] = saisie[partie][a.id]; else delete ex[a.id]; });
  return ex;
}
// Champs ajoutés en lecture (Afficher, en-tête du dossier)
export function htmlLecture(x, seulementEntete) {
  const esc = A.esc;
  return champsAjoutes().filter((a) => !seulementEntete || enTete(a.id)).map((a) => { const t = texteDe(a, valeurDe(x, a));
    return seulementEntete ? (t ? '<div data-champ="' + a.id + '"><label>' + esc(a.lib) + "</label><b>" + esc(t) + "</b></div>" : "")
      : '<div data-champ="' + a.id + '"' + (t.length > 60 ? ' class="large"' : "") + "><label>" + esc(a.lib) + "</label><div>" + (t ? "<b>" + esc(t) + "</b>" : '<span class="mesures">—</span>') + "</div></div>"; }).join("");
}
// Champs ajoutés à imprimer (fiche chimio, courriers) : [{ id, lib, texte }]
export const aImprimer = (x) => champsAjoutes().filter((a) => a.imprimer).map((a) => ({ id: a.id, lib: a.lib, texte: texteDe(a, valeurDe(x, a)) }));
// Remet les champs d'un formulaire dans l'ordre du réglage et cache ceux qui sont retirés
export function appliquerFiche(racine) {
  if (!racine) return;
  const R = F(), els = [...racine.querySelectorAll(":scope > [data-champ]")]; if (!els.length) return;
  const rang = (k) => { const i = R.ordre.indexOf(k); return i < 0 ? 999 : i; };
  const ancre = els[0].previousSibling, parent = els[0].parentNode, tries = els.slice().sort((a, b) => rang(a.dataset.champ) - rang(b.dataset.champ));
  let apres = ancre; tries.forEach((e) => { parent.insertBefore(e, apres ? apres.nextSibling : parent.firstChild); apres = e; });
  const vus = {};
  els.forEach((e) => { const k = e.dataset.champ; if (R.champs[k] === false) e.style.display = "none";
    // Nom affiché (réglé par l'administration) : premier texte du libellé du premier élément de ce champ
    if (R.libs && R.libs[k] && !vus[k]) { vus[k] = 1; const l = e.querySelector(":scope > label"), t = l && [...l.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim()); if (t) t.textContent = R.libs[k] + (/\s$/.test(t.textContent) ? " " : ""); } });
}
