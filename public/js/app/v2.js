// Onco360 (ex-Chimio HGC v2) – application : tableau de bord, patients, dossier. Chargée par v2.html.
window.__v2pret = true;
import { app, auth, db } from "../config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc, getDocs, setDoc, collection, query, where, updateDoc, addDoc, serverTimestamp, runTransaction } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { numeroRecu, cleRecuRdv, cleRecuCons, idRecu, decisionRecu, recuAEcrire } from "../moteur/recus.js";
import { fusionner } from "../donnees/conversion.js";
import { resume } from "../moteur/resume.js";
import { chimioAVenir } from "../moteur/agenda.js";
import { etatLigne, protocoleDe, seancesCure } from "../moteur/doses.js";
import { finRT, statutRT, nbA, compteurRT, dosimetrie, contourage } from "../moteur/rt.js";
import { auj, addJ, ecart, ouvre, age, srcImage, absentMedecin } from "../moteur/outils.js";
import { typeRdv, libRdv, joursH, T_RTC } from "../moteur/rdv.js";
import { tarif as tarifAu } from "../moteur/tarifs.js";
import { genererConsultRT } from "../moteur/rt.js";
import { idsParDefaut } from "../donnees/migration.js";
import { installer as installerDocuments, docsDe, boutonDoc, oublierDocs, suivreEtablissementDocs, supprimerDocs } from "./documents.js";
import { installer as installerChimio, htmlChimio, nouveauPatient as creerPatient, champDiag, activerDiag, listeMut, listeCor, figerCuresValidees, enrichirListes, majMontants, encaissementsDe, construireEncaissements, ecrireEncaissements, prixParServeur, oublierEncaissements } from "./chimio.js";
import { installer as installerAgenda, pageAgenda } from "./agenda.js";
import { installer as installerConfig, pageConfiguration, horaires, dureeDe, dureeType, WA0, remplir } from "./configuration.js";
import { installer as installerProfil, pageProfil, DROITS_ROLE, droitsEffectifs, lireImage } from "./profil.js";
import { installer as installerProtocoles, pageProtocoles, marquerProtocoles } from "./protocoles.js";
import { installer as installerParametres, pageParametres } from "./parametres.js";
import { installer as installerBilan, pagePageBilan, publierReleve } from "./bilan.js";
import { installer as installerOrdonnances, remplacerOrdosTypes, figerListes } from "./ordonnances.js";
import { figerDocumentation } from "./documentation.js";
import * as ficheP from "./fichepatient.js";
import { installer as installerFichiers, htmlFichiers, nbFichiers, oublierFichiers, suivreEtablissementFichiers, supprimerFichiers } from "./fichiers.js";
import { installer as installerConsultations, htmlConsultations, nbConsultations, oublierConsultations, suivreEtablissement, supprimerConsultations } from "./consultations.js";
import { installer as installerReglages, reglages, appliquerImpression, margesMm } from "./reglages.js";
import { montantEnLettres } from "../donnees/factures.js";
import { installer as installerTaches, pageTaches, demarrerTaches, blocAccueil as blocTaches, tachesDuPatient } from "./taches.js";
import { installer as installerSalle, pageSalle, demarrerSalle, apresStatutRdv, apresVenuChimio, apresPrix, bullesDossier, presenceDossier, majPresenceDossier, prixPrevu, badgeSalle } from "./salle.js";
import { installer as installerAudit } from "./audit.js";
import { installer as installerRcp, demarrerRcp, rcpDuPatient, bulleRcp, suivreEtablissementRcp, supprimerRcp } from "./rcp.js";
import { ACTES_RT } from "../donnees/listes.js";
import { abonnementEffectif } from "../donnees/modules.js";
import { reglageEffectif, styleRetraits, formulairesCabinet } from "../donnees/catalogue.js";
import * as aboP from "./abonnement.js";
import { accueilEffectif } from "../donnees/catalogue.js";
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
  try { D = await charger(u); appliquerImpression(); entete(); route(); menuCabinets().catch(() => {});
    if (D.bib) { Promise.all([figerListes(), figerDocumentation()]).catch((e) => console.warn("bibliothèque", e)); return; } // bibliothèque de référence : rien d'autre
    lireAccueilCab();
    if (D.membre.role !== "comptable") { if (module("taches")) demarrerTaches(); if (module("salle")) demarrerSalle(); if (module("rcp")) demarrerRcp(); } publierTarifsC(); planifierReleve(3000); chargerMedecins(); nomTitulaire().then(migrations); marquerProtocoles().catch((er) => console.warn("protocoles", er)); }
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
  for (const e of cands) { const s = await lireMembre(e); if (s && s.data().actif === false) { inactif = inactif || s; continue; } if (s) { ESPACE = e; m = s; break; } }
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
  // Toutes les lectures partent en même temps (au lieu de l'une après l'autre) : ouverture nettement plus rapide
  const membre = m.data(); membre.droitsStockes = membre.droits || {}; membre.droits = droitsEffectifs(membre); const col = collection(db, "espaces", ESPACE, "patients"), E = (c, i) => doc(db, "espaces", ESPACE, c, i);
  const pFO = getDoc(E("parametres", "formulaires")).catch(() => null); // fiche patient et consultation retouchées par le cabinet (Paramètres › Cabinet, 11/10/2026)
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
  const regAdmin = reglageEffectif(espaceDoc.bibliotheque === true ? null : espaceDoc.abonnement && espaceDoc.abonnement.reglage, espaceDoc.ficheSpe, espaceDoc.consultSpe); // fiche patient et consultation : celles de la spécialité + retouches du cabinet
  // puis retouches faites par le cabinet lui-même (parametres/formulaires) ; regAdmin.fiche / .consultation = base de l'éditeur des Paramètres
  let formCab = null; try { const sFO = await pFO; formCab = sFO && sFO.exists() ? JSON.parse(sFO.data().data || "{}") : null; } catch (e) { /* illisible : réglage de l'administration */ }
  const reg = espaceDoc.bibliotheque === true ? regAdmin : formulairesCabinet(regAdmin, formCab);
  return { u, membre, profil, cal, ctx, t, patients, listes, etabs, etabsTous, tarifs, bibDoc, bibOrdre, activites, wa, medTitulaire, tarifsC, reglages: reglagesC, abo, espaceDoc, bib: espaceDoc.bibliotheque === true, reg, regAdmin, formCab };
}
// Médecins du cabinet (AG4, 11/10/2026) : médecin d'un rendez-vous et filtre de l'agenda, à partir de 2 médecins actifs.
// Rendez-vous sans médecin noté (anciens) = le médecin titulaire.
async function chargerMedecins() {
  try {
    const s = await getDocs(collection(db, "espaces", ESPACE, "membres"));
    D.medecins = s.docs.map((d) => Object.assign({ uid: d.id }, d.data())).filter((m) => m.role === "medecin" && m.actif !== false)
      .map((m) => ({ uid: m.uid, nom: /^(Dr|Pr)\b/i.test(m.nom || "") ? m.nom : "Dr " + (m.nom || m.email || "") })).sort((a, b) => a.nom.localeCompare(b.nom));
    if (D.medecins.length > 1 && location.hash.indexOf("#agenda") === 0) pageAgenda();
  } catch (er) { D.medecins = null; }
}
const titulaireUid = () => (D.espaceDoc && D.espaceDoc.titulaire) || "";
const multiMed = () => (D.medecins || []).length > 1;
const medRdv = (r) => (r && r.med) || titulaireUid();
const medDefaut = () => (D.membre.role === "medecin" ? D.u.uid : titulaireUid());
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
      await remplacerOrdosTypes().then(() => setDoc(doc(db, "espaces", ESPACE, "parametres", "migrations"), { ordostypesExcel1: D.t }, { merge: true })).catch((er) => console.warn("ordonnances types", er));
    }
    if (!peut("finances") || (fait.encaissementsJours && fait.encaissementsBrutV1b)) return;
    const sf = await getDocs(collection(db, "espaces", ESPACE, "patientsFinances"));
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
  x.doc = docData; x.P = fusionner(x.id, docData, null);
  try { x.r = resume(JSON.parse(JSON.stringify(x.P)), ctx || D.ctx); } catch (e) { x.r = { nm: x.P.nom, act: [], rdvs: [], rt: [], rtE: [], rtS: [], ag: [] }; }
}
const fnOn = (k) => !D || !D.reg || D.reg.fonctions[k] !== false; // fonction du réglage du cabinet (10/10/2026)
const peut = (k) => !!(D.membre.droits && D.membre.droits[k] === true);
const voit = (k) => ["voir", "modifier"].indexOf(D.membre.droits && D.membre.droits[k]) >= 0;
// Consultations et hospitalisations visibles (l'infirmière ne voit que la chimio, et la radiothérapie des patients sous chimio)
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
let RELEVE_T = null;
function planifierReleve(delai) {
  if (!D || !peut("finances") || estComptable()) return;
  clearTimeout(RELEVE_T); RELEVE_T = setTimeout(() => publierReleve().catch((e) => console.warn("relevé du comptable", e)), delai);
}
function journal(x, quoi) { addDoc(collection(db, "espaces", ESPACE, "historique"), { parUid: D.u.uid, parNom: $("nomMenu").textContent, le: serverTimestamp(), patientId: x.id, patient: (x.r && x.r.nm) || "", quoi }).catch(() => {}); }

// Fenêtre (formulaires)
function fenetre(html, taille) { $("fenetreCorps").innerHTML = html; $("fenetreCorps").classList.toggle("large", taille === "large"); $("fenetre").classList.remove("cache"); const f = $("fenetreCorps").querySelector("input,select,textarea"); if (f) setTimeout(() => f.focus(), 50); }
window.fermerFenetre = () => { $("fenetre").classList.add("cache"); $("fenetreCorps").innerHTML = ""; };
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
const API = { D: () => D, get ESPACE() { return ESPACE; }, $, esc, ic, dfr, dfrA, cap, jourLong, val, occupe, erreur, toast, fenetre, fermerFenetre: () => window.fermerFenetre(), peut, voit, traitMod, enregistrer, pageDossier: (id) => reafficher(id), recalculer, journal };
API.typesRdv = (e) => typesRdv(e); // Paramètres › Horaires : durée par type de consultation (AG2)
// Heure facultative du scanner de centrage (AG5, 11/10/2026) : r.scanH = { h, du } ou retirée (droit « radiothérapie : modifier »)
API.traitModRT = () => traitModRT();
API.heureRT = async (pid, rid, hr) => {
  const x = D.patients.find((p) => p.id === pid); if (!x || !traitModRT()) throw new Error("Vous n'avez pas le droit de modifier la radiothérapie.");
  const l = JSON.parse(x.doc.rtsJson || "[]"), r = l.find((v) => v.id === rid); if (!r) throw new Error("Radiothérapie introuvable.");
  if (hr) r.scanH = hr; else delete r.scanH;
  await enregistrer(x, { rtsJson: JSON.stringify(l) }, "Scanner de centrage : " + (hr ? "heure " + hr.h + " (" + hr.du + " min)" : "heure retirée"));
};
API.multiMed = () => multiMed(); API.medecins = () => D.medecins || []; API.medRdv = (r) => medRdv(r); API.nomMed = (u) => nomMed(u); API.medDefaut = () => medDefaut(); // AG4
API.encaisseIci = () => encaisseIci(); API.payeCabinet = (x) => payeCabinet(x); API.htmlMode = (c) => htmlMode(c); API.libMode = (k) => libMode(k); API.imprimerRecu = (w, x, o) => imprimerRecu(w, x, o); API.sansAcc = sansAcc; API.fn = (k) => fnOn(k); API.module = (k) => module(k); API.planifierReleve = (d) => planifierReleve(d || 120000); API.attribuerNumero = (x) => attribuerNumero(x); API.numDossier = (x) => numDossier(x); API.medecinFiche = () => medecinFiche(); API.entete = () => entete(); API.voitRdv = () => voitRdv(); API.voitRT = (x) => voitRT(x); API.champsMed = (C, off) => champsMed(C, off); API.CHAMPS_MED = () => CHAMPS_MED; API.fmtMil = (n) => fmtMil(n); API.ferieLe = (d) => ferieLe(d); API.salleVenuChimio = (x, lid, n, j, oui) => apresVenuChimio(x, lid, n, j, oui); API.serveur = appelServeur; API.prixPrevu = (p, c, j) => prixPrevu(p, c, j); API.badgeSalle = (p, c) => badgeSalle(p, c); API.tarifsVus = () => tarifsVus(); API.publierTarifsC = () => publierTarifsC(); API.encaissementsDe = (x, f) => encaissementsDe(x, f); API.peutPrix = () => peut("finances") || prixParServeur();
installerChimio(API); installerAudit(API); aboP.installer(API); ficheP.installer(API); installerAgenda(API); installerConfig(API); installerProfil(API); installerProtocoles(API); installerParametres(API); installerBilan(API); installerConsultations(API); installerOrdonnances(API); installerDocuments(API); installerFichiers(API); installerTaches(API); installerReglages(API); installerSalle(API); installerRcp(API);

function entete() {
  const p = D.profil, mb = D.membre, nom = (p.nom || mb.nom || "").replace(/^Dr\.?\s*/i, "");
  D.titre = p.titre || (mb.role === "medecin" ? "Dr" : ""); D.nomAff = cap(nom.toLowerCase());
  $("nomMenu").textContent = [D.titre, p.prenom, D.nomAff].filter(Boolean).join(" ") || D.u.email;
  $("specMenu").textContent = p.specialite || { medecin: "Médecin", infirmiere: "Infirmière", assistante: "Assistante" }[mb.role] || "";
  if (D.espaceDoc && D.espaceDoc.demo) $("specMenu").textContent = "Cabinet de démonstration (patients fictifs)"; // étape 9 S3
  const ini = initiales((p.prenom || "") + " " + nom);
  ["avMenu", "avTete"].forEach((i) => { if (srcImage(p.photo)) $(i).innerHTML = '<img src="' + srcImage(p.photo) + '" alt="' + esc(ini) + '">'; else $(i).textContent = ini; }); $("avTete").title = D.u.email;
  document.querySelectorAll("nav a[data-droit]").forEach((a) => { if (!(mb.droits && mb.droits[a.dataset.droit])) a.classList.add("cache"); });
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
const catRdv = (r) => (r.act ? r.act : r.type === "En cours de RT" ? "rtc" : typeRdv(r.type));
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
function messageWA(x, cat, d, h) {
  const P = x.P, e = (D.etabsTous || D.etabs).find((z) => z.code === x.doc.etablissementId) || {}, j = new Date(d + "T12:00:00");
  const m = D.wa && D.wa[cat] != null ? D.wa[cat] : WA0[cat] || WA0.autre;
  return remplir(m, { prenom: P.prenom ? cap(String(P.prenom).toLowerCase()) : x.r.nm, nom: x.r.nm, jour: JOURS_L[j.getDay()] + " " + j.getDate() + " " + MOIS_L[j.getMonth()], heure: h ? "à " + h.replace(":", "h") : "", lieu: e.nom || x.doc.etablissementId || "", adresse: e.adresse || "", medecin: signatureWA() });
}
// Rappels envoyés (19.4, 10/10/2026) : dans le dossier, champ rappels { "AAAA-MM-JJ|catégorie": { le, par, nom } } (droit « rendezvous »)
const rappelDe = (x, d, cat) => ((x.doc && x.doc.rappels) || {})[d + "|" + cat] || null;
const libEnvoi = (s) => "envoyé par " + (s.nom || "") + " le " + dfrA(String(s.le).slice(0, 10)) + " à " + new Date(s.le).toTimeString().slice(0, 5).replace(":", " h ");
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
  const l = {}, lim = addJ(D.t, -7); Object.entries(x.doc.rappels || {}).forEach(([k, v]) => { if (k.slice(0, 10) >= lim) l[k] = v; });
  l[d + "|" + cat] = { le: new Date().toISOString(), par: D.u.uid, nom: $("nomMenu").textContent };
  try { await enregistrer(x, { rappels: l }, (cat === "confirm" ? "Confirmation" : "Rappel") + " WhatsApp envoyé (rendez-vous du " + dfrA(d) + ")"); entete(); route(); } catch (e) { console.warn("rappel noté", e); }
}
// Rappels à envoyer (19.4) : rendez-vous, cures, séances dans la fenêtre du bouton vert (Paramètres › WhatsApp), envoyés ou non
function rappelsAEnvoyer() {
  const t = D.t, RW = reglages().whatsapp, l = [], vus = {};
  D.patients.forEach((pt) => (pt.r.ag || []).forEach((e) => {
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
// Bibliothèque de référence (10/10/2026) : protocoles et paramètres (bibliothèques, listes, fériés, tarifs RT) seulement
const PAGES_BIB = ["protocoles", "parametres", "configuration"];
const estComptable = () => !!(D && D.membre && D.membre.role === "comptable");
const PAGE_MODULE = { agenda: "agenda", salle: "salle", taches: "taches", protocoles: "chimio", bilan: "bilan" };
const module = (k) => !D || !D.abo || D.abo.modules[k] !== false;
const PAGES_TOUS = () => ({ tous: ["Mes cabinets aujourd'hui", () => pageTous()] });
const PAGES = { accueil: ["Tableau de bord", pageAccueil], agenda: ["Agenda / Rendez-vous", () => pageAgenda()], configuration: ["Paramètres", () => { location.replace("#parametres"); }], profil: ["Mon compte", (a) => pageProfil(a)], protocoles: ["Protocoles", () => pageProtocoles()], parametres: ["Paramètres", (a) => pageConfiguration(a)], bilan: ["Bilan", () => pagePageBilan()], salle: ["Salle d'attente", () => pageSalle()], patients: ["Patients", pagePatients], taches: ["Tâches", (a) => pageTaches(a)], dossier: ["Dossier patient", pageDossier] };
function route() {
  if (CABINETS.length > 1 && !PAGES.tous) Object.assign(PAGES, PAGES_TOUS()); // secrétaire de plusieurs cabinets (19.7)
  const h = location.hash.replace("#", ""), i = h.indexOf("/"), p = i < 0 ? h : h.slice(0, i), arg = i < 0 ? null : decodeURIComponent(h.slice(i + 1)), nom = PAGES[p] && module(PAGE_MODULE[p] || "") && !(p === "protocoles" && D.reg && D.reg.fonctions["chimio.protocoles"] === false) && (!estComptable() || PAGES_COMPTABLE.indexOf(p) >= 0) && (!D.bib || PAGES_BIB.indexOf(p) >= 0) ? p : estComptable() ? "bilan" : D.bib ? "protocoles" : "accueil";
  if (!$("fenetre").classList.contains("cache")) window.fermerFenetre();
  D.page = nom + (arg ? "/" + encodeURIComponent(arg) : ""); $("titrePage").textContent = PAGES[nom][0]; $("page").classList.toggle("large", nom === "agenda");
  document.querySelectorAll("nav a").forEach((a) => a.classList.toggle("actif", a.dataset.p === (nom === "dossier" ? "patients" : nom)));
  if (nom === "dossier" && arg) { delete ONGLET[arg]; oublierConsultations(arg); oublierDocs(arg); oublierFichiers(arg); } // dossier ouvert : onglet Consultation, consultations relues
  PAGES[nom][1](arg); window.scrollTo(0, 0);
  if (!estComptable() && !D.bib) presenceDossier(nom === "dossier" ? arg : null); // « Dossier ouvert par » (salle d'attente)
}
// Changer de page : le résumé en cours d'écriture est d'abord enregistré ; s'il ne peut pas l'être, on reste sur le dossier
window.addEventListener("hashchange", async () => {
  if (!D) return;
  if (NOTES.txt != null || NOTES.encours) {
    await sauverNotesMaintenant();
    if (NOTES.txt != null) { const ici = "#dossier/" + encodeURIComponent(NOTES.pid); if (location.hash !== ici) { history.replaceState(null, "", ici); toast("Le résumé n'a pas pu être enregistré : vérifiez la connexion, puis réessayez."); } return; }
  }
  route();
});
// Fermer l'onglet ou recharger avec un résumé non enregistré : le navigateur demande confirmation
window.addEventListener("beforeunload", (e) => { if (NOTES.txt != null || NOTES.encours) { sauverNotesMaintenant(); e.preventDefault(); e.returnValue = ""; } });

// Premier démarrage d'un cabinet neuf (phase F, 09/10/2026) : étapes pour le médecin, jusqu'à ce que profil, lieu et tarifs soient faits
function premiersPas() {
  if (D.bib) return "";
  if (D.membre.role !== "medecin" || !peut("parametres")) return "";
  const T = D.tarifs, et = [
    ["profil", "Votre profil", "Nom, INPE et signature (fiche de chimiothérapie, comptes rendus, ordonnances).", !!(D.profil && D.profil.inpe)],
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
function blocAFaire(pj) {
  const role = D.membre.role, t = D.t, G = [], plus = (l, n) => (l.length > n ? '<div class="af-plus">+ ' + (l.length - n) + " autre" + (l.length - n > 1 ? "s" : "") + "</div>" : "");
  const ligne = (o) => '<div class="af-l' + (o.retard ? " ret" : "") + '"' + (o.id ? ' onclick="ouvrirDossier(\'' + o.id + '\')"' : "") + '><div class="tx"><b>' + esc(o.nm) + "</b>" + (o.de ? '<span class="de">' + esc(o.de) + "</span>" : "") + "</div>" + (o.badge || "") + (o.bt || "") + "</div>";
  const groupe = (icone, titre, l, n) => { if (l.length) G.push('<div class="af-g"><div class="af-t">' + ic(icone) + "<span>" + titre + '</span><span class="n">' + l.length + "</span></div>" + l.slice(0, n || 6).map(ligne).join("") + plus(l, n || 6) + "</div>"); };
  const btn = (lib, js) => '<button class="bt petit vert" onclick="event.stopPropagation();' + js + '">' + ic("check") + lib + "</button>";
  const resume = (icone, html, lien, lib) => G.push('<div class="af-g"><div class="af-r">' + ic(icone) + "<span>" + html + "</span>" + (lien ? '<button class="lien" onclick="' + lien + '">' + lib + " ›</button>" : "") + "</div></div>");
  let titre, sous;
  if (role === "medecin") {
    titre = "À valider par le médecin"; sous = "Cures du jour et en retard, contourages, dosimétries, fins de radiothérapie.";
    const cures = [];
    D.patients.forEach((x) => (x.r.act || []).forEach((a) => { if (!a.d || a.d > t) return; const ret = a.d < t;
      cures.push({ id: x.id, nm: x.r.nm, de: "C" + a.k + (a.sj ? " J" + a.sj : "") + " · " + a.nom.replace(/ · J\d+$/, ""), retard: ret, d: a.d, badge: ret ? '<span class="badge b-al">prévue le ' + dfr(a.d) + "</span>" : badgeSalle(x.id, "chimio") + '<span class="badge b-ch">aujourd\'hui</span>' }); }));
    cures.sort((p, q) => p.d.localeCompare(q.d) || p.nm.localeCompare(q.nm)); groupe("seringue", "Cures à valider", cures, 8);
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
    titre = "À faire par la secrétaire"; sous = "Rappels WhatsApp, numéros manquants, rendez-vous à décaler, journées à clôturer.";
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
    const nc = nonCloturees().length;
    if (nc) resume("salle", "<b>" + nc + "</b> consultation" + (nc > 1 ? "s" : "") + " des 7 derniers jours ni « Venu » ni « Non venu »", module("salle") ? "location.hash='salle'" : "", "Salle d'attente");
  } else if (role === "infirmiere") {
    titre = "À faire par l'infirmière"; sous = "Séances de chimiothérapie du jour.";
    groupe("seringue", "Chimiothérapies du jour", pj.ch.map((o) => ({ id: o.id, nm: o.nm, de: o.lib + " · " + o.de, badge: badgeSalle(o.id, "chimio") })), 10);
  } else return "";
  return '<section class="carte afaire"><h3><span class="ic">' + ic("check") + "</span>" + titre + "</h3>" + (G.length ? '<p class="sous">' + sous + "</p>" + G.join("") : '<p class="sous" style="margin:0">Rien à faire pour le moment.</p>') + "</section>";
}

function pageAccueil() {
  const pj = programmeDuJour(), ag = agenda7(), ab = absences(), tot = pj.rt.length + pj.co.length + pj.ch.length;
  const ligne = (o, cat) => '<div class="li" onclick="ouvrirDossier(\'' + o.id + '\')">' + (cat === "co" ? '<span class="h">' + esc(o.h) + "</span>" : "") +
    '<div class="tx"><b>' + esc(o.nm) + '</b><div class="de">' + esc(cat === "co" ? o.lib : o.de) + "</div></div>" +
    (cat === "co" ? (o.fait ? '<span class="badge b-ch">Vu</span>' : o.rid ? badgeSalle(o.id, "r-" + o.rid) : "") : (cat === "ch" ? badgeSalle(o.id, "chimio") : "") + '<span class="badge ' + (o.cls || "b-ch") + '"' + (cat === "rt" && / prévue$/.test(o.lib) ? ' title="Calculé d\'après le calendrier (jours ouvrés depuis la 1re séance) : les séances faites ne sont pas enregistrées."' : "") + ">" + esc(o.lib) + "</span>") + "</div>";
  const categorie = (cls, icone, titre, l) => l.length ? '<div class="cat"><div class="tc">' + ic(icone) + titre + '<span class="n">' + l.length + "</span></div>" + l.map((o) => ligne(o, cls)).join("") + "</div>" : "";
  const A2 = accueilEffectif(D.reg, D.accueilCab); D.accueilCartes = A2.cartes;

  let h = '<section class="accueil"><div><h2>Bonjour ' + esc(D.membre.role === "medecin" ? [D.titre, D.nomAff].filter(Boolean).join(" ") : cap(String((D.profil && D.profil.prenom) || "").toLowerCase()) || D.nomAff) + "</h2><p>" + cap(jourLong(D.t)) + "</p></div>" +
    '<div class="actions"><button class="bt clair" onclick="nouveauPatient()">' + ic("plus") + '<span class="lg">Nouveau patient</span><span class="sm">Patient</span></button><button class="bt plein" onclick="nouveauRdv()">' + ic("plus") + '<span class="lg">Nouveau rendez-vous</span><span class="sm">Rendez-vous</span></button></div></section>';

  // Cartes du tableau de bord : construites une par une, puis placées selon l'organisation réglée (administration, puis cabinet)
  const cartes = {}, carte = (k, fn) => { const avant = h; h = ""; fn(); cartes[k] = h; h = avant; };
  carte("ppas", () => { h += premiersPas(); });
  carte("jour", () => {
  h += '<section class="jour"><div class="ent"><h3><span class="ic">' + ic("agenda") + "</span>Aujourd'hui</h3><span>" + cap(jourLong(D.t)) + (ouvre(D.t, D.ctx.feries) ? "" : " · jour non ouvré") + '</span><span class="tot">' + tot + " au programme</span></div>" +
    categorie("rt", "radiation", "Radiothérapie", pj.rt) + categorie("co", "stetho", "Consultations", pj.co) + categorie("ch", "seringue", "Chimiothérapie", pj.ch) +
    (tot ? "" : '<div class="cat"><div class="vide" style="padding:12px 14px">Rien de prévu aujourd\'hui.</div></div>') + "</section>";
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
  carte("taches", () => { if (module("taches")) h += blocTaches({ sansRT: D.membre.role === "medecin" && A2.cartes.afaire !== false }); }); // Mes tâches (étape T4) ; contourage, dosimétrie, fin de RT : dans « À valider »
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
  h += '<section class="carte"><h3><span class="ic">' + ic("bilan") + '</span>Statistiques</h3><p class="sous">Touchez une case pour voir la liste des patients.</p><div class="kpi">' +
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
  $("page").innerHTML = '<section class="accueil"><div><h2>Patients</h2><p>Retrouvez et gérez vos dossiers patients.</p></div><div class="actions"><button class="bt plein" onclick="nouveauPatient()">' + ic("plus") + "Nouveau patient</button></div></section>" +
    '<div class="filtres"><div class="recherche">' + ic("loupe") + '<input id="q" type="search" placeholder="Rechercher un patient…" title="Nom, prénom, date de naissance, numéro de dossier, diagnostic, protocole" autocomplete="off"></div><select id="flt">' + opts + "</select>" + (hopsVus().length > 1 ? '<select id="fhop" aria-label="Hôpital"><option value="">Tous les hôpitaux</option>' + hopsVus().map((e) => '<option value="' + esc(e.code) + '">' + esc(e.code + " – " + e.nom) + "</option>").join("") + "</select>" : "") + "</div>" +
    '<section class="carte"><div class="sous" id="nbRes" style="margin:0 0 6px"></div><div id="lst"></div></section>';
  if (filtre && $("flt").querySelector('option[value="' + CSS.escape(filtre) + '"]')) $("flt").value = filtre;
  $("q").oninput = $("flt").onchange = listePatients; if ($("fhop")) $("fhop").onchange = listePatients; listePatients();
}
function listePatients() {
  const mots = sansAcc($("q").value).split(/\s+/).filter(Boolean), f = $("flt").value, t = D.t, hop = $("fhop") ? $("fhop").value : "";
  const l = D.patients.filter((x) => {
    if (hop && x.doc.etablissementId !== hop) return false;
    const r = x.r, hay = sansAcc([r.nm, dfrA(r.ddn), numDossier(x), r.diag, (r.pr || []).join(" "), r.t ? r.t.nom : "", r.hop].join(" "));
    if (!mots.every((w) => hay.indexOf(w) >= 0)) return false;
    if (f.indexOf("p:") === 0) return (r.act || []).some((a) => a.nom.replace(/ · J\d+$/, "") === f.slice(2)) || (r.t && r.t.st === "cours" && r.t.nom === f.slice(2));
    return FILTRES[f][1](x);
  });
  $("nbRes").textContent = l.length + " patient" + (l.length > 1 ? "s" : "");
  $("lst").innerHTML = l.length ? l.map((xp) => { const { id, r } = xp;
    const a = age(r.ddn, t), rtC = (r.rtS || []).find((s) => s.st === "cours"), rtP = (r.rtS || []).find((s) => s.st === "prev");
    let tr = "", bd = "";
    if (r.t) { if (r.t.st === "cours") { tr = "💉 " + r.t.nom + (r.t.c && r.t.k ? " · C" + r.t.k + "/" + r.t.nb : "") + (r.t.next ? " · prochaine cure le " + dfr(r.t.next) : ""); bd = '<span class="badge b-co">En cours</span>'; } else { tr = "💉 " + r.t.nom; bd = r.t.st === "fin" ? '<span class="badge b-ch">Terminé</span>' : '<span class="badge b-gr">Arrêté</span>'; } }
    if (rtC) { tr = (tr ? tr + " · " : "") + "☢️ " + rtC.a + " jusqu'au " + dfr(rtC.fin); bd += ' <span class="badge b-rt">RT en cours</span>'; }
    else if (rtP) { tr = (tr ? tr + " · " : "") + "☢️ " + rtP.a + " à partir du " + dfr(rtP.deb); bd += ' <span class="badge b-rt">RT prévue</span>'; }
    return '<div class="pat" onclick="ouvrirDossier(\'' + id + '\')">' + bulle(D.patients.find((z) => z.id === id)) + '<div class="tx"><b>' + esc(r.nm) + "</b><span>" + esc([numDossier(xp) ? "N° " + numDossier(xp) : "", r.ddn ? "Né(e) le " + dfrA(r.ddn) + (a != null ? " (" + a + " ans)" : "") : "", r.diag].filter(Boolean).join(" · ")) + "</span>" + (tr ? "<span>" + esc(tr) + "</span>" : "") + '</div><div class="dr">' + (r.hop ? '<span class="badge b-gr">' + esc(r.hop) + "</span>" : "") + bd + "</div></div>";
  }).join("") : '<p class="vide-c">Aucun patient ne correspond. Essayez un autre nom ou retirez le filtre.</p>';
}

// ───── Dossier patient (lecture) ─────
const ST_RDV = { prevu: ["Prévu", "b-co"], fait: ["Venu", "b-ch"], absent: ["Non venu", "b-al"], reporte: ["Reporté", "b-or"] };
// Onglet choisi par patient : gardé quand le dossier se réaffiche après un enregistrement, oublié quand on rouvre le dossier (route)
const ONGLET = {};
window.ongletDossier = (pid, k) => {
  ONGLET[pid] = k;
  document.querySelectorAll(".o-barre [role=tab]").forEach((b) => { const on = b.id === "og-" + k; b.classList.toggle("on", on); b.setAttribute("aria-selected", on); });
  document.querySelectorAll(".o-pan").forEach((p) => p.classList.toggle("cache", p.id !== "op-" + k));
};
function pageDossier(id) {
  const x = D.patients.find((p) => p.id === id);
  if (!x) { $("page").innerHTML = '<a class="retour" href="#patients">' + ic("retour") + "Patients</a><div class=\"carte\"><h3>Dossier introuvable</h3><p class=\"sous\">Ce patient n'existe pas ou n'est pas dans vos établissements.</p></div>"; return; }
  const { P, r } = x, ctx = D.ctx, t = D.t, a = age(P.ddn, t);
  $("titrePage").textContent = r.nm;
  let h = '<a class="retour" href="#patients">' + ic("retour") + "Patients</a>";

  // Identité + résumé du patient (une seule carte, comme l'application actuelle)
  const champ = (lib, v) => v ? "<div><label>" + lib + "</label><b>" + esc(v) + "</b></div>" : "";
  const ENT = ficheP.enTete; // champ en tête du dossier (réglage de la fiche patient)
  const okN = traitMod();
  h += '<section class="carte"><div class="ident">' + (peut("identite") ? '<button class="bulle-photo" onclick="photoPatient(\'' + x.id + '\')" title="' + (P.photo ? "Changer ou retirer la photo" : "Ajouter une photo du patient") + '" aria-label="Photo du patient">' + bulle(x, "ph-dos") + "</button>" : bulle(x, "ph-dos")) + '<div style="flex:1;min-width:200px"><h2>' + esc(r.nm) + "</h2><p>" +
    esc([P.numero ? "Dossier n° " + P.numero : "", ENT("ddn") && P.ddn ? "Né(e) le " + dfrA(P.ddn) + (a != null ? " (" + a + " ans)" : "") : "", ENT("sexe") ? (P.sexe === "F" ? "Femme" : P.sexe === "H" ? "Homme" : "") : "", ENT("taille") && P.taille ? P.taille + " cm" : "", ENT("poids") && P.poids ? P.poids + " kg" : ""].filter(Boolean).join(" · ")) + "</p>" +
    '<div class="bd">' + (P.hop ? '<span class="badge b-gr">' + esc(P.hop) + "</span>" : "") + (r.t && r.t.st === "cours" ? '<span class="badge b-co">Chimiothérapie en cours</span>' : "") + ((r.rtS || []).some((s) => s.st === "cours") ? '<span class="badge b-rt">RT en cours</span>' : "") + "</div></div>" +
    '<div class="actr id-bt" style="align-self:flex-start"><button class="bt gris" onclick="afficherPatient(\'' + x.id + '\')">Afficher</button>' + (D.espaceDoc && D.espaceDoc.titulaire === D.u.uid ? '<button class="bt gris" onclick="auditPatient(\'' + x.id + '\')" title="Journal d\'audit de ce dossier : qui l\'a ouvert, modifié…">Journal</button>' : "") + (peut("identite") || peut("fichePatient") || traitMod() ? '<button class="bt clair" onclick="modifierIdentite(\'' + x.id + '\')">Modifier</button>' : "") + '<button class="bt clair" data-mod="taches" onclick="taNouvelle(\'' + x.id + '\')" title="Nouvelle tâche pour ce patient">' + ic("plus") + "Tâche</button>" + (peut("rendezvous") ? '<button class="bt clair" onclick="ouvrirRdv(\'' + x.id + '\')" title="Ajouter un rendez-vous pour ce patient">' + ic("plus") + '<span class="lg">Rendez-vous</span><span class="sm">RDV</span></button>' : "") + "</div></div>" +
    // Champs en tête du dossier : réglés champ par champ (Administration › fiche patient de la spécialité, case « en-tête »)
    '<div class="champs">' + (ENT("diag") ? champ("Diagnostic", r.diag).replace("<div", '<div data-champ="diag"') : "") + (ENT("cin") && P.cin ? champ("CIN", P.cin).replace("<div", '<div data-champ="cin"') : "") + (ENT("tel") && P.tel ? '<div data-champ="tel"><label>Téléphone</label><b><a href="tel:' + esc(P.tel) + '">' + esc(P.tel) + "</a></b></div>" : "") + (ENT("tel2") && P.tel2 ? '<div data-champ="tel2"><label>2e téléphone</label><b><a href="tel:' + esc(P.tel2) + '">' + esc(P.tel2) + "</a></b></div>" : "") +
      (ENT("etab") ? champ("Hôpital", P.hop).replace("<div", '<div data-champ="etab"') : "") + (ENT("ald") ? champ("ALD", P.ald).replace("<div", '<div data-champ="ald"') : "") + (ENT("cor") ? champ("Correspondant", P.cor).replace("<div", '<div data-champ="cor" data-fn="listes.cor"') : "") + (ENT("mut") ? champ("Mutuelle", P.mut).replace("<div", '<div data-champ="mut"') : "") +
      (ENT("adresse") ? champ("Adresse", P.adresse).replace("<div", '<div data-champ="adresse"') : "") + (ENT("email") ? champ("E-mail", P.email).replace("<div", '<div data-champ="email"') : "") +
      CHAMPS_MED.filter(([k]) => ENT(k) && P[k]).map(([k, lib]) => champ(lib, P[k]).replace("<div", '<div data-champ="' + k + '"' + (String(P[k]).length > 60 ? ' class="large"' : ""))).join("") + ficheP.htmlLecture(x, true) + "</div>" +
    '<div class="resume"><div class="entete"><label for="nTxt" style="flex:1">Résumé du patient</label>' + (okN ? '<span class="mesures" id="nEtat">' + (NOTES.pid === x.id && NOTES.txt != null ? "Modifications en cours…" : "") + "</span>" : "") + "</div>" +
    (okN ? '<textarea id="nTxt" class="notes" placeholder="Quelques phrases de résumé : histoire, antécédents, points d\'attention…" oninput="notesSaisie(\'' + x.id + '\',this)" onblur="sauverNotesMaintenant()">' + esc(NOTES.pid === x.id && NOTES.txt != null ? NOTES.txt : P.notes || "") + "</textarea>"
      : (P.notes ? '<div class="notes lecture">' + esc(P.notes) + "</div>" : '<p class="sous">Aucun résumé.</p>')) + "</div></section>";

  // Rendez-vous à venir : chimio, radiothérapie et rendez-vous prévus à partir d'aujourd'hui (actions directement ici)
  const okR = peut("rendezvous"), b = (lib, fn, cls) => '<button class="mini ' + (cls || "") + '" onclick="' + fn + '">' + lib + "</button>";
  const actionsRdv = (v, wa) => {
    if (!okR) return wa ? '<div class="actr">' + wa + "</div>" : ""; const q = "'" + x.id + "','" + v.id + "'";
    if ((v.st || "prevu") !== "prevu") return annulable(v) ? '<div class="actr">' + b("Annuler le statut", "statutRdv(" + q + ",'prevu')") + "</div>" : "";
    return '<div class="actr">' + (wa || "") + (v.d <= D.t ? b("Venu", "statutRdv(" + q + ",'fait')", "v") + b("Non venu", "statutRdv(" + q + ",'absent')", "r") : "") + b("Modifier", "ouvrirRdv(" + q + ")") + b("Supprimer", "statutRdv(" + q + ",'supprimer')") + "</div>";
  };
  const aVenir = (v) => (v.st || "prevu") === "prevu" && (v.f || v.d) >= t;
  const av = [];
  // Prix à encaisser (consultations validées, chimio comprise) : droit « encaissements »
  const EN = peut("encaissements") ? encaissementsDe(x, () => { if (D.page === "dossier/" + encodeURIComponent(x.id)) pageDossier(x.id); }) : null;
  // Rendez-vous de chimio : « Venu » + fenêtre de prix (J1 : consultation de chimio ; J8, J15… : 0), comme les autres rendez-vous ;
  // leur date ne se change pas ici (protocole de la ligne)
  const venuChimio = (c, d) => {
    const v = EN && EN.cons && EN.cons[c.lid + "|" + c.n + "|" + c.j], qv = "'" + x.id + "','" + c.lid + "'," + c.n + "," + c.j;
    if (v) return '<span class="badge b-ch">Venu</span><span class="badge b-ch" title="Prix validé">' + (v.m != null ? fmtMil(v.m) + " DH" : "—") + "</span>" + (peut("finances") ? b("Annuler le statut", "chAnnulerVenuChimio(" + qv + ")") : prixParServeur() ? b("Modifier le prix", "chVenuChimio(" + qv + ")") : "");
    return (peut("finances") || prixParServeur()) && d <= D.t ? b("Venu", "chVenuChimio(" + qv + ")", "v") : "";
  };
  chimioAVenir(JSON.parse(JSON.stringify(P)), ctx).forEach((c) => { const ret = /en retard/.test(c.lib); av.push({ d: c.d, h: "", em: "💉", t: c.lib.replace(/^Chimio · /, ""), retard: ret, act: '<div class="actr">' + (ret ? "" : btnWA(x, "chimio", c.d, "")) + (c.lid ? venuChimio(c, c.d) : "") + "</div>" }); });
  if (voitRdv()) (P.rdvs || []).forEach((v) => { if (aVenir(v)) av.push({ d: v.d, h: v.h || "", em: typeRdv(v.type) === "hospit" ? '<svg class="pi"><use href="#i-hopital"/></svg>' : "🩺", t: libRdv(v) + (v.mo ? " – " + v.mo : "") + (v.n ? " – " + v.n : ""), act: actionsRdv(v, btnWA(x, catRdv(v), v.d, v.h || "")), rep: v.rep }); });
  const qx = "'" + x.id + "'";
  // Tâches ouvertes du patient (P4, 08/10/2026), dont « Valider la dosimétrie » qui remplace ici la ligne de dosimétrie
  (module("taches") ? tachesDuPatient(x.id) : []).forEach((tk) => av.push({ d: tk.ech || "", h: tk.h || "", em: ic("taches"), t: "Tâche – " + tk.titre + " · pour " + (tk.pour === D.u.uid ? "vous" : tk.pourNom || "?") + (tk.statut === "encours" ? " · en cours" : ""), retard: !!tk.ech && tk.ech < D.t, act: '<div class="actr"><button class="mini" onclick="taVoir(\'' + tk.id + '\')">Ouvrir</button></div>' }));
  // Inscriptions en RCP non faites (09/10/2026, rcp.js) : visibles jusqu'à ce que la case « Fait » soit cochée
  (module("rcp") ? rcpDuPatient(x.id) : []).forEach((v) => av.push({ d: v.d, h: "", em: ic("rcp"), t: "RCP – " + v.q + (v.d < D.t ? " · décision à saisir" : ""), retard: v.d < D.t, act: '<div class="actr"><button class="mini" onclick="rcpHistorique(\'' + x.id + '\')">Ouvrir</button></div>' }));
  if (voitRTdossier(x)) (r.rt || []).filter((v) => !v.dosi).forEach((v) => av.push({ d: v.d, f: v.f, h: "", em: "☢️", t: v.lib.replace(/^RT · /, ""), dosi: !!v.dosi, act: v.dosi ? (peutDosi() ? '<div class="actr"><button class="mini vert" onclick="dosiRT(\'' + x.id + "','" + v.dosi + '\')"><svg class="pi"><use href="#i-check"/></svg>Valider la dosimétrie</button></div>' : "") : /Fin de radioth/.test(v.lib) ? "" : '<div class="actr">' + btnWA(x, "rt", v.d, "") + "</div>" }));
  av.sort((p, q) => (p.d + (p.h || "00")).localeCompare(q.d + (q.h || "00")));
  const hRdv = '<section class="carte"><div class="entete"><h3><span class="ic">' + ic("agenda") + "</span>Rendez-vous et tâches à venir</h3><div class=\"actr\">" + (okR ? '<button class="bt clair petit" onclick="ouvrirRdv(' + qx + ')">' + ic("plus") + "Ajouter un rendez-vous</button>" : "") + '<button class="bt clair petit" data-mod="taches" onclick="taNouvelle(' + qx + ')">' + ic("plus") + "Tâche</button></div></div>" +
    // Liste dans une zone qui défile : les 5 prochains visibles (hauteur réglée après l'affichage, limiterHauteur)
    (av.length > 5 ? '<p class="mesures" style="margin:4px 0 0">' + av.length + " rendez-vous : faites défiler la liste pour voir les suivants.</p>" : "") +
    '<div class="rdv-liste" id="rdvListe">' + (av.length ? av.map((v) => '<div class="rdv">' + (absenceLe(v.d) ? '<span class="badge b-al"><svg class="pi"><use href="#i-stop"/></svg>' + absentMedecin(medecinFiche().genre) + "</span>" : ferieLe(v.d) ? '<span class="badge b-al">Férié</span>' : "") + '<span class="badge ' + (v.retard ? "b-al" : "b-co") + '">' + (v.d ? dfr(v.d) : "—") + (v.f && v.f !== v.d ? " → " + dfr(v.f) : "") + (v.h ? " " + v.h : "") + "</span><span>" + v.em + '</span><div class="tx">' + esc(v.t) + (v.rep && v.rep.length ? '<div class="mesures">Reporté (initialement le ' + dfrA(v.rep[0].d) + ")</div>" : "") + "</div>" + (v.act || "") + "</div>").join("") : '<p class="sous">Aucun rendez-vous ni tâche à venir.</p>') + '</div><p class="mesures" style="margin:8px 0 0">Prochaine étape de chimiothérapie et de radiothérapie (automatique) et consultations programmées. Les consultations passées sont listées juste en dessous.</p></section>';

  // Un seul cadre à onglets (07/10/2026) : Consultation · Chimiothérapie · Radiothérapie · Documents, selon les droits
  const ong = [];
  // Consultation : tout le monde (l'infirmière en lecture seule, décision du 07/10/2026)
  { const hc = htmlConsultations(x); ong.push({ k: "co", ic: "stetho", lib: "Consultation", n: nbConsultations(x), h: hc }); }

  // Chimiothérapie
  if (voit("traitements")) ong.push({ k: "ch", ic: "seringue", lib: "Chimiothérapie", n: (P.lignes || []).length, h: htmlChimio(x) || '<p class="vide-c">Aucune ligne de chimiothérapie.</p>' });

  // Radiothérapie
  // (l'infirmière, radiothérapie « patients sous chimio » ailleurs, voit l'onglet en lecture pour tous ses patients : 07/10/2026)
  const okRT = traitModRT();
  if (peut("documents")) docsDe(x, () => { if (D.page === "dossier/" + encodeURIComponent(x.id)) pageDossier(x.id); }); // documents RT enregistrés (boutons cochés)
  if (voitRTdossier(x) || D.membre.droits.radiotherapie === "chimio") {
    const JS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"], TECH = { stereo: "Stéréotaxie", vmat: "VMAT", imrt: "IMRT", "3d": "3D" };
    let hr = okRT ? '<div class="entete"><button class="bt clair petit" onclick="ouvrirRT(\'' + x.id + '\')">' + ic("plus") + "Prescription</button></div>" : "";
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
      hr += '<div class="rt' + (ouv ? " on" : "") + '"><div class="tl" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;cursor:pointer" onclick="rtTog(' + q + ')" title="' + (ouv ? "Refermer" : "Voir les étapes") + '"><b style="font-size:16px;color:var(--titre)">' + (ouv ? "▾ " : "▸ ") + esc(v.acte || "Radiothérapie") + (nbA(v) > 1 ? " × " + nbA(v) : "") + '</b><span class="badge ' + cls + '">' + ({ fin: '<svg class="pi"><use href="#i-check"/></svg>', cours: '<i class="dot v"></i>', dep: '<i class="dot o"></i>', prev: '<svg class="pi"><use href="#i-horloge"/></svg>' }[s.c] || "") + esc(s.lib) + "</span>" + (v.hop ? '<span class="badge b-gr">' + esc(v.hop) + "</span>" : "") + (v.intent ? '<span class="badge b-gr">' + (v.intent === "curative" ? "Curative" : "Palliative") + "</span>" : "") + "</div>" +
        '<p class="st" style="color:var(--doux);font-size:13.5px;margin:6px 0 0">' + esc([dose ? String(dose).replace(".", ",") + " Gy" : "", nb ? nb + " fractions" : "", dpf ? String(dpf).replace(".", ",") + " Gy/fraction" : "", TECH[v.tech] || (v.vmat ? "VMAT" : ""), v.ryt === "2" ? "1 jour sur 2" : "quotidien"].filter(Boolean).join(" · ")) + "</p>" +
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
        (v.acte && peut("documents") ? boutonDoc(x, v, "pli", "Pli confidentiel") : "") +
        (v.deb && nb && peut("documents") ? boutonDoc(x, v, "cr", "Compte rendu de fin") + boutonDoc(x, v, "rdv", "Rendez-vous") : "") + "</div></div>";
    });
    ong.push({ k: "rt", ic: "radiation", lib: "Radiothérapie", n: (P.rts || []).length, h: hr });
  }

  // Documents (droit « documents », 08/10/2026) : fichiers déposés (PDF, Word, photos…), voir fichiers.js
  if (peut("documents") && fnOn("documents.depot")) { const hf = htmlFichiers(x); ong.push({ k: "doc", ic: "document", lib: "Documents", n: nbFichiers(x), h: hf }); }

  // Le dossier s'ouvre sur Consultation (sur Chimiothérapie pour l'infirmière) ; l'onglet choisi reste affiché quand le
  // dossier se réaffiche après un enregistrement
  if (ong.length) {
    const act = [ONGLET[x.id], D.membre.role === "infirmiere" ? "ch" : "co"].find((k) => ong.some((o) => o.k === k)) || ong[0].k;
    h += '<section class="carte onglets"><div class="o-barre" role="tablist" aria-label="Dossier">' + ong.map((o) => '<button role="tab" id="og-' + o.k + '" aria-controls="op-' + o.k + '" aria-selected="' + (o.k === act) + '"' + (o.k === act ? ' class="on"' : "") + ' onclick="ongletDossier(\'' + x.id + "','" + o.k + '\')"><svg class="pi" aria-hidden="true"><use href="#i-' + o.ic + '"/></svg>' + o.lib + (o.n ? '<span class="n">' + o.n + "</span>" : "") + "</button>").join("") + "</div>" +
      // Chimiothérapie et radiothérapie : défilement intérieur à la hauteur de l'écran, pour que le dossier ne s'allonge pas (11/10/2026)
      ong.map((o) => '<div class="o-pan' + (o.k === "ch" || o.k === "rt" ? " defile" : "") + (o.k === act ? "" : " cache") + '" id="op-' + o.k + '" role="tabpanel" aria-labelledby="og-' + o.k + '">' + o.h + "</div>").join("") + "</section>";
  }

  // Rendez-vous à venir, juste au-dessus des consultations passées (décision du 08/10/2026)
  h += hRdv;

  // Consultations et hospitalisations : passées ou déjà validées (venu / non venu), avec le prix à encaisser (droit « encaissements »)
  if (voitRdv()) {
    const prix = (v) => {
      if (EN && v.st === "absent") return '<span class="badge b-gr" title="Non venu : rien à encaisser">0 DH</span>';
      if (!EN || v.st !== "fait") return "";
      if (v.type === T_RTC) return '<span class="badge b-gr" title="Consultation en cours de radiothérapie : comprise dans l\'acte">0 DH</span>';
      const o = (EN.rdv || {})[v.id], hs = typeRdv(v.type) === "hospit";
      if (!o) return '<span class="badge b-gr" title="Le prix est fixé quand on valide « Venu »">Prix non validé</span>' + ((peut("finances") || prixParServeur()) && v.type !== T_RTC ? b("Fixer le prix", "prixRdv('" + x.id + "','" + v.id + "')") : "");
      const nj = hs ? joursH(v) : 0, m = o.tj != null ? o.tj * (nj || 1) : o.b != null ? o.b : o.m; // b : brut d'un prix repris de l'ancienne application
      const np = aEncaisser(o.mode), q2 = "'" + x.id + "','" + v.id + "'";
      return '<span class="badge ' + (np ? "b-or" : "b-ch") + '" title="' + (np ? "À encaisser" : o.mode ? "Payé " + esc(((MODES.find((z) => z[0] === o.mode) || [])[2]) || "") : "Prix validé") + '">' + fmtMil(m) + " DH" + (o.tj != null && nj > 1 ? " (" + nj + " j × " + fmtMil(o.tj) + ")" : "") + (np ? (o.mode === "np" ? " · non payé" : " · à encaisser") : "") + "</span>" +
        (np && (peut("finances") || prixParServeur()) ? b("Encaisser", "prixRdv(" + q2 + ",true)", "v") : (peut("finances") || (prixParServeur() && !o.v1)) && v.type !== T_RTC ? b("Modifier le prix", "prixRdv(" + q2 + ")") : "") +
        (o.mode && !np && o.m > 0 ? b("Reçu", "recuRdv(" + q2 + ")") : "");
    };
    const lignes = (P.rdvs || []).filter((v) => !aVenir(v)).map((v) => ({ d: v.d, h: v.h || "", v }));
    // Jours de chimio reçus (J1, J8…) depuis le 07/10/2026, et tous ceux validés « Venu » (avec leur prix)
    const vus = {};
    (P.lignes || []).forEach((L) => { let pn = ""; try { pn = protocoleDe(L, D.ctx.bib).nom; } catch (er) { return; }
      etatLigne(L, P, D.ctx).forEach((e) => { if (e.st !== "recue") return;
        [{ j: 1, d: e.c.reelle }].concat(seancesCure(L, e, D.ctx.bib).filter((z) => z.st === "recue").map((z) => ({ j: z.j, d: z.d }))).forEach((z) => {
          const k = L.id + "|" + e.n + "|" + z.j, val = EN && EN.cons && EN.cons[k]; vus[k] = 1;
          if (val || z.d >= "2026-10-07") lignes.push({ d: z.d || "", h: "", c: { lid: L.id, n: e.n, j: z.j, lib: pn, v: val } }); }); }); });
    if (EN) Object.entries(EN.cons || {}).forEach(([k, val]) => { if (vus[k]) return; const p3 = k.split("|"); lignes.push({ d: val.d || "", h: "", c: { lid: p3[0], n: +p3[1], j: +p3[2], lib: val.lib, v: val } }); });
    lignes.sort((p, q) => (q.d + q.h).localeCompare(p.d + p.h));
    h += '<section class="carte"><h3><span class="ic">' + ic("agenda") + '</span>Consultations et hospitalisations</h3>' + (EN === undefined ? '<p class="mesures">Chargement des prix…</p>' : "") +
      (lignes.length ? lignes.map(({ v, c, d }) => {
        if (c) return '<div class="rdv"><span class="badge b-gr">' + (d ? dfrA(d) : "—") + '</span><div class="tx"><b>Chimiothérapie</b><div class="mesures">' + esc((c.lib || "") + " · C" + c.n + " J" + c.j) + "</div></div>" +
          (c.v ? '<span class="badge b-ch">Venu</span><span class="badge ' + (aEncaisser(c.v.mode) ? "b-or" : "b-ch") + '" title="Prix validé">' + (c.v.m != null ? fmtMil(c.v.m) + " DH" : "—") + (aEncaisser(c.v.mode) ? " · à encaisser" : "") + "</span>" + (aEncaisser(c.v.mode) && payeCabinet(x) && (peut("finances") || prixParServeur()) ? b("Encaisser", "chVenuChimio('" + x.id + "','" + c.lid + "'," + c.n + "," + c.j + ",true)", "v") : "") + (c.v.mode && !aEncaisser(c.v.mode) && c.v.m > 0 ? b("Reçu", "recuCons('" + x.id + "','" + c.lid + "|" + c.n + "|" + c.j + "')") : "") + (peut("finances") ? '<div class="actr">' + b("Annuler le statut", "chAnnulerVenuChimio('" + x.id + "','" + c.lid + "'," + c.n + "," + c.j + ")") + "</div>" : prixParServeur() ? '<div class="actr">' + b("Modifier le prix", "chVenuChimio('" + x.id + "','" + c.lid + "'," + c.n + "," + c.j + ")") + "</div>" : "")
            : '<span class="badge b-or">À valider</span>' + (peut("finances") || prixParServeur() ? '<div class="actr">' + b("Venu", "chVenuChimio('" + x.id + "','" + c.lid + "'," + c.n + "," + c.j + ")", "v") + "</div>" : "")) + "</div>";
        const s = (v.st || "prevu") === "prevu" ? ["À valider", "b-or"] : ST_RDV[v.st] || [v.st, "b-gr"];
        return '<div class="rdv"><span class="badge b-gr">' + dfrA(v.d) + (v.h ? " " + v.h : "") + '</span><div class="tx"><b>' + esc(libRdv(v)) + "</b>" + (v.mo ? '<div class="mesures">Motif : ' + esc(v.mo) + "</div>" : "") + (v.n ? '<div class="mesures">' + esc(v.n) + "</div>" : "") + (v.rep && v.rep.length ? '<div class="mesures">Reporté (initialement le ' + dfrA(v.rep[0].d) + ")</div>" : "") + '</div><span class="badge ' + s[1] + '">' + s[0] + "</span>" + prix(v) + actionsRdv(v) + "</div>";
      }).join("") : '<p class="vide-c">Aucune consultation passée.</p>') + "</section>";
  }
  h += bullesDossier(x); // patient en consultation (salle d'attente) : bulles Valider / Retour en salle
  h += bulleRcp(x); // dossier ouvert depuis la liste des RCP : Décision RCP · Valider · Fermer
  const pos = $("rdvListe") ? $("rdvListe").scrollTop : 0;
  const posO = {}; ["ch", "rt"].forEach((k) => { const e = $("op-" + k); if (e && D.dossierDefile === x.id) posO[k] = e.scrollTop; }); D.dossierDefile = x.id; // même dossier redessiné : on reste au même endroit
  $("page").innerHTML = h;
  Object.keys(posO).forEach((k) => { const e = $("op-" + k); if (e) e.scrollTop = posO[k]; });
  ficheP.appliquerFiche(document.querySelector("#page .champs")); // en-tête du dossier : ordre et champs du réglage
  limiterHauteur("rdvListe", 5); if ($("rdvListe")) $("rdvListe").scrollTop = pos;
  majPresenceDossier(); // collègues qui ont ce dossier ouvert
}
// Après un enregistrement : la page en cours est réaffichée (salle d'attente ou dossier)
function reafficher(id) { if (String(D.page || "").indexOf("salle") === 0) pageSalle(); else pageDossier(id); }
// Zone qui défile : hauteur exacte des n premières lignes (elles n'ont pas toutes la même hauteur, surtout sur téléphone)
function limiterHauteur(id, n) {
  const z = $(id); if (!z) return; const L = z.children;
  if (L.length <= n) { z.style.maxHeight = ""; z.classList.remove("defile"); return; }
  z.style.maxHeight = (L[n - 1].offsetTop + L[n - 1].offsetHeight - L[0].offsetTop + 2) + "px"; z.classList.add("defile");
}

// ───── Modifier l'identité ─────
// Champs médicaux facultatifs (fiche clinique) : aussi dans « Nouveau patient »
const CHAMPS_MED = [["allergies", "Allergies", "Aucune connue, ou ex. pénicilline, iode…"], ["atcdMed", "Antécédents médicaux", "Diabète, HTA, cardiopathie…"], ["atcdFam", "Antécédents familiaux", "Cancer du sein chez la mère…"], ["modeVie", "Mode de vie", "Tabac, alcool, activité, situation familiale…"], ["traitCours", "Traitement en cours", "Médicaments pris actuellement (nom, dose)…"]];
const champsMed = (C, off) => CHAMPS_MED.map(([k, lib, ph]) => '<div class="large" data-champ="' + k + '"><label for="f_' + k + '">' + lib + ' <span class="mesures">(facultatif)</span></label><textarea id="f_' + k + '" rows="2" class="champ-t" placeholder="' + ph + '"' + (off ? " disabled" : "") + ">" + esc((C && C[k]) || "") + "</textarea></div>").join("");
window.modifierIdentite = (id) => {
  const x = D.patients.find((p) => p.id === id); if (!x) return;
  const I = x.doc.identite || {}, C = x.doc.clinique || {}, okI = peut("identite"), okC = traitMod() || peut("fichePatient"), okE = !!D.membre.tousEtablissements;
  if (!okI && !okC) { toast("Vous n'avez pas le droit de modifier ce dossier."); return; }
  const champ = (id2, lib, v, opt) => '<div class="' + ((opt && opt.large) ? "large" : "") + '"><label for="' + id2 + '">' + lib + '</label><input id="' + id2 + '" value="' + esc(v || "") + '"' + (opt && opt.type ? ' type="' + opt.type + '"' : "") + (opt && opt.liste ? ' list="' + opt.liste + '"' : "") + (opt && opt.off ? " disabled" : "") + (opt && opt.mode ? ' inputmode="' + opt.mode + '"' : "") + (opt && opt.ph ? ' placeholder="' + opt.ph + '"' : "") + "></div>";
  const sel = (id2, lib, v, opts, off) => '<div><label for="' + id2 + '">' + lib + '</label><select id="' + id2 + '"' + (off ? " disabled" : "") + ">" + opts.map((o) => '<option value="' + esc(o[0]) + '"' + (o[0] === (v || "") ? " selected" : "") + ">" + esc(o[1]) + "</option>").join("") + "</select></div>";
  fenetre("<h3>Identité</h3><div class=\"form\">" +
    champ("fNomF", "Nom", I.nomF, { off: !okI }).replace("<div", '<div data-champ="nom"') + champ("fPrenom", "Prénom", I.prenom, { off: !okI }).replace("<div", '<div data-champ="prenom"') +
    champ("fDdn", "Date de naissance", I.ddn, { type: "date", off: !okI }).replace("<div", '<div data-champ="ddn"') + sel("fSexe", "Sexe", I.sexe, [["", ""], ["F", "Femme"], ["H", "Homme"]], !okI).replace("<div", '<div data-champ="sexe"') +
    champ("fTaille", "Taille (cm)", C.taille, { mode: "numeric", off: !okC }).replace("<div", '<div data-champ="taille"') + champ("fPoids", "Poids (kg)", C.poids, { mode: "decimal", off: !okC }).replace("<div", '<div data-champ="poids"') +
    champDiag("fDiag", "fDiagP", C.diag, C.diagP, !okC) +
    champ("fCin", "CIN", I.cin, { off: !okI, ph: "ex. BE123456" }).replace("<div", '<div data-champ="cin"') + champ("fTel", "Téléphone", I.tel, { type: "tel", off: !okI, ph: "06…" }).replace("<div", '<div data-champ="tel"') + champ("fTel2", "2e téléphone", I.tel2, { type: "tel", off: !okI, ph: "Autre numéro (proche…)" }).replace("<div", '<div data-champ="tel2"') +
    (okE ? '<div data-champ="etab"><label for="fEtab">Hôpital</label><select id="fEtab">' + D.etabs.map((e) => '<option value="' + esc(e.code) + '"' + (e.code === x.doc.etablissementId ? " selected" : "") + ">" + esc(e.code + " – " + e.nom) + "</option>").join("") + "</select></div>" : "") +
    sel("fAld", "ALD", I.ald, [["", ""], ["Oui", "Oui"], ["Non", "Non"]], !okI).replace("<div", '<div data-champ="ald"') +
    champ("fCor", "Correspondant", I.cor, { liste: "lCor", off: !okI, large: true, ph: "Taper pour chercher, ou saisir un nouveau…" }).replace("<div", '<div data-champ="cor" data-fn="listes.cor"') + champ("fMut", "Mutuelle", I.mut, { liste: "lMut", off: !okI, large: true, ph: "Taper pour chercher, ou saisir une nouvelle…" }).replace("<div", '<div data-champ="mut"') + champ("fAdr", "Adresse", I.adresse, { off: !okI, large: true }).replace("<div", '<div data-champ="adresse"') + champ("fMail", "E-mail", I.email, { type: "email", off: !okI, large: true }).replace("<div", '<div data-champ="email"') + champsMed(C, !okC) +
    ficheP.htmlSaisie(x, (p) => (p === "clinique" ? !okC : !okI)) + "</div>" + // champs ajoutés (réglage du cabinet)
    '<datalist id="lMut">' + listeMut().map((m) => '<option value="' + esc(m) + '">').join("") + '</datalist><datalist id="lCor">' + listeCor().map((m) => '<option value="' + esc(m) + '">').join("") + "</datalist>" +
    '<div class="err" id="fErr"></div><div class="boutons">' + (peut("supprimerPatient") ? '<button class="bt gris" id="fSup" style="margin-right:auto;color:var(--rouge)"><svg class="pi"><use href="#i-corbeille"/></svg>Supprimer le patient</button>' : "") + '<button class="bt gris" onclick="fermerFenetre()">Annuler</button><button class="bt plein" id="fOk">Enregistrer</button></div>');
  activerDiag("fDiag", "fDiagP"); ficheP.appliquerFiche(document.querySelector("#fenetre .form"));
  if ($("fSup")) $("fSup").onclick = async () => {
    if (!confirm("Supprimer définitivement le dossier de " + x.r.nm + " ?\n\nToutes ses lignes de traitement et ses cures seront effacées.")) return;
    if (!confirm("Confirmer la suppression de " + x.r.nm + " ? Cette action est irréversible.")) return;
    try {
      await supprimerConsultations(x); await supprimerDocs(x); await supprimerFichiers(x); await supprimerRcp(x);
      await deleteDoc(doc(db, "espaces", ESPACE, "patients", x.id));
      if (peut("finances")) { await deleteDoc(doc(db, "espaces", ESPACE, "patientsFinances", x.id)).catch(() => {}); await deleteDoc(doc(db, "espaces", ESPACE, "encaissements", x.id)).catch(() => {}); }
      journal(x, "Patient supprimé"); D.patients.splice(D.patients.indexOf(x), 1); fermerFenetre(); toast("Dossier supprimé."); location.hash = "patients";
    } catch (e) { erreur(e && e.code === "permission-denied" ? "Vous n'avez pas le droit de supprimer ce dossier." : "Suppression impossible : " + ((e && e.message) || e)); }
  };
  $("fOk").onclick = async () => {
    const changes = {}, nI = Object.assign({}, I), nC = Object.assign({}, C), saisie = ficheP.lireSaisie();
    if (okC) CHAMPS_MED.forEach(([k]) => { const v = val("f_" + k); if (v) nC[k] = v; else delete nC[k]; });
    if (okI) {
      if (!val("fNomF") || !val("fPrenom")) { erreur("Le nom et le prénom sont obligatoires."); return; }
      Object.assign(nI, { nomF: val("fNomF").toUpperCase(), prenom: val("fPrenom"), ddn: val("fDdn"), sexe: val("fSexe"), tel: val("fTel"), tel2: val("fTel2"), cin: val("fCin").toUpperCase(), adresse: val("fAdr"), email: val("fMail"), ald: val("fAld"), mut: val("fMut"), cor: val("fCor") });
      ["tel2", "adresse", "email"].forEach((k) => { if (!nI[k]) delete nI[k]; });
      nI.nom = (nI.nomF + " " + nI.prenom).trim();
      const exI = ficheP.fusionnerExtra(I, "identite", saisie); if (Object.keys(exI).length) nI.extra = exI; else delete nI.extra;
      if (JSON.stringify(nI) !== JSON.stringify(I)) changes.identite = nI;
    }
    if (okC) {
      Object.assign(nC, { diag: val("fDiag"), diagP: val("fDiagP"), poids: val("fPoids").replace(",", "."), taille: val("fTaille") });
      const exC = ficheP.fusionnerExtra(C, "clinique", saisie); if (Object.keys(exC).length) nC.extra = exC; else delete nC.extra;
      if (JSON.stringify(nC) !== JSON.stringify(C)) changes.clinique = nC;
    }
    if (okE && val("fEtab") && val("fEtab") !== x.doc.etablissementId) changes.etablissementId = val("fEtab");
    // Changement d'hôpital (15 bis, 10/10/2026) : les actes faits avant aujourd'hui restent à l'ancien hôpital dans le bilan (moteur hopAu)
    if (changes.etablissementId && x.doc.etablissementId) changes.hopHist = (x.doc.hopHist || []).concat([{ hop: x.doc.etablissementId, avant: D.t, le: Date.now(), par: D.u.uid }]);
    if (!Object.keys(changes).length) { fermerFenetre(); return; }
    occupe($("fOk"), true);
    try { await enregistrer(x, changes, "Identité modifiée"); if (changes.etablissementId) { await suivreEtablissement(x, changes.etablissementId); await suivreEtablissementDocs(x, changes.etablissementId); await suivreEtablissementFichiers(x, changes.etablissementId); await suivreEtablissementRcp(x, changes.etablissementId); } if (okI || okC) await enrichirListes(okI ? val("fCor") : "", okI ? val("fMut") : "", okC ? val("fDiag") : ""); fermerFenetre(); toast("Dossier enregistré."); pageDossier(x.id); }
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
  const P = x.P, a = age(P.ddn, D.t), et = (D.etabsTous || D.etabs).find((e) => e.code === x.doc.etablissementId) || {};
  const l = (lib, v) => '<div class="' + (String(v || "").length > 60 || /\n/.test(v || "") ? "large" : "") + '"><label>' + lib + "</label><div>" + (v ? "<b>" + esc(v) + "</b>" : '<span class="mesures">—</span>') + "</div></div>";
  const m = (k, h) => h.replace("<div", '<div data-champ="' + k + '"'); // champ de la fiche (réglage du cabinet)
  fenetre("<h3>" + esc(x.r.nm) + '</h3><div class="form fiche-lecture">' +
    m("nom", l("Nom", P.nomF)) + m("prenom", l("Prénom", P.prenom)) + m("ddn", l("Date de naissance", P.ddn ? dfrA(P.ddn) + (a != null ? " (" + a + " ans)" : "") : "")) + m("sexe", l("Sexe", P.sexe === "F" ? "Femme" : P.sexe === "H" ? "Homme" : "")) +
    m("taille", l("Taille", P.taille ? P.taille + " cm" : "")) + m("poids", l("Poids", P.poids ? P.poids + " kg" : "")) + m("diag", l("Diagnostic", [P.diag, P.diagP].filter(Boolean).join(" – "))) + m("cin", l("CIN", P.cin)) + m("tel", l("Téléphone", P.tel)) + m("tel2", l("2e téléphone", P.tel2)) +
    m("etab", l("Hôpital", et.nom ? et.code + " – " + et.nom : x.doc.etablissementId)) + m("ald", l("ALD", P.ald)) + l("Correspondant", P.cor).replace("<div", '<div data-champ="cor" data-fn="listes.cor"') + m("mut", l("Mutuelle", P.mut)) + m("adresse", l("Adresse", P.adresse)) + m("email", l("E-mail", P.email)) +
    CHAMPS_MED.map(([k, lib]) => m(k, l(lib, P[k]))).join("") + ficheP.htmlLecture(x) + "</div>" +
    '<div class="boutons">' + (peut("identite") || peut("fichePatient") || traitMod() ? '<button class="bt clair" onclick="fermerFenetre();modifierIdentite(\'' + x.id + '\')">Modifier</button>' : "") + '<button class="bt plein" onclick="fermerFenetre()">Fermer</button></div>');
  ficheP.appliquerFiche(document.querySelector("#fenetre .fiche-lecture")); // ordre et champs du réglage du cabinet
};

// ───── Rendez-vous : ajouter, modifier, venu / non venu, supprimer ─────
// Types de rendez-vous : les activités de l'établissement du patient (Paramètres › Activités et rémunérations),
// sauf séance de chimio, consultation de chimio (encaissée dans la cure) et radiothérapie.
const STD_RDV = { annonce: "Annonce", suivi: "Suivi", controle: "Contrôle", hospit: "Hospitalisation" };
const ACT_DEF = [["annonce", "Consultation d'annonce"], ["suivi", "Consultation de suivi"], ["controle", "Consultation de contrôle"], ["hospit", "Hospitalisation"]];
function typesRdv(etab) {
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
  const med0 = R.med || (r0 ? medRdv(r0) : (pre && pre.med) || medDefaut()); // médecin (AG4)
  const du0 = +R.du || dureeType(cle, x.doc.etablissementId); let duMain = !!R.du && +R.du !== dureeType(cle, x.doc.etablissementId);
  if (!types.some((o) => o.v === cle)) types.push({ v: cle, lib: libRdv(R), act: R.act || null, type: R.type });
  fenetre("<h3>" + (r0 ? "Modifier le rendez-vous" : "Nouveau rendez-vous") + " – " + esc(x.r.nm) + '</h3><div class="form">' +
    '<div class="large"><label for="fType">Type</label><select id="fType">' + types.map((o) => '<option value="' + esc(o.v) + '"' + (o.v === cle ? " selected" : "") + ">" + esc(o.lib) + "</option>").join("") + "</select></div>" +
    '<div class="large"><label for="fMo">Motif de consultation</label><input id="fMo" value="' + esc(R.mo || "") + '" placeholder="Ex. nouveau patient, résultats du scanner, douleur…"></div>' +
    '<div><label for="fD">Date</label><input id="fD" type="date" value="' + esc(R.d || "") + '"></div>' +
    '<div id="zH"><label for="fH">Heure</label><input id="fH" type="time" step="900" value="' + esc(R.h || "") + '"></div>' +
    (multiMed() ? '<div class="large"><label for="fMed">Médecin</label><select id="fMed">' + D.medecins.concat(D.medecins.some((m) => m.uid === med0) ? [] : [{ uid: med0, nom: "Médecin retiré de l'équipe" }]).map((m) => '<option value="' + esc(m.uid) + '"' + (m.uid === med0 ? " selected" : "") + ">" + esc(m.nom) + "</option>").join("") + "</select></div>" : "") +
    '<div id="zDu"><label for="fDu">Durée</label><select id="fDu">' + DUREES_RDV.concat(DUREES_RDV.indexOf(du0) < 0 ? [du0] : []).sort((a, b) => a - b).map((m) => '<option value="' + m + '"' + (m === du0 ? " selected" : "") + ">" + m + " min</option>").join("") + "</select></div>" +
    '<div id="zF" class="cache"><label for="fF">Date de sortie</label><input id="fF" type="date" value="' + esc(R.f || "") + '"></div>' +
    '<div class="large" id="fCr"></div>' +
    '<div class="large"><label for="fN">Note</label><input id="fN" value="' + esc(R.n || "") + '"></div><p class="large mesures" id="fHor" style="margin:0"></p></div>' +
    '<div class="err" id="fErr"></div><div class="boutons"><button class="bt gris" onclick="fermerFenetre()">Annuler</button><button class="bt plein" id="fOk">Enregistrer</button></div>');
  const maj = () => { const hs = val("fType") === "s:Hospitalisation"; $("zH").classList.toggle("cache", hs); $("zDu").classList.toggle("cache", hs); $("zF").classList.toggle("cache", !hs); };
  const majH = () => { const d = val("fD"); if (!d) { $("fHor").textContent = ""; return; } const pl = horaires(x.doc.etablissementId).jours[new Date(d + "T12:00:00").getDay()] || []; $("fHor").textContent = "Horaires " + (x.doc.etablissementId || "du cabinet") + " le " + JNOM[new Date(d + "T12:00:00").getDay()] + " : " + (pl.length ? pl.map((p) => p[0] + "–" + p[1]).join(", ") : "fermé") + "."; };
  const sauf = r0 ? { pid: x.id, rid } : null, medChoisi = () => ($("fMed") ? val("fMed") : med0);
  const majC = () => {
    const z = $("fCr"), d = val("fD"); if (!z) return;
    if (!d || val("fType") === "s:Hospitalisation") { z.innerHTML = ""; return; }
    const C = creneaux(x.doc.etablissementId, d, sauf, +val("fDu"), medChoisi()), libres = C.l.filter((c) => !c.occ.length).length, hc = val("fH");
    z.innerHTML = C.l.length ? '<label>Créneaux du ' + esc(dfrA(d)) + ' <span class="mesures">(' + libres + " libre" + (libres > 1 ? "s" : "") + " pour " + C.du + " min)</span></label><div class=\"crx\">" + C.l.map((c) => c.occ.length
      ? '<span class="cr pris" title="' + esc(c.occ.map((o) => o.h + " " + o.nm).join(", ")) + '">' + c.h + "<i>" + esc(c.occ[0].nm.split(" ")[0]) + "</i></span>"
      : '<button type="button" class="cr' + (hc === c.h ? " on" : "") + '" data-h="' + c.h + '">' + c.h + "</button>").join("") + "</div>" : "";
  };
  $("fCr").onclick = (ev) => { const b = ev.target.closest("[data-h]"); if (b) { $("fH").value = b.dataset.h; majC(); } };
  $("fType").onchange = () => { if (!duMain) $("fDu").value = String(dureeType(val("fType"), x.doc.etablissementId)); maj(); majC(); };
  $("fDu").onchange = () => { duMain = true; majC(); }; if ($("fMed")) $("fMed").onchange = majC; maj(); $("fD").addEventListener("change", () => { majH(); majC(); }); $("fH").addEventListener("change", majC); majH(); majC();
  $("fOk").onclick = async () => {
    const o = types.find((z) => z.v === val("fType")) || types[0], type = o.type, act = o.act, d = val("fD"), hs = type === "Hospitalisation", h = hs ? "" : val("fH"), f = hs ? val("fF") : "";
    if (!d) { erreur("Indiquez la date."); return; }
    if (hs && f && f < d) { erreur("La date de sortie est avant la date d'entrée."); return; }
    const ab = absenceLe(d), fe = !ab && ferieLe(d), hz = horsHoraires(x.doc.etablissementId, d, h);
    if (!ab && !fe && hz && !confirm(hz + "\n\nEnregistrer quand même (urgence, rendez-vous exceptionnel) ?")) return;
    if (fe && !confirm("Le " + dfrA(d) + " est un jour férié (" + (fe.nom || "") + "). Enregistrer quand même ?")) return;
    if (ab && !confirm("Absence prévue ce jour-là (" + (ab.m || "absence") + ", du " + dfrA(ab.du) + " au " + dfrA(ab.au) + "). Enregistrer quand même ?")) return;
    // double réservation (19.4) : un autre rendez-vous de consultation qui chevauche cette heure
    const du = hs ? 0 : +val("fDu") || dureeType(val("fType"), x.doc.etablissementId);
    if (h) { const cf = rdvsDuJour(d, sauf, medChoisi()).filter((o) => mnH(o.h) < mnH(h) + du && mnH(h) < mnH(o.h) + o.du);
      if (cf.length && !confirm("Le " + dfrA(d) + " à " + h + ", il y a déjà : " + cf.map((o) => o.nm + " (" + o.h + ")").join(", ") + ".\n\nEnregistrer quand même ?")) return; }
    const l = lireRdvs(x);
    if (r0) {
      const r = l.find((v) => v.id === rid);
      if ((r.st || "prevu") === "prevu" && (r.d !== d || (r.h || "") !== h)) r.rep = (r.rep || []).concat([{ d: r.d, h: r.h || "", le: D.t }]);
      Object.assign(r, { type, d, h, n: val("fN") }); if (hs) { r.f = f; delete r.du; } else { delete r.f; r.du = du; } if (medChoisi()) r.med = medChoisi(); if (act) r.act = act; else delete r.act; if (val("fMo")) r.mo = val("fMo"); else delete r.mo;
    } else {
      const r = { id: "r" + Date.now().toString(36), type, d, h, n: val("fN"), st: "prevu" }; if (hs) r.f = f; else r.du = du; if (medChoisi()) r.med = medChoisi(); if (act) r.act = act; if (val("fMo")) r.mo = val("fMo"); l.push(r);
    }
    occupe($("fOk"), true);
    try { await enregistrer(x, { rdvsJson: JSON.stringify(l) }, r0 ? "Rendez-vous modifié" : "Rendez-vous ajouté"); fermerFenetre(); toast("Rendez-vous enregistré."); apresRdv(x);
      if (!r0 && !hs && d >= D.t && numeroWA(x.P.tel) && fnOn("agenda.whatsapp")) proposerConfirmation(x, d, h); }
    catch (e) { occupe($("fOk"), false); erreur(e.message); }
  };
};
// Juste après un nouveau rendez-vous (19.4) : confirmation par WhatsApp (message « Confirmation d'un rendez-vous » des Paramètres)
function proposerConfirmation(x, d, h) {
  fenetre("<h3>Rendez-vous enregistré</h3><p class=\"sous\">" + esc(x.r.nm) + " – " + cap(jourLong(d)) + (h ? " à " + h : "") + ". Envoyer la confirmation par WhatsApp ?</p>" +
    '<div class="wa-ex">' + esc(messageWA(x, "confirm", d, h)) + "</div>" +
    '<div class="boutons"><button class="bt gris" onclick="fermerFenetre()">Plus tard</button><button class="bt plein" style="background:#1FA855" onclick="fermerFenetre();envoyerWA(\'' + x.id + "','confirm','" + d + "','" + (h || "") + '\')">' + LOGO_WA + " Envoyer la confirmation</button></div>");
}
// Rendez-vous déplacé dans l'agenda par glisser-déposer (AG3, 11/10/2026) : confirmation avec les mêmes vérifications que la
// fenêtre du rendez-vous (absence, férié, horaires, double réservation), ancien horaire gardé dans `rep`, WhatsApp proposé
API.deplacerRdv = (pid, rid, d, h) => {
  const x = D.patients.find((p) => p.id === pid); if (!x || !peut("rendezvous")) return;
  const r0 = lireRdvs(x).find((v) => v.id === rid); if (!r0 || (r0.st || "prevu") !== "prevu") return;
  if (r0.d === d && (r0.h || "") === h) return;
  const et = x.doc.etablissementId, du = dureeDe(r0, et), ab = absenceLe(d), fe = !ab && ferieLe(d), hz = !ab && !fe && horsHoraires(et, d, h);
  const cf = rdvsDuJour(d, { pid, rid }, medRdv(r0)).filter((o) => mnH(o.h) < mnH(h) + du && mnH(h) < mnH(o.h) + o.du);
  const alertes = [ab ? "Absence prévue ce jour-là (" + (ab.m || "absence") + ", du " + dfrA(ab.du) + " au " + dfrA(ab.au) + ")." : "", fe ? "Le " + dfrA(d) + " est un jour férié (" + (fe.nom || "") + ")." : "", hz || "",
    cf.length ? "Déjà prévu à ce moment : " + cf.map((o) => o.nm + " (" + o.h + ")").join(", ") + "." : ""].filter(Boolean);
  fenetre("<h3>Déplacer le rendez-vous ?</h3><p class=\"sous\"><b>" + esc(x.r.nm) + "</b> – " + esc(libRdv(r0)) + " (" + du + " min)</p>" +
    '<p class="dep-de">Du <s>' + esc(cap(jourLong(r0.d))) + (r0.h ? " à " + esc(r0.h) : "") + "</s><br>au <b>" + esc(cap(jourLong(d))) + " à " + esc(h) + "</b></p>" +
    (alertes.length ? '<div class="per" style="color:var(--orange);background:var(--orange-c);display:block">' + alertes.map((t) => "<div>⚠️ " + esc(t) + "</div>").join("") + "</div>" : "") +
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
const encaisseIci = () => D.membre.role !== "medecin";
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
    const base = { pid: x.id, nom: (x.r && x.r.nm) || "", etab: x.doc.etablissementId || "", cle: o.cle, d: o.d || D.t, lib: o.lib || "", m: o.m, mode: o.mode || "", annee, par: D.u.uid, parNom: $("nomMenu").textContent, le: Date.now() };
    if (decisionRecu(ancien, o.m, o.mode) === "duplicata") { tr.update(ref, recuAEcrire(ancien, base)); return { numero: ancien.numero, duplicata: true }; }
    const c = await tr.get(cpt), n = (c.exists() ? c.data().n || 0 : 0) + 1;
    tr.set(cpt, { n, majPar: D.u.uid });
    tr.set(ref, Object.assign(recuAEcrire(ancien, base, n), { le: serverTimestamp() }));
    return { numero: numeroRecu(annee, n), duplicata: false, annule: ancien && ancien.numero };
  });
}
async function imprimerRecu(w, x, o) {
  if (!w) return;
  let num = null; try { num = await numeroterRecu(x, o); } catch (e) { console.warn("numéro du reçu", e); toast("Reçu imprimé sans numéro (" + (e.message || e) + ")."); }
  const P = x.P, et = (D.etabsTous || D.etabs).find((e) => e.code === x.doc.etablissementId) || {}, med = medecinFiche().nom || "";
  const civ = P.sexe === "F" ? "Mme " : P.sexe === "H" ? "M. " : "", nom = civ + String(P.nomF || x.r.nm || "").toUpperCase() + (P.prenom ? " " + cap(String(P.prenom).toLowerCase()) : "");
  const mode = (MODES.find((z) => z[0] === o.mode) || [])[2] || "", jr = (d) => { const z = new Date(d + "T12:00:00"); return z.getDate() + " " + ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"][z.getMonth()] + " " + z.getFullYear(); };
  const html = '<p class="d">' + esc(et.ville ? et.ville + ", le " : "Le ") + jr(D.t) + '</p><p class="t">REÇU</p>' + (num ? '<p class="num">N° ' + esc(num.numero) + (num.duplicata ? " · DUPLICATA" : "") + (num.annule ? " (remplace le n° " + esc(num.annule) + ", annulé)" : "") + "</p>" : "") +
    "<p>Reçu de <b>" + esc(nom) + "</b> la somme de <b>" + fmtMil(o.m) + " DH</b> (" + esc(montantEnLettres(o.m)) + ")" + (mode ? ", réglée " + mode : "") + ".</p>" +
    "<p>Objet : " + esc(String(o.lib || "consultation").charAt(0).toLowerCase() + String(o.lib || "consultation").slice(1)) + " du " + dfrA(o.d) + ".</p>" +
    '<p class="s">Cachet et signature<br><b>' + esc(med) + "</b></p>";
  const css = "@page{size:A5 portrait;margin:" + margesMm("a5") + "}html,body{margin:0}body{font-family:Arial,Helvetica,sans-serif;color:#000;font-size:12pt;line-height:1.5}p{margin:0 0 4mm}.d{text-align:right;margin-bottom:8mm}.t{text-align:center;font-weight:bold;font-size:15pt;letter-spacing:2px;margin-bottom:2mm}.num{text-align:center;font-size:10.5pt;margin-bottom:8mm}.s{text-align:right;margin-top:14mm}";
  w.document.open(); w.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>&#8203;</title><style>' + css + "</style></head><body>" + html + "</body></html>"); w.document.close();
  setTimeout(() => { try { w.focus(); w.print(); } catch (e) { /* fenêtre fermée */ } }, 400);
  journal(x, "Reçu " + (num ? num.numero + (num.duplicata ? " (duplicata)" : "") + " " : "") + "imprimé (" + fmtMil(o.m) + " DH, " + dfrA(o.d) + ")");
}
// Reçu réimprimé depuis « Consultations et hospitalisations » (prix à encaisser du dossier)
window.recuRdv = (pid, rid) => { const x = D.patients.find((p) => p.id === pid), E = x && encaissementsDe(x), o = E && (E.rdv || {})[rid], r = x && lireRdvs(x).find((v) => v.id === rid); if (!o || !r) return; imprimerRecu(window.open("", "_blank"), x, { d: r.dv || r.d, lib: libRdv(r), m: o.m, mode: o.mode, cle: cleRecuRdv(rid) }); };
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
const annulable = (r) => D.membre.role === "medecin" || (!!r.sp && r.sp === D.u.uid);
window.statutRdv = async (id, rid, st) => {
  const x = D.patients.find((p) => p.id === id); if (!x) return;
  const l = lireRdvs(x), r = l.find((v) => v.id === rid); if (!r) return; const ancien = r.st || "prevu";
  if (st === "prevu" && !annulable(r)) { toast("Statut posé par le médecin : lui seul peut l'annuler."); return; }
  if (st === "supprimer") { if (!confirm("Supprimer ce rendez-vous ?")) return; l.splice(l.indexOf(r), 1); }
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
  if (sec) { try { const s = await getDoc(doc(db, "espaces", ESPACE, "encaissements", x.id)); const E = s.exists() ? JSON.parse(s.data().data || "{}") : {}, o = (E.rdv || {})[r.id]; if (o) M0 = { rdv: { [r.id]: o.tj != null ? { tj: o.tj } : { brut: o.m, mode: o.mode } } }; } catch (e) {} }
  else { try { const s = await getDoc(doc(db, "espaces", ESPACE, "patientsFinances", x.id)); M0 = s.exists() ? JSON.parse(s.data().montantsJson || "{}") : {}; } catch (e) {} }
  const o0 = (M0.rdv || {})[r.id] || {}, nj = hs ? joursH(r) : 1, lieuCab = payeCabinet(x) && !hs && !o0.v1, cab = lieuCab && encaisseIci(); // lieu « payé au cabinet » (19.5)
  const enc = cab && deja && aEncaisser(o0.mode); // « Encaisser » (salle d'attente, dossier) : la secrétaire reçoit le paiement
  // Médecin sans secrétaire ce jour-là : case « Encaisser maintenant » (décochée = « à encaisser » pour la secrétaire)
  const medCab = lieuCab && !encaisseIci(), dejaPaye = (!!o0.mode && !aEncaisser(o0.mode)) || !!(opts && opts.encaisser); // ouvert par « Encaisser » : case cochée
  const encT = enc || (medCab && deja && aEncaisser(o0.mode) && !!(opts && opts.encaisser)); // libellés « Encaisser »
  const pp = deja ? null : prixPrevu(x.id, "r-" + r.id, r.d); // prix convenu d'avance dans la salle d'attente (payé avant la consultation)
  const def = o0.v1 ? o0.prix : hs ? (o0.tj != null ? o0.tj : pp != null ? pp : v.brut) : o0.brut != null ? o0.brut : pp != null ? pp : v.brut;
  const fmt = (n) => (n == null || n === "" || isNaN(n) ? "" : Number(n).toLocaleString("fr-FR", { maximumFractionDigits: 2 }).replace(/[\u202f\u00a0]/g, " "));
  fenetre("<h3>" + esc(x.r.nm) + " – " + esc(libRdv(r)) + '</h3><p class="sous">' + cap(jourLong(r.d)) + (r.h ? " à " + r.h : "") + (hs && nj ? " · " + nj + " jour" + (nj > 1 ? "s" : "") + " d'hospitalisation" : "") + "</p>" +
    '<div class="form"><div><label for="pvM">' + (hs && !o0.v1 ? "Tarif journalier (DH)" : "Montant de la consultation (DH)") + '</label><input id="pvM" class="mt" inputmode="decimal" value="' + esc(fmt(def)) + '"></div>' + (cab ? htmlMode(o0.mode) : medCab ? '<div id="pvEncZ"' + (dejaPaye ? "" : ' class="cache"') + ">" + htmlMode(o0.mode).replace(/^<div>|<\/div>$/g, "") + "</div>" : "") + "</div>" +
    (medCab ? '<label class="chk" style="margin:4px 0 6px"><input type="checkbox" id="pvEncK"' + (dejaPaye ? " checked" : "") + '> Encaisser maintenant (pas de secrétaire : le patient me paie)</label>' : "") +
    '<p class="mesures">Tarif ' + esc(etab || "de l'établissement") + " : " + fmt(v.brut) + " DH" + (hs ? " par jour" : "") + ". Modifiez le montant en cas de réduction ou de gratuité (0).</p>" +
    '<div class="err" id="fErr"></div><div class="boutons"><button class="bt gris" onclick="fermerFenetre()">Annuler</button>' + (cab || medCab ? '<button class="bt clair' + (medCab && !dejaPaye ? " cache" : "") + '" id="fOkR">' + ic("imprimer") + (encT ? "Encaisser et imprimer le reçu" : deja ? "Enregistrer et imprimer le reçu" : "Valider et imprimer le reçu") + "</button>" : "") + '<button class="bt vert" id="fOk"><svg class="pi"><use href="#i-check"/></svg>' + (encT ? "Encaisser" : deja ? "Enregistrer le prix" : "Valider : venu") + "</button></div>");
  const valider = async (recu) => {
    // médecin dans un lieu « au cabinet » : le paiement déjà reçu est gardé, sinon « à encaisser » (la secrétaire encaissera)
    const m = parseFloat(val("pvM").replace(/[\s\u202f\u00a0]/g, "").replace(",", ".")), mode = cab || (medCab && $("pvEncK").checked) ? val("pvMode") : lieuCab ? "ae" : "";
    if (isNaN(m) || m < 0) { erreur("Indiquez le montant (0 si gratuit)."); return; }
    const w = recu && mode !== "np" && m > 0 ? window.open("", "_blank") : null; // fenêtre d'impression ouverte au clic
    occupe($("fOk"), true);
    try {
      const lib = fmt(m) + " DH" + (hs && !o0.v1 ? "/jour" : "") + (mode === "ae" ? ", à encaisser" : mode ? ", " + libMode(mode) : "");
      if (!deja) { r.st = "fait"; r.dv = r.d; r.sp = D.u.uid; await enregistrer(x, { rdvsJson: JSON.stringify(l) }, "Rendez-vous : venu (" + lib + ")"); }
      if (sec) {
        try { await appelServeur("prixConsultation", Object.assign({ espace: ESPACE, patientId: x.id, rdvId: r.id, montant: m }, mode ? { mode } : {})); }
        catch (e) { if (!deja) { fermerFenetre(); toast("Rendez-vous validé, mais le prix n'a pas pu être enregistré : " + e.message); apresStatutRdv(x, r, "fait", "prevu"); reafficher(x.id); return; } throw e; }
        oublierEncaissements(x.id);
      } else await majMontants(x, (M) => { M.rdv = M.rdv || {}; const o = M.rdv[r.id] = M.rdv[r.id] || {}; if (o.v1) o.prix = m; else if (hs) { o.tj = m; delete o.brut; } else o.brut = m; if (mode) o.mode = mode; else delete o.mode; });
      if (deja) journal(x, "Prix de la consultation du " + dfrA(r.d) + " : " + lib);
      fermerFenetre(); toast("Enregistré."); if (deja) apresPrix(x, "r-" + r.id, r.d); else apresStatutRdv(x, r, "fait", "prevu"); reafficher(x.id);
      if (w) imprimerRecu(w, x, { d: r.dv || r.d, lib: libRdv(r), m, mode, cle: cleRecuRdv(r.id) });
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
  const etab = x.doc.etablissementId, d0 = prochainJour(etab, r.d > D.t ? r.d : D.t);
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
    }
    r.st = "absent"; delete r.dv; r.sp = D.u.uid;
    if (rep) { const n = { id: "r" + Date.now().toString(36), type: r.type, d, h, n: r.n || "", st: "prevu", rep: [{ d: r.d, h: r.h || "", le: D.t, abs: true }] }; if (r.act) n.act = r.act; if (r.mo) n.mo = r.mo; l.push(n); }
    occupe($("fOk"), true);
    try { await enregistrer(x, { rdvsJson: JSON.stringify(l) }, "Rendez-vous : non venu" + (rep ? " (reporté au " + dfrA(d) + (h ? " à " + h : "") + ")" : "")); fermerFenetre(); toast(rep ? "Absent ; rendez-vous reporté au " + dfrA(d) + (h ? " à " + h : "") + "." : "Enregistré."); apresStatutRdv(x, r, "absent", "prevu"); reafficher(x.id); }
    catch (e) { occupe($("fOk"), false); erreur(e.message); }
  };
}
// Nouveau rendez-vous depuis le tableau de bord ou l'agenda : choisir d'abord le patient
window.nouveauRdv = (d, h, etab, med) => { // med : médecin choisi dans le filtre de l'agenda (AG4)
  if (!peut("rendezvous")) { toast("Vous n'avez pas le droit de gérer les rendez-vous."); return; }
  fenetre("<h3>Nouveau rendez-vous" + (d ? " – " + cap(jourLong(d)) + (h ? " à " + h : "") : "") + '</h3><div class="form"><div class="large"><label for="rq">Patient</label><input id="rq" placeholder="Nom, prénom…" autocomplete="off"></div></div><div id="rqL" class="liste-choix"></div>' + (peut("creerPatient") ? '<p class="mesures" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">Patient absent de la liste ? <button class="bt clair petit" id="rqNv">' + ic("plus") + "Nouveau patient</button> (puis le rendez-vous)</p>" : '<p class="mesures">Patient absent de la liste : demandez la création de son dossier.</p>') + '<div class="boutons"><button class="bt gris" onclick="fermerFenetre()">Annuler</button></div>');
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
function rdvsDuJour(d, sauf, med) { // med (AG4) : à partir de 2 médecins, seulement les rendez-vous de ce médecin
  const l = [];
  D.patients.forEach((x) => { if (!voitRdv()) return; (x.P.rdvs || []).forEach((r) => { if (r.d === d && r.h && typeRdv(r.type) !== "hospit" && r.st !== "absent" && !(sauf && x.id === sauf.pid && r.id === sauf.rid) && !(med && multiMed() && medRdv(r) !== med)) l.push({ h: r.h, nm: x.r.nm, du: dureeDe(r, x.doc.etablissementId) }); }); });
  return l.sort((a, b) => a.h.localeCompare(b.h));
}
// AG2 : créneaux au pas du lieu ; proposé = la durée voulue (`duV`, sinon le pas) tient avant la fin de la plage ; pris = touche
// un autre rendez-vous (chacun avec sa propre durée)
function creneaux(etab, d, sauf, duV, med) {
  const H = horaires(etab), pas = H.duree || 30, du = duV || pas, pl = (H.jours[new Date(d + "T12:00:00").getDay()] || []).slice().sort((a, b) => a[0].localeCompare(b[0])), pris = rdvsDuJour(d, sauf, med);
  const n = new Date(), now = d === D.t ? n.getHours() * 60 + n.getMinutes() : -1, out = [];
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
  fenetre("<h3>" + (r0 ? "Modifier la prescription" : "Nouvelle prescription de radiothérapie") + " – " + esc(x.r.nm) + '</h3><div class="form">' +
    '<div class="large"><label for="rActe">Acte</label><select id="rActe"><option value="">— Choisir l\'acte —</option>' + listeActes(R.acte).map((a) => '<option' + (a === R.acte ? " selected" : "") + ">" + esc(a) + "</option>").join("") + "</select></div>" +
    sel("rHop", "Établissement", R.hop || "", [["", "—"]].concat(D.etabs.map((e) => [e.code, e.code + " – " + e.nom])), {}) + "<div></div>" +
    sel("rTech", "Technique", R.tech || "", [["", "—"], ["stereo", "Stéréotaxie"], ["vmat", "VMAT"], ["imrt", "IMRT"], ["3d", "3D"]], {}) + sel("rInt", "Intention", R.intent || "", [["", "—"], ["curative", "Curative"], ["palliative", "Palliative"]], {}) +
    ch("rDose", "Dose totale (Gy)", R.dose, { mode: "decimal" }) + ch("rNb", "Fractions (nombre de séances)", R.nb, { mode: "numeric" }) +
    '<div class="large"><label>Dose par fraction</label><div id="rDpf" class="mesures" style="font-size:15px;font-weight:bold;color:var(--titre)">—</div></div>' +
    sel("rRyt", "Rythme", R.ryt || "1", [["1", "Quotidien (lundi–vendredi)"], ["2", "1 jour sur 2"]], {}) + ch("rNbA", "Nombre d'actes", R.nbA || 1, { mode: "numeric" }) +
    ch("rScan", "Scanner de centrage", R.scan, { type: "date" }) + ch("rDeb", "1re séance", R.deb, { type: "date" }) +
    '<div class="large"><label>Fin prévue (calculée)</label><div id="rFinCalc" class="mesures" style="font-size:15px;font-weight:bold;color:var(--titre)">—</div></div>' +
    ch("rFinPrev", "Fin prévue (si différente)", R.finPrev, { type: "date" }) + "<div></div>" +
    sel("rCj", "Consultation hebdomadaire", R.cj || "", [["", "Aucune"], ["1", "Lundi"], ["2", "Mardi"], ["3", "Mercredi"], ["4", "Jeudi"], ["5", "Vendredi"]], {}) + ch("rCh", "Heure de la consultation", R.ch, { type: "time" }) +
    '<div class="large"><label><input id="rVmat" type="checkbox" style="width:auto;margin-right:8px"' + (R.vmat ? " checked" : "") + ">Supplément VMAT (facturation)</label></div>" +
    (peut("finances") && D.tarifs ? '<div class="large cache" id="rVmatM" style="background:#FFF7D6;border-radius:10px;padding:10px"><label for="rVmatP">Montant VMAT (DH)</label><input id="rVmatP" inputmode="decimal" value="' + esc(R.vmatPrix != null ? R.vmatPrix : D.tarifs.vmat != null ? D.tarifs.vmat : "") + '"></div>' : "") +
    '<div class="large"><label for="rNote">Résumé clinique / notes</label><textarea id="rNote">' + esc(R.note || "") + "</textarea></div></div>" +
    '<div class="err" id="fErr"></div><div class="boutons">' + (r0 ? '<button class="bt gris" id="rSup" style="margin-right:auto;color:var(--rouge)">Supprimer</button>' : "") + '<button class="bt gris" onclick="fermerFenetre()">Annuler</button><button class="bt plein" id="fOk">Enregistrer</button></div>');
  const calc = () => {
    const d = parseFloat(val("rDose").replace(",", ".")), n = parseInt(val("rNb"), 10);
    $("rDpf").textContent = d && n ? String(Math.round((d / n) * 100) / 100).replace(".", ",") + " Gy par fraction" : "—";
    const f = val("rDeb") && n ? finRT({ deb: val("rDeb"), nb: n, ryt: val("rRyt") }, D.ctx.feries) : null;
    $("rFinCalc").textContent = f ? cap(jourLong(f)) + " " + f.slice(0, 4) : "—";
  };
  ["rDose", "rNb", "rDeb", "rRyt"].forEach((i) => { $(i).oninput = calc; $(i).onchange = calc; }); calc();
  // Comme l'application actuelle : stéréotaxie = 1 jour sur 2 ; curiethérapie = au moins 2 actes ; montant VMAT pour le droit « finances »
  $("rActe").onchange = () => { const a = val("rActe"); $("rRyt").value = /st[ée]r[ée]otax/i.test(a) ? "2" : "1"; if (/curieth/i.test(a) && !(parseInt(val("rNbA"), 10) >= 2)) $("rNbA").value = "2"; calc(); };
  const zV = $("rVmatM"); if (zV) { const majV = () => zV.classList.toggle("cache", !$("rVmat").checked); $("rVmat").onchange = majV; majV(); }
  const sauver = (liste, quoi) => sauverRT(x, liste, quoi);
  if (r0) $("rSup").onclick = async () => { if (!confirm("Supprimer cette prescription de radiothérapie ?")) return; try { await sauver(l.filter((v) => v.id !== rid), "Prescription de radiothérapie supprimée"); fermerFenetre(); toast("Prescription supprimée."); pageDossier(x.id); } catch (e) { erreur(e.message); } };
  $("fOk").onclick = async () => {
    if (!val("rActe")) { erreur("Indiquez l'acte."); return; }
    const n = val("rNb"); if (n && !(parseInt(n, 10) > 0)) { erreur("Le nombre de fractions doit être un nombre."); return; }
    // 2.5 (12/10/2026, audit) : dates dans l'ordre ; dose par fraction > 22 Gy ou dose totale > 80 Gy → confirmation
    if (val("rScan") && val("rDeb") && val("rDeb") < val("rScan")) { erreur("La 1re séance est avant le scanner de centrage (" + dfrA(val("rScan")) + ")."); return; }
    if (val("rDeb") && val("rFinPrev") && val("rFinPrev") < val("rDeb")) { erreur("La fin prévue est avant la 1re séance."); return; }
    const dT = parseFloat(String(val("rDose")).replace(",", ".")), nF = parseInt(n, 10), dF = dT && nF ? Math.round((dT / nF) * 100) / 100 : null;
    if ((dF && dF > 22) || dT > 80) { if (!confirm("Vérifiez la prescription : " + String(dT).replace(".", ",") + " Gy" + (nF ? " en " + nF + " fraction(s), soit " + String(dF).replace(".", ",") + " Gy par fraction" : "") + ".\n" + (dF > 22 ? "Plus de 22 Gy par fraction. " : "") + (dT > 80 ? "Plus de 80 Gy au total." : "") + "\n\nEnregistrer quand même ?")) return; }
    // dose, fractions, rythme ou technique changés après la dosimétrie validée → la dosimétrie est à revalider (gardée dans l'historique)
    const cle = (o) => [String(o.dose || "").replace(",", "."), String(o.nb || ""), o.ryt || "1", o.tech || ""].join("|");
    const revalider = r0 && r0.dosi && !r0.fin && cle(r0) !== cle({ dose: val("rDose"), nb: val("rNb"), ryt: val("rRyt"), tech: val("rTech") });
    if (revalider && !confirm("La prescription change alors que la dosimétrie a été validée le " + dfrA(r0.dosi) + ".\nLa dosimétrie devra être revalidée (la validation actuelle est gardée dans l'historique et une tâche « Valider la dosimétrie » est recréée).\n\nEnregistrer ?")) return;
    const r = r0 || { id: "rt" + Date.now().toString(36), cree: D.t };
    if (revalider) { r.dosiHist = (r.dosiHist || []).concat([{ dosi: r.dosi, dosiPar: r.dosiPar || "", dosiLe: r.dosiLe || "", retireLe: new Date().toISOString(), raison: "prescription modifiée : " + cle(r0) + " → " + cle({ dose: val("rDose"), nb: val("rNb"), ryt: val("rRyt"), tech: val("rTech") }) }]); r.dosiN = (r.dosiN || 0) + 1; delete r.dosi; delete r.dosiPar; delete r.dosiLe; }
    Object.assign(r, { acte: val("rActe"), hop: val("rHop"), tech: val("rTech"), intent: val("rInt"), dose: val("rDose").replace(",", "."), nb: val("rNb"), ryt: val("rRyt"), nbA: val("rNbA") || "1", scan: val("rScan"), deb: val("rDeb"), finPrev: val("rFinPrev"), cj: val("rCj"), ch: val("rCh"), vmat: $("rVmat").checked, note: $("rNote").value.trim() });
    ["finPrev", "scan", "deb", "cj", "ch", "tech", "intent", "dose", "note"].forEach((k) => { if (!r[k]) delete r[k]; });
    const liste = r0 ? l : l.concat([r]), acteAvant = r0 ? (x.P.rts || []).find((v) => v.id === rid) : null;
    occupe($("fOk"), true);
    try {
      if (peut("finances") && D.tarifs) await majMontants(x, (M) => { const m = M.rt[r.id] = M.rt[r.id] || {}, t = (D.tarifs.actesRT || []).find((a) => a.nom === r.acte);
        if (t && (m.prix == null || !acteAvant || acteAvant.acte !== r.acte)) m.prix = t.prix;
        if (r.vmat) { const v = parseFloat(String(val("rVmatP")).replace(",", ".")); m.vmatPrix = isNaN(v) ? (D.tarifs.vmat != null ? D.tarifs.vmat : null) : v; } });
      await sauver(liste, r0 ? "Prescription de radiothérapie modifiée" + (revalider ? " (dosimétrie à revalider)" : "") : "Prescription de radiothérapie ajoutée"); fermerFenetre(); toast("Prescription enregistrée."); pageDossier(x.id); }
    catch (e) { occupe($("fOk"), false); erreur(e.message); }
  };
};
// Enregistre les prescriptions et régénère les consultations hebdomadaires « en cours de radiothérapie »
async function sauverRT(x, liste, quoi) {
  const P2 = { rts: liste, rdvs: JSON.parse(x.doc.rdvsJson || "[]") }, avant = JSON.stringify(P2.rdvs);
  if (fnOn("rt.hebdo")) genererConsultRT(P2, Object.assign({}, D.ctx, { nouvelId: idsParDefaut() })); // consultations hebdomadaires (réglage du cabinet)
  const changes = { rtsJson: JSON.stringify(P2.rts) };
  if (JSON.stringify(P2.rdvs) !== avant && peut("rendezvous")) changes.rdvsJson = JSON.stringify(P2.rdvs);
  await enregistrer(x, changes, quoi);
}
// Dosimétrie : validée par un médecin (contourage et plan de traitement vérifiés) ; « annuler » la remet à valider
const peutDosi = () => traitModRT() && D.membre.role === "medecin";
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
// Menu repliable (20.2) : colonne d'icônes sur ordinateur, choix gardé sur l'appareil ; nom de la page au survol
const menuReplie = (oui) => {
  document.body.classList.toggle("menu-replie", oui);
  const b = $("btReplier"), t = oui ? "Déplier le menu" : "Replier le menu"; b.title = t; b.setAttribute("aria-label", t);
  try { localStorage.setItem("onco360.menuReplie", oui ? "1" : "0"); } catch (e) { /* stockage indisponible : choix non gardé */ }
};
$("btReplier").onclick = () => menuReplie(!document.body.classList.contains("menu-replie"));
menuReplie(document.body.classList.contains("menu-replie"));
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
$("btSortie").onclick = async () => { if (!confirm("Se déconnecter d'Onco360 sur cet appareil ?")) return; await signOut(auth); location.replace("index.html"); };
