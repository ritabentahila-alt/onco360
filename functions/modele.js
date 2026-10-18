// Onco360 – modèle de la spécialité (R-A6, 18/10/2026, demande du cabinet du 17/10) : logique pure, sans Firebase (test :
// node functions/test-modele.js). Le cabinet du Dr Bentahila est le modèle : ses réglages effectifs sont repris, à la demande, dans le
// modèle de la spécialité (fonction modeleReprendre), puis appliqués cabinet par cabinet (modeleAppliquer) sans rien écraser de ce que le
// cabinet a modifié : ce qui manque est ajouté.

// Parties du modèle (ordre d'affichage) ; les deux dernières ne sont jamais dans le modèle (propres à chaque cabinet)
const PARTIES = [
  ["fiche", "Fiche patient"],
  ["consultation", "Formulaires de consultation (et formulaire de chaque type)"],
  ["typesConsult", "Types de consultation"],
  ["parametres", "Paramètres de départ (horaires, fériés, WhatsApp, couleurs, types de documents et de tâches, tâches automatiques, RCP, listes, impression, alertes)"],
  ["bibliotheques", "Bibliothèques de prescription et modèles de documents de radiothérapie"],
  ["reglage", "Réglage du cabinet (menu, cartes du tableau de bord, onglets des Paramètres, fonctions)"],
];
const JAMAIS = [["correspondants", "Correspondants"], ["tarifs", "Tarifs des consultations"]];
const BIBLIOTHEQUES = ["medicaments", "ordostypes", "analyses", "bilans", "examens", "courriers"];

const copie = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));
const objet = (v) => !!v && typeof v === "object" && !Array.isArray(v);
const norm = (s) => String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
// Identité d'un élément de liste : id, sinon k (types), sinon date (fériés), sinon nom ; rien = comparé en entier
const ident = (o) => (!objet(o) ? null : o.id != null ? "id:" + o.id : o.k != null ? "k:" + o.k : o.d != null ? "d:" + o.d : o.nom != null ? "nom:" + norm(o.nom) : o.titre != null ? "titre:" + norm(o.titre) : null);
const nomDe = (o) => (objet(o) ? o.nom || o.lib || o.titre || o.k || o.id || "" : String(o));

// Ajoute à `base` ce qui manque, pris dans `ajout` ; rien de `base` n'est modifié ni retiré. Listes : éléments absents ajoutés (même
// identité, ou même nom : déjà là) ; objets : clés absentes ajoutées, les autres fusionnées ; valeur simple : celle de `base`.
// `note(chemin, valeur)` est appelée pour chaque ajout.
function fusionManquant(base, ajout, note, chemin) {
  chemin = chemin || "";
  if (base === undefined || base === null) { if (ajout !== undefined && ajout !== null && note) note(chemin, ajout); return copie(ajout); }
  if (ajout === undefined || ajout === null) return copie(base);
  if (Array.isArray(base) && Array.isArray(ajout)) {
    const out = copie(base), ids = new Set(base.map(ident).filter(Boolean)), noms = new Set(base.map((o) => (objet(o) ? (o.nom != null ? norm(o.nom) : null) : norm(o))).filter(Boolean));
    ajout.forEach((o) => {
      if (objet(o)) { const i = ident(o); if ((i && ids.has(i)) || (o.nom != null && noms.has(norm(o.nom))) || (!i && out.some((z) => JSON.stringify(z) === JSON.stringify(o)))) return; }
      else if (noms.has(norm(o))) return;
      out.push(copie(o)); if (note) note(chemin, o);
    });
    return out;
  }
  if (objet(base) && objet(ajout)) {
    const out = copie(base);
    Object.keys(ajout).forEach((k) => { out[k] = k in base ? fusionManquant(base[k], ajout[k], note, chemin ? chemin + "." + k : k) : (note && note(chemin ? chemin + "." + k : k, ajout[k]), copie(ajout[k])); });
    return out;
  }
  return copie(base);
}
// Modèle prioritaire, mais rien ne disparaît : ce que l'ancienne copie avait et que le modèle n'a pas est gardé (champ ajouté par
// l'ancien modèle et retiré depuis : toujours là, ses valeurs restent lisibles)
const modelePrioritaire = (modele, ancien) => fusionManquant(copie(modele), ancien);

// Différences entre deux états d'une partie : { plus: [noms], moins: [noms], change: [noms] } (listes : par identité ; objets : par clé)
function difference(a, b, chemin, out) {
  out = out || { plus: [], moins: [], change: [] }; chemin = chemin || "";
  const lab = (c, v) => (objet(v) && nomDe(v) ? nomDe(v) : c || "valeur");
  if (JSON.stringify(a) === JSON.stringify(b)) return out;
  if (a === undefined || a === null) { if (Array.isArray(b)) b.forEach((v) => out.plus.push(lab(chemin, v))); else out.plus.push(lab(chemin, b)); return out; }
  if (b === undefined || b === null) { if (Array.isArray(a)) a.forEach((v) => out.moins.push(lab(chemin, v))); else out.moins.push(lab(chemin, a)); return out; }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.every((v) => !objet(v)) && b.every((v) => !objet(v))) { // liste de noms ou de clés (ordre, jours…)
      const A = a.map(String), B = b.map(String), p = B.filter((v) => A.indexOf(v) < 0), m = A.filter((v) => B.indexOf(v) < 0);
      p.forEach((v) => out.plus.push(v)); m.forEach((v) => out.moins.push(v));
      if (!p.length && !m.length && A.join("|") !== B.join("|")) out.change.push((chemin || "ordre") + " (ordre)");
      return out;
    }
    const ia = new Map(a.map((v, i) => [ident(v) || "#" + i, v])), ib = new Map(b.map((v, i) => [ident(v) || "#" + i, v]));
    ib.forEach((v, k) => { if (!ia.has(k)) out.plus.push(lab(chemin, v)); else if (JSON.stringify(ia.get(k)) !== JSON.stringify(v)) out.change.push(lab(chemin, v)); });
    ia.forEach((v, k) => { if (!ib.has(k)) out.moins.push(lab(chemin, v)); });
    return out;
  }
  if (objet(a) && objet(b)) { new Set(Object.keys(a).concat(Object.keys(b))).forEach((k) => difference(a[k], b[k], chemin ? chemin + "." + k : k, out)); return out; }
  out.change.push(chemin || "valeur"); return out;
}
const total = (d) => d.plus.length + d.moins.length + d.change.length;
// Résumé lisible : « 3 ajoutés (A, B, C), 1 retiré (D), 2 changés (E, F) »
function resume(d, max) {
  const m = max || 6, l = (t, x) => (x.length ? x.length + " " + t + (x.length > 1 ? "s" : "") + " (" + x.slice(0, m).join(", ") + (x.length > m ? "…" : "") + ")" : "");
  return [l("ajouté", d.plus), l("retiré", d.moins), l("changé", d.change)].filter(Boolean).join(", ") || "aucune différence";
}

// Modèle d'une fiche ou d'un formulaire (catalogue du site, même code : functions/site/catalogue.js) : différences entre le formulaire
// effectif du cabinet (R) et celui d'une spécialité vide, tous les champs ajoutés comptés comme les siens. Vérifié : le formulaire effectif
// d'un cabinet qui reçoit ce modèle sans retouche = R (test-modele.js).
function modeleForm(cat, CAT, R, onco) {
  const base = cat.formEffectif(CAT, null, onco ? { _onco: true } : {}), R2 = copie(R);
  (R2.ajouts || []).forEach((a) => { if (!(base.ajouts || []).some((z) => z.id === a.id)) a.cabinet = true; });
  return cat.formRetouches(CAT, R2, base);
}
// Réglages effectifs d'un cabinet (comme v2.js `charger`) : regAdmin (pack + retouches de l'administration, fiche et consultation de la
// spécialité) puis retouches du cabinet lui-même (parametres/formulaires) ; tableau de bord du cabinet (parametres/accueil) par-dessus
function effectifs(cat, espaceDoc, formCab, accueilCab) {
  const ab = espaceDoc.abonnement || {}, mods = ab.modules || {}, onco = !!(mods.chimio || mods.rt);
  const regAdmin = cat.reglageEffectif(ab.reglage, Object.assign({}, espaceDoc.ficheSpe || {}, { _onco: onco }), Object.assign({}, espaceDoc.consultSpe || {}, { _onco: onco }));
  const reg = cat.formulairesCabinet(regAdmin, formCab);
  const A = accueilCab ? cat.accueilEffectif(reg, accueilCab) : null;
  const reglage = { menu: reg.menu, accueil: A ? A.ordre : reg.accueil, cartes: A ? A.cartes : reg.cartes, ordreSections: reg.ordreSections, sections: reg.sections, bibliotheques: reg.bibliotheques, fonctions: reg.fonctions };
  return { onco, fiche: reg.fiche, consultation: reg.consultation, reglage };
}

// Réglage d'un cabinet neuf : celui de son pack (prioritaire : c'est ce qui est vendu), complété par celui du modèle
const reglageNeuf = (pack, modele) => (pack ? fusionManquant(pack, modele || null) : copie(modele || null));

// Types de consultation à écrire dans un cabinet : les siens, plus ceux du modèle qui manquent ; sans liste enregistrée : celle du modèle,
// plus les activités de ses tarifs (rien ne disparaît de ce qu'il voyait)
function typesPourCabinet(cab, modele, acts) {
  if (Array.isArray(cab) && cab.length) return fusionManquant(cab, modele || []);
  const l = copie(modele || []); (acts || []).forEach(([k, nom]) => { if (k && !l.some((t) => t.k === String(k))) l.push({ k: String(k), nom: nom || String(k), rdv: true, anciens: [] }); });
  return l;
}

module.exports = { PARTIES, JAMAIS, BIBLIOTHEQUES, fusionManquant, modelePrioritaire, difference, total, resume, modeleForm, effectifs, reglageNeuf, typesPourCabinet, norm, ident };
