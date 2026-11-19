import {spriteUrl} from "@src/assets/sprites/SpriteUrl";
import type {SpriteKey} from "@src/assets/sprites/types/SpriteKey";

const AUTHORED_PICTURES = new Map<string, SpriteKey>([
  ["rifle", "sprite-rifle-default"],
  ["marksman-rifle", "sprite-marksman-rifle"],
  ["submachine-gun", "sprite-submachine-gun"],
]);

/** The address of the picture a weapon is drawn with on a card, found by the weapon's identity key, or nothing when art has not drawn it. */
export function weaponPictureUrl(identityKey: string | undefined): string | undefined {
  const spriteKey = identityKey && AUTHORED_PICTURES.get(identityKey);
  if (!spriteKey) {
    return undefined;
  }

  return spriteUrl(spriteKey);
}
