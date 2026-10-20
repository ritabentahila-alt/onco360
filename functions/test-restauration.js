// Récupérer un dossier, un document ou tout un cabinet (R-F2, R-F7, 20/10/2026) : node functions/test-restauration.js (logique seule)
const R = require("./restauration.js");
let ok = 0, ko = 0; const cas = (n, v, d) => { if (v) { ok++; console.log("  ✅ " + n); } else { ko++; console.log("  ❌ " + n + " " + JSON.stringify(d)); } };

// État passé (format export) d'un cabinet fictif
const J = { collections: {
  patients: { P1: { identite: { numero: "202610001", nomF: "ALPHA", prenom: "Test", ddn: "1960-01-01" }, version: 4, maj: "2026-10-18T08:00:00.000Z", lignesJson: "[1]" },
    P2: { identite: { numero: "202610002", nomF: "BETA", prenom: "Zoé" }, version: 2 } },
  patientsFinances: { P1: { montantsJson: "{\"rdv\":{}}" } }, encaissements: { P1: { l: [] } },
  consultations: { C1: { patientId: "P1", note: "RAS" }, C2: { patientId: "P2", note: "autre" } },
  recus: { R1: { patientId: "P1", numero: "R-2026-0001", m: 300, annules: [] } },
  fichiers: { F1: { patientId: "P1", chemin: "espaces/e/patients/P1/fichiers/F1/cr.pdf", titre: "CR" } },
  taches: { T1: { patientId: "P1", titre: "Appeler" } },
  bibliotheques: { medicaments: { data: "[{\"id\":\"m1\"}]" } }, parametres: { listes: { data: "{}" } },
  membres: { MED: { role: "medecin" } }, recusCompteur: { 2026: { n: 1 } }, historique: { h1: { quoi: "x" } },
}, dates: { "patients/P1": ["maj"] } };

console.log("Pièces d'un dossier");
const p1 = R.piecesPatient(J, "P1"), cles = Object.keys(p1).sort();
cas("dossier, montants, encaissements, consultation, reçu, document déposé, tâche (pas ceux d'un autre patient)",
  JSON.stringify(cles) === JSON.stringify(["consultations/C1", "encaissements/P1", "fichiers/F1", "patients/P1", "patientsFinances/P1", "recus/R1", "taches/T1"]), cles);
cas("dates du dossier gardées avec la pièce", JSON.stringify(p1["patients/P1"].dates) === JSON.stringify(["maj"]));
cas("document d'une bibliothèque", Object.keys(R.pieceDocument(J, "bibliotheques", "medicaments"))[0] === "bibliotheques/medicaments" && !Object.keys(R.pieceDocument(J, "bibliotheques", "rien")).length);
const cab = R.piecesCabinet(J);
cas("tout le cabinet sans l'équipe, les compteurs, le journal", cab["patients/P2"] && !cab["membres/MED"] && !cab["recusCompteur/2026"] && !cab["historique/h1"], Object.keys(cab));

console.log("Listes");
const lp = R.listePatients(J, ["P2"]);
cas("patients triés par nom, effacé repéré (existe = non)", lp[0].nom === "ALPHA Test" && lp[0].existe === false && lp[1].existe === true && lp[0].numero === "202610001", lp);
const la = R.listePatients(J, [], true);
cas("pour l'administration : numéro seul, jamais le nom", la.every((x) => x.nom === undefined && x.ddn === undefined && x.numero), la);
cas("documents du cabinet récupérables un par un", R.listeDocuments(J).some((d) => d.col === "bibliotheques" && d.id === "medicaments") && !R.listeDocuments(J).some((d) => d.col === "membres"));

console.log("Comparaison avec l'état actuel");
// Aujourd'hui : P1 effacé (dossier, montants, consultation, document déposé supprimés), reçu annulé depuis, tâche modifiée, nouvelle consultation
const present = {
  "recus/R1": { data: { patientId: "P1", numero: "R-2026-0001", m: 300, annules: [{ numero: "R-2026-0001" }] }, dates: [] },
  "taches/T1": { data: { patientId: "P1", titre: "Appeler le patient" }, dates: [] },
  "encaissements/P1": { data: { l: [] }, dates: [] },
  "consultations/C9": { data: { patientId: "P1", note: "après" }, dates: [] },
};
const cmp = R.comparer(p1, present);
cas("effacés depuis : remis", ["patients/P1", "patientsFinances/P1", "consultations/C1", "fichiers/F1"].every((k) => cmp.effaces.indexOf(k) >= 0), cmp.effaces);
cas("modifié depuis : remis comme avant", cmp.modifies.length === 1 && cmp.modifies[0] === "taches/T1", cmp.modifies);
cas("identique : rien à écrire", cmp.identiques.indexOf("encaissements/P1") >= 0 && cmp.remettre.indexOf("encaissements/P1") < 0);
cas("reçu existant jamais remplacé (annulation gardée)", cmp.gardes.indexOf("recus/R1") >= 0 && cmp.remettre.indexOf("recus/R1") < 0, cmp);
cas("créé depuis : gardé (jamais effacé)", cmp.crees.indexOf("consultations/C9") >= 0 && cmp.remettre.indexOf("consultations/C9") < 0);
const txt = R.resume(cmp);
cas("résumé lisible", /Consultations et ordonnances : 1 effacé\(s\) depuis, remis, 1 créé\(s\) depuis, gardé\(s\)/.test(txt) && /Reçus : 1 gardé/.test(txt), txt);
cas("reçu effacé (impossible en principe) : remis", R.comparer({ "recus/R1": p1["recus/R1"] }, {}).remettre[0] === "recus/R1");
cas("rien à faire : phrase dédiée", /Rien à récupérer/.test(R.resume(R.comparer({ "a/b": { data: { x: 1 } } }, { "a/b": { data: { x: 1 } } }))));
cas("version et date d'écriture ignorées pour dire « identique »", R.memes({ a: 1, version: 3, maj: "x" }, { a: 1, version: 9, maj: "y", majPar: "U" }));
cas("ordre des clés sans importance, contenu oui", R.memes({ a: 1, b: { c: 2, d: 3 } }, { b: { d: 3, c: 2 }, a: 1 }) && !R.memes({ a: [1, 2] }, { a: [2, 1] }));

console.log("Écriture");
const enDate = (t) => ({ date: t });
const d = R.aEcrire("patients/P1", p1["patients/P1"], { data: { version: 7 } }, enDate, { majPar: "U1" });
cas("dossier : version au-dessus de l'actuelle (les postes ouverts relisent), dates remises, auteur", d.version === 8 && d.maj.date === "2026-10-18T08:00:00.000Z" && d.majPar === "U1", d);
const d2 = R.aEcrire("patients/P1", p1["patients/P1"], null, enDate, {});
cas("dossier effacé : version de la source + 1", d2.version === 5, d2.version);
cas("autre pièce : telle quelle", JSON.stringify(R.aEcrire("taches/T1", p1["taches/T1"], null, enDate)) === JSON.stringify(J.collections.taches.T1));
cas("chemin du PDF d'un document déposé (pour le remettre)", R.cheminFichierDe("fichiers/F1", p1["fichiers/F1"]) === "espaces/e/patients/P1/fichiers/F1/cr.pdf" && R.cheminFichierDe("taches/T1", p1["taches/T1"]) === "");

console.log("Copie d'avant la récupération (pour l'annuler)");
const cp = R.versExport({ "patients/P1": { data: { a: 1, maj: "2026-10-19T00:00:00.000Z" }, dates: ["maj"] }, "taches/T1": { data: { b: 2 }, dates: [] } }, { espace: "e" });
cas("au format de l'export, réutilisable comme source", cp.application === "Onco360" && cp.collections.patients.P1.a === 1 && cp.dates["patients/P1"][0] === "maj" && !cp.dates["taches/T1"] && cp.espace === "e");
cas("la copie redonne les mêmes pièces", JSON.stringify(R.piecesPatient(Object.assign(cp, { collections: Object.assign(cp.collections, { taches: { T1: { patientId: "P1", b: 2 } } }) }), "P1")["patients/P1"]) === JSON.stringify({ data: { a: 1, maj: "2026-10-19T00:00:00.000Z" }, dates: ["maj"] }));

console.log("Heure demandée (base à une heure donnée, 7 jours)");
const now = new Date("2026-10-20T10:00:30Z").getTime();
cas("arrondie à la minute", R.instantValide("2026-10-19T09:15:42Z", now).t === new Date("2026-10-19T09:15:00Z").getTime());
cas("futur ou dernière minute : refusé", /heure passée/.test(R.instantValide("2026-10-20T10:00:00Z", now).erreur) && /heure passée/.test(R.instantValide("2026-10-21T10:00:00Z", now).erreur));
cas("plus de 7 jours : renvoyé aux exports", /7 jours/.test(R.instantValide("2026-10-12T10:00:00Z", now).erreur));
cas("illisible", /illisible/.test(R.instantValide("n'importe quoi", now).erreur));

console.log("\n" + ok + " réussis, " + ko + " échoués"); process.exit(ko ? 1 : 0);
