// Protocoles de chimiothérapie demandés par le référentiel de radiothérapie (25/10/2026, demande de Dr Bentahila : « crée les protocoles manquants
// selon les recommandations, puis lie-les à Ouvrir dans Protocoles »). Créés une fois par bibliothèque (moteur/protocolesrt.js, drapeau rtref1),
// « Validé » sans mention, jamais en double d'un protocole du même nom. Règles de la bibliothèque : Solumedrol 60 mg avec le cisplatine sur 1 jour,
// 50 mg par jour avec le cisplatine sur plusieurs jours, 80 mg avec le cisplatine hebdomadaire + RT ; aucun anti-H1 ; ONSET avant toute chimiothérapie
// émétisante ; hydratation du cisplatine ; seuils du jour et ordonnances liées de la bibliothèque. Doses vérifiées sur la publication citée en source.
const ONSET = (j) => ({ p: "ONSET (ondansétron) 8 mg/4 ml inj.", u: "mg", d: 8, j, n: "30 min avant la chimiothérapie", v: "IV", s: "NaCl 0,9 % 50 ml", t: "15 min" });
const ONSET_PO = (j, jl) => Object.assign({ p: "ONSET (ondansétron) 8 mg cp", u: "mg", d: 8, j, v: "Per os", t: "1 h avant" }, jl ? { jl } : {});
const SOLU = (d, j) => ({ p: "SOLUMEDROL (méthylprednisolone) inj.", u: "mg", d, j, n: "30 min avant la chimiothérapie", v: "IV", s: "NaCl 0,9 % 50 ml", t: "15 min" });
const HYDR_AV = (j, pos) => ({ p: "HYDRATATION AVANT CISPLATINE : NaCl 0,9 %", u: "txt", pos, dt: pos, j, n: "en 1 h, avant le cisplatine", v: "IV" });
const HYDR_AP = (j, pos) => ({ p: "HYDRATATION APRÈS CISPLATINE : NaCl 0,9 %", u: "txt", pos, dt: pos, j, n: "en 1 h, après le cisplatine ; diurèse ≥ 100 ml/h", v: "IV" });
const NIVESTIM = { p: "NIVESTIM 30 MU (filgrastim)", u: "txt", j: [99], jl: "Selon prescription", v: "SC", pos: "30 MU / injection SC (48 MU au-dessus de 70 kg)", dt: "× ____ injection(s)", inp: 1, nd: 1 };
const S_CIS = "Cisplatine : DFG ≥ 60 ml/min (45-59 : réduire ou carboplatine) ; magnésémie et audition avant chaque cure";
const S_HEBDO = "Séances hebdomadaires (J8, J15…) : PNN ≥ 1,0 G/L et plaquettes ≥ 75 G/L";
const S_5FU = "5-FU : uracilémie (DPD) avant la 1re cure ; mucite ou diarrhée de grade ≥ 2 → report";
const S_CAPE = "Capécitabine : DFG 30-50 ml/min → 75 % ; < 30 contre-indiquée ; uracilémie (DPD) avant la 1re cure";
const S_NFS = "PNN ≥ 1,5 G/L et plaquettes ≥ 100 G/L avant chaque cycle";
const O_ELEVE = "Chimio : risque émétique élevé (cisplatine, dacarbazine)", O_MULTI = "Chimio : cisplatine sur plusieurs jours (BEP, EP, VIP…)";
const O_CAPE = "Chimio – Capécitabine : mains-pieds et diarrhée", O_ORAL = "Chimio – Antiémétique avant une chimiothérapie orale", O_FIEVRE = "Chimio – Fièvre sous chimiothérapie : conduite à tenir";
const O_DOCE = "Chimio – Prémédication docétaxel (à prendre à domicile)";
const ids = (L) => L.map((d, i) => Object.assign({ id: "d" + i }, d));
const H7 = [1, 8, 15, 22, 29, 36, 43];

export const PROTOCOLES_RT = [
  { id: "rtref|tpf-nasopharynx-sun", nom: "TPF d'induction : Docétaxel 60 + Cisplatine 60 J1 + 5-FU 600 J1-J5 / 21 j × 3 (nasopharynx)", c: 21, nbc: 3, dos: "Tête et cou", loc: "Nasopharynx",
    r: "J1 à J5, tous les 21 jours × 3, puis radiochimiothérapie par cisplatine 100 mg/m² J1-J22-J43",
    dr: ids([ONSET([1]), SOLU(60, [1]), HYDR_AV([1], "1000 ml + KCl 1,5 g + MgSO4 2 g"), HYDR_AP([1], "1000 ml"),
      { p: "DOCÉTAXEL", u: "mg/m²", d: 60, j: [1], v: "IV", s: "NaCl 0,9 % 250 ml", t: "1 h" },
      { p: "CISPLATINE", u: "mg/m²", d: 60, j: [1], v: "IV", s: "NaCl 0,9 % 500 ml", t: "1 h" },
      { p: "5-FLUORO-URACILE", u: "mg/m²", d: 600, j: [1], jl: "J1 → J5", n: "/j en continu (diffuseur 120 h)", v: "IV continu", t: "120 h" }, NIVESTIM]),
    no: ["Docétaxel : prémédication par corticoïde la veille et le lendemain (ordonnance liée)", "Puis cisplatine 100 mg/m² J1-J22-J43 avec la radiothérapie"],
    ind: [["Tête et cou", "Nasopharynx", "Induction", ""]], src: "Sun 2016, Lancet Oncol (TPF d'induction, nasopharynx localement avancé)",
    seuils: [S_CIS, S_5FU, "Docétaxel : bilirubine ≤ normale ; ne pas faire si ASAT/ALAT > 1,5 × N avec PAL > 2,5 × N"], ordos: [O_ELEVE, O_DOCE, O_FIEVRE] },
  { id: "rtref|cisplatine-30-hebdo-rt", nom: "Cisplatine 30 mg/m² hebdomadaire + Radiothérapie (nasopharynx)", c: 0, nbc: 1, dos: "Tête et cou", loc: "Nasopharynx",
    r: "Chaque semaine pendant la radiothérapie (7 semaines)",
    dr: ids([ONSET(H7), SOLU(80, H7), HYDR_AV(H7, "1000 ml + KCl 1 g + MgSO4 1 g"), HYDR_AP(H7, "500 ml"), { p: "CISPLATINE", u: "mg/m²", d: 30, j: H7, v: "IV", s: "NaCl 0,9 % 250 ml", t: "1 h" }]),
    no: ["Stade II (T1-2 N1, T2 N0 avec facteurs de risque)"], ind: [["Tête et cou", "Nasopharynx", "Radiochimiothérapie", ""]], src: "Chen 2011, J Natl Cancer Inst (nasopharynx de stade II)",
    seuils: [S_CIS, S_HEBDO], ordos: [O_ELEVE] },
  { id: "rtref|gemcitabine-preopanc", nom: "Gemcitabine 1000 mg/m² J1-J8-J15 / 28 j, radiothérapie 36 Gy / 15 fx au 2e cycle (PREOPANC)", c: 28, nbc: 3, dos: "Digestif", loc: "Pancréas",
    r: "J1, J8, J15 tous les 28 jours : 3 cycles avant la chirurgie, la radiothérapie (36 Gy / 15 fx) pendant le 2e ; puis 4 cycles après la chirurgie",
    dr: ids([ONSET([1, 8, 15]), SOLU(40, [1, 8, 15]), { p: "GEMCITABINE", u: "mg/m²", d: 1000, j: [1, 8, 15], v: "IV", s: "NaCl 0,9 % 250 ml", t: "30 min" }]),
    no: ["Puis 4 cycles adjuvants de gemcitabine (même schéma)"], ind: [["Digestif", "Pancréas", "Néoadjuvant", ""]], src: "PREOPANC (Versteijne 2020, J Clin Oncol ; 2022)",
    seuils: [S_HEBDO, "Gemcitabine : bilirubine ≤ 1,5 × N"], ordos: [] },
  { id: "rtref|gemcitabine-capecitabine-s0809", nom: "Gemcitabine 1000 J1-J8 + Capécitabine 750 × 2/j J1-J14 / 21 j × 4, puis capécitabine + radiothérapie (SWOG S0809)", c: 21, nbc: 4, dos: "Digestif", loc: "Voies biliaires / vésicule",
    r: "Gemcitabine J1 et J8, capécitabine J1 → J14, tous les 21 jours × 4 ; puis capécitabine 665 mg/m² × 2/j pendant la radiothérapie (fiche liée)",
    dr: ids([ONSET([1, 8]), SOLU(40, [1, 8]), { p: "GEMCITABINE", u: "mg/m²", d: 1000, j: [1, 8], v: "IV", s: "NaCl 0,9 % 250 ml", t: "30 min" },
      { p: "CAPÉCITABINE (Xeloda)", u: "mg/m²", d: 750, j: [1], jl: "J1 → J14", n: "matin et soir (1500 mg/m²/j), dans les 30 min après le repas", v: "Per os" }]),
    no: ["Capécitabine : arrondir aux comprimés de 150 / 500 mg", "Cholangiocarcinome extrahépatique ou vésicule, pT2-4 ou N+ ou R1"], ind: [["Digestif", "Voies biliaires / vésicule", "Adjuvant", ""]], src: "SWOG S0809 (Ben-Josef 2015, J Clin Oncol)",
    seuils: [S_HEBDO, S_CAPE], ordos: [O_CAPE] },
  { id: "rtref|capecitabine-rt-s0809", nom: "Capécitabine 665 mg/m² × 2/j + Radiothérapie (SWOG S0809)", c: 0, nbc: 1, dos: "Digestif", loc: "Voies biliaires / vésicule",
    r: "Matin et soir, 7 jours sur 7, pendant toute la radiothérapie (45 Gy + complément)",
    dr: ids([{ p: "CAPÉCITABINE (Xeloda)", u: "mg/m²", d: 665, j: [1], jl: "J1 → fin de la RT (7 j/7)", n: "matin et soir (1330 mg/m²/j), dans les 30 min après le repas", v: "Per os" }]),
    no: ["Après 4 cycles de gemcitabine-capécitabine"], ind: [["Digestif", "Voies biliaires / vésicule", "Adjuvant", ""]], src: "SWOG S0809 (Ben-Josef 2015, J Clin Oncol)",
    seuils: [S_CAPE], ordos: [O_CAPE] },
  { id: "rtref|lomustine-temozolomide-ceteg", nom: "CeTeG : Lomustine 100 J1 + Témozolomide 100 à 200 J2-J6 / 42 j × 6 (glioblastome MGMT méthylé)", c: 42, nbc: 6, dos: "Neurologie", loc: "Gliomes",
    r: "Lomustine J1, témozolomide J2 → J6, tous les 42 jours × 6 ; le 1er cycle commence avec la radiothérapie (60 Gy / 30 fx)",
    dr: ids([ONSET_PO([1], "J1 → J6"), { p: "LOMUSTINE (Bélustine)", u: "mg/m²", d: 100, j: [1], v: "Per os", t: "au coucher, à jeun" },
      { p: "TÉMOZOLOMIDE (Temodal)", u: "mg/m²", d: 100, j: [2], jl: "J2 → J6", n: "/j, à jeun ; 100 mg/m² puis jusqu'à 200 mg/m² selon la tolérance", v: "Per os" }]),
    no: ["Prophylaxie de la pneumocystose (cotrimoxazole)", "NFS à J21, J28 et J42 (nadir tardif)"], ind: [["Neurologie", "Gliomes", "Glioblastome nouvellement diagnostiqué", ""]], src: "CeTeG / NOA-09 (Herrlinger 2019, Lancet)",
    seuils: [S_NFS, "Transaminases ≤ 2,5 × N"], ordos: [O_ORAL] },
  { id: "rtref|vorasidenib", nom: "Vorasidenib 40 mg/j (gliome de grade 2 IDH muté)", c: 28, nbc: 12, dos: "Neurologie", loc: "Gliomes",
    r: "1 prise par jour en continu, cycles de 28 jours",
    dr: ids([{ p: "VORANIGO (vorasidenib) 40 mg cp", u: "mg", d: 40, j: [1], jl: "J1 → J28 (continu)", n: "à jeun, au moins 1 h avant ou 2 h après un repas", v: "Per os", t: "28 jours" }]),
    no: ["Résidu ou récidive après chirurgie seule, sans radiothérapie ni chimiothérapie antérieure", "Bilan hépatique toutes les 2 semaines les 2 premiers mois"], ind: [["Neurologie", "Gliomes", "Gliome de bas grade", ""]], src: "INDIGO (Mellinghoff 2023, N Engl J Med)",
    seuils: ["ASAT / ALAT ≤ 3 × N ; bilirubine ≤ 1,5 × N"], ordos: [] },
  { id: "rtref|vincristine-csi", nom: "Vincristine 1,5 mg/m² hebdomadaire pendant l'irradiation craniospinale (médulloblastome)", c: 0, nbc: 1, dos: "Neurologie", loc: "Médulloblastome",
    r: "Chaque semaine pendant l'irradiation craniospinale (8 injections au plus)",
    dr: ids([{ p: "VINCRISTINE", u: "mg/m²", d: 1.5, dec: 1, max: 2, j: [1, 8, 15, 22, 29, 36, 43, 50], v: "IV", s: "NaCl 0,9 % 50 ml", t: "10 min" }]),
    no: ["Vincristine plafonnée à 2 mg (calcul automatique) ; vésicant, voie sûre", "Puis chimiothérapie d'entretien lomustine-cisplatine-vincristine (fiche liée)"], ind: [["Neurologie", "Médulloblastome", "Radiochimiothérapie", ""]], src: "NOA-07 (von Bueren 2016, Neuro Oncol) ; Packer 2006",
    seuils: ["Neuropathie de grade ≥ 2 : suspendre", S_HEBDO], ordos: [] },
  { id: "rtref|lomustine-cisplatine-vincristine", nom: "Lomustine 75 + Cisplatine 70 J1 + Vincristine 1,5 J1-J8-J15 / 42 j × 8 (entretien, médulloblastome)", c: 42, nbc: 8, dos: "Neurologie", loc: "Médulloblastome",
    r: "Lomustine et cisplatine J1, vincristine J1, J8, J15, tous les 42 jours × 8, 6 semaines après l'irradiation",
    dr: ids([ONSET([1]), SOLU(60, [1]), HYDR_AV([1], "1000 ml + KCl 1,5 g + MgSO4 2 g"), HYDR_AP([1], "1000 ml"),
      { p: "CISPLATINE", u: "mg/m²", d: 70, j: [1], v: "IV", s: "NaCl 0,9 % 500 ml", t: "1 h" }, { p: "LOMUSTINE (Bélustine)", u: "mg/m²", d: 75, j: [1], v: "Per os", t: "au coucher, à jeun" },
      { p: "VINCRISTINE", u: "mg/m²", d: 1.5, dec: 1, max: 2, j: [1, 8, 15], v: "IV", s: "NaCl 0,9 % 50 ml", t: "10 min" }]),
    no: ["Vincristine plafonnée à 2 mg (calcul automatique)", "Audiogramme avant chaque cycle ; NFS à J28 et J42"], ind: [["Neurologie", "Médulloblastome", "Entretien", ""]], src: "Packer 2006 (J Clin Oncol) ; NOA-07 ; HIT 2000",
    seuils: [S_CIS, S_NFS], ordos: [O_ELEVE, O_FIEVRE] },
  { id: "rtref|memantine-encephale", nom: "Mémantine 20 mg/j pendant 24 semaines (encéphale in toto)", c: 0, nbc: 1, dos: "Neurologie", loc: "Métastases cérébrales",
    r: "Commencée avec l'irradiation de l'encéphale, poursuivie 24 semaines",
    dr: ids([{ p: "EBIXA (mémantine) 10 mg cp", u: "txt", pos: "Semaine 1 : 5 mg/j ; semaine 2 : 10 mg/j ; semaine 3 : 15 mg/j ; puis 20 mg/j jusqu'à la 24e semaine", dt: "24 semaines", j: [1], v: "Per os" }]),
    no: ["DFG < 30 ml/min : 10 mg/j au plus"], ind: [["Neurologie", "Métastases cérébrales", "Encéphale in toto", ""]], src: "RTOG 0614 (Brown 2013, Neuro Oncol) ; NRG CC001",
    seuils: [], ordos: [] },
  { id: "rtref|5fu-hydroxyuree-reirradiation", nom: "5-FU 300 mg/m² J1-J5 + Hydroxyurée 1,5 g/j + Réirradiation 1,5 Gy × 2/j, 1 semaine sur 2 × 4 (RTOG 9610)", c: 14, nbc: 4, dos: "Tête et cou", loc: "VADS",
    r: "J1 à J5 avec la réirradiation (1,5 Gy deux fois par jour), puis 9 jours de pause ; 4 cycles",
    dr: ids([ONSET([1, 2, 3, 4, 5]), { p: "5-FLUORO-URACILE", u: "mg/m²", d: 300, j: [1], jl: "J1 → J5", n: "/j en bolus", v: "IV", s: "NaCl 0,9 % 50 ml", t: "15 min" },
      { p: "HYDREA (hydroxyurée) 500 mg gél.", u: "mg", d: 1500, j: [1], jl: "J1 → J5", n: "/j", v: "Per os" }]),
    no: ["Réirradiation : récidive ou second cancer en territoire irradié, non opérable"], ind: [["Tête et cou", "VADS", "Récidivant / métastatique", "Réirradiation"]], src: "RTOG 9610 (Spencer 2008, Head Neck)",
    seuils: [S_NFS, S_5FU], ordos: [O_FIEVRE] },
  { id: "rtref|cisplatine-paclitaxel-rtog9911", nom: "Cisplatine 15 + Paclitaxel 20 J1-J5 / 14 j × 4 + Réirradiation 1,5 Gy × 2/j (RTOG 9911)", c: 14, nbc: 4, dos: "Tête et cou", loc: "VADS",
    r: "J1 à J5 avec la réirradiation (1,5 Gy deux fois par jour), puis 9 jours de pause ; 4 cycles ; G-CSF J6 → J13",
    dr: ids([ONSET([1, 2, 3, 4, 5]), SOLU(50, [1, 2, 3, 4, 5]), HYDR_AV([1, 2, 3, 4, 5], "500 ml + MgSO4 1 g"),
      { p: "PACLITAXEL", u: "mg/m²", d: 20, j: [1, 2, 3, 4, 5], v: "IV", s: "NaCl 0,9 % 250 ml", t: "1 h" }, { p: "CISPLATINE", u: "mg/m²", d: 15, j: [1, 2, 3, 4, 5], v: "IV", s: "NaCl 0,9 % 250 ml", t: "30 min" }, NIVESTIM]),
    no: ["Réirradiation : récidive ou second cancer en territoire irradié, non opérable", "G-CSF de J6 à J13 de chaque cycle (essai)"], ind: [["Tête et cou", "VADS", "Récidivant / métastatique", "Réirradiation"]], src: "RTOG 9911 (Langer 2007, J Clin Oncol)",
    seuils: [S_CIS, S_NFS], ordos: [O_MULTI, O_FIEVRE] },
  { id: "rtref|5fu-acide-folinique-macdonald", nom: "5-FU 425 + Acide folinique 20 J1-J5 / 28 j, avant et après la radiochimiothérapie 45 Gy (INT-0116, Macdonald)", c: 28, nbc: 3, dos: "Digestif", loc: "Estomac",
    r: "1 cycle J1 à J5, puis radiochimiothérapie 45 Gy / 25 fx (5-FU 400 + acide folinique 20 J1-J4 et les 3 derniers jours de la RT), puis 2 cycles J1 à J5 tous les 28 jours",
    dr: ids([ONSET([1]), { p: "ACIDE FOLINIQUE racémique (folinate de calcium)", u: "mg/m²", d: 20, j: [1], jl: "J1 → J5", n: "/j en bolus, avant le 5-FU", v: "IV" },
      { p: "5-FLUORO-URACILE", u: "mg/m²", d: 425, j: [1], jl: "J1 → J5", n: "/j en bolus", v: "IV" }]),
    no: ["Pendant la radiothérapie : 5-FU 400 + acide folinique 20 mg/m² J1-J4 et les 3 derniers jours (nouvelle ligne)", "Traitement de référence si la tumeur n'a pas été vue avant la chirurgie (sinon FLOT)"], ind: [["Digestif", "Estomac", "Adjuvant", ""]], src: "INT-0116 (Macdonald 2001, N Engl J Med)",
    seuils: [S_5FU, S_NFS], ordos: [O_FIEVRE] },
].map((p) => Object.assign({ st: "ok" }, p));
