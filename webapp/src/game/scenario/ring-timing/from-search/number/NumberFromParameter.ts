/**
 * The number a query parameter asks for (seconds, or a multiple): a plain number such as `3` or `1.5`, nothing more (no sign, no exponent), or
 * nothing when the parameter is missing or is anything else.
 */
export function numberFromParameter(search: string, name: string): number | undefined {
  const asked = new URLSearchParams(search).get(name);
  if (asked === null || !/^\d+(\.\d+)?$/.test(asked)) {
    return undefined;
  }

  return Number(asked);
}
