/**
 * Whether the dim veil over what the player does not see is drawn, as the page's query asks: always, unless `?fog=off`, which a
 * spec photographing the terrain's pictures uses so the edge rule's fog does not darken what it checks. Sight is unchanged: only
 * the veil is left out, and the fighters, shots and weapon the player cannot see are still hidden.
 */
export function fogShownFromSearch(search: string): boolean {
  return new URLSearchParams(search).get("fog") !== "off";
}
