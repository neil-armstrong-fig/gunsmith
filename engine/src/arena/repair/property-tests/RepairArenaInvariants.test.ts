import fc from "fast-check";
import {anyDrawing} from "@gunsmith/engine/arena/repair/property-tests/arbitrary/AnyDrawing";
import {isReadable} from "@gunsmith/engine/arena/repair/drawing/IsReadable";
import {regionsOfDrawing} from "@gunsmith/engine/arena/repair/drawing/RegionsOfDrawing";
import {repairArena} from "@gunsmith/engine/arena/repair/RepairArena";

/**
 * What must hold for every drawing, not only the ones someone drew by hand: the repair only ever repairs. The unit tests
 * (`RepairArena.test.ts`) say what one drawing becomes; this draws random bordered drawings and says what is true of every one. When a
 * property fails, fast-check shrinks the drawing to the smallest that still breaks it and prints a seed to replay it.
 *
 * Deliberately outside `pnpm checks`, as the other properties are (`vitest.config.ts`): run it with `pnpm test:properties`;
 * `PROPERTY_TEST_RUNS` sets how many cases each property gets.
 */
const RUNS = Number(process.env["PROPERTY_TEST_RUNS"] ?? 100);

it("never throws, and keeps the size of the drawing and every tile of its border", () => {
  fc.assert(
    fc.property(anyDrawing(), rows => {
      const repaired = repairArena(rows).rows;

      expect(repaired).toHaveLength(rows.length);
      repaired.forEach((row, index) => {
        expect(row).toHaveLength(rows[index]?.length ?? -1);
      });
      expect(repaired[0]).toBe(rows[0]);
      expect(repaired.at(-1)).toBe(rows.at(-1));
      expect(repaired.every(row => row.startsWith("#") && row.endsWith("#"))).toBe(true);
    }),
    {numRuns: RUNS},
  );
});

it("leaves no piece of floor cut off, whenever the engine can read what it made", () => {
  fc.assert(
    fc.property(anyDrawing(), rows => {
      const repaired = repairArena(rows).rows;

      if (isReadable(repaired)) {
        expect(regionsOfDrawing(repaired).cutOff).toEqual([]);
      }
    }),
    {numRuns: RUNS},
  );
});

it("returns a drawing that was readable still readable", () => {
  fc.assert(
    fc.property(anyDrawing(), rows => {
      if (isReadable(rows)) {
        expect(isReadable(repairArena(rows).rows)).toBe(true);
      }
    }),
    {numRuns: RUNS},
  );
});

it("leaves a drawing the engine reads as one piece of floor exactly as it is, and says it changed nothing", () => {
  fc.assert(
    fc.property(anyDrawing(), rows => {
      if (isReadable(rows) && regionsOfDrawing(rows).cutOff.length === 0) {
        expect(repairArena(rows)).toEqual({rows, edits: []});
      }
    }),
    {numRuns: RUNS},
  );
});

it("is finished after one repair: repairing the result changes nothing", () => {
  fc.assert(
    fc.property(anyDrawing(), rows => {
      const once = repairArena(rows);
      const twice = repairArena(once.rows);

      expect(twice).toEqual({rows: once.rows, edits: []});
    }),
    {numRuns: RUNS},
  );
});
