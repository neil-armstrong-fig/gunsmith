import {z} from "zod";

/** The weapon's shape and limits. DRAFT, local to `ai/` until `build` freezes the real contract in `HANDOFF.md`. */
export const weaponProofSchema = z.object({
  name: z.string().min(1).max(40),
  damage: z.number().int().min(1).max(100),
  rateOfFire: z.number().min(0.1).max(20),
});

/** The weapon, read off its schema so the two cannot drift apart. */
export type WeaponProof = z.infer<typeof weaponProofSchema>;
