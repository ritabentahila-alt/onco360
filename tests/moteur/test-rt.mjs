// Radiothérapie (3.5, 12/10/2026) : rythmes, volumes, et cohérence du calcul de la fin entre le navigateur (public/js/moteur/rt.js)
// et le serveur (functions/logique.js). node tests/moteur/test-rt.mjs
import { createRequire } from "node:module";
import { genererConsultRT, consultFinRT, datesRtc, finRT, joursSeances, compteurRT, joursOuvresRest, volumesRT, seancesVolumes, dpfVolume, texteVolume, libRythme } from "../../public/js/moteur/rt.js";
const L = createRequire(import.meta.url)("../../functions/logique.js");
let ok = 0, ko = 0;
const cas = (nom, v, d) => { if (v) { ok++; console.log("  ✔ " + nom); } else { ko++; console.log("  ✘ " + nom + (d === undefined ? "" : "  " + JSON.stringify(d).slice(0, 300))); } };
const F = [{ d: "2026-11-06" }, { d: "2026-11-18" }]; // fériés fictifs
console.log("1. Rythmes");
cas("quotidien : 10 séances du lundi 12/10 → vendredi 23/10", finRT({ deb: "2026-10-12", nb: 10, ryt: "1" }, []) === "2026-10-23");
cas("1 jour sur 2 : 10 séances → 05/11", finRT({ deb: "2026-10-12", nb: 10, ryt: "2" }, []) === "2026-11-05");
cas("2 par jour : 10 fractions en 5 jours (16/10)", finRT({ deb: "2026-10-12", nb: 10, ryt: "bid" }, []) === "2026-10-16");
cas("2 par jour, nombre impair : 9 fractions, dernier jour 1 seule", JSON.stringify(joursSeances({ deb: "2026-10-12", nb: 9, ryt: "bid" }, []).map((z) => z.n)) === "[2,2,2,2,1]");
cas("1 par semaine : 4 séances les lundis → 02/11", finRT({ deb: "2026-10-12", nb: 4, ryt: "hebdo" }, []) === "2026-11-02");
cas("1 par semaine, jour férié : séance le jour ouvré suivant", joursSeances({ deb: "2026-10-23", nb: 4, ryt: "hebdo" }, F).map((z) => z.d).join() === "2026-10-23,2026-10-30,2026-11-09,2026-11-13", joursSeances({ deb: "2026-10-23", nb: 4, ryt: "hebdo" }, F).map((z) => z.d));
cas("jours choisis (lundi, mercredi, vendredi) : 6 séances → 23/10", finRT({ deb: "2026-10-12", nb: 6, ryt: "jours", jours: [1, 3, 5] }, []) === "2026-10-23");
cas("jours fériés exclus (quotidien)", joursSeances({ deb: "2026-11-05", nb: 3, ryt: "1" }, F).map((z) => z.d).join() === "2026-11-05,2026-11-09,2026-11-10");
cas("fin saisie à la main prioritaire", finRT({ deb: "2026-10-12", nb: 10, finPrev: "2026-10-30" }, []) === "2026-10-30");
cas("compteur : 2 par jour, au 14/10 → 6 fractions sur 10", compteurRT({ deb: "2026-10-12", nb: 10, ryt: "bid" }, { aujourdhui: "2026-10-14", feries: [] }).faites === 6);
cas("séances restantes : quotidien au 19/10 → 5 jours", joursOuvresRest({ deb: "2026-10-12", nb: 10, ryt: "1" }, { aujourdhui: "2026-10-19", feries: [] }) === 5);
cas("libellé du rythme : jours choisis", libRythme({ ryt: "jours", jours: [1, 3] }) === "les lundis, mercredis");
let we = [];
for (const ryt of ["1", "2", "bid", "hebdo", "jours"]) for (const deb of ["2026-10-10", "2026-10-11", "2026-10-12", "2026-10-16", "2026-12-26"]) for (const nb of [1, 7, 20, 33]) {
  joursSeances({ deb, nb, ryt, jours: [1, 2, 3, 4, 5] }, F).forEach((z) => { const w = new Date(z.d + "T12:00:00").getDay(); if (w === 0 || w === 6 || F.some((f) => f.d === z.d)) we.push([ryt, deb, z.d]); }); }
cas("aucune séance un samedi, un dimanche ni un jour férié (5 rythmes, début un samedi ou un dimanche compris)", !we.length, we.slice(0, 3));
cas("début un samedi (10/10) : 1re séance le lundi 12/10", joursSeances({ deb: "2026-10-10", nb: 3, ryt: "1" }, [])[0].d === "2026-10-12");
console.log("2. Navigateur et serveur : même date de fin");
let diff = [];
for (const ryt of ["1", "2", "bid", "hebdo", "jours"]) for (let nb = 1; nb <= 40; nb += 3) for (const deb of ["2026-10-12", "2026-10-31", "2026-11-04", "2026-12-24"]) {
  const r = { deb, nb, ryt, jours: [2, 4] }, a = finRT(r, F), b = L.finRT(r, F); if (a !== b) diff.push([ryt, nb, deb, a, b]); }
cas("280 prescriptions : fin identique (5 rythmes, fériés)", !diff.length, diff.slice(0, 3));
console.log("3. Volumes");
const ancien = { dose: "50", nb: "25" };
cas("radiothérapie d'avant : un volume, rien à ressaisir", volumesRT(ancien).length === 1 && volumesRT(ancien)[0].dose === "50");
const vol = volumesRT({ vol: [{ nom: "Sein gauche", dose: "50", nb: "25" }, { nom: "Lit tumoral", dose: "16", nb: "8", ty: "seq" }, { nom: "Ganglions", dose: "55", ty: "int" }] });
cas("séances = principal + séquentiel (33) ; l'intégré partage les séances", seancesVolumes(vol) === 33);
cas("dose par fraction : 2 Gy ; intégré 2,2 Gy (sur 25)", dpfVolume(vol[0], vol) === 2 && dpfVolume(vol[2], vol) === 2.2);
cas("texte d'un complément", texteVolume(vol[1], vol) === "Complément séquentiel – Lit tumoral : 16 Gy en 8 fractions (2 Gy par fraction)", texteVolume(vol[1], vol));
console.log("4. Consultations hebdomadaires (R-C1, 19/10/2026) : jour férié compris, identifiants gardés, médecin et lieu");
{
  let n = 0; const ctx = { aujourdhui: "2026-10-19", feries: [{ d: "2026-11-18", nom: "Fête fictive" }], nouvelId: (p) => p + "x" + n++ };
  const P = { rdvs: [], rts: [{ id: "rt1", deb: "2026-10-20", nb: 25, ryt: "1", cj: "3", ch: "10:00", med: "m2", hop: "CLIN" }] };
  genererConsultRT(P, ctx); const l = P.rdvs.filter((x) => x.rtc === "rt1");
  cas("le mercredi 18/11 (férié) a sa consultation", l.some((x) => x.d === "2026-11-18"), l.map((x) => x.d));
  cas("les dates = datesRtc (mercredis du 21/10 à la fin)", l.map((x) => x.d).join() === datesRtc(P.rts[0], ctx).join() && l[0].d === "2026-10-21");
  cas("médecin et lieu de la RT recopiés, heure choisie", l.every((x) => x.med === "m2" && x.lieu === "CLIN" && x.h === "10:00"));
  const ids = l.map((x) => x.id).join(); P.rts[0].ch = "11:00"; genererConsultRT(P, ctx); const l2 = P.rdvs.filter((x) => x.rtc === "rt1");
  cas("heure changée : mêmes identifiants, nouvelle heure", l2.map((x) => x.id).join() === ids && l2.every((x) => x.h === "11:00"));
  l2[1].st = "fait"; l2[2].rep = [{ d: l2[2].d }]; l2[2].d = "2026-11-05"; P.rts[0].nb = 10; genererConsultRT(P, ctx); const l3 = P.rdvs.filter((x) => x.rtc === "rt1");
  cas("RT raccourcie : venue et reportée gardées, les autres retirées après la fin", l3.some((x) => x.st === "fait") && l3.some((x) => x.d === "2026-11-05") && !l3.some((x) => (x.st || "prevu") === "prevu" && !x.rep && x.d > finRT(P.rts[0], ctx.feries)));
  const Q = { rdvs: [], rts: [{ id: "rt2", deb: "2026-10-20", nb: 5, med: "m3", hop: "HCK" }] }; consultFinRT(Q, ctx);
  cas("consultation de fin : médecin et lieu de la RT", Q.rdvs[0] && Q.rdvs[0].med === "m3" && Q.rdvs[0].lieu === "HCK");
}
console.log("\n" + ok + " réussis, " + ko + " échoués");
process.exit(ko ? 1 : 0);
