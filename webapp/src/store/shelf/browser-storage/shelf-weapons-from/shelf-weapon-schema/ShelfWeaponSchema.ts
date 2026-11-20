import {weaponSchema} from "@src/store/shelf/browser-storage/shelf-weapons-from/shelf-weapon-schema/weapon-schema/WeaponSchema";
import {z} from "zod";

/** One saved weapon as the browser kept it: an id, the words it was made from, and a weapon (see `weaponSchema`). */
export const shelfWeaponSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  weapon: weaponSchema,
});
