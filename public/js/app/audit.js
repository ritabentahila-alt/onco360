// Onco360 – Journal d'audit (étape 9 S1, 09/10/2026) : onglet « Journal d'audit » de la page Paramètres, pour le médecin titulaire
// seul (règles). Lignes écrites par le serveur (functions/index.js auditEcriture, logique functions/audit.js) dans
// audit/{cabinet}/lignes : qui a créé, modifié, supprimé ou ouvert quoi, et quand. Période (lue sur le serveur), puis filtres à
// l'écran : personne, action, partie, patient. Export pour Excel. « Journal » du dossier : auditPatient(id).
import { collection, query, where, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "../config.js";

let A = null;
export function installer(api) { A = api; }
const D = () => A.D();
const MAX = 3000; // lignes lues au plus pour une période (au-delà : message, choisir une période plus courte)
const ACTIONS = { creation: "Création", modification: "Modification", suppression: "Suppression", ouverture: "Ouverture" };
const ROLES = { medecin: "Médecin", assistante: "Secrétaire", infirmiere: "Infirmière", comptable: "Comptable" };
const jour = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const dateDe = (v) => (v && typeof v.toDate === "function" ? v.toDate() : v ? new Date(v) : null);
const heure = (d) => (d ? d.toLocaleDateString("fr-FR") + " " + d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "");
// État de l'onglet : période, filtres, lignes lues
const F = { du: "", au: "", qui: "", act: "", lib: "", pat: "", patId: "", lignes: null, cle: "", err: "" };

// Depuis le dossier : journal de ce patient (titulaire)
window.auditPatient = (pid) => { const x = (D().patients || []).find((p) => p.id === pid); F.patId = pid; F.pat = x ? x.r.nm : ""; if (!F.du) init(); F.du = jour(new Date(Date.now() - 365 * 864e5)); F.lignes = null; location.hash = "parametres/audit"; };
function init() { const t = new Date(); F.au = jour(t); F.du = jour(new Date(t.getTime() - 7 * 864e5)); }

async function lire() {
  const cle = F.du + "|" + F.au; if (F.lignes && F.cle === cle) return;
  F.err = "";
  try {
    const s = await getDocs(query(collection(db, "audit", A.ESPACE, "lignes"), where("le", ">=", new Date(F.du + "T00:00:00")), where("le", "<", new Date(new Date(F.au + "T00:00:00").getTime() + 864e5)), orderBy("le", "desc"), limit(MAX)));
    F.lignes = s.docs.map((d) => Object.assign({ id: d.id }, d.data(), { d: dateDe(d.data().le) })).sort((a, b) => (b.d || 0) - (a.d || 0));
  } catch (e) { F.lignes = []; F.err = e && e.code === "permission-denied" ? "Le journal d'audit est réservé au médecin titulaire du cabinet." : (e.message || String(e)); }
  F.cle = cle;
}
const quiDe = (l) => (l.via === "serveur" ? "Onco360 (serveur)" + (l.parNom ? " pour " + l.parNom : "") : l.parNom || "?");
const decrire = (l) => l.lib + (l.element ? " « " + l.element + " »" : "") + (l.quoi && l.quoi.length ? " : " + l.quoi.join(", ") : "");
function filtrees() {
  const s = (x) => A.sansAcc(x || ""), m = s(F.pat).split(/\s+/).filter(Boolean);
  return (F.lignes || []).filter((l) => (!F.qui || (l.par || l.pour) === F.qui) && (!F.act || l.type === F.act) && (!F.lib || l.lib === F.lib) &&
    (F.patId ? l.patientId === F.patId : m.every((w) => s(l.patientNom).indexOf(w) >= 0)));
}

// Contenu de l'onglet (dans la page Paramètres)
export async function afficherAudit(z) {
  if (!F.du) init();
  z.innerHTML = '<section class="carte"><p class="sous">Chargement du journal…</p></section>';
  await lire(); if (!z.isConnected) return;
  const esc = A.esc, L = F.lignes || [], V = filtrees(), opt = (v, lib, sel) => '<option value="' + esc(v) + '"' + (v === sel ? " selected" : "") + ">" + esc(lib) + "</option>";
  const personnes = [...new Map(L.filter((l) => l.par || l.pour).map((l) => [l.par || l.pour, l.parNom || "?"])).entries()].sort((a, b) => a[1].localeCompare(b[1]));
  const parties = [...new Set(L.map((l) => l.lib))].sort();
  const nb = (t) => V.filter((l) => l.type === t).length;
  z.innerHTML = '<section class="carte"><h3><span class="ic">' + A.ic("liste") + "</span>Journal d'audit</h3>" +
    '<p class="sous">Qui a consulté, créé, modifié ou supprimé quoi, et quand. Noté par le serveur avec l\'identité de la personne connectée : personne ne peut modifier ni effacer une ligne, pas même le titulaire. Pour une modification, seule la partie du dossier touchée est indiquée (pas les valeurs).</p>' +
    '<div class="form au-f"><div><label for="auDu">Du</label><input type="date" id="auDu" value="' + esc(F.du) + '"></div><div><label for="auAu">Au</label><input type="date" id="auAu" value="' + esc(F.au) + '"></div>' +
    '<div><label for="auQui">Personne</label><select id="auQui">' + opt("", "Tout le monde", F.qui) + personnes.map(([u, n]) => opt(u, n, F.qui)).join("") + "</select></div>" +
    '<div><label for="auAct">Action</label><select id="auAct">' + opt("", "Toutes", F.act) + Object.entries(ACTIONS).map(([k, v]) => opt(k, v, F.act)).join("") + "</select></div>" +
    '<div><label for="auLib">Partie</label><select id="auLib">' + opt("", "Toutes", F.lib) + parties.map((p) => opt(p, p, F.lib)).join("") + "</select></div>" +
    '<div><label for="auPat">Patient</label><input id="auPat" type="search" placeholder="Nom du patient" value="' + esc(F.pat) + '"></div></div>' +
    '<div class="au-bas"><span class="mesures">' + V.length + " ligne" + (V.length > 1 ? "s" : "") + (V.length !== L.length ? " sur " + L.length : "") + (V.length ? " · " + Object.keys(ACTIONS).filter(nb).map((t) => nb(t) + " " + ACTIONS[t].toLowerCase() + (nb(t) > 1 ? "s" : "")).join(" · ") : "") + "</span>" +
    (F.patId ? '<button class="bt clair petit" id="auTous">Tous les patients</button>' : "") + '<button class="bt clair petit" id="auCsv"' + (V.length ? "" : " disabled") + ">" + A.ic("telecharger") + "Exporter (Excel)</button></div>" +
    (F.err ? '<p class="err">' + esc(F.err) + "</p>" : "") + (L.length >= MAX ? '<p class="err">Plus de ' + MAX + " lignes sur cette période : seules les plus récentes sont affichées. Choisissez une période plus courte.</p>" : "") +
    (V.length ? '<div class="tableau au-t"><table class="tcures"><tr><th>Date</th><th>Personne</th><th>Action</th><th>Quoi</th><th>Patient</th></tr>' + V.slice(0, 500).map((l) =>
      "<tr><td>" + esc(heure(l.d)) + "</td><td>" + esc(quiDe(l)) + (l.parRole ? '<div class="mesures">' + esc(ROLES[l.parRole] || l.parRole) + "</div>" : "") + '</td><td><span class="badge ' + ({ creation: "b-ch", modification: "b-co", suppression: "b-al", ouverture: "b-gr" }[l.type] || "") + '">' + esc(ACTIONS[l.type] || l.type) + "</span></td><td>" + esc(decrire(l)) + "</td><td>" +
      (l.patientId ? ((D().patients || []).some((p) => p.id === l.patientId) ? '<a href="#dossier/' + encodeURIComponent(l.patientId) + '">' + esc(l.patientNom || "Dossier") + "</a>" : esc(l.patientNom || "Dossier supprimé")) : "") + "</td></tr>").join("") + "</table></div>" +
      (V.length > 500 ? '<p class="mesures">500 premières lignes affichées : l\'export contient les ' + V.length + " lignes.</p>" : "")
      : '<p class="sous" style="margin-top:12px">Aucune ligne pour cette période et ces filtres.</p>') + "</section>";
  const re = () => afficherAudit(z);
  A.$("auDu").onchange = () => { F.du = A.$("auDu").value || F.du; re(); };
  A.$("auAu").onchange = () => { F.au = A.$("auAu").value || F.au; re(); };
  A.$("auQui").onchange = () => { F.qui = A.$("auQui").value; re(); };
  A.$("auAct").onchange = () => { F.act = A.$("auAct").value; re(); };
  A.$("auLib").onchange = () => { F.lib = A.$("auLib").value; re(); };
  A.$("auPat").oninput = () => { F.pat = A.$("auPat").value; F.patId = ""; clearTimeout(F.t); F.t = setTimeout(async () => { const pos = A.$("auPat").selectionStart; await re(); const p = A.$("auPat"); if (p) { p.focus(); p.setSelectionRange(pos, pos); } }, 250); };
  if (A.$("auTous")) A.$("auTous").onclick = () => { F.patId = ""; F.pat = ""; re(); };
  A.$("auCsv").onclick = () => exporter(V);
}
// Export pour Excel : point-virgule, BOM UTF-8 (accents)
function exporter(V) {
  const t = [["Date", "Personne", "Rôle", "Action", "Partie", "Élément", "Ce qui a changé", "Patient", "Identifiant du patient"]].concat(V.map((l) => [heure(l.d), quiDe(l), ROLES[l.parRole] || l.parRole || "", ACTIONS[l.type] || l.type, l.lib, l.element || "", (l.quoi || []).join(", "), l.patientNom || "", l.patientId || ""]));
  const csv = t.map((r) => r.map((v) => '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"').join(";")).join("\r\n");
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" })); a.download = "Journal_audit_" + F.du + "_" + F.au + ".csv"; document.body.appendChild(a); a.click(); a.remove();
  A.journal({ id: "", r: { nm: "" } }, "Journal d'audit exporté (" + V.length + " lignes, " + F.du + " → " + F.au + ")");
}
