import { consultationDe } from "../moteur/heures.js";
// Chimio HGC v2 – conversion d'un dossier v1 vers la v2, et l'inverse (fusion).
// Un dossier v1 est séparé en : dossier médical (patients/{id}, sans aucun montant) + montants (patientsFinances/{id}).
// Les dates de cures et de séances déplacées vont dans « planningJson » (modifiable avec le droit planning HDJ).
const IDENTITE = ["nomF", "prenom", "nom", "ddn", "sexe", "tel", "cin", "mut", "cor", "num", "ald", "age", "photo", "cree", "tel2", "adresse", "email", "numero"]; // numero : numéro de dossier (étape 8) // tel2, adresse, email : 08/10/2026 // photo : image réduite (data URL)
const CLINIQUE = ["diag", "diagP", "notes", "poids", "taille", "cures", "j1", "nb", "protoId", "allergies", "atcdMed", "atcdFam", "modeVie", "traitCours", "allergie", "statut", "decesLe"]; // + anciens champs de 1re version ; allergie, statut, decesLe (12/10/2026)
// Fiche médicale lue telle qu'enregistrée : les champs rangés par erreur dans _autres (création d'une ligne avant le 12/10/2026) y sont remis
export const REMIS = ["extra", "statut", "allergie", "decesLe"];
export function cliniqueRemise(c) {
  const C = Object.assign({}, c || {}), a = C._autres; if (!a || typeof a !== "object" || !REMIS.some((k) => k in a)) return C;
  const r = Object.assign({}, a); REMIS.forEach((k) => { if (k in r) { if (C[k] == null) C[k] = r[k]; delete r[k]; } });
  if (Object.keys(r).length) C._autres = r; else delete C._autres; return C;
}
const TECHNIQUES = ["dossier", "_rtcCh", "id", "hop", "hopHist", "lignes", "rdvs", "rts"]; // hopHist : champ du document (changements d'hôpital, 10/10/2026)
const copie = (o) => JSON.parse(JSON.stringify(o));

export function separer(P0) {
  const P = copie(P0), identite = {}, clinique = {}, montants = { rdv: {}, rt: {}, cures: {} }, planning = {}, autres = {};
  for (const k of Object.keys(P)) { if (IDENTITE.includes(k)) identite[k] = P[k]; else if (CLINIQUE.includes(k)) clinique[k] = P[k]; else if (!TECHNIQUES.includes(k)) autres[k] = P[k]; }
  if (Object.keys(autres).length) clinique._autres = autres;
  const lignes = (P.lignes || []).map((L) => {
    (L.cures || []).forEach((c, i) => {
      const n = i + 1;
      if (c.fixe != null) { ((planning[L.id] = planning[L.id] || {})[n] = planning[L.id][n] || {}).fixe = c.fixe; delete c.fixe; }
      if (c.sea) Object.keys(c.sea).forEach((j) => { const s = c.sea[j]; if (s && s.fixe != null) { const pl = ((planning[L.id] = planning[L.id] || {})[n] = planning[L.id][n] || {}); (pl.sea = pl.sea || {})[j] = s.fixe; delete s.fixe; } });
      // Heure d'une séance (AG5, 11/10/2026) : { h, du } de J1 (hr) et des séances J8… (shr[j]), avec les dates (droit « planning »)
      // (heures notées depuis le 12/10/2026 : champ « heures » du dossier, marquées _h, jamais recopiées ici ; hc / hcm : calculées à la lecture)
      if (c.hr && !c.hr._h) ((planning[L.id] = planning[L.id] || {})[n] = planning[L.id][n] || {}).hr = c.hr;
      if (c.sea) Object.keys(c.sea).forEach((j) => { const s = c.sea[j]; if (s && s.hr && !s.hr._h) { const pl = ((planning[L.id] = planning[L.id] || {})[n] = planning[L.id][n] || {}); (pl.shr = pl.shr || {})[j] = s.hr; } });
      [c].concat(Object.values(c.sea || {})).forEach((o) => { if (o) { delete o.hr; delete o.hc; delete o.hcm; } });
      if (c.hon != null || c.cons != null) { const m = ((montants.cures[L.id] = montants.cures[L.id] || {})[n] = {}); if (c.hon != null) { m.hon = c.hon; delete c.hon; } if (c.cons != null) { m.cons = c.cons; delete c.cons; } }
    });
    return L;
  });
  const rdvs = (P.rdvs || []).map((r) => { if (r.prix != null || r.tj != null) { montants.rdv[r.id] = { v1: true }; if (r.prix != null) { montants.rdv[r.id].prix = r.prix; delete r.prix; } if (r.tj != null) { montants.rdv[r.id].tj = r.tj; delete r.tj; } } return r; });
  const rts = (P.rts || []).map((r) => { const m = {}; ["prix", "vmatPrix", "netFixe"].forEach((k) => { if (r[k] != null) { m[k] = r[k]; delete r[k]; } }); if (Object.keys(m).length) montants.rt[r.id] = m; return r; });
  return {
    patient: { etablissementId: P.hop || "", identite, clinique, lignesJson: JSON.stringify(lignes), planningJson: JSON.stringify(planning), rdvsJson: JSON.stringify(rdvs), rtsJson: JSON.stringify(rts) },
    montants,
  };
}

// Reconstitue le dossier au format du moteur (montants facultatifs : sans le droit « finances », ils sont absents)
export function fusionner(id, doc, montants) {
  const P = Object.assign({ id }, doc.identite || {});
  const cl = Object.assign({}, doc.clinique || {}), autres = cl._autres || {}; delete cl._autres;
  Object.assign(P, cl, autres);
  P.hop = doc.etablissementId || "";
  if (doc.hopHist) P.hopHist = doc.hopHist; // [{ hop, avant }] : hôpital des actes faits avant un changement d'hôpital (moteur/finances.js hopAu)
  const planning = JSON.parse(doc.planningJson || "{}"), M = montants || null;
  P.lignes = JSON.parse(doc.lignesJson || "[]").map((L) => {
    (L.cures || []).forEach((c, i) => {
      const n = i + 1, pl = (planning[L.id] || {})[n];
      if (pl) { if (pl.fixe != null) c.fixe = pl.fixe; if (pl.sea) Object.keys(pl.sea).forEach((j) => { c.sea = c.sea || {}; c.sea[j] = c.sea[j] || { st: "prevue" }; c.sea[j].fixe = pl.sea[j]; }); }
      // Reports enregistrés avec le seul droit « planning » (secrétaire, 08/10/2026) : historique gardé dans le planning (rep, srep),
      // ajouté après celui du dossier ; repris dans le dossier au prochain enregistrement du médecin (separer ne les garde pas ici)
      if (pl && pl.rep) c.rep = (c.rep || []).concat(pl.rep);
      if (pl && pl.srep) Object.keys(pl.srep).forEach((j) => { c.sea = c.sea || {}; c.sea[j] = c.sea[j] || { st: "prevue" }; c.sea[j].rep = (c.sea[j].rep || []).concat(pl.srep[j]); });
      // Poids validé par la secrétaire (10/10/2026) : poids (J1), spoids[j] (J8…), pv[j] = qui et quand (gardé ensuite dans le dossier)
      if (pl && pl.poids != null) c.poids = pl.poids;
      if (pl && pl.spoids) Object.keys(pl.spoids).forEach((j) => { c.sea = c.sea || {}; c.sea[j] = c.sea[j] || { st: "prevue" }; c.sea[j].poids = pl.spoids[j]; });
      if (pl && pl.pv) c.pv = Object.assign({}, c.pv || {}, pl.pv);
      if (pl && pl.hr) c.hr = pl.hr; // heure de J1 (AG5)
      if (pl && pl.shr) Object.keys(pl.shr).forEach((j) => { c.sea = c.sea || {}; c.sea[j] = c.sea[j] || { st: "prevue" }; c.sea[j].hr = pl.shr[j]; });
      // Heures de la séance (12/10/2026, moteur/heures.js) : doc.heures { "ligne|cure|jour": { cons, seance } } ; seance = heure et durée à
      // l'hôpital de jour (infirmière ; passe avant l'ancienne heure du planning, null = retirée) → hr ; cons = consultation choisie par le
      // médecin → hcm ; hc = consultation affichée (choisie, sinon juste avant la séance). Marquées _h : jamais recopiées dans le planning.
      Object.keys(doc.heures || {}).forEach((cle) => {
        const t = cle.split("|"), v = doc.heures[cle] || {}, j = t[2]; if (t[0] !== L.id || +t[1] !== n) return;
        if (+j > 1 && !((v.seance && v.seance.h) || (v.cons && v.cons.h) || (c.sea && c.sea[j]))) return;
        const o = +j === 1 ? c : ((c.sea = c.sea || {})[j] = c.sea[j] || { st: "prevue" });
        if ("seance" in v) { if (v.seance && v.seance.h) o.hr = Object.assign({}, v.seance, { _h: 1 }); else delete o.hr; }
        if (v.cons && v.cons.h) o.hcm = v.cons;
      });
      [c].concat(Object.values(c.sea || {})).forEach((o) => { if (!o) return; const k0 = consultationDe(o.hcm, o.hr); if (k0) o.hc = k0; else delete o.hc; });
      const m = M && M.cures && M.cures[L.id] && M.cures[L.id][n]; if (m) { if (m.hon != null) c.hon = m.hon; if (m.cons != null) c.cons = m.cons; }
    });
    return L;
  });
  P.rdvs = JSON.parse(doc.rdvsJson || "[]").map((r) => { const m = M && M.rdv && M.rdv[r.id]; if (m && m.v1) { if (m.prix != null) r.prix = m.prix; if (m.tj != null) r.tj = m.tj; } return r; });
  P.rts = JSON.parse(doc.rtsJson || "[]").map((r) => { const m = M && M.rt && M.rt[r.id]; if (m) Object.assign(r, m); return r; });
  return P;
}
