// node functions/test-cabinets.js — création d'un cabinet (phase F, 09/10/2026)
const C = require("./cabinets");
const ok = (c, m) => { console.log((c ? "✅ " : "❌ ") + m); if (!c) process.exitCode = 1; };
const echoue = (f) => { try { f(); return false; } catch (e) { return true; } };

(async () => {
  const pub = await import("../public/js/donnees/listes.js"), DEP = require("./listes-depart.json");
  ok(JSON.stringify(DEP.DIAG) === JSON.stringify(pub.DIAG) && JSON.stringify(DEP.MUT0) === JSON.stringify(pub.MUT0), "listes de départ du serveur = celles du site (sinon : relancer la copie)");
  const prof = await import("../public/js/app/profil.js").catch(() => null);
  if (prof) ok(JSON.stringify(prof.DROITS_ROLE.medecin) === JSON.stringify(C.DROITS_MEDECIN), "droits du titulaire = DROITS_ROLE.medecin");
  else {
    const src = require("node:fs").readFileSync(__dirname + "/../public/js/app/profil.js", "utf8"), m = src.match(/medecin: (\{[^}]*\})/);
    ok(m && JSON.stringify(Function("return " + m[1])()) === JSON.stringify(C.DROITS_MEDECIN), "droits du titulaire = DROITS_ROLE.medecin (profil.js)");
  }

  const d = C.verifier({ cabinet: "  Cabinet  d'Oncologie Rabat ", prenom: "Salma", nom: "el idrissi", email: " Salma@Exemple.MA ", telephone: "06 00" });
  ok(d.cabinet === "Cabinet d'Oncologie Rabat" && d.nom === "EL IDRISSI" && d.email === "salma@exemple.ma", "demande nettoyée (espaces, majuscules, e-mail en minuscules)");
  ok(echoue(() => C.verifier({ cabinet: "X", nom: "A", email: "a@b.ma" })) && echoue(() => C.verifier({ cabinet: "Cab", nom: "", email: "a@b.ma" })) && echoue(() => C.verifier({ cabinet: "Cab", nom: "A", email: "pas-un-mail" })), "demande incomplète refusée");

  ok(C.idCabinet("Cabinet d'Oncologie Rabat", []) === "cab-cabinet-d-oncologie-rabat", "identifiant lisible sans accents ni espaces");
  ok(C.idCabinet("Clinique Atlas", ["cab-clinique-atlas", "cab-clinique-atlas-2"]) === "cab-clinique-atlas-3", "identifiant jamais déjà pris");
  ok(C.idCabinet("Été", []) === "cab-ete" && C.idCabinet("!!!", []) === "cab-cabinet", "accents retirés ; nom sans lettres");
  ok(C.idCabinet("cabinet-bentahila", ["cabinet-bentahila"]).startsWith("cab-"), "jamais l'identifiant du cabinet modèle");

  const L1 = C.listesDepart({ diag: ["A", "B"], mut: ["CNSS"], cor: ["Dr X", "Dr Y"], complet: true });
  ok(L1.cor.length === 0 && L1.complet === true, "correspondants jamais copiés");
  ok(JSON.stringify(L1.diag) === '["A","B"]' && JSON.stringify(L1.mut) === '["CNSS"]', "listes complètes du modèle copiées telles quelles");
  const L2 = C.listesDepart({ diag: ["Nouveau diag"], mut: [], cor: ["Dr Z"] });
  ok(L2.diag.length === DEP.DIAG.length + 1 && L2.mut.length === DEP.MUT0.length && L2.cor.length === 0 && L2.complet, "ancien format : listes de départ + ajouts, correspondants vides, marquées complètes");
  ok(C.listesDepart(null).diag.length === DEP.DIAG.length, "modèle sans listes : listes de départ");

  const cal = C.calendrierDepart({ feries: [{ d: "2026-11-06", nom: "Marche verte" }], abs: [{ du: "2026-12-01" }], horaires: { lun: 1 } });
  ok(cal.feries.length === 1 && cal.abs.length === 0 && !cal.horaires, "calendrier : jours fériés seulement");

  const T = C.tarifsDepart({ repli: "HGC", etablissements: { HGC: { activites: [{ type: "suivi" }] } }, actesRT: [{ nom: "Stéréotaxie", prix: 15000, x: 1 }], vmat: 12000 });
  ok(Object.keys(T.etablissements).length === 0 && T.repli === "" && T.vmat === 12000 && JSON.stringify(T.actesRT) === '[{"nom":"Stéréotaxie","prix":15000}]', "tarifs : actes RT et VMAT seulement, aucun établissement");
  ok(T.tauxRT.retro === 60 && T.tauxRT.impot === 10 && C.tarifsDepart({ tauxRT: { retro: 50, impot: 0 } }).tauxRT.retro === 50, "tarifs : taux commun de la radiothérapie (référence, sinon 60 % / 10 %)");

  const M = C.migrationsFaites("2026-10-09");
  ok(C.MIGRATIONS.every((k) => M[k] === "2026-10-09") && M.cabinetNeuf === "2026-10-09", "mises à niveau des anciens dossiers marquées faites");

  const mt = C.membreTitulaire(d, "2026-10-09", "ADM");
  ok(mt.role === "medecin" && mt.actif === true && mt.tousEtablissements === true && mt.nom === "Dr Salma EL IDRISSI" && mt.droits.finances === true && mt.droits.parametres === true, "titulaire : médecin, tous les établissements, tous les droits");
  mt.droits.finances = false; ok(C.DROITS_MEDECIN.finances === true, "droits copiés (pas partagés)");

  const MO = await import("../public/js/donnees/modules.js");
  ok(JSON.stringify(MO.MODULES.map((m) => m[0])) === JSON.stringify(C.MODULES) && JSON.stringify(MO.ROLES_MAX.map((m) => m[0])) === JSON.stringify(C.MAX), "modules : même liste sur le site et le serveur");
  ok(Object.keys(MO.FORMULES).every((f) => JSON.stringify(MO.FORMULES[f].modules) === JSON.stringify(C.FORMULES[f].modules) && JSON.stringify(MO.FORMULES[f].max) === JSON.stringify(C.FORMULES[f].max) && MO.FORMULES[f].lib === C.FORMULES[f].lib && MO.FORMULES[f].specialite === C.FORMULES[f].specialite) && Object.keys(MO.FORMULES).length === Object.keys(C.FORMULES).length, "formules : mêmes valeurs sur le site et le serveur");
  const a1 = C.abonnement({ formule: "essentiel" });
  ok(a1.formule === "essentiel" && !a1.surMesure && a1.modules.chimio && !a1.modules.rt && !a1.modules.salle && a1.max.assistante === 1 && a1.max.patients === 300, "formule Oncologie – Essentiel");
  ok(Object.values(C.FORMULES).every((f) => f.specialite && f.lib && f.modules.length), "chaque formule a sa spécialité");
  const a2 = C.abonnement({ formule: "essentiel", modules: { rt: true }, max: { assistante: 2, patients: "" } });
  ok(a2.surMesure && a2.modules.rt && a2.max.assistante === 2 && a2.max.patients === null, "retouches : sur mesure, vide = sans limite");
  ok(C.abonnement({ formule: "complet", modules: { taches: false, rcp: true } }).modules.rcp === false, "RCP sans Tâches : retirée");
  ok(C.abonnement({ formule: "inconnue", max: { medecin: -3 } }).formule === "complet" && C.abonnement({ max: { medecin: -3 } }).max.medecin === 0, "formule inconnue → Complet ; maximum négatif → 0");
  ok(C.abonnement({ modules: { chimio: "oui" } }).modules.chimio === false, "module : true seulement");
  ok(C.horsQuota(a1, "assistante", 2) && !C.horsQuota(a1, "assistante", 1) && !C.horsQuota(C.abonnement({ formule: "complet", max: { patients: null } }), "patients", 99999) && !C.horsQuota(null, "medecin", 9), "quota dépassé seulement au-delà du maximum");
  const FS = C.formulesValides({ base: { lib: "  Base  ", specialite: " Gynécologie ", modules: ["chimio", "rcp", "inconnu"], max: { medecin: "2", patients: "" } }, "MAUVAIS ID": { lib: "x" } });
  ok(FS && Object.keys(FS).join() === "base" && FS.base.lib === "Base" && JSON.stringify(FS.base.modules) === '["chimio"]' && FS.base.max.medecin === 2 && FS.base.max.patients === null && FS.base.specialite === "Gynécologie", "formules modifiées nettoyées (identifiant, modules connus, RCP sans Tâches, vide = sans limite)");
  ok(C.formulesValides({}) === null && C.formulesValides(null) === null, "formules vides : formules de départ");
  const a3 = C.abonnement({ formule: "base" }, FS);
  ok(a3.formule === "base" && a3.modules.chimio && !a3.modules.rt && a3.max.medecin === 2 && !a3.surMesure, "abonnement selon une formule modifiée");
  ok(C.abonnement({ formule: "disparue" }, FS).formule === "base", "formule disparue : première formule");
  const inf = C.infos({ nom: "  Clinique  Atlas ", ville: "Rabat", titulaireNom: "Dr A" });
  ok(inf.nom === "Clinique Atlas" && inf.ville === "Rabat" && echoue(() => C.infos({ nom: "" })), "nom et coordonnées d'un cabinet");
  const e0 = MO.abonnementEffectif(null);
  ok(Object.values(e0.modules).every(Boolean) && Object.values(e0.max).every((v) => v === null), "cabinet sans abonnement : tout, sans limite");
  const e2 = MO.abonnementEffectif({ formule: "x", modules: { chimio: true } });
  ok(e2.modules.chimio && !e2.modules.rt && !e2.modules.agenda, "avec un abonnement : un module absent (créé plus tard) n'apparaît pas");
  const e1 = MO.abonnementEffectif(a1);
  ok(!e1.modules.rt && e1.modules.chimio && e1.max.medecin === 1 && e1.max.etablissements === 1, "abonnement appliqué sur le site");
})();
// Membre créé par le titulaire (10/10/2026)
(() => {
  const C = require("./cabinets"), ok = (c, m) => { console.log((c ? "✅ " : "❌ ") + m); if (!c) process.exitCode = 1; }, echoue = (f) => { try { f(); return false; } catch (e) { return true; } };
  const d = C.membreDemande({ role: "assistante", email: " Sara@Ex.ma ", prenom: "Sara", nom: "el amrani", tousEtablissements: false, etablissements: ["HGC"], droits: { identite: true, traitements: "voir", radiotherapie: "pirate", finances: "oui", inconnu: true } }, "2026-10-10", "T");
  ok(d.email === "sara@ex.ma" && d.membre.nom === "Sara EL AMRANI" && d.membre.role === "assistante" && JSON.stringify(d.membre.etablissements) === '["HGC"]', "membre : e-mail, nom, rôle, établissements");
  ok(d.membre.droits.identite === true && d.membre.droits.traitements === "voir" && d.membre.droits.radiotherapie === "aucun" && d.membre.droits.finances === false && !("inconnu" in d.membre.droits), "droits nettoyés (valeurs inconnues refusées)");
  ok(C.membreDemande({ role: "medecin", email: "a@b.ma", nom: "X" }, "j", "T").membre.nom === "Dr X" && C.membreDemande({ role: "comptable", email: "a@b.ma", nom: "X" }, "j", "T").membre.tousEtablissements === true, "médecin « Dr », comptable : tout le cabinet");
  ok(echoue(() => C.membreDemande({ role: "admin", email: "a@b.ma", nom: "X" })) && echoue(() => C.membreDemande({ role: "assistante", email: "a@b.ma", nom: "X", etablissements: [] })) && echoue(() => C.membreDemande({ role: "assistante", email: "pas", nom: "X", tousEtablissements: true })), "rôle inconnu, sans établissement, e-mail invalide : refusés");
  // Lot C (25/10/2026) : médecin remplaçant = droits et établissements du titulaire, période ou sans limite, quota de la formule
  const tit = { role: "medecin", tousEtablissements: false, etablissements: ["HGC", "HCK"], droits: { finances: true, traitements: "modifier", radiotherapie: "voir" } };
  const r = C.membreDemande({ role: "remplacant", email: "r@b.ma", prenom: "Ali", nom: "x", droits: { finances: false, parametres: true }, etablissements: ["AUTRE"], remplaceDu: "2026-11-01", remplaceAu: "2026-11-15" }, "2026-10-25", "TIT", tit);
  ok(r.membre.role === "remplacant" && r.membre.nom === "Dr Ali X" && r.membre.remplace === "TIT" && r.membre.droits.finances === true && r.membre.droits.traitements === "modifier" && r.membre.droits.radiotherapie === "voir" && JSON.stringify(r.membre.etablissements) === '["HGC","HCK"]' && r.membre.tousEtablissements === false, "remplaçant : « Dr », droits et établissements recopiés du titulaire (ceux demandés ignorés)");
  ok(r.membre.remplaceDu === "2026-11-01" && r.membre.remplaceAu === "2026-11-15" && r.membre.remplaceDebMs === Date.parse("2026-10-31T23:00:00Z") && r.membre.remplaceFinMs === Date.parse("2026-11-15T23:59:59Z"), "remplaçant : période, bornes en ms (début du premier jour, fin du dernier)");
  const s = C.membreDemande({ role: "remplacant", email: "r@b.ma", nom: "y" }, "j", "TIT", Object.assign({}, tit, { tousEtablissements: true }));
  ok(s.membre.remplaceDu === "" && s.membre.remplaceDebMs === 0 && s.membre.remplaceFinMs === 0 && s.membre.tousEtablissements === true && s.membre.etablissements.length === 0, "remplaçant sans limite, tous les établissements comme le titulaire");
  ok(echoue(() => C.membreDemande({ role: "remplacant", email: "r@b.ma", nom: "y" }, "j", "TIT", null)) && echoue(() => C.membreDemande({ role: "remplacant", email: "r@b.ma", nom: "y", remplaceDu: "2026-11-10", remplaceAu: "2026-11-01" }, "j", "TIT", tit)), "remplaçant sans fiche du titulaire, ou fin avant le début : refusé");
  ok(C.alignerRemplacant(r.membre, tit) === null && C.alignerRemplacant({ role: "assistante" }, tit) === null, "remplaçant déjà aligné ; autre rôle : rien à faire");
  const al = C.alignerRemplacant(r.membre, Object.assign({}, tit, { droits: Object.assign({}, tit.droits, { finances: false }), etablissements: ["HGC"] }));
  ok(al && al.droits.finances === false && JSON.stringify(al.etablissements) === '["HGC"]', "droits du titulaire changés : remplaçant réaligné (droits, établissements)");
  ok(C.maxRole({ formule: "essentiel", max: { medecin: 1 } }, "remplacant") === 3 && C.maxRole({ formule: "essentiel", max: { remplacant: 1 } }, "remplacant") === 1 && C.maxRole(null, "remplacant") === null, "quota des remplaçants : 3 par formule (ancien abonnement sans la clé), réglable, sans abonnement : sans limite");
  if (C.horsQuota) ok(!C.horsQuota({ formule: "essentiel", max: { medecin: 1 } }, "remplacant", 3) && C.horsQuota({ formule: "essentiel", max: { medecin: 1 } }, "remplacant", 4), "quota : 3e remplaçant accepté, 4e refusé");
})();
// Bibliothèques par spécialité (10/10/2026)
(async () => {
  const C = require("./cabinets"), MO = await import("../public/js/donnees/modules.js"), ok = (c, m) => { console.log((c ? "✅ " : "❌ ") + m); if (!c) process.exitCode = 1; };
  ok(JSON.stringify(MO.BIBLIOTHEQUES_SPE) === JSON.stringify(C.BIBS), "bibliothèques par spécialité : même liste sur le site et le serveur");
  ok(C.bibDe("Radiothérapie") === "bib-oncologie" && C.bibDe("Médecine générale") === "bib-generaliste" && C.bibDe("inconnue") === "bib-oncologie", "spécialité → bibliothèque");
  ok(Object.values(MO.FORMULES).every((f) => C.BIBS.some((b) => b.specialites.indexOf(f.specialite) >= 0)), "chaque formule a sa bibliothèque");
  ok(C.estBib("bib-oncologie") && !C.estBib("cab-x") && C.DROITS_BIB.creerPatient === false && C.DROITS_BIB.identite === false, "bibliothèque : aucun droit sur les patients");
})();
// Paramètres de base d'une spécialité (10/10/2026)
(() => {
  const C = require("./cabinets"), ok = (c, m) => { console.log((c ? "✅ " : "❌ ") + m); if (!c) process.exitCode = 1; };
  const cal = C.parametreDepart("calendrier", { horaires: { lun: [["08:00", "12:00"]] }, horairesEtab: { HGC: {} }, abs: [{ du: "x" }], feries: [{ d: "2026-11-18" }] }, "2026-10-10");
  ok(cal.horaires.lun && cal.feries.length === 1 && !cal.abs.length && !Object.keys(cal.horairesEtab).length, "calendrier : horaires et fériés, sans absences ni horaires par établissement");
  const ta = C.parametreDepart("tachesAuto", { regles: [{ id: "a1", ev: "nonvenu", pour: "UID_SECRETAIRE", depuis: "2026-01-01" }, { id: "cont", pour: "titulaire" }] }, "2026-10-10");
  ok(ta.regles.every((r) => r.pour === "titulaire" && r.depuis === "2026-10-10"), "tâches automatiques : confiées au titulaire, à partir de la création");
  const r = C.parametreDepart("rcp", { jours: [2], heure: "14:00", lieu: "Salle du Dr B", plus: ["2026-10-20"], annulees: ["x"] });
  ok(r.jours[0] === 2 && r.heure === "14:00" && r.lieu === "" && !r.plus.length && !r.annulees.length, "RCP : jours et heure, sans lieu ni dates exceptionnelles");
  ok(C.parametreDepart("listes", { diag: ["A"], mut: ["B"], cor: ["Dr X"], complet: true }).cor.length === 0, "listes : jamais les correspondants");
  ok(C.parametreDepart("tarifsConsultations", { a: 1 }) === null && C.parametreDepart("medecinTitulaire", { a: 1 }) === null, "jamais les prix des consultations ni le titulaire");
  const w = { annonce: "Bonjour {prenom}" }; ok(C.parametreDepart("whatsapp", w).annonce === "Bonjour {prenom}" && C.parametreDepart("whatsapp", w) !== w, "messages WhatsApp copiés");
})();
// Retouches d'un cabinet (10/10/2026)
(() => {
  const C = require("./cabinets"), ok = (c, m) => { console.log((c ? "✅ " : "❌ ") + m); if (!c) process.exitCode = 1; };
  const r = C.reglageNettoye({ menu: ["bilan", "accueil", "<script>", 3], cartes: { stats: false, x: "non" }, fonctions: { "taches.auto": false }, pirate: { a: 1 } });
  ok(JSON.stringify(r.menu) === '["bilan","accueil"]' && r.cartes.stats === false && !("x" in r.cartes) && r.fonctions["taches.auto"] === false && !("pirate" in r), "retouches nettoyées (clés courtes, oui / non)");
  ok(C.reglageNettoye(null) === null && C.reglageNettoye("x") === null, "sans retouche : rien");
})();
// Packs avec réglage complet (10/10/2026)
(() => {
  const C = require("./cabinets"), ok = (c, m) => { console.log((c ? "✅ " : "❌ ") + m); if (!c) process.exitCode = 1; };
  const FS = C.formulesValides({ "pack-a": { lib: "Pack A", specialite: "Oncologie – Radiothérapie", modules: ["chimio", "agenda"], max: {}, reglage: { menu: ["bilan"], cartes: { stats: false }, x: 1 } } });
  ok(FS["pack-a"].reglage && FS["pack-a"].reglage.cartes.stats === false && !("x" in FS["pack-a"].reglage), "pack : réglage gardé et nettoyé");
  const a = C.abonnement({ formule: "pack-a" }, FS);
  ok(a.reglage && a.reglage.menu[0] === "bilan" && !a.surMesure && a.retouche === false, "cabinet neuf : reçoit le réglage du pack, sans retouche");
  const b = C.abonnement({ formule: "pack-a", modules: { chimio: true, agenda: true }, max: {}, reglage: { menu: ["accueil"] }, identiqueAuPack: false }, FS);
  ok(b.retouche && b.surMesure && b.reglage.menu[0] === "accueil", "retouches du cabinet : sur mesure");
  const c = C.abonnement({ formule: "pack-a", modules: { chimio: true, agenda: true }, max: {}, reglage: { menu: ["bilan"] }, identiqueAuPack: true }, FS);
  ok(!c.surMesure && c.retouche === false, "réglage identique au pack : pas sur mesure");
})();
// Fiche patient réglable (10/10/2026)
(() => {
  const C = require("./cabinets"), ok = (c, m) => { console.log((c ? "✅ " : "❌ ") + m); if (!c) process.exitCode = 1; };
  const r = C.reglageNettoye({ fiche: { ordre: ["xgs01", "nom", "<b>"], champs: { ald: false, x: "non" }, ajouts: [{ id: "xgs01", lib: "  Groupe   sanguin ", type: "choix", choix: ["A+", "", "O+"], partie: "clinique", imprimer: true, entete: "oui" }, { id: "pirate", lib: "X" }, { id: "xvide", lib: "  " }, { id: "xbiz1", lib: "Biz", type: "html" }] } });
  const a = r.fiche.ajouts;
  ok(JSON.stringify(r.fiche.ordre) === '["xgs01","nom"]' && r.fiche.champs.ald === false && !("x" in r.fiche.champs), "fiche : ordre et présence nettoyés");
  ok(a.length === 2 && a[0].lib === "Groupe sanguin" && a[0].type === "choix" && JSON.stringify(a[0].choix) === '["A+","O+"]' && a[0].partie === "clinique" && a[0].imprimer === true && a[0].entete === false && a[1].type === "texte", "champs ajoutés : libellé, type, choix, partie ; type inconnu → texte ; identifiant ou libellé invalide refusé");
})();
// Fiche de la spécialité (10/10/2026)
(() => {
  const C = require("./cabinets"), ok = (c, m) => { console.log((c ? "✅ " : "❌ ") + m); if (!c) process.exitCode = 1; };
  const f = C.ficheNettoyee({ libs: { atcdFam: "  Antécédents   familiaux et héréditaires ", x: "" }, champs: { ald: false }, ajouts: [{ id: "xst001", lib: "Statut", type: "choix", choix: ["Nouveau cas", "Ancien cas"] }] });
  ok(f.libs.atcdFam === "Antécédents familiaux et héréditaires" && !("x" in f.libs) && f.champs.ald === false && f.ajouts[0].choix.length === 2, "fiche de la spécialité : noms affichés, présence, champs ajoutés");
  ok(C.idSpecialite("Oncologie – Radiothérapie") === "oncologie-radiotherapie" && C.idSpecialite("Médecine générale") === "medecine-generale", "identifiant de spécialité");
  ok(C.reglageNettoye({ fiche: { libs: { nom: "Nom de famille" } } }).fiche.libs.nom === "Nom de famille", "retouches du cabinet : nom affiché d'un champ");
})();
(() => {
  const C = require("./cabinets"), ok = (c, m) => { console.log((c ? "✅ " : "❌ ") + m); if (!c) process.exitCode = 1; };
  const FS = C.formulesValides({ p1: { lib: "P", specialite: "Oncologie – Radiothérapie", modules: ["chimio"], max: {}, reglage: { menu: ["patients"], fiche: { champs: { ald: false } } } } });
  ok(FS.p1.reglage && !FS.p1.reglage.fiche, "un pack n'a pas de fiche patient (celle de la spécialité)");
})();
// Formulaire de consultation (16.7)
(() => {
  const C = require("./cabinets"), ok = (c, m) => { console.log((c ? "✅ " : "❌ ") + m); if (!c) process.exitCode = 1; };
  const f = C.ficheNettoyee({ choixs: { type: ["Première consultation", " Suivi ", ""] }, ajouts: [{ id: "xsec01", lib: "Mesures", type: "section" }, { id: "xpds01", lib: "Poids", type: "nombre", unite: "kg" }, { id: "xobs01", lib: "Observance", type: "textelong" }] });
  ok(f.choixs.type.length === 2 && f.choixs.type[1] === "Suivi" && f.ajouts[0].type === "section" && f.ajouts[1].unite === "kg" && f.ajouts[2].type === "textelong", "consultation : listes de choix des champs existants, section, unité, texte long");
  const r = C.reglageNettoye({ consultation: { champs: { titre: false } } });
  ok(r.consultation.champs.titre === false, "retouches du cabinet : formulaire de consultation");
  const FS = C.formulesValides({ p1: { lib: "P", specialite: "x", modules: [], max: {}, reglage: { menu: ["patients"], consultation: { champs: { note: false } } } } });
  ok(!FS.p1.reglage.consultation, "un pack n'a pas de formulaire de consultation (celui de la spécialité)");
})();
// Abonnements (17.4)
(() => {
  const F = require("./facturation"), C = require("./cabinets"), ok = (c, m) => { console.log((c ? "✅ " : "❌ ") + m); if (!c) process.exitCode = 1; };
  const fs = require("fs"), site = fs.readFileSync(__dirname + "/../public/js/donnees/facturation.js", "utf8").replace(/^export \{[^}]*\};?\s*$/m, ""), serveur = fs.readFileSync(__dirname + "/facturation.js", "utf8").replace('"use strict";\n', "").replace(/^module\.exports = \{[^}]*\};?\s*$/m, "");
  ok(site.trim() === serveur.trim(), "facturation : même code sur le site et le serveur");
  ok(F.prolonger({ echeance: "2026-01-31" }, "2026-02-02", "mois") === "2026-02-28" && F.prolonger({ echeance: "2026-03-15" }, "2026-03-20", "an") === "2027-03-15" && F.prolonger({ echeance: "2024-01-01" }, "2026-10-10", "mois") === "2026-11-10", "paiement : échéance prolongée d'un mois / d'un an (reprise après une longue interruption : depuis le paiement)");
  const E = (f) => F.etatFacturation(f, "2026-10-10").etat;
  ok(E(null) === "nonSuivi" && E({ mode: "gratuit" }) === "gratuit" && E({ mode: "essai", essaiFin: "2026-10-20" }) === "essai" && E({ mode: "essai", essaiFin: "2026-10-01" }) === "retard" && E({ mode: "mensuel", echeance: "2026-11-30" }) === "ajour" && E({ mode: "mensuel", echeance: "2026-10-20" }) === "renouveler" && E({ mode: "annuel", echeance: "2026-09-15" }) === "retard" && E({ mode: "mensuel", echeance: "2026-09-09" }) === "suspendre" && E({ mode: "mensuel", echeance: "2026-09-10" }) === "retard", "états : non suivi, gratuit, essai, à jour, à renouveler (15 j), retard, à suspendre (> 30 j)");
  const P = F.prixCabinet({ mode: "annuel" }, C.FORMULES.complet, "complet"), Q = F.prixCabinet({ mode: "mensuel", prix: 900 }, C.FORMULES["onco-pro"], "onco-pro");
  ok(P.prix === 29900 && P.mensuel === 2492 && Q.prix === 900 && F.prixCabinet({ mode: "gratuit" }, C.FORMULES.complet, "complet").mensuel === 0, "prix : annuel du pack (équivalent mensuel), prix remisé, gratuit");
  ok(C.formulesValides({ x1: { lib: "X", modules: [], max: {}, prix: { mois: "500", an: 5000 } } }).x1.prix.mois === 500 && C.formulesValides({ essentiel: { lib: "E", modules: [], max: {} } }).essentiel.prix.mois === 690, "prix d'un pack gardés ; pack enregistré sans prix : prix proposé");
  let er = ""; try { F.paiementNettoye({ d: "2026-10-10", m: 0 }); } catch (e) { er = e.message; } ok(/Montant/.test(er), "paiement sans montant refusé");
})();
// Comptabilité (18.2)
(() => {
  const F = require("./facturation"), ok = (c, m) => { console.log((c ? "✅ " : "❌ ") + m); if (!c) process.exitCode = 1; };
  ok(JSON.stringify(F.attendus({ mode: "mensuel", echeance: "2026-10-20" }, { prix: 900 }, "2026-10-10", 60).map((x) => x.d)) === '["2026-10-20","2026-11-20"]' && F.attendus({ mode: "annuel", echeance: "2027-01-01" }, { prix: 29900 }, "2026-10-10", 90)[0].m === 29900 && F.attendus({ mode: "gratuit" }, {}, "2026-10-10", 90).length === 0, "à encaisser : échéances des n prochains jours (mensuel, annuel ; gratuit : rien)");
  ok(F.attendus({ mode: "essai", essaiFin: "2026-10-25" }, { catalogue: 1190 }, "2026-10-10", 30)[0].essai === true && F.attendus({ mode: "mensuel", echeance: "2026-09-01" }, { prix: 900 }, "2026-10-10", 30).length === 0, "fin d'essai attendue ; un retard n'est pas « à encaisser »");
  ok(F.impaye({ mode: "mensuel", echeance: "2026-09-01" }, { prix: 900 }, "2026-10-10") === 1800 && F.impaye({ mode: "mensuel", echeance: "2026-10-05" }, { prix: 900 }, "2026-10-10") === 900 && F.impaye({ mode: "mensuel", echeance: "2026-11-05" }, { prix: 900 }, "2026-10-10") === 0, "impayés : périodes échues × prix");
  const c = F.clientNettoye({ raison: "  SARL  Cabinet  Agdal ", ice: "001 234 567 000 089", email: "Compta@X.MA" });
  ok(c.raison === "SARL Cabinet Agdal" && c.ice === "001234567000089" && c.email === "compta@x.ma", "coordonnées de facturation nettoyées");
})();
// Réglages des abonnements (18.3)
(() => {
  const F = require("./facturation"), ok = (c, m) => { console.log((c ? "✅ " : "❌ ") + m); if (!c) process.exitCode = 1; };
  ok(F.reglagesAbo(null).suspension === "demander" && F.reglagesAbo({ suspension: "x", delai: "0" }).delai === 1 && F.reglagesAbo({ suspension: "auto", delai: 45, rappel: "", essai: 14 }).essai === 14, "réglages : « me demander » par défaut, valeurs bornées");
  const f = { mode: "mensuel", echeance: "2026-09-01" };
  ok(F.etatFacturation(f, "2026-10-10").etat === "suspendre" && F.etatFacturation(f, "2026-10-10", { delai: 45, rappel: 15 }).etat === "retard" && F.etatFacturation({ mode: "mensuel", echeance: "2026-10-30" }, "2026-10-10", { delai: 30, rappel: 30 }).etat === "renouveler", "délai de suspension et rappel réglables");
  ok(F.reglageFacturation({ mode: "mensuel", jamaisSuspendre: true }).jamaisSuspendre === true, "un cabinet peut être exclu des suspensions");
})();
// Factures (18.4)
(() => {
  const F = require("./facturation"), ok = (c, m) => { console.log((c ? "✅ " : "❌ ") + m); if (!c) process.exitCode = 1; };
  const a = F.montants(1190), b = F.montants(29900), z = F.montants(0.01);
  ok(a.ht === 991.67 && a.tva === 198.33 && a.ht + a.tva === 1190 && b.ht === 24916.67 && b.tva === 4983.33 && z.ttc === 0.01, "montants : HT et TVA 20 % tirés du TTC, au centime, HT + TVA = TTC");
  ok(F.numeroFacture("facture", 2026, 1) === "F-2026-0001" && F.numeroFacture("avoir", 2027, 12) === "AV-2027-0012", "numéros F-AAAA-NNNN et AV-AAAA-NNNN");
  const e = F.editeurNettoye({ raison: " Onco360 SARL ", ice: "001 234 567 000 089", if: "1234", adresse: "1 rue", ville: "Casablanca" });
  ok(e.ice === "001234567000089" && e.tva === 20 && F.editeurIncomplet(e).length === 0 && F.editeurIncomplet({ raison: "x" }).indexOf("ice") >= 0, "Mon entreprise : nettoyé, mentions obligatoires vérifiées");
})();
// Relances (18.6)
(() => {
  const F = require("./facturation"), ok = (c, m) => { console.log((c ? "✅ " : "❌ ") + m); if (!c) process.exitCode = 1; };
  const R = F.reglagesAbo({ modeles: { retard: "Bonjour {medecin}", essai: "" } });
  ok(R.modeles.retard === "Bonjour {medecin}" && R.modeles.essai === F.MODELES_RELANCE0.essai && R.modeles.renouveler === F.MODELES_RELANCE0.renouveler, "modèles de relance : modifiés, vide = message de départ");
  ok(F.remplirRelance("{medecin} · {montant} · {echeance} · {x}", { medecin: "Dr A", montant: "1 190 DH", echeance: "02/09/2026" }) === "Dr A · 1 190 DH · 02/09/2026 · {x}", "message de relance rempli");
  ok(["retard", "renouveler", "essai"].every((k) => /\{montant\}/.test(F.MODELES_RELANCE0[k]) && /\{echeance\}/.test(F.MODELES_RELANCE0[k])), "chaque message de départ cite le montant et l'échéance");
})();
// Plusieurs cabinets pour un compte (19.2, 10/10/2026)
(() => {
  const C = require("./cabinets"), ok = (c, m) => { console.log((c ? "✅ " : "❌ ") + m); if (!c) process.exitCode = 1; }, J = JSON.stringify;
  ok(J(C.espacesCompte({ espace: "cab-a" })) === '["cab-a"]' && J(C.espacesCompte(null, true)) === '["cabinet-bentahila"]' && J(C.espacesCompte(null, false)) === "[]", "cabinets d'un compte : ancienne fiche, membre du cabinet modèle sans fiche, aucun");
  ok(J(C.compteModifie({ espace: "cab-a" }, false, "cab-b", true)) === '{"espace":"cab-a","espaces":["cab-a","cab-b"]}', "cabinet ajouté : le principal reste le premier");
  ok(J(C.compteModifie(null, true, "cab-b", true)) === '{"espace":"cabinet-bentahila","espaces":["cabinet-bentahila","cab-b"]}', "secrétaire du cabinet modèle (sans fiche) ajoutée à un autre cabinet : les deux");
  ok(J(C.compteModifie({ espace: "cab-a", espaces: ["cab-a", "cab-b"] }, false, "cab-a", true)) === '{"espace":"cab-a","espaces":["cab-a","cab-b"]}', "fiche réécrite dans un cabinet déjà connu : rien ne change");
  ok(J(C.compteModifie({ espace: "cab-a", espaces: ["cab-a", "cab-b"] }, false, "cab-a", false)) === '{"espace":"cab-b","espaces":["cab-b"]}', "retirée du cabinet principal : le suivant devient principal");
  ok(C.compteModifie({ espace: "cab-a" }, false, "cab-a", false) === null, "retirée de son seul cabinet : fiche effacée");
})();
// Listes corrigées dans tout le cabinet (19.3, 10/10/2026)
(() => {
  const C = require("./cabinets"), ok = (c, m) => { console.log((c ? "✅ " : "❌ ") + m); if (!c) process.exitCode = 1; };
  const R = C.renomsValides([{ k: "cor", de: " Dr Bensaad ", vers: "Dr Bensaad Ahmed" }, { k: "x", de: "a", vers: "b" }, { k: "mut", de: "CNSS", vers: "CNSS" }, { k: "diag", de: "K sein", vers: "Cancer du sein" }]);
  ok(R.length === 2 && R[0].de === "Dr Bensaad", "renoms nettoyés (champ inconnu et nom inchangé écartés)");
  const d = { identite: { cor: "dr bensaad", mut: "CNSS" }, clinique: { diag: "K sein", poids: "70" }, resume: JSON.stringify({ nm: "X", diag: "K sein" }) };
  const ch = C.corrigerDossier(d, R);
  ok(ch && ch.identite.cor === "Dr Bensaad Ahmed" && ch.identite.mut === "CNSS" && ch.clinique.diag === "Cancer du sein" && ch.clinique.poids === "70" && JSON.parse(ch.resume).diag === "Cancer du sein", "dossier corrigé (sans casse), autres champs gardés, résumé à jour");
  ok(C.corrigerDossier({ identite: { cor: "Autre" } }, R) === null, "dossier non concerné : rien");
})();
