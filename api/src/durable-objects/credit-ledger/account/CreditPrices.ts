/**
 * What each kind of request costs in credits (`docs/cost-and-budget.md`, "Credit rules"): a rejected prompt is half, and so is a request
 * that reached the model and gave nothing usable (`unusable`: a built-in arena is given instead, or no valid weapon came out), because the
 * model was billed for it; reusing a saved item is free. A request turned away before any model call is refunded, not priced. A tunable.
 */
export const CREDIT_PRICES = {weapon: 1, arena: 1, edit: 1, rejected: 0.5, unusable: 0.5, reuse: 0} as const;
