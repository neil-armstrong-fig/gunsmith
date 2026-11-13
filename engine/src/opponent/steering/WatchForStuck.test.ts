import {DIFFICULTY} from "@gunsmith/engine/opponent/Difficulty";
import {watchForStuck} from "@gunsmith/engine/opponent/steering/WatchForStuck";

const START = {anchor: {x: 5, y: 5}, seconds: 0};

it("is not stuck before it has had time to get anywhere", () => {
  const result = watchForStuck(START, {position: {x: 5, y: 5}, walking: true, seconds: DIFFICULTY.stuckSeconds - 0.1});

  expect(result.stuck).toBe(false);
  expect(result.watch.seconds).toBeCloseTo(DIFFICULTY.stuckSeconds - 0.1, 9);
  expect(result.watch.anchor).toEqual({x: 5, y: 5});
});

it("is stuck when it has walked a while and got nowhere", () => {
  const result = watchForStuck(START, {position: {x: 5.1, y: 5}, walking: true, seconds: DIFFICULTY.stuckSeconds});

  expect(result.stuck).toBe(true);
});

it("is not stuck when it has covered the distance", () => {
  const moved = {x: 5 + DIFFICULTY.stuckDistance, y: 5};
  const result = watchForStuck(START, {position: moved, walking: true, seconds: DIFFICULTY.stuckSeconds});

  expect(result.stuck).toBe(false);
});

it("starts a fresh look from where it now stands, whether or not it was stuck", () => {
  const stuck = watchForStuck(START, {position: {x: 5, y: 5.1}, walking: true, seconds: DIFFICULTY.stuckSeconds});
  const moving = watchForStuck(START, {position: {x: 9, y: 5}, walking: true, seconds: DIFFICULTY.stuckSeconds});

  expect(stuck.watch).toEqual({anchor: {x: 5, y: 5.1}, seconds: 0});
  expect(moving.watch).toEqual({anchor: {x: 9, y: 5}, seconds: 0});
});

it("is never stuck while it is not trying to walk, and forgets the time", () => {
  const waiting = {anchor: {x: 5, y: 5}, seconds: 1.4};
  const result = watchForStuck(waiting, {position: {x: 5, y: 5}, walking: false, seconds: 1});

  expect(result.stuck).toBe(false);
  expect(result.watch).toEqual({anchor: {x: 5, y: 5}, seconds: 0});
});
