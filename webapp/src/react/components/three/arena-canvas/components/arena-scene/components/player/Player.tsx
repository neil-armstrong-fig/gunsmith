import {useFrame} from "@react-three/fiber";
import {FighterPlaceholder} from "@src/react/components/three/arena-canvas/components/arena-scene/components/fighter-placeholder/FighterPlaceholder";
import {HeldWeapon} from "@src/react/components/three/arena-canvas/components/arena-scene/components/held-weapon/HeldWeapon";
import {SpritePlane} from "@src/react/components/three/arena-canvas/components/arena-scene/components/sprite-plane/SpritePlane";
import {useSprite} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-sprite/UseSprite";
import {gameState} from "@src/store/game/selectors/game-state/GameState";
import type {JSX} from "react";
import {useRef} from "react";
import type {Group, Mesh} from "three";

/**
 * The player, drawn from art's pictures: a neutral body with a blue stripe, standing or crouched, turned the way they aim about the centre of the body. The picture
 * shrinks when they crouch and the circle walls stop does not, so what is drawn never decides what is hit. A placeholder disc shows until the pictures have loaded.
 */
export function Player(): JSX.Element {
  const playerRef = useRef<Group>(null);
  const standingRef = useRef<Mesh>(null);
  const crouchedRef = useRef<Mesh>(null);
  const standingPicture = useSprite("sprite-player-stand-blue");

  useFrame(() => {
    if (!playerRef.current) {
      return;
    }

    const {position, aim, crouching} = gameState().player;
    playerRef.current.position.set(position.x, position.y, 1);
    playerRef.current.rotation.z = Math.atan2(aim.y, aim.x);

    if (standingRef.current) {
      standingRef.current.visible = !crouching;
    }

    if (crouchedRef.current) {
      crouchedRef.current.visible = crouching;
    }
  });

  return (
    <group ref={playerRef} name="player" data-testid="player">
      {!standingPicture && <FighterPlaceholder colour="#62b5ff" />}

      <HeldWeapon
        fighter="player"
        standingSprite="sprite-player-stand-blue"
        crouchedSprite="sprite-player-crouch-blue"
      />

      <SpritePlane spriteKey="sprite-player-stand-blue" ref={standingRef} />

      <SpritePlane spriteKey="sprite-player-crouch-blue" ref={crouchedRef} visible={false} />
    </group>
  );
}
