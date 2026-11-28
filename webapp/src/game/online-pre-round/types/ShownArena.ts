/** An arena as the server lets this page know it: its name and, when it is not a built-in the page has, its drawing. */
export interface ShownArena {
  name: string;
  rows: readonly string[] | undefined;
}
