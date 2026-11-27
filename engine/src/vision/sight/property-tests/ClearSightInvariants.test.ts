import fc from "fast-check";
import {anyArena} from "@gunsmith/engine/arena-validation/property-tests/arbitrary/AnyArena";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {eyeLevelAt} from "@gunsmith/engine/height/EyeLevelAt";
import {hasClearSight} from "@gunsmith/engine/vision/sight/HasClearSight";

/**
 * What must hold for every arena the types allow: two standing fighters on different levels see each other or neither does,
 * so the edge rule never lets the high ground see someone who cannot see them back.
 * Run with `pnpm test:properties`; `PROPERTY_TEST_RUNS` sets how many cases each property gets.
 */
const RUNS = Number(process.env["PROPERTY_TEST_RUNS"] ?? 100);

it("between two levels, a standing fighter sees another exactly when the other sees them", () => {
  fc.assert(
    fc.property(
      anyArena()
        .filter(arena => arena.width > 0 && arena.height > 0)
        .chain(arena => fc.tuple(fc.constant(arena), pointIn(arena), pointIn(arena))),
      ([arena, first, second]) => {
        const firstLevel = eyeLevelAt(arena, first);
        const secondLevel = eyeLevelAt(arena, second);
        if (firstLevel === secondLevel) {
          return;
        }

        const firstSees = hasClearSight(arena, {
          from: first,
          eye: {eyeLevel: firstLevel, crouching: false},
          to: second,
        });
        const secondSees = hasClearSight(arena, {
          from: second,
          eye: {eyeLevel: secondLevel, crouching: false},
          to: first,
        });

        expect(firstSees).toBe(secondSees);
      },
    ),
    {numRuns: RUNS},
  );
});

function pointIn(arena: Arena): fc.Arbitrary<Point> {
  return fc.record({
    x: fc.double({min: 0, max: arena.width, maxExcluded: true, noNaN: true}),
    y: fc.double({min: 0, max: arena.height, maxExcluded: true, noNaN: true}),
  });
}
