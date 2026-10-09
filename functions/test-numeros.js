// node functions/test-numeros.js — numéro de dossier (étape 8)
const N = require("./numeros");
const ok = (c, m) => { console.log((c ? "✅ " : "❌ ") + m); if (!c) process.exitCode = 1; };
ok(N.numero("202610", 1) === "202610001" && N.numero("202610", 1234) === "2026101234", "format AAAAMM + 3 chiffres (4 au-delà de 999)");
ok(N.moisCasa(Date.UTC(2026, 9, 31, 23, 30)) === "202610" || N.moisCasa(Date.UTC(2026, 9, 31, 23, 30)) === "202611", "mois à l'heure du Maroc");
ok(N.moisCasa(Date.UTC(2026, 9, 15, 12)) === "202610", "15 octobre 2026 = 202610");
const v1 = N.dateCreation("P1790151173832", {}, Date.UTC(2026, 9, 6));
ok(new Date(v1).toISOString().slice(0, 7) === "2026-09", "dossier de l'ancienne application : date tirée de son identifiant (septembre), pas du 06/10");
const neuf = "P" + Date.UTC(2026, 9, 9, 10).toString(36) + "123";
ok(N.dateCreation(neuf, {}, 0) === Date.UTC(2026, 9, 9, 10), "dossier créé dans Onco360 : date tirée de l'identifiant (base 36)");
ok(new Date(N.dateCreation("XYZ", { cree: "2026-08-02" }, 0)).toISOString().slice(0, 10) === "2026-08-02", "sinon identite.cree");
ok(N.dateCreation("XYZ", {}, 42) === 42, "sinon date du document");
const r = N.attribuer([{ id: "b", ms: Date.UTC(2026, 9, 5) }, { id: "a", ms: Date.UTC(2026, 8, 20) }, { id: "c", ms: Date.UTC(2026, 9, 1) }, { id: "d", ms: Date.UTC(2026, 8, 3) }], { "202610": 2 });
ok(r.attributions.map((x) => x.id + "=" + x.numero).join(" ") === "d=202609001 a=202609002 c=202610003 b=202610004", "ordre d'inscription, numéro repart à 001 chaque mois, suite des compteurs existants");
ok(r.compteurs["202609"] === 2 && r.compteurs["202610"] === 4, "compteurs mis à jour");
const doublons = N.attribuer(Array.from({ length: 50 }, (_, i) => ({ id: "p" + i, ms: Date.UTC(2026, 9, 1) + (i % 5) })), {});
ok(new Set(doublons.attributions.map((x) => x.numero)).size === 50, "aucun doublon (50 dossiers, heures identiques)");
