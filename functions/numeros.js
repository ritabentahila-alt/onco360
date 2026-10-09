// Onco360 – numéro de dossier (étape 8, 09/10/2026) : calculs purs, testables hors ligne (node functions/test-numeros.js).
// Numéro = AAAAMM (mois d'inscription, heure du Maroc) + rang d'inscription dans ce mois sur 3 chiffres (4 au-delà de 999) :
// 202610001 = 1er patient inscrit en octobre 2026. Un seul compteur pour le cabinet ; le numéro ne change jamais.
const TZ = "Africa/Casablanca";

const moisCasa = (ms) => {
  const p = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit" }).formatToParts(new Date(ms));
  return p.find((x) => x.type === "year").value + p.find((x) => x.type === "month").value;
};
const numero = (mois, n) => mois + String(n).padStart(3, "0");

// Date d'inscription d'un dossier (ms) : l'identifiant porte l'heure de création (« P » + 13 chiffres pour les dossiers venus
// de l'ancienne application, « P » + heure en base 36 pour ceux créés dans Onco360), sinon identite.cree, sinon la date de
// création du document (attention : les dossiers repris de l'ancienne application ont tous été recréés le 06/10/2026).
const MIN = Date.UTC(2015, 0, 1), MAX = Date.UTC(2100, 0, 1);
function dateCreation(id, identite, createMs) {
  const s = String(id || "");
  let m = s.match(/^P(\d{13})/);
  if (m && +m[1] > MIN && +m[1] < MAX) return +m[1];
  m = s.match(/^P([0-9a-z]{8})/);
  if (m) { const v = parseInt(m[1], 36); if (v > MIN && v < MAX) return v; }
  const c = identite && identite.cree;
  if (c && /^\d{4}-\d{2}-\d{2}$/.test(c)) return Date.parse(c + "T12:00:00Z");
  return createMs || Date.now();
}

// Numéros des dossiers qui n'en ont pas, dans l'ordre d'inscription, à partir des compteurs actuels { "202610": 7, … }.
// dossiers = [{ id, ms }] ; renvoie { attributions: [{ id, numero }], compteurs }.
function attribuer(dossiers, compteurs) {
  const C = Object.assign({}, compteurs || {}), attributions = [];
  dossiers.slice().sort((a, b) => a.ms - b.ms || String(a.id).localeCompare(String(b.id))).forEach((d) => {
    const mo = moisCasa(d.ms), n = (C[mo] || 0) + 1; C[mo] = n; attributions.push({ id: d.id, numero: numero(mo, n) });
  });
  return { attributions, compteurs: C };
}

module.exports = { moisCasa, numero, dateCreation, attribuer };
