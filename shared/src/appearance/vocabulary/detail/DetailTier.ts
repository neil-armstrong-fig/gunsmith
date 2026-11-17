/** Whether a part survives at 32 px: `structural` always, `fine` only when the body is drawn large (`art`'s proposal). */
export const DETAIL_TIERS = ["structural", "fine"] as const;

/** One detail tier, read off the list so the two cannot drift apart. */
export type DetailTier = (typeof DETAIL_TIERS)[number];
