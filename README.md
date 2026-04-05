# Chez Moi Plus Longtemps

Petit MVP statique en français pour repérer des aides québécoises qui pourraient aider une personne âgée à rester chez elle plus longtemps.

## Ouvrir l'application

Comme les données sont maintenant séparées dans [programmes.json](/home/rene/pc/programmes.json), il faut ouvrir l'application avec un petit serveur local.

Exemple :

```bash
python3 -m http.server 8000
```

Puis ouvrez `http://localhost:8000`.

Ou utilisez le script :

```bash
bash start.sh
```

Par défaut, le script utilise le port `8080`.

```bash
bash start.sh 8090
```

## Ce que contient le MVP

- un questionnaire très court en français
- un premier jeu de programmes officiels Québec / Canada
- des résultats avec documents à préparer
- un lien officiel et une date de vérification pour chaque programme
- un fichier de données séparé pour faciliter les mises à jour
