// node functions/test-heure.js — heure du Maroc (S1, 21/10/2026) : table des changements d'heure, calculs, copie exacte site / serveur
const fs = require("fs"), path = require("path");
const H = require("./heure");
const ok = (c, m) => { console.log((c ? "✅ " : "❌ ") + m); if (!c) process.exitCode = 1; };
const U = (s) => Date.parse(s);

// Copie exacte : le fichier du serveur = celui du site, sans « export » ni la dernière ligne
const site = fs.readFileSync(path.join(__dirname, "../public/js/moteur/heure.js"), "utf8").replace(/export (function|const) /g, "$1 ");
const serv = fs.readFileSync(path.join(__dirname, "heure.js"), "utf8").split("\n").filter((l) => !/^\/\/ (Copie exacte|changent ;)/.test(l) && !/^module\.exports/.test(l)).join("\n");
ok(site.trim() === serv.trim(), "functions/heure.js = public/js/moteur/heure.js (même code)");

// Retour à GMT le 20/09/2026 (décret n° 2.26.530) : 02:00 (GMT+1) → 01:00
ok(H.hmMaroc(U("2026-10-21T07:34:00Z")) === "07:34", "21/10/2026 07:34 UTC = 07:34 au Maroc (GMT)");
ok(H.hmMaroc(U("2026-09-19T12:00:00Z")) === "13:00", "19/09/2026 12:00 UTC = 13:00 au Maroc (encore GMT+1)");
ok(H.hmMaroc(U("2026-09-20T00:59:00Z")) === "01:59" && H.hmMaroc(U("2026-09-20T01:00:00Z")) === "01:00", "nuit du 19 au 20/09 : 01:59 puis 01:00");
// Changement de jour à minuit (et plus à 23 h)
ok(H.jourMaroc(U("2026-10-20T23:30:00Z")) === "2026-10-20" && H.jourMaroc(U("2026-10-21T00:00:00Z")) === "2026-10-21", "nouveau jour à minuit, heure du Maroc");
ok(H.jourMaroc(U("2026-08-20T23:30:00Z")) === "2026-08-21", "en août 2026 (GMT+1), 23:30 UTC = le lendemain au Maroc");
// Ramadan 2026 (GMT du 15/02 au 22/03)
ok(H.decalage(U("2026-03-01T10:00:00Z")) === 0 && H.decalage(U("2026-04-01T10:00:00Z")) === 60, "Ramadan 2026 à GMT, avril à GMT+1");
ok(H.decalage(U("2017-06-01T10:00:00Z")) === 0, "avant la table : GMT");
ok(H.minutesMaroc(U("2026-10-21T14:05:00Z")) === 845 && H.dateHeureMaroc(U("2026-10-21T14:05:00Z")) === "21/10/2026 14:05", "minutes depuis minuit, date et heure");
ok(H.partiesMaroc(U("2026-10-25T10:00:00Z")).js === 0, "jour de la semaine (dimanche 25/10/2026)");

// Changement ajouté par l'Administration (ex. : heure d'été décidée pour 2027)
const T = H.tableAvec([{ du: "2027-02-07T02:00Z", dec: 60 }, { du: "2027-03-14T02:00Z", dec: 0 }, { du: "abîmé", dec: 60 }, { du: "2027-05-01T00:00Z", dec: 9999 }]);
ok(T.length === H.CHANGEMENTS0.length + 2, "changements valables ajoutés, abîmés écartés");
ok(H.hmMaroc(U("2027-02-10T09:00:00Z"), T) === "10:00" && H.hmMaroc(U("2027-03-20T09:00:00Z"), T) === "09:00", "période GMT+1 ajoutée, puis retour à GMT");
ok(H.hmMaroc(U("2027-02-10T09:00:00Z")) === "09:00", "table du code inchangée tant que changerTable n'est pas appelé");
H.changerTable([{ du: "2027-02-07T02:00Z", dec: 60 }]);
ok(H.hmMaroc(U("2027-02-10T09:00:00Z")) === "10:00", "changerTable : la table de l'Administration sert partout");
H.changerTable(null);
ok(H.hmMaroc(U("2027-02-10T09:00:00Z")) === "09:00", "changerTable(null) : retour à la table du code");
ok(H.tableAvec([{ du: "2026-09-20T01:00Z", dec: 60 }]).find((c) => c.du === "2026-09-20T01:00Z").dec === 60, "même instant : l'Administration l'emporte");
// Instant d'une heure du Maroc (écran de l'Administration)
ok(H.instantMaroc("2026-10-21", "14:05") === U("2026-10-21T14:05:00Z"), "14:05 au Maroc le 21/10/2026 = 14:05 UTC");
ok(H.instantMaroc("2026-08-21", "14:05") === U("2026-08-21T13:05:00Z"), "14:05 au Maroc le 21/08/2026 = 13:05 UTC");
ok(isNaN(H.instantMaroc("abc", "10:00")), "date illisible : NaN");
