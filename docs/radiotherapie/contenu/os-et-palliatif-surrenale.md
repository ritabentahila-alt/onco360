# Os et palliatif — Surrénale

Mise à jour : 2026-10-24 · Statut de l'onglet : `valide`

## Situations cliniques

Une situation. Région `os_palliatif`, localisation `surrenale`. Stéréotaxie des métastases surrénaliennes : fiche de Gustave Roussy (5 × 9 Gy) et tableur du service.

**Tableau Situations**

| id | titre | contexte | criteres | ordre |
| --- | --- | --- | --- | --- |
| su-oligo | Métastase surrénalienne oligométastatique | oligometastatique | Métastase surrénalienne isolée ou maladie oligométastatique (5 métastases ou moins dans les séries publiées) ; surrénalectomie ou SBRT à discuter en RCP | 1 |

## Schémas et prescriptions

Trois schémas. Tous : statut = `valide`, date\_verif = 2026-10-24.

**Tableau Schémas**

| id | situation\_id | titre | type | preuve | essai\_ids | source\_institutionnelle |
| --- | --- | --- | --- | --- | --- | --- |
| su-igr-45-5 | su-oligo | SBRT 45 Gy / 5 fx (5 × 9 Gy) | sbrt | pratique\_institutionnelle | igr-surrenale ; chen2020-surrenale ; liao2023-surrenale ; giraud2026-surrenale | Gustave Roussy, fiche « stéréotaxie surrénale 5 × 9 Gy » |
| su-service-45-5 | su-oligo | SBRT 45 Gy / 5 fx, prescription sur l'isodose 70 % | sbrt | pratique\_institutionnelle | chen2020-surrenale ; hanna-uk | Tableur du service « surrénale stéréo 5 fractions » |
| su-60-8 | su-oligo | SBRT 60 Gy / 8 fx | sbrt | option | sabrcomet ; chen2020-surrenale |  |

**Tableau Prescriptions** (rattaché au schéma par `schema_id`)

| schema\_id | volume | dose\_Gy | fractions | dose\_fx\_Gy | mode | rythme | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| su-igr-45-5 | PTV | 45 | 5 | 9 | seul | Selon le centre | BED10 85,5 Gy |
| su-service-45-5 | PTV | 45 | 5 | 9 | seul | Selon le service | Isodose 70 % ; D95 % du PTV = dose prescrite |
| su-60-8 | PTV | 60 | 8 | 7.5 | seul | Selon le centre | Dose de SABR-COMET pour la surrénale ; BED10 105 Gy |

**Tableau Schémas — liens** (même `id` que le tableau Schémas)

| id | technique | systemique | simulation\_id | volumes\_id | contraintes\_id | couverture |
| --- | --- | --- | --- | --- | --- | --- |
| su-igr-45-5 | SBRT avec gestion du mouvement respiratoire, IGRT | Aucune | sim-surrenale | vol-surrenale | ct-surrenale-igr-5fx | GTV/ITV : rapporter D95 % et Dmoy. PTV : D99 % ≈ 90 % de la dose prescrite, D90 % ≈ dose prescrite ; rapporter D50 %, Dmoy, D2 %, D98 % |
| su-service-45-5 | SBRT avec gestion du mouvement respiratoire, IGRT | Aucune | sim-surrenale | vol-surrenale | ct-sbrt-abdo-5fx | D95 % du PTV = dose prescrite |
| su-60-8 | SBRT avec gestion du mouvement respiratoire, IGRT | Aucune | sim-surrenale | vol-surrenale |  |  |

## Curiethérapie

Pas de curiethérapie pour cette localisation.

## Centrage

**Tableau Simulation**

| id | position | contention | preparation | scanner | imagerie | reperes |
| --- | --- | --- | --- | --- | --- | --- |
| sim-surrenale | — | — | — | Scanner 4D pour l'ITV, ou blocage respiratoire | — | Fiduciaires possibles : le suivi de fiduciaires est associé à une BED10 et à un contrôle local à 1 an plus élevés ; complications de la pose 10,7 % dans la seule série qui les rapporte (Chen 2020) |

## Contourage

**Tableau Volumes**

| volumes\_id | nom | type | definition | quand | marge |
| --- | --- | --- | --- | --- | --- |
| vol-surrenale | GTV | GTV | Métastase surrénalienne | Toujours |  |
| vol-surrenale | ITV | ITV | Réunion des positions du GTV sur le cycle respiratoire ; Gustave Roussy rapporte la couverture du GTV/ITV | Respiration libre (scanner 4D) |  |
| vol-surrenale | PTV | PTV | ITV, ou GTV en blocage respiratoire, + marge selon la gestion du mouvement et l'IGRT | Toujours |  |

**Tableau Volumes — OAR et atlas**

| volumes\_id | oar\_ids | atlas |
| --- | --- | --- |
| vol-surrenale | oar-foie ; oar-estomac ; oar-duodenum ; oar-grele ; oar-colon ; oar-reins ; oar-rein-d ; oar-rein-g ; oar-moelle ; oar-paroi-thoracique ; oar-oesophage ; oar-voie-biliaire |  |

## Traitement systémique associé

Pas de traitement systémique associé à la RT dans ces schémas.

## Points d'attention

**Tableau Points d'attention**

| cible | point |
| --- | --- |
| su-oligo | Méta-régression : BED10 de 60, 80 et 100 Gy → contrôle local à 1 an de 70,5, 84,8 et 92,9 % ; toxicité de grade ≥ 3 : 1,8 % ; insuffisance surrénalienne de grade 2 : 0,5 % (Chen 2020) |
| su-oligo | Méta-analyse 2026 : contrôle local 91,7 % après surrénalectomie et 84,8 % après SABR ; avec une BED10 ≥ 100 Gy, 95 % à 1 an ; survie meilleure après chirurgie, probablement par sélection des patients (Giraud 2026) |
| su-oligo | Pour une BED10 de 60 à 80 Gy, 9 Gy ou plus par fraction : contrôle local à 1 an 91 % contre 78 % en dessous de 9 Gy (Liao 2023) |
| ct-surrenale-igr-5fx | Moelle : Gustave Roussy Dmax ≤ 28 Gy en 5 fractions ; HyTEC : Dmax 25,3 Gy en 5 fractions pour un risque de myélopathie de 1 à 5 % (jeu ct-hytec-moelle) |
| su-service-45-5 | Les contraintes du tableur du service reprennent les valeurs du consensus UK SABR en 5 fractions (jeu ct-sbrt-abdo-5fx) |
| su-60-8 | Pas de jeu de contraintes abdominal en 8 fractions dans la bibliothèque |
