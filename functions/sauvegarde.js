// Onco360 – copie de secours des fichiers déposés (étape 1.6, 11/10/2026) : logique pure (testée par test-sauvegarde.js).
// Chaque nuit, le stockage du projet (documents déposés, documentation) est recopié dans un second emplacement (autre région) :
// fichier nouveau ou modifié → copié ; fichier disparu → retiré de la copie, mais gardé 30 jours par le second emplacement
// (versions anciennes). Les exports complets (espaces/…/exports/) ne sont pas recopiés : ils sont refaits à la demande.
const garder = (nom) => /^espaces\/[^/]+\//.test(nom) && !/^espaces\/[^/]+\/exports\//.test(nom);

// source, copie : [{ nom, md5 }] → { copier: [noms], retirer: [noms], garde }
// Garde-fou (R-F5, 20/10/2026) : si une grande part des fichiers disparaît d'un coup (plus de 20 fichiers et plus de 10 % de la copie :
// stockage vidé par erreur, mauvais emplacement lu…), rien n'est retiré de la copie cette nuit-là ; garde = { n, total } le signale.
const GARDE = { min: 20, part: 0.1 };
function planCopie(source, copie) {
  const dejaLa = new Map((copie || []).map((f) => [f.nom, f.md5])), src = (source || []).filter((f) => garder(f.nom));
  const noms = new Set(src.map((f) => f.nom)), retirer = (copie || []).map((f) => f.nom).filter((n) => !noms.has(n)), total = (copie || []).length;
  const garde = retirer.length > GARDE.min && retirer.length > total * GARDE.part ? { n: retirer.length, total } : null;
  return { copier: src.filter((f) => dejaLa.get(f.nom) !== f.md5).map((f) => f.nom), retirer: garde ? [] : retirer, garde };
}
// Résultat d'une nuit, noté dans plateforme/sauvegardeFichiers (lu par l'Administration) : { le, copies, retires, erreurs, garde, total, duree }
// Alerte (R-F5) : erreurs, garde-fou déclenché, ou aucun passage depuis 48 h → texte à afficher, sinon ""
function alerteCopie(etat, maintenant) {
  const d = etat && etat.dernier, now = maintenant || Date.now();
  if (!d || !d.le) return "La copie des fichiers n'a encore jamais tourné.";
  const h = (now - new Date(d.le).getTime()) / 36e5, l = [];
  if (h > 48) l.push("aucune copie des fichiers depuis " + Math.floor(h / 24) + " jours (dernière : " + d.le.slice(0, 10) + ")");
  if (d.erreurs) l.push(d.erreurs + " fichier(s) non copié(s) la dernière nuit");
  if (d.garde) l.push(d.garde.n + " fichier(s) sur " + d.garde.total + " ont disparu d'un coup : rien n'a été retiré de la copie (à vérifier)");
  if (d.echec) l.push("la dernière copie a échoué : " + d.echec);
  return l.length ? l.join(" ; ") + "." : "";
}
// Ajoute une nuit au registre (30 dernières gardées)
const noterNuit = (etat, r) => ({ dernier: r, nuits: [r].concat(((etat && etat.nuits) || []).filter((x) => x && x.le !== r.le)).slice(0, 30) });
const nomCopie = (projet) => projet + "-sauvegarde-fichiers";
// Réglages du second emplacement : Pays-Bas (le projet est en Belgique), versions gardées 30 jours, jamais public
const REGLAGES_COPIE = {
  location: "EUROPE-WEST4", storageClass: "STANDARD", versioning: { enabled: true },
  lifecycle: { rule: [{ action: { type: "Delete" }, condition: { isLive: false, daysSinceNoncurrentTime: 30 } }] },
  iamConfiguration: { uniformBucketLevelAccess: { enabled: true }, publicAccessPrevention: "enforced" },
};
module.exports = { planCopie, garder, nomCopie, REGLAGES_COPIE, GARDE, alerteCopie, noterNuit };
