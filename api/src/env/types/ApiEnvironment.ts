import type {CreditLedger} from "@src/durable-objects/credit-ledger/CreditLedger";
import type {SpendLedger} from "@src/durable-objects/spend-ledger/SpendLedger";

/**
 * The bindings the Worker is given: one `Match` Durable Object per friend code, one `CreditLedger` per account (named by the internal
 * account id) and the one `SpendLedger` (named "spend"), which emails its budget alerts through `ALERT_MAIL` from `ALERT_FROM_ADDRESS`
 * to `ALERT_TO_ADDRESS`. That last one is a secret (set with `wrangler secret put`, never in git); unset, no alert is sent.
 * (`wrangler.jsonc` declares them; `infra/` will too.)
 */
export interface ApiEnvironment {
  MATCHES: DurableObjectNamespace;
  CREDITS: DurableObjectNamespace<CreditLedger>;
  SPEND: DurableObjectNamespace<SpendLedger>;
  ALERT_MAIL: SendEmail;
  ALERT_FROM_ADDRESS: string;
  ALERT_TO_ADDRESS?: string;
}
