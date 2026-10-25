// Onco360 – notes « À vérifier » par molécule (12/10/2026, demande de Dr Bentahila) : rubrique « Vigilance des molécules » de
// Paramètres › Listes et bibliothèques ; affichées dans la séance de chimiothérapie (chimio.js) pour les molécules du jour.
// parametres/vigilances { data: JSON [{ id, nom, mots, txt }] } ; absent = liste de départ VIG0 (moteur/vigilance.js).
// Lu par les membres, modifié avec le droit « paramètres » (règle parametres/{d}). Les contrôles automatiques (fenêtre à la
// validation) sont dans moteur/vigilance.js et ne dépendent pas de ces notes.
import { doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "../config.js";
import { VIG0, vigAudit3 } from "../moteur/vigilance.js";
import { FLACONS0, lireFlacons, ecrireFlacons, INTERACTIONS0, interactionsEffectives } from "../moteur/p10.js";

let A = null;
export function installer(api) { A = api; }
let NOTES = null, ESP = null, VE = null, VMOD = false; // notes lues (null = à lire), cabinet lu, copie en cours de modification

// Notes du cabinet (liste de départ tant que la lecture n'est pas faite ; `apres` est rappelée une fois la lecture faite)
export function notesVigilance(apres) {
  if (NOTES === null || ESP !== A.ESPACE) {
    NOTES = VIG0; ESP = A.ESPACE;
    getDoc(doc(db, "espaces", A.ESPACE, "parametres", "vigilances")).then((s) => {
      if (s.exists()) { try { NOTES = JSON.parse(s.data().data || "[]"); } catch (e) { NOTES = VIG0; } if (apres) apres(); }
    }).catch(() => {});
  }
  return NOTES;
}

// P10 k (18/10/2026) : tailles des flacons du cabinet (parametres/flacons { data: JSON { "MOLÉCULE": [mg] } }) ; absent = FLACONS0
let FLAC = null, FESP = null;
export function flaconsCabinet(apres) {
  if (FLAC === null || FESP !== A.ESPACE) {
    FLAC = FLACONS0; FESP = A.ESPACE;
    getDoc(doc(db, "espaces", A.ESPACE, "parametres", "flacons")).then((s) => { if (s.exists()) { try { FLAC = JSON.parse(s.data().data || "{}"); } catch (e) { FLAC = FLACONS0; } if (apres) apres(); } }).catch(() => {});
  }
  return FLAC;
}
// S5 (21/10/2026, audit n° 10 d. 47, « aussi dans le paramétrage ») : interactions du cabinet (parametres/interactions { data: JSON [{ id, a, b,
// m, cl }], retires: [id de départ retirés] }) ; absent = INTERACTIONS0 ; une interaction de départ ajoutée plus tard arrive sans écraser (interactionsEffectives)
let INTER = null, IESP = null, IE = null, IMOD = false;
export function interactionsCabinet(apres) {
  if (INTER === null || IESP !== A.ESPACE) {
    INTER = INTERACTIONS0; IESP = A.ESPACE;
    getDoc(doc(db, "espaces", A.ESPACE, "parametres", "interactions")).then((s) => {
      if (s.exists()) { let L = null; try { L = JSON.parse(s.data().data || "null"); } catch (e) { L = null; } INTER = interactionsEffectives(L, s.data().retires); if (apres) apres(); }
    }).catch(() => {});
  }
  return INTER;
}
function htmlInteractions(ok) {
  if (!IE || !IMOD) IE = JSON.parse(JSON.stringify(interactionsCabinet(() => { if (!IMOD && location.hash.indexOf("vigilances") >= 0) window.cfOnglet("vigilances"); })));
  const esc = A.esc, dis = ok ? "" : " disabled";
  return '<section class="carte" id="vgInter"><h3><span class="ic">' + A.ic("alerte") + '</span>Interactions <span class="cf-n">' + IE.length + "</span></h3>" +
    '<p class="sous">Une interaction s\'affiche dans la séance et à la validation quand une molécule de la séance contient un des mots de la 1re colonne et que les traitements en cours ou les antécédents de la fiche contiennent un des mots de la 2e (séparés par des virgules ; un mot de moins de 5 lettres, comme AINS, est cherché comme mot entier). Clairance : seulement sous cette valeur (facultatif). Jamais bloquant. Les interactions écrites dans Onco360 (aprépitant, IPP, QT, méthotrexate…) restent en plus.</p>' +
    IE.map((I, i) => '<div class="cf-auto"><div class="form" style="grid-template-columns:1fr 1fr 110px">' +
      '<div><label for="viA' + i + '">Molécules de la séance</label><input id="viA' + i + '" value="' + esc(I.a) + '"' + dis + ' onchange="viCh(' + i + ',\'a\',this.value)"></div>' +
      '<div><label for="viB' + i + '">Traitements de la fiche</label><input id="viB' + i + '" value="' + esc(I.b) + '"' + dis + ' onchange="viCh(' + i + ',\'b\',this.value)"></div>' +
      '<div><label for="viC' + i + '">Clairance sous</label><input id="viC' + i + '" inputmode="numeric" value="' + esc(I.cl || "") + '"' + dis + ' onchange="viCh(' + i + ',\'cl\',this.value)"></div>' +
      '<div class="large"><label for="viM' + i + '">Message</label><textarea id="viM' + i + '" rows="2"' + dis + ' onchange="viCh(' + i + ',\'m\',this.value)">' + esc(I.m) + "</textarea></div></div>" +
      (ok ? '<div class="actr"><button class="sup" type="button" title="Retirer" aria-label="Retirer cette interaction" onclick="viSup(' + i + ')">' + A.ic("corbeille") + "</button></div>" : "") + "</div>").join("") +
    (ok ? '<button class="bt clair petit" style="margin-top:10px" onclick="viAj()">' + A.ic("plus") + "Ajouter une interaction</button>" +
      '<div class="barre-enr"><button class="bt gris" onclick="viDefaut()">↺ Liste de départ</button><span id="viMod" class="mesures' + (IMOD ? "" : " cache") + '">Modifications non enregistrées</span>' +
      '<button class="bt plein" id="viOk" onclick="viEnregistrer()"><svg class="pi"><use href="#i-enregistrer"/></svg>Enregistrer les interactions</button></div>' : "") + "</section>";
}
const imarquer = (redessiner) => { IMOD = true; if (redessiner) window.cfOnglet("vigilances"); else { const m = document.getElementById("viMod"); if (m) m.classList.remove("cache"); } };
window.viCh = (i, k, v) => { if (!IE || !IE[i]) return; IE[i][k] = k === "cl" ? (String(v || "").trim() === "" ? "" : Number(String(v).replace(",", ".")) || "") : String(v || "").trim(); imarquer(); };
window.viSup = (i) => { if (!confirm("Retirer cette interaction ?")) return; IE.splice(i, 1); imarquer(true); };
window.viAj = () => { IE.push({ id: "i" + Date.now().toString(36), a: "", b: "", m: "", cl: "" }); imarquer(true); };
window.viDefaut = () => { if (!confirm("Remettre la liste de départ (vos interactions modifiées seront remplacées à l'enregistrement) ?")) return; IE = JSON.parse(JSON.stringify(INTERACTIONS0)); imarquer(true); };
window.viEnregistrer = async () => {
  const L = IE.filter((I) => I.a || I.b || I.m).map((I) => Object.assign({ id: I.id, a: I.a, b: I.b, m: I.m }, I.cl ? { cl: I.cl } : {}));
  if (L.some((I) => !I.a || !I.b || !I.m)) { A.toast("Chaque interaction a besoin de molécules, de traitements et d'un message."); return; }
  const ids = new Set(L.map((I) => I.id)), retires = INTERACTIONS0.filter((I) => !ids.has(I.id)).map((I) => I.id);
  A.occupe(document.getElementById("viOk"), true);
  try {
    await setDoc(doc(db, "espaces", A.ESPACE, "parametres", "interactions"), { data: JSON.stringify(L), retires, maj: serverTimestamp(), majPar: A.D().u.uid });
    INTER = interactionsEffectives(L, retires); IE = null; IMOD = false; A.toast("Interactions enregistrées."); window.cfOnglet("vigilances");
  } catch (e) { A.occupe(document.getElementById("viOk"), false); A.erreur(e && e.code === "permission-denied" ? "Vous n'avez pas le droit de modifier les paramètres." : (e.message || String(e))); }
};
window.vgFlacons = async () => {
  const T = lireFlacons(document.getElementById("vgFl").value);
  try { await setDoc(doc(db, "espaces", A.ESPACE, "parametres", "flacons"), { data: JSON.stringify(T), maj: serverTimestamp(), majPar: A.D().u.uid }); FLAC = T; A.toast("Flacons enregistrés."); }
  catch (e) { A.erreur(e && e.code === "permission-denied" ? "Vous n'avez pas le droit de modifier les paramètres." : (e.message || String(e))); }
};
// Audit n° 3 (18/10/2026) : seuils du jour ajoutés à la liste déjà enregistrée par le cabinet, une fois (médecin ; audit3f)
export async function vigilancesAudit3() {
  if (!A.peut("parametres") || !A.D().membre || !A.estMed()) return null;
  const rm = doc(db, "espaces", A.ESPACE, "parametres", "migrations"), g = await getDoc(rm).catch(() => null);
  if (!g || (g.exists() && g.data().audit3f)) return null;
  const s = await getDoc(doc(db, "espaces", A.ESPACE, "parametres", "vigilances")).catch(() => null);
  let n = 0;
  if (!s) return null; // lecture en échec (R-A1) : rien d'écrit, nouvel essai à la prochaine ouverture
  if (s.exists()) {
    let L; try { L = JSON.parse(s.data().data || "[]"); } catch (e) { L = null; }
    if (!Array.isArray(L)) { console.warn("vigilances : liste du cabinet illisible, rien n'est écrit"); return null; } // jamais remplacée par les seuls ajouts
    const r = vigAudit3(L); n = r.n;
    if (n) { await setDoc(doc(db, "espaces", A.ESPACE, "parametres", "vigilances"), { data: JSON.stringify(r.liste), maj: serverTimestamp(), majPar: A.D().u.uid }); NOTES = r.liste; }
  }
  await setDoc(rm, { audit3f: new Date().toISOString().slice(0, 10) }, { merge: true });
  return n;
}
// ───── Paramètres › Listes et bibliothèques › Vigilance des molécules ─────
export function htmlVigilances(ok) {
  if (!VE || !VMOD) VE = JSON.parse(JSON.stringify(notesVigilance(() => { if (!VMOD && location.hash.indexOf("vigilances") >= 0) window.cfOnglet("vigilances"); })));
  const esc = A.esc, dis = ok ? "" : " disabled";
  return '<section class="carte"><h3><span class="ic">' + A.ic("alerte") + '</span>Vigilance des molécules <span class="cf-n">' + VE.length + "</span></h3>" +
    '<p class="sous">Notes « À vérifier » affichées dans la séance de chimiothérapie quand une molécule de la séance contient un des mots indiqués (DCI ou marque, séparés par des virgules). ' +
    "Les contrôles automatiques (dose cumulée, FEVG, TSH, uracilémie, bilan du jour, radiothérapie en cours…) ouvrent de toute façon une fenêtre à la validation si quelque chose cloche.</p>" +
    VE.map((N, i) => '<div class="cf-auto"><div class="form" style="grid-template-columns:1fr 2fr"><div><label>Nom</label><input value="' + esc(N.nom) + '"' + dis + ' onchange="vgCh(' + i + ',\'nom\',this.value)"></div>' +
      '<div><label>Mots cherchés dans le nom du produit</label><input value="' + esc(N.mots) + '"' + dis + ' onchange="vgCh(' + i + ',\'mots\',this.value)"></div>' +
      '<div class="large"><label>À vérifier</label><textarea rows="2"' + dis + ' onchange="vgCh(' + i + ',\'txt\',this.value)">' + esc(N.txt) + "</textarea></div></div>" +
      (ok ? '<div class="actr">' + '<button class="sup" type="button" title="Retirer" aria-label="Retirer « ' + esc(N.nom) + ' »" onclick="vgSup(' + i + ')">' + A.ic("corbeille") + "</button></div>" : "") + "</div>").join("") +
    (ok ? '<button class="bt clair petit" style="margin-top:10px" onclick="vgAj()">' + A.ic("plus") + "Ajouter une molécule</button>" +
      '<div class="barre-enr"><button class="bt gris" onclick="vgDefaut()">↺ Liste de départ</button><span id="vgMod" class="mesures' + (VMOD ? "" : " cache") + '">Modifications non enregistrées</span>' +
      '<button class="bt plein" id="vgOk" onclick="vgEnregistrer()"><svg class="pi"><use href="#i-enregistrer"/></svg>Enregistrer</button></div>' : "") + "</section>" +
    htmlInteractions(ok) +
    // P10 k (18/10/2026) : flacons du cabinet pour l'arrondi de la dose proposé dans la séance
    '<section class="carte"><h3><span class="ic">' + A.ic("pilule") + '</span>Flacons (arrondi de la dose)</h3><p class="sous">Une ligne par molécule : nom, deux-points, tailles des flacons en mg. Dans la séance, une dose arrondie au plus petit flacon est proposée à côté de la dose calculée quand l\'écart reste sous 5 % ; le médecin choisit de l\'appliquer ou non.</p>' +
    '<textarea id="vgFl" rows="10" style="width:100%;font-family:inherit"' + dis + ">" + esc(ecrireFlacons(flaconsCabinet(() => { if (location.hash.indexOf("vigilances") >= 0 && !VMOD) window.cfOnglet("vigilances"); }))) + "</textarea>" +
    (ok ? '<div class="barre-enr"><button class="bt gris" onclick="document.getElementById(\'vgFl\').value=' + esc(JSON.stringify(ecrireFlacons(FLACONS0))) + '">↺ Liste de départ</button><button class="bt plein" onclick="vgFlacons()"><svg class="pi"><use href="#i-enregistrer"/></svg>Enregistrer les flacons</button></div>' : "") + "</section>";
}
const marquer = (redessiner) => { VMOD = true; if (redessiner) window.cfOnglet("vigilances"); else { const m = document.getElementById("vgMod"); if (m) m.classList.remove("cache"); } };
window.vgCh = (i, k, v) => { VE[i][k] = String(v || "").trim(); marquer(); };
window.vgSup = (i) => { if (!confirm("Retirer « " + (VE[i].nom || "cette note") + " » ?")) return; VE.splice(i, 1); marquer(true); };
window.vgAj = () => { VE.push({ id: "v" + Date.now().toString(36), nom: "", mots: "", txt: "" }); marquer(true); };
window.vgDefaut = () => { if (!confirm("Remettre la liste de départ (vos notes modifiées seront remplacées à l'enregistrement) ?")) return; VE = JSON.parse(JSON.stringify(VIG0)); marquer(true); };
window.vgEnregistrer = async () => {
  const L = VE.filter((N) => N.nom || N.mots || N.txt);
  if (L.some((N) => !N.mots)) { A.toast("Indiquez au moins un mot cherché pour chaque molécule."); return; }
  A.occupe(document.getElementById("vgOk"), true);
  try {
    await setDoc(doc(db, "espaces", A.ESPACE, "parametres", "vigilances"), { data: JSON.stringify(L), maj: serverTimestamp(), majPar: A.D().u.uid });
    NOTES = L; VE = null; VMOD = false; A.toast("Enregistré."); window.cfOnglet("vigilances");
  } catch (e) { A.occupe(document.getElementById("vgOk"), false); A.erreur(e.message); }
};
export const vigilancesModifiees = () => VMOD || IMOD;
