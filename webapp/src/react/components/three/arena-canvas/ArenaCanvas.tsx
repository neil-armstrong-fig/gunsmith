import {Canvas} from "@react-three/fiber";
import {ArenaScene} from "@src/react/components/three/arena-canvas/components/arena-scene/ArenaScene";
import {useSpritesReady} from "@src/react/components/three/arena-canvas/hooks/use-sprites-ready/UseSpritesReady";
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
 */
export function ArenaCanvas(): JSX.Element {
  const [ready, setReady] = useState(false);
  const spritesReady = useSpritesReady();

  return (
    <div className="fixed inset-0" data-testid="arena" data-ready={ready} data-sprites-ready={spritesReady}>
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
