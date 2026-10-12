// Onco360 – heures d'une séance de chimiothérapie (12/10/2026, décision de Dr Bentahila) : deux créneaux, calculs purs (test-heures.mjs).
// • consultation de séance de chimio (médecin) : heure choisie par le médecin (ou la secrétaire) à la validation de la séance d'avant
//   ou depuis la cure ; seule affichée dans le planning du médecin (jamais la durée de la chimio) ;
// • séance à l'hôpital de jour (infirmière) : heure et durée, ajoutées par l'infirmière depuis son planning, après la consultation.
// Sans heure choisie par le médecin, la consultation se place d'elle-même juste avant la séance de l'infirmière (et la suit si elle
// change) ; l'infirmière n'écrase jamais une heure choisie par le médecin.
// Dossier : heures { "ligne|cure|jour": { cons: { h, du, par, parNom, le } | null, seance: { h, du, par, parNom, le } | null } }.
export const DU_CONS = 15, DU_SEANCE = 120;
const min = (h) => { const m = String(h || "").match(/^(\d{1,2}):(\d{2})/); return m ? +m[1] * 60 + +m[2] : null; };
export const hhmm = (m) => { m = Math.max(0, Math.min(23 * 60 + 59, m)); return ("0" + Math.floor(m / 60)).slice(-2) + ":" + ("0" + (m % 60)).slice(-2); };
export const decaler = (h, d) => (min(h) == null ? "" : hhmm(min(h) + d));

// Nouvelle entrée après une saisie : o = { cons: "HH:MM" | "" (retirée) } (médecin, secrétaire) et / ou { seance: { h, du } | null }
// (infirmière) ; signe = { par, parNom, le }
export function noterHeures(v, o, signe) {
  const r = Object.assign({}, v || {});
  if (o.cons !== undefined) r.cons = o.cons ? Object.assign({ h: o.cons, du: DU_CONS }, signe) : null;
  if (o.seance !== undefined) r.seance = o.seance && o.seance.h ? Object.assign({ h: o.seance.h, du: +o.seance.du || DU_SEANCE }, signe) : null;
  return r;
}
// Consultation affichée : celle choisie par le médecin, sinon juste avant la séance de l'infirmière (auto), sinon aucune
export function consultationDe(cons, seance) {
  if (cons && cons.h) return Object.assign({}, cons, { du: +cons.du || DU_CONS, auto: false });
  if (seance && seance.h) return { h: decaler(seance.h, -DU_CONS), du: DU_CONS, auto: true };
  return null;
}
// Heure proposée à l'infirmière pour la séance : juste après la consultation
export const seanceProposee = (cons) => (cons && cons.h ? decaler(cons.h, +cons.du || DU_CONS) : "");
