// Onco360 – fonctions serveur (Firebase, région europe-west1, comme la base).
// Google Agenda de chaque membre : « Lier mon Google Agenda » (Profil) crée dans SON compte Google un agenda « Onco360 »,
// tenu à jour dans un seul sens (Onco360 → Google) avec les patients qu'il a le droit de voir.
//   • agendaLier / agendaMaj / agendaDelier : appelées depuis Onco360 (personne connectée) ;
//   • agendaPatient : à chaque enregistrement d'un dossier ; agendaAbsences : absences du cabinet (titulaire) ;
//   • agendaMembre : droits ou établissements d'un membre modifiés ; agendaNuit : remise à plat chaque nuit ;
//   • agendaTache : une tâche écrite (échéance dans l'agenda de son responsable, T6 du 08/10/2026) ;
//   • agendaCouleurs : couleurs par type changées (Paramètres › Google Agenda) : tous les agendas du cabinet repeints ;
//   • agendaFiltre : une personne a changé ce qui va dans SON agenda (utilisateurs/{uid}.agendaFiltre) : son agenda refait.
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

// Ce que la personne a choisi de voir dans son agenda (absent : tout)
async function filtreDe(uid) { try { const s = await db.doc("utilisateurs/" + uid).get(); return (s.exists && s.data().agendaFiltre) || {}; } catch (e) { return {}; } }
// Couleurs choisies par le cabinet (absent : couleurs par défaut)
async function couleurs(e) { try { const s = await db.doc("espaces/" + e + "/parametres/couleursAgenda").get(); return s.exists ? JSON.parse(s.data().data || "{}") : {}; } catch (er) { return {}; } }
// ───── Remise à plat complète de l'agenda d'une personne ─────
async function syncComplet(uid, J) {
  const m = await membre(J.espace, uid);
  if (!m || m.actif === false) throw new Error("Votre accès à Onco360 est désactivé : l'agenda n'est plus mis à jour.");
  const auj = L.jourCasa(), api = await apiPour(J);
  const pats = await db.collection("espaces/" + J.espace + "/patients").select("resume", "etablissementId").get();
  let voulus = [];
  pats.forEach((d) => { voulus = voulus.concat(L.evtsPatient(d.data(), m, auj)); });
  // Tâches dont la personne est responsable (nom actuel du patient lu dans son dossier)
  const ts = await db.collection("espaces/" + J.espace + "/taches").where("pour", "==", uid).get(), noms = {};
  pats.forEach((d) => { try { noms[d.id] = JSON.parse(d.data().resume || "{}").nm || ""; } catch (e) { /* résumé illisible */ } });
  voulus = voulus.concat(L.evtsTaches(ts.docs.map((d) => Object.assign({ id: d.id }, d.data())), uid, auj, noms));
  if ((await titulaire(J.espace)) === uid) {
    const c = await db.doc("espaces/" + J.espace + "/parametres/calendrier").get();
    try { voulus = voulus.concat(L.evtsAbsences(c.exists ? JSON.parse(c.data().data || "{}") : {}, auj)); } catch (e) { /* calendrier illisible */ }
  }
  voulus = L.filtrer(voulus, await filtreDe(uid));
  L.colorer(voulus, await couleurs(J.espace));
  const existants = await api.lister(J.calendrier, "onco360=1", L.timeMin(auj));
  const r = await L.appliquer(api, J.calendrier, voulus, existants, auj);
  await etat(uid, { email: J.email || "", calendrier: "Onco360", le: new Date().toISOString(), nb: voulus.length, erreur: "" });
  return Object.assign({ nb: voulus.length }, r);
}
// Un seul groupe (un patient, ou les absences) pour une personne
async function syncGroupe(uid, J, g, voulus) {
  const api = await apiPour(J), auj = L.jourCasa();
  const existants = await api.lister(J.calendrier, "g=" + g, L.timeMin(auj));
  await L.appliquer(api, J.calendrier, L.colorer(L.filtrer(voulus.filter((e) => L.groupe(e.k) === g), await filtreDe(uid)), await couleurs(J.espace)), existants, auj);
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
// Tâche écrite : agenda de son responsable, et de l'ancien si elle a été réattribuée (les commentaires seuls ne changent rien)
const CHAMPS_AGENDA = ["titre", "desc", "ech", "h", "urgent", "statut", "pour", "patientId", "patientNom", "deNom"];
exports.agendaTache = onDocumentWritten(Object.assign({ document: "espaces/{e}/taches/{t}" }, OPTS), async (ev) => {
  const avant = ev.data.before.exists ? ev.data.before.data() : null, apres = ev.data.after.exists ? ev.data.after.data() : null;
  if (avant && apres && CHAMPS_AGENDA.every((k) => JSON.stringify(avant[k]) === JSON.stringify(apres[k]))) return;
  const e = ev.params.e, t = apres ? Object.assign({ id: ev.params.t }, apres) : null, noms = {};
  if (t && t.patientId) { try { const p = await db.doc("espaces/" + e + "/patients/" + t.patientId).get(); if (p.exists) noms[t.patientId] = JSON.parse(p.data().resume || "{}").nm || ""; } catch (er) { /* nom gardé dans la tâche */ } }
  for (const uid of new Set([avant && avant.pour, apres && apres.pour].filter(Boolean))) {
    const s = await db.doc("agendaJetons/" + uid).get(); if (!s.exists || s.data().revoque || s.data().espace !== e) continue;
    const m = await membre(e, uid); if (!m || m.actif === false) continue;
    try { await syncGroupe(uid, s.data(), "tache-" + ev.params.t, L.evtsTaches(t ? [t] : [], uid, L.jourCasa(), noms)); } catch (er) { await echec(uid, er); }
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
  const a = ev.data.before.exists ? ev.data.before.data().agendaFiltre : null, b = ev.data.after.exists ? ev.data.after.data().agendaFiltre : null;
  if (JSON.stringify(a || {}) === JSON.stringify(b || {})) return; // autres écritures du profil (tâches lues, état de l'agenda…)
  const s = await db.doc("agendaJetons/" + ev.params.uid).get(); if (!s.exists || s.data().revoque) return;
  try { await syncComplet(ev.params.uid, s.data()); } catch (e) { await echec(ev.params.uid, e); }
});
// ───── Tâches automatiques ─────
const SYS = "onco360", SYS_NOM = "Onco360 (automatique)";
async function contexteAuto(e) {
  const [sr, sc, se, sm] = await Promise.all([db.doc("espaces/" + e + "/parametres/tachesAuto").get(), db.doc("espaces/" + e + "/parametres/calendrier").get(), db.doc("espaces/" + e).get(), db.collection("espaces/" + e + "/membres").get()]);
  let cfg = {}, cal = {}; try { cfg = sr.exists ? JSON.parse(sr.data().data || "{}") : {}; } catch (er) { /* illisible */ } try { cal = sc.exists ? JSON.parse(sc.data().data || "{}") : {}; } catch (er) { /* illisible */ }
  const membres = {}; sm.forEach((d) => { membres[d.id] = d.data(); });
  return { regles: L.reglesAuto(cfg), feries: cal.feries || [], titulaire: se.exists ? se.data().titulaire : null, membres };
}
async function tachesAuto(e, pid, docData, ctx, opts) {
  if (!docData) return;
  const auj = L.jourCasa(), { voulues, resolues } = L.tachesAutoPatient(pid, docData, ctx.regles, auj, ctx.feries, opts);
  let r0 = {}; try { r0 = JSON.parse(docData.resume || "{}"); } catch (er) { /* résumé illisible */ }
  for (const v of voulues) {
    const reg = db.doc("espaces/" + e + "/tachesAuto/" + v.id);
    if ((await reg.get()).exists) continue; // déjà créée une fois (même si elle a été supprimée depuis)
    let pour = v.pour === "titulaire" ? ctx.titulaire : v.pour; const m = ctx.membres[pour];
    if (!m || m.actif === false) { pour = ctx.titulaire; } const mp = ctx.membres[pour]; if (!pour || !mp) continue;
    const le = new Date().toISOString();
    await db.doc("espaces/" + e + "/taches/" + v.id).set({
      titre: v.titre, desc: "Tâche créée automatiquement par Onco360 (Paramètres › Tâches › Tâches automatiques).", type: v.type, urgent: false, ech: v.ech, h: "",
      patientId: pid, patientNom: r0.nm || "", etablissementId: docData.etablissementId || "", pour, pourNom: String(mp.nom || mp.email || ""), de: SYS, deNom: SYS_NOM, qui: [SYS, pour],
      statut: "afaire", fil: [{ le, par: SYS, parNom: SYS_NOM, txt: "Créée automatiquement" }], o: Date.now(), cree: FieldValue.serverTimestamp(), maj: FieldValue.serverTimestamp(), majPar: SYS,
      auto: { regle: v.regle, ev: v.ev, cle: v.cle, rt: v.rt || "" },
    });
    await reg.set({ le, patientId: pid, regle: v.regle });
  }
  for (const id of resolues) {
    const ref = db.doc("espaces/" + e + "/taches/" + id), s = await ref.get(); if (!s.exists || s.data().statut === "fait") continue;
    const le = new Date().toISOString(), txt = s.data().auto && s.data().auto.ev === "dosi" ? "Terminée automatiquement : dosimétrie validée dans le dossier" : "Terminée automatiquement : radiothérapie clôturée dans le dossier";
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
