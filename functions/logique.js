// Onco360 – Google Agenda de chaque membre : calculs purs (sans Firebase), testables hors ligne.
// Les événements viennent de resume.ag de chaque dossier (préparés par public/js/moteur/agenda.js) :
// { k: "PID|r|…" | "PID|c|…" | "PID|s|…" | "PID|rt|…", t: titre, x: description, d: "AAAA-MM-JJ", h: "HH:MM", f: fin (journées) }
// Tâches (T6, 08/10/2026) : k = "tache-ID|t", groupe « tache-ID » (une tâche = un groupe), seulement dans l'agenda du
// responsable ; options en plus : tache (vrai), urg (urgente ou en retard), dur (minutes), sans rappel, n'occupe pas le créneau.
// Couleurs (08/10/2026) : chaque événement a une catégorie (consultation d'annonce, chimio, absence, tâche…) ; sa couleur
// Google (1 à 11, "" = couleur de l'agenda) vient de espaces/{e}/parametres/couleursAgenda (Configuration › Google Agenda),
// sinon de COULEURS0. Mêmes valeurs par défaut dans public/js/app/configuration.js.
const crypto = require("crypto");

const TZ = "Africa/Casablanca";
const HORIZON = 450; // jours
const DUREE = 30; // minutes d'un rendez-vous à heure fixe

const jourCasa = (now) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(now || new Date());
const addJ = (d, n) => { const x = new Date(d + "T12:00:00Z"); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };

// Le membre voit-il ce dossier ? (mêmes règles que firestore.rules : actif + établissement dans son périmètre)
const voitPatient = (m, etab) => !!m && m.actif !== false && (m.tousEtablissements === true || (m.etablissements || []).indexOf(etab) >= 0);
// Ses droits (mêmes règles qu'à l'écran) : pas de chimio sans le droit « traitements » ; radiothérapie avec « voir » ou
// « modifier », ou « chimio » = seulement si le patient est sous chimio en même temps ; consultations et hospitalisations
// sauf si « consultations » est refusé (infirmière)
const radiochimio = (r) => !!(r && r.t && r.t.st === "cours") && ((r && r.rtS) || []).some((s) => s.st !== "fin");
function permis(m, ev, r) {
  const dr = (m && m.droits) || {}, k = String(ev.k || "");
  if (/^[^|]+\|[cs]\|/.test(k) && ["voir", "modifier"].indexOf(dr.traitements) < 0) return false;
  if (/^[^|]+\|rt\|/.test(k) && !(["voir", "modifier"].indexOf(dr.radiotherapie) >= 0 || (dr.radiotherapie === "chimio" && radiochimio(r)))) return false;
  if (/^[^|]+\|r\|/.test(k) && dr.consultations === false) return false;
  return true;
}
// Seulement ce qui est à venir (ou en cours) dans l'horizon de l'agenda
const dansFenetre = (e, auj) => e && e.k && e.d && (e.f && e.f > e.d ? e.f : e.d) >= auj && e.d <= addJ(auj, HORIZON - 1);

function evtsPatient(docData, membre, auj) {
  if (!docData || !voitPatient(membre, docData.etablissementId)) return [];
  let r = {};
  try { r = JSON.parse(docData.resume || "{}"); } catch (e) { return []; }
  return (r.ag || []).filter((e) => dansFenetre(e, auj) && permis(membre, e, r));
}
// Absences du cabinet (Configuration › Fermetures) : dans l'agenda du médecin titulaire seulement
function evtsAbsences(cal, auj) {
  return ((cal && cal.abs) || []).filter((a) => a && a.du).map((a) => ({
    k: "abs|" + a.du + "|" + (a.au || a.du), t: "Absence" + (a.m || a.t ? " : " + (a.m || a.t) : ""), x: a.t && a.m ? a.t : "", d: a.du, f: a.au && a.au > a.du ? a.au : "",
  })).filter((e) => dansFenetre(e, auj));
}

const groupe = (k) => String(k).split("|")[0]; // identifiant du patient, ou « abs »
const idEv = (k) => crypto.createHash("sha1").update("onco360|" + k).digest("hex"); // 40 caractères 0-9 a-f : identifiant Google valide
// (couleur et durée des tâches comprises ; sans couleur, la même qu'avant le 08/10/2026)
const signature = (e) => crypto.createHash("sha1").update(JSON.stringify([e.t, e.x || "", e.d, e.h || "", e.f || ""].concat(e.tache ? [e.coul, e.dur] : e.coul ? [e.coul] : []))).digest("hex").slice(0, 16);
function finHeure(d, h, dur) {
  const p = String(h).split(":"), m = +p[0] * 60 + (+p[1] || 0) + (dur || DUREE), j = Math.floor(m / 1440), r = m % 1440;
  return addJ(d, j) + "T" + String(Math.floor(r / 60)).padStart(2, "0") + ":" + String(r % 60).padStart(2, "0") + ":00";
}
const COULEURS0 = { annonce: "4", suivi: "7", rtc: "1", hospit: "9", autre: "7", chimio: "10", rt: "3", dosi: "6", abs: "5", tache: "8", tacheUrg: "11" };
function categorie(e) {
  if (e.tache) return e.urg ? "tacheUrg" : "tache";
  const p = String(e.k || "").split("|"), t = String(e.t || "");
  if (p[0] === "abs") return "abs";
  if (p[1] === "c" || p[1] === "s") return "chimio";
  if (p[1] === "rt") return p[p.length - 1] === "dosi" ? "dosi" : "rt";
  if (p[1] !== "r") return "";
  if (/ – Hospitalisation/.test(t)) return "hospit";
  if (/Consultation en cours de radioth/i.test(t)) return "rtc";
  if (/Consultation (d'|de )?annonce/i.test(t)) return "annonce";
  if (/Consultation (de )?(suivi|contrôle)/i.test(t)) return "suivi";
  return "autre"; // activités ajoutées dans les Paramètres (2nd avis…)
}
// Couleur de chaque événement selon sa catégorie (réglages du cabinet, sinon par défaut)
function colorer(evts, reglages) {
  (evts || []).forEach((e) => { const c = categorie(e), r = reglages || {}; e.coul = c ? String(c in r ? r[c] : COULEURS0[c] || "") : ""; });
  return evts;
}
// Tâches du responsable : échéance fixée, non terminées. Sans heure : journée entière ; avec heure : 15 min ; en retard :
// reportée chaque nuit sur aujourd'hui (journée entière, « EN RETARD ») ; aucun rappel Google (décisions du 08/10/2026)
const LIEN_TACHES = "https://chimio-hgc.web.app/v2.html#taches";
function evtsTaches(taches, uid, auj, noms) {
  return (taches || []).filter((t) => t && t.pour === uid && t.statut !== "fait" && /^\d{4}-\d{2}-\d{2}$/.test(t.ech || "")).map((t) => {
    const enRetard = t.ech < auj, pat = t.patientId ? (noms && noms[t.patientId]) || t.patientNom || "" : "";
    return {
      k: "tache-" + t.id + "|t", tache: true, d: enRetard ? auj : t.ech, h: enRetard ? "" : t.h || "", dur: 15, urg: !!(enRetard || t.urgent),
      t: [enRetard ? "EN RETARD" : "", t.urgent ? "URGENT" : "", "Tâche"].filter(Boolean).join(" – ") + " – " + t.titre + (pat ? " (" + pat + ")" : ""),
      x: [t.desc || "", "Demandée par " + (t.de === uid ? "vous-même" : t.deNom || "?") + (enRetard ? " · échéance du " + t.ech.split("-").reverse().join("/") : ""), "Ouvrir les tâches : " + LIEN_TACHES].filter(Boolean).join("\n"),
    };
  }).filter((e) => dansFenetre(e, auj));
}
// Corps d'un événement Google Agenda
function corps(e) {
  const b = {
    id: idEv(e.k), summary: e.t, description: [e.x || "", "— Onco360 (mise à jour automatique : modifier dans Onco360)"].filter(Boolean).join("\n\n"), status: "confirmed",
    extendedProperties: { private: { onco360: "1", g: groupe(e.k), k: String(e.k).slice(0, 900), sig: signature(e) } },
  };
  if (e.h) { b.start = { dateTime: e.d + "T" + e.h + ":00", timeZone: TZ }; b.end = { dateTime: finHeure(e.d, e.h, e.dur), timeZone: TZ }; }
  else { b.start = { date: e.d }; b.end = { date: addJ(e.f && e.f > e.d ? e.f : e.d, 1) }; }
  if ("coul" in e) b.colorId = e.coul || null; // null : retour à la couleur de l'agenda
  if (e.tache) Object.assign(b, { transparency: "transparent", reminders: { useDefault: false, overrides: [] } });
  return b;
}
// Met l'agenda en accord avec la liste voulue : crée, modifie, supprime (seulement les événements Onco360 listés)
// Dernier jour d'un événement de l'agenda (journées : fin exclusive ; heure fixe : son jour de début)
const dernierJour = (x) => (x.start && x.start.date ? addJ(x.end.date, -1) : String((x.start && x.start.dateTime) || "").slice(0, 10));
async function appliquer(api, calId, voulus, existants, auj) {
  const parId = new Map(existants.map((x) => [x.id, x])), vus = new Set();
  let crees = 0, modifies = 0, supprimes = 0;
  for (const e of voulus) {
    const b = corps(e); if (vus.has(b.id)) continue; vus.add(b.id);
    const x = parId.get(b.id); parId.delete(b.id);
    const sig = x && x.extendedProperties && x.extendedProperties.private && x.extendedProperties.private.sig;
    if (x && sig === b.extendedProperties.private.sig && x.status !== "cancelled") continue;
    if (x) { await api.modifier(calId, b.id, b); modifies++; } else { await api.creer(calId, b); crees++; }
  }
  for (const x of parId.values()) { if (auj && dernierJour(x) < auj) continue; await api.supprimer(calId, x.id); supprimes++; } // le passé reste (historique)
  return { crees, modifies, supprimes };
}

// Accès à l'API Google Agenda (REST) avec un jeton d'accès ; nouvel essai sur 429 / 5xx
function creerApi(jeton, fetchFn) {
  const F = fetchFn || fetch, BASE = "https://www.googleapis.com/calendar/v3";
  async function req(methode, chemin, corpsJ, essai) {
    const r = await F(BASE + chemin, { method: methode, headers: { Authorization: "Bearer " + jeton, "Content-Type": "application/json" }, body: corpsJ ? JSON.stringify(corpsJ) : undefined });
    if ((r.status === 429 || r.status >= 500) && (essai || 0) < 4) { await new Promise((ok) => setTimeout(ok, 400 * Math.pow(2, essai || 0))); return req(methode, chemin, corpsJ, (essai || 0) + 1); }
    const txt = r.status === 204 ? "" : await r.text();
    if (!r.ok) { const er = new Error("Google Agenda " + r.status + " : " + txt.slice(0, 300)); er.statut = r.status; throw er; }
    return txt ? JSON.parse(txt) : {};
  }
  const c = (id) => "/calendars/" + encodeURIComponent(id);
  return {
    req,
    async lister(calId, filtre, timeMin) {
      const out = []; let page = "";
      for (let n = 0; n < 100; n++) {
        const q = new URLSearchParams({ privateExtendedProperty: filtre, timeMin, maxResults: "2500", showDeleted: "false" }); if (page) q.set("pageToken", page);
        const j = await req("GET", c(calId) + "/events?" + q.toString());
        (j.items || []).forEach((x) => out.push(x)); if (!j.nextPageToken) break; page = j.nextPageToken;
      }
      return out;
    },
    // Un identifiant déjà utilisé (événement supprimé puis revenu) : on le remet en place
    async creer(calId, b) { const n = Object.assign({}, b); if (n.colorId == null) delete n.colorId; try { return await req("POST", c(calId) + "/events", n); } catch (e) { if (e.statut === 409) return req("PATCH", c(calId) + "/events/" + b.id, b); throw e; } },
    modifier: (calId, id, b) => req("PATCH", c(calId) + "/events/" + id, b),
    async supprimer(calId, id) { try { await req("DELETE", c(calId) + "/events/" + id); } catch (e) { if (e.statut !== 404 && e.statut !== 410) throw e; } },
    async agendaExiste(calId) { try { await req("GET", c(calId)); return true; } catch (e) { if (e.statut === 404 || e.statut === 403) return false; throw e; } },
    creerAgenda: () => req("POST", "/calendars", { summary: "Onco360", description: "Rendez-vous, cures et radiothérapie d'Onco360. Mise à jour automatique dans un seul sens : modifiez dans Onco360, pas ici.", timeZone: TZ }),
    supprimerAgenda: (calId) => req("DELETE", c(calId)),
  };
}
// Début de la fenêtre pour lister l'agenda (minuit UTC du jour : les jours passés ne sont jamais touchés)
const timeMin = (auj) => auj + "T00:00:00Z";

// ───── Prix d'une consultation fixé par la secrétaire (salle d'attente, 08/10/2026) : fonction prixConsultation ─────
// La secrétaire (droits « encaissements » et « rendezvous ») n'a pas le droit « finances » : elle ne lit ni n'écrit les montants.
// Le serveur écrit pour elle UN prix : celui d'une consultation validée (rendez-vous « Venu ») ou de la consultation d'un jour de
// chimio, dans les montants (patientsFinances, bilan) et dans les prix à encaisser (encaissements), comme le fait le médecin
// (chimio.js majMontants / construireEncaissements). Rien d'autre n'est touché (honoraires, radiothérapie).
const DROITS0 = { medecin: { encaissements: true, rendezvous: true }, assistante: { encaissements: true, rendezvous: true }, infirmiere: {} };
const droitM = (m, k) => { const d = (m && m.droits) || {}; return k in d ? d[k] === true : !!(DROITS0[m && m.role] || {})[k]; };
const peutPrix = (m) => !!m && m.actif !== false && droitM(m, "encaissements") && droitM(m, "rendezvous");
const num = (v) => { if (v == null || v === "") return null; const n = parseFloat(String(v).replace(",", ".")); return isNaN(n) ? null : n; };
function consJours(c) {
  if (!c) return {};
  if (c.consJ) return c.consJ;
  if (c.cons && c.cons.enc) { const j = c.cons.jour && c.cons.jour !== "autre" ? String(c.cons.jour) : "1"; return { [j]: c.cons.m == null ? null : num(c.cons.m) }; }
  return {};
}
function majCons(cc) {
  const v = Object.entries(cc.consJ || {}), tot = v.reduce((s2, [, m]) => s2 + (num(m) || 0), 0), j0 = (v.find(([, m]) => (num(m) || 0) > 0) || v[0] || ["1"])[0];
  cc.cons = tot > 0 ? { enc: true, m: tot, jour: j0 } : { enc: false, m: 0 };
}
// dossier = document patient ; M = montants (objet) ; E = prix à encaisser (objet) ; q = { rdvId } ou { lid, n, j, d, lib }, montant
// (null pour une consultation de chimio : retirer la validation). Modifie M et E ; renvoie un libellé pour l'historique.
function appliquerPrix(dossier, M, E, q) {
  const m = q.montant == null ? null : num(q.montant);
  if (q.montant != null && (m == null || m < 0 || m > 1000000)) throw new Error("Montant invalide.");
  M.rdv = M.rdv || {}; M.cures = M.cures || {}; M.rt = M.rt || {}; E.rdv = E.rdv || {}; E.cons = E.cons || {};
  if (q.rdvId) {
    const r = JSON.parse(dossier.rdvsJson || "[]").find((v) => v.id === q.rdvId);
    if (!r) throw new Error("Rendez-vous introuvable.");
    if (r.st !== "fait") throw new Error("Le rendez-vous n'est pas validé « Venu ».");
    if (m == null) throw new Error("Montant invalide.");
    const o = M.rdv[r.id] = M.rdv[r.id] || {}, hs = !r.act && r.type === "Hospitalisation";
    if (o.v1) throw new Error("Prix repris de l'ancienne application : seul le médecin peut le modifier.");
    if (hs) { o.tj = m; delete o.brut; E.rdv[r.id] = { tj: m }; } else { o.brut = m; E.rdv[r.id] = { m }; }
    return "Prix de la consultation du " + r.d + " : " + m + " DH";
  }
  const n = parseInt(q.n, 10), j = parseInt(q.j, 10), L = JSON.parse(dossier.lignesJson || "[]").find((z) => z.id === q.lid);
  if (!L || !(n >= 1) || !(j >= 1) || !L.cures || !L.cures[n - 1]) throw new Error("Cure introuvable.");
  const a = M.cures[q.lid] = M.cures[q.lid] || {}, cc = a[n] = a[n] || {}, J = Object.assign({}, consJours(cc)), k = q.lid + "|" + n + "|" + j;
  if (m == null) { delete J[j]; delete E.cons[k]; } else { J[j] = m; E.cons[k] = { m, d: String(q.d || "").slice(0, 10), lib: String(q.lib || "").slice(0, 120), n, j: "J" + j }; }
  cc.consJ = J; majCons(cc);
  return "Chimiothérapie C" + n + " J" + j + (m == null ? " : statut annulé" : " : venu (" + m + " DH)");
}

module.exports = { TZ, jourCasa, addJ, voitPatient, permis, evtsPatient, evtsAbsences, evtsTaches, COULEURS0, categorie, colorer, idEv, corps, appliquer, creerApi, timeMin, groupe, peutPrix, appliquerPrix };
