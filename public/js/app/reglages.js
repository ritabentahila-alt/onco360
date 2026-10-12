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
  impression: { a5: [45, 28, 18], a4: [60, 35, 22], doc: [45, 35, 22], age: false, poids: false, allergie: false }, // âge, poids sous le nom sur les ordonnances (3.2 ; séparés le 12/10/2026)
  whatsapp: { de: 1, a: 2 },
  alertes: { cure: 3, finTrait: 30 },
  auto: { rtHebdo: true, rtFin: true }, // rendez-vous créés d'office (12/10/2026) : consultations hebdomadaires de RT, consultation de fin de RT
  salle: { orange: 20, rouge: 45, notifArrivee: true, notifRouge: true }, // + messages à l'écran (SA6, 11/10/2026) // salle d'attente : minutes d'attente avant l'orange, puis le rouge (08/10/2026)
};
const copie = (o) => JSON.parse(JSON.stringify(o));
// Réglages en vigueur : ceux du cabinet, complétés par les valeurs par défaut
export function reglages() {
  const r = copie(REGLAGES0), c = (D() && D().reglages) || {};
  Object.keys(r).forEach((k) => { if (c[k] && typeof c[k] === "object") Object.assign(r[k], c[k]); });
  if (r.impression.agePoids) { const ci = c.impression || {}; if (!("age" in ci)) r.impression.age = true; if (!("poids" in ci)) r.impression.poids = true; } delete r.impression.agePoids; // ancien réglage commun
  return r;
}
// Marges d'impression : « 45mm 28mm 18mm » pour @page ; variables CSS de l'aperçu à l'écran (feuille modifiable)
export const margesMm = (q) => reglages().impression[q].map((v) => v + "mm").join(" ");
export function appliquerImpression() {
  const I = reglages().impression, st = document.documentElement.style;
  [["a5", I.a5], ["a4", I.a4], ["dc", I.doc]].forEach(([k, m]) => { st.setProperty("--" + k + "-h", m[0]); st.setProperty("--" + k + "-c", m[1]); st.setProperty("--" + k + "-b", m[2]); });
}
// Enregistre seulement ce qui diffère des valeurs par défaut
export async function enregistrerReglages(r) {
  const out = {};
  Object.keys(REGLAGES0).forEach((k) => { if (JSON.stringify(r[k]) !== JSON.stringify(REGLAGES0[k])) out[k] = r[k]; });
  await setDoc(doc(db, "espaces", A.ESPACE, "parametres", "reglages"), { data: JSON.stringify(out), maj: serverTimestamp(), majPar: D().u.uid });
  D().reglages = out; appliquerImpression();
}
