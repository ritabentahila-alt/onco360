# Bibliothèque — Organes à risque

Mise à jour : Oct 24, 2026

## Organes à risque (pelvis, thorax, abdomen, SNC)

Un OAR = une définition, partagée par toutes les localisations. La définition de référence est celle de l'atlas international quand il existe (RTOG 2012 pour le pelvis, EPTN 2018 pour le SNC) ; la variante Curie, sur laquelle ses contraintes ont été établies, est donnée à côté. Contraintes appliquées sans marge (pas de PRV) sauf mention contraire. Région pour le filtre : `pelvis` pour le premier tableau et ses deux compléments ; colonne `region` dans les suites (`thorax`, `abdomen`, `snc`).

**Tableau OAR**

| id | nom | nom\_tg263 | definition | source |
| --- | --- | --- | --- | --- |
| oar-vessie | Vessie | Bladder | Contour externe sur toute la hauteur de l'organe (Curie), col vésical inclus (fiche du service). Scanner avec contraste ou IRM utiles pour le dôme et la base | Curie 2021 ; RTOG 2012 |
| oar-rectum | Rectum | Rectum | Référence RTOG (tumeurs urologiques) : contour externe du niveau le plus bas des tubérosités ischiatiques jusqu'à la perte de sa forme ronde, là où il rejoint le sigmoïde. Variante Curie : limite inférieure à la dernière coupe où les ischions sont visibles, ou 1 cm sous le bord caudal du PTV si celui-ci descend plus bas ; limite supérieure à la jonction recto-sigmoïde (le rectum se projette vers l'avant) | RTOG 2012 ; Curie 2021 |
| oar-sigmoide | Sigmoïde | Colon\_Sigmoid | Au-dessus de la jonction recto-sigmoïde jusqu'à l'angle colique gauche | Curie 2021 |
| oar-grele | Intestin grêle (sac péritonéal) | Bag\_Bowel | Sac péritonéal à l'intérieur des muscles de la paroi, côlons droit et gauche inclus, de la première coupe au-dessus du rectum jusqu'à 2 cm au-dessus de la dernière coupe du CTV (Curie) ; RTOG : arrêt 1 cm au-dessus du PTV en technique coplanaire. Inclure les anses qui descendent devant ou à côté de la vessie ou du mésorectum. Latéralement : parois pelviennes, sans la graisse périvasculaire du CTV pelvien. En SBRT, le sigmoïde y est inclus | Curie 2021 ; RTOG 2012 |
| oar-tete-femorale-d | Tête fémorale droite | Femur\_Head\_R (tête, Curie) ; Femur\_R (fémur proximal, RTOG) | Référence RTOG : fémur proximal (tête, col et trochanters) jusqu'au niveau le plus bas des tubérosités ischiatiques. Variante Curie : depuis sa limite supérieure jusqu'au grand trochanter. Fiche OAR du service : jusqu'au petit trochanter (écart E05) | RTOG 2012 ; Curie 2021 |
| oar-tete-femorale-g | Tête fémorale gauche | Femur\_Head\_L (tête, Curie) ; Femur\_L (fémur proximal, RTOG) | Comme la droite | RTOG 2012 ; Curie 2021 |
| oar-bulbe | Bulbe pénien | PenileBulb | Structure ronde sous l'apex prostatique ; IRM ou urétrographie aident. Erreurs fréquentes : trop haut près de l'apex, trop en avant, forme triangulaire ou rectangulaire, diamètre réduit à celui de l'urètre | RTOG 2012 ; facultatif en SBRT (Curie) |
| oar-uretre | Urètre | Urethra | Sur IRM T2 fusionnée : outil pinceau de 7 mm de diamètre centré sur l'urètre. Facultatif en SBRT si non visible | Curie 2021 (SBRT) |
| oar-canal-medullaire | Canal médullaire | SpinalCanal | De L3 jusqu'à 2 cm au-dessus de la dernière coupe des CTV (irradiation lombo-aortique) | Curie 2021 |
| oar-queue-cheval | Queue de cheval | CaudaEquina | Contenu du canal rachidien à partir de L2 | Fiche OAR du service |
| oar-rein-d | Rein droit | Kidney\_R | Contour externe du rein en totalité (irradiation lombo-aortique) | Curie 2021 |
| oar-rein-g | Rein gauche | Kidney\_L | Comme le droit | Curie 2021 |
| oar-foie | Foie | Liver | Contour externe du foie en totalité (irradiation lombo-aortique) | Curie 2021 |

**OAR cités par les tableurs du service** (même tableau OAR ; définition à compléter quand la localisation concernée sera traitée)

| id | nom | nom\_tg263 | definition | source |
| --- | --- | --- | --- | --- |
| oar-moelle | Moelle épinière | SpinalCord | Moelle épinière sur toute la hauteur du champ ; à contourer si irradiation lombo-aortique (EMBRACE II, Curie). À défaut, utiliser le canal médullaire (oar-canal-medullaire) | EMBRACE II ; Curie 2021 ; tableurs du service |
| oar-moelle-osseuse | Moelle osseuse pelvienne | Bone\_Marrow | Contour externe des os du bassin dans le champ, en trois sous-régions : rachis lombo-sacré (L5 et sacrum), os iliaques, bassin inférieur (pubis, ischions, cotyles, fémurs proximaux). V10 ≥ 90 % associé à plus de toxicité hématologique sous cisplatine | Mell 2006 (cité par Curie) ; tableurs du service |
| oar-anus | Anus | Anus | Nom des tableurs gynéco pour le canal anal : même structure que oar-canal-anal (l'import fusionne les deux sous oar-canal-anal) | Tableur du service |
| oar-sillon-fessier | Sillon interfessier |  | Peau et tissu sous-cutané du sillon interfessier en regard du champ (définition usuelle : le tableur n'en donne pas) | Tableur du service |
| oar-rate | Rate | Spleen | Rate entière, contour externe (définition usuelle) | Tableur du service |
| oar-oge | Organes génitaux externes | Genitals | Femme : vulve (voir oar-vulve). Homme : pénis et scrotum, contour externe (définition usuelle : les tableurs n'en donnent pas) | Tableur du service |

**OAR ajoutés par le lot pelvis (gynéco, rectum, canal anal)** (même tableau OAR ; « définition usuelle » = la source cite l'organe sans le définir)

| id | nom | nom\_tg263 | definition | source |
| --- | --- | --- | --- | --- |
| oar-canal-anal | Canal anal | Anus | De la jonction ano-rectale (fin du rectum) à la marge anale | Fiche vagin-vulve du service ; fiches rectum et canal anal |
| oar-vulve | Vulve | Vulva | Grandes et petites lèvres, contour externe ; à contourer en particulier si irradiation ganglionnaire seule (vulve) | Curie 2021 ; fiche vagin-vulve |
| oar-vagin | Vagin | Vagina | Paroi vaginale, contour externe. Point PIBS : bord postéro-inférieur de la symphyse pubienne projeté sur l'axe du vagin ; PIBS − 2 cm : 2 cm plus bas sur cet axe | EMBRACE II |
| oar-point-rv | Point recto-vaginal ICRU | — | Point sur la paroi vaginale postérieure, à hauteur du centre des sources vaginales (anneau ou ovoïdes) | EMBRACE II (ICRU) |
| oar-help-ctvhr10 | Help contour CTV-HR + 10 mm | — | Structure d'aide : CTV-HR + 10 mm, où la curiethérapie délivre déjà une forte dose ; sert à limiter les points chauds de RTE | EMBRACE II ; Curie 2021 |
| oar-corps | Corps (contour externe) | External | Contour externe du patient | EMBRACE II ; Curie 2021 |
| oar-plexus-sacre | Plexus sacré | SacralPlex | Racines sacrées de leur sortie des foramens sacrés jusqu'à la grande échancrure sciatique (définition usuelle) ; à contourer si boost ganglionnaire ou boost centro-pelvien en RTE | Curie 2021 |
| oar-duodenum | Duodénum | Duodenum | Du pylore à l'angle duodéno-jéjunal, contour externe (définition usuelle) ; à contourer si irradiation lombo-aortique au-dessus de L1 | Curie 2021 ; EMBRACE II |
| oar-ovaire-d | Ovaire droit | Ovary\_R | Ovaire en place ou transposé ; à contourer si transposition ovarienne ou femme non ménopausée | Curie 2021 |
| oar-ovaire-g | Ovaire gauche | Ovary\_L | Comme le droit | Curie 2021 |
| oar-uterus | Utérus | Uterus | Corps et col utérins ; à contourer si préservation de la fertilité (vulve) | Curie 2021 (vulve) |
| oar-aile-iliaque-d | Aile iliaque droite | Ilium\_R | Crête et aile iliaque, jusqu'au cotyle | Fiches endomètre et vagin-vulve du service |
| oar-aile-iliaque-g | Aile iliaque gauche | Ilium\_L | Comme la droite | Fiches du service |
| oar-estomac | Estomac | Stomach | Estomac entier, contour externe (définition usuelle) ; irradiation lombo-aortique | Tableur « GYNECO 45Gy + BOOST » |
| oar-plis-inguinaux | Plis inguinaux | — | Peau des plis de l'aine en regard du champ (définition usuelle) | Tableur « Canal anal » |
| oar-greffon-renal | Greffon rénal | — | Rein transplanté (fosse iliaque), contour externe | Tableur « Canal anal » |

**Tableau OAR** (suite — thorax et abdomen ; colonne `region` à reprendre telle quelle)

| id | nom | nom\_tg263 | definition | source | region |
| --- | --- | --- | --- | --- | --- |
| oar-poumons | Poumons | Lungs | Poumons droit et gauche en fenêtre parenchymateuse, sans la trachée ni les bronches souches. En SBRT : poumons moins (i)GTV | Atlas RTOG (Kong 2011) ; Institut Curie SBRT | thorax |
| oar-poumon-d | Poumon droit | Lung\_R | Poumon droit en fenêtre parenchymateuse | Atlas RTOG (Kong 2011) | thorax |
| oar-poumon-g | Poumon gauche | Lung\_L | Poumon gauche en fenêtre parenchymateuse | Atlas RTOG (Kong 2011) | thorax |
| oar-coeur | Cœur | Heart | Oreillettes et ventricules, de l'émergence des gros vaisseaux à l'apex ; sans l'aorte descendante. Gustave Roussy : limite haute une coupe sous le tronc de l'artère pulmonaire, limite basse le diaphragme | Fiche OAR du service ; Gustave Roussy SBRT 2016 | thorax |
| oar-oesophage | Œsophage | Esophagus | Du cartilage cricoïde à la jonction œsogastrique, paroi et lumière, en fenêtre médiastinale | Fiche OAR du service ; QUANTEC 2010 | thorax |
| oar-trachee | Trachée | Trachea | Trachée jusqu'à 2 cm au-dessus de la carène (le reste appartient à l'arbre bronchique proximal) | Gustave Roussy SBRT 2016 | thorax |
| oar-arbre-bronchique | Arbre bronchique proximal |  | Une seule structure : 2 cm distaux de la trachée, carène, bronches souches, bronches lobaires supérieure, intermédiaire et inférieure droites, supérieure et inférieure gauches | Institut Curie SBRT | thorax |
| oar-gros-vaisseaux | Gros vaisseaux | GreatVes | Aorte, artère pulmonaire, veines pulmonaires ; veine cave si lésion droite proche | Institut Curie SBRT ; Gustave Roussy SBRT 2016 | thorax |
| oar-plexus-brachial-d | Plexus brachial droit | BrachialPlex\_R | De C5 à T1, depuis les trous de conjugaison, entre les scalènes. Contouré si le GTV est à moins de 1 cm ; PRV = + 5 mm | Fiche OAR du service ; Institut Curie SBRT ; atlas RTOG (Kong 2011) | thorax |
| oar-plexus-brachial-g | Plexus brachial gauche | BrachialPlex\_L | Comme le plexus droit | Fiche OAR du service ; Institut Curie SBRT ; atlas RTOG (Kong 2011) | thorax |
| oar-paroi-thoracique | Paroi thoracique | Chestwall | Expansion de 2 cm autour du poumon, sans médiastin, peau, sternum ni vertèbres (Curie). Gustave Roussy : côtes et muscles intercostaux compris, 3 cm au-dessus et au-dessous du PTV | Institut Curie SBRT ; Gustave Roussy SBRT 2016 | thorax |
| oar-cotes | Côtes |  | Côtes en regard du volume cible, numérotation facultative | Institut Curie SBRT ; Gustave Roussy foie SBRT 2016 | thorax |
| oar-peau | Peau | Skin | Contour externe moins 3 mm | Institut Curie SBRT | thorax |
| oar-thyroide | Thyroïde | Thyroid | Glande thyroïde (définition usuelle : les fiches n'en donnent pas) | Fiche du service | thorax |
| oar-larynx | Larynx | Larynx | Larynx (définition usuelle : la fiche n'en donne pas) | Fiche du service | thorax |
| oar-colon | Côlon | Colon | Côlon en regard du champ (définition usuelle) | Tableurs Gustave Roussy | abdomen |
| oar-voie-biliaire | Voie biliaire principale |  | Canal cholédoque (définition usuelle) | ESTRO ACROP pancréas 2021 | abdomen |
| oar-reins | Reins | Kidneys | Reins droit et gauche additionnés | ESTRO ACROP pancréas 2021 | abdomen |

**Tableau OAR** (suite — système nerveux central ; colonne `region` à reprendre telle quelle)

| id | nom | nom\_tg263 | definition | source | region |
| --- | --- | --- | --- | --- | --- |
| oar-encephale | Encéphale | Brain | Hémisphères cérébraux, cervelet et tronc cérébral (Curie). Fiche OAR du service : parenchyme cérébral, sans le tronc ni le cervelet s'ils sont contourés à part | Institut Curie, métastases cérébrales 2021 ; fiche OAR du service | snc |
| oar-encephale-sain | Encéphale sain |  | Encéphale moins les cibles. Stéréotaxie : moins chaque GTV (tumeur en place) et chaque lit opératoire (Curie) ; Gustave Roussy : encéphale moins PTV. Fractionnement classique : encéphale moins PTV (fiche glioblastome) | Institut Curie 2021 ; Gustave Roussy neuro-stéréotaxie 2016 ; fiche glioblastome du service | snc |
| oar-tronc-cerebral | Tronc cérébral | Brainstem | Mésencéphale, pont et bulbe, de l'émergence du mésencéphale à la jonction bulbo-médullaire ; sans le cervelet. Erreurs fréquentes : inclure le cervelet, s'arrêter trop haut | Fiche OAR du service ; atlas EPTN 2018 | snc |
| oar-cervelet | Cervelet | Cerebellum | Hémisphères et vermis cérébelleux (définition usuelle : les fiches le citent sans le définir) | Fiche OAR et fiche encéphale in toto du service | snc |
| oar-chiasma | Chiasma optique | OpticChiasm | Structure en X au-dessus de la selle turcique, à la jonction des nerfs optiques ; IRM, vérifiée sur le scanner. Curie y inclut la portion proximale des bandelettes optiques | Fiches OAR et glioblastome du service ; Institut Curie 2021 | snc |
| oar-bandelettes-optiques | Bandelettes optiques |  | Prolongement postérieur du chiasma (définition usuelle) ; contourées avec le chiasma chez Curie | Fiche stéréotaxie cérébrale du service ; Institut Curie 2021 | snc |
| oar-nerf-optique-d | Nerf optique droit | OpticNrv\_R | De l'arrière du globe au chiasma, en suivant le canal optique ; IRM et scanner en fenêtres parenchymateuse et osseuse | Fiches OAR et glioblastome du service | snc |
| oar-nerf-optique-g | Nerf optique gauche | OpticNrv\_L | Comme le droit | Fiches OAR et glioblastome du service | snc |
| oar-oeil-d | Œil droit | Eye\_R | Globe oculaire, scanner en fenêtre parenchymateuse | Fiche glioblastome du service | snc |
| oar-oeil-g | Œil gauche | Eye\_L | Comme le droit | Fiche glioblastome du service | snc |
| oar-retine-d | Rétine droite | Retina\_R | Paroi postérieure du globe oculaire (définition usuelle : les tableurs la citent sans la définir) | Tableurs du service ; fiche stéréotaxie cérébrale | snc |
| oar-retine-g | Rétine gauche | Retina\_L | Comme la droite | Tableurs du service ; fiche stéréotaxie cérébrale | snc |
| oar-cristallin-d | Cristallin droit | Lens\_R | Scanner en fenêtre parenchymateuse | Fiche glioblastome du service | snc |
| oar-cristallin-g | Cristallin gauche | Lens\_L | Comme le droit | Fiche glioblastome du service | snc |
| oar-cochlee-d | Cochlée droite | Cochlea\_R | Petit volume osseux dense de l'oreille interne, en avant du conduit auditif interne ; scanner en fenêtre osseuse, coupes de 1 mm au plus | Fiche OAR du service ; QUANTEC 2010 (Bhandare) | snc |
| oar-cochlee-g | Cochlée gauche | Cochlea\_L | Comme la droite | Fiche OAR du service ; QUANTEC 2010 (Bhandare) | snc |
| oar-hippocampe-d | Hippocampe droit | Hippocampus\_R | Contouré sur l'IRM T1 3D injectée fusionnée au scanner | Institut Curie 2021 ; RTOG 0933 | snc |
| oar-hippocampe-g | Hippocampe gauche | Hippocampus\_L | Comme le droit | Institut Curie 2021 ; RTOG 0933 | snc |
| oar-hippocampes | Hippocampes | Hippocampi | Hippocampes droit et gauche réunis en une structure | RTOG 0933 (Pokhrel 2015) | snc |
| oar-zone-evitement-hippocampique | Zone d'évitement hippocampique | Hippocampi\_PRV05 | Hippocampes + 5 mm ; retirée du PTV encéphale dans l'épargne hippocampique | Gondi 2010 ; RTOG 0933 | snc |
| oar-hypophyse | Hypophyse | Pituitary | Loge hypophysaire, scanner en fenêtres parenchymateuse et osseuse | Fiche glioblastome du service ; Institut Curie 2021 | snc |
| oar-hypothalamus | Hypothalamus | Hypothalamus | IRM, vérifié sur le scanner | Fiche glioblastome du service | snc |
| oar-glande-lacrymale-d | Glande lacrymale droite | Glnd\_Lacrimal\_R | Scanner en fenêtres osseuse et parenchymateuse | Fiche glioblastome du service | snc |
| oar-glande-lacrymale-g | Glande lacrymale gauche | Glnd\_Lacrimal\_L | Comme la droite | Fiche glioblastome du service | snc |
| oar-cavite-orale | Cavité orale | Cavity\_Oral | Scanner en fenêtre osseuse | Fiche glioblastome du service | snc |
| oar-parotide-d | Parotide droite | Parotid\_R | Scanner en fenêtres parenchymateuse et osseuse | Fiche glioblastome du service | snc |
| oar-parotide-g | Parotide gauche | Parotid\_L | Comme la droite | Fiche glioblastome du service | snc |
| oar-nerfs-craniens | Nerfs crâniens (hors nerfs optiques) |  | Nerfs crâniens au contact de la cible, contourés s'ils sont concernés (définition usuelle) | Institut Curie 2021 | snc |

**Tableau OAR** (suite — lot B tête et cou, sein ; colonne `region` à reprendre telle quelle)

| id | nom | nom\_tg263 | definition | source | region |
| --- | --- | --- | --- | --- | --- |
| oar-glande-sous-max-d | Glande sous-mandibulaire droite | Glnd\_Submand\_R | Glande sous-maxillaire (sous-mandibulaire), contourée sur le scanner | Institut Curie 2021 ; fiche ORL du service ; consensus Brouwer 2015 | orl |
| oar-glande-sous-max-g | Glande sous-mandibulaire gauche | Glnd\_Submand\_L | Comme la droite | Institut Curie 2021 ; fiche ORL du service ; consensus Brouwer 2015 | orl |
| oar-atm-d | Articulation temporo-mandibulaire droite | Joint\_TM\_R | Articulation temporo-mandibulaire | Institut Curie 2021 ; Gustave Roussy 2017 | orl |
| oar-atm-g | Articulation temporo-mandibulaire gauche | Joint\_TM\_L | Comme la droite | Institut Curie 2021 ; Gustave Roussy 2017 | orl |
| oar-mandibule | Mandibule | Bone\_Mandible | Mandibule entière | Institut Curie 2021 ; Gustave Roussy 2017 ; fiche ORL du service | orl |
| oar-constricteurs | Muscles constricteurs du pharynx | Musc\_Constrict | Constricteurs supérieur, moyen et inférieur (Curie) ; dans DARS, la partie hors volume haute dose | Institut Curie 2021 ; DARS (Nutting 2023) | orl |
| oar-levres | Lèvres | Lips | Lèvres supérieure et inférieure | Institut Curie 2021 ; Gustave Roussy 2017 | orl |
| oar-oreille-interne-d | Oreille interne droite |  | Cochlée, vestibule et conduit auditif interne (Curie) | Institut Curie 2021 | orl |
| oar-oreille-interne-g | Oreille interne gauche |  | Comme la droite | Institut Curie 2021 | orl |
| oar-lobe-temporal-d | Lobe temporal droit |  | Contouré si la base du crâne est irradiée (template Curie « ORL cavum/sinus ») | Institut Curie 2021 ; Gustave Roussy 2017 | orl |
| oar-lobe-temporal-g | Lobe temporal gauche |  | Comme le droit | Institut Curie 2021 ; Gustave Roussy 2017 | orl |
| oar-lobe-frontal | Lobe frontal |  | Contouré si la base du crâne est irradiée | Institut Curie 2021 ; Gustave Roussy 2017 | orl |
| oar-fosse-posterieure | Fosse postérieure |  | Contenu de la fosse cérébrale postérieure (contrainte de Gustave Roussy) | Gustave Roussy 2017 | orl |
| oar-muscles-nuque | Muscles postérieurs du cou |  | Muscles de la nuque (Gustave Roussy ; « nuque » dans la fiche du service) | Gustave Roussy 2017 ; fiche ORL du service | orl |
| oar-poumon-homolateral | Poumon homolatéral |  | Poumon du côté traité, contouré sur le scanner de planification | FAST-Forward (Brunt 2020) | sein |
| oar-sein-controlateral | Sein controlatéral |  | Sein opposé au côté traité | Sénorif 2021-2022 | sein |

**Tableau OAR** (suite — lot E os, stéréotaxie, surrénale, réirradiation ; colonne `region` à reprendre telle quelle)

| id | nom | nom\_tg263 | definition | source | region |
| --- | --- | --- | --- | --- | --- |
| oar-sac-dural | Sac dural |  | Sac dural (thécal), utilisé comme substitut de la moelle pour les doses de réirradiation en SBRT | HyTEC 2021 (Sahgal : moelle) ; Sahgal 2012 | rachis |
| oar-racines-nerveuses | Racines nerveuses |  | Racines nerveuses du ou des niveaux traités, surtout en cas d'atteinte foraminale | Fiche du service « stéréotaxie osseuse vertébrale » | rachis |
| oar-nerf-sciatique | Nerf sciatique |  | À contourer en cas d'extension latérale (rachis lombaire bas, sacrum) | Fiche du service « stéréotaxie osseuse vertébrale » | pelvis |
| oar-pharynx | Pharynx |  | Pharynx, en SBRT du rachis cervical | Fiche du service « stéréotaxie osseuse vertébrale » ; tableur du service « vertèbre stéréo 2 × 12 » | orl |
| oar-pancreas | Pancréas | Pancreas | Pancréas, en SBRT du rachis dorso-lombaire | Fiche du service « stéréotaxie osseuse vertébrale » | abdomen |
| oar-carotide-d | Artère carotide droite | A\_Carotid\_R | Artère carotide commune et interne droite | RTOG 9911 et Gustave Roussy (de Crevoisier 1998) : hémorragies carotidiennes après réirradiation | orl |
| oar-carotide-g | Artère carotide gauche | A\_Carotid\_L | Comme la droite | RTOG 9911 et Gustave Roussy (de Crevoisier 1998) : hémorragies carotidiennes après réirradiation | orl |

Variantes du sac péritonéal (`oar-grele`) selon les fiches du service : jusqu'à 1 cm au-dessus du PTV (rectum, canal anal), jusqu'à 4 cm au-dessus de la dernière coupe du PTV1 (vagin, vulve). Le module affiche la variante notée entre parenthèses dans le tableau « Volumes — OAR et atlas » de chaque localisation.

Nomenclature : noms TG-263 (AAPM) en colonne `nom_tg263`, utilisés dans le TPS ; nom français affiché dans l'app.
