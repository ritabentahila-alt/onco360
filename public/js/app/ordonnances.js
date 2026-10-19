// Onco360 – médicaments et ordonnance (étape 1C, 07/10/2026), bouton « Médic. » de l'onglet Consultation.
// Bibliothèque du cabinet : espaces/{e}/bibliotheques/medicaments = { data: JSON [{ id, nom, poso, classe }] } ; tant qu'elle
// n'existe pas, la liste de départ (donnees/medicaments.js) est affichée, et la 1re modification (+, ✎, ✕) l'enregistre.
// Ordonnance : médicaments choisis par double-clic, affichée sur une feuille A5 ou A4 modifiable (papier à en-tête : le haut
// de la feuille reste vide), signée au nom du médecin (celui de la secrétaire si c'est elle qui la fait), enregistrée en
// ligne « Médic. » dans la consultation du jour (consultations.js).
// Antécédents (petite flèche, étape 1D) : dates à gauche, ordonnance au centre ; Imprimer · Supprimer · Modifier (même date,
// la ligne de sa consultation suit) · Renouveler (nouvelle ordonnance à la date du jour) · Fermer.
// Ordonnances types (bouton « Ordo. type », 07/10/2026) : espaces/{e}/bibliotheques/ordostypes = { data: JSON [{ id, nom,
// items: [{ nom, poso }] }] } (départ : donnees/ordostypes.js) ; un clic sur une ordonnance type met tous ses médicaments
// dans l'ordonnance en préparation (modifiables ✎, à retirer ✕), puis « Afficher l'ordonnance » comme pour Médic.
import { doc, getDoc, setDoc, serverTimestamp, runTransaction } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "../config.js";
import { MEDICAMENTS0 } from "../donnees/medicaments.js";
import { ORDOS_TYPES0, appliquerOrdosAudit3 } from "../donnees/ordostypes.js";
import { MAJ_BIB, VERSION_BIB } from "../donnees/majbib.js"; // R-E3 / R-E4 (19/10/2026)
import { fusionnerListe, fusionnerOrdos, ajouterManquantes, retiresEntre } from "../moteur/bibmaj.js";
import { ANALYSES0, BILANS0 } from "../donnees/analyses.js";
import { EXAMENS0 } from "../donnees/examens.js";
import { COURRIERS0, CHAMPS_COURRIER } from "../donnees/courriers.js";
import { COURRIERS_RT0, CHAMPS_RT, MODELES_RT0, NOMS_RT } from "../donnees/modelesrt.js"; // documents de radiothérapie modifiables (12/10/2026)
import * as ficheP from "./fichepatient.js"; // champs ajoutés de la fiche, insérables dans les courriers (10/10/2026)
import { age, accordMedecin, srcImage } from "../moteur/outils.js";
import { installer as installerDocumentation } from "./documentation.js"; // bouton « Doc. » (08/10/2026)
import { enregistrerPrescription, trouverLigne, assurerConsultations, prescriptionsDe, supprimerPrescription, FAMILLES } from "./consultations.js";
import { margesMm, reglages } from "./reglages.js";
import { allergique, motsAllergie, diagnosticComplet, tumeurDe } from "../moteur/statut.js"; // 3.2 (12/10/2026)
import { marquerZones, zoneRestante, doublonsDe, doublonsListe, alertesAllergie, texteAlerte, paginer, cleMedicament, chimioOrale, doseOrale, remplirZones } from "../moteur/ordonnance.js"; // lot R-E (19/10/2026)
import { surface } from "../moteur/doses.js";

let A = null;
export function installer(api) { A = api; installerDocumentation(api); }
const D = () => A.D();
const $ = (i) => document.getElementById(i);
const trouver = (pid) => D().patients.find((p) => p.id === pid);
const peutEcrire = () => A.peut("ecrireConsultations");
const sansAcc = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
// Ordre des listes : favoris ⭐ d'abord (07/10/2026), puis alphabétique
const alpha = (a, b) => (b.fav ? 1 : 0) - (a.fav ? 1 : 0) || sansAcc(a.nom).localeCompare(sansAcc(b.nom));
// Listes du cabinet (médicaments, ordonnances types, analyses, examens, modèles de courriers) : créées, modifiées, supprimées
// et mises en favori par le médecin seulement (07/10/2026) ; la secrétaire s'en sert pour prescrire
const gereListes = () => peutEcrire() && D().membre.role === "medecin";
const gerer = (h) => (gereListes() ? h : "");
// Nouveau médicament dans la liste du cabinet : le médecin seulement (R-E5, 19/10/2026 ; la secrétaire l'a pu du 10/10 au 19/10) ;
// elle écrit un médicament hors liste en « ligne libre »
const ajouteMedic = () => gereListes();
const etoile = (o, fn) => !gereListes() ? (o.fav ? '<span class="ico etoile on" title="Favori" aria-label="Favori">' + ico("etoile") + "</span>" : "") : '<button class="ico etoile' + (o.fav ? " on" : "") + '" aria-pressed="' + !!o.fav + '" title="' + (o.fav ? "Retirer des favoris" : "Mettre en favori (en tête de liste)") + '" aria-label="Favori : ' + A.esc(o.nom) + '" onclick="' + fn + "('" + o.id + "')\">" + ico("etoile") + "</button>";
const ico = (n) => '<svg class="pi"><use href="#i-' + n + '"/></svg>';
// Lot R-E (19/10/2026) : petite question par-dessus la fenêtre (la fenêtre de l'ordonnance reste telle quelle dessous) ; boutons [[clé, libellé,
// classe]] ; Échap = le 1er bouton ; avant(clé) est appelé pendant le clic (ouvrir la fenêtre d'impression sans que le navigateur la bloque)
function question(html, boutons, avant) {
  return new Promise((res) => {
    const d = document.createElement("div"); d.className = "or-dlg"; d.setAttribute("role", "alertdialog"); d.setAttribute("aria-modal", "true");
    d.innerHTML = '<div class="boite">' + html + '<div class="boutons">' + boutons.map(([k, l, c]) => '<button type="button" class="bt ' + (c || "gris") + '" data-k="' + k + '">' + l + "</button>").join("") + "</div></div>";
    const fin = (k) => { d.remove(); document.removeEventListener("keydown", esc, true); res(k); };
    const esc = (e) => { if (e.key === "Escape") { e.preventDefault(); e.stopImmediatePropagation(); fin(boutons[0][0]); } };
    d.addEventListener("click", (e) => { const b = e.target.closest && e.target.closest("[data-k]"); if (!b) return; if (avant) try { avant(b.dataset.k); } catch (er) { console.warn(er); } fin(b.dataset.k); });
    document.addEventListener("keydown", esc, true); document.body.appendChild(d);
    setTimeout(() => { const b = d.querySelector(".bt.plein") || d.querySelector(".bt"); if (b) b.focus(); }, 30);
  });
}

// ───── Listes du cabinet : médicaments, ordonnances types (liste de départ tant que le cabinet ne l'a pas modifiée) ─────
const DEPART = {
  medicaments: () => MEDICAMENTS0.map((m, i) => ({ id: m[3] || "m" + (i + 1), nom: m[0], poso: m[1], classe: m[2] || "" })), // identifiant fixe des fiches ajoutées (R-E4)
  ordostypes: () => { const L = ORDOS_TYPES0.map((o, i) => ({ id: "t" + (i + 1), nom: o.nom, items: o.items.map(([nom, poso]) => ({ nom, poso })) })); appliquerOrdosAudit3(L); return L; },
  analyses: () => ANALYSES0.map(([nom, cat, id], i) => ({ id: id || "a" + (i + 1), nom, cat })),
  bilans: () => BILANS0.map((b, i) => ({ id: "b" + (i + 1), nom: b.nom, items: b.items.slice() })),
  examens: () => EXAMENS0.map(([nom, cat, note], i) => ({ id: "e" + (i + 1), nom, cat, note: note || "" })),
  courriers: () => COURRIERS0.map((c, i) => ({ id: "c" + (i + 1), nom: c.nom, html: c.html })),
};
const refListe = (n) => doc(db, "espaces", A.ESPACE, "bibliotheques", n);
const CACHE = {};
// Modèles des documents de radiothérapie (pli, compte rendu, calendrier) : ajoutés à la liste des courriers tant que le cabinet ne les a pas
// modifiés (defaut : modèle d'origine, non enregistré) ; modeleRT(type) = celui que documents.js remplit
const ajouterRT = (L) => { COURRIERS_RT0.forEach((m) => { if (!L.some((z) => z.id === m.id)) L.push(Object.assign({ defaut: true }, m)); }); return L; };
export async function modeleRT(type) { const L = await lireListe("courriers"), m = L.find((z) => z.id === "rt-" + type); return m && m.html ? m.html : MODELES_RT0[type]; }
// R-A1 (18/10/2026, audit n° 7, point 1) : « document absent » (le cabinet n'a jamais modifié la liste) = liste de départ, normal ;
// « lecture en échec » ou liste abîmée = erreur, jamais la liste de départ (avant : elle était affichée, puis enregistrée à la place de
// celle du cabinet au premier clic : 2 médicaments du cabinet remplacés par 165)
export const ILLISIBLE = "Liste du cabinet illisible, réessayez.";
const erreurListe = (n, er) => { if (er && er.code === "permission-denied") return er; console.warn("bibliothèque illisible", n, er); return Object.assign(new Error(ILLISIBLE), { code: "liste-illisible", cause: er }); };
function listeDe(n, s) {
  if (!s.exists()) return DEPART[n]();
  let L; try { L = JSON.parse(s.data().data || "[]"); } catch (er) { throw erreurListe(n, er); }
  if (!Array.isArray(L)) throw erreurListe(n, new Error("pas une liste"));
  return L;
}
export const messageListe = (e, m) => (e && e.code === "liste-illisible" ? ILLISIBLE : m);
// Fenêtre ouverte sur une liste : si la lecture échoue, le message seul (rien d'autre n'est affiché ni enregistré)
async function charge(p) {
  try { await p; return true; }
  catch (e) { A.fenetre('<h3>Liste du cabinet</h3><p class="sous">' + A.esc(messageListe(e, "Lecture impossible : " + ((e && e.message) || e))) + '</p><div class="boutons"><button class="bt plein" onclick="fermerFenetre()">Fermer</button></div>'); return false; }
}
async function lireListe(n) {
  if (CACHE[n]) return CACHE[n];
  const s = await getDoc(refListe(n)).catch((er) => { throw erreurListe(n, er); });
  const L = s.exists() ? listeDe(n, s) : DEPART[n]().sort(alpha);
  if (n === "courriers") ajouterRT(L);
  return (CACHE[n] = reparer(L));
}
const reparer = (L) => { L.forEach((o) => { if (Array.isArray(o.items) && o.items.every((i) => typeof i === "string")) o.items = recoller(o.items); }); return L; };
// Éléments d'un bilan coupés à la virgule dans une parenthèse (« DFG (clairance de la créatinine », « CKD-EPI) ») : recollés
function recoller(items) {
  const R = []; items.forEach((i) => { const p = R[R.length - 1]; if (p != null && (p.match(/\(/g) || []).length > (p.match(/\)/g) || []).length) R[R.length - 1] = p + ", " + i; else R.push(i); }); return R;
}
// Modification : relue et enregistrée en entier dans une transaction (un autre poste a pu modifier la liste entre-temps) ; une lecture
// en échec arrête tout, rien n'est écrit (R-A1). R-E4 (19/10/2026) : les éléments retirés sont notés dans « retires » (une mise à jour
// de la bibliothèque ne les remet jamais) ; fn(L, { retires, existe }) ; fn qui rend false = rien à enregistrer
async function modifierListe(n, fn) {
  const L = await runTransaction(db, async (t) => {
    const s = await t.get(refListe(n)).catch((er) => { throw erreurListe(n, er); }), L = listeDe(n, s), d = s.exists() ? s.data() : {};
    const ret = Array.isArray(d.retires) ? d.retires.slice() : [];
    reparer(L); const avant = L.map((o) => ({ id: o && o.id })); if (fn(L, { retires: ret, existe: s.exists() }) === false) return null; L.sort(alpha);
    retiresEntre(avant, L).forEach((id) => { if (ret.indexOf(id) < 0) ret.push(id); });
    t.set(refListe(n), Object.assign({ data: JSON.stringify(L), maj: serverTimestamp(), majPar: D().u.uid }, ret.length ? { retires: ret } : {}));
    return L;
  });
  if (L === null) return CACHE[n] || lireListe(n);
  if (n === "courriers") ajouterRT(L);
  return (CACHE[n] = L);
}
// Bibliothèque de référence (10/10/2026) : les listes encore « de départ » y sont enregistrées telles quelles, pour être mises de
// côté (une liste de départ changée plus tard dans le code ne changera plus ce que reçoivent les nouveaux cabinets)
export async function figerListes() {
  let n = 0;
  for (const k of Object.keys(DEPART)) {
    const s = await getDoc(refListe(k)).catch(() => null);
    if (s && !s.exists()) { await setDoc(refListe(k), { data: JSON.stringify(DEPART[k]().sort(alpha)), maj: serverTimestamp(), majPar: D().u.uid }); n++; }
  }
  return n;
}
// Ordonnances types de départ (version Excel corrigée par le médecin) qui manquent au cabinet : ajoutées, rien d'écrasé (R-E4, 19/10/2026 :
// avant, toute la liste était remplacée, ordonnances du cabinet et étoiles perdues ; migration « ordostypesExcel1 », faite partout)
export async function ajouterOrdosManquants() {
  let n = 0; TYPES = await modifierListe("ordostypes", (L, c) => { n = ajouterManquantes(L, DEPART.ordostypes(), c.retires); return n > 0; });
  return n;
}
// R-E3 / R-E4 (19/10/2026, audit n° 7) : corrections de la liste de départ portées dans le cabinet sans rien écraser (donnees/majbib.js) :
// une fiche encore telle que la liste de départ d'avant est corrigée, une fiche modifiée par le cabinet ne change pas, les fiches nouvelles
// sont ajoutées sauf si le cabinet les a retirées. Une fois par cabinet (parametres/migrations.bibE3), par le médecin (droit « paramètres ») ;
// une liste jamais modifiée par le cabinet n'est pas touchée (elle affiche déjà la liste de départ d'aujourd'hui).
export async function majBibliotheques() {
  if (!A.peut("parametres") || !D().membre || D().membre.role !== "medecin") return null;
  const rm = doc(db, "espaces", A.ESPACE, "parametres", "migrations"), g = await getDoc(rm).catch(() => null);
  if (!g || (g.exists() && (g.data().bibE3 || 0) >= VERSION_BIB)) return null;
  const tot = { corriges: 0, ajoutes: 0, renommees: 0, lignes: 0 }, noms = [];
  for (const n of ["medicaments", "analyses", "bilans", "examens"]) {
    const L = await modifierListe(n, (X, c) => { if (!c.existe) return false; const r = fusionnerListe(n, X, MAJ_BIB[n], DEPART[n](), c.retires); tot.corriges += r.corriges; tot.ajoutes += r.ajoutes; noms.push(...r.noms); return r.corriges + r.ajoutes > 0; });
    if (n === "medicaments") BIB = L;
  }
  TYPES = await modifierListe("ordostypes", (X, c) => { if (!c.existe) return false; const r = fusionnerOrdos(X, MAJ_BIB.ordostypes); tot.renommees += r.renommees; tot.lignes += r.lignes; return r.renommees + r.lignes > 0; });
  await setDoc(rm, { bibE3: VERSION_BIB }, { merge: true });
  if (tot.corriges + tot.ajoutes + tot.renommees + tot.lignes) A.journal({ id: "", r: { nm: "" } }, "Bibliothèques mises à jour (audit n° 7) : " + tot.corriges + " fiche(s) corrigée(s), " + tot.ajoutes + " ajoutée(s), " + (tot.renommees + tot.lignes) + " correction(s) d'ordonnances types ; rien de ce que le cabinet avait modifié n'a changé");
  return tot;
}
// Audit n° 3 (13/10/2026) : les 14 ordonnances de chimiothérapie, une fois dans la liste du cabinet (médecin ; parametres/migrations.audit3b,
// puis audit3d le 18/10 : doublon « Chimiothérapie antiémétique » retiré ; relancer ne refait rien)
export async function ordosAudit3() {
  if (!A.peut("parametres") || !D().membre || D().membre.role !== "medecin") return null;
  const rm = doc(db, "espaces", A.ESPACE, "parametres", "migrations"), g = await getDoc(rm).catch(() => null);
  if (!g || (g.exists() && g.data().audit3d)) return null;
  let r = null; const L = await modifierListe("ordostypes", (l) => { r = appliquerOrdosAudit3(l); }); TYPES = L;
  await setDoc(rm, { audit3d: new Date().toISOString().slice(0, 10) }, { merge: true });
  if (r.renommees || r.ajoutees || r.retirees) A.journal({ id: "", r: { nm: "" } }, "Audit n° 3 : ordonnances types de chimiothérapie (" + r.renommees + " renommée(s), " + r.ajoutees + " ajoutée(s), " + r.retirees + " doublon(s) retiré(s))");
  return r;
}
// P6 (18/10/2026, audit n° 3) : bouton « Ordonnances » de la séance de chimiothérapie : les ordonnances types liées au protocole
// cochées (et « Fièvre sous chimiothérapie » à la 1re cure), les autres ordonnances « Chimio » à cocher ; « Préparer l'ordonnance »
// réunit leurs médicaments dans une ordonnance modifiable (la fenêtre habituelle : Valider / Valider + Imprimer, consultation du jour).
const FIEVRE = "Chimio – Fièvre sous chimiothérapie : conduite à tenir";
window.orProtocole = async (pid, noms, opts) => {
  opts = opts || {}; A.fenetre('<p class="sous">Chargement…</p>', "large");
  if (!(await charge(chargerTypes()))) return; const x = trouver(pid), cle = (s) => sansAcc(s).replace(/[^a-z0-9]/g, "");
  const lies = (noms || []).map((n) => TYPES.find((o) => cle(o.nom) === cle(n))).filter(Boolean);
  if (opts.fievre) { const f = TYPES.find((o) => o.nom === FIEVRE); if (f && lies.indexOf(f) < 0) lies.push(f); }
  const autres = TYPES.filter((o) => /^Chimio/.test(o.nom) && lies.indexOf(o) < 0).sort(alpha), manque = (noms || []).filter((n) => !TYPES.some((o) => cle(o.nom) === cle(n)));
  const ligne = (o, c) => '<label class="or-pc" style="display:block;margin:6px 0;font-weight:normal"><input type="checkbox" data-ot="' + A.esc(o.id) + '"' + (c ? " checked" : "") + '> <b>' + A.esc(o.nom) + '</b> <span class="mesures">' + A.esc(o.items.map((i) => i.nom).join(" ; ")) + "</span></label>";
  A.fenetre("<h3>Ordonnances du protocole — " + A.esc(x.r.nm) + "</h3>" + (opts.proto ? '<p class="sous">' + A.esc(opts.proto) + "</p>" : "") +
    (lies.length ? "<h4 class=\"soustitre\">Liées au protocole</h4>" + lies.map((o) => ligne(o, true)).join("") : '<p class="mesures">Aucune ordonnance liée à ce protocole (Protocoles › fiche du protocole › « Ordonnances liées »).</p>') +
    (manque.length ? '<p class="mesures">Introuvables dans la liste du cabinet : ' + manque.map(A.esc).join(" ; ") + "</p>" : "") +
    (autres.length ? '<details><summary style="cursor:pointer;margin-top:8px">Autres ordonnances de chimiothérapie</summary>' + autres.map((o) => ligne(o, false)).join("") + "</details>" : "") +
    '<p class="mesures" style="margin-top:8px">Les médicaments des ordonnances cochées passent dans une seule ordonnance, modifiable avant de l\'imprimer. Rien n\'est obligatoire.</p>' +
    '<div class="boutons"><button class="bt gris" onclick="fermerFenetre()">Fermer</button><button class="bt plein" id="orPcOk">Préparer l\'ordonnance</button></div>', "large");
  $("orPcOk").onclick = () => {
    const ch = [...document.querySelectorAll("[data-ot]:checked")].map((i) => TYPES.find((o) => o.id === i.dataset.ot)).filter(Boolean);
    if (!ch.length) { A.toast("Cochez au moins une ordonnance."); return; }
    const items = []; ch.forEach((o) => o.items.forEach((it) => { if (!items.some((z) => z.nom === it.nom && z.poso === it.poso)) items.push({ nom: it.nom, poso: it.poso }); }));
    S = null; ouvrirOrdonnance({ pid, t: "ordo", types: ch.map((o) => o.nom), html: contenu(x, items, D().t, medecin()), format: items.length > 5 ? "A4" : "A5", taille: 0 });
  };
};
// P9 (18/10/2026) : liste des ordonnances types modifiée depuis la page Protocoles (mise à jour de la bibliothèque de référence)
window.orMajTypes = async (fn) => { TYPES = await modifierListe("ordostypes", fn); return TYPES; };
// R-E4 (19/10/2026) : une autre bibliothèque modifiée depuis la page Protocoles (mises à jour de la référence) ; éléments retirés notés
window.orMajListe = async (n, fn) => { const L = await modifierListe(n, fn); if (n === "medicaments") BIB = L; if (n === "ordostypes") TYPES = L; return L; };
let BIB = null, TYPES = null;
async function chargerBib() { return (BIB = await lireListe("medicaments")); }
async function modifierBib(fn) { BIB = await modifierListe("medicaments", fn); }
async function chargerTypes() { return (TYPES = await lireListe("ordostypes")); }
async function modifierTypes(fn) { TYPES = await modifierListe("ordostypes", fn); }
let ANA = null, BIL = null; // famille ouverte (FAM) : analyses ou examens [{ id, nom, cat, note, fav }] et bilans [{ id, nom, items: [noms], fav }]

// ───── Gestion des listes depuis Paramètres › Bibliothèques (P2 bis, 08/10/2026) : les mêmes fenêtres, sans patient ni
// ordonnance (titre « liste du cabinet ») ; un clic sur une ligne ouvre sa fiche (médecin) ; lecture seule pour les autres.
const GEST = () => !!(S && S.gestion); // fenêtres Médicaments, Ordo. type, Analyses, Examens (Courriers : CQ.gestion)
// R-G e (19/10/2026) : allergie et poids rappelés en haut de la fenêtre d'ordonnance (case de Paramètres › Impression)
const rappelPat = (x) => { if (!x || !reglages().impression.fenRappel) return ""; const P = x.P || {}, pa = P.poidsAct, l = [];
  if (allergique(P)) l.push('<span class="badge b-al">Allergie : ' + A.esc(P.allergies || "oui") + "</span>");
  if (pa) l.push('<span class="badge b-gr">Poids ' + A.esc(pa.v + " kg" + (pa.d ? " (" + A.dfrA(String(pa.d).slice(0, 10)) + ")" : "")) + "</span>");
  return l.length ? ' <span class="or-rappel">' + l.join(" ") + "</span>" : ""; };
const titrePat = (x) => (x ? " — " + A.esc(x.r.nm) + rappelPat(x) : " — liste du cabinet");
const basGestion = '<div class="boutons"><button class="bt plein" onclick="fermerFenetre()">Fermer</button></div>';
export async function gererListe(n) {
  T = null; A.fenetre('<p class="sous">Chargement…</p>', "large");
  if (n === "courriers") { S = null; CQ = { pid: null, q: "", gestion: true }; if (await charge(lireListe("courriers").then((L) => { CR = L; }))) vueCourriers(); return; }
  CQ = null; S = { pid: null, gestion: true, t: n === "medicaments" ? "medic" : n === "ordostypes" ? "ordo" : n === "examens" ? "exam" : "analyse", q: "", items: [], types: [] };
  if (n === "medicaments") { if (await charge(chargerBib())) vueListe(); }
  else if (n === "ordostypes") { if (await charge(Promise.all([chargerBib(), chargerTypes()]))) vueTypes(); }
  else if (await charge(chargerAnalyses(S.t))) vueAnalyses();
}
// Nombre d'éléments de chaque liste (Paramètres › Bibliothèques)
export async function tailleListe(n) { return (await lireListe(n)).length; }

// ───── Fenêtre « Médicaments » : recherche, liste, ordonnance en préparation ─────
let S = null; // { pid, t (medic | ordo), q, items: [{ nom, poso }], ed (n° du médicament en cours de modification), types, modif }
let T = null; // ordonnance type en cours de création / modification : { id, nom, items, ed }
const CUR = () => (T || S); // ordonnance en préparation affichée (celle de la fiche d'une ordonnance type, sinon celle du patient)
window.ordMedicaments = async (pid) => {
  const x = trouver(pid); if (!x || !peutEcrire()) return;
  S = { pid, t: "medic", q: "", items: [], types: [] }; T = null;
  A.fenetre('<p class="sous">Chargement des médicaments…</p>', "large");
  if (await charge(chargerBib())) vueListe();
};
function vueListe() {
  const x = trouver(S.pid);
  A.fenetre("<h3>" + (S.modif ? "Modifier l'ordonnance du " + A.dfrA(S.modif.d) : "Médicaments") + titrePat(x) + "</h3>" +
    '<div class="md-barre"><div class="recherche">' + A.ic("loupe") + '<input id="mdQ" type="search" autocomplete="off" placeholder="Rechercher un médicament, une posologie, une classe…" value="' + A.esc(S.q) + '"></div>' +
    (ajouteMedic() ? '<button class="bt clair petit" onclick="mdFiche()">' + A.ic("plus") + "Nouveau médicament</button>" : "") + "</div>" +
    '<div class="md-liste" id="mdListe"></div>' + (S.gestion ? "" : '<p class="mesures" style="margin:6px 0 0">Double-cliquez sur un médicament (ou touchez ' + ico("plus") + ") pour l'ajouter à l'ordonnance.</p>" +
    '<h4 class="soustitre">Ordonnance</h4><div id="mdOrdo" class="md-ordo"></div>' +
    '<div class="md-ajout"><button class="bt gris petit" onclick="mdLigneLibre()">' + A.ic("plus") + "Ligne libre (médicament hors liste)</button></div>") +
    (S.gestion ? basGestion : '<div class="boutons"><button class="bt gris" onclick="fermerFenetre()">Annuler</button><button class="bt plein" onclick="mdAfficher()">Afficher l\'ordonnance</button></div>'), "large");
  $("mdQ").oninput = () => { S.q = $("mdQ").value; liste(); };
  liste(); ordo();
  setTimeout(() => { const q = $("mdQ"); if (q) q.focus(); }, 60);
}
function liste() {
  const mots = sansAcc(S.q).split(/\s+/).filter(Boolean);
  const L = BIB.filter((m) => { const t = sansAcc(m.nom + " " + m.poso + " " + m.classe); return mots.every((w) => t.indexOf(w) >= 0); });
  $("mdListe").innerHTML = L.length ? '<table class="md-t"><tr><th>Médicament</th><th>Posologie</th><th></th></tr>' + L.map((m) => {
    const q = "'" + m.id + "'";
    return '<tr class="m" ondblclick="mdAjouter(' + q + ')"><td><b>' + A.esc(m.nom) + "</b>" + (m.classe ? '<div class="cl">' + A.esc(m.classe) + "</div>" : "") + "</td><td>" + A.esc(m.poso) + '</td><td class="act">' + etoile(m, "mdFavori") +
      (S && S.gestion ? "" : '<button class="ico vert" title="Ajouter à l\'ordonnance" aria-label="Ajouter ' + A.esc(m.nom) + ' à l\'ordonnance" onclick="mdAjouter(' + q + ')">' + ico("plus") + "</button>") +
      gerer('<button class="ico" title="Modifier" aria-label="Modifier ' + A.esc(m.nom) + '" onclick="mdFiche(' + q + ')">' + ico("crayon") + "</button>" +
      '<button class="ico rouge" title="Supprimer de la liste" aria-label="Supprimer ' + A.esc(m.nom) + '" onclick="mdSupprimer(' + q + ')">' + ico("croix") + "</button>") + "</td></tr>";
  }).join("") + "</table>" : '<p class="sous" style="padding:12px">Aucun médicament ne correspond.' + (ajouteMedic() ? " « Nouveau médicament » pour l'ajouter à la liste" + (S && !S.gestion ? ", ou « Ligne libre » pour l'écrire seulement dans cette ordonnance." : ".") : "") + "</p>";
}
// Médicaments de l'ordonnance en préparation : modifier ✎ (nom, posologie), monter, descendre, retirer
function ordo() {
  if (!$("mdOrdo")) return; // gestion de la liste : pas d'ordonnance
  const h = CUR(), L = h.items;
  $("mdOrdo").innerHTML = L.length ? L.map((it, i) => i === h.ed
    ? '<div class="it ed"><b class="n">' + (i + 1) + '/</b><div class="tx"><input id="edNom" value="' + A.esc(it.nom) + '" placeholder="' + (modeAna() ? "Analyse, bilan ou examen (tapez le début : la liste propose)" : "Médicament (tapez le début : la liste propose)") + '" aria-label="Nom" autocomplete="off"><div id="edSug" class="sug ed-sug cache"></div><textarea id="edPoso" rows="2" placeholder="' + (modeAna() ? "Précision (facultatif, imprimée entre parenthèses)" : "Posologie") + '" aria-label="' + (modeAna() ? "Précision" : "Posologie") + '">' + A.esc(it.poso) + "</textarea></div>" +
      '<div class="actr"><button class="bt plein petit" onclick="mdEditOk(' + i + ')">OK</button><button class="bt gris petit" onclick="mdEditAnnuler(' + i + ')">Annuler</button></div></div>'
    : '<div class="it"><b class="n">' + (i + 1) + '/</b><div class="tx"><b>' + A.esc(it.nom) + '</b><div class="mesures">' + A.esc(it.poso) + "</div></div>" +
    '<div class="actr"><button class="ico" title="Monter" aria-label="Monter" onclick="mdBouger(' + i + ',-1)"' + (i ? "" : " disabled") + ">↑</button>" +
    '<button class="ico" title="Descendre" aria-label="Descendre" onclick="mdBouger(' + i + ',1)"' + (i < L.length - 1 ? "" : " disabled") + ">↓</button>" +
    (!T && S && S.pid && chimioOrale(it.nom) && /…/.test(it.poso) ? '<button class="mini" title="Calculer le nombre de comprimés d\'après la surface corporelle" onclick="mdCalcul(' + i + ')">mg/m²</button>' : "") +
    '<button class="ico" title="Modifier le nom ou la posologie" aria-label="Modifier" onclick="mdEdit(' + i + ')">' + ico("crayon") + "</button>" +
    '<button class="ico rouge" title="Retirer" aria-label="Retirer" onclick="mdRetirer(' + i + ')">' + ico("croix") + "</button></div></div>").join("")
    : '<p class="sous" style="margin:0">' + (T ? "Aucun médicament : ajoutez-en avec la recherche ci-dessous." : (S && S.t === "exam" ? "Aucun examen choisi" : modeAna() ? "Aucune analyse choisie" : "Aucun médicament choisi") + " : « Afficher l'ordonnance » donnera une ordonnance vierge, à remplir à la main.") + "</p>";
  if (h.ed != null) { brancherSug(); setTimeout(() => { const e = $("edNom"); if (e && !e.value) e.focus(); else if ($("edPoso")) $("edPoso").focus(); }, 30); }
}
// Ligne libre / modification : en tapant le nom, la liste propose ce qui correspond (« NF » → NFS – plaquettes ;
// médicaments avec leur posologie ; un bilan choisi est développé comme d'habitude) ; sinon le texte tapé reste tel quel
function brancherSug() {
  const q = $("edNom"), z = $("edSug"); if (!q || !z) return;
  q.oninput = () => {
    const mots = sansAcc(q.value).split(/\s+/).filter(Boolean), ana = modeAna();
    const src = ana ? BIL.map((b) => ({ k: "b:" + b.id, nom: b.nom, sous: b.items.join(", ") })).concat(ANA.map((a) => ({ k: "a:" + a.id, nom: a.nom, sous: [a.cat, a.note].filter(Boolean).join(" · ") })))
      : (BIB || []).map((m) => ({ k: m.id, nom: m.nom, sous: m.poso, cherche: m.classe }));
    const debut = (m) => (sansAcc(m.nom).indexOf(mots[0] || "") === 0 ? 0 : mots.every((w) => sansAcc(m.nom).indexOf(w) >= 0) ? 1 : 2);
    const L = mots.length ? src.filter((m) => { const t = sansAcc(m.nom + " " + m.sous + " " + (m.cherche || "")); return mots.every((w) => t.indexOf(w) >= 0); }).sort((a, b) => debut(a) - debut(b)).slice(0, 8) : [];
    z.innerHTML = L.map((m) => '<div onmousedown="event.preventDefault()" onclick="edChoisir(\'' + m.k + '\')"><b>' + A.esc(m.nom) + '</b><br><span class="mesures">' + A.esc(m.sous || "") + "</span></div>").join("");
    z.classList.toggle("cache", !L.length);
  };
  q.onblur = () => setTimeout(() => z.classList.add("cache"), 150);
}
window.edChoisir = (k) => {
  const h = CUR(); if (!h || h.ed == null) return; const i = h.ed;
  if (modeAna()) {
    const id = k.slice(2), o = k[0] === "b" ? BIL.find((z) => z.id === id) : ANA.find((z) => z.id === id); if (!o) return;
    if (k[0] === "b" && !T) { h.items.splice(i, 1); h.ed = null; window.anaAjouter(k); return; } // bilan : ses lignes, comme un clic dans la liste
    h.items[i] = { nom: o.nom, poso: T ? "" : o.note || "" };
  } else { const m = (BIB || []).find((z) => z.id === k); if (!m) return; h.items[i] = { nom: m.nom, poso: m.poso || "" }; }
  ordo(); const e = $("edPoso"); if (e) e.focus();
  if (!modeAna()) okAllergie([h.items[i].nom]).then((oui) => { if (!oui) { h.items.splice(i, 1); h.ed = null; ordo(); } }); // R-E6 : suggestion choisie
};
// R-E6 (19/10/2026, audit n° 7, d. 27) : allergie connue (« oui ») vérifiée sur chaque ligne ajoutée (liste, ordonnance type, ligne libre,
// suggestion, modification, nouveau médicament) avec les familles (moteur/ordonnance.js) et les mots de l'allergie ; un clic, jamais bloquant
const classeDe = (nom) => { const m = (BIB || []).find((z) => z.nom === nom); return (m && m.classe) || ""; };
const alertesPour = (x, noms) => (x && allergique(x.P) ? alertesAllergie(x.P.allergies, noms.filter(Boolean).map((n) => ({ nom: n, classe: classeDe(n) })), motsAllergie(x.P.allergies)) : []);
async function okAllergie(noms) {
  const x = !T && S && trouver(S.pid), a = alertesPour(x, noms); if (!a.length) return true;
  return (await question("<h4>Allergie connue : " + A.esc(x.P.allergies || "oui") + "</h4><ul>" + a.map((z) => "<li>" + A.esc(texteAlerte(z)) + "</li>").join("") + "</ul>",
    [["non", "Ne pas ajouter", "gris"], ["oui", "Ajouter quand même", "plein"]])) === "oui";
}
// R-E1 (d. 16) : médicament déjà dans l'ordonnance (deux ordonnances types qui ont la même ligne) : garder les deux ou une seule ligne
async function sansDoublons(nouveaux) {
  const h = CUR(), d = !T && h ? doublonsDe(h.items, nouveaux) : []; if (!d.length) return nouveaux;
  const k = await question("<h4>Déjà dans l'ordonnance</h4><ul>" + d.map((n) => "<li><b>" + A.esc(n) + "</b> est déjà dans l'ordonnance</li>").join("") + "</ul>",
    [["un", "Garder une seule ligne", "plein"], ["deux", "Garder les deux", "gris"]]);
  if (k === "deux") return nouveaux;
  const deja = new Set(h.items.map((i) => cleMedicament(i.nom))); return nouveaux.filter((i) => !deja.has(cleMedicament(i.nom)));
}
window.mdAjouter = async (id) => {
  if (GEST() && !T) { window.mdFiche(id); return; } const m = BIB.find((z) => z.id === id), h = CUR(); if (!m || !h) return;
  if (!(await okAllergie([m.nom]))) return; const L = await sansDoublons([{ nom: m.nom, poso: m.poso }]); if (!L.length) { A.toast("Déjà dans l'ordonnance : une seule ligne gardée."); return; }
  h.items.push(L[0]); ordo(); A.toast(m.nom + " ajouté.");
};
// R-E7 (d. 32) : chimiothérapie orale calculée : surface corporelle du dossier (poids actuel, taille ; Mosteller), dose en mg/m² ; les « … » de
// la posologie remplis (nombre de comprimés de chaque dosage, mg/m²) ; modifiable ensuite comme toute ligne
window.mdCalcul = async (i) => {
  const h = CUR(), it = h && h.items[i], c = it && chimioOrale(it.nom), x = S && trouver(S.pid); if (!c || !x) return;
  const P = x.P || {}, pds = P.poidsAct ? P.poidsAct.v : P.poids, sc0 = surface(+String(pds || "").replace(",", "."), +String(P.taille || "").replace(",", "."));
  const m = String(it.poso).match(/(\d+(?:[.,]\d+)?)\s*mg\/m²/), d0 = m ? m[1] : String(c.dose), nb = (String(it.poso).match(/…/g) || []).length;
  const lire = () => ({ sc: +String(($("ccSc") || {}).value || "").replace(",", "."), d: +String(($("ccD") || {}).value || "").replace(",", ".") });
  const calc = () => { const v = lire(), z = $("ccR"); if (!z) return null; if (!(v.sc > 0.5 && v.sc < 3.5 && v.d > 0)) { z.textContent = "Indiquez la surface corporelle et la dose."; return null; }
    const r = doseOrale(c, v.sc, v.d); z.textContent = r.dose + " mg " + c.par + " → " + r.total + " mg (" + (r.ecart ? (r.ecart > 0 ? "+" : "") + r.ecart + " mg" : "dose exacte") + ") : " + remplirZones(it.poso, r.zones.slice(0, nb)).slice(0, 160); return r; };
  let res = null;
  const p = question("<h4>" + A.esc(it.nom) + "</h4><div class=\"form\"><div><label for=\"ccSc\">Surface corporelle (m²)</label><input id=\"ccSc\" inputmode=\"decimal\" value=\"" + (sc0 ? String(sc0).replace(".", ",") : "") + "\"></div>" +
    "<div><label for=\"ccD\">Dose (mg/m²)</label><input id=\"ccD\" inputmode=\"decimal\" value=\"" + A.esc(d0) + "\"></div></div>" +
    '<p class="mesures">' + (sc0 ? "Surface du dossier : " + String(sc0).replace(".", ",") + " m² (poids " + A.esc(String(pds)) + " kg, taille " + A.esc(String(P.taille)) + " cm, Mosteller)." : "Poids ou taille absents du dossier : indiquez la surface corporelle.") + '</p><p id="ccR" class="mesures" style="font-weight:bold"></p>',
    [["non", "Annuler", "gris"], ["ok", "Remplir la posologie", "plein"]], (k) => { if (k === "ok") res = calc(); });
  setTimeout(() => { ["ccSc", "ccD"].forEach((id) => { const e = $(id); if (e) e.oninput = calc; }); calc(); }, 0);
  if ((await p) !== "ok" || !res) return;
  h.items[i] = { nom: it.nom, poso: remplirZones(it.poso, res.zones.slice(0, nb)) }; ordo(); A.toast("Posologie remplie : " + res.total + " mg " + c.par + ".");
};
window.mdRetirer = (i) => { const h = CUR(); h.items.splice(i, 1); h.ed = null; ordo(); };
window.mdBouger = (i, s) => { const L = CUR().items, j = i + s; if (j < 0 || j >= L.length) return; const t = L[i]; L[i] = L[j]; L[j] = t; CUR().ed = null; ordo(); };
window.mdEdit = (i) => { CUR().ed = i; ordo(); };
window.mdEditOk = async (i) => {
  const h = CUR(), nom = A.val("edNom"), poso = String($("edPoso").value || "").trim();
  if (!nom) { A.toast("Indiquez le nom du médicament (ou retirez la ligne)."); return; }
  if (nom !== h.items[i].nom && !(await okAllergie([nom]))) return; // R-E6 : ligne libre et modification vérifiées aussi
  h.items[i] = { nom, poso }; h.ed = null; ordo();
};
window.mdEditAnnuler = (i) => { const h = CUR(); if (!h.items[i].nom && !h.items[i].poso) h.items.splice(i, 1); h.ed = null; ordo(); };
// Ajouter un médicament de la liste (recherche) ou une ligne libre, sous l'ordonnance en préparation
// (analyses : la recherche porte sur les analyses et les bilans)
const modeAna = () => (T ? T.kind === "bilan" : !!(S && estAnaT(S.t)));
const champAjout = () => '<div class="md-ajout"><div class="recherche">' + A.ic("loupe") + '<input id="mdAjQ" type="search" autocomplete="off" placeholder="' + (modeAna() ? FAM.ajout : "Ajouter un médicament de la liste…") + '" aria-label="Ajouter depuis la liste"><div id="mdAjS" class="sug cache"></div></div>' +
  '<button class="bt gris petit" onclick="mdLigneLibre()">' + A.ic("plus") + "Ligne libre</button></div>";
function brancherAjout() {
  const q = $("mdAjQ"); if (!q) return;
  q.oninput = () => {
    const mots = sansAcc(q.value).split(/\s+/).filter(Boolean), ana = modeAna();
    const src = ana ? BIL.map((b) => ({ k: "b:" + b.id, nom: b.nom, sous: b.items.join(", ") })).concat(ANA.map((a) => ({ k: "a:" + a.id, nom: a.nom, sous: [a.cat, a.note].filter(Boolean).join(" · ") })))
      : BIB.map((m) => ({ k: m.id, nom: m.nom, sous: m.poso, cherche: m.classe }));
    // ceux dont le nom correspond d'abord (« bilan rénal » avant les bilans qui le contiennent)
    const parNom = (m) => (mots.every((w) => sansAcc(m.nom).indexOf(w) >= 0) ? 0 : 1);
    const L = mots.length ? src.filter((m) => { const t = sansAcc(m.nom + " " + m.sous + " " + (m.cherche || "")); return mots.every((w) => t.indexOf(w) >= 0); }).sort((a, b) => parNom(a) - parNom(b)).slice(0, 8) : [];
    $("mdAjS").innerHTML = L.map((m) => '<div onclick="' + (ana ? "anaAjouter" : "mdAjouter") + "('" + m.k + '\');mdAjFin()"><b>' + A.esc(m.nom) + '</b><br><span class="mesures">' + A.esc(m.sous) + "</span></div>").join("") || (mots.length ? '<div class="mesures">Rien ne correspond : utilisez « Ligne libre ».</div>' : "");
    $("mdAjS").classList.toggle("cache", !mots.length);
  };
}
window.mdAjFin = () => { const q = $("mdAjQ"); if (q) { q.value = ""; q.focus(); } $("mdAjS").classList.add("cache"); };
window.mdLigneLibre = () => { const h = CUR(); h.items.push({ nom: "", poso: "" }); h.ed = h.items.length - 1; ordo(); };

// ───── Fenêtre « Ordonnances types » : liste des ordonnances types, ordonnance en préparation ─────
window.ordTypes = async (pid) => {
  const x = trouver(pid); if (!x || !peutEcrire()) return;
  S = { pid, t: "ordo", q: "", items: [], types: [] }; T = null;
  A.fenetre('<p class="sous">Chargement des ordonnances types…</p>', "large");
  if (await charge(Promise.all([chargerBib(), chargerTypes()]))) vueTypes();
};
function vueTypes() {
  const x = trouver(S.pid); T = null;
  A.fenetre("<h3>" + (S.modif ? "Modifier l'ordonnance du " + A.dfrA(S.modif.d) : "Ordonnances types") + titrePat(x) + "</h3>" +
    '<div class="md-barre"><div class="recherche">' + A.ic("loupe") + '<input id="otQ" type="search" autocomplete="off" placeholder="Rechercher une ordonnance type ou un médicament…" value="' + A.esc(S.q) + '"></div>' +
    gerer('<button class="bt clair petit" onclick="otFiche()">' + A.ic("plus") + "Nouvelle ordonnance type</button>") + "</div>" +
    '<div class="md-liste" id="otListe"></div>' + (S.gestion ? basGestion : '<p class="mesures" style="margin:6px 0 0">Cliquez sur une ordonnance type (ou touchez ' + ico("plus") + ") : tous ses médicaments passent dans l'ordonnance ci-dessous.</p>" +
    '<h4 class="soustitre">Ordonnance</h4><div id="mdOrdo" class="md-ordo"></div>' + champAjout() +
    '<div class="boutons"><button class="bt gris" onclick="fermerFenetre()">Annuler</button><button class="bt plein" onclick="mdAfficher()">Afficher l\'ordonnance</button></div>'), "large");
  $("otQ").oninput = () => { S.q = $("otQ").value; listeTypes(); };
  listeTypes(); ordo(); brancherAjout();
}
function listeTypes() {
  const mots = sansAcc(S.q).split(/\s+/).filter(Boolean);
  const L = TYPES.filter((o) => { const t = sansAcc(o.nom + " " + o.items.map((i) => i.nom).join(" ")); return mots.every((w) => t.indexOf(w) >= 0); });
  $("otListe").innerHTML = L.length ? '<table class="md-t"><tr><th>Ordonnance type</th><th>Médicaments</th><th></th></tr>' + L.map((o) => {
    const q = "'" + o.id + "'";
    return '<tr class="m" onclick="otAjouter(' + q + ')"><td><b>' + A.esc(o.nom) + '</b><div class="cl">' + o.items.length + " médicament" + (o.items.length > 1 ? "s" : "") + "</div></td><td>" + A.esc(o.items.map((i) => i.nom).join(" ; ")) + '</td><td class="act" onclick="event.stopPropagation()">' + etoile(o, "otFavori") +
      (S && S.gestion ? "" : '<button class="ico vert" title="Mettre ses médicaments dans l\'ordonnance" aria-label="Utiliser ' + A.esc(o.nom) + '" onclick="otAjouter(' + q + ')">' + ico("plus") + "</button>") +
      gerer('<button class="ico" title="Modifier l\'ordonnance type" aria-label="Modifier ' + A.esc(o.nom) + '" onclick="otFiche(' + q + ')">' + ico("crayon") + "</button>" +
      '<button class="ico rouge" title="Supprimer l\'ordonnance type" aria-label="Supprimer ' + A.esc(o.nom) + '" onclick="otSupprimer(' + q + ')">' + ico("croix") + "</button>") + "</td></tr>";
  }).join("") + "</table>" : '<p class="sous" style="padding:12px">Aucune ordonnance type ne correspond.' + gerer(" « Nouvelle ordonnance type » pour en créer une.") + "</p>";
}
window.otAjouter = async (id) => {
  if (GEST()) { window.otFiche(id); return; }
  const o = TYPES.find((z) => z.id === id); if (!o || !S) return;
  if (!(await okAllergie(o.items.map((i) => i.nom)))) return;
  const L = await sansDoublons(o.items.map((i) => ({ nom: i.nom, poso: i.poso })));
  L.forEach((i) => S.items.push(i)); if (S.types.indexOf(o.nom) < 0) S.types.push(o.nom);
  S.ed = null; ordo(); A.toast("« " + o.nom + " » : " + L.length + " médicament" + (L.length > 1 ? "s ajoutés." : " ajouté.") + (L.length < o.items.length ? " (" + (o.items.length - L.length) + " déjà dans l'ordonnance)" : ""));
};
// Nouvelle ordonnance type / modifier : nom + médicaments (recherche dans la liste, ligne libre, ✎, ↑ ↓, ✕)
window.otFiche = (id) => {
  if (!gereListes()) return;
  const o = id ? TYPES.find((z) => z.id === id) : null;
  T = { id: o ? o.id : null, nom: o ? o.nom : "", items: o ? o.items.map((i) => ({ nom: i.nom, poso: i.poso })) : [], ed: null };
  A.fenetre("<h3>" + (o ? "Modifier l'ordonnance type" : "Nouvelle ordonnance type") + "</h3>" +
    '<div class="form"><div class="large"><label for="otNom">Nom de l\'ordonnance type</label><input id="otNom" value="' + A.esc(T.nom) + '" placeholder="Ex. Diarrhée, Soins de bouche…"></div></div>' +
    '<h4 class="soustitre">Médicaments</h4><div id="mdOrdo" class="md-ordo"></div>' + champAjout() +
    '<div class="err" id="fErr"></div><div class="boutons"><button class="bt gris" onclick="otRetour()">Annuler</button><button class="bt plein" id="otOk" onclick="otValider()">Valider</button></div>', "large");
  ordo(); brancherAjout();
};
window.otRetour = () => { T = null; if (S) vueTypes(); else A.fermerFenetre(); };
window.otValider = async () => {
  if (!T) return; const nom = A.val("otNom");
  if (!nom) { A.erreur("Donnez un nom à l'ordonnance type."); return; }
  if (T.ed != null) { A.erreur("Terminez la modification en cours (OK ou Annuler)."); return; }
  if (!T.items.some((i) => i.nom)) { A.erreur("Ajoutez au moins un médicament."); return; }
  if (TYPES.some((z) => z.id !== T.id && sansAcc(z.nom) === sansAcc(nom))) { A.erreur("Une ordonnance type porte déjà ce nom."); return; }
  const o = { id: T.id || "t" + Date.now().toString(36), nom, items: T.items.filter((i) => i.nom) }, modif = !!T.id;
  A.occupe($("otOk"), true);
  try { await modifierTypes((L) => { const i = L.findIndex((z) => z.id === o.id); if (i >= 0) L[i] = Object.assign({}, L[i], o); /* l'étoile (favori) est gardée */ else L.push(o); }); A.toast(modif ? "Ordonnance type modifiée." : "Ordonnance type créée."); otRetour(); }
  catch (e) { A.occupe($("otOk"), false); A.erreur(e && e.code === "permission-denied" ? "Vous n'avez pas le droit de modifier les ordonnances types." : "Enregistrement impossible : " + ((e && e.message) || e)); }
};
window.otSupprimer = async (id) => {
  if (!gereListes()) return;
  const o = TYPES.find((z) => z.id === id); if (!o || !confirm("Supprimer l'ordonnance type « " + o.nom + " » ?\n\nLes ordonnances déjà faites ne changent pas.")) return;
  try { await modifierTypes((L) => { const i = L.findIndex((z) => z.id === id); if (i >= 0) L.splice(i, 1); }); A.toast("Ordonnance type supprimée."); listeTypes(); }
  catch (e) { A.toast(e && e.code === "permission-denied" ? "Vous n'avez pas le droit de modifier les ordonnances types." : messageListe(e, "Suppression impossible.")); }
};

// Nouveau médicament / modifier : nom, posologie, classe thérapeutique
window.mdFiche = (id) => {
  if (id ? !gereListes() : !ajouteMedic()) return;
  T = null;
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
      const pourOrdo = !m && S && !S.gestion && (await okAllergie([nom])); if (pourOrdo) S.items.push({ nom, poso }); // ordonnance du patient : ajouté aussi (allergie vérifiée, R-E6)
      A.toast(m ? "Médicament modifié." : pourOrdo ? "Médicament ajouté à la liste et à l'ordonnance." : "Médicament ajouté à la liste."); mdRetour();
    } catch (e) { A.occupe($("mdOk"), false); A.erreur(e && e.code === "permission-denied" ? "Vous n'avez pas le droit de modifier la liste des médicaments." : "Enregistrement impossible : " + ((e && e.message) || e)); }
  };
};
// ───── Fenêtres « Analyses » et « Examens compl. » (07/10/2026) : bilans et analyses / bilans d'imagerie et examens ─────
// Analyses : clic sur une analyse = une ligne (« NFS – plaquettes ») ; sur un bilan = une ligne avec son contenu, sans le
// titre du bilan (« ASAT, ALAT, … », 07/10/2026) ; sur un bilan général (qui contient d'autres bilans) = une ligne par bilan.
// Examens : une ligne par examen, précautions entre parenthèses (« à jeun 6 heures ») ; pas de bilans d'imagerie (lb: null).
const FAMS = {
  analyse: { t: "analyse", la: "analyses", lb: "bilans", titre: "Analyses", eclater: false, unA: "analyse", uneA: "une analyse", nouvA: "Nouvelle analyse", libB: "bilan", nouvB: "Nouveau bilan",
    phA: "Ex. NFS – plaquettes", phB: "Ex. Bilan chimiothérapie – intercure", cherche: "Rechercher un bilan ou une analyse…", ajout: "Ajouter une analyse ou un bilan…",
    aide: "Cliquez sur un bilan ou une analyse pour l'ajouter. Un bilan général ajoute tous ses bilans d'un coup (une ligne chacun).", colA: "Analyse", colB: "Bilan" },
  exam: { t: "exam", la: "examens", lb: null, titre: "Examens complémentaires", eclater: true, unA: "examen", uneA: "un examen", nouvA: "Nouvel examen",
    phA: "Ex. TDM thoraco-abdomino-pelvienne (TAP) injectée", cherche: "Rechercher un examen…", ajout: "Ajouter un examen…",
    aide: "Cliquez sur un examen pour l'ajouter.", colA: "Examen" },
};
let FAM = FAMS.analyse;
const estAnaT = (t) => t === "analyse" || t === "exam";
const bilanNomme = (n) => BIL.find((b) => sansAcc(b.nom) === sansAcc(n));
const examNomme = (n) => ANA.find((a) => sansAcc(a.nom) === sansAcc(n));
const general = (b) => b.items.some((n) => bilanNomme(n));
const ligneBilan = (b, p = 0) => b.items.map((n) => (bilanNomme(n) && p < 5 ? ligneBilan(bilanNomme(n), p + 1) : n)).join(", ");
// Lignes ajoutées à l'ordonnance pour un bilan : { nom, poso (précautions) }
function lignesDe(b) {
  if (FAM.eclater) return b.items.map((n) => (bilanNomme(n) ? lignesDe(bilanNomme(n)) : [{ nom: n, poso: (examNomme(n) && examNomme(n).note) || "" }])).flat();
  return (general(b) ? b.items.map((n) => (bilanNomme(n) ? ligneBilan(bilanNomme(n)) : n)) : [ligneBilan(b)]).map((nom) => ({ nom, poso: "" }));
}
async function chargerAnalyses(f) { FAM = FAMS[f || "analyse"]; [ANA, BIL] = await Promise.all([lireListe(FAM.la), FAM.lb ? lireListe(FAM.lb) : []]); }
window.ordAnalyses = async (pid, f) => {
  const x = trouver(pid); if (!x || !peutEcrire()) return;
  S = { pid, t: f || "analyse", q: "", items: [], types: [] }; T = null;
  A.fenetre('<p class="sous">Chargement…</p>', "large");
  if (await charge(chargerAnalyses(S.t))) vueAnalyses();
};
window.ordExamens = (pid) => window.ordAnalyses(pid, "exam");
function vueAnalyses() {
  const x = trouver(S.pid); T = null;
  A.fenetre("<h3>" + (S.modif ? "Modifier l'ordonnance du " + A.dfrA(S.modif.d) : FAM.titre) + titrePat(x) + "</h3>" +
    '<div class="md-barre"><div class="recherche">' + A.ic("loupe") + '<input id="anQ" type="search" autocomplete="off" placeholder="' + FAM.cherche + '" value="' + A.esc(S.q) + '"></div>' +
    gerer((FAM.lb ? '<button class="bt clair petit" onclick="bilFiche()">' + A.ic("plus") + FAM.nouvB + "</button>" : "") + '<button class="bt clair petit" onclick="anaFiche()">' + A.ic("plus") + FAM.nouvA + "</button>") + "</div>" +
    '<div class="md-liste" id="anListe"></div>' + (S.gestion ? basGestion : '<p class="mesures" style="margin:6px 0 0">' + A.esc(FAM.aide) + "</p>" +
    '<h4 class="soustitre">Ordonnance</h4><div id="mdOrdo" class="md-ordo"></div>' + champAjout() +
    '<div class="boutons"><button class="bt gris" onclick="fermerFenetre()">Annuler</button><button class="bt plein" onclick="mdAfficher()">Afficher l\'ordonnance</button></div>'), "large");
  $("anQ").oninput = () => { S.q = $("anQ").value; listeAnalyses(); };
  listeAnalyses(); ordo(); brancherAjout();
}
function listeAnalyses() {
  const mots = sansAcc(S.q).split(/\s+/).filter(Boolean), ok = (t) => mots.every((w) => sansAcc(t).indexOf(w) >= 0);
  const parNom = (o) => (mots.length && !ok(o.nom) ? 1 : 0); // nom qui correspond d'abord, puis contenu
  const B = BIL.filter((b) => ok(b.nom + " " + b.items.join(" "))).sort((a, b) => parNom(a) - parNom(b)), L = ANA.filter((a) => ok(a.nom + " " + (a.cat || "") + " " + (a.note || ""))).sort((a, b) => parNom(a) - parNom(b));
  const act = (o, fav, fiche, sup) => '<td class="act" onclick="event.stopPropagation()">' + etoile(o, fav) + gerer(
    '<button class="ico" title="Modifier" aria-label="Modifier ' + A.esc(o.nom) + '" onclick="' + fiche + "('" + o.id + "')\">" + ico("crayon") + "</button>" +
    '<button class="ico rouge" title="Supprimer de la liste" aria-label="Supprimer ' + A.esc(o.nom) + '" onclick="' + sup + "('" + o.id + "')\">" + ico("croix") + "</button>") + "</td>";
  $("anListe").innerHTML = B.length || L.length ? '<table class="md-t">' +
    (B.length ? "<tr><th>" + FAM.colB + "</th><th>Contenu</th><th></th></tr>" + B.map((b) => '<tr class="m" onclick="anaAjouter(\'b:' + b.id + '\')"><td><b>' + A.esc(b.nom) + "</b>" + (general(b) && !FAM.eclater ? '<div class="cl">Bilan général</div>' : "") + "</td><td>" + A.esc(b.items.join(", ")) + "</td>" + act(b, "bilFavori", "bilFiche", "bilSupprimer") + "</tr>").join("") : "") +
    (L.length ? "<tr><th>" + FAM.colA + "</th><th>Catégorie</th><th></th></tr>" + L.map((a) => '<tr class="m" onclick="anaAjouter(\'a:' + a.id + '\')"><td><b>' + A.esc(a.nom) + "</b>" + (a.note ? '<div class="cl">' + A.esc(a.note) + "</div>" : "") + "</td><td>" + A.esc(a.cat || "") + "</td>" + act(a, "anaFavori", "anaFiche", "anaSupprimer") + "</tr>").join("") : "") + "</table>"
    : '<p class="sous" style="padding:12px">Rien ne correspond.' + gerer(" " + (FAM.lb ? "« " + FAM.nouvB + " » ou " : "") + "« " + FAM.nouvA + " » pour l'ajouter.") + "</p>";
}
// Ajout : dans l'ordonnance du patient (lignes développées) ou dans la fiche d'un bilan (le nom de l'analyse ou du bilan)
window.anaAjouter = (k) => {
  if (GEST() && !T) { if (k[0] === "b") window.bilFiche(k.slice(2)); else window.anaFiche(k.slice(2)); return; }
  const h = CUR(); if (!h) return; const id = k.slice(2), o = k[0] === "b" ? BIL.find((z) => z.id === id) : ANA.find((z) => z.id === id); if (!o) return;
  const lignes = T ? [{ nom: o.nom, poso: "" }] : k[0] === "a" ? [{ nom: o.nom, poso: o.note || "" }] : lignesDe(o); let n = 0;
  lignes.forEach((l) => { if (!h.items.some((i) => sansAcc(i.nom) === sansAcc(l.nom))) { h.items.push(l); n++; } });
  h.ed = null; ordo(); A.toast(n ? (n > 1 ? n + " lignes ajoutées." : "« " + (k[0] === "b" ? o.nom : lignes[0].nom) + " » ajouté.") : "Déjà dans la liste.");
  if (!T && k[0] === "b" && S.types.indexOf(o.nom) < 0) S.types.push(o.nom);
};
// Nouvelle analyse (ou nouvel examen) / modifier : nom, catégorie, précautions (facultatif)
window.anaFiche = (id) => {
  if (!gereListes()) return;
  const a = id ? ANA.find((z) => z.id === id) : null, cats = [...new Set(ANA.map((z) => z.cat).filter(Boolean))].sort(); T = null;
  A.fenetre("<h3>" + (a ? "Modifier " + (FAM.t === "exam" ? "l'examen" : "l'analyse") : FAM.nouvA) + "</h3>" +
    '<div class="form"><div class="large"><label for="anNom">' + FAM.colA + '</label><input id="anNom" value="' + A.esc(a ? a.nom : "") + '" placeholder="' + A.esc(FAM.phA) + '"></div>' +
    '<div><label for="anCat">Catégorie <span class="mesures">(facultatif)</span></label><input id="anCat" list="lAnCat" value="' + A.esc(a ? a.cat || "" : "") + '"></div>' +
    '<div><label for="anNote">Précautions <span class="mesures">(facultatif, imprimées entre parenthèses)</span></label><input id="anNote" value="' + A.esc(a ? a.note || "" : "") + '" placeholder="Ex. à jeun 6 heures"></div></div>' +
    '<datalist id="lAnCat">' + cats.map((c) => '<option value="' + A.esc(c) + '">').join("") + "</datalist>" +
    '<div class="err" id="fErr"></div><div class="boutons"><button class="bt gris" onclick="anaRetour()">Annuler</button><button class="bt plein" id="anOk">Valider</button></div>');
  $("anOk").onclick = async () => {
    const nom = A.val("anNom"), cat = A.val("anCat"), note = A.val("anNote"); if (!nom) { A.erreur("Indiquez le nom."); return; }
    if (ANA.some((z) => z.id !== (a && a.id) && sansAcc(z.nom) === sansAcc(nom))) { A.erreur("Déjà dans la liste."); return; }
    A.occupe($("anOk"), true);
    try { ANA = await modifierListe(FAM.la, (L) => { const z = a && L.find((y) => y.id === a.id); if (z) Object.assign(z, { nom, cat, note }); else L.push({ id: "a" + Date.now().toString(36), nom, cat, note }); }); A.toast(a ? "Modifié." : "Ajouté à la liste."); anaRetour(); }
    catch (e) { A.occupe($("anOk"), false); A.erreur(e && e.code === "permission-denied" ? "Vous n'avez pas le droit de modifier cette liste." : "Enregistrement impossible : " + ((e && e.message) || e)); }
  };
};
window.anaRetour = () => { T = null; if (S) vueAnalyses(); else A.fermerFenetre(); };
// Nouveau bilan / modifier : nom + ce qu'il contient (analyses ou examens, et bilans entiers)
window.bilFiche = (id) => {
  if (!gereListes()) return;
  const b = id ? BIL.find((z) => z.id === id) : null;
  T = { kind: "bilan", id: b ? b.id : null, nom: b ? b.nom : "", items: b ? b.items.map((n) => ({ nom: n, poso: "" })) : [], ed: null };
  A.fenetre("<h3>" + (b ? "Modifier le " + FAM.libB : FAM.nouvB) + "</h3>" +
    '<div class="form"><div class="large"><label for="biNom">Nom du ' + FAM.libB + '</label><input id="biNom" value="' + A.esc(T.nom) + '" placeholder="' + A.esc(FAM.phB) + '"></div></div>' +
    '<h4 class="soustitre">Contenu</h4><div id="mdOrdo" class="md-ordo"></div>' + champAjout() +
    (FAM.eclater ? "" : '<p class="mesures" style="margin:6px 0 0">Ajoutez des analyses, ou des bilans entiers : le bilan devient alors un bilan général.</p>') +
    '<div class="err" id="fErr"></div><div class="boutons"><button class="bt gris" onclick="anaRetour()">Annuler</button><button class="bt plein" id="biOk" onclick="bilValider()">Valider</button></div>', "large");
  ordo(); brancherAjout();
};
window.bilValider = async () => {
  if (!T) return; const nom = A.val("biNom");
  if (!nom) { A.erreur("Donnez un nom au " + FAM.libB + "."); return; }
  if (T.ed != null) { A.erreur("Terminez la modification en cours (OK ou Annuler)."); return; }
  const items = T.items.map((i) => i.nom).filter(Boolean); if (!items.length) { A.erreur("Ajoutez au moins " + FAM.uneA + "."); return; }
  if (BIL.some((z) => z.id !== T.id && sansAcc(z.nom) === sansAcc(nom))) { A.erreur("Ce nom existe déjà."); return; }
  if (items.some((n) => sansAcc(n) === sansAcc(nom))) { A.erreur("Un bilan ne peut pas se contenir lui-même."); return; }
  const o = { id: T.id || "b" + Date.now().toString(36), nom, items }, modif = !!T.id;
  A.occupe($("biOk"), true);
  try { BIL = await modifierListe(FAM.lb, (L) => { const i = L.findIndex((z) => z.id === o.id); if (i >= 0) L[i] = Object.assign({}, L[i], o); else L.push(o); }); A.toast(modif ? "Modifié." : "Créé."); anaRetour(); }
  catch (e) { A.occupe($("biOk"), false); A.erreur(e && e.code === "permission-denied" ? "Vous n'avez pas le droit de modifier cette liste." : "Enregistrement impossible : " + ((e && e.message) || e)); }
};
async function retirerDe(n, id) {
  try { const L = await modifierListe(n, (X) => { const i = X.findIndex((z) => z.id === id); if (i >= 0) X.splice(i, 1); }); if (n === FAM.la) ANA = L; else BIL = L; A.toast("Supprimé de la liste."); listeAnalyses(); }
  catch (e) { A.toast(e && e.code === "permission-denied" ? "Vous n'avez pas le droit de modifier cette liste." : messageListe(e, "Suppression impossible.")); }
}
window.anaSupprimer = (id) => { const a = ANA.find((z) => z.id === id); if (a && confirm("Supprimer « " + a.nom + " » de la liste ?")) retirerDe(FAM.la, id); };
window.bilSupprimer = (id) => { const b = BIL.find((z) => z.id === id); if (b && confirm("Supprimer « " + b.nom + " » ?\n\nLes ordonnances déjà faites ne changent pas.")) retirerDe(FAM.lb, id); };
async function basculerFavori(n, id) {
  try { const L = await modifierListe(n, (X) => { const z = X.find((y) => y.id === id); if (z) z.fav = !z.fav; }); if (n === FAM.la) ANA = L; else BIL = L; listeAnalyses(); }
  catch (e) { A.toast(e && e.code === "permission-denied" ? "Vous n'avez pas le droit de modifier cette liste." : messageListe(e, "Modification impossible.")); }
}
window.anaFavori = (id) => basculerFavori(FAM.la, id);
window.bilFavori = (id) => basculerFavori(FAM.lb, id);

// Favori ⭐ : en tête de liste, pour tout le cabinet
window.mdFavori = async (id) => {
  try { await modifierBib((L) => { const z = L.find((y) => y.id === id); if (z) z.fav = !z.fav; }); liste(); }
  catch (e) { A.toast(e && e.code === "permission-denied" ? "Vous n'avez pas le droit de modifier la liste des médicaments." : messageListe(e, "Modification impossible.")); }
};
window.otFavori = async (id) => {
  try { await modifierTypes((L) => { const z = L.find((y) => y.id === id); if (z) z.fav = !z.fav; }); listeTypes(); }
  catch (e) { A.toast(e && e.code === "permission-denied" ? "Vous n'avez pas le droit de modifier les ordonnances types." : messageListe(e, "Modification impossible.")); }
};
window.mdRetour = () => { if (S) (S.t === "ordo" ? vueTypes : vueListe)(); else A.fermerFenetre(); };
window.mdSupprimer = async (id) => {
  if (!gereListes()) return;
  const m = BIB.find((z) => z.id === id); if (!m || !confirm("Retirer « " + m.nom + " » de la liste des médicaments ?\n\nLes ordonnances déjà faites ne changent pas.")) return;
  try { await modifierBib((L) => { const i = L.findIndex((y) => y.id === id); if (i >= 0) L.splice(i, 1); }); A.toast("Médicament retiré de la liste."); liste(); }
  catch (e) { A.toast(e && e.code === "permission-denied" ? "Vous n'avez pas le droit de modifier la liste des médicaments." : messageListe(e, "Suppression impossible.")); }
};

// ───── Fenêtre « Courriers » (07/10/2026) : modèles du cabinet (bibliotheques/courriers = [{ id, nom, html, fav }], départ :
// donnees/courriers.js), remplis pour le patient (nom, âge, diagnostic, date, ville…) puis ouverts sur la feuille A4
// modifiable comme une ordonnance (ligne « Courriers » de la consultation du jour, antécédents). Les fiches PDF pour le
// patient (régimes…) sont dans le bouton « Doc. » (documentation.js, 08/10/2026).
let CR = null, CQ = null, CRF = null; // modèles ; { pid, q } ; modèle en cours de création / modification { id }
const ZONE = '<mark class="or-ac">À compléter</mark>';
window.ordCourriers = async (pid) => {
  const x = trouver(pid); if (!x || !peutEcrire()) return;
  S = null; T = null; CQ = { pid, q: "" };
  A.fenetre('<p class="sous">Chargement des courriers…</p>', "large");
  if (await charge(lireListe("courriers").then((L) => { CR = L; }))) vueCourriers();
};
function vueCourriers() {
  const x = trouver(CQ.pid);
  A.fenetre("<h3>Courriers" + titrePat(x) + "</h3>" +
    '<div class="md-barre"><div class="recherche">' + A.ic("loupe") + '<input id="crQ" type="search" autocomplete="off" placeholder="Rechercher un modèle de courrier…" value="' + A.esc(CQ.q) + '"></div>' +
    gerer('<button class="bt clair petit" onclick="crFiche()">' + A.ic("plus") + "Nouveau modèle</button>") + "</div>" +
    '<div class="md-liste" id="crListe"></div>' + (CQ.gestion ? "" : '<p class="mesures" style="margin:6px 0 0">Cliquez sur un modèle : il s\'ouvre rempli pour le patient (nom, âge, diagnostic, date…) ; complétez les zones surlignées en jaune.</p>') +
    '<div class="boutons"><button class="bt gris" onclick="fermerFenetre()">Fermer</button></div>', "large");
  $("crQ").oninput = () => { CQ.q = $("crQ").value; listeCourriers(); };
  listeCourriers();
}
const texteModele = (html) => { const d = document.createElement("div"); d.innerHTML = nettoyer(html); d.querySelectorAll(".or-ti").forEach((p) => p.remove()); d.querySelectorAll("p, br").forEach((p) => p.after(" ")); return d.textContent.replace(/\s+/g, " ").trim(); };
function listeCourriers() {
  const mots = sansAcc(CQ.q).split(/\s+/).filter(Boolean);
  const L = CR.filter((m) => { if (m.rt && !CQ.gestion) return false; const t = sansAcc(m.nom + " " + texteModele(m.html)); return mots.every((w) => t.indexOf(w) >= 0); }); // modèles de radiothérapie : depuis la carte RT
  $("crListe").innerHTML = L.length ? '<table class="md-t"><tr><th>Modèle</th><th>Début du texte</th><th></th></tr>' + L.map((m) => {
    const q = "'" + m.id + "'", t = texteModele(m.html);
    return '<tr class="m" onclick="crUtiliser(' + q + ')"><td><b>' + A.esc(m.nom) + "</b>" + (m.rt ? ' <span class="badge b-rt">radiothérapie</span>' + (m.defaut ? "" : ' <span class="badge b-gr">modifié</span>') : "") + "</td><td>" + A.esc(t.length > 110 ? t.slice(0, 110) + "…" : t) + '</td><td class="act" onclick="event.stopPropagation()">' + (m.rt ? "" : etoile(m, "crFavori")) +
      gerer('<button class="ico" title="Modifier le modèle" aria-label="Modifier ' + A.esc(m.nom) + '" onclick="crFiche(' + q + ')">' + ico("crayon") + "</button>" +
      (m.rt ? (m.defaut ? "" : '<button class="ico" title="Remettre le modèle d\'origine" aria-label="Remettre le modèle d\'origine" onclick="crSupprimer(' + q + ')">↺</button>')
        : '<button class="ico rouge" title="Supprimer le modèle" aria-label="Supprimer ' + A.esc(m.nom) + '" onclick="crSupprimer(' + q + ')">' + ico("croix") + "</button>")) + "</td></tr>";
  }).join("") + "</table>" : '<p class="sous" style="padding:12px">Aucun modèle ne correspond.' + gerer(" « Nouveau modèle » pour en créer un.") + "</p>";
}
// Modèle rempli pour le patient : champs {…} remplacés, « (e) » accordé ; un champ inconnu du dossier reste à compléter
// R-A5 (18/10/2026) : {poids} = poids actuel (fiche ou dernière séance de chimio) et sa date
function remplirCourrier(html, x) {
  const P = x.P || {}, e = A.esc, et = (D().etabsTous || D().etabs || []).find((z) => z.code === x.doc.etablissementId) || {};
  const a = age(P.ddn, D().t), nomEt = et.nom || x.doc.etablissementId || "";
  const art = /^[aeiouyhéèêâîôûàAEIOUYHÉÈÊÂÎÔÛÀ]/.test(nomEt) ? "l'" : /^(centre|cabinet|service|pôle|institut)\b/i.test(nomEt) ? "le " : /^(clinique|polyclinique|fondation|maison)\b/i.test(nomEt) ? "la " : "";
  const nom = P.nomF ? String(P.nomF).toUpperCase() + (P.prenom ? " " + String(P.prenom).toLowerCase().replace(/(^|[\s-])\S/g, (c) => c.toUpperCase()) : "") : x.r.nm;
  const V = { patient: civilite(x) + nom, age: a != null ? a + " ans" : "", poids: P.poids ? String(P.poids).replace(".", ",") + " kg" + (P.poidsLe ? " (" + dateFr(P.poidsLe) + ")" : "") : "", naissance: P.ddn ? dateFr(P.ddn) : "", diagnostic: diagnosticComplet(P) || x.r.diag || "", ...tumeurDe(P), mutuelle: P.mut || "", cin: P.cin || "",
    etablissement: nomEt ? art + nomEt : "", lieu: nomEt, ville: et.ville || "", date: dateFr(D().t), medecin: medecin() }; // ville vide : « À compléter » (1.7)
  ficheP.aImprimer(x).forEach((c) => { V["c_" + c.id] = c.texte; }); // champs ajoutés de la fiche (10/10/2026) : {c_identifiant}
  let h = accordMedecin(html, (A.medecinFiche() || {}).genre); // « soussignée » / « soussigné » selon le médecin (1.7)
  h = P.sexe === "F" ? h.replace(/\(e\)/g, "e") : P.sexe === "H" ? h.replace(/\(e\)/g, "") : h;
  h = h.replace(/\{([a-z0-9_]+)\}/g, (m, k) => {
    if (!(k in V)) return m;
    if (k === "date") return '<span class="or-jour">' + e(V.date) + "</span>";
    if (k === "medecin") return '<span class="or-med">' + e(V.medecin) + "</span>";
    const c = CHAMPS_COURRIER.find((z) => z[0] === k) || ficheP.champsAjoutes().filter((a) => "c_" + a.id === k).map((a) => [k, a.lib])[0];
    return V[k] ? e(V[k]) : '<mark class="or-ac">À compléter : ' + e(c ? c[1].toLowerCase() : k) + "</mark>";
  });
  return h.replace(/\bde le /g, "du ").replace(/\bà le /g, "au ");
}
window.crUtiliser = (id) => {
  if (CQ && CQ.gestion || (CR.find((z) => z.id === id) || {}).rt) { window.crFiche(id); return; }
  const m = CR.find((z) => z.id === id), x = CQ && trouver(CQ.pid); if (!m || !x) return;
  ouvrirOrdonnance({ pid: CQ.pid, t: "courrier", types: [m.nom], html: remplirCourrier(m.html, x), format: "A4", taille: 0 });
};
// Nouveau modèle / modifier : nom + feuille modifiable, avec les champs remplis automatiquement et les zones à compléter
window.crFiche = (id) => {
  if (!gereListes()) return;
  const m = id ? CR.find((z) => z.id === id) : null; CRF = { id: m ? m.id : null, rt: m && m.rt ? m.rt : null };
  const html = m ? m.html : '<p class="or-ti">TITRE DU COURRIER</p><p>Je soussignée, {medecin}, certifie que {patient} ' + ZONE + '</p><p class="or-sig">Fait à {ville}, le {date}<br><br><b>{medecin}</b></p>';
  const b = (t, lib, fn) => '<button class="ico" title="' + t + '" aria-label="' + t + '" onmousedown="event.preventDefault()" onclick="' + fn + '">' + lib + "</button>";
  A.fenetre("<h3>" + (m ? "Modifier le modèle de courrier" : "Nouveau modèle de courrier") + "</h3>" +
    '<div class="form"><div class="large"><label for="crNom">Nom du modèle</label><input id="crNom" value="' + A.esc(m ? m.nom : "") + '" placeholder="Ex. Certificat de non contre-indication"' + (CRF.rt ? " disabled" : "") + "></div></div>" +
    (CRF.rt ? '<p class="mesures">Modèle d\'un document de radiothérapie : ouvert depuis la carte radiothérapie du dossier, rempli pour le patient et sa radiothérapie. <a href="#" class="lienr" onclick="crOrigine();return false">Remettre le texte d\'origine</a></p>' : "") +
    // R-B4 (19/10/2026) : calendrier modifié par le cabinet avant la nouvelle présentation : gardé ; le nouveau est proposé ici
    (CRF.rt === "rdv" && m && !m.defaut && String(m.html || "").indexOf("{id_patient}") < 0 ? '<p class="mesures" style="color:var(--orange)">Un nouveau modèle existe : « Calendrier de fin de radiothérapie » (présentation de l\'export de l\'accélérateur, une page A4, pour les mutuelles). Votre modèle est gardé ; pour prendre le nouveau : « Remettre le texte d\'origine », puis Valider.</p>' : "") +
    '<div class="or-outils">' + b("Gras", "<b>G</b>", "orStyle('bold')") + b("Souligné", "<u>S</u>", "orStyle('underline')") + b("Centrer", "≡", "orStyle('justifyCenter')") + b("Aligner à gauche", "⇤", "orStyle('justifyLeft')") + b("Aligner à droite", "⇥", "orStyle('justifyRight')") + "</div>" +
    '<div class="cr-champs"><span class="mesures">Insérer :</span>' + (CRF.rt ? CHAMPS_RT[CRF.rt] : CHAMPS_COURRIER.concat(ficheP.champsAjoutes().filter((a) => a.imprimer).map((a) => ["c_" + a.id, a.lib]))).map(([k, lib]) => '<button class="mini" onmousedown="event.preventDefault()" onclick="crChamp(\'' + k + '\')" title="Remplacé à chaque courrier par : ' + A.esc(lib.toLowerCase()) + '">' + A.esc(lib) + "</button>").join("") +
    '<button class="mini cr-z" onmousedown="event.preventDefault()" onclick="crZone()" title="Zone surlignée, à compléter à chaque courrier">Zone à compléter</button></div>' +
    '<p class="mesures" style="margin:0 0 8px">Les champs entre accolades ({patient}, {date}…) sont remplis pour chaque patient ; « (e) » s\'accorde (suivi(e) → suivie pour une patiente). Les zones jaunes sont à compléter à chaque courrier.</p>' +
    '<div class="or-zone"><div id="crPage" class="or-feuille a4' + (CRF.rt ? " dc" : "") + '" contenteditable="true" spellcheck="true" style="font-size:15px"></div></div>' +
    '<div class="err" id="fErr"></div><div class="boutons"><button class="bt gris" onclick="crRetour()">Annuler</button><button class="bt plein" id="crOk" onclick="crValider()">Valider</button></div>', "large");
  $("crPage").innerHTML = html;
};
// Insertion à l'endroit du curseur (à la fin de la feuille si le curseur n'y est pas)
function dansPage() {
  const p = $("crPage"), s = window.getSelection(); if (!p) return false;
  if (!s.rangeCount || !p.contains(s.getRangeAt(0).commonAncestorContainer)) { p.focus(); const r = document.createRange(); r.selectNodeContents(p.lastElementChild || p); r.collapse(false); s.removeAllRanges(); s.addRange(r); }
  return true;
}
// (jamais à l'intérieur d'une zone à compléter : après elle)
function inserer(n) {
  if (!dansPage()) return; const s = window.getSelection(), r = s.getRangeAt(0); r.deleteContents();
  const c = r.startContainer, m = (c.nodeType === 1 ? c : c.parentElement).closest("mark.or-ac"); if (m) { r.setStartAfter(m); r.collapse(true); }
  const sp = document.createTextNode(" "); r.insertNode(sp); r.insertNode(n); r.setStartAfter(sp); r.collapse(true); s.removeAllRanges(); s.addRange(r);
}
window.crChamp = (k) => inserer(document.createTextNode("{" + k + "}"));
window.crZone = () => { const t = document.createElement("template"); t.innerHTML = ZONE; inserer(t.content.firstChild); };
window.crRetour = () => { CRF = null; if (CQ) vueCourriers(); else A.fermerFenetre(); };
window.crOrigine = () => { if (CRF && CRF.rt && confirm("Remettre le texte d'origine de ce document ? (enregistré seulement si vous validez)")) { $("crPage").innerHTML = MODELES_RT0[CRF.rt]; if ($("crNom") && NOMS_RT[CRF.rt]) $("crNom").value = NOMS_RT[CRF.rt]; } }; // nom d'origine aussi (R-B4)
window.crValider = async () => {
  if (!CRF) return; const nom = A.val("crNom"), html = nettoyer($("crPage").innerHTML);
  if (!nom) { A.erreur("Donnez un nom au modèle."); return; }
  if (!texteModele(html)) { A.erreur("Le modèle est vide."); return; }
  if (CR.some((z) => z.id !== CRF.id && sansAcc(z.nom) === sansAcc(nom))) { A.erreur("Un modèle porte déjà ce nom."); return; }
  const o = Object.assign({ id: CRF.id || "c" + Date.now().toString(36), nom, html }, CRF.rt ? { rt: CRF.rt } : {}), modif = !!CRF.id;
  A.occupe($("crOk"), true);
  try { CR = await modifierListe("courriers", (L) => { const i = L.findIndex((z) => z.id === o.id); if (i >= 0) { L[i] = Object.assign({}, L[i], o); delete L[i].defaut; } else L.push(o); }); A.toast(modif ? "Modèle modifié." : "Modèle créé."); crRetour(); }
  catch (e) { A.occupe($("crOk"), false); A.erreur(e && e.code === "permission-denied" ? "Vous n'avez pas le droit de modifier les modèles de courriers." : "Enregistrement impossible : " + ((e && e.message) || e)); }
};
window.crSupprimer = async (id) => {
  const m = CR.find((z) => z.id === id); if (!m || !confirm(m.rt ? "Remettre le modèle d'origine de « " + m.nom + " » ?\n\nLes documents déjà enregistrés ne changent pas." : "Supprimer le modèle « " + m.nom + " » ?\n\nLes courriers déjà faits ne changent pas.")) return;
  try { CR = await modifierListe("courriers", (L) => { const i = L.findIndex((z) => z.id === id); if (i >= 0) L.splice(i, 1); }); A.toast("Modèle supprimé."); listeCourriers(); }
  catch (e) { A.toast(e && e.code === "permission-denied" ? "Vous n'avez pas le droit de modifier les modèles de courriers." : messageListe(e, "Suppression impossible.")); }
};
window.crFavori = async (id) => {
  try { CR = await modifierListe("courriers", (L) => { const z = L.find((y) => y.id === id); if (z) z.fav = !z.fav; }); listeCourriers(); }
  catch (e) { A.toast(e && e.code === "permission-denied" ? "Vous n'avez pas le droit de modifier les modèles de courriers." : messageListe(e, "Modification impossible.")); }
};

// ───── L'ordonnance : feuille A5 / A4 modifiable, Valider / Valider + Imprimer / Fermer ─────
// Format A5 / A4 retenu pour la personne (son compte : utilisateurs/{uid}.formatOrdo, R-E7 d. 31 ; avant : par navigateur, repris s'il existe)
const fmtStock = () => { const f = (D().profil || {}).formatOrdo; if (f === "A4" || f === "A5") return f; try { return localStorage.getItem("onco360.formatOrdo") === "A4" ? "A4" : "A5"; } catch (e) { return "A5"; } };
const dateFr = (d) => d.slice(8, 10) + "/" + d.slice(5, 7) + "/" + d.slice(0, 4);
const civilite = (x) => (x.P.sexe === "F" ? "Mme " : x.P.sexe === "H" ? "M. " : "");
// Sous le nom du patient (3.2, 12/10/2026) : âge et poids (au choix du cabinet, Paramètres › Impression) ; allergie si « oui » (toujours)
const sousPatient = (x) => { const P = x.P || {}, a = age(P.ddn, D().t), l = [];
  const I = reglages().impression; if (I.age && a != null) l.push(a + " ans"); if (I.poids && P.poids) l.push(String(P.poids).replace(".", ",") + " kg" + (P.poidsLe ? " (" + dateFr(P.poidsLe) + ")" : "")); // R-A5 : poids actuel et sa date
  return (l.length ? '<p class="or-pat2">' + A.esc(l.join(" · ")) + "</p>" : "") + (I.allergie && allergique(P) ? '<p class="or-pat2"><b>Allergie : ' + A.esc(P.allergies || "oui") + "</b></p>" : ""); }; // allergie : à cocher (Paramètres › Impression, 12/10/2026)
const medecin = () => { const n = (A.medecinFiche() || {}).nom || ""; return n || "Dr "; };
// Ordonnance d'analyses ou d'examens : « Prière de bien vouloir faire : », une ligne par analyse, bilan ou examen (07/10/2026 :
// sans renseignements cliniques)
function contenuAnalyses(x, items, d, med) {
  const e = A.esc;
  return '<p class="or-date">Le ' + dateFr(d) + "</p>" + '<p class="or-pat"><b>' + e(civilite(x) + x.r.nm) + "</b></p>" + sousPatient(x) +
    '<p class="or-t"><b><u>Prière de bien vouloir faire :</u></b></p>' +
    (items.length ? items.map((it) => '<p class="or-a">• ' + marquerZones(e(it.nom)) + (it.poso ? " (" + marquerZones(e(it.poso)) + ")" : "") + "</p>").join("") : "<p><br></p>".repeat(6)) +
    '<p class="or-sig">Cachet et signature du médecin :<br><b>' + e(med) + "</b></p>";
}
// Contenu de départ : date à droite, patient, médicaments numérotés (nom souligné, posologie dessous), signature ; R-E1 (19/10/2026) :
// « … » et « [durée à compléter] » de la posologie = zones jaunes « À compléter » (comme les courriers), vérifiées avant l'impression
function contenu(x, items, d, med) {
  if ((S && estAnaT(S.t)) || (O && estAnaT(O.t))) return contenuAnalyses(x, items, d, med);
  const e = A.esc;
  return '<p class="or-date">Le ' + dateFr(d) + "</p>" +
    '<p class="or-pat"><b>' + e(civilite(x) + x.r.nm) + "</b></p>" + sousPatient(x) +
    (items.length ? items.map((it, i) => '<p class="or-m"><b><u>' + (i + 1) + "/ " + marquerZones(e(it.nom)) + "</u></b></p>" + '<p class="or-p">' + marquerZones(e(it.poso)).replace(/\n/g, "<br>") + "</p>").join("") : "<p><br></p>".repeat(8)) +
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
    const e = document.createElement(c.tagName), cl = String(c.getAttribute("class") || "").split(/\s+/).filter((k) => /^(or|dc)-[a-z]+[0-9]?$/.test(k)); // « or-pat2 » gardée (R-E7 : avant, retirée)
    if (cl.length) e.className = cl.join(" ");
    const ta = c.style && c.style.textAlign; if (/^(left|right|center|justify)$/.test(ta || "")) e.style.textAlign = ta;
    e.appendChild(propre(c)); f.appendChild(e);
  });
  return f;
}
export const nettoyer = (html) => { const t = document.createElement("template"); t.innerHTML = html; const d = document.createElement("div"); d.appendChild(propre(t.content)); return d.innerHTML; };
// Libellé de la ligne « Médic. » de la consultation : les médicaments de l'ordonnance (ou le début du texte)
function libelle(html) {
  const d = document.createElement("div"); d.innerHTML = nettoyer(html);
  const noms = [...d.querySelectorAll(".or-m, .or-a")].map((p) => p.textContent.replace(/^\s*\d+\s*\/\s*/, "").replace(/^\s*•\s*/, "").trim()).filter(Boolean);
  if (noms.length) return noms.join(" ; ");
  [".or-date", ".or-pat", ".or-pat2", ".or-sig", ".or-t", ".or-rc", ".or-ti"].forEach((s) => d.querySelectorAll(s).forEach((p) => p.remove()));
  const t = d.textContent.replace(/\s+/g, " ").trim();
  return t ? (t.length > 140 ? t.slice(0, 140) + "…" : t) : "Ordonnance vierge";
}

let O = null; // ordonnance ouverte : { pid, t, ligne (si déjà enregistrée), format, taille, lecture }
window.mdAfficher = () => {
  if (!S) return; const x = trouver(S.pid), l = S.modif;
  if (S.ed != null) { A.toast("Terminez la modification en cours (OK ou Annuler)."); return; }
  const items = S.items.filter((i) => i.nom);
  // Modification : même date de prescription, même signataire, même format ; la ligne de sa consultation sera mise à jour
  if (l) ouvrirOrdonnance({ pid: S.pid, t: l.t, ligne: l, types: S.types, html: contenu(x, items, l.d, l.med || medecin()), format: l.format || "A5", taille: l.taille || 0 });
  else ouvrirOrdonnance({ pid: S.pid, t: S.t || "medic", types: S.types, html: contenu(x, items, D().t, medecin()), format: fmtStock(), taille: 0 });
};
// Médicaments d'une ordonnance enregistrée, relus sur la feuille (avec les corrections faites à la main) : nom + posologie
function medicamentsDe(html) {
  const d = document.createElement("div"); d.innerHTML = nettoyer(html); const L = [];
  d.querySelectorAll("br").forEach((b) => b.replaceWith("\n"));
  [...d.children].forEach((p) => {
    if (p.classList.contains("or-a")) { L.push({ nom: p.textContent.replace(/^\s*•\s*/, "").trim(), poso: "", fin: true }); return; } // analyses : une ligne chacune
    if (p.classList.contains("or-t") || p.classList.contains("or-rc")) return;
    if (p.classList.contains("or-m")) L.push({ nom: p.textContent.replace(/^\s*\d+\s*\/\s*/, "").trim(), poso: "" });
    else if (L.length && L[L.length - 1].fin) return;
    else if (L.length && !p.classList.contains("or-sig") && !p.classList.contains("or-date") && !p.classList.contains("or-pat")) { const t = p.textContent; const z = L[L.length - 1]; z.poso = (z.poso ? z.poso + "\n" : "") + String(t).trim(); }
  });
  L.forEach((z) => { z.poso = z.poso.replace(/\n{2,}/g, "\n").trim(); delete z.fin; });
  return L.filter((z) => z.nom);
}
// Une ordonnance déjà enregistrée (clic sur sa ligne dans la consultation) : ses antécédents, elle sélectionnée
window.ordVoir = (pid, cid, lid) => { const l = trouverLigne(pid, cid, lid); if (l) window.ordAntecedents(pid, l.t, lid); };

// ───── Antécédents des prescriptions d'une famille ─────
const peutSupprimer = () => peutEcrire(); // médecin et secrétaire (07/10/2026)
// Date de l'ordonnance remplacée par celle du jour ; signature remplacée par le médecin du jour (renouvellement) ; R-E7 (d. 30) : âge, poids et
// allergie sous le nom refaits d'après le dossier d'aujourd'hui (Paramètres › Impression)
function auJour(html, signer, x) {
  const d = document.createElement("div"); d.innerHTML = nettoyer(html);
  if (x) { d.querySelectorAll(".or-pat2").forEach((p) => p.remove()); const pat = d.querySelector(".or-pat"); if (pat) pat.insertAdjacentHTML("afterend", sousPatient(x)); }
  const jours = d.querySelectorAll(".or-jour"), meds = d.querySelectorAll(".or-med"); // courriers : date et médecin dans le texte
  if (jours.length) jours.forEach((s) => { s.textContent = dateFr(D().t); });
  else { let p = d.querySelector(".or-date"); if (!p) { p = document.createElement("p"); p.className = "or-date"; d.prepend(p); } p.textContent = "Le " + dateFr(D().t); }
  if (signer && meds.length) meds.forEach((s) => { s.textContent = medecin(); });
  else if (signer) { const g = d.querySelector(".or-sig"); if (g) g.innerHTML = "Cachet et signature du médecin :<br><b>" + A.esc(medecin()) + "</b>"; }
  return d.innerHTML;
}
let H = null; // { pid, t, sel, q (recherche par médicament, R-E7), v (version précédente affichée) }
window.ordAntecedents = async (pid, t, sel) => {
  const x = trouver(pid); if (!x) return;
  H = { pid, t, sel: sel || null, q: "", v: null }; S = null;
  A.fenetre('<p class="sous">Chargement des antécédents…</p>', "large");
  await assurerConsultations(x); vueAntecedents();
};
function vueAntecedents() {
  const x = trouver(H.pid), f = FAMILLES.find((z) => z.t === H.t) || { titre: "Prescriptions" }, tous = prescriptionsDe(H.pid, H.t);
  // R-E7 (d. 32) : recherche par médicament (nom, posologie, texte de l'ordonnance)
  const mots = sansAcc(H.q).split(/\s+/).filter(Boolean), texte = (l) => { const d = document.createElement("div"); d.innerHTML = nettoyer(l.html || ""); return sansAcc((l.lib || "") + " " + d.textContent); };
  const L = mots.length ? tous.filter(({ l }) => { const t = texte(l); return mots.every((w) => t.indexOf(w) >= 0); }) : tous;
  if (!L.some((o) => o.l.id === H.sel)) { H.sel = L[0] ? L[0].l.id : null; H.v = null; }
  const o = L.find((z) => z.l.id === H.sel), ok = peutEcrire(), an = o && o.l.annulee, vs = (o && o.l.versions) || [], ve = H.v != null && vs[H.v] ? vs[H.v] : null, aff = ve || (o && o.l);
  const bt = (lib, fn, cls, icone, off) => '<button class="bt ' + (cls || "gris") + '" onclick="' + fn + '"' + (o && !off ? "" : " disabled") + ">" + (icone ? A.ic(icone) : "") + lib + "</button>";
  A.fenetre("<h3>Antécédents — " + A.esc(f.titre) + " — " + A.esc(x.r.nm) + "</h3>" +
    (tous.length > 3 ? '<div class="recherche" style="margin:0 0 8px">' + A.ic("loupe") + '<input id="anQ" type="search" autocomplete="off" placeholder="Rechercher un médicament, une analyse…" value="' + A.esc(H.q) + '"></div>' : "") +
    (L.length ? '<div class="an"><div class="an-l" role="listbox" aria-label="Ordonnances">' + L.map(({ l }) => '<button role="option" aria-selected="' + (l.id === H.sel) + '" class="' + (l.id === H.sel ? "on" : "") + (l.annulee ? " annulee" : "") + '" onclick="anChoisir(\'' + l.id + '\')"><b>' + A.dfrA(l.d) + "</b>" + (l.annulee ? '<span class="mesures" style="text-decoration:none">annulée</span>' : l.dm && l.dm !== l.d ? '<span class="mesures">modifiée le ' + A.dfrA(l.dm) + "</span>" : "") + "<span>" + A.esc(l.lib || "") + "</span></button>").join("") + "</div>" +
      '<div class="an-d">' + (an ? '<p class="or-al">Annulée le ' + A.esc(A.dfrA(String(an.le || "").slice(0, 10)) + (an.parNom ? " par " + an.parNom : "")) + "</p>" : "") +
      (vs.length ? '<label class="or-sg">Version <select id="anVer" onchange="anVersion(this.value)"><option value="">actuelle' + (o.l.dm ? " (modifiée le " + A.dfrA(o.l.dm) + ")" : "") + "</option>" + vs.map((v, i) => '<option value="' + i + '"' + (H.v === i ? " selected" : "") + ">du " + A.esc(A.dfrA(String(v.d || "").slice(0, 10)) + (v.par ? " (" + v.par + ")" : "")) + ", remplacée le " + A.esc(A.dfrA(String(v.le || "").slice(0, 10))) + "</option>").reverse().join("") + "</select></label>" : "") +
      '<div class="or-zone"><div class="or-feuille ' + String((aff && aff.format) || "A5").toLowerCase() + '" style="font-size:' + (((aff && aff.format) === "A4" ? 15 : 14) + ((aff && aff.taille) || 0)) + 'px">' + (aff ? nettoyer(aff.html) : "") + "</div></div>" +
      (o ? '<p class="mesures" style="margin:6px 0 0">Édition ' + A.esc(o.l.format || "A5") + " · faite par " + A.esc(o.l.par || "") + (o.l.med ? " · signée " + A.esc(o.l.med) : "") + (o.l.modifPar ? " · modifiée par " + A.esc(o.l.modifPar) : "") + "</p>" : "") + "</div>" +
      '<div class="an-b">' + (ok ? bt("Imprimer", "anImprimer()", "clair", "imprimer", an || ve) + bt("Duplicata", "anDuplicata()", "gris", "", an || ve) + (peutSupprimer() ? bt("Annuler l'ordonnance", "anSupprimer()", "gris rouge-t", "", an || ve) : "") + bt("Modifier", "anModifier()", "gris", "", an || ve) + bt("Renouveler", "anRenouveler()", "plein", "", ve) : "") +
      '<button class="bt gris" onclick="anFermer()">Fermer</button></div></div>'
      : '<p class="sous">' + (tous.length ? "Aucune ordonnance ne correspond." : "Aucune ordonnance (" + A.esc(f.titre.toLowerCase()) + ") pour ce patient.") + '</p><div class="boutons"><button class="bt gris" onclick="anFermer()">Fermer</button></div>'), "large");
  const q = $("anQ"); if (q) { q.oninput = () => { H.q = q.value; const p = q.selectionStart; vueAntecedents(); const n = $("anQ"); if (n) { n.focus(); try { n.setSelectionRange(p, p); } catch (e) {} } }; }
}
window.anVersion = (v) => { H.v = v === "" ? null : +v; vueAntecedents(); };
const choisie = () => { const o = H && prescriptionsDe(H.pid, H.t).find((z) => z.l.id === H.sel); return o && o.l; };
window.anChoisir = (id) => { H.sel = id; H.v = null; vueAntecedents(); };
window.anFermer = () => { const pid = H && H.pid; H = null; A.fermerFenetre(); if (pid) A.pageDossier(pid); };
window.anImprimer = () => { const l = choisie(); if (!l || l.annulee) return; let w = null; try { w = window.open("", "_blank"); } catch (e) { w = null; } if (w) imprimer(w, nettoyer(l.html), l.format || "A5", l.taille || 0, { pid: H.pid, uid: l.medUid || uidDeNom(l.med) }, l.t); else A.toast("Impression bloquée par le navigateur : autorisez les fenêtres pour Onco360."); };
// R-E7 (d. 29) : « Annuler » au lieu d'effacer (l'ordonnance reste lisible, barrée, avec la date et l'auteur de l'annulation)
window.anSupprimer = async () => {
  const l = choisie(), x = H && trouver(H.pid); if (!l || !x || !peutSupprimer() || l.annulee) return;
  if (!confirm("Annuler l'ordonnance du " + A.dfrA(l.d) + " ?\n\n« " + (l.lib || "") + " »\n\nElle reste lisible (barrée, « annulée ») dans sa consultation et ici.")) return;
  try { await supprimerPrescription(x, l.id); A.toast("Ordonnance annulée."); vueAntecedents(); }
  catch (e) { A.toast(e && e.code === "permission-denied" ? "Vous n'avez pas le droit d'annuler cette ordonnance." : "Annulation impossible."); }
};
// Modifier : la même ordonnance, à sa date de prescription ; enregistrée, elle change aussi dans sa consultation
// (rouvre la liste des médicaments avec ceux de l'ordonnance : ajouter, retirer, réordonner, puis « Afficher l'ordonnance »)
window.anModifier = async () => {
  const l = choisie(); if (!l || !peutEcrire()) return; const pid = H.pid; H = null;
  // ordonnance écrite à la main (sans médicament de la liste) : elle s'ouvre telle quelle, pour ne rien perdre
  // R-E7 (d. 31) : la liste des médicaments enregistrée avec la feuille (sinon relue sur la feuille, anciennes ordonnances)
  const its = Array.isArray(l.items) && l.items.length ? l.items.map((i) => ({ nom: i.nom, poso: i.poso || "" })) : medicamentsDe(l.html);
  if (["medic", "ordo", "analyse", "exam"].indexOf(l.t) < 0 || !its.length) { ouvrirOrdonnance({ pid, t: l.t, ligne: l, types: l.types, html: l.html, format: l.format || "A5", taille: l.taille || 0 }); return; }
  S = { pid, t: l.t, q: "", items: its, modif: l, types: (l.types || []).slice() }; T = null;
  A.fenetre('<p class="sous">Chargement…</p>', "large"); if (!(await charge(Promise.all([chargerBib(), l.t === "ordo" ? chargerTypes() : null, estAnaT(l.t) ? chargerAnalyses(l.t) : null])))) return;
  (l.t === "ordo" ? vueTypes : estAnaT(l.t) ? vueAnalyses : vueListe)();
};
// Renouveler : une nouvelle ordonnance du jour, même contenu, signée par le médecin du jour
window.anRenouveler = () => { const l = choisie(); if (!l || !peutEcrire()) return; const pid = H.pid; H = null; ouvrirOrdonnance({ pid, t: l.t, renouv: l, types: l.types, html: auJour(l.html, true, trouver(pid)), format: l.format || "A5", taille: l.taille || 0 }); };
// R-E7 (d. 32) : duplicata d'une ordonnance (mention « DUPLICATA » et date d'origine en haut ; rien n'est enregistré, noté au journal)
window.anDuplicata = () => {
  const l = choisie(), x = H && trouver(H.pid); if (!l || !x || l.annulee) return; const w = ouvrirImpression();
  if (!w) { A.toast("Impression bloquée par le navigateur : autorisez les fenêtres pour Onco360."); return; }
  imprimer(w, '<p class="or-dup">DUPLICATA — ' + (l.t === "courrier" ? "courrier" : "ordonnance") + " du " + A.dfrA(l.d) + "</p>" + nettoyer(l.html), l.format || "A5", l.taille || 0, { pid: H.pid, uid: l.medUid || uidDeNom(l.med) }, l.t);
  A.journal(x, "Duplicata imprimé (" + l.t + " du " + A.dfrA(l.d) + ") : " + (l.lib || ""));
};
function ouvrirOrdonnance(o) {
  O = o; const x = trouver(o.pid), l = o.ligne;
  // 3.9 : signataire (cabinet de plusieurs médecins) : celui de l'ordonnance modifiée, sinon le médecin connecté, sinon le titulaire
  O.medUid = (l && (l.medUid || uidDeNom(l.med))) || (A.medDefaut ? A.medDefaut() : "");
  const cd = cadre(o.pid, O.medUid), sigSel = plusieursMedecins() && !o.lecture ? '<label class="or-sg">Signée par <select id="orSig" onchange="orSignataire(this.value)">' + A.medecins().map((m) => '<option value="' + A.esc(m.uid) + '"' + (m.uid === O.medUid ? " selected" : "") + ">" + A.esc(m.nom) + "</option>").join("") + "</select></label>" : "";
  A.fenetre("<h3>" + (o.t === "courrier" ? "Courrier" : "Ordonnance") + " — " + A.esc(x.r.nm) + (l ? ' <span class="mesures">(du ' + A.dfrA(l.d) + ", modification)</span>" : o.renouv ? ' <span class="mesures">(renouvellement de celle du ' + A.dfrA(o.renouv.d) + ")</span>" : "") + "</h3>" +
    '<div class="or-outils"><div class="ag-vues" data-fn="prescriptions.format" role="radiogroup" aria-label="Format">' + ["A5", "A4"].map((f) => '<button role="radio" aria-checked="' + (o.format === f) + '" class="' + (o.format === f ? "on" : "") + '" onclick="orFormat(\'' + f + '\')">Édition ' + f + "</button>").join("") + "</div>" +
    (o.lecture ? "" : '<span class="sep"></span><button class="ico" title="Gras" aria-label="Gras" onmousedown="event.preventDefault()" onclick="orStyle(\'bold\')"><b>G</b></button><button class="ico" title="Souligné" aria-label="Souligné" onmousedown="event.preventDefault()" onclick="orStyle(\'underline\')"><u>S</u></button>' +
      '<button class="ico" title="Texte plus petit" aria-label="Texte plus petit" onclick="orTaille(-1)">A−</button><button class="ico" title="Texte plus grand" aria-label="Texte plus grand" onclick="orTaille(1)">A+</button>') + "</div>" +
    (o.lecture ? "" : '<p class="mesures" style="margin:0 0 8px">' + (o.t === "courrier" ? "Le courrier reste modifiable : cliquez dans la feuille pour écrire ; complétez les zones surlignées en jaune (le surlignage ne s'imprime pas)." : "L'ordonnance reste modifiable : cliquez dans la feuille pour corriger le texte.") + " Le haut de la feuille est laissé libre pour l'en-tête du papier.</p>") +
    sigSel + '<div id="orAl" aria-live="polite"></div><div class="or-zone"><div class="or-feuille-c" id="orCadre">' + (cd.haut ? '<div class="or-apercu">' + cd.haut + "</div>" : "") + '<div id="orPage" class="or-feuille" ' + (o.lecture ? "" : 'contenteditable="true" spellcheck="true"') + "></div>" + (cd.bas ? '<div class="or-apercu">' + cd.bas + "</div>" : "") + "</div></div>" +
    '<div class="err" id="fErr"></div><div class="boutons"><button class="bt gris" onclick="orFermer()">Fermer</button>' +
    (o.lecture ? "" : '<button class="bt clair" id="orOk" onclick="orValider(false)">Valider</button><button class="bt plein" id="orImp" onclick="orValider(true)">' + A.ic("imprimer") + "Valider + Imprimer</button>") + "</div>", "large");
  $("orPage").innerHTML = nettoyer(o.html); if (!o.lecture) $("orPage").oninput = () => { clearTimeout(AP_T); AP_T = setTimeout(majApercu, 350); }; miseEnPage(); // nettoyé aussi à l'affichage (audit du 10/10 : un HTML écrit directement dans la base ne doit rien exécuter)
  // un clic dans une zone « À compléter » la sélectionne : ce qu'on tape la remplace
  $("orPage").onclick = (ev) => { const m = ev.target.closest && ev.target.closest("mark.or-ac"); if (!m || !zoneRestante(m.textContent)) return; const r = document.createRange(), s = window.getSelection(); r.selectNodeContents(m); s.removeAllRanges(); s.addRange(r); };
}
function miseEnPage() { const p = $("orPage"); if (!p) return; const cdr = $("orCadre"); if (cdr) cdr.className = "or-feuille-c " + O.format.toLowerCase(); p.className = "or-feuille " + O.format.toLowerCase(); p.style.fontSize = (O.format === "A4" ? 15 : 14) + O.taille + "px"; majApercu(); }
window.orFormat = (f) => {
  if (!O) return; O.format = f;
  if (O.t !== "courrier" && (D().profil || {}).formatOrdo !== f) { if (D().profil) D().profil.formatOrdo = f; setDoc(doc(db, "utilisateurs", D().u.uid), { formatOrdo: f }, { merge: true }).catch((e) => console.warn("format", e)); }
  document.querySelectorAll(".or-outils [role=radio]").forEach((b) => { const on = b.textContent.indexOf(f) >= 0; b.classList.toggle("on", on); b.setAttribute("aria-checked", on); });
  miseEnPage();
};
window.orStyle = (c) => { try { document.execCommand(c, false, null); } catch (e) {} };
window.orTaille = (s) => { if (!O) return; O.taille = Math.max(-4, Math.min(6, O.taille + s)); miseEnPage(); };
window.orFermer = () => { O = null; A.fermerFenetre(); };
// 3.9 : autre médecin signataire : nom sous « Cachet et signature » et en-tête imprimé
window.orSignataire = (uid) => { if (!O) return; O.medUid = uid; const n = nomSignataire(uid), p = $("orPage");
  p.querySelectorAll(".or-med").forEach((z) => { z.textContent = n; }); const g = p.querySelector(".or-sig b"); if (g) g.textContent = n;
  const cd = cadre(O.pid, uid), ap = document.querySelectorAll("#orCadre .or-apercu"); if (ap[0] && cd.haut) ap[0].innerHTML = cd.haut; majApercu(); };

// ───── 3.9 (12/10/2026) : médecin signataire (cabinet de plusieurs médecins) ; en-tête et pied imprimés (Paramètres › Impression) ─────
const carte = (uid) => { const c = (A.signataires ? A.signataires() : {})[uid]; if (c) return c; const m = (A.medecins ? A.medecins() : []).find((z) => z.uid === uid); return m ? { nom: m.nom } : null; };
const nomSignataire = (uid) => (carte(uid) || {}).nom || medecin();
const plusieursMedecins = () => (A.medecins ? A.medecins() : []).length > 1;
const uidDeNom = (nom) => { const m = (A.medecins ? A.medecins() : []).find((z) => z.nom === nom) || Object.entries(A.signataires ? A.signataires() : {}).map(([uid, c]) => ({ uid, nom: c.nom })).find((z) => z.nom === nom); return m ? m.uid : ""; };
// En-tête (logo du lieu, médecin, spécialité, INPE) et pied (lieu, adresse, téléphone) ; rien avec le papier à en-tête
function cadre(pid, uid) {
  const I = reglages().impression; if (I.entete !== "genere") return { haut: "", bas: "" };
  const e = A.esc, x = trouver(pid), et = (x && A.etabDe && A.etabDe(x.doc.etablissementId)) || {}, c = carte(uid) || { nom: medecin() };
  const lg = I.eLogo && srcImage(et.logo) ? '<img class="or-elogo" src="' + srcImage(et.logo) + '" alt="">' : "";
  const id = [I.eNom && c.nom ? "<b>" + e(c.nom) + "</b>" : "", I.eSpe && c.specialite ? e(c.specialite) : "", I.eInpe && c.inpe ? "INPE : " + e(c.inpe) : ""].filter(Boolean).join("<br>");
  const pied = I.eLieu ? [et.nom, et.adresse, et.ville, et.tel ? "Tél. " + et.tel : ""].filter(Boolean).map(e).join(" · ") : "";
  return { haut: lg || id ? '<div class="or-ent">' + lg + '<div class="or-eid">' + id + "</div></div>" : "", bas: pied ? '<div class="or-pied">' + pied + "</div>" : "" };
}
const CSS_CADRE = ".or-ent{display:flex;align-items:center;gap:6mm;border-bottom:0.3mm solid #000;padding-bottom:3mm;margin-bottom:6mm}.or-elogo{max-height:18mm;max-width:45mm}.or-eid{margin-left:auto;text-align:right;line-height:1.35}" +
  ".or-pied{border-top:0.3mm solid #999;margin-top:10mm;padding-top:2mm;font-size:0.8em;color:#444;text-align:center}";
// Impression : styles communs à la feuille imprimée et à sa mesure (R-E2)
function cssImpression(format, taille, courrier) {
  const a4 = format === "A4", pt = (a4 ? 12 : 11) + taille * 0.75;
  // Marges sur chaque page (07/10/2026 : côtés élargis deux fois, haut agrandi pour l'en-tête du papier, à régler quand
  // Dr Bentahila aura mesuré ses en-têtes)
  return "@page{size:" + (a4 ? "A4" : "A5") + " portrait;margin:" + margesMm(a4 ? "a4" : "a5") + "}html,body{margin:0}body{font-family:Arial,Helvetica,sans-serif;color:#000;-webkit-print-color-adjust:exact;print-color-adjust:exact}" +
    ".pg{font-size:" + pt + "pt;line-height:1.45;display:flow-root}.or-date{text-align:right;margin:0 0 6mm}.or-pat{margin:0 0 7mm}.or-pat2{margin:-5mm 0 6mm}.or-m{margin:4mm 0 1mm}.or-p{margin:0 0 0 6mm}.or-sig{margin-top:10mm;text-align:right}p{margin:0 0 1.5mm}" +
    ".or-t{margin:0 0 3mm}p.or-a{margin:0 0 1.5mm 4mm}.or-rc{margin-top:6mm}mark.or-ac{background:none;color:inherit}.or-dup{text-align:center;font-weight:bold;letter-spacing:0.5mm;margin:0 0 4mm}" + CSS_CADRE +
    // R-E2 : plusieurs pages (nom du patient et date en haut des pages suivantes, « page 1 / 2 » en bas)
    ".pgp{position:relative;overflow:hidden;break-after:page;page-break-after:always;display:flow-root}.pgp:last-child{break-after:auto;page-break-after:auto}.pgb{position:absolute;left:0;right:0;bottom:0}.pgb .or-pied{margin-top:0}" +
    ".or-suite{font-size:0.85em;border-bottom:0.2mm solid #999;padding-bottom:1mm;margin:0 0 4mm}.or-num{text-align:right;font-size:8pt;margin:1mm 0 0}" +
    (courrier ? "p{margin:0 0 4mm;text-align:justify}.or-ti{text-align:center;font-weight:bold;font-size:1.1em;margin:0 0 9mm}.or-sig{text-align:right}.or-date{text-align:right}" : ""); // courriers
}
// R-E2 (19/10/2026, audit n° 7, d. 24) : la feuille mesurée à sa taille réelle (cadre caché, en mm) : hauteur de chaque paragraphe, pages
// (un médicament jamais coupé, la signature avec le dernier médicament ; moteur/ordonnance.js paginer). Rend { pages, lh (mm) }.
const PAPIER = { A5: [148, 210], A4: [210, 297] };
function lieAuPrecedent(el, prec) {
  if (!prec) return false;
  if (prec.classList.contains("or-t") || prec.classList.contains("or-date")) return true; // titre gardé avec la ligne qui suit ; date avec le patient
  if (el.classList.contains("or-m") || el.classList.contains("or-a")) return false; // un médicament, une analyse : un nouveau groupe
  return true; // posologie, signature, texte écrit à la main : avec ce qui précède
}
function mesurer(html, format, taille, ctx) {
  const a4 = format === "A4", m = margesMm(a4 ? "a4" : "a5").split(" ").map(parseFloat), P = PAPIER[a4 ? "A4" : "A5"], lw = P[0] - 2 * m[1], lh = P[1] - m[0] - m[2] - 0.6;
  const cd = ctx ? cadre(ctx.pid, ctx.uid) : { haut: "", bas: "" };
  const f = document.createElement("iframe"); f.setAttribute("aria-hidden", "true"); f.tabIndex = -1;
  f.style.cssText = "position:absolute;left:-10000px;top:0;width:" + lw + "mm;height:" + lh + "mm;border:0;visibility:hidden";
  document.body.appendChild(f);
  try {
    const d = f.contentDocument; d.open();
    d.write('<!DOCTYPE html><html><head><meta charset="utf-8"><style>' + cssImpression(format, taille, false) + '</style></head><body><div class="pg" id="h">' + cd.haut + '</div><div class="pg" id="c">' + html +
      '</div><div class="pg" id="b">' + cd.bas + '</div><div class="pg" id="n"><p class="or-num">page 1 / 2</p></div><div class="pg" id="s"><p class="or-suite">Patient — Le 01/01/2026</p></div><div id="mm" style="height:100mm"></div></body></html>'); d.close();
    const px = d.getElementById("mm").offsetHeight / 100, c = d.getElementById("c"), els = [...c.children];
    if (!px || !els.length) return { pages: [els.map((e, i) => i)], lh };
    const tops = els.map((e) => e.offsetTop - c.offsetTop), haut = lh * px - d.getElementById("h").offsetHeight - d.getElementById("b").offsetHeight;
    const hn = d.getElementById("n").offsetHeight, hs = d.getElementById("s").offsetHeight;
    const blocs = els.map((e, i) => ({ h: (i < els.length - 1 ? tops[i + 1] : c.offsetHeight) - tops[i], lie: i > 0 && lieAuPrecedent(e, els[i - 1]) }));
    const une = paginer(blocs, haut, haut); // une page : rien de plus ; sinon « page 1 / 2 » en bas et le patient en haut des pages suivantes
    return { pages: une.length > 1 ? paginer(blocs, haut - hn, haut - hn - hs) : une, lh };
  } catch (e) { console.warn("mesure de l'ordonnance", e); return { pages: [[]], lh }; }
  finally { f.remove(); }
}
// Aperçu (R-E2, R-E6) : trait « fin de la page 1 » avant le premier paragraphe de chaque page suivante ; allergie au-dessus de la feuille
let AP_T = null;
function lignesFeuille(p) { return [...p.querySelectorAll(".or-m, .or-a")].map((e) => e.textContent.replace(/^\s*\d+\s*\/\s*/, "").replace(/^\s*•\s*/, "").trim()).filter(Boolean); }
function alertesOrdonnance(x, p) { return O.t === "courrier" ? [] : alertesPour(x, lignesFeuille(p)); }
function majApercu() {
  const p = $("orPage"); if (!p || !O) return; const x = trouver(O.pid);
  p.querySelectorAll("[data-coupe]").forEach((e) => e.removeAttribute("data-coupe"));
  if (O.t !== "courrier" && !O.lecture) {
    const r = mesurer(nettoyer(p.innerHTML), O.format, O.taille, { pid: O.pid, uid: O.medUid }), els = [...p.children];
    r.pages.slice(1).forEach((pg, i) => { const e = els[pg[0]]; if (e) e.setAttribute("data-coupe", "fin de la page " + (i + 1)); });
    O.nbPages = r.pages.length;
  }
  const z = $("orAl"); if (!z) return; const a = alertesOrdonnance(x, p);
  z.innerHTML = a.length ? '<p class="or-al"><b>Allergie connue : ' + A.esc(x.P.allergies || "oui") + "</b> — " + a.map((y) => A.esc(texteAlerte(y))).join(" ; ") + "</p>" : "";
}
// Impression au format choisi : feuille seule (papier à en-tête), ou avec l'en-tête et le pied imprimés (3.9) ; jamais de signature scannée (R-E5) ;
// plus d'une page (R-E2) : le patient et la date en haut de chaque page suivante, « page 1 / 2 » en bas, jamais de passage automatique en A4
function imprimer(w, html, format, taille, ctx, t) {
  const cd = ctx ? cadre(ctx.pid, ctx.uid) : { haut: "", bas: "" }, courrier = t === "courrier" || html.indexOf("or-ti") >= 0;
  const r = courrier ? null : mesurer(html, format, taille, ctx);
  let corps = cd.haut + html + cd.bas;
  if (r && r.pages.length > 1) {
    const d = document.createElement("div"); d.innerHTML = html; const els = [...d.children], n = r.pages.length;
    const tete = [d.querySelector(".or-pat"), d.querySelector(".or-date")].filter(Boolean).map((e) => e.textContent.trim()).filter(Boolean).join(" — ");
    corps = r.pages.map((pg, i) => '<div class="pgp" style="height:' + r.lh + 'mm">' + cd.haut + (i ? '<p class="or-suite">' + A.esc(tete) + "</p>" : "") + pg.map((k) => els[k].outerHTML).join("") +
      '<div class="pgb">' + cd.bas + '<p class="or-num">page ' + (i + 1) + " / " + n + "</p></div></div>").join("");
  }
  w.document.open(); w.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>&#8203;</title><style>' + cssImpression(format, taille, courrier) + '</style></head><body><div class="pg">' + corps + "</div></body></html>"); w.document.close();
  setTimeout(() => { try { w.focus(); w.print(); } catch (e) {} }, 400);
}
// R-E1 (d. 28) : une seule vérification avant d'enregistrer ou d'imprimer : zones « À compléter » restantes, doublons, allergie, ordonnance sur
// plusieurs pages ; « Corriger » ou « … quand même » (jamais bloquant ; pas de contrôle des stupéfiants, décision du cabinet)
function verifications(x) {
  const p = $("orPage"), r = [], zones = [...p.querySelectorAll("mark.or-ac")].filter((m) => zoneRestante(m.textContent));
  if (zones.length) r.push({ k: "zones", t: zones.length + " zone" + (zones.length > 1 ? "s" : "") + " « À compléter » (surlignée" + (zones.length > 1 ? "s" : "") + " en jaune) : " + [...new Set(zones.map((m) => m.textContent.trim()))].slice(0, 4).join(", ") });
  if (O.t !== "courrier") {
    const d = doublonsListe(lignesFeuille(p)); if (d.length) r.push({ k: "doublons", t: "En double : " + d.join(", ") });
    const a = alertesOrdonnance(x, p); if (a.length) r.push({ k: "allergie", t: "Allergie connue (" + (x.P.allergies || "oui") + ") : " + a.map(texteAlerte).join(" ; ") });
    majApercu(); if ((O.nbPages || 1) > 1) r.push({ k: "pages", t: "L'ordonnance tient sur " + O.nbPages + " pages (" + O.format + ")." });
  }
  return r;
}
const ouvrirImpression = () => { try { return window.open("", "_blank"); } catch (e) { return null; } };
window.orValider = async (imp) => {
  if (!O || O.lecture) return; const x = trouver(O.pid); if (!x) return;
  // La fenêtre d'impression s'ouvre pendant le clic (sinon le navigateur la bloque après l'enregistrement)
  let w = null; const pb = verifications(x);
  if (pb.length) {
    const k = await question("<h4>Avant " + (imp ? "d'imprimer" : "d'enregistrer") + "</h4><ul>" + pb.map((z) => "<li>" + A.esc(z.t) + "</li>").join("") + "</ul>",
      [["corriger", "Corriger", "gris"]].concat(pb.some((z) => z.k === "pages") ? [["reduire", "Réduire le texte", "gris"]] : [], [["ok", imp ? "Imprimer quand même" : "Enregistrer quand même", "plein"]]),
      (c) => { if (c === "ok" && imp) w = ouvrirImpression(); });
    if (k === "reduire") { window.orTaille(-1); A.toast("Texte réduit : " + (O.nbPages > 1 ? "encore " + O.nbPages + " pages (A−, ou retirez une ligne)." : "l'ordonnance tient sur une page.")); return; }
    if (k !== "ok") { const m = [...$("orPage").querySelectorAll("mark.or-ac")].find((z) => zoneRestante(z.textContent)); if (m) { $("orPage").focus(); window.getSelection().selectAllChildren(m); } return; }
  } else if (imp) w = ouvrirImpression();
  const html = nettoyer($("orPage").innerHTML);
  ["orOk", "orImp"].forEach((i) => A.occupe($(i), true));
  try {
    const l = O.ligne;
    const sg = O.medUid ? { med: nomSignataire(O.medUid), medUid: O.medUid } : null; // 3.9 : médecin signataire choisi
    // R-E7 (d. 31) : auteur pris du compte (pas du texte affiché), liste des médicaments enregistrée avec la feuille (« Modifier » la reprend)
    await enregistrerPrescription(x, Object.assign(l ? { id: l.id, d: l.d, dm: D().t, med: l.med, par: l.par, parUid: l.parUid } : { t: O.t, d: D().t, med: medecin(), par: A.nomCompte ? A.nomCompte() : "", parUid: D().u.uid }, sg || {},
      { t: O.t, lib: O.t === "courrier" ? (O.types || []).join(" + ") || libelle(html) : ((O.types || []).length ? O.types.join(" + ") + " : " : "") + libelle(html), types: O.types || [], html, format: O.format, taille: O.taille },
      O.t === "courrier" ? {} : { items: medicamentsDe(html) }, l ? { modifPar: A.nomCompte ? A.nomCompte() : "", modifParUid: D().u.uid } : {}));
    if (imp) { if (w) imprimer(w, html, O.format, O.taille, { pid: x.id, uid: O.medUid || (l && (l.medUid || uidDeNom(l.med))) || (A.medDefaut ? A.medDefaut() : "") }, O.t); else A.toast("Impression bloquée par le navigateur : autorisez les fenêtres pour Onco360, puis réimprimez depuis la consultation."); }
    const pid = O.pid, renouv = !!O.renouv, cr = O.t === "courrier"; O = null; S = null; CQ = null; A.fermerFenetre();
    A.toast(cr ? (l ? "Courrier modifié (et dans sa consultation)." : renouv ? "Courrier refait à la date du jour, dans la consultation du jour." : "Courrier enregistré dans la consultation du jour.") : l ? "Ordonnance modifiée (et dans sa consultation)." : renouv ? "Ordonnance renouvelée dans la consultation du jour." : "Ordonnance enregistrée dans la consultation du jour."); A.pageDossier(pid);
  } catch (e) {
    if (w) try { w.close(); } catch (er) {}
    ["orOk", "orImp"].forEach((i) => A.occupe($(i), false));
    A.erreur(e && e.code === "permission-denied" ? "Vous n'avez pas le droit d'enregistrer une ordonnance." : "Enregistrement impossible : " + ((e && e.message) || e));
  }
};
