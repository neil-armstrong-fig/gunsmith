import {ARENA_STYLES} from "@gunsmith/shared/arena-style/ArenaStyle";
import type {ArenaStyle} from "@gunsmith/shared/arena-style/ArenaStyle";

/** The style a value names, or `undefined` when it is absent or is anything but exactly a style: a client's word is `unknown` until here. */
export function parseArenaStyle(value: unknown): ArenaStyle | undefined {
  return ARENA_STYLES.find(style => style === value);
}
