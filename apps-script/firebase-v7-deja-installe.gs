/* ===== Chimio HGC – lien Apps Script ↔ Firebase (morceau 4) — à coller dans un nouveau fichier « Firebase » =====
   Lit la base Firebase (Firestore) avec le compte Google de Dr Bentahila pour :
   1) la sauvegarde nocturne de toute la base Firebase dans Drive > Sauvegardes > Firebase (30 jours conservés) ;
   2) la synchronisation de l'agenda Google « Chimio HGC » toutes les 10 minutes – activée seulement à la bascule. */
var FB_PROJET = 'chimio-hgc';
var FB_BASE = 'https://firestore.googleapis.com/v1/projects/' + FB_PROJET + '/databases/(default)/documents/';

function fbGet_(chemin) {
  var r = UrlFetchApp.fetch(FB_BASE + chemin, {
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken(), 'x-goog-user-project': FB_PROJET },
    muteHttpExceptions: true
  });
  if (r.getResponseCode() !== 200) throw new Error('Firebase ' + r.getResponseCode() + ' : ' + r.getContentText().slice(0, 300));
  return JSON.parse(r.getContentText());
}

/* Valeur Firestore → valeur JavaScript */
function fbVal_(v) {
  if (v == null) return null;
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('timestampValue' in v) return v.timestampValue;
  if ('nullValue' in v) return null;
  if ('mapValue' in v) { var o = {}, f = v.mapValue.fields || {}; for (var k in f) o[k] = fbVal_(f[k]); return o; }
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(fbVal_);
  return null;
}

/* Tous les documents d'une collection : { id: {champ: valeur} } */
function fbCollection_(col) {
  var out = {}, jeton = '';
  for (var n = 0; n < 50; n++) {
    var j = fbGet_(col + '?pageSize=300' + (jeton ? '&pageToken=' + encodeURIComponent(jeton) : ''));
    (j.documents || []).forEach(function (d) {
      var id = d.name.split('/').pop(), o = {}, f = d.fields || {};
      for (var k in f) o[k] = fbVal_(f[k]);
      out[id] = o;
    });
    if (!j.nextPageToken) break;
    jeton = j.nextPageToken;
  }
  return out;
}

function dossierFb_(nom) {
  var racine = DriveApp.getFolderById(DOSSIER_ID);
  var sv = sousDossier_(racine, 'Sauvegardes');
  return sousDossier_(sv, nom);
}

/* 1) Sauvegarde nocturne de la base Firebase */
function sauvegardeFirebase() {
  var cols = ['patients', 'protocoles', 'finances', 'parametres', 'historique'], base = { projet: FB_PROJET, date: new Date().toISOString(), collections: {} }, nb = 0;
  cols.forEach(function (c) { base.collections[c] = fbCollection_(c); nb += Object.keys(base.collections[c]).length; });
  var dos = dossierFb_('Firebase');
  var jour = Utilities.formatDate(new Date(), 'Africa/Casablanca', 'yyyy-MM-dd');
  var nom = 'ChimioHGC_Firebase_' + jour + '.json';
  var ex = dos.getFilesByName(nom);
  while (ex.hasNext()) ex.next().setTrashed(true);
  dos.createFile(nom, JSON.stringify(base), MimeType.PLAIN_TEXT);
  var liste = [], it = dos.getFiles();
  while (it.hasNext()) liste.push(it.next());
  liste.sort(function (a, b) { return b.getDateCreated() - a.getDateCreated(); });
  for (var i = 30; i < liste.length; i++) liste[i].setTrashed(true);
  return nb + ' documents sauvegardés (' + Object.keys(base.collections.patients).length + ' dossiers patients) dans ' + nom;
}

/* 2) Agenda Google depuis Firebase (ne fait rien tant que la bascule n'est pas faite) */
function syncAgendaFirebase() {
  if (PropertiesService.getScriptProperties().getProperty('AGENDA_SOURCE') !== 'firebase') return 'Agenda : source = ancienne application (bascule non faite)';
  var pats = fbCollection_('patients'), evs = [];
  for (var id in pats) {
    try { (JSON.parse(pats[id].dossier || '{}').ag || []).forEach(function (e) { evs.push(e); }); } catch (e) {}
  }
  try { var a = fbGet_('parametres/agendaAbs'); var d = JSON.parse(fbVal_(a.fields.data) || '{}'); (JSON.parse(d.dossier || '{}').ag || []).forEach(function (e) { evs.push(e); }); } catch (e) {}
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try { return syncAgenda_(evs, null) + ' événement(s) mis à jour'; } finally { lock.releaseLock(); }
}

/* À LANCER UNE FOIS MAINTENANT : vérifie l'accès à Firebase et programme la sauvegarde nocturne (vers 2 h 30) */
function installerFirebase() {
  var n = Object.keys(fbCollection_('patients')).length;
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'sauvegardeFirebase') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('sauvegardeFirebase').timeBased().everyDays(1).atHour(2).nearMinute(30).inTimezone('Africa/Casablanca').create();
  var msg = sauvegardeFirebase();
  return 'Accès Firebase OK : ' + n + ' dossiers patients lus. ' + msg + '. Sauvegarde programmée chaque nuit vers 2 h 30.';
}

/* À LANCER LE JOUR DE LA BASCULE SEULEMENT : l'agenda Google suit désormais Firebase (toutes les 10 minutes) */
function basculerAgendaFirebase() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    var f = t.getHandlerFunction();
    if (f === 'syncAgendaTout' || f === 'syncAgendaFirebase') ScriptApp.deleteTrigger(t);
  });
  PropertiesService.getScriptProperties().setProperty('AGENDA_SOURCE', 'firebase');
  ScriptApp.newTrigger('syncAgendaFirebase').timeBased().everyMinutes(10).create();
  return 'Bascule faite : ' + syncAgendaFirebase();
}

/* En cas de retour arrière : l'agenda suit de nouveau l'ancienne application */
function annulerBasculeAgenda() {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'syncAgendaFirebase') ScriptApp.deleteTrigger(t); });
  PropertiesService.getScriptProperties().deleteProperty('AGENDA_SOURCE');
  return installerAgenda();
}

