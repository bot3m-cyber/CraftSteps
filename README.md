# CraftSteps – Minecraft-Bauanleitungen

CraftSteps ist eine unabhängige, frei zugängliche Schritt-für-Schritt-Bauanleitungs-Webapp. Das Projekt steht in keiner Verbindung zu Mojang, Microsoft, WBuilds oder Bloxelizer.

**Live:** https://bot3m-cyber.github.io/CraftSteps/  
**Importstudio:** https://bot3m-cyber.github.io/CraftSteps/studio.html

## V0.4 – echte Originaltexturen aus der eigenen Minecraft-Java-Datei

CraftSteps verwendet für die 3D-Vorschau **die originalen Vanilla-Textur-PNGs und Blockmodell-JSON-Dateien aus der Java-Clientdatei, die du selbst im Browser auswählst**. Die bisher erfundenen Pixeltexturen wurden als Darstellung entfernt; ohne ausgewählte Minecraft-Datei erscheinen **als Ersatz gekennzeichnete, selbst erzeugte Pixel-Vorschautexturen**.. Der Webserver und das öffentliche GitHub-Repository enthalten **keine Minecraft-Spieltexturen, keine extrahierten Mojang-Dateien und keine eingebettete Client-JAR**.

### Originale Minecraft-Java-Assets aktivieren

1. Öffne die CraftSteps-Galerie oder das Studio und wähle oben **„Minecraft-Client (.jar) auswählen“**.
2. Suche unter Windows im Dateimanager nach `%APPDATA%\.minecraft\versions\<Version>\<Version>.jar` (z. B. unter `1.21.1/1.21.1.jar`). Unter Linux/macOS findest du die Datei entsprechend im `.minecraft/versions/`-Ordner deines Minecraft-Launchers. Eine vollständige Vanilla-Java-Client-JAR ist erforderlich, kein reines Texturpaket.
3. CraftSteps liest die Originaldatei **nur lokal im Browser**. Es verarbeitet daraus die Vanilla-Blockstates, Modellvererbungen, Varianten, Multipart-Modelle und Textur-PNGs. Sie werden nicht an einen Server übertragen und nicht öffentlich geteilt.
4. Die Datei wird – sofern dein Browser genügend lokalen Speicher hat – nur in diesem Browser in IndexedDB hinterlegt und beim nächsten Besuch wieder gelesen. Mit **„Entfernen“** löschst du diesen lokalen Eintrag.

Wichtig: Minecraft-Spieltexturen sind urheberrechtlich geschützt. Die Minecraft [Usage Guidelines](https://www.minecraft.net/de-de/usage-guidelines) verbieten insbesondere, Spiel-/Asset-Dateien einfach weiterzuverbreiten. Deshalb enthält diese Web-App keinen öffentlichen Mojang-Textur-Download. Das Projekt ist kein offizielles Produkt von Mojang oder Microsoft.

Die Original-PNGs werden unverändert aus der eigenen Datei geladen. **Die 3D-Anzeige ist dennoch nicht für alle Blockzustände pixelgenau zum Minecraft-Spiel**: Biomeinfärbung (Gras/Laub), animierte Texturen, komplexe Elementrotationen, manche Sondermodelle, Render-Layer und Entities sind noch unvollständig. Unbekannte/fehlende Models erscheinen neutral und werden nicht als echte Minecraft-Texturen ausgegeben.

### Weitere V0.3-Funktionen bleiben erhalten

- Dreh- und zoombare 3D-Bauanleitungen mit roten, koordinatenbasierten Markierungen und Material-Icons.
- Lokaler Import von Sponge `.schem` V2/V3, `.litematic` und älteren `.schematic`-Dateien.
- Private Bauentwürfe, Materialliste, Schrittanzeige und automatische vorläufige Rohschritte nach Höhe.

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
- Blockstate-JSON, Varianten und Multipart aus der lokal bereitgestellten Java-Client-JAR werden grundsätzlich eingelesen. Vollständige Modell-/UV- und Beleuchtungstreue sowie Biomeinfärbung sind noch nicht erreicht. Die originalen Asset-Dateien werden **nicht von unserer Webseite ausgeliefert**.
- Die automatischen Rohschritte werden primär nach Höhe erzeugt. Es gibt keine KI, die aus Einzelbildern Pixel-korrekte Positionen rät; diese Daten kommen aus den importierten 3D-Koordinaten.

## Lokal entwickeln und testen

```bash
python -m http.server 8080
# Im Browser: http://localhost:8080
npm test
```

Es gibt **keine externen Laufzeitbibliotheken**. Node.js >=20 erforderlich. GitHub Actions führt Unit-Tests für Blockdaten, Importe, die 3D-Zeichenengine und den Java-Asset-Loader aus. Die Minecraft-Originaldatei gehört nicht zu diesem Repository.

## Projektstruktur

| Datei | Aufgabe |
| --- | --- |
| `index.html`, `app.js`, `styles.css` | Galerie, Bauanleitungen und Materialansichten |
| `block-visuals.js` | 3D-Canvas-Darstellung mit geladenen Vanilla-Modellen/Originaltexturen |
| `vanilla-assets.js`, `assets-ui.js` | Sicher begrenzter ZIP-Import aus der eigenen Minecraft-Java-JAR und browserlokale Auswahl |
| `core.js` | Blockdaten, Mengenberechnung und Schritt-Engine |
| `studio.html`, `studio.js`, `studio.css` | Private Import-/Entwurfsoberfläche mit drehbarer 3D-Vorschau |
| `schem.js` | Komprimierter NBT-Parser für `.schem`, `.litematic` und Legacy `.schematic` |
| `draft-store.js` | IndexedDB-Persistenz, nur im aktuellen Browser |
| `tests/*.test.js` | Unit-Tests für Geometrie, Importe und Schritte |
| `docs/RENDERER-ROADMAP.md` | Vorläufige Modellregeln und geplanter Ausbau |

Das Studio enthält keine geheimen Schlüssel, Anmeldung oder serverseitige Berechtigungen. Der Import wird nicht öffentlich geteilt. Copyright- und Markenrechte an Minecraft bleiben bei den jeweiligen Rechteinhabern.


## V0.4.1 – Textureless-Regression auf mobilen Geräten behoben
Wenn keine Minecraft-Java-Clientdatei verfügbar ist, stellt CraftSteps die Bauwerke und Material-Icons nicht mehr als vollständig graue Würfel dar. Stattdessen wird **eine ausdrücklich gekennzeichnete, selbst erzeugte Pixel-Vorschau** angezeigt. **Diese Vorschau enthält keine originalen Minecraft-Texturen.** Im Bauschritt führt ein neuer Button direkt zur lokalen Dateiauswahl; nach erfolgreichem Laden nutzt CraftSteps die originalen PNGs aus der eigenen Java-JAR. Fehlende Vanilla-Modelle erhalten eine Ersatzvorschau und werden als unvollständig gekennzeichnet. Keine Dateien werden an den Server hochgeladen oder von CraftSteps verteilt.
