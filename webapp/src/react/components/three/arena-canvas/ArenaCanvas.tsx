import {scenarioOfPage} from "@src/game/scenario/ScenarioOfPage";
import {Canvas} from "@react-three/fiber";
import {ArenaScene} from "@src/react/components/three/arena-canvas/components/arena-scene/ArenaScene";
import {useSpritesReady} from "@src/react/sprites/hooks/use-sprites-ready/UseSpritesReady";
import {aimReticleCursor} from "@src/react/components/three/arena-canvas/reticle/AimReticleCursor";
import {useAppStore} from "@src/store/app/UseAppStore";
import type {Frameloop} from "@src/react/components/three/arena-canvas/types/Frameloop";
import type {JSX} from "react";
import {useState} from "react";

/**
 * A top-down view: an orthographic camera looking straight down at the arena floor, filling the whole window.
 *
 * `data-ready` is the acceptance specs' one way to know the canvas has been sized and drawn into: the canvas is not in
 * the DOM as anything a test can read, and it keeps the browser's 300 by 150 until react-three-fiber measures it.
 *
 * `data-sprites-ready` is the same kind of hook for art's pictures: they decode after the page opens and a placeholder shows until they have, so a spec
 * that reads the screen waits for it (this component also starts the loading).
 *
 * `data-frameloop` says whether it is being drawn every frame (`always`) or held (`demand`).
 *
 * It also sets the mouse cursor, the aim reticle. Here and not on `body`: the round banner is a sibling over the arena, and
 * only a cursor set above it would reach it. The HUDs let the mouse through, so the reticle shows over them too.
 *
 * While the workshop is open the game waits, so the arena is not drawn again until it shuts: it stays as the last frame under the panel. A browser with
 * no graphics card (the CI runner) draws every frame on the same thread that handles the keys typed into the panel, and key-by-key typing there
 * took about a quarter of a second a key.
 */
export function ArenaCanvas(): JSX.Element {
  const [ready, setReady] = useState(false);
  const spritesReady = useSpritesReady();
  const workshopOpen = useAppStore(state => state.workshopOpen);
  const menuOpen = useAppStore(state => state.menuView !== undefined);
  const paused = workshopOpen || (menuOpen && scenarioOfPage() !== "room");
  const frameloop = frameloopOf(paused);

  return (
    <div
      className="fixed inset-0"
      style={{cursor: aimReticleCursor}}
      data-testid="arena"
      data-ready={ready}
      data-sprites-ready={spritesReady}
      data-frameloop={frameloop}
    >
      <Canvas
        frameloop={frameloop}
        orthographic
        camera={{zoom: 1, position: [0, 0, 10]}}
        onCreated={() => {
          setReady(true);
        }}
      >
        <ArenaScene />
      </Canvas>
    </div>
  );
}

function frameloopOf(paused: boolean): Frameloop {
  if (paused) {
    return "demand";
  }

  return "always";
}
