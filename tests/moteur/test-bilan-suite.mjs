// Suite de test-bilan.mjs (étape 15 bis B1) : hôpital de chaque acte, identifiants, cases « Payé ».
export async function lancer({ res, ctx, pai, ver, B, cas, T0, evtsFin }) {
  const copie = (o) => JSON.parse(JSON.stringify(o)), txt = (r, p) => B.texteTotaux(B.calculerBilan(r, ver, p, { per: "annee", hop: "tous" }, T0).tot);
  const ref = txt(res, pai);
  console.log("Identifiants des actes");
  const lignes = res.flatMap((x) => (x.fin || []).map((e) => ({ x, e })));
  cas("chaque acte a 11 colonnes et un identifiant (" + lignes.length + " actes)", lignes.every(({ e }) => e.length === 11 && typeof e[9] === "string" && e[9].length > 2));
  cas("jeu de test : aucun acte sans tarif", lignes.every(({ e }) => e[10] === 0));
  console.log("Actes sans tarif (B2)");
  const table0 = JSON.parse(JSON.stringify(ctx.table)); Object.values(table0.etablissements).forEach((h) => { h.activites = h.activites.filter((a) => a.type !== "seance"); });
  const xs = res.find((r) => (r.fin || []).some((e) => e[1] === "seance")), fs = evtsFin(xs.P, {}, Object.assign({}, ctx, { table: table0 })).filter((e) => e[1] === "seance");
  cas("séance sans tarif de séance (aucun lieu) : signalée, 0 DH", fs.length > 0 && fs.every((e) => e[10] === 1 && !(e[6] > 0)));
  const xr = res.find((r) => (r.fin || []).some((e) => e[1] === "rt")), tRT = Object.assign(JSON.parse(JSON.stringify(ctx.table)), { actesRT: [] });
  const fr = evtsFin(Object.assign(JSON.parse(JSON.stringify(xr.P))), {}, Object.assign({}, ctx, { table: tRT })).filter((e) => e[1] === "rt");
  cas("radiothérapie dont l'acte n'a pas de prix : signalée", fr.length > 0 && fr.every((e) => e[10] === 1));
  const dbl = res.some((x) => { const ids = (x.fin || []).filter((e) => e[1] !== "rtprev").map((e) => e[9]); return new Set(ids).size !== ids.length; });
  cas("identifiants uniques dans chaque dossier", !dbl);

  console.log("Hôpital de chaque acte (changement d'hôpital)");
  const x = res.find((r) => (r.fin || []).filter((e) => e[1] === "seance").length >= 3);
  const dates = x.fin.filter((e) => e[1] === "seance").map((e) => e[0]).sort(), milieu = dates[Math.floor(dates.length / 2)];
  const autre = ["HGC", "HCK", "CIOC"].find((h) => h !== x.P.hop);
  const P2 = Object.assign(copie(x.P), { hop: autre, hopHist: [{ hop: x.P.hop, avant: milieu }] }), f2 = evtsFin(P2, x.M, ctx);
  const s2 = f2.filter((e) => e[1] === "seance");
  cas("séances avant le changement : ancien hôpital (" + x.P.hop + ")", s2.filter((e) => e[0] < milieu).every((e) => e[2] === x.P.hop));
  cas("séances à partir du changement : nouvel hôpital (" + autre + ")", s2.filter((e) => e[0] >= milieu).every((e) => e[2] === autre));
  const P3 = Object.assign(copie(x.P), { hop: autre }), f3 = evtsFin(P3, x.M, ctx);
  cas("sans historique : tout au nouvel hôpital (comme avant)", f3.filter((e) => e[1] === "seance").every((e) => e[2] === autre));
  const P4 = Object.assign(copie(x.P), { hop: "C", hopHist: [{ hop: "B", avant: "2026-06-01" }, { hop: "A", avant: "2026-03-01" }] });
  const { hopAu } = await import("../../public/js/moteur/finances.js");
  cas("hopAu : A avant mars, B de mars à juin, C ensuite", hopAu(P4, "2026-02-28") === "A" && hopAu(P4, "2026-03-01") === "B" && hopAu(P4, "2026-05-31") === "B" && hopAu(P4, "2026-06-01") === "C");

  console.log("Cases « Payé »");
  const m = B.migrerPaiements(res, pai);
  cas("reprise des anciennes cases : quelque chose à reprendre", m.change);
  cas("après reprise : bilan identique (payé / à recevoir compris)", txt(res, m.p) === ref);
  cas("après reprise : plus aucune ancienne case d'un acte existant", lignes.every(({ x, e }) => m.p[B.cleAncienne({ id: x.id, t: e[1], d: e[0], lib: e[3] })] == null || e[1] === "rtprev"));
  cas("reprise refaite : rien à changer", !B.migrerPaiements(res, m.p).change);
  // Acte payé dont la date et le libellé changent ensuite (cure reportée après coup, protocole renommé)
  const payes = lignes.filter(({ x, e }) => e[1] !== "rtprev" && B.estPaye({ id: x.id, t: e[1], d: e[0], lib: e[3], a: e[9] }, m.p));
  const { x: xp, e: ep } = payes[0], o2 = { id: xp.id, t: ep[1], d: "2026-12-31", lib: ep[3] + " (renommé)", a: ep[9] };
  cas("acte payé dont la date et le libellé changent : reste payé", B.estPaye(o2, m.p) && !B.estPaye(o2, pai));
  // Deux actes identiques le même jour : cases séparées
  const o3 = { id: "p", t: "suivi", d: "2026-05-05", lib: "Consultation de suivi", a: "r|1" }, o4 = Object.assign({}, o3, { a: "r|2" }), p5 = { [B.clePaye(o3)]: "2026-05-06" };
  cas("deux consultations identiques le même jour : payer l'une ne paie pas l'autre", B.estPaye(o3, p5) && !B.estPaye(o4, p5));
  cas("ancienne case encore lue avant la reprise", B.estPaye(Object.assign({}, o3, { a: "r|9" }), { [B.cleAncienne(o3)]: "x" }));
}
