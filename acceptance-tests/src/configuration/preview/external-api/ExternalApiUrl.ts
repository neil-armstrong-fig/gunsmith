export function externalApiUrl(environment: NodeJS.ProcessEnv): string | undefined {
  const mode = environment["PREVIEW_API_MODE"];
  if (mode === "local") return undefined;

  if (mode !== undefined && mode !== "external") {
    throw new Error("PREVIEW_API_MODE must be local or external");
  }

  const address = environment["API_URL"];
  if (!address) {
    if (mode === "external") {
      throw new Error("API_URL is required for external preview acceptance");
    }

    return undefined;
  }

  const url = URL.parse(address);
  if (
    !url ||
    (url.protocol !== "http:" && url.protocol !== "https:") ||
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    url.username ||
    url.password
  ) {
    throw new Error("API_URL must be an absolute HTTP(S) origin");
  }

  return url.origin;
}
