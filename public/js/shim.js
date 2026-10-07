// Remplace google.script.run (Apps Script) par le pont Firebase. Chargé AVANT l'application.
(function () {
  var file = [], pret = false;
  var INDISPO = { exporterFichier: "Enregistrement dans le Drive", archiverFiche: "Archivage PDF dans le Drive", syncAgendaPatient: "Google Agenda", syncAgendaTout: "Google Agenda", rafraichirApp: "Mise à jour serveur" };
  function executer(fn, arg, ok, ko) {
    var api = window.__FB_API;
    if (api && api[fn]) { api[fn](arg).then(ok, function (e) { console.error(fn, e); ko(e); }); return; }
    ko(new Error((INDISPO[fn] || fn) + " : pas encore disponible dans la version Firebase."));
  }
  window.__FB_PRET = function () { pret = true; var f = file; file = []; f.forEach(function (c) { executer.apply(null, c); }); };
  function chaine() {
    var ok = function () {}, ko = function () {};
    var c = { withSuccessHandler: function (f) { ok = f; return c; }, withFailureHandler: function (f) { ko = f; return c; } };
    ["listPatients", "getPatient", "savePatient", "deletePatient"].concat(Object.keys(INDISPO)).forEach(function (fn) {
      c[fn] = function (arg) { if (pret) executer(fn, arg, ok, ko); else file.push([fn, arg, ok, ko]); };
    });
    return c;
  }
  window.google = { script: { get run() { return chaine(); } } };
})();
