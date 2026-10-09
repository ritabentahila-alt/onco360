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
