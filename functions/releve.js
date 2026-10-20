// Onco360 – relevé financier du comptable préparé la nuit par le serveur (R-D2, audit n° 6, A7, 20/10/2026).
// Même relevé que celui que prépare le navigateur du médecin (public/js/app/bilan.js publierReleve) : espaces/{e}/comptabilite/releve_0…n
// = { data: JSON [{ id, nm, num, cor, hop, c1, fin }] } (nom, n° de dossier, référent, lieu, 1re venue, actes du bilan ; aucun diagnostic)
// et meta = { n, le, par, parNom, sig, nb }. Même signature : si rien n'a changé, rien n'est réécrit (ni la nuit, ni par le navigateur).
// Calcul des actes = code du site recopié dans functions/site/ (moteur/finances.js et ce dont il dépend ; firebase.json, predeploy),
// vérifié par node functions/test-releve.js. Logique pure ici ; lecture et écriture de la base dans index.js (releveNuit).
const MOTEUR = ["finances", "outils", "doses", "rdv", "tarifs", "rt", "heures", "poids"];
const DONNEES = ["conversion"];
const FICHIERS = MOTEUR.map((f) => "moteur/" + f + ".js").concat(DONNEES.map((f) => "donnees/" + f + ".js"));
let M0 = null;
async function moteur() {
  if (M0) return M0;
  const [fi, co, po] = await Promise.all([import("./site/moteur/finances.js"), import("./site/donnees/conversion.js"), import("./site/moteur/poids.js")]);
  return (M0 = { evtsFin: fi.evtsFin, fusionner: co.fusionner, poidsActuel: po.poidsActuel });
}
// Signature du relevé (même calcul que bilan.js signature)
function signature(s) { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return s.length + "-" + (h >>> 0).toString(36); }
// Lignes du relevé. d = { patients: [{ id, data }] (ordre des identifiants, comme Onco360), montants: { id: montants }, bib: { idProtocole:
// protocole }, feries, tarifs, aujourdhui } ; comme v2.js recalculer (dossier mal formé : sans ses traitements) puis bilan.js resumes
function lignes(m, d) {
  const ctx = { aujourdhui: d.aujourdhui, bib: d.bib || {}, feries: d.feries || [] }, ctxF = Object.assign({}, ctx, { table: d.tarifs });
  return d.patients.map(({ id, data }) => {
    let P; try { P = m.fusionner(id, data, null); } catch (e) { P = Object.assign({ id }, data.identite || {}, { hop: data.etablissementId || "", lignes: [], rdvs: [], rts: [] }); }
    try { const pa = m.poidsActuel(P, ctx); P.poidsFiche = P.poids; if (pa) { P.poids = pa.v.replace(",", "."); P.poidsLe = pa.d; } } catch (e) { /* poids : sans effet sur les montants */ }
    let fin = null; try { fin = JSON.parse(JSON.stringify(m.evtsFin(P, (d.montants || {})[id] || {}, ctxF))); } catch (e) { fin = null; }
    const dates = (fin || []).map((e) => e[0]).filter(Boolean).sort();
    return { id, nm: P.nom, num: (data.identite && data.identite.numero) || "", cor: P.cor || "", hop: P.hop || "", c1: P.cree || dates[0] || "", fin };
  });
}
// Documents de 600 Ko au plus (limite Firestore : 1 Mo), comme bilan.js
function parties(R) {
  const out = []; let cur = [], taille = 0;
  R.forEach((r) => { const t = JSON.stringify(r).length; if (cur.length && taille + t > 600000) { out.push(cur); cur = []; taille = 0; } cur.push(r); taille += t; });
  out.push(cur); return out;
}
// Le cabinet reçoit-il un relevé la nuit ? Un cabinet actif (ni bibliothèque, ni démonstration), avec des tarifs, la fonction « relevé du
// comptable » du réglage (bilan.comptable) et au moins un comptable actif
function concerne(cab, membres, tarifs) {
  if (!cab || cab.bibliotheque || cab.demo || cab.actif === false || !tarifs) return false;
  const f = (((cab.abonnement || {}).reglage || {}).fonctions || {});
  if (f["bilan.comptable"] === false) return false;
  return (membres || []).some((m) => m && m.role === "comptable" && m.actif !== false);
}
module.exports = { FICHIERS, moteur, signature, lignes, parties, concerne };
