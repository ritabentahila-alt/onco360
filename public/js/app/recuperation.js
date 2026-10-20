// Onco360 – Paramètres › Cabinet › Export des données, suite (lot R-F, audit n° 8, 20/10/2026) : médecin titulaire seulement.
//   • « Export automatique de la semaine » (R-F4) : chaque dimanche, un export complet gardé dans Onco360 et déposé dans le Google Drive du
//     cabinet s'il est relié (autorisation « drive.file » : Onco360 ne voit que les fichiers qu'il y crée) ; fonction serveur exportAuto.
//   • « Récupérer des données » (R-F2, R-F7) : un dossier patient, un document du cabinet (liste, paramètre, protocole…) ou tout le cabinet,
//     tel qu'il était à une heure donnée (7 jours), dans un export ou dans un fichier d'export de l'ordinateur ; aperçu d'abord, puis
//     récupération (ce qui a été créé depuis est gardé, l'état d'avant est copié et peut être remis) ; fonction serveur recuperation.
//   • « En cas de problème » : la marche à suivre, pour quelqu'un qui n'est pas développeur (même texte que guide/en-cas-de-probleme.md).
import { app, GOOGLE_CLIENT_ID } from "../config.js";

let A = null;
export function installer(api) { A = api; }
const D = () => A.D();
const esc = (s) => A.esc(s);
// Appel d'une fonction serveur avec un long délai (un export peut prendre plusieurs minutes)
export async function appelLong(nom, donnees) {
  const { getFunctions, httpsCallable } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-functions.js");
  try { return (await httpsCallable(getFunctions(app, "europe-west1"), nom, { timeout: 1800000 })(donnees || {})).data; }
  catch (e) { throw new Error(String((e && e.message) || e).replace(/^(FirebaseError: )?/, "")); }
}
const quand = (iso) => (iso ? new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).replace(" ", " à ") : "");
const taille = (n) => (n > 1e9 ? (n / 1e9).toFixed(1) + " Go" : n > 1e6 ? Math.round(n / 1e6) + " Mo" : Math.max(1, Math.round((n || 0) / 1e3)) + " Ko");
const local = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
const msg = (id, t, err) => { const z = A.$(id); if (z) { z.innerHTML = t; z.style.color = err ? "var(--rouge)" : ""; } };

// ───── Mise en page ─────
export function htmlRecuperation() {
  return '<section class="carte" id="rcAuto"><h3><span class="ic">' + A.ic("horloge") + '</span>Export automatique de la semaine</h3><p class="sous">Lecture…</p></section>' +
    '<section class="carte" id="rcRecup"><h3><span class="ic">' + A.ic("actualiser") + "</span>Récupérer des données</h3>" +
    '<p class="sous">Un dossier effacé ou abîmé, une liste ou un paramètre modifié par erreur : remettez-le tel qu\'il était. <b>Rien ne disparaît</b> : ce qui a été ' +
    "créé depuis (consultation, ordonnance, tâche…) est gardé, l'état actuel est d'abord copié et la récupération peut être annulée. Vous voyez ce qui serait remis avant de confirmer.</p>" +
    '<div id="rcCorps"><p class="mesures">Lecture des copies disponibles…</p></div></section>' +
    '<section class="carte"><details id="rcAide"><summary><b>En cas de problème : que faire ?</b> (à lire avant de réparer quoi que ce soit)</summary>' + AIDE + "</details></section>";
}
const AIDE = '<ol class="rc-aide">' +
  "<li><b>Notez l'heure exacte</b> où l'erreur a eu lieu (ou la dernière fois où tout était juste), et ce qui manque (quel patient, quelle liste).</li>" +
  "<li><b>Ne réparez rien à la main</b> (ne ressaisissez pas le dossier) : la récupération remet tout, ressaisir crée des doublons.</li>" +
  "<li><b>Moins de 7 jours</b> : « Récupérer des données » ci-dessus › « La base à une heure donnée » › une heure <b>juste avant</b> l'erreur.</li>" +
  "<li><b>Plus de 7 jours</b> : choisissez un export (celui de la semaine, ou un export complet fait avant l'erreur). Un export plus ancien gardé sur l'ordinateur ou dans le Google Drive : « Un fichier d'export de cet ordinateur ».</li>" +
  "<li><b>Un seul dossier, une seule liste</b> : « Un dossier patient » ou « Un document du cabinet ». <b>Beaucoup de dossiers abîmés</b> (mauvaise manipulation, import raté) : « Tout le cabinet », depuis une heure juste avant le problème.</li>" +
  "<li>Regardez l'aperçu, puis « Récupérer ». Vérifiez le dossier. Si le résultat ne convient pas : source « Copie faite avant la récupération » (même choix), puis « Récupérer » : l'état d'avant revient.</li>" +
  "<li><b>Un document déposé (PDF) effacé</b> : il revient avec le dossier (copie de secours des fichiers, 30 jours).</li>" +
  "<li><b>Onco360 ne s'ouvre plus</b>, un compte perdu, tout le cabinet effacé : appelez l'administration d'Onco360 (elle peut récupérer depuis la sauvegarde de toute la base, 14 semaines). Donnez-lui l'heure notée et le <b>numéro de dossier</b> (pas besoin du nom).</li>" +
  "</ol>";

export async function afficherRecuperation() {
  if (!A.$("rcAuto")) return;
  await Promise.all([dessinerAuto(), dessinerSources()]);
}

// ───── Export automatique de la semaine (R-F4) ─────
let AUTO = null;
async function dessinerAuto() {
  const z = A.$("rcAuto"); if (!z) return;
  try { AUTO = await appelLong("exportAuto", { espace: A.ESPACE, action: "etat" }); } catch (e) { z.innerHTML = z.innerHTML.replace(/<p class="sous">Lecture…<\/p>/, "") + '<p class="sous" style="color:var(--rouge)">Lecture impossible : ' + esc(e.message) + "</p>"; return; }
  const a = AUTO, d = a.dernier, dr = a.drive;
  let h = '<h3><span class="ic">' + A.ic("horloge") + "</span>Export automatique de la semaine</h3>" +
    '<p class="sous">Chaque dimanche vers 1 h 30, Onco360 fait un export complet du cabinet (comme le bouton ci-dessus). Il est gardé dans Onco360 (le dernier, à télécharger ; les données des 14 dernières semaines pour « Récupérer ») et, si vous le reliez, <b>déposé dans votre Google Drive</b>, hors d\'Onco360 : vos données restent chez vous même si Onco360 disparaît.</p>';
  h += !a.actif ? '<div class="per" style="color:var(--orange);background:var(--orange-c)">' + A.ic("alerte") + "Arrêté : aucun export automatique</div>"
    : !d ? '<div class="per" style="color:var(--orange);background:var(--orange-c)">' + A.ic("horloge") + "Activé : premier export dimanche prochain</div>"
    : d.ok ? '<div class="per" style="color:var(--vert);background:var(--vert-c)">' + A.ic("check") + "Dernier export : " + esc(quand(d.le)) + " · " + d.patients + " dossier(s) · " + esc(taille(d.taille)) +
      (d.drive ? (d.drive.ok ? " · déposé dans le Drive" : "") : "") + "</div>" + (d.drive && !d.drive.ok ? '<div class="per">' + A.ic("alerte") + "Google Drive : " + esc(d.drive.erreur) + "</div>" : "")
    : '<div class="per">' + A.ic("alerte") + "Dernier export en échec (" + esc(quand(d.le)) + ") : " + esc(d.erreur || "?") + "</div>";
  h += '<div class="form rc-form"><div><label for="rcActif">Export de la semaine</label><select id="rcActif" onchange="rcRegler()"><option value="1"' + (a.actif ? " selected" : "") + '>Activé</option><option value="0"' + (a.actif ? "" : " selected") + ">Arrêté</option></select></div>" +
    '<div><label for="rcGarder">Gardés dans le Google Drive</label><select id="rcGarder" onchange="rcRegler()">' + [4, 8, 12, 26, 52].map((n) => '<option value="' + n + '"' + (a.garder === n ? " selected" : "") + ">" + n + " dernières semaines</option>").join("") + "</select></div></div>";
  h += '<h4 class="soustitre">Où le ranger</h4>' + (dr ? '<p>Google Drive de <b>' + esc(dr.email) + "</b>, dossier « Onco360 – exports du cabinet » (les plus anciens au-delà du nombre choisi sont retirés).</p>"
    : '<p class="mesures">Pas encore de Google Drive relié : l\'export reste dans Onco360. Reliez le Google Drive du cabinet (le vôtre ou celui choisi pour le cabinet) ; d\'autres supports (OneDrive, Dropbox, disque) : demandez-les à l\'administration d\'Onco360.</p>');
  h += '<div class="actr" style="justify-content:flex-start;margin:8px 0 0;flex-wrap:wrap;gap:8px">' +
    (dr ? '<button class="bt clair" id="rcDelier" onclick="rcDelierDrive()">Ne plus déposer dans ce Drive</button>' : '<button class="bt plein" id="rcLier" onclick="rcLierDrive()">' + A.ic("telecharger") + "Relier mon Google Drive</button>") +
    '<button class="bt clair" id="rcMaint" onclick="rcMaintenant()">Faire l\'export maintenant</button>' +
    (d && d.ok && d.chemin ? '<button class="bt clair" id="rcTel" onclick="rcTelecharger()">' + A.ic("telecharger") + "Télécharger le dernier</button>" : "") + "</div>" +
    '<p class="sous" id="rcAutoMsg" style="margin-top:8px"></p>';
  if (a.historique && a.historique.length > 1) h += '<details><summary class="mesures">Derniers exports (' + a.historique.length + ")</summary><ul class=\"mesures\">" + a.historique.map((x) => "<li>" + esc(quand(x.le)) + " : " + (x.ok ? x.patients + " dossier(s), " + esc(taille(x.taille)) + (x.drive ? (x.drive.ok ? ", Drive : déposé" : ", Drive : " + esc(x.drive.erreur)) : "") : "échec (" + esc(x.erreur || "?") + ")") + "</li>").join("") + "</ul></details>";
  z.innerHTML = h;
}
window.rcRegler = async () => {
  try { AUTO = await appelLong("exportAuto", { espace: A.ESPACE, action: "regler", actif: A.$("rcActif").value === "1", garder: +A.$("rcGarder").value }); A.toast("Export de la semaine : réglage enregistré."); }
  catch (e) { A.toast("Réglage impossible : " + e.message); }
  dessinerAuto();
};
window.rcMaintenant = async () => {
  const b = A.$("rcMaint"); A.occupe(b, true); msg("rcAutoMsg", "Export en cours (une à plusieurs minutes ; vous pouvez continuer à travailler dans un autre onglet)…");
  try { AUTO = await appelLong("exportAuto", { espace: A.ESPACE, action: "maintenant" }); A.toast("Export de la semaine fait."); } catch (e) { A.toast("Export impossible : " + e.message); }
  dessinerAuto();
};
window.rcTelecharger = async () => {
  const b = A.$("rcTel"); A.occupe(b, true);
  try { await telecharger(AUTO.dernier.chemin); } catch (e) { A.toast("Téléchargement impossible : " + e.message); }
  A.occupe(b, false);
};
export async function telecharger(chemin) {
  const { getStorage, ref, getBlob } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js");
  const blob = await getBlob(ref(getStorage(app), chemin)), u = URL.createObjectURL(blob), a = document.createElement("a");
  a.href = u; a.download = chemin.split("/").pop(); document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 60000);
  return blob.size;
}
let GIS = null;
const chargerGIS = () => GIS || (GIS = new Promise((ok, ko) => { if (window.google && google.accounts && google.accounts.oauth2) { ok(); return; } const s = document.createElement("script"); s.src = "https://accounts.google.com/gsi/client"; s.async = true; s.onload = () => ok(); s.onerror = () => { GIS = null; ko(new Error("Google injoignable")); }; document.head.appendChild(s); }));
window.rcLierDrive = async () => {
  if (!GOOGLE_CLIENT_ID) { A.toast("La liaison Google n'est pas configurée sur ce site."); return; }
  try { await chargerGIS(); } catch (e) { A.toast("Google est injoignable. Vérifiez la connexion Internet."); return; }
  const b = A.$("rcLier");
  google.accounts.oauth2.initCodeClient({
    client_id: GOOGLE_CLIENT_ID, scope: "openid email https://www.googleapis.com/auth/drive.file", ux_mode: "popup", select_account: true, login_hint: (D().u || {}).email,
    callback: async (r) => {
      if (!r || r.error || !r.code) { A.toast("Liaison annulée."); return; }
      A.occupe(b, true);
      try { AUTO = await appelLong("exportAuto", { espace: A.ESPACE, action: "lierDrive", code: r.code }); A.toast("Google Drive relié : l'export de chaque semaine y sera déposé."); } catch (e) { A.toast(e.message); }
      dessinerAuto();
    },
    error_callback: (e) => A.toast(e && e.type === "popup_closed" ? "Fenêtre Google fermée : liaison annulée." : e && e.type === "popup_failed_to_open" ? "Autorisez les fenêtres (pop-up) pour ce site, puis recommencez." : "Liaison impossible."),
  }).requestCode();
};
window.rcDelierDrive = async () => {
  if (!confirm("Ne plus déposer l'export de la semaine dans ce Google Drive ?\n\nLes exports déjà déposés y restent.")) return;
  try { AUTO = await appelLong("exportAuto", { espace: A.ESPACE, action: "delierDrive" }); } catch (e) { A.toast(e.message); }
  dessinerAuto();
};

// ───── Récupérer des données (R-F2, R-F7) ─────
// État de l'assistant : source choisie, liste lue, ce qu'on récupère, aperçu
const R = { sources: null, src: "instant", le: "", chemin: "", fichier: null, liste: null, quoi: "patient", pid: "", doc: "", q: "", apercu: null, res: null, err: "" };
const SORTES = { manuel: "Export complet", auto: "Export de la semaine", copie: "Copie faite avant la récupération" };
async function dessinerSources() {
  try { R.sources = await appelLong("recuperation", { espace: A.ESPACE, action: "sources" }); } catch (e) { R.sources = { exports: [], instant: null }; R.err = e.message; }
  if (!R.le) R.le = local(new Date(Date.now() - 60 * 60000));
  dessinerRecup();
}
function sourceChoisie() {
  if (R.src === "instant") return { type: "instant", le: new Date(R.le).toISOString() };
  if (R.src === "fichier") return R.fichier ? { type: "fichier", nom: R.fichier.nom } : null;
  const x = (R.sources.exports || []).find((e) => e.chemin === R.chemin); return x ? { type: "stockage", chemin: x.chemin, le: x.le } : null;
}
function dessinerRecup() {
  const z = A.$("rcCorps"); if (!z) return;
  const S = R.sources || { exports: [] }, ex = S.exports || [], radio = (k, t) => '<label class="rc-r"><input type="radio" name="rcSrc" value="' + k + '"' + (R.src === k ? " checked" : "") + ' onchange="rcSrc(this.value)"> ' + t + "</label>";
  let h = R.err ? '<p class="sous" style="color:var(--rouge)">' + esc(R.err) + "</p>" : "";
  h += '<h4 class="soustitre">1. D\'où récupérer ?</h4><div class="rc-src">' +
    radio("instant", "La base telle qu'elle était à une heure donnée <span class=\"mesures\">(moins de 7 jours, à la minute près)</span>") +
    (R.src === "instant" ? '<div class="rc-sous"><input type="datetime-local" id="rcLe" value="' + esc(R.le) + '" min="' + esc(S.instant ? local(new Date(S.instant.de)) : "") + '" max="' + esc(local(new Date(Date.now() - 60000))) + '" onchange="rcLe(this.value)" aria-label="Date et heure"> <span class="mesures">Choisissez une heure <b>juste avant</b> l\'erreur.</span></div>' : "") +
    radio("export", "Un export gardé dans Onco360 <span class=\"mesures\">(" + ex.length + " disponible" + (ex.length > 1 ? "s" : "") + ")</span>") +
    (R.src === "export" ? '<div class="rc-sous">' + (ex.length ? '<select id="rcEx" onchange="rcEx(this.value)" aria-label="Export"><option value="">Choisir…</option>' + ex.map((x) => '<option value="' + esc(x.chemin) + '"' + (R.chemin === x.chemin ? " selected" : "") + ">" + esc(SORTES[x.sorte] || x.sorte) + " du " + esc(quand(x.le)) + (x.note ? " (" + esc(x.note.replace(/^avant la récupération : /, "")) + ")" : "") + "</option>").join("") + "</select>" : '<span class="mesures">Aucun export pour l\'instant (export de la semaine : dimanche ; ou « Exporter tout le cabinet »).</span>') + "</div>" : "") +
    radio("fichier", "Un fichier d'export de cet ordinateur <span class=\"mesures\">(ZIP téléchargé, ou pris dans le Google Drive)</span>") +
    (R.src === "fichier" ? '<div class="rc-sous"><input type="file" id="rcFic" accept=".zip,application/zip" onchange="rcFichier(this)" aria-label="Fichier d\'export">' + (R.fichier ? ' <span class="mesures">' + esc(R.fichier.nom) + " : " + Object.keys(R.fichier.J.collections.patients || {}).length + " dossier(s)</span>" : "") + "</div>" : "") + "</div>";
  const src = sourceChoisie();
  h += '<div class="actr" style="justify-content:flex-start;margin:8px 0"><button class="bt clair" id="rcLire" onclick="rcLire()"' + (src ? "" : " disabled") + ">Lire cette source</button></div>";
  if (R.liste) {
    const L = R.liste, mots = A.sansAcc(R.q || "").split(/\s+/).filter(Boolean);
    const pats = L.patients.filter((p) => mots.every((w) => A.sansAcc([p.nom, p.numero, p.ddn].join(" ")).indexOf(w) >= 0));
    h += '<h4 class="soustitre">2. Quoi ?</h4><div class="puces rc-quoi">' + [["patient", "Un dossier patient"], ["doc", "Un document du cabinet"], ["cabinet", "Tout le cabinet"]].map(([k, t]) => '<button class="puce' + (R.quoi === k ? " on" : "") + '" aria-pressed="' + (R.quoi === k) + '" onclick="rcQuoi(\'' + k + "')\">" + t + "</button>").join("") + "</div>";
    if (R.quoi === "patient") h += '<div class="rc-sous"><input id="rcQ" type="search" placeholder="Nom, n° de dossier…" value="' + esc(R.q) + '" oninput="rcQ(this.value)" aria-label="Rechercher un patient"></div>' +
      '<div class="rc-pats" id="rcPats">' + (pats.length ? pats.slice(0, 60).map((p) => '<label class="rc-r"><input type="radio" name="rcPid" value="' + esc(p.id) + '"' + (R.pid === p.id ? " checked" : "") + ' onchange="rcPid(this.value)"> ' + esc(p.nom || "—") + ' <span class="mesures">' + esc(p.numero ? "n° " + p.numero : "") + (p.ddn ? " · né(e) le " + esc(A.dfrA(p.ddn)) : "") + "</span>" + (p.existe ? "" : ' <span class="rc-eff">effacé</span>') + "</label>").join("") + (pats.length > 60 ? '<p class="mesures">… ' + (pats.length - 60) + " autre(s) : précisez la recherche.</p>" : "") : '<p class="mesures">Aucun dossier ne correspond dans cette source.</p>') + "</div>";
    if (R.quoi === "doc") h += '<div class="rc-sous"><select id="rcDoc" onchange="rcDoc(this.value)" aria-label="Document"><option value="">Choisir…</option>' + L.documents.map((d) => '<option value="' + esc(d.col + "/" + d.id) + '"' + (R.doc === d.col + "/" + d.id ? " selected" : "") + ">" + esc(d.lib) + "</option>").join("") + "</select></div>";
    if (R.quoi === "cabinet") h += '<div class="per">' + A.ic("alerte") + "Tout le cabinet revient comme dans la source : chaque dossier modifié depuis reprend sa valeur d'alors (à réserver à une erreur qui a abîmé beaucoup de dossiers). Ce qui a été créé depuis est gardé ; l'équipe et ses droits ne changent pas.</div>";
    const pret = (R.quoi === "patient" && R.pid) || (R.quoi === "doc" && R.doc) || R.quoi === "cabinet";
    h += '<div class="actr" style="justify-content:flex-start;margin:8px 0"><button class="bt clair" id="rcVoir" onclick="rcVoir()"' + (pret ? "" : " disabled") + ">3. Voir ce qui serait remis</button></div>";
  }
  if (R.apercu) {
    const P = R.apercu, lignes = Object.values(P.parCol || {}).filter((c) => c.remettre || c.crees || c.gardes || c.identiques);
    h += '<h4 class="soustitre">Aperçu : ' + esc(P.cible) + "</h4><p class=\"mesures\">Depuis " + esc(P.source) + ".</p>" +
      (P.absent ? '<p class="per">' + A.ic("alerte") + "Rien de ce dossier dans cette source : choisissez une heure ou un export plus ancien.</p>"
        : '<div class="tableau"><table class="tcures"><thead><tr><th>Partie</th><th>Effacé depuis : remis</th><th>Modifié depuis : remis comme avant</th><th>Créé depuis : gardé</th><th>Inchangé</th></tr></thead><tbody>' +
          lignes.map((c) => "<tr><td>" + esc(c.lib) + "</td><td>" + (c.effaces || "") + "</td><td>" + (c.modifies || "") + "</td><td>" + (c.crees || "") + (c.gardes ? (c.crees ? " + " : "") + c.gardes + " reçu(s) gardé(s)" : "") + "</td><td>" + (c.identiques || "") + "</td></tr>").join("") + "</tbody></table></div>") +
      (P.n ? '<div class="actr" style="justify-content:flex-start;margin:10px 0"><button class="bt plein" id="rcOk" onclick="rcAppliquer()">' + A.ic("check") + "Récupérer (" + P.n + " élément" + (P.n > 1 ? "s" : "") + ")</button></div>" : !P.absent ? '<p class="mesures">Rien à récupérer : tout est déjà comme dans cette source.</p>' : "");
  }
  if (R.res) h += '<div class="per" style="color:var(--vert);background:var(--vert-c)">' + A.ic("check") + esc(R.res) + "</div>" +
    (R.recharger ? '<button class="bt plein" onclick="location.reload()">' + A.ic("actualiser") + "Recharger Onco360 pour voir les dossiers remis</button>" : "");
  h += '<p class="sous" id="rcMsg"></p>';
  z.innerHTML = h;
}
const raz = (garderListe) => { if (!garderListe) { R.liste = null; R.pid = ""; R.doc = ""; R.q = ""; R.quoi = "patient"; } R.apercu = null; R.res = null; R.recharger = false; };
window.rcSrc = (k) => { R.src = k; raz(); dessinerRecup(); };
window.rcLe = (v) => { R.le = v; raz(); dessinerRecup(); };
window.rcEx = (v) => { R.chemin = v; raz(); dessinerRecup(); };
window.rcQuoi = (k) => { R.quoi = k; raz(true); dessinerRecup(); };
window.rcQ = (v) => { R.q = v; const p = A.$("rcQ"), pos = p ? p.selectionStart : 0; dessinerRecup(); const q = A.$("rcQ"); if (q) { q.focus(); q.setSelectionRange(pos, pos); } };
window.rcPid = (v) => { R.pid = v; raz(true); dessinerRecup(); };
window.rcDoc = (v) => { R.doc = v; raz(true); dessinerRecup(); };
// Fichier d'export de l'ordinateur : ouvert ici (le dossier choisi seul est envoyé au serveur, jamais le fichier entier)
const chargerZip = () => (window.JSZip ? Promise.resolve(window.JSZip) : new Promise((ok, ko) => { const s = document.createElement("script"); s.src = "vendor/jszip.min.js"; s.onload = () => ok(window.JSZip); s.onerror = () => ko(new Error("connexion ?")); document.head.appendChild(s); }));
window.rcFichier = async (inp) => {
  const f = inp.files && inp.files[0]; if (!f) return;
  raz(); msg("rcMsg", "Ouverture du fichier…");
  try {
    const Z = await chargerZip(), zip = await Z.loadAsync(f), d = zip.file("donnees/onco360.json");
    if (!d) throw new Error("ce fichier n'est pas un export complet d'Onco360");
    const J = JSON.parse(await d.async("string")); if (J.application !== "Onco360" || !J.collections) throw new Error("ce fichier n'est pas un export complet d'Onco360");
    if (J.espace && J.espace !== A.ESPACE && !confirm("Cet export vient d'un autre cabinet (" + J.espace + "). Continuer ?")) return;
    R.fichier = { nom: f.name, J }; msg("rcMsg", "");
  } catch (e) { R.fichier = null; msg("rcMsg", "Fichier illisible : " + esc(e.message), true); return; }
  dessinerRecup();
};
// Pièces du fichier pour ce qu'on récupère (même règle que le serveur, functions/restauration.js)
const DOCS_P = ["patients", "patientsFinances", "encaissements", "rappels"], REQ_P = ["consultations", "documentsRT", "fichiers", "rcp", "taches", "salle", "recus", "administrations"];
const COLS_DOC = ["bibliotheques", "parametres", "protocoles", "finances", "etablissements", "comptabilite", "signataires"];
function piecesFichier(quoi) {
  const C = R.fichier.J.collections, DT = R.fichier.J.dates || {}, r = {}, prendre = (c, id) => { r[c + "/" + id] = { data: C[c][id], dates: DT[c + "/" + id] || [] }; };
  if (quoi.patient) { DOCS_P.forEach((c) => { if (C[c] && C[c][quoi.patient]) prendre(c, quoi.patient); }); REQ_P.forEach((c) => Object.keys(C[c] || {}).forEach((id) => { if ((C[c][id] || {}).patientId === quoi.patient) prendre(c, id); })); }
  else if (quoi.doc) { if (C[quoi.doc[0]] && C[quoi.doc[0]][quoi.doc[1]]) prendre(quoi.doc[0], quoi.doc[1]); }
  else Object.keys(C).filter((c) => DOCS_P.concat(REQ_P, COLS_DOC).indexOf(c) >= 0).forEach((c) => Object.keys(C[c]).forEach((id) => prendre(c, id)));
  return r;
}
function listeFichier() {
  const C = R.fichier.J.collections, ici = new Set((D().patients || []).map((x) => x.id)), nom = (id) => String(id.nom || [String(id.nomF || "").toUpperCase(), id.prenom].filter(Boolean).join(" ")).trim();
  return { patients: Object.keys(C.patients || {}).map((id) => { const i = (C.patients[id] || {}).identite || {}; return { id, nom: nom(i), numero: i.numero || "", ddn: i.ddn || "", existe: ici.has(id) }; }).sort((a, b) => a.nom.localeCompare(b.nom, "fr")),
    documents: COLS_DOC.flatMap((c) => Object.keys(C[c] || {}).sort().map((id) => ({ col: c, id, lib: c + " › " + id }))) };
}
const quoiChoisi = () => (R.quoi === "patient" ? { patient: R.pid } : R.quoi === "doc" ? { doc: R.doc.split("/") } : { cabinet: true });
const appelRecup = (action, extra) => { const s = sourceChoisie(), q = action === "liste" ? null : quoiChoisi();
  if (s.type === "fichier" && q) s.pieces = piecesFichier(q);
  return appelLong("recuperation", Object.assign({ espace: A.ESPACE, action, source: s }, q ? { quoi: q } : {}, extra || {})); };
window.rcLire = async () => {
  const b = A.$("rcLire"); A.occupe(b, true); raz(); msg("rcMsg", "Lecture de la source…");
  try { R.liste = R.src === "fichier" ? listeFichier() : await appelRecup("liste"); msg("rcMsg", ""); } catch (e) { msg("rcMsg", "Lecture impossible : " + esc(e.message), true); A.occupe(b, false); return; }
  dessinerRecup(); const q = A.$("rcQ"); if (q) q.focus();
};
window.rcVoir = async () => {
  const b = A.$("rcVoir"); A.occupe(b, true); R.apercu = null; R.res = null; msg("rcMsg", "Comparaison avec aujourd'hui…");
  try { R.apercu = await appelRecup("apercu"); msg("rcMsg", ""); } catch (e) { msg("rcMsg", "Aperçu impossible : " + esc(e.message), true); A.occupe(b, false); return; }
  dessinerRecup(); const t = A.$("rcOk"); if (t) t.scrollIntoView({ block: "center", behavior: "smooth" });
};
window.rcAppliquer = async () => {
  const P = R.apercu; if (!P) return;
  if (!confirm("Récupérer " + P.cible + " depuis " + P.source + " ?\n\n" + P.n + " élément(s) remis ; ce qui a été créé depuis est gardé. L'état actuel est d'abord copié : vous pourrez revenir en arrière.")) return;
  const b = A.$("rcOk"); A.occupe(b, true); msg("rcMsg", "Récupération…");
  try {
    const r = await appelRecup("appliquer", { confirmer: true });
    R.res = "Fait : " + r.cible + " — " + r.n + " élément(s) remis" + (r.pdf && (r.pdf.remis || r.pdf.introuvables) ? " ; documents PDF remis : " + r.pdf.remis + (r.pdf.introuvables ? " (introuvables : " + r.pdf.introuvables + ")" : "") : "") +
      ". Pour revenir en arrière : source « Copie faite avant la récupération ».";
    R.apercu = null; R.recharger = true; msg("rcMsg", ""); await dessinerSources(); A.toast("Récupération faite.");
  } catch (e) { msg("rcMsg", "Récupération impossible : " + esc(e.message), true); A.occupe(b, false); }
};
