import type {Arena} from "@gunsmith/engine/arena/types/Arena";

export interface WorkshopArena {
  arena: Arena;
  name: string;
  rows: readonly string[];
  madeFromPrompt?: string;
  accountItemId?: string;
}
