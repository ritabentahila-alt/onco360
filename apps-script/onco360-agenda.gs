/* ===== Onco360 – Google Agenda (CODE A COLLER v9) =====
   À coller dans un NOUVEAU fichier « Onco360 Agenda » du projet Apps Script « Chimio HGC ».
   Utilise ce qui existe déjà dans le projet : calHGC_, dateCasa_, syncAgenda_ (fichier « Agenda ») et
   fbGet_, fbVal_, FB_BASE, FB_PROJET (fichier « Firebase »).

   Sens unique Onco360 → Google Agenda « Chimio HGC », toutes les 10 minutes :
     • rendez-vous, cures et séances (J1, J8…), étapes de radiothérapie à venir (déjà préparés par Onco360 dans
       chaque dossier, mêmes repères que l'ancienne application : aucun doublon) ;
     • absences (Configuration › Fermetures, congés).
   Ce qui est créé ou modifié dans Google Agenda ne revient PAS dans Onco360 ; un événement « Chimio HGC » modifié à la
   main dans Google Agenda est remis comme dans Onco360 au passage suivant.
   L'état (dernière mise à jour, nombre d'événements, erreur) est affiché dans Onco360 › Profil › Google Agenda.

   À LANCER UNE FOIS : installerAgendaOnco360 (menu déroulant en haut, puis « Exécuter »).
   Il remplace la synchronisation de l'ancienne application (syncAgendaTout, syncAgendaFirebase). */

var AG_ESPACE = 'cabinet-bentahila';
var AG_JOURS = 450; // horizon de l'agenda (même fenêtre que syncAgenda_)

/* Événements à venir lus dans Onco360 */
function agLireOnco360_() {
  var evs = [], jeton = '', base = 'espaces/' + AG_ESPACE + '/patients', nbP = 0;
  for (var n = 0; n < 2000; n++) {
    var j = fbGet_(base + '?pageSize=300&mask.fieldPaths=resume' + (jeton ? '&pageToken=' + encodeURIComponent(jeton) : ''));
    (j.documents || []).forEach(function (d) {
      nbP++;
      var r = d.fields && d.fields.resume ? fbVal_(d.fields.resume) : '';
      try { (JSON.parse(r || '{}').ag || []).forEach(function (e) { evs.push(e); }); } catch (e) { /* résumé illisible : dossier ignoré */ }
    });
    if (!j.nextPageToken) break;
    jeton = j.nextPageToken;
  }
  if (!nbP) throw new Error('Aucun dossier patient lu dans Onco360 : agenda laissé tel quel.');
  // Absences : une journée entière (ou plusieurs) dans l'agenda
  var c = fbGet_('espaces/' + AG_ESPACE + '/parametres/calendrier'), cal = {};
  try { cal = JSON.parse(fbVal_(c.fields && c.fields.data) || '{}'); } catch (e) {}
  (cal.abs || []).forEach(function (a) {
    if (!a.du) return;
    var au = a.au && a.au > a.du ? a.au : '';
    evs.push({ k: 'abs|' + a.du + '|' + (a.au || a.du), t: 'Absence' + (a.m || a.t ? ' : ' + (a.m || a.t) : ''), x: a.t && a.m ? a.t : '', d: a.du, f: au });
  });
  // Seulement la fenêtre de l'agenda (aujourd'hui → 450 jours) : un événement passé serait recréé à chaque passage
  var auj = Utilities.formatDate(new Date(), 'Africa/Casablanca', 'yyyy-MM-dd');
  var lim = Utilities.formatDate(new Date(Date.now() + (AG_JOURS - 1) * 864e5), 'Africa/Casablanca', 'yyyy-MM-dd');
  evs = evs.filter(function (e) { return e && e.k && e.d && (e.f && e.f > e.d ? e.f : e.d) >= auj && e.d <= lim; });
  return { evs: evs, patients: nbP };
}

/* État visible dans Onco360 (Profil › Google Agenda) */
function agEtat_(o) {
  var r = UrlFetchApp.fetch(FB_BASE + 'espaces/' + AG_ESPACE + '/parametres/agendaGoogle', {
    method: 'patch', contentType: 'application/json',
    payload: JSON.stringify({ fields: { data: { stringValue: JSON.stringify(o) } } }),
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken(), 'x-goog-user-project': FB_PROJET },
    muteHttpExceptions: true
  });
  if (r.getResponseCode() !== 200) Logger.log('État non enregistré dans Onco360 : ' + r.getResponseCode() + ' ' + r.getContentText().slice(0, 200));
}

/* Synchronisation (toutes les 10 minutes) : rien n'est touché dans l'agenda si Onco360 n'a pas changé depuis le
   dernier passage (sauf une fois par jour, pour remettre d'aplomb un événement modifié à la main) */
function syncAgendaOnco360() {
  var props = PropertiesService.getScriptProperties(), lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var l = agLireOnco360_(), evs = l.evs;
    var cle = evs.map(function (e) { return JSON.stringify([e.k, e.t, e.x || '', e.d, e.h || '', e.f || '']); }).sort().join('\n');
    var sig = Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, cle, Utilities.Charset.UTF_8));
    var jour = Utilities.formatDate(new Date(), 'Africa/Casablanca', 'yyyy-MM-dd'), maj = 0;
    if (sig !== props.getProperty('AG_SIG') || jour !== props.getProperty('AG_JOUR')) {
      maj = syncAgenda_(evs, null);
      props.setProperty('AG_SIG', sig); props.setProperty('AG_JOUR', jour);
      agEtat_({ le: new Date().toISOString(), nb: evs.length, maj: maj, patients: l.patients, calendrier: calHGC_().getName(), erreur: '' });
    } else if (!props.getProperty('AG_ETAT_LE') || Date.now() - Number(props.getProperty('AG_ETAT_LE')) > 3600e3) {
      agEtat_({ le: new Date().toISOString(), nb: evs.length, maj: 0, patients: l.patients, calendrier: calHGC_().getName(), erreur: '' });
    } else return 'Aucun changement';
    props.setProperty('AG_ETAT_LE', String(Date.now()));
    return evs.length + ' événement(s) à venir, ' + maj + ' créé(s) ou modifié(s)';
  } catch (er) {
    agEtat_({ le: new Date().toISOString(), erreur: String(er && er.message || er).slice(0, 300) });
    throw er;
  } finally { lock.releaseLock(); }
}

/* À LANCER UNE FOIS : l'agenda « Chimio HGC » suit désormais Onco360 (toutes les 10 minutes) */
function installerAgendaOnco360() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    var f = t.getHandlerFunction();
    if (f === 'syncAgendaTout' || f === 'syncAgendaFirebase' || f === 'syncAgendaOnco360') ScriptApp.deleteTrigger(t);
  });
  var props = PropertiesService.getScriptProperties();
  props.setProperty('AGENDA_SOURCE', 'onco360'); // l'ancienne fonction syncAgendaFirebase ne fait plus rien
  props.deleteProperty('AG_SIG');
  var msg = syncAgendaOnco360();
  ScriptApp.newTrigger('syncAgendaOnco360').timeBased().everyMinutes(10).create();
  Logger.log('✅ Google Agenda « ' + calHGC_().getName() + ' » relié à Onco360 : ' + msg + '. Mise à jour automatique toutes les 10 minutes.');
}

/* À LANCER QUAND VOTRE NOUVEL AGENDA « Onco360 » EST RELIÉ (Onco360 › Profil › Google Agenda) :
   arrête la mise à jour de l'ancien agenda par ce script (ses événements restent ; supprimez-le dans Google Agenda si besoin) */
function arreterAgendaAppsScript() {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'syncAgendaOnco360') ScriptApp.deleteTrigger(t); });
  PropertiesService.getScriptProperties().setProperty('AGENDA_SOURCE', 'arrete');
  agEtat_({ le: new Date().toISOString(), arrete: true }); // n'utilise plus le fichier « Agenda » (il peut avoir disparu)
  Logger.log('✅ Ancienne synchronisation arrêtée : l\'ancien agenda n\'est plus mis à jour par ce script.');
}
