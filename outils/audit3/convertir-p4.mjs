// Audit n° 3 – P4 (18/10/2026) : transforme le classeur « Protocoles-chimio-Onco360-a-faire.xlsx » (archives/audit-3/) en corrections
// structurées pour chaque protocole existant : consignes des ordres 2 et 3 (« À ajuster », « À modifier »), seuils du jour et ordonnances
// liées de tous les protocoles. Écrit public/js/donnees/audit3p4.js (chargé une seule fois par protocoles.js `appliquerAudit3`).
//   node outils/audit3/convertir-p4.mjs [bibliotheque.json]   (facultatif : protocoles réels [{ id, nom }] pour retrouver les identifiants)
// Les protocoles sont retrouvés par leur nom (et ID_FORCE pour deux noms qui ont changé) ; l'application vérifie chaque consigne sur
// le protocole réel (moteur/audit3p4.js) : ce qui ne s'applique plus est laissé de côté.
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url), XLSX = require("../../public/vendor/xlsx.full.min.js");
const R = new URL("../../", import.meta.url);
const wb = XLSX.read(readFileSync(new URL("archives/audit-3/Protocoles-chimio-Onco360-a-faire.xlsx", R)));
const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: "" }).slice(5).filter((x) => typeof x[0] === "number");
const ID_FORCE = { 40: "sein|palbociclib (papillo)", 288: "maj|cisplatine-25-j1-j3-5-fu-3000-sur-5-j-acide-folinique-28-j-orl-hgc-" };
const DEJA = new Set([89, 197, 253, 273, 14, 217, 211, 117, 125, 300, 306, 34, 27, 28, 41, 39, 38]); // faits en P1a / palier 3

const VOIE = /^(IV|IV lente|IVD|SC|IM|Per os|PO|IV \/ per os|Perfusion IV|Intrathécal)$/i;
const fr = (s) => parseFloat(String(s).replace(",", "."));
function dose(spec) {
  const t = spec.match(/^(.*) \(unité : texte libre\)$/); if (t) return { u: "txt", pos: t[1], dt: t[1] };
  let m = spec.match(/^([\d,.]+)\/([\d,.]+) (mg\/kg|mg) charge C1 \/ suite$/); if (m) return { u: m[3] === "mg" ? "mg_c1" : "mg/kg_c1", c1: fr(m[1]), cn: fr(m[2]) };
  m = spec.match(/^AUC ([\d,.]+)$/); if (m) return { u: "AUC", d: fr(m[1]) };
  m = spec.match(/^([\d,.]+) (mg\/m²|mg\/kg|mg)(?: \(dose fixe\))?$/); if (m) return { u: m[2], d: fr(m[1]) };
  return { u: "txt", pos: spec, dt: spec };
}
// « Produit — dose — Jours 1,8 (libellé « … ») — précision — voie — soluté — durée »
function ligne(txt) {
  const parts = txt.split(" — ").map((s) => s.trim()), d = Object.assign({ p: parts[0] }, dose(parts[1] || ""));
  const jm = (parts[2] || "").match(/^Jours? ([\d,]+)(?: \(libellé « (.+) »\))?/); if (jm) { d.j = jm[1].split(",").map(Number); if (jm[2]) d.jl = jm[2]; }
  let apresVoie = false;
  parts.slice(3).forEach((x) => {
    x = x.replace(/\s*\(remplace .*$/, "").trim(); if (!x) return;
    if (VOIE.test(x)) { d.v = x; apresVoie = true; return; }
    if (apresVoie && /^\d[\d,.\- ]*(min|h)\b/.test(x)) { d.t = x; return; }
    if (apresVoie && /(NaCl|G5|ml|filtre)/i.test(x)) { d.s = x; return; }
    if (/^\d[\d,.\- ]*(min|h)$/.test(x)) { d.t = x; return; }
    d.n = d.n ? d.n + " ; " + x : x;
  });
  return d;
}
const chemin = (s) => s.replace(/\s*\((?:[^()]|\([^)]*\))*\)\s*$/, "").split(/\s*[>›]\s*/).map((z) => z.trim()).concat(["", "", "", ""]).slice(0, 4);
const nomsOrdo = (s) => String(s).split("\n").map((l) => l.trim().replace(/^Chimio – Sortie : /, "Chimio : ").replace(/\s*\((si G-CSF décidé|pour .*|même contenu .*)\)$/, "").trim()).filter(Boolean);

const sansAcc = (s) => String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\(hgc\)/g, "").replace(/[^a-z0-9]/g, "");
const REELS = process.argv[2] ? JSON.parse(readFileSync(process.argv[2])) : [], parNom = {};
REELS.forEach((p) => { (parNom[sansAcc(p.nom)] = parNom[sansAcc(p.nom)] || []).push(p.id); });
const idDe = (n, nom) => ID_FORCE[n] || ((parNom[sansAcc(nom)] || []).length === 1 ? parNom[sansAcc(nom)][0] : null) || "@" + nom;
// Renommés en P1a : leur ancien nom ne se retrouve plus
Object.assign(ID_FORCE, { 89: "todo|paclitaxel-pembrolizumab", 48: "sein|ibrance zometa" });
const out = {}, ignores = [];
rows.forEach((x) => {
  const n = x[0], e = { n, nom: x[5], ordre: x[7] || 0, seuils: String(x[12]).split("\n").map((l) => l.trim()).filter(Boolean), ordos: [...new Set(nomsOrdo(x[13]))], ops: [] };
  const emend = /risque émétique élevé|AC \(/.test(x[13]);
  if (/ajuster|modifier/.test(x[6]) && !DEJA.has(n)) String(x[11]).split("\n").forEach((l) => {
    l = l.replace(/^•\s*/, "").trim(); if (!l) return;
    let m;
    if ((m = l.match(/^MODIFIER : SOLUMEDROL (\d+) mg → (\d+) mg/))) { if (!/aprépitant/.test(l) || emend) e.ops.push({ t: "solu", de: +m[1], vers: +m[2] }); return; }
    if ((m = l.match(/^MODIFIER : Localisation : « ([^»]+) »(?: \((\w+)\))?/))) { e.ops.push({ t: "loc", loc: m[1], dos: m[2] || "" }); return; }
    if ((m = l.match(/^MODIFIER : Retirer la remarque « ([^»]+) »/))) { e.ops.push({ t: "remS", de: m[1] }); return; }
    if ((m = l.match(/^AJOUTER la ligne : (.+)$/))) { e.ops.push({ t: "add", d: ligne(m[1]) }); return; }
    if ((m = l.match(/^REMPLACER par : (NIVESTIM.+)$/))) {
      // NIVESTIM : jamais un jour de séance (nd, j 99) ; dose choisie d'après le poids à l'affichage (doses.js `texteNiv`)
      const d = ligne(m[1]), pos = "1 injection SC par jour : 30 MU (48 MU si poids > 70 kg) — " + (d.jl || "");
      e.ops.push({ t: "niv", d: Object.assign(d, { u: "txt", pos, dt: pos, j: [99], nd: 1 }) }); return;
    }
    if ((m = l.match(/^SUPPRIMER(?: du protocole)? : [Ll]ignes? (.+?) : /))) {
      const noms = [...m[1].matchAll(/« ([^»]+) »/g)].map((z) => z[1]), js = (m[1].match(/J([\d,]+)/) || [])[1];
      noms.forEach((p) => e.ops.push({ t: "suppr", p, j: js ? js.split(",").map(Number) : null })); return;
    }
    if ((m = l.match(/^REMARQUE à remplacer : « (.+) » → « (.+) »$/))) { if (!/hors référentiel/i.test(m[2])) e.ops.push({ t: "remR", de: m[1], vers: m[2] }); return; }
    if ((m = l.match(/^REMARQUE à ajouter : (.+)$/))) { if (!/hors référentiel/i.test(m[1]) && !/^Ordonnance de sortie/i.test(m[1])) e.ops.push({ t: "remA", txt: m[1] }); return; }
    if ((m = l.match(/^NOM : « (.+) » → « (.+) »/))) { e.ops.push({ t: "nom", de: m[1], vers: m[2] }); return; }
    if ((m = l.match(/^INDICATION à ajouter : (.+)$/))) { e.ops.push({ t: "indA", ind: chemin(m[1]) }); return; }
    if ((m = l.match(/^INDICATION à retirer : (.+)$/))) { e.ops.push({ t: "indR", ind: chemin(m[1]) }); return; }
    if (/^COPIE à créer : Copie « mFOLFIRINOX rectum/.test(l)) { e.ops.push({ t: "prodige23" }); return; }
    if (/^PROTOCOLE LIÉ à créer : KEYNOTE-A18/.test(l)) { e.ops.push({ t: "keynoteA18" }); return; }
    if (/^(À FAIRE|À VÉRIFIER|MODIFIER : BICARBONATE)/.test(l)) return; // fusions faites en P1a, AI 3 jours fait au palier 3, [251] gardé
    ignores.push(n + " : " + l.slice(0, 120));
  });
  if (e.seuils.length || e.ordos.length || e.ops.length) out[idDe(n, x[5])] = e;
});
writeFileSync(new URL("public/js/donnees/audit3p4.js", R), "// Généré par outils/audit3/convertir-p4.mjs depuis le classeur de l'audit n° 3 (ne pas modifier à la main).\n// Clé : identifiant du protocole, ou « @nom » (retrouvé par son nom). n = numéro du classeur.\nexport const P4 = " + JSON.stringify(out) + ";\n");
console.log(Object.keys(out).length + " protocoles (" + Object.keys(out).filter((k) => k[0] === "@").length + " retrouvés par le nom à l'ouverture) ; " + Object.values(out).reduce((t, e) => t + e.ops.length, 0) + " consignes ; non lues : " + ignores.length);
ignores.forEach((l) => console.log("  ? " + l));
