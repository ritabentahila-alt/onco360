// Tests des calculs de la salle d'attente, sans navigateur (SA7, 11/10/2026) : node tests/moteur/test-salle.mjs
// Jeu de test : tests/seed-fictif.json (S7, 24/10/2026 ; tests/seed.json, copie réelle hors dépôt, avec ONCO360_SEED=reel). Lignes du jour (rendez-vous, séances de chimio, venues déjà notées,
// séances reportées), onglets, période, recherche (nom, n° de dossier, téléphone), place dans la file, tri, durées.
import fs from "fs"; import path from "path"; import { fileURLToPath } from "url";
const ICI = path.dirname(fileURLToPath(import.meta.url)), P = "file://" + path.join(ICI, "..", "..", "public", "js") + "/";
const { fusionner } = await import(P + "donnees/conversion.js");
const S = await import(P + "moteur/salle.js");
let ok = 0, ko = 0;
const cas = (nom, v, detail) => { if (v) { ok++; console.log("  ✔ " + nom); } else { ko++; console.log("  ✘ " + nom + (detail !== undefined ? "\n      obtenu : " + JSON.stringify(detail) : "")); } };

const T0 = "2026-10-06", E = "espaces/cabinet-bentahila/";
const REEL = process.env.ONCO360_SEED === "reel", SEED = JSON.parse(fs.readFileSync(path.join(ICI, "..", REEL ? "seed.json" : "seed-fictif.json"), "utf8"));
const bib = {}; Object.keys(SEED).filter((k) => k.startsWith(E + "protocoles/")).forEach((k) => JSON.parse(SEED[k].data).forEach((p) => { bib[p.id] = p; }));
const cal = SEED[E + "parametres/calendrier"] ? JSON.parse(SEED[E + "parametres/calendrier"].data) : { feries: [] };
const ctx = { aujourdhui: T0, bib, feries: cal.feries || [] };
const patients = Object.keys(SEED).filter((k) => k.startsWith(E + "patients/")).map((k) => { const id = k.split("/").pop(), doc = JSON.parse(JSON.stringify(SEED[k])), Pt = fusionner(id, doc, null); return { id, doc, P: Pt, r: { nm: Pt.nom } }; });
const pat = (id) => patients.find((x) => x.id === id);
const [A1, A2, K1] = REEL ? ["P1790155538558", "P1790335106635", "P1790510171257"] : ["PTA1", "PTA2", "PTK1"]; // dossiers du jeu de test (HGC, HGC, HCK)
const hm = (ms) => { const d = new Date(ms); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); };

// Rendez-vous du jour ajoutés pour le test
pat(A1).P.rdvs.push({ id: "t1", type: "Suivi", d: T0, h: "09:30", st: "prevu", mo: "Résultats du scanner" });
pat(A2).P.rdvs.push({ id: "t2", type: "Annonce", d: T0, h: "11:00", st: "prevu", n: "Nouveau patient" }, { id: "t3", type: "Hospitalisation", d: T0, f: T0, st: "prevu" },
  { id: "t4", type: "Suivi", d: T0, h: "15:00", st: "reporte" }, { id: "t5", type: "Consultation 2nd avis chimiothérapie", act: "x2", d: T0, h: "16:00", st: "fait" });
pat(K1).P.rdvs.push({ id: "t6", type: "En cours de RT", d: T0, h: "10:30", st: "absent" }, { id: "t7", type: "Contrôle", d: T0, h: "08:15", st: "prevu" });

const DOCS = new Map();
const lig = (jours, o) => S.lignesSalle(Object.assign({ patients, jours, ctx, doc: (id) => DOCS.get(id), docs: DOCS.values(), voitChimio: true, consPaye: null }, o || {}));
const trouve = (L, pid, cle) => L.find((l) => l.pid === pid && l.cle === cle);

console.log("Lignes du jour");
let L = lig([T0]);
const r1 = trouve(L, A1, "r-t1"), r2 = trouve(L, A2, "r-t2"), r5 = trouve(L, A2, "r-t5"), r6 = trouve(L, K1, "r-t6"), r7 = trouve(L, K1, "r-t7");
cas("rendez-vous de suivi : type « Suivi », motif, heure", r1 && r1.type === "Suivi" && r1.motif === "Résultats du scanner" && r1.h === "09:30", r1 && [r1.type, r1.motif]);
cas("annonce : « Annonce », la note sert de motif", r2 && r2.type === "Annonce" && r2.motif === "Nouveau patient");
cas("activité des Paramètres : libellé raccourci (« 2nd avis chimio »)", r5 && r5.type === "2nd avis chimio", r5 && r5.type);
cas("consultation en cours de RT : « RT hebdo » ; contrôle : « Contrôle »", r6 && r6.type === "RT hebdo" && r7 && r7.type === "Contrôle");
cas("hospitalisation et rendez-vous reporté : absents de la salle", !trouve(L, A2, "r-t3") && !trouve(L, A2, "r-t4"));
cas("statut du rendez-vous : « Venu » → vu, « Non venu » → absent, prévu → à venir", r5.etat === "vu" && r6.etat === "absent" && r1.etat === "");
DOCS.set(S.idDoc(T0, A1, "r-t1"), { jour: T0, patientId: A1, cle: "r-t1", etat: "salle", arr: new Date(T0 + "T09:35:00").getTime(), ordre: 1 });
DOCS.set(S.idDoc(T0, A2, "r-t2"), { jour: T0, patientId: A2, cle: "r-t2", etat: "consult", arr: new Date(T0 + "T10:40:00").getTime(), deb: new Date(T0 + "T10:55:00").getTime() });
L = lig([T0]);
cas("étape notée dans la salle : en salle, en consultation", trouve(L, A1, "r-t1").etat === "salle" && trouve(L, A2, "r-t2").etat === "consult");
cas("onglets : à venir, salle, vus, absents", S.ongletDe(trouve(L, K1, "r-t7")) === "avenir" && S.ongletDe(trouve(L, A1, "r-t1")) === "salle" && S.ongletDe(trouve(L, A2, "r-t2")) === "salle" && S.ongletDe(r5) === "vus" && S.ongletDe(r6) === "absents");

console.log("Séances de chimiothérapie");
const L9 = lig(["2026-10-09"]), c15 = L9.find((l) => l.pid === A1 && l.chimio);
cas("séance prévue un jour donné (C1 J15 le 09/10)", c15 && c15.chimio.j === 15 && c15.chimio.n === 1 && c15.type === "Séance chimio" && c15.etat === "", c15 && c15.chimio);
cas("sans le droit de voir la chimio : aucune séance", !lig(["2026-10-09"], { voitChimio: false }).some((l) => l.chimio));
const L25 = lig(["2026-09-25"]), c1 = L25.find((l) => l.pid === A1 && l.chimio);
cas("jour passé, cure validée dans le dossier : « Vu » (venue déjà notée)", c1 && c1.etat === "vu" && c1.derive === true, c1 && [c1.etat, c1.chimio]);
const ctxJ = Object.assign({}, ctx, { aujourdhui: "2026-09-25" }), Lj = S.lignesSalle({ patients, jours: ["2026-09-25"], ctx: ctxJ, doc: () => null, docs: [], voitChimio: true, consPaye: null }).find((l) => l.pid === A1 && l.chimio);
cas("le jour même, cure validée mais consultation sans prix : pas encore « Vu »", Lj && Lj.etat === "", Lj && Lj.etat);
const Lp = S.lignesSalle({ patients, jours: ["2026-09-25"], ctx: ctxJ, doc: () => null, docs: [], voitChimio: true, consPaye: () => true }).find((l) => l.pid === A1 && l.chimio);
cas("le jour même, consultation de chimio payée : « Vu »", Lp && Lp.etat === "vu" && Lp.derive);
DOCS.set(S.idDoc("2026-10-02", A1, "c-Lzz-3-8"), { jour: "2026-10-02", patientId: A1, cle: "c-Lzz-3-8", etat: "absent", rep: "2026-10-09", motif: "FOLFOX · C3 J8" });
const o = lig(["2026-10-02"]).find((l) => l.orphelin);
cas("séance reportée après une absence : gardée dans « Absents » le jour d'origine", o && o.etat === "absent" && o.chimio.n === 3 && o.chimio.j === 8 && o.type === "Séance chimio");

console.log("Période, recherche");
const l0930 = trouve(L, A1, "r-t1"), l1500 = { h: "15:00", doc: {} }, lsans = { h: "", doc: {} }, larr = { h: "", doc: { arr: new Date(T0 + "T14:10:00").getTime() } };
cas("matinée : 09:30 oui, 15:00 non ; après-midi : l'inverse", S.dansPeriode(l0930, "matin", hm) && !S.dansPeriode(l1500, "matin", hm) && S.dansPeriode(l1500, "am", hm) && !S.dansPeriode(l0930, "am", hm));
cas("sans heure de rendez-vous : heure d'arrivée, sinon toujours affichée", S.dansPeriode(larr, "am", hm) && !S.dansPeriode(larr, "matin", hm) && S.dansPeriode(lsans, "matin", hm) && S.dansPeriode(lsans, "am", hm));
const xK = pat(K1), lk = { x: { r: { nm: "ÉLOUAFI Ténéré" }, P: { tel: "06 11 22 33 44" }, doc: { identite: { numero: "202610007" } } } };
cas("recherche par nom (accents et casse ignorés), plusieurs mots", S.correspond(lk, "elouafi") && S.correspond(lk, "tenere elou") && !S.correspond(lk, "alami"));
cas("recherche par n° de dossier", S.correspond(lk, "202610007") && S.correspond(lk, "2026100"));
cas("recherche par téléphone (chiffres seuls, avec ou sans 0)", S.correspond(lk, "0611") && S.correspond(lk, "2233") && !S.correspond(lk, "12"));
cas("recherche vide : tout le monde", S.correspond(lk, "") && xK);

console.log("Onglet d'ouverture (SA9a)");
cas("quelqu'un en salle : « En salle », même s'il reste des patients à venir", S.ongletOuverture({ avenir: 5, salle: 1, vus: 2, absents: 0 }) === "salle");
cas("personne en salle : premier onglet non vide (À venir, puis Vus, puis Absents)", S.ongletOuverture({ avenir: 5, salle: 0, vus: 2, absents: 1 }) === "avenir" && S.ongletOuverture({ avenir: 0, salle: 0, vus: 2, absents: 1 }) === "vus" && S.ongletOuverture({ avenir: 0, salle: 0, vus: 0, absents: 1 }) === "absents");
cas("journée vide : « À venir »", S.ongletOuverture({ avenir: 0, salle: 0, vus: 0, absents: 0 }) === "avenir");

console.log("File d'attente et tri");
const mk = (nm, h, etat, doc) => ({ x: { r: { nm } }, h, jour: T0, etat, doc: Object.assign({}, doc || {}) });
const at = (hh) => new Date(T0 + "T" + hh + ":00").getTime();
const a = mk("ALAMI", "09:00", "salle", { arr: at("09:20") }), b = mk("BENANI", "08:30", "salle", { arr: at("09:40") }), c = mk("CHAKIR", "10:00", "consult", { arr: at("09:50") }), d = mk("DRISSI", "", "salle", { arr: at("09:05") });
const noms = (l) => l.map((z) => z.x.r.nm).join(",");
cas("en salle, tri par heure de rendez-vous : en consultation d'abord, puis la file", noms(S.trierSalle([a, b, c, d], "salle", "rdv", hm)) === "CHAKIR,BENANI,ALAMI,DRISSI", noms(S.trierSalle([a, b, c, d], "salle", "rdv", hm)));
cas("tri par heure d'arrivée", noms(S.trierSalle([a, b, c, d], "salle", "arrivee", hm)) === "CHAKIR,DRISSI,ALAMI,BENANI", noms(S.trierSalle([a, b, c, d], "salle", "arrivee", hm)));
cas("tri alphabétique", noms(S.trierSalle([d, c, b, a], "salle", "alpha", hm)) === "CHAKIR,ALAMI,BENANI,DRISSI");
const a2 = mk("ALAMI", "09:00", "salle", { arr: at("09:20"), rang: S.cleNum(b, "rdv") - 60000 });
cas("ordre modifié à la main (↑) : rang avant son voisin", noms(S.trierSalle([a2, b, d], "salle", "rdv", hm)) === "ALAMI,BENANI,DRISSI");
const ch = Object.assign(mk("ZOUBIR", "", "", {}), { chimio: { j: 1 } });
cas("à venir : séances de chimio en tête, même sans heure", noms(S.trierSalle([a, ch, b], "avenir", "rdv", hm)).indexOf("ZOUBIR") === 0);
const v1 = mk("V1", "09:00", "vu", { fin: at("11:00") }), v2 = mk("V2", "10:00", "vu", { fin: at("10:30") });
cas("vus : dans l'ordre de fin de consultation", noms(S.trierSalle([v1, v2], "vus", "rdv", hm)) === "V2,V1");
cas("durées en hh:mm", S.hhmm(0) === "00:00" && S.hhmm(25) === "00:25" && S.hhmm(125) === "02:05" && S.hhmm(null) === "");
cas("identifiant d'une ligne : jour_patient_clé", S.idDoc(T0, "P1", "r-x") === "2026-10-06_P1_r-x");

console.log("Rapidité");
const t0 = Date.now(); for (let i = 0; i < 5; i++) lig(["2026-10-05", "2026-10-06", "2026-10-07", "2026-10-08", "2026-10-09", "2026-10-10", "2026-10-11"]);
const ms = (Date.now() - t0) / 5;
cas("lignes d'une semaine en moins de 200 ms (" + Math.round(ms) + " ms, " + patients.length + " dossiers)", ms < 200);

console.log("\n" + ok + " réussis, " + ko + " échoués");
if (ko) process.exit(1);
