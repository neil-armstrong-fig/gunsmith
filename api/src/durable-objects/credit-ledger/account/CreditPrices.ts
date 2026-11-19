/** What each kind of request costs in credits (`docs/cost-and-budget.md`): a rejected prompt is half, reusing a saved item is free. A tunable. */
export const CREDIT_PRICES = {weapon: 1, arena: 1, edit: 1, rejected: 0.5, reuse: 0} as const;
