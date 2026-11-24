import {BUILT_IN_ARENAS} from "@gunsmith/engine/built-in-arenas/BuiltInArenas";
import {readArenaEdit} from "@gunsmith/ai/pipeline/arena/arena-drafting/format/edit-built-in/ReadArenaEdit";

const DUEL = BUILT_IN_ARENAS[0];

it("starts from the built-in arena the reply names and draws its changes on it", () => {
  const reading = readArenaEdit({name: "Duel Plus", base: DUEL?.name, walls: [{x: 9, y: 1, width: 2, height: 2}]});

  expect(reading.ok).toBe(true);
  if (!reading.ok) {
    return;
  }

  const rows = (reading.drawing as {name: string; rows: string[]}).rows;
  expect(rows[1]?.slice(9, 11)).toBe("##");
  expect(rows[3]).toBe(DUEL?.rows[3]);
});

it("refuses a base that is not a built-in arena, naming the ones there are", () => {
  const reading = readArenaEdit({name: "Nowhere", base: "Moon Base"});

  expect(reading).toEqual({
    ok: false,
    errors: [expect.stringContaining(BUILT_IN_ARENAS.map(arena => `"${arena.name}"`).join(", "))],
    reason: "invalid-draft",
  });
});

it("refuses a reply with no base, naming the field", () => {
  expect(readArenaEdit({name: "No Start"})).toEqual({
    ok: false,
    errors: [expect.stringMatching(/^base: /)],
    reason: "invalid-draft",
  });
});

it("refuses a size, because the base fixes it", () => {
  expect(readArenaEdit({name: "Big", base: DUEL?.name, width: 40})).toEqual({
    ok: false,
    errors: [expect.stringMatching(/width/)],
    reason: "invalid-draft",
  });
});
