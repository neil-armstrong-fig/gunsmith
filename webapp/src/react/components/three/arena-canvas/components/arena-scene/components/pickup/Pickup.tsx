import {useFrame} from "@react-three/fiber";
import {visibleToPlayer} from "@gunsmith/engine/vision/VisibleToPlayer";
import {gameState} from "@src/store/game/selectors/game-state/GameState";
import {PickupDisc} from "@src/react/components/three/arena-canvas/components/arena-scene/components/pickup/components/pickup-disc/PickupDisc";
import {WeaponDrawingPlane} from "@src/react/components/three/arena-canvas/components/arena-scene/components/pickup/components/weapon-drawing-plane/WeaponDrawingPlane";
import {useWeaponDrawing} from "@src/react/components/three/arena-canvas/components/arena-scene/components/pickup/hooks/use-weapon-drawing/UseWeaponDrawing";
import type {JSX} from "react";
import {useRef} from "react";
import type {Group} from "three";

/** The weapon lying in the arena, where the simulation says it is, drawn as its drawing (the placeholder disc when it has none) and only while the player sees it. */
export function Pickup(): JSX.Element {
  const groupRef = useRef<Group>(null);
  const drawing = useWeaponDrawing();

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

      {drawing && <WeaponDrawingPlane texture={drawing} />}
    </group>
  );
}
