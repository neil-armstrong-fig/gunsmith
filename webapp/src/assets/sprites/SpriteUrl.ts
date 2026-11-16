import type {SpriteKey} from "@src/assets/sprites/types/SpriteKey";

/** Where a picture is served from: art's files live in `public/assets/sprites`, named by their key. */
export function spriteUrl(key: SpriteKey): string {
  return `/assets/sprites/${key}.svg`;
}
