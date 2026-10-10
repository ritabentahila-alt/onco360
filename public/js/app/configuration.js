// Onco360 – page « Paramètres » (Configuration et Paramètres fusionnés le 08/10/2026, P2) : créneaux et horaires, absences
// (fermetures, congés, congrès), jours fériés, WhatsApp, Google Agenda, types de documents et de tâches, impression, alertes ;
// onglet « Activités et rémunérations » (droit « finances ») = ancienne page Paramètres (parametres.js).
// Tout est enregistré dans parametres/calendrier (même document que l'application actuelle : feries, abs) + horaires.
// Couleurs Google Agenda (08/10/2026) : parametres/couleursAgenda { data: JSON { catégorie: "1"…"11" | "" } } (seulement ce
// qui diffère des couleurs par défaut, les mêmes que COULEURS0 dans functions/logique.js) ; repeint par agendaCouleurs.
import { doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "../config.js";
import { FERIES0 } from "../donnees/listes.js";
import { typesDocuments, enregistrerTypes, TYPES_DOCUMENTS0 } from "./fichiers.js";
import { typesTaches, enregistrerTypesTaches, TYPES_TACHES0, TYPE_RT, listeMembres } from "./taches.js";
import { reglages, enregistrerReglages, REGLAGES0 } from "./reglages.js";
import { pageParametres } from "./parametres.js";
import { listeDiag, listeMut, listeCor, LISTES0 } from "./chimio.js";
import { gererListe, tailleListe } from "./ordonnances.js";
import { htmlOngletProfil, apresOngletProfil, titulaireConnecte } from "./profil.js";
import { afficherAudit } from "./audit.js"; // onglet « Journal d'audit » (titulaire, 09/10/2026)
import { configRcp, configChargee, chargerConfigRcp, enregistrerConfigRcp, prochainesRcp, CFG0 as RCP0, libDate } from "./rcp.js";

let A = null;
export function installer(api) { A = api; A.enteteParametres = () => entete(); A.pageParametres = () => pageConfiguration(); }
const D = () => A.D();
const JOURS = [[1, "Lundi"], [2, "Mardi"], [3, "Mercredi"], [4, "Jeudi"], [5, "Vendredi"], [6, "Samedi"], [0, "Dimanche"]];
const TYPES = ["Congé", "Congrès", "Voyage", "Formation", "Fermeture du cabinet", "Autre"];
export const HORAIRES0 = () => ({ duree: 30, jours: { 1: [["08:30", "18:00"]], 2: [["08:30", "18:00"]], 3: [["08:30", "18:00"]], 4: [["08:30", "18:00"]], 5: [["08:30", "18:00"]], 6: [], 0: [] } });
// Horaires en vigueur : ceux de l'établissement s'il a ses propres plages, sinon ceux du cabinet (par défaut 8 h 30 – 18 h)
export const horaires = (etab) => { const c = D().cal || {}; return (etab && c.horairesEtab && c.horairesEtab[etab]) || c.horaires || HORAIRES0(); };
// Messages WhatsApp prédéfinis. Variables : {prenom} {nom} {jour} {heure} {lieu} {adresse} {medecin}
export const WA0 = {
  // Confirmation proposée juste après la prise d'un rendez-vous (19.4, 10/10/2026)
  confirm: "Bonjour {prenom}, votre rendez-vous est confirmé le {jour} {heure} à {lieu}.\nEn cas d'empêchement, merci de nous prévenir.\n{medecin}",
  chimio: "Bonjour {prenom}, nous vous rappelons votre séance de chimiothérapie le {jour} {heure} à {lieu}.\nMerci d'apporter votre bilan sanguin récent (NFS, plaquettes, créatinine), vos ordonnances et vos derniers comptes rendus. Pensez à prendre votre prémédication si elle vous a été prescrite.\nEn cas de fièvre ou de problème, appelez-nous avant de vous déplacer.\n{medecin}",
  annonce: "Bonjour {prenom}, nous vous rappelons votre consultation d'annonce le {jour} {heure} à {lieu}.\nMerci d'apporter tous vos examens (biopsie, compte rendu anatomopathologique, imagerie, bilans sanguins) et, si vous le souhaitez, d'être accompagné(e) d'un proche.\n{medecin}",
  suivi: "Bonjour {prenom}, nous vous rappelons votre consultation de suivi le {jour} {heure} à {lieu}.\nMerci d'apporter vos derniers examens (bilan sanguin, imagerie) et vos ordonnances en cours.\n{medecin}",
  controle: "Bonjour {prenom}, nous vous rappelons votre consultation de contrôle le {jour} {heure} à {lieu}.\nMerci d'apporter les résultats des examens demandés lors de la dernière consultation.\n{medecin}",
  rtc: "Bonjour {prenom}, nous vous rappelons votre consultation de surveillance pendant la radiothérapie le {jour} {heure} à {lieu}.\nSignalez-nous toute gêne (peau, déglutition, fatigue…).\n{medecin}",
  hospit: "Bonjour {prenom}, nous vous rappelons votre hospitalisation à partir du {jour} à {lieu}.\nMerci d'apporter votre carte d'identité, votre prise en charge (mutuelle), vos examens et vos traitements habituels.\n{medecin}",
  rt: "Bonjour {prenom}, nous vous rappelons votre rendez-vous de radiothérapie le {jour} {heure} à {lieu}.\nMerci d'apporter vos examens et votre prise en charge.\n{medecin}",
  autre: "Bonjour {prenom}, nous vous rappelons votre rendez-vous le {jour} {heure} à {lieu}.\n{medecin}",
};
export const CAT_WA = () => {
  const l = [["confirm", "✅ Confirmation d'un rendez-vous (proposée juste après sa prise)"], ["chimio", "💉 Séance de chimiothérapie"], ["annonce", "🩺 Consultation d'annonce"], ["suivi", "🩺 Consultation de suivi"], ["controle", "🩺 Consultation de contrôle"], ["rtc", "☢️ Consultation en cours de radiothérapie"], ["hospit", "Hospitalisation"], ["rt", "☢️ Radiothérapie (scanner de centrage, 1re séance)"]];
  const vus = {}, ajout = (t, lib) => { if (["annonce", "suivi", "controle", "cchimio", "seance", "hospit", "rt"].indexOf(t) >= 0 || vus[t]) return; vus[t] = 1; l.push([t, "🩺 " + lib]); };
  const T = D().tarifs; if (T && T.etablissements) Object.values(T.etablissements).forEach((e) => (e.activites || []).forEach((a) => ajout(a.type, a.libelle)));
  else if (D().activites) Object.values(D().activites).forEach((e) => e.forEach((a) => ajout(a.t, a.lib)));
  l.push(["autre", "Autre rendez-vous (message par défaut)"]); return l;
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
// Accès : dans Profil & Paramètres depuis le 10/10/2026 (18.5)
const ONGLETS = () => [["horaires", "horloge", "Créneaux & horaires"], ["fermetures", "avion", "Fermetures, congés & jours fériés"], ["lieux", "hopital", "Lieux d'exercice"]].concat(TIT ? [["audit", "liste", "Journal d'audit"]] : []).concat([["whatsapp", "whatsapp", "WhatsApp"], ["couleurs", "agenda", "Google Agenda"], ["documents", "document", "Documents"], ["taches", "taches", "Tâches"], ["rcp", "rcp", "RCP"], ["listes", "liste", "Listes"], ["bibliotheques", "pilule", "Bibliothèques"], ["impression", "imprimer", "Impression"], ["alertes", "alerte", "Alertes"]])
  .concat(A.peut("finances") && D().tarifs ? [["activites", "bilan", "Activités et rémunérations"]] : [])
  .filter((o) => A.module(MODULE_ONGLET[o[0]] || "")) // onglets d'un module retiré de la formule du cabinet : cachés
  .filter((o) => !A.D().bib || HORS_BIB.indexOf(o[0]) < 0) // bibliothèque de référence : paramètres de base de la spécialité
  // Réglage du cabinet (10/10/2026) : onglets retirés cachés, dans l'ordre choisi
  .filter((o) => A.D().bib || !A.D().reg || A.D().reg.sections[o[0]] !== false)
  .sort((a, b) => { const R = A.D().reg, l = R && !A.D().bib ? R.ordreSections : []; return (l.indexOf(a[0]) + 1 || 999) - (l.indexOf(b[0]) + 1 || 999); });
// Propres à chaque cabinet, donc absents de la bibliothèque de référence : lieux, équipe, journal d'audit
const HORS_BIB = ["lieux", "acces", "audit"];
// Onglets que la secrétaire (droit « secretariat », sans « paramètres ») peut modifier, et ce qu'elle y modifie
const ONGLETS_SEC = ["horaires", "fermetures", "whatsapp", "documents", "taches", "rcp", "listes", "impression", "alertes"];
const MSG_SEC = { lieux: "Vous pouvez compléter l'adresse, le téléphone et la ville de votre lieu (« Compléter »).", horaires: "Vous pouvez régler les horaires de vos lieux.", taches: "Vous pouvez modifier les types de tâches ; les tâches automatiques sont réglées par le médecin." };
const secretariat = () => A.peut("secretariat") && !A.D().bib;
const MODULE_ONGLET = { couleurs: "gagenda", taches: "taches", rcp: "rcp", listes: "listes", bibliotheques: "prescriptions" };
function entete() {
  return '<section class="accueil"><div><h2>Paramètres</h2><p>Horaires, absences et jours fériés, lieux d\'exercice' + "" + ', WhatsApp, Google Agenda, types de documents et de tâches, dates de RCP, listes, bibliothèques des prescriptions, impression, alertes' + (A.peut("finances") ? ", activités et rémunérations" : "") + ".</p></div></section>" +
    '<div class="ag-vues" style="align-self:flex-start">' + ONGLETS().map(([k, ico, lib]) => '<button class="' + (ONG === k ? "on" : "") + '" onclick="cfOnglet(\'' + k + "')\">" + A.ic(ico) + lib + "</button>").join("") + "</div>";
}
export function pageConfiguration(arg) {
  if (arg === "acces") { location.replace("#profil/acces"); return; } // ancien lien : l'onglet Accès est dans Profil & Paramètres
  // Onglets du titulaire (Accès, Journal d'audit) connus un instant plus tard : l'onglet demandé par le lien est ouvert ensuite
  if (TIT === null) { TIT = false; titulaireConnecte().then((v) => { TIT = v; const dem = (location.hash.match(/^#parametres\/([^/?]+)/) || [])[1]; if (v && location.hash.startsWith("#parametres") && !MOD) pageConfiguration(dem); }).catch(() => {}); }
  if (arg && ONGLETS().some((o) => o[0] === arg)) ONG = arg;
  if (!ONGLETS().some((o) => o[0] === ONG)) ONG = (ONGLETS()[0] || ["horaires"])[0]; // 1er onglet présent (réglage du cabinet)
  if (ONG === "activites") { pageParametres(); return; }
  if (COUL === null) { COUL = {}; getDoc(doc(db, "espaces", A.ESPACE, "parametres", "couleursAgenda")).then((s) => { COUL = s.exists() ? JSON.parse(s.data().data || "{}") : {}; if (!MOD && location.hash.startsWith("#parametres")) { ED = null; pageConfiguration(); } }).catch(() => {}); }
  if (AUTO === null) { AUTO = reglesAutoC({}); Promise.all([getDoc(doc(db, "espaces", A.ESPACE, "parametres", "tachesAuto")).catch(() => null), listeMembres().catch(() => [])]).then(([sa, mb]) => { let c = {}; try { c = sa && sa.exists() ? JSON.parse(sa.data().data || "{}") : {}; } catch (e) { /* illisible */ } AUTO = reglesAutoC(c); MBR = mb; if (!MOD && location.hash.startsWith("#parametres")) { ED = null; pageConfiguration(); } }); }
  if (TTA === null) { TTA = []; typesTaches().then((L) => { TTA = L.filter((t) => t !== TYPE_RT); if (!MOD && location.hash.startsWith("#parametres")) { ED = null; pageConfiguration(); } }).catch(() => {}); }
  if (!configChargee()) chargerConfigRcp().then(() => { if (!MOD && location.hash.startsWith("#parametres")) { ED = null; pageConfiguration(); } }).catch(() => {});
  if (TDOC === null) { TDOC = []; typesDocuments().then((L) => { TDOC = L.slice(); if (!MOD && location.hash.startsWith("#parametres")) { ED = null; pageConfiguration(); } }).catch(() => {}); }
  if (!ED || !MOD) ED = { horaires: copie(horaires()), horairesEtab: copie(D().cal.horairesEtab || {}), abs: copie(D().cal.abs || []), feries: copie(D().cal.feries || []), wa: Object.assign({}, D().wa || {}), reg: reglages(), listes: { diag: listeDiag().slice(), mut: listeMut(), cor: listeCor() }, listesOrig: { diag: listeDiag().slice(), mut: listeMut(), cor: listeCor() }, coul: Object.assign({}, COULEURS0, COUL), tdoc: TDOC.slice(), ttache: TTA.slice(), auto: JSON.parse(JSON.stringify(AUTO)), rcp: configRcp() };
  const ok = A.peut("parametres"), esc = A.esc, dis = ok ? "" : " disabled";
  // Paramètres du secrétariat (droit « secretariat », 10/10/2026) : absences, horaires de ses lieux, listes, types de tâches et de
  // documents, bouton WhatsApp vert ; okE / disE = ce que la personne peut modifier dans l'onglet affiché
  const sec = !ok && secretariat(), okE = ok || (sec && ONGLETS_SEC.indexOf(ONG) >= 0), disE = okE ? "" : " disabled";
  let h = entete();
  if (!ok && !(ONG === "bibliotheques" && A.peut("ecrireConsultations")) && !(okE && !MSG_SEC[ONG])) h += '<p class="mesures">' + (ONG === "couleurs" ? "Votre Google Agenda, ce qui y apparaît et ses couleurs se règlent ici : ce sont vos réglages personnels." : sec && MSG_SEC[ONG] ? MSG_SEC[ONG] : "Lecture seule : la modification demande le droit « paramètres ».") + "</p>";
  if (ONG === "horaires") {
    // membre limité à certains établissements (secrétaire d'un centre) : seulement leurs horaires (07/10/2026)
    const limite = !D().membre.tousEtablissements, etabs = limite ? (D().membre.etablissements || []).slice() : (D().etabsTous || D().etabs).map((e) => e.code);
    if (limite && etabs.indexOf(HET) < 0) HET = etabs[0] || "";
    const propre = HET && ED.horairesEtab[HET], H = HET ? ED.horairesEtab[HET] || ED.horaires : ED.horaires;
    h += '<section class="carte"><h3><span class="ic">' + A.ic("horloge") + '</span>Créneaux & horaires</h3><p class="sous">Les heures en dehors des plages sont grisées dans l\'agenda. La prise de rendez-vous y reste possible (urgence, rendez-vous exceptionnel), après confirmation.</p>' +
      '<div class="puces"><span class="tl">Horaires de</span>' + (limite ? "" : '<button class="puce' + (HET ? "" : " on") + '" onclick="cfEtab(\'\')">Par défaut (tous)</button>') + etabs.map((c) => '<button class="puce' + (HET === c ? " on" : "") + '" onclick="cfEtab(\'' + esc(c) + "')\">" + esc(c) + (ED.horairesEtab[c] ? " •" : "") + "</button>").join("") + "</div>" +
      (HET ? '<label class="chk" style="margin:6px 0 10px"><input type="checkbox"' + (propre ? " checked" : "") + disE + ' onchange="cfPropre(this.checked)"> Horaires propres à ' + esc(HET) + "</label>" +
        (propre ? '<p class="mesures">Ces plages s\'appliquent aux rendez-vous des patients de ' + esc(HET) + ' et à l\'agenda filtré sur ' + esc(HET) + " (par exemple pour la secrétaire de cet établissement).</p>" : '<p class="mesures">' + esc(HET) + " utilise les horaires par défaut ci-dessous. Cochez la case pour lui donner ses propres plages.</p>") : '<p class="mesures">Horaires utilisés par tous les établissements qui n\'ont pas leurs propres plages (marqués • quand c\'est le cas).</p>');
    const disH = HET && !propre ? " disabled" : disE, okH = okE && (!HET || propre);
    h += '' +
      '<div class="form" style="grid-template-columns:minmax(0,260px)"><div><label for="cfDur">Durée d\'un rendez-vous (minutes)</label><select id="cfDur"' + disH + ' onchange="cfDuree(this.value)">' + [10, 15, 20, 30, 45, 60].map((m) => "<option" + (m === H.duree ? " selected" : "") + ">" + m + "</option>").join("") + "</select></div></div>" +
      '<div class="tableau" style="margin-top:12px"><table class="tcures cfh"><tr><th>Jour</th><th>Plages horaires</th></tr>' +
      JOURS.map(([j, nom]) => {
        const pl = H.jours[j] || [], ouvert = pl.length > 0;
        return '<tr><td><label style="display:flex;gap:8px;align-items:center;font-weight:bold"><input type="checkbox" style="width:auto"' + (ouvert ? " checked" : "") + disH + ' onchange="cfJour(' + j + ',this.checked)">' + nom + "</label></td><td>" +
          (ouvert ? '<div class="plages">' + pl.map((p, k) => '<span class="plage"><input type="time" step="900" value="' + p[0] + '"' + disH + ' onchange="cfPlage(' + j + "," + k + ',0,this.value)"> – <input type="time" step="900" value="' + p[1] + '"' + disH + ' onchange="cfPlage(' + j + "," + k + ',1,this.value)">' + (okH ? '<button class="mini rouge" onclick="cfSupPlage(' + j + "," + k + ')">✕</button>' : "") + "</span>").join("") + (okH ? '<button class="mini" onclick="cfAjPlage(' + j + ')">+ Ajouter une plage</button>' : "") + "</div>" : '<span class="mesures">Fermé</span>') + "</td></tr>";
      }).join("") + "</table></div></section>";
  } else if (ONG === "taches") {
    // Types de tâches (P1, 08/10/2026) : boutons de « Nouvelle tâche » et filtre « Type » ; « Radiothérapie » fixe, à la fin
    const L = ED.ttache;
    h += '<section class="carte"><h3><span class="ic">' + A.ic("taches") + '</span>Types de tâches</h3><p class="sous">Boutons « type » de la fenêtre Nouvelle tâche (un clic remplit le début du titre) et filtre « Type » de la page Tâches. Renommer ou retirer un type ne change pas les tâches déjà créées (elles gardent leur type).</p>' +
      '<div class="cf-td">' + L.map((t, i) => '<div class="it"><b class="n">' + (i + 1) + '</b><input value="' + esc(t) + '"' + disE + ' aria-label="Type de tâche ' + (i + 1) + '" onchange="cfTt(' + i + ',this.value)">' +
        (okE ? '<button class="ico" title="Monter" aria-label="Monter" onclick="cfTtBouger(' + i + ',-1)"' + (i ? "" : " disabled") + '>↑</button><button class="ico" title="Descendre" aria-label="Descendre" onclick="cfTtBouger(' + i + ',1)"' + (i < L.length - 1 ? "" : " disabled") + '>↓</button><button class="mini rouge" title="Retirer ce type" aria-label="Retirer ' + esc(t) + '" onclick="cfTtSup(' + i + ')">✕</button>' : "") + "</div>").join("") +
        '<div class="it"><b class="n">' + (L.length + 1) + '</b><input value="' + esc(TYPE_RT) + '" disabled aria-label="Type fixe ' + esc(TYPE_RT) + '"><span class="mesures">fixe : tâches automatiques (dosimétrie, fin de radiothérapie)</span></div></div>' +
      (okE ? '<button class="bt clair petit" style="margin-top:10px" onclick="cfTtAj()">' + A.ic("plus") + "Ajouter un type</button>" : "") + "</section>";
    h += sectionAuto(ok, dis);
  } else if (ONG === "rcp") {
    // Dates de RCP (étape 7, 09/10/2026) : jours de la semaine, heure, lieu, dates ajoutées et annulées (rcp.js)
    const C = ED.rcp, dates = (k, titre, sous, aj) => '<section class="carte"><h3>' + titre + '</h3><p class="sous">' + sous + "</p>" +
      (C[k].length ? '<div class="cf-td">' + C[k].map((d, i) => '<div class="it"><input type="date" value="' + esc(d) + '"' + disE + ' aria-label="' + titre + " " + (i + 1) + '" onchange="cfRcpDate(\'' + k + "'," + i + ',this.value)" style="max-width:190px"><span class="mesures">' + esc(d ? libDate(d) : "") + "</span>" + (okE ? '<button class="mini rouge" aria-label="Retirer" onclick="cfRcpSup(\'' + k + "'," + i + ')">✕</button>' : "") + "</div>").join("") + "</div>" : '<p class="mesures">Aucune.</p>') +
      (okE ? '<button class="bt clair petit" style="margin-top:10px" onclick="cfRcpAj(\'' + k + "')\">" + A.ic("plus") + aj + "</button>" : "") + "</section>";
    const pro = prochainesRcp(10, C);
    h += '<section class="carte"><h3><span class="ic">' + A.ic("rcp") + '</span>Dates de RCP</h3><p class="sous">Le bouton « + RCP » du dossier (à côté de Doc.) inscrit le patient à la prochaine date de RCP (modifiable). Liste des dossiers inscrits : page Tâches › onglet RCP.</p>' +
      '<div class="puces"><span class="tl">Chaque semaine le</span>' + JOURS.map(([j, nom]) => '<button class="puce' + (C.jours.indexOf(j) >= 0 ? " on" : "") + '"' + disE + ' aria-pressed="' + (C.jours.indexOf(j) >= 0) + '" onclick="cfRcpJour(' + j + ')">' + nom + "</button>").join("") + "</div>" +
      '<div class="form" style="grid-template-columns:repeat(2,minmax(0,260px))"><div><label for="cfRh">Heure</label><input id="cfRh" type="time" step="900" value="' + esc(C.heure) + '"' + disE + ' onchange="cfRcp(\'heure\',this.value)"></div>' +
      '<div><label for="cfRl">Lieu</label><input id="cfRl" value="' + esc(C.lieu) + '" placeholder="Ex. salle de staff, visioconférence"' + disE + ' onchange="cfRcp(\'lieu\',this.value)"></div></div>' +
      '<p class="mesures">Un jour férié (onglet Fermetures) n\'a pas de RCP, sauf s\'il est ajouté ci-dessous.</p></section>';
    h += dates("plus", "Dates ajoutées", "RCP exceptionnelles, en plus des jours de la semaine (ou si la RCP n'a pas de jour fixe).", "Ajouter une date") +
      dates("annulees", "Dates annulées", "Jours où la RCP n'a pas lieu (congés, congrès…).", "Annuler une date");
    h += '<section class="carte"><h3><span class="ic">' + A.ic("agenda") + '</span>Prochaines RCP</h3>' + (pro.length ? '<div class="puces">' + pro.map((d) => '<span class="puce">' + esc(A.cap(libDate(d))) + "</span>").join("") + "</div>" : '<p class="mesures">Aucune date : cochez un jour de la semaine ou ajoutez des dates.</p>') + "</section>";
  } else if (ONG === "documents") {
    // Types de documents du dossier patient (onglet Documents) : liste du cabinet, dans l'ordre du menu
    const L = ED.tdoc;
    h += '<section class="carte"><h3><span class="ic">' + A.ic("document") + '</span>Types de documents</h3><p class="sous">Menu « Type de document » de l\'onglet Documents du dossier patient, et filtre de la liste. Renommer ou retirer un type ne change pas les documents déjà déposés (ils gardent leur type).</p>' +
      '<div class="cf-td">' + L.map((t, i) => '<div class="it"><b class="n">' + (i + 1) + '</b><input value="' + esc(t) + '"' + disE + ' aria-label="Type ' + (i + 1) + '" onchange="cfTd(' + i + ',this.value)">' +
        (okE ? '<button class="ico" title="Monter" aria-label="Monter" onclick="cfTdBouger(' + i + ',-1)"' + (i ? "" : " disabled") + '>↑</button><button class="ico" title="Descendre" aria-label="Descendre" onclick="cfTdBouger(' + i + ',1)"' + (i < L.length - 1 ? "" : " disabled") + '>↓</button><button class="mini rouge" title="Retirer ce type" aria-label="Retirer ' + esc(t) + '" onclick="cfTdSup(' + i + ')">✕</button>' : "") + "</div>").join("") + "</div>" +
      (okE ? '<button class="bt clair petit" style="margin-top:10px" onclick="cfTdAj()">' + A.ic("plus") + "Ajouter un type</button>" : "") + "</section>";
  } else if (ONG === "audit") {
    h += '<div id="cfAudit"></div>';
  } else if (ONG === "lieux" || ONG === "acces") {
    h += '<div id="cfProfil"><p class="sous">Chargement…</p></div>';
  } else if (ONG === "couleurs") {
    if (!A.D().bib) h += '<div id="cfProfil"><p class="sous">Chargement de votre Google Agenda…</p></div>' + sectionMonAgenda(); // liaison personnelle : pas dans la bibliothèque
    // sans le droit « paramètres » (secrétaire…) : ses propres couleurs (utilisateurs/{uid}.agendaCouleurs, 10/10/2026), enregistrées
    // tout de suite ; elles passent avant celles du cabinet dans SON agenda
    const perso = !ok && !A.D().bib, PC = (D().profil && D().profil.agendaCouleurs) || {}, CO = perso ? Object.assign({}, ED.coul, PC) : ED.coul;
    h += '<section class="carte" data-fn="gagenda.couleurs"><h3><span class="ic">' + A.ic("agenda") + "</span>" + (perso ? "Couleurs dans votre Google Agenda" : "Couleurs dans Google Agenda") + '</h3><p class="sous">' + (perso ? "Réglage <b>personnel</b> : couleur de chaque type d\'événement dans votre agenda « Onco360 ». Enregistré tout de suite ; votre agenda est repeint en quelques minutes." + (Object.keys(PC).length ? ' <button class="mini" onclick="cfCoulPersoDef()">↺ Couleurs du cabinet</button>' : "") : "Couleur de chaque type d\'événement dans l\'agenda « Onco360 » de chaque membre qui a relié son Google Agenda (Profil › Google Agenda). Chacun peut ensuite choisir les siennes. Après l\'enregistrement, les agendas sont repeints en quelques minutes.") + "</p>" +
      CAT_COUL.map(([k, lib]) => {
        const v = CO[k] != null ? CO[k] : "", nom = (COUL_G.find((c) => c[0] === v) || COUL_G[0])[1];
        return '<div class="cf-coul"><div class="lib"><b>' + esc(lib) + '</b><span class="mesures">' + esc(nom) + (v !== COULEURS0[k] ? " · modifiée" : "") + '</span></div><div class="nuancier" role="radiogroup" aria-label="' + esc(lib) + '">' +
          COUL_G.map(([c, n, hex]) => '<button type="button" role="radio" aria-checked="' + (c === v) + '" title="' + esc(n) + '" aria-label="' + esc(n) + '" class="pastc' + (c === v ? " on" : "") + (c ? "" : " vide") + '" style="background:' + hex + '"' + (perso ? "" : dis) + ' onclick="' + (perso ? "cfCoulPerso" : "cfCoul") + "('" + k + "','" + c + "')\"></button>").join("") + "</div></div>";
      }).join("") + "</section>";
  } else if (ONG === "listes") {
    // Listes proposées dans les fiches patients (P2 bis, 08/10/2026) : corriger, retirer, ajouter ; nombre de dossiers concernés
    const lib = { diag: "Diagnostics", mut: "Mutuelles", cor: "Correspondants" };
    h += '<section class="carte"><h3><span class="ic">' + A.ic("liste") + '</span>Listes</h3><p class="sous">Propositions des champs Diagnostic, Mutuelle et Correspondant des fiches patients. Corriger ou retirer un nom ici ne modifie pas les dossiers qui l\'utilisent déjà (leur nombre est indiqué).</p>' +
      '<div class="puces">' + Object.keys(lib).map((k) => '<button' + (k === "cor" ? ' data-fn="listes.cor"' : "") + ' class="puce' + (LS === k ? " on" : "") + '" onclick="cfLs(\'' + k + "')\">" + lib[k] + " (" + ED.listes[k].length + ")</button>").join("") + "</div>" +
      '<div class="recherche" style="max-width:420px;margin-bottom:8px">' + A.ic("loupe") + '<input id="cfLq" type="search" autocomplete="off" placeholder="Rechercher dans la liste…" value="' + esc(LQ) + '"></div>' +
      '<div class="cf-td cf-l" id="cfLl"></div>' + (okE ? '<button class="bt clair petit" style="margin-top:10px" onclick="cfLAj()">' + A.ic("plus") + "Ajouter</button>" : "") + "</section>";
  } else if (ONG === "bibliotheques") {
    // Bibliothèques des prescriptions : les mêmes fenêtres que dans le dossier, en gestion de la liste (sans patient)
    const B = [["medicaments", "pilule", "Médicaments", "Nom, posologie, classe thérapeutique"], ["ordostypes", "presse", "Ordonnances types", "Groupes de médicaments prescrits ensemble"], ["analyses", "tube", "Analyses et bilans", "Analyses, bilans et bilans généraux"], ["examens", "loupe", "Examens complémentaires", "Imagerie, explorations, précautions"], ["courriers", "courrier", "Modèles de courriers", "Certificats, courriers, ALD… avec champs remplis automatiquement"]];
    h += '<section class="carte"><h3><span class="ic">' + A.ic("pilule") + '</span>Bibliothèques des prescriptions</h3><p class="sous">Listes du cabinet utilisées par les boutons Médic., Ordo. type, Analyses, Examens compl. et Courriers du dossier. ' + (A.D().membre.role === "medecin" ? "Ajoutez, modifiez, supprimez et mettez en favori (étoile : en tête de liste) ; chaque changement est enregistré tout de suite." : A.peut("ecrireConsultations") ? "Vous pouvez ajouter un médicament à la liste ; le reste est modifié par le médecin." : "Consultation seulement : le médecin les modifie.") + "</p>" +
      '<div class="cf-bib">' + B.map(([k, ico, t, sous]) => '<button class="cf-b" data-bib="' + k + '" onclick="cfBib(\'' + k + "')\"><span class=\"ic\">" + A.ic(ico) + "</span><span><b>" + t + '</b><span class="mesures">' + sous + '</span><span class="mesures" id="cfBn-' + k + '"></span></span></button>').join("") +
      (A.D().membre.role === "medecin" ? '<button class="cf-b" data-bib="documentation" onclick="ordDocumentationGestion()"><span class="ic">' + A.ic("document") + '</span><span><b>Documentation</b><span class="mesures">Fiches PDF à remettre aux patients (bouton « Doc. »)</span></span></button>' : "") + "</div></section>";
  } else if (ONG === "impression") {
    // Marges d'impression (mm) : la marge du haut laisse la place à l'en-tête déjà imprimé sur le papier
    const I = ED.reg.impression, champ = (q, n, lib) => '<div><label for="cfI' + q + n + '">' + lib + '</label><input id="cfI' + q + n + '" type="number" min="0" max="150" step="1" inputmode="numeric" value="' + I[q][n] + '"' + disE + ' onchange="cfImp(\'' + q + "'," + n + ',this.value)"></div>';
    h += '<section class="carte"><h3><span class="ic">' + A.ic("imprimer") + '</span>Mise en page d\'impression</h3><p class="sous">Marges en millimètres. <b>Haut</b> = place laissée à l\'en-tête déjà imprimé sur votre papier : mesurez l\'en-tête avec une règle et ajoutez 5 à 10 mm. L\'aperçu à l\'écran (zone « En-tête du papier ») suit ces réglages.</p>' +
      [["a5", "Ordonnances A5", "Médicaments, analyses, examens, ordonnances types, courriers en A5"], ["a4", "Ordonnances A4", "Les mêmes, imprimées en A4"], ["doc", "Documents A4", "Pli confidentiel, compte rendu de fin et rendez-vous de radiothérapie"]].map(([q, t, sous]) =>
        '<h4 class="soustitre">' + t + '</h4><p class="mesures" style="margin:-4px 0 8px">' + sous + ' · par défaut ' + REGLAGES0.impression[q].join(" / ") + ' mm</p><div class="form" style="grid-template-columns:repeat(3,minmax(0,150px))">' + champ(q, 0, "Haut (en-tête)") + champ(q, 1, "Côtés") + champ(q, 2, "Bas") + "</div>").join("") + "</section>";
  } else if (ONG === "alertes") {
    const RA = ED.reg.alertes, sel = (k, l, lib, suff) => '<div><label for="cfA' + k + '">' + lib + '</label><select id="cfA' + k + '"' + disE + ' onchange="cfReg(\'alertes\',\'' + k + "',this.value)\">" + l.map((n) => "<option value=\"" + n + "\"" + (RA[k] === n ? " selected" : "") + ">" + n + " " + suff + "</option>").join("") + "</select></div>";
    h += '<section class="carte"><h3><span class="ic">' + A.ic("alerte") + '</span>Alertes (cloche)</h3><p class="sous">Délais des alertes de la cloche, en haut de l\'écran.</p><div class="form" style="grid-template-columns:repeat(2,minmax(0,280px))">' +
      sel("cure", [1, 2, 3, 4, 5, 7, 10, 14], "Cure prévue : prévenir", "jour(s) avant") + sel("finTrait", [7, 15, 30, 45, 60, 90], "Traitement terminé : signaler pendant", "jours") + "</div>" +
      '<p class="mesures">Toujours signalés : cure prévue et non validée (date dépassée), dernière cure d\'un protocole, fin de radiothérapie dépassée, dosimétrie à valider.</p></section>';
    const RS = ED.reg.salle, selS = (k, l, lib) => '<div><label for="cfS' + k + '">' + lib + '</label><select id="cfS' + k + '"' + disE + ' onchange="cfReg(\'salle\',\'' + k + "',this.value)\">" + l.map((n) => '<option value="' + n + '"' + (RS[k] === n ? " selected" : "") + ">" + n + " min</option>").join("") + "</select></div>";
    h += '<section class="carte"><h3><span class="ic">' + A.ic("horloge") + '</span>Salle d\'attente : temps d\'attente</h3><p class="sous">Le compteur « Attente 12 min » d\'un patient en salle passe à l\'orange, puis au rouge (salle d\'attente, agenda, tableau de bord).</p><div class="form" style="grid-template-columns:repeat(2,minmax(0,280px))">' +
      selS("orange", [5, 10, 15, 20, 25, 30, 40, 45, 60], "Orange à partir de") + selS("rouge", [15, 20, 30, 40, 45, 60, 75, 90, 120], "Rouge à partir de") + "</div>" +
      (RS.rouge <= RS.orange ? '<p class="err">Le rouge doit venir après l\'orange.</p>' : "") + "</section>";
  } else if (ONG === "whatsapp") {
    const ex = exempleWa();
    h += '<section class="carte"><h3><span class="ic">' + A.ic("whatsapp") + '</span>Rappels WhatsApp</h3><p class="sous">Un bouton WhatsApp apparaît à côté de chaque rendez-vous (tableau de bord, 7 prochains jours, et dossier patient). Il ouvre WhatsApp avec le message ci-dessous déjà rempli : il ne reste qu\'à appuyer sur Envoyer. Le bouton est vert quand le rendez-vous est dans ' + (ED.reg.whatsapp.de * 24) + " à " + (ED.reg.whatsapp.a * 24) + ' h (réglable ci-dessous).</p>' +
      '<p class="mesures">Variables remplacées automatiquement : <b>{prenom}</b> · <b>{nom}</b> (nom complet) · <b>{jour}</b> (mardi 14 octobre) · <b>{heure}</b> (« à 10h00 », vide si pas d\'heure) · <b>{lieu}</b> (établissement) · <b>{adresse}</b> · <b>{medecin}</b>.</p></section>';
    const RW = ED.reg.whatsapp, jr = (n) => (n === 0 ? "le jour même" : n + " jour" + (n > 1 ? "s" : "") + " avant (" + n * 24 + " h)");
    h += '<section class="carte"><h3><span class="ic">' + A.ic("horloge") + '</span>Bouton WhatsApp vert</h3><p class="sous">Le bouton devient vert quand il est temps d\'envoyer le rappel.</p><div class="form" style="grid-template-columns:repeat(2,minmax(0,220px))">' +
      '<div><label for="cfWde">Vert à partir de</label><select id="cfWde"' + disE + ' onchange="cfReg(\'whatsapp\',\'a\',this.value)">' + [1, 2, 3, 4, 5, 7].map((n) => "<option value=\"" + n + "\"" + (RW.a === n ? " selected" : "") + ">" + jr(n) + "</option>").join("") + "</select></div>" +
      '<div><label for="cfWa">jusqu\'à</label><select id="cfWa"' + disE + ' onchange="cfReg(\'whatsapp\',\'de\',this.value)">' + [0, 1, 2, 3].map((n) => "<option value=\"" + n + "\"" + (RW.de === n ? " selected" : "") + ">" + jr(n) + "</option>").join("") + "</select></div></div></section>";
    CAT_WA().forEach(([k, lib]) => {
      const v = ED.wa[k] != null ? ED.wa[k] : WA0[k] || WA0.autre, perso = ED.wa[k] != null && ED.wa[k] !== (WA0[k] || WA0.autre);
      h += '<section class="carte"><div class="entete"><h3 style="margin:0">' + (k === "autre" ? A.ic("agenda") : k === "hospit" ? A.ic("hopital") : "") + esc(lib) + (perso ? ' <span class="badge b-or">personnalisé</span>' : "") + "</h3>" + (okE && perso ? '<button class="mini" onclick="cfWaDef(\'' + k + "')\">↺ Message par défaut</button>" : "") + "</div>" +
        '<textarea class="notes" rows="5"' + disE + ' oninput="cfWa(\'' + k + "',this.value)\">" + esc(v) + '</textarea><div class="wa-ex" id="waEx_' + k + '">' + esc(remplir(v, ex)) + "</div></section>";
    });
  } else {
    const abs = ED.abs.map((a, i) => ({ a, i })).sort((p, q) => String(p.a.du).localeCompare(String(q.a.du)));
    h += '<section class="carte"><h3><span class="ic">' + A.ic("avion") + '</span>Absences (congrès, voyage, congés…)</h3><p class="sous">Les rendez-vous, cures et séances prévus pendant une absence sont signalés au tableau de bord pour être décalés, et la journée est grisée dans l\'agenda.</p>' +
      (abs.length ? '<div class="tableau"><table class="tcures"><tr><th>Du</th><th>Au</th><th>Motif</th><th>Type</th><th></th></tr>' + abs.map(({ a, i }) => "<tr><td>" + '<input type="date" value="' + esc(a.du || "") + '"' + disE + ' onchange="cfAbs(' + i + ',\'du\',this.value)"></td><td><input type="date" value="' + esc(a.au || "") + '"' + disE + ' onchange="cfAbs(' + i + ',\'au\',this.value)"></td><td><input value="' + esc(a.m || "") + '" placeholder="Congrès, voyage…"' + disE + ' onchange="cfAbs(' + i + ',\'m\',this.value)"></td>' +
        '<td><select' + disE + ' onchange="cfAbs(' + i + ',\'t\',this.value)"><option value=""></option>' + TYPES.map((t) => "<option" + (a.t === t ? " selected" : "") + ">" + t + "</option>").join("") + "</select></td><td>" + (okE ? '<button class="mini rouge" onclick="cfSupAbs(' + i + ')">✕</button>' : "") + "</td></tr>").join("") + "</table></div>" : '<p class="mesures">Aucune absence enregistrée.</p>') +
      (okE ? '<button class="bt clair petit" style="margin-top:10px" onclick="cfAjAbs()">' + A.ic("plus") + "Ajouter une absence</button>" : "") + "</section>";
    const fs = ED.feries.map((f, i) => ({ f, i })).sort((p, q) => String(p.f.d).localeCompare(String(q.f.d)));
    h += '<section class="carte"><h3><span class="ic">' + A.ic("drapeau") + '</span>Jours fériés (exclus du calcul des dates de radiothérapie)</h3><p class="sous">Les fêtes religieuses dépendent de l\'observation du croissant : ajustez la date dès l\'annonce officielle du ministère des Habous. ' + fs.length + " jours enregistrés.</p>" +
      '<div class="tableau" style="max-height:460px;overflow:auto"><table class="tcures"><tr><th style="width:190px">Date</th><th>Fête</th><th></th></tr>' + fs.map(({ f, i }) => '<tr><td><input type="date" value="' + esc(f.d) + '"' + disE + ' onchange="cfFer(' + i + ',\'d\',this.value)"></td><td><input value="' + esc(f.nom || "") + '"' + disE + ' onchange="cfFer(' + i + ',\'nom\',this.value)" style="width:100%"></td><td>' + (okE ? '<button class="mini rouge" onclick="cfSupFer(' + i + ')">✕</button>' : "") + "</td></tr>").join("") + "</table></div>" +
      (okE ? '<button class="bt clair petit" style="margin-top:10px" onclick="cfAjFer()">' + A.ic("plus") + "Ajouter un jour férié</button>" : "") + "</section>";
  }
  if (okE && ["bibliotheques", "lieux", "acces", "audit"].indexOf(ONG) < 0) h += '<div class="barre-enr">' + (ok || ["horaires", "fermetures"].indexOf(ONG) < 0 ? '<button class="bt gris" onclick="cfDefaut()">↺ Rétablir les valeurs par défaut</button>' : "") + '<span id="cfMod" class="mesures' + (MOD ? "" : " cache") + '">Modifications non enregistrées</span><button class="bt plein" id="cfOk" onclick="cfEnregistrer()"><svg class="pi"><use href="#i-enregistrer"/></svg>Enregistrer</button></div>';
  A.$("page").innerHTML = h;
  if (A.$("cfProfil")) { const o = ONG === "couleurs" ? "gagenda" : ONG; htmlOngletProfil(o).then((x) => { const z = A.$("cfProfil"); if (z && ONG === (o === "gagenda" ? "couleurs" : o)) { z.innerHTML = x; apresOngletProfil(o); } }).catch((e) => { const z = A.$("cfProfil"); if (z) z.innerHTML = '<p class="sous" style="color:var(--rouge)">Lecture impossible : ' + A.esc(e.message || String(e)) + "</p>"; }); }
  if (ONG === "audit") afficherAudit(A.$("cfAudit"));
  if (ONG === "listes") { listeL(); A.$("cfLq").oninput = () => { LQ = A.$("cfLq").value; listeL(); }; }
  if (ONG === "bibliotheques") [["medicaments", ["medicaments"], [["médicament", "médicaments"]]], ["ordostypes", ["ordostypes"], [["ordonnance type", "ordonnances types"]]], ["analyses", ["analyses", "bilans"], [["analyse", "analyses"], ["bilan", "bilans"]]], ["examens", ["examens"], [["examen", "examens"]]], ["courriers", ["courriers"], [["modèle", "modèles"]]]].forEach(([k, ls, mots]) =>
    Promise.all(ls.map((n) => tailleListe(n))).then((t) => { const e = A.$("cfBn-" + k); if (e) e.textContent = t.map((v, i) => v + " " + mots[i][v > 1 ? 1 : 0]).join(" · "); }).catch(() => {}));
}
export const remplir = (m, v) => String(m || "").replace(/\{(\w+)\}/g, (t, k) => (v[k] != null ? v[k] : t)).replace(/[ \t]+([.,])/g, "$1").replace(/ {2,}/g, " ");
const modif = (redessiner) => { MOD = true; if (redessiner) pageConfiguration(); else { const m = A.$("cfMod"); if (m) m.classList.remove("cache"); } };
window.cfOnglet = (o) => { ONG = o; history.replaceState(null, "", "#parametres/" + o); pageConfiguration(); }; // l'onglet reste après un rechargement
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
const exempleWa = () => { const p = D().profil || {}, nomDr = D().membre.role === "medecin" ? (p.nom || D().membre.nom || "") : ((D().medTitulaire && D().medTitulaire.nom) || D().nomTitulaire || ""); return { prenom: "Fatima", nom: "ALAOUI Fatima", jour: "mardi 14 octobre", heure: "à 10h00", lieu: (lieuxMembre()[0] || {}).nom || "Clinique", adresse: "", medecin: "Dr " + String(nomDr).replace(/^(Dr|Pr)\.?\s*/i, "").toUpperCase() }; };
window.cfWa = (k, v) => { ED.wa[k] = v; const e = A.$("waEx_" + k); if (e) e.textContent = remplir(v, exempleWa()); modif(); };
window.cfWaDef = (k) => { delete ED.wa[k]; modif(true); };
// ───── Tâches automatiques : une carte par règle (actif, titre, type, responsable, délai) ; + règle du médecin ─────
function sectionAuto(ok, dis) {
  const esc = A.esc, types = ED.ttache.concat([TYPE_RT]), mb = (MBR || []).filter((m) => m.actif !== false);
  // dosimétrie et fin de RT : validées par un médecin seulement, donc responsable = un médecin
  const optsPour = (v, fixe) => '<option value="titulaire"' + (v === "titulaire" ? " selected" : "") + ">Médecin titulaire</option>" + mb.filter((m) => !fixe || m.role === "medecin").map((m) => '<option value="' + esc(m.uid) + '"' + (m.uid === v ? " selected" : "") + ">" + esc(m.nom || m.email) + "</option>").join("") + (v !== "titulaire" && !mb.some((m) => m.uid === v) ? '<option value="' + esc(v) + '" selected>(n\'a plus accès : médecin titulaire)</option>' : "");
  return '<section class="carte" data-fn="taches.auto"><h3><span class="ic">' + A.ic("horloge") + '</span>Tâches automatiques</h3><p class="sous">Onco360 crée ces tâches tout seul (à chaque enregistrement d\'un dossier et chaque nuit), une seule fois par patient et par événement, même si vous la supprimez ensuite. Elles apparaissent dans les Tâches de la personne responsable, dans le dossier du patient et, si elles ont une échéance, dans son Google Agenda.</p>' +
    ED.auto.map((R, i) => { const E = EV_AUTO[R.ev] || ["?", ""];
      return '<div class="cf-auto' + (R.actif === false ? " off" : "") + '"><div class="t"><label class="chk"><input type="checkbox"' + (R.actif !== false ? " checked" : "") + dis + ' onchange="cfAuto(' + i + ',\'actif\',this.checked)"> <b>' + esc(E[0]) + "</b></label>" + (R.fixe ? '<span class="badge b-gr">fixe</span>' : ok ? '<button class="mini rouge" onclick="cfAutoSup(' + i + ')" aria-label="Supprimer cette tâche automatique">✕</button>' : "") + '</div><p class="mesures">' + esc(E[1]) + "</p>" +
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
  const std = ["annonce", "suivi", "controle", "hospit", "seance", "cchimio", "rt"], acts = {};
  const ajout = (t, lib) => { lib = String(lib || "").replace(/\s*\(par jour ouvré\)\s*$/i, "").trim(); if (lib && std.indexOf(t) < 0) acts[lib.toLowerCase()] = acts[lib.toLowerCase()] || lib; };
  const T = D().tarifs; if (T && T.etablissements) Object.values(T.etablissements).forEach((e) => (e.activites || []).forEach((a) => ajout(a.type, a.libelle)));
  if (D().activites) Object.values(D().activites).forEach((l) => (l || []).forEach((a) => ajout(a.t, a.lib)));
  const types = (TTA && TTA.length ? TTA : TYPES_TACHES0).concat([TYPE_RT]);
  return [
    ["Consultations et hospitalisations", [["rdv:annonce", "Consultation d'annonce"], ["rdv:suivi", "Consultation de suivi"], ["rdv:controle", "Consultation de contrôle"], ["rdv:rtc", "Consultation en cours de radiothérapie"], ["rdv:hospit", "Hospitalisation"]]
      .concat(Object.keys(acts).sort().map((k) => ["rdv:act:" + k, acts[k]]))],
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
  return '<section class="carte" data-fn="gagenda.filtre"><h3><span class="ic">' + A.ic("agenda") + '</span>Votre Google Agenda : ce qui y apparaît' + (cab ? " pour « " + esc(cab) + " »" : "") + "</h3>" + (cab ? '<p class="mesures">Vous travaillez pour plusieurs cabinets : un seul agenda « Onco360 » les réunit (le nom du cabinet est ajouté à chaque événement). Ces cases valent pour ce cabinet ; pour un autre, choisissez-le dans le menu « Cabinet ».</p>' : "") + '<p class="sous">Réglage <b>personnel</b> : chaque membre de l\'équipe choisit pour son propre agenda « Onco360 ». Décochez ce que vous ne voulez pas y voir ; c\'est enregistré tout de suite et votre agenda est mis à jour en quelques minutes. Un nouveau type (consultation, tâche) est coché d\'office.</p>' +
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
let LS = "diag", LQ = "";
function listeL() {
  const z = A.$("cfLl"); if (!z) return;
  const champ = { diag: "diag", mut: "mut", cor: "cor" }[LS], n = {}, ok = A.peut("parametres") || secretariat(), esc = A.esc;
  D().patients.forEach((x) => { const v = String((x.P && x.P[champ]) || "").trim().toLowerCase(); if (v) n[v] = (n[v] || 0) + 1; });
  const mots = A.sansAcc(LQ).split(/\s+/).filter(Boolean), L = ED.listes[LS].map((t, i) => ({ t, i })).filter(({ t }) => !t || mots.every((w) => A.sansAcc(t).indexOf(w) >= 0));
  z.innerHTML = L.length ? L.map(({ t, i }) => { const c = n[String(t).trim().toLowerCase()] || 0;
    return '<div class="it"><input value="' + esc(t) + '"' + (ok ? "" : " disabled") + ' aria-label="Nom" onchange="cfL(' + i + ',this.value)"><span class="mesures nb">' + (c ? c + " dossier" + (c > 1 ? "s" : "") : "") + "</span>" + (ok ? '<button class="mini rouge" title="Retirer de la liste" aria-label="Retirer ' + esc(t) + '" onclick="cfLSup(' + i + ')">✕</button>' : "") + "</div>"; }).join("")
    : '<p class="sous">Rien ne correspond.</p>';
}
window.cfLs = (k) => { LS = k; LQ = ""; pageConfiguration(); };
window.cfL = (i, v) => { ED.listes[LS][i] = String(v || "").trim(); modif(); };
window.cfLSup = (i) => { ED.listes[LS].splice(i, 1); ED.listesOrig[LS].splice(i, 1); modif(); listeL(); };
window.cfLAj = () => { LQ = ""; ED.listes[LS].push(""); ED.listesOrig[LS].push(""); modif(true); setTimeout(() => { const l = document.querySelectorAll("#cfLl input"); if (l.length) { l[l.length - 1].scrollIntoView({ block: "center" }); l[l.length - 1].focus(); } }, 30); };
window.cfBib = (n) => gererListe(n);
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
  if (ONG === "rcp") { if (!confirm("Effacer les dates de RCP (jours, heure, lieu, dates ajoutées et annulées) ?\nLes patients déjà inscrits gardent leur date.")) return; ED.rcp = RCP0(); modif(true); return; }
  if (ONG === "whatsapp") { if (!confirm("Rétablir tous les messages WhatsApp et le délai du bouton vert par défaut ?")) return; ED.wa = {}; ED.reg.whatsapp = copie(REGLAGES0.whatsapp); modif(true); return; }
  if (ONG === "listes") { if (!confirm("Rétablir les listes de départ (diagnostics, mutuelles, correspondants) ?\nLes ajouts et corrections du cabinet seront perdus.")) return; ED.listes = { diag: LISTES0.diag.slice(), mut: LISTES0.mut.slice().sort((a, z) => a.localeCompare(z, "fr")), cor: LISTES0.cor.slice().sort((a, z) => a.localeCompare(z, "fr")) }; ED.listesOrig = JSON.parse(JSON.stringify(ED.listes)); modif(true); return; }
  if (ONG === "impression") { if (!confirm("Rétablir les marges d'impression par défaut ?")) return; ED.reg.impression = copie(REGLAGES0.impression); modif(true); return; }
  if (ONG === "alertes") { if (!confirm("Rétablir les délais des alertes et de la salle d'attente par défaut ?")) return; ED.reg.alertes = copie(REGLAGES0.alertes); ED.reg.salle = copie(REGLAGES0.salle); modif(true); return; }
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
  const listes = {}; for (const k of ["diag", "mut", "cor"]) {
    const l = ED.listes[k].map((t) => String(t || "").trim()).filter(Boolean);
    const dbl = l.find((t, i) => l.findIndex((u) => u.toLowerCase() === t.toLowerCase()) !== i); if (dbl) { A.toast("Listes : « " + dbl + " » figure deux fois."); return; }
    listes[k] = k === "diag" ? l : l.sort((a, z) => a.localeCompare(z, "fr"));
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
  const cal = Object.assign({}, D().cal, { horaires: ED.horaires, horairesEtab: ED.horairesEtab, abs: ED.abs, feries: ED.feries.slice().sort((a, b) => a.d.localeCompare(b.d)) });
  const b = A.$("cfOk"); A.occupe(b, true);
  const tout = A.peut("parametres"); // sinon secrétaire : ni couleurs Google Agenda, ni tâches automatiques (règles du serveur)
  try {
    await setDoc(doc(db, "espaces", A.ESPACE, "parametres", "calendrier"), { data: JSON.stringify(cal) }, { merge: true });
    const wa = {}; Object.entries(ED.wa).forEach(([k, v]) => { if (v !== (WA0[k] || WA0.autre)) wa[k] = v; });
    if ((tout || secretariat()) && JSON.stringify(wa) !== JSON.stringify(D().wa || {})) { await setDoc(doc(db, "espaces", A.ESPACE, "parametres", "whatsapp"), { data: JSON.stringify(wa) }); D().wa = wa; }
    const coul = {}; Object.keys(COULEURS0).forEach((k) => { if (ED.coul[k] != null && ED.coul[k] !== COULEURS0[k]) coul[k] = ED.coul[k]; });
    if (tout && JSON.stringify(coul) !== JSON.stringify(COUL || {})) { await setDoc(doc(db, "espaces", A.ESPACE, "parametres", "couleursAgenda"), { data: JSON.stringify(coul) }); COUL = coul; }
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
    D().cal = cal; D().ctx.feries = cal.feries;
    D().patients.forEach((x) => A.recalculer(x, x.doc)); // les dates de radiothérapie dépendent des jours fériés
    A.journal({ id: "", r: { nm: "" } }, "Configuration modifiée (horaires, absences, jours fériés, messages WhatsApp, couleurs Google Agenda, types de documents et de tâches, dates de RCP, listes, impression, alertes)");
    MOD = false; A.toast("Paramètres enregistrés."); A.entete(); pageConfiguration();
  } catch (e) { A.occupe(b, false); A.toast(e && e.code === "permission-denied" ? "Vous n'avez pas le droit de modifier les paramètres." : "Enregistrement impossible : " + ((e && e.message) || e)); }
};
