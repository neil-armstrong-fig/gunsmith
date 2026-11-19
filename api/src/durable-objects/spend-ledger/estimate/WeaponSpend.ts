/**
 * What a weapon request is expected to cost the global AI spend, in microdollars (a millionth of a dollar). A tunable (`docs/cost-and-budget.md`).
 * `perCallMicrodollars` is an estimate: the Haiku 5.5 weapon evals measured about $0.00034 a model call (moderation, stats and the drawing
 * together, 1,050 µ$ for a created weapon), rounded up. The Console's usage page is the bill; this only guards the caps. `reservedMicrodollars`
 * is held before the pipeline runs and must cover `mostCalls` (the pipeline's five-call maximum) at that price, so a burst cannot overshoot a cap.
 */
export const WEAPON_SPEND = {perCallMicrodollars: 400, mostCalls: 5, reservedMicrodollars: 3_000} as const;
