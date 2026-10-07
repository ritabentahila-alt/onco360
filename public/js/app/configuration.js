// Onco360 – Configuration (étape C4) : créneaux et horaires, absences (fermetures, congés, congrès), jours fériés.
// Tout est enregistré dans parametres/calendrier (même document que l'application actuelle : feries, abs) + horaires.
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "../config.js";
import { FERIES0 } from "../donnees/listes.js";

let A = null;
export function installer(api) { A = api; }
const D = () => A.D();
const JOURS = [[1, "Lundi"], [2, "Mardi"], [3, "Mercredi"], [4, "Jeudi"], [5, "Vendredi"], [6, "Samedi"], [0, "Dimanche"]];
const TYPES = ["Congé", "Congrès", "Voyage", "Formation", "Fermeture du cabinet", "Autre"];
export const HORAIRES0 = () => ({ duree: 30, jours: { 1: [["08:30", "18:00"]], 2: [["08:30", "18:00"]], 3: [["08:30", "18:00"]], 4: [["08:30", "18:00"]], 5: [["08:30", "18:00"]], 6: [], 0: [] } });
// Horaires en vigueur : ceux de l'établissement s'il a ses propres plages, sinon ceux du cabinet (par défaut 8 h 30 – 18 h)
export const horaires = (etab) => { const c = D().cal || {}; return (etab && c.horairesEtab && c.horairesEtab[etab]) || c.horaires || HORAIRES0(); };
// Messages WhatsApp prédéfinis. Variables : {prenom} {nom} {jour} {heure} {lieu} {adresse} {medecin}
export const WA0 = {
  chimio: "Bonjour {prenom}, nous vous rappelons votre séance de chimiothérapie le {jour} {heure} à {lieu}.\nMerci d'apporter votre bilan sanguin récent (NFS, plaquettes, créatinine), vos ordonnances et vos derniers comptes rendus. Pensez à prendre votre prémédication si elle vous a été prescrite.\nEn cas de fièvre ou de problème, appelez-nous avant de vous déplacer.\n{medecin}",
  annonce: "Bonjour {prenom}, nous vous rappelons votre consultation d'annonce le {jour} {heure} à {lieu}.\nMerci d'apporter tous vos examens (biopsie, compte rendu anatomopathologique, imagerie, bilans sanguins) et, si vous le souhaitez, d'être accompagné(e) d'un proche.\n{medecin}",
  suivi: "Bonjour {prenom}, nous vous rappelons votre consultation de suivi le {jour} {heure} à {lieu}.\nMerci d'apporter vos derniers examens (bilan sanguin, imagerie) et vos ordonnances en cours.\n{medecin}",
  controle: "Bonjour {prenom}, nous vous rappelons votre consultation de contrôle le {jour} {heure} à {lieu}.\nMerci d'apporter les résultats des examens demandés lors de la dernière consultation.\n{medecin}",
  rtc: "Bonjour {prenom}, nous vous rappelons votre consultation de surveillance pendant la radiothérapie le {jour} {heure} à {lieu}.\nSignalez-nous toute gêne (peau, déglutition, fatigue…).\n{medecin}",
  hospit: "Bonjour {prenom}, nous vous rappelons votre hospitalisation à partir du {jour} à {lieu}.\nMerci d'apporter votre carte d'identité, votre prise en charge (mutuelle), vos examens et vos traitements habituels.\n{medecin}",
  rt: "Bonjour {prenom}, nous vous rappelons votre rendez-vous de radiothérapie le {jour} {heure} à {lieu}.\nMerci d'apporter vos examens et votre prise en charge.\n{medecin}",
  autre: "Bonjour {prenom}, nous vous rappelons votre rendez-vous le {jour} {heure} à {lieu}.\n{medecin}",
};
export const CAT_WA = () => {
  const l = [["chimio", "💉 Séance de chimiothérapie"], ["annonce", "🩺 Consultation d'annonce"], ["suivi", "🩺 Consultation de suivi"], ["controle", "🩺 Consultation de contrôle"], ["rtc", "☢️ Consultation en cours de radiothérapie"], ["hospit", "Hospitalisation"], ["rt", "☢️ Radiothérapie (scanner de centrage, 1re séance)"]];
  const vus = {}, ajout = (t, lib) => { if (["annonce", "suivi", "controle", "cchimio", "seance", "hospit", "rt"].indexOf(t) >= 0 || vus[t]) return; vus[t] = 1; l.push([t, "🩺 " + lib]); };
  const T = D().tarifs; if (T && T.etablissements) Object.values(T.etablissements).forEach((e) => (e.activites || []).forEach((a) => ajout(a.type, a.libelle)));
  else if (D().activites) Object.values(D().activites).forEach((e) => e.forEach((a) => ajout(a.t, a.lib)));
  l.push(["autre", "Autre rendez-vous (message par défaut)"]); return l;
};
const copie = (o) => JSON.parse(JSON.stringify(o));
let ED = null, ONG = "horaires", MOD = false, HET = ""; // HET : établissement dont on règle les horaires ("" = par défaut)

export function pageConfiguration() {
  if (!ED || !MOD) ED = { horaires: copie(horaires()), horairesEtab: copie(D().cal.horairesEtab || {}), abs: copie(D().cal.abs || []), feries: copie(D().cal.feries || []), wa: Object.assign({}, D().wa || {}) };
  const ok = A.peut("parametres"), esc = A.esc, dis = ok ? "" : " disabled";
  let h = '<section class="accueil"><div><h2>Configuration</h2><p>Horaires de consultation par établissement, absences, jours fériés et messages WhatsApp.</p></div></section>' +
    '<div class="ag-vues" style="align-self:flex-start"><button class="' + (ONG === "horaires" ? "on" : "") + '" onclick="cfOnglet(\'horaires\')">' + A.ic("horloge") + 'Créneaux & horaires</button><button class="' + (ONG === "fermetures" ? "on" : "") + '" onclick="cfOnglet(\'fermetures\')">' + A.ic("avion") + "Fermetures, congés & jours fériés</button><button class=\"" + (ONG === "whatsapp" ? "on" : "") + "\" onclick=\"cfOnglet('whatsapp')\">" + A.ic("whatsapp") + "WhatsApp</button></div>";
  if (!ok) h += '<p class="mesures">Lecture seule : la modification demande le droit « paramètres ».</p>';
  if (ONG === "horaires") {
    const etabs = (D().etabsTous || D().etabs).map((e) => e.code), propre = HET && ED.horairesEtab[HET], H = HET ? ED.horairesEtab[HET] || ED.horaires : ED.horaires;
    h += '<section class="carte"><h3><span class="ic">' + A.ic("horloge") + '</span>Créneaux & horaires</h3><p class="sous">Les heures en dehors des plages sont grisées dans l\'agenda. La prise de rendez-vous y reste possible (urgence, rendez-vous exceptionnel), après confirmation.</p>' +
      '<div class="puces"><span class="tl">Horaires de</span><button class="puce' + (HET ? "" : " on") + '" onclick="cfEtab(\'\')">Par défaut (tous)</button>' + etabs.map((c) => '<button class="puce' + (HET === c ? " on" : "") + '" onclick="cfEtab(\'' + esc(c) + "')\">" + esc(c) + (ED.horairesEtab[c] ? " •" : "") + "</button>").join("") + "</div>" +
      (HET ? '<label class="chk" style="margin:6px 0 10px"><input type="checkbox"' + (propre ? " checked" : "") + dis + ' onchange="cfPropre(this.checked)"> Horaires propres à ' + esc(HET) + "</label>" +
        (propre ? '<p class="mesures">Ces plages s\'appliquent aux rendez-vous des patients de ' + esc(HET) + ' et à l\'agenda filtré sur ' + esc(HET) + " (par exemple pour la secrétaire de cet établissement).</p>" : '<p class="mesures">' + esc(HET) + " utilise les horaires par défaut ci-dessous. Cochez la case pour lui donner ses propres plages.</p>") : '<p class="mesures">Horaires utilisés par tous les établissements qui n\'ont pas leurs propres plages (marqués • quand c\'est le cas).</p>');
    const disH = HET && !propre ? " disabled" : dis, okH = ok && (!HET || propre);
    h += '' +
      '<div class="form" style="grid-template-columns:minmax(0,260px)"><div><label for="cfDur">Durée d\'un rendez-vous (minutes)</label><select id="cfDur"' + disH + ' onchange="cfDuree(this.value)">' + [10, 15, 20, 30, 45, 60].map((m) => "<option" + (m === H.duree ? " selected" : "") + ">" + m + "</option>").join("") + "</select></div></div>" +
      '<div class="tableau" style="margin-top:12px"><table class="tcures cfh"><tr><th>Jour</th><th>Plages horaires</th></tr>' +
      JOURS.map(([j, nom]) => {
        const pl = H.jours[j] || [], ouvert = pl.length > 0;
        return '<tr><td><label style="display:flex;gap:8px;align-items:center;font-weight:bold"><input type="checkbox" style="width:auto"' + (ouvert ? " checked" : "") + disH + ' onchange="cfJour(' + j + ',this.checked)">' + nom + "</label></td><td>" +
          (ouvert ? '<div class="plages">' + pl.map((p, k) => '<span class="plage"><input type="time" step="900" value="' + p[0] + '"' + disH + ' onchange="cfPlage(' + j + "," + k + ',0,this.value)"> – <input type="time" step="900" value="' + p[1] + '"' + disH + ' onchange="cfPlage(' + j + "," + k + ',1,this.value)">' + (okH ? '<button class="mini rouge" onclick="cfSupPlage(' + j + "," + k + ')">✕</button>' : "") + "</span>").join("") + (okH ? '<button class="mini" onclick="cfAjPlage(' + j + ')">+ Ajouter une plage</button>' : "") + "</div>" : '<span class="mesures">Fermé</span>') + "</td></tr>";
      }).join("") + "</table></div></section>";
  } else if (ONG === "whatsapp") {
    const ex = { prenom: "Fatima", nom: "ALAOUI Fatima", jour: "mardi 14 octobre", heure: "à 10h00", lieu: "Hôpital Cheikh Khalifa", adresse: "", medecin: "Dr BENTAHILA" };
    h += '<section class="carte"><h3><span class="ic">' + A.ic("whatsapp") + '</span>Rappels WhatsApp</h3><p class="sous">Un bouton WhatsApp apparaît à côté de chaque rendez-vous (tableau de bord, 7 prochains jours, et dossier patient). Il ouvre WhatsApp avec le message ci-dessous déjà rempli : il ne reste qu\'à appuyer sur Envoyer. Le bouton est vert quand le rendez-vous est dans 24 à 48 h.</p>' +
      '<p class="mesures">Variables remplacées automatiquement : <b>{prenom}</b> · <b>{nom}</b> (nom complet) · <b>{jour}</b> (mardi 14 octobre) · <b>{heure}</b> (« à 10h00 », vide si pas d\'heure) · <b>{lieu}</b> (établissement) · <b>{adresse}</b> · <b>{medecin}</b>.</p></section>';
    CAT_WA().forEach(([k, lib]) => {
      const v = ED.wa[k] != null ? ED.wa[k] : WA0[k] || WA0.autre, perso = ED.wa[k] != null && ED.wa[k] !== (WA0[k] || WA0.autre);
      h += '<section class="carte"><div class="entete"><h3 style="margin:0">' + (k === "autre" ? A.ic("agenda") : k === "hospit" ? A.ic("hopital") : "") + esc(lib) + (perso ? ' <span class="badge b-or">personnalisé</span>' : "") + "</h3>" + (ok && perso ? '<button class="mini" onclick="cfWaDef(\'' + k + "')\">↺ Message par défaut</button>" : "") + "</div>" +
        '<textarea class="notes" rows="5"' + dis + ' oninput="cfWa(\'' + k + "',this.value)\">" + esc(v) + '</textarea><div class="wa-ex" id="waEx_' + k + '">' + esc(remplir(v, ex)) + "</div></section>";
    });
  } else {
    const abs = ED.abs.map((a, i) => ({ a, i })).sort((p, q) => String(p.a.du).localeCompare(String(q.a.du)));
    h += '<section class="carte"><h3><span class="ic">' + A.ic("avion") + '</span>Absences (congrès, voyage, congés…)</h3><p class="sous">Les rendez-vous, cures et séances prévus pendant une absence sont signalés au tableau de bord pour être décalés, et la journée est grisée dans l\'agenda.</p>' +
      (abs.length ? '<div class="tableau"><table class="tcures"><tr><th>Du</th><th>Au</th><th>Motif</th><th>Type</th><th></th></tr>' + abs.map(({ a, i }) => "<tr><td>" + '<input type="date" value="' + esc(a.du || "") + '"' + dis + ' onchange="cfAbs(' + i + ',\'du\',this.value)"></td><td><input type="date" value="' + esc(a.au || "") + '"' + dis + ' onchange="cfAbs(' + i + ',\'au\',this.value)"></td><td><input value="' + esc(a.m || "") + '" placeholder="Congrès, voyage…"' + dis + ' onchange="cfAbs(' + i + ',\'m\',this.value)"></td>' +
        '<td><select' + dis + ' onchange="cfAbs(' + i + ',\'t\',this.value)"><option value=""></option>' + TYPES.map((t) => "<option" + (a.t === t ? " selected" : "") + ">" + t + "</option>").join("") + "</select></td><td>" + (ok ? '<button class="mini rouge" onclick="cfSupAbs(' + i + ')">✕</button>' : "") + "</td></tr>").join("") + "</table></div>" : '<p class="mesures">Aucune absence enregistrée.</p>') +
      (ok ? '<button class="bt clair petit" style="margin-top:10px" onclick="cfAjAbs()">' + A.ic("plus") + "Ajouter une absence</button>" : "") + "</section>";
    const fs = ED.feries.map((f, i) => ({ f, i })).sort((p, q) => String(p.f.d).localeCompare(String(q.f.d)));
    h += '<section class="carte"><h3><span class="ic">' + A.ic("drapeau") + '</span>Jours fériés (exclus du calcul des dates de radiothérapie)</h3><p class="sous">Les fêtes religieuses dépendent de l\'observation du croissant : ajustez la date dès l\'annonce officielle du ministère des Habous. ' + fs.length + " jours enregistrés.</p>" +
      '<div class="tableau" style="max-height:460px;overflow:auto"><table class="tcures"><tr><th style="width:190px">Date</th><th>Fête</th><th></th></tr>' + fs.map(({ f, i }) => '<tr><td><input type="date" value="' + esc(f.d) + '"' + dis + ' onchange="cfFer(' + i + ',\'d\',this.value)"></td><td><input value="' + esc(f.nom || "") + '"' + dis + ' onchange="cfFer(' + i + ',\'nom\',this.value)" style="width:100%"></td><td>' + (ok ? '<button class="mini rouge" onclick="cfSupFer(' + i + ')">✕</button>' : "") + "</td></tr>").join("") + "</table></div>" +
      (ok ? '<button class="bt clair petit" style="margin-top:10px" onclick="cfAjFer()">' + A.ic("plus") + "Ajouter un jour férié</button>" : "") + "</section>";
  }
  if (ok) h += '<div class="barre-enr"><button class="bt gris" onclick="cfDefaut()">↺ Rétablir les valeurs par défaut</button><span id="cfMod" class="mesures' + (MOD ? "" : " cache") + '">Modifications non enregistrées</span><button class="bt plein" id="cfOk" onclick="cfEnregistrer()"><svg class="pi"><use href="#i-enregistrer"/></svg>Enregistrer</button></div>';
  A.$("page").innerHTML = h;
}
export const remplir = (m, v) => String(m || "").replace(/\{(\w+)\}/g, (t, k) => (v[k] != null ? v[k] : t)).replace(/[ \t]+([.,])/g, "$1").replace(/ {2,}/g, " ");
const modif = (redessiner) => { MOD = true; if (redessiner) pageConfiguration(); else { const m = A.$("cfMod"); if (m) m.classList.remove("cache"); } };
window.cfOnglet = (o) => { ONG = o; pageConfiguration(); };
const HC = () => (HET ? ED.horairesEtab[HET] : ED.horaires);
window.cfEtab = (c) => { HET = c; pageConfiguration(); };
window.cfPropre = (on) => { if (on) ED.horairesEtab[HET] = copie(ED.horaires); else delete ED.horairesEtab[HET]; modif(true); };
window.cfDuree = (v) => { HC().duree = parseInt(v, 10) || 30; modif(); };
window.cfJour = (j, on) => { HC().jours[j] = on ? [["08:30", "18:00"]] : []; modif(true); };
window.cfPlage = (j, k, b, v) => { HC().jours[j][k][b] = v; modif(); };
window.cfAjPlage = (j) => { const l = HC().jours[j], der = l[l.length - 1]; l.push([der ? der[1] : "14:00", "18:00"]); modif(true); };
window.cfSupPlage = (j, k) => { HC().jours[j].splice(k, 1); modif(true); };
window.cfWa = (k, v) => { ED.wa[k] = v; const e = A.$("waEx_" + k); if (e) e.textContent = remplir(v, { prenom: "Fatima", nom: "ALAOUI Fatima", jour: "mardi 14 octobre", heure: "à 10h00", lieu: "Hôpital Cheikh Khalifa", adresse: "", medecin: "Dr BENTAHILA" }); modif(); };
window.cfWaDef = (k) => { delete ED.wa[k]; modif(true); };
window.cfAbs = (i, f, v) => { if (v) ED.abs[i][f] = v; else delete ED.abs[i][f]; modif(f === "du"); };
window.cfAjAbs = () => { const t = D().t; ED.abs.push({ du: t, au: t, m: "" }); modif(true); };
window.cfSupAbs = (i) => { ED.abs.splice(i, 1); modif(true); };
window.cfFer = (i, f, v) => { ED.feries[i][f] = v; modif(f === "d"); };
window.cfAjFer = () => { ED.feries.push({ d: D().t, nom: "Jour férié" }); modif(true); };
window.cfSupFer = (i) => { ED.feries.splice(i, 1); modif(true); };
window.cfDefaut = () => {
  if (ONG === "whatsapp") { if (!confirm("Rétablir tous les messages WhatsApp par défaut ?")) return; ED.wa = {}; modif(true); return; }
  if (!confirm("Rétablir les horaires (8 h 30 – 18 h, du lundi au vendredi, pour tous les établissements) et la liste des jours fériés par défaut ?\nLes absences ne sont pas modifiées.")) return;
  ED.horaires = HORAIRES0(); ED.horairesEtab = {}; ED.feries = copie(FERIES0); modif(true);
};
window.cfEnregistrer = async () => {
  // Contrôles : plages cohérentes, absences dans le bon ordre, dates renseignées
  for (const [qui, H] of [["", ED.horaires]].concat(Object.entries(ED.horairesEtab))) for (const [j, nom] of JOURS) {
    const pl = (H.jours[j] || []).slice().sort((a, b) => a[0].localeCompare(b[0])), t = (qui ? qui + " – " : "") + nom;
    for (let k = 0; k < pl.length; k++) {
      if (!pl[k][0] || !pl[k][1] || pl[k][1] <= pl[k][0]) { A.toast(t + " : l'heure de fin doit être après l'heure de début."); return; }
      if (k && pl[k][0] < pl[k - 1][1]) { A.toast(t + " : deux plages se chevauchent."); return; }
    }
    H.jours[j] = pl;
  }
  for (const a of ED.abs) { if (!a.du) { A.toast("Une absence n'a pas de date de début."); return; } if (!a.au || a.au < a.du) a.au = a.du; }
  if (ED.feries.some((f) => !f.d)) { A.toast("Un jour férié n'a pas de date."); return; }
  const cal = Object.assign({}, D().cal, { horaires: ED.horaires, horairesEtab: ED.horairesEtab, abs: ED.abs, feries: ED.feries.slice().sort((a, b) => a.d.localeCompare(b.d)) });
  const b = A.$("cfOk"); A.occupe(b, true);
  try {
    await setDoc(doc(db, "espaces", A.ESPACE, "parametres", "calendrier"), { data: JSON.stringify(cal) }, { merge: true });
    const wa = {}; Object.entries(ED.wa).forEach(([k, v]) => { if (v !== (WA0[k] || WA0.autre)) wa[k] = v; });
    if (JSON.stringify(wa) !== JSON.stringify(D().wa || {})) { await setDoc(doc(db, "espaces", A.ESPACE, "parametres", "whatsapp"), { data: JSON.stringify(wa) }); D().wa = wa; }
    D().cal = cal; D().ctx.feries = cal.feries;
    D().patients.forEach((x) => A.recalculer(x, x.doc)); // les dates de radiothérapie dépendent des jours fériés
    A.journal({ id: "", r: { nm: "" } }, "Configuration modifiée (horaires, absences, jours fériés, messages WhatsApp)");
    MOD = false; A.toast("Configuration enregistrée."); A.entete(); pageConfiguration();
  } catch (e) { A.occupe(b, false); A.toast(e && e.code === "permission-denied" ? "Vous n'avez pas le droit de modifier la configuration." : "Enregistrement impossible : " + ((e && e.message) || e)); }
};
