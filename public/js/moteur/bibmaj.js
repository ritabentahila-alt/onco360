// Onco360 – R-E4 (19/10/2026, audit n° 7, d. 18) : mise à jour d'une bibliothèque de cabinet sans rien écraser (calculs purs,
// tests/moteur/test-bibmaj.mjs). Règle du cabinet : une mise à jour n'écrase jamais ce qu'un médecin a modifié ; elle ajoute ce qui manque
// (et que le médecin n'a pas créé entre-temps) ; un élément retiré par le médecin n'est jamais reproposé (liste « retires » de la bibliothèque).
// Éléments reconnus par leur identifiant (jamais par leur position) ; une correction ne touche qu'un élément encore identique à la version
// d'avant (donnees/majbib.js).
const sa = (t) => String(t == null ? "" : t).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
const copie = (o) => JSON.parse(JSON.stringify(o));
// Élément du cabinet encore identique à la version d'avant ?
const EGAL = {
  medicaments: (o, a) => sa(o.nom) === sa(a[0]) && sa(o.poso) === sa(a[1]),
  analyses: (o, a) => sa(o.nom) === sa(a[0]) && sa(o.cat) === sa(a[1]),
  bilans: (o, a) => sa(o.nom) === sa(a[0]) && JSON.stringify((o.items || []).map(sa)) === JSON.stringify((a[1] || []).map(sa)),
  examens: (o, a) => sa(o.nom) === sa(a[0]) && sa(o.cat) === sa(a[1]) && sa(o.note) === sa(a[2]),
};
// Déjà là : même identifiant, ou même nom (un médecin qui l'a créé lui-même entre-temps)
export const present = (L, f) => L.some((o) => o && (o.id === f.id || sa(o.nom) === sa(f.nom)));
// L : liste du cabinet (modifiée sur place) ; maj : { corrections: [{ avant, apres: [identifiants] }], ajouts: [identifiants] } ;
// depart : liste de départ d'aujourd'hui [{ id, … }] ; retires : identifiants retirés par le cabinet. Rend { corriges, ajoutes, noms }.
export function fusionnerListe(n, L, maj, depart, retires) {
  const r = { corriges: 0, ajoutes: 0, noms: [] }, R = new Set(retires || []), D = (id) => (depart || []).find((z) => z.id === id), egal = EGAL[n];
  const ajouter = (id) => { const g = D(id); if (!g || R.has(id) || present(L, g)) return; L.push(copie(g)); r.ajoutes++; r.noms.push(g.nom); };
  ((maj && maj.corrections) || []).forEach((c) => {
    const f = D(c.apres[0]), i = egal ? L.findIndex((o) => o && egal(o, c.avant)) : -1; if (!f || i < 0) return; // modifié ou retiré par le cabinet : rien
    const o = L[i]; L[i] = Object.assign(copie(f), { id: o.id }, o.fav ? { fav: o.fav } : {}); r.corriges++; r.noms.push(f.nom);
    c.apres.slice(1).forEach(ajouter); // autres dosages d'une fiche coupée en plusieurs
  });
  ((maj && maj.ajouts) || []).forEach(ajouter);
  return r;
}
// Ordonnances types : renommée si le cabinet a encore l'ancien nom (et pas déjà le nouveau) ; une ligne remplacée seulement si elle est encore
// celle d'avant. maj : [{ ordo, ancien, lignes: [{ avant: [nom, poso], apres: [nom, poso] }] }]. Rend { renommees, lignes }.
export function fusionnerOrdos(L, maj) {
  const r = { renommees: 0, lignes: 0 };
  (maj || []).forEach((m) => {
    let o = L.find((z) => z && z.nom === m.ordo);
    if (!o && m.ancien) { o = L.find((z) => z && z.nom === m.ancien); if (o) { o.nom = m.ordo; r.renommees++; } }
    if (!o || !Array.isArray(o.items)) return;
    (m.lignes || []).forEach((l) => { const i = o.items.findIndex((it) => sa(it.nom) === sa(l.avant[0]) && sa(it.poso) === sa(l.avant[1])); if (i >= 0) { o.items[i] = { nom: l.apres[0], poso: l.apres[1] }; r.lignes++; } });
  });
  return r;
}
// Ordonnances types de départ qui manquent au cabinet (par le nom), sauf celles qu'il a retirées : ajoutées (remplace « remplacerOrdosTypes »,
// qui écrasait toute la liste : ordonnances du cabinet et étoiles perdues)
export function ajouterManquantes(L, depart, retires) {
  const R = new Set(retires || []); let n = 0;
  (depart || []).forEach((o) => { if (R.has(o.id) || L.some((z) => z && sa(z.nom) === sa(o.nom))) return; L.push(copie(o)); n++; });
  return n;
}
// Identifiants retirés par une modification (avant → après) : notés dans la liste « retires » de la bibliothèque
export const retiresEntre = (avant, apres) => { const ids = new Set((apres || []).map((o) => o && o.id)); return (avant || []).map((o) => o && o.id).filter((id) => id && !ids.has(id)); };
