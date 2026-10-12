// Onco360 – éditeur de la fiche patient et du formulaire de consultation (10/10/2026, 16.7), commun à l'Administration (admin.js :
// fiche de la spécialité, retouches d'un cabinet) et à Onco360 (Paramètres › Cabinet, 11/10/2026 : retouches faites par le cabinet
// lui-même). Sans Firebase : il modifie sur place la fiche effective qu'on lui donne ; l'appelant enregistre.
import { FICHE, TYPES_CHAMP, TOUJOURS_ENTETE, CONSULT, TYPES_CHAMP_CS, libDe, sectionChamp, champsDe, libType, FIXES, LISTES_CAB } from "../donnees/catalogue.js";

const $ = (i) => document.getElementById(i);
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const caseC = (attr, on, txt) => '<label class="rg-c"><input type="checkbox" ' + attr + (on ? " checked" : "") + "><span>" + txt + "</span></label>";

// ───── Fiche patient (10/10/2026) : réglée une fois par spécialité (la même pour tous les packs) ; un cabinet peut la retoucher ─────
// mode "spe" : fiche de la spécialité (tout se modifie) ; "cabinet" : champs de la spécialité = présence, ordre, nom affiché ; champs
// ajoutés propres au cabinet (cabinet: true) modifiables. FI = fiche effective (ficheEffective), modifiée sur place.
// Même éditeur pour le formulaire de consultation (16.7) : cs = true (catalogue CONSULT, types en plus : texte long, titre de section,
// unité d'un nombre ; liste de choix des champs existants modifiable ; ni partie, ni impression, ni en-tête).
// o (3.11) : { ouvrirListe(cle) } = ouvre la liste du cabinet d'un champ (Paramètres › Dossier patient › Listes) ; sans : texte d'aide
export function editeurFiche(FI, mode, cs, o) {
  o = o || {};
  const P = cs ? "cq" : "ch"; // préfixe des identifiants : les deux éditeurs peuvent être dans la même fenêtre
  let ED = null; // "nouveau", id d'un champ ajouté, ou "lib:clé" (nom affiché d'un champ existant)
  const CAT = cs ? CONSULT : FICHE, TYPES = cs ? TYPES_CHAMP_CS : TYPES_CHAMP, nomDe = (k) => libDe(CAT, k, FI);
  const LIB = Object.fromEntries(CAT.map((c) => [c[0], c])), AJ = () => Object.fromEntries(FI.ajouts.map((a) => [a.id, a]));
  const modifiable = (a) => mode === "spe" || a.cabinet === true;
  const typeLib = (t) => ((TYPES.find((x) => x[0] === t) || [])[1] || t).toLowerCase();
  // 12/10/2026 (demande de Dr Bentahila) : fiche affichée en trois parties (Identité, Informations médicales, Fiche tumeur), dans l'ordre réel ;
  // ↑ ↓ déplacent un champ dans sa partie ; plus de « nom d'origine » ni « ajouté » ; champs de la spécialité (fiche tumeur…) renommables
  const sec = (k) => (cs ? "" : sectionChamp(k, FI)), voisin = (i, d) => { for (let j = i + d; j >= 0 && j < FI.ordre.length; j += d) if (sec(FI.ordre[j]) === sec(FI.ordre[i])) return j; return -1; };
  const fl = (i) => '<span class="fl"><button class="clair petit" data-fh="' + i + '"' + (voisin(i, -1) >= 0 ? "" : " disabled") + ' aria-label="Monter">↑</button><button class="clair petit" data-fb="' + i + '"' + (voisin(i, 1) >= 0 ? "" : " disabled") + ' aria-label="Descendre">↓</button></span>';
  const LISTES_P = ["xtstade", "xtgrade"]; // listes réglées dans Paramètres › Listes
  // 3.11 (12/10/2026) : fiche patient = chaque champ montre son type (et sa liste, son unité, « imprimé ») ; ✎ ouvre la fiche du champ où tout
  // se modifie (nom, type, liste, unité, partie, imprimé, en-tête) ; type fixe : la raison est donnée
  const CH = () => Object.fromEntries(champsDe(FI).map((c) => [c.k, c]));
  const nbListe = (cle) => (o.tailleListe ? o.tailleListe(cle) : null);
  const infoF = (c) => [c.liste ? "liste du cabinet" + (nbListe(c.liste) != null ? " (" + nbListe(c.liste) + " choix)" : "") : c.type === "choix" ? "liste de " + c.choix.length + " choix" : libType(c.type) + (c.type === "nombre" && c.unite ? " (" + c.unite + ")" : ""),
    c.ajout && c.ajout.si ? "proposé selon la localisation" : "", mode === "cabinet" && c.ajout && c.ajout.cabinet ? "propre au cabinet" : "", c.imprimer ? "imprimé" : ""].filter(Boolean).join(" · ");
  const ligneF = (k, i) => { const c = CH()[k]; if (!c) return ""; const a = c.ajout;
    return '<div class="rg-l">' + fl(i) + '<span class="rg-t">' + esc(c.lib) + ' <span class="m">' + esc(infoF(c)) + "</span></span>" +
      '<button class="clair petit" data-chf="' + k + '" title="Modifier le champ (nom, type, liste, partie, impression)" aria-label="Modifier le champ « ' + esc(c.lib) + ' »">✎</button>' + (a && modifiable(a) ? '<button class="clair petit" data-chs="' + k + '" aria-label="Supprimer le champ">✕</button>' : "") +
      (TOUJOURS_ENTETE.indexOf(k) >= 0 ? '<span class="m en-c">nom du dossier</span>' : '<label class="rg-c en-c" title="Affiché en tête du dossier (sinon seulement dans « Afficher »)"><input type="checkbox" data-ren="' + k + '"' + ((FI.entetes || {})[k] ? " checked" : "") + "><span>en-tête</span></label>") +
      (LIB[k] && LIB[k][3] ? '<span class="m pr-c">toujours</span>' : '<label class="rg-c pr-c" title="Champ présent dans la fiche (décoché : caché, la valeur est gardée)"><input type="checkbox" data-rch="' + k + '"' + (FI.champs[k] !== false ? " checked" : "") + "><span>présent</span></label>") + "</div>"; };
  const typesF = TYPES_CHAMP, partiesF = () => [["id", "Identité"], ["med", "Informations médicales"]].concat(FI.onco ? [["tum", "Fiche tumeur"]] : []);
  const libDefaut = (k) => (FI.onco && k === "diag" ? "Localisation" : FI.onco && k === "diagP" ? "Précision" : LIB[k][1]);
  const formChampF = (k) => { const nouv = !k, c = nouv ? { k: "", lib: "", type: "texte", choix: [], unite: "", section: "id", imprimer: false, entete: false, fixe: "", liste: "", ajout: { partie: "identite" } } : CH()[k];
    const fixe = !nouv && (FIXES[k] || LISTES_CAB[k] || (LIB[k] && LIB[k][3])), raison = FIXES[k] || (LISTES_CAB[k] ? "liste du cabinet" : "champ de base");
    const ent = !nouv && TOUJOURS_ENTETE.indexOf(k) >= 0, partieFixe = !nouv && LIB[k] && LIB[k][3];
    return '<div class="ch-f" data-chk="' + esc(k || "") + '"><h4 class="soustitre" style="margin:0 0 6px">' + (nouv ? "Nouveau champ" : "Champ « " + esc(c.lib) + " »") + "</h4><div class=\"form\">" +
      '<div><label for="' + P + 'Lib">Nom affiché</label><input id="' + P + 'Lib" value="' + esc(c.lib) + '" placeholder="ex. Groupe sanguin"></div>' +
      '<div><label for="' + P + 'Type">Type</label>' + (fixe ? '<input id="' + P + 'Type" value="' + esc(libType(c.type)) + '" disabled><span class="mesures">Fixe : ' + esc(raison) + "</span>"
        : '<select id="' + P + 'Type">' + typesF.map(([t, l]) => '<option value="' + t + '"' + (c.type === t ? " selected" : "") + ">" + esc(l) + "</option>").join("") + "</select>") + "</div>" +
      '<div><label for="' + P + 'Partie">Partie de la fiche</label><select id="' + P + 'Partie"' + (partieFixe ? " disabled" : "") + ">" + partiesF().map(([v, l]) => '<option value="' + v + '"' + (c.section === v ? " selected" : "") + ">" + l + "</option>").join("") + "</select></div>" +
      '<div id="' + P + 'UniteZ"' + (c.type === "nombre" ? "" : ' style="display:none"') + '><label for="' + P + 'Unite">Unité (facultatif)</label><input id="' + P + 'Unite" value="' + esc(c.unite || "") + '" placeholder="ex. kg, cm, %"' + (fixe && c.unite ? " disabled" : "") + "></div>" +
      (c.liste ? '<div class="large"><label>Liste</label><div>' + (o.ouvrirListe ? '<button class="clair petit" type="button" id="' + P + 'Liste" data-liste="' + c.liste + '">Modifier la liste' + (nbListe(c.liste) != null ? " (" + nbListe(c.liste) + " choix)" : "") + "</button>" : '<span class="mesures">Liste du cabinet (Paramètres › Dossier patient › Listes)</span>') + "</div></div>"
        : '<div class="large" id="' + P + 'ChoixZ"' + (c.type === "choix" ? "" : ' style="display:none"') + '><label for="' + P + 'Choix">Choix possibles (un par ligne)</label><textarea id="' + P + 'Choix" rows="5">' + esc((c.choix || []).join("\n")) + "</textarea></div>") + "</div>" +
      (c.type === "ouinonp" || !fixe ? '<p class="mesures" style="margin:4px 0 0">« Oui / Non + précision » : la case de précision s\'ouvre si « Oui ».</p>' : "") +
      '<div class="barre" style="margin-top:6px">' + caseC('id="' + P + 'Imp"', !!c.imprimer, "À imprimer (fiche chimio, courriers)") + (ent ? "" : caseC('id="' + P + 'Ent"', !!c.entete, "En tête du dossier")) +
      '<button class="petit" id="' + P + 'Ok">' + (nouv ? "Ajouter le champ" : "Enregistrer le champ") + "</button>" + (!nouv && LIB[k] ? '<button class="clair petit" id="' + P + 'Orig">Nom par défaut</button>' : "") + '<button class="clair petit" id="' + P + 'Ann">Annuler</button></div></div>'; };
  const ligne = (k, i) => { const c = LIB[k], a = AJ()[k]; if (!c && !a) return "";
    const nomA = c ? nomDe(k) : a.lib;
    const info = c ? (c[4] ? "liste de " + ((FI.choixs || {})[k] || c[4]).length + " choix (✎)" : "")
      : !modifiable(a) && !cs ? (LISTES_P.indexOf(k) >= 0 ? "liste : Paramètres › Listes" : a.si ? "proposé selon la localisation" : a.type === "choix" ? "liste de " + (a.choix || []).length + " choix (✎)" : typeLib(a.type)) + (a.imprimer ? " · imprimé" : "")
      : (a.cs ? (a.cs === "rt" ? "RT hebdomadaire · " : "consultation d'oncologie · ") : "") + (mode === "cabinet" && a.cabinet ? "propre au cabinet · " : "") + typeLib(a.type) + (a.type === "nombre" && a.unite ? " (" + a.unite + ")" : "") + (a.type === "choix" && a.choix && a.choix.length ? " (" + a.choix.join(", ") + ")" : "") + (a.imprimer ? " · imprimé" : "") + (a.entete ? " · en-tête" : "");
    return '<div class="rg-l">' + fl(i) + '<span class="rg-t">' + esc(nomA) + ' <span class="m">' + esc(info) + "</span></span>" +
      (c ? '<button class="clair petit" data-chl="' + k + '" title="Changer le nom affiché' + (c[4] ? " et la liste" : "") + '" aria-label="Modifier le champ existant">✎</button>' : !modifiable(a) ? '<button class="clair petit" data-cha="' + k + '" title="Changer le nom affiché' + (a.type === "choix" && LISTES_P.indexOf(k) < 0 ? " et la liste" : "") + '" aria-label="Modifier le champ">✎</button>' : modifiable(a) ? '<button class="clair petit" data-chm="' + k + '" aria-label="Modifier le champ">✎</button><button class="clair petit" data-chs="' + k + '" aria-label="Supprimer le champ">✕</button>' : "") +
      // Fiche patient : case « en-tête » (affiché en tête du dossier ou seulement dans « Afficher »), pour tous les champs
      (cs ? "" : TOUJOURS_ENTETE.indexOf(k) >= 0 ? '<span class="m en-c">nom du dossier</span>' : '<label class="rg-c en-c" title="Affiché en tête du dossier (sinon seulement dans « Afficher »)"><input type="checkbox" data-ren="' + k + '"' + ((FI.entetes || {})[k] ? " checked" : "") + "><span>en-tête</span></label>") +
      (c && c[3] ? '<span class="m pr-c">toujours</span>' : '<label class="rg-c pr-c" title="Champ présent dans la fiche (décoché : caché, la valeur est gardée)"><input type="checkbox" data-rch="' + k + '"' + (FI.champs[k] !== false ? " checked" : "") + "><span>présent</span></label>") + "</div>"; };
  const formAjout = () => { const a = ED !== "nouveau" ? AJ()[ED] || {} : { type: "texte", partie: "identite" };
    return '<div class="ch-f"><div class="form"><div><label for="' + P + 'Lib">Nom du champ</label><input id="' + P + 'Lib" value="' + esc(a.lib || "") + '" placeholder="ex. Groupe sanguin"></div>' +
      '<div><label for="' + P + 'Type">Type</label><select id="' + P + 'Type">' + TYPES.map(([k, l]) => '<option value="' + k + '"' + (a.type === k ? " selected" : "") + ">" + esc(l) + "</option>").join("") + "</select></div>" +
      (cs ? '<div id="' + P + 'UniteZ"' + (a.type === "nombre" ? "" : ' style="display:none"') + '><label for="' + P + 'Unite">Unité (facultatif)</label><input id="' + P + 'Unite" value="' + esc(a.unite || "") + '" placeholder="ex. kg, mmHg, g/l"></div>'
        : '<div><label for="' + P + 'Partie">Partie de la fiche</label><select id="' + P + 'Partie"><option value="identite"' + (a.partie !== "clinique" ? " selected" : "") + '>Identité</option><option value="clinique"' + (a.partie === "clinique" && !a.tumeur ? " selected" : "") + ">Informations médicales</option>" + (FI.onco ? '<option value="tumeur"' + (a.tumeur ? " selected" : "") + ">Fiche tumeur</option>" : "") + "</select></div>") +
      '<div class="large" id="' + P + 'ChoixZ"' + (a.type === "choix" ? "" : ' style="display:none"') + '><label for="' + P + 'Choix">Choix possibles (un par ligne)</label><textarea id="' + P + 'Choix" rows="3">' + esc((a.choix || []).join("\n")) + "</textarea></div></div>" +
      '<div class="barre" style="margin-top:6px">' + (cs ? "" : caseC('id="' + P + 'Imp"', !!a.imprimer, "À imprimer (fiche chimio, courriers)") + caseC('id="' + P + 'Ent"', ED !== "nouveau" && FI.entetes && a.id in FI.entetes ? FI.entetes[a.id] : !!a.entete, "En tête du dossier")) + '<button class="petit" id="' + P + 'Ok">' + (ED === "nouveau" ? "Ajouter le champ" : "Enregistrer le champ") + '</button><button class="clair petit" id="' + P + 'Ann">Annuler</button></div></div>'; };
  const formLib = (k) => '<div class="ch-f"><div class="form"><div><label for="' + P + 'NomA">Nom affiché de « ' + esc(LIB[k][1]) + ' »</label><input id="' + P + 'NomA" value="' + esc(nomDe(k)) + '"></div>' +
    (LIB[k][4] ? '<div class="large"><label for="' + P + 'Liste">Choix possibles (un par ligne)</label><textarea id="' + P + 'Liste" rows="5">' + esc(((FI.choixs || {})[k] || LIB[k][4]).join("\n")) + "</textarea></div>" : "") + "</div>" +
    '<div class="barre" style="margin-top:6px"><button class="petit" id="' + P + 'LOk">Enregistrer le nom</button><button class="clair petit" id="' + P + 'LOrig">Nom par défaut</button><button class="clair petit" id="' + P + 'Ann">Annuler</button></div></div>';
  const formLibA = (k) => { const a = AJ()[k] || {}, ch = a.type === "choix" && LISTES_P.indexOf(k) < 0;
    return '<div class="ch-f"><div class="form"><div><label for="' + P + 'NomA">Nom affiché</label><input id="' + P + 'NomA" value="' + esc(a.lib || "") + '"></div>' +
      (ch ? '<div class="large"><label for="' + P + 'Liste">Choix possibles (un par ligne)</label><textarea id="' + P + 'Liste" rows="5">' + esc((a.choix || []).join("\n")) + "</textarea></div>" : "") + "</div>" +
      '<div class="barre" style="margin-top:6px"><button class="petit" id="' + P + 'AOk">Enregistrer</button><button class="clair petit" id="' + P + 'Ann">Annuler</button></div></div>'; };
  const PARTIES = [["id", "Identité"], ["med", "Informations médicales"], ["tum", "Fiche tumeur"]];
  const liste = () => (cs ? FI.ordre.map(ligne).join("") : PARTIES.map(([k, lib]) => { const l = FI.ordre.map((c, i) => [c, i]).filter(([c]) => sec(c) === k); return l.length ? '<h4 class="soustitre" style="margin:12px 0 4px">' + lib + "</h4>" + l.map(([c, i]) => ligneF(c, i)).join("") : ""; }).join(""));
  // 3.4 : formulaire de consultation : « formulaire simple » (type, date, titre, note) ou tous les champs proposés, en un clic
  const simple = () => (cs && FI.ajouts.length ? '<div class="barre" style="margin-bottom:8px"><button class="clair petit" id="' + P + 'Simple">Formulaire simple (type, date, titre, note)</button><button class="clair petit" id="' + P + 'Tout">Tout proposer</button></div>' : "");
  const html = () => '<div data-ed="' + P + '">' + simple() + '<div class="rg-b fiche-b">' + liste() + "</div>" +
    (!cs && ED === "nouveau" ? formChampF(null) : !cs && ED && ED.indexOf("f:") === 0 ? formChampF(ED.slice(2)) : ED && ED.indexOf("lib:") === 0 ? formLib(ED.slice(4)) : ED && ED.indexOf("aj:") === 0 ? formLibA(ED.slice(3)) : ED ? formAjout() : '<div style="margin-top:8px"><button class="clair petit" id="' + P + 'Nouv">+ Ajouter un champ' + (mode === "cabinet" ? " pour ce cabinet" : "") + "</button></div>") + "</div>";
  // Enregistrement d'un champ de la fiche (3.11) : champ d'origine → tables du réglage (libs, types, choixs, unites, sections, imprimes, entetes) ;
  // champ ajouté → le champ lui-même (sa partie de stockage ne change pas : seulement la partie affichée)
  const brancherChampF = (refaire) => {
    const k = ED === "nouveau" ? null : ED.slice(2), c = k ? CH()[k] : null, tb = (n) => (FI[n] = FI[n] || {});
    const typeSel = () => ($(P + "Type") && !$(P + "Type").disabled ? $(P + "Type").value : c ? c.type : "texte");
    if ($(P + "Type") && !$(P + "Type").disabled) $(P + "Type").onchange = () => { const t = typeSel(); if ($(P + "ChoixZ")) $(P + "ChoixZ").style.display = t === "choix" ? "" : "none"; if ($(P + "UniteZ")) $(P + "UniteZ").style.display = t === "nombre" ? "" : "none"; };
    if ($(P + "Ann")) $(P + "Ann").onclick = () => { ED = null; refaire(); };
    if ($(P + "Orig")) $(P + "Orig").onclick = () => { $(P + "Lib").value = libDefaut(k); };
    $(P + "Ok").onclick = () => {
      const lib = $(P + "Lib").value.replace(/\s+/g, " ").trim().slice(0, 60); if (!lib) { alert("Indiquez le nom du champ."); return; }
      const type = typeSel(), choix = $(P + "Choix") ? $(P + "Choix").value.split("\n").map((z) => z.trim()).filter(Boolean).slice(0, 40) : [];
      if (type === "choix" && !(c && c.liste) && !choix.length) { alert("Indiquez au moins un choix (un par ligne)."); return; }
      const unite = $(P + "Unite") && !$(P + "Unite").disabled ? $(P + "Unite").value.trim().slice(0, 15) : null, sect = $(P + "Partie").value;
      const imp = !!($(P + "Imp") && $(P + "Imp").checked), ent = $(P + "Ent") ? $(P + "Ent").checked : null;
      if (!k) { // nouveau champ (propre au cabinet en mode cabinet)
        const id = "x" + Date.now().toString(36) + Math.floor(Math.random() * 1296).toString(36);
        FI.ajouts.push(Object.assign({ id, lib, type, partie: sect === "id" ? "identite" : "clinique", tumeur: sect === "tum", choix: type === "choix" ? choix : [], imprimer: imp, entete: !!ent, cabinet: mode === "cabinet" }, type === "nombre" && unite ? { unite } : {}));
        FI.ordre.push(id); FI.champs[id] = true; tb("entetes")[id] = !!ent; ED = null; refaire(); return; }
      const a = c.ajout;
      if (a) { a.lib = lib; if (!(FIXES[k] || LISTES_CAB[k])) a.type = type; if (type === "choix" && !c.liste) a.choix = choix; if (type === "nombre" && unite != null) { if (unite) a.unite = unite; else delete a.unite; } a.imprimer = imp; }
      else { const L = tb("libs"); L[k] = lib;
        if (!(FIXES[k] || LISTES_CAB[k]) && type !== c.type) tb("types")[k] = type;
        if (type === "choix" && !c.liste) tb("choixs")[k] = choix;
        if (type === "nombre" && unite != null && unite !== (c.unite || "")) tb("unites")[k] = unite;
        if (imp !== !!c.imprimer) tb("imprimes")[k] = imp; }
      if (sect !== c.section) tb("sections")[k] = sect;
      if (ent != null) tb("entetes")[k] = ent;
      ED = null; refaire(); };
  };
  const brancher = (refaire) => {
    const racine = document.querySelector('[data-ed="' + P + '"]'), q = (sel) => (racine ? racine.querySelectorAll(sel) : []);
    const bouge = (i, d) => { const j = cs ? i + d : voisin(i, d), L = FI.ordre; if (j < 0 || j >= L.length) return; [L[i], L[j]] = [L[j], L[i]]; refaire(); };
    q("[data-fh]").forEach((b) => { b.onclick = () => bouge(Number(b.dataset.fh), -1); });
    q("[data-fb]").forEach((b) => { b.onclick = () => bouge(Number(b.dataset.fb), 1); });
    q("[data-rch]").forEach((x) => { x.onchange = () => { FI.champs[x.dataset.rch] = x.checked; }; });
    q("[data-ren]").forEach((x) => { x.onchange = () => { FI.entetes = FI.entetes || {}; FI.entetes[x.dataset.ren] = x.checked; }; });
    q("[data-chl]").forEach((b) => { b.onclick = () => { ED = "lib:" + b.dataset.chl; refaire(); }; });
    q("[data-chm]").forEach((b) => { b.onclick = () => { ED = b.dataset.chm; refaire(); }; });
    q("[data-cha]").forEach((b) => { b.onclick = () => { ED = "aj:" + b.dataset.cha; refaire(); }; });
    q("[data-chf]").forEach((b) => { b.onclick = () => { ED = "f:" + b.dataset.chf; refaire(); setTimeout(() => { const z = document.querySelector('[data-ed="' + P + '"] .ch-f'); if (z && z.scrollIntoView) z.scrollIntoView({ block: "nearest" }); }, 0); }; });
    if (!cs && $(P + "Liste") && o.ouvrirListe) $(P + "Liste").onclick = () => { const k = $(P + "Liste").dataset.liste; ED = null; o.ouvrirListe(k); };
    if ($(P + "AOk")) $(P + "AOk").onclick = () => { const a = FI.ajouts.find((z) => z.id === ED.slice(3)); if (!a) return; const v = $(P + "NomA").value.replace(/\s+/g, " ").trim().slice(0, 60); if (!v) { alert("Indiquez le nom du champ."); return; } a.lib = v;
      if ($(P + "Liste")) { const l = $(P + "Liste").value.split("\n").map((c) => c.trim()).filter(Boolean).slice(0, 40); if (!l.length) { alert("Gardez au moins un choix (un par ligne)."); return; } a.choix = l; }
      ED = null; refaire(); };
    q("[data-chs]").forEach((b) => { b.onclick = () => { const k = b.dataset.chs, a = FI.ajouts.find((z) => z.id === k); if (!confirm("Retirer le champ « " + (a && a.lib) + " » de la fiche ?\n(Les valeurs déjà saisies restent dans les dossiers.)")) return; FI.ajouts = FI.ajouts.filter((z) => z.id !== k); FI.ordre = FI.ordre.filter((z) => z !== k); delete FI.champs[k]; refaire(); }; });
    if ($(P + "Nouv")) $(P + "Nouv").onclick = () => { ED = "nouveau"; refaire(); };
    if ($(P + "Simple")) $(P + "Simple").onclick = () => { FI.ajouts.forEach((a) => { FI.champs[a.id] = false; }); ["type", "d", "titre", "note"].forEach((k) => { FI.champs[k] = true; }); refaire(); };
    if ($(P + "Tout")) $(P + "Tout").onclick = () => { FI.ajouts.forEach((a) => { FI.champs[a.id] = true; }); refaire(); };
    if ($(P + "Type")) $(P + "Type").onchange = () => { $(P + "ChoixZ").style.display = $(P + "Type").value === "choix" ? "" : "none"; if ($(P + "UniteZ")) $(P + "UniteZ").style.display = $(P + "Type").value === "nombre" ? "" : "none"; };
    if ($(P + "Ann")) $(P + "Ann").onclick = () => { ED = null; refaire(); };
    const k = ED && ED.indexOf("lib:") === 0 ? ED.slice(4) : null;
    if ($(P + "LOk")) $(P + "LOk").onclick = () => { const v = $(P + "NomA").value.replace(/\s+/g, " ").trim().slice(0, 60); FI.libs = FI.libs || {}; if (!v || v === LIB[k][1]) delete FI.libs[k]; else FI.libs[k] = v;
      if ($(P + "Liste")) { const l = $(P + "Liste").value.split("\n").map((c) => c.trim()).filter(Boolean).slice(0, 40); if (!l.length) { alert("Gardez au moins un choix (un par ligne)."); return; } FI.choixs = FI.choixs || {}; FI.choixs[k] = l; }
      ED = null; refaire(); };
    if ($(P + "LOrig")) $(P + "LOrig").onclick = () => { FI.libs = FI.libs || {}; delete FI.libs[k]; if (LIB[k][4]) { FI.choixs = FI.choixs || {}; FI.choixs[k] = LIB[k][4].slice(); } ED = null; refaire(); };
    if ($(P + "Ok")) $(P + "Ok").onclick = () => {
      const lib = $(P + "Lib").value.trim(); if (!lib) { alert("Indiquez le nom du champ."); return; }
      const pa = $(P + "Partie") ? $(P + "Partie").value : "identite";
      const d = { lib: lib.slice(0, 60), type: $(P + "Type").value, partie: pa === "tumeur" ? "clinique" : pa, tumeur: pa === "tumeur", choix: $(P + "Choix").value.split("\n").map((c) => c.trim()).filter(Boolean).slice(0, 40), imprimer: !!($(P + "Imp") && $(P + "Imp").checked), entete: !!($(P + "Ent") && $(P + "Ent").checked) };
      if ($(P + "Unite")) { const u = $(P + "Unite").value.trim().slice(0, 15); if (u && d.type === "nombre") d.unite = u; else delete d.unite; }
      if (d.type === "choix" && !d.choix.length) { alert("Indiquez au moins un choix (un par ligne)."); return; }
      if (ED === "nouveau") { const id = "x" + Date.now().toString(36) + Math.floor(Math.random() * 1296).toString(36); FI.ajouts.push(Object.assign({ id, cabinet: mode === "cabinet" }, d)); FI.ordre.push(id); FI.champs[id] = true; }
      else { const a = FI.ajouts.find((z) => z.id === ED); if (a) { if (!d.unite) delete a.unite; Object.assign(a, d); } }
      if (!cs) { FI.entetes = FI.entetes || {}; FI.entetes[ED === "nouveau" ? FI.ordre[FI.ordre.length - 1] : ED] = d.entete; }
      ED = null; refaire();
    };
    if (!cs && ED && (ED === "nouveau" || ED.indexOf("f:") === 0)) brancherChampF(refaire); // en dernier : ses boutons remplacent ceux d'avant
  };
  return { html, brancher, enCours: () => !!ED };
}
