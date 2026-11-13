# CraftSteps – Minecraft-Bauanleitungen

CraftSteps ist eine unabhängige, frei zugängliche Schritt-für-Schritt-Bauanleitungs-Webapp. Das Projekt steht in keiner Verbindung zu Mojang, Microsoft, WBuilds oder Bloxelizer.

**Live:** https://bot3m-cyber.github.io/CraftSteps/  
**Importstudio:** https://bot3m-cyber.github.io/CraftSteps/studio.html

## V0.5 – originale Assets aus der eigenen Minecraft-Java-Datei

CraftSteps verwendet für die 3D-Ansicht **ausschließlich die originalen Vanilla-Textur-PNGs, Blockmodelle und Blockstates aus einer Datei, die du selbst lokal auswählst**. Ohne diese Datei erscheinen nur klar gekennzeichnete, einfarbig-neutrale Platzhalter – keine nachgemalten oder angeblich originalen Texturen. Der Webserver und das öffentliche GitHub-Repository enthalten **keine Minecraft-Spieltexturen, keine extrahierten Mojang-Dateien und keine eingebettete Client-JAR**.

### Originale Minecraft-Java-Assets aktivieren

1. Öffne die CraftSteps-Galerie oder das Studio und wähle oben **„Client-JAR oder Vanilla-ZIP auswählen“**.
2. Wähle entweder eine Minecraft-Java-Client-JAR aus `.minecraft/versions/<Version>/<Version>.jar` oder ein vollständiges Vanilla-Resource-Pack-ZIP, das `assets/minecraft/blockstates`, `models` und `textures` enthält. Ein nur teilweise überschreibendes Resource Pack reicht nicht aus.
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
| `block-visuals.js` | 3D-Canvas-Darstellung mit geladenen Vanilla-Modellen/Originaltexturen; neutrale Platzhalter bei fehlenden Assets |
| `vanilla-assets.js`, `assets-ui.js` | Sicher begrenzter ZIP-Import aus der eigenen Minecraft-Java-JAR und browserlokale Auswahl |
| `core.js` | Blockdaten, Mengenberechnung und Schritt-Engine |
| `studio.html`, `studio.js`, `studio.css` | Private Import-/Entwurfsoberfläche mit drehbarer 3D-Vorschau |
| `schem.js` | Komprimierter NBT-Parser für `.schem`, `.litematic` und Legacy `.schematic` |
| `draft-store.js` | IndexedDB-Persistenz, nur im aktuellen Browser |
| `tests/*.test.js` | Unit-Tests für Geometrie, Importe und Schritte |
| `docs/RENDERER-ROADMAP.md` | Vorläufige Modellregeln und geplanter Ausbau |

Das Studio enthält keine geheimen Schlüssel, Anmeldung oder serverseitige Berechtigungen. Der Import wird nicht öffentlich geteilt. Copyright- und Markenrechte an Minecraft bleiben bei den jeweiligen Rechteinhabern.


## V0.5 – keine nachgebauten Minecraft-Texturen

Der frühere Pixel-Fallback wurde aus Laufzeitcode, HTML und Deployment entfernt. Material-Icons und Blockflächen nutzen nach dem Import dieselbe originale Asset-Pipeline. Ohne lokale Assets oder bei einem fehlenden Modell bleibt die Fläche neutral grau und die Oberfläche nennt die Einschränkung ausdrücklich. Blockstate-Varianten und Multipart-Modelle werden ausgewertet; gewichtete Varianten werden deterministisch nach Position gewählt, implizite Vanilla-UVs werden berechnet und Modellrotationen werden auf Geometrie und Sichtbarkeit angewandt.

Das ist bewusst keine Behauptung vollständiger Pixelgleichheit mit Minecraft. Biomeinfärbung, Flüssigkeiten, animierte Texturen, Entity-Renderer, Render-Layer und einzelne komplexe Sondermodelle bleiben begrenzt. Auf Mobilgeräten kann eine Client-JAR nicht automatisch aus einer Desktop-Installation gelesen werden; der Nutzer muss eine rechtmäßig vorhandene Datei lokal auswählen. CraftSteps lädt und veröffentlicht sie nicht.


## V0.4.2 – Texturdiagnose und mobile Anzeige

**Wichtig:** Minecraft-Originaltexturen sind wegen der Eigentumsrechte von Mojang/Microsoft nicht mit der öffentlichen Webseite ausgeliefert. Der Browser kann die Dateien aus `.minecraft` **nicht von sich aus öffnen**. Ohne lokal ausgewählte Datei kann deshalb **keine** identische Minecraft-Textur dargestellt werden. Die V0.4.2-Anzeige markiert das deutlich und zeigt in der Materialliste ein Fragezeichen anstelle eines scheinbar echten Block-Icons. Das ist keine neue Minecraft-Textur.

So geht es: Am PC die passende Java-Clientdatei `%APPDATA%\\.minecraft\\versions\\<VERSION>\\<VERSION>.jar` über **„Original-Minecraft-Datei auswählen“** laden. Auf Android zunächst dieselbe Datei vom eigenen PC auf das Handy übertragen und in CraftSteps über den Dateidialog auswählen. Alles wird nur im Browser gelesen und möglichst lokal gespeichert; auf anderen Geräten muss die Datei erneut ausgewählt werden.

Die eingebauten Demoblöcke `leaves`, `hay`, `moss` und `stone_slab` werden jetzt den tatsächlichen Java-Block-IDs zugeordnet. Das verbessert die Abdeckung nach dem Laden des richtigen Java-Archivs. Für vollständige Pixelgenauigkeit bei komplexen Blockstates ist weitere Renderer-Arbeit nötig; V0.4.2 garantiert ausdrücklich nicht 100 % korrekt gerenderte Blöcke.

## V0.5.0 – geführte 3D-Kamera und verbesserte Blockstates

- In der Bauanleitung wird die **Kamera automatisch auf die neu zu platzierenden Blöcke** zentriert, wobei die Rohblockkoordinaten verwendet werden. Beim Klick auf „Weiter“ oder „Zurück“ springt die Seite zur 3D-Ansicht zurück.
- Der Schalter **„Gesamtes Bauwerk“ / „Schritt fokussieren“** erlaubt den Wechsel zwischen Überblick und dem aktuellen Bauschritt.
- **„Unterseite ansehen“** richtet die Kamera unter die Plattform aus; durch Ziehen kann man jetzt auch negative Neigungswinkel nutzen. „Von oben ansehen“ stellt eine erhöhte Ansicht wieder her.
- Eingebaute ältere Beispiel-Bauwerke erhalten beim Vanilla-Asset-Import korrekte Standardzustände für Türen, Stufen, Logs und Laternen. Verbindungen zwischen direkt benachbarten gleichartigen Zäunen/Glasscheiben können bei zustandslosen Beispielen bestimmt werden. Explizite Eigenschaften importierter Bauwerke werden nicht überschrieben.
- Der lokale Textur-Loader versucht bei `createImageBitmap`-Problemen auch die Browser-Bilddekodierung.

**Einschränkung:** Die originale Minecraft-Optik benötigt weiterhin die vom Nutzer lokal ausgewählte Minecraft-Java-Datei. Keine Mojang-Texturen sind in CraftSteps oder im Repository enthalten. Nicht jeder Vanilla-Blockzustand ist bereits vollständig gerendert. Die Canvas-Vorschau ist noch kein vollständiger Minecraft-Renderer; komplexe Blockmodelle, besondere Tint-Farben, Biome und Block-Entities können abweichen.


## V0.6 – Bildstudio und eigenständiger 3D-Bauguide (Beta)

**Bildstudio:** \`https://bot3m-cyber.github.io/CraftSteps/image-studio.html\`
**Bildguide:** wird nach dem Speichern als lokale Anleitung im Browser geöffnet.

- **Bildbasierter Upload**: 1–48 eigene Schrittbilder als PNG/JPEG/WebP auswählen, Reihenfolge ändern, optional ein vorheriges Ausgangsbild angeben.
- **Automatische Rotmarkierung**: CraftSteps vergleicht das aktuelle Schrittbild mit dem vorherigen aus derselben Perspektive und umrandet größere geänderte Bildbereiche. Die Erkennung ist eine **einfache lokale Bilddifferenz**, **keine KI** und keine pixelgenaue Erkennung einzelner Minecraft-Blöcke. Bei großflächigen Veränderungen wird die Markierung bewusst verworfen statt falsch angezeigt.
- **Bildguide**: Nummerierte Schritte, Vor/Zurück, Fortschritt lokal gespeichert, Umrandung ein/aus und Sensitivitätsregler.
- **Eigenständiger 3D-Modus**: Bei existierenden Bauwerken mit tatsächlichen Blockkoordinaten lässt sich in der normalen Bauanleitung ein bildschirmfüllender, drehbarer 3D-Modus öffnen – mit Schritt-Fokus, Unteransicht, Zoom und Materialübersicht.
- **Privatsphäre**: Bilddateien werden **nur lokal in IndexedDB** des jeweiligen Geräts gespeichert und nicht auf einen Server hochgeladen. Beim Löschen von Browserdaten können sie verloren gehen.
- **Grenze zwischen Bild und 3D**: Screenshots erlauben allein keine verlässliche Rekonstruktion der Blockkoordinaten. 3D ist deshalb nur für Bauwerke mit Bauplandatei verfügbar. Vollautomatische KI-Blockerkennung und serverseitige Admin-Veröffentlichung sind separate, noch nicht implementierte Entwicklungsaufgaben.
- **Originaltexturen**: Minecraft-Java-Texturen werden weiterhin ausschließlich aus der eigenen, lokal ausgewählten Java-Client-Datei geladen. Es werden keine Mojang-Assets verteilt.

CraftSteps ist eigenständig gestaltet und verwendet keinen Quellcode, keine Inhalte und keine Grafiken von WBuilds. Die öffentlichen WBuilds-Funktionsbeschreibungen dienen lediglich als Inspiration für ähnliche Abläufe.


## V0.7 – animierte Schrittfolge und App-Navigation

Die App hat jetzt eine **eigene** mobile Navigation (Entdecken, Erstellen, Favoriten und Optionen), damit die Bauwerksgalerie, die Materialansicht und die Erstellung besser zusammenarbeiten. Die Anleitung unterstützt jetzt den **animierten Wechsel zum nächsten Bauschritt**: Neue Blockgeometrie blendet ein und bewegt sich auf ihre reale Position; die Kamera wechselt weich zum neuen Baufokus. Die exakten roten Platzierungskonturen bleiben auf den gespeicherten Weltkoordinaten.

Im separaten großen 3D-Modus sind Schritt-Zeitleiste, Animationswiedergabe, Animation ein/aus, Zoom, Gesamtansicht, Fokussierung, Unterseitenansicht und Materialübersicht verfügbar. Die Animation respektiert die Browseroption „Bewegungen reduzieren“. Die Navigation und Animationen wurden vollständig eigenständig für CraftSteps programmiert.

**Wichtige Grenzen:** WBuilds ist ein eigenständiges Produkt; CraftSteps übernimmt weder dessen Marke, Grafiken, Screenshots noch fremden Programmcode. Die Umsetzung ist keine exakte Kopie aller WBuilds-Inhalte oder Abonnements. Die 3D-Ansicht ist weiterhin eine Canvas-Projektion, keine vollständige Minecraft-Engine. Exakte Minecraft-Texturen sind nur mit einer vom Nutzer lokal ausgewählten Java-Client-Datei möglich; ohne sie erscheinen neutrale Platzhalter. Eine tatsächlich KI-gestützte, pixelgenaue Blockerkennung aus Screenshots ist nicht enthalten.
