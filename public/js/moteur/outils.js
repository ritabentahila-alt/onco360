// Chimio HGC v2 – outils de base (nombres, dates). Aucune dépendance au navigateur : testable seul.
import { jourMaroc } from "./heure.js";
export function num(v) { v = String(v == null ? "" : v).replace(/[\s\u202f\u00a0]/g, "").replace(",", "."); return v === "" || isNaN(+v) ? null : +v; }
export function arr(x, dec) { const m = Math.pow(10, dec || 0); return Math.round(x * m) / m; }
export function addJ(iso, n) { if (!iso) return null; const d = new Date(iso + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
export function ecart(a, b) { return Math.round((new Date(a + "T12:00:00Z") - new Date(b + "T12:00:00Z")) / 864e5); }
// Jour du Maroc d'aujourd'hui sans argument (S1, 21/10/2026 : heure du Maroc d'Onco360, pas celle de l'ordinateur) ; avec une date : ses
// jour, mois, année tels quels
export function auj(date) { if (!date) return jourMaroc(Date.now()); const d = date; return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
// Âge (années révolues) à la date ref (AAAA-MM-JJ)
export function age(ddn, ref) { if (!ddn || !ref) return null; let a = +ref.slice(0, 4) - +ddn.slice(0, 4); if (ref.slice(5) < ddn.slice(5)) a--; return a; }
// Jour ouvré : lundi–vendredi hors jours fériés (liste [{d:'AAAA-MM-JJ'}])
export function ouvre(d, feries) { const w = new Date(d + "T12:00:00").getDay(); return w !== 0 && w !== 6 && !(feries || []).some((f) => f.d === d); }
// Source d'image sûre (11/10/2026, audit) : photo, signature, logo = image en base64 (data:image/…) ou fichier Firebase Storage ;
// toute autre valeur (javascript:, guillemets, HTML…) est écartée avant d'être placée dans un src="…".
export const srcImage = (u) => (typeof u === "string" && (/^data:image\/(png|jpe?g|gif|webp);base64,[A-Za-z0-9+/=]+$/.test(u) || /^https:\/\/firebasestorage\.googleapis\.com\/[^"'<>\s]+$/.test(u)) ? u : "");
// Accord selon le médecin (1.7, 11/10/2026) : genre "f" / "m" du profil ; sans genre, le texte reste tel quel
export const accordMedecin = (t, g) => (g === "m" ? String(t).replace(/soussignée/g, "soussigné") : g === "f" ? String(t).replace(/soussigné(?!e)/g, "soussignée") : String(t));
export const absentMedecin = (g) => (g === "m" ? "Absent" : g === "f" ? "Absente" : "Absent(e)");
