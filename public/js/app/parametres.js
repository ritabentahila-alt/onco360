// Onco360 – Paramètres › Activités et rémunérations (étape C5 ; onglet de la page Paramètres depuis le 08/10/2026) : activités et rémunérations par établissement (avec date d'effet et historique),
// catalogue des actes de radiothérapie et montant VMAT. Réservé au droit « finances » (document finances/tarifs).
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "../config.js";
import { ACTIVITES, valeurAu, net } from "../moteur/tarifs.js";

let A = null;
export function installer(api) { A = api; }
const D = () => A.D();
let ED = null, ETAB = null, MOD = false, EFFET = null;
const fr = (v) => (v == null || isNaN(v) ? "—" : Number(v).toLocaleString("fr-FR", { maximumFractionDigits: 2 }));
const num = (v) => { const x = parseFloat(String(v == null ? "" : v).replace(/[\s\u202f\u00a0]/g, "").replace(",", ".")); return isNaN(x) ? null : x; };
const mil = (v) => (v == null || v === "" || isNaN(v) ? "" : Number(v).toLocaleString("fr-FR", { maximumFractionDigits: 2 }).replace(/[\u202f\u00a0]/g, " "));
const STD = ACTIVITES.map((a) => a[0]);

export function pageParametres() {
  const esc = A.esc;
  if (!A.peut("finances") || !D().tarifs) { A.$("page").innerHTML = A.enteteParametres() + '<section class="carte"><p class="sous">Les tarifs et rémunérations sont réservés au droit « finances ».</p></section>'; return; }
  if (!ED || !MOD) { ED = JSON.parse(JSON.stringify(D().tarifs)); ED.etablissements = ED.etablissements || {}; ED.actesRT = ED.actesRT || []; }
  EFFET = EFFET || D().t;
  const etabs = (D().etabsTous || D().etabs).map((e) => e.code); Object.keys(ED.etablissements).forEach((c) => { if (etabs.indexOf(c) < 0) etabs.push(c); });
  if (!ETAB || etabs.indexOf(ETAB) < 0) ETAB = etabs[0];
  const E = ED.etablissements[ETAB], nomE = ((D().etabsTous || D().etabs).find((e) => e.code === ETAB) || {}).nom || ETAB;
  let h = A.enteteParametres() + // onglet « Activités et rémunérations » de la page Paramètres (08/10/2026)
    '<section class="carte"><h3><span class="ic">' + A.ic("bilan") + '</span>Activités et rémunérations</h3><p class="sous">Net = brut × (1 − rétrocession) × (1 − impôt). Un changement s\'applique aux actes réalisés à partir de sa date d\'effet ; les actes plus anciens gardent l\'ancien tarif.</p>' +
    '<div class="puces">' + etabs.map((c) => '<button class="puce' + (c === ETAB ? " on" : "") + '" onclick="paEtab(\'' + esc(c) + "')\">" + esc(c) + "</button>").join("") + "</div>";
  const srcG = sourceGrille();
  if (!ETAB) h += '<p class="sous">Ajoutez d\'abord un lieu d\'exercice (Paramètres › Lieux d\'exercice) : chaque lieu a sa grille tarifaire.</p>';
  else if (!E) h += '<p class="sous">' + esc(nomE) + ' n\'a pas encore de grille tarifaire.</p><button class="bt clair petit" onclick="paCreer()">' + A.ic("plus") + (srcG ? "Créer la grille (copie de " + esc(srcG[0]) + ")" : "Créer la grille") + "</button>";
  else {
    h += '<p style="margin:4px 0 10px"><b>' + esc(nomE) + '</b></p><div class="form" style="grid-template-columns:minmax(0,240px);margin-bottom:10px"><div><label for="paEff">Date d\'effet des modifications</label><input id="paEff" type="date" value="' + esc(EFFET) + '" onchange="paEffet(this.value)"></div></div>' +
      '<div class="tableau"><table class="tcures"><tr><th>Activité</th><th>Brut (DH)</th><th>Rétrocession %</th><th>Impôt %</th><th>Net (DH)</th><th title="Cochée : une consultation validée compte directement « Payé » dans le bilan (à partir de la date affichée). Décochée : vous cochez « Payé » vous-même dans le bilan.">Payé auto.</th><th>En vigueur depuis</th></tr>' +
      E.activites.map((a, i) => {
        const v = valeurAu(a, EFFET) || {}, rt = a.type === "rt", n = rt ? null : net(v.brut || 0, v), hist = (a.historique || []).length;
        return '<tr><td><div class="actnom"><input value="' + esc(a.libelle) + '" aria-label="Nom de l\'activité" onchange="paLib(' + i + ',this.value)">' + (a.type !== "rt" ? '<button class="mini rouge" title="Retirer cette activité" onclick="paSupAct(' + i + ')">✕</button>' : "") + "</div>" + (hist > 1 ? '<div class="mesures"><a href="#" onclick="paHist(' + i + ');return false">Historique (' + hist + ")</a></div>" : "") + "</td>" +
          "<td>" + (rt ? '<span class="mesures">selon l\'acte</span>' : '<input class="mt" inputmode="decimal" style="max-width:120px" value="' + esc(mil(v.brut)) + '" onchange="paVal(' + i + ',\'brut\',this.value)">') + "</td>" +
          '<td><input inputmode="decimal" style="max-width:80px" value="' + esc(v.retro == null ? 0 : v.retro) + '" onchange="paVal(' + i + ',\'retro\',this.value)"></td><td><input inputmode="decimal" style="max-width:80px" value="' + esc(v.impot == null ? 0 : v.impot) + '" onchange="paVal(' + i + ',\'impot\',this.value)"></td>' +
          '<td class="calc">' + (rt ? "—" : fr(n)) + "</td>" +
          "<td>" + (rt ? "" : '<label class="pa-auto" title="Payé automatiquement dans le bilan dès la validation"><input type="checkbox"' + (a.payeAuto ? " checked" : "") + ' onchange="paAuto(' + i + ',this.checked)" aria-label="Payé automatiquement">' + (a.payeAuto ? '<span class="mesures">depuis le ' + A.dfrA(a.payeAuto) + "</span>" : "") + "</label>") + "</td><td>" + (v.depuis && v.depuis > "2000-01-01" ? A.dfrA(v.depuis) : "Origine") + "</td></tr>";
      }).join("") + "</table></div>" +
      '<div class="actr" style="justify-content:flex-start;margin-top:8px"><button class="bt clair petit" onclick="paNouvAct()">' + A.ic("plus") + 'Ajouter une activité</button><span class="mesures">Le nom est modifiable directement dans le tableau. Chaque consultation apparaît dans la liste des rendez-vous des patients de ' + esc(ETAB) + ".</span></div>";
  }
  h += "</section>";
  h += '<section class="carte"><h3><span class="ic">☢️</span>Actes de radiothérapie</h3><p class="sous">Prix proposé automatiquement à la prescription ; la part du médecin suit la rétrocession et l\'impôt de la ligne « Radiothérapie » de chaque établissement.</p>' +
    '<div class="tableau" style="max-height:460px;overflow:auto"><table class="tcures"><tr><th>Acte</th><th style="width:160px">Prix (DH)</th><th></th></tr>' +
    ED.actesRT.map((a, i) => '<tr><td><input value="' + esc(a.nom) + '" style="width:100%" onchange="paActe(' + i + ',\'nom\',this.value)"></td><td><input class="mt" inputmode="decimal" style="max-width:130px" value="' + esc(mil(a.prix)) + '" onchange="paActe(' + i + ',\'prix\',this.value)"></td><td><button class="mini rouge" onclick="paSupActe(' + i + ')">✕</button></td></tr>').join("") + "</table></div>" +
    '<div class="actr" style="justify-content:flex-start;margin-top:8px"><button class="bt clair petit" onclick="paAjActe()">' + A.ic("plus") + 'Ajouter un acte</button><label style="display:flex;gap:8px;align-items:center;margin-left:auto;font-weight:bold;color:var(--doux);font-size:13px">Montant VMAT (DH) <input class="champ mt" inputmode="decimal" style="max-width:130px;font-size:15px;padding:8px" value="' + esc(mil(ED.vmat)) + '" onchange="paVmat(this.value)"></label></div></section>' +
    '<div class="barre-enr"><span id="paMod" class="mesures' + (MOD ? "" : " cache") + '">Modifications non enregistrées</span><button class="bt plein" id="paOk" onclick="paEnregistrer()" style="margin-left:auto"><svg class="pi"><use href="#i-enregistrer"/></svg>Enregistrer</button></div>';
  A.$("page").innerHTML = h;
}
const modif = (re) => { MOD = true; if (re) pageParametres(); else { const m = A.$("paMod"); if (m) m.classList.remove("cache"); } };
window.paEtab = (c) => { ETAB = c; pageParametres(); };
window.paEffet = (v) => { EFFET = v || D().t; pageParametres(); };
// Modifier une valeur : nouvelle entrée datée (ou mise à jour de l'entrée de même date)
window.paVal = (i, f, v) => {
  const a = ED.etablissements[ETAB].activites[i], cur = valeurAu(a, EFFET) || { depuis: EFFET, brut: null, retro: 0, impot: 0 };
  let e = (a.historique || []).find((x) => x.depuis === EFFET);
  if (!e) { e = { depuis: EFFET, brut: cur.brut, retro: cur.retro, impot: cur.impot }; (a.historique = a.historique || []).push(e); a.historique.sort((p, q) => p.depuis.localeCompare(q.depuis)); }
  e[f] = num(v) == null ? (f === "brut" ? null : 0) : num(v); modif(true);
};
// « Payé auto. » (08/10/2026) : les actes de cette activité validés à partir de la date du jour où la case est cochée comptent
// « Payé » dans le bilan sans clic ; décochée, le médecin coche « Payé » lui-même. Les actes plus anciens ne changent pas.
window.paAuto = (i, oui) => { const a = ED.etablissements[ETAB].activites[i]; if (oui) a.payeAuto = a.payeAuto || D().t; else delete a.payeAuto; modif(true); };
window.paHist = (i) => {
  const a = ED.etablissements[ETAB].activites[i];
  A.fenetre("<h3>Historique – " + A.esc(a.libelle) + " (" + A.esc(ETAB) + ')</h3><div class="tableau"><table class="tcures"><tr><th>Depuis</th><th>Brut</th><th>Rétrocession %</th><th>Impôt %</th><th>Net</th></tr>' +
    (a.historique || []).slice().reverse().map((x) => "<tr><td>" + (x.depuis > "2000-01-01" ? A.dfrA(x.depuis) : "Origine") + "</td><td>" + (x.brut == null ? "selon l'acte" : fr(x.brut)) + "</td><td>" + fr(x.retro) + "</td><td>" + fr(x.impot) + "</td><td>" + (x.brut == null ? "—" : fr(net(x.brut, x))) + "</td></tr>").join("") + '</table></div><div class="boutons"><button class="bt gris" onclick="fermerFenetre()">Fermer</button></div>');
};
// Ajouter une activité : nouvelle consultation (2nd avis…) ou une activité standard absente de cet établissement
window.paNouvAct = () => {
  const esc = A.esc, acts = ED.etablissements[ETAB].activites, manq = ACTIVITES.filter(([t]) => !acts.some((a) => a.type === t));
  A.fenetre("<h3>Ajouter une activité – " + esc(ETAB) + '</h3><div class="form"><div class="large"><label for="naNat">Nature</label><select id="naNat"><option value="">Nouvelle consultation (ex. 2nd avis, téléconsultation…)</option>' + manq.map(([t, l]) => '<option value="' + t + '">' + esc(l) + "</option>").join("") + "</select></div>" +
    '<div class="large"><label for="naLib">Nom affiché</label><input id="naLib" placeholder="ex. Consultation 2nd avis"></div><div><label for="naBrut">Brut (DH)</label><input id="naBrut" class="mt" inputmode="decimal"></div></div><div class="err" id="fErr"></div><div class="boutons"><button class="bt gris" onclick="fermerFenetre()">Annuler</button><button class="bt plein" id="fOk">Ajouter</button></div>');
  A.$("naNat").onchange = () => { const l = ACTIVITES.find((x) => x[0] === A.val("naNat")); if (l) A.$("naLib").value = l[1]; };
  A.$("fOk").onclick = () => {
    const t = A.val("naNat") || "x" + Date.now().toString(36), lib = A.val("naLib");
    if (!lib) { A.erreur("Indiquez le nom de l'activité."); return; }
    if (acts.some((a) => a.libelle.toLowerCase() === lib.toLowerCase())) { A.erreur("Une activité porte déjà ce nom."); return; }
    acts.push({ type: t, libelle: lib, historique: [{ depuis: "2000-01-01", brut: t === "rt" ? null : num(A.val("naBrut")) || 0, retro: 0, impot: 0 }] });
    A.fermerFenetre(); modif(true);
  };
};
window.paLib = (i, v) => { v = String(v || "").trim(); const a = ED.etablissements[ETAB].activites[i]; if (!v) { pageParametres(); return; } a.libelle = v; modif(); };
window.paSupAct = (i) => {
  const a = ED.etablissements[ETAB].activites[i];
  if (!confirm("Retirer l'activité « " + a.libelle + " » de " + ETAB + " ?\n\nElle ne sera plus proposée pour les rendez-vous. Les actes déjà réalisés de ce type ne seront plus comptés au bilan pour cet établissement.")) return;
  ED.etablissements[ETAB].activites.splice(i, 1); modif(true);
};
// Grille copiée pour un nouveau lieu : celle de l'établissement de repli, sinon la première ; cabinet neuf : toutes les activités à 0
const sourceGrille = () => { const c = ED.etablissements[ED.repli || "HGC"] ? (ED.repli || "HGC") : Object.keys(ED.etablissements)[0]; return c ? [c, ED.etablissements[c]] : null; };
window.paCreer = () => {
  const src = sourceGrille();
  ED.etablissements[ETAB] = src ? JSON.parse(JSON.stringify(src[1])) : { activites: ACTIVITES.map(([type, libelle]) => ({ type, libelle, historique: [{ depuis: "2000-01-01", brut: type === "rt" ? null : 0, retro: 0, impot: 0 }] })) };
  if (!ED.repli) ED.repli = ETAB; // premier lieu d'un cabinet neuf : établissement de repli
  modif(true);
};
window.paActe = (i, f, v) => { ED.actesRT[i][f] = f === "prix" ? num(v) : String(v).trim(); modif(); };
window.paAjActe = () => { ED.actesRT.push({ nom: "Nouvel acte", prix: 0 }); modif(true); };
window.paSupActe = (i) => { if (!confirm("Retirer l'acte « " + ED.actesRT[i].nom + " » du catalogue ?\nLes prescriptions existantes gardent leur acte et leur prix.")) return; ED.actesRT.splice(i, 1); modif(true); };
window.paVmat = (v) => { ED.vmat = num(v); modif(); };
window.paEnregistrer = async () => {
  if (ED.actesRT.some((a) => !a.nom)) { A.toast("Un acte de radiothérapie n'a pas de nom."); return; }
  const b = A.$("paOk"); A.occupe(b, true);
  try {
    await setDoc(doc(db, "espaces", A.ESPACE, "finances", "tarifs"), { data: JSON.stringify(ED) }, { merge: true });
    D().tarifs = JSON.parse(JSON.stringify(ED)); MOD = false; A.publierTarifsC(); // tarifs des consultations lisibles par la secrétaire
    // Liste des activités (noms seulement, sans montant) lisible par toute l'équipe : types de rendez-vous proposés
    const act = {}; Object.entries(ED.etablissements).forEach(([c, e]) => { act[c] = e.activites.map((a) => ({ t: a.type, lib: a.libelle })); });
    D().activites = act; await setDoc(doc(db, "espaces", A.ESPACE, "parametres", "activites"), { data: JSON.stringify(act) }).catch(() => {});
    A.journal({ id: "", r: { nm: "" } }, "Paramètres modifiés (tarifs, actes de radiothérapie)");
    A.toast("Paramètres enregistrés."); pageParametres();
  } catch (e) { A.occupe(b, false); A.toast(e && e.code === "permission-denied" ? "Vous n'avez pas le droit de modifier les tarifs." : "Enregistrement impossible : " + ((e && e.message) || e)); }
};
