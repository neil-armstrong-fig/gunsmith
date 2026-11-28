import {BUILT_IN_ARENAS} from "@gunsmith/engine/arena/built-in/BuiltInArenas";
import {readArenaEdit} from "@gunsmith/ai/pipeline/arena/drafting/format/edit-built-in/ReadArenaEdit";
import {EDIT_BASES} from "@gunsmith/ai/pipeline/arena/drafting/format/edit-built-in/bases/EditBases";

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

it("refuses a base that is not a built-in arena, naming the ones it may start from", () => {
  const reading = readArenaEdit({name: "Nowhere", base: "Moon Base"});

  expect(reading).toEqual({
    ok: false,
    errors: ['base: there is no arena called "Moon Base" to start from: use one of "Duel", "Fair duel", "Ziggurat".'],
    reason: "invalid-draft",
  });
});

it("refuses a built-in arena the prompt does not offer, since the model has not seen its drawing", () => {
  const notOffered = BUILT_IN_ARENAS.find(arena => !EDIT_BASES.some(base => base.arena === arena));

  expect(readArenaEdit({name: "Unseen", base: notOffered?.name}).ok).toBe(false);
});

it("cuts a long base name the model wrote, but never the list of arenas to start from", () => {
  const reading = readArenaEdit({name: "Nowhere", base: "x".repeat(500)});

  const errors = reading.ok ? [] : reading.errors;

  expect(errors.join(" ")).not.toContain("x".repeat(161));
  expect(errors.join(" ")).toContain(`"${EDIT_BASES.at(-1)?.arena.name}"`);
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

it("refuses a floor outline, because the base fixes the arena's outline too", () => {
  expect(readArenaEdit({name: "Corner", base: DUEL?.name, floor: [{x: 1, y: 1, width: 3, height: 3}]})).toEqual({
    ok: false,
    errors: [expect.stringMatching(/floor/)],
    reason: "invalid-draft",
  });
});
