# Peau — Carcinomes basocellulaires et épidermoïdes

Mise à jour : 2026-10-24 · Statut de l'onglet : `valide`

## Situations cliniques

Deux situations. Région `peau`, localisation `peau_carcinome`. Carcinomes basocellulaires (CBC) et épidermoïdes cutanés (CEC). Recommandations ASTRO 2020 (Likhacheva) et RECORAD (Hennequin 2022).

**Tableau Situations**

| id | titre | contexte | criteres | ordre |
| --- | --- | --- | --- | --- |
| pc-exclusif | CBC ou CEC cutané : RT exclusive | en\_place | Alternative à la chirurgie (refus, contre-indication, chirurgie mutilante), en particulier chez le sujet âgé ; pour le CBC, la chirurgie fait mieux et avec moins de toxicité dans un essai randomisé (RECORAD) | 1 |
| pc-postop | CEC cutané de la tête et du cou à haut risque, opéré | post\_op | Après exérèse de la maladie macroscopique, atteinte ganglionnaire à haut risque ou primitif à haut risque (TROG 05.01) | 2 |

## Schémas et prescriptions

Cinq schémas. Tous : statut = `valide`, date\_verif = 2026-10-24.

**Tableau Schémas**

| id | situation\_id | titre | type | preuve | essai\_ids | source\_institutionnelle |
| --- | --- | --- | --- | --- | --- | --- |
| pc-excl-6070 | pc-exclusif | RT exclusive 60 à 70 Gy | rte\_normo | recommandation | hennequin2022 ; likhacheva2020 | |
| pc-excl-48-12 | pc-exclusif | RT exclusive 48 Gy / 12 fx (sujet âgé) | rte\_hypo | option | sahara-protocole ; gunaratne2018 | |
| pc-postop-60-30 | pc-postop | RT post-opératoire 60 Gy / 30 fx | rte\_normo | essai\_phase3 | trog0501 ; likhacheva2020 | |
| pc-curie-40-10 | pc-exclusif | Curiethérapie de contact haut débit 40 Gy / 10 fx | curie\_hdr | option | josset2026-peau ; gec-estro-peau-2018 | |
| pc-curie-30-10 | pc-postop | Curiethérapie de contact haut débit adjuvante 30 Gy / 10 fx | curie\_hdr | option | josset2026-peau ; gec-estro-peau-2018 | |

**Tableau Prescriptions** (rattaché au schéma par `schema_id`)

| schema\_id | volume | dose\_Gy | fractions | dose\_fx\_Gy | mode | rythme | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| pc-excl-6070 | PTV | 70 | | | seul | Selon le centre | 60 à 70 Gy à moduler selon la taille de la lésion (RECORAD) ; fractionnement à choisir parmi les schémas ASTRO |
| pc-excl-48-12 | PTV | 48 | 12 | 4 | seul | 3 fx/sem (4 semaines) | Bras standard de l'essai SAHARA (âge ≥ 65 ans, T2 ou plus) |
| pc-postop-60-30 | PTV | 60 | 30 | 2 | seul | 5 fx/sem (6 semaines) | TROG 05.01 : 60 ou 66 Gy en 6 à 6,5 semaines, dose médiane 60 Gy |
| pc-curie-40-10 | CTV | 40 | 10 | 4 | seul | 3 séances par semaine | Plésiothérapie avec applicateur souple (flap) |
| pc-curie-30-10 | CTV | 30 | 10 | 3 | seul | 3 séances par semaine | Après exérèse |

**Tableau Schémas — liens** (même `id` que le tableau Schémas)

| id | technique | systemique | simulation\_id | volumes\_id | contraintes\_id | couverture |
| --- | --- | --- | --- | --- | --- | --- |
| pc-excl-6070 | RT externe | Aucune | | vol-pc | | |
| pc-excl-48-12 | RT externe | Aucune | | vol-pc | | |
| pc-postop-60-30 | RT externe | Aucune | | vol-pc | | |
| pc-curie-40-10 | Curiethérapie haut débit de contact | Aucune | | vol-pc-curie | | |
| pc-curie-30-10 | Curiethérapie haut débit de contact | Aucune | | vol-pc-curie | | |

## Curiethérapie

**Tableau Curiethérapie — indications**

| indication | modalite | niveau\_preuve | note |
| --- | --- | --- | --- |
| Carcinome cutané, en particulier sur une surface courbe | Contact (plésiothérapie) si épaisseur ≤ 5 mm ; interstitielle au-delà | Recommandations GEC-ESTRO ACROP 2018 | Plus le volume est petit, plus la dose par fraction peut être élevée et le traitement court |

## Centrage

Pas de fiche de centrage du service pour cette localisation.

## Contourage

**Tableau Volumes**

| volumes\_id | nom | type | definition | quand | marge |
| --- | --- | --- | --- | --- | --- |
| vol-pc | GTV | GTV | Lésion visible et palpable | RT exclusive | |
| vol-pc | CTV | CTV | GTV ou lit opératoire + marge du centre ; aires ganglionnaires si atteinte (TROG 05.01) | Toujours | |
| vol-pc-curie | CTV | CTV | Lésion ou lit opératoire ; profondeur ≤ 5 mm pour une application de contact | Toujours | |

**Tableau Volumes — OAR et atlas**

| volumes\_id | oar\_ids | atlas |
| --- | --- | --- |
| vol-pc | oar-cristallin-d ; oar-cristallin-g ; oar-oeil-d ; oar-oeil-g ; oar-glande-lacrymale-d ; oar-glande-lacrymale-g ; oar-parotide-d ; oar-parotide-g ; oar-mandibule | |
| vol-pc-curie | oar-cristallin-d ; oar-cristallin-g ; oar-oeil-d ; oar-oeil-g | |

## Traitement systémique associé

Pas de traitement systémique associé à la RT : le carboplatine hebdomadaire n'améliore pas le contrôle locorégional après chirurgie (TROG 05.01).

## Points d'attention

**Tableau Points d'attention**

| cible | point |
| --- | --- |
| pc-postop | TROG 05.01 : contrôle locorégional à 5 ans 83 % (RT) contre 87 % (RT + carboplatine), HR 0,84, non significatif |
| pc-exclusif | Hypofractionnement chez le sujet âgé : dose moyenne 38 Gy à environ 8 Gy par fraction ; récidive locale ≤ 7,9 % dans 33 des 36 séries (revue de 12 337 lésions) |
| pc-exclusif | Irradiation ganglionnaire prophylactique (45 à 50 Gy) pour les formes localement évoluées : moins d'échecs locorégionaux, sans gain de survie (RECORAD) |
