import {DEFAULT_RING_TIMING} from "@gunsmith/engine/ring/DefaultRingTiming";
import {parseRingTiming} from "@src/durable-objects/match/ring-timing/ParseRingTiming";

it("gives no timing when the page asks for none, so the room keeps the real ring", () => {
  expect(parseRingTiming(new URLSearchParams(""))).toBeUndefined();
  expect(parseRingTiming(new URLSearchParams("room=ABCD&startSeed=21"))).toBeUndefined();
});

it("gives the delay and the closing time the page asks for", () => {
  expect(parseRingTiming(new URLSearchParams("ringDelay=2&ringClosing=5"))).toEqual({
    startDelaySeconds: 2,
    closingSeconds: 5,
  });
});

it("keeps the real value of the one the page leaves out", () => {
  expect(parseRingTiming(new URLSearchParams("ringDelay=2"))).toEqual({
    startDelaySeconds: 2,
    closingSeconds: DEFAULT_RING_TIMING.closingSeconds,
  });
  expect(parseRingTiming(new URLSearchParams("ringClosing=5"))).toEqual({
    startDelaySeconds: DEFAULT_RING_TIMING.startDelaySeconds,
    closingSeconds: 5,
  });
});

it("lets the ring start at once but never close in no time", () => {
  expect(parseRingTiming(new URLSearchParams("ringDelay=0"))?.startDelaySeconds).toBe(0);
  expect(parseRingTiming(new URLSearchParams("ringClosing=0"))?.closingSeconds).toBe(
    DEFAULT_RING_TIMING.closingSeconds,
  );
  expect(parseRingTiming(new URLSearchParams("ringClosing=-3"))?.closingSeconds).toBe(
    DEFAULT_RING_TIMING.closingSeconds,
  );
});

it("never makes the ring later or slower than the real one, so a page cannot switch it off", () => {
  expect(parseRingTiming(new URLSearchParams("ringDelay=1000000&ringClosing=1000000"))).toEqual(DEFAULT_RING_TIMING);
});

it("treats a negative delay as none", () => {
  expect(parseRingTiming(new URLSearchParams("ringDelay=-5"))?.startDelaySeconds).toBe(0);
});

it("ignores what is not a number", () => {
  for (const asked of ["", " ", "soon", "NaN", "Infinity", "2abc"]) {
    expect(parseRingTiming(new URLSearchParams({ringDelay: asked, ringClosing: asked}))).toBeUndefined();
  }
});

it("gives the ring's damage the page asks for, gentler or harsher, beside the real timing", () => {
  expect(parseRingTiming(new URLSearchParams("ringDamage=0.25"))).toEqual({
    ...DEFAULT_RING_TIMING,
    damageScale: 0.25,
  });
  expect(parseRingTiming(new URLSearchParams("ringDelay=1&ringClosing=4&ringDamage=3"))).toEqual({
    startDelaySeconds: 1,
    closingSeconds: 4,
    damageScale: 3,
  });
});

it("never lets the ring do no damage, so a page cannot switch it off", () => {
  for (const asked of ["0", "-1", "soon", "Infinity", ""]) {
    expect(parseRingTiming(new URLSearchParams({ringDamage: asked}))).toBeUndefined();
    expect(parseRingTiming(new URLSearchParams({ringDelay: "1", ringDamage: asked}))).not.toHaveProperty("damageScale");
  }
});
