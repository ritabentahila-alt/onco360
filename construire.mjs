// Construit public/app.html à partir de l'application actuelle (fichier HGC_application_complete.html du Drive)
// en y branchant le pont Firebase. Usage : node construire.mjs ~/Downloads/HGC_application_complete.html
import fs from "fs";
import path from "path";
const src = process.argv[2];
if (!src || !fs.existsSync(src)) { console.error("❌ Fichier introuvable : " + (src || "(aucun)") + "\n   Téléchargez HGC_application_complete.html depuis le Drive (dossier Système) puis relancez."); process.exit(1); }
let h = fs.readFileSync(src, "utf8");
if (!h.includes("function run(fn,arg)") || !h.includes("google.script.run")) { console.error("❌ Ce fichier n'est pas l'application Chimio HGC."); process.exit(1); }
const i = h.indexOf("<script>");
h = h.slice(0, i) + '<script src="js/shim.js"></script>\n<script type="module" src="js/pont.js"></script>\n' + h.slice(i);
const j = h.lastIndexOf("</body>");
h = h.slice(0, j) + '<script src="js/ajustements.js"></script>\n' + h.slice(j);
h = h.replace("<title>Chimio HGC</title>", '<title>Chimio HGC</title>\n<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="apple-mobile-web-app-title" content="Chimio HGC">\n<link rel="apple-touch-icon" href="logo.png">');
const dest = path.join(path.dirname(new URL(import.meta.url).pathname), "public", "app.html");
fs.writeFileSync(dest, h);
const nbMod = (h.match(/MAJS\.push|var _[a-zA-Z0-9]+=/g) || []).length;
console.log("✅ public/app.html construit (" + Math.round(h.length / 1024) + " Ko). Étape suivante : firebase deploy --only hosting");
