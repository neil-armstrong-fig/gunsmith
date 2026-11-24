import {eraseExpiredGenerationAttempts} from "@src/account-retention/EraseExpiredGenerationAttempts";
import {eraseExpiredCredits} from "@src/account-retention/EraseExpiredCredits";
import type {ApiWorkerEnvironment} from "@src/env/types/ApiWorkerEnvironment";
import {handleApiRequest} from "@src/router/HandleApiRequest";

/** The Worker's front door: wiring only, so it is not unit tested. What it answers is `router/HandleApiRequest`. */
export default {
  async fetch(request: Request): Promise<Response> {
    return await handleApiRequest(request);
  },
  async scheduled(controller): Promise<void> {
    const now = new Date(controller.scheduledTime);
    await Promise.all([eraseExpiredCredits(now), eraseExpiredGenerationAttempts(now)]);
  },
} satisfies ExportedHandler<ApiWorkerEnvironment>;

// The Durable Object class the Workers runtime looks for beside the default export (`wrangler.jsonc` names it).
export {Match} from "@src/durable-objects/match/Match";
export {CreditLedger} from "@src/durable-objects/credit-ledger/CreditLedger";
export {SpendLedger} from "@src/durable-objects/spend-ledger/SpendLedger";
