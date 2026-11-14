import assert from "node:assert/strict";
import {mkdir, mkdtemp, rm, writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {after, before, it} from "node:test";
import {serveFolder} from "@gunsmith/audio-studies/browser/serve/ServeFolder";
import type {ServedFolder} from "@gunsmith/audio-studies/browser/serve/types/ServedFolder";

let folder = "";
let served: ServedFolder | undefined;

before(async () => {
  folder = await mkdtemp(join(tmpdir(), "gunsmith-serve-"));
  await mkdir(join(folder, "public"));
  await writeFile(join(folder, "public", "a.json"), '{"a":1}');
  await writeFile(join(folder, "secret.json"), "secret");
  served = await serveFolder(folder, ["/public/"]);
});

after(async () => {
  await served?.close();
  await rm(folder, {recursive: true, force: true});
});

function address(path: string): string {
  assert.ok(served, "the folder is being served");

  return `${served.url}${path}`;
}

it("serves a file in an allowed folder, with its type, on a port of the system's choosing", async () => {
  const response = await fetch(address("/public/a.json"));

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "application/json");
  assert.equal(await response.text(), '{"a":1}');
  assert.match(address(""), /^http:\/\/127\.0\.0\.1:\d+$/);
});

it("answers 404 for a file that is not there, and for one outside the allowed folders", async () => {
  assert.equal((await fetch(address("/public/missing.json"))).status, 404);
  assert.equal((await fetch(address("/secret.json"))).status, 404);
});

it("answers 404 for an address that climbs out of the root", async () => {
  assert.equal((await fetch(address("/public/%2e%2e/secret.json"))).status, 404);
});

it("stops listening when it is closed", async () => {
  const other = await serveFolder(folder, ["/public/"]);
  await other.close();

  await assert.rejects(fetch(`${other.url}/public/a.json`));
});
