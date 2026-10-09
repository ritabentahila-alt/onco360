// node functions/test-audit.js — journal d'audit (étape 9 S1)
const A = require("./audit");
const ok = (c, m) => { console.log((c ? "✅ " : "❌ ") + m); if (!c) process.exitCode = 1; };
const moi = { par: "U1", via: "onco360" };

const p0 = { identite: { nom: "Alaoui", prenom: "Fatima" }, clinique: { poids: 60 }, rdvsJson: "[]", lignesJson: "[]", resume: "{}", version: 1, maj: 1 };
const p1 = Object.assign({}, p0, { rdvsJson: '[{"d":"2026-10-12"}]', resume: '{"x":1}', version: 2, maj: 2 });
const l1 = A.ligne("patients", "P1", p0, p1, moi);
ok(l1 && l1.type === "modification" && JSON.stringify(l1.quoi) === '["Rendez-vous"]' && l1.patientId === "P1" && l1.patientNom === "ALAOUI Fatima" && l1.par === "U1", "rendez-vous modifié : partie du dossier, patient, auteur");
ok(!JSON.stringify(l1).includes("2026-10-12"), "aucune valeur recopiée dans le journal");
ok(A.ligne("patients", "P1", p0, Object.assign({}, p0, { resume: "{}", version: 2, maj: 3 }), moi) === null, "résumé recalculé seul : rien à noter");
const l2 = A.ligne("patients", "P1", p0, Object.assign({}, p0, { lignesJson: "[1]", clinique: { poids: 61 }, version: 2 }), moi);
ok(JSON.stringify(l2.quoi.sort()) === JSON.stringify(["Chimiothérapie", "Fiche patient"].sort()), "plusieurs parties modifiées");
const l3 = A.ligne("patients", "P1", p0, null, moi);
ok(l3.type === "suppression" && l3.patientNom === "ALAOUI Fatima", "dossier supprimé : nom gardé dans le journal");
ok(A.ligne("patients", "P2", null, p0, moi).type === "creation", "dossier créé");
const c = A.ligne("consultations", "C1", null, { patientId: "P1", titre: "Consultation de suivi", note: "Secret médical" }, moi);
ok(c.type === "creation" && c.patientId === "P1" && c.element === "Consultation de suivi" && c.lib === "Consultation" && !JSON.stringify(c).includes("Secret"), "consultation créée : titre, patient, sans la note");
const t = A.ligne("taches", "T1", { titre: "Appeler", statut: "afaire", fil: [] }, { titre: "Appeler", statut: "fait", fil: [1] }, moi);
ok(JSON.stringify(t.quoi.sort()) === '["fil","statut"]' && t.patientId === "", "tâche : champs modifiés, sans patient");
ok(A.ligne("patientsFinances", "P1", null, { montantsJson: "{}" }, moi).patientId === "P1", "montants : patient = identifiant du document");
["audit", "presence", "compteurs", "tachesAuto", "historique"].forEach((k) => ok(A.ligne(k, "x", null, { a: 1 }, moi) === null, "collection non notée : " + k));
ok(A.ligne("parametres", "listes", { data: "1" }, { data: "2" }, moi).element === "listes", "paramètres : nom du réglage");

ok(JSON.stringify(A.auteur("app_user", "U1", {})) === JSON.stringify(moi), "auteur : personne connectée");
const s = A.auteur("admin", "service@x", { majPar: "U2" });
ok(s.via === "serveur" && s.par === "" && s.pour === "U2", "écriture du serveur : pour l'auteur noté dans le document");
ok(A.auteur("unauthenticated", "", null).via === "serveur", "sans identité : serveur");

const T = 1e12;
ok(A.ouverture(null, { patientId: "P1" }, 0, T), "ouverture : 1er dossier");
ok(A.ouverture({ patientId: "" }, { patientId: "P1" }, T, T + 1000), "ouverture : depuis une autre page");
ok(!A.ouverture({ patientId: "P1" }, { patientId: "P1" }, T, T + 60000), "même dossier une minute plus tard (battement) : rien");
ok(A.ouverture({ patientId: "P1" }, { patientId: "P1" }, T, T + 31 * 60000), "même dossier après 30 min sans signal : nouvelle ouverture");
ok(A.ouverture({ patientId: "P1" }, { patientId: "P2" }, T, T + 1000), "autre dossier : ouverture");
ok(!A.ouverture({ patientId: "P1" }, { patientId: "" }, T, T + 1000), "dossier fermé : rien");
ok(A.csv([["a", 'b "c"'], [1, null]]) === '"a";"b ""c"""\r\n"1";""', "export pour Excel");
