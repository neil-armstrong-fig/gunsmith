import {useFrame, useThree} from "@react-three/fiber";
import {zoomToFit} from "@src/react/components/three/arena-canvas/components/arena-scene/camera/ZoomToFit";
import {Dummies} from "@src/react/components/three/arena-canvas/components/arena-scene/components/dummies/Dummies";
import {Bullets} from "@src/react/components/three/arena-canvas/components/arena-scene/components/bullets/Bullets";
import {ArenaWalls} from "@src/react/components/three/arena-canvas/components/arena-scene/components/arena-walls/ArenaWalls";
import {Opponent} from "@src/react/components/three/arena-canvas/components/arena-scene/components/opponent/Opponent";
import {PlayerDisc} from "@src/react/components/three/arena-canvas/components/arena-scene/components/player-disc/PlayerDisc";
import {useGameLoop} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/UseGameLoop";
import {gameState} from "@src/store/game/selectors/game-state/GameState";
import {useGameStore} from "@src/store/game/UseGameStore";
import type {JSX} from "react";

/** Everything drawn in the arena: the camera fitted to the window, the walls, the dummies, the bullets, the opponent and the player. */
export function ArenaScene(): JSX.Element {
  useGameLoop();

  // The arena never changes during a match, so this component renders once, not once per frame.
  const arena = useGameStore(state => state.world.arena);
  const viewport = useThree(state => state.size);

  useFrame(({camera}) => {
    const {arena: current} = gameState();
    const zoom = zoomToFit(current, viewport);
    if (camera.zoom === zoom) {
      return;
    }

    camera.zoom = zoom;
    camera.position.set(current.width / 2, current.height / 2, 10);
    camera.updateProjectionMatrix();
  });

  return (
    <>
      <color attach="background" args={["#10151b"]} />

      <ArenaWalls arena={arena} />

      <Dummies />

      <Bullets />

      <Opponent />

      <PlayerDisc />
    </>
  );
}
