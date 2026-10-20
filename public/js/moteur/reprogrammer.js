// Onco360 – « Patients à reprogrammer » (R-C1, 19/10/2026, audit n° 4 d. 22) : calcul pur, sans DOM ni Firebase (test :
// tests/moteur/test-reprogrammer.mjs). Liste pour la secrétaire (tableau de bord, « À faire par la secrétaire ») :
// • consultation « Non venu » des N derniers jours sans nouveau rendez-vous : aucun autre rendez-vous de consultation (prévu ou venu) à partir
//   de ce jour-là (le report après « Non venu » en crée un : le patient sort de la liste) ;
// • séance de chimio marquée « Absent, sans reporter » dans la salle d'attente (fiche `salle` : état absent, sans `rep`) et toujours prévue à
//   cette date (ni validée, ni déplacée, ni annulée depuis).
// Patient décédé : jamais dans la liste. Le calcul ne change rien : il lit.
import { typeRdv, libRdv } from "./rdv.js";
import { addJ } from "./outils.js";

// pats : [{ id, nm, rdvs, deces, seance(lid, n, j) → { date, st } | null }] ; absents : fiches de la salle ; o = { t, jours }
export function aReprogrammer(pats, absents, o) {
  const t = o.t, d0 = addJ(t, -(o.jours || 30)), out = [];
  (pats || []).forEach((x) => {
    if (x.deces) return; const R = (x.rdvs || []).filter((r) => r && r.d && typeRdv(r.type) !== "hospit");
    R.forEach((r) => {
      if (r.st !== "absent" || r.d < d0 || r.d > t) return;
      if (R.some((v) => v !== r && v.d >= r.d && ((v.st || "prevu") === "prevu" || v.st === "fait"))) return; // nouveau rendez-vous, ou revenu
      out.push({ id: x.id, nm: x.nm, d: r.d, h: r.h || "", quoi: "rdv", rid: r.id, lib: libRdv(r) + " non venue" });
    });
  });
  (absents || []).forEach((a) => {
    const m = /^c-(.+)-(\d+)-(\d+)$/.exec(String(a.cle || "")); if (!a || a.etat !== "absent" || a.rep || !m || a.jour < d0 || a.jour > t) return;
    const x = (pats || []).find((p) => p.id === a.patientId); if (!x || x.deces || !x.seance) return;
    const s = x.seance(m[1], +m[2], +m[3]); if (!s || s.st !== "prevue" || s.date !== a.jour) return; // déjà reportée, validée ou annulée
    if (out.some((z) => z.id === x.id && z.quoi === "chimio" && z.d === a.jour)) return;
    out.push({ id: x.id, nm: x.nm, d: a.jour, h: "", quoi: "chimio", lib: "C" + m[2] + (+m[3] > 1 ? " J" + m[3] : "") + " de chimiothérapie : absent, sans report" });
  });
  return out.sort((p, q) => q.d.localeCompare(p.d) || p.nm.localeCompare(q.nm));
}
