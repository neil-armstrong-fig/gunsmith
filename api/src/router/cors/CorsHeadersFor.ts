import {workerEnvironment} from "@src/shared/env/WorkerEnvironment";
import {isTrustedOrigin} from "@src/router/routes/shared/origin/IsTrustedOrigin";

export function corsHeadersFor(request: Request): Headers {
  const headers = new Headers({Vary: "Origin"});
  const origin = request.headers.get("Origin") ?? undefined;
  if (!origin || !isTrustedOrigin(origin, workerEnvironment)) {
    return headers;
  }

  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Access-Control-Allow-Credentials", "true");
  if (request.method === "OPTIONS") {
    headers.set("Access-Control-Allow-Methods", "GET, POST, DELETE");
    headers.set("Access-Control-Allow-Headers", "Content-Type");
    headers.set("Access-Control-Max-Age", "7200");
  }

  return headers;
}
