import {useFrame} from "@react-three/fiber";
import {nextFlash} from "@src/react/components/three/arena-canvas/components/arena-scene/components/damage-brackets/flash/NextFlash";
import type {Flash} from "@src/react/components/three/arena-canvas/components/arena-scene/components/damage-brackets/flash/types/Flash";
import {Stroke} from "@src/react/components/three/arena-canvas/components/arena-scene/components/stroke/Stroke";
import {useFeedbackStore} from "@src/store/feedback/UseFeedbackStore";
import {gameState} from "@src/store/game/selectors/game-state/GameState";
import type {JSX} from "react";
import {useRef} from "react";
import type {Group} from "three";

/** Art's incoming damage (`#FF5B62`), from the combat feedback study. */
const CORAL = "#ff5b62";
/** How long the brackets show, and how far each opens outward by the end, in tiles (8 of the study's pixels; 1 pixel is 0.025 tile on the 0.8-tile body). */
const FLASH_SECONDS = 0.18;
const EXPANSION_TILES = 0.2;
/** The study's shape, in tiles from the body's centre: the bracket stands 25 pixels out, 30 pixels tall, with a 7-pixel foot toward the body, drawn 3 pixels thick. */
const STANDS_OUT = 0.625;
const HALF_HEIGHT = 0.375;
const FOOT = 0.175;
const THICKNESS = 0.075;

/**
 * The brackets that flash either side of the player for 180 ms when a bullet hurts them, opening outward as they go: art's "local brackets", with no attacker
 * direction in them. The loop writes `bulletHits` to the feedback store and this reads it each frame inside `useFrame` (no React state): `nextFlash` starts a
 * flash on a new hit and merges the hits of a burst into one. The ring never makes them. They follow the player, who is always drawn, so nothing about the
 * opponent shows. Cosmetic: nothing the engine reads.
 */
export function DamageBrackets(): JSX.Element {
  const groupRef = useRef<Group>(null);
  const leftRef = useRef<Group>(null);
  const rightRef = useRef<Group>(null);
  const flashRef = useRef<Flash>({hitsSeen: 0, age: Number.POSITIVE_INFINITY});

  useFrame((_, seconds) => {
    if (!groupRef.current || !leftRef.current || !rightRef.current) {
      return;
    }

    flashRef.current = nextFlash({flash: flashRef.current, hits: useFeedbackStore.getState().bulletHits, seconds});
    const {age} = flashRef.current;
    groupRef.current.visible = age < FLASH_SECONDS;
    if (!groupRef.current.visible) {
      return;
    }

    const {position} = gameState().player;
    const expansion = (EXPANSION_TILES * age) / FLASH_SECONDS;
    groupRef.current.position.set(position.x, position.y, 1.2);
    leftRef.current.position.x = -expansion;
    rightRef.current.position.x = expansion;
  });

  return (
    <group ref={groupRef} name="damage-brackets" visible={false}>
      <group ref={leftRef}>
        <Stroke from={[-STANDS_OUT, HALF_HEIGHT]} to={[-STANDS_OUT, -HALF_HEIGHT]} width={THICKNESS} colour={CORAL} />

        <Stroke
          from={[-STANDS_OUT, -HALF_HEIGHT]}
          to={[-STANDS_OUT + FOOT, -HALF_HEIGHT]}
          width={THICKNESS}
          colour={CORAL}
        />
      </group>

      <group ref={rightRef}>
        <Stroke from={[STANDS_OUT, HALF_HEIGHT]} to={[STANDS_OUT, -HALF_HEIGHT]} width={THICKNESS} colour={CORAL} />

        <Stroke
          from={[STANDS_OUT, -HALF_HEIGHT]}
          to={[STANDS_OUT - FOOT, -HALF_HEIGHT]}
          width={THICKNESS}
          colour={CORAL}
        />
      </group>
    </group>
  );
}
