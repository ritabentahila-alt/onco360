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
    if ((await reg.get()).exists) continue; // déjà créée une fois (même si elle a été supprimée depuis)
    if ((await db.doc("espaces/" + e + "/taches/" + v.id).get()).exists) { await reg.set({ le: new Date().toISOString(), patientId: pid, regle: v.regle }); continue; } // tâche déjà là : jamais écrasée
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
// comptes/{uid} = { espace } : le cabinet qu'Onco360 ouvre pour cette personne (lu par elle seule, écrit ici seulement).
// Tenu à jour à chaque fiche de membre écrite (ajout d'un membre par le titulaire de n'importe quel cabinet) ; un compte
// appartient à un seul cabinet : le premier gardé (sauf le cabinet modèle). Les membres du cabinet modèle sans fiche « comptes » l'ouvrent par défaut.
// Administration (compte séparé, collection administrateurs) : crée les cabinets et en voit la liste, sans aucune donnée médicale ;
// les règles ne lui ouvrent aucun cabinet (tout passe par ces fonctions).
const C = require("./cabinets");
const { getAuth } = require("firebase-admin/auth");
const estAdministrateur = async (uid) => !!uid && (await db.doc("administrateurs/" + uid).get()).exists;
// Formules modifiées par l'administration : plateforme/formules (aucune règle : serveur seulement), sinon formules de départ
async function formules() { try { const s = await db.doc("plateforme/formules").get(); return (s.exists && C.formulesValides(JSON.parse(s.data().data || "{}"))) || C.FORMULES; } catch (e) { return C.FORMULES; } }
exports.compteMembre = onDocumentWritten({ document: "espaces/{e}/membres/{uid}", timeoutSeconds: 60, memory: "256MiB" }, async (ev) => {
  const { e, uid } = ev.params, ref = db.doc("comptes/" + uid), c = await ref.get(), apres = ev.data.after.exists ? ev.data.after.data() : null;
  if (apres) {
    // Déjà rattaché ailleurs : on ne change rien, sauf pour le cabinet modèle (ses membres l'ouvrent toujours, même s'ils
    // figurent aussi dans un cabinet d'essai)
    if (c.exists && c.data().espace && c.data().espace !== e && e !== C.MODELE) { console.warn("compte déjà rattaché à un autre cabinet", uid, c.data().espace, e); return; }
    if (!c.exists || c.data().espace !== e) await ref.set({ espace: e, le: new Date().toISOString() });
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
  } else if (c.exists && c.data().espace === e) await ref.delete();
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
// Ce que reçoit un cabinet neuf : la référence (prise une première fois si elle n'existe pas encore)
async function source(par) {
  if (!(await db.doc(REF).get()).exists) await prendreReference(par);
  const s = await db.collection(REF + "/docs").get(), out = { protocoles: [], docs: [] };
  s.forEach((d) => { const [col, id] = d.id.split("__"); if (col === "protocoles") out.protocoles.push({ id, data: d.data() }); else out.docs.push({ chemin: col + "/" + id, data: d.data() }); });
  return out;
}
exports.referenceMaj = onCall({ timeoutSeconds: 120, memory: "256MiB" }, async (req) => {
  const par = req.auth && req.auth.uid;
  if (!(await estAdministrateur(par))) throw new HttpsError("permission-denied", "Réservé à l'administration d'Onco360.");
  return { reference: await prendreReference(par) };
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
  const src = await source(par), b = db.batch();
  b.set(db.doc("espaces/" + e), Object.assign({ nom: d.cabinet, titulaire: u.uid, cree: jour, creePar: par, actif: true, abonnement: C.abonnement({ formule: opts.formule || "complet" }, await formules()) }, opts.espace || {}));
  b.set(db.doc(E + "membres/" + u.uid), C.membreTitulaire(d, jour, par));
  src.protocoles.forEach((p) => b.set(db.doc(E + "protocoles/" + p.id), p.data));
  src.docs.forEach((x) => b.set(db.doc(E + x.chemin), x.data));
  b.set(db.doc(E + "parametres/migrations"), C.migrationsFaites(jour));
  b.set(db.doc("comptes/" + u.uid), { espace: e, le: new Date().toISOString() });
  b.set(db.doc("utilisateurs/" + u.uid), Object.assign({ email: d.email, prenom: d.prenom, nom: d.nom, telephone: d.telephone, titre: "Dr", profession: "medecin" }, opts.profil || {}), { merge: true });
  await b.commit();
  return { espace: e, uid: u.uid, existant, protocoles: src.protocoles.length, jour };
}
exports.creerCabinet = onCall({ timeoutSeconds: 120, memory: "256MiB" }, async (req) => {
  const par = req.auth && req.auth.uid;
  if (!(await estAdministrateur(par))) throw new HttpsError("permission-denied", "Réservé à l'administration d'Onco360.");
  let d; try { d = C.verifier(req.data || {}); } catch (e) { throw new HttpsError("invalid-argument", e.message); }
  const o = await creerEspace(d, par, { formule: (req.data || {}).formule });
  console.log("cabinet créé", o.espace, d.email, "par", par);
  return { espace: o.espace, existant: o.existant, protocoles: o.protocoles };
});
// ───── Cabinet de démonstration (étape 9 S3, 09/10/2026) ─────
// Un seul, « cab-demonstration » (espaces/{e}.demo = true), formule Complète, clinique fictive DEMO avec ses tarifs, 8 patients
// fictifs (demo.js) ; « Réinitialiser » refait patients, consultations, tâches, salle et montants au jour près. Le compte de
// démonstration est un compte comme les autres (son e-mail, son mot de passe), à utiliser pour les démonstrations et les guides.
const Dm = require("./demo");
const DEMO = "cab-demonstration";
async function remplirDemo(e, uid) {
  const E = "espaces/" + e + "/";
  for (const c of ["patients", "patientsFinances", "encaissements", "consultations", "taches", "salle", "rcp", "fichiers", "documentsRT", "presence"]) await db.recursiveDelete(db.collection(E + c)).catch(() => {});
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
  console.log("cabinet de démonstration créé", o.espace, d.email, "par", par);
  return { espace: o.espace, existant: o.existant, protocoles: o.protocoles, patients: r.patients };
});
exports.demoReinitialiser = onCall({ timeoutSeconds: 300, memory: "512MiB" }, async (req) => {
  const par = req.auth && req.auth.uid;
  if (!(await estAdministrateur(par))) throw new HttpsError("permission-denied", "Réservé à l'administration d'Onco360.");
  const s = await db.doc("espaces/" + DEMO).get();
  if (!s.exists || s.data().demo !== true) throw new HttpsError("not-found", "Pas de cabinet de démonstration.");
  const r = await remplirDemo(DEMO, s.data().titulaire);
  console.log("démonstration réinitialisée par", par);
  return r;
});
// Liste des cabinets pour la page Administration : nom, titulaire, date, nombre de membres et de dossiers (aucune donnée médicale)
exports.listeCabinets = onCall({ timeoutSeconds: 60, memory: "256MiB" }, async (req) => {
  if (!(await estAdministrateur(req.auth && req.auth.uid))) throw new HttpsError("permission-denied", "Réservé à l'administration d'Onco360.");
  const t0 = Date.now(), [snap, FS] = await Promise.all([db.collection("espaces").get(), formules()]);
  console.log("listeCabinets : " + snap.size + " cabinets lus en " + (Date.now() - t0) + " ms");
  // Chaque comptage à part : un cabinet illisible n'empêche pas d'afficher les autres
  const nb = async (q) => { try { return (await q.count().get()).data().count; } catch (e) { console.warn("comptage", e.message); return null; } };
  const out = await Promise.all(snap.docs.map(async (s) => {
    const r = s.ref, x = s.data() || {};
    const [sm, patients, netab] = await Promise.all([r.collection("membres").select("role", "actif", "nom", "email", "telephone").get().catch(() => null), nb(r.collection("patients")), nb(r.collection("etablissements"))]);
    const roles = {}; let membres = null, t = {};
    if (sm) { membres = sm.size; sm.forEach((d) => { const m = d.data(); if (m.actif !== false) roles[m.role] = (roles[m.role] || 0) + 1; if (d.id === x.titulaire) t = m; }); }
    // Date de création : texte AAAA-MM-JJ (le cabinet de référence l'a en date Firebase) ; sinon date de la fiche
    const jour = (v) => (!v ? "" : typeof v === "string" ? v.slice(0, 10) : v.toDate ? v.toDate().toISOString().slice(0, 10) : "");
    return { id: r.id, nom: x.nom || (r.id === C.MODELE ? "Cabinet du Dr Bentahila" : r.id), cree: jour(x.cree) || (s.createTime ? s.createTime.toDate().toISOString().slice(0, 10) : ""), actif: x.actif !== false, modele: r.id === C.MODELE, suspenduLe: x.suspenduLe || "",
      titulaire: { nom: t.nom || "", email: t.email || "", telephone: t.telephone || "" }, membres, patients, roles, etablissements: netab, abonnement: x.abonnement || null, ville: x.ville || "", adresse: x.adresse || "", telephone: x.telephone || "", demo: x.demo === true };
  }));
  console.log("listeCabinets : terminé en " + (Date.now() - t0) + " ms");
  const ref = await db.doc(REF).get().catch(() => null);
  return { cabinets: out, formules: FS, reference: ref && ref.exists ? ref.data() : null };
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
    if (c.exists && c.data().espace === espace) await c.ref.delete();
    await db.doc("agendaJetons/" + uid).delete().catch(() => {});
    const garder = (await estAdministrateur(uid)) || (await db.doc("espaces/" + C.MODELE + "/membres/" + uid).get()).exists;
    if (!garder) { await auth.deleteUser(uid).catch((e) => console.warn("compte", uid, e.message)); await db.doc("utilisateurs/" + uid).delete().catch(() => {}); comptes.push(uid); }
  }
  await db.recursiveDelete(ref);
  await db.recursiveDelete(db.doc("audit/" + espace)).catch((e) => console.warn("journal", e.message)); // son journal d'audit aussi
  await getStorage().bucket().deleteFiles({ prefix: "espaces/" + espace + "/" }).catch((e) => console.warn("fichiers", e.message));
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
  return { lien: await getAuth().generatePasswordResetLink(email, { url: "https://chimio-hgc.web.app" }) };
});
// Formule et modules d'un cabinet (page Administration) : espaces/{e}.abonnement, nettoyé par cabinets.js. Un module retiré est
// caché dans Onco360, ses données sont gardées. Possible aussi pour le cabinet de Dr Bentahila.
exports.abonnementCabinet = onCall({ timeoutSeconds: 30, memory: "256MiB" }, async (req) => {
  const par = req.auth && req.auth.uid;
  if (!(await estAdministrateur(par))) throw new HttpsError("permission-denied", "Réservé à l'administration d'Onco360.");
  const { espace } = req.data || {};
  const ref = db.doc("espaces/" + String(espace || "x")); if (!espace || !(await ref.get()).exists) throw new HttpsError("not-found", "Cabinet introuvable.");
  const ab = Object.assign(C.abonnement(req.data || {}, await formules()), { le: new Date().toISOString(), par });
  await ref.update({ abonnement: ab });
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
  es.forEach((d) => { const ab = d.data().abonnement; if (ab && ab.formule) { utilisees.add(ab.formule); if (FS[ab.formule] && !ab.surMesure) maj.push(d); } });
  const manquantes = [...utilisees].filter((f) => !FS[f]);
  if (manquantes.length) throw new HttpsError("failed-precondition", "Formule encore utilisée par un cabinet : " + manquantes.join(", ") + ". Changez d'abord la formule de ce cabinet.");
  await db.doc("plateforme/formules").set({ data: JSON.stringify(FS), le: new Date().toISOString(), par });
  for (const d of maj) await d.ref.update({ abonnement: Object.assign(C.abonnement({ formule: d.data().abonnement.formule }, FS), { le: new Date().toISOString(), par }) });
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
