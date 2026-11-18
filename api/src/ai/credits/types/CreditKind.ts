import type {CREDIT_PRICES} from "@src/ai/credits/account/CreditPrices";

/** What a request is: a weapon, an arena or an edit made; a prompt rejected; or a saved item reused. Read off the price list. */
export type CreditKind = keyof typeof CREDIT_PRICES;
