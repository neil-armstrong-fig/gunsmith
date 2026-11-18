import {useFrame} from "@react-three/fiber";
import {coneOf} from "@gunsmith/engine/vision/ConeOf";
import {canSeePoint} from "@gunsmith/engine/vision/sight/CanSeePoint";
import {nextTicks} from "@src/react/components/three/arena-canvas/components/arena-scene/components/hit-ticks/ticks/NextTicks";
import type {TicksState} from "@src/react/components/three/arena-canvas/components/arena-scene/components/hit-ticks/ticks/types/TicksState";
import {Stroke} from "@src/react/components/three/arena-canvas/components/arena-scene/components/stroke/Stroke";
import {useFeedbackStore} from "@src/store/feedback/UseFeedbackStore";
import {gameState} from "@src/store/game/selectors/game-state/GameState";
import type {JSX} from "react";
import {useRef} from "react";
import type {Group} from "three";

/** Art's outgoing hit confirmation (`#8AD4B0`), from the combat feedback study. */
const MINT = "#8ad4b0";
/** The study's shape, in tiles from the target's centre: four ticks, each between 17 and 24 of its pixels out along both axes (1 pixel is 0.025 tile), 2 pixels thick, the tip toward the body. */
const NEAR = 0.425;
const FAR = 0.6;
const THICKNESS = 0.05;
const CORNERS: readonly (readonly [number, number])[] = [
  [-1, 1],
  [1, 1],
  [-1, -1],
  [1, -1],
];
/** One slot for each confirmation `nextTicks` keeps (its `MOST_TICKS`). */
const SLOTS = [0, 1, 2, 3, 4, 5];

/**
 * The four mint ticks round a target the player's bullet has just hit, for 180 ms: art's outgoing confirmation, which tells the player the shot counted and
 * leaves the reticle alone. The loop writes where each hit landed to the feedback store (`hitMarks`, only for a target the player saw) and this takes each new mark
 * once per frame inside `useFrame` (no React state); `nextTicks` merges the marks of a burst. **A tick is drawn only while the player still sees the place**, so
 * turning away inside the 180 ms leaves nothing that says where a now-hidden target stands. Cosmetic: nothing the engine reads.
 */
export function HitTicks(): JSX.Element {
  const slotGroupsRef = useRef<(Group | null)[]>([]);
  const stateRef = useRef<TicksState>({ticks: [], seen: useFeedbackStore.getState().hitMarks.at(-1)?.sequence ?? 0});

  useFrame((_, seconds) => {
    stateRef.current = nextTicks({state: stateRef.current, marks: useFeedbackStore.getState().hitMarks, seconds});
    const {arena, player} = gameState();
    const cone = coneOf(arena, player);

    SLOTS.forEach(slot => {
      const group = slotGroupsRef.current[slot];
      const tick = stateRef.current.ticks[slot];
      if (!group) {
        return;
      }

      group.visible = tick !== undefined && canSeePoint(arena, cone, tick);
      if (tick) {
        group.position.set(tick.x, tick.y, 1.2);
      }
    });
  });

  return (
    <group name="hit-ticks">
      {SLOTS.map(slot => (
        <group
          key={slot}
          ref={group => {
            slotGroupsRef.current[slot] = group;
          }}
          visible={false}
        >
          {CORNERS.map(([across, down]) => (
            <Stroke
              key={`${across},${down}`}
              from={[across * FAR, down * FAR]}
              to={[across * NEAR, down * NEAR]}
              width={THICKNESS}
              colour={MINT}
            />
          ))}
        </group>
      ))}
    </group>
  );
}
