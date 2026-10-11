// Onco360 – numéro des reçus (SA9c, audit externe 11/10/2026) : calculs purs, sans écran ni Firebase, testés par
// tests/moteur/test-recus.mjs. Un reçu = espaces/{e}/recus/{patient}_{clé} (clé « r-RDV » ou « c-LIGNE-CURE-JOUR ») ; numéro
// R-AAAA-NNNN continu pour tout le cabinet, qui repart à 1 chaque année (compteur espaces/{e}/recusCompteur/{AAAA}).

// « R-2026-0001 » (au-delà de 9 999 : « R-2026-10000 »)
export const numeroRecu = (annee, n) => "R-" + annee + "-" + String(n).padStart(4, "0");
// Identifiant du reçu d'une consultation : rendez-vous (rid) ou consultation de chimio (ligne, cure, jour)
export const cleRecuRdv = (rid) => "r-" + rid;
export const cleRecuCons = (lid, n, j) => "c-" + lid + "-" + n + "-" + j;
export const idRecu = (pid, cle) => pid + "_" + cle;

// Réimpression : même montant et même mode de paiement = duplicata (même numéro) ; sinon nouveau numéro, l'ancien est annulé
export function decisionRecu(ancien, m, mode) {
  if (!ancien || !ancien.numero) return "nouveau";
  return Number(ancien.m) === Number(m) && (ancien.mode || "") === (mode || "") ? "duplicata" : "nouveau";
}

// Document du reçu à écrire. ancien = reçu déjà enregistré (ou null), n = numéro tiré du compteur (nouveau seulement),
// o = { pid, nom, etab, cle, d, lib, m, mode, annee, par, parNom, le (ms, pour l'historique des numéros annulés) }
export function recuAEcrire(ancien, o, n) {
  if (decisionRecu(ancien, o.m, o.mode) === "duplicata") return { imp: (ancien.imp || 1) + 1, dernier: o.le, dernierPar: o.par, dernierNom: o.parNom };
  const annules = ((ancien && ancien.annules) || []).concat(ancien && ancien.numero ? [{ numero: ancien.numero, m: ancien.m, mode: ancien.mode || "", le: o.le, par: o.par }] : []);
  return { patientId: o.pid, patientNom: o.nom, etablissementId: o.etab, cle: o.cle, d: o.d, lib: o.lib, m: o.m, mode: o.mode || "",
    annee: o.annee, n, numero: numeroRecu(o.annee, n), imp: 1, par: o.par, parNom: o.parNom, dernier: o.le, dernierPar: o.par, dernierNom: o.parNom, annules };
}
