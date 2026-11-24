export function accountUrl(path: string): string {
  const {origin} = window.location;
  if (origin === "https://gunsmith.neilarmstrong.dev") {
    return new URL(path, "https://gunsmith-api.neilarmstrong.dev").href;
  }

  return new URL(path, origin).href;
}
