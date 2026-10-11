// Onco360 – salle d'attente : calculs purs, sans écran ni Firebase (SA7, 11/10/2026), utilisés par js/app/salle.js et testés
// sans navigateur par tests/moteur/test-salle.mjs : lignes d'un ou plusieurs jours, période, recherche, place dans la file, tri.
import { typeRdv, libRdv, T_RTC } from "./rdv.js";
import { etatLigne, protocoleDe, seancesCure } from "./doses.js";

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");
export const sansAcc = (x) => String(x || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
export const idDoc = (jour, pid, cle) => jour + "_" + pid + "_" + cle;
export const MIDI = "13:00"; // Matinée : avant 13 h ; Après-midi : à partir de 13 h

// Libellé court du type de consultation et couleur de son badge (chimiothérapie = chimio, hebdomadaire = hebdo, 08/10/2026)
export function typeCourt(v) {
  if (v.type === T_RTC) return ["RT hebdo", "b-rt"];
  if (v.act) return [cap(String(v.type || "Consultation").replace(/^consultation\s+(de\s+|d')?/i, "").replace(/chimioth[ée]rapie/gi, "chimio").replace(/radioth[ée]rapie/gi, "RT").replace(/hebdomadaire/gi, "hebdo")), "b-gr"];
  const t = typeRdv(v.type);
  return t === "annonce" ? ["Annonce", "b-or"] : t === "controle" ? ["Contrôle", "b-gr"] : [cap(String(v.type || "Suivi").toLowerCase()), "b-co"];
}

// Lignes de la salle d'attente pour des jours donnés : rendez-vous de consultation (pas les hospitalisations ni les reportés)
// et séances de chimiothérapie (J1, J8…). Une ligne = { jour, cle, pid, x, h, type, cls, motif, etat, derive, orphelin, doc,
// rdv | chimio }.
// o = { patients [{ id, P, doc, r }], jours [AAAA-MM-JJ], ctx (aujourdhui, bib, feries), doc(id) → document de la salle,
//       docs (tous les documents lus), voitChimio, consPaye(x, lid, n, j) → la consultation de chimio a-t-elle son prix ? (ou null) }
export function lignesSalle(o) {
  const J = new Set(o.jours), out = [], t = o.ctx.aujourdhui, docDe = (id) => o.doc(id) || {};
  o.patients.forEach((x) => {
    const P = x.P;
    (P.rdvs || []).forEach((v) => {
      if (!J.has(v.d) || typeRdv(v.type) === "hospit" || v.st === "reporte") return;
      const cle = "r-" + v.id, sd = docDe(idDoc(v.d, x.id, cle)), [type, cls] = typeCourt(v);
      // le rendez-vous fait foi pour Vu et Absent ; En salle et En consultation viennent du document de la salle
      const etat = v.st === "fait" ? "vu" : v.st === "absent" ? "absent" : sd.etat || "";
      out.push({ jour: v.d, cle, pid: x.id, x, h: v.h || "", type, cls, motif: v.mo || v.n || "", etat, doc: sd, rdv: v });
    });
    if (!o.voitChimio) return;
    (P.lignes || []).forEach((L) => {
      let pn = "", E = []; try { pn = protocoleDe(L, o.ctx.bib).nom; E = etatLigne(L, P, o.ctx); } catch (er) { return; }
      E.forEach((e) => {
        if (e.st !== "recue" && e.st !== "prevue") return;
        const jl = [];
        if ((e.st === "prevue" && J.has(e.date) && !L.arret) || (e.st === "recue" && J.has(e.c.reelle))) jl.push({ j: 1, d: e.st === "recue" ? e.c.reelle : e.date, recue: e.st === "recue" });
        seancesCure(L, e, o.ctx.bib).forEach((s) => { if ((s.st === "prevue" && J.has(s.prevue) && !L.arret) || (s.st === "recue" && J.has(s.d))) jl.push({ j: s.j, d: s.st === "recue" ? s.d : s.prevue, recue: s.st === "recue" }); });
        jl.forEach(({ j, d, recue }) => {
          const cle = "c-" + L.id + "-" + e.n + "-" + j, sd = docDe(idDoc(d, x.id, cle));
          // venue déjà notée ailleurs (avant la salle d'attente, ou depuis le dossier) : « Vu » si la consultation de chimio a son
          // prix, ou, pour un jour passé, si la cure / séance est validée (reçue)
          let etat = sd.etat || "", derive = false;
          if (!etat && recue && d < t) { etat = "vu"; derive = true; }
          if (!etat && recue && o.consPaye && o.consPaye(x, L.id, e.n, j)) { etat = "vu"; derive = true; }
          out.push({ jour: d, cle, pid: x.id, x, h: "", type: "Séance chimio", cls: "b-ch", motif: sd.motif || pn + " · C" + e.n + " J" + j, etat, derive, doc: sd, chimio: { lid: L.id, n: e.n, j, recue, lib: pn } });
        });
      });
    });
  });
  // séance de chimio marquée absente puis reportée : plus prévue ce jour-là, mais gardée dans « Absents »
  for (const d of o.docs || []) {
    if (!d || d.etat !== "absent" || !J.has(d.jour) || String(d.cle || "").indexOf("c-") !== 0 || out.some((z) => z.jour === d.jour && z.pid === d.patientId && z.cle === d.cle)) continue;
    const x = o.patients.find((p) => p.id === d.patientId), m = /^c-(.+)-(\d+)-(\d+)$/.exec(d.cle); if (!x || !m) continue;
    out.push({ jour: d.jour, cle: d.cle, pid: x.id, x, h: "", type: "Séance chimio", cls: "b-ch", motif: d.motif || "", etat: "absent", doc: d, orphelin: true, chimio: { lid: m[1], n: +m[2], j: +m[3], recue: false } });
  }
  return out;
}

// Onglet d'une ligne
export const ongletDe = (l) => (l.etat === "vu" ? "vus" : l.etat === "absent" ? "absents" : l.etat === "salle" || l.etat === "consult" ? "salle" : "avenir");
// Onglet d'ouverture (SA9a, audit externe 11/10/2026) : « En salle » s'il y a quelqu'un (ce que cherche le médecin), sinon le premier
// onglet non vide (À venir, Vus, Absents) ; tout vide : À venir. n = { avenir, salle, vus, absents } (nombres de lignes)
export const ongletOuverture = (n) => (n.salle ? "salle" : n.avenir ? "avenir" : n.vus ? "vus" : n.absents ? "absents" : "avenir");
// Période : heure du rendez-vous, sinon d'arrivée (hm = ms → « HH:MM ») ; sans heure : toujours affichée
export function dansPeriode(l, per, hm) { const h = l.h || (l.doc.arr ? hm(l.doc.arr) : ""); return per === "jour" || !h || (per === "matin" ? h < MIDI : h >= MIDI); }
// Recherche : nom, n° de dossier, téléphone (chiffres seuls : « 0661 » trouve « 06 61 … »)
export function correspond(l, q) {
  const m = sansAcc(q).split(/\s+/).filter(Boolean); if (!m.length) return true;
  const I = (l.x.doc && l.x.doc.identite) || {}, hay = sansAcc(l.x.r.nm + " " + (I.numero || "")), tel = String((l.x.P.tel || "") + " " + (I.tel2 || "")).replace(/\D/g, "");
  return m.every((w) => hay.indexOf(w) >= 0 || (/^\d+$/.test(w) && w.length >= 3 && tel.indexOf(w.replace(/^0/, "")) >= 0));
}
// Place dans la file (ms) : rang posé à la main (flèches), sinon heure d'arrivée ou du rendez-vous selon le tri
export function cleNum(l, tri) { if (l.doc.rang != null) return l.doc.rang; const r = l.h ? new Date(l.jour + "T" + l.h + ":00").getTime() : null; return tri === "arrivee" ? l.doc.arr || r || 9e15 : r || l.doc.arr || 9e15; }
// Tri d'un onglet : chimio en tête d'« À venir » ; « En salle » : en consultation d'abord, puis la file ; « Vus » : ordre de fin
export function trierSalle(l, vue, tri, hm) {
  const hh = (z) => z.h || (z.doc.arr ? hm(z.doc.arr) : "99:99"), nom = (a, b) => a.x.r.nm.localeCompare(b.x.r.nm);
  const cle = (a, b) => (tri === "alpha" ? nom(a, b) : tri === "arrivee" ? (a.doc.arr || 9e15) - (b.doc.arr || 9e15) || hh(a).localeCompare(hh(b)) : hh(a).localeCompare(hh(b))) || nom(a, b);
  if (vue === "salle") return l.sort((a, b) => (a.etat === "consult" ? 0 : 1) - (b.etat === "consult" ? 0 : 1) || (b.doc.urgent ? 1 : 0) - (a.doc.urgent ? 1 : 0) || (tri === "alpha" ? cle(a, b) : cleNum(a, tri) - cleNum(b, tri) || nom(a, b)));
  if (vue === "vus" && tri !== "alpha") return l.sort((a, b) => (a.doc.fin || 0) - (b.doc.fin || 0) || cle(a, b));
  if (vue === "avenir") return l.sort((a, b) => (a.chimio ? 0 : 1) - (b.chimio ? 0 : 1) || cle(a, b));
  return l.sort(cle);
}
// Durée en minutes → « hh:mm »
export const hhmm = (m) => (m == null ? "" : String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0"));
