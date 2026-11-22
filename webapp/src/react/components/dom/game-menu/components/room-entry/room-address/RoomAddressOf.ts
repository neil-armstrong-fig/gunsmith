/** The address of the room `code` names, keeping the page's own query (`search`, as `location.search` gives it), which tunes the room it reaches. */
export function roomAddressOf(code: string, search: string): string {
  const query = new URLSearchParams(search);
  query.set("room", code);

  return `/?${query.toString()}`;
}
