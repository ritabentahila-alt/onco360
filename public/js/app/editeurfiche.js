// Onco360 – éditeur de la fiche patient et du formulaire de consultation (10/10/2026, 16.7), commun à l'Administration (admin.js :
// fiche de la spécialité, retouches d'un cabinet) et à Onco360 (Paramètres › Cabinet, 11/10/2026 : retouches faites par le cabinet
// lui-même). Sans Firebase : il modifie sur place la fiche effective qu'on lui donne ; l'appelant enregistre.
import { FICHE, TYPES_CHAMP, TOUJOURS_ENTETE, CONSULT, TYPES_CHAMP_CS, libDe } from "../donnees/catalogue.js";

const $ = (i) => document.getElementById(i);
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const caseC = (attr, on, txt) => '<label class="rg-c"><input type="checkbox" ' + attr + (on ? " checked" : "") + "><span>" + txt + "</span></label>";

// ───── Fiche patient (10/10/2026) : réglée une fois par spécialité (la même pour tous les packs) ; un cabinet peut la retoucher ─────
// mode "spe" : fiche de la spécialité (tout se modifie) ; "cabinet" : champs de la spécialité = présence, ordre, nom affiché ; champs
// ajoutés propres au cabinet (cabinet: true) modifiables. FI = fiche effective (ficheEffective), modifiée sur place.
// Même éditeur pour le formulaire de consultation (16.7) : cs = true (catalogue CONSULT, types en plus : texte long, titre de section,
// unité d'un nombre ; liste de choix des champs existants modifiable ; ni partie, ni impression, ni en-tête).
export function editeurFiche(FI, mode, cs) {
  const P = cs ? "cq" : "ch"; // préfixe des identifiants : les deux éditeurs peuvent être dans la même fenêtre
  let ED = null; // "nouveau", id d'un champ ajouté, ou "lib:clé" (nom affiché d'un champ existant)
  const CAT = cs ? CONSULT : FICHE, TYPES = cs ? TYPES_CHAMP_CS : TYPES_CHAMP, nomDe = (k) => libDe(CAT, k, FI);
  const LIB = Object.fromEntries(CAT.map((c) => [c[0], c])), AJ = () => Object.fromEntries(FI.ajouts.map((a) => [a.id, a]));
  const modifiable = (a) => mode === "spe" || a.cabinet === true;
  const typeLib = (t) => ((TYPES.find((x) => x[0] === t) || [])[1] || t).toLowerCase();
  const fl = (i) => '<span class="fl"><button class="clair petit" data-fh="' + i + '"' + (i ? "" : " disabled") + ' aria-label="Monter">↑</button><button class="clair petit" data-fb="' + i + '"' + (i < FI.ordre.length - 1 ? "" : " disabled") + ' aria-label="Descendre">↓</button></span>';
  const ligne = (k, i) => { const c = LIB[k], a = AJ()[k]; if (!c && !a) return "";
    const nomA = c ? nomDe(k) : a.lib, renomme = c && nomA !== c[1];
    const info = c ? (cs ? "existant" : c[2] === "clinique" ? "fiche clinique" : "identité") + (c[4] ? " · liste de " + ((FI.choixs || {})[k] || c[4]).length + " choix (✎ pour la voir)" : "") + (renomme ? " · nom d'origine : " + c[1] : "")
      : "ajouté" + (mode === "cabinet" ? (a.cabinet ? " pour ce cabinet" : " (spécialité)") : "") + " · " + typeLib(a.type) + (a.type === "nombre" && a.unite ? " (" + a.unite + ")" : "") + (a.type === "choix" && a.choix && a.choix.length ? " (" + a.choix.join(", ") + ")" : "") + (a.imprimer ? " · imprimé" : "") + (a.entete ? " · en-tête" : "");
    return '<div class="rg-l">' + fl(i) + '<span class="rg-t">' + esc(nomA) + ' <span class="m">' + esc(info) + "</span></span>" +
      (c ? '<button class="clair petit" data-chl="' + k + '" title="Changer le nom affiché' + (c[4] ? " et la liste" : "") + '" aria-label="Modifier le champ existant">✎</button>' : modifiable(a) ? '<button class="clair petit" data-chm="' + k + '" aria-label="Modifier le champ">✎</button><button class="clair petit" data-chs="' + k + '" aria-label="Supprimer le champ">✕</button>' : "") +
      // Fiche patient : case « en-tête » (affiché en tête du dossier ou seulement dans « Afficher »), pour tous les champs
      (cs ? "" : TOUJOURS_ENTETE.indexOf(k) >= 0 ? '<span class="m en-c">nom du dossier</span>' : '<label class="rg-c en-c" title="Affiché en tête du dossier (sinon seulement dans « Afficher »)"><input type="checkbox" data-ren="' + k + '"' + ((FI.entetes || {})[k] ? " checked" : "") + "><span>en-tête</span></label>") +
      (c && c[3] ? '<span class="m pr-c">toujours</span>' : '<label class="rg-c pr-c" title="Champ présent dans la fiche (décoché : caché, la valeur est gardée)"><input type="checkbox" data-rch="' + k + '"' + (FI.champs[k] !== false ? " checked" : "") + "><span>présent</span></label>") + "</div>"; };
  const formAjout = () => { const a = ED !== "nouveau" ? AJ()[ED] || {} : { type: "texte", partie: "identite" };
    return '<div class="ch-f"><div class="form"><div><label for="' + P + 'Lib">Nom du champ</label><input id="' + P + 'Lib" value="' + esc(a.lib || "") + '" placeholder="ex. Groupe sanguin"></div>' +
      '<div><label for="' + P + 'Type">Type</label><select id="' + P + 'Type">' + TYPES.map(([k, l]) => '<option value="' + k + '"' + (a.type === k ? " selected" : "") + ">" + esc(l) + "</option>").join("") + "</select></div>" +
      (cs ? '<div id="' + P + 'UniteZ"' + (a.type === "nombre" ? "" : ' style="display:none"') + '><label for="' + P + 'Unite">Unité (facultatif)</label><input id="' + P + 'Unite" value="' + esc(a.unite || "") + '" placeholder="ex. kg, mmHg, g/l"></div>'
        : '<div><label for="' + P + 'Partie">Partie de la fiche</label><select id="' + P + 'Partie"><option value="identite"' + (a.partie !== "clinique" ? " selected" : "") + '>Identité</option><option value="clinique"' + (a.partie === "clinique" ? " selected" : "") + ">Fiche clinique</option></select></div>") +
      '<div class="large" id="' + P + 'ChoixZ"' + (a.type === "choix" ? "" : ' style="display:none"') + '><label for="' + P + 'Choix">Choix possibles (un par ligne)</label><textarea id="' + P + 'Choix" rows="3">' + esc((a.choix || []).join("\n")) + "</textarea></div></div>" +
      '<div class="barre" style="margin-top:6px">' + (cs ? "" : caseC('id="' + P + 'Imp"', !!a.imprimer, "À imprimer (fiche chimio, courriers)") + caseC('id="' + P + 'Ent"', ED !== "nouveau" && FI.entetes && a.id in FI.entetes ? FI.entetes[a.id] : !!a.entete, "En tête du dossier")) + '<button class="petit" id="' + P + 'Ok">' + (ED === "nouveau" ? "Ajouter le champ" : "Enregistrer le champ") + '</button><button class="clair petit" id="' + P + 'Ann">Annuler</button></div></div>'; };
  const formLib = (k) => '<div class="ch-f"><div class="form"><div><label for="' + P + 'NomA">Nom affiché de « ' + esc(LIB[k][1]) + ' »</label><input id="' + P + 'NomA" value="' + esc(nomDe(k)) + '"></div>' +
    (LIB[k][4] ? '<div class="large"><label for="' + P + 'Liste">Choix possibles (un par ligne)</label><textarea id="' + P + 'Liste" rows="5">' + esc(((FI.choixs || {})[k] || LIB[k][4]).join("\n")) + "</textarea></div>" : "") + "</div>" +
    '<div class="barre" style="margin-top:6px"><button class="petit" id="' + P + 'LOk">Enregistrer le nom</button><button class="clair petit" id="' + P + 'LOrig">Revenir au nom d\'origine</button><button class="clair petit" id="' + P + 'Ann">Annuler</button></div></div>';
  const html = () => '<div data-ed="' + P + '"><div class="rg-b fiche-b">' + FI.ordre.map(ligne).join("") + "</div>" +
    (ED && ED.indexOf("lib:") === 0 ? formLib(ED.slice(4)) : ED ? formAjout() : '<div style="margin-top:8px"><button class="clair petit" id="' + P + 'Nouv">+ Ajouter un champ' + (mode === "cabinet" ? " pour ce cabinet" : "") + "</button></div>") + "</div>";
  const brancher = (refaire) => {
    const racine = document.querySelector('[data-ed="' + P + '"]'), q = (sel) => (racine ? racine.querySelectorAll(sel) : []);
    const bouge = (i, d) => { const j = i + d, L = FI.ordre; if (j < 0 || j >= L.length) return; [L[i], L[j]] = [L[j], L[i]]; refaire(); };
    q("[data-fh]").forEach((b) => { b.onclick = () => bouge(Number(b.dataset.fh), -1); });
    q("[data-fb]").forEach((b) => { b.onclick = () => bouge(Number(b.dataset.fb), 1); });
    q("[data-rch]").forEach((x) => { x.onchange = () => { FI.champs[x.dataset.rch] = x.checked; }; });
    q("[data-ren]").forEach((x) => { x.onchange = () => { FI.entetes = FI.entetes || {}; FI.entetes[x.dataset.ren] = x.checked; }; });
    q("[data-chl]").forEach((b) => { b.onclick = () => { ED = "lib:" + b.dataset.chl; refaire(); }; });
    q("[data-chm]").forEach((b) => { b.onclick = () => { ED = b.dataset.chm; refaire(); }; });
    q("[data-chs]").forEach((b) => { b.onclick = () => { const k = b.dataset.chs, a = FI.ajouts.find((z) => z.id === k); if (!confirm("Retirer le champ « " + (a && a.lib) + " » de la fiche ?\n(Les valeurs déjà saisies restent dans les dossiers.)")) return; FI.ajouts = FI.ajouts.filter((z) => z.id !== k); FI.ordre = FI.ordre.filter((z) => z !== k); delete FI.champs[k]; refaire(); }; });
    if ($(P + "Nouv")) $(P + "Nouv").onclick = () => { ED = "nouveau"; refaire(); };
    if ($(P + "Type")) $(P + "Type").onchange = () => { $(P + "ChoixZ").style.display = $(P + "Type").value === "choix" ? "" : "none"; if ($(P + "UniteZ")) $(P + "UniteZ").style.display = $(P + "Type").value === "nombre" ? "" : "none"; };
    if ($(P + "Ann")) $(P + "Ann").onclick = () => { ED = null; refaire(); };
    const k = ED && ED.indexOf("lib:") === 0 ? ED.slice(4) : null;
    if ($(P + "LOk")) $(P + "LOk").onclick = () => { const v = $(P + "NomA").value.replace(/\s+/g, " ").trim().slice(0, 60); FI.libs = FI.libs || {}; if (!v || v === LIB[k][1]) delete FI.libs[k]; else FI.libs[k] = v;
      if ($(P + "Liste")) { const l = $(P + "Liste").value.split("\n").map((c) => c.trim()).filter(Boolean).slice(0, 40); if (!l.length) { alert("Gardez au moins un choix (un par ligne)."); return; } FI.choixs = FI.choixs || {}; FI.choixs[k] = l; }
      ED = null; refaire(); };
    if ($(P + "LOrig")) $(P + "LOrig").onclick = () => { FI.libs = FI.libs || {}; delete FI.libs[k]; if (LIB[k][4]) { FI.choixs = FI.choixs || {}; FI.choixs[k] = LIB[k][4].slice(); } ED = null; refaire(); };
    if ($(P + "Ok")) $(P + "Ok").onclick = () => {
      const lib = $(P + "Lib").value.trim(); if (!lib) { alert("Indiquez le nom du champ."); return; }
      const d = { lib: lib.slice(0, 60), type: $(P + "Type").value, partie: $(P + "Partie") ? $(P + "Partie").value : "identite", choix: $(P + "Choix").value.split("\n").map((c) => c.trim()).filter(Boolean).slice(0, 40), imprimer: !!($(P + "Imp") && $(P + "Imp").checked), entete: !!($(P + "Ent") && $(P + "Ent").checked) };
      if ($(P + "Unite")) { const u = $(P + "Unite").value.trim().slice(0, 15); if (u && d.type === "nombre") d.unite = u; else delete d.unite; }
      if (d.type === "choix" && !d.choix.length) { alert("Indiquez au moins un choix (un par ligne)."); return; }
      if (ED === "nouveau") { const id = "x" + Date.now().toString(36) + Math.floor(Math.random() * 1296).toString(36); FI.ajouts.push(Object.assign({ id, cabinet: mode === "cabinet" }, d)); FI.ordre.push(id); FI.champs[id] = true; }
      else { const a = FI.ajouts.find((z) => z.id === ED); if (a) { if (!d.unite) delete a.unite; Object.assign(a, d); } }
      if (!cs) { FI.entetes = FI.entetes || {}; FI.entetes[ED === "nouveau" ? FI.ordre[FI.ordre.length - 1] : ED] = d.entete; }
      ED = null; refaire();
    };
  };
  return { html, brancher, enCours: () => !!ED };
}
