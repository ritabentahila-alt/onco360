// Onco360 – page « Paramètres » (Configuration et Paramètres fusionnés le 08/10/2026, P2) : créneaux et horaires, absences
// (fermetures, congés, congrès), jours fériés, WhatsApp, Google Agenda, types de documents et de tâches, impression, alertes ;
// onglet « Activités et rémunérations » (droit « finances ») = ancienne page Paramètres (parametres.js).
// Tout est enregistré dans parametres/calendrier (même document que l'application actuelle : feries, abs) + horaires.
// Couleurs Google Agenda (08/10/2026) : parametres/couleursAgenda { data: JSON { catégorie: "1"…"11" | "" } } (seulement ce
// qui diffère des couleurs par défaut, les mêmes que COULEURS0 dans functions/logique.js) ; repeint par agendaCouleurs.
import { doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db, app } from "../config.js";
import { FERIES0 } from "../donnees/listes.js";
import { dureeRdv } from "../moteur/rdv.js";
import { typesDocuments, enregistrerTypes, TYPES_DOCUMENTS0 } from "./fichiers.js";
import { typesTaches, enregistrerTypesTaches, TYPES_TACHES0, TYPE_RT, listeMembres } from "./taches.js";
import { reglages, enregistrerReglages, REGLAGES0 } from "./reglages.js";
import { pageParametres } from "./parametres.js";
import { installer as installerLabos, pageLaboratoires } from "./laboratoires.js";
import { listeDiag, listeMut, listeCor, LISTES0 } from "./chimio.js";
import { LISTES_MED, listeMed, departMed, elements as elementsMed } from "./infosmed.js"; // lot A §6 : listes des informations médicales
import { gererListe, tailleListe } from "./ordonnances.js";
import { installer as installerRecuperation, htmlRecuperation, afficherRecuperation, appelLong } from "./recuperation.js";
import { htmlOngletProfil, apresOngletProfil, titulaireConnecte } from "./profil.js";
import { afficherAudit } from "./audit.js"; // onglet « Journal d'audit » (titulaire, 09/10/2026)
import { configRcp, configChargee, chargerConfigRcp, enregistrerConfigRcp, prochainesRcp, CFG0 as RCP0, libDate } from "./rcp.js";
import { CARTES, accueilEffectif, FICHE, CONSULT, STADES, GRADES, formEffectif, ficheEffective, consultEffective, ficheRetouches, formRetouches, formSpecialite, formulairesDe, formDuType, FAMILLES_SECTIONS } from "../donnees/catalogue.js";
import { editeurFiche } from "./editeurfiche.js";
import { estStd, estNote, AUTO as AUTO_TY, cleDuree, renommer, nouvelleCle, aEnregistrer } from "../moteur/typesconsult.js";
import { htmlVigilances } from "./vigilances.js"; // notes « À vérifier » par molécule (12/10/2026) // fiche patient et formulaire de consultation du cabinet (11/10/2026)

let A = null;
export function installer(api) { A = api; installerLabos(api); A.enteteParametres = () => entete(); A.pageParametres = () => pageConfiguration(); installerRecuperation(api); }
const D = () => A.D();
const JOURS = [[1, "Lundi"], [2, "Mardi"], [3, "Mercredi"], [4, "Jeudi"], [5, "Vendredi"], [6, "Samedi"], [0, "Dimanche"]];
const TYPES = ["Congé", "Congrès", "Voyage", "Formation", "Fermeture du cabinet", "Autre"];
export const HORAIRES0 = () => ({ duree: 30, jours: { 1: [["08:30", "18:00"]], 2: [["08:30", "18:00"]], 3: [["08:30", "18:00"]], 4: [["08:30", "18:00"]], 5: [["08:30", "18:00"]], 6: [], 0: [] } });
// Horaires en vigueur : ceux de l'établissement s'il a ses propres plages, sinon ceux du cabinet (par défaut 8 h 30 – 18 h)
export const horaires = (etab) => { const c = D().cal || {}; return (etab && c.horairesEtab && c.horairesEtab[etab]) || c.horaires || HORAIRES0(); };
// Durée d'un rendez-vous (AG2) : la sienne, sinon celle de son type (calendrier.durees, tous les lieux), sinon celle du lieu
export const dureeDe = (r, etab) => dureeRdv(r, (D().cal || {}).durees, horaires(etab).duree);
// 12/10/2026 : « Pas des créneaux » retiré de Horaires (demande de Dr Bentahila) : la durée se choisit dans Types de consultation ; un type
// sans durée choisie garde l'ancien pas du lieu (30 min par défaut), affiché comme sa durée : rien ne change pour les rendez-vous existants
export const dureeType = (cle, etab) => ((D().cal || {}).durees || {})[cle] || horaires(etab).duree || 30;
// Messages WhatsApp prédéfinis. Variables : {prenom} {nom} {jour} {heure} {lieu} {adresse} {medecin} ; en arabe : {jour_ar} {heure_ar}.
// R-C5 (19/10/2026, audit 4 d. 14, décision du 17/10) : chaque message = français, puis arabe classique (pas de darija), à la suite ; pas de choix de
// langue par patient. 20/10/2026 : les messages en français de départ sont ceux réglés par Dr Bentahila dans son cabinet (la référence, reprise
// pour les cabinets neufs) ; l'arabe en est la traduction fidèle. Un message modifié par un cabinet sans texte en arabe : l'arabe de son type
// est ajouté à l'envoi, avant la signature (messageAvecArabe).
const WA_FR = {
  // Confirmation proposée juste après la prise d'un rendez-vous (19.4, 10/10/2026), et après un report ou un changement de date (R-C5)
  confirm: "Bonjour {nom}, votre rendez-vous est confirmé le {jour} {heure} à {lieu}.\nEn cas d'empêchement, merci de nous prévenir.",
  chimio: "Bonjour {nom}, nous vous rappelons votre séance de chimiothérapie le {jour} {heure} à : {lieu}.\nMerci d'apporter votre bilan sanguin récent. Pensez à prendre votre prémédication si elle vous a été prescrite.\nEn cas de fièvre ou de problème, appelez-nous avant de vous déplacer.",
  annonce: "Bonjour {nom}, nous vous rappelons votre consultation le {jour} {heure} à : {lieu}.\nMerci d'apporter tous vos examens (biopsie, compte rendu anatomopathologique, imagerie, bilans sanguins) et, si vous le souhaitez, d'être accompagné(e) d'un proche.",
  suivi: "Bonjour {nom}, nous vous rappelons votre consultation le {jour} {heure} à : {lieu}.\nMerci d'apporter vos derniers examens (bilan sanguin, imagerie) et vos ordonnances en cours.",
  controle: "Bonjour {nom}, nous vous rappelons votre consultation le {jour} {heure} à : {lieu}.\nMerci d'apporter vos derniers examens (bilan sanguin, imagerie) et vos ordonnances en cours.",
  rtc: "Bonjour {nom}, nous vous rappelons votre consultation de surveillance pendant la radiothérapie le {jour} {heure} à : {lieu}.",
  rtf: "Bonjour {nom}, nous vous rappelons votre consultation de fin de radiothérapie le {jour} {heure} à {lieu}.",
  hospit: "Bonjour {nom}, nous vous rappelons votre hospitalisation à partir du {jour} à {lieu}.\nMerci d'apporter votre carte d'identité, votre prise en charge (mutuelle), vos examens et vos traitements habituels.",
  rt: "Bonjour {nom}, nous vous rappelons votre rendez-vous de radiothérapie le {jour} {heure} à {lieu}.",
  autre: "Bonjour {nom}, nous vous rappelons votre rendez-vous le {jour} {heure} à {lieu}.",
};
// Noms propres en lettres latines (nom, lieu) isolés (U+2068 … U+2069) : la ponctuation arabe reste à sa place, à l'écran comme dans WhatsApp
export const WA_AR = {
  confirm: "مرحبا \u2068{nom}\u2069، نؤكد موعدكم يوم {jour_ar} {heure_ar} في \u2068{lieu}\u2069.\nفي حال تعذر حضوركم، نرجو إخبارنا.",
  chimio: "مرحبا \u2068{nom}\u2069، نذكركم بحصة العلاج الكيميائي يوم {jour_ar} {heure_ar} في \u2068{lieu}\u2069.\nيرجى إحضار آخر تحاليل الدم. لا تنسوا تناول الأدوية التي وُصفت لكم قبل الحصة.\nفي حال الإصابة بالحمى أو حدوث أي مشكلة، اتصلوا بنا قبل الحضور.",
  annonce: "مرحبا \u2068{nom}\u2069، نذكركم بموعد استشارتكم يوم {jour_ar} {heure_ar} في \u2068{lieu}\u2069.\nيرجى إحضار جميع فحوصاتكم (الخزعة، تقرير التشريح المرضي، الصور الإشعاعية، تحاليل الدم)، ويمكنكم إن شئتم أن يرافقكم أحد أقاربكم.",
  suivi: "مرحبا \u2068{nom}\u2069، نذكركم بموعد استشارتكم يوم {jour_ar} {heure_ar} في \u2068{lieu}\u2069.\nيرجى إحضار آخر فحوصاتكم (تحاليل الدم، الصور الإشعاعية) ووصفاتكم الطبية الحالية.",
  controle: "مرحبا \u2068{nom}\u2069، نذكركم بموعد استشارتكم يوم {jour_ar} {heure_ar} في \u2068{lieu}\u2069.\nيرجى إحضار آخر فحوصاتكم (تحاليل الدم، الصور الإشعاعية) ووصفاتكم الطبية الحالية.",
  rtc: "مرحبا \u2068{nom}\u2069، نذكركم بموعد استشارة المراقبة خلال العلاج الإشعاعي يوم {jour_ar} {heure_ar} في \u2068{lieu}\u2069.",
  rtf: "مرحبا \u2068{nom}\u2069، نذكركم بموعد استشارة نهاية العلاج الإشعاعي يوم {jour_ar} {heure_ar} في \u2068{lieu}\u2069.",
  hospit: "مرحبا \u2068{nom}\u2069، نذكركم بدخولكم إلى المستشفى ابتداءً من يوم {jour_ar} في \u2068{lieu}\u2069.\nيرجى إحضار بطاقة التعريف الوطنية، ووثيقة التكفل (التعاضدية)، وفحوصاتكم وأدويتكم المعتادة.",
  rt: "مرحبا \u2068{nom}\u2069، نذكركم بموعد العلاج الإشعاعي يوم {jour_ar} {heure_ar} في \u2068{lieu}\u2069.",
  autre: "مرحبا \u2068{nom}\u2069، نذكركم بموعدكم يوم {jour_ar} {heure_ar} في \u2068{lieu}\u2069.",
};
export const aDeLArabe = (m) => /[\u0600-\u06FF]/.test(String(m || ""));
// T7 (24/10/2026, audit n° 10 d. 56) : 3 retouches de l'arabe de la séance de chimio (« تحاليل » au pluriel, prémédication = « الأدوية التي وُصفت لكم
// قبل الحصة », « مشكلة … قبل الحضور » en arabe classique) ; reprises une fois dans les messages du cabinet (waAr3, v2.js)
export const AR_RETOUCHES = [["آخر تحليل للدم", "آخر تحاليل الدم"], ["الأدوية الوقائية إذا وُصفت لكم", "الأدوية التي وُصفت لكم قبل الحصة"], ["أي مشكل، اتصلوا بنا قبل التنقل", "أي مشكلة، اتصلوا بنا قبل الحضور"]];
export const retouchesArabe = (m) => AR_RETOUCHES.reduce((s, [a, b]) => s.split(a).join(b), String(m || ""));
// T7 : le français d'un message a changé mais l'arabe est encore celui de départ (ou ajouté à l'envoi) : il ne le traduit plus
const sansEspaces = (t) => String(t || "").replace(/\s+/g, " ").trim();
export function arabeDecale(m, cat) {
  const s = String(m || ""), i = s.search(/[\u0600-\u06FF]/), fr = sansEspaces((i < 0 ? s : s.slice(0, i)).replace(/\{medecin\}/g, "").replace(/مرحبا[\s\S]*$/, ""));
  const fr0 = sansEspaces(WA_FR[cat] || WA_FR.autre);
  if (!fr || fr === fr0) return false;
  return i < 0 || s.indexOf(WA_AR[cat] || WA_AR.autre) >= 0;
}
// Arabe ajouté avant la signature ({medecin} en dernière ligne), sinon à la fin
export const messageAvecArabe = (m, cat) => {
  const s = String(m || ""); if (aDeLArabe(s)) return s;
  const ar = WA_AR[cat] || WA_AR.autre, f = /\n?[ \t]*\{medecin\}\s*$/.exec(s);
  return f ? s.slice(0, f.index).replace(/\s+$/, "") + "\n\n" + ar + "\n{medecin}" : s.replace(/\s+$/, "") + "\n\n" + ar;
};
export const WA0 = Object.fromEntries(Object.keys(WA_FR).map((k) => [k, messageAvecArabe(WA_FR[k] + "\n{medecin}", k)]));
// Jour et heure en arabe (mois en usage au Maroc) : « الاثنين 20 أكتوبر », « على الساعة 10:00 »
const JOURS_AR = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"], MOIS_AR = ["يناير", "فبراير", "مارس", "أبريل", "ماي", "يونيو", "يوليوز", "غشت", "شتنبر", "أكتوبر", "نونبر", "دجنبر"];
export const jourAr = (d) => { const j = new Date(d + "T12:00:00"); return JOURS_AR[j.getDay()] + " " + j.getDate() + " " + MOIS_AR[j.getMonth()]; };
export const heureAr = (h) => (h ? "على الساعة " + h : "");
// 3.13 (12/10/2026) : un message par type de consultation du référentiel (Paramètres › Dossier patient › Types de consultation) : un type
// ajouté a aussitôt son message (celui « par défaut » tant qu'il n'est pas écrit) ; types du journal seulement (RCP, note…) : pas de rappel
export const CAT_WA = () => {
  // 4.3 : [clé, libellé, icône dessinée] (plus d'émojis à l'écran)
  const l = [["confirm", "Confirmation d'un rendez-vous (proposée juste après sa prise)", "check"], ["chimio", "Séance de chimiothérapie", "seringue"]];
  (A.typesC ? A.typesC() : []).filter((t) => t.k !== "cchimio" && (t.rdv || t.k === "rtc" || t.k === "rtf")).forEach((t) => l.push([t.k, t.nom, t.k === "hospit" ? "hopital" : t.k === "rtc" || t.k === "rtf" ? "radiation" : "stetho"]));
  l.push(["rt", "Rendez-vous de radiothérapie (scanner, 1re séance)", "radiation"], ["autre", "Autre rendez-vous (message par défaut)", "bulle"]); return l;
};
const copie = (o) => JSON.parse(JSON.stringify(o));
// Couleurs Google Agenda : les 11 couleurs d'événement de Google (noms et teintes de Google Agenda), "" = couleur de l'agenda
const COUL_G = [["", "Couleur de l'agenda", "#FFFFFF"], ["11", "Tomate", "#D50000"], ["4", "Flamant", "#E67C73"], ["6", "Mandarine", "#F4511E"], ["5", "Banane", "#F6BF26"], ["2", "Sauge", "#33B679"], ["10", "Basilic", "#0B8043"], ["7", "Paon", "#039BE5"], ["9", "Myrtille", "#3F51B5"], ["1", "Lavande", "#7986CB"], ["3", "Raisin", "#8E24AA"], ["8", "Graphite", "#616161"]];
export const COULEURS0 = { annonce: "4", suivi: "7", rtc: "1", hospit: "9", autre: "7", chimio: "10", rt: "3", dosi: "6", abs: "5", tache: "8", tacheUrg: "11" };
const CAT_COUL = [["annonce", "Consultation d'annonce"], ["suivi", "Consultation de suivi / contrôle"], ["rtc", "Consultation en cours de radiothérapie"], ["hospit", "Hospitalisation"], ["autre", "Autres consultations (activités des Paramètres : 2nd avis…)"],
  ["chimio", "Chimiothérapie (cures J1, J8, J15…)"], ["rt", "Radiothérapie (scanner, 1re séance, fin)"], ["abs", "Absences et congés"], ["tache", "Tâches"], ["tacheUrg", "Tâches urgentes ou en retard"]];
let COUL = null; // couleurs du cabinet lues (null = à lire)
let TDOC = null; // types de documents du dossier (onglet Documents, 08/10/2026 ; null = à lire)
// Tâches automatiques (P4, 08/10/2026) : parametres/tachesAuto = { data: JSON { regles } } ; mêmes règles fixes et événements
// que functions/logique.js (REGLES_FIXES, tachesAutoPatient) ; calcul et création par le serveur (tachesAutoPatient / Nuit)
const AUTO_FIXES = [{ id: "cont", ev: "cont", fixe: true, actif: true, titre: "Valider le contourage", type: "Radiothérapie", pour: "titulaire", n: 0, depuis: "" },
  { id: "dosi", ev: "dosi", fixe: true, actif: true, titre: "Valider la dosimétrie", type: "Radiothérapie", pour: "titulaire", n: 0, depuis: "" },
  { id: "finrt", ev: "finrt", fixe: true, actif: true, titre: "Valider la fin de radiothérapie", type: "Radiothérapie", pour: "titulaire", n: 0, depuis: "" }];
const EV_AUTO = { cont: ["Contourage à valider", "Créée le jour du scanner de centrage ; échéance = 1re séance. Terminée toute seule quand le contourage est validé (dans le dossier ou depuis la tâche) ; ouvre la dosimétrie."],
  dosi: ["Dosimétrie à valider", "Créée à la validation du contourage ; échéance = 1re séance. Terminée toute seule quand la dosimétrie est validée (dans le dossier ou depuis la tâche)."],
  finrt: ["Fin de radiothérapie à valider", "Créée le lendemain de la fin prévue si la radiothérapie n'est pas clôturée. Terminée toute seule à la clôture."],
  derniereCure: ["Dernière cure d'un protocole", "Créée quand la dernière cure est la prochaine ; échéance = date de cette cure + N jours.", "jours après la cure"],
  nonVenu: ["Rendez-vous marqué « Non venu »", "Créée quand un rendez-vous est marqué Non venu ; échéance = date du rendez-vous + N jours.", "jours après"],
  nouveauPatient: ["Nouveau patient créé", "Créée à la création du dossier ; échéance = N jours après.", "jours après"],
  apresFinRT: ["Après la fin d'une radiothérapie", "Créée N mois après la fin (clôture) d'une radiothérapie, par exemple pour la consultation de contrôle.", "mois après la fin"],
  veilleJ1: ["Veille d'une cure J1", "Créée la veille de chaque cure J1 (préparation, pharmacie…) ; échéance = la veille."] };
const reglesAutoC = (cfg) => { const l = (cfg && Array.isArray(cfg.regles) ? cfg.regles : []).filter((r) => r && r.id && EV_AUTO[r.ev]); return AUTO_FIXES.map((f) => Object.assign({}, f, l.find((r) => r.id === f.id) || {}, { fixe: true, ev: f.ev })).concat(l.filter((r) => !AUTO_FIXES.some((f) => f.id === r.id))); };
let AUTO = null, MBR = null; // règles lues, membres (responsables)
let TTA = null; // types de tâches (onglet Tâches, 08/10/2026 ; null = à lire ; sans « Radiothérapie », fixe)
let ED = null, ONG = "horaires", MOD = false, HET = ""; // HET : établissement dont on règle les horaires ("" = par défaut)

// Onglets de la page Paramètres (« Activités et rémunérations » : droit « finances »)
// Lieux d'exercice, Google Agenda (liaison) et Accès : venus du Profil le 08/10/2026 (Accès : médecin titulaire)
let TIT = null;
// Quatre familles au lieu de quatorze onglets (audit externe, 11/10/2026) : barre de 4 onglets, puis les rubriques de la famille.
// L'adresse reste #parametres/<rubrique> (anciens liens gardés). Accès : dans Mon compte depuis le 10/10/2026 (18.5).
// RCP : dans Cabinet (demande du 12/10/2026) ; 3.11 (12/10/2026) : tout ce qui règle le dossier patient au même endroit ; affichage : R-G d
// (19/10/2026) ; rendez-vous créés d'office : dans Types de consultation (3.13). Liste : catalogue.js FAMILLES_SECTIONS (20/10/2026 : la même
// dans l'Administration, Réglage du cabinet › Paramètres et bibliothèques)
const ICO_FAM = { cabinet: "hopital", dossier: "profil", agenda: "agenda", listes: "pilule", finances: "bilan", laboratoires: "seringue" };
const FAMILLES = FAMILLES_SECTIONS.map(([k, lib, l]) => [k, ICO_FAM[k] || "liste", lib, l]);
const RUB = { lieux: ["hopital", "Lieux d'exercice"], accueil: ["accueil", "Tableau de bord"], fiche: ["profil", "Fiche patient"], consultation: ["stetho", "Formulaire de consultation"], types: ["agenda", "Types de consultation"],
  impression: ["imprimer", "Impression"], audit: ["liste", "Journal d'audit"], export: ["telecharger", "Export des données"], horaires: ["horloge", "Horaires"], fermetures: ["avion", "Congés et jours fériés"], rdvauto: ["agenda", "Rendez-vous automatiques"],
  couleurs: ["agenda", "Google Agenda"], whatsapp: ["whatsapp", "WhatsApp"], rcp: ["rcp", "RCP"], alertes: ["alerte", "Alertes"], listes: ["liste", "Listes"], affichage: ["colonnes", "Affichage du dossier"],
  bibliotheques: ["pilule", "Bibliothèques"], vigilances: ["alerte", "Vigilance des molécules"], documents: ["document", "Types de documents"], taches: ["taches", "Tâches"], activites: ["bilan", "Activités et rémunérations"], laboratoires: ["seringue", "Laboratoires"] };
const famDe = (k) => (FAMILLES.find((f) => f[3].indexOf(k) >= 0) || FAMILLES[0])[0];
// Rubriques présentes, dans l'ordre des familles ; dans une famille, l'ordre du réglage du cabinet (Administration)
const ONGLETS = () => FAMILLES.reduce((l, f) => l.concat(f[3]), [])
  .filter((k) => (k !== "audit" && k !== "export") || TIT)
  .filter((k) => k !== "activites" || (A.peut("finances") && D().tarifs))
  .filter((k) => ["accueil", "fiche", "consultation"].indexOf(k) < 0 || A.peut("parametres")) // réglages de toute l'équipe : médecin titulaire
  .filter((k) => A.module(MODULE_ONGLET[k] || "")) // onglets d'un module retiré de la formule du cabinet : cachés
  .filter((k) => !A.D().bib || HORS_BIB.indexOf(k) < 0) // bibliothèque de référence : paramètres de base de la spécialité
  // Réglage du cabinet (10/10/2026) : onglets retirés cachés, dans l'ordre choisi
  .filter((k) => A.D().bib || !A.D().reg || A.D().reg.sections[k] !== false)
  .sort((a, b) => { const R = A.D().reg, l = R && !A.D().bib ? R.ordreSections : [], fa = FAMILLES.findIndex((f) => f[0] === famDe(a)), fb = FAMILLES.findIndex((f) => f[0] === famDe(b)); return fa - fb || (l.indexOf(a) + 1 || 999) - (l.indexOf(b) + 1 || 999); })
  .map((k) => [k, RUB[k][0], RUB[k][1]]);
// Propres à chaque cabinet, donc absents de la bibliothèque de référence (le modèle) : lieux, équipe, journal d'audit, export. Depuis le
// 20/10/2026, le modèle a les mêmes rubriques qu'un médecin (tableau de bord, fiche patient, formulaire et types de consultation, affichage
// du dossier) : fiche et formulaire enregistrés dans le modèle de la spécialité (fonction ficheSpecialite), le reste dans ses paramètres.
const HORS_BIB = ["lieux", "acces", "audit", "export"];
// Onglets que la secrétaire (droit « secretariat », sans « paramètres ») peut modifier, et ce qu'elle y modifie
const ONGLETS_SEC = ["horaires", "fermetures", "whatsapp", "documents", "taches", "rcp", "listes", "impression", "alertes", "types", "affichage", "laboratoires"];
const MSG_SEC = { types: "Vous pouvez régler la durée de chaque type ; le reste est réglé par le médecin.", lieux: "Vous pouvez compléter l'adresse, le téléphone et la ville de votre lieu (« Compléter »).", horaires: "Vous pouvez régler les horaires de vos lieux.", taches: "Vous pouvez modifier les types de tâches ; les tâches automatiques sont réglées par le médecin." };
const secretariat = () => A.peut("secretariat") && !A.D().bib;
const MODULE_ONGLET = { vigilances: "chimio", couleurs: "gagenda", taches: "taches", rcp: "rcp", listes: "listes", bibliotheques: "prescriptions" };
const DERN = {}; // dernière rubrique ouverte de chaque famille
function entete() {
  const L = ONGLETS(), fam = famDe(ONG), sous = L.filter((o) => famDe(o[0]) === fam);
  // Lot B (25/10/2026) : plus de titre ; les familles en haut ; dans le modèle des cabinets neufs, la phrase d'explication reste en petit sous les familles
  const expl = A.D().bib ? '<p class="mesures cf-modele">' + "Ce que reçoit chaque cabinet neuf de la spécialité, réglé comme chez un médecin. Rien ne touche le cabinet du Dr Bentahila ; les cabinets déjà créés ne reçoivent que la fiche patient et le formulaire de consultation (leurs retouches restent par-dessus)." + "</p>" : "";
  // 26/10/2026 (demande de Dr Bentahila, modèle Doctolib) : menu fixe à gauche, « Paramètres » puis les grandes familles (icône, nom, flèche) ;
  // la famille ouverte montre ses rubriques en dessous ; la page à droite. Téléphone : le menu passe au-dessus.
  return '<div class="cf-lay"><aside class="cf-nav" aria-label="Paramètres"><div class="cf-nav-t">Paramètres</div><div class="cf-fam" role="tablist">' +
    FAMILLES.filter((f) => L.some((o) => famDe(o[0]) === f[0])).map(([k, ico, lib]) => { const sk = L.filter((o) => famDe(o[0]) === k);
      return '<div class="cf-g' + (fam === k ? " ouv" : "") + '"><button role="tab" aria-selected="' + (fam === k) + '" aria-expanded="' + (fam === k) + '" class="cf-gt' + (fam === k ? " on" : "") + '" onclick="cfFamille(\'' + k + "')\">" + A.ic(ico) + "<span>" + lib + "</span></button>" +
        (fam === k ? '<nav class="cf-sous" aria-label="Rubriques">' + sk.map(([o, , l2]) => '<button class="' + (ONG === o ? "on" : "") + '"' + (ONG === o ? ' aria-current="page"' : "") + ' onclick="cfOnglet(\'' + o + "')\">" + l2 + "</button>").join("") + "</nav>" : "") + "</div>"; }).join("") +
    '</div></aside><div class="cf-main">' + expl;
}
// Bouton de retrait discret (gris, rouge au survol) à la place de la croix rouge sur chaque ligne
// 3.10 (12/10/2026, audit) : retrait dans un menu ⋯ (plus de corbeille à portée de clic) et confirmation avant de retirer
const sup = (action, lib) => '<details class="m3 cf-sup"><summary class="sup" title="Plus d\'actions" aria-label="Plus d\'actions : ' + lib + '">⋯</summary><div class="m3-l">' +
  '<button type="button" class="mini" data-q="' + lib + ' ?" onclick="this.closest(\'details\').removeAttribute(\'open\');if(confirm(this.dataset.q)){' + action + '}">' + A.ic("corbeille") + lib + "</button></div></details>";
const titre = (ico, t, n) => '<h3><span class="ic">' + A.ic(ico) + "</span>" + t + (n != null ? ' <span class="cf-n">' + n + "</span>" : "") + "</h3>";
const typesListe = (L, okE, disE, pre, aj, fixe) => '<div class="cf-td">' + L.map((t, i) => '<div class="it"><b class="n">' + (i + 1) + '</b><input value="' + A.esc(t) + '"' + disE + ' aria-label="Type ' + (i + 1) + '" onchange="' + pre + "(" + i + ',this.value)">' +
  (okE ? '<button class="ico" title="Monter" aria-label="Monter" onclick="' + pre + "Bouger(" + i + ',-1)"' + (i ? "" : " disabled") + '>↑</button><button class="ico" title="Descendre" aria-label="Descendre" onclick="' + pre + "Bouger(" + i + ',1)"' + (i < L.length - 1 ? "" : " disabled") + ">↓</button>" + sup(pre + "Sup(" + i + ")", "Retirer « " + A.esc(t) + " »") : "") + "</div>").join("") + (fixe || "") + "</div>" +
  (okE ? '<button class="bt clair petit" style="margin-top:10px" onclick="' + pre + 'Aj()">' + A.ic("plus") + aj + "</button>" : "");

// ───── Une fonction par rubrique : c = { ok (droit « paramètres »), okE / disE (ce que la personne modifie ici), dis, sec } ─────
const RUBRIQUES = {
  horaires(c) {
    // membre limité à certains établissements (secrétaire d'un centre) : seulement leurs horaires (07/10/2026)
    const esc = A.esc, limite = !D().membre.tousEtablissements, etabs = limite ? (D().membre.etablissements || []).slice() : (D().etabsTous || D().etabs).map((e) => e.code);
    if (limite && etabs.indexOf(HET) < 0) HET = etabs[0] || "";
    const propre = HET && ED.horairesEtab[HET], H = HET ? ED.horairesEtab[HET] || ED.horaires : ED.horaires;
    const disH = HET && !propre ? " disabled" : c.disE, okH = c.okE && (!HET || propre);
    return '<section class="carte">' + titre("horloge", "Horaires") + '' +
      '<div class="puces"><span class="tl">Horaires de</span>' + (limite ? "" : '<button class="puce' + (HET ? "" : " on") + '" onclick="cfEtab(\'\')">Par défaut (tous)</button>') + etabs.map((k) => '<button class="puce' + (HET === k ? " on" : "") + '" onclick="cfEtab(\'' + esc(k) + "')\">" + esc(k) + (ED.horairesEtab[k] ? " •" : "") + "</button>").join("") + "</div>" +
      (HET ? '<label class="chk" style="margin:6px 0 10px"><input type="checkbox"' + (propre ? " checked" : "") + c.disE + ' onchange="cfPropre(this.checked)"> Horaires propres à ' + esc(HET) + "</label>" + (propre ? "" : '<p class="mesures">' + esc(HET) + " suit les horaires par défaut.</p>")
        : '') +
      '<div class="tableau" style="margin-top:12px"><table class="tcures cfh"><tr><th>Jour</th><th>Plages horaires</th></tr>' +
      JOURS.map(([j, nom]) => {
        const pl = H.jours[j] || [], ouvert = pl.length > 0;
        return '<tr><td><label style="display:flex;gap:8px;align-items:center;font-weight:bold"><input type="checkbox" style="width:auto"' + (ouvert ? " checked" : "") + disH + ' onchange="cfJour(' + j + ',this.checked)">' + nom + "</label></td><td>" +
          (ouvert ? '<div class="plages">' + pl.map((p, k) => '<span class="plage"><input type="time" step="900" value="' + p[0] + '"' + disH + ' onchange="cfPlage(' + j + "," + k + ',0,this.value)"> – <input type="time" step="900" value="' + p[1] + '"' + disH + ' onchange="cfPlage(' + j + "," + k + ',1,this.value)">' + (okH ? sup("cfSupPlage(" + j + "," + k + ")", "Retirer cette plage") : "") + "</span>").join("") + (okH ? '<button class="mini" onclick="cfAjPlage(' + j + ')">+ Plage</button>' : "") + "</div>" : '<span class="mesures">Fermé</span>') + "</td></tr>";
      }).join("") + "</table></div>" + '</section>';
  },
  fermetures(c) {
    const esc = A.esc, abs = ED.abs.map((a, i) => ({ a, i })).sort((p, q) => String(p.a.du).localeCompare(String(q.a.du)));
    let h = '<section class="carte">' + titre("avion", "Absences", abs.length || null) + '' +
      (abs.length ? '<div class="tableau"><table class="tcures"><tr><th>Du</th><th>Au</th><th>Motif</th><th>Type</th><th></th></tr>' + abs.map(({ a, i }) => '<tr><td><input type="date" value="' + esc(a.du || "") + '"' + c.disE + ' onchange="cfAbs(' + i + ',\'du\',this.value)"></td><td><input type="date" value="' + esc(a.au || "") + '"' + c.disE + ' onchange="cfAbs(' + i + ',\'au\',this.value)"></td><td><input value="' + esc(a.m || "") + '" placeholder="Congrès, voyage…"' + c.disE + ' onchange="cfAbs(' + i + ',\'m\',this.value)"></td>' +
        "<td><select" + c.disE + ' onchange="cfAbs(' + i + ',\'t\',this.value)"><option value=""></option>' + TYPES.map((t) => "<option" + (a.t === t ? " selected" : "") + ">" + t + "</option>").join("") + "</select></td><td>" + (c.okE ? sup("cfSupAbs(" + i + ")", "Retirer cette absence") : "") + "</td></tr>").join("") + "</table></div>" : '<p class="vide-c">Aucune absence.</p>') +
      (c.okE ? '<button class="bt clair petit" style="margin-top:10px" onclick="cfAjAbs()">' + A.ic("plus") + "Ajouter une absence</button>" : "") + "</section>";
    const fs = ED.feries.map((f, i) => ({ f, i })).sort((p, q) => String(p.f.d).localeCompare(String(q.f.d)));
    h += '<section class="carte">' + titre("drapeau", "Jours fériés", fs.length) + '' +
      '<div class="tableau" style="max-height:460px;overflow:auto"><table class="tcures"><tr><th style="width:190px">Date</th><th>Fête</th><th></th></tr>' + fs.map(({ f, i }) => '<tr><td><input type="date" value="' + esc(f.d) + '"' + c.disE + ' onchange="cfFer(' + i + ',\'d\',this.value)"></td><td><input value="' + esc(f.nom || "") + '"' + c.disE + ' onchange="cfFer(' + i + ',\'nom\',this.value)" style="width:100%"></td><td>' + (c.okE ? sup("cfSupFer(" + i + ")", "Retirer ce jour férié") : "") + "</td></tr>").join("") + "</table></div>" +
      (c.okE ? '<button class="bt clair petit" style="margin-top:10px" onclick="cfAjFer()">' + A.ic("plus") + "Ajouter un jour férié</button>" : "") + "</section>";
    return h;
  },
  taches(c) {
    // Types de tâches (P1, 08/10/2026) : boutons de « Nouvelle tâche » et filtre « Type » ; « Radiothérapie » fixe, à la fin
    return '<section class="carte">' + titre("taches", "Types de tâches") + '<p class="sous">Proposés dans « Nouvelle tâche » et dans le filtre de la page Tâches. Les tâches déjà créées gardent leur type.</p>' +
      typesListe(ED.ttache, c.okE, c.disE, "cfTt", "Ajouter un type", '<div class="it"><b class="n">' + (ED.ttache.length + 1) + '</b><input value="' + A.esc(TYPE_RT) + '" disabled aria-label="Type fixe ' + A.esc(TYPE_RT) + '"><span class="mesures">fixe</span></div>') + "</section>" +
      sectionAuto(c.ok, c.dis);
  },
  rcp(c) {
    // Dates de RCP (étape 7, 09/10/2026) : jours de la semaine, heure, lieu, dates ajoutées et annulées (rcp.js)
    const esc = A.esc, C = ED.rcp, dates = (k, t, sous, aj) => '<section class="carte"><h3>' + t + '</h3><p class="sous">' + sous + "</p>" +
      (C[k].length ? '<div class="cf-td">' + C[k].map((d, i) => '<div class="it"><input type="date" value="' + esc(d) + '"' + c.disE + ' aria-label="' + t + " " + (i + 1) + '" onchange="cfRcpDate(\'' + k + "'," + i + ',this.value)" style="max-width:190px"><span class="mesures">' + esc(d ? libDate(d) : "") + "</span>" + (c.okE ? sup("cfRcpSup('" + k + "'," + i + ")", "Retirer cette date") : "") + "</div>").join("") + "</div>" : '<p class="mesures">Aucune.</p>') +
      (c.okE ? '<button class="bt clair petit" style="margin-top:10px" onclick="cfRcpAj(\'' + k + "')\">" + A.ic("plus") + aj + "</button>" : "") + "</section>";
    const pro = prochainesRcp(10, C);
    return '<section class="carte">' + titre("rcp", "Dates de RCP") + '<p class="sous">« + RCP » du dossier inscrit le patient à la prochaine date ; la liste est dans Tâches › RCP. Pas de RCP un jour férié, sauf date ajoutée.</p>' +
      '<div class="puces"><span class="tl">Chaque semaine le</span>' + JOURS.map(([j, nom]) => '<button class="puce' + (C.jours.indexOf(j) >= 0 ? " on" : "") + '"' + c.disE + ' aria-pressed="' + (C.jours.indexOf(j) >= 0) + '" onclick="cfRcpJour(' + j + ')">' + nom + "</button>").join("") + "</div>" +
      '<div class="form" style="grid-template-columns:repeat(2,minmax(0,260px))"><div><label for="cfRh">Heure</label><input id="cfRh" type="time" step="900" value="' + esc(C.heure) + '"' + c.disE + ' onchange="cfRcp(\'heure\',this.value)"></div>' +
      '<div><label for="cfRl">Lieu</label><input id="cfRl" value="' + esc(C.lieu) + '" placeholder="Ex. salle de staff, visioconférence"' + c.disE + ' onchange="cfRcp(\'lieu\',this.value)"></div></div>' +
      '<h4 class="soustitre">Prochaines RCP</h4>' + (pro.length ? '<div class="puces">' + pro.map((d) => '<span class="puce">' + esc(A.cap(libDate(d))) + "</span>").join("") + "</div>" : '<p class="mesures">Aucune date : cochez un jour ou ajoutez des dates.</p>') + "</section>" +
      '<div class="cf-2">' + dates("plus", "Dates ajoutées", "RCP exceptionnelles, en plus des jours de la semaine.", "Ajouter une date") + dates("annulees", "Dates annulées", "Jours sans RCP (congés, congrès…).", "Annuler une date") + "</div>";
  },
  documents(c) {
    return '<section class="carte">' + titre("document", "Types de documents") + '<p class="sous">Menu « Type » de l\'onglet Documents du dossier. Les documents déjà déposés gardent leur type.</p>' + typesListe(ED.tdoc, c.okE, c.disE, "cfTd", "Ajouter un type") + "</section>";
  },
  vigilances(c) { return htmlVigilances(c.ok); },
  // Rendez-vous créés d'office (12/10/2026, demande de Dr Bentahila) : le médecin décoche ceux qu'il ne veut pas ; ceux déjà créés restent
  // 3.13 (12/10/2026) : référentiel unique des types de consultation. Tout est relié à cette liste : prise de rendez-vous (« Pris en
  // rendez-vous »), journal des consultations (tous les types), durée (agenda, créneaux), formulaire de consultation, rendez-vous créés
  // d'office, message WhatsApp, Google Agenda (ce que chacun y voit), Activités et rémunérations (prix de chaque type par lieu), bilan.
  types(c) {
    const esc = A.esc, L = ED.typesC, FO = formulairesDe(ED.consultation), du = ED.durees || {}, ok = c.ok, dis = ok ? "" : " disabled", R = ED.reg.auto;
    const modeTy = (t) => { const au = AUTO_TY[t.k], o = au && R[au[0]]; return t.k === "cchimio" ? "office" : t.rdv && o ? "les2" : o ? "office" : t.rdv ? "main" : "sans"; };
    const rg = (t, i) => { if (((t.k === "rtc" || t.k === "rtf") && A.module && !A.module("rt")) || (t.k === "cchimio" && A.module && !A.module("chimio"))) return ""; // module absent de la formule
      const st = estStd(t.k), au = AUTO_TY[t.k], dk = cleDuree(t.k), f = formDuType(ED.consultation, t.nom, FO);
      return '<div class="ty-l"><span class="fl"><button class="clair petit" aria-label="Monter" onclick="cfTyBouger(' + i + ',-1)"' + (i && ok ? "" : " disabled") + '>↑</button><button class="clair petit" aria-label="Descendre" onclick="cfTyBouger(' + i + ',1)"' + (i < L.length - 1 && ok ? "" : " disabled") + ">↓</button></span>" +
        '<input class="ty-n" value="' + esc(t.nom) + '" aria-label="Nom du type"' + dis + ' onchange="cfTy(' + i + ',\'nom\',this.value)">' +
        // 3.13 bis : « Comment il est prévu » (à la main = proposé à la prise de rendez-vous ; d'office = créé par Onco360) ; tous sont des rendez-vous
        '<label class="ty-s"><span class="ty-lb">Comment il est prévu</span> <select aria-label="Comment est prévu : ' + esc(t.nom) + '"' + (ok && t.k !== "cchimio" && !estNote(t.nom) ? "" : " disabled") + ' onchange="cfTyMode(' + i + ',this.value)">' +
          (t.k === "cchimio" ? '<option>D\'office (avec la cure)</option>' : (au ? [["main", "À la main"], ["office", "D'office (" + au[1] + ")"], ["les2", "D'office et à la main"], ["sans", "Sans rendez-vous"]] : [["main", "À la main"], ["sans", "Sans rendez-vous (journal seulement)"]])
            .map(([v, l]) => '<option value="' + v + '"' + (v === modeTy(t) ? " selected" : "") + ">" + esc(l) + "</option>").join("")) + "</select></label>" +
        // hospitalisation : toute la journée, facturée par jour ouvré (pas un créneau de consultation)
        (t.k === "hospit" ? '<span class="ty-s mesures">Journée entière (facturée par jour ouvré)</span>' :
        // Lot D (25/10/2026) : un type sans rendez-vous (journal seulement : RCP, Note du secrétariat…) n'a pas de durée
        modeTy(t) === "sans" ? '<span class="ty-s mesures ty-sd" title="Note du journal, sans rendez-vous : pas de durée"><span class="ty-lb">Durée</span> —</span>' :
        '<label class="ty-s"><span class="ty-lb">Durée</span> <select aria-label="Durée : ' + esc(t.nom) + '"' + c.disE + ' onchange="cfDureeT(\'' + esc(dk) + '\',this.value)">' + (() => { const v = du[dk] || (ED.horaires && ED.horaires.duree) || 30; return [10, 15, 20, 30, 40, 45, 60, 90, 120].concat([10, 15, 20, 30, 40, 45, 60, 90, 120].indexOf(v) < 0 ? [v] : []).sort((a2, b2) => a2 - b2).map((m) => '<option value="' + m + '"' + (m === v ? " selected" : "") + ">" + m + " min</option>").join(""); })() + "</select></label>") +
        '<label class="ty-s"><span class="ty-lb">Formulaire</span> <select aria-label="Formulaire : ' + esc(t.nom) + '"' + dis + ' onchange="cfTy(' + i + ',\'form\',this.value)">' + FO.map((z) => '<option value="' + esc(z.id) + '"' + (z.id === f ? " selected" : "") + ">" + esc(z.nom) + "</option>").join("") + "</select></label>" +
        (st || !ok ? "<span></span>" : sup("cfTySup(" + i + ")", "Retirer « " + esc(t.nom) + " »")) + "</div>"; };
    return '<section class="carte">' + titre("agenda", "Types de consultation", L.length) +
      '<p class="sous">Une seule liste pour tout Onco360 : prise de rendez-vous, journal des consultations, durée dans l\'agenda, formulaire, message WhatsApp, Google Agenda et prix (Activités et rémunérations). Un type ajouté ou renommé l\'est partout, y compris dans les rendez-vous et consultations déjà enregistrés.</p>' +
      '<div class="ty-b"><div class="ty-l ty-h"><span></span><span>Type</span>' + aide("Comment il est prévu", "Tous sont des rendez-vous dans l\'agenda. À la main : proposé quand on prend un rendez-vous. D\'office : créé par Onco360 (consultation de chimiothérapie avec la cure ; consultations en cours et de fin de radiothérapie avec la radiothérapie). Sans rendez-vous : seulement dans le journal des consultations (RCP, note du secrétariat).") +
        aide("Durée", "Hauteur du rendez-vous dans l\'agenda, créneaux proposés à la prise du rendez-vous, doubles réservations.") + aide("Formulaire", "Champs proposés dans la fenêtre « Nouvelle consultation » pour ce type (Formulaire de consultation).") + "<span></span></div>" + L.map(rg).join("") + "</div>" +
      (ok ? '<button class="bt clair petit" style="margin-top:10px" onclick="cfTyAj()">' + A.ic("plus") + "Ajouter un type de consultation</button>" : "") +
      '<p class="mesures" style="margin-top:10px">Prix de chaque type par lieu : <a href="#parametres/activites" onclick="event.preventDefault();cfOnglet(\'activites\')">Activités et rémunérations</a> (sans prix = non facturé dans ce lieu). Message de rappel : <a href="#parametres/whatsapp" onclick="event.preventDefault();cfOnglet(\'whatsapp\')">WhatsApp</a>.</p></section>';
  },
  audit() { return '<div id="cfAudit"></div>'; },
  // Export complet du cabinet (étape 1.6, 11/10/2026) : médecin titulaire ; préparé par le serveur (exporterCabinet), téléchargé ici
  export() {
    return '<section class="carte">' + titre("telecharger", "Exporter tout le cabinet") +
      '<p>Un seul fichier ZIP avec <b>toutes vos données</b>, lisibles sans Onco360 : le tableau des patients (Excel), tous les dossiers, ' +
      "consultations, ordonnances, montants, paramètres et protocoles (fichier JSON), tous les documents déposés et la documentation (PDF), " +
      "le journal d'audit.</p>" +
      '<p class="sous">À garder en lieu sûr : ce fichier contient des données de santé (ne pas l\'envoyer par e-mail ni WhatsApp). La préparation ' +
      "peut prendre une à deux minutes. L'export est noté dans le journal.</p>" +
      '<button class="bt plein" id="cfExp" onclick="cfExporter()">' + A.ic("telecharger") + "Exporter tout le cabinet</button>" +
      '<p class="sous" id="cfExpMsg" style="margin-top:10px"></p></section>' + htmlRecuperation(); // R-F (20/10/2026) : export de la semaine, récupérer des données
  },
  lieux() { return '<div id="cfProfil"><p class="sous">Chargement…</p></div>'; },
  couleurs(c) {
    let h = A.D().bib ? "" : '<div id="cfProfil"><p class="sous">Chargement de votre Google Agenda…</p></div>' + sectionMonAgenda(); // liaison personnelle : pas dans la bibliothèque
    // sans le droit « paramètres » (secrétaire…) : ses propres couleurs (utilisateurs/{uid}.agendaCouleurs, 10/10/2026), enregistrées
    // tout de suite ; elles passent avant celles du cabinet dans SON agenda
    const esc = A.esc, perso = !c.ok && !A.D().bib, PC = (D().profil && D().profil.agendaCouleurs) || {}, CO = perso ? Object.assign({}, ED.coul, PC) : ED.coul;
    h += '<section class="carte" data-fn="gagenda.couleurs">' + titre("agenda", perso ? "Couleurs de votre agenda" : "Couleurs dans Google Agenda") + (perso && Object.keys(PC).length ? '<p class="sous"><button class="mini" onclick="cfCoulPersoDef()">↺ Couleurs du cabinet</button></p>' : "") +
      CAT_COUL.map(([k, lib]) => {
        const v = CO[k] != null ? CO[k] : "", nom = (COUL_G.find((x) => x[0] === v) || COUL_G[0])[1];
        return '<div class="cf-coul"><div class="lib"><b>' + esc(lib) + '</b><span class="mesures">' + esc(nom) + (v !== COULEURS0[k] ? " · modifiée" : "") + '</span></div><div class="nuancier" role="radiogroup" aria-label="' + esc(lib) + '">' +
          COUL_G.map(([k2, n, hex]) => '<button type="button" role="radio" aria-checked="' + (k2 === v) + '" title="' + esc(n) + '" aria-label="' + esc(n) + '" class="pastc' + (k2 === v ? " on" : "") + (k2 ? "" : " vide") + '" style="background:' + hex + '"' + (perso ? "" : c.dis) + ' onclick="' + (perso ? "cfCoulPerso" : "cfCoul") + "('" + k + "','" + k2 + "')\"></button>").join("") + "</div></div>";
      }).join("") + "</section>";
    return h;
  },
  listes(c) {
    // Listes proposées dans les fiches patients (P2 bis, 08/10/2026) : corriger, retirer, ajouter ; nombre de dossiers concernés
    // 3.1 bis (12/10/2026) : en oncologie, diagnostics = localisations ; stades et grades de la fiche tumeur
    // Lot D (25/10/2026, demande de Dr Bentahila) : Bibliothèques › Listes réunit toutes les listes : localisations, mutuelles, correspondants,
    // types de tâches (avec les tâches automatiques) et types de documents ; stades et grades ne sont pas des listes ici : ils se règlent
    // depuis leur champ de la fiche patient (✎), qui ouvre cette page avec « Retour »
    // Lot A §6 (25/10/2026) : ordre de la fiche du lot : Mutuelle, Correspondant, Allergies, Antécédents médicaux, chirurgicaux, familiaux, Traitements
    // en cours, Localisation (fiche tumeur), Tâches, Documents
    const onco = !!((D().reg || {}).fiche || {}).onco, tout = Object.assign({ mut: "Mutuelles", cor: "Correspondants" }, Object.fromEntries(["allergies", "atcdMed", "atcdChir", "atcdFam", "traitCours"].map((k) => LISTES_MED.find((z) => z[0] === k))), { diag: onco ? "Localisations" : "Diagnostics" }, onco ? { stade: "Stades", grade: "Grades" } : {});
    const deFiche = ["stade", "grade"].indexOf(LS) >= 0 || (LS === "diag" && FICHE_LS) || (LISTES_MED.some((z) => z[0] === LS) && FICHE_LS), lib = Object.fromEntries(Object.entries(tout).filter(([k]) => (["stade", "grade"].indexOf(k) < 0 || k === LS) && !(k === "cor" && A.D().bib))); // modèle : pas de correspondants (20/10/2026)
    const autres = [["taches", "Tâches", A.module("taches")], ["documents", "Documents", A.module("documents") !== false]].filter((z) => z[2]);
    if (!lib[LS] && !autres.some((z) => z[0] === LS)) LS = Object.keys(lib)[0];
    const med = LISTES_MED.some((z) => z[0] === LS);
    const nb = (k) => (k === "taches" ? ED.ttache.length + 1 : k === "documents" ? ED.tdoc.length : ED.listes[k].length);
    const puces = '<div class="puces">' + Object.keys(lib).map((k) => [k, lib[k]]).concat(autres.map((z) => [z[0], z[1]])).map(([k, l]) => "<button" + (k === "cor" ? ' data-fn="listes.cor"' : "") + ' class="puce' + (LS === k ? " on" : "") + '" onclick="cfLs(\'' + k + "')\">" + l + " (" + nb(k) + ")</button>").join("") + "</div>";
    const retour = deFiche && A.peut("parametres") ? '<a class="retour" href="#parametres/fiche" onclick="event.preventDefault();cfRetourFiche()">' + A.ic("retour") + "Retour à la fiche patient</a>" : "";
    if (LS === "taches" || LS === "documents") return '<section class="carte cf-ls">' + titre("liste", "Listes") + puces + "</section>" + RUBRIQUES[LS](c);
    return retour +
      '<section class="carte">' + titre("liste", "Listes") + "" +
      puces +
      '<div class="recherche" style="max-width:420px;margin-bottom:8px">' + A.ic("loupe") + '<input id="cfLq" type="search" autocomplete="off" placeholder="Rechercher dans la liste…" value="' + A.esc(LQ) + '"></div>' +
      '<div class="cf-td cf-l" id="cfLl"></div>' + (diagModifiable() ? "" : '<p class="sous" style="margin-top:8px">' + (LS === "diag" ? "Les localisations" : "Les stades et les grades") + " sont modifiés par un médecin.</p>") + (LS === "stade" || LS === "grade" ? '' : "") + (c.okE && diagModifiable() ? '<button class="bt clair petit" style="margin-top:10px" onclick="cfLAj()">' + A.ic("plus") + "Ajouter</button>" : "") + "</section>";
  },
  bibliotheques() {
    // Bibliothèques des prescriptions : les mêmes fenêtres que dans le dossier, en gestion de la liste (sans patient)
    const B = [["medicaments", "pilule", "Médicaments", "Nom, posologie, classe"], ["ordostypes", "presse", "Ordonnances types", "Médicaments prescrits ensemble"], ["analyses", "tube", "Analyses et bilans", "Analyses et bilans"], ["examens", "loupe", "Examens complémentaires", "Imagerie, explorations"], ["courriers", "courrier", "Modèles de courriers", "Certificats, courriers, ALD…"]];
    return '<section class="carte">' + titre("pilule", "Bibliothèques des prescriptions") + "" +
      '<div class="cf-bib">' + B.map(([k, ico, t, sous]) => '<button class="cf-b" data-bib="' + k + '" onclick="cfBib(\'' + k + "')\"><span class=\"ic\">" + A.ic(ico) + "</span><span><b>" + t + '</b><span class="mesures">' + sous + '</span><span class="mesures" id="cfBn-' + k + '"></span></span></button>').join("") +
      (A.estMed() ? '<button class="cf-b" data-bib="documentation" onclick="ordDocumentationGestion()"><span class="ic">' + A.ic("document") + '</span><span><b>Documentation</b><span class="mesures">Fiches PDF remises aux patients</span></span></button>' : "") + "</div></section>";
  },
  // R-G d (audit n° 5, 19/10/2026) : affichage du dossier patient. Pour le cabinet (titulaire ou secrétaire) : parties de la colonne Patient
  // dépliées à l'ouverture (parametres/reglages, clé dossier). Pour moi : taille de la visionneuse (utilisateurs/{uid}.dossier), « Rétablir ».
  affichage(c) {
    const Pa = ED.reg.dossier.parties, L = [["avenir", "Rendez-vous et tâches à venir"], ["id", "Identité et administratif"], ["med", "Informations médicales"], ["tum", "Fiche tumeur"], ["passe", "Historique des RDV"]]; // lot A §3
    const moi = (D().profil && D().profil.dossier) || {}, v = moi.visionneuse === "deuxTiers" ? "deuxTiers" : "colonne";
    return '<section class="carte">' + titre("colonnes", "Pour le cabinet : colonne Patient") + '' +
      L.map(([k, lib]) => '<label class="chk" style="display:block;margin:6px 0"><input type="checkbox" data-part="' + k + '"' + (Pa[k] ? " checked" : "") + c.disE + ' onchange="cfPartie(\'' + k + '\',this.checked)"> ' + lib + "</label>").join("") + "</section>" +
      '<section class="carte">' + titre("profil", "Pour moi") + '<div class="form" style="grid-template-columns:minmax(0,320px)"><div><label for="cfVis">Visionneuse des documents à l\'ouverture</label><select id="cfVis" onchange="cfVisionneuse(this.value)"><option value="colonne"' + (v === "colonne" ? " selected" : "") + '>Une colonne</option><option value="deuxTiers"' + (v === "deuxTiers" ? " selected" : "") + ">Deux tiers de la largeur</option></select></div></div>" +
      '<div class="actr" style="justify-content:flex-start;margin-top:10px"><button class="bt clair petit" onclick="cfRetablirDossier()">Rétablir</button></div></section>';
  },
  impression(c) {
    // Marges d'impression (mm) : la marge du haut laisse la place à l'en-tête déjà imprimé sur le papier ; âge et poids sur les ordonnances (3.2)
    const I = ED.reg.impression, agePoids = '<section class="carte">' + titre("imprimer", "Ordonnances") + '<p class="sous">Sous le nom du patient :</p><label class="chk"><input type="checkbox"' + (I.age ? " checked" : "") + c.disE + ' onchange="cfRegB(\'impression\',\'age\',this.checked)"> Âge</label> <label class="chk"><input type="checkbox"' + (I.poids ? " checked" : "") + c.disE + ' onchange="cfRegB(\'impression\',\'poids\',this.checked)"> Poids</label> <label class="chk"><input type="checkbox"' + (I.allergie ? " checked" : "") + c.disE + ' onchange="cfRegB(\'impression\',\'allergie\',this.checked)"> Allergie (si « Oui » dans la fiche)</label><p class="sous" style="margin-top:10px">À l\'écran, pendant qu\'on prépare l\'ordonnance :</p><label class="chk"><input type="checkbox"' + (I.fenRappel ? " checked" : "") + c.disE + ' onchange="cfRegB(\'impression\',\'fenRappel\',this.checked)"> Rappeler l\'allergie et le poids en haut de la fenêtre d\'ordonnance</label></section>', champ = (q, n, lib) => '<div><label for="cfI' + q + n + '">' + lib + '</label><input id="cfI' + q + n + '" type="number" min="0" max="150" step="1" inputmode="numeric" value="' + I[q][n] + '"' + c.disE + ' onchange="cfImp(\'' + q + "'," + n + ',this.value)"></div>';
    // 3.9 (12/10/2026) : en-tête et pied des ordonnances et courriers : papier à en-tête, ou imprimés par Onco360 (au choix du cabinet)
    const g = I.entete === "genere", cb = (k, lib) => '<label class="chk" style="display:block;margin:4px 0"><input type="checkbox"' + (I[k] ? " checked" : "") + c.disE + (g ? "" : " disabled") + ' onchange="cfRegB(\'impression\',\'' + k + '\',this.checked)"> ' + lib + "</label>";
    const enT = '<section class="carte">' + titre("imprimer", "En-tête des ordonnances et courriers") +
      '<label class="chk" style="display:block;margin:6px 0"><input type="radio" name="cfEnt"' + (g ? "" : " checked") + c.disE + ' onchange="cfRegT(\'impression\',\'entete\',\'papier\')"> <b>Papier à en-tête</b> <span class="mesures">(rien n\'est imprimé en haut ; marge du haut ci-dessous)</span></label>' +
      '<label class="chk" style="display:block;margin:6px 0"><input type="radio" name="cfEnt"' + (g ? " checked" : "") + c.disE + ' onchange="cfRegT(\'impression\',\'entete\',\'genere\')"> <b>En-tête et pied imprimés par Onco360</b> <span class="mesures">(papier blanc)</span></label>' +
      '<div style="margin:4px 0 0 26px">' + cb("eLogo", "Logo du lieu d\'exercice du patient (Lieux d\'exercice)") + cb("eNom", "Nom du médecin signataire") + cb("eSpe", "Spécialité") + cb("eInpe", "INPE") + cb("eLieu", "En pied de page : nom, adresse et téléphone du lieu") + "</div>" +
      '<p class="mesures">Chaque médecin publie son nom, sa spécialité et son INPE depuis Mon compte ; la signature est faite à la main sur l\'ordonnance imprimée ; quand le cabinet a plusieurs médecins, on choisit le signataire dans l\'ordonnance.</p></section>' +
      // R-B5 (19/10/2026) : mentions du reçu (identifiants saisis par chaque médecin dans Mon compte › Informations ; vide = non imprimé)
      '<section class="carte">' + titre("imprimer", "Reçus : mentions imprimées") + '<p class="sous">Identifiants du médecin qui a fait l\'acte (Mon compte › Informations) ; l\'adresse du lieu d\'exercice est toujours imprimée. Un identifiant vide n\'est pas imprimé.</p>' +
      [["rSpe", "Spécialité"], ["rInpe", "INPE"], ["rIf", "IF (identifiant fiscal)"], ["rTp", "TP (taxe professionnelle)"], ["rIce", "ICE"], ["recuA4", "Imprimer les reçus en A4 (sinon A5, ramené sur une seule feuille)"]].map(([k, lib]) => '<label class="chk" style="display:block;margin:4px 0"><input type="checkbox"' + (I[k] ? " checked" : "") + c.disE + ' onchange="cfRegB(\'impression\',\'' + k + '\',this.checked)"> ' + lib + "</label>").join("") +
      "</section>"; // T6 (24/10/2026, d. 15) : « Acte exonéré de TVA » et la phrase sur le comptable retirées (absentes du reçu de l'hôpital Cheikh Khalifa)
    return '<section class="carte">' + titre("imprimer", "Marges d'impression (mm)") + '<p class="sous">Haut = hauteur de l\'en-tête déjà imprimé sur votre papier, plus 5 à 10 mm.</p>' +
      [["a5", "Ordonnances A5", "Médicaments, analyses, examens, ordonnances types, courriers"], ["a4", "Ordonnances A4", "Les mêmes, en A4"], ["doc", "Documents A4", "Pli confidentiel, compte rendu, rendez-vous de radiothérapie"]].map(([q, t, sous]) =>
        '<h4 class="soustitre">' + t + '</h4><p class="mesures" style="margin:-4px 0 8px">' + sous + " · par défaut " + REGLAGES0.impression[q].slice(0, 3).join(" / ") + ' mm</p><div class="form" style="grid-template-columns:repeat(3,minmax(0,150px))">' + champ(q, 0, "Haut (en-tête)") + champ(q, 1, "Côtés") + champ(q, 2, "Bas") + "</div>").join("") + "</section>" + agePoids + enT;
  },
  alertes(c) {
    let h = "";
    if (A.D().membre.role === "assistante") {
      // Secrétaire (10/10/2026) : ses alertes sont les siennes (v2.js alertesSecretariat), pas celles du médecin ; temps d'attente de la salle
      h += '<section class="carte">' + titre("alerte", "Vos alertes (cloche)") +
        '<ul class="mesures" style="margin:0;padding-left:18px;line-height:1.7"><li>rendez-vous, cure ou séance pendant une absence du médecin ou un jour férié ;</li><li>rappel WhatsApp à envoyer (rendez-vous dans ' + (ED.reg.whatsapp.de * 24) + " à " + (ED.reg.whatsapp.a * 24) + " h) ;</li><li>rendez-vous d'un patient sans téléphone.</li></ul>" +
        '<p class="mesures">Les alertes médicales sont dans la cloche du médecin.</p></section>';
    } else {
      const RA = ED.reg.alertes, sel = (k, l, lib, suff) => '<div><label for="cfA' + k + '">' + lib + '</label><select id="cfA' + k + '"' + c.disE + ' onchange="cfReg(\'alertes\',\'' + k + "',this.value)\">" + l.map((n) => '<option value="' + n + '"' + (RA[k] === n ? " selected" : "") + ">" + n + " " + suff + "</option>").join("") + "</select></div>";
      h += '<section class="carte">' + titre("alerte", "Alertes de la cloche") + '<div class="form" style="grid-template-columns:repeat(2,minmax(0,280px))">' +
        sel("cure", [1, 2, 3, 4, 5, 7, 10, 14], "Cure prévue : prévenir", "jour(s) avant") + sel("finTrait", [7, 15, 30, 45, 60, 90], "Traitement terminé : signaler pendant", "jours") + "</div>" +
        '</section>';
    }
    const RS = ED.reg.salle, selS = (k, l, lib) => '<div><label for="cfS' + k + '">' + lib + '</label><select id="cfS' + k + '"' + c.disE + ' onchange="cfReg(\'salle\',\'' + k + "',this.value)\">" + l.map((n) => '<option value="' + n + '"' + (RS[k] === n ? " selected" : "") + ">" + n + " min</option>").join("") + "</select></div>";
    h += '<section class="carte">' + titre("horloge", "Salle d'attente : temps d'attente") + '<div class="form" style="grid-template-columns:repeat(2,minmax(0,280px))">' +
      selS("orange", [5, 10, 15, 20, 25, 30, 40, 45, 60], "Orange à partir de") + selS("rouge", [15, 20, 30, 40, 45, 60, 75, 90, 120], "Rouge à partir de") + "</div>" +
      (RS.rouge <= RS.orange ? '<p class="err">Le rouge doit venir après l\'orange.</p>' : "") +
      // Messages à l'écran de la salle d'attente (SA6, 11/10/2026)
      '<div style="display:flex;flex-direction:column;gap:6px;margin-top:10px">' + [["notifArrivee", "Prévenir le médecin quand un patient arrive en salle d'attente"], ["notifRouge", "Prévenir la secrétaire quand une attente passe au rouge"]].map(([k, lib]) => '<label style="font-weight:normal"><input type="checkbox"' + c.disE + (RS[k] !== false ? " checked" : "") + ' onchange="cfRegB(\'salle\',\'' + k + '\',this.checked)" style="width:auto;margin-right:8px">' + lib + "</label>").join("") + "</div></section>";
    return h;
  },
  whatsapp(c) {
    // Messages en liste repliée (audit du 11/10/2026 : l'onglet mesurait 4 000 px) : une ligne par type, un seul message ouvert à la fois
    const esc = A.esc, ex = exempleWa(), RW = ED.reg.whatsapp, jr = (n) => (n === 0 ? "le jour même" : n + " jour" + (n > 1 ? "s" : "") + " avant (" + n * 24 + " h)");
    let h = '<section class="carte">' + titre("horloge", "Bouton WhatsApp vert") + '<div class="form" style="grid-template-columns:repeat(2,minmax(0,220px))">' +
      '<div><label for="cfWde">Vert à partir de</label><select id="cfWde"' + c.disE + ' onchange="cfReg(\'whatsapp\',\'a\',this.value)">' + [1, 2, 3, 4, 5, 7].map((n) => '<option value="' + n + '"' + (RW.a === n ? " selected" : "") + ">" + jr(n) + "</option>").join("") + "</select></div>" +
      '<div><label for="cfWa">jusqu\'à</label><select id="cfWa"' + c.disE + ' onchange="cfReg(\'whatsapp\',\'de\',this.value)">' + [0, 1, 2, 3].map((n) => '<option value="' + n + '"' + (RW.de === n ? " selected" : "") + ">" + jr(n) + "</option>").join("") + "</select></div></div></section>";
    h += '<section class="carte">' + titre("whatsapp", "Messages") + '<div class="wa-l">' + CAT_WA().map(([k, lib, ico]) => {
      const v = ED.wa[k] != null ? ED.wa[k] : WA0[k] || WA0.autre, perso = ED.wa[k] != null && ED.wa[k] !== (WA0[k] || WA0.autre), ouvert = WAO === k;
      return '<div class="wa-i' + (ouvert ? " on" : "") + '"><button type="button" class="wa-t" aria-expanded="' + ouvert + '" onclick="cfWaO(\'' + k + "')\"><span class=\"n\">" + (ico ? A.ic(ico) : "") + esc(lib) + (perso ? ' <span class="badge b-or">personnalisé</span>' : "") + '</span><span class="ap">' + esc(remplir(messageAvecArabe(v, k), ex).replace(/\s+/g, " ")) + '</span><span class="chev" aria-hidden="true">›</span></button>' +
        (ouvert ? '<div class="wa-ed"><div><textarea id="waT_' + k + '" class="notes" rows="7"' + c.disE + ' aria-label="Message : ' + esc(lib) + '" oninput="cfWa(\'' + k + "',this.value)\">" + esc(v) + "</textarea>" +
          (c.okE ? '<div class="wa-v"><span class="mesures">Insérer :</span>' + VARS_WA.map(([n, t]) => '<button type="button" class="puce" title="' + esc(t) + '" onclick="cfWaVar(\'' + k + "','" + n + "')\">{" + n + "}</button>").join("") + (perso ? '<button type="button" class="mini" onclick="cfWaDef(\'' + k + "')\">↺ Message par défaut</button>" : "") + "</div>" : "") +
          '</div><div><span class="mesures">Aperçu</span><div class="wa-ex" id="waEx_' + k + '">' + esc(remplir(messageAvecArabe(v, k), ex)) + "</div>" + (aDeLArabe(v) ? "" : '<p class="mesures" style="margin:4px 0 0">Sans texte en arabe dans ce message : celui de départ est ajouté à la suite à l\'envoi.</p>') + '<p class="mesures" id="waDec_' + k + '" style="margin:4px 0 0;color:var(--orange-t,#8F5600)">' + (arabeDecale(v, k) ? "Le français a changé : l'arabe n'est plus sa traduction (corrigez l'arabe dans le message)." : "") + "</p></div></div>" : "") + "</div>";
    }).join("") + "</div></section>";
    return h;
  },
  // ── Présentation du cabinet, réglée par le médecin titulaire pour toute l'équipe (11/10/2026 ; avant : Administration seulement) ──
  accueil(c) {
    const esc = A.esc, AC = ED.accueil, LIB = Object.fromEntries(CARTES), COLS = [["g", "Gauche"], ["d", "Droite"], ["l", "Pleine largeur"]];
    return '<section class="carte">' + titre("accueil", "Cartes du tableau de bord") + '<p class="sous">Pour toute l\'équipe. Gauche / droite : côte à côte sur un grand écran (à partir de 1 280 px), l\'une sous l\'autre sinon.</p>' +
      '<div class="cf-ord">' + AC.ordre.map((k, i) => '<div class="it' + (AC.cartes[k] === false ? " off" : "") + '"><span class="fl2"><button class="ico" aria-label="Monter" onclick="cfAcBouger(' + i + ',-1)"' + (i && c.ok ? "" : " disabled") + '>↑</button><button class="ico" aria-label="Descendre" onclick="cfAcBouger(' + i + ',1)"' + (i < AC.ordre.length - 1 && c.ok ? "" : " disabled") + ">↓</button></span>" +
        '<label class="chk t"><input type="checkbox"' + (AC.cartes[k] !== false ? " checked" : "") + c.dis + ' onchange="cfAc(\'' + k + "',this.checked)\"> " + esc(LIB[k] || k) + "</label>" +
        '<select aria-label="Place de la carte « ' + esc(LIB[k] || k) + ' »"' + c.dis + ' onchange="cfAcCol(\'' + k + "',this.value)\">" + COLS.map(([v, l]) => '<option value="' + v + '"' + ((AC.col || {})[k] === v ? " selected" : "") + ">" + l + "</option>").join("") + "</select></div>").join("") + "</div></section>";
  },
  fiche() {
    // 3.11 : ✎ = tout le champ (nom, type, liste, unité, partie, impression, en-tête) ; listes du cabinet (localisations, stades…) ouvertes depuis leur champ
    if (!FE) FE = editeurFiche(ED.fiche, A.D().bib ? "spe" : "cabinet", false, { ouvrirListe: (k) => { LS = k; LQ = ""; FICHE_LS = true; window.cfOnglet("listes"); }, tailleListe: (k) => (ED.listes[k] || []).length });
    return '<section class="carte edf">' + titre("profil", "Fiche patient") + '<p class="sous">Ordre et présence des champs ; ✎ = nom, type, liste, partie, impression ; « en-tête » = affiché sous le nom du patient. Un champ décoché est caché, sa valeur est gardée.</p>' + FE.html() + "</section>";
  },
  consultation() {
    if (!CE) CE = editeurFiche(ED.consultation, A.D().bib ? "spe" : "cabinet", true, { types: () => ED.typesC.map((t) => t.nom) }); // 3.13 : types du référentiel
    return '<section class="carte edf">' + titre("stetho", "Formulaire de consultation") + '<p class="sous">Un onglet par formulaire (ses champs, dans l\'ordre) ; le formulaire de chaque type se choisit dans Types de consultation.</p>' + CE.html() + "</section>";
  },
};
// 3.13 : référentiel des types (nom : ancien nom gardé pour les consultations déjà enregistrées ; formulaire suivi avec le nom)
window.cfTy = (i, f, v) => { const t = ED.typesC[i]; if (!t) return;
  if (f === "nom") { const n = String(v || "").replace(/\s+/g, " ").trim(); if (!n) { pageConfiguration(); return; }
    if (ED.typesC.some((z, j) => j !== i && z.nom.toLowerCase() === n.toLowerCase())) { A.toast("Un autre type porte déjà ce nom."); pageConfiguration(); return; }
    const tf = ED.consultation.typesForm = ED.consultation.typesForm || {}, f0 = formDuType(ED.consultation, t.nom); ED.typesC[i] = renommer(t, n); tf[n] = f0; delete tf[t.nom]; modif(true); return; }
  if (f === "rdv") { t.rdv = !!v; modif(); return; }
  if (f === "form") { (ED.consultation.typesForm = ED.consultation.typesForm || {})[t.nom] = v; modif(); return; }
};
window.cfTyMaj = () => modif();
// 3.13 bis : « Comment il est prévu » = pris à la main (t.rdv) et / ou créé d'office (reglages.auto)
window.cfTyMode = (i, v) => { const t = ED.typesC[i], au = t && AUTO_TY[t.k]; if (!t) return; t.rdv = v === "main" || v === "les2"; if (au) ED.reg.auto[au[0]] = v === "office" || v === "les2"; modif(); };
const aide = (lib) => "<span>" + lib + "</span>"; // 26/10/2026 (style minimaliste) : plus de « ? » à côté des colonnes
window.A_aide = (b) => A.toast(b.title);
window.cfTyBouger = (i, d) => { const L = ED.typesC, j = i + d; if (j < 0 || j >= L.length) return; [L[i], L[j]] = [L[j], L[i]]; modif(true); };
window.cfTyAj = () => { const nom = prompt("Nom du nouveau type de consultation (ex. Deuxième avis) :"); if (!nom || !nom.trim()) return; const n = nom.replace(/\s+/g, " ").trim().slice(0, 80);
  if (ED.typesC.some((z) => z.nom.toLowerCase() === n.toLowerCase())) { A.toast("Ce type existe déjà."); return; }
  ED.typesC.push({ k: nouvelleCle(ED.typesC, n), nom: n, rdv: true, anciens: [] }); modif(true); };
window.cfTySup = (i) => { const t = ED.typesC[i]; if (!t || estStd(t.k)) return; if (!confirm("Retirer le type « " + t.nom + " » ?\nIl ne sera plus proposé ; les rendez-vous et consultations déjà enregistrés gardent leur nom.")) return; ED.typesC.splice(i, 1); modif(true); };
window.cfDureeT = (k, v) => { ED.durees = ED.durees || {}; if (+v) ED.durees[k] = +v; else delete ED.durees[k]; modif(); };
const VARS_WA = [["prenom", "Prénom"], ["nom", "Nom complet"], ["jour", "mardi 14 octobre"], ["heure", "« à 10h00 » (vide sans heure)"], ["jour_ar", "le jour en arabe"], ["heure_ar", "l'heure en arabe (vide sans heure)"], ["lieu", "Établissement"], ["adresse", "Adresse"], ["medecin", "Nom du médecin"]];
let WAO = null; // message WhatsApp ouvert
let FE = null, CE = null; // éditeurs de la fiche patient et du formulaire de consultation (gardés tant que la saisie dure)
// Base des retouches du cabinet : fiche et formulaire réglés par l'administration (spécialité + retouches de l'administration)
const baseFiche = () => ficheEffective(null, (D().regAdmin || D().reg).fiche), baseConsult = () => consultEffective(null, (D().regAdmin || D().reg).consultation);
const ficheCab = () => formEffectif(FICHE, (D().formCab || {}).fiche || null, (D().regAdmin || D().reg).fiche);
const consultCab = () => formEffectif(CONSULT, (D().formCab || {}).consultation || null, (D().regAdmin || D().reg).consultation);
const accueilCab = () => JSON.parse(JSON.stringify(accueilEffectif(D().reg, D().accueilCab || null)));

export function pageConfiguration(arg) {
  if (arg === "acces") { location.replace("#profil/acces"); return; } // ancien lien : l'onglet Accès est dans Mon compte
  // Onglets du titulaire (Accès, Journal d'audit) connus un instant plus tard : l'onglet demandé par le lien est ouvert ensuite
  if (TIT === null) { TIT = false; titulaireConnecte().then((v) => { TIT = v; const dem = (location.hash.match(/^#parametres\/([^/?]+)/) || [])[1]; if (v && location.hash.startsWith("#parametres") && !MOD) pageConfiguration(dem); }).catch(() => {}); }
  if (arg === "rdvauto") arg = "types"; // 3.13 : rendez-vous créés d'office réglés avec leur type
  if (arg === "documents" || arg === "taches") { LS = arg; arg = "listes"; history.replaceState(null, "", "#parametres/listes"); } // Lot D : sous-onglets de Listes
  if (arg && ONGLETS().some((o) => o[0] === arg)) ONG = arg;
  if (!ONGLETS().some((o) => o[0] === ONG)) ONG = (ONGLETS()[0] || ["horaires"])[0]; // 1re rubrique présente (réglage du cabinet)
  DERN[famDe(ONG)] = ONG;
  if (ONG === "activites") { pageParametres(); return; }
  if (ONG === "laboratoires") { pageLaboratoires(); return; } // 26/10/2026 : carnet des laboratoires (laboratoires.js)
  const relire = () => { if (!MOD && location.hash.startsWith("#parametres")) { ED = null; pageConfiguration(); } };
  if (COUL === null) { COUL = {}; getDoc(doc(db, "espaces", A.ESPACE, "parametres", "couleursAgenda")).then((s) => { COUL = s.exists() ? JSON.parse(s.data().data || "{}") : {}; relire(); }).catch(() => {}); }
  if (AUTO === null) { AUTO = reglesAutoC({}); Promise.all([getDoc(doc(db, "espaces", A.ESPACE, "parametres", "tachesAuto")).catch(() => null), listeMembres().catch(() => [])]).then(([sa, mb]) => { let c = {}; try { c = sa && sa.exists() ? JSON.parse(sa.data().data || "{}") : {}; } catch (e) { /* illisible */ } AUTO = reglesAutoC(c); MBR = mb; relire(); }); }
  if (TTA === null) { TTA = []; typesTaches().then((L) => { TTA = L.filter((t) => t !== TYPE_RT); relire(); }).catch(() => {}); }
  if (!configChargee()) chargerConfigRcp().then(relire).catch(() => {});
  if (TDOC === null) { TDOC = []; typesDocuments().then((L) => { TDOC = L.slice(); relire(); }).catch(() => {}); }
  if (!ED || !MOD) {
    ED = { horaires: copie(horaires()), horairesEtab: copie(D().cal.horairesEtab || {}), durees: copie(D().cal.durees || {}), abs: copie(D().cal.abs || []), feries: copie(D().cal.feries || []), wa: Object.assign({}, D().wa || {}), reg: reglages(), listes: Object.assign({ diag: listeDiag().slice(), stade: listeTum("stade"), grade: listeTum("grade"), mut: listeMut(), cor: listeCor() }, listesMedDe(listeMed)), listesOrig: Object.assign({ diag: listeDiag().slice(), stade: listeTum("stade"), grade: listeTum("grade"), mut: listeMut(), cor: listeCor() }, listesMedDe(listeMed)), coul: Object.assign({}, COULEURS0, COUL), tdoc: TDOC.slice(), ttache: TTA.slice(), auto: JSON.parse(JSON.stringify(AUTO)), rcp: configRcp(),
      accueil: accueilCab(), fiche: ficheCab(), consultation: consultCab(), typesC: copie(A.typesC ? A.typesC() : []) };
    FE = null; CE = null;
  }
  const ok = A.peut("parametres"), dis = ok ? "" : " disabled";
  // Paramètres du secrétariat (droit « secretariat », 10/10/2026) : absences, horaires de ses lieux, listes, types de tâches et de
  // documents, bouton WhatsApp vert ; okE / disE = ce que la personne peut modifier dans la rubrique affichée
  const sec = !ok && secretariat(), okE = ok || (sec && ONGLETS_SEC.indexOf(ONG) >= 0), disE = okE ? "" : " disabled";
  let h = entete();
  if (!ok && !(ONG === "bibliotheques" && A.peut("ecrireConsultations")) && !(okE && !MSG_SEC[ONG])) h += '<p class="mesures">' + (ONG === "couleurs" ? "Votre Google Agenda et ses couleurs : réglages personnels." : sec && MSG_SEC[ONG] ? MSG_SEC[ONG] : "Lecture seule : la modification demande le droit « paramètres ».") + "</p>";
  h += (RUBRIQUES[ONG] || RUBRIQUES.fermetures)({ ok, okE, disE, dis, sec });
  if (okE && ["bibliotheques", "vigilances", "lieux", "acces", "audit", "export"].indexOf(ONG) < 0) h += '<div class="barre-enr">' + (ok || ["horaires", "fermetures"].indexOf(ONG) < 0 ? '<button class="bt gris" onclick="cfDefaut()">↺ Valeurs par défaut</button>' : "<span></span>") + '<span id="cfMod" class="mesures' + (MOD ? "" : " cache") + '">Modifications non enregistrées</span><button class="bt plein" id="cfOk" onclick="cfEnregistrer()"><svg class="pi"><use href="#i-enregistrer"/></svg>Enregistrer</button></div>';
  A.$("page").innerHTML = h + "</div></div>"; // fin de .cf-main et .cf-lay (menu à gauche)
  // 26/10/2026 (demande de Dr Bentahila, style minimaliste) : plus de phrase d'explication sous les titres, ni de « ? » (avant : 3.10, bulle « ? »
  // pour les explications longues) ; une ligne qui porte un bouton, un lien ou un champ reste
  document.querySelectorAll("#page section.carte > h3 + p.sous").forEach((p) => { if (!p.querySelector("button, a, input, select")) p.classList.add("cache"); });
  if (A.$("cfProfil")) { const o = ONG === "couleurs" ? "gagenda" : ONG; htmlOngletProfil(o).then((x) => { const z = A.$("cfProfil"); if (z && ONG === (o === "gagenda" ? "couleurs" : o)) { z.innerHTML = x; apresOngletProfil(o); } }).catch((e) => { const z = A.$("cfProfil"); if (z) z.innerHTML = '<p class="sous" style="color:var(--rouge)">Lecture impossible : ' + A.esc(e.message || String(e)) + "</p>"; }); }
  if (ONG === "audit") afficherAudit(A.$("cfAudit"));
  if (ONG === "export") afficherRecuperation();
  if (ONG === "listes" && A.$("cfLq")) { listeL(); A.$("cfLq").oninput = () => { LQ = A.$("cfLq").value; listeL(); }; }
  // Fiche patient, formulaire de consultation : l'éditeur commun avec l'Administration (editeurfiche.js) ; toute action = modification
  if (ONG === "fiche" || ONG === "consultation") { const E = ONG === "fiche" ? FE : CE, z = document.querySelector(".edf"); E.brancher(() => modif(true)); if (z) z.addEventListener("change", () => modif()); }
  if (ONG === "bibliotheques") [["medicaments", ["medicaments"], [["médicament", "médicaments"]]], ["ordostypes", ["ordostypes"], [["ordonnance type", "ordonnances types"]]], ["analyses", ["analyses", "bilans"], [["analyse", "analyses"], ["bilan", "bilans"]]], ["examens", ["examens"], [["examen", "examens"]]], ["courriers", ["courriers"], [["modèle", "modèles"]]]].forEach(([k, ls, mots]) =>
    Promise.all(ls.map((n) => tailleListe(n))).then((t) => { const e = A.$("cfBn-" + k); if (e) e.textContent = t.map((v, i) => v + " " + mots[i][v > 1 ? 1 : 0]).join(" · "); }).catch(() => {}));
}
export const remplir = (m, v) => String(m || "").replace(/\{(\w+)\}/g, (t, k) => (v[k] != null ? v[k] : t)).replace(/[ \t]+([.,])/g, "$1").replace(/ {2,}/g, " ");
const modif = (redessiner) => { MOD = true; if (redessiner) pageConfiguration(); else { const m = A.$("cfMod"); if (m) m.classList.remove("cache"); } };
window.cfOnglet = (o) => { ONG = o; history.replaceState(null, "", "#parametres/" + o); pageConfiguration(); }; // l'onglet reste après un rechargement
// Famille : sa dernière rubrique ouverte, sinon la première présente
window.cfFamille = (f) => { const L = ONGLETS().filter((o) => famDe(o[0]) === f), o = L.some((x) => x[0] === DERN[f]) ? DERN[f] : (L[0] || [])[0]; if (o) window.cfOnglet(o); };
const HC = () => (HET ? ED.horairesEtab[HET] : ED.horaires);
window.cfEtab = (c) => { HET = c; pageConfiguration(); };
window.cfPropre = (on) => { if (on) ED.horairesEtab[HET] = copie(ED.horaires); else delete ED.horairesEtab[HET]; modif(true); };
window.cfDuree = (v) => { HC().duree = parseInt(v, 10) || 30; modif(); };
window.cfJour = (j, on) => { HC().jours[j] = on ? [["08:30", "18:00"]] : []; modif(true); };
window.cfPlage = (j, k, b, v) => { HC().jours[j][k][b] = v; modif(); };
window.cfAjPlage = (j) => { const l = HC().jours[j], der = l[l.length - 1]; l.push([der ? der[1] : "14:00", "18:00"]); modif(true); };
window.cfSupPlage = (j, k) => { HC().jours[j].splice(k, 1); modif(true); };
// Exemple de message : le premier lieu d'exercice et le nom du médecin connecté (ou du titulaire)
// Lieux du membre connecté (secrétaire d'un centre : les siens seulement)
const lieuxMembre = () => { const m = D().membre, l = D().etabs || []; return m.tousEtablissements ? l : l.filter((e) => (m.etablissements || []).indexOf(e.code) >= 0); };
const exempleWa = () => { const p = D().profil || {}, nomDr = D().membre.role === "medecin" ? (p.nom || D().membre.nom || "") : ((D().medTitulaire && D().medTitulaire.nom) || D().nomTitulaire || ""); return { prenom: "Fatima", nom: "ALAOUI Fatima", jour: "mardi 14 octobre", heure: "à 10h00", jour_ar: "الثلاثاء 14 أكتوبر", heure_ar: heureAr("10:00"), lieu: (lieuxMembre()[0] || {}).nom || "Clinique", adresse: "", medecin: "Dr " + String(nomDr).replace(/^(Dr|Pr)\.?\s*/i, "").toUpperCase() }; };
window.cfWa = (k, v) => { ED.wa[k] = v; const e = A.$("waEx_" + k); if (e) e.textContent = remplir(messageAvecArabe(v, k), exempleWa()); const w = A.$("waDec_" + k); if (w) w.textContent = arabeDecale(v, k) ? "Le français a changé : l'arabe n'est plus sa traduction (corrigez l'arabe dans le message)." : ""; modif(); };
window.cfWaDef = (k) => { delete ED.wa[k]; modif(true); };
window.cfWaO = (k) => { WAO = WAO === k ? null : k; pageConfiguration(); const t = A.$("waT_" + k); if (t) t.focus(); };
// Variable insérée à la place du curseur
window.cfWaVar = (k, n) => { const t = A.$("waT_" + k); if (!t) return; const a = t.selectionStart, b = t.selectionEnd, v = "{" + n + "}"; t.value = t.value.slice(0, a) + v + t.value.slice(b); t.focus(); t.selectionStart = t.selectionEnd = a + v.length; window.cfWa(k, t.value); };
// Tableau de bord du cabinet : ordre, présence, colonne de chaque carte (parametres/accueil)
window.cfAc = (k, v) => { ED.accueil.cartes[k] = !!v; modif(true); };
window.cfAcCol = (k, v) => { ED.accueil.col = ED.accueil.col || {}; ED.accueil.col[k] = v; modif(); };
window.cfAcBouger = (i, d) => { const L = ED.accueil.ordre, j = i + d; if (j < 0 || j >= L.length) return; [L[i], L[j]] = [L[j], L[i]]; modif(true); };
// ───── Tâches automatiques : une carte par règle (actif, titre, type, responsable, délai) ; + règle du médecin ─────
function sectionAuto(ok, dis) {
  const esc = A.esc, types = ED.ttache.concat([TYPE_RT]), mb = (MBR || []).filter((m) => m.actif !== false);
  // dosimétrie et fin de RT : validées par un médecin seulement, donc responsable = un médecin
  const optsPour = (v, fixe) => '<option value="titulaire"' + (v === "titulaire" ? " selected" : "") + ">Médecin titulaire</option>" + mb.filter((m) => !fixe || m.role === "medecin").map((m) => '<option value="' + esc(m.uid) + '"' + (m.uid === v ? " selected" : "") + ">" + esc(m.nom || m.email) + "</option>").join("") + (v !== "titulaire" && !mb.some((m) => m.uid === v) ? '<option value="' + esc(v) + '" selected>(n\'a plus accès : médecin titulaire)</option>' : "");
  return '<section class="carte" data-fn="taches.auto"><h3><span class="ic">' + A.ic("horloge") + '</span>Tâches automatiques</h3><p class="sous">Créées une seule fois par patient et par événement, pour la personne choisie (Tâches, dossier, Google Agenda si échéance).</p>' +
    ED.auto.map((R, i) => { const E = EV_AUTO[R.ev] || ["?", ""];
      return '<div class="cf-auto' + (R.actif === false ? " off" : "") + '"><div class="t"><label class="chk"><input type="checkbox"' + (R.actif !== false ? " checked" : "") + dis + ' onchange="cfAuto(' + i + ',\'actif\',this.checked)"> <b>' + esc(E[0]) + "</b></label>" + (R.fixe ? '<span class="badge b-gr">fixe</span>' : ok ? sup("cfAutoSup(" + i + ")", "Supprimer cette tâche automatique") : "") + '</div><p class="mesures">' + esc(E[1]) + "</p>" +
        '<div class="form" style="grid-template-columns:2fr 1fr 1fr' + (E[2] ? " 120px" : "") + '"><div><label>Titre de la tâche</label><input value="' + esc(R.titre) + '"' + dis + ' onchange="cfAuto(' + i + ',\'titre\',this.value)"></div>' +
        '<div><label>Type</label><select' + dis + ' onchange="cfAuto(' + i + ',\'type\',this.value)">' + types.concat(R.type && types.indexOf(R.type) < 0 ? [R.type] : []).map((t) => "<option" + (t === R.type ? " selected" : "") + ">" + esc(t) + "</option>").join("") + "</select></div>" +
        '<div><label>Pour</label><select' + dis + ' onchange="cfAuto(' + i + ',\'pour\',this.value)">' + optsPour(R.pour || "titulaire", R.fixe) + "</select></div>" +
        (E[2] ? '<div><label>' + esc(E[2]) + '</label><input type="number" min="0" max="365" value="' + esc(R.n == null ? 0 : R.n) + '"' + dis + ' onchange="cfAuto(' + i + ',\'n\',this.value)"></div>' : "") + "</div></div>";
    }).join("") +
    (ok ? '<div class="actr" style="justify-content:flex-start;margin-top:10px"><select id="cfAutoEv">' + Object.keys(EV_AUTO).filter((k) => !AUTO_FIXES.some((f) => f.ev === k)).map((k) => '<option value="' + k + '">' + esc(EV_AUTO[k][0]) + "</option>").join("") + '</select><button class="bt clair petit" onclick="cfAutoAj()">' + A.ic("plus") + "Ajouter une tâche automatique</button></div>" : "") + "</section>";
}
window.cfAuto = (i, k, v) => { const R = ED.auto[i]; if (k === "n") v = Math.max(0, parseInt(v, 10) || 0); R[k] = v; if (k === "actif" && v && !R.fixe) R.depuis = D().t; modif(k === "actif"); };
window.cfAutoSup = (i) => { if (!ED.auto[i] || ED.auto[i].fixe) return; ED.auto.splice(i, 1); modif(true); };
window.cfAutoAj = () => {
  const ev = A.val("cfAutoEv"), def = { derniereCure: ["Dernière cure : prévoir la suite (bilan, consultation)", 7], nonVenu: ["Rappeler le patient (rendez-vous manqué)", 1], nouveauPatient: ["Nouveau patient : compléter le dossier", 2], apresFinRT: ["Consultation de contrôle après radiothérapie", 3], veilleJ1: ["Préparer la cure de demain", 0] }[ev] || ["Tâche", 0];
  ED.auto.push({ id: "a" + Date.now().toString(36), ev, actif: true, titre: def[0], type: ED.ttache[0] || TYPE_RT, pour: "titulaire", n: def[1], depuis: D().t }); modif(true);
};
// ───── Google Agenda : ce que CHAQUE personne met dans son agenda (P3, 08/10/2026) ─────
// utilisateurs/{uid}.agendaFiltre = { exclus: [clés] } ; mêmes clés que cleFiltre (functions/logique.js). Les catégories suivent
// les types de consultation (activités des Paramètres) et les types de tâches ajoutés au fur et à mesure ; nouvelles = cochées.
function categoriesAgenda() {
  // 3.13 (12/10/2026) : les types de consultation du référentiel (pris en rendez-vous, ou créés d'office) ; clés d'avant (rdv:annonce…,
  // rdv:act:<nom en minuscules> pour un type ajouté) : les choix déjà faits sont gardés
  const STDF = { annonce: "rdv:annonce", suivi: "rdv:suivi", controle: "rdv:controle", hospit: "rdv:hospit", rtc: "rdv:rtc", rtf: "rdv:rtfin" };
  const typesC = (A.typesC ? A.typesC() : []).filter((t) => t.k !== "cchimio" && (t.rdv || STDF[t.k]));
  const types = (TTA && TTA.length ? TTA : TYPES_TACHES0).concat([TYPE_RT]);
  return [
    ["Rendez-vous", typesC.map((t) => [STDF[t.k] || "rdv:act:" + t.nom.toLowerCase(), t.nom])],
    ["Chimiothérapie", [["chimio:cure", "Cures (J1)"], ["chimio:seance", "Séances J8, J15…"]]],
    ["Radiothérapie", [["rt:scan", "Scanner de centrage"], ["rt:deb", "1re séance"], ["rt:fin", "Fin de radiothérapie prévue"]]],
    ["Tâches dont vous êtes responsable (avec une échéance)", types.map((t) => ["tache:" + t, t]).concat([["tache:", "Tâches sans type"]])],
  ].concat(D().membre.role === "medecin" ? [["Cabinet", [["abs", "Absences et congés (agenda du médecin titulaire)"]]]] : []);
}
// Ce que la personne veut voir, pour le cabinet ouvert (19.2, 10/10/2026) : agendaFiltre.cabinets[cabinet].exclus, sinon le réglage
// d'avant (agendaFiltre.exclus) ; même lecture côté serveur (functions/index.js filtreCabinet)
const filtreIci = () => { const f = (D().profil && D().profil.agendaFiltre) || {}; return (f.cabinets && f.cabinets[A.ESPACE]) || f; };
const nomCabinetIci = () => ((D().cabinets || []).find((c) => c.e === A.ESPACE) || {}).nom || "";
function sectionMonAgenda() {
  const esc = A.esc, ex = filtreIci().exclus || [], ag = D().profil && D().profil.agendaGoogle, cab = (D().cabinets || []).length > 1 ? nomCabinetIci() : "";
  return '<section class="carte" data-fn="gagenda.filtre"><h3><span class="ic">' + A.ic("agenda") + '</span>Votre Google Agenda : ce qui y apparaît' + (cab ? " pour « " + esc(cab) + " »" : "") + "</h3>" + (cab ? '<p class="mesures">Vous travaillez pour plusieurs cabinets : un seul agenda « Onco360 » les réunit (le nom du cabinet est ajouté à chaque événement). Ces cases valent pour ce cabinet ; pour un autre, choisissez-le dans le menu « Cabinet ».</p>' : "") + "" +
    (ag && ag.calendrier ? "" : '<p class="mesures" style="color:var(--orange)">Votre Google Agenda n\'est pas encore relié (case « Mon Google Agenda » ci-dessus) : ce réglage servira dès que vous le relierez.</p>') +
    categoriesAgenda().map(([titre, l]) => '<h4 class="soustitre">' + esc(titre) + '</h4><div class="cf-ag">' + l.map(([k, lib]) => '<label class="chk"><input type="checkbox"' + (ex.indexOf(k) < 0 ? " checked" : "") + ' data-k="' + esc(k) + '" onchange="cfAgenda(this)"> ' + esc(lib) + "</label>").join("") + "</div>").join("") + "</section>";
}
window.cfAgenda = async (cb) => {
  const k = cb.dataset.k, P = D().profil || (D().profil = {}), ex = (filtreIci().exclus || []).filter((x) => x !== k);
  if (!cb.checked) ex.push(k);
  const f0 = P.agendaFiltre || {}, f = Object.assign({}, f0, { cabinets: Object.assign({}, f0.cabinets || {}, { [A.ESPACE]: { exclus: ex } }), le: new Date().toISOString() });
  try {
    await setDoc(doc(db, "utilisateurs", D().u.uid), { agendaFiltre: f }, { merge: true });
    P.agendaFiltre = f; A.toast(cb.checked ? "Ajouté à votre Google Agenda." : "Retiré de votre Google Agenda.");
  } catch (e) { cb.checked = !cb.checked; A.toast("Enregistrement impossible : " + ((e && e.message) || e)); }
};
// Onglet Listes : affichage filtré (la recherche garde le curseur), nombre de dossiers qui utilisent chaque nom
let LS = "mut", LQ = "", FICHE_LS = false; // 3.11 : localisations, stades, grades ouverts depuis leur champ de la fiche (FICHE_LS : « Retour à la fiche »)
function listeL() {
  const z = A.$("cfLl"); if (!z) return;
  const champ = { diag: "diag", mut: "mut", cor: "cor" }[LS], n = {}, ok = (A.peut("parametres") || secretariat()) && diagModifiable(), esc = A.esc, med = LISTES_MED.some((z) => z[0] === LS);
  if (med) D().patients.forEach((x) => { new Set(elementsMed(((x.doc.clinique || {})[LS]) || "", LS).map((e) => e.lib.trim().toLowerCase())).forEach((v) => { if (v) n[v] = (n[v] || 0) + 1; }); }); // lot A : une ligne par élément
  else D().patients.forEach((x) => { const v = String((champ ? x.P && x.P[champ] : (((x.doc.clinique || {}).extra) || {})["xt" + LS]) || "").trim().toLowerCase(); if (v) n[v] = (n[v] || 0) + 1; });
  const mots = A.sansAcc(LQ).split(/\s+/).filter(Boolean), L = ED.listes[LS].map((t, i) => ({ t, i })).filter(({ t }) => !t || mots.every((w) => A.sansAcc(t).indexOf(w) >= 0));
  z.innerHTML = L.length ? L.map(({ t, i }) => { const c = n[String(t).trim().toLowerCase()] || 0;
    return '<div class="it"><input value="' + esc(t) + '"' + (ok ? "" : " disabled") + ' aria-label="Nom" onchange="cfL(' + i + ',this.value)"><span class="mesures nb">' + (c ? c + " dossier" + (c > 1 ? "s" : "") : "") + "</span>" + (ok ? sup("cfLSup(" + i + ")", "Retirer « " + esc(t) + " »") : "") + "</div>"; }).join("")
    : '<p class="sous">Rien ne correspond.</p>';
}
window.cfLs = (k) => { LS = k; LQ = ""; FICHE_LS = false; pageConfiguration(); };
window.cfRetourFiche = () => { LS = "mut"; LQ = ""; FICHE_LS = false; window.cfOnglet("fiche"); };
window.cfExporter = async () => {
  const b = A.$("cfExp"), msg = (t) => { const z = A.$("cfExpMsg"); if (z) z.textContent = t; };
  A.occupe(b, true); msg("Préparation de l'export par le serveur… (une à deux minutes)");
  try {
    const r = await appelLong("exporterCabinet", { espace: A.ESPACE }); // délai long (R-F6) : un gros cabinet prend plusieurs minutes
    msg("Téléchargement (" + Math.round(r.taille / 1024) + " Ko)…");
    const { getStorage, ref, getBlob } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js");
    const blob = await getBlob(ref(getStorage(app), r.chemin)), u = URL.createObjectURL(blob), a = document.createElement("a");
    a.href = u; a.download = r.chemin.split("/").pop(); document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 60000);
    msg("Export téléchargé : " + r.patients + " dossier(s), " + r.fichiers + " document(s) déposé(s), " + r.documentation + " fiche(s) de documentation" +
      (r.manquants ? " ; " + r.manquants + " fichier(s) introuvable(s) dans le stockage" : "") + ". Il est dans le dossier Téléchargements de cet ordinateur.");
  } catch (e) { msg(""); A.toast("Export impossible : " + ((e && e.message) || e)); }
  A.occupe(b, false);
};
// Lot A §6 (25/10/2026) : listes des informations médicales (allergies, antécédents médicaux, chirurgicaux, familiaux, traitements en cours)
const listesMedDe = (f) => Object.fromEntries(LISTES_MED.map(([k]) => [k, f(k).slice().sort((a, z) => a.localeCompare(z, "fr"))]));
// Diagnostics : modifiés par un médecin seulement (1.3, 11/10/2026 ; le serveur ne corrige un diagnostic dans les dossiers que pour un médecin)
const diagModifiable = () => ["diag", "stade", "grade"].indexOf(LS) < 0 || !!A.D().bib || (A.D().membre && A.estMed());
// Stades et grades de la fiche tumeur (3.1 bis) : liste du cabinet (parametres/listes), sinon celle du catalogue
const listeTum = (k) => { const L = D().listes || {}; return (Array.isArray(L[k]) && L[k].length ? L[k] : k === "stade" ? STADES : GRADES).slice(); };
window.cfL = (i, v) => { ED.listes[LS][i] = String(v || "").trim(); modif(); };
window.cfLSup = (i) => { ED.listes[LS].splice(i, 1); ED.listesOrig[LS].splice(i, 1); modif(); listeL(); };
window.cfLAj = () => { LQ = ""; ED.listes[LS].push(""); ED.listesOrig[LS].push(""); modif(true); setTimeout(() => { const l = document.querySelectorAll("#cfLl input"); if (l.length) { l[l.length - 1].scrollIntoView({ block: "center" }); l[l.length - 1].focus(); } }, 30); };
window.cfBib = (n) => gererListe(n);
window.cfRegB = (g, k, v) => { ED.reg[g][k] = !!v; modif(); };
window.cfPartie = (k, v) => { ED.reg.dossier.parties = Object.assign({}, ED.reg.dossier.parties, { [k]: !!v }); modif(); };
window.cfVisionneuse = (v) => { const p = D().profil = D().profil || {}; p.dossier = Object.assign({}, p.dossier || {}, { visionneuse: v }); try { localStorage.removeItem("onco360.visionneuseGrande"); } catch (e) { /* stockage indisponible */ }
  setDoc(doc(db, "utilisateurs", D().u.uid), { dossier: p.dossier }, { merge: true }).then(() => A.toast("Réglage enregistré.")).catch((e) => A.toast("Réglage non enregistré : " + e.message)); };
window.cfRetablirDossier = () => { ["onco360.visionneuseGrande", "onco360.dossierAgrandi", "onco360.dossierParties", "onco360.menuReplieDossier"].forEach((k) => { try { localStorage.removeItem(k); } catch (e) { /* stockage indisponible */ } }); A.toast("Affichage du dossier rétabli (sur cet appareil)."); };
window.cfRegT = (g, k, v) => { ED.reg[g][k] = String(v); modif(true); }; // réglage texte (3.9 : en-tête des ordonnances)
window.cfReg = (g, k, v) => { ED.reg[g][k] = parseInt(v, 10) || 0; modif(g === "salle"); };
window.cfImp = (q, n, v) => { const x = parseInt(v, 10); ED.reg.impression[q][n] = isNaN(x) ? REGLAGES0.impression[q][n] : Math.max(0, Math.min(150, x)); modif(); };
window.cfCoul = (k, c) => { ED.coul[k] = c; modif(true); };
// Couleurs personnelles (sans le droit « paramètres ») : seulement ce qui diffère des couleurs du cabinet
async function ecrireCoulPerso(PC) {
  const P = D().profil || (D().profil = {});
  const ref = doc(db, "utilisateurs", D().u.uid); // updateDoc : le champ est remplacé en entier (une couleur remise au défaut disparaît)
  try { await updateDoc(ref, { agendaCouleurs: PC }).catch((e) => { if (e && e.code === "not-found") return setDoc(ref, { agendaCouleurs: PC }, { merge: true }); throw e; }); P.agendaCouleurs = PC; A.toast("Couleurs de votre Google Agenda enregistrées."); pageConfiguration(); }
  catch (e) { A.toast("Enregistrement impossible : " + ((e && e.message) || e)); }
}
window.cfCoulPerso = (k, c) => { const PC = Object.assign({}, (D().profil && D().profil.agendaCouleurs) || {}); if (c === (ED.coul[k] != null ? ED.coul[k] : "")) delete PC[k]; else PC[k] = c; ecrireCoulPerso(PC); };
window.cfCoulPersoDef = () => ecrireCoulPerso({});
window.cfTd = (i, v) => { ED.tdoc[i] = String(v || "").trim(); modif(); };
window.cfTdBouger = (i, s) => { const L = ED.tdoc, j = i + s; if (j < 0 || j >= L.length) return; const t = L[i]; L[i] = L[j]; L[j] = t; modif(true); };
window.cfTdSup = (i) => { ED.tdoc.splice(i, 1); modif(true); };
window.cfTt = (i, v) => { ED.ttache[i] = String(v || "").trim(); modif(); };
window.cfTtBouger = (i, s) => { const L = ED.ttache, j = i + s; if (j < 0 || j >= L.length) return; const t = L[i]; L[i] = L[j]; L[j] = t; modif(true); };
window.cfTtSup = (i) => { ED.ttache.splice(i, 1); modif(true); };
window.cfTtAj = () => { ED.ttache.push(""); modif(true); setTimeout(() => { const l = document.querySelectorAll(".cf-td input:not([disabled])"); if (l.length) l[l.length - 1].focus(); }, 30); };
window.cfTdAj = () => { ED.tdoc.push(""); modif(true); setTimeout(() => { const l = document.querySelectorAll(".cf-td input"); if (l.length) l[l.length - 1].focus(); }, 30); };
window.cfAbs = (i, f, v) => { if (v) ED.abs[i][f] = v; else delete ED.abs[i][f]; modif(f === "du"); };
window.cfAjAbs = () => { const t = D().t; ED.abs.push({ du: t, au: t, m: "" }); modif(true); };
window.cfSupAbs = (i) => { ED.abs.splice(i, 1); modif(true); };
window.cfFer = (i, f, v) => { ED.feries[i][f] = v; modif(f === "d"); };
window.cfAjFer = () => { ED.feries.push({ d: D().t, nom: "Jour férié" }); modif(true); };
window.cfSupFer = (i) => { ED.feries.splice(i, 1); modif(true); };
window.cfRcpJour = (j) => { const l = ED.rcp.jours, i = l.indexOf(j); if (i >= 0) l.splice(i, 1); else l.push(j); modif(true); };
window.cfRcp = (k, v) => { ED.rcp[k] = String(v || "").trim(); modif(false); };
window.cfRcpAj = (k) => { ED.rcp[k].push(D().t); modif(true); };
window.cfRcpSup = (k, i) => { ED.rcp[k].splice(i, 1); modif(true); };
window.cfRcpDate = (k, i, v) => { ED.rcp[k][i] = v; modif(true); };
window.cfDefaut = () => {
  if (ONG === "accueil") { if (!confirm("Revenir aux cartes du tableau de bord réglées pour votre formule ?")) return; ED.accueil = JSON.parse(JSON.stringify(accueilEffectif(D().reg, null))); modif(true); return; }
  if (ONG === "fiche") { if (!confirm("Revenir à la fiche patient de départ ?\nLes champs ajoutés par le cabinet sont retirés de la fiche (les valeurs déjà saisies restent dans les dossiers).")) return; ED.fiche = baseFiche(); FE = null; modif(true); return; }
  if (ONG === "consultation") { if (!confirm("Revenir au formulaire de consultation de départ ?\nLes champs ajoutés par le cabinet sont retirés (les valeurs déjà saisies restent dans les consultations).")) return; ED.consultation = baseConsult(); CE = null; modif(true); return; }
  if (ONG === "rcp") { if (!confirm("Effacer les dates de RCP (jours, heure, lieu, dates ajoutées et annulées) ?\nLes patients déjà inscrits gardent leur date.")) return; ED.rcp = RCP0(); modif(true); return; }
  if (ONG === "whatsapp") { if (!confirm("Rétablir tous les messages WhatsApp et le délai du bouton vert par défaut ?")) return; ED.wa = {}; ED.reg.whatsapp = copie(REGLAGES0.whatsapp); modif(true); return; }
  if (ONG === "listes" && LS === "taches") { if (!confirm("Rétablir la liste des types de tâches de base ?")) return; ED.ttache = TYPES_TACHES0.slice(); modif(true); return; }
  if (ONG === "listes" && LS === "documents") { if (!confirm("Rétablir la liste des types de documents de départ ?")) return; ED.tdoc = TYPES_DOCUMENTS0.slice(); modif(true); return; }
  if (ONG === "listes") { if (!confirm("Rétablir les listes de départ (mutuelles, correspondants, informations médicales, localisations) ?\nLes ajouts et corrections du cabinet seront perdus.")) return; ED.listes = Object.assign({ diag: LISTES0.diag.slice(), stade: STADES.slice(), grade: GRADES.slice(), mut: LISTES0.mut.slice().sort((a, z) => a.localeCompare(z, "fr")), cor: LISTES0.cor.slice().sort((a, z) => a.localeCompare(z, "fr")) }, listesMedDe(departMed)); ED.listesOrig = JSON.parse(JSON.stringify(ED.listes)); modif(true); return; }
  if (ONG === "impression") { if (!confirm("Rétablir les marges d'impression par défaut ?")) return; ED.reg.impression = copie(REGLAGES0.impression); modif(true); return; }
  if (ONG === "alertes") { if (!confirm("Rétablir les délais " + (A.D().membre.role === "assistante" ? "de la salle d'attente" : "des alertes et de la salle d'attente") + " par défaut ?")) return; if (A.D().membre.role !== "assistante") ED.reg.alertes = copie(REGLAGES0.alertes); ED.reg.salle = copie(REGLAGES0.salle); modif(true); return; }
  if (ONG === "couleurs") { if (!confirm("Rétablir les couleurs Google Agenda par défaut ?")) return; ED.coul = Object.assign({}, COULEURS0); modif(true); return; }
  if (ONG === "taches") { if (!confirm("Rétablir la liste des types de tâches de base ?")) return; ED.ttache = TYPES_TACHES0.slice(); modif(true); return; }
  if (ONG === "documents") { if (!confirm("Rétablir la liste des types de documents de départ ?")) return; ED.tdoc = TYPES_DOCUMENTS0.slice(); modif(true); return; }
  if (!confirm("Rétablir les horaires (8 h 30 – 18 h, du lundi au vendredi, pour tous les établissements) et la liste des jours fériés par défaut ?\nLes absences ne sont pas modifiées.")) return;
  ED.horaires = HORAIRES0(); ED.horairesEtab = {}; ED.feries = copie(FERIES0); modif(true);
};
window.cfEnregistrer = async () => {
  // Contrôles : plages cohérentes, absences dans le bon ordre, dates renseignées
  for (const [qui, H] of [["", ED.horaires]].concat(Object.entries(ED.horairesEtab))) for (const [j, nom] of JOURS) {
    const pl = (H.jours[j] || []).slice().sort((a, b) => a[0].localeCompare(b[0])), t = (qui ? qui + " – " : "") + nom;
    for (let k = 0; k < pl.length; k++) {
      if (!pl[k][0] || !pl[k][1] || pl[k][1] <= pl[k][0]) { A.toast(t + " : l'heure de fin doit être après l'heure de début."); return; }
      if (k && pl[k][0] < pl[k - 1][1]) { A.toast(t + " : deux plages se chevauchent."); return; }
    }
    H.jours[j] = pl;
  }
  // Noms corrigés dans Paramètres › Listes : corrigés aussi dans les dossiers qui les utilisent (08/10/2026)
  const CHAMP_L = { diag: ["clinique", "diag", "Diagnostic"], mut: ["identite", "mut", "Mutuelle"], cor: ["identite", "cor", "Correspondant"] }, renoms = [];
  for (const k of ["diag", "mut", "cor"]) ED.listes[k].forEach((v, i) => { const de = String(ED.listesOrig[k][i] || "").trim(), vers = String(v || "").trim(); if (de && vers && de !== vers) renoms.push({ k, de, vers }); });
  const aMaj = [];
  D().patients.forEach((x) => {
    const ch = {}, qu = [];
    renoms.forEach(({ k, de, vers }) => { const [bloc, f, lib] = CHAMP_L[k], B = ch[bloc] || Object.assign({}, x.doc[bloc] || {}); if (String(B[f] || "").trim().toLowerCase() === de.toLowerCase()) { B[f] = vers; ch[bloc] = B; qu.push(lib + " : " + de + " → " + vers); } });
    if (qu.length) aMaj.push({ x, ch, quoi: "Liste corrigée (Paramètres) : " + qu.join(" ; ") });
  });
  if (aMaj.length && !confirm(renoms.length + " nom" + (renoms.length > 1 ? "s corrigés" : " corrigé") + " dans les listes :\n" + renoms.slice(0, 8).map((r) => "• " + r.de + " → " + r.vers).join("\n") + (renoms.length > 8 ? "\n…" : "") + "\n\n" + aMaj.length + " dossier" + (aMaj.length > 1 ? "s" : "") + " de vos patients" + (D().membre.tousEtablissements ? "" : " (et ceux des autres lieux du cabinet)") + " seront corrigés aussi. Continuer ?")) return;
  const listes = {}; for (const k of ["diag", "stade", "grade", "mut", "cor"].concat(LISTES_MED.map((z) => z[0]))) { // lot A : listes des informations médicales
    const l = ED.listes[k].map((t) => String(t || "").trim()).filter(Boolean);
    const dbl = l.find((t, i) => l.findIndex((u) => u.toLowerCase() === t.toLowerCase()) !== i); if (dbl) { A.toast("Listes : « " + dbl + " » figure deux fois."); return; }
    listes[k] = k === "diag" || k === "stade" || k === "grade" ? l : l.sort((a, z) => a.localeCompare(z, "fr"));
  }
  if (ED.reg.whatsapp.de > ED.reg.whatsapp.a) { A.toast("Bouton WhatsApp vert : « jusqu'à » doit être plus proche du rendez-vous que « à partir de »."); return; }
  for (const a of ED.abs) { if (!a.du) { A.toast("Une absence n'a pas de date de début."); return; } if (!a.au || a.au < a.du) a.au = a.du; }
  if (ED.feries.some((f) => !f.d)) { A.toast("Un jour férié n'a pas de date."); return; }
  const tdoc = ED.tdoc.map((t) => String(t || "").trim()).filter(Boolean);
  if (tdoc.some((t, i) => tdoc.findIndex((u) => u.toLowerCase() === t.toLowerCase()) !== i)) { A.toast("Deux types de documents portent le même nom."); return; }
  if (TDOC && TDOC.length && !tdoc.length) { A.toast("Gardez au moins un type de document."); return; }
  if (ED.auto.some((R) => !String(R.titre || "").trim())) { A.toast("Tâches automatiques : donnez un titre à chaque tâche."); return; }
  const ttache = ED.ttache.map((t) => String(t || "").trim()).filter(Boolean);
  if (ttache.concat([TYPE_RT]).some((t, i, a) => a.findIndex((u) => u.toLowerCase() === t.toLowerCase()) !== i)) { A.toast("Deux types de tâches portent le même nom (« " + TYPE_RT + " » est déjà le type fixe)."); return; }
  const rcp = Object.assign({}, ED.rcp, { jours: ED.rcp.jours.slice().sort(), plus: Array.from(new Set(ED.rcp.plus.filter(Boolean))).sort(), annulees: Array.from(new Set(ED.rcp.annulees.filter(Boolean))).sort() });
  const cal = Object.assign({}, D().cal, { horaires: ED.horaires, horairesEtab: ED.horairesEtab, durees: ED.durees || {}, abs: ED.abs, feries: ED.feries.slice().sort((a, b) => a.d.localeCompare(b.d)) });
  if (((ONG === "fiche" && FE && FE.enCours()) || (ONG === "consultation" && CE && CE.enCours())) && !confirm("Un champ est en cours de modification et ne sera pas enregistré. Continuer ?")) return;
  const b = A.$("cfOk"); A.occupe(b, true);
  const tout = A.peut("parametres"); // sinon secrétaire : ni couleurs Google Agenda, ni tâches automatiques (règles du serveur)
  try {
    await setDoc(doc(db, "espaces", A.ESPACE, "parametres", "calendrier"), { data: JSON.stringify(cal) }, { merge: true });
    const wa = {}; Object.entries(ED.wa).forEach(([k, v]) => { if (v !== (WA0[k] || WA0.autre)) wa[k] = v; });
    if ((tout || secretariat()) && JSON.stringify(wa) !== JSON.stringify(D().wa || {})) { await setDoc(doc(db, "espaces", A.ESPACE, "parametres", "whatsapp"), { data: JSON.stringify(wa) }); D().wa = wa; }
    const coul = {}; Object.keys(COULEURS0).forEach((k) => { if (ED.coul[k] != null && ED.coul[k] !== COULEURS0[k]) coul[k] = ED.coul[k]; });
    if (tout && JSON.stringify(coul) !== JSON.stringify(COUL || {})) { await setDoc(doc(db, "espaces", A.ESPACE, "parametres", "couleursAgenda"), { data: JSON.stringify(coul) }); COUL = coul; }
    // 3.13 : référentiel des types de consultation (avant le formulaire de consultation : noms à jour)
    if (tout && JSON.stringify(aEnregistrer(ED.typesC)) !== JSON.stringify(aEnregistrer(A.typesC ? A.typesC() : []))) {
      const enr = aEnregistrer(ED.typesC); await setDoc(doc(db, "espaces", A.ESPACE, "parametres", "typesConsult"), { data: JSON.stringify(enr), majPar: D().u.uid, maj: new Date().toISOString() });
      if (window.majTypesC) window.majTypesC(enr); }
    if (tdoc.length && JSON.stringify(tdoc) !== JSON.stringify(TDOC || [])) { await enregistrerTypes(tdoc); TDOC = tdoc.slice(); }
    if (JSON.stringify(ED.reg) !== JSON.stringify(reglages())) await enregistrerReglages(ED.reg);
    if (JSON.stringify(listes) !== JSON.stringify({ diag: listeDiag(), mut: listeMut(), cor: listeCor() })) {
      const L = Object.assign(listes, { complet: true }); await setDoc(doc(db, "espaces", A.ESPACE, "parametres", "listes"), { data: JSON.stringify(L) }); D().listes = L;
    }
    // dossiers corrigés par le serveur, dans tout le cabinet (19.3 : une secrétaire d'un seul lieu ne voit pas les autres dossiers),
    // puis relus ici
    if (renoms.length) {
      try { A.toast("Correction des dossiers…"); await A.serveur("corrigerListes", { espace: A.ESPACE, renoms });
        for (const { x } of aMaj) { const s2 = await getDoc(doc(db, "espaces", A.ESPACE, "patients", x.id)).catch(() => null); if (s2 && s2.exists()) A.recalculer(x, s2.data()); } }
      catch (e) { console.warn("listes → dossiers", e); setTimeout(() => A.toast("Les listes sont enregistrées, mais les dossiers n'ont pas pu être corrigés : " + ((e && e.message) || e)), 4000); }
    }
    if (tout && JSON.stringify(ED.auto) !== JSON.stringify(AUTO)) { const regles = ED.auto.map((R) => { const o = Object.assign({}, R); delete o.fixe; return o; }); await setDoc(doc(db, "espaces", A.ESPACE, "parametres", "tachesAuto"), { data: JSON.stringify({ regles }) }); AUTO = JSON.parse(JSON.stringify(ED.auto)); }
    if ((tout || secretariat()) && JSON.stringify(rcp) !== JSON.stringify(configRcp())) { await enregistrerConfigRcp(rcp); ED.rcp = configRcp(); }
    if (JSON.stringify(ttache) !== JSON.stringify(TTA || [])) { await enregistrerTypesTaches(ttache.length ? ttache : TYPES_TACHES0.slice()); TTA = ttache.length ? ttache : TYPES_TACHES0.slice(); }
    // Présentation du cabinet (11/10/2026) : tableau de bord (parametres/accueil, lu par pageAccueil : accueilEffectif) ; fiche patient
    // et formulaire de consultation (parametres/formulaires : retouches par rapport au réglage de l'administration)
    if (tout) {
      const qui = { majPar: D().u.uid, maj: new Date().toISOString() };
      if (JSON.stringify(ED.accueil) !== JSON.stringify(accueilCab())) {
        const ac = JSON.stringify(ED.accueil) === JSON.stringify(accueilEffectif(D().reg, null)) ? {} : { ordre: ED.accueil.ordre, cartes: ED.accueil.cartes, col: ED.accueil.col };
        await setDoc(doc(db, "espaces", A.ESPACE, "parametres", "accueil"), Object.assign({ data: JSON.stringify(ac) }, qui));
        D().accueilCab = Object.keys(ac).length ? ac : null; if (window.majAccueilCab) window.majAccueilCab(D().accueilCab);
      }
      // modèle (20/10/2026) : fiche et formulaire = ceux de la spécialité (plateforme/specialites, copiés dans chaque cabinet de la spécialité,
      // sauf celui du Dr Bentahila), enregistrés en entier par le serveur
      if (A.D().bib) for (const [q, cat, F, base] of [["fiche", FICHE, ED.fiche, baseFiche()], ["consultation", CONSULT, ED.consultation, baseConsult()]]) {
        if (JSON.stringify(formRetouches(cat, F, base)) === "{}") continue;
        const enr = formSpecialite(cat, F, !!F.onco), o = await A.serveur("ficheSpecialite", { espace: A.ESPACE, quoi: q, fiche: enr });
        const sp = Object.assign({}, o.fiche, { _onco: !!F.onco }), ef = q === "fiche" ? ficheEffective(null, sp) : consultEffective(null, sp);
        D().regAdmin[q] = ef; D().reg[q] = JSON.parse(JSON.stringify(ef)); D().espaceDoc[q === "fiche" ? "ficheSpe" : "consultSpe"] = o.fiche;
        A.toast((q === "fiche" ? "Fiche patient" : "Formulaire de consultation") + " du modèle enregistré" + (q === "fiche" ? "e" : "") + " : " + o.cabinets + " cabinet(s) mis à jour.");
      }
      const fo = {}, rf = ficheRetouches(ED.fiche, baseFiche()), rc = formRetouches(CONSULT, ED.consultation, baseConsult());
      if (Object.keys(rf).length) fo.fiche = rf; if (Object.keys(rc).length) fo.consultation = rc;
      if (!A.D().bib && JSON.stringify(fo) !== JSON.stringify(D().formCab || {})) {
        await setDoc(doc(db, "espaces", A.ESPACE, "parametres", "formulaires"), Object.assign({ data: JSON.stringify(fo) }, qui));
        D().formCab = fo; const base = D().regAdmin || D().reg;
        D().reg.fiche = formEffectif(FICHE, fo.fiche || null, base.fiche); D().reg.consultation = formEffectif(CONSULT, fo.consultation || null, base.consultation);
      }
    }
    D().cal = cal; D().ctx.feries = cal.feries;
    D().patients.forEach((x) => A.recalculer(x, x.doc)); // les dates de radiothérapie dépendent des jours fériés
    A.journal({ id: "", r: { nm: "" } }, "Paramètres modifiés (" + (RUB[ONG] ? RUB[ONG][1] : "horaires, absences, jours fériés") + ")");
    MOD = false; A.toast("Paramètres enregistrés."); A.entete(); pageConfiguration();
  } catch (e) { A.occupe(b, false); A.toast(e && e.code === "permission-denied" ? "Vous n'avez pas le droit de modifier les paramètres." : "Enregistrement impossible : " + ((e && e.message) || e)); }
};
