// Onco360 – modèles de courriers de départ (fichier de Dr Bentahila « COURRIERS.docx », 07/10/2026). Utilisés tant que le
// cabinet n'a pas modifié sa liste (bibliotheques/courriers) ; ensuite c'est la liste du cabinet.
// html : feuille A4 avec des champs remplis à l'ouverture pour le patient (CHAMPS_COURRIER) ; <mark class="or-ac"> = zone
// « À compléter » par le médecin (surlignée à l'écran, pas à l'impression) ; « (e) » s'accorde avec le sexe du patient.
export const CHAMPS_COURRIER = [
  ["patient", "Patient", "Mme NOM Prénom"],
  ["age", "Âge", "62 ans"],
  ["poids", "Poids", "64 kg (29/09/2026)"], // R-A5 (18/10/2026) : poids actuel (fiche ou dernière séance de chimio) et sa date
  ["naissance", "Date de naissance", "12/03/1964"],
  ["cin", "CIN", "BE123456"],
  ["diagnostic", "Diagnostic", ""],
  ["localisation", "Localisation", "Cancer du sein"], ["histologie", "Histologie", ""], ["stade", "Stade", "Métastatique"], ["precision", "Précision du diagnostic", ""], ["oms", "État général (OMS)", "1"], // fiche tumeur (3.1 bis)
  ["mutuelle", "Mutuelle", ""],
  ["etablissement", "Établissement", "l'Hôpital…"],
  ["lieu", "Nom de l'établissement", "Hôpital…"],
  ["ville", "Ville", "Casablanca"],
  ["date", "Date du jour", "07/10/2026"],
  ["medecin", "Médecin", "Dr NOM Prénom"],
];
const AC = '<mark class="or-ac">À compléter</mark>';
const SIG = '<p class="or-sig">Fait à {ville}, le {date}<br><br><b>{medecin}</b></p>';
export const COURRIERS0 = [
  { nom: "Demande d'ALD", html:
    '<p class="or-ti">DEMANDE DE PRISE EN CHARGE AU TITRE DE L\'AFFECTION DE LONGUE DURÉE (ALD)</p>' +
    "<p>Patient : <b>{patient}</b>, {age}<br>Diagnostic : {diagnostic}</p>" +
    "<p>Je soussignée, {medecin}, certifie que {patient} est actuellement suivi(e) au sein de {etablissement} pour la prise en charge d'une affection oncologique nécessitant des soins et un suivi médical prolongés.</p>" +
    "<p>" + AC + "</p>" +
    "<p>Au regard de la nature de cette affection et de la nécessité d'une prise en charge spécialisée, prolongée et régulière, une prise en charge au titre de l'Affection de Longue Durée (ALD) est médicalement justifiée.</p>" +
    "<p>Je vous prie de bien vouloir accorder la prise en charge correspondante.</p>" + SIG },
  { nom: "Certificat d'arrêt de travail", html:
    '<p class="or-ti">CERTIFICAT MÉDICAL D\'ARRÊT DE TRAVAIL</p>' +
    "<p>Je soussignée, {medecin}, certifie que {patient} est actuellement suivi(e) au sein de {etablissement} et que son état de santé nécessite un arrêt de travail pour une durée de " + AC + ", à compter du {date}.</p>" +
    "<p>Le présent certificat est délivré à l'intéressé(e) pour servir et valoir ce que de droit.</p>" + SIG },
  { nom: "Certificat médical", html:
    '<p class="or-ti">CERTIFICAT MÉDICAL</p>' +
    "<p>Je soussignée, {medecin}, certifie que {patient}, né(e) le {naissance}, " + AC + "</p>" +
    "<p>Le présent certificat est délivré à l'intéressé(e) à sa demande, pour servir et valoir ce que de droit.</p>" + SIG },
  { nom: "Courrier médical", html:
    '<p class="or-date">{ville}, le {date}</p>' +
    '<p class="or-ti">COURRIER MÉDICAL</p>' +
    "<p>Concerne : <b>{patient}</b>, {age}<br>Diagnostic : {diagnostic}</p>" +
    "<p>Cher Confrère, Chère Consœur,</p>" +
    "<p>" + AC + "</p>" +
    "<p>Je reste à votre disposition pour toute information complémentaire.</p>" +
    "<p>Bien confraternellement,</p>" +
    '<p class="or-sig"><b>{medecin}</b></p>' },
  { nom: "Pli confidentiel", html:
    '<p class="or-ti">PLI CONFIDENTIEL</p>' +
    "<p>À l'attention de {mutuelle}</p>" +
    "<p>Patient : <b>{patient}</b>, {age}</p>" +
    "<p>Veuillez trouver ci-joint les éléments médicaux concernant {patient}, actuellement pris(e) en charge au sein de {etablissement}.</p>" +
    "<p>" + AC + "</p>" + SIG },
  { nom: "Compte rendu médical", html:
    '<p class="or-ti">COMPTE RENDU MÉDICAL</p>' +
    "<p>Patient : <b>{patient}</b>, {age}<br>Diagnostic : {diagnostic}<br>Date : {date}</p>" +
    "<p>" + AC + "</p>" +
    '<p class="or-sig"><b>{medecin}</b><br>{lieu}</p>' },
];
