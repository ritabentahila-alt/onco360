// Onco360 – facture et avoir A4 (étape 18.4, 10/10/2026) : mise en page à partir d'une fiche factures/{id} (voir functions/index.js
// facturer) ; sans DOM ni Firebase (utilisée par l'Administration et, à l'étape 18.5, par Mon compte › Factures).
// Mentions : éditrice (raison sociale, forme, ICE, IF, RC, patente, CNSS, adresse), client (raison sociale, ICE, IF, adresse), date,
// numéro, désignation, période, HT, TVA 20 %, TTC, montant en lettres, « payée le … par … », RIB.
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const dfr = (d) => (/^\d{4}-\d{2}-\d{2}/.test(d || "") ? d.slice(8, 10) + "/" + d.slice(5, 7) + "/" + d.slice(0, 4) : d || "");
export const dh2 = (n) => (Number(n) || 0).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/ | /g, " ") + " DH";
const MOYENS = { virement: "virement", cheque: "chèque", especes: "espèces", carte: "carte", autre: "autre moyen" };

// Nombre en lettres (français), jusqu'aux milliards : 1190 → « mille cent quatre-vingt-dix »
const U = ["zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
const D = ["", "", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante", "quatre-vingt", "quatre-vingt"];
function moinsDeCent(n) {
  if (n < 20) return U[n];
  const d = Math.floor(n / 10), u = n % 10;
  if (d === 7 || d === 9) return D[d] + (d === 7 && u === 1 ? "-et-" : "-") + U[10 + u];
  if (u === 0) return D[d] + (d === 8 ? "s" : "");
  return D[d] + (u === 1 && d !== 8 ? "-et-" : "-") + U[u];
}
function moinsDeMille(n) {
  const c = Math.floor(n / 100), r = n % 100;
  const cent = c === 0 ? "" : c === 1 ? "cent" : U[c] + " cent" + (r === 0 ? "s" : "");
  return [cent, r ? moinsDeCent(r) : ""].filter(Boolean).join(" ");
}
export function enLettres(n) {
  n = Math.floor(Math.abs(Number(n) || 0));
  if (n === 0) return "zéro";
  const parts = [], mds = Math.floor(n / 1e9), mns = Math.floor((n % 1e9) / 1e6), mil = Math.floor((n % 1e6) / 1000), r = n % 1000;
  if (mds) parts.push(moinsDeMille(mds) + " milliard" + (mds > 1 ? "s" : ""));
  if (mns) parts.push(moinsDeMille(mns) + " million" + (mns > 1 ? "s" : ""));
  if (mil) parts.push(mil === 1 ? "mille" : moinsDeMille(mil).replace(/(cent|vingt)s$/, "$1") + " mille"); // « deux cent mille », « quatre-vingt mille »
  if (r) parts.push(moinsDeMille(r));
  return parts.join(" ");
}
export function montantEnLettres(x) {
  const t = Math.round((Number(x) || 0) * 100), dh = Math.floor(t / 100), c = t % 100;
  return enLettres(dh) + (dh >= 1e6 && dh % 1e6 === 0 ? " de" : "") + " dirham" + (dh > 1 ? "s" : "") + (c ? " et " + enLettres(c) + " centime" + (c > 1 ? "s" : "") : "");
}

// Page A4 complète (document HTML) d'une facture ou d'un avoir
export function htmlFacture(F) {
  const E = F.editeur || {}, C = F.client || {}, av = F.type === "avoir", L = F.lignes || [];
  const ligneE = [E.forme, E.ice && "ICE " + E.ice, E.if && "IF " + E.if, E.rc && "RC " + E.rc, E.patente && "TP " + E.patente, E.cnss && "CNSS " + E.cnss].filter(Boolean).join(" · ");
  return '<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>' + esc((av ? "Avoir " : "Facture ") + F.numero) + "</title><style>" +
    "@page{size:A4;margin:16mm}@media screen{body{max-width:200mm;margin:10mm auto!important;padding:0 8mm}.pied{position:static;margin-top:40px}}body{font-family:Arial,sans-serif;color:#1d2433;font-size:12.5px;margin:0}h1{font-size:22px;color:#1D3F94;margin:0}" +
    ".haut{display:flex;justify-content:space-between;gap:20px;align-items:flex-start;border-bottom:2px solid #3563B0;padding-bottom:12px}.ed b{font-size:15px}.m{color:#5b6475;font-size:11.5px}" +
    ".blocs{display:flex;justify-content:space-between;gap:24px;margin:18px 0}.cl{border:1px solid #d9dfeb;border-radius:8px;padding:10px 12px;min-width:46%}.cl b{font-size:13.5px}" +
    "table{width:100%;border-collapse:collapse;margin-top:6px}th{background:#EEF3FB;text-align:left;padding:7px 8px;font-size:11.5px;color:#3c4659}td{padding:8px;border-bottom:1px solid #e6eaf2;vertical-align:top}.n{text-align:right;white-space:nowrap}" +
    ".tot{margin-left:auto;width:46%;margin-top:10px}.tot td{border:0;padding:4px 8px}.tot .g td{font-weight:bold;font-size:14px;border-top:2px solid #3563B0;padding-top:7px}" +
    ".lettres{margin-top:14px;font-style:italic}.paye{margin-top:10px;color:#1F8A4C;font-weight:bold}.pied{position:fixed;bottom:0;left:0;right:0;border-top:1px solid #d9dfeb;padding-top:6px;text-align:center}" +
    ".av{color:#a3243b}</style></head><body>" +
    '<div class="haut"><div class="ed"><b>' + esc(E.raison) + "</b><br>" + esc(E.adresse) + (E.ville ? ", " + esc(E.ville) : "") + "<br>" + esc([E.tel, E.email].filter(Boolean).join(" · ")) + '<div class="m">' + esc(ligneE) + "</div></div>" +
    '<div style="text-align:right"><h1 class="' + (av ? "av" : "") + '">' + (av ? "AVOIR" : "FACTURE") + "</h1><b>N° " + esc(F.numero) + "</b><br>Date : " + esc(dfr(F.d)) + (av && F.ref ? '<br><span class="m">Annule la facture ' + esc(F.ref) + "</span>" : "") + "</div></div>" +
    '<div class="blocs"><div></div><div class="cl"><span class="m">' + (av ? "Avoir pour" : "Facturé à") + "</span><br><b>" + esc(C.raison) + "</b><br>" + esc(C.adresse || "") + '<div class="m">' + esc([C.ice && "ICE " + C.ice, C.if && "IF " + C.if].filter(Boolean).join(" · ")) + "</div>" + (F.cabinet && F.cabinet !== C.raison ? '<div class="m">Cabinet : ' + esc(F.cabinet) + "</div>" : "") + "</div></div>" +
    '<table><thead><tr><th>Désignation</th><th>Période</th><th class="n">Prix HT</th><th class="n">TVA ' + esc(F.taux) + ' %</th><th class="n">Total TTC</th></tr></thead><tbody>' +
    L.map((l) => "<tr><td>" + esc(l.lib) + "</td><td>" + (l.du ? "du " + esc(dfr(l.du)) + " au " + esc(dfr(l.au)) : "") + '</td><td class="n">' + dh2(l.ht) + '</td><td class="n">' + dh2(l.tva) + '</td><td class="n">' + dh2(l.ttc) + "</td></tr>").join("") + "</tbody></table>" +
    '<table class="tot"><tr><td>Total HT</td><td class="n">' + (av ? "− " : "") + dh2(F.ht) + "</td></tr><tr><td>TVA " + esc(F.taux) + ' %</td><td class="n">' + (av ? "− " : "") + dh2(F.tva) + '</td></tr><tr class="g"><td>Total TTC</td><td class="n">' + (av ? "− " : "") + dh2(F.ttc) + "</td></tr></table>" +
    '<p class="lettres">Arrêté' + (av ? " le présent avoir" : "e la présente facture") + " à la somme de " + esc(montantEnLettres(F.ttc)) + " toutes taxes comprises.</p>" +
    (av ? "" : '<p class="paye">Payée le ' + esc(dfr((F.paiement || {}).d)) + " par " + esc(MOYENS[(F.paiement || {}).moyen] || "virement") + ((F.paiement || {}).ref ? " (" + esc(F.paiement.ref) + ")" : "") + ".</p>") +
    (E.rib ? '<p class="m">RIB : ' + esc(E.rib) + (E.banque ? " · " + esc(E.banque) : "") + "</p>" : "") +
    '<div class="pied m">' + esc(E.mentions || "") + (E.mentions ? "<br>" : "") + esc(E.raison) + (ligneE ? " · " + esc(ligneE) : "") + "</div>" +
    "</body></html>";
}
