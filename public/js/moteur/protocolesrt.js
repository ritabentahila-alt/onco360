// Protocoles de chimiothérapie du référentiel de radiothérapie (25/10/2026) : calcul pur, sans DOM ni Firebase. Rend les protocoles de
// donnees/protocolesrt.js absents de la bibliothèque (ni le même identifiant, ni le même nom, accents et casse ignorés) ; relancer ne crée rien deux fois.
// Testé par node tests/moteur/test-protocolesrt.mjs.
const cle = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
export function protocolesACreer(bib, liste) {
  const noms = new Set(Object.values(bib || {}).filter((p) => p && p.nom).map((p) => cle(p.nom)));
  return (liste || []).filter((p) => !(bib || {})[p.id] && !noms.has(cle(p.nom))).map((p) => JSON.parse(JSON.stringify(p)));
}
