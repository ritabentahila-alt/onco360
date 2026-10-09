// node functions/test-demo.js — cabinet de démonstration (étape 9 S3) : les faux dossiers sont lus par le moteur d'Onco360
const Dm = require("./demo");
const ok = (c, m) => { console.log((c ? "✅ " : "❌ ") + m); if (!c) process.exitCode = 1; };
(async () => {
  const fs = require("fs"), seed = __dirname + "/../tests/seed.json";
  if (!fs.existsSync(seed)) { console.log("(tests/seed.json absent : protocoles de test minimaux)"); }
  const S = fs.existsSync(seed) ? JSON.parse(fs.readFileSync(seed, "utf8")) : {};
  const protos = [].concat(...Object.keys(S).filter((k) => /\/protocoles\//.test(k)).map((k) => JSON.parse(S[k].data)));
  const actes = [{ nom: "Sein", prix: 15000 }, { nom: "Prostate conformationnelle", prix: 20000 }, { nom: "ORL", prix: 18000 }];
  const jour = "2026-10-09", P = Dm.patientsDemo(protos, actes, jour);
  ok(P.length === 8 && P.every((p) => /^PATIENT TEST \d$/.test(p.data.identite.nom)), "8 patients fictifs « PATIENT TEST n »");
  ok(new Set(P.map((p) => p.id)).size === 8 && P.every((p) => p.data.etablissementId === "DEMO" && p.data.version === 1), "identifiants uniques, clinique DEMO, version 1");
  ok(P.every((p) => /fictif/.test(p.data.clinique.notes) && /^DEMO/.test(p.data.identite.cin)), "notes et CIN visiblement fictifs");
  const { fusionner } = await import("../public/js/donnees/conversion.js"), { resume } = await import("../public/js/moteur/resume.js");
  const bib = {}; protos.forEach((p) => { bib[p.id] = p; });
  let err = null; const R = P.map((p) => { try { return resume(JSON.parse(JSON.stringify(fusionner(p.id, p.data, null))), { aujourdhui: jour, bib, feries: [] }); } catch (e) { err = err || e; return null; } });
  ok(!err && R.every(Boolean), "les 8 dossiers sont lus par le moteur d'Onco360" + (err ? " : " + err.message : ""));
  if (protos.length) {
    ok(R.filter((r) => r.t && r.t.st === "cours").length >= 4, "chimiothérapies en cours : " + R.filter((r) => r.t && r.t.st === "cours").length);
    ok(R.some((r) => (r.rtS || []).some((s) => s.st === "cours")), "une radiothérapie en cours");
    ok(R.some((r) => (r.rdvs || []).some((v) => v.d === jour)) || P.some((p) => JSON.parse(p.data.rdvsJson).some((v) => v.d === jour)), "un rendez-vous aujourd'hui");
  }
  const T = Dm.tarifsDemo({ actesRT: actes, vmat: 10000 });
  ok(T.repli === "DEMO" && T.etablissements.DEMO.activites.length === 7 && T.actesRT.length === 3, "grille tarifaire de démonstration (actes RT gardés)");
  const C = Dm.consultationsDemo(P, jour, "U");
  ok(C.length === 4 && C.every((c) => P.some((p) => p.id === c.patientId) && /exemple/.test(c.note)), "consultations de démonstration");
})();
