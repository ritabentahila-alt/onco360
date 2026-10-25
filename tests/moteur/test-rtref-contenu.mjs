// RT (24/10/2026) : contrôle du contenu du référentiel de radiothérapie (public/donnees-rt/*.json).
// Lancer depuis la racine du dépôt : node tests/moteur/test-rtref-contenu.mjs [dossier]
// Vérifie : lecture des fichiers, identifiants uniques, renvois (essais, OAR, jeux de contraintes, volumes,
// simulations, situations), cohérence index ↔ fichiers de localisation, valeurs permises, arithmétique des
// prescriptions, libellés `ind`, correspondances DIAG, et l'absence des mentions interdites.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { DIAG } from "../../public/js/donnees/listes.js";

const RACINE = fileURLToPath(new URL("../../", import.meta.url));
const DOS = process.argv[2] || join(RACINE, "public/donnees-rt");

let ok = 0, ko = 0;
const cas = (nom, v, d) => { if (v) { ok++; console.log("  ✔ " + nom); } else { ko++; console.log("  ✘ " + nom + (d ? " — " + d : "")); } };
const liste = (a, n = 5) => a.slice(0, n).join(", ") + (a.length > n ? " … (" + a.length + ")" : "");

// 1. Lecture
const fichiers = readdirSync(DOS).filter(f => f.endsWith(".json")).sort();
const J = {}, illisibles = [];
for (const f of fichiers) { try { J[f] = JSON.parse(readFileSync(join(DOS, f), "utf8")); } catch (e) { illisibles.push(f + " (" + e.message + ")"); } }
cas("tous les fichiers JSON se lisent (" + fichiers.length + ")", illisibles.length === 0, liste(illisibles));
const COMMUNS = ["index.json", "oar.json", "contraintes.json", "essais.json", "diag-localisation.json", "protocoles-chimio.json"];
const absents = COMMUNS.filter(f => !J[f]);
cas("fichiers communs présents", absents.length === 0, liste(absents));
if (absents.length || illisibles.length) { console.log("\n" + ok + " réussi(s), " + ko + " échec(s)"); process.exit(1); }

const IDX = J["index.json"], OAR = J["oar.json"].oar, JEUX = J["contraintes.json"].jeux, ESS = J["essais.json"].essais;
const VERSION = IDX.version;
cas("version au format AAAA-MM-JJ", /^\d{4}-\d{2}-\d{2}$/.test(VERSION), VERSION);
const sansVersion = fichiers.filter(f => J[f].version !== VERSION);
cas("même version dans tous les fichiers", sansVersion.length === 0, liste(sansVersion));

// 2. Bibliothèques
const doublons = a => a.filter((x, i) => a.indexOf(x) !== i);
const oarIds = new Set(OAR.map(o => o.id)), jeuIds = new Set(JEUX.map(j => j.id)), essIds = new Set(ESS.map(e => e.id));
cas("OAR : identifiants uniques (" + OAR.length + ")", doublons(OAR.map(o => o.id)).length === 0, liste(doublons(OAR.map(o => o.id))));
cas("OAR : nom présent", OAR.every(o => o.id && o.nom));
cas("jeux de contraintes : identifiants uniques (" + JEUX.length + ")", doublons(JEUX.map(j => j.id)).length === 0, liste(doublons(JEUX.map(j => j.id))));
cas("jeux de contraintes : vérifiés (référence) ou du service", JEUX.every(j => ["verifie", "service"].includes(j.verification)), liste(JEUX.filter(j => !["verifie", "service"].includes(j.verification)).map(j => j.id)));
cas("jeux de contraintes : titre, source et au moins une ligne", JEUX.every(j => j.titre && j.source && Array.isArray(j.lignes) && j.lignes.length));
const PSEUDO = new Set(["cible-ctv", "cible-ptv"]);
const lignesKo = JEUX.flatMap(j => j.lignes.filter(l => !oarIds.has(l.oar_id) && !PSEUDO.has(l.oar_id)).map(l => j.id + ":" + l.oar_id));
cas("jeux de contraintes : chaque ligne renvoie à un OAR connu (ou cible-ctv / cible-ptv)", lignesKo.length === 0, liste(lignesKo));
cas("jeux de contraintes : chaque ligne a une valeur (Idéal, Limitant ou note « à rapporter »)", JEUX.every(j => j.lignes.every(l => l.ideal || l.limitant || l.note)));
cas("essais : identifiants uniques (" + ESS.length + ")", doublons(ESS.map(e => e.id)).length === 0, liste(doublons(ESS.map(e => e.id))));
cas("essais : acronyme présent, année entière, PMID en chiffres", ESS.every(e => e.acronyme && (e.annee === undefined || Number.isInteger(e.annee)) && (e.pmid === undefined || /^\d+$/.test(e.pmid))),
  liste(ESS.filter(e => !e.acronyme || (e.annee !== undefined && !Number.isInteger(e.annee)) || (e.pmid !== undefined && !/^\d+$/.test(e.pmid))).map(e => e.id)));

// 3. Index
const regIds = new Set(IDX.regions.map(r => r.id));
cas("index : régions uniques (" + IDX.regions.length + ")", regIds.size === IDX.regions.length);
cas("index : localisations uniques (" + IDX.localisations.length + ")", doublons(IDX.localisations.map(l => l.id)).length === 0);
cas("index : chaque localisation a sa région", IDX.localisations.every(l => regIds.has(l.region_id)), liste(IDX.localisations.filter(l => !regIds.has(l.region_id)).map(l => l.id)));
const sansFichier = IDX.localisations.filter(l => !J[l.id + ".json"]).map(l => l.id);
cas("index : chaque localisation a son fichier", sansFichier.length === 0, liste(sansFichier));
const enTrop = fichiers.filter(f => !COMMUNS.includes(f) && !IDX.localisations.some(l => l.id + ".json" === f));
cas("aucun fichier de localisation hors de l'index", enTrop.length === 0, liste(enTrop));
cas("pédiatrie et lymphome exclus", !IDX.localisations.some(l => /lymphom|pediatr|pédiatr/i.test(l.id + " " + l.nom)));
cas("index : identifiants de situation uniques (" + IDX.situations.length + ")", doublons(IDX.situations.map(s => s.id)).length === 0, liste(doublons(IDX.situations.map(s => s.id))));
cas("index : identifiants de schéma uniques (" + IDX.schemas.length + ")", doublons(IDX.schemas.map(s => s.id)).length === 0, liste(doublons(IDX.schemas.map(s => s.id))));

// 4. Fichiers de localisation
const TYPES = { rte_normo: "Normofractionné", rte_hypo: "Hypofractionné", sbrt: "Stéréotaxie", curie_ldr: "Curiethérapie", curie_hdr: "Curiethérapie", curie_pdr: "Curiethérapie", rte_plus_curie: "RTE + curiethérapie" };
const PREUVES = ["essai_phase3", "recommandation", "pratique_institutionnelle", "option", "pratique_du_cabinet"];
const MODES = ["seul", "SIB", "sequentiel"];
const CONTEXTES = ["en_place", "post_op", "rattrapage", "oligometastatique", "metastatique", "palliatif", "reirradiation"];
const TYPES_VOL = ["GTV", "CTV", "ITV", "PTV", "PRV", "structure"];
const PORTEES = ["localisation", "situation", "schema", "volumes", "contraintes", "simulation"];
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const err = { idx: [], type: [], preuve: [], mode: [], ctx: [], vol: [], portee: [], essai: [], oar: [], jeu: [], volRef: [], simRef: [], sitRef: [], arith: [], ind: [], date: [], partage: [], cle: [], vide: [] };
const vus = { vol: {}, sim: {} };
const regNom = Object.fromEntries(IDX.regions.map(r => [r.id, r.nom]));
let nbSch = 0;
for (const li of IDX.localisations) {
  const L = J[li.id + ".json"]; if (!L) continue;
  const f = li.id;
  if (L.id !== li.id || L.region_id !== li.region_id || L.nom !== li.nom) err.idx.push(f + " (en-tête)");
  if (!DATE.test(L.date_maj || "")) err.date.push(f + " date_maj");
  for (const k of ["situations", "schemas", "simulations", "volumes", "curie_indications", "systemique", "hormonotherapie", "points_attention"]) if (!Array.isArray(L[k])) err.cle.push(f + "." + k);
  if (typeof L.textes !== "object" || Array.isArray(L.textes)) err.cle.push(f + ".textes");
  if (L.schemas.length === 0) err.vide.push(f);
  if (li.nb_schemas !== L.schemas.length) err.idx.push(f + " nb_schemas " + li.nb_schemas + "≠" + L.schemas.length);
  const curie = L.curie_indications.length > 0 || L.schemas.some(s => s.type.startsWith("curie") || s.type === "rte_plus_curie");
  if (li.curietherapie !== curie) err.idx.push(f + " curietherapie");
  const sit = Object.fromEntries(L.situations.map(s => [s.id, s]));
  const vol = Object.fromEntries(L.volumes.map(v => [v.id, v]));
  const sim = Object.fromEntries(L.simulations.map(s => [s.id, s]));
  for (const s of L.situations) {
    if (!CONTEXTES.includes(s.contexte)) err.ctx.push(s.id + ":" + s.contexte);
    const is = IDX.situations.find(x => x.id === s.id);
    if (!is || is.localisation_id !== f || is.titre !== s.titre) err.idx.push("situation " + s.id);
  }
  for (const v of L.volumes) {
    for (const c of v.cibles || []) if (!TYPES_VOL.includes(c.type)) err.vol.push(v.id + ":" + c.nom + ":" + c.type);
    for (const o of v.oar_ids || []) if (!oarIds.has(o)) err.oar.push(v.id + ":" + o);
    for (const a of v.atlas || []) if (!a.nom || (a.url && !/^https?:\/\//.test(a.url))) err.cle.push(v.id + " atlas");
    const t = JSON.stringify(v); if (vus.vol[v.id] && vus.vol[v.id] !== t) err.partage.push(v.id); vus.vol[v.id] = t;
  }
  for (const s of L.simulations) { const t = JSON.stringify(s); if (vus.sim[s.id] && vus.sim[s.id] !== t) err.partage.push(s.id); vus.sim[s.id] = t; }
  for (const s of L.schemas) {
    nbSch++;
    if ("statut" in s) err.cle.push(s.id + " statut");
    if (!TYPES[s.type]) err.type.push(s.id + ":" + s.type);
    if (!PREUVES.includes(s.preuve)) err.preuve.push(s.id + ":" + s.preuve);
    if (!sit[s.situation_id]) err.sitRef.push(s.id + ":" + s.situation_id);
    for (const e of s.essai_ids || []) if (!essIds.has(e)) err.essai.push(s.id + ":" + e);
    if (!Array.isArray(s.contraintes_ids)) err.cle.push(s.id + " contraintes_ids");
    for (const c of s.contraintes_ids || []) if (!jeuIds.has(c)) err.jeu.push(s.id + ":" + c);
    if (!vol[s.volumes_id]) err.volRef.push(s.id + ":" + s.volumes_id);
    if (s.simulation_id !== undefined && !sim[s.simulation_id]) err.simRef.push(s.id + ":" + s.simulation_id);
    if (!DATE.test(s.date_verif || "")) err.date.push(s.id + " date_verif");
    if (!Array.isArray(s.prescriptions) || !s.prescriptions.length) err.cle.push(s.id + " prescriptions");
    for (const p of s.prescriptions || []) {
      if (p.mode !== undefined && !MODES.includes(p.mode)) err.mode.push(s.id + ":" + p.mode);
      // dose/fx arrondie au centième (95 / 35 = 2,71)
      if (typeof p.dose_Gy === "number" && typeof p.fractions === "number" && typeof p.dose_fx_Gy === "number" && Math.abs(p.fractions * p.dose_fx_Gy - p.dose_Gy) > p.fractions * 0.005 + 0.01)
        err.arith.push(s.id + " " + p.volume + " " + p.dose_Gy + "≠" + p.fractions + "×" + p.dose_fx_Gy);
    }
    const r = regNom[L.region_id], st = sit[s.situation_id];
    if (!Array.isArray(s.ind) || s.ind.length !== 4 || s.ind[0] !== r || s.ind[1] !== L.nom || !st || s.ind[2] !== st.titre || s.ind[3] !== TYPES[s.type]) err.ind.push(s.id);
    const is = IDX.schemas.find(x => x.id === s.id);
    if (!is) { err.idx.push("schéma " + s.id + " absent de l'index"); continue; }
    const doses = (s.prescriptions || []).map(p => [p.volume, p.dose_Gy, p.fractions, p.dose_fx_Gy].join("|")).join(";");
    const dosesIdx = (is.doses || []).map(p => [p.volume, p.dose_Gy, p.fractions, p.dose_fx_Gy].join("|")).join(";");
    if (is.localisation_id !== f || is.situation_id !== s.situation_id || is.titre !== s.titre || is.type !== s.type || is.preuve !== s.preuve || doses !== dosesIdx || JSON.stringify(is.ind) !== JSON.stringify(s.ind)) err.idx.push("schéma " + s.id);
    const acr = (s.essai_ids || []).map(e => (ESS.find(x => x.id === e) || {}).acronyme);
    if (JSON.stringify(acr) !== JSON.stringify(is.essais || [])) err.idx.push("schéma " + s.id + " essais");
  }
  for (const x of L.systemique) { for (const e of x.essai_ids || []) if (!essIds.has(e)) err.essai.push(f + " systémique:" + e); if (x.situation_id && !sit[x.situation_id]) err.sitRef.push(f + " systémique:" + x.situation_id); }
  for (const x of L.hormonotherapie) for (const e of x.essai_ids || []) if (!essIds.has(e)) err.essai.push(f + " hormonothérapie:" + e);
  for (const p of L.points_attention) if (!PORTEES.includes(p.portee) || !p.point) err.portee.push(f + ":" + p.portee);
}
cas("index ↔ fichiers de localisation cohérents", err.idx.length === 0, liste(err.idx));
cas("aucune localisation sans schéma", err.vide.length === 0, liste(err.vide));
cas("nombre de schémas : index = fichiers (" + nbSch + ")", nbSch === IDX.schemas.length, IDX.schemas.length + " dans l'index");
cas("champs attendus présents (listes, textes, prescriptions, pas de statut)", err.cle.length === 0, liste(err.cle));
cas("type de schéma permis", err.type.length === 0, liste(err.type));
cas("niveau de preuve permis", err.preuve.length === 0, liste(err.preuve));
cas("mode de prescription permis (seul, SIB, sequentiel)", err.mode.length === 0, liste(err.mode));
cas("contexte de situation permis", err.ctx.length === 0, liste(err.ctx));
cas("type de volume permis", err.vol.length === 0, liste(err.vol));
cas("portée des points d'attention permise", err.portee.length === 0, liste(err.portee));
cas("chaque essai cité existe dans essais.json", err.essai.length === 0, liste(err.essai));
cas("chaque OAR des volumes existe dans oar.json", err.oar.length === 0, liste(err.oar));
cas("chaque jeu de contraintes cité existe", err.jeu.length === 0, liste(err.jeu));
cas("chaque volumes_id existe dans le fichier", err.volRef.length === 0, liste(err.volRef));
cas("chaque simulation_id existe dans le fichier", err.simRef.length === 0, liste(err.simRef));
cas("chaque situation_id existe dans le fichier", err.sitRef.length === 0, liste(err.sitRef));
cas("volumes et simulations partagés : copies identiques d'un fichier à l'autre", err.partage.length === 0, liste(err.partage));
cas("prescriptions : dose totale = fractions × dose par fraction", err.arith.length === 0, liste(err.arith));
cas("ind = [région, localisation, situation, fractionnement]", err.ind.length === 0, liste(err.ind));
cas("dates au format AAAA-MM-JJ (date_maj, date_verif)", err.date.length === 0, liste(err.date));

// 5. Correspondances DIAG
const corr = J["diag-localisation.json"].correspondances || {};
const locIds = new Set(IDX.localisations.map(l => l.id));
const horsDiag = Object.keys(corr).filter(k => !DIAG.includes(k));
const horsLoc = Object.entries(corr).filter(([, v]) => !locIds.has(v)).map(([k, v]) => k + "→" + v);
cas("diag-localisation : chaque libellé existe dans DIAG (" + Object.keys(corr).length + ")", horsDiag.length === 0, liste(horsDiag));
cas("diag-localisation : chaque localisation existe", horsLoc.length === 0, liste(horsLoc));
cas("diag-localisation : pas de lymphome", !Object.keys(corr).some(k => /lymphom/i.test(k)));

// 5 bis. Protocoles de chimiothérapie correspondants : chaque nom est un traitement du référentiel, chaque identifiant existe dans la bibliothèque de départ (jeu fictif)
const PC = (J["protocoles-chimio.json"] || {}).correspondances || {};
const nomsRef = new Set(); for (const f of fichiers) for (const ch of ["systemique", "hormonotherapie"]) for (const x of (J[f] || {})[ch] || []) if (x && x.protocole) nomsRef.add(x.protocole);
const SEED = JSON.parse(readFileSync(new URL("../seed-fictif.json", import.meta.url), "utf8")), BIBIDS = new Set();
for (const [k, v] of Object.entries(SEED)) if (k.startsWith("espaces/cabinet-bentahila/protocoles/")) JSON.parse(v.data).forEach((p) => BIBIDS.add(p.id));
const pcNoms = Object.keys(PC).filter((k) => !nomsRef.has(k)), pcIds = Object.values(PC).flat().filter((i) => !BIBIDS.has(i));
cas("protocoles-chimio : chaque nom est un traitement du référentiel (" + Object.keys(PC).length + ")", Object.keys(PC).length > 20 && pcNoms.length === 0, liste(pcNoms));
cas("protocoles-chimio : chaque protocole existe dans la bibliothèque", pcIds.length === 0, liste(pcIds));

// 6. Mentions interdites
const INTERDIT = [/source non vérifiée/i, /hors référentiel/i, /non lié à ce schéma/i, /\bécart\s+E\d{2}/i, /\(écart/i, /\bE\d{2}\b/, /\bprotocole_ref\b/];
const trouves = [];
for (const f of fichiers) { const t = readFileSync(join(DOS, f), "utf8"); for (const r of INTERDIT) if (r.test(t)) trouves.push(f + " " + r); }
cas("aucune mention interdite (source non vérifiée, hors référentiel, renvoi à un écart)", trouves.length === 0, liste(trouves));
cas("rapport d'import hors du site (docs/radiotherapie/)", !existsSync(join(DOS, "rapport-import.txt")));

console.log("\n" + ok + " réussi(s), " + ko + " échec(s)"); process.exit(ko ? 1 : 0);
