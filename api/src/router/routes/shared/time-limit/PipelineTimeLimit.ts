/**
 * How long a generation route waits for its pipeline before it gives up on it (a tunable). A weapon with its drawing has taken 5.9 s
 * at the median and 8.3 s at the worst on one machine; arenas and the Worker are unmeasured, so this is a guess well above the worst
 * case seen, to be set from real durations (`docs/cost-and-budget.md`). It stops the route waiting and aborts the signal the pipeline was
 * handed, so the model call in flight is told to stop (`withTimeLimit`).
 */
export const PIPELINE_TIME_LIMIT_MILLISECONDS = 30_000;
