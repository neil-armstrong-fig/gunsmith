import {parseStartSeed} from "@src/durable-objects/match/start-seed/ParseStartSeed";

it("gives no seed when the page asks for none, so the room draws its own", () => {
  expect(parseStartSeed(new URLSearchParams(""))).toBeUndefined();
  expect(parseStartSeed(new URLSearchParams("room=ABCD&reconnectSeconds=2"))).toBeUndefined();
});

it("gives the seed the page asks for, every time it is asked", () => {
  const makeSeed = parseStartSeed(new URLSearchParams("room=ABCD&startSeed=21"));

  expect(makeSeed?.()).toBe(21);
  expect(makeSeed?.()).toBe(21);
});

it("takes zero and a negative whole number", () => {
  expect(parseStartSeed(new URLSearchParams("startSeed=0"))?.()).toBe(0);
  expect(parseStartSeed(new URLSearchParams("startSeed=-7"))?.()).toBe(-7);
});

it("ignores what is not a whole number", () => {
  for (const asked of ["", " ", "soon", "1.5", "NaN", "Infinity", "2abc", "1e400", "9007199254740993"]) {
    expect(parseStartSeed(new URLSearchParams({startSeed: asked}))).toBeUndefined();
  }
});
