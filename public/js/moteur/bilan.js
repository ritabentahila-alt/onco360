// Chimio HGC v2 – BILAN (règle E10) : période, filtres, totaux, payé / à recevoir. Calcul pur, sans affichage.
import { num, addJ } from "./outils.js";
export const sansAcc = (x) => String(x || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
export const dh = (n) => (n == null || isNaN(n) ? "—" : Math.round(n).toLocaleString("fr-FR") + " DH");
const libV = (e) => { const l = (e.lib || "").trim(); return !l || l === "Versement KL" ? "KL" : l; };
export const clePaye = (o) => (o.id || "KL") + "|" + o.t + "|" + o.d + "|" + o.lib;
export const estPaye = (o, paiements) => o.t === "kl" || !!paiements[clePaye(o)];

// Bornes de la période : semaine, mois, moisprec, annee, ou dates libres
export function periode(f, aujourdhui) {
  const t = aujourdhui, d = new Date(t + "T12:00:00"), y = d.getFullYear(), m = d.getMonth(), p = (n) => (n < 10 ? "0" : "") + n;
  if (f.per === "semaine") { const w = (d.getDay() + 6) % 7, a = addJ(t, -w); return [a, addJ(a, 6)]; }
  if (f.per === "mois") return [y + "-" + p(m + 1) + "-01", y + "-" + p(m + 1) + "-" + p(new Date(y, m + 1, 0).getDate())];
  if (f.per === "moisprec") { const y2 = m ? y : y - 1, m2 = m ? m - 1 : 11; return [y2 + "-" + p(m2 + 1) + "-01", y2 + "-" + p(m2 + 1) + "-" + p(new Date(y2, m2 + 1, 0).getDate())]; }
  if (f.per === "annee") return [y + "-01-01", y + "-12-31"];
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
      const o = { d: e[0], t: e[1], hop: e[2] || "", lib: e[3], brut: e[4], taux: e[5], net: e[6], st: e[7], nm: x.nm, id: x.id };
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
