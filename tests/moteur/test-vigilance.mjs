// Vigilance par molécule (12/10/2026), sans navigateur ni donnée réelle : node tests/moteur/test-vigilance.mjs
// Séances et patients fictifs, écrits ici.
import { vigilances, historique, cumuls, examensProposes, horsNorme, vesicant, notesPour, VIG0, avec } from "../../public/js/moteur/vigilance.js";
import { calcul } from "../../public/js/moteur/doses.js";

let ok = 0, ko = 0;
const cas = (nom, v, d) => { if (v) { ok++; console.log("  ✔ " + nom); } else { ko++; console.log("  ✘ " + nom + (d === undefined ? "" : "  " + JSON.stringify(d).slice(0, 600))); } };
const P = (p, dose, u) => ({ p, u: u || "mg/m²", dose, v: dose });
// Séance validée fictive (historique) : date, doses, surface, bilan
const S = (d, doses, bio, sc) => ({ cle: "x|" + d, d, doses, sc: sc || 2, bio: bio || {} });
const base = (o) => Object.assign({ n: 0, k: 1, sc: 2, cl: 90, creatSaisie: true, crU: "mgL", bio: {}, histo: [S("2026-09-01", [P("CARBOPLATINE", 500, "AUC")])], date: "2026-10-12", patient: { sexe: "H", age: 60, texte: "" }, rts: [] }, o);
const contient = (l, t) => l.some((m) => m.indexOf(t) >= 0);

console.log("1. Rien à signaler");
cas("carboplatine seul, historique : aucune vigilance", vigilances(base({ prods: [P("CARBOPLATINE", 500, "AUC")] })).length === 0, vigilances(base({ prods: [P("CARBOPLATINE", 500, "AUC")] })));
cas("prémédication seule : aucune vigilance", vigilances(base({ prods: [P("DEXAMETHASONE", 8, "mg"), P("ONDANSETRON", 8, "mg")] })).length === 0);

console.log("2. 1er traitement");
const t1 = vigilances(base({ histo: [], prods: [P("CARBOPLATINE", 500, "AUC")], patient: { sexe: "F", age: 40, texte: "" } }));
cas("hépatite B, vaccins vivants, grossesse (femme de 40 ans)", contient(t1, "hépatite B") && contient(t1, "grossesse"), t1);
cas("pas de grossesse pour un homme", !contient(vigilances(base({ histo: [], prods: [P("CARBOPLATINE", 500, "AUC")] })), "grossesse"));

console.log("3. Doses cumulées");
// doxorubicine 60 mg/m² × 6 séances déjà faites = 360 ; + 60 ce jour = 420 (93 %) → alerte ; épirubicine compte pour moitié
const doxo = (d) => S(d, [P("DOXORUBICINE", 120)]);
const h6 = ["2026-05-01", "2026-05-22", "2026-06-12", "2026-07-03", "2026-07-24", "2026-08-14"].map(doxo);
const c = cumuls({ prods: [P("DOXORUBICINE", 120)], sc: 2, histo: h6, date: "2026-10-12" })[0];
cas("doxorubicine : 360 avant + 60 = 420 mg/m², 93 %", c && c.avant === 360 && c.total === 420 && c.pct === 93, c);
const vd = vigilances(base({ histo: h6, prods: [P("DOXORUBICINE", 120)], bio: { fevg: 60 } }));
cas("alerte au-delà de 80 % du seuil", contient(vd, "dose cumulée d'anthracyclines") && contient(vd, "420 mg/m²"), vd);
const h7 = h6.concat([doxo("2026-09-04")]), v7 = vigilances(base({ histo: h7, prods: [P("DOXORUBICINE", 120)], bio: { fevg: 60 } }));
cas("seuil de 450 atteint : message « atteint ou dépassé »", contient(v7, "atteint ou dépassé"), v7);
const ce = cumuls({ prods: [P("ÉPIRUBICINE", 200)], sc: 2, histo: [], date: "2026-10-12" })[0];
cas("épirubicine 100 mg/m² = 80 en équivalent doxorubicine (× 0,8, Feijen 2019 ; S5 du 21/10/2026)", ce && ce.total === 80, ce);
cas("Caelyx (liposomale pégylée) non compté", cumuls({ prods: [P("DOXORUBICINE LIPOSOMALE PÉGYLÉE (Caelyx)", 80)], sc: 2, histo: [] }).length === 0);
cas("séances datées après la séance affichée non comptées", cumuls({ prods: [P("DOXORUBICINE", 120)], sc: 2, histo: [doxo("2026-11-01")], date: "2026-10-12" })[0].avant === 0);
const ox = Array.from({ length: 9 }, (_, i) => S("2026-0" + (1 + Math.floor(i / 2)) + "-1" + (i % 2), [P("OXALIPLATINE", 170)]));
const vo = vigilances(base({ histo: ox, prods: [P("OXALIPLATINE", 170)] }));
cas("oxaliplatine : 9 × 85 + 85 = 850 mg/m² → neuropathie", contient(vo, "oxaliplatine : 850") && contient(vo, "neuropathie"), vo);
const vo8 = vigilances(base({ histo: ox.slice(1), prods: [P("OXALIPLATINE", 170)] }));
cas("oxaliplatine à 765 : rien (alerte au seuil seulement)", !contient(vo8, "oxaliplatine"), vo8);

console.log("4. Cœur (FEVG)");
cas("1re anthracycline sans FEVG → à faire", contient(vigilances(base({ prods: [P("DOXORUBICINE", 120)] })), "1re anthracycline"));
cas("1re anthracycline avec FEVG du jour → rien sur la FEVG", !contient(vigilances(base({ prods: [P("DOXORUBICINE", 120)], bio: { fevg: 62 } })), "FEVG"));
const her = [P("HERCEPTIN (trastuzumab)", 400, "mg/kg")];
cas("trastuzumab sans FEVG notée", contient(vigilances(base({ prods: her })), "FEVG non notée"));
const hF = [S("2026-06-01", her, { fevg: 60 })];
cas("trastuzumab, dernière FEVG le 01/06 (> 3 mois)", contient(vigilances(base({ prods: her, histo: hF })), "plus de 3 mois"));
cas("trastuzumab, FEVG du 01/08 : rien", !contient(vigilances(base({ prods: her, histo: [S("2026-08-01", her, { fevg: 60 })] })), "FEVG"));
const vf = vigilances(base({ prods: her, histo: hF, bio: { fevg: 45 } }));
cas("FEVG 45 % : moins de 50 % et baisse de 15 points", contient(vf, "moins de 50") && contient(vf, "baisse de 15 points"), vf);

console.log("5. Fluoropyrimidines");
const fu = [P("5-FU bolus", 800)];
cas("1re dose de 5-FU → uracilémie", contient(vigilances(base({ prods: fu })), "uracilémie"));
cas("5-FU déjà reçu → plus d'uracilémie", !contient(vigilances(base({ prods: fu, histo: [S("2026-09-01", [P("5-FLUORO-URACILE", 800)])] })), "uracilémie"));
cas("capécitabine + Sintrom → INR", contient(vigilances(base({ prods: [P("CAPÉCITABINE (Xeloda)", 2000)], patient: { sexe: "H", age: 70, texte: "AC/FA sous Sintrom" } })), "INR"));
cas("« Retrait du diffuseur 5-FU » (texte) ne compte pas", !contient(vigilances(base({ prods: [{ p: "Retrait du diffuseur 5-FU", u: "txt" }] })), "uracilémie"));

console.log("6. Foie, thyroïde, rein, TA");
const doc = [P("DOCÉTAXEL", 150)];
cas("docétaxel, bilirubine 15 mg/L (> 12)", contient(vigilances(base({ prods: doc, bio: { bili: 15 } })), "docétaxel".toUpperCase()) || contient(vigilances(base({ prods: doc, bio: { bili: 15 } })), "DOCÉTAXEL"));
cas("docétaxel, bilirubine 15 µmol/L (< 20) : rien", vigilances(base({ prods: doc, crU: "umol", bio: { bili: 15 } })).length === 0, vigilances(base({ prods: doc, crU: "umol", bio: { bili: 15 } })));
const ke = [P("KEYTRUDA (pembrolizumab)", 200, "mg")];
cas("pembrolizumab sans TSH → jamais notée", contient(vigilances(base({ prods: ke })), "TSH jamais notée"));
cas("pembrolizumab, TSH 12 → dysthyroïdie", contient(vigilances(base({ prods: ke, bio: { tsh: 12 } })), "dysthyroïdie"));
cas("pembrolizumab, TSH du 10/09 (< 6 semaines) : rien", vigilances(base({ prods: ke, histo: [S("2026-09-10", ke, { tsh: 2 })] })).length === 0, vigilances(base({ prods: ke, histo: [S("2026-09-10", ke, { tsh: 2 })] })));
cas("pembrolizumab, ALAT 150 → hépatite", contient(vigilances(base({ prods: ke, bio: { tsh: 2, alat: 150 } })), "hépatite"));
const itk = [P("SUTENT (sunitinib) 50 mg", 50, "mg")];
cas("sunitinib sans créatinine du jour → DFG à contrôler", contient(vigilances(base({ prods: itk, creatSaisie: false, bio: { tsh: 2 } })), "DFG à contrôler"));
cas("osimertinib avec créatinine : pas de DFG", !contient(vigilances(base({ prods: [P("OSIMERTINIB 80 mg cp", 80, "mg")] })), "DFG"));
cas("sunitinib, TA 170/95 → HTA", contient(vigilances(base({ prods: itk, bio: { tsh: 2, ta: "170/95" } })), "HTA"));
const bev = [P("YPEVA (bévacizumab)", 1000, "mg/kg")], hb = [S("2026-09-20", bev)];
cas("bévacizumab sans TA ni protéinurie", contient(vigilances(base({ prods: bev, histo: hb })), "tension artérielle et protéinurie non notées"));
cas("bévacizumab, protéinurie ++", contient(vigilances(base({ prods: bev, histo: hb, bio: { ta: "130/80", prot: "++" } })), "24 heures"));
cas("bévacizumab, TA et protéinurie normales : rien", vigilances(base({ prods: bev, histo: hb, bio: { ta: "130/80", prot: "0,2" } })).length === 0, vigilances(base({ prods: bev, histo: hb, bio: { ta: "130/80", prot: "0,2" } })));
cas("1re dose de bévacizumab → chirurgie", contient(vigilances(base({ prods: bev, bio: { ta: "130/80", prot: "0" } })), "chirurgie"));

console.log("7. Autres molécules");
cas("cétuximab, magnésium 14 mg/L (0,58 mmol/L) → bas", contient(vigilances(base({ prods: [P("ERBITUX (cétuximab)", 500)], histo: [S("2026-09-01", [P("ERBITUX (cétuximab)", 500)])], bio: { mg: 14 } })), "magnésium bas"));
cas("1re dose d'anti-EGFR → RAS", contient(vigilances(base({ prods: [P("VECTIBIX (panitumumab)", 400, "mg/kg")] })), "RAS"));
cas("1re dose de Zometa (prémédication) → bilan dentaire", contient(vigilances(base({ prods: [P("ZOMETA (acide zolédronique)", 4, "mg")] })), "dentaire"));
cas("Xgeva, calcémie 80 mg/L → basse", contient(vigilances(base({ prods: [P("XGEVA (dénosumab)", 120, "mg")], histo: [S("2026-09-01", [P("XGEVA (dénosumab)", 120, "mg")])], bio: { ca: 80 } })), "calcémie basse"));
const pem = [P("PÉMÉTREXED (Alimta)", 1000)];
cas("1re dose de pémétrexed → vitamines", contient(vigilances(base({ prods: pem })), "acide folique"));
cas("pémétrexed C4 → vitamine B12", contient(vigilances(base({ prods: pem, k: 3, histo: [S("2026-09-01", pem)] })), "B12"));
cas("pémétrexed, clairance 70 → AINS", contient(vigilances(base({ prods: pem, cl: 70, histo: [S("2026-09-01", pem)] })), "AINS"));
cas("ribociclib C1 → NFS J15 et ECG", contient(vigilances(base({ prods: [P("RIBOCICLIB (Kisqali) 200 mg", 600, "mg")], k: 0 })), "ECG"));
cas("palbociclib C3 : rien", vigilances(base({ prods: [P("PALBOCICLIB (Ibrance)", 125, "mg")], k: 2, bio: {} })).length === 0, vigilances(base({ prods: [P("PALBOCICLIB (Ibrance)", 125, "mg")], k: 2 })));
cas("1re dose d'irinotécan → lopéramide", contient(vigilances(base({ prods: [P("IRINOTÉCAN", 360)] })), "lopéramide"));
cas("vincristine 2,8 mg → plafond", contient(vigilances(base({ prods: [P("VINCRISTINE", 2.8)] })), "plafond"));
cas("calcul : vincristine 1,4 mg/m² × 2 m² sans plafond au protocole → 2 mg", calcul({ p: "VINCRISTINE", u: "mg/m²", d: 1.4 }, { sc: 2 }) === 2, calcul({ p: "VINCRISTINE", u: "mg/m²", d: 1.4 }, { sc: 2 }));
cas("calcul : vinorelbine non plafonnée", calcul({ p: "VINORELBINE", u: "mg/m²", d: 25 }, { sc: 2 }) === 50);

console.log("8. Radiothérapie en cours");
const gem = [P("GEMCITABINE", 600)], rts = [{ deb: "2026-10-01", fin: "2026-11-10" }];
cas("gemcitabine pendant la radiothérapie → radiosensibilisant", contient(vigilances(base({ prods: gem, rts })), "radiosensibilisant"));
cas("une seule fois par radiothérapie", !contient(vigilances(base({ prods: gem, rts, histo: [S("2026-10-05", gem)] })), "radiothérapie en cours"));
cas("radiothérapie terminée : rien", !contient(vigilances(base({ prods: gem, rts: [{ deb: "2026-08-01", fin: "2026-09-10" }] })), "radiothérapie"));
cas("témozolomide → pneumocystose", contient(vigilances(base({ prods: [P("TÉMOZOLOMIDE (Temodal)", 150)], rts })), "pneumocystose"));

console.log("8 bis. Allergie (3.2)");
cas("allergie au platine : carboplatine signalé", contient(vigilances(base({ prods: [P("CARBOPLATINE", 500, "AUC")], patient: { sexe: "H", age: 60, texte: "", allergie: "Sels de platine (carboplatine)" } })), "allergie connue"));
cas("sans allergie cochée : rien", vigilances(base({ prods: [P("CARBOPLATINE", 500, "AUC")], patient: { sexe: "H", age: 60, texte: "", allergie: "" } })).length === 0);
console.log("9. Outils");
cas("examens proposés : docétaxel + trastuzumab (PAL ajoutée le 18/10 : seuil du docétaxel)", JSON.stringify(examensProposes([P("DOCÉTAXEL", 1), P("HERCEPTIN (trastuzumab)", 1)])) === JSON.stringify(["bili", "asat", "alat", "fevg", "pal"]), examensProposes([P("DOCÉTAXEL", 1), P("HERCEPTIN (trastuzumab)", 1)]));
cas("hors norme : TA 165/90, FEVG 45, TSH 2 normale", horsNorme("ta", "165/90") && horsNorme("fevg", 45) && !horsNorme("tsh", 2));
cas("vésicants : épirubicine oui, Caelyx et paclitaxel non", vesicant("ÉPIRUBICINE") && !vesicant("DOXORUBICINE LIPOSOMALE PÉGYLÉE (Caelyx)") && !vesicant("PACLITAXEL"));
cas("notes : Herceptin → Anti-HER2", notesPour([P("HERCEPTIN (trastuzumab)", 1)], VIG0).map((n) => n.nom).join() === "Anti-HER2", notesPour([P("HERCEPTIN (trastuzumab)", 1)], VIG0).map((n) => n.nom));
cas("iTK reconnus : imatinib, lapatinib ; pas le palbociclib", avec([P("IMATINIB 100 mg cp", 1, "mg")], "itk") && avec([P("TYKERB (lapatinib) 250 mg", 1, "mg")], "itk") && !avec([P("PALBOCICLIB", 1, "mg")], "itk"));
const L = [{ id: "L1", cures: [{ st: "recue", reelle: "2026-09-01", fige: { sc: 2, doses: { "a@1": P("DOXORUBICINE", 120) }, bio: { fevg: 60 } }, sea: { 8: { st: "recue", d: "2026-09-08", fige: { sc: 2, doses: {} } } } }, { st: "prevue" }] }];
const H = historique(L, "L1|0|8");
cas("historique : séances validées, séance exclue retirée", H.length === 1 && H[0].d === "2026-09-01" && H[0].bio.fevg === 60, H);

console.log("\n" + ok + " réussis, " + ko + " échoués");
process.exit(ko ? 1 : 0);
