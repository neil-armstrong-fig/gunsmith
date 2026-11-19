import {useFrame} from "@react-three/fiber";
import {visibleToPlayer} from "@gunsmith/engine/vision/VisibleToPlayer";
import {useGameStore} from "@src/store/game/UseGameStore";
import {gameState} from "@src/store/game/selectors/game-state/GameState";
import {PickupDisc} from "@src/react/components/three/arena-canvas/components/arena-scene/components/pickup/components/pickup-disc/PickupDisc";
import {WeaponDrawingPlane} from "@src/react/components/three/arena-canvas/components/arena-scene/components/weapon-drawing-plane/WeaponDrawingPlane";
import {useWeaponDrawing} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-weapon-drawing/UseWeaponDrawing";
import {SpritePlane} from "@src/react/components/three/arena-canvas/components/arena-scene/components/sprite-plane/SpritePlane";
import type {JSX} from "react";
import {useRef} from "react";
import type {Group} from "three";

// Lift the marker above the weapon plane so even drawings that fill their corners leave the outline visible.
const MARKER_HEIGHT_ABOVE_PICKUP = 0.01;

/** The weapon lying in the arena, where the simulation says it is, drawn as its drawing (the placeholder disc when it has none) and only while the player sees it. */
export function Pickup(): JSX.Element {
  const groupRef = useRef<Group>(null);
  const weaponKey = useGameStore(state => state.world.pickup?.weapon.identity?.key);
  const drawing = useWeaponDrawing(weaponKey);

  useFrame(() => {
    if (!groupRef.current) {
      return;
    }

    const world = gameState();
    const {pickup} = world;
    groupRef.current.visible = pickup !== undefined && visibleToPlayer(world).pickup;
    if (pickup) {
      groupRef.current.position.set(pickup.position.x, pickup.position.y, 0.7);
    }
  });

  return (
    <group ref={groupRef} visible={false}>
      {!drawing && <PickupDisc />}

      {drawing && <WeaponDrawingPlane drawing={drawing} />}

      <group position={[0, 0, MARKER_HEIGHT_ABOVE_PICKUP]}>
        <SpritePlane spriteKey="sprite-pickup-marker" />
      </group>
    </group>
  );
}
