import type {JSX} from "react";

interface Props {
  /** One end of the line, in tiles from the group it is in. */
  from: readonly [number, number];
  /** The other end. */
  to: readonly [number, number];
  /** How thick the line is, in tiles. */
  width: number;
  colour: string;
}

/** A straight line of one flat colour, drawn as a thin plane lying from one point to another, its ends squared off by half its width. */
export function Stroke({from, to, width, colour}: Props): JSX.Element {
  const [fromX, fromY] = from;
  const [toX, toY] = to;
  const length = Math.hypot(toX - fromX, toY - fromY);

  return (
    <mesh position={[(fromX + toX) / 2, (fromY + toY) / 2, 0]} rotation={[0, 0, Math.atan2(toY - fromY, toX - fromX)]}>
      <planeGeometry args={[length + width, width]} />

      <meshBasicMaterial color={colour} toneMapped={false} />
    </mesh>
  );
}
