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
    if (m === "POST") { if (b.start && b.start.dateTime && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00$/.test(b.start.dateTime)) return rep(400, { error: { message: "Invalid start time." } }); if (c[b.id]) return rep(409, {}); c[b.id] = b; return rep(200, b); }
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

// ───── Tâches (T6, 08/10/2026) : échéance dans l'agenda du responsable ─────
(async () => {
  await new Promise((ok) => setTimeout(ok, 50)); // après les tests précédents
  const J0 = "2026-10-08", base = { de: "MED", deNom: "Dr Bentahila", pour: "SEC", pourNom: "Sara", statut: "afaire", titre: "Relancer le labo", desc: "Résultat du bilan", urgent: false, h: "" };
  const T1 = Object.assign({}, base, { id: "t1", ech: "2026-10-10" });
  const T2 = Object.assign({}, base, { id: "t2", ech: "2026-10-09", h: "14:30", urgent: true, patientId: "P1", patientNom: "ANCIEN NOM" });
  const T3 = Object.assign({}, base, { id: "t3", ech: "" }), T4 = Object.assign({}, base, { id: "t4", ech: "2026-10-10", statut: "fait" }), T5 = Object.assign({}, base, { id: "t5", ech: "2026-10-10", pour: "INF" });
  const ev = L.colorer(L.evtsTaches([T1, T2, T3, T4, T5], "SEC", J0, { P1: "PATIENT TEST" }), {});
  ok(ev.length === 2, "tâches du responsable avec échéance, non terminées (sans échéance, terminée, autre responsable : exclues)");
  const b1 = L.corps(ev.find((e) => e.k === "tache-t1|t")), b2 = L.corps(ev.find((e) => e.k === "tache-t2|t"));
  ok(b1.start.date === "2026-10-10" && b1.end.date === "2026-10-11" && b1.summary === "Tâche – Relancer le labo", "sans heure : journée entière, titre « Tâche – … »");
  ok(b2.start.dateTime === "2026-10-09T14:30:00" && b2.end.dateTime === "2026-10-09T14:45:00", "avec heure : 15 minutes");
  ok(b2.summary === "URGENT – Tâche – Relancer le labo (PATIENT TEST)" && b2.colorId === "11" && b1.colorId === "8", "urgente : « URGENT », rouge ; nom actuel du patient ; autres : graphite");
  ok(b1.reminders.useDefault === false && b1.reminders.overrides.length === 0 && b1.transparency === "transparent", "aucun rappel Google, créneau laissé libre");
  ok(/Demandée par Dr Bentahila/.test(b1.description) && /chimio-hgc\.web\.app\/v2\.html#taches/.test(b1.description), "description : auteur et lien vers les tâches");
  ok(L.evtsTaches([Object.assign({}, T1, { pour: "MED" })], "MED", J0).length === 1 && /vous-même/.test(L.evtsTaches([Object.assign({}, T1, { pour: "MED", de: "MED" })], "MED", J0)[0].x), "tâche pour soi-même : « Demandée par vous-même »");
  // Dans l'agenda : création, retard (reportée sur aujourd'hui), terminée (retirée), réattribuée (retirée de l'ancien)
  const cal = (await api.creerAgenda()).id, g = "tache-t1";
  let r = await L.appliquer(api, cal, L.evtsTaches([T1], "SEC", J0), await api.lister(cal, "g=" + g, L.timeMin(J0)), J0);
  ok(r.crees === 1, "échéance ajoutée à l'agenda de la secrétaire");
  r = await L.appliquer(api, cal, L.evtsTaches([T1], "SEC", J0), await api.lister(cal, "g=" + g, L.timeMin(J0)), J0);
  ok(r.crees === 0 && r.modifies === 0, "rien de changé : aucune écriture dans Google");
  const J3 = "2026-10-12", evR = L.evtsTaches([T1], "SEC", J3);
  ok(evR.length === 1 && evR[0].d === J3 && /^EN RETARD – Tâche/.test(evR[0].t) && L.colorer(evR, {})[0].coul === "11" && /échéance du 10\/10\/2026/.test(evR[0].x), "en retard : reportée sur aujourd'hui, « EN RETARD », rouge, échéance d'origine rappelée");
  r = await L.appliquer(api, cal, evR, await api.lister(cal, "g=" + g, L.timeMin(J3)), J3);
  const e1 = CAL[cal][L.idEv("tache-t1|t")];
  ok(e1.start.date === J3 && Object.values(CAL[cal]).filter((e) => e.status !== "cancelled").length === 1, "nuit suivante : déplacée sur le jour même, sans doublon");
  r = await L.appliquer(api, cal, L.evtsTaches([Object.assign({}, T1, { statut: "fait" })], "SEC", J3), await api.lister(cal, "g=" + g, L.timeMin(J3)), J3);
  ok(r.supprimes === 1 && e1.status === "cancelled", "terminée : retirée de l'agenda");
  const cal3 = (await api.creerAgenda()).id;
  await L.appliquer(api, cal3, L.evtsTaches([T2], "SEC", J0), [], J0);
  r = await L.appliquer(api, cal3, L.evtsTaches([Object.assign({}, T2, { pour: "INF" })], "SEC", J0), await api.lister(cal3, "g=tache-t2", L.timeMin(J0)), J0);
  ok(r.supprimes === 1, "réattribuée à l'infirmière : retirée de l'agenda de la secrétaire");
  ok(L.groupe("tache-t2|t") === "tache-t2", "une tâche = un groupe (mise à jour d'une seule tâche)");
})();

// ───── Couleurs par type (08/10/2026) ─────
(async () => {
  await new Promise((ok) => setTimeout(ok, 120));
  const E = (k, t) => ({ k, t, d: "2026-10-20" });
  const cas = [[E("P|r|1", "🩺 ALAMI – Consultation annonce (HGC)"), "annonce"], [E("P|r|2", "🩺 ALAMI – Consultation suivi"), "suivi"], [E("P|r|3", "🩺 ALAMI – Consultation de contrôle"), "suivi"],
    [E("P|r|4", "🩺 ALAMI – Consultation en cours de radiothérapie"), "rtc"], [E("P|r|5", "ALAMI – Hospitalisation du 20/10/2026 au 22/10/2026 (3 j ouvrés)"), "hospit"], [E("P|r|6", "🩺 ALAMI – 2nd avis"), "autre"],
    [E("P|c|0|2", "💉 ALAMI – C2/6 · FOLFOX"), "chimio"], [E("P|s|0|2|8", "💉 ALAMI – C2 J8 · FOLFOX"), "chimio"], [E("P|rt|r1|scan", "☢️ ALAMI – Scanner de centrage"), "rt"], [E("P|rt|r1|dosi", "☢️ ALAMI – Dosimétrie à valider"), "dosi"],
    [E("abs|2026-10-20|2026-10-22", "Absence : Congrès"), "abs"], [Object.assign(E("tache-x|t", "Tâche – x"), { tache: true }), "tache"], [Object.assign(E("tache-y|t", "URGENT – Tâche – y"), { tache: true, urg: true }), "tacheUrg"]];
  ok(cas.every(([e, c]) => L.categorie(e) === c), "catégorie de chaque événement (annonce, suivi, contrôle, en cours de RT, hospitalisation, autre, chimio, RT, dosimétrie, absence, tâches)");
  const d = L.colorer(cas.map(([e]) => Object.assign({}, e)), {});
  ok(d.map((e) => e.coul).join(",") === "4,7,7,1,9,7,10,10,3,6,5,8,11", "couleurs par défaut (tableau du 08/10/2026)");
  const r = L.colorer(cas.map(([e]) => Object.assign({}, e)), { annonce: "11", abs: "" });
  ok(r[0].coul === "11" && r[10].coul === "" && r[1].coul === "7", "couleurs du cabinet : annonce en rouge, absences couleur de l'agenda, le reste par défaut");
  ok(L.corps(r[0]).colorId === "11" && L.corps(r[10]).colorId === null && !("colorId" in L.corps(E("P|r|9", "x"))), "corps : colorId réglé, null pour la couleur de l'agenda");
  // Couleur changée : l'événement est repeint ; inchangée : rien n'est réécrit ; couleur retirée : rendue à l'agenda
  const cal = (await api.creerAgenda()).id, ev1 = () => [Object.assign({}, cas[0][0])];
  let x = await L.appliquer(api, cal, L.colorer(ev1(), {}), [], "2026-10-08");
  const id = L.idEv("P|r|1"); ok(x.crees === 1 && CAL[cal][id].colorId === "4", "créé avec sa couleur (annonce : Flamant)");
  x = await L.appliquer(api, cal, L.colorer(ev1(), {}), await api.lister(cal, "g=P", L.timeMin("2026-10-08")), "2026-10-08");
  ok(x.modifies === 0, "même couleur : aucune écriture");
  x = await L.appliquer(api, cal, L.colorer(ev1(), { annonce: "11" }), await api.lister(cal, "g=P", L.timeMin("2026-10-08")), "2026-10-08");
  ok(x.modifies === 1 && CAL[cal][id].colorId === "11", "couleur changée dans la Configuration : événement repeint");
  x = await L.appliquer(api, cal, L.colorer(ev1(), { annonce: "" }), await api.lister(cal, "g=P", L.timeMin("2026-10-08")), "2026-10-08");
  ok(x.modifies === 1 && CAL[cal][id].colorId === null, "« couleur de l'agenda » : couleur retirée");
})();

// ───── Prix fixé par la secrétaire (salle d'attente, 08/10/2026) ─────
(() => {
  ok(L.peutPrix({ role: "assistante", actif: true, droits: {} }) && L.peutPrix({ role: "medecin", actif: true }), "secrétaire et médecin : droit de fixer un prix (droits par défaut du rôle)");
  ok(!L.peutPrix({ role: "infirmiere", actif: true, droits: {} }) && !L.peutPrix({ role: "assistante", actif: false }) && !L.peutPrix({ role: "assistante", actif: true, droits: { encaissements: false } }), "refusé : infirmière, accès désactivé, droit « encaissements » retiré");
  const dos = { rdvsJson: JSON.stringify([{ id: "r1", type: "Suivi", d: "2026-10-08", st: "fait" }, { id: "r2", type: "Hospitalisation", d: "2026-10-08", st: "fait" }, { id: "r3", type: "Suivi", d: "2026-10-08", st: "prevu" }, { id: "r4", type: "Suivi", d: "2026-01-02", st: "fait" }]),
    lignesJson: JSON.stringify([{ id: "L1", cures: [{}, {}] }]) };
  const M = { rdv: { r4: { v1: true, prix: 300 } }, cures: { L1: { 1: { hon: { 1: { m: 500 } } } } }, rt: { x: { m: 1 } } }, E = { rdv: {}, cons: {} };
  L.appliquerPrix(dos, M, E, { rdvId: "r1", montant: "250" });
  ok(M.rdv.r1.brut === 250 && E.rdv.r1.m === 250, "consultation : brut et prix à encaisser");
  L.appliquerPrix(dos, M, E, { rdvId: "r1", montant: 0 });
  ok(M.rdv.r1.brut === 0 && E.rdv.r1.m === 0, "gratuité (0) : prix modifié même déjà validé");
  L.appliquerPrix(dos, M, E, { rdvId: "r2", montant: 400 });
  ok(M.rdv.r2.tj === 400 && E.rdv.r2.tj === 400, "hospitalisation : tarif journalier");
  let er = ""; try { L.appliquerPrix(dos, M, E, { rdvId: "r4", montant: 200 }); } catch (e) { er = e.message; }
  ok(/ancienne application/.test(er) && M.rdv.r4.prix === 300, "refusé : prix repris de l'ancienne application (médecin seulement, bilan inchangé)");
  er = ""; try { L.appliquerPrix(dos, M, E, { rdvId: "r3", montant: 100 }); } catch (e) { er = e.message; }
  ok(/pas validé/.test(er) && !M.rdv.r3, "refusé : rendez-vous non validé « Venu »");
  er = ""; try { L.appliquerPrix(dos, M, E, { rdvId: "r1", montant: -5 }); } catch (e) { er = e.message; }
  ok(/invalide/.test(er) && M.rdv.r1.brut === 0, "refusé : montant négatif");
  L.appliquerPrix(dos, M, E, { lid: "L1", n: 1, j: 1, montant: 250, d: "2026-10-08", lib: "FOLFOX" });
  ok(M.cures.L1[1].consJ[1] === 250 && M.cures.L1[1].cons.enc === true && M.cures.L1[1].hon[1].m === 500 && E.cons["L1|1|1"].m === 250, "consultation de chimio J1 : 250 DH, honoraires de séance intacts");
  L.appliquerPrix(dos, M, E, { lid: "L1", n: 1, j: 1, montant: null });
  ok(!(1 in M.cures.L1[1].consJ) && M.cures.L1[1].cons.enc === false && !E.cons["L1|1|1"], "consultation de chimio annulée");
  er = ""; try { L.appliquerPrix(dos, M, E, { lid: "L9", n: 1, j: 1, montant: 0 }); } catch (e) { er = e.message; }
  ok(/introuvable/.test(er), "refusé : cure inconnue");
  ok(JSON.stringify(M.rt) === '{"x":{"m":1}}', "radiothérapie jamais touchée");
})();

// ───── Ce que chacun voit dans son agenda (P3, 08/10/2026) ─────
(async () => {
  await new Promise((ok) => setTimeout(ok, 200));
  const E = (k, t, o) => Object.assign({ k, t, d: "2026-10-20" }, o || {});
  const cas = [[E("P|r|1", "🩺 ALAMI Fatima – Consultation annonce (HGC)"), "rdv:annonce"], [E("P|r|2", "🩺 ALAMI Fatima – Consultation suivi"), "rdv:suivi"], [E("P|r|3", "🩺 ALAMI – Consultation de contrôle (HCK)"), "rdv:controle"],
    [E("P|r|4", "🩺 ALAMI – Consultation en cours de radiothérapie (HGC)"), "rdv:rtc"], [E("P|r|5", "ALAMI – Hospitalisation du 20/10/2026 au 22/10/2026 (3 j ouvrés) (HGC)"), "rdv:hospit"],
    [E("P|r|6", "🩺 ALAMI – 2nd avis (CIOC)"), "rdv:act:2nd avis"], [E("P|r|7", "🩺 ALAMI – Téléconsultation (vidéo)"), "rdv:act:téléconsultation (vidéo)"],
    [E("P|c|0|2", "💉 ALAMI – C2/6 · FOLFOX"), "chimio:cure"], [E("P|s|0|2|8", "💉 ALAMI – C2 J8 · FOLFOX"), "chimio:seance"], [E("P|rt|r1|scan", "x"), "rt:scan"], [E("P|rt|r1|deb", "x"), "rt:deb"], [E("P|rt|r1|fin", "x"), "rt:fin"], [E("P|rt|r1|dosi", "x"), "rt:dosi"],
    [E("abs|2026-10-20|2026-10-22", "Absence : Congrès"), "abs"], [E("tache-a|t", "Tâche – x", { tache: true, tt: "Rappel perso" }), "tache:Rappel perso"], [E("tache-b|t", "Tâche – y", { tache: true, tt: "" }), "tache:"]];
  const faux = cas.filter(([e, c]) => L.cleFiltre(e) !== c).map(([e, c]) => c + " ≠ " + L.cleFiltre(e));
  ok(!faux.length, "clé de chaque événement (consultations par type et par activité, cures / séances, RT, absences, tâches par type)" + (faux.length ? " : " + faux.join(" ; ") : ""));
  const tous = cas.map(([e]) => e);
  ok(L.filtrer(tous, {}).length === tous.length && L.filtrer(tous, null).length === tous.length, "sans réglage : tout va dans l'agenda");
  const f = L.filtrer(tous, { exclus: ["rdv:annonce", "chimio:seance", "tache:Rappel perso", "rdv:act:2nd avis"] });
  ok(f.length === tous.length - 4 && !f.some((e) => ["P|r|1", "P|s|0|2|8", "tache-a|t", "P|r|6"].indexOf(e.k) >= 0), "annonces, séances J8, rappels perso et 2nd avis décochés : retirés, le reste gardé");
  ok(L.evtsTaches([{ id: "z", pour: "U", statut: "afaire", ech: "2026-10-20", titre: "t", type: "Question" }], "U", "2026-10-08")[0].tt === "Question", "tâche : son type est transmis pour le filtre");
})();

// ───── Heures mal écrites et événement refusé par Google (08/10/2026) ─────
(async () => {
  await new Promise((ok) => setTimeout(ok, 300));
  ok(L.heure("9:30") === "09:30" && L.heure("13h00") === "13:00" && L.heure("08:30:00") === "08:30" && L.heure("") === "" && L.heure("matin") === "" && L.heure("25:00") === "", "heure remise au format HH:MM (9:30, 13h00, 08:30:00) ; illisible → journée entière");
  const b = L.corps({ k: "P|r|h", t: "x", d: "2026-10-20", h: "9:30" });
  ok(b.start.dateTime === "2026-10-20T09:30:00" && b.end.dateTime === "2026-10-20T10:00:00", "rendez-vous à « 9:30 » envoyé à 09:30");
  ok(L.evtsPatient({ etablissementId: "HGC", resume: JSON.stringify({ ag: [{ k: "P|r|z", t: "x", d: "2026-1-5" }, { k: "P|r|y", t: "y", d: "2026-10-20" }] }) }, { actif: true, tousEtablissements: true, droits: { traitements: "voir", radiotherapie: "voir" } }, "2026-10-08").length === 1, "date mal écrite (2026-1-5) : événement écarté");
  // Google refuse un événement : les autres passent quand même
  const cal = (await api.creerAgenda()).id, faux = { k: "P|r|bad", t: "x", d: "2026-10-20", h: "10:00" }, bon = { k: "P|r|good", t: "y", d: "2026-10-21" };
  const api2 = Object.assign({}, api, { creer: async (c, bb) => { if (bb.id === L.idEv("P|r|bad")) { const e = new Error("Google Agenda 400 : Invalid start time."); e.statut = 400; throw e; } return api.creer(c, bb); } });
  const r = await L.appliquer(api2, cal, [faux, bon], [], "2026-10-08");
  ok(r.crees === 1 && r.refuses.length === 1 && r.refuses[0] === "P|r|bad", "un événement refusé (400) est mis de côté, le reste de l'agenda est mis à jour");
})();

// ───── Tâches automatiques (P4, 08/10/2026) ─────
(async () => {
  await new Promise((ok) => setTimeout(ok, 400));
  const J = "2026-10-08", feries = [{ d: "2026-11-06", nom: "Marche verte" }];
  const regles = L.reglesAuto({ regles: [
    { id: "r1", ev: "derniereCure", actif: true, titre: "Prévoir la suite", type: "Rappel perso", pour: "titulaire", n: 7, depuis: "2026-10-01" },
    { id: "r2", ev: "nonVenu", actif: true, titre: "Rappeler le patient", type: "Question patient", pour: "SEC", n: 1, depuis: "2026-10-01" },
    { id: "r3", ev: "nouveauPatient", actif: true, titre: "Ouvrir le dossier mutuelle", type: "Autre", pour: "SEC", n: 2, depuis: "" },
    { id: "r4", ev: "apresFinRT", actif: true, titre: "Consultation de contrôle", type: "Rendez-vous ajouté/déplacé", pour: "titulaire", n: 3, depuis: "2026-01-01" },
    { id: "r5", ev: "veilleJ1", actif: true, titre: "Préparer la cure", type: "Rappel perso", pour: "INF", n: 0, depuis: "" },
    { id: "r6", ev: "nonVenu", actif: false, titre: "Désactivée", type: "", pour: "titulaire", n: 0, depuis: "" },
  ] });
  ok(regles.length === 9 && regles[0].id === "cont" && regles[1].id === "dosi" && regles[2].id === "finrt" && regles[0].fixe, "règles : les 3 fixes (contourage, dosimétrie, fin de RT) toujours présentes, puis celles du médecin");
  const dossier = {
    rtsJson: JSON.stringify([
      { id: "rA", acte: "Sein", scan: "2026-10-05", deb: "2026-10-12", nb: "15", ryt: "1" },              // dosimétrie à valider
      { id: "rB", acte: "Prostate", scan: "2026-08-01", dosi: "2026-08-03", deb: "2026-08-04", nb: "20" },  // fin prévue dépassée, non close
      { id: "rC", acte: "ORL", scan: "2026-03-01", dosi: "2026-03-02", deb: "2026-03-03", nb: "5", fin: "2026-03-09" }, // close : contrôle à 3 mois
      { id: "rD", acte: "Futur", scan: "2026-10-20" },                                                        // scanner pas encore fait
    ]),
    rdvsJson: JSON.stringify([{ id: "v1", d: "2026-10-06", st: "absent" }, { id: "v0", d: "2026-09-10", st: "absent" }, { id: "v2", d: "2026-10-07", st: "fait" }]),
    resume: JSON.stringify({ nm: "ALAMI Fatima", act: [{ nom: "FOLFOX", k: 6, nb: 6, d: "2026-10-09", c: 14 }, { nom: "FOLFOX · J8", k: 5, nb: 6, d: "2026-10-09", sj: 8 }] }),
  };
  const { voulues, resolues } = L.tachesAutoPatient("P1", dossier, regles, J, feries, { nouveau: false });
  const par = (rg) => voulues.filter((v) => v.regle === rg);
  ok(par("cont").length === 1 && par("cont")[0].cle === "rA" && par("cont")[0].ech === "2026-10-12" && par("cont")[0].rt === "rA", "contourage : tâche dès le jour du scanner, échéance = 1re séance (scanner futur : rien)");
  ok(!par("dosi").length, "dosimétrie : pas de tâche tant que le contourage n'est pas validé");
  ok(resolues.indexOf(L.idAuto("dosi", "P1", "rB")) >= 0 && resolues.indexOf(L.idAuto("finrt", "P1", "rC")) >= 0, "dosimétrie validée ou RT close : leurs tâches seront terminées toutes seules");
  ok(par("finrt").length === 1 && par("finrt")[0].cle === "rB" && /fin prévue le/.test(par("finrt")[0].titre), "fin de radiothérapie dépassée et non close : tâche « Valider la fin de radiothérapie »");
  ok(L.finRT({ deb: "2026-11-02", nb: "5" }, feries) === "2026-11-09", "fin prévue : jours ouvrés, fériés sautés (Marche verte)");
  ok(par("r1").length === 1 && par("r1")[0].ech === "2026-10-16" && /C6\/6 FOLFOX/.test(par("r1")[0].titre), "dernière cure (C6/6) : tâche, échéance = date de la cure + 7 jours");
  ok(par("r2").length === 1 && par("r2")[0].cle === "v1" && par("r2")[0].ech === "2026-10-07" && par("r2")[0].pour === "SEC", "non venu : une tâche (avant la date « depuis » : rien), pour la secrétaire");
  ok(!par("r6").length, "règle désactivée : rien");
  ok(!par("r3").length && L.tachesAutoPatient("P1", dossier, regles, J, feries, { nouveau: true }).voulues.filter((v) => v.regle === "r3").length === 1, "nouveau patient : seulement à la création du dossier");
  ok(par("r4").length === 1 && par("r4")[0].ech === "2026-06-09", "3 mois après la fin de la RT (09/03) : tâche le 09/06");
  ok(par("r5").length === 1 && par("r5")[0].ech === "2026-10-08" && L.tachesAutoPatient("P1", dossier, regles, "2026-10-06", feries).voulues.filter((v) => v.regle === "r5").length === 0, "veille d'une cure J1 : tâche la veille (pas avant)");
  ok(L.idAuto("dosi", "P1", "rA") === L.idAuto("dosi", "P1", "rA") && L.idAuto("dosi", "P1", "rA") !== L.idAuto("dosi", "P2", "rA"), "identifiant fixe par règle, patient et occurrence (jamais deux fois la même tâche)");
  ok(L.addMois("2026-01-31", 1) === "2026-02-28", "ajout de mois : fin de mois respectée");
})();

// ───── Dosimétrie à valider : une tâche, plus un événement d'agenda (08/10/2026) ─────
(async () => {
  await new Promise((ok) => setTimeout(ok, 500));
  const P = { etablissementId: "HGC", resume: JSON.stringify({ ag: [{ k: "P|rt|r1|dosi", t: "☢️ X – Dosimétrie à valider", d: "2026-10-09", f: "2026-10-12" }, { k: "P|rt|r1|deb", t: "☢️ X – 1re séance", d: "2026-10-12" }] }) };
  const ev = L.evtsPatient(P, { actif: true, tousEtablissements: true, droits: { radiotherapie: "voir" } }, "2026-10-08");
  ok(ev.length === 1 && ev[0].k === "P|rt|r1|deb", "résumé ancien contenant « Dosimétrie à valider » : pas envoyé à Google Agenda (la 1re séance oui)");
})();

// Dosimétrie : tâche seulement entre le scanner et la 1re séance (pas pour une ancienne radiothérapie jamais validée)
(async () => {
  await new Promise((ok) => setTimeout(ok, 600));
  const d = { rtsJson: JSON.stringify([{ id: "vieux", scan: "2026-05-01", deb: "2026-05-10", nb: "20" }, { id: "sansdeb", scan: "2026-10-01" }, { id: "encours", scan: "2026-10-05", deb: "2026-10-08" }]), rdvsJson: "[]", resume: "{}" };
  const v = L.tachesAutoPatient("P", d, L.reglesAuto({}), "2026-10-08", []).voulues.filter((x) => x.regle === "cont").map((x) => x.cle).sort().join(",");
  ok(v === "encours,sansdeb", "contourage : tâche pendant la période scanner → 1re séance (ou sans 1re séance), pas pour une RT déjà commencée");
  // Déroulé : contourage validé → sa tâche se termine, celle de la dosimétrie est créée (jusqu'à la 1re séance)
  const d2 = { rtsJson: JSON.stringify([{ id: "x", acte: "Sein", scan: "2026-10-05", cont: "2026-10-07", deb: "2026-10-12" }, { id: "y", scan: "2026-09-01", cont: "2026-09-02", deb: "2026-09-10" }]), rdvsJson: "[]", resume: "{}" };
  const r2 = L.tachesAutoPatient("P", d2, L.reglesAuto({}), "2026-10-08", []);
  ok(r2.resolues.indexOf(L.idAuto("cont", "P", "x")) >= 0 && r2.voulues.some((z) => z.regle === "dosi" && z.cle === "x" && z.ech === "2026-10-12") && !r2.voulues.some((z) => z.regle === "cont"), "contourage validé : sa tâche se termine, « Valider la dosimétrie » est créée (échéance 1re séance)");
  ok(!r2.voulues.some((z) => z.cle === "y"), "RT déjà commencée (1re séance passée) : pas de tâche de dosimétrie");
  const r3 = L.tachesAutoPatient("P", { rtsJson: JSON.stringify([{ id: "x", scan: "2026-10-05", cont: "2026-10-07", dosi: "2026-10-08", deb: "2026-10-12" }]), rdvsJson: "[]", resume: "{}" }, L.reglesAuto({}), "2026-10-08", []);
  ok(r3.resolues.indexOf(L.idAuto("cont", "P", "x")) >= 0 && r3.resolues.indexOf(L.idAuto("dosi", "P", "x")) >= 0 && !r3.voulues.length, "dosimétrie validée : les tâches contourage et dosimétrie se terminent, plus rien à créer");
})();
