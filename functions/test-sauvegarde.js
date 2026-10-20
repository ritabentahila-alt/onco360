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
console.log("Garde-fou et surveillance (R-F5)");
const grande = Array.from({ length: 100 }, (x, i) => ({ nom: "espaces/a/patients/p/fichiers/" + i + "/f.pdf", md5: "M" }));
const vide = S.planCopie([], grande);
cas("stockage vidé d'un coup (100 fichiers disparus) : rien retiré, garde-fou signalé", vide.retirer.length === 0 && vide.garde && vide.garde.n === 100 && vide.garde.total === 100, vide);
const peu = S.planCopie(grande.slice(0, 95), grande);
cas("5 fichiers supprimés sur 100 : retirés normalement", peu.retirer.length === 5 && !peu.garde, peu.garde);
const petit = S.planCopie([], grande.slice(0, 15));
cas("petit cabinet (15 fichiers, tous supprimés) : sous le seuil de 20, retirés", petit.retirer.length === 15 && !petit.garde);
const now = new Date("2026-10-20T08:00:00Z").getTime();
cas("jamais tourné : alerte", /jamais/.test(S.alerteCopie(null, now)));
cas("nuit correcte il y a 6 h : aucune alerte", S.alerteCopie({ dernier: { le: "2026-10-20T02:00:00Z", copies: 3, erreurs: 0 } }, now) === "");
cas("pas de passage depuis 3 jours : alerte", /depuis 3 jours/.test(S.alerteCopie({ dernier: { le: "2026-10-17T02:00:00Z", erreurs: 0 } }, now)));
cas("erreurs de copie : alerte", /2 fichier\(s\) non copié/.test(S.alerteCopie({ dernier: { le: "2026-10-20T02:00:00Z", erreurs: 2 } }, now)));
cas("garde-fou : alerte", /ont disparu d'un coup/.test(S.alerteCopie({ dernier: { le: "2026-10-20T02:00:00Z", garde: { n: 100, total: 100 } } }, now)));
let reg = null; for (let i = 0; i < 35; i++) reg = S.noterNuit(reg, { le: "2026-09-" + String(i + 1).padStart(2, "0") + "T02:00:00Z" });
cas("registre : 30 dernières nuits, la plus récente d'abord", reg.nuits.length === 30 && reg.dernier.le === reg.nuits[0].le && reg.nuits[0].le > reg.nuits[29].le);

console.log("\n" + ok + " réussis, " + ko + " échoués"); process.exit(ko ? 1 : 0);
