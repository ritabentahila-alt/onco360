// node functions/test-logique.js — vérifie la logique Google Agenda contre un faux Google Agenda (aucun accès réseau)
const L = require("./logique");
const ok = (c, m) => { console.log((c ? "✅ " : "❌ ") + m); if (!c) process.exitCode = 1; };
// Faux Google Agenda (REST)
const CAL = {}; let appels = 0, panne = 0;
const faux = async (url, o) => {
  appels++; const u = new URL(url), p = decodeURIComponent(u.pathname).replace("/calendar/v3", ""), m = o.method, b = o.body ? JSON.parse(o.body) : null;
  const rep = (s, j) => ({ ok: s < 300, status: s, text: async () => (j ? JSON.stringify(j) : "") });
  if (panne > 0) { panne--; return rep(503, { error: "x" }); }
  let r;
  if (m === "POST" && p === "/calendars") { const id = "cal" + Object.keys(CAL).length + "@group"; CAL[id] = {}; return rep(200, { id }); }
  if ((r = p.match(/^\/calendars\/([^/]+)$/))) { if (!CAL[r[1]]) return rep(404, {}); if (m === "DELETE") { delete CAL[r[1]]; return rep(204); } return rep(200, { id: r[1] }); }
  if ((r = p.match(/^\/calendars\/([^/]+)\/events$/))) {
    const c = CAL[r[1]];
    if (m === "POST") { if (c[b.id]) return rep(409, {}); c[b.id] = b; return rep(200, b); }
    const [fk, fv] = u.searchParams.get("privateExtendedProperty").split("="), tmin = u.searchParams.get("timeMin");
    const fin = (e) => (e.end.date ? e.end.date + "T00:00:00Z" : e.end.dateTime + "Z");
    return rep(200, { items: Object.values(c).filter((e) => e.status !== "cancelled" && e.extendedProperties.private[fk] === fv && fin(e) > tmin) });
  }
  if ((r = p.match(/^\/calendars\/([^/]+)\/events\/([^/]+)$/))) {
    const c = CAL[r[1]], e = c[r[2]];
    if (m === "PATCH") { if (!e) return rep(404, {}); c[r[2]] = Object.assign(e, b); return rep(200, c[r[2]]); }
    if (m === "DELETE") { if (!e || e.status === "cancelled") return rep(410, {}); e.status = "cancelled"; return rep(204); }
  }
  return rep(400, { p, m });
};
const api = L.creerApi("jeton", faux);
const AUJ = "2026-10-06";
const resume = (ag) => JSON.stringify({ ag });
const P1 = { etablissementId: "HGC", resume: resume([
  { k: "P1|r|r1", t: "🩺 ALAOUI – Suivi (HGC)", d: "2026-10-08", h: "23:45" },
  { k: "P1|c|0|3", t: "💉 ALAOUI – C3/6", d: "2026-10-20" }, { k: "P1|s|0|3|8", t: "💉 ALAOUI – C3 J8", d: "2026-10-27" },
  { k: "P1|rt|x|deb", t: "☢️ ALAOUI – 1re séance", d: "2026-11-02" }, { k: "P1|r|vieux", t: "passé", d: "2026-09-01" }, { k: "P1|r|loin", t: "loin", d: "2028-06-01" }]) };
const P2 = { etablissementId: "CIOC", resume: resume([{ k: "P2|r|h", t: "🏥 BENNANI – Hospitalisation", d: "2026-10-04", f: "2026-10-09" }]) };
const medecin = { actif: true, tousEtablissements: true, droits: { traitements: "modifier", radiotherapie: "modifier" } };
const secretaireHGC = { actif: true, tousEtablissements: false, etablissements: ["HGC"], droits: { traitements: "aucun", radiotherapie: "aucun" } };
const infirmiere = { actif: true, etablissements: ["HGC", "CIOC"], droits: { traitements: "voir", radiotherapie: "voir" } };

(async () => {
  // Droits et périmètre
  ok(L.evtsPatient(P1, medecin, AUJ).length === 4, "médecin : 4 événements à venir (passé et au-delà de 450 j exclus)");
  ok(L.evtsPatient(P1, secretaireHGC, AUJ).map((e) => e.k).join() === "P1|r|r1", "secrétaire sans droit traitements/RT : seulement la consultation");
  ok(L.evtsPatient(P2, secretaireHGC, AUJ).length === 0 && L.evtsPatient(P2, infirmiere, AUJ).length === 1, "périmètre : CIOC invisible pour la secrétaire HGC, visible pour l'infirmière");
  ok(L.evtsPatient(P1, Object.assign({}, medecin, { actif: false }), AUJ).length === 0, "membre désactivé : rien");
  // Infirmière (06/10) : pas de consultations ; radiothérapie seulement si le patient est sous chimio en même temps
  const inf2 = { actif: true, tousEtablissements: true, droits: { traitements: "voir", radiotherapie: "chimio", consultations: false } };
  const avecR = (doc, r) => Object.assign({}, doc, { resume: JSON.stringify(Object.assign(JSON.parse(doc.resume), r)) });
  const P1rc = avecR(P1, { t: { st: "cours" }, rtS: [{ st: "prev" }] }), P1rt = avecR(P1, { t: null, rtS: [{ st: "cours" }] });
  ok(L.evtsPatient(P1rc, inf2, AUJ).map((e) => e.k).sort().join() === "P1|c|0|3,P1|rt|x|deb,P1|s|0|3|8", "infirmière, patient radio-chimio : cures + radiothérapie, sans la consultation");
  ok(L.evtsPatient(P1rt, inf2, AUJ).map((e) => e.k).sort().join() === "P1|c|0|3,P1|s|0|3|8", "infirmière, patient sans chimio en cours : pas de radiothérapie");
  ok(L.evtsPatient(null, medecin, AUJ).length === 0 && L.evtsPatient({ etablissementId: "HGC", resume: "{abîmé" }, medecin, AUJ).length === 0, "dossier supprimé ou résumé illisible : rien (sans planter)");
  // Corps des événements
  const b1 = L.corps({ k: "P1|r|r1", t: "x", d: "2026-10-08", h: "23:45" });
  ok(/^[0-9a-f]{40}$/.test(b1.id) && b1.start.dateTime === "2026-10-08T23:45:00" && b1.end.dateTime === "2026-10-09T00:15:00" && b1.start.timeZone === "Africa/Casablanca", "rendez-vous à 23 h 45 : fin à 00 h 15 le lendemain, heure du Maroc, identifiant valide");
  const b2 = L.corps({ k: "P2|r|h", t: "x", d: "2026-10-04", f: "2026-10-09" });
  ok(b2.start.date === "2026-10-04" && b2.end.date === "2026-10-10", "hospitalisation du 4 au 9 : journées entières, fin exclusive le 10");
  ok(L.evtsAbsences({ abs: [{ du: "2026-10-26", au: "2026-10-30", m: "ESMO" }, { du: "2026-01-01", m: "passée" }] }, AUJ).length === 1, "absences : seules les futures");
  // Synchronisation
  const cal = (await api.creerAgenda()).id;
  let v = L.evtsPatient(P1, medecin, AUJ).concat(L.evtsPatient(P2, medecin, AUJ));
  let r = await L.appliquer(api, cal, v, await api.lister(cal, "onco360=1", L.timeMin(AUJ)), AUJ);
  ok(r.crees === 5 && Object.keys(CAL[cal]).length === 5, "1re fois : 5 créés");
  appels = 0; r = await L.appliquer(api, cal, v, await api.lister(cal, "onco360=1", L.timeMin(AUJ)), AUJ);
  ok(r.crees + r.modifies + r.supprimes === 0 && appels === 1, "2e fois sans changement : aucune écriture (1 seule lecture)");
  // Rendez-vous déplacé + cure supprimée, synchronisation du seul patient P1
  const P1b = { etablissementId: "HGC", resume: P1.resume.replace('"h":"23:45"', '"h":"11:00"').replace(/\{"k":"P1\|c\|0\|3"[^}]*\},/, "") };
  r = await L.appliquer(api, cal, L.evtsPatient(P1b, medecin, AUJ), await api.lister(cal, "g=P1", L.timeMin(AUJ)), AUJ);
  const ev = Object.values(CAL[cal]).filter((e) => e.status !== "cancelled");
  ok(r.modifies === 1 && r.supprimes === 1 && ev.length === 4 && ev.find((e) => e.extendedProperties.private.k === "P1|r|r1").start.dateTime === "2026-10-08T11:00:00", "rdv déplacé à 11 h modifié, cure supprimée retirée, P2 intact");
  // La cure revient (même identifiant qu'un événement supprimé) : remise en place sans erreur
  r = await L.appliquer(api, cal, L.evtsPatient(P1, medecin, AUJ), await api.lister(cal, "g=P1", L.timeMin(AUJ)), AUJ);
  ok(r.crees === 1 && Object.values(CAL[cal]).filter((e) => e.status !== "cancelled").length === 5, "cure rétablie : identifiant réutilisé (409 → remise en place), pas de doublon");
  // Le lendemain du rdv : l'événement passé n'est pas effacé (historique gardé)
  r = await L.appliquer(api, cal, L.evtsPatient(P1, medecin, "2026-10-09").concat(L.evtsPatient(P2, medecin, "2026-10-09")), await api.lister(cal, "onco360=1", L.timeMin("2026-10-09")), "2026-10-09");
  ok(r.supprimes === 0 && CAL[cal][L.idEv("P1|r|r1")].status === "confirmed", "jour suivant : le rendez-vous passé reste dans l'agenda (historique)");
  // Patient changé d'établissement (hors périmètre de la secrétaire) : retiré de son agenda
  const cal2 = (await api.creerAgenda()).id;
  await L.appliquer(api, cal2, L.evtsPatient(P1, secretaireHGC, AUJ), [], AUJ);
  r = await L.appliquer(api, cal2, L.evtsPatient(Object.assign({}, P1, { etablissementId: "CIOC" }), secretaireHGC, AUJ), await api.lister(cal2, "g=P1", L.timeMin(AUJ)), AUJ);
  ok(r.supprimes === 1 && Object.values(CAL[cal2]).every((e) => e.status === "cancelled"), "patient passé au CIOC : retiré de l'agenda de la secrétaire HGC");
  // Google momentanément indisponible : nouvel essai automatique
  panne = 2; r = await L.appliquer(api, cal2, L.evtsPatient(P1, secretaireHGC, AUJ), await api.lister(cal2, "g=P1", L.timeMin(AUJ)), AUJ);
  ok(r.crees === 1, "Google indisponible 2 fois de suite : réussi au 3e essai");
  ok(L.jourCasa(new Date("2026-10-06T12:00:00Z")) === "2026-10-06", "date du jour (fuseau Africa/Casablanca)");
})();
