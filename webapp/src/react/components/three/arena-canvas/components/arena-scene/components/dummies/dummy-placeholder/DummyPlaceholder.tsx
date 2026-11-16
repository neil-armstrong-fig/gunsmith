import {DUMMY_RADIUS} from "@gunsmith/engine/dummy/DummyRadius";
import type {JSX} from "react";

/** What an instanced mesh of dummies is made of before art's picture has loaded, or if it could not: a disc the size of the circle a bullet must touch, tinted per dummy. */
export function DummyPlaceholder(): JSX.Element {
  return (
    <>
      <circleGeometry args={[DUMMY_RADIUS, 32]} />

      <meshBasicMaterial color="#ffffff" />
    </>
  );
}
