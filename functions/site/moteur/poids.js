// Onco360 – poids actuel du patient (R-A5, 18/10/2026, demande du cabinet du 17/10 : le poids de la fiche = celui de la dernière chimio). Calcul
// pur (test : tests/moteur/test-poids.mjs), une seule source pour la fiche, le bandeau du dossier, les impressions et le champ {poids} des
// courriers (règle Q5). Le plus récent entre :
// • le poids de la fiche (clinique.poids, daté par clinique.poidsLe ; sans date : le plus ancien de tous) ;
// • les poids des séances de chimiothérapie, saisis ou validés (J1 : cure ; J8… : c.sea[j] ; validés par la secrétaire : repris par
//   `fusionner`), à la date de la séance (date réelle si elle est faite, sinon prévue), jamais une séance à venir ni annulée.
// Même jour : l'heure départage (séance validée : heure de la validation `valLe` ; poids changé à la main : heure de la saisie, poidsLe en
// date et heure) ; sinon la séance passe avant la fiche. Les doses n'en dépendent pas (elles partent du poids de la ligne et des séances).
import { etatLigne, seancesCure } from "./doses.js";
const num = (v) => { const n = parseFloat(String(v == null ? "" : v).replace(",", ".")); return isFinite(n) && n > 0 ? n : null; };
const dfr = (d) => d.slice(8, 10) + "/" + d.slice(5, 7) + "/" + d.slice(0, 4);
export function poidsActuel(P, ctx) {
  const t = (ctx && ctx.aujourdhui) || "9999-12-31"; let o = null;
  const prendre = (v, d, src, lib) => { const n = num(v); if (n == null || (d && d.slice(0, 10) > t)) return; const z = { v: String(v).trim().replace(".", ","), poids: n, d: d || "", src, lib };
    if (!o || (z.d || "") > (o.d || "") || ((z.d || "") === (o.d || "") && src === "seance" && o.src === "fiche")) o = z; };
  prendre(P && P.poids, P && P.poidsLe, "fiche", "fiche patient");
  ((P && P.lignes) || []).forEach((L) => {
    let E = []; try { E = etatLigne(L, P, ctx); } catch (e) { E = []; }
    E.forEach((e) => {
      if (!e || e.st === "annulee" || !e.c) return;
      const cle = (d, val) => (val && String(val).slice(0, 10) === d ? String(val) : d); // validée ce jour-là : avec l'heure
      if (e.date) prendre(e.c.poids, cle(e.date, e.st === "recue" && e.c.valLe), "seance", "C" + e.n + " J1 du " + dfr(e.date));
      let S = []; try { S = seancesCure(L, e, ctx.bib); } catch (er) { S = []; }
      S.forEach((s) => { const z = (e.c.sea || {})[s.j] || {}, d = s.st === "recue" && s.d ? s.d : s.prevue; if (s.st !== "annulee" && d) prendre(z.poids, cle(d, s.st === "recue" && z.valLe), "seance", "C" + e.n + " J" + s.j + " du " + dfr(d)); });
    });
  });
  return o;
}
// Texte affiché : « 64 kg (C3 J1 du 29/09/2026) » ; poids de la fiche : « 64 kg (le 12/10/2026) » ou « 64 kg »
export const textePoids = (o) => (!o ? "" : o.v + " kg" + (o.src === "seance" ? " (" + o.lib + ")" : o.d ? " (le " + dfr(o.d) + ")" : ""));
