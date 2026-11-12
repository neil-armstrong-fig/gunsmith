// DRAFT, local to `ai/` until `build` freezes the real weapon contract in `HANDOFF.md`.
export const weaponOutcomeStatuses = ["created", "rejected"] as const;
export type WeaponOutcomeStatus = (typeof weaponOutcomeStatuses)[number];

export interface WeaponOutcome {
  status: WeaponOutcomeStatus;
  // `unknown` on purpose: whoever reads a weapon (the game, an evaluator) parses it again rather than trusting the type.
  weapon?: unknown;
  // Why a request was rejected, in words a player may see.
  reason?: string;
  // Model calls made, so a test can prove a rejection cost nothing (or one call).
  modelCalls: number;
}
