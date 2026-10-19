// R-E3 / R-E4 (19/10/2026) : mise à jour des bibliothèques sans écrasement : node tests/moteur/test-bibmaj.mjs
import { fusionnerListe, fusionnerOrdos, ajouterManquantes, retiresEntre } from "../../public/js/moteur/bibmaj.js";
import { MAJ_BIB } from "../../public/js/donnees/majbib.js";
import { MEDICAMENTS0 } from "../../public/js/donnees/medicaments.js";
import { ANALYSES0, BILANS0 } from "../../public/js/donnees/analyses.js";
import { EXAMENS0 } from "../../public/js/donnees/examens.js";
import { ORDOS_TYPES0 } from "../../public/js/donnees/ordostypes.js";
import { readFileSync } from "fs";
let ok = 0, ko = 0;
const t = (c, m, d) => { if (c) { ok++; console.log("  ✔ " + m); } else { ko++; console.log("  ✘ " + m + (d === undefined ? "" : " " + JSON.stringify(d).slice(0, 400))); } };
// Liste de départ d'avant (commit 12a8c83) : celle qu'un cabinet a enregistrée
const src = (f) => readFileSync(new URL("../../public/js/donnees/" + f, import.meta.url), "utf8");
const depart = MEDICAMENTS0.map((m, i) => ({ id: m[3] || "m" + (i + 1), nom: m[0], poso: m[1], classe: m[2] || "" }));
const ancien = depart.slice(0, 165).map((m) => Object.assign({}, m));
MAJ_BIB.medicaments.corrections.forEach((c) => { const o = ancien.find((z) => z.id === c.apres[0]); o.nom = c.avant[0]; o.poso = c.avant[1]; });

console.log("Médicaments : cabinet qui n'a rien modifié");
let L = JSON.parse(JSON.stringify(ancien)); L.find((z) => z.nom.startsWith("TAVANIC")).fav = true;
let r = fusionnerListe("medicaments", L, MAJ_BIB.medicaments, depart, []);
t(r.corriges === MAJ_BIB.medicaments.corrections.length, "toutes les fiches d'avant corrigées (" + r.corriges + ")", r);
t(L.length === 180 && JSON.stringify(L.map((z) => z.nom).sort()) === JSON.stringify(depart.map((z) => z.nom).sort()), "la liste devient la liste de départ d'aujourd'hui (180 fiches)", L.length);
const tav = L.find((z) => z.nom.startsWith("TAVANIC"));
t(tav.poso.indexOf("une fois par jour") >= 0 && tav.fav === true && tav.id === "m134", "TAVANIC corrigé, son étoile et son identifiant gardés", tav);
t(["MOSCONTIN LP (sulfate de morphine) 10 mg", "MOSCONTIN LP (sulfate de morphine) 30 mg", "MOSCONTIN LP (sulfate de morphine) 60 mg", "MOSCONTIN LP (sulfate de morphine) 100 mg"].every((n) => L.some((z) => z.nom === n)), "MOSCONTIN : une fiche par dosage");
t(L.some((z) => z.nom === "SOLUPRED (prednisolone) 20 mg") && L.some((z) => z.id === "m-loperium-irino"), "SOLUPRED et LOPERIUM de l'irinotécan ajoutés");
r = fusionnerListe("medicaments", L, MAJ_BIB.medicaments, depart, []);
t(r.corriges === 0 && r.ajoutes === 0, "rejouée : rien ne change", r);

console.log("Médicaments : cabinet qui a modifié, retiré, ajouté");
L = JSON.parse(JSON.stringify(ancien));
L.find((z) => z.nom.startsWith("TAVANIC")).poso = "Ma posologie à moi";
L.splice(L.findIndex((z) => z.nom.startsWith("MOSCONTIN")), 1);
L.push({ id: "mperso", nom: "SOLUPRED (prednisolone) 20 mg", poso: "2 comprimés", classe: "" });
r = fusionnerListe("medicaments", L, MAJ_BIB.medicaments, depart, ["m94", "m-vitb12"]);
t(L.find((z) => z.nom.startsWith("TAVANIC")).poso === "Ma posologie à moi", "TAVANIC modifié par le cabinet : jamais écrasé");
t(!L.some((z) => /^MOSCONTIN/.test(z.nom)), "MOSCONTIN retiré par le cabinet : ni remis, ni ses autres dosages");
t(L.filter((z) => /^SOLUPRED/.test(z.nom)).length === 1 && L.find((z) => /^SOLUPRED/.test(z.nom)).poso === "2 comprimés", "SOLUPRED déjà créé par le cabinet : pas de doublon, le sien gardé");
t(!L.some((z) => z.id === "m-vitb12"), "fiche refusée (retirée) : pas reproposée");

console.log("Analyses, bilans, examens");
const anaD = ANALYSES0.map(([nom, cat, id], i) => ({ id: id || "a" + (i + 1), nom, cat })), ana = anaD.slice(0, ANALYSES0.length - 5).map((a) => Object.assign({}, a));
MAJ_BIB.analyses.corrections.forEach((c) => { const o = ana.find((z) => z.id === c.apres[0]); o.nom = c.avant[0]; o.cat = c.avant[1]; });
r = fusionnerListe("analyses", ana, MAJ_BIB.analyses, anaD, []);
t(ana.find((z) => /^Protéinurie/.test(z.nom)).cat === "Biochimie" && ana.length === ANALYSES0.length, "Protéinurie en Biochimie ; 5 sérologies ajoutées", r);
const bilD = BILANS0.map((b, i) => ({ id: "b" + (i + 1), nom: b.nom, items: b.items.slice() })), bil = bilD.map((b) => JSON.parse(JSON.stringify(b)));
MAJ_BIB.bilans.corrections.forEach((c) => { const o = bil.find((z) => z.id === c.apres[0]); o.items = c.avant[1].slice(); });
bil.find((z) => z.nom === "Bilan diarrhée").items.push("Lipase"); // modifié par le cabinet
r = fusionnerListe("bilans", bil, MAJ_BIB.bilans, bilD, []);
const ini = bil.find((z) => z.nom === "Bilan chimiothérapie – bilan initial");
t(ini.items.indexOf("Bilan lipidique") < 0 && ini.items.indexOf("Triglycérides") >= 0 && ini.items.indexOf("TSH us") >= 0, "bilan initial : « Bilan lipidique » remplacé par ses 4 analyses, TSH us", ini.items);
t(bil.find((z) => z.nom === "Bilan diarrhée").items.indexOf("Lipase") >= 0, "bilan modifié par le cabinet : gardé tel quel");
const noms = new Set(anaD.map((a) => a.nom)), dans = (n, B) => noms.has(n) || B.some((b) => b.nom === n);
const horsListe = bilD.flatMap((b) => b.items).filter((n) => !dans(n, bilD));
t(!horsListe.length, "chaque élément des bilans de départ porte le nom d'une analyse ou d'un bilan de la liste", horsListe);
const exD = EXAMENS0.map(([nom, cat, note], i) => ({ id: "e" + (i + 1), nom, cat, note: note || "" })), ex = exD.map((e) => Object.assign({}, e));
MAJ_BIB.examens.corrections.forEach((c) => { const o = ex.find((z) => z.id === c.apres[0]); o.note = c.avant[2]; });
r = fusionnerListe("examens", ex, MAJ_BIB.examens, exD, []);
t(r.corriges === 7 && ex.filter((e) => /metformine/.test(e.note)).length === 7, "précaution des 7 scanners injectés", r);

console.log("Ordonnances types");
const ordD = ORDOS_TYPES0.map((o, i) => ({ id: "t" + (i + 1), nom: o.nom, items: o.items.map(([nom, poso]) => ({ nom, poso })) }));
const ord = JSON.parse(JSON.stringify(ordD));
MAJ_BIB.ordostypes.forEach((m) => { const o = ord.find((z) => z.nom === m.ordo); if (!o) return; if (m.ancien) o.nom = m.ancien; m.lignes.forEach((l) => { const it = o.items.find((i) => i.nom === l.apres[0] && i.poso === l.apres[1]); if (it) { it.nom = l.avant[0]; it.poso = l.avant[1]; } }); });
ord.find((z) => /palier 3/.test(z.nom)).items[1].poso = "Ma posologie";
r = fusionnerOrdos(ord, MAJ_BIB.ordostypes);
t(ord.some((z) => z.nom === "Douleurs – palier 1") && !ord.some((z) => z.nom === "Douleurs – paliers 1"), "« Douleurs – paliers 1 » renommée « Douleurs – palier 1 »", r);
const p3 = ord.find((z) => /palier 3/.test(z.nom));
t(p3.items[0].nom === "MOSCONTIN LP (sulfate de morphine) 10 mg" && /28 jours/.test(p3.items[0].poso) && p3.items[1].poso === "Ma posologie", "palier 3 : MOSCONTIN 10 mg sur 28 jours ; ligne modifiée par le cabinet gardée", p3.items);
t(ajouterManquantes(ord, ordD, []) === 0, "ordonnances types : rien ne manque, rien d'ajouté");
const ord2 = ord.filter((z) => z.nom !== "Diarrhée");
t(ajouterManquantes(ord2, ordD, ["t1"]) === 0 && ajouterManquantes(ord2, ordD, []) === 1, "ordonnance type retirée par le cabinet : pas remise ; sinon ajoutée");
t(JSON.stringify(retiresEntre([{ id: "a" }, { id: "b" }], [{ id: "b" }])) === '["a"]', "identifiants retirés notés");
t(!ordD.some((o) => o.items.some((i) => /…/.test(i.nom + i.poso))), "ordonnances types : aucun « … » dans les lignes (zones « [… à compléter] » seulement)");

console.log(`\n${ok} réussis, ${ko} échoués`); if (ko) process.exit(1);
