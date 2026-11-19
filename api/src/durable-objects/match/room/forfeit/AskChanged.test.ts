import type {Input} from "@gunsmith/engine/game-loop/types/Input";
import {askChanged} from "@src/durable-objects/match/room/forfeit/AskChanged";

const STANDING: Input = {direction: {x: 0, y: 0}, aimAt: {x: 5, y: 5}, firing: false, reload: false};

it("is not a change when the same ask is sent again, as the browser's heartbeat does", () => {
  expect(askChanged(STANDING, {...STANDING})).toBe(false);
});

it("is a change when the player starts walking or walks another way", () => {
  expect(askChanged(STANDING, {...STANDING, direction: {x: 1, y: 0}})).toBe(true);
  expect(askChanged({...STANDING, direction: {x: 1, y: 0}}, {...STANDING, direction: {x: 0, y: 1}})).toBe(true);
});

it("is a change when the trigger or the crouch key goes down or up", () => {
  expect(askChanged(STANDING, {...STANDING, firing: true})).toBe(true);
  expect(askChanged(STANDING, {...STANDING, crouching: true})).toBe(true);
  expect(askChanged({...STANDING, crouching: true}, STANDING)).toBe(true);
});

it("is a change when the aim moves a hundredth of a tile or more, and not for less", () => {
  expect(askChanged(STANDING, {...STANDING, aimAt: {x: 5.02, y: 5}})).toBe(true);
  expect(askChanged(STANDING, {...STANDING, aimAt: {x: 5, y: 4.98}})).toBe(true);
  expect(askChanged(STANDING, {...STANDING, aimAt: {x: 5.005, y: 5.005}})).toBe(false);
});

it("is a change when an aim appears or goes", () => {
  expect(askChanged({...STANDING, aimAt: undefined}, STANDING)).toBe(true);
  expect(askChanged(STANDING, {...STANDING, aimAt: undefined})).toBe(true);
  expect(askChanged({...STANDING, aimAt: undefined}, {...STANDING, aimAt: undefined})).toBe(false);
});

it("is a change when a reload or a weapon switch is asked, which is asked once", () => {
  expect(askChanged(STANDING, {...STANDING, reload: true})).toBe(true);
  expect(askChanged(STANDING, {...STANDING, switchTo: 2})).toBe(true);
});
