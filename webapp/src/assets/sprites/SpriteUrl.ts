import type {SpriteKey} from "@src/assets/sprites/types/SpriteKey";

/** Art tiles and sprites are served from their respective folders, named by key. */
export function spriteUrl(key: SpriteKey): string {
  if (key.startsWith("tile-")) {
    return `/assets/tiles/${key}.svg`;
  }

  return `/assets/sprites/${key}.svg`;
}
