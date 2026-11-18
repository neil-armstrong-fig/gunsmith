import {mkdir, mkdtemp, rm, writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {afterAll, assert, beforeAll, expect, it} from "vitest";
import {serveFolder} from "@gunsmith/audio-studies/browser/serve/ServeFolder";
import type {ServedFolder} from "@gunsmith/audio-studies/browser/serve/types/ServedFolder";

let folder = "";
let served: ServedFolder | undefined;

beforeAll(async () => {
  folder = await mkdtemp(join(tmpdir(), "gunsmith-serve-"));
  await mkdir(join(folder, "public"));
  await writeFile(join(folder, "public", "a.json"), '{"a":1}');
  await writeFile(join(folder, "secret.json"), "secret");
  served = await serveFolder(folder, ["/public/"]);
});

afterAll(async () => {
  await served?.close();
  await rm(folder, {recursive: true, force: true});
});

it("serves a file in an allowed folder, with its type, on a port of the system's choosing", async () => {
  const response = await fetch(address("/public/a.json"));

  expect(response.status).toBe(200);
  expect(response.headers.get("content-type")).toBe("application/json");
  expect(await response.text()).toBe('{"a":1}');
  expect(address("")).toMatch(/^http:\/\/127\.0\.0\.1:\d+$/);
});

it("answers 404 for a file that is not there, and for one outside the allowed folders", async () => {
  expect((await fetch(address("/public/missing.json"))).status).toBe(404);
  expect((await fetch(address("/secret.json"))).status).toBe(404);
});

it("answers 404 for an address that climbs out of the root", async () => {
  expect((await fetch(address("/public/%2e%2e/secret.json"))).status).toBe(404);
});

it("stops listening when it is closed", async () => {
  const other = await serveFolder(folder, ["/public/"]);
  await other.close();

  await expect(fetch(`${other.url}/public/a.json`)).rejects.toThrow();
});

function address(path: string): string {
  assert(served, "the folder is being served");

  return `${served.url}${path}`;
}
