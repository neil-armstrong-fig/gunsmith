/**
 * One saved item as the page is told of it: its id, the prompt that made it, when it was saved (ISO) and its result as the server kept
 * it. A weapon carries `weapon` and its `appearance`, an arena its `arena`; all `unknown` until ai freezes one parsed shape.
 */
export interface ShelfItemAnswer {
  id: string;
  prompt: string;
  savedAt: string;
  weapon?: unknown;
  appearance?: unknown;
  arena?: unknown;
}
