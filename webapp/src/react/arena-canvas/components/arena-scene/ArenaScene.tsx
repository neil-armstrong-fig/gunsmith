import {useFrame, useThree} from "@react-three/fiber";
import {PRACTICE_ARENA} from "@src/react/arena-canvas/components/arena-scene/practice/PracticeArena";
import {PRACTICE_DUMMIES} from "@src/react/arena-canvas/components/arena-scene/practice/PracticeDummies";
import {zoomToFit} from "@src/react/arena-canvas/components/arena-scene/camera/ZoomToFit";
import {Dummies} from "@src/react/arena-canvas/components/arena-scene/components/dummies/Dummies";
import {Bullets} from "@src/react/arena-canvas/components/arena-scene/components/bullets/Bullets";
import {ArenaWalls} from "@src/react/arena-canvas/components/arena-scene/components/arena-walls/ArenaWalls";
import {PlayerDisc} from "@src/react/arena-canvas/components/arena-scene/components/player-disc/PlayerDisc";
import {useGameLoop} from "@src/react/arena-canvas/components/arena-scene/hooks/use-game-loop/UseGameLoop";
import type {JSX} from "react";

/** Everything drawn in the arena: the camera fitted to the window, the walls, the dummies, the bullets and the player. */
export function ArenaScene(): JSX.Element {
  const worldRef = useGameLoop(PRACTICE_ARENA, PRACTICE_DUMMIES);
  const viewport = useThree(state => state.size);

  useFrame(({camera}) => {
    const zoom = zoomToFit(PRACTICE_ARENA, viewport);
    if (camera.zoom === zoom) {
      return;
    }

    camera.zoom = zoom;
    camera.position.set(PRACTICE_ARENA.width / 2, PRACTICE_ARENA.height / 2, 10);
    camera.updateProjectionMatrix();
  });

  return (
    <>
      <color attach="background" args={["#10151b"]} />

      <ArenaWalls arena={PRACTICE_ARENA} />

      <Dummies worldRef={worldRef} />

      <Bullets worldRef={worldRef} />

      <PlayerDisc worldRef={worldRef} />
    </>
  );
}
