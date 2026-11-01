# CraftSteps – Minecraft-Bauanleitungen

CraftSteps ist eine unabhängige, frei zugängliche Schritt-für-Schritt-Bauanleitungs-Webapp. Das Projekt steht in keiner Verbindung zu Mojang, Microsoft, WBuilds oder Bloxelizer.

**Live:** https://bot3m-cyber.github.io/CraftSteps/  
**Importstudio:** https://bot3m-cyber.github.io/CraftSteps/studio.html

## V0.3 – 3D-Blockmodelle, Icons und mehr Dateiimporte

- Neu entwickelter **Canvas-3D-Renderer** aus echten Blockkoordinaten mit dreh-/neigbarer Kamera (Ziehen am Bauwerk) und Zoom in der Anleitung. Kein Screenshot- oder KI-Umrandungsalgorithmus: rote Umrandungen werden mathematisch über die Projektion der Blockpositionen erzeugt.
- **Eigene, pixelige 16×16-Materialtexturen** statt beliebiger Zufallsfarben; kleine **gerenderte Block-Icons** in Gesamtmaterialliste, Schritten und Koordinatenliste. Minecraft-ähnliche Gestaltung **ohne mitgelieferte Mojang-Texturen**.
- Erste zustandsabhängige Modelle für Treppen (Drehung, obere/untere Hälfte, grobe Eckformen), Stufen, Türen, Falltüren, Zäune, Mauern, Glasscheiben, Betten, Laternen und andere Blöcke. **Das ist noch keine vollständige Vanilla-Blockmodell-Engine**; komplexe Blockstates, Redstone, BlockEntities, Mod-Assets und einige Sonderformen werden weiterhin nur vereinfacht dargestellt.
- **Lokaler Dateiimport** für Sponge `.schem` V2/V3, **Litematica `.litematic`** mit Regionen/Paletten/Bitpacking sowie **MCEdit/WorldEdit Legacy `.schematic`** (nur begrenztes numerisches ID-Mapping, Warnungen bei fehlender Zuordnung). Alle Formate sind Minecraft-Java-orientiert. `.mcstructure`, Vanilla `.nbt` und Mod-spezifische Daten werden nicht vollständig unterstützt.
- Bereits **direkt nach dem Einlesen** erscheint im Studio eine **drehbare 3D-Vorschau**, zusätzlich die Draufsicht, Materialliste, Importwarnungen und ein Formular für einen privaten Entwurf.
- Im Bauanleitungsmodus wird zu jedem neuen Block die **Koordinate X/Y/Z** angezeigt, bei Importen außerdem die erkannten Blockstate-Properties. Red outlines bleiben beim Drehen konsistent.
- Drei originale Demobauwerke, Kategorien, Suche, Favoriten, Materiallisten, Fortschrittsspeicherung und private Entwürfe bleiben erhalten.

## Eigenes Bauwerk importieren

1. [CraftSteps Studio](https://bot3m-cyber.github.io/CraftSteps/studio.html) öffnen.
2. Eine **`.schem`, `.litematic` oder `.schematic`** aus der Java-Edition auswählen.
3. Die **3D-Vorschau direkt im Studio** drehen und Draufsicht, Materialien und Warnungen prüfen.
4. Name, Kategorie, Schwierigkeit und Anzahl der Rohschritt-Blöcke festlegen.
5. Als **privaten Entwurf** speichern. Danach kannst du das Bauwerk in deiner Galerie öffnen und durch die Schritte gehen.

Die Datei wird **nicht auf einen Server hochgeladen**. Private Entwürfe werden nur in der IndexedDB deines jeweiligen Browsers gespeichert; es gibt **noch keinen geschützten Online-Adminbereich** und keine Synchronisierung. Für öffentliche Bauwerksuploads ist später eine echte Server-Authentifizierung nötig.

### Grenzen / Verlässlichkeit

- Pro Datei höchstens **5 MiB komprimiert, 14 MiB entpackt, 24.000 Blockpositionen, 10.000 nicht-Luft-Blöcke**. Große Szenen werden aus Performancegründen in der Ansicht teilweise ausgedünnt; die intern importierten Rohdaten bleiben erhalten.
- Browser mit `DecompressionStream`, `IndexedDB` und Canvas nötig. Im Einzelfall unterscheiden sich die alten Block-IDs in `.schematic` von neueren Minecraft-IDs; nicht erkannte IDs werden ausdrücklich als **pinkes Platzhaltermodell** markiert.
- **Materialmengen, Stackgrößen, Blockstates und baubare Reihenfolgen sind bei Importen vorläufig.** Doppelteile, mehrstufige Platzierung, Flüssigkeiten, Redstone und Entity-Inhalte benötigen eine zusätzliche Prüfung vor Veröffentlichung.
- Vollständige Ressourcenpaket-Interpretation (Blockstate-JSON, Varianten, Multipart, Textur-Atlas) und echte Mojang-Assets werden **nicht** ausgeliefert. Ein präziserer, lizenzsauberer Resource-Pack-Renderer ist ein separater Meilenstein.
- Die automatischen Rohschritte werden primär nach Höhe erzeugt. Es gibt keine KI, die aus Einzelbildern Pixel-korrekte Positionen rät; diese Daten kommen aus den importierten 3D-Koordinaten.

## Lokal entwickeln und testen

```bash
python -m http.server 8080
# Im Browser: http://localhost:8080
npm test
```

Es gibt **keine externen Laufzeitbibliotheken**. Node.js >=20 erforderlich. GitHub Actions führt 28 Unit-Tests für Blockdaten, Importe und die 3D-Zeichenengine aus. Zusätzlich wurden Browser-Smoke-Tests für die Galerie, Schrittansicht und Studio-Importer durchgeführt.

## Projektstruktur

| Datei | Aufgabe |
| --- | --- |
| `index.html`, `app.js`, `styles.css` | Galerie, Bauanleitungen und Materialansichten |
| `block-visuals.js` | Originale 16×16-Blocktexturen, Canvas-3D-Modelle und Pixel-Icons |
| `core.js` | Blockdaten, Mengenberechnung und Schritt-Engine |
| `studio.html`, `studio.js`, `studio.css` | Private Import-/Entwurfsoberfläche mit drehbarer 3D-Vorschau |
| `schem.js` | Komprimierter NBT-Parser für `.schem`, `.litematic` und Legacy `.schematic` |
| `draft-store.js` | IndexedDB-Persistenz, nur im aktuellen Browser |
| `tests/*.test.js` | Unit-Tests für Geometrie, Importe und Schritte |
| `docs/RENDERER-ROADMAP.md` | Vorläufige Modellregeln und geplanter Ausbau |

Das Studio enthält keine geheimen Schlüssel, Anmeldung oder serverseitige Berechtigungen. Der Import wird nicht öffentlich geteilt. Copyright- und Markenrechte an Minecraft bleiben bei den jeweiligen Rechteinhabern.
