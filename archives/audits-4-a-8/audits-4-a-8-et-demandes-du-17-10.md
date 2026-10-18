# Onco360 – Tout ce qu'il reste à faire : audits n° 4 à 8 et demandes du 17/10/2026 (pour Claude)

Document unique du 17/10/2026. Il remplace, pour le travail de code, tous les fichiers du dossier Drive « Audit » sur les audits n° 4, 5, 6, 7 et 8 (originaux annotés et versions « pour Claude »), et il ajoute les demandes du cabinet du 17/10. L'audit n° 3 (protocoles de chimiothérapie, phase P de FEUILLE-DE-ROUTE.md) n'est pas repris ici : il a déjà été transmis et garde son propre plan.

## 0. À lire d'abord

Projet : Onco360, dépôt ritabentahila-alt/onco360. État du code au départ : commit 645df32 du 13/10/2026 (étape P2, les 14 ordonnances types de chimio). Rien n'a été fait depuis sur les points de ce document : tout est à faire, sauf ce qui est marqué DÉJÀ FAIT.

#### Première session, avant tout code

1. Inscrire ce document dans FEUILLE-DE-ROUTE.md : une phase « R – Retours du 17/10 et audits 4 à 8 », une étape par lot de la partie 2 (A1, A2…), et les décisions de ce document dans la partie « Décisions ». En garder une copie dans archives/ : il ne contient aucune donnée réelle.

2. Ajouter la consigne de vérification (partie 1, règle 1) dans CLAUDE.md, rubrique « Méthode de travail souhaitée », et dans FEUILLE-DE-ROUTE.md, rubrique « Comment on travaille ».

3. Les questions de la partie 10 se posent au début de la session du lot qu'elles bloquent, pas avant.

#### Statuts utilisés

- DEMANDÉ : demande du cabinet du 17/10 ; à coder comme écrit.

- VALIDÉ : réponse explicite « oui » ; à coder comme écrit.

- DÉCIDÉ : le cabinet a laissé le choix, ou a tranché après une question ; à coder comme écrit.

- MODIFIÉ : accepté avec un changement ; coder la version modifiée.

- REFUSÉ : ne pas faire, et ne pas le reproposer.

- NON CONTESTÉ : le cabinet n'a rien dit contre ; à faire, en le signalant dans le compte rendu de la session.

- PRIORITÉ BASSE : à faire, sans urgence.

- À CONFIRMER ou OUVERT : poser la question avant de coder (partie 10).

- DÉJÀ FAIT et INCHANGÉ : rien à coder.

Numéros de ligne : parties 3 et 4 (demandes du 17/10) : commit 645df32. Parties 5 à 9 (audits) : commit 1ad3bde du 13/10 à 1 h 09, sur lequel les audits ont été faits ; le code a peu bougé depuis (P2 seulement), mais chercher par nom de fonction.

## 1. Règles permanentes, pour tout ce qui suit

1. Nouvelle consigne du 17/10 : vérifier tout ce qu'un changement touche. Avant de livrer, vérifier que le changement ne touche que ce qui est visé. S'il touche autre chose (paramétrage, agenda, salle d'attente, Google Agenda, tableau de bord, bilan, droits, impression, tâches automatiques, Administration…), vérifier que tout cela marche encore, avec un test. Toujours vérifier sur ordinateur et sur téléphone (390 px). Vérifier que les modules s'imbriquent : un même fait (un rendez-vous déplacé, une séance validée, un poids saisi) doit être juste partout où il apparaît. La carte des liens ci-dessous sert de liste de contrôle.

2. Ne jamais bloquer un médecin : avertissements d'un clic, aucun motif obligatoire.

3. Rien ne disparaît : quand une disposition change, chaque bouton, onglet, champ et fenêtre d'aujourd'hui reste accessible ; seule sa place change. Thème Onco360 actuel (variables de v2.html, Arial, composants existants) : aucune nouvelle couleur, aucun nouveau style de bouton.

4. Un test écrit avant chaque correction (règle Q1). Avant chaque mise en ligne : bash outils/avant-mise-en-ligne.sh --navigateur, plus --regles si les règles changent.

5. Le bilan reste identique au dirham près, sauf correction voulue, chiffrée avant et après sur le jeu de référence (352 317 DH) et annoncée avant la mise en ligne.

6. Aucune donnée réelle de patient dans le code, les tests, GitHub ni les documents. Les photos envoyées par le cabinet (ticket d'encaissement, calendrier de radiothérapie) montrent de vrais patients : seule leur mise en page est reprise.

7. Les particularités marocaines (CNSS, mutuelles, Solumedrol, Nivestim, arabe classique…) ne sont pas des erreurs.

#### Carte des liens (liste de contrôle de la règle 1)

| Ce qui change | À vérifier aussi |
|---|---|
| Un rendez-vous (créé, déplacé, reporté, annulé, Venu, Non venu) | Dossier (à venir, passé), agenda (toutes les vues, glisser-déposer), salle d'attente, tableau de bord, créneaux et chevauchements, Google Agenda de chaque personne concernée, WhatsApp (confirmation, rappels), prix et bilan, tâches automatiques. |
| Une séance ou une cure de chimio (date, heure, report, validation, poids) | Cure et jour, fiche chimio, agenda, salle, Google Agenda, consultations de chimio et créneaux, honoraires et bilan, alertes cliniques, poids de la fiche, planning de l'infirmière. |
| Une radiothérapie (prescription, étapes, fin) | Consultations hebdomadaires et de fin, tâches fixes, agenda, Google Agenda, documents de RT, bilan (lieu de la RT), droit « radiothérapie : chimio ». |
| La fiche patient | Bandeau et colonne Patient du dossier, Modifier, Afficher, Nouveau patient, impressions (âge, poids, allergie), champs des courriers, export, fiche de la spécialité dans l'Administration. |
| Un paramètre ou une bibliothèque du cabinet | Les écrans qui le lisent, la secrétaire (droit « secrétariat »), le modèle de la spécialité dans l'Administration, les cabinets neufs, l'export. |
| Les droits ou une règle Firestore | tests/regles (npm test), chaque rôle (médecin, secrétaire, infirmière, comptable), Google Agenda (fonction permis). |

## 2. Ordre de travail

Une étape = une session, mise en ligne seule. La phase P (audit n° 3) garde son plan ; les 6 protocoles dangereux sont corrigés depuis P1a, donc le lot A peut passer avant la suite de P. Ordre proposé :

| Lot | Contenu | Partie |
|---|---|---|
| A1 | Bibliothèques du cabinet qui peuvent être écrasées (audit n° 7, point 1 : le défaut le plus grave des audits) | 8 |
| A2 | Google Agenda : séances de chimio et étapes de RT déplacées qui ne bougent pas | 3.1 |
| A3 | Double rendez-vous : créneaux pris par les consultations de chimio et de RT | 3.2 |
| A4 | Salle d'attente à jour sur tous les postes (bouton, chaque minute, dossiers écoutés en direct) | 3.3 |
| A5 | Poids de la fiche = poids de la dernière chimio | 3.4 |
| A6 | Réglages du cabinet Bentahila repris par l'Administration | 3.5 |
| B1 | RCP dans le menu principal, sous Tâches | 4.1 |
| B2 | Alertes cliniques qu'on peut valider | 4.2 |
| B3 | Recherche de patient sur téléphone | 4.3 |
| B4 | Calendrier de fin de radiothérapie | 4.4 |
| B5 | Reçu : nouvelle mise en page, avec le lot F1 de l'audit n° 6 | 4.5 et 7 |
| C | Audit n° 4 : le reste de son ordre de travail | 5 |
| D | Audit n° 6 : lots F2 à F5 | 7 |
| E | Audit n° 7 : le reste de son ordre de travail | 8 |
| F | Audit n° 8 : sauvegarde et restauration | 9 |
| G | Audit n° 5 : disposition du dossier patient (étapes 4.4 a, b, c, e, d) | 6 |

## 3. Corrections demandées le 17/10

### 3.1 (A2) Google Agenda : rendez-vous de chimio et de radiothérapie déplacés

DEMANDÉ. Un rendez-vous de chimio ou de radiothérapie déplacé dans Onco360 ne se déplace pas dans Google Agenda. Vérifier aussi tous les autres types de rendez-vous.

Ce que fait le code. La fonction agendaPatient (functions/index.js l. 171) part à chaque changement du résumé du dossier. Les événements viennent de resume.ag (moteur/agenda.js, evtsAgenda), avec des clés stables : PID|c|ligne|cure, PID|s|ligne|cure|jour, PID|rt|id|scan, deb ou fin, PID|r|id. La fonction appliquer (functions/logique.js l. 211) modifie un événement dont la signature change, par PATCH (modifier, l. 250 ; creer fait aussi un PATCH quand l'identifiant existe déjà, l. 249).

Cause probable, à confirmer par un test. Les séances de chimio et les étapes de RT sont souvent en journée entière (sans heure), alors que les consultations ont toujours une heure. Quand un déplacement ajoute ou retire l'heure (glisser-déposer dans la grille de l'agenda, qui passe toujours une heure ; heure saisie dans « Modifier »), le PATCH envoie start.dateTime alors que l'événement a start.date, ou l'inverse. Google garde les deux, refuse la demande (erreur 400), et appliquer met l'événement de côté sans erreur visible (l. 220, « événement refusé par Google ») : l'événement reste à l'ancienne date. Les consultations ne changent jamais de forme, d'où la différence.

À faire.

- Écrire d'abord le test (functions/test-logique.js, avec le faux Google) : événement en journée entière déplacé avec une heure, et l'inverse. Il doit échouer avant la correction.

- Corriger : dans corps (logique.js l. 195), mettre à null les champs de l'autre forme (start.date et end.date pour un événement à heure ; start.dateTime, end.dateTime et timeZone pour une journée entière), ou envoyer les modifications en PUT (remplacement complet) au lieu de PATCH.

- Ne plus avaler un refus en silence : noter le nombre de refus et le dernier motif dans utilisateurs/{uid}.agendaGoogle, et l'afficher dans Paramètres › Google Agenda (« 2 événements refusés par Google »).

- Un test par chemin de déplacement : chModifierRdvChimio (J1 et J8 / J15, « cette séance seulement » et « décaler la suite » ; chimio.js l. 111 et majSeance l. 658) ; report de cure ; glisser-déposer de l'agenda (agenda.js l. 210 à 214) ; modifierEtapeRT (scanner, 1re séance, fin prévue ; v2.js l. 1592) et les consultations hebdomadaires et de fin de RT qui suivent ; deplacerRdv (consultations) ; report après « Non venu » ; hospitalisation ; échéance d'une tâche ; absences ; écriture par la secrétaire qui n'a que le droit « planning ».

- Si le test ne reproduit pas la panne : lire les journaux de la fonction le jour d'un déplacement (firebase functions:log --only agendaPatient) et l'état de la liaison de la personne (utilisateurs/{uid}.agendaGoogle.erreur), sans rien écrire dans la base en ligne.

Vérifier aussi : couleurs, filtre de chacun, agenda d'un médecin qui ne reçoit que ses rendez-vous (permis), passé jamais effacé, plusieurs cabinets.

### 3.2 (A3) Double rendez-vous : créneaux déjà pris par une consultation de chimio ou de radiothérapie

DEMANDÉ. Reprend et élargit la décision 3 de l'audit n° 4 (constat C3). En prenant un rendez-vous de consultation, les créneaux déjà pris par la consultation d'une séance de chimio ou par une consultation de radiothérapie ne sont pas comptés : un double rendez-vous est possible par erreur.

Ce que fait le code. rdvsDuJour (app/v2.js l. 1488) ne lit que les rendez-vous du dossier qui ont une heure, et creneaux (l. 1495) s'en sert. Les consultations des séances de chimio n'y sont pas : leur heure est dans patients/{id}.heures (choisie : hcm ; sinon affichée : hc, 15 min avant la séance notée par l'infirmière). Les consultations de RT (« En cours de RT », « Fin de radiothérapie ») sont des rendez-vous, mais souvent sans heure.

À faire.

- rdvsDuJour compte aussi la consultation de chaque séance de chimio du jour qui a une heure (choisie, sinon celle placée d'après la séance), avec sa durée (heures.cons.du, 15 min par défaut), et les consultations de RT qui ont une heure. Même filtre par médecin qu'aujourd'hui à partir de 2 médecins.

- Les consultations du jour sans heure (chimio, RT) ne prennent pas de créneau, mais sont listées dans la fenêtre du rendez-vous : « Déjà ce jour-là, sans heure : C3 J1 de … (consultation de chimio) ».

- Un créneau pris s'affiche comme pris, avec ce qui le prend ; le choisir reste possible après un avertissement d'un clic (« Créneau déjà pris par … : garder quand même ? »).

- Partout où l'on place une consultation : Nouveau rendez-vous, Modifier, report après « Non venu », glisser-déposer de l'agenda, heure de la consultation d'une séance de chimio, déplacement d'une consultation de RT.

- « Maintenant » à l'heure du Maroc corrigée (constat C10 de l'audit n° 4).

Vérifier aussi : vues Jour et Semaine de l'agenda, salle d'attente, WhatsApp de confirmation, tests/test_agenda.py.

### 3.3 (A4) Salle d'attente : tout à jour sur tous les postes

DEMANDÉ. Remplace la « priorité basse » de la décision 1 de l'audit n° 4 (constat C1). Pouvoir actualiser la salle d'attente pour que tout se mette à jour, et l'actualiser toute seule chaque minute, pour que tous les postes voient ce qui se passe sans recharger.

Ce que fait le code. demarrerSalle (app/salle.js l. 61) écoute en direct les fiches salle/ du jour ; un dossier n'est relu que si un collègue écrit une de ces fiches. Les dossiers eux-mêmes sont lus une fois à l'ouverture d'Onco360 : un rendez-vous pris sur un autre poste, un « Venu » validé depuis le dossier, une séance validée ou un nouveau patient n'apparaissent qu'au rechargement.

À faire.

- Un bouton « Actualiser » (icône, avec « à jour à 10 h 42 ») dans l'en-tête de la salle : relit les fiches du jour, les dossiers qui ont quelque chose aujourd'hui, leurs prix et encaissements, puis redessine sans perdre l'onglet, le tri, le défilement ni la ligne ouverte.

- La même relecture toute seule chaque minute, suspendue tant qu'une fenêtre est ouverte ou qu'une saisie est en cours, faite juste après.

- Écoute en direct des dossiers modifiés : patients dont maj est postérieur à l'ouverture, dans le périmètre de la personne (mêmes filtres d'établissement que la salle). Chaque dossier changé est relu (doc, P, r). L'agenda, le tableau de bord et le dossier ouvert en profitent aussi. Index composite à ajouter (firestore.indexes.json) ; lecture de la liste vérifiée par un test de règles (tests/regles).

- Coût : une lecture par dossier modifié, jamais une relecture complète.

Vérifier aussi : dossier ouvert par deux personnes (le message « Ce dossier vient d'être modifié » reste juste), bulles du dossier, pastille de la salle, tableau de bord, agenda, rechargement à minuit (nouveauJour), téléphone.

### 3.4 (A5) Poids de la fiche patient = poids de la dernière chimio

DEMANDÉ. Le poids de la fiche patient doit être celui noté à la dernière séance de chimio.

Ce que fait le code. Le poids est noté par séance (cure : c.poids ; J8… : c.sea[j].poids ; validé par la secrétaire : poids et spoids du planning) et repris de séance en séance (moteur/doses.js l. 100). Le poids de la fiche (clinique.poids) ne sert qu'à pré-remplir une nouvelle ligne (chimio.js l. 1047) et n'est jamais mis à jour.

À faire.

- Une seule fonction poidsActuel(P) dans le moteur (règle Q5 : une source par notion) : le poids le plus récent entre celui de la fiche (avec sa date) et ceux des séances saisies ou validées ; elle renvoie le poids, sa date et sa source (« C3 J1 du 29/09 »).

- À la validation d'une séance qui porte un poids, et à l'enregistrement du poids du jour par la secrétaire, écrire clinique.poids et clinique.poidsLe si la personne a le droit « fiche patient » ; sinon au prochain enregistrement par quelqu'un qui l'a. N'écrire que ces champs, sans reconstruire clinique (perte de données corrigée le 12/10).

- Fiche, bandeau du dossier, impressions (âge, poids, allergie), champ {poids} des courriers : le poids actuel, avec sa date.

- Ne change pas, et le vérifier par un test : les doses des lignes en cours (elles partent du poids de la ligne et des séances), l'avertissement d'écart de poids de plus de 10 % (comparé à la séance précédente, doses.js l. 214), l'alerte de perte de poids depuis le début de la ligne, le bilan.

### 3.5 (A6) Réglages du cabinet Bentahila repris par l'Administration

DEMANDÉ. Les réglages modifiés dans le cabinet de Dr Bentahila, notamment les formulaires de consultation, ne se retrouvent pas dans le compte d'administration. Le cabinet Bentahila est le modèle. Pour chaque autre cabinet, le cabinet dira ce qu'il faut reprendre (par exemple : tout, sauf quelques réglages, les correspondants et les tarifs des consultations).

Ce que fait le code. Rien ne remonte d'un cabinet vers l'Administration. La fiche patient et les formulaires de consultation vivent à trois niveaux : le modèle de la spécialité (plateforme/specialites[id].fiche et .consultation, réglés dans Administration › Par spécialité), sa copie dans le cabinet (espaces/{e}.ficheSpe et .consultSpe), et les retouches du cabinet (reglage.fiche et reglage.consultation, les différences seulement). Les changements de Dr Bentahila sont dans ses retouches : le modèle ne les voit pas. Même chose pour les paramètres de départ (PARAMS_SPE, functions/cabinets.js l. 168, dans la bibliothèque bib-oncologie) et pour les bibliothèques (copie du 09/10, déjà noté dans FEUILLE-DE-ROUTE.md « avec P9 »). Les types de consultation (parametres/typesConsult) ne font même pas partie de PARAMS_SPE.

À faire.

- Une fonction serveur réservée à l'Administration, « Reprendre les réglages d'un cabinet comme modèle », source cabinet-bentahila : elle lit les réglages effectifs du cabinet (modèle et retouches) et les écrit dans le modèle de la spécialité d'oncologie : fiche patient, formulaires de consultation et types qui leur sont reliés, types de consultation, paramètres de départ, bibliothèques de prescription, modèles de documents de RT, réglage du cabinet (menu, cartes, fonctions). Avant d'écrire : aperçu des différences, partie par partie ; copie de l'état précédent du modèle ; une ligne dans journalAdmin.

- Jamais copiés vers le modèle : les patients et tout ce qui en dépend, l'équipe et les comptes, les lieux d'exercice, les correspondants, les tarifs, l'identité et l'en-tête du cabinet, les profils et signatures, l'abonnement, Google Agenda, les horaires et absences.

- DÉCIDÉ (le cabinet a laissé le choix à Claude) : reprise à la demande, par un bouton, et non en continu, pour qu'un essai fait dans le cabinet Bentahila ne parte pas aussitôt dans le modèle. L'Administration affiche « Modèle repris le JJ/MM ; N différences depuis ».

- Une seconde fonction, « Appliquer le modèle à un cabinet » : cases à cocher par partie, aperçu des différences, copie de l'état précédent du cabinet. Même règle que l'audit n° 7 pour les bibliothèques : rien de ce que le cabinet a modifié n'est écrasé ; ce qui manque est ajouté. Les parties à reprendre pour chaque cabinet : OUVERT, le cabinet les donnera cabinet par cabinet (question 6). Décochées par défaut : correspondants, tarifs des consultations.

- Les cabinets neufs reçoivent le modèle repris, et non plus la copie du 09/10.

- Les droits ne changent pas : l'Administration n'ouvre aucun cabinet, tout passe par le serveur, comme ficheSpecialite (functions/index.js l. 849).

Vérifier aussi : Administration › Par spécialité, création d'un cabinet (functions/test-cabinets.js), cabinet de démonstration, retouches d'un cabinet gardées, export.

## 4. Ajouts demandés le 17/10

### 4.1 (B1) RCP dans le menu principal, sous Tâches

DEMANDÉ. Sortir l'onglet RCP de la page Tâches et le mettre dans le menu principal, juste sous Tâches.

Ce que fait le code. L'onglet est dans la page Tâches (route #taches/rcp, app/taches.js l. 219 et 281). Le menu vient de MENU (donnees/catalogue.js l. 11) et peut être réordonné par l'Administration (reglage.menu).

- Une entrée « RCP » dans MENU juste après « Tâches », module rcp, route #rcp, avec le même contenu que l'onglet (calendrier des semaines, période, Tous / À faire / Faits, case Fait, impression). L'onglet quitte la page Tâches, puisqu'il a sa page.

- #taches/rcp renvoie vers #rcp (anciens liens, retour du dossier : retourListe de app/rcp.js l. 263).

- Menus déjà réordonnés par l'Administration ou le cabinet : RCP inséré juste après Tâches, comme ordreAvecNouveaux le fait pour la fiche. Module RCP retiré : entrée cachée (body.sans-rcp). MODULE_MENU (donnees/modules.js), menu replié et téléphone. Droits inchangés.

Vérifier aussi : tests/test_cabinets.py (ordre du menu), bouton « + RCP », dossier ouvert depuis la liste des RCP (Décision RCP · Valider · Fermer), RCP dans « Rendez-vous et tâches à venir ».

### 4.2 (B2) Alertes cliniques du tableau de bord : pouvoir les valider

DEMANDÉ. Pouvoir valider une alerte clinique pour qu'elle disparaisse.

Ce que fait le code. alertesCliniques (app/v2.js l. 723) recalcule les alertes à chaque affichage, sans moyen de les écarter.

- Un bouton « Vu » (coche) sur chaque ligne du groupe « Alertes cliniques » (blocAFaire, l. 737).

- Clé de l'alerte : patient, ligne, cure, type et valeur (perte de poids, clairance, bilan). Une alerte vue ne revient pas ; une nouvelle valeur, une nouvelle cure ou un nouveau bilan font une nouvelle alerte.

- Rangement par médecin : utilisateurs/{uid}.alertesVues { clé : date } (chacun écrit déjà sa fiche : aucune règle à changer) ; entrées de plus de 90 jours effacées.

- Un lien « Alertes vues (n) » pour les revoir et les remettre.

Vérifier aussi : compteur du groupe, cloche, patient décédé (toujours sans alerte), téléphone.

### 4.3 (B3) Recherche de patient sur téléphone

DEMANDÉ. Sur téléphone, un petit bouton dans la barre du haut, à côté de la cloche, pour chercher un patient.

Ce que fait le code. La recherche en pilule (#trPil, #trQ, v2.html l. 918) est cachée sous 768 px (v2.html l. 91).

- Sous 768 px, une loupe ronde juste à gauche de la cloche, de la même taille (zone d'au moins 44 px).

- Au toucher, le champ s'ouvre sur toute la largeur sous la barre, clavier ouvert, avec la même recherche (rechercheTete : nom, n° de dossier, téléphone) ; × ou Échap le ferme.

- Cachée pour le comptable, comme la pilule.

Vérifier aussi : 390 px sans débordement, Safari sur iPhone, liste des résultats au-dessus du contenu.

### 4.4 (B4) Calendrier de fin de radiothérapie

DEMANDÉ. Remplace la décision 10 de l'audit n° 4 (« calendrier de RT : ne pas le compléter »). Un calendrier de fin de radiothérapie, à la place du calendrier théorique, sur le modèle de la photo envoyée par le cabinet (un export d'ARIA). Comme Onco360 n'est pas ARIA, le nombre de séances est réparti entre la date de la 1re séance et la date de fin ; s'il y a plus de dates que de séances, on en retire. Le document sert seulement à faire valider la fin de prise en charge par les mutuelles. Pas de « HAL1 » (nom de l'appareil) ; à la place du nom de la radiothérapeute, le nom et le prénom du médecin. Tout tient sur une page A4.

Ce que fait le code. Le document « Rendez-vous de radiothérapie » existe : datesSeancesRT (app/documents.js l. 32), valeursRdv (l. 102), modèle rdv de donnees/modelesrt.js (l. 36, « Calendrier théorique des séances »). datesSeancesRT fait déjà la répartition : jours de séance selon le rythme entre la 1re séance et la fin, jours fériés exclus, surplus retiré à intervalles réguliers en gardant la première et la dernière date. Garder ce calcul.

À faire (mise en page de la photo, rien d'autre n'en est repris) :

- Titre « Rendez-vous du patient ». Dessous, une bande : « Date de début : JJ/MM/AAAA – Date de fin : JJ/MM/AAAA » (1re séance ; fin validée, sinon fin prévue).

- Une ligne : « Patient : NOM, Prénom » · « ID patient : n° de dossier » · « Oncologue : Dr NOM Prénom ».

- Un tableau de 6 colonnes : Date du rendez-vous · Heure du rendez-vous · Durée de l'activité (min) · Activité · Ressource · État du rendez-vous.

- Lignes : la 1re « Mise en place RA », 15 min ; la dernière « Fin de traitement RA » ; les autres « Traitement journalier RA », 20 min. Heure : celle de la 1re séance (debH) sur chaque ligne, vide si elle n'est pas notée. Ressource : NOM Prénom du médecin, sans appareil. État : « Terminé » une fois la fin de radiothérapie validée ; avant, « Prévu » (jamais « Terminé » pour une date à venir).

- Une seule page A4 quel que soit le nombre de lignes : tableau en 9 pt, réduit jusqu'à 7 pt avec un interligne serré au-delà de 40 lignes. Essais à 5, 25, 33 et 39 séances, et en 2 séances par jour.

- Nom dans les listes : « Calendrier de fin de radiothérapie ». Le modèle reste modifiable par le médecin (bibliotheques/courriers, id rt-rdv) ; un modèle déjà modifié par le cabinet n'est pas écrasé : le nouveau est proposé à côté.

- DÉCIDÉ (Claude) : garder en bas, en petit, une ligne : « Dates des séances intermédiaires établies d'après le calendrier ; début, fin et nombre de séances conformes au dossier. » Les dates intermédiaires sont reconstituées : le document ne doit pas laisser croire le contraire, et cette ligne protège le médecin.

Vérifier aussi : documents de RT enregistrés (documentsRT/{…}_rdv), aperçu à l'écran et sur téléphone, marges de Paramètres › Impression, RT en 2 séances par jour, RT sans fin validée.

### 4.5 (B5) Reçu : nouvelle mise en page

DEMANDÉ. À faire avec le lot F1 de l'audit n° 6 (partie 7). Le cabinet a envoyé la photo d'un ticket d'encaissement d'hôpital pour montrer à quoi un reçu doit ressembler.

Ce que fait le code. imprimerRecu (app/v2.js l. 1340) imprime un texte suivi (« Reçu de … la somme de … »), en A5, sans l'en-tête généré (constat C6 de l'audit n° 6).

À faire (mise en page de la photo, A5 portrait, une page) :

- En haut à gauche, le nom du lieu ou du cabinet (en-tête généré des ordonnances, C6) ; en haut à droite, « Date : JJ/MM/AAAA ».

- Au centre, dans un cadre : « REÇU ».

- Un tableau encadré à deux colonnes (libellé, valeur) : N° de reçu (R-AAAA-NNNN, avec « DUPLICATA » ou « remplace le n° … » comme aujourd'hui) ; Patient (NOM Prénom, n° de dossier) ; Médecin (Dr NOM Prénom, la spécialité dessous en italique) ; Prestation (l'acte, par exemple « Consultation d'oncologie médicale », et sa date) ; Encaissement (montant en chiffres, « 400,00 DH », en lettres, et le mode : « Espèces »). En bas à droite, dans un petit cadre, « Visa accueil » : nom de la personne qui a encaissé et heure.

- Sous le tableau : les mentions obligatoires (audit n° 6, réponses 3 et 4 : spécialité, adresse du lieu, IF, TP, ICE, INPE, « Acte exonéré de TVA » si le comptable le confirme), puis « Cachet et signature ».

- Pas de code-barres : rien ne le lit au cabinet.

Vérifier aussi : numérotation (recus/, transaction), duplicata, reçu annulé, reçu de rendez-vous (recuRdv) et de consultation de chimio (recuCons), bouton Encaisser de la salle, téléphone, marges A5.

## 5. Audit n° 4 – Rendez-vous de chimiothérapie et de radiothérapie

#### En une phrase

Le module des rendez-vous est solide pour un médecin sur un poste. Les corrections retenues portent sur le report après « Non venu », les créneaux qui ignorent les consultations de chimio, le lieu et le médecin de chaque événement, la robustesse de l'agenda et les messages WhatsApp en français et en arabe. Plusieurs propositions sont refusées : déplacement automatique des consultations de RT un jour férié, calendrier imprimable de chimio, gestion de l'hôpital de jour. Le calendrier de RT est refait autrement le 17/10 (lot B4).

#### Décisions du cabinet

| N° | Sujet | Statut | Ce qu'il faut faire |
|---|---|---|---|
| 1 | Agenda pas mis à jour en direct entre deux postes (C1) | MODIFIÉ (17/10) | Remplacé par le lot A4 (partie 3.3) : écoute en direct des dossiers modifiés, bouton « Actualiser » et actualisation chaque minute dans la salle d'attente. Ne plus attendre l'étape 5.3. |
| 2 | Report après « Non venu » : médecin et durée perdus (C2) | NON CONTESTÉ | Recopier le médecin et la durée du rendez-vous d'origine ; mêmes contrôles (chevauchement) et même proposition de confirmation WhatsApp que « Nouveau rendez-vous ». Voir aussi la réponse sur le « médecin titulaire ». |
| 3 | Créneaux et chevauchements qui ignorent les consultations des séances de chimio (C3) | VALIDÉ | Compter les consultations des séances de chimio du jour de ce médecin (et les étapes de RT qui ont une heure). Le double rendez-vous reste possible : simple avertissement. Élargi le 17/10 : consultations de RT aussi, et partout où l'on place une consultation (lot A3, partie 3.2). |
| 4 | Lieu de chaque événement | MODIFIÉ | Dans la prescription de radiothérapie, le lieu est pré-rempli avec celui du patient et le médecin peut le changer. Cas réels : patient vu au cabinet et traité dans une clinique ; vu dans une clinique et traité dans une autre. Le lieu de la RT sert à ses étapes, à ses consultations automatiques, au filtre de l'agenda et au {lieu} du WhatsApp. Un lieu facultatif sur un rendez-vous (par défaut celui du patient). Le bilan compte la RT dans le lieu où elle a eu lieu (moteur/finances.js lit déjà r.hop quand il existe, sinon le lieu du patient : il suffit que la prescription l'enregistre). |
| 5 | Médecin de chaque événement (ligne de chimio, RT, consultations automatiques) | NON CONTESTÉ | Un médecin par événement, utilisé par le filtre « Médecin » et Google Agenda. Par défaut : le médecin du patient (voir réponse 1), sinon le médecin connecté. |
| 6 | Consultation hebdomadaire de RT qui tombe un jour férié | MODIFIÉ | Pas de déplacement automatique. La créer quand même sur le jour férié, avec le badge « Férié », et la lister dans « Rendez-vous à décaler » ; le médecin ou la secrétaire la déplace ou l'annule à la main. Aujourd'hui elle n'est pas créée du tout (moteur/rt.js) : c'est ce qu'il faut changer, avec un test. |
| 7 | RT enregistrée par quelqu'un sans le droit « rendez-vous » : consultations figées (C4) | NON CONTESTÉ | N'enregistrer la signature de la RT que si les rendez-vous ont été écrits, et afficher « consultations non mises à jour ». |
| 8 | Un dossier mal formé fait tomber toute la page Agenda (C5) | NON CONTESTÉ | Un try / catch par dossier, comme la salle d'attente ; la ligne fautive notée dans la console. |
| 9 | Lisibilité de l'agenda | VALIDÉ | Contrastes à 4,5:1 (tableau plus bas), hauteur de la grille à la taille de l'écran, « 5 consult. · 8 chimio » dans l'en-tête des jours. Séances sans heure : une puce « 8 séances de chimio » qui ouvre la vue Jour. Dès que l'infirmière note l'heure de la séance, ou que le médecin ou la secrétaire remplit l'heure de la consultation de chimio, la consultation se place dans la grille. |
| 10 | Calendrier de radiothérapie imprimé (« Ressource », ni heure ni lieu) | MODIFIÉ (17/10) | Remplacé par le calendrier de fin de radiothérapie (lot B4, partie 4.4). |
| 11 | Calendrier de traitement imprimable pour la chimio | REFUSÉ | Pas besoin, pour la même raison. |
| 12 | J8 / J15 passé sans validation : disparaît de « Rendez-vous et tâches à venir » | NON CONTESTÉ | Le garder dans la liste avec « en retard », comme le J1 (moteur/agenda.js). |
| 13 | Ligne de chimio arrêtée : ses cures passées disparaissent de l'agenda | VALIDÉ | Ligne arrêtée : n'écarter que les cures à venir, garder les passées. Ligne supprimée : tout disparaît, passé compris. |
| 14 | Messages WhatsApp en français seulement | MODIFIÉ | Chaque message contient deux textes à la suite : français, puis arabe classique (pas de darija). Pas de choix de langue par patient. Les messages de départ (Paramètres › WhatsApp) sont à écrire dans les deux langues. |
| 15 | Confirmation WhatsApp après un report ou un changement de date (cure, séance, étape de RT) | NON CONTESTÉ | Proposer la même confirmation d'un clic, avec « Plus tard ». |
| 16 | Rappels WhatsApp qui réécrivent tout le dossier (C7) | NON CONTESTÉ | Ranger les rappels dans une petite collection à part (comme la salle d'attente), avec sa règle et son test. |
| 17 | Fauteuils de l'hôpital de jour (A3) | REFUSÉ | Onco360 ne gère pas l'hôpital de jour pour l'instant : c'est une application d'aide au médecin. |
| 18 | Délai par défaut de la consultation de suivi après une RT ou une ligne de chimio (A7) | DÉJÀ FAIT | Prévu dans le paramétrage ; rien à décider ici. |
| 19 | Jours d'hospitalisation qui comptent les jours fériés (C9) | INCHANGÉ | Les jours fériés doivent compter (réponse de l'audit n° 6) : ne pas changer moteur/rdv.js. |
| 20 | « 1 jour sur 2 » alterne sur les jours ouvrés | NON CONTESTÉ | Ne pas changer le calcul ; dire dans l'aide que « Jours choisis » donne un rythme fixe (lundi, mercredi, vendredi). |
| 21 | Reste du code (C6 calcul gardé en mémoire, C8 prixRdv et tarH à supprimer, C10 horloge du Maroc, émoji de la fenêtre « Déplacer ») | NON CONTESTÉ | Comme décrit dans le rappel des constats. |
| 22 | Patients à reprogrammer (A8) | NON CONTESTÉ | Liste pour la secrétaire : consultations non venues sans nouveau rendez-vous, séances « absent, sans reporter ». |

#### Réponses aux questions du cabinet

##### 1. « C'est quoi le médecin titulaire ? »

Le titulaire est le médecin propriétaire du cabinet dans Onco360 : celui qui l'a ouvert et porte l'abonnement (champ titulaire de espaces/{cabinet}). Lui seul fait l'export complet, lit le journal d'audit et gère les accès de l'équipe. Dans un cabinet d'un seul médecin, la notion est invisible.

Le problème vient d'ailleurs : un patient n'est rattaché à aucun médecin dans Onco360. Quand un rendez-vous n'a pas de médecin noté, le code l'attribue au titulaire (app/v2.js, medRdv : r.med || titulaireUid()). Dans un cabinet de plusieurs médecins, les reports, les consultations automatiques de RT et les séances de chimio tombent donc tous chez le titulaire.

DÉCIDÉ. Chaque patient a un seul médecin. Ajouter ce champ « Médecin » sur la fiche patient (dans ce document, « médecin du patient » et « médecin référent » désignent la même chose : il n'y a qu'un champ). Quand un médecin crée le dossier, c'est lui par défaut ; quand la secrétaire le crée, elle choisit le médecin du patient (dans un cabinet d'un seul médecin, il est pré-rempli). Modifiable. Il devient le médecin par défaut des rendez-vous, des lignes de chimio, des radiothérapies et des consultations automatiques, à la place du titulaire. Les anciens rendez-vous et dossiers sans médecin restent au titulaire.

#### Points encore ouverts

Aucun : les deux points ouverts de la première version ont reçu leur réponse (décision 6 et réponse 1).

#### Ordre de travail proposé

1. Report après « Non venu » avec médecin, durée, contrôles et confirmation (C2) ; créneaux qui comptent les consultations de chimio (C3, fait dans le lot A3) ; consultation hebdomadaire de RT créée sur un jour férié, marquée « Férié ».

2. Agenda protégé (C5) ; J8 / J15 en retard gardé ; ligne arrêtée qui garde son passé.

3. Médecin du patient (un seul par patient), puis médecin et lieu par événement (lieu de la RT modifiable dans la prescription, repris par le bilan).

4. RT sans droit « rendez-vous » (C4) ; rappels WhatsApp dans leur collection (C7).

5. Messages WhatsApp FR + arabe classique ; confirmations après report.

6. Lisibilité de l'agenda (contrastes, hauteur, puces de chimio).

7. Calcul gardé en mémoire (C6), avec l'étape 5.3 (l'agenda en direct est fait dans le lot A4).

#### Rappel des constats (pour retrouver le code)

| N° | Où (commit 1ad3bde) | Constat |
|---|---|---|
| C1 | app/v2.js l. 179 ; aucune écoute sur les dossiers | Dossiers lus une fois à l'ouverture : un rendez-vous pris sur un autre poste n'apparaît qu'au rechargement. |
| C2 | app/v2.js l. 1467 (report), l. 264 (medRdv) | Le rendez-vous de report n'a ni médecin ni durée ; aucun contrôle de chevauchement, aucune confirmation proposée. |
| C3 | app/v2.js l. 1488 à 1501 (rdvsDuJour, creneaux) | Créneaux et chevauchements ne lisent que les consultations. |
| C4 | app/v2.js l. 1626 ; moteur/rt.js l. 116 | Signature de la RT enregistrée même si ses consultations ne le sont pas. |
| C5 | app/agenda.js l. 59 | Calcul des cures non protégé : une ligne illisible fait échouer toute la page. |
| C6 | app/agenda.js l. 47 à 72 et l. 121 | Toutes les lignes recalculées deux fois à chaque affichage. |
| C7 | app/v2.js l. 583 à 588 | Chaque rappel WhatsApp réécrit le dossier (version + 1). |
| C8 | moteur/rdv.js l. 11 à 17 | prixRdv et tarH ne sont plus appelés et gardent « HGC » en dur : à supprimer (étape 5.1). |
| C10 | app/v2.js l. 1498 | « Maintenant » vient de l'horloge du poste, pas de l'heure du Maroc corrigée. |
| — | moteur/agenda.js l. 43 ; app/agenda.js l. 53 et 58 ; functions/logique.js l. 29 | J8 / J15 en retard ; ligne sans médecin ; ligne arrêtée qui perd son passé. |
| — | app/agenda.js l. 51 ; app/v2.js l. 563 | Filtre de l'agenda et lieu du WhatsApp pris sur le patient, pas sur la RT. |
| — | app/v2.js l. 1303 | Émoji dans la fenêtre « Déplacer le rendez-vous ? » (contraire à la règle 4.3). |

#### Contrastes à corriger (formule WCAG, minimum 4,5:1)

| Élément | Aujourd'hui | Proposé |
|---|---|---|
| Heures de la grille (11 px) | #9AA3B5 sur blanc : 2,5:1 | --doux #64708A : 5,0:1 |
| Séance de chimio | #1F8A4C sur #DFF3E6 : 3,8:1 | #17693A : 5,8:1 |
| Jour férié | #B86E00 sur #FDEFD6 : 3,5:1 | #8F5600 : 5,3:1 |
| Rendez-vous fait (opacité 0,6) | 2,1 à 2,5:1 | Couleur pleine et une coche |

#### Déjà décidé avant l'audit, à ne pas remettre en cause

- Pas de WhatsApp envoyé tout seul (annulé le 13/10).

- Pas de journal des séances de radiothérapie : ARIA fait foi.

- Pas de séance le samedi.

- Fenêtres d'avertissement sans motif à saisir, un seul clic.

## 6. Audit n° 5 – Disposition du dossier patient

Décisions du 13/10 (réponses aux questions de l'audit), revues avec le cabinet sur les maquettes le 13/10 puis le 17/10. Elles remplacent le tableau « Décisions du 13/10 » et l'« Architecture proposée » du fichier d'origine.

#### En une phrase

Aujourd'hui, à 1440 × 900, le dossier fait 2 240 px de haut (2,5 écrans), dont 545 px d'en-tête avant les onglets ; trois zones défilent l'une dans l'autre ; la barre des prescriptions est à 1 385 px et les rendez-vous à venir à 1 503 px. Cible : sur ordinateur, un écran qui ne bouge pas, avec un bandeau en haut, une barre d'actions en bas et des colonnes qui défilent chacune seule. Seule la disposition change.

#### Règles de cette refonte

- Aucun bouton, onglet, champ ni fenêtre ne disparaît : tout change seulement de place. Les boutons d'aujourd'hui restent visibles, Afficher, Journal et Modifier compris (pas de menu « … » qui en cache).

- Thème Onco360 actuel, sans nouveau style.

- Tout le monde voit la même disposition, quel que soit le rôle. Seuls les droits d'aujourd'hui changent ce que chacun voit : par exemple, l'infirmière, qui ne voit pas les consultations, arrive sur l'onglet Chimiothérapie comme aujourd'hui.

- Aucune consultation n'est créée d'office, même si le patient a rendez-vous : c'est toujours le médecin qui la crée.

- Le déroulé de la chimio ne change pas (voir « Prescrire »).

#### Les zones, sur ordinateur

| Zone | Contenu |
|---|---|
| Bandeau (collé en haut, 2 lignes, environ 90 px) | Ligne 1 : une flèche qui replie le menu pour le dossier seulement ; la photo en pastille de 40 px, agrandie au clic ; NOM Prénom, âge, sexe, n° de dossier ; l'allergie en rouge si « oui » ; le statut s'il est décédé ou perdu de vue ; « Chimio C3/6 », « RT en cours » ; « Dossier ouvert par … ». À droite, les boutons d'aujourd'hui : Afficher, Journal, Modifier.Ligne 2, en petit (libellé gris, valeur, séparateur ·) : seulement les champs cochés « en tête » dans le réglage de la fiche (fiche.entetes, départ ENTETE0), rien d'autre. Le poids affiché est le poids actuel avec sa date (lot A5). |
| Colonne de gauche « Patient » (300 px) | En haut, toujours visibles : le résumé du patient (modifiable sur place comme aujourd'hui, hauteur qui suit le texte) et le prochain rendez-vous.Puis des parties dépliables, chacune avec un compteur : Rendez-vous et tâches à venir (avec WhatsApp, Venu, Modifier…) ; Consultations et hospitalisations (venu, non venu, prix, reçu, Encaisser) ; Identité et administratif ; Informations médicales ; Fiche tumeur. Une partie dépliée montre tous ses champs de la fiche, pas seulement ceux du bandeau, avec le même éditeur qu'aujourd'hui. « Tout déplier » en tête de colonne ; parties ouvertes gardées pour chacun. |
| Centre « Travail » | Les onglets d'aujourd'hui, selon les droits : Consultation · Chimiothérapie · Radiothérapie · Documents, sans hauteur propre (c'est la colonne qui défile).Consultation : « + Nouvelle consultation » en tête ; la dernière consultation dépliée, les précédentes en lignes serrées (voir « Les notes ») ; « Notes seulement », « Tout déplier », Imprimer. « Agrandir » donne au centre la place de la colonne de droite. |
| Colonne de droite « Documents » | La visionneuse, ouverte d'office sur le document le plus récent du patient. En tête : nom et date du document ; un menu « Documents (n) » pour en choisir un autre (liste par date, la plus récente en haut, type en étiquette, recherche et menu « Type » d'aujourd'hui, sans onglets par catégorie) ; Agrandir (deux tiers de la largeur) ; le menu d'aujourd'hui (Plein écran, Nouvelle fenêtre, Télécharger). Sans document : la liste vide avec « Déposer un document ».L'onglet Documents du centre reste (dépôt, liste) ; un clic sur un document l'ouvre à droite. Le PDF garde le lecteur du navigateur. |
| Barre d'actions (collée en bas, dans tous les onglets) | À gauche : « Prescrire chimio », « Prescrire RT », puis tous les boutons de la barre des prescriptions d'aujourd'hui (Médic., Ordo. type, Analyses, Examens compl., Courriers, Doc.), avec sous chacun le nombre d'ordonnances déjà faites pour ce patient ; + RCP, + Rendez-vous, + Tâche.À droite, patient ouvert depuis la salle d'attente : « Valider : venu » et « Fermer » (retour en salle sans valider : mêmes fonctions que les bulles Valider et Retour en salle d'aujourd'hui). Dossier ouvert depuis la liste des RCP : Décision RCP · Valider · Fermer. Les bulles flottantes disparaissent, leur contenu est dans la barre. |

#### Prescrire

- Chimio et RT (nouvelle ligne, cure, jour, protocole de la ligne, prescription de radiothérapie) s'ouvrent dans un panneau qui prend la place du centre et de la colonne de droite (environ 1 000 px à 1440 menu replié). Le bandeau, la colonne Patient et la barre restent visibles ; Fermer rend la consultation et le document là où on les a laissés.

- Le contenu et les étapes restent ceux d'aujourd'hui : on ouvre la cure ; si la cure a plusieurs jours, on ouvre le jour, puis on valide le jour ; si elle n'a qu'un jour, le jour s'ouvre directement. Mêmes boutons (Valider, Reporter, Ordonnances, heure…), mêmes questions en petite fenêtre (« Valider quand même ? », heure de la prochaine consultation). Seul le conteneur change : un panneau au lieu de la fenêtre large.

- Ordonnances et courriers (Médic., Ordo. type, Analyses, Examens, Courriers, Doc.) : une fenêtre, comme aujourd'hui, par-dessus le panneau s'il est ouvert ; en la fermant, on retrouve la cure telle qu'on l'a laissée. Au choix du médecin (case dans Paramètres › Impression) : allergie et poids rappelés dans l'en-tête de la fenêtre.

- Petites actions (rendez-vous, Venu et prix, report, annulation, tâche, RCP) : petite fenêtre au milieu, comme aujourd'hui.

- Quitter un panneau avec des changements non enregistrés : « Quitter sans enregistrer ? », rien n'est bloqué.

#### Les notes de consultation

Fermée : une ligne de 28 px, sans cadre : date · type court · début de la note en gris · nombre d'ordonnances · initiales de l'auteur (environ 19 lignes dans la hauteur où 10 cartes tiennent aujourd'hui). Ouverte : la note en pleine largeur, sans colonne de libellés ; l'auteur une seule fois, sur la ligne de titre (sauf pour une ligne écrite par quelqu'un d'autre), avec « Signée le … », Modifier et Supprimer (environ 200 px au lieu de 336). À l'ouverture du dossier, seule la dernière consultation est dépliée.

#### Par taille d'écran

La disposition dépend de la largeur de la zone de contenu (l'écran moins le menu), par requêtes de conteneur : ouvrir ou replier le menu la change toute seule.

| Zone de contenu | Exemples | Disposition |
|---|---|---|
| 1 280 px et plus | 1440 menu replié ; 1680 et 1920 menu ouvert | 3 colonnes : Patient 300 px · Travail (au moins 520 px) · Documents (environ 40 % du reste, entre 420 et 760 px). |
| 940 à 1 279 px | 1440 menu ouvert ; 1366 ; 1280 | 2 colonnes : Travail · colonne de droite à deux onglets, « Patient » (tout le contenu de la colonne de gauche) et « Documents ». |
| Moins de 940 px | Tablette, téléphone | Une colonne, comme aujourd'hui (la page défile). Bandeau réduit collé en haut (sur téléphone : nom, âge, allergie) ; barre collée en bas avec tous ses boutons (icône et libellé court ; la barre défile de côté, aucun bouton caché derrière « Plus ») ; parties dépliables (à venir, passé, fiche) ; loupe de recherche à côté de la cloche (lot B3). |

Hauteur : en dessous de 640 px de haut, retour à la page qui défile, bandeau collé. Menu : chacun garde son choix ; la flèche du bandeau le replie pour le dossier seulement (localStorage). Téléphone : la disposition d'aujourd'hui reste, comme le cabinet l'a constaté sur la maquette ; changent seulement le bandeau réduit, la barre du bas, les parties dépliables et la loupe.

#### Paramètres à modifier

| Où | Ce qui change | Qui règle |
|---|---|---|
| Paramètres › Dossier patient › Fiche patient, et le même éditeur dans Administration › Par spécialité | La case « en tête du dossier » devient « Dans le bandeau » (ligne 2), avec un aperçu du bandeau et un avertissement au-delà d'une ligne ; libellé court facultatif (« Corresp. », « Mut. ») ; valeurs calculées proposées à cocher : poids actuel, SC, « localisation et stade » ; en ligne 1, « Chimio en cours » et « RT en cours », cochés par défaut. La partie d'un champ décide où il se range dans la colonne Patient. | Titulaire ; l'Administration pour la spécialité |
| Nouvel onglet Paramètres › Dossier patient › Affichage du dossier | Pour le cabinet : parties dépliées par défaut. Pour moi : taille de la visionneuse à l'ouverture (colonne ou deux tiers), « Rétablir » les largeurs. | Titulaire ou secrétaire (droit « secrétariat ») ; chacun pour « Pour moi » |
| Rien à régler | Gardé tout seul : parties ouvertes, menu replié dans le dossier, colonne agrandie. | Chacun |
| Paramètres › Impression | Inchangé, plus une case : rappeler l'allergie et le poids dans l'en-tête de la fenêtre d'ordonnance. | Titulaire |
| Administration › fonctions | Les fonctions « prescriptions » cachent les mêmes boutons dans la barre ; le compteur sous les boutons devient une fonction facultative. | Administration |

Rangement : réglages du cabinet dans parametres/reglages (clé dossier, valeurs par défaut dans REGLAGES0) ; réglages personnels dans utilisateurs/{uid}.dossier ; menu replié en localStorage ; bandeau = fiche.entetes existant. Aucune règle de sécurité à changer.

#### Code : construire sans rien casser

- Un conteneur .dos à cinq enfants, dans l'ordre du téléphone (bandeau, patient, travail, documents, barre), placés par grid-template-areas au-delà de 940 puis de 1 280 px de zone de contenu (container-type: inline-size sur #page, puis @container).

- Hauteur en 100dvh ; chaque colonne en overflow-y: auto, min-height: 0, overscroll-behavior: contain ; la barre est une case de la grille, pas un élément en position: fixed (position: sticky en bas sur téléphone).

- Retirer les hauteurs internes : liste des consultations (545 px, .cs-liste), limiterHauteur('rdvListe', 5), onglets Chimio et RT (.o-pan.defile). Sous 940 px : les 10 dernières consultations, puis « Afficher les plus anciennes ».

- Redessin, à faire d'abord : pageDossier redessine tout le dossier et il est appelé 52 fois. Premier temps : noter puis remettre le défilement de chaque zone [data-zone] et le curseur (remplace app/v2.js l. 1101 à 1105). Second temps, avec l'étape 7.2 : zones redessinées seules (zoneBandeau, zonePatient, zoneTravail, zoneDocuments, zoneBarre dans app/dossier.js).

- Panneau : un appel jumeau panneau(html) de fenetre(html, "large"), mêmes boutons et mêmes champs, placé hors de la zone redessinée ; identifiants propres à chaque conteneur (fOk, fErr…) pour qu'une petite fenêtre ouverte au-dessus d'un panneau ne les mélange pas. Déplacer les écrans un par un : nouvelle ligne, cure, jour, protocole, RT.

- Visionneuse : afficherVue (app/fichiers.js) déplacée dans le conteneur de droite.

- Bulles : bullesDossier (salle) et bulleRcp posent leurs boutons dans la barre.

- Bandeau : htmlEnteteFiche garde le choix des champs, avec un rendu en ligne au lieu de la grille.

- Accessibilité : chaque zone est une section avec aria-label ; l'ordre de tabulation suit le HTML ; les zones qui défilent sont atteignables au clavier (tabindex="0").

- Tests écrits d'abord : à 1440 × 900, la page ne défile pas, la barre est visible, chaque colonne défile ; enregistrer une note ou un rendez-vous ne déplace pas les autres colonnes ; à 390 px rien ne change ; test de débordement (28 pages × 5 largeurs) ; Safari (NAVIGATEUR=webkit) ; liste des boutons du dossier comparée avant et après, rôle par rôle (aucun absent) ; bilan inchangé.

#### Ordre de travail (lot G)

| Étape | Contenu |
|---|---|
| 4.4 a | Bandeau et barre d'actions, à toutes les largeurs ; bulles dans la barre ; « Dans le bandeau » dans le réglage de la fiche. |
| 4.4 b | Grille à colonnes, colonnes qui défilent seules, hauteurs internes retirées, positions gardées au redessin. |
| 4.4 c | Contenu des colonnes : colonne Patient (résumé, prochain rendez-vous, parties dépliables), notes en lignes serrées, dernière consultation dépliée. |
| 4.4 e | Panneau de chimio et de RT (après 4.4 b), visionneuse à droite, case « allergie et poids » de la fenêtre d'ordonnance. |
| 4.4 d | Onglet « Affichage du dossier », Agrandir, flèche du menu, tablette, Safari. |

## 7. Audit n° 6 – Finances : prix, caisse, reçus, bilan

#### En une phrase

Les calculs du bilan sont sérieux et restent tels quels. Le cabinet refuse toute la partie « caisse » : le patient paie tout de suite, en espèces, ou ne paie pas (0 DH). Sont retenus : la consultation de chimio comptée jour par jour, le reçu avec l'en-tête généré et les mentions obligatoires, l'avertissement et l'historique quand un prix change après un reçu, et le rapprochement des règlements par clinique.

#### Règle de paiement donnée par le cabinet

- Le patient paie au moment de la consultation, presque toujours en espèces, ou il ne paie pas et le montant est 0 DH. Il n'y a pas de paiement différé à suivre.

- La secrétaire encaisse après que le médecin a validé la consultation (« Venu »), jamais en même temps.

- Consultation de chimio : normalement seul le J1 est payé. Au J8, J15… le tarif affiché à la validation est 0 DH ; le médecin peut le changer, et alors ce montant doit compter dans le bilan.

#### Décisions du cabinet

| N° | Sujet | Statut | Ce qu'il faut faire |
|---|---|---|---|
| 1 | Consultations d'une cure regroupées en un seul acte, à la date du J1, avec un seul mode (C1) | VALIDÉ | Un acte par jour, à sa date, avec son mode. J8 / J15 à 0 DH par défaut (décision du 13/10), modifiable ; un montant saisi compte à sa date. Bilan modifié : chiffre avant et après sur le jeu de référence, annoncé avant la mise en ligne. Cases « Payé » déjà cochées reprises sur le J1. |
| 2 | Montants, cases « Payé », versements et règlements écrits en deux temps, sans transaction (C2, C3, C4) | PRIORITÉ BASSE | Le cabinet indique que la secrétaire encaisse toujours après la validation du médecin : le conflit est rare. Les transactions restent une amélioration de robustesse peu coûteuse, sans changement visible ; à faire sans urgence. |
| 3 | Radiothérapie dans un lieu sans taux de RT : valeurs cachées 60 % / 10 % (C5) | À CONFIRMER | Voir la réponse 2. Proposition : un taux de RT commun à tous les lieux, réglé dans Paramètres, modifiable par lieu ; plus aucune valeur cachée ; si rien n'est réglé, l'acte est marqué « sans tarif ». |
| 4 | Caisse du jour : total par mode, par lieu, par personne (A1) | REFUSÉ | Tout est en espèces ; ne pas compliquer. |
| 5 | Date et auteur de l'encaissement (C7) | REFUSÉ | Pas de paiement différé, donc rien à dater. |
| 6 | Clôture du jour avec écart (A1) | REFUSÉ | Faite à la main par le cabinet. |
| 7 | Registre des reçus (A3) et liste des impayés (A2) | REFUSÉ | Le registre est refusé explicitement ; la liste des impayés n'a pas d'objet puisqu'un patient qui ne paie pas est à 0 DH. |
| 8 | Total du jour par mode en salle d'attente | REFUSÉ | Tout est en espèces. |
| 9 | Reçu sans en-tête quand l'en-tête est « généré » (C6) | VALIDÉ | Le reçu utilise le même cadre que les ordonnances (en-tête et pied). Nouvelle mise en page du 17/10 : lot B5 (partie 4.5). |
| 10 | Identifiants sur le reçu (A6) | DÉCIDÉ | Mettre les mentions obligatoires (réponse 3). Les identifiants se saisissent dans le profil de chaque médecin, à côté de l'INPE qui y est déjà ; l'adresse vient du lieu d'exercice ; Paramètres › Impression ne garde que les cases « imprimer sur le reçu ». Détail dans la réponse 4. |
| 11 | Prix changé après la remise d'un reçu (A4) | VALIDÉ | Avertissement « Un reçu n° … a été remis pour 400 DH », sans blocage, et historique des montants (avant, après, par qui, quand). |
| 12 | Hospitalisation qui compte les jours fériés | INCHANGÉ | Les jours fériés doivent compter : ne pas changer moteur/rdv.js. |
| 13 | RT arrondie au dirham, autres actes au centime | INCHANGÉ | Pas de problème ; ne rien changer. |
| 14 | Rapprochement des règlements par clinique et par mois (A5) | VALIDÉ | Indicateur en lecture seule : reçu, coché « Payé », dû, écart. Pas de pointage en lot. |
| 15 | Relevé du comptable préparé la nuit (A7) | NON CONTESTÉ | Plus tard, par le serveur. |
| 16 | Cases « Payé » dans un seul document (limite de 1 Mo) ; bilan qui lit tous les montants | NON CONTESTÉ | Avec l'étape 5.3 : découpage par année, alerte à 70 %. |
| 17 | Règles : montants lisibles sans limite d'établissement ; reçu annulé non vérifié (C8) | NON CONTESTÉ | Ajouter la limite et le contrôle, avec leurs tests de règles. |
| 18 | Reçu imprimé sans numéro si l'enregistrement du numéro échoue | À CONFIRMER | Le registre étant refusé, proposer seulement une ligne au journal du cabinet (« reçu imprimé sans numéro »), pour que l'incident ne passe pas inaperçu. |

#### Réponses aux questions du cabinet

##### 1. Consultation de chimio (point 1 du tableau)

La règle donnée (J1 payé, J8 / J15 à 0 DH par défaut, modifiable) est déjà celle de l'écran depuis le 13/10. Ce qui reste faux est dans le bilan : toutes les consultations d'une cure y forment un seul acte daté du J1 (moteur/finances.js l. 44). Si le médecin saisit 200 DH au J8 du 5 octobre, le bilan les compte au 28 septembre, avec le mode du J1. D'où la correction C1, dont l'effet sur le bilan sera faible puisque J8 / J15 sont presque toujours à 0.

##### 2. « Tous les lieux portent le même tarif pour les actes de radiothérapie ? »

Oui pour le prix : la liste des actes de RT et leur prix est commune au cabinet (Paramètres › Activités et rémunérations, actes RT et VMAT). Ce qui dépend du lieu, ce sont la part rétrocédée et l'impôt, réglés par lieu et par date. Quand un lieu n'a pas ces taux pour la RT, le code prend en silence 60 % de rétrocession et 10 % d'impôt (moteur/finances.js, ligne des RT : { retro: 60, impot: 10 }), sans la mention « sans tarif ». La proposition du point 3 supprime ces valeurs cachées.

##### 3. Mentions à mettre sur le reçu (« mets ceux qui sont obligatoires selon toi »)

D'après l'article 145 du Code général des impôts, une note d'honoraires de profession libérale porte les mêmes mentions qu'une facture. Pour un reçu de consultation, cela donne :

- déjà imprimés : numéro continu (R-AAAA-NNNN), date, nom du patient, objet de l'acte, montant en chiffres et en lettres, mode de paiement, nom du médecin, ville ;

- à ajouter : spécialité, adresse professionnelle, identifiant fiscal (IF), numéro de taxe professionnelle (TP, ex-patente), identifiant commun de l'entreprise (ICE), INPE (utile pour la mutuelle) ; où les saisir : voir la réponse 4 ;

- mention « Acte exonéré de TVA » : les actes médicaux sont exonérés ; à faire confirmer par le comptable ;

- pas de registre du commerce : un médecin n'est pas commerçant.

Réserve à garder dans le code et l'aide : liste établie d'après le Code général des impôts, à valider par le comptable du cabinet.

##### 4. « Mettre tout ça dans le profil du médecin plutôt ? »

DÉCIDÉ : oui, dans le profil du médecin. Le cabinet a laissé le choix (« fais le mieux »). Raison : ces identifiants appartiennent à chaque médecin, pas au cabinet. Dans un cabinet de plusieurs médecins, chaque reçu doit porter ceux du médecin qui a fait l'acte, comme l'en-tête des ordonnances porte déjà l'INPE du médecin signataire.

- Profil du médecin (Profil & Paramètres › Informations, où sont déjà le nom, l'INPE et la spécialité) : ajouter IF, TP et ICE. Ils sont publiés, comme le reste, dans la carte du médecin (signataires/{uid}) que lit l'impression.

- Lieu d'exercice (Paramètres › Lieux d'exercice) : l'adresse et le téléphone, déjà saisis, servent au reçu.

- Paramètres › Impression : seulement des cases « imprimer sur le reçu » (spécialité, INPE, IF, TP, ICE, mention d'exonération de TVA), comme les cases de l'en-tête des ordonnances.

- Un identifiant vide n'est pas imprimé, et rien ne bloque l'impression du reçu.

#### Lots de travail révisés

| Lot | Contenu | Le bilan change ? |
|---|---|---|
| F1 Reçu | En-tête généré sur le reçu (C6) ; identifiants IF, TP, ICE dans le profil du médecin et cases d'impression dans Paramètres › Impression ; avertissement et historique quand un prix change après un reçu (A4) ; mise en page du lot B5 | Non |
| F2 Consultation de chimio par jour | C1, avec reprise des cases « Payé », chiffre avant et après | Oui, annoncé |
| F3 Rapprochement | Règlements par clinique et par mois (A5) ; relevé du comptable préparé la nuit (A7) | Non |
| F4 Robustesse | Transactions C2 à C4 ; règles C8 ; taux de RT sans valeur cachée (C5, après confirmation) | Seulement C5, si un lieu n'a pas de taux de RT |
| F5 Montée en charge | Cases « Payé » par année, bilan lu depuis l'index (étape 5.3) | Non |

L'ancien lot « Caisse » (caisse du jour, clôture, impayés, registre des reçus, date d'encaissement) est supprimé.

#### Rappel des constats (pour retrouver le code)

| N° | Où (commit 1ad3bde) | Constat |
|---|---|---|
| C1 | moteur/finances.js l. 44 | Consultations d'une cure regroupées en un acte, date du J1, un seul mode. |
| C2 | app/chimio.js l. 154 à 161 (majMontants) | Relit puis écrit, sans transaction. |
| C3 | app/bilan.js l. 138 à 141 et 275 à 283 | Même chose pour les cases « Payé », règlements et versements. |
| C4 | app/chimio.js l. 158 et 159 | Montants et prix à encaisser : deux écritures séparées (writeBatch). |
| C5 | moteur/finances.js l. 60 | RT sans taux : 60 % / 10 % cachés, pas de « sans tarif ». |
| C6 | app/v2.js l. 1340 à 1353 | Le reçu n'utilise pas l'en-tête généré. |
| C8 | firestore.rules l. 236 et 260 à 263 | Montants lisibles sans limite d'établissement ; reçu annulé non vérifié. |
| C9 | moteur/finances.js l. 50 et 63 | Impôt de 10 % par défaut pour la v1 ; arrondi de la RT (étape 5.4). |

#### Déjà décidé avant l'audit, à ne pas remettre en cause

- Pas de saisie manuelle des honoraires de séance.

- Pas de pointage en lot dans le bilan.

- Le bilan reste identique au dirham près, sauf correction voulue et annoncée (référence : 352 317 DH, jeu du 06/10).

- Pas de reçu pour une hospitalisation, ni dans un lieu payé par l'établissement.

## 8. Audit n° 7 – Ordonnances et bibliothèques de prescription

#### En une phrase

Priorités : empêcher l'écrasement des bibliothèques du cabinet ; transformer les « … » et les durées manquantes en zones jaunes « À compléter » vérifiées à la validation ; signaler les doublons ; traiter le débordement de l'A5 ; corriger les fiches listées plus bas ; retirer complètement la signature scannée ; permettre à l'administration d'envoyer des mises à jour de bibliothèque qui n'écrasent rien. Refusés : avertissement « stupéfiant », remplacement de COTIPRED, bilans intercure enrichis, alignement des filgrastims.

#### Déjà fait depuis l'audit

DÉJÀ FAIT Plan P2 : les 14 ordonnances types de chimiothérapie de l'audit n° 3 (5 renommées « Chimio : … », 9 ajoutées), commit 645df32 du 13/10/2026, en ligne (version 20261013b), par appliquerOrdosAudit3 (donnees/ordostypes.js) et ordosAudit3 (app/ordonnances.js). L'audit avait été fait sur le commit précédent (1ad3bde) : ses remarques sur les titres « Chimio : … » et sur P2 sont donc caduques.

Attention : appliquerOrdosAudit3 écrit la liste du cabinet par modifierListe, qui a le défaut d'écrasement décrit au point 1. Vérifier que la mise à jour P2 ne peut pas avoir remplacé une liste de cabinet après une lecture en échec.

#### Décisions du cabinet

| N° | Sujet | Statut | Ce qu'il faut faire |
|---|---|---|---|
| 1 | Liste du cabinet remplacée par la liste de départ après une lecture en échec (lireListe, modifierListe) | NON CONTESTÉ | Distinguer « document absent » (liste de départ, normal) de « lecture en échec » (message « Liste du cabinet illisible, réessayez », aucune écriture). Modification dans une transaction. Touche les six bibliothèques. C'est le défaut le plus grave de l'audit : à faire en premier. |
| 2 | Points de suspension « … » dans 8 fiches (ALER-Z, CAPÉCITABINE ×2, COTIPRED, DEXAMÉTHASONE œdème, LOVENOX, NAVELBINE, TEMODAL adjuvant) | VALIDÉ | Chaque « … » devient une zone jaune « À compléter », le mécanisme des courriers (mark.or-ac) ; « Valider » prévient s'il en reste, sans bloquer. |
| 3 | Durées manquantes (9 fiches de la liste, 12 lignes d'ordonnances types) | MODIFIÉ | Durées par défaut données par le cabinet : stupéfiants 28 jours ; TRAMAL LP 1 mois ; OEDES 3 mois ; BACTRIM FORTE 3 mois ; MAGMINE 3 mois. Pour toutes les autres lignes sans durée : une zone jaune « durée à compléter », même mécanisme que le point 2. |
| 4 | Plusieurs dosages dans un nom (MOSCONTIN LP 10/30/60/100 mg, DUROGESIC 12/25/50, LEVOTHYROX 25/50/100) | VALIDÉ | Une fiche par dosage. Pas de zone à compléter pour le dosage. |
| 5 | Stupéfiants imprimés sur l'ordonnance ordinaire | REFUSÉ | Ni marque « stupéfiant », ni avertissement. L'ordonnance imprimée par Onco360 est un double lisible pour le patient ; l'ordonnance sécurisée (carnet à souches, en toutes lettres, à la main) est donnée en plus. Garder l'ordonnance type « Douleurs – palier 3 ». |
| 6 | COTIPRED à remplacer par SOLUPRED | MODIFIÉ | Ne pas remplacer : les deux existent et sont des variantes. Garder COTIPRED et ajouter une fiche SOLUPRED (prednisolone) 20 mg dans la liste des médicaments (elle n'y est pas, alors que les ordonnances P2 l'utilisent). |
| 7 | Filgrastim : NIVESTIM 3 jours, NEUPOGEN 5 jours | REFUSÉ | Ce sont des ordonnances de commodité ; le médecin modifie ce qu'il veut. |
| 8 | TAVANIC et OFLOCET | VALIDÉ | Corriger selon l'usage recommandé : TAVANIC 500 mg une fois par jour (pas de passage à 250 mg hors insuffisance rénale) ; OFLOCET 200 mg matin et soir. Garder les durées existantes. |
| 9 | EFFIPRED avec l'abiratérone | VALIDÉ | Deux fiches : cancer de la prostate hormonosensible, 5 mg une fois par jour ; résistant à la castration, 5 mg matin et soir. |
| 10 | PRIMPERAN, CLOPRAME (métoclopramide) | VALIDÉ | Limiter à 5 jours, au plus 3 prises de 10 mg par jour (Agence européenne du médicament, 2013). |
| 11 | LOPERIUM et diarrhée retardée de l'irinotécan | VALIDÉ | Ajouter une fiche dédiée : 2 gélules (4 mg) dès la première selle liquide, puis 1 gélule (2 mg) toutes les 2 heures, la nuit 2 gélules toutes les 4 heures, jusqu'à 12 heures après la dernière selle liquide, sans dépasser 48 heures ; au-delà, consulter en urgence. Garder la fiche ordinaire. |
| 12 | XGEVA, PROLIA, ARANESP | VALIDÉ | XGEVA et PROLIA : ajouter « bilan dentaire avant la première injection » et « calcium 500 mg et vitamine D 400 UI par jour, sauf hypercalcémie ». ARANESP : ajouter « si hémoglobine inférieure à 10 g/dl sous chimiothérapie ; réduire ou suspendre au-dessus de 12 g/dl ». |
| 13 | Perfusions dans la liste de ville (IMFINZI, KEYTRUDA, PEMORIAL, ZOMETA) | VALIDÉ | Les garder : l'ordonnance sert à demander la prise en charge. |
| 14 | Médicaments présents seulement dans des ordonnances types | VALIDÉ | Ajouter à la liste : NAUSELIUM (dompéridone) sirop, VITAMINE B12 1 000 µg injectable, SYSMETIX, lavements de sucralfate, crème à l'urée 10 à 30 %. |
| 15 | NOCAND 50 mg sans DCI ni classe ; titre « Douleurs – paliers 1 » | NON CONTESTÉ | Compléter la fiche ; corriger le titre en « Douleurs – palier 1 ». |
| 16 | Doublons quand on combine deux ordonnances types (CHEMOSET, COTIPRED, PARACÉTAMOL) | VALIDÉ | À l'ajout : « PARACÉTAMOL 1 g est déjà dans l'ordonnance : garder les deux / garder une seule ligne ». Avertissement, pas blocage. |
| 17 | Droits de la secrétaire sur les bibliothèques | MODIFIÉ | Elle voit et prescrit, mais ne modifie ni ne supprime rien dans aucune bibliothèque. La règle firestore.rules (bibliotheques : « // b == 'medicaments' ») et le bouton « Nouveau médicament » (ajouteMedic) sont à aligner. Voir point ouvert 1 pour l'ajout. |
| 18 | Mises à jour des bibliothèques par l'administration | VALIDÉ | Voir la section « Mises à jour des bibliothèques ». |
| 19 | Bilans « initiaux » qui contiennent « Bilan lipidique » | VALIDÉ | Remplacer « Bilan lipidique » par ses quatre analyses dans « Bilan chimiothérapie – bilan initial » et « Bilan immunothérapie – bilan initial ». |
| 20 | Bilans intercure (immunothérapie : NFS seule ; chimio : sans bilan hépatique ni magnésium) | REFUSÉ | Choix voulu : chaque analyse est payée par le patient ; le bilan reste minimal, le médecin ajoute ce qu'il faut. |
| 21 | 14 éléments de bilans dont le nom diffère de l'analyse (TSH / TSH us, ionogramme écrit de trois façons…) | VALIDÉ | Harmoniser sur les noms de la liste des analyses. |
| 22 | « Protéinurie des 24 h » rangée en Microbiologie | VALIDÉ | La passer en Biochimie. |
| 23 | Scanners injectés sans précaution | VALIDÉ | Précaution sur les 5 scanners injectés : « créatininémie récente ; signaler une allergie à l'iode ou un traitement par metformine ». |
| 24 | L'A5 déborde sur une 2e page sans nom ni date | DÉCIDÉ | Le cabinet laisse le choix à Claude, sauf le passage automatique en A4 (refusé). Solution retenue : voir la section « Impression ». |
| 25 | Signature scannée | MODIFIÉ | La retirer complètement : plus d'impression de la signature scannée, et plus d'option dans Paramètres › Impression (case eSig, configuration.js). Voir point ouvert 2. |
| 26 | La secrétaire fait, modifie, supprime des ordonnances au nom du médecin | VALIDÉ | Elle peut tout faire : garder les droits actuels. |
| 27 | Alerte allergie par mots seulement, absente sur la ligne libre | MODIFIÉ | Une vérification sur toutes les lignes à l'affichage de l'ordonnance (liste, ordonnance type, ligne libre, suggestion, modification, renouvellement), avec une table de familles. Le cabinet a demandé que Claude établisse la table lui-même : voir « Familles d'allergie ». |
| 28 | Vérification unique avant l'impression | MODIFIÉ | Une seule fenêtre « Corriger / Imprimer quand même » qui regroupe : zones « À compléter » restantes, doublons, allergie, ordonnance sur 2 pages. Pas de contrôle des stupéfiants (point 5). |
| 29 | Ancienne version gardée à chaque modification ; ordonnance « annulée » au lieu d'effacée | NON CONTESTÉ | Comme les reçus annulés. |
| 30 | Renouveler garde l'ancienne ligne âge, poids, allergie (auJour) | NON CONTESTÉ | La refaire depuis le dossier au renouvellement. |
| 31 | Liste des médicaments enregistrée avec la page ; auteur lu sur l'écran ; format A5 / A4 par navigateur | NON CONTESTÉ | Petits correctifs, voir le rappel des constats. |
| 32 | Ajouts (chimio orale calculée, ordonnances du protocole, recherche par médicament, duplicata) | NON CONTESTÉ | Après les corrections. |

#### Mises à jour des bibliothèques par l'administration

VALIDÉ. Règle donnée par le cabinet :

- À la création d'un cabinet, il reçoit toutes les bibliothèques de base (c'est déjà le cas).

- Depuis le compte d'administration, on doit pouvoir envoyer des mises à jour à tous les cabinets, surtout pour la chimiothérapie (protocoles, ordonnances types).

- Une mise à jour n'écrase jamais ce qu'un médecin a modifié dans son cabinet. Elle ajoute seulement ce qui manque : un médicament, une ordonnance type, un protocole qui n'y était pas et que le médecin n'a pas créé entre-temps.

- Si le médecin ne veut pas d'un élément ajouté, il le supprime.

Conséquences pour le code : reconnaître chaque élément de départ par un identifiant stable (pas par sa position) ; ne pas re-proposer un élément que le médecin a supprimé (garder la liste des éléments refusés) ; remplacer remplacerOrdosTypes, qui écrase tout, par cette fusion ; passer par la lecture corrigée du point 1.

Lien avec le lot A6 (17/10) : la reprise des réglages du cabinet Bentahila par l'Administration suit la même règle (rien d'écrasé, seulement ce qui manque). Construire le mécanisme une seule fois pour les deux.

#### Impression : solution retenue pour l'A5

1. Dans l'aperçu, un trait pointillé « fin de la page 1 » à la hauteur exacte de la page imprimée.

2. À la validation, si l'ordonnance dépasse une page : avertissement dans la fenêtre unique (« L'ordonnance tient sur 2 pages : réduire le texte / imprimer quand même »). Jamais de passage automatique en A4.

3. À l'impression sur plusieurs pages : nom du patient et date répétés en haut de chaque page, « page 1 / 2 » en bas, la signature toujours avec le dernier médicament (jamais seule sur une page), un médicament jamais coupé entre deux pages.

Cas d'essai à reprendre (A5, marges par défaut) : Rectite radique et proctologie, Syndrome pieds-mains, Soins de bouche, Radiodermite et soins cutanés, Bilan chimiothérapie – bilan initial, Bilan immunothérapie – bilan initial.

#### Familles d'allergie (table de départ établie par l'audit)

Le cabinet a demandé que Claude valide lui-même cette table. Usage : si l'allergie notée contient un mot d'une famille, tout médicament de la même famille déclenche l'avertissement (toujours un clic, jamais un blocage). À compléter avec les noms réellement présents dans la bibliothèque.

| Famille | Mots de l'allergie | Médicaments qui déclenchent l'alerte |
|---|---|---|
| Pénicillines | pénicilline, amoxicilline, ampicilline | AUGMENTIN, CLAMOXYL, amoxicilline, ampicilline, oxacilline, EXTENCILLINE, ORACILLINE, pénicilline |
| Céphalosporines (allergie croisée possible avec les pénicillines : avertissement « à vérifier ») | céphalosporine, ceftriaxone, céfixime | ROCÉPHINE, ceftriaxone, OROKEN, céfixime, ZINNAT, céfuroxime, céfadroxil |
| Sulfamides | sulfamide, sulfaméthoxazole, Bactrim | BACTRIM, BACTRIM FORTE, sulfaméthoxazole |
| Quinolones | quinolone, fluoroquinolone, lévofloxacine, ofloxacine, ciprofloxacine | TAVANIC, OFLOCET, CIFLOX et leurs DCI |
| Anti-inflammatoires non stéroïdiens | AINS, anti-inflammatoire, ibuprofène, kétoprofène, diclofénac | ibuprofène, PROFENID, kétoprofène, VOLTARÈNE, diclofénac, naproxène, célécoxib |
| Aspirine | aspirine, acide acétylsalicylique | ASPÉGIC, KARDÉGIC, aspirine |
| Produits de contraste iodés | iode, produit de contraste | Examens « injectée » (TDM injectée, uro-TDM, angio-TDM) dans les ordonnances d'examens |
| Morphiniques | morphine, opioïde, codéine, tramadol | MOSCONTIN, SEVREDOL, DUROGESIC, TRAMAL, codéine |

#### Points encore ouverts

1. Ajout de médicaments par la secrétaire : depuis le 10/10 elle pouvait ajouter un médicament à la liste. La réponse « ne peut rien modifier ni supprimer » laisse un doute sur l'ajout. Par défaut, appliquer « aucune modification de la bibliothèque, ajout compris » (elle garde la ligne libre sur l'ordonnance) et le signaler.

2. Signature scannée : faut-il aussi effacer les images de signature déjà enregistrées dans les profils (utilisateurs/{uid}.signature, signataires/{uid}), ou seulement ne plus les imprimer ?

#### Ordre de travail proposé

1. Lecture et écriture sûres des bibliothèques (point 1), avec un test qui simule la panne.

2. Zones jaunes « À compléter » pour les « … » et les durées ; durées par défaut ; vérification unique avant l'impression ; doublons.

3. Impression sur plusieurs pages (section Impression).

4. Corrections de la liste de départ (points 4, 6, 8 à 15, 19, 21 à 23), appliquées aux cabinets par la mise à jour sans écrasement.

5. Outil de mise à jour des bibliothèques depuis l'administration.

6. Retrait de la signature scannée ; droits de la secrétaire sur les bibliothèques (règle et écran).

7. Allergie : toutes les lignes, familles.

8. Traçabilité (versions, « annulée ») ; liste des médicaments enregistrée ; petits correctifs ; ajouts.

#### Rappel des constats (pour retrouver le code)

| Sujet | Où (commit 1ad3bde) | Constat |
|---|---|---|
| Écrasement des listes | app/ordonnances.js lireListe l. 60 à 66, modifierListe l. 73 à 79 | Erreur de lecture avalée : liste de départ affichée puis enregistrée à la place de celle du cabinet. Essai : 2 médicaments du cabinet remplacés par 165 après un clic sur l'étoile. |
| Mise à niveau qui écrase | remplacerOrdosTypes l. 91 à 95 | Remplace toute la liste : ordonnances du cabinet et étoiles perdues. |
| Vérification avant impression | orValider l. 758 à 777 (courriers seulement, l. 761) | Aucune vérification des ordonnances de médicaments. |
| Allergie | moteur/statut.js allergieDans l. 27 à 31 ; appels l. 194 et 257 | Comparaison de mots ; ni la ligne libre (l. 183 à 191, 198 à 202), ni l'ajout d'un nouveau médicament (l. 309) ne sont vérifiés. |
| Modifier / Supprimer | app/consultations.js enregistrerPrescription l. 303 à 306, supprimerPrescription l. 271 à 282 | L'ancienne version n'est pas gardée ; la suppression efface le contenu. |
| Renouveler | auJour l. 645 à 653 | Garde l'ancienne ligne âge, poids, allergie. |
| Signature scannée | cadre et imprimer (l. 733 à 757) ; configuration.js, case eSig ; reglages.js | Ajoutée sous « Cachet et signature » quand l'en-tête est « généré ». |
| Droits secrétaire | firestore.rules l. 144 à 147 ; ajouteMedic l. 41 | La règle permet de réécrire tout le document des médicaments. |
| Petits | par = texte du menu l. 768 ; v2.js journal l. 448 ; fmtStock l. 563 | Auteur lu sur l'écran ; format A5 / A4 retenu par navigateur. |

## 9. Audit n° 8 – Sauvegarde et restauration

#### En une phrase

L'export complet et sa restauration fonctionnent (essai de bout en bout avec le vrai code, sur données fictives), mais il manque la récupération rapide d'un seul dossier ou d'une seule liste. Le cabinet fixe l'objectif à une heure. Il veut aussi un export automatique rangé dans son Drive, proposé aux cabinets clients sur le support de leur choix, et un mode d'emploi écrit. Il refuse la double vérification à la connexion.

#### Décisions du cabinet

| N° | Sujet | Statut | Ce qu'il faut faire |
|---|---|---|---|
| 1 | Délai pour récupérer un dossier effacé | DÉCIDÉ | Une heure. Le script « récupérer un dossier ou un document » devient la priorité, et il doit être utilisable dans ce délai par quelqu'un qui n'est pas développeur (une commande prête à copier, ou mieux un bouton dans l'Administration). |
| 2 | Export automatique rangé hors du projet Firebase | VALIDÉ | Dans le Drive du titulaire. Chaque semaine (fréquence proposée par l'audit, non discutée). |
| 3 | Le proposer aux cabinets clients | VALIDÉ | Oui, sur le support qu'ils choisissent (leur Drive ou autre). Le choix se règle par cabinet. |
| 4 | Mode d'emploi de restauration | VALIDÉ | L'écrire (outils/RESTAURER.md et une version lisible pour le cabinet) : page « En cas de problème » (noter l'heure exacte de l'erreur, ne rien réparer à la main, quel cas renvoie à quelle partie, qui appeler), cas d'un seul dossier, registre des exercices, npm install dans functions/. |
| 5 | Double vérification à la connexion pour le titulaire | REFUSÉ | Ne pas la faire. |
| 6 | Alerte au titulaire à chaque export complet | OUVERT | Pas de réponse (point ouvert 1). |
| 7 | Durées de conservation et loi 09-08 (copies Drive du 1er du mois gardées sans limite) | OUVERT | Pas de réponse (point ouvert 2). |
| 8 | Exercice de restauration chronométré ; lister une fois les sauvegardes Firebase | NON CONTESTÉ | firebase firestore:backups:list --project chimio-hgc, puis restaurer la base de la veille dans une base à côté et noter le temps. |
| 9 | Restauration : refuser un cabinet cible non vide ; recréer les comptes avec leurs identifiants | NON CONTESTÉ | Option explicite pour vider la cible ; firebase auth:export puis auth:import (identifiants et mots de passe chiffrés gardés), ou recréer chaque compte manquant avec le même identifiant et écrire comptes/{uid}. |
| 10 | Copie des fichiers : résultat noté chaque nuit, alerte, garde-fou contre le vidage | NON CONTESTÉ | Résultat (date, copiés, erreurs) dans un document lu par l'Administration ; alerte en cas d'erreurs ou sans passage depuis 48 h ; ne rien retirer de la copie si une grande part disparaît d'un coup. |
| 11 | Export : écriture au fil de l'eau, ordre enregistrer puis effacer, vraies extensions, téléphone en texte | NON CONTESTÉ | Voir le rappel des constats. |
| 12 | Copie Drive v11 au format de l'export (types des dates gardés, journal d'audit inclus) | NON CONTESTÉ | Elle devient réimportable par le même script de restauration. |
| 13 | Script « recopier un cabinet » depuis une base restaurée (erreur qui abîme beaucoup de dossiers) | NON CONTESTÉ | Après le script d'un seul dossier, avec le même code. |

#### Points encore ouverts

1. Alerte à chaque export complet : la question n'a pas reçu de réponse. Ne pas la coder avant d'avoir demandé.

2. Durées de conservation : 30 jours pour un fichier effacé, 14 semaines pour la base, sans limite pour les copies Drive du 1er de chaque mois (qui gardent aussi les patients sortis du cabinet). Est-ce voulu et conforme à ce que le cabinet déclare au titre de la loi 09-08 ? À demander ; ne rien changer en attendant.

3. Qui restaure le jour d'un incident : la réponse est « écrire le mode d'emploi », sans désigner la personne. L'écrire pour quelqu'un qui n'est pas développeur.

#### Ordre de travail proposé

1. Exercice : lister les sauvegardes Firebase et restaurer la base de la veille dans une base à côté, chronométré (rien à coder).

2. Script « récupérer un dossier ou un document » (patient, consultations, montants, reçus, fiches de fichiers, ou un document de bibliothèque), depuis un export ou une base restaurée, en moins d'une heure.

3. Restauration : cible non vide refusée par défaut, comptes avec leurs identifiants ; mode d'emploi.

4. Export automatique hebdomadaire vers le Drive du titulaire ; réglage du support pour les cabinets clients.

5. Copie des fichiers : résultat, alerte, garde-fou.

6. Export au fil de l'eau et petits correctifs ; copie Drive v11.

7. Script « recopier un cabinet » depuis une base restaurée.

#### Les filets en place (état au 13/10/2026)

| Filet | Perte maximale | Ce qu'il ne contient pas | Retour dans Onco360 |
|---|---|---|---|
| Export complet (Paramètres › Cabinet, titulaire) | Tout ce qui suit le dernier export (jamais fait d'office) | Comptes de connexion, liaison Google Agenda | outils/restaurer-export.mjs, une commande ; équipe à refaire |
| Copie Drive de la nuit (Apps Script v10, cabinet Bentahila seul) | Une journée | PDF, journal d'audit, autres cabinets, type des dates | Aucun outil : les dates y sont devenues du texte |
| Sauvegarde Firebase (14 semaines ; à la minute près sur 7 jours) | Une journée, quelques minutes avec la minute près | Fichiers déposés | Base restaurée à côté, puis recopie à la main |
| Copie des fichiers (bucket chimio-hgc-sauvegarde-fichiers, Pays-Bas) | Une nuit ; un fichier effacé reste 30 jours | Les données (seulement les PDF) | Console Google Cloud, fichier par fichier |

Les sauvegardes Firebase et la copie des fichiers sont dans le même projet que ce qu'elles protègent : une suppression du projet les emporte au bout de 30 jours. C'est ce que règle l'export automatique dans le Drive (décision 2).

#### Ce que l'essai a montré

- Essai fait avec le vrai code (exporterCabinet extraite de functions/index.js, exportation.js, restaurer-export.mjs) sur une base et un stockage simulés en mémoire, les émulateurs Firebase n'ayant pas pu être téléchargés. Cabinet de démonstration fictif enrichi.

- Restauration dans un cabinet neuf : 68 documents de 16 collections identiques, dates comprises ; 75 documents, 4 fichiers, 3 profils, 3 lignes d'audit écrits.

- Restauration dans le même cabinet après des changements : ce qui a été créé après l'export reste, ce qui a été supprimé revient, ce qui a été modifié revient en arrière. D'où la décision 9.

- Un document déposé qui n'est pas un PDF (dépôts d'avant le 11/10) est nommé « .pdf » et remis comme PDF.

- Une date sous un nom de champ contenant un point redevient du texte (aucun champ actuel n'est concerné).

#### Rappel des constats (pour retrouver le code)

| Sujet | Où (commit 1ad3bde) | Constat |
|---|---|---|
| Export en mémoire | functions/index.js exporterCabinet l. 1025 à 1068 | Tout le ZIP en mémoire (2 Go, 9 min) : échec estimé vers 1 Go de documents. |
| Ordre effacer / enregistrer | functions/index.js l. 1061 à 1063 | L'ancien export est effacé avant que le nouveau soit enregistré. |
| Extensions | functions/exportation.js cheminFichier l. 46 à 54 ; index.js l. 1053 ; outils/restaurer-export.mjs l. 44 | Tout est nommé et remis en PDF. |
| Téléphones | functions/exportation.js csvPatients | Excel retire le 0 initial : écrire la colonne en texte ou produire un .xlsx. |
| Cible non vide | outils/restaurer-export.mjs restaurer | Écrit par-dessus sans rien effacer. |
| Copie des fichiers | functions/index.js sauvegarderFichiers l. 1074 à 1091 ; functions/sauvegarde.js planCopie | Aucune alerte ; aucun garde-fou si la source se vide. |
| Copie Drive | apps-script/onco360-sauvegarde.gs oncoVal_ l. 33 à 44 | Types perdus (date → texte, référence → vide) ; pas de journal d'audit ; limite de 6 minutes par exécution à surveiller. |
| Mode d'emploi | outils/RESTAURER.md | Ne traite pas le cas d'un seul dossier ; ne dit pas npm install ; « tous ont été essayés » alors que seule la restauration de l'export l'a été. |

## 10. Questions encore ouvertes

À poser au début de la session du lot concerné. En attendant la réponse, faire ce qui est écrit dans la dernière colonne.

| N° | Lot | Question | En attendant |
|---|---|---|---|
| 1 | E (audit 7) | La secrétaire peut-elle ajouter un médicament à la liste du cabinet ? | Aucune modification de la bibliothèque par la secrétaire, ajout compris ; elle garde la ligne libre sur l'ordonnance. |
| 2 | E (audit 7) | Signature scannée : effacer aussi les images déjà enregistrées dans les profils, ou seulement ne plus les imprimer ? | Ne plus les imprimer ; ne rien effacer. |
| 3 | F (audit 8) | Une alerte au titulaire à chaque export complet ? | Ne pas la coder. |
| 4 | F (audit 8) | Durées de conservation (copies du 1er du mois gardées sans limite) : voulues et conformes à ce que le cabinet déclare au titre de la loi 09-08 ? | Ne rien changer. |
| 5 | F (audit 8) | Qui restaure le jour d'un incident ? | Écrire le mode d'emploi pour quelqu'un qui n'est pas développeur. |
| 6 | A6 | Pour chaque autre cabinet, quelles parties du modèle reprendre ? | Correspondants et tarifs des consultations décochés ; le reste coché par l'Administration, cabinet par cabinet. |
| 7 | D (audit 6, décision 3) | Un taux de RT commun, réglé dans Paramètres et modifiable par lieu, à la place des valeurs cachées ? | Ne rien changer. |
| 8 | D (audit 6, décision 18) | Reçu imprimé sans numéro : une ligne au journal du cabinet suffit-elle ? | Faire la ligne au journal. |

