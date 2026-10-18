// Onco360 – Protocoles (étape C5) : la bibliothèque complète, triée comme dans l'application actuelle
// (cancer › localisation › situation › sous-groupe), recherche, favoris, statut Validé / Non validé, création et modification.
import { doc, getDoc, setDoc, runTransaction } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "../config.js";
import { dedupIds, premed, protocoleValide } from "../moteur/doses.js";
import { tableMol, edValide, editerAvec, menusCascade, valeursCascade } from "./chimio.js";
import { correctionsAudit3 } from "../moteur/audit3.js";
import { RISQUES, risqueEmetique, libRisque } from "../moteur/seuils.js";
// P9 : fonctions serveur (europe-west1), chargées seulement quand on s'en sert
const serveur = async (nom, d) => { const { getFunctions, httpsCallable } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-functions.js"); const { app } = await import("../config.js"); return (await httpsCallable(getFunctions(app, "europe-west1"), nom, { timeout: 120000 })(d || {})).data; };

let A = null;
export function installer(api) { A = api; }
const D = () => A.D();
const CLES = ["c", "o", "s", "g"];
let CF = { c: "", o: "", s: "", g: "", q: "", fav: 0, st: "" }, ED = null, REDESSINER = null;
const sa = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const BIB = () => Object.values(D().ctx.bib).filter((p) => p && p.nom);
const molecules = (p) => (p.dr || []).filter((d) => !premed(d) && !/Retrait|Fin du diffuseur/.test(d.p)).map((d) => d.p).join(", "); // 2.3 : même liste que le calcul
const valide = protocoleValide;
// Validation tracée (2.4) : qui, quand, quelle version, quelle source
const traceVal = (p) => { const v = p.valide; if (!v) return ""; return (v.retro ? "Validé avant le 12/10/2026" : v.reference ? "Copié de la bibliothèque de référence le " + A.dfrA(v.reference) : "Validé par " + (v.parNom || "un médecin") + " le " + A.dfrA(String(v.le || "").slice(0, 10))) + " (version " + (v.version || p.version || 1) + ")" + (p.src ? " – source : " + p.src : ""); };
const badgeSt = (p) => (valide(p) ? '<span class="badge b-ch" title="' + A.esc(traceVal(p)) + '"><svg class="pi"><use href="#i-check"/></svg>Validé</span>' : '<span class="badge b-or"><i class="dot j"></i>Non validé</span>');

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
      '<div class="actr" style="flex-wrap:nowrap"><button class="mini" onclick="prOuvrir(\'' + esc(p.id) + "')\">" + (ok ? "Ouvrir / modifier" : "Voir") + "</button></div></div>";
  }).join("");
}
export function pageProtocoles() {
  const esc = A.esc, b = BIB(), nOk = b.filter(valide).length, ok = A.peut("parametres");
  let h = '<section class="accueil"><div><h2>Protocoles</h2><p>' + b.length + " protocoles · " + nOk + " validés · " + (b.length - nOk) + " non validés</p></div>" +
    '<div class="actions"><button class="bt clair" onclick="prExporter(\'xlsx\')" title="Toute la bibliothèque dans un tableau Excel">' + A.ic("telecharger") + 'Excel</button><button class="bt clair" onclick="prExporter(\'pdf\')" title="Livret imprimable, par localisation">' + A.ic("imprimer") + "Livret PDF</button>" +
    (ok ? '<button class="bt plein" onclick="prOuvrir()">' + A.ic("plus") + "Créer un protocole</button>" : "") + "</div>" + '</section><div id="prMaj"></div><section class="carte">';
  // Menus déroulants en cascade : Type de cancer › Localisation › Situation › Sous-groupe
  if (CF.c && !CF.o) { const o = valeurs(1); if (o.length === 1) CF.o = o[0]; }
  h += menusCascade(BIB(), CF, "prChoixV");
  h += '<div class="actr" style="justify-content:flex-start;margin-top:8px"><input id="prQ" class="champ" style="flex:1;min-width:220px" placeholder="Rechercher : molécule, protocole ou situation (ex. pertuzumab, sein adjuvant)…" value="' + esc(CF.q) + '">' +
    '<button class="bt ' + (CF.fav ? "plein" : "clair") + ' petit" onclick="prFiltre(\'fav\')"><svg class="pi"><use href="#i-etoile"/></svg>Favoris</button><select class="champ" style="font-size:14px;padding:8px" onchange="const v=this.value;this.blur();setTimeout(()=>prFiltre(\'st\',v),30)"><option value="">Tous les statuts</option><option value="ok"' + (CF.st === "ok" ? " selected" : "") + '>Validés</option><option value="todo"' + (CF.st === "todo" ? " selected" : "") + ">Non validés</option></select>" +
    '<button class="bt gris petit" onclick="prFiltre(\'reinit\')">Réinitialiser</button></div><div id="prL" style="margin-top:6px">' + liste() + "</div></section>";
  A.$("page").innerHTML = h;
  const q = A.$("prQ"); q.oninput = () => { CF.q = q.value; A.$("prL").innerHTML = liste(); };
  bandeauMaj();
  if (CF.q) { q.focus(); q.setSelectionRange(q.value.length, q.value.length); }
}
// 12/10/2026 : un choix dans les menus ne redessine plus toute la page (seulement les menus et la liste ; défilement et recherche gardés)
function majCascade() {
  const zc = document.querySelector("#page .cascade"), zl = A.$("prL"); if (!zc || !zl) { pageProtocoles(); return; }
  if (CF.c && !CF.o) { const o = valeurs(1); if (o.length === 1) CF.o = o[0]; }
  zc.outerHTML = menusCascade(BIB(), CF, "prChoixV"); zl.innerHTML = liste();
}
window.prChoixV = (n, v) => { CF[CLES[n]] = v || ""; for (let k = n + 1; k < 4; k++) CF[CLES[k]] = ""; majCascade(); };
window.prChoix = (n, i) => { CF[CLES[n]] = i < 0 ? "" : valeurs(n)[i]; for (let k = n + 1; k < 4; k++) CF[CLES[k]] = ""; majCascade(); };
window.prFiltre = (f, v) => { if (f === "fav") CF.fav = CF.fav ? 0 : 1; else if (f === "st") CF.st = v; else CF = { c: "", o: "", s: "", g: "", q: "", fav: 0, st: "" }; pageProtocoles(); };

// ───── Enregistrement : la bibliothèque est rangée en plusieurs documents (lib_0…lib_N) ─────
// 2.4 (12/10/2026, audit) : chaque enregistrement relit son bloc dans une transaction et n'y remplace que ses protocoles (ajout,
// modification ou retrait) : deux médecins qui modifient deux protocoles du même bloc ne s'écrasent plus.
async function sauverDocs(ids, retirer) {
  const blocs = {};
  ids.forEach((id) => { const d = D().bibDoc[id]; if (d) (blocs[d] = blocs[d] || []).push(id); });
  for (const [d, liste] of Object.entries(blocs)) {
    const ref = doc(db, "espaces", A.ESPACE, "protocoles", d);
    const l = await runTransaction(db, async (tx) => {
      const s = await tx.get(ref); let L = []; try { L = s.exists() ? JSON.parse(s.data().data || "[]") : []; } catch (e) { L = []; }
      liste.forEach((id) => { const i = L.findIndex((p) => p && p.id === id); if (retirer) { if (i >= 0) L.splice(i, 1); } else if (i >= 0) L[i] = D().ctx.bib[id]; else L.push(D().ctx.bib[id]); });
      tx.set(ref, { data: JSON.stringify(L), n: L.length }, { merge: true }); return L;
    });
    // reprend ici ce que les collègues ont enregistré entre-temps dans ce bloc
    D().bibOrdre[d] = l.map((p) => p.id); l.forEach((p) => { if (liste.indexOf(p.id) < 0) D().ctx.bib[p.id] = p; D().bibDoc[p.id] = d; });
  }
}
// 2.4 – une fois (médecin, aussi dans une bibliothèque de référence) : les protocoles sans statut (bibliothèque d'origine) deviennent
// « Validé avant le 12/10/2026 » ; ensuite, sans statut = non validé
export async function marquerProtocoles() {
  if (!A.peut("parametres") || !D().membre || D().membre.role !== "medecin") return 0;
  const ids = BIB().filter((p) => !p.st).map((p) => p.id); if (!ids.length) return 0;
  ids.forEach((id) => { const p = D().ctx.bib[id]; p.st = "ok"; p.version = p.version || 1; p.valide = { retro: true, le: "2026-10-12", version: p.version }; });
  await sauverDocs(ids);
  A.journal({ id: "", r: { nm: "" } }, ids.length + " protocole(s) sans statut marqués « Validé avant le 12/10/2026 »");
  return ids.length;
}
// Audit n° 3 (13/10/2026), ordre 1 – une fois par bibliothèque (médecin ; son cabinet, puis la bibliothèque de référence) : 6 protocoles
// critiques corrigés, protocole lié PORTEC-3 phase 2 créé, 10 protocoles supprimés (indications reprises par le protocole gardé) ;
// 18/10 (palier 3, drapeau audit3c ; relancer ne refait rien) : [211] AI 3 jours, « HGC » retiré des remarques ;
// calcul dans moteur/audit3.js ; les lignes déjà prescrites gardent leur copie ; sans fenêtre (décision de Dr Bentahila), noté au journal.
export async function appliquerAudit3() {
  if (!A.peut("parametres") || !D().membre || D().membre.role !== "medecin" || !BIB().length) return null;
  const rm = doc(db, "espaces", A.ESPACE, "parametres", "migrations"), g = await getDoc(rm).catch(() => null);
  if (!g || (g.exists() && g.data().audit3c)) return null;
  const r = correctionsAudit3(D().ctx.bib);
  const moi = { par: D().u.uid, parNom: (D().membre && D().membre.nom) || "", le: new Date().toISOString() };
  const signer = (p, neuf) => { p.version = neuf ? 1 : (p.version || 1) + 1; Object.assign(p, { majLe: moi.le, majPar: moi.par, majParNom: moi.parNom, st: "ok" }); p.valide = Object.assign({ version: p.version }, moi); };
  r.modifies.forEach((m) => { signer(m.p); D().ctx.bib[m.id] = m.p; });
  r.crees.forEach((p) => { signer(p, true); D().ctx.bib[p.id] = p; rangerNouveau(p.id); });
  const ecrits = r.modifies.map((m) => m.id).concat(r.crees.map((p) => p.id));
  if (ecrits.length) await sauverDocs(ecrits);
  if (r.supprimes.length) {
    const ids = r.supprimes.map((s) => s.id);
    await sauverDocs(ids, true);
    ids.forEach((id) => { const d = D().bibDoc[id]; delete D().ctx.bib[id]; if (d) D().bibOrdre[d] = (D().bibOrdre[d] || []).filter((x) => x !== id); });
    const rs = doc(db, "espaces", A.ESPACE, "parametres", "protocolesSupprimes"), sv = await getDoc(rs).catch(() => null), l = sv && sv.exists() ? JSON.parse(sv.data().data || "[]") : [];
    ids.forEach((id) => { if (l.indexOf(id) < 0) l.push(id); }); await setDoc(rs, { data: JSON.stringify(l) }).catch(() => {});
  }
  await setDoc(rm, { audit3c: moi.le.slice(0, 10) }, { merge: true });
  if (!ecrits.length && !r.supprimes.length) return r;
  A.journal({ id: "", r: { nm: "" } }, "Audit n° 3 : " + r.modifies.length + " protocole(s) corrigé(s), " + r.crees.length + " créé(s), " + r.supprimes.length + " supprimé(s)");
  if (D().page === "protocoles") pageProtocoles();
  return r;
}
// Audit n° 3, P4 (18/10/2026) – une fois par bibliothèque (médecin ; drapeau audit3e), après appliquerAudit3 : consignes des ordres 2 et 3
// du classeur, seuils du jour et ordonnances liées (moteur/audit3p4.js ; données chargées seulement ici). Sans fenêtre, noté au journal.
export async function appliquerP4() {
  if (!A.peut("parametres") || !D().membre || D().membre.role !== "medecin" || !BIB().length) return null;
  const rm = doc(db, "espaces", A.ESPACE, "parametres", "migrations"), g = await getDoc(rm).catch(() => null);
  if (!g || (g.exists() && g.data().audit3e)) return null;
  const [{ correctionsP4 }, { P4, P7 }] = await Promise.all([import("../moteur/audit3p4.js"), import("../donnees/audit3p4.js")]);
  const r = correctionsP4(D().ctx.bib, P4, P7), moi = { par: D().u.uid, parNom: (D().membre && D().membre.nom) || "", le: new Date().toISOString() };
  const signer = (p, neuf) => { p.version = neuf ? 1 : (p.version || 1) + 1; Object.assign(p, { majLe: moi.le, majPar: moi.par, majParNom: moi.parNom }); if (neuf) p.st = "ok"; if (p.st === "ok") p.valide = Object.assign({ version: p.version }, moi); };
  r.modifies.forEach((m) => { signer(m.p); D().ctx.bib[m.id] = m.p; });
  r.crees.forEach((p) => { signer(p, true); D().ctx.bib[p.id] = p; rangerNouveau(p.id); });
  const ecrits = r.modifies.map((m) => m.id).concat(r.crees.map((p) => p.id));
  if (ecrits.length) await sauverDocs(ecrits);
  await setDoc(rm, { audit3e: moi.le.slice(0, 10) }, { merge: true });
  if (ecrits.length) A.journal({ id: "", r: { nm: "" } }, "Audit n° 3 (ordres 2 et 3) : " + r.modifies.length + " protocole(s) complété(s), " + r.crees.length + " créé(s)" + (r.ignores.length ? " ; " + r.ignores.length + " consigne(s) déjà faite(s)" : ""));
  if (D().page === "protocoles") pageProtocoles();
  return r;
}
// 18/10/2026 : acide folinique racémique nommé, Solumedrol en mg/kg passé en dose fixe (moteur/audit3p4.js correctionsP5b) ; une fois (audit3g)
export async function appliquerP5b() {
  if (!A.peut("parametres") || !D().membre || D().membre.role !== "medecin" || !BIB().length) return null;
  const rm = doc(db, "espaces", A.ESPACE, "parametres", "migrations"), g = await getDoc(rm).catch(() => null);
  if (!g || (g.exists() && g.data().audit3g)) return null;
  const { correctionsP5b } = await import("../moteur/audit3p4.js"), r = correctionsP5b(D().ctx.bib), moi = { par: D().u.uid, parNom: (D().membre && D().membre.nom) || "", le: new Date().toISOString() };
  r.modifies.forEach((m) => { m.p.version = (m.p.version || 1) + 1; Object.assign(m.p, { majLe: moi.le, majPar: moi.par, majParNom: moi.parNom }); if (m.p.st === "ok") m.p.valide = Object.assign({ version: m.p.version }, moi); D().ctx.bib[m.id] = m.p; });
  if (r.modifies.length) await sauverDocs(r.modifies.map((m) => m.id));
  await setDoc(rm, { audit3g: moi.le.slice(0, 10) }, { merge: true });
  if (r.modifies.length) A.journal({ id: "", r: { nm: "" } }, "Protocoles : acide folinique racémique nommé, Solumedrol en dose fixe (" + r.modifies.length + " protocole(s))");
  return r;
}
// ───── P9 (18/10/2026) : mises à jour de la bibliothèque de référence (médecin, cabinets autres que celui du Dr Bentahila) ─────
let MAJ = null, MAJ_ESP = null;
async function bandeauMaj() {
  if (!A.peut("parametres") || !D().membre || D().membre.role !== "medecin" || D().bib || A.ESPACE === "cabinet-bentahila") return;
  if (MAJ_ESP !== A.ESPACE) { MAJ = null; MAJ_ESP = A.ESPACE; try { MAJ = await serveur("referenceDiff", { espace: A.ESPACE }); } catch (e) { MAJ = { items: [], ordos: [] }; } }
  const z = A.$("prMaj"); if (!z || !MAJ) return;
  const n = MAJ.items.length + MAJ.ordos.length; if (!n) { z.innerHTML = ""; return; }
  const nv = MAJ.items.filter((x) => x.type === "nouveau").length, df = MAJ.items.length - nv;
  z.innerHTML = '<section class="carte" style="border-left:4px solid var(--bleu,#3563B0)"><b>Bibliothèque de référence (version ' + MAJ.version + ")</b> : " + (nv ? nv + " protocole" + (nv > 1 ? "s" : "") + " nouveau" + (nv > 1 ? "x" : "") : "") + (nv && df ? ", " : "") + (df ? df + " différent" + (df > 1 ? "s" : "") + " du vôtre" : "") +
    (MAJ.ordos.length ? (nv || df ? ", " : "") + MAJ.ordos.length + " ordonnance" + (MAJ.ordos.length > 1 ? "s" : "") + " type" : "") + ' <button class="bt plein petit" onclick="prMaj()">Voir et choisir</button>' +
    ((MAJ.versions || []).length ? '<div class="mesures" style="margin-top:6px">' + MAJ.versions.map((v) => "v" + v.n + " (" + A.dfrA(String(v.le).slice(0, 10)) + ") : " + A.esc(v.notes)).join("<br>") + "</div>" : "") + "</section>";
}
async function noterRefus(id, e) {
  const r = doc(db, "espaces", A.ESPACE, "parametres", "reference"), s = await getDoc(r).catch(() => null), v = s && s.exists() ? s.data() : {};
  await setDoc(r, { refus: Object.assign({}, v.refus || {}, { [id]: e }), vue: MAJ.version }, { merge: true });
}
window.prMaj = () => {
  const esc = A.esc, R = (x) => x.resume ? [x.resume.nom ? "nom : « " + x.resume.nom[0] + " » → « " + x.resume.nom[1] + " »" : "", x.resume.cycle ? "cycle : " + x.resume.cycle[0] + " → " + x.resume.cycle[1] + " j" : ""].filter(Boolean).concat(x.resume.ajoutees.map((l) => "+ " + l), x.resume.retirees.map((l) => "− " + l)) : [];
  const ligne = (x, i, o) => '<div class="cf-auto" id="pm' + i + '"><b>' + esc(x.ref.nom) + "</b> " + (x.type === "nouveau" ? '<span class="badge b-ch">nouveau</span>' : '<span class="badge b-or">différent du vôtre</span>') +
    (x.type === "different" ? '<div class="mesures" style="margin:4px 0">' + (R(x).length ? R(x).map(esc).join("<br>") : o ? "posologies modifiées" : "remarques, indications, seuils ou ordonnances liées modifiés") + "</div>" : "") +
    '<div class="actr" style="justify-content:flex-start">' + (x.type === "nouveau" ? '<button class="bt plein petit" onclick="prMajChoix(' + i + ",'prendre'," + !!o + ')">Ajouter</button>' : '<button class="bt plein petit" onclick="prMajChoix(' + i + ",'prendre'," + !!o + ')">Prendre la version de la référence</button>' + (o ? "" : '<button class="bt clair petit" onclick="prMajChoix(' + i + ",'deux',false)\">Garder les deux</button>")) +
    '<button class="bt gris petit" onclick="prMajChoix(' + i + ",'garder'," + !!o + ')">' + (x.type === "nouveau" ? "Ne pas ajouter" : "Garder le mien") + "</button></div></div>";
  A.fenetre("<h3>Mises à jour de la bibliothèque de référence (version " + MAJ.version + ')</h3><p class="sous">Rien n\'est changé sans votre accord. Un protocole pris ou ajouté est enregistré dans votre bibliothèque ; « Garder le mien » ne sera plus proposé tant que la référence ne change pas.</p>' +
    (MAJ.items.length ? '<h4 class="soustitre">Protocoles</h4>' + MAJ.items.map((x, i) => ligne(x, i, false)).join("") : "") +
    (MAJ.ordos.length ? '<h4 class="soustitre">Ordonnances types</h4>' + MAJ.ordos.map((x, i) => ligne(x, "o" + i, true)).join("") : "") +
    '<div class="boutons"><button class="bt gris" onclick="fermerFenetre()">Fermer</button></div>', "large");
};
window.prMajChoix = async (i, quoi, o) => {
  const x = o ? MAJ.ordos[+String(i).slice(1)] : MAJ.items[i]; if (!x) return;
  const moi = { par: D().u.uid, parNom: (D().membre && D().membre.nom) || "", le: new Date().toISOString() };
  try {
    if (quoi === "garder") await noterRefus(x.id, x.e);
    else if (o) { await window.orMajTypes((L) => { const k = L.findIndex((z) => z.nom === x.ref.nom); const n = { id: (k >= 0 ? L[k].id : "ref" + Date.now()), nom: x.ref.nom, items: x.ref.items }; if (k >= 0) { if (L[k].fav) n.fav = L[k].fav; L[k] = n; } else L.push(n); }); }
    else {
      const p = JSON.parse(JSON.stringify(x.ref)), ancien = D().ctx.bib[x.id];
      if (quoi === "deux") { p.id = x.id + "|ref" + MAJ.version; p.nom = p.nom + " (référence v" + MAJ.version + ")"; }
      if (ancien && quoi !== "deux" && ancien.fav) p.fav = ancien.fav; else delete p.fav;
      p.version = quoi !== "deux" && ancien ? (ancien.version || 1) + 1 : 1; Object.assign(p, { majLe: moi.le, majPar: moi.par, majParNom: moi.parNom });
      if (p.st === "ok") p.valide = { reference: moi.le.slice(0, 10), version: p.version };
      const neuf = !D().ctx.bib[p.id]; D().ctx.bib[p.id] = p; if (neuf) rangerNouveau(p.id);
      await sauverDocs([p.id]);
      A.journal({ id: "", r: { nm: "" } }, "Bibliothèque de référence v" + MAJ.version + " : « " + p.nom + " » " + (quoi === "deux" ? "ajouté à côté du vôtre" : ancien ? "remplacé par la version de la référence" : "ajouté"));
    }
    (o ? MAJ.ordos : MAJ.items).splice(o ? +String(i).slice(1) : i, 1);
    if (!MAJ.items.length && !MAJ.ordos.length) await setDoc(doc(db, "espaces", A.ESPACE, "parametres", "reference"), { vue: MAJ.version }, { merge: true });
    A.toast(quoi === "garder" ? "Noté : le vôtre est gardé." : "Enregistré."); window.prMaj(); if (!MAJ.items.length && !MAJ.ordos.length) A.fermerFenetre(); bandeauMaj(); if (D().page === "protocoles") A.$("prL").innerHTML = liste();
  } catch (e) { A.erreur(e && e.code === "permission-denied" ? "Vous n'avez pas le droit de modifier la bibliothèque." : (e.message || String(e))); }
};
// ───── P9 : export de la bibliothèque (Excel, livret PDF par localisation) et « Signaler une erreur » ─────
const ligneP = (d) => d.p + " — " + (d.u === "txt" ? d.pos || "" : d.c1 != null ? d.c1 + "/" + d.cn + " " + d.u.replace("_c1", " (charge C1 / suite)") : (d.d != null ? String(d.d).replace(".", ",") : "") + " " + d.u) + " — " + (d.jl || (d.j || []).filter((y) => y !== 99).map((y) => "J" + y).join(" ")) + (d.v ? " — " + d.v : "");
let XLSX_P = null; // SheetJS chargé à la demande (copie du site, vendor/)
const chargerXlsx = () => window.XLSX ? Promise.resolve() : (XLSX_P = XLSX_P || new Promise((ok, ko) => { const e = document.createElement("script"); e.src = "vendor/xlsx.full.min.js"; e.onload = ok; e.onerror = () => { XLSX_P = null; ko(new Error("Export Excel indisponible.")); }; document.head.appendChild(e); }));
window.prExporter = async (f) => {
  const L = BIB().slice().sort((a, b) => a.nom.localeCompare(b.nom, "fr")), loc = (p) => ((p.ind || [])[0] || []).filter(Boolean).slice(0, 2).join(" › ") || "Autres";
  if (f === "xlsx") {
    try { await chargerXlsx(); } catch (e) { A.toast(e.message); return; }
    const rows = [["Protocole", "Localisation", "Indications", "Cycle (j)", "Rythme", "Molécules (produit — dose — jours — voie)", "Risque émétique", "Seuils du jour", "Ordonnances liées", "Remarques", "Source", "Statut", "Version"]].concat(L.map((p) => [p.nom, loc(p), (p.ind || []).map((x) => x.filter(Boolean).join(" › ")).join("\n"), p.c || 0, p.r || "", (p.dr || []).map(ligneP).join("\n"), libRisque(p.re || risqueEmetique(p, premed)), (p.seuils || []).join("\n"), (p.ordos || []).join("\n"), (p.no || []).join("\n"), p.src || "", valide(p) ? "Validé" : "Non validé", p.version || 1]));
    const wb = window.XLSX.utils.book_new(), ws = window.XLSX.utils.aoa_to_sheet(rows); ws["!cols"] = [50, 25, 40, 8, 40, 70, 16, 50, 40, 50, 25, 10, 8].map((w) => ({ wch: w }));
    window.XLSX.utils.book_append_sheet(wb, ws, "Protocoles"); window.XLSX.writeFile(wb, "Onco360_protocoles_" + D().t + ".xlsx"); return;
  }
  let w = null; try { w = window.open("", "_blank"); } catch (er) { w = null; } if (!w || !w.document) { A.toast("Autorisez l'ouverture des fenêtres pour imprimer."); return; }
  const g = {}; L.forEach((p) => { (g[loc(p)] = g[loc(p)] || []).push(p); }); const esc = A.esc;
  w.document.open(); w.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Livret des protocoles</title><style>@page{size:A4;margin:12mm}body{font-family:Arial,sans-serif;font-size:10.5px;color:#1E2A44}h1{font-size:18px}h2{font-size:14px;border-bottom:2px solid #3563B0;margin:16px 0 6px;page-break-after:avoid}.p{page-break-inside:avoid;margin:0 0 10px}.p b{font-size:11.5px}.m{margin:2px 0 0 10px}.g{color:#5A6478}</style></head><body><h1>Livret des protocoles – ' + esc(A.dfrA(D().t)) + " (" + L.length + ")</h1>" +
    Object.keys(g).sort().map((k) => "<h2>" + esc(k) + "</h2>" + g[k].map((p) => '<div class="p"><b>' + esc(p.nom) + "</b>" + (p.c ? " – cycle " + p.c + " j" : " – continu") + (p.r ? '<div class="g">' + esc(p.r) + "</div>" : "") + (p.dr || []).map((d) => '<div class="m">' + esc(ligneP(d)) + "</div>").join("") + (p.src ? '<div class="g">Source : ' + esc(p.src) + "</div>" : "") + "</div>").join("")).join("") + "</body></html>");
  w.document.close(); setTimeout(() => { w.focus(); w.print(); }, 400);
};
window.prSignaler = (id) => {
  const p = D().ctx.bib[id] || ED || {};
  A.fenetre("<h3>Signaler une erreur</h3><p class=\"sous\">« " + A.esc(p.nom || "") + " » — le message part à l'administration d'Onco360 (aucune donnée de patient).</p><div class=\"form\"><div class=\"large\"><label for=\"sgT\">Ce qui ne va pas</label><textarea id=\"sgT\" rows=\"4\"></textarea></div></div><div class=\"err\" id=\"fErr\"></div><div class=\"boutons\"><button class=\"bt gris\" onclick=\"fermerFenetre()\">Annuler</button><button class=\"bt plein\" id=\"sgOk\">Envoyer</button></div>");
  A.$("sgOk").onclick = async () => { const t = A.$("sgT").value.trim(); if (!t) { A.$("fErr").textContent = "Décrivez l'erreur."; return; } A.occupe(A.$("sgOk"), true);
    try { await serveur("signalerErreur", { espace: A.ESPACE, protocole: { id: p.id, nom: p.nom }, texte: t }); A.fermerFenetre(); A.toast("Merci : l'erreur est signalée à l'administration."); }
    catch (e) { A.occupe(A.$("sgOk"), false); A.$("fErr").textContent = e.message || String(e); } };
};
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
  try {
    await sauverDocs([id], true); delete D().ctx.bib[id]; D().bibOrdre[d] = (D().bibOrdre[d] || []).filter((x) => x !== id); A.fermerFenetre();
    // Liste des protocoles supprimés : la conversion finale ne les recopie pas depuis l'application actuelle
    const rs = doc(db, "espaces", A.ESPACE, "parametres", "protocolesSupprimes"), sv = await getDoc(rs).catch(() => null), l = sv && sv.exists() ? JSON.parse(sv.data().data || "[]") : [];
    if (l.indexOf(id) < 0) { l.push(id); await setDoc(rs, { data: JSON.stringify(l) }).catch(() => {}); }
    A.journal({ id: "", r: { nm: "" } }, "Protocole supprimé : " + p.nom); A.toast("Protocole supprimé."); pageProtocoles(); }
  catch (e) { A.toast(e.code === "permission-denied" ? "Vous n'avez pas le droit de modifier la bibliothèque." : e.message); }
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
      '<div class="large" style="grid-column:1/-1"><label>Rythme / observations</label><input value="' + esc(ED.r || "") + '" onchange="prProp(\'r\',this.value)"></div>' +
      '<div class="large" style="grid-column:1/-1"><label>Source (référentiel, article, recommandation)</label><input value="' + esc(ED.src || "") + '" placeholder="ex. ESMO 2023, KEYNOTE-189…" onchange="prProp(\'src\',this.value)"></div>' +
      // P3 (18/10/2026, audit n° 3) : risque émétique (calculé, modifiable), ordonnances liées, seuils particuliers du jour
      '<div><label>Risque émétique</label><select onchange="prProp(\'re\',this.value)"><option value="">Calculé : ' + esc(libRisque(risqueEmetique(ED, premed))) + "</option>" + RISQUES.map(([k, l]) => '<option value="' + k + '"' + (ED.re === k ? " selected" : "") + ">" + esc(l) + "</option>").join("") + "</select></div>" +
      '<div class="large" style="grid-column:2/-1"><label>Ordonnances liées (une par ligne, nom de l\'ordonnance type)</label><textarea rows="2" onchange="prProp(\'ordos\',this.value)">' + esc((ED.ordos || []).join("\n")) + "</textarea></div>" +
      '<div class="large" style="grid-column:1/-1"><label>Seuils du jour (une par ligne ; rappelés dans la séance)</label><textarea rows="2" onchange="prProp(\'seuils\',this.value)">' + esc((ED.seuils || []).join("\n")) + "</textarea></div></div>" +
      (traceVal(ED) || ED.version ? '<p class="mesures" style="margin:4px 0 0">' + esc(traceVal(ED) || "Version " + ED.version) + (ED.majParNom ? " · modifié par " + esc(ED.majParNom) + " le " + A.dfrA(String(ED.majLe || "").slice(0, 10)) : "") + "</p>" : "") +
      '<h4 class="soustitre">Indications (branches de l\'arborescence)</h4><div class="tableau"><table class="tcures ed"><tr><th>Cancer</th><th>Localisation</th><th>Situation</th><th>Sous-groupe</th><th></th></tr>' +
      ED.ind.map((x, i) => "<tr>" + [0, 1, 2, 3].map((k) => '<td><input list="dl' + k + '" value="' + esc(x[k] || "") + '" style="min-width:130px" onchange="prInd(' + i + "," + k + ',this.value)"></td>').join("") + '<td><button class="mini rouge" onclick="prIndSup(' + i + ')">−</button></td></tr>').join("") + "</table></div>" +
      [0, 1, 2, 3].map((k) => '<datalist id="dl' + k + '">' + tous[k].sort().map((v) => '<option value="' + esc(v) + '">').join("") + "</datalist>").join("") +
      '<div class="actr" style="justify-content:flex-start;margin-top:8px"><button class="mini" onclick="prIndAj()">+ Ajouter une indication</button><label style="font-weight:normal;margin-left:10px"><input type="checkbox" style="width:auto;margin-right:6px"' + (ED.assoc ? " checked" : "") + ' onchange="prProp(\'assoc\',this.checked)">Traitement associé (castration, os, support…)</label></div>' +
      '<h4 class="soustitre">Molécules</h4>' + tableMol() +
      '<div class="form" style="margin-top:12px"><div class="large"><label>Remarques (une par ligne)</label><textarea rows="3" onchange="prProp(\'no\',this.value)">' + esc((ED.no || []).join("\n")) + "</textarea></div></div>" +
      '<p class="mesures">Unités : mg/m² × surface corporelle ; mg/kg × poids ; mg = dose fixe ; AUC = carboplatine (Calvert) ; « charge C1 / suite » : saisir par ex. 840/420 ; texte libre : affiché tel quel. Seuls les protocoles « Validé » peuvent être prescrits.</p>' +
      '<div class="err" id="fErr"></div><div class="boutons"><button class="bt gris" onclick="fermerFenetre()">Annuler</button>' + (nouv ? "" : '<button class="bt gris" style="color:#C0392B;margin-right:auto" onclick="prSuppr(\'' + esc(ED.id) + '\')">Supprimer le protocole</button><button class="bt gris" onclick="prSignaler(\'' + esc(ED.id) + '\')">Signaler une erreur</button><button class="bt clair" id="prDup">Dupliquer</button>') + '<button class="bt plein" id="fOk">Enregistrer</button></div>', "large");
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
      // 2.4 : version (+1 quand le contenu change), auteur, validation tracée (qui, quand, quelle version)
      const ancien = D().ctx.bib[ED.id], cont = (p) => JSON.stringify([p.nom, p.c, p.dr, p.no || null, p.seuils || null, p.ordos || null, p.re || null]), change = !ancien || cont(ancien) !== cont(ED);
      const moi = { par: D().u.uid, parNom: (D().membre && D().membre.nom) || "", le: new Date().toISOString() };
      ED.version = ancien ? (ancien.version || 1) + (change ? 1 : 0) : 1; /* protocole d'origine sans numéro = version 1 */
      Object.assign(ED, { majLe: moi.le, majPar: moi.par, majParNom: moi.parNom }); // auteur de la modification (12/10/2026 : était avalé par le commentaire)
      if (ED.st === "ok") { if (change || !(ancien && ancien.st === "ok" && ancien.valide)) ED.valide = Object.assign({ version: ED.version }, moi); } else delete ED.valide;
      if (!ED.src) delete ED.src;
      const neuf = !D().ctx.bib[ED.id];
      D().ctx.bib[ED.id] = ED; if (neuf) rangerNouveau(ED.id);
      A.occupe(A.$("fOk"), true);
      await sauverDocs([ED.id]);
      A.journal({ id: "", r: { nm: "" } }, (neuf ? (dup === true ? "Protocole dupliqué : " : "Protocole créé : ") : "Protocole modifié : ") + ED.nom + " (version " + ED.version + (ED.st === "ok" ? ", validé" : ", non validé") + ")");
      A.fermerFenetre(); A.toast("Protocole enregistré."); pageProtocoles();
      if (dup === true) window.prOuvrir(ED.id);
    } catch (e) { A.occupe(A.$("fOk"), false); A.erreur(e && e.code === "permission-denied" ? "Vous n'avez pas le droit de modifier la bibliothèque." : (e.message || String(e))); }
  }
};
window.prProp = (f, v) => { if (f === "src") { ED.src = String(v).trim(); return; }
  if (f === "ordos" || f === "seuils") { const l = String(v).split("\n").map((z) => z.trim()).filter(Boolean); if (l.length) ED[f] = l; else delete ED[f]; return; }
  if (f === "re") { if (v) ED.re = v; else delete ED.re; return; } if (f === "c") ED.c = parseInt(v, 10) || 0; else if (f === "no") ED.no = String(v).split("\n").map((z) => z.trim()).filter(Boolean); else if (f === "assoc") ED.assoc = v ? 1 : 0; else ED[f] = String(v).trim(); };
window.prInd = (i, k, v) => { ED.ind[i][k] = String(v).trim(); };
window.prIndAj = () => { ED.ind.push(["", "", "", ""]); REDESSINER(); };
window.prIndSup = (i) => { ED.ind.splice(i, 1); REDESSINER(); };
function voir() {
  const esc = A.esc;
  A.fenetre("<h3>" + esc(ED.nom) + " " + badgeSt(ED) + '</h3><p class="mesures">' + esc(ED.r || "") + (ED.c ? " – cycle " + ED.c + " j" : " – continu") + '</p><div class="tableau"><table class="tcures"><tr><th>Produit</th><th>Dose</th><th>Unité</th><th>Jours</th><th>Voie</th><th>Durée</th></tr>' +
    ED.dr.map((d) => "<tr><td>" + esc(d.p) + "</td><td>" + esc(d.u === "txt" ? d.pos || "" : d.d != null ? d.d : (d.c1 != null ? d.c1 + "/" + d.cn : "")) + "</td><td>" + esc(d.u) + "</td><td>" + esc(d.jl || (d.j || []).filter((y) => y !== 99).map((y) => "J" + y).join(" ")) + "</td><td>" + esc(d.v || "") + "</td><td>" + esc(d.t || "") + "</td></tr>").join("") + "</table></div>" +
    (ED.no ? '<p style="color:#8A1C2B;font-size:13px">' + ED.no.map(esc).join("<br>") + "</p>" : "") +
    '<p class="mesures">Risque émétique : ' + esc(libRisque(ED.re || risqueEmetique(ED, premed))) + ((ED.ordos || []).length ? " · Ordonnances liées : " + ED.ordos.map(esc).join(" ; ") : "") + "</p>" +
    ((ED.seuils || []).length ? '<p class="mesures">Seuils du jour : ' + ED.seuils.map(esc).join(" · ") + "</p>" : "") + (traceVal(ED) ? '<p class="mesures">' + esc(traceVal(ED)) + "</p>" : "") + '<div class="boutons"><button class="bt gris" onclick="prSignaler(\'' + esc(ED.id) + '\')">Signaler une erreur</button><button class="bt gris" onclick="fermerFenetre()">Fermer</button></div>', "large");
}
