// Chimio HGC – lecture de l'export CSV de l'ancienne base (Google Sheet) et préparation du transfert.
// Fonctions pures (sans navigateur ni Firebase) : testables à part.

export function hsh(x) { let v = 0x811c9dc5; for (let i = 0; i < x.length; i++) { v ^= x.charCodeAt(i); v = Math.imul(v, 16777619) >>> 0; } return v.toString(16); }

// Colonnes : A id | B nom | C résumé | D mise à jour | E, F, G… données découpées (jusqu'à la première cellule vide)
function donnees(r) { let s = ""; for (let i = 4; i < r.length; i++) { if (r[i] === "" || r[i] == null) break; s += r[i]; } return s; }

export function lireExport(rows) {
  const out = { patients: [], protocoles: [], tarifs: null, paiements: null, versements: null, listes: null, migrations: {}, ignores: [], erreurs: [] };
  if (!rows.length || String(rows[0][0]).trim() !== "id") { out.erreurs.push("Ce fichier n'est pas l'export de ChimioHGC_patients (la première colonne doit s'appeler « id »)."); return out; }
  for (const r of rows.slice(1)) {
    const id = String(r[0] || "").trim(); if (!id) continue;
    try {
      if (id.startsWith("__LIB_")) { const o = JSON.parse(r[2]); out.protocoles.push({ id: "lib_" + id.slice(6), v: o.v || 0, list: o.list || [] }); continue; }
      if (id === "__LOGO__" || id === "TEST" || id === "AGENDA_ABS") { out.ignores.push(id); continue; }
      const s = donnees(r);
      if (!s) { out.erreurs.push(id + " : aucune donnée"); continue; }
      const o = JSON.parse(s);
      if (id === "__TARIFS__") out.tarifs = o.t || null;
      else if (id === "__PAYE__") out.paiements = o.p || {};
      else if (id === "__KL__") out.versements = o.l || [];
      else if (id === "__LISTES__") out.listes = { cor: o.cor || [], mut: o.mut || [] };
      else if (id.startsWith("__")) { const m = Object.assign({}, o); delete m.dossier; delete m.nom; out.migrations[id] = m; }
      else { delete o.dossier; out.patients.push({ id, nom: o.nom || r[1] || "", obj: o }); }
    } catch (e) { out.erreurs.push(id + " : données illisibles (" + e.message + ")"); }
  }
  out.protocoles.sort((a, b) => parseInt(a.id.slice(4), 10) - parseInt(b.id.slice(4), 10));
  return out;
}

// Chiffres de contrôle, calculés avant et après le transfert
export function chiffres(patients) {
  const c = { patients: 0, lignes: 0, curesRecues: 0, seancesRecues: 0, rdv: 0, rdvFaits: 0, rt: 0, rtTerminees: 0 };
  for (const p of patients) {
    const o = p.obj || p; c.patients++;
    for (const L of o.lignes || []) { c.lignes++; for (const cu of L.cures || []) { if (cu.st === "recue") c.curesRecues++; for (const k in (cu.sea || {})) if (cu.sea[k] && cu.sea[k].st === "recue") c.seancesRecues++; } }
    for (const r of o.rdvs || []) { c.rdv++; if (r.st === "fait") c.rdvFaits++; }
    for (const r of o.rts || []) { c.rt++; if (r.fin) c.rtTerminees++; }
  }
  return c;
}
