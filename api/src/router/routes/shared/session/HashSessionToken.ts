/** The SHA-256 of a session token in hex: the only form of it the database ever holds, so a leaked table cannot be replayed as cookies. */
export async function hashSessionToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));

  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}
