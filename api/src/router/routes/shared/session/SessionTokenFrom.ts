import {SESSION_COOKIE_NAME} from "@src/router/routes/shared/session/SessionCookieName";

/** The session token in a `Cookie` header, if there is one. */
export function sessionTokenFrom(cookieHeader: string | undefined): string | undefined {
  if (!cookieHeader) {
    return undefined;
  }

  for (const pair of cookieHeader.split(";")) {
    const separator = pair.indexOf("=");
    if (separator > 0 && pair.slice(0, separator).trim() === SESSION_COOKIE_NAME) {
      const token = pair.slice(separator + 1).trim();

      return token || undefined;
    }
  }

  return undefined;
}
