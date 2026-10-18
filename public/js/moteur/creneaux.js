// Onco360 – ce qui occupe un médecin un jour donné (R-A3, 18/10/2026, demande du cabinet du 17/10 ; audit n° 4, décision 3) : calcul pur,
// sans DOM ni Firebase (test : tests/moteur/test-creneaux.mjs). Sert aux créneaux et aux chevauchements partout où l'on place une
// consultation (Nouveau rendez-vous, Modifier, glisser-déposer, report après « Non venu », heure de la consultation d'une séance de chimio,
// étape de radiothérapie).
// • avec une heure (prennent un créneau) : rendez-vous de consultation ; consultation d'une séance de chimiothérapie (heure choisie, sinon
//   placée 15 min avant la séance notée par l'infirmière : événement « c » / « s » du résumé, durée `dur`, 15 min par défaut) ; étape de
//   radiothérapie qui a une heure (scanner, 1re séance, fin) ;
// • sans heure (ne prennent pas de créneau, listées dans la fenêtre) : rendez-vous sans heure, consultations de chimio sans heure.
// Hospitalisations et rendez-vous « absent » ne comptent pas. À partir de 2 médecins, seulement ce qui est à ce médecin (sans médecin noté :
// le titulaire).
import { typeRdv, libRdv } from "./rdv.js";

export const mnH = (h) => { const p = String(h || "").split(":"); return +p[0] * 60 + (+p[1] || 0); };
export const DU_CONS_CHIMIO = 15;
const ETAPES_RT = { scan: "Scanner de centrage", deb: "1re séance de radiothérapie", fin: "Fin de radiothérapie" };

// pats : [{ id, nm, etab, rdvs: P.rdvs, ag: résumé.ag }] ; o = { sauf: { pid, rid } | { pid, k }, med, multi, titulaire, dureeDe(r, etab) }
export function occupations(pats, d, o) {
  o = o || {}; const avec = [], sans = [], sauf = o.sauf || null, tit = o.titulaire || "";
  const autreMed = (m) => !!(o.med && o.multi && (m || tit) !== o.med);
  (pats || []).forEach((x) => {
    (x.rdvs || []).forEach((r) => {
      if (r.d !== d || typeRdv(r.type) === "hospit" || r.st === "absent" || autreMed(r.med)) return;
      if (sauf && sauf.pid === x.id && sauf.rid && sauf.rid === r.id) return;
      const z = { pid: x.id, nm: x.nm, lib: libRdv(r), k: x.id + "|r|" + (r.id || r.d), quoi: "rdv" };
      if (r.h) avec.push(Object.assign(z, { h: r.h, du: o.dureeDe ? o.dureeDe(r, x.etab) : +r.du || 30 })); else sans.push(z);
    });
    (x.ag || []).forEach((e) => {
      const p = String(e.k || "").split("|"); if (e.d !== d || autreMed(e.m)) return;
      if (sauf && sauf.pid === x.id && sauf.k && sauf.k === e.k) return;
      if (p[1] === "c" || p[1] === "s") {
        const z = { pid: x.id, nm: x.nm, lib: "C" + p[3] + " J" + (p[1] === "s" ? p[4] : 1) + " (consultation de chimio)", k: e.k, quoi: "chimio" };
        if (e.h) avec.push(Object.assign(z, { h: e.h, du: +e.dur || DU_CONS_CHIMIO })); else sans.push(z);
      } else if (p[1] === "rt" && e.h && ETAPES_RT[p[3]]) avec.push({ pid: x.id, nm: x.nm, lib: ETAPES_RT[p[3]], k: e.k, quoi: "rt", h: e.h, du: +e.dur || 30 });
    });
  });
  avec.sort((a, b) => a.h.localeCompare(b.h)); return { avec, sans };
}
// Ce qui chevauche [h, h + du[
export const chevauche = (avec, h, du) => (h ? avec.filter((z) => mnH(z.h) < mnH(h) + (+du || 0) && mnH(h) < mnH(z.h) + z.du) : []);
// Texte de l'avertissement (un clic : « garder quand même ? »)
export const texteConflit = (cf) => cf.map((z) => z.h + " " + z.nm + " – " + z.lib).join(" ; ");
