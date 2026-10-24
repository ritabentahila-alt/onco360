// Onco360 – fiche de chimiothérapie (A4 paysage). Logo : celui de l'établissement du patient (Paramètres › Lieux d'exercice).
import { addJ, srcImage } from "../moteur/outils.js";
import { vesicant } from "../moteur/vigilance.js"; // mention « vésicant » (12/10/2026)
import { diagnosticComplet } from "../moteur/statut.js";
import { texteNiv } from "../moteur/doses.js";
const CSSF = '@page{size:A4 landscape;margin:0}html,body{margin:0}body{padding:8mm 9mm;font-family:Arial,Helvetica,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}.fi{font-size:10.5px;color:#262838;width:100%}.fi table{border-collapse:collapse;width:100%}.fi td,.fi th{border:1px solid #2B2D5C;padding:4px 5px}.fi .ht td{height:26px}.fi .hd{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}.fi .hd img{max-height:70px;max-width:260px;image-rendering:auto}.fi .tb th i{font-size:8.5px;opacity:.85}.fi .ti{font-size:24px;font-weight:bold;color:#2B2D5C}.fi .ti span{font-size:18px;color:#555}.fi .lb{font-size:9.5px;color:#555}.fi .v{font-weight:bold;color:#2B2D5C;text-align:center;font-size:11.5px}.fi .tb{margin-top:10px}.fi .tb thead{display:table-header-group}.tb tr{break-inside:avoid;page-break-inside:avoid}.tb .rp td{border:0;text-align:left;font-weight:bold;font-size:10px;color:#2B2D5C;height:auto;padding:0 0 3px}.tb th{background:#2B2D5C;color:#fff;font-weight:normal;text-align:center;border-color:#b8bad0;font-size:10px;padding:6px 3px}.fi .tb td{border-top:1px dotted #9fa0b0;border-bottom:1px dotted #9fa0b0;text-align:center;height:19px}.fi .tb tr.vd td{height:9px}.fi .tb td.p{text-align:left;font-weight:bold}.fi .tb td.d{background:#E8F0FB;font-weight:bold;color:#2B2D5C;font-size:11.5px}.fi .tb td.m{border:1px solid #2B2D5C}.fi .bx{font-size:16px;line-height:10px}.fi .rem{color:#8A1C2B;font-weight:bold;font-size:9.5px;margin-top:5px}.fi .ft{color:#6B6D80;font-style:italic;font-size:8px;margin:4px 0}.fi .ca{display:flex;justify-content:space-between;margin-top:5px}.fi .ca div{border:1px solid #2B2D5C;height:64px;width:38%;padding:5px;font-size:10px}';
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const dfr = (d) => (d ? d.slice(8, 10) + "/" + d.slice(5, 7) + "/" + d.slice(0, 4) : "");
const fr = (v, n) => (v == null || v === "" ? "" : Number(v).toLocaleString("fr-FR", { minimumFractionDigits: n || 0, maximumFractionDigits: n || 0 }));
export function poso(d, poids) {
  if (d.u === "txt") return (poids ? texteNiv(d.pos, poids, true) : d.pos) || "À compléter"; // fiche : NIVESTIM 30 ou 48 MU, sans le reste
  if (d.u === "mg_c1") return d.c1 + " mg (C1) puis " + d.cn + " mg";
  if (d.u === "mg/kg_c1") return d.c1 + " mg/kg (C1) puis " + d.cn + " mg/kg";
  const s = d.u === "AUC" ? "AUC " + fr(d.d, d.d % 1 ? 1 : 0) : fr(d.d, d.d % 1 ? d.dec || 1 : 0) + " " + d.u;
  return s + (d.n ? " " + d.n : "");
}
export function doseTxt(d, v, poids) {
  if (d.u === "txt") return texteNiv(d.dt, poids, true) || "À compléter"; // NIVESTIM : 30 ou 48 MU selon le poids (P3)
  if (v == null) return "";
  return fr(v, d.dec || (v % 1 ? 1 : 0)) + " mg" + (d.per ? " / prise" : "");
}
// P : dossier ; L : ligne ; p : protocole de la cure ; e : état de la cure (calculé avec p) ; med : {nom, inpe, logo}
export function ficheHTML(P, L, p, e, med) {
  const auc = p.dr.some((d) => /AUC/.test(d.u)), cyc = p.c ? e.n + "/" + L.cures.length : "", rdv = p.c && e.date ? dfr(addJ(e.date, p.c)) : "";
  const B = "border:0;border-right:1px solid #2B2D5C";
  let h = '<div class="fi"><div class="hd">' + (srcImage(med.logo) ? '<img src="' + srcImage(med.logo) + '">' : "<span></span>") + '<div class="ti">Fiche de chimiothérapie' + (p.c ? "<span> – cure " + cyc + "</span>" : "") + "</div></div>";
  h += '<table class="ht"><tr><td class="lb" style="width:9%">Identité</td><td colspan="3" class="v" style="text-align:left;width:27%">' + esc(P.nom) + (P.allergie === "oui" ? '<br><b style="color:#A1232B">ALLERGIE : ' + esc(P.allergies || "oui") + "</b>" : "") + /* 3.2 (12/10/2026) */ '<br><span class="lb">' + "Né(e) le " + dfr(P.ddn) + "</span>" + (P._imp && P._imp.length ? '<br><span class="lb">' + P._imp.map((c) => esc(c.lib) + " : " + esc(c.texte)).join(" · ") + "</span>" : "") + "</td>" + // champs ajoutés de la fiche (10/10/2026)
    '<td colspan="2" rowspan="3" style="text-align:center;vertical-align:top;width:24%"><div class="lb">Médecin prescripteur</div><div class="v" style="margin-top:6px">' + esc(med.nom) + '</div><div class="v" style="margin-top:3px;font-weight:normal">INPE : ' + esc(med.inpe) + "</div></td>" +
    '<td rowspan="4" style="text-align:center;vertical-align:top;width:14%"><div class="lb">Rendez vous' + (p.c ? "<br>Prochaine cure (J" + (p.c + 1) + ")" : "") + '</div><div class="v" style="font-size:15px;margin-top:12px">' + rdv + "</div></td>" +
    '<td rowspan="4" style="vertical-align:top"><div class="lb">Observations</div><div style="margin-top:3px">' + esc(p.r) + "</div>" + (auc ? '<div style="margin-top:6px">Créatinine : <b>' + (e.creat || "") + " " + (L.crU === "mgL" ? "mg/L" : "µmol/L") + "</b> – Sexe : <b>" + esc(P.sexe) + "</b><br>Clairance (Cockcroft) : <b>" + (e.cl || "") + " ml/min</b></div>" : "") + "</td></tr>";
  h += '<tr><td class="lb">Diagnostic</td><td colspan="3" style="text-align:left">' + esc(diagnosticComplet(P) || P.diag || "") + "</td></tr>"; // localisation, stade, précision (3.1 bis)
  h += '<tr><td class="lb">Date J1</td><td colspan="3" class="v" style="text-align:left">' + dfr(e.date) + "</td></tr>";
  h += '<tr><td style="padding:0" colspan="4"><table><tr><td class="lb" style="text-align:center;' + B + '">Âge</td><td class="lb" style="text-align:center;' + B + '">Poids (kg)</td><td class="lb" style="text-align:center;' + B + '">Taille (cm)</td><td class="lb" style="text-align:center;border:0">S.C (m²)</td></tr><tr><td class="v" style="' + B + '">' + (e.age != null ? e.age : "") + '</td><td class="v" style="' + B + '">' + (e.poids || "") + '</td><td class="v" style="' + B + '">' + (e.taille || "") + '</td><td class="v" style="border:0">' + fr(e.sc, 2) + "</td></tr></table></td>" +
    '<td style="padding:0" colspan="2"><table><tr><td class="lb" style="text-align:center;' + B + '">Cycle N°</td><td class="lb" style="text-align:center;border:0">Protocole</td></tr><tr><td class="v" style="' + B + '">' + cyc + '</td><td class="v" style="border:0">' + esc(p.nom) + "</td></tr></table></td></tr></table>";
  const days = []; p.dr.forEach((d) => (d.j || []).forEach((j) => { if (days.indexOf(j) < 0) days.push(j); })); days.sort((a, b) => a - b);
  // T6 (24/10/2026, décision 49) : nom du patient et titres des colonnes répétés en haut de chaque page (thead, répété par le navigateur à l'impression)
  h += '<table class="tb"><thead><tr class="rp"><td colspan="12">' + esc(P.nom) + (p.c ? " · cure " + cyc : "") + " · " + esc(p.nom) + '</td></tr><tr><th style="width:7%">Date</th><th style="width:5%">Jour</th><th style="width:16%">Produit</th><th style="width:10%">Posologie</th><th style="width:8%">Dose totale</th><th style="width:5%">Mode<br>d’admin.</th><th style="width:9%">Type de soluté<br>+ volume</th><th style="width:5%">Durée</th><th style="width:5%">OK<br>CHIMIO<br><i>(médecin)</i></th><th style="width:8%">Date de<br>validation<br><i>(médecin)</i></th><th style="width:12%">Cachet<br>médecin</th><th>Date<br>d’administration<br><i>(infirmière)</i></th></tr></thead><tbody>';
  let n = 0; const vide = '<tr class="vd">' + "<td></td>".repeat(12) + "</tr>";
  days.forEach((j, di) => {
    const ds = p.dr.map((d, x) => ({ d, x })).filter((o) => (o.d.j || []).indexOf(j) >= 0);
    if (di > 0) { h += vide; n++; }
    ds.forEach((o, r) => {
      const d = o.d, dt = d.nd || !e.date ? "" : dfr(addJ(e.date, j - 1)).slice(0, 10), z = e.dj && e.dj[o.x] && e.dj[o.x][j];
      h += "<tr><td>" + dt + "</td><td>" + esc(d.jl || "J" + j) + '</td><td class="p">' + esc(d.p) + (d.u !== "txt" && vesicant(d.p) ? "<br><b>vésicant</b>" : "") + "</td><td>" + esc(poso(d, e.poids)) + '</td><td class="d">' + esc(doseTxt(d, z ? z.dose : e.doses[o.x], e.poids)) + "</td><td>" + esc(d.v || "") + "</td><td>" + esc(d.s || "") + "</td><td>" + esc(d.t || "") + '</td><td class="bx">☐</td>' + (r === 0 ? '<td class="m" rowspan="' + ds.length + '"></td><td class="m" rowspan="' + ds.length + '"></td><td class="m" rowspan="' + ds.length + '"></td>' : "") + "</tr>"; n++;
    });
  });
  for (; n < 12; n++) h += vide;
  h += "</tbody></table>"; // 18/10/2026 (Dr Bentahila) : la fiche va à l'administration et aux mutuelles : pas de remarques, le rythme suffit (Observations)
  h += '<div class="ft">Protocole ' + esc(p.nom) + " (" + esc(p.loc || "") + ") – S.C = Mosteller √(poids × taille / 3600)" + (auc ? " ; carboplatine : Calvert, dose = AUC × (clairance + 25), clairance plafonnée à 125 ml/min" : "") + '. Doses à vérifier et valider par le médecin prescripteur.</div><div class="ca"><div>Cachet Médecin</div><div>Cachet Administration</div></div></div>';
  return h;
}
export function imprimerFiche(html) {
  const doc = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>&#8203;</title><style>' + CSSF + "</style></head><body>" + html + "</body></html>";
  let w = null; try { w = window.open("", "_blank"); } catch (e) { w = null; }
  if (w && w.document) { w.document.open(); w.document.write(doc); w.document.close(); setTimeout(() => { w.focus(); w.print(); }, 500); return true; }
  return false;
}
