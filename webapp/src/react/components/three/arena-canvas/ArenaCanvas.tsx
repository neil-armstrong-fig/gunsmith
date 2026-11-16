import {Canvas} from "@react-three/fiber";
import {ArenaScene} from "@src/react/components/three/arena-canvas/components/arena-scene/ArenaScene";
import {aimReticleCursor} from "@src/react/components/three/arena-canvas/reticle/AimReticleCursor";
import type {JSX} from "react";
import {useState} from "react";

/**
 * A top-down view: an orthographic camera looking straight down at the arena floor, filling the whole window.
 *
 * `data-ready` is the acceptance specs' one way to know the canvas has been sized and drawn into: the canvas is not in
 * the DOM as anything a test can read, and it keeps the browser's 300 by 150 until react-three-fiber measures it.
 *
 * It also sets the mouse cursor, the aim reticle. Here and not on `body`: the round banner is a sibling over the arena, and
 * only a cursor set above it would reach it. The HUDs let the mouse through, so the reticle shows over them too.
 */
export function ArenaCanvas(): JSX.Element {
  const [ready, setReady] = useState(false);

  return (
    <div className="fixed inset-0" style={{cursor: aimReticleCursor}} data-testid="arena" data-ready={ready}>
      <Canvas
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
