/** What a click landed on, as far as the trigger cares: whether it is, or sits inside, something matching a selector. A DOM `Element` is one. */
export interface ClickTarget {
  closest(selector: string): unknown;
}
