// node functions/test-modele.js — modèle de la spécialité (R-A6, 18/10/2026) : reprise des réglages d'un cabinet, application à un autre
// cabinet sans rien écraser. Données fictives. Vérifie aussi que functions/site/ est la copie exacte du calcul du site.
const fs = require("fs"), M = require("./modele");
let ok = 0, ko = 0;
const cas = (nom, v, d) => { if (v) { ok++; console.log("  ✔ " + nom); } else { ko++; process.exitCode = 1; console.log("  ✘ " + nom + (d === undefined ? "" : "  " + JSON.stringify(d).slice(0, 400))); } };
// Ce que l'écran montre (sans le drapeau interne « cabinet », clés triées, listes vides = absentes)
const vue = (v) => JSON.stringify(v, function (k, x) { if (k === "cabinet" || (Array.isArray(x) && !x.length) || ((k === "entete" || k === "imprimer") && x === false)) return undefined; return x && typeof x === "object" && !Array.isArray(x) ? Object.keys(x).sort().reduce((o, c) => ((o[c] = x[c]), o), {}) : x; });
const sansCab = (v) => JSON.parse(JSON.stringify(v, (k, x) => (k === "cabinet" ? undefined : x)));

(async () => {
  console.log("Copie du calcul du site");
  ["catalogue.js", "modules.js", "facturation.js"].forEach((f) => cas("functions/site/" + f + " = public/js/donnees/" + f + " (sinon : cp public/js/donnees/" + f + " functions/site/)",
    fs.readFileSync(__dirname + "/site/" + f, "utf8") === fs.readFileSync(__dirname + "/../public/js/donnees/" + f, "utf8")));
  const cat = await import("./site/catalogue.js"), C = require("./cabinets");

  console.log("Ajouter ce qui manque, sans rien écraser");
  let notes = [];
  const r = M.fusionManquant({ a: 1, l: ["x", "y"], o: [{ id: "1", nom: "Un", v: 1 }], s: { p: true } }, { a: 2, b: 3, l: ["y", "z"], o: [{ id: "1", nom: "Un", v: 9 }, { id: "2", nom: "Deux" }, { id: "3", nom: "un " }], s: { p: false, q: true } }, (c, v) => notes.push(c));
  cas("valeur du cabinet gardée (a = 1), clé absente ajoutée (b = 3)", r.a === 1 && r.b === 3);
  cas("liste de noms : « z » ajouté à la fin, rien retiré", JSON.stringify(r.l) === '["x","y","z"]');
  cas("liste d'éléments : le n° 1 du cabinet gardé tel quel, le n° 2 ajouté, « un » (même nom) pas en double", r.o.length === 2 && r.o[0].v === 1 && r.o[1].id === "2");
  cas("objet imbriqué : p du cabinet gardé, q ajouté", r.s.p === true && r.s.q === true);
  cas("chaque ajout noté (b, l, o, s.q)", notes.sort().join(",") === "b,l,o,s.q", notes);
  cas("rien chez le cabinet : tout le modèle", JSON.stringify(M.fusionManquant(undefined, { x: [1] })) === '{"x":[1]}');
  cas("modèle prioritaire (copie de la fiche) : valeurs du modèle, ce que l'ancienne copie avait en plus gardé", JSON.stringify(M.modelePrioritaire({ champs: { a: false }, ajouts: [{ id: "xnouv", lib: "N" }] }, { champs: { a: true, b: true }, ajouts: [{ id: "xvieux", lib: "V" }] })) === JSON.stringify({ champs: { a: false, b: true }, ajouts: [{ id: "xnouv", lib: "N" }, { id: "xvieux", lib: "V" }] }));
  const d = M.difference({ l: [{ id: "1", nom: "A" }, { id: "2", nom: "B" }], o: ["a", "b"] }, { l: [{ id: "1", nom: "A2" }, { id: "3", nom: "C" }], o: ["b", "a"] });
  cas("différences : C ajouté, B retiré, A2 changé, ordre changé", d.plus.join() === "C" && d.moins.join() === "B" && d.change.join() === "A2,o (ordre)" && M.total(d) === 4, d);
  cas("résumé lisible", M.resume(d) === "1 ajouté (C), 1 retiré (B), 2 changés (A2, o (ordre))", M.resume(d));
  cas("types de consultation : ceux du cabinet + ceux du modèle qui manquent", JSON.stringify(M.typesPourCabinet([{ k: "suivi", nom: "Suivi" }], [{ k: "suivi", nom: "Autre" }, { k: "rcp", nom: "RCP" }]).map((t) => t.k + ":" + t.nom)) === '["suivi:Suivi","rcp:RCP"]');
  cas("types de consultation : cabinet sans liste = modèle + activités de ses tarifs", M.typesPourCabinet(null, [{ k: "rcp", nom: "RCP" }], [["echo", "Échographie"]]).map((t) => t.k).join() === "rcp,echo");
  cas("réglage d'un cabinet neuf : le pack d'abord, complété par le modèle", JSON.stringify(M.reglageNeuf({ menu: ["agenda"], cartes: { stats: false } }, { menu: ["agenda", "rcp"], cartes: { stats: true, jour: true } })) === JSON.stringify({ menu: ["agenda", "rcp"], cartes: { stats: false, jour: true } }));

  console.log("Reprise des réglages effectifs d'un cabinet (fiche et formulaires de consultation)");
  // Cabinet modèle fictif : fiche de la spécialité (champ ajouté xscore, nom affiché), retouches de l'administration (champ caché), retouches du
  // cabinet lui-même (champ propre xg8, nom changé, en-tête) ; formulaire de consultation avec un formulaire nommé et le type « RCP » relié
  const ficheSpe = { libs: { cor: "Médecin correspondant" }, ajouts: [{ id: "xscore", lib: "Score", type: "nombre", partie: "clinique", imprimer: true }] };
  const consultSpe = { formulaires: [{ id: "frcp", nom: "RCP", champs: ["type", "d", "titre", "note"] }], typesForm: { RCP: "frcp" } };
  const espaceDoc = { ficheSpe, consultSpe, abonnement: { modules: { chimio: true, rt: true }, reglage: { menu: ["salle", "agenda"], cartes: { stats: false }, fonctions: { "agenda.whatsapp": false }, fiche: { champs: { tel2: false } } } } };
  const formCab = { fiche: { libs: { mut: "Organisme" }, ajouts: [{ id: "xgeuit", lib: "Score G8", type: "nombre", partie: "clinique" }], entetes: { cin: false } }, consultation: { libs: { titre: "Objet" } } };
  const E = M.effectifs(cat, espaceDoc, formCab, { ordre: ["jour", "afaire"], cartes: { rappels: false } });
  const mf = C.ficheNettoyee(M.modeleForm(cat, cat.FICHE, E.fiche, E.onco)), mc = C.ficheNettoyee(M.modeleForm(cat, cat.CONSULT, E.consultation, E.onco));
  cas("le modèle porte les champs ajoutés (spécialité et cabinet), les noms et les champs cachés", (mf.ajouts || []).map((a) => a.id).sort().join() === "xgeuit,xscore" && mf.libs.mut === "Organisme" && mf.libs.cor === "Médecin correspondant" && mf.champs.tel2 === false, mf);
  // Un cabinet neuf (même pack, sans retouche) qui reçoit ce modèle voit exactement la même fiche et les mêmes formulaires
  const E2 = M.effectifs(cat, { ficheSpe: mf, consultSpe: mc, abonnement: { modules: { chimio: true, rt: true }, reglage: {} } }, null, null);
  cas("fiche patient du cabinet qui reçoit le modèle = celle du cabinet modèle (ordre, champs, noms, types, en-têtes, champs ajoutés)", vue(E2.fiche) === vue(E.fiche));
  const formsVus = (R) => { const F = cat.formulairesDe(R), types = [...new Set(((R.choixs || {}).type || []).concat(cat.CONSULT_TYPES0))]; return vue({ R: Object.assign({}, R, { formulaires: undefined, typesForm: undefined }), F, types: types.map((t) => [t, cat.formDuType(R, t, F)]) }); };
  cas("formulaire de consultation identique à l'écran (champs, noms, formulaires nommés, formulaire de chaque type dont « RCP »)", formsVus(E2.consultation) === formsVus(E.consultation) && cat.formDuType(E2.consultation, "RCP") === "frcp");
  cas("réglage repris : menu, cartes (tableau de bord du cabinet compris), fonctions", E.reglage.menu[0] === "salle" && E.reglage.cartes.stats === false && E.reglage.cartes.rappels === false && E.reglage.accueil.indexOf("jour") < E.reglage.accueil.indexOf("afaire") && E.reglage.accueil.length === 8 && E.reglage.fonctions["agenda.whatsapp"] === false);
  // Cabinet existant qui avait l'ancienne copie de la spécialité et ses retouches : ses retouches restent par-dessus
  const E3 = M.effectifs(cat, { ficheSpe: M.modelePrioritaire(mf, ficheSpe), consultSpe: mc, abonnement: { modules: { chimio: true }, reglage: {} } }, { fiche: { libs: { mut: "Assurance" } } }, null);
  cas("cabinet existant : ses propres retouches gardées (nom « Assurance »), champs du modèle reçus", E3.fiche.libs.mut === "Assurance" && E3.fiche.ajouts.some((a) => a.id === "xgeuit"));
  console.log("Enregistrer la fiche et le formulaire dans Par spécialité (20/10/2026) : rien de perdu");
  // le modèle repris (mf, mc) ouvert dans l'éditeur de la spécialité puis enregistré sans rien toucher : même fiche, mêmes formulaires
  const spF = Object.assign({}, mf, { types: { ald: "textelong" }, sections: { cin: "med" }, unites: { taille: "m" }, imprimes: { cin: true }, courts: { mut: "Org." } });
  const FIf = cat.ficheEffective(null, cat.avecOnco(spF, "Oncologie – Radiothérapie")), FIc = cat.consultEffective(null, cat.avecOnco(mc, "Oncologie – Radiothérapie"));
  const reF = C.ficheNettoyee(cat.formSpecialite(cat.FICHE, FIf, FIf.onco)), reC = C.ficheNettoyee(cat.formSpecialite(cat.CONSULT, FIc, FIc.onco));
  const FIf2 = cat.ficheEffective(null, cat.avecOnco(reF, "Oncologie – Radiothérapie")), FIc2 = cat.consultEffective(null, cat.avecOnco(reC, "Oncologie – Radiothérapie"));
  cas("fiche patient : ordre, présence, noms, en-têtes, types, parties, unités, impression, libellés courts gardés", vue(FIf2) === vue(FIf) && FIf2.types.ald === "textelong" && FIf2.unites.taille === "m" && FIf2.sections.cin === "med" && FIf2.courts.mut === "Org.", reF);
  cas("formulaire de consultation : formulaires nommés et formulaire de chaque type gardés (« RCP »)", formsVus(FIc2) === formsVus(FIc) && cat.formDuType(FIc2, "RCP") === "frcp", reC);
  cas("même calcul que la reprise du modèle", JSON.stringify(reF.ajouts) === JSON.stringify(C.ficheNettoyee(M.modeleForm(cat, cat.FICHE, FIf, true)).ajouts));
  console.log("Écart d'un cabinet au modèle (lecture seule)");
  const ec = M.ecart(cat, "fiche", { libs: { mut: "Organisme" }, champs: { tel2: false }, ajouts: [{ id: "xscore", lib: "Score" }] }, { libs: { mut: "Assurance" }, ajouts: [{ id: "xscore", lib: "Score" }, { id: "xpropre", lib: "Champ propre au cabinet" }] });
  cas("fiche : champ ajouté par le cabinet (son nom), présence remise, nom affiché changé, en clair", ec.plus.indexOf("Champ propre au cabinet") >= 0 && ec.moins.some((x) => /\(présence\)$/.test(x)) && ec.change.some((x) => /\(nom affiché\)$/.test(x)) && ec.n === 3, ec);
  const eb = M.ecart(cat, "bibliotheques", { medicaments: [{ id: "m1", nom: "A" }] }, { medicaments: [{ id: "m1", nom: "A", poso: "x" }, { id: "m2", nom: "B" }] });
  cas("bibliothèques : médicament ajouté (B), médicament modifié (A)", eb.plus.join() === "B" && eb.change.join() === "A" && eb.n === 2, eb);
  cas("aucun écart : n = 0, « aucune différence »", M.ecart(cat, "reglage", { menu: ["a"] }, { menu: ["a"] }).n === 0 && M.ecart(cat, "reglage", { menu: ["a"] }, { menu: ["a"] }).resume === "aucune différence");
  console.log("\n" + ok + " réussis, " + ko + " échoués");
})().catch((e) => { console.log("  ✘ erreur : " + e.stack); process.exitCode = 1; });
