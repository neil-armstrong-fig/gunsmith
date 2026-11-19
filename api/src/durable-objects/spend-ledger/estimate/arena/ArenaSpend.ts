/**
 * What an arena request is expected to cost the global AI spend, in microdollars (a millionth of a dollar). A tunable (`docs/cost-and-budget.md`).
 * Unlike a weapon's, an arena's calls are not alike, so each is priced by its place in the pipeline's order (`ArenaOutcome.modelCalls`):
 * the first is moderation (about $0.00015, measured on Haiku 5.5 as a weapon rejection, whose prompt is the same shape), the second the
 * arena's generation (an estimate, not measured: 2,250 in and 1,500 out at Haiku 5.5 is about $0.00098) and the third the one repair
 * (an estimate: it re-sends the generation and about 300 tokens of faults, so about 4,000 in and 1,500 out, $0.00115). The Console's
 * usage page is the bill; this only guards the caps. `reservedMicrodollars` is held before the pipeline runs and must cover `mostCalls`
 * (moderation, generation and one repair) at those prices, so a burst cannot overshoot a cap. Re-tune all of it if arenas move to Sonnet.
 */
export const ARENA_SPEND = {
  moderationMicrodollars: 150,
  generationMicrodollars: 1_000,
  repairMicrodollars: 1_150,
  mostCalls: 3,
  reservedMicrodollars: 2_500,
} as const;
