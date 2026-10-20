# Audit n° 10 – texte lisible, avec les réponses de Dr Bentahila (20/10/2026)

Copie texte du .docx du même dossier (tableaux aplatis : une cellule par ligne).

Audit n° 10 – Bilan d'Onco360 et décisions à prendre
Oct 20, 2026 · 
En bref
La phase R est presque finie : 45 étapes sur 46 sont en ligne depuis le 18/10. Il reste l'exercice de récupération chronométré (R-F1). Tout le reste du plan (qualité, code, conformité, cession) n'a pas commencé. C'est la phase C, le juriste, qui bloque l'arrivée d'un nouveau cabinet. Le code n'y est pour rien.
Ce qui est livré tient. Sur une copie propre du code (version 20261020j), les tests de calcul et ceux des fonctions serveur passent, sauf trois (voir À reprendre), et l'analyse automatique du code ne trouve aucune variable inconnue. Trois choses sont à reprendre :
	•	l'heure du Maroc fausse d'une heure sur les ordinateurs pas à jour ;
	•	trois mises en ligne faites sans le contrôle complet ;
	•	des tests qui ont encore besoin d'une copie des vrais dossiers.
5 000 dossiers : Onco360 les ouvre, mais lentement (environ 13 s de calcul à chaque ouverture, plus sur téléphone). Les traitements de nuit doivent être découpés par cabinet avant le 2e cabinet.
Ajouté le 20/10 au soir : Administration, bibliothèque et sécurité entre cabinets. La bibliothèque a un vrai danger : 5 protocoles prescrivent un anticorps deux fois le même jour (décision 26). L'étanchéité entre cabinets tient, mais votre compte de tous les jours peut nommer un administrateur (36).
Ajouté ensuite le 20/10 : calcul des doses, vigilances, impressions, parcours, accessibilité, vitesse, arabe, sécurité du site, coûts, cession et juriste. Les formules de dose sont justes, mais l'arrondi au mg entier fausse 5 lignes de 9 à 33 % (44). Aucun code piégé ne s'exécute. Firebase coûte environ 3 dollars par mois et par cabinet.
Phase
Fait
Ce qui reste
R Retours du 17/10 (audits 4 à 8)
45 sur 46, en ligne du 18 au 20/10
R-F1 (décision 9)
P Protocoles (audit 3)
13 sur 15
P0 (décision 1), P1 (décision 10)
Audit n° 9 Radiothérapie (19/10)
pas encore dans la feuille de route
lots RT-1 à RT-6 (décisions 4 et 5)- on ne fait pas audit N9 
Q Qualité
0 sur 6
jeu fictif, journal des erreurs (décisions 7, 21)
M Métier
0 sur 2 (4.4 remplacée par le lot R-G)
écran de l'infirmière (décision 11)
D Design
0 sur 2 (contrastes de l'agenda faits en R-C6)
152 fenêtres grises du navigateur
E Code et exploitation
0 sur 6 (morceaux faits en R-A4, R-C7, R-D3, R-D4)
montée en charge 5.3 (décisions 23 à 25)
C Conformité
0 sur 7
juriste, société, domaine (décisions 16 à 18)
V Cession
0 sur 4
après C
Les décisions sont numérotées dans la partie suivante. Les autres parties ne les répètent pas, elles y renvoient par leur numéro.
Décisions à prendre
Soixante-deux questions, une par ligne : chaque ligne est une proposition, « Oui » veut dire d'accord. Choisissez Oui ou Non dans la dernière colonne. La colonne Conseil donne l'avis de Claude.
Les lignes 1 à 5 touchent les soins, 6 à 9 la méthode, 10 à 15 le plan, 16 à 22 le nouveau cabinet, 23 à 25 les 5 000 dossiers.
N°
Proposition
Conseil
Réponse
1
Corriger tout de suite les deux défauts restants de l'audit 2 (P0) : la fenêtre « carboplatine contre-indiqué » s'affiche deux fois, et une créatinine aberrante (0,7 mg/L) n'est signalée qu'à la validation, pas à la saisie.
Oui
oui]
2
Heure du Maroc : le Maroc est revenu à GMT le 20/09/2026, mais Onco360 prend l'heure du Maroc dans l'ordinateur, qui ajoute encore 1 h s'il n'est pas à jour. Proposition : Onco360 compte lui-même en GMT, sans dépendre de l'ordinateur.
Oui
Oui mais suivre les changements d’heure marocaine (plusieurs dans l’année)
3
NOCAND 50 mg a été rangé en fluconazole, déduit par Claude de la posologie (50 mg pendant 7 jours). Est-ce juste ?
À vous
oui
4
Audit n° 9, lot RT-1 avant le reste de l'audit 9. Il corrige le module actuel : séances reçues et motif d'arrêt à la clôture, compte rendu et compteur justes, 1re séance un jour férié signalée.
Oui
non
5
Audit n° 9 : revenir sur le « pas d'organes à risque » du 11/10 pour une bibliothèque de contraintes de dose.
Non pour l'instant (personne pour les relire)
[non]
6
Contrôle complet avant chaque mise en ligne, même quand c'est pressé (3 mises en ligne du 20/10 sans lui).
Oui
oui
7
Tests sur des patients fictifs seulement (Q-a). Plus aucune copie des vrais dossiers dans les tests, et le test du bilan (352 317 DH) refait sur un jeu fictif figé.
Oui
[oui
8
Réparer ou retirer les tests qui échouent depuis des jours : test_comptable (6 échecs), test_cabinets (2 depuis le 11/10), test-demo.
Oui
[oui]
9
Exercice R-F1 cette semaine : un dossier effacé exprès dans le cabinet de démonstration, que vous récupérez seule en moins d'une heure.
Oui
[oui]
10
Abandonner P1 « Corrections proposées » : le 13/10 vous avez choisi d'appliquer sans fenêtre, et les ordres 1 à 3 sont appliqués.
Oui
[oui]
11
Abandonner 3.8, l'écran de l'infirmière (plan de soins, poches, constantes), trop proche de l'hôpital de jour refusé le 17/10. « Marquer administrée » reste.
Oui
[oui]
12
Question 6 : chaque autre cabinet reçoit tout le modèle, sauf les correspondants et les tarifs des consultations.
Oui
[oui
13
Question 8 : un reçu imprimé sans numéro laisse une ligne au journal du cabinet (c'est déjà fait ainsi).
Oui
[oui]
14
Calendrier de fin de RT : garder la petite ligne « dates intermédiaires établies d'après le calendrier », ajoutée par Claude pour vous protéger.
Oui
[non l’enlever encore une fois cest juste pour envoyer a la CNSS pour fermer le dossier]
15
Faire valider par votre comptable les mentions du reçu (article 145 du CGI) et la case « Acte exonéré de TVA », avant tout cabinet client.
Oui
[enlever cette phrase,, elle ny est pas sur le recu que j’ai vu de cheikh khalifa que je taais envoyé dapres ce que je me rappelel verifie]
16
Aucun cabinet réel avant l'avis du juriste : le gel 0.5 est maintenu.
Oui
[non, a des amis pour tester]
17
Lancer le juriste cette semaine : CNDP (données de santé, hébergement en Belgique), contrat de sous-traitance, conditions d'utilisation.
Oui
[non plus tard apres avoir essayer le logiciel a 2 3 medecin pour voir ce qu’il en est et faire des modification]
18
Avant le 1er client : une société éditrice, un projet Firebase et un nom de domaine à son nom. L'adresse actuelle, chimio-hgc.web.app, porte le nom de votre hôpital.
Oui
[oui]
19
Importer les patients d'un autre logiciel par un fichier Excel (identité, diagnostic, n° de dossier), avant le 1er cabinet.
Oui
[oui]
20
Premier cabinet = un pilote gratuit d'un mois, chez un médecin que vous connaissez, avec un point chaque semaine.
Oui
[oui voir meme gratuit tous le temos ]
21
Journal des erreurs en ligne (Q-c) avant le 1er cabinet. Sans lui, on ne voit pas leurs pannes.
Oui
[oui]
22
Guide de démarrage, 2 pages pour le médecin et 2 pour la secrétaire, illustré avec le cabinet de démonstration.
Oui
[oui]
23
Ranger les photos des patients à part (Cloud Storage) dès maintenant : chaque photo, environ 50 Ko, est chargée à chaque ouverture d'Onco360.
Oui
[oui]
24
Traitements de nuit un cabinet à la fois, avant le 2e cabinet réel.
Oui
[oui]
25
Étape 5.3 complète (index léger, liste par pages, dossier chargé à l'ouverture) avant qu'un cabinet dépasse 1 500 dossiers.
Oui
[oui]
Suite : les lignes 26 à 35 portent sur la bibliothèque, 36 à 43 sur l'Administration et la sécurité entre cabinets.
N°
Proposition
Conseil
Réponse
26
Corriger tout de suite les 5 protocoles où un anticorps est prescrit deux fois le même jour (trastuzumab ou cétuximab), puis vérifier les patients déjà sous ces protocoles.
Oui
[oui]
27
Valider « KEYNOTE-A18 – phase 2 », créé le 18/10 sans le statut qui le rend prescriptible.
Oui
[oui]
28
5-FU en diffuseur : partout la dose totale du diffuseur, la dose par jour en remarque.
Oui
[oui]
29
Séparer « Letrozole ou Fulvestrant + Palbociclib + Zometa » en deux protocoles, et corriger « Fulvesteant ».
Oui
[oui]
30
Solumedrol de J1 avec le carboplatine : 80 mg partout (règle du 13/10), sauf les protocoles hebdomadaires.
À vous
[oui]
31
Acide folinique : 400 mg/m² partout, à la place des 50 mg en dose fixe de 14 protocoles.
À vous
[oui si cest la reference verifie les protocoles en ligne]
32
« Cisplatine 20 + Vinorelbine 15 hebdomadaire + RT » : la bonne dose de vinorelbine est-elle 15 mg/m² (Oui) ou 10 mg/m² (Non) ?
À vous
[verifie en ligne si tu vois 15 c’est 15 si c’est 10 c’est 10]
33
Immunothérapies : écrire la durée maximale en remarque (par exemple 2 ans de pembrolizumab), sans rien bloquer.
Oui
[oui en fonction de l’indication ]
34
Compléter ZOMETA (créatinine, dose selon la clairance, bilan dentaire, calcium et vitamine D) et NAUSELIUM (durée maximale).
Oui
[oui fais le selon les recommendations]
35
Faire tourner le contrôle automatique de cet audit à chaque modification de protocole et avant chaque copie vers le modèle : un avertissement d'un clic, jamais bloquant.
Oui
[oui]
36
Votre compte de tous les jours ne peut plus écrire la liste des administrateurs (console seulement). Il ne lit plus que les profils de votre équipe. Il est reconnu par son identifiant, pas par son e-mail.
Oui
[pour moi cest sur firebase que je nomme l’email del ‘administrateur, pas sur mon compte onco360 avec l’email ritabentahila@gmail.com non ? donc meme si je laisse session onco360 ouverte compte medecin on ne peut pas aller sur compte admin qui a un autre email et autre mot de passe que j’ai defini sur firebase]
37
Double vérification (code sur téléphone) pour le seul compte d'administration. Elle a été refusée pour les médecins, mais ce compte peut réécrire tous les cabinets.
Oui
[non flemme
38
Prévenir le titulaire, sur son tableau de bord et dans son journal, chaque fois que l'Administration écrit dans son cabinet.
Oui
[oui
39
Cabinet suspendu = lecture seule et export permis, au lieu d'un accès coupé.
Oui
[oui
40
Suppression d'un cabinet : export final remis au médecin, puis 30 jours d'attente avant l'effacement.
Oui
[oui
41
Page « État de la plateforme » dans l'Administration : traitements de nuit, échecs, exports, refus de Google.
Oui
[oui
42
Ajout d'un membre : messages neutres, et la personne déjà inscrite ailleurs accepte l'invitation avant d'entrer.
Oui
[oui
43
Appliquer pour de bon la politique de sécurité du site (Q-e), comme deuxième verrou, et ajouter une politique des permissions (caméra, micro).
Oui
[oui
Suite : les lignes 44 à 48 portent sur les doses et la vigilance, 49 à 56 sur les impressions et l'usage, 57 à 62 sur la sécurité, les coûts, la cession et le juriste.
N°
Proposition
Conseil
Réponse
44
Régler une décimale (0,1 mg) sur les 5 lignes mal arrondies (vincristine d'EMA-CO, trabéctédine, dactinomycine, lurbinectédine, vinblastine). Appliquer aussi les décimales aux doses en mg/kg.
Oui
[oui
45
Avertissement d'un clic quand la créatinine est sous 7 mg/L avant un carboplatine (clairance sans doute surestimée), sans changer le calcul.
Oui
[oui
46
Traitements en cours choisis dans la liste des médicaments, et plus seulement tapés en texte libre, pour que les interactions soient toujours vues.
Oui
[non
47
Ajouter les interactions manquantes (vinca + azolés, taxanes et irinotécan + CYP3A4, tamoxifène + paroxétine ou fluoxétine, pémétrexed + AINS, 5-FU + brivudine), le topotécan et l'acide zolédronique au rein, l'albumine et la clairance de la trabéctédine.
Oui
[oui, aussi dans parametrage
48
Compter l'épirubicine à 0,8 doxorubicine (Feijen 2019) au lieu de 0,5 (RCP) pour la dose cumulée.
À vous
Oui selon la reco internationale 
49
Fiche de chimio : nom du patient et titres des colonnes répétés en haut de chaque page.
Oui
[oui
50
Reçu toujours sur une seule feuille A5, même avec toutes les mentions.
Oui
[oui A5 de preference , reduire la police ou autre pour tout faire rentré sur A5
51
Ne jamais imprimer « À compléter » : ligne laissée vide, comme pour les documents de RT.
Oui
[oui
52
Ordonnance A5 : marges latérales ramenées à 15 mm avec l'en-tête généré, après avoir mesuré votre papier à en-tête (question 1 du 11/10).
Oui
[oui
53
« Cures à valider » du tableau de bord ouvre directement la cure à valider : 2 gestes au lieu de 4.
Oui
[oui
54
Étape 4.1 maintenant : contrastes, étiquettes des champs, zones de 44 px sur téléphone, lignes cliquables utilisables au clavier, sans changer la disposition.
Oui
[oui
55
Code rassemblé en un seul fichier gardé en cache entre deux versions : ouverture suivante sous la seconde, plus de numéro de version à changer à la main.
Oui
[oui
56
Messages en arabe : les 3 retouches proposées, et un avertissement quand le français change sans l'arabe.
Oui
[oui
57
Case « poste partagé » à la connexion : la session se ferme avec le navigateur, sur ce poste seulement. Sans la case, rien ne change (pas de déconnexion automatique).
À vous
[oui mais tres rare que deux personnes avec onco360 se connecte sur le meme poste
58
Mots de passe : 10 caractères au moins partout (réglage Google), et protection contre la recherche des adresses inscrites.
Oui
[non
59
Mettre mammoth à jour (1.11.0) et limiter la clé web de Firebase à l'adresse du site dans la console Google.
Oui
[oui
60
Alerte de budget Google (par exemple 20 $ par mois), et export de la semaine qui n'envoie plus que les PDF nouveaux.
Oui
[oui
61
Préparer la cession dans cet ordre : jeu fictif, README et installation sur un projet vierge, mise en forme automatique, découpage de v2.js.
Oui
[oui, pour l’instant pas projet de vendre maiso n peut preparer ca en avance
62
Vérifier dès maintenant que votre propre cabinet a l'autorisation CNDP « suivi des patients » (question 1 du juriste), même sans vendre Onco360.
Oui
[on verra pour ca plus tard
À reprendre
Sept points sont en ligne mais mal faits ou laissés en plan. Le plus urgent est l'heure : elle peut être fausse d'une heure dès aujourd'hui.
Point
Ce qui a été vu le 20/10
Décision
Heure du Maroc fausse d'une heure
Le Maroc est à GMT depuis le 20/09/2026. Le navigateur Chromium 141 donne encore GMT+1 pour Casablanca, et le serveur aussi (Node 22). Sont touchés : l'arrivée et l'attente en salle, « à jour à », le Visa accueil du reçu, le créneau « maintenant », le changement de jour (à 23 h au lieu de minuit). Les rendez-vous et Google Agenda ne sont pas touchés. La note « À placer » de la feuille de route croit l'inverse : c'est le serveur à jour qui a raison.
2
Mises en ligne sans contrôle complet
20261020e (WhatsApp), 20261020i (rapprochement retiré) et le réglage en miroir. Elles ont été faites « à la demande de Dr Bentahila », contre la règle du 17/10 : « vérifier tout ce qu'un changement touche, avec un test ».
6
Tests qui ont besoin des vrais dossiers
Sur une copie propre, test-bilan et test-salle ne tournent pas sans tests/seed.json, une copie d'une vraie sauvegarde. test-releve saute 7 vérifications sur 24. Les 71 tests du navigateur lisent la même copie. Le chiffre de référence (352 317 DH) n'est donc vérifiable que sur votre Mac.
7
Tests en échec laissés tels quels
test_comptable : 6 échecs depuis avant le 18/10. test_cabinets : 2 depuis le 11/10. test-demo plante quand la bibliothèque n'a pas un protocole attendu (demo.js, ligne 24), et un cabinet de démonstration plante de la même façon. Un test toujours rouge n'alerte plus personne.
8
Traitements de nuit pour tous les cabinets d'un coup
Tâches automatiques et Google Agenda : 5 min en tout pour tous les cabinets. Export de la semaine : 30 min. Cela suffit aujourd'hui, pas avec plusieurs cabinets (partie 5 000 dossiers).
24
Feuille de route pas à jour
P1 est toujours prévu, alors que vous avez refusé la fenêtre le 13/10. 4.4 n'est pas cochée alors que R-G l'a remplacée. L'audit n° 9 n'y est pas. Les questions 1 et 2 du 11/10 (marges du papier, purge GitHub) attendent toujours.
10
Fenêtres grises du navigateur
152 aujourd'hui (45 alertes, 103 confirmations, 4 saisies), contre 123 le 11/10. Le nouveau code en ajoute encore, malgré l'étape 4.2.
—
À vérifier par vous, sans rien coder :
	•	☐ Comparer l'heure d'arrivée affichée en salle avec l'heure de votre téléphone.
	•	☐ Le premier relevé du comptable fait la nuit (21/10, 2 h 45) : est-il là le matin ?
	•	☐ Le premier export de la semaine vers votre Drive (25/10, 1 h 30) : est-il dans Paramètres › Export des données le lundi ?
Ce qui va bien : sur 25 noms signalés par l'analyse du code, aucun ne manque vraiment (tous existent au lancement). Les 16 tests de calcul qui ne dépendent pas des vrais dossiers passent, de même que 12 des 13 tests des fonctions serveur.
Pas encore fait
Il reste 29 étapes au plan, plus l'audit n° 9. Voici l'ordre proposé, en quatre vagues. Les numéros entre parenthèses renvoient aux décisions.
	•	Cette semaine (court, sécurité)
	•	P0 (1), heure du Maroc (2), lot RT-1 (4), exercice R-F1 (9).
	•	Tests sur jeu fictif et tests en échec (7, 8) ; ESLint ajouté au contrôle avant mise en ligne (Q-b : il passe déjà).
	•	Avant le premier cabinet (produit)
	•	Journal des erreurs (21), import Excel (19), guide de démarrage (22).
	•	Photos rangées à part (23), traitements de nuit par cabinet (24).
	•	Q-d, contrôle des dossiers au chargement : un dossier enregistré puis relu ne perd aucun champ.
	•	En même temps, hors code
	•	Juriste, société, domaine (16 à 18) : étapes 0.5, 6.1, 6.2, 6.4, 6.5.
	•	Comptable pour le reçu (15).
	•	Questions du 11/10 : mesurer les en-têtes du papier (marges A5, A4) ; demander à GitHub la purge des copies (fiche d'incident 0.5).
	•	Ensuite
	•	Montée en charge 5.3 (25).
	•	Audit n° 9, lots RT-2 à RT-6, selon votre tri des 36 schémas.
	•	Design 4.1 et 4.2 : les 152 fenêtres grises par lots, en commençant par la chimio.
	•	Code 5.1, 5.2 (réglages et listes encore écrits sans relecture), 5.4 (restes de l'ancienne application, dont l'impôt de 10 % des hospitalisations v1 laissé par R-D3).
	•	Recette 5.5 : projet Firebase de test ; bibliothèque Firebase du site 10.12.2 à mettre à jour.
	•	Hors ligne 5.6, CSP Q-e, contenus 6.3, test d'intrusion 6.6.
	•	Phase V (cession, 7.1 à 7.4).
En attente d'une demande d'un cabinet client : l'export de la semaine vers un autre support que Google Drive (OneDrive, Dropbox).
Refusé ou adapté par Dr Bentahila
D'après la feuille de route du 20/10, aucun refus n'a été remis au plan. Seul l'écran de l'infirmière, proche d'un refus, est encore prévu (décision 11). Ce qui est refusé ne doit plus être reproposé.
Date
Refusé
Adapté (fait autrement)
11/10
Déconnexion automatique, double authentification, Google Agenda sans nom, archivage des patients, original Word ou Excel gardé, organes à risque, tableau des toxicités de RT, journal des séances de RT (ARIA fait foi).
« Supprimer le patient » reste une suppression. Bandeau rouge d'allergie seulement si « oui ». Note signée sans verrou (« modifiée le … »). Confirmation au-delà de 22 Gy par fraction ou de 80 Gy. Gynécologie gelée, médecine générale gardée.
13/10
Relecture par un deuxième oncologue, double contrôle avant préparation, WhatsApp envoyé tout seul (3.17), format du papier choisi tout seul (3.18), case « EMEND prescrit », mention « hors référentiel », fenêtre pour les corrections de l'audit, motif pour « Valider quand même », contrôle automatique des prémédications.
EMEND remplacé par CHEMOSET hors très émétisant. Solumedrol 80, 60 ou 50 mg selon le protocole. NIVESTIM 30 MU jusqu'à 70 kg, 48 MU au-dessus. eviQ et « HGC » retirés. Consultation de J8 / J15 à 0 DH.
17/10
Déplacement automatique des consultations de RT un jour férié, calendrier imprimable de chimio, fauteuils et hôpital de jour, toute la « caisse » (caisse du jour, clôture, registre, impayés), avertissement « stupéfiant », remplacement de COTIPRED, NIVESTIM et NEUPOGEN alignés, bilans intercure enrichis, double vérification à la connexion, code-barres sur le reçu, passage automatique en A4.
Un seul médecin par patient. Lieu de chaque événement. Consultation de RT un jour férié créée avec un badge. WhatsApp en français puis en arabe classique. Calendrier de fin de RT à la place du calendrier théorique. Seul le J1 est payé. IF, TP, ICE dans le profil. Secrétaire sans modification de bibliothèque. Signature scannée retirée. Export de la semaine dans le Drive. Dossier : même disposition pour tous, aucune consultation créée d'office, téléphone inchangé.
18 au 20/10
Rapprochement des règlements (les cliniques paient des mois après l'acte), alerte à chaque export, « Prescrire chimio / RT » dans la barre du bas (rendus aux onglets).
Modèle des cabinets neufs = copie ponctuelle (rien ne part tout seul), écran refait en 3 étapes. Vos messages WhatsApp = la référence. Fiche patient modifiée une partie à la fois. Explications derrière un « ? ». Durées de conservation inchangées en attendant le juriste. Taux commun de la RT réglable (60 % / 10 %). Récupération depuis son compte ou par l'Administration.
Arrivée d'un nouveau cabinet
Techniquement, un cabinet se crée en quelques minutes et reçoit votre bibliothèque. Il ne faut pas encore le faire : le juriste n'est pas consulté, le projet et l'adresse sont à votre nom, et il n'y a ni import, ni guide, ni journal des erreurs.
Le parcours d'aujourd'hui
	•	Administration › Nouveau cabinet : nom, médecin, e-mail, pack, essai de 30 jours. Une facture est créée à chaque paiement.
	•	L'Administration crée le lien du premier mot de passe et l'envoie au médecin. Ce lien n'est possible que pour un compte jamais utilisé.
	•	À la première connexion, la carte « Bienvenue » du tableau de bord donne 5 étapes : profil, lieu d'exercice, tarifs, équipe, Google Agenda.
Reçu d'office (copie du modèle)
À régler par le cabinet
Protocoles, ordonnances types, médicaments, analyses, examens, courriers et documents de RT
Profil du médecin : INPE, IF, TP, ICE, accord « Je soussigné(e) »
Fériés, diagnostics, mutuelles
Lieux d'exercice : il en faut un pour créer un patient
Fiche patient, formulaire et types de consultation, tableau de bord
Tarifs des consultations et des séances
Messages WhatsApp (vos textes)
Équipe, Google Agenda, export de la semaine vers son Drive
Actes et tarifs de RT de votre cabinet, taux 60 % / 10 %
Correspondants, marges d'impression, vérification des tarifs de RT copiés
Ce qui bloque
	•	Juridique : le gel 0.5 interdit tout cabinet réel. Les données de santé seraient hébergées en Belgique (Firebase, europe-west1), ce que la CNDP doit connaître. Il n'existe ni conditions d'utilisation, ni politique de confidentialité, ni contrat de sous-traitance (décisions 16, 17).
	•	Propriété : les cabinets clients seraient dans votre projet Firebase « chimio-hgc », et le lien du mot de passe renvoie à chimio-hgc.web.app (18). Google peut aussi demander de vérifier l'application avant d'ouvrir l'agenda et le Drive à d'autres comptes : à regarder dans sa console avec la politique de confidentialité.
	•	Produit : un cabinet qui vient d'un autre logiciel repart de zéro, sans import (19). Il n'a pas de guide (22), et ses pannes resteraient invisibles (21). L'heure peut être fausse (2).
	•	Exploitation : les traitements de nuit sont communs à tous les cabinets (24). La question 6 attend toujours (12).
Plan d'action
	•	Maintenant, hors code : juriste et comptable (15, 17), société éditrice, projet Firebase et domaine à son nom (18). Les délais de la CNDP sont à demander au juriste.
	•	En même temps, dans le code : heure (2), journal des erreurs (21), import Excel (19), photos à part (23), nuit par cabinet (24), guide (22).
	•	Répétition générale dans le cabinet de démonstration, chronométrée : création, import d'un fichier fictif, premier patient, cure validée, reçu, export, récupération (9).
	•	Feu vert : avis du juriste reçu, société créée, domaine en place. Sans ces trois-là, on n'avance pas.
	•	Jour J (1 h en visio avec le médecin pilote, 20) : modèle recopié de votre cabinet juste avant, création, les 5 étapes de la carte « Bienvenue », export vers son Drive, messages WhatsApp, marges du papier, un patient d'essai créé puis supprimé.
	•	Première semaine : journal des erreurs lu chaque jour, « Écart au modèle » regardé, premier export du dimanche vérifié, un point avec le médecin.
	•	Fin du mois : bilan du pilote, corrections, abonnement, puis le 2e cabinet.
Tenue à 5 000 dossiers
À 5 000 dossiers, Onco360 ne perd rien, mais chaque ouverture devient lente : environ 13 s de calcul, sans compter le téléchargement. Jusqu'à 1 500 dossiers environ, l'attente reste sous 4 s. Au-delà, il faut l'étape 5.3 (décision 25), et les traitements de nuit doivent passer par cabinet dès le 2e cabinet (24).
Le jeu est fictif : les 8 patients du cabinet de démonstration, multipliés, ouverts sur 3 ans, avec 0 à 12 consultations de suivi chacun. Le calcul utilise le moteur d'Onco360 lui-même, celui que fait chaque ouverture (dossier, poids actuel, résumé).
Dossiers
Données chargées à l'ouverture
Calcul à l'ouverture
Mémoire
57
0,2 Mo
0,2 s
6 Mo
1 000
2,7 Mo
2,6 s
15 Mo
2 500
6,8 Mo
6,4 s
30 Mo
5 000
13,5 Mo
12,6 s
54 Mo
Ces chiffres sont un plancher. Les dossiers fictifs pèsent environ 3 Ko ; un vrai dossier, avec ses cures, ses heures et ses notes, pèse plus. Chaque photo de patient ajoute environ 50 Ko à chaque ouverture : 1 000 photos, c'est 50 Mo de plus. Le calcul a été mesuré sur un serveur ; un téléphone est sans doute 2 à 4 fois plus lent (estimation, non mesurée).
Où
À 5 000 dossiers
Limite
Cases « Payé » de l'année (un seul document)
14 412 actes en 2025, soit 67 % d'un document si tout est coché
1 Mo par document ; alerte à 70 %
Tâches automatiques de nuit
Environ 6 200 lectures une à une, soit 50 à 170 s, et tous les dossiers chargés d'un coup
5 min et 256 Mo pour tous les cabinets ensemble
Google Agenda de nuit
5 000 résumés (environ 4 Mo) relus pour chaque personne reliée
5 min pour toutes les personnes de tous les cabinets
Export de la semaine
Les cabinets un après l'autre
30 min en tout
Liste des patients
5 000 lignes affichées d'un coup
Pas de pages
Bilan et agenda
2,7 s et 2,2 s de calcul
Sans souci
Plan d'action
	•	Photos rangées à part, lues seulement quand on ouvre le dossier (23).
	•	Traitements de nuit lancés cabinet par cabinet, dossiers lus par paquets de quelques centaines (24).
	•	Index léger des patients (nom, n° de dossier, statut, diagnostic, prochain rendez-vous) dans des documents à part. La bibliothèque Firebase du navigateur ne sait pas lire seulement quelques champs d'un dossier.
	•	Liste des patients par pages, recherche dans l'index.
	•	Dossier complet chargé à son ouverture. Salle d'attente, agenda et tableau de bord lisent seulement les résumés de la période affichée.
	•	Cases « Payé » rangées par mois quand l'année dépasse 70 %.
	•	Test de charge dans le contrôle avant chaque mise en ligne : 5 000 dossiers fictifs dans l'émulateur, ouverture en moins de 5 s.
Administration
L'Administration couvre déjà toute la vie d'un cabinet sans jamais ouvrir un dossier : création, modèle, abonnement, factures, sauvegardes, journal. Le risque n'est pas dans l'écran. Votre compte de tous les jours peut nommer un administrateur. Et le compte d'administration peut réécrire un cabinet sans que son médecin le sache.
Onglet
Ce qu'il fait
Avis
Cabinets
Liste, fiche (équipe, nombre de dossiers, activité sur 30 jours), suspendre, supprimer (nom retapé), lien du premier mot de passe, Écart au modèle, réglage en miroir, Appliquer le modèle, Récupérer des données
Complet. Il manque l'état du démarrage de chaque cabinet (profil, lieu, tarifs, équipe, export).
Nouveau cabinet
Médecin, e-mail, pack, facturation (essai de 30 jours)
Ni import ni guide (décisions 19, 22).
Par spécialité
Modèle des cabinets neufs en 3 étapes, packs, bibliothèques de référence
Clair depuis le 20/10. La question 6 attend (12).
Modules
Liste en lecture seule
Rien à redire.
Comptabilité
Attendus, impayés, relances, factures et avoirs, export comptable, « Mon entreprise »
Aucune vraie facture avant la société éditrice (18).
Journal
Toutes les actions de l'Administration, jamais modifiables
Lu seulement par l'Administration elle-même.
Sauvegardes
Copie des fichiers, exports de la semaine, récupération
Les autres traitements de nuit n'y figurent pas (41).
Ce qui est risqué
	•	Votre compte nomme des administrateurs. La règle laisse votre compte de médecin écrire la liste des administrateurs depuis le navigateur. Un mot de passe volé sur un poste de clinique donne donc la main sur tous les cabinets (décision 36).
	•	Votre compte lit et modifie le profil de tous les médecins de tous les cabinets : téléphone, INPE, IF, TP, ICE. Un INPE changé serait imprimé sur ses ordonnances. Le test d'étanchéité ne vérifie que votre équipe (36).
	•	Le compte d'administration n'a qu'un mot de passe, alors qu'il peut réécrire tout un cabinet, changer ses réglages ou le supprimer (37).
	•	Le médecin n'est pas prévenu quand l'Administration écrit chez lui : une ligne dans son historique, rien sur son tableau de bord (38).
	•	Un cabinet suspendu perd tout accès, export compris : le fichier d'export n'est plus téléchargeable une fois le cabinet suspendu. Or un médecin doit pouvoir relire ses dossiers (39).
	•	La suppression est immédiate : base, fichiers et comptes sont effacés. Seules les sauvegardes de la base (14 semaines) gardent une copie, et aucun export n'est remis au médecin (40).
	•	Les pannes de nuit sont invisibles, sauf celles de la copie des fichiers (41).
	•	47 fenêtres grises du navigateur dans l'Administration, dont la suppression d'un cabinet, qui se fait par une saisie grise.
Ajouts proposés
	•	Sur la fiche de chaque cabinet, l'état du démarrage (profil, lieu, tarifs, équipe, Google Agenda, export), sans donnée médicale. On voit où le médecin bloque.
	•	Une page « État de la plateforme » : dernière nuit de chaque traitement, échecs, dernier export de chaque cabinet, refus de Google Agenda (41).
	•	Le journal des erreurs (21) et l'import Excel (19) se règlent depuis ici.
Bibliothèque
La bibliothèque compte 368 protocoles, tous avec une source et des noms uniques. Le contrôle automatique trouve un vrai danger : dans 5 protocoles, un anticorps est prescrit deux fois le même jour (décision 26). Le reste relève de l'harmonisation.
Méthode : la bibliothèque a été reconstruite comme à l'ouverture d'Onco360 (copie du 18/10, puis corrections de l'audit n° 3, P4, P5 et P7). Chaque dose a été comparée molécule par molécule. Les doses ont ensuite été calculées avec le moteur d'Onco360 pour une patiente fictive de 70 kg (surface 1,82 m²). Si vous avez modifié des protocoles depuis le 18/10, votre bibliothèque en ligne peut différer : regardez ces 5 protocoles chez vous.
À corriger tout de suite
Protocole
Ce que calcule Onco360
Attendu
mFOLFOX6 + Herceptin (J1-J15 / 28 j)
C1 : trastuzumab 420 mg à J1, puis 420 + 280 mg à J15, et encore 280 mg à J29, au-delà du cycle. Cures suivantes : 280 + 280 mg à J15.
6 mg/kg une seule fois (C1 J1), puis 4 mg/kg à chaque injection
FOLFIRI J1-J15 / 28 j + Trastuzumab 6 puis 4 mg/kg
Les mêmes doses
Le même schéma
Paclitaxel 80 + Trastuzumab hebdomadaires (4 puis 2 mg/kg) / 21 j
J1 de chaque cure : 280 + 140 mg
4 mg/kg à C1 J1 seulement, puis 2 mg/kg
Paclitaxel 80 + Cétuximab hebdomadaires / 21 j (ERBITAX)
J1 de chaque cure : 728 + 455 mg
400 mg/m² à C1 J1, puis 250 mg/m²
TPEx : Docétaxel 75 + Cisplatine 75 J1 + Cétuximab hebdomadaire / 21 j × 4
J1 de chaque cure : 728 + 455 mg
400 mg/m² à C1 J1, puis 250 mg/m²
Dans les trois derniers, « C1 seule » et « sauf C1 » ne sont écrits qu'en remarque : le calcul ne les lit pas. Ces protocoles ont été créés le 18/10 (P7) ; les deux premiers existaient avant l'audit n° 3. Les doses apparaissent telles quelles sur la fiche de chimiothérapie. Un médecin attentif voit deux lignes et en retire une, mais la proposition de départ est fausse. Les lignes déjà prescrites gardent leur copie du protocole : chaque patient sous l'un de ces 5 protocoles est à vérifier à la main.
« KEYNOTE-A18 – phase 2 » (pembrolizumab après la radiochimiothérapie), créé le 18/10, n'a pas le statut « Validé » : il ne peut pas être prescrit (27).
À harmoniser
Sujet
Constat
Décision
5-FU en diffuseur
11 protocoles (TPF, EXTREME, KEYNOTE-048…) écrivent 1 000 mg/m² « par jour » pour un diffuseur de 96 h : la fiche montre la dose d'un jour, et le diffuseur en contient quatre. Les autres protocoles écrivent la dose totale.
28
Deux hormonothérapies dans un protocole
« Letrozole 2,5mg ou Fulvesteant + Palbociclib 125mg (Ibrance) + Zometa » prescrit le létrozole et le fulvestrant ensemble ; « Fulvesteant » est mal écrit.
29
Solumedrol avec le carboplatine
40, 60, 80 ou 120 mg selon le protocole. 21 protocoles sans cisplatine ont 60 mg, dont 2 créés le 18/10 (MITO-7, KEYNOTE-355). Règle du 13/10 : 80 mg.
30
Acide folinique
50 mg en dose fixe dans 14 protocoles FOLFOX, FOLFIRI et LV5FU2 (pratique australienne, origine eviQ), 400 mg/m² dans 9 autres.
31
Vinorelbine
« Cisplatine 20 + Vinorelbine 15 hebdomadaire + RT » prescrit 10 mg/m².
32
Immunothérapies
36 protocoles sur 58 ne donnent de durée maximale ni dans le nom ni dans les remarques (recherche automatique, à confirmer).
33
Vérifié, rien à signaler
	•	Doses courantes conformes aux schémas cités : oxaliplatine 85 et 130, irinotécan 180, 5-FU 400 puis 2 400, carboplatine AUC 1,5 à 6, pembrolizumab 200 et 400, nivolumab 240, 360 et 480, trastuzumab 8 puis 6 mg/kg toutes les 3 semaines.
	•	Doses inhabituelles, justifiées par leur essai :
	•	paclitaxel 250 mg/m² en 24 h (TIP) ;
	•	carboplatine 70 mg/m² de J1 à J4 (GORTEC 94-01) et AUC 7 (séminome) ;
	•	durvalumab 1 120 mg (DUO-E) ;
	•	oxaliplatine 60 et irinotécan liposomal 50 (NALIRIFOX) ;
	•	gemcitabine et docétaxel en mg (instillations vésicales).
	•	Prémédications : un anti-H1 dans les 38 protocoles avec paclitaxel, une hydratation dans les 65 avec cisplatine, vincristine plafonnée à 2 mg par le calcul.
	•	Statut : un seul protocole non validé (27).
	•	Sans cycle : 39 protocoles (hormonothérapies, thérapies orales continues, facteurs de croissance).
	•	« HGC » et « eviQ » ne restent que dans 9 identifiants internes, jamais affichés. Mieux vaut les laisser : changer un identifiant casserait le lien avec les lignes déjà prescrites.
Médicaments, ordonnances, analyses, examens, courriers
	•	180 fiches de médicaments relues : les posologies sont cohérentes (morphine, fentanyl, métoclopramide 5 jours au plus, lopéramide, facteurs de croissance, anti-NK1). Deux fiches sont à compléter (34) :
	•	ZOMETA : créatinine avant chaque perfusion, dose selon la clairance, bilan dentaire, calcium et vitamine D, comme sur la fiche XGEVA ;
	•	NAUSELIUM : durée maximale de la dompéridone.
	•	Ordonnances types, analyses, examens et courriers : revus en détail par le lot E le 19/10, rien de nouveau. Les documents de RT relèvent de l'audit n° 9, et NOCAND de la décision 3.
	•	Votre bibliothèque est la référence : chaque défaut part dans chaque cabinet neuf. Il faut corriger avant de recopier le modèle, et faire tourner ce contrôle à chaque modification (35).
Sécurité entre cabinets
L'étanchéité entre cabinets tient. Un compte ne voit que les cabinets où il a une fiche de membre, et seul le serveur crée ces fiches. Les failles sont au-dessus des cabinets : votre compte personnel et le compte d'administration.
Ce qui protège
	•	Un espace par cabinet. Chaque lecture et chaque écriture demandent une fiche de membre active, un cabinet non suspendu, le bon droit et le bon établissement. C'est vrai dans la base comme pour les fichiers.
	•	Les fiches de membre sont créées par le serveur seul, dans la limite de la formule. Un titulaire ne s'ajoute pas à un autre cabinet, et un membre ne change pas ses propres droits.
	•	Le compte d'administration n'ouvre aucun cabinet. Tout passe par des fonctions qui vérifient son rôle et écrivent au journal.
	•	Les données sensibles sont invisibles du navigateur : jetons Google Agenda et Drive, facturation, factures, compteurs, journal de l'Administration.
	•	Les fichiers et les exports sont rangés par cabinet, et l'export n'est lisible que par le titulaire.
	•	Les fonctions du serveur se vérifient elles-mêmes. Chacune de celles qui reçoivent un cabinet contrôle le titulaire, la fiche de membre ou le rôle d'administrateur avant de lire ou d'écrire.
	•	Le test d'étanchéité vérifie 57 refus : lire, lister ou écrire chez l'autre, s'ajouter membre, secrétaire de deux cabinets retirée de l'un.
	•	Les textes venus des cabinets sont neutralisés avant d'être affichés dans l'Administration (noms, e-mails, équipes).
Ce qui fuit ou peut fuir
Faille
Conséquence
Décision
Votre compte écrit la liste des administrateurs depuis le navigateur.
Un seul mot de passe volé donne la main sur tous les cabinets.
36
Votre compte lit et modifie le profil de tout utilisateur, de tout cabinet.
Les données personnelles des médecins clients sont exposées, et un INPE modifié serait imprimé sur leurs ordonnances.
36
Dans les règles, votre identité tient à votre adresse e-mail, sans vérifier qu'elle est confirmée.
Si un autre mode de connexion était ouvert un jour, quelqu'un pourrait se présenter avec cette adresse. Même correction : l'identifiant du compte à la place de l'e-mail.
36
L'écran d'ajout d'un membre révèle qu'une adresse est celle d'un administrateur, du titulaire ou d'un membre d'un autre cabinet. Un titulaire peut aussi rattacher la secrétaire d'un autre cabinet sans son accord.
Un client apprend qui sont les autres clients. Une secrétaire voit apparaître un cabinet qu'elle n'a pas choisi.
42
La politique de sécurité du site (CSP) est seulement en observation, et le code écrit dans les pages est permis.
L'échappement des textes tient aujourd'hui : aucun code piégé ne s'est exécuté (partie Sécurité du site). La CSP serait le deuxième verrou si un écran futur oubliait d'échapper.
43
Aucune vérification de l'application (App Check).
N'importe quel programme muni d'un compte valide peut appeler les fonctions : seul le contrôle des droits protège.
Étape 5.5
Un seul projet Firebase pour tous les cabinets, à votre nom.
Une erreur de règle ou une panne touche tout le monde, et les données des clients sont dans votre projet.
18
L'Administration peut aussi réécrire tout un cabinet (récupération). C'est voulu pour le dépannage, avec une copie de l'état d'avant et une ligne au journal. Il manque l'avertissement au médecin (38) et une double vérification sur ce compte (37).
Calcul des doses
Les formules d'Onco360 sont justes. Sur 100 000 cas tirés au hasard, recalculés à part à partir des formules publiées, aucun écart n'apparaît pour la surface corporelle (Mosteller) ni pour le carboplatine (Calvert, DFG plafonné à 125 ml/min). La clairance (Cockcroft-Gault) est exacte en mg/L et à 1,2 % près en µmol/L (constantes 1,23 et 1,04, la version britannique usuelle). Le défaut est ailleurs : l'arrondi au mg entier.
L'arrondi au mg entier
Sans réglage, chaque dose est arrondie au mg entier. 23 lignes de la bibliothèque ont des décimales réglées. Pour les autres, voici les cinq où l'arrondi fausse la dose de plus de 5 %, pour une surface entre 1,30 et 2,30 m² :
Protocole
Molécule
Pire écart
EMA-CO / 14 j
Vincristine 1 mg/m²
+33 % : 1,50 m² donne 1,5 mg, arrondi à 2 mg
Doxorubicine 60 + Trabéctédine 1,1 mg/m² / 21 j
Trabéctédine
−33 % : 1,36 m² donne 1,5 mg, arrondi à 1 mg
Actinomycine D 1,25 mg/m² / 14 j
Dactinomycine
+23 % : 1,30 m² donne 1,63 mg, arrondi à 2 mg
Lurbinectédine 3,2 mg/m² / 21 j
Lurbinectédine
+11 % : 1,41 m² donne 4,5 mg, arrondi à 5 mg
VeIP
Vinblastine 0,11 mg/kg
+9 % : 50 kg donne 5,5 mg, arrondi à 6 mg
Le dernier cas est un défaut du moteur : les décimales sont réglées sur la ligne, mais le calcul ne les applique qu'aux doses en mg/m², jamais en mg/kg (décision 44).
Choix à faire, pas des erreurs
	•	Créatinine très basse (sujet âgé ou dénutri) : la clairance est surestimée, et le plafond de 125 ml/min ne protège pas en dessous. Exemple : une femme de 80 ans, 45 kg, créatinine 4 mg/L, a une clairance de 80 ml/min, donc 525 mg de carboplatine AUC 5. Avec une créatinine plancher de 7 mg/L, ce serait 355 mg. Je propose un avertissement d'un clic sous 7 mg/L, sans changer le calcul (45).
	•	Patients obèses : Onco360 prend le poids réel, sans plafonner la surface. C'est ce que recommande l'ASCO. Le DFG plafonné à 125 ml/min borne déjà le carboplatine. Rien à changer.
Ce qui protège déjà
	•	Validation refusée si une dose est impossible à calculer.
	•	Confirmation si le poids, la taille, la surface ou la créatinine sortent des bornes (« bonne unité ? »).
	•	Avertissement au-dessus de 110 % de la dose du protocole.
	•	Vincristine plafonnée à 2 mg.
	•	Rappel quand la créatinine du jour n'est pas saisie avant un carboplatine.
	•	Doses figées à la validation.
	•	Nouvelles lignes en mg/L par défaut.
	•	Âge en années révolues à la date de la cure : la veille de l'anniversaire et le 29 février sont justes.
Les 79 vérifications du test des doses passent.
Sources : Cancer Care Ontario, carboplatine : plafond de DFG à 125 ml/min recommandé par la FDA ; ASCO 2012, posologie chez l'obèse : poids réel.
Seuils, vigilances et interactions
Le filet de sécurité est riche et juste pour l'essentiel. Il couvre les seuils du jour, le rein, le foie, les doses cumulées, les premières doses et les examens dus. Il a deux faiblesses : les interactions dépendent du texte libre de la fiche, et il manque quelques associations dangereuses courantes.
Ce qui est en place et conforme
	•	Risque émétique classé selon MASCC / ESMO 2023 : cisplatine élevé, anthracycline + cyclophosphamide élevé, carboplatine AUC ≥ 5 « modéré haut ».
	•	Seuils des séances hebdomadaires : PNN ≥ 1,0 et plaquettes ≥ 75 G/L.
	•	Gemcitabine à J8 et J15 : 100 %, 75 % ou séance non faite, selon le résumé des caractéristiques du produit (RCP).
	•	Docétaxel, cabazitaxel et trabéctédine : bilirubine, transaminases, phosphatases alcalines et CPK selon leur RCP.
	•	Rein : 12 molécules avec leurs seuils de clairance (cisplatine 45 et 60 ml/min, capécitabine 30 et 50, pémétrexed 45, méthotrexate 60, étoposide, bléomycine, ifosfamide…).
	•	Foie : vinca-alcaloïdes, étoposide, gemcitabine, capécitabine, inhibiteurs de tyrosine kinase, oxazaphosphorines.
	•	Premières doses : sérologie de l'hépatite B, uracilémie avant le 1er 5-FU, FEVG avant une anthracycline ou un anti-HER2 (puis tous les 3 mois), TSH sous immunothérapie (toutes les 6 semaines), acide folique et vitamine B12 avant le pémétrexed, NFS à J15 et ECG sous inhibiteur de CDK4/6.
	•	Doses cumulées : anthracyclines, oxaliplatine 850 mg/m², bléomycine 400 mg, cisplatine 300 mg/m².
	•	Interactions : aprépitant avec les AVK et la contraception, IPP avec certains inhibiteurs de tyrosine kinase, inducteurs et inhibiteurs du CYP3A4, méthotrexate avec les AINS, les IPP et le cotrimoxazole, QT long, 5-FU avec la phénytoïne et les AVK.
	•	Arrondi au flacon (± 5 %), proposé et jamais appliqué tout seul.
À compléter
Point
Constat
Décision
Interactions lues dans le texte libre
Onco360 cherche les noms de médicaments dans « traitements en cours » et « antécédents ». Un traitement mal écrit, ou noté ailleurs, ne déclenche rien.
46
Associations dangereuses absentes
Vinca-alcaloïdes + azolés (neuropathie sévère). Taxanes et irinotécan + inhibiteurs ou inducteurs du CYP3A4. Tamoxifène + paroxétine, fluoxétine ou bupropion (efficacité diminuée). Pémétrexed + AINS si la clairance est sous 80 ml/min. 5-FU ou capécitabine + brivudine (contre-indication absolue).
47
Équivalence de l'épirubicine
Onco360 compte l'épirubicine à 0,5 doxorubicine, comme le RCP (900 mg/m²). L'étude de Feijen 2019, reprise pour les enfants, donne 0,8. Avec 0,8, un FEC 100 × 6 suivi d'une autre anthracycline déclenche l'alerte plus tôt. Daunorubicine, idarubicine et mitoxantrone ne sont pas comptées.
48
Rein
Le topotécan manque (dose réduite sous 40 ml/min), ainsi que l'acide zolédronique, aujourd'hui rangé parmi les prémédications.
47
Trabéctédine
Il manque l'albumine (≥ 25 g/L) et la clairance (≥ 30 ml/min) du RCP.
47
Source : Feijen et al., équivalence des anthracyclines (épirubicine 0,8).
Tout ce qui s'imprime
Les sept documents principaux ont été imprimés en PDF depuis Onco360, sur le jeu fictif, avec un médecin fictif dont toutes les mentions sont remplies. Ils ont les bonnes mentions. Trois défauts de mise en page sont à reprendre : la page 2 de la fiche de chimio sans le nom du patient, le reçu sur deux feuilles, et « À compléter » imprimé en clair sur les certificats.
Document
Résultat
À reprendre
Fiche de chimiothérapie (A4 paysage)
1 page pour EC, 2 pour mFOLFOX6 + Herceptin. Identité, âge, poids, taille, surface, cure, protocole, prescripteur et INPE, une ligne par jour et par produit, mention « vésicant », allergie si « oui », cases de validation.
La page 2 ne répète ni le nom du patient ni les titres des colonnes : une feuille séparée ne dit plus à qui elle appartient (49). On y lit aussi le trastuzumab deux fois à J15, encore à J29, et le retrait du diffuseur deux fois à J17 (26).
Ordonnance (A5)
En-tête du médecin, INPE, date, patient, posologie et durée ; cachet, signature et numéro de page sur chaque page ; pied du lieu.
Cinq médicaments courts (ordonnance « Anti-EGFR : peau ») tiennent sur 2 pages. Les marges latérales de 28 mm ne laissent que 92 mm de texte sur une feuille de 148 mm. La question 1 du 11/10 (mesurer l'en-tête du papier) attend toujours (52).
Reçu (A5)
Toutes les mentions décidées le 17/10 : numéro, patient et dossier, médecin et spécialité, prestation, montant en chiffres et en lettres, mode, Visa accueil, IF, TP, ICE, INPE, adresse.
Quand toutes les mentions sont remplies, le pied du lieu part seul sur une 2e feuille (50).
Certificat médical (A4)
En-tête, « Je soussignée » selon le médecin, lieu et date, signature.
Après « Imprimer quand même », le mot « À compléter » s'imprime en clair. Les documents de RT, eux, laissent la ligne vide (51). Le téléphone du pied se coupe en deux lignes.
Pli confidentiel de RT (A4, 3 pages)
Conforme au modèle.
« À REMPLIR » est laissé vide à l'impression, après un avertissement d'un clic.
Compte rendu de fin de RT (A4, 2 pages)
Identification, indication, technique, calendrier.
Dose prescrite et dose par fraction « à compléter » si la prescription n'a pas de volumes. La dose reçue après un arrêt est traitée dans l'audit n° 9.
Calendrier de fin de RT (A4)
Une page pour 25 séances, sans appareil, avec la ligne de protection du bas.
Rien.
Aucune erreur JavaScript pendant ces impressions.
Parcours réels par rôle
Sur 88 pages ouvertes (4 rôles, ordinateur et téléphone de 390 px, 11 pages chacun), il n'y a eu aucune erreur, aucun défilement de côté, aucun « undefined » ni « NaN » à l'écran. Chaque changement de page prend 0,4 à 0,6 s. Le comptable n'arrive que sur le Bilan, comme prévu. Les parcours ont été joués dans Chromium, avec le faux Firebase des tests et 24 patients fictifs : c'est l'écran sans le réseau, pas la vitesse en ligne.
Tâche
Rôle
Gestes
Remarque
Valider la cure du jour depuis le tableau de bord
Médecin
4 : ouvrir le dossier, onglet Chimiothérapie, Ouvrir, Valider la cure
« Cures à valider » ouvre le dossier sur l'onglet Consultation. Ouvrir directement la cure ramènerait cela à 2 gestes (décision 53).
Encaisser la consultation de chimio
Médecin, secrétaire
2 : Venu, Valider : venu
Le bouton « Venu » près de « C3 (en retard) » valide la consultation, pas la séance. Deux gestes différents se ressemblent.
Prendre un rendez-vous
Secrétaire
6 : bouton, recherche, patient, type, créneau, Enregistrer ; puis WhatsApp ou « Plus tard »
Créneaux libres affichés, consultations de chimio du jour listées, message français et arabe prêt. Rien à redire.
Patient arrivé en salle
Secrétaire
1 : Arrivé
Rien à redire.
Imprimer une ordonnance type
Médecin
4 : Ordo. type, choisir, afficher, imprimer (plus « Imprimer quand même » s'il reste une zone)
Voir les marges (52).
Nouveau patient
Secrétaire
13 champs, identité seule depuis le 20/10
Rien à redire.
Ce que les parcours ont montré en plus :
	•	Le défaut de la bibliothèque se voit partout. La ligne de trastuzumab à J29 de « mFOLFOX6 + Herceptin » fabrique une séance « C3 J29 ». Elle apparaît dans l'agenda du jour, dans la salle d'attente (patient « à venir ») et dans la liste des créneaux (26).
	•	Sur téléphone, la barre d'actions du dossier prend 3 lignes (9 boutons, environ un cinquième de l'écran) et cache la fin de la page.
	•	La liste des patients de « Nouveau rendez-vous » montre tous les dossiers avant toute recherche. À 5 000 dossiers, il faudra n'afficher que les résultats de la recherche (25).
Accessibilité et confort
Le contrôle automatique axe (normes WCAG 2 A et AA) trouve trois familles de défauts, tous réparables sans rien changer à la disposition. Il ne trouve aucune image sans texte, et la langue est déclarée. Les boutons ont un contour visible au clavier, sauf dans la salle d'attente.
Défaut
Où
Ampleur
Contraste trop faible
La pastille orange de la cloche (blanc sur orange, 3 pour 1) sur toutes les pages. Les badges verts des protocoles et de la salle (3,8 pour 1) : l'ancienne couleur, corrigée en R-C6 dans l'agenda seulement. Les textes gris clair des cartes (4,3 pour 1). Les dates passées de la RCP (1,8 pour 1).
737 éléments sur la page Protocoles, de 1 à 14 ailleurs ; seuil 4,5 pour 1
Champs sans étiquette
Horaires de Paramètres (10 champs), filtres du Bilan (8), menus en cascade des Protocoles (5), filtre de la page Patients
Un lecteur d'écran annonce « champ » sans dire lequel
Zones cliquables trop petites
Sur téléphone, de 0 à 10 zones de moins de 24 px par page (le minimum WCAG 2.2) et beaucoup sous 44 px : 55 dans le dossier, 60 dans la RCP
La règle d'Onco360 dit 44 px (étape 4.1)
Atteignables à la souris seulement
39 lignes du tableau de bord, 13 éléments de l'agenda, les 368 lignes de Protocoles : des blocs cliquables qui ne sont pas des boutons
Inutilisables au clavier
Tout cela entre dans l'étape 4.1 déjà prévue (décision 54).
Vitesse de chargement
Onco360 charge 65 fichiers à chaque ouverture : 1,7 Mo, 538 Ko une fois compressés, sans compter la bibliothèque Firebase servie par Google. Le site les fait tous revérifier à chaque ouverture (réglage « no-cache »). La deuxième ouverture est donc presque aussi lente que la première.
Réseau simulé
1re ouverture
Ouverture suivante
Fibre (20 ms)
1,2 s
1,0 s
4G moyenne (70 ms, 9 Mbit/s)
1,8 s
1,7 s
4G lente (150 ms, 1,6 Mbit/s)
4,6 s
4,4 s
Ces temps couvrent le code seulement : les dossiers venaient du faux Firebase, sans réseau. Il faut y ajouter le chargement des dossiers (partie 5 000 dossiers). Le serveur de mesure imitait Firebase (compression, revérification) mais en HTTP/1.1. Firebase utilise HTTP/2, plus rapide pour beaucoup de petits fichiers : ces chiffres sont un maximum.
Les fichiers les plus lourds sont v2.js (242 Ko), v2.html (143 Ko), chimio.js (139 Ko), ordonnances.js (110 Ko) et configuration.js (102 Ko).
Je propose de rassembler le code en un seul fichier dont le nom change à chaque version, gardé en cache par le navigateur jusqu'à la version suivante (55). L'ouverture suivante passerait sous la seconde même en 4G lente, et le problème du numéro de version à changer à la main (v2.js?v=…) disparaîtrait.
Messages en arabe
Les dix messages de départ sont en bon arabe classique : vouvoiement de respect, mois en usage au Maroc (« ماي », « غشت », « شتنبر »), jours justes, termes administratifs marocains (« بطاقة التعريف الوطنية », « وثيقة التكفل (التعاضدية) »). Les noms en lettres latines sont isolés, donc la ponctuation reste à sa place. Trois retouches sont proposées (décision 56).
Message
Aujourd'hui
Proposé
Pourquoi
Séance de chimio
يرجى إحضار آخر تحليل للدم
يرجى إحضار آخر تحاليل الدم
« Bilan sanguin » = plusieurs analyses : le pluriel est plus fidèle.
Séance de chimio
لا تنسوا تناول الأدوية الوقائية إذا وُصفت لكم
لا تنسوا تناول الأدوية التي وُصفت لكم قبل الحصة
« Prémédication » n'est pas « préventif » : c'est ce qui se prend avant la séance.
Séance de chimio
أي مشكل ... قبل التنقل
أي مشكلة ... قبل الحضور
« مشكل » et « التنقل » sont des usages marocains. Ils sont compris, mais l'arabe classique dit « مشكلة » et « الحضور ». À vous de choisir.
Un risque reste. Quand un cabinet modifie le message en français sans écrire d'arabe, Onco360 ajoute l'arabe de départ. Si le français dit « venez à jeun », l'arabe ne le dit pas. Je propose un avertissement dans Paramètres › WhatsApp : « le français a changé, l'arabe n'est plus sa traduction » (56).
Sécurité du site en profondeur
Le site résiste au code piégé. J'ai placé du code dans 34 champs des données fictives : nom, téléphone, diagnostic, notes, protocole, produit, rendez-vous, consultation, ordonnance, tâche, RCP, salle, lieu, listes, bibliothèques, modèle de courrier. J'ai ensuite ouvert toutes les pages, les onglets du dossier, les fenêtres de prescription, la fiche de chimio et le pli de RT. Aucun code ne s'est exécuté. Les champs s'affichaient en clair, neutralisés, et le HTML repris des ordonnances et des courriers est nettoyé avant d'être montré. Les failles restantes sont autour : la session, les mots de passe, une bibliothèque externe.
Point
Constat
Décision
Code piégé
0 exécution sur 34 champs, écran et impressions. La CSP reste en observation : c'est le deuxième verrou, au cas où un écran futur oublierait d'échapper.
43
Session sur un poste partagé
La connexion reste ouverte sur le navigateur, et rien n'est gardé sur le disque (pas de copie hors ligne de la base). Sur un poste de clinique, la personne suivante ouvre donc la session précédente. La déconnexion automatique reste refusée.
57
Mots de passe
8 caractères au moins quand on le change dans Onco360. Le premier mot de passe passe par la page de Google, qui en accepte 6.
58
Bibliothèques externes
mammoth 1.6.0, qui convertit les .docx déposés, a une faille connue (CVE-2025-11849, corrigée en 1.11.0). Dans le navigateur, elle ne peut pas lire les fichiers de l'ordinateur, mais il faut quand même mettre à jour. Firebase 10.12.2 date de 2024 (étape 5.5). jszip, html2canvas et SheetJS sont à jour.
59
Secrets
Aucune clé privée ni aucun secret dans le dépôt ni dans son historique (recherche par motifs). functions/.env ne contient que l'identifiant public du client Google. La clé web de Firebase est publique par nature : à limiter à l'adresse du site dans la console Google.
59
En-têtes du site
Interdiction d'être affiché dans un cadre, type de fichier imposé, référent limité : en place. Il manque la CSP appliquée et une politique des permissions (caméra, micro).
43
Fichiers déposés
PDF seulement, 25 Mo au plus, rangés par cabinet et par patient, jamais remplacés.
Rien
Source : OSV, CVE-2025-11849 (mammoth).
Coût de Firebase par cabinet
Firebase coûte environ 2,5 à 3 dollars par mois pour un cabinet de 1 000 dossiers, et environ 16 dollars pour un cabinet de 5 000. C'est peu à côté du prix des packs (de 690 à 2 990 DH par mois). Deux postes pèsent le plus : l'export de la semaine envoyé au Drive, et le téléchargement de tous les dossiers à chaque ouverture.
Plateforme
Total par mois
Par cabinet
Ce qui pèse le plus
1 cabinet de 1 000 dossiers
2,5 $
2,5 $
Export de la semaine (1,6 $), planificateur (0,7 $)
10 cabinets de 1 000 dossiers
26,5 $
2,7 $
Export (15,5 $), dossiers téléchargés (5,4 $), sauvegardes (1,8 $)
50 cabinets de 1 000 dossiers
138 $
2,8 $
Export (77 $), dossiers téléchargés (32 $), lectures (9,5 $), sauvegardes (9,2 $)
1 cabinet de 5 000 dossiers
16,5 $
16,5 $
Export (7,7 $), dossiers téléchargés (5,4 $)
Modèle d'usage retenu, à corriger avec les vraies factures :
	•	2 postes, 6 ouvertures par poste et par jour, dossiers de 15 Ko ;
	•	150 écritures de dossier par jour ;
	•	3 Go de PDF pour 1 000 dossiers ;
	•	2 personnes reliées à Google Agenda ;
	•	pour 5 000 dossiers : 4 postes, 600 écritures par jour et 15 Go de PDF.
Les tarifs sont ceux publiés par Google : Firestore 0,03 $ pour 100 000 lectures, Cloud Run 0,000024 $ par seconde de calcul, sortie de données 0,12 $ par Go. Les gratuités mensuelles sont déduites une fois pour tout le projet. Les prix européens peuvent être un peu plus élevés.
L'export vers le Drive est compté au maximum : le ZIP de chaque semaine renvoie tous les PDF, et je l'ai compté comme une sortie vers internet.
À vérifier dans la console Google, car hors du modèle : les images des 55 fonctions gardées à chaque mise en ligne (Artifact Registry, payant au-delà de 0,5 Go), les minutes de construction et les journaux.
Je propose une alerte de budget et un export de la semaine qui n'envoie plus que les PDF nouveaux (décision 60).
Sources : Firestore, tarifs ; Firebase, tarifs du plan Blaze ; Cloud Run, tarifs.

>>> VOILA CE QUE JEN DIS: c’es trop chere l’export comment baisser le coup ? l’enlever ? le proposer qu’au cabinet du dr bentahila ??? 
>>> si je change un jour pour mettre par exemple tout le projet sur un hebergement local (maroc telecom, comment ca se passe, il faut tout changer ????) 
Code et tests pour la cession
Un acheteur trouvera un code peu dupliqué, presque sans code mort, avec un moteur de calcul bien testé. Il trouvera aussi trois obstacles :
	•	les tests de l'argent ne tournent pas sans une copie des vrais dossiers ;
	•	les lignes de code sont très longues ;
	•	il n'existe aucun mode d'emploi d'installation.
Mesure
Résultat
Avis
Taille
15 300 lignes dans le site, 4 050 côté serveur, 1 434 de pages HTML. Le plus gros fichier est v2.js : 2 114 lignes, 242 Ko.
Raisonnable pour l'étendue fonctionnelle.
Lisibilité
697 lignes dépassent 300 caractères ; la plus longue en fait 1 531.
C'est le premier frein à la relecture. Étape 7.2 : mise en forme automatique en une fois.
Duplication
1,3 % de lignes en double, surtout les copies voulues entre le site et le serveur (facturation, calcul de la RT), déjà vérifiées par des tests.
Très bon.
Code mort
14 fonctions globales et 10 exports jamais appelés (dont chHon, chValiderSeance, migrerV1), sur 415 fonctions.
Faible ; l'étape 5.1 les liste déjà.
Tests du moteur et du serveur
95 % des instructions et 78 % des branches couvertes.
Bon niveau pour un logiciel médical.
Tests de l'argent
Bilan, finances, résumé du dossier, salle et tarifs : 0 % de couverture sans tests/seed.json, la copie des vrais dossiers.
Un acheteur ne peut pas vérifier le chiffre de référence (décision 7).
Tests du navigateur
71 fichiers, qui lisent tous la copie des vrais dossiers.
Même obstacle, et même risque de laisser un vrai nom dans un test (7).
Tests des règles
14 fichiers, dont 57 refus d'étanchéité, sur l'émulateur.
Bien ; ils demandent Java 21 et les émulateurs.
Documentation
CLAUDE.md (le modèle de données), la feuille de route (1 631 lignes), le journal, 6 guides d'utilisation. Pas de README ni de mode d'emploi d'installation.
Étape 7.1 : installation sur un projet vierge en moins de 30 minutes (61).
Bibliothèques
Licences notées (MIT, BSD, Apache). jszip est double MIT ou GPLv3 : choisir MIT par écrit.
À mettre dans le dossier de cession.
Pour la cession, l'ordre utile est le suivant (61) :
	•	Jeu de test fictif (décision 7), qui débloque tout le reste.
	•	README et installation sur un projet vierge (7.1).
	•	Mise en forme automatique en une fois, sous les tests (7.2).
	•	Découpage de v2.js et de configuration.js.
	•	Rapport de couverture joint au dossier de vente (7.4).
Fiche pour le juriste
Cette partie se copie telle quelle dans un e-mail. Elle décrit le projet, puis pose les questions dans l'ordre où elles bloquent. Je ne suis pas juriste : ce sont des questions à lui poser, pas des réponses. Un texte récent change la donne : la délibération CNDP D-941-2025 du 28/11/2025 donne un modèle d'autorisation pour le suivi des patients.
Le projet
	•	Onco360 est un logiciel web d'aide au suivi oncologique : dossier, chimiothérapie avec calcul des doses, radiothérapie, rendez-vous, ordonnances, reçus, bilan financier. Il est utilisé par le cabinet du Dr Rita Bentahila depuis le 06/10/2026 et destiné à être vendu par abonnement à d'autres cabinets.
	•	Hébergement : Google Firebase, dans un projet au nom du Dr Bentahila, région europe-west1 (Belgique). Sauvegardes chez Google. Les médecins peuvent relier leur Google Agenda, où le nom du patient apparaît, et leur Google Drive (export de la semaine). Les rappels WhatsApp partent du téléphone du cabinet, jamais tout seuls.
	•	Données : identité, CIN, téléphone, mutuelle, diagnostic, traitements et doses, documents PDF, montants payés.
	•	Rôles : chaque cabinet est responsable de ses données. L'éditeur héberge et entretient. L'Administration n'ouvre aucun dossier, sauf pour une récupération de données, notée au journal.
Les questions
N°
Question
Pourquoi elle se pose
1
Le cabinet du Dr Bentahila a-t-il l'autorisation CNDP pour le traitement « suivi des patients » ? Sinon, faut-il la déposer sur le modèle de la délibération D-941-2025 ?
Les données de santé sont des données sensibles, sous autorisation préalable. Le texte demande aussi le consentement des patients (section 8).
2
L'hébergement en Belgique est un transfert à l'étranger, qui demande une autorisation préalable (articles 12 et 20 de la loi 09-08, section 11 de la délibération). Qui la demande : chaque cabinet ou l'éditeur ? Un hébergement au Maroc est-il préférable ?
Toute la plateforme est hébergée chez Google en Europe. Le nom des patients part aussi dans Google Agenda.
3
Que doit contenir le contrat de sous-traitance avec chaque cabinet : sécurité, confidentialité, sous-traitants ultérieurs (Google), restitution et effacement à la fin, signalement d'un incident ?
La délibération exige des garanties de sécurité écrites dans un contrat (section 9).
4
Comment informer les patients (article 5 : responsable, finalités, destinataires, transfert, droits, numéro d'autorisation) et recueillir leur consentement : affiche, mention dans la fiche, case à cocher ?
Rien n'est prévu dans Onco360 aujourd'hui.
5
Quelles durées de conservation pour le dossier médical, les exports, les sauvegardes (14 semaines) et le journal d'audit ?
Laissées en attente le 20/10 jusqu'à son avis.
6
L'ancienne application est restée lisible sans connexion jusqu'au 11/10/2026 (dossiers de 57 patients), et le code a été public sur GitHub les 10 et 11/10. Faut-il le déclarer à la CNDP et prévenir les patients ?
C'est la fiche d'incident 0.5, à rédiger avec lui.
7
Un logiciel qui calcule des doses de chimiothérapie est-il un dispositif médical au sens de la loi 84-12 ? Faut-il un enregistrement auprès de l'autorité du médicament, et le texte « aide au calcul, sous la responsabilité du médecin » suffit-il ?
En Europe, un tel logiciel est un dispositif médical à haut risque.
8
Quelle société créer, et comment protéger les droits : Dr Bentahila seule autrice, code écrit avec une IA, compte Claude prêté par Hamza Benzekri au début (attestation), dépôt du logiciel (loi 2-00), cession future ?
Elle conditionne le projet Firebase, le domaine et les factures (décision 18).
9
Un médecin en exercice peut-il détenir ou diriger une société qui vend un logiciel à des confrères (loi 131-13, code de déontologie) ?
Dr Bentahila est à la fois autrice et médecin.
10
La loi 05-20 sur la cybersécurité s'applique-t-elle à l'éditeur ou aux cliniques clientes, avec une obligation d'hébergement au Maroc ?
À trancher avant de choisir l'hébergement (question 2).
11
Les rappels WhatsApp (nom, date, lieu) passent par Meta : faut-il une mention ou un accord du patient ?
Ils partent du téléphone du cabinet.
Ce qu'on peut lui remettre
	•	La liste des données enregistrées et qui y a accès (modèle de données, règles d'accès, test d'étanchéité).
	•	Le schéma d'hébergement et de sauvegarde, et le journal d'audit.
	•	Le présent audit, parties Sécurité entre cabinets et Sécurité du site.
Sources : CNDP, délibération D-941-2025 du 28/11/2025 (suivi des patients) ; CMS, la loi 09-08 et les données sensibles (2012) ; Monolith, loi 84-12 sur les dispositifs médicaux.
Méthode et sources
	•	Code relu : dépôt ritabentahila-alt/onco360, état du 20/10/2026 à 17 h 33 (version 20261020j). La feuille de route (1 631 lignes) et le journal ont été relus en entier, avec les 24 enregistrements faits depuis l'audit n° 9.
	•	Tests relancés sur une copie propre, sans aucune donnée réelle : 18 fichiers de tests de calcul (16 passent, 2 ont besoin des vrais dossiers) et 13 fichiers de tests des fonctions serveur (12 passent, test-demo plante). L'analyse du code (ESLint 9.13) a cherché les variables inconnues et les doubles déclarations.
	•	Non relancés : les 71 tests du navigateur et les tests des règles. Les premiers lisent la copie des vrais dossiers. Les seconds demandent les émulateurs de Firebase, dont le téléchargement est bloqué depuis ce poste. D'après le journal, les tests des règles passaient le 20/10 ; les règles ont donc été relues à la main.
	•	Charge : jeu fictif construit avec functions/demo.js et la bibliothèque de protocoles du 18/10 (sans patient), calculé avec le moteur du site. Les lectures de nuit sont comptées avec la logique des tâches automatiques du serveur. Rien n'a été lancé sur la base en ligne. La bibliothèque a été reconstruite depuis sa copie du 18/10, gardée dans le code sans aucune donnée patient, et depuis les corrections enregistrées (audit n° 3, P4, P5, P7). Chaque dose a ensuite été calculée par le moteur du site. L'Administration et la sécurité ont été auditées par relecture des règles Firestore et Storage, des 40 fonctions appelables et de la page d'administration. Les parcours, les impressions, l'accessibilité et le code piégé ont été joués dans Chromium 141 avec le faux Firebase des tests et un jeu entièrement fictif (24 patients). Outils : axe-core 4.10.2 pour l'accessibilité, c8 pour la couverture des tests, jscpd pour la duplication, et un serveur local imitant l'hébergement Firebase avec des réseaux simulés. Les formules de dose ont été recalculées à part sur 100 000 cas tirés au hasard.
	•	Heure : Chromium 141 et Node 22 (données horaires 2025b) donnent GMT+1 pour Casablanca le 20/10/2026, les données horaires 2026c donnent GMT.
	•	Sources :
	•	TelQuel, 25/06/2026 : retour à l'heure légale GMT le 20 septembre (décret n° 2.26.530)
	•	Liste de la base des fuseaux horaires (IANA) : Maroc à +00 le 2026-09-20
	•	time.is : le Maroc passe à GMT de façon permanente
	•	Audits précédents : n° 3 (12/10), n° 4 à 8 et demandes du 17/10, n° 9 Radiothérapie (19/10).
