# Onco360 – récupérer ses données (étape 1.6 du 11/10/2026 ; refait le 20/10/2026, lot R-F de l'audit n° 8)

Pour le cabinet (médecin titulaire, sans connaissance technique) : **`guide/en-cas-de-probleme.md`**, aussi dans Onco360 (Paramètres ›
Cabinet › Export des données › « En cas de problème »). Ce fichier-ci est le mode d'emploi **de l'administration** et de dernier recours.

Objectif décidé par le cabinet : **un dossier effacé est récupéré en moins d'une heure**, par quelqu'un qui n'est pas développeur.

## 0. D'abord (quel que soit le cas)
1. Noter **l'heure exacte** de l'erreur (ou la dernière heure où tout était juste) et **ce qui manque** : numéro de dossier (l'Administration
   ne voit jamais les noms), liste, ou « beaucoup de dossiers ».
2. **Ne rien réparer à la main** (pas de dossier ressaisi : la récupération remet tout, ressaisir fait des doublons).
3. Choisir le cas ci-dessous.

| Cas | Qui | Où | Délai |
|---|---|---|---|
| Un dossier ou un document du cabinet (liste, paramètre, protocole) effacé ou abîmé | titulaire, ou Administration (par n° de dossier) | **bouton « Récupérer des données »** (§ 1) | quelques minutes |
| Beaucoup de dossiers abîmés (mauvaise manipulation, import raté) | titulaire ou Administration | même bouton, « Tout le cabinet » (§ 2) | quelques minutes |
| Plus vieux que 7 jours et plus vieux que les exports | Administration | base restaurée à côté (§ 3) | 15 à 45 min |
| Onco360 ne s'ouvre plus | Administration (Mac) | `node outils/recuperer.mjs` (§ 4) | 15 min |
| Cabinet entier perdu, projet Firebase perdu, revente | Administration (Mac) | `node outils/restaurer-export.mjs` (§ 5) | 30 min à 1 h |

## 1. Un dossier ou un document : le bouton « Récupérer des données »
- **Médecin titulaire** : Paramètres › Cabinet › Export des données › **Récupérer des données**.
- **Administration** : admin.html › onglet **Sauvegardes** › « Récupérer des données d'un cabinet » (ou fiche du cabinet › « Récupérer
  des données »). Numéros de dossier et nombres seulement, jamais un nom ni un contenu.

1. **D'où ?**
   - *La base à une heure donnée* : moins de 7 jours, à la minute près (retour à la minute près de Firestore, activé le 06/10/2026).
     Choisir une heure **juste avant** l'erreur.
   - *Un export* : export de la semaine (chaque dimanche, données gardées 14 semaines), export complet fait à la main, ou **copie faite
     avant une récupération** (pour l'annuler).
   - *Un fichier d'export de cet ordinateur* (titulaire) : un ZIP téléchargé ou pris dans le Google Drive (l'export de la semaine y est
     déposé) ; il est ouvert dans le navigateur, seul le dossier choisi est envoyé.
   - *Une base restaurée à côté* (Administration) : voir § 3.
2. **Quoi ?** un dossier patient (nom, n° de dossier ; « effacé » = absent d'Onco360 aujourd'hui), un document du cabinet, ou tout le cabinet.
3. **Voir ce qui serait remis** : tableau par partie (dossier, montants, consultations et ordonnances, documents déposés, RCP, tâches,
   reçus…) : effacé depuis → remis ; modifié depuis → remis comme avant ; **créé depuis → gardé** ; inchangé.
4. **Récupérer** (confirmation). Ce qui se passe :
   - l'état actuel de ce qui va changer est d'abord **copié** (`espaces/<cabinet>/recuperations/<heure>.json.gz`, proposé comme source
     « Copie faite avant la récupération » : la récupération s'annule de la même façon) ;
   - les pièces sont remises ; le dossier reçoit une version plus grande (les postes ouverts voient « Ce dossier vient d'être modifié ») ;
     Google Agenda, tâches automatiques et journal d'audit suivent d'eux-mêmes ;
   - les **PDF** des documents déposés reviennent de la copie de secours des fichiers (30 jours après leur suppression) ;
   - jamais touchés : un **reçu** qui existe (numéros, annulations), l'**équipe et ses droits**, les compteurs, le journal du cabinet ;
   - noté au journal du cabinet (et au journal de l'Administration si c'est elle).
5. Demander au cabinet de **recharger Onco360** et de vérifier le dossier.

## 2. Beaucoup de dossiers abîmés : « Tout le cabinet »
Même bouton, « Tout le cabinet », depuis une heure juste avant le problème (ou l'export de la semaine). **Chaque dossier modifié depuis
reprend sa valeur d'alors** : ce qui a été saisi de juste depuis cette heure-là doit être ressaisi (le dire au cabinet avant ; garder la
copie d'avant pour retrouver ces saisies). Ce qui a été créé depuis reste.

## 3. Plus ancien : la sauvegarde Firebase restaurée À CÔTÉ (14 semaines)
Toute la base est sauvegardée chaque nuit (21 h – 22 h UTC), gardée 14 semaines. On la restaure dans une **autre** base : la base en
service n'est jamais touchée. Depuis le Mac, dossier du projet (Terminal) :
```
firebase firestore:backups:list --project chimio-hgc
firebase firestore:databases:restore --project chimio-hgc --backup <nom-complet-de-la-sauvegarde> --database onco360-restauree
```
(la restauration prend de quelques minutes à une demi-heure ; `firebase firestore:databases:get onco360-restauree --project chimio-hgc`
pour suivre). Puis **Administration › Sauvegardes › Récupérer des données d'un cabinet › « Une base restaurée à côté »** (nom :
`onco360-restauree`), comme au § 1. Une fois fini, supprimer la base à côté (elle est facturée) :
```
firebase firestore:databases:delete onco360-restauree --project chimio-hgc
```

## 4. Onco360 ne s'ouvre plus : la même récupération depuis le Mac
`outils/recuperer.mjs` fait exactement ce que fait le bouton (même code, `functions/sauvegardes.js`). Rien n'est écrit sans `--oui`.
Prérequis, une fois : Node.js ; `cd functions && npm install` ; Google Cloud SDK (`brew install --cask google-cloud-sdk`) puis
`gcloud auth application-default login` avec un compte propriétaire du projet.
```
node outils/recuperer.mjs --cabinet cabinet-bentahila --depuis ~/Downloads/Onco360_export_2026-10-18.zip --liste
node outils/recuperer.mjs --cabinet cabinet-bentahila --depuis heure:2026-10-19T09:30 --dossier 202610003
node outils/recuperer.mjs --cabinet cabinet-bentahila --depuis heure:2026-10-19T09:30 --dossier 202610003 --oui
node outils/recuperer.mjs --cabinet cabinet-bentahila --depuis base:onco360-restauree --document bibliotheques/medicaments --oui
node outils/recuperer.mjs --cabinet cabinet-bentahila --depuis heure:2026-10-19T09:30 --tout --oui
```
`--depuis` : un fichier (ZIP de l'export, `donnees.json.gz`, copie Drive `Onco360_AAAA-MM-JJ.json`), `heure:AAAA-MM-JJTHH:MM` (heure de ce
Mac, moins de 7 jours), `base:<nom>` (§ 3), ou `stockage:espaces/<cabinet>/recuperations/<…>.json.gz` (annuler une récupération).

## 5. Tout un cabinet ailleurs (cabinet effacé, projet Firebase perdu, revente)
1. Prendre le dernier export : **Google Drive du cabinet** › « Onco360 – exports du cabinet » (export de la semaine), ou Paramètres ›
   Cabinet › Export des données › Exporter tout le cabinet. Pour le cabinet Bentahila, la copie de la nuit du Drive (Application Chimio
   HGC › Sauvegardes › Onco360, format de l'export depuis la v11) convient aussi (sans les PDF).
2. Depuis le Mac (prérequis du § 4) :
   ```
   node outils/restaurer-export.mjs ~/Downloads/Onco360_export_AAAA-MM-JJ.zip <cabinet-cible> --projet <id-du-projet> --comptes
   ```
   - le **cabinet cible doit être vide** (sinon refus, rien n'est écrit) : restaurer par-dessus ferait revenir en arrière ce qui a été
     modifié. Pour remplacer un cabinet existant : `--vider` (une copie du cabinet actuel est d'abord écrite dans un fichier
     `avant-restauration-<cabinet>-<date>.json`, dossier courant) ;
   - `--comptes` recrée chaque compte de l'équipe absent avec **le même identifiant** et la même adresse (droits, tâches, rendez-vous
     restent justes), le relie au cabinet (`comptes/{uid}`) et affiche un **lien pour choisir un mot de passe** à envoyer à chacun (les mots
     de passe ne s'exportent jamais). Sans `--comptes`, la liste des comptes absents est affichée. Export d'avant le 20/10/2026 (sans
     adresses) : recréer les membres dans Paramètres › Accès ;
   - variable `STOCKAGE=<nom-du-bucket>` si le stockage du projet n'est pas `<id>.firebasestorage.app` ;
   - ce qui n'est pas dans l'export : la liaison Google Agenda (chacun la refait) et celle du Google Drive (le titulaire la refait).
3. Autre plateforme : tout est dans le ZIP en formats ouverts (`LISEZMOI.txt`).

## 6. Les filets en place (20/10/2026)
| Filet | Fréquence, durée | Contient | Hors du projet Firebase |
|---|---|---|---|
| Base à une heure donnée (retour à la minute près) | 7 jours glissants | toute la base | non |
| Sauvegarde Firebase de toute la base | chaque nuit, 14 semaines | toute la base (tous les cabinets) | non |
| **Export de la semaine** (`exportsHebdo`, dimanche 1 h 30) | données 14 semaines dans Onco360 ; le dernier ZIP ; **Google Drive du cabinet** : 4 à 52 semaines (réglé par le titulaire, 12 par défaut) | tout le cabinet + PDF + journal d'audit | **oui (Drive)** |
| Export complet à la demande (titulaire) | le dernier | idem | oui une fois téléchargé |
| Copie de la nuit du Drive (Apps Script v11, cabinet Bentahila) | chaque nuit vers 3 h, 30 jours + le 1er du mois sans limite | toutes les données + journal d'audit, sans les PDF | **oui (Drive)** |
| Copie de secours des fichiers (`fichiersNuit`, 2 h 15) | chaque nuit ; un fichier supprimé y reste 30 jours | tous les PDF de tous les cabinets | non (autre région) |

Une suppression du projet Firebase emporte, au bout de 30 jours, tout ce qui est « non » : d'où l'export de la semaine dans le Drive.
Surveillance : Administration › **Sauvegardes** (copie des fichiers : dernier passage, erreurs, garde-fou ; export de la semaine de
chaque cabinet) ; alerte rouge en haut de l'onglet Cabinets (aucune copie depuis 48 h, erreurs, garde-fou déclenché, export de la
semaine en échec ou absent depuis 8 jours, dépôt Drive en échec) ; garde-fou et erreurs aussi au journal de l'Administration.
Durées de conservation : inchangées (décision du 20/10/2026, question 4) ; à revoir avec le juriste (loi 09-08).

## 7. Mettre en place (une fois, avant la première utilisation en ligne)
- **Google Drive** (export de la semaine) : API Google Drive activée dans le projet (Console Google Cloud › API et services › Bibliothèque
  › « Google Drive API » › Activer) et autorisation `.../auth/drive.file` ajoutée à l'écran de consentement « Onco360 » (non sensible :
  pas de vérification Google). Puis chaque titulaire : Paramètres › Cabinet › Export des données › « Relier mon Google Drive ».
- **Copie de la nuit v11** : Apps Script « Chimio HGC » › remplacer le texte par `apps-script/onco360-sauvegarde.gs` › Enregistrer ›
  lancer une fois `installerSauvegardeOnco360`.

## 8. Registre des exercices
| Date | Exercice | Durée | Résultat |
|---|---|---|---|
| 11/10/2026 | Export complet puis restauration dans un cabinet neuf (émulateurs) | — | identique, dates comprises |
| 13/10/2026 | Audit n° 8 : même chose avec le vrai code sur données simulées | — | identique ; restaurer par-dessus fait revenir en arrière (d'où R-F3) |
| 20/10/2026 | Lot R-F sur les émulateurs (`cd tests/regles && npm run export`, 73 vérifications) : dossier effacé récupéré depuis un export (moins d'une minute), depuis la base à une heure donnée (consultation effacée revenue), depuis un fichier, par l'Administration (sans nom), tout le cabinet ; cabinet non vide refusé ; comptes recréés avec leur identifiant ; garde-fou de la copie des fichiers | < 1 min par récupération | bon |
| à faire (R-F1) | **Exercice réel chronométré** : `firebase firestore:backups:list --project chimio-hgc`, restaurer la sauvegarde de la veille dans `onco360-restauree`, récupérer un dossier fictif par l'onglet Sauvegardes, noter le temps, supprimer la base | | reporté le 20/10/2026 (Dr Bentahila) |

**Ce qui a été essayé** : tout ce qui précède sur les émulateurs Firebase (`npm run export`) et sans Firebase (tests de `functions/`,
`tests/moteur/test-copie-drive.mjs`). **Pas encore essayé en vrai** : la restauration d'une sauvegarde Firebase dans une base à côté (§ 3,
exercice R-F1) et le dépôt dans un vrai Google Drive (à la première mise en ligne).
