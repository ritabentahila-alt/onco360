// Onco360 – fonctions serveur (Firebase, région europe-west1, comme la base).
// Google Agenda de chaque membre : « Lier mon Google Agenda » (Profil) crée dans SON compte Google un agenda « Onco360 »,
// tenu à jour dans un seul sens (Onco360 → Google) avec les patients qu'il a le droit de voir.
//   • agendaLier / agendaMaj / agendaDelier : appelées depuis Onco360 (personne connectée) ;
//   • agendaPatient : à chaque enregistrement d'un dossier ; agendaAbsences : absences du cabinet (titulaire) ;
//   • agendaMembre : droits ou établissements d'un membre modifiés ; agendaNuit : remise à plat chaque nuit ;
//   • agendaTache : une tâche écrite (échéance dans l'agenda de son responsable, T6 du 08/10/2026) ;
//   • agendaCouleurs : couleurs par type changées (Paramètres › Google Agenda) : tous les agendas du cabinet repeints ;
//   • agendaFiltre : une personne a changé ce qui va dans SON agenda (utilisateurs/{uid}.agendaFiltre, par cabinet depuis le 19.2)
//     ou ses couleurs (agendaCouleurs, qui passent avant celles du cabinet) : son agenda refait.
// Plusieurs cabinets (19.2, 10/10/2026) : une secrétaire de plusieurs médecins a un seul agenda « Onco360 » avec tous ses cabinets
// (comptes/{uid}.espaces), le nom du cabinet ajouté au titre de chaque événement ; agendaJetons/{uid}.espaces = cabinets reçus.
// Tâches automatiques (P4, 08/10/2026) : tachesAutoPatient (chaque écriture d'un dossier) et tachesAutoNuit (3 h) créent les
// tâches dues (logique.js tachesAutoPatient) et terminent celles dont la condition est réglée (dosimétrie validée, RT close).
// Jetons Google : collection agendaJetons/{uid}, inaccessible depuis le navigateur (aucune règle ne l'ouvre).
// État visible par la personne : utilisateurs/{uid}.agendaGoogle = { email, calendrier, le, nb, erreur }.
const { setGlobalOptions } = require("firebase-functions/v2");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { defineSecret, defineString } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue, Timestamp } = require("firebase-admin/firestore");
const L = require("./logique");

initializeApp();
const db = getFirestore();
setGlobalOptions({ region: "europe-west1", maxInstances: 5 });
const SECRET = defineSecret("GOOGLE_CLIENT_SECRET");
const CLIENT_ID = defineString("GOOGLE_CLIENT_ID");
const SCOPE_AGENDA = "https://www.googleapis.com/auth/calendar.app.created";
const OPTS = { secrets: [SECRET], timeoutSeconds: 300, memory: "256MiB" };

// ───── Jetons Google ─────
async function oauth(params) {
  const r = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(Object.assign({ client_id: CLIENT_ID.value(), client_secret: SECRET.value() }, params)).toString() });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) { const e = new Error(j.error_description || j.error || "Google " + r.status); e.code = j.error; throw e; }
  return j;
}
async function apiPour(J) {
  try { return L.creerApi((await oauth({ grant_type: "refresh_token", refresh_token: J.refresh })).access_token); }
  catch (e) { if (e.code === "invalid_grant") { const er = new Error("L'accès à votre Google Agenda a été retiré : reliez-le à nouveau (Profil › Google Agenda)."); er.revoque = true; throw er; } throw e; }
}
const etat = (uid, o) => db.doc("utilisateurs/" + uid).set({ agendaGoogle: o }, { merge: true });
// R-A2 (18/10/2026) : événements refusés par Google, plus en silence : agendaGoogle.refus { groupe (patient, abs, tache-…) : { n, motif, d, le } },
// affiché dans Paramètres › Google Agenda ; refait en entier par la remise à plat, groupe par groupe à chaque écriture d'un dossier
const refusDe = (voulus, r, le) => { const o = {}; (r.refuses || []).forEach((k, i) => { const g = L.groupe(k), v = voulus.find((x) => x.k === k) || {}; const z = (o[g] = o[g] || { n: 0, motif: "", d: "", le }); z.n++; z.motif = (r.motifs || [])[i] || z.motif; z.d = v.d || z.d; }); return o; };
async function echec(uid, e) {
  console.error("agenda", uid, e);
  await etat(uid, { erreur: String((e && e.message) || e).slice(0, 300), le: new Date().toISOString() }).catch(() => {});
  if (e && e.revoque) await db.doc("agendaJetons/" + uid).set({ revoque: true }, { merge: true }).catch(() => {});
}
const membre = async (e, uid) => { const s = await db.doc("espaces/" + e + "/membres/" + uid).get(); return s.exists ? s.data() : null; };
const titulaire = async (e) => { const s = await db.doc("espaces/" + e).get(); return s.exists ? s.data().titulaire : null; };

// Fonction du réglage du cabinet (10/10/2026) : absente du réglage = présente ; module retiré = absente
async function fonctionPresente(e, k) {
  try { const s = await db.doc("espaces/" + e).get(), ab = (s.exists && s.data().abonnement) || {}, m = k.split(".")[0];
    return !(ab.modules && ab.modules[m] === false) && !(ab.reglage && ab.reglage.fonctions && ab.reglage.fonctions[k] === false); } catch (er) { return true; }
}
// Profil de la personne : ce qu'elle veut voir (agendaFiltre) et ses couleurs (agendaCouleurs, 10/10/2026)
async function profilAgenda(uid) { try { const s = await db.doc("utilisateurs/" + uid).get(); return s.exists ? s.data() : {}; } catch (e) { return {}; } }
// Filtre d'un cabinet (19.2) : agendaFiltre.cabinets[e] s'il existe, sinon le réglage d'avant (agendaFiltre.exclus)
const filtreCabinet = (f, e) => (f && f.cabinets && f.cabinets[e]) || f || {};
// Couleurs : celles de la personne (agendaCouleurs, Paramètres › Google Agenda) passent avant celles du cabinet (sinon par défaut)
async function couleurs(e, perso) { let c = {}; try { const s = await db.doc("espaces/" + e + "/parametres/couleursAgenda").get(); c = s.exists ? JSON.parse(s.data().data || "{}") : {}; } catch (er) { c = {}; } return Object.assign(c, perso || {}); }
// Cabinets dont l'agenda reçoit les événements (19.2 : une secrétaire de plusieurs médecins a un seul agenda pour tous) : ceux de
// comptes/{uid} (+ celui de la liaison, + extra), où elle est membre actif, cabinet non suspendu, Google Agenda dans la formule
async function cabinetsAgenda(uid, J, extra) {
  const c = await db.doc("comptes/" + uid).get(), l = C.espacesCompte(c.exists ? c.data() : null, !c.exists);
  [J.espace].concat(extra || []).forEach((e) => { if (e && l.indexOf(e) < 0) l.push(e); });
  const r = [];
  for (const e of l) {
    if (C.estBib(e)) continue;
    const m = await membre(e, uid); if (!m || m.actif === false) continue;
    const es = await db.doc("espaces/" + e).get(), x = es.exists ? es.data() : null; if (!x || x.actif === false) continue;
    if (x.abonnement && x.abonnement.modules && x.abonnement.modules.gagenda === false) continue;
    r.push({ e, m, nom: x.nom || e, titulaire: x.titulaire });
  }
  return r;
}
// Plusieurs cabinets dans le même agenda : le nom du cabinet ajouté au titre (« … · Cabinet Dr Gorbin »)
const etiqueter = (evts, nom, plusieurs) => { if (plusieurs) evts.forEach((v) => { v.t = v.t + " · " + nom; }); return evts; };
// ───── Remise à plat complète de l'agenda d'une personne ─────
async function syncComplet(uid, J, extra) {
  const cabs = await cabinetsAgenda(uid, J, extra);
  if (!cabs.length) throw new Error("Votre accès à Onco360 est désactivé : l'agenda n'est plus mis à jour.");
  const auj = L.jourCasa(), api = await apiPour(J), P = await profilAgenda(uid), plus = cabs.length > 1;
  let voulus = [];
  for (const { e, m, nom, titulaire: tit } of cabs) {
    const pats = await db.collection("espaces/" + e + "/patients").select("resume", "etablissementId").get();
    let v = [];
    pats.forEach((d) => { v = v.concat(L.evtsPatient(d.data(), m, auj, { uid, titulaire: tit })); });
    // Tâches dont la personne est responsable (nom actuel du patient lu dans son dossier)
    const ts = await db.collection("espaces/" + e + "/taches").where("pour", "==", uid).get(), noms = {};
    pats.forEach((d) => { try { noms[d.id] = JSON.parse(d.data().resume || "{}").nm || ""; } catch (er) { /* résumé illisible */ } });
    if (await fonctionPresente(e, "taches.gagenda")) v = v.concat(L.evtsTaches(ts.docs.map((d) => Object.assign({ id: d.id }, d.data())), uid, auj, noms)); // réglage du cabinet
    if (tit === uid) {
      const c = await db.doc("espaces/" + e + "/parametres/calendrier").get();
      try { v = v.concat(L.evtsAbsences(c.exists ? JSON.parse(c.data().data || "{}") : {}, auj)); } catch (er) { /* calendrier illisible */ }
    }
    v = L.filtrer(v, filtreCabinet(P.agendaFiltre, e));
    L.colorer(v, await couleurs(e, P.agendaCouleurs));
    voulus = voulus.concat(etiqueter(v, nom, plus));
  }
  const existants = await api.lister(J.calendrier, "onco360=1", L.timeMin(auj));
  const r = await L.appliquer(api, J.calendrier, voulus, existants, auj), le = new Date().toISOString();
  await db.doc("agendaJetons/" + uid).set({ espaces: cabs.map((x) => x.e) }, { merge: true }).catch(() => {});
  await etat(uid, { email: J.email || "", calendrier: "Onco360", le, nb: voulus.length, erreur: "" });
  await db.doc("utilisateurs/" + uid).update({ "agendaGoogle.refus": refusDe(voulus, r, le) }).catch((er) => console.warn("refus", uid, er));
  return Object.assign({ nb: voulus.length }, r);
}
// Un seul groupe (un patient, les absences, une tâche) du cabinet e pour une personne
async function syncGroupe(uid, J, e, g, voulus) {
  const api = await apiPour(J), auj = L.jourCasa(), P = await profilAgenda(uid), plus = (J.espaces || []).length > 1;
  const existants = await api.lister(J.calendrier, "g=" + g, L.timeMin(auj));
  const v = L.colorer(L.filtrer(voulus.filter((x) => L.groupe(x.k) === g), filtreCabinet(P.agendaFiltre, e)), await couleurs(e, P.agendaCouleurs));
  const r = await L.appliquer(api, J.calendrier, etiqueter(v, plus ? await nomCab(e) : "", plus), existants, auj), le = new Date().toISOString();
  const z = refusDe(v, r, le)[g];
  await db.doc("utilisateurs/" + uid).set({ agendaGoogle: { le, erreur: "", refus: { [g]: z || FieldValue.delete() } } }, { merge: true });
}
// Comptes reliés à Google Agenda qui reçoivent le cabinet e (liaison faite dans ce cabinet, ou cabinet dans leur liste)
const liesA = async (e) => {
  const [a, b] = await Promise.all([db.collection("agendaJetons").where("espace", "==", e).get(), db.collection("agendaJetons").where("espaces", "array-contains", e).get()]);
  const vus = new Set(); return a.docs.concat(b.docs).filter((d) => !d.data().revoque && !vus.has(d.id) && vus.add(d.id));
};
const recoit = (J, e) => !!J && !J.revoque && (J.espace === e || (J.espaces || []).indexOf(e) >= 0);

// ───── Appelées depuis Onco360 ─────
exports.agendaLier = onCall(OPTS, async (req) => {
  if (!req.auth) throw new HttpsError("unauthenticated", "Connectez-vous à Onco360.");
  const uid = req.auth.uid, { code, espace } = req.data || {};
  if (!code || !espace) throw new HttpsError("invalid-argument", "Demande incomplète.");
  const m = await membre(espace, uid);
  if (!m || m.actif === false) throw new HttpsError("permission-denied", "Vous n'êtes pas membre actif de cet espace.");
  const ab = (await db.doc("espaces/" + espace).get()).data() || {};
  if (ab.abonnement && ab.abonnement.modules && ab.abonnement.modules.gagenda === false) throw new HttpsError("permission-denied", "Google Agenda ne fait pas partie de la formule de ce cabinet.");
  let t;
  try { t = await oauth({ grant_type: "authorization_code", code, redirect_uri: "postmessage" }); }
  catch (e) { throw new HttpsError("failed-precondition", "Google a refusé la liaison : " + e.message); }
  if (String(t.scope || "").split(" ").indexOf(SCOPE_AGENDA) < 0) throw new HttpsError("failed-precondition", "L'autorisation « agendas secondaires » n'a pas été cochée dans la fenêtre Google. Recommencez en la cochant.");
  let email = "";
  try { email = JSON.parse(Buffer.from(String(t.id_token).split(".")[1], "base64url").toString()).email || ""; } catch (e) { /* adresse inconnue */ }
  const ref = db.doc("agendaJetons/" + uid), avant = (await ref.get()).data() || {};
  const refresh = t.refresh_token || (avant.email === email ? avant.refresh : null);
  if (!refresh) throw new HttpsError("failed-precondition", "Google n'a pas fourni d'accès durable. Allez sur myaccount.google.com/permissions, retirez « Onco360 », puis recommencez.");
  const api = L.creerApi(t.access_token);
  let cal = avant.email === email && avant.calendrier && (await api.agendaExiste(avant.calendrier)) ? avant.calendrier : null;
  if (!cal) cal = (await api.creerAgenda()).id;
  const J = { refresh, calendrier: cal, email, espace, lie: new Date().toISOString(), revoque: false };
  await ref.set(J);
  try { const r = await syncComplet(uid, J); return { email, nb: r.nb }; }
  catch (e) { await echec(uid, e); throw new HttpsError("internal", "Agenda relié, mais la première mise à jour a échoué : " + e.message); }
});
exports.agendaMaj = onCall(OPTS, async (req) => {
  if (!req.auth) throw new HttpsError("unauthenticated", "Connectez-vous à Onco360.");
  const s = await db.doc("agendaJetons/" + req.auth.uid).get();
  if (!s.exists || s.data().revoque) throw new HttpsError("failed-precondition", "Aucun Google Agenda relié.");
  try { return await syncComplet(req.auth.uid, s.data()); } catch (e) { await echec(req.auth.uid, e); throw new HttpsError("internal", e.message); }
});
exports.agendaDelier = onCall(OPTS, async (req) => {
  if (!req.auth) throw new HttpsError("unauthenticated", "Connectez-vous à Onco360.");
  const uid = req.auth.uid, ref = db.doc("agendaJetons/" + uid), s = await ref.get();
  if (s.exists) {
    const J = s.data();
    if (req.data && req.data.supprimer && !J.revoque) { try { await (await apiPour(J)).supprimerAgenda(J.calendrier); } catch (e) { console.error(e); } }
    await fetch("https://oauth2.googleapis.com/revoke?token=" + encodeURIComponent(J.refresh), { method: "POST" }).catch(() => {});
    await ref.delete();
  }
  await db.doc("utilisateurs/" + uid).set({ agendaGoogle: FieldValue.delete() }, { merge: true });
  return { ok: true };
});

// ───── Automatiques ─────
exports.agendaPatient = onDocumentWritten(Object.assign({ document: "espaces/{e}/patients/{p}" }, OPTS), async (ev) => {
  const avant = ev.data.before.exists ? ev.data.before.data() : null, apres = ev.data.after.exists ? ev.data.after.data() : null;
  if (avant && apres && avant.resume === apres.resume && avant.etablissementId === apres.etablissementId) return;
  const auj = L.jourCasa(), tit = await titulaire(ev.params.e);
  for (const d of await liesA(ev.params.e)) {
    try { const m = await membre(ev.params.e, d.id); await syncGroupe(d.id, d.data(), ev.params.e, ev.params.p, L.evtsPatient(apres, m, auj, { uid: d.id, titulaire: tit })); }
    catch (e) { await echec(d.id, e); }
  }
});
exports.agendaAbsences = onDocumentWritten(Object.assign({ document: "espaces/{e}/parametres/calendrier" }, OPTS), async (ev) => {
  const tit = await titulaire(ev.params.e); if (!tit) return;
  const s = await db.doc("agendaJetons/" + tit).get(); if (!s.exists || !recoit(s.data(), ev.params.e)) return;
  let cal = {}; try { cal = ev.data.after.exists ? JSON.parse(ev.data.after.data().data || "{}") : {}; } catch (e) { /* illisible */ }
  try { await syncGroupe(tit, s.data(), ev.params.e, "abs", L.evtsAbsences(cal, L.jourCasa())); } catch (e) { await echec(tit, e); }
});
exports.agendaMembre = onDocumentWritten(Object.assign({ document: "espaces/{e}/membres/{uid}" }, OPTS), async (ev) => {
  const s = await db.doc("agendaJetons/" + ev.params.uid).get();
  if (!s.exists || s.data().revoque || C.estBib(ev.params.e)) return;
  // fiche ajoutée dans un autre cabinet (19.2) ou modifiée : agenda refait avec ce cabinet (la liste comptes peut arriver juste après)
  try { await syncComplet(ev.params.uid, s.data(), ev.data.after.exists ? [ev.params.e] : []); } catch (e) { await echec(ev.params.uid, e); }
});
// Tâche écrite : agenda de son responsable, et de l'ancien si elle a été réattribuée (les commentaires seuls ne changent rien)
const CHAMPS_AGENDA = ["titre", "desc", "ech", "debut", "h", "urgent", "statut", "pour", "patientId", "patientNom", "deNom"];
exports.agendaTache = onDocumentWritten(Object.assign({ document: "espaces/{e}/taches/{t}" }, OPTS), async (ev) => {
  const avant = ev.data.before.exists ? ev.data.before.data() : null, apres = ev.data.after.exists ? ev.data.after.data() : null;
  if (avant && apres && CHAMPS_AGENDA.every((k) => JSON.stringify(avant[k]) === JSON.stringify(apres[k]))) return;
  const e = ev.params.e, t = apres ? Object.assign({ id: ev.params.t }, apres) : null, noms = {};
  if (t && t.patientId) { try { const p = await db.doc("espaces/" + e + "/patients/" + t.patientId).get(); if (p.exists) noms[t.patientId] = JSON.parse(p.data().resume || "{}").nm || ""; } catch (er) { /* nom gardé dans la tâche */ } }
  for (const uid of new Set([avant && avant.pour, apres && apres.pour].filter(Boolean))) {
    const s = await db.doc("agendaJetons/" + uid).get(); if (!s.exists || !recoit(s.data(), e)) continue;
    const m = await membre(e, uid); if (!m || m.actif === false) continue;
    try { await syncGroupe(uid, s.data(), e, "tache-" + ev.params.t, L.evtsTaches(t && (await fonctionPresente(e, "taches.gagenda")) ? [t] : [], uid, L.jourCasa(), noms)); } catch (er) { await echec(uid, er); }
  }
});
exports.agendaCouleurs = onDocumentWritten(Object.assign({ document: "espaces/{e}/parametres/couleursAgenda" }, OPTS), async (ev) => {
  for (const d of await liesA(ev.params.e)) { try { await syncComplet(d.id, d.data()); } catch (e) { await echec(d.id, e); } }
});
// ───── Prix d'une consultation fixé par la secrétaire (salle d'attente, 08/10/2026) ─────
// La secrétaire n'a pas le droit « finances » : ce prix (rendez-vous « Venu » ou consultation d'un jour de chimio) est écrit
// pour elle, et lui seul, dans les montants et les prix à encaisser (logique : L.appliquerPrix, tests : test-logique.js).
exports.prixConsultation = onCall({ timeoutSeconds: 30, memory: "256MiB" }, async (req) => {
  if (!req.auth) throw new HttpsError("unauthenticated", "Connectez-vous à Onco360.");
  const { espace, patientId } = req.data || {};
  if (!espace || !patientId) throw new HttpsError("invalid-argument", "Demande incomplète.");
  const m = await membre(espace, req.auth.uid);
  if (!L.peutPrix(m)) throw new HttpsError("permission-denied", "Vous n'avez pas le droit de fixer le prix des consultations.");
  const refP = db.doc("espaces/" + espace + "/patients/" + patientId), refM = db.doc("espaces/" + espace + "/patientsFinances/" + patientId), refE = db.doc("espaces/" + espace + "/encaissements/" + patientId);
  try {
    const quoi = await db.runTransaction(async (t) => {
      const [p, f, e] = await Promise.all([t.get(refP), t.get(refM), t.get(refE)]);
      if (!p.exists) throw new Error("Dossier introuvable.");
      const etab = p.data().etablissementId || "";
      if (!L.voitPatient(m, etab)) throw new Error("Ce patient n'est pas dans vos établissements.");
      const M = f.exists && f.data().montantsJson ? JSON.parse(f.data().montantsJson) : { rdv: {}, rt: {}, cures: {} }, E = e.exists && e.data().data ? JSON.parse(e.data().data) : { rdv: {}, cons: {} };
      const q = L.appliquerPrix(p.data(), M, E, req.data);
      t.set(refM, { etablissementId: etab, montantsJson: JSON.stringify(M) }, { merge: true });
      t.set(refE, { etablissementId: etab, data: JSON.stringify(E) });
      return q;
    });
    return { ok: true, quoi };
  } catch (e) { throw new HttpsError("failed-precondition", e.message); }
});

exports.agendaFiltre = onDocumentWritten(Object.assign({ document: "utilisateurs/{uid}" }, OPTS), async (ev) => {
  const lire = (x) => (x.exists ? [x.data().agendaFiltre || {}, x.data().agendaCouleurs || {}] : [{}, {}]);
  if (JSON.stringify(lire(ev.data.before)) === JSON.stringify(lire(ev.data.after))) return; // autres écritures du profil (tâches lues, état de l'agenda…)
  const s = await db.doc("agendaJetons/" + ev.params.uid).get(); if (!s.exists || s.data().revoque) return;
  try { await syncComplet(ev.params.uid, s.data()); } catch (e) { await echec(ev.params.uid, e); }
});
// ───── Tâches automatiques ─────
const SYS = "onco360", SYS_NOM = "Onco360 (automatique)";
async function contexteAuto(e) {
  const [sr, sc, se, sm] = await Promise.all([db.doc("espaces/" + e + "/parametres/tachesAuto").get(), db.doc("espaces/" + e + "/parametres/calendrier").get(), db.doc("espaces/" + e).get(), db.collection("espaces/" + e + "/membres").get()]);
  let cfg = {}, cal = {}; try { cfg = sr.exists ? JSON.parse(sr.data().data || "{}") : {}; } catch (er) { /* illisible */ } try { cal = sc.exists ? JSON.parse(sc.data().data || "{}") : {}; } catch (er) { /* illisible */ }
  const membres = {}; sm.forEach((d) => { membres[d.id] = d.data(); });
  // Réglage du cabinet (10/10/2026) : module Tâches ou fonction « Tâches automatiques » retirés = aucune ; « Tâches fixes » de la
  // radiothérapie retirées = sans contourage / dosimétrie / fin
  const ab = (se.exists && se.data().abonnement) || {}, fn = (ab.reglage && ab.reglage.fonctions) || {};
  let regles = L.reglesAuto(cfg);
  if ((ab.modules && ab.modules.taches === false) || fn["taches.auto"] === false) regles = [];
  else if (fn["rt.taches"] === false || (ab.modules && ab.modules.rt === false)) regles = regles.filter((r) => ["cont", "dosi", "finrt"].indexOf(r.id) < 0);
  return { regles, feries: cal.feries || [], titulaire: se.exists ? se.data().titulaire : null, membres };
}
async function tachesAuto(e, pid, docData, ctx, opts) {
  if (!docData) return;
  const auj = L.jourCasa(), { voulues, resolues, premature } = L.tachesAutoPatient(pid, docData, ctx.regles, auj, ctx.feries, opts);
  // Dosimétrie créée trop tôt (avant le contourage, ancienne version) : tâche retirée si personne n'y a touché, registre effacé
  for (const id of premature || []) {
    const reg = db.doc("espaces/" + e + "/tachesAuto/" + id), ref = db.doc("espaces/" + e + "/taches/" + id), s = await ref.get();
    if (s.exists && s.data().statut !== "fait" && (s.data().fil || []).length <= 1) await ref.delete();
    if (!s.exists || (s.data().statut !== "fait" && (s.data().fil || []).length <= 1)) await reg.delete();
  }
  let r0 = {}; try { r0 = JSON.parse(docData.resume || "{}"); } catch (er) { /* résumé illisible */ }
  for (const v of voulues) {
    const reg = db.doc("espaces/" + e + "/tachesAuto/" + v.id);
    if ((await reg.get()).exists) { // déjà créée une fois (même si elle a été supprimée depuis) : début de période complété ou mis à jour
      if (v.debut) { const tr = db.doc("espaces/" + e + "/taches/" + v.id), ts = await tr.get(); if (ts.exists && ts.data().statut !== "fait" && ts.data().debut !== v.debut) await tr.update({ debut: v.debut }); }
      continue;
    }
    if ((await db.doc("espaces/" + e + "/taches/" + v.id).get()).exists) { await reg.set({ le: new Date().toISOString(), patientId: pid, regle: v.regle }); continue; } // tâche déjà là : jamais écrasée
    let pour = v.pour === "titulaire" ? ctx.titulaire : v.pour; const m = ctx.membres[pour];
    if (!m || m.actif === false) { pour = ctx.titulaire; } const mp = ctx.membres[pour]; if (!pour || !mp) continue;
    const le = new Date().toISOString();
    await db.doc("espaces/" + e + "/taches/" + v.id).set({
      titre: v.titre, desc: "Tâche créée automatiquement par Onco360 (Paramètres › Tâches › Tâches automatiques).", type: v.type, urgent: false, ech: v.ech, debut: v.debut || "", h: "",
      patientId: pid, patientNom: r0.nm || "", etablissementId: docData.etablissementId || "", pour, pourNom: String(mp.nom || mp.email || ""), de: SYS, deNom: SYS_NOM, qui: [SYS, pour],
      statut: "afaire", fil: [{ le, par: SYS, parNom: SYS_NOM, txt: "Créée automatiquement" }], o: Date.now(), cree: FieldValue.serverTimestamp(), maj: FieldValue.serverTimestamp(), majPar: SYS,
      auto: { regle: v.regle, ev: v.ev, cle: v.cle, rt: v.rt || "" },
    });
    await reg.set({ le, patientId: pid, regle: v.regle });
  }
  for (const id of resolues) {
    const ref = db.doc("espaces/" + e + "/taches/" + id), s = await ref.get(); if (!s.exists || s.data().statut === "fait") continue;
    const le = new Date().toISOString(), ev = s.data().auto && s.data().auto.ev, txt = "Terminée automatiquement : " + (ev === "cont" ? "contourage validé" : ev === "dosi" ? "dosimétrie validée" : "radiothérapie clôturée") + " dans le dossier";
    await ref.update({ statut: "fait", faitPar: SYS, faitParNom: SYS_NOM, faitLe: le, fil: FieldValue.arrayUnion({ le, par: SYS, parNom: SYS_NOM, txt }), maj: FieldValue.serverTimestamp(), majPar: SYS });
  }
}
exports.tachesAutoPatient = onDocumentWritten(Object.assign({ document: "espaces/{e}/patients/{p}" }, OPTS), async (ev) => {
  if (!ev.data.after.exists) return;
  try { await tachesAuto(ev.params.e, ev.params.p, ev.data.after.data(), await contexteAuto(ev.params.e), { nouveau: !ev.data.before.exists }); }
  catch (er) { console.error("tâches automatiques", ev.params.p, er); }
});
exports.tachesAutoNuit = onSchedule(Object.assign({ schedule: "0 3 * * *", timeZone: L.TZ }, OPTS), async () => {
  for (const es of (await db.collection("espaces").get()).docs) {
    const ctx = await contexteAuto(es.id); if (!ctx.regles.some((r) => r.actif !== false)) continue;
    for (const d of (await db.collection("espaces/" + es.id + "/patients").get()).docs) { try { await tachesAuto(es.id, d.id, d.data(), ctx, {}); } catch (er) { console.error("tâches automatiques", d.id, er); } }
  }
});
exports.agendaNuit = onSchedule(Object.assign({ schedule: "30 3 * * *", timeZone: L.TZ }, OPTS), async () => {
  const l = (await db.collection("agendaJetons").get()).docs.filter((d) => !d.data().revoque);
  for (const d of l) { try { await syncComplet(d.id, d.data()); } catch (e) { await echec(d.id, e); } }
});

// ───── Numéro de dossier (étape 8, 09/10/2026) : AAAAMM + rang d'inscription dans le mois (functions/numeros.js) ─────
// Attribué ici, dans une transaction, pour qu'il n'y ait jamais de doublon (deux personnes qui créent un patient en même temps).
// Compteurs : espaces/{e}/compteurs/dossiers = { "202610": 7, … } (aucune règle : invisible et non modifiable depuis le navigateur).
// Le numéro est écrit dans identite.numero (version + 1, comme toute écriture d'un dossier) et ne change plus jamais.
const N = require("./numeros");
const voit = (m, etab) => !!m && m.actif !== false && (m.tousEtablissements === true || (m.etablissements || []).indexOf(etab) >= 0);
exports.numeroDossier = onCall({ timeoutSeconds: 30, memory: "256MiB" }, async (req) => {
  if (!req.auth) throw new HttpsError("unauthenticated", "Connectez-vous à Onco360.");
  const { espace, patientId } = req.data || {};
  if (!espace || !patientId) throw new HttpsError("invalid-argument", "Demande incomplète.");
  const m = await membre(espace, req.auth.uid);
  if (!m || m.actif === false) throw new HttpsError("permission-denied", "Vous n'êtes pas membre actif de cet espace.");
  const ref = db.doc("espaces/" + espace + "/patients/" + patientId), cpt = db.doc("espaces/" + espace + "/compteurs/dossiers");
  const numero = await db.runTransaction(async (tx) => {
    const p = await tx.get(ref); if (!p.exists) throw new HttpsError("not-found", "Dossier introuvable.");
    const d = p.data(); if (!voit(m, d.etablissementId)) throw new HttpsError("permission-denied", "Dossier hors de vos établissements.");
    if (d.identite && d.identite.numero) return d.identite.numero; // déjà numéroté : on ne change rien
    const c = await tx.get(cpt), r = N.attribuer([{ id: patientId, ms: Date.now() }], c.exists ? c.data() : {});
    tx.set(cpt, r.compteurs, { merge: true });
    tx.update(ref, { "identite.numero": r.attributions[0].numero, version: (d.version || 1) + 1, maj: FieldValue.serverTimestamp(), majPar: req.auth.uid });
    return r.attributions[0].numero;
  });
  return { numero };
});
// Numérotation, une fois, des dossiers qui n'ont pas encore de numéro, dans l'ordre de leur inscription (médecin titulaire)
exports.numerosManquants = onCall({ timeoutSeconds: 120, memory: "256MiB" }, async (req) => {
  if (!req.auth) throw new HttpsError("unauthenticated", "Connectez-vous à Onco360.");
  const { espace } = req.data || {};
  if (!espace) throw new HttpsError("invalid-argument", "Demande incomplète.");
  if ((await titulaire(espace)) !== req.auth.uid) throw new HttpsError("permission-denied", "Réservé au médecin titulaire.");
  const col = db.collection("espaces/" + espace + "/patients"), cpt = db.doc("espaces/" + espace + "/compteurs/dossiers");
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(col), c = await tx.get(cpt), sans = [], docs = {};
    snap.forEach((d) => { const x = d.data(); if (x.identite && x.identite.numero) return; docs[d.id] = x; sans.push({ id: d.id, ms: N.dateCreation(d.id, x.identite || {}, d.createTime ? d.createTime.toMillis() : 0) }); });
    if (!sans.length) return { nb: 0 };
    if (sans.length > 450) throw new HttpsError("resource-exhausted", "Trop de dossiers à numéroter d'un coup.");
    const r = N.attribuer(sans, c.exists ? c.data() : {});
    tx.set(cpt, r.compteurs, { merge: true });
    r.attributions.forEach((a) => tx.update(col.doc(a.id), { "identite.numero": a.numero, version: (docs[a.id].version || 1) + 1, maj: FieldValue.serverTimestamp(), majPar: req.auth.uid }));
    return { nb: r.attributions.length };
  });
});

// ───── Plusieurs cabinets (phase F, étape 4, 09/10/2026) ─────
// comptes/{uid} = { espace, espaces } : les cabinets de cette personne (lu par elle seule, écrit ici seulement). Tenu à jour à chaque
// fiche de membre écrite ou retirée ; depuis le 10/10/2026 (19.2) un compte peut avoir plusieurs cabinets (secrétaire de plusieurs
// médecins : menu « Cabinet » dans Onco360) ; espace = cabinet principal. Les membres du cabinet modèle sans fiche « comptes » l'ouvrent par défaut.
// Administration (compte séparé, collection administrateurs) : crée les cabinets et en voit la liste, sans aucune donnée médicale ;
// les règles ne lui ouvrent aucun cabinet (tout passe par ces fonctions).
const C = require("./cabinets");
const { getAuth } = require("firebase-admin/auth");
const estAdministrateur = async (uid) => !!uid && (await db.doc("administrateurs/" + uid).get()).exists;
// ───── Journal de l'Administration (17.5, 10/10/2026) ─────
// journalAdmin/{id} (serveur seulement, aucune règle) = { le, par, parEmail, type, espace, cabinet, txt } : une ligne par action du
// compte d'administration (création, réglage, suspension, suppression, abonnement, packs, spécialité…) ou d'Onco360 (suspension
// automatique). Écrit sans jamais bloquer l'action elle-même ; jamais de donnée médicale.
const EMAILS = {};
async function jAdmin(par, type, espace, cabinet, txt) {
  try {
    if (par && par !== "onco360" && !(par in EMAILS)) EMAILS[par] = await getAuth().getUser(par).then((u) => u.email || "").catch(() => "");
    await db.collection("journalAdmin").add({ le: new Date(), par: par || "", parEmail: par === "onco360" ? "Onco360 (automatique)" : EMAILS[par] || "", type, espace: espace || "", cabinet: String(cabinet || "").slice(0, 120), txt: String(txt || "").slice(0, 500) });
  } catch (e) { console.warn("journal de l'administration", e.message); }
}
const nomCab = async (e) => { try { const s = await db.doc("espaces/" + e).get(); return (s.exists && s.data().nom) || e; } catch (er) { return e; } };
// Formules modifiées par l'administration : plateforme/formules (aucune règle : serveur seulement), sinon formules de départ
async function formules() { try { const s = await db.doc("plateforme/formules").get(); return (s.exists && C.formulesValides(JSON.parse(s.data().data || "{}"))) || C.FORMULES; } catch (e) { return C.FORMULES; } }
exports.compteMembre = onDocumentWritten({ document: "espaces/{e}/membres/{uid}", timeoutSeconds: 60, memory: "256MiB" }, async (ev) => {
  const { e, uid } = ev.params; if (C.estBib(e)) return; // bibliothèque de référence : le compte d'administration garde sa page
  const ref = db.doc("comptes/" + uid), c = await ref.get(), apres = ev.data.after.exists ? ev.data.after.data() : null;
  // Liste des cabinets du compte (19.2) : ce cabinet ajouté (fiche écrite) ou retiré (fiche effacée)
  const mm = !c.exists && e !== C.MODELE ? (await db.doc("espaces/" + C.MODELE + "/membres/" + uid).get()).exists : false;
  const nv = C.compteModifie(c.exists ? c.data() : null, mm, e, !!apres);
  if (!nv) { if (c.exists) await ref.delete(); }
  else if (!c.exists || c.data().espace !== nv.espace || JSON.stringify(c.data().espaces || []) !== JSON.stringify(nv.espaces)) await ref.set(Object.assign(nv, { le: new Date().toISOString() }));
  if (apres) {
    // Nombre maximum de comptes de ce rôle (formule du cabinet) : au-delà, ce compte est désactivé (« hors formule »), jamais le titulaire
    if (apres.actif !== false) {
      const es = (await db.doc("espaces/" + e).get()).data() || {};
      if (es.abonnement && es.titulaire !== uid) {
        const n = (await db.collection("espaces/" + e + "/membres").where("role", "==", apres.role || "").get()).docs.filter((d) => d.data().actif !== false).length;
        if (C.horsQuota(es.abonnement, apres.role, n)) { await ev.data.after.ref.update({ actif: false, horsQuota: true }); console.log("hors formule", e, uid, apres.role, n); return; }
      }
    }
    // Profil de départ d'un membre ajouté par son titulaire (le navigateur ne peut pas écrire le profil d'une autre personne)
    if (!ev.data.before.exists) {
      const p = db.doc("utilisateurs/" + uid), sp = await p.get();
      if (!sp.exists || !sp.data().nom) await p.set({ email: apres.email || "", nom: String(apres.nom || "").replace(/^(Dr|Pr)\.?\s+/i, ""), telephone: apres.telephone || "", titre: apres.role === "medecin" ? "Dr" : "", profession: apres.role || "" }, { merge: true });
    }
  }
});
// Nouveau cabinet : compte du médecin (créé s'il n'existe pas), cabinet, fiche de membre titulaire, copie de ce que reçoit un
// cabinet neuf (cabinets.js). Le mot de passe est choisi par le médecin (e-mail envoyé par la page Administration).
// ───── Bibliothèque de référence (09/10/2026) ─────
// Ce que reçoit un cabinet neuf vient d'une COPIE mise de côté (plateforme/reference + plateforme/reference/docs/{chemin}), prise
// dans le cabinet de Dr Bentahila quand l'administration le décide (« Mettre à jour la bibliothèque de référence »), et déjà
// nettoyée (ni correspondants, ni tarifs du cabinet, ni absences). Les modifications d'un médecin dans son cabinet ne touchent que
// son cabinet ; celles de Dr Bentahila ne passent aux nouveaux cabinets qu'après une mise à jour de la référence. Serveur seulement.
const REF = "plateforme/reference";
async function prendreReference(par) {
  const M = "espaces/" + C.MODELE + "/", json = (s) => { try { return s.exists ? JSON.parse(s.data().data || "null") : null; } catch (er) { return null; } };
  const [prot, sl, sc, st, ...sb] = await Promise.all([db.collection(M + "protocoles").get(), db.doc(M + "parametres/listes").get(), db.doc(M + "parametres/calendrier").get(), db.doc(M + "finances/tarifs").get()].concat(C.BIBLIOTHEQUES.map((b) => db.doc(M + "bibliotheques/" + b).get())));
  const docs = [];
  prot.forEach((p) => docs.push(["protocoles__" + p.id, p.data()]));
  docs.push(["parametres__listes", { data: JSON.stringify(C.listesDepart(json(sl))) }], ["parametres__calendrier", { data: JSON.stringify(C.calendrierDepart(json(sc))) }], ["finances__tarifs", { data: JSON.stringify(C.tarifsDepart(json(st))) }]);
  sb.forEach((x, i) => { if (x.exists) docs.push(["bibliotheques__" + C.BIBLIOTHEQUES[i], x.data()]); });
  const anciens = await db.collection(REF + "/docs").listDocuments(), b = db.batch();
  anciens.forEach((r) => b.delete(r));
  docs.forEach(([k, v]) => b.set(db.doc(REF + "/docs/" + k), v));
  const nb = { protocoles: prot.docs.reduce((n, p) => { try { return n + JSON.parse(p.data().data || "[]").length; } catch (e) { return n; } }, 0) };
  sb.forEach((x, i) => { if (x.exists) { try { nb[C.BIBLIOTHEQUES[i]] = JSON.parse(x.data().data || "[]").length; } catch (e) { /* illisible */ } } });
  const meta = { le: new Date().toISOString(), par, source: C.MODELE, nb, docs: docs.length };
  b.set(db.doc(REF), meta); await b.commit();
  console.log("bibliothèque de référence prise par", par, JSON.stringify(nb));
  return meta;
}
// Ce que reçoit un cabinet neuf : la bibliothèque de référence de sa spécialité (espaces/bib-…, 10/10/2026), nettoyée à la copie
// (listes sans correspondants, fériés sans absences, tarifs : actes RT seulement) ; documents PDF déposés recopiés. Si elle n'existe
// pas encore : l'ancienne copie mise de côté (plateforme/reference).
async function sourceBib(bib) {
  const B = "espaces/" + bib + "/", json = (x) => { try { return x.exists ? JSON.parse(x.data().data || "null") : null; } catch (er) { return null; } };
  const [prot, st, bibs, ...sp] = await Promise.all([db.collection(B + "protocoles").get(), db.doc(B + "finances/tarifs").get(), db.collection(B + "bibliotheques").get()].concat(C.PARAMS_SPE.map((k) => db.doc(B + "parametres/" + k).get())));
  const out = { protocoles: prot.docs.map((d) => ({ id: d.id, data: d.data() })), docs: [], fichiers: [], bib }, jour = new Date().toISOString().slice(0, 10);
  // Paramètres de base de la spécialité (horaires, fériés, WhatsApp, couleurs, types, tâches automatiques, RCP, réglages, listes)
  sp.forEach((x, i) => { const v = C.parametreDepart(C.PARAMS_SPE[i], json(x), jour); if (v) out.docs.push({ chemin: "parametres/" + C.PARAMS_SPE[i], data: { data: JSON.stringify(v) } }); });
  out.docs.push({ chemin: "finances/tarifs", data: { data: JSON.stringify(C.tarifsDepart(json(st))) } });
  bibs.forEach((d) => out.docs.push({ chemin: "bibliotheques/" + d.id, data: d.data() }));
  return out;
}
async function source(par, specialite) {
  const bib = C.bibDe(specialite);
  if ((await db.doc("espaces/" + bib).get()).exists) return sourceBib(bib);
  if (!(await db.doc(REF).get()).exists) await prendreReference(par);
  const s = await db.collection(REF + "/docs").get(), out = { protocoles: [], docs: [] };
  s.forEach((d) => { const [col, id] = d.id.split("__"); if (col === "protocoles") out.protocoles.push({ id, data: d.data() }); else out.docs.push({ chemin: col + "/" + id, data: d.data() }); });
  return out;
}
// Ouvrir une bibliothèque de référence pour la modifier (page Administration) : créée la 1re fois (Oncologie – Radiothérapie : à
// partir de la copie mise de côté le 09/10 ; autres spécialités : listes vides, à remplir), avec le compte d'administration comme
// membre (aucun droit sur les patients ; il n'y a aucun patient). Renvoie l'identifiant à ouvrir dans Onco360 (v2.html?espace=…).
// P11 (18/10/2026, décision de Dr Bentahila) : la bibliothèque d'Oncologie – Radiothérapie (bib-oncologie, ce que reçoit chaque cabinet
// neuf) devient une copie de celle du cabinet Bentahila, faite quand l'administration le décide (bouton de l'onglet Bibliothèques) :
// protocoles, médicaments, ordonnances types, analyses, bilans, examens, courriers (étoiles retirées), paramètres de base nettoyés
// (parametreDepart), tarifs de radiothérapie. Jamais : patients, correspondants, prix, lieux, équipe, documentation (PDF du cabinet).
// Ensuite la bibliothèque du cabinet Bentahila est la sienne : ses modifications ne changent plus la référence.
exports.referenceDepuisCabinet = onCall({ timeoutSeconds: 300, memory: "512MiB" }, async (req) => {
  const par = req.auth && req.auth.uid;
  if (!(await estAdministrateur(par))) throw new HttpsError("permission-denied", "Réservé à l'administration d'Onco360.");
  const M = "espaces/" + C.MODELE + "/", E = "espaces/bib-oncologie/", jour = new Date().toISOString().slice(0, 10);
  if (!(await db.doc("espaces/bib-oncologie").get()).exists) throw new HttpsError("failed-precondition", "Ouvrez d'abord une fois la bibliothèque d'Oncologie – Radiothérapie (« Créer et ouvrir »).");
  const json = (x) => { try { return x.exists ? JSON.parse(x.data().data || "null") : null; } catch (er) { return null; } };
  const [prot, ancienne, st, ...rest] = await Promise.all([db.collection(M + "protocoles").get(), db.collection(E + "protocoles").get(), db.doc(M + "finances/tarifs").get()]
    .concat(C.BIBLIOTHEQUES.map((k) => db.doc(M + "bibliotheques/" + k).get())).concat(C.PARAMS_SPE.map((k) => db.doc(M + "parametres/" + k).get())));
  const sb = rest.slice(0, C.BIBLIOTHEQUES.length), sp = rest.slice(C.BIBLIOTHEQUES.length);
  const ecr = [], nb = { protocoles: 0 };
  ancienne.docs.forEach((d) => ecr.push(["del", d.ref]));
  prot.docs.forEach((d) => { const v = d.data(), data = C.sansEtoiles(v.data, jour); try { nb.protocoles += JSON.parse(data).length; } catch (er) { /* illisible */ } ecr.push(["set", db.doc(E + "protocoles/" + d.id), Object.assign({}, v, { data })]); });
  sb.forEach((x, i) => { if (x.exists) { const v = x.data(); ecr.push(["set", db.doc(E + "bibliotheques/" + C.BIBLIOTHEQUES[i]), Object.assign({}, v, { data: C.sansEtoiles(v.data, jour) })]); } });
  sp.forEach((x, i) => { const v = C.parametreDepart(C.PARAMS_SPE[i], json(x), jour); if (v) ecr.push(["set", db.doc(E + "parametres/" + C.PARAMS_SPE[i]), { data: JSON.stringify(v) }]); });
  ecr.push(["set", db.doc(E + "finances/tarifs"), { data: JSON.stringify(C.tarifsDepart(json(st))) }]);
  ecr.push(["merge", db.doc(E + "parametres/migrations"), C.migrationsFaites(jour)]);
  ecr.push(["merge", db.doc("espaces/bib-oncologie"), { copieDuCabinet: { le: new Date().toISOString(), par, nb } }]);
  for (let i = 0; i < ecr.length; i += 400) {
    const b = db.batch();
    ecr.slice(i, i + 400).forEach(([op, ref, v]) => { if (op === "del") b.delete(ref); else if (op === "merge") b.set(ref, v, { merge: true }); else b.set(ref, v); });
    await b.commit();
  }
  await jAdmin(par, "bibliotheque", "bib-oncologie", "Bibliothèque Oncologie – Radiothérapie", "Recopiée depuis le cabinet du Dr Bentahila (" + nb.protocoles + " protocoles)");
  console.log("référence recopiée depuis", C.MODELE, "par", par, JSON.stringify(nb));
  return { nb, le: jour };
});
// P9 (18/10/2026) : bibliothèque commune. L'administration publie une version de la référence (numéro, notes = journal des changements) ;
// chaque cabinet demande ses différences (protocoles et ordonnances types nouveaux ou différents, functions/reference.js) et choisit dans
// Onco360 (protocoles.js) ; rien n'est écrit ici dans un cabinet. « Signaler une erreur » arrive dans le journal de l'administration.
const REF_E = "espaces/bib-oncologie";
exports.referencePublier = onCall({ timeoutSeconds: 60, memory: "256MiB" }, async (req) => {
  const par = req.auth && req.auth.uid;
  if (!(await estAdministrateur(par))) throw new HttpsError("permission-denied", "Réservé à l'administration d'Onco360.");
  const notes = String((req.data || {}).notes || "").trim().slice(0, 2000); if (!notes) throw new HttpsError("invalid-argument", "Écrivez ce qui a changé (journal des changements).");
  const ref = db.doc(REF_E), s = await ref.get(); if (!s.exists) throw new HttpsError("failed-precondition", "Bibliothèque de référence absente.");
  const n = (s.data().version || 0) + 1, v = { n, le: new Date().toISOString(), par, notes };
  await ref.set({ version: n, versions: FieldValue.arrayUnion(v) }, { merge: true });
  await jAdmin(par, "bibliotheque", "bib-oncologie", "Bibliothèque Oncologie – Radiothérapie", "Version " + n + " publiée : " + notes.slice(0, 200));
  return { version: n };
});
exports.referenceDiff = onCall({ timeoutSeconds: 120, memory: "512MiB" }, async (req) => {
  const par = req.auth && req.auth.uid, { espace } = req.data || {};
  if (!par) throw new HttpsError("unauthenticated", "Connectez-vous à Onco360.");
  if (!espace || espace === C.MODELE || C.estBib(espace)) return { version: 0, items: [], ordos: [], listes: [] };
  const es = await db.doc("espaces/" + espace).get(), m = es.exists ? await membre(espace, par) : null;
  if (!m || m.actif === false || es.data().actif === false || m.role !== "medecin" || !(m.droits && m.droits.parametres === true)) throw new HttpsError("permission-denied", "Réservé au médecin (droit « paramètres »).");
  const rs = await db.doc(REF_E).get(); if (!rs.exists || !rs.data().version) return { version: 0, items: [], ordos: [], listes: [] };
  const RF = require("./reference.js"), lire = (snap) => { const L = []; snap.forEach((d) => { try { JSON.parse(d.data().data || "[]").forEach((p) => L.push(p)); } catch (er) { /* bloc illisible */ } }); return L; };
  const jsonDe = (x, def) => { try { return x.exists ? JSON.parse(x.data().data || "null") || def : def; } catch (er) { return def; } };
  const E = "espaces/" + espace + "/";
  const [pr, pc, cfg, sup, orr, orc] = await Promise.all([db.collection(REF_E + "/protocoles").get(), db.collection(E + "protocoles").get(), db.doc(E + "parametres/reference").get(),
    db.doc(E + "parametres/protocolesSupprimes").get(), db.doc(REF_E + "/bibliotheques/ordostypes").get(), db.doc(E + "bibliotheques/ordostypes").get()]);
  const conf = cfg.exists ? cfg.data() : {}, refus = conf.refus || {}, vue = conf.vue || 0;
  const items = RF.differences(lire(pr), lire(pc), refus, jsonDe(sup, [])).map((x) => Object.assign(x, { resume: x.cab ? RF.resume(x.cab, x.ref) : null }));
  const ordos = orr.exists && orc.exists ? RF.differencesOrdos(jsonDe(orr, []), jsonDe(orc, []), refus) : [];
  // R-E4 (19/10/2026) : autres bibliothèques ; liste jamais enregistrée par le cabinet = liste de départ d'Onco360 (rien à proposer ici :
  // le cabinet la reçoit telle quelle à sa première modification)
  const listes = [];
  for (const n of RF.LISTES) {
    const [lr, lc] = await Promise.all([db.doc(REF_E + "/bibliotheques/" + n).get(), db.doc(E + "bibliotheques/" + n).get()]);
    if (lr.exists && lc.exists) listes.push(...RF.differencesListe(n, jsonDe(lr, []), jsonDe(lc, []), refus, lc.data().retires || []));
  }
  const versions = (rs.data().versions || []).filter((v) => v.n > vue).map((v) => ({ n: v.n, le: v.le, notes: v.notes }));
  return { version: rs.data().version, vue, versions, items, ordos, listes };
});
exports.signalerErreur = onCall({ timeoutSeconds: 30, memory: "256MiB" }, async (req) => {
  const par = req.auth && req.auth.uid, { espace, protocole, texte } = req.data || {};
  if (!par) throw new HttpsError("unauthenticated", "Connectez-vous à Onco360.");
  const es = espace ? await db.doc("espaces/" + espace).get() : null, m = es && es.exists ? await membre(espace, par) : null;
  if (!m || m.actif === false) throw new HttpsError("permission-denied", "Réservé aux membres du cabinet.");
  const t = String(texte || "").trim().slice(0, 1500); if (!t) throw new HttpsError("invalid-argument", "Décrivez l'erreur.");
  await jAdmin(par, "signalement", espace, es.data().nom || espace, "Erreur signalée par " + (m.nom || "") + " sur « " + String((protocole || {}).nom || "").slice(0, 200) + " » (" + String((protocole || {}).id || "") + ") : " + t);
  return { ok: true };
});
exports.bibliothequeOuvrir = onCall({ timeoutSeconds: 120, memory: "256MiB" }, async (req) => {
  const par = req.auth && req.auth.uid;
  if (!(await estAdministrateur(par))) throw new HttpsError("permission-denied", "Réservé à l'administration d'Onco360.");
  const B = C.BIBS.find((x) => x.id === (req.data || {}).bib); if (!B) throw new HttpsError("invalid-argument", "Bibliothèque inconnue.");
  await jAdmin(par, "bibliotheque", B.id, "Bibliothèque " + B.lib, "Bibliothèque de référence ouverte pour modification");
  const ref = db.doc("espaces/" + B.id), s = await ref.get(), jour = new Date().toISOString().slice(0, 10), b = db.batch(), E = "espaces/" + B.id + "/";
  const moi = await getAuth().getUser(par);
  b.set(db.doc(E + "membres/" + par), { role: "medecin", nom: "Administration Onco360", email: moi.email || "", actif: true, tousEtablissements: true, etablissements: [], droits: Object.assign({}, C.DROITS_BIB), cree: jour, creePar: par });
  if (s.exists) b.set(ref, { abonnement: { formule: "bibliotheque", surMesure: true, modules: Object.assign({}, C.MODULES_BIB), max: {} } }, { merge: true });
  // Oncologie – Radiothérapie : paramètres de base repris UNE FOIS du cabinet du Dr Bentahila (10/10/2026), nettoyés ; ensuite
  // ils ne dépendent plus de son cabinet
  let importe = false;
  if (B.id === "bib-oncologie" && !(s.exists && s.data().parametresImportes)) {
    const M = "espaces/" + C.MODELE + "/parametres/", json = (x) => { try { return x.exists ? JSON.parse(x.data().data || "null") : null; } catch (er) { return null; } };
    const [src, deja] = await Promise.all([Promise.all(C.PARAMS_SPE.map((k) => db.doc(M + k).get())), Promise.all(C.PARAMS_SPE.map((k) => db.doc(E + "parametres/" + k).get()))]);
    C.PARAMS_SPE.forEach((k, i) => {
      const v = C.parametreDepart(k, json(src[i]), jour), d0 = json(deja[i]); if (!v) return;
      if (!deja[i].exists) b.set(db.doc(E + "parametres/" + k), { data: JSON.stringify(v) });
      else if (k === "calendrier" && d0 && !d0.horaires && v.horaires) b.set(db.doc(E + "parametres/" + k), { data: JSON.stringify(Object.assign({}, d0, { horaires: v.horaires })) });
    });
    importe = true;
  }
  if (!s.exists) {
    b.set(ref, { nom: "Bibliothèque " + B.lib, bibliotheque: true, specialites: B.specialites, titulaire: par, cree: jour, creePar: par, actif: true, abonnement: { formule: "bibliotheque", surMesure: true, modules: Object.assign({}, C.MODULES_BIB), max: {} } });
    b.set(db.doc(E + "parametres/migrations"), C.migrationsFaites(jour));
    if (B.id === "bib-oncologie") {
      if (!(await db.doc(REF).get()).exists) await prendreReference(par);
      (await db.collection(REF + "/docs").get()).forEach((d) => { const [col, id] = d.id.split("__"); b.set(db.doc(E + col + "/" + id), d.data()); });
    } else {
      // Autre spécialité : listes vides (sinon Onco360 afficherait les listes de départ de l'oncologie)
      ["medicaments", "ordostypes", "analyses", "bilans", "examens", "courriers", "documentation"].forEach((k) => b.set(db.doc(E + "bibliotheques/" + k), { data: "[]" }));
      b.set(db.doc(E + "parametres/listes"), { data: JSON.stringify({ diag: [], mut: C.listesDepart(null).mut, cor: [], complet: true }) });
      const rc = await db.doc(REF + "/docs/parametres__calendrier").get(); if (rc.exists) b.set(db.doc(E + "parametres/calendrier"), rc.data());
      b.set(db.doc(E + "finances/tarifs"), { data: JSON.stringify({ repli: "", etablissements: {}, actesRT: [], vmat: null }) });
    }
  }
  if (importe) b.set(ref, { parametresImportes: jour }, { merge: true }); // après la création de la fiche
  await b.commit();
  console.log("bibliothèque ouverte", B.id, "par", par, s.exists ? "" : "(créée)");
  return { espace: B.id, cree: !s.exists };
});
// Création d'un cabinet (compte du titulaire, cabinet, copie de la référence) ; utilisée par creerCabinet et creerCabinetDemo
async function creerEspace(d, par, opts) {
  const auth = getAuth(); let u = null, existant = false;
  try { u = await auth.getUserByEmail(d.email); existant = true; } catch (e) { if (e.code !== "auth/user-not-found") throw e; }
  if (existant) {
    const c = await db.doc("comptes/" + u.uid).get();
    if ((c.exists && c.data().espace) || (await db.doc("espaces/" + C.MODELE + "/membres/" + u.uid).get()).exists) throw new HttpsError("already-exists", "Cette adresse e-mail est déjà utilisée dans un cabinet Onco360.");
    if (await estAdministrateur(u.uid)) throw new HttpsError("already-exists", "Cette adresse est celle d'un compte d'administration.");
  } else {
    const mdp = require("node:crypto").randomBytes(24).toString("base64") + "a9!";
    u = await auth.createUser({ email: d.email, password: mdp, displayName: ("Dr " + d.prenom + " " + d.nom).replace(/\s+/g, " ").trim() });
  }
  const ids = (await db.collection("espaces").listDocuments()).map((x) => x.id), e = opts.id && ids.indexOf(opts.id) < 0 ? opts.id : C.idCabinet(d.cabinet, ids), jour = new Date().toISOString().slice(0, 10), E = "espaces/" + e + "/";
  const FS = await formules(), spe = ((FS[opts.formule || "complet"] || FS.complet || {}).specialite) || "Oncologie médicale";
  const src = await source(par, spe), b = db.batch();
  const sp = await ficheDe(spe); // fiche patient et consultation de la spécialité ; réglage du modèle (R-A6) sous celui du pack
  const abonNeuf = C.abonnement({ formule: opts.formule || "complet" }, await formules());
  if (sp.reglage) abonNeuf.reglage = C.reglageNettoye(MOD.reglageNeuf(abonNeuf.reglage || null, sp.reglage));
  b.set(db.doc("espaces/" + e), Object.assign({ nom: d.cabinet, titulaire: u.uid, cree: jour, creePar: par, actif: true, abonnement: abonNeuf }, sp.fiche ? { ficheSpe: sp.fiche } : {}, sp.consultation ? { consultSpe: sp.consultation } : {}, opts.espace || {}));
  b.set(db.doc(E + "membres/" + u.uid), C.membreTitulaire(d, jour, par));
  src.protocoles.forEach((p) => b.set(db.doc(E + "protocoles/" + p.id), p.data));
  // Documentation : les PDF déposés dans la bibliothèque sont recopiés dans le cabinet (chemin réécrit)
  const copies = [];
  src.docs.forEach((x) => {
    if (x.chemin === "bibliotheques/documentation" && src.bib) {
      let L = []; try { L = JSON.parse(x.data.data || "[]"); } catch (er) { L = []; }
      L.forEach((dd) => { if (dd.chemin && dd.chemin.indexOf("espaces/" + src.bib + "/") === 0) { const n = "espaces/" + e + "/" + dd.chemin.slice(("espaces/" + src.bib + "/").length); copies.push([dd.chemin, n]); dd.chemin = n; } });
      b.set(db.doc(E + x.chemin), Object.assign({}, x.data, { data: JSON.stringify(L) }));
    } else b.set(db.doc(E + x.chemin), x.data);
  });
  b.set(db.doc(E + "parametres/migrations"), C.migrationsFaites(jour));
  b.set(db.doc("comptes/" + u.uid), { espace: e, le: new Date().toISOString() });
  b.set(db.doc("utilisateurs/" + u.uid), Object.assign({ email: d.email, prenom: d.prenom, nom: d.nom, telephone: d.telephone, titre: "Dr", profession: "medecin" }, opts.profil || {}), { merge: true });
  await b.commit();
  for (const [de, vers] of copies) await getStorage().bucket().file(de).copy(vers).catch((er) => console.warn("copie du document", de, er.message));
  return { espace: e, uid: u.uid, existant, protocoles: src.protocoles.length, jour, bibliotheque: src.bib || "reference" };
}
exports.creerCabinet = onCall({ timeoutSeconds: 120, memory: "256MiB" }, async (req) => {
  const par = req.auth && req.auth.uid;
  if (!(await estAdministrateur(par))) throw new HttpsError("permission-denied", "Réservé à l'administration d'Onco360.");
  let d; try { d = C.verifier(req.data || {}); } catch (e) { throw new HttpsError("invalid-argument", e.message); }
  const o = await creerEspace(d, par, { formule: (req.data || {}).formule });
  // Abonnement de départ (17.4) : essai gratuit de 30 jours, sauf choix contraire (mensuel, annuel, gratuit sans limite)
  const jour = new Date().toISOString().slice(0, 10), f = Fa.reglageFacturation({ mode: (req.data || {}).modeFacturation || "essai" }), RA = await reglagesAbo();
  if (f.mode === "essai") f.essaiFin = Fa.ajouterJours(jour, RA.essai);
  if (f.mode === "mensuel" || f.mode === "annuel") f.echeance = jour; // à régler dès le premier paiement
  await db.doc("facturation/" + o.espace).set(Object.assign(f, { debut: jour, paiements: [], journal: [{ le: new Date().toISOString(), par, txt: "Cabinet créé : " + (Fa.MODES_FACT.find((m) => m[0] === f.mode) || [])[1] }] }));
  await jAdmin(par, "creation", o.espace, d.cabinet, "Cabinet créé pour " + [d.prenom, d.nom].join(" ").trim() + " (" + d.email + ") · pack " + (((await formules())[(req.data || {}).formule] || {}).lib || (req.data || {}).formule || "") + " · " + ((Fa.MODES_FACT.find((m) => m[0] === f.mode) || [])[1] || f.mode) + (o.existant ? " · compte déjà existant" : ""));
  console.log("cabinet créé", o.espace, d.email, "par", par);
  return { espace: o.espace, existant: o.existant, protocoles: o.protocoles };
});
// ───── Cabinet de démonstration (étape 9 S3, 09/10/2026) ─────
// Un seul, « cab-demonstration » (espaces/{e}.demo = true), formule Complète, clinique fictive DEMO avec ses tarifs, 8 patients
// fictifs (demo.js) ; « Réinitialiser » refait patients, consultations, tâches, salle et montants au jour près. Le compte de
// démonstration est un compte comme les autres (son e-mail, son mot de passe), à utiliser pour les démonstrations et les guides.
const Dm = require("./demo");
const Fa = require("./facturation");
const DEMO = "cab-demonstration";
async function remplirDemo(e, uid) {
  const E = "espaces/" + e + "/";
  for (const c of ["patients", "patientsFinances", "encaissements", "consultations", "taches", "salle", "rcp", "fichiers", "documentsRT", "presence", "rappels"]) await db.recursiveDelete(db.collection(E + c)).catch(() => {});
  const jour = new Date().toISOString().slice(0, 10), [sp, st] = await Promise.all([db.collection(E + "protocoles").get(), db.doc(E + "finances/tarifs").get()]);
  const protos = [].concat(...sp.docs.map((d) => { try { return JSON.parse(d.data().data || "[]"); } catch (er) { return []; } }));
  let T = {}; try { T = JSON.parse((st.exists && st.data().data) || "{}"); } catch (er) { T = {}; }
  const P = Dm.patientsDemo(protos, T.actesRT || [], jour), b = db.batch(), now = FieldValue.serverTimestamp();
  b.set(db.doc(E + "etablissements/DEMO"), Dm.ETAB);
  b.set(db.doc(E + "finances/tarifs"), { data: JSON.stringify(Dm.tarifsDemo(T)) });
  P.forEach((p) => b.set(db.doc(E + "patients/" + p.id), Object.assign({}, p.data, { maj: now, majPar: uid })));
  Dm.consultationsDemo(P, jour, uid).forEach((c, i) => b.set(db.doc(E + "consultations/demo" + (i + 1)), Object.assign(c, { maj: now })));
  b.set(db.doc(E + "compteurs/dossiers"), { [jour.slice(0, 7).replace("-", "")]: P.length });
  await b.commit();
  return { patients: P.length, jour };
}
exports.creerCabinetDemo = onCall({ timeoutSeconds: 300, memory: "512MiB" }, async (req) => {
  const par = req.auth && req.auth.uid;
  if (!(await estAdministrateur(par))) throw new HttpsError("permission-denied", "Réservé à l'administration d'Onco360.");
  if ((await db.doc("espaces/" + DEMO).get()).exists) throw new HttpsError("already-exists", "Le cabinet de démonstration existe déjà : utilisez « Réinitialiser ».");
  let d; try { d = C.verifier({ cabinet: "Cabinet de démonstration", prenom: "Démo", nom: "ONCO360", email: (req.data || {}).email, telephone: "" }); } catch (e) { throw new HttpsError("invalid-argument", e.message); }
  const o = await creerEspace(d, par, { id: DEMO, formule: "complet", espace: { demo: true, ville: "Casablanca" }, profil: { specialite: "Oncologue-radiothérapeute (démonstration)", inpe: "000000000" } });
  const r = await remplirDemo(o.espace, o.uid);
  await jAdmin(par, "creation", o.espace, "Cabinet de démonstration", "Cabinet de démonstration créé (" + d.email + ", " + r.patients + " patients fictifs)");
  console.log("cabinet de démonstration créé", o.espace, d.email, "par", par);
  return { espace: o.espace, existant: o.existant, protocoles: o.protocoles, patients: r.patients };
});
exports.demoReinitialiser = onCall({ timeoutSeconds: 300, memory: "512MiB" }, async (req) => {
  const par = req.auth && req.auth.uid;
  if (!(await estAdministrateur(par))) throw new HttpsError("permission-denied", "Réservé à l'administration d'Onco360.");
  const s = await db.doc("espaces/" + DEMO).get();
  if (!s.exists || s.data().demo !== true) throw new HttpsError("not-found", "Pas de cabinet de démonstration.");
  const r = await remplirDemo(DEMO, s.data().titulaire);
  await jAdmin(par, "demo", DEMO, s.data().nom || "Cabinet de démonstration", "Démonstration réinitialisée (" + r.patients + " patients fictifs)");
  console.log("démonstration réinitialisée par", par);
  return r;
});
// Liste des cabinets pour la page Administration : nom, titulaire, date, nombre de membres et de dossiers (aucune donnée médicale)
exports.listeCabinets = onCall({ timeoutSeconds: 60, memory: "256MiB" }, async (req) => {
  if (!(await estAdministrateur(req.auth && req.auth.uid))) throw new HttpsError("permission-denied", "Réservé à l'administration d'Onco360.");
  const t0 = Date.now(), [snap, FS, sf] = await Promise.all([db.collection("espaces").get(), formules(), db.collection("facturation").get().catch(() => null)]);
  const FACT = {}; if (sf) sf.forEach((d) => { FACT[d.id] = d.data(); });
  // Activité (17.3) : dernière ligne du journal d'audit et nombre d'actions des 30 derniers jours (aucune donnée médicale)
  const il30 = new Date(Date.now() - 30 * 86400000);
  const activite = async (id) => { try { const l = db.collection("audit/" + id + "/lignes"), [s1, n] = await Promise.all([l.orderBy("le", "desc").limit(1).get(), l.where("le", ">=", il30).count().get()]);
    const x = s1.docs[0] && s1.docs[0].data(); return { derniere: x && x.le && x.le.toDate ? x.le.toDate().toISOString() : "", par: (x && x.parNom) || "", n30: n.data().count }; } catch (e) { console.warn("activité", id, e.message); return null; } };
  console.log("listeCabinets : " + snap.size + " cabinets lus en " + (Date.now() - t0) + " ms");
  // Chaque comptage à part : un cabinet illisible n'empêche pas d'afficher les autres
  const nb = async (q) => { try { return (await q.count().get()).data().count; } catch (e) { console.warn("comptage", e.message); return null; } };
  const out = await Promise.all(snap.docs.filter((s) => !C.estBib(s.id)).map(async (s) => {
    const r = s.ref, x = s.data() || {};
    const [sm, patients, netab, act] = await Promise.all([r.collection("membres").select("role", "actif", "nom", "email", "telephone").get().catch(() => null), nb(r.collection("patients")), nb(r.collection("etablissements")), activite(r.id)]);
    const roles = {}; let membres = null, t = {};
    const equipe = [];
    if (sm) { membres = sm.size; sm.forEach((d) => { const m = d.data(); if (m.actif !== false) roles[m.role] = (roles[m.role] || 0) + 1; if (d.id === x.titulaire) t = m; equipe.push({ nom: m.nom || "", role: m.role || "", email: m.email || "", actif: m.actif !== false, titulaire: d.id === x.titulaire }); }); }
    // Date de création : texte AAAA-MM-JJ (le cabinet de référence l'a en date Firebase) ; sinon date de la fiche
    const jour = (v) => (!v ? "" : typeof v === "string" ? v.slice(0, 10) : v.toDate ? v.toDate().toISOString().slice(0, 10) : "");
    return { id: r.id, nom: x.nom || (r.id === C.MODELE ? "Cabinet du Dr Bentahila" : r.id), cree: jour(x.cree) || (s.createTime ? s.createTime.toDate().toISOString().slice(0, 10) : ""), actif: x.actif !== false, modele: r.id === C.MODELE, suspenduLe: x.suspenduLe || "",
      titulaire: { nom: t.nom || "", email: t.email || "", telephone: t.telephone || "" }, membres, patients, roles, etablissements: netab, abonnement: x.abonnement || null, ville: x.ville || "", adresse: x.adresse || "", telephone: x.telephone || "", demo: x.demo === true, equipe, activite: act, facturation: FACT[r.id] || null, suspenduAuto: !!(FACT[r.id] && FACT[r.id].suspenduPour && x.actif === false) };
  }));
  console.log("listeCabinets : terminé en " + (Date.now() - t0) + " ms");
  // Bibliothèques de référence : nombre d'éléments de chaque liste (null = liste de départ d'Onco360)
  const bibliotheques = await Promise.all(C.BIBS.map(async (B) => {
    const s = snap.docs.find((d) => d.id === B.id); if (!s) return Object.assign({}, B, { existe: false });
    const [p, l] = await Promise.all([db.collection("espaces/" + B.id + "/protocoles").get(), db.collection("espaces/" + B.id + "/bibliotheques").get()]), nb = {};
    nb.protocoles = p.docs.reduce((n, d) => { try { return n + JSON.parse(d.data().data || "[]").length; } catch (er) { return n; } }, 0);
    l.forEach((d) => { try { nb[d.id] = JSON.parse(d.data().data || "[]").length; } catch (er) { /* illisible */ } });
    return Object.assign({}, B, { existe: true, nb, cree: s.data().cree || "", version: s.data().version || 0, versions: (s.data().versions || []).slice(-5), copieDuCabinet: s.data().copieDuCabinet || null });
  }));
  const sp = await db.doc("plateforme/specialites").get().catch(() => null), specialites = {};
  if (sp && sp.exists) Object.values(sp.data()).forEach((o) => { if (o && o.nom) specialites[o.nom] = { fiche: o.fiche || {}, le: o.ficheLe || o.le || "", consultation: o.consultation || {}, csLe: o.consultationLe || "" }; });
  // Cabinets supprimés dont la facturation est gardée (comptabilité)
  const vivants = new Set(snap.docs.map((d) => d.id)), archives = Object.entries(FACT).filter(([id]) => !vivants.has(id)).map(([id, f]) => ({ id, nom: f.cabinetNom || id, supprimeLe: f.supprimeLe || "", facturation: f }));
  const [se2, sfa] = await Promise.all([db.doc("plateforme/editeur").get().catch(() => null), db.collection("factures").orderBy("le", "desc").limit(2000).get().catch(() => null)]);
  const factures = sfa ? sfa.docs.map((x) => Object.assign({ id: x.id }, x.data())) : [];
  return { cabinets: out, formules: FS, bibliotheques, specialites, archives, reglagesAbo: await reglagesAbo(), editeur: se2 && se2.exists ? se2.data() : null, factures, lu: new Date().toISOString() };
});
// Suspendre (abonnement non payé) ou réactiver un cabinet : espaces/{e}.actif. Suspendu = plus personne n'y entre (règles), rien
// n'est effacé. Jamais le cabinet modèle (celui de Dr Bentahila).
exports.etatCabinet = onCall({ timeoutSeconds: 30, memory: "256MiB" }, async (req) => {
  const par = req.auth && req.auth.uid;
  if (!(await estAdministrateur(par))) throw new HttpsError("permission-denied", "Réservé à l'administration d'Onco360.");
  const { espace, actif } = req.data || {};
  if (!espace || espace === C.MODELE) throw new HttpsError("permission-denied", "Ce cabinet ne peut pas être suspendu.");
  const ref = db.doc("espaces/" + espace); if (!(await ref.get()).exists) throw new HttpsError("not-found", "Cabinet introuvable.");
  const le = new Date().toISOString();
  await ref.update(actif ? { actif: true, suspenduLe: FieldValue.delete(), reactiveLe: le, etatPar: par } : { actif: false, suspenduLe: le, etatPar: par });
  await jAdmin(par, actif ? "reactivation" : "suspension", espace, await nomCab(espace), actif ? "Cabinet réactivé" : "Cabinet suspendu");
  console.log("cabinet", espace, actif ? "réactivé" : "suspendu", "par", par);
  return { actif: !!actif };
});
// Supprimer un cabinet, définitivement : seulement s'il est suspendu et si son nom exact est retapé. Efface ses données (base et
// fichiers déposés), les comptes de ses membres (connexion et rattachement) et leurs liaisons Google Agenda. Jamais le cabinet
// modèle ; jamais un compte d'administration ni un membre du cabinet modèle. Les sauvegardes quotidiennes de la base gardent
// une copie 14 semaines.
const { getStorage } = require("firebase-admin/storage");
exports.supprimerCabinet = onCall({ timeoutSeconds: 300, memory: "512MiB" }, async (req) => {
  const par = req.auth && req.auth.uid;
  if (!(await estAdministrateur(par))) throw new HttpsError("permission-denied", "Réservé à l'administration d'Onco360.");
  const { espace, confirmation } = req.data || {};
  if (!espace || espace === C.MODELE || !/^cab-/.test(espace)) throw new HttpsError("permission-denied", "Ce cabinet ne peut pas être supprimé.");
  const ref = db.doc("espaces/" + espace), s = await ref.get();
  if (!s.exists) throw new HttpsError("not-found", "Cabinet introuvable.");
  const x = s.data();
  if (x.actif !== false) throw new HttpsError("failed-precondition", "Suspendez d'abord le cabinet.");
  if (String(confirmation || "").trim() !== String(x.nom || espace).trim()) throw new HttpsError("invalid-argument", "Le nom retapé ne correspond pas.");
  const membres = await ref.collection("membres").get(), auth = getAuth(), comptes = [];
  for (const m of membres.docs) {
    const uid = m.id, c = await db.doc("comptes/" + uid).get();
    // membre d'autres cabinets aussi (19.2) : ce cabinet est seulement retiré de sa liste ; son compte et son Google Agenda restent
    const nv = C.compteModifie(c.exists ? c.data() : null, false, espace, false);
    if (c.exists) { if (nv) await c.ref.set(Object.assign(nv, { le: new Date().toISOString() })); else await c.ref.delete(); }
    if (!nv) await db.doc("agendaJetons/" + uid).delete().catch(() => {});
    const garder = !!nv || (await estAdministrateur(uid)) || (await db.doc("espaces/" + C.MODELE + "/membres/" + uid).get()).exists;
    if (!garder) { await auth.deleteUser(uid).catch((e) => console.warn("compte", uid, e.message)); await db.doc("utilisateurs/" + uid).delete().catch(() => {}); comptes.push(uid); }
  }
  await db.recursiveDelete(ref);
  await db.recursiveDelete(db.doc("audit/" + espace)).catch((e) => console.warn("journal", e.message)); // son journal d'audit aussi
  await getStorage().bucket().deleteFiles({ prefix: "espaces/" + espace + "/" }).catch((e) => console.warn("fichiers", e.message));
  // Comptabilité (18.2) : la fiche de facturation (paiements) est gardée, marquée « supprimé », avec le nom du cabinet
  await db.doc("facturation/" + espace).set({ supprime: true, supprimeLe: new Date().toISOString(), cabinetNom: x.nom || espace }, { merge: true }).catch(() => {});
  await jAdmin(par, "suppression", espace, x.nom || espace, "Cabinet supprimé définitivement (" + membres.size + " membre(s), " + comptes.length + " compte(s) effacé(s))");
  console.log("cabinet supprimé", espace, x.nom, "par", par, "comptes supprimés", comptes.length);
  return { comptes: comptes.length };
});
// Lien pour choisir son mot de passe (09/10/2026 : l'e-mail de Firebase arrive souvent dans les indésirables) : l'administration
// le copie ou l'envoie par WhatsApp. Seulement pour le titulaire d'un cabinet neuf (jamais un membre du cabinet modèle ni un
// compte d'administration : le lien donne l'accès au compte).
exports.lienMotDePasse = onCall({ timeoutSeconds: 30, memory: "256MiB" }, async (req) => {
  if (!(await estAdministrateur(req.auth && req.auth.uid))) throw new HttpsError("permission-denied", "Réservé à l'administration d'Onco360.");
  const email = String((req.data || {}).email || "").trim().toLowerCase();
  let u; try { u = await getAuth().getUserByEmail(email); } catch (e) { throw new HttpsError("not-found", "Compte introuvable."); }
  const c = await db.doc("comptes/" + u.uid).get(), e = c.exists ? c.data().espace : "";
  if (!e || e === C.MODELE || (await titulaire(e)) !== u.uid || (await estAdministrateur(u.uid))) throw new HttpsError("permission-denied", "Lien possible seulement pour le médecin titulaire d'un cabinet créé ici.");
  // 1.2 (11/10/2026, audit) : seulement pour un compte jamais utilisé (premier mot de passe d'un cabinet neuf). Un médecin qui
  // s'est déjà connecté passe par « Mot de passe oublié ? » : l'e-mail part à sa propre adresse, l'administration ne peut pas
  // reprendre son compte.
  if (u.metadata && u.metadata.lastSignInTime) {
    await jAdmin(req.auth.uid, "acces", e, await nomCab(e), "Lien du mot de passe refusé (compte déjà utilisé) pour " + email);
    throw new HttpsError("failed-precondition", "Ce médecin s'est déjà connecté à Onco360 : le lien n'est possible que pour un premier mot de passe. Pour changer son mot de passe, il clique sur « Mot de passe oublié ? » sur la page de connexion (l'e-mail part à sa propre adresse).");
  }
  const lien = await getAuth().generatePasswordResetLink(email, { url: "https://chimio-hgc.web.app" });
  await jAdmin(req.auth.uid, "acces", e, await nomCab(e), "Lien du mot de passe créé pour " + email);
  return { lien };
});
// Formule et modules d'un cabinet (page Administration) : espaces/{e}.abonnement, nettoyé par cabinets.js. Un module retiré est
// caché dans Onco360, ses données sont gardées. Possible aussi pour le cabinet de Dr Bentahila.
exports.abonnementCabinet = onCall({ timeoutSeconds: 30, memory: "256MiB" }, async (req) => {
  const par = req.auth && req.auth.uid;
  if (!(await estAdministrateur(par))) throw new HttpsError("permission-denied", "Réservé à l'administration d'Onco360.");
  const { espace } = req.data || {};
  const ref = db.doc("espaces/" + String(espace || "x")); if (!espace || !(await ref.get()).exists) throw new HttpsError("not-found", "Cabinet introuvable.");
  // Pack + retouches du cabinet (ordre, cartes, onglets, fonctions… ; identiqueAuPack : réglage égal à celui du pack)
  const ab = Object.assign(C.abonnement(req.data || {}, await formules()), { le: new Date().toISOString(), par });
  await ref.update({ abonnement: ab });
  await jAdmin(par, "reglage", espace, await nomCab(espace), "Réglage du cabinet : pack " + (((await formules())[ab.formule] || {}).lib || ab.formule) + (ab.retouche ? " avec retouches" : "") + " · " + C.MODULES.filter((k) => ab.modules[k]).length + " module(s)");
  console.log("abonnement", espace, ab.formule, ab.surMesure ? "(sur mesure)" : "", "par", par);
  return { abonnement: ab };
});
// Formules modifiées par l'administration (nom, modules, maximums ; ajout, suppression si aucun cabinet ne l'utilise). Les cabinets
// qui suivent une formule sans retouche (« sur mesure ») reçoivent ses nouvelles valeurs.
exports.formulesEnregistrer = onCall({ timeoutSeconds: 60, memory: "256MiB" }, async (req) => {
  const par = req.auth && req.auth.uid;
  if (!(await estAdministrateur(par))) throw new HttpsError("permission-denied", "Réservé à l'administration d'Onco360.");
  const FS = C.formulesValides((req.data || {}).formules);
  if (!FS) throw new HttpsError("invalid-argument", "Il faut au moins une formule.");
  const es = await db.collection("espaces").get(), utilisees = new Set(), maj = [];
  // Cabinets qui suivent un pack sans retouche : ils reçoivent ses nouvelles valeurs (modules, limites, réglage) ; un cabinet retouché
  // (ou réglé avant le 10/10 sans le savoir : réglage sans « retouche » noté) garde les siens
  es.forEach((d) => { const ab = d.data().abonnement; if (ab && ab.formule) { utilisees.add(ab.formule); if (FS[ab.formule] && !ab.surMesure && !(ab.reglage && ab.retouche !== false)) maj.push(d); } });
  const manquantes = [...utilisees].filter((f) => !FS[f]);
  if (manquantes.length) throw new HttpsError("failed-precondition", "Formule encore utilisée par un cabinet : " + manquantes.join(", ") + ". Changez d'abord la formule de ce cabinet.");
  await db.doc("plateforme/formules").set({ data: JSON.stringify(FS), le: new Date().toISOString(), par });
  for (const d of maj) {
    const ab0 = d.data().abonnement, ab = Object.assign(C.abonnement({ formule: ab0.formule }, FS), { le: new Date().toISOString(), par });
    ["fiche", "consultation"].forEach((q) => { if (ab0.reglage && ab0.reglage[q]) ab.reglage = Object.assign({}, ab.reglage || {}, { [q]: ab0.reglage[q] }); }); // retouches de la fiche patient et de la consultation gardées
    await d.ref.update({ abonnement: ab });
  }
  await jAdmin(par, "packs", "", "", "Packs enregistrés (" + Object.values(FS).map((f) => f.lib).join(", ") + ")" + (maj.length ? " · " + maj.length + " cabinet(s) mis à jour" : ""));
  console.log("formules enregistrées par", par, Object.keys(FS).join(", "), "cabinets mis à jour", maj.length);
  return { formules: FS, cabinets: maj.length };
});
// Nom et coordonnées d'un cabinet, nom et téléphone de son médecin titulaire (page Administration)
exports.infosCabinet = onCall({ timeoutSeconds: 30, memory: "256MiB" }, async (req) => {
  const par = req.auth && req.auth.uid;
  if (!(await estAdministrateur(par))) throw new HttpsError("permission-denied", "Réservé à l'administration d'Onco360.");
  let d; try { d = C.infos(req.data || {}); } catch (e) { throw new HttpsError("invalid-argument", e.message); }
  const ref = db.doc("espaces/" + String((req.data || {}).espace || "x")), s = await ref.get();
  if (!(req.data || {}).espace || !s.exists) throw new HttpsError("not-found", "Cabinet introuvable.");
  await ref.update({ nom: d.nom, ville: d.ville, adresse: d.adresse, telephone: d.telephone, infosLe: new Date().toISOString(), infosPar: par });
  const tit = s.data().titulaire;
  if (tit && d.titulaireNom) await ref.collection("membres").doc(tit).update({ nom: d.titulaireNom, telephone: d.titulaireTel }).catch((e) => console.warn("titulaire", e.message));
  await jAdmin(par, "infos", s.id, d.nom, "Informations modifiées" + (s.data().nom !== d.nom ? " (ancien nom : " + s.data().nom + ")" : ""));
  console.log("infos du cabinet", s.id, "par", par);
  return { ok: true };
});
// ───── Journal d'audit (étape 9 S1, 09/10/2026) ─────
// Chaque écriture dans un cabinet (espaces/{e}/{collection}/{document}) est notée par le serveur, avec l'identité réelle de la
// personne connectée (déclencheur « avec contexte d'authentification » : impossible à falsifier depuis le navigateur), dans
// audit/{e}/lignes/{identifiant de l'événement} (une seule ligne même si l'événement est rejoué). Ouvertures de dossier : signal
// de présence (presence/{uid}) qui change de dossier, ou le même après 30 min. Règles : lecture par le titulaire seul, aucune
// écriture. Logique : audit.js. Rien n'est effacé (durée de conservation à fixer avec le juriste).
const AU = require("./audit");
const { onDocumentWrittenWithAuthContext } = require("firebase-functions/v2/firestore");
const MEMBRES_CACHE = new Map();
async function membreNom(e, uid) {
  if (!uid) return { nom: "", role: "" };
  const k = e + "/" + uid, c = MEMBRES_CACHE.get(k); if (c && Date.now() - c.t < 600000) return c.v;
  const m = await membre(e, uid).catch(() => null), v = { nom: (m && (m.nom || m.email)) || "", role: (m && m.role) || "" };
  MEMBRES_CACHE.set(k, { t: Date.now(), v }); return v;
}
const ms = (v) => (v && typeof v.toMillis === "function" ? v.toMillis() : 0);
exports.auditEcriture = onDocumentWrittenWithAuthContext({ document: "espaces/{e}/{col}/{id}", timeoutSeconds: 60, memory: "256MiB" }, async (ev) => {
  const { e, col, id } = ev.params, avant = ev.data.before.exists ? ev.data.before.data() : null, apres = ev.data.after.exists ? ev.data.after.data() : null;
  let l = null;
  if (col === "presence") {
    if (!AU.ouverture(avant, apres, ms(avant && avant.le), ms(apres && apres.le))) return;
    l = { type: "ouverture", col: "patients", lib: "Dossier patient", docId: apres.patientId, element: "", quoi: [], patientId: apres.patientId, patientNom: "", par: ev.authType === "app_user" ? ev.authId : id, via: "onco360", pour: "" };
  } else {
    l = AU.ligne(col, id, avant, apres, AU.auteur(ev.authType, ev.authId, apres));
    if (!l) return;
    if (!apres && !(await db.doc("espaces/" + e).get()).exists) return; // cabinet supprimé en entier : rien à noter
  }
  if (l.patientId && !l.patientNom) { const p = await db.doc("espaces/" + e + "/patients/" + l.patientId).get().catch(() => null); if (p && p.exists) l.patientNom = AU.nomIdentite(p.data()); }
  const m = await membreNom(e, l.par || l.pour);
  await db.doc("audit/" + e + "/lignes/" + ev.id).set(Object.assign(l, { le: ev.time ? new Date(ev.time) : new Date(), parNom: m.nom, parRole: m.role }));
});
// ───── Comptes de l'équipe d'un cabinet (10/10/2026) ─────
// La création de comptes depuis le navigateur est fermée dans Firebase (personne ne peut s'inscrire seul) : le titulaire crée
// ici le compte d'un membre (secrétaire, infirmière, médecin, comptable), dans la limite de sa formule ; la personne choisit son
// mot de passe par l'e-mail de Firebase ou par le lien que le titulaire lui envoie (lienMembre).
exports.creerMembre = onCall({ timeoutSeconds: 60, memory: "256MiB" }, async (req) => {
  const par = req.auth && req.auth.uid, o = req.data || {}, e = String(o.espace || "");
  if (!par) throw new HttpsError("unauthenticated", "Connectez-vous à Onco360.");
  const es = e ? await db.doc("espaces/" + e).get() : null;
  if (!es || !es.exists) throw new HttpsError("not-found", "Cabinet introuvable.");
  const x = es.data();
  if (x.titulaire !== par) throw new HttpsError("permission-denied", "Seul le médecin titulaire peut créer un accès.");
  if (x.actif === false) throw new HttpsError("permission-denied", "Le cabinet est suspendu.");
  let d; try { d = C.membreDemande(o, new Date().toISOString().slice(0, 10), par); } catch (er) { throw new HttpsError("invalid-argument", er.message); }
  const sm = await db.collection("espaces/" + e + "/membres").get();
  const n = sm.docs.filter((m) => m.data().role === d.membre.role && m.data().actif !== false).length;
  if (x.abonnement && C.horsQuota(x.abonnement, d.membre.role, n + 1)) throw new HttpsError("resource-exhausted", "Votre formule Onco360 permet " + x.abonnement.max[d.membre.role] + " compte(s) de ce rôle : la limite est atteinte. Contactez l'éditeur d'Onco360 pour en ajouter.");
  const auth = getAuth(); let u = null, existant = false;
  try { u = await auth.getUserByEmail(d.email); existant = true; } catch (er) { if (er.code !== "auth/user-not-found") throw er; }
  let compte = null;
  if (existant) {
    if (sm.docs.some((m) => m.id === u.uid)) throw new HttpsError("already-exists", "Cette personne a déjà un accès à votre cabinet.");
    if (await estAdministrateur(u.uid)) throw new HttpsError("already-exists", "Cette adresse est celle d'un compte d'administration.");
    // Déjà dans un autre cabinet (19.2) : possible pour une secrétaire, une infirmière… qui travaille pour plusieurs médecins, après
    // confirmation du titulaire (autreCabinet) ; jamais le médecin titulaire d'un autre cabinet
    const c = await db.doc("comptes/" + u.uid).get(), mm = !c.exists && (await db.doc("espaces/" + C.MODELE + "/membres/" + u.uid).get()).exists;
    const autres = C.espacesCompte(c.exists ? c.data() : null, mm).filter((x) => x !== e);
    for (const a of autres) if ((await titulaire(a)) === u.uid) throw new HttpsError("already-exists", "Cette adresse est celle du médecin titulaire d'un autre cabinet Onco360 : prenez une autre adresse.");
    if (autres.length && o.autreCabinet !== true) throw new HttpsError("already-exists", "AUTRE_CABINET");
    compte = C.compteModifie(c.exists ? c.data() : null, mm, e, true);
  } else u = await auth.createUser({ email: d.email, password: require("node:crypto").randomBytes(24).toString("base64") + "a9!", displayName: d.membre.nom });
  const b = db.batch();
  b.set(db.doc("espaces/" + e + "/membres/" + u.uid), d.membre);
  b.set(db.doc("comptes/" + u.uid), Object.assign(compte || { espace: e, espaces: [e] }, { le: new Date().toISOString() }));
  // profil : celui d'une personne qui a déjà un compte n'est pas changé (c'est le sien)
  if (!compte) b.set(db.doc("utilisateurs/" + u.uid), { email: d.email, prenom: d.prenom, nom: d.nomFamille, telephone: d.membre.telephone, titre: d.membre.role === "medecin" ? "Dr" : "", profession: d.membre.role }, { merge: true });
  await b.commit();
  console.log("membre créé", e, d.membre.role, "par", par);
  return { uid: u.uid, existant };
});
// Lien pour choisir son mot de passe, à envoyer par le titulaire à un membre de son équipe (WhatsApp, SMS) ; jamais pour lui-même,
// un compte d'administration ou un membre d'un autre cabinet
exports.lienMembre = onCall({ timeoutSeconds: 30, memory: "256MiB" }, async (req) => {
  const par = req.auth && req.auth.uid, { espace, uid } = req.data || {};
  if (!par) throw new HttpsError("unauthenticated", "Connectez-vous à Onco360.");
  const es = espace ? await db.doc("espaces/" + espace).get() : null;
  if (!es || !es.exists || es.data().titulaire !== par) throw new HttpsError("permission-denied", "Réservé au médecin titulaire.");
  if (!uid || uid === par) throw new HttpsError("invalid-argument", "Demande incomplète.");
  const m = await db.doc("espaces/" + espace + "/membres/" + uid).get(), c = await db.doc("comptes/" + uid).get();
  const l = C.espacesCompte(c.exists ? c.data() : null, !c.exists && espace === C.MODELE);
  // compte de plusieurs cabinets (19.2) : le lien donnerait l'accès aux autres cabinets ; la personne change son mot de passe elle-même
  if (m.exists && l.length > 1 && l.indexOf(espace) >= 0) throw new HttpsError("permission-denied", "Cette personne a aussi accès au cabinet d'un autre médecin : elle choisit son mot de passe elle-même (« Mot de passe oublié » sur la page de connexion).");
  if (!m.exists || (await estAdministrateur(uid)) || l.length !== 1 || l[0] !== espace) throw new HttpsError("permission-denied", "Lien impossible pour ce compte.");
  const email = (await getAuth().getUser(uid)).email;
  return { lien: await getAuth().generatePasswordResetLink(email, { url: "https://chimio-hgc.web.app" }), email };
});
// ───── Listes corrigées dans tous les dossiers du cabinet (19.3, 10/10/2026) ─────
// Paramètres › Listes : un nom corrigé (diagnostic, mutuelle, correspondant) l'est dans tous les dossiers qui l'utilisent, même ceux
// des lieux que la personne ne voit pas (secrétaire d'un seul lieu). Droit « paramètres » ou « secretariat ». Logique : cabinets.js.
exports.corrigerListes = onCall({ timeoutSeconds: 120, memory: "256MiB" }, async (req) => {
  const par = req.auth && req.auth.uid, { espace } = req.data || {};
  if (!par) throw new HttpsError("unauthenticated", "Connectez-vous à Onco360.");
  const es = espace ? await db.doc("espaces/" + espace).get() : null, m = es && es.exists ? await membre(espace, par) : null;
  if (!m || m.actif === false || es.data().actif === false || !(m.droits && (m.droits.parametres === true || m.droits.secretariat === true))) throw new HttpsError("permission-denied", "Vous n'avez pas le droit de corriger les listes.");
  // 1.3 (11/10/2026, audit) : un diagnostic n'est corrigé dans les dossiers que par un médecin ; la secrétaire corrige mutuelles et
  // correspondants
  const R = C.renomsValides((req.data || {}).renoms).filter((r) => r.k !== "diag" || m.role === "medecin"); if (!R.length) return { n: 0 };
  const snap = await db.collection("espaces/" + espace + "/patients").get(); let n = 0, b = db.batch(), k = 0;
  for (const d of snap.docs) {
    const ch = C.corrigerDossier(d.data(), R); if (!ch) continue;
    b.update(d.ref, Object.assign(ch, { version: (d.data().version || 1) + 1, maj: FieldValue.serverTimestamp(), majPar: par })); n++;
    if (++k >= 400) { await b.commit(); b = db.batch(); k = 0; }
  }
  if (k) await b.commit();
  console.log("listes corrigées", espace, R.map((r) => r.k + " : " + r.de + " → " + r.vers).join(" ; "), "|", n, "dossier(s), par", par); // ancienne et nouvelle valeur
  return { n };
});
// ───── Fiche patient et formulaire de consultation de la spécialité (10/10/2026, 16.6 bis et 16.7) ─────
// Réglés une fois par spécialité (Administration › Par spécialité › Bibliothèque et paramètres), les mêmes pour tous les packs ;
// gardés dans plateforme/specialites { idSpécialité: { nom, fiche, consultation } } et recopiés dans chaque cabinet de la spécialité
// (espaces/{e}.ficheSpe / consultSpe, lisibles par son équipe), cabinets déjà créés compris ; les retouches d'un cabinet
// (abonnement.reglage.fiche / consultation) s'y ajoutent.
const bibDuCabinet = (x, FS) => C.bibDe((x.abonnement && FS[x.abonnement.formule] && FS[x.abonnement.formule].specialite) || "Oncologie – Radiothérapie");
const CHAMP_ESPACE = { fiche: "ficheSpe", consultation: "consultSpe" };
exports.ficheSpecialite = onCall({ timeoutSeconds: 120, memory: "256MiB" }, async (req) => {
  const par = req.auth && req.auth.uid, d = req.data || {}, quoi = d.quoi === "consultation" ? "consultation" : "fiche";
  if (!(await estAdministrateur(par))) throw new HttpsError("permission-denied", "Réservé à l'administration d'Onco360.");
  const spe = String(d.specialite || "").trim().slice(0, 40), fiche = C.ficheNettoyee(d.fiche) || {};
  if (!spe) throw new HttpsError("invalid-argument", "Spécialité manquante.");
  // Document relu puis réécrit en entier : une clé retirée (nom affiché, case) disparaît vraiment
  const ref = db.doc("plateforme/specialites"), s0 = await ref.get(), tout = s0.exists ? s0.data() : {}, id = C.idSpecialite(spe);
  tout[id] = Object.assign({}, tout[id] || {}, { nom: spe, [quoi]: fiche, [quoi + "Le"]: new Date().toISOString(), [quoi + "Par"]: par });
  await ref.set(tout);
  const FS = await formules(), bib = C.bibDe(spe), es = await db.collection("espaces").get(); let n = 0;
  for (const e of es.docs) { if (C.estBib(e.id) || bibDuCabinet(e.data(), FS) !== bib) continue; await e.ref.update({ [CHAMP_ESPACE[quoi]]: fiche }); n++; }
  await jAdmin(par, "specialite", "", "", (quoi === "consultation" ? "Formulaire de consultation" : "Fiche patient") + " de « " + spe + " » enregistré · " + n + " cabinet(s) mis à jour");
  console.log(quoi, "de la spécialité", spe, "par", par, n, "cabinet(s)");
  return { cabinets: n, fiche };
});
// ───── Modèle de la spécialité (R-A6, 18/10/2026, demande du cabinet du 17/10) ─────
// Le cabinet du Dr Bentahila (C.MODELE) est le modèle. « Reprendre » (à la demande, jamais en continu : un essai fait dans son cabinet ne
// part pas aussitôt dans le modèle) : ses réglages effectifs (fiche patient et formulaires de consultation, avec les retouches de
// l'administration et les siennes ; types de consultation ; paramètres de départ ; bibliothèques de prescription et modèles de documents de
// RT ; réglage du cabinet : menu, cartes, onglets, fonctions) remplacent le modèle de la spécialité : plateforme/specialites[id] (fiche,
// consultation, reglage, repris) et la bibliothèque de référence espaces/bib-… (parametres/*, bibliotheques/*). Jamais : patients, équipe,
// lieux, correspondants, tarifs, identité et en-tête, profils et signatures, abonnement, Google Agenda, horaires des lieux et absences.
// Avant d'écrire : différences partie par partie (confirmer = false), copie de l'état précédent dans le stockage
// (plateforme/sauvegardes/…, serveur seulement), ligne au journal de l'administration. Les cabinets neufs reçoivent ce modèle.
// « Appliquer » : le modèle dans un cabinet, parties cochées : rien de ce que le cabinet a modifié n'est écrasé, ce qui manque est ajouté
// (fiche et formulaire de la spécialité : le modèle, sans rien retirer ; les retouches du cabinet restent par-dessus).
const MOD = require("./modele.js"), PARAMS_MODELE = C.PARAMS_SPE.filter((k) => k !== "typesConsult");
const jsonDoc = (x, def) => { try { return x && x.exists ? JSON.parse(x.data().data || "null") : def; } catch (e) { return def; } };
const sauverCopie = async (chemin, v) => { await getStorage().bucket().file(chemin).save(JSON.stringify(v), { contentType: "application/json", resumable: false }); return chemin; };
async function etatModele(spe) {
  const id = C.idSpecialite(spe), bib = C.bibDe(spe), B = "espaces/" + bib + "/", sp = await db.doc("plateforme/specialites").get(), o = (sp.exists && sp.data()[id]) || {};
  const [pa, tc, ...bb] = await Promise.all([Promise.all(PARAMS_MODELE.map((k) => db.doc(B + "parametres/" + k).get())), db.doc(B + "parametres/typesConsult").get()].concat(MOD.BIBLIOTHEQUES.map((k) => db.doc(B + "bibliotheques/" + k).get())));
  const parametres = {}; PARAMS_MODELE.forEach((k, i) => { const v = jsonDoc(pa[i], null); if (v != null) parametres[k] = v; });
  const bibliotheques = {}; MOD.BIBLIOTHEQUES.forEach((k, i) => { const v = jsonDoc(bb[i], null); if (v != null) bibliotheques[k] = v; });
  return { id, bib, nom: o.nom || spe, repris: o.repris || null, modele: { fiche: o.fiche || null, consultation: o.consultation || null, reglage: o.reglage || null, typesConsult: jsonDoc(tc, null), parametres, bibliotheques } };
}
// Réglages d'un cabinet, sous la forme du modèle (fiche et formulaires effectifs, types, paramètres de départ nettoyés : sans correspondants,
// absences, horaires des lieux ; bibliothèques sans étoiles ; réglage) : ce que la reprise écrit dans le modèle, et ce que l'écart compare.
// Aucune donnée patient, ni tarif. `le` : dernière modification connue de chaque partie (documents qui portent une date « maj »).
async function reglagesDe(e) {
  const S = "espaces/" + e + "/", es = await db.doc("espaces/" + e).get(); if (!es.exists) throw new HttpsError("not-found", "Cabinet introuvable.");
  const FS = await formules(), ed = es.data(), spe = (ed.abonnement && FS[ed.abonnement.formule] && FS[ed.abonnement.formule].specialite) || "Oncologie – Radiothérapie", jour = new Date().toISOString().slice(0, 10);
  const [fo, ac, pa, tc, ...bb] = await Promise.all([db.doc(S + "parametres/formulaires").get(), db.doc(S + "parametres/accueil").get(), Promise.all(PARAMS_MODELE.map((k) => db.doc(S + "parametres/" + k).get())), db.doc(S + "parametres/typesConsult").get()].concat(MOD.BIBLIOTHEQUES.map((k) => db.doc(S + "bibliotheques/" + k).get())));
  const cat = await import("./site/catalogue.js"), E = MOD.effectifs(cat, ed, jsonDoc(fo, null), jsonDoc(ac, null));
  const parametres = {}; PARAMS_MODELE.forEach((k, i) => { const v = C.parametreDepart(k, jsonDoc(pa[i], null), jour); if (v != null) parametres[k] = v; });
  const bibliotheques = {}; MOD.BIBLIOTHEQUES.forEach((k, i) => { if (!bb[i].exists) return; let v = null; try { v = JSON.parse(C.sansEtoiles(bb[i].data().data, jour) || "null"); } catch (er) { v = null; } if (Array.isArray(v)) bibliotheques[k] = v; }); // étoiles retirées
  const nouveau = { fiche: C.ficheNettoyee(MOD.modeleForm(cat, cat.FICHE, E.fiche, E.onco)), consultation: C.ficheNettoyee(MOD.modeleForm(cat, cat.CONSULT, E.consultation, E.onco)),
    typesConsult: jsonDoc(tc, null), parametres, bibliotheques, reglage: C.reglageNettoye(E.reglage) };
  const t = (x) => (x && x.exists && x.data().maj && typeof x.data().maj.toDate === "function" ? x.data().maj.toDate().toISOString() : ""), max = (l) => l.map(t).filter(Boolean).sort().pop() || "";
  const le = { fiche: max([fo]), consultation: max([fo]), typesConsult: max([tc]), parametres: max(pa), bibliotheques: max(bb), reglage: max([ac]) };
  return { ed, spe, nouveau, le, cat };
}
exports.modeleReprendre = onCall({ timeoutSeconds: 120, memory: "512MiB" }, async (req) => {
  const par = req.auth && req.auth.uid, confirmer = !!(req.data || {}).confirmer;
  if (!(await estAdministrateur(par))) throw new HttpsError("permission-denied", "Réservé à l'administration d'Onco360.");
  const { spe, nouveau } = await reglagesDe(C.MODELE), { parametres, bibliotheques } = nouveau;
  const avant = await etatModele(spe), diffs = MOD.PARTIES.map(([k, lib]) => { const d = MOD.difference(avant.modele[k], nouveau[k]); return { k, lib, n: MOD.total(d), resume: MOD.resume(d) }; });
  const n = diffs.reduce((t, d) => t + d.n, 0);
  if (!confirmer) return { specialite: spe, repris: avant.repris, diffs, n };
  const le = new Date().toISOString(), copieDe = await sauverCopie("plateforme/sauvegardes/modele-" + avant.id + "-" + Date.now() + ".json", { specialite: spe, le, par, modele: avant.modele });
  const ref = db.doc("plateforme/specialites"), s0 = await ref.get(), tout = s0.exists ? s0.data() : {};
  tout[avant.id] = Object.assign({}, tout[avant.id] || {}, { nom: spe, fiche: nouveau.fiche, consultation: nouveau.consultation, reglage: nouveau.reglage, ficheLe: le, fichePar: par, consultationLe: le, consultationPar: par, repris: { le, par, source: C.MODELE, n, copie: copieDe } });
  await ref.set(tout);
  const B = "espaces/" + avant.bib + "/", b = db.batch();
  if (!(await db.doc("espaces/" + avant.bib).get()).exists) throw new HttpsError("failed-precondition", "Ouvrez d'abord une fois la bibliothèque de la spécialité (Administration › Bibliothèques, « Créer et ouvrir »).");
  Object.entries(parametres).forEach(([k, v]) => b.set(db.doc(B + "parametres/" + k), { data: JSON.stringify(v) }));
  if (nouveau.typesConsult) b.set(db.doc(B + "parametres/typesConsult"), { data: JSON.stringify(nouveau.typesConsult) });
  Object.entries(bibliotheques).forEach(([k, v]) => b.set(db.doc(B + "bibliotheques/" + k), { data: JSON.stringify(v), maj: FieldValue.serverTimestamp(), majPar: par }));
  await b.commit();
  await jAdmin(par, "specialite", avant.bib, spe, "Modèle repris du cabinet du Dr Bentahila : " + diffs.filter((d) => d.n).map((d) => d.lib.split(" (")[0] + " (" + d.n + ")").join(", ") + " · état précédent : " + copieDe);
  return { specialite: spe, repris: tout[avant.id].repris, diffs, n };
});
// Écart d'un cabinet au modèle de sa spécialité (demande du 18/10/2026) : ce que le cabinet a changé, partie par partie (ajouté par le cabinet,
// absent du cabinet, modifié), en lecture seule ; aucune donnée patient, ni correspondant, ni tarif ; pas noté au journal (rien n'est changé).
// Cabinet modèle : ce qu'il a changé depuis la dernière reprise.
exports.modeleEcart = onCall({ timeoutSeconds: 120, memory: "512MiB" }, async (req) => {
  const par = req.auth && req.auth.uid, e = String((req.data || {}).espace || "");
  if (!(await estAdministrateur(par))) throw new HttpsError("permission-denied", "Réservé à l'administration d'Onco360.");
  if (!e || C.estBib(e)) throw new HttpsError("invalid-argument", "Choisissez un cabinet.");
  const { ed, spe, nouveau, le, cat } = await reglagesDe(e), M = await etatModele(spe);
  const parties = MOD.PARTIES.map(([k, lib]) => Object.assign({ k, lib, le: le[k] || "" }, MOD.ecart(cat, k, M.modele[k], nouveau[k])));
  return { espace: e, nom: ed.nom || e, specialite: spe, repris: M.repris, modele: e === C.MODELE, parties, n: parties.reduce((t, x) => t + x.n, 0) };
});
// Ce que le modèle ajouterait dans un cabinet, partie par partie (et l'écrit si confirmer)
exports.modeleAppliquer = onCall({ timeoutSeconds: 120, memory: "512MiB" }, async (req) => {
  const par = req.auth && req.auth.uid, d = req.data || {}, e = String(d.espace || ""), confirmer = !!d.confirmer;
  if (!(await estAdministrateur(par))) throw new HttpsError("permission-denied", "Réservé à l'administration d'Onco360.");
  if (!e || e === C.MODELE || C.estBib(e)) throw new HttpsError("invalid-argument", "Choisissez un autre cabinet que le cabinet modèle.");
  const es = await db.doc("espaces/" + e).get(); if (!es.exists) throw new HttpsError("not-found", "Cabinet introuvable.");
  const FS = await formules(), ed = es.data(), spe = (ed.abonnement && FS[ed.abonnement.formule] && FS[ed.abonnement.formule].specialite) || "Oncologie – Radiothérapie";
  const M = (await etatModele(spe)).modele, parties = (Array.isArray(d.parties) ? d.parties : MOD.PARTIES.map((p) => p[0])).filter((k) => MOD.PARTIES.some((p) => p[0] === k));
  const E = "espaces/" + e + "/", [pa, tc, ta, act, ...bb] = await Promise.all([Promise.all(PARAMS_MODELE.map((k) => db.doc(E + "parametres/" + k).get())), db.doc(E + "parametres/typesConsult").get(), db.doc(E + "finances/tarifs").get(), db.doc(E + "parametres/activites").get()].concat(MOD.BIBLIOTHEQUES.map((k) => db.doc(E + "bibliotheques/" + k).get())));
  const ecr = [], avant = {}, diffs = [], ajouts = () => { const l = []; return { note: (c, v) => l.push(v && typeof v === "object" ? (Array.isArray(v) ? c : v.nom || v.lib || v.titre || v.k || v.id || c) : c + " : " + (v === true ? "oui" : v === false ? "non" : String(v).slice(0, 40))), l }; };
  const partie = (k, lib, n, details) => diffs.push({ k, lib, n, resume: n ? details : "rien à ajouter" });
  if (parties.indexOf("fiche") >= 0 || parties.indexOf("consultation") >= 0) {
    [["fiche", "ficheSpe"], ["consultation", "consultSpe"]].forEach(([k, champ]) => { if (parties.indexOf(k) < 0 || !M[k]) return;
      const v = MOD.modelePrioritaire(M[k], ed[champ] || {}), df = MOD.difference(ed[champ] || {}, v);
      if (MOD.total(df)) { avant[champ] = ed[champ] || null; ecr.push(["update", db.doc("espaces/" + e), { [champ]: v }]); }
      partie(k, (MOD.PARTIES.find((p) => p[0] === k) || [])[1], MOD.total(df), MOD.resume(df)); });
  }
  if (parties.indexOf("typesConsult") >= 0 && M.typesConsult) {
    const cab = jsonDoc(tc, null), acts = []; const t = jsonDoc(ta, {}) || {}; Object.values(t.etablissements || {}).forEach((x) => (x.activites || []).forEach((a) => acts.push([a.type, a.libelle]))); Object.values(jsonDoc(act, {}) || {}).forEach((L) => (L || []).forEach((a) => acts.push([a.t, a.lib])));
    const v = MOD.typesPourCabinet(cab, M.typesConsult, acts), df = MOD.difference(cab || [], v);
    if (MOD.total(df)) { avant.typesConsult = cab; ecr.push(["set", db.doc(E + "parametres/typesConsult"), { data: JSON.stringify(v) }]); }
    partie("typesConsult", "Types de consultation", MOD.total(df), MOD.resume(df));
  }
  if (parties.indexOf("parametres") >= 0) { let n = 0; const det = [];
    PARAMS_MODELE.forEach((k, i) => { if (M.parametres[k] == null) return; const cab = jsonDoc(pa[i], null), a = ajouts(); const v = MOD.fusionManquant(cab, M.parametres[k], a.note);
      if (a.l.length) { n += a.l.length; det.push(k + " : " + a.l.slice(0, 4).join(", ") + (a.l.length > 4 ? "…" : "")); avant["parametres/" + k] = cab; ecr.push(["set", db.doc(E + "parametres/" + k), { data: JSON.stringify(v) }]); } });
    partie("parametres", "Paramètres de départ", n, det.join(" ; ")); }
  if (parties.indexOf("bibliotheques") >= 0) { let n = 0; const det = [];
    // R-E4 (19/10/2026) : un élément retiré par le cabinet (liste « retires » de sa bibliothèque) n'est jamais remis
    MOD.BIBLIOTHEQUES.forEach((k, i) => { if (!Array.isArray(M.bibliotheques[k])) return; const cab = jsonDoc(bb[i], null), a = ajouts(), ret = (bb[i].exists && Array.isArray(bb[i].data().retires)) ? bb[i].data().retires : [];
      const v = MOD.fusionManquant(Array.isArray(cab) ? cab : null, M.bibliotheques[k].filter((o) => !(o && o.id && ret.indexOf(o.id) >= 0)), a.note);
      const nb = Array.isArray(cab) ? a.l.length : 0; // liste jamais enregistrée : elle devient celle du modèle (c'était la liste de départ)
      if (!Array.isArray(cab) || nb) { n += Array.isArray(cab) ? nb : v.length; det.push(k + " : " + (Array.isArray(cab) ? nb + " ajouté(s)" + (nb ? " (" + a.l.slice(0, 3).join(", ") + (nb > 3 ? "…" : "") + ")" : "") : "liste du modèle (" + v.length + ")"));
        avant["bibliotheques/" + k] = cab; ecr.push(["set", db.doc(E + "bibliotheques/" + k), Object.assign({ data: JSON.stringify(v), maj: FieldValue.serverTimestamp(), majPar: par }, ret.length ? { retires: ret } : {})]); } });
    partie("bibliotheques", "Bibliothèques de prescription et modèles de documents de RT", n, det.join(" ; ")); }
  if (parties.indexOf("reglage") >= 0 && M.reglage) { const cab = (ed.abonnement && ed.abonnement.reglage) || null, a = ajouts(), v = C.reglageNettoye(MOD.fusionManquant(cab, M.reglage, a.note));
    if (a.l.length) { avant.reglage = cab; ecr.push(["update", db.doc("espaces/" + e), { "abonnement.reglage": v }]); }
    partie("reglage", "Réglage du cabinet", a.l.length, a.l.length + " élément(s) ajouté(s) : " + a.l.slice(0, 8).join(", ") + (a.l.length > 8 ? "…" : "")); }
  const n = diffs.reduce((t, x) => t + x.n, 0);
  if (!confirmer || !ecr.length) return { espace: e, specialite: spe, diffs, n, ecrit: false };
  const copieDe = await sauverCopie(E + "sauvegardes/modele-" + Date.now() + ".json", { espace: e, le: new Date().toISOString(), par, avant });
  for (let i = 0; i < ecr.length; i += 400) { const b = db.batch(); ecr.slice(i, i + 400).forEach(([op, ref, v]) => (op === "update" ? b.update(ref, v) : b.set(ref, v))); await b.commit(); }
  await jAdmin(par, "modele", e, ed.nom || e, "Modèle de « " + spe + " » appliqué : " + diffs.filter((x) => x.n).map((x) => x.lib.split(" (")[0] + " (" + x.n + ")").join(", ") + " · état précédent : " + copieDe);
  return { espace: e, specialite: spe, diffs, n, ecrit: true };
});
async function ficheDe(specialite) { try { const s = await db.doc("plateforme/specialites").get(), o = s.exists ? s.data()[C.idSpecialite(specialite)] : null; return o || {}; } catch (e) { return {}; } }
// ───── Abonnements (17.4, 10/10/2026) ─────
// Fiche de facturation d'un cabinet (facturation/{e}, serveur seulement) : réglage (mode, prix, fin d'essai, échéance, note),
// paiement reçu (prolonge l'échéance d'un mois ou d'un an ; réactive un cabinet suspendu pour retard), paiement retiré.
exports.facturationCabinet = onCall({ timeoutSeconds: 30, memory: "256MiB" }, async (req) => {
  const par = req.auth && req.auth.uid, d = req.data || {};
  if (!(await estAdministrateur(par))) throw new HttpsError("permission-denied", "Réservé à l'administration d'Onco360.");
  const e = String(d.espace || ""), ref = db.doc("facturation/" + e), esp = db.doc("espaces/" + e), se = await esp.get();
  if (!e || !se.exists || C.estBib(e)) throw new HttpsError("not-found", "Cabinet introuvable.");
  const s0 = await ref.get(), f = s0.exists ? s0.data() : { paiements: [], journal: [], debut: new Date().toISOString().slice(0, 10) }, le = new Date().toISOString(), jr = [], NV = [];
  if (d.action === "regler") {
    const r = Fa.reglageFacturation(d.reglage);
    if (r.mode === "essai" && !r.essaiFin) r.essaiFin = Fa.ajouterJours(le.slice(0, 10), (await reglagesAbo()).essai);
    if (!r.jamaisSuspendre) delete r.jamaisSuspendre; if (!r.jamaisSuspendre) delete f.jamaisSuspendre;
    Object.assign(f, r); jr.push("Abonnement : " + (Fa.MODES_FACT.find((m) => m[0] === r.mode) || [])[1] + (r.prix != null ? ", " + r.prix + " DH" : "") + (r.echeance ? ", échéance " + r.echeance : r.essaiFin ? ", essai jusqu'au " + r.essaiFin : "") + (r.jamaisSuspendre ? ", jamais suspendu automatiquement" : ""));
  } else if (d.action === "paiement") {
    let p; try { p = Fa.paiementNettoye(d.paiement); } catch (er) { throw new HttpsError("invalid-argument", er.message); }
    const ech = Fa.prolonger(f, p.d, p.periode), P = Object.assign({ id: "p" + Date.now().toString(36), par, le, avant: f.echeance || f.essaiFin || "", apres: ech }, p);
    // Facture (18.4) : créée si « Mon entreprise » est complet ; sinon le paiement est gardé, la facture pourra être créée ensuite
    const FAC = await facturer("facture", e, se.data(), f, P, par).catch((er) => { console.warn("facture", er.message); return null; });
    if (FAC) { P.facture = FAC.numero; P.factureId = FAC.id; NV.push(FAC.doc); jr.push("Facture " + FAC.numero); } else jr.push("Facture non créée (« Mon entreprise » incomplet)");
    f.paiements = (f.paiements || []).concat([P]).slice(-200);
    f.echeance = ech; if (f.mode === "essai" || !f.mode) f.mode = p.periode === "an" ? "annuel" : "mensuel";
    jr.push("Paiement de " + p.m + " DH (" + (p.periode === "an" ? "1 an" : "1 mois") + ") : échéance au " + ech);
    // Cabinet suspendu pour retard : réactivé dès le paiement
    if (se.data().actif === false && f.suspenduPour) { await esp.update({ actif: true, suspenduLe: FieldValue.delete(), reactiveLe: le, etatPar: par }); jr.push("Cabinet réactivé (paiement reçu)"); delete f.suspenduPour; }
  } else if (d.action === "facturer") {
    const p = (f.paiements || []).find((x) => x.id === d.id); if (!p) throw new HttpsError("not-found", "Paiement introuvable.");
    if (p.facture) throw new HttpsError("already-exists", "Ce paiement a déjà sa facture (" + p.facture + ").");
    const FAC = await facturer("facture", e, se.data(), f, p, par); p.facture = FAC.numero; p.factureId = FAC.id; NV.push(FAC.doc); jr.push("Facture " + FAC.numero + " (paiement du " + p.d + ")");
  } else if (d.action === "relance") {
    // Relance (18.6) : notée (date, moyen, type) ; l'envoi lui-même est fait par l'administration (WhatsApp, e-mail, téléphone)
    const canal = Fa.CANAUX.some((x) => x[0] === d.canal) ? d.canal : "autre", type = ["retard", "renouveler", "essai"].indexOf(d.type) >= 0 ? d.type : "retard";
    f.relances = (f.relances || []).concat([{ id: "r" + Date.now().toString(36), le, par, canal, type, note: String(d.note || "").trim().slice(0, 200) }]).slice(-100);
    jr.push("Relance (" + (Fa.CANAUX.find((x) => x[0] === canal) || [])[1] + ") : " + { retard: "retard de paiement", renouveler: "échéance proche", essai: "fin d'essai" }[type]);
  } else if (d.action === "demandeTraitee") {
    const q = (f.demandes || []).find((x) => x.id === d.id); if (!q) throw new HttpsError("not-found", "Demande introuvable.");
    q.traitee = true; q.traiteeLe = le; q.traiteePar = par; jr.push("Demande du " + q.le.slice(0, 10) + " traitée");
  } else if (d.action === "client") {
    f.client = Fa.clientNettoye(d.client); jr.push("Coordonnées de facturation : " + [f.client.raison, f.client.ice ? "ICE " + f.client.ice : ""].filter(Boolean).join(", "));
  } else if (d.action === "retirerPaiement") {
    const p = (f.paiements || []).find((x) => x.id === d.id); if (!p) throw new HttpsError("not-found", "Paiement introuvable.");
    // Paiement déjà facturé : un avoir annule la facture (une facture n'est jamais effacée)
    if (p.facture) { const AV = await facturer("avoir", e, se.data(), f, p, par); NV.push(AV.doc); jr.push("Avoir " + AV.numero + " (annule la facture " + p.facture + ")"); }
    f.paiements = f.paiements.filter((x) => x.id !== d.id);
    if (f.echeance === p.apres) f.echeance = p.avant || ""; // dernier paiement retiré : échéance d'avant
    jr.push("Paiement du " + p.d + " (" + p.m + " DH) retiré");
  } else throw new HttpsError("invalid-argument", "Action inconnue.");
  f.journal = (f.journal || []).concat(jr.map((txt) => ({ le, par, txt }))).slice(-300); f.maj = le;
  await ref.set(f);
  await jAdmin(par, "abonnement", e, se.data().nom || e, jr.join(" · "));
  console.log("facturation", e, d.action, "par", par);
  return { facturation: f, actif: d.action === "paiement" ? true : se.data().actif !== false, factures: NV };
});
// Chaque nuit (4 h) : un cabinet dont l'échéance est dépassée de plus de 30 jours est suspendu (données gardées), une seule fois par
// échéance (une réactivation à la main n'est pas annulée la nuit suivante) ; jamais le cabinet de Dr Bentahila, la démonstration,
// un cabinet gratuit ou sans fiche de facturation
// Réglages (18.3) : suspension « demander » (par défaut : rien n'est suspendu, la liste attend la décision de l'administration),
// « auto » (suspendu après le délai) ou « jamais » ; un cabinet marqué jamaisSuspendre ne l'est jamais automatiquement.
exports.abonnementsNuit = onSchedule({ schedule: "0 4 * * *", timeZone: "Africa/Casablanca", timeoutSeconds: 300, memory: "256MiB" }, async () => {
  const RA = await reglagesAbo(); if (RA.suspension !== "auto") { console.log("abonnementsNuit : suspension « " + RA.suspension + " », rien n'est suspendu automatiquement"); return; }
  const jour = new Date().toISOString().slice(0, 10), sf = await db.collection("facturation").get(); let n = 0;
  for (const d of sf.docs) {
    const f = d.data(), et = Fa.etatFacturation(f, jour, RA);
    if (et.etat !== "suspendre" || d.id === C.MODELE || d.id === DEMO || f.suspenduPour === et.fin || f.jamaisSuspendre || f.supprime) continue;
    const esp = db.doc("espaces/" + d.id), se = await esp.get(); if (!se.exists || se.data().actif === false || se.data().demo) continue;
    const le = new Date().toISOString();
    await esp.update({ actif: false, suspenduLe: le, etatPar: "onco360" });
    await d.ref.update({ suspenduPour: et.fin, journal: FieldValue.arrayUnion({ le, par: "onco360", txt: "Suspendu automatiquement : échéance du " + et.fin + " non payée depuis " + et.jours + " jours" }) });
    await jAdmin("onco360", "suspension", d.id, se.data().nom || d.id, "Suspendu automatiquement : échéance du " + et.fin + " non payée depuis " + et.jours + " jours");
    n++; console.log("abonnement : cabinet suspendu pour retard", d.id, et.fin, et.jours, "j");
  }
  console.log("abonnementsNuit :", n, "cabinet(s) suspendu(s)");
});
// Lecture du journal de l'Administration (onglet Journal) : période (du, au : AAAA-MM-JJ), au plus 2 000 lignes, la plus récente d'abord
exports.journalAdmin = onCall({ timeoutSeconds: 60, memory: "256MiB" }, async (req) => {
  if (!(await estAdministrateur(req.auth && req.auth.uid))) throw new HttpsError("permission-denied", "Réservé à l'administration d'Onco360.");
  const d = req.data || {}, ok = (x) => typeof x === "string" && /^\d{4}-\d{2}-\d{2}$/.test(x);
  let q = db.collection("journalAdmin");
  if (ok(d.du)) q = q.where("le", ">=", new Date(d.du + "T00:00:00Z"));
  if (ok(d.au)) q = q.where("le", "<", new Date(new Date(d.au + "T00:00:00Z").getTime() + 86400000));
  const s = await q.orderBy("le", "desc").limit(2000).get();
  return { lignes: s.docs.map((x) => { const l = x.data(); return Object.assign({}, l, { id: x.id, le: l.le && l.le.toDate ? l.le.toDate().toISOString() : String(l.le || "") }); }) };
});
// Réglages des abonnements (18.3) : plateforme/abonnements (serveur seulement) ; lus partout par reglagesAbo()
async function reglagesAbo() { try { const s = await db.doc("plateforme/abonnements").get(); return Fa.reglagesAbo(s.exists ? s.data() : null); } catch (e) { return Fa.reglagesAbo(null); } }
exports.reglagesAbonnements = onCall({ timeoutSeconds: 30, memory: "256MiB" }, async (req) => {
  const par = req.auth && req.auth.uid;
  if (!(await estAdministrateur(par))) throw new HttpsError("permission-denied", "Réservé à l'administration d'Onco360.");
  const R = Fa.reglagesAbo((req.data || {}).reglages), LIB = { demander: "me demander", auto: "automatique", jamais: "jamais" };
  await db.doc("plateforme/abonnements").set(Object.assign({}, R, { le: new Date().toISOString(), par }));
  await jAdmin(par, "abonnement", "", "", "Réglages des abonnements : suspension " + LIB[R.suspension] + " après " + R.delai + " jours de retard, rappel " + R.rappel + " jours avant, essai " + R.essai + " jours");
  return { reglages: R };
});
// ───── Factures (18.4, 10/10/2026) ─────
// factures/{id} (serveur seulement) = { numero F-AAAA-NNNN | AV-AAAA-NNNN, type facture|avoir, annee, rang, d (émission), espace, cabinet,
// client, editeur (copie au jour de la facture), lignes [{ lib, du, au, ht, tva, ttc }], ht, tva, ttc, taux, paiement { id, d, moyen, ref },
// ref (avoir : facture annulée), le, par }. Numéros continus par année et par type : compteurs/factures { "F-2026": n } (transaction).
async function facturer(type, e, esp, f, p, par) {
  const ed = await db.doc("plateforme/editeur").get(), E = ed.exists ? ed.data() : null, manque = Fa.editeurIncomplet(E);
  if (manque.length) throw new HttpsError("failed-precondition", "Complétez d'abord « Mon entreprise » (Comptabilité) : " + manque.join(", ") + ".");
  const jour = new Date().toISOString().slice(0, 10), annee = jour.slice(0, 4), cle = (type === "avoir" ? "AV-" : "F-") + annee, cpt = db.doc("compteurs/factures");
  const rang = await db.runTransaction(async (t) => { const s = await t.get(cpt), n = ((s.exists && s.data()[cle]) || 0) + 1; t.set(cpt, { [cle]: n }, { merge: true }); return n; });
  const FS = await formules(), pack = ((FS[(esp.abonnement || {}).formule] || {}).lib) || "", M = Fa.montants(p.m, E.tva);
  const cl = Object.assign({ raison: esp.nom || e, adresse: [esp.adresse, esp.ville].filter(Boolean).join(", ") }, Object.fromEntries(Object.entries(f.client || {}).filter(([, v]) => v)));
  const lib = "Abonnement Onco360" + (pack ? " – " + pack : "") + " – " + (p.periode === "an" ? "1 an" : "1 mois");
  const F = { numero: Fa.numeroFacture(type, annee, rang), type, annee: Number(annee), rang, d: jour, espace: e, cabinet: esp.nom || e, client: cl, editeur: E,
    lignes: [Object.assign({ lib: (type === "avoir" ? "Annulation : " : "") + lib, du: p.avant && p.avant < p.apres ? p.avant : p.d, au: p.apres }, M)], ht: M.ht, tva: M.tva, ttc: M.ttc, taux: M.taux,
    paiement: { id: p.id, d: p.d, moyen: p.moyen, ref: p.ref || "" }, ref: type === "avoir" ? p.facture || "" : "", le: new Date(), par };
  const r = await db.collection("factures").add(F);
  await jAdmin(par, "abonnement", e, esp.nom || e, (type === "avoir" ? "Avoir " : "Facture ") + F.numero + " : " + M.ttc + " DH TTC" + (F.ref ? " (annule " + F.ref + ")" : ""));
  return { id: r.id, numero: F.numero, doc: Object.assign({ id: r.id }, F, { le: F.le.toISOString() }) };
}
// Mon entreprise (mentions légales des factures) : plateforme/editeur
exports.editeurEnregistrer = onCall({ timeoutSeconds: 30, memory: "256MiB" }, async (req) => {
  const par = req.auth && req.auth.uid;
  if (!(await estAdministrateur(par))) throw new HttpsError("permission-denied", "Réservé à l'administration d'Onco360.");
  const E = Fa.editeurNettoye((req.data || {}).editeur);
  await db.doc("plateforme/editeur").set(Object.assign({}, E, { le: new Date().toISOString(), par }));
  await jAdmin(par, "abonnement", "", "", "Mon entreprise (mentions des factures) enregistré : " + [E.raison, E.ice ? "ICE " + E.ice : ""].filter(Boolean).join(", "));
  return { editeur: E, manque: Fa.editeurIncomplet(E) };
});
// ───── Profil & Paramètres › Abonnement et Factures (18.5, 10/10/2026) ─────
// Lus par le médecin titulaire seulement (la facturation reste invisible des autres membres et des règles) : formule, état,
// échéance, prix du pack (mensuel, annuel), paiements, factures du cabinet, coordonnées de paiement (RIB) ; demandes envoyées.
async function titulaireDe(req) {
  const uid = req.auth && req.auth.uid, e = String((req.data || {}).espace || "");
  if (!uid || !e || C.estBib(e)) throw new HttpsError("permission-denied", "Réservé au médecin titulaire du cabinet.");
  const s = await db.doc("espaces/" + e).get();
  if (!s.exists || s.data().titulaire !== uid) throw new HttpsError("permission-denied", "Réservé au médecin titulaire du cabinet.");
  return { uid, e, esp: s.data() };
}
exports.monAbonnement = onCall({ timeoutSeconds: 30, memory: "256MiB" }, async (req) => {
  const { e, esp } = await titulaireDe(req);
  const [sf, FS, RA, se, sfa] = await Promise.all([db.doc("facturation/" + e).get(), formules(), reglagesAbo(), db.doc("plateforme/editeur").get(), db.collection("factures").where("espace", "==", e).get()]);
  const f = sf.exists ? sf.data() : null, k = (esp.abonnement || {}).formule || "", F = FS[k] || {}, P = F.prix || Fa.PRIX0[k] || {}, E = se.exists ? se.data() : {};
  const jour = new Date().toISOString().slice(0, 10), et = Fa.etatFacturation(f, jour, RA), pc = Fa.prixCabinet(f, F, k);
  const factures = sfa.docs.map((x) => { const v = x.data(); return Object.assign({ id: x.id }, v, { le: v.le && v.le.toDate ? v.le.toDate().toISOString() : "" }); }).sort((a, b) => String(b.numero).localeCompare(String(a.numero)));
  return { suivi: !!f && !esp.demo, demo: esp.demo === true, modele: e === C.MODELE, pack: F.lib || (esp.abonnement ? k : "Tout compris"), specialite: F.specialite || "", mode: f ? f.mode : "", prix: pc.prix, periode: pc.periode, prixPack: { mois: P.mois || null, an: P.an || null },
    etat: et, essaiFin: (f && f.essaiFin) || "", echeance: (f && f.echeance) || "", debut: (f && f.debut) || "", rappel: RA.rappel, actif: esp.actif !== false,
    paiements: ((f && f.paiements) || []).map((p) => ({ d: p.d, m: p.m, periode: p.periode, moyen: p.moyen, facture: p.facture || "" })).reverse(),
    demandes: ((f && f.demandes) || []).filter((q) => !q.traitee).map((q) => ({ le: q.le, type: q.type, message: q.message || "" })),
    factures, paiement: { raison: E.raison || "", rib: E.rib || "", banque: E.banque || "", email: E.email || "", tel: E.tel || "" } };
});
// Demande du titulaire (« Renouveler », « Passer à l'annuel », « Passer au mensuel ») : notée dans sa fiche de facturation et dans le
// journal de l'Administration ; pas de paiement en ligne (l'administration enregistre le paiement reçu)
exports.demandeAbonnement = onCall({ timeoutSeconds: 30, memory: "256MiB" }, async (req) => {
  const { uid, e, esp } = await titulaireDe(req), d = req.data || {};
  const type = ["renouveler", "annuel", "mensuel"].indexOf(d.type) >= 0 ? d.type : "renouveler", message = String(d.message || "").replace(/\s+/g, " ").trim().slice(0, 500);
  const m = await db.doc("espaces/" + e + "/membres/" + uid).get(), nom = (m.exists && m.data().nom) || "", le = new Date().toISOString();
  const LIB = { renouveler: "renouveler l'abonnement", annuel: "passer à l'abonnement annuel", mensuel: "passer à l'abonnement mensuel" };
  await db.doc("facturation/" + e).set({ demandes: FieldValue.arrayUnion({ id: "d" + Date.now().toString(36), le, par: uid, parNom: nom, type, message, traitee: false }) }, { merge: true });
  await jAdmin(uid, "abonnement", e, esp.nom || e, "Demande du cabinet (" + (nom || "titulaire") + ") : " + LIB[type] + (message ? " · « " + message + " »" : ""));
  return { ok: true };
});

// ───── Sauvegardes et récupération (étape 1.6 du 11/10/2026 ; lot R-F de l'audit n° 8, 20/10/2026) : functions/sauvegardes.js ─────
// exporterCabinet (export complet, titulaire), exportsHebdo / exportAuto (export de la semaine, Google Drive du cabinet), recuperation
// (un dossier, un document ou tout le cabinet tel qu'il était : titulaire ou Administration), fichiersNuit / fichiersSauvegarder (copie de
// secours des fichiers), sauvegardesEtat (Administration).
const SV = require("./sauvegardes")({ db, getStorage, getFirestore, getAuth, onCall, onSchedule, HttpsError, FieldValue, Timestamp, estAdministrateur, membre, jAdmin, oauth, SECRET, C });
["exporterCabinet", "exportsHebdo", "exportAuto", "recuperation", "fichiersNuit", "fichiersSauvegarder", "sauvegardesEtat"].forEach((k) => { exports[k] = SV[k]; });
