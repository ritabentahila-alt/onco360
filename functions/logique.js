// Onco360 – Google Agenda de chaque membre : calculs purs (sans Firebase), testables hors ligne.
// Les événements viennent de resume.ag de chaque dossier (préparés par public/js/moteur/agenda.js) :
// { k: "PID|r|…" | "PID|c|…" | "PID|s|…" | "PID|rt|…", t: titre, x: description, d: "AAAA-MM-JJ", h: "HH:MM", f: fin (journées) }
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
const signature = (e) => crypto.createHash("sha1").update(JSON.stringify([e.t, e.x || "", e.d, e.h || "", e.f || ""])).digest("hex").slice(0, 16);
function finHeure(d, h) {
  const p = String(h).split(":"), m = +p[0] * 60 + (+p[1] || 0) + DUREE, j = Math.floor(m / 1440), r = m % 1440;
  return addJ(d, j) + "T" + String(Math.floor(r / 60)).padStart(2, "0") + ":" + String(r % 60).padStart(2, "0") + ":00";
}
// Corps d'un événement Google Agenda
function corps(e) {
  const b = {
    id: idEv(e.k), summary: e.t, description: [e.x || "", "— Onco360 (mise à jour automatique : modifier dans Onco360)"].filter(Boolean).join("\n\n"), status: "confirmed",
    extendedProperties: { private: { onco360: "1", g: groupe(e.k), k: String(e.k).slice(0, 900), sig: signature(e) } },
  };
  if (e.h) { b.start = { dateTime: e.d + "T" + e.h + ":00", timeZone: TZ }; b.end = { dateTime: finHeure(e.d, e.h), timeZone: TZ }; }
  else { b.start = { date: e.d }; b.end = { date: addJ(e.f && e.f > e.d ? e.f : e.d, 1) }; }
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
    async creer(calId, b) { try { return await req("POST", c(calId) + "/events", b); } catch (e) { if (e.statut === 409) return req("PATCH", c(calId) + "/events/" + b.id, b); throw e; } },
    modifier: (calId, id, b) => req("PATCH", c(calId) + "/events/" + id, b),
    async supprimer(calId, id) { try { await req("DELETE", c(calId) + "/events/" + id); } catch (e) { if (e.statut !== 404 && e.statut !== 410) throw e; } },
    async agendaExiste(calId) { try { await req("GET", c(calId)); return true; } catch (e) { if (e.statut === 404 || e.statut === 403) return false; throw e; } },
    creerAgenda: () => req("POST", "/calendars", { summary: "Onco360", description: "Rendez-vous, cures et radiothérapie d'Onco360. Mise à jour automatique dans un seul sens : modifiez dans Onco360, pas ici.", timeZone: TZ }),
    supprimerAgenda: (calId) => req("DELETE", c(calId)),
  };
}
// Début de la fenêtre pour lister l'agenda (minuit UTC du jour : les jours passés ne sont jamais touchés)
const timeMin = (auj) => auj + "T00:00:00Z";

module.exports = { TZ, jourCasa, addJ, voitPatient, permis, evtsPatient, evtsAbsences, idEv, corps, appliquer, creerApi, timeMin, groupe };
