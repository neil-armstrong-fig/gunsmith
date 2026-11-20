export function siteOrigin(value = process.env["SITE_ORIGIN"] ?? "https://gunsmith.neilarmstrong.dev"): URL {
  const url = URL.parse(value);
  if (url?.protocol !== "https:" || (value !== url.origin && value !== `${url.origin}/`)) {
    throw new Error("SITE_ORIGIN must be an HTTPS origin.");
  }

  return url;
}
