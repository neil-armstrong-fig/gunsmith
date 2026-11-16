/**
 * The seconds a query parameter asks for: a plain number such as `3` or `1.5`, nothing more (no sign, no exponent), or
 * nothing when the parameter is missing or is anything else.
 */
export function secondsFromParameter(search: string, name: string): number | undefined {
  const asked = new URLSearchParams(search).get(name);
  if (asked === null || !/^\d+(\.\d+)?$/.test(asked)) {
    return undefined;
  }

  return Number(asked);
}
