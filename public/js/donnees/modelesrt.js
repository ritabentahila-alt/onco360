// Onco360 – modèles des documents de radiothérapie (12/10/2026, demande de Dr Bentahila) : pli confidentiel, compte rendu de fin de
// traitement, calendrier des séances (rendez-vous). Modifiables par le médecin comme les courriers (Paramètres › Listes et bibliothèques ›
// Bibliothèques › Courriers : modèles marqués « radiothérapie », id rt-pli / rt-cr / rt-rdv dans bibliotheques/courriers) ; absents = ceux-ci.
// {champ} = rempli pour le patient et la radiothérapie à l'ouverture du document (documents.js) ; un champ inconnu du dossier devient
// « À REMPLIR » (pli, calendrier) ou « à compléter par le médecin » (compte rendu), jamais imprimé. Mise en page : classes dc-… (documents.js).
const SAUT = '<div class="dc-saut"></div>';
const puce = (lib, k) => '<p class="dc-li">•&nbsp; <b>' + lib + " : </b>{" + k + "}</p>";
const champ = (lib, k) => "<p><b>" + lib + " : </b>{" + k + "}</p>";
export const MODELES_RT0 = {
  pli: '<p class="dc-titre">PLI CONFIDENTIEL</p><p class="dc-d">{ville}, le {date_longue}</p>' +
    "<p>Monsieur le Médecin Conseil,</p><p>Cher(e) Confrère,</p><p>Je vous prie de bien vouloir trouver ci-joint les renseignements cliniques concernant :</p>" +
    '<p class="dc-c"><b>{patient}</b></p><p>ayant droit à la couverture médicale par l’organisme dont vous assurez le conseil.</p>' +
    "<p>Je vous écris pour information et en vue des démarches administratives nécessaires à une prise en charge ou à un accord de principe.</p>" +
    "<p>Avec mes remerciements, veuillez croire, Cher(e) Confrère, à l’expression de mes salutations distinguées.</p>" +
    '<p class="dc-rub">RENSEIGNEMENTS CLINIQUES</p><p>{renseignements}, nécessitant une radiothérapie <b>{acte}</b>.</p>' +
    '<p class="dc-rub">TRAITEMENT PROPOSÉ</p><p><b>Radiothérapie {acte}</b></p>' +
    '<p class="dc-rub">DURÉE PRÉVISIBLE DU TRAITEMENT</p><p>{duree}</p>' +
    "<p><b>Observations : </b>Des modifications du traitement pourraient survenir en fonction des évaluations cliniques et de l’évolution de la maladie.</p>{signature}" +
    SAUT + '<p class="dc-d">{ville_maj}, le {date_longue}</p><p class="dc-titre">COMPTE RENDU MÉDICAL</p>' +
    "<p>Je {soussigne}, {medecin}, certifie que <b>{patient}</b> est actuellement suivi(e) au sein de l’établissement {etablissement} pour la prise en charge d’un {diagnostic}, nécessitant un traitement par <b>Radiothérapie {acte}</b>.</p>" +
    "<p>Vous trouverez ci-dessous le résumé médical relatif à la prise en charge du patient :</p>" +
    '<p class="dc-rub">RÉSUMÉ CLINIQUE ET DÉROULEMENT DU TRAITEMENT</p>{resume}' +
    "<p><br></p><p>Je reste à votre disposition pour toute information complémentaire.</p><p>Veuillez agréer, Monsieur le Médecin Conseil, l’expression de mes salutations distinguées.</p>{signature}" +
    SAUT + '<p class="dc-d">{ville_maj}, le {date_longue}</p><p class="dc-titre">ORDONNANCE MÉDICALE</p><p><br></p>' +
    '<p><b>Patient(e) : {patient}</b></p><p><br></p><p class="dc-c dc-g"><b>Radiothérapie {acte}</b></p><p><br></p>' +
    "<p><b>Date de début : </b>Dès que possible</p>{signature}",
  cr: '<p class="dc-titre dc-cr">COMPTE-RENDU DE FIN DE TRAITEMENT DE RADIOTHÉRAPIE</p>' +
    '<p class="dc-h">1. Identification du patient</p><table class="dc-tab"><tbody><tr><th>Informations patient</th><th>Informations séjour</th></tr><tr><td>' +
    champ("Nom et prénom", "nom_prenom") + champ("Date de naissance", "naissance") + champ("Sexe", "sexe") + champ("Médecin référent", "referent") + "</td><td>" +
    champ("Établissement", "etablissement") + champ("Date d'entrée", "debut") + champ("Date de sortie", "fin") + "</td></tr></tbody></table>" +
    '<p class="dc-h">2. Indication clinique et objectifs</p>' + puce("Diagnostic", "diagnostic") + puce("État général (OMS)", "oms") + puce("Résumé clinique", "resume_clinique") + puce("Visée du traitement", "visee") +
    '<p class="dc-h">3. Modalités et technique de radiothérapie</p>' + puce("Technique utilisée", "technique") + puce("Localisation", "localisation") + "{doses}" + puce("Nombre de séances", "seances") +
    '<p class="dc-h">4. Calendrier du traitement</p>' + puce("Date de début", "debut") + puce("Date de fin", "fin") +
    '<p class="dc-h">5. Tolérance et toxicités</p>' + puce("Toxicités observées", "toxicites") +
    '<p class="dc-h">6. Conduite à tenir et suivi</p>' + puce("Prochain rendez-vous de consultation", "prochain_rdv") + puce("Bilan de contrôle prévu", "bilan") + "{signature}",
  // R-B4 (19/10/2026, demande du 17/10) : calendrier de fin de radiothérapie, mise en page de l'export du logiciel de l'accélérateur (sans le
  // nom de l'appareil ; le médecin à la place du radiothérapeute) ; sert à faire valider la fin de prise en charge par les mutuelles ; une page A4
  rdv: '<p class="dc-titre dc-rdvt">Rendez-vous du patient</p>' +
    '<p class="dc-bande">Date de début : {debut} &nbsp;–&nbsp; Date de fin : {fin}</p>' +
    '<table class="dc-ident"><tbody><tr><td><b>Patient : </b>{patient}</td><td><b>ID patient : </b>{id_patient}</td><td><b>Oncologue : </b>{medecin}</td></tr></tbody></table>' +
    "{tableau_seances}" + '<p class="dc-note">{note_calendrier}</p>',
};
export const NOMS_RT = { pli: "Pli confidentiel (radiothérapie)", cr: "Compte rendu de fin de radiothérapie", rdv: "Calendrier de fin de radiothérapie" };
// Champs à insérer, par document : [clé, libellé]
export const CHAMPS_RT = {
  pli: [["ville", "Ville"], ["ville_maj", "VILLE"], ["date_longue", "Date du jour"], ["patient", "Patient (civilité, nom, prénom)"], ["renseignements", "Renseignements cliniques (résumé du patient)"],
    ["acte", "Acte de radiothérapie"], ["duree", "Durée prévisible"], ["soussigne", "soussigné(e)"], ["medecin", "Médecin"], ["etablissement", "Établissement"], ["diagnostic", "Diagnostic complet"],
    ["resume", "Résumé du patient (paragraphes)"], ["signature", "Cachet et signature"]],
  cr: [["nom_prenom", "Nom et prénom"], ["naissance", "Date de naissance"], ["sexe", "Sexe"], ["referent", "Médecin référent"], ["etablissement", "Établissement"], ["debut", "Date de début"],
    ["fin", "Date de fin"], ["diagnostic", "Diagnostic complet"], ["oms", "État général (OMS)"], ["resume_clinique", "Résumé clinique"], ["visee", "Visée du traitement"], ["technique", "Technique"],
    ["localisation", "Localisation"], ["doses", "Volumes et doses"], ["seances", "Nombre de séances"], ["toxicites", "Toxicités (à compléter)"], ["prochain_rdv", "Prochain rendez-vous"],
    ["bilan", "Bilan de contrôle"], ["signature", "Cachet et signature"]],
  rdv: [["debut", "Date de début"], ["fin", "Date de fin"], ["patient", "Patient"], ["id_patient", "ID patient (n° de dossier)"], ["medecin", "Oncologue (Dr NOM Prénom)"], ["radiotherapie", "Radiothérapie (acte)"], ["tableau_seances", "Tableau des séances"],
    ["note_calendrier", "Note sur le calcul des dates"]],
};
// Modèles de la bibliothèque des courriers (ajoutés à la liste du cabinet s'il ne les a pas encore modifiés)
export const COURRIERS_RT0 = ["pli", "cr", "rdv"].map((t) => ({ id: "rt-" + t, rt: t, nom: NOMS_RT[t], html: MODELES_RT0[t] }));
// Remplit un modèle : {clé} → valeur (HTML déjà préparé) ; clé inconnue laissée telle quelle
export const remplirModele = (html, V) => String(html || "").replace(/\{([a-z_]+)\}/g, (m, k) => (k in V ? V[k] : m));
