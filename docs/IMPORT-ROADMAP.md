# Bauwerk-Import, Rohschritte und Administration — Stand V0.2

## Implementiert
- Lesen und Validieren von gzip-komprimiertem Sponge-Schematic `.schem` V2 (`Palette`, `BlockData`) und V3 (`Schematic.Blocks.Palette`, `Data`).
- Java-NBT-Datentypen 1–12, UTF-8, Längen- und Tiefenbegrenzung, VarInt-Decodierung, Positionen nach X+Z*Width+Y*Width*Length.
- Ignorieren von Luftblöcken, Warnung für Mod-IDs, Biome, BlockEntity-Inhalte und Entitäten.
- Erhaltung der Rohblockzustände `blockState`/`blockId` für eine spätere versionsbezogene Verarbeitung.
- Lokale Material-Rohübersicht; Rohschrittbildung per Y-Ebene, wählbare maximale Blöcke pro Schritt.
- Separates Studio, lokal gespeicherte Entwürfe via IndexedDB, Anzeige in der Galerie, Löschen von Entwürfen.
- Tests mit eigenen gültigen und absichtlich beschädigten NBT-Dateien (V2/V3, Gzip, VarInt, Limits, Sonderfälle).

## Absichtlich noch NICHT implementiert
- Unbeschränkte Importdateien oder besondere WorldEdit-/FAWE-Abweichungen.
- Bedrock/`.litematic` und ältere `.schematic`-Formate.
- Korrekte Minecraft-Item-Mengen bei allen Spezialblöcken (z.B. Türen, Betten, Doppel-Pflanzen, Slabs, Flüssigkeiten, Block-Entities, Saatgut/Items, versionsabhängige Item-IDs).
- Blockabhängigkeiten, Schwerkraft, Redstone-Mechanik, Erreichbarkeit oder vollautomatisch geprüfte Bauschritte.
- Gesicherte Cloud-Uploads, echte Authentifizierung, Rollen/RLS, Adminfreigabe, dauerhafte serverseitige Veröffentlichung.
- Medien-/Rechteprüfung, sichere Objekt-Uploads, Audit-Logs.

## Folgeschritte
1. Materialzustand-zu-Inventargegenstand-Registry mit Datenversionen und Tests; Redstone, Türen, Pflanzen, Wandblöcke.
2. Manuelle Kamera- und Schrittkorrektur (Baustufen überprüfen, Reihenfolge ändern).
3. Supabase oder vergleichbare Backendlösung: Authentifizierung mit autorisierter Adminrolle, RLS-Policies, serverseitige Upload-Freigabe.
4. Entwurf → Prüfung → Freigabe → Veröffentlichung, getrennte öffentliche Bibliothek.

## Qualität und Sicherheit
Der öffentliche GitHub-Pages-Code kann keine geheime Administrationsberechtigung sichern. Die lokale Studio-Oberfläche ist keine Zugangskontrolle. Bei Dateiimport gelten Ressourcenlimits. Unvollständige Daten werden nicht automatisch als geprüft ausgegeben. Vor Veröffentlichung großer, komplexer Bauwerke sind weitere Tests nötig.