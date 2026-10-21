// Onco360 – mise à jour des bibliothèques de départ portée dans les cabinets (R-E3 et R-E4, 19/10/2026, audit n° 7). Fichier écrit d'après
// la liste de départ d'avant (commit 12a8c83) et celle d'aujourd'hui ; appliqué par moteur/bibmaj.js (fusionnerListe, fusionnerOrdos) :
// - corrections : un élément du cabinet encore identique à « avant » (nom et posologie, ou nom et contenu) est remplacé par la fiche de départ
//   « apres[0] » (son identifiant et son étoile gardés) ; « apres[1…] » (autres dosages) ajoutés à côté ; modifié par le cabinet : rien ne change
// - ajouts : fiches de départ ajoutées si le cabinet ne les a pas (même identifiant ou même nom) et ne les a pas retirées (liste « retires »)
// - ordonnances types : renommée si le cabinet a encore l'ancien nom ; une ligne remplacée seulement si elle est encore celle d'avant
// VERSION_BIB 2 (S4, 21/10/2026, audit n° 10 d. 34) : ZOMETA (créatinine, dose selon la clairance, bilan dentaire, calcium et vitamine D, RCP)
// et NAUSELIUM (dompéridone : 7 jours au plus, 30 mg par jour, EMA 2014) complétés
export const VERSION_BIB = 2;
export const MAJ_BIB = {
  medicaments: {
    corrections: [
      {"avant":["ABIRANAT (abiratérone) 250 mg","4 comprimés le matin en une seule prise, à jeun (au moins 2 heures après un repas et 1 heure avant le suivant), avec un grand verre d'eau (soit 1 000 mg par jour)"],"apres":["m1"]},
      {"avant":["ALPRAZ (alprazolam) 0,5 mg","1 comprimé le soir"],"apres":["m3"]},
      {"avant":["ARANESP (darbépoétine alfa) 150 µg","1 injection sous-cutanée, à partir du surlendemain de chaque chimiothérapie"],"apres":["m6"]},
      {"avant":["CLOPRAME (métoclopramide) 10 mg","1 comprimé en cas de nausées, maximum 3 comprimés par jour (espacés d'au moins 3 heures)"],"apres":["m25"]},
      {"avant":["DAROLUTAMIDE (NUBEQA) 300 mg","2 comprimés le matin et 2 comprimés le soir (soit 4 comprimés = 1 200 mg par jour)"],"apres":["m31"]},
      {"avant":["DUROGESIC (fentanyl) 12 / 25 / 50 µg/h, patch","1 patch à changer toutes les 72 heures (3 jours)"],"apres":["m44","m-durogesic25","m-durogesic50"]},
      {"avant":["EFFIPRED (prednisolone) 5 mg","1 comprimé par jour, le matin, en même temps que l'abiratérone"],"apres":["m46","m-effipred-crpc"]},
      {"avant":["ENDOXAN (cyclophosphamide) 50 mg","1 comprimé par jour, le matin, avec un grand verre d'eau (chimiothérapie métronomique)"],"apres":["m48"]},
      {"avant":["ERLEADA (apalutamide) 60 mg","4 comprimés par jour en une seule prise (soit 240 mg par jour)"],"apres":["m51"]},
      {"avant":["GLIVEC (imatinib) 400 mg","1 comprimé par jour, au cours d'un repas, avec un grand verre d'eau"],"apres":["m68"]},
      {"avant":["KEPPRA (lévétiracétam) 500 mg","1 comprimé matin et soir (soit 2 comprimés par jour)"],"apres":["m77"]},
      {"avant":["LEVOTHYROX (lévothyroxine) 25 / 50 / 100 µg","1 comprimé le matin à jeun, 30 minutes avant le petit-déjeuner"],"apres":["m82","m-levothyrox50","m-levothyrox100"]},
      {"avant":["LYRICA (prégabaline) 50 mg","1 comprimé matin et soir (soit 2 comprimés = 100 mg par jour) pour commencer"],"apres":["m89"]},
      {"avant":["MAGMINE (magnésium + vitamine B6)","1 comprimé le matin"],"apres":["m90"]},
      {"avant":["MOSCONTIN LP (sulfate de morphine) 10 / 30 / 60 / 100 mg","1 comprimé le matin et 1 le soir (toutes les 12 heures)"],"apres":["m94","m-moscontin30","m-moscontin60","m-moscontin100"]},
      {"avant":["NOCAND 50 mg","1 comprimé le matin pendant 7 jours"],"apres":["m103"]},
      {"avant":["NORMACOL lavement","1 lavement en l'absence de selles pendant 3 jours malgré les autres traitements (MOVICOL…)"],"apres":["m104"]},
      {"avant":["OEDES (oméprazole) 20 mg","1 gélule le matin"],"apres":["m105"]},
      {"avant":["OFLOCET (ofloxacine) 200 mg","1 comprimé (200 mg) par jour pendant 5 jours"],"apres":["m106"]},
      {"avant":["OMIX (tamsulosine) 0,4 mg","1 comprimé le soir"],"apres":["m108"]},
      {"avant":["ORGOVYX (rélugolix) 120 mg","3 comprimés le 1er jour, puis 1 comprimé par jour"],"apres":["m109"]},
      {"avant":["OROCAL VITAMINE D3 500 mg / 400 UI","1 comprimé matin et soir (soit 2 comprimés par jour)"],"apres":["m110"]},
      {"avant":["PRIMPERAN (métoclopramide) 10 mg","1 comprimé matin, midi et soir (soit 3 comprimés par jour) en cas de nausées"],"apres":["m116"]},
      {"avant":["PROLIA (dénosumab) 60 mg","1 injection sous-cutanée tous les 6 mois, avec calcium et vitamine D"],"apres":["m117"]},
      {"avant":["SEVREDOL (sulfate de morphine) 10 mg","1 comprimé en cas de pic de douleur, maximum 6 comprimés par jour (au moins 1 heure entre 2 prises)"],"apres":["m123"]},
      {"avant":["SULFARLEM S 25 (anétholtrithione)","1 comprimé matin, midi et soir (soit 3 comprimés par jour), avant les repas"],"apres":["m126"]},
      {"avant":["TAVANIC (lévofloxacine) 500 mg","1 comprimé (500 mg) le 1er jour, puis ½ comprimé (250 mg) par jour pendant 5 jours"],"apres":["m134"]},
      {"avant":["TRAMAL LP (tramadol) 100 mg","1 comprimé le matin et 1 comprimé le soir (toutes les 12 heures)"],"apres":["m143"]},
      {"avant":["XATRAL LP (alfuzosine) 10 mg","1 comprimé par jour, après le repas du soir"],"apres":["m153"]},
      {"avant":["XGEVA (dénosumab) 120 mg","1 injection sous-cutanée toutes les 4 semaines, avec calcium et vitamine D"],"apres":["m154"]},
      {"avant":["ZOMETA (acide zolédronique) 4 mg","1 perfusion intraveineuse de 15 minutes toutes les 4 semaines (ou toutes les 12 semaines)"],"apres":["m162"]},
      {"avant":["NAUSELIUM (dompéridone) sirop","1 cuillère-mesure 3 fois par jour, 15 minutes avant les repas, en cas de nausées"],"apres":["m-nauselium"]},
      {"avant":["XTANDI (enzalutamide) 40 mg","4 comprimés par jour en une seule prise le matin (soit 160 mg par jour)"],"apres":["m155"]},
      {"avant":["ZYTIGA (abiratérone) 250 mg","4 comprimés le matin en une seule prise, à jeun (au moins 2 heures après un repas et 1 heure avant le suivant), avec un grand verre d'eau (soit 1 000 mg par jour)"],"apres":["m165"]},
    ],
    ajouts: ["m-solupred20","m-loperium-irino","m-nauselium","m-vitb12","m-sysmetix","m-sucralfate","m-uree"],
  },
  analyses: {
    corrections: [
      {"avant":["Protéinurie des 24 h","Microbiologie"],"apres":["a83"]},
    ],
    ajouts: ["a-cmv","a-ebv","a-vzv","a-toxo","a-htlv"],
  },
  bilans: {
    corrections: [
      {"avant":["Bilan hépatique complet",["ASAT","ALAT","GGT","PAL","Bilirubine totale et conjuguée"]],"apres":["b2"]},
      {"avant":["Sérologies virales",["VIH 1/2","VHB (Ag HBs, Ac anti-HBs, Ac anti-HBc)","VHC"]],"apres":["b7"]},
      {"avant":["Sérologies opportunistes",["CMV (IgG, IgM ± PCR)","EBV","VZV","Toxoplasmose","HTLV-1"]],"apres":["b8"]},
      {"avant":["Bilan nutritionnel",["Albuminémie","Préalbuminémie (transthyrétine)","CRP","Ferritinémie","CST","Vitamine B12","Folates (vitamine B9)","Ionogramme sanguin","Phosphatémie","Magnésémie"]],"apres":["b12"]},
      {"avant":["Bilan hypercalcémie",["Calcémie","Albuminémie","Calcémie corrigée","Phosphatémie","Magnésémie","PTH (1-84)","25-OH vitamine D","PAL","Ionogramme sanguin","Créatininémie"]],"apres":["b13"]},
      {"avant":["Bilan diarrhée",["Ionogramme sanguin (Na, K, Cl, Mg, Ca)","Créatininémie","Urée","CRP","Coproculture","Examen parasitologique des selles","Recherche de Clostridioides difficile (toxines A/B + GDH)"]],"apres":["b16"]},
      {"avant":["Bilan avant scanner injecté",["Créatininémie","DFG (clairance de la créatinine, CKD-EPI)","Ionogramme sanguin"]],"apres":["b17"]},
      {"avant":["Bilan chimiothérapie – bilan initial",["NFS – plaquettes","Ionogramme sanguin","Urée","Créatininémie","DFG (clairance de la créatinine, CKD-EPI)","ASAT","ALAT","GGT","PAL","Bilirubine totale et conjuguée","TSH","Glycémie à jeun","Bilan lipidique","VIH 1/2","VHB (Ag HBs, Ac anti-HBs, Ac anti-HBc)","VHC"]],"apres":["b28"]},
      {"avant":["Bilan immunothérapie – bilan initial",["NFS – plaquettes","Ionogramme sanguin","Urée","Créatininémie","DFG (clairance de la créatinine, CKD-EPI)","ASAT","ALAT","GGT","PAL","Bilirubine totale et conjuguée","Cortisolémie à 8h","TSH","Lipase","Glycémie à jeun","Bilan lipidique","VIH 1/2","VHB (Ag HBs, Ac anti-HBs, Ac anti-HBc)","VHC"]],"apres":["b30"]},
      {"avant":["Bilan abiratérone",["Ionogramme sanguin (Na, K, Cl, Mg, Ca)","Urée","Créatininémie","DFG (clairance de la créatinine, CKD-EPI)","ASAT","ALAT","GGT","PAL","Bilirubine totale et conjuguée"]],"apres":["b31"]},
      {"avant":["Bilan curiethérapie",["NFS – plaquettes","Créatininémie","Ionogramme sanguin","TP / INR","TCA","Fibrinogène","ECBU avec antibiogramme"]],"apres":["b32"]},
    ],
  },
  examens: {
    corrections: [
      {"avant":["TDM thoraco-abdomino-pelvienne (TAP) injectée","Scanner (TDM)",""],"apres":["e1"]},
      {"avant":["TDM thoracique injectée","Scanner (TDM)",""],"apres":["e2"]},
      {"avant":["TDM abdomino-pelvienne injectée","Scanner (TDM)",""],"apres":["e3"]},
      {"avant":["TDM cérébrale injectée","Scanner (TDM)",""],"apres":["e4"]},
      {"avant":["TDM cervico-faciale (ORL) injectée","Scanner (TDM)",""],"apres":["e5"]},
      {"avant":["Angio-TDM thoracique (recherche d'embolie pulmonaire)","Scanner (TDM)",""],"apres":["e6"]},
      {"avant":["Uro-TDM","Scanner (TDM)",""],"apres":["e7"]},
    ],
  },
  ordostypes: [
    {"ordo":"Nausées et vomissements","lignes":[{"avant":["CLOPRAME (métoclopramide) 10 mg","1 comprimé 3 fois par jour (matin, midi et soir), 30 minutes avant les repas, en cas de nausées"],"apres":["CLOPRAME (métoclopramide) 10 mg","1 comprimé 3 fois par jour (matin, midi et soir), 30 minutes avant les repas, en cas de nausées, pendant 5 jours au plus"]}]},
    {"ordo":"Douleurs – palier 1","ancien":"Douleurs – paliers 1","lignes":[]},
    {"ordo":"Douleurs – palier 1 et 2","lignes":[{"avant":["TRAMAL LP (tramadol) 100 mg","1 comprimé le matin et 1 comprimé le soir (toutes les 12 heures)"],"apres":["TRAMAL LP (tramadol) 100 mg","1 comprimé le matin et 1 comprimé le soir (toutes les 12 heures), pendant 1 mois"]}]},
    {"ordo":"Douleurs – palier 3 (morphine)","lignes":[{"avant":["MOSCONTIN LP (sulfate de morphine) 10 / 30 / 60 / 100 mg","1 comprimé le matin et 1 le soir (toutes les 12 heures)"],"apres":["MOSCONTIN LP (sulfate de morphine) 10 mg","1 comprimé le matin et 1 le soir (toutes les 12 heures), pendant 28 jours"]},{"avant":["SEVREDOL (sulfate de morphine) 10 mg","1 comprimé en cas d'accès douloureux, maximum 6 comprimés par jour (au moins 1 heure entre 2 prises)"],"apres":["SEVREDOL (sulfate de morphine) 10 mg","1 comprimé en cas d'accès douloureux, maximum 6 comprimés par jour (au moins 1 heure entre 2 prises), pendant 28 jours"]}]},
    {"ordo":"Douleurs neuropathiques","lignes":[{"avant":["MAGMINE (magnésium + vitamine B6)","1 comprimé le matin, au cours du repas"],"apres":["MAGMINE (magnésium + vitamine B6)","1 comprimé le matin, au cours du repas, pendant 3 mois"]}]},
    {"ordo":"Rectite radique et proctologie","lignes":[{"avant":["SYSMETIX, gélule (probiotique)","1 gélule par jour pour restaurer le microbiote"],"apres":["SYSMETIX, gélule (probiotique)","1 gélule par jour pour restaurer le microbiote, pendant [durée à compléter]"]},{"avant":["LAVEMENTS DE SUCRALFATE (ou BETNESOL / ENTOCORT)","1 lavement le soir au coucher, pour tapisser et cicatriser la muqueuse irritée"],"apres":["LAVEMENTS DE SUCRALFATE (ou BETNESOL / ENTOCORT)","1 lavement le soir au coucher, pour tapisser et cicatriser la muqueuse irritée, pendant [durée à compléter]"]}]},
    {"ordo":"Corticothérapie et prophylaxie","lignes":[{"avant":["BACTRIM FORTE (sulfaméthoxazole + triméthoprime)","1 comprimé le matin le lundi, le mercredi et le vendredi (prévention de la pneumocystose)"],"apres":["BACTRIM FORTE (sulfaméthoxazole + triméthoprime)","1 comprimé le matin le lundi, le mercredi et le vendredi (prévention de la pneumocystose), pendant 3 mois"]},{"avant":["YOFOLVIT (acide folique)","1 comprimé par jour, le matin"],"apres":["YOFOLVIT (acide folique)","1 comprimé par jour, le matin, pendant [durée à compléter]"]}]},
    {"ordo":"Préparation digestive avant radiothérapie","lignes":[{"avant":["LIXIFOR, gélule","1 gélule le soir au coucher avec un grand verre d'eau"],"apres":["LIXIFOR, gélule","1 gélule le soir au coucher avec un grand verre d'eau, pendant [durée à compléter]"]}]},
    {"ordo":"Chimio : cisplatine sur plusieurs jours (BEP, EP, VIP…)","lignes":[{"avant":["CLOPRAME (métoclopramide) 10 mg","1 comprimé en cas de nausées, maximum 3 comprimés par jour"],"apres":["CLOPRAME (métoclopramide) 10 mg","1 comprimé en cas de nausées, maximum 3 comprimés par jour, pendant 5 jours au maximum"]}]},
  ],
};
