// Export complet d'un cabinet (étape 1.6, 11/10/2026) : node functions/test-exportation.js
const X = require("./exportation.js");
let ok = 0, ko = 0;
const cas = (nom, v, d) => { if (v) { ok++; console.log("  ✅ " + nom); } else { ko++; console.log("  ❌ " + nom + (d === undefined ? "" : " " + JSON.stringify(d))); } };

console.log("Valeurs Firestore → JSON");
const ts = { toDate: () => new Date("2026-10-11T08:30:00Z") };
const p = X.plat({ maj: ts, l: [ts, 1, "a"], o: { d: ts, n: null } });
cas("dates en texte ISO, partout (listes, objets)", p.maj === "2026-10-11T08:30:00.000Z" && p.l[0] === p.maj && p.l[1] === 1 && p.o.d === p.maj && p.o.n === null, p);

const dts = [], p2 = X.plat({ maj: ts, fil: [{ le: ts, txt: "a" }, { le: "2026-10-11T08:30:00.000Z" }] }, dts);
cas("chemins des dates notés (pas les textes qui ressemblent à une date)", JSON.stringify(dts) === JSON.stringify(["maj", "fil.0.le"]), dts);
const re = X.remettreDates(p2, dts, (t) => ({ date: t }));
cas("restauration : dates remises, texte laissé tel quel", re.maj.date === p2.maj && re.fil[0].le.date === p2.maj && re.fil[1].le === "2026-10-11T08:30:00.000Z" && p2.maj === "2026-10-11T08:30:00.000Z", re);

console.log("Tableau des patients (CSV pour Excel)");
const pats = {
  P2: { identite: { numero: "202610002", nomF: "TEST", prenom: "Zoé", ddn: "1960-01-02", tel: "0600000000", mut: "CNOPS" }, clinique: { diag: "Sein; HER2+" }, etablissementId: "HGC" },
  P1: { identite: { numero: "202610001", nom: "ALPHA Ali", sexe: "M", cor: 'Dr "X"' }, clinique: { diag: "Prostate" }, etablissementId: "CIOC" },
};
const csv = X.csvPatients(pats, { HGC: { nom: "Hôpital Test" } }), L = csv.trim().split("\r\n");
cas("en-tête + une ligne par patient, triées par nom", L.length === 3 && L[0].startsWith("N° de dossier;Nom;Prénom") && L[1].startsWith("202610001;") && L[2].startsWith("202610002;"), L);
cas("point-virgule et guillemets protégés", L[2].indexOf('"Sein; HER2+"') > 0 && L[1].indexOf('"Dr ""X"""') > 0, L);
cas("nom complet, établissement (nom ou code), identifiant", L[2].indexOf(";TEST Zoé;") > 0 && L[2].indexOf(";Hôpital Test;P2") > 0 && L[1].indexOf(";CIOC;P1") > 0, L);

console.log("Chemin des documents dans le ZIP");
const deja = new Set();
const c1 = X.cheminFichier({ patientId: "P2", d: "2026-10-01", titre: "CR anapath / IHC" }, pats, deja);
const c2 = X.cheminFichier({ patientId: "P2", d: "2026-10-01", titre: "CR anapath / IHC" }, pats, deja);
cas("rangé par patient (n° + nom), date + titre, sans caractère interdit", c1 === "fichiers/202610002 TEST Zoé/2026-10-01 CR anapath IHC.pdf", c1);
cas("deux documents de même nom : le second numéroté", c2 === "fichiers/202610002 TEST Zoé/2026-10-01 CR anapath IHC (2).pdf", c2);
cas("patient inconnu : rangé sous son identifiant", X.cheminFichier({ patientId: "PX", titre: "a" }, pats).startsWith("fichiers/PX/"));

console.log("Vraies extensions (R-F6)");
cas("photo d'avant le 11/10 : .jpg (nom), Word : .docx (type), sans indice : .pdf",
  X.cheminFichier({ patientId: "P2", d: "2026-09-01", titre: "Photo", nom: "IMG_01.JPG" }, pats).endsWith("Photo.jpg") &&
  X.cheminFichier({ patientId: "P2", titre: "Courrier", nom: "courrier", mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }, pats).endsWith("Courrier.docx") &&
  X.cheminFichier({ patientId: "P2", titre: "Sans" }, pats).endsWith("Sans.pdf"));
const dj2 = new Set(), j1 = X.cheminFichier({ patientId: "P2", titre: "X", nom: "a.png" }, pats, dj2), j2 = X.cheminFichier({ patientId: "P2", titre: "X", nom: "b.png" }, pats, dj2);
cas("doublon numéroté avant l'extension", j2 === j1.replace(".png", " (2).png"), [j1, j2]);
cas("type remis à la restauration d'après le nom", X.typeDe("fichiers/a/b.jpg") === "image/jpeg" && X.typeDe("x.pdf") === "application/pdf" && X.typeDe("sans") === "application/pdf");

console.log("Téléphone en texte pour Excel (R-F6)");
cas("le 0 du début gardé (cellule =\"0600000000\")", L[2].split(";").indexOf('"=""0600000000"""') === 6, L[2]);
cas("téléphone vide : cellule vide", L[1].split(";")[6] === "", L[1]);

console.log("Notice");
const t = X.lisezmoi({ cabinet: "Cabinet Test", date: "11/10/2026", patients: 2, fichiers: 3, documentation: 1, manquants: 1 });
cas("nombre de patients, fichiers, manquants, mise en garde", /2 patient/.test(t) && /3 document/.test(t) && /1 fichier\(s\) introuvable/.test(t) && /données de santé/.test(t));

console.log("\n" + ok + " réussis, " + ko + " échoués");
process.exit(ko ? 1 : 0);
