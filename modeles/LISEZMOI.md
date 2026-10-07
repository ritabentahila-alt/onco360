> **Depuis le 07/10/2026 (étape 1A bis), Onco360 ne produit plus de fichier Word.** Le pli confidentiel et le compte rendu
> de fin s'ouvrent dans une fenêtre d'Onco360 (feuille A4 modifiable, imprimée sur papier à en-tête, enregistrée avec la
> radiothérapie). Leur mise en page est celle de ces deux modèles, recopiée dans `public/js/app/documents.js`
> (`htmlPli`, `htmlCr`). Pour changer un texte fixe ou l'ordre des rubriques : modifier le modèle ici, puis demander à
> Claude de reporter la modification dans `documents.js`. Les fichiers de `public/modeles/` ne sont plus utilisés.

# Modèles Word d'Onco360

Modifiez librement la mise en page : polices, couleurs, marges, textes fixes, ordre des rubriques, tableaux, pied de page…
**Gardez les étiquettes `{{…}}`** là où l'information doit apparaître. Vous pouvez les déplacer, les mettre en gras ou en
couleur, en supprimer, ou en mettre plusieurs fois. Onco360 les remplace par les informations du dossier.

Si une information manque dans le dossier :
- pli confidentiel : elle est remplacée par « À REMPLIR » surligné en jaune ;
- compte rendu : elle est remplacée par « à compléter par le médecin » en gris.

| Étiquette | Remplacée par |
|---|---|
| `{{LOGO}}` | logo de l'établissement (dans l'en-tête ; on peut la déplacer) |
| `{{SIGNATURE}}` | image de la signature du médecin (Profil) |
| `{{CIVILITE}}` | Madame / Monsieur |
| `{{NOM}}`, `{{PRENOM}}` | nom (en majuscules) et prénom du patient |
| `{{DATE_NAISSANCE}}`, `{{SEXE}}` | date de naissance, Féminin / Masculin |
| `{{DIAGNOSTIC}}` | diagnostic (et sa précision) |
| `{{RESUME_CLINIQUE}}` | résumé clinique de la prescription (sinon résumé du patient) |
| `{{ACTE}}` | acte de radiothérapie (+ VMAT) |
| `{{TECHNIQUE}}`, `{{VISEE}}`, `{{LOCALISATION}}` | technique, curative / palliative, localisation |
| `{{DOSE}}`, `{{DOSE_PAR_FRACTION}}`, `{{FRACTIONS}}` | dose totale, dose par fraction (Gy), nombre de séances |
| `{{DUREE}}` | durée prévisible (ex. « 4 semaines (19 séances) ») |
| `{{DATE_DEBUT}}`, `{{DATE_FIN}}` | 1re et dernière séance |
| `{{DATE}}` | date du jour, en toutes lettres |
| `{{MEDECIN}}` | médecin connecté : « Dr NOM Prénom » (titre du Profil, sinon Dr) |
| `{{SPECIALITE}}` (ou `{{Spécialité}}`) | spécialité du médecin (Profil) |
| `{{MEDECIN_REFERENT}}` | correspondant du patient |
| `{{ETABLISSEMENT}}` | nom complet de l'établissement de la prescription (ex. « Hôpital Cheikh Khalifa », pas « HCK ») |

Quand c'est fini : enregistrez (Cmd + S) en gardant le format Word (.docx) et le même nom, puis prévenez Claude.

## Pour Claude : mettre un modèle à jour
Les modèles utilisés par Onco360 sont les copies publiées : `public/modeles/pli-confidentiel.docx` et `public/modeles/cr-fin-rt.docx`.
Après une modification par Dr Bentahila, recopier les deux fichiers de ce dossier vers `public/modeles/` (noms ci-dessus), faire un
essai (`modeles/essai/`), puis `firebase deploy --only hosting`. Le remplissage est dans `public/js/app/documents.js`
(`remplirModele`) ; si un modèle manque, Onco360 reprend l'ancienne mise en page intégrée.
