import type {JSX} from "react";

/** How big the disc is, in tiles: a little smaller than a fighter, so it reads as something lying on the floor. */
const PICKUP_DISC_RADIUS = 0.3;

/** A plain placeholder colour; `art`'s pickup glow replaces it once the manifest has one. */
const PICKUP_COLOUR = "#7ee0c3";

/** The placeholder a weapon is drawn as when it has no drawing, or until its drawing has loaded. */
export function PickupDisc(): JSX.Element {
  return (
    <mesh frustumCulled={false}>
      <circleGeometry args={[PICKUP_DISC_RADIUS, 32]} />

      <meshBasicMaterial color={PICKUP_COLOUR} />
    </mesh>
  );
}
