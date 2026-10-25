// 3.13 (12/10/2026) – référentiel des types de consultation : node tests/moteur/test-typesconsult.mjs
import * as T from "../../public/js/moteur/typesconsult.js";
let ok = 0, ko = 0; const v = (c, m, d) => { if (c) ok++; else { ko++; console.log("✘ " + m, d === undefined ? "" : JSON.stringify(d)); } };
const J0 = ["Consultation de suivi", "Consultation d'annonce", "RCP", "Consultation de contrôle", "Consultation de chimiothérapie", "Consultation en cours de radiothérapie", "Consultation de fin de traitement", "Note du secrétariat"];
const L = T.referentiel(null, { acts: [["annonce", "Consultation d'annonce"], ["2avis", "2nd avis"], ["seance", "Séance de chimiothérapie"], ["rt", "Radiothérapie"], ["2avis", "2nd avis"], ["hospit", "Hospitalisation (par jour ouvré)"]], journal: J0 });
v(L.map((t) => t.k).join() === "annonce,suivi,controle,hospit,cchimio,rtc,rtf,2avis,jrcp,jconsultationdefindet,jnotedusecretariat", "liste de départ : types de base, activité ajoutée, types du journal (sans séance ni RT)", L.map((t) => t.k));
v(L.find((t) => t.k === "2avis").rdv && !L.find((t) => t.k === "jrcp").rdv && !L.find((t) => t.k === "cchimio").rdv && !L.find((t) => t.k === "rtc").rdv, "pris en rendez-vous : activités oui ; journal, chimio, RT non");
v(T.typesPourRdv(L).map((o) => o.v).join() === "s:Annonce,s:Suivi,s:Contrôle,s:Hospitalisation,a:2avis", "types proposés au rendez-vous", T.typesPourRdv(L));
v(T.cleDeRdv({ type: "Contrôle" }) === "controle" && T.cleDeRdv({ type: "En cours de RT" }) === "rtc" && T.cleDeRdv({ type: "2nd avis", act: "2avis" }) === "2avis" && T.cleDeRdv({ type: "Fin de radiothérapie" }) === "rtf", "clé d'un rendez-vous");
v(T.cleDuree("annonce") === "s:Annonce" && T.cleDuree("2avis") === "a:2avis" && T.cleDuree("rtc") === "s:En cours de RT", "clé de durée (la même qu'avant)");
const r = T.renommer(L.find((t) => t.k === "suivi"), "Consultation de surveillance");
v(r.nom === "Consultation de surveillance" && r.anciens[0] === "Consultation de suivi", "renommer : ancien nom gardé", r);
const L2 = L.map((t) => (t.k === "suivi" ? r : t));
v(T.nomActuel(L2, "Consultation de suivi") === "Consultation de surveillance" && T.nomActuel(L2, "consultation de SUIVI") === "Consultation de surveillance" && T.nomActuel(L2, "Autre") === "Autre", "nom actuel d'un ancien nom");
v(T.renommer(r, "Consultation de suivi").anciens.length === 1 && T.renommer(r, "Consultation de suivi").anciens[0] === "Consultation de surveillance", "revenir à l'ancien nom");
const E = T.referentiel(T.aEnregistrer(L2.filter((t) => t.k !== "rtf")), {});
v(E.some((t) => t.k === "rtf") && E.find((t) => t.k === "suivi").nom === "Consultation de surveillance" && E.find((t) => t.k === "suivi").anciens.length === 1, "liste enregistrée relue ; type de base manquant remis");
v(T.nouvelleCle(L, "2nd avis") === "2ndavis" && T.nouvelleCle(L, "Annonce") === "annonce2", "nouvelle clé unique");
v(T.referentiel(null, { journal: ["Consultation annonce"] }).find((t) => t.k === "annonce").anciens[0] === "Consultation annonce", "ancien libellé « Consultation annonce » rattaché au type « annonce »");
// Lot D (25/10/2026) : RCP et Note du secrétariat = notes du journal, jamais en rendez-vous, même enregistrées « pris en rendez-vous »
const LN = T.referentiel([{ k: "jrcp", nom: "RCP", rdv: true }, { k: "jnotedusecretariat", nom: "Note du secrétariat" }, { k: "2avis", nom: "2nd avis", rdv: true }], {});
v(T.estNote("RCP") && T.estNote("note du secrétariat") && !T.estNote("Consultation de suivi"), "estNote : RCP et Note du secrétariat");
v(!LN.find((t) => t.k === "jrcp").rdv && !LN.find((t) => t.k === "jnotedusecretariat").rdv && LN.find((t) => t.k === "2avis").rdv && T.typesPourRdv(LN).every((o) => o.lib !== "RCP" && o.lib !== "Note du secrétariat"), "notes jamais proposées au rendez-vous (liste enregistrée)", LN);
console.log(ko ? "❌ " + ko + " échec(s), " + ok + " réussis" : "✅ référentiel des types : " + ok + " réussis");
process.exit(ko ? 1 : 0);
