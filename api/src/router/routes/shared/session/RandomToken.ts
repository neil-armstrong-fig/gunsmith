const TOKEN_BYTES = 32;

/** 256 random bits as unpadded base64url: a session token, an OAuth `state` or a PKCE verifier. */
export function randomToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(TOKEN_BYTES));

  return btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}
