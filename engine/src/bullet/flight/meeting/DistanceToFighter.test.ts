import {distanceToFighter} from "@gunsmith/engine/bullet/flight/meeting/DistanceToFighter";
import type {Bullet} from "@gunsmith/engine/bullet/types/Bullet";
import {PLAYER_RADIUS} from "@gunsmith/engine/player/PlayerRadius";

const bullet: Bullet = {position: {x: 0, y: 0}, direction: {x: 1, y: 0}, damage: 25, speed: 20, shooter: "player"};

it("is the distance to the near edge of the fighter's circle", () => {
  expect(distanceToFighter({x: 5, y: 0}, bullet, 10)).toBeCloseTo(5 - PLAYER_RADIUS, 9);
});

it("is undefined when there is no fighter", () => {
  expect(distanceToFighter(undefined, bullet, 10)).toBeUndefined();
});

it("is undefined when the fighter is out of reach this step", () => {
  expect(distanceToFighter({x: 5, y: 0}, bullet, 4)).toBeUndefined();
});

it("reaches a fighter whose edge is exactly where the step ends", () => {
  expect(distanceToFighter({x: 5, y: 0}, bullet, 5 - PLAYER_RADIUS)).toBeCloseTo(5 - PLAYER_RADIUS, 9);
});

it("is undefined when the bullet passes the fighter by", () => {
  expect(distanceToFighter({x: 5, y: 1}, bullet, 10)).toBeUndefined();
});

it("is undefined when the fighter is behind the bullet", () => {
  expect(distanceToFighter({x: -5, y: 0}, bullet, 10)).toBeUndefined();
});
