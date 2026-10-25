// Onco360 – Référentiel de radiothérapie (phase RTR, spécification docs/radiotherapie/SPEC.md).
// RT1 (25/10/2026) : page du menu « Radiothérapie » (module rt, fonction rt.referentiel, droit referentielRT voir | modifier) ;
// elle lit le sommaire du contenu de référence (public/donnees-rt/index.json, jamais modifié par l'application) et en donne les
// nombres. Recherche, liste et fiches : lots RT2 à RT6. Le module n'écrit rien dans les dossiers patients.
let A = null, INDEX = null;
export function installer(api) { A = api; }
const $ = (i) => document.getElementById(i);
// Sommaire chargé une fois par session (servi en no-cache : une nouvelle livraison est lue au prochain chargement d'Onco360)
async function chargerIndex() {
  if (INDEX) return INDEX;
  const r = await fetch("donnees-rt/index.json", { cache: "no-cache" });
  if (!r.ok) throw new Error("index.json : " + r.status);
  INDEX = await r.json(); return INDEX;
}
const dateFr = (d) => String(d || "").split("-").reverse().join("/");
export async function pageRadiotherapie() {
  const esc = A.esc;
  $("page").innerHTML = '<section class="accueil"><div><h2>Radiothérapie</h2><p>Référentiel de radiothérapie</p></div></section><div class="carte" id="rtrZone"><p class="sous">Chargement du référentiel…</p></div>';
  try {
    const x = await chargerIndex(), z = $("rtrZone"); if (!z) return;
    z.innerHTML = '<p class="mesures">' + esc(x.localisations.length + " localisations · " + x.schemas.length + " schémas · contenu du " + dateFr(x.version)) + '</p><div class="vide-c">La recherche et les fiches arrivent aux prochaines étapes.</div>';
  } catch (e) {
    console.warn("référentiel de radiothérapie", e);
    const z = $("rtrZone"); if (z) z.innerHTML = '<p>Le référentiel n\'a pas pu être chargé.</p><button class="bt clair" id="rtrReessayer">Réessayer</button>';
    const b = $("rtrReessayer"); if (b) b.onclick = () => pageRadiotherapie();
  }
}
