// Onco360 – réglages simples du cabinet (P2, 08/10/2026), modifiés dans Paramètres :
// espaces/{e}/parametres/reglages = { data: JSON { impression, whatsapp, alertes } } (seulement ce qui a été changé ;
// sinon les valeurs par défaut ci-dessous, celles utilisées avant le 08/10/2026). Lu au démarrage (v2.js : D.reglages).
//   impression : marges en mm [haut (place de l'en-tête du papier), côtés, bas] des ordonnances A5, A4 et des documents A4
//   whatsapp   : bouton WhatsApp vert de « de » à « a » jours avant le rendez-vous (1 à 2 = 24 à 48 h)
//   alertes    : cure annoncée « dans N jours » (cure), traitement terminé affiché pendant N jours (finTrait)
//   salle      : salle d'attente, attente en orange à partir de N minutes (orange), en rouge à partir de N minutes (rouge)
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "../config.js";

let A = null;
export function installer(api) { A = api; }
const D = () => A.D();

export const REGLAGES0 = {
  // entete (3.9, 12/10/2026) : « papier » = papier à en-tête (rien n'est imprimé en haut, marge du haut) ; « genere » = en-tête et pied imprimés
  // par Onco360 (eLogo : logo du lieu, eNom, eSpe, eInpe : médecin signataire ; eLieu : adresse et téléphone du lieu en pied ; R-E5, 19/10/2026 : plus de signature scannée, ancienne case eSig ignorée)
  // rSpe … rTva (R-B5, 19/10/2026) : mentions imprimées sur le reçu (identifiants du médecin de l'acte ; exonération de TVA à confirmer par le comptable)
  impression: { rSpe: true, rInpe: true, rIf: true, rTp: true, rIce: true, rTva: false, a5: [45, 28, 18], a4: [60, 35, 22], doc: [45, 35, 22], age: false, poids: false, allergie: false, entete: "papier", eLogo: true, eNom: true, eSpe: true, eInpe: true, eLieu: true, fenRappel: false }, // fenRappel (R-G e, 19/10/2026) : allergie et poids rappelés en haut de la fenêtre d'ordonnance // âge, poids sous le nom sur les ordonnances (3.2 ; séparés le 12/10/2026)
  whatsapp: { de: 1, a: 2 },
  alertes: { cure: 3, finTrait: 30 },
  auto: { rtHebdo: true, rtFin: true }, // rendez-vous créés d'office (12/10/2026) : consultations hebdomadaires de RT, consultation de fin de RT
  salle: { orange: 20, rouge: 45, notifArrivee: true, notifRouge: true },
  // R-G d (audit n° 5, 19/10/2026) : dossier patient, parties de la colonne Patient dépliées par défaut (chacun peut ensuite déplier / replier :
  // gardé sur son appareil)
  dossier: { parties: { avenir: true, passe: false, id: false, med: false, tum: false } }, // + messages à l'écran (SA6, 11/10/2026) // salle d'attente : minutes d'attente avant l'orange, puis le rouge (08/10/2026)
};
const copie = (o) => JSON.parse(JSON.stringify(o));
// Réglages en vigueur : ceux du cabinet, complétés par les valeurs par défaut
export function reglages() {
  const r = copie(REGLAGES0), c = (D() && D().reglages) || {};
  Object.keys(r).forEach((k) => { if (c[k] && typeof c[k] === "object") Object.assign(r[k], c[k]); });
  if (c.dossier && c.dossier.parties) r.dossier.parties = Object.assign({}, REGLAGES0.dossier.parties, c.dossier.parties);
  if (r.impression.agePoids) { const ci = c.impression || {}; if (!("age" in ci)) r.impression.age = true; if (!("poids" in ci)) r.impression.poids = true; } delete r.impression.agePoids; // ancien réglage commun
  return r;
}
// Marges d'impression : « 45mm 28mm 18mm » pour @page ; variables CSS de l'aperçu à l'écran (feuille modifiable)
// en-tête imprimé (3.9) : marge du haut réduite ; T6 (24/10/2026, d. 52) : ordonnance A5 avec l'en-tête imprimé par Onco360 : marges latérales à
// 15 mm au plus (avant : 28 mm, 92 mm de texte sur 148) ; papier à en-tête : marges du cabinet (haut 55 mm, réglé par Dr Bentahila)
export const margesMm = (q) => { const I = reglages().impression, m = I[q].slice(); if (I.entete === "genere" && q !== "doc") m[0] = Math.min(m[1], 20); if (I.entete === "genere" && q === "a5") m[1] = Math.min(m[1], 15); return m.map((v) => v + "mm").join(" "); };
export function appliquerImpression() {
  const I = reglages().impression, st = document.documentElement.style;
  [["a5", I.a5], ["a4", I.a4], ["dc", I.doc]].forEach(([k, m]) => { st.setProperty("--" + k + "-h", I.entete === "genere" && k !== "dc" ? Math.min(m[1], 20) : m[0]); /* en-tête imprimé (3.9) : pas de place pour le papier */ st.setProperty("--" + k + "-c", I.entete === "genere" && k === "a5" ? Math.min(m[1], 15) : m[1]); /* T6 : aperçu = impression */ st.setProperty("--" + k + "-b", m[2]); });
}
// Enregistre seulement ce qui diffère des valeurs par défaut
export async function enregistrerReglages(r) {
  const out = {};
  Object.keys(REGLAGES0).forEach((k) => { if (JSON.stringify(r[k]) !== JSON.stringify(REGLAGES0[k])) out[k] = r[k]; });
  await setDoc(doc(db, "espaces", A.ESPACE, "parametres", "reglages"), { data: JSON.stringify(out), maj: serverTimestamp(), majPar: D().u.uid });
  D().reglages = out; appliquerImpression();
}
