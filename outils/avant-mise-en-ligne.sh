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

echo "2. Aucune donnée réelle de patient dans le code, le site ou les tests"
EXCL=(--exclude-dir=node_modules --exclude-dir=.venv --exclude-dir=.git --exclude-dir=vendor --exclude=seed.json --exclude=bilan_ref.txt --exclude='*.min.js')
R=$(grep -rIlE '"nomF" *: *"[A-Za-z]' public functions tests "${EXCL[@]}" 2>/dev/null); [ -z "$R" ] && ok "aucune fiche patient écrite en dur" || ko "fiche patient écrite en dur dans : $R"
R=$(grep -rIl 'IMP1 *=' public functions tests "${EXCL[@]}" 2>/dev/null); [ -z "$R" ] && ok "aucune importation de l'ancienne application" || ko "IMP1 trouvé dans : $R"
# numéros de test évidents (4 chiffres identiques à la suite, ex. 0661000000) acceptés
R=$(grep -rIoE '\b0[5-7][0-9]{8}\b' public functions tests "${EXCL[@]}" 2>/dev/null | perl -ne 'print unless /(\d)\1\1\1/' | head -3); [ -z "$R" ] && ok "aucun numéro de téléphone réel" || ko "numéro de téléphone trouvé : $R"
[ -f public/ancienne-app.html ] && ko "public/ancienne-app.html est revenu" || ok "ancienne application absente du site"

echo "3. Tests sans navigateur"
for t in test-logique test-cabinets test-audit test-numeros test-exportation test-sauvegarde; do
  if (cd functions && node $t.js > /tmp/onco360-$t.txt 2>&1) && ! grep -q '❌\|✘' /tmp/onco360-$t.txt; then ok "serveur : $t"; else ko "serveur : $t (voir /tmp/onco360-$t.txt)"; fi
done
for t in tests/moteur/test-recus.mjs tests/moteur/test-doses.mjs tests/moteur/test-vigilance.mjs tests/moteur/test-heures.mjs tests/moteur/test-rt.mjs tests/moteur/test-statut.mjs tests/moteur/test-typesconsult.mjs tests/moteur/test-audit3.mjs tests/moteur/test-audit3p4.mjs tests/moteur/test-seuils.mjs; do node $t > /tmp/onco360-moteur.txt 2>&1 && ok "moteur : $(basename $t)" || ko "moteur : $(basename $t) (voir /tmp/onco360-moteur.txt)"; done
if [ -f tests/seed.json ]; then
  for t in tests/moteur/test-salle.mjs tests/moteur/test-bilan.mjs; do node $t > /tmp/onco360-moteur2.txt 2>&1 && ok "moteur : $(basename $t)" || ko "moteur : $(basename $t)"; done
else echo "  (tests/seed.json absent : test-salle et test-bilan ignorés)"; fi

# Q2 (12/10/2026) : parcours dans le navigateur, avec Chrome puis avec le moteur de Safari (des bugs n'existent que sur Safari)
if [[ " $* " == *" --navigateur "* ]] && [ -f tests/seed.json ]; then
  echo "5. Parcours dans le navigateur (Chrome, puis Safari / WebKit)"
  NAV_TESTS="test_debordement test_fiche test_fiche_donnees test_types_consult test_consultations34 test_salle_315 test_rdv_avenir test_ordo_entete test_protocoles test_agenda test_salle test_intention test_audit3 test_ordonnances_protocole"
  for nav in chromium webkit; do for t in $NAV_TESTS; do
    if (cd tests && NAVIGATEUR=$nav .venv/bin/python $t.py > /tmp/onco360-nav-$t-$nav.txt 2>&1) && ! grep -qE '✘|❌|Traceback' /tmp/onco360-nav-$t-$nav.txt; then ok "$nav : $t"; else ko "$nav : $t (voir /tmp/onco360-nav-$t-$nav.txt)"; fi
  done; done
fi
if [[ " $* " == *" --regles "* ]]; then
  echo "4. Règles de sécurité (émulateur)"
  (cd tests/regles && npm test > /tmp/onco360-regles.txt 2>&1) && ! grep -q '✘' /tmp/onco360-regles.txt && ok "règles : $(grep -cE 'réussi' /tmp/onco360-regles.txt) suites" || ko "règles (voir /tmp/onco360-regles.txt)"
  (cd tests/regles && npm run export > /tmp/onco360-export.txt 2>&1) && ! grep -q '  ✘' /tmp/onco360-export.txt && ok "export, restauration et copie des fichiers (émulateurs)" || ko "export (voir /tmp/onco360-export.txt)"
fi

echo; if [ $KO = 0 ]; then echo "✅ Tout est bon : mise en ligne possible."; else echo "❌ $KO problème(s) : ne pas mettre en ligne."; exit 1; fi
