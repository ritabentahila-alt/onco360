// Onco360 – notes « À vérifier » par molécule (12/10/2026, demande de Dr Bentahila) : rubrique « Vigilance des molécules » de
// Paramètres › Listes et bibliothèques ; affichées dans la séance de chimiothérapie (chimio.js) pour les molécules du jour.
// parametres/vigilances { data: JSON [{ id, nom, mots, txt }] } ; absent = liste de départ VIG0 (moteur/vigilance.js).
// Lu par les membres, modifié avec le droit « paramètres » (règle parametres/{d}). Les contrôles automatiques (fenêtre à la
// validation) sont dans moteur/vigilance.js et ne dépendent pas de ces notes.
import { doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "../config.js";
import { VIG0, vigAudit3 } from "../moteur/vigilance.js";

let A = null;
export function installer(api) { A = api; }
let NOTES = null, ESP = null, VE = null, VMOD = false; // notes lues (null = à lire), cabinet lu, copie en cours de modification

// Notes du cabinet (liste de départ tant que la lecture n'est pas faite ; `apres` est rappelée une fois la lecture faite)
export function notesVigilance(apres) {
  if (NOTES === null || ESP !== A.ESPACE) {
    NOTES = VIG0; ESP = A.ESPACE;
    getDoc(doc(db, "espaces", A.ESPACE, "parametres", "vigilances")).then((s) => {
      if (s.exists()) { try { NOTES = JSON.parse(s.data().data || "[]"); } catch (e) { NOTES = VIG0; } if (apres) apres(); }
    }).catch(() => {});
  }
  return NOTES;
}

// Audit n° 3 (18/10/2026) : seuils du jour ajoutés à la liste déjà enregistrée par le cabinet, une fois (médecin ; audit3f)
export async function vigilancesAudit3() {
  if (!A.peut("parametres") || !A.D().membre || A.D().membre.role !== "medecin") return null;
  const rm = doc(db, "espaces", A.ESPACE, "parametres", "migrations"), g = await getDoc(rm).catch(() => null);
  if (!g || (g.exists() && g.data().audit3f)) return null;
  const s = await getDoc(doc(db, "espaces", A.ESPACE, "parametres", "vigilances")).catch(() => null);
  let n = 0;
  if (s && s.exists()) {
    let L = []; try { L = JSON.parse(s.data().data || "[]"); } catch (e) { L = []; }
    const r = vigAudit3(L); n = r.n;
    if (n) { await setDoc(doc(db, "espaces", A.ESPACE, "parametres", "vigilances"), { data: JSON.stringify(r.liste), maj: serverTimestamp(), majPar: A.D().u.uid }); NOTES = r.liste; }
  }
  await setDoc(rm, { audit3f: new Date().toISOString().slice(0, 10) }, { merge: true });
  return n;
}
// ───── Paramètres › Listes et bibliothèques › Vigilance des molécules ─────
export function htmlVigilances(ok) {
  if (!VE || !VMOD) VE = JSON.parse(JSON.stringify(notesVigilance(() => { if (!VMOD && location.hash.indexOf("vigilances") >= 0) window.cfOnglet("vigilances"); })));
  const esc = A.esc, dis = ok ? "" : " disabled";
  return '<section class="carte"><h3><span class="ic">' + A.ic("alerte") + '</span>Vigilance des molécules <span class="cf-n">' + VE.length + "</span></h3>" +
    '<p class="sous">Notes « À vérifier » affichées dans la séance de chimiothérapie quand une molécule de la séance contient un des mots indiqués (DCI ou marque, séparés par des virgules). ' +
    "Les contrôles automatiques (dose cumulée, FEVG, TSH, uracilémie, bilan du jour, radiothérapie en cours…) ouvrent de toute façon une fenêtre à la validation si quelque chose cloche.</p>" +
    VE.map((N, i) => '<div class="cf-auto"><div class="form" style="grid-template-columns:1fr 2fr"><div><label>Nom</label><input value="' + esc(N.nom) + '"' + dis + ' onchange="vgCh(' + i + ',\'nom\',this.value)"></div>' +
      '<div><label>Mots cherchés dans le nom du produit</label><input value="' + esc(N.mots) + '"' + dis + ' onchange="vgCh(' + i + ',\'mots\',this.value)"></div>' +
      '<div class="large"><label>À vérifier</label><textarea rows="2"' + dis + ' onchange="vgCh(' + i + ',\'txt\',this.value)">' + esc(N.txt) + "</textarea></div></div>" +
      (ok ? '<div class="actr">' + '<button class="sup" type="button" title="Retirer" aria-label="Retirer « ' + esc(N.nom) + ' »" onclick="vgSup(' + i + ')">' + A.ic("corbeille") + "</button></div>" : "") + "</div>").join("") +
    (ok ? '<button class="bt clair petit" style="margin-top:10px" onclick="vgAj()">' + A.ic("plus") + "Ajouter une molécule</button>" +
      '<div class="barre-enr"><button class="bt gris" onclick="vgDefaut()">↺ Liste de départ</button><span id="vgMod" class="mesures' + (VMOD ? "" : " cache") + '">Modifications non enregistrées</span>' +
      '<button class="bt plein" id="vgOk" onclick="vgEnregistrer()"><svg class="pi"><use href="#i-enregistrer"/></svg>Enregistrer</button></div>' : "") + "</section>";
}
const marquer = (redessiner) => { VMOD = true; if (redessiner) window.cfOnglet("vigilances"); else { const m = document.getElementById("vgMod"); if (m) m.classList.remove("cache"); } };
window.vgCh = (i, k, v) => { VE[i][k] = String(v || "").trim(); marquer(); };
window.vgSup = (i) => { if (!confirm("Retirer « " + (VE[i].nom || "cette note") + " » ?")) return; VE.splice(i, 1); marquer(true); };
window.vgAj = () => { VE.push({ id: "v" + Date.now().toString(36), nom: "", mots: "", txt: "" }); marquer(true); };
window.vgDefaut = () => { if (!confirm("Remettre la liste de départ (vos notes modifiées seront remplacées à l'enregistrement) ?")) return; VE = JSON.parse(JSON.stringify(VIG0)); marquer(true); };
window.vgEnregistrer = async () => {
  const L = VE.filter((N) => N.nom || N.mots || N.txt);
  if (L.some((N) => !N.mots)) { A.toast("Indiquez au moins un mot cherché pour chaque molécule."); return; }
  A.occupe(document.getElementById("vgOk"), true);
  try {
    await setDoc(doc(db, "espaces", A.ESPACE, "parametres", "vigilances"), { data: JSON.stringify(L), maj: serverTimestamp(), majPar: A.D().u.uid });
    NOTES = L; VE = null; VMOD = false; A.toast("Enregistré."); window.cfOnglet("vigilances");
  } catch (e) { A.occupe(document.getElementById("vgOk"), false); A.erreur(e.message); }
};
export const vigilancesModifiees = () => VMOD;
