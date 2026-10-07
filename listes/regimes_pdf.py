# Régimes de radiothérapie pelvienne (COURRIERS.docx de Dr Bentahila, 07/10/2026) : source des PDF de public/documents/.
# Pour les refaire : python3 listes/regimes_pdf.py (dans listes/), puis imprimer regime-fr.html et regime-darija.html en PDF avec Chrome.
# Régimes radiothérapie pelvienne (fichier COURRIERS.docx de Dr Bentahila) -> 2 pages HTML imprimées en PDF
CSS = """
@page{size:A4;margin:13mm 14mm 14mm}
*{box-sizing:border-box}
body{margin:0;font-family:%(font)s;color:#1f2a3d;font-size:10pt;line-height:1.42;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.tete{border:1.5px solid #3563B0;border-radius:10px;padding:9px 14px;text-align:center;margin-bottom:10px;background:#F2F6FD}
.tete h1{margin:0;color:#3563B0;font-size:15pt;line-height:1.3}
.tete p{margin:3px 0 0;color:#4a5875;font-size:9.5pt}
h2{color:#3563B0;font-size:11.5pt;margin:12px 0 5px;padding-bottom:3px;border-bottom:1px solid #C9D6EE;break-after:avoid}
h3{font-size:10.5pt;margin:8px 0 3px;break-after:avoid}
p{margin:0 0 5px}
ul{margin:3px 0 6px;padding-%(debut)s:18px}li{margin:0 0 3px}
table{width:100%%;border-collapse:collapse;margin:4px 0 6px;font-size:9.3pt}
th,td{border:1px solid #C9D6EE;padding:5px 7px;vertical-align:top;text-align:%(debut)s}
th{color:#fff;background:#3563B0}
th.ok{background:#2E8B57}th.non{background:#C0392B}
td.cat{font-weight:bold;background:#F2F6FD;width:19%%}
td.ok{background:#F3FAF6}td.non{background:#FDF3F2}
tr{break-inside:avoid}
td ul{margin:0;padding-%(debut)s:14px}td li{margin:0 0 2px}
.menu{border:1px solid #C9D6EE;border-radius:8px;padding:6px 12px;background:#FAFBFE}
.menu p{margin:4px 0}
.note{margin-top:10px;font-size:8.8pt;color:#4a5875;text-align:center;border-top:1px solid #C9D6EE;padding-top:6px}
.lat{unicode-bidi:isolate;direction:ltr;font-family:Arial,Helvetica,sans-serif}
"""
def page(lang, titre, sous, corps, note, rtl=False):
    font = '"Geeza Pro","SF Arabic",Arial,sans-serif' if rtl else 'Arial,Helvetica,sans-serif'
    css = CSS % {"font": font, "debut": "right" if rtl else "left"}
    return ('<!DOCTYPE html><html lang="%s" dir="%s"><head><meta charset="utf-8"><title>%s</title><style>%s</style></head><body>'
            '<div class="tete"><h1>%s</h1>%s</div>%s<p class="note">%s</p></body></html>') % (lang, "rtl" if rtl else "ltr", titre.replace("<br>", " "), css, titre, ('<p>%s</p>' % sous) if sous else "", corps, note)
def ul(items): return "<ul>" + "".join("<li>%s</li>" % i for i in items) + "</ul>"
def tableau(entetes, lignes):
    h = '<table><thead><tr><th>%s</th><th class="ok">%s</th><th class="non">%s</th></tr></thead><tbody>' % entetes
    for cat, ok, non in lignes: h += '<tr><td class="cat">%s</td><td class="ok">%s</td><td class="non">%s</td></tr>' % (cat, ul(ok), ul(non))
    return h + "</tbody></table>"

# ───────────── Français ─────────────
FR = []
FR.append("<h2>1. Objectifs du régime</h2>")
FR.append("<p>Pendant la radiothérapie de la région pelvienne (prostate, rectum, col ou corps de l'utérus, vessie, canal anal), les rayons traversent les organes digestifs situés dans le bassin. Cela peut provoquer une irritation de la muqueuse de l'intestin et du rectum.</p>")
FR.append("<p>L'objectif de ce guide nutritionnel, adapté aux habitudes marocaines, est de :</p>")
FR.append(ul(["<b>Ralentir le transit intestinal</b> afin d'éviter ou de limiter la diarrhée et les douleurs abdominales.",
              "<b>Mettre le tube digestif au repos</b> en supprimant temporairement les aliments irritants et très riches en fibres.",
              "<b>Prévenir la déshydratation et la perte de poids</b> grâce à un apport suffisant en eau et en protéines légères."]))
FR.append("<h2>2. Les aliments : à privilégier et à éviter</h2>")
FR.append("<p>Ce tableau récapitule les aliments à privilégier et ceux à suspendre pendant toute la durée du traitement et pendant les 2 à 3 semaines qui suivent la fin de la radiothérapie.</p>")
FR.append(tableau(("Catégorie", "À privilégier", "À éviter ou limiter"), [
 ("Féculents et pain", ["Pain blanc (khobz d'farine), batbout blanc, pain de mie blanc", "Riz blanc bien cuit à l'eau", "Semoule fine (smida), vermicelles", "Pâtes blanches, pommes de terre à l'eau ou en purée (sans beurre)"],
  ["Pain complet, pain d'orge (khobz d'chair), son de blé", "Riz complet, flocons d'avoine", "Viennoiseries, sfenj, msemen trop gras"]),
 ("Légumineuses", ["Suspendre temporairement toutes les légumineuses"],
  ["Lentilles (aadess), pois chiches (hommos), haricots blancs (loubia), fèves (foul), petits pois"]),
 ("Viandes, poissons et œufs", ["Poulet et dinde sans la peau (vapeur, bouilli, poêlé sans gras)", "Poissons blancs (merlan, sole, espadon) au four, sans épices fortes", "Œufs durs ou pochés"],
  ["Viandes rouges grasses, agneau gras, viande hachée très épicée", "Khliaa, gueddid (viandes séchées et salées)", "Poissons gras frits, sardines frites"]),
 ("Légumes", ["Carottes cuites (en purée ou en rondelles bien fondantes)", "Courgettes pelées, épépinées et cuites à l'eau", "Soupes et moulinés de carottes et pommes de terre, filtrés"],
  ["Tous les légumes crus (salades, tomates, concombres, oignons crus)", "Légumes qui donnent des gaz : chou, chou-fleur, brocoli, navets, artichauts, poivrons"]),
 ("Fruits", ["Bananes bien mûres (écrasées)", "Pommes et poires cuites (compotes maison peu sucrées)", "Coings cuits à l'eau (sfarjal, sans épices)"],
  ["Fruits crus avec peau ou pépins (agrumes, fraises, figues, kiwis)", "Figues de barbarie (hendia, karmouss)", "Fruits secs (dattes, figues sèches, raisins secs)"]),
 ("Produits laitiers", ["Yaourt nature, fromage blanc doux", "Fromage fondu (Kiri, La Vache qui rit, fromage rouge en petite quantité)", "Lait sans lactose, s'il est bien toléré"],
  ["Lait entier cru", "Lben et raïb traditionnels (surtout en cas de diarrhée)", "Fromages très fermentés ou très gras"]),
 ("Épices et condiments", ["Sel avec modération, persil, coriandre finement hachés", "Un filet d'huile d'olive, ajouté cru en fin de cuisson", "Huile neutre (tournesol, colza)"],
  ["Harissa, piment fort (felfla harra)", "Poivre noir (lebzar) en excès, gingembre fort", "Olives, citrons confits (l'hamd marqad), smen"]),
 ("Boissons", ["Eau plate : 1,5 à 2 litres par jour", "Eau de cuisson du riz (ma d'rouz)", "Verveine (louiza), thé vert très léger", "Bouillon de volaille filtré et dégraissé"],
  ["Jus d'agrumes (orange, citron, pamplemousse)", "Café fort, thé très concentré", "Sodas et boissons gazeuses"]),
]))
FR.append("<h2>3. Exemple de menus d'une journée (cuisine marocaine)</h2>")
FR.append("<p>Des idées de repas simples à préparer à la maison, avec des recettes traditionnelles adaptées pour être faciles à digérer :</p>")
FR.append('<div class="menu">' + "".join("<p><b>%s</b> %s</p>" % m for m in [
 ("Petit-déjeuner (ftour) :", "batbout blanc chaud ou pain blanc + 1 à 2 portions de fromage doux (Kiri, La Vache qui rit) ou 1 œuf dur + verveine (louiza) tiède ou thé vert très léger peu sucré. Autre choix : hssoua de semoule fine (smida) cuite à l'eau, avec une pincée de sel et un peu de lait léger."),
 ("Déjeuner (ghda) :", "velouté léger de carottes et pommes de terre + blanc de poulet poêlé sans matière grasse ou filet de merlan au four au persil + riz blanc bien cuit. Dessert : banane bien mûre écrasée ou compote de pommes maison."),
 ("Collation (kass-kroute) :", "verveine (louiza) tiède + 2 à 3 biscuits secs (type Petit Beurre) ou batbout blanc avec un filet de miel."),
 ("Dîner (aacha) :", "chorba légère aux vermicelles avec de petits dés de blanc de dinde et des carottes bien cuites (sans épices fortes), ou tajine léger (blanc de poulet, carottes et courgettes cuits à l'étouffée, sans smen ni piment) avec du pain blanc. Dessert : pomme cuite au four, sans la peau."),
]) + "</div>")
FR.append("<h2>4. Conseils pratiques en cas de diarrhée ou d'irritation</h2>")
FR.append("<h3>A. L'eau de cuisson du riz (ma d'rouz) : un remède naturel efficace</h3>")
FR.append("<p>En cas de selles molles ou liquides, faites bouillir du riz blanc dans une grande quantité d'eau légèrement salée. Récupérez l'eau de cuisson, laissez-la tiédir ou refroidir, et buvez-en un grand verre 2 à 3 fois par jour. L'amidon tapisse l'intestin irrité et aide à ralentir le transit.</p>")
FR.append("<h3>B. Les bonnes habitudes à table</h3>")
FR.append(ul(["<b>Fractionner les repas :</b> 4 à 5 petits repas légers par jour plutôt que 2 grands repas.",
              "<b>Manger lentement :</b> bien mâcher chaque bouchée.",
              "<b>Boire régulièrement :</b> au moins 1,5 litre d'eau plate par jour, par petites gorgées, entre les repas plutôt que pendant.",
              "<b>Température :</b> manger les plats tièdes ou à température ambiante (éviter le très chaud et le très froid)."]))
NOTE_FR = "Ce document est un guide d'accompagnement nutritionnel. N'hésitez pas à demander conseil à votre médecin ou à votre équipe soignante pour toute adaptation à votre état de santé."
open("regime-fr.html", "w", encoding="utf8").write(page("fr", "Guide nutritionnel et régime alimentaire<br>pendant une radiothérapie pelvienne", "Conseils pratiques et alimentation adaptée aux habitudes marocaines (épargne digestive)", "".join(FR), NOTE_FR))

# ───────────── Darija (de droite à gauche) ─────────────
L = lambda t: '<span class="lat">%s</span>' % t  # mots en lettres latines, bien placés dans le texte arabe
AR = []
AR.append("<h2>1. أهداف النظام الغذائي: نريّحو الجهاز الهضمي</h2>")
AR.append("<p>خلال حصص العلاج بالأشعة لمنطقة الحوض (البروستات، المستقيم، عنق أو جسم الرحم، المثانة، القناة الشرجية)، الأشعة كدوز من الأعضاء الهضمية اللي كاينين فالحوض. هاد الشي يقدر يدير تهيّج فالمخاطية ديال المصران والمستقيم.</p>")
AR.append("<p>الأهداف ديال هاد الدليل الغذائي المكيّف مع العادات المغربية هي:</p>")
AR.append(ul(["<b>نقصو من الحركة ديال المصران " + L("(transit)") + ":</b> باش نتفاداو ولا ننقصو من الإسهال والحريق فالكرش.",
              "<b>نريّحو الجهاز الهضمي:</b> نحبسو مؤقتاً الماكلة اللي كتهيّج المصران ولا اللي فيها الألياف بزاف.",
              "<b>نحميو من الجفاف ونقص الوزن:</b> بالشرب الكافي ديال الما والماكلة الخفيفة الغنية بالبروتينات."]))
AR.append("<h2>2. جدول الماكلة: المسموح والممنوع مؤقتاً</h2>")
AR.append("<p>هاد الجدول فيه الماكلة اللي خاصنا نفضلوها، والماكلة اللي خاصنا نتفاداوها مؤقتاً طول مدة العلاج بالأشعة، وحتى 2 ولا 3 سيمانات من بعد ما يسالي العلاج.</p>")
AR.append(tableau(("نوع الماكلة", "المسموح (اللي خاصنا نفضلو)", "اللي خاصنا نتفاداو ولا ننقصو"), [
 ("النشويات والخبز", ["الخبز البيض (خبز الفارينة)، البطبوط البيض، خبز الطوست البيض", "الروز البيض مسلوق مزيان فالما", "السميدة الرقيقة، الشعرية، المقارونية البيضاء", "البطاطا مسلوقة فالما ولا بيري (بلا زبدة)"],
  ["الخبز الكامل، خبز الشعير، النخالة", "الروز الكامل، الخرطال " + L("(flocons d'avoine)"), "الحلويات، السفنج، المسمن والحرشة اللي فيهم الدهنة بزاف"]),
 ("القطاني", ["نحبسو جميع أنواع القطاني مؤقتاً طول مدة العلاج"],
  ["العدس، الحمص، اللوبيا البيضاء، الفول، الجلبانة"]),
 ("اللحم، الحوت والبيض", ["الدجاج والبيبي بلا جلدة (على البخار، مسلوق ولا مقلي بلا دهنة)", "الحوت البيض (الميرلان، الصول، السبادون) فالفران بلا عطرية حارة", "البيض مسلوق مزيان ولا " + L("poché")],
  ["اللحم الحمر اللي فيه الشحمة، الغنمي، الكفتة المعطّرة بزاف", "الخليع والقديد", "الحوت المقلي، السردين المقلي"]),
 ("الخضرة", ["الخيزو طايب مزيان (بيري ولا طرف رطبين)", "الكرعة الخضرا مقشرة، بلا زريعة، مسلوقة فالما", "الصوبة ديال الخيزو والبطاطا مطحونة ومصفية"],
  ["جميع الخضرة النية (الشلاظة، مطيشة، الخيار، البصلة النية)", "الخضرة اللي كتنفخ: الكرنب، الشوفلور، البروكولي، اللفت، القوق، الفلفلة"]),
 ("الفواكه", ["البنان طايب مزيان ومهروس", "التفاح والبوعويد طايبين (كومبوت دالدار بشوية ديال السكر)", "السفرجل مسلوق فالما بلا عطرية"],
  ["الفواكه النية بقشرتها ولا بزريعتها (الليمون، الفريز، الكرموس، الكيوي)", "الهندية (الكرموس الهندي)", "الفواكه الجافة (التمر، الشريحة، الزبيب)"]),
 ("الحليب ومشتقاتو", ["الدانون العادي " + L("(nature)") + "، الجبن البيض الخفيف", "الفرماج الذايب (" + L("Kiri, La Vache qui rit") + "، الفرماج الحمر بشوية)", "الحليب بلا لاكتوز إلا كان كيناسبكم"],
  ["الحليب الكامل النيّ", "اللبن والرايب البلدي (خصوصاً إلا كان الإسهال)", "الفرماج القوي ولا اللي فيه الدهنة بزاف"]),
 ("العطرية والتوابل", ["الملحة بشوية، المعدنوس والقزبر مقطعين رقاق", "شوية ديال زيت الزيتون نية فاللخر ديال الطياب", "الزيت العادية (زيت المائدة)"],
  ["الهريسة، الفلفلة الحارة", "الإبزار بزاف، سكين جبير الحار", "الزيتون، الحامض المرقد، السمن البلدي"]),
 ("المشروبات", ["الما العادي: من لتر ونص حتى 2 لتر فالنهار", "ما سليقة الروز", "اللويزة، أتاي خفيف بزاف", "مرقة الدجاج مصفية وبلا دهنة"],
  ["عصير الليمون والحامض والبامبلموس", "القهوة القاصحة، أتاي المشحر بزاف", "المونادا والمشروبات الغازية"]),
]))
AR.append("<h2>3. مثال ديال الماكلة فنهار (الماكلة المغربية)</h2>")
AR.append("<p>شي أفكار ديال وجبات ساهلة توجدوها فالدار، بوصفات مغربية تقليدية مكيّفة باش تكون خفيفة وساهلة فالهضم:</p>")
AR.append('<div class="menu">' + "".join("<p><b>%s</b> %s</p>" % m for m in [
 ("الفطور:", "بطبوط بيض سخون ولا خبز بيض + 1 ولا 2 ديال الفرماج الخفيف (" + L("Kiri, La Vache qui rit") + ") ولا بيضة مسلوقة + كاس ديال اللويزة دافية ولا أتاي خفيف بزاف بشوية ديال السكر. ولا: حسوة ديال السميدة الرقيقة طايبة فالما بشوية ديال الملحة وشوية ديال الحليب."),
 ("الغدا:", "صوبة خفيفة ديال الخيزو والبطاطا + صدر الدجاج مقلي بلا دهنة ولا الميرلان فالفران بالمعدنوس + روز بيض مسلوق مزيان. الديسير: بنانة طايبة مهروسة ولا كومبوت ديال التفاح دالدار."),
 ("الكاسكروط:", "كاس ديال اللويزة دافية + 2 ولا 3 ديال البيسكوي الناشف (بحال " + L("Petit Beurre") + ") ولا بطبوط بيض بشوية ديال العسل."),
 ("العشا:", "حريرة ولا شوربة خفيفة بالشعرية مع طرف صغار ديال صدر البيبي وخيزو طايب مزيان (بلا عطرية حارة)، ولا طاجين خفيف (صدر الدجاج، خيزو وكرعة خضرا طايبين على خاطرهم بلا سمن وبلا حار) مع الخبز البيض. الديسير: تفاحة بلا قشرة مشوية فالفران."),
]) + "</div>")
AR.append("<h2>4. نصائح عملية إلا كان الإسهال ولا التهيّج</h2>")
AR.append("<h3>أ. ما سليقة الروز: دوا طبيعي مزيان</h3>")
AR.append("<p>إلا كانت الكرش جارية، غليو الروز البيض فما كثير بشوية ديال الملحة. صفيو الما ديال الروز، خليوه يبرد شوية، وشربو منو كاس كبير 2 ولا 3 المرات فالنهار. النشا اللي فيه كيغلّف المصران وكيعاون باش تنقص الحركة ديال الكرش.</p>")
AR.append("<h3>ب. العادات المزيانة فالماكلة</h3>")
AR.append(ul(["<b>قسمو الماكلة:</b> كولو 4 ولا 5 وجبات صغار وخفاف فالنهار، فبلاصة 2 وجبات كبار.",
              "<b>كولو بشوية:</b> مضغو الماكلة مزيان باش تسهلو الخدمة على المعدة.",
              "<b>شربو الما بانتظام:</b> على الأقل لتر ونص ديال الما فالنهار، بجغيمات صغار بين الوجبات (ماشي وسط الماكلة).",
              "<b>السخانة ديال الماكلة:</b> كولو الماكلة دافية ولا عادية (تفاداو الماكلة السخونة بزاف ولا الباردة بزاف)."]))
NOTE_AR = "هاد الوثيقة دليل غذائي للمواكبة. ما تترددوش تسولو الطبيب ديالكم ولا الفريق اللي كيعالجكم على أي تعديل خاص بالحالة الصحية ديالكم."
open("regime-darija.html", "w", encoding="utf8").write(page("ar", "دليل التغذية والنظام الغذائي<br>خلال العلاج بالأشعة لمنطقة الحوض", "نصائح عملية وماكلة مكيّفة مع العادات المغربية", "".join(AR), NOTE_AR, rtl=True))
print("ok")
