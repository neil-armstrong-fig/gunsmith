import {requiredEnvironment} from "@src/secrets/required-environment/RequiredEnvironment";

export const secrets = requiredEnvironment(process.env, [
  "CLOUDFLARE_ACCOUNT_ID",
  "CLOUDFLARE_API_TOKEN",
  "ALCHEMY_PASSWORD",
  "ALCHEMY_STATE_TOKEN",
  "GOOGLE_OAUTH_CLIENT_ID",
  "GOOGLE_OAUTH_CLIENT_SECRET",
  "ALERT_TO_ADDRESS",
]);
