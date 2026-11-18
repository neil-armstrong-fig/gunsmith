# AGENTS.md: webapp

The React app: Vite, React 19, Tailwind v4, react-three-fiber. The game is the whole window; menus will appear over it
only when needed. Root coding standards and the package layering below apply.

## Layout

```
src/
  Main.tsx, index.css        the entry and the palette tokens
  react/                     top layer: everything drawn, and the logic only one component uses, beneath that component
  store/                     middle layer: Zustand stores; may import game/ and the engine, never react/
    game/                    the game store: the engine's `World` and nothing else
    app/                     the app store: choices about the game around the match (`muted`, `reducedMotion`, `shakePixels`; online, the ask for the next round, whether the other player is being waited for and whether the connection is being made again)
    feedback/                the feedback store: the cues of the fight (`bulletHits`, `ringHurting`, `hitMarks`), written by the loop after every step
  sound/                     what the fight sounds like: plain logic and the browser's audio; used by react/, never imports react/ or a store
  assets/sounds/             the sound files (`files/<key>.mp3`), their keys and addresses
  game/                      bottom layer: plain data and logic (the arenas and which match to open), no React, no store
```

An import may only point down: `react/` → `store/` → `game/`. ESLint enforces it (`eslint.config.js`): `game/` may not
import the store, React, the renderer or Zustand; `store/` may not import `react/`. A piece of logic only one component
uses still sits beneath that component, not in `game/`; `game/` is for data shared by several layers.

## State: Zustand, one library, a store per domain

Zustand is the only state library. A store is a folder under `store/` named for its subject (`store/game/`), laid out
like a Redux slice: **the store itself at the top** (`UseGameStore.ts` exports `useGameStore`, with its test beside it and
its state type in `types/`), and everything that reads from it in sub-folders, each with its own `types/`:

```
store/game/
  UseGameStore.ts, UseGameStore.test.ts
  types/GameStore.ts
  selectors/                   reads, each in a folder of its own
    select-ammo-readout/       a reactive selector for components
      SelectAmmoReadout.ts, SelectAmmoReadout.test.ts
      types/AmmoReadout.ts
    select-player-health/      the player's health, a plain number
    select-round/              where the round stands, a plain string
    select-match/              the best-of-three the world belongs to (the same object until a round is scored), or nothing
    select-seconds-until-ring/ whole seconds (rounded up) before the ring starts, or nothing when the world has no ring; changes once a second
    game-state/                `gameState()`, the one-off read for `useFrame`
      GameState.ts
```

Redux terms: `useGameStore` is the store (and `getState()` / `setState` live on it), `setWorld` is the one action, `GameStore`
is `RootState` plus the actions, and a selector is `(state) => derived value`, as in Redux. `gameState()` is the imperative
read, `store.getState().world`, that does not subscribe. New kinds of thing get a sub-folder named for what they are
(`selectors/` today), never files loose beside the store. The shape follows large Zustand codebases (Lobe Chat keeps a
folder per domain with the store, its initial state and its selectors) and the Redux style guide's feature folders alike:
group by subject, not by file type. Add a `slices/` folder inside a store only when that store has several slices.
Middleware, if any, goes on the composed store, never on a slice.

**The game store holds what the engine's `World` holds, and nothing else.** Its state is `{world, setWorld}`.

- A value worked out from the world (ammunition, health shown on screen) is a **selector**, never stored state.
- Menus, lobby, library, credits and meta state do **not** go here: they go in an app store (`store/app/`), built when a
  screen needs it, with the same conventions. Two stores because a Zustand `set` runs every mounted selector of its
  store: a world written 60 times a second must not share a store with the whole UI.
- It is enforced, not only written: lint lets `store/game/` import only `zustand`, the engine, `@src/game/**` and its own
  folder, and `UseGameStore.test.ts` pins the store's exact keys, so adding state is a deliberate edit.

**Reading it.** The loop writes the world once per frame (`setWorld`), and only when a step ran. `useFrame` and the loop
read it with `gameState()`, which does not subscribe and causes no render. A React component reads slow values with a
selector and `useShallow`: `useGameStore(useShallow(selectAmmoReadout))` re-renders only when the readout changes, which
is a few times a second at most. A per-frame value is never bound to a component (react-three-fiber's own guidance: state
managers are fine for updates that are not rapid). The decision and its sources are in `docs/state-management.md`.

## Runtime boundaries

- `online/` (`?room=<code>`) is this browser's end of an online match; the server plays it, `OnlineMatch` makes it feel like the local game. The own fighter is predicted (each fixed step the input is sent when it changes, plus a heartbeat, and played at once with the engine; each snapshot says how far the server has played them, `ack`, and the rest are played again on top of its word, a small disagreement eased out over a fifth of a second and one over a tile put right at once), the other fighter is drawn about 100 ms behind the newest snapshot on a render clock that holds when snapshots are late (`interpolation/`), and the game store still holds only a `World` (`worldToShow`). Shots are not predicted. The server scores the best of three: "Next round" and "Play again" in a room only ask (`round-banner/go-on/GoOn` puts an ask in the app store, the loop sends `{kind: "ready"}` through `OnlineMatch.readyForNextRound`, and the banner says "Waiting for the other player" while the server's `ready` flag for this seat is set); the next round begins when both have asked. **Reconnecting:** the socket is a `ReconnectingSocket` (`online/socket/reconnecting/`), which opens another connection after a loss (waiting 250 ms, doubling to 4 s) and gives up on close codes 4409 (room full) and 4410 (seat taken over by another page). The seat's token from `joined` is kept by `SeatTokenKeeper` in the tab's **session** storage (a reload gets the seat back, a new tab does not) and shown on each connection. Each `joined` (the server sends one per connection) restarts the browser's input count from zero and the ask in force is sent again; **nothing is sent on a connection until its `joined` has arrived** (an input numbered from the old count, sent in that gap, made the server drop every later one). While the connection is being made again the app store's `reconnecting` is set from `OnlineMatch.isReconnecting()` and `connection-notice/` says so. `?lag=<ms>` holds every frame up that long each way, to feel it on localhost. The online branch of `UseGameLoop` and `online/` are server's; play keeps the local path.
- `game/scenario/` chooses seeded setup once from the query. Query parameters configure a scenario, never write live state. Preserve the match score and setup when starting another round.
- Render the engine's visibility result; do not invent a second sight/height rule in React. Keep terrain dim outside the cone while suppressing hidden entities and their effects.
- HUD animation on a timer uses CSS; per-frame geometry and uniforms use `useFrame`. Update shader uniforms through `materialRef.current.uniforms`, not the object originally passed to JSX.
- Store GLSL in `.glsl` files, imported with `?raw`, and compile it with `glslangValidator` in tests. A valid shader still needs a browser drawing assertion where feasible.
- The reticle cursor belongs on the arena only. HUD pointer pass-through must not create aim dead zones; buttons and overlays retain normal interaction. A button click must not fire a weapon. Native/Retina cursor appearance requires manual inspection.
- `sound/` imports no React or store. Consume the engine's local combat events after every simulation tick, because the game store retains only the last world. Muting belongs in the app store.
- Drop sounds while the audio context is suspended; never queue them for later playback. Preserve the once-per-hold empty-click latch. `sound/damage-crunch/DamageCrunch` makes one crunch (`sfx-damage-crunch`) per burst of bullets (hits within `BURST_SECONDS`, 100 ms of game time, are merged; the window is not stretched). The ring never crunches: it hurts every step, so it wants a continuous loop (`sfx-ring-damage-loop`, delivered by art as a study in `audio/studies/ring-damage/` but not yet registered or played, so the ring is silent until play integrates it). The hit that ends a round still crunches; nothing after it does. The loop passes each step's `seconds` so `sound/` reads no clock.
- **Damage on the screen** follows art's study (`docs/art/concepts/combat-feedback/Handover.md`, "Clarifications"). The loop calls `use-game-loop/feedback/RecordFeedbackCues` after every step with `World.events` and the round, and `cues/CuesAfterTick` turns them into `store/feedback/`'s `{bulletHits, ringHurting}` (a step with a bullet hit is one more hit, even the one that ends the round; the ring hurts only in a step it did and only in a round being fought), written only when a cue changed. Three things read it, none through per-frame React state: `arena-scene/components/damage-brackets/` (a `[ ]` pair round the player for 180 ms, opening 8 study pixels; `flash/NextFlash` starts a flash on a new hit and merges hits inside `BURST_SECONDS`, 100 ms, into the running one), `ring-highlight/` (a thin coral circle round the player while the ring hurts; the user dropped the study's slashes and bottom band) and, on the health panel, a red border while the ring hurts. `health-hud/` also holds `HealthTrail`: an amber bar that follows health down in 350 ms **for bullets only** (a fall that comes with a new hit; the ring's loss and a rise at a round reset snap it). `ring-edge/` draws nothing until the ring has started to close (`closingProgress > 0`): its starting radius reaches exactly to the farthest corner, so its edge would show there as a wedge. Brackets and highlight sit above the player (`z` 1.2) and are always about the local player, so nothing of the opponent shows. The store's lint allow-list is zustand and its own folder.
- **Camera shake and reduced motion** (slice 4). `hooks/use-camera-shake/UseCameraShake` shakes the camera for 100 ms from a new `bulletHits` (never the ring; the same `arena-scene/flash/NextFlash` as the brackets, so a burst is one shake): art's curve, horizontal `sin(age × 180) × pixels × (1 − age / 0.1)` and vertical minus half of it (`shake-offset/ShakeOffset`), 12 screen pixels by default (the user's choice after trying 8 to 16; the study's 2 was too subtle), moved onto the camera by `camera-position/CameraPositionOf` and read back off the camera as applied by `ShakeOfCamera` into `data-camera-shake="x,y"` on the canvas, which is what acceptance reads. **Aiming never sees it**: `arenaPointAtPixel` stays on the still camera (the user's decision, 2026-11-17), so a hit cannot nudge the aim; the picture is up to 12 px off the cursor for 100 ms. It is a separate `useFrame` after the fit in `ArenaScene` (the fit returns early when the zoom is unchanged). `?shake=<pixels>` tunes it and `0` is off. Reduced motion (`?reducedMotion=1` or `prefers-reduced-motion`, read once at load by `game/motion/`, held in the app store) removes the shake, the brackets' opening and the health trail (the bar snaps). Cosmetic weapon recoil and the muzzle flash are not built: they need the held weapon drawing, which is not built yet (the user wants to work on it; it is not shelved).
- **Hit confirmation** (`sfx-hit` and four mint `#8AD4B0` ticks at a target's corners for 180 ms, art's study; no expansion). The engine's `hitLanded {on}` is positionless and already only for a target the player saw, so nothing here judges sight to decide _whether_: `sound/hit-confirmation/HitConfirmation` plays one `sfx-hit` per burst (`sound/burst-window/BurstWindow`, shared with the crunch; the 100 ms merge is a decision, the handover is silent on it). _Where_ is found by `use-game-loop/feedback/hit-places/HitPlacesOfStep` (the opponent where it stands, each dummy in sight that lost health, where it stood) and written as `hitMarks` (last 8, numbered) to the feedback store; `arena-scene/components/hit-ticks/HitTicks` takes each mark once in `useFrame` (`ticks/NextTicks` merges a place's marks inside the burst) and **draws a tick only while `canSeePoint` still holds for its place**, so turning away inside the 180 ms reveals nothing. Local play only; online rooms return before the loop's step path.
- MP3 is the user-approved production format. Keep WAV masters in `audio/`; emit runtime MP3s as separate assets with `?url&no-inline`. Safari audio was accepted as good enough by user decision on 2026-11-17; preserve recorded timing findings.

## Sprite rendering

SVG assets live in `public/assets/sprites/`; `assets/sprites/` owns keys, anchors and pixels-per-tile scaling. Preserve body-centre anchors and the same scale across stances. Rasterised textures render with `toneMapped={false}`. Missing/loading pictures use the existing placeholders; `data-sprites-ready` becomes true after every load succeeds or fails, and acceptance scenarios wait for it.

**Weapon drawings:** `arena-scene/hooks/use-weapon-drawing/` resolves one cached texture per weapon. `WeaponDrawingPlane` centres that texture at half scale on the ground or anchors it at the grip under the fighter's hand. The three built-in weapons use authored sprites. The existing `?weaponDrawing=lantern|refused` fixture supplies the sparring pickup's drawing, which follows the weapon into the loadout. The shared schema validates the fixture before the existing structural SVG rasteriser runs. Invalid appearance uses the code-owned stand-in. Production-generated weapons still need an appearance association supplied by the weapon contract.

**Arena terrain**: the three `tile-floor-l*` keys and `tile-wall` live in `public/assets/tiles/` and use the same manifest, loader and readiness signal. Each SVG covers one arena cell. `ArenaWalls` repeats low ground across its floor plane and draws the solid wall tiles. `ArenaHeights` draws the upper floors, matching stair bands to the floor palette, with the drop strips above. Pending or failed pictures use the flat materials. `?scenario=terrain` opens a playable three-level preview.

**Pickup marker**: `sprite-pickup-marker` uses the standard sprite loader and sits above the weapon in the same visibility-controlled group. The 88-design-pixel canvas is centred on the pickup and uses the same half scale as the weapon. When the file fails to load, the weapon or disc still draws.

**Shots** (`components/bullets/`): `Bullets` draws two instanced meshes (`shots/Shots.tsx`), the player's in art's blue (`fx-projectile-rifle-blue`) and the opponent's in orange (`fx-projectile-rifle-orange`, matching silhouette in `#FF9B54`, retained by user choice and art review on 2026-11-17). The manifest anchors a shot on its tip (49, 32), not the picture's centre, because a bullet is a point that hits when it touches something; `shots/placement/ShotPlacementOf` turns the offset with the bullet's `direction`. Fog is unchanged (`visibleToPlayer(world).bullets`). **The game loop's `useFrame` has priority −1** (`GAME_LOOP_PRIORITY`): at the default it ran after the drawing components and everything was drawn one fixed step (0.33 tile of a rifle bullet) behind the world. No muzzle flash until feature complete (the user, 2026-11-17).

## Folders inside `react/`

- **One folder per component**, named in kebab-case for its file: `arena-canvas/ArenaCanvas.tsx`. Its children go in its
  `components/` folder, each in a folder of its own, however deep. The tree reads like the screen.
- **`react/components/` splits into `dom/` and `three/`.** A top-level component is `components/dom/<name>/` when it
  renders DOM (HTML, styled with Tailwind) and `components/three/<name>/` when it renders react-three-fiber objects inside
  a `<Canvas>`, so the path says which world it lives in. `react/components/three/arena-canvas/` hosts the `<Canvas>`: it is
  `three/` even though it renders a `<div>`, because it goes straight into a canvas and holds nothing but the minimum DOM
  needed to set it up (the sized wrapper and its `data-ready` hook). Anything else DOM, such as the HUD, is its own `dom/`
  component beside it, never inside it.
- **Below a top-level component, children share its kind, so there is no further split.** Everything under `arena-canvas/`
  is three: `arena-canvas/components/arena-scene/components/bullets/`, flat. A DOM component's children are DOM. If a
  `three/` tree ever needed DOM, that is a new top-level `dom/` component, not a child. Hooks, pure helpers and types are
  not components: they keep the rules below, wherever they sit.
- **A hook sits beneath the thing that calls it**, in `hooks/<kebab-name>/`. `use-game-loop/` belongs to `arena-scene/`,
  and `use-wasd-movement/` beneath `use-game-loop/`, because that is its only caller. A hook two components share rises
  to their nearest common ancestor and no further.
- **Pure helpers go in a subfolder of their caller**, named for their subject (`keys/DirectionFromKeys.ts`), and **every
  type goes in the domain's `types/` folder** (`game/camera/types/Viewport.ts`). A component's own `Props` stays in its file.
  The game loop's own helpers show the shape: `use-game-loop/clock/FixedTicks.ts` is the entry,
  `clock/limits/MaxFrameSeconds.ts` is its helper, and `clock/TickSeconds.ts` stays at the `clock/` root because the hook
  uses it too.
- A component file exports the component and nothing else. A hook file exports the hook.

## Tests

Unit tests are `node`, not jsdom: reducers, clocks and pure functions. A component is covered by an acceptance spec
(`acceptance-tests/`), through the one read-only state hook (`shared/src/state-hook/`), never by a unit test.

The `terraced` scenario preserves its arena and seeded opponent across rounds. `?scenario=overlook` (`game/overlook/`) is the terraced arena the other way round: the opponent on the platform at (12.5, 3.5), the player idle on the low ground at (1.5, 3.5), eleven tiles apart; one round, no ring, no match. `?scenario=overwatch` (`game/overwatch/`) is a corridor one tile wide, forty-six long, with a stair at the east end of its low ground up to a platform: the opponent wanders at (30.5, 1.5) and the player stands on the platform at (40.5, 1.5), ten tiles away along the same row, out of the opponent's sight and inside the rifle's reach; one round, no ring, no match. `?scenario=pickup-race` (`game/pickup-race/`) is the duel's arena and fighters in one round with no ring or match, and the submachine gun lying at (17.5, 10.5): four tiles from the opponent, eight from the player. `?scenario=fair-duel` (`game/fair-duel/`) is art's fixture A, the same picture turned half way round, with the fighters at a matching pair of places drawn from the seed (`chooseStartingPlaces`), in one round with a ring and a lying weapon and no score (`nextRoundOfPage` rebuilds the duel, so it is not a match). The read-only snapshot includes opponent level for stair acceptance coverage.
