/** The friend code of the room the page was opened for (`?room=<code>`), or `undefined` for any other page, and outside a browser. */
export function roomOfPage(): string | undefined {
  if (typeof location === "undefined") {
    return undefined;
  }

  return new URLSearchParams(location.search).get("room") || undefined;
}
