// Chimio HGC v2 – conversion d'un dossier v1 vers la v2, et l'inverse (fusion).
// Un dossier v1 est séparé en : dossier médical (patients/{id}, sans aucun montant) + montants (patientsFinances/{id}).
// Les dates de cures et de séances déplacées vont dans « planningJson » (modifiable avec le droit planning HDJ).
const IDENTITE = ["nomF", "prenom", "nom", "ddn", "sexe", "tel", "cin", "mut", "cor", "num", "ald", "age", "photo", "cree"]; // photo : image réduite (data URL)
const CLINIQUE = ["diag", "diagP", "notes", "poids", "taille", "cures", "j1", "nb", "protoId", "allergies", "atcdMed", "atcdFam", "modeVie", "traitCours"]; // + anciens champs de 1re version
const TECHNIQUES = ["dossier", "_rtcCh", "id", "hop", "lignes", "rdvs", "rts"];
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
  const planning = JSON.parse(doc.planningJson || "{}"), M = montants || null;
  P.lignes = JSON.parse(doc.lignesJson || "[]").map((L) => {
    (L.cures || []).forEach((c, i) => {
      const n = i + 1, pl = (planning[L.id] || {})[n];
      if (pl) { if (pl.fixe != null) c.fixe = pl.fixe; if (pl.sea) Object.keys(pl.sea).forEach((j) => { c.sea = c.sea || {}; c.sea[j] = c.sea[j] || { st: "prevue" }; c.sea[j].fixe = pl.sea[j]; }); }
      const m = M && M.cures && M.cures[L.id] && M.cures[L.id][n]; if (m) { if (m.hon != null) c.hon = m.hon; if (m.cons != null) c.cons = m.cons; }
    });
    return L;
  });
  P.rdvs = JSON.parse(doc.rdvsJson || "[]").map((r) => { const m = M && M.rdv && M.rdv[r.id]; if (m && m.v1) { if (m.prix != null) r.prix = m.prix; if (m.tj != null) r.tj = m.tj; } return r; });
  P.rts = JSON.parse(doc.rtsJson || "[]").map((r) => { const m = M && M.rt && M.rt[r.id]; if (m) Object.assign(r, m); return r; });
  return P;
}
