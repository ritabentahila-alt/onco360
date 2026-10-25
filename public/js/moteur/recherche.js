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

// 25/10/2026 (demande de Dr Bentahila, U1 revu) : nouvelle ligne, localisation du dossier remplie → liste des protocoles filtrée d'office sur le
// type de cancer (et la localisation quand elle est claire) des indications des protocoles ; [type, localisation | ""], ou null (rien de reconnu).
// L'écran garde « Tous les cancers » pour tout revoir. Seules les valeurs présentes dans la bibliothèque du cabinet sont gardées (filtreValide).
const LOC = [
  [/sein/, "Sein", "Sein"],
  [/jonction oeso/, "Digestif", "Œsophage / jonction – adénocarcinome"], [/oesophag/, "Digestif", ""], [/estomac|gastrique/, "Digestif", "Estomac"], [/colorectal/, "Digestif", "Côlon"], [/colon/, "Digestif", "Côlon"],
  [/rectum/, "Digestif", "Rectum"], [/canal anal/, "Digestif", "Canal anal"], [/pancrea|ampoule de vater/, "Digestif", "Pancréas"],
  [/hepatocellulaire|foie/, "Digestif", "Carcinome hépatocellulaire"], [/voies biliaires|vesicule biliaire|cholangio/, "Digestif", "Voies biliaires / vésicule"],
  [/\bgist\b|stromale gastro/, "Digestif", "GIST"], [/carcinoide bronch/, "Poumon / thorax", ""], [/neuroendocrine|carcinoide/, "Digestif", "Tumeurs neuroendocrines"], [/intestin grele|appendice|carcinose|pseudomyxome/, "Digestif", ""],
  [/ovaire|trompe|peritoine/, "Gynécologie", "Ovaire / trompe / péritoine"], [/endometre|corps de l.uterus|corps uterin/, "Gynécologie", "Endomètre"],
  [/col de l.uterus|col uterin|\bcol\b/, "Gynécologie", "Col de l'utérus"], [/vulve/, "Gynécologie", "Vulve"], [/vagin/, "Gynécologie", ""],
  [/cavum|nasopharynx/, "Tête et cou", "Nasopharynx"], [/vads|orl|cavite buccale|langue|levre|oropharynx|hypopharynx|larynx|fosses nasales|sinus|glandes salivaires|adenopathie cervicale/, "Tête et cou", "VADS"],
  [/mesotheliome/, "Poumon / thorax", "Mésothéliome pleural"], [/thym/, "Poumon / thorax", "Tumeurs du thymus"], [/petites cellules/, "Poumon / thorax", "CBPC"],
  [/cbnpc/, "Poumon / thorax", "CBNPC"], [/poumon|bronch/, "Poumon / thorax", ""],
  [/ewing/, "Sarcomes", "Sarcome d'Ewing"], [/osteosarcome/, "Sarcomes", "Ostéosarcome"], [/liposarcome/, "Sarcomes", "Liposarcome"], [/angiosarcome/, "Sarcomes", "Angiosarcome"], [/sarcome/, "Sarcomes", ""],
  [/vessie|urothel|voies excretrices/, "Urologie", "Vessie / urothélium"], [/prostate/, "Urologie", "Prostate"], [/testicul|germinal/, "Urologie", "Testicule"],
  [/\brein\b|cancer renal|carcinome renal/, "Rein", "Rein"], [/melanome/, "Mélanome", "Mélanome"], [/thyroid/, "Thyroïde", ""], [/\bgliome|glioblastome|tumeur cerebrale|astrocytome/, "Neurologie", ""],
];
export function filtreLocalisation(diag) {
  const d = sa(diag).replace(/œ/g, "oe").replace(/[’']/g, "'"); if (!d.trim()) return null;
  // « non à petites cellules » = CBNPC (jamais CBPC)
  if (/non a petites cellules/.test(d)) return ["Poumon / thorax", "CBNPC"];
  for (const [re, c, o] of LOC) if (re.test(d)) return [c, o];
  return null;
}
// valeurs gardées seulement si la bibliothèque en a (types = valeurs du 1er menu, locs(type) = valeurs du 2e)
export function filtreValide(f, types, locs) { if (!f || types.indexOf(f[0]) < 0) return null; return [f[0], f[1] && locs(f[0]).indexOf(f[1]) >= 0 ? f[1] : ""]; }
