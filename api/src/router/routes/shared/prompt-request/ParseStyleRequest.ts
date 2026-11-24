import {parseArenaStyle} from "@gunsmith/shared/arena-style/ParseArenaStyle";
import type {StyleRequest} from "@src/router/routes/shared/prompt-request/types/StyleRequest";

const NO_STYLE: StyleRequest = {valid: true, style: undefined};
const NOT_A_STYLE: StyleRequest = {valid: false, style: undefined};

/**
 * The style an arena request's body names. Leaving it out is allowed (the pipeline's own default applies); naming anything but
 * exactly `blue` or `red` is not, so a typo is told so rather than made into some other arena. The body is `unknown` until here.
 */
export function parseStyleRequest(text: string): StyleRequest {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return NOT_A_STYLE;
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return NOT_A_STYLE;
  }

  const named: unknown = Reflect.get(parsed, "style");
  if (named === undefined) {
    return NO_STYLE;
  }

  const style = parseArenaStyle(named);
  if (style === undefined) {
    return NOT_A_STYLE;
  }

  return {valid: true, style};
}
