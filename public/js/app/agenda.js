// Onco360 – Agenda (étape C2) : vues Liste / Jour / Semaine / Mois, mini-calendrier, rendez-vous à venir.
// Les consultations ont une heure (grille au pas de 15 min, hauteur = durée du type, AG2) ; séances de chimio et scanner de centrage
// aussi quand une heure leur est donnée (AG5) ; sinon, comme les hospitalisations et les autres étapes de radiothérapie, ligne
// « Journée ». Toucher un créneau libre = créer un rendez-vous à cette heure ; glisser un rendez-vous = le déplacer (AG3) ;
// filtre « Médecin » à partir de 2 médecins (AG4).
import { etatLigne, protocoleDe, seancesCure } from "../moteur/doses.js";
import { finRT } from "../moteur/rt.js";
import { typeRdv, libRdv } from "../moteur/rdv.js";
import { addJ, ouvre } from "../moteur/outils.js";
import { horaires, dureeDe } from "./configuration.js";
import { heureSeance, fenetreHeureSeance, peutHeureChimio, estInfirmiere } from "./chimio.js";
import { DU_CONS } from "../moteur/heures.js";

let A = null;
export function installer(api) { A = api; }
const AG = { vue: null, d: null, mois: null, etab: null, med: null }; // med (AG4) : "" = tous les médecins // etab : "" = tous les établissements ; vue : choisie à la 1re ouverture
const PAS = 22; // 22 px par quart d'heure
let H0 = 7, H1 = 20, DUREE = 30; // grille et durée : d'après les horaires de la Configuration
// Réglage du cabinet (10/10/2026) : « horaires grisés » ou « absences et fériés » retirés
const fnA = (k) => !D().reg || D().reg.fonctions["agenda." + k] !== false;
const plagesDe = (d) => (fnA("horaires") ? horaires(AG.etab).jours[jsem(d)] || [] : [["00:00", "24:00"]]);
// Établissements visibles par la personne connectée ; une secrétaire rattachée à un seul établissement voit directement le sien
const etabsVus = () => { const mb = D().membre, l = (D().etabs || []).map((e) => e.code); return mb.tousEtablissements ? l : l.filter((c) => (mb.etablissements || []).indexOf(c) >= 0); };
const JC = ["Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."], MC = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
const MOIS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
const D = () => A.D();
const jsem = (d) => new Date(d + "T12:00:00").getDay();
const lundi = (d) => addJ(d, -((jsem(d) + 6) % 7));
const court = (d) => { const x = new Date(d + "T12:00:00"); return x.getDate() + " " + MC[x.getMonth()]; };
const mn = (h) => { const p = String(h || "").split(":"); return +p[0] * 60 + (+p[1] || 0); };
const hh = (m) => ("0" + Math.floor(m / 60)).slice(-2) + ":" + ("0" + (m % 60)).slice(-2);

// ───── Événements d'une période (passés compris) ─────
// Heure facultative (AG5, 11/10/2026) : séances de chimio (J1, J8…) et scanner de centrage ; sans heure : ligne « Journée »
const DU_CH = 120, DU_SCAN = 30, DUREES_H = [15, 30, 45, 60, 90, 120, 150, 180, 240, 300, 360];
const hrDe = (hr, def) => (hr && hr.h ? { h: hr.h, du: +hr.du || def, hr: true } : { h: "", du: def });
// Séance de chimio dans le planning (12/10/2026, décision de Dr Bentahila) : médecin et secrétaire → la consultation de la séance (hc :
// choisie par le médecin, sinon juste avant la séance de l'infirmière), sans la durée de la chimio ; infirmière → la séance à l'hôpital
// de jour (hr : heure et durée) et la consultation choisie par le médecin. o = la cure (J1) ou c.sea[j]
function evtsChimio(base, o) {
  o = o || {};
  if (!estInfirmiere()) return [Object.assign({}, base, { sub: "cons" }, hrDe(o.hc, DU_CONS), o.hc ? { t: "Consultation · " + base.t } : {})];
  const l = [Object.assign({}, base, { sub: "seance" }, hrDe(o.hr, DU_CH), o.hr && o.hr.h ? { t: "Séance · " + base.t } : {})];
  if (o.hc && !o.hc.auto && base.st === "prevu") l.push(Object.assign({}, base, { sub: "cons", t: "Consultation du médecin · " + base.t }, hrDe(o.hc, DU_CONS)));
  return l;
}
function evenements(du, au) {
  const out = [], ctx = D().ctx;
  D().patients.forEach((x) => {
    const P = x.P, nm = x.r.nm;
    if (AG.etab && x.doc.etablissementId !== AG.etab) return;
    if (A.voitRdv()) (P.rdvs || []).forEach((r) => {
      if (!r.d || (AG.med && A.multiMed() && A.medRdv(r) !== AG.med)) return; const hs = typeRdv(r.type) === "hospit", f = hs && r.f && r.f >= r.d ? r.f : r.d;
      if (f < du || r.d > au) return;
      out.push({ pid: x.id, rid: r.id, cat: hs ? "ho" : "co", d: r.d, f, h: hs ? "" : r.h || "", du: hs ? 0 : dureeDe(r, x.doc.etablissementId), nm, t: (hs ? "Hospitalisation" : libRdv(r)) + (A.multiMed() && !AG.med ? " · " + A.nomMed(A.medRdv(r)) : ""), st: r.st || "prevu", n: r.n || "" });
    });
    (P.lignes || []).forEach((L) => {
      if (L.arret) return; let p; try { p = protocoleDe(L, ctx.bib); } catch (e) { return; } if (!p) return;
      etatLigne(L, P, ctx).forEach((e) => {
        if (e.st === "annulee" || !e.date) return;
        if (e.date >= du && e.date <= au) evtsChimio({ pid: x.id, cat: "ch", d: e.date, f: e.date, nm, t: "C" + e.n + "/" + L.cures.length + " · " + p.nom, st: e.st === "recue" ? "fait" : "prevu", lid: L.id, n: e.n, j: 1 }, e.c).forEach((z) => out.push(z));
        seancesCure(L, e, ctx.bib).forEach((s) => { if (s.st === "annulee") return; const d = s.st === "recue" && s.d ? s.d : s.prevue; if (d && d >= du && d <= au) evtsChimio({ pid: x.id, cat: "ch", d, f: d, nm, t: "C" + e.n + " J" + s.j + " · " + p.nom, st: s.st === "recue" ? "fait" : "prevu", lid: L.id, n: e.n, j: s.j }, (e.c.sea || {})[s.j]).forEach((z) => out.push(z)); });
      });
    });
    if (A.voitRT(x)) (P.rts || []).forEach((r) => {
      const fin = r.fin || finRT(r, ctx.feries), a = r.acte || "Radiothérapie";
      // « Dosimétrie à valider » : une tâche pour le médecin (P4, 08/10/2026), plus un rendez-vous de l'agenda
      [[r.scan, "Scanner de centrage", "scan"], [r.dosi, "Dosimétrie validée"], [r.deb, "1re séance", "deb"], [fin, r.fin ? "Fin de radiothérapie" : "Fin de radiothérapie prévue"]].forEach((z) => { if (z[0] && z[0] >= du && z[0] <= au) out.push(Object.assign({ pid: x.id, cat: "rt", d: z[0], f: z[0], nm, t: z[1] + " · " + a, st: r.fin && z[0] <= r.fin ? "fait" : "prevu" }, z[2] ? Object.assign({ rtid: r.id, z: z[2] }, hrDe(z[2] === "deb" ? r.debH : r.scanH, DU_SCAN)) : { h: "" })); });
    });
  });
  return out.sort((a, b) => (a.d + (a.h || "")).localeCompare(b.d + (b.h || "")) || a.nm.localeCompare(b.nm));
}
// Statut de salle d'attente du jour même (vues Jour et Liste) : « En salle · 12 min », « En consultation · 5 min »…
const badge = (e) => (e.d === D().t && (e.cat === "co" || e.cat === "ch") && A.badgeSalle ? A.badgeSalle(e.pid, e.cat === "co" ? "r-" + e.rid : "chimio") : "");
const EM = { co: "🩺", ho: '<svg class="pi"><use href="#i-hopital"/></svg>', ch: "💉", rt: "☢️" };
const chip = (e, i) => '<button class="ev-c c-' + e.cat + (e.st === "fait" ? " fait" : e.st === "absent" ? " nv" : "") + (glissable(e) && AG.vue !== "mois" ? ' dep" draggable="true" data-i="' + i : "") + '" onclick="agEv(' + i + ')" title="' + A.esc(e.nm + " – " + e.t) + '">' + EM[e.cat] + " <b>" + A.esc(e.nm) + "</b> " + A.esc(e.t) + (AG.vue === "jour" ? badge(e) : "") + "</button>";
const absence = (d) => (fnA("absences") ? (D().cal.abs || []).find((a) => d >= a.du && d <= a.au) : null);
const ferie = (d) => (fnA("absences") ? (D().ctx.feries || []).find((f) => f.d === d) : null);
let EVS = [];

// ───── Page ─────
export function pageAgenda() {
  if (!AG.d) { AG.d = D().t; }
  // Téléphone (AG1, 11/10/2026) : vue Jour à l'ouverture (7 colonnes de 37 px illisibles) ; ordinateur et tablette : Semaine
  if (!AG.vue) AG.vue = window.matchMedia && matchMedia("(max-width:640px)").matches ? "jour" : "semaine";
  // Médecin (AG4) : à partir de 2 médecins ; un médecin voit d'abord son agenda, la secrétaire celui de tous
  if (!A.multiMed()) AG.med = null; else if (AG.med == null || (AG.med && !A.medecins().some((m) => m.uid === AG.med))) AG.med = D().membre.role === "medecin" && A.medecins().some((m) => m.uid === D().u.uid) ? D().u.uid : "";
  const EV = etabsVus(); if (AG.etab == null || (AG.etab && EV.indexOf(AG.etab) < 0)) AG.etab = EV.length === 1 ? EV[0] : "";
  const HR = horaires(AG.etab), tout = Object.values(HR.jours).flat(); DUREE = HR.duree || 30;
  H0 = Math.min(7, ...tout.map((p) => Math.floor(mn(p[0]) / 60))); H1 = Math.max(20, ...tout.map((p) => Math.ceil(mn(p[1]) / 60)));
  const esc = A.esc, v = AG.vue;
  let du, au, lib;
  if (v === "jour") { du = au = AG.d; lib = A.cap(A.jourLong(AG.d)); }
  else if (v === "semaine") { du = lundi(AG.d); au = addJ(du, 6); lib = court(du) + " – " + court(au); }
  else if (v === "mois") { const m = AG.d.slice(0, 8) + "01"; du = lundi(m); au = addJ(du, 41); const x = new Date(m + "T12:00:00"); lib = MOIS[x.getMonth()] + " " + x.getFullYear(); }
  else { du = AG.d; au = addJ(AG.d, 30); lib = "À partir du " + court(AG.d); }
  EVS = evenements(du, au);
  const main = v === "mois" ? vueMois(du) : v === "liste" ? vueListe() : vueGrille(du, v === "jour" ? 1 : 7), cote = miniCal() + aVenir();
  const onglet = (k, ico, t) => '<button' + (k === "liste" ? "" : ' data-fn="agenda.vues"') + ' class="' + (v === k ? "on" : "") + '" onclick="agVue(\'' + k + '\')">' + A.ic(ico) + t + "</button>";
  let h = '<section class="accueil"><div><h2>Agenda</h2><p>Vos prochains rendez-vous, regroupés par jour.</p></div><div class="actions"><button class="bt plein" onclick="nouveauRdv(null,null,\'' + esc(AG.etab || "") + '\',\'' + esc(AG.med || "") + '\')">' + A.ic("plus") + "Nouveau rendez-vous</button></div></section>" +
    '<div class="ag-barre"><div class="ag-vues">' + onglet("liste", "liste", "Liste") + onglet("jour", "agenda", "Jour") + onglet("semaine", "agenda", "Semaine") + onglet("mois", "accueil", "Mois") + "</div>" +
    '<div class="ag-nav"><button class="rond" onclick="agNav(-1)" aria-label="Précédent">' + A.ic("retour") + '</button><button class="bt clair petit" onclick="agAuj()">Aujourd\'hui</button><b>' + esc(lib) + '</b><button class="rond" onclick="agNav(1)" aria-label="Suivant" style="transform:scaleX(-1)">' + A.ic("retour") + "</button></div>" +
    (EV.length > 1 ? '<select class="ag-etab" data-fn="agenda.filtre" aria-label="Établissement" onchange="agEtab(this.value)"><option value="">Tous les établissements</option>' + EV.map((c) => '<option value="' + esc(c) + '"' + (AG.etab === c ? " selected" : "") + ">" + esc(c) + "</option>").join("") + "</select>" : EV.length === 1 ? '<span class="badge b-gr">' + esc(EV[0]) + "</span>" : "") +
    (A.multiMed() ? '<select class="ag-etab" id="agMed" aria-label="Médecin" onchange="agMed(this.value)"><option value="">Tous les médecins</option>' + A.medecins().map((m) => '<option value="' + esc(m.uid) + '"' + (AG.med === m.uid ? " selected" : "") + ">" + esc(m.nom) + "</option>").join("") + "</select>" : "") + "</div>" +
    '<div class="ag-corps"><aside class="ag-cote">' + cote + '</aside><div class="ag-main carte">' + main + "</div></div>" +
    ((D().profil.agendaGoogle || {}).email ? '<p class="mesures">Vos rendez-vous apparaissent aussi dans votre Google Agenda (agenda « Onco360 »), dans un seul sens. <a href="#parametres/couleurs">État</a></p>'
      : '<p class="mesures">Voir ces rendez-vous dans votre Google Agenda : <a href="#parametres/couleurs">Paramètres › Google Agenda</a>.</p>');
  A.$("page").innerHTML = h;
  const g = document.querySelector(".ag-grille"), deb = tout.length ? Math.min(...tout.map((p) => mn(p[0]))) : 8 * 60; if (g && !AG.defile) { g.scrollTop = (deb - H0 * 60) / 15 * PAS - 10; }
  AG.defile = false;
  if (g) glisser(document.querySelector(".ag-main"));
}
function miniCal() {
  const m = (AG.mois || AG.d).slice(0, 8) + "01", x = new Date(m + "T12:00:00"), d0 = lundi(m), t = D().t;
  let h = '<div class="carte mcal"><div class="mcal-t"><button onclick="agMois(-1)">‹</button><b>' + MOIS[x.getMonth()] + " " + x.getFullYear() + '</b><button onclick="agMois(1)">›</button></div><div class="mcal-g">' + ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"].map((j) => "<i>" + j + "</i>").join("");
  for (let n = 0; n < 42; n++) { const d = addJ(d0, n); h += '<button class="' + (d.slice(0, 7) !== m.slice(0, 7) ? "hors " : "") + (d === t ? "auj " : "") + (d === AG.d ? "sel" : "") + '" onclick="agJour(\'' + d + "')\">" + +d.slice(8) + "</button>"; }
  return h + "</div></div>";
}
function aVenir() {
  const t = D().t, l = evenements(t, addJ(t, 60)).filter((e) => (e.cat === "co" || e.cat === "ho") && e.st === "prevu").slice(0, 6), base = EVS.length;
  EVS = EVS.concat(l);
  return '<div class="carte mcal"><div class="lbl">RDV À VENIR</div>' + (l.length ? l.map((e, i) => '<div class="avn" onclick="agEv(' + (base + i) + ')"><b>' + A.esc(e.nm) + "</b><span>" + A.dfr(e.d) + (e.h ? " · " + e.h : "") + " · " + A.esc(e.t) + "</span></div>").join("") : '<p class="mesures">Aucun rendez-vous à venir.</p>') + "</div>";
}
function vueGrille(du, n) {
  const jours = []; for (let k = 0; k < n; k++) jours.push(addJ(du, k));
  const t = D().t, now = new Date(), nowM = now.getHours() * 60 + now.getMinutes(), haut = (H1 - H0) * 4 * PAS;
  const parJour = jours.map((d) => EVS.map((e, i) => [e, i]).filter(([e]) => d >= e.d && d <= e.f));
  let h = '<div class="ag-tete" style="grid-template-columns:56px repeat(' + n + ',minmax(0,1fr))"><span></span>' + jours.map((d, k) => {
    const nb = parJour[k].filter(([e]) => e.cat === "co").length, x = new Date(d + "T12:00:00");
    return '<button class="' + (d === t ? "auj" : "") + '" onclick="agJour(\'' + d + '\',1)">' + JC[x.getDay()] + " " + x.getDate() + ' <span class="nb">' + nb + "</span></button>";
  }).join("") + "</div>";
  h += '<div class="ag-journee" style="grid-template-columns:56px repeat(' + n + ',minmax(0,1fr))"><span class="hlib">Journée</span>' + jours.map((d, k) => {
    const l = parJour[k].filter(([e]) => !e.h), ab = absence(d), fe = ferie(d), max = n === 1 ? 50 : 3;
    return "<div>" + (ab ? '<span class="ev-c c-abs"><svg class="pi"><use href="#i-avion"/></svg>' + A.esc(ab.m || "Absence") + "</span>" : "") + (fe ? '<span class="ev-c c-fer">' + A.esc(fe.nom || "Férié") + "</span>" : "") + l.slice(0, max).map(([e, i]) => chip(e, i)).join("") + (l.length > max ? '<button class="plus" onclick="agJour(\'' + d + "',1)\">+ " + (l.length - max) + " autre" + (l.length - max > 1 ? "s" : "") + "</button>" : "") + "</div>";
  }).join("") + "</div>";
  h += '<div class="ag-grille"><div class="ag-g" style="grid-template-columns:56px repeat(' + n + ',minmax(0,1fr));height:' + haut + 'px"><div class="heures">';
  for (let q = 0; q < (H1 - H0) * 4; q++) { const m = H0 * 60 + q * 15; h += '<span style="top:' + q * PAS + 'px" class="' + (m % 60 ? "" : "pl") + '">' + hh(m) + "</span>"; }
  h += "</div>" + jours.map((d, k) => {
    const pl = plagesDe(d).slice().sort((a, z) => a[0].localeCompare(z[0])), ferme = !pl.length || ferie(d) || absence(d), y = (h) => (mn(h) - H0 * 60) / 15 * PAS;
    let c = '<div class="col' + (ferme ? " ferme" : "") + '" data-d="' + d + '" onclick="agCreneau(event,\'' + d + "')\">";
    if (!ferme) { let pos = 0; pl.forEach((p) => { if (y(p[0]) > pos) c += '<i class="hach" style="top:' + pos + "px;height:" + (y(p[0]) - pos) + 'px"></i>'; pos = Math.max(pos, y(p[1])); }); if (pos < haut) c += '<i class="hach" style="top:' + pos + "px;height:" + (haut - pos) + 'px"></i>'; }
    const tim = parJour[k].filter(([e]) => e.h).map(([e, i]) => ({ e, i, a: mn(e.h), b: mn(e.h) + (e.du || DUREE) }));
    // Rendez-vous qui se chevauchent (même heure…) : la case est partagée en colonnes côte à côte (19.4, 10/10/2026), au lieu
    // d'être empilés ; chaque groupe de rendez-vous qui se touchent a son nombre de colonnes
    tim.sort((p, q) => p.a - q.a || p.b - q.b);
    let grp = [], fin = -1; const fermer = () => { const nc = Math.max(1, ...grp.map((o) => o.col + 1)); grp.forEach((o) => { o.nc = nc; }); grp = []; };
    tim.forEach((o) => {
      if (grp.length && o.a >= fin) fermer();
      const prises = grp.filter((p) => p.b > o.a).map((p) => p.col); let k = 0; while (prises.indexOf(k) >= 0) k++;
      o.col = k; grp.push(o); fin = Math.max(fin, o.b);
    });
    if (grp.length) fermer();
    tim.forEach(({ e, i, a, b, col, nc }) => { const top = (a - H0 * 60) / 15 * PAS; if (top < 0 || top > haut) return; const g = glissable(e); c += '<button class="ev-g c-' + e.cat + (e.st === "fait" ? " fait" : e.st === "absent" ? " nv" : "") + (nc > 1 ? " part" : "") + (g ? " dep" : "") + '"' + (g ? ' draggable="true" data-i="' + i + '"' : "") + ' style="top:' + top + "px;height:" + ((b - a) / 15 * PAS - 2) + "px;left:calc(" + (col * 100 / nc).toFixed(3) + "% + 2px);width:calc(" + (100 / nc).toFixed(3) + '% - 4px);right:auto" title="' + A.esc(e.h + " " + e.nm + " – " + e.t + " (" + (b - a) + " min)") + '" onclick="event.stopPropagation();agEv(' + i + ')"><b>' + e.h + " " + A.esc(e.nm) + "</b><span>" + A.esc(e.t) + "</span>" + (n === 1 ? badge(e) : "") + "</button>"; });
    if (d === t && nowM >= H0 * 60 && nowM <= H1 * 60) c += '<i class="maint" style="top:' + (nowM - H0 * 60) / 15 * PAS + 'px"></i>';
    return c + "</div>";
  }).join("") + "</div></div>";
  return h;
}
function vueMois(du) {
  const m = AG.d.slice(0, 7), t = D().t;
  let h = '<div class="ag-mois">' + ["Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam.", "Dim."].map((j) => '<div class="mt">' + j + "</div>").join("");
  for (let n = 0; n < 42; n++) {
    const d = addJ(du, n), l = EVS.map((e, i) => [e, i]).filter(([e]) => d >= e.d && d <= e.f), ab = absence(d);
    h += '<div class="mc' + (d.slice(0, 7) !== m ? " hors" : "") + (d === t ? " auj" : "") + (ab || ferie(d) || !plagesDe(d).length ? " ferme" : "") + '"><button class="mj" onclick="agJour(\'' + d + "',1)\">" + +d.slice(8) + "</button>" +
      l.slice(0, 3).map(([e, i]) => chip(e, i)).join("") + (l.length > 3 ? '<button class="plus" onclick="agJour(\'' + d + "',1)\">+ " + (l.length - 3) + "</button>" : "") + "</div>";
  }
  return h + "</div>";
}
function vueListe() {
  if (!EVS.length) return '<p class="sous">Rien de prévu sur les 30 prochains jours.</p>';
  let h = "", jc = "";
  EVS.forEach((e, i) => {
    if (e.d !== jc) { if (jc) h += "</div>"; jc = e.d; h += '<div class="jour7"><h4>' + A.cap(A.jourLong(e.d)) + (absence(e.d) ? ' <span class="badge b-al">Absence</span>' : "") + "</h4>"; }
    h += '<div class="ev" onclick="agEv(' + i + ')"><span class="h' + (e.h ? "" : " j") + '">' + (e.h || "Journée") + "</span><span>" + EM[e.cat] + '</span><div class="tx"><b>' + A.esc(e.nm) + "</b><br><span>" + A.esc(e.t) + (e.st === "fait" ? " · fait" : e.st === "absent" ? " · non venu" : "") + "</span>" + badge(e) + '</div><button class="lien">Ouvrir</button></div>';
  });
  return h + "</div>";
}

// ───── Déplacer un rendez-vous en le faisant glisser (AG3, 11/10/2026) : vues Jour et Semaine, ordinateur (souris) ─────
// Glissable : consultation prévue, droit « rendez-vous », pas déjà dans la salle d'attente. Lâché sur un créneau (pas de 15 min)
// → fenêtre de confirmation (v2.js deplacerRdv : vérifications, historique, WhatsApp).
const souris = () => !window.matchMedia || matchMedia("(pointer:fine)").matches;
const glissable = (e) => e.st === "prevu" && souris() && !(e.cat === "ch" && estInfirmiere() && e.sub === "cons") /* heure du médecin : jamais déplacée par l'infirmière */ && (e.cat === "co" ? !!e.rid && A.peut("rendezvous") && !/class="pst/.test(badge(e)) /* badge vide = pas arrivé */ : peutHeure(e));
// Heure d'une séance de chimio (droit « planning », traitements ou « administrer » : infirmière, 12/10/2026) ou du scanner (radiothérapie : modifier) (AG5)
const peutHeure = (e) => e.st === "prevu" && ((e.cat === "ch" && !!e.lid && peutHeureChimio()) || (e.cat === "rt" && (e.z === "scan" || e.z === "deb") && A.traitModRT()));
async function noterHeure(e, hr) {
  const x = D().patients.find((p) => p.id === e.pid); if (!x) return;
  try { if (e.cat === "ch") await heureSeance(x, e.lid, e.n, e.j, e.sub === "seance" ? { seance: hr } : { cons: hr ? hr.h : "" }); else await A.heureRT(e.pid, e.rtid, hr, e.z); A.toast(hr ? "Heure notée : " + hr.h + " (" + hr.du + " min)." : "Heure retirée."); AG.defile = true; pageAgenda(); }
  catch (er) { A.toast(er.message); }
}
function glisser(g) {
  let G = null; // { i, dy (minutes entre le haut du rendez-vous et la souris), du }
  const cible = () => g.querySelector(".ag-cible") || null;
  const ou = (ev) => { const col = ev.target.closest && ev.target.closest(".col"); if (!col || !G) return null; const y = ev.clientY - col.getBoundingClientRect().top, m = Math.max(H0 * 60, Math.min(H1 * 60 - 15, H0 * 60 + Math.round((y / PAS * 15 - G.dy) / 15) * 15)); return { col, d: col.dataset.d, m }; };
  const effacer = () => { const c = cible(); if (c) c.remove(); };
  g.addEventListener("dragstart", (ev) => {
    const b = ev.target.closest && ev.target.closest("[draggable][data-i]"); if (!b) return;
    const e = EVS[+b.dataset.i]; G = { i: +b.dataset.i, dy: Math.floor((ev.clientY - b.getBoundingClientRect().top) / PAS) * 15, du: e.du || DUREE };
    ev.dataTransfer.effectAllowed = "move"; ev.dataTransfer.setData("text/plain", String(G.i)); setTimeout(() => b.classList.add("glisse"), 0);
  });
  g.addEventListener("dragover", (ev) => {
    const o = ou(ev); if (!o) return; ev.preventDefault(); ev.dataTransfer.dropEffect = "move";
    let c = cible(); if (!c || c.parentNode !== o.col) { effacer(); c = document.createElement("i"); c.className = "ag-cible"; o.col.appendChild(c); }
    c.style.top = (o.m - H0 * 60) / 15 * PAS + "px"; c.style.height = G.du / 15 * PAS - 2 + "px"; c.textContent = hh(o.m) + " – " + hh(o.m + G.du);
  });
  g.addEventListener("dragleave", (ev) => { if (!ev.relatedTarget || !g.contains(ev.relatedTarget)) effacer(); });
  g.addEventListener("drop", (ev) => {
    const o = ou(ev); effacer(); if (!o) return; ev.preventDefault(); const e = EVS[G.i]; G = null; if (!e) return;
    if (e.cat === "co") { if (A.deplacerRdv) A.deplacerRdv(e.pid, e.rid, o.d, hh(o.m)); return; }
    // séance de chimio ou scanner : seulement l'heure, le même jour (changer de jour = reporter, depuis le dossier)
    if (o.d !== e.d) { A.toast(e.cat === "ch" ? "Pour changer de jour, reportez la séance depuis le dossier." : "Pour changer de jour, modifiez la radiothérapie dans le dossier."); return; }
    if (e.h !== hh(o.m)) noterHeure(e, { h: hh(o.m), du: e.du });
  });
  g.addEventListener("dragend", () => { effacer(); G = null; g.querySelectorAll(".glisse").forEach((b) => b.classList.remove("glisse")); });
}

// Séance de chimio (12/10/2026) : fenêtre commune avec le dossier (chimio.js) ; infirmière → heure et durée de la séance, médecin et
// secrétaire → heure de la consultation
function fenetreChimio(e) {
  const x = D().patients.find((p) => p.id === e.pid), L = x && (x.P.lignes || []).find((z) => z.id === e.lid), c = L && L.cures[e.n - 1]; if (!c) { window.ouvrirDossier(e.pid); return; }
  fenetreHeureSeance(x, e.lid, { k: e.n - 1, j: e.j, d: e.d, o: e.j > 1 ? (c.sea || {})[e.j] || {} : c }, estInfirmiere() ? "Séance à l'hôpital de jour" : "Consultation de la séance de chimio", () => { AG.defile = true; pageAgenda(); });
}
// Fenêtre d'un scanner de centrage : heure et durée facultatives (AG5)
function fenetreHeure(e) {
  const esc = A.esc, du = e.du || (e.cat === "ch" ? DU_CH : DU_SCAN);
  A.fenetre("<h3>" + EM[e.cat] + " " + esc(e.nm) + '</h3><p class="sous">' + esc(e.t) + " · " + A.cap(A.jourLong(e.d)) + "</p>" +
    '<div class="form"><div><label for="hS">Heure</label><input id="hS" type="time" step="900" value="' + esc(e.h || "") + '"></div>' +
    '<div><label for="hDu">Durée</label><select id="hDu">' + DUREES_H.concat(DUREES_H.indexOf(du) < 0 ? [du] : []).sort((a, z) => a - z).map((m) => '<option value="' + m + '"' + (m === du ? " selected" : "") + ">" + (m < 60 ? m + " min" : Math.floor(m / 60) + " h" + (m % 60 ? " " + (m % 60) : "")) + "</option>").join("") + "</select></div></div>" +
    '<p class="mesures">Facultatif. Avec une heure, la séance a sa case dans la grille de l\'agenda (et dans Google Agenda) ; sans heure, elle reste dans la ligne « Journée ». Pour changer de jour : depuis le dossier.</p>' +
    '<div class="boutons"><button class="bt gris" onclick="fermerFenetre()">Fermer</button><button class="bt clair" onclick="fermerFenetre();ouvrirDossier(\'' + e.pid + "')\">Ouvrir le dossier</button>" +
    (e.hr ? '<button class="bt clair" id="hSup">Retirer l\'heure</button>' : "") + '<button class="bt plein" id="hOk">Enregistrer</button></div>');
  const ok = A.$("hOk"), sup = A.$("hSup");
  ok.onclick = async () => { const h = A.val("hS"); if (!h) { A.toast("Indiquez l'heure (ou « Retirer l'heure »)."); return; } A.occupe(ok, true); await noterHeure(e, { h, du: +A.val("hDu") || du }); A.fermerFenetre(); };
  if (sup) sup.onclick = async () => { A.occupe(sup, true); await noterHeure(e, null); A.fermerFenetre(); };
}

// ───── Actions ─────
window.agVue = (v) => { AG.vue = v; pageAgenda(); };
window.agEtab = (c) => { AG.etab = c; pageAgenda(); };
window.agMed = (u) => { AG.med = u; pageAgenda(); };
window.agAuj = () => { AG.d = D().t; AG.mois = null; pageAgenda(); };
window.agNav = (s) => { const v = AG.vue; if (v === "mois") { const x = new Date(AG.d.slice(0, 8) + "01T12:00:00"); x.setMonth(x.getMonth() + s); AG.d = x.getFullYear() + "-" + ("0" + (x.getMonth() + 1)).slice(-2) + "-01"; } else AG.d = addJ(AG.d, s * (v === "jour" ? 1 : v === "semaine" ? 7 : 30)); AG.mois = null; pageAgenda(); };
window.agJour = (d, versJour) => { AG.d = d; AG.mois = null; if (versJour) AG.vue = "jour"; pageAgenda(); };
window.agMois = (s) => { const x = new Date((AG.mois || AG.d).slice(0, 8) + "01T12:00:00"); x.setMonth(x.getMonth() + s); AG.mois = x.getFullYear() + "-" + ("0" + (x.getMonth() + 1)).slice(-2) + "-01"; AG.defile = true; pageAgenda(); };
window.agCreneau = (ev, d) => {
  if (ev.target.closest(".ev-g")) return;
  const col = ev.currentTarget, y = ev.clientY - col.getBoundingClientRect().top, m = H0 * 60 + Math.floor(y / PAS) * 15;
  window.nouveauRdv(d, hh(Math.max(H0 * 60, Math.min(m, H1 * 60 - 15))), AG.etab || "", AG.med || "");
};
window.agEv = (i) => {
  const e = EVS[i]; if (!e) return;
  if (!e.rid) { if (peutHeure(e)) (e.cat === "ch" ? fenetreChimio(e) : fenetreHeure(e)); else window.ouvrirDossier(e.pid); return; }
  const st = { prevu: "Prévu", fait: "Venu", absent: "Non venu" }[e.st] || e.st;
  A.fenetre("<h3>" + EM[e.cat] + " " + A.esc(e.nm) + '</h3><p class="sous">' + A.esc(e.t) + " · " + A.cap(A.jourLong(e.d)) + (e.h ? " à " + e.h : "") + (e.f && e.f !== e.d ? " → " + A.dfrA(e.f) : "") + " · " + st + (e.n ? "<br>" + A.esc(e.n) : "") + "</p>" +
    '<div class="boutons"><button class="bt gris" onclick="fermerFenetre()">Fermer</button><button class="bt clair" onclick="fermerFenetre();ouvrirDossier(\'' + e.pid + "')\">Ouvrir le dossier</button>" + (A.peut("rendezvous") ? '<button class="bt plein" onclick="ouvrirRdv(\'' + e.pid + "','" + e.rid + "')\">Modifier / décaler</button>" : "") + "</div>");
};
