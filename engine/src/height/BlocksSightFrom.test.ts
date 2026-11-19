import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {blocksSightFrom} from "@gunsmith/engine/height/BlocksSightFrom";

describe("on terraces", () => {
  // Low ground at x 1, a stair at x 2 up to level 1 at x 3, a stair at x 4 up to level 2 at x 5.
  const terraces = arenaFrom(["#######", "#.>1>2#", "#######"]);

  it("is stopped by a wall, from any level", () => {
    expect(blocksSightFrom(terraces, {eyeLevel: 0, crouching: false})(0, 1)).toBe(true);
    expect(blocksSightFrom(terraces, {eyeLevel: 2, crouching: false})(0, 1)).toBe(true);
  });

  it("is stopped by everything beyond the arena's edge, from any level", () => {
    expect(blocksSightFrom(terraces, {eyeLevel: 2, crouching: false})(-1, 1)).toBe(true);
    expect(blocksSightFrom(terraces, {eyeLevel: 2, crouching: false})(7, 1)).toBe(true);
  });

  it("is stopped by ground higher than the viewer", () => {
    expect(blocksSightFrom(terraces, {eyeLevel: 0, crouching: false})(3, 1)).toBe(true);
    expect(blocksSightFrom(terraces, {eyeLevel: 0, crouching: false})(5, 1)).toBe(true);
    expect(blocksSightFrom(terraces, {eyeLevel: 1, crouching: false})(5, 1)).toBe(true);
  });

  it("sees ground on the viewer's own level", () => {
    expect(blocksSightFrom(terraces, {eyeLevel: 0, crouching: false})(1, 1)).toBe(false);
    expect(blocksSightFrom(terraces, {eyeLevel: 1, crouching: false})(3, 1)).toBe(false);
    expect(blocksSightFrom(terraces, {eyeLevel: 2, crouching: false})(5, 1)).toBe(false);
  });

  it("sees ground lower than the viewer", () => {
    expect(blocksSightFrom(terraces, {eyeLevel: 1, crouching: false})(1, 1)).toBe(false);
    expect(blocksSightFrom(terraces, {eyeLevel: 2, crouching: false})(1, 1)).toBe(false);
    expect(blocksSightFrom(terraces, {eyeLevel: 2, crouching: false})(3, 1)).toBe(false);
  });

  it("treats a stair as the level of its low end, so it is no higher than the ground it climbs from", () => {
    expect(blocksSightFrom(terraces, {eyeLevel: 0, crouching: false})(2, 1)).toBe(false);
    expect(blocksSightFrom(terraces, {eyeLevel: 0, crouching: false})(4, 1)).toBe(true);
    expect(blocksSightFrom(terraces, {eyeLevel: 1, crouching: false})(4, 1)).toBe(false);
  });
});

describe("with a low cover block", () => {
  // A cover block at x 2 on the low ground, and a stair at x 4 up to a platform at x 5.
  const withCover = arenaFrom(["#######", "#.c.>1#", "#######"]);

  it("is not stopped by a cover block when the viewer stands, since a standing viewer sees over it", () => {
    expect(blocksSightFrom(withCover, {eyeLevel: 0, crouching: false})(2, 1)).toBe(false);
    expect(blocksSightFrom(withCover, {eyeLevel: 1, crouching: false})(2, 1)).toBe(false);
  });

  it("is stopped by a cover block when the viewer crouches on the same level, which is too low to see over it", () => {
    expect(blocksSightFrom(withCover, {eyeLevel: 0, crouching: true})(2, 1)).toBe(true);
  });

  it("is not stopped by a cover block on lower ground, even when the viewer crouches, since higher ground sees over it", () => {
    expect(blocksSightFrom(withCover, {eyeLevel: 1, crouching: true})(2, 1)).toBe(false);
  });

  it("is still stopped by a wall when the viewer crouches, and by ground higher than a crouching viewer", () => {
    expect(blocksSightFrom(withCover, {eyeLevel: 0, crouching: true})(0, 1)).toBe(true);
    expect(blocksSightFrom(withCover, {eyeLevel: 0, crouching: true})(5, 1)).toBe(true);
  });

  it("does not stop a crouching viewer at plain floor", () => {
    expect(blocksSightFrom(withCover, {eyeLevel: 0, crouching: true})(1, 1)).toBe(false);
  });
});
