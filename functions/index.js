// Onco360 – fonctions serveur (Firebase, région europe-west1, comme la base).
// Google Agenda de chaque membre : « Lier mon Google Agenda » (Profil) crée dans SON compte Google un agenda « Onco360 »,
// tenu à jour dans un seul sens (Onco360 → Google) avec les patients qu'il a le droit de voir.
//   • agendaLier / agendaMaj / agendaDelier : appelées depuis Onco360 (personne connectée) ;
//   • agendaPatient : à chaque enregistrement d'un dossier ; agendaAbsences : absences du cabinet (titulaire) ;
//   • agendaMembre : droits ou établissements d'un membre modifiés ; agendaNuit : remise à plat chaque nuit.
// Jetons Google : collection agendaJetons/{uid}, inaccessible depuis le navigateur (aucune règle ne l'ouvre).
// État visible par la personne : utilisateurs/{uid}.agendaGoogle = { email, calendrier, le, nb, erreur }.
const { setGlobalOptions } = require("firebase-functions/v2");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { defineSecret, defineString } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
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
async function echec(uid, e) {
  console.error("agenda", uid, e);
  await etat(uid, { erreur: String((e && e.message) || e).slice(0, 300), le: new Date().toISOString() }).catch(() => {});
  if (e && e.revoque) await db.doc("agendaJetons/" + uid).set({ revoque: true }, { merge: true }).catch(() => {});
}
const membre = async (e, uid) => { const s = await db.doc("espaces/" + e + "/membres/" + uid).get(); return s.exists ? s.data() : null; };
const titulaire = async (e) => { const s = await db.doc("espaces/" + e).get(); return s.exists ? s.data().titulaire : null; };

// ───── Remise à plat complète de l'agenda d'une personne ─────
async function syncComplet(uid, J) {
  const m = await membre(J.espace, uid);
  if (!m || m.actif === false) throw new Error("Votre accès à Onco360 est désactivé : l'agenda n'est plus mis à jour.");
  const auj = L.jourCasa(), api = await apiPour(J);
  const pats = await db.collection("espaces/" + J.espace + "/patients").select("resume", "etablissementId").get();
  let voulus = [];
  pats.forEach((d) => { voulus = voulus.concat(L.evtsPatient(d.data(), m, auj)); });
  if ((await titulaire(J.espace)) === uid) {
    const c = await db.doc("espaces/" + J.espace + "/parametres/calendrier").get();
    try { voulus = voulus.concat(L.evtsAbsences(c.exists ? JSON.parse(c.data().data || "{}") : {}, auj)); } catch (e) { /* calendrier illisible */ }
  }
  const existants = await api.lister(J.calendrier, "onco360=1", L.timeMin(auj));
  const r = await L.appliquer(api, J.calendrier, voulus, existants, auj);
  await etat(uid, { email: J.email || "", calendrier: "Onco360", le: new Date().toISOString(), nb: voulus.length, erreur: "" });
  return Object.assign({ nb: voulus.length }, r);
}
// Un seul groupe (un patient, ou les absences) pour une personne
async function syncGroupe(uid, J, g, voulus) {
  const api = await apiPour(J), auj = L.jourCasa();
  const existants = await api.lister(J.calendrier, "g=" + g, L.timeMin(auj));
  await L.appliquer(api, J.calendrier, voulus.filter((e) => L.groupe(e.k) === g), existants, auj);
  await etat(uid, { le: new Date().toISOString(), erreur: "" });
}
const liesA = async (e) => (await db.collection("agendaJetons").where("espace", "==", e).get()).docs.filter((d) => !d.data().revoque);

// ───── Appelées depuis Onco360 ─────
exports.agendaLier = onCall(OPTS, async (req) => {
  if (!req.auth) throw new HttpsError("unauthenticated", "Connectez-vous à Onco360.");
  const uid = req.auth.uid, { code, espace } = req.data || {};
  if (!code || !espace) throw new HttpsError("invalid-argument", "Demande incomplète.");
  const m = await membre(espace, uid);
  if (!m || m.actif === false) throw new HttpsError("permission-denied", "Vous n'êtes pas membre actif de cet espace.");
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
  const auj = L.jourCasa();
  for (const d of await liesA(ev.params.e)) {
    try { const m = await membre(ev.params.e, d.id); await syncGroupe(d.id, d.data(), ev.params.p, L.evtsPatient(apres, m, auj)); }
    catch (e) { await echec(d.id, e); }
  }
});
exports.agendaAbsences = onDocumentWritten(Object.assign({ document: "espaces/{e}/parametres/calendrier" }, OPTS), async (ev) => {
  const tit = await titulaire(ev.params.e); if (!tit) return;
  const s = await db.doc("agendaJetons/" + tit).get(); if (!s.exists || s.data().revoque || s.data().espace !== ev.params.e) return;
  let cal = {}; try { cal = ev.data.after.exists ? JSON.parse(ev.data.after.data().data || "{}") : {}; } catch (e) { /* illisible */ }
  try { await syncGroupe(tit, s.data(), "abs", L.evtsAbsences(cal, L.jourCasa())); } catch (e) { await echec(tit, e); }
});
exports.agendaMembre = onDocumentWritten(Object.assign({ document: "espaces/{e}/membres/{uid}" }, OPTS), async (ev) => {
  const s = await db.doc("agendaJetons/" + ev.params.uid).get();
  if (!s.exists || s.data().revoque || s.data().espace !== ev.params.e) return;
  try { await syncComplet(ev.params.uid, s.data()); } catch (e) { await echec(ev.params.uid, e); }
});
exports.agendaNuit = onSchedule(Object.assign({ schedule: "30 3 * * *", timeZone: L.TZ }, OPTS), async () => {
  const l = (await db.collection("agendaJetons").get()).docs.filter((d) => !d.data().revoque);
  for (const d of l) { try { await syncComplet(d.id, d.data()); } catch (e) { await echec(d.id, e); } }
});
