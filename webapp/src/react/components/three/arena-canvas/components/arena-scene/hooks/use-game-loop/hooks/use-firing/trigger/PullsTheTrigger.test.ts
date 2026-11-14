import type {ClickTarget} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/hooks/use-firing/trigger/types/ClickTarget";
import {pullsTheTrigger} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/hooks/use-firing/trigger/PullsTheTrigger";

const onTheArena: ClickTarget = {closest: () => null};
const onAButton: ClickTarget = {closest: selector => (selector === "button" ? {} : null)};

it("is pulled by the left button on the arena", () => {
  expect(pullsTheTrigger({button: 0, target: onTheArena})).toBe(true);
});

it("is pulled by the left button on nothing in particular", () => {
  expect(pullsTheTrigger({button: 0, target: undefined})).toBe(true);
});

it("is not pulled by the other buttons", () => {
  expect(pullsTheTrigger({button: 1, target: onTheArena})).toBe(false);
  expect(pullsTheTrigger({button: 2, target: onTheArena})).toBe(false);
});

it("is not pulled by a click on a button, which is for the button and not a shot", () => {
  expect(pullsTheTrigger({button: 0, target: onAButton})).toBe(false);
});
