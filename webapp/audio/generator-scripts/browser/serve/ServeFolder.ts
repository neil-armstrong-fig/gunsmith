import {readFile} from "node:fs/promises";
import {createServer} from "node:http";
import type {AddressInfo} from "node:net";
import {mimeType} from "@gunsmith/audio-studies/browser/serve/mime/MimeType";
import {servedPath} from "@gunsmith/audio-studies/browser/serve/path/ServedPath";
import type {ServedAnswer} from "@gunsmith/audio-studies/browser/serve/types/ServedAnswer";
import type {ServedFolder} from "@gunsmith/audio-studies/browser/serve/types/ServedFolder";

/**
 * Serves the allowed folders of `root` over HTTP on this machine only, on a port the system picks, so a browser can fetch the
 * page and the exports it checks. Nothing else under `root` is reachable, and a request for it is a 404.
 */
export async function serveFolder(root: string, allowed: readonly string[]): Promise<ServedFolder> {
  const server = createServer((request, response) => {
    void answer(root, allowed, request.url ?? "/").then(({status, type, body}) => {
      response.writeHead(status, {"content-type": type});
      response.end(body);
    });
  });
  await new Promise<void>(listening => server.listen(0, "127.0.0.1", listening));
  const {port} = server.address() as AddressInfo;

  return {
    url: `http://127.0.0.1:${port}`,
    close: () => new Promise<void>(closed => server.close(() => closed())),
  };
}

async function answer(root: string, allowed: readonly string[], address: string): Promise<ServedAnswer> {
  const file = servedPath(root, address, allowed);
  if (file === undefined) {
    return {status: 404, type: "text/plain", body: "Not found"};
  }
  try {
    return {status: 200, type: mimeType(file), body: await readFile(file)};
  } catch {
    return {status: 404, type: "text/plain", body: "Not found"};
  }
}
