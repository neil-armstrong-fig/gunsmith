import {crouchHeld} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/hooks/use-crouch-key/keys/CrouchHeld";

it("is not crouching when no key is held", () => {
  expect(crouchHeld(new Set())).toBe(false);
});

it("crouches while C is held", () => {
  expect(crouchHeld(new Set(["KeyC"]))).toBe(true);
});

it("crouches while either Control key is held", () => {
  expect(crouchHeld(new Set(["ControlLeft"]))).toBe(true);
  expect(crouchHeld(new Set(["ControlRight"]))).toBe(true);
});

it("does not crouch for the other keys, the walking keys among them", () => {
  expect(crouchHeld(new Set(["KeyW", "KeyA", "KeyS", "KeyD", "Digit1", "KeyR"]))).toBe(false);
});

it("keeps crouching while a walking key is held too", () => {
  expect(crouchHeld(new Set(["KeyC", "KeyD"]))).toBe(true);
});
