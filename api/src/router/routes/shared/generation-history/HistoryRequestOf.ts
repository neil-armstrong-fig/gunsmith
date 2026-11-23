import {generationHistoryPrivacyCheck} from "@src/router/routes/shared/generation-history/privacy/GenerationHistoryPrivacyCheck";
import type {GenerationHistoryRequest} from "@src/router/routes/shared/generation-history/types/GenerationHistoryRequest";
import type {GenerationHistoryTarget} from "@src/router/routes/shared/generation-history/types/GenerationHistoryTarget";
import {sessionTokenFrom} from "@src/router/routes/shared/session/SessionTokenFrom";

export function historyRequestOf(
  request: Request,
  target: GenerationHistoryTarget,
): GenerationHistoryRequest | undefined {
  const privacyCheck = generationHistoryPrivacyCheck();
  if (!privacyCheck) return undefined;

  const token = sessionTokenFrom(request.headers.get("Cookie") ?? undefined);
  if (!token) return undefined;

  return {...target, privacyCheck, token, createdAt: new Date()};
}
