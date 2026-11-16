import {useFrame} from "@react-three/fiber";
import {visibleToPlayer} from "@gunsmith/engine/vision/VisibleToPlayer";
import {FighterPlaceholder} from "@src/react/components/three/arena-canvas/components/arena-scene/components/fighter-placeholder/FighterPlaceholder";
import {SpritePlane} from "@src/react/components/three/arena-canvas/components/arena-scene/components/sprite-plane/SpritePlane";
import {useSprite} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-sprite/UseSprite";
import {gameState} from "@src/store/game/selectors/game-state/GameState";
import type {JSX} from "react";
import {useRef} from "react";
import type {Group} from "three";

/**
 * The opponent, drawn from art's pictures as the player is: the same neutral body with the other team's mark (two orange stripes), turned the way it faces about the
 * centre of the body. It never crouches, so it has one picture. Hidden when the match has none, and while the player does not see it: the whole group is, so
 * nothing of it is drawn where the cone does not reach. A placeholder disc shows until the picture has loaded.
 */
export function Opponent(): JSX.Element {
  const opponentRef = useRef<Group>(null);
  const picture = useSprite("sprite-player-stand-orange");

  useFrame(() => {
    if (!opponentRef.current) {
      return;
    }

    const world = gameState();
    const {opponent} = world;
    opponentRef.current.visible = opponent !== undefined && visibleToPlayer(world).opponent;

    if (!opponent) {
      return;
    }

    opponentRef.current.position.set(opponent.position.x, opponent.position.y, 1);
    opponentRef.current.rotation.z = Math.atan2(opponent.aim.y, opponent.aim.x);
  });

  return (
    <group ref={opponentRef} name="opponent" visible={false}>
      {!picture && <FighterPlaceholder colour="#ff9b54" />}

      <SpritePlane spriteKey="sprite-player-stand-orange" />
    </group>
  );
}
