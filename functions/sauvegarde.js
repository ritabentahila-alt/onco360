// Onco360 – copie de secours des fichiers déposés (étape 1.6, 11/10/2026) : logique pure (testée par test-sauvegarde.js).
// Chaque nuit, le stockage du projet (documents déposés, documentation) est recopié dans un second emplacement (autre région) :
// fichier nouveau ou modifié → copié ; fichier disparu → retiré de la copie, mais gardé 30 jours par le second emplacement
// (versions anciennes). Les exports complets (espaces/…/exports/) ne sont pas recopiés : ils sont refaits à la demande.
const garder = (nom) => /^espaces\/[^/]+\//.test(nom) && !/^espaces\/[^/]+\/exports\//.test(nom);

// source, copie : [{ nom, md5 }] → { copier: [noms], retirer: [noms] }
function planCopie(source, copie) {
  const dejaLa = new Map((copie || []).map((f) => [f.nom, f.md5])), src = (source || []).filter((f) => garder(f.nom));
  const noms = new Set(src.map((f) => f.nom));
  return {
    copier: src.filter((f) => dejaLa.get(f.nom) !== f.md5).map((f) => f.nom),
    retirer: (copie || []).map((f) => f.nom).filter((n) => !noms.has(n)),
  };
}
const nomCopie = (projet) => projet + "-sauvegarde-fichiers";
// Réglages du second emplacement : Pays-Bas (le projet est en Belgique), versions gardées 30 jours, jamais public
const REGLAGES_COPIE = {
  location: "EUROPE-WEST4", storageClass: "STANDARD", versioning: { enabled: true },
  lifecycle: { rule: [{ action: { type: "Delete" }, condition: { isLive: false, daysSinceNoncurrentTime: 30 } }] },
  iamConfiguration: { uniformBucketLevelAccess: { enabled: true }, publicAccessPrevention: "enforced" },
};
module.exports = { planCopie, garder, nomCopie, REGLAGES_COPIE };
