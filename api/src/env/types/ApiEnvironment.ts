import type {CreditLedger} from "@src/ai/credits/CreditLedger";
import type {SpendLedger} from "@src/ai/spend/SpendLedger";

/**
 * The bindings the Worker is given: one `Match` Durable Object per friend code, one `CreditLedger` per account (named by the internal
 * account id) and the one `SpendLedger` (named "spend"). (`wrangler.jsonc` declares them; `infra/` will too.)
 */
export interface ApiEnvironment {
  MATCHES: DurableObjectNamespace;
  CREDITS: DurableObjectNamespace<CreditLedger>;
  SPEND: DurableObjectNamespace<SpendLedger>;
}
