import type {Point} from "@gunsmith/engine/geometry/types/Point";
import type {JSX} from "react";

interface Props {
  point: Point;
}

export function StartingPlace({point}: Props): JSX.Element {
  return (
    <mesh position={[point.x, point.y, 1]}>
      <circleGeometry args={[0.27, 24]} />

      <meshBasicMaterial color="#e5eaf0" toneMapped={false} />
    </mesh>
  );
}
