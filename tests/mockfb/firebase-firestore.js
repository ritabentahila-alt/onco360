const cl = (v) => JSON.parse(JSON.stringify(v, (k, x) => (x && x.__ts ? new Date().toISOString() : x)));
export function getFirestore() { return {}; }
export function doc(db, ...p) { if (db && db.col) p = [db.col, ...p]; const path = p.join("/"); return { path, id: p[p.length - 1] }; }
export function collection(db, ...p) { return { col: p.join("/") }; }
export function serverTimestamp() { return { __ts: 1 }; }
export function query(c, ...f) { return { col: c.col, f }; }
export function where(k, op, v) { return { k, op, v }; }
export function orderBy() { return null; }
export function limit() { return null; }
export async function getDoc(r) { const v = window.__fs[r.path]; return { exists: () => !!v, data: () => (v ? cl(v) : undefined), id: r.id, ref: r }; }
export async function setDoc(r, v, o) { window.__fs[r.path] = o && o.merge ? Object.assign(window.__fs[r.path] || {}, cl(v)) : cl(v); }
export async function updateDoc(r, v) { if (!window.__fs[r.path]) throw Object.assign(new Error("absent"), { code: "not-found" }); window.__fs[r.path] = Object.assign(window.__fs[r.path], cl(v)); }
export async function deleteDoc(r) { delete window.__fs[r.path]; }
export async function addDoc(c, v) { const id = "a" + Math.random().toString(36).slice(2, 9); window.__fs[c.col + "/" + id] = cl(v); return { id }; }
export async function getDocs(c) {
  const n = c.col.split("/").length + 1;
  let docs = Object.keys(window.__fs).filter((k) => k.startsWith(c.col + "/") && k.split("/").length === n).map((k) => ({ id: k.split("/").pop(), ref: { path: k, id: k.split("/").pop() }, data: () => cl(window.__fs[k]), exists: () => true }));
  (c.f || []).filter(Boolean).forEach((w) => { if (w.op === "in") docs = docs.filter((d) => w.v.indexOf(d.data()[w.k]) >= 0); else if (w.op === "==") docs = docs.filter((d) => d.data()[w.k] === w.v); });
  return { docs, size: docs.length, empty: !docs.length, forEach: (f) => docs.forEach(f) };
}
export function writeBatch() { const ops = []; return { set: (r, v) => ops.push(() => setDoc(r, v)), delete: (r) => ops.push(() => deleteDoc(r)), commit: async () => { for (const o of ops) await o(); } }; }
