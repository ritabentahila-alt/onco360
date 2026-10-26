// Onco360 – Paramètres › Laboratoires (26/10/2026, demande de Dr Bentahila) : carnet des laboratoires du cabinet. Pour chaque laboratoire : ses
// délégués médicaux (nom et prénom, téléphone, e-mail ; plusieurs), ses produits (marque et molécule, présentation, prix par boîte / flacon /
// comprimé…, programme : « 1 acheté = 1 offert », remboursement…), les carnets qu'il distribue, une note. Document parametres/laboratoires
// { data: JSON [{ id, nom, delegues [{ nom, tel, email }], produits [{ marque, molecule, pres, prix, unite, prog }], carnets, note }] } ;
// lu par toute l'équipe, modifié avec le droit « paramètres » (règle parametres/{d}). Aucune donnée patient.
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "../config.js";

let A = null;
export function installer(api) { A = api; }
const D = () => A.D();
let LABS = null, Q = "";
const UNITES = ["boîte", "flacon", "comprimé", "gélule", "ampoule", "seringue", "sachet", "autre"];
const ref = () => doc(db, "espaces", A.ESPACE, "parametres", "laboratoires");
const peutModifier = () => A.peut("parametres");
const norm = (t) => String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const nid = () => "lab" + Date.now().toString(36) + Math.floor(Math.random() * 1000);
const prixTxt = (p) => (p.prix == null || p.prix === "" ? "Prix non renseigné" : Number(p.prix).toLocaleString("fr-FR").replace(/[  ]/g, " ") + " DH" + (p.unite ? " / " + p.unite : ""));
const X = '<span data-echap="1" hidden></span><button type="button" class="b3 fen-x" onclick="fermerFenetre()" aria-label="Fermer" title="Fermer (Échap)">✕</button>';

async function charger() {
  try { const s = await getDoc(ref()); LABS = s.exists() ? JSON.parse(s.data().data || "[]") : []; } catch (e) { console.warn("laboratoires", e); LABS = []; }
}
async function sauver(L) {
  await setDoc(ref(), { data: JSON.stringify(L), majPar: D().u.uid, maj: new Date().toISOString() });
  LABS = L;
}

// Recherche : laboratoire, délégué, marque, molécule, programme (mots dans n'importe quel ordre, sans accents)
const correspond = (l) => { const m = norm(Q).split(/\s+/).filter(Boolean); if (!m.length) return true;
  const t = norm([l.nom, l.carnets, l.note].concat((l.delegues || []).map((d) => d.nom + " " + d.tel + " " + d.email), (l.produits || []).map((p) => p.marque + " " + p.molecule + " " + p.prog)).join(" "));
  return m.every((w) => t.indexOf(w) >= 0); };

function carteLabo(l) {
  const esc = A.esc, q = "'" + esc(l.id) + "'";
  const del = (l.delegues || []).length ? (l.delegues || []).map((d) => '<div class="lb-del">' + A.ic("profil") + '<span class="lb-dn">' + esc(d.nom || "—") + "</span>" +
    (d.tel ? '<a href="tel:' + esc(String(d.tel).replace(/\s+/g, "")) + '">' + esc(d.tel) + "</a>" : "") + (d.email ? '<a href="mailto:' + esc(d.email) + '">' + esc(d.email) + "</a>" : "") + "</div>").join("") : '<p class="mesures">Aucun délégué noté.</p>';
  const pro = (l.produits || []).length ? '<div class="lb-pros">' + (l.produits || []).map((p) => '<div class="lb-pro"><div class="lb-pl"><b>' + esc(p.marque || "—") + "</b>" + (p.molecule ? ' <span class="lb-mol">(' + esc(p.molecule) + ")</span>" : "") +
      (p.pres ? '<span class="lb-pres"> · ' + esc(p.pres) + "</span>" : "") + '<span class="lb-px' + (p.prix == null || p.prix === "" ? " vide" : "") + '">' + esc(prixTxt(p)) + "</span></div>" +
      (p.prog ? '<div class="lb-prog">' + A.ic("drapeau") + "<span>" + esc(p.prog) + "</span></div>" : "") + "</div>").join("") + "</div>" : '<p class="mesures">Aucun produit noté.</p>';
  return '<article class="carte lb-carte" data-lab="' + esc(l.id) + '"><div class="lb-tete"><h3>' + esc(l.nom || "Laboratoire") + "</h3>" +
    (peutModifier() ? '<button class="b2" onclick="lbModifier(' + q + ')">' + A.ic("crayon") + "Modifier</button>" + A.menuPts(['<button class="mini r" onclick="lbSupprimer(' + q + ')">Supprimer le laboratoire</button>']) : "") + "</div>" +
    '<div class="lb-grille"><section><h4>Délégués médicaux</h4>' + del + "</section><section><h4>Produits</h4>" + pro + "</section></div>" +
    (l.carnets || l.note ? '<div class="lb-pied">' + (l.carnets ? '<div><span class="lb-l">Carnets distribués</span>' + esc(l.carnets) + "</div>" : "") + (l.note ? '<div><span class="lb-l">Note</span>' + esc(l.note) + "</div>" : "") + "</div>" : "") + "</article>";
}

export function pageLaboratoires() {
  if (LABS === null) { A.$("page").innerHTML = A.enteteParametres() + '<section class="carte"><p class="sous">Chargement des laboratoires…</p></section>'; charger().then(() => { if (location.hash.indexOf("#parametres") === 0) pageLaboratoires(); }); return; }
  const esc = A.esc, L = LABS.filter(correspond).sort((a, b) => String(a.nom).localeCompare(String(b.nom), "fr", { sensitivity: "base" }));
  A.$("page").innerHTML = A.enteteParametres() +
    '<div class="barre-page lb-barre"><div class="bp-vue"><div class="recherche">' + A.ic("loupe") + '<input id="lbQ" type="search" autocomplete="off" placeholder="Rechercher : laboratoire, délégué, marque, molécule…" value="' + esc(Q) + '" aria-label="Rechercher un laboratoire"></div></div>' +
    (peutModifier() ? '<div class="bp-act"><button class="b1" onclick="lbModifier()">' + A.ic("plus") + "Nouveau laboratoire</button></div>" : "") + "</div>" +
    '<div class="lb-liste">' + (L.length ? L.map(carteLabo).join("") : '<section class="carte"><div class="vide-e"><p>' + (LABS.length ? "Aucun laboratoire ne correspond à la recherche." : "Aucun laboratoire noté.") + "</p>" +
      (!LABS.length && peutModifier() ? '<button class="b2" onclick="lbModifier()">' + A.ic("plus") + "Nouveau laboratoire</button>" : "") + "</div></section>") + "</div>";
  const q = A.$("lbQ"); q.oninput = () => { Q = q.value; const z = document.querySelector(".lb-liste"), L2 = LABS.filter(correspond).sort((a, b) => String(a.nom).localeCompare(String(b.nom), "fr", { sensitivity: "base" }));
    z.innerHTML = L2.length ? L2.map(carteLabo).join("") : '<section class="carte"><div class="vide-e"><p>Aucun laboratoire ne correspond à la recherche.</p></div></section>'; };
}

// ───── Fenêtre d'un laboratoire (nouveau ou modification) ─────
const ligneDel = (d) => '<div class="lb-r lb-rd"><input class="lb-dn" placeholder="Nom et prénom" aria-label="Nom et prénom du délégué" value="' + A.esc((d && d.nom) || "") + '">' +
  '<input class="lb-dt" type="tel" placeholder="Téléphone" aria-label="Téléphone" value="' + A.esc((d && d.tel) || "") + '"><input class="lb-de" type="email" placeholder="E-mail" aria-label="E-mail" value="' + A.esc((d && d.email) || "") + '">' +
  '<button type="button" class="b3" onclick="lbRetirer(this)" title="Retirer ce délégué" aria-label="Retirer">✕</button></div>';
const lignePro = (p) => '<div class="lb-r lb-rp"><input class="lb-pm" placeholder="Marque (ex. KEYTRUDA)" aria-label="Marque" value="' + A.esc((p && p.marque) || "") + '">' +
  '<input class="lb-pmo" placeholder="Molécule" aria-label="Molécule" value="' + A.esc((p && p.molecule) || "") + '"><input class="lb-pp" placeholder="Présentation (ex. 1 flacon 100 mg)" aria-label="Présentation" value="' + A.esc((p && p.pres) || "") + '">' +
  '<input class="lb-ppx" inputmode="decimal" placeholder="Prix (DH)" aria-label="Prix en DH" value="' + A.esc(p && p.prix != null ? String(p.prix).replace(".", ",") : "") + '">' +
  '<select class="lb-pu" aria-label="Prix par">' + UNITES.map((u) => '<option value="' + u + '"' + ((p && p.unite) === u ? " selected" : "") + ">par " + u + "</option>").join("") + "</select>" +
  '<button type="button" class="b3" onclick="lbRetirer(this)" title="Retirer ce produit" aria-label="Retirer">✕</button>' +
  '<textarea class="lb-pg" rows="1" placeholder="Programme (ex. 1 flacon acheté = 1 offert ; remboursement des 5 % non pris en charge par l\'AMO)" aria-label="Programme">' + A.esc((p && p.prog) || "") + "</textarea></div>";
window.lbRetirer = (b) => b.closest(".lb-r").remove();
window.lbAjouter = (k) => { const z = A.$(k === "del" ? "lbDels" : "lbPros"); z.insertAdjacentHTML("beforeend", k === "del" ? ligneDel(null) : lignePro(null)); const l = z.querySelectorAll(".lb-r"); l[l.length - 1].querySelector("input").focus(); };
window.lbModifier = (id) => {
  if (!peutModifier()) return;
  const l = (LABS || []).find((z) => z.id === id) || null, esc = A.esc;
  A.fenetre(X + "<h3>" + (l ? "Modifier le laboratoire" : "Nouveau laboratoire") + '</h3><div class="form lb-form"><div class="large"><label for="lbNom">Nom du laboratoire</label><input id="lbNom" value="' + esc((l && l.nom) || "") + '" placeholder="Ex. MSD, Pharma 5…"></div></div>' +
    '<h4 class="soustitre">Délégués médicaux</h4><div id="lbDels" class="lb-lignes">' + ((l && l.delegues) || []).map(ligneDel).join("") + (!(l && (l.delegues || []).length) ? ligneDel(null) : "") + "</div>" +
    '<button type="button" class="b2 lb-plus" onclick="lbAjouter(\'del\')">' + A.ic("plus") + "Ajouter un délégué</button>" +
    '<h4 class="soustitre">Produits</h4><div id="lbPros" class="lb-lignes">' + ((l && l.produits) || []).map(lignePro).join("") + (!(l && (l.produits || []).length) ? lignePro(null) : "") + "</div>" +
    '<button type="button" class="b2 lb-plus" onclick="lbAjouter(\'pro\')">' + A.ic("plus") + "Ajouter un produit</button>" +
    '<div class="form lb-form" style="margin-top:14px"><div class="large"><label for="lbCar">Carnets distribués</label><input id="lbCar" value="' + esc((l && l.carnets) || "") + '" placeholder="Ex. carnets pour réaliser le PD-L1 gratuitement"></div>' +
    '<div class="large"><label for="lbNote">Note</label><textarea id="lbNote" rows="2">' + esc((l && l.note) || "") + "</textarea></div></div>" +
    '<div class="err" id="fErr"></div><div class="boutons"><button class="b2" onclick="fermerFenetre()">Annuler</button><button class="b1" id="lbOk">Enregistrer</button></div>', "large");
  A.$("lbOk").onclick = async () => {
    const t = (e, s) => String((e.querySelector(s) || {}).value || "").replace(/\s+/g, " ").trim();
    const nom = String(A.val("lbNom") || "").replace(/\s+/g, " ").trim(); if (!nom) { A.erreur("Indiquez le nom du laboratoire."); return; }
    if ((LABS || []).some((z) => z.id !== (l && l.id) && norm(z.nom) === norm(nom))) { A.erreur("Ce laboratoire est déjà noté : « " + nom + " »."); return; }
    const delegues = [...document.querySelectorAll("#lbDels .lb-r")].map((r) => ({ nom: t(r, ".lb-dn"), tel: t(r, ".lb-dt"), email: t(r, ".lb-de") })).filter((d) => d.nom || d.tel || d.email);
    if (delegues.some((d) => d.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email))) { A.erreur("Une adresse e-mail n'est pas valide."); return; }
    const produits = [...document.querySelectorAll("#lbPros .lb-r")].map((r) => { const px = t(r, ".lb-ppx").replace(/\s/g, "").replace(",", "."), n = parseFloat(px);
      return { marque: t(r, ".lb-pm"), molecule: t(r, ".lb-pmo"), pres: t(r, ".lb-pp"), prix: px && !isNaN(n) ? n : null, unite: t(r, ".lb-pu"), prog: String(r.querySelector(".lb-pg").value || "").trim() }; }).filter((p) => p.marque || p.molecule);
    if (document.querySelector("#lbPros .lb-r") && [...document.querySelectorAll("#lbPros .lb-ppx")].some((i) => i.value.trim() && isNaN(parseFloat(i.value.replace(/\s/g, "").replace(",", "."))))) { A.erreur("Un prix n'est pas un nombre."); return; }
    const neuf = { id: (l && l.id) || nid(), nom, delegues, produits, carnets: String(A.val("lbCar") || "").trim(), note: String(A.val("lbNote") || "").trim() };
    A.occupe(A.$("lbOk"), true);
    try { await charger(); const L = LABS.filter((z) => z.id !== neuf.id).concat([neuf]); await sauver(L); A.fermerFenetre(); A.toast("Laboratoire enregistré."); pageLaboratoires(); }
    catch (e) { A.occupe(A.$("lbOk"), false); A.erreur(e && e.code === "permission-denied" ? "Vous n'avez pas le droit de modifier les laboratoires." : (e && e.message) || String(e)); }
  };
};
window.lbSupprimer = async (id) => {
  const l = (LABS || []).find((z) => z.id === id); if (!l || !peutModifier() || !confirm("Supprimer le laboratoire « " + l.nom + " » et tout ce qui est noté (délégués, produits) ?")) return;
  try { await charger(); await sauver(LABS.filter((z) => z.id !== id)); A.toast("Laboratoire supprimé."); pageLaboratoires(); } catch (e) { A.toast("Suppression impossible : " + ((e && e.message) || e)); }
};
