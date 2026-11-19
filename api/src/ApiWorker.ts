import type {ApiEnvironment} from "@src/env/types/ApiEnvironment";
import {handleApiRequest} from "@src/router/HandleApiRequest";

/** The Worker's front door: wiring only, so it is not unit tested. What it answers is `router/HandleApiRequest`. */
export default {
  async fetch(request: Request, env: ApiEnvironment): Promise<Response> {
    return await handleApiRequest(request, env);
  },
} satisfies ExportedHandler<ApiEnvironment>;

// The Durable Object class the Workers runtime looks for beside the default export (`wrangler.jsonc` names it).
export {Match} from "@src/durable-objects/match/Match";
export {CreditLedger} from "@src/durable-objects/credit-ledger/CreditLedger";
export {SpendLedger} from "@src/durable-objects/spend-ledger/SpendLedger";
