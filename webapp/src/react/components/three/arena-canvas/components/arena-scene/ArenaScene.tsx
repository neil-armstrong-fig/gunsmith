import {useFrame, useThree} from "@react-three/fiber";
import {zoomToFit} from "@src/react/components/three/arena-canvas/components/arena-scene/camera/ZoomToFit";
import {DamageBrackets} from "@src/react/components/three/arena-canvas/components/arena-scene/components/damage-brackets/DamageBrackets";
import {RingHighlight} from "@src/react/components/three/arena-canvas/components/arena-scene/components/ring-highlight/RingHighlight";
import {Pickup} from "@src/react/components/three/arena-canvas/components/arena-scene/components/pickup/Pickup";
import {Dummies} from "@src/react/components/three/arena-canvas/components/arena-scene/components/dummies/Dummies";
import {Bullets} from "@src/react/components/three/arena-canvas/components/arena-scene/components/bullets/Bullets";
import {ArenaHeights} from "@src/react/components/three/arena-canvas/components/arena-scene/components/arena-heights/ArenaHeights";
import {ArenaWalls} from "@src/react/components/three/arena-canvas/components/arena-scene/components/arena-walls/ArenaWalls";
import {VisionOverlay} from "@src/react/components/three/arena-canvas/components/arena-scene/components/vision-overlay/VisionOverlay";
import {RingEdge} from "@src/react/components/three/arena-canvas/components/arena-scene/components/ring-edge/RingEdge";
import {Opponent} from "@src/react/components/three/arena-canvas/components/arena-scene/components/opponent/Opponent";
import {Player} from "@src/react/components/three/arena-canvas/components/arena-scene/components/player/Player";
import {useGameLoop} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/UseGameLoop";
import {gameState} from "@src/store/game/selectors/game-state/GameState";
import {useGameStore} from "@src/store/game/UseGameStore";
import type {JSX} from "react";

/** Everything drawn in the arena: the camera fitted to the window, the walls with the dim veil over what the player does not see, the closing ring over it, the dummies, the weapon lying in the arena, the bullets, the opponent and the player (drawn from art's pictures once they have loaded), with the brackets of a hit and the red highlight of the ring over the player. */
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

      <ArenaHeights arena={arena} />

      <VisionOverlay />

      <RingEdge arena={arena} />

      <Dummies />

      <Pickup />

      <Bullets />

      <Opponent />

      <Player />

      <DamageBrackets />

      <RingHighlight />
    </>
  );
}
