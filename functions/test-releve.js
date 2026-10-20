// Tests du relevé du comptable préparé la nuit (R-D2, A7, 20/10/2026) : node functions/test-releve.js
// 1) functions/site/ = copie exacte du calcul du site ; 2) sur le jeu de test (tests/seed.json, s'il est là) : même relevé que le calcul du
// site, aucun diagnostic, bilan du comptable = référence (352 317 DH) ; 3) cabinets concernés ; découpage ; signature.
const fs = require("fs"), path = require("path"), RL = require("./releve");
let ok = 0, ko = 0;
const cas = (nom, v, info) => { if (v) { ok++; console.log("✅ " + nom); } else { ko++; console.log("❌ " + nom + (info ? " : " + info : "")); } };
(async () => {
  RL.FICHIERS.forEach((f) => cas("functions/site/" + f + " = public/js/" + f + " (sinon : cp public/js/" + f + " functions/site/" + f + ")",
    fs.existsSync(path.join(__dirname, "site", f)) && fs.readFileSync(path.join(__dirname, "site", f), "utf8") === fs.readFileSync(path.join(__dirname, "..", "public", "js", f), "utf8")));
  const SEED = path.join(__dirname, "..", "tests", "seed.json");
  if (fs.existsSync(SEED)) {
    const S = JSON.parse(fs.readFileSync(SEED, "utf8")), E = "espaces/cabinet-bentahila/", T0 = "2026-10-06", J = (k, d) => (S[E + k] ? JSON.parse(S[E + k].data) : d);
    const bib = {}; Object.keys(S).filter((k) => k.startsWith(E + "protocoles/")).forEach((k) => JSON.parse(S[k].data).forEach((p) => { bib[p.id] = p; }));
    const montants = {}; Object.keys(S).filter((k) => k.startsWith(E + "patientsFinances/")).forEach((k) => { montants[k.split("/").pop()] = JSON.parse(S[k].montantsJson || "{}"); });
    const patients = Object.keys(S).filter((k) => k.startsWith(E + "patients/")).map((k) => ({ id: k.split("/").pop(), data: S[k] })).sort((a, b) => (a.id < b.id ? -1 : 1));
    const d = { patients, montants, bib, feries: J("parametres/calendrier", {}).feries || [], tarifs: J("finances/tarifs", null), aujourdhui: T0 };
    const R = RL.lignes(await RL.moteur(), d);
    cas("une ligne par patient (" + R.length + ")", R.length === patients.length && R.every((x) => Array.isArray(x.fin)));
    cas("relevé : nom, n° de dossier, référent, lieu, 1re venue, actes seulement", R.every((x) => Object.keys(x).sort().join() === "c1,cor,fin,hop,id,nm,num"));
    const diags = new Set(patients.map((p) => { try { return JSON.parse(p.data.resume || "{}").diag; } catch (e) { return ""; } }).filter((x) => x && x.length > 8)), txt = JSON.stringify(R);
    cas("aucun diagnostic dans le relevé", ![...diags].some((x) => txt.indexOf(x) >= 0));
    // Même calcul que le site (moteur du site, pas la copie)
    const site = (f) => import(path.join(__dirname, "..", "public", "js", f));
    const [{ evtsFin }, { fusionner }] = await Promise.all([site("moteur/finances.js"), site("donnees/conversion.js")]);
    const ctx = { aujourdhui: T0, bib, feries: d.feries, table: d.tarifs };
    cas("actes identiques au calcul du site", R.every((x) => JSON.stringify(x.fin) === JSON.stringify(evtsFin(fusionner(x.id, patients.find((p) => p.id === x.id).data, null), montants[x.id] || {}, ctx))));
    const B = await site("moteur/bilan.js"), pai = J("finances/paiements", {}), ver = J("finances/versements", []);
    const ref = fs.readFileSync(path.join(__dirname, "..", "tests", "bilan_ref.txt"), "utf8").trim();
    const t = B.texteTotaux(B.calculerBilan(R, ver, pai, { per: "annee", hop: "tous" }, T0).tot);
    cas("bilan du comptable depuis le relevé de la nuit = référence (" + t.slice(0, 10) + ")", t === ref, t);
    cas("signature stable (rien de réécrit si rien n'a changé)", RL.signature(JSON.stringify(R)) === RL.signature(JSON.stringify(RL.lignes(await RL.moteur(), d))));
    const P2 = Object.assign({}, d, { patients: patients.concat([{ id: "Zmal", data: { identite: { nom: "TEST" }, etablissementId: "HGC", lignesJson: "{" } }]) });
    const R2 = RL.lignes(await RL.moteur(), P2);
    cas("dossier mal formé : gardé, sans actes (le relevé se fait quand même)", R2.length === R.length + 1 && R2[R2.length - 1].nm === "TEST");
  } else console.log("(tests/seed.json absent : jeu de test sauté)");
  // Cabinets concernés
  const comp = [{ role: "medecin" }, { role: "comptable", actif: true }], T = { etablissements: {} };
  cas("cabinet avec un comptable et des tarifs : relevé", RL.concerne({ titulaire: "x" }, comp, T));
  cas("sans comptable : rien", !RL.concerne({}, [{ role: "medecin" }], T));
  cas("comptable désactivé : rien", !RL.concerne({}, [{ role: "comptable", actif: false }], T));
  cas("sans tarifs : rien", !RL.concerne({}, comp, null));
  cas("fonction « relevé du comptable » retirée du réglage : rien", !RL.concerne({ abonnement: { reglage: { fonctions: { "bilan.comptable": false } } } }, comp, T));
  cas("bibliothèque, démonstration, cabinet suspendu : rien", !RL.concerne({ bibliotheque: true }, comp, T) && !RL.concerne({ demo: true }, comp, T) && !RL.concerne({ actif: false }, comp, T));
  // Découpage en documents de 600 Ko au plus
  const gros = Array.from({ length: 30 }, (_, i) => ({ id: "p" + i, fin: [["x".repeat(50000)]] })), P = RL.parties(gros);
  cas("relevé découpé en documents de 600 Ko au plus (" + P.length + ")", P.length === 3 && P.every((p) => JSON.stringify(p).length <= 620000) && P.flat().length === 30);
  cas("relevé vide : un document vide", JSON.stringify(RL.parties([])) === "[[]]");
  console.log("\n" + ok + " réussis, " + ko + " échoués");
  if (ko) process.exit(1);
})();
