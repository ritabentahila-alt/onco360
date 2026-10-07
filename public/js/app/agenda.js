// Onco360 – Agenda (étape C2) : vues Liste / Jour / Semaine / Mois, mini-calendrier, rendez-vous à venir.
// Les consultations ont une heure (grille au pas de 15 min) ; cures, séances, hospitalisations et étapes de radiothérapie
// s'affichent dans la ligne « Journée ». Toucher un créneau libre = créer un rendez-vous à cette heure.
import { etatLigne, protocoleDe, seancesCure } from "../moteur/doses.js";
import { finRT, dosimetrie } from "../moteur/rt.js";
import { typeRdv, libRdv } from "../moteur/rdv.js";
import { addJ, ouvre } from "../moteur/outils.js";
import { horaires } from "./configuration.js";

let A = null;
export function installer(api) { A = api; }
const AG = { vue: "semaine", d: null, mois: null, etab: null }; // etab : "" = tous les établissements
const PAS = 22; // 22 px par quart d'heure
let H0 = 7, H1 = 20, DUREE = 30; // grille et durée : d'après les horaires de la Configuration
const plagesDe = (d) => (horaires(AG.etab).jours[jsem(d)] || []);
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
function evenements(du, au) {
  const out = [], ctx = D().ctx;
  D().patients.forEach((x) => {
    const P = x.P, nm = x.r.nm;
    if (AG.etab && x.doc.etablissementId !== AG.etab) return;
    if (A.voitRdv()) (P.rdvs || []).forEach((r) => {
      if (!r.d) return; const hs = typeRdv(r.type) === "hospit", f = hs && r.f && r.f >= r.d ? r.f : r.d;
      if (f < du || r.d > au) return;
      out.push({ pid: x.id, rid: r.id, cat: hs ? "ho" : "co", d: r.d, f, h: hs ? "" : r.h || "", nm, t: hs ? "Hospitalisation" : libRdv(r), st: r.st || "prevu", n: r.n || "" });
    });
    (P.lignes || []).forEach((L) => {
      if (L.arret) return; let p; try { p = protocoleDe(L, ctx.bib); } catch (e) { return; } if (!p) return;
      etatLigne(L, P, ctx).forEach((e) => {
        if (e.st === "annulee" || !e.date) return;
        if (e.date >= du && e.date <= au) out.push({ pid: x.id, cat: "ch", d: e.date, f: e.date, h: "", nm, t: "C" + e.n + "/" + L.cures.length + " · " + p.nom, st: e.st === "recue" ? "fait" : "prevu" });
        seancesCure(L, e, ctx.bib).forEach((s) => { if (s.st === "annulee") return; const d = s.st === "recue" && s.d ? s.d : s.prevue; if (d && d >= du && d <= au) out.push({ pid: x.id, cat: "ch", d, f: d, h: "", nm, t: "C" + e.n + " J" + s.j + " · " + p.nom, st: s.st === "recue" ? "fait" : "prevu" }); });
      });
    });
    if (A.voitRT(x)) (P.rts || []).forEach((r) => {
      const fin = r.fin || finRT(r, ctx.feries), a = r.acte || "Radiothérapie";
      const dz = dosimetrie(r, D().t); if (dz && dz.au >= du && dz.du <= au) out.push({ pid: x.id, cat: "rt", d: dz.du, f: dz.au, h: "", nm, t: "Dosimétrie à valider · " + a, st: "prevu" });
      [[r.scan, "Scanner de centrage"], [r.dosi, "Dosimétrie validée"], [r.deb, "1re séance"], [fin, r.fin ? "Fin de radiothérapie" : "Fin de radiothérapie prévue"]].forEach((z) => { if (z[0] && z[0] >= du && z[0] <= au) out.push({ pid: x.id, cat: "rt", d: z[0], f: z[0], h: "", nm, t: z[1] + " · " + a, st: r.fin && z[0] <= r.fin ? "fait" : "prevu" }); });
    });
  });
  return out.sort((a, b) => (a.d + (a.h || "")).localeCompare(b.d + (b.h || "")) || a.nm.localeCompare(b.nm));
}
const EM = { co: "🩺", ho: '<svg class="pi"><use href="#i-hopital"/></svg>', ch: "💉", rt: "☢️" };
const chip = (e, i) => '<button class="ev-c c-' + e.cat + (e.st === "fait" ? " fait" : e.st === "absent" ? " nv" : "") + '" onclick="agEv(' + i + ')" title="' + A.esc(e.nm + " – " + e.t) + '">' + EM[e.cat] + " <b>" + A.esc(e.nm) + "</b> " + A.esc(e.t) + "</button>";
const absence = (d) => (D().cal.abs || []).find((a) => d >= a.du && d <= a.au);
const ferie = (d) => (D().ctx.feries || []).find((f) => f.d === d);
let EVS = [];

// ───── Page ─────
export function pageAgenda() {
  if (!AG.d) { AG.d = D().t; }
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
  const onglet = (k, ico, t) => '<button class="' + (v === k ? "on" : "") + '" onclick="agVue(\'' + k + '\')">' + A.ic(ico) + t + "</button>";
  let h = '<section class="accueil"><div><h2>Agenda</h2><p>Vos prochains rendez-vous, regroupés par jour.</p></div><div class="actions"><button class="bt plein" onclick="nouveauRdv(null,null,\'' + esc(AG.etab || "") + '\')">' + A.ic("plus") + "Nouveau rendez-vous</button></div></section>" +
    '<div class="ag-barre"><div class="ag-vues">' + onglet("liste", "liste", "Liste") + onglet("jour", "agenda", "Jour") + onglet("semaine", "agenda", "Semaine") + onglet("mois", "accueil", "Mois") + "</div>" +
    '<div class="ag-nav"><button class="rond" onclick="agNav(-1)" aria-label="Précédent">' + A.ic("retour") + '</button><button class="bt clair petit" onclick="agAuj()">Aujourd\'hui</button><b>' + esc(lib) + '</b><button class="rond" onclick="agNav(1)" aria-label="Suivant" style="transform:scaleX(-1)">' + A.ic("retour") + "</button></div>" +
    (EV.length > 1 ? '<select class="ag-etab" aria-label="Établissement" onchange="agEtab(this.value)"><option value="">Tous les établissements</option>' + EV.map((c) => '<option value="' + esc(c) + '"' + (AG.etab === c ? " selected" : "") + ">" + esc(c) + "</option>").join("") + "</select>" : EV.length === 1 ? '<span class="badge b-gr">' + esc(EV[0]) + "</span>" : "") + "</div>" +
    '<div class="ag-corps"><aside class="ag-cote">' + cote + '</aside><div class="ag-main carte">' + main + "</div></div>" +
    ((D().profil.agendaGoogle || {}).email ? '<p class="mesures">Vos rendez-vous apparaissent aussi dans votre Google Agenda (agenda « Onco360 »), dans un seul sens. <a href="#profil" onclick="pfOnglet(\'gagenda\')">État</a></p>'
      : '<p class="mesures">Voir ces rendez-vous dans votre Google Agenda : <a href="#profil" onclick="pfOnglet(\'gagenda\')">Profil › Google Agenda</a>.</p>');
  A.$("page").innerHTML = h;
  const g = document.querySelector(".ag-grille"), deb = tout.length ? Math.min(...tout.map((p) => mn(p[0]))) : 8 * 60; if (g && !AG.defile) { g.scrollTop = (deb - H0 * 60) / 15 * PAS - 10; }
  AG.defile = false;
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
    const tim = parJour[k].filter(([e]) => e.h).map(([e, i]) => ({ e, i, a: mn(e.h), b: mn(e.h) + DUREE }));
    tim.forEach((o) => { o.col = 0; tim.forEach((p) => { if (p !== o && p.a < o.b && o.a < p.b && tim.indexOf(p) < tim.indexOf(o)) o.col++; }); });
    tim.forEach(({ e, i, a, col }) => { const top = (a - H0 * 60) / 15 * PAS; if (top < 0 || top > haut) return; c += '<button class="ev-g c-' + e.cat + (e.st === "fait" ? " fait" : e.st === "absent" ? " nv" : "") + '" style="top:' + top + "px;height:" + (DUREE / 15 * PAS - 2) + "px;left:" + (2 + col * 14) + 'px" onclick="event.stopPropagation();agEv(' + i + ')"><b>' + e.h + " " + A.esc(e.nm) + "</b><span>" + A.esc(e.t) + "</span></button>"; });
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
    h += '<div class="ev" onclick="agEv(' + i + ')"><span class="h' + (e.h ? "" : " j") + '">' + (e.h || "Journée") + "</span><span>" + EM[e.cat] + '</span><div class="tx"><b>' + A.esc(e.nm) + "</b><br><span>" + A.esc(e.t) + (e.st === "fait" ? " · fait" : e.st === "absent" ? " · non venu" : "") + '</span></div><button class="lien">Ouvrir</button></div>';
  });
  return h + "</div>";
}

// ───── Actions ─────
window.agVue = (v) => { AG.vue = v; pageAgenda(); };
window.agEtab = (c) => { AG.etab = c; pageAgenda(); };
window.agAuj = () => { AG.d = D().t; AG.mois = null; pageAgenda(); };
window.agNav = (s) => { const v = AG.vue; if (v === "mois") { const x = new Date(AG.d.slice(0, 8) + "01T12:00:00"); x.setMonth(x.getMonth() + s); AG.d = x.getFullYear() + "-" + ("0" + (x.getMonth() + 1)).slice(-2) + "-01"; } else AG.d = addJ(AG.d, s * (v === "jour" ? 1 : v === "semaine" ? 7 : 30)); AG.mois = null; pageAgenda(); };
window.agJour = (d, versJour) => { AG.d = d; AG.mois = null; if (versJour) AG.vue = "jour"; pageAgenda(); };
window.agMois = (s) => { const x = new Date((AG.mois || AG.d).slice(0, 8) + "01T12:00:00"); x.setMonth(x.getMonth() + s); AG.mois = x.getFullYear() + "-" + ("0" + (x.getMonth() + 1)).slice(-2) + "-01"; AG.defile = true; pageAgenda(); };
window.agCreneau = (ev, d) => {
  if (ev.target.closest(".ev-g")) return;
  const col = ev.currentTarget, y = ev.clientY - col.getBoundingClientRect().top, m = H0 * 60 + Math.floor(y / PAS) * 15;
  window.nouveauRdv(d, hh(Math.max(H0 * 60, Math.min(m, H1 * 60 - 15))), AG.etab || "");
};
window.agEv = (i) => {
  const e = EVS[i]; if (!e) return;
  if (!e.rid) { window.ouvrirDossier(e.pid); return; }
  const st = { prevu: "Prévu", fait: "Venu", absent: "Non venu" }[e.st] || e.st;
  A.fenetre("<h3>" + EM[e.cat] + " " + A.esc(e.nm) + '</h3><p class="sous">' + A.esc(e.t) + " · " + A.cap(A.jourLong(e.d)) + (e.h ? " à " + e.h : "") + (e.f && e.f !== e.d ? " → " + A.dfrA(e.f) : "") + " · " + st + (e.n ? "<br>" + A.esc(e.n) : "") + "</p>" +
    '<div class="boutons"><button class="bt gris" onclick="fermerFenetre()">Fermer</button><button class="bt clair" onclick="fermerFenetre();ouvrirDossier(\'' + e.pid + "')\">Ouvrir le dossier</button>" + (A.peut("rendezvous") ? '<button class="bt plein" onclick="ouvrirRdv(\'' + e.pid + "','" + e.rid + "')\">Modifier / décaler</button>" : "") + "</div>");
};
