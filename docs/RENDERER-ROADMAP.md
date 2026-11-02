# CraftSteps 3D- und Import-Roadmap (Stand V0.4)

## Verlässlich umgesetzt

- Einlesen der tatsächlichen Minecraft-Java-Blocktexturen und Blockmodell-JSON-Daten aus einer vom Nutzer lokal ausgewählten Vanilla-Client-JAR; die Dateien werden nie über GitHub Pages bereitgestellt.
- Falls keine originale Minecraft-Datei geladen wurde oder ein Block nicht auflösbar ist, erscheinen graue Platzhalter und keine stilistisch nachgeahmten Texturen.
- Projektionsbasierte 3D-Darstellung der Blockpositionen mit Rotation, Neigung und Zoom.
- Exakte 1×1×1-Weltkoordinaten für die roten Blockumrandungen. Die Linie markiert die *Platzierungszelle* und nicht die sichtbaren Grenzen der Treppen-/Fence-Teilmeshes.
- Zustandsgesteuerte Geometrien für vereinfachte Treppen, Slabs, Türen, Falltüren, Zäune, Glasscheiben und weitere Elemente. Abweichungen vom Vanilla-Minecraft-Modell sind möglich.
- Import von Sponge-V2/V3-Schematics, Litematica-Regionen mit negativer Größe/Position, Legacy `.schematic` (Teilmenge bekannter numerischer IDs).
- Transparente Warnungen bei Legacy-IDs, BlockEntities, Mods, limitierter Step-Reihenfolge und Performance-Limits.
- Lokale Entwürfe und Vorschau im Browser, ohne Server.

## Noch nicht umgesetzt

1. **Vollständige Vanilla-Modell-/Blockstate-Pipeline**: Blockstate-Varianten, Multipart, JSON-Modellvererbung, PNG-Texturen und erste Rotationen werden bereits aus der lokalen Client-JAR gelesen. Noch fehlen die vollständige UV-/Richtungsbehandlung, Biomeinfärbungen, Animation, Element-Rescale, viele Sondermodelle, Render-Layer, BlockEntities und versionsgebundene Datenbank.
2. **Asset-Weiterentwicklung**: der lokale, browserseitige Import der eigenen Java-Clientdatei ist umgesetzt. Ein zuverlässiger Resource-Pack-Overlay-Import (nur Assets, keine kompletten Spiel-Dateien) und korrekte Versionserkennung sind noch offen. Keine Weiterverteilung geschützter Minecraft-Dateien.
3. **Produktionsrenderer für große Builds**: WebGL-Instancing, Chunking, Frustum- und Face-Culling und schnellerer Picking-Code. Die aktuelle Canvas-Engine begrenzt die Anzahl gleichzeitig gerenderter Blöcke.
4. **Verlässliche Auto-Schrittplanung**: Platzierungs- und Schwerkraftregeln, Türen/Betten/Gewächse als ein Inventarobjekt, Redstone und zusammenhängende Bauteile. Zwischenstand V0.4 sind nur Rohschritte nach Höhe.
5. **Alle Formate**: Vanilla-Struktur-`.nbt`, Bedrock `.mcstructure` und vollständige Legacy-Datenvarianten. Nutzer müssen Fehlermeldungen sehen, kein stummes Fallback.
6. **Online-Adminbereich**: Backend, Authentifizierung, serverseitige Berechtigungen, Upload-Limits und moderierter Veröffentlichungsprozess. Auf GitHub Pages allein nicht möglich.

## Sicherheits- und Qualitätsanforderungen

- Kein direktes HTML aus Datei-Metadaten oder Blocknamen erzeugen, ohne zu escapen.
- Begrenzung auf 5 MiB komprimiert / 14 MiB entpackt / 24.000 Zellen / 10.000 Blöcke. Eingabevalidierung für alle NBT-Typen, Array-Längen und Palettenindizes.
- Die Galerie übernimmt nur validierte lokale Entwürfe. V0.4 führt keine Cloud-Aktionen aus.
- Tests für Datenformate und Übergänge an 64-Bit-Grenzen, negative Regionen, nicht zugeordnete Legacy-IDs, Materialregel-Sonderfälle und geometrische Zustände ausbauen.
- Rendering und UI auch auf Android-Mobilgeräten mit realistischen Bauplan-Dateien testen. Browser-Smoke-Tests sind kein Ersatz für ein vollständiges mobiles Gerätelabor.
- Manuelle Prüfung, ob Materialliste und Step-Reihenfolge den ursprünglichen Bauplan exakt und baubar abbilden.

## Herkunft der technischen Ideen

- Sponge Schematic Specification: https://github.com/SpongePowered/Schematic-Specification
- Litemapy file format documentation: https://litemapy.readthedocs.io/en/latest/litematics.html
- Minecraft Usage Guidelines: https://www.minecraft.net/de-de/usage-guidelines
- Modell-/Blockstate-Roadmap nach öffentlich dokumentierter Community-Technologie, keine Kopie der WBuilds-App.
