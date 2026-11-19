import {useFrame} from "@react-three/fiber";
import type {Shooter} from "@gunsmith/engine/bullet/types/Shooter";
import {equippedWeapon} from "@gunsmith/engine/loadout/EquippedWeapon";
import {SPRITE_MANIFEST} from "@src/assets/sprites/SpriteManifest";
import type {SpriteKey} from "@src/assets/sprites/types/SpriteKey";
import {WeaponDrawingPlane} from "@src/react/components/three/arena-canvas/components/arena-scene/components/weapon-drawing-plane/WeaponDrawingPlane";
import {useWeaponDrawing} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-weapon-drawing/UseWeaponDrawing";
import {useGameStore} from "@src/store/game/UseGameStore";
import {useSprite} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-sprite/UseSprite";
import {gameState} from "@src/store/game/selectors/game-state/GameState";
import type {JSX} from "react";
import {useRef} from "react";
import type {Group} from "three";

interface Props {
  fighter: Shooter;
  standingSprite: SpriteKey;
  crouchedSprite?: SpriteKey;
}

// The standing composition puts the grip 2.8 design pixels ahead of the body centre.
// The crouched hand is 3 pixels further back. The barrel stays on the aim axis.
const STANDING_GRIP = 2.8;
const CROUCH_SHIFT = 3;
const BELOW_BODY = -0.02;

export function HeldWeapon({fighter, standingSprite, crouchedSprite}: Props): JSX.Element {
  const gripRef = useRef<Group>(null);
  const standing = useSprite(standingSprite);
  const crouched = useSprite(crouchedSprite ?? standingSprite);
  const weaponKey = useGameStore(state => {
    const holder = state.world[fighter];
    if (!holder) {
      return undefined;
    }

    return equippedWeapon(holder).weapon.identity?.key;
  });
  const drawing = useWeaponDrawing(weaponKey);
  const {pixelsPerTile} = SPRITE_MANIFEST[standingSprite];

  useFrame(() => {
    const grip = gripRef.current;
    if (!grip) {
      return;
    }

    const holder = gameState()[fighter];
    if (!holder) {
      grip.visible = false;
      return;
    }

    if (holder.crouching && crouchedSprite) {
      grip.visible = crouched !== undefined;
      grip.position.x = (STANDING_GRIP - CROUCH_SHIFT) / pixelsPerTile;
      return;
    }

    grip.visible = standing !== undefined;
    grip.position.x = STANDING_GRIP / pixelsPerTile;
  });

  return (
    <group ref={gripRef} position={[0, 0, BELOW_BODY]} visible={false}>
      {drawing && <WeaponDrawingPlane drawing={drawing} held />}
    </group>
  );
}
