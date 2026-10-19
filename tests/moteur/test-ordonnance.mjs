// Lot R-E (19/10/2026) : zones « À compléter », doublons, familles d'allergie, pages : node tests/moteur/test-ordonnance.mjs
import { marquerZones, zoneRestante, doublonsDe, doublonsListe, famillesDe, alertesAllergie, texteAlerte, paginer, chimioOrale, comprimes, doseOrale, remplirZones } from "../../public/js/moteur/ordonnance.js";
let ok = 0, ko = 0;
const t = (c, m, d) => { if (c) { ok++; console.log("  ✔ " + m); } else { ko++; console.log("  ✘ " + m + (d === undefined ? "" : " " + JSON.stringify(d))); } };

console.log("Zones à compléter");
const z = marquerZones("… comprimés de 500 mg le matin pendant [durée à compléter]");
t(z === '<mark class="or-ac">À compléter</mark> comprimés de 500 mg le matin pendant <mark class="or-ac">durée à compléter</mark>', "« … » et « [durée à compléter] » deviennent des zones", z);
t(marquerZones("pendant Durée à compléter") === 'pendant <mark class="or-ac">Durée à compléter</mark>', "texte « Durée à compléter » relu en clair : redevient une zone (sans double zone)", marquerZones("pendant Durée à compléter"));
t(marquerZones("1 comprimé par jour") === "1 comprimé par jour", "texte sans zone inchangé");
t((marquerZones("… et …").match(/<mark/g) || []).length === 2, "deux « … » : deux zones");
t(zoneRestante("durée à compléter") && zoneRestante("À compléter") && !zoneRestante("28 jours"), "zone restante reconnue");

console.log("Doublons");
const items = [{ nom: "PARACÉTAMOL 1 g", poso: "x" }, { nom: "CHEMOSET (ondansétron) 8 mg", poso: "y" }];
t(JSON.stringify(doublonsDe(items, [{ nom: "Paracetamol 1 g" }, { nom: "COTIPRED (prednisolone) 20 mg" }])) === '["Paracetamol 1 g"]', "PARACÉTAMOL déjà dans l'ordonnance (sans accents, majuscules)");
t(JSON.stringify(doublonsListe(["A", "B", "a", "C", "A"])) === "[\"a\"]", "doublons dans une liste (chaque nom une fois)");

console.log("Familles d'allergie");
t(famillesDe("Pénicilline, iode").map((f) => f.k).join() === "peni,iode", "« Pénicilline, iode » : pénicillines et produits de contraste");
let a = alertesAllergie("pénicilline", [{ nom: "AUGMENTIN (amoxicilline + acide clavulanique) 1 g" }, { nom: "ROCÉPHINE 1 g" }, { nom: "PARACÉTAMOL 1 g" }]);
t(a.length === 2 && a[0].famille === "pénicillines" && !a[0].croisee && a[1].croisee === "pénicillines", "AUGMENTIN : pénicilline ; ROCÉPHINE : croisée à vérifier ; paracétamol : rien", a);
t(/à vérifier/.test(texteAlerte(a[1])), "texte de l'allergie croisée : « à vérifier »", texteAlerte(a[1]));
a = alertesAllergie("AINS", [{ nom: "BUFREN (ibuprofène) 400 mg" }, { nom: "ARCOXIA 90 mg", classe: "Anti-inflammatoire non stéroïdien (coxib)" }, { nom: "PENTASA (mésalazine) 1 g", classe: "Anti-inflammatoire intestinal (rectite)" }, { nom: "KARDÉGIC 75 mg" }]);
t(a.length === 3 && a.every((x) => !/PENTASA/.test(x.nom)) && a[2].croisee, "AINS : ibuprofène, ARCOXIA par sa classe, aspirine croisée ; pas PENTASA", a);
a = alertesAllergie("iode", [{ nom: "TDM thoracique injectée" }, { nom: "IRM pelvienne" }, { nom: "Uro-TDM" }]);
t(a.length === 2, "iode : scanners injectés, pas l'IRM", a);
a = alertesAllergie("morphine", [{ nom: "MOSCONTIN LP (sulfate de morphine) 10 mg" }, { nom: "TRAMAL LP (tramadol) 100 mg" }, { nom: "CEDOL (paracétamol 400 mg + codéine 20 mg)" }]);
t(a.length === 3, "morphiniques : morphine, tramadol, codéine", a);
a = alertesAllergie("sulfamides", [{ nom: "BACTRIM FORTE (sulfaméthoxazole + triméthoprime)" }, { nom: "FLAMMAZINE (sulfadiazine argentique) crème" }]);
t(a.length === 2, "sulfamides : BACTRIM, sulfadiazine", a);
a = alertesAllergie("CHEMOSET", [{ nom: "CHEMOSET (ondansétron) 8 mg" }], ["CHEMOSET"]);
t(a.length === 1 && a[0].mot === "chemoset", "mot de l'allergie hors table : alerte aussi (ligne libre comprise)", a);
t(alertesAllergie("", [{ nom: "AUGMENTIN 1 g" }]).length === 0, "pas d'allergie notée : rien");
t(alertesAllergie("iode", [{ nom: "CIODEX" }]).length === 0, "« iode » ne déclenche pas sur un mot qui le contient au milieu");

console.log("Pages");
const B = [{ h: 60 }, { h: 30 }, { h: 30, lie: 1 }, { h: 30 }, { h: 30, lie: 1 }, { h: 30 }, { h: 30, lie: 1 }, { h: 40, lie: 1 }];
let p = paginer(B, 400, 380);
t(p.length === 1, "tout tient sur une page", p);
p = paginer(B, 170, 300);
t(p.length === 2 && JSON.stringify(p[0]) === "[0,1,2]" && JSON.stringify(p[1]) === "[3,4,5,6,7]", "médicament jamais coupé ; signature avec le dernier médicament", p);
p = paginer(B, 200, 300);
t(p.length === 2 && p[1].indexOf(7) >= 0 && p[1].indexOf(5) >= 0, "la signature part avec le dernier médicament plutôt que seule", p);
p = paginer([{ h: 10 }, { h: 900 }, { h: 10, lie: 1 }], 400, 400);
t(p.length === 2 && JSON.stringify(p[1]) === "[1,2]", "bloc trop grand : sur une page à lui seul", p);

console.log("Chimiothérapie orale calculée");
const cap = chimioOrale("CAPÉCITABINE (XELODA) 500 mg / 150 mg");
t(cap && cap.k === "capecitabine" && chimioOrale("NAVELBINE (vinorelbine) 20 mg / 30 mg").k === "vinorelbine" && chimioOrale("TEMODAL (témozolomide), phase adjuvante").k === "temozolomide" && !chimioOrale("PARACÉTAMOL"), "fiches reconnues");
let d = doseOrale(cap, 1.8, 1000);
t(d.dose === 1800 && d.n[500] * 500 + d.n[150] * 150 === d.total && Math.abs(d.ecart) <= 75, "capécitabine 1 000 mg/m² × 1,8 m² = 1 800 mg : " + d.n[500] + " × 500 + " + d.n[150] + " × 150 = " + d.total, d);
t(remplirZones("… comprimés de 500 mg et … comprimés de 150 mg le matin et le soir (… mg/m² 2 fois par jour)", d.zones) === d.n[500] + " comprimés de 500 mg et " + d.n[150] + " comprimés de 150 mg le matin et le soir (1000 mg/m² 2 fois par jour)", "« … » remplis dans l'ordre");
d = doseOrale(chimioOrale("NAVELBINE"), 1.7, 60);
t(d.dose === 102 && d.total === 100 && d.n[20] === 2 && d.n[30] === 2, "vinorelbine 60 mg/m² × 1,7 = 102 mg : 2 × 20 + 2 × 30 = 100 mg", d);
d = doseOrale(chimioOrale("TEMODAL"), 1.75, 150);
t(d.dose === 263 && d.total === 265 && d.zones[0] === "1 × 140 mg + 1 × 100 mg + 1 × 20 mg + 1 × 5 mg", "témozolomide 150 mg/m² × 1,75 = 263 mg : 265 mg (" + d.zones[0] + ")", d);
t(comprimes(0, [500, 150]).total === 0, "dose nulle : aucun comprimé");
t(remplirZones("pendant …", []) === "pendant …", "sans valeur : la zone reste");
console.log(`\n${ok} réussis, ${ko} échoués`); if (ko) process.exit(1);
