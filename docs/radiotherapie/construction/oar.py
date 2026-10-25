# Bibliothèque des organes à risque (donnees-rt/oar.json), refaite le 25/10/2026 à la demande de Dr Bentahila :
# un seul nom TG-263 (liste officielle AAPM TG-263 v20170815 ; « construit » = absent de la liste, nommé selon ses règles),
# une seule définition de contourage (délinéation RecoRad, Noël et al. 2021, et atlas de référence), sans source entre parenthèses.
# paire = contrainte appliquée à chaque côté (une ligne « droite et gauche ») ; somme = contrainte appliquée à la structure réunie.
# Lancer : python3 docs/radiotherapie/construction/oar.py
import json, pathlib

ICI = pathlib.Path(__file__).resolve().parents[3]
SORTIE = ICI / "public" / "donnees-rt" / "oar.json"

# id, nom, TG-263, définition, région, options
O = [
  # ── Système nerveux central ──
  ("oar-encephale", "Encéphale", "Brain", "Parenchyme sus-tentoriel et cervelet, sans le tronc cérébral ; sur l'IRM fusionnée au scanner.", "snc", {}),
  ("oar-encephale-sain", "Encéphale moins PTV", "Brain-PTV", "Encéphale dont on retire le PTV (en stéréotaxie, chaque PTV ou lit opératoire).", "snc", {}),
  ("oar-tronc-cerebral", "Tronc cérébral", "Brainstem", "Mésencéphale, pont et bulbe, du plan des commissures postérieures jusqu'au sommet de l'apophyse odontoïde ; sans le cervelet ni l'aqueduc. Sa surface correspond aux 2 premiers millimètres d'épaisseur. IRM fusionnée.", "snc", {}),
  ("oar-cervelet", "Cervelet", "Cerebellum", "Hémisphères et vermis cérébelleux, sous la tente du cervelet, séparés du tronc par les pédoncules ; partie antérieure et postérieure séparées par la scissure primaire si besoin. IRM T1.", "snc", {}),
  ("oar-fosse-posterieure", "Fosse postérieure", "Fossa_Posterior", "Contenu de la fosse cérébrale postérieure : cervelet, tronc cérébral et quatrième ventricule, sous la tente du cervelet jusqu'au trou occipital.", "snc", {}),
  ("oar-lobe-temporal-d", "Lobe temporal droit", "Lobe_Temporal_R", "Du bord supérieur de la scissure de Sylvius à la base de la fosse cérébrale moyenne ; en avant l'os temporal et la grande aile du sphénoïde, en arrière le rocher, la tente du cervelet et la scissure préoccipitale ; en dedans le sinus caverneux et la selle turcique, hippocampe et gyrus parahippocampique inclus. IRM.", "snc", {"paire": "oar-lobes-temporaux"}),
  ("oar-lobe-temporal-g", "Lobe temporal gauche", "Lobe_Temporal_L", "Mêmes limites que le lobe temporal droit, à gauche.", "snc", {"paire": "oar-lobes-temporaux"}),
  ("oar-lobe-frontal", "Lobe frontal", "Lobe_Frontal", "Parenchyme en avant du sillon central et au-dessus de la scissure de Sylvius ; contouré quand la base du crâne antérieure est irradiée. IRM.", "snc", {}),
  ("oar-hippocampe-d", "Hippocampe droit", "Hippocampus_R", "Substance grise en hyposignal T1 le long de la corne temporale du ventricule latéral, de la tête (en avant) à la queue (sous le splénium) ; sans le gyrus parahippocampique. IRM T1 3D injectée fusionnée.", "snc", {"somme": "oar-hippocampes"}),
  ("oar-hippocampe-g", "Hippocampe gauche", "Hippocampus_L", "Mêmes limites que l'hippocampe droit, à gauche.", "snc", {"somme": "oar-hippocampes"}),
  ("oar-hippocampes", "Hippocampes", "Hippocampi", "Hippocampes droit et gauche réunis en une seule structure.", "snc", {}),
  ("oar-zone-evitement-hippocampique", "Zone d'évitement hippocampique", "Hippocampi_PRV05", "Hippocampes réunis + 5 mm, retirés du PTV de l'encéphale dans l'épargne hippocampique.", "snc", {"construit": True}),
  ("oar-chiasma", "Chiasma optique", "OpticChiasm", "Croisement des nerfs optiques au-dessus de la selle turcique, sous le troisième ventricule ; contouré en continuité avec les nerfs optiques et les bandelettes. IRM T1 injectée, vérifié sur le scanner.", "snc", {}),
  ("oar-bandelettes-optiques", "Bandelettes optiques", "OpticTract", "Prolongement postérieur du chiasma qui contourne les pédoncules cérébraux jusqu'au corps genouillé latéral. IRM.", "snc", {"construit": True}),
  ("oar-nerf-optique-d", "Nerf optique droit", "OpticNrv_R", "De la face postérieure du globe oculaire au chiasma, dans l'orbite puis le canal optique ; en continuité avec le chiasma. Scanner en fenêtre osseuse pour le canal, IRM.", "snc", {"paire": "oar-nerfs-optiques"}),
  ("oar-nerf-optique-g", "Nerf optique gauche", "OpticNrv_L", "Mêmes limites que le nerf optique droit, à gauche.", "snc", {"paire": "oar-nerfs-optiques"}),
  ("oar-oeil-d", "Œil droit", "Eye_R", "Globe oculaire entier, sclère incluse ; le patient regarde droit devant au scanner et pendant les séances.", "snc", {"paire": "oar-yeux"}),
  ("oar-oeil-g", "Œil gauche", "Eye_L", "Globe oculaire gauche entier, sclère incluse.", "snc", {"paire": "oar-yeux"}),
  ("oar-retine-d", "Rétine droite", "Retina_R", "Paroi des quatre cinquièmes postérieurs du globe (sclère, choroïde et rétine, indissociables au scanner), contourée sur 3 mm d'épaisseur.", "snc", {"paire": "oar-retines"}),
  ("oar-retine-g", "Rétine gauche", "Retina_L", "Paroi des quatre cinquièmes postérieurs du globe gauche, sur 3 mm d'épaisseur.", "snc", {"paire": "oar-retines"}),
  ("oar-cornee-d", "Cornée droite", "Cornea_R", "Partie antérieure transparente de la paroi du globe, en avant de la chambre antérieure, sur 3 mm d'épaisseur.", "snc", {"paire": "oar-cornees"}),
  ("oar-cornee-g", "Cornée gauche", "Cornea_L", "Partie antérieure de la paroi du globe gauche, sur 3 mm d'épaisseur.", "snc", {"paire": "oar-cornees"}),
  ("oar-cristallin-d", "Cristallin droit", "Lens_R", "Lentille biconvexe dense visible dans l'humeur aqueuse ; ne pas contourer un implant (vérifier l'interrogatoire). Scanner sans injection.", "snc", {"paire": "oar-cristallins"}),
  ("oar-cristallin-g", "Cristallin gauche", "Lens_L", "Lentille du globe gauche ; ne pas contourer un implant.", "snc", {"paire": "oar-cristallins"}),
  ("oar-glande-lacrymale-d", "Glande lacrymale droite", "Glnd_Lacrimal_R", "Glande de la partie supéro-externe et antérieure de l'orbite, contre le toit orbitaire. Scanner sans injection.", "snc", {"paire": "oar-glandes-lacrymales"}),
  ("oar-glande-lacrymale-g", "Glande lacrymale gauche", "Glnd_Lacrimal_L", "Glande de la partie supéro-externe et antérieure de l'orbite gauche.", "snc", {"paire": "oar-glandes-lacrymales"}),
  ("oar-cochlee-d", "Cochlée droite", "Cochlea_R", "Spirale osseuse de l'oreille interne, en avant et en dehors du conduit auditif interne. Scanner en fenêtre osseuse, sans injection.", "snc", {"paire": "oar-cochlees"}),
  ("oar-cochlee-g", "Cochlée gauche", "Cochlea_L", "Spirale osseuse de l'oreille interne gauche. Scanner en fenêtre osseuse.", "snc", {"paire": "oar-cochlees"}),
  ("oar-oreille-interne-d", "Oreille interne droite", "Ear_Internal_R", "Cochlée, vestibule et canaux semi-circulaires, avec le conduit auditif interne. Scanner en fenêtre osseuse.", "snc", {"paire": "oar-oreilles-internes"}),
  ("oar-oreille-interne-g", "Oreille interne gauche", "Ear_Internal_L", "Cochlée, vestibule, canaux semi-circulaires et conduit auditif interne gauches.", "snc", {"paire": "oar-oreilles-internes"}),
  ("oar-hypophyse", "Hypophyse", "Pituitary", "Glande dans la selle turcique, sous le diaphragme sellaire ; tige pituitaire exclue. Scanner en fenêtre osseuse et IRM.", "snc", {}),
  ("oar-hypothalamus", "Hypothalamus", "Hypothalmus", "Deux volumes de part et d'autre du troisième ventricule, entre les coupes des commissures antérieure et postérieure, jusqu'au plancher du troisième ventricule ; corps mamillaires inclus ; latéralement 3 mm du ventricule. IRM.", "snc", {}),
  ("oar-nerfs-craniens", "Nerfs crâniens", "CN", "Nerfs crâniens (hors nerfs optiques) au contact du volume cible, contourés sur leur trajet intracrânien et à la base du crâne. IRM T1 injectée.", "snc", {"construit": True}),
  ("oar-cuir-chevelu", "Cuir chevelu", "Scalp", "Peau et tissu sous-cutané de la voûte crânienne sur 5 mm, en regard des faisceaux.", "snc", {}),
  # ── ORL ──
  ("oar-parotide-d", "Parotide droite", "Parotid_R", "Glande entière : du conduit auditif externe et de la mastoïde (en haut) à l'angle de la mandibule (en bas) ; en avant le masséter, en dedans l'espace parapharyngé ; lobe profond et prolongement antérieur inclus. Scanner injecté.", "orl", {"paire": "oar-parotides"}),
  ("oar-parotide-g", "Parotide gauche", "Parotid_L", "Glande parotide gauche entière, mêmes limites que la droite.", "orl", {"paire": "oar-parotides"}),
  ("oar-glande-sous-max-d", "Glande sous-mandibulaire droite", "Glnd_Submand_R", "Glande de la loge sous-mandibulaire, sous le muscle mylohyoïdien, entre le corps de la mandibule et le ventre antérieur du digastrique. Scanner injecté.", "orl", {"paire": "oar-glandes-sous-max"}),
  ("oar-glande-sous-max-g", "Glande sous-mandibulaire gauche", "Glnd_Submand_L", "Glande de la loge sous-mandibulaire gauche.", "orl", {"paire": "oar-glandes-sous-max"}),
  ("oar-cavite-orale", "Cavité orale", "Cavity_Oral", "En haut la muqueuse du palais dur, en bas la base de langue et l'os hyoïde (en arrière) puis le mylohyoïdien et le digastrique (en avant), en avant la face interne de la mandibule et du maxillaire, en arrière le voile, la luette et la base de langue ; dents et air exclus.", "orl", {}),
  ("oar-levres", "Lèvres", "Lips", "Lèvres supérieure et inférieure, de la peau à la muqueuse, en avant des dents ; latéralement les commissures.", "orl", {}),
  ("oar-mandibule", "Mandibule", "Bone_Mandible", "Os de la mandibule sans les dents, des condyles à la symphyse ; peut être divisé en sextants. Scanner en fenêtre osseuse.", "orl", {}),
  ("oar-atm-d", "Articulation temporo-mandibulaire droite", "Joint_TM_R", "Condyle mandibulaire et fosse mandibulaire de l'os temporal, de la base du crâne au col du condyle.", "orl", {"paire": "oar-atm"}),
  ("oar-atm-g", "Articulation temporo-mandibulaire gauche", "Joint_TM_L", "Condyle et fosse mandibulaire gauches.", "orl", {"paire": "oar-atm"}),
  ("oar-constricteurs", "Muscles constricteurs du pharynx", "Musc_Constrict", "Constricteurs supérieur, moyen et inférieur, de l'apophyse ptérygoïde (en haut) jusqu'au bord inférieur du cartilage cricoïde (en bas), sur 3 mm d'épaisseur en arrière de la lumière pharyngée.", "orl", {}),
  ("oar-pharynx", "Pharynx", "Pharynx", "Muqueuse et paroi du pharynx, du nasopharynx au bord inférieur du cricoïde, lumière exclue.", "orl", {}),
  ("oar-larynx", "Larynx", "Larynx", "Larynx sus-glottique (épiglotte, bandes ventriculaires, replis ary-épiglottiques) et glottique, de la pointe de l'épiglotte au bord inférieur du cricoïde, cartilages inclus, air exclu.", "orl", {}),
  ("oar-oesophage-cervical", "Œsophage cervical", "Esophagus_S", "De 1 cm sous le bord inférieur du cricoïde jusqu'au niveau de C7 ; bouche œsophagienne et muscle cricopharyngien inclus.", "orl", {}),
  ("oar-thyroide", "Thyroïde", "Glnd_Thyroid", "Glande thyroïde entière, lobes et isthme. Scanner injecté.", "orl", {}),
  ("oar-carotide-d", "Artère carotide droite", "A_Carotid_R", "Carotide commune droite depuis le tronc brachiocéphalique, puis carotide interne jusqu'à la base du crâne ; carotide externe exclue. Scanner injecté.", "orl", {"paire": "oar-carotides"}),
  ("oar-carotide-g", "Artère carotide gauche", "A_Carotid_L", "Carotide commune gauche depuis la crosse aortique, puis carotide interne jusqu'à la base du crâne.", "orl", {"paire": "oar-carotides"}),
  ("oar-canal-parotidien", "Canal parotidien", "Parotid_Duct", "Canal de Sténon, du bord antérieur de la parotide à son abouchement en regard de la deuxième molaire supérieure.", "orl", {"construit": True}),
  ("oar-muscles-nuque", "Muscles postérieurs du cou", "Musc_Neck_Post", "Muscles de la nuque en arrière des processus épineux, de l'occiput à C7.", "orl", {"construit": True}),
  # ── Thorax ──
  ("oar-poumons", "Poumons", "Lungs", "Poumons droit et gauche en fenêtre pulmonaire, sans la trachée ni les bronches souches ; on en retire le PTV (ou l'ITV en stéréotaxie) pour les contraintes.", "thorax", {}),
  ("oar-poumon-d", "Poumon droit", "Lung_R", "Poumon droit en fenêtre pulmonaire, sans le hile ni les bronches souches.", "thorax", {"somme": "oar-poumons"}),
  ("oar-poumon-g", "Poumon gauche", "Lung_L", "Poumon gauche en fenêtre pulmonaire, sans le hile ni les bronches souches.", "thorax", {"somme": "oar-poumons"}),
  ("oar-poumon-homolateral", "Poumon homolatéral", "Lung_Ipsi", "Poumon du côté traité, en fenêtre pulmonaire.", "sein", {"construit": True}),
  ("oar-poumon-controlateral", "Poumon controlatéral", "Lung_Contra", "Poumon du côté opposé au traitement, en fenêtre pulmonaire.", "sein", {"construit": True}),
  ("oar-coeur", "Cœur", "Heart", "Cœur et péricarde, du bord inférieur de l'artère pulmonaire (au-dessus) jusqu'à l'apex ; aorte ascendante et veine cave supérieure exclues. Scanner injecté.", "thorax", {}),
  ("oar-iva", "Artère interventriculaire antérieure", "A_LAD", "Branche de la coronaire gauche dans le sillon interventriculaire antérieur, de son origine à l'apex ; contourée avec une marge de 2 à 3 mm si elle est mal visible. Scanner injecté.", "thorax", {}),
  ("oar-ventricule-gauche", "Ventricule gauche", "Ventricle_L", "Cavité et paroi myocardique du ventricule gauche, de la valve mitrale à l'apex. Scanner injecté.", "thorax", {}),
  ("oar-valves", "Valves cardiaques", "Valve", "Valves aortique, mitrale, pulmonaire et tricuspide, contourées à leur anneau. Scanner injecté.", "thorax", {}),
  ("oar-gros-vaisseaux", "Gros vaisseaux", "GreatVes", "Aorte thoracique, artère pulmonaire et ses branches principales, veines caves ; paroi et lumière, 5 mm au-delà de la paroi. Scanner injecté.", "thorax", {}),
  ("oar-oesophage", "Œsophage", "Esophagus", "Du bord inférieur du cricoïde jusqu'à la jonction œsogastrique, paroi et lumière, en fenêtre médiastinale.", "thorax", {}),
  ("oar-trachee", "Trachée", "Trachea", "Du bord inférieur du cricoïde jusqu'à 2 cm au-dessus de la carène, paroi cartilagineuse incluse (fenêtre parenchymateuse) ; la suite appartient à l'arbre bronchique proximal.", "thorax", {}),
  ("oar-arbre-bronchique", "Arbre bronchique proximal", "Bronchus", "Les 2 derniers centimètres de la trachée, la carène, les bronches souches, intermédiaire et lobaires jusqu'à leur première division, en fenêtre pulmonaire.", "thorax", {}),
  ("oar-plexus-brachial-d", "Plexus brachial droit", "BrachialPlex_R", "Racines C5 à T1 de leur sortie des trous de conjugaison, entre les scalènes antérieur et moyen, puis sous la clavicule jusqu'au bord externe de la première côte. Scanner injecté.", "thorax", {"paire": "oar-plexus-brachiaux"}),
  ("oar-plexus-brachial-g", "Plexus brachial gauche", "BrachialPlex_L", "Mêmes limites que le plexus brachial droit, à gauche.", "thorax", {"paire": "oar-plexus-brachiaux"}),
  ("oar-paroi-thoracique", "Paroi thoracique", "Chestwall", "Expansion de 2 cm autour du poumon, du bord du corps vertébral (racines incluses) au bord latéral du sternum ; peau, sternum et vertèbres exclus ; 2 à 3 cm au-dessus et au-dessous du PTV.", "thorax", {}),
  ("oar-cotes", "Côtes", "Rib", "Côtes en regard du volume cible, os cortical et médullaire ; numérotées si besoin.", "thorax", {}),
  ("oar-sein-controlateral", "Sein controlatéral", "Breast_Contra", "Glande mammaire du côté opposé, mêmes limites cliniques que le sein traité, repérées au scanner (fil radio-opaque).", "sein", {"construit": True}),
  ("oar-tete-humerale", "Tête humérale", "Humerus_Head", "Tête humérale du côté traité, jusqu'au col chirurgical.", "sein", {"construit": True}),
  # ── Abdomen ──
  ("oar-foie", "Foie", "Liver", "Foie entier, vésicule biliaire et veine cave inférieure exclues ; en stéréotaxie, on en retire le GTV ou le CTV pour les contraintes. Scanner injecté.", "abdomen", {}),
  ("oar-voie-biliaire", "Voie biliaire principale", "BileDuct_Common", "Canal hépatique commun et cholédoque, de la confluence biliaire à l'ampoule de Vater.", "abdomen", {}),
  ("oar-estomac", "Estomac", "Stomach", "Estomac entier, du cardia au pylore, paroi et contenu. Scanner injecté, idéalement à jeun.", "abdomen", {}),
  ("oar-duodenum", "Duodénum", "Duodenum", "Du pylore à l'angle duodéno-jéjunal, paroi et contenu. Scanner injecté.", "abdomen", {}),
  ("oar-grele", "Intestin grêle (sac péritonéal)", "Bag_Bowel", "Cavité péritonéale contenant les anses intestinales : en avant et latéralement la paroi abdominale, en arrière les muscles et les vaisseaux, de la première coupe au-dessus du rectum (ou de la jonction recto-sigmoïdienne) jusqu'à 2 cm au-dessus du PTV ; sigmoïde exclu.", "abdomen", {}),
  ("oar-colon", "Côlon", "Colon", "Côlon ascendant, transverse et descendant, paroi et contenu, en regard du champ.", "abdomen", {}),
  ("oar-pancreas", "Pancréas", "Pancreas", "Tête, crochet, corps et queue du pancréas. Scanner injecté.", "abdomen", {}),
  ("oar-rate", "Rate", "Spleen", "Rate entière, hile inclus.", "abdomen", {}),
  ("oar-reins", "Reins", "Kidneys", "Reins droit et gauche réunis en une seule structure.", "abdomen", {}),
  ("oar-rein-d", "Rein droit", "Kidney_R", "Parenchyme et cavités du rein droit, hile inclus. Scanner injecté.", "abdomen", {"somme": "oar-reins"}),
  ("oar-rein-g", "Rein gauche", "Kidney_L", "Parenchyme et cavités du rein gauche, hile inclus.", "abdomen", {"somme": "oar-reins"}),
  ("oar-hile-renal", "Hile rénal", "Kidney_Hilums", "Artère et veine rénales et bassinet, du sinus rénal à l'aorte et à la veine cave.", "abdomen", {}),
  ("oar-greffon-renal", "Greffon rénal", "Kidney_Transplant", "Rein transplanté dans la fosse iliaque, parenchyme et cavités.", "abdomen", {"construit": True}),
  # ── Pelvis ──
  ("oar-vessie", "Vessie", "Bladder", "Paroi externe de la vessie entière, du dôme au col vésical ; contenu inclus.", "pelvis", {}),
  ("oar-rectum", "Rectum", "Rectum", "Paroi externe du rectum, contenu inclus, de la jonction anorectale (en bas) jusqu'à la jonction recto-sigmoïdienne, là où il se porte vers l'avant (en haut).", "pelvis", {}),
  ("oar-sigmoide", "Sigmoïde", "Colon_Sigmoid", "De la jonction recto-sigmoïdienne jusqu'au côlon descendant, paroi et contenu.", "pelvis", {}),
  ("oar-canal-anal", "Canal anal", "Canal_Anal", "De la jonction anorectale (relèvement des releveurs) jusqu'à la marge anale, paroi et sphincters inclus.", "pelvis", {}),
  ("oar-tete-femorale-d", "Tête fémorale droite", "Femur_Head_R", "Tête et col du fémur, jusqu'au bas du petit trochanter.", "pelvis", {"paire": "oar-tetes-femorales"}),
  ("oar-tete-femorale-g", "Tête fémorale gauche", "Femur_Head_L", "Tête et col du fémur gauche, jusqu'au bas du petit trochanter.", "pelvis", {"paire": "oar-tetes-femorales"}),
  ("oar-bulbe", "Bulbe pénien", "PenileBulb", "Renflement du corps spongieux sous l'apex prostatique et le diaphragme urogénital, au-dessus de la racine des corps caverneux. IRM T2 utile.", "pelvis", {}),
  ("oar-uretre", "Urètre", "Urethra", "Urètre prostatique, sur l'IRM T2 fusionnée ou repéré par sonde ; tracé au pinceau de 7 mm de diamètre si mal visible.", "pelvis", {}),
  ("oar-oge", "Organes génitaux externes", "Genitals", "Homme : verge et scrotum, peau incluse. Femme : vulve (grandes et petites lèvres, clitoris).", "pelvis", {}),
  ("oar-vulve", "Vulve", "Vulva", "Grandes et petites lèvres, clitoris et vestibule, peau incluse.", "pelvis", {}),
  ("oar-vagin", "Vagin", "Vagina", "Paroi vaginale, du col (ou du fond vaginal) à l'introït.", "pelvis", {}),
  ("oar-uterus", "Utérus", "Uterus", "Corps et col utérins, sans distinction.", "pelvis", {}),
  ("oar-ovaire-d", "Ovaire droit", "Ovary_R", "Ovaire en place ou transposé (clips repères). IRM utile.", "pelvis", {"paire": "oar-ovaires"}),
  ("oar-ovaire-g", "Ovaire gauche", "Ovary_L", "Ovaire gauche en place ou transposé.", "pelvis", {"paire": "oar-ovaires"}),
  ("oar-testicule-controlateral", "Testicule controlatéral", "Testis_Contra", "Testicule restant, dans la bourse, contour externe.", "pelvis", {"construit": True}),
  ("oar-os-pelviens", "Os pelviens", "Bone_Pelvic", "Os iliaques, sacrum et coccyx, en regard du champ, cortical et médullaire.", "pelvis", {}),
  ("oar-aile-iliaque-d", "Aile iliaque droite", "Bone_Ilium_R", "Os iliaque droit, de la crête iliaque jusqu'au toit du cotyle.", "pelvis", {"paire": "oar-ailes-iliaques"}),
  ("oar-aile-iliaque-g", "Aile iliaque gauche", "Bone_Ilium_L", "Os iliaque gauche, de la crête iliaque jusqu'au toit du cotyle.", "pelvis", {"paire": "oar-ailes-iliaques"}),
  ("oar-moelle-osseuse", "Moelle osseuse", "BoneMarrow", "Os du bassin dans le champ : rachis lombo-sacré (L5 et sacrum), os iliaques et partie basse du bassin (pubis, ischions, cotyles, têtes fémorales).", "pelvis", {}),
  ("oar-plexus-sacre", "Plexus sacré", "SacralPlex", "Racines L4 à S3, de leur sortie des trous de conjugaison et des foramens sacrés jusqu'à la grande échancrure sciatique.", "pelvis", {}),
  ("oar-nerf-sciatique", "Nerf sciatique", "Nrv_Sciatic", "Nerf sciatique, de la grande échancrure sciatique sur toute la hauteur du champ, entre le grand fessier et les pelvi-trochantériens.", "pelvis", {"construit": True}),
  ("oar-sillon-fessier", "Sillon interfessier", "Skin_Gluteal", "Peau et tissu sous-cutané (5 mm) du sillon interfessier en regard du champ.", "pelvis", {"construit": True}),
  ("oar-plis-inguinaux", "Plis inguinaux", "Skin_Inguinal", "Peau et tissu sous-cutané (5 mm) des plis de l'aine en regard du champ.", "pelvis", {"construit": True}),
  ("oar-point-rv", "Point recto-vaginal", "Pt_RectoVag", "Point de la paroi vaginale postérieure en regard du centre des sources vaginales (anneau ou ovoïdes), 5 mm sous la muqueuse.", "pelvis", {"construit": True}),
  ("oar-help-ctvhr10", "CTV-HR + 10 mm (aide)", "CTV_HR_Ev10", "Structure d'aide : CTV haut risque + 10 mm, zone où la curiethérapie délivre déjà une forte dose ; limite les points chauds de la radiothérapie externe.", "pelvis", {"construit": True}),
  # ── Rachis ──
  ("oar-moelle", "Moelle épinière", "SpinalCord", "Moelle visible sur l'IRM fusionnée (ou canal médullaire osseux au scanner), du trou occipital jusqu'au cône terminal, sur toute la hauteur du champ.", "rachis", {}),
  ("oar-canal-medullaire", "Canal médullaire", "SpinalCanal", "Canal rachidien osseux (bord interne des corps vertébraux, pédicules et lames), sur toute la hauteur du champ.", "rachis", {}),
  ("oar-sac-dural", "Sac dural", "ThecalSac", "Sac thécal (dure-mère et son contenu) sur l'IRM T2 fusionnée, utilisé à la place de la moelle en stéréotaxie rachidienne et en réirradiation.", "rachis", {}),
  ("oar-queue-cheval", "Queue de cheval", "CaudaEquina", "Racines dans le sac dural, du cône terminal (vers L1–L2) jusqu'au bas du sac. IRM.", "rachis", {}),
  ("oar-racines-nerveuses", "Racines nerveuses", "Nrv_Root", "Racines du ou des niveaux traités, du foramen jusqu'à 2 cm en dehors, surtout en cas d'atteinte foraminale.", "rachis", {}),
  # ── Divers ──
  ("oar-peau", "Peau", "Skin", "Contour externe moins 3 mm (5 mm en stéréotaxie rénale), en regard des faisceaux.", "divers", {}),
  ("oar-os-longs", "Os longs", "Bone_Long", "Os long irradié (fémur, humérus, tibia…), cortical et médullaire, sur toute la hauteur du champ.", "divers", {"construit": True}),
  ("oar-corps", "Corps (contour externe)", "External", "Contour externe du patient.", "divers", {}),
]

PAIRES = {
  "oar-lobes-temporaux": "Lobes temporaux (droit et gauche)", "oar-nerfs-optiques": "Nerfs optiques (droit et gauche)", "oar-yeux": "Yeux (droit et gauche)",
  "oar-retines": "Rétines (droite et gauche)", "oar-cornees": "Cornées (droite et gauche)", "oar-cristallins": "Cristallins (droit et gauche)",
  "oar-glandes-lacrymales": "Glandes lacrymales (droite et gauche)", "oar-cochlees": "Cochlées (droite et gauche)", "oar-oreilles-internes": "Oreilles internes (droite et gauche)",
  "oar-parotides": "Parotides (droite et gauche)", "oar-glandes-sous-max": "Glandes sous-mandibulaires (droite et gauche)", "oar-atm": "Articulations temporo-mandibulaires (droite et gauche)",
  "oar-carotides": "Artères carotides (droite et gauche)", "oar-plexus-brachiaux": "Plexus brachiaux (droit et gauche)", "oar-tetes-femorales": "Têtes fémorales (droite et gauche)",
  "oar-ovaires": "Ovaires (droit et gauche)", "oar-ailes-iliaques": "Ailes iliaques (droite et gauche)",
}

def construire():
  vus, oar = set(), []
  for id_, nom, tg, df, reg, opt in O:
    assert id_ not in vus, id_; vus.add(id_)
    x = {"id": id_, "nom": nom, "nom_tg263": tg, "definition": df, "region": reg}
    x.update(opt); oar.append(x)
  paires = [{"id": k, "nom": v, "membres": [o["id"] for o in oar if o.get("paire") == k]} for k, v in PAIRES.items()]
  for p in paires: assert len(p["membres"]) == 2, p
  for o in oar:
    if "somme" in o: assert o["somme"] in vus, o
  return {"version": "2026-10-25", "note": "Nom TG-263 : liste officielle AAPM TG-263 v20170815 ; « construit » = absent de la liste, nommé selon ses règles. Définition : délinéation RecoRad (Noël et al. 2021) et atlas de référence.", "oar": oar, "paires": paires}

if __name__ == "__main__":
  d = construire()
  SORTIE.write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n")
  print(len(d["oar"]), "OAR,", len(d["paires"]), "paires →", SORTIE)
