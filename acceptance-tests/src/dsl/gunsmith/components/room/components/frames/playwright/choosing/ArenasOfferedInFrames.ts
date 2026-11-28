/**
 * The built-in arenas the latest `preRound` frame among the text frames a browser received offers (`builtInArenas`), or `undefined`
 * when no such frame has come or it offers none. A frame that is not JSON, not a `preRound` frame, or whose list is not all text is skipped.
 */
export function arenasOfferedInFrames(frames: readonly string[]): readonly string[] | undefined {
  for (let index = frames.length - 1; index >= 0; index -= 1) {
    const offered = arenasOfferedInFrame(frames[index] ?? "");
    if (offered) {
      return offered;
    }
  }

  return undefined;
}

function arenasOfferedInFrame(frame: string): readonly string[] | undefined {
  let parsed: unknown;
  try {
    parsed = JSON.parse(frame);
  } catch {
    return undefined;
  }
  if (typeof parsed !== "object" || parsed === null || Reflect.get(parsed, "kind") !== "preRound") {
    return undefined;
  }

  const offered: unknown = Reflect.get(parsed, "builtInArenas");
  if (!Array.isArray(offered) || !offered.every(name => typeof name === "string")) {
    return undefined;
  }

  return offered.map(String);
}
