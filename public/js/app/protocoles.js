// Onco360 – Protocoles (étape C5) : la bibliothèque complète, triée comme dans l'application actuelle
// (cancer › localisation › situation › sous-groupe), recherche, favoris, statut Validé / Non validé, création et modification.
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "../config.js";
import { dedupIds, premed } from "../moteur/doses.js";
import { tableMol, edValide, editerAvec, menusCascade, valeursCascade } from "./chimio.js";

let A = null;
export function installer(api) { A = api; }
const D = () => A.D();
const CLES = ["c", "o", "s", "g"];
let CF = { c: "", o: "", s: "", g: "", q: "", fav: 0, st: "" }, ED = null, REDESSINER = null;
const sa = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const BIB = () => Object.values(D().ctx.bib).filter((p) => p && p.nom);
const molecules = (p) => (p.dr || []).filter((d) => !premed(d) && !/Retrait|Fin du diffuseur/.test(d.p)).map((d) => d.p).join(", "); // 2.3 : même liste que le calcul
const valide = (p) => p.st === "ok" || !p.st;
const badgeSt = (p) => (valide(p) ? '<span class="badge b-ch"><svg class="pi"><use href="#i-check"/></svg>Validé</span>' : '<span class="badge b-or"><i class="dot j"></i>Non validé</span>');

const valeurs = (n) => valeursCascade(BIB(), CF, n);
function resultats() {
  const q = sa(CF.q).split(/\s+/).filter(Boolean);
  return BIB().filter((p) => {
    if (CF.fav && !p.fav) return false;
    if (CF.st === "ok" && !valide(p)) return false; if (CF.st === "todo" && valide(p)) return false;
    if (CF.c && !(p.ind || []).some((x) => x[0] === CF.c && (!CF.o || x[1] === CF.o) && (!CF.s || x[2] === CF.s) && (!CF.g || x[3] === CF.g))) return false;
    if (q.length) { const h = sa(p.nom + " " + molecules(p) + " " + (p.ind || []).map((x) => x.join(" ")).join(" ")); if (!q.every((w) => h.indexOf(w) >= 0)) return false; }
    return true;
  }).sort((a, b) => a.nom.localeCompare(b.nom, "fr", { sensitivity: "base" }));
}
function liste() {
  const r = resultats(), esc = A.esc, ok = A.peut("parametres");
  if (!r.length) return '<p class="sous">Aucun protocole.</p>';
  return '<p class="mesures" style="margin:6px 0">' + r.length + " protocole" + (r.length > 1 ? "s" : "") + "</p>" + r.map((p) => {
    const ind = (p.ind || []).slice(0, 3).map((x) => x.filter(Boolean).slice(1).join(" › ")).filter(Boolean).join(" · ") + ((p.ind || []).length > 3 ? " · …" : "");
    return '<div class="proto"><button class="etoile" title="Favori" onclick="prFav(\'' + esc(p.id) + '\')"' + (ok ? "" : " disabled") + ">" + (p.fav ? '<svg class="pi plein or"><use href="#i-etoile"/></svg>' : '<svg class="pi"><use href="#i-etoile"/></svg>') + '</button><div style="flex:1;min-width:0;cursor:pointer" onclick="prOuvrir(\'' + esc(p.id) + '\')"><b>' + esc(p.nom) + "</b> " + badgeSt(p) + (p.assoc ? ' <span class="badge b-gr">associé</span>' : "") +
      '<div class="mesures">' + esc(molecules(p)) + (p.c ? " – cycle " + p.c + " j" : " – continu") + "</div>" + (ind ? '<div class="mesures" style="color:#8A8CA8">' + esc(ind) + "</div>" : "") + "</div>" +
      '<div class="actr" style="flex-wrap:nowrap"><button class="mini" onclick="prOuvrir(\'' + esc(p.id) + "')\">" + (ok ? "Ouvrir / modifier" : "Voir") + "</button>" + (ok ? '<button class="mini rouge" onclick="prSuppr(\'' + esc(p.id) + "')\">✕</button>" : "") + "</div></div>";
  }).join("");
}
export function pageProtocoles() {
  const esc = A.esc, b = BIB(), nOk = b.filter(valide).length, ok = A.peut("parametres");
  let h = '<section class="accueil"><div><h2>Protocoles</h2><p>' + b.length + " protocoles · " + nOk + " validés · " + (b.length - nOk) + " non validés</p></div>" + (ok ? '<div class="actions"><button class="bt plein" onclick="prOuvrir()">' + A.ic("plus") + "Créer un protocole</button></div>" : "") + '</section><section class="carte">';
  // Menus déroulants en cascade : Type de cancer › Localisation › Situation › Sous-groupe
  if (CF.c && !CF.o) { const o = valeurs(1); if (o.length === 1) CF.o = o[0]; }
  h += menusCascade(BIB(), CF, "prChoixV");
  h += '<div class="actr" style="justify-content:flex-start;margin-top:8px"><input id="prQ" class="champ" style="flex:1;min-width:220px" placeholder="Rechercher : molécule, protocole ou situation (ex. pertuzumab, sein adjuvant)…" value="' + esc(CF.q) + '">' +
    '<button class="bt ' + (CF.fav ? "plein" : "clair") + ' petit" onclick="prFiltre(\'fav\')"><svg class="pi"><use href="#i-etoile"/></svg>Favoris</button><select class="champ" style="font-size:14px;padding:8px" onchange="prFiltre(\'st\',this.value)"><option value="">Tous les statuts</option><option value="ok"' + (CF.st === "ok" ? " selected" : "") + '>Validés</option><option value="todo"' + (CF.st === "todo" ? " selected" : "") + ">Non validés</option></select>" +
    '<button class="bt gris petit" onclick="prFiltre(\'reinit\')">Réinitialiser</button></div><div id="prL" style="margin-top:6px">' + liste() + "</div></section>";
  A.$("page").innerHTML = h;
  const q = A.$("prQ"); q.oninput = () => { CF.q = q.value; A.$("prL").innerHTML = liste(); };
  if (CF.q) { q.focus(); q.setSelectionRange(q.value.length, q.value.length); }
}
window.prChoixV = (n, v) => { CF[CLES[n]] = v || ""; for (let k = n + 1; k < 4; k++) CF[CLES[k]] = ""; pageProtocoles(); };
window.prChoix = (n, i) => { CF[CLES[n]] = i < 0 ? "" : valeurs(n)[i]; for (let k = n + 1; k < 4; k++) CF[CLES[k]] = ""; pageProtocoles(); };
window.prFiltre = (f, v) => { if (f === "fav") CF.fav = CF.fav ? 0 : 1; else if (f === "st") CF.st = v; else CF = { c: "", o: "", s: "", g: "", q: "", fav: 0, st: "" }; pageProtocoles(); };

// ───── Enregistrement : la bibliothèque est rangée en plusieurs documents (lib_0…lib_N) ─────
async function sauverDocs(ids) {
  const docs = {};
  ids.forEach((id) => { const d = D().bibDoc[id]; if (d) docs[d] = 1; });
  for (const d of Object.keys(docs)) {
    const l = (D().bibOrdre[d] || []).map((id) => D().ctx.bib[id]).filter(Boolean);
    await setDoc(doc(db, "espaces", A.ESPACE, "protocoles", d), { data: JSON.stringify(l), n: l.length }, { merge: true });
  }
}
function rangerNouveau(id) {
  const docs = Object.keys(D().bibOrdre).filter((d) => /^lib_perso/.test(d)), taille = (d) => JSON.stringify((D().bibOrdre[d] || []).map((i) => D().ctx.bib[i])).length;
  let d = docs.find((x) => taille(x) < 600000) || "lib_perso" + (docs.length ? "_" + docs.length : "");
  (D().bibOrdre[d] = D().bibOrdre[d] || []).push(id); D().bibDoc[id] = d;
}
window.prFav = async (id) => {
  const p = D().ctx.bib[id]; p.fav = p.fav ? 0 : 1;
  try { await sauverDocs([id]); A.$("prL").innerHTML = liste(); } catch (e) { p.fav = p.fav ? 0 : 1; A.toast(e.code === "permission-denied" ? "Vous n'avez pas le droit de modifier la bibliothèque." : e.message); }
};
window.prSuppr = async (id) => {
  const p = D().ctx.bib[id]; if (!confirm("Supprimer définitivement le protocole « " + p.nom + " » ?\nLes patients déjà traités gardent leur copie.")) return;
  const d = D().bibDoc[id];
  delete D().ctx.bib[id]; D().bibOrdre[d] = (D().bibOrdre[d] || []).filter((x) => x !== id);
  try {
    await setDoc(doc(db, "espaces", A.ESPACE, "protocoles", d), { data: JSON.stringify(D().bibOrdre[d].map((i) => D().ctx.bib[i])), n: D().bibOrdre[d].length }, { merge: true });
    // Liste des protocoles supprimés : la conversion finale ne les recopie pas depuis l'application actuelle
    const rs = doc(db, "espaces", A.ESPACE, "parametres", "protocolesSupprimes"), sv = await getDoc(rs).catch(() => null), l = sv && sv.exists() ? JSON.parse(sv.data().data || "[]") : [];
    if (l.indexOf(id) < 0) { l.push(id); await setDoc(rs, { data: JSON.stringify(l) }).catch(() => {}); }
    A.journal({ id: "", r: { nm: "" } }, "Protocole supprimé : " + p.nom); A.toast("Protocole supprimé."); pageProtocoles(); }
  catch (e) { D().ctx.bib[id] = p; D().bibOrdre[d].push(id); A.toast(e.code === "permission-denied" ? "Vous n'avez pas le droit de modifier la bibliothèque." : e.message); }
};

// ───── Fiche d'un protocole (création ou modification) ─────
window.prOuvrir = (id) => {
  const nouv = !id, ok = A.peut("parametres");
  ED = nouv ? { id: "perso_" + Date.now(), nom: "", c: 21, st: "todo", r: "", ind: [["", "", "", ""]], dr: [] } : JSON.parse(JSON.stringify(D().ctx.bib[id]));
  ED.ind = ED.ind || [];
  if (!ok) { voir(); return; }
  editerAvec(ED, dessiner); REDESSINER = dessiner; dessiner();
  function dessiner() {
    const esc = A.esc, tous = [[], [], [], []];
    BIB().forEach((x) => (x.ind || []).forEach((i) => { for (let k = 0; k < 4; k++) if (i[k] && tous[k].indexOf(i[k]) < 0) tous[k].push(i[k]); }));
    A.fenetre("<h3>" + (nouv ? "Nouveau protocole" : "Protocole de la bibliothèque") + '</h3><div class="form" style="grid-template-columns:2fr 1fr 1fr">' +
      '<div><label>Nom du protocole (schéma compris)</label><input value="' + esc(ED.nom) + '" onchange="prProp(\'nom\',this.value)"></div><div><label>Cycle (jours, 0 = continu)</label><input inputmode="numeric" value="' + esc(ED.c || 0) + '" onchange="prProp(\'c\',this.value)"></div>' +
      '<div><label>Statut</label><select onchange="prProp(\'st\',this.value)"><option value="ok"' + (valide(ED) ? " selected" : "") + '>Validé (utilisable)</option><option value="todo"' + (!valide(ED) ? " selected" : "") + ">Non validé</option></select></div>" +
      '<div class="large" style="grid-column:1/-1"><label>Rythme / observations</label><input value="' + esc(ED.r || "") + '" onchange="prProp(\'r\',this.value)"></div></div>' +
      '<h4 class="soustitre">Indications (branches de l\'arborescence)</h4><div class="tableau"><table class="tcures ed"><tr><th>Cancer</th><th>Localisation</th><th>Situation</th><th>Sous-groupe</th><th></th></tr>' +
      ED.ind.map((x, i) => "<tr>" + [0, 1, 2, 3].map((k) => '<td><input list="dl' + k + '" value="' + esc(x[k] || "") + '" style="min-width:130px" onchange="prInd(' + i + "," + k + ',this.value)"></td>').join("") + '<td><button class="mini rouge" onclick="prIndSup(' + i + ')">−</button></td></tr>').join("") + "</table></div>" +
      [0, 1, 2, 3].map((k) => '<datalist id="dl' + k + '">' + tous[k].sort().map((v) => '<option value="' + esc(v) + '">').join("") + "</datalist>").join("") +
      '<div class="actr" style="justify-content:flex-start;margin-top:8px"><button class="mini" onclick="prIndAj()">+ Ajouter une indication</button><label style="font-weight:normal;margin-left:10px"><input type="checkbox" style="width:auto;margin-right:6px"' + (ED.assoc ? " checked" : "") + ' onchange="prProp(\'assoc\',this.checked)">Traitement associé (castration, os, support…)</label></div>' +
      '<h4 class="soustitre">Molécules</h4>' + tableMol() +
      '<div class="form" style="margin-top:12px"><div class="large"><label>Remarques (une par ligne)</label><textarea rows="3" onchange="prProp(\'no\',this.value)">' + esc((ED.no || []).join("\n")) + "</textarea></div></div>" +
      '<p class="mesures">Unités : mg/m² × surface corporelle ; mg/kg × poids ; mg = dose fixe ; AUC = carboplatine (Calvert) ; « charge C1 / suite » : saisir par ex. 840/420 ; texte libre : affiché tel quel. Seuls les protocoles « Validé » peuvent être prescrits.</p>' +
      '<div class="err" id="fErr"></div><div class="boutons"><button class="bt gris" onclick="fermerFenetre()">Annuler</button>' + (nouv ? "" : '<button class="bt clair" id="prDup">Dupliquer</button>') + '<button class="bt plein" id="fOk">Enregistrer</button></div>', "large");
    A.$("fOk").onclick = enregistrer;
    if (A.$("prDup")) A.$("prDup").onclick = () => { const c = JSON.parse(JSON.stringify(ED)); c.id = "perso_" + Date.now(); c.nom = ED.nom + " (copie)"; c.st = "todo"; delete c.fav; ED = c; enregistrer(true); };
  }
  async function enregistrer(dup) {
    try {
      edValide();
      if (valide(ED) && !ED.dr.length) throw new Error("Un protocole « Validé » doit contenir au moins une molécule.");
      if (!ED.c && !confirm("Cycle = 0 : traitement continu, sans cures répétées. Confirmer ?")) return;
      ED.ind = (ED.ind || []).map((x) => [0, 1, 2, 3].map((k) => String(x[k] || "").trim())).filter((x) => x.some(Boolean));
      if (!ED.ind.length) delete ED.ind;
      dedupIds(ED); delete ED.nouv;
      const neuf = !D().ctx.bib[ED.id];
      D().ctx.bib[ED.id] = ED; if (neuf) rangerNouveau(ED.id);
      A.occupe(A.$("fOk"), true);
      await sauverDocs([ED.id]);
      A.journal({ id: "", r: { nm: "" } }, (neuf ? (dup === true ? "Protocole dupliqué : " : "Protocole créé : ") : "Protocole modifié : ") + ED.nom);
      A.fermerFenetre(); A.toast("Protocole enregistré."); pageProtocoles();
      if (dup === true) window.prOuvrir(ED.id);
    } catch (e) { A.occupe(A.$("fOk"), false); A.erreur(e && e.code === "permission-denied" ? "Vous n'avez pas le droit de modifier la bibliothèque." : (e.message || String(e))); }
  }
};
window.prProp = (f, v) => { if (f === "c") ED.c = parseInt(v, 10) || 0; else if (f === "no") ED.no = String(v).split("\n").map((z) => z.trim()).filter(Boolean); else if (f === "assoc") ED.assoc = v ? 1 : 0; else ED[f] = String(v).trim(); };
window.prInd = (i, k, v) => { ED.ind[i][k] = String(v).trim(); };
window.prIndAj = () => { ED.ind.push(["", "", "", ""]); REDESSINER(); };
window.prIndSup = (i) => { ED.ind.splice(i, 1); REDESSINER(); };
function voir() {
  const esc = A.esc;
  A.fenetre("<h3>" + esc(ED.nom) + " " + badgeSt(ED) + '</h3><p class="mesures">' + esc(ED.r || "") + (ED.c ? " – cycle " + ED.c + " j" : " – continu") + '</p><div class="tableau"><table class="tcures"><tr><th>Produit</th><th>Dose</th><th>Unité</th><th>Jours</th><th>Voie</th><th>Durée</th></tr>' +
    ED.dr.map((d) => "<tr><td>" + esc(d.p) + "</td><td>" + esc(d.u === "txt" ? d.pos || "" : d.d != null ? d.d : (d.c1 != null ? d.c1 + "/" + d.cn : "")) + "</td><td>" + esc(d.u) + "</td><td>" + esc(d.jl || (d.j || []).filter((y) => y !== 99).map((y) => "J" + y).join(" ")) + "</td><td>" + esc(d.v || "") + "</td><td>" + esc(d.t || "") + "</td></tr>").join("") + "</table></div>" +
    (ED.no ? '<p style="color:#8A1C2B;font-size:13px">' + ED.no.map(esc).join("<br>") + "</p>" : "") + '<div class="boutons"><button class="bt gris" onclick="fermerFenetre()">Fermer</button></div>', "large");
}
