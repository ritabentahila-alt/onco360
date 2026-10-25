// RTR, RT2 (25/10/2026) : calculs purs du référentiel de radiothérapie (public/js/moteur/rtref.js) sur le contenu de référence
// (public/donnees-rt) et des changements du cabinet fictifs. node tests/moteur/test-rtref.mjs
import { readFileSync } from "node:fs";
import { NBSP, sansAcc, nb, fixe, gy, fmtPrescription, calculable, resumePrescription, controlePrescription, fusionner, ficheEffective, trier,
  chercher, motBloquant, termes, analyser, nombre, calculBED, libPreuve, TYPES } from "../../public/js/moteur/rtref.js";
const R = new URL("../../public/donnees-rt/", import.meta.url), lire = (f) => JSON.parse(readFileSync(new URL(f, R), "utf8"));
const IDX = lire("index.json"), PRO = lire("prostate.json"), COL = lire("col.json"), ESS = lire("essais.json").essais;
const acr = (id) => (ESS.find((e) => e.id === id) || {}).acronyme;
const sch = (L, id) => L.schemas.find((s) => s.id === id);
let ok = 0, ko = 0;
const cas = (nom, v, d) => { if (v) { ok++; console.log("  ✔ " + nom); } else { ko++; console.log("  ✘ " + nom + (d === undefined ? "" : "  " + JSON.stringify(d))); } };
const S = (s) => s.replace(/ /g, " ");

console.log("Nombres et doses");
cas("virgule décimale, zéros retirés : 1,8 · 60 · 2,67 · 54,12", nb(1.8) === "1,8" && nb(60) === "60" && nb(2.67) === "2,67" && nb(54.12) === "54,12" && nb(3.0) === "3");
cas("espace insécable avant l'unité (« 1,8 Gy »)", gy(1.8) === "1,8" + NBSP + "Gy");
cas("prescription : « 60 Gy / 20 fx (3 Gy/fx) »", S(fmtPrescription(sch(PRO, "pro-fav-60-20").prescriptions[0])) === "60 Gy / 20 fx (3 Gy/fx)", fmtPrescription(sch(PRO, "pro-fav-60-20").prescriptions[0]));
const ldr = sch(PRO, "pro-boost-ldr").prescriptions[1];
cas("curiethérapie LDR sans séances : « 110 Gy », pas de calcul EQD2", S(fmtPrescription(ldr)) === "110 Gy" && !calculable(ldr) && calculable(sch(PRO, "pro-fav-60-20").prescriptions[0]));
cas("ligne sans aucune dose : « — »", fmtPrescription({ volume: "X" }) === "—");
cas("résumé de la fiche : « 60 Gy / 20 fx (3 Gy/fx) · PTV_PRO · 5 fx/sem »", S(resumePrescription(sch(PRO, "pro-fav-60-20"))) === "60 Gy / 20 fx (3 Gy/fx) · PTV_PRO · 5 fx/sem", resumePrescription(sch(PRO, "pro-fav-60-20")));
cas("résumé, plusieurs volumes : le plus haut, puis « + 2 volumes »", S(resumePrescription(sch(PRO, "pro-pelv-70-28"))) === "70 Gy / 28 fx (2,5 Gy/fx) · PTV_PRO + 2 volumes · 5 fx/sem", resumePrescription(sch(PRO, "pro-pelv-70-28")));
cas("contrôle : 60 / 20 = 3 accepté ; 60 / 20 ≠ 2,5 signalé ; 0 refusé", !controlePrescription({ dose_Gy: 60, fractions: 20, dose_fx_Gy: 3 }).length && controlePrescription({ dose_Gy: 60, fractions: 20, dose_fx_Gy: 2.5 }).length === 1 && controlePrescription({ dose_Gy: 0, fractions: 20 }).length === 1);
cas("contrôle : écart toléré 0,01 Gy (95 / 35 = 2,71)", !controlePrescription({ dose_Gy: 95, fractions: 35, dose_fx_Gy: 2.71 }).length);
cas("libellés : preuve et fractionnement", libPreuve("essai_phase3") === "Essai de phase 3" && libPreuve("pratique_du_cabinet") === "Pratique du cabinet" && TYPES.curie_pdr === "Curiethérapie");

console.log("Fusion référence + cabinet");
const modif = { schema: Object.assign({}, sch(PRO, "pro-fav-60-20"), { titre: "60 Gy / 20 fx (notre pratique)" }), localisation_id: "prostate", origine: "cabinet", base: "2026-10-01", majPar: "MED" };
const modele = { schema: Object.assign({}, sch(COL, "col-postop-45")), localisation_id: "col", origine: "modele", base: "2026-10-23" };
const neuf = { schema: { id: "cab-1", situation_id: "pro-ep-fav", titre: "Schéma du cabinet 62 Gy / 20 fx", type: "rte_hypo", essai_ids: ["chhip"], prescriptions: [{ volume: "PTV_PRO", dose_Gy: 62, fractions: 20, dose_fx_Gy: 3.1 }] }, localisation_id: "prostate", nouveau: true, origine: "cabinet", majPar: "MED" };
const F = fusionner(IDX, { "pro-fav-60-20": modif, "col-postop-45": modele, "cab-1": neuf }, acr);
const e1 = F.find((e) => e.id === "pro-fav-60-20"), e2 = F.find((e) => e.id === "col-postop-45"), e3 = F.find((e) => e.id === "cab-1");
cas("sans changement du cabinet : la référence (" + IDX.schemas.length + " schémas)", fusionner(IDX, {}).length === IDX.schemas.length && fusionner(IDX, {}).every((e) => !e.modifie));
cas("schéma modifié : la version du cabinet remplace la référence, badge « Modifié pour le cabinet »", e1.titre === "60 Gy / 20 fx (notre pratique)" && e1.modifie && !e1.nouveau && F.length === IDX.schemas.length + 1);
cas("référence changée depuis la modification (date_maj 22/10 > base 01/10)", e1.refChangee === true && e2.refChangee === false);
cas("reçu du modèle (origine « modele ») : pas de badge", e2 && !e2.modifie);
cas("schéma créé par le cabinet : ajouté, preuve « pratique du cabinet », ind calculé, acronymes", e3 && e3.nouveau && e3.preuve === "pratique_du_cabinet" && e3.ind[1] === "Prostate" && e3.ind[3] === "Hypofractionné" && e3.essais[0] === "CHHiP", e3);
cas("fiche effective : celle du cabinet si elle existe, sinon la référence", ficheEffective(sch(PRO, "pro-fav-60-20"), modif).titre === modif.schema.titre && ficheEffective(sch(PRO, "pro-fav-60-20"), null).titre === "60 Gy / 20 fx");

console.log("Tri");
const T0 = trier(fusionner(IDX, {}), IDX, "");
cas("ordre du fichier sans recherche (Uro › Prostate d'abord)", T0[0].id === IDX.schemas[0].id && T0[0].localisation_id === "prostate");
const ordreP = ["essai_phase3", "recommandation", "pratique_institutionnelle", "option", "pratique_du_cabinet"];
const parSit = {}; T0.forEach((e) => { (parSit[e.situation_id] = parSit[e.situation_id] || []).push(ordreP.indexOf(e.preuve)); });
cas("dans chaque situation : phase 3, recommandation, institutionnelle, option", Object.values(parSit).every((l) => l.every((v, i) => !i || v >= l[i - 1])));
const T1 = trier(F, IDX, ""), i3 = T1.findIndex((e) => e.id === "cab-1"), dernierSit = T1.map((e) => e.situation_id).lastIndexOf("pro-ep-fav");
cas("schéma du cabinet : à la fin de sa situation (preuve « pratique du cabinet »)", i3 === dernierSit, [i3, dernierSit]);

console.log("Recherche");
const L = fusionner(IDX, {}), ids = (q) => chercher(L, q, IDX).map((e) => e.id);
cas("« prostate 60 » : 60 Gy / 20 fx trouvé, rien hors prostate", ids("prostate 60").includes("pro-fav-60-20") && chercher(L, "prostate 60", IDX).every((e) => e.localisation_id === "prostate"));
const g45 = chercher(L, "45 Gy", IDX);
cas("« 45 Gy » = « 45Gy » : chaque schéma a une ligne à 45 Gy", g45.length > 10 && g45.every((e) => e.doses.some((p) => p.dose_Gy === 45)) && ids("45Gy").join() === g45.map((e) => e.id).join(), g45.length);
cas("« 5 fx » : nombre de séances", chercher(L, "5 fx", IDX).every((e) => e.doses.some((p) => p.fractions === 5)) && ids("5 fx").length > 10);
cas("« 1,8 Gy » et « 1.8 » : dose par séance", ids("col 1,8").includes("col-postop-45") && ids("col 1.8").includes("col-postop-45"));
const ph = chercher(L, "prostate hypofrac", IDX);
cas("« prostate hypofrac » (synonyme) : schémas hypofractionnés de la prostate", ph.length > 3 && ph.every((e) => e.localisation_id === "prostate" && e.type === "rte_hypo"));
const colCurie = L.filter((e) => e.localisation_id === "col" && /curie/.test(e.type)).map((e) => e.id);
cas("« col curiethérapie » : toutes les curiethérapies du col ; « col curie » aussi (et les schémas de l'Institut Curie)", colCurie.length >= 4 && colCurie.every((i) => ids("col curiethérapie").includes(i)) && ids("col curiethérapie").every((i) => ids("col curie").includes(i)));
const sbrt = L.filter((e) => e.type === "sbrt").map((e) => e.id);
cas("« SBRT » = « SABR » ; « stéréo » aussi : tous les schémas de stéréotaxie", sbrt.length > 20 && sbrt.every((i) => ids("sabr").includes(i) && ids("stereo").includes(i)) && ids("sabr").join() === ids("sbrt").join());
cas("« post-op » = « adjuvant » (prostate : après prostatectomie)", ids("prostate post-op").includes("pro-postop-52-20") && ids("prostate adjuvant").join() === ids("prostate post-op").join() && ids("col post-op").includes("col-postop-45"));
cas("accents et ligature ignorés (« oesophage » trouve les schémas de l'Œsophage)", L.filter((e) => e.localisation_id === "oesophage").every((e) => ids("oesophage").includes(e.id)) && ids("œsophage").join() === ids("oesophage").join());
cas("essai cité (« CHHiP »)", ids("chhip").includes("pro-fav-60-20"));
cas("moins de 2 caractères : tout", chercher(L, "p", IDX).length === L.length);
cas("aucun résultat : le mot qui bloque (« prostate zzz » → « zzz »)", !ids("prostate zzz").length && motBloquant(L, "prostate zzz", IDX) === "zzz");
cas("termes à surligner : mot, synonyme, dose", termes("hypo 45 Gy").includes("hypofractionne") && termes("hypo 45 Gy").includes("45") && analyser("60 Gy 20 fx").fx[0] === 20);
const c = new Map(); let t = Date.now(); for (let i = 0; i < 20; i++) chercher(L, ["prostate 60", "col curie", "45 Gy", "sein hypo"][i % 4], IDX, c);
const ms = (Date.now() - t) / 20;
cas("rapidité : moins de 100 ms par recherche sur " + L.length + " schémas (" + ms.toFixed(1) + " ms)", ms < 100);

console.log("Calcul BED / EQD2 (cas de contrôle de la spécification : 1,8 Gy × 25 puis 9,0 Gy × 2)");
const B = calculBED({ lignes: [{ d: "1,8", n: "25" }, { d: 9, n: 2 }] });
const att = { eqd: ["96,4", "86,4", "72,7"], bed: ["225,0", "144,0", "87,3"], dN: ["3,00", "2,92", "2,74"], d1: ["99,0", "72,0", "53,1"], d2: ["126,0", "72,0", "34,2"] };
const pres = (v, s, dec) => Math.abs(v - Number(s.replace(",", "."))) <= 0.1 * Math.pow(10, -dec) * 10 / 10 + 1e-9 || fixe(v, dec) === s;
cas("total : 27 fractions · 63,0 Gy", B.total.n === 27 && fixe(B.total.dose, 1) === "63,0");
cas("EQD2 : 96,4 · 86,4 · 72,7", B.colonnes.every((k, i) => pres(k.eqd, att.eqd[i], 1)), B.colonnes.map((k) => fixe(k.eqd, 1)));
cas("BED : 225,0 · 144,0 · 87,3", B.colonnes.every((k, i) => pres(k.bed, att.bed[i], 1)), B.colonnes.map((k) => fixe(k.bed, 1)));
cas("dose par fraction en 25 fx : 3,00 · 2,92 · 2,74", B.colonnes.every((k, i) => pres(k.dN, att.dN[i], 2)), B.colonnes.map((k) => fixe(k.dN, 2)));
cas("détail : BED de 1,8 Gy × 25 = 99,0 · 72,0 · 53,1 ; de 9 Gy × 2 = 126,0 · 72,0 · 34,2", B.colonnes.every((k, i) => pres(k.detail[0], att.d1[i], 1) && pres(k.detail[1], att.d2[i], 1)));
const B2 = calculBED({ lignes: [{ d: 3, n: 20 }], ab: [3], x: 3, N: 20 });
cas("EQDx en 3 Gy/fx et dose en 20 fx d'un 60 Gy / 20 fx : 60 et 3 (α/β 3)", Math.abs(B2.colonnes[0].eqd - 60) < 1e-9 && Math.abs(B2.colonnes[0].dN - 3) < 1e-9);
cas("saisie : virgule ou point ; nul, négatif ou texte refusé", nombre("1,8") === 1.8 && nombre("1.8") === 1.8 && isNaN(nombre("0")) && isNaN(nombre("-2")) && isNaN(nombre("abc")) && isNaN(nombre("")));
const B3 = calculBED({ lignes: [{ d: "2", n: "30" }, { d: "x", n: "5" }] });
cas("ligne invalide ignorée (les autres comptent)", B3.valides.join() === "true,false" && B3.total.n === 30 && Math.abs(B3.colonnes[2].bed - 72) < 1e-9);
cas("sans saisie valable : « — » partout", calculBED({ lignes: [{ d: "", n: "" }] }).colonnes.every((k) => fixe(k.eqd, 1) === "—"));

console.log("\n" + ok + " réussi(s), " + ko + " échec(s)"); process.exit(ko ? 1 : 0);
