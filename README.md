# CraftSteps — Minecraft-Bauanleitungen

CraftSteps ist eine **eigenständige Minecraft-Bauanleitungs-App**. Das Produkt orientiert sich am leicht verständlichen Bedienkonzept visueller Bauanleitungen, verwendet jedoch eigene Beispielbauwerke und eigene Oberflächenelemente. CraftSteps ist nicht mit WBuilds, Mojang oder Microsoft verbunden.

## Version 0.1 — Foundation (Demo)

In dieser Version enthalten:

- Responsive Bauwerksgalerie mit Suche, Kategorien, Favoriten und Schwierigkeit.
- Drei originale Beispielbauwerke: Starterhütte, Survival-Garten und Steinwachturm.
- Detailseiten und automatische Materialberechnung aus definierten X/Y/Z-Blockkoordinaten.
- Nummerierte Bauanleitung mit roten 3D-Blockumrandungen für **neu** hinzukommende Blöcke.
- Schrittbezogene Materialliste, Stack-Berechnung und abhaken gesammelter Materialien.
- Fortschrittsspeicherung je Bauwerk sowie Light/Dark Mode und DE/EN-Oberfläche.
- Rotation und Zoom der eigenen Canvas-Voxelansicht.

**Wichtig:** Die Demo-Bauwerke sind in `core.js` programmiert. Ein Import fremder `.schem`-, `.litematic`- oder `.nbt`-Dateien und ein universeller automatischer Anleitungsgenerator sind **noch nicht enthalten**. Aussehen und Materialdarstellung sind vereinfacht; Minecraft-Blockzustände sind nicht für alle Editionen und Versionen vollständig abgebildet.

## Lokal starten

Es werden für die App selbst keine npm-Abhängigkeiten benötigt.

```bash
python -m http.server 8080
```

Danach im Browser `http://localhost:8080` öffnen. Für Tests Node.js >=20 verwenden:

```bash
npm test
```

## Projektstruktur

| Datei | Inhalt |
| --- | --- |
| `index.html` | App-Einstiegspunkt |
| `styles.css` | Layout, mobile Ansicht und Themes |
| `core.js` | Demobauwerke, Koordinaten, Schritte und Materiallogik |
| `app.js` | Navigation, Canvas-Rendering, Interaktionen und Browserdaten |
| `favicon.svg` | Eigenes App-Symbol |
| `tests/core.test.js` | 13 automatisierte Tests |
| `.github/workflows/ci.yml` | Testautomatisierung bei Pull Requests |
| `.github/workflows/pages.yml` | GitHub Pages nach Freigabe und Merge |
| `docs/ARCHITEKTUR-UND-ROADMAP.md` | Technischer Umsetzungsplan |

## Veröffentlichung

Die GitHub-Pages-Action ist für `main` vorbereitet und wird **erst nach Merge** ausgeführt. GitHub Pages muss unter **Settings → Pages → Build and deployment → Source: GitHub Actions** aktiviert sein.

Das Repository ist derzeit **privat**. Bei einem persönlichen GitHub-Free-Konto lässt sich Pages nur mit einem **öffentlichen** Repository verwenden; GitHub Pro unterstützt Pages auch bei privaten Repositories. **CraftSteps wird nicht eigenständig öffentlich gestellt.** Eine Veröffentlichung oder Änderung der Repository-Sichtbarkeit wird erst nach Zustimmung des Projektinhabers durchgeführt.

## Datenschutz und Abgrenzung

Fortschritt, Favoriten und Einstellungen werden in der Demo lokal im Browser (`localStorage`) gespeichert; es gibt keine Nutzerkonten und keine Cloud-Synchronisierung. Keine fremden WBuilds-Bilder, Markenmaterialien oder Baupläne wurden übernommen.

Mehr zur nächsten Entwicklungsphase: [Architektur und Roadmap](docs/ARCHITEKTUR-UND-ROADMAP.md).
