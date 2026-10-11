// Copie de secours des fichiers (étape 1.6, 11/10/2026) : node functions/test-sauvegarde.js
const S = require("./sauvegarde.js");
let ok = 0, ko = 0; const cas = (n, v, d) => { if (v) { ok++; console.log("  ✅ " + n); } else { ko++; console.log("  ❌ " + n + " " + JSON.stringify(d)); } };
const src = [{ nom: "espaces/a/patients/p/fichiers/1/x.pdf", md5: "A" }, { nom: "espaces/a/patients/p/fichiers/2/y.pdf", md5: "B2" },
  { nom: "espaces/a/documentation/d/z.pdf", md5: "C" }, { nom: "espaces/a/exports/9/Onco360_export.zip", md5: "E" }, { nom: "autre/t.txt", md5: "T" }];
const copie = [{ nom: "espaces/a/patients/p/fichiers/1/x.pdf", md5: "A" }, { nom: "espaces/a/patients/p/fichiers/2/y.pdf", md5: "B1" }, { nom: "espaces/a/patients/p/fichiers/3/supprime.pdf", md5: "S" }];
const p = S.planCopie(src, copie);
cas("nouveau et modifié copiés, inchangé laissé", JSON.stringify(p.copier) === JSON.stringify(["espaces/a/patients/p/fichiers/2/y.pdf", "espaces/a/documentation/d/z.pdf"]), p.copier);
cas("fichier supprimé du dossier : retiré de la copie (gardé 30 jours en ancienne version)", JSON.stringify(p.retirer) === JSON.stringify(["espaces/a/patients/p/fichiers/3/supprime.pdf"]), p.retirer);
cas("exports complets et fichiers hors cabinets non recopiés", !p.copier.some((n) => /exports|autre\//.test(n)));
cas("première nuit (copie vide) : tout est copié", S.planCopie(src, []).copier.length === 3);
cas("second emplacement : autre région, versions 30 jours, jamais public", S.REGLAGES_COPIE.location === "EUROPE-WEST4" && S.REGLAGES_COPIE.versioning.enabled && S.REGLAGES_COPIE.lifecycle.rule[0].condition.daysSinceNoncurrentTime === 30 && S.REGLAGES_COPIE.iamConfiguration.publicAccessPrevention === "enforced");
console.log("\n" + ok + " réussis, " + ko + " échoués"); process.exit(ko ? 1 : 0);
