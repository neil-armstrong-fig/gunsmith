import {resolve, sep} from "node:path";

/**
 * The file an address means, or `undefined` when it must not be served. An address is served only when the file it finally
 * names, once dots and encoded slashes are resolved, is inside one of the allowed folders of `root`.
 */
export function servedPath(root: string, address: string, allowed: readonly string[]): string | undefined {
  const requested = requestedPath(address);
  if (requested === undefined) {
    return undefined;
  }
  const file = resolve(root, `.${requested}`);
  const inside = allowed.some(folder => file.startsWith(`${resolve(root, `.${folder}`)}${sep}`));
  if (!inside) {
    return undefined;
  }

  return file;
}

function requestedPath(address: string): string | undefined {
  try {
    return decodeURIComponent(new URL(address, "http://localhost").pathname);
  } catch {
    return undefined;
  }
}
