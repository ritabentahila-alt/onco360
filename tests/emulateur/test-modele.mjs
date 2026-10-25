// R-A6 (18/10/2026) : modèle de la spécialité de bout en bout sur les émulateurs Firebase (aucune donnée réelle) :
//   cd tests/regles && npm run modele     (lance les émulateurs auth, firestore, storage, functions, puis ce script)
// Reprendre les réglages du cabinet modèle, les appliquer à un autre cabinet sans rien écraser, cabinet neuf qui reçoit le modèle.
import { createRequire } from "node:module";
const reqF = createRequire(new URL("../../functions/package.json", import.meta.url));
const reqR = createRequire(new URL("../regles/package.json", import.meta.url));
const admin = reqF("firebase-admin");
const { initializeApp } = reqR("firebase/app"), { getAuth, connectAuthEmulator, signInWithEmailAndPassword } = reqR("firebase/auth");
const { getFunctions, connectFunctionsEmulator, httpsCallable } = reqR("firebase/functions");

const PROJ = "demo-onco360", BUCKET = PROJ + ".appspot.com", MOD = "espaces/cabinet-bentahila", BIB = "espaces/bib-oncologie", X = "espaces/cab-x";
admin.initializeApp({ projectId: PROJ, storageBucket: BUCKET });
const db = admin.firestore(), bucket = admin.storage().bucket();
let ok = 0, ko = 0; const cas = (n, v, d) => { if (v) { ok++; console.log("  ✔ " + n); } else { ko++; console.log("  ✘ " + n + (d === undefined ? "" : " " + JSON.stringify(d).slice(0, 400))); } };
const J = (v) => ({ data: JSON.stringify(v) }), lire = async (p) => { const s = await db.doc(p).get(); return s.exists ? JSON.parse(s.data().data || "null") : null; };

// Comptes : ADM (administration), MED (médecin, pas administrateur)
for (const [uid, email] of [["ADM", "adm@test.ma"], ["MED", "med@test.ma"]]) await admin.auth().createUser({ uid, email, password: "motdepasse-test" }).catch(() => {});
await db.doc("administrateurs/ADM").set({ email: "adm@test.ma" });
// Cabinet modèle fictif : fiche de la spécialité + retouches de l'administration + retouches du cabinet, consultation, types, paramètres, bibliothèques
await db.doc(MOD).set({ nom: "Cabinet modèle (test)", titulaire: "MED", actif: true,
  ficheSpe: { ajouts: [{ id: "xscore", lib: "Score", type: "nombre", partie: "clinique" }] }, consultSpe: { formulaires: [{ id: "frcp", nom: "RCP", champs: [] }], typesForm: { RCP: "frcp" } },
  abonnement: { formule: "complet", modules: { chimio: true, rt: true, agenda: true, salle: true, taches: true, rcp: true }, reglage: { menu: ["salle", "agenda"], cartes: { stats: false }, fonctions: { "agenda.whatsapp": false }, fiche: { champs: { tel2: false } } } } });
await db.doc(MOD + "/membres/MED").set({ role: "medecin", actif: true, nom: "Dr Modèle", tousEtablissements: true, etablissements: [], droits: {} });
await db.doc(MOD + "/parametres/formulaires").set(J({ fiche: { libs: { mut: "Organisme" }, ajouts: [{ id: "xgeuit", lib: "Score G8", type: "nombre", partie: "clinique" }] } }));
await db.doc(MOD + "/parametres/accueil").set(J({ ordre: ["jour", "afaire"], cartes: { rappels: false, afaire: true } }));
await db.doc(MOD + "/parametres/listes").set(J({ diag: ["Cancer test A"], mut: ["MUTUELLE TEST"], cor: ["Dr Correspondant Privé"] }));
await db.doc(MOD + "/parametres/whatsapp").set(J({ rappel: "Bonjour {patient}, rappel." }));
await db.doc(MOD + "/parametres/typesConsult").set(J([{ k: "suivi", nom: "Consultation de suivi" }, { k: "telecs", nom: "Téléconsultation de test", rdv: true }]));
await db.doc(MOD + "/bibliotheques/medicaments").set(J([{ id: "m1", nom: "FICTIVOL 5 mg", poso: "1 cp", fav: true }, { id: "m2", nom: "TESTOMYCINE 1 g", poso: "2 cp" }]));
await db.doc(MOD + "/bibliotheques/courriers").set(J([{ id: "rt-rdv", rt: "rdv", nom: "Calendrier (modèle)", html: "<p>modèle</p>" }]));
// Bibliothèque de référence (ancien modèle) et autre cabinet fictif (ancienne copie de la spécialité, ses propres modifications)
await db.doc(BIB).set({ bibliotheque: true, nom: "Oncologie – Radiothérapie" });
await db.doc(BIB + "/bibliotheques/medicaments").set(J([{ id: "m1", nom: "FICTIVOL 5 mg", poso: "1 cp" }]));
// Protocoles (20/10/2026 : copiés dans la même action que les réglages)
await db.doc(MOD + "/protocoles/lib_0").set(J([{ id: "p1", nom: "PROTOCOLE TEST A", fav: true, valide: { le: "2026-10-01", par: "MED" } }, { id: "p2", nom: "PROTOCOLE TEST B" }]));
await db.doc(BIB + "/protocoles/lib_0").set(J([{ id: "p0", nom: "ANCIEN PROTOCOLE DU MODÈLE" }]));
// RTR, RT7 (25/10/2026) : référentiel de radiothérapie du cabinet modèle (un schéma modifié, un créé) ; ancien schéma du modèle (retiré par la copie)
const RT = (titre, o) => Object.assign({ schema: { id: "x", situation_id: "pro-ep-fav", titre, type: "rte_hypo", preuve: "essai_phase3", prescriptions: [{ volume: "PTV", dose_Gy: 60, fractions: 20, dose_fx_Gy: 3 }] }, localisation_id: "prostate", origine: "cabinet", base: "2026-10-22", majPar: "MED", majParNom: "Dr Modèle", majLe: "2026-10-25T09:00:00Z" }, o || {});
await db.doc(MOD + "/referentielRT/pro-fav-60-20").set(RT("60 Gy / 20 fx (version du modèle, test)"));
await db.doc(MOD + "/referentielRT/cab-test1").set(RT("Schéma créé (test)", { nouveau: true, copie_de: "pro-fav-60-20" }));
await db.doc(BIB + "/referentielRT/ancien-test").set(RT("ANCIEN SCHÉMA DU MODÈLE"));
await db.doc(X).set({ nom: "Cabinet X (test)", titulaire: "MX", actif: true, ficheSpe: { ajouts: [{ id: "xvieux", lib: "Ancien champ", type: "texte", partie: "clinique" }] },
  abonnement: { formule: "complet", modules: { chimio: true }, reglage: { menu: ["agenda"], cartes: { stats: true } } } });
await db.doc(X + "/parametres/listes").set(J({ diag: ["Cancer X"], mut: [], cor: ["Dr Correspondant de X"] }));
await db.doc(X + "/bibliotheques/medicaments").set(J([{ id: "mx", nom: "PROPRE AU CABINET X", poso: "x" }, { id: "m1", nom: "FICTIVOL 5 mg", poso: "posologie changée par X" }]));
await db.doc(X + "/bibliotheques/courriers").set(J([{ id: "rt-rdv", rt: "rdv", nom: "Calendrier modifié par X", html: "<p>X</p>" }]));
await db.doc(X + "/finances/tarifs").set(J({ etablissements: { CX: { activites: [{ type: "echo", libelle: "Échographie de X" }] } } }));

const app = initializeApp({ projectId: PROJ, apiKey: "cle-de-test", authDomain: PROJ + ".firebaseapp.com" });
const auth = getAuth(app); connectAuthEmulator(auth, "http://" + (process.env.FIREBASE_AUTH_EMULATOR_HOST || "127.0.0.1:9099"), { disableWarnings: true });
const fn = getFunctions(app, "europe-west1"); const [fh, fp] = (process.env.FUNCTIONS_EMULATOR_HOST || "127.0.0.1:5001").replace(/^https?:\/\//, "").split(":"); connectFunctionsEmulator(fn, fh, +fp);
const reprendre = httpsCallable(fn, "modeleReprendre", { timeout: 120000 }), appliquer = httpsCallable(fn, "modeleAppliquer", { timeout: 120000 }), creer = httpsCallable(fn, "creerCabinet", { timeout: 120000 });

console.log("Refus");
await signInWithEmailAndPassword(auth, "med@test.ma", "motdepasse-test");
let refus = null; try { await reprendre({}); } catch (e) { refus = e.code; }
cas("un médecin (pas l'administration) ne peut pas reprendre le modèle", refus === "functions/permission-denied", refus);

console.log("Reprendre : aperçu, puis reprise");
await signInWithEmailAndPassword(auth, "adm@test.ma", "motdepasse-test");
const a1 = (await reprendre({})).data;
cas("aperçu : différences partie par partie (fiche, consultation, types, paramètres, bibliothèques, réglage)", a1.n > 0 && ["fiche", "consultation", "typesConsult", "parametres", "bibliotheques", "reglage"].every((k) => a1.diffs.some((d) => d.k === k && d.n > 0)), a1.diffs.map((d) => d.k + ":" + d.n));
cas("aperçu : rien n'est écrit", !(await db.doc("plateforme/specialites").get()).exists);
const dp = a1.diffs.find((d) => d.k === "protocoles");
cas("aperçu : les protocoles dans la même copie (2 ajoutés, 1 retiré)", dp && dp.n === 3 && dp.nb === 2, dp);
cas("aperçu : protocoles du modèle pas encore remplacés", (await lire(BIB + "/protocoles/lib_0"))[0].id === "p0");
const dr = a1.diffs.find((d) => d.k === "referentielRT");
cas("aperçu : le référentiel de radiothérapie dans la même copie (2 ajoutés, 1 retiré)", dr && dr.n === 3 && dr.nb === 2, dr);
const a2 = (await reprendre({ confirmer: true })).data, SP = (await db.doc("plateforme/specialites").get()).data(), m = Object.values(SP)[0];
cas("modèle écrit : fiche avec les champs ajoutés (spécialité et cabinet), le nom « Organisme », le champ caché", m && (m.fiche.ajouts || []).map((x) => x.id).sort().join() === "xgeuit,xscore" && m.fiche.libs.mut === "Organisme" && m.fiche.champs.tel2 === false, m && m.fiche);
cas("modèle écrit : formulaire de consultation (formulaire nommé « RCP »), réglage (menu, cartes, fonctions)", m.consultation.typesForm && m.consultation.typesForm.RCP === "frcp" && m.reglage.menu[0] === "salle" && m.reglage.cartes.stats === false && m.reglage.cartes.rappels === false && m.reglage.fonctions["agenda.whatsapp"] === false);
cas("« Modèle repris le … » noté, avec la copie de l'état précédent", m.repris && m.repris.source === "cabinet-bentahila" && /^plateforme\/sauvegardes\/modele-/.test(m.repris.copie), m.repris);
cas("copie de l'état précédent dans le stockage (ancien modèle : FICTIVOL seul)", (await bucket.file(m.repris.copie).exists())[0] && JSON.parse((await bucket.file(m.repris.copie).download())[0]).modele.bibliotheques.medicaments.length === 1);
const Lb = await lire(BIB + "/parametres/listes"), Mb = await lire(BIB + "/bibliotheques/medicaments");
cas("bibliothèque de référence : listes sans les correspondants du cabinet modèle", Lb && Lb.diag.indexOf("Cancer test A") >= 0 && !(Lb.cor || []).length, Lb && Lb.cor);
cas("bibliothèque de référence : médicaments du cabinet modèle, sans étoiles", Mb.length === 2 && !Mb.some((x) => x.fav));
const Ab = await lire(BIB + "/parametres/accueil");
cas("tableau de bord repris (20/10/2026) : ordre et cartes retirées seulement", Ab && Ab.ordre[0] === "jour" && Ab.cartes.rappels === false && !("afaire" in Ab.cartes), Ab);
cas("fiche et formulaire du modèle aussi dans la fiche de la bibliothèque (lus par Onco360)", JSON.stringify((await db.doc(BIB).get()).data().ficheSpe) === JSON.stringify(m.fiche) && (await db.doc(BIB).get()).data().consultSpe.typesForm.RCP === "frcp");
cas("types de consultation et WhatsApp repris", ((await lire(BIB + "/parametres/typesConsult")) || []).some((t) => t.k === "telecs") && (await lire(BIB + "/parametres/whatsapp")).rappel);
const Pb = await lire(BIB + "/protocoles/lib_0");
const Rb = (await db.collection(BIB + "/referentielRT").get()).docs.map((d) => [d.id, d.data()]);
cas("référentiel de radiothérapie copié dans le modèle (2 schémas, origine « modele »), l'ancien retiré", Rb.map((x) => x[0]).sort().join() === "cab-test1,pro-fav-60-20" && Rb.every((x) => x[1].origine === "modele") && Rb.find((x) => x[0] === "cab-test1")[1].nouveau === true, Rb.map((x) => x[0]));
cas("le référentiel du cabinet modèle n'est pas touché (origine « cabinet »)", (await db.doc(MOD + "/referentielRT/pro-fav-60-20").get()).data().origine === "cabinet");
cas("protocoles copiés dans le modèle, sans étoiles", Pb.map((x) => x.id).join() === "p1,p2" && !Pb.some((x) => x.fav), Pb);
cas("anciens protocoles du modèle gardés dans la copie de secours", JSON.stringify(JSON.parse((await bucket.file(m.repris.copie).download())[0]).protocoles).includes("ANCIEN PROTOCOLE DU MODÈLE"));
cas("le cabinet modèle n'est pas touché (ses étoiles, ses correspondants)", (await lire(MOD + "/bibliotheques/medicaments"))[0].fav === true && (await lire(MOD + "/parametres/listes")).cor[0] === "Dr Correspondant Privé");
cas("cabinet déjà créé : pas encore changé (il faut « Appliquer »)", ((await db.doc(X).get()).data().ficheSpe.ajouts || []).length === 1);
const a3 = (await reprendre({})).data;
cas("après la reprise : aucune différence depuis", a3.n === 0 && a3.repris, a3.diffs.filter((d) => d.n));
const j1 = await db.collection("journalAdmin").get();
cas("reprise notée au journal de l'administration", j1.docs.some((d) => /Modèle repris du cabinet du Dr Bentahila/.test(d.data().txt)));
cas("copie du référentiel notée au journal (nombre de schémas)", j1.docs.some((d) => /2 schémas du référentiel de radiothérapie/.test(d.data().txt)));

console.log("Fiche de la spécialité enregistrée dans l'Administration : plus liée au cabinet du Dr Bentahila");
const ficheSpe = httpsCallable(fn, "ficheSpecialite", { timeout: 120000 }), avantMod = JSON.stringify((await db.doc(MOD).get()).data().ficheSpe);
const fs1 = (await ficheSpe({ specialite: "Oncologie – Radiothérapie", quoi: "fiche", fiche: Object.assign({}, m.fiche, { libs: Object.assign({}, m.fiche.libs, { cin: "Pièce d'identité" }) }) })).data;
cas("cabinet du Dr Bentahila pas touché ; autre cabinet de la spécialité mis à jour", JSON.stringify((await db.doc(MOD).get()).data().ficheSpe) === avantMod && (await db.doc(X).get()).data().ficheSpe.libs.cin === "Pièce d'identité" && fs1.cabinets === 1, fs1);
// depuis le modèle ouvert dans Onco360 (espace = bibliothèque) : même enregistrement, fiche de la bibliothèque mise à jour aussi
const fs2 = (await ficheSpe({ espace: "bib-oncologie", quoi: "fiche", fiche: Object.assign({}, m.fiche, { libs: Object.assign({}, m.fiche.libs, { cin: "CIN (modèle)" }) }) })).data;
cas("depuis le modèle ouvert dans Onco360 : modèle, bibliothèque et autre cabinet mis à jour ; jamais le cabinet du Dr Bentahila", fs2.cabinets === 1 && (await db.doc(BIB).get()).data().ficheSpe.libs.cin === "CIN (modèle)" && Object.values((await db.doc("plateforme/specialites").get()).data())[0].fiche.libs.cin === "CIN (modèle)" && JSON.stringify((await db.doc(MOD).get()).data().ficheSpe) === avantMod, fs2);
refus = null; try { await ficheSpe({ espace: "cab-x", quoi: "fiche", fiche: {} }); } catch (e) { refus = e.code; }
cas("espace qui n'est pas un modèle : refusé", refus === "functions/invalid-argument", refus);
await ficheSpe({ specialite: "Oncologie – Radiothérapie", quoi: "fiche", fiche: m.fiche }); await db.doc(X).update({ ficheSpe: { ajouts: [{ id: "xvieux", lib: "Ancien champ", type: "texte", partie: "clinique" }] } }); // remis comme avant
console.log("Appliquer à un autre cabinet : rien d'écrasé, ce qui manque est ajouté");
refus = null; try { await appliquer({ espace: "cabinet-bentahila" }); } catch (e) { refus = e.code; }
cas("refusé sur le cabinet modèle lui-même", refus === "functions/invalid-argument", refus);
const p1 = (await appliquer({ espace: "cab-x" })).data;
cas("aperçu : ce qui serait ajouté, partie par partie ; rien d'écrit", p1.n > 0 && !p1.ecrit && ((await db.doc(X).get()).data().ficheSpe.ajouts || []).length === 1, p1.diffs.map((d) => d.k + ":" + d.n));
const p2 = (await appliquer({ espace: "cab-x", confirmer: true })).data, Xd = (await db.doc(X).get()).data();
cas("fiche de la spécialité : champs du modèle reçus, l'ancien champ du cabinet gardé", p2.ecrit && Xd.ficheSpe.ajouts.map((x) => x.id).sort().join() === "xgeuit,xscore,xvieux", Xd.ficheSpe.ajouts.map((x) => x.id));
const Mx = await lire(X + "/bibliotheques/medicaments");
cas("médicaments : ceux du cabinet gardés tels quels (posologie changée par X), TESTOMYCINE ajouté, pas de doublon", Mx.length === 3 && Mx.find((x) => x.id === "m1").poso === "posologie changée par X" && Mx.some((x) => x.nom === "TESTOMYCINE 1 g") && Mx.some((x) => x.id === "mx"), Mx);
cas("modèle de document de RT modifié par le cabinet : pas écrasé", (await lire(X + "/bibliotheques/courriers")).find((x) => x.id === "rt-rdv").nom === "Calendrier modifié par X");
const Lx = await lire(X + "/parametres/listes");
cas("listes : diagnostics du modèle ajoutés, correspondants du cabinet seuls (aucun du modèle)", Lx.diag.indexOf("Cancer X") >= 0 && Lx.diag.indexOf("Cancer test A") >= 0 && JSON.stringify(Lx.cor) === '["Dr Correspondant de X"]', Lx);
const Tx = await lire(X + "/parametres/typesConsult");
cas("types de consultation : ceux du modèle + l'activité des tarifs du cabinet", Tx.some((t) => t.k === "telecs") && Tx.some((t) => t.k === "echo"), Tx);
cas("WhatsApp : message ajouté (le cabinet n'en avait pas)", (await lire(X + "/parametres/whatsapp")).rappel);
cas("réglage : menu et cartes du cabinet gardés (stats affichée), entrées manquantes ajoutées", Xd.abonnement.reglage.menu[0] === "agenda" && Xd.abonnement.reglage.cartes.stats === true && Xd.abonnement.reglage.menu.indexOf("salle") >= 0, Xd.abonnement.reglage);
const copies = (await bucket.getFiles({ prefix: X + "/sauvegardes/" }))[0];
cas("copie de l'état précédent du cabinet dans le stockage", copies.length === 1 && JSON.parse((await copies[0].download())[0]).avant["bibliotheques/medicaments"].length === 2);
const p3 = (await appliquer({ espace: "cab-x" })).data;
cas("appliquer une 2e fois : plus rien à ajouter", p3.n === 0, p3.diffs.filter((d) => d.n));
const p4 = (await appliquer({ espace: "cab-x", parties: ["fiche"] })).data;
cas("parties cochées seulement : une seule partie lue", p4.diffs.length === 1 && p4.diffs[0].k === "fiche", p4.diffs.map((d) => d.k));

console.log("Écart au modèle (lecture seule)");
const ecart = httpsCallable(fn, "modeleEcart", { timeout: 120000 });
const avantEcart = JSON.stringify((await db.collection("espaces/cab-x/bibliotheques").get()).docs.map((d) => d.data().data));
const e1 = (await ecart({ espace: "cab-x" })).data, pb = e1.parties.find((p) => p.k === "bibliotheques"), pf = e1.parties.find((p) => p.k === "fiche"), pp = e1.parties.find((p) => p.k === "parametres");
cas("cab-x : médicament propre (ajouté) et FICTIVOL (modifié par X) dans l'écart", pb.plus.indexOf("PROPRE AU CABINET X") >= 0 && pb.change.indexOf("FICTIVOL 5 mg") >= 0, pb);
cas("cab-x : l'ancien champ gardé dans sa fiche apparaît comme ajouté par le cabinet", pf.plus.indexOf("Ancien champ") >= 0, pf);
cas("aucun correspondant dans l'écart (ni du cabinet ni du modèle)", !JSON.stringify(e1).includes("Correspondant"), pp);
cas("lecture seule : rien d'écrit dans le cabinet", JSON.stringify((await db.collection("espaces/cab-x/bibliotheques").get()).docs.map((d) => d.data().data)) === avantEcart);
const e2 = (await ecart({ espace: "cabinet-bentahila" })).data;
cas("cabinet modèle juste après la reprise : aucun écart", e2.modele === true && e2.n === 0, e2.parties.filter((p) => p.n));
await db.doc(MOD + "/parametres/whatsapp").set(J({ rappel: "Bonjour {patient}, rappel changé." }));
const e3 = (await ecart({ espace: "cabinet-bentahila" })).data;
cas("cabinet modèle : un message WhatsApp changé depuis la reprise apparaît", e3.n === 1 && e3.parties.find((p) => p.k === "parametres").change.indexOf("whatsapp.rappel") >= 0, e3.parties.filter((p) => p.n));
await signInWithEmailAndPassword(auth, "med@test.ma", "motdepasse-test");
refus = null; try { await ecart({ espace: "cab-x" }); } catch (e) { refus = e.code; }
cas("un médecin (pas l'administration) ne voit pas l'écart d'un autre cabinet", refus === "functions/permission-denied", refus);
await signInWithEmailAndPassword(auth, "adm@test.ma", "motdepasse-test");

console.log("Cabinet neuf : reçoit le modèle repris");
const c1 = (await creer({ cabinet: "Cabinet neuf test", prenom: "Test", nom: "Neuf", email: "neuf@test.ma", telephone: "0600000000", formule: "complet" })).data, N = "espaces/" + c1.espace;
const Nd = (await db.doc(N).get()).data();
cas("fiche et formulaire de consultation du modèle", (Nd.ficheSpe.ajouts || []).map((x) => x.id).sort().join() === "xgeuit,xscore" && Nd.consultSpe.typesForm.RCP === "frcp", Nd.ficheSpe);
cas("réglage du pack complété par le modèle (menu de départ du modèle, salle en tête)", Nd.abonnement.reglage && Nd.abonnement.reglage.menu && Nd.abonnement.reglage.menu.indexOf("salle") >= 0, Nd.abonnement.reglage);
cas("tableau de bord du modèle copié dans le cabinet neuf", ((await lire(N + "/parametres/accueil")) || {}).ordre[0] === "jour");
const Rn = (await db.collection(N + "/referentielRT").get()).docs.map((d) => [d.id, d.data()]);
cas("référentiel de radiothérapie du modèle copié dans le cabinet neuf (origine « modele »)", Rn.map((x) => x[0]).sort().join() === "cab-test1,pro-fav-60-20" && Rn.every((x) => x[1].origine === "modele" && x[1].schema && x[1].schema.titre), Rn.map((x) => x[0]));
// Cabinet de démonstration recréé : même création (creerEspace), donc le référentiel du modèle aussi
const demo = (await httpsCallable(fn, "creerCabinetDemo", { timeout: 300000 })({ email: "demo-rt7@test.ma" })).data, Dm = "espaces/" + demo.espace;
const Rd = (await db.collection(Dm + "/referentielRT").get()).docs.map((d) => [d.id, d.data().origine]);
cas("cabinet de démonstration recréé : patients fictifs et référentiel de radiothérapie du modèle", demo.patients > 0 && Rd.map((x) => x[0]).sort().join() === "cab-test1,pro-fav-60-20" && Rd.every((x) => x[1] === "modele"), [demo.patients, Rd]);
const ouvrir = httpsCallable(fn, "bibliothequeOuvrir", { timeout: 120000 });
await db.doc(BIB).update({ ficheSpe: {} }); await ouvrir({ bib: "bib-oncologie" });
cas("ouvrir le modèle : sa fiche et son formulaire recopiés depuis le modèle de la spécialité", JSON.stringify((await db.doc(BIB).get()).data().ficheSpe) === JSON.stringify(Object.values((await db.doc("plateforme/specialites").get()).data())[0].fiche));
cas("types de consultation, médicaments et listes (sans correspondants) du modèle", ((await lire(N + "/parametres/typesConsult")) || []).some((t) => t.k === "telecs") && (await lire(N + "/bibliotheques/medicaments")).length === 2 && !((await lire(N + "/parametres/listes")).cor || []).length);

console.log("Réglage du cabinet en miroir (20/10/2026)");
const lireR = httpsCallable(fn, "reglageCabinetLire", { timeout: 60000 }), abo = httpsCallable(fn, "abonnementCabinet", { timeout: 60000 });
const r1 = (await lireR({ espace: "cabinet-bentahila" })).data;
cas("lecture : tableau de bord et retouches du médecin, fiche de la spécialité copiée chez lui", r1.accueil.ordre[0] === "jour" && r1.formulaires.fiche.libs.mut === "Organisme" && (r1.ficheSpe.ajouts || []).some((x) => x.id === "xscore"), r1);
cas("lecture : types de consultation du cabinet (noms actuels) et activités sans prix", (r1.typesConsult || []).some((t) => t.k === "telecs") && Array.isArray(r1.acts) && !JSON.stringify(r1.acts).match(/prix|"m":/), r1.typesConsult);
refus = null; try { await lireR({ espace: "bib-oncologie" }); } catch (e) { refus = e.code; } cas("lecture : pas d'une bibliothèque", refus === "functions/not-found", refus);
await abo({ espace: "cab-x", formule: "complet", modules: { chimio: true }, max: {}, reglage: { menu: ["agenda"] }, cab: { accueil: { ordre: ["afaire", "jour"], cartes: { stats: false, "x y": true }, col: { jour: "l", afaire: "z" } }, formulaires: { fiche: { champs: { email: false } }, consultation: { typesForm: { "Consultation de fin de traitement": "rt" } } } } });
const ax = await lire(X + "/parametres/accueil"), fx = await lire(X + "/parametres/formulaires");
cas("écriture en miroir : tableau de bord dans ses Paramètres (nettoyé : clé et colonne invalides retirées)", JSON.stringify(ax) === JSON.stringify({ ordre: ["afaire", "jour"], cartes: { stats: false }, col: { jour: "l" } }), ax);
cas("écriture en miroir : fiche et formulaire dans ses Paramètres (formulaire du type gardé)", fx.fiche.champs.email === false && fx.consultation.typesForm["Consultation de fin de traitement"] === "rt", fx);
cas("écriture signée par l'administration", (await db.doc(X + "/parametres/accueil").get()).data().majPar === "ADM");
await abo({ espace: "cab-x", formule: "complet", modules: { chimio: true }, max: {}, reglage: { menu: ["agenda"] } });
cas("sans « cab » : ses Paramètres ne sont pas touchés", JSON.stringify(await lire(X + "/parametres/accueil")) === JSON.stringify(ax));
console.log("\n" + ok + " réussis, " + ko + " échoués"); process.exit(ko ? 1 : 0);
