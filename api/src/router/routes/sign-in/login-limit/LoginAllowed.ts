/**
 * Whether this address may start or finish a sign-in now (the `LOGIN_LIMITER` binding: ten a minute). Keyed by the address
 * Cloudflare saw. **A failing limiter lets the request through**: it is a brake on scripts, not a gate for players.
 */
export async function loginAllowed(limiter: RateLimit, request: Request): Promise<boolean> {
  try {
    const outcome = await limiter.limit({key: request.headers.get("CF-Connecting-IP") ?? "unknown"});

    return outcome.success;
  } catch {
    return true;
  }
}
