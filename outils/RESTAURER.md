# Onco360 – récupérer ses données (étape 1.6, 11/10/2026)

Quatre filets, du plus simple au plus complet. Tous ont été essayés : l'export et sa restauration de bout en bout sur les
émulateurs Firebase (`cd tests/regles && npm run export`, 19 vérifications).

| Filet | Quand | Contient | Lisible sans Firebase |
|---|---|---|---|
| **Export complet** (Paramètres › Cabinet › Export des données, médecin titulaire) | à tout moment | toutes les données du cabinet + tableau des patients + PDF déposés + documentation + journal d'audit | ✅ (ZIP : JSON, CSV, PDF) |
| **Copie lisible quotidienne** (Apps Script, Drive › Application Chimio HGC › Sauvegardes › Onco360) | chaque nuit vers 3 h, 30 jours + le 1er du mois | toutes les données du cabinet Bentahila (sans les PDF) | ✅ (JSON) |
| **Copie de secours des fichiers** (`fichiersNuit`, emplacement `chimio-hgc-sauvegarde-fichiers`, Pays-Bas) | chaque nuit vers 2 h 15 | tous les PDF déposés et la documentation de tous les cabinets ; un fichier supprimé y reste 30 jours | ✅ (PDF) |
| **Sauvegarde Firebase** (toute la base) + retour à la minute près | chaque nuit, 14 semaines ; minute près sur 7 jours | toute la base (tous les cabinets) | ❌ (se restaure dans Firebase) |

## 1. Reprendre tout un cabinet ailleurs (nouveau projet Firebase, revente, autre plateforme)
1. Le médecin titulaire fait **Paramètres › Cabinet › Export des données › Exporter tout le cabinet** : un fichier
   `Onco360_export_AAAA-MM-JJ.zip` arrive dans Téléchargements.
2. Pour une **autre plateforme** : tout est dans le ZIP, en formats ouverts (lire `LISEZMOI.txt` dans le ZIP).
3. Pour un **autre projet Firebase** (ou le même, dans un cabinet neuf), depuis le dossier du projet sur le Mac :
   ```
   gcloud auth application-default login          # une fois, avec un compte propriétaire du projet cible
   node outils/restaurer-export.mjs ~/Downloads/Onco360_export_AAAA-MM-JJ.zip <cabinet-cible> --projet <id-du-projet>
   ```
   Le script écrit `espaces/<cabinet-cible>` et toutes ses collections, les profils, le journal d'audit, et remet les PDF dans le
   stockage (chemins adaptés). Variable `STOCKAGE=<nom-du-bucket>` si le stockage du projet n'est pas `<id>.firebasestorage.app`.
4. Recréer les **comptes de l'équipe** (les mots de passe ne s'exportent jamais) : Administration › créer le cabinet / Accès ›
   ajouter les membres, puis relier chaque compte au cabinet restauré (`comptes/{uid}` = { espace, espaces }).

## 2. Retrouver un document déposé effacé (moins de 30 jours)
Console Google Cloud › Cloud Storage › `chimio-hgc-sauvegarde-fichiers` › cocher « Afficher les versions supprimées » ›
`espaces/<cabinet>/patients/<patient>/fichiers/…` › télécharger. (Le stockage principal garde aussi 7 jours de corbeille.)

## 3. Revenir en arrière sur toute la base (erreur grave, données effacées)
```
firebase firestore:backups:list --project chimio-hgc
firebase firestore:databases:restore --project chimio-hgc --backup <nom-de-la-sauvegarde> --database onco360-restauree
```
La restauration crée une **nouvelle** base (`onco360-restauree`) : on y relit ce qu'il faut, la base en service n'est pas touchée.
À la minute près sur 7 jours : Console Firebase › Firestore › « Récupération à un instant donné ».
