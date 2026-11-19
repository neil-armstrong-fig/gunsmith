/** A 302 to `address`, setting each cookie given (each its own `Set-Cookie`, since they cannot share one header). */
export function respondRedirect(address: string, cookies: readonly string[] = []): Response {
  const headers = new Headers({Location: address});
  for (const cookie of cookies) {
    headers.append("Set-Cookie", cookie);
  }

  return new Response(null, {status: 302, headers});
}
