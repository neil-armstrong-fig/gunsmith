/** Whether the page's query (`?mute=1`) asks for the game to start silent. Any other value, or none, leaves the sound on. */
export function mutedFromSearch(search: string): boolean {
  return new URLSearchParams(search).get("mute") === "1";
}
