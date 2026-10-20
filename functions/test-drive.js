// Export de la semaine dans Google Drive (R-F4, 20/10/2026) : node functions/test-drive.js (faux Google Drive, rien n'est envoyé)
const G = require("./drive.js");
let ok = 0, ko = 0; const cas = (n, v, d) => { if (v) { ok++; console.log("  ✅ " + n); } else { ko++; console.log("  ❌ " + n + " " + JSON.stringify(d)); } };

// Faux Google Drive : dossiers, fichiers, envoi « resumable » par morceaux (vérifie l'ordre et la taille des morceaux)
function fauxDrive() {
  const F = {}, envois = {}, appels = []; let n = 0;
  const rep = (status, corps, entetes) => ({ ok: status >= 200 && status < 300, status, headers: { get: (k) => (entetes || {})[k.toLowerCase()] || null }, text: async () => (corps === undefined ? "" : JSON.stringify(corps)) });
  const f = async (url, o) => {
    o = o || {}; const m = o.method || "GET"; appels.push(m + " " + url.split("?")[0]);
    if (!/Bearer JETON/.test((o.headers || {}).Authorization || "") && !url.startsWith("https://envoi/")) return rep(401, { error: { message: "jeton" } });
    if (url.startsWith("https://www.googleapis.com/upload/drive/v3/files") && m === "POST") {
      const id = "up" + ++n, meta = JSON.parse(o.body); envois[id] = { meta, taille: +o.headers["X-Upload-Content-Length"], recu: [], n: 0 };
      return rep(200, {}, { location: "https://envoi/" + id });
    }
    if (url.startsWith("https://envoi/")) {
      const id = url.split("/").pop(), e = envois[id], [, a, b, t] = /bytes (\d+)-(\d+)\/(\d+)/.exec(o.headers["Content-Range"]) || [];
      if (+a !== e.n) return rep(400, { error: { message: "morceau hors d'ordre" } });
      if (+b + 1 < +t && (+b + 1 - +a) % (256 * 1024)) return rep(400, { error: { message: "morceau pas multiple de 256 Kio" } });
      e.recu.push(Buffer.from(o.body)); e.n += o.body.length;
      if (e.n < e.taille) return rep(308);
      const fid = "f" + ++n; F[fid] = { id: fid, name: e.meta.name, parents: e.meta.parents, size: String(e.n), createdTime: new Date(Date.now() + n).toISOString(), contenu: Buffer.concat(e.recu) };
      return rep(200, { id: fid, name: e.meta.name, size: F[fid].size });
    }
    const id = decodeURIComponent((url.split("/files/")[1] || "").split("?")[0]);
    if (m === "POST") { const b = JSON.parse(o.body), fid = "d" + ++n; F[fid] = { id: fid, name: b.name, mimeType: b.mimeType }; return rep(200, { id: fid, name: b.name }); }
    if (m === "DELETE") { if (!F[id]) return rep(404, { error: { message: "absent" } }); delete F[id]; return rep(204); }
    if (id) return F[id] ? rep(200, { id, trashed: !!F[id].trashed }) : rep(404, { error: { message: "absent" } });
    const q = decodeURIComponent(url.split("q=")[1].split("&")[0]), p = /'([^']+)' in parents/.exec(q)[1];
    return rep(200, { files: Object.values(F).filter((x) => (x.parents || []).indexOf(p) >= 0 && !x.trashed).sort((a, b) => b.createdTime.localeCompare(a.createdTime)) });
  };
  return { f, F, appels };
}

(async () => {
  const D = fauxDrive(), api = G.creerApi("JETON", D.f);
  console.log("Dossier « Onco360 – exports du cabinet »");
  const dos = await api.creerDossier("Onco360 – exports du cabinet");
  cas("dossier créé", dos.id && D.F[dos.id].mimeType === G.DOSSIER);
  cas("dossier existant reconnu, absent ou à la corbeille non", (await api.dossierExiste(dos.id)) && !(await api.dossierExiste("inconnu")) && !(await api.dossierExiste("")));
  D.F[dos.id].trashed = true; cas("dossier mis à la corbeille : à recréer", !(await api.dossierExiste(dos.id))); D.F[dos.id].trashed = false;

  console.log("Envoi par morceaux (resumable)");
  const taille = G.MORCEAU * 2 + 12345, src = Buffer.alloc(taille); for (let i = 0; i < taille; i++) src[i] = (i * 7) % 256;
  let lus = 0; const r = await api.envoyer({ nom: "Onco360_export_2026-10-18.zip", parent: dos.id, type: "application/zip", taille, lire: async (a, b) => { lus++; return src.subarray(a, b + 1); } });
  cas("fichier entier, identique, dans le dossier", D.F[r.id] && Buffer.compare(D.F[r.id].contenu, src) === 0 && D.F[r.id].parents[0] === dos.id, r);
  cas("3 morceaux lus (jamais tout en mémoire)", lus === 3, lus);
  const petit = await api.envoyer({ nom: "Onco360_export_petit.zip", parent: dos.id, taille: 10, lire: async (a, b) => src.subarray(a, b + 1) });
  cas("petit fichier (un seul morceau)", D.F[petit.id] && D.F[petit.id].size === "10");
  let err = ""; try { await G.creerApi("MAUVAIS", D.f).creerDossier("x"); } catch (e) { err = e.message; }
  cas("jeton refusé : erreur lisible", /Google Drive 401/.test(err), err);

  console.log("Exports gardés");
  for (let i = 0; i < 4; i++) await api.envoyer({ nom: "Onco360_export_s" + i + ".zip", parent: dos.id, taille: 3, lire: async () => Buffer.from("abc") });
  await api.envoyer({ nom: "Note personnelle.txt", parent: dos.id, taille: 3, lire: async () => Buffer.from("abc") });
  const l = await api.lister(dos.id), aR = G.aRetirer(l, 3);
  cas("au-delà des 3 plus récents : les plus anciens exports à retirer", aR.length === 3 && aR.every((x) => /^Onco360_export_/.test(x.name)) && aR.map((x) => x.name).indexOf("Onco360_export_s3.zip") < 0, aR.map((x) => x.name));
  cas("un fichier qui n'est pas un export n'est jamais retiré", !aR.some((x) => /Note/.test(x.name)));
  for (const x of aR) await api.supprimer(x.id);
  cas("retirés du Drive", (await api.lister(dos.id)).filter((x) => /^Onco360_export_/.test(x.name)).length === 3);
  cas("garder 0 ou vide : jamais moins d'un", G.aRetirer(l, 0).length === l.filter((x) => /^Onco360_export_/.test(x.name)).length - 1);

  console.log("\n" + ok + " réussis, " + ko + " échoués"); process.exit(ko ? 1 : 0);
})();
