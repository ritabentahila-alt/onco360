// Onco360 – fiche patient réglable (étape 16, 10/10/2026). La fiche de la spécialité (la même pour tous les packs), puis les retouches
// du cabinet (D().reg.fiche) disent quels champs sont présents, dans quel ordre, sous quel nom, et ajoutent des champs (texte,
// nombre, date, liste de choix, oui / non).
// 3.11 (12/10/2026) : les formulaires (Nouveau patient, Modifier, Afficher, en-tête du dossier) sont rendus ici depuis la fiche effective
// (champsDe : type, nom, partie, ordre, liste, unité, imprimé, en-tête de chaque champ) ; un champ retiré n'est pas affiché, sa valeur est gardée.
// Valeurs des champs ajoutés : identite.extra { id: valeur } ou clinique.extra (selon la partie du champ).
import { champPropose, champsDe, drapeau, ENTETE0, ENTETE_CALC, ENTETE_CALC0 } from "../donnees/catalogue.js";
import { age as ageDe } from "../moteur/outils.js";
import { textePoids } from "../moteur/poids.js";
let A = null;
export function installer(api) { A = api; }
const D = () => A.D();
const F = () => (D().reg && D().reg.fiche) || { ordre: [], champs: {}, libs: {}, ajouts: [] };
export const champsAjoutes = () => F().ajouts;
// En tête du dossier ? (réglé champ par champ : spécialité, puis retouches du cabinet ; sans réglage : l'en-tête d'aujourd'hui)
export const enTete = (k) => { const R = F(), a = R.ajouts.find((z) => z.id === k); return R.champs[k] !== false && (R.entetes && k in R.entetes ? R.entetes[k] : a ? a.entete === true : ENTETE0.indexOf(k) >= 0); };

// Fiche tumeur (3.1) : champ à condition (si.diag : biomarqueurs selon la localisation = le diagnostic) caché tant que la condition n'est pas
// remplie, recalculé quand le diagnostic change (écoute ci-dessous) ; stade et grade : listes du cabinet (Paramètres › Listes)
const diagDe = (x) => ({ diag: ((x && x.doc && x.doc.clinique) || {}).diag || "" });
const listeCab = (k, def) => { const L = (D() && D().listes) || {}; return Array.isArray(L[k]) && L[k].length ? L[k] : def || []; };
window.ficheSi = (el) => {
  const f = (el && el.closest("#fenetre")) || document, d = f.querySelector("#fDiag, #pDiag"), val = { diag: d ? d.value : "" };
  f.querySelectorAll("[data-si]").forEach((z) => { const a = champsAjoutes().find((y) => y.id === z.dataset.champ); z.classList.toggle("cache", !!a && !champPropose(a, val)); });
};
["input", "change"].forEach((t) => document.addEventListener(t, (ev) => { const id = ev.target && ev.target.id; if (id === "fDiag" || id === "pDiag") window.ficheSi(ev.target); }));
// Champs ajoutés à imprimer (fiche chimio, courriers) : [{ id, lib, texte }]
export const aImprimer = (x) => champsFiche().filter((c) => c.imprimer && c.present).map((c) => ({ id: c.k, lib: c.lib, texte: c.k === "poids" && poidsVu(x) ? textePoids(poidsVu(x)) : texteChamp(docVu(x), c) })); // 3.11 : champs d'origine aussi
// ───── 3.11 (12/10/2026) : fiche entièrement réglable, rendue depuis la fiche effective (champsDe) ─────
// Un seul code pour Modifier, Nouveau patient, Afficher et l'en-tête du dossier : chaque champ selon son type (réglé par le cabinet),
// dans sa partie (Identité, Informations médicales, Fiche tumeur), dans l'ordre réglé ; champs retirés : non affichés, valeurs gardées.
// Valeurs : identite.<clé> / clinique.<clé> (champs d'origine ; nom → nomF), extra.<id> (champs ajoutés) ; « oui / non + précision » :
// texte dans la clé, oui / non dans drapeau(clé) (allergies : allergie).
const ID = { nom: "fNomF", prenom: "fPrenom", ddn: "fDdn", sexe: "fSexe", taille: "fTaille", poids: "fPoids", diag: "fDiag", diagP: "fDiagP", cin: "fCin", tel: "fTel", tel2: "fTel2",
  etab: "fEtab", ald: "fAld", cor: "fCor", mut: "fMut", adresse: "fAdr", email: "fMail" };
const idDe = (c) => ID[c.k] || (c.ajout ? "fx_" : "f_") + c.k;
const idDrap = (c) => (c.k === "allergies" ? "f_allergie" : idDe(c) + "Oui"), idZone = (c) => (c.k === "allergies" ? "zAlD" : "z_" + idDe(c));
const STO = { nom: "nomF" };
// R-A5 (18/10/2026) : le poids affiché est le poids actuel (fiche ou dernière séance de chimio, moteur/poids.js, calculé par recalculer)
const poidsVu = (x) => (x && x.P && x.P.poidsAct) || null;
const docVu = (x) => { const doc = (x && x.doc) || {}, pa = poidsVu(x); return pa ? Object.assign({}, doc, { clinique: Object.assign({}, doc.clinique || {}, { poids: pa.v.replace(",", ".") }) }) : doc; };
const objDe = (doc, c) => ((doc || {})[c.partie === "clinique" ? "clinique" : "identite"]) || {};
export const champsFiche = () => champsDe(F());
const brut = (doc, c) => { if (c.k === "etab") return (doc || {}).etablissementId || ""; const o = objDe(doc, c); return c.ajout ? (o.extra || {})[c.k] : o[STO[c.k] || c.k]; };
const brutDrap = (doc, c) => { const o = objDe(doc, c); return String((c.ajout ? (o.extra || {})[c.k + "Oui"] : o[drapeau(c.k)]) || "").toLowerCase(); };
const choixDeC = (c) => (c.liste === "stade" || c.liste === "grade" ? listeCab(c.liste, c.choix) : c.choix || []);
const oui = (v) => String(v || "").toLowerCase() === "oui" || v === true;
// Texte d'un champ (lecture) ; vide si rien
export function texteChamp(doc, c) {
  const v = brut(doc, c), esc = String;
  if (c.type === "ouinonp") { const d = brutDrap(doc, c); return d === "oui" ? "Oui" + (v ? " : " + v : "") : d === "non" ? "Non" : v ? esc(v) : ""; }
  if (v == null || v === "") return "";
  if (c.type === "date") return A.dfrA(v) + (c.k === "ddn" ? (() => { const a = ageDe(v, D().t); return a != null ? " (" + a + " ans)" : ""; })() : "");
  if (c.type === "sexe") return v === "F" ? "Femme" : v === "H" ? "Homme" : "";
  if (c.type === "ouinon") return oui(v) ? "Oui" : String(v).toLowerCase() === "non" ? "Non" : String(v);
  if (c.type === "etab") { const e = (D().etabsTous || D().etabs || []).find((z) => z.code === v); return e && e.nom ? e.code + " – " + e.nom : String(v); }
  return String(v) + (c.type === "nombre" && c.unite ? " " + c.unite : "");
}
const PARTIES_F = [["id", "Identité"], ["med", "Informations médicales"], ["tum", "Fiche tumeur"]];
// Formulaire de saisie : o = { off(partie) → vrai si non modifiable, etabs (hôpitaux proposés), nouveau }
export function htmlFormulaire(x, o) {
  const esc = A.esc, doc = docVu(x), dg = diagDe(x), L = champsFiche().filter((c) => c.present), pa = poidsVu(x);
  const champ = (c) => {
    if (o.nouveau && o.off && o.off(c.partie)) return ""; // nouveau patient : partie non autorisée = non proposée
    const id = idDe(c), v = brut(doc, c), V = v == null ? "" : v, dis = o.off && o.off(c.partie) ? " disabled" : "", lab = '<label for="' + id + '">' + esc(c.lib) + (c.type === "nombre" && c.unite ? " (" + esc(c.unite) + ")" : "") + "</label>";
    const si = c.ajout && c.ajout.si ? ' data-si="1"' + (champPropose(c.ajout, dg) ? "" : ' class="cache"') : "", large = ["textelong", "ouinonp"].indexOf(c.type) >= 0 || ["adresse", "email", "cor", "mut", "diag", "diagP"].indexOf(c.k) >= 0 || (c.ajout && c.type === "texte");
    const enve = (h, cl) => '<div data-champ="' + c.k + '"' + (si || (large || cl ? ' class="' + (cl || "large") + '"' : "")) + (c.k === "cor" ? ' data-fn="listes.cor"' : "") + (c.k === "diag" ? ' style="position:relative"' : "") + ">" + h + "</div>";
    const sel = (opts) => '<select id="' + id + '"' + dis + ">" + opts.map(([val, lib]) => '<option value="' + esc(val) + '"' + (String(val) === String(V) ? " selected" : "") + ">" + esc(lib) + "</option>").join("") + "</select>";
    switch (c.type) {
      case "sexe": return enve(lab + sel([["", ""], ["F", "Femme"], ["H", "Homme"]]), " ");
      case "etab": { const l = o.etabs || []; if (!l.length) return ""; return enve(lab + sel(l.map((e) => [e.code, e.code + " – " + e.nom]).concat(V && !l.some((e) => e.code === V) ? [[V, V]] : [])), " "); }
      case "liste": if (c.k === "diag") return enve(lab + '<input id="' + id + '" autocomplete="off" value="' + esc(V) + '" placeholder="Tapez pour chercher : prostate, sein, neuro…"' + dis + '><div id="' + id + 'S" class="sug cache"></div>');
        return enve(lab + '<input id="' + id + '" list="' + (c.k === "cor" ? "lCor" : "lMut") + '" value="' + esc(V) + '" placeholder="Taper pour chercher, ou saisir…"' + dis + ">");
      case "ouinon": { const ca = !c.ajout, val = oui(V) ? (ca ? "Oui" : "oui") : String(V).toLowerCase() === "non" ? (ca ? "Non" : "non") : ""; return enve(lab + '<select id="' + id + '"' + dis + '><option value=""></option>' + [["oui", "Oui"], ["non", "Non"]].map(([k, l]) => '<option value="' + (ca ? l : k) + '"' + (val.toLowerCase() === k ? " selected" : "") + ">" + l + "</option>").join("") + "</select>", " "); }
      case "ouinonp": { const d = brutDrap(doc, c) || (V ? (/^(aucune?|non|rien|néant)\b/i.test(String(V).trim()) ? "non" : "oui") : ""), z = idZone(c); // ancien texte seul : « Aucune » = non
        return enve('<label for="' + idDrap(c) + '">' + esc(c.lib) + '</label><select id="' + idDrap(c) + '"' + dis + ' onchange="document.getElementById(\'' + z + '\').classList.toggle(\'cache\',this.value!==\'oui\')"><option value="">—</option><option value="non"' + (d === "non" ? " selected" : "") + '>Non</option><option value="oui"' + (d === "oui" ? " selected" : "") + ">Oui</option></select>" +
          '<div id="' + z + '"' + (d === "oui" ? "" : ' class="cache"') + ' style="margin-top:6px"><label for="' + id + '">' + (c.k === "allergies" ? "Laquelle ou lesquelles ?" : "Précisez") + '</label><textarea id="' + id + '" rows="2" class="champ-t"' + dis + ">" + esc(V) + "</textarea></div>"); }
      case "choix": { const ch = choixDeC(c), l = ch.concat(V && ch.indexOf(V) < 0 ? [V] : []); return enve(lab + '<select id="' + id + '"' + dis + '><option value=""></option>' + l.map((t) => "<option" + (t === V ? " selected" : "") + ">" + esc(t) + "</option>").join("") + "</select>", " "); }
      case "textelong": return enve(lab + '<textarea id="' + id + '" rows="2" class="champ-t"' + dis + ">" + esc(V) + "</textarea>");
      default: if (c.k === "poids" && pa && pa.src === "seance") return enve(lab + '<input id="' + id + '" inputmode="decimal" value="' + esc(V) + '"' + dis + '><span class="mesures">' + esc(pa.lib) + "</span>"); // R-A5
        return enve(lab + '<input id="' + id + '"' + (c.type === "date" ? ' type="date"' : c.type === "nombre" ? ' inputmode="decimal"' : c.type === "tel" ? ' type="tel"' : c.type === "email" ? ' type="email"' : "") + ' value="' + esc(V) + '"' + dis + ">");
    }
  };
  return PARTIES_F.map(([k, lib]) => { const h = L.filter((c) => c.section === k).map(champ).join(""); return h ? '<h4 class="soustitre fp-sec">' + lib + '</h4><div class="form" data-sec="' + k + '">' + h + "</div>" : ""; }).join("") +
    '<datalist id="lMut">' + (A.listeMut ? A.listeMut() : []).map((m) => '<option value="' + esc(m) + '">').join("") + '</datalist><datalist id="lCor">' + (A.listeCor ? A.listeCor() : []).map((m) => '<option value="' + esc(m) + '">').join("") + "</datalist>";
}
// Lecture du formulaire : { identite, clinique, etab, erreur } (copies des parties du dossier, champs modifiables seulement)
export function lireFormulaire(x, o) {
  const doc = (x && x.doc) || {}, I = Object.assign({}, doc.identite || {}), C = Object.assign({}, doc.clinique || {}), out = { identite: I, clinique: C, etab: null, erreur: "" };
  const el = (i) => document.getElementById(i), val = (i) => { const e = el(i); return e ? String(e.value || "").replace(/\s+$/, "").trim() : null; };
  champsFiche().filter((c) => c.present).forEach((c) => {
    const id = idDe(c), e = el(c.type === "ouinonp" ? idDrap(c) : id); if (!e || e.disabled) return;
    if (c.k === "etab") { out.etab = val(id) || null; return; }
    const obj = c.partie === "clinique" ? C : I, cible = c.ajout ? (obj.extra = Object.assign({}, obj.extra || {})) : obj, cle = c.ajout ? c.k : STO[c.k] || c.k;
    const pose = (k, v) => { if (v == null || v === "") delete cible[k]; else cible[k] = v; };
    if (c.type === "ouinonp") { const d = val(idDrap(c)), t = val(id); pose(c.ajout ? c.k + "Oui" : drapeau(c.k), d); pose(cle, d === "non" ? "" : t); return; }
    let v = val(id);
    if (c.k === "nom") v = (v || "").toUpperCase(); if (c.k === "cin") v = (v || "").toUpperCase();
    if (c.type === "nombre" && v) v = v.replace(",", ".");
    pose(cle, v);
    if (c.ajout && !Object.keys(cible).length) delete obj.extra;
  });
  if (el("fNomF") && !el("fNomF").disabled) { if (!I.nomF || !I.prenom) out.erreur = "Le nom et le prénom sont obligatoires."; I.nom = ((I.nomF || "") + " " + (I.prenom || "")).trim(); }
  ["identite", "clinique"].forEach((p) => { const ob = out[p]; if (ob.extra && !Object.keys(ob.extra).length) delete ob.extra; });
  // R-A5 : date du poids : celle de la séance si c'est le poids proposé (dernière chimio), maintenant s'il a été changé à la main
  const pa = poidsVu(x), num = (v) => parseFloat(String(v == null ? "" : v).replace(",", ".")), p0 = (doc.clinique || {}).poids;
  if (C.poids != null && C.poids !== "") { if (pa && num(C.poids) === pa.poids) C.poidsLe = pa.d || C.poidsLe; else if (num(C.poids) !== num(p0)) C.poidsLe = new Date().toISOString(); } // date et heure : passe devant une séance du même jour
  else delete C.poidsLe;
  return out;
}
// Lecture complète (Afficher) : les trois parties
export function htmlLectureFiche(x) {
  const esc = A.esc, doc = docVu(x), dg = diagDe(x), L = champsFiche().filter((c) => c.present && (!c.ajout || !c.ajout.si || champPropose(c.ajout, dg)));
  return PARTIES_F.map(([k, lib]) => { const l = L.filter((c) => c.section === k); if (!l.length) return "";
    return '<h4 class="soustitre fp-sec">' + lib + '</h4><div class="form fiche-lecture" data-sec="' + k + '">' + l.map((c) => { const t = texteChamp(doc, c);
      const tp = c.k === "poids" && poidsVu(x) ? textePoids(poidsVu(x)) : t;
      return '<div data-champ="' + c.k + '"' + (tp.length > 60 || /\n/.test(tp) ? ' class="large"' : "") + "><label>" + esc(c.lib) + "</label><div>" + (tp ? "<b>" + esc(tp) + "</b>" : '<span class="mesures">—</span>') + "</div></div>"; }).join("") + "</div>"; }).join("");
}
// En-tête du dossier : champs « en tête » qui ont une valeur (sauf ceux déjà sous le nom : sauf)
export function htmlEnteteFiche(x, sauf) {
  const esc = A.esc, doc = docVu(x), dg = diagDe(x);
  return champsFiche().filter((c) => c.present && c.entete && (sauf || []).indexOf(c.k) < 0 && (!c.ajout || !c.ajout.si || champPropose(c.ajout, dg))).map((c) => { const t = c.k === "poids" && poidsVu(x) ? textePoids(poidsVu(x)) : texteChamp(doc, c); if (!t) return "";
    const v = c.type === "tel" ? '<a href="tel:' + esc(brut(doc, c)) + '">' + esc(t) + "</a>" : esc(t);
    return '<div data-champ="' + c.k + '"' + (c.k === "cor" ? ' data-fn="listes.cor"' : "") + (t.length > 60 ? ' class="large"' : "") + "><label>" + esc(c.lib) + "</label><b>" + v + "</b></div>"; }).join("");
}


// ───── R-G a (audit n° 5, 19/10/2026) : bandeau du dossier ─────
// Ligne 1 : « Chimio en cours » et « RT en cours » (cochés par défaut, réglables comme les champs : entetes._chimio / ._rt)
export const ligne1 = () => { const en = F().entetes || {}, o = {}; ENTETE_CALC.forEach(([k]) => { o[k] = typeof en[k] === "boolean" ? en[k] : !!ENTETE_CALC0[k]; }); return o; };
// Valeurs calculées proposées à cocher (ligne 2) : surface corporelle (Mosteller, poids actuel et taille), localisation et stade
function valeurCalc(x, k) {
  const doc = docVu(x), C = doc.clinique || {}, pa = poidsVu(x), num = (v) => parseFloat(String(v == null ? "" : v).replace(",", "."));
  if (k === "_sc") { const po = pa ? pa.poids : num(C.poids), ta = num(C.taille); return po > 0 && ta > 0 ? String(Math.round(Math.sqrt((po * ta) / 3600) * 100) / 100).replace(".", ",") + " m²" : ""; }
  if (k === "_locst") { const st = ((C.extra || {}).xtstade) || ""; return [C.diag || "", st ? "stade " + st : ""].filter(Boolean).join(", "); }
  return "";
}
// Libellés courts de départ (maquette du 17/10) quand le cabinet n'en a pas donné ; le nom complet reste au survol
const COURTS0 = { ddn: "Né(e) le", tel: "Tél.", tel2: "Tél. 2", etab: "Lieu", mut: "Mut.", cor: "Corresp.", diag: "Tumeur", diagP: "Précision", adresse: "Adr.", email: "E-mail" };
// Ligne 2 : seulement les champs cochés « Dans le bandeau » (libellé court s'il y en a un), puis les valeurs calculées cochées ; les dernières
// nouvelles (3.3) à la fin. Nom, sexe (ligne 1) et allergie « oui » (badge rouge de la ligne 1) n'y sont pas repris.
export function htmlBandeau(x, dn) {
  const esc = A.esc, doc = docVu(x), dg = diagDe(x), R = F(), courts = R.courts || {}, en = R.entetes || {}, P = (x && x.P) || {};
  const sauf = ["nom", "prenom", "sexe"].concat(P.allergie ? ["allergies"] : []);
  const item = (k, lib, t, v) => '<span class="bn-c" data-champ="' + k + '"' + (k === "cor" ? ' data-fn="listes.cor"' : "") + ' title="' + esc(lib + " : " + t) + '"><i>' + esc(courts[k] || (!(R.libs || {})[k] && COURTS0[k]) || lib) + "</i> " + (v || esc(t)) + "</span>";
  const L = champsFiche().filter((c) => c.present && c.entete && sauf.indexOf(c.k) < 0 && (!c.ajout || !c.ajout.si || champPropose(c.ajout, dg))).map((c) => {
    const t = c.k === "poids" && poidsVu(x) ? textePoids(poidsVu(x)) : c.k === "ddn" ? A.dfrA(brut(doc, c) || "") : texteChamp(doc, c); if (!t) return "";
    return item(c.k, c.lib, t, c.type === "tel" ? '<a href="tel:' + esc(brut(doc, c)) + '">' + esc(t) + "</a>" : ""); });
  ENTETE_CALC.filter(([k, , l]) => l === 2 && (typeof en[k] === "boolean" ? en[k] : !!ENTETE_CALC0[k])).forEach(([k, lib]) => { const t = valeurCalc(x, k); if (t) L.push(item(k, lib, t)); });
  if (dn) L.push(item("_dn", "Dernières nouvelles", A.dfrA(dn)));
  return L.join("");
}
// Colonne Patient : chaque partie de la fiche en lecture (tous ses champs, pas seulement ceux du bandeau) et le nombre de champs remplis
export function partiesLecture(x) {
  const esc = A.esc, doc = docVu(x), dg = diagDe(x), out = { n: {}, libs: {} }, L = champsFiche().filter((c) => c.present && (!c.ajout || !c.ajout.si || champPropose(c.ajout, dg)));
  PARTIES_F.forEach(([k, lib]) => { const l = L.filter((c) => c.section === k); if (!l.length) return; let n = 0;
    out[k] = '<div class="fiche-lecture dp-f" data-sec="' + k + '">' + l.map((c) => { const t = c.k === "poids" && poidsVu(x) ? textePoids(poidsVu(x)) : texteChamp(doc, c); if (t) n++;
      const al = c.k === "allergies" && /^Oui/.test(t);
      return '<div data-champ="' + c.k + '"' + (al ? ' class="allergie"' : "") + (c.k === "cor" ? ' data-fn="listes.cor"' : "") + "><label>" + esc(c.lib) + "</label>" + (t ? c.type === "tel" ? '<a href="tel:' + esc(brut(doc, c)) + '"><b>' + esc(t) + "</b></a>" : "<b>" + esc(t) + "</b>" : '<span class="mesures">—</span>') + "</div>"; }).join("") + "</div>";
    out.n[k] = n; out.libs[k] = lib; });
  return out;
}
