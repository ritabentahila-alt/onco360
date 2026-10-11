// Onco360 – abonnement du cabinet vu par le médecin titulaire (étape 18.5, 10/10/2026, modèle : Tbibclic) :
// - carte du tableau de bord quand l'essai se termine, que l'échéance approche ou est dépassée (« Renouveler » → Profil &
//   Paramètres › Abonnement) ;
// - onglets Abonnement (formule, état, échéance, prix mensuel / annuel « 2 mois offerts », demande de renouvellement ou de
//   changement de formule, coordonnées de paiement) et Factures (factures et avoirs du cabinet, à imprimer) de Mon compte.
// Lu par la fonction serveur monAbonnement (titulaire seulement : la facturation reste invisible des autres membres) ;
// demandes : fonction demandeAbonnement (pas de paiement en ligne, l'administration enregistre le paiement reçu).
import { htmlFacture, dh2 } from "../donnees/factures.js";

let A = null, ABO = undefined, CHARGE = null; // ABO : undefined = pas lu, null = illisible / pas titulaire
export function installer(api) { A = api; }
const D = () => A.D();
export const estTitulaire = () => !!(D() && D().espaceDoc && D().espaceDoc.titulaire === D().u.uid && !D().bib);
export function chargerAbo(force) {
  if (!estTitulaire()) return Promise.resolve(null);
  if (CHARGE && !force) return CHARGE;
  CHARGE = A.serveur("monAbonnement", { espace: A.ESPACE }).then((o) => { ABO = o; return o; }).catch((e) => { console.warn("abonnement", e.message); ABO = null; return null; });
  return CHARGE;
}
const dh = (n) => (n == null || n === "" ? "—" : Number(n).toLocaleString("fr-FR").replace(/ | /g, " ") + " DH");
const dLong = (d) => (d ? new Date(d + "T12:00:00").toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) : "");
const MODES = { essai: "Essai gratuit", mensuel: "Mensuel", annuel: "Annuel", gratuit: "Gratuit" };

// ───── Tableau de bord : bandeau ou carte ─────
// Titulaire seulement, jamais pour un abonnement à jour ou gratuit. Audit externe (11/10/2026) : pendant l'essai et avant
// l'échéance, un bandeau d'une ligne sous « Bonjour » ; la grande carte seulement les 7 derniers jours et en cas de retard, en haut
// de la colonne de droite (#accAbo, préparé par pageAccueil), après le programme du jour sur téléphone.
const DERNIERS_JOURS = 7;
export function carteAccueil() {
  if (!estTitulaire()) return null;
  if (ABO === undefined) { chargerAbo().then(() => { if ((D().page || "") === "accueil") placerCarte(); }); return null; }
  const o = ABO; if (!o || !o.suivi) return null;
  const E = o.etat || {}, et = E.etat;
  if (["essai", "renouveler", "retard", "suspendre"].indexOf(et) < 0) return null;
  const esc = A.esc, retard = et === "retard" || et === "suspendre", jours = retard ? 0 : E.jours || 0;
  const badge = retard ? "EXPIRÉ" : et === "essai" ? "ESSAI GRATUIT" : "À RENOUVELER", titre = retard ? "Abonnement expiré" : et === "essai" ? "Fin de l'essai gratuit" : "Abonnement bientôt à renouveler";
  if (!retard && jours > DERNIERS_JOURS) return { bandeau: true, html: '<div class="abo-band" data-abo-carte>' + A.ic("horloge") + "<span><b>" + (et === "essai" ? "Essai gratuit" : "Abonnement") + "</b> · " + jours + " jours restants" +
    " (" + (et === "essai" ? "fin de l'essai le " : "échéance le ") + esc(dLong(E.fin)) + ')</span><a href="#profil/abonnement">' + (et === "essai" ? "Choisir ma formule" : "Renouveler") + " ›</a></div>" };
  const total = et === "essai" ? 30 : o.periode === "an" ? 365 : 30, fait = Math.max(0, Math.min(100, Math.round(((total - jours) / total) * 100)));
  return { html: '<section class="carte abo-c ' + (retard ? "rouge" : "orange") + '" data-abo-carte><div class="abo-g"><div class="abo-tete"><span class="abo-b">' + badge + "</span>" + esc(o.pack || "") + "</div>" +
    '<div class="abo-l"><div class="abo-j"><b>' + jours + "</b><span>jour" + (jours !== 1 ? "s" : "") + "<br>restant" + (jours !== 1 ? "s" : "") + '</span></div><div class="abo-t"><h3>' + titre + "</h3>" +
    '<p class="abo-e">' + (et === "essai" ? "Fin de l'essai le " : "Échéance le ") + esc(dLong(E.fin)) + (retard ? " · en retard de " + E.jours + " jour" + (E.jours > 1 ? "s" : "") : "") + "</p>" +
    '<p class="sous">' + (retard ? "Renouvelez pour continuer à utiliser Onco360 sans interruption." : et === "essai" ? "Choisissez votre formule pour continuer après l'essai." : "Pensez à renouveler votre abonnement.") + "</p>" +
    '<div class="abo-p"><i style="width:' + fait + '%"></i></div></div></div></div><a class="bt ' + (retard ? "rouge" : "plein") + '" href="#profil/abonnement">' + A.ic("banque") + "Renouveler ›</a></section>" };
}
function placerCarte() {
  if (document.querySelector("#page [data-abo-carte]")) return; const c = carteAccueil(); if (!c) return;
  const z = document.querySelector("#page section.accueil"), p = document.getElementById("accAbo");
  if (c.bandeau) { if (z) z.insertAdjacentHTML("afterend", c.html); return; }
  if (p) { p.innerHTML = c.html; return; }
  const j = document.querySelector("#page section.jour") || z; if (j) j.insertAdjacentHTML("afterend", c.html); // tableau de bord sur une colonne
}
export const apresAccueil = () => placerCarte();

// ───── Onglet Abonnement ─────
export function htmlAbonnement() {
  const esc = A.esc;
  if (ABO === undefined) return '<section class="carte"><p class="sous">Chargement de votre abonnement…</p></section>';
  const o = ABO;
  if (!o) return '<section class="carte"><p class="sous" style="color:var(--rouge)">Votre abonnement n\'a pas pu être lu. Rechargez la page.</p></section>';
  if (!o.suivi) return '<section class="carte"><h3><span class="ic">' + A.ic("banque") + "</span>Mon abonnement</h3><p class=\"sous\">" + (o.demo ? "Cabinet de démonstration : pas d'abonnement." : o.modele ? "Votre cabinet n'a pas d'abonnement (tout compris, sans limite)." : "Votre abonnement n'est pas encore en place : l'équipe Onco360 vous contactera.") + "</p></section>";
  const E = o.etat || {}, et = E.etat, retard = et === "retard" || et === "suspendre", P = o.prixPack || {};
  const lib = { essai: "Essai", ajour: "Actif", renouveler: "À renouveler", retard: "Expiré", suspendre: "Expiré", gratuit: "Gratuit" }[et] || "";
  const cls = { essai: "b-co", ajour: "b-ch", renouveler: "b-or", retard: "b-al", suspendre: "b-al", gratuit: "b-ch" }[et] || "b-gr";
  const carte = (mode, titre, prix, unite, extra, actuel) => '<div class="abo-f' + (actuel ? " actuel" : "") + '">' + (mode === "annuel" ? '<span class="abo-off">★ 2 mois offerts</span>' : "") + "<h4>" + titre + "</h4>" + extra +
    '<div class="abo-px">' + (mode === "annuel" && P.mois ? '<s>' + dh(P.mois * 12) + "</s> " : "") + "<b>" + dh(prix) + "</b> / " + unite + "</div>" +
    (actuel ? '<button class="bt clair" onclick="aboDemande(\'renouveler\')">Renouveler maintenant</button>' : '<button class="bt plein" onclick="aboDemande(\'' + mode + '\')">' + (mode === "annuel" ? "Passer à l'annuel" : "Passer au mensuel") + "</button>") + "</div>";
  const actuel = o.mode === "annuel" ? "annuel" : o.mode === "mensuel" ? "mensuel" : "";
  return '<section class="carte"><h3><span class="ic">' + A.ic("banque") + '</span>Mon abonnement</h3><p class="sous">Votre formule et son renouvellement.</p>' +
    '<div class="abo-r"><div><b class="abo-n">' + esc(String(o.pack || "").toUpperCase()) + '</b> <span class="badge ' + cls + '">' + lib + "</span>" +
    '<p class="abo-e2">' + A.ic("agenda") + (et === "essai" ? " Fin de l'essai gratuit : " : et === "gratuit" ? " Sans échéance" : " Prochaine échéance : ") + esc(dLong(E.fin)) + (retard ? ' <span style="color:var(--rouge)">(en retard de ' + E.jours + " j)</span>" : "") + "</p></div>" +
    '<div class="mesures">' + esc(MODES[o.mode] || "") + (o.prix && (o.mode === "mensuel" || o.mode === "annuel") ? " · " + dh(o.prix) + (o.periode === "an" ? " / an" : " / mois") : "") + "</div></div>" +
    (et === "gratuit" ? "" : '<div class="abo-fs">' + carte("mensuel", "Mensuel", P.mois, "mois", o.mode === "essai" ? '<span class="abo-ess">' + A.ic("horloge") + " Essai gratuit jusqu'au " + esc(dLong(o.essaiFin)) + "</span>" : "", actuel === "mensuel") +
      carte("annuel", "Annuel", P.an, "an", P.mois && P.an ? '<span class="abo-ess vert">Vous économisez ' + dh(P.mois * 12 - P.an) + "</span>" : "", actuel === "annuel") + "</div>" +
      '<p class="mesures" style="margin-top:10px">Prix TTC (TVA 20 % comprise). Le paiement se fait par virement ou par chèque' + (o.paiement && o.paiement.rib ? " — RIB : <b>" + esc(o.paiement.rib) + "</b>" + (o.paiement.banque ? " (" + esc(o.paiement.banque) + ")" : "") + (o.paiement.raison ? ", au nom de " + esc(o.paiement.raison) : "") : "") + " ; votre facture apparaît dans l'onglet Factures dès que le paiement est reçu.</p>") +
    ((o.demandes || []).length ? '<div class="abo-dem">' + o.demandes.map((q) => "Demande envoyée le " + esc(new Date(q.le).toLocaleDateString("fr-FR")) + " : " + esc({ renouveler: "renouveler", annuel: "passer à l'annuel", mensuel: "passer au mensuel" }[q.type]) + " — en attente de l'équipe Onco360.").join("<br>") + "</div>" : "") +
    "</section>";
}
window.aboDemande = (type) => {
  const L = { renouveler: "Renouveler mon abonnement", annuel: "Passer à l'abonnement annuel", mensuel: "Passer à l'abonnement mensuel" };
  A.fenetre("<h3>" + L[type] + '</h3><p class="sous">Votre demande est envoyée à l\'équipe Onco360, qui vous contacte pour le paiement (virement ou chèque). Rien n\'est prélevé automatiquement.</p>' +
    '<div class="form"><div class="large"><label for="aboMsg">Message (facultatif)</label><textarea id="aboMsg" rows="3" placeholder="ex. je préfère payer par chèque, rappelez-moi le matin…"></textarea></div></div>' +
    '<div class="err" id="fErr"></div><div class="boutons"><button class="bt gris" onclick="fermerFenetre()">Annuler</button><button class="bt plein" id="aboOk">Envoyer la demande</button></div>');
  document.getElementById("aboOk").onclick = async () => {
    A.occupe(document.getElementById("aboOk"), true);
    try { await A.serveur("demandeAbonnement", { espace: A.ESPACE, type, message: document.getElementById("aboMsg").value }); await chargerAbo(true); A.fermerFenetre(); A.toast("Demande envoyée à l'équipe Onco360."); if (location.hash.startsWith("#profil")) window.dispatchEvent(new HashChangeEvent("hashchange")); }
    catch (e) { A.occupe(document.getElementById("aboOk"), false); A.erreur("Envoi impossible : " + e.message); }
  };
};

// ───── Onglet Factures ─────
export function htmlFactures() {
  const esc = A.esc;
  if (ABO === undefined) return '<section class="carte"><p class="sous">Chargement de vos factures…</p></section>';
  const L = (ABO && ABO.factures) || [];
  return '<section class="carte"><h3><span class="ic">' + A.ic("document") + '</span>Mes factures</h3><p class="sous">Historique de vos paiements : une facture à chaque paiement reçu (un avoir si un paiement est annulé).</p>' +
    (L.length ? '<div class="tableau"><table class="tab"><thead><tr><th>Numéro</th><th>Date</th><th>Désignation</th><th class="n">Montant TTC</th><th></th></tr></thead><tbody>' +
      L.map((F) => "<tr><td><b>" + esc(F.numero) + "</b>" + (F.type === "avoir" ? ' <span class="badge b-al">avoir</span>' : "") + "</td><td>" + esc(A.dfrA(F.d)) + "</td><td>" + esc(((F.lignes || [])[0] || {}).lib || "") + '</td><td class="n">' + (F.type === "avoir" ? "− " : "") + esc(dh2(F.ttc)) + '</td><td><button class="bt clair petit" onclick="aboFacture(\'' + esc(F.id) + '\')">' + A.ic("imprimer") + "Télécharger</button></td></tr>").join("") + "</tbody></table></div>"
      : '<div class="vide-abo">Aucune facture pour le moment.</div>') + "</section>";
}
window.aboFacture = (id) => {
  const F = ((ABO && ABO.factures) || []).find((x) => x.id === id); if (!F) return;
  const w = window.open("", "_blank"); if (!w) { A.toast("Autorisez les fenêtres (pop-up) pour afficher la facture."); return; }
  w.document.open(); w.document.write(htmlFacture(F).replace("</body>", '<script>setTimeout(function(){window.print()},300)<\/script></body>')); w.document.close(); w.focus();
};
