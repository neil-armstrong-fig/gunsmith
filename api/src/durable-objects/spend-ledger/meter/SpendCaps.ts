/** The global AI spend ceilings in microdollars (a millionth of a dollar): $1 a day, paused until 00:00 UTC, and $20 a month, the hard cap (`docs/cost-and-budget.md`). A tunable. */
export const SPEND_CAPS = {dailyMicrodollars: 1_000_000, monthlyMicrodollars: 20_000_000} as const;
