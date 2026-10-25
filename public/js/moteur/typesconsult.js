// Onco360 – référentiel unique des types de consultation (3.13, 12/10/2026). Calculs purs, sans DOM ni Firebase.
// Avant : trois listes (types de rendez-vous = activités de chaque établissement, types du journal des consultations, durées par type).
// Maintenant une liste parametres/typesConsult { data: JSON [{ k, nom, rdv, anciens }] } :
//   k = clé du type (la même que l'activité des tarifs : annonce, suivi, controle, hospit, cchimio, rtc, rtf, ou celle d'une activité
//       ajoutée, ex. « 2avis » ; type du journal seulement : « j… ») ; nom = nom affiché partout (rendez-vous, journal, agenda, bilan) ;
//   rdv = proposé à la prise de rendez-vous ; anciens = noms d'avant (consultations déjà enregistrées sous l'ancien nom).
// Le reste est lu et écrit à sa place d'avant (rien à reprendre ailleurs) : durée → parametres/calendrier.durees[cle], formulaire →
// parametres/formulaires (consultation.typesForm[nom]), créé d'office → reglages.auto (rtHebdo, rtFin), prix → finances/tarifs.
// Sans liste enregistrée : construite depuis les activités des établissements et les types du journal (même contenu qu'avant).
export const T_RTC = "En cours de RT", T_RTF = "Fin de radiothérapie";
// Types de base : clé, nom de départ, pris en rendez-vous au départ, type du rendez-vous enregistré (r.type) ; cchimio : jamais en rendez-vous
export const STD = [
  ["annonce", "Consultation d'annonce", true, "Annonce"], ["suivi", "Consultation de suivi", true, "Suivi"],
  ["controle", "Consultation de contrôle", true, "Contrôle"], ["hospit", "Hospitalisation", true, "Hospitalisation"],
  ["cchimio", "Consultation de chimiothérapie", false, null], ["rtc", "Consultation en cours de radiothérapie", false, T_RTC],
  ["rtf", "Consultation de fin de radiothérapie", false, T_RTF],
];
// Créés d'office (Paramètres › Types de consultation, colonne « Créé d'office ») : réglage reglages.auto
export const AUTO = { rtc: ["rtHebdo", "chaque semaine de radiothérapie"], rtf: ["rtFin", "à la fin de la radiothérapie"] };
// Activités des tarifs qui ne sont pas des consultations
export const HORS_TYPES = ["seance", "rt"];
const STDK = STD.map((s) => s[0]);
export const estStd = (k) => STDK.indexOf(k) >= 0;
// Noms du journal d'avant qui correspondent à un type de base (les autres deviennent des types du journal)
const ALIAS = { "consultation annonce": "annonce", "consultation suivi": "suivi", "consultation controle": "controle", "consultation de fin de radiotherapie": "rtf" };
const sansAcc = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’']/g, "'").trim();
const propre = (s) => String(s || "").replace(/\s*\(par jour ouvré\)\s*$/i, "").replace(/\s+/g, " ").trim();
export const cleJournal = (nom) => "j" + sansAcc(nom).replace(/[^a-z0-9]+/g, "").slice(0, 20);
// Lot D (25/10/2026, demande de Dr Bentahila) : « RCP » et « Note du secrétariat » sont des notes du journal, jamais des rendez-vous : pas de
// durée, jamais proposés à la prise de rendez-vous, même dans une liste enregistrée avant
const NOTES = ["rcp", "note du secretariat"];
export const estNote = (nom) => NOTES.indexOf(sansAcc(propre(nom))) >= 0;

// Liste effective. enr = liste enregistrée (ou null) ; src = { acts: [[clé, nom]] (activités des établissements), journal: [noms] }
export function referentiel(enr, src) {
  const S = src || {}, out = [], vu = {};
  const met = (t) => { if (!t || !t.k || vu[t.k]) return; vu[t.k] = 1; out.push(t); };
  if (Array.isArray(enr) && enr.length) {
    enr.forEach((t) => { if (!t || typeof t.k !== "string" || !/^[a-z0-9_-]{1,30}$/i.test(t.k) || !propre(t.nom)) return;
      met({ k: t.k, nom: propre(t.nom).slice(0, 80), rdv: t.k === "cchimio" || estNote(t.nom) ? false : t.rdv !== false, anciens: Array.isArray(t.anciens) ? t.anciens.map(propre).filter(Boolean).slice(0, 20) : [] }); });
    STD.forEach(([k, nom, rdv]) => met({ k, nom, rdv, anciens: [] })); // type de base absent (liste ancienne) : remis
    return out;
  }
  STD.forEach(([k, nom, rdv]) => met({ k, nom, rdv, anciens: [] }));
  (S.acts || []).forEach(([k, nom]) => { if (!k || HORS_TYPES.indexOf(k) >= 0 || estStd(k)) return; met({ k: String(k), nom: propre(nom) || String(k), rdv: true, anciens: [] }); });
  (S.journal || []).forEach((n) => { n = propre(n); if (!n || trouverNom(out, n)) return; const a = ALIAS[sansAcc(n).replace(/^consultation (d'|de )/, "consultation ")];
    if (a) { const t = out.find((z) => z.k === a); if (t && sansAcc(t.nom) !== sansAcc(n)) t.anciens.push(n); return; }
    met({ k: cleJournal(n), nom: n, rdv: false, anciens: [] }); });
  return out;
}
// Type d'un nom (actuel ou ancien), sans tenir compte des accents ni de la casse
export function trouverNom(L, nom) { const n = sansAcc(propre(nom)); return (L || []).find((t) => sansAcc(t.nom) === n || (t.anciens || []).some((a) => sansAcc(a) === n)) || null; }
// Nom actuel d'un type enregistré sous un ancien nom (journal des consultations) ; inconnu : tel quel
export const nomActuel = (L, nom) => { const t = trouverNom(L, nom); return t ? t.nom : nom; };
// Clé du type d'un rendez-vous enregistré
export function cleDeRdv(r) {
  if (!r) return "suivi"; if (r.act) return r.act; if (r.type === T_RTC) return "rtc"; if (r.type === T_RTF) return "rtf";
  const s = STD.find((z) => z[3] === r.type); return s ? s[0] : "suivi";
}
// Clé de durée (parametres/calendrier.durees) et valeur de la liste « Type » de la fenêtre du rendez-vous : « s:Annonce » | « a:2avis »
export const cleDuree = (k) => { const s = STD.find((z) => z[0] === k); return s && s[3] ? "s:" + s[3] : "a:" + k; };
// Types proposés à la prise de rendez-vous : { v, lib, act, type }
export const typesPourRdv = (L) => (L || []).filter((t) => t.rdv && t.k !== "cchimio").map((t) => { const s = STD.find((z) => z[0] === t.k);
  return s ? { v: "s:" + s[3], lib: t.nom, act: null, type: s[3] } : { v: "a:" + t.k, lib: t.nom, act: t.k, type: t.nom }; });
// Noms par clé (affichage des rendez-vous : moteur/rdv.js nommerTypes)
export const nomsParCle = (L) => Object.fromEntries((L || []).map((t) => [t.k, t.nom]));
// Nouveau type : clé tirée du nom, unique
export function nouvelleCle(L, nom) { const b = sansAcc(nom).replace(/[^a-z0-9]+/g, "").slice(0, 16) || "type"; let k = b, i = 2; while ((L || []).some((t) => t.k === k) || estStd(k)) k = b + i++; return k; }
// Renommer : l'ancien nom est gardé (consultations déjà enregistrées) ; revenir à un ancien nom le retire des anciens
export function renommer(t, nom) { nom = propre(nom).slice(0, 80); if (!nom || nom === t.nom) return t; const an = (t.anciens || []).filter((a) => sansAcc(a) !== sansAcc(nom)); if (an.every((a) => sansAcc(a) !== sansAcc(t.nom))) an.push(t.nom); return Object.assign({}, t, { nom, anciens: an }); }
// Enregistrement : [{ k, nom, rdv, anciens? }]
export const aEnregistrer = (L) => (L || []).map((t) => Object.assign({ k: t.k, nom: t.nom, rdv: !!t.rdv }, t.anciens && t.anciens.length ? { anciens: t.anciens } : {}));
