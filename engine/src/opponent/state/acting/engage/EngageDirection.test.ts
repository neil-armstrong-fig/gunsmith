import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {DIFFICULTY} from "@gunsmith/engine/opponent/Difficulty";
import {engageDirection} from "@gunsmith/engine/opponent/state/acting/engage/EngageDirection";

const FROM = {x: 0, y: 0};
const FLAT = arenaFrom(["#".repeat(30), `#${".".repeat(28)}#`, "#".repeat(30)]);

// A platform in the west (four tiles wide) and low ground in the east, joined by one stair in the first row drawn (the
// highest y, tile row 3), so anyone on the platform who walks east along the lowest row (tile row 1) meets the drop.
const TERRACED = arenaFrom([
  "################",
  "#1111<.........#",
  "#1111..........#",
  "#1111..........#",
  "################",
]);

it("closes in on the player when it is beyond the far range", () => {
  const direction = engageDirection(FLAT, {from: FROM, to: {x: DIFFICULTY.farRange + 0.5, y: 0}, side: 1});

  expect(direction.x).toBeCloseTo(DIFFICULTY.speedShare, 9);
  expect(direction.y).toBeCloseTo(0, 9);
});

it("backs away from the player when it is nearer than the near range", () => {
  const direction = engageDirection(FLAT, {from: FROM, to: {x: DIFFICULTY.nearRange - 0.5, y: 0}, side: 1});

  expect(direction.x).toBeCloseTo(-DIFFICULTY.speedShare, 9);
  expect(direction.y).toBeCloseTo(0, 9);
});

it("circles the player in between, on the side it is on", () => {
  const middle = (DIFFICULTY.nearRange + DIFFICULTY.farRange) / 2;

  expect(engageDirection(FLAT, {from: FROM, to: {x: middle, y: 0}, side: 1}).y).toBeCloseTo(DIFFICULTY.speedShare, 9);
  expect(engageDirection(FLAT, {from: FROM, to: {x: middle, y: 0}, side: -1}).y).toBeCloseTo(-DIFFICULTY.speedShare, 9);
});

it("circles at exactly the near range and at exactly the far range", () => {
  expect(engageDirection(FLAT, {from: FROM, to: {x: DIFFICULTY.nearRange, y: 0}, side: 1}).x).toBeCloseTo(0, 9);
  expect(engageDirection(FLAT, {from: FROM, to: {x: DIFFICULTY.farRange, y: 0}, side: 1}).x).toBeCloseTo(0, 9);
});

it("closes in toward the player whichever way they lie", () => {
  const direction = engageDirection(FLAT, {from: {x: 2, y: 2}, to: {x: 2, y: 2 + DIFFICULTY.farRange + 3}, side: 1});

  expect(direction.x).toBeCloseTo(0, 9);
  expect(direction.y).toBeCloseTo(DIFFICULTY.speedShare, 9);
});

it("asks for nothing rather than a nonsense direction when it stands exactly on the player", () => {
  expect(engageDirection(FLAT, {from: {x: 3, y: 3}, to: {x: 3, y: 3}, side: 1})).toEqual({x: 0, y: 0});
});

it("closes in by way of the stair when the player is far below and the walk straight at them meets the drop", () => {
  const direction = engageDirection(TERRACED, {from: {x: 4.5, y: 1.5}, to: {x: 14.5, y: 1.5}, side: 1});

  expect(direction.x).toBeCloseTo(0, 9);
  expect(direction.y).toBeCloseTo(DIFFICULTY.speedShare, 9);
});

it("still closes in straight at a player on its own level in an arena with a stair", () => {
  const direction = engageDirection(TERRACED, {from: {x: 5.5, y: 1.5}, to: {x: 14.5, y: 1.5}, side: 1});

  expect(direction.x).toBeCloseTo(DIFFICULTY.speedShare, 9);
  expect(direction.y).toBeCloseTo(0, 9);
});

it("judges the range by the player, not by the stair it is heading for: near the stair, but far from the player, it still closes in", () => {
  const direction = engageDirection(TERRACED, {from: {x: 4.5, y: 3.5}, to: {x: 14.5, y: 3.5}, side: 1});

  expect(direction.x).toBeCloseTo(DIFFICULTY.speedShare, 9);
});

it("circles a player across the drop rather than leaving the platform, when they are in the middle range", () => {
  const direction = engageDirection(TERRACED, {from: {x: 4.5, y: 1.5}, to: {x: 10.5, y: 1.5}, side: 1});

  expect(Math.abs(direction.y)).toBeCloseTo(DIFFICULTY.speedShare, 9);
  expect(direction.x).toBeCloseTo(0, 9);
});
