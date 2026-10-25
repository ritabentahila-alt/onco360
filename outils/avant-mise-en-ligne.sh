#!/bin/bash
# Onco360 – contrôle avant chaque mise en ligne (étape 1.5, 11/10/2026). À lancer depuis le dossier du projet :
#   bash outils/avant-mise-en-ligne.sh            (rapide : syntaxe, données réelles, tests sans navigateur)
#   bash outils/avant-mise-en-ligne.sh --regles   (en plus : règles de sécurité, export et restauration sur les émulateurs, Java 21)
#   bash outils/avant-mise-en-ligne.sh --navigateur [--regles]  (en plus : parcours principaux dans Chrome ET dans Safari / WebKit, Q2)
# S'arrête en rouge au moindre problème ; « Tout est bon » sinon. Ne met rien en ligne.
cd "$(dirname "$0")/.." || exit 1
KO=0; ok() { printf "  ✔ %s\n" "$1"; }; ko() { printf "  ✘ %s\n" "$1"; KO=$((KO+1)); }

echo "1. Syntaxe de tout le code (site et serveur)"
E=0; while IFS= read -r f; do node --input-type=module --check < "$f" 2>/dev/null || { ko "erreur de syntaxe : $f"; E=1; }; done < <(find public/js -name '*.js')
for f in functions/*.js; do node --check "$f" 2>/dev/null || { ko "erreur de syntaxe : $f"; E=1; }; done
[ $E = 0 ] && ok "aucune erreur de syntaxe"
# Q3 (12/10/2026) : commentaire « // … » écrit au milieu d'une ligne de code, qui avale la suite (erreur faite plusieurs fois)
R=$(python3 outils/commentaires.py public/js functions 2>&1 | head -3); [ -z "$R" ] && ok "aucun commentaire qui avale du code" || ko "commentaire qui avale du code : $R"
# S7 (24/10/2026, audit n° 10, Q-b) : ESLint (variables inconnues, doubles déclarations, clés en double) ; installé dans outils/eslint (npm install)
if [ -x outils/eslint/node_modules/.bin/eslint ]; then R=$(outils/eslint/node_modules/.bin/eslint -c outils/eslint/eslint.config.mjs "public/js/**/*.js" "functions/*.js" "functions/site/**/*.js" 2>&1 | tail -3); [ -z "$R" ] && ok "ESLint : aucune variable inconnue ni double déclaration" || ko "ESLint : $R"; else ko "ESLint absent : cd outils/eslint && npm install"; fi

echo "2. Aucune donnée réelle de patient dans le code, le site ou les tests"
EXCL=(--exclude-dir=node_modules --exclude-dir=.venv --exclude-dir=.git --exclude-dir=vendor --exclude=seed.json --exclude=seed-fictif.json --exclude=bilan_ref.txt --exclude='*.min.js')
R=$(grep -rIlE '"nomF" *: *"[A-Za-z]' public functions tests "${EXCL[@]}" 2>/dev/null); [ -z "$R" ] && ok "aucune fiche patient écrite en dur" || ko "fiche patient écrite en dur dans : $R"
R=$(grep -rIl 'IMP1 *=' public functions tests "${EXCL[@]}" 2>/dev/null); [ -z "$R" ] && ok "aucune importation de l'ancienne application" || ko "IMP1 trouvé dans : $R"
# numéros de test évidents (4 chiffres identiques à la suite, ex. 0661000000) acceptés
R=$(grep -rIoE '\b0[5-7][0-9]{8}\b' public functions tests "${EXCL[@]}" 2>/dev/null | perl -ne 'print unless /(\d)\1\1\1/' | head -3); [ -z "$R" ] && ok "aucun numéro de téléphone réel" || ko "numéro de téléphone trouvé : $R"
# S7 (24/10/2026) : aucun nom de vrai patient (pris dans tests/seed.json s'il est sur l'ordinateur) dans les fichiers du dépôt
R=$(python3 outils/noms-reels.py 2>&1 | head -3); [ -z "$R" ] && ok "aucun nom de vrai patient dans le dépôt" || ko "nom de vrai patient : $R"
[ -f public/ancienne-app.html ] && ko "public/ancienne-app.html est revenu" || ok "ancienne application absente du site"

echo "3. Tests sans navigateur"
for t in test-logique test-cabinets test-audit test-numeros test-exportation test-sauvegarde test-reference test-modele test-restauration test-drive test-releve test-heure; do
  if (cd functions && node $t.js > /tmp/onco360-$t.txt 2>&1) && ! grep -q '❌\|✘' /tmp/onco360-$t.txt; then ok "serveur : $t"; else ko "serveur : $t (voir /tmp/onco360-$t.txt)"; fi
done
for t in tests/moteur/test-recus.mjs tests/moteur/test-doses.mjs tests/moteur/test-vigilance.mjs tests/moteur/test-heures.mjs tests/moteur/test-rt.mjs tests/moteur/test-statut.mjs tests/moteur/test-typesconsult.mjs tests/moteur/test-audit3.mjs tests/moteur/test-audit3p4.mjs tests/moteur/test-audit10.mjs tests/moteur/test-s3.mjs tests/moteur/test-s5.mjs tests/moteur/test-honoraires.mjs tests/moteur/test-recherche.mjs tests/moteur/test-seuils.mjs tests/moteur/test-p10.mjs tests/moteur/test-creneaux.mjs tests/moteur/test-poids.mjs tests/moteur/test-alertes.mjs tests/moteur/test-ordonnance.mjs tests/moteur/test-bibmaj.mjs tests/moteur/test-reprogrammer.mjs tests/moteur/test-agenda-c.mjs tests/moteur/test-copie-drive.mjs tests/moteur/test-rtref-contenu.mjs; do node $t > /tmp/onco360-moteur.txt 2>&1 && ok "moteur : $(basename $t)" || ko "moteur : $(basename $t) (voir /tmp/onco360-moteur.txt)"; done
# S7 (24/10/2026) : jeu de test fictif, dans le dépôt (tests/seed-fictif.json, refait par node tests/mkfictif.mjs) : toujours lancés
for t in tests/moteur/test-salle.mjs tests/moteur/test-bilan.mjs; do node $t > /tmp/onco360-moteur2.txt 2>&1 && ok "moteur : $(basename $t)" || ko "moteur : $(basename $t) (voir /tmp/onco360-moteur2.txt)"; done

# Q2 (12/10/2026) : parcours dans le navigateur, avec Chrome puis avec le moteur de Safari (des bugs n'existent que sur Safari)
if [[ " $* " == *" --navigateur "* ]]; then
  echo "5. Parcours dans le navigateur (Chrome, puis Safari / WebKit)"
  NAV_TESTS="test_ordos_proto test_associe test_heure test_audit10 test_s3 test_s5 test_prix_v1 test_salle_tel test_t1 test_t2 test_t4 test_t5 test_t6 test_t7 test_debordement test_fiche test_fiche_donnees test_types_consult test_consultations34 test_salle_315 test_rdv_avenir test_ordo_entete test_protocoles test_agenda test_salle test_intention test_audit3 test_ordonnances_protocole test_p10 test_p9 test_bibliotheques_panne test_agenda_google test_creneaux test_salle_direct test_poids test_modele_admin test_modele_parametres test_reglage_miroir test_alertes_vues test_rcp_menu test_recherche_tel test_calendrier_rt test_recu test_dossier_disposition test_dossier_boutons test_validation test_vigilance test_cures test_seances test_consultations34 test_rt_controle test_rt_volumes test_ordonnances_e test_lot_c test_export test_recuperation test_finances_d test_comptable"
  for nav in chromium webkit; do for t in $NAV_TESTS; do
    if (cd tests && NAVIGATEUR=$nav .venv/bin/python $t.py > /tmp/onco360-nav-$t-$nav.txt 2>&1) && ! grep -qE '✘|❌|Traceback' /tmp/onco360-nav-$t-$nav.txt; then ok "$nav : $t"; else ko "$nav : $t (voir /tmp/onco360-nav-$t-$nav.txt)"; fi
  done; done
fi
if [[ " $* " == *" --regles "* ]]; then
  echo "4. Règles de sécurité (émulateur)"
  (cd tests/regles && npm test > /tmp/onco360-regles.txt 2>&1) && ! grep -q '✘' /tmp/onco360-regles.txt && ok "règles : $(grep -cE 'réussi' /tmp/onco360-regles.txt) suites" || ko "règles (voir /tmp/onco360-regles.txt)"
  (cd tests/regles && npm run export > /tmp/onco360-export.txt 2>&1) && ! grep -q '  ✘' /tmp/onco360-export.txt && ok "export, export de la semaine, restauration, récupération, copie des fichiers (émulateurs)" || ko "export (voir /tmp/onco360-export.txt)"
  (cd tests/regles && npm run modele > /tmp/onco360-modele.txt 2>&1) && ! grep -q '  ✘' /tmp/onco360-modele.txt && ok "modèle de la spécialité : reprendre, appliquer, cabinet neuf (émulateurs)" || ko "modèle (voir /tmp/onco360-modele.txt)"
fi

echo; if [ $KO = 0 ]; then echo "✅ Tout est bon : mise en ligne possible."; else echo "❌ $KO problème(s) : ne pas mettre en ligne."; exit 1; fi
