// Onco360 – ordonnances types de départ (fichier de Dr Bentahila « Ordonnances_Par_Type_Complete.xlsx », 07/10/2026),
// harmonisées avec la liste des médicaments, corrigées et complétées (types marqués « nouveau »). Utilisées tant que le
// cabinet n'a pas encore modifié sa liste (bibliotheques/ordostypes) ; ensuite c'est la liste du cabinet.
// { nom, items: [[médicament, posologie], …] }
export const ORDOS_TYPES0 = [
  { nom: "Diarrhée", items: [
    ["SPASFON LYOC (phloroglucinol)", "1 à 2 comprimés en cas de douleurs abdominales, maximum 6 comprimés par jour"],
    ["SMECTA (diosmectite) 3 g", "1 à 2 sachets en cas de diarrhée légère, maximum 6 sachets par jour"],
    ["LOPERIUM (lopéramide) 2 mg", "1 à 2 comprimés en cas de diarrhée importante, maximum 6 comprimés par jour"],
    ["TIORFAN (racécadotril) 100 mg", "1 à 2 gélules si les diarrhées importantes persistent sous LOPERIUM, maximum 6 gélules par jour"]] },
  { nom: "Constipation", items: [
    ["FORLAX (macrogol) 10 g", "1 à 2 sachets par jour, le matin en une prise, en cas de constipation importante"],
    ["DUPHALAC (lactulose), sachet", "1 à 3 sachets par jour (matin, midi et soir) en cas de constipation importante"],
    ["NORMACOL lavement", "1 lavement en l'absence de selles pendant 3 jours malgré les autres traitements"]] },
  { nom: "Pré-chimiothérapie antiémétique", items: [
    ["CHEMOSET (ondansétron) 8 mg", "1 comprimé matin et soir (soit 2 comprimés par jour) à J1, J2 et J3 après la chimiothérapie (pendant 3 jours)"],
    ["NAUSELIUM (dompéridone) sirop", "1 cuillère-mesure 3 fois par jour, 15 minutes avant les repas, en cas de nausées"],
    ["COTIPRED (prednisolone) 20 mg", "3 comprimés le matin (soit 60 mg par jour) à J1, J2 et J3 après la chimiothérapie (pendant 3 jours)"]] },
  { nom: "Chimiothérapie très émétisante (cisplatine, AC…)", items: [
    ["EMEND (aprépitant) 125 mg / 80 mg", "1 gélule de 125 mg à J1 de la chimiothérapie, puis 1 gélule de 80 mg à J2 et à J3"],
    ["CHEMOSET (ondansétron) 8 mg", "1 comprimé matin et soir (soit 2 comprimés par jour) à J1, J2 et J3 après la chimiothérapie (pendant 3 jours)"],
    ["DEXAMÉTHASONE 4 mg, comprimé", "2 comprimés le matin (soit 8 mg) à J2 et J3 après la chimiothérapie"],
    ["OLANZAPINE (ZYPREXA) 5 mg", "1 comprimé le soir, de J1 à J4 de la chimiothérapie"]] },
  { nom: "Nausées et vomissements", items: [
    ["CLOPRAME (métoclopramide) 10 mg", "1 comprimé 3 fois par jour (matin, midi et soir), 30 minutes avant les repas, en cas de nausées"],
    ["CHEMOSET (ondansétron) 8 mg", "1 comprimé matin et soir, espacés de 12 heures (maximum 2 comprimés par jour), si les nausées persistent"],
    ["NAUSELIUM (dompéridone) sirop", "1 cuillère-mesure 3 fois par jour, 15 minutes avant les repas, en cas de nausées"]] },
  { nom: "Radiodermite et soins cutanés", items: [
    ["HYALO4 (acide hyaluronique) crème", "1 application en couche fine par jour sur la zone traitée, APRÈS chaque séance de radiothérapie"],
    ["EOSINE aqueuse 2 %, unidose 2 ml", "1 à 2 applications par jour sur les lésions suintantes, à l'aide d'une compresse stérile"],
    ["VASELINE stérile", "1 à 2 applications par jour, en couche épaisse, sur les lésions suintantes et croûteuses"],
    ["COMPRESSES NON TISSÉES 10 x 10 cm", "À appliquer après nettoyage soigneux et séchage de la plaie ; à changer tous les jours"],
    ["BANDE VELPEAU 15 x 10 cm", "À appliquer sur les compresses pour maintenir les pansements en place"],
    ["FUCIDINE (acide fusidique) crème", "1 application 2 fois par jour, après nettoyage doux et séchage, en cas de surinfection cutanée"],
    ["FLAMMAZINE (sulfadiazine argentique) crème", "Étaler 1 fois par jour en couche de 2 à 3 mm sur une peau propre et sèche"]] },
  { nom: "Soins de bouche (mucite, sécheresse)", items: [
    ["BICARBONATE DE SODIUM 14 ‰, 500 ml", "Bains de bouche au moins 6 fois par jour, pendant toute la radiothérapie et jusqu'à 3 mois après"],
    ["BICARBONATE DE SODIUM 14 ‰ + XYLOCAÏNE 2 %", "Bains de bouche après les repas ou au moins 1 heure avant (jamais juste avant un repas), au moins 3 fois par jour"],
    ["XYLOCAÏNE VISQUEUSE (lidocaïne) 2 % gel", "1 application sur les zones douloureuses, après les repas ou au moins 1 heure avant"],
    ["FLUOCARIL gel bifluoré 250 mg", "Appliquer dans les gouttières fluorées 1 fois par jour, pendant 5 minutes, après le brossage"],
    ["GUM HYDRAL gel humectant", "4 applications par jour sur les gencives et la langue en cas de sécheresse"],
    ["XYLITOL chewing-gum", "À mâcher selon les besoins, jusqu'à 4 fois par jour, pour stimuler la salivation"]] },
  { nom: "Douleurs – paliers 1 et 2", items: [
    ["PARACÉTAMOL 1 g", "1 comprimé en cas de douleur, maximum 4 comprimés par jour (au moins 4 heures entre 2 prises)"],
    ["CETRA (tramadol 37,5 mg + paracétamol 325 mg)", "1 comprimé en cas de pic de douleur, maximum 4 comprimés par jour"]] },
  { nom: "Douleurs – tramadol à libération prolongée", items: [
    ["TRAMAL LP (tramadol) 100 mg", "1 comprimé le matin et 1 comprimé le soir (toutes les 12 heures)"],
    ["TRAMAL (tramadol) 50 mg", "1 comprimé en cas de pic de douleur, maximum 4 comprimés par jour"],
    ["PARACÉTAMOL 1 g", "1 comprimé en cas de douleur, maximum 4 comprimés par jour (au moins 4 heures entre 2 prises)"]] },
  { nom: "Douleurs – palier 3 (morphine)", items: [
    ["MOSCONTIN LP (sulfate de morphine) 10 / 30 / 60 / 100 mg", "1 comprimé le matin et 1 le soir (toutes les 12 heures)"],
    ["SEVREDOL (sulfate de morphine) 10 mg", "1 comprimé en cas d'accès douloureux, maximum 6 comprimés par jour (au moins 1 heure entre 2 prises)"],
    ["FORLAX (macrogol) 10 g", "1 sachet par jour, le matin, pendant toute la durée du traitement par morphine (prévention de la constipation)"]] },
  { nom: "Douleurs neuropathiques", items: [
    ["LYRICA (prégabaline) 50 mg", "1 comprimé matin et soir (soit 2 comprimés = 100 mg par jour) pour commencer"],
    ["VITANEVRIL FORTE", "1 comprimé matin et soir (soit 2 comprimés par jour) pendant 3 mois"],
    ["MAGMINE (magnésium + vitamine B6)", "1 comprimé le matin, au cours du repas"]] },
  { nom: "Rectite radique et proctologie", items: [
    ["PENTASA (mésalazine) 1 g / 100 ml, suspension rectale", "1 lavement le soir au coucher, allongé sur le côté, pendant 2 à 3 semaines"],
    ["MORIDIL pommade", "1 application 2 fois par jour (matin et soir) sur la zone anale"],
    ["MORIDIL suppositoire", "1 suppositoire enduit de pommade, 2 fois par jour"],
    ["TITANORÉINE à la lidocaïne 2 % crème", "1 application avant et après chaque selle, maximum 4 applications par jour"],
    ["COTIPRED (prednisolone) 20 mg", "3 comprimés le matin (soit 60 mg par jour) pendant 5 jours, en poussée inflammatoire aiguë"],
    ["SYSMETIX, gélule (probiotique)", "1 gélule par jour pour restaurer le microbiote"],
    ["LAVEMENTS DE SUCRALFATE (ou BETNESOL / ENTOCORT)", "1 lavement le soir au coucher, pour tapisser et cicatriser la muqueuse irritée"]] },
  { nom: "Syndrome pieds-mains", items: [
    ["DEXERYL", "1 application matin et soir (soit 2 applications par jour), en couche fine"],
    ["CRÈME À L'URÉE 10 à 30 %", "1 application matin et soir sur la paume des mains et la plante des pieds"],
    ["FENAC (diclofénac) gel", "1 application par jour, le midi, sur les zones douloureuses"],
    ["HYDRACORT (hydrocortisone) crème 0,5 %", "1 application par jour, le midi ou le soir, sur les rougeurs"],
    ["HEXOMÉDINE (hexamidine)", "2 applications par jour, en badigeon, sur les fissures"]] },
  { nom: "Éruption acnéiforme (anti-EGFR)", items: [
    ["DOXYMYCINE (doxycycline) 100 mg", "1 comprimé par jour pendant 1 mois"],
    ["HYDROCORT ou EFFICORT (hydrocortisone) crème", "1 application le soir sur les boutons"],
    ["DIFFERINE (adapalène) crème", "1 application le soir, un jour sur deux, sur les boutons"],
    ["TOLÉRIANE crème légère", "1 application le matin sur le visage et les zones sensibles"],
    ["DAYLONG écran total", "1 application le matin, avant de sortir"]] },
  { nom: "Troubles urinaires", items: [
    ["UROREC (silodosine) 8 mg", "1 gélule le soir au cours du repas, pendant 3 mois"],
    ["VECA (solifénacine) 5 mg", "1 comprimé le soir (ou le matin si brûlures mictionnelles) pendant 3 mois"],
    ["NIBIOL FORTE (nitroxoline) 100 mg", "1 comprimé matin, midi et soir (soit 3 comprimés par jour) pendant 10 jours"]] },
  { nom: "Hormonothérapie sein – anti-aromatase", items: [
    ["FEMARA (létrozole) 2,5 mg", "1 comprimé par jour, à heure fixe, pendant 3 mois"],
    ["CACIT VITAMINE D3 1000 mg / 880 UI", "1 comprimé par jour, le matin, pendant 3 mois"],
    ["UVEDOSE 100 000 UI, solution buvable", "1 ampoule par mois à boire sur un sucre pendant 2 mois, puis 1 ampoule tous les 3 mois"]] },
  { nom: "Hormonothérapie sein – tamoxifène", items: [
    ["TAMOXIFÈNE 20 mg", "1 comprimé par jour, à heure fixe, au cours d'un repas, pendant 3 mois"]] },
  { nom: "Dysphagie et reflux", items: [
    ["OEDES (oméprazole) 20 mg", "1 gélule le matin à jeun, pendant toute la durée du traitement"],
    ["GAVISCON", "1 dose (tube) avant chaque repas, matin, midi et soir (soit 3 par jour)"],
    ["COTIPRED (prednisolone) 20 mg", "3 comprimés le matin (soit 60 mg par jour) pendant …, en cas d'œdème ou d'inflammation œsophagienne"],
    ["XYLOCAÏNE VISQUEUSE (lidocaïne) 2 % gel", "1 application dans la bouche et la gorge 1 heure avant les repas (jamais juste avant : risque de fausse route)"],
    ["FUNGIZONE (amphotéricine B) 10 %, suspension buvable", "2 cuillères à café le matin et 2 le soir (soit 4 cuillères à café par jour) en cas de candidose œsophagienne"]] },
  { nom: "Corticothérapie et prophylaxie", items: [
    ["COTIPRED (prednisolone) 20 mg", "3 comprimés le matin (soit 60 mg par jour), puis diminution progressive selon la prescription"],
    ["OEDES (oméprazole) 20 mg", "1 gélule le matin à jeun, à arrêter en même temps que le corticoïde"],
    ["BACTRIM FORTE (sulfaméthoxazole + triméthoprime)", "1 comprimé le matin le lundi, le mercredi et le vendredi (prévention de la pneumocystose)"],
    ["YOFOLVIT (acide folique)", "1 comprimé par jour, le matin"]] },
  { nom: "Prémédication pémétrexed (ALIMTA)", items: [
    ["YOFOLVIT (acide folique)", "1 comprimé par jour, à commencer 7 jours avant la 1re cure et à poursuivre jusqu'à 3 semaines après la dernière cure"],
    ["VITAMINE B12 1 000 µg, solution injectable", "1 injection intramusculaire 1 semaine avant la 1re cure, puis toutes les 9 semaines"],
    ["DEXAMÉTHASONE 4 mg, comprimé", "1 comprimé matin et soir, la veille, le jour et le lendemain de chaque cure"]] },
  { nom: "Infections et mycoses cutanées", items: [
    ["FAZOL (isoconazole) 2 % crème, 30 g", "Appliquer entre les orteils et dans les plis 2 fois par jour pendant 10 jours, puis réévaluer"],
    ["MYCODERME pommade", "1 application 2 fois par jour (matin et soir) pendant 3 semaines (ex. mycose sous-mammaire)"],
    ["PYOSTACINE (pristinamycine) 500 mg", "2 comprimés matin et soir, au cours des repas (soit 4 comprimés = 2 g par jour), pendant 8 à 14 jours"]] },
  { nom: "Infection – antibiothérapie orale", items: [
    ["AUGMENTIN (amoxicilline + acide clavulanique) 1 g", "1 comprimé (1 g) matin, midi et soir (soit 3 comprimés par jour) pendant 5 à 7 jours"],
    ["OFLOCET (ofloxacine) 200 mg", "1 comprimé (200 mg) par jour pendant 5 jours"]] },
  { nom: "Mycose génitale", items: [
    ["LOMEXINE (fenticonazole) 600 mg ovule", "1 ovule le soir au coucher, en une seule fois (dose unique)"],
    ["LOMEXINE (fenticonazole) 2 % crème vulvaire", "1 application matin et soir (soit 2 par jour) pendant 1 semaine"],
    ["SEDASTERIL crème lavante PM", "Pour la toilette intime, chaque jour"]] },
  { nom: "Radiothérapie pelvienne – soins gynécologiques", items: [
    ["BETADINE 10 % gynécologique (povidone iodée)", "1 à 2 bouchons dilués dans 1 litre d'eau tiède (une bassine), en bain de siège ou en irrigation de 5 à 10 minutes, pendant 1 mois"],
    ["HYALO4 (acide hyaluronique) crème", "1 à 2 applications par jour sur la zone vulvaire, en couche fine, après la séance de radiothérapie"],
    ["SEDASTERIL gel lubrifiant", "1 à 2 applications par jour sur la zone vulvaire, ou avant les rapports sexuels"],
    ["KIT DE DILATATEURS VAGINAUX (4 tailles)", "Dilatation vaginale progressive (commencer par le plus petit), 2 à 3 fois par semaine, 10 minutes par séance"]] },
  { nom: "Préparation digestive avant radiothérapie", items: [
    ["ZETALAX, microlavement", "1 lavement le matin, la veille et le jour du traitement"],
    ["EUCARBON, comprimé", "1 comprimé matin, midi et soir (soit 3 comprimés par jour), les 2 jours précédant le traitement"],
    ["LIXIFOR, gélule", "1 gélule le soir au coucher avec un grand verre d'eau"]] },
  { nom: "Nutrition", items: [
    ["FONTACTIV poudre", "4 cuillères-mesures dans 200 ml de liquide (2 cuillères-mesures si lait), 1 à 2 fois par jour (ne remplace pas un repas)"],
    ["FORTIMEL Protein", "1 à 2 bouteilles par jour, à boire fraîches entre les repas (ne remplace pas un repas)"]] },
];
