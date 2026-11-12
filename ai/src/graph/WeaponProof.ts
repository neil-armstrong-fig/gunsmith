import {z} from "zod";

export const weaponProofSchema = z.object({
  name: z.string().min(1).max(40),
  damage: z.number().int().min(1).max(100),
  rateOfFire: z.number().min(0.1).max(20),
});

export type WeaponProof = z.infer<typeof weaponProofSchema>;
