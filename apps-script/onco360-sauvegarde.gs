/* ===== Onco360 – sauvegarde quotidienne (CODE A COLLER v11, AUTONOME) =====
   v11 (20/10/2026, lot R-F de l'audit n° 8) : la copie est au FORMAT DE L'EXPORT COMPLET d'Onco360 : elle se remet dans Onco360 avec le même
   outil (node outils/restaurer-export.mjs <copie.json> <cabinet>, ou outils/recuperer.mjs pour un seul dossier). Les dates restent des
   dates (liste « dates »), les références et les données binaires sont notées ; le journal d'audit du cabinet est inclus ; la limite de
   6 minutes d'Apps Script est surveillée (si le temps manque, le journal d'audit est coupé et un e-mail le signale ; s'il manque avant, la
   sauvegarde est annulée, les anciennes sont gardées, e-mail d'alerte).
   v10 (11/10/2026) : ce fichier se suffit à lui-même (plus besoin des fichiers « Code » et « Firebase » de l'ancienne application).

   Chaque nuit vers 3 h, copie TOUT Onco360 dans Drive > Application Chimio HGC > Sauvegardes > Onco360 > Onco360_AAAA-MM-JJ.json :
     • espaces/cabinet-bentahila et toutes ses collections (patients, patientsFinances, finances, parametres, protocoles,
       etablissements, membres, consultations… et celles ajoutées plus tard, trouvées automatiquement) ;
     • les profils (utilisateurs) des seuls membres de ce cabinet ; le journal d'audit du cabinet.
   Conservation : les 30 dernières sauvegardes, plus celle du 1er de chaque mois (gardée sans limite).
   En cas d'échec : e-mail d'alerte, et les anciennes sauvegardes ne sont pas effacées.

   POUR PASSER DE v10 À v11 : remplacer tout le texte du fichier par celui-ci, Enregistrer, puis lancer une fois installerSauvegardeOnco360.
   À LANCER UNE FOIS : installerSauvegardeOnco360 (menu déroulant en haut, puis « Exécuter »). */

var ONCO_PROJET = 'chimio-hgc';
var ONCO_BASE = 'https://firestore.googleapis.com/v1/projects/' + ONCO_PROJET + '/databases/(default)/documents/';
var ONCO_DOSSIER_ID = '1T_-w1N7KHQVrMotsX9byCwSvHhdejJKb'; // dossier « Application Chimio HGC » du Drive (il peut être déplacé)
var ONCO_ESPACE = 'cabinet-bentahila';
var ONCO_GARDER = 30;

/* Lecture d'un document ou d'une page de collection Firestore, avec le compte Google qui exécute le script */
function oncoGet_(chemin) {
  var r = UrlFetchApp.fetch(ONCO_BASE + chemin, {
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken(), 'x-goog-user-project': ONCO_PROJET },
    muteHttpExceptions: true
  });
  if (r.getResponseCode() !== 200) throw new Error('Firebase ' + r.getResponseCode() + ' : ' + r.getContentText().slice(0, 300));
  return JSON.parse(r.getContentText());
}

var ONCO_DEBUT = 0, ONCO_BUDGET = 5 * 60 * 1000 + 15000; // limite d'Apps Script : 6 min par exécution (marge pour écrire le fichier)
function oncoTemps_() { return Date.now() - ONCO_DEBUT; }

/* Valeur Firestore → valeur JavaScript, au format de l'export d'Onco360 : chaque date est notée dans `dates` (chemin du champ,
   ex. "maj", "fil.0.le") pour redevenir une date à la restauration ; référence → chemin du document (noté dans `refs`) ;
   données binaires → base64 (notées dans `octets`) */
function oncoVal_(v, n, chemin) {
  if (v == null) return null;
  var sous = function (k) { return (chemin ? chemin + '.' : '') + k; };
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('timestampValue' in v) { if (n) n.dates.push(chemin || ''); return new Date(v.timestampValue).toISOString(); }
  if ('nullValue' in v) return null;
  if ('referenceValue' in v) { if (n) n.refs.push(chemin || ''); return String(v.referenceValue).split('/documents/').pop(); }
  if ('geoPointValue' in v) return { latitude: v.geoPointValue.latitude || 0, longitude: v.geoPointValue.longitude || 0 };
  if ('bytesValue' in v) { if (n) n.octets.push(chemin || ''); return v.bytesValue; }
  if ('mapValue' in v) { var o = {}, f = v.mapValue.fields || {}; for (var k in f) o[k] = oncoVal_(f[k], n, sous(k)); return o; }
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(function (x, i) { return oncoVal_(x, n, sous(i)); });
  return null;
}
/* Champs d'un document → { data, n (dates, refs, octets) } */
function oncoDoc_(fields) {
  var n = { dates: [], refs: [], octets: [] }, o = {}, f = fields || {};
  for (var k in f) o[k] = oncoVal_(f[k], n, k);
  return { data: o, n: n };
}
/* Range un document dans la copie : J.collections ou autre partie, et ses dates / références sous la clé donnée */
function oncoRanger_(J, cle, d) {
  if (d.n.dates.length) J.dates[cle] = d.n.dates;
  if (d.n.refs.length) J.refs[cle] = d.n.refs;
  if (d.n.octets.length) J.octets[cle] = d.n.octets;
  return d.data;
}

/* Sous-dossier du Drive (créé s'il n'existe pas) */
function oncoSousDossier_(parent, nom) {
  var it = parent.getFoldersByName(nom);
  return it.hasNext() ? it.next() : parent.createFolder(nom);
}

/* Dossier de sauvegarde : Application Chimio HGC > Sauvegardes > nom */
function oncoDossier_(nom) {
  return oncoSousDossier_(oncoSousDossier_(DriveApp.getFolderById(ONCO_DOSSIER_ID), 'Sauvegardes'), nom);
}

/* Requête POST à Firestore (liste des collections d'un document) */
function oncoPost_(chemin, corps) {
  var url = chemin ? ONCO_BASE + chemin : ONCO_BASE.replace(/\/$/, '');
  var r = UrlFetchApp.fetch(url + ':listCollectionIds', {
    method: 'post', contentType: 'application/json', payload: JSON.stringify(corps),
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken(), 'x-goog-user-project': ONCO_PROJET },
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

/* Tous les documents d'une collection : fn(identifiant, { data, n }) pour chacun ; s'arrête si le temps manque (renvoie false) */
function oncoDocuments_(col, fn, budget) {
  var jeton = '';
  for (var n = 0; n < 2000; n++) {
    if (oncoTemps_() > budget) return false;
    var j = oncoGet_(col + '?pageSize=300' + (jeton ? '&pageToken=' + encodeURIComponent(jeton) : ''));
    (j.documents || []).forEach(function (d) { fn(d.name.split('/').pop(), oncoDoc_(d.fields)); });
    if (!j.nextPageToken) return true;
    jeton = j.nextPageToken;
  }
  throw new Error('Collection ' + col + ' trop grande : sauvegarde interrompue.');
}

/* La sauvegarde elle-même (lancée chaque nuit) */
function sauvegardeOnco360() {
  ONCO_DEBUT = Date.now();
  try {
    var esp = 'espaces/' + ONCO_ESPACE, compte = {}, incomplet = '';
    var J = { application: 'Onco360', format: 1, sorte: 'copie Drive v11', projet: ONCO_PROJET, espace: ONCO_ESPACE, date: new Date().toISOString(),
      cabinet: null, collections: {}, utilisateurs: {}, journalAudit: {}, dates: {}, refs: {}, octets: {}, compte: compte };
    J.cabinet = oncoRanger_(J, '@cabinet', oncoDoc_(oncoGet_(esp).fields));
    var cols = oncoSousCollections_(esp);
    if (cols.indexOf('patients') < 0) throw new Error('Aucune collection « patients » dans ' + esp + ' : sauvegarde annulée.');
    cols.forEach(function (c) {
      J.collections[c] = {}; compte[c] = 0;
      var fini = oncoDocuments_(esp + '/' + c, function (id, d) { J.collections[c][id] = oncoRanger_(J, c + '/' + id, d); compte[c]++; }, ONCO_BUDGET);
      if (!fini) throw new Error('Temps d\'Apps Script dépassé en lisant « ' + c + ' » : sauvegarde annulée (les anciennes sont gardées).');
    });
    // Profils des membres de ce cabinet seulement (nom, INPE, photo)
    compte.utilisateurs = 0;
    Object.keys(J.collections.membres || {}).forEach(function (uid) {
      try { J.utilisateurs[uid] = oncoRanger_(J, 'utilisateurs/' + uid, oncoDoc_(oncoGet_('utilisateurs/' + uid).fields)); compte.utilisateurs++; } catch (e404) { /* membre sans profil */ }
    });
    if (!compte.patients) throw new Error('0 dossier patient lu : sauvegarde annulée (les anciennes sont gardées).');
    // Journal d'audit du cabinet, en dernier : coupé (et signalé) si le temps manque
    compte.journalAudit = 0;
    try {
      var auditFini = oncoDocuments_('audit/' + ONCO_ESPACE + '/lignes', function (id, d) { J.journalAudit[id] = oncoRanger_(J, '@audit/' + id, d); compte.journalAudit++; }, ONCO_BUDGET);
      if (!auditFini) incomplet = 'journal d\'audit coupé (temps d\'Apps Script dépassé) : ' + compte.journalAudit + ' ligne(s) copiée(s)';
    } catch (ea) { incomplet = 'journal d\'audit non copié : ' + (ea && ea.message || ea); }
    if (incomplet) J.incomplet = incomplet;

    var jour = Utilities.formatDate(new Date(), 'Africa/Casablanca', 'yyyy-MM-dd');
    var nom = 'Onco360_' + jour + '.json';
    var dos = oncoDossier_('Onco360');
    var ex = dos.getFilesByName(nom);
    while (ex.hasNext()) ex.next().setTrashed(true);
    var fichier = dos.createFile(Utilities.newBlob(JSON.stringify(J), 'application/json', nom));

    // Conservation : les 30 plus récentes + celle du 1er de chaque mois
    var liste = [], it = dos.getFiles();
    while (it.hasNext()) { var x = it.next(); if (/^Onco360_\d{4}-\d{2}-\d{2}\.json$/.test(x.getName())) liste.push(x); }
    liste.sort(function (a, b) { return b.getName() < a.getName() ? -1 : 1; });
    for (var i = ONCO_GARDER; i < liste.length; i++) if (!/-01\.json$/.test(liste[i].getName())) liste[i].setTrashed(true);

    var msg = nom + ' : ' + compte.patients + ' dossiers patients (' + Math.round(fichier.getSize() / 1024) + ' Ko, ' + Math.round(oncoTemps_() / 1000) + ' s). Détail : ' +
      Object.keys(compte).map(function (c) { return c + ' ' + compte[c]; }).join(', ') + '.' + (incomplet ? ' ATTENTION : ' + incomplet + '.' : '');
    Logger.log(msg);
    if (incomplet) oncoAlerte_('⚠️ Onco360 : sauvegarde de cette nuit incomplète', 'La sauvegarde de cette nuit est faite, mais incomplète : ' + incomplet +
      '.\n\nToutes les données des dossiers sont copiées ; seul le journal d\'audit est en partie absent. Si cela se répète, transmettez ce message.');
    return msg;
  } catch (er) {
    oncoAlerte_('⚠️ Onco360 : la sauvegarde de cette nuit a échoué', 'La sauvegarde quotidienne d\'Onco360 n\'a pas pu se faire.\n\nErreur : ' + (er && er.message || er) +
      '\n\nLes sauvegardes précédentes sont intactes (Drive > Sauvegardes > Onco360).\nSi le problème se répète demain, transmettez ce message.');
    throw er;
  }
}
/* E-mail d'alerte (si elle ne part pas, Google envoie de toute façon son propre avis d'échec du déclencheur) */
function oncoAlerte_(sujet, texte) {
  try { var moi = Session.getEffectiveUser().getEmail(); if (moi) MailApp.sendEmail(moi, sujet, texte); } catch (em) { Logger.log('E-mail d\'alerte non envoyé : ' + em); }
}

/* À LANCER UNE FOIS : vérifie l'accès, fait une première sauvegarde et la programme chaque nuit vers 3 h */
function installerSauvegardeOnco360() {
  // v10, v11 : tous les déclencheurs du projet sont retirés (anciens compris), puis seul celui de cette sauvegarde est recréé
  ScriptApp.getProjectTriggers().forEach(function (t) { ScriptApp.deleteTrigger(t); });
  var msg = sauvegardeOnco360();
  ScriptApp.newTrigger('sauvegardeOnco360').timeBased().everyDays(1).atHour(3).nearMinute(0).inTimezone('Africa/Casablanca').create();
  Logger.log('✅ Sauvegarde Onco360 installée. ' + msg + ' Elle se fera désormais chaque nuit vers 3 h.');
}
