import {hurtDummies} from "@gunsmith/engine/dummy/HurtDummies";
import type {Dummy} from "@gunsmith/engine/dummy/types/Dummy";
import type {Strike} from "@gunsmith/engine/dummy/types/Strike";

it("takes the damage off the dummy that was hit", () => {
  expect(hurtDummies([dummyAt(1, 100)], [strike(0, 25)])).toEqual([dummyAt(1, 75)]);
});

it("leaves the dummies that were not hit as they were", () => {
  const hurt = hurtDummies([dummyAt(1, 100), dummyAt(2, 100), dummyAt(3, 60)], [strike(1, 25)]);

  expect(hurt).toEqual([dummyAt(1, 100), dummyAt(2, 75), dummyAt(3, 60)]);
});

it("counts every hit when a dummy is hit more than once at the same time", () => {
  expect(hurtDummies([dummyAt(1, 100)], [strike(0, 25), strike(0, 25)])).toEqual([dummyAt(1, 50)]);
});

it("takes off the damage of each bullet when the bullets hit for different amounts", () => {
  expect(hurtDummies([dummyAt(1, 100)], [strike(0, 25), strike(0, 50)])).toEqual([dummyAt(1, 25)]);
});

it("keeps each bullet's damage with the dummy that bullet hit", () => {
  const hurt = hurtDummies([dummyAt(1, 100), dummyAt(2, 100)], [strike(0, 50), strike(1, 25)]);

  expect(hurt).toEqual([dummyAt(1, 50), dummyAt(2, 75)]);
});

it("removes a dummy whose health reaches exactly zero", () => {
  expect(hurtDummies([dummyAt(1, 25), dummyAt(2, 100)], [strike(0, 25)])).toEqual([dummyAt(2, 100)]);
});

it("removes a dummy whose health would go below zero", () => {
  expect(hurtDummies([dummyAt(1, 10)], [strike(0, 25)])).toEqual([]);
});

it("keeps a dummy with a sliver of health left", () => {
  expect(hurtDummies([dummyAt(1, 25.5)], [strike(0, 25)])).toEqual([dummyAt(1, 0.5)]);
});

it("returns the dummies unchanged when nothing was hit", () => {
  expect(hurtDummies([dummyAt(1, 100)], [])).toEqual([dummyAt(1, 100)]);
});

it("keeps a dummy crouching, whether it was hit or not", () => {
  const crouching = {...dummyAt(1, 100), crouching: true};

  expect(hurtDummies([crouching], [])).toEqual([crouching]);
  expect(hurtDummies([crouching], [strike(0, 25)])).toEqual([{...crouching, health: 75}]);
});

it("does not change the dummies it was given", () => {
  const dummies = [dummyAt(1, 100)];
  const before = structuredClone(dummies);

  hurtDummies(dummies, [strike(0, 25)]);

  expect(dummies).toEqual(before);
});

function dummyAt(x: number, health: number): Dummy {
  return {position: {x, y: 1}, health};
}

function strike(dummyIndex: number, damage: number): Strike {
  return {dummyIndex, damage};
}
