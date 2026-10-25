// S7 (24/10/2026, audit n° 10 d. 7) : jeu de test ENTIÈREMENT FICTIF, à la place de tests/seed.json (copie de vrais dossiers, jamais dans le dépôt).
// node tests/mkfictif.mjs  →  tests/seed-fictif.json (dans le dépôt : aucun nom, aucun dossier réel)
// Contenu : cabinet « cabinet-bentahila » (mêmes identifiants que les tests attendent), médecin titulaire fictif UIDRITA, lieux HGC / HCK / CIOC,
// grille tarifaire de même forme que celle du cabinet (consultations, séances, hospitalisation, RT), fériés et mutuelles de départ, bibliothèque de
// protocoles de la copie du 06/10 (tests/moteur/donnees, sans patient), 80 patients fictifs (« PATIENT TEST … », functions/demo.js) répartis de janvier à
// octobre 2026 dans les trois lieux, avec des montants fictifs. Le chiffre du bilan de ce jeu est la nouvelle référence (tests/bilan_ref_fictif.txt).
import fs from "fs"; import path from "path"; import { fileURLToPath } from "url"; import { createRequire } from "module";
const ICI = path.dirname(fileURLToPath(import.meta.url)), P = "file://" + path.join(ICI, "..", "public", "js") + "/", require = createRequire(import.meta.url);
const Dm = require(path.join(ICI, "..", "functions", "demo.js"));
const { separer, fusionner } = await import(P + "donnees/conversion.js");
const { resume } = await import(P + "moteur/resume.js");
const { evtsFin } = await import(P + "moteur/finances.js");
const { calculerBilan, texteTotaux } = await import(P + "moteur/bilan.js");
const { FERIES0, MUT0 } = await import(P + "donnees/listes.js");
const T0 = "2026-10-06", E = "espaces/cabinet-bentahila/", S = {};
S["espaces/cabinet-bentahila"] = { nom: "Cabinet de test", titulaire: "UIDRITA", actif: true };
// grille de droits du jeu d'origine (les autres droits prennent les valeurs par défaut du rôle)
S[E + "membres/UIDRITA"] = { role: "medecin", nom: "Dr TEST", email: "ritabentahila@gmail.com", actif: true, tousEtablissements: true, etablissements: ["HGC", "HCK", "CIOC"], droits: { identite: true, rendezvous: true, planningChimio: true, traitements: "modifier", radiotherapie: "modifier", administrer: true, creerPatient: true, supprimerPatient: true, finances: true, parametres: true } };
S["utilisateurs/UIDRITA"] = { email: "ritabentahila@gmail.com", nom: "TEST", prenom: "Médecin", titre: "Dr", inpe: "000000000" };
for (const [c, n] of Object.entries({ HGC: "Hôpital de test A", HCK: "Hôpital de test B", CIOC: "Centre de test C" })) S[E + "etablissements/" + c] = { code: c, nom: n, actif: true };
const H = (brut, retro, impot) => ({ historique: [{ depuis: "2000-01-01", brut, retro, impot }] });
const act = (type, libelle, h) => Object.assign({ type, libelle }, h);
const grille = (consult) => ({ activites: [act("annonce", "Consultation d'annonce", H(consult[0], 0, consult[2])), act("suivi", "Consultation de suivi", H(consult[1], 0, consult[2])), act("controle", "Consultation de contrôle", H(0, 0, 0))]
  .concat(consult[3] ? [act("cchimio", "Consultation de chimiothérapie", H(250, 0, 0)), act("seance", "Séance de chimiothérapie", H(500, 0, 10)), act("hospit", "Hospitalisation (par jour ouvré)", H(400, 0, 10))] : [])
  .concat([act("rt", "Radiothérapie (tarif de l'acte)", H(null, consult[4], 10))]) });
const table = { repli: "HGC", vmat: 10000, actesRT: [{ nom: "Sein", prix: 28000 }, { nom: "Prostate conformationnelle", prix: 30600 }, { nom: "Cavum", prix: 35000 }, { nom: "Rectum", prix: 30000 }, { nom: "Palliative", prix: 8000 }],
  etablissements: { HGC: grille([400, 300, 0, 1, 60]), HCK: grille([250, 250, 10, 0, 70]), CIOC: grille([400, 300, 0, 1, 60]) } };
S[E + "finances/tarifs"] = { data: JSON.stringify(table) }; S[E + "finances/versements"] = { data: "[]" };
S[E + "parametres/calendrier"] = { data: JSON.stringify({ feries: FERIES0, abs: [{ du: "2026-10-15", au: "2026-10-18", m: "Congrès (absence fictive)" }] }) };
S[E + "parametres/listes"] = { data: JSON.stringify({ mut: MUT0.slice(0, 2), cor: ["Dr CORRESPONDANT UN", "Dr CORRESPONDANT DEUX", "Dr CORRESPONDANT TROIS"] }) };
// Bibliothèque : copie du 06/10 (316 protocoles, aucune donnée patient ; mêmes documents lib_0…lib_10), celle d'avant les corrections des audits n° 3
// et 10, que test_audit3 / test_audit10 rejouent ; les tests du moteur ont aussi la copie du 18/10 (tests/moteur/donnees)
const DOCS = JSON.parse(fs.readFileSync(path.join(ICI, "moteur", "donnees", "bibliotheque-2026-10-06.json"), "utf8")), BIB = [].concat(...Object.values(DOCS)), bib = {};
BIB.forEach((p) => { bib[p.id] = p; });
for (const k of Object.keys(DOCS)) S[E + "protocoles/" + k] = { data: JSON.stringify(DOCS[k]) };
// Patients fictifs : 8 par mois (demo.js), dans un des trois lieux à tour de rôle, avec des montants fictifs (consultations, chimio)
const ctx = { aujourdhui: T0, bib, feries: FERIES0, table }, res = [], LIEUX = ["HGC", "CIOC", "HCK"];
const jours = ["2026-01-12", "2026-02-09", "2026-03-09", "2026-04-13", "2026-05-11", "2026-06-08", "2026-07-13", "2026-08-10", "2026-09-07", "2026-09-28"];
let n = 0;
jours.forEach((j, mi) => Dm.patientsDemo(BIB, table.actesRT, j).forEach((p) => {
  n++; const d = p.data, lieu = LIEUX[n % 3], id = p.id;
  d.etablissementId = lieu; d.identite = Object.assign({}, d.identite, { nom: "PATIENT TEST " + n, nomF: "PATIENT TEST " + n, numero: "2026" + String(mi + 1).padStart(2, "0") + String(n).padStart(3, "0") });
  // radiothérapies : dans le lieu du patient ; celles commencées avant août 2026 terminées 5 semaines après la 1re séance (comptées au bilan)
  d.rtsJson = JSON.stringify(JSON.parse(d.rtsJson || "[]").map((r) => Object.assign(r, { hop: lieu }, r.deb && mi <= 6 ? { fin: Dm.addJ(r.deb, 35) } : {})));
  ajouter(id, d, lieu, null);
}));
// Dossiers de référence des tests du navigateur (ids fixes, cités par les tests) : déroulés types autour du 06/10/2026
const fiche = (k, sexe, poids) => ({ identite: { nom: "PATIENT TEST REF " + k, nomF: "PATIENT TEST REF " + k, prenom: "Réf", sexe, ddn: "1965-06-15", tel: "0600000000", mut: "CNOPS", cor: "", cin: "REF" + k, numero: "202609" + String(900 + k) },
  clinique: { poids: String(poids), taille: "168", diag: "Cancer colorectal métastatique", notes: "Dossier fictif de référence des tests." } });
const ligneR = (id, protoId, j1, poids, cures) => ({ id, protoId, pr: JSON.parse(JSON.stringify(bib[protoId])), j1, poids: String(poids), creat: "8", crU: "mgL", assoc: 0, cures });
const valR = (d) => d + "T10:00:00.000Z", rdvR = (id, type, d, h, st, o) => Object.assign({ id, type, d, h, st }, st === "fait" ? { dv: d } : {}, o || {});
const dossierR = (k, lieu, sexe, poids, o) => Object.assign({ etablissementId: lieu, lignesJson: JSON.stringify(o.lignes || []), planningJson: JSON.stringify(o.planning || {}), rdvsJson: JSON.stringify(o.rdvs || []), rtsJson: JSON.stringify(o.rts || []), version: 1 }, fiche(k, sexe, poids));
// A1 (HGC) : mFOLFOX6 / 28 j, C1 reçue le 25/09, J15 prévu le 09/10 ; annonce faite le 21/09
ajouterR("PTA1", dossierR(1, "HGC", "F", 58, { lignes: [ligneR("LA1", "maj|mfolfox6-eviq-", "2026-09-26", 58, [{ st: "recue", reelle: "2026-09-25", valLe: valR("2026-09-26"), sea: { 15: { st: "prevue" } } }, {}, {}, {}, {}, {}])],
  planning: { LA1: { 1: { sea: { 15: "2026-10-09" } } } }, rdvs: [rdvR("rA1", "Annonce", "2026-09-21", "10:00", "fait")] }), { rdv: { rA1: { mode: "esp" } }, rt: {}, cures: { LA1: { 1: { consJ: { 1: 250 }, consModeJ: { 1: "esp" } } } } });
// A2 (HGC) : mFOLFOX6 qui commence le 14/10 ; hospitalisation faite les 25-26/09
ajouterR("PTA2", dossierR(2, "HGC", "H", 82, { lignes: [ligneR("LA2", "maj|mfolfox6-eviq-", "2026-10-12", 82, [{}, {}, {}, {}, {}, {}])], planning: { LA2: { 1: { fixe: "2026-10-14" } } },
  rdvs: [rdvR("rA2", "Hospitalisation", "2026-09-25", "", "fait", { f: "2026-09-26" })] }), null);
// A3 (HGC) : radiothérapie ORL en préparation ; annonce 23/09, contrôle 30/09, contrôle prévu le 05/10
ajouterR("PTA3", dossierR(3, "HGC", "H", 70, { rdvs: [rdvR("rA3a", "Annonce", "2026-09-23", "", "fait"), rdvR("rA3b", "Contrôle", "2026-09-30", "12:30", "fait"), rdvR("rA3c", "Contrôle", "2026-10-05", "10:30", "prevu")],
  rts: [{ id: "rtA3", acte: "Cavum", hop: "HGC", nb: "35", ryt: "1", nbA: 1, vmat: true, scan: "", deb: "", cree: "2026-10-02" }] }), null);
// K1 (HCK) : radiothérapie palliative 5 séances depuis le 05/10 ; annonce 16/09, contrôle 30/09, contrôle prévu le 09/10
ajouterR("PTK1", dossierR(4, "HCK", "F", 64, { rdvs: [rdvR("rK1a", "Annonce", "2026-09-16", "", "fait"), rdvR("rK1b", "Contrôle", "2026-09-30", "13:00", "fait"), rdvR("rK1c", "Contrôle", "2026-10-09", "13:30", "prevu")],
  rts: [{ id: "rtK1", acte: "Palliative", hop: "HCK", nb: "5", ryt: "1", nbA: 1, vmat: false, scan: "2026-09-30", deb: "2026-10-05", cree: "2026-09-27" }] }), null);
// ESS (CIOC) : carboplatine + gemcitabine J1-J8 / 21 j, C1 le 03/09 (J8 le 10/09) et C2 le 24/09 (J8 le 01/10) reçues, C3 fixée au 14/10
ajouterR("PTESS", dossierR(5, "CIOC", "H", 69, { lignes: [ligneR("LESS", "maj|carboplatine-auc-4-5-gemcitabine-800-j1-j8-21-j-vessie-", "2026-09-03", 69, [{ st: "recue", reelle: "2026-09-03", valLe: valR("2026-09-03"), sea: { 8: { st: "recue", d: "2026-09-10", valLe: valR("2026-09-10") } } },
  { st: "recue", reelle: "2026-09-24", valLe: valR("2026-09-24"), sea: { 8: { st: "recue", d: "2026-10-01", valLe: valR("2026-10-01") } } }, {}, {}, {}, {}])], planning: { LESS: { 3: { fixe: "2026-10-14" } } },
  rdvs: [rdvR("rESS", "Annonce", "2026-08-17", "", "fait")] }), { rdv: { rESS: { mode: "esp" } }, rt: {}, cures: { LESS: { 1: { consJ: { 1: 250 }, consModeJ: { 1: "esp" } }, 2: { consJ: { 1: 250 }, consModeJ: { 1: "esp" } } } } });
// CIOC (CIOC) : FOLFOX + trastuzumab / 28 j, 5 cures reçues (J15 validés), C5 J15 le 08/10, C6 le 21/10
const CU = ["2026-05-21", "2026-06-18", "2026-07-16", "2026-08-19", "2026-09-17"].map((d) => ({ st: "recue", reelle: d, valLe: valR(d), sea: { 15: { st: "recue", d: Dm.addJ(d, 14), valLe: valR(Dm.addJ(d, 14)) } } }));
CU[4].sea = { 15: { st: "prevue" } };
ajouterR("PTCIOC", dossierR(6, "CIOC", "F", 77, { lignes: [ligneR("LCI", "colon|FOLFOX herceptine", "2026-05-21", 77, CU.concat([{}]))], planning: { LCI: { 1: { fixe: "2026-05-21" }, 2: { fixe: "2026-06-18" }, 5: { sea: { 15: "2026-10-08" } }, 6: { fixe: "2026-10-21" } } } }), null);
function ajouterR(id, d, M0) { ajouter(id, d, d.etablissementId, M0); }
function ajouter(id, d, lieu, M0) {
  // protocoles à J8 (vinorelbine…) : séance J8 validée une semaine après chaque cure reçue (sauf aujourd'hui et après)
  d.lignesJson = JSON.stringify(JSON.parse(d.lignesJson || "[]").map((L) => { if ((L.pr.dr || []).some((x) => (x.j || []).indexOf(8) >= 0)) (L.cures || []).forEach((c) => { if (c.st === "recue" && Dm.addJ(c.reelle, 7) < T0) c.sea = { 8: { st: "recue", d: Dm.addJ(c.reelle, 7), valLe: c.valLe } }; }); return L; }));
  const Pt = fusionner(id, d, null), M = M0 || { rdv: {}, cures: {}, rt: {} };
  if (!M0) (Pt.rdvs || []).forEach((r, k) => { if (r.st === "fait") M.rdv[r.id] = k % 4 === 3 ? { brut: 0, mode: "esp" } : { mode: "esp" }; });
  if (!M0) (Pt.lignes || []).forEach((L) => { (L.cures || []).forEach((c, k) => { if (c.st === "recue" && lieu !== "HCK") (M.cures[L.id] = M.cures[L.id] || {})[k + 1] = { consJ: { 1: k % 3 === 2 ? 0 : 250 }, consModeJ: { 1: "esp" } }; }); });
  const { patient } = separer(Object.assign({}, Pt, { id }));
  S[E + "patients/" + id] = Object.assign({}, d, patient, { etablissementId: lieu, resume: JSON.stringify(resume(JSON.parse(JSON.stringify(fusionner(id, d, null))), ctx)), version: 1 });
  S[E + "patientsFinances/" + id] = { etablissementId: lieu, montantsJson: JSON.stringify(M) };
  const P2 = fusionner(id, S[E + "patients/" + id], null);
  res.push({ id, nm: P2.nom, cor: P2.cor || "", hop: P2.hop, fin: JSON.parse(JSON.stringify(evtsFin(P2, M, ctx))), P: P2, M });
}
// cases « Payé » fictives à l'ancien format (« patient|type|date|libellé », reprises par migrerPaiements) : un acte passé sur cinq
const pai = {}; let q = 0;
res.forEach((x) => x.fin.forEach((e) => { if (e[1] !== "rtprev" && e[0] < T0 && q++ % 5 === 0) pai[x.id + "|" + e[1] + "|" + e[0] + "|" + e[3]] = Dm.addJ(e[0], 20); }));
S[E + "finances/paiements"] = { data: JSON.stringify(pai) };
// dossiers de référence (en cours au 06/10) en tête : les tests qui prennent « le premier patient avec une cure à venir » tombent sur eux
const REFS = ["PTA1", "PTA2", "PTA3", "PTK1", "PTESS", "PTCIOC"], estRef = (k) => REFS.some((r) => k.endsWith("/" + r));
const S2 = {}; Object.keys(S).filter((k) => !k.includes("/patients/")).forEach((k) => { S2[k] = S[k]; });
Object.keys(S).filter((k) => k.includes("/patients/") && estRef(k)).forEach((k) => { S2[k] = S[k]; });
Object.keys(S).filter((k) => !(k in S2)).forEach((k) => { S2[k] = S[k]; });
fs.writeFileSync(path.join(ICI, "seed-fictif.json"), JSON.stringify(S2));
const txt = texteTotaux(calculerBilan(res, [], pai, { per: "annee", hop: "tous" }, T0).tot);
fs.writeFileSync(path.join(ICI, "bilan_ref_fictif.txt"), txt + "\n");
console.log(n + " patients fictifs ; bilan 2026 du jeu fictif : " + txt.slice(0, 160));
