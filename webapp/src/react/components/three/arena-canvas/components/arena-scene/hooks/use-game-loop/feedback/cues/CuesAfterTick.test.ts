import type {CuesRequest} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/feedback/cues/types/CuesRequest";
import type {FeedbackCues} from "@src/store/feedback/types/FeedbackCues";
import {cuesAfterTick} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/feedback/cues/CuesAfterTick";

const NONE: FeedbackCues = {bulletHits: 0, ringHurting: false, hitMarks: []};
const BULLET = [{kind: "damageTaken", cause: "bullet", amount: 20}] as const;
const RING = [{kind: "damageTaken", cause: "ring", amount: 0.2}] as const;
const REFUSED = [{kind: "fireRefused", reason: "empty"}] as const;

function after(request: Partial<CuesRequest>): ReturnType<typeof cuesAfterTick> {
  return cuesAfterTick({previous: NONE, events: undefined, round: "playing", hitPlaces: [], ...request});
}

it("counts a step in which a bullet hurt the player", () => {
  expect(after({events: BULLET}).bulletHits).toBe(1);
  expect(after({previous: {...NONE, bulletHits: 4}, events: BULLET}).bulletHits).toBe(5);
});

it("counts one hit for a step with several bullets in it", () => {
  expect(after({events: [...BULLET, ...BULLET]}).bulletHits).toBe(1);
});

it("keeps the count when nothing hurt the player, and for events that are not damage", () => {
  const previous: FeedbackCues = {...NONE, bulletHits: 2};

  expect(after({previous}).bulletHits).toBe(2);
  expect(after({previous, events: REFUSED}).bulletHits).toBe(2);
});

it("does not count the ring as a hit, and says the ring hurts", () => {
  expect(after({events: RING})).toEqual({...NONE, ringHurting: true});
});

it("says the ring hurts only in a step it did, so it stops when the player is inside", () => {
  expect(after({previous: {...NONE, ringHurting: true}}).ringHurting).toBe(false);
});

it("does not say the ring hurts for a bullet", () => {
  expect(after({events: BULLET}).ringHurting).toBe(false);
});

it("counts both when a bullet and the ring hurt in the same step", () => {
  expect(after({events: [...BULLET, ...RING]})).toEqual({...NONE, bulletHits: 1, ringHurting: true});
});

it("still counts the hit that ends the round, and stops the ring hurting once the round is not being fought", () => {
  expect(after({events: [...BULLET, ...RING], round: "lost"})).toEqual({...NONE, bulletHits: 1});
});

it("returns the very same object when nothing changed, so the caller can tell", () => {
  const previous: FeedbackCues = {...NONE, bulletHits: 1};

  expect(after({previous})).toBe(previous);
});

const HIT_AT = [{x: 11.5, y: 4.5}];

it("marks each place a hit landed, numbered from one", () => {
  expect(after({hitPlaces: [...HIT_AT, {x: 3.5, y: 2.5}]}).hitMarks).toEqual([
    {sequence: 1, x: 11.5, y: 4.5},
    {sequence: 2, x: 3.5, y: 2.5},
  ]);
});

it("numbers a new mark on from the last, so the screen can tell it from one it has seen", () => {
  const previous: FeedbackCues = {...NONE, hitMarks: [{sequence: 7, x: 1, y: 1}]};

  expect(after({previous, hitPlaces: HIT_AT}).hitMarks).toEqual([
    {sequence: 7, x: 1, y: 1},
    {sequence: 8, x: 11.5, y: 4.5},
  ]);
});

it("keeps only the latest marks, which the screen has long since taken", () => {
  const many = Array.from({length: 10}, (_, index) => ({x: index, y: 0}));
  const marks = after({hitPlaces: many}).hitMarks;

  expect(marks).toHaveLength(8);
  expect(marks.map(mark => mark.sequence)).toEqual([3, 4, 5, 6, 7, 8, 9, 10]);
});

it("marks a hit that ends the round, which still shows", () => {
  expect(after({hitPlaces: HIT_AT, round: "won"}).hitMarks).toHaveLength(1);
});

it("is not a damage taken: a mark does not count as a hit on the player", () => {
  expect(after({hitPlaces: HIT_AT}).bulletHits).toBe(0);
});

it("returns the very same object when no place was hit and nothing else changed", () => {
  const previous: FeedbackCues = {...NONE, hitMarks: [{sequence: 1, x: 2, y: 2}]};

  expect(after({previous, hitPlaces: []})).toBe(previous);
});
