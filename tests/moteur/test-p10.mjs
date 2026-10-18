// P10 (audit n° 3, 18/10/2026) : interactions, adaptation hépatique, arrondi au flacon : node tests/moteur/test-p10.mjs. Données fictives.
import { interactions, foie, arrondiFlacon, flaconsPour, flaconsDe, lireFlacons, ecrireFlacons, FLACONS0 } from "../../public/js/moteur/p10.js";
let ok = 0, ko = 0;
const cas = (nom, v, d) => { if (v) { ok++; console.log("  ✔ " + nom); } else { ko++; console.log("  ✘ " + nom + (d === undefined ? "" : "  " + JSON.stringify(d).slice(0, 300))); } };

console.log("1. Interactions");
cas("EMEND (ordonnance liée) + AVK → INR", interactions({ prods: ["CISPLATINE"], texte: "Previscan 20 mg", ordos: ["Chimio : risque émétique élevé (cisplatine, dacarbazine)"] }).some((m) => /INR/.test(m)));
cas("EMEND + pilule → contraception non hormonale", interactions({ prods: ["DOXORUBICINE"], texte: "pilule oestroprogestative", ordos: ["Chimio : AC (anthracycline + cyclophosphamide)"] }).some((m) => /contraception/.test(m)));
cas("sans EMEND (CHEMOSET) + AVK : rien sur l'aprépitant", !interactions({ prods: ["CARBOPLATINE"], texte: "Sintrom", ordos: ["Chimio : carboplatine, Enhertu, Trodelvy"] }).some((m) => /aprépitant/.test(m)));
cas("erlotinib + oméprazole (OEDES) → absorption diminuée", interactions({ prods: ["TARCEVA (erlotinib) 150 mg cp"], texte: "OEDES 20 mg le matin" }).some((m) => /absorption/.test(m)));
cas("imatinib + rifampicine → inducteur ; + clarithromycine → inhibiteur", interactions({ prods: ["IMATINIB 100 mg cp"], texte: "Rifadine" }).some((m) => /inducteur/.test(m)) && interactions({ prods: ["IMATINIB"], texte: "clarithromycine" }).some((m) => /CYP3A4/.test(m)));
cas("méthotrexate + AINS et Bactrim → élimination diminuée", interactions({ prods: [{ p: "MÉTHOTREXATE haute dose" }], texte: "ibuprofène ; Bactrim forte" }).some((m) => /AINS.*cotrimoxazole/.test(m)));
cas("ribociclib + ondansétron de la séance → QT", interactions({ prods: ["KISQALI (ribociclib)", "ONSET (ondansétron)"], texte: "" }).some((m) => /QT/.test(m)));
cas("rien à signaler : aucune interaction", !interactions({ prods: ["PACLITAXEL", "CARBOPLATINE"], texte: "Doliprane", ordos: [] }).length);

console.log("2. Foie");
cas("vinorelbine, bilirubine 2 × N → 50 %", foie({ prods: [{ p: "VINORELBINE" }], bio: { bili: 24 }, crU: "mgL" }).some((m) => /50 %/.test(m)));
cas("gemcitabine, bilirubine 1,6 × N → 800 mg/m²", foie({ prods: [{ p: "GEMCITABINE" }], bio: { bili: 33 }, crU: "umol" }).some((m) => /800 mg/.test(m)));
cas("sunitinib, transaminases 4 × N → interrompre ou réduire ; 6 × N → suspendre", foie({ prods: [{ p: "SUTENT (sunitinib)" }], bio: { asat: 160 } }).some((m) => /interrompre ou réduire/.test(m)) && foie({ prods: [{ p: "SUNITINIB" }], bio: { alat: 250 } }).some((m) => /suspendre/.test(m)));
cas("bilan normal : rien ; pas de bilan : rien", !foie({ prods: [{ p: "VINORELBINE" }], bio: { bili: 8, asat: 30 }, crU: "mgL" }).length && !foie({ prods: [{ p: "VINORELBINE" }], bio: {} }).length);

console.log("3. Arrondi au flacon");
const a = arrondiFlacon("CARBOPLATINE", 515);
cas("carboplatine 515 mg → 500 mg (flacons de 50 mg, −2,9 %)", a && a.dose === 500 && a.ecart === -2.9, a);
cas("écart > 5 % : pas de proposition (paclitaxel 47 mg → 60 serait +28 %)", arrondiFlacon("PACLITAXEL", 47) === null);
cas("dose déjà ronde ou molécule sans flacons connus : rien", arrondiFlacon("CARBOPLATINE", 450) === null && arrondiFlacon("PEMBROLIZUMAB", 200) === null);
cas("flacons pour 515 mg de carboplatine : 1 × 450 + 2 × 50", flaconsPour("CARBOPLATINE", 515) === "1 × 450 mg + 2 × 50 mg", flaconsPour("CARBOPLATINE", 515));
cas("5-FU diffuseur reconnu (« 5-FU »)", !!flaconsDe("5-FU diffuseur"));
const T = lireFlacons("CARBOPLATINE : 50, 150, 450\nOXALIPLATINE: 50 ; 100");
cas("réglage du cabinet lu et réécrit", T.CARBOPLATINE.length === 3 && T.OXALIPLATINE[1] === 100 && lireFlacons(ecrireFlacons(FLACONS0)).CISPLATINE.length === 3);
cas("table du cabinet utilisée à la place de celle de départ", arrondiFlacon("CARBOPLATINE", 515, { CARBOPLATINE: [10] }).dose === 520 && arrondiFlacon("CARBOPLATINE", 512, { CARBOPLATINE: [25] }).dose === 500);

console.log("\n" + ok + " / " + (ok + ko) + " vérifications justes");
if (ko) process.exit(1);
