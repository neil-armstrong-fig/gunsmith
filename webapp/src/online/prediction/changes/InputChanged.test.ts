import type {Input} from "@gunsmith/engine/game-loop/types/Input";
import {inputChanged} from "@src/online/prediction/changes/InputChanged";

const BASE: Input = {direction: {x: 0, y: 0}, aimAt: {x: 5, y: 5}, crouching: false, firing: false, reload: false};

it("is not a change when the player asks for the same thing", () => {
  expect(inputChanged(BASE, {...BASE, direction: {x: 0, y: 0}, aimAt: {x: 5, y: 5}})).toBe(false);
});

it("is a change when the walk, the stance or the trigger changes", () => {
  expect(inputChanged(BASE, {...BASE, direction: {x: 1, y: 0}})).toBe(true);
  expect(inputChanged(BASE, {...BASE, crouching: true})).toBe(true);
  expect(inputChanged(BASE, {...BASE, firing: true})).toBe(true);
});

it("treats an absent stance as standing", () => {
  expect(inputChanged({...BASE, crouching: undefined}, {...BASE, crouching: false})).toBe(false);
});

it("is a change whenever a reload or a weapon switch is asked, since each is asked once", () => {
  expect(inputChanged({...BASE, reload: true}, {...BASE, reload: true})).toBe(true);
  expect(inputChanged(BASE, {...BASE, switchTo: 2})).toBe(true);
});

it("ignores an aim that moved by less than a hundredth of a tile, and sends one that moved more", () => {
  expect(inputChanged(BASE, {...BASE, aimAt: {x: 5.005, y: 5}})).toBe(false);
  expect(inputChanged(BASE, {...BASE, aimAt: {x: 5.02, y: 5}})).toBe(true);
  expect(inputChanged(BASE, {...BASE, aimAt: {x: 5, y: 4.98}})).toBe(true);
});

it("is a change when the aim appears or goes", () => {
  expect(inputChanged(BASE, {...BASE, aimAt: undefined})).toBe(true);
  expect(inputChanged({...BASE, aimAt: undefined}, BASE)).toBe(true);
  expect(inputChanged({...BASE, aimAt: undefined}, {...BASE, aimAt: undefined})).toBe(false);
});
