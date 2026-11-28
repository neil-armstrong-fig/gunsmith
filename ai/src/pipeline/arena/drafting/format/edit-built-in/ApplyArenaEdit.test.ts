import {applyArenaEdit} from "@gunsmith/ai/pipeline/arena/drafting/format/edit-built-in/ApplyArenaEdit";

const BASE = ["########", "#......#", "#......#", "#......#", "########"];

it("hands back the base unchanged when nothing is changed", () => {
  expect(applyArenaEdit(BASE, {name: "Same"})).toEqual({ok: true, drawing: {name: "Same", rows: BASE}});
});

it("adds walls, cover and a platform on top of the base, counted from its top-left corner", () => {
  const edited = applyArenaEdit(BASE, {
    name: "Busier",
    walls: [{x: 1, y: 1, width: 1, height: 1}],
    covers: [{x: 3, y: 2, width: 2, height: 1}],
    platforms: [{x: 5, y: 3, width: 1, height: 1, level: 1}],
  });

  expect(edited).toEqual({
    ok: true,
    drawing: {name: "Busier", rows: ["########", "##.....#", "#..cc..#", "#....1.#", "########"]},
  });
});

it("clears a rectangle back to floor before it adds, so a base's wall can be taken away and a new one put elsewhere", () => {
  const withWall = ["########", "#.##...#", "#.##...#", "#......#", "########"];

  const edited = applyArenaEdit(withWall, {
    name: "Moved",
    clears: [{x: 2, y: 1, width: 2, height: 2}],
    walls: [{x: 5, y: 3, width: 1, height: 1}],
  });

  expect(edited).toEqual({
    ok: true,
    drawing: {name: "Moved", rows: ["########", "#......#", "#......#", "#....#.#", "########"]},
  });
});

it("never lets an edit break the border wall, even when a clear reaches it", () => {
  const edited = applyArenaEdit(BASE, {name: "Open", clears: [{x: 0, y: 0, width: 8, height: 5}]});

  expect(edited).toEqual({
    ok: true,
    drawing: {name: "Open", rows: ["########", "#......#", "#......#", "#......#", "########"]},
  });
});

it("refuses a rectangle that reaches past the base, with the sentence naming the list, so the repair can find it", () => {
  expect(applyArenaEdit(BASE, {name: "Wide", walls: [{x: 6, y: 1, width: 4, height: 1}]})).toEqual({
    ok: false,
    errors: [expect.stringMatching(/^walls\[0\] reaches column 9 but the arena is 8 wide/)],
  });

  expect(applyArenaEdit(BASE, {name: "Tall", clears: [{x: 1, y: 3, width: 1, height: 4}]})).toEqual({
    ok: false,
    errors: [expect.stringMatching(/^clears\[0\] reaches row 6 but the arena is 5 tall/)],
  });
});
