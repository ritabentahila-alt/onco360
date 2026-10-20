// Chimio HGC v2 – BILAN (règle E10) : période, filtres, totaux, payé / à recevoir. Calcul pur, sans affichage.
import { num, addJ } from "./outils.js";
export const sansAcc = (x) => String(x || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
export const dh = (n) => (n == null || isNaN(n) ? "—" : Math.round(n).toLocaleString("fr-FR") + " DH");
const libV = (e) => { const l = (e.lib || "").trim(); return !l ? "Versement" : l === "Versement KL" ? "KL" : l; }; // « KL » : anciens versements du cabinet Bentahila
// Case « Payé » d'un acte (finances/paiements) : « patient#identifiant de l'acte » (15 bis, 10/10/2026) ; avant : « patient|type|date|
// libellé » (cleAncienne), perdue quand la date ou le libellé changeaient ; encore lue tant que migrerPaiements ne l'a pas remplacée.
export const cleAncienne = (o) => (o.id || "KL") + "|" + o.t + "|" + o.d + "|" + o.lib;
export const clePaye = (o) => (o.a ? (o.id || "KL") + "#" + o.a : cleAncienne(o));
export const estPaye = (o, paiements) => o.t === "kl" || !!paiements[clePaye(o)] || !!paiements[cleAncienne(o)];
// Reprise des cases « Payé » à l'ancienne clé vers la nouvelle (une fois ; mêmes actes payés, donc même bilan). resumes : [{id, fin}]
export function migrerPaiements(resumes, paiements) {
  const p = Object.assign({}, paiements), vieilles = new Set(); let n = 0;
  resumes.forEach((x) => (x.fin || []).forEach((e) => {
    if (!e[9]) return; const o = { id: x.id, t: e[1], d: e[0], lib: e[3], a: e[9] }, v = cleAncienne(o);
    if (p[v] != null) { if (p[clePaye(o)] == null) { p[clePaye(o)] = p[v]; n++; } vieilles.add(v); }
  }));
  vieilles.forEach((v) => { delete p[v]; });
  return { p, change: n > 0 || vieilles.size > 0 };
}

// ───── Cases « Payé » rangées par année (R-D4, 20/10/2026, audit n° 6, d. 16) ─────
// finances/paiements_AAAA = cases des actes datés de l'année AAAA ; finances/paiements = ancien document unique (cases d'avant le
// rangement, ou d'un acte introuvable). Un document Firestore tient au plus 1 Mo : alerte à 70 %.
export const RE_DOC_PAYE = /^paiements(_\d{4})?$/;
export const docPaiements = (d) => (/^\d{4}/.test(d || "") ? "paiements_" + String(d).slice(0, 4) : "paiements");
// Toutes les cases, quel que soit leur document (l'ancien d'abord, les années ensuite)
export const fusionnerPaiements = (docs) => Object.assign({}, ...Object.keys(docs || {}).sort().map((k) => docs[k] || {}));
const tri = (o) => JSON.stringify(Object.keys(o || {}).sort().map((k) => [k, o[k]]));
// Rangement : anciennes clés reprises (migrerPaiements), puis chaque case dans le document de l'année de son acte ; une case dont l'acte
// est introuvable (dossier supprimé, hors des établissements du membre) reste là où elle est. Rien de perdu, rien de dédoublé.
export function repartirPaiements(resumes, docs) {
  docs = docs || {}; const tout = fusionnerPaiements(docs), m = migrerPaiements(resumes, tout).p, an = {}, ou = {};
  resumes.forEach((x) => (x.fin || []).forEach((e) => { if (!e[9] || e[1] === "rtprev") return; const k = clePaye({ id: x.id, a: e[9] }); if (m[k] != null) an[k] = docPaiements(e[0]); }));
  Object.keys(docs).sort().forEach((id) => Object.keys(docs[id] || {}).forEach((k) => { ou[k] = id; }));
  const out = {}; Object.keys(docs).forEach((id) => { out[id] = {}; });
  Object.keys(m).forEach((k) => { const id = an[k] || ou[k] || "paiements"; (out[id] = out[id] || {})[k] = m[k]; });
  return { docs: out, change: Object.keys(out).some((id) => tri(out[id]) !== tri(docs[id])) };
}
// Place prise par chaque document de cases (octets du texte enregistré) : ceux qui dépassent 70 % de 1 Mo
export const LIMITE_DOC = 1048576;
export function placePaiements(docs, seuil = 70) {
  const oct = (t) => (typeof TextEncoder !== "undefined" ? new TextEncoder().encode(t).length : t.length);
  return Object.keys(docs || {}).sort().map((id) => ({ id, pct: Math.round((oct(JSON.stringify(docs[id] || {})) + 200) / LIMITE_DOC * 1000) / 10 })).filter((x) => x.pct >= seuil);
}

// Bornes de la période : semaine, mois, moisprec, annee, ou dates libres
export function periode(f, aujourdhui) {
  const t = aujourdhui, d = new Date(t + "T12:00:00"), y = d.getFullYear(), m = d.getMonth(), p = (n) => (n < 10 ? "0" : "") + n;
  if (f.per === "semaine") { const w = (d.getDay() + 6) % 7, a = addJ(t, -w); return [a, addJ(a, 6)]; }
  if (f.per === "mois") return [y + "-" + p(m + 1) + "-01", y + "-" + p(m + 1) + "-" + p(new Date(y, m + 1, 0).getDate())];
  if (f.per === "moisprec") { const y2 = m ? y : y - 1, m2 = m ? m - 1 : 11; return [y2 + "-" + p(m2 + 1) + "-01", y2 + "-" + p(m2 + 1) + "-" + p(new Date(y2, m2 + 1, 0).getDate())]; }
  if (f.per === "annee") return [y + "-01-01", y + "-12-31"];
  // 15 bis B3 (10/10/2026) : trimestre en cours / dernier, année dernière, une année au choix (« a2025 »)
  if (f.per === "trim" || f.per === "trimprec") { let q = Math.floor(m / 3), y2 = y; if (f.per === "trimprec") { q--; if (q < 0) { q = 3; y2--; } } return [y2 + "-" + p(3 * q + 1) + "-01", y2 + "-" + p(3 * q + 3) + "-" + p(new Date(y2, 3 * q + 3, 0).getDate())]; }
  if (f.per === "anneeprec") return [(y - 1) + "-01-01", (y - 1) + "-12-31"];
  if (/^a\d{4}$/.test(f.per || "")) return [f.per.slice(1) + "-01-01", f.per.slice(1) + "-12-31"];
  return [f.du || "0000-01-01", f.au || "9999-12-31"];
}

// resumes : [{id, nm, cor, fin}] ; versements : [{d, m, lib}] ; paiements : {cle: date}
// filtre : {per, du, au, hop, typ, q, cor, pay}
export function calculerBilan(resumes, versements, paiements, filtre, aujourdhui) {
  const F = Object.assign({ per: "mois", du: "", au: "", hop: "tous", typ: "tous", q: "", cor: "tous", pay: "tous" }, filtre);
  const pr = periode(F, aujourdhui); let all = []; const prev = []; let manque = 0;
  const corOK = (x) => F.cor === "tous" || (x.cor || "") === F.cor;
  resumes.forEach((x) => {
    if (!x.fin) { manque++; return; } if (!corOK(x)) return;
    x.fin.forEach((e) => {
      const o = { d: e[0], t: e[1], hop: e[2] || "", lib: e[3], brut: e[4], taux: e[5], net: e[6], st: e[7], nm: x.nm, id: x.id, a: e[9] || "", sansT: !!e[10] };
      if (F.hop !== "tous" && (o.hop || "—") !== F.hop) return;
      if (F.typ !== "tous" && !(F.typ === "rt" ? /^rt/.test(o.t) : o.t === F.typ)) return;
      if (F.q && sansAcc(o.lib + " " + o.nm).indexOf(sansAcc(F.q)) < 0) return;
      if (o.t === "rtprev") { prev.push(o); return; }
      if (o.d && o.d >= pr[0] && o.d <= pr[1]) all.push(o);
    });
  });
  if (F.cor === "tous") (versements || []).forEach((e) => {
    const o = { d: e.d, t: "kl", hop: "", lib: "Autre versement – " + libV(e), brut: e.m, taux: 100, net: e.m, st: "Reçu", nm: "—", id: null };
    if (F.hop !== "tous" && F.hop !== "—") return; if (F.typ !== "tous" && F.typ !== "kl") return;
    if (F.q && sansAcc(o.lib).indexOf(sansAcc(F.q)) < 0) return; if (o.d >= pr[0] && o.d <= pr[1]) all.push(o);
  });
  if (F.pay !== "tous") all = all.filter((o) => (F.pay === "paye" ? estPaye(o, paiements) : !estPaye(o, paiements)));
  all.sort((a, b) => a.d.localeCompare(b.d));
  const som = (f) => all.filter(f).reduce((a, o) => a + (num(o.net) || 0), 0), nb = (f) => all.filter(f).length;
  const CONS = (o) => !/^(seance|hospit|rt|rtprev|kl)$/.test(o.t); // consultations, y compris les activités ajoutées (2nd avis…)
  const tot = {
    caNet: som(() => true), nbActes: all.length,
    chimio: som((o) => o.t === "seance"), nbChimio: nb((o) => o.t === "seance"),
    consultations: som(CONS), nbConsultations: nb(CONS),
    hospit: som((o) => o.t === "hospit"), nbHospit: nb((o) => o.t === "hospit"),
    rt: som((o) => o.t === "rt"), nbRt: nb((o) => o.t === "rt"),
    versements: som((o) => o.t === "kl"), nbVersements: nb((o) => o.t === "kl"),
    paye: som((o) => estPaye(o, paiements)), aRecevoir: som((o) => !estPaye(o, paiements)),
    cchimio: som((o) => o.t === "cchimio"), annonce: som((o) => o.t === "annonce"), suivi: som((o) => o.t === "suivi"), controle: som((o) => o.t === "controle"),
    nbPrev: prev.length, netPrev: prev.reduce((a, o) => a + (num(o.net) || 0), 0),
  };
  return { pr, all, prev, manque, tot };
}

// Texte des totaux, identique à la carte de la v1 (sert aux tests de concordance)
export function texteTotaux(T) {
  const s = dh(T.caNet) + " CA NET médecin " + dh(T.chimio) + " Chimio – " + T.nbChimio + " séance(s) " + dh(T.consultations) + " Consultations – " + T.nbConsultations + " " +
    dh(T.hospit) + " Hospitalisations – " + T.nbHospit + " " + dh(T.rt) + " Radiothérapie – " + T.nbRt + " terminée(s) " + dh(T.versements) + " Autres versements – " + T.nbVersements +
    " ✅ Payé : " + dh(T.paye) + " ⏳ À recevoir : " + dh(T.aRecevoir) +
    " Consultations : chimio " + dh(T.cchimio) + " · annonce " + dh(T.annonce) + " · suivi " + dh(T.suivi) + " · contrôle " + dh(T.controle) +
    (T.nbPrev ? " ☢️ Radiothérapies en cours ou prévues (non comptées) : " + T.nbPrev + " – NET prévisionnel " + dh(T.netPrev) : "");
  return s.replace(/\s+/g, " ").trim();
}
