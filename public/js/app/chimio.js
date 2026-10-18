// Onco360 – chimiothérapie dans le dossier, présentée comme dans l'application actuelle :
// « Traitement en cours », lignes en accordéon, tableau des cures, détail d'une cure (séances, honoraires, doses, molécules),
// protocole de la ligne, fiche HGC. Création d'un patient. Les calculs viennent du moteur v2 (inchangé).
import { doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "../config.js";
import { fusionner, separer } from "../donnees/conversion.js";
import { poidsActuel } from "../moteur/poids.js"; // R-A5 (18/10/2026)
import { statutLigne, ligneCourante } from "../moteur/resume.js";
import { etatLigne, protocoleDe, protocoleCure, seancesCure, seancesDe, dedupIds, joursDe, clairance, jourVersSeance, instantane, controleSeance, poidsAvant, poidsDebut, protocoleValide, REPERES, avecMolecule, reinSensible, reperesClairance, texteNiv, premed as premedP } from "../moteur/doses.js";
import { addJ, ecart, num, age } from "../moteur/outils.js";
import { tarif } from "../moteur/tarifs.js";
import { typeRdv, T_RTC } from "../moteur/rdv.js";
import { DIAG, MUT0, DICT } from "../donnees/listes.js";
import { poso, doseTxt, ficheHTML, imprimerFiche } from "./fiche.js";
import * as ficheP from "./fichepatient.js"; // fiche patient réglable (10/10/2026)
import { vigilances, historique, cumuls, examensProposes, EXAMENS, horsNorme, vesicant, notesPour } from "../moteur/vigilance.js"; // 12/10/2026
import { finRT } from "../moteur/rt.js";
import { noterHeures, seanceProposee, DU_SEANCE, DU_CONS } from "../moteur/heures.js"; // heures de la séance (12/10/2026)
import { notesVigilance, flaconsCabinet } from "./vigilances.js";
import { interactions, foie, arrondiFlacon, flaconsPour } from "../moteur/p10.js";
import { seuilsJour, hebdomadaire, SEUILS_HEBDO, risqueDe, libRisque } from "../moteur/seuils.js";

let A = null; // outils fournis par l'application (v2.js)
export function installer(api) { A = api; const f0 = window.fermerFenetre; window.fermerFenetre = () => { CM = null; f0(); }; }

const RAISONS = ["Patient absent", "Neutropénie", "Thrombopénie", "Infection", "Toxicité", "Décision médicale", "Autre"];
const D = () => A.D();
const trouver = (id) => D().patients.find((p) => p.id === id);
const lignesDe = (x) => JSON.parse(JSON.stringify(fusionner(x.id, x.doc, null).lignes || []));
const dateInput = (id, v) => '<input id="' + id + '" type="date" value="' + A.esc(v || "") + '">';
const fr2 = (v) => (v == null ? "" : Number(v).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
const SEL = { pid: null, l: null, c: null }; // ligne et cure ouvertes (comme l'application actuelle)
const MC = {}; // montants chargés par patient (droit « finances » uniquement)

// R-A5 (18/10/2026, demande du 17/10) : le poids de la fiche suit celui de la dernière séance : à chaque enregistrement de la chimio par
// quelqu'un qui a le droit d'écrire la fiche médicale, clinique.poids et clinique.poidsLe sont posés sur la fiche telle qu'elle est
// enregistrée (rien d'autre n'est touché) ; sans ce droit : au prochain enregistrement par quelqu'un qui l'a. Rien si la fiche est déjà à jour.
function cliniquePoids(x, apres, C0) {
  if (!(A.traitMod() || A.peut("fichePatient"))) return null;
  let pa = null; try { pa = poidsActuel(fusionner(x.id, Object.assign({}, x.doc, apres), null), D().ctx); } catch (e) { return null; }
  const C = Object.assign({}, C0 || x.doc.clinique || {}), n = (v) => parseFloat(String(v == null ? "" : v).replace(",", "."));
  if (!pa || pa.src !== "seance" || (n(C.poids) === pa.poids && C.poidsLe === pa.d)) return null;
  C.poids = String(pa.poids); C.poidsLe = pa.d; return C;
}
// ───── Enregistrement (dossier médical + planning séparés, comme les droits l'exigent) ─────
async function sauverLignes(x, lignes, quoi, extra) {
  const P = fusionner(x.id, x.doc, null); P.lignes = lignes; if (extra) Object.assign(P, extra);
  const { patient } = separer(P), changes = {};
  // Droit « planning » seul (secrétaire : déplacer, reporter) : seules les dates (planningJson) sont écrites ; les nouveaux
  // historiques de report y sont gardés aussi (rep, srep), le dossier médical (lignesJson) ne change pas
  if (!A.traitMod()) {
    const pl = JSON.parse(patient.planningJson), orig = JSON.parse(x.doc.lignesJson || "[]");
    lignes.forEach((L) => { const L0 = orig.find((z) => z.id === L.id) || { cures: [] };
      (L.cures || []).forEach((c, i) => { const c0 = L0.cures[i] || {}, n = i + 1, o = () => ((pl[L.id] = pl[L.id] || {})[n] = pl[L.id][n] || {});
        const r = (c.rep || []).slice((c0.rep || []).length); if (r.length) o().rep = r;
        Object.keys(c.sea || {}).forEach((j) => { const r2 = ((c.sea[j] || {}).rep || []).slice((((c0.sea || {})[j] || {}).rep || []).length); if (r2.length) { const z = o(); (z.srep = z.srep || {})[j] = r2; } }); }); });
    // poids validés par la secrétaire (poids, spoids, pv) : gardés tels quels
    const ancien = JSON.parse(x.doc.planningJson || "{}");
    Object.keys(ancien).forEach((lid) => Object.keys(ancien[lid] || {}).forEach((n) => { const a = ancien[lid][n] || {}; ["poids", "spoids", "pv"].forEach((f) => { if (a[f] != null) ((pl[lid] = pl[lid] || {})[n] = pl[lid][n] || {})[f] = a[f]; }); }));
    const pj = JSON.stringify(pl); if (pj === (x.doc.planningJson || "{}")) return;
    const cp = cliniquePoids(x, { planningJson: pj });
    await A.enregistrer(x, Object.assign({ planningJson: pj }, cp ? { clinique: cp } : {}), quoi); return;
  }
  if (patient.lignesJson !== x.doc.lignesJson) changes.lignesJson = patient.lignesJson;
  if (patient.planningJson !== x.doc.planningJson) changes.planningJson = patient.planningJson;
  // 12/10/2026 : les valeurs passées (ex. poids d'une nouvelle ligne) sont posées sur la fiche médicale telle qu'elle est enregistrée, sans
  // la reconstruire par `separer` (qui rangeait dans _autres les champs ajoutés, l'allergie, le statut, et perdait identite.extra)
  if (extra) { const C = Object.assign({}, x.doc.clinique || {}, extra); if (JSON.stringify(C) !== JSON.stringify(x.doc.clinique || {})) changes.clinique = C; }
  const cp = cliniquePoids(x, changes, changes.clinique); if (cp) changes.clinique = cp; // R-A5
  if (!Object.keys(changes).length) return;
  await A.enregistrer(x, changes, quoi);
}
// Heures d'une séance (12/10/2026, décision de Dr Bentahila, moteur/heures.js) : o = { cons: "HH:MM" | "" } (consultation, médecin ou
// secrétaire) ou { seance: { h, du } | null } (séance à l'hôpital de jour, infirmière) ; j = 1 pour la cure (J1). Champ « heures » du
// dossier : chacun note sa partie sans toucher aux dates ni à la partie de l'autre (l'infirmière n'écrase jamais l'heure du médecin)
export async function heureSeance(x, lid, n, j, o) {
  const L = lignesDe(x).find((z) => z.id === lid); if (!L || !L.cures[n - 1]) throw new Error("Séance introuvable.");
  const H = Object.assign({}, x.doc.heures || {}), cle = lid + "|" + n + "|" + j;
  H[cle] = noterHeures(H[cle], o, { par: D().u.uid, parNom: (D().membre && D().membre.nom) || "", le: new Date().toISOString() });
  const quoi = o.cons !== undefined ? (o.cons ? "consultation à " + o.cons : "heure de consultation retirée") : o.seance ? "séance à " + o.seance.h + " (" + o.seance.du + " min)" : "heure de séance retirée";
  await A.enregistrer(x, { heures: H }, "C" + n + " J" + j + " : " + quoi);
}
export const peutHeureChimio = () => A.traitMod() || A.peut("planningChimio") || A.peut("administrer");
// L'infirmière note la séance (heure et durée) ; le médecin et la secrétaire, la consultation (sans voir la durée de la chimio)
export const estInfirmiere = () => !!(D().membre && D().membre.role === "infirmiere");
const DUREES_H = [30, 45, 60, 90, 120, 150, 180, 240, 300, 360, 480];
const libDuree = (m) => (m < 60 ? m + " min" : Math.floor(m / 60) + " h" + (m % 60 ? " " + (m % 60) : ""));
// Bouton d'heure d'une séance prévue (tableau de la cure) : o = la cure (J1) ou c.sea[j]
const boutonHeure = (x, i, k, j, o) => {
  const inf = estInfirmiere(), hc = o && o.hc, hr = o && o.hr;
  // 4.3 : icônes dessinées (seringue = séance de l'infirmière, stéthoscope = consultation du médecin)
  const [ico, lib] = inf ? (hr && hr.h ? ["seringue", hr.h + " · " + libDuree(+hr.du || DU_SEANCE)] : hc && !hc.auto ? ["stetho", hc.h + " · + séance"] : ["", "+ heure"]) : hc ? ["stetho", hc.h] : ["", "+ heure"];
  if (!peutHeureChimio()) return hc && !inf ? ' <span class="mesures">' + A.ic("stetho") + A.esc(hc.h) + "</span>" : "";
  return ' <button class="bt petit clair" style="margin-top:4px" title="' + (inf ? "Heure et durée de la séance (hôpital de jour)" : "Heure de la consultation de chimio") + '" onclick="chHeure(\'' + x.id + "'," + i + "," + k + "," + j + ')">' + (ico ? A.ic(ico) : "") + A.esc(lib) + "</button>";
};
// Fenêtre des heures d'une séance (s = { k, j, d, o }) : infirmière → heure et durée de la séance ; médecin, secrétaire → consultation.
// `puis` : appelée à la fermeture (ex. fenêtre de prix après une validation)
// Clé de la consultation d'une séance dans le résumé (moteur/agenda.js) : J1 = « pid|c|ligne|cure », J8… = « pid|s|ligne|cure|jour »
const cleSeance = (x, lid, n, j) => { const i = x.P.lignes.findIndex((z) => z.id === lid); return x.id + (j > 1 ? "|s|" + i + "|" + n + "|" + j : "|c|" + i + "|" + n); };
export function fenetreHeureSeance(x, lid, s, titre, puis) {
  const esc = A.esc, inf = estInfirmiere(), o = s.o || {}, hc = o.hc, hcm = o.hcm, hr = o.hr, fin = () => { A.fermerFenetre(); if (puis) puis(); else A.pageDossier(x.id); };
  const par = (z) => (z && z.parNom ? " (" + esc(z.parNom) + (z.le ? ", le " + A.dfrA(String(z.le).slice(0, 10)) : "") + ")" : "");
  let corps;
  if (inf) {
    const du = (hr && +hr.du) || DU_SEANCE, h0 = (hr && hr.h) || seanceProposee(hc && !hc.auto ? hc : null);
    corps = '<p class="mesures">' + (hc && !hc.auto ? A.ic("stetho") + "Consultation du médecin à <b>" + esc(hc.h) + "</b>" + par(hcm) + " : la séance se place après." : "Pas d'heure de consultation choisie par le médecin : elle se placera d'elle-même juste avant votre séance.") + "</p>" +
      '<div class="form"><div><label for="hS">Heure de la séance (hôpital de jour)</label><input id="hS" type="time" step="900" value="' + esc(h0 || "") + '"></div>' +
      '<div><label for="hDu">Durée prévue</label><select id="hDu">' + DUREES_H.concat(DUREES_H.indexOf(du) < 0 ? [du] : []).sort((a, z) => a - z).map((m) => '<option value="' + m + '"' + (m === du ? " selected" : "") + ">" + libDuree(m) + "</option>").join("") + "</select></div></div>" +
      (hr && hr.parNom ? '<p class="mesures">Séance notée' + par(hr) + ".</p>" : "") + '<p class="mesures">La durée n\'apparaît que dans le planning de l\'infirmière.</p>';
  } else {
    corps = '<div class="form"><div><label for="hS">Heure de la consultation (facultative)</label><input id="hS" type="time" step="900" value="' + esc((hcm && hcm.h) || "") + '"></div></div>' +
      (hcm ? '<p class="mesures">Notée' + par(hcm) + ".</p>" : hc && hc.auto ? '<p class="mesures">Placée pour l\'instant à ' + esc(hc.h) + " d'après l'heure de la séance notée par l'infirmière ; une heure choisie ici passe avant.</p>" : "") +
      '<p class="mesures">Affichée dans votre planning (et Google Agenda). L\'infirmière ajoute ensuite l\'heure et la durée de la séance, après la consultation, sans changer votre heure. Pour changer le jour : « Reporter ».</p>';
  }
  const aSup = inf ? hr && hr.h : hcm && hcm.h;
  A.fenetre("<h3>" + titre + '</h3><p class="sous">' + esc(x.r.nm) + " · C" + (s.k + 1) + (s.j > 1 ? " J" + s.j : "") + " · <b>" + A.cap(A.jourLong(s.d)) + " " + s.d.slice(0, 4) + "</b></p>" + corps +
    '<div class="boutons"><button class="bt gris" id="hNon">' + (puis ? "Plus tard" : "Fermer") + "</button>" + (aSup ? '<button class="bt clair" id="hSup">Retirer l\'heure</button>' : "") + '<button class="bt plein" id="hOk">Enregistrer</button></div>');
  const ok = document.getElementById("hOk"), sup = document.getElementById("hSup");
  document.getElementById("hNon").onclick = fin;
  const noter = async (q, bt) => { A.occupe(bt, true); try { await heureSeance(trouver(x.id), lid, s.k + 1, s.j, q); A.toast("Enregistré."); fin(); } catch (e) { A.occupe(bt, false); A.toast(e.message); } };
  const retirer = inf ? { seance: null } : { cons: "" };
  ok.onclick = () => { const h = A.val("hS"); if (!h) { if (aSup) noter(retirer, ok); else fin(); return; }
    if (!inf && h !== ((hcm && hcm.h) || "") && !A.conflitAccepte(s.d, h, (hcm && +hcm.du) || DU_CONS, { pid: x.id, k: cleSeance(x, lid, s.k + 1, s.j) })) return; // R-A3 : créneau déjà pris
    noter(inf ? { seance: { h, du: +A.val("hDu") || DU_SEANCE } } : { cons: h }, ok); };
  if (sup) sup.onclick = () => noter(retirer, sup);
}
// « Modifier » d'une séance depuis « Rendez-vous et tâches à venir » (12/10/2026, demande de Dr Bentahila ; plus de fenêtre après la
// validation) : date (droit traitements ou planning) et heure de la consultation ; date changée → « cette date seulement » ou « toute la
// suite » (comme dans la cure) ; l'infirmière : sa séance à l'hôpital de jour (heure et durée)
window.chModifierRdvChimio = (pid, lid, n, j, apres, pre) => { // apres : retour (agenda, 3.16), sinon le dossier ; pre { d, h } : glissé dans l'agenda
  const x = trouver(pid), i = x ? x.P.lignes.findIndex((z) => z.id === lid) : -1; if (i < 0) return;
  const L = x.P.lignes[i], k = n - 1, e = etatLigne(L, x.P, D().ctx)[k]; if (!e) return;
  const sz = j > 1 ? seancesCure(L, e, D().ctx.bib).find((z) => z.j === j) : null, d0 = j > 1 ? sz && sz.prevue : e.date, o = j > 1 ? (e.c.sea || {})[j] || {} : e.c;
  if (!d0) return;
  if (estInfirmiere()) { fenetreHeureSeance(x, lid, { k, j, d: d0, o }, "Séance à l'hôpital de jour", apres || (() => A.pageDossier(pid))); return; }
  const okD = A.traitMod() || A.peut("planningChimio"), hcm = o.hcm, hc = o.hc, rid = j > 1 ? "sS" : "dS";
  A.fenetre("<h3>C" + n + (j > 1 || seancesDe(protocoleCure(L, k, D().ctx.bib) || protocoleDe(L, D().ctx.bib)).length > 1 ? " J" + j : "") + " – " + A.esc(x.r.nm) + '</h3><p class="sous">Consultation de la séance de chimiothérapie</p><div class="form">' +
    '<div><label for="mD">Date</label><input id="mD" type="date" value="' + A.esc(d0) + '"' + (okD ? "" : " disabled") + "></div>" +
    '<div><label for="mH">Heure de la consultation (facultative)</label><input id="mH" type="time" step="900" value="' + A.esc((hcm && hcm.h) || "") + '"></div>' +
    (okD ? '<div class="large cache" id="mSz">' + choixSuite(rid, "La date change", "suite").replace('<div class="large">', "<div>") + "</div>" : "") + "</div>" +
    (hc && hc.auto ? '<p class="mesures">Placée pour l\'instant à ' + A.esc(hc.h) + " d'après la séance notée par l'infirmière ; une heure choisie ici passe avant.</p>" : "") +
    '<div class="err" id="fErr"></div><div class="boutons"><button class="bt gris" onclick="fermerFenetre()">Annuler</button><button class="bt plein" id="fOk">Enregistrer</button></div>');
  if (okD) document.getElementById("mD").oninput = () => document.getElementById("mSz").classList.toggle("cache", A.val("mD") === d0);
  if (pre && okD) { document.getElementById("mD").value = pre.d; if (pre.h) document.getElementById("mH").value = pre.h; document.getElementById("mSz").classList.toggle("cache", pre.d === d0); }
  document.getElementById("fOk").onclick = async () => {
    const d = A.val("mD"), h = A.val("mH"); if (!d) { A.erreur("Indiquez la date."); return; }
    if (h && (d !== d0 || h !== ((hcm && hcm.h) || "")) && !A.conflitAccepte(d, h, (hcm && +hcm.du) || DU_CONS, { pid, k: cleSeance(x, lid, n, j) })) return; // R-A3 : créneau déjà pris
    A.occupe(document.getElementById("fOk"), true);
    try {
      if (okD && d !== d0) {
        if (j > 1) await majSeance(x, i, k, j, d, false);
        else { const lignes = lignesDe(x), L2 = lignes[i], E2 = etatLigne(L2, x.P, D().ctx); if (choix("dS") === "seule") figerSuivantes(L2, k, E2); else libererSuivantes(L2, k); L2.cures[k].fixe = d; await sauverLignes(x, lignes, "C" + n + " déplacée au " + A.dfrA(d)); }
      }
      if (h !== ((hcm && hcm.h) || "")) await heureSeance(trouver(pid), lid, n, j, { cons: h });
      A.fermerFenetre(); A.toast("Enregistré."); if (apres) apres(); else A.pageDossier(pid);
    } catch (er) { A.occupe(document.getElementById("fOk"), false); A.erreur(er.message); }
  };
};
// Bouton d'heure du tableau de la cure
window.chHeure = (id, i, k, j) => {
  const x = trouver(id), L = x && x.P.lignes[i]; if (!L) return;
  const e = etatLigne(L, x.P, D().ctx)[k], s = j === 1 ? { k, j: 1, d: e.date, o: e.c } : (() => { const z = seancesCure(L, e, D().ctx.bib).find((o) => o.j === j); return z ? { k, j, d: z.prevue, o: (e.c.sea || {})[j] || {} } : null; })();
  if (!s || !s.d) { A.toast("Date de la séance inconnue."); return; }
  const cm = CM; fenetreHeureSeance(x, L.id, s, estInfirmiere() ? "Séance à l'hôpital de jour" : "Consultation de la séance de chimio", () => { const y = trouver(id); if (cm && y) { CM = cm; A.pageDossier(id); ouvrirCure(); } else A.pageDossier(id); });
};
async function chargerMontants(x) {
  if (!A.peut("finances")) return null;
  if (MC[x.id]) return MC[x.id];
  const s = await getDoc(doc(db, "espaces", A.ESPACE, "patientsFinances", x.id)).catch(() => null);
  MC[x.id] = s && s.exists() && s.data().montantsJson ? JSON.parse(s.data().montantsJson) : { rdv: {}, rt: {}, cures: {} };
  MC[x.id].cures = MC[x.id].cures || {}; MC[x.id].rt = MC[x.id].rt || {};
  return MC[x.id];
}
export async function majMontants(x, fn) {
  if (!A.peut("finances")) return;
  delete MC[x.id]; // relus juste avant d'écrire : un prix changé entre-temps par la secrétaire (prixConsultation) n'est pas écrasé
  const M = await chargerMontants(x); fn(M);
  await setDoc(doc(db, "espaces", A.ESPACE, "patientsFinances", x.id), { etablissementId: x.doc.etablissementId || "", montantsJson: JSON.stringify(M) }, { merge: true });
  await ecrireEncaissements(x, M).catch((e) => console.warn("encaissements", e));
  if (A.planifierReleve) A.planifierReleve(); // relevé du comptable mis à jour (étape 9 S2)
}
// ───── Prix à encaisser (droit « encaissements », secrétaire) : extrait des montants, sans les honoraires ni la radiothérapie ─────
// encaissements/{patient} = { etablissementId, data: { rdv: { idRdv: { m } | { tj } }, cons: { "ligne|n": { m, d, lib, n } } } }
// Consultation des jours de chimio validés « Venu » (fenêtre de prix des rendez-vous de chimio, 07/10/2026) : { "1": 250, "8": 0 }.
// Ancien fonctionnement (case « Consultation encaissée », cons.enc) = une validation au jour cons.jour (J1 par défaut).
export function consJours(c) {
  if (!c) return {};
  if (c.consJ) return c.consJ;
  if (c.cons && c.cons.enc) { const j = c.cons.jour && c.cons.jour !== "autre" ? String(c.cons.jour) : "1"; return { [j]: c.cons.m == null ? null : num(c.cons.m) }; }
  return {};
}
// Total pour le bilan (inchangé : une « consultation chimio » par cure, comptée si payée)
function majCons(cc) {
  const v = Object.entries(cc.consJ || {}), tot = v.reduce((s2, [, m]) => s2 + (num(m) || 0), 0), j0 = (v.find(([, m]) => (num(m) || 0) > 0) || v[0] || ["1"])[0];
  cc.cons = tot > 0 ? { enc: true, m: tot, jour: j0 } : { enc: false, m: 0 };
}
// Prix repris de l'ancienne application (v1) : montant reçu, net d'impôt (ex. HCK 225 DH pour 250 DH brut). À l'écran, on
// affiche le brut (b) quand le montant est exactement le net du tarif de ce jour-là (08/10/2026) ; le bilan ne change pas.
function brutV1(x, rid, m) {
  const r = ((x.P && x.P.rdvs) || []).find((v) => v.id === rid), T = D().tarifs; if (!r || !T || m == null) return {};
  const t = r.act || typeRdv(r.type); if (t === "hospit" || r.type === T_RTC) return {};
  // établissement du patient d'abord, puis les autres (consultation faite ailleurs, patient rattaché depuis à un autre hôpital)
  const etabs = [x.doc.etablissementId].concat(Object.keys(T.etablissements || {}).filter((c) => c !== x.doc.etablissementId));
  for (const e of etabs) {
    const v = tarif(T, e, t, r.dv || r.d); if (!v || v.brut == null) continue;
    const n = v.brut * (1 - (v.retro || 0) / 100) * (1 - (v.impot || 0) / 100);
    if (Math.abs(n - m) < 0.51 && v.brut !== m) return { b: v.brut };
  }
  return {};
}
export function construireEncaissements(x, M) {
  const E = { rdv: {}, cons: {} };
  Object.entries((M && M.rdv) || {}).forEach(([rid, o]) => {
    if (!o) return;
    if (o.v1 && o.prix != null) E.rdv[rid] = Object.assign({ m: num(o.prix), v1: true }, brutV1(x, rid, num(o.prix))); else if (o.tj != null) E.rdv[rid] = { tj: num(o.tj) }; else if (o.brut != null) E.rdv[rid] = Object.assign({ m: num(o.brut) }, o.mode ? { mode: o.mode } : {});
  });
  const lignes = (x.P && x.P.lignes) || [];
  Object.entries((M && M.cures) || {}).forEach(([lid, cs]) => Object.entries(cs || {}).forEach(([n, c]) => {
    const J = consJours(c); if (!Object.keys(J).length) return;
    const L = lignes.find((z) => z.id === lid), cu = L && L.cures[n - 1];
    let lib = "", e = null, sea = [];
    try { lib = L ? protocoleDe(L, D().ctx.bib).nom : ""; e = L ? etatLigne(L, x.P, D().ctx)[n - 1] : null; sea = e ? seancesCure(L, e, D().ctx.bib) : []; } catch (er) {}
    Object.entries(J).forEach(([j, m]) => {
      let d = +j === 1 ? (cu && cu.reelle) || (e && e.date) : ((sea.find((z) => z.j === +j) || {}).d || (sea.find((z) => z.j === +j) || {}).prevue);
      if (c.cons && c.cons.jour === "autre" && !c.consJ) d = c.cons.date || d;
      E.cons[lid + "|" + n + "|" + j] = Object.assign({ m: m == null ? null : num(m), d: d || "", lib, n: +n, j: "J" + j }, (c.consModeJ || {})[j] ? { mode: c.consModeJ[j] } : {});
    });
  }));
  return E;
}
export async function ecrireEncaissements(x, M) {
  const E = construireEncaissements(x, M); EC[x.id] = E;
  await setDoc(doc(db, "espaces", A.ESPACE, "encaissements", x.id), { etablissementId: x.doc.etablissementId || "", data: JSON.stringify(E) });
}
const EC = {}; // prix à encaisser chargés par patient : objet, ou null si absent / refusé
export const oublierEncaissements = (id) => { delete EC[id]; };
export function encaissementsDe(x, quandCharge) {
  if (x.id in EC) return EC[x.id];
  getDoc(doc(db, "espaces", A.ESPACE, "encaissements", x.id)).then((s) => { const E = s.exists() ? JSON.parse(s.data().data || "{}") : null; if (E && E.cons) Object.keys(E.cons).forEach((k) => { if (k.split("|").length === 2) { const c = E.cons[k]; delete E.cons[k]; E.cons[k + "|" + String(c.j || "J1").replace("J", "")] = c; } }); EC[x.id] = E; }).catch(() => { EC[x.id] = null; }).then(() => quandCharge && quandCharge());
  return undefined;
}
const tarifDe = (x, cle, date) => { const T = D().tarifs || D().tarifsC; if (!T) return null; const t = tarif(T, x.doc.etablissementId, cle, date); return t ? t.brut : null; };
// ───── Petits outils d'affichage ─────
const b = (lib, fn, cls) => '<button class="mini ' + (cls || "") + '" onclick="' + fn + '">' + lib + "</button>";
// 3.7 (12/10/2026) : menu ⋯ (actions secondaires : reporter, annuler, rétablir, arrêter ou supprimer la ligne) ; un seul ouvert à la fois
const menu3 = (l) => { const h = l.filter(Boolean).join(""); return h ? '<details class="m3"><summary class="mini" title="Autres actions" aria-label="Autres actions">⋯</summary><div class="m3-l">' + h + "</div></details>" : ""; };
document.addEventListener("click", (ev) => document.querySelectorAll("details.m3[open]").forEach((d) => { if (!d.contains(ev.target)) d.removeAttribute("open"); }));
// Cure d'un seul jour : ouverte directement sur la séance (plus de fenêtre intermédiaire, 3.7)
const unSeulJour = (L, k) => groupes(protocoleCure(L, k, D().ctx.bib) || protocoleDe(L, D().ctx.bib)).length <= 1;
// Statut d'une cure : « J1 et J8 reçues · J15 à valider », puis « C2 terminée » quand toutes les séances sont reçues
const etiqJ = (l) => l.length === 1 ? l[0] + " reçue" : l.slice(0, -1).join(", ") + " et " + l[l.length - 1] + " reçues";
const badgeCure = (e) => {
  if (e.st === "recue") {
    const g = e.g || [{ j: 1 }], sea = e.c.sea || {}, rec = ["J1"], att = [];
    g.slice(1).forEach((z) => { const st = sea[z.j] && sea[z.j].st; if (st === "recue") rec.push("J" + z.j); else if (st !== "annulee") att.push("J" + z.j); });
    if (!att.length) return '<span class="badge b-ch"><svg class="pi"><use href="#i-check"/></svg>C' + e.n + " terminée</span>";
    return '<span class="badge b-ch"><svg class="pi"><use href="#i-check"/></svg>' + etiqJ(rec) + '</span> <span class="badge b-co"><svg class="pi"><use href="#i-horloge"/></svg>' + att[0] + " à valider</span>";
  }
  if (e.st === "annulee") return '<span class="badge b-al">✖ Annulée</span>';
  if (e.c.rep && e.c.rep.length) return '<span class="badge b-or">↪ Reportée</span>';
  return '<span class="badge b-gr"><svg class="pi"><use href="#i-horloge"/></svg>Prévue</span>';
};
const libStatut = (st) => (st.code === "stop" ? '<svg class="pi"><use href="#i-stop"/></svg>Arrêtée le ' + A.dfrA(st.fin) : st.code === "fin" ? '<svg class="pi"><use href="#i-check"/></svg>Terminée' : '<i class="dot v"></i>En cours');
const periode = (st, p) => p.c ? A.dfrA(st.deb) + " → " + (st.fin ? A.dfrA(st.fin) : st.pend.length ? A.dfrA(st.pend[st.pend.length - 1].date) : "…") : "Depuis le " + A.dfrA(st.deb) + (st.fin ? " → " + A.dfrA(st.fin) : "");
// État d'une cure calculé avec SON protocole (molécules ajoutées/retirées, « tous les n cycles »)
function etatCure(L, k, P) {
  const q = protocoleCure(L, k, D().ctx.bib) || protocoleDe(L, D().ctx.bib);
  return { q, e: etatLigne(L, P, D().ctx)[k] };
}

// ───── Affichage de la section chimiothérapie ─────
export function htmlChimio(x) {
  notesVigilance(); // notes « À vérifier » lues avant d'ouvrir une séance
  const P = x.P, ctx = D().ctx, okT = A.traitMod(), esc = A.esc, q1 = "'" + x.id + "'";
  if (!(P.lignes || []).length && !okT) return "";
  // à l'ouverture du dossier : la ligne en cours, sinon la dernière ; les autres fermées (11/10/2026)
  if (SEL.pid !== x.id) { SEL.pid = x.id; const lc = ligneCourante(P, ctx); SEL.l = lc != null ? lc : (P.lignes || []).length ? P.lignes.length - 1 : null; SEL.c = null; }
  let h = '<section class="carte" id="cChimio"><div class="entete"><h3><span class="ic">' + A.ic("seringue") + '</span>Chimiothérapie</h3>' + (okT ? '<button class="bt clair petit" onclick="chNouvelleLigne(' + q1 + ')">' + A.ic("plus") + "Nouvelle ligne chimio</button>" : "") + "</div>";
  if (!(P.lignes || []).length) h += '<p class="sous">Aucune ligne de chimiothérapie.</p>';
  (P.lignes || []).forEach((L, i) => {
    // 3.7 (12/10/2026) : l'intention de la ligne (« Métastatique · 2e ligne »…) à la place de « Chimio · ligne n » ; en-tête raccourci (plus de
    // « Protocole : », date de début une seule fois : dans la période à droite)
    const s = statutLigne(L, P, ctx), p = protocoleDe(L, ctx.bib), ouv = SEL.l === i, tag = libIntention(L) || (L.assoc ? "Associé · ligne " : "Chimio · ligne ") + (i + 1);
    const cur = p.c ? (s.next ? "C" + s.next.n + "/" + L.cures.length : "C" + L.cures.length + "/" + L.cures.length) : "";
    h += '<div class="acc' + (ouv ? " on" : "") + '"><div class="acc-t" onclick="chTog(' + q1 + "," + i + ')"><span><b class="tag">' + (ouv ? "▾" : "▸") + " [" + esc(tag) + "]</b> <b>" + esc(p.nom) + "</b>" + (cur ? " | " + cur : "") + (s.code === "cours" && s.next ? " | Prochaine : <b>" + A.dfrA(s.next.date) + "</b>" : "") + '</span><span class="st">' + periode(s, p) + " &nbsp; " + libStatut(s) + "</span></div>" +
      (ouv ? vueLigne(x, i) : "") + "</div>";
  });
  return h + "</section>";
}
function vueLigne(x, i) {
  const P = x.P, ctx = D().ctx, L = P.lignes[i], s = statutLigne(L, P, ctx), p = protocoleDe(L, ctx.bib), esc = A.esc, okT = A.traitMod(), okPl = okT || A.peut("planningChimio");
  const auc = (p.dr || []).some((d) => /AUC/.test(d.u)), ql = "'" + x.id + "'," + i;
  // 3.7 : plus de titre « Ligne 1 — protocole » (déjà dans l'en-tête de la ligne) ; « Arrêter la ligne » et « Supprimer » dans le menu ⋯
  let h = '<div class="acc-c"><div class="actr" style="justify-content:flex-start;margin-bottom:8px">' + b("Voir / modifier le protocole", "chProto(" + ql + ")") + (okT ? b(L.intent ? "Intention : " + esc(libIntention(L)) : "Intention de la ligne", "chIntention(" + ql + ")") : "") +
    (okT ? (p.c && !L.arret ? b("+ 1 cure", "chAjouterCure(" + ql + ")") : "") + menu3([L.arret ? b("Reprendre la ligne", "chReprendre(" + ql + ")") : b("Arrêter la ligne", "chArreter(" + ql + ")", "rouge"), b("Supprimer la ligne", "chSupprLigne(" + ql + ")", "rouge")]) : "") + "</div>" +
    (L.arret ? '<p class="st" style="color:var(--rouge);margin:0 0 6px">Arrêtée le ' + A.dfrA(L.arret.date) + " – " + esc(L.arret.raison || "") + (L.arret.com ? " (" + esc(L.arret.com) + ")" : "") + "</p>" : "") +
    '<div class="tableau"><table class="tcures tsea"><tr><th>Cure</th><th>Date prévue</th><th>Date réalisée</th><th>Statut</th><th>Poids</th>' + (auc ? "<th>Clairance</th>" : "") + "<th>S.C</th><th></th></tr>";
  s.E.forEach((e, k) => {
    const pend = e.st === "prevue", qc = ql + "," + k;
    h += "<tr" + (SEL.c === k ? ' class="sel"' : "") + '><td data-l="Cure"><b>C' + e.n + '</b></td><td data-l="Date prévue">' + (pend && okPl && !L.arret ? '<input type="date" value="' + esc(e.prevue || "") + '" onchange="chDate(' + qc + ',this.value)">' : A.dfrA(e.prevue)) + (pend && e.prevue && !L.arret ? boutonHeure(x, i, k, 1, e.c) : "") + // heure de la consultation (3.7)
      (e.c.rep && e.c.rep.length ? '<div class="mesures">' + e.c.rep.map((r) => "reportée du " + A.dfrA(r.de) + " (" + esc(r.raison) + ")").join("<br>") + "</div>" : "") + "</td>" +
      '<td data-l="Réalisée le">' + (e.st === "recue" ? A.dfrA(e.c.reelle) : "—") + '</td><td data-l="Statut">' + badgeCure(e) + (e.st === "annulee" && e.c.ann ? '<div class="mesures">' + esc(e.c.ann.raison || "") + (e.c.ann.com ? " – " + esc(e.c.ann.com) : "") + "</div>" : "") + "</td>" +
      '<td data-l="Poids">' + (e.poids || "") + "</td>" + (auc ? '<td class="calc" data-l="Clairance">' + (e.cl ? e.cl + " ml/min" : "") + "</td>" : "") + '<td class="calc" data-l="S.C">' + (e.sc ? fr2(e.sc) : "") + "</td>" +
      // 3.14 (12/10/2026) : « Ouvrir » toujours en bouton principal ; « Valider », « Reporter », « Annuler » dans ⋯
      '<td class="act"><div class="btns">' + b("Ouvrir", "chOuvrir(" + qc + ")", "fonce") +
        menu3(okT ? (pend ? [b('<svg class="pi"><use href="#i-check"/></svg>Valider', "chValider(" + qc + ")", "vert"), b("↪ Reporter", "chReporter(" + qc + ")", "orange"), b("✖ Annuler la cure", "chAnnuler(" + qc + ")", "rouge")] : [b(e.st === "recue" ? "Annuler la validation" : "Rétablir", "chRetablir(" + qc + ")")]) : pend && okPl && !L.arret ? [b("↪ Reporter", "chReporter(" + qc + ")", "orange")] : []) + "</div></td></tr>";
  });
  h += '</table></div><p class="mesures" style="margin-top:6px">« Ouvrir » affiche la cure (fiche chimio, doses) : on vérifie, on remplit, puis on valide depuis la séance ; ⋯ pour valider, reporter, annuler ou rétablir. Une date prévue se modifie directement (les cures suivantes peuvent suivre) ; ' + A.ic("stetho") + ' = heure de la consultation.</p>';
  return h + "</div>";
}

// ───── Cure dans une fenêtre : 1) les jours de la cure (J1, J8, J15…) ; 2) un jour : protocole, poids, SC, doses, validation ─────
let CM = null; // { pid, i, k, j } : cure ouverte ; j = null → vue des jours, sinon 1er jour de la séance affichée
const etiquette = (gr) => "J" + gr.days.join("-J");
const groupes = (q) => { const g = seancesDe(q); return g.length ? g : [{ j: 1, days: [1] }]; };
function ouvrirCure() {
  const x = CM && trouver(CM.pid); if (!x) return;
  if (A.peut("finances") && !MC[x.id]) { chargerMontants(x).then(() => { if (CM && CM.pid === x.id) ouvrirCure(); }); }
  const corps = document.getElementById("fenetreCorps"), memeVue = CM.vue === CM.j + "|" + CM.k, sc = memeVue && corps ? corps.scrollTop : 0;
  CM.vue = CM.j + "|" + CM.k;
  A.fenetre(CM.j == null ? vueCure(x, CM.i, CM.k) : vueJour(x, CM.i, CM.k, CM.j), "large");
  setTimeout(() => { if (document.activeElement && corps.contains(document.activeElement)) document.activeElement.blur(); corps.scrollTop = sc; }, 70);
}
window.chJour = (j) => { if (!CM) return; CM.j = j; ouvrirCure(); };
window.chRetourCure = () => { if (!CM) return; CM.j = null; ouvrirCure(); };
window.chFermerCure = () => { const id = CM && CM.pid; CM = null; A.fermerFenetre(); if (id) A.pageDossier(id); };
window.chSousAnnuler = () => { if (CM) ouvrirCure(); else A.fermerFenetre(); };

// 1) Vue de la cure : tableau des séances (J1, J8, J15…) avec leurs actions, fiche chimio, consultation encaissée.
//    Sur téléphone, chaque ligne du tableau devient une carte (CSS .tsea).
function vueCure(x, i, k) {
  const P = x.P, L = P.lignes[i], { q, e } = etatCure(L, k, P), esc = A.esc, okT = A.traitMod(), okPl = okT || A.peut("planningChimio"), c = e.c, qc = "'" + x.id + "'," + i + "," + k;
  const g = groupes(q), multi = g.length > 1, motif = (o) => (o ? esc(o.raison || "") + (o.com ? " – " + esc(o.com) : "") : "");
  let h = '<div class="cure-ent"><div><h3 style="margin:0">Cure C' + e.n + (q.c ? " / " + L.cures.length : "") + " — " + esc(q.nom) + "</h3>" +
    '<p class="sous" style="margin:4px 0 0">' + esc(x.r.nm) + " " + badgeCure(e) + "</p></div>" +
    '<button class="bt fonce petit" data-fn="chimio.fiche" onclick="chFiche(' + qc + ')"><svg class="pi"><use href="#i-imprimer"/></svg>FICHE CHIMIO</button></div>';
  const td = (lib, v, cls) => '<td data-l="' + lib + '"' + (cls ? ' class="' + cls + '"' : "") + ">" + v + "</td>";
  const reps = (l) => (l && l.length ? '<div class="mesures">' + l.map((r) => "↪ reportée du " + A.dfrA(r.de) + " (" + esc(r.raison) + ")").join("<br>") + "</div>" : "");
  const statut = (st, rep, ann) => st === "recue" ? '<span class="badge b-ch"><svg class="pi"><use href="#i-check"/></svg>Reçue</span>' : st === "annulee" ? '<span class="badge b-al">✖ Annulée</span>' + (ann ? '<div class="mesures">' + motif(ann) + "</div>" : "") : rep ? '<span class="badge b-or">↪ Reportée</span>' : '<span class="badge b-gr"><svg class="pi"><use href="#i-horloge"/></svg>Prévue</span>';
  h += '<div class="tableau"><table class="tcures tsea"><tr><th>Jour</th><th>Date prévue</th><th>Réalisée le</th><th>Statut</th><th></th></tr>';
  // J1 = la cure elle-même
  const pend = e.st === "prevue";
  h += "<tr>" + td("Jour", "<b>" + etiquette(g[0]) + "</b>") +
    td("Date prévue", (pend && okPl ? '<input type="date" value="' + esc(e.date || "") + '" onchange="chDate(' + qc + ',this.value)">' : A.dfrA(e.date) || "—") + (pend && e.date ? boutonHeure(x, i, k, 1, c) : "") + reps(c.rep)) +
    td("Réalisée le", e.st === "recue" ? "<b>" + A.dfrA(c.reelle) + "</b>" : "—") + td("Statut", statut(e.st, c.rep && c.rep.length, e.st === "annulee" ? Object.assign({ raison: (c.ann && c.ann.raison) || "" }, c.ann) : null)) +
    td("", '<div class="btns">' + b("Ouvrir", "chJour(1)", "fonce") +
      menu3(okT ? (pend ? [b('<svg class="pi"><use href="#i-check"/></svg>Valider', "chJour(1)", "vert"), b("↪ Reporter", "chReporter(" + qc + ")", "orange"), b("✖ Annuler", "chAnnuler(" + qc + ")", "rouge")] : [e.st === "recue" ? b("Annuler la validation", "chRetablir(" + qc + ")") : b("Rétablir", "chRetablir(" + qc + ")")]) : pend && okPl ? [b("↪ Reporter", "chReporter(" + qc + ")", "orange")] : []) + "</div>", "act") + "</tr>";
  // J8, J15… : séances de la même cure
  if (multi) seancesCure(L, e, D().ctx.bib).forEach((sz) => {
    const lab = etiquette(g.find((z) => z.j === sz.j) || { days: [sz.j] }), qj = qc + "," + sz.j, z = (c.sea || {})[sz.j] || {};
    if (e.st !== "recue") { h += "<tr>" + td("Jour", "<b>" + lab + "</b>") + td("Date prévue", '<span class="mesures">' + (e.st === "annulee" ? "—" : "fixée après validation de J1") + "</span>") + td("Réalisée le", "—") + td("Statut", e.st === "annulee" ? '<span class="badge b-al">✖ Cure annulée</span>' : '<span class="badge b-gr">En attente de J1</span>') + td("", e.st === "annulee" ? "" : '<div class="btns">' + b("Ouvrir", "chJour(" + sz.j + ")", "fonce") + "</div>", "act") + "</tr>"; return; }
    const p2 = sz.st === "prevue";
    h += "<tr>" + td("Jour", "<b>" + lab + "</b>") +
      td("Date prévue", (p2 && okPl ? '<input type="date" value="' + esc(sz.prevue || "") + '" onchange="chDateSeance(' + qj + ',this.value)">' : A.dfrA(sz.prevue) || "—") + (p2 && sz.prevue ? boutonHeure(x, i, k, sz.j, z) : "") + reps(z.rep)) +
      td("Réalisée le", sz.st === "recue" ? "<b>" + A.dfrA(sz.d) + "</b>" : "—") + td("Statut", statut(sz.st, z.rep && z.rep.length, sz.ann)) +
      td("", '<div class="btns">' + b("Ouvrir", "chJour(" + sz.j + ")", "fonce") +
        menu3(okT ? (p2 ? [b('<svg class="pi"><use href="#i-check"/></svg>Valider', "chJour(" + sz.j + ")", "vert"), b("↪ Reporter", "chReporterJ(" + qj + ")", "orange"), b("✖ Annuler", "chAnnulerJ(" + qj + ")", "rouge")] : [sz.st === "recue" ? b("Annuler la validation", "chAnnulerSeance(" + qj + ")") : b("Rétablir", "chRetablirJ(" + qj + ")")]) : p2 && okPl ? [b("↪ Reporter", "chReporterJ(" + qj + ")", "orange")] : []) + "</div>", "act") + "</tr>";
  });
  h += "</table></div>";
  h += '<p class="mesures" style="margin:8px 0 0">« Ouvrir » ou « Valider » affiche le protocole du jour : poids, taille, créatinine, clairance, surface corporelle, doses, molécules à ajouter ou retirer, et la validation.</p>';
  h += '<div class="boutons"><button class="bt plein" onclick="chFermerCure()">Fermer</button></div>';
  return h;
}

// 2) Vue d'un jour : paramètres (J1), molécules, doses du jour, validation
function vueJour(x, i, k, j) {
  const P = x.P, L = P.lignes[i], { q, e } = etatCure(L, k, P), esc = A.esc, okT = A.traitMod(), c = e.c, qc = "'" + x.id + "'," + i + "," + k;
  let dis = okT ? "" : " disabled";
  const auc = q.dr.some((d) => /AUC/.test(d.u) || /CISPLATINE/i.test(d.p || "")), g = groupes(q), multi = g.length > 1, gi = Math.max(0, g.findIndex((z) => z.j === j)), gr = g[gi], u = L.crU === "mgL" ? "mg/L" : "µmol/L";
  const sea = j > 1 ? (seancesCure(L, e, D().ctx.bib).find((z) => z.j === j) || null) : null;
  const dJ = j === 1 ? (e.st === "recue" ? c.reelle : e.date) : sea ? (sea.st === "recue" ? sea.d : sea.prevue) : null;
  // 12/10/2026 (demande de Dr Bentahila) : séance validée = verrouillée (rien ne se modifie, rien n'est transmis aux cures suivantes) ;
  // pour la corriger, annuler d'abord sa validation
  const figeJ = j === 1 ? e.st === "recue" : !!(sea && sea.st === "recue"), F = j === 1 ? c.fige : ((c.sea || {})[j] || {}).fige;
  if (figeJ) dis = " disabled";
  // bouton « Retour à la cure » en bas, à côté de Reporter / Valider (12/10/2026, demande de Dr Bentahila)
  const RET = (unSeulJour(L, k) ? '<button class="bt gris" style="margin-right:auto" onclick="chFermerCure()">Fermer</button>' // cure d'un seul jour : pas de tableau des jours (3.7)
    : '<button class="bt gris" style="margin-right:auto" onclick="chRetourCure()">‹ Retour à la cure C' + e.n + "</button>") +
    (A.peut("ecrireConsultations") ? '<button class="bt clair" data-fn="prescriptions" onclick="chOrdos(' + qc + "," + j + ')">' + A.ic("imprimer") + "Ordonnances</button>" : ""); // P6 (18/10/2026)
  let h = '<div class="cure-ent"><div><h3 style="margin:0">C' + e.n + " · " + etiquette(gr) + " — " + esc(q.nom) + '</h3><p class="sous" style="margin:4px 0 0">' + esc(x.r.nm) + (dJ ? " · " + A.dfrA(dJ) : "") + (dJ && !figeJ && (j === 1 ? e.st === "prevue" : sea && sea.st === "prevue") ? boutonHeure(x, i, k, gr.j, j === 1 ? c : (c.sea || {})[j] || {}) : "") + "</p></div>" + // heure de la consultation, à côté de la date (3.7)
    (j === 1 ? '<button class="bt fonce petit" data-fn="chimio.fiche" onclick="chFiche(' + qc + ')"><svg class="pi"><use href="#i-imprimer"/></svg>FICHE CHIMIO</button>' : "") + "</div>";
  // Paramètres de la séance (J1, J8…) : saisis ici, sinon repris de la séance précédente (puis de la cure précédente)
  const G = (e.g && e.g[gi]) || { poids: e.poids, creat: e.creat, sc: e.sc, cl: e.cl, pctAll: num(c.pctAll), saisi: {} };
  // Poids validé par la secrétaire (10/10/2026) : séance prévue aujourd'hui (ou en retard), droit « planning » sans « traitements »
  const enAttente = j === 1 ? e.st === "prevue" : e.st === "recue" && !!sea && sea.st === "prevue";
  const poidsSec = !okT && A.peut("planningChimio") && enAttente && !!dJ && dJ <= D().t, pv = (c.pv || {})[gr.j];
  h += '<div class="form" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr));margin-top:4px"><div><label for="chPoids">Poids (kg)</label><input id="chPoids" inputmode="decimal" value="' + esc(G.poids || "") + '"' + (G.saisi.poids ? ' class="saisi"' : "") + (poidsSec ? "" : dis) + ' onchange="chChamp(' + qc + ',\'poids\',this.value,' + gr.j + ')">' +
    (poidsSec ? '<button class="bt vert petit" style="margin-top:6px" onclick="chChamp(' + qc + ',\'poids\',document.getElementById(\'chPoids\').value,' + gr.j + ')"><svg class="pi"><use href="#i-check"/></svg>Valider le poids</button>' : "") +
    (pv ? '<div class="mesures">Poids validé par ' + esc(pv.nom || "") + " le " + A.dfrA(String(pv.le || "").slice(0, 10)) + " à " + String(pv.le ? new Date(pv.le).toTimeString().slice(0, 5) : "").replace(":", " h ") + "</div>" : "") + "</div>" +
    '<div><label>Surface corporelle</label><input disabled value="' + (G.sc ? fr2(G.sc) + " m²" : "—") + '"></div>' +
    '<div><label>Dose des anticancéreux (%)</label><input inputmode="decimal" placeholder="100" value="' + esc(G.pctAll == null ? "" : G.pctAll) + '"' + (G.pctAll != null ? ' class="saisi"' : "") + dis + ' onchange="chChamp(' + qc + ',\'pctAll\',this.value,' + gr.j + ')"></div></div>' +
    (j > 1 && !figeJ ? '<p class="mesures" style="margin:2px 0 6px">Valeurs reprises de la séance précédente tant que rien n\'est saisi ; une valeur saisie ici est reprise aux séances et cures suivantes.</p>' : "") +
    (figeJ ? '<p class="mesures" style="margin:2px 0 6px">' + A.ic("check") + " Séance validée" + (F && F.parNom ? " par " + esc(F.parNom) : "") + (F && F.le ? " le " + A.dfrA(String(F.le).slice(0, 10)) : "") + " : valeurs et doses figées, plus modifiables" + (okT ? " (pour corriger, annulez d'abord la validation)" : "") + ".</p>" : "");
  const prodsJ = figeJ && F && F.doses ? Object.values(F.doses) : Object.values(instantane(e, gi).doses); // molécules et doses de la séance
  h += bilanJour({ x, i, k, j, figeJ, F, okT, G, e, qc, gr, dis, u, auc: q.dr.some((d) => /AUC/.test(d.u)), prods: prodsJ, crU: L.crU });
  h += encartVigilance({ x, L, k, j: gr.j, figeJ, F, G, prods: prodsJ, date: dJ || D().t });
  {
    // Molécules : ajout ou retrait à partir de cette séance (J1, J8…), puis pour toutes les cures suivantes
    const ms = L.mods || [], qd = qc + "," + gr.j, ici = (m) => m.k === k && (m.j || 1) === gr.j;
    h += '<div class="bloc gris"><div class="entete"><span class="mesures" style="flex:1"><b>Molécules</b> – un ajout ou un retrait s\'applique à partir de ' + (gr.j > 1 ? "C" + e.n + " J" + gr.j : "cette cure") + " et à toutes les cures suivantes.</span>" +
      (okT && !figeJ ? '<span class="actr" data-fn="chimio.molecules">' + b("+ Ajouter une molécule", "chAjMol(" + qd + ")", "fonce") + b("− Retirer une molécule", "chRetMol(" + qd + ")") + "</span>" : "") + "</div>" +
      (ms.some((m) => m.k <= k) ? '<div style="margin-top:6px">' + ms.map((m, jj) => m.k > k ? "" : '<span class="badge b-gr" style="margin:2px">' + (m.op === "add" ? '<svg class="pi"><use href="#i-plus"/></svg>' : '<svg class="pi"><use href="#i-moins"/></svg>') + esc(m.op === "add" ? m.d.p : m.nom) + " · depuis C" + (m.k + 1) + (m.j > 1 ? " J" + m.j : "") + (ici(m) && okT && !figeJ ? ' <a href="#" class="lienr" onclick="chAnnMod(' + qc + "," + jj + ');return false">annuler</a>' : "") + "</span>").join("") + "</div>" : "") + "</div>";
  }
  // Jours de la séance : chaque jour de traitement va à la séance qui a commencé avant lui
  const tous = []; q.dr.forEach((d) => joursDe(d).forEach((jj) => { if (tous.indexOf(jj) < 0) tous.push(jj); })); tous.sort((a, z) => a - z);
  const jours = multi ? tous.filter((jj) => jourVersSeance(g, jj) === gi) : tous; // « selon prescription » (G-CSF…) : avec J1
  h += tableDoses(x, i, k, q, e, jours, qc, dis, dJ ? addJ(dJ, 1 - gr.j) : e.date);
  if (j === 1 && q.no) h += '<div style="color:#8A1C2B;margin-top:8px;font-size:12.5px">' + q.no.map(esc).join("<br>") + "</div>";
  // Validation du jour
  h += '<div class="valj">';
  if (j === 1) {
    if (e.st === "recue") h += '<span class="badge b-ch"><svg class="pi"><use href="#i-check"/></svg>' + (multi ? "J1 reçue" : "C" + e.n + " terminée") + " le " + A.dfrA(c.reelle) + "</span>" + (okT ? ' <a href="#" class="lienr" onclick="chRetablir(' + qc + ');return false">annuler la validation</a>' : "");
    else if (e.st === "annulee") h += '<span class="badge b-al">✖ Cure annulée</span>';
    else if (okT) h += '<div class="form" style="grid-template-columns:minmax(0,220px) 1fr;align-items:end"><div><label for="vD">Date de réalisation</label>' + dateInput("vD", D().t) + "</div>" +
      (e.date ? '<div class="mesures" id="vSz">' + choixSuite("vS", "Si la date diffère de la date prévue (" + A.dfrA(e.date) + ")") + "</div>" : "<div></div>") + "</div>" +
      '<div class="err" id="fErr"></div><div class="boutons" style="margin-top:8px">' + RET + '<button class="bt gris" data-fn="chimio.report" style="color:#B46A00" onclick="chReporter(' + qc + ')">↪ Reporter' + (multi ? " J1 (la cure)" : " la cure") + '</button><button class="bt vert" id="fOk" onclick="chValiderJ1(' + qc + ')"><svg class="pi"><use href="#i-check"/></svg>' + (multi ? "Valider J1" : "Valider la cure") + "</button></div>";
  } else if (sea) {
    const rp = ((c.sea || {})[j] || {}).rep || [];
    if (rp.length) h += '<p class="mesures" style="margin:0 0 8px">' + rp.map((r) => "↪ Reportée du " + A.dfrA(r.de) + " au " + A.dfrA(r.a) + " (" + esc(r.raison) + (r.com ? " – " + esc(r.com) : "") + ")").join("<br>") + "</p>";
    if (e.st !== "recue") h += '<p class="mesures">Ce jour se valide après la validation de J1.</p>';
    else if (sea.st === "annulee") h += '<span class="badge b-al">✖ ' + etiquette(gr) + " annulée</span>" + (sea.ann ? ' <span class="mesures">' + esc(sea.ann.raison || "") + (sea.ann.com ? " – " + esc(sea.ann.com) : "") + "</span>" : "") + (okT ? ' <a href="#" class="lienr" onclick="chRetablirJ(' + qc + "," + j + ');return false">rétablir</a>' : "");
    else if (sea.st === "recue") h += '<span class="badge b-ch"><svg class="pi"><use href="#i-check"/></svg>' + etiquette(gr) + " reçue le " + A.dfrA(sea.d) + "</span>" + (okT ? ' <a href="#" class="lienr" onclick="chAnnulerSeance(' + qc + "," + j + ');return false">annuler la validation</a>' : "");
    else if (okT) h += '<div class="form" style="grid-template-columns:minmax(0,220px) 1fr;align-items:end"><div><label for="sD">Date de réalisation</label>' + dateInput("sD", sea.prevue && ecart(sea.prevue, D().t) <= 0 ? sea.prevue : D().t) + "</div>" +
      (sea.prevue ? "<div>" + choixSuite("sS", "Si la date diffère de la date prévue (" + A.dfrA(sea.prevue) + ")") + "</div>" : "<div></div>") + "</div>" +
      '<div class="err" id="fErr"></div><div class="boutons" style="margin-top:8px">' + RET + '<button class="bt gris" style="color:#B46A00" onclick="chReporterJ(' + qc + "," + j + ')">↪ Reporter ' + etiquette(gr) + '</button><button class="bt vert" id="fOk" onclick="chValiderJ(' + qc + "," + j + ')"><svg class="pi"><use href="#i-check"/></svg>Valider ' + etiquette(gr) + "</button></div>";
  }
  if (h.indexOf(RET) < 0) h += '<div class="boutons" style="margin-top:10px">' + RET + "</div>"; // 3.14 : un seul « Fermer » (cure d'un seul jour) // séance validée, annulée… : retour en bas aussi
  return h + "</div>";
}
function tableDoses(x, i, k, q, e, jours, qc, dis, d0) {
  const esc = A.esc;
  let h = '<div class="tableau"><table class="tcures doses tsea"><tr><th>Jour</th><th>Produit</th><th>Posologie</th><th>Dose 100 %</th><th>% dose</th><th>Dose retenue (modifiable)</th></tr>'; // téléphone : cartes (3.7)
  jours.forEach((j) => {
    h += '<tr class="jr"><td colspan="6">' + (j === 99 ? "Selon prescription" : "J" + j + (d0 ? " – " + A.dfrA(addJ(d0, j - 1)) : "")) + "</td></tr>";
    q.dr.forEach((d, xx) => {
      if (joursDe(d).indexOf(j) < 0) return;
      const txt = d.u === "txt", multiJ = joursDe(d).length > 1, z = (e.dj && e.dj[xx] && e.dj[xx][j]) || { dose: e.doses[xx], pc: 100 };
      // P10 k (18/10/2026) : dose arrondie au flacon proposée (lien qui l'applique comme une dose saisie), séance non validée seulement
      const arf = !txt && !dis && !premedP(d) && z.dose != null ? arrondiFlacon(d.p, z.dose, flaconsCabinet()) : null;
      h += '<tr><td data-l="Jour">' + esc(multiJ ? "J" + j : d.jl || (d.j || []).filter((y) => y !== 99).map((y) => "J" + y).join(" ")) + '</td><td data-l="Produit" class="pr">' + esc(d.p) + '</td><td data-l="Posologie">' + esc(poso(d)) + '</td><td data-l="Dose 100 %">' + esc(doseTxt(d, z.v !== undefined ? z.v : e.calc[xx])) +
        (arf ? '<br><a href="#" class="lien" style="font-size:12px" title="Appliquer cette dose arrondie" onclick="chOv(' + qc + ",'" + esc(d.id) + "'," + j + "," + arf.dose + ');return false">' + esc(arf.lib) + "</a>" : "") + '</td><td data-l="% dose">' +
        (txt ? "" : '<input inputmode="decimal" style="max-width:80px' + (z.pc !== 100 ? ";color:var(--rouge);font-weight:bold" : "") + '"' + (z.pi ? ' class="saisi"' : "") + ' value="' + z.pc + '"' + dis + ' onchange="chPct(' + qc + ",'" + esc(d.id) + "'," + j + ',this.value)"> %') + '</td><td data-l="Dose retenue">' +
        (txt ? esc(texteNiv(d.dt || "", e.poids)) : '<input inputmode="decimal" style="max-width:130px"' + (z.ov ? ' class="saisi"' : "") + ' value="' + (z.dose == null ? "" : z.dose) + '"' + dis + ' onchange="chOv(' + qc + ",'" + esc(d.id) + "'," + j + ',this.value)">') + "</td></tr>";
    });
  });
  return h + '</table></div><p class="mesures" style="margin-top:6px">Une dose ou un % modifié s\'applique à cette molécule à partir de ce jour : aux jours suivants de cette cure et à tous les jours des cures suivantes. La modification reste tracée dans le dossier. Cases jaunes = valeurs saisies.</p>';
}

// ───── Navigation et exécution ─────
const rafraichir = (x) => { const cm = CM; A.fermerFenetre(); A.pageDossier(x.id); if (cm && cm.pid === x.id) { CM = cm; ouvrirCure(); } };
window.chTog = (id, i) => { SEL.pid = id; SEL.l = SEL.l === i ? null : i; SEL.c = null; A.pageDossier(id); };
window.chOuvrir = (id, i, k, j) => { const x = trouver(id), L = x && x.P.lignes[i]; if (!j && L && unSeulJour(L, k)) j = 1; SEL.pid = id; SEL.l = i; SEL.c = k; CM = { pid: id, i, k, j: j || null }; A.pageDossier(id); ouvrirCure(); };
const boutons = (lib, cls) => '<div class="err" id="fErr"></div><div class="boutons"><button class="bt gris" onclick="chSousAnnuler()">Annuler</button><button class="bt ' + (cls || "plein") + '" id="fOk">' + lib + "</button></div>";
async function executer(x, fn) { A.occupe(document.getElementById("fOk"), true); try { await fn(); A.toast("Enregistré."); rafraichir(x); return true; } catch (e) { A.occupe(document.getElementById("fOk"), false); A.erreur(e.message); return false; } }
// Après la validation d'une cure (J1) ou d'une séance (J8…) dans le dossier, la fenêtre de prix de la consultation de chimio
// s'ouvre, comme à la validation d'un rendez-vous (08/10/2026), sauf si ce jour a déjà son prix
async function proposerPrix(pid, lid, n, j) {
  if (!(A.peut("finances") || prixParServeur())) return;
  const s = await getDoc(doc(db, "espaces", A.ESPACE, "encaissements", pid)).catch(() => null);
  const E = s && s.exists() ? JSON.parse(s.data().data || "{}") : {};
  if (E.cons && E.cons[lid + "|" + n + "|" + j]) return;
  window.chVenuChimio(pid, lid, n, j);
}
async function direct(x, fn) { try { await fn(); rafraichir(x); } catch (e) { A.toast(e.message); A.pageDossier(x.id); } }
const choixSuite = (id, nom, def) => '<div class="large"><label>' + nom + '</label><label style="font-weight:normal"><input type="radio" name="' + id + '" value="seule"' + (def !== "suite" ? " checked" : "") + ' style="width:auto;margin-right:6px">Cette date seulement (la suite ne bouge pas)</label><label style="font-weight:normal"><input type="radio" name="' + id + '" value="suite"' + (def === "suite" ? " checked" : "") + ' style="width:auto;margin-right:6px">Recalculer toute la suite</label></div>';
const choix = (id) => { const r = document.querySelector('input[name="' + id + '"]:checked'); return r ? r.value : "seule"; };
function decalerSuivantes(L, k, delta, P) {
  if (!delta) return; const n = L.cures[k + 1]; if (!n || n.st === "recue") return;
  const E = etatLigne(L, P, D().ctx), cur = E[k + 1] && E[k + 1].date; if (!cur) return;
  n.fixe = addJ(cur, delta); for (let j = k + 2; j < L.cures.length; j++) if (L.cures[j].st !== "recue") delete L.cures[j].fixe;
}
function figerSuivantes(L, k, E) { for (let j = k + 1; j < L.cures.length; j++) if (L.cures[j].st !== "recue" && !L.cures[j].fixe && E[j] && E[j].date) L.cures[j].fixe = E[j].date; }
const libererSuivantes = (L, k) => { for (let j = k + 1; j < L.cures.length; j++) if (L.cures[j].st !== "recue") delete L.cures[j].fixe; };

// 2.2 (12/10/2026) : instantané d'une séance validée (n = 0 : J1), calculé avec la cure telle qu'elle vient d'être validée ;
// l'affichage et l'impression d'une séance validée le reprennent ensuite (moteur/doses.js), quoi qu'on change dans le dossier
function figer(L, x, k, n) {
  const E = etatLigne(L, x.P, D().ctx);
  return Object.assign(instantane(E[k], n), { le: new Date().toISOString(), par: D().u.uid, parNom: (D().membre && D().membre.nom) || "" });
}

// 2.2 – une fois (décision de Dr Bentahila, 11/10/2026) : les cures et séances déjà validées avant le 12/10/2026 sont figées telles
// qu'elles s'affichent ce jour-là (« retro » : figées d'après le dossier, pas au moment même de leur validation). Appelé par migrations().
export async function figerCuresValidees(x) {
  if (!A.traitMod()) return 0;
  const lignes = lignesDe(x), bib = D().ctx.bib, le = new Date().toISOString(), meta = { le, par: D().u.uid, parNom: (D().membre && D().membre.nom) || "", retro: true };
  let n = 0;
  for (const L of lignes) {
    let E; try { if (!protocoleDe(L, bib)) continue; E = etatLigne(L, x.P, D().ctx); } catch (er) { console.warn("figer", x.id, L.id, er); continue; }
    (L.cures || []).forEach((c, k) => {
      if (!E[k]) return;
      if (c.st === "recue" && !c.fige) { c.fige = Object.assign(instantane(E[k], 0), meta); n++; }
      if (!c.sea) return;
      const g = seancesDe(protocoleCure(L, k, bib) || protocoleDe(L, bib));
      Object.keys(c.sea).forEach((j) => { const z = c.sea[j], idx = g.findIndex((s0) => s0.j === +j); if (z && z.st === "recue" && !z.fige && idx > 0) { z.fige = Object.assign(instantane(E[k], idx), meta); n++; } });
    });
  }
  if (n) await sauverLignes(x, lignes, "Doses des " + n + " séance(s) déjà validée(s) figées (telles qu'affichées le " + A.dfrA(D().t) + ")");
  return n;
}

// Bilan biologique du jour (12/10/2026) : sous les paramètres de la séance ; avant la validation, cases à remplir (gardées en
// brouillon si la fenêtre se redessine) ; après, valeurs affichées (repères en rouge) pour suivre l'évolution d'une cure à l'autre
const BIOB = {};
window.chBio = (cle, f, v) => { (BIOB[cle] = BIOB[cle] || {})[f] = v; };
function bilanJour(o) {
  const { x, i, k, j, figeJ, F, okT, G, e, qc, gr, dis, u, auc, prods, crU } = o, cle = x.id + "|" + i + "|" + k + "|" + j, b0 = BIOB[cle] || {}, esc = A.esc, fr = (v) => String(v).replace(".", ",");
  // 12/10/2026 : créatinine (facultative, sauf carboplatine : elle sert au calcul) et DFG calculé (Cockcroft-Gault) avec le bilan ; repères
  // rénaux affichés pour les molécules à surveiller (REINS), fenêtre à la saisie et à la validation pour elles seulement
  const rein = reinSensible(e), rep = rein ? reperesClairance(e, figeJ && F ? { cl: F.cl } : G) : [];
  const tete = '<div class="form bio-j" style="grid-template-columns:repeat(auto-fit,minmax(140px,1fr));margin:6px 0 10px"><div class="large" style="grid-column:1/-1"><span class="mesures"><b>Bilan biologique du jour</b>';
  const repH = rep.length ? '<div class="large" style="grid-column:1/-1;color:var(--rouge);font-size:13px">' + rep.map((r) => "⚠ " + esc(r)).join("<br>") + "</div>" : "";
  if (figeJ) {
    const bio = (F && F.bio) || {}, rouge = (k2, v) => (alertesBio({ [k2]: v }).length ? ' style="color:var(--rouge);font-weight:bold"' : "");
    const val = (k2, lib, un) => "<div><label>" + lib + "</label><div" + rouge(k2, bio[k2]) + ">" + (bio[k2] != null ? fr(bio[k2]) + " " + un : "—") + "</div></div>";
    const cr = F && F.creat != null ? fr(F.creat) + " " + u : "—", cl = F && F.cl != null ? F.cl + " ml/min" : "—";
    return tete + (Object.keys(bio).length || (F && F.creat != null) ? "" : " : non noté à la validation") + "</span></div>" + val("pnn", "PNN", "G/L") + val("plq", "Plaquettes", "G/L") + val("hb", "Hémoglobine", "g/dL") +
      "<div><label>Créatinine</label><div>" + cr + "</div></div><div><label>DFG (Cockcroft)</label><div" + (rep.length ? ' style="color:var(--rouge);font-weight:bold"' : "") + ">" + cl + "</div></div>" +
      EXAMENS.filter((X) => bio[X[0]] != null && bio[X[0]] !== "").map((X) => "<div><label>" + X[1] + "</label><div" + (horsNorme(X[0], bio[X[0]], crU) ? ' style="color:var(--rouge);font-weight:bold"' : "") + ">" + esc(fr(bio[X[0]])) + " " + X[2](crU) + "</div></div>").join("") + repH + "</div>";
  }
  if (!okT) return "";
  const inp = (id, f, lib, ph) => '<div><label for="' + id + '">' + lib + '</label><input id="' + id + '" inputmode="decimal" placeholder="' + ph + '" value="' + esc(b0[f] || "") + '" oninput="chBio(\'' + cle + "','" + f + "',this.value)\"></div>";
  const creat = '<div><label for="bCr">Créatinine (' + u + ")" + (auc ? " *" : "") + '</label><input id="bCr" inputmode="decimal" value="' + esc(G.creat == null ? "" : G.creat) + '"' + (G.saisi && G.saisi.creat ? ' class="saisi"' : "") + dis + ' onchange="chChamp(' + qc + ",'creat',this.value," + gr.j + ')"></div>' +
    '<div><label>DFG (Cockcroft)</label><input disabled value="' + (G.cl ? G.cl + " ml/min" : x.P.sexe ? "—" : "sexe manquant") + '"' + (rep.length ? ' style="color:var(--rouge);font-weight:bold"' : "") + ">" +
    (G.cl > REPERES.calvert && avecMolecule(e, /CARBOPLATINE/) ? '<div class="mesures">Calvert : plafonnée à ' + REPERES.calvert + " ml/min (hyperfiltration)</div>" : "") + "</div>";
  return tete + " (facultatif, gardé avec la séance validée" + (auc ? " ; créatinine nécessaire au carboplatine, à vérifier avant chaque cure" : "") + ")</span></div>" +
    inp("bPnn", "pnn", "PNN (G/L)", "≥ 1,5") + inp("bPlq", "plq", "Plaquettes (G/L)", "≥ 100") + inp("bHb", "hb", "Hémoglobine (g/dL)", "≥ 8") + creat + repH + examensJour(cle, b0, prods, crU) + "</div>";
}
// 12/10/2026 (vigilance par molécule) : examens facultatifs du bilan du jour ; ceux qui servent aux molécules de la séance sont
// affichés, les autres derrière « + autres examens » (ou affichés s'ils ont déjà une valeur)
function examensJour(cle, b0, prods, crU) {
  const pro = examensProposes(prods), esc = A.esc;
  const champ = (X) => '<div><label for="bx_' + X[0] + '">' + X[1] + " (" + X[2](crU) + ")</label><input id=\"bx_" + X[0] + '"' + (X[0] === "ta" || X[0] === "prot" ? "" : ' inputmode="decimal"') + ' placeholder="' + esc(X[3]) + '" value="' + esc(b0[X[0]] || "") + '" oninput="chBio(\'' + cle + "','" + X[0] + "',this.value)\"></div>";
  const vis = EXAMENS.filter((X) => pro.indexOf(X[0]) >= 0 || b0[X[0]]), autres = EXAMENS.filter((X) => vis.indexOf(X) < 0);
  return vis.map(champ).join("") + (autres.length ? '<div class="large" style="grid-column:1/-1"><a href="#" class="lien" onclick="this.parentNode.nextElementSibling.classList.toggle(\'cache\');this.textContent=this.textContent[0]===\'+\'?\'− autres examens\':\'+ autres examens\';return false">+ autres examens</a></div>' +
    '<div class="form cache" style="grid-column:1/-1;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));margin:0">' + autres.map(champ).join("") + "</div>" : "");
}
// Encart « Vigilance » de la séance : dose cumulée, produits vésicants, notes « À vérifier » (Paramètres › Vigilance des molécules) ;
// séance validée : vigilances confirmées à la validation
function encartVigilance(o) {
  const { x, L, k, j, figeJ, F, G, prods, date } = o, esc = A.esc, l = [];
  cumuls({ prods, sc: figeJ && F ? F.sc : G.sc, histo: historique(lignesDe(x), L.id + "|" + k + "|" + j), date }).forEach((c) => {
    const fort = c.total >= c.seuil * c.C.alerte;
    l.push('<div' + (fort ? ' style="color:var(--rouge);font-weight:bold"' : "") + ">Dose cumulée " + esc((/^[aeiouyhéè]/i.test(c.nom) ? "d'" : "de ") + c.nom) + " : <b>" + c.total + " " + c.u + "</b> avec cette séance (" + c.pct + " % du seuil de " + c.seuil + " " + c.u + ")</div>");
  });
  const ves = prods.filter((z) => z && z.u !== "txt" && vesicant(z.p)).map((z) => z.p).filter((p, n, t) => t.indexOf(p) === n);
  if (ves.length) l.push("<div>Produit vésicant : <b>" + ves.map(esc).join(", ") + "</b> (voie veineuse sûre, surveiller le point de ponction)</div>");
  if (figeJ && F && F.vig && F.vig.length) l.push('<div>Vigilances confirmées à la validation :<ul style="margin:4px 0 0 18px;padding:0">' + F.vig.map((v) => "<li>" + esc(v) + "</li>").join("") + "</ul></div>");
  // P3 (18/10/2026) : risque émétique, seuils du jour et ordonnances liées du protocole
  const pc = champsBib(protocoleCure(L, k, D().ctx.bib), L);
  if (pc) {
    l.push("<div>Risque émétique : <b>" + esc(libRisque(risqueDe(pc, premedP))) + "</b>" + ((pc.ordos || []).length ? " · Ordonnances liées : " + pc.ordos.map(esc).join(" ; ") : "") + "</div>");
    if ((pc.seuils || []).length) l.push('<details' + (figeJ ? "" : " open") + '><summary style="cursor:pointer">Seuils du jour (protocole)</summary><ul style="margin:4px 0 0 18px;padding:0">' + pc.seuils.map((s) => "<li>" + esc(s) + "</li>").join("") + "</ul></details>");
  }
  if (pc) { const it = interactions({ prods: pc.dr.map((d) => d.p), texte: [x.P.traitCours, x.P.atcdMed].filter(Boolean).join(" "), ordos: pc.ordos }); if (it.length) l.push('<div style="color:var(--orange,#B46A00)">' + it.map(esc).join("<br>") + "</div>"); }
  const N = notesPour(prods, notesVigilance());
  if (N.length) l.push("<details><summary style=\"cursor:pointer\">À vérifier pour " + N.map((n) => esc(n.nom)).join(", ") + "</summary>" + N.map((n) => "<div style=\"margin:4px 0 0 4px\"><b>" + esc(n.nom) + "</b> : " + esc(n.txt) + "</div>").join("") + "</details>");
  return l.length ? '<div class="bloc gris" style="font-size:13px"><span class="mesures"><b>Vigilance</b></span>' + l.join("") + "</div>" : "";
}
// Contexte des vigilances d'une séance (n = 0 pour J1) à la date d (moteur/vigilance.js)
function ctxVigilance(x, L, e, k, n, bio, d) {
  const G = e.g[n] || e.g[0], P = x.P;
  return { prods: Object.values(instantane(e, n).doses), n, k, sc: G.sc, cl: G.cl, creatSaisie: !!(G.saisi && G.saisi.creat), crU: L.crU, bio, date: d,
    histo: historique(lignesDe(x), L.id + "|" + k + "|" + (G.j || 1)), patient: { sexe: P.sexe, age: age(P.ddn, d), texte: [P.traitCours, P.atcdMed].filter(Boolean).join(" "), allergie: P.allergie === "oui" ? P.allergies || "" : "" },
    rts: (P.rts || []).map((r) => ({ deb: r.deb, fin: r.fin || finRT(r, D().ctx.feries) })) };
}
// Séance validée (J1 = la cure, sinon c.sea[j]) : verrouillée ; jour de traitement → sa séance
function seanceValidee(L, k, jour) {
  const c = L.cures[k] || {}, q = protocoleCure(L, k, D().ctx.bib) || protocoleDe(L, D().ctx.bib), g = groupes(q), gi = Math.max(0, jourVersSeance(g, jour)), js = (g[gi] || { j: 1 }).j;
  return js === 1 ? c.st === "recue" : !!(c.sea && c.sea[js] && c.sea[js].st === "recue");
}
const MSG_VERROU = "Cette séance est validée : ses valeurs et ses doses sont figées. Pour la corriger, annulez d'abord sa validation.";

// 2.3 et 2.6 (12/10/2026) : avant de valider la séance n (0 = J1) de la cure k : doses manquantes → refus ; valeurs hors des seuils →
// confirmation ; bilan biologique du jour (facultatif) sous les seuils proposés (PNN < 1 500, plaquettes < 100 000 /mm³) → message,
// jamais de blocage. Renvoie le bilan saisi (gardé avec l'instantané), ou null si la validation est arrêtée.
// Repères biologiques de Dr Bentahila (12/10/2026) : PNN ≥ 1,5 G/L, plaquettes ≥ 100 G/L, hémoglobine ≥ 8 g/dL (saisie en G/L ; une
// valeur tapée en /mm³ est convertie)
export const SEUILS_BIO = { pnn: 1.5, plq: 100, hb: 8 };
export const bioGL = (k, v) => (v == null ? null : k === "pnn" && v > 100 ? v / 1000 : k === "plq" && v > 2000 ? v / 1000 : v);
// P3 (18/10/2026) : séance hebdomadaire (J8, J15… ou cycle de 7 jours) : PNN ≥ 1,0 et plaquettes ≥ 75 G/L (o.hebdo)
export const alertesBio = (b, o) => { const a = [], f = (v) => String(v).replace(".", ","), S = o && o.hebdo ? SEUILS_HEBDO : SEUILS_BIO, h = o && o.hebdo ? " (séance hebdomadaire)" : ""; if (!b) return a;
  if (b.pnn != null && b.pnn < S.pnn) a.push("PNN à " + f(b.pnn) + " G/L (moins de " + f(S.pnn) + " G/L" + h + ")");
  if (b.plq != null && b.plq < S.plq) a.push("plaquettes à " + f(b.plq) + " G/L (moins de " + S.plq + " G/L" + h + ")");
  if (b.hb != null && b.hb < SEUILS_BIO.hb) a.push("hémoglobine à " + f(b.hb) + " g/dL (moins de 8 g/dL)");
  return a; };
function verifierValidation(x, i, k, n) {
  const L = lignesDe(x)[i], E = etatLigne(L, x.P, D().ctx), r = controleSeance(E[k], n, L.crU, poidsAvant(E, k, n), poidsDebut(E));
  if (r.refus.length) { alert("Validation impossible :\n\n• " + r.refus.join("\n• ") + "\n\nCorrigez la dose (ou saisissez la créatinine) dans la fenêtre de la cure, puis validez."); return null; }
  const nb = (id) => { const v = num(A.val(id)); return v == null ? null : v; };
  const bio = { pnn: bioGL("pnn", nb("bPnn")), plq: bioGL("plq", nb("bPlq")), hb: nb("bHb") };
  EXAMENS.forEach(([cle]) => { bio[cle] = cle === "ta" || cle === "prot" ? A.val("bx_" + cle) || null : nb("bx_" + cle); }); // 12/10/2026
  Object.keys(bio).forEach((key) => { if (bio[key] == null) delete bio[key]; });
  // 12/10/2026 : vigilance par molécule (dose cumulée, FEVG, TSH, uracilémie, bilan du jour, radiothérapie en cours…)
  const d = A.val(n === 0 ? "vD" : "sD") || D().t, cv = ctxVigilance(x, L, E[k], k, n, bio, d), vg = vigilances(cv);
  // P3 (18/10/2026) : seuils particuliers du jour (séance hebdomadaire, gemcitabine J8 / J15, trabectédine, docétaxel, cabazitaxel)
  const pc = protocoleCure(L, k, D().ctx.bib) || {}, hebdo = hebdomadaire({ n, cycle: pc.c });
  seuilsJour({ prods: cv.prods.filter((z) => z && z.u !== "txt"), n, cycle: pc.c, bio, crU: L.crU }).forEach((s) => vg.push(s));
  // P10 (18/10/2026) : interactions (traitements en cours de la fiche, ordonnances liées) et adaptation hépatique
  interactions({ prods: cv.prods.filter((z) => z && !premedP(z)).concat(cv.prods.filter((z) => z && /ONDANSETRON|ONSET/i.test(z.p))), texte: cv.patient.texte, ordos: (champsBib(pc, L) || {}).ordos }).forEach((s) => vg.push(s));
  foie({ prods: cv.prods.filter((z) => z && z.u !== "txt"), bio, crU: L.crU }).forEach((s) => vg.push(s));
  const al = r.alertes.concat(alertesBio(bio, { hebdo }));
  if ((al.length || vg.length) && !confirm("À vérifier avant de valider (repères, vous gardez la main) :\n\n" + (al.length ? "• " + al.join("\n• ") : "") +
    (vg.length ? (al.length ? "\n\n" : "") + "Vigilance par molécule :\n• " + vg.join("\n• ") : "") + "\n\nValider quand même ?")) return null;
  Object.keys(BIOB).forEach((c2) => { if (c2.indexOf(x.id + "|" + i + "|" + k + "|") === 0) delete BIOB[c2]; });
  return { bio, vig: vg };
}

// P6 (18/10/2026) : une ligne prescrite avant le 18/10 garde sa copie du protocole, sans ordonnances liées ni seuils : ceux de la bibliothèque
function champsBib(pc, L) {
  const b = L && D().ctx.bib[L.protoId]; if (!pc || !b) return pc;
  return Object.assign({}, pc, { ordos: (pc.ordos || []).length ? pc.ordos : b.ordos, seuils: (pc.seuils || []).length ? pc.seuils : b.seuils, re: pc.re || b.re });
}
window.chOrdos = (id, i, k, j) => {
  const x = trouver(id), L = lignesDe(x)[i], pc = champsBib(protocoleCure(L, k, D().ctx.bib), L) || {};
  const iv = (pc.dr || []).some((d) => !premedP(d) && !/PER OS|ORAL/i.test(d.v || ""));
  window.orProtocole(id, pc.ordos || [], { fievre: k === 0 && j === 1 && iv, proto: "C" + (k + 1) + " — " + (pc.nom || "") });
};
// P10 n (18/10/2026) : anticancéreux d'une séance (cure n, jour j) avec leur dose et les flacons, pour la liste de la pharmacie
window.chDosesSeance = (pid, lid, n, j) => {
  const x = trouver(pid); if (!x) return [];
  const L = lignesDe(x).find((z) => z.id === lid); if (!L) return [];
  const E = etatLigne(L, x.P, D().ctx), e = E[n - 1]; if (!e) return [];
  const pc = protocoleCure(L, n - 1, D().ctx.bib), g = seancesDe(pc), s = jourVersSeance(g, j), ins = instantane(e, s);
  return Object.values(ins.doses).filter((z) => z && !premedP(z) && z.u !== "txt").map((z) => ({ p: z.p, dose: z.dose, fl: z.dose != null ? flaconsPour(z.p, z.dose, flaconsCabinet()) : "" }));
};
// ───── Cures ─────
window.chDate = (id, i, k, v) => {
  const x = trouver(id); if (!v) { A.pageDossier(id); return; }
  const E = etatLigne(x.P.lignes[i], x.P, D().ctx); if ((E[k] && E[k].date) === v) return;
  A.fenetre("<h3>Nouvelle date de la C" + (k + 1) + " – " + A.esc(x.r.nm) + '</h3><p class="sous">Prévue le ' + A.dfrA(E[k] && E[k].date) + " → <b>" + A.dfrA(v) + '</b></p><div class="form">' + choixSuite("dS", "Cures suivantes", "suite") + "</div>" + boutons("Enregistrer"));
  document.getElementById("fOk").onclick = () => executer(x, async () => {
    const lignes = lignesDe(x), L = lignes[i], E2 = etatLigne(L, x.P, D().ctx);
    if (choix("dS") === "seule") figerSuivantes(L, k, E2); else libererSuivantes(L, k);
    L.cures[k].fixe = v; await sauverLignes(x, lignes, "C" + (k + 1) + " déplacée au " + A.dfrA(v));
  });
};
window.chValider = (id, i, k) => window.chOuvrir(id, i, k, 1);
window.chValiderJ1 = (id, i, k) => {
  const x = trouver(id), ok = verifierValidation(x, i, k, 0); if (!ok) return;
  executer(x, async () => {
    const d = A.val("vD") || D().t, lignes = lignesDe(x), L = lignes[i], c = L.cures[k], E = etatLigne(L, x.P, D().ctx), g = seancesDe(protocoleCure(L, k, D().ctx.bib) || protocoleDe(L, D().ctx.bib));
    if (E[k] && E[k].date && d !== E[k].date) { if (choix("vS") === "suite") decalerSuivantes(L, k, ecart(d, E[k].date), x.P); else figerSuivantes(L, k, E); }
    c.st = "recue"; c.reelle = d; c.valLe = new Date().toISOString();
    c.fige = figer(L, x, k, 0); // 2.2 : doses et paramètres figés à la validation
    if (Object.keys(ok.bio).length) c.fige.bio = ok.bio; // 2.6 : bilan du jour
    if (ok.vig.length) c.fige.vig = ok.vig; // vigilances confirmées (12/10/2026)
    if (g.length > 1) { c.sea = c.sea || {}; g.slice(1).forEach((s) => { if (!c.sea[s.j]) c.sea[s.j] = { st: "prevue" }; }); }
    await sauverLignes(x, lignes, "Cure C" + (k + 1) + " validée (" + A.dfrA(d) + ")");
    SEL.pid = x.id; SEL.l = i; SEL.c = k; if (CM) CM.j = null;
  }).then((ok) => { if (ok) proposerPrix(x.id, x.P.lignes[i].id, k + 1, 1); });
};
window.chRetablir = (id, i, k) => {
  const x = trouver(id); if (!confirm("Remettre la cure C" + (k + 1) + " en « prévue » ?")) return;
  direct(x, async () => { const lignes = lignesDe(x), c = lignes[i].cures[k]; c.st = "prevue"; delete c.reelle; delete c.valLe; delete c.ann; delete c.fige; await sauverLignes(x, lignes, "C" + (k + 1) + " rétablie (prévue)"); });
};
// Séance de chimio manquée (salle d'attente, 08/10/2026) : la fenêtre de report s'ouvre avec « Patient absent » ; « Absent sans
// reporter » ne touche pas au protocole. salle = fonction appelée après (nouvelle date ou null).
const optSalle = (salle) => salle ? '<div class="boutons" style="margin-top:0;justify-content:flex-start"><button class="bt gris" id="rSans">Absent, sans reporter</button></div>' : "";
const lierSalle = (salle) => { if (!salle) return; const r = document.getElementById("rR"); if (r) r.value = "Patient absent"; document.getElementById("rSans").onclick = () => { A.fermerFenetre(); salle(null); }; };
window.chReporter = (id, i, k, salle) => {
  const x = trouver(id), e = etatLigne(x.P.lignes[i], x.P, D().ctx)[k], d0 = e && e.date ? e.date : D().t;
  A.fenetre("<h3>Reporter la cure C" + (k + 1) + " – " + A.esc(x.r.nm) + '</h3><p class="sous">Prévue le ' + A.dfrA(d0) + '</p><div class="form"><div><label for="rD">Nouvelle date</label>' + dateInput("rD", addJ(d0, 7)) + "</div>" +
    '<div><label for="rR">Raison</label><select id="rR">' + RAISONS.map((r) => "<option>" + r + "</option>").join("") + "</select></div>" +
    '<div class="large"><label for="rC">Commentaire</label><input id="rC"></div>' + choixSuite("rS", "Cures suivantes", "suite") + "</div>" + optSalle(salle) + boutons("Reporter", "orange"));
  lierSalle(salle);
  document.getElementById("fOk").onclick = () => executer(x, async () => {
    const nd = A.val("rD"); if (!nd) throw new Error("Indiquez la nouvelle date.");
    const lignes = lignesDe(x), L = lignes[i], E = etatLigne(L, x.P, D().ctx), c = L.cures[k];
    if (choix("rS") === "seule") figerSuivantes(L, k, E); else libererSuivantes(L, k);
    c.rep = c.rep || []; c.rep.push({ de: E[k].date || d0, a: nd, raison: A.val("rR"), com: A.val("rC"), le: D().t }); c.fixe = nd;
    await sauverLignes(x, lignes, "C" + (k + 1) + " reportée au " + A.dfrA(nd) + " (" + A.val("rR") + ")");
    if (salle) salle(nd);
  });
};
window.chAnnuler = (id, i, k) => {
  const x = trouver(id);
  A.fenetre("<h3>Annuler la cure C" + (k + 1) + " – " + A.esc(x.r.nm) + '</h3><div class="form"><div><label for="aD">Date</label>' + dateInput("aD", D().t) + '</div><div><label for="aR">Raison</label><select id="aR">' + RAISONS.map((r) => "<option>" + r + "</option>").join("") + '</select></div><div class="large"><label for="aC">Commentaire</label><input id="aC"></div></div>' + boutons("Confirmer l'annulation", "rouge"));
  document.getElementById("fOk").onclick = () => executer(x, async () => {
    const lignes = lignesDe(x), c = lignes[i].cures[k]; c.st = "annulee"; c.ann = { date: A.val("aD"), raison: A.val("aR"), com: A.val("aC") };
    await sauverLignes(x, lignes, "C" + (k + 1) + " annulée (" + A.val("aR") + ")");
  });
};
window.chFiche = (id, i, k) => {
  const x = trouver(id), L = x.P.lignes[i], { q, e } = etatCure(L, k, x.P);
  // Médecin prescripteur : « Dr NOM Prénom » et INPE du Profil ; imprimée par l'infirmière ou la secrétaire : ceux du médecin titulaire
  const M = A.medecinFiche(), med = { nom: M.nom, inpe: M.inpe, logo: "" }; // pas de logo : papier à en-tête
  // + champs ajoutés de la fiche à imprimer (10/10/2026)
  if (!imprimerFiche(ficheHTML(Object.assign({}, x.P, { _imp: ficheP.aImprimer(x).filter((c) => c.texte) }), L, q, e, med))) A.toast("Autorisez l'ouverture des fenêtres pour imprimer la fiche (orientation Paysage).");
};

// ───── Séances J8 / J15… ─────
window.chValiderSeance = (id, i, k, j) => window.chOuvrir(id, i, k, j);
window.chValiderJ = (id, i, k, j) => { const x = trouver(id), L0 = lignesDe(x)[i], n0 = seancesDe(protocoleCure(L0, k, D().ctx.bib) || protocoleDe(L0, D().ctx.bib)).findIndex((g) => g.j === j), ok = verifierValidation(x, i, k, n0 > 0 ? n0 : 0); if (!ok) return; executer(x, async () => { await majSeance(x, i, k, j, A.val("sD") || D().t, true, null, ok); if (CM) CM.j = null; }).then((ok) => { if (ok) proposerPrix(x.id, x.P.lignes[i].id, k + 1, j); }); };
window.chDateSeance = (id, i, k, j, v) => {
  const x = trouver(id); if (!v) return;
  A.fenetre("<h3>Nouvelle date de J" + j + " – cure C" + (k + 1) + '</h3><p class="sous">→ <b>' + A.dfrA(v) + '</b></p><div class="form">' + choixSuite("sS", "Séances et cures suivantes") + "</div>" + boutons("Enregistrer"));
  document.getElementById("fOk").onclick = () => executer(x, () => majSeance(x, i, k, j, v, false));
};
// Report d'une séance (J8, J15…) avec motif : la date et l'historique sont gardés dans la séance
window.chReporterJ = (id, i, k, j, salle) => {
  const x = trouver(id), L = x.P.lignes[i], e = etatLigne(L, x.P, D().ctx)[k], s0 = seancesCure(L, e, D().ctx.bib).find((z) => z.j === j), d0 = (s0 && s0.prevue) || D().t;
  A.fenetre("<h3>Reporter J" + j + " – cure C" + (k + 1) + " – " + A.esc(x.r.nm) + '</h3><p class="sous">Prévue le ' + A.dfrA(d0) + '</p><div class="form"><div><label for="rD">Nouvelle date</label>' + dateInput("rD", addJ(d0, 7)) + "</div>" +
    '<div><label for="rR">Raison</label><select id="rR">' + RAISONS.map((r) => "<option>" + r + "</option>").join("") + "</select></div>" +
    '<div class="large"><label for="rC">Commentaire</label><input id="rC"></div>' + choixSuite("sS", "Séances et cures suivantes", "suite") + "</div>" + optSalle(salle) + boutons("Reporter", "orange"));
  lierSalle(salle);
  document.getElementById("fOk").onclick = () => executer(x, async () => {
    const nd = A.val("rD"); if (!nd) throw new Error("Indiquez la nouvelle date.");
    await majSeance(x, i, k, j, nd, false, { de: d0, a: nd, raison: A.val("rR"), com: A.val("rC"), le: D().t });
    if (salle) salle(nd);
    if (CM) CM.j = null;
  });
};
async function majSeance(x, i, k, j, nd, valider, rep, ok) {
  const lignes = lignesDe(x), L = lignes[i], c = L.cures[k], Ek = etatLigne(L, x.P, D().ctx), sea = seancesCure(L, Ek[k], D().ctx.bib), s0 = sea.find((z) => z.j === j), old = s0 && s0.prevue;
  c.sea = c.sea || {}; const z = c.sea[j] || { st: "prevue" };
  if (old && nd !== old) {
    if (choix("sS") === "seule") { sea.forEach((o) => { if (o.j > j && o.st !== "recue") { const y = c.sea[o.j] || { st: "prevue" }; if (!y.fixe) y.fixe = o.prevue; c.sea[o.j] = y; } }); figerSuivantes(L, k, Ek); }
    else decalerSuivantes(L, k, ecart(nd, old), x.P);
  }
  if (valider) { z.st = "recue"; z.d = nd; z.valLe = new Date().toISOString(); } else z.fixe = nd;
  if (rep) { z.rep = z.rep || []; z.rep.push(rep); }
  c.sea[j] = z;
  if (valider) { const n = seancesDe(protocoleCure(L, k, D().ctx.bib) || protocoleDe(L, D().ctx.bib)).findIndex((g) => g.j === j); z.fige = figer(L, x, k, n > 0 ? n : 0); if (ok && Object.keys(ok.bio).length) z.fige.bio = ok.bio; if (ok && ok.vig.length) z.fige.vig = ok.vig; } // 2.2 (bilan du jour 2.6, vigilances 12/10)
  await sauverLignes(x, lignes, "Séance J" + j + " de la C" + (k + 1) + (valider ? " validée (" : rep ? " reportée au " : " déplacée au ") + A.dfrA(nd) + (valider ? ")" : rep ? " (" + rep.raison + ")" : ""));
}
window.chAnnulerJ = (id, i, k, j) => {
  const x = trouver(id);
  A.fenetre("<h3>Annuler J" + j + " – cure C" + (k + 1) + " – " + A.esc(x.r.nm) + '</h3><p class="sous">La séance ne sera pas faite (les autres jours et les cures suivantes ne bougent pas).</p><div class="form"><div><label for="aR">Raison</label><select id="aR">' + RAISONS.map((r) => "<option>" + r + "</option>").join("") + '</select></div><div class="large"><label for="aC">Commentaire</label><input id="aC"></div></div>' + boutons("Confirmer l'annulation", "rouge"));
  document.getElementById("fOk").onclick = () => executer(x, async () => {
    const lignes = lignesDe(x), c = lignes[i].cures[k]; c.sea = c.sea || {}; const z = c.sea[j] || {};
    z.st = "annulee"; z.ann = { date: D().t, raison: A.val("aR"), com: A.val("aC") }; delete z.d; delete z.valLe; c.sea[j] = z;
    await sauverLignes(x, lignes, "Séance J" + j + " de la C" + (k + 1) + " annulée (" + A.val("aR") + ")");
    if (CM) CM.j = null;
  });
};
window.chRetablirJ = (id, i, k, j) => {
  const x = trouver(id); if (!confirm("Rétablir la séance J" + j + " (remise en « prévue ») ?")) return;
  direct(x, async () => { const lignes = lignesDe(x), z = lignes[i].cures[k].sea[j]; z.st = "prevue"; delete z.ann; await sauverLignes(x, lignes, "Séance J" + j + " de la C" + (k + 1) + " rétablie"); });
};
window.chAnnulerSeance = (id, i, k, j) => {
  const x = trouver(id); if (!confirm("Annuler la validation de J" + j + " ?")) return;
  direct(x, async () => { const lignes = lignesDe(x), z = lignes[i].cures[k].sea[j]; z.st = "prevue"; delete z.d; delete z.valLe; delete z.fige; await sauverLignes(x, lignes, "Validation de la séance J" + j + " de la C" + (k + 1) + " annulée"); });
};

// ───── Rendez-vous de chimio : « Venu » avec la fenêtre de prix, comme les autres rendez-vous (07/10/2026) ─────
// Secrétaire (droits « encaissements » et « rendezvous », sans « finances ») : le prix est écrit par le serveur (prixConsultation)
export const prixParServeur = () => !A.peut("finances") && A.peut("encaissements") && A.peut("rendezvous");
async function prixChimioServeur(x, lid, n, j, m, date, lib, mode) {
  await A.serveur("prixConsultation", Object.assign({ espace: A.ESPACE, patientId: x.id, lid, n, j, montant: m, d: date || "", lib: lib || "" }, mode ? { mode } : {}));
  delete EC[x.id];
}
window.chVenuChimio = async (pid, lid, n, j, encaisser) => {
  const x = trouver(pid), sec = prixParServeur(); if (!x || !(A.peut("finances") || sec)) return;
  const i = x.P.lignes.findIndex((z) => z.id === lid); if (i < 0) return;
  const L = x.P.lignes[i], { q, e } = etatCure(L, n - 1, x.P), sz = j > 1 ? seancesCure(L, e, D().ctx.bib).find((z) => z.j === j) : null;
  const date = j === 1 ? (e.st === "recue" ? e.c.reelle : e.date) : sz ? sz.d || sz.prevue : e.date;
  let J = {}, mode0 = "";
  if (sec) { const E = EC[x.id] || (await getDoc(doc(db, "espaces", A.ESPACE, "encaissements", x.id)).then((s) => (s.exists() ? JSON.parse(s.data().data || "{}") : null)).catch(() => null)); const v = E && E.cons && E.cons[lid + "|" + n + "|" + j]; if (v) { J[j] = v.m; mode0 = v.mode || ""; } }
  else { const M = await chargerMontants(x), cc0 = (M.cures[lid] || {})[n]; J = consJours(cc0); mode0 = ((cc0 && cc0.consModeJ) || {})[j] || ""; }
  // lieu « payé au cabinet » (19.5) : la secrétaire encaisse (mode de paiement, reçu) ; le médecin valide seulement → « à encaisser »
  const lieuCab = A.payeCabinet(x), cab = lieuCab && A.encaisseIci(), ae = (k) => k === "np" || k === "ae", enc = cab && J[j] != null && ae(mode0);
  const medCab = lieuCab && !A.encaisseIci(), dejaPaye = (!!mode0 && !ae(mode0)) || !!encaisser, encT = enc || (medCab && !!encaisser && J[j] != null && ae(mode0)); // médecin sans secrétaire : « Encaisser maintenant »
  const tC = tarifDe(x, "cchimio", date);
  const pp = A.prixPrevu(pid, "c-" + lid + "-" + n + "-" + j, date); // prix convenu d'avance dans la salle d'attente
  const def = J[j] != null ? J[j] : pp != null ? pp : j === 1 ? tC || 0 : 0, fmt = (v) => A.fmtMil(v);
  A.fenetre("<h3>" + A.esc(x.r.nm) + " – Chimiothérapie C" + n + " J" + j + '</h3><p class="sous">' + A.esc(q.nom) + (date ? " · " + A.cap(A.jourLong(date)) : "") + "</p>" +
    '<div class="form"><div><label for="pvM">Montant de la consultation (DH)</label><input id="pvM" class="mt" inputmode="decimal" value="' + A.esc(fmt(def)) + '"></div>' + (cab ? A.htmlMode(mode0) : medCab ? '<div id="pvEncZ"' + (dejaPaye ? "" : ' class="cache"') + ">" + A.htmlMode(mode0).replace(/^<div>|<\/div>$/g, "") + "</div>" : "") + "</div>" +
    (medCab ? '<label class="chk" style="margin:4px 0 6px"><input type="checkbox" id="pvEncK"' + (dejaPaye ? " checked" : "") + '> Encaisser maintenant (pas de secrétaire : le patient me paie)</label>' : "") +
    '<p class="mesures">J1 : tarif de la consultation de chimiothérapie' + (tC != null ? " (" + fmt(tC) + " DH)" : "") + ". J8, J15… : 0 par défaut. Modifiez le montant en cas de réduction, de gratuité (0) ou de consultation facturée.</p>" +
    '<div class="err" id="fErr"></div><div class="boutons"><button class="bt gris" onclick="fermerFenetre()">Annuler</button>' + (cab || medCab ? '<button class="bt clair' + (medCab && !dejaPaye ? " cache" : "") + '" id="fOkR">' + A.ic("imprimer") + (encT ? "Encaisser et imprimer le reçu" : "Valider et imprimer le reçu") + "</button>" : "") + '<button class="bt vert" id="fOk">' + A.ic("check") + (encT ? "Encaisser" : "Valider : venu") + "</button></div>");
  const valider = async (recu) => {
    const m = parseFloat(A.val("pvM").replace(/[\s\u202f\u00a0]/g, "").replace(",", ".")), mode = cab || (medCab && document.getElementById("pvEncK").checked) ? A.val("pvMode") : lieuCab ? "ae" : "";
    if (isNaN(m) || m < 0) { A.erreur("Indiquez le montant (0 si rien à payer)."); return; }
    const w = recu && mode !== "np" && m > 0 ? window.open("", "_blank") : null; // fenêtre d'impression ouverte tout de suite (bloqueur)
    A.occupe(document.getElementById("fOk"), true);
    try {
      if (sec) await prixChimioServeur(x, lid, n, j, m, date, q.nom, mode);
      else await majMontants(x, (M2) => { const a = M2.cures[lid] = M2.cures[lid] || {}, cc = a[n] = a[n] || {}; cc.consJ = Object.assign({}, consJours(cc), { [j]: m }); majCons(cc); const MJ = Object.assign({}, cc.consModeJ || {}); if (mode) MJ[j] = mode; else delete MJ[j]; if (Object.keys(MJ).length) cc.consModeJ = MJ; else delete cc.consModeJ; });
      A.journal(x, "Chimiothérapie C" + n + " J" + j + " : venu (" + fmt(m) + " DH" + (mode === "ae" ? ", à encaisser" : mode ? ", " + A.libMode(mode) : "") + ")"); A.fermerFenetre(); A.toast("Enregistré."); A.salleVenuChimio(x, lid, n, j, true); A.pageDossier(x.id);
      if (w) A.imprimerRecu(w, x, { d: date || D().t, lib: "Consultation de chimiothérapie", m, mode, cle: "c-" + lid + "-" + n + "-" + j }); // sans le protocole (donnée médicale) ; clé = cleRecuCons (moteur/recus.js)
    } catch (er) { if (w) w.close(); A.occupe(document.getElementById("fOk"), false); A.erreur(er.message || String(er)); }
  };
  document.getElementById("fOk").onclick = () => valider(false);
  if (document.getElementById("fOkR")) document.getElementById("fOkR").onclick = () => valider(true);
  const k0 = document.getElementById("pvEncK"); if (k0) k0.onchange = () => { document.getElementById("pvEncZ").classList.toggle("cache", !k0.checked); document.getElementById("fOkR").classList.toggle("cache", !k0.checked); };
};
window.chAnnulerVenuChimio = (pid, lid, n, j) => {
  const x = trouver(pid), sec = prixParServeur(); if (!x || !(A.peut("finances") || sec)) return;
  if (!confirm("Annuler « Venu » pour la chimiothérapie C" + n + " J" + j + " ?")) return;
  (sec ? prixChimioServeur(x, lid, n, j, null)
    : majMontants(x, (M2) => { const a = M2.cures[lid] = M2.cures[lid] || {}, cc = a[n] = a[n] || {}; const J = Object.assign({}, consJours(cc)); delete J[j]; cc.consJ = J; majCons(cc); }))
    .then(() => { A.journal(x, "Chimiothérapie C" + n + " J" + j + " : statut annulé"); A.toast("Statut annulé."); A.salleVenuChimio(x, lid, n, j, false); A.pageDossier(x.id); }).catch((er) => A.toast(er.message || String(er)));
};

// ───── Montants (consultation de chimio, honoraires) ─────
window.chHon = (id, i, k, j, v) => { const x = trouver(id), L = x.P.lignes[i]; direct(x, () => majMontants(x, (M) => { const a = M.cures[L.id] = M.cures[L.id] || {}, c = a[k + 1] = a[k + 1] || {}; c.hon = c.hon || {}; c.hon[j] = { m: num(v) }; })); };

// ───── Doses (poids, créatinine, % global, % et dose par molécule et par jour) ─────
// Poids, créatinine, % des anticancéreux : à J1 dans la cure, à J8/J15… dans la séance (c.sea[j])
window.chChamp = (id, i, k, f, v, j) => {
  const x = trouver(id); j = j || 1;
  if (seanceValidee(lignesDe(x)[i], k, j)) { A.toast(MSG_VERROU); A.pageDossier(x.id); return; }
  // 2.3 (12/10/2026) : poids hors de 30-200 kg ou qui varie de plus de 10 % depuis la séance précédente → confirmation (médecin et
  // secrétaire) ; le médecin le revoit de toute façon au moment de valider (controleSeance)
  if (f === "poids" && String(v || "").trim()) {
    const w = num(v), L0 = lignesDe(x)[i], E0 = etatLigne(L0, x.P, D().ctx), g0 = seancesDe(protocoleCure(L0, k, D().ctx.bib) || protocoleDe(L0, D().ctx.bib));
    const n0 = Math.max(0, g0.findIndex((z) => z.j === j)), av = E0[k] ? poidsAvant(E0, k, n0) : null, msg = [];
    if (w != null && (w < 30 || w > 200)) msg.push("Poids de " + w + " kg : hors de 30 à 200 kg.");
    if (w != null && av && Math.abs(w - av) / av > 0.1) msg.push("Le poids passe de " + av + " à " + w + " kg (" + (w > av ? "+" : "") + Math.round((w - av) / av * 100) + " %) depuis la séance précédente.");
    if (msg.length && !confirm(msg.join("\n") + "\n\nConfirmer ce poids ?")) { A.pageDossier(x.id); return; }
  }
  if (f === "pctAll" && num(v) > 100 && !confirm("Dose des anticancéreux à " + num(v) + " % (au-dessus de 100 %).\n\nConfirmer ?")) { A.pageDossier(x.id); return; }
  if (f === "poids" && !A.traitMod()) { direct(x, () => poidsSecretaire(x, lignesDe(x)[i], k, j, v)); return; }
  direct(x, async () => {
    const lignes = lignesDe(x), L = lignes[i], c = L.cures[k], w = String(v || "").replace(",", ".").trim();
    let o = c; if (j > 1) { c.sea = c.sea || {}; o = c.sea[j] = c.sea[j] || {}; }
    if (w === "") delete o[f]; else o[f] = w;
    if (f === "pctAll") {
      // un % global remplace les % et doses saisis à la main pour les jours de cette séance
      const q = protocoleCure(L, k, D().ctx.bib) || protocoleDe(L, D().ctx.bib), g = groupes(q), gi = Math.max(0, g.findIndex((z) => z.j === j));
      q.dr.forEach((d) => { eclate(c, d); joursDe(d).forEach((jj) => { if (jourVersSeance(g, jj) === gi) ["pct", "ov"].forEach((t) => { if (c[t]) delete c[t][d.id + "@" + jj]; }); }); });
      ["pct", "ov"].forEach((t) => { if (c[t] && !Object.keys(c[t]).length) delete c[t]; });
    }
    await sauverLignes(x, lignes, { poids: "Poids", creat: "Créatinine", pctAll: "Dose des anticancéreux" }[f] + " de la C" + (k + 1) + (j > 1 ? " J" + j : "") + " modifié(e)");
    if (f === "creat" && w !== "") { // 12/10/2026 : repères rénaux des molécules de la séance → fenêtre pour le médecin (sans bloquer)
      const E2 = etatLigne(L, x.P, D().ctx), g2 = groupes(protocoleCure(L, k, D().ctx.bib) || protocoleDe(L, D().ctx.bib)), G2 = E2[k] && E2[k].g[Math.max(0, g2.findIndex((z) => z.j === j))];
      const m2 = E2[k] && G2 ? reperesClairance(E2[k], G2) : [];
      if (m2.length) setTimeout(() => alert("Fonction rénale (DFG " + G2.cl + " ml/min, Cockcroft-Gault) :\n\n• " + m2.join("\n• ")), 300);
    }
  });
};
// Poids pesé et validé par la secrétaire (droit « planning » seul, 10/10/2026) : gardé dans le planning (poids, spoids[j], pv[j] = qui et
// quand), comme les reports ; fusionner le met dans la cure, repris dans le dossier au prochain enregistrement du médecin
async function poidsSecretaire(x, L, k, j, v) {
  const w = String(v || "").replace(",", ".").trim(), n = k + 1;
  if (!(Number(w) > 0)) throw new Error("Indiquez le poids en kg.");
  const pl = JSON.parse(x.doc.planningJson || "{}"), o = ((pl[L.id] = pl[L.id] || {})[n] = pl[L.id][n] || {});
  if (j > 1) (o.spoids = o.spoids || {})[j] = w; else o.poids = w;
  (o.pv = o.pv || {})[j] = { nom: document.getElementById("nomMenu").textContent, par: D().u.uid, le: new Date().toISOString() };
  const pj = JSON.stringify(pl), cp = cliniquePoids(x, { planningJson: pj }); // R-A5 : la fiche suit (droit « fiche patient »)
  await A.enregistrer(x, Object.assign({ planningJson: pj }, cp ? { clinique: cp } : {}), "Poids de la C" + n + (j > 1 ? " J" + j : "") + " validé : " + w + " kg");
  A.toast("Poids validé : " + w + " kg.");
}
function eclate(c, d) { ["pct", "ov"].forEach((t) => { if (c[t] && num(c[t][d.id]) != null) { joursDe(d).forEach((j) => { if (c[t][d.id + "@" + j] == null) c[t][d.id + "@" + j] = c[t][d.id]; }); delete c[t][d.id]; } }); }
function majDose(id, i, k, did, j, v, type) {
  const x = trouver(id);
  if (seanceValidee(lignesDe(x)[i], k, j)) { A.toast(MSG_VERROU); A.pageDossier(x.id); return; }
  // 12/10/2026 : dose qui semble trop forte (un 0 de trop…) → confirmation ; le médecin garde la main
  const nv = num(v);
  if (nv != null && nv > 0) {
    const L0 = lignesDe(x)[i], E0 = etatLigne(L0, x.P, D().ctx), e0 = E0[k], xi = e0 ? e0.ids.indexOf(did) : -1, z0 = xi >= 0 ? e0.dj[xi][j] : null, nom = xi >= 0 ? e0.prod[xi].p : did;
    if (type === "pct" && nv > 100 && !confirm(nom + " : " + nv + " % de la dose du protocole (au-dessus de 100 %).\n\nConfirmer ?")) { A.pageDossier(x.id); return; }
    if (type === "ov" && z0 && z0.v && nv > z0.v * 1.1 && !confirm(nom + " : " + nv + " mg, soit " + Math.round((nv / z0.v) * 100) + " % de la dose calculée (" + z0.v + " mg).\n\nConfirmer cette dose ?")) { A.pageDossier(x.id); return; }
  }
  direct(x, async () => {
    const lignes = lignesDe(x), L = lignes[i], c = L.cures[k], q = protocoleCure(L, k, D().ctx.bib) || protocoleDe(L, D().ctx.bib), d = q.dr.find((z) => z.id === did), key = did + "@" + j, w = String(v || "").replace(",", ".").trim();
    c.pct = c.pct || {}; c.ov = c.ov || {}; if (d) eclate(c, d);
    if (type === "pct") { if (w === "") delete c.pct[key]; else c.pct[key] = w; delete c.ov[key]; } else { if (w === "") delete c.ov[key]; else c.ov[key] = w; }
    if (!Object.keys(c.pct).length) delete c.pct; if (!Object.keys(c.ov).length) delete c.ov;
    await sauverLignes(x, lignes, "Dose de " + (d ? d.p : did) + " (J" + j + ") de la C" + (k + 1) + " modifiée");
  });
}
window.chPct = (id, i, k, did, j, v) => majDose(id, i, k, did, j, v, "pct");
window.chOv = (id, i, k, did, j, v) => majDose(id, i, k, did, j, v, "ov");

// ───── Molécules ajoutées ou retirées à partir d'une cure ─────
const UNITES = [["mg/m²", "mg/m²"], ["mg/kg", "mg/kg"], ["mg", "mg (dose fixe)"], ["AUC", "AUC (carboplatine)"], ["txt", "Texte libre (sans calcul)"]];
const nomsMol = () => { const s = {}; Object.values(D().ctx.bib).forEach((p) => (p.dr || []).forEach((d) => { if (d.u !== "txt") s[d.p] = 1; })); return Object.keys(s).sort((a, z) => a.localeCompare(z, "fr")); };
const aPartir = (k, j) => "C" + (k + 1) + (j > 1 ? " J" + j : "");
window.chAjMol = (id, i, k, j) => {
  const x = trouver(id); j = j || 1;
  A.fenetre("<h3>Ajouter une molécule à partir de " + (j > 1 ? "la séance " : "la cure ") + aPartir(k, j) + '</h3><div class="form"><div class="large"><label for="mP">Produit</label><input id="mP" list="lMol" placeholder="Taper pour chercher ou saisir…"><datalist id="lMol">' + nomsMol().map((n) => '<option value="' + A.esc(n) + '">').join("") + "</datalist></div>" +
    '<div><label for="mU">Unité</label><select id="mU">' + UNITES.map((u) => '<option value="' + u[0] + '">' + u[1] + "</option>").join("") + '</select></div><div id="zD"><label for="mD">Dose</label><input id="mD" inputmode="decimal"></div><div id="zT" class="cache"><label for="mT">Posologie (texte)</label><input id="mT" placeholder="ex. 30 MU / injection"></div>' +
    '<div><label for="mJ">Jours du cycle (ex. 1 ou 1,8,15)</label><input id="mJ" value="' + j + '"></div><div><label for="mV">Voie</label><input id="mV" placeholder="IV, SC, Per os…"></div><div><label for="mDu">Durée</label><input id="mDu" placeholder="ex. 30 min"></div><div><label for="mN">Précision (facultatif)</label><input id="mN"></div></div>' + boutons("Ajouter"));
  document.getElementById("mU").onchange = () => { const t = A.val("mU") === "txt"; document.getElementById("zD").classList.toggle("cache", t); document.getElementById("zT").classList.toggle("cache", !t); };
  document.getElementById("fOk").onclick = () => executer(x, async () => {
    const p = A.val("mP"), u = A.val("mU"), d = num(A.val("mD")), t = A.val("mT"), js = A.val("mJ").split(/[^0-9]+/).map(Number).filter((z) => z > 0);
    if (!p || !js.length || (u !== "txt" && d == null) || (u === "txt" && !t)) throw new Error("Remplissez le produit, la dose (ou la posologie) et les jours.");
    const m = { id: "m" + Date.now(), p, u, j: js, v: A.val("mV"), t: A.val("mDu") }; if (u === "txt") { m.pos = t; m.dt = t; } else m.d = d; if (A.val("mN")) m.n = A.val("mN");
    if (j > 1 && !js.some((y) => y >= j)) throw new Error("Indiquez au moins un jour à partir de J" + j + " (les jours d'avant de cette cure sont passés).");
    const lignes = lignesDe(x), L = lignes[i]; L.mods = L.mods || []; const md = { k, op: "add", d: m }; if (j > 1) md.j = j; L.mods.push(md);
    await sauverLignes(x, lignes, p + " ajouté à partir de " + aPartir(k, j));
  });
};
window.chRetMol = (id, i, k, j) => {
  const x = trouver(id), L = x.P.lignes[i], q = protocoleCure(L, k, D().ctx.bib) || protocoleDe(L, D().ctx.bib); j = j || 1;
  const l = q.dr.filter((d) => j === 1 || (d.j || [1]).some((y) => y === 99 || y >= j));
  A.fenetre("<h3>Retirer une molécule à partir de " + (j > 1 ? "la séance " : "la cure ") + aPartir(k, j) + '</h3><p class="sous">' + (j > 1 ? "Les jours précédents de cette cure et les cures précédentes gardent la molécule." : "Les cures précédentes gardent la molécule.") + "</p>" + l.map((d) => '<div class="rdv"><div class="tx">' + A.esc(d.p) + ' <span class="mesures">' + A.esc((d.j || []).filter((y) => y !== 99).map((y) => "J" + y).join(" ")) + "</span></div>" + b("Retirer", "chOkRet('" + id + "'," + i + "," + k + ",'" + A.esc(d.id) + "'," + j + ")", "rouge") + "</div>").join("") + '<div class="boutons"><button class="bt gris" onclick="chSousAnnuler()">Fermer</button></div>');
};
window.chOkRet = (id, i, k, did, j) => { const x = trouver(id); j = j || 1; direct(x, async () => { const lignes = lignesDe(x), L = lignes[i], q = protocoleCure(L, k, D().ctx.bib) || protocoleDe(L, D().ctx.bib), d = q.dr.find((z) => z.id === did); L.mods = L.mods || []; const md = { k, op: "del", id: did, nom: d ? d.p : did }; if (j > 1) md.j = j; L.mods.push(md); await sauverLignes(x, lignes, (d ? d.p : did) + " retiré à partir de " + aPartir(k, j)); }); };
window.chAnnMod = (id, i, k, j) => { const x = trouver(id); if (!confirm("Annuler cette modification ?")) return; direct(x, async () => { const lignes = lignesDe(x); lignes[i].mods.splice(j, 1); await sauverLignes(x, lignes, "Modification des molécules annulée (C" + (k + 1) + ")"); }); };

// ───── Lignes ─────
window.chAjouterCure = (id, i) => { const x = trouver(id); direct(x, async () => { const lignes = lignesDe(x); lignes[i].cures.push({}); await sauverLignes(x, lignes, "Cure ajoutée (" + lignes[i].cures.length + " cures)"); }); };
window.chReprendre = (id, i) => { const x = trouver(id); if (!confirm("Reprendre cette ligne de traitement ?")) return; direct(x, async () => { const lignes = lignesDe(x); delete lignes[i].arret; await sauverLignes(x, lignes, "Ligne reprise"); }); };
window.chSupprLigne = (id, i) => {
  const x = trouver(id), p = protocoleDe(x.P.lignes[i], D().ctx.bib);
  if (!confirm("Supprimer définitivement cette ligne (" + p.nom + ") et toutes ses cures ?")) return;
  direct(x, async () => { const lignes = lignesDe(x); lignes.splice(i, 1); SEL.c = null; await sauverLignes(x, lignes, "Ligne supprimée : " + p.nom); SEL.l = ligneCourante(x.P, D().ctx); });
};
window.chArreter = (id, i) => {
  const x = trouver(id);
  A.fenetre("<h3>Arrêter la ligne – " + A.esc(x.r.nm) + '</h3><div class="form"><div><label for="aD">Date d\'arrêt</label>' + dateInput("aD", D().t) + '</div><div><label for="aR">Raison</label><select id="aR">' + ["Progression", "Toxicité", "Décision médicale", "Fin de traitement", "Autre"].map((r) => "<option>" + r + "</option>").join("") + '</select></div><div class="large"><label for="aC">Commentaire</label><input id="aC"></div></div>' + boutons("Confirmer", "rouge"));
  document.getElementById("fOk").onclick = () => executer(x, async () => { const lignes = lignesDe(x); lignes[i].arret = { date: A.val("aD"), raison: A.val("aR"), com: A.val("aC") }; await sauverLignes(x, lignes, "Ligne arrêtée (" + A.val("aR") + ")"); });
};

// ───── Tableau des molécules modifiable (nouvelle ligne et protocole de la ligne), comme l'application actuelle ─────
const UNITES_ED = [["mg/m²", "mg/m²"], ["mg/kg", "mg/kg"], ["mg", "mg (dose fixe)"], ["AUC", "AUC (carboplatine)"], ["mg_c1", "mg charge C1 / suite"], ["mg/kg_c1", "mg/kg charge C1 / suite"], ["txt", "texte libre"]];
let ED = null, REDRAW = null; // protocole en cours de modification et fonction de réaffichage
export function editerAvec(ed, redraw) { ED = ed; REDRAW = redraw; }
const hasAUC = (p) => (p.dr || []).some((d) => d.u === "AUC");
export function tableMol() {
  const esc = A.esc;
  let h = '<div class="tableau"><table class="tcures ed"><tr><th>Produit</th><th>Dose</th><th>Unité</th><th>Jours (ex. 1,8,15)</th><th>Libellé jour</th><th>Précision</th><th>Voie</th><th>Soluté + volume</th><th>Durée</th><th title="Dose maximale, arrondi, rythme">Options</th><th></th></tr>';
  ED.dr.forEach((d, i) => {
    const dose = d.u === "txt" ? d.pos || "" : d.u === "mg_c1" || d.u === "mg/kg_c1" ? (d.c1 == null ? "" : d.c1 + "/" + d.cn) : d.d == null ? "" : d.d;
    const inp = (v, f, w, l) => '<td><input' + (l ? ' list="' + l + '"' : "") + ' value="' + esc(v == null ? "" : v) + '" style="min-width:' + (w || 70) + 'px" onchange="edSet(' + i + ",'" + f + "',this.value)\"></td>";
    h += "<tr>" + inp(d.p, "p", 190, "dmol") + inp(dose, "dose", 70) + '<td><select onchange="edSet(' + i + ",'u',this.value)\">" + UNITES_ED.map((u) => '<option value="' + u[0] + '"' + (u[0] === d.u ? " selected" : "") + ">" + u[1] + "</option>").join("") + "</select></td>" +
      inp((d.j || []).filter((x) => x !== 99).join(","), "j", 80) + inp(d.jl, "jl", 90) + inp(d.n, "n", 80) + inp(d.v, "v", 60) + inp(d.s, "s", 110) + inp(d.t, "t", 60) + options(d, i) +
      '<td style="white-space:nowrap"><button class="mini" title="Monter" onclick="edMonter(' + i + ')">↑</button><button class="mini rouge" title="Retirer" onclick="edRetirer(' + i + ')">−</button></td></tr>';
  });
  return h + '</table></div><datalist id="dmol">' + DICT.map((x) => '<option value="' + esc(x.split("|")[0]) + '">').join("") + "</datalist>" +
    '<div class="actr" style="justify-content:flex-start;margin-top:8px"><button class="bt vert petit" onclick="edAjout()">+ Ajouter une molécule</button><button class="bt vert petit" onclick="edAjout(\'niv\')">+ Nivestim 30 MU</button></div>';
}
// 2.4 (12/10/2026) : options d'une molécule, déjà calculées par le moteur (moteur/doses.js) : dose maximale (mg), arrondi (décimales),
// « tous les n cycles », « C1 seule », « sauf C1 »
function options(d, i) {
  if (d.u === "txt") return "<td></td>";
  const esc = A.esc, ch = (f, l) => '<label style="font-weight:normal;white-space:nowrap"><input type="checkbox" style="width:auto;margin:0 3px 0 6px"' + (d[f] ? " checked" : "") + ' onchange="edOpt(' + i + ",'" + f + "',this.checked)\">" + l + "</label>";
  return '<td style="white-space:nowrap"><input title="Dose maximale (mg)" placeholder="max mg" value="' + esc(d.max == null ? "" : d.max) + '" style="width:72px" onchange="edSet(' + i + ",'max',this.value)\">" +
    '<select title="Arrondi de la dose" onchange="edSet(' + i + ",'dec',this.value)\">" + [["", "arrondi à 1 mg"], ["1", "0,1 mg"], ["2", "0,01 mg"]].map(([v, l]) => '<option value="' + v + '"' + (String(d.dec == null ? "" : d.dec) === v ? " selected" : "") + ">" + l + "</option>").join("") + "</select>" +
    '<input title="Tous les n cycles (vide = chaque cycle)" placeholder="tous n" value="' + esc(d.tous || "") + '" style="width:58px" onchange="edSet(' + i + ",'tous',this.value)\">" +
    '<input title="Seulement aux cures 1 à n (vide = toutes)" placeholder="C1→n" value="' + esc(d.cmax || "") + '" style="width:58px" onchange="edSet(' + i + ",'cmax',this.value)\">" + ch("c1s", "C1 seule") + ch("nc1", "sauf C1") + "</td>";
}
window.edOpt = (i, f, v) => { const d = ED.dr[i]; if (v) d[f] = 1; else delete d[f]; if (f === "c1s" && v) delete d.nc1; if (f === "nc1" && v) delete d.c1s; REDRAW(); };
window.edSet = (i, f, v) => {
  const d = ED.dr[i]; v = String(v).trim();
  if (f === "p") { d.p = v; const m = DICT.find((x) => x.split("|")[0] === v); if (m && !d.v) { d.v = m.split("|")[1]; REDRAW(); } }
  else if (f === "dose") { if (d.u === "txt") d.pos = v; else if (d.u === "mg_c1" || d.u === "mg/kg_c1") { const t = v.split("/"); d.c1 = num(t[0]); d.cn = num(t[1] != null ? t[1] : t[0]); } else d.d = num(v); }
  else if (f === "u") { const old = d.u; d.u = v; if (v === "txt") d.pos = d.pos || (d.d != null ? d.d + " " + old : ""); if ((v === "mg_c1" || v === "mg/kg_c1") && d.c1 == null) { d.c1 = d.d; d.cn = d.d; } if (v !== "txt" && v.indexOf("_c1") < 0 && d.d == null && d.c1 != null) d.d = d.c1; REDRAW(); }
  else if (f === "max" || f === "dec" || f === "tous" || f === "cmax") { const n = f === "max" ? num(v) : parseInt(v, 10); if (n == null || isNaN(n) || n <= 0 && f !== "dec" || (f === "dec" && !(n >= 0))) delete d[f]; else d[f] = n; }
  else if (f === "j") { const js = v.split(/[^0-9]+/).filter(Boolean).map(Number); d.j = js.length ? js : [99]; if (!js.length) { d.nd = 1; d.jl = d.jl || "Selon prescription"; } else delete d.nd; }
  else if (v) d[f] = v; else delete d[f];
};
window.edMonter = (i) => { if (i < 1) return; const t = ED.dr[i]; ED.dr[i] = ED.dr[i - 1]; ED.dr[i - 1] = t; REDRAW(); };
window.edRetirer = (i) => { ED.dr.splice(i, 1); REDRAW(); };
window.edAjout = (t) => {
  const id = "d" + Date.now() + "_" + Math.floor(Math.random() * 1e3);
  if (t === "niv") ED.dr.push({ id, p: "NIVESTIM 30 MU (filgrastim)", u: "txt", j: [99], jl: "Selon prescription", v: "SC", pos: "30 MU / injection SC", dt: "× ____ injection(s)", inp: 1, nd: 1 });
  else ED.dr.push({ id, p: "", u: "mg/m²", j: [1], d: null });
  REDRAW();
};
export function edValide() {
  if (!ED.nom) throw new Error("Donnez un nom au protocole.");
  ED.dr.forEach((d, i) => {
    if (!d.p) throw new Error("Ligne " + (i + 1) + " : nom du produit manquant.");
    if (d.u === "txt") { d.dt = d.dt && d.dt.indexOf("____") >= 0 ? d.dt : d.pos || ""; return; }
    if ((d.u === "mg_c1" || d.u === "mg/kg_c1") ? d.c1 == null || d.cn == null : d.d == null) throw new Error("Ligne " + (i + 1) + " (" + d.p + ") : dose manquante.");
  });
  if (!ED.no || !ED.no.length) delete ED.no;
}

// ───── Voir / modifier le protocole de la ligne (pour ce patient uniquement) ─────
window.chProto = (id, i) => {
  const x = trouver(id), L = x.P.lignes[i], okT = A.traitMod(), esc = A.esc;
  ED = JSON.parse(JSON.stringify(protocoleDe(L, D().ctx.bib)));
  if (!okT) {
    A.fenetre("<h3>Protocole de la ligne " + (i + 1) + "</h3><p><b>" + esc(ED.nom) + '</b><br><span class="mesures">' + esc(ED.r || "") + '</span></p><div class="tableau"><table class="tcures"><tr><th>Produit</th><th>Posologie</th><th>Jours</th><th>Voie</th><th>Durée</th></tr>' + ED.dr.map((d) => "<tr><td>" + esc(d.p) + "</td><td>" + esc(poso(d)) + "</td><td>" + esc(d.jl || (d.j || []).filter((y) => y !== 99).map((y) => "J" + y).join(" ")) + "</td><td>" + esc(d.v || "") + "</td><td>" + esc(d.t || "") + "</td></tr>").join("") + '</table></div><div class="boutons"><button class="bt gris" onclick="fermerFenetre()">Fermer</button></div>', "large");
    return;
  }
  REDRAW = () => {
    A.fenetre("<h3>Protocole de la ligne " + (i + 1) + " — modifié pour ce patient uniquement</h3>" +
      '<div class="form" style="grid-template-columns:2fr 1fr"><div><label>Nom du protocole (schéma compris)</label><input value="' + esc(ED.nom) + '" onchange="edProp(\'nom\',this.value)"></div><div><label>Cycle (jours, 0 = continu)</label><input inputmode="numeric" value="' + esc(ED.c || 0) + '" onchange="edProp(\'c\',this.value)"></div>' +
      '<div class="large"><label>Rythme / observations</label><input value="' + esc(ED.r || "") + '" onchange="edProp(\'r\',this.value)"></div></div>' +
      '<h4 class="soustitre">Molécules</h4>' + tableMol() +
      '<div class="form" style="margin-top:12px"><div class="large"><label>Remarques (une par ligne)</label><textarea rows="3" onchange="edProp(\'no\',this.value)">' + esc((ED.no || []).join("\n")) + "</textarea></div></div>" +
      '<p class="mesures">Unités : mg/m² × surface corporelle ; mg/kg × poids ; mg = dose fixe ; AUC = carboplatine (Calvert) ; « charge C1 / suite » : saisir par ex. 840/420 ; texte libre : affiché tel quel.</p>' + boutons("Enregistrer pour ce patient", "vert"), "large");
    document.getElementById("fOk").onclick = () => executer(x, async () => {
      edValide(); const lignes = lignesDe(x), L2 = lignes[i]; dedupIds(ED); L2.pr = ED;
      const ids = ED.dr.map((d) => d.id);
      L2.cures.forEach((c) => ["ov", "pct"].forEach((t) => { if (c[t]) { Object.keys(c[t]).forEach((k) => { if (ids.indexOf(k.split("@")[0]) < 0) delete c[t][k]; }); if (!Object.keys(c[t]).length) delete c[t]; } }));
      await sauverLignes(x, lignes, "Protocole de la ligne " + (i + 1) + " modifié");
    });
  };
  REDRAW();
};
window.edProp = (f, v) => { if (f === "c") ED.c = parseInt(v, 10) || 0; else if (f === "no") ED.no = String(v).split("\n").map((z) => z.trim()).filter(Boolean); else ED[f] = String(v).trim(); };

// ───── Nouvelle ligne de traitement (même déroulé que l'application actuelle) ─────
let NL = null, CF = null;
const sansAccents = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const molecules = (p) => (p.dr || []).map((d) => d.p).filter((n) => !/SOLUMEDROL|ONSET|ATARAX|ATROPINE|Retrait|Fin du diffuseur/.test(n)).join(", ");
const BIB = () => Object.values(D().ctx.bib).filter((p) => p && p.nom && !p.cache);
const CLES = ["c", "o", "s", "g"];
// Menus déroulants en cascade Type de cancer › Localisation › Situation › Sous-groupe (aussi utilisés par la page Protocoles)
export function valeursCascade(liste, F, n) { const v = []; liste.forEach((p) => (p.ind || []).forEach((x) => { if (n > 0 && x[0] !== F.c) return; if (n > 1 && x[1] !== F.o) return; if (n > 2 && x[2] !== F.s) return; if (x[n] && v.indexOf(x[n]) < 0) v.push(x[n]); })); return v.sort((a, z) => a.localeCompare(z, "fr", { sensitivity: "base" })); }
export function menusCascade(liste, F, fn) {
  const esc = A.esc, LIB = ["Type de cancer", "Localisation", "Situation", "Sous-groupe"]; let h = '<div class="cascade">';
  CLES.forEach((k, n) => {
    const actif = n === 0 || F[CLES[n - 1]], v = actif ? valeursCascade(liste, F, n) : [];
    if (n > 0 && actif && !v.length) return; // pas de niveau supplémentaire pour ce choix
    // Safari (12/10/2026, « un problème récurrent est survenu ») : le menu changé est remplacé APRÈS son événement (menu fermé, blur),
    // jamais pendant : Safari plante si l'on retire un <select> pendant son « change »
    h += '<div><label>' + LIB[n] + '</label><select onchange="const v=this.value;this.blur();setTimeout(()=>' + fn + "(" + n + ',v),30)"' + (actif ? "" : " disabled") + '><option value="">' + (actif ? (n === 0 ? "Tous les cancers" : "Toutes") : "—") + "</option>" +
      v.map((x) => '<option value="' + esc(x) + '"' + (F[k] === x ? " selected" : "") + ">" + esc(x) + "</option>").join("") + "</select></div>";
  });
  return h + "</div>";
}
function valeurs(n) { return valeursCascade(BIB(), CF, n); }
function resultats() {
  const q = sansAccents(CF.q).split(/\s+/).filter(Boolean);
  return BIB().filter((p) => {
    if (CF.fav && !p.fav) return false;
    if (CF.c && !(p.ind || []).some((x) => x[0] === CF.c && (!CF.o || x[1] === CF.o) && (!CF.s || x[2] === CF.s) && (!CF.g || x[3] === CF.g))) return false;
    if (q.length) { const h = sansAccents(p.nom + " " + molecules(p) + " " + (p.ind || []).map((x) => x.join(" ")).join(" ")); if (!q.every((w) => h.indexOf(w) >= 0)) return false; }
    return true;
  }).sort((a, b) => a.nom.localeCompare(b.nom, "fr", { sensitivity: "base" }));
}
function puces(n, lbl) {
  const v = valeurs(n); if (!v.length) return "";
  return '<div class="puces"><span class="tl">' + lbl + '</span><button class="puce' + (CF[CLES[n]] ? "" : " on") + '" onclick="nlChoix(' + n + ',-1)">Tous</button>' + v.map((x, i) => '<button class="puce' + (CF[CLES[n]] === x ? " on" : "") + '" onclick="nlChoix(' + n + "," + i + ')">' + A.esc(x) + "</button>").join("") + "</div>";
}
function listeProtos() {
  const r = resultats(), esc = A.esc;
  if (!r.length) return '<p class="sous">Aucun protocole.</p>';
  return '<p class="mesures" style="margin:6px 0">' + r.length + " protocole" + (r.length > 1 ? "s" : "") + "</p>" + r.map((p) => {
    const ok = protocoleValide(p);
    return '<div class="proto' + (ok ? "" : " off") + '"' + (ok ? ' onclick="nlProto(\'' + esc(p.id) + "')\"" : "") + '><span class="etoile">' + (p.fav ? '<svg class="pi plein or"><use href="#i-etoile"/></svg>' : "") + '</span><div><b>' + esc(p.nom) + "</b> " + (ok ? '<span class="badge b-ch"><svg class="pi"><use href="#i-check"/></svg>Validé</span>' : '<span class="badge b-or"><i class="dot j"></i>Non validé</span>') + (p.assoc ? ' <span class="badge b-gr">associé</span>' : "") + '<div class="mesures">' + esc(molecules(p)) + (p.c ? " – cycle " + p.c + " j" : "") + "</div></div></div>";
  }).join("");
}
function dessinerNL() {
  const x = trouver(NL.pid), esc = A.esc;
  if (!NL.p) {
    if (CF.c && !CF.o) { const o = valeurs(1); if (o.length === 1) CF.o = o[0]; }
    let h = "<h3>Nouvelle ligne de traitement</h3>" + menusCascade(BIB(), CF, "nlChoixV");
    h += '<div class="actr" style="justify-content:flex-start;margin-top:8px;flex-wrap:nowrap"><input id="nlQ" class="champ" style="flex:1;min-width:0" placeholder="Rechercher : molécule, protocole ou situation (ex. pertuzumab, sein adjuvant)…" value="' + esc(CF.q) + '">' +
      '<button class="bt ' + (CF.fav ? "plein" : "clair") + ' petit" onclick="nlFav()"><svg class="pi"><use href="#i-etoile"/></svg>Favoris</button><button class="bt gris petit" onclick="nlReinit()">Réinitialiser</button></div>' +
      '<div id="nlL" class="liste-protos">' + listeProtos() + '</div><div class="boutons"><button class="bt gris" onclick="fermerFenetre()">Annuler</button></div>';
    A.fenetre(h, "large");
    const q = document.getElementById("nlQ"); q.oninput = () => { CF.q = q.value; document.getElementById("nlL").innerHTML = listeProtos(); };
    if (CF.q) { q.focus(); q.setSelectionRange(q.value.length, q.value.length); }
    return;
  }
  const p = D().ctx.bib[NL.p], auc = hasAUC(ED), P = x.P;
  const cl = auc ? clairance(age(P.ddn, NL.j1), num(NL.po), num(NL.cr), P.sexe, "mgL") : null;
  const ch = (lib, f, v, typ) => "<div><label>" + lib + '</label><input class="req"' + (typ === "date" ? ' type="date"' : ' inputmode="decimal"') + ' value="' + esc(v == null ? "" : v) + '" onchange="nlSet(\'' + f + "',this.value)\"></div>";
  A.fenetre("<h3>Nouvelle ligne de traitement</h3>" +
    '<div class="bloc gris"><b>' + esc(p.nom) + '</b><br><span class="mesures">' + esc(p.r || "") + '</span> <button class="mini" onclick="nlChanger()">Changer de protocole</button>' +
      '<br><span class="mesures">Intention : <b>' + esc(libIntention(NL) || "non précisée") + '</b></span> <button class="mini" onclick="nlIntention()">Modifier</button></div>' +
    '<div class="form grille-nl" style="margin-top:12px">' + (ED.c ? ch("Nombre de cures *", "nb", NL.nb) : "") + ch("Date J1 *", "j1", NL.j1, "date") + ch("Poids (kg) *", "po", NL.po) +
    (auc ? ch("Créatinine (mg/L) *", "cr", NL.cr) + '<div><label>Clairance (Cockcroft) – automatique</label><input disabled value="' + (cl ? cl + " ml/min" : P.sexe ? "—" : "sexe manquant") + '"></div>' : "") +
    '<div><label>Cycle (jours, 0 = continu)</label><input inputmode="numeric" value="' + esc(ED.c || 0) + '" onchange="nlSet(\'c\',this.value)"></div>' +
    '<div><label>Dose des anticancéreux (%)</label><input inputmode="decimal" value="' + esc(NL.pct) + '" onchange="nlSet(\'pct\',this.value)"></div></div>' +
    (auc && !P.sexe ? '<p style="color:var(--rouge);font-size:13px"><svg class="pi"><use href="#i-alerte"/></svg>Renseigner le sexe du patient (Modifier l\'identité) pour calculer la clairance.</p>' : "") +
    '<h4 class="soustitre">Molécules <span class="mesures">(modifiables pour ce patient : + pour ajouter, − pour retirer)</span></h4>' + tableMol() +
    boutons("Créer la ligne", "vert"), "large");
  document.getElementById("fOk").onclick = () => executer(x, async () => {
    const nb = ED.c ? parseInt(NL.nb, 10) : 1;
    if (!nb || !NL.j1 || !num(NL.po) || (auc && !num(NL.cr))) throw new Error("Merci de remplir les champs obligatoires (*).");
    if (!ED.dr.length) throw new Error("Le protocole ne contient aucune molécule.");
    edValide(); dedupIds(ED);
    const cures = []; for (let n = 0; n < nb; n++) cures.push({});
    if (num(NL.pct) != null && num(NL.pct) !== 100) cures[0].pctAll = String(num(NL.pct));
    const lignes = lignesDe(x); lignes.push({ id: "L" + Date.now() + Math.floor(Math.random() * 1000), protoId: p.id, pr: ED, assoc: p.assoc ? 1 : 0, ...(NL.intent ? { intent: NL.intent } : {}), ...(NL.rang ? { rang: NL.rang } : {}), j1: NL.j1, poids: String(num(NL.po)), creat: NL.cr ? String(num(NL.cr)) : "", crU: "mgL", cures });
    await sauverLignes(x, lignes, "Nouvelle ligne : " + ED.nom, { poids: String(num(NL.po)) });
    SEL.pid = x.id; SEL.l = lignes.length - 1; SEL.c = null;
  });
}
// 12/10/2026 (signalé par Dr Bentahila : « la page se recharge, je n'arrive plus à choisir ») : un choix dans les menus ne redessine plus
// toute la fenêtre (saisie, défilement et menu ouvert perdus, surtout sur téléphone) : seuls les menus et la liste des protocoles changent
function majCascade() {
  const zc = document.querySelector("#fenetre .cascade"), zl = document.getElementById("nlL");
  if (!zc || !zl || NL.p) { dessinerNL(); return; }
  if (CF.c && !CF.o) { const o = valeurs(1); if (o.length === 1) CF.o = o[0]; }
  zc.outerHTML = menusCascade(BIB(), CF, "nlChoixV"); zl.innerHTML = listeProtos();
}
window.nlChoixV = (n, v) => { CF[CLES[n]] = v || ""; for (let k = n + 1; k < 4; k++) CF[CLES[k]] = ""; majCascade(); };
window.nlChoix = (n, i) => { CF[CLES[n]] = i < 0 ? "" : valeurs(n)[i]; for (let k = n + 1; k < 4; k++) CF[CLES[k]] = ""; majCascade(); };
window.nlFav = () => { CF.fav = CF.fav ? 0 : 1; dessinerNL(); };
window.nlReinit = () => { CF = { c: "", o: "", s: "", g: "", q: "", fav: 0 }; dessinerNL(); };
// 3.7 (12/10/2026, demande de Dr Bentahila) – intention de la ligne : néoadjuvante, adjuvante, métastatique (+ rang : 1re, 2e… ligne ;
// palliative = métastatique), concomitante (avec la radiothérapie) ; L.intent / L.rang ; affichée dans l'en-tête de la ligne
const INTENTIONS = [["neo", "Néoadjuvante"], ["adj", "Adjuvante"], ["meta", "Métastatique"], ["conc", "Concomitante"]];
const rangLib = (n) => (+n === 1 ? "1re" : (+n || 1) + "e") + " ligne";
export const libIntention = (L) => { const t = (INTENTIONS.find((z) => z[0] === L.intent) || [])[1]; return !t ? "" : L.intent === "meta" ? t + " · " + rangLib(L.rang) : t; };
function fenetreIntention(titre, o, ok, passer) {
  const esc = A.esc, cle = o.intent || "", rang = o.rang || 1;
  A.fenetre("<h3>" + esc(titre) + '</h3><p class="sous">Intention de la ligne de chimiothérapie</p><div class="puces" id="itP">' + INTENTIONS.map(([k, l]) => '<button type="button" class="puce' + (k === cle ? " on" : "") + '" data-k="' + k + '">' + l + (k === "conc" ? " (avec la radiothérapie)" : "") + "</button>").join("") + "</div>" +
    '<div class="form' + (cle === "meta" ? "" : " cache") + '" id="itR" style="margin-top:10px"><div><label for="itRang">Ligne métastatique n°</label><select id="itRang">' + [1, 2, 3, 4, 5, 6, 7, 8].map((n) => '<option value="' + n + '"' + (n === +rang ? " selected" : "") + ">" + rangLib(n) + "</option>").join("") + "</select></div></div>" +
    '<div class="err" id="fErr"></div><div class="boutons"><button class="bt gris" id="itNon">' + (passer ? "Passer" : "Annuler") + '</button><button class="bt plein" id="fOk">Continuer</button></div>');
  let k0 = cle; const zone = document.getElementById("itP");
  zone.onclick = (ev) => { const bt = ev.target.closest("[data-k]"); if (!bt) return; k0 = bt.dataset.k; zone.querySelectorAll(".puce").forEach((z) => z.classList.toggle("on", z === bt)); document.getElementById("itR").classList.toggle("cache", k0 !== "meta"); };
  document.getElementById("itNon").onclick = () => (passer ? passer() : A.fermerFenetre());
  document.getElementById("fOk").onclick = () => { if (!k0) { A.erreur("Choisissez l'intention (ou « Passer »)."); return; } ok({ intent: k0, rang: k0 === "meta" ? +A.val("itRang") || 1 : null }); };
}
const rangSuivant = (x) => (lignesDe(x).filter((L) => L.intent === "meta").reduce((m, L) => Math.max(m, +L.rang || 0), 0) || 0) + 1;
window.chIntention = (id, i) => {
  const x = trouver(id), L = lignesDe(x)[i]; if (!L) return;
  fenetreIntention("Ligne " + (i + 1) + " — " + ((protocoleDe(L, D().ctx.bib) || {}).nom || ""), { intent: L.intent, rang: L.rang || rangSuivant(x) }, (o) => executer(x, async () => {
    const lignes = lignesDe(x), L2 = lignes[i]; L2.intent = o.intent; if (o.rang) L2.rang = o.rang; else delete L2.rang;
    await sauverLignes(x, lignes, "Intention de la ligne : " + libIntention(L2));
  }));
};
window.nlProto = (pid) => { const x = trouver(NL.pid); ED = JSON.parse(JSON.stringify(D().ctx.bib[pid])); delete ED.fav; NL = Object.assign(NL, { p: pid, nb: 6, j1: D().t, po: x.P.poids || "", cr: "", pct: 100, intent: "", rang: null }); REDRAW = dessinerNL;
  // fenêtre intermédiaire : l'intention de la ligne, puis les paramètres de la ligne
  fenetreIntention(ED.nom, { rang: rangSuivant(x) }, (o) => { NL.intent = o.intent; NL.rang = o.rang; dessinerNL(); }, () => dessinerNL()); };
window.nlChanger = () => { NL.p = null; dessinerNL(); };
window.nlIntention = () => { const x = trouver(NL.pid); fenetreIntention(ED.nom, { intent: NL.intent, rang: NL.rang || rangSuivant(x) }, (o) => { NL.intent = o.intent; NL.rang = o.rang; dessinerNL(); }, () => dessinerNL()); };
window.nlSet = (f, v) => { if (f === "c") { ED.c = parseInt(v, 10) || 0; dessinerNL(); return; } NL[f] = String(v).trim(); if (f === "po" || f === "cr" || f === "j1") dessinerNL(); };

// Avant la ligne : date de naissance, sexe, taille et poids sont nécessaires au calcul des doses
window.chNouvelleLigne = (id) => {
  const x = trouver(id), P = x.P, m = [];
  if (!P.ddn) m.push("ddn"); if (!P.sexe) m.push("sexe"); if (!num(P.taille)) m.push("taille"); if (!num(P.poids)) m.push("poids");
  const ouvrir = () => { NL = { pid: id, p: null }; CF = { c: "", o: "", s: "", g: "", q: "", fav: 0 }; dessinerNL(); };
  if (!m.length) { ouvrir(); return; }
  const c = (l, k, t) => "<div><label for=\"q_" + k + "\">" + l + ' *</label><input id="q_' + k + '" class="req"' + (t === "date" ? ' type="date"' : ' inputmode="decimal"') + "></div>";
  A.fenetre('<h3>Avant la ligne de chimiothérapie</h3><p class="sous">Ces informations sont nécessaires au calcul des doses (surface corporelle, clairance).</p><div class="form">' +
    (m.indexOf("ddn") >= 0 ? c("Date de naissance", "ddn", "date") : "") + (m.indexOf("sexe") >= 0 ? '<div><label for="q_sexe">Sexe *</label><select id="q_sexe" class="req"><option value=""></option><option value="F">Femme</option><option value="H">Homme</option></select></div>' : "") +
    (m.indexOf("taille") >= 0 ? c("Taille (cm)", "taille") : "") + (m.indexOf("poids") >= 0 ? c("Poids (kg)", "poids") : "") + "</div>" + boutons("Continuer", "vert"));
  document.getElementById("fOk").onclick = async () => {
    const v = {}; for (const k of m) { v[k] = A.val("q_" + k).replace(",", "."); if (!v[k]) { A.erreur("Merci de remplir tous les champs."); return; } }
    const changes = {}, I = Object.assign({}, x.doc.identite || {}), C = Object.assign({}, x.doc.clinique || {});
    if (v.ddn || v.sexe) { if (v.ddn) I.ddn = v.ddn; if (v.sexe) I.sexe = v.sexe; changes.identite = I; }
    if (v.taille || v.poids) { if (v.taille) C.taille = v.taille; if (v.poids) C.poids = v.poids; changes.clinique = C; }
    A.occupe(document.getElementById("fOk"), true);
    try { await A.enregistrer(x, changes, "Identité complétée avant la ligne de chimiothérapie"); ouvrir(); } catch (e) { A.occupe(document.getElementById("fOk"), false); A.erreur(e.message); }
  };
};

// ───── Diagnostic : recherche dans la liste + précision libre (comme l'application actuelle) ─────
export function champDiag(idD, idP, v, vp, dis) {
  return '<div class="large" data-champ="diag" style="position:relative"><label for="' + idD + '">Diagnostic</label><input id="' + idD + '" autocomplete="off" value="' + A.esc(v || "") + '" placeholder="Tapez pour chercher : prostate, sein, neuro…"' + (dis ? " disabled" : "") + '><div id="' + idD + 'S" class="sug cache"></div></div>' +
    '<div class="large" data-champ="diagP"><label for="' + idP + '">Précision du diagnostic (facultatif)</label><input id="' + idP + '" value="' + A.esc(vp || "") + '" placeholder="ex. métastases ovariennes et péritonéales"' + (dis ? " disabled" : "") + "></div>";
}
export function activerDiag(idD, idP) {
  const i = document.getElementById(idD), s = document.getElementById(idD + "S"); if (!i || i.disabled) return;
  const sansAcc = (z) => String(z || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const maj = () => { const m = sansAcc(i.value).split(/\s+/).filter(Boolean), l = listeDiag().filter((d) => m.every((w) => sansAcc(d).indexOf(w) >= 0)); s.innerHTML = l.length ? l.map((d) => '<div data-v="' + A.esc(d) + '">' + A.esc(d) + "</div>").join("") : '<div class="mesures" style="cursor:default">Pas dans la liste : le texte tapé sera gardé tel quel</div>'; s.classList.remove("cache"); };
  i.oninput = maj; i.onfocus = maj; i.onblur = () => setTimeout(() => s.classList.add("cache"), 200);
  s.onmousedown = (ev) => { const t = ev.target.closest("[data-v]"); if (!t) return; i.value = t.dataset.v; s.classList.add("cache"); i.dispatchEvent(new Event("change", { bubbles: true })); /* biomarqueurs (3.1) */ const p = document.getElementById(idP); if (p) setTimeout(() => p.focus(), 10); };
}
// Listes du cabinet : parametres/listes = { cor, mut } (ajouts aux listes de départ de donnees/listes.js) ; depuis le 08/10/2026
// (Paramètres › Listes) { diag, mut, cor, complet: true } = listes entières, corrigées et triées par le médecin
const LC = () => D().listes || {};
// Correspondants de départ : aucun (12/10/2026, étape 1.7 : ceux du cabinet d'origine sont dans ses listes, parametres/listes)
const cor0 = () => [];
export const LISTES0 = { diag: DIAG, mut: MUT0, get cor() { return cor0(); } };
const alphaFr = (a, z) => a.localeCompare(z, "fr");
export const listeDiag = () => (LC().complet && Array.isArray(LC().diag) ? LC().diag : DIAG.concat((LC().diag || []).filter((d) => DIAG.indexOf(d) < 0)));
export const listeMut = () => (LC().complet ? (LC().mut || []).slice() : MUT0.concat((LC().mut || []).filter((m) => MUT0.indexOf(m) < 0))).sort(alphaFr);
export const listeCor = () => (LC().complet ? (LC().cor || []).slice() : cor0().concat((LC().cor || []).filter((m) => cor0().indexOf(m) < 0))).sort(alphaFr);
// Un correspondant, une mutuelle ou un diagnostic nouveaux, tapés dans une fiche patient, s'ajoutent aux listes du cabinet
// (08/10/2026 : pour tout membre qui crée ou modifie une fiche ; règle parametres/listes). Liste relue juste avant.
export async function enrichirListes(cor, mut, diag) {
  const ref = doc(db, "espaces", A.ESPACE, "parametres", "listes"), s = await getDoc(ref).catch(() => null);
  let L = D().listes || {}; try { if (s && s.exists()) L = JSON.parse(s.data().data || "{}"); } catch (e) { /* liste locale */ }
  const base = (t) => (L.complet ? [] : t === "cor" ? cor0() : t === "mut" ? MUT0 : []), diagBase = () => (L.complet && Array.isArray(L.diag) ? [] : DIAG);
  const ajout = (t, v) => { v = String(v || "").trim(); if (!v || base(t).concat(t === "diag" ? diagBase() : [], L[t] || []).some((z) => z.toLowerCase() === v.toLowerCase())) return false; (L[t] = L[t] || []).push(v); return true; };
  if (diag && !L.complet && !Array.isArray(L.diag)) L.diag = []; // ancien format : diagnostics ajoutés à ceux de départ
  const a = ajout("cor", cor), m = ajout("mut", mut), d = ajout("diag", diag);
  D().listes = L;
  if (a || m || d) await setDoc(ref, { data: JSON.stringify(L) }).catch((e) => console.warn("listes", e));
}

// ───── Nouveau patient (même formulaire que l'application actuelle) ─────
// opts (19.4) : { nom (tapé dans la recherche), ensuite(x) } : depuis « Nouveau rendez-vous », on revient au rendez-vous au lieu du dossier
export function nouveauPatient(opts) {
  const o = opts || {};
  const okC = A.traitMod() || A.peut("fichePatient"), etabs = D().etabs, mb = D().membre;
  const permis = mb.tousEtablissements ? etabs : etabs.filter((e) => (mb.etablissements || []).indexOf(e.code) >= 0);
  if (!A.peut("creerPatient")) { A.toast("Vous n'avez pas le droit de créer un patient."); return; }
  const maxP = D().abo && D().abo.max.patients; // formule du cabinet (09/10/2026)
  if (maxP != null && D().patients.length >= maxP) { alert("Votre formule Onco360 permet " + maxP + " dossiers patients : la limite est atteinte.\nContactez l'éditeur d'Onco360 pour passer à une formule supérieure."); return; }
  // 3.11 (12/10/2026) : même formulaire que « Modifier » (fiche réglable : parties, ordre, types) ; partie médicale seulement avec le droit
  A.fenetre("<h3>Nouveau patient</h3>" + ficheP.htmlFormulaire(null, { off: (p) => p === "clinique" && !okC, etabs: permis, nouveau: true }) +
    '<p class="mesures" style="margin:6px 0 0">Nom et prénom obligatoires. Date de naissance, sexe, taille et poids : demandés avant la première ligne de chimiothérapie.</p>' + boutons("Créer le dossier"));
  if (okC) activerDiag("fDiag", "fDiagP");
  // nom tapé dans la recherche du rendez-vous : « NOM Prénom » → Nom, Prénom
  if (o.nom) { const m = String(o.nom).trim().split(/\s+/), n = document.getElementById("fNomF"), pr = document.getElementById("fPrenom"); if (n) n.value = (m.shift() || "").toUpperCase(); if (pr) pr.value = m.join(" "); }
  document.getElementById("fOk").onclick = async () => {
    const lu = ficheP.lireFormulaire(null); if (lu.erreur) { A.erreur(lu.erreur); return; }
    const nomF = lu.identite.nomF, prenom = lu.identite.prenom;
    const deja = D().patients.find((p) => (p.P.nomF || "").toUpperCase() === nomF && String(p.P.prenom || "").toLowerCase() === prenom.toLowerCase());
    if (deja && !confirm("Un patient " + deja.r.nm + " existe déjà. Créer quand même un nouveau dossier ?")) return;
    const id = "P" + Date.now().toString(36) + Math.floor(Math.random() * 1000), etab = lu.etab || (permis[0] && permis[0].code) || "";
    const docP = { etablissementId: etab, identite: lu.identite, version: 1, maj: serverTimestamp(), majPar: D().u.uid };
    if (okC) docP.clinique = lu.clinique;
    if (A.traitMod()) Object.assign(docP, { lignesJson: "[]", planningJson: "{}" });
    if (A.peut("rendezvous")) docP.rdvsJson = "[]";
    if (mb.droits && mb.droits.radiotherapie === "modifier") docP.rtsJson = "[]";
    const x = { id }; A.recalculer(x, Object.assign({}, docP, { maj: null }));
    docP.resume = JSON.stringify(x.r);
    A.occupe(document.getElementById("fOk"), true);
    try {
      await setDoc(doc(db, "espaces", A.ESPACE, "patients", id), docP);
      if (A.peut("finances")) await setDoc(doc(db, "espaces", A.ESPACE, "patientsFinances", id), { etablissementId: etab, montantsJson: JSON.stringify({ rdv: {}, rt: {}, cures: {} }) });
      await enrichirListes(lu.identite.cor || "", lu.identite.mut || "", (lu.clinique || {}).diag || "");
      A.recalculer(x, Object.assign({}, docP, { maj: null })); D().patients.push(x); D().patients.sort((a, z) => String(a.r.nm).localeCompare(String(z.r.nm)));
      A.journal(x, "Patient créé"); A.fermerFenetre(); A.toast("Dossier créé."); if (o.ensuite) o.ensuite(x); else location.hash = "dossier/" + encodeURIComponent(id);
      A.attribuerNumero(x).then((n) => { if (n) A.toast("Dossier créé : n° " + n + "."); }); // numéro de dossier (serveur, sans doublon)
    } catch (e) { A.occupe(document.getElementById("fOk"), false); A.erreur(e && e.code === "permission-denied" ? "Vous n'avez pas le droit de créer ce dossier." : "Création impossible : " + ((e && e.message) || e)); }
  };
}
