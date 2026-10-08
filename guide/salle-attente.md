# Onco360 – La salle d'attente

Guide d'utilisation (08/10/2026, parties SA1 et SA1 bis). Il servira de base au guide complet d'Onco360 (étape F3).

## À quoi sert la salle d'attente ?
Suivre le passage des patients le jour même, de leur arrivée à la fin de la consultation, sur tous les écrans du cabinet
en même temps : quand la secrétaire met un patient en salle, le médecin le voit tout de suite, sans recharger la page.

## Ce qui apparaît
Menu **Salle d'attente** (entre Agenda et Patients). En haut, la **semaine sur une ligne** (avec le nombre de patients de
chaque jour), les flèches ‹ › pour passer au jour précédent ou suivant, le bouton **Calendrier** pour choisir un jour et
**Aujourd'hui** pour revenir au jour même. Un jour passé montre ce qui reste « À valider » ; un jour à venir se consulte
seulement. La page montre, pour le jour choisi :
- tous les **rendez-vous de consultation** du jour (annonce, suivi, contrôle, en cours de radiothérapie, activités des
  Paramètres) ; les hospitalisations n'y sont pas ;
- les **séances de chimiothérapie** du jour (J1, J8, J15…), car le médecin voit le patient en consultation pour valider
  sa séance.

Le médecin peut choisir un établissement (ou « Tous ») ; la secrétaire et l'infirmière ne voient que leur centre.
La pastille du menu indique le nombre de patients qui attendent.

## Les quatre onglets
- **À venir** : patients attendus, pas encore arrivés. Un patient dont l'heure est passée est signalé « En retard ».
- **En salle d'attente** : patients arrivés (« En attente depuis 12 min », orange à 20 min, rouge à 45 min) et, en haut,
  ceux qui sont **en consultation**.
- **Vus** : consultations validées, avec l'heure, le temps d'attente et la durée de la consultation.
- **Absents**.

Colonnes : heure du rendez-vous, civilité, patient, type, **motif de consultation**, correspondant, mutuelle, heure
d'arrivée, statut, **commentaire** du jour (médecin, secrétaire ou infirmière : crayon ✎), **prix** (médecin et
secrétaire : prix prévu au tarif de l'établissement, en gris ; prix validé, en vert, une fois le patient vu). En bas :
**Encaissé (vus)** et **Prévu (restant)**, sans les absents. Le crayon ✎ à côté d'un prix validé permet de le changer : la
secrétaire le peut aussi, même pour un prix validé par le médecin (et « Modifier le prix » dans le dossier).

Bouton **Colonnes** (en haut à droite) : chacun coche les colonnes qu'il veut voir ; le choix est gardé sur tous ses
appareils. Heure, patient, statut et boutons restent toujours affichés. Dans « À venir », les séances de chimio sont en tête.
Les prix sont toujours affichés en **brut** (les anciens prix HCK repris à 225 DH s'affichent 250 DH).

## Outils de la liste
- **Matinée / Après-midi / Toute la journée** : un clic (avant ou après 13 h ; les séances sans heure restent affichées).
- **Recherche** d'un patient par son nom, **tri** par heure du rendez-vous, heure d'arrivée ou ordre alphabétique (gardé pour
  vous), **Imprimer** la liste du jour (tous les statuts, colonnes affichées).
- **N° d'ordre** : 0001, 0002… donné à l'arrivée (Mettre en salle).
- Couleur de la ligne : bleu en salle, orange en consultation, vert vu, rose absent.
- **Ouvert par …** sous le nom du patient : un collègue a son dossier ouvert en ce moment (bandeau aussi en haut du dossier).

## Payé automatiquement (Paramètres)
Dans Paramètres › Activités et rémunérations, la case **« Payé auto. »** de chaque activité (par établissement) :
cochée, une consultation validée à partir de ce jour compte « Payé (auto.) » dans le bilan ; décochée, vous cochez « Payé »
vous-même dans le bilan quand la clinique a payé.

## Les boutons
| Bouton | Ce qu'il fait | Qui |
|---|---|---|
| **Mettre en salle** | note l'heure d'arrivée et la personne qui a cliqué | médecin, secrétaire, infirmière |
| **Démarrer la consultation** | passe « En consultation » et ouvre le dossier | médecin, secrétaire |
| **Valider** | consultation terminée : fenêtre de prix (tarif proposé, 0 si le patient ne paie pas), puis « Venu » ; séance de chimio : « Venu » de la consultation de chimio | médecin, secrétaire |
| **Retour en salle** | renvoie en salle d'attente sans valider | médecin, secrétaire |
| **Absent** | fenêtre : **reporter le rendez-vous** (nouvelle date et heure ; le prochain jour ouvert est proposé) ou **ne pas reporter** ; le rendez-vous manqué reste « Non venu » | médecin, secrétaire |
| **Annuler** | revient à l'étape précédente | selon l'étape ; la secrétaire n'annule pas un statut posé par le médecin |

- **Cliquer sur le nom** du patient ouvre son dossier **sans changer son statut**.
- Le crayon ✎ à côté du motif permet de le modifier. Le motif se saisit aussi dans la fenêtre du rendez-vous
  (« Motif de consultation »).

## Dans le dossier, pendant la consultation
Quand un patient est « En consultation », deux bulles restent en bas à gauche de son dossier, même en faisant défiler
la page :
- **Valider** : valide la consultation (fenêtre de prix) et revient à la salle d'attente ;
- **Retour en salle** : renvoie le patient en salle d'attente sans valider.

Séance de chimiothérapie manquée : **Absent** ouvre la fenêtre **Reporter** (raison « Patient absent ») : nouvelle date, puis
« cette date seulement » ou « recalculer toute la suite » selon les consignes du médecin ; ou **Absent, sans reporter**. La
date change dans le protocole ; la séance reste dans « Absents » avec « Reportée au … ». Le médecin et la secrétaire le peuvent.

Séance de chimiothérapie : validez d'abord la cure (ou la séance J8, J15…) dans l'onglet Chimiothérapie du dossier, puis
cliquez **Valider** pour la consultation. Si la cure n'est pas encore validée, Onco360 le signale.

## À venir (parties suivantes)
- SA2 : arrivée sans rendez-vous (urgence, passage), réglages (seuils d'attente, ordre de la liste) dans Configuration.
- SA3 : statut et temps d'attente dans l'Agenda et le tableau de bord, message WhatsApp de consignes d'arrivée.
