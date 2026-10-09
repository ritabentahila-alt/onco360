// Onco360 – cabinet de démonstration (étape 9 S3, 09/10/2026). Logique pure, sans Firebase (tests : node functions/test-demo.js).
// 8 patients fictifs « PATIENT TEST 1…8 » : chimiothérapies en cours ou terminées, radiothérapies (scanner, contourage, dosimétrie,
// séances), rendez-vous passés et à venir, avec des dates relatives au jour de création (la démo reste toujours d'actualité :
// « Réinitialiser » la refait au jour près). Aucune donnée réelle : noms, téléphones, CIN et notes sont inventés.
const DEPART = require("./listes-depart.json");

const addJ = (d, n) => { const x = new Date(d + "T12:00:00Z"); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
const ETAB = { code: "DEMO", nom: "Clinique de démonstration", adresse: "Boulevard de la Démonstration", ville: "Casablanca", tel: "0522 00 00 00", actif: true };
// Grille tarifaire de démonstration (DH), mêmes activités que tarifs.js ACTIVITES
const ACTIVITES = [["annonce", "Consultation d'annonce", 500], ["suivi", "Consultation de suivi", 400], ["controle", "Consultation de contrôle", 300], ["cchimio", "Consultation de chimiothérapie", 400], ["seance", "Séance de chimiothérapie", 500], ["hospit", "Hospitalisation (par jour ouvré)", 400], ["rt", "Radiothérapie (tarif de l'acte)", null]];
const tarifsDemo = (T) => Object.assign({}, T || {}, { repli: "DEMO", etablissements: { DEMO: { activites: ACTIVITES.map(([type, libelle, brut]) => ({ type, libelle, historique: [{ depuis: "2000-01-01", brut, retro: type === "rt" ? 30 : 0, impot: ["seance", "hospit", "rt"].indexOf(type) >= 0 ? 10 : 0 }] })) } } });
const choisir = (liste, rx, sinon) => liste.find((x) => rx.test(x.nom || x)) || (sinon ? liste.find(sinon) : null) || null;
const diag = (rx, d) => DEPART.DIAG.find((x) => rx.test(x)) || d;

// Patients : protos = protocoles du cabinet (bibliothèque copiée) ; actes = actes de radiothérapie (tarifs) ; jour = AAAA-MM-JJ
function patientsDemo(protos, actes, jour) {
  const P = (protos || []).filter((p) => p && p.dr && p.dr.length), avecCycle = (p) => p.c > 0;
  const proto = (rx, cycle) => choisir(P, rx, cycle === false ? null : avecCycle) || P[0];
  const acte = (rx) => { const a = choisir(actes || [], rx); return (a && a.nom) || ((actes || [])[0] || {}).nom || "Radiothérapie conformationnelle"; };
  const mois = jour.slice(0, 7).replace("-", ""), now = new Date(jour + "T08:00:00Z").toISOString();
  let seq = 0; const id = (p) => p + jour.replace(/-/g, "") + String(++seq).padStart(3, "0");
  // Ligne de chimio : nb cures, dont « recues » faites (la dernière reçue il y a un cycle : la suivante tombe aujourd'hui)
  const ligne = (p, nb, recues, poids) => {
    const c = p.c || 0, j1 = c ? addJ(jour, -c * recues) : addJ(jour, -7), cures = [];
    for (let k = 0; k < (c ? nb : 1); k++) cures.push(k < recues ? { st: "recue", reelle: addJ(j1, k * c), valLe: now } : {});
    return { id: id("L"), protoId: p.id, pr: JSON.parse(JSON.stringify(p)), assoc: 0, j1, poids: String(poids), creat: "", crU: "mgL", cures };
  };
  const rdv = (type, d, h, st) => Object.assign({ id: id("r"), type, d, h, n: "", st }, st === "fait" ? { dv: d } : {});
  const rt = (a, o) => Object.assign({ id: id("RT"), acte: a, hop: "DEMO", nb: "25", ryt: "1", nbA: 1, vmat: true, note: "", cree: addJ(jour, -40) }, o);
  const valide = (d) => ({ le: d + "T10:00:00.000Z", par: "Dr Démo ONCO360" });
  const fiche = (n, sexe, age, d, poids, taille, notes) => ({
    identite: { nom: "PATIENT TEST " + n, nomF: "PATIENT TEST " + n, prenom: "", sexe, ddn: addJ(jour, -Math.round(age * 365.25)).slice(0, 4) + "-06-15", tel: "06000000" + String(n).padStart(2, "0"), mut: ["CNOPS", "CNSS", "AXA Assurance Maroc", "Wafa Assurance"][n % 4], cor: "", cin: "DEMO" + n, ald: "", numero: mois + String(n).padStart(3, "0") },
    clinique: { poids: String(poids), taille: String(taille), diag: d, notes: "Patient fictif de démonstration. " + notes },
  });
  const L = [];
  const ajoute = (f, o) => L.push({ id: id("P"), data: Object.assign({ etablissementId: "DEMO", lignesJson: JSON.stringify(o.lignes || []), planningJson: "{}", rdvsJson: JSON.stringify(o.rdvs || []), rtsJson: JSON.stringify(o.rts || []), version: 1 }, f) });
  // 1. Sein HER2+ : EC en cours (C3 aujourd'hui), consultation de suivi ce matin
  ajoute(fiche(1, "F", 52, diag(/HER2\+/, "Cancer du sein HER2+"), 64, 162, "EC puis taxane + trastuzumab."), { lignes: [ligne(proto(/^EC \(/), 4, 2, 64)], rdvs: [rdv("Annonce", addJ(jour, -50), "10:00", "fait"), rdv("Suivi", jour, "09:30", "prevu")] });
  // 2. Côlon métastatique : FOLFOX en cours
  ajoute(fiche(2, "H", 64, diag(/colorectal|côlon|colon/i, "Cancer colorectal métastatique"), 78, 174, "mFOLFOX6, évaluation après 6 cures."), { lignes: [ligne(proto(/^mFOLFOX6|FOLFOX/), 12, 3, 78)], rdvs: [rdv("Annonce", addJ(jour, -90), "11:00", "fait"), rdv("Contrôle", addJ(jour, 6), "15:00", "prevu")] });
  // 3. Sein RH+ : radiothérapie adjuvante en cours (dosimétrie validée)
  ajoute(fiche(3, "F", 45, diag(/RH\+/, "Cancer du sein RH+ / HER2−"), 59, 165, "Radiothérapie adjuvante après tumorectomie."), { rdvs: [rdv("Annonce", addJ(jour, -45), "09:00", "fait"), rdv("Suivi", addJ(jour, 3), "12:00", "prevu")],
    rts: [rt(acte(/sein/i), { scan: addJ(jour, -35), cont: addJ(jour, -30), contPar: "Dr Démo ONCO360", contLe: valide(addJ(jour, -30)).le, dosi: addJ(jour, -21), dosiPar: "Dr Démo ONCO360", dosiLe: valide(addJ(jour, -21)).le, deb: addJ(jour, -14) })] });
  // 4. Prostate : scanner de centrage fait, contourage à valider (tâche automatique), 1re séance dans 2 semaines
  ajoute(fiche(4, "H", 70, diag(/prostate/i, "Cancer de la prostate"), 82, 170, "Radiothérapie exclusive, hormonothérapie associée."), { rdvs: [rdv("Annonce", addJ(jour, -10), "10:30", "fait")],
    rts: [rt(acte(/prostate/i), { nb: "39", scan: addJ(jour, -3), deb: addJ(jour, 14), cree: addJ(jour, -10) })] });
  // 5. Ovaire : paclitaxel + carboplatine, bientôt la dernière cure
  ajoute(fiche(5, "F", 60, diag(/ovaire/i, "Cancer de l'ovaire"), 61, 158, "Après chirurgie de cytoréduction."), { lignes: [ligne(proto(/Paclitaxel \+ Carboplatine/i), 6, 5, 61)], rdvs: [rdv("Annonce", addJ(jour, -110), "10:00", "fait"), rdv("Suivi", addJ(jour, 21), "10:00", "prevu")] });
  // 6. Poumon : carboplatine + vinorelbine, début du traitement
  ajoute(fiche(6, "H", 58, diag(/poumon|CBNPC|bronch/i, "Cancer bronchique non à petites cellules"), 70, 176, "Stade IIIA, discussion en RCP."), { lignes: [ligne(proto(/Carboplatine \+ Vinorelbine/i), 4, 1, 70)], rdvs: [rdv("Annonce", addJ(jour, -25), "14:00", "fait")] });
  // 7. Sein triple négatif : consultation d'annonce demain (nouveau patient)
  ajoute(fiche(7, "F", 38, diag(/triple/i, "Cancer du sein triple négatif"), 55, 160, "Nouvelle patiente adressée pour prise en charge."), { rdvs: [rdv("Annonce", addJ(jour, 1), "09:30", "prevu")] });
  // 8. ORL : radiochimiothérapie (cisplatine hebdomadaire + radiothérapie en cours)
  ajoute(fiche(8, "H", 67, diag(/ORL|VADS|tête|cou|larynx|pharynx/i, "Cancer des VADS"), 68, 172, "Radiochimiothérapie concomitante."), { lignes: [ligne(proto(/Cisplatine 40.*hebdomadaire.*Radioth/i, false), 1, 1, 68)], rdvs: [rdv("Annonce", addJ(jour, -40), "11:30", "fait"), rdv("En cours de RT", addJ(jour, 2), "13:00", "prevu")],
    rts: [rt(acte(/ORL|VADS|tête|cou/i), { nb: "35", scan: addJ(jour, -28), cont: addJ(jour, -24), contPar: "Dr Démo ONCO360", contLe: valide(addJ(jour, -24)).le, dosi: addJ(jour, -16), dosiPar: "Dr Démo ONCO360", dosiLe: valide(addJ(jour, -16)).le, deb: addJ(jour, -7) })] });
  return L;
}
// Consultations de démonstration (journal du dossier)
function consultationsDemo(patients, jour, uid) {
  const p = (n) => patients[n - 1];
  const c = (n, d, titre, note) => ({ patientId: p(n).id, etablissementId: "DEMO", d, titre, note, lignes: [], o: Date.parse(d + "T10:00:00Z"), creePar: uid, creeParNom: "Dr Démo ONCO360", majPar: uid, majParNom: "Dr Démo ONCO360" });
  return [c(1, addJ(jour, -50), "Consultation d'annonce", "Patiente fictive. Annonce du diagnostic et du plan de traitement (exemple)."),
    c(1, addJ(jour, -21), "Consultation de chimiothérapie", "Bonne tolérance de la cure précédente (exemple)."),
    c(2, addJ(jour, -14), "Consultation de suivi", "Patient fictif. Neuropathie de grade 1 (exemple)."),
    c(6, addJ(jour, -25), "Consultation d'annonce", "Patient fictif. Dossier présenté en RCP (exemple).")];
}
module.exports = { addJ, ETAB, ACTIVITES, tarifsDemo, patientsDemo, consultationsDemo };
