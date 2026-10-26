// Onco360 (ex-Chimio HGC v2) – application : tableau de bord, patients, dossier. Chargée par v2.html.
window.__v2pret = true;
import { app, auth, db } from "../config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc, getDocs, setDoc, collection, query, where, updateDoc, addDoc, serverTimestamp, runTransaction, onSnapshot, arrayUnion, deleteField } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { numeroRecu, cleRecuRdv, cleRecuCons, idRecu, decisionRecu, recuAEcrire } from "../moteur/recus.js";
import { fusionner, cliniqueRemise, REMIS } from "../donnees/conversion.js";
import { resume } from "../moteur/resume.js";
import { chimioAVenir } from "../moteur/agenda.js";
import { aReprogrammer } from "../moteur/reprogrammer.js";
import { occupations, chevauche, texteConflit } from "../moteur/creneaux.js";
import { poidsActuel, textePoids } from "../moteur/poids.js";
import { cleAlerte, vuesNettoyees, partagerAlertes } from "../moteur/alertes.js"; // R-B2 (19/10/2026) : alertes cliniques vues // R-A5 (18/10/2026) : poids actuel (fiche ou dernière séance) // R-A3 (18/10/2026) : créneaux pris par les consultations de chimio et de RT
import { etatLigne, protocoleDe, seancesCure, poidsDebut, reperesClairance } from "../moteur/doses.js";
import { finRT, finRTcalc, statutRT, nbA, compteurRT, dosimetrie, contourage, RYTHMES, libRythme, volumesRT, seancesVolumes, dpfVolume, texteVolume } from "../moteur/rt.js";
import { auj, addJ, ecart, ouvre, age, srcImage, absentMedecin } from "../moteur/outils.js";
import { changerTable, hmMaroc, jourMaroc } from "../moteur/heure.js";
import { typeRdv, libRdv, joursH, T_RTC, nommerTypes } from "../moteur/rdv.js";
import { TRAITEMENTS_MA } from "../donnees/traitements.js";
import { typeCourt as typeCourtSalle } from "../moteur/salle.js"; // 26/10/2026 : nom court d'un rendez-vous (comme la salle d'attente)
import { referentiel, nomsParCle, typesPourRdv, cleDeRdv } from "../moteur/typesconsult.js";
import { tarif as tarifAu, net as netTarif } from "../moteur/tarifs.js";
import { genererConsultRT, consultFinRT } from "../moteur/rt.js";
import { idsParDefaut } from "../donnees/migration.js";
import { installer as installerDocuments, docsDe, boutonDoc, oublierDocs, suivreEtablissementDocs, supprimerDocs } from "./documents.js";
import { installer as installerVigilances, vigilancesAudit3 } from "./vigilances.js";
import { installer as installerChimio, htmlChimio, nouveauPatient as creerPatient, champDiag, activerDiag, listeMut, listeCor, figerCuresValidees, alertesBio, enrichirListes, majMontants, encaissementsDe, construireEncaissements, ecrireEncaissements, prixParServeur, oublierEncaissements } from "./chimio.js";
import { installer as installerAgenda, pageAgenda } from "./agenda.js";
import { installer as installerConfig, pageConfiguration, horaires, dureeDe, dureeType, WA0, remplir, messageAvecArabe, retouchesArabe, jourAr, heureAr } from "./configuration.js";
import { installer as installerProfil, pageProfil, DROITS_ROLE, droitsEffectifs, lireImage, estMed } from "./profil.js";
import { installer as installerProtocoles, pageProtocoles, marquerProtocoles, appliquerAudit3, appliquerP4, appliquerP5b, appliquerAudit10, appliquerProtocolesRT } from "./protocoles.js";
import { installer as installerParametres, pageParametres } from "./parametres.js";
import { installer as installerBilan, pagePageBilan, publierReleve } from "./bilan.js";
import { installer as installerOrdonnances, ajouterOrdosManquants, figerListes, ordosAudit3, majBibliotheques, question } from "./ordonnances.js";
import { figerDocumentation } from "./documentation.js";
import * as ficheP from "./fichepatient.js";
import * as infosMed from "./infosmed.js"; // lot A §4 (25/10/2026) : informations médicales en lignes
import { installer as installerFichiers, htmlFichiers, nbFichiers, oublierFichiers, suivreEtablissementFichiers, supprimerFichiers, htmlVisionneuse, sigVisionneuse, apresVisionneuse, rafraichirVisionneuse, visionneuseGrande } from "./fichiers.js";
import { installer as installerConsultations, datesConsultations, htmlConsultations, nbConsultations, oublierConsultations, suivreEtablissement, supprimerConsultations, boutonsPrescription } from "./consultations.js";
import { installer as installerReglages, reglages, appliquerImpression, margesMm } from "./reglages.js";
import { montantEnLettres } from "../donnees/factures.js";
import { installer as installerTaches, pageTaches, demarrerTaches, blocAccueil as blocTaches, tachesDuPatient, tacheSysteme, droitsTache } from "./taches.js";
import { installer as installerSalle, heureMaroc, hmMaintenant, dossiersChanges, pageSalle, demarrerSalle, apresStatutRdv, apresVenuChimio, apresPrix, bullesDossier, presenceDossier, majPresenceDossier, prixPrevu, badgeSalle, chargerJoursPasses, fichesAbsentes } from "./salle.js";
import { installer as installerAudit } from "./audit.js";
import { installer as installerRcp, demarrerRcp, rcpDuPatient, bulleRcp, suivreEtablissementRcp, supprimerRcp, pageRcpMenu } from "./rcp.js";
import { installer as installerRadiotherapie, pageRadiotherapie } from "./radiotherapie.js";
import { ACTES_RT, DIAG_AJOUTS_1012, DIAG_RENOMS_1012 } from "../donnees/listes.js";
import { abonnementEffectif } from "../donnees/modules.js";
import { STATUTS, libStatut, decede, allergique, dernieresNouvelles } from "../moteur/statut.js"; // 3.2 et 3.3 (12/10/2026)
import { reglageEffectif, styleRetraits, formulairesCabinet } from "../donnees/catalogue.js";
import * as aboP from "./abonnement.js";
import { accueilEffectif, libChamp } from "../donnees/catalogue.js";
import { deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Cabinet ouvert : celui de la personne connectée (comptes/{uid}, écrit par le serveur ; phase F, 09/10/2026). Les membres du
// premier cabinet n'ont pas toujours cette fiche : ils l'ouvrent par défaut.
const ESPACE_MODELE = "cabinet-bentahila";
let ESPACE = ESPACE_MODELE;
const $ = (i) => document.getElementById(i);
const ic = (n) => '<svg class="i"><use href="#i-' + n + '"/></svg>';
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const sansAcc = (x) => String(x || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const JOURS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"], MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const jourLong = (d) => { const x = new Date(d + "T12:00:00"); return JOURS[x.getDay()] + " " + x.getDate() + " " + MOIS[x.getMonth()]; };
const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
const dfr = (d) => d ? d.slice(8, 10) + "/" + d.slice(5, 7) : "";
const dfrA = (d) => d ? d.slice(8, 10) + "/" + d.slice(5, 7) + "/" + d.slice(0, 4) : "";
// Bulle d'un patient : sa photo si elle existe, sinon ses initiales
const bulle = (x, cls) => { const ph = srcImage(x && x.doc && x.doc.identite && x.doc.identite.photo); return '<div class="av' + (cls ? " " + cls : "") + '">' + (ph ? '<img src="' + ph + '" alt="">' : esc(initiales(x.r.nm))) + "</div>"; };
const initiales = (nm) => String(nm || "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "··";
let D = null;
const toast = (t) => { const x = $("toast"); x.textContent = t; x.classList.remove("cache"); clearTimeout(toast.t); toast.t = setTimeout(() => x.classList.add("cache"), 3800); };
window.ouvrirDossier = (id) => { location.hash = "dossier/" + encodeURIComponent(id); };
window.nouveauPatient = () => creerPatient();

// ───── Chargement ─────
onAuthStateChanged(auth, async (u) => {
  if (!u) { location.replace("index.html"); return; }
  try { D = await charger(u); appliquerImpression(); entete(); rechercheTete(); route(); menuCabinets().catch(() => {});
    if (D.bib) { lireAccueilCab(); Promise.all([figerListes(), figerDocumentation()]).catch((e) => console.warn("bibliothèque", e)); return; } // bibliothèque de référence (modèle) : rien d'autre que son tableau de bord
    lireAccueilCab();
    if (D.membre.role !== "comptable") { ecouterDossiers(); ecouterRappels(); if (module("taches")) demarrerTaches(); if (module("salle")) demarrerSalle(); if (module("rcp")) demarrerRcp(); } publierTarifsC(); planifierReleve(3000); chargerMedecins(); chargerSignataires().then(publierCarte).catch(() => {}); effacerSignature().catch((e) => console.warn("signature", e)); nomTitulaire().then(migrations); marquerProtocoles().then(() => appliquerAudit3()).then(() => appliquerP4()).then(() => appliquerP5b()).then(() => appliquerAudit10()).then(() => appliquerProtocolesRT()).then(() => ordosAudit3()).then(() => majBibliotheques().catch((er) => console.warn("bibliothèques (R-E3)", er))).then(() => vigilancesAudit3()).catch((er) => console.warn("protocoles", er)); }
  catch (e) { $("page").innerHTML = '<div class="carte"><h3>Impossible d\'ouvrir Onco360</h3><p class="sous">' + esc(e && e.code === "permission-denied" ? "Accès refusé : votre accès a peut-être été désactivé. Contactez le médecin titulaire." : e.message) + '</p><button class="bt clair" onclick="document.getElementById(\'btSortie\').click()">Se déconnecter</button></div>'; }
});
// Cabinets de la personne (19.2, 10/10/2026 : secrétaire de plusieurs médecins) : comptes/{uid}.espaces, le cabinet choisi dans le
// menu « Cabinet » en premier (gardé dans ce navigateur), puis le principal ; les autres servent de repli (cabinet suspendu…)
const CLE_CAB = (u) => "onco360.cabinet." + u.uid;
let CABINETS = []; // identifiants, dans l'ordre du menu
async function cabinetsDe(u) {
  // Bibliothèque de référence ouverte depuis l'Administration (v2.html?espace=bib-…, 10/10/2026)
  const q = new URLSearchParams(location.search).get("espace"); if (q && /^bib-[a-z-]+$/.test(q)) return [q];
  const c = await getDoc(doc(db, "comptes", u.uid)).catch(() => null), x = c && c.exists() ? c.data() : null, l = [];
  const aj = (e) => { if (e && typeof e === "string" && l.indexOf(e) < 0) l.push(e); };
  if (x) { aj(x.espace); (x.espaces || []).forEach(aj); }
  if (!l.length) aj(ESPACE_MODELE);
  CABINETS = l.slice();
  let ch = null; try { ch = localStorage.getItem(CLE_CAB(u)); } catch (e) { /* stockage indisponible */ }
  if (ch && l.indexOf(ch) > 0) { l.splice(l.indexOf(ch), 1); l.unshift(ch); }
  return l;
}
// Menu « Cabinet » (sous le logo) : seulement pour une personne qui a plusieurs cabinets ; changer = recharger Onco360 dans l'autre
async function menuCabinets() {
  const z = $("cabChoix"); if (!z || CABINETS.length < 2 || D.bib) return;
  const noms = await Promise.all(CABINETS.map((e) => getDoc(doc(db, "espaces", e)).then((s) => (s.exists() ? s.data().nom || e : null)).catch(() => null)));
  const L = CABINETS.map((e, i) => ({ e, nom: noms[i] })).filter((o) => o.nom || o.e === ESPACE);
  if (L.length < 2) return;
  z.classList.remove("cache"); D.cabinets = L;
  const dessiner = (act) => {
    const ailleurs = L.some((o) => o.e !== ESPACE && act[o.e] && (act[o.e].salle || act[o.e].taches));
    z.innerHTML = '<label for="cabSel">Cabinet' + (ailleurs ? ' <span class="cab-pt" title="Du nouveau dans un autre cabinet"></span>' : "") + '</label><select id="cabSel">' + L.map((o) => { const a = o.e !== ESPACE && act[o.e], p = a ? [a.salle ? a.salle + " en salle" : "", a.taches ? a.taches + " tâche" + (a.taches > 1 ? "s" : "") : ""].filter(Boolean).join(", ") : "";
      return '<option value="' + esc(o.e) + '"' + (o.e === ESPACE ? " selected" : "") + ">" + esc(o.nom || o.e) + (p ? " · " + p : "") + "</option>"; }).join("") + "</select>";
    $("cabSel").onchange = () => { allerCabinet($("cabSel").value, "accueil"); };
  };
  dessiner({});
  if (!document.querySelector('nav a[data-p="tous"]')) { const a = document.createElement("a"); a.href = "#tous"; a.dataset.p = "tous"; a.innerHTML = ic("agenda") + "Mes cabinets aujourd'hui"; const nav = document.querySelector("nav"), ac = nav.querySelector('a[data-p="accueil"]'); if (ac) ac.after(a); else nav.prepend(a); }
  // Pastilles (19.7) : patients en salle et tâches à faire dans les autres cabinets, relues toutes les 2 minutes
  const relire = async () => { const act = {}; for (const o of L) if (o.e !== ESPACE) act[o.e] = await activiteCabinet(o.e).catch(() => null); dessiner(act); };
  relire(); setInterval(relire, 120000);
}
// Passer dans un autre cabinet (menu « Cabinet », vue « Mes cabinets aujourd'hui ») : Onco360 rechargé sur la page voulue
function allerCabinet(e, page) { try { localStorage.setItem(CLE_CAB(D.u), e); } catch (er) { /* stockage indisponible */ } location.hash = page || "accueil"; location.reload(); }
window.allerCabinet = (e, page) => (e === ESPACE ? (location.hash = page || "accueil") : allerCabinet(e, page));
// Fiche de membre de la personne dans un autre cabinet, et filtre de ses lieux (règles : périmètre)
async function membreDans(e) { const s = await getDoc(doc(db, "espaces", e, "membres", D.u.uid)); const m = s.exists() ? s.data() : null; return m && m.actif !== false ? m : null; }
const filtreLieux = (m) => (m.tousEtablissements ? [] : [where("etablissementId", "in", (m.etablissements || []).length ? m.etablissements.slice(0, 30) : ["—"])]);
async function activiteCabinet(e) {
  const m = await membreDans(e); if (!m) return null;
  const [ss, st] = await Promise.all([getDocs(query(collection(db, "espaces", e, "salle"), where("jour", "==", D.t), ...filtreLieux(m))).catch(() => null), getDocs(query(collection(db, "espaces", e, "taches"), where("qui", "array-contains", D.u.uid))).catch(() => null)]);
  return { salle: ss ? ss.docs.filter((d) => d.data().etat === "salle").length : 0, taches: st ? st.docs.filter((d) => d.data().pour === D.u.uid && d.data().statut !== "fait").length : 0 };
}
// ───── Mes cabinets aujourd'hui (19.7) : rendez-vous, cures et séances du jour de chaque cabinet, avec l'état de la salle d'attente ─────
const ETAT_SALLE = { "": ["À venir", "b-gr"], salle: ["En salle", "b-or"], consult: ["En consultation", "b-co"], vu: ["Vu", "b-ch"], absent: ["Absent", "b-al"] };
async function pageTous() {
  const L = D.cabinets || CABINETS.map((e) => ({ e, nom: e }));
  $("page").innerHTML = '<section class="accueil"><div><h2>Mes cabinets aujourd\'hui</h2><p>' + cap(jourLong(D.t)) + " · rendez-vous, cures et séances de chacun de vos cabinets. « Ouvrir » passe dans le cabinet du patient.</p></div></section><div id=\"tousL\"><p class=\"sous\">Chargement…</p></div>";
  let h = "";
  for (const o of L) {
    let lignes = [], err = "";
    try {
      const m = o.e === ESPACE ? D.membre : await membreDans(o.e); if (!m) continue;
      const [sp, ss] = await Promise.all([getDocs(query(collection(db, "espaces", o.e, "patients"), ...filtreLieux(m))), getDocs(query(collection(db, "espaces", o.e, "salle"), where("jour", "==", D.t), ...filtreLieux(m))).catch(() => null)]);
      const etat = {}; if (ss) ss.docs.forEach((d) => { const x = d.data(); etat[x.patientId + "|" + x.cle] = x.etat || ""; if (!((x.patientId + "|*") in etat) || x.etat) etat[x.patientId + "|*"] = x.etat || ""; });
      sp.docs.forEach((d) => { let r = {}; try { r = JSON.parse(d.data().resume || "{}"); } catch (er) { return; }
        (r.ag || []).forEach((ev) => { if (/\|dosi$/.test(String(ev.k)) || !(ev.d === D.t || (ev.f && ev.d <= D.t && ev.f >= D.t))) return;
          const p = String(ev.k).split("|"), cle = p[1] === "r" ? "r-" + p.slice(2).join("|") : "", e2 = cle && (d.id + "|" + cle) in etat ? etat[d.id + "|" + cle] : etat[d.id + "|*"];
          lignes.push({ pid: d.id, h: ev.h || "", t: ev.t || "", etat: e2 }); }); });
      lignes.sort((a, b) => (a.h || "99").localeCompare(b.h || "99") || a.t.localeCompare(b.t));
    } catch (er) { err = er.message || String(er); }
    const n = (k) => lignes.filter((l) => l.etat === k).length;
    h += '<section class="carte"><div class="entete"><h3 style="margin:0">' + esc(o.nom || o.e) + (o.e === ESPACE ? ' <span class="badge b-gr">ouvert</span>' : "") + "</h3>" + (o.e === ESPACE ? "" : '<button class="bt clair petit" onclick="allerCabinet(\'' + esc(o.e) + "','salle')\">Ouvrir sa salle d'attente</button>") + "</div>" +
      '<p class="mesures">' + lignes.length + " au programme" + (n("salle") ? " · " + n("salle") + " en salle" : "") + (n("consult") ? " · " + n("consult") + " en consultation" : "") + (n("vu") ? " · " + n("vu") + " vu" + (n("vu") > 1 ? "s" : "") : "") + "</p>" +
      (err ? '<p class="err">Lecture impossible : ' + esc(err) + "</p>" : lignes.length ? lignes.map((l) => { const st = l.etat != null ? ETAT_SALLE[l.etat] || ETAT_SALLE[""] : null;
        return '<div class="ev"><span class="h' + (l.h ? "" : " j") + '">' + esc(l.h || "Journée") + '</span><div class="tx"><b>' + esc(l.t) + "</b></div>" + (st ? '<span class="badge ' + st[1] + '">' + st[0] + "</span>" : "") + '<button class="lien" onclick="allerCabinet(\'' + esc(o.e) + "','dossier/" + encodeURIComponent(l.pid) + "')\">Ouvrir</button></div>"; }).join("") : '<p class="sous">Rien de prévu aujourd\'hui.</p>') + "</section>";
  }
  if ($("tousL") && D.page === "tous") $("tousL").innerHTML = h || '<p class="sous">Aucun cabinet.</p>';
}
async function charger(u) {
  // Fiche de membre (refus = accès désactivé, ou cabinet d'un autre) ; repli sur le premier cabinet
  let refus = null;
  const lireMembre = (e) => getDoc(doc(db, "espaces", e, "membres", u.uid)).then((s) => (s.exists() ? s : null)).catch((er) => { refus = refus || er; return null; });
  const cands = await cabinetsDe(u);
  ESPACE = cands[0];
  // le cabinet choisi, sinon le suivant de la liste (accès désactivé ou cabinet suspendu dans l'un d'eux)
  let m = null, inactif = null;
  // Lot C : remplaçant hors de sa période = comme un accès désactivé (cabinet suivant, sinon message)
  const horsPeriode = (d) => d.role === "remplacant" && ((d.remplaceDebMs && Date.now() < d.remplaceDebMs) || (d.remplaceFinMs && Date.now() > d.remplaceFinMs));
  for (const e of cands) { const s = await lireMembre(e); if (s && (s.data().actif === false || horsPeriode(s.data()))) { inactif = inactif || s; continue; } if (s) { ESPACE = e; m = s; break; } }
  if (!m && /^bib-/.test(ESPACE)) throw new Error("Cette bibliothèque s'ouvre depuis la page Administration (bouton « Ouvrir et modifier »).");
  if (!m && cands.indexOf(ESPACE_MODELE) < 0) { const m2 = await lireMembre(ESPACE_MODELE); if (m2) { ESPACE = ESPACE_MODELE; m = m2; } }
  if (!m && inactif) m = inactif; // message « accès désactivé » ci-dessous
  if (!m) {
    // Compte d'administration (aucun cabinet) : page Administration
    const ad = await getDoc(doc(db, "administrateurs", u.uid)).catch(() => null);
    if (ad && ad.exists()) { location.replace("admin.html"); await new Promise(() => {}); }
    // Cabinet suspendu par l'administration (abonnement) : message clair, rien n'est effacé
    const ce = await getDoc(doc(db, "espaces", ESPACE)).catch(() => null);
    if (ce && ce.exists() && ce.data().actif === false) throw new Error("L'accès à ce cabinet est suspendu. Vos données sont conservées. Contactez l'éditeur d'Onco360 pour le rétablir.");
    if (refus) throw refus;
    await setDoc(doc(db, "utilisateurs", u.uid), { email: u.email }, { merge: true }).catch(() => {}); throw new Error("Ce compte (" + u.email + ") n'a pas encore d'accès à Onco360. Demandez au médecin titulaire de vous ajouter dans Paramètres › Accès."); }
  if (m.data().actif === false) throw new Error("Votre accès à Onco360 a été désactivé. Contactez le médecin titulaire.");
  if (horsPeriode(m.data())) { const z = m.data(), j = (s) => s.split("-").reverse().join("/"); throw new Error(z.remplaceDebMs && Date.now() < z.remplaceDebMs ? "Votre accès de médecin remplaçant commence le " + j(z.remplaceDu || "") + "." : "Votre remplacement s'est terminé le " + j(z.remplaceAu || "") + ". Contactez le médecin titulaire pour le prolonger."); }
  // Toutes les lectures partent en même temps (au lieu de l'une après l'autre) : ouverture nettement plus rapide
  const membre = m.data(); membre.droitsStockes = membre.droits || {}; membre.droits = droitsEffectifs(membre); const col = collection(db, "espaces", ESPACE, "patients"), E = (c, i) => doc(db, "espaces", ESPACE, c, i);
  const pFO = getDoc(E("parametres", "formulaires")).catch(() => null); // fiche patient et consultation retouchées par le cabinet (Paramètres › Cabinet, 11/10/2026)
  const pTY = getDoc(E("parametres", "typesConsult")).catch(() => null); // référentiel des types de consultation (3.13)
  // Heure du Maroc (S1, 21/10/2026) : changements d'heure ajoutés par l'Administration, avant tout calcul du jour (lecture en échec : table du code)
  await getDoc(doc(db, "plateforme", "heureMaroc")).then((s) => changerTable(s.exists() ? s.data().changements : null)).catch(() => {});
  const [pr, sp, sc, qs, sl, sE, sT, sA, sW, sMT, sTC, sRG, sES] = await Promise.all([
    getDoc(doc(db, "utilisateurs", u.uid)).catch(() => null),
    getDocs(collection(db, "espaces", ESPACE, "protocoles")),
    getDoc(E("parametres", "calendrier")),
    // Comptable (étape 9 S2) : aucun dossier patient (les règles le lui ferment) ; il travaille sur le relevé financier
    membre.role === "comptable" ? Promise.resolve({ docs: [] }) : membre.tousEtablissements ? getDocs(col) : getDocs(query(col, where("etablissementId", "in", membre.etablissements || ["—"]))),
    getDoc(E("parametres", "listes")).catch(() => null),
    getDocs(collection(db, "espaces", ESPACE, "etablissements")).catch(() => null),
    membre.droits && membre.droits.finances === true ? getDoc(E("finances", "tarifs")).catch(() => null) : Promise.resolve(null),
    getDoc(E("parametres", "activites")).catch(() => null),
    getDoc(E("parametres", "whatsapp")).catch(() => null),
    getDoc(E("parametres", "medecinTitulaire")).catch(() => null),
    getDoc(E("parametres", "tarifsConsultations")).catch(() => null),
    getDoc(E("parametres", "reglages")).catch(() => null), // Paramètres : impression, WhatsApp, alertes (08/10/2026)
    getDoc(doc(db, "espaces", ESPACE)).catch(() => null), // fiche du cabinet : formule et modules (09/10/2026)
  ]);
  const profil = pr && pr.exists() ? pr.data() : {}, bib = {};
  const bibDoc = {}, bibOrdre = {};
  sp.forEach((d) => { bibOrdre[d.id] = []; JSON.parse(d.data().data).forEach((p) => { bib[p.id] = p; bibDoc[p.id] = d.id; bibOrdre[d.id].push(p.id); }); });
  const cal = sc.exists() ? JSON.parse(sc.data().data) : { feries: [], abs: [] };
  const listes = sl && sl.exists() ? JSON.parse(sl.data().data) : { cor: [], mut: [] }, etabsTous = sE ? sE.docs.map((d) => d.data()).sort((a, b) => String(a.code).localeCompare(String(b.code))) : [], etabs = etabsTous.filter((e) => e.actif !== false);
  const tarifs = sT && sT.exists() ? JSON.parse(sT.data().data) : null;
  const t = auj(), ctx = { aujourdhui: t, bib, feries: cal.feries || [] };
  // 3.13 : noms des types de consultation (rendez-vous, agenda, bilan) posés avant le calcul des dossiers
  let typesEnr = null; try { const sTY = await pTY; typesEnr = sTY && sTY.exists() ? JSON.parse(sTY.data().data || "null") : null; } catch (e) { /* illisible : liste de départ */ }
  const activites0 = sA && sA.exists() ? JSON.parse(sA.data().data || "{}") : null;
  nommerTypes(nomsParCle(referentiel(typesEnr, { acts: actsDe(tarifs, activites0) })));
  const patients = qs.docs.map((d) => { const x = { id: d.id }; recalculer(x, d.data(), ctx); return x; });
  patients.sort((a, b) => String(a.r.nm).localeCompare(String(b.r.nm)));
  const activites = sA && sA.exists() ? JSON.parse(sA.data().data || "{}") : null;
  const wa = sW && sW.exists() ? JSON.parse(sW.data().data || "{}") : {};
  const medTitulaire = sMT && sMT.exists() ? sMT.data() : null;
  const tarifsC = sTC && sTC.exists() ? JSON.parse(sTC.data().data || "null") : null;
  let reglagesC = {}; try { reglagesC = sRG && sRG.exists() ? JSON.parse(sRG.data().data || "{}") : {}; } catch (e) { /* réglages illisibles : par défaut */ }
  // Formule du cabinet (phase F, 09/10/2026) : un module retiré est caché (pages, boutons, onglets) ; ses données restent dans la
  // base. Chimiothérapie, radiothérapie et documents retirés = droits correspondants coupés à l'écran pour tout le cabinet.
  const espaceDoc = sES && sES.exists() ? sES.data() : {}, abo = abonnementEffectif(espaceDoc.abonnement);
  if (!abo.modules.chimio) Object.assign(membre.droits, { traitements: "aucun", planningChimio: false, administrer: false });
  if (!abo.modules.rt) membre.droits.radiotherapie = "aucun";
  if (!abo.modules.documents) membre.droits.documents = false;
  // Réglage du cabinet (10/10/2026) : ordre du menu, cartes du tableau de bord, onglets des Paramètres, bibliothèques, fonctions
  // Fiche tumeur (3.1, 12/10/2026) : cabinets d'oncologie / radiothérapie = module chimiothérapie ou radiothérapie (ou sans formule) ;
  // bibliothèque de référence : celle d'oncologie seulement
  const onco = espaceDoc.bibliotheque === true ? ESPACE === "bib-oncologie" : !espaceDoc.abonnement || abo.modules.chimio || abo.modules.rt;
  const regAdmin = reglageEffectif(espaceDoc.bibliotheque === true ? null : espaceDoc.abonnement && espaceDoc.abonnement.reglage, Object.assign({}, espaceDoc.ficheSpe || {}, { _onco: onco }), Object.assign({}, espaceDoc.consultSpe || {}, { _onco: onco })); // formulaires de consultation proposés (3.4) // fiche patient et consultation : celles de la spécialité + retouches du cabinet
  // puis retouches faites par le cabinet lui-même (parametres/formulaires) ; regAdmin.fiche / .consultation = base de l'éditeur des Paramètres
  let formCab = null; try { const sFO = await pFO; formCab = sFO && sFO.exists() ? JSON.parse(sFO.data().data || "{}") : null; } catch (e) { /* illisible : réglage de l'administration */ }
  const reg = espaceDoc.bibliotheque === true ? regAdmin : formulairesCabinet(regAdmin, formCab);
  const typesC = referentiel(typesEnr, { acts: actsDe(tarifs, activites), journal: ((reg.consultation || {}).choixs || {}).type || [] });
  return { typesC, typesEnr, u, membre, profil, cal, ctx, t, patients, listes, etabs, etabsTous, tarifs, bibDoc, bibOrdre, activites, wa, medTitulaire, tarifsC, reglages: reglagesC, abo, espaceDoc, bib: espaceDoc.bibliotheque === true, reg, regAdmin, formCab };
}
// Activités des établissements (tarifs, sinon copie publiée) : [[clé, nom]], source de la liste de départ des types de consultation (3.13)
function actsDe(tarifs, activites) {
  const l = [];
  if (tarifs && tarifs.etablissements) Object.values(tarifs.etablissements).forEach((e) => (e.activites || []).forEach((a) => l.push([a.type, a.libelle])));
  if (activites) Object.values(activites).forEach((L) => (L || []).forEach((a) => l.push([a.t, a.lib])));
  return l;
}
// Référentiel recalculé après un enregistrement (Paramètres › Types de consultation) : noms partout, dossiers recalculés
window.majTypesC = (enr) => {
  D.typesEnr = enr; D.typesC = referentiel(enr, { acts: actsDe(D.tarifs, D.activites), journal: ((D.reg.consultation || {}).choixs || {}).type || [] });
  nommerTypes(nomsParCle(D.typesC)); D.patients.forEach((x) => recalculer(x, x.doc));
};
// Médecins du cabinet (AG4, 11/10/2026) : médecin d'un rendez-vous et filtre de l'agenda, à partir de 2 médecins actifs.
// Rendez-vous sans médecin noté (anciens) = le médecin titulaire.
// 3.9 (12/10/2026) : carte de chaque médecin (nom, titre, spécialité, INPE) publiée par lui-même dans signataires/{uid}, lue par
// l'équipe pour l'en-tête et le nom sous la signature des ordonnances (médecin signataire au choix). R-E5 (19/10/2026, audit n° 7, d. 25 et
// réponse de Dr Bentahila) : plus de signature scannée ; la carte réécrite sans elle, l'image effacée du profil (effacerSignature)
const carteDe = () => ({ nom: nomDrNP(D.profil, D.membre.nom), titre: D.profil.titre || "Dr", specialite: D.profil.specialite || "", inpe: D.profil.inpe || "", genre: D.profil.genre || "",
  idFiscal: D.profil.idFiscal || "", tp: D.profil.tp || "", ice: D.profil.ice || "" }); // IF, TP, ICE : reçus (R-B5, 19/10/2026)
async function publierCarte() {
  if (D.membre.role !== "medecin" || D.bib) return;
  const c = carteDe(), a = (D.signataires || {})[D.u.uid];
  if (a && JSON.stringify(Object.assign({}, a, { maj: 0 })) === JSON.stringify(Object.assign({}, c, { maj: 0 }))) return;
  await setDoc(doc(db, "espaces", ESPACE, "signataires", D.u.uid), Object.assign({}, c, { maj: new Date().toISOString() }));
  D.signataires = Object.assign({}, D.signataires || {}, { [D.u.uid]: c });
}
async function effacerSignature() {
  if (!D.profil || !("signature" in D.profil)) return;
  await updateDoc(doc(db, "utilisateurs", D.u.uid), { signature: deleteField() }); delete D.profil.signature;
}
async function chargerSignataires() {
  if (D.membre.role === "comptable") return;
  try { const s = await getDocs(collection(db, "espaces", ESPACE, "signataires")); const o = {}; s.forEach((d) => { o[d.id] = d.data(); }); D.signataires = o; } // sa propre carte : publierCarte (ensuite)
  catch (e) { D.signataires = {}; }
}
async function chargerMedecins() {
  try {
    const s = await getDocs(collection(db, "espaces", ESPACE, "membres"));
    D.medecins = s.docs.map((d) => Object.assign({ uid: d.id }, d.data())).filter((m) => m.role === "medecin" && m.actif !== false)
      .map((m) => ({ uid: m.uid, nom: /^(Dr|Pr)\b/i.test(m.nom || "") ? m.nom : "Dr " + (m.nom || m.email || "") })).sort((a, b) => a.nom.localeCompare(b.nom));
    if (D.medecins.length > 1 && location.hash.indexOf("#agenda") === 0) pageAgenda();
    // 20/10/2026 : salle d'attente (filtre « Médecin ») et bandeau du dossier (médecin du patient) refaits une fois la liste connue
    else if (D.medecins.length > 1 && location.hash.indexOf("#salle") === 0 && !occupeEcran()) pageSalle();
    else if (D.medecins.length > 1 && /^dossier\//.test(D.page || "") && !occupeEcran()) { const y = window.scrollY; pageDossier(decodeURIComponent(D.page.slice(8))); window.scrollTo(0, y); }
  } catch (er) { D.medecins = null; }
}
const titulaireUid = () => (D.espaceDoc && D.espaceDoc.titulaire) || "";
const multiMed = () => (D.medecins || []).length > 1;
const medRdv = (r) => (r && r.med) || titulaireUid();
const medDefaut = () => (D.membre.role === "medecin" ? D.u.uid : titulaireUid());
// R-C3 (19/10/2026) : médecin du patient (fiche, identite.med) : médecin par défaut de ses rendez-vous, lignes de chimio et radiothérapies
const medPatient = (x) => ((x && x.doc && x.doc.identite) || {}).med || "";
const medPourPatient = (x) => medPatient(x) || medDefaut();
const nomMed = (uid) => ((D.medecins || []).find((m) => m.uid === uid) || {}).nom || "";
// Nom du médecin titulaire (signature des messages WhatsApp envoyés par la secrétaire ou l'infirmière)
async function nomTitulaire() {
  try {
    const e = await getDoc(doc(db, "espaces", ESPACE)); const tit = e.exists() && e.data().titulaire; if (!tit) return;
    if (tit === D.u.uid) { D.nomTitulaire = nomMedecin(); return; }
    const m = await getDoc(doc(db, "espaces", ESPACE, "membres", tit)); if (m.exists() && m.data().nom) D.nomTitulaire = m.data().nom;
  } catch (er) { /* signature par défaut : le nom de la personne connectée */ }
}
// Mises à niveau ponctuelles, faites par le médecin titulaire à l'ouverture (sans effet si déjà faites) :
//  • droits ajoutés le 06/10/2026 (fiche, consultations, documents, encaissements…) : valeur par défaut du rôle de chaque membre,
//    l'infirmière passant à « radiothérapie : patients sous chimio » ;
//  • prix à encaisser (collection encaissements) des dossiers existants, lisibles par la secrétaire.
async function migrations() {
  try {
    const e = await getDoc(doc(db, "espaces", ESPACE)); if (!e.exists() || e.data().titulaire !== D.u.uid) return;
    // Numéro de dossier : les dossiers qui n'en ont pas sont numérotés une fois, dans l'ordre de leur inscription (étape 8)
    if (D.patients.some((x) => !numDossier(x))) {
      try {
        const o = await appelServeur("numerosManquants", { espace: ESPACE });
        if (o && o.nb) { const sp = await getDocs(collection(db, "espaces", ESPACE, "patients")); sp.forEach((d2) => { const x = D.patients.find((p) => p.id === d2.id); if (x) recalculer(x, d2.data()); }); if (/^(patients|dossier)/.test(D.page || "")) route(); }
      } catch (er) { console.warn("numéros de dossier", er); }
    }
    // Nom et INPE du médecin titulaire, pour les fiches chimio imprimées par l'équipe
    const mt = Object.assign(medecinFiche(), { signature: signatureWA() }); if (!D.medTitulaire || D.medTitulaire.nom !== mt.nom || D.medTitulaire.inpe !== mt.inpe || D.medTitulaire.signature !== mt.signature || (D.medTitulaire.specialite || "") !== mt.specialite || (D.medTitulaire.genre || "") !== mt.genre) await setDoc(doc(db, "espaces", ESPACE, "parametres", "medecinTitulaire"), mt).then(() => { D.medTitulaire = mt; }).catch(() => {});
    const sm = await getDocs(collection(db, "espaces", ESPACE, "membres"));
    for (const d of sm.docs) {
      const m = d.data(), dr = m.droits || {}, def = DROITS_ROLE[m.role] || {}, ajout = {};
      Object.keys(def).forEach((k) => { if (!(k in dr)) ajout[k] = def[k]; });
      if (m.role === "infirmiere" && !("consultations" in dr) && dr.radiotherapie === "voir") ajout.radiotherapie = "chimio";
      const champs = {}; Object.keys(ajout).forEach((k) => { champs["droits." + k] = ajout[k]; }); // un champ à la fois : les autres droits ne bougent pas
      if (Object.keys(champs).length) await updateDoc(d.ref, champs).catch((er) => console.warn("droits", d.id, er));
    }
    const g = await getDoc(doc(db, "espaces", ESPACE, "parametres", "migrations")).catch(() => null), fait = g && g.exists() ? g.data() : {};
    // R-A1 (18/10/2026) : registre illisible = on ne sait pas ce qui est déjà fait ; rien n'est refait (sinon la mise à niveau des ordonnances
    // types remplaçait la liste du cabinet par la liste de départ) ; nouvel essai à la prochaine ouverture
    if (!g) { console.warn("migrations : registre illisible, rien n'est refait"); return; }
    // Remplaçants (26/10/2026) : ceux créés avec les droits du titulaire (lot C) reçoivent une fois la grille du remplaçant pour le bilan,
    // les bibliothèques et le référentiel de radiothérapie ; le titulaire les règle ensuite dans Paramètres › Accès
    if (!fait.remplacantDroits) {
      let ok = true;
      for (const d of sm.docs.filter((z) => z.data().role === "remplacant")) await updateDoc(d.ref, { "droits.finances": false, "droits.parametres": false, "droits.referentielRT": "voir" }).catch((er) => { ok = false; console.warn("droits du remplaçant", d.id, er); });
      if (ok) await setDoc(doc(db, "espaces", ESPACE, "parametres", "migrations"), { remplacantDroits: D.t }, { merge: true }).catch(() => {});
    }
    // Fiches médicales réparées (12/10/2026) : enregistrées une fois telles que relues (champs remis hors de clinique._autres)
    for (const x of D.patients.filter((z) => z.repare)) { await enregistrer(x, { clinique: x.doc.clinique }, "Fiche médicale réparée (champs ajoutés, statut, allergie)").then(() => { x.repare = false; }).catch((er) => console.warn("réparation", x.id, er)); }
    // Localisations de cancer ajoutées le 12/10/2026 (3.1 bis) : ajoutées une fois à la liste déjà réglée du cabinet (rien n'est retiré)
    if (!fait.diag1012) {
      const L0 = D.listes || {};
      if (L0.complet && Array.isArray(L0.diag)) { const m = DIAG_AJOUTS_1012.filter((d) => !L0.diag.some((z) => sansAcc(z) === sansAcc(d)));
        if (m.length) { const L1 = Object.assign({}, L0, { diag: L0.diag.concat(m) }); await setDoc(doc(db, "espaces", ESPACE, "parametres", "listes"), { data: JSON.stringify(L1) }).then(() => { D.listes = L1; }).catch((er) => console.warn("localisations", er)); } }
      await setDoc(doc(db, "espaces", ESPACE, "parametres", "migrations"), { diag1012: D.t }, { merge: true }).catch(() => {});
    }
    // « (sous-type à préciser) » retiré des localisations (12/10/2026) : renommées une fois dans la liste du cabinet et dans les dossiers
    if (!fait.diag1012b) {
      const L0 = D.listes || {}, R = DIAG_RENOMS_1012;
      if (L0.complet && Array.isArray(L0.diag) && L0.diag.some((d) => R[d])) { const L1 = Object.assign({}, L0, { diag: [...new Set(L0.diag.map((d) => R[d] || d))] }); await setDoc(doc(db, "espaces", ESPACE, "parametres", "listes"), { data: JSON.stringify(L1) }).then(() => { D.listes = L1; }).catch((er) => console.warn("localisations", er)); }
      const renoms = Object.keys(R).filter((de) => D.patients.some((x) => ((x.doc.clinique || {}).diag || "") === de)).map((de) => ({ k: "diag", de, vers: R[de] }));
      let ok = true;
      if (renoms.length) { try { await appelServeur("corrigerListes", { espace: ESPACE, renoms }); for (const x of D.patients) { if (!renoms.some((z) => z.de === ((x.doc.clinique || {}).diag || ""))) continue; const s2 = await getDoc(doc(db, "espaces", ESPACE, "patients", x.id)).catch(() => null); if (s2 && s2.exists()) recalculer(x, s2.data()); } } catch (er) { ok = false; console.warn("localisations (dossiers)", er); } }
      if (ok) await setDoc(doc(db, "espaces", ESPACE, "parametres", "migrations"), { diag1012b: D.t }, { merge: true }).catch(() => {});
    }
    // Traitements courants de médecine générale (26/10/2026, fichier de Dr Bentahila) : ajoutés une fois à la liste « Traitements en cours » déjà
    // enregistrée par le cabinet (rien n'est retiré ; sans liste enregistrée, la liste de départ les contient déjà)
    if (!fait.traitMa1026) {
      const L0 = D.listes || {};
      if (Array.isArray(L0.traitCours)) { const m = TRAITEMENTS_MA.filter((d) => !L0.traitCours.some((z) => sansAcc(z) === sansAcc(d)));
        if (m.length) { const L1 = Object.assign({}, L0, { traitCours: L0.traitCours.concat(m) }); await setDoc(doc(db, "espaces", ESPACE, "parametres", "listes"), { data: JSON.stringify(L1) }).then(() => { D.listes = L1; }).catch((er) => console.warn("traitements", er)); } }
      await setDoc(doc(db, "espaces", ESPACE, "parametres", "migrations"), { traitMa1026: D.t }, { merge: true }).catch(() => {});
    }
    // Consultation de fin de radiothérapie (12/10/2026) : créée une fois pour les radiothérapies en cours ou à venir (ensuite : sauverRT)
    if (!fait.consultFinRT && peut("rendezvous") && reglages().auto.rtFin) {
      for (const x of D.patients) {
        if (!(x.P.rts || []).some((r) => !r.fin && r.deb)) continue;
        const P2 = { rts: JSON.parse(x.doc.rtsJson || "[]"), rdvs: JSON.parse(x.doc.rdvsJson || "[]") }, r0 = JSON.stringify(P2.rts);
        if (consultFinRT(P2, Object.assign({}, D.ctx, { nouvelId: idsParDefaut() }))) await enregistrer(x, Object.assign({ rdvsJson: JSON.stringify(P2.rdvs) }, JSON.stringify(P2.rts) !== r0 ? { rtsJson: JSON.stringify(P2.rts) } : {}), "Consultation de fin de radiothérapie créée").catch((er) => console.warn("fin de RT", x.id, er));
      }
      await setDoc(doc(db, "espaces", ESPACE, "parametres", "migrations"), { consultFinRT: D.t }, { merge: true }).catch(() => {});
    }
    // R-C5 (20/10/2026) : messages WhatsApp du cabinet écrits en français seulement : l'arabe de leur type ajouté une fois avant la signature
    // (visible et modifiable dans Paramètres › WhatsApp ; rien d'autre ne change dans le texte)
    if (!fait.waBilingue) {
      const W0 = D.wa || {}, W1 = {}; let n = 0;
      Object.keys(W0).forEach((k) => { const v = W0[k]; W1[k] = typeof v === "string" && v.trim() ? messageAvecArabe(v, k) : v; if (W1[k] !== v) n++; });
      let ok = true;
      if (n) await setDoc(doc(db, "espaces", ESPACE, "parametres", "whatsapp"), { data: JSON.stringify(W1) }).then(() => { D.wa = W1; }).catch((er) => { ok = false; console.warn("messages WhatsApp (arabe)", er); });
      if (ok) await setDoc(doc(db, "espaces", ESPACE, "parametres", "migrations"), { waBilingue: D.t }, { merge: true }).catch(() => {});
    }
    // T7 (24/10/2026) : les 3 retouches de l'arabe reprises une fois dans les messages du cabinet qui ont encore le texte de départ
    if (!fait.waAr3) {
      const W0 = D.wa || {}, W1 = {}; let n = 0;
      Object.keys(W0).forEach((k) => { const v = W0[k]; W1[k] = typeof v === "string" ? retouchesArabe(v) : v; if (W1[k] !== v) n++; });
      let ok = true;
      if (n) await setDoc(doc(db, "espaces", ESPACE, "parametres", "whatsapp"), { data: JSON.stringify(W1) }).then(() => { D.wa = W1; }).catch((er) => { ok = false; console.warn("messages WhatsApp (arabe, T7)", er); });
      if (ok) await setDoc(doc(db, "espaces", ESPACE, "parametres", "migrations"), { waAr3: D.t }, { merge: true }).catch(() => {});
    }
    // R-C1 (19/10/2026) : consultations hebdomadaires de RT refaites une fois (jour férié compris, identifiants gardés, médecin et lieu de la RT)
    if (!fait.rtcFeries && peut("rendezvous") && fnOn("rt.hebdo") && reglages().auto.rtHebdo) {
      let ok = true;
      for (const x of D.patients) {
        if (!(x.P.rts || []).some((r) => !r.fin && r.deb && r.cj)) continue;
        const P2 = { rts: JSON.parse(x.doc.rtsJson || "[]"), rdvs: JSON.parse(x.doc.rdvsJson || "[]") }, r0 = JSON.stringify(P2.rts), v0 = JSON.stringify(P2.rdvs);
        genererConsultRT(P2, Object.assign({}, D.ctx, { nouvelId: idsParDefaut() }));
        if (JSON.stringify(P2.rdvs) !== v0) await enregistrer(x, Object.assign({ rdvsJson: JSON.stringify(P2.rdvs) }, JSON.stringify(P2.rts) !== r0 ? { rtsJson: JSON.stringify(P2.rts) } : {}), "Consultations hebdomadaires de radiothérapie (jour férié compris)").catch((er) => { ok = false; console.warn("consultations de RT", x.id, er); });
      }
      if (ok) await setDoc(doc(db, "espaces", ESPACE, "parametres", "migrations"), { rtcFeries: D.t }, { merge: true }).catch(() => {});
    }
    // Dosimétrie à valider devenue une période (scanner → 1re séance) le 06/10/2026 : résumé recalculé des dossiers concernés,
    // pour que les Google Agenda reçoivent la période (le dossier lui-même ne change pas)
    if (!fait.dosimetriePeriode) {
      for (const x of D.patients) {
        if (!(x.P.rts || []).some((r) => r.scan && !r.dosi && !r.fin)) continue;
        const v = x.doc.version || 1;
        await updateDoc(doc(db, "espaces", ESPACE, "patients", x.id), { resume: JSON.stringify(x.r), version: v + 1, maj: serverTimestamp(), majPar: D.u.uid }).then(() => { x.doc.version = v + 1; }).catch((er) => console.warn("résumé", x.id, er));
      }
      await setDoc(doc(db, "espaces", ESPACE, "parametres", "migrations"), { dosimetriePeriode: D.t }, { merge: true }).catch(() => {});
    }
    // (1.7, 11-12/10/2026 : listes du cabinet d'origine écrites en entier une fois, « listesCompletes » ; COR0 retiré ensuite)
    // 2.2 (12/10/2026) : cures et séances déjà validées figées une fois, telles qu'elles s'affichent (décision de Dr Bentahila)
    if (!fait.curesFigees) {
      let nb = 0, erreurs = 0;
      for (const x of D.patients) { if (!(x.P.lignes || []).length) continue; try { nb += await figerCuresValidees(x); } catch (er) { erreurs++; console.warn("figer", x.id, er); } }
      if (!erreurs) await setDoc(doc(db, "espaces", ESPACE, "parametres", "migrations"), { curesFigees: D.t, curesFigeesNb: nb }, { merge: true }).catch(() => {});
    }
    // Chimiothérapie visible par la secrétaire (07/10/2026) : « Non visible » → « Voir » pour les secrétaires existantes
    if (!fait.secretaireChimio) {
      for (const d of sm.docs) { const m = d.data(); if (m.role === "assistante" && (m.droits || {}).traitements === "aucun") await updateDoc(d.ref, { "droits.traitements": "voir" }).catch((er) => console.warn("droits", d.id, er)); }
      await setDoc(doc(db, "espaces", ESPACE, "parametres", "migrations"), { secretaireChimio: D.t }, { merge: true }).catch(() => {});
    }
    // Planning de l'hôpital de jour pour la secrétaire (08/10/2026 : elle reporte une séance de chimio manquée, selon les consignes
    // du médecin) : « Non » → « Oui » pour les secrétaires existantes, une fois
    if (!fait.secretairePlanning) {
      for (const d of sm.docs) { const m = d.data(); if (m.role === "assistante" && (m.droits || {}).planningChimio !== true) await updateDoc(d.ref, { "droits.planningChimio": true }).catch((er) => console.warn("droits", d.id, er)); }
      await setDoc(doc(db, "espaces", ESPACE, "parametres", "migrations"), { secretairePlanning: D.t }, { merge: true }).catch(() => {});
    }
    // Ordonnances types : la version Excel corrigée par le médecin (07/10/2026) remplace une fois la liste du cabinet
    if (!fait.ordostypesExcel1) {
      await ajouterOrdosManquants().then(() => setDoc(doc(db, "espaces", ESPACE, "parametres", "migrations"), { ordostypesExcel1: D.t }, { merge: true })).catch((er) => console.warn("ordonnances types", er));
    }
    // R-D3 (20/10/2026, audit n° 6, C5) : taux commun de la radiothérapie écrit une fois dans les tarifs = 60 % / 10 %, ce que le bilan
    // prenait jusqu'ici sans le dire pour un lieu sans ligne « Radiothérapie » (bilan inchangé), désormais visible dans Paramètres
    if (!fait.tauxRT && peut("finances") && D.tarifs) {
      const R = doc(db, "espaces", ESPACE, "finances", "tarifs");
      await runTransaction(db, async (t) => { const s = await t.get(R); if (!s.exists()) return null; const T = JSON.parse(s.data().data || "{}"); if (T.tauxRT == null) { T.tauxRT = { retro: 60, impot: 10 }; t.set(R, { data: JSON.stringify(T) }, { merge: true }); } return T.tauxRT; })
        .then((tx) => { if (tx) D.tarifs.tauxRT = tx; return setDoc(doc(db, "espaces", ESPACE, "parametres", "migrations"), { tauxRT: D.t }, { merge: true }); }).catch((er) => console.warn("taux commun de la radiothérapie", er));
    }
    if (!peut("finances") || (fait.encaissementsJours && fait.encaissementsBrutV1b)) return;
    const sf = await getDocs(query(collection(db, "espaces", ESPACE, "patientsFinances"), ...filtreLieux(D.membre))); // R-D3 (C8) : dans la limite des établissements
    for (const d of sf.docs) { const x = D.patients.find((p) => p.id === d.id); if (!x) continue; let M = {}; try { M = JSON.parse(d.data().montantsJson || "{}"); } catch (er) {} await ecrireEncaissements(x, M); }
    await setDoc(doc(db, "espaces", ESPACE, "parametres", "migrations"), { encaissements: D.t, encaissementsJours: D.t, encaissementsBrutV1: D.t, encaissementsBrutV1b: D.t }, { merge: true });
  } catch (er) { console.warn("migrations", er); }
}
// Tarifs des consultations lisibles par toute l'équipe (la secrétaire fait payer les patients) : le prix brut de chaque activité
// de chaque établissement, avec ses dates d'effet, sans rétrocession, impôt, séance de chimio ni radiothérapie (08/10/2026).
// Publiés par le médecin (droits « finances » et « paramètres ») à l'ouverture et après l'enregistrement des Paramètres.
function tarifsPublics(T) {
  if (!T || !T.etablissements) return null;
  const out = { repli: T.repli || (ESPACE === "cabinet-bentahila" ? "HGC" : ""), etablissements: {} }; // repli « HGC » : cabinet d'origine seulement (1.7)
  Object.entries(T.etablissements).forEach(([code, e]) => { out.etablissements[code] = { activites: (e.activites || []).filter((a) => ["seance", "rt"].indexOf(a.type) < 0).map((a) => ({ type: a.type, libelle: a.libelle, historique: (a.historique || []).map((h) => ({ depuis: h.depuis, brut: h.brut })) })) }; });
  return out;
}
async function publierTarifsC() {
  if (!peut("finances") || !peut("parametres") || !D.tarifs) return;
  const t = tarifsPublics(D.tarifs); if (JSON.stringify(t) === JSON.stringify(D.tarifsC)) return;
  await setDoc(doc(db, "espaces", ESPACE, "parametres", "tarifsConsultations"), { data: JSON.stringify(t) }).then(() => { D.tarifsC = t; }).catch((e) => console.warn("tarifs des consultations", e));
}
const tarifsVus = () => D.tarifs || D.tarifsC;
// Fonctions serveur (prix fixé par la secrétaire : prixConsultation)
// ───── Numéro de dossier (étape 8, 09/10/2026) : AAAAMM + rang d'inscription, attribué par le serveur (numeroDossier) ─────
const numDossier = (x) => (x && x.doc && x.doc.identite && x.doc.identite.numero) || "";
const hopsVus = () => (D.etabs || []).filter((e) => D.membre.tousEtablissements || (D.membre.etablissements || []).indexOf(e.code) >= 0);
async function attribuerNumero(x) {
  try {
    const o = await appelServeur("numeroDossier", { espace: ESPACE, patientId: x.id });
    const s2 = await getDoc(doc(db, "espaces", ESPACE, "patients", x.id)); if (s2.exists()) recalculer(x, s2.data());
    if (D.page === "dossier/" + encodeURIComponent(x.id)) pageDossier(x.id);
    return o && o.numero;
  } catch (e) { console.warn("numéro de dossier", e); toast("Le numéro de dossier sera attribué un peu plus tard."); return ""; }
}
async function appelServeur(nom, donnees) {
  const { getFunctions, httpsCallable } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-functions.js");
  try { return (await httpsCallable(getFunctions(app, "europe-west1"), nom, { timeout: 60000 })(donnees || {})).data; }
  catch (e) { throw new Error(String((e && e.message) || e).replace(/^(FirebaseError: )?/, "")); }
}
// Recalcule un dossier à partir de son document (dossier médical seul, sans montants)
function recalculer(x, docData, ctx) {
  // 12/10/2026 : fiche médicale réparée si des champs avaient été rangés par erreur dans clinique._autres (création d'une ligne de chimio)
  if (docData && docData.clinique && docData.clinique._autres && REMIS.some((k) => k in docData.clinique._autres)) { docData = Object.assign({}, docData, { clinique: cliniqueRemise(docData.clinique) }); x.repare = true; }
  // R-C2 (19/10/2026, audit 4 C5) : un dossier mal formé n'empêche plus Onco360 de s'ouvrir : il est affiché sans ses traitements (console)
  x.doc = docData; try { x.P = fusionner(x.id, docData, null); x.illisible = false; } catch (e) { console.warn("dossier " + x.id + " illisible (données mal formées) : affiché sans ses traitements", e); x.P = Object.assign({ id: x.id }, docData.identite || {}, { hop: docData.etablissementId || "", lignes: [], rdvs: [], rts: [] }); x.illisible = true; }
  // R-A5 : poids affiché partout = poids actuel (le plus récent entre la fiche et les séances) ; celui de la fiche gardé dans poidsFiche
  try { const pa = poidsActuel(x.P, ctx || D.ctx); x.P.poidsFiche = x.P.poids; x.P.poidsAct = pa; if (pa) { x.P.poids = pa.v.replace(",", "."); x.P.poidsLe = pa.d; } } catch (e) { x.P.poidsAct = null; }
  try { x.r = resume(JSON.parse(JSON.stringify(x.P)), ctx || D.ctx); } catch (e) { x.r = { nm: x.P.nom, act: [], rdvs: [], rt: [], rtE: [], rtS: [], ag: [] }; }
}
const fnOn = (k) => !D || !D.reg || D.reg.fonctions[k] !== false; // fonction du réglage du cabinet (10/10/2026)
const peut = (k) => !!(D.membre.droits && D.membre.droits[k] === true);
const voit = (k) => ["voir", "modifier"].indexOf(D.membre.droits && D.membre.droits[k]) >= 0;
// Historique des RDV visible (consultations et hospitalisations ; l'infirmière ne voit que la chimio, et la radiothérapie des patients sous chimio)
const voitRdv = () => D.membre.droits.consultations !== false;
const radiochimio = (x) => !!(x.r && x.r.t && x.r.t.st === "cours") && (x.r.rtS || []).some((s) => s.st !== "fin");
// Radiothérapie dans les listes (tableau de bord, agenda) ; niveau « chimio » : seulement les patients sous chimio en même temps
const voitRT = (x) => module("rt") && (D.membre.droits.radiotherapie !== "chimio" || radiochimio(x));
const voitRTdossier = (x) => module("rt") && (voit("radiotherapie") || (D.membre.droits.radiotherapie === "chimio" && radiochimio(x)) || peut("documents"));
// Un événement du résumé (clé « PID|r|… », « PID|rt|… »…) est-il visible pour la personne connectée ?
const evtVisible = (x, k) => { const p = String(k || "").split("|"); return p[1] === "r" ? voitRdv() : p[1] === "rt" ? voitRT(x) : true; };
const traitMod = () => !!(D.membre.droits && D.membre.droits.traitements === "modifier");
const traitModRT = () => !!(D.membre.droits && D.membre.droits.radiotherapie === "modifier");
// « Dr NOM Prénom » (fiche chimio, modèles Word) à partir d'un profil
const nomDrNP = (p, nomMembre) => [p.titre || "Dr", String(p.nom || nomMembre || "").replace(/^(Dr|Pr)\.?\s*/i, "").toUpperCase(), p.prenom].filter(Boolean).join(" ");
// Médecin de la fiche chimio : la personne connectée si elle est médecin, sinon le médecin titulaire (parametres/medecinTitulaire)
const medecinFiche = () => D.membre.role === "medecin" ? { nom: nomDrNP(D.profil, D.membre.nom), inpe: D.profil.inpe || "", specialite: D.profil.specialite || "", genre: D.profil.genre || "" } : { nom: (D.medTitulaire && D.medTitulaire.nom) || D.nomTitulaire || "", inpe: (D.medTitulaire && D.medTitulaire.inpe) || "", specialite: (D.medTitulaire && D.medTitulaire.specialite) || "", genre: (D.medTitulaire && D.medTitulaire.genre) || "" };
// Signature des messages WhatsApp : « Dr NOM » du médecin connecté, sinon du médecin titulaire
const signatureWA = () => { if (D.membre.role === "medecin") return (D.profil.titre || "Dr") + " " + String(D.profil.nom || D.membre.nom || "").replace(/^(Dr|Pr)\.?\s*/i, "").toUpperCase(); const t = D.medTitulaire || {}; return t.signature || String(t.nom || D.nomTitulaire || "").split(/\s+/).slice(0, 2).join(" "); };
const nomMedecin = () => ["Dr", D.profil.prenom, (D.profil.nom || D.membre.nom || "").replace(/^Dr\.?\s*/i, "").toUpperCase()].filter(Boolean).join(" ");

// Enregistrement d'un dossier : version suivante (protection contre les écrasements), résumé recalculé, historique
async function enregistrer(x, changes, quoi) {
  const v = x.doc.version || 1, nouveau = Object.assign({}, x.doc, changes), tmp = { id: x.id };
  recalculer(tmp, nouveau);
  const ref = doc(db, "espaces", ESPACE, "patients", x.id);
  try { await updateDoc(ref, Object.assign({}, changes, { resume: JSON.stringify(tmp.r), version: v + 1, maj: serverTimestamp(), majPar: D.u.uid })); }
  catch (e) {
    if (e && e.code === "permission-denied") {
      const s = await getDoc(ref).catch(() => null);
      if (s && s.exists() && (s.data().version || 1) !== v) { recalculer(x, s.data()); throw new Error("Ce dossier vient d'être modifié par quelqu'un d'autre. Il a été rechargé : refaites votre modification."); }
      throw new Error("Vous n'avez pas le droit de faire cette modification.");
    }
    throw new Error("Enregistrement impossible : " + ((e && e.message) || e));
  }
  nouveau.version = v + 1; recalculer(x, nouveau); journal(x, quoi); planifierReleve(120000);
}
// Relevé financier du comptable (étape 9 S2) : préparé par un médecin qui a le droit « finances », peu après l'ouverture
// d'Onco360 et 2 min après le dernier enregistrement d'un dossier ou de ses montants (une seule fois pour plusieurs enregistrements)
// 20/10/2026 : celui de l'ouverture (délai court) a son propre minuteur : un dossier réparé au démarrage (migrations) ne le repousse plus de 2 min
let RELEVE_T = null, RELEVE_O = null;
function planifierReleve(delai) {
  if (!D || !peut("finances") || estComptable()) return;
  const f = () => publierReleve().catch((e) => console.warn("relevé du comptable", e));
  if (delai < 10000) { if (!RELEVE_O) RELEVE_O = setTimeout(f, delai); return; }
  clearTimeout(RELEVE_T); RELEVE_T = setTimeout(f, delai);
}
function journal(x, quoi) { addDoc(collection(db, "espaces", ESPACE, "historique"), { parUid: D.u.uid, parNom: nomCompte(), le: serverTimestamp(), patientId: x.id, patient: (x.r && x.r.nm) || "", quoi }).catch(() => {}); }

// Fenêtre (formulaires)
// Lot E, étapes 2 à 4 (26/10/2026) : toutes les fenêtres ont la croix ✕ en haut à droite (fermer = comme Annuler / Fermer)
const CROIX = '<button type="button" class="b3 fen-x" onclick="fermerFenetre()" aria-label="Fermer" title="Fermer">✕</button>';
function fenetre(html, taille) { $("fenetreCorps").innerHTML = html; if (!$("fenetreCorps").querySelector(".fen-x")) $("fenetreCorps").insertAdjacentHTML("afterbegin", CROIX); $("fenetreCorps").classList.toggle("large", taille === "large"); $("fenetre").classList.remove("cache"); const f = $("fenetreCorps").querySelector("input,select,textarea"); if (f) setTimeout(() => f.focus(), 50); }
// R-G e : la petite fenêtre se ferme d'abord ; sans petite fenêtre, c'est le panneau de chimio / RT qui se ferme
// 25/10/2026 : apresFenetre(f) = f appelée une fois, à la prochaine fermeture de la petite fenêtre (ex. « Ligne créée » qui revient après chaque action)
let APRES_FEN = null;
window.fermerFenetre = () => { if (!$("fenetre").classList.contains("cache")) { $("fenetre").classList.add("cache"); $("fenetreCorps").innerHTML = ""; const f = APRES_FEN; APRES_FEN = null; if (f) setTimeout(f, 0); return; } fermerPanneau(); };
const val = (i) => { const e = $(i); return e ? String(e.value || "").trim() : ""; };
const occupe = (b, oui) => { if (!b) return; b.disabled = oui; b.dataset.t = b.dataset.t || b.textContent; b.textContent = oui ? "Enregistrement…" : b.dataset.t; };
const erreur = (t) => { const e = $("fErr"); if (e) e.textContent = t; };
const absenceLe = (d) => (D.cal.abs || []).find((a) => d >= a.du && d <= a.au);
// Montants : séparateur des milliers à l'affichage (60 000) et pendant la saisie (champ class="mt")
const fmtMil = (n) => (n == null || n === "" || isNaN(n) ? "" : Number(n).toLocaleString("fr-FR", { maximumFractionDigits: 2 }).replace(/[\u202f\u00a0]/g, " "));
function fmtSaisie(el) {
  const v = el.value, pos = el.selectionStart == null ? v.length : el.selectionStart, avant = v.slice(0, pos).replace(/[^\d.,]/g, "").length;
  const c = v.replace(/[^\d.,]/g, ""), m = c.match(/^(\d*)([.,]?)(\d*)/), ent = (m[1] || "").replace(/^0+(?=\d)/, ""), sep = m[2], dec = (m[3] || "").replace(/[.,]/g, "").slice(0, 2);
  const nv = ent.replace(/\B(?=(\d{3})+(?!\d))/g, " ") + (sep ? "," + dec : "");
  if (nv === v) return; el.value = nv; let k = 0, p = 0; while (p < nv.length && k < avant) { if (/[\d,]/.test(nv[p])) k++; p++; } try { el.setSelectionRange(p, p); } catch (e) {}
}
document.addEventListener("input", (ev) => { if (ev.target && ev.target.classList && ev.target.classList.contains("mt")) fmtSaisie(ev.target); });
const ferieLe = (d) => (D.ctx.feries || []).map((f) => (typeof f === "string" ? { d: f, nom: "Jour férié" } : f)).find((f) => f.d === d);
const PN = { sale: false, apres: [] }; // panneau de chimio / RT (R-G e) : changements non enregistrés, fonctions appelées à sa fermeture
const API = { D: () => D, get ESPACE() { return ESPACE; }, apresFenetre: (f) => { APRES_FEN = f || null; }, ecouteDossiers: () => !!ECOUTE_D, $, esc, ic, dfr, dfrA, cap, jourLong, val, occupe, erreur, toast, fenetre, fermerFenetre: () => window.fermerFenetre(), panneau: (h) => panneau(h), fermerPanneau: (f) => fermerPanneau(f), panneauOuvert: () => panneauOuvert(), petiteSurPanneau: () => panneauOuvert() && petiteOuverte(), surFermerPanneau: (f) => PN.apres.push(f), fermerPetite: () => fermerPetite(), corpsLarge: () => (grilleDossier() && $("panneauCorps") ? $("panneauCorps") : $("fenetreCorps")), peut, voit, traitMod, enregistrer, pageDossier: (id) => reafficher(id), recalculer, journal };
API.typesRdv = (e) => typesRdv(e); API.typesC = () => D.typesC || []; API.actsDe = () => actsDe(D.tarifs, D.activites); // Paramètres › Horaires : durée par type de consultation (AG2)
// Heure facultative du scanner de centrage (AG5, 11/10/2026) : r.scanH = { h, du } ou retirée (droit « radiothérapie : modifier »)
// 26/10/2026 (demande de Dr Bentahila) : états vides harmonisés = petite illustration au trait aux couleurs d'Onco360, titre, texte court, bouton
const ILL_VIDE = {
  taches: '<svg class="ev-ill" viewBox="0 0 260 170" aria-hidden="true"><circle cx="130" cy="88" r="78" fill="#EAF0FA"/><rect x="40" y="28" width="180" height="118" rx="8" fill="#fff" stroke="#C9D5EA"/>' +
    '<path d="M48 28h164a8 8 0 0 1 8 8v6H40v-6a8 8 0 0 1 8-8z" fill="#F1F5FB"/><circle cx="50" cy="35" r="2" fill="#C9D5EA"/><circle cx="57" cy="35" r="2" fill="#C9D5EA"/><circle cx="64" cy="35" r="2" fill="#C9D5EA"/>' +
    '<path d="M40 42h26v104H48a8 8 0 0 1-8-8z" fill="#3563B0"/><circle cx="53" cy="56" r="3" fill="#fff" opacity=".85"/><circle cx="53" cy="70" r="3" fill="#fff" opacity=".85"/><circle cx="53" cy="84" r="3" fill="#fff" opacity=".85"/><circle cx="53" cy="98" r="3" fill="#fff" opacity=".85"/>' +
    [0, 1, 2, 3, 4].map((i) => '<rect x="74" y="' + (52 + i * 17) + '" width="136" height="12" rx="3" fill="#F1F5FB"/><rect x="78" y="' + (55 + i * 17) + '" width="6" height="6" rx="1.5" fill="#fff" stroke="#C9D5EA"/>' +
      (i < 3 ? '<path d="M78.5 ' + (58 + i * 17) + 'l2 2 4-4.5" fill="none" stroke="#2FA37A" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>' : "") +
      '<rect x="90" y="' + (57 + i * 17) + '" width="' + [62, 46, 54, 40, 50][i] + '" height="3" rx="1.5" fill="#9AAAC4"/><rect x="170" y="' + (57 + i * 17) + '" width="30" height="3" rx="1.5" fill="#D5DDEB"/>').join("") +
    '<path d="M150 112l14 14 32-38" fill="none" stroke="#fff" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><path d="M150 112l14 14 32-38" fill="none" stroke="#2FA37A" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  salle: '<svg class="ev-ill" viewBox="0 0 260 170" aria-hidden="true"><circle cx="130" cy="88" r="78" fill="#EAF0FA"/><circle cx="130" cy="54" r="22" fill="#fff" stroke="#3563B0" stroke-width="3"/>' +
    '<path d="M130 41v13l9 6" fill="none" stroke="#3563B0" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M50 146h160" stroke="#C9D5EA" stroke-width="2" stroke-linecap="round"/>' +
    [62, 112, 162].map((x, i) => '<rect x="' + x + '" y="92" width="36" height="28" rx="6" fill="#fff" stroke="#9AAAC4" stroke-width="2"/><rect x="' + (x - 3) + '" y="118" width="42" height="9" rx="4" fill="' + (i === 1 ? "#3563B0" : "#fff") + '" stroke="' + (i === 1 ? "#3563B0" : "#9AAAC4") + '" stroke-width="2"/>' +
      '<path d="M' + (x + 3) + ' 127v18M' + (x + 33) + ' 127v18" stroke="#9AAAC4" stroke-width="2" stroke-linecap="round"/>').join("") + "</svg>",
};
// 26/10/2026 (2e série) : tâches toutes terminées (fête), jour sans patient (calendrier), tous passés (calendrier coché), personne vu (dossier),
// RCP (table de réunion)
const CAL_VIDE = (coche) => '<svg class="ev-ill" viewBox="0 0 260 170" aria-hidden="true"><circle cx="130" cy="88" r="78" fill="#EAF0FA"/><rect x="76" y="40" width="108" height="100" rx="10" fill="#fff" stroke="#C9D5EA" stroke-width="2"/>' +
  '<path d="M86 40h88a10 10 0 0 1 10 10v12H76V50a10 10 0 0 1 10-10z" fill="#3563B0"/><path d="M100 32v16M160 32v16" stroke="#3563B0" stroke-width="5" stroke-linecap="round"/>' +
  [0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => '<rect x="' + (88 + c * 22) + '" y="' + (72 + r * 20) + '" width="14" height="12" rx="3" fill="' + (r === 1 && c === 2 && !coche ? "#C9D5EA" : "#F1F5FB") + '"/>').join("")).join("") +
  (coche ? '<circle cx="176" cy="126" r="20" fill="#fff"/><circle cx="176" cy="126" r="16" fill="#2FA37A"/><path d="M168 126l6 6 10-11" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>' : "") + "</svg>";
Object.assign(ILL_VIDE, {
  fete: '<svg class="ev-ill" viewBox="0 0 260 170" aria-hidden="true"><circle cx="130" cy="88" r="78" fill="#EAF0FA"/><rect x="118" y="46" width="78" height="100" rx="6" fill="#E3E9F3" transform="rotate(8 157 96)"/>' +
    '<rect x="112" y="42" width="78" height="100" rx="6" fill="#fff" stroke="#D5DDEB" transform="rotate(8 151 92)"/>' +
    [0, 1, 2, 3].map((i) => '<g transform="rotate(8 151 92)"><rect x="124" y="' + (58 + i * 20) + '" width="9" height="9" rx="2" fill="#E3E9F3"/><path d="M125 ' + (62 + i * 20) + 'l3 3 6-7" fill="none" stroke="#2FA37A" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><rect x="139" y="' + (59 + i * 20) + '" width="' + [36, 30, 34, 26][i] + '" height="3" rx="1.5" fill="#9AAAC4"/><rect x="139" y="' + (65 + i * 20) + '" width="' + [24, 32, 20, 28][i] + '" height="2.5" rx="1.2" fill="#C9D5EA"/></g>').join("") +
    '<path d="M74 92l36-30 12 28z" fill="#3563B0"/><path d="M84 84l26-22M92 90l22-18" stroke="#7FA1DA" stroke-width="3" stroke-linecap="round"/>' +
    '<path d="M100 54c-6-8 4-12-2-20" fill="none" stroke="#2FA37A" stroke-width="3" stroke-linecap="round"/><path d="M118 52c4-8 12-6 10-16" fill="none" stroke="#3563B0" stroke-width="3" stroke-linecap="round"/><path d="M84 66c-10-2-14-8-22-6" fill="none" stroke="#F2B8C6" stroke-width="3" stroke-linecap="round"/>' +
    '<rect x="70" y="50" width="5" height="5" fill="#3563B0" transform="rotate(20 72 52)"/><rect x="108" y="38" width="5" height="5" fill="#2FA37A" transform="rotate(45 110 40)"/><rect x="62" y="80" width="5" height="5" fill="#2FA37A"/><rect x="132" y="40" width="4" height="4" fill="#F2B8C6"/><rect x="92" y="44" width="4" height="4" fill="#F2B8C6"/></svg>',
  agenda: CAL_VIDE(false),
  agendaOk: CAL_VIDE(true),
  dossier: '<svg class="ev-ill" viewBox="0 0 260 170" aria-hidden="true"><circle cx="130" cy="88" r="78" fill="#EAF0FA"/><rect x="92" y="36" width="76" height="104" rx="8" fill="#fff" stroke="#C9D5EA" stroke-width="2"/><rect x="112" y="28" width="36" height="16" rx="5" fill="#3563B0"/>' +
    [0, 1, 2, 3].map((i) => '<rect x="106" y="' + (62 + i * 16) + '" width="' + [48, 40, 44, 30][i] + '" height="4" rx="2" fill="' + (i ? "#D5DDEB" : "#9AAAC4") + '"/>').join("") +
    '<path d="M168 96c14 0 18 10 18 20s-8 16-18 16" fill="none" stroke="#3563B0" stroke-width="4" stroke-linecap="round"/><circle cx="168" cy="132" r="6" fill="#fff" stroke="#3563B0" stroke-width="4"/></svg>',
  patients: '<svg class="ev-ill" viewBox="0 0 260 170" aria-hidden="true"><circle cx="130" cy="88" r="78" fill="#EAF0FA"/><path d="M74 58a8 8 0 0 1 8-8h30l10 10h56a8 8 0 0 1 8 8v66a8 8 0 0 1-8 8H82a8 8 0 0 1-8-8z" fill="#C9D5EA"/>' +
    '<rect x="74" y="66" width="112" height="76" rx="8" fill="#fff" stroke="#C9D5EA" stroke-width="2"/><circle cx="110" cy="96" r="12" fill="#3563B0"/><path d="M92 128c0-11 8-17 18-17s18 6 18 17" fill="#3563B0"/>' +
    '<rect x="138" y="88" width="34" height="4" rx="2" fill="#9AAAC4"/><rect x="138" y="98" width="26" height="4" rx="2" fill="#D5DDEB"/><rect x="138" y="108" width="30" height="4" rx="2" fill="#D5DDEB"/>' +
    '<circle cx="182" cy="134" r="16" fill="#fff"/><circle cx="182" cy="134" r="13" fill="#2FA37A"/><path d="M182 127v14M175 134h14" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>',
  rcp: '<svg class="ev-ill" viewBox="0 0 260 170" aria-hidden="true"><circle cx="130" cy="88" r="78" fill="#EAF0FA"/><ellipse cx="130" cy="112" rx="62" ry="20" fill="#fff" stroke="#C9D5EA" stroke-width="2"/>' +
    [[84, 78], [130, 66], [176, 78]].map(([x, y], i) => '<circle cx="' + x + '" cy="' + y + '" r="11" fill="' + (i === 1 ? "#3563B0" : "#9AAAC4") + '"/><path d="M' + (x - 17) + " " + (y + 30) + "c0-12 8-18 17-18s17 6 17 18" + '" fill="' + (i === 1 ? "#3563B0" : "#9AAAC4") + '"/>').join("") +
    '<rect x="112" y="102" width="36" height="22" rx="3" fill="#F1F5FB" stroke="#C9D5EA"/><rect x="118" y="108" width="24" height="2.5" rx="1.2" fill="#9AAAC4"/><rect x="118" y="114" width="18" height="2.5" rx="1.2" fill="#C9D5EA"/></svg>',
});
const etatVide = (o) => '<div class="ev-vide' + (o.petit ? " petit" : "") + '"' + (o.k ? ' data-k="' + o.k + '"' : "") + ">" + (ILL_VIDE[o.ill] || "") + "<h4>" + esc(o.titre) + "</h4>" + (o.txt ? "<p>" + o.txt.split("\n").map(esc).join("<br>") + "</p>" : "") + (o.bouton || "") + "</div>";
API.etatVide = (o) => etatVide(o);
// Variante d'une ligne (tableau de bord : catégorie ou carte sans rien) : pastille ronde avec l'icône, puis la phrase
const videMini = (icone, txt) => '<div class="ev-mini"><span class="ev-rond">' + ic(icone) + "</span><span>" + esc(txt) + "</span></div>";
// 26/10/2026 (demande de Dr Bentahila) : pagination des listes en cartes (Protocoles, Radiothérapie) : ‹ 1 2 … 9 › ; fn = fonction globale (n° de page)
const pagination = (nb, page, par, fn) => {
  const n = Math.ceil(nb / par); if (n <= 1) return "";
  const b = (p, lib, o) => '<button type="button"' + (o && o.on ? ' class="on" aria-current="page"' : "") + (o && o.off ? " disabled" : "") + (o && o.t ? ' title="' + o.t + '" aria-label="' + o.t + '"' : "") + ' onclick="' + fn + "(" + p + ')">' + lib + "</button>";
  const vus = [...new Set([0, n - 1, page - 1, page, page + 1].filter((p) => p >= 0 && p < n))].sort((x, y) => x - y);
  let h = b(page - 1, "‹", { off: page === 0, t: "Page précédente" }), av = -1;
  vus.forEach((p) => { if (p - av > 1) h += '<span class="pg-trou">…</span>'; h += b(p, p + 1, { on: p === page }); av = p; });
  return '<nav class="pages" aria-label="Pages">' + h + b(page + 1, "›", { off: page >= n - 1, t: "Page suivante" }) + b(n - 1, "»", { off: page >= n - 1, t: "Dernière page" }) + "</nav>";
};
API.pagination = (nb, page, par, fn) => pagination(nb, page, par, fn);
API.traitModRT = () => traitModRT(); API.estMed = () => estMed(D.membre.role); API.menuPts = (m) => menuPts(m); API.estRemplacant = () => D.membre.role === "remplacant";
// Lot C : le remplaçant agit au nom du médecin titulaire (consultations, ordonnances, tâches, salle, RCP, documents) ; le journal d'audit garde la vraie personne (serveur)
API.nomAgissant = () => (D.membre.role === "remplacant" ? medecinFiche().nom || nomCompte() : nomCompte());
API.heureRT = async (pid, rid, hr, z) => { // z : "scan" (défaut) ou "deb" (1re séance, 12/10/2026)
  const x = D.patients.find((p) => p.id === pid); if (!x || !traitModRT()) throw new Error("Vous n'avez pas le droit de modifier la radiothérapie.");
  const l = JSON.parse(x.doc.rtsJson || "[]"), r = l.find((v) => v.id === rid); if (!r) throw new Error("Radiothérapie introuvable.");
  const k = z === "deb" ? "debH" : "scanH"; if (hr) r[k] = hr; else delete r[k];
  await enregistrer(x, { rtsJson: JSON.stringify(l) }, (z === "deb" ? "1re séance de radiothérapie" : "Scanner de centrage") + " : " + (hr ? "heure " + hr.h + " (" + hr.du + " min)" : "heure retirée"));
};
API.multiMed = () => multiMed(); API.medecins = () => D.medecins || []; API.medRdv = (r) => medRdv(r); API.nomMed = (u) => nomMed(u); API.medDefaut = () => medDefaut(); API.medPourPatient = (x) => medPourPatient(x); // AG4, R-C3
API.listeMut = () => listeMut(); API.listeCor = () => listeCor(); // fiche réglable (3.11)
API.absenceLe = (d) => absenceLe(d); API.encaisseIci = () => encaisseIci(); API.payeCabinet = (x) => payeCabinet(x); API.htmlMode = (c) => htmlMode(c); API.libMode = (k) => libMode(k); API.imprimerRecu = (w, x, o) => imprimerRecu(w, x, o); API.sansAcc = sansAcc; API.question = (h, b, av) => question(h, b, av); API.garde = (f) => { GARDE = f || null; }; API.fn = (k) => fnOn(k); API.voitRefRT = () => voitRefRT(); API.modifRefRT = () => modifRefRT(); API.module = (k) => module(k); API.planifierReleve = (d) => planifierReleve(d || 120000); API.attribuerNumero = (x) => attribuerNumero(x); API.numDossier = (x) => numDossier(x); API.medecinFiche = () => medecinFiche(); API.nomCompte = () => API.nomAgissant(); API.publierCarte = () => publierCarte(); API.signataires = () => D.signataires || {}; API.medecins = () => D.medecins || []; API.medDefaut = () => medDefaut(); API.etabDe = (code) => (D.etabsTous || D.etabs || []).find((e) => e.code === code) || null; API.entete = () => entete(); API.voitRdv = () => voitRdv(); API.voitRT = (x) => voitRT(x); API.fmtMil = (n) => fmtMil(n); API.ferieLe = (d) => ferieLe(d); API.salleVenuChimio = (x, lid, n, j, oui) => apresVenuChimio(x, lid, n, j, oui); API.serveur = appelServeur; API.prixPrevu = (p, c, j) => prixPrevu(p, c, j); API.badgeSalle = (p, c) => badgeSalle(p, c); API.tarifsVus = () => tarifsVus(); API.publierTarifsC = () => publierTarifsC(); API.encaissementsDe = (x, f) => encaissementsDe(x, f); API.peutPrix = () => peut("finances") || prixParServeur();
installerChimio(API); installerAudit(API); aboP.installer(API); ficheP.installer(API); infosMed.installer(API); installerAgenda(API); installerConfig(API); installerProfil(API); installerProtocoles(API); installerParametres(API); installerBilan(API); installerConsultations(API); installerOrdonnances(API); installerDocuments(API); installerFichiers(API); API.tacheSysteme = tacheSysteme; installerTaches(API); installerReglages(API); installerSalle(API); installerRcp(API); installerVigilances(API); installerRadiotherapie(API);

// Nom de la personne connectée, pris de son compte (profil, fiche de membre ; R-E7 : pas du texte affiché à l'écran)
function nomCompte() {
  const p = D.profil || {}, mb = D.membre || {}, nom = (p.nom || mb.nom || "").replace(/^Dr\.?\s*/i, ""), titre = p.titre || (estMed(mb.role) ? "Dr" : "");
  return [titre, p.prenom, cap(nom.toLowerCase())].filter(Boolean).join(" ") || (D.u && D.u.email) || "";
}
function entete() {
  const p = D.profil, mb = D.membre, nom = (p.nom || mb.nom || "").replace(/^Dr\.?\s*/i, "");
  D.titre = p.titre || (estMed(mb.role) ? "Dr" : ""); D.nomAff = cap(nom.toLowerCase());
  $("nomMenu").textContent = nomCompte();
  $("specMenu").textContent = p.specialite || { medecin: "Médecin", infirmiere: "Infirmière", assistante: "Assistante" }[mb.role] || "";
  if (D.espaceDoc && D.espaceDoc.demo) $("specMenu").textContent = "Cabinet de démonstration (patients fictifs)"; // étape 9 S3
  const ini = initiales((p.prenom || "") + " " + nom);
  ["avMenu", "avTete"].forEach((i) => { if (srcImage(p.photo)) $(i).innerHTML = '<img src="' + srcImage(p.photo) + '" alt="' + esc(ini) + '">'; else $(i).textContent = ini; }); $("avTete").title = D.u.email;
  document.querySelectorAll("nav a[data-droit]").forEach((a) => { if (!(mb.droits && mb.droits[a.dataset.droit])) a.classList.add("cache"); });
  { const a = document.querySelector('nav a[data-p="radiotherapie"]'); if (a) a.classList.toggle("cache", !voitRefRT()); } // droit à niveaux (RT1)
  // Modules de la formule : body.sans-<module> cache tout ce qui porte data-mod="<module>" (menu, boutons, onglets)
  Object.keys(D.abo.modules).forEach((k) => document.body.classList.toggle("sans-" + k, !D.abo.modules[k]));
  document.body.classList.toggle("role-comptable", mb.role === "comptable"); // menu réduit au bilan et au profil
  // Réglage du cabinet : menu dans l'ordre choisi, éléments retirés cachés (fonctions, bibliothèques)
  const nav = document.querySelector("nav");
  D.reg.menu.forEach((k) => { const a = nav.querySelector('a[data-p="' + k + '"]'); if (a) nav.appendChild(a); });
  { const at = nav.querySelector('a[data-p="tous"]'), ac = nav.querySelector('a[data-p="accueil"]'); if (at && ac) ac.after(at); } // « Mes cabinets aujourd'hui » (19.7)
  let st = document.getElementById("styleReglage"); if (!st) { st = document.createElement("style"); st.id = "styleReglage"; document.head.appendChild(st); }
  st.textContent = styleRetraits(D.reg);
  document.body.classList.toggle("mode-bib", D.bib); // bibliothèque de référence : Protocoles et Paramètres
  if (D.bib) {
    $("specMenu").textContent = (D.espaceDoc.nom || "Bibliothèque de référence") + " : ce que reçoivent les nouveaux cabinets";
    if (!$("lienAdmin")) { const a = document.createElement("a"); a.id = "lienAdmin"; a.href = "admin.html#specialites"; a.innerHTML = ic("retour") + "Retour à l'Administration"; document.querySelector("nav").appendChild(a); }
  }
  const al = alertes();
  $("nbAl").textContent = al.length; $("nbAl").classList.toggle("cache", !al.length);
  $("panneauAlertes").innerHTML = "<h3>Alertes (" + al.length + ")</h3>" + (al.length ? al.map((a) => '<div class="al" onclick="ouvrirDossier(\'' + a.id + '\')"><i class="pt" style="background:' + a.c + '"></i><div>' + a.h + "</div></div>").join("") : '<div class="al">Aucune alerte.</div>');
}

// ───── Calculs ─────
function programmeDuJour() {
  const t = D.t, ouvreAuj = ouvre(t, D.ctx.feries), rt = [], co = [], ch = [];
  D.patients.forEach((pt) => {
    const { id, P, r } = pt, okRT = voitRT(pt), okCo = voitRdv();
    if (okRT) (r.rtE || []).forEach((x) => {
      if (!ouvreAuj || !x.deb || x.deb > t || !x.fin || x.fin < t) return;
      const nb = parseInt(x.nb, 10), k = nb && x.rest ? nb - x.rest + 1 : null;
      // Rang calculé d'après le calendrier (jours ouvrés depuis la 1re séance) : les séances faites ne sont pas enregistrées, d'où « prévue »
      const lib = x.deb === t ? "1re séance" : x.fin === t ? "Dernière séance prévue" : x.rest <= 5 ? "Dernière semaine" : k ? "Séance " + k + " / " + nb + " prévue" : "En cours";
      rt.push({ id, nm: r.nm, lib, de: x.acte, cls: x.deb === t ? "b-ch" : x.rest <= 5 ? "b-or" : "b-rt", o: x.deb === t ? 0 : x.rest <= 5 ? 1 : 2 });
    });
    if (okRT) (r.rt || []).forEach((x) => { if (x.d === t && /Scanner/.test(x.lib)) rt.push({ id, nm: r.nm, lib: "Scanner de centrage", de: x.lib.replace(/^RT · /, "").replace(/ · Scanner de centrage$/, ""), cls: "b-co", o: 0 }); });
    // « Dosimétrie à valider » : une tâche pour le médecin (P4, 08/10/2026), plus une ligne du programme du jour
    if (okCo) (P.rdvs || []).forEach((x) => {
      if (x.st === "absent") return; const hs = typeRdv(x.type) === "hospit";
      if (hs ? x.d <= t && (x.f || x.d) >= t : x.d === t) co.push({ id, rid: x.id, nm: r.nm, h: hs ? "Hospit." : x.h || "—", lib: hs ? "Hospitalisation" : cap(libRdv(x).replace("Consultation ", "")), fait: x.st === "fait" });
    });
    (r.act || []).forEach((a) => { if (a.d === t) ch.push({ id, nm: r.nm, lib: "C" + a.k + " J" + (a.sj || 1), de: a.nom.replace(/ · J\d+$/, "") }); });
  });
  rt.sort((a, b) => a.o - b.o || a.nm.localeCompare(b.nm)); co.sort((a, b) => a.h.localeCompare(b.h)); ch.sort((a, b) => a.nm.localeCompare(b.nm));
  return { rt, co, ch };
}
// Titre d'un événement du résumé (« 💉 NOM – C2/6 … ») : émoji de tête retiré (une hospitalisation n'en a pas : le nom reste
// entier), pictogramme au trait à sa place sur le tableau de bord (11/10/2026 : plus d'émojis mêlés aux icônes)
const sansEmoji = (t) => String(t || "").replace(/^[^\p{L}\p{N}]+\s/u, "");
const icEvt = (t) => { const c = String(t || "").codePointAt(0); return ic(c === 0x1F489 ? "seringue" : c === 0x2622 ? "radiation" : c === 0x1FA7A ? "stetho" : "hopital"); };
function agenda7() {
  const t = D.t, fin = addJ(t, 7), l = [];
  D.patients.forEach((pt) => (pt.r.ag || []).forEach((e) => {
    const { id } = pt; if (e.d <= t || e.d > fin || !evtVisible(pt, e.k)) return;
    const titre = sansEmoji(e.t), m = titre.match(/^(.*?) – (.*)$/);
    l.push({ id, d: e.d, h: e.h || "", em: icEvt(e.t), nm: m ? m[1] : titre, de: m ? m[2] : "", cat: catEvt(id, e.k) });
  }));
  return l.sort((a, b) => (a.d + (a.h || "00:00") + a.nm).localeCompare(b.d + (b.h || "00:00") + b.nm));
}
// ───── Rappels WhatsApp : message prédéfini (Configuration › WhatsApp) envoyé en un clic depuis WhatsApp ─────
const catRdv = (r) => cleDeRdv(r); // 3.13 : clé du type (référentiel) ; fin de radiothérapie : son propre message
function catEvt(pid, k) {
  const p = String(k || "").split("|");
  if (p[1] === "c" || p[1] === "s") return "chimio";
  if (p[1] === "rt") return p[p.length - 1] === "fin" || p[p.length - 1] === "dosi" ? null : "rt";
  if (p[1] === "r") { const x = D.patients.find((z) => z.id === pid), r = x && (x.P.rdvs || []).find((v) => (v.id || v.d) === p.slice(2).join("|")); return r ? catRdv(r) : "autre"; }
  return null;
}
function numeroWA(tel) {
  let n = String(tel || "").replace(/[^\d+]/g, ""); if (!n) return "";
  // Numéros marocains : 06… / 07… / 05… (10 chiffres) ou saisis sans le 0 (9 chiffres) → 212… ; +212 / 00212 conservés
  if (n[0] === "+") n = n.slice(1); else if (n.slice(0, 2) === "00") n = n.slice(2); else if (n[0] === "0" && n.length === 10) n = "212" + n.slice(1); else if (/^[5-7]\d{8}$/.test(n)) n = "212" + n;
  return n.length >= 11 ? n : "";
}
const JOURS_L = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"], MOIS_L = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
// R-C3 (19/10/2026) : {lieu} = lieu de l'événement : radiothérapie (scanner, 1re séance) à son lieu, rendez-vous à son lieu s'il en a un ; sinon
// le lieu du patient
function lieuWA(x, cat, d) {
  const P = x.P || {};
  if (cat === "rt") { const r = (P.rts || []).find((v) => v.hop && (v.scan === d || v.deb === d)); if (r) return r.hop; }
  else if (cat !== "chimio") { const r = (P.rdvs || []).find((v) => v.d === d && v.lieu && (cat === "confirm" || catRdv(v) === cat)); if (r) return r.lieu; }
  return x.doc.etablissementId;
}
function messageWA(x, cat, d, h) {
  const P = x.P, code = lieuWA(x, cat, d), e = (D.etabsTous || D.etabs).find((z) => z.code === code) || {}, j = new Date(d + "T12:00:00");
  const m = messageAvecArabe(D.wa && D.wa[cat] != null ? D.wa[cat] : WA0[cat] || WA0.autre, cat); // R-C5 : français puis arabe classique
  return remplir(m, { prenom: P.prenom ? cap(String(P.prenom).toLowerCase()) : x.r.nm, nom: x.r.nm, jour: JOURS_L[j.getDay()] + " " + j.getDate() + " " + MOIS_L[j.getMonth()], heure: h ? "à " + h.replace(":", "h") : "", jour_ar: jourAr(d), heure_ar: heureAr(h), lieu: e.nom || code || "", adresse: e.adresse || "", medecin: signatureWA() });
}
// Rappels envoyés (19.4, 10/10/2026) : { "AAAA-MM-JJ|catégorie": { le, par, nom } } (droit « rendezvous »).
// R-C4 (19/10/2026, audit 4 C7) : rangés dans une petite collection à part, rappels/{patient} = { patientId, etablissementId, l: { … }, majPar,
// maj } (comme la salle d'attente) : un rappel ne réécrit plus le dossier (version + 1, Google Agenda, écoute des autres postes). Écoute en
// direct dans le périmètre (RAP) ; les rappels notés avant dans le dossier (`rappels`) sont encore lus.
const RAP = {}; let ECOUTE_RAP = null;
function ecouterRappels() {
  if (ECOUTE_RAP || D.membre.role === "comptable") return; const m = D.membre;
  const q = m.tousEtablissements ? collection(db, "espaces", ESPACE, "rappels") : query(collection(db, "espaces", ESPACE, "rappels"), where("etablissementId", "in", (m.etablissements || []).length ? m.etablissements : ["—"]));
  let premier = true;
  ECOUTE_RAP = onSnapshot(q, (sn) => { sn.docChanges().forEach((c) => { if (c.type === "removed") delete RAP[c.doc.id]; else RAP[c.doc.id] = (c.doc.data() || {}).l || {}; });
    if (!premier && D.page === "accueil" && !occupeEcran()) rafraichirPage([]); premier = false; }, // bouton vert « déjà envoyé » d'un collègue
  (e) => { console.warn("rappels WhatsApp (écoute)", e); ECOUTE_RAP = null; });
}
const rappelDe = (x, d, cat) => (RAP[x.id] || {})[d + "|" + cat] || ((x.doc && x.doc.rappels) || {})[d + "|" + cat] || null;
const libEnvoi = (s) => { const t = Date.parse(s.le); return "envoyé par " + (s.nom || "") + " le " + dfrA(isNaN(t) ? String(s.le).slice(0, 10) : jourMaroc(t)) + " à " + (isNaN(t) ? "" : hmMaroc(t).replace(":", " h ")); };
const btnWA = (x, cat, d, h) => {
  if (!cat) return ""; const g = ecart(d, D.t), RW = reglages().whatsapp, env = rappelDe(x, d, cat), proche = !env && g >= RW.de && g <= RW.a, ok = !!numeroWA(x.P.tel);
  return '<button data-fn="agenda.whatsapp" class="wa' + (proche ? " proche" : "") + (env ? " envoye" : "") + '"' + (ok ? "" : " disabled") + ' aria-label="Rappel WhatsApp' + (env ? " (déjà envoyé)" : "") + '" title="' + (ok ? (env ? "Rappel " + libEnvoi(env) + " (cliquez pour le renvoyer)" : "Rappel WhatsApp" + (proche ? " (rendez-vous dans " + g * 24 + " h)" : "")) : "Pas de numéro de téléphone dans le dossier") + '" onclick="event.stopPropagation();envoyerWA(\'' + x.id + "','" + cat + "','" + d + "','" + (h || "") + '\')">' + LOGO_WA + "</button>";
};
const LOGO_WA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.2c0-.1-.2-.2-.5-.3Z"/></svg>';
window.envoyerWA = (pid, cat, d, h) => {
  const x = D.patients.find((z) => z.id === pid); if (!x) return; const n = numeroWA(x.P.tel);
  if (!n) { toast("Pas de numéro de téléphone dans le dossier."); return; }
  window.open("https://wa.me/" + n + "?text=" + encodeURIComponent(messageWA(x, cat, d, h)), "_blank");
  journal(x, (cat === "confirm" ? "Confirmation" : "Rappel") + " WhatsApp ouvert (rendez-vous du " + dfrA(d) + ")");
  noterRappel(x, d, cat);
};
// Rappel (ou confirmation) noté envoyé dans le dossier ; les rappels de plus de 7 jours sont retirés au passage
async function noterRappel(x, d, cat) {
  if (!peut("rendezvous")) return;
  const k = d + "|" + cat, v = { le: new Date().toISOString(), par: D.u.uid, nom: API.nomAgissant() }, lim = addJ(D.t, -7), l = { [k]: v };
  Object.keys(RAP[x.id] || {}).forEach((z) => { if (z.slice(0, 10) < lim) l[z] = deleteField(); }); // plus de 7 jours : retirés au passage
  RAP[x.id] = Object.assign({}, RAP[x.id] || {}, { [k]: v }); entete(); route();
  try { await setDoc(doc(db, "espaces", ESPACE, "rappels", x.id), { patientId: x.id, etablissementId: x.doc.etablissementId || "", l, majPar: D.u.uid, maj: serverTimestamp() }, { merge: true }); }
  catch (e) { console.warn("rappel noté", e); toast("Rappel envoyé, mais pas noté (" + (e.code || e.message) + ") : il restera proposé."); delete RAP[x.id][k]; entete(); route(); }
}
// Rappels à envoyer (19.4) : rendez-vous, cures, séances dans la fenêtre du bouton vert (Paramètres › WhatsApp), envoyés ou non
function rappelsAEnvoyer() {
  const t = D.t, RW = reglages().whatsapp, l = [], vus = {};
  D.patients.forEach((pt) => (decede(pt.P) ? [] : pt.r.ag || []).forEach((e) => { // patient décédé : plus de rappel (3.3)
    const g = ecart(e.d, t); if (g < RW.de || g > RW.a || !evtVisible(pt, e.k)) return; const cat = catEvt(pt.id, e.k); if (!cat) return;
    const k = pt.id + "|" + e.d + "|" + cat; if (vus[k]) return; vus[k] = 1;
    const titre = sansEmoji(e.t), m = titre.match(/^(.*?) – (.*)$/);
    l.push({ x: pt, id: pt.id, d: e.d, h: e.h || "", cat, nm: m ? m[1] : titre, de: m ? m[2] : "", env: rappelDe(pt, e.d, cat), tel: !!numeroWA(pt.P.tel) });
  }));
  return l.sort((a, b) => (a.d + (a.h || "00:00") + a.nm).localeCompare(b.d + (b.h || "00:00") + b.nm));
}

// Conflits : rendez-vous pendant une absence (toute la période) ou un jour férié (rendez-vous qui commencent ce jour-là)
function absences() {
  const t = D.t, tri = (l) => l.sort((p, q) => (p.d + (p.h || "99")).localeCompare(q.d + (q.h || "99")));
  const ab = (D.cal.abs || []).filter((a) => a.au >= t).map((a) => {
    const l = [];
    D.patients.forEach((pt) => (pt.r.ag || []).forEach((e) => { const { id } = pt, d0 = e.d, d1 = e.f || e.d; if (d1 < a.du || d0 > a.au || !evtVisible(pt, e.k)) return; l.push({ id, k: e.k, d: d0 < a.du ? a.du : d0, h: e.h || "", t: e.t }); }));
    return { a, l: tri(l) };
  });
  const fe = (D.ctx.feries || []).map((f) => (typeof f === "string" ? { d: f, nom: "Jour férié" } : f)).filter((f) => f.d >= t && !(D.cal.abs || []).some((a) => f.d >= a.du && f.d <= a.au)).map((f) => {
    const l = []; D.patients.forEach((pt) => (pt.r.ag || []).forEach((e) => { const { id } = pt; if (e.d === f.d && evtVisible(pt, e.k)) l.push({ id, k: e.k, d: e.d, h: e.h || "", t: e.t }); }));
    return { a: { du: f.d, au: f.d, m: "Jour férié – " + (f.nom || ""), fe: true }, l: tri(l) };
  }).filter((x) => x.l.length);
  return ab.concat(fe).sort((p, q) => p.a.du.localeCompare(q.a.du));
}
// Alertes de la secrétaire (19.3, 10/10/2026) : ce qu'elle peut faire elle-même (rendez-vous à décaler, rappels WhatsApp à
// envoyer, numéro manquant) au lieu des alertes médicales (cures, dosimétrie…)
function alertesSecretariat() {
  const al = [], R = "var(--rouge)", O = "#E07A2F", V = "var(--vert)", RW = reglages().whatsapp;
  absences().forEach(({ a, l }) => l.forEach((o) => al.push({ o: 0, c: R, h: "<b>" + esc(o.t) + "</b> le " + dfr(o.d) + " : pendant « " + esc(a.m || (a.fe ? "jour férié" : "absence")) + " », à décaler", id: o.id })));
  agenda7().forEach((e) => {
    const x = D.patients.find((z) => z.id === e.id); if (!x || !e.cat) return; const g = ecart(e.d, D.t), quand = (e.de || "rendez-vous") + " le " + dfr(e.d) + (e.h ? " à " + e.h : "");
    if (!numeroWA(x.P.tel)) al.push({ o: 1, c: O, h: "<b>" + esc(e.nm) + "</b> – " + esc(quand) + " : pas de numéro de téléphone dans le dossier", id: e.id });
    else if (g >= RW.de && g <= RW.a && !rappelDe(x, e.d, e.cat)) al.push({ o: 2, c: V, h: "<b>" + esc(e.nm) + "</b> – rappel WhatsApp à envoyer (" + esc(quand) + ")", id: e.id });
  });
  return al.sort((a, b) => a.o - b.o);
}
// R-C1 : liste « Patients à reprogrammer » (moteur/reprogrammer.js), dans le périmètre de la personne (dossiers chargés)
function patientsAReprogrammer() {
  const pats = D.patients.map((x) => ({ id: x.id, nm: x.r.nm, rdvs: voitRdv() ? x.P.rdvs || [] : [], deces: decede(x.P), seance: (lid, n, j) => {
    const L = (x.P.lignes || []).find((z) => z.id === lid); if (!L) return null; let e; try { e = etatLigne(L, x.P, D.ctx)[n - 1]; } catch (er) { return null; } if (!e) return null;
    if (j === 1) return { date: e.date, st: e.st };
    const s = seancesCure(L, e, D.ctx.bib).find((z) => z.j === j); return s ? { date: s.prevue, st: s.st } : null; } }));
  return aReprogrammer(pats, module("salle") ? fichesAbsentes() : [], { t: D.t, jours: 30 });
}
// Consultations des 7 derniers jours ni « Venu » ni « Non venu » (journée pas clôturée dans la salle d'attente, SA6 11/10/2026)
function nonCloturees() {
  const al = [], t = D.t, d7 = addJ(t, -7); if (!voitRdv() || !peut("rendezvous")) return al;
  D.patients.forEach((x) => (x.P.rdvs || []).forEach((v) => { if (v.d >= d7 && v.d < t && (v.st || "prevu") === "prevu" && typeRdv(v.type) !== "hospit") al.push({ o: 1, c: "#E07A2F", h: "<b>" + esc(x.r.nm) + "</b> – consultation du " + dfr(v.d) + (v.h ? " à " + v.h : "") + " ni « Venu » ni « Non venu » (salle d'attente › jour passé)", id: x.id }); }));
  return al;
}
function alertes() {
  if (D.membre.role === "assistante") return alertesSecretariat().concat(nonCloturees());
  const RA = reglages().alertes; // délais réglables (Paramètres › Alertes)
  const t = D.t, al = [], R = "var(--rouge)", O = "#E07A2F", J = "#D6B42A", V = "var(--vert)";
  D.patients.forEach(({ id, r }) => {
    (r.act || []).forEach((a) => {
      if (!a.d) return; const g = ecart(a.d, t);
      if (g < 0) al.push({ o: 0, c: R, h: "<b>" + esc(r.nm) + "</b> – " + esc(a.nom) + " C" + a.k + " prévue le " + dfr(a.d) + ", non validée", id });
      else if (g > 0 && g <= RA.cure) al.push({ o: 1, c: O, h: "<b>" + esc(r.nm) + "</b> – " + esc(a.nom) + " C" + a.k + " dans " + g + " jour" + (g > 1 ? "s" : "") + " (" + dfr(a.d) + ")", id });
      if (a.c && a.k === a.nb) al.push({ o: 2, c: J, h: "<b>" + esc(r.nm) + "</b> – " + esc(a.nom) + " : dernière cure (C" + a.k + "/" + a.nb + ")", id });
    });
    if (r.t && r.t.st === "fin" && r.t.fin && ecart(t, r.t.fin) <= RA.finTrait) al.push({ o: 3, c: V, h: "<b>" + esc(r.nm) + "</b> – " + esc(r.t.nom) + " terminé le " + dfr(r.t.fin), id });
    if (voitRT({ r })) (r.rtE || []).forEach((x) => { if (x.fin && x.fin < t) al.push({ o: 1, c: O, h: "<b>" + esc(r.nm) + "</b> – radiothérapie " + esc(x.acte) + " : fin prévue dépassée, à clôturer", id }); });
    if (voitRT({ r })) (r.rt || []).forEach((x) => { if (x.dosi && x.d <= t) al.push({ o: x.deb && ecart(x.deb, t) <= 2 ? 0 : 1, c: x.deb && ecart(x.deb, t) <= 2 ? R : O, h: "<b>" + esc(r.nm) + "</b> – dosimétrie à valider" + (x.deb ? " (1re séance le " + dfr(x.deb) + ")" : ""), id }); });
  });
  return al.concat(nonCloturees()).sort((a, b) => a.o - b.o);
}
const FILTRES = {
  tous: ["Tous les patients", () => true],
  chc: ["Traitement en cours", (x) => x.r.t && x.r.t.st === "cours"],
  rtc: ["Radiothérapie en cours", (x) => (x.r.rtS || []).some((s) => s.st === "cours")],
  rtp: ["Radiothérapie prévue", (x) => (x.r.rtS || []).some((s) => s.st === "prev")],
  auj: ["Cure aujourd'hui", (x) => (x.r.act || []).some((a) => a.d === D.t)],
  cm: ["Cure reçue ce mois-ci", (x) => (x.r.rec || []).some((d) => d && d.slice(0, 7) === D.t.slice(0, 7))],
  fin: ["Protocole terminé", (x) => x.r.t && x.r.t.st === "fin"],
};

// ───── Pages ─────
// « Configuration » et « Paramètres » fusionnés en une page « Paramètres » (P2, 08/10/2026) : #configuration y renvoie
// Module dont dépend chaque page (formule du cabinet) : page d'un module retiré → tableau de bord
// Comptable : le bilan et son profil seulement
const PAGES_COMPTABLE = ["bilan", "profil"];
// Bibliothèque de référence (10/10/2026) : protocoles et paramètres (bibliothèques, listes, fériés, tarifs RT) seulement ; référentiel de
// radiothérapie (RTR, RT7 du 25/10/2026 : l'administration y modifie le modèle comme un médecin dans son cabinet)
const PAGES_BIB = ["protocoles", "radiotherapie", "parametres", "configuration"];
const estComptable = () => !!(D && D.membre && D.membre.role === "comptable");
const PAGE_MODULE = { agenda: "agenda", salle: "salle", taches: "taches", rcp: "rcp", protocoles: "chimio", radiotherapie: "rt", bilan: "bilan" };
// Référentiel de radiothérapie (RTR, RT1 du 25/10/2026) : fonction rt.referentiel du réglage et droit referentielRT « voir » ou « modifier »
// (médecin : « modifier » par défaut ; secrétaire, infirmière, comptable : « aucun » ; le comptable ne le voit jamais)
const voitRefRT = () => !!(D && D.membre && D.membre.role !== "comptable" && ["voir", "modifier"].indexOf((D.membre.droits || {}).referentielRT) >= 0 && fnOn("rt.referentiel") && module("rt"));
const modifRefRT = () => voitRefRT() && estMed(D.membre.role) && D.membre.droits.referentielRT === "modifier";
const module = (k) => !D || !D.abo || D.abo.modules[k] !== false;
// ───── Dossiers modifiés sur un autre poste, écoutés en direct (R-A4, 18/10/2026, demande du 17/10) ─────
// Dossiers dont `maj` est postérieur à l'ouverture d'Onco360 (5 min de marge pour une horloge fausse), dans le périmètre de la personne (mêmes
// filtres d'établissement que la salle d'attente ; index etablissementId + maj) : une lecture par dossier modifié, jamais une relecture
// complète. Rendez-vous pris, « Venu », séance validée, nouveau patient : visibles partout sans recharger (salle, agenda, tableau de bord,
// dossier ouvert). Pendant une fenêtre ou une saisie, rien n'est appliqué : fait juste après (un enregistrement fait depuis une fenêtre restée
// ouverte sur l'ancienne version est refusé comme avant : « Ce dossier vient d'être modifié par quelqu'un d'autre »). Nos propres écritures
// (en attente) sont ignorées ; un dossier sorti de la liste n'est pas retiré (suppression : rechargement).
let ECOUTE_D = null; const ATTENTE_D = new Map();
const occupeEcran = () => { const a = document.activeElement; return !$("fenetre").classList.contains("cache") || !!(a && (/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) || a.isContentEditable)) || NOTES.txt != null || !!NOTES.encours; };
function ecouterDossiers() {
  if (ECOUTE_D || estComptable() || D.bib) return;
  const m = D.membre, depuis = new Date(Date.now() - 5 * 60000), c = collection(db, "espaces", ESPACE, "patients");
  const q = m.tousEtablissements ? query(c, where("maj", ">", depuis)) : query(c, where("etablissementId", "in", (m.etablissements || []).length ? m.etablissements.slice(0, 30) : ["—"]), where("maj", ">", depuis));
  ECOUTE_D = onSnapshot(q, (s) => {
    s.docChanges().forEach((ch) => { if (ch.type !== "removed" && !(ch.doc.metadata || {}).hasPendingWrites) ATTENTE_D.set(ch.doc.id, ch.doc.data()); });
    appliquerDossiers();
  }, (e) => { console.warn("dossiers (écoute en direct)", e); ECOUTE_D = null; });
  setInterval(appliquerDossiers, 2000);
}
function appliquerDossiers() {
  if (!ATTENTE_D.size || occupeEcran()) return;
  const ids = [];
  ATTENTE_D.forEach((d, id) => {
    const x = D.patients.find((p) => p.id === id);
    if (x && (d.version || 1) <= ((x.doc && x.doc.version) || 1)) return; // déjà à jour (notre écriture, ou relue par la salle)
    if (x) recalculer(x, d); else { const y = { id }; recalculer(y, d); D.patients.push(y); }
    ids.push(id);
  });
  ATTENTE_D.clear(); if (!ids.length) return;
  D.patients.sort((a, b) => String(a.r.nm).localeCompare(String(b.r.nm)));
  dossiersChanges(ids); rafraichirPage(ids);
}
// R-C8 (19/10/2026) : « Actualiser » de l'agenda : dossiers modifiés depuis l'ouverture d'Onco360 (ou la dernière relecture), même requête que
// l'écoute en direct (une lecture par dossier modifié) ; utile si l'écoute s'est arrêtée (réseau coupé, veille)
const OUVERT = Date.now();
API.relireModifies = async (depuisMs) => {
  if (estComptable() || D.bib) return 0;
  const m = D.membre, depuis = new Date((depuisMs || OUVERT) - 5 * 60000), c = collection(db, "espaces", ESPACE, "patients");
  const q = m.tousEtablissements ? query(c, where("maj", ">", depuis)) : query(c, where("etablissementId", "in", (m.etablissements || []).length ? m.etablissements.slice(0, 30) : ["—"]), where("maj", ">", depuis));
  const s = await getDocs(q); s.docs.forEach((d) => ATTENTE_D.set(d.id, d.data()));
  const n = ATTENTE_D.size; appliquerDossiers(); return n;
};
// Page ouverte redessinée après un changement venu d'ailleurs, défilement gardé (la salle d'attente se redessine elle-même)
function rafraichirPage(ids) {
  const p = String(D.page || ""), i = p.indexOf("/"), nom = i < 0 ? p : p.slice(0, i), arg = i < 0 ? null : decodeURIComponent(p.slice(i + 1)), y = window.scrollY;
  if (nom === "dossier" ? ids.indexOf(arg) < 0 : ["accueil", "agenda", "patients"].indexOf(nom) < 0) return;
  try { PAGES[nom][1](arg); window.scrollTo(0, y); if (nom === "dossier") toast("Dossier mis à jour (modifié sur un autre poste)."); } catch (e) { console.warn("réaffichage", e); }
}
window.__majDossiers = () => appliquerDossiers(); // tests
const PAGES_TOUS = () => ({ tous: ["Mes cabinets aujourd'hui", () => pageTous()] });
const PAGES = { accueil: ["Tableau de bord", pageAccueil], rcp: ["RCP", () => pageRcpMenu()], agenda: ["Agenda / Rendez-vous", () => pageAgenda()], configuration: ["Paramètres", () => { location.replace("#parametres"); }], profil: ["Mon compte", (a) => pageProfil(a)], protocoles: ["Protocoles", (a) => pageProtocoles(a)], radiotherapie: ["Radiothérapie", (a) => pageRadiotherapie(a)], parametres: ["Paramètres", (a) => pageConfiguration(a)], bilan: ["Bilan", () => pagePageBilan()], salle: ["Salle d'attente", () => pageSalle()], patients: ["Patients", pagePatients], taches: ["Tâches", (a) => pageTaches(a)], dossier: ["Dossier patient", pageDossier] };
function route() {
  if (CABINETS.length > 1 && !PAGES.tous) Object.assign(PAGES, PAGES_TOUS()); // secrétaire de plusieurs cabinets (19.7)
  const h = location.hash.replace("#", ""), i = h.indexOf("/"), p = i < 0 ? h : h.slice(0, i), arg = i < 0 ? null : decodeURIComponent(h.slice(i + 1)), nom = PAGES[p] && module(PAGE_MODULE[p] || "") && !(p === "protocoles" && D.reg && D.reg.fonctions["chimio.protocoles"] === false) && (p !== "radiotherapie" || voitRefRT()) && (!estComptable() || PAGES_COMPTABLE.indexOf(p) >= 0) && (!D.bib || PAGES_BIB.indexOf(p) >= 0) ? p : estComptable() ? "bilan" : D.bib ? "protocoles" : "accueil";
  if (!$("fenetre").classList.contains("cache")) window.fermerFenetre();
  fermerPanneau(true); $("page").classList.toggle("p-dos", nom === "dossier"); menuDossier(nom === "dossier"); // R-G : panneau fermé, menu replié dans le dossier seulement
  D.page = nom + (arg ? "/" + encodeURIComponent(arg) : ""); $("titrePage").textContent = nom === "parametres" && D.bib ? "Paramètres du modèle" : PAGES[nom][0]; $("page").classList.toggle("large", nom === "agenda");
  document.querySelectorAll("nav a").forEach((a) => a.classList.toggle("actif", a.dataset.p === (nom === "dossier" ? "patients" : nom)));
  $("btParam").classList.toggle("on", nom === "parametres"); $("mcCompte").classList.toggle("actif", nom === "profil"); // Lot B : Paramètres et Mon compte hors du menu
  if (nom === "dossier" && arg) { delete ONGLET[arg]; oublierConsultations(arg); oublierDocs(arg); oublierFichiers(arg); noterRecent(arg); } // dossier ouvert : onglet Consultation, consultations relues ; derniers dossiers (lot A)
  PAGES[nom][1](arg); window.scrollTo(0, 0);
  if (!estComptable() && !D.bib) presenceDossier(nom === "dossier" ? arg : null); // « Dossier ouvert par » (salle d'attente)
}
// Changer de page : le résumé en cours d'écriture est d'abord enregistré ; s'il ne peut pas l'être, on reste sur le dossier
// Garde d'une page en modification (RTR, RT5 du 25/10/2026, API.garde) : on reste sur la page, qui demande « Quitter sans enregistrer ? » ;
// si l'on quitte, la garde est retirée et l'adresse demandée est rouverte
let GARDE = null;
window.addEventListener("hashchange", async () => {
  if (!D) return;
  if (GARDE) {
    const vers = location.hash, f = GARDE, ici = "#" + (D.page || "");
    history.replaceState(null, "", ici);
    if (await f(vers)) { GARDE = null; location.hash = vers; }
    return;
  }
  if (NOTES.txt != null || NOTES.encours) {
    await sauverNotesMaintenant();
    if (NOTES.txt != null) { const ici = "#dossier/" + encodeURIComponent(NOTES.pid); if (location.hash !== ici) { history.replaceState(null, "", ici); toast("Le résumé n'a pas pu être enregistré : vérifiez la connexion, puis réessayez."); } return; }
  }
  route();
});
// Fermer l'onglet ou recharger avec un résumé non enregistré : le navigateur demande confirmation
window.addEventListener("beforeunload", (e) => { if (NOTES.txt != null || NOTES.encours) { sauverNotesMaintenant(); e.preventDefault(); e.returnValue = ""; } else if (GARDE) { e.preventDefault(); e.returnValue = ""; } });

// Premier démarrage d'un cabinet neuf (phase F, 09/10/2026) : étapes pour le médecin, jusqu'à ce que profil, lieu et tarifs soient faits
function premiersPas() {
  if (D.bib) return "";
  if (D.membre.role !== "medecin" || !peut("parametres")) return "";
  const T = D.tarifs, et = [
    ["profil", "Votre profil", "Nom et INPE (fiche de chimiothérapie, comptes rendus, ordonnances).", !!(D.profil && D.profil.inpe)],
    ["parametres/lieux", "Votre lieu d'exercice", "Clinique ou hôpital : nom, adresse, logo. Il faut au moins un lieu pour créer un patient.", D.etabs.length > 0],
    ["parametres/activites", "Vos tarifs", "Consultations et séances de chimiothérapie, par lieu (les tarifs de radiothérapie sont déjà remplis).", !!(T && T.etablissements && Object.keys(T.etablissements).length), !peut("finances")],
    ["parametres/acces", "Votre équipe (facultatif)", "Secrétaire, infirmière : chacun reçoit un e-mail pour choisir son mot de passe.", null],
    ["parametres/couleurs", "Votre Google Agenda (facultatif)", "Les rendez-vous, cures et séances apparaissent dans votre agenda.", !!(D.profil && D.profil.agendaGoogle && D.profil.agendaGoogle.email), !module("gagenda")],
  ].filter((e) => !e[4]);
  if (et.filter((e) => e[3] !== null && !/facultatif/.test(e[1])).every((e) => e[3])) return "";
  return '<section class="carte ppas"><h3><span class="ic">' + ic("check") + "</span>Bienvenue dans Onco360 : pour commencer</h3>" +
    '<p class="sous">Les protocoles, les bibliothèques de prescription, les jours fériés et les listes de diagnostics et de mutuelles sont déjà en place.</p>' +
    et.map((e, i) => '<a class="pp' + (e[3] ? " ok" : "") + '" href="#' + e[0] + '"><span class="n">' + (e[3] ? ic("check") : i + 1) + '</span><span class="tx"><b>' + esc(e[1]) + "</b><span>" + esc(e[2]) + "</span></span><span class=\"fl\">›</span></a>").join("") + "</section>";
}
// Organisation du tableau de bord choisie par le cabinet (Paramètres › Cabinet › Tableau de bord, 11/10/2026) : parametres/accueil
// { data: JSON { ordre, cartes, col } }, appliquée par-dessus le réglage de l'administration (accueilEffectif de catalogue.js)
async function lireAccueilCab() {
  try { const s = await getDoc(doc(db, "espaces", ESPACE, "parametres", "accueil")); window.majAccueilCab(s.exists() ? JSON.parse(s.data().data || "null") : null); }
  catch (e) { /* réglage illisible : celui de l'administration */ }
}
window.majAccueilCab = (o) => { const av = JSON.stringify(D.accueilCab || null); D.accueilCab = o || null; if (JSON.stringify(D.accueilCab) !== av && (D.page || "") === "accueil") pageAccueil(); };

// « À valider par le médecin » / « À faire par la secrétaire » / « À faire par l'infirmière » (audit externe, 11/10/2026) : ce qui
// attend la personne connectée, réuni en un seul bloc (avant : réparti entre la carte du jour, les tâches et la cloche)
// Alertes cliniques du médecin (12/10/2026, repères de Dr Bentahila ; de simples rappels) : lignes en cours seulement — perte de poids
// > 10 % depuis le début de la ligne, repères de clairance (cisplatine, carboplatine) avant une cure des 7 prochains jours, dernier
// bilan noté à la validation sous les repères (PNN, plaquettes, hémoglobine)
function alertesCliniques() {
  const t = D.t, l = [];
  D.patients.forEach((x) => (decede(x.P) ? [] : x.P.lignes || []).forEach((L) => { // patient décédé : plus d'alerte (3.3)
    if (L.arret || !(L.cures || []).some((c) => (c.st || "prevue") === "prevue")) return;
    let E; try { if (!protocoleDe(L, D.ctx.bib)) return; E = etatLigne(L, x.P, D.ctx); } catch (er) { return; }
    const k = E.findIndex((e) => e.st === "prevue"), e = E[k]; if (!e) return;
    const pd = poidsDebut(E), po = e.g[0].poids, nom = (protocoleDe(L, D.ctx.bib) || {}).nom || "";
    // R-B2 : clé de chaque alerte (patient, ligne, cure, type, valeur) pour « Vu »
    const cle = (n, type, v) => cleAlerte({ pid: x.id, lid: L.id || "", n, type, v });
    if (pd && po && (pd - po) / pd > 0.1) l.push({ id: x.id, nm: x.r.nm, de: "Perte de poids de " + Math.round((pd - po) / pd * 100) + " % depuis le début de la ligne (" + pd + " → " + po + " kg) · " + nom, retard: true, cle: cle(e.n, "poids", pd + ">" + po) });
    if (e.date && ecart(e.date, t) <= 7) reperesClairance(e, e.g[0]).forEach((a) => l.push({ id: x.id, nm: x.r.nm, de: "C" + e.n + " le " + dfr(e.date) + " : " + a, retard: /contre-indi/.test(a), cle: cle(e.n, "cl", a) }));
    const fv = E.slice(0, k).reverse().find((z) => z.c && z.c.fige && z.c.fige.bio);
    if (fv) alertesBio(fv.c.fige.bio).forEach((a) => l.push({ id: x.id, nm: x.r.nm, de: "Bilan de la C" + fv.n + " (" + dfr(fv.date) + ") : " + a, cle: cle(fv.n, "bio", a) }));
  }));
  return l;
}
// R-B2 : alerte clinique vue / remise (utilisateurs/{uid}.alertesVues { clé: date }, entrées de plus de 90 jours effacées à chaque écriture)
async function ecrireAlertesVues(v) {
  D.profil.alertesVues = v; const ref = doc(db, "utilisateurs", D.u.uid);
  await updateDoc(ref, { alertesVues: v }).catch((e) => (e && e.code === "not-found" ? setDoc(ref, { alertesVues: v }, { merge: true }) : Promise.reject(e)));
}
window.alerteVue = async (cle) => {
  const v = vuesNettoyees(D.profil.alertesVues, D.t); v[cle] = D.t;
  try { await ecrireAlertesVues(v); toast("Alerte vue : elle ne reviendra pas (sauf nouvelle valeur)."); } catch (e) { toast("Enregistrement impossible : " + (e.message || e)); }
  if (String(D.page || "") === "accueil") pageAccueil();
};
window.alertesVuesVoir = () => {
  const A = partagerAlertes(alertesCliniques(), vuesNettoyees(D.profil.alertesVues, D.t)).vues;
  fenetre('<h3>Alertes vues</h3><p class="sous">Alertes cliniques que vous avez validées « Vu » (toujours d\'actualité). « Remettre » les fait revenir dans le tableau de bord.</p>' +
    (A.length ? A.map((o) => '<div class="af-l"><div class="tx"><b>' + esc(o.nm) + '</b><span class="de">' + esc(o.de) + '</span></div><button class="bt petit gris" onclick="alerteRemise(\'' + o.cle + '\')">Remettre</button></div>').join("") : '<p class="mesures">Aucune.</p>') +
    '<div class="boutons"><button class="bt plein" onclick="fermerFenetre()">Fermer</button></div>');
};
window.alerteRemise = async (cle) => {
  const v = vuesNettoyees(D.profil.alertesVues, D.t); delete v[cle];
  try { await ecrireAlertesVues(v); } catch (e) { toast("Enregistrement impossible : " + (e.message || e)); return; }
  fermerFenetre(); if (String(D.page || "") === "accueil") pageAccueil(); toast("Alerte remise dans le tableau de bord.");
};
function blocAFaire(pj) {
  const role = D.membre.role, t = D.t, G = [], plus = (l, n) => (l.length > n ? '<div class="af-plus">+ ' + (l.length - n) + " autre" + (l.length - n > 1 ? "s" : "") + "</div>" : "");
  const ligne = (o) => '<div class="af-l' + (o.retard ? " ret" : "") + '"' + (o.cure ? ' onclick="' + o.cure + '"' : o.id ? ' onclick="ouvrirDossier(\'' + o.id + '\')"' : "") + '><div class="tx"><b>' + esc(o.nm) + "</b>" + (o.de ? '<span class="de">' + esc(o.de) + "</span>" : "") + "</div>" + (o.badge || "") + (o.bt || "") + "</div>";
  const groupe = (icone, titre, l, n) => { if (l.length) G.push('<div class="af-g"><div class="af-t">' + ic(icone) + "<span>" + titre + '</span><span class="n">' + l.length + "</span></div>" + l.slice(0, n || 6).map(ligne).join("") + plus(l, n || 6) + "</div>"); };
  const btn = (lib, js) => '<button class="bt petit vert" onclick="event.stopPropagation();' + js + '">' + ic("check") + lib + "</button>";
  const resume = (icone, html, lien, lib) => G.push('<div class="af-g"><div class="af-r">' + ic(icone) + "<span>" + html + "</span>" + (lien ? '<button class="lien" onclick="' + lien + '">' + lib + " ›</button>" : "") + "</div></div>");
  let titre;
  if (estMed(role)) {
    titre = "À valider par le médecin";
    const cures = [];
    D.patients.forEach((x) => (x.r.act || []).forEach((a) => { if (!a.d || a.d > t) return; const ret = a.d < t;
      // T2 (24/10/2026, décision 53) : un clic ouvre directement la cure (et le jour) à valider : 2 gestes au lieu de 4
      cures.push({ id: x.id, cure: a.li != null ? "chOuvrir('" + x.id + "'," + a.li + "," + (a.k - 1) + (a.sj ? "," + a.sj : "") + ")" : "", nm: x.r.nm, de: "C" + a.k + (a.sj ? " J" + a.sj : "") + " · " + a.nom.replace(/ · J\d+$/, ""), retard: ret, d: a.d, badge: ret ? '<span class="badge b-al">prévue le ' + dfr(a.d) + "</span>" : badgeSalle(x.id, "chimio") + '<span class="badge b-ch">aujourd\'hui</span>' }); }));
    cures.sort((p, q) => p.d.localeCompare(q.d) || p.nm.localeCompare(q.nm)); groupe("seringue", "Cures à valider", cures, 8);
    { const A = partagerAlertes(alertesCliniques(), vuesNettoyees(D.profil.alertesVues, D.t)); // R-B2 : « Vu » (coche) sur chaque alerte ; celles déjà vues à part
      groupe("alerte", "Alertes cliniques", A.aVoir.map((o) => Object.assign({}, o, { bt: '<button class="ico af-vu" title="Vu : ne plus afficher cette alerte" aria-label="Vu : ne plus afficher cette alerte" onclick="event.stopPropagation();alerteVue(\'' + o.cle + '\')">' + ic("check") + "</button>" })), 6);
      if (A.vues.length) G.push('<div class="af-g af-g-vues"><button type="button" class="af-vues" onclick="alertesVuesVoir()" title="Revoir les alertes déjà vues">' + ic("check") + A.vues.length + " alerte" + (A.vues.length > 1 ? "s" : "") + " vue" + (A.vues.length > 1 ? "s" : "") + '<span class="fl">›</span></button></div>'); }
    const cont = [], dosi = [], fin = [], okV = peutDosi();
    D.patients.forEach((x) => { if (!voitRT(x)) return; let l = []; try { l = JSON.parse(x.doc.rtsJson || "[]"); } catch (e) { /* illisible */ }
      l.forEach((r) => { const q = "'" + x.id + "','" + r.id + "'", ap = "function(){route()}", acte = r.acte || "Radiothérapie";
        const cz0 = contourage(r, t), dz0 = dosimetrie(r, t), sans = (z) => (z && z.retard && r.deb && r.deb <= t ? " · COMMENCÉE SANS VALIDATION" : z && z.retard ? " · EN RETARD" : "");
        if (cz0 && r.scan <= t) cont.push({ id: x.id, nm: x.r.nm, de: acte + " · scanner le " + dfr(r.scan) + (r.deb ? " · 1re séance le " + dfr(r.deb) : "") + sans(cz0), retard: !!(cz0.retard || (r.deb && ecart(t, r.deb) <= 2)), bt: okV ? btn("Valider", "contRT(" + q + ",false," + ap + ")") : "" });
        if (dz0) dosi.push({ id: x.id, nm: x.r.nm, de: acte + (r.deb ? " · 1re séance le " + dfr(r.deb) : "") + sans(dz0), retard: !!(dz0.retard || (r.deb && ecart(t, r.deb) <= 2)), bt: okV ? btn("Valider", "dosiRT(" + q + ",false," + ap + ")") : "" });
        const f = !r.fin && r.deb && finRT(r, D.ctx.feries); if (f && f <= t) fin.push({ id: x.id, nm: x.r.nm, de: acte + " · fin prévue le " + dfr(f), retard: f < t, bt: okV ? btn("Valider", "terminerRT(" + q + ",false," + ap + ")") : "" });
      }); });
    groupe("radiation", "Contourages à valider", cont); groupe("radiation", "Dosimétries à valider", dosi); groupe("drapeau", "Fins de radiothérapie à valider", fin);
  } else if (role === "assistante") {
    titre = "À faire par la secrétaire";
    if (fnOn("agenda.whatsapp") && peut("rendezvous")) {
      const L = rappelsAEnvoyer(), a = L.filter((o) => !o.env && o.tel), env = L.length - L.filter((o) => !o.env).length;
      groupe("whatsapp", "Rappels WhatsApp à envoyer", a.map((o) => ({ id: o.id, nm: o.nm, de: dfr(o.d) + (o.h ? " " + o.h : "") + (o.de ? " · " + o.de : ""), bt: btnWA(o.x, o.cat, o.d, o.h) })), 8);
      if (env && !a.length) resume("check", "Rappels WhatsApp : tous envoyés (" + env + ").");
    }
    const vus = {}, sansTel = [];
    agenda7().forEach((e) => { const x = D.patients.find((z) => z.id === e.id); if (!x || !e.cat || vus[e.id] || numeroWA(x.P.tel)) return; vus[e.id] = 1; sansTel.push({ id: e.id, nm: e.nm, de: (e.de || "Rendez-vous") + " le " + dfr(e.d) + (e.h ? " à " + e.h : "") }); });
    groupe("alerte", "Pas de numéro de téléphone", sansTel, 4);
    const n = absences().reduce((s, o) => s + o.l.length, 0);
    if (n && D.accueilCartes && D.accueilCartes.conflits) resume("avion", "<b>" + n + "</b> rendez-vous à décaler (absence ou jour férié)", "document.getElementById('carteConflits').scrollIntoView({behavior:'smooth'})", "Voir");
    else if (n) groupe("avion", "Rendez-vous à décaler", absences().flatMap(({ a, l }) => l.map((o) => ({ id: o.id, nm: sansEmoji(o.t), de: dfr(o.d) + (o.h ? " " + o.h : "") + " · " + (a.m || "Absence") }))));
    // R-C1 (19/10/2026, audit 4 d. 22) : patients à reprogrammer (consultation non venue sans nouveau rendez-vous, séance de chimio « absent, sans
    // reporter ») ; fiches de la salle des 30 derniers jours lues une fois, puis la carte se redessine
    if (peut("rendezvous")) {
      if (module("salle")) chargerJoursPasses(30).then((neuf) => { if (neuf && D.page === "accueil" && !occupeEcran()) rafraichirPage([]); }).catch((e) => console.warn("patients à reprogrammer", e));
      groupe("agenda", "Patients à reprogrammer", patientsAReprogrammer().map((o) => ({ id: o.id, nm: o.nm, de: dfr(o.d) + " · " + o.lib, retard: true, bt: o.quoi === "rdv" ? '<button class="bt petit clair" onclick="event.stopPropagation();ouvrirRdv(\'' + o.id + '\')">' + ic("plus") + "Rendez-vous</button>" : "" })), 6);
    }
    const nc = nonCloturees().length;
    if (nc) resume("salle", "<b>" + nc + "</b> consultation" + (nc > 1 ? "s" : "") + " des 7 derniers jours ni « Venu » ni « Non venu »", module("salle") ? "location.hash='salle'" : "", "Salle d'attente");
  } else if (role === "infirmiere") {
    titre = "À faire par l'infirmière";
    groupe("seringue", "Chimiothérapies du jour", pj.ch.map((o) => ({ id: o.id, nm: o.nm, de: o.lib + " · " + o.de, badge: badgeSalle(o.id, "chimio") })), 10);
  } else return "";
  return '<section class="carte afaire"><h3><span class="ic">' + ic("check") + "</span>" + titre + "</h3>" + (G.length ? G.join("") : etatVide({ petit: 1, ill: "agendaOk", titre: estMed(role) ? "Rien à valider" : "Rien à faire pour le moment", txt: estMed(role) ? "Cures, contourages, dosimétries et fins de radiothérapie sont à jour." : "" })) + "</section>"; // 26/10/2026 : plus de phrase sous le titre
}

// 19/10/2026 (demande de Dr Bentahila) : tableau de bord, chaque explication sous un titre de carte va dans un petit rond « ? » à côté du titre
// (comme dans Paramètres) ; un clic l'affiche ou la cache. Aussi pour les cartes redessinées ensuite (observateur sur la page).
// 26/10/2026 (demande de Dr Bentahila : « style minimaliste, enlève les ? et les phrases qui pendouillent ») : la phrase est cachée, sans « ? »
function aidesCartes() {
  $("page").querySelectorAll("section.carte > h3 + p.sous:not([data-q])").forEach((p) => { p.dataset.q = "1"; p.classList.add("cache"); });
}
// 20/10/2026 (demande de Dr Bentahila) : aussi dans la page Bilan (versements et règlements, par établissement, mois par mois, référents)
new MutationObserver(() => { if (D && (D.page === "accueil" || D.page === "bilan")) aidesCartes(); }).observe($("page"), { childList: true, subtree: true });
function pageAccueil() {
  const pj = programmeDuJour(), ag = agenda7(), ab = absences(), tot = pj.rt.length + pj.co.length + pj.ch.length;
  const ligne = (o, cat) => '<div class="li" onclick="ouvrirDossier(\'' + o.id + '\')">' + (cat === "co" ? '<span class="h">' + esc(o.h) + "</span>" : "") +
    '<div class="tx"><b>' + esc(o.nm) + '</b><div class="de">' + esc(cat === "co" ? o.lib : o.de) + "</div></div>" +
    (cat === "co" ? (o.fait ? '<span class="badge b-ch">Vu</span>' : o.rid ? badgeSalle(o.id, "r-" + o.rid) : "") : (cat === "ch" ? badgeSalle(o.id, "chimio") : "") + '<span class="badge ' + (o.cls || "b-ch") + '"' + (cat === "rt" && / prévue$/.test(o.lib) ? ' title="Calculé d\'après le calendrier (jours ouvrés depuis la 1re séance) : les séances faites ne sont pas enregistrées."' : "") + ">" + esc(o.lib) + "</span>") + "</div>";
  // 26/10/2026 (demande de Dr Bentahila) : une catégorie sans rien reste affichée, avec une pastille et une phrase
  const categorie = (cls, icone, titre, l, vide) => l.length ? '<div class="cat"><div class="tc">' + ic(icone) + titre + '<span class="n">' + l.length + "</span></div>" + l.map((o) => ligne(o, cls)).join("") + "</div>"
    : vide ? '<div class="cat"><div class="tc">' + ic(icone) + titre + "</div>" + videMini(icone, vide) + "</div>" : "";
  const A2 = accueilEffectif(D.reg, D.accueilCab); D.accueilCartes = A2.cartes;

  let h = '<section class="accueil"><div><h2>Bonjour ' + esc(estMed(D.membre.role) ? [D.titre, D.nomAff].filter(Boolean).join(" ") : cap(String((D.profil && D.profil.prenom) || "").toLowerCase()) || D.nomAff) + "</h2><p>" + cap(jourLong(D.t)) + "</p></div>" +
    '<div class="actions"><button class="b2" onclick="nouveauPatient()">' + ic("plus") + '<span class="lg">Nouveau patient</span><span class="sm">Patient</span></button><button class="b1" onclick="nouveauRdv()">' + ic("plus") + '<span class="lg">Nouveau rendez-vous</span><span class="sm">Rendez-vous</span></button></div></section>';

  // Cartes du tableau de bord : construites une par une, puis placées selon l'organisation réglée (administration, puis cabinet)
  const cartes = {}, carte = (k, fn) => { const avant = h; h = ""; fn(); cartes[k] = h; h = avant; };
  carte("ppas", () => { h += premiersPas(); });
  carte("jour", () => {
  h += '<section class="jour"><div class="ent"><h3><span class="ic">' + ic("agenda") + "</span>Aujourd'hui</h3><span>" + cap(jourLong(D.t)) + (ouvre(D.t, D.ctx.feries) ? "" : " · jour non ouvré") + '</span>' + (tot ? '<span class="tot">' + tot + " au programme</span>" : "") + "</div>" +
    // T5 (24/10/2026, audit n° 11 U24) : consultations et chimiothérapie d'abord, puis la radiothérapie (dépliée, réponse de Dr Bentahila)
    categorie("co", "stetho", "Consultations", pj.co, "Aucune consultation prévue aujourd'hui.") + categorie("ch", "seringue", "Chimiothérapie", pj.ch, "Aucune chimiothérapie prévue aujourd'hui.") +
    categorie("rt", "radiation", "Radiothérapie", pj.rt, module("rt") ? "Aucune radiothérapie à suivre aujourd'hui." : "") + "</section>";
  });
  carte("afaire", () => { h += blocAFaire(pj); });

  carte("sept", () => {
  h += '<section class="carte sept"><h3><span class="ic">' + ic("liste") + '</span>Les 7 prochains jours</h3><p class="sous">Rendez-vous, cures, séances et radiothérapie. Bouton WhatsApp vert : rappel à envoyer (rendez-vous dans ' + (reglages().whatsapp.de * 24) + " à " + (reglages().whatsapp.a * 24) + ' h).</p>';
  if (!ag.length) h += '<p class="sous">Rien de prévu sur les 7 prochains jours.</p>';
  else h += '<div class="sept-l">';
  let jc = "";
  ag.forEach((e) => {
    if (e.d !== jc) { if (jc) h += "</div>"; jc = e.d; h += '<div class="jour7"><h4>' + cap(jourLong(e.d)) + "</h4>"; }
    h += '<div class="ev" onclick="ouvrirDossier(\'' + e.id + '\')"><span class="h' + (e.h ? "" : " j") + '">' + (e.h || "Journée") + '</span><span class="evi">' + e.em + '</span><div class="tx"><b>' + esc(e.nm) + "</b><br><span>" + esc(e.de) + '</span></div>' + btnWA(D.patients.find((z) => z.id === e.id), e.cat, e.d, e.h) + '<button class="lien">Ouvrir le dossier</button></div>';
  });
  if (jc) h += "</div>";
  if (ag.length) h += "</div>";
  h += "</section>";
  });
  carte("taches", () => { if (module("taches")) h += blocTaches({ sansRT: estMed(D.membre.role) && A2.cartes.afaire !== false }); }); // Mes tâches (étape T4) ; contourage, dosimétrie, fin de RT : dans « À valider »
  // Rappels WhatsApp à envoyer (19.4) : ceux de la fenêtre du bouton vert, avec ceux déjà envoyés (qui, quand) ; la secrétaire les
  // a aussi dans « À faire » (ceux à envoyer) : cette carte garde la liste complète, ouverte seulement si « À faire » est retiré
  carte("rappels", () => {
    if (!fnOn("agenda.whatsapp") || !peut("rendezvous") || D.membre.role !== "assistante" || A2.cartes.afaire !== false) return; // la secrétaire les envoie, pas le médecin
    const L = rappelsAEnvoyer(); if (!L.length) return; const n = L.filter((o) => !o.env && o.tel).length;
    h += '<section class="carte" data-fn="agenda.whatsapp"><h3><span class="ic">' + ic("whatsapp") + "</span>Rappels WhatsApp" + '<span class="badge ' + (n ? "b-or" : "b-ch") + '" style="margin-left:8px">' + (n ? n + " à envoyer" : "tous envoyés") + "</span></h3>" +
      '<p class="sous">Rendez-vous, cures et séances dans ' + (reglages().whatsapp.de * 24) + " à " + (reglages().whatsapp.a * 24) + " h. Un clic ouvre WhatsApp avec le message prêt ; le rappel est ensuite noté envoyé.</p>" +
      L.map((o) => '<div class="ev" onclick="ouvrirDossier(\'' + o.id + '\')"><span class="h' + (o.h ? "" : " j") + '">' + esc(dfr(o.d)) + (o.h ? " " + o.h : "") + '</span><div class="tx"><b>' + esc(o.nm) + "</b><br><span>" + esc(o.de) + (o.env ? ' · <span class="mesures">✓ ' + esc(libEnvoi(o.env)) + "</span>" : !o.tel ? ' · <span style="color:var(--orange)">pas de numéro</span>' : "") + "</span></div>" + btnWA(o.x, o.cat, o.d, o.h) + "</div>").join("") + "</section>";
  });

  carte("conflits", () => {
  if (!ab.length) h += '<section class="carte abs" id="carteConflits"><h3><span class="ic">' + ic("avion") + "</span>Conflits</h3>" + videMini("check", "Aucun rendez-vous à décaler : rien ne tombe pendant une absence ou un jour férié.") + "</section>"; // 26/10/2026
  if (ab.length) {
    h += '<section class="carte abs" id="carteConflits"><h3><span class="ic">' + ic("avion") + '</span>Conflits : rendez-vous à décaler</h3><p class="sous">Tout ce qui tombe pendant une absence ou un jour férié doit être déplacé.</p>';
    ab.forEach(({ a, l }) => {
      const g = ecart(a.du, D.t);
      h += '<div class="per">' + (a.fe ? ic("drapeau") : ic("avion")) + esc(a.m || "Absence") + (a.du === a.au ? " – le " + dfrA(a.du) : " – du " + dfrA(a.du) + " au " + dfrA(a.au)) + " <span>(" + (g > 0 ? "dans " + g + " jour" + (g > 1 ? "s" : "") : g === 0 ? "aujourd'hui" : "en cours") + ")</span></div>";
      h += l.length ? l.map((o) => '<div class="conf"><span class="badge b-al">' + dfr(o.d) + (o.h ? " " + o.h : "") + '</span><div class="tx">' + esc(sansEmoji(o.t)) + '</div><button class="bt petit rouge" onclick="decaler(\'' + o.id + "','" + esc(o.k) + '\')">Décaler</button></div>').join("") : '<div class="ok">Aucun rendez-vous prévu pendant cette absence.</div>';
    });
    h += "</section>";
  }
  });

  carte("stats", () => {
  const n = (f) => D.patients.filter(FILTRES[f][1]).length, curesMois = D.patients.reduce((s, x) => s + (x.r.rec || []).filter((d) => d && d.slice(0, 7) === D.t.slice(0, 7)).length, 0);
  const k = (f, ico, v, lib) => '<button class="k" onclick="location.hash=\'patients/' + f + '\'"><span class="ic">' + ico + "</span><b>" + v + "</b><span>" + lib + "</span></button>";
  h += '<section class="carte"><h3><span class="ic">' + ic("bilan") + '</span>Statistiques</h3><div class="kpi">' +
    k("tous", ic("patients"), D.patients.length, "Patients") + k("chc", ic("seringue"), n("chc"), "Chimiothérapies en cours") + k("rtc", ic("radiation"), n("rtc"), "Radiothérapies en cours") +
    k("rtp", ic("horloge"), n("rtp"), "Radiothérapies prévues") + k("cm", ic("check"), curesMois, "Cures reçues ce mois") + k("fin", ic("drapeau"), n("fin"), "Chimiothérapies terminées") + "</div></section>";
  });

  // Mise en page (11/10/2026) : cartes « l » en pleine largeur ; les cartes « g » / « d » qui se suivent forment deux colonnes sur
  // grand écran (programme du jour à gauche) ; sur tablette et téléphone, une seule colonne dans l'ordre réglé (propriété order).
  // Emplacement de la carte d'abonnement (derniers jours de l'essai, échéance, retard) : en haut de la colonne de droite, après le
  // programme du jour sur téléphone (abonnement.js) ; avant, elle passait devant le programme du jour.
  const vis = A2.ordre.filter((k) => A2.cartes[k] !== false && cartes[k]), rang = (k) => A2.ordre.indexOf(k) * 10 + 10;
  let grp = [], aboPlace = false;
  const abo = () => { if (aboPlace || !aboP.estTitulaire()) return ""; aboPlace = true; return '<div class="tb-c" id="accAbo" style="order:' + (rang("jour") + 5) + '"></div>'; };
  const vider = () => {
    if (!grp.length) return;
    const g = grp.filter((k) => A2.col[k] === "g"), d = grp.filter((k) => A2.col[k] === "d"), c = (k) => '<div class="tb-c" style="order:' + rang(k) + '">' + cartes[k] + "</div>";
    if (!g.length || !d.length) h += grp.map((k) => cartes[k]).join("");
    else h += '<div class="tb-grille"><div class="tb-col">' + g.map(c).join("") + '</div><div class="tb-col">' + abo() + d.map(c).join("") + "</div></div>";
    grp = [];
  };
  vis.forEach((k) => { if (A2.col[k] === "l") { vider(); h += cartes[k]; } else grp.push(k); });
  vider();
  $("page").innerHTML = h;
  aboP.apresAccueil(); // abonnement : bandeau sous « Bonjour » pendant l'essai ; carte dans la colonne de droite les derniers jours et en retard (titulaire, 18.5)
}

// ───── Patients ─────
function pagePatients(filtre) {
  const protos = {};
  D.patients.forEach((x) => { (x.r.act || []).forEach((a) => { protos[a.nom.replace(/ · J\d+$/, "")] = 1; }); if (x.r.t && x.r.t.st === "cours") protos[x.r.t.nom] = 1; });
  const opts = Object.entries(FILTRES).map(([k, v]) => '<option value="' + k + '">' + v[0] + "</option>").join("") +
    '<optgroup label="Protocoles en cours">' + Object.keys(protos).sort().map((p) => '<option value="p:' + esc(p) + '">Sous ' + esc(p) + "</option>").join("") + "</optgroup>";
  // Lot B (25/10/2026) : plus de titre ; les filtres d'abord, puis « + Nouveau patient » en tête de la liste, à droite du nombre de patients
  $("page").innerHTML = '<div class="filtres barre-filtres"><div class="recherche">' + ic("loupe") + '<input id="q" type="search" placeholder="Rechercher un patient…" title="Nom, prénom, date de naissance, numéro de dossier, diagnostic, protocole" autocomplete="off"></div><select id="flt">' + opts + "</select>" + (hopsVus().length > 1 ? '<select id="fhop" aria-label="Hôpital"><option value="">Tous les hôpitaux</option>' + hopsVus().map((e) => '<option value="' + esc(e.code) + '">' + esc(e.code + " – " + e.nom) + "</option>").join("") + "</select>" : "") + "</div>" +
    '<section class="carte"><div class="liste-tete"><div class="sous" id="nbRes"></div><button class="b1" onclick="nouveauPatient()">' + ic("plus") + "Nouveau patient</button></div><div id=\"lst\"></div></section>";
  // 3.1 et 3.3 (12/10/2026) : filtres par statut, localisation et stade (fiche tumeur), proposés s'il y a des valeurs
  const ex = (x, k) => (((x.doc.clinique || {}).extra) || {})[k] || "", vus = (k, ref) => ref.filter((v) => D.patients.some((x) => ex(x, k) === v));
  const sel = (id, lib, l) => (l.length ? '<select id="' + id + '" aria-label="' + lib + '"><option value="">' + lib + "</option>" + l.map(([v, t]) => '<option value="' + esc(v) + '">' + esc(t) + "</option>").join("") + "</select>" : "");
  const fx = sel("fst", "Tous les statuts", STATUTS.filter(([k]) => D.patients.some((x) => (x.doc.clinique || {}).statut === k)).concat(D.patients.some((x) => (x.doc.clinique || {}).statut === "decede") ? [["vivant", "Sauf décédés"]] : [])) +
    sel("floc", "Toutes les localisations", [...new Set(D.patients.map((x) => (x.doc.clinique || {}).diag).filter(Boolean))].sort((a, z) => a.localeCompare(z, "fr")).map((v) => [v, v])) +
    sel("fstade", "Tous les stades", [...new Set(D.patients.map((x) => ex(x, "xtstade")).filter(Boolean))].sort().map((v) => [v, v]));
  if (fx) document.querySelector("#page .filtres").insertAdjacentHTML("beforeend", fx);
  ["fst", "floc", "fstade"].forEach((id) => { if ($(id)) $(id).onchange = listePatients; });
  if (filtre && $("flt").querySelector('option[value="' + CSS.escape(filtre) + '"]')) $("flt").value = filtre;
  $("q").oninput = $("flt").onchange = listePatients; if ($("fhop")) $("fhop").onchange = listePatients; listePatients();
}
function listePatients() {
  const mots = sansAcc($("q").value).split(/\s+/).filter(Boolean), f = $("flt").value, t = D.t, hop = $("fhop") ? $("fhop").value : "";
  const fst = $("fst") ? $("fst").value : "", floc = $("floc") ? $("floc").value : "", fstade = $("fstade") ? $("fstade").value : "";
  const l = D.patients.filter((x) => {
    if (hop && x.doc.etablissementId !== hop) return false;
    const cl = x.doc.clinique || {}, ext = cl.extra || {};
    if (fst && (fst === "vivant" ? cl.statut === "decede" : cl.statut !== fst)) return false;
    if (floc && cl.diag !== floc) return false;
    if (fstade && ext.xtstade !== fstade) return false;
    const r = x.r, hay = sansAcc([r.nm, dfrA(r.ddn), numDossier(x), r.diag, (r.pr || []).join(" "), r.t ? r.t.nom : "", r.hop].join(" "));
    if (!mots.every((w) => hay.indexOf(w) >= 0)) return false;
    if (f.indexOf("p:") === 0) return (r.act || []).some((a) => a.nom.replace(/ · J\d+$/, "") === f.slice(2)) || (r.t && r.t.st === "cours" && r.t.nom === f.slice(2));
    return FILTRES[f][1](x);
  });
  $("nbRes").textContent = ""; // 26/10/2026 (style minimaliste) : plus de compteur « 65 patients »
  $("lst").innerHTML = l.length ? l.map((xp) => { const { id, r } = xp;
    const a = age(r.ddn, t), rtC = (r.rtS || []).find((s) => s.st === "cours"), rtP = (r.rtS || []).find((s) => s.st === "prev");
    let tr = "", bd = "";
    if (r.t) { if (r.t.st === "cours") { tr = "💉 " + r.t.nom + (r.t.c && r.t.k ? " · C" + r.t.k + "/" + r.t.nb : "") + (r.t.next ? " · prochaine cure le " + dfr(r.t.next) : ""); bd = '<span class="badge b-co">En cours</span>'; } else { tr = "💉 " + r.t.nom; bd = r.t.st === "fin" ? '<span class="badge b-ch">Terminé</span>' : '<span class="badge b-gr">Arrêté</span>'; } }
    if (rtC) { tr = (tr ? tr + " · " : "") + "☢️ " + rtC.a + " jusqu'au " + dfr(rtC.fin); bd += ' <span class="badge b-rt">RT en cours</span>'; }
    else if (rtP) { tr = (tr ? tr + " · " : "") + "☢️ " + rtP.a + " à partir du " + dfr(rtP.deb); bd += ' <span class="badge b-rt">RT prévue</span>'; }
    const st0 = (xp.doc.clinique || {}).statut; if (st0 && st0 !== "traitement") bd += ' <span class="badge ' + (st0 === "decede" ? "b-dc" : st0 === "perdu" ? "b-or" : "b-gr") + '">' + esc(libStatut(st0)) + "</span>"; // 3.3
    return '<div class="pat" onclick="ouvrirDossier(\'' + id + '\')">' + bulle(D.patients.find((z) => z.id === id)) + '<div class="tx"><b>' + esc(r.nm) + "</b><span>" + esc([numDossier(xp) ? "N° " + numDossier(xp) : "", r.ddn ? "Né(e) le " + dfrA(r.ddn) + (a != null ? " (" + a + " ans)" : "") : "", r.diag].filter(Boolean).join(" · ")) + "</span>" + (tr ? "<span>" + icones(esc(tr)) + "</span>" : "") + '</div><div class="dr">' + (r.hop ? '<span class="badge b-gr">' + esc(r.hop) + "</span>" : "") + bd + "</div></div>";
  }).join("") : !D.patients.length ? etatVide({ ill: "patients", titre: "Aucun patient pour l'instant", txt: "Créez le premier dossier : l'identité d'abord,\npuis les traitements et les rendez-vous.", bouton: '<button class="b2" onclick="nouveauPatient()">' + ic("plus") + "Nouveau patient</button>" })
    : '<p class="vide-c">Aucun patient ne correspond.</p>';
}

// 4.3 (12/10/2026) : un seul jeu d'icônes : les émojis d'un texte déjà échappé deviennent les icônes dessinées
const icones = (h) => String(h).replace(/💉 ?/g, ic("seringue")).replace(/☢️ ?/g, ic("radiation")).replace(/🩺 ?/g, ic("stetho"));
// 4.3 (12/10/2026) : recherche en pilule de la barre du haut : nom, n° de dossier, téléphone ; ↑ ↓ Entrée ; clic = dossier
// Lot A §2 (25/10/2026) : derniers dossiers ouverts, par personne : utilisateurs/{uid}.recents (identifiants seulement, 8 au plus, le plus récent en
// tête ; jamais dans le navigateur : postes partagés) ; affichés seulement s'ils sont encore dans les dossiers de la personne
const recents = () => (Array.isArray(D.profil.recents) ? D.profil.recents : []).map((id) => D.patients.find((p) => p.id === id)).filter(Boolean).slice(0, 8);
function noterRecent(id) {
  if (!D.patients.some((p) => p.id === id)) return;
  const l0 = Array.isArray(D.profil.recents) ? D.profil.recents : [], l = [id].concat(l0.filter((z) => z !== id)).slice(0, 8);
  if (JSON.stringify(l) === JSON.stringify(l0)) return;
  D.profil.recents = l; setDoc(doc(db, "utilisateurs", D.u.uid), { recents: l }, { merge: true }).catch((e) => console.warn("derniers dossiers", e));
}
function rechercheTete() {
  const q = $("trQ"), z = $("trRes"); if (!q || !z) return; let sel = 0, L = [];
  if (D.membre.role === "comptable") { $("trPil").classList.add("cache"); if ($("trLoupe")) $("trLoupe").classList.add("cache"); return; }
  // R-B3 (19/10/2026) : téléphone : la loupe ouvre la recherche sur toute la largeur, clavier ouvert ; × ou Échap la ferment
  const ouvrirRech = (oui) => { $("tete").classList.toggle("rech-ouv", oui); if ($("trLoupe")) $("trLoupe").setAttribute("aria-expanded", oui ? "true" : "false"); if (oui) q.focus(); else { q.value = ""; z.classList.add("cache"); } };
  if ($("trLoupe")) $("trLoupe").onclick = () => ouvrirRech(!$("tete").classList.contains("rech-ouv"));
  if ($("trX")) $("trX").onclick = () => ouvrirRech(false);
  // Lot A §2 (25/10/2026) : sans rien taper, les 8 derniers dossiers ouverts par la personne (numéro, âge, téléphone) ; hors périmètre ou supprimé : absent
  const ligneRecent = (x, i) => { const a = age(x.P.ddn, D.t); return '<button type="button" role="option" class="' + (i === sel ? "on" : "") + '" data-id="' + esc(x.id) + '"><b>' + esc(x.r.nm) + "</b><small>" + esc([numDossier(x) ? "N° " + numDossier(x) : "", a != null ? a + " ans" : "", x.P.tel || ""].filter(Boolean).join(" · ")) + "</small></button>"; };
  const dessiner = () => { const m = sansAcc(q.value).split(/\s+/).filter(Boolean);
    if (!m.length) { L = document.activeElement === q ? recents() : []; sel = Math.min(sel, Math.max(0, L.length - 1));
      if (!L.length) { z.classList.add("cache"); return; } z.innerHTML = '<p class="tr-rec">Derniers dossiers ouverts</p>' + L.map(ligneRecent).join(""); z.classList.remove("cache"); return; }
    L = D.patients.filter((x) => { const hay = sansAcc(x.r.nm + " " + (numDossier(x) || "")), tel = String((x.P.tel || "") + " " + ((x.doc.identite || {}).tel2 || "")).replace(/\D/g, "");
      return m.every((w) => hay.indexOf(w) >= 0 || (/^\d{3,}$/.test(w) && tel.indexOf(w.replace(/^0/, "")) >= 0)); }).slice(0, 8);
    sel = Math.min(sel, Math.max(0, L.length - 1));
    z.innerHTML = L.length ? L.map((x, i) => '<button type="button" role="option" class="' + (i === sel ? "on" : "") + '" data-id="' + esc(x.id) + '"><b>' + esc(x.r.nm) + "</b><small>" + esc([numDossier(x) ? "N° " + numDossier(x) : "", x.r.ddn ? dfrA(x.r.ddn) : "", x.doc.etablissementId || ""].filter(Boolean).join(" · ")) + "</small></button>").join("") : "<p>Aucun patient.</p>";
    z.classList.remove("cache"); };
  const ouvrir = (id) => { q.value = ""; z.classList.add("cache"); q.blur(); $("tete").classList.remove("rech-ouv"); ouvrirDossier(id); };
  q.oninput = () => { sel = 0; dessiner(); };
  q.onkeydown = (ev) => { if (ev.key === "ArrowDown" || ev.key === "ArrowUp") { ev.preventDefault(); sel = Math.max(0, Math.min(L.length - 1, sel + (ev.key === "ArrowDown" ? 1 : -1))); dessiner(); }
    else if (ev.key === "Enter" && L[sel]) ouvrir(L[sel].id); else if (ev.key === "Escape") { q.value = ""; z.classList.add("cache"); $("tete").classList.remove("rech-ouv"); } };
  z.onmousedown = (ev) => { const b = ev.target.closest("[data-id]"); if (b) { ev.preventDefault(); ouvrir(b.dataset.id); } };
  q.onblur = () => setTimeout(() => z.classList.add("cache"), 150); q.onfocus = () => { sel = 0; dessiner(); };
}

// ───── Dossier patient (lecture) ─────
const ST_RDV = { prevu: ["Prévu", "b-co"], fait: ["Venu", "b-ch"], absent: ["Non venu", "b-al"], reporte: ["Reporté", "b-or"] };
// Onglet choisi par patient : gardé quand le dossier se réaffiche après un enregistrement, oublié quand on rouvre le dossier (route)
const ONGLET = {};
window.ongletDossier = (pid, k) => {
  ONGLET[pid] = k; const d = $("dos"); if (d) d.classList.toggle("t-pat", k === "pat"); // lot A §11 : téléphone, onglet Patient = la colonne Patient
  document.querySelectorAll(".o-barre [role=tab]").forEach((b) => { const on = b.id === "og-" + k; b.classList.toggle("on", on); b.setAttribute("aria-selected", on); });
  document.querySelectorAll(".o-pan").forEach((p) => p.classList.toggle("cache", p.id !== "op-" + k));
};
// Lot R-G (audit n° 5, 19/10/2026) : disposition du dossier. Cinq zones dans l'ordre du téléphone (bandeau, colonne Patient, centre Travail,
// colonne Documents, barre d'actions), plus le panneau de chimio / RT (R-G e) hors des zones redessinées. Ordinateur (zone de contenu ≥ 940 px,
// écran ≥ 640 px de haut) : grille qui tient dans l'écran, chaque colonne défile seule (CSS @container dos de v2.html) ; dessous : une colonne
// comme avant. Redessin : chaque zone remplacée seule, défilement de chaque zone, de la page et curseur gardés.
const DOS = { agrandi: false, droite: "pat" }; // Agrandir (le centre prend la colonne Documents) ; onglet de la colonne de droite (2 colonnes)
const lsLire = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
const lsEcrire = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* stockage indisponible : choix non gardé */ } };
// Parties de la colonne Patient : ouvertes ou non (choix de chacun, gardé sur l'appareil) ; départ = réglage du cabinet (Paramètres › Dossier
// patient › Affichage du dossier, R-G d)
const PARTIES_D = [["avenir", "Rendez-vous et tâches à venir"], ["id", "Identité et administratif"], ["med", "Informations médicales"], ["tum", "Fiche tumeur"], ["passe", "Historique des RDV"]]; // lot A §3 : ordre et nom
const partieOuverte = (k) => { const m = lsLire("onco360.dossierParties", {}); return k in m ? !!m[k] : !!(reglages().dossier.parties || {})[k]; };
window.dosPartie = (el) => { const m = lsLire("onco360.dossierParties", {}); if (!!m[el.dataset.p] === el.open && el.dataset.p in m) return; m[el.dataset.p] = el.open; lsEcrire("onco360.dossierParties", m); majToutDeplier(); };
const majToutDeplier = () => { const b = $("dpTout"), L = [...document.querySelectorAll(".dos-pat details.dp")]; if (b && L.length) b.textContent = L.every((d) => d.open) ? "Tout replier" : "Tout déplier"; };
window.dosTout = () => { const L = [...document.querySelectorAll(".dos-pat details.dp")], o = !L.every((d) => d.open), m = lsLire("onco360.dossierParties", {}); L.forEach((d) => { d.open = o; m[d.dataset.p] = o; }); lsEcrire("onco360.dossierParties", m); majToutDeplier(); };
// Colonne de droite à deux onglets (Patient / Documents) entre 940 et 1 279 px de zone de contenu
window.dosDroite = (k) => { DOS.droite = k; const d = $("dos"); if (!d) return; d.classList.toggle("d-docs", k === "docs"); d.querySelectorAll(".dos-sw button").forEach((b) => { const on = b.dataset.k === k; b.classList.toggle("on", on); b.setAttribute("aria-selected", on); }); if (k === "docs") rafraichirVisionneuse(d.dataset.pid); };
// Agrandir : le centre prend la place de la colonne Documents (gardé pour chacun)
window.dosAgrandir = () => { DOS.agrandi = !DOS.agrandi; lsEcrire("onco360.dossierAgrandi", DOS.agrandi); const d = $("dos"); if (d) d.classList.toggle("agrandi", DOS.agrandi); document.querySelectorAll(".dos-agr").forEach((b) => { b.title = DOS.agrandi ? "Réduire : rendre sa place à la colonne Documents" : "Agrandir : le centre prend la place de la colonne Documents"; b.setAttribute("aria-pressed", DOS.agrandi); }); if (!DOS.agrandi && d) rafraichirVisionneuse(d.dataset.pid); };
DOS.agrandi = !!lsLire("onco360.dossierAgrandi", false);
// Flèche du bandeau : replie le menu pour le dossier seulement (le choix d'ailleurs est gardé et remis en quittant le dossier)
// Lot A §10 (25/10/2026) : dans le dossier, menu en icônes par défaut (76 px ; déplié par la flèche seulement, plus au survol : 26/10/2026) ; le choix de la personne
// (flèche du menu, onco360.menuReplieDossier) reste gardé
const menuDossier = (dans) => { document.body.classList.toggle("dans-dossier", !!dans); if (window.innerWidth < 1024) return; const g = lsLire("onco360.menuReplie", 0) === 1, m = lsLire("onco360.menuReplieDossier", null); document.body.classList.toggle("menu-replie", dans ? (m != null ? m === 1 : true) : g); };
window.dosMenu = () => { const oui = !document.body.classList.contains("menu-replie"); lsEcrire("onco360.menuReplieDossier", oui ? 1 : 0); document.body.classList.toggle("menu-replie", oui); { const r = $("btReplier"), t = oui ? "Déplier le menu" : "Replier le menu"; r.title = t; r.setAttribute("aria-label", t); }  };
// Photo du bandeau (40 px) : agrandie au clic ; « Changer ou retirer la photo » (droit « identité ») comme avant
window.dosPhoto = (id) => {
  const x = D.patients.find((p) => p.id === id); if (!x) return;
  if (!(x.doc.identite || {}).photo) { if (peut("identite")) window.photoPatient(id); return; }
  fenetre("<h3>" + esc(x.r.nm) + '</h3><div class="photo-pf">' + bulle(x, "ph-grand") + '</div><div class="boutons">' + (peut("identite") ? '<button class="bt clair" style="margin-right:auto" onclick="photoPatient(\'' + x.id + '\')">Changer ou retirer la photo</button>' : "") + '<button class="bt gris" onclick="fermerFenetre()">Fermer</button></div>');
};
// Mode grille (ordinateur) : décidé par le CSS (requêtes de conteneur)
// 19/10/2026 : textes d'explication (classe « aide ») cachés dans le dossier et le panneau ; « ? » les affiche ou les cache
window.voirAides = () => document.body.classList.toggle("voir-aides");
const grilleDossier = () => { const d = $("dos"); return !!d && getComputedStyle(d).display === "grid"; };

const AV_TOUT = new Set(), PA_TOUT = new Set(); // T4 / lot A : « Rendez-vous et tâches à venir », « Historique des RDV » dépliés en entier (pour la session)
window.voirAvTout = (id) => { if (AV_TOUT.has(id)) AV_TOUT.delete(id); else AV_TOUT.add(id); pageDossier(id); };
window.voirPaTout = (id) => { if (PA_TOUT.has(id)) PA_TOUT.delete(id); else PA_TOUT.add(id); pageDossier(id); };
const RUB = {}; // lot A §3 : listes complètes des rubriques « à venir » et « Historique des RDV », par dossier (dernier affichage)
function pageDossier(id) {
  const x = D.patients.find((p) => p.id === id);
  $("page").classList.add("p-dos");
  if (!x) { $("page").classList.remove("p-dos"); $("page").innerHTML = '<a class="retour" href="#patients">' + ic("retour") + "Patients</a><div class=\"carte\"><h3>Dossier introuvable</h3><p class=\"sous\">Ce patient n'existe pas ou n'est pas dans vos établissements.</p></div>"; return; }
  const { P, r } = x, ctx = D.ctx, t = D.t, a = age(P.ddn, t), qx = "'" + x.id + "'";
  // Bandeau réduit du téléphone : nom, âge, allergie dans la barre du haut (collée)
  // Lot A §1 / lot E (25/10/2026) : le nom du patient une seule fois (bloc patient) ; la barre du haut ramène à la liste
  $("titrePage").innerHTML = '<a class="retour tp-ret" href="#patients" title="Liste des patients">' + ic("retour") + "Patients</a>";
  const okN = traitMod();
  const dn = dernieresNouvelles(P, datesConsultations(x.id), t), alTxt = String(P.allergies || "").trim();

  // ───── Lot A §1 (25/10/2026, demande de Dr Bentahila) : bloc patient en haut de la colonne Patient (plus de bandeau sur toute la largeur) :
  // photo (agrandie au clic), nom et « ⋯ » (Journal : titulaire, comme avant) ; « N° · date de naissance (âge) · hôpital » ; pastilles Chimio et RT
  // en cours (non cliquables), statut du patient ; allergie si elle est renseignée. Le reste de l'ancien bandeau : dans « Identité et administratif ».
  // Afficher et Modifier du haut : retirés (clic sur le titre d'une rubrique). Réglages « En-tête du dossier » d'avant : ignorés (gardés).
  const enCh = r.t && r.t.st === "cours", enRT = (r.rtS || []).some((s) => s.st === "cours"), num = numDossier(x);
  const mBp = D.espaceDoc && D.espaceDoc.titulaire === D.u.uid ? ['<button class="mini" onclick="auditPatient(' + qx + ')" title="Journal d\'audit de ce dossier : qui l\'a ouvert, modifié…">Journal</button>'] : [];
  if (peut("supprimerPatient")) mBp.push('<button class="mini rouge-t" onclick="dosSupprimer(' + qx + ')">Supprimer le patient</button>');
  const ban = '<div class="bp">' +
    '<button type="button" class="bn-ph" onclick="' + (!P.photo && peut("identite") ? "photoPatient" : "dosPhoto") + "(" + qx + ')" title="' + (P.photo ? "Agrandir la photo" : peut("identite") ? "Ajouter une photo du patient" : "Photo du patient") + '" aria-label="Photo du patient">' + bulle(x, "ph-ban") + "</button>" +
    '<div class="bp-id"><div class="bp-l1"><h2>' + esc(r.nm) + "</h2>" + menuPts(mBp) + "</div>" +
    '<div class="bn-m">' + esc([num ? "N° " + num : "", P.ddn ? dfrA(P.ddn) + (a != null ? " (" + a + " ans)" : "") : a != null ? a + " ans" : "", x.doc.etablissementId || ""].filter(Boolean).join(" · ")) + "</div>" +
    '<div class="bn-bd">' + (P.statut ? '<span class="badge ' + (P.statut === "decede" ? "b-dc" : P.statut === "perdu" ? "b-or" : "b-gr") + '">' + esc(libStatut(P.statut)) + (P.statut === "decede" && P.decesLe ? " le " + dfrA(P.decesLe) : "") + "</span>" : "") +
      (enCh ? '<span class="badge b-co" title="Chimiothérapie en cours : ' + esc(r.t.nom || "") + '">Chimio' + (r.t.nb ? " C" + (r.t.k || r.t.nb) + "/" + r.t.nb : "") + "</span>" : "") +
      (enRT ? '<span class="badge b-rt">RT en cours</span>' : "") + '<span id="presSlot"></span></div>' +
    (allergique(P) ? '<span class="badge b-al bn-al" title="' + esc("Allergie" + (alTxt ? " : " + alTxt : " (détail non précisé)")) + '">' + ic("alerte") + "Allergie" + (alTxt ? " : " + esc(alTxt.length > 40 ? alTxt.slice(0, 38) + "…" : alTxt) : "") + "</span>" : "") + "</div></div>";

  // ───── Colonne Patient : résumé, prochain rendez-vous, parties dépliables ─────
  // ───── Lot A §8 et §8 bis (25/10/2026, demande de Dr Bentahila) : rendez-vous, séances et tâches en petites cartes d'une ou deux lignes.
  // Ligne 1 : jour, date et heure ; petite icône du type ; type en gras ; « ⋯ » à droite = toutes les actions d'avant, mêmes droits (rappel WhatsApp
  // avec son aperçu, Séance, Venu, prix, reçu, Modifier, Supprimer…), le statut et le prix en tête du menu. Ligne 2, en petit et en gris : le
  // protocole ou le sous-titre (coupé, texte entier au survol). Restent visibles : « À valider » / « À encaisser » (orange), un rappel WhatsApp déjà
  // envoyé (petite coche verte), Férié ou absence du médecin. 3 cartes, puis « Voir plus » ; la liste complète : clic sur le titre (au centre).
  const okR = peut("rendezvous"), b = (lib, fn) => '<button class="mini" onclick="' + fn + '">' + lib + "</button>";
  const info = (tx) => '<div class="pts-info">' + esc(tx) + "</div>"; // ligne d'information du menu « ⋯ » (statut, prix)
  const waMenu = (cat, d, h) => { if (!cat || !fnOn("agenda.whatsapp")) return ""; const okT = !!numeroWA(P.tel);
    return '<button class="mini"' + (okT ? "" : ' disabled title="Pas de numéro de téléphone dans le dossier"') + " onclick=\"envoyerWA('" + x.id + "','" + cat + "','" + d + "','" + (h || "") + "')\">" + (rappelDe(x, d, cat) ? "Renvoyer le rappel WhatsApp" : "Rappel WhatsApp") + "</button>"; };
  const waEnv = (cat, d) => !!(cat && fnOn("agenda.whatsapp") && rappelDe(x, d, cat));
  const JS3 = ["Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."], jourC = (d) => (d ? JS3[new Date(d + "T12:00:00Z").getUTCDay()] + " " + dfr(d) : "—");
  // 26/10/2026 (demande de Dr Bentahila) : dans la colonne Patient, une ligne par rendez-vous, séance ou tâche : « Lun. 26/10 · 08:30 », icône, nom
  // court (Séance chimio, RT hebdo, Suivi, Annonce, Contrôle… comme la salle d'attente), puis le détail en gris coupé à la largeur (texte entier au
  // survol) ; mêmes repères (À valider, retard, férié, rappel envoyé) et même « ⋯ ». La carte complète reste au centre (clic sur le titre).
  const ligne = (o, passe) => { const ty = o.ty || o.t, q = [o.t === ty ? "" : o.t, o.s].filter(Boolean).join(" · ");
    return '<div class="rc rl' + (passe ? " passe" : "") + (o.retard ? " retard" : "") + '"><span class="rc-d">' + (passe ? (o.d ? dfrA(o.d) : "—") : jourC(o.d) + (o.f && o.f !== o.d ? " → " + dfr(o.f) : "")) + (o.h ? " · " + esc(o.h) : "") + "</span>" +
      (o.em ? '<span class="rc-em">' + o.em + "</span>" : "") + '<span class="rl-t" title="' + esc([ty, q].filter(Boolean).join(" · ")) + '"><span class="rl-ty">' + esc(ty) + "</span>" + (q ? '<span class="rl-q"> · ' + esc(q) + "</span>" : "") + "</span>" +
      (o.env ? '<span class="rc-wa" title="Rappel WhatsApp envoyé">' + ic("check") + "</span>" : "") + (o.al ? '<span class="rc-al">' + esc(o.al) + "</span>" : "") + (o.av ? '<span class="rc-av">' + esc(o.av) + "</span>" : "") + menuPts((o.m || []).filter(Boolean)) + "</div>"; };
  // 26/10/2026 (2e demande) : au centre (clic sur le titre de la rubrique), une carte d'une seule ligne sur toute la largeur : « Lun. 02/11 · 10:00 »,
  // icône, « C1 J22 · consultation » puis le motif ou le protocole en gris (coupé à la largeur, texte entier au survol)
  const large = (o, passe) => { const q = [o.t, o.s].filter(Boolean).join(" · ");
    return '<div class="rc rg' + (passe ? " passe" : "") + (o.retard ? " retard" : "") + '"><span class="rc-d">' + (passe ? (o.d ? dfrA(o.d) : "—") : jourC(o.d) + (o.f && o.f !== o.d ? " → " + dfr(o.f) : "")) + (o.h ? " · " + esc(o.h) : "") + "</span>" +
      (o.em ? '<span class="rc-em">' + o.em + "</span>" : "") + '<span class="rl-t" title="' + esc(q) + '"><span class="rl-ty">' + esc(o.t || "") + "</span>" + (o.s ? '<span class="rl-q"> · ' + esc(o.s) + "</span>" : "") + "</span>" +
      (o.env ? '<span class="rc-wa" title="Rappel WhatsApp envoyé">' + ic("check") + "</span>" : "") + (o.al ? '<span class="rc-al">' + esc(o.al) + "</span>" : "") + (o.av ? '<span class="rc-av">' + esc(o.av) + "</span>" : "") + menuPts((o.m || []).filter(Boolean)) + "</div>"; };
  const NB = 3; // cartes visibles avant « Voir plus »
  const aVenir = (v) => (v.st || "prevu") === "prevu" && (v.f || v.d) >= t;
  const av = [];
  // Prix à encaisser (consultations validées, chimio comprise) : droit « encaissements »
  const EN = peut("encaissements") ? encaissementsDe(x, () => { if (D.page === "dossier/" + encodeURIComponent(x.id)) pageDossier(x.id); }) : null;
  // Séance de chimio à venir : « Consultation : venu » (fenêtre de prix : J1 consultation de chimio, J8, J15… 0), Séance (la cure), Modifier (date
  // et heure) ; la date ne se change pas ici (protocole de la ligne). T4 (24/10/2026, audit n° 11 U21) : le bouton valide la consultation, pas la séance
  const menuChimio = (c) => {
    const m = [], v = EN && EN.cons && EN.cons[c.lid + "|" + c.n + "|" + c.j], qv = "'" + x.id + "','" + c.lid + "'," + c.n + "," + c.j, li = (P.lignes || []).findIndex((L) => L.id === c.lid);
    if (v) { m.push(info("Consultation : venu · " + (v.m != null ? fmtMil(v.m) + " DH" : "—"))); if (peut("finances") || prixParServeur()) m.push(b("Modifier le prix", "chVenuChimio(" + qv + ")")); if (peut("finances")) m.push(b("Annuler le statut", "chAnnulerVenuChimio(" + qv + ")")); }
    else if ((peut("finances") || prixParServeur()) && c.d <= D.t) m.push(b("Consultation : venu", "chVenuChimio(" + qv + ")"));
    if (li >= 0 && (traitMod() || peut("planningChimio") || peut("administrer") || voit("traitements"))) m.push(b("Séance", "chOuvrir('" + x.id + "'," + li + "," + (c.n - 1) + "," + c.j + ")"));
    if (traitMod() || peut("planningChimio") || peut("administrer")) m.push(b("Modifier", "chModifierRdvChimio('" + x.id + "','" + c.lid + "'," + c.n + "," + c.j + ")"));
    return m;
  };
  // 12/10/2026 : heure de la consultation de la séance (l'infirmière : sa séance à l'hôpital de jour)
  const inf = D.membre.role === "infirmiere";
  chimioAVenir(JSON.parse(JSON.stringify(P)), ctx).forEach((c) => {
    const ret = /en retard/.test(c.lib), hh = inf && c.hr && c.hr.h ? c.hr : c.hc, h = (hh && hh.h) || "";
    const mm = String(c.lib).match(/^Chimio · (.*) · (C\d+(?: J\d+)?)(?: \(en retard\))?$/), cure = mm ? mm[2] : c.lib.replace(/^Chimio · /, "").replace(/ \(en retard\)$/, "");
    const quoi = inf && c.hr && c.hr.h ? "séance" + (c.hc && !c.hc.auto ? " (consultation " + c.hc.h + ")" : "") : c.hc ? "consultation" : "";
    av.push({ d: c.d, h, rdv: 1, em: ic("seringue"), ty: "Séance chimio", t: cure + (quoi ? " · " + quoi : "") + (ret ? " · en retard" : ""), s: mm ? mm[1] : "", retard: ret, env: !ret && waEnv("chimio", c.d), m: (ret ? [] : [waMenu("chimio", c.d, h)]).concat(c.lid ? menuChimio(c) : []) });
  });
  if (voitRdv()) (P.rdvs || []).forEach((v) => {
    if (!aVenir(v)) return; const q = "'" + x.id + "','" + v.id + "'", cat = catRdv(v), m = [waMenu(cat, v.d, v.h || "")];
    if (okR) { if (v.d <= D.t) m.push(b("Venu", "statutRdv(" + q + ",'fait')"), b("Non venu", "statutRdv(" + q + ",'absent')")); m.push(b("Modifier", "ouvrirRdv(" + q + ")"), b("Supprimer", "statutRdv(" + q + ",'supprimer')")); }
    av.push({ d: v.d, f: v.f, h: v.h || "", rdv: 1, em: typeRdv(v.type) === "hospit" ? '<svg class="pi"><use href="#i-hopital"/></svg>' : ic("stetho"), ty: typeCourtSalle(v)[0], t: libRdv(v), s: [v.mo, v.n].filter(Boolean).join(" – "), env: waEnv(cat, v.d), m, rep: v.rep });
  });
  // Tâches ouvertes du patient (P4, 08/10/2026), dont « Valider la dosimétrie » qui remplace ici la ligne de dosimétrie ; Réattribuer : dans la fiche (Ouvrir)
  (module("taches") ? tachesDuPatient(x.id) : []).forEach((tk) => {
    const dr = droitsTache(tk), q = "'" + tk.id + "'", m = [b("Ouvrir", "taVoir(" + q + ")")];
    if (dr.mod) m.push(b("Modifier", "taModifier(" + q + ")"), b("Marquer faite", "taStatut(" + q + ",'fait')"));
    if (dr.sup) m.push(b("Supprimer", "taSupprimer(" + q + ")"));
    av.push({ d: tk.ech || "", h: tk.h || "", em: ic("taches"), ty: "Tâche", t: "Tâche – " + tk.titre, s: "Pour " + (tk.pour === D.u.uid ? "vous" : tk.pourNom || "?") + (tk.statut === "encours" ? " · en cours" : ""), retard: !!tk.ech && tk.ech < D.t, m });
  });
  // Inscriptions en RCP non faites (09/10/2026, rcp.js) : visibles jusqu'à ce que la case « Fait » soit cochée
  (module("rcp") ? rcpDuPatient(x.id) : []).forEach((v) => av.push({ d: v.d, h: "", em: ic("rcp"), ty: "RCP", t: "RCP" + (v.d < D.t ? " · décision à saisir" : ""), s: v.q, retard: v.d < D.t, m: [b("Ouvrir", "rcpHistorique('" + x.id + "')")] }));
  // 12/10/2026 : fin de radiothérapie (prévue ou réelle) et consultation de fin affichées toutes les deux (décision de Dr Bentahila) ; scanner et
  // 1re séance : date et heure modifiables
  if (voitRTdossier(x)) (r.rt || []).filter((v) => !v.dosi).forEach((v) => {
    const fin = /Fin de radioth/.test(v.lib), m = fin ? [] : [waMenu("rt", v.d, v.h || "")];
    if (fin ? v.z === "fin" && traitModRT() : (v.z === "scan" || v.z === "deb") && traitModRT()) m.push(b("Modifier", "modifierEtapeRT('" + x.id + "','" + v.rt + "','" + v.z + "')"));
    av.push({ d: v.d, f: v.f, h: v.h || "", rdv: 1, em: ic("radiation"), ty: v.z === "scan" ? "Scanner RT" : v.z === "deb" ? "Début RT" : fin ? "Dernière séance RT" : "", t: v.lib.replace(/^RT · /, ""), env: !fin && waEnv("rt", v.d), m });
  });
  // 26/10/2026 (demande de Dr Bentahila) : la consultation d'un jour de chimiothérapie reçu reste ici tant qu'elle n'est pas validée (« Consultation :
  // venu ») ; elle passe dans l'historique à sa validation, plus à celle de la cure
  const consAttente = {};
  if (voitRdv() && peut("encaissements") && EN !== undefined) (P.lignes || []).forEach((L) => { let pn = ""; try { pn = protocoleDe(L, D.ctx.bib).nom; } catch (er) { return; }
    etatLigne(L, P, D.ctx).forEach((e) => { if (e.st !== "recue") return;
      [{ j: 1, d: e.c.reelle }].concat(seancesCure(L, e, D.ctx.bib).filter((z) => z.st === "recue").map((z) => ({ j: z.j, d: z.d }))).forEach((z) => {
        const k = L.id + "|" + e.n + "|" + z.j; if (((EN && EN.cons) || {})[k] || !(z.d >= "2026-10-07")) return; consAttente[k] = 1;
        av.push({ d: z.d || "", h: "", rdv: 1, em: ic("seringue"), ty: "Séance chimio", t: "C" + e.n + " J" + z.j + " · consultation", s: pn, av: "À valider", m: menuChimio({ lid: L.id, n: e.n, j: z.j, d: z.d || "" }) }); }); }); });
  av.sort((p, q) => (p.d + (p.h || "00")).localeCompare(q.d + (q.h || "00")));
  av.forEach((v) => { v.al = absenceLe(v.d) ? absentMedecin(medecinFiche().genre) : ferieLe(v.d) ? "Férié" : ""; if (v.rep && v.rep.length) v.s = [v.s, "Reporté (initialement le " + dfrA(v.rep[0].d) + ")"].filter(Boolean).join(" · "); });
  const cAv = av.map((v) => large(v)), lAv = av.map((v) => ligne(v)), toutAv = AV_TOUT.has(x.id);
  const hAvenir = (decede(P) && av.some((v) => v.d >= t) ? '<p class="al-band dc">Patient décédé' + (P.decesLe ? " le " + dfrA(P.decesLe) : "") + " : " + av.filter((v) => v.d >= t).length + " rendez-vous, séance(s) ou tâche(s) encore prévus, à annuler.</p>" : "") +
    '<div class="rc-liste rl-liste" id="rdvListe">' + (av.length ? lAv.slice(0, toutAv ? av.length : NB).join("") + (av.length > NB ? '<button class="lien rc-plus" onclick="voirAvTout(\'' + x.id + '\')">' + (toutAv ? "Voir moins" : "Voir plus (" + (av.length - NB) + ")") + "</button>" : "") : '<p class="sous">Aucun rendez-vous ni tâche à venir.</p>') + "</div>";
  // « Prochain rendez-vous » retiré le 26/10/2026 (demande de Dr Bentahila : doublon de « Rendez-vous et tâches à venir »)

  // Historique des RDV (ancien « Consultations et hospitalisations ») : passés ou déjà validés (venu / non venu), avec le prix (droit « encaissements »)
  let hPasse = "", nPasse = 0, nAValider = 0, cPasse = [], lPasse = [];
  if (voitRdv()) {
    // Prix d'un rendez-vous validé : « Prix : … » en tête du menu, puis Fixer / Modifier le prix, Encaisser, Imprimer le reçu ; renvoie « À valider »
    // (prix pas encore fixé), « À encaisser » ou rien
    const prixM = (v, m) => {
      if (EN && v.st === "absent") { m.push(info("Prix : 0 DH (non venu, rien à encaisser)")); return ""; }
      if (!EN || v.st !== "fait") return "";
      if (v.type === T_RTC) { m.push(info("Prix : 0 DH (compris dans l'acte de radiothérapie)")); return ""; }
      const o = (EN.rdv || {})[v.id], hs = typeRdv(v.type) === "hospit", q2 = "'" + x.id + "','" + v.id + "'";
      if (!o) { m.push(info("Prix : non validé (fixé quand on valide « Venu »)")); if (peut("finances") || prixParServeur()) m.push(b("Fixer le prix", "prixRdv(" + q2 + ")")); return "À valider"; }
      const nj = hs ? joursH(v) : 0, mt = o.tj != null ? o.tj * (nj || 1) : o.b != null ? o.b : o.m; // b : brut d'un prix repris de l'ancienne application
      const np = aEncaisser(o.mode);
      m.push(info("Prix : " + fmtMil(mt) + " DH" + (o.tj != null && nj > 1 ? " (" + nj + " j × " + fmtMil(o.tj) + ")" : "") + (np ? (o.mode === "np" ? " · non payé" : " · à encaisser") : o.mode ? " · payé " + (((MODES.find((z) => z[0] === o.mode) || [])[2]) || "") : "")));
      if (np && (peut("finances") || prixParServeur())) m.push(b("Encaisser", "prixRdv(" + q2 + ",true)")); else if (peut("finances") || (prixParServeur() && !o.v1)) m.push(b("Modifier le prix", "prixRdv(" + q2 + ")"));
      if (o.mode && !np && o.m > 0) m.push(b("Imprimer le reçu", "recuRdv(" + q2 + ")"));
      return np ? "À encaisser" : "";
    };
    // Statut d'un rendez-vous passé : à valider = Venu / Non venu, puis Modifier / Supprimer ; déjà validé = Annuler le statut
    const statutM = (v, m, autres) => { const q = "'" + x.id + "','" + v.id + "'";
      if ((v.st || "prevu") !== "prevu") { m.push(info("Statut : " + (ST_RDV[v.st] || [v.st])[0])); if (okR && annulable(v)) m.push(b("Annuler le statut", "statutRdv(" + q + ",'prevu')")); return ""; }
      m.push(info("Statut : à valider")); if (okR && v.d <= D.t) m.push(b("Venu", "statutRdv(" + q + ",'fait')"), b("Non venu", "statutRdv(" + q + ",'absent')"));
      if (okR) autres.push(b("Modifier", "ouvrirRdv(" + q + ")"), b("Supprimer", "statutRdv(" + q + ",'supprimer')"));
      return "À valider"; };
    const lignes = (P.rdvs || []).filter((v) => !aVenir(v)).map((v) => ({ d: v.d, h: v.h || "", v }));
    // Jours de chimio reçus (J1, J8…) depuis le 07/10/2026, et tous ceux validés « Venu » (avec leur prix)
    const vus = {};
    (P.lignes || []).forEach((L) => { let pn = ""; try { pn = protocoleDe(L, D.ctx.bib).nom; } catch (er) { return; }
      etatLigne(L, P, D.ctx).forEach((e) => { if (e.st !== "recue") return;
        [{ j: 1, d: e.c.reelle }].concat(seancesCure(L, e, D.ctx.bib).filter((z) => z.st === "recue").map((z) => ({ j: z.j, d: z.d }))).forEach((z) => {
          const k = L.id + "|" + e.n + "|" + z.j, val = EN && EN.cons && EN.cons[k]; vus[k] = 1;
          if (!consAttente[k] && (val || z.d >= "2026-10-07")) lignes.push({ d: z.d || "", h: "", c: { lid: L.id, n: e.n, j: z.j, lib: pn, v: val } }); }); }); });
    if (EN) Object.entries(EN.cons || {}).forEach(([k, val]) => { if (vus[k]) return; const p3 = k.split("|"); lignes.push({ d: val.d || "", h: "", c: { lid: p3[0], n: +p3[1], j: +p3[2], lib: val.lib, v: val } }); });
    lignes.sort((p, q) => (q.d + q.h).localeCompare(p.d + p.h)); nPasse = lignes.length;
    nAValider = lignes.filter((z) => (z.v && (z.v.st || "prevu") === "prevu") || (z.c && !z.c.v)).length; // repère orange sur la partie repliée
    const oPasse = lignes.map(({ v, c, d }) => {
      if (c) { const qc = "'" + x.id + "','" + c.lid + "'," + c.n + "," + c.j, m = []; let aV = "";
        if (c.v) { const ae = aEncaisser(c.v.mode);
          m.push(info("Statut : venu"), info("Prix : " + (c.v.m != null ? fmtMil(c.v.m) + " DH" : "—") + (ae ? " · à encaisser" : "")));
          if (ae && payeCabinet(x) && (peut("finances") || prixParServeur())) m.push(b("Encaisser", "chVenuChimio(" + qc + ",true)"));
          if (c.v.mode && !ae && c.v.m > 0) m.push(b("Imprimer le reçu", "recuCons('" + x.id + "','" + c.lid + "|" + c.n + "|" + c.j + "')"));
          // 25/10/2026 (demande de Dr Bentahila) : « Modifier le prix » aussi pour le médecin (il n'avait que « Annuler le statut »)
          if (peut("finances") || prixParServeur()) m.push(b("Modifier le prix", "chVenuChimio(" + qc + ")")); if (peut("finances")) m.push(b("Annuler le statut", "chAnnulerVenuChimio(" + qc + ")"));
          if (ae) aV = "À encaisser"; }
        else { m.push(info("Statut : à valider")); if (peut("finances") || prixParServeur()) m.push(b("Venu", "chVenuChimio(" + qc + ")")); aV = "À valider"; }
        return { d, em: ic("seringue"), ty: "Séance chimio", t: "Chimiothérapie · C" + c.n + " J" + c.j, s: c.lib || "", av: aV, m }; }
      const mS = [], mP = [], mA = [], aS = statutM(v, mS, mA), aP = prixM(v, mP);
      return { d: v.d, h: v.h || "", em: typeRdv(v.type) === "hospit" ? '<svg class="pi"><use href="#i-hopital"/></svg>' : ic("stetho"), ty: typeCourtSalle(v)[0], t: libRdv(v), s: [v.mo ? "Motif : " + v.mo : "", v.n || "", v.rep && v.rep.length ? "Reporté (initialement le " + dfrA(v.rep[0].d) + ")" : ""].filter(Boolean).join(" · "), av: aS || aP, m: mS.concat(mP, mA) };
    });
    cPasse = oPasse.map((o) => large(o, true)); lPasse = oPasse.map((o) => ligne(o, true));
    const toutPa = PA_TOUT.has(x.id);
    hPasse = (EN === undefined ? '<p class="mesures">Chargement des prix…</p>' : "") + '<div class="rc-liste rl-liste">' +
      (lPasse.length ? lPasse.slice(0, toutPa ? lPasse.length : NB).join("") + (cPasse.length > NB ? '<button class="lien rc-plus" onclick="voirPaTout(\'' + x.id + '\')">' + (toutPa ? "Voir moins" : "Voir plus (" + (cPasse.length - NB) + ")") + "</button>" : "") : '<p class="vide-c">Aucun rendez-vous passé.</p>') + "</div>";
  }
  // Listes complètes, ouvertes au centre par un clic sur le titre de la rubrique (lot A §3)
  RUB[x.id] = { avenir: cAv.join("") || '<p class="sous">Aucun rendez-vous ni tâche à venir.</p>', passe: cPasse.join("") || '<p class="vide-c">Aucun rendez-vous passé.</p>' };
  // Fiche : chaque partie montre tous ses champs (lecture), « Modifier » ouvre le même éditeur qu'avant
  // Lot A §1 : médecin du patient (plusieurs médecins) et dernières nouvelles, avant dans le bandeau : dans « Identité et administratif »
  const lig = (k, lib, v) => '<div data-champ="' + k + '"><label>' + esc(lib) + "</label><b>" + esc(v) + "</b></div>";
  // 26/10/2026 (Dr Bentahila : « l'ordre défini dans le paramétrage n'est pas appliqué ») : les sous-parties des informations médicales prennent leur
  // place dans l'ordre réglé de la fiche (avant : toujours en tête, puis OMS, taille, poids…)
  const im = infosMed.htmlColonne(x);
  const fiche = ficheP.partiesLecture(x, { rendu: { med: im.parK }, vide: { med: (k) => infosMed.nonRenseigne(x, k) }, plus: { id: (multiMed() ? lig("medecin", "Médecin du patient", nomMed(medPatient(x) || titulaireUid()) || "—") : "") + (dn ? lig("_dn", "Dernières nouvelles", dfrA(dn)) : "") } });

  // Lot A §3 (25/10/2026) : la flèche déplie ou replie sur place ; le titre ouvre la rubrique en grand, à la place du centre (liste complète ou
  // formulaire entier) ; plus de « Modifier » sous les rubriques
  // 26/10/2026 (demande de Dr Bentahila) : titre dans une bulle de couleur, sans le nombre d'éléments (n gardé dans l'appel, plus affiché) ; contenu
  // décalé à droite sous le titre
  const partie = (k, lib, n, corps, av) => '<details class="dp" data-p="' + k + '"' + (partieOuverte(k) ? " open" : "") + ' ontoggle="dosPartie(this)"><summary><button type="button" class="dp-t" onclick="dosRubrique(' + qx + ",'" + k + '\')" title="Ouvrir en grand">' + lib + "</button>" + (av ? '<span class="badge b-or dp-av">' + av + " à valider</span>" : "") + '</summary><div class="dp-c">' + corps + "</div></details>";
  const pat = (allergique(P) ? "" : !P.allergie && alTxt && !/^aucune?\b/i.test(alTxt) ? '<p class="mesures dp-al">Allergies notées (« ' + esc(alTxt.slice(0, 60)) + ' ») : précisez « Allergie connue : oui / non » dans Informations médicales (clic sur le titre) pour le bloc patient.</p>' : "") +
    '<div class="resume"><div class="entete"><label for="nTxt" style="flex:1">Résumé du patient</label>' + (okN ? '<span class="mesures" id="nEtat">' + (NOTES.pid === x.id && NOTES.txt != null ? "Modifications en cours…" : "") + "</span>" : "") + "</div>" +
    (okN ? '<textarea id="nTxt" class="notes" placeholder="Quelques phrases de résumé : histoire, antécédents, points d\'attention…" oninput="notesSaisie(\'' + x.id + '\',this);hauteurResume(this)" onblur="sauverNotesMaintenant()">' + esc(NOTES.pid === x.id && NOTES.txt != null ? NOTES.txt : P.notes || "") + "</textarea>"
      : (P.notes ? '<div class="notes lecture">' + esc(P.notes) + "</div>" : '<p class="sous">Aucun résumé.</p>')) + "</div>" +
    '<div class="dp-outils"><button type="button" class="mini" id="dpTout" onclick="dosTout()">Tout déplier</button></div>' +
    // Lot A §3 : « Historique des RDV » (ancien « Consultations et hospitalisations ») en dernier, après la fiche tumeur
    PARTIES_D.map(([k, lib]) => (k === "avenir" ? partie(k, lib, av.length, hAvenir) : k === "passe" ? (voitRdv() ? partie(k, lib, nPasse, hPasse, nAValider) : "")
      : fiche[k] ? partie(k, lib === "Identité et administratif" ? lib : fiche.libs[k] || lib, fiche.n[k], fiche[k]) : "")).join("");

  // ───── Centre Travail : Consultation · Chimiothérapie · Radiothérapie · Documents, selon les droits ─────
  const ong = [];
  // Consultation : tout le monde (l'infirmière en lecture seule, décision du 07/10/2026)
  { const hc = htmlConsultations(x); ong.push({ k: "co", ic: "stetho", lib: "Consultation", court: "Consult.", n: nbConsultations(x), h: hc }); }
  // Chimiothérapie
  if (voit("traitements")) ong.push({ k: "ch", ic: "seringue", lib: "Chimiothérapie", court: "Chimio", n: (P.lignes || []).length, h: htmlChimio(x) || '<p class="vide-c">Aucune ligne de chimiothérapie.</p>' });
  // Radiothérapie
  // (l'infirmière, radiothérapie « patients sous chimio » ailleurs, voit l'onglet en lecture pour tous ses patients : 07/10/2026)
  const okRT = traitModRT(), voitRT = voitRTdossier(x) || D.membre.droits.radiotherapie === "chimio";
  if (peut("documents")) docsDe(x, () => { if (D.page === "dossier/" + encodeURIComponent(x.id)) pageDossier(x.id); }); // documents RT enregistrés (boutons cochés)
  if (voitRT) ong.push({ k: "rt", ic: "radiation", lib: "Radiothérapie", court: "RT", n: (P.rts || []).length, h: htmlRT(x, okRT) });
  // Documents (droit « documents », 08/10/2026) : fichiers déposés (PDF, Word, photos…), voir fichiers.js
  const okDoc = peut("documents") && fnOn("documents.depot");
  if (okDoc) { const hf = htmlFichiers(x); ong.push({ k: "doc", ic: "document", lib: "Documents", court: "Docs", n: nbFichiers(x), h: hf }); }
  // Le dossier s'ouvre sur Consultation (sur Chimiothérapie pour l'infirmière) ; l'onglet choisi reste affiché quand le
  // dossier se réaffiche après un enregistrement
  let trav = "";
  if (ong.length) {
    const act = [ONGLET[x.id], D.membre.role === "infirmiere" ? "ch" : "co"].find((k) => ong.some((o) => o.k === k)) || ong[0].k, actT = ONGLET[x.id] === "pat" ? "pat" : act; // lot A §11 : onglet Patient (téléphone)
    trav = '<section class="carte onglets"><div class="o-barre" role="tablist" aria-label="Dossier">' + ong.map((o) => '<button role="tab" id="og-' + o.k + '" aria-controls="op-' + o.k + '" aria-selected="' + (o.k === actT) + '"' + (o.k === actT ? ' class="on"' : "") + ' onclick="ongletDossier(\'' + x.id + "','" + o.k + '\')"><svg class="pi" aria-hidden="true"><use href="#i-' + o.ic + '"/></svg>' + '<span class="lg">' + o.lib + '</span><span class="sm">' + o.court + "</span>" + (o.n ? '<span class="n">' + o.n + "</span>" : "") + "</button>" +
        (o.k === ong[0].k ? '<button role="tab" id="og-pat" class="og-pat' + (actT === "pat" ? " on" : "") + '" aria-selected="' + (actT === "pat") + '" onclick="ongletDossier(\'' + x.id + '\',\'pat\')">' + ic("profil") + '<span class="lg">Patient</span><span class="sm">Patient</span></button>' : "")).join("") +
      (okDoc ? '<button type="button" class="dos-agr" onclick="dosAgrandir()" aria-pressed="' + DOS.agrandi + '" title="' + (DOS.agrandi ? "Réduire : rendre sa place à la colonne Documents" : "Agrandir : le centre prend la place de la colonne Documents") + '" aria-label="Agrandir le centre">' + ic("agrandir") + "</button>" : "") + "</div>" +
      ong.map((o) => '<div class="o-pan' + (o.k === act ? "" : " cache") + '" id="op-' + o.k + '" role="tabpanel" aria-labelledby="og-' + o.k + '">' + o.h + "</div>").join("") + "</section>";
  }

  // ───── Colonne Documents : visionneuse (le document le plus récent) ─────
  const sw = okDoc ? '<div class="dos-sw" role="tablist" aria-label="Colonne de droite"><button type="button" role="tab" data-k="pat" onclick="dosDroite(\'pat\')">Patient</button><button type="button" role="tab" data-k="docs" onclick="dosDroite(\'docs\')">Documents' + (nbFichiers(x) ? '<span class="n">' + nbFichiers(x) + "</span>" : "") + "</button></div>" : "";
  const docs = okDoc ? sw + htmlVisionneuse(x) : "";

  // ───── Barre d'actions : ordonnances (nombre déjà faites dessous), RCP, rendez-vous, tâche ; à droite : salle d'attente, RCP ─────
  const bb = (ico, lg, sm, fn, attr) => '<div class="pr"' + (attr || "") + '><button type="button" onclick="' + fn + '" title="' + esc(lg) + '"><svg class="pi"><use href="#i-' + ico + '"/></svg><span class="lg">' + lg + '</span><span class="sm">' + sm + "</span></button></div>";
  // Lot A §11 (25/10/2026) : téléphone : la barre se replie derrière un bouton « + Prescrire » (feuille ouverte par-dessus, refermée après un choix)
  const barre = '<button type="button" class="dos-fab" onclick="dosPrescrire()" aria-expanded="false">' + ic("plus") + '<span>Prescrire</span></button><div class="br-g">' +
    // 19/10/2026 (demande de Dr Bentahila) : « Nouvelle ligne » (chimio) et « + Prescription » (RT) restent dans leurs onglets, comme
    // « Nouvelle consultation » : la barre tient sur une ligne
    boutonsPrescription(x) + '<span class="br-sep"></span>' +
    (okR ? bb("agenda", "+ Rendez-vous", "+ RDV", "ouvrirRdv(" + qx + ")") : "") + bb("taches", "+ Tâche", "+ Tâche", "taNouvelle(" + qx + ")", ' data-mod="taches"') +
    '</div><div class="br-d" id="barreDroite">' + bullesDossier(x) + bulleRcp(x) + "</div>";

  const Z = { bandeau: ban, patient: (okDoc ? sw : "") + pat, travail: trav, documents: docs, barre };
  const cls = "dos" + (okDoc ? "" : " sans-docs") + (ONGLET[x.id] === "pat" ? " t-pat" : "") + (DOS.agrandi ? " agrandi" : "") + (DOS.droite === "docs" && okDoc ? " d-docs" : "") + (visionneuseGrande() ? " docs-grand" : "");
  const d0 = $("dos");
  if (d0 && d0.dataset.pid === x.id && $("page").contains(d0)) {
    // Même dossier redessiné : chaque zone remplacée seule ; défilement de chaque zone, de la page et curseur gardés ; la visionneuse n'est
    // rechargée que si la liste des documents a changé
    const act = document.activeElement, aid = act && act.id && d0.contains(act) ? act.id : null, sel = aid && act.selectionStart != null ? [act.selectionStart, act.selectionEnd] : null, y = window.scrollY;
    d0.className = cls + (panneauOuvert() ? " pn-ouv" : "");
    d0.querySelectorAll(":scope > [data-zone]").forEach((z) => {
      const k = z.dataset.zone; if (!(k in Z)) return;
      if (k === "documents" && z.dataset.sig === sigVisionneuse(x) && z.innerHTML) { const s = z.querySelector(".dos-sw"); if (s && sw) s.outerHTML = sw; return; }
      const pos = z.scrollTop, inner = {}; z.querySelectorAll("[data-defile]").forEach((e) => { inner[e.dataset.defile] = e.scrollTop; });
      z.innerHTML = Z[k]; if (k === "documents") z.dataset.sig = sigVisionneuse(x);
      z.scrollTop = pos; z.querySelectorAll("[data-defile]").forEach((e) => { if (e.dataset.defile in inner) e.scrollTop = inner[e.dataset.defile]; });
      setTimeout(() => { if (z.isConnected && z.scrollTop !== pos) z.scrollTop = pos; }, 0); // encore une fois, quand les notes ont pris leur hauteur
    });
    window.scrollTo(0, y);
    if (aid) { const e = $(aid); if (e && document.activeElement !== e) { e.focus({ preventScroll: true }); if (sel) try { e.setSelectionRange(sel[0], sel[1]); } catch (er) { /* champ sans curseur */ } } }
  } else {
    $("page").innerHTML = '<div class="dos-cq"><div class="' + cls + '" id="dos" data-pid="' + esc(x.id) + '">' +
      '<section class="dos-ban carte" data-zone="bandeau" aria-label="Patient : ' + esc(r.nm) + '">' + ban + "</section>" +
      '<section class="dos-pat" data-zone="patient" aria-label="Fiche du patient" tabindex="0">' + Z.patient + "</section>" +
      '<section class="dos-trav" data-zone="travail" aria-label="Travail" tabindex="0">' + trav + "</section>" +
      '<section class="dos-docs" data-zone="documents" aria-label="Documents du patient" tabindex="0" data-sig="' + esc(sigVisionneuse(x)) + '">' + docs + "</section>" +
      '<nav class="dos-barre" data-zone="barre" aria-label="Actions du dossier">' + barre + "</nav>" +
      '<div class="dos-pn" id="panneau" role="region" aria-label="Chimiothérapie ou radiothérapie" hidden><button type="button" class="pn-aide" onclick="voirAides()" title="Afficher ou cacher les explications" aria-label="Explications">?</button><div class="pn-corps" id="panneauCorps"></div></div></div></div>';
  }
  const dd = $("dos"); dd.querySelectorAll(".dos-sw button").forEach((bt) => { const on = bt.dataset.k === (DOS.droite === "docs" && okDoc ? "docs" : "pat"); bt.classList.toggle("on", on); bt.setAttribute("aria-selected", on); });
  majToutDeplier(); const nt = $("nTxt"); if (nt) window.hauteurResume(nt);
  if (okDoc) apresVisionneuse(x);
  majPresenceDossier(); // collègues qui ont ce dossier ouvert
  majRubriqueOuverte(x.id); // lot A §3 : liste ouverte au centre
}
window.dosPrescrire = (ferme) => { const d = $("dos"); if (!d) return; const o = ferme ? false : !d.classList.contains("barre-ouv"); d.classList.toggle("barre-ouv", o);
  const f = d.querySelector(".dos-fab"); if (f) { f.setAttribute("aria-expanded", o); f.lastChild.textContent = o ? "Fermer" : "Prescrire"; f.firstChild.style.transform = o ? "rotate(45deg)" : ""; } };
document.addEventListener("click", (ev) => { const b = ev.target && ev.target.closest && ev.target.closest(".dos.barre-ouv .br-g button"); if (b) setTimeout(() => window.dosPrescrire(true), 0); }, true);
// Résumé : la hauteur suit le texte
window.hauteurResume = (z) => { z.style.height = "auto"; z.style.height = Math.max(z.scrollHeight + 2, 90) + "px"; };
// Onglet Radiothérapie du centre
function htmlRT(x, okRT) {
  const { P } = x, ctx = D.ctx, t = D.t;
  const JS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"], TECH = { stereo: "Stéréotaxie", vmat: "VMAT", imrt: "IMRT", "3d": "3D" };
  // RTR, RT8 (25/10/2026) : « Référentiel › » ouvre le référentiel de radiothérapie filtré sur la localisation du dossier (clinique.diag,
  // traduit par donnees-rt/diag-localisation.json ; sans correspondance : l'accueil du module) ; avec le droit referentielRT et la fonction
  const ref = voitRefRT() ? '<a class="rtr-lien" href="#radiotherapie/diag/' + encodeURIComponent(P.diag || "") + '">Référentiel ›</a>' : "";
  let hr = okRT || ref ? '<div class="entete">' + (okRT ? '<button class="bt clair petit" onclick="ouvrirRT(\'' + x.id + '\')">' + ic("plus") + "Prescription</button>" : "") + ref + "</div>" : "";
  if (!(P.rts || []).length) hr += '<p class="vide-c">Aucune prescription de radiothérapie.</p>';
  // Une seule radiothérapie ouverte (11/10/2026) : la plus récente à l'ouverture du dossier ; les autres fermées (titre, dose, séances,
  // boutons ; sans les étapes)
  if (RTO.pid !== x.id) { RTO.pid = x.id; RTO.id = (P.rts || []).length ? P.rts[P.rts.length - 1].id : null; }
  (P.rts || []).slice().reverse().forEach((v) => {
    const ouv = RTO.id === v.id;
    const s = statutRT(v, ctx), f = finRT(v, ctx.feries), c = compteurRT(v, ctx), cls = s.c === "fin" ? "b-ch" : s.c === "cours" ? "b-rt" : s.c === "dep" ? "b-or" : "b-co";
    const nb = parseInt(v.nb, 10), dose = parseFloat(String(v.dose || "").replace(",", ".")), dpf = dose && nb ? Math.round((dose / nb) * 100) / 100 : null, q = "'" + x.id + "','" + v.id + "'";
    const etape = (lib, d, fait, plus) => '<div class="etape' + (fait ? " fait" : "") + '"><span class="ck">' + (fait ? ic("check") : "") + "</span>" + lib + (d ? " — " + dfrA(d) : "") + (plus || "") + "</div>";
    const finFaite = !!v.fin || (f && f < t);
    const dz = dosimetrie(v, t), cz = contourage(v, t); // périodes à valider : contourage (scanner → 1re séance), puis dosimétrie (contourage → 1re séance)
    // 19/10/2026 (demande de Dr Bentahila) : prescription pliée = la ligne de titre et Modifier / Terminé (Rouvrir) ; le reste seulement ouverte
    if (!ouv) { hr += '<div class="rt' + (ouv ? " on" : "") + '"><div class="tl" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;cursor:pointer" onclick="rtTog(' + q + ')" title="' + (ouv ? "Refermer" : "Voir les étapes") + '"><b style="font-size:16px;color:var(--titre)">' + (ouv ? "▾ " : "▸ ") + esc(v.acte || "Radiothérapie") + (nbA(v) > 1 ? " × " + nbA(v) : "") + '</b><span class="badge ' + cls + '">' + ({ fin: '<svg class="pi"><use href="#i-check"/></svg>', cours: '<i class="dot v"></i>', dep: '<i class="dot o"></i>', prev: '<svg class="pi"><use href="#i-horloge"/></svg>' }[s.c] || "") + esc(s.lib) + "</span>" + (v.hop ? '<span class="badge b-gr">' + esc(v.hop) + "</span>" : "") + (v.intent ? '<span class="badge b-gr">' + (v.intent === "curative" ? "Curative" : "Palliative") + "</span>" : "") + "</div>" +
      (okRT ? '<div class="actr rt-pl"><button class="mini" onclick="ouvrirRT(' + q + ')">Modifier</button>' + (v.deb ? (v.fin ? '<button class="mini" onclick="terminerRT(' + q + ',1)">Rouvrir</button>' : '<button class="mini v" onclick="terminerRT(' + q + ')">Terminé</button>') : "") + "</div>" : "") + "</div>"; return; }
    hr += '<div class="rt' + (ouv ? " on" : "") + '"><div class="tl" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;cursor:pointer" onclick="rtTog(' + q + ')" title="' + (ouv ? "Refermer" : "Voir les étapes") + '"><b style="font-size:16px;color:var(--titre)">' + (ouv ? "▾ " : "▸ ") + esc(v.acte || "Radiothérapie") + (nbA(v) > 1 ? " × " + nbA(v) : "") + '</b><span class="badge ' + cls + '">' + ({ fin: '<svg class="pi"><use href="#i-check"/></svg>', cours: '<i class="dot v"></i>', dep: '<i class="dot o"></i>', prev: '<svg class="pi"><use href="#i-horloge"/></svg>' }[s.c] || "") + esc(s.lib) + "</span>" + (v.hop ? '<span class="badge b-gr">' + esc(v.hop) + "</span>" : "") + (v.intent ? '<span class="badge b-gr">' + (v.intent === "curative" ? "Curative" : "Palliative") + "</span>" : "") + "</div>" +
      // 3.5 (12/10/2026) : volumes (principal et compléments) et rythme
      (Array.isArray(v.vol) && v.vol.length ? '<p class="st" style="color:var(--doux);font-size:13.5px;margin:6px 0 0">' + volumesRT(v).map((z, n, l) => esc(texteVolume(z, l))).join("<br>") + "<br>" + esc([nb ? nb + " séances" : "", TECH[v.tech] || (v.vmat ? "VMAT" : ""), libRythme(v)].filter(Boolean).join(" · ")) + "</p>"
        : '<p class="st" style="color:var(--doux);font-size:13.5px;margin:6px 0 0">' + esc([dose ? String(dose).replace(".", ",") + " Gy" : "", nb ? nb + " fractions" : "", dpf ? String(dpf).replace(".", ",") + " Gy/fraction" : "", TECH[v.tech] || (v.vmat ? "VMAT" : ""), libRythme(v)].filter(Boolean).join(" · ")) + "</p>") +
      (ouv ? '<div class="etapes">' + (v.scan ? etape("Scanner de centrage", v.scan, v.scan <= t) : "") +
      // Contourage (09/10/2026) : validé par le médecin entre le scanner et la dosimétrie
      (v.cont ? etape("Contourage validé", v.cont, true, okRT && peutDosi() && !v.dosi && !v.fin ? ' <a href="#" class="lienr" onclick="contRT(' + q + ',1);return false">annuler</a>' : "")
        : cz ? etape(cz.retard ? '<span style="color:var(--rouge);font-weight:bold">Contourage à valider' + (v.deb && v.deb <= t ? " — radiothérapie commencée sans validation" : " — en retard") + "</span>" : "Contourage à valider", "", false, (cz.au !== cz.du ? " — du " + dfrA(cz.du) + " au " + dfrA(cz.au) : "") + (v.scan <= t && peutDosi() ? ' <button class="mini vert" style="margin-left:8px" onclick="contRT(' + q + ')"><svg class="pi"><use href="#i-check"/></svg>Valider le contourage</button>' : v.scan > t ? ' <span class="mesures">(à partir du scanner)</span>' : "")) : "") +
      (v.dosi ? etape("Dosimétrie validée", v.dosi, true, okRT && peutDosi() && !v.fin ? ' <a href="#" class="lienr" onclick="dosiRT(' + q + ',1);return false">annuler</a>' : "") : (dz ? etape(dz.retard ? '<span style="color:var(--rouge);font-weight:bold">Dosimétrie à valider' + (v.deb && v.deb <= t ? " — radiothérapie commencée sans validation" : " — en retard") + "</span>" : "Dosimétrie à valider", "", false, (dz.au !== dz.du ? " — du " + dfrA(dz.du) + " au " + dfrA(dz.au) : "") + (peutDosi() ? ' <button class="mini vert" style="margin-left:8px" onclick="dosiRT(' + q + ')"><svg class="pi"><use href="#i-check"/></svg>Valider la dosimétrie</button>' : "")) : cz ? etape("Dosimétrie", "", false, ' <span class="mesures">(après le contourage)</span>') : "")) +
      (v.deb ? etape("1re séance", v.deb, v.deb <= t) : "") +
      (v.fin || f ? etape(v.fin ? "Fin de traitement" : "Fin de traitement prévue", v.fin || f, finFaite) : "") + "</div>" : "") + // étapes : seulement ouverte
      (v.cj && ouv ? '<p class="st" style="color:var(--doux);font-size:13.5px;margin:2px 0 0">Consultation hebdomadaire le ' + JS[+v.cj] + (v.ch ? " à " + esc(v.ch) : "") + "</p>" : "") +
      (c ? '<div style="margin-top:10px" title="Calcul d\'après le calendrier (les séances réelles sont suivies dans ARIA)"><b>Séances prévues à ce jour : ' + c.faites + " / " + c.nb + "</b> (" + c.pct + ' %)<div class="barre"><i style="width:' + c.pct + '%"></i></div></div>' : "") +
      (v.note && ouv ? '<p class="sous" style="margin:8px 0 0">' + esc(v.note) + "</p>" : "") +
      '<div class="actr" style="justify-content:flex-start;margin-top:12px">' + (okRT ? '<button class="mini" onclick="ouvrirRT(' + q + ')">Modifier</button>' + (v.deb ? (v.fin ? '<button class="mini" onclick="terminerRT(' + q + ',1)">Rouvrir</button>' : '<button class="mini v" onclick="terminerRT(' + q + ')">Terminé</button>') : "") : "") +
      // 26/10/2026 (demande de Dr Bentahila) : Pli confidentiel, Compte rendu de fin et Rendez-vous sous « ⋯ » (moins de place ; coche = déjà enregistré)
      menuPts([v.acte && peut("documents") ? boutonDoc(x, v, "pli", "Pli confidentiel") : "", v.deb && nb && peut("documents") ? boutonDoc(x, v, "cr", "Compte rendu de fin") : "", v.deb && nb && peut("documents") ? boutonDoc(x, v, "rdv", "Rendez-vous") : ""].filter(Boolean)) + "</div></div>";
  });
  return hr;
}
// Après un enregistrement : la page en cours est réaffichée (salle d'attente ou dossier)
function reafficher(id) { if (String(D.page || "").indexOf("salle") === 0) pageSalle(); else pageDossier(id); }

// ───── Panneau de chimiothérapie et de radiothérapie (R-G e) : à la place du centre et de la colonne Documents, le bandeau, la colonne
// Patient et la barre restent visibles ; jumeau de fenetre(html, "large") (mêmes boutons, mêmes champs) ; sans grille (téléphone, tablette) :
// la fenêtre large d'avant. Ordonnances, courriers et petites questions : la fenêtre au-dessus ; en la fermant, on retrouve le panneau tel quel.
const panneauOuvert = () => { const p = $("panneau"); return !!p && !p.hidden; };
const petiteOuverte = () => !$("fenetre").classList.contains("cache");
function panneau(html) {
  if (!grilleDossier() || !$("panneauCorps")) { fenetre(html, "large"); return; }
  if (petiteOuverte()) fermerPetite();
  const p = $("panneau"), deja = panneauOuvert();
  $("panneauCorps").innerHTML = html; p.hidden = false; $("dos").classList.add("pn-ouv"); PN.sale = false; // le corps reste le même élément : défilement gardé
  if (!deja) { const f = p.querySelector("input:not([type=date]),select,textarea"); if (f) setTimeout(() => f.focus({ preventScroll: true }), 50); }
}
// Lot A §3 (25/10/2026, demande de Dr Bentahila) : une rubrique de la colonne Patient s'ouvre en grand à la place du centre (le même panneau) :
// « à venir » et « Historique des RDV » : la liste complète (Fermer, aucun ajout) ; Identité, Informations médicales, Fiche tumeur : le formulaire
// entier, rempli sur place (Annuler / Enregistrer) ; sans le droit de modifier : la partie en lecture (Fermer)
window.dosRubrique = (pid, k) => {
  const x = D.patients.find((p) => p.id === pid); if (!x) return;
  if (k === "avenir" || k === "passe") { const lib = (PARTIES_D.find((z) => z[0] === k) || [])[1] || "";
    panneau('<div data-rub="' + k + '"><h3 class="rub-t">' + esc(lib) + " · " + esc(x.r.nm) + '</h3><div class="rc-liste rc-grand">' + ((RUB[pid] || {})[k] || "") + '</div><div class="boutons"><button class="bt gris" onclick="fermerFenetre()">Fermer</button></div></div>'); return; }
  if (k === "id" ? peut("identite") || traitMod() || peut("fichePatient") : traitMod() || peut("fichePatient")) { window.modifierIdentite(pid, k, true); return; }
  panneau('<div data-rub="' + k + '"><h3>' + esc(x.r.nm) + "</h3>" + ficheP.htmlLectureFiche(x, k) + '<div class="boutons"><button class="bt gris" onclick="fermerFenetre()">Fermer</button></div></div>');
};
// Liste ouverte au centre : tenue à jour quand le dossier se réaffiche (Venu, prix… faits depuis son menu « ⋯ »)
function majRubriqueOuverte(pid) {
  const z = document.querySelector("#panneauCorps [data-rub] .rc-liste, #fenetreCorps [data-rub] .rc-liste"); if (!z) return;
  const k = z.closest("[data-rub]").dataset.rub; if (RUB[pid] && RUB[pid][k] != null) z.innerHTML = RUB[pid][k];
}
// Fermer le panneau ; changements non enregistrés : « Quitter sans enregistrer ? » (rien n'est bloqué)
function fermerPanneau(force) {
  const p = $("panneau"); if (!p || p.hidden) return true;
  if (PN.sale && !force && !confirm("Quitter sans enregistrer ?")) return false;
  p.hidden = true; $("panneauCorps").innerHTML = ""; PN.sale = false; const d = $("dos"); if (d) d.classList.remove("pn-ouv");
  PN.apres.forEach((f) => { try { f(); } catch (e) { console.warn("panneau", e); } });
  return true;
}
document.addEventListener("input", (ev) => { if (ev.target && ev.target.closest && ev.target.closest("#panneau")) PN.sale = true; });
// Bouton d'enregistrement du panneau : ce qui suit n'est plus « non enregistré » (en cas d'échec, l'erreur reste affichée dans le panneau)
document.addEventListener("click", (ev) => { if (ev.target && ev.target.closest && ev.target.closest("#panneau #fOk, #panneau #rSup")) PN.sale = false; }, true);
function fermerPetite() { $("fenetre").classList.add("cache"); $("fenetreCorps").innerHTML = ""; }

// ───── Menu « ⋯ » d'une ligne (20/10/2026) : boutons gardés dans la ligne (cachés), recopiés dans une fenêtre flottante au clic ─────
function menuPts(m) { return m.length ? '<span class="mpts"><button type="button" class="mini sa-plus" onclick="ouvrirPts(event,this)" aria-label="Autres actions" title="Autres actions">⋯</button><span class="cache">' + m.join("") + "</span></span>" : ""; }
const fermerPts = () => { const f = $("ptsMenuF"); if (f) f.remove(); };
window.ouvrirPts = (ev, bt) => {
  ev.stopPropagation(); const deja = $("ptsMenuF") && $("ptsMenuF")._bt === bt; fermerPts(); if (deja) return;
  const f = document.createElement("div"); f.id = "ptsMenuF"; f.className = "sa-menu"; f.setAttribute("role", "menu"); f._bt = bt;
  f.innerHTML = bt.nextElementSibling.innerHTML; f.querySelectorAll("button").forEach((z) => { z.className = ""; z.setAttribute("role", "menuitem"); });
  f.addEventListener("click", () => setTimeout(fermerPts)); document.body.appendChild(f);
  const r = bt.getBoundingClientRect(), w = f.offsetWidth, h = f.offsetHeight;
  // lot A : un bouton dans la moitié gauche de l'écran ouvre son menu vers la droite (il ne passe plus sur le menu de l'application)
  f.style.left = (r.left < innerWidth / 2 ? Math.max(8, Math.min(r.left, innerWidth - w - 8)) : Math.max(8, Math.min(r.right - w, innerWidth - w - 8))) + "px"; f.style.top = (r.bottom + h + 8 > innerHeight ? Math.max(8, r.top - h - 4) : r.bottom + 4) + "px";
  const p = f.querySelector("button"); if (p) p.focus();
};
document.addEventListener("click", (e) => { if ($("ptsMenuF") && !e.target.closest("#ptsMenuF")) fermerPts(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") fermerPts(); });
document.addEventListener("scroll", (e) => { if (!(e.target && e.target.closest && e.target.closest("#ptsMenuF"))) fermerPts(); }, true);

// ───── Modifier l'identité ─────
// 20/10/2026 (demande de Dr Bentahila) : une partie de la fiche à la fois. sec = "id" (bandeau, Afficher : Identité et administratif ; sans le droit
// « identité » : Informations médicales), "med" ou "tum" (« Modifier » de la partie dans la colonne Patient). Statut du patient : avec les
// « Supprimer le patient » : fenêtre de l'identité et, depuis le 26/10/2026 (demande de Dr Bentahila), « ⋯ » de l'en-tête du dossier, sous Journal ;
// droit « supprimerPatient », deux confirmations
window.dosSupprimer = async (id) => {
  const x = D.patients.find((p) => p.id === id); if (!x || !peut("supprimerPatient")) return;
  if (!confirm("Supprimer définitivement le dossier de " + x.r.nm + " ?\n\nToutes ses lignes de traitement et ses cures seront effacées.\n\nLe médecin titulaire peut le récupérer pendant 7 jours (Paramètres › Cabinet › Export des données › Récupérer des données).")) return;
  if (!confirm("Confirmer la suppression du dossier de " + x.r.nm + " ?")) return;
  try {
    await supprimerConsultations(x); await supprimerDocs(x); await supprimerFichiers(x); await supprimerRcp(x);
    await deleteDoc(doc(db, "espaces", ESPACE, "patients", x.id));
    await deleteDoc(doc(db, "espaces", ESPACE, "rappels", x.id)).catch(() => {}); // R-C4
    if (peut("finances")) { await deleteDoc(doc(db, "espaces", ESPACE, "patientsFinances", x.id)).catch(() => {}); await deleteDoc(doc(db, "espaces", ESPACE, "encaissements", x.id)).catch(() => {}); }
    journal(x, "Patient supprimé"); D.patients.splice(D.patients.indexOf(x), 1); fermerFenetre(); toast("Dossier supprimé."); location.hash = "patients";
  } catch (e) { ($("fErr") ? erreur : alert)(e && e.code === "permission-denied" ? "Vous n'avez pas le droit de supprimer ce dossier." : "Suppression impossible : " + ((e && e.message) || e)); }
};
// Informations médicales (avec l'identité si le cabinet n'a pas de partie médicale) ; « Supprimer le patient » : avec l'identité.
window.modifierIdentite = (id, sec, centre) => { // centre (lot A §3) : formulaire ouvert à la place du centre du dossier (panneau)
  const x = D.patients.find((p) => p.id === id); if (!x) return;
  const I = x.doc.identite || {}, C = x.doc.clinique || {}, okI = peut("identite"), okC = traitMod() || peut("fichePatient"), okE = !!D.membre.tousEtablissements;
  if (!okI && !okC) { toast("Vous n'avez pas le droit de modifier ce dossier."); return; }
  const parts = ficheP.partiesPresentes(); sec = sec || (okI || parts.indexOf("med") < 0 ? "id" : "med");
  const avecStatut = sec === "med" || (sec === "id" && parts.indexOf("med") < 0);
  // 3.11 (12/10/2026) : formulaire rendu depuis la fiche réglable (parties, ordre, types, listes) ; droits par partie (identité / fiche médicale)
  (centre ? panneau : fenetre)("<h3>" + esc(x.r.nm) + "</h3>" + ficheP.htmlFormulaire(x, { off: (p) => (p === "clinique" ? !okC : !okI), etabs: okE ? D.etabs : [], sec }) +
    // Statut du patient (3.3, 12/10/2026) : décédé → plus de rappels, de tâches automatiques ni d'alertes ; rendez-vous à venir signalés
    (!avecStatut ? "" : '<div class="form" style="margin-top:8px"><div><label for="fStatut">Statut du patient</label><select id="fStatut"' + (okC ? "" : " disabled") + ' onchange="document.getElementById(\'zDeces\').classList.toggle(\'cache\',this.value!==\'decede\')"><option value="">—</option>' +
      STATUTS.map(([k, l]) => '<option value="' + k + '"' + (C.statut === k ? " selected" : "") + ">" + l + "</option>").join("") + "</select></div>" +
      '<div id="zDeces"' + (C.statut === "decede" ? "" : ' class="cache"') + '><label for="fDeces">Date du décès</label><input id="fDeces" type="date" value="' + esc(C.decesLe || "") + '"' + (okC ? "" : " disabled") + "></div></div>") +
    '<div class="err" id="fErr"></div><div class="boutons">' + (peut("supprimerPatient") && sec === "id" ? '<button class="bt gris" id="fSup" style="margin-right:auto;color:var(--rouge)"><svg class="pi"><use href="#i-corbeille"/></svg>Supprimer le patient</button>' : "") + '<button class="bt gris" onclick="fermerFenetre()">Annuler</button><button class="bt plein" id="fOk">Enregistrer</button></div>');
  activerDiag("fDiag", "fDiagP");
  if ($("fSup")) $("fSup").onclick = () => window.dosSupprimer(x.id);
  $("fOk").onclick = async () => {
    const changes = {}, lu = ficheP.lireFormulaire(x), nI = lu.identite, nC = lu.clinique;
    if (lu.erreur) { erreur(lu.erreur); return; }
    if (okC && $("fStatut")) { // 3.3 : statut du patient (décès : date obligatoire)
      const st = val("fStatut"); if (st) nC.statut = st; else delete nC.statut;
      if (st === "decede") { if (!val("fDeces")) { erreur("Indiquez la date du décès."); return; } nC.decesLe = val("fDeces"); } else delete nC.decesLe;
    }
    if (okI && JSON.stringify(nI) !== JSON.stringify(I)) changes.identite = nI;
    if (okC && JSON.stringify(nC) !== JSON.stringify(C)) changes.clinique = nC;
    if (okE && lu.etab && lu.etab !== x.doc.etablissementId) changes.etablissementId = lu.etab;
    // Changement d'hôpital (15 bis, 10/10/2026) : les actes faits avant aujourd'hui restent à l'ancien hôpital dans le bilan (moteur hopAu)
    if (changes.etablissementId && x.doc.etablissementId) changes.hopHist = (x.doc.hopHist || []).concat([{ hop: x.doc.etablissementId, avant: D.t, le: Date.now(), par: D.u.uid }]);
    if (!Object.keys(changes).length) { fermerFenetre(); return; }
    occupe($("fOk"), true);
    try { await enregistrer(x, changes, { med: "Informations médicales modifiées", tum: "Fiche tumeur modifiée" }[sec] || "Identité modifiée"); if (changes.etablissementId) { await suivreEtablissement(x, changes.etablissementId); await suivreEtablissementDocs(x, changes.etablissementId); await suivreEtablissementFichiers(x, changes.etablissementId); await suivreEtablissementRcp(x, changes.etablissementId); } if (okI || okC) await enrichirListes(okI ? nI.cor || "" : "", okI ? nI.mut || "" : "", okC ? nC.diag || "" : ""); if (okC && lu.nouveaux) await infosMed.enrichir(lu.nouveaux); fermerFenetre(); toast("Dossier enregistré."); pageDossier(x.id); }
    catch (e) { occupe($("fOk"), false); erreur(e.message); }
  };
};

// ───── Photo du patient : clic sur la bulle du dossier (droit « identité »), facultative ─────
window.photoPatient = (id) => {
  const x = D.patients.find((p) => p.id === id); if (!x || !peut("identite")) return;
  const choisir = () => {
    const i = document.createElement("input"); i.type = "file"; i.accept = "image/*";
    i.onchange = async () => {
      let ph = null; try { ph = await lireImage(i, 420, true); } catch (e) { toast(e.message); return; } if (!ph) return;
      try { await enregistrer(x, { identite: Object.assign({}, x.doc.identite || {}, { photo: ph }) }, "Photo du patient ajoutée"); fermerFenetre(); toast("Photo enregistrée."); pageDossier(x.id); } catch (e) { toast(e.message); }
    };
    i.click();
  };
  if (!(x.doc.identite || {}).photo) { choisir(); return; }
  fenetre("<h3>Photo de " + esc(x.r.nm) + '</h3><div class="photo-pf">' + bulle(x, "ph-dos") + '</div><div class="boutons"><button class="bt gris" style="margin-right:auto;color:var(--rouge)" id="phSup">Retirer la photo</button><button class="bt gris" onclick="fermerFenetre()">Annuler</button><button class="bt plein" id="phCh">Changer la photo</button></div>');
  $("phCh").onclick = choisir;
  $("phSup").onclick = async () => { const I = Object.assign({}, x.doc.identite || {}); delete I.photo; try { await enregistrer(x, { identite: I }, "Photo du patient retirée"); fermerFenetre(); toast("Photo retirée."); pageDossier(x.id); } catch (e) { toast(e.message); } };
};

// ───── Résumé du patient : enregistré tout seul (1 s après la dernière frappe, et en quittant la case) ─────
const NOTES = { pid: null, txt: null, minuterie: null, encours: null };
const etatNotes = (t) => { const e = $("nEtat"); if (e) e.textContent = t; };
window.notesSaisie = (id, el) => { NOTES.pid = id; NOTES.txt = el.value; etatNotes("Modifications en cours…"); clearTimeout(NOTES.minuterie); NOTES.minuterie = setTimeout(sauverNotesMaintenant, 1000); };
async function sauverNotesMaintenant() {
  clearTimeout(NOTES.minuterie);
  if (NOTES.encours) await NOTES.encours; // un enregistrement à la fois
  if (NOTES.txt == null) return;
  const x = D.patients.find((p) => p.id === NOTES.pid), v = NOTES.txt.trim(); NOTES.txt = null; if (!x) return;
  const C = Object.assign({}, x.doc.clinique || {});
  if ((C.notes || "") === v) { etatNotes("Enregistré"); return; }
  C.notes = v; etatNotes("Enregistrement…");
  NOTES.encours = enregistrer(x, { clinique: C }, "Résumé du patient modifié")
    .then(() => { if (NOTES.txt == null) etatNotes("Enregistré"); })
    .catch((e) => { if (NOTES.txt == null) NOTES.txt = v; etatNotes("Non enregistré"); toast("Résumé non enregistré : " + e.message); });
  await NOTES.encours; NOTES.encours = null;
}
window.sauverNotesMaintenant = sauverNotesMaintenant;

// ───── Afficher : toute la fiche du patient, en lecture seule ─────
window.afficherPatient = (id) => {
  const x = D.patients.find((p) => p.id === id); if (!x) return;
  const P = x.P;
  // 3.11 : fiche rendue depuis son réglage (parties, ordre, types) ; statut à la fin
  fenetre("<h3>" + esc(x.r.nm) + "</h3>" + ficheP.htmlLectureFiche(x) +
    '<div class="form fiche-lecture" style="margin-top:8px"><div><label>Statut</label><div>' + (P.statut ? "<b>" + esc(libStatut(P.statut) + (P.statut === "decede" && P.decesLe ? " le " + dfrA(P.decesLe) : "")) + "</b>" : '<span class="mesures">—</span>') + "</div></div></div>" +
    '<div class="boutons">' + (peut("identite") || peut("fichePatient") || traitMod() ? '<button class="bt clair" onclick="fermerFenetre();modifierIdentite(\'' + x.id + '\')">Modifier</button>' : "") + '<button class="bt plein" onclick="fermerFenetre()">Fermer</button></div>');
};

// ───── Rendez-vous : ajouter, modifier, venu / non venu, supprimer ─────
// Types de rendez-vous : les activités de l'établissement du patient (Paramètres › Activités et rémunérations),
// sauf séance de chimio, consultation de chimio (encaissée dans la cure) et radiothérapie.
const STD_RDV = { annonce: "Annonce", suivi: "Suivi", controle: "Contrôle", hospit: "Hospitalisation" };
const ACT_DEF = [["annonce", "Consultation d'annonce"], ["suivi", "Consultation de suivi"], ["controle", "Consultation de contrôle"], ["hospit", "Hospitalisation"]];
// 3.13 (12/10/2026) : les types « pris en rendez-vous » du référentiel (Paramètres › Dossier patient › Types de consultation), dans tous
// les lieux (sans prix dans un lieu = non facturé là) ; avant : les activités de l'établissement
function typesRdv(etab) {
  if (D.typesC && D.typesC.length) return typesPourRdv(D.typesC);
  let l = null;
  if (D.tarifs && D.tarifs.etablissements && D.tarifs.etablissements[etab]) l = D.tarifs.etablissements[etab].activites.map((a) => [a.type, a.libelle]);
  else if (D.activites && D.activites[etab]) l = D.activites[etab].map((a) => [a.t, a.lib]);
  l = (l || ACT_DEF).filter(([t]) => ["seance", "cchimio", "rt"].indexOf(t) < 0);
  if (!l.length) l = ACT_DEF.slice();
  return l.map(([t, lib]) => ({ v: STD_RDV[t] ? "s:" + STD_RDV[t] : "a:" + t, lib: String(lib || "").replace(/\s*\(par jour ouvré\)\s*$/i, ""), act: STD_RDV[t] ? null : t, type: STD_RDV[t] || lib }));
}
const lireRdvs = (x) => JSON.parse(x.doc.rdvsJson || "[]");
// Actes de radiothérapie : catalogue des tarifs (droit « finances »), sinon liste de référence ; l'acte déjà saisi est toujours proposé
const listeActes = (cur) => { const l = (D.tarifs && D.tarifs.actesRT && D.tarifs.actesRT.length ? D.tarifs.actesRT.map((a) => a.nom) : ACTES_RT.slice()); if (cur && l.indexOf(cur) < 0) l.push(cur); return l; };
const apresRdv = (x) => { if (location.hash.indexOf("#agenda") === 0) pageAgenda(); else reafficher(x.id); };
window.ouvrirRdv = (id, rid, pre) => {
  const x = D.patients.find((p) => p.id === id); if (!x) return;
  if (!peut("rendezvous")) { toast("Vous n'avez pas le droit de gérer les rendez-vous."); return; }
  const r0 = rid ? lireRdvs(x).find((v) => v.id === rid) : null, R = r0 || Object.assign({ type: "Suivi", d: D.t, h: "", n: "" }, pre || {});
  const types = typesRdv(x.doc.etablissementId), cle = R.act ? "a:" + R.act : "s:" + R.type;
  // durée (AG2) : celle du rendez-vous, sinon celle de son type ; suit le type tant qu'on ne l'a pas changée à la main
  const med0 = R.med || (r0 ? medRdv(r0) : (pre && pre.med) || medPourPatient(x)); // médecin (AG4) ; nouveau : celui du patient (R-C3)
  // Lieu du rendez-vous (R-C3, facultatif) : celui du patient par défaut ; proposé quand la personne voit plusieurs lieux
  const lieux = (D.etabs || []).filter((e) => D.membre.tousEtablissements || (D.membre.etablissements || []).indexOf(e.code) >= 0), lieu0 = R.lieu || (pre && pre.lieu) || x.doc.etablissementId || "";
  const etabR = () => ($("fLieu") ? val("fLieu") : lieu0) || x.doc.etablissementId;
  const du0 = +R.du || dureeType(cle, lieu0 || x.doc.etablissementId); let duMain = !!R.du && +R.du !== dureeType(cle, lieu0 || x.doc.etablissementId);
  if (!types.some((o) => o.v === cle)) types.push({ v: cle, lib: libRdv(R), act: R.act || null, type: R.type });
  fenetre("<h3>" + (r0 ? "Modifier le rendez-vous" : "Nouveau rendez-vous") + " – " + esc(x.r.nm) + '</h3><div class="form">' +
    '<div class="large"><label for="fType">Type</label><select id="fType">' + types.map((o) => '<option value="' + esc(o.v) + '"' + (o.v === cle ? " selected" : "") + ">" + esc(o.lib) + "</option>").join("") + "</select></div>" +
    '<div class="large"><label for="fMo">Motif de consultation</label><input id="fMo" value="' + esc(R.mo || "") + '" placeholder="Ex. nouveau patient, résultats du scanner, douleur…"></div>' +
    '<div><label for="fD">Date</label><input id="fD" type="date" value="' + esc(R.d || "") + '"></div>' +
    '<div id="zH"><label for="fH">Heure</label><input id="fH" type="time" step="900" value="' + esc(R.h || "") + '"></div>' +
    (lieux.length > 1 ? '<div class="large"><label for="fLieu">Lieu</label><select id="fLieu">' + lieux.concat(lieux.some((e) => e.code === lieu0) || !lieu0 ? [] : [{ code: lieu0, nom: "" }]).map((e) => '<option value="' + esc(e.code) + '"' + (e.code === lieu0 ? " selected" : "") + ">" + esc(e.code + (e.nom ? " – " + e.nom : "")) + (e.code === x.doc.etablissementId ? " (lieu du patient)" : "") + "</option>").join("") + "</select></div>" : "") +
    (multiMed() ? '<div class="large"><label for="fMed">Médecin</label><select id="fMed">' + D.medecins.concat(D.medecins.some((m) => m.uid === med0) ? [] : [{ uid: med0, nom: "Médecin retiré de l'équipe" }]).map((m) => '<option value="' + esc(m.uid) + '"' + (m.uid === med0 ? " selected" : "") + ">" + esc(m.nom) + "</option>").join("") + "</select></div>" : "") +
    '<div id="zDu"><label for="fDu">Durée</label><select id="fDu">' + DUREES_RDV.concat(DUREES_RDV.indexOf(du0) < 0 ? [du0] : []).sort((a, b) => a - b).map((m) => '<option value="' + m + '"' + (m === du0 ? " selected" : "") + ">" + m + " min</option>").join("") + "</select></div>" +
    '<div id="zF" class="cache"><label for="fF">Date de sortie</label><input id="fF" type="date" value="' + esc(R.f || "") + '"></div>' +
    '<div class="large" id="fCr"></div>' +
    '<div class="large"><label for="fN">Note</label><input id="fN" value="' + esc(R.n || "") + '"></div><p class="large mesures" id="fHor" style="margin:0"></p></div>' +
    '<div class="err" id="fErr"></div><div class="boutons"><button class="bt gris" onclick="fermerFenetre()">Annuler</button><button class="bt plein" id="fOk">Enregistrer</button></div>');
  const maj = () => { const hs = val("fType") === "s:Hospitalisation"; $("zH").classList.toggle("cache", hs); $("zDu").classList.toggle("cache", hs); $("zF").classList.toggle("cache", !hs); };
  const majH = () => { const d = val("fD"); if (!d) { $("fHor").textContent = ""; return; } const pl = horaires(etabR()).jours[new Date(d + "T12:00:00").getDay()] || []; $("fHor").textContent = "Horaires " + (etabR() || "du cabinet") + " le " + JNOM[new Date(d + "T12:00:00").getDay()] + " : " + (pl.length ? pl.map((p) => p[0] + "–" + p[1]).join(", ") : "fermé") + "."; };
  const sauf = r0 ? { pid: x.id, rid } : null, medChoisi = () => ($("fMed") ? val("fMed") : med0);
  const majC = () => {
    const z = $("fCr"), d = val("fD"); if (!z) return;
    if (!d || val("fType") === "s:Hospitalisation") { z.innerHTML = ""; return; }
    const C = creneaux(etabR(), d, sauf, +val("fDu"), medChoisi()), libres = C.l.filter((c) => !c.occ.length).length, hc = val("fH");
    const sh = occupDuJour(d, sauf, medChoisi()).sans;
    z.innerHTML = (C.l.length ? '<label>Créneaux du ' + esc(dfrA(d)) + ' <span class="mesures">(' + libres + " libre" + (libres > 1 ? "s" : "") + " pour " + C.du + " min)</span></label><div class=\"crx\">" + C.l.map((c) => c.occ.length
      ? '<button type="button" class="cr pris' + (hc === c.h ? " on" : "") + '" data-h="' + c.h + '" data-pris="1" title="Pris : ' + esc(texteConflit(c.occ)) + '" aria-label="' + c.h + ", pris : " + esc(texteConflit(c.occ)) + '">' + c.h + "<i>" + esc(c.occ[0].nm.split(" ")[0]) + "</i></button>"
      : '<button type="button" class="cr' + (hc === c.h ? " on" : "") + '" data-h="' + c.h + '">' + c.h + "</button>").join("") + "</div>" : "") +
      (sh.length ? '<p class="mesures" style="margin:6px 0 0">Déjà ce jour-là, sans heure : ' + sh.map((o) => esc(o.lib + " de " + o.nm)).join(" ; ") + ".</p>" : "");
  };
  let accepte = ""; // heure déjà acceptée malgré un créneau pris (un seul clic d'avertissement)
  $("fCr").onclick = (ev) => { const b = ev.target.closest("[data-h]"); if (!b) return; const h = b.dataset.h;
    if (b.dataset.pris) { if (!accepterConflit(val("fD"), h, +val("fDu") || 30, sauf, medChoisi())) return; accepte = val("fD") + " " + h; }
    $("fH").value = h; majC(); };
  $("fType").onchange = () => { if (!duMain) $("fDu").value = String(dureeType(val("fType"), etabR())); maj(); majC(); };
  $("fDu").onchange = () => { duMain = true; majC(); }; if ($("fMed")) $("fMed").onchange = majC; if ($("fLieu")) $("fLieu").onchange = () => { majH(); majC(); }; maj(); $("fD").addEventListener("change", () => { majH(); majC(); }); $("fH").addEventListener("change", majC); majH(); majC();
  $("fOk").onclick = async () => {
    const o = types.find((z) => z.v === val("fType")) || types[0], type = o.type, act = o.act, d = val("fD"), hs = type === "Hospitalisation", h = hs ? "" : val("fH"), f = hs ? val("fF") : "";
    if (!d) { erreur("Indiquez la date."); return; }
    if (hs && f && f < d) { erreur("La date de sortie est avant la date d'entrée."); return; }
    const ab = absenceLe(d), fe = !ab && ferieLe(d), hz = horsHoraires(etabR(), d, h);
    if (!ab && !fe && hz && !confirm(hz + "\n\nEnregistrer quand même (urgence, rendez-vous exceptionnel) ?")) return;
    if (fe && !confirm("Le " + dfrA(d) + " est un jour férié (" + (fe.nom || "") + "). Enregistrer quand même ?")) return;
    if (ab && !confirm("Absence prévue ce jour-là (" + (ab.m || "absence") + ", du " + dfrA(ab.du) + " au " + dfrA(ab.au) + "). Enregistrer quand même ?")) return;
    // double réservation (19.4) : un autre rendez-vous de consultation qui chevauche cette heure
    const du = hs ? 0 : +val("fDu") || dureeType(val("fType"), etabR());
    if (h && accepte !== d + " " + h && !accepterConflit(d, h, du, sauf, medChoisi())) return;
    const l = lireRdvs(x), r0d = r0 ? r0.d : "", r0h = r0 ? r0.h || "" : "";
    if (r0) {
      const r = l.find((v) => v.id === rid);
      if ((r.st || "prevu") === "prevu" && (r.d !== d || (r.h || "") !== h)) r.rep = (r.rep || []).concat([{ d: r.d, h: r.h || "", le: D.t }]);
      Object.assign(r, { type, d, h, n: val("fN") }); if (hs) { r.f = f; delete r.du; } else { delete r.f; r.du = du; } if (medChoisi()) r.med = medChoisi(); if (act) r.act = act; else delete r.act; if (val("fMo")) r.mo = val("fMo"); else delete r.mo; if (etabR() && etabR() !== x.doc.etablissementId) r.lieu = etabR(); else delete r.lieu;
    } else {
      const r = { id: "r" + Date.now().toString(36), type, d, h, n: val("fN"), st: "prevu" }; if (hs) r.f = f; else r.du = du; if (medChoisi()) r.med = medChoisi(); if (act) r.act = act; if (val("fMo")) r.mo = val("fMo"); if (etabR() && etabR() !== x.doc.etablissementId) r.lieu = etabR(); l.push(r);
    }
    occupe($("fOk"), true);
    try { await enregistrer(x, { rdvsJson: JSON.stringify(l) }, r0 ? "Rendez-vous modifié" : "Rendez-vous ajouté"); fermerFenetre(); toast("Rendez-vous enregistré."); apresRdv(x);
      if (!r0 && !hs && d >= D.t && numeroWA(x.P.tel) && fnOn("agenda.whatsapp")) proposerConfirmation(x, d, h);
      else if (r0 && !hs && (r0d !== d || r0h !== h)) confirmerApres(x, d, h, "Rendez-vous modifié"); }
    catch (e) { occupe($("fOk"), false); erreur(e.message); }
  };
};
// Juste après un nouveau rendez-vous (19.4) : confirmation par WhatsApp (message « Confirmation d'un rendez-vous » des Paramètres)
function proposerConfirmation(x, d, h, titre) {
  fenetre("<h3>" + esc(titre || "Rendez-vous enregistré") + "</h3><p class=\"sous\">" + esc(x.r.nm) + " – " + cap(jourLong(d)) + (h ? " à " + h : "") + ". Envoyer la confirmation par WhatsApp ?</p>" +
    '<div class="wa-ex">' + esc(messageWA(x, "confirm", d, h)) + "</div>" +
    '<div class="boutons"><button class="bt gris" onclick="fermerFenetre()">Plus tard</button><button class="bt plein" style="background:#1FA855" onclick="fermerFenetre();envoyerWA(\'' + x.id + "','confirm','" + d + "','" + (h || "") + '\')">' + LOGO_WA + " Envoyer la confirmation</button></div>");
}
// R-C5 (19/10/2026) : même confirmation après un report ou un changement de date (rendez-vous, cure, séance, étape de RT)
const confirmerApres = (x, d, h, titre) => { if (x && d && d >= D.t && numeroWA(x.P.tel) && fnOn("agenda.whatsapp")) proposerConfirmation(x, d, h, titre); };
API.confirmerApres = confirmerApres;
// Rendez-vous déplacé dans l'agenda par glisser-déposer (AG3, 11/10/2026) : confirmation avec les mêmes vérifications que la
// fenêtre du rendez-vous (absence, férié, horaires, double réservation), ancien horaire gardé dans `rep`, WhatsApp proposé
API.deplacerRdv = (pid, rid, d, h) => {
  const x = D.patients.find((p) => p.id === pid); if (!x || !peut("rendezvous")) return;
  const r0 = lireRdvs(x).find((v) => v.id === rid); if (!r0 || (r0.st || "prevu") !== "prevu") return;
  if (r0.d === d && (r0.h || "") === h) return;
  const et = r0.lieu || x.doc.etablissementId, du = dureeDe(r0, et), ab = absenceLe(d), fe = !ab && ferieLe(d), hz = !ab && !fe && horsHoraires(et, d, h);
  const cf = chevauche(rdvsDuJour(d, { pid, rid }, medRdv(r0)), h, du);
  const alertes = [ab ? "Absence prévue ce jour-là (" + (ab.m || "absence") + ", du " + dfrA(ab.du) + " au " + dfrA(ab.au) + ")." : "", fe ? "Le " + dfrA(d) + " est un jour férié (" + (fe.nom || "") + ")." : "", hz || "",
    cf.length ? "Créneau déjà pris par : " + texteConflit(cf) + "." : ""].filter(Boolean);
  fenetre("<h3>Déplacer le rendez-vous ?</h3><p class=\"sous\"><b>" + esc(x.r.nm) + "</b> – " + esc(libRdv(r0)) + " (" + du + " min)</p>" +
    '<p class="dep-de">Du <s>' + esc(cap(jourLong(r0.d))) + (r0.h ? " à " + esc(r0.h) : "") + "</s><br>au <b>" + esc(cap(jourLong(d))) + " à " + esc(h) + "</b></p>" +
    (alertes.length ? '<div class="per" style="color:var(--orange);background:var(--orange-c);display:block">' + alertes.map((t) => "<div>" + ic("alerte") + " " + esc(t) + "</div>").join("") + "</div>" : "") +
    '<div class="err" id="fErr"></div><div class="boutons"><button class="bt gris" onclick="fermerFenetre()">Annuler</button><button class="bt plein" id="fOk">' + (alertes.length ? "Déplacer quand même" : "Déplacer") + "</button></div>");
  $("fOk").onclick = async () => {
    const l = lireRdvs(x), r = l.find((v) => v.id === rid);
    if (!r || (r.st || "prevu") !== "prevu") { erreur("Ce rendez-vous a changé entre-temps : rouvrez l'agenda."); return; }
    r.rep = (r.rep || []).concat([{ d: r.d, h: r.h || "", le: D.t }]); r.du = dureeDe(r, et); r.d = d; r.h = h;
    occupe($("fOk"), true);
    try { await enregistrer(x, { rdvsJson: JSON.stringify(l) }, "Rendez-vous déplacé au " + dfrA(d) + " à " + h); fermerFenetre(); toast("Rendez-vous déplacé au " + dfrA(d) + " à " + h + "."); apresRdv(x);
      if (d >= D.t && numeroWA(x.P.tel) && fnOn("agenda.whatsapp")) proposerConfirmation(x, d, h); }
    catch (e) { occupe($("fOk"), false); erreur(e.message); }
  };
};
// ───── Caisse (19.5, 10/10/2026) : lieux « payé au cabinet » (réglage du lieu d'exercice) : mode de paiement à « Venu », reçu A5 ─────
const payeCabinet = (x) => ((D.etabsTous || D.etabs).find((e) => e.code === (x.doc.etablissementId || "")) || {}).paiement === "cabinet";
const MODES = [["esp", "Espèces", "en espèces"], ["carte", "Carte bancaire", "par carte bancaire"], ["chq", "Chèque", "par chèque"], ["np", "Non payé (à régler plus tard)", ""]];
const libMode = (k) => (MODES.find((z) => z[0] === k) || ["", ""])[1];
const htmlMode = (cur) => { const c = !cur || cur === "np" || cur === "ae" ? "esp" : cur; return '<div><label for="pvMode">Paiement</label><select id="pvMode">' + MODES.map(([k, lib]) => '<option value="' + k + '"' + (c === k ? " selected" : "") + ">" + lib + "</option>").join("") + "</select></div>"; };
// Qui encaisse (19.5) : la secrétaire (mode de paiement, reçu) ; le médecin valide seulement « vu » et le prix → « à encaisser »
const encaisseIci = () => !estMed(D.membre.role);
const aEncaisser = (mode) => mode === "np" || mode === "ae";
// Reçu au patient (A5, papier à en-tête, sans numéro) ; w = fenêtre ouverte au clic (sinon bloquée par le navigateur)
// Numéro du reçu (SA9c, audit externe 11/10/2026) : tiré en transaction sur le compteur de l'année (aucun doublon, même si deux
// personnes impriment en même temps) ; réimpression au même montant et même mode = duplicata (même numéro) ; sinon nouveau numéro et
// l'ancien est noté annulé (recus/{patient}_{clé}.annules). o.cle = « r-RDV » ou « c-LIGNE-CURE-JOUR » (sans clé : pas de numéro).
async function numeroterRecu(x, o) {
  if (!o.cle) return null;
  const annee = D.t.slice(0, 4), ref = doc(db, "espaces", ESPACE, "recus", idRecu(x.id, o.cle)), cpt = doc(db, "espaces", ESPACE, "recusCompteur", annee);
  return runTransaction(db, async (tr) => {
    const a = await tr.get(ref), ancien = a.exists() ? a.data() : null;
    const base = { pid: x.id, nom: (x.r && x.r.nm) || "", etab: x.doc.etablissementId || "", cle: o.cle, d: o.d || D.t, lib: o.lib || "", m: o.m, mode: o.mode || "", annee, par: D.u.uid, parNom: API.nomAgissant(), le: Date.now() };
    if (decisionRecu(ancien, o.m, o.mode) === "duplicata") { tr.update(ref, recuAEcrire(ancien, base)); return { numero: ancien.numero, duplicata: true }; }
    const c = await tr.get(cpt), n = (c.exists() ? c.data().n || 0 : 0) + 1;
    tr.set(cpt, { n, majPar: D.u.uid });
    tr.set(ref, Object.assign(recuAEcrire(ancien, base, n), { le: serverTimestamp() }));
    return { numero: numeroRecu(annee, n), duplicata: false, annule: ancien && ancien.numero };
  });
}
// R-B5 (19/10/2026, demande du 17/10, mise en page du ticket d'encaissement envoyé par le cabinet ; audit n° 6, C6 et décisions 9, 10) :
// A5 portrait, une page : en haut le lieu (en-tête imprimé par Onco360) et la date ; « REÇU » encadré ; tableau N° de reçu, Patient, Médecin
// (celui de l'acte : o.med, sinon le titulaire ; sa carte signataires/{uid}), Prestation, Encaissement (chiffres, lettres, mode) ; « Visa accueil »
// (qui imprime, heure du Maroc) ; mentions obligatoires (Paramètres › Impression, identifiants vides non imprimés) ; « Cachet et signature ».
// Numéro impossible à enregistrer : imprimé sans numéro, noté au journal du cabinet (question 8 de l'audit, en attendant la réponse).
// R-B5 (audit n° 6, décision 11) : prix changé après la remise d'un reçu : avertissement d'un clic (jamais bloquant) et historique des
// montants dans le reçu (recus/{patient}_{clé}.prix [{ le, par, parNom, avant, apres }], règle : une entrée de plus, signée)
async function recuRemis(x, cle) {
  if (!cle || estComptable() || !(peut("finances") || peut("encaissements"))) return null;
  const s = await getDoc(doc(db, "espaces", ESPACE, "recus", idRecu(x.id, cle))).catch(() => null); return s && s.exists() ? s.data() : null;
}
const avertirPrixRecu = (rc, m) => !rc || Number(rc.m) === Number(m) || confirm("Un reçu n° " + rc.numero + " a été remis pour " + fmtMil(rc.m) + " DH.\n\nChanger le prix quand même ? Le prochain reçu imprimé portera un nouveau numéro, l'ancien sera noté annulé.");
async function noterPrixRecu(x, cle, rc, m) {
  if (!rc || Number(rc.m) === Number(m)) return;
  await updateDoc(doc(db, "espaces", ESPACE, "recus", idRecu(x.id, cle)), { prix: arrayUnion({ le: new Date().toISOString(), par: D.u.uid, parNom: API.nomAgissant(), avant: rc.m, apres: m }) }).catch((e) => console.warn("historique du prix", e));
}
const noteRecu = (rc) => (!rc ? "" : "Reçu n° " + rc.numero + " remis pour " + fmtMil(rc.m) + " DH." + (rc.prix || []).map((z) => " Prix changé le " + dfrA(String(z.le).slice(0, 10)) + " par " + (z.parNom || "—") + " : " + fmtMil(z.avant) + " → " + fmtMil(z.apres) + " DH.").join(""));
API.recuRemis = recuRemis; API.avertirPrixRecu = avertirPrixRecu; API.noterPrixRecu = noterPrixRecu; API.noteRecu = noteRecu; // chimio.js (consultation de chimio)
const dh2 = (m) => Number(m || 0).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/[\u202f\u00a0]/g, " ") + " DH";
const carteMedecin = (uid) => { const c = (D.signataires || {})[uid]; if (c && c.nom) return c; return uid === D.u.uid && D.membre.role === "medecin" ? carteDe() : Object.assign({}, medecinFiche()); };
function htmlRecu(x, o, num, ctx) {
  const P = x.P, et = (D.etabsTous || D.etabs).find((e) => e.code === x.doc.etablissementId) || {}, I = reglages().impression, c = carteMedecin(o.med || titulaireUid()) || {};
  const nomP = String(P.nomF || x.r.nm || "").toUpperCase() + (P.prenom ? " " + cap(String(P.prenom).toLowerCase()) : ""), dos = numDossier(x), genere = I.entete === "genere";
  const logo = genere && I.eLogo && srcImage(et.logo) ? '<img class="rc-logo" src="' + srcImage(et.logo) + '" alt="">' : "";
  const lieu = genere ? logo + "<b>" + esc(et.nom || (D.espaceDoc && D.espaceDoc.nom) || "") + "</b>" : "";
  const lib = String(o.lib || "Consultation"), mode = libMode(o.mode), L = (t, v) => "<tr><th>" + t + "</th><td>" + v + "</td></tr>";
  const numero = num ? "<b>" + esc(num.numero) + "</b>" + (num.duplicata ? " · DUPLICATA" : "") + (num.annule ? '<br><small>remplace le n° ' + esc(num.annule) + ", annulé</small>" : "") : '<span class="rc-sans">sans numéro</span>';
  const mentions = [I.rSpe && c.specialite ? "Spécialité : " + c.specialite : "", [et.adresse, et.ville].filter(Boolean).length ? "Adresse : " + [et.nom, et.adresse, et.ville].filter(Boolean).join(", ") + (et.tel ? " · Tél. " + et.tel : "") : "",
    I.rIf && c.idFiscal ? "IF : " + c.idFiscal : "", I.rTp && c.tp ? "TP : " + c.tp : "", I.rIce && c.ice ? "ICE : " + c.ice : "", I.rInpe && c.inpe ? "INPE : " + c.inpe : ""].filter(Boolean);
  return '<div class="rc-haut"><div class="rc-lieu">' + lieu + '</div><div class="rc-date">Date : ' + dfrA(ctx.jour) + "</div></div>" + '<div class="rc-titre">REÇU</div>' +
    '<table class="rc-tab"><tbody>' + L("N° de reçu", numero) + L("Patient", esc(nomP) + (dos ? "<br><small>Dossier n° " + esc(dos) + "</small>" : "")) +
    L("Médecin", esc(c.nom || "") + (c.specialite ? "<br><i>" + esc(c.specialite) + "</i>" : "")) + L("Prestation", esc(lib.charAt(0).toUpperCase() + lib.slice(1)) + "<br><small>du " + dfrA(o.d) + "</small>") +
    L("Encaissement", "<b>" + dh2(o.m) + "</b><br><small>" + esc(montantEnLettres(o.m)) + "</small>" + (mode && !aEncaisser(o.mode) ? "<br>" + esc(mode) : "")) + "</tbody></table>" +
    '<div class="rc-visa"><span>Visa accueil</span><b>' + esc(ctx.par) + "</b><small>" + esc(ctx.heure) + "</small></div>" +
    (mentions.length ? '<p class="rc-ment">' + mentions.map(esc).join(" · ") + "</p>" : "") + // T6 (24/10/2026, d. 15) : plus de mention « Acte exonéré de TVA »
    '<p class="rc-sig">Cachet et signature</p>' + (genere && I.eLieu && et.nom ? '<div class="rc-pied">' + esc([et.nom, et.adresse, et.ville, et.tel ? "Tél. " + et.tel : ""].filter(Boolean).join(" · ")) + "</div>" : "");
}
const CSS_RECU = "html,body{margin:0}body{font-family:Arial,Helvetica,sans-serif;color:#000;font-size:10.5pt;line-height:1.35}.rc-haut{display:flex;justify-content:space-between;align-items:center;gap:4mm;margin-bottom:5mm}" +
  ".rc-lieu{display:flex;align-items:center;gap:3mm}.rc-logo{max-height:14mm;max-width:35mm}.rc-date{white-space:nowrap}.rc-titre{border:0.4mm solid #000;text-align:center;font-weight:bold;font-size:15pt;letter-spacing:3px;padding:2mm;margin:0 auto 5mm;width:45mm}" +
  ".rc-tab{width:100%;border-collapse:collapse;margin-bottom:4mm}.rc-tab th,.rc-tab td{border:0.3mm solid #000;padding:2mm 3mm;text-align:left;vertical-align:top}.rc-tab th{width:32%;background:#EEE;font-weight:bold}.rc-tab small{font-size:8.5pt}" +
  ".rc-sans{color:#777;font-style:italic}.rc-visa{border:0.3mm solid #000;width:45mm;margin:0 0 4mm auto;padding:1.5mm 2mm;display:flex;flex-direction:column;font-size:9pt}.rc-visa span{font-size:8pt;color:#444}" +
  ".rc-ment{font-size:8.5pt;color:#222;margin:0 0 4mm}.rc-sig{text-align:right;margin:6mm 0 14mm;font-weight:bold}.rc-pied{border-top:0.3mm solid #999;padding-top:2mm;font-size:8pt;color:#444;text-align:center}";
async function imprimerRecu(w, x, o) {
  if (!w) return;
  let num = null, echec = ""; try { num = await numeroterRecu(x, o); } catch (e) { echec = (e && e.message) || String(e); console.warn("numéro du reçu", e); toast("Reçu imprimé sans numéro (" + echec + ")."); }
  const html = htmlRecu(x, o, num, { jour: D.t, par: API.nomAgissant(), heure: hmMaintenant().replace(":", " h ") }); // heure du Maroc, horloge corrigée (S1)
  // T6 (24/10/2026, d. 50) : A5 sur une seule feuille, même avec toutes les mentions (le reçu est réduit jusqu'à tenir : zoom calculé dans la page
  // imprimée, d'après la hauteur utile) ; A4 si le cabinet le choisit (Paramètres › Impression › Reçus)
  const a4 = !!reglages().impression.recuA4, q = a4 ? "a4" : "a5", m = margesMm(q), mm = m.split(" ").map((v) => parseFloat(v) || 0);
  const css = "@page{size:" + (a4 ? "A4" : "A5") + " portrait;margin:" + m + "}" + CSS_RECU;
  const ajuste = a4 ? "" : "<script>(function(){var b=document.getElementById('rcPage');if(!b)return;b.style.width='" + (148 - 2 * (mm[1] || 0)) + "mm';var h=(210-" + (mm[0] + (mm[2] != null ? mm[2] : mm[0])) + ")*3.7795-6;if(b.scrollHeight>h)b.style.zoom=Math.max(0.55,h/b.scrollHeight).toFixed(3);b.style.width='';})();<\/script>";
  w.document.open(); w.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>&#8203;</title><style>' + css + '</style></head><body><div id="rcPage">' + html + "</div>" + ajuste + "</body></html>"); w.document.close();
  setTimeout(() => { try { w.focus(); w.print(); } catch (e) { /* fenêtre fermée */ } }, 400);
  if (!num && o.cle) journal(x, "Reçu imprimé SANS NUMÉRO (" + fmtMil(o.m) + " DH, " + dfrA(o.d) + ") : le numéro n'a pas pu être enregistré (" + String(echec).slice(0, 120) + ")");
  else journal(x, "Reçu " + (num ? num.numero + (num.duplicata ? " (duplicata)" : "") + " " : "") + "imprimé (" + fmtMil(o.m) + " DH, " + dfrA(o.d) + ")");
}
// Reçu réimprimé depuis « Historique des RDV » (prix à encaisser du dossier)
window.recuRdv = (pid, rid) => { const x = D.patients.find((p) => p.id === pid), E = x && encaissementsDe(x), o = E && (E.rdv || {})[rid], r = x && lireRdvs(x).find((v) => v.id === rid); if (!o || !r) return; imprimerRecu(window.open("", "_blank"), x, { d: r.dv || r.d, lib: libRdv(r), m: o.m, mode: o.mode, cle: cleRecuRdv(rid), med: medRdv(r) }); };
window.recuCons = (pid, k) => { const x = D.patients.find((p) => p.id === pid), E = x && encaissementsDe(x), o = E && (E.cons || {})[k]; if (!o) return; imprimerRecu(window.open("", "_blank"), x, { d: o.d, lib: "Consultation de chimiothérapie", m: o.m, mode: o.mode, cle: cleRecuCons(...String(k).split("|")) }); };
const RTO = { pid: null, id: null }; // radiothérapie ouverte dans le dossier
window.rtTog = (pid, id) => { RTO.pid = pid; RTO.id = RTO.id === id ? null : id; pageDossier(pid); };
// Rendez-vous en dehors des plages de l'établissement du patient (Configuration › Créneaux & horaires) : message, sinon ""
const JNOM = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
function horsHoraires(etab, d, h) {
  const pl = (horaires(etab).jours[new Date(d + "T12:00:00").getDay()] || []), qui = etab || "le cabinet", j = JNOM[new Date(d + "T12:00:00").getDay()];
  if (!pl.length) return cap(qui) + " est fermé le " + j + ".";
  if (h && !pl.some((p) => h >= p[0] && h < p[1])) return "À " + h + ", c'est en dehors des horaires de " + qui + " le " + j + " (" + pl.map((p) => p[0] + "–" + p[1]).join(", ") + ").";
  return "";
}
// Statut (venu / non venu) : noté avec son auteur (sp) ; seul le médecin annule un statut qu'il n'a pas posé lui-même
// (07/10/2026 : la secrétaire n'annule pas une consultation validée par le médecin ; anciens statuts sans auteur = médecin)
const annulable = (r) => estMed(D.membre.role) || (!!r.sp && r.sp === D.u.uid);
window.statutRdv = async (id, rid, st) => {
  const x = D.patients.find((p) => p.id === id); if (!x) return;
  const l = lireRdvs(x), r = l.find((v) => v.id === rid); if (!r) return; const ancien = r.st || "prevu";
  if (st === "prevu" && !annulable(r)) { toast("Statut posé par le médecin : lui seul peut l'annuler."); return; }
  if (st === "supprimer") { if (!confirm("Supprimer ce rendez-vous ?" + (ancien === "fait" ? "\n\nAttention : il est validé « Venu » ; son prix ne comptera plus dans le bilan." : ""))) return;
    // 3.15 c : consultation créée d'office (fin de RT, hebdomadaire de RT) : gardée comme « supprimée » pour ne pas être recréée
    if (r.rtfin || r.rtc) Object.assign(r, { st: "supprime", supLe: new Date().toISOString(), sp: D.u.uid }); else l.splice(l.indexOf(r), 1); }
  else if (st === "absent" && ancien === "prevu") { absentRdv(x, l, r); return; }
  else if (st === "fait") {
    // Médecin (« finances ») et secrétaire (« encaissements ») : prix de la consultation (réduction, gratuité) avant « venu »
    if ((peut("finances") || prixParServeur()) && r.type !== T_RTC) { prixVenu(x, l, r); return; }
    r.st = "fait"; r.dv = r.d; r.sp = D.u.uid;
  }
  else if (st === "absent") { r.st = "absent"; delete r.dv; r.sp = D.u.uid; }
  else { r.st = "prevu"; delete r.dv; delete r.sp; }
  try { await enregistrer(x, { rdvsJson: JSON.stringify(l) }, { fait: "Rendez-vous : venu", absent: "Rendez-vous : non venu", prevu: "Rendez-vous remis à prévu", supprimer: "Rendez-vous supprimé" }[st]); toast("Enregistré."); apresStatutRdv(x, r, st, ancien); reafficher(x.id); }
  catch (e) { toast(e.message); reafficher(x.id); }
};

// Fenêtre « Venu » : prix pré-rempli au tarif de l'établissement, modifiable ; enregistré dans les montants du dossier.
// Médecin : directement ; secrétaire : par le serveur (prixConsultation). Rendez-vous déjà « Venu » : seul le prix change.
async function prixVenu(x, l, r, opts) {
  const t = r.act || typeRdv(r.type), hs = t === "hospit", etab = x.P.hop || x.doc.etablissementId || "", v = (tarifsVus() && tarifAu(tarifsVus(), etab, t, r.d)) || { brut: 0, retro: 0, impot: 0 };
  const sec = !peut("finances"), deja = r.st === "fait";
  let M0 = {};
  if (sec) { try { const s = await getDoc(doc(db, "espaces", ESPACE, "encaissements", x.id)); const E = s.exists() ? JSON.parse(s.data().data || "{}") : {}, o = (E.rdv || {})[r.id]; if (o) M0 = { rdv: { [r.id]: o.tj != null ? { tj: o.tj } : o.v1 ? { v1: true, prix: o.m, b: o.b, mode: o.mode } : { brut: o.m, mode: o.mode } } }; } catch (e) {} }
  else { try { const s = await getDoc(doc(db, "espaces", ESPACE, "patientsFinances", x.id)); M0 = s.exists() ? JSON.parse(s.data().montantsJson || "{}") : {}; } catch (e) {} }
  // 21/10/2026 (signalé par Dr Bentahila : HCK 225 DH proposé au lieu de 250) : rendez-vous pris dans l'ancienne application et pas encore « Venu » :
  // son prix v1 est le NET du tarif (250 − 10 % = 225) ; il est validé comme un rendez-vous d'Onco360 (prix brut du tarif proposé, enregistré en brut,
  // le bilan retire l'impôt comme pour les autres) ; un prix v1 différent du tarif (réduction, gratuité) reste proposé tel quel
  const o0 = (M0.rdv || {})[r.id] || {}, v1Prevu = !!o0.v1 && !deja && !hs, v1 = !!o0.v1 && !v1Prevu, nj = hs ? joursH(r) : 1, lieuCab = payeCabinet(x) && !hs && !v1, cab = lieuCab && encaisseIci(); // lieu « payé au cabinet » (19.5)
  const prixV1 = v1Prevu && o0.prix != null && o0.b == null && +o0.prix !== Math.round(netTarif(v.brut || 0, v)) && +o0.prix !== +v.brut ? +o0.prix : null; // b : brut affiché noté à l'encaissement quand le prix v1 = net du tarif (secrétaire)
  const enc = cab && deja && aEncaisser(o0.mode); // « Encaisser » (salle d'attente, dossier) : la secrétaire reçoit le paiement
  // Médecin sans secrétaire ce jour-là : case « Encaisser maintenant » (décochée = « à encaisser » pour la secrétaire)
  const medCab = lieuCab && !encaisseIci(), dejaPaye = (!!o0.mode && !aEncaisser(o0.mode)) || !!(opts && opts.encaisser); // ouvert par « Encaisser » : case cochée
  const encT = enc || (medCab && deja && aEncaisser(o0.mode) && !!(opts && opts.encaisser)); // libellés « Encaisser »
  const pp = deja ? null : prixPrevu(x.id, "r-" + r.id, r.d); // prix convenu d'avance dans la salle d'attente (payé avant la consultation)
  const def = v1 ? o0.prix : prixV1 != null ? prixV1 : hs ? (o0.tj != null ? o0.tj : pp != null ? pp : v.brut) : o0.brut != null ? o0.brut : pp != null ? pp : v.brut;
  const fmt = (n) => (n == null || n === "" || isNaN(n) ? "" : Number(n).toLocaleString("fr-FR", { maximumFractionDigits: 2 }).replace(/[\u202f\u00a0]/g, " "));
  fenetre("<h3>" + esc(x.r.nm) + " – " + esc(libRdv(r)) + '</h3><p class="sous">' + cap(jourLong(r.d)) + (r.h ? " à " + r.h : "") + (hs && nj ? " · " + nj + " jour" + (nj > 1 ? "s" : "") + " d'hospitalisation" : "") + "</p>" +
    '<div class="form"><div><label for="pvM">' + (hs && !v1 ? "Tarif journalier (DH)" : "Montant de la consultation (DH)") + '</label><input id="pvM" class="mt" inputmode="decimal" value="' + esc(fmt(def)) + '"></div>' + (cab ? htmlMode(o0.mode) : medCab ? '<div id="pvEncZ"' + (dejaPaye ? "" : ' class="cache"') + ">" + htmlMode(o0.mode).replace(/^<div>|<\/div>$/g, "") + "</div>" : "") + "</div>" +
    (medCab ? '<label class="chk" style="margin:4px 0 6px"><input type="checkbox" id="pvEncK"' + (dejaPaye ? " checked" : "") + '> Encaisser maintenant (pas de secrétaire : le patient me paie)</label>' : "") +
    '<p class="mesures">Tarif ' + esc(etab || "de l'établissement") + " : " + fmt(v.brut) + " DH" + (hs ? " par jour" : "") + ". Modifiez le montant en cas de réduction ou de gratuité (0).</p>" + '<p class="mesures" id="pvRecu"></p>' +
    '<div class="err" id="fErr"></div><div class="boutons"><button class="bt gris" onclick="fermerFenetre()">Annuler</button>' + (cab || medCab ? '<button class="bt clair' + (medCab && !dejaPaye ? " cache" : "") + '" id="fOkR">' + ic("imprimer") + (encT ? "Encaisser et imprimer le reçu" : deja ? "Enregistrer et imprimer le reçu" : "Valider et imprimer le reçu") + "</button>" : "") + '<button class="bt vert" id="fOk"><svg class="pi"><use href="#i-check"/></svg>' + (encT ? "Encaisser" : deja ? "Enregistrer le prix" : "Valider : venu") + "</button></div>");
  let rcV = null; recuRemis(x, cleRecuRdv(r.id)).then((rc) => { rcV = rc; if (rc && $("pvRecu")) $("pvRecu").textContent = noteRecu(rc); }); // R-B5
  const valider = async (recu) => {
    // médecin dans un lieu « au cabinet » : le paiement déjà reçu est gardé, sinon « à encaisser » (la secrétaire encaissera)
    const m = parseFloat(val("pvM").replace(/[\s\u202f\u00a0]/g, "").replace(",", ".")), mode = cab || (medCab && $("pvEncK").checked) ? val("pvMode") : lieuCab ? "ae" : "";
    if (isNaN(m) || m < 0) { erreur("Indiquez le montant (0 si gratuit)."); return; }
    if (!avertirPrixRecu(rcV, m)) return; // R-B5 : un reçu a déjà été remis pour un autre montant
    const w = recu && mode !== "np" && m > 0 ? window.open("", "_blank") : null; // fenêtre d'impression ouverte au clic
    occupe($("fOk"), true);
    try {
      const lib = fmt(m) + " DH" + (hs && !v1 ? "/jour" : "") + (mode === "ae" ? ", à encaisser" : mode ? ", " + libMode(mode) : "");
      if (!deja) { r.st = "fait"; r.dv = r.d; r.sp = D.u.uid; await enregistrer(x, { rdvsJson: JSON.stringify(l) }, "Rendez-vous : venu (" + lib + ")"); }
      if (sec) {
        try { await appelServeur("prixConsultation", Object.assign({ espace: ESPACE, patientId: x.id, rdvId: r.id, montant: m }, mode ? { mode } : {}, v1Prevu ? { v1Prevu: true } : {})); }
        catch (e) { if (!deja) { fermerFenetre(); toast("Rendez-vous validé, mais le prix n'a pas pu être enregistré : " + e.message); apresStatutRdv(x, r, "fait", "prevu"); reafficher(x.id); return; } throw e; }
        oublierEncaissements(x.id);
      } else await majMontants(x, (M) => { M.rdv = M.rdv || {}; const o = M.rdv[r.id] = M.rdv[r.id] || {}; if (o.v1 && v1Prevu) { delete o.v1; delete o.prix; } if (o.v1) o.prix = m; else if (hs) { o.tj = m; delete o.brut; } else o.brut = m; if (mode) o.mode = mode; else delete o.mode; });
      if (deja) journal(x, "Prix de la consultation du " + dfrA(r.d) + " : " + lib);
      fermerFenetre(); toast("Enregistré."); if (deja) apresPrix(x, "r-" + r.id, r.d); else apresStatutRdv(x, r, "fait", "prevu"); reafficher(x.id);
      await noterPrixRecu(x, cleRecuRdv(r.id), rcV, m);
      if (w) imprimerRecu(w, x, { d: r.dv || r.d, lib: libRdv(r), m, mode, cle: cleRecuRdv(r.id), med: medRdv(r) });
    } catch (e) { if (w) w.close(); occupe($("fOk"), false); erreur(e.message || String(e)); }
  };
  $("fOk").onclick = () => valider(false);
  if ($("fOkR")) $("fOkR").onclick = () => valider(true);
  if ($("pvEncK")) $("pvEncK").onchange = () => { const on = $("pvEncK").checked; $("pvEncZ").classList.toggle("cache", !on); $("fOkR").classList.toggle("cache", !on); };
}
window.prixRdv = (id, rid, encaisser) => {
  const x = D.patients.find((p) => p.id === id); if (!x || !(peut("finances") || prixParServeur())) return;
  const l = lireRdvs(x), r = l.find((v) => v.id === rid); if (r && r.st === "fait") prixVenu(x, l, r, { encaisser: !!encaisser });
};
// « Non venu » : fenêtre Absent, avec ou sans report du rendez-vous (08/10/2026). Le rendez-vous manqué reste « Non venu »
// (trace de l'absence) ; le report crée un nouveau rendez-vous (même type, motif, note) marqué « Reporté (initialement le …) ».
function prochainJour(etab, d) { let z = d; for (let g = 0; g < 60; g++) { z = addJ(z, 1); if (ouvre(z, D.ctx.feries) && !absenceLe(z) && (horaires(etab).jours[new Date(z + "T12:00:00").getDay()] || []).length) return z; } return addJ(d, 1); }
// « Non venu » sans report, sans fenêtre (Clôturer la journée de la salle d'attente, SA6 11/10/2026)
window.rdvAbsentDirect = async (pid, rid) => {
  const x = D.patients.find((p) => p.id === pid); if (!x) return false;
  const l = lireRdvs(x), r = l.find((v) => v.id === rid); if (!r || (r.st || "prevu") !== "prevu") return false;
  r.st = "absent"; delete r.dv; r.sp = D.u.uid;
  await enregistrer(x, { rdvsJson: JSON.stringify(l) }, "Rendez-vous : non venu (journée clôturée)"); apresStatutRdv(x, r, "absent", "prevu"); return true;
};
function absentRdv(x, l, r) {
  const etab = r.lieu || x.doc.etablissementId, d0 = prochainJour(etab, r.d > D.t ? r.d : D.t);
  fenetre("<h3>Absent – " + esc(x.r.nm) + '</h3><p class="sous">' + esc(libRdv(r)) + " · " + cap(jourLong(r.d)) + (r.h ? " à " + r.h : "") + "</p>" +
    '<div class="form"><div class="large"><label style="font-weight:normal"><input type="radio" name="abR" value="oui" checked style="width:auto;margin-right:6px">Reporter le rendez-vous</label>' +
    '<label style="font-weight:normal"><input type="radio" name="abR" value="non" style="width:auto;margin-right:6px">Ne pas reporter</label></div>' +
    '<div id="abZ" class="large form" style="padding:0"><div><label for="abD">Nouvelle date</label><input id="abD" type="date" value="' + d0 + '"></div><div><label for="abH">Heure</label><input id="abH" type="time" step="900" value="' + esc(r.h || "") + '"></div><p class="large mesures" id="abHor" style="margin:0"></p></div></div>' +
    '<div class="err" id="fErr"></div><div class="boutons"><button class="bt gris" onclick="fermerFenetre()">Annuler</button><button class="bt rouge" id="fOk">Marquer absent</button></div>');
  const maj = () => { const ok = (document.querySelector('input[name="abR"]:checked') || {}).value === "oui"; $("abZ").classList.toggle("cache", !ok); $("fOk").textContent = ok ? "Absent et reporter" : "Marquer absent"; const d = val("abD"); const pl = d ? horaires(etab).jours[new Date(d + "T12:00:00").getDay()] || [] : []; $("abHor").textContent = d ? "Horaires " + (etab || "du cabinet") + " le " + JNOM[new Date(d + "T12:00:00").getDay()] + " : " + (pl.length ? pl.map((p) => p[0] + "–" + p[1]).join(", ") : "fermé") + "." : ""; };
  document.querySelectorAll('input[name="abR"]').forEach((e) => { e.onchange = maj; }); $("abD").onchange = maj; maj();
  $("fOk").onclick = async () => {
    const rep = (document.querySelector('input[name="abR"]:checked') || {}).value === "oui", d = val("abD"), h = val("abH");
    if (rep) {
      if (!d) { erreur("Indiquez la nouvelle date."); return; }
      const ab = absenceLe(d), fe = !ab && ferieLe(d), hz = horsHoraires(etab, d, h);
      if (!ab && !fe && hz && !confirm(hz + "\n\nReporter quand même ?")) return;
      if (fe && !confirm("Le " + dfrA(d) + " est un jour férié (" + (fe.nom || "") + "). Reporter quand même ?")) return;
      if (ab && !confirm("Absence prévue ce jour-là (" + (ab.m || "absence") + "). Reporter quand même ?")) return;
      if (h && !accepterConflit(d, h, dureeDe(r, etab), { pid: x.id, rid: r.id }, medRdv(r))) return; // R-A3 : créneau déjà pris
    }
    r.st = "absent"; delete r.dv; r.sp = D.u.uid;
    // R-C1 (19/10/2026, audit 4 C2) : le report garde le médecin, la durée et le lieu du rendez-vous manqué ; confirmation WhatsApp proposée
    if (rep) { const n = { id: "r" + Date.now().toString(36), type: r.type, d, h, n: r.n || "", st: "prevu", du: dureeDe(r, etab), med: medRdv(r), rep: [{ d: r.d, h: r.h || "", le: D.t, abs: true }] }; if (!n.med) delete n.med; if (r.act) n.act = r.act; if (r.mo) n.mo = r.mo; if (r.lieu) n.lieu = r.lieu; l.push(n); }
    occupe($("fOk"), true);
    try { await enregistrer(x, { rdvsJson: JSON.stringify(l) }, "Rendez-vous : non venu" + (rep ? " (reporté au " + dfrA(d) + (h ? " à " + h : "") + ")" : "")); fermerFenetre(); toast(rep ? "Absent ; rendez-vous reporté au " + dfrA(d) + (h ? " à " + h : "") + "." : "Enregistré."); apresStatutRdv(x, r, "absent", "prevu"); reafficher(x.id);
      if (rep && d >= D.t && numeroWA(x.P.tel) && fnOn("agenda.whatsapp")) proposerConfirmation(x, d, h, "Rendez-vous reporté"); }
    catch (e) { occupe($("fOk"), false); erreur(e.message); }
  };
}
// Nouveau rendez-vous depuis le tableau de bord ou l'agenda : choisir d'abord le patient
window.nouveauRdv = (d, h, etab, med) => { // med : médecin choisi dans le filtre de l'agenda (AG4)
  if (!peut("rendezvous")) { toast("Vous n'avez pas le droit de gérer les rendez-vous."); return; }
  fenetre("<h3>Nouveau rendez-vous" + (d ? " – " + cap(jourLong(d)) + (h ? " à " + h : "") : "") + '</h3><div class="form"><div class="large"><label for="rq">Patient</label><input id="rq" placeholder="Nom, prénom…" autocomplete="off"></div></div><div id="rqL" class="liste-choix"></div>' + (peut("creerPatient") ? '<div class="rq-nv"><span>Patient absent de la liste ?</span><button class="b2" id="rqNv" title="Créer le dossier, puis le rendez-vous">' + ic("plus") + "Nouveau patient</button></div>" : '<div class="rq-nv"><span>Patient absent de la liste : demandez la création de son dossier.</span></div>') + '<div class="boutons"><button class="bt gris" onclick="fermerFenetre()">Annuler</button></div>');
  const maj = () => { const m = sansAcc(val("rq")).split(/\s+/).filter(Boolean), l = D.patients.filter((x) => (!etab || x.doc.etablissementId === etab) && m.every((w) => sansAcc(x.r.nm + " " + numDossier(x) + " " + dfrA(x.r.ddn)).indexOf(w) >= 0)).slice(0, 8);
    $("rqL").innerHTML = l.map((x) => '<button class="pat" style="width:100%;background:none;border:0;border-bottom:1px solid var(--trait);text-align:left" data-id="' + esc(x.id) + '">' + bulle(x) + '<div class="tx"><b>' + esc(x.r.nm) + "</b><span>" + esc([numDossier(x) ? "N° " + numDossier(x) : "", x.r.ddn ? dfrA(x.r.ddn) : "", x.r.diag].filter(Boolean).join(" · ")) + "</span></div></button>").join("") || '<p class="sous">Aucun patient trouvé.</p>'; };
  $("rq").oninput = maj; maj();
  $("rqL").onclick = (ev) => { const b = ev.target.closest("[data-id]"); if (b) window.ouvrirRdv(b.dataset.id, null, d || med ? Object.assign({ d: d || D.t, h: h || "" }, med ? { med } : {}) : null); };
  if ($("rqNv")) $("rqNv").onclick = () => creerPatient({ nom: val("rq"), ensuite: (x) => window.ouvrirRdv(x.id, null, d || med ? Object.assign({ d: d || D.t, h: h || "" }, med ? { med } : {}) : null) });
};
// Créneaux d'un jour (19.4) : plages de l'établissement découpées selon la durée d'un rendez-vous ; pris = un rendez-vous de
// consultation (tous les patients visibles, sauf celui qu'on modifie) qui chevauche le créneau
const DUREES_RDV = [10, 15, 20, 30, 40, 45, 60, 90, 120]; // durées proposées pour un rendez-vous (AG2)
const mnH = (h) => { const p = String(h || "").split(":"); return +p[0] * 60 + (+p[1] || 0); };
const hhM = (m) => ("0" + Math.floor(m / 60)).slice(-2) + ":" + ("0" + (m % 60)).slice(-2);
function rdvsDuJour(d, sauf, med) { return occupDuJour(d, sauf, med).avec; }
// R-A3 (18/10/2026) : tout ce qui occupe le médecin ce jour-là (moteur/creneaux.js) : rendez-vous, consultations des séances de chimio (heure
// choisie, sinon placée d'après la séance), étapes de RT avec heure ; « sans » = consultations du jour sans heure (listées, pas de créneau)
function occupDuJour(d, sauf, med) {
  if (!voitRdv()) return { avec: [], sans: [] };
  const pats = D.patients.map((x) => ({ id: x.id, nm: x.r.nm, etab: x.doc.etablissementId, rdvs: x.P.rdvs || [], ag: x.r.ag || [] }));
  return occupations(pats, d, { sauf, med, multi: multiMed(), titulaire: titulaireUid(), dureeDe: (r, etab) => dureeDe(r, etab) });
}
// Avertissement d'un clic quand l'heure choisie touche autre chose (« garder quand même ? ») ; vrai = on continue
function accepterConflit(d, h, du, sauf, med) { // med absent : celui du titulaire (consultation de chimio, étape de RT : pas encore de médecin noté)
  const cf = chevauche(rdvsDuJour(d, sauf, med === undefined ? titulaireUid() : med), h, du);
  return !cf.length || confirm("Créneau déjà pris le " + dfrA(d) + " par : " + texteConflit(cf) + ".\n\nGarder quand même ?");
}
API.conflitAccepte = accepterConflit; // chimio.js (heure de la consultation d'une séance)
// AG2 : créneaux au pas du lieu ; proposé = la durée voulue (`duV`, sinon le pas) tient avant la fin de la plage ; pris = touche
// un autre rendez-vous (chacun avec sa propre durée)
function creneaux(etab, d, sauf, duV, med) {
  // créneaux proposés toutes les 30 min au plus (moins pour un type court), quelle que soit la durée du type (12/10/2026)
  const H = horaires(etab), du = duV || H.duree || 30, pas = Math.min(du, H.duree || 30), pl = (H.jours[new Date(d + "T12:00:00").getDay()] || []).slice().sort((a, b) => a[0].localeCompare(b[0])), pris = rdvsDuJour(d, sauf, med);
  const n = heureMaroc(), now = d === D.t ? n.m : -1, out = []; // « maintenant » à l'heure du Maroc, horloge corrigée (C10)
  pl.forEach(([a, b]) => { for (let m = mnH(a); m + du <= mnH(b); m += pas) { if (m + pas <= now) continue; out.push({ h: hhM(m), occ: pris.filter((r) => mnH(r.h) < m + du && m < mnH(r.h) + r.du) }); } });
  return { l: out, du, pris };
}
// Bouton « Décaler » des absences : rendez-vous → fenêtre de modification ; cure, séance ou radiothérapie → dossier
window.decaler = (pid, k) => { const p = String(k || "").split("|"); if (p[1] === "r") window.ouvrirRdv(pid, p.slice(2).join("|")); else window.ouvrirDossier(pid); };

// ───── Radiothérapie : prescription, documents ─────
window.ouvrirRT = (id, rid) => {
  const x = D.patients.find((p) => p.id === id); if (!x) return;
  if (!traitModRT()) { toast("Vous n'avez pas le droit de modifier la radiothérapie."); return; }
  const l = JSON.parse(x.doc.rtsJson || "[]"), r0 = rid ? l.find((v) => v.id === rid) : null, R = r0 || { hop: x.doc.etablissementId, ryt: "1", nbA: 1 };
  const ch = (i, lib, v, o) => '<div class="' + ((o && o.large) ? "large" : "") + '"><label for="' + i + '">' + lib + '</label><input id="' + i + '" value="' + esc(v == null ? "" : v) + '"' + (o && o.type ? ' type="' + o.type + '"' : "") + (o && o.liste ? ' list="' + o.liste + '"' : "") + (o && o.mode ? ' inputmode="' + o.mode + '"' : "") + "></div>";
  const sel = (i, lib, v, opts, o) => '<div class="' + ((o && o.large) ? "large" : "") + '"><label for="' + i + '">' + lib + '</label><select id="' + i + '">' + opts.map((p) => '<option value="' + esc(p[0]) + '"' + (String(p[0]) === String(v == null ? "" : v) ? " selected" : "") + ">" + esc(p[1]) + "</option>").join("") + "</select></div>";
  panneau("<h3>" + (r0 ? "Modifier la prescription" : "Nouvelle prescription de radiothérapie") + " – " + esc(x.r.nm) + '</h3><div class="form rt-f">' +
    '<div class="large"><label for="rActe">Acte</label><select id="rActe"><option value="">— Choisir l\'acte —</option>' + listeActes(R.acte).map((a) => '<option' + (a === R.acte ? " selected" : "") + ">" + esc(a) + "</option>").join("") + "</select></div>" +
    // R-C3 (19/10/2026) : lieu de la RT (pré-rempli avec celui du patient, modifiable : vu au cabinet, traité en clinique) et médecin (à partir de
    // 2 médecins ; défaut : celui du patient, sinon le médecin connecté) : étapes, consultations automatiques, agenda, WhatsApp, bilan (r.hop)
    sel("rHop", "Lieu de la radiothérapie", R.hop || "", [["", "—"]].concat(D.etabs.map((e) => [e.code, e.code + " – " + e.nom + (e.code === x.doc.etablissementId ? " (lieu du patient)" : "")])), {}) +
    (multiMed() ? sel("rMed", "Médecin", R.med || medPourPatient(x), D.medecins.map((m) => [m.uid, m.nom]).concat(R.med && !D.medecins.some((m) => m.uid === R.med) ? [[R.med, "Médecin retiré de l'équipe"]] : []), {}) : "<div></div>") +
    sel("rTech", "Technique", R.tech || "", [["", "—"], ["stereo", "Stéréotaxie"], ["vmat", "VMAT"], ["imrt", "IMRT"], ["3d", "3D"]], {}) + sel("rInt", "Intention", R.intent || "", [["", "—"], ["curative", "Curative"], ["palliative", "Palliative"]], {}) +
    // 3.5 (12/10/2026) : volumes [{ nom, dose, nb, ty }] : le principal (rDose / rNb), puis des compléments séquentiels (à la suite) ou
    // intégrés (mêmes séances) ; pas d'organes à risque (Onco360 n'est pas ARIA)
    '<div class="large"><label>Volumes</label><div id="rVol"></div><div class="actr" style="justify-content:flex-start;margin-top:6px"><button type="button" class="bt clair petit" onclick="rtVolAj(\'seq\')">' + ic("plus") + 'Complément séquentiel</button><button type="button" class="bt clair petit" onclick="rtVolAj(\'int\')">' + ic("plus") + "Complément intégré</button></div>" +
      '<div id="rDpf" class="mesures" style="font-size:14px;color:var(--titre);margin-top:6px">—</div></div>' +
    sel("rRyt", "Rythme", R.ryt || "1", RYTHMES, {}) + ch("rNbA", "Nombre d'actes", R.nbA || 1, { mode: "numeric" }) +
    // R-C1 (audit 4 d. 20) : le calcul ne change pas ; l'aide dit la différence entre les deux rythmes
    '<p class="large mesures" style="margin:-4px 0 0">« Jours choisis » donne un rythme fixe (par exemple lundi, mercredi, vendredi). « 1 jour sur 2 » alterne sur les jours ouvrés : après un week-end ou un jour férié, le jour de la semaine change.</p>' +
    '<div class="large' + (R.ryt === "jours" ? "" : " cache") + '" id="rJoursZ"><label>Jours de séance</label><div class="actr" style="justify-content:flex-start">' + [[1, "Lundi"], [2, "Mardi"], [3, "Mercredi"], [4, "Jeudi"], [5, "Vendredi"]].map(([k, l]) => '<label class="chk" style="font-weight:normal"><input type="checkbox" id="rJ' + k + '"' + ((R.jours || [1, 3, 5]).indexOf(k) >= 0 ? " checked" : "") + "> " + l + "</label>").join("") + "</div></div>" +
    ch("rScan", "Scanner de centrage", R.scan, { type: "date" }) + ch("rDeb", "1re séance", R.deb, { type: "date" }) +
    '<div class="large"><label>Fin prévue (calculée)</label><div id="rFinCalc" class="mesures" style="font-size:15px;font-weight:bold;color:var(--titre)">—</div></div>' +
    ch("rFinPrev", "Fin prévue (si différente)", R.finPrev, { type: "date" }) + "<div></div>" +
    sel("rCj", "Consultation hebdomadaire", R.cj || "", [["", "Aucune"], ["1", "Lundi"], ["2", "Mardi"], ["3", "Mercredi"], ["4", "Jeudi"], ["5", "Vendredi"]], {}) + ch("rCh", "Heure de la consultation", R.ch, { type: "time" }) +
    '<div class="large"><label><input id="rVmat" type="checkbox" style="width:auto;margin-right:8px"' + (R.vmat ? " checked" : "") + ">Supplément VMAT (facturation)</label></div>" +
    (peut("finances") && D.tarifs ? '<div class="large cache" id="rVmatM" style="background:#FFF7D6;border-radius:10px;padding:10px"><label for="rVmatP">Montant VMAT (DH)</label><input id="rVmatP" inputmode="decimal" value="' + esc(R.vmatPrix != null ? R.vmatPrix : D.tarifs.vmat != null ? D.tarifs.vmat : "") + '"></div>' : "") +
    "</div>" + // 19/10/2026 (demande de Dr Bentahila) : « Résumé clinique / notes » retiré ; une note déjà écrite est gardée (onglet Radiothérapie)
    '<div class="err" id="fErr"></div><div class="boutons">' + (r0 ? '<button class="bt gris" id="rSup" style="margin-right:auto;color:var(--rouge)">Supprimer</button>' : "") + '<button class="bt gris" onclick="fermerFenetre()">Annuler</button><button class="bt plein" id="fOk">Enregistrer</button></div>');
  const VOL = volumesRT(R).length ? volumesRT(R) : [{ nom: "", dose: "", nb: "", ty: "p" }];
  const joursCoches = () => [1, 2, 3, 4, 5].filter((k) => $("rJ" + k) && $("rJ" + k).checked);
  const lireVol = () => { VOL[0].dose = val("rDose"); VOL[0].nb = val("rNb"); VOL[0].nom = val("rvM0"); VOL.forEach((v, i) => { if (!i) return; v.nom = val("rvM" + i); v.dose = val("rvD" + i); if (v.ty === "seq") v.nb = val("rvN" + i); }); };
  const dessinerVol = () => {
    $("rVol").innerHTML = VOL.map((v, i) => '<div class="form rt-vol" style="grid-template-columns:2fr 1fr 1fr auto;margin:0 0 6px;align-items:end"><div><label for="rvM' + i + '">' + (i ? (v.ty === "int" ? "Complément intégré" : "Complément séquentiel") : "Volume principal") + '</label><input id="rvM' + i + '" value="' + esc(v.nom || "") + '" placeholder="' + (i ? "ex. lit tumoral" : "ex. sein gauche") + '"></div>' +
      '<div><label for="' + (i ? "rvD" + i : "rDose") + '">Dose (Gy)</label><input id="' + (i ? "rvD" + i : "rDose") + '" inputmode="decimal" value="' + esc(v.dose || "") + '"></div>' +
      '<div><label for="' + (i ? "rvN" + i : "rNb") + '">' + (i && v.ty === "int" ? "Fractions (mêmes)" : "Fractions") + '</label><input id="' + (i ? "rvN" + i : "rNb") + '" inputmode="numeric" value="' + esc(i && v.ty === "int" ? "" : v.nb || "") + '"' + (i && v.ty === "int" ? ' disabled placeholder="= principal"' : "") + "></div>" +
      "<div>" + (i ? '<button type="button" class="sup" title="Retirer ce complément" aria-label="Retirer ce complément" onclick="rtVolSup(' + i + ')">' + ic("corbeille") + "</button>" : "") + "</div></div>").join("");
    $("rVol").querySelectorAll("input").forEach((e) => { e.oninput = calc; });
  };
  window.rtVolAj = (ty) => { lireVol(); VOL.push({ nom: "", dose: "", nb: "", ty }); dessinerVol(); calc(); };
  window.rtVolSup = (i) => { lireVol(); VOL.splice(i, 1); dessinerVol(); calc(); };
  const calc = () => {
    lireVol(); const n = seancesVolumes(VOL);
    $("rDpf").innerHTML = VOL.some((v) => v.dose) ? VOL.map((v) => esc(texteVolume(v, VOL))).join("<br>") + (VOL.length > 1 && n ? "<br><b>" + n + " séances</b>" : "") : "—";
    $("rJoursZ").classList.toggle("cache", val("rRyt") !== "jours");
    const f = val("rDeb") && n ? finRT({ deb: val("rDeb"), nb: n, ryt: val("rRyt"), jours: joursCoches() }, D.ctx.feries) : null;
    $("rFinCalc").textContent = f ? cap(jourLong(f)) + " " + f.slice(0, 4) : "—";
  };
  dessinerVol(); ["rDeb", "rRyt"].forEach((i) => { $(i).oninput = calc; $(i).onchange = calc; }); [1, 2, 3, 4, 5].forEach((k) => { $("rJ" + k).onchange = calc; }); calc();
  // Comme l'application actuelle : stéréotaxie = 1 jour sur 2 ; curiethérapie = au moins 2 actes ; montant VMAT pour le droit « finances »
  $("rActe").onchange = () => { const a = val("rActe"); $("rRyt").value = /st[ée]r[ée]otax/i.test(a) ? "2" : "1"; if (/curieth/i.test(a) && !(parseInt(val("rNbA"), 10) >= 2)) $("rNbA").value = "2"; calc(); };
  const zV = $("rVmatM"); if (zV) { const majV = () => zV.classList.toggle("cache", !$("rVmat").checked); $("rVmat").onchange = majV; majV(); }
  const sauver = (liste, quoi) => sauverRT(x, liste, quoi);
  if (r0) $("rSup").onclick = async () => { if (!confirm("Supprimer cette prescription de radiothérapie ?")) return; try { await sauver(l.filter((v) => v.id !== rid), "Prescription de radiothérapie supprimée"); fermerFenetre(); toast("Prescription supprimée."); pageDossier(x.id); } catch (e) { erreur(e.message); } };
  $("fOk").onclick = async () => {
    if (!val("rActe")) { erreur("Indiquez l'acte."); return; }
    lireVol(); const n0 = val("rNb"); if (n0 && !(parseInt(n0, 10) > 0)) { erreur("Le nombre de fractions doit être un nombre."); return; }
    if (VOL.slice(1).some((v) => v.ty === "seq" && v.dose && !(parseInt(v.nb, 10) > 0))) { erreur("Indiquez le nombre de fractions de chaque complément séquentiel."); return; }
    if (val("rRyt") === "jours" && !joursCoches().length) { erreur("Cochez au moins un jour de séance."); return; }
    const n = String(seancesVolumes(VOL) || n0 || ""); // séances = principal + compléments séquentiels
    // 2.5 (12/10/2026, audit) : dates dans l'ordre ; dose par fraction > 22 Gy ou dose totale > 80 Gy → confirmation
    if (val("rScan") && val("rDeb") && val("rDeb") < val("rScan")) { erreur("La 1re séance est avant le scanner de centrage (" + dfrA(val("rScan")) + ")."); return; }
    if (val("rDeb") && val("rFinPrev") && val("rFinPrev") < val("rDeb")) { erreur("La fin prévue est avant la 1re séance."); return; }
    // 3.5 : chaque volume (dose par fraction) ; dose totale du volume principal + compléments séquentiels, et de chaque complément intégré
    const nb0 = (z) => parseFloat(String(z || "").replace(",", ".")) || 0, dT = nb0(VOL[0].dose) + VOL.filter((v, i) => i && v.ty === "seq").reduce((t0, v) => t0 + nb0(v.dose), 0);
    const trop = VOL.filter((v) => (dpfVolume(v, VOL) || 0) > 22).map((v) => texteVolume(v, VOL)), tropT = dT > 80 || VOL.some((v) => v.ty === "int" && nb0(v.dose) > 80);
    if (trop.length || tropT) { if (!confirm("Vérifiez la prescription :\n" + VOL.map((v) => "• " + texteVolume(v, VOL)).join("\n") + "\n\n" + (trop.length ? "Plus de 22 Gy par fraction. " : "") + (tropT ? "Plus de 80 Gy au total (" + String(dT).replace(".", ",") + " Gy)." : "") + "\n\nEnregistrer quand même ?")) return; }
    // dose, fractions, rythme ou technique changés après la dosimétrie validée → la dosimétrie est à revalider (gardée dans l'historique)
    const volP = VOL.length > 1 || VOL[0].nom ? VOL.map((v) => { const o = { nom: v.nom || "", dose: String(v.dose || "").replace(",", "."), ty: v.ty }; if (v.ty !== "int") o.nb = String(v.nb || ""); return o; }) : null;
    const cle = (o) => [String(o.dose || "").replace(",", "."), String(o.nb || ""), o.ryt || "1", o.tech || "", JSON.stringify(o.vol || null), o.ryt === "jours" ? (o.jours || []).join(",") : ""].join("|");
    const neuf = { dose: val("rDose"), nb: n, ryt: val("rRyt"), tech: val("rTech"), vol: volP, jours: joursCoches() };
    const revalider = r0 && r0.dosi && !r0.fin && cle(r0) !== cle(neuf);
    if (revalider && !confirm("La prescription change alors que la dosimétrie a été validée le " + dfrA(r0.dosi) + ".\nLa dosimétrie devra être revalidée (la validation actuelle est gardée dans l'historique et une tâche « Valider la dosimétrie » est recréée).\n\nEnregistrer ?")) return;
    const r = r0 || { id: "rt" + Date.now().toString(36), cree: D.t };
    if (revalider) { r.dosiHist = (r.dosiHist || []).concat([{ dosi: r.dosi, dosiPar: r.dosiPar || "", dosiLe: r.dosiLe || "", retireLe: new Date().toISOString(), raison: "prescription modifiée : " + cle(r0) + " → " + cle(neuf) }]); r.dosiN = (r.dosiN || 0) + 1; delete r.dosi; delete r.dosiPar; delete r.dosiLe; }
    const medR = $("rMed") ? val("rMed") : r.med || medPourPatient(x); if (medR) r.med = medR; // R-C3
    Object.assign(r, { acte: val("rActe"), hop: val("rHop"), tech: val("rTech"), intent: val("rInt"), dose: val("rDose").replace(",", "."), nb: n, ryt: val("rRyt"), vol: volP, jours: val("rRyt") === "jours" ? joursCoches() : null, nbA: val("rNbA") || "1", scan: val("rScan"), deb: val("rDeb"), finPrev: val("rFinPrev"), cj: val("rCj"), ch: val("rCh"), vmat: $("rVmat").checked, note: $("rNote") ? $("rNote").value.trim() : R.note || "" });
    ["finPrev", "scan", "deb", "cj", "ch", "tech", "intent", "dose", "note", "vol", "jours"].forEach((k) => { if (!r[k]) delete r[k]; });
    const liste = r0 ? l : l.concat([r]), acteAvant = r0 ? (x.P.rts || []).find((v) => v.id === rid) : null;
    occupe($("fOk"), true);
    try {
      if (peut("finances") && D.tarifs) await majMontants(x, (M) => { const m = M.rt[r.id] = M.rt[r.id] || {}, t = (D.tarifs.actesRT || []).find((a) => a.nom === r.acte);
        if (t && (m.prix == null || !acteAvant || acteAvant.acte !== r.acte)) m.prix = t.prix;
        if (r.vmat) { const v = parseFloat(String(val("rVmatP")).replace(",", ".")); m.vmatPrix = isNaN(v) ? (D.tarifs.vmat != null ? D.tarifs.vmat : null) : v; } });
      RTO.pid = x.id; RTO.id = r.id; /* la prescription enregistrée est celle qu'on voit ouverte (19/10/2026) */ await sauver(liste, r0 ? "Prescription de radiothérapie modifiée" + (revalider ? " (dosimétrie à revalider)" : "") : "Prescription de radiothérapie ajoutée"); fermerFenetre(); toast("Prescription enregistrée."); pageDossier(x.id); }
    catch (e) { occupe($("fOk"), false); erreur(e.message); }
  };
};
// Scanner de centrage ou 1re séance, depuis « Rendez-vous et tâches à venir » (12/10/2026) : date et heure (facultative) ; la fin et la
// consultation de fin de radiothérapie suivent la 1re séance (sauverRT) ; droit « radiothérapie : modifier »
// 3.16 (12/10/2026) : aussi la fin de radiothérapie prévue (z = "fin") : surtout pour l'heure ; une date changée = fin prévue saisie à la
// main (finPrev, comme « Fin prévue (si différente) » de la prescription), la consultation de fin suit. apres : retour (agenda)
window.modifierEtapeRT = (id, rid, z, apres, pre) => { // pre { d, h } : glissé dans l'agenda
  const x = D.patients.find((p) => p.id === id); if (!x || !traitModRT()) { toast("Vous n'avez pas le droit de modifier la radiothérapie."); return; }
  const l = JSON.parse(x.doc.rtsJson || "[]"), r = l.find((v) => v.id === rid); if (!r) return;
  const deb = z === "deb", fin = z === "fin", kd = deb ? "deb" : fin ? "finPrev" : "scan", kh = deb ? "debH" : fin ? "finH" : "scanH", H = r[kh] || {}, du = +H.du || 30;
  const finCalc = fin ? finRTcalc(r, D.ctx.feries) : null, d0 = fin ? r.finPrev || finCalc || "" : r[kd] || "";
  fenetre("<h3>" + (deb ? "1re séance de radiothérapie" : fin ? "Fin de radiothérapie prévue" : "Scanner de centrage") + " – " + esc(x.r.nm) + '</h3><p class="sous">' + esc(r.acte || "Radiothérapie") + '</p><div class="form">' +
    '<div><label for="eD">Date</label><input id="eD" type="date" value="' + esc(d0) + '"></div><div><label for="eH">Heure (facultative)</label><input id="eH" type="time" step="900" value="' + esc(H.h || "") + '"></div>' +
    '<div><label for="eDu">Durée</label><select id="eDu">' + [15, 20, 30, 45, 60, 90].concat([15, 20, 30, 45, 60, 90].indexOf(du) < 0 ? [du] : []).sort((a2, z2) => a2 - z2).map((m) => '<option value="' + m + '"' + (m === du ? " selected" : "") + ">" + m + " min</option>").join("") + "</select></div></div>" +
    (fin ? '<p class="mesures">Une autre date devient la fin prévue (comme « Fin prévue » de la prescription' + (finCalc ? ", calculée : " + dfrA(finCalc) : "") + ") ; la consultation de fin de radiothérapie suit (si elle n\'a pas été déplacée à la main).</p>" : "") +
    (deb ? '<p class="mesures">Le début de la radiothérapie est déplacé dans la prescription : fin prévue recalculée (rythme et nombre de séances), consultations hebdomadaires et consultation de fin de radiothérapie (si elle n\'a pas été déplacée à la main) suivent. L\'heure ne change rien d\'autre.</p>' : "") +
    '<div class="err" id="fErr"></div><div class="boutons"><button class="bt gris" onclick="fermerFenetre()">Annuler</button><button class="bt plein" id="fOk">Enregistrer</button></div>');
  if (pre) { $("eD").value = pre.d; if (pre.h) $("eH").value = pre.h; }
  $("fOk").onclick = async () => {
    const d = val("eD"), h = val("eH"); if (!d) { erreur("Indiquez la date."); return; }
    if (deb && r.scan && d < r.scan) { erreur("La 1re séance est avant le scanner de centrage (" + dfrA(r.scan) + ")."); return; }
    if (fin && r.deb && d < r.deb) { erreur("La fin est avant la 1re séance (" + dfrA(r.deb) + ")."); return; }
    if (!deb && !fin && r.deb && d > r.deb) { erreur("Le scanner est après la 1re séance (" + dfrA(r.deb) + ")."); return; }
    if (h && (d !== d0 || h !== (H.h || "")) && !accepterConflit(d, h, +val("eDu") || du, { pid: x.id, k: x.id + "|rt|" + (r.id || l.indexOf(r)) + "|" + (deb ? "deb" : fin ? "fin" : "scan") }, r.med || medPatient(x) || undefined)) return; // R-A3 ; R-C3 : médecin de la RT
    // 1re séance déplacée = début de la radiothérapie déplacé dans la prescription : fin calculée, consultations hebdomadaires et consultation
    // de fin (si elle n'a pas été déplacée à la main) suivent (sauverRT) ; une fin saisie à la main est décalée d'autant de jours
    if (deb && r.deb && r.finPrev && d !== r.deb) r.finPrev = addJ(r.finPrev, ecart(d, r.deb));
    if (fin) { if (d === finCalc) delete r.finPrev; else if (d !== d0 || r.finPrev) r.finPrev = d; } else r[kd] = d;
    if (h) r[kh] = { h, du: +val("eDu") || du }; else delete r[kh];
    occupe($("fOk"), true);
    try { await sauverRT(x, l, (deb ? "1re séance de radiothérapie" : fin ? "Fin de radiothérapie prévue" : "Scanner de centrage") + " : " + dfrA(d) + (h ? " à " + h : "")); fermerFenetre(); toast("Enregistré."); if (apres) apres(); else pageDossier(x.id);
      if (!fin && (d !== d0 || h !== (H.h || ""))) confirmerApres(x, d, h, deb ? "1re séance de radiothérapie déplacée" : "Scanner de centrage déplacé"); } // R-C5
    catch (e) { occupe($("fOk"), false); erreur(e.message); }
  };
};
// Enregistre les prescriptions et régénère les consultations hebdomadaires « en cours de radiothérapie »
async function sauverRT(x, liste, quoi) {
  const P2 = { rts: liste, rdvs: JSON.parse(x.doc.rdvsJson || "[]") }, avant = JSON.stringify(P2.rdvs);
  const RA = reglages().auto; // rendez-vous créés d'office : décochables dans Paramètres › Rendez-vous automatiques (12/10/2026)
  if (fnOn("rt.hebdo") && RA.rtHebdo) genererConsultRT(P2, Object.assign({}, D.ctx, { nouvelId: idsParDefaut() })); // consultations hebdomadaires (réglage du cabinet)
  if (RA.rtFin) consultFinRT(P2, Object.assign({}, D.ctx, { nouvelId: idsParDefaut() })); // consultation de fin de radiothérapie (12/10/2026)
  // R-C4 (19/10/2026, audit 4 C4) : sans le droit « rendez-vous », les consultations de la RT ne peuvent pas être écrites ; la signature
  // (`_sc`) n'est alors pas enregistrée, pour qu'elles soient refaites au prochain enregistrement par quelqu'un qui a ce droit
  const nonMaj = JSON.stringify(P2.rdvs) !== avant && !peut("rendezvous");
  if (nonMaj) { const sc0 = {}; JSON.parse(x.doc.rtsJson || "[]").forEach((r) => { if (r && r.id) sc0[r.id] = r._sc; }); P2.rts.forEach((r) => { if (sc0[r.id]) r._sc = sc0[r.id]; else delete r._sc; }); }
  const changes = { rtsJson: JSON.stringify(P2.rts) };
  if (JSON.stringify(P2.rdvs) !== avant && peut("rendezvous")) changes.rdvsJson = JSON.stringify(P2.rdvs);
  await enregistrer(x, changes, quoi);
  if (nonMaj) setTimeout(() => toast("Consultations de radiothérapie non mises à jour (droit « rendez-vous ») : elles le seront au prochain enregistrement par le médecin ou la secrétaire."), 2600);
  return { nonMaj };
}
// Dosimétrie : validée par un médecin (contourage et plan de traitement vérifiés) ; « annuler » la remet à valider
const peutDosi = () => traitModRT() && estMed(D.membre.role);
window.dosiRT = (id, rid, annuler, apres) => {
  const x = D.patients.find((p) => p.id === id); if (!x) return;
  if (!peutDosi()) { toast("La dosimétrie est validée par le médecin."); return; }
  const l = JSON.parse(x.doc.rtsJson || "[]"), r = l.find((v) => v.id === rid); if (!r) return;
  if (annuler) { if (!confirm("Annuler la validation de la dosimétrie du " + dfrA(r.dosi) + " ?")) return; delete r.dosi; delete r.dosiPar; delete r.dosiLe; sauverRT(x, l, "Validation de la dosimétrie annulée").then(() => { toast("Dosimétrie remise à valider."); apres ? apres() : pageDossier(x.id); }).catch((e) => toast(e.message)); return; }
  if (!r.cont) { toast("Validez d'abord le contourage (étape avant la dosimétrie)."); return; }
  fenetre("<h3>Valider la dosimétrie – " + esc(x.r.nm) + '</h3><p class="sous">' + esc(r.acte || "Radiothérapie") + (r.scan ? " · scanner le " + dfrA(r.scan) : "") + (r.deb ? " · 1re séance le " + dfrA(r.deb) : "") + "</p>" +
    '<div class="form"><div><label for="dD">Date de validation</label><input id="dD" type="date" value="' + D.t + '"></div><div></div>' +
    '<label class="large chk" style="font-weight:normal"><input id="dOk" type="checkbox"> J\'ai vérifié les volumes (contourage), la dose prescrite et le plan de traitement, et je valide la dosimétrie.</label></div>' +
    '<div class="err" id="fErr"></div><div class="boutons"><button class="bt gris" onclick="fermerFenetre()">Annuler</button><button class="bt vert" id="fOk"><svg class="pi"><use href="#i-check"/></svg>Valider la dosimétrie</button></div>');
  $("fOk").onclick = async () => {
    const d = val("dD"); if (!d) { erreur("Indiquez la date."); return; }
    if (!$("dOk").checked) { erreur("Cochez la case de vérification pour valider."); return; }
    if (r.scan && d < r.scan) { erreur("La date est avant le scanner (" + dfrA(r.scan) + ")."); return; }
    Object.assign(r, { dosi: d, dosiPar: nomMedecin(), dosiLe: new Date().toISOString() }); occupe($("fOk"), true);
    try { await sauverRT(x, l, "Dosimétrie validée le " + dfrA(d) + " (" + nomMedecin() + ")"); fermerFenetre(); toast("Dosimétrie validée."); apres ? apres() : pageDossier(x.id); }
    catch (e) { occupe($("fOk"), false); erreur(e.message); }
  };
};
// Contourage (09/10/2026) : validé par un médecin (volumes cibles et organes à risque) ; ouvre la dosimétrie (et sa tâche).
// « annuler » le remet à valider (pas si la dosimétrie est déjà validée). « apres » : appelé à la place de réafficher le dossier.
window.contRT = (id, rid, annuler, apres) => {
  const x = D.patients.find((p) => p.id === id); if (!x) return;
  if (!peutDosi()) { toast("Le contourage est validé par le médecin."); return; }
  const l = JSON.parse(x.doc.rtsJson || "[]"), r = l.find((v) => v.id === rid); if (!r) return;
  const fin = () => (apres ? apres() : pageDossier(x.id));
  if (annuler) {
    if (r.dosi) { toast("Annulez d'abord la validation de la dosimétrie."); return; }
    if (!confirm("Annuler la validation du contourage du " + dfrA(r.cont) + " ?")) return;
    delete r.cont; delete r.contPar; delete r.contLe; sauverRT(x, l, "Validation du contourage annulée").then(() => { toast("Contourage remis à valider."); fin(); }).catch((e) => toast(e.message)); return;
  }
  fenetre("<h3>Valider le contourage – " + esc(x.r.nm) + '</h3><p class="sous">' + esc(r.acte || "Radiothérapie") + (r.scan ? " · scanner le " + dfrA(r.scan) : "") + (r.deb ? " · 1re séance le " + dfrA(r.deb) : "") + "</p>" +
    '<div class="form"><div><label for="cD">Date de validation</label><input id="cD" type="date" value="' + D.t + '"></div><div></div>' +
    '<label class="large chk" style="font-weight:normal"><input id="cOk" type="checkbox"> J\'ai réalisé et vérifié le contourage (volumes cibles et organes à risque) et je le valide.</label></div>' +
    '<p class="mesures">La dosimétrie devient alors « à valider » (tâche pour le médecin jusqu\'à la 1re séance).</p>' +
    '<div class="err" id="fErr"></div><div class="boutons"><button class="bt gris" onclick="fermerFenetre()">Annuler</button><button class="bt vert" id="fOk"><svg class="pi"><use href="#i-check"/></svg>Valider le contourage</button></div>');
  $("fOk").onclick = async () => {
    const d = val("cD"); if (!d) { erreur("Indiquez la date."); return; }
    if (!$("cOk").checked) { erreur("Cochez la case de vérification pour valider."); return; }
    if (r.scan && d < r.scan) { erreur("La date est avant le scanner (" + dfrA(r.scan) + ")."); return; }
    Object.assign(r, { cont: d, contPar: nomMedecin(), contLe: new Date().toISOString() }); occupe($("fOk"), true);
    try { await sauverRT(x, l, "Contourage validé le " + dfrA(d) + " (" + nomMedecin() + ")"); fermerFenetre(); toast("Contourage validé : la dosimétrie est à valider."); fin(); }
    catch (e) { occupe($("fOk"), false); erreur(e.message); }
  };
};
// Bouton « Terminé » : clôture à la date choisie (aujourd'hui par défaut) ; « Rouvrir » annule la clôture
window.terminerRT = (id, rid, rouvrir, apres) => {
  const x = D.patients.find((p) => p.id === id); if (!x) return;
  const l = JSON.parse(x.doc.rtsJson || "[]"), r = l.find((v) => v.id === rid); if (!r) return;
  if (rouvrir) { if (!confirm("Rouvrir cette radiothérapie (annuler la clôture du " + dfrA(r.fin) + ") ?")) return; delete r.fin; sauverRT(x, l, "Radiothérapie rouverte").then(() => { toast("Radiothérapie rouverte."); apres ? apres() : pageDossier(x.id); }).catch((e) => toast(e.message)); return; }
  fenetre("<h3>Terminer la radiothérapie – " + esc(x.r.nm) + '</h3><p class="sous">' + esc(r.acte || "") + (r.deb ? " · 1re séance le " + dfrA(r.deb) : "") + '</p><div class="form"><div class="large"><label for="tD">Date de la dernière séance</label><input id="tD" type="date" value="' + D.t + '"></div></div>' +
    '<div class="err" id="fErr"></div><div class="boutons"><button class="bt gris" onclick="fermerFenetre()">Annuler</button><button class="bt plein" id="fOk">Clôturer le traitement</button></div>');
  $("fOk").onclick = async () => {
    const d = val("tD"); if (!d) { erreur("Indiquez la date."); return; }
    if (r.deb && d < r.deb) { erreur("La date est avant la 1re séance (" + dfrA(r.deb) + ")."); return; }
    r.fin = d; occupe($("fOk"), true);
    try { await sauverRT(x, l, "Radiothérapie terminée le " + dfrA(d)); fermerFenetre(); toast("Radiothérapie clôturée."); apres ? apres() : pageDossier(x.id); }
    catch (e) { occupe($("fOk"), false); erreur(e.message); }
  };
};
// ───── Menu, cloche ─────
const fermerMenu = () => { document.body.classList.remove("menu-ouvert"); $("voile").classList.add("cache"); };
$("burger").onclick = () => { document.body.classList.add("menu-ouvert"); $("voile").classList.remove("cache"); };
$("voile").onclick = fermerMenu;
document.querySelectorAll("nav a").forEach((a) => a.addEventListener("click", fermerMenu));
// 26/10/2026 (demandes de Dr Bentahila) : tout champ relié à une liste (datalist : mutuelle, correspondant, molécule, catégorie…) propose la liste
// dès 2 lettres tapées (rien au clic sur un champ vide), filtrée à chaque lettre (mots dans n'importe quel ordre, sans accents), flèches et Entrée ;
// la saisie libre reste possible ; la liste du navigateur est coupée (elle variait d'un navigateur à l'autre). Même principe que les informations
// médicales (infosmed.js imSug)
{
  const sansA = (t) => String(t || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  let IN = null, S = null;
  const fermer = () => { if (S) S.remove(); S = null; };
  const options = (inp) => { const dl = document.getElementById(inp.dataset.liste); return dl ? [...new Set([...dl.options].map((o) => o.value).filter(Boolean))] : []; };
  const placer = () => { if (!S) return; if (!IN || !IN.isConnected) { fermer(); IN = null; return; } const r = IN.getBoundingClientRect(), w = Math.min(420, Math.max(r.width, 220)), h = S.offsetHeight;
    S.style.left = Math.max(4, Math.min(r.left, window.innerWidth - w - 4)) + "px"; S.style.width = w + "px";
    S.style.top = (window.innerHeight - r.bottom < h + 8 && r.top > h + 8 ? r.top - h - 2 : r.bottom + 2) + "px"; };
  const dessiner = () => {
    const mots = sansA(IN.value).split(/\s+/).filter(Boolean), L = options(IN).filter((t) => mots.every((m) => sansA(t).indexOf(m) >= 0)).slice(0, 80);
    if (sansA(IN.value).trim().length < 2 || !L.length || (L.length === 1 && sansA(L[0]) === sansA(IN.value))) { fermer(); return; }
    if (!S) { S = document.createElement("div"); S.className = "im-sug lst-sug"; S.setAttribute("role", "listbox"); document.body.appendChild(S);
      S.addEventListener("mousedown", (ev) => ev.preventDefault()); S.addEventListener("click", (ev) => { const b = ev.target.closest("button"); if (b) choisir(b); }); }
    S.innerHTML = L.map((t, i) => '<button type="button" role="option" tabindex="-1"' + (i === 0 && mots.length ? ' class="on"' : "") + ">" + esc(t) + "</button>").join("");
    placer();
  };
  const choisir = (b) => { const inp = IN; if (!inp) return; inp.value = b.textContent; fermer(); inp.dispatchEvent(new Event("input", { bubbles: true })); inp.dispatchEvent(new Event("change", { bubbles: true })); };
  document.addEventListener("focusin", (ev) => { const inp = ev.target; if (!(inp instanceof HTMLInputElement)) return;
    if (inp.hasAttribute("list")) { inp.dataset.liste = inp.getAttribute("list"); inp.removeAttribute("list"); inp.setAttribute("autocomplete", "off"); }
    if (inp.dataset.liste) { IN = inp; dessiner(); } });
  document.addEventListener("click", (ev) => { if (ev.target === IN && !S) dessiner(); });
  // champ retiré de la page (fenêtre fermée) ou clic ailleurs : liste fermée
  document.addEventListener("mousedown", (ev) => { if (S && ev.target !== IN && !S.contains(ev.target)) fermer(); }, true);
  new MutationObserver(() => { if (S && (!IN || !IN.isConnected)) { fermer(); IN = null; } }).observe(document.body, { childList: true, subtree: true });
  document.addEventListener("input", (ev) => { if (ev.target === IN && ev.isTrusted) dessiner(); });
  document.addEventListener("focusout", (ev) => { if (ev.target === IN) setTimeout(() => { if (document.activeElement !== IN) { fermer(); IN = null; } }, 150); });
  document.addEventListener("keydown", (ev) => { if (!S || ev.target !== IN) return; const B = [...S.querySelectorAll("button")]; let i = B.findIndex((b) => b.classList.contains("on"));
    if (ev.key === "ArrowDown" || ev.key === "ArrowUp") { ev.preventDefault(); i = ev.key === "ArrowDown" ? Math.min(B.length - 1, i + 1) : Math.max(0, i - 1); B.forEach((b, j) => b.classList.toggle("on", j === i)); if (B[i]) B[i].scrollIntoView({ block: "nearest" }); }
    else if (ev.key === "Enter" && i >= 0) { ev.preventDefault(); choisir(B[i]); }
    else if (ev.key === "Escape") { ev.stopPropagation(); fermer(); } }, true);
  window.addEventListener("scroll", (ev) => { if (S && ev.target !== S) placer(); }, true);
  window.addEventListener("resize", placer);
}
// Menu repliable (20.2) : colonne d'icônes sur ordinateur, choix gardé sur l'appareil ; nom de la page au survol
const menuReplie = (oui) => {
  document.body.classList.toggle("menu-replie", oui);
  const b = $("btReplier"), t = oui ? "Déplier le menu" : "Replier le menu"; b.title = t; b.setAttribute("aria-label", t);
  try { localStorage.setItem("onco360.menuReplie", oui ? "1" : "0"); } catch (e) { /* stockage indisponible : choix non gardé */ }
};
$("btReplier").onclick = () => { if (D && String(D.page || "").indexOf("dossier/") === 0) window.dosMenu(); else menuReplie(!document.body.classList.contains("menu-replie")); }; // dans le dossier : choix du dossier seulement (R-G a)
menuReplie(document.body.classList.contains("menu-replie"));
// R-G b : hauteur de la barre du haut (la grille du dossier tient dans l'écran, sous cette barre)
const majTete = () => document.documentElement.style.setProperty("--tete-h", $("tete").offsetHeight + "px");
if (window.ResizeObserver) new ResizeObserver(majTete).observe($("tete")); majTete();
$("menu").addEventListener("mouseover", (e) => {
  const a = e.target.closest("nav a, .sortie, .qui"); if (!a) return;
  const r = document.body.classList.contains("menu-replie");
  a.title = !r ? "" : a.classList.contains("qui") ? $("nomMenu").textContent : [...a.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join("").trim();
});
// Onglets sur une ligne qui défile (Paramètres, Profil) : onglet choisi visible, molette verticale = défilement horizontal, bords estompés
const bordsDefile = (el) => {
  const g = el.scrollLeft > 2, d = el.scrollLeft + el.clientWidth < el.scrollWidth - 2;
  [el, el.parentNode].forEach((x) => { x.classList.toggle("g", g); x.classList.toggle("d", d); });
};
new MutationObserver(() => document.querySelectorAll(".ag-vues.defile:not([data-vu])").forEach((el) => {
  el.dataset.vu = "1";
  // cadre avec flèches ‹ › (visibles seulement s'il reste des onglets de ce côté)
  const cadre = document.createElement("div"); cadre.className = "defile-cadre"; cadre.style.alignSelf = el.style.alignSelf; el.before(cadre); cadre.append(el);
  [["g", -1, "Onglets précédents"], ["d", 1, "Onglets suivants"]].forEach(([c, s, t]) => {
    const f = document.createElement("button"); f.type = "button"; f.className = "df-fl " + c; f.title = t; f.setAttribute("aria-label", t); f.innerHTML = ic("retour");
    f.onclick = () => el.scrollBy({ left: s * el.clientWidth * 0.7 }); cadre.append(f);
  });
  const on = el.querySelector("button.on");
  if (on) { el.style.scrollBehavior = "auto"; el.scrollLeft = Math.max(0, on.offsetLeft - (el.clientWidth - on.offsetWidth) / 2); el.style.scrollBehavior = ""; }
  bordsDefile(el);
  el.addEventListener("scroll", () => bordsDefile(el), { passive: true });
})).observe($("page"), { childList: true, subtree: true });
window.addEventListener("resize", () => document.querySelectorAll(".ag-vues.defile").forEach(bordsDefile));
document.addEventListener("wheel", (e) => {
  const el = e.target.closest && e.target.closest(".ag-vues.defile");
  if (!el || el.scrollWidth <= el.clientWidth || Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return;
  e.preventDefault(); el.scrollLeft += e.deltaY;
}, { passive: false });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") { fermerMenu(); $("panneauAlertes").classList.add("cache"); } });
$("cloche").onclick = (e) => { e.stopPropagation(); $("panneauAlertes").classList.toggle("cache"); };
document.addEventListener("click", (e) => { if (!$("panneauAlertes").contains(e.target)) $("panneauAlertes").classList.add("cache"); });
// Lot B (25/10/2026) : menu du compte (Mon compte, Déconnexion), ouvert par le nom ou la photo en bas du menu, ou par la photo en haut à droite
function menuCompte(ouvrir, depuis) {
  const m = $("menuCompte"), bts = [$("btCompte"), $("avTete")];
  if (!ouvrir) { if (!m.classList.contains("cache")) { m.classList.add("cache"); bts.forEach((b) => b.setAttribute("aria-expanded", "false")); } return; }
  $("mcNom").textContent = $("nomMenu").textContent;
  m.classList.remove("cache"); depuis.setAttribute("aria-expanded", "true");
  const r = depuis.getBoundingClientRect(), w = m.offsetWidth, h = m.offsetHeight, haut = depuis.id === "avTete";
  m.style.left = Math.max(8, Math.min(window.innerWidth - w - 8, haut ? r.right - w : r.left)) + "px";
  m.style.top = Math.max(8, haut ? r.bottom + 6 : r.top - h - 6) + "px";
  const pr = m.querySelector("a,button"); if (pr) pr.focus();
}
["btCompte", "avTete"].forEach((i) => { $(i).onclick = (ev) => { ev.stopPropagation(); const ouv = !$("menuCompte").classList.contains("cache"); menuCompte(false); if (!ouv) menuCompte(true, $(i)); }; });
document.addEventListener("click", (ev) => { if (!ev.target.closest("#menuCompte")) menuCompte(false); });
document.addEventListener("keydown", (ev) => {
  if (ev.key !== "Escape") return;
  if (!$("menuCompte").classList.contains("cache")) { menuCompte(false); ($("btCompte").offsetParent ? $("btCompte") : $("avTete")).focus(); return; }
  document.querySelectorAll("details.m3[open]").forEach((d) => d.removeAttribute("open")); // Échap ferme aussi un menu ⋯ ouvert
  // Lot E : Échap ferme une fenêtre marquée data-echap ; 26/10/2026 (étapes 2 à 4) : aussi toute fenêtre sans zone de saisie (rien ne peut être perdu)
  const fc = $("fenetreCorps"), saisie = fc.querySelector('textarea, select, [contenteditable="true"], input:not([type=checkbox]):not([type=radio]):not([type=hidden])');
  if (!$("fenetre").classList.contains("cache") && (fc.querySelector("[data-echap]") || !saisie) && !$("ptsMenuF")) window.fermerFenetre();
});
$("mcCompte").onclick = () => { menuCompte(false); fermerMenu(); };
window.addEventListener("resize", () => menuCompte(false));
$("btSortie").onclick = async () => { menuCompte(false); if (!confirm("Se déconnecter d'Onco360 sur cet appareil ?")) return; await signOut(auth); location.replace("index.html"); };
