// Faux Cloud Storage (tests) : fichiers gardés en mémoire dans window.__st { chemin: { blob, meta } }
window.__st = window.__st || {};
export function getStorage() { return {}; }
export function ref(st, chemin) { return { fullPath: chemin }; }
export function uploadBytesResumable(r, data, meta) {
  const ec = []; let annule = false;
  const t = {
    snapshot: { bytesTransferred: 0, totalBytes: data.size || 0 },
    on(ev, prog, err, fin) {
      setTimeout(() => {
        if (annule) { err(Object.assign(new Error("annulé"), { code: "storage/canceled" })); return; }
        if (window.__stRefus) { err(Object.assign(new Error("refusé"), { code: "storage/unauthorized" })); return; }
        t.snapshot.bytesTransferred = t.snapshot.totalBytes; prog(t.snapshot);
        window.__st[r.fullPath] = { blob: data, meta: Object.assign({}, meta) }; fin();
      }, 50);
    },
    cancel() { annule = true; },
  };
  return t;
}
export async function getBlob(r) { const o = window.__st[r.fullPath]; if (!o) throw Object.assign(new Error("absent"), { code: "storage/object-not-found" }); return o.blob; }
export async function deleteObject(r) { if (!window.__st[r.fullPath]) throw Object.assign(new Error("absent"), { code: "storage/object-not-found" }); delete window.__st[r.fullPath]; }
