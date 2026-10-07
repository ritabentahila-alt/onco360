// Chimio HGC – pont entre l'application (écrite pour Google Apps Script) et Firebase.
// L'application appelle google.script.run.xxx(...) : ces appels sont traduits ici en lectures / écritures Firestore.
import { auth, db } from "./config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc, getDocs, setDoc, deleteDoc, addDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const lire = async (col, id) => { const s = await getDoc(doc(db, col, id)); return s.exists() ? s.data() : null; };
const lireJSON = async (col, id, defaut) => { const d = await lire(col, id); if (!d || d.data == null) return defaut; try { return JSON.parse(d.data); } catch (e) { return defaut; } };
const ecrireJSON = (col, id, v, extra) => setDoc(doc(db, col, id), Object.assign({ data: JSON.stringify(v), maj: serverTimestamp() }, extra || {}));

// Résumé d'un dossier (pour la liste de l'accueil) quand il n'a pas encore été enregistré depuis Firebase
function resumeDe(data, nom) {
  try { const P = window.migrer(JSON.parse(data)); const old = window.PAT; window.PAT = P; try { return JSON.stringify(window.resume(P)); } finally { window.PAT = old; } }
  catch (e) { return JSON.stringify({ nm: nom || "" }); }
}

let MIG = null;
// Historique des modifications : une ligne par enregistrement, jamais modifiable ni effaçable (règles de sécurité)
const DERNIER = {}, DOSSIER = {};
function sections(a, b) {
  const c = [];
  try { const A = a ? JSON.parse(a) : {}, B = JSON.parse(b);
    const lib = { lignes: "chimiothérapie", rdvs: "rendez-vous", rts: "radiothérapie", notes: "résumé", diag: "diagnostic", diagP: "précision", poids: "poids", taille: "taille", tel: "téléphone", hop: "hôpital", cor: "correspondant" };
    for (const k of new Set(Object.keys(A).concat(Object.keys(B)))) if (k !== "dossier" && JSON.stringify(A[k]) !== JSON.stringify(B[k])) c.push(lib[k] || k);
  } catch (e) {}
  return c.slice(0, 12);
}
function journal(action, cible, nom, detail) {
  addDoc(collection(db, "historique"), { quand: serverTimestamp(), qui: (auth.currentUser && auth.currentUser.email) || "?", action, cible, nom: nom || "", detail: detail || [] })
    .catch((e) => console.warn("historique", e));
}
async function migrations() { if (!MIG) MIG = await lireJSON("parametres", "migrations", {}); return MIG; }

const SPECIAUX = {
  "__TARIFS__": { lire: async () => { const t = await lireJSON("finances", "tarifs", null); return t ? { id: "__TARIFS__", t } : null; },
                  ecrire: async (p) => { await ecrireJSON("finances", "tarifs", p.t); await ecrireJSON("parametres", "calendrier", { feries: (p.t && p.t.feries) || [], abs: (p.t && p.t.abs) || [] }); } },
  "__PAYE__":   { lire: async () => ({ id: "__PAYE__", p: await lireJSON("finances", "paiements", {}) }), ecrire: (p) => ecrireJSON("finances", "paiements", p.p || {}) },
  "__KL__":     { lire: async () => ({ id: "__KL__", l: await lireJSON("finances", "versements", []) }), ecrire: (p) => ecrireJSON("finances", "versements", p.l || []) },
  "__LISTES__": { lire: async () => { const o = await lireJSON("parametres", "listes", null); return o ? Object.assign({ id: "__LISTES__" }, o) : null; },
                  ecrire: (p) => ecrireJSON("parametres", "listes", { cor: p.cor || [], mut: p.mut || [] }) },
  "AGENDA_ABS": { lire: async () => { const o = await lireJSON("parametres", "agendaAbs", null); return o ? Object.assign({ id: "AGENDA_ABS" }, o) : null; },
                  ecrire: (p) => ecrireJSON("parametres", "agendaAbs", { sig: p.sig || "", dossier: p.dossier || "" }) }
};

const API = {
  async listPatients() {
    const [sp, sl] = await Promise.all([getDocs(collection(db, "patients")), getDocs(collection(db, "protocoles"))]);
    const out = [];
    sl.forEach((d) => { const x = d.data(); out.push({ id: "__LIB_" + d.id.replace(/^lib_/, ""), nom: "__LIB__", dossier: '{"v":' + (x.v || 0) + ',"list":' + (x.data || "[]") + "}", maj: "" }); });
    const logo = document.getElementById("logo"); if (logo) out.push({ id: "__LOGO__", nom: "__LOGO__", dossier: logo.src, maj: "" });
    sp.forEach((d) => { const x = d.data(); out.push({ id: d.id, nom: x.nom || "", dossier: x.dossier || resumeDe(x.data, x.nom), maj: "" }); });
    return out;
  },
  async getPatient(id) {
    id = String(id);
    if (SPECIAUX[id]) return SPECIAUX[id].lire();
    if (id.startsWith("__")) { const m = await migrations(); return m[id] ? Object.assign({ id }, m[id]) : null; }
    const x = await lire("patients", id); if (!x) return null;
    DERNIER[id] = x.data; DOSSIER[id] = x.dossier || ""; const P = JSON.parse(x.data); P.id = id; P.dossier = x.dossier || ""; return P;
  },
  async savePatient(p) {
    const id = String(p.id);
    if (SPECIAUX[id]) { await SPECIAUX[id].ecrire(p); if (id !== "AGENDA_ABS") journal("paramètres", id.replace(/_/g, ""), "", []); return true; }
    if (id === "__LOGO__") return true;
    if (id.startsWith("__LIB_")) { const o = JSON.parse(p.dossier || "{}"); await setDoc(doc(db, "protocoles", "lib_" + id.slice(6)), { v: o.v || 0, n: (o.list || []).length, data: JSON.stringify(o.list || []) }); return true; }
    if (id.startsWith("__")) { const m = await migrations(); const c = Object.assign({}, p); delete c.id; delete c.nom; delete c.dossier; m[id] = c; await ecrireJSON("parametres", "migrations", m); return true; }
    const c = {}; for (const k in p) if (k !== "dossier") c[k] = p[k];
    const s = JSON.stringify(c), avant = DERNIER[id], dos = p.dossier || "";
    // On n'écrit rien seulement si NI les données NI le résumé (agenda compris) n'ont changé
    if (avant === s && DOSSIER[id] === dos) return true;
    await setDoc(doc(db, "patients", id), { nom: p.nom || "", data: s, dossier: dos, maj: serverTimestamp() });
    if (avant !== s) journal(avant === undefined ? "création ou modification" : "modification", id, p.nom, sections(avant, s));
    DERNIER[id] = s; DOSSIER[id] = dos;
    return true;
  },
  async deletePatient(id) { await deleteDoc(doc(db, "patients", String(id))); journal("suppression", String(id), "", []); delete DERNIER[id]; return true; }
};

window.__FB_API = API;
onAuthStateChanged(auth, (u) => {
  if (!u) { location.replace("index.html"); return; }
  window.__FB_USER = u.email;
  if (window.__FB_SURAUTH) window.__FB_SURAUTH(u.email);
  window.__FB_PRET && window.__FB_PRET();
});
