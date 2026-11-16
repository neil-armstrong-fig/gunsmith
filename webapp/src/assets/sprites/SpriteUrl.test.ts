import {expect, it} from "vitest";
import {spriteUrl} from "@src/assets/sprites/SpriteUrl";

it("serves a picture from the assets folder, named by its key", () => {
  expect(spriteUrl("sprite-player-stand-blue")).toBe("/assets/sprites/sprite-player-stand-blue.svg");
});
