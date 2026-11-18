import {useFrame} from "@react-three/fiber";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {closingProgress} from "@gunsmith/engine/ring/ClosingProgress";
import {radiusOfRing} from "@gunsmith/engine/ring/RadiusOfRing";
import ringEdgeFragmentShader from "@src/react/components/three/arena-canvas/components/arena-scene/components/ring-edge/shaders/RingEdgeFragment.glsl?raw";
import ringEdgeVertexShader from "@src/react/components/three/arena-canvas/components/arena-scene/components/ring-edge/shaders/RingEdgeVertex.glsl?raw";
import {gameState} from "@src/store/game/selectors/game-state/GameState";
import type {JSX} from "react";
import {useMemo, useRef} from "react";
import type {IUniform, Mesh, ShaderMaterial} from "three";
import {Vector2} from "three";

interface Props {
  arena: Arena;
}

/**
 * The closing ring: a bright edge over the dim veil, with a faint red tint on the ground outside it that hurts. One plane the size of
 * the arena, drawn by a small shader from the ring's centre and radius, which `useFrame` writes each frame from the engine's own
 * `radiusOfRing` (the same circle `step` hurts fighters by), so no per-frame value goes through React state. It shows nothing when the
 * world has no ring, and nothing until the ring has started to close: while it only covers the arena it reaches exactly to the corner
 * farthest from its centre, where its edge would show as a wedge. The canvas is not in the DOM, so `DrawingTheClosingRing` checks the
 * look by screenshot against the same centre and radius the state hook reports.
 */
export function RingEdge({arena}: Props): JSX.Element {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(() => ({uCentre: {value: new Vector2()}, uRadius: {value: 0}}), []);

  useFrame(() => {
    if (!meshRef.current || !materialRef.current) {
      return;
    }

    const {ring} = gameState();
    // Nothing is drawn until the ring's timer has run out and it starts to move: before that it only covers the arena, reaching to the farthest corner
    // from its centre, where its edge would show as a wedge.
    meshRef.current.visible = ring !== undefined && closingProgress(ring) > 0;
    if (!ring) {
      return;
    }

    // Written through the material the renderer holds, which is what it uploads, whatever it did with the object handed to it.
    const centre: IUniform<Vector2> | undefined = materialRef.current.uniforms["uCentre"];
    const radius: IUniform<number> | undefined = materialRef.current.uniforms["uRadius"];
    centre?.value.set(ring.centre.x, ring.centre.y);
    if (radius) {
      radius.value = radiusOfRing(ring);
    }
  });

  return (
    <mesh ref={meshRef} position={[arena.width / 2, arena.height / 2, 0.95]} name="ring-edge" visible={false}>
      <planeGeometry args={[arena.width, arena.height]} />

      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={ringEdgeVertexShader}
        fragmentShader={ringEdgeFragmentShader}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}
