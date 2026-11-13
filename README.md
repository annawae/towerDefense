# Tower Defense (Telegram Mini App)

Ein grid-basiertes Tower Defense Spiel in Vanilla HTML/CSS/JavaScript,
optimiert fürs Hochformat und für Telegram Mini Apps.

## Spielen

Lokal: `index.html` im Browser öffnen.

Online (GitHub Pages): siehe die Pages-URL dieses Repos.

## Features

- Grid-basiertes Hochformat-Spielfeld, Pfad durch Turmplatzierung beeinflussbar
- Drei Turmtypen: Normal, Splash (Flächenschaden), Slow (Verlangsamung)
- Zehn Gegnerwellen mit steigender Schwierigkeit
- Gold- und Leben-System
- Animierte Orc- und Turm-Sprites
- Touch-Steuerung (Tippen = platzieren, langer Druck = verkaufen)
- Telegram Mini App Integration (Fullscreen, Theme, haptisches Feedback)

## Struktur

- `index.html` — Einstiegspunkt, Layout und Styling
- `js/` — Spiellogik (Grid, Pathfinding, Türme, Gegner, Wellen, UI, Telegram)
- `images/` — Hintergrund sowie Orc- und Turm-Sprites
