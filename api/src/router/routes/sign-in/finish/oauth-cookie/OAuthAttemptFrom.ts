import {OAUTH_COOKIE_NAME} from "@src/router/routes/sign-in/oauth/OAuthCookieName";
import type {OAuthAttempt} from "@src/router/routes/sign-in/oauth/types/OAuthAttempt";

/** The attempt a `Cookie` header carries, or nothing when it is absent, not ours or not an attempt (`unknown` until it is checked). */
export function oauthAttemptFrom(cookieHeader: string | undefined): OAuthAttempt | undefined {
  const value = valueOf(cookieHeader);
  if (!value) {
    return undefined;
  }

  try {
    const binary = atob(value.replaceAll("-", "+").replaceAll("_", "/"));
    const attempt: unknown = JSON.parse(
      new TextDecoder().decode(Uint8Array.from(binary, character => character.charCodeAt(0))),
    );

    return asAttempt(attempt);
  } catch {
    return undefined;
  }
}

function valueOf(cookieHeader: string | undefined): string | undefined {
  for (const pair of (cookieHeader ?? "").split(";")) {
    const separator = pair.indexOf("=");
    if (separator > 0 && pair.slice(0, separator).trim() === OAUTH_COOKIE_NAME) {
      return pair.slice(separator + 1).trim();
    }
  }

  return undefined;
}

function asAttempt(candidate: unknown): OAuthAttempt | undefined {
  if (typeof candidate !== "object" || candidate === null) {
    return undefined;
  }

  const {state, codeVerifier, returnTo} = candidate as Record<string, unknown>;
  if (typeof state !== "string" || typeof codeVerifier !== "string" || typeof returnTo !== "string") {
    return undefined;
  }

  return {state, codeVerifier, returnTo};
}
