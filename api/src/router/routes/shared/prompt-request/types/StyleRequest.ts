import type {ArenaStyle} from "@gunsmith/shared/arena-style/ArenaStyle";

/** What an arena request's body says about the style: `valid` unless it names one that is not a style, and the style it names, when it names one. */
export interface StyleRequest {
  valid: boolean;
  style: ArenaStyle | undefined;
}
