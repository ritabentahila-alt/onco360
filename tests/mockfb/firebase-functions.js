// Faux Firebase Functions (tests) : httpsCallable(nom) appelle window.__fonctions[nom](données), écrite par le test.
export function getFunctions() { return {}; }
export function httpsCallable(f, nom) {
  return async (d) => {
    const fn = window.__fonctions && window.__fonctions[nom];
    if (!fn) throw new Error("Fonction serveur absente : " + nom);
    return { data: await fn(JSON.parse(JSON.stringify(d || {}))) };
  };
}
