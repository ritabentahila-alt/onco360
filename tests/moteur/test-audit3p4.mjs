// Audit n° 3, P4 (18/10/2026) : consignes des ordres 2 et 3 appliquées à la vraie bibliothèque du 18/10/2026 (protocoles seulement,
// aucune donnée patient) : node tests/moteur/test-audit3p4.mjs
import { readFileSync } from "node:fs";
import { correctionsP4 } from "../../public/js/moteur/audit3p4.js";
import { correctionsAudit3 } from "../../public/js/moteur/audit3.js";
import { P4 } from "../../public/js/donnees/audit3p4.js";
import { seancesDe, premed } from "../../public/js/moteur/doses.js";
let ok = 0, ko = 0;
const cas = (nom, v, d) => { if (v) { ok++; console.log("  ✔ " + nom); } else { ko++; console.log("  ✘ " + nom + (d === undefined ? "" : "  " + JSON.stringify(d).slice(0, 400))); } };
const L = JSON.parse(readFileSync(new URL("./donnees/bibliotheque-2026-10-18.json", import.meta.url))), BIB = {};
L.forEach((p) => { BIB[p.id] = p; });
// comme à l'ouverture : d'abord l'audit n° 3 (ordre 1, palier 3 : déjà fait ici sauf « HGC » des remarques et AI 3 jours), puis P4
const r3 = correctionsAudit3(BIB); r3.modifies.forEach((m) => { BIB[m.id] = m.p; }); r3.crees.forEach((p) => { BIB[p.id] = p; }); r3.supprimes.forEach((s) => delete BIB[s.id]);
const avant = JSON.stringify(BIB), r = correctionsP4(BIB, P4);
const M = (re) => (r.modifies.find((m) => re.test(m.p.nom)) || {}).p, S = (t) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();
const lig = (p, re) => p.dr.find((d) => re.test(S(d.p)));

console.log("0. Ensemble");
cas("la bibliothèque reçue n'est pas modifiée", JSON.stringify(BIB) === avant);
cas("tous les protocoles du classeur retrouvés (aucun introuvable)", !r.ignores.some((x) => x.raisons.includes("protocole introuvable")), r.ignores.filter((x) => x.raisons.includes("protocole introuvable")));
cas("consignes laissées de côté : seulement ce qui est déjà fait (indications reprises en P1a, Solumedrol J2 / J16 absent du TPF modifié)", r.ignores.every((x) => x.raisons.every((z) => /déjà/.test(z))), r.ignores);
cas("au moins 240 protocoles complétés, 2 créés (PRODIGE 23, KEYNOTE-A18 phase 2)", r.modifies.length >= 240 && r.crees.length === 2, [r.modifies.length, r.crees.map((p) => p.nom)]);
const anti = (p) => JSON.stringify(p.dr.filter((d) => !premed(d)).map((d) => [d.p, d.u, d.d, d.c1, d.cn, String(d.j)]));
const chg = r.modifies.filter((m) => anti(BIB[m.id]) !== anti(m.p)).map((m) => m.p.nom);
cas("aucune dose ni aucun jour d'anticancéreux changé", !chg.length, chg);
const sea = r.modifies.filter((m) => JSON.stringify(seancesDe(BIB[m.id])) !== JSON.stringify(seancesDe(m.p))).map((m) => m.p.nom);
cas("aucun jour de séance changé (NIVESTIM et hydratation jamais des séances en plus)", !sea.length, sea);
cas("identifiants de lignes uniques", r.modifies.every((m) => new Set(m.p.dr.map((d) => d.id)).size === m.p.dr.length));

console.log("1. Antiémétiques et prémédications");
const inter = M(/InterAACT/);
cas("InterAACT : POLARAMINE J1-J8-J15 ajoutée ; Solumedrol 80 mg gardé (carboplatine : pas d'EMEND)", lig(inter, /POLARAMINE/) && String(lig(inter, /POLARAMINE/).j) === "1,8,15" && lig(inter, /SOLUMEDROL/).d === 80);
const n60 = r.modifies.filter((m) => /carboplatine, Enhertu/.test((m.p.ordos || []).join()) && m.p.dr.some((d) => /SOLUMEDROL/.test(S(d.p)) && d.d === 60 && !/SOLUMEDROL/.test(S((BIB[m.id].dr.find((x) => x.id === d.id) || { p: "" }).p))));
cas("aucun Solumedrol baissé à 60 mg sur un protocole sans EMEND", !r.modifies.some((m) => /carboplatine, Enhertu/.test((m.p.ordos || []).join()) && m.p.dr.some((d, i) => /SOLUMEDROL/.test(S(d.p)) && d.d < ((BIB[m.id].dr.find((x) => x.id === d.id) || {}).d || 0))), n60.map((m) => m.p.nom));
const solu = r.modifies.filter((m) => m.faites.some((f) => /^Solumedrol/.test(f)));
cas("Solumedrol baissé seulement avec une ordonnance EMEND (ou trabectédine 80 → 100 mg, RCP)", solu.every((m) => /risque émétique élevé|AC \(/.test((m.p.ordos || []).join()) || /trab/i.test(m.p.nom)), solu.map((m) => m.p.nom + " " + m.p.ordos));
const cis = r.modifies.filter((m) => m.faites.some((f) => /ajouté : HYDRATATION AVANT/.test(f)));
cas("hydratation du cisplatine ajoutée (avant / après la ligne de cisplatine)", cis.length >= 40 && cis.every((m) => { const i = m.p.dr.findIndex((d) => /^CISPLATINE/.test(S(d.p))); return /AVANT/.test(S(m.p.dr[i - 1].p)) && /APRES/.test(S(m.p.dr[i + 1].p)); }), cis.length);

console.log("2. NIVESTIM et G-CSF");
const niv = r.modifies.filter((m) => m.faites.some((f) => /^NIVESTIM/.test(f)));
cas("NIVESTIM structuré (30 / 48 MU, de quel J à quel J), jamais un jour de séance", niv.length >= 45 && niv.every((m) => { const d = lig(m.p, /NIVESTIM/); return /48 MU si poids > 70 kg/.test(d.pos) && d.nd === 1 && String(d.j) === "99" && /→/.test(d.jl); }), niv.length);
const folfox = r.modifies.filter((m) => /FOLFOX|FOLFIRI/.test(m.p.nom) && !/FOLFIRINOX|FOLFOXIRI/.test(m.p.nom) && m.faites.some((f) => /retiré : NIVESTIM/.test(f)));
cas("NIVESTIM systématique retiré des FOLFOX / FOLFIRI (11 du classeur + PRODIGE 5, demandé le 18/10)", folfox.length === 12, folfox.map((m) => m.p.nom));

console.log("3. Remarques, noms, indications");
const ev = r.modifies.filter((m) => (m.p.no || []).some((x) => /eviq/i.test(x)));
cas("« eviQ » retiré des remarques (il n'en reste que là où le classeur n'en parle pas)", ev.length <= 5, ev.map((m) => m.p.nom + " : " + m.p.no.find((x) => /eviq/i.test(x))));
cas("jamais « Hors référentiel » ajouté (décision du 13/10)", !r.modifies.some((m) => (m.p.no || []).some((x) => /hors r[ée]f[ée]rentiel/i.test(x)) && !(BIB[m.id].no || []).some((x) => /hors r[ée]f[ée]rentiel/i.test(x))));
cas("jamais « HGC »", !r.modifies.concat(r.crees.map((p) => ({ p }))).some((m) => /\bHGC\b/.test(m.p.nom + JSON.stringify(m.p.no || []))));
cas("CAP renommé « … – Loehrer 1994 (CAP) » ; voies biliaires → nom général", !!M(/Loehrer 1994/) && !!r.modifies.find((m) => m.p.nom === "Carboplatine AUC 5 + Gemcitabine 1000 J1-J8 / 21 j"));
cas("pembrolizumab-carboplatine-paclitaxel rangé en endomètre et col", (M(/NRG-GY018/) || { ind: [] }).ind.some((x) => x[1] === "Endomètre") && M(/NRG-GY018/).ind.some((x) => /Col/.test(x[1])));
cas("darolutamide : indication « résistant à la castration » retirée", !Object.values(r.modifies).some((m) => /darolutamide/i.test(m.p.nom) && (m.p.ind || []).some((x) => x[2] === "Métastatique résistant à la castration")));

console.log("4. Seuils du jour et ordonnances liées");
const avS = r.modifies.filter((m) => m.p.seuils && m.p.seuils.length).length, avO = r.modifies.filter((m) => m.p.ordos && m.p.ordos.length).length;
cas("seuils du jour notés dans 200 protocoles et plus, ordonnances liées dans 150 et plus", avS >= 200 && avO >= 150, [avS, avO]);
cas("noms des ordonnances liées = ceux de la liste (jamais « Sortie »)", !r.modifies.some((m) => (m.p.ordos || []).some((o) => /Sortie|\(si |\(pour /.test(o))), r.modifies.flatMap((m) => m.p.ordos || []).filter((o) => /Sortie|\(/.test(o)).slice(0, 3));

console.log("5. Créés");
const p23 = r.crees.find((p) => /PRODIGE 23/.test(p.nom)), mf = r.modifies.find((m) => /^mFOLFIRINOX J1-J15/.test(m.p.nom));
cas("PRODIGE 23 : irinotécan 180 mg/m², rangé en rectum ; l'original n'est plus rangé en rectum", lig(p23, /IRINOTECAN/).d === 180 && p23.ind.every((x) => /Rectum/i.test(x[1])) && mf && !mf.p.ind.some((x) => /rectum/i.test(x.join(" "))), [p23.ind, mf && mf.p.ind]);
const a18 = r.crees.find((p) => /KEYNOTE-A18/.test(p.nom));
cas("KEYNOTE-A18 phase 2 : pembrolizumab 400 mg toutes les 6 semaines", a18.c === 42 && a18.dr[0].d === 400);

console.log("5 bis. P5 : sources, DCI, localisation");
const tous = Object.values(BIB).map((p) => (r.modifies.find((m) => m.id === p.id) || { p }).p).concat(r.crees);
cas("chaque protocole a sa source (essai de référence)", tous.filter((p) => !p.src).length === 0, tous.filter((p) => !p.src).map((p) => p.nom));
cas("plus aucun « SOLUMEDROL » sans DCI", !tous.some((p) => p.dr.some((d) => /^SOLUMEDROL\s*$/.test(d.p))));
cas("localisation de la fiche = 1re indication", tous.every((p) => !(p.ind || []).length || (p.dos === p.ind[0][0] && p.loc === (p.ind[0][1] || p.ind[0][0]))));
cas("PRODIGE 5 : NIVESTIM retiré, remarque « prophylaxie secondaire »", (() => { const p = tous.find((z) => /PRODIGE 5/.test(z.nom)); return p && !p.dr.some((d) => /NIVESTIM/.test(d.p)) && p.no.some((x) => /prophylaxie secondaire/.test(x)); })());
cas("variantes locales : source « Variante locale… »", tous.filter((p) => /^Variante locale/.test(p.src || "")).length >= 5);

console.log("6. Une seule fois");
const bib2 = Object.assign({}, BIB); r.modifies.forEach((m) => { bib2[m.id] = m.p; }); r.crees.forEach((p) => { bib2[p.id] = p; });
const r2 = correctionsP4(bib2, P4);
cas("relancé sur la bibliothèque complétée : rien modifié, rien créé", !r2.modifies.length && !r2.crees.length, r2.modifies.slice(0, 3).map((m) => [m.p.nom, m.faites]));

console.log("\n" + ok + " / " + (ok + ko) + " vérifications justes");
if (ko) process.exit(1);
