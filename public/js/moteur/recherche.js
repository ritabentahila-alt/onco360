// T1 (24/10/2026, audit n° 11 U2) : tri des protocoles trouvés par une recherche. Les noms qui COMMENCENT par le mot cherché d'abord (« EC » :
// EC 90/600), puis ceux qui commencent par ces lettres (ECF), puis ceux qui contiennent le mot entier, puis les autres ; ordre alphabétique
// dans chaque groupe. Calcul pur, testé par node tests/moteur/test-recherche.mjs.
const sa = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
export function rangNom(nom, q) {
  const n = sa(nom).trim(), mots = sa(q).split(/\s+/).filter(Boolean); if (!mots.length) return 0;
  const tout = mots.join(" "), m0 = mots[0], motEntier = new RegExp("(^|[^a-z0-9])" + m0.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "($|[^a-z0-9])");
  const debut = n.startsWith(tout) ? tout : n.startsWith(m0) ? m0 : "";
  if (debut && !/[a-z0-9]/.test(n.charAt(debut.length))) return 0; // commence par le mot entier (« EC 90/600 »)
  if (debut) return 1; // commence par ces lettres (« ECF »)
  if (motEntier.test(n)) return 2; // contient le mot entier (« … après EC »)
  return 3;
}
export function trierRecherche(liste, q, nomDe) {
  const nom = nomDe || ((p) => p.nom);
  return liste.slice().sort((a, b) => rangNom(nom(a), q) - rangNom(nom(b), q) || nom(a).localeCompare(nom(b), "fr", { sensitivity: "base" }));
}
// T1 (U4) : nombre de cures proposé : celui réglé dans le protocole (nbc), sinon « × 4 » écrit dans le nom ou le rythme, sinon 6
export function curesProposees(p) {
  if (p && +p.nbc > 0) return +p.nbc;
  // « × 4 » = nombre de cures ; pas « 300 mg × 2/j » (deux prises par jour) ni « 150 mg × 2 »
  const nb = (t) => { const re = /[×x]\s?(\d{1,2})\b/g; let m; while ((m = re.exec(t))) { const av = t.slice(0, m.index), ap = t.slice(m.index + m[0].length); if (!/^\s*(\/|fois|par\b|prises?)/i.test(ap) && !/(mg|µg|ml|ui|g)(\/m²|\/kg)?\s*$/i.test(av)) return +m[1]; } return 0; };
  const n = nb(String((p && p.nom) || "")) || nb(String((p && p.r) || ""));
  return n > 0 && n <= 40 ? n : 6;
}
