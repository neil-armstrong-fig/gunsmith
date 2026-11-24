import type {Appearance} from "@gunsmith/shared/appearance/schema/Appearance";
import {appearanceSvg} from "@src/assets/weapon-drawings/svg/AppearanceSvg";
import {spriteUrl} from "@src/assets/sprites/SpriteUrl";
import type {SpriteKey} from "@src/assets/sprites/types/SpriteKey";

const AUTHORED_PICTURES = new Map<string, SpriteKey>([
  ["rifle", "sprite-rifle-default"],
  ["marksman-rifle", "sprite-marksman-rifle"],
  ["submachine-gun", "sprite-submachine-gun"],
]);

/** The weapon's picture on a card, from its generated appearance or the authored sprite for its identity. */
export function weaponPictureUrl(identityKey: string | undefined, appearance?: Appearance): string | undefined {
  if (appearance) {
    return `data:image/svg+xml,${encodeURIComponent(appearanceSvg(appearance, ["structural", "fine"]))}`;
  }

  const spriteKey = identityKey && AUTHORED_PICTURES.get(identityKey);
  if (!spriteKey) {
    return undefined;
  }

  return spriteUrl(spriteKey);
}
