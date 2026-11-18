# How the game is being built

Gunsmith is built up from very basic parts, played early, and validated quickly, with the real thing replacing each rough part as it arrives. This is the idea behind the "fuzzy frontend" the project started with, kept and applied to the game itself rather than to a layer of screens around it. It is written down because it is the story the case study tells.

## What changed on 2026-11-12

The first attempt built a rough frontend ahead of the game: about fifteen menu screens, fakes for every service and a large layer of shared contracts. The user judged it "a bunch of menus", was worried by how much code sat in `shared/`, and had it deleted. The intent, to get something to look at and react to quickly, was right; the order was wrong, because none of it was the game.

Since then the order is: **the playable game first**, a full-screen arena that can be played and judged, then everything around it only when the game needs it. Each mechanic starts as an acceptance spec (ATDD), nothing goes in `shared/` until a second package uses it, and menus, contracts and services wait for a real consumer.

## What "rough first, validate quickly" looks like in the code

- **Placeholders that art replaces.** Fighters, shots, dummies and pickups were coloured shapes first; art's pictures now draw over them, and the shapes remain as the fallback while a picture loads or is missing (`data-sprites-ready` tells the specs which is on screen).
- **Query-string seams for tuning by playing.** `?ringDelay=`, `?scenario=` and `?shake=<pixels>` let the user change a value and look at once. The camera shake is the worked example: art's study value (2 pixels) could not be seen, the user tried 8 and 16 in the running game and chose 12 (2026-11-18).
- **A scripted opponent and practice dummies**, so mechanics can be tried alone before any online play exists.
- **Specs written first and watched fail**, so a rough part is still a checked part.

## For the case study

Worth measuring and recording as it lands: time from idea to something playable, the rough-to-real replacements (placeholder to art, fake AI adapter to real model, local match to online room), the values the user tuned by hand and what they chose, and what the first attempt cost against the second.
