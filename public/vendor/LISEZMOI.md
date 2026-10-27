# Bibliothèques externes copiées dans le site (étape 1.5, 11/10/2026)

Chargées à la demande par `js/app/fichiers.js` (conversion en PDF des documents déposés) et `js/app/bilan.js` (exports).
Copiées depuis leurs sources officielles pour ne plus dépendre d'un serveur tiers ; empreintes vérifiées le 11/10/2026.

| Fichier | Version | Source | Licence |
|---|---|---|---|
| `jszip.min.js` | 3.10.1 | cdnjs.cloudflare.com (empreinte SRI de cdnjs vérifiée) | MIT ou GPLv3 |
| `html2canvas.min.js` | 1.4.1 | cdnjs.cloudflare.com (empreinte SRI vérifiée) | MIT |
| `mammoth.browser.min.js` | 1.6.0 | cdnjs.cloudflare.com (empreinte SRI vérifiée) | BSD-2 |
| `xlsx.full.min.js` (SheetJS) | 0.20.3 | cdn.sheetjs.com (la 0.18.5 de cdnjs avait la faille CVE-2023-30533) | Apache-2.0 |

Mettre à jour : remplacer le fichier par la nouvelle version officielle, noter la version ici, relancer les tests.

## Icônes et polices (27/10/2026)
- **Icônes Lucide** (symboles `i-…` de v2.html) : https://lucide.dev, licence ISC (© Lucide Contributors ; usage, copie, modification et distribution libres avec cette mention).
- **Polices** dans `polices/` (woff2, sous-ensemble latin, paquets @fontsource 5.0.8) : Montserrat 600 / 700 (SIL Open Font License 1.1), Roboto 400 / 500 / 700 (Apache License 2.0).
