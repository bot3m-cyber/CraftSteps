# CraftSteps – Minecraft-Bauanleitungen

CraftSteps ist eine unabhängige Minecraft-Bauanleitungs-App. **Das öffentliche GitHub-Pages-Projekt bietet ab V0.2 einen lokalen Schematic-Importer, keinen Online-Upload-Dienst und keinen abgesicherten Admin-Account.**

## V0.2: Minecraft-Bauwerk selbst importieren

1. Öffne die [CraftSteps-App](https://bot3m-cyber.github.io/CraftSteps/).
2. Wähle **„Eigenes Bauwerk importieren“**. Alternativ [CraftSteps Studio](https://bot3m-cyber.github.io/CraftSteps/studio.html) aufrufen.
3. Wähle eine gzip-komprimierte Sponge-`.schem`-Datei **Version 2 oder Version 3**, typischerweise aus der Java-Edition.
4. Kontrolliere das Ergebnis: Abmessungen, Blockpositionen, vorläufige Materialien, Warnungen.
5. Wähle Name, Kategorie, Schwierigkeit und maximale Schrittgröße.
6. Speichere den Bauplan als **privaten lokalen Entwurf**. Er erscheint dann in deiner Galerie, wo du ihn schrittweise durchsehen kannst.
7. Bereits gespeicherte Entwürfe kannst du im Studio ansehen oder löschen.

**Grenzen:** Im aktuellen Prototyp werden `.litematic`, `.schematic` (Legacy), Bedrock-`.mcstructure` und universelle Minecraft-Dateien noch nicht unterstützt. `.schem` maximal 5 MiB komprimiert, 14 MiB unkomprimiert, 24.000 Positionen und 10.000 nicht-Luft-Blöcke. Aktuelle Browser mit `DecompressionStream` und `IndexedDB` nötig. Die importierten Blöcke bleiben im lokalen Browser, nicht in einem Backend.

Die Materialliste wird zunächst aus den Blockzuständen **vorläufig** abgeleitet. Modblöcke, Doppelteile, Flüssigkeiten und Block-Entities können weitere Prüfungen erfordern. Die „Rohschritte“ sind nach Ebene sortiert und bewusst **nicht als baulich vollständig valide Anleitungen freigegeben**. Es gibt keine automatische Veröffentlichung oder Moderatorfreigabe. Der geschützte Online-Administrationsbereich benötigt eine echte Backend-Authentifizierung und serverseitige Rollen-/Rechteprüfung und folgt erst nach Produktfreigabe und Infrastruktur-Setup.

## V0.1: Galerie + Demo-Bauwerke

- Drei selbst definierte Beispielbauwerke
- Mobile Galerie, Kategorien, Suche, Favoriten
- Materiallisten, Stackanzeige, rot markierte Bauschritte aus echten Koordinaten
- LocalStorage für Fortschritt und Einstellungen; IndexedDB für importierte Entwürfe

## Entwickeln und testen

```bash
python -m http.server 8080
# Browser: http://localhost:8080
npm test
```

Der Server ist nur zum Testen nötig, es gibt keine externen Laufzeit-Abhängigkeiten. Node.js >=20. Die CI-Pipeline führt 21 automatisierte Logiktests aus.

## Aufbau

| Datei | Aufgabe |
| --- | --- |
| `index.html`, `app.js`, `styles.css` | Galerie, Materiallisten, 3D-Voxelvorschau |
| `core.js` | Blockdaten und Bauanleitungslogik |
| `studio.html`, `studio.js`, `studio.css` | Importmaske, Prüfung, lokale Entwurfsverwaltung |
| `schem.js` | Eingabeprüfung, gzip-NBT-Parser und Sponge-v2/v3-Analyse |
| `draft-store.js` | Browser-lokale IndexedDB-Persistenz |
| `tests/*.test.js` | Unit-Tests für Material- und Importfunktionen |
| `docs/IMPORT-ROADMAP.md` | Bestehende Grenzen und zukünftige Backend-Roadmap |

**Sicherheit:** Keine geheimen Zugangsdaten in GitHub Pages! Es wird kein öffentliches Administratorkennwort im Browser gespeichert. Die Importmaske kann jeder öffnen, aber die daraus resultierenden Entwürfe sind ausschließlich lokal sichtbar. Öffentliches Teilen erfordert eine spätere sichere Serverfunktion. CraftSteps gehört nicht zu WBuilds, Mojang oder Microsoft.