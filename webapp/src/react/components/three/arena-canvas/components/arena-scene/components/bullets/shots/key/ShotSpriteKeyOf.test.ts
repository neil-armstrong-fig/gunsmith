import {expect, it} from "vitest";
import {shotSpriteKeyOf} from "@src/react/components/three/arena-canvas/components/arena-scene/components/bullets/shots/key/ShotSpriteKeyOf";

it("draws the player's shots in blue", () => {
  expect(shotSpriteKeyOf("player")).toBe("fx-projectile-rifle-blue");
});

it("draws the opponent's shots in orange", () => {
  expect(shotSpriteKeyOf("opponent")).toBe("fx-projectile-rifle-orange");
});
