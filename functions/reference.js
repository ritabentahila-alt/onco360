// Onco360 – P9 (18/10/2026) : bibliothèque commune. Différences entre la bibliothèque de référence (espaces/bib-oncologie) et celle
// d'un cabinet, pour proposer au cabinet les protocoles et ordonnances types nouveaux ou différents. Logique pure (test-reference.js).
// Jamais d'écrasement : le cabinet choisit protocole par protocole (Onco360, protocoles.js) ; un choix « garder le mien » est noté avec
// l'empreinte de la version de la référence refusée (parametres/reference.refus) et ne revient que si la référence change encore.
const crypto = require("crypto");

// Contenu qui compte pour la prescription (pas l'étoile, ni les traces de version / validation / auteur)
const contenu = (p) => JSON.stringify([p.nom, p.c || 0, p.r || "", (p.dr || []).map((d) => [d.p, d.u, d.d, d.c1, d.cn, d.pos, String(d.j || ""), d.jl || "", d.n || "", d.v || "", d.s || "", d.t || "", d.max, d.dec, d.tous, d.c1s, d.nc1, d.cmax, d.nd]),
  p.no || [], p.ind || [], p.seuils || [], p.ordos || [], p.re || "", p.src || "", p.st || ""]);
const empreinte = (p) => crypto.createHash("sha1").update(contenu(p)).digest("hex").slice(0, 16);
const contenuOrdo = (o) => JSON.stringify([o.nom, (o.items || []).map((i) => [i.nom, i.poso])]);
const empreinteOrdo = (o) => crypto.createHash("sha1").update(contenuOrdo(o)).digest("hex").slice(0, 16);

// ref, cab : [protocole] ; refus : { id: empreinte } ; supprimes : [id] (protocoles retirés par le cabinet : jamais reproposés comme nouveaux)
function differences(ref, cab, refus, supprimes) {
  const C = {}, out = [], R = refus || {}, S = new Set(supprimes || []);
  (cab || []).forEach((p) => { if (p && p.id) C[p.id] = p; });
  (ref || []).forEach((p) => {
    if (!p || !p.id || !p.nom) return; const e = empreinte(p);
    if (R[p.id] === e) return;
    const c = C[p.id];
    if (!c) { if (!S.has(p.id)) out.push({ id: p.id, type: "nouveau", ref: p, e }); return; }
    if (contenu(c) !== contenu(p)) out.push({ id: p.id, type: "different", ref: p, cab: c, e });
  });
  return out;
}
// Ordonnances types : par le nom (les identifiants diffèrent d'un cabinet à l'autre)
function differencesOrdos(ref, cab, refus) {
  const C = {}, out = [], R = refus || {};
  (cab || []).forEach((o) => { if (o && o.nom) C[o.nom] = o; });
  (ref || []).forEach((o) => {
    if (!o || !o.nom) return; const e = empreinteOrdo(o), k = "o:" + o.nom;
    if (R[k] === e) return;
    const c = C[o.nom];
    if (!c) out.push({ id: k, type: "nouveau", ref: o, e });
    else if (contenuOrdo(c) !== contenuOrdo(o)) out.push({ id: k, type: "different", ref: o, cab: c, e });
  });
  return out;
}
// Lignes de protocole décrites en une phrase (écran de comparaison)
const ligneTxt = (d) => d.p + " — " + (d.u === "txt" ? d.pos || "" : d.c1 != null ? d.c1 + "/" + d.cn + " " + d.u : (d.d != null ? d.d : "") + " " + d.u) + (d.j && String(d.j) !== "99" ? " — J" + d.j.join(", J") : d.jl ? " — " + d.jl : "");
function resume(a, b) {
  const A = (a && a.dr || []).map(ligneTxt), B = (b && b.dr || []).map(ligneTxt);
  return { ajoutees: B.filter((l) => A.indexOf(l) < 0), retirees: A.filter((l) => B.indexOf(l) < 0), nom: a && b && a.nom !== b.nom ? [a.nom, b.nom] : null, cycle: a && b && (a.c || 0) !== (b.c || 0) ? [a.c || 0, b.c || 0] : null };
}
module.exports = { contenu, empreinte, empreinteOrdo, differences, differencesOrdos, resume, ligneTxt };
