// Onco360 – export de la semaine rangé dans le Google Drive du cabinet (R-F4, audit n° 8, 20/10/2026).
// Le médecin titulaire relie une fois son Google Drive (Paramètres › Cabinet › Export des données ; autorisation « drive.file » : Onco360 ne
// voit dans ce Drive QUE les fichiers qu'il y a créés). Chaque semaine, le serveur y dépose le ZIP de l'export complet, dans un dossier
// « Onco360 – exports du cabinet », et retire les plus anciens au-delà du nombre gardé (réglé par le cabinet).
// Appels à l'API Google Drive v3 ; `f` = fetch (remplacé par un faux Google dans test-drive.js). Envoi « resumable » par morceaux :
// un ZIP de plusieurs Go passe sans être chargé en mémoire.
const API = "https://www.googleapis.com/drive/v3/files", ENVOI = "https://www.googleapis.com/upload/drive/v3/files";
const DOSSIER = "application/vnd.google-apps.folder";
const MORCEAU = 8 * 1024 * 1024; // multiple de 256 Kio (exigé par Google)

async function json(r, quoi) {
  const t = await r.text(); let j = {}; try { j = t ? JSON.parse(t) : {}; } catch (e) { j = {}; }
  if (!r.ok) { const e = new Error(quoi + " : Google Drive " + r.status + " " + ((j.error && j.error.message) || t.slice(0, 200))); e.status = r.status; throw e; }
  return j;
}
function creerApi(jeton, f) {
  const fe = f || fetch, h = (o) => Object.assign({ Authorization: "Bearer " + jeton }, o || {});
  return {
    // Dossier encore là (pas à la corbeille) ?
    async dossierExiste(id) {
      if (!id) return false;
      const r = await fe(API + "/" + encodeURIComponent(id) + "?fields=id,trashed", { headers: h() });
      if (r.status === 404) return false;
      const j = await json(r, "Lecture du dossier"); return !j.trashed;
    },
    async creerDossier(nom) { return json(await fe(API + "?fields=id,name", { method: "POST", headers: h({ "Content-Type": "application/json" }), body: JSON.stringify({ name: nom, mimeType: DOSSIER }) }), "Création du dossier"); },
    // Fichiers du dossier (créés par Onco360), les plus récents d'abord
    async lister(parent) {
      const q = encodeURIComponent("'" + parent + "' in parents and trashed = false");
      const j = await json(await fe(API + "?q=" + q + "&orderBy=createdTime desc&pageSize=200&fields=files(id,name,size,createdTime)", { headers: h() }), "Liste du dossier");
      return j.files || [];
    },
    async supprimer(id) { const r = await fe(API + "/" + encodeURIComponent(id), { method: "DELETE", headers: h() }); if (!r.ok && r.status !== 404) await json(r, "Suppression"); },
    // Envoi par morceaux : lire(debut, fin) → Buffer des octets [debut, fin] (fin comprise)
    async envoyer({ nom, parent, type, taille, lire }) {
      const r0 = await fe(ENVOI + "?uploadType=resumable&fields=id,name,size", { method: "POST",
        headers: h({ "Content-Type": "application/json; charset=UTF-8", "X-Upload-Content-Type": type || "application/zip", "X-Upload-Content-Length": String(taille) }),
        body: JSON.stringify({ name: nom, parents: parent ? [parent] : undefined }) });
      if (!r0.ok) await json(r0, "Début de l'envoi");
      const url = r0.headers.get("location"); if (!url) throw new Error("Début de l'envoi : Google Drive n'a pas donné d'adresse d'envoi.");
      for (let a = 0; a < taille; a += MORCEAU) {
        const b = Math.min(a + MORCEAU, taille) - 1, morceau = await lire(a, b);
        const r = await fe(url, { method: "PUT", headers: { "Content-Length": String(morceau.length), "Content-Range": "bytes " + a + "-" + b + "/" + taille }, body: morceau });
        if (r.status === 308) continue;
        if (b + 1 < taille) await json(r, "Envoi"); // réponse finale avant la fin : erreur
        else return json(r, "Fin de l'envoi");
      }
      if (!taille) return json(await fe(url, { method: "PUT", headers: { "Content-Length": "0", "Content-Range": "bytes */0" } }), "Envoi");
      throw new Error("Envoi : Google Drive n'a pas confirmé la fin de l'envoi.");
    },
  };
}
// Fichiers du dossier à retirer : au-delà des `garder` plus récents (exports d'Onco360 seulement, d'après leur nom)
const aRetirer = (fichiers, garder) => (fichiers || []).filter((x) => /^Onco360_export_/.test(x.name || "")).sort((a, b) => String(b.createdTime).localeCompare(String(a.createdTime))).slice(Math.max(1, garder == null || garder === "" ? 12 : Number(garder) || 1));

module.exports = { creerApi, aRetirer, MORCEAU, DOSSIER };
