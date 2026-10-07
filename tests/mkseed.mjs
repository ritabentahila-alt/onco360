// Construit tests/seed.json (Onco360 simulé) depuis une sauvegarde JSON de l'ancienne application.
// node tests/mkseed.mjs 2026-10-06 chemin/ChimioHGC_Firebase_AAAA-MM-JJ.json
import fs from "fs";
import path from "path"; import { fileURLToPath } from "url";
const ICI = path.dirname(fileURLToPath(import.meta.url)), P = "file://" + path.join(ICI, "..", "public", "js") + "/";
const { separer, fusionner } = await import(P + "donnees/conversion.js");
const { tableDepuisV1 } = await import(P + "moteur/tarifs.js");
const { resume } = await import(P + "moteur/resume.js");
const { migrerV1, idsParDefaut } = await import(P + "donnees/migration.js");
const { evtsFin } = await import(P + "moteur/finances.js");
const { calculerBilan, texteTotaux } = await import(P + "moteur/bilan.js");
const D = JSON.parse(fs.readFileSync(process.argv[3] || path.join(ICI, "sauvegarde.json"), "utf8")).collections;
const T0 = process.argv[2] || "2026-10-06";
const J = (c, i, d) => { const x = D[c] && D[c][i]; return x && x.data != null ? JSON.parse(x.data) : d; };
const bib = {}; Object.values(D.protocoles).forEach((d) => JSON.parse(d.data).forEach((p) => { bib[p.id] = p; }));
const T = J("finances", "tarifs", null), pai = J("finances", "paiements", {}), ver = J("finances", "versements", []);
const cal = J("parametres", "calendrier", { feries: (T && T.feries) || [], abs: (T && T.abs) || [] }), listes = J("parametres", "listes", { cor: [], mut: [] });
const E = "espaces/cabinet-bentahila/", S = {};
S["espaces/cabinet-bentahila"] = { nom: "Cabinet Dr Bentahila", titulaire: "UIDRITA", actif: true };
S[E + "membres/UIDRITA"] = { role: "medecin", nom: "Dr Bentahila", email: "ritabentahila@gmail.com", actif: true, tousEtablissements: true, etablissements: ["HGC", "HCK", "CIOC"], droits: { identite: true, rendezvous: true, planningChimio: true, traitements: "modifier", radiotherapie: "modifier", administrer: true, creerPatient: true, supprimerPatient: true, finances: true, parametres: true } };
S["utilisateurs/UIDRITA"] = { email: "ritabentahila@gmail.com", nom: "BENTAHILA", prenom: "Rita", titre: "Dr", inpe: "061371266" };
for (const [c, n] of Object.entries({ HGC: "Hôpital Général de Casablanca", HCK: "Hôpital Cheikh Khalifa", CIOC: "Centre International d'Oncologie de Casablanca" })) S[E + "etablissements/" + c] = { code: c, nom: n, actif: true };
const table = tableDepuisV1(T, ["HCK"]);
S[E + "finances/tarifs"] = { data: JSON.stringify(table) }; S[E + "finances/paiements"] = { data: JSON.stringify(pai) }; S[E + "finances/versements"] = { data: JSON.stringify(ver) };
S[E + "parametres/calendrier"] = { data: JSON.stringify(cal) }; S[E + "parametres/listes"] = { data: JSON.stringify(listes) };
Object.entries(D.protocoles).forEach(([id, d]) => { S[E + "protocoles/" + id] = { data: d.data }; });
const ctxM = { aujourdhui: T0, bib, feries: cal.feries || [], nouvelId: idsParDefaut() }, ctx = { aujourdhui: T0, bib, feries: cal.feries || [], table };
const res = [];
for (const [id, v] of Object.entries(D.patients)) {
  const P0 = migrerV1(JSON.parse(v.data), ctxM); P0.id = id;
  const { patient, montants } = separer(P0); const P = fusionner(id, patient, null);
  S[E + "patients/" + id] = Object.assign({}, patient, { resume: JSON.stringify(resume(JSON.parse(JSON.stringify(P)), ctx)), version: 1 });
  S[E + "patientsFinances/" + id] = { etablissementId: patient.etablissementId, montantsJson: JSON.stringify(montants) };
  res.push({ id, nm: P.nom, cor: P.cor || "", fin: JSON.parse(JSON.stringify(evtsFin(P, montants, ctx))) });
}
fs.writeFileSync(path.join(ICI, "seed.json"), JSON.stringify(S));
const b = calculerBilan(res, ver, pai, { per: "annee", hop: "tous" }, T0);
console.log(Object.keys(D.patients).length, "dossiers ·", Object.keys(bib).length, "protocoles ·", texteTotaux(b.tot).slice(0, 60));
fs.writeFileSync(path.join(ICI, "bilan_ref.txt"), texteTotaux(b.tot));
