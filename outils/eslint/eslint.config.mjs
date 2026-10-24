// S7 (24/10/2026, audit n° 10, Q-b) : variables inconnues, doubles déclarations, clés en double ; rien sur le style (mise en forme : étape 7.2)
import globals from "globals";
// Fonctions posées sur window par un autre fichier du site (appelées sans « window. ») et bibliothèque Google (GIS) : connues au lancement
const SITE = Object.fromEntries(["fermerFenetre", "ouvrirDossier", "google", "anaRetour", "crRetour", "dcRetour", "mdRetour", "otRetour"].map((n) => [n, "readonly"]));
const regles = { "no-undef": "error", "no-redeclare": "error", "no-dupe-keys": "error", "no-dupe-args": "error", "no-unreachable": "error", "no-const-assign": "error", "no-func-assign": "error", "no-import-assign": "error" };
export default [
  { files: ["public/js/**/*.js"], languageOptions: { ecmaVersion: 2023, sourceType: "module", globals: { ...globals.browser, ...SITE } }, rules: regles },
  { files: ["functions/**/*.js"], ignores: ["functions/site/**", "functions/node_modules/**"], languageOptions: { ecmaVersion: 2023, sourceType: "commonjs", globals: { ...globals.node } }, rules: regles },
  { files: ["functions/site/**/*.js"], languageOptions: { ecmaVersion: 2023, sourceType: "module", globals: { ...globals.node } }, rules: regles },
];
