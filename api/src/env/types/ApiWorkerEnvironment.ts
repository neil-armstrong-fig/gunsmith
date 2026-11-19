import type {CreditLedger} from "@src/durable-objects/credit-ledger/CreditLedger";
import type {SpendLedger} from "@src/durable-objects/spend-ledger/SpendLedger";
import type {SignInSettings} from "@src/router/routes/sign-in/types/SignInSettings";

/**
 * Everything the Worker is given, which code reads as `workerEnvironment` (`env/WorkerEnvironment`): one `Match` Durable Object per
 * friend code, one `CreditLedger` per account (named by the internal account id) and the one `SpendLedger` (named "spend"), which emails
 * its budget alerts through `ALERT_MAIL` from `ALERT_FROM_ADDRESS` to `ALERT_TO_ADDRESS` (a secret: set with `wrangler secret put`,
 * never in git; unset, no alert is sent); the D1 database; the sign-in settings (`SignInSettings`: `ALLOWED_ORIGINS`,
 * `ALLOW_LOOPBACK_ORIGINS`, `LOGIN_LIMITER`, `GOOGLE_REDIRECT_URI`); and Google's OAuth client, both secrets (`wrangler secret put`, or
 * the root `.env.local` locally, passed by `pnpm api:dev`): unset, Google sign-in is off and every attempt returns signed out.
 * (`wrangler.jsonc` declares them; `infra/` will too.)
 */
export interface ApiWorkerEnvironment extends SignInSettings {
  MATCHES: DurableObjectNamespace;
  CREDITS: DurableObjectNamespace<CreditLedger>;
  SPEND: DurableObjectNamespace<SpendLedger>;
  ALERT_MAIL: SendEmail;
  ALERT_FROM_ADDRESS: string;
  ALERT_TO_ADDRESS?: string;
  DB: D1Database;
  GOOGLE_OAUTH_CLIENT_ID?: string;
  GOOGLE_OAUTH_CLIENT_SECRET?: string;
}
