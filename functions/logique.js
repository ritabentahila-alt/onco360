// Onco360 – Google Agenda de chaque membre : calculs purs (sans Firebase), testables hors ligne.
// Les événements viennent de resume.ag de chaque dossier (préparés par public/js/moteur/agenda.js) :
// { k: "PID|r|…" | "PID|c|…" | "PID|s|…" | "PID|rt|…", t: titre, x: description, d: "AAAA-MM-JJ", h: "HH:MM", f: fin (journées) }
// Tâches (T6, 08/10/2026) : k = "tache-ID|t", groupe « tache-ID » (une tâche = un groupe), seulement dans l'agenda du
// responsable ; options en plus : tache (vrai), urg (urgente ou en retard), dur (minutes), sans rappel, n'occupe pas le créneau.
// Couleurs (08/10/2026) : chaque événement a une catégorie (consultation d'annonce, chimio, absence, tâche…) ; sa couleur
// Google (1 à 11, "" = couleur de l'agenda) vient de espaces/{e}/parametres/couleursAgenda (Configuration › Google Agenda),
// sinon de COULEURS0. Mêmes valeurs par défaut dans public/js/app/configuration.js.
const crypto = require("crypto");
const H = require("./heure");

// Fuseau envoyé à Google (Agenda, horaires des traitements de nuit) : Google tient ses données horaires à jour. Le jour du Maroc calculé
// ici ne dépend plus de Node (S1, 21/10/2026 : table des changements d'heure, functions/heure.js).
const TZ = "Africa/Casablanca";
const HORIZON = 450; // jours
const DUREE = 30; // minutes d'un rendez-vous à heure fixe

const jourCasa = (now) => H.jourMaroc(now ? now.getTime() : Date.now());
const addJ = (d, n) => { const x = new Date(d + "T12:00:00Z"); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };

// Le membre voit-il ce dossier ? (mêmes règles que firestore.rules : actif + établissement dans son périmètre)
const voitPatient = (m, etab) => !!m && m.actif !== false && (m.tousEtablissements === true || (m.etablissements || []).indexOf(etab) >= 0);
// Ses droits (mêmes règles qu'à l'écran) : pas de chimio sans le droit « traitements » ; radiothérapie avec « voir » ou
// « modifier », ou « chimio » = seulement si le patient est sous chimio en même temps ; consultations et hospitalisations
// sauf si « consultations » est refusé (infirmière)
const radiochimio = (r) => !!(r && r.t && r.t.st === "cours") && ((r && r.rtS) || []).some((s) => s.st !== "fin");
function permis(m, ev, r, qui) {
  const dr = (m && m.droits) || {}, k = String(ev.k || "");
  // Médecin du rendez-vous (AG4, 11/10/2026) : l'agenda d'un médecin ne reçoit que ses rendez-vous de consultation ; sans médecin
  // noté (`m`, anciens rendez-vous) = le médecin titulaire. Secrétaire, infirmière : tous les rendez-vous (selon leurs droits).
  // R-C3 (19/10/2026, audit 4) : de même pour les séances de chimio et les étapes de radiothérapie (`m` = médecin de la ligne ou de la RT, sinon
  // du patient ; sans médecin : le titulaire)
  if (/^[^|]+\|(r|c|s|rt)\|/.test(k) && m && m.role === "medecin" && qui && qui.uid && (ev.m || qui.titulaire) && (ev.m || qui.titulaire) !== qui.uid) return false;
  if (/^[^|]+\|[cs]\|/.test(k) && ["voir", "modifier"].indexOf(dr.traitements) < 0) return false;
  if (/^[^|]+\|rt\|/.test(k) && !(["voir", "modifier"].indexOf(dr.radiotherapie) >= 0 || (dr.radiotherapie === "chimio" && radiochimio(r)))) return false;
  if (/^[^|]+\|r\|/.test(k) && dr.consultations === false) return false;
  return true;
}
// Seulement ce qui est à venir (ou en cours) dans l'horizon de l'agenda
const DATE_OK = /^\d{4}-\d{2}-\d{2}$/;
const dansFenetre = (e, auj) => e && e.k && DATE_OK.test(e.d || "") && (e.f && DATE_OK.test(e.f) && e.f > e.d ? e.f : e.d) >= auj && e.d <= addJ(auj, HORIZON - 1);
// Heure « HH:MM » quel que soit l'écrit (« 9:30 », « 13h00 », « 08:30:00 ») ; illisible → "" (journée entière) (08/10/2026)
const heure = (h) => { const m = String(h || "").trim().match(/^(\d{1,2})\s*[:hH.]\s*(\d{2})/); return m && +m[1] < 24 && +m[2] < 60 ? m[1].padStart(2, "0") + ":" + m[2] : ""; };

function evtsPatient(docData, membre, auj, qui) { // qui = { uid, titulaire } (AG4)
  if (!docData || !voitPatient(membre, docData.etablissementId)) return [];
  let r = {};
  try { r = JSON.parse(docData.resume || "{}"); } catch (e) { return []; }
  return (r.ag || []).filter((e) => dansFenetre(e, auj) && permis(membre, e, r, qui) && !/\|dosi$/.test(String(e.k))); // dosimétrie : une tâche (08/10/2026)
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
const signature = (e) => crypto.createHash("sha1").update(JSON.stringify([e.t, e.x || "", e.d, e.h || "", e.f || ""].concat(e.tache ? [e.coul, e.dur] : e.coul ? [e.coul] : []).concat(!e.tache && e.dur ? ["dur", e.dur] : []))).digest("hex").slice(0, 16);
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
  // 3.13 (12/10/2026) : type noté dans l'événement (tk) : couleur juste même si le type a été renommé
  const tk = { annonce: "annonce", suivi: "suivi", controle: "suivi", hospit: "hospit", rtc: "rtc", rtf: "rtc", act: "autre" }[e.tk]; if (tk) return tk;
  if (/ – Hospitalisation/.test(t)) return "hospit";
  if (/Consultation (en cours|de fin) de radioth/i.test(t)) return "rtc";
  if (/Consultation (d'|de )?annonce/i.test(t)) return "annonce";
  if (/Consultation (de )?(suivi|contrôle)/i.test(t)) return "suivi";
  return "autre"; // activités ajoutées dans les Paramètres (2nd avis…)
}
// Ce que chacun met dans SON agenda (P3, 08/10/2026) : utilisateurs/{uid}.agendaFiltre = { exclus: [clés] } ; une clé absente
// (nouveau type de consultation ou de tâche) est incluse. Clés (mêmes que public/js/app/configuration.js) :
// rdv:annonce | rdv:suivi | rdv:controle | rdv:rtc | rdv:rtfin | rdv:hospit | rdv:act:<nom de l'activité en minuscules> |
// chimio:cure (J1) | chimio:seance (J8, J15…) | rt:scan | rt:deb | rt:fin | rt:dosi | abs | tache:<type de tâche>
function cleFiltre(e) {
  if (e.tache) return "tache:" + (e.tt || "");
  const p = String(e.k || "").split("|"), t = String(e.t || "");
  if (p[0] === "abs") return "abs";
  if (p[1] === "c") return "chimio:cure";
  if (p[1] === "s") return "chimio:seance";
  if (p[1] === "rt") return "rt:" + p[p.length - 1];
  if (p[1] !== "r") return "";
  const i = t.indexOf(" – "), lib = (i >= 0 ? t.slice(i + 3) : t).replace(/ \([A-Z0-9]{2,8}\)$/, "").trim(); // sans l'établissement « (HGC) »
  const tk = { annonce: "rdv:annonce", suivi: "rdv:suivi", controle: "rdv:controle", hospit: "rdv:hospit", rtc: "rdv:rtc", rtf: "rdv:rtfin" }[e.tk]; if (tk) return tk; // 3.13 : type noté (renommage sans effet)
  if (/^Hospitalisation/.test(lib)) return "rdv:hospit";
  if (/^Consultation en cours de radioth/i.test(lib)) return "rdv:rtc";
  if (/^Consultation de fin de radioth/i.test(lib)) return "rdv:rtfin"; // consultation de fin de radiothérapie (12/10/2026)
  if (/^Consultation (d'|de )?annonce$/i.test(lib)) return "rdv:annonce";
  if (/^Consultation (de )?suivi$/i.test(lib)) return "rdv:suivi";
  if (/^Consultation (de )?contrôle$/i.test(lib)) return "rdv:controle";
  return "rdv:act:" + lib.toLowerCase();
}
const filtrer = (evts, filtre) => { const ex = (filtre && filtre.exclus) || []; return ex.length ? (evts || []).filter((e) => ex.indexOf(cleFiltre(e)) < 0) : evts || []; };
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
    // période à valider (contourage, dosimétrie : debut → échéance) : bandeau en journées entières sur toute la durée (09/10/2026)
    const periode = !enRetard && !t.h && DATE_OK.test(t.debut || "") && t.debut < t.ech;
    return {
      k: "tache-" + t.id + "|t", tache: true, tt: t.type || "", d: enRetard ? auj : periode ? t.debut : t.ech, f: periode ? t.ech : "", h: enRetard ? "" : t.h || "", dur: 15, urg: !!(enRetard || t.urgent),
      t: [enRetard ? "EN RETARD" : "", t.urgent ? "URGENT" : "", "Tâche"].filter(Boolean).join(" – ") + " – " + t.titre + (pat ? " (" + pat + ")" : ""),
      x: [t.desc || "", "Demandée par " + (t.de === uid ? "vous-même" : t.deNom || "?") + (enRetard ? " · échéance du " + t.ech.split("-").reverse().join("/") : ""), "Ouvrir les tâches : " + LIEN_TACHES].filter(Boolean).join("\n"),
    };
  }).filter((e) => dansFenetre(e, auj));
}
// ───── Tâches automatiques (P4, 08/10/2026) ─────
// Règles : espaces/{e}/parametres/tachesAuto = { data: JSON { regles: [{ id, ev, actif, titre, type, pour ("titulaire" | uid),
// n (décalage : jours, ou mois pour apresFinRT), depuis (AAAA-MM-JJ : pas d'événement plus ancien) }] } }.
// Trois règles fixes (type « Radiothérapie »), le déroulé de la radiothérapie (09/10/2026) : contourage à valider (du scanner
// à la 1re séance), dosimétrie à valider (de la validation du contourage à la 1re séance), fin de radiothérapie à valider
// (lendemain de la fin prévue) ; terminées toutes seules quand c'est validé dans le dossier. Règles du médecin : derniereCure, nonVenu, nouveauPatient, apresFinRT, veilleJ1.
// Une tâche par règle, patient et occurrence (identifiant fixe idAuto), créée une seule fois (registre tachesAuto/{id}).
const REGLES_FIXES = [
  { id: "cont", ev: "cont", fixe: true, actif: true, titre: "Valider le contourage", type: "Radiothérapie", pour: "titulaire", n: 0, depuis: "" },
  { id: "dosi", ev: "dosi", fixe: true, actif: true, titre: "Valider la dosimétrie", type: "Radiothérapie", pour: "titulaire", n: 0, depuis: "" },
  { id: "finrt", ev: "finrt", fixe: true, actif: true, titre: "Valider la fin de radiothérapie", type: "Radiothérapie", pour: "titulaire", n: 0, depuis: "" },
];
const EVENEMENTS_AUTO = ["cont", "dosi", "finrt", "derniereCure", "nonVenu", "nouveauPatient", "apresFinRT", "veilleJ1"];
function reglesAuto(cfg) {
  const l = (cfg && Array.isArray(cfg.regles) ? cfg.regles : []).filter((r) => r && r.id && EVENEMENTS_AUTO.indexOf(r.ev) >= 0);
  return REGLES_FIXES.map((f) => Object.assign({}, f, l.find((r) => r.id === f.id) || {}, { fixe: true, ev: f.ev })).concat(l.filter((r) => !REGLES_FIXES.some((f) => f.id === r.id)));
}
const ouvreJ = (d, feries) => { const w = new Date(d + "T12:00:00Z").getUTCDay(); return w !== 0 && w !== 6 && !(feries || []).some((f) => (typeof f === "string" ? f : f && f.d) === d); };
// Fin prévue d'une radiothérapie (même calcul que public/js/moteur/rt.js finRT / joursSeances : saisie, sinon dernière séance selon
// le rythme : quotidien, 1 jour sur 2, 2 par jour, 1 par semaine, jours choisis ; test de cohérence tests/moteur/test-rt.mjs, 3.5)
function joursSeances(r, feries) {
  const max = parseInt(r.nb, 10), out = []; if (!r.deb || !(max > 0)) return out;
  const jourSem = (d) => new Date(d + "T12:00:00Z").getUTCDay(), ryt = r.ryt || "1", jours = (r.jours || []).map(Number), w0 = jourSem(r.deb);
  let d = r.deb, w = 0, c = 0, sem = -1;
  for (let g = 0; g < 2000 && c < max; g++) {
    if (ouvreJ(d, feries)) {
      let n = 0;
      if (ryt === "2") n = w % 2 === 0 ? 1 : 0;
      else if (ryt === "bid") n = Math.min(2, max - c);
      else if (ryt === "hebdo") { const k = Math.floor((Date.parse(d) - Date.parse(r.deb)) / 864e5 / 7), dec = (jourSem(d) - w0 + 7) % 7; if (k !== sem && (dec === 0 || k > sem)) { n = 1; sem = k; } }
      else if (ryt === "jours") n = jours.indexOf(jourSem(d)) >= 0 ? 1 : 0;
      else n = 1;
      if (n) { out.push({ d, n }); c += n; }
      w++;
    }
    d = addJ(d, 1);
  }
  return out;
}
function finRT(r, feries) {
  if (r.finPrev) return r.finPrev;
  const l = joursSeances(r, feries); return l.length && l.reduce((t, z) => t + z.n, 0) >= parseInt(r.nb, 10) ? l[l.length - 1].d : null;
}
const addMois = (d, n) => { const x = new Date(d + "T12:00:00Z"), j = x.getUTCDate(); x.setUTCDate(1); x.setUTCMonth(x.getUTCMonth() + n); const fin = new Date(Date.UTC(x.getUTCFullYear(), x.getUTCMonth() + 1, 0)).getUTCDate(); x.setUTCDate(Math.min(j, fin)); return x.toISOString().slice(0, 10); };
const idAuto = (regle, pid, cle) => "auto-" + crypto.createHash("sha1").update(regle + "|" + pid + "|" + cle).digest("hex").slice(0, 24);
const jfr = (d) => (d ? d.slice(8, 10) + "/" + d.slice(5, 7) + "/" + d.slice(0, 4) : "");
const lire = (j, def) => { try { return JSON.parse(j || def); } catch (e) { return JSON.parse(def); } };
// Tâches dues pour un dossier : { voulues: [{ id, regle, ev, cle, titre, type, pour, ech, rt }], resolues: [id], premature: [id] }
// premature : « Valider la dosimétrie » alors que le contourage n'est pas validé (créée par la version d'avant le 09/10/2026) :
// à retirer (avec son registre) pour être recréée au bon moment
function tachesAutoPatient(pid, docData, regles, auj, feries, opts) {
  const voulues = [], resolues = [], premature = []; if (!docData) return { voulues, resolues, premature };
  const cl0 = Object.assign({}, (docData.clinique || {})._autres || {}, docData.clinique || {}); // statut parfois rangé dans _autres (avant le 12/10/2026)
  if (cl0.statut === "decede") return { voulues, resolues, premature }; // patient décédé (3.3) : plus de tâche automatique
  const rts = lire(docData.rtsJson, "[]"), rdvs = lire(docData.rdvsJson, "[]"), r0 = lire(docData.resume, "{}"), act = (r0.act || []).filter((a) => !a.sj && a.d && a.k);
  (regles || []).filter((R) => R.actif !== false).forEach((R) => {
    const n = parseInt(R.n, 10) || 0, ok = (d) => !R.depuis || (d && d >= R.depuis);
    // debut (09/10/2026) : début de la période à valider (contourage : scanner ; dosimétrie : validation du contourage)
    const v = (cle, ech, suffixe, rt, debut) => voulues.push({ id: idAuto(R.id, pid, cle), regle: R.id, ev: R.ev, cle, titre: R.titre + (suffixe ? " – " + suffixe : ""), type: R.type || "", pour: R.pour || "titulaire", ech: ech || "", rt: rt || "", debut: debut || "" });
    // mêmes périodes que l'écran (rt.js contourage / dosimetrie) : contourage dès le scanner ; dosimétrie dès la validation du
    // contourage (pas avant). 2.5 (12/10/2026) : la tâche reste due après la 1re séance tant que ce n'est pas validé (échéance =
    // 1re séance : « EN RETARD ») ; dosimétrie à revalider après un changement de prescription (r.dosiN) = nouvelle tâche
    const cleDosi = (r) => r.id + (r.dosiN ? "#" + r.dosiN : "");
    if (R.ev === "cont") rts.forEach((r) => { if (!r.id || !r.scan || r.annule) return; if (r.cont || r.dosi || r.fin) resolues.push(idAuto(R.id, pid, r.id)); else if (auj >= r.scan) v(r.id, r.deb || "", r.acte || "", r.id, r.scan); });
    if (R.ev === "dosi") rts.forEach((r) => { if (!r.id || !r.scan || r.annule) return; const k = cleDosi(r); if (r.dosi || r.fin) resolues.push(idAuto(R.id, pid, k)); else if (!r.cont) premature.push(idAuto(R.id, pid, k)); else v(k, r.deb || "", (r.acte || "") + (r.dosiN ? " (prescription modifiée)" : ""), r.id, r.cont); });
    if (R.ev === "finrt") rts.forEach((r) => { if (!r.id || !r.deb || r.annule) return; if (r.fin) { resolues.push(idAuto(R.id, pid, r.id)); return; } const fp = finRT(r, feries); if (fp && auj > fp) v(r.id, addJ(fp, 1), (r.acte || "radiothérapie") + " (fin prévue le " + jfr(fp) + ")", r.id); });
    if (R.ev === "derniereCure") act.forEach((a) => { if (a.k === a.nb && ok(a.d)) v(a.nom + "|" + a.k, addJ(a.d, n), "C" + a.k + "/" + a.nb + " " + a.nom + " le " + jfr(a.d)); });
    if (R.ev === "veilleJ1") act.forEach((a) => { const dv = addJ(a.d, -1); if (auj >= dv && auj <= a.d && ok(dv)) v(a.nom + "|" + a.k + "|" + a.d, dv, "C" + a.k + " " + a.nom + " le " + jfr(a.d)); });
    if (R.ev === "nonVenu") rdvs.forEach((x) => { if (x.st === "absent" && x.d && ok(x.d)) v(x.id || x.d, addJ(x.d, n), "non venu le " + jfr(x.d)); });
    if (R.ev === "nouveauPatient" && opts && opts.nouveau) v("creation", addJ(auj, n), "");
    if (R.ev === "apresFinRT") rts.forEach((r) => { if (!r.id || !r.fin || r.annule) return; const dt = addMois(r.fin, n || 3); if (auj >= dt && ok(dt)) v(r.id, dt, (r.acte || "radiothérapie") + " terminée le " + jfr(r.fin), r.id); });
  });
  return { voulues, resolues, premature };
}
// Corps d'un événement Google Agenda
function corps(e) {
  const b = {
    id: idEv(e.k), summary: e.t, description: [e.x || "", "— Onco360 (mise à jour automatique : modifier dans Onco360)"].filter(Boolean).join("\n\n"), status: "confirmed",
    extendedProperties: { private: { onco360: "1", g: groupe(e.k), k: String(e.k).slice(0, 900), sig: signature(e) } },
  };
  const h = heure(e.h);
  if (h) { b.start = { dateTime: e.d + "T" + h + ":00", timeZone: TZ }; b.end = { dateTime: finHeure(e.d, h, e.dur), timeZone: TZ }; }
  else { b.start = { date: e.d }; b.end = { date: addJ(e.f && DATE_OK.test(e.f) && e.f > e.d ? e.f : e.d, 1) }; }
  if ("coul" in e) b.colorId = e.coul || null; // null : retour à la couleur de l'agenda
  if (e.tache) Object.assign(b, { transparency: "transparent", reminders: { useDefault: false, overrides: [] } });
  return b;
}
// Met l'agenda en accord avec la liste voulue : crée, modifie, supprime (seulement les événements Onco360 listés)
// Dernier jour d'un événement de l'agenda (journées : fin exclusive ; heure fixe : son jour de début)
const dernierJour = (x) => (x.start && x.start.date ? addJ(x.end.date, -1) : String((x.start && x.start.dateTime) || "").slice(0, 10));
// Un événement refusé par Google (400 : données invalides) est mis de côté, sans bloquer les autres (08/10/2026)
async function appliquer(api, calId, voulus, existants, auj) {
  const parId = new Map(existants.map((x) => [x.id, x])), vus = new Set(), refuses = [], motifs = [];
  let crees = 0, modifies = 0, supprimes = 0;
  for (const e of voulus) {
    const b = corps(e); if (vus.has(b.id)) continue; vus.add(b.id);
    const x = parId.get(b.id); parId.delete(b.id);
    const sig = x && x.extendedProperties && x.extendedProperties.private && x.extendedProperties.private.sig;
    if (x && sig === b.extendedProperties.private.sig && x.status !== "cancelled") continue;
    try { if (x) { await api.modifier(calId, b.id, b); modifies++; } else { await api.creer(calId, b); crees++; } }
    catch (er) { if (er.statut !== 400) throw er; refuses.push(e.k); motifs.push(motifRefus(er)); console.error("événement refusé par Google", e.k, e.d, e.h || "", String(er.message).slice(0, 160)); }
  }
  for (const x of parId.values()) { if (auj && dernierJour(x) < auj) continue; await api.supprimer(calId, x.id); supprimes++; } // le passé reste (historique)
  return { crees, modifies, supprimes, refuses, motifs };
}
// Motif lisible d'un refus de Google (« Invalid start time. »), sans rien du dossier
const motifRefus = (er) => { const t = String((er && er.message) || ""); const m = t.match(/"message"\s*:\s*"([^"]{1,160})"/); return (m ? m[1] : t.replace(/^Google Agenda \d+ : /, "")).slice(0, 160); };

// Corps envoyé en entier (création, remplacement) : colorId null retiré (= couleur de l'agenda)
const entier = (b) => { const n = Object.assign({}, b); if (n.colorId == null) delete n.colorId; return n; };
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
    async creer(calId, b) { const n = entier(b); try { return await req("POST", c(calId) + "/events", n); } catch (e) { if (e.statut === 409) return req("PUT", c(calId) + "/events/" + b.id, n); throw e; } },
    // R-A2 (18/10/2026) : modification = remplacement entier (PUT). Avec PATCH, Google fusionnait l'ancien début et le nouveau : une séance
    // en journée entière déplacée avec une heure (ou l'inverse) avait à la fois « date » et « dateTime », Google refusait (400) et
    // l'événement restait à l'ancienne date. Couleur de l'agenda (colorId null) = pas de colorId.
    modifier: (calId, id, b) => req("PUT", c(calId) + "/events/" + id, entier(b)),
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
const peutPrix = (m) => !!m && m.actif !== false && m.role !== "comptable" && droitM(m, "encaissements") && droitM(m, "rendezvous");
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
// Mode de paiement (19.5, 10/10/2026 ; lieux « payé au cabinet ») : esp | carte | chq | np (non payé, à régler plus tard) |
// ae (à encaisser : « Venu » validé par le médecin, la secrétaire encaisse ensuite)
const MODES_PAIEMENT = ["esp", "carte", "chq", "np", "ae"];
function appliquerPrix(dossier, M, E, q) {
  const m = q.montant == null ? null : num(q.montant), mode = MODES_PAIEMENT.indexOf(q.mode) >= 0 ? q.mode : null;
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
    if (mode && !hs) { o.mode = mode; E.rdv[r.id].mode = mode; } else delete o.mode;
    return "Prix de la consultation du " + r.d + " : " + m + " DH";
  }
  const n = parseInt(q.n, 10), j = parseInt(q.j, 10), L = JSON.parse(dossier.lignesJson || "[]").find((z) => z.id === q.lid);
  if (!L || !(n >= 1) || !(j >= 1) || !L.cures || !L.cures[n - 1]) throw new Error("Cure introuvable.");
  const a = M.cures[q.lid] = M.cures[q.lid] || {}, cc = a[n] = a[n] || {}, J = Object.assign({}, consJours(cc)), k = q.lid + "|" + n + "|" + j;
  const MJ = Object.assign({}, cc.consModeJ || {});
  if (m == null) { delete J[j]; delete E.cons[k]; delete MJ[j]; } else { J[j] = m; E.cons[k] = { m, d: String(q.d || "").slice(0, 10), lib: String(q.lib || "").slice(0, 120), n, j: "J" + j }; if (mode) { MJ[j] = mode; E.cons[k].mode = mode; } else delete MJ[j]; }
  cc.consJ = J; majCons(cc); if (Object.keys(MJ).length) cc.consModeJ = MJ; else delete cc.consModeJ;
  return "Chimiothérapie C" + n + " J" + j + (m == null ? " : statut annulé" : " : venu (" + m + " DH)");
}

module.exports = { MODES_PAIEMENT, TZ, jourCasa, addJ, voitPatient, permis, evtsPatient, evtsAbsences, evtsTaches, heure, REGLES_FIXES, EVENEMENTS_AUTO, reglesAuto, tachesAutoPatient, finRT, addMois, idAuto, COULEURS0, categorie, colorer, cleFiltre, filtrer, idEv, corps, appliquer, creerApi, timeMin, groupe, peutPrix, appliquerPrix };
