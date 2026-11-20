import type {RememberedChoices} from "@src/store/pre-round-choices/types/RememberedChoices";
import {z} from "zod";

const persistedChoicesSchema = z.object({
  firstWeaponId: z.string(),
  secondWeaponId: z.string(),
  arenaId: z.string(),
});

/** The choices in what zustand's `persist` read back from the browser, which it hands over as `unknown`: all three ids, or nothing at all when what was kept is not that. */
export function rememberedChoicesOfPersisted(persisted: unknown): RememberedChoices | undefined {
  const parsed = persistedChoicesSchema.safeParse(persisted);
  if (!parsed.success) {
    return undefined;
  }

  return parsed.data;
}
