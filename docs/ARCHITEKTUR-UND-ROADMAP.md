# CraftSteps — Architektur und Entwicklungsplan

## Produktziel

CraftSteps zeigt Minecraft-Bauwerke, exakte Materiallisten und schrittweise Bauanleitungen mit koordinatorientierten Markierungen. Das Interface ist eigenständig, mobilfreundlich und wahlweise hell oder dunkel.

## Aktueller Architekturstand (V0.1)

- **Frontend:** HTML, CSS und JavaScript ohne externe Laufzeit-Abhängigkeiten
- **Daten:** `core.js` mit drei originalen Teststrukturen, Koordinaten `x,y,z`, Materialtyp, Bauphase und optional `atomicId`
- **Schritte:** nach Bauphasen und Reihenfolge gruppiert; zusammengehörige mehrteilige Blöcke behalten denselben Schritt
- **Rendering:** Canvas-Voxelvisualisierung mit projektionsabhängigen roten Kanten um die in einem Schritt neu zu platzierenden Blockpositionen
- **Materialien:** ein gemeinsamer Zählmechanismus für Gesamt- und Schrittliste, Sonderfall zweiteilige Tür
- **Benutzerdaten:** Browser-`localStorage`; nicht über Geräte synchronisiert
- **Tests:** Node.js-`node:test`, kontrolliert u. a. Vollständigkeit der Rekonstruktion und konsistente Materialzählung

Die Demo ist noch nicht für beliebige importierte Minecraft-Bauplandateien freigegeben.

## Geplante Folgephasen (nicht implementiert)

### V0.2 — Bauplandateien importieren

- zunächst validierte WorldEdit/Sponge-`.schem`-Varianten
- Formatversion, Palette, Strukturabmessungen und Blockzustände sicher einlesen
- unbekannte Blöcke, ungültige NBT-Daten und übergroße Dateien verständlich zurückweisen
- Materialmengen editions- und versionsbewusst ableiten; besondere Inventar-/Mehrblockobjekte separat behandeln

### V0.3 — Automatischer Schrittgenerator

- Platzierungsabhängigkeiten und Blockgruppen berücksichtigen
- schrittweise Rekonstruktion gegen importierte Originalstruktur vergleichen
- algorithmische Kameraposition und rote 3D-Markierungen pro Schritt
- manueller Schritt- und Kameraeditor für Korrekturen

### V0.4 — Geschützter Administrationsbereich

- Upload, Entwurf, Prüfen, Freigeben, Aktualisieren und Zurückziehen von Anleitungen
- Rechteprüfung, Datei- und Bildvalidierung, Lizenz-/Urheberrechtsprüfung
- öffentliche Inhalte nur nach manueller Freigabe

### V0.5 — Erweiterungen

- Offline-PWA, weitere Filter, verbesserte Texturen, Übersetzungen
- optionale Benutzerkonten und Synchronisierung nur nach Product-Owner-Freigabe

## Qualitätssicherung

Neue importierte Strukturen müssen maschinell gegen ihre rekonstruierten Blockkoordinaten geprüft werden. Ein Schrittgenerator darf weder Blöcke auslassen noch zusätzliche platzieren. Die Materialliste muss mit den Schrittmaterialien unter Beachtung von Spielversion, Blockzuständen und Inventarregeln konsistent sein.

## Entwicklung

`main` enthält nur geprüfte Versionen. Neue Funktionen kommen über Issue → Feature-Branch → Tests → Pull Request → Review → Merge. Ein Deployment der Demo erfolgt nur nach Konfiguration durch den Repository-Eigentümer. Größere Produktänderungen und öffentliche Freigaben werden nicht ohne Zustimmung durchgeführt.
