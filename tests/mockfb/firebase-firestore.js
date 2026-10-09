const cl = (v) => JSON.parse(JSON.stringify(v, (k, x) => (x && x.__ts ? new Date().toISOString() : x)));
export function getFirestore() { return {}; }
export function doc(db, ...p) { if (db && db.col) p = [db.col, ...p]; if (db && db.col && p.length === 1) p.push("a" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)); // doc(collection) : identifiant automatique
  const path = p.join("/"); return { path, id: p[p.length - 1] }; }
export function collection(db, ...p) { return { col: p.join("/") }; }
export function serverTimestamp() { return { __ts: 1 }; }
export function query(c, ...f) { return { col: c.col, f }; }
export function where(k, op, v) { return { k, op, v }; }
export function orderBy() { return null; }
export function limit() { return null; }
export async function getDoc(r) { const v = window.__fs[r.path]; return { exists: () => !!v, data: () => (v ? cl(v) : undefined), id: r.id, ref: r }; }
export async function setDoc(r, v, o) { window.__fs[r.path] = o && o.merge ? Object.assign(window.__fs[r.path] || {}, cl(v)) : cl(v); }
export function arrayUnion(...v) { return { __au: v }; }
export async function updateDoc(r, v) {
  const a = window.__fs[r.path]; if (!a) throw Object.assign(new Error("absent"), { code: "not-found" });
  const c = cl(v); Object.keys(c).forEach((k) => { if (c[k] && c[k].__au) c[k] = (a[k] || []).concat(c[k].__au.filter((x) => !(a[k] || []).some((y) => JSON.stringify(y) === JSON.stringify(x)))); });
  window.__fs[r.path] = Object.assign(a, c);
}
export async function deleteDoc(r) { delete window.__fs[r.path]; }
export async function addDoc(c, v) { const id = "a" + Math.random().toString(36).slice(2, 9); window.__fs[c.col + "/" + id] = cl(v); return { id }; }
export async function getDocs(c) {
  const n = c.col.split("/").length + 1;
  let docs = Object.keys(window.__fs).filter((k) => k.startsWith(c.col + "/") && k.split("/").length === n).map((k) => ({ id: k.split("/").pop(), ref: { path: k, id: k.split("/").pop() }, data: () => cl(window.__fs[k]), exists: () => true }));
  (c.f || []).filter(Boolean).forEach((w) => { if (w.op === "array-contains") docs = docs.filter((d) => (d.data()[w.k] || []).indexOf(w.v) >= 0); else if (w.op === "in") docs = docs.filter((d) => w.v.indexOf(d.data()[w.k]) >= 0); else if (w.op === "==") docs = docs.filter((d) => d.data()[w.k] === w.v); else if ([">=", ">", "<", "<="].indexOf(w.op) >= 0) { const n = (x) => (x instanceof Date || (typeof x === "string" && /^\d{4}-\d\d-\d\dT/.test(x)) ? new Date(x).getTime() : x); docs = docs.filter((d) => { const a = n(d.data()[w.k]), b = n(w.v); return w.op === ">=" ? a >= b : w.op === ">" ? a > b : w.op === "<" ? a < b : a <= b; }); } });
  return { docs, size: docs.length, empty: !docs.length, forEach: (f) => docs.forEach(f) };
}
export function writeBatch() { const ops = []; return { set: (r, v) => ops.push(() => setDoc(r, v)), delete: (r) => ops.push(() => deleteDoc(r)), commit: async () => { for (const o of ops) await o(); } }; }
// Écoute en direct simulée : relit la requête toutes les 0,5 s et signale les documents ajoutés, modifiés ou retirés
export function onSnapshot(q, next, err) {
  let avant = null, fini = false;
  const tour = async () => {
    if (fini) return;
    try {
      const s = await getDocs(q), m = new Map(s.docs.map((d) => [d.id, JSON.stringify(d.data())])), ch = [];
      s.docs.forEach((d) => { if (!avant || !avant.has(d.id)) ch.push({ type: "added", doc: d }); else if (avant.get(d.id) !== m.get(d.id)) ch.push({ type: "modified", doc: d }); });
      if (avant) avant.forEach((v, id) => { if (!m.has(id)) ch.push({ type: "removed", doc: { id, data: () => JSON.parse(v) } }); });
      if (!avant || ch.length) { avant = m; next(Object.assign(s, { docChanges: () => ch })); }
    } catch (e) { if (err) err(e); }
    setTimeout(tour, 500);
  };
  setTimeout(tour, 0);
  return () => { fini = true; };
}
