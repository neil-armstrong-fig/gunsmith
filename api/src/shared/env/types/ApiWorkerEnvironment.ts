import type {CreditLedger} from "@src/durable-objects/credit-ledger/CreditLedger";
import type {SpendLedger} from "@src/durable-objects/spend-ledger/SpendLedger";
import type {SignInSettings} from "@src/router/routes/sign-in/types/SignInSettings";

/**
 * Everything the Worker is given, which code reads as `workerEnvironment` (`env/WorkerEnvironment`): one `Match` Durable Object per
 * friend code, one `CreditLedger` per account (named by the internal account id) and the one `SpendLedger` (named "spend"), which emails
 * its budget alerts through `ALERT_MAIL` from `ALERT_FROM_ADDRESS` to `ALERT_TO_ADDRESS` (a secret: set with `wrangler secret put`,
 * never in git; unset, no alert is sent); and two optional vars that can only lower its spend caps for the shutdown drill (`DAILY_SPEND_CAP_MICRODOLLARS`, `MONTHLY_SPEND_CAP_MICRODOLLARS`, `spend-ledger/caps/SpendCapsFrom`; unset, the approved $1 a day and $20 a month); the D1 database; the sign-in settings (`SignInSettings`: `ALLOWED_ORIGINS`,
 * `ALLOW_LOOPBACK_ORIGINS`, `LOGIN_LIMITER`, `GOOGLE_REDIRECT_URI`); and Google's OAuth client, both secrets (`wrangler secret put`, or
 * the root `.env.local` locally, passed by `pnpm api:dev`): unset, Google sign-in is off and every attempt returns signed out. `ACCOUNT_DIGEST_KEY` is a third secret: the key of the digest kept for a deleted account (`router/routes/shared/subject-digest/`); unset, `DELETE /api/account` answers 503 and removes nothing. `ANTHROPIC_API_KEY` is a fourth secret, the key of the Claude models the weapon and arena routes call (each route's `pipeline/` folder): **setting it is what lets a request cost money**; unset (or empty), both routes answer 503 `ai-unavailable` and take no credit.
 * `GENERATION_HISTORY_CAPTURE` is a var that is never declared: `"true"` keeps Make attempts, their prompts redacted, in private history
 * (`router/routes/shared/generation-history/privacy/`); unset, none is kept, which is how it stays until the privacy notice is live.
 * (`wrangler.jsonc` declares them; `infra/` will too.)
 */
export interface ApiWorkerEnvironment extends SignInSettings {
  MATCHES: DurableObjectNamespace;
  CREDITS: DurableObjectNamespace<CreditLedger>;
  SPEND: DurableObjectNamespace<SpendLedger>;
  ALERT_MAIL: SendEmail;
  ALERT_FROM_ADDRESS: string;
  ALERT_TO_ADDRESS?: string;
  DAILY_SPEND_CAP_MICRODOLLARS?: string;
  MONTHLY_SPEND_CAP_MICRODOLLARS?: string;
  DB: D1Database;
  GOOGLE_OAUTH_CLIENT_ID?: string;
  GOOGLE_OAUTH_CLIENT_SECRET?: string;
  ANTHROPIC_API_KEY?: string;
  ACCOUNT_DIGEST_KEY?: string;
  GENERATION_HISTORY_CAPTURE?: string;
}
