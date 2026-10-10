// Onco360 – Profil (étape C7) : mes informations, mes lieux d'exercice, accès et droits de l'équipe (médecin titulaire).
import { sendPasswordResetEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc, getDocs, setDoc, deleteDoc, collection, query, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db, auth, app, GOOGLE_CLIENT_ID } from "../config.js";

let A = null;
import * as aboP from "./abonnement.js";
export function installer(api) { A = api; }
const D = () => A.D();
let ONG = "infos", MEMBRES = null, ESPACE_DOC = null, Q = "";
const ROLES = { medecin: "Médecin", infirmiere: "Infirmière", assistante: "Assistante / secrétaire", comptable: "Comptable" };
// Droits proposés par défaut selon le rôle (grille validée en phase B1, complétée le 06/10/2026 et le 07/10/2026), modifiables membre par membre.
// radiotherapie : "aucun" | "voir" | "modifier" | "chimio" (= voir, seulement les patients sous chimio en même temps)
export const DROITS_ROLE = {
  medecin: { identite: true, fichePatient: true, rendezvous: true, consultations: true, ecrireConsultations: true, planningChimio: true, traitements: "modifier", radiotherapie: "modifier", documents: true, administrer: true, encaissements: true, creerPatient: true, supprimerPatient: true, finances: true, parametres: true, secretariat: true },
  infirmiere: { identite: false, fichePatient: false, rendezvous: false, consultations: false, ecrireConsultations: false, planningChimio: false, traitements: "voir", radiotherapie: "chimio", documents: false, administrer: true, encaissements: false, creerPatient: false, supprimerPatient: false, finances: false, parametres: false, secretariat: false },
  assistante: { identite: true, fichePatient: true, rendezvous: true, consultations: true, ecrireConsultations: true, planningChimio: true, traitements: "voir", radiotherapie: "aucun", documents: true, administrer: false, encaissements: true, creerPatient: true, supprimerPatient: false, finances: false, parametres: false, secretariat: true },
  // Comptable (étape 9 S2, 09/10/2026) : bilan et pointage des paiements seulement ; aucun dossier (les règles le lui ferment)
  comptable: { identite: false, fichePatient: false, rendezvous: false, consultations: false, ecrireConsultations: false, planningChimio: false, traitements: "aucun", radiotherapie: "aucun", documents: false, administrer: false, encaissements: false, creerPatient: false, supprimerPatient: false, finances: true, parametres: false, secretariat: false },
};
// Droits d'un membre : ceux de sa grille, complétés par les valeurs par défaut de son rôle pour les droits ajoutés depuis
export const droitsEffectifs = (m) => Object.assign({}, DROITS_ROLE[(m && m.role)] || {}, (m && m.droits) || {});
const LIB_DROITS = [
  ["identite", "Identité des patients (modifier)"], ["fichePatient", "Fiche du patient : poids, taille, diagnostic, allergies, antécédents (modifier)"],
  ["rendezvous", "Rendez-vous (créer, modifier, venu / non venu)"], ["consultations", "Voir les consultations et hospitalisations"],
  ["ecrireConsultations", "Journal des consultations et ordonnances : créer, modifier (tous le lisent)"],
  ["traitements", "Chimiothérapie : lignes, cures et doses", "niv"], ["radiotherapie", "Radiothérapie : prescriptions et rendez-vous", "niv"],
  ["documents", "Documents : pli confidentiel, compte rendu, rendez-vous Excel (voir, télécharger)"],
  ["planningChimio", "Planning de l'hôpital de jour (déplacer les cures)"],
  ["encaissements", "Prix à encaisser : consultations validées par le médecin, consultation de chimio"],
  ["creerPatient", "Créer un patient"], ["supprimerPatient", "Supprimer un patient"], ["finances", "Montants, tarifs, bilan"], ["parametres", "Paramètres, bibliothèque, configuration, établissements"],
  ["secretariat", "Paramètres du secrétariat : absences, jours fériés, horaires de ses lieux, messages WhatsApp, RCP, listes, types de tâches et de documents, impression, alertes"],
];
const NIVEAUX = [["aucun", "Non visible"], ["voir", "Voir"], ["modifier", "Modifier"]];
const NIVEAUX_RT = [["aucun", "Non visible"], ["chimio", "Voir : patients sous chimio"], ["voir", "Voir : tous"], ["modifier", "Modifier"]];
const estTitulaire = () => !!(ESPACE_DOC && ESPACE_DOC.titulaire === D().u.uid);

// Image (signature, logo) réduite et enregistrée directement dans le document
export function lireImage(input, max, jpeg) {
  return new Promise((ok, ko) => {
    const f = input.files && input.files[0]; if (!f) { ok(null); return; }
    if (!/^image\//.test(f.type)) { ko(new Error("Choisissez une image (PNG ou JPEG).")); return; }
    const r = new FileReader(); r.onerror = () => ko(new Error("Lecture de l'image impossible."));
    r.onload = () => { const img = new Image(); img.onerror = () => ko(new Error("Image illisible.")); img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement("canvas"); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); let u = jpeg ? c.toDataURL("image/jpeg", 0.86) : c.toDataURL("image/png"); if (u.length > 280000) u = c.toDataURL("image/jpeg", 0.85); ok(u); }; img.src = r.result; };
    r.readAsDataURL(f);
  });
}

// Profil & Paramètres (18.5, 10/10/2026, modèle Tbibclic) : onglets Informations (la personne) · Accès (équipe, titulaire ; repris
// de la page Paramètres) · Abonnement et Factures (titulaire, abonnement.js). Lieux d'exercice et Google Agenda restent dans
// Paramètres (configuration.js : htmlOngletProfil / apresOngletProfil).
let PF_ONG = "infos";
const ONGLETS_PF = () => [["infos", "profil", "Informations"]].concat(estTitulaire() && !D().bib ? (D().reg && D().reg.sections && D().reg.sections.acces === false ? [] : [["acces", "patients", "Accès"]]).concat([["abonnement", "banque", "Abonnement"], ["factures", "document", "Factures"]]) : []);
export async function pageProfil(arg) {
  await chargerEspace();
  if (arg) PF_ONG = arg;
  if (!ONGLETS_PF().some((o) => o[0] === PF_ONG)) PF_ONG = "infos";
  const barre = ONGLETS_PF().length > 1 ? '<div class="ag-vues" style="align-self:flex-start">' + ONGLETS_PF().map(([k, ico, lib]) => '<button class="' + (PF_ONG === k ? "on" : "") + '" onclick="location.hash=\'profil/' + k + '\'">' + A.ic(ico) + lib + "</button>").join("") + "</div>" : "";
  const tete = '<section class="accueil"><div><h2>Profil &amp; Paramètres</h2><p>' + (ONGLETS_PF().length > 1 ? "Vos informations, l'accès de votre équipe, votre abonnement et vos factures." : "Vos informations.") + "</p></div></section>" + barre;
  if (PF_ONG === "acces") { A.$("page").innerHTML = tete + '<div id="cfProfil">' + (await vueAcces()) + "</div>"; return; }
  if (PF_ONG === "abonnement" || PF_ONG === "factures") {
    const dessiner = () => { if (!location.hash.startsWith("#profil")) return; A.$("page").innerHTML = tete + (PF_ONG === "abonnement" ? aboP.htmlAbonnement() : aboP.htmlFactures()); };
    dessiner(); aboP.chargerAbo(true).then(dessiner); return;
  }
  A.$("page").innerHTML = tete + vueInfos();
}
async function chargerEspace() { if (!ESPACE_DOC) { const s = await getDoc(doc(db, "espaces", A.ESPACE)).catch(() => null); ESPACE_DOC = s && s.exists() ? s.data() : {}; } }
// Onglets repris dans Paramètres : lieux | gagenda | acces
export async function htmlOngletProfil(k) { await chargerEspace(); return k === "lieux" ? vueLieux() : k === "gagenda" ? await vueAgendaG() : k === "acces" ? await vueAcces() : ""; }
export function apresOngletProfil(k) { if (k === "lieux") { const q = A.$("pfQ"); if (q) { q.oninput = () => { Q = q.value; A.$("pfL").innerHTML = listeLieux(); }; if (Q) { q.focus(); q.setSelectionRange(Q.length, Q.length); } } } }
export const titulaireConnecte = async () => { await chargerEspace(); return estTitulaire(); };
// Après une action (lieu, agenda, accès) : la page Paramètres se redessine (le Profil, s'il est affiché)
const rafraichir = () => (location.hash.startsWith("#parametres") && A.pageParametres ? A.pageParametres() : pageProfil(PF_ONG));
window.pfOnglet = (o) => { location.hash = "parametres/" + (o === "gagenda" ? "couleurs" : o); }; // anciens liens

// ───── Informations ─────
function vueInfos() {
  const p = D().profil || {}, mb = D().membre, esc = A.esc;
  const inpe = p.inpe || "", med = mb.role === "medecin"; // titre Dr / Pr, spécialité, INPE, signature : médecins seulement (10/10/2026)
  const ch = (id, lib, v, o) => '<div class="' + (o && o.large ? "large" : "") + '"><label for="' + id + '">' + lib + '</label><input id="' + id + '" value="' + esc(v || "") + '"' + (o && o.type ? ' type="' + o.type + '"' : "") + (o && o.off ? " disabled" : "") + (o && o.ph ? ' placeholder="' + o.ph + '"' : "") + (o && o.ac ? ' autocomplete="' + o.ac + '"' : "") + "></div>";
  return '<section class="carte"><h3><span class="ic">' + A.ic("profil") + '</span>Mes informations</h3><p class="sous">' + (med ? "Le nom, l\'INPE et la signature apparaissent sur la fiche de chimiothérapie et les comptes rendus." : "Votre nom apparaît dans les consultations, les tâches et les ordonnances que vous préparez.") + "</p>" +
    '<div class="photo-pf"><div class="av grand">' + (p.photo ? '<img src="' + p.photo + '" alt="Photo">' : esc(((p.prenom || "")[0] || "") + ((String(p.nom || "").replace(/^Dr\.?\s*/i, ""))[0] || "")).toUpperCase() || "?") + '</div><div><label for="pfPhoto">Photo (facultatif)</label><input id="pfPhoto" type="file" accept="image/*"><div class="mesures">Elle remplace vos initiales dans la bulle du profil.</div>' + (p.photo ? '<label style="font-weight:normal;margin-top:6px"><input id="pfPhotoSup" type="checkbox" style="width:auto;margin-right:6px">Retirer la photo</label>' : "") + "</div></div><div class=\"form\">" +
    '<div><label for="pfTitre">Titre</label><select id="pfTitre">' + (med ? ["", "Dr", "Pr", "M.", "Mme"] : ["", "M.", "Mme"]).map((t) => "<option" + ((p.titre || "") === t ? " selected" : "") + ">" + t + "</option>").join("") + "</select></div>" +
    (med ? ch("pfSpe", "Spécialité", p.specialite, { ph: "Oncologue-radiothérapeute, oncologue médical…" }) : "") + ch("pfPre", "Prénom", p.prenom) + ch("pfNom", "Nom", p.nom) +
    ch("pfMail", "E-mail (identifiant de connexion)", D().u.email, { off: true }) + ch("pfTel", "Téléphone", p.telephone, { type: "tel", ph: "06…" }) +
    ch("pfRole", "Rôle dans l'espace", ROLES[mb.role] || mb.role, { off: true }) + (med ? ch("pfInpe", "INPE", inpe, { ph: "N° INPE" }) +
    '<div class="large"><label>Signature (image scannée, facultatif)</label><div class="sig">' + (p.signature ? '<img src="' + p.signature + '" alt="Signature">' : '<span class="mesures">Aucune signature enregistrée.</span>') + '<input id="pfSig" type="file" accept="image/*">' + (p.signature ? '<label style="font-weight:normal"><input id="pfSigSup" type="checkbox" style="width:auto;margin-right:6px">Retirer la signature</label>' : "") + "</div></div>" : "") +
    '</div><h4 class="soustitre">Mot de passe</h4><p class="mesures">Laissez vide pour ne pas le changer.</p><div class="form">' + ch("pfMdpA", "Mot de passe actuel", "", { type: "password", ac: "current-password" }) + ch("pfMdp", "Nouveau mot de passe (8 caractères minimum)", "", { type: "password", ac: "new-password" }) + ch("pfMdp2", "Confirmer le nouveau mot de passe", "", { type: "password", ac: "new-password" }) + "</div>" +
    '<div class="err" id="fErr"></div><div class="boutons"><button class="bt plein" id="pfOk" onclick="pfEnregistrer()"><svg class="pi"><use href="#i-enregistrer"/></svg>Enregistrer</button></div></section>';
}
window.pfEnregistrer = async () => {
  const b = A.$("pfOk"), err = (t) => { A.$("fErr").textContent = t; }, v = A.val, p = D().profil || {};
  const n1 = A.$("pfMdp").value, n2 = A.$("pfMdp2").value, old = A.$("pfMdpA").value;
  if (n1 || n2) { if (n1.length < 8) { err("Le nouveau mot de passe doit faire au moins 8 caractères."); return; } if (n1 !== n2) { err("Les deux mots de passe ne sont pas identiques."); return; } if (!old) { err("Indiquez votre mot de passe actuel pour le changer."); return; } }
  A.occupe(b, true); err("");
  try {
    const maj = { email: D().u.email, titre: v("pfTitre"), prenom: v("pfPre"), nom: v("pfNom").toUpperCase(), telephone: v("pfTel") };
    if (A.$("pfInpe")) Object.assign(maj, { specialite: v("pfSpe"), inpe: v("pfInpe") }); // médecins
    const sig = A.$("pfSig") ? await lireImage(A.$("pfSig"), 500) : null; if (sig) maj.signature = sig; else if (A.$("pfSigSup") && A.$("pfSigSup").checked) maj.signature = "";
    const ph = await lireImage(A.$("pfPhoto"), 256, true); if (ph) maj.photo = ph; else if (A.$("pfPhotoSup") && A.$("pfPhotoSup").checked) maj.photo = "";
    await setDoc(doc(db, "utilisateurs", D().u.uid), maj, { merge: true });
    if (n1) {
      try { await reauthenticateWithCredential(auth.currentUser, EmailAuthProvider.credential(D().u.email, old)); }
      catch (e) { throw new Error("Mot de passe actuel incorrect : le mot de passe n'a pas été changé (le reste est enregistré)."); }
      await updatePassword(auth.currentUser, n1);
    }
    D().profil = Object.assign({}, p, maj); A.entete(); A.toast(n1 ? "Profil et mot de passe enregistrés." : "Profil enregistré."); pageProfil("infos");
  } catch (e) { A.occupe(b, false); err(e.message || String(e)); }
};

// ───── Lieux d'exercice ─────
function vueLieux() {
  const ok = A.peut("parametres");
  return '<section class="carte"><div class="entete"><h3><span class="ic">' + A.ic("accueil") + '</span>' + (D().membre.tousEtablissements ? "Mes lieux d\'exercice" : "Mon lieu d\'exercice") + "</h3>" + (ok ? '<button class="bt clair petit" onclick="pfLieu()">' + A.ic("plus") + "Ajouter un hôpital</button>" : "") + "</div>" +
    '<p class="sous">Chaque patient est rattaché à un établissement : il détermine les tarifs appliqués et les membres de l\'équipe qui voient le dossier.</p>' +
    '<div class="recherche" style="max-width:460px">' + A.ic("loupe") + '<input id="pfQ" type="search" placeholder="Rechercher un établissement…" value="' + A.esc(Q) + '"></div><div id="pfL" style="margin-top:10px">' + listeLieux() + "</div></section>";
}
function listeLieux() {
  const esc = A.esc, sa = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""), m = sa(Q).split(/\s+/).filter(Boolean);
  // membre limité à certains établissements (secrétaire d'un centre, 10/10/2026) : seulement les siens
  const mb = D().membre, l = (D().etabsTous || D().etabs).filter((e) => (mb.tousEtablissements || (mb.etablissements || []).indexOf(e.code) >= 0) && m.every((w) => sa(e.code + " " + e.nom + " " + (e.adresse || "")).indexOf(w) >= 0));
  if (!l.length) return '<p class="sous">Aucun établissement.</p>';
  return l.map((e) => '<div class="lieu' + (e.actif === false ? " off" : "") + '">' + (e.logo ? '<img src="' + e.logo + '" alt="">' : '<span class="av">' + esc(e.code) + "</span>") +
    '<div class="tx"><b>' + esc(e.nom) + ' <span class="badge b-gr">' + esc(e.code) + "</span>" + (e.actif === false ? ' <span class="badge b-al">Désactivé</span>' : "") + "</b><span>" + esc([e.adresse, e.tel].filter(Boolean).join(" · ") || "Adresse et téléphone à compléter") + "</span></div>" +
    (A.peut("parametres") ? '<button class="mini" onclick="pfLieu(\'' + esc(e.code) + "')\">Modifier</button>" : "") + "</div>").join("");
}
window.pfLieu = (code) => {
  const maxE = D().abo && D().abo.max.etablissements; // formule du cabinet (09/10/2026)
  if (!code && maxE != null && (D().etabsTous || D().etabs).length >= maxE) { alert("Votre formule Onco360 permet " + maxE + " lieu" + (maxE > 1 ? "x" : "") + " d'exercice : la limite est atteinte.\nContactez l'éditeur d'Onco360 pour en ajouter."); return; }
  const e = code ? (D().etabsTous || D().etabs).find((z) => z.code === code) : { actif: true }, esc = A.esc;
  A.fenetre("<h3>" + (code ? "Modifier l'établissement" : "Ajouter un hôpital") + '</h3><div class="form">' +
    '<div><label for="lCode">Code court</label><input id="lCode" value="' + esc(e.code || "") + '" placeholder="ex. HGC"' + (code ? " disabled" : "") + '></div><div><label for="lTel">Téléphone</label><input id="lTel" type="tel" value="' + esc(e.tel || "") + '"></div>' +
    '<div class="large"><label for="lNom">Nom complet</label><input id="lNom" value="' + esc(e.nom || "") + '"></div><div class="large"><label for="lAdr">Adresse</label><input id="lAdr" value="' + esc(e.adresse || "") + '"></div>' +
    '<div><label for="lVille">Ville</label><input id="lVille" value="' + esc(e.ville || "") + '" placeholder="Casablanca"></div>' +
    '<div class="large"><label>Logo (facultatif)</label><div class="sig">' + (e.logo ? '<img src="' + e.logo + '" alt="Logo">' : "") + '<input id="lLogo" type="file" accept="image/*"></div></div>' +
    (code ? '<div class="large"><label style="font-weight:normal"><input id="lActif" type="checkbox" style="width:auto;margin-right:6px"' + (e.actif !== false ? " checked" : "") + ">Établissement actif (proposé pour les nouveaux dossiers)</label></div>" : "") +
    '</div><p class="mesures">Le code ne peut plus être changé ensuite : il est enregistré dans les dossiers des patients.</p><div class="err" id="fErr"></div><div class="boutons"><button class="bt gris" onclick="fermerFenetre()">Annuler</button>' + (code ? '<button class="bt gris" id="lSup" style="color:var(--rouge)"><svg class="pi"><use href="#i-corbeille"/></svg>Supprimer</button>' : "") + '<button class="bt plein" id="fOk">Enregistrer</button></div>');
  if (A.$("lSup")) A.$("lSup").onclick = async () => {
    const n = D().patients.filter((x) => x.doc.etablissementId === code).length;
    if (n) { A.erreur(n + " dossier" + (n > 1 ? "s sont rattachés" : " est rattaché") + " à " + code + " : changez d'abord leur établissement, ou décochez « Établissement actif » pour ne plus le proposer."); return; }
    if (!confirm("Supprimer définitivement l'établissement " + code + " – " + (e.nom || "") + " ?")) return;
    A.occupe(A.$("lSup"), true);
    try {
      await deleteDoc(doc(db, "espaces", A.ESPACE, "etablissements", code));
      const T = D().tarifs;
      if (T && T.etablissements && T.etablissements[code] && A.peut("finances")) {
        delete T.etablissements[code]; await setDoc(doc(db, "espaces", A.ESPACE, "finances", "tarifs"), { data: JSON.stringify(T) }, { merge: true }).catch(() => {});
        if (D().activites) { delete D().activites[code]; await setDoc(doc(db, "espaces", A.ESPACE, "parametres", "activites"), { data: JSON.stringify(D().activites) }).catch(() => {}); }
      }
      D().etabsTous = (D().etabsTous || D().etabs).filter((z) => z.code !== code); D().etabs = D().etabsTous.filter((z) => z.actif !== false);
      A.journal({ id: "", r: { nm: "" } }, "Établissement supprimé : " + code); A.fermerFenetre(); A.toast("Établissement supprimé."); rafraichir();
    } catch (er) { A.occupe(A.$("lSup"), false); A.erreur(er && er.code === "permission-denied" ? "Vous n'avez pas le droit de supprimer les établissements." : (er.message || String(er))); }
  };
  A.$("fOk").onclick = async () => {
    const c = (code || A.val("lCode")).toUpperCase().replace(/[^A-Z0-9_-]/g, ""), nom = A.val("lNom");
    if (!c || !nom) { A.erreur("Le code et le nom complet sont obligatoires."); return; }
    if (!code && (D().etabsTous || D().etabs).some((z) => z.code === c)) { A.erreur("Ce code existe déjà."); return; }
    A.occupe(A.$("fOk"), true);
    try {
      const n = Object.assign({}, e, { code: c, nom, adresse: A.val("lAdr"), ville: A.val("lVille"), tel: A.val("lTel"), actif: A.$("lActif") ? A.$("lActif").checked : true });
      const logo = await lireImage(A.$("lLogo"), 400); if (logo) n.logo = logo;
      await setDoc(doc(db, "espaces", A.ESPACE, "etablissements", c), n);
      const tous = (D().etabsTous || D().etabs).filter((z) => z.code !== c).concat([n]).sort((a, z) => a.code.localeCompare(z.code));
      D().etabsTous = tous; D().etabs = tous.filter((z) => z.actif !== false);
      A.journal({ id: "", r: { nm: "" } }, (code ? "Établissement modifié : " : "Établissement ajouté : ") + c);
      A.fermerFenetre(); A.toast("Établissement enregistré."); rafraichir();
    } catch (er) { A.occupe(A.$("fOk"), false); A.erreur(er && er.code === "permission-denied" ? "Vous n'avez pas le droit de modifier les établissements." : (er.message || String(er))); }
  };
};

// ───── Google Agenda : chaque membre relie SON compte Google ; un agenda « Onco360 » y est créé et tenu à jour
// (sens unique) par les fonctions serveur (functions/index.js) avec les patients qu'il a le droit de voir.
// État : utilisateurs/{uid}.agendaGoogle. Ancienne synchronisation par le script Google du titulaire : parametres/agendaGoogle.
const URL_GAGENDA = "https://calendar.google.com/calendar/r";
const SCOPES_GAGENDA = "openid email https://www.googleapis.com/auth/calendar.app.created";
let GIS = null; // bibliothèque Google (fenêtre de connexion), chargée à l'ouverture de l'onglet
const chargerGIS = () => GIS || (GIS = new Promise((ok, ko) => { if (window.google && google.accounts && google.accounts.oauth2) { ok(); return; } const s = document.createElement("script"); s.src = "https://accounts.google.com/gsi/client"; s.async = true; s.onload = () => ok(); s.onerror = () => { GIS = null; ko(new Error("Google injoignable")); }; document.head.appendChild(s); }));
async function appelServeur(nom, donnees) {
  const { getFunctions, httpsCallable } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-functions.js");
  try { return (await httpsCallable(getFunctions(app, "europe-west1"), nom, { timeout: 300000 })(donnees || {})).data; }
  catch (e) { throw new Error(String((e && e.message) || e).replace(/^(FirebaseError: )?/, "")); }
}
const ilYa = (iso) => { const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000); return min < 1 ? "à l'instant" : min < 60 ? "il y a " + min + " min" : min < 1440 ? "il y a " + Math.round(min / 60) + " h" : "le " + A.dfrA(iso.slice(0, 10)); };
async function vueAgendaG() {
  const [su, sa] = await Promise.all([getDoc(doc(db, "utilisateurs", D().u.uid)).catch(() => null), getDoc(doc(db, "espaces", A.ESPACE, "parametres", "agendaGoogle")).catch(() => null)]);
  const G = su && su.exists() ? su.data().agendaGoogle || null : null; D().profil.agendaGoogle = G;
  const V = sa && sa.exists() ? JSON.parse(sa.data().data || "{}") : null; D().agendaG = V;
  if (GOOGLE_CLIENT_ID) chargerGIS().catch(() => {});
  const esc = A.esc, tit = estTitulaire(), relie = !!(G && G.email);
  let h = '<section class="carte"><h3><span class="ic">' + A.ic("agenda") + "</span>Mon Google Agenda</h3>";
  if (!relie) h += '<div class="per" style="color:var(--orange);background:var(--orange-c)">Pas encore relié</div><p class="sous">Reliez votre compte Google : un agenda « Onco360 » y sera créé et tenu à jour automatiquement, avec les patients que vous suivez dans Onco360 et l\'échéance des tâches dont vous êtes responsable.</p>';
  else if (G.erreur) h += '<div class="per"><svg class="pi"><use href="#i-alerte"/></svg>Relié à ' + esc(G.email) + " – la dernière mise à jour a échoué (" + esc(ilYa(G.le)) + ')</div><p class="sous">' + esc(G.erreur) + "</p>";
  else h += '<div class="per" style="color:var(--vert);background:var(--vert-c)"><svg class="pi"><use href="#i-check"/></svg>Relié à ' + esc(G.email) + " · mis à jour " + esc(ilYa(G.le)) + '</div><p class="sous">Agenda « Onco360 » dans ce compte Google' + (G.nb != null ? " : " + G.nb + " événement" + (G.nb > 1 ? "s" : "") + " à venir" : "") + ".</p>";
  h += '<div class="actr" style="justify-content:flex-start;margin:4px 0 14px">' +
    (relie ? '<a class="bt plein" href="' + URL_GAGENDA + '" target="_blank" rel="noopener" style="text-decoration:none">' + A.ic("agenda") + 'Ouvrir Google Agenda</a><button class="bt clair" id="gaMaj" onclick="pfMajAgenda()">Mettre à jour maintenant</button><button class="bt gris" onclick="pfDelierAgenda()">Délier</button>'
      : '<button class="bt plein" id="gaLier" onclick="pfLierAgenda()">' + A.ic("agenda") + "Lier mon Google Agenda</button>") + "</div>" +
    '<p class="mesures"><b>Ce qui apparaît :</b> consultations, hospitalisations' + (["voir", "modifier"].indexOf((D().membre.droits || {}).traitements) >= 0 ? ", cures J1/J8…" : "") + (["voir", "modifier"].indexOf((D().membre.droits || {}).radiotherapie) >= 0 ? ", scanner, dosimétrie, début et fin de radiothérapie" : "") + (tit ? ", absences du cabinet" : "") +
    ", pour les patients " + (D().membre.tousEtablissements ? "de tous les établissements" : "de vos établissements (" + esc((D().membre.etablissements || []).join(", ")) + ")") + ". Mise à jour à chaque enregistrement dans Onco360 (en général en moins d'une minute).</p>" +
    '<p class="mesures"><b>Sens unique :</b> ce qui est ajouté ou modifié dans Google Agenda ne revient pas dans Onco360. Créez et déplacez toujours les rendez-vous dans Onco360. <b>Tâches :</b> celles dont vous êtes responsable et qui ont une échéance (journée entière, ou 15 min à l\'heure prévue ; « EN RETARD » reportée chaque jour sur aujourd\'hui ; retirée une fois terminée ; sans rappel Google). Onco360 n\'a accès qu\'à l\'agenda « Onco360 » qu\'il a créé : vos autres agendas Google ne sont ni lus ni modifiés. L\'agenda apparaît aussi sur votre téléphone (application Google Agenda, ou Calendrier de l\'iPhone relié à ce compte Google).</p></section>';
  // Titulaire : ancienne synchronisation (script Google, agenda « Chimio HGC » renommé) encore active
  if (tit && V && !V.arrete && V.le) h += '<section class="carte"><h3><span class="ic">' + A.ic("horloge") + "</span>Ancienne synchronisation (script Google)</h3>" +
    '<p class="sous">L\'agenda « ' + esc(V.calendrier || "Chimio HGC") + " » est encore rempli par votre script Google (dernière mise à jour " + esc(ilYa(V.le)) + ")." +
    (relie ? " Votre nouvel agenda « Onco360 » le remplace : dans le script Google, lancez <b>arreterAgendaAppsScript</b>, puis supprimez l'ancien agenda dans Google Agenda si vous n'en voulez plus (ses rendez-vous passés y restent sinon)." : " Il continue de fonctionner jusqu'à ce que vous reliez votre Google Agenda ci-dessus.") + "</p></section>";
  return h;
}
window.pfLierAgenda = () => {
  if (!GOOGLE_CLIENT_ID) { A.toast("La liaison Google n'est pas encore configurée sur le serveur (identifiant Google à ajouter)."); return; }
  if (!(window.google && google.accounts && google.accounts.oauth2)) { A.toast("Connexion à Google en cours… réessayez dans un instant."); chargerGIS().catch(() => A.toast("Google est injoignable. Vérifiez la connexion Internet.")); return; }
  const b = A.$("gaLier");
  google.accounts.oauth2.initCodeClient({
    client_id: GOOGLE_CLIENT_ID, scope: SCOPES_GAGENDA, ux_mode: "popup", select_account: true, login_hint: D().u.email,
    callback: async (r) => {
      if (!r || r.error || !r.code) { A.toast("Liaison annulée."); return; }
      A.occupe(b, true); A.toast("Liaison en cours : création de l'agenda « Onco360 » et ajout des rendez-vous…");
      try { const o = await appelServeur("agendaLier", { code: r.code, espace: A.ESPACE }); A.journal({ id: "", r: { nm: "" } }, "Google Agenda relié (" + o.email + ")"); A.toast("Google Agenda relié : " + o.nb + " événement(s) ajouté(s) dans « Onco360 »."); }
      catch (e) { A.toast(e.message); }
      rafraichir();
    },
    error_callback: (e) => A.toast(e && e.type === "popup_closed" ? "Fenêtre Google fermée : liaison annulée." : e && e.type === "popup_failed_to_open" ? "Autorisez les fenêtres (pop-up) pour chimio-hgc.web.app, puis recommencez." : "Liaison impossible."),
  }).requestCode();
};
window.pfMajAgenda = async () => {
  const b = A.$("gaMaj"); A.occupe(b, true);
  try { const o = await appelServeur("agendaMaj"); A.toast("Google Agenda à jour : " + o.nb + " événement(s)."); } catch (e) { A.toast(e.message); }
  rafraichir();
};
window.pfDelierAgenda = async () => {
  if (!confirm("Délier votre Google Agenda ? Onco360 ne le mettra plus à jour.")) return;
  const sup = confirm("Supprimer aussi l'agenda « Onco360 » de votre compte Google ?\n\nOK = le supprimer · Annuler = le garder (il ne sera plus mis à jour)");
  try { await appelServeur("agendaDelier", { supprimer: sup }); A.journal({ id: "", r: { nm: "" } }, "Google Agenda délié"); A.toast("Google Agenda délié."); } catch (e) { A.toast(e.message); }
  rafraichir();
};

// ───── Accès de l'équipe (médecin titulaire) ─────
// Comptes utilisés / permis par la formule du cabinet (rien si sans limite)
function quotas() {
  const mx = (D().abo && D().abo.max) || {}, l = [["medecin", "Médecins"], ["assistante", "Secrétaires"], ["infirmiere", "Infirmières"], ["comptable", "Comptables"]].filter(([k]) => mx[k] != null);
  if (!l.length) return "";
  return '<p class="mesures">Votre formule : ' + l.map(([k, lib]) => lib + " " + MEMBRES.filter((x) => x.role === k && x.actif !== false).length + " / " + mx[k]).join(" · ") + "</p>";
}
async function vueAcces() {
  if (!MEMBRES) { const s = await getDocs(collection(db, "espaces", A.ESPACE, "membres")); MEMBRES = s.docs.map((d) => Object.assign({ uid: d.id }, d.data())).sort((a, b) => String(a.nom).localeCompare(String(b.nom))); }
  const esc = A.esc, moi = D().u.uid;
  return '<section class="carte"><div class="entete"><h3><span class="ic">' + A.ic("patients") + '</span>Gestion des accès</h3><button class="bt plein petit" onclick="pfMembre()">' + A.ic("plus") + "Ajouter un accès</button></div>" +
    '<p class="sous">Chaque membre a sa propre grille de droits, pré-remplie selon son rôle et modifiable. Le serveur la fait respecter : un membre ne peut ni voir ni modifier ce que sa grille ne permet pas.</p>' + quotas() +
    MEMBRES.map((m) => '<div class="lieu' + (m.actif === false ? " off" : "") + '"><span class="av">' + esc(String(m.nom || m.email || "?").replace(/^Dr\.?\s*/i, "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase()) + "</span>" +
      '<div class="tx"><b>' + esc(m.nom || m.email) + ' <span class="badge b-co">' + esc(ROLES[m.role] || m.role) + "</span>" + (m.actif === false ? ' <span class="badge b-al">' + (m.horsQuota ? "Hors formule" : "Désactivé") + "</span>" : "") + (m.uid === moi ? ' <span class="badge b-gr">Vous</span>' : "") + "</b><span>" + esc([m.email, m.telephone, m.tousEtablissements ? "Tous les établissements" : (m.etablissements || []).join(", ")].filter(Boolean).join(" · ")) + "</span></div>" +
      (m.uid === moi ? "" : '<button class="mini" onclick="pfLienMdp(\'' + m.uid + '\')" title="Lien pour choisir son mot de passe, à lui envoyer (WhatsApp, SMS)">Lien du mot de passe</button><button class="mini" onclick="pfMembre(\'' + m.uid + '\')">Droits</button>') + "</div>").join("") + "</section>";
}
function grille(dr, role) {
  const esc = A.esc;
  return '<div class="tableau"><table class="tcures droits"><tr><th>Droit</th><th style="width:230px">Accès</th></tr>' + LIB_DROITS.map(([k, lib, niv]) => {
    const v = dr[k];
    return "<tr><td>" + esc(lib) + "</td><td>" + (niv ? '<select data-d="' + k + '">' + (k === "radiotherapie" ? NIVEAUX_RT : NIVEAUX).map((o) => '<option value="' + o[0] + '"' + ((v || "aucun") === o[0] ? " selected" : "") + ">" + o[1] + "</option>").join("") + "</select>" : '<label style="font-weight:normal"><input type="checkbox" data-d="' + k + '" style="width:auto"' + (v ? " checked" : "") + "> Oui</label>") + "</td></tr>";
  }).join("") + "</table></div>";
}
window.pfMembre = (uid) => {
  const m0 = uid ? MEMBRES.find((z) => z.uid === uid) : null, esc = A.esc, etabs = D().etabsTous || D().etabs;
  const m = m0 ? JSON.parse(JSON.stringify(m0)) : { role: "infirmiere", actif: true, tousEtablissements: false, etablissements: [], droits: Object.assign({}, DROITS_ROLE.infirmiere) };
  m.droits = droitsEffectifs(m); // droits ajoutés depuis la création du membre : valeur par défaut de son rôle
  const dessiner = () => {
    A.fenetre("<h3>" + (m0 ? "Droits de " + esc(m.nom || m.email) : "Ajouter un accès") + '</h3><div class="form">' +
      (m0 ? '<div class="large mesures">' + esc(m.email || "") + "</div>" : '<div><label for="mPre">Prénom</label><input id="mPre"></div><div><label for="mNom">Nom</label><input id="mNom"></div><div><label for="mMail">E-mail (identifiant de connexion)</label><input id="mMail" type="email" autocomplete="off"></div><div><label for="mTel">Téléphone</label><input id="mTel" type="tel"></div>') +
      '<div><label for="mRole">Rôle</label><select id="mRole">' + Object.entries(ROLES).map(([k, l]) => '<option value="' + k + '"' + (m.role === k ? " selected" : "") + ">" + l + "</option>").join("") + "</select></div>" +
      '<div class="large"><label>Établissements visibles</label><div class="plages"><label style="font-weight:normal"><input id="mTous" type="checkbox" style="width:auto;margin-right:6px"' + (m.tousEtablissements ? " checked" : "") + ">Tous les établissements</label>" +
      etabs.map((e) => '<label style="font-weight:normal"><input type="checkbox" data-e="' + esc(e.code) + '" style="width:auto;margin-right:6px"' + ((m.etablissements || []).indexOf(e.code) >= 0 ? " checked" : "") + (m.tousEtablissements ? " disabled" : "") + ">" + esc(e.code) + "</label>").join("") + "</div></div></div>" +
      '<h4 class="soustitre">Droits</h4>' + grille(m.droits || {}, m.role) +
      (m0 ? '<div style="margin-top:12px"><label style="font-weight:normal"><input id="mActif" type="checkbox" style="width:auto;margin-right:6px"' + (m.actif !== false ? " checked" : "") + ">Accès actif (décocher pour bloquer la connexion ; l'historique reste conservé)</label></div>" : '<p class="mesures" style="margin-top:10px">Le compte est créé immédiatement. La personne reçoit un e-mail pour choisir son mot de passe, puis se connecte sur chimio-hgc.web.app.</p>') +
      '<div class="err" id="fErr"></div><div class="boutons">' + (m0 ? '<button class="bt gris" id="mSup" style="margin-right:auto;color:var(--rouge)"><svg class="pi"><use href="#i-corbeille"/></svg>Supprimer l\'accès</button>' : "") + '<button class="bt gris" onclick="fermerFenetre()">Annuler</button><button class="bt plein" id="fOk">' + (m0 ? "Enregistrer" : "Créer l'accès") + "</button></div>", "large");
    if (A.$("mSup")) A.$("mSup").onclick = async () => {
      if (!confirm("Supprimer l'accès de " + (m.nom || m.email) + " ?\n\nLa personne ne pourra plus se connecter à Onco360. L'historique de ses actions est conservé.")) return;
      A.occupe(A.$("mSup"), true);
      try { await deleteDoc(doc(db, "espaces", A.ESPACE, "membres", uid)); A.journal({ id: "", r: { nm: "" } }, "Accès supprimé : " + (m.nom || m.email)); MEMBRES = null; A.fermerFenetre(); A.toast("Accès supprimé."); rafraichir(); }
      catch (e) { A.occupe(A.$("mSup"), false); A.erreur(e && e.code === "permission-denied" ? "Seul le médecin titulaire peut supprimer un accès." : (e.message || String(e))); }
    };
    const lire = () => { m.tousEtablissements = A.$("mTous").checked; m.etablissements = [...document.querySelectorAll("[data-e]")].filter((c) => c.checked).map((c) => c.dataset.e); document.querySelectorAll("[data-d]").forEach((c) => { m.droits[c.dataset.d] = c.tagName === "SELECT" ? c.value : c.checked; }); if (A.$("mActif")) m.actif = A.$("mActif").checked; ["mPre", "mNom", "mMail", "mTel"].forEach((i) => { if (A.$(i)) m["_" + i] = A.val(i); }); };
    A.$("mRole").onchange = () => { lire(); const r = A.val("mRole"); if (confirm("Appliquer les droits par défaut du rôle « " + ROLES[r] + " » ?")) m.droits = Object.assign({}, DROITS_ROLE[r]); m.role = r; if (r === "medecin" || r === "comptable") m.tousEtablissements = true; dessiner(); ["mPre", "mNom", "mMail", "mTel"].forEach((i) => { if (A.$(i)) A.$(i).value = m["_" + i] || ""; }); };
    A.$("mTous").onchange = () => document.querySelectorAll("[data-e]").forEach((c) => { c.disabled = A.$("mTous").checked; });
    A.$("fOk").onclick = async () => {
      lire(); m.role = A.val("mRole");
      if (m.role === "comptable") m.tousEtablissements = true; // le bilan de tout le cabinet (aucun dossier ne lui est ouvert)
      if (!m.tousEtablissements && !m.etablissements.length) { A.erreur("Choisissez au moins un établissement."); return; }
      A.occupe(A.$("fOk"), true);
      try {
        if (m0) {
          const { uid: u, ...data } = m; Object.keys(data).filter((k) => k[0] === "_").forEach((k) => delete data[k]);
          await setDoc(doc(db, "espaces", A.ESPACE, "membres", uid), data);
          A.journal({ id: "", r: { nm: "" } }, "Droits modifiés : " + (m.nom || m.email) + (m.actif === false ? " (accès désactivé)" : ""));
        } else {
          const lim = D().abo && D().abo.max[m.role]; // formule du cabinet (09/10/2026)
          if (lim != null && MEMBRES.filter((x) => x.role === m.role && x.actif !== false).length >= lim) throw new Error("Votre formule Onco360 permet " + lim + " compte(s) « " + (ROLES[m.role] || m.role) + " » : la limite est atteinte. Contactez l'éditeur d'Onco360 pour en ajouter.");
          const email = String(m._mMail || "").trim().toLowerCase(), nom = [m._mPre, String(m._mNom || "").toUpperCase()].filter(Boolean).join(" ");
          if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("Indiquez une adresse e-mail valide.");
          if (!m._mNom) throw new Error("Indiquez le nom.");
          // Compte créé par le serveur (la création depuis le navigateur est fermée dans Firebase, 10/10/2026)
          const nouvel = await appelServeur("creerMembre", { espace: A.ESPACE, email, prenom: m._mPre || "", nom: m._mNom || "", telephone: m._mTel || "", role: m.role, tousEtablissements: m.tousEtablissements, etablissements: m.etablissements, droits: m.droits });
          let envoi = "";
          if (!nouvel.existant) { try { await sendPasswordResetEmail(auth, email); envoi = "Un e-mail a été envoyé à " + email + " (souvent dans les indésirables) pour choisir le mot de passe."; } catch (er) { envoi = "L'e-mail n'a pas pu partir."; } }
          A.journal({ id: "", r: { nm: "" } }, "Accès créé : " + nom + " (" + ROLES[m.role] + ")");
          MEMBRES = null; rafraichir();
          fenetreMotDePasse({ uid: nouvel.uid, nom, email, telephone: m._mTel || "" }, nouvel.existant ? "Accès ajouté : ce compte existait déjà, la personne garde son mot de passe." : "Accès créé. " + envoi + " Vous pouvez aussi lui envoyer le lien vous-même :");
          return;
        }
        MEMBRES = null; A.fermerFenetre(); if (m0) A.toast("Droits enregistrés."); rafraichir();
      } catch (e) { A.occupe(A.$("fOk"), false); A.erreur(e && e.code === "permission-denied" ? "Seul le médecin titulaire peut gérer les accès." : (e.message || String(e))); }
    };
  };
  dessiner();
};
// Lien du mot de passe d'un membre (titulaire) : message prêt à copier ou à envoyer par WhatsApp (10/10/2026)
window.pfLienMdp = (uid) => { const m = (MEMBRES || []).find((z) => z.uid === uid); if (m) fenetreMotDePasse({ uid, nom: m.nom || m.email, email: m.email, telephone: m.telephone || "" }, "Lien pour choisir le mot de passe (valable 1 heure, un seul usage) :"); };
function fenetreMotDePasse(m, intro) {
  const esc = A.esc;
  A.fenetre("<h3>Mot de passe de " + esc(m.nom) + '</h3><p class="sous">' + esc(intro) + '</p><div id="lmZone"><button class="bt plein" id="lmFaire">Préparer le lien</button></div><div class="boutons"><button class="bt gris" onclick="fermerFenetre()">Fermer</button></div>');
  A.$("lmFaire").onclick = async () => {
    A.occupe(A.$("lmFaire"), true);
    try {
      const o = await appelServeur("lienMembre", { espace: A.ESPACE, uid: m.uid });
      const txt = "Bonjour " + m.nom + ",\nVotre accès à Onco360 est prêt. Cliquez sur ce lien pour choisir votre mot de passe (valable 1 heure) :\n" + o.lien + "\n\nEnsuite, connectez-vous sur " + location.origin + " avec votre adresse " + o.email + ".";
      const tel = String(m.telephone || "").replace(/[^0-9]/g, "").replace(/^00/, "").replace(/^0(?=[5-7])/, "212");
      A.$("lmZone").innerHTML = '<textarea id="lmTxt" class="notes" rows="7" readonly>' + esc(txt) + '</textarea><div class="actr" style="justify-content:flex-start;margin-top:8px"><button class="bt clair" id="lmCopier">Copier le message</button><a class="bt plein" style="background:#1FA855" target="_blank" rel="noopener" href="https://wa.me/' + tel + "?text=" + encodeURIComponent(txt) + '">Envoyer par WhatsApp</a></div>';
      A.$("lmCopier").onclick = async () => { const t = A.$("lmTxt"); try { await navigator.clipboard.writeText(t.value); } catch (e) { t.select(); document.execCommand("copy"); } A.$("lmCopier").textContent = "Copié"; };
    } catch (e) { A.occupe(A.$("lmFaire"), false); A.erreur(e.message || String(e)); }
  };
}
