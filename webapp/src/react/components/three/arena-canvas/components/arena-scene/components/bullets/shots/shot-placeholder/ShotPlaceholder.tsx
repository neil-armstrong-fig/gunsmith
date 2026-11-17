import type {JSX} from "react";

/** What an instanced mesh of shots is made of before art's picture has loaded, or if it could not: a small gold disc on the bullet's point. */
export function ShotPlaceholder(): JSX.Element {
  return (
    <>
      <circleGeometry args={[0.1, 12]} />

      <meshBasicMaterial color="#f2c66d" />
    </>
  );
}
