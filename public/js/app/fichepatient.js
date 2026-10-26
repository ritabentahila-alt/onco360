// Onco360 – fiche patient réglable (étape 16, 10/10/2026). La fiche de la spécialité (la même pour tous les packs), puis les retouches
// du cabinet (D().reg.fiche) disent quels champs sont présents, dans quel ordre, sous quel nom, et ajoutent des champs (texte,
// nombre, date, liste de choix, oui / non).
// 3.11 (12/10/2026) : les formulaires (Nouveau patient, Modifier, Afficher ; en-tête du dossier jusqu'au lot A) sont rendus ici depuis la fiche effective
// (champsDe : type, nom, partie, ordre, liste, unité, imprimé, en-tête de chaque champ) ; un champ retiré n'est pas affiché, sa valeur est gardée.
// Valeurs des champs ajoutés : identite.extra { id: valeur } ou clinique.extra (selon la partie du champ).
import { champPropose, champsDe, drapeau } from "../donnees/catalogue.js";
import { htmlEditeur, lireEditeur, elements, texteDe as texteLignes } from "./infosmed.js"; // lot A §4 : antécédents, allergies, traitements en lignes
import { age as ageDe } from "../moteur/outils.js";
import { textePoids } from "../moteur/poids.js";
let A = null;
export function installer(api) { A = api; }
const D = () => A.D();
const F = () => (D().reg && D().reg.fiche) || { ordre: [], champs: {}, libs: {}, ajouts: [] };
export const champsAjoutes = () => F().ajouts;

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
  const lignes = (s) => elements(s, c.k).map((e) => e.lib + (e.dosage ? " " + e.dosage : "") + (e.note ? " (" + e.note + ")" : "")).join(" ; "); // lot A : une ligne par élément
  if (c.type === "ouinonp") { const d = brutDrap(doc, c), w = c.k === "allergies" ? lignes(v) : v; return d === "oui" ? "Oui" + (w ? " : " + w : "") : d === "non" ? "Non" : w ? esc(w) : ""; }
  if (c.type === "listem") return lignes(v);
  if (v == null || v === "") return "";
  if (c.type === "date") return A.dfrA(v) + (c.k === "ddn" ? (() => { const a = ageDe(v, D().t); return a != null ? " (" + a + " ans)" : ""; })() : "");
  if (c.type === "sexe") return v === "F" ? "Femme" : v === "H" ? "Homme" : "";
  if (c.type === "ouinon") return oui(v) ? "Oui" : String(v).toLowerCase() === "non" ? "Non" : String(v);
  if (c.type === "etab") { const e = (D().etabsTous || D().etabs || []).find((z) => z.code === v); return e && e.nom ? e.code + " – " + e.nom : String(v); }
  return String(v) + (c.type === "nombre" && c.unite ? " " + c.unite : "");
}
const PARTIES_F = [["id", "Identité et administratif"], ["med", "Informations médicales"], ["tum", "Fiche tumeur"]];
// R-C3 (19/10/2026, audit 4 réponse 1) : médecin du patient (= médecin référent, un seul champ) : identite.med (uid). Champ fixe, montré à partir
// de 2 médecins (avec un seul, il est posé d'office à la création). Médecin qui crée le dossier = lui ; secrétaire = elle choisit ; modifiable.
// Il devient le médecin par défaut des rendez-vous, lignes de chimio, radiothérapies et consultations automatiques (sinon : le titulaire).
const medsP = () => (A.multiMed && A.multiMed() ? A.medecins() : []);
export function medecinParDefaut() { const m = D().membre, l = (A.medecins && A.medecins()) || []; return m.role === "medecin" ? D().u.uid : m.role === "remplacant" ? A.medDefaut() : l.length === 1 ? l[0].uid : ""; } // Lot C : remplaçant = au nom du titulaire
function htmlMedecin(x, o) {
  const l = medsP(); if (!l.length) return ""; const I = ((x && x.doc) || {}).identite || {}, v = I.med || (o.nouveau ? medecinParDefaut() : ""), dis = o.off && o.off("identite") ? " disabled" : "";
  const opts = (v ? [] : [["", "— Choisir —"]]).concat(l.map((m) => [m.uid, m.nom])).concat(v && !l.some((m) => m.uid === v) ? [[v, "Médecin retiré de l'équipe"]] : []);
  return '<div data-champ="medecin"><label for="fMedP">Médecin du patient</label><select id="fMedP"' + dis + ">" + opts.map(([u, n]) => '<option value="' + A.esc(u) + '"' + (u === v ? " selected" : "") + ">" + A.esc(n) + "</option>").join("") + "</select></div>";
}
// Formulaire de saisie : o = { off(partie) → vrai si non modifiable, etabs (hôpitaux proposés), nouveau, sec (parties montrées : "id" | "med" | "tum"
// ou liste ; sans : les trois) }. 20/10/2026 (demande de Dr Bentahila) : Nouveau patient et « Modifier » du bandeau = Identité et administratif
// seulement ; Informations médicales et Fiche tumeur : chacune par son « Modifier » dans la colonne Patient. Une partie non montrée n'est pas lue.
const secsDe = (o) => { const s = o && o.sec; return s ? [].concat(s) : PARTIES_F.map((z) => z[0]); };
export const partiesPresentes = () => { const L = champsFiche().filter((c) => c.present); return PARTIES_F.map((z) => z[0]).filter((k) => L.some((c) => c.section === k)); };
// 26/10/2026 (demande de Dr Bentahila) : formulaire ouvert, champs côte à côte : OMS seul sur sa ligne (SEUL) ; Taille et Poids, ALD et Correspondant,
// Mutuelle et E-mail, cTNM et pTNM (DEUX), Antécédents familiaux et Traitements en cours sur une même ligne ; Adresse, Mode de vie : toute la ligne.
// Les champs suivent l'ordre réglé ; dans le formulaire seulement, le 2e champ d'une paire (PAIRES) est placé juste après le 1er, qui commence
// toujours une ligne (v2.html) ; la colonne Patient et l'ordre enregistré ne changent pas.
const SEUL = ["xtoms"], DEUX = ["xtctnm", "xtptnm"], PAIRES = [["taille", "poids"], ["atcdFam", "traitCours"], ["xtctnm", "xtptnm"], ["ald", "cor"], ["mut", "email"]];
const rapprocher = (l) => { const r = l.slice(); PAIRES.forEach(([a, b]) => { const i = r.findIndex((c) => c.k === a), j = r.findIndex((c) => c.k === b); if (i < 0 || j < 0 || j === i + 1) return; const [cb] = r.splice(j, 1); r.splice(r.findIndex((c) => c.k === a) + 1, 0, cb); }); return r; };
export function htmlFormulaire(x, o) {
  const esc = A.esc, doc = docVu(x), dg = diagDe(x), L = champsFiche().filter((c) => c.present && (!o.seul || c.k === o.seul)), pa = poidsVu(x); // o.seul (lot A) : un seul champ
  const champ = (c) => {
    if (o.nouveau && o.off && o.off(c.partie)) return ""; // nouveau patient : partie non autorisée = non proposée
    const id = idDe(c), v = brut(doc, c), V = v == null ? "" : v, dis = o.off && o.off(c.partie) ? " disabled" : "", lab = '<label for="' + id + '">' + esc(c.lib) + (c.type === "nombre" && c.unite ? " (" + esc(c.unite) + ")" : "") + "</label>";
    const si = c.ajout && c.ajout.si ? ' data-si="1"' + (champPropose(c.ajout, dg) ? "" : ' class="cache"') : "", large = ["textelong", "ouinonp"].indexOf(c.type) >= 0 || ["adresse", "diag", "diagP"].indexOf(c.k) >= 0 || (c.ajout && c.type === "texte" && DEUX.indexOf(c.k) < 0);
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
          '<div id="' + z + '"' + (d === "oui" ? "" : ' class="cache"') + ' style="margin-top:6px"><label for="' + id + '">' + (c.k === "allergies" ? "Laquelle ou lesquelles ?" : "Précisez") + "</label>" +
          (c.k === "allergies" && !dis ? htmlEditeur("allergies", elements(V, "allergies")) : '<textarea id="' + id + '" rows="2" class="champ-t"' + dis + ">" + esc(V) + "</textarea>") + "</div>"); } // lot A §4 : allergies en lignes (liste du cabinet)
      case "listem": return enve('<label>' + esc(c.lib) + "</label>" + (dis ? '<div class="mesures">' + esc(texteChamp(doc, c) || "—") + "</div>" : htmlEditeur(c.k, elements(V, c.k)))); // lot A §4
      case "choix": { const ch = choixDeC(c), l = ch.concat(V && ch.indexOf(V) < 0 ? [V] : []); return enve(lab + '<select id="' + id + '"' + dis + '><option value=""></option>' + l.map((t) => "<option" + (t === V ? " selected" : "") + ">" + esc(t) + "</option>").join("") + "</select>", SEUL.indexOf(c.k) >= 0 ? "large" : " "); }
      case "textelong": return enve(lab + '<textarea id="' + id + '" rows="2" class="champ-t"' + dis + ">" + esc(V) + "</textarea>");
      default: if (c.k === "poids" && pa && pa.src === "seance") return enve(lab + '<input id="' + id + '" inputmode="decimal" value="' + esc(V) + '"' + dis + '><span class="mesures">' + esc(pa.lib) + "</span>"); // R-A5
        return enve(lab + '<input id="' + id + '"' + (c.type === "date" ? ' type="date"' : c.type === "nombre" ? ' inputmode="decimal"' : c.type === "tel" ? ' type="tel"' : c.type === "email" ? ' type="email"' : "") + ' value="' + esc(V) + '"' + dis + ">");
    }
  };
  const S = secsDe(o);
  return PARTIES_F.filter(([k]) => S.indexOf(k) >= 0).map(([k, lib]) => { const h = rapprocher(L.filter((c) => c.section === k)).map(champ).join("") + (k === "id" && !(o.nouveau && o.off && o.off("identite")) ? htmlMedecin(x, o) : ""); return h ? '<h4 class="soustitre fp-sec">' + lib + '</h4><div class="form" data-sec="' + k + '">' + h + "</div>" : ""; }).join("") +
    '<datalist id="lMut">' + (A.listeMut ? A.listeMut() : []).map((m) => '<option value="' + esc(m) + '">').join("") + '</datalist><datalist id="lCor">' + (A.listeCor ? A.listeCor() : []).map((m) => '<option value="' + esc(m) + '">').join("") + "</datalist>";
}
// Lecture du formulaire : { identite, clinique, etab, erreur } (copies des parties du dossier, champs modifiables seulement)
export function lireFormulaire(x, o) {
  const doc = (x && x.doc) || {}, I = Object.assign({}, doc.identite || {}), C = Object.assign({}, doc.clinique || {}), out = { identite: I, clinique: C, etab: null, erreur: "" };
  const el = (i) => document.getElementById(i), val = (i) => { const e = el(i); return e ? String(e.value || "").replace(/\s+$/, "").trim() : null; };
  champsFiche().filter((c) => c.present).forEach((c) => {
    if (c.type === "listem") { const z = document.querySelector('[data-champ="' + c.k + '"] .im-ed'); if (!z) return; const r = lireEditeur(z); if (r.erreur && !out.erreur) out.erreur = r.erreur; // lot A §4
      const tx = r.L.length ? r.L : []; if (tx.length) C[c.k] = texteLignes(tx, c.k); else delete C[c.k]; (out.nouveaux = out.nouveaux || {})[c.k] = r.L.map((z2) => z2.lib); return; }
    const id = idDe(c), e = el(c.type === "ouinonp" ? idDrap(c) : id); if (!e || e.disabled) return;
    if (c.k === "etab") { out.etab = val(id) || null; return; }
    const obj = c.partie === "clinique" ? C : I, cible = c.ajout ? (obj.extra = Object.assign({}, obj.extra || {})) : obj, cle = c.ajout ? c.k : STO[c.k] || c.k;
    const pose = (k, v) => { if (v == null || v === "") delete cible[k]; else cible[k] = v; };
    if (c.type === "ouinonp") { const d = val(idDrap(c)), zl = c.k === "allergies" ? document.querySelector('[data-champ="allergies"] .im-ed') : null, r = zl ? lireEditeur(zl) : null;
      if (r && r.erreur && !out.erreur) out.erreur = r.erreur; const t = r ? texteLignes(r.L, "allergies") : val(id);
      if (r && d !== "non") (out.nouveaux = out.nouveaux || {}).allergies = r.L.map((z2) => z2.lib); pose(c.ajout ? c.k + "Oui" : drapeau(c.k), d); pose(cle, d === "non" ? "" : t); return; }
    let v = val(id);
    if (c.k === "nom") v = (v || "").toUpperCase(); if (c.k === "cin") v = (v || "").toUpperCase();
    if (c.type === "nombre" && v) v = v.replace(",", ".");
    pose(cle, v);
    if (c.ajout && !Object.keys(cible).length) delete obj.extra;
  });
  if (el("fMedP") && !el("fMedP").disabled) { const m = val("fMedP"); if (m) I.med = m; else delete I.med; } // R-C3
  if (el("fNomF") && !el("fNomF").disabled) { if (!I.nomF || !I.prenom) out.erreur = "Le nom et le prénom sont obligatoires."; I.nom = ((I.nomF || "") + " " + (I.prenom || "")).trim(); }
  ["identite", "clinique"].forEach((p) => { const ob = out[p]; if (ob.extra && !Object.keys(ob.extra).length) delete ob.extra; });
  // R-A5 : date du poids : celle de la séance si c'est le poids proposé (dernière chimio), maintenant s'il a été changé à la main
  const pa = poidsVu(x), num = (v) => parseFloat(String(v == null ? "" : v).replace(",", ".")), p0 = (doc.clinique || {}).poids;
  if (!el("fPoids")) { /* poids absent du formulaire (autre partie) : rien à changer */ }
  else if (C.poids != null && C.poids !== "") { if (pa && num(C.poids) === pa.poids) C.poidsLe = pa.d || C.poidsLe; else if (num(C.poids) !== num(p0)) C.poidsLe = new Date().toISOString(); } // date et heure : passe devant une séance du même jour
  else delete C.poidsLe;
  if (C.poidsLe == null || C.poidsLe === "") delete C.poidsLe; // 20/10/2026 : poids sans date connue (fiche ancienne) : jamais « undefined » (Firestore refusait l'enregistrement)
  return out;
}
// Lecture complète (Afficher) : les trois parties ; sec (lot A §3) : une seule partie (rubrique ouverte au centre, sans droit de modifier)
export function htmlLectureFiche(x, sec) {
  const esc = A.esc, doc = docVu(x), dg = diagDe(x), L = champsFiche().filter((c) => c.present && (!c.ajout || !c.ajout.si || champPropose(c.ajout, dg)));
  return PARTIES_F.filter(([k]) => !sec || k === sec).map(([k, lib]) => { const l = L.filter((c) => c.section === k); if (!l.length) return "";
    const md = k === "id" && medsP().length ? '<div data-champ="medecin"><label>Médecin du patient</label><div>' + (((doc.identite || {}).med) ? "<b>" + esc(A.nomMed(doc.identite.med) || "Médecin retiré de l'équipe") + "</b>" : '<span class="mesures">— (titulaire)</span>') + "</div></div>" : ""; // R-C3
    return '<h4 class="soustitre fp-sec">' + lib + '</h4><div class="form fiche-lecture" data-sec="' + k + '">' + md + l.map((c) => { const t = texteChamp(doc, c);
      const tp = c.k === "poids" && poidsVu(x) ? textePoids(poidsVu(x)) : t;
      return '<div data-champ="' + c.k + '"' + (tp.length > 60 || /\n/.test(tp) ? ' class="large"' : "") + "><label>" + esc(c.lib) + "</label><div>" + (tp ? "<b>" + esc(tp) + "</b>" : '<span class="mesures">—</span>') + "</div></div>"; }).join("") + "</div>"; }).join("");
}
// Lot A §1 (25/10/2026) : bandeau du dossier retiré (htmlBandeau, ligne1, htmlEnteteFiche) : remplacé par le bloc patient de v2.js
// Colonne Patient : chaque partie de la fiche en lecture (tous ses champs, pas seulement ceux du bandeau) et le nombre de champs remplis ;
// o.plus = { partie: lignes ajoutées à la fin } (lot A §1 : médecin du patient et dernières nouvelles, avant dans le bandeau) ; o.sauf = champs à ne
// pas reprendre (lot A §4 : sous-parties des informations médicales, dessinées par infosmed.js) ; o.vide = { partie: (clé) → html d'un champ vide }
// (« non renseigné » cliquable des informations médicales)
export function partiesLecture(x, o) {
  const esc = A.esc, doc = docVu(x), dg = diagDe(x), out = { n: {}, libs: {} }, sauf = (o && o.sauf) || [], L = champsFiche().filter((c) => c.present && (!c.ajout || !c.ajout.si || champPropose(c.ajout, dg)));
  PARTIES_F.forEach(([k, lib]) => { out.libs[k] = lib; const l = L.filter((c) => c.section === k && sauf.indexOf(c.k) < 0); if (!l.length) return; let n = 0; // o.sauf (lot A) : champs affichés à part (informations médicales)
    // 26/10/2026 : o.rendu = { partie: { clé: { html, plein } } } : sous-parties des informations médicales dessinées par infosmed.js, à leur place dans l'ordre réglé
    out[k] = '<div class="fiche-lecture dp-f" data-sec="' + k + '">' + l.map((c) => { const rp = o && o.rendu && o.rendu[k] && o.rendu[k][c.k]; if (rp) { if (rp.plein) n++; return rp.html; }
      const t = c.k === "poids" && poidsVu(x) ? textePoids(poidsVu(x)) : texteChamp(doc, c); if (t) n++;
      const al = c.k === "allergies" && /^Oui/.test(t);
      return '<div data-champ="' + c.k + '"' + (al ? ' class="allergie"' : "") + (c.k === "cor" ? ' data-fn="listes.cor"' : "") + "><label>" + esc(c.lib) + "</label>" + (t ? c.type === "tel" ? '<a href="tel:' + esc(brut(doc, c)) + '"><b>' + esc(t) + "</b></a>" : "<b>" + esc(t) + "</b>" : o && o.vide && o.vide[k] ? o.vide[k](c.k) : '<span class="mesures">—</span>') + "</div>"; }).join("") + ((o && o.plus && o.plus[k]) || "") + "</div>";
    out.n[k] = n; out.libs[k] = lib; });
  return out;
}
