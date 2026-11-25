import {reasonForInvalidArena} from "@gunsmith/ai/pipeline/arena/arena-graph/outcome/invalid-reason/ReasonForInvalidArena";

it("says part of the floor could not be reached, and how to ask for a way in, when floor is cut off", () => {
  expect(reasonForInvalidArena("unplayable-arena", ["disconnected"])).toBe(
    "We could not build a playable arena from that request: part of the floor could not be reached from the rest. Ask for a doorway through every wall and stairs up to every raised area.",
  );
});

it("says there was no room for both fighters to start", () => {
  expect(reasonForInvalidArena("unplayable-arena", ["noStartingPlaces"])).toBe(
    "We could not build a playable arena from that request: there was no room for both fighters to start. Ask for a larger open space.",
  );
});

it("says there was too little open floor", () => {
  expect(reasonForInvalidArena("unplayable-arena", ["tooWalled"])).toBe(
    "We could not build a playable arena from that request: it was too full of walls to fight in. Ask for more open floor.",
  );
});

it("says there was no floor at all", () => {
  expect(reasonForInvalidArena("unplayable-arena", ["noFloor"])).toBe(
    "We could not build a playable arena from that request: it had no floor to stand on. Ask for an arena with open ground.",
  );
});

it("tells the most basic fault first when an arena has several, whatever order the engine found them in", () => {
  expect(reasonForInvalidArena("unplayable-arena", ["tooWalled", "noStartingPlaces", "disconnected"])).toContain(
    "part of the floor could not be reached",
  );
  expect(reasonForInvalidArena("unplayable-arena", ["tooWalled", "noStartingPlaces"])).toContain(
    "no room for both fighters",
  );
  expect(reasonForInvalidArena("unplayable-arena", ["tooWalled", "noFloor"])).toContain("no floor to stand on");
});

it.each(["invalid-draft", "invalid-shapes", "ragged-rows", "invalid-tiles"] as const)(
  "asks for a simpler description when the arena could not be read (%s)",
  failure => {
    expect(reasonForInvalidArena(failure, [])).toBe(
      "We could not build a playable arena from that request: what we drew could not be read as an arena. Try describing it more simply, with fewer parts.",
    );
  },
);

it("asks for a simpler description when no cause was recorded, rather than say nothing", () => {
  expect(reasonForInvalidArena(undefined, [])).toContain("Try describing it more simply");
});

it("falls back to the plain sentence when an unplayable arena names no kind", () => {
  expect(reasonForInvalidArena("unplayable-arena", [])).toContain("Try describing it more simply");
});
