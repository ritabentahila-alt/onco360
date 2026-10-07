/* ===== Onco360 – sauvegarde quotidienne (CODE A COLLER v8) =====
   À coller dans un NOUVEAU fichier « Onco360 » du projet Apps Script « Chimio HGC » (le même que la sauvegarde actuelle).
   Utilise ce qui existe déjà dans le projet : DOSSIER_ID, sousDossier_ (fichier « Code ») et fbGet_, fbVal_, dossierFb_,
   FB_BASE (fichier « Firebase »).

   Chaque nuit vers 3 h (après la sauvegarde de l'ancienne application, vers 2 h 30), copie TOUT Onco360 dans
   Drive > Sauvegardes > Onco360 > Onco360_AAAA-MM-JJ.json :
     • espaces/cabinet-bentahila et toutes ses collections (patients, patientsFinances, finances, parametres, protocoles,
       etablissements, membres, historique, administrations… et celles ajoutées plus tard, trouvées automatiquement) ;
     • les profils (utilisateurs) et les administrateurs.
   Conservation : les 30 dernières sauvegardes, plus celle du 1er de chaque mois (gardée sans limite).
   En cas d'échec : e-mail d'alerte, et les anciennes sauvegardes ne sont pas effacées.

   À LANCER UNE FOIS : installerSauvegardeOnco360 (menu déroulant en haut, puis « Exécuter »). */

var ONCO_ESPACE = 'cabinet-bentahila';
var ONCO_RACINE = ['utilisateurs', 'administrateurs'];
var ONCO_GARDER = 30;

/* Requête POST à Firestore (liste des collections d'un document) */
function oncoPost_(chemin, corps) {
  var url = chemin ? FB_BASE + chemin : FB_BASE.replace(/\/$/, '');
  var r = UrlFetchApp.fetch(url + ':listCollectionIds', {
    method: 'post', contentType: 'application/json', payload: JSON.stringify(corps),
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken(), 'x-goog-user-project': FB_PROJET },
    muteHttpExceptions: true
  });
  if (r.getResponseCode() !== 200) throw new Error('Firebase ' + r.getResponseCode() + ' : ' + r.getContentText().slice(0, 300));
  return JSON.parse(r.getContentText());
}

/* Noms des collections sous un document (ex. toutes celles de l'espace, y compris celles créées plus tard) */
function oncoSousCollections_(cheminDoc) {
  var ids = [], jeton = '';
  for (var n = 0; n < 20; n++) {
    var corps = { pageSize: 100 }; if (jeton) corps.pageToken = jeton;
    var j = oncoPost_(cheminDoc, corps);
    ids = ids.concat(j.collectionIds || []);
    if (!j.nextPageToken) break;
    jeton = j.nextPageToken;
  }
  return ids.sort();
}

/* Tous les documents d'une collection, rangés par chemin complet : { "espaces/…/patients/P1": {champs} } */
function oncoDocuments_(col, out) {
  var jeton = '', nb = 0;
  for (var n = 0; n < 2000; n++) {
    var j = fbGet_(col + '?pageSize=300' + (jeton ? '&pageToken=' + encodeURIComponent(jeton) : ''));
    (j.documents || []).forEach(function (d) {
      var o = {}, f = d.fields || {};
      for (var k in f) o[k] = fbVal_(f[k]);
      out[col + '/' + d.name.split('/').pop()] = o; nb++;
    });
    if (!j.nextPageToken) return nb;
    jeton = j.nextPageToken;
  }
  throw new Error('Collection ' + col + ' trop grande : sauvegarde interrompue.');
}

/* La sauvegarde elle-même (lancée chaque nuit) */
function sauvegardeOnco360() {
  try {
    var esp = 'espaces/' + ONCO_ESPACE, docs = {}, compte = {};
    var e = fbGet_(esp), fe = {}, f = e.fields || {};
    for (var k in f) fe[k] = fbVal_(f[k]);
    docs[esp] = fe;
    var cols = oncoSousCollections_(esp);
    if (cols.indexOf('patients') < 0) throw new Error('Aucune collection « patients » dans ' + esp + ' : sauvegarde annulée.');
    cols.forEach(function (c) { compte[c] = oncoDocuments_(esp + '/' + c, docs); });
    ONCO_RACINE.forEach(function (c) { compte[c] = oncoDocuments_(c, docs); });
    if (!compte.patients) throw new Error('0 dossier patient lu : sauvegarde annulée (les anciennes sont gardées).');

    var jour = Utilities.formatDate(new Date(), 'Africa/Casablanca', 'yyyy-MM-dd');
    var nom = 'Onco360_' + jour + '.json';
    var base = { application: 'Onco360', projet: FB_PROJET, espace: ONCO_ESPACE, date: new Date().toISOString(), compte: compte, documents: docs };
    var dos = dossierFb_('Onco360');
    var ex = dos.getFilesByName(nom);
    while (ex.hasNext()) ex.next().setTrashed(true);
    var fichier = dos.createFile(Utilities.newBlob(JSON.stringify(base), 'application/json', nom));

    // Conservation : les 30 plus récentes + celle du 1er de chaque mois
    var liste = [], it = dos.getFiles();
    while (it.hasNext()) { var x = it.next(); if (/^Onco360_\d{4}-\d{2}-\d{2}\.json$/.test(x.getName())) liste.push(x); }
    liste.sort(function (a, b) { return b.getName() < a.getName() ? -1 : 1; });
    for (var i = ONCO_GARDER; i < liste.length; i++) if (!/-01\.json$/.test(liste[i].getName())) liste[i].setTrashed(true);

    var msg = nom + ' : ' + compte.patients + ' dossiers patients, ' + Object.keys(docs).length + ' documents au total ('
      + Math.round(fichier.getSize() / 1024) + ' Ko). Détail : ' + Object.keys(compte).map(function (c) { return c + ' ' + compte[c]; }).join(', ') + '.';
    Logger.log(msg);
    return msg;
  } catch (er) {
    // Alerte par e-mail (si elle ne part pas, Google envoie de toute façon son propre avis d'échec du déclencheur)
    try {
      var moi = Session.getEffectiveUser().getEmail();
      if (moi) MailApp.sendEmail(moi, '⚠️ Onco360 : la sauvegarde de cette nuit a échoué',
        'La sauvegarde quotidienne d\'Onco360 n\'a pas pu se faire.\n\nErreur : ' + (er && er.message || er) +
        '\n\nLes sauvegardes précédentes sont intactes (Drive > Sauvegardes > Onco360).\nSi le problème se répète demain, transmettez ce message.');
    } catch (em) { Logger.log('E-mail d\'alerte non envoyé : ' + em); }
    throw er;
  }
}

/* À LANCER UNE FOIS : vérifie l'accès, fait une première sauvegarde et la programme chaque nuit vers 3 h */
function installerSauvegardeOnco360() {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'sauvegardeOnco360') ScriptApp.deleteTrigger(t); });
  var msg = sauvegardeOnco360();
  ScriptApp.newTrigger('sauvegardeOnco360').timeBased().everyDays(1).atHour(3).nearMinute(0).inTimezone('Africa/Casablanca').create();
  Logger.log('✅ Sauvegarde Onco360 installée. ' + msg + ' Elle se fera désormais chaque nuit vers 3 h.');
}
