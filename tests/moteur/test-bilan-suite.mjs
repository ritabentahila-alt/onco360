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

  console.log("Périodes (B3)");
  const pe = (per, t) => B.periode({ per }, t).join(" → ");
  cas("trimestre en cours (10/10/2026) : octobre à décembre", pe("trim", "2026-10-10") === "2026-10-01 → 2026-12-31");
  cas("trimestre dernier (10/10/2026) : juillet à septembre", pe("trimprec", "2026-10-10") === "2026-07-01 → 2026-09-30");
  cas("trimestre dernier en février : octobre à décembre de l'année d'avant", pe("trimprec", "2027-02-15") === "2026-10-01 → 2026-12-31");
  cas("trimestre en cours en mars : janvier à mars", pe("trim", "2026-03-31") === "2026-01-01 → 2026-03-31");
  cas("année dernière, année au choix", pe("anneeprec", "2026-10-10") === "2025-01-01 → 2025-12-31" && pe("a2024", "2026-10-10") === "2024-01-01 → 2024-12-31");
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

  console.log("Consultation de chimio jour par jour (R-D1)");
  // Cure validée avec une séance J8 validée (jeu de test) ; montants refaits à la main
  const xj = res.find((r) => (r.fin || []).some((e) => e[1] === "seance" && / J8 – /.test(e[3])));
  const s8 = xj.fin.find((e) => e[1] === "seance" && / J8 – /.test(e[3])), [, lid8, n8] = s8[9].split("|"), s1 = xj.fin.find((e) => e[9] === "s|" + lid8 + "|" + n8 + "|1");
  const avecM = (cc) => { const M = copie(xj.M || {}); M.cures = M.cures || {}; M.cures[lid8] = Object.assign({}, M.cures[lid8] || {}, { [n8]: Object.assign({}, (M.cures[lid8] || {})[n8] || {}, cc) }); return evtsFin(xj.P, M, ctx).filter((e) => e[1] === "cchimio" && e[9].startsWith("cc|" + lid8 + "|" + n8)); };
  const c2 = avecM({ consJ: { 1: 250, 8: 200 }, consModeJ: { 1: "esp", 8: "carte" }, cons: { enc: true, m: 450, jour: "1" } });
  cas("J1 250 DH et J8 200 DH : deux actes", c2.length === 2);
  cas("J1 à la date de la séance J1, mode espèces, identifiant de la cure", c2[0][0] === s1[0] && c2[0][4] === 250 && c2[0][8] === "esp" && c2[0][9] === "cc|" + lid8 + "|" + n8);
  cas("J8 à la date de la séance J8 (" + s8[0] + "), mode carte, identifiant du jour", c2[1][0] === s8[0] && c2[1][4] === 200 && c2[1][8] === "carte" && c2[1][9] === "cc|" + lid8 + "|" + n8 + "|8" && / J8 – /.test(c2[1][3]));
  const c0 = avecM({ consJ: { 1: 250, 8: 0 }, cons: { enc: true, m: 250, jour: "1" } });
  cas("J8 à 0 DH (par défaut) : rien de compté pour le J8", c0.length === 1 && c0[0][4] === 250);
  const c8 = avecM({ consJ: { 1: 0, 8: 200 }, consModeJ: { 8: "np" }, cons: { enc: true, m: 200, jour: "8" } });
  cas("J1 à 0 et J8 payé : un acte au J8, qui reprend la case « Payé » de la cure", c8.length === 1 && c8[0][0] === s8[0] && c8[0][9] === "cc|" + lid8 + "|" + n8 && c8[0][8] === "np");
  const cv = avecM({ consJ: undefined, consModeJ: undefined, cons: { enc: true, m: 250 } });
  cas("ancien format (case « Consultation encaissée ») : un acte au J1, comme avant", cv.length === 1 && cv[0][0] === s1[0] && cv[0][4] === 250 && cv[0][9] === "cc|" + lid8 + "|" + n8);
  const cv8 = avecM({ consJ: undefined, consModeJ: undefined, cons: { enc: true, m: 250, jour: 8 } });
  cas("ancien format au J8 : compté à la date du J8", cv8.length === 1 && cv8[0][0] === s8[0]);
  // Bilan : 200 DH saisis au J8 comptent dans le mois du J8 (avant : dans celui du J1)
  const resJ = res.map((r) => (r.id !== xj.id ? r : Object.assign({}, r, { fin: evtsFin(xj.P, (() => { const M = copie(xj.M || {}); M.cures = M.cures || {}; M.cures[lid8] = Object.assign({}, M.cures[lid8] || {}, { [n8]: { consJ: { 1: 250, 8: 200 }, cons: { enc: true, m: 450, jour: "1" } } }); return M; })(), ctx) })));
  const mois8 = s8[0].slice(0, 7), bil = (r) => B.calculerBilan(r, ver, pai, { per: "", du: mois8 + "-01", au: mois8 + "-31" }, T0).all.filter((o) => o.id === xj.id && o.t === "cchimio").reduce((a, o) => a + o.net, 0);
  cas("200 DH du J8 comptés dans le mois du J8 (" + mois8 + ")", bil(resJ) >= 200);
  const paye = { [B.clePaye({ id: xj.id, a: "cc|" + lid8 + "|" + n8 })]: "2026-09-01" };
  cas("case « Payé » déjà cochée sur la cure : reprise sur le J1, pas sur le J8", B.estPaye({ id: xj.id, a: c2[0][9] }, paye) && !B.estPaye({ id: xj.id, a: c2[1][9] }, paye));

  console.log("Radiothérapie sans taux du lieu (R-D3, C5)");
  const xR = res.find((r) => (r.fin || []).some((e) => e[1] === "rt" && e[10] === 0)), eR = xR.fin.find((e) => e[1] === "rt");
  const sansRT = (t) => { const T = copie(ctx.table); Object.values(T.etablissements).forEach((h) => { h.activites = h.activites.filter((a) => a.type !== "rt"); }); return Object.assign(T, t); };
  const fR = (T) => evtsFin(xR.P, xR.M, Object.assign({}, ctx, { table: T })).find((e) => e[9] === eR[9]);
  const a = fR(sansRT({ tauxRT: { retro: 60, impot: 10 } })), bR = fR(sansRT({ tauxRT: { retro: 50, impot: 0 } })), c = fR(sansRT({}));
  cas("lieu sans ligne « Radiothérapie » : taux commun 60 % / 10 % (" + a[6] + " DH)", a[5] === 40 && a[6] === Math.round(a[4] * 0.4 * 0.9) && a[10] === 0);
  cas("taux commun modifié (50 % / 0 %) : appliqué", bR[5] === 50 && bR[6] === Math.round(bR[4] * 0.5));
  cas("ni ligne du lieu ni taux commun : « sans tarif », 0 DH (plus de 60 % / 10 % cachés)", c[10] === 1 && c[6] === 0);
  const lieu = fR(Object.assign(copie(ctx.table), { tauxRT: { retro: 0, impot: 0 } }));
  cas("la ligne « Radiothérapie » du lieu passe avant le taux commun", lieu[6] === eR[6]);

  console.log("Cases « Payé » rangées par année (R-D4)");
  const rp = B.repartirPaiements(res, { paiements: copie(pai) });
  const ans = Object.keys(rp.docs).filter((id) => id !== "paiements");
  cas("ancien document unique : rangé par année (" + ans.join(", ") + ")", rp.change && ans.length >= 1 && ans.every((id) => /^paiements_\d{4}$/.test(id)));
  cas("après rangement : bilan identique (payé / à recevoir compris)", txt(res, B.fusionnerPaiements(rp.docs)) === ref);
  cas("chaque case dans le document de l'année de son acte", res.every((x) => (x.fin || []).every((e) => { if (!e[9] || e[1] === "rtprev") return true; const k = B.clePaye({ id: x.id, a: e[9] }); return !Object.keys(rp.docs).some((id) => rp.docs[id][k] != null) || rp.docs[B.docPaiements(e[0])][k] != null; })));
  const nAv = Object.keys(B.migrerPaiements(res, pai).p).length, nAp = Object.values(rp.docs).reduce((a, d) => a + Object.keys(d).length, 0);
  cas("aucune case perdue ni en double (" + nAv + ")", nAv === nAp);
  cas("rangement refait : rien à changer", !B.repartirPaiements(res, rp.docs).change);
  const inc = B.repartirPaiements(res, Object.assign(copie(rp.docs), { paiements_2025: { "Pdisparu#r|1": "2025-03-01" } }));
  cas("case d'un acte introuvable : reste dans son document", inc.docs.paiements_2025["Pdisparu#r|1"] === "2025-03-01");
  const big = { paiements_2026: {} }; for (let i = 0; i < 14000; i++) big.paiements_2026["P0000000000000#s|L0000000000000000|" + i + "|1"] = "2026-09-28";
  cas("alerte à 70 % de la place d'un document", B.placePaiements(big).length === 1 && B.placePaiements(rp.docs).length === 0);
}
