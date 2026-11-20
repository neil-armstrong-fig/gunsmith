import {SHELF_LIMITS} from "@src/router/routes/library/limits/ShelfLimits";
import {saveToShelf} from "@src/router/routes/library/save/SaveToShelf";
import {listShelf} from "@src/router/routes/library/list-shelf/ListShelf";
import {keepAndSaveItem} from "@src/router/routes/library/testing/KeepAndSaveItem";
import type {ShelfAnswer} from "@src/router/routes/library/types/ShelfAnswer";
import {keepItem} from "@src/router/routes/library/testing/KeepItem";

it("puts a kept item on the shelf by its id", async () => {
  await keepItem("acct-1", "weapon-1", "weapon");

  const response = await saveToShelf("acct-1", post({id: "weapon-1"}));

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({status: "saved"});
  expect(await shelfIds("acct-1", "weapons")).toEqual(["weapon-1"]);
});

it("saves an item that is already on the shelf again without complaint or another place", async () => {
  await keepItem("acct-1", "arena-1", "arena");
  await saveToShelf("acct-1", post({id: "arena-1"}));

  const response = await saveToShelf("acct-1", post({id: "arena-1"}));

  expect(response.status).toBe(200);
  expect(await shelfIds("acct-1", "arenas")).toEqual(["arena-1"]);
});

it("takes nothing but the id from the caller: a weapon in the body is ignored and the kept one is shelved", async () => {
  await keepItem("acct-1", "weapon-1", "weapon");

  await saveToShelf(
    "acct-1",
    post({id: "weapon-1", kind: "arena", weapon: {name: "Forged", damage: 9999}, prompt: "forged"}),
  );

  const answer = (await (await listShelf("acct-1")).json()) as ShelfAnswer;
  expect(answer.arenas).toEqual([]);
  expect(answer.weapons).toEqual([
    expect.objectContaining({id: "weapon-1", prompt: "prompt of weapon-1", weapon: {name: "weapon-1"}}),
  ]);
});

it("answers 404 for an id nobody kept, and for another account's item, which stays unsaved", async () => {
  await keepItem("acct-2", "weapon-theirs", "weapon");

  const nobody = await saveToShelf("acct-1", post({id: "weapon-nobody"}));
  const theirs = await saveToShelf("acct-1", post({id: "weapon-theirs"}));

  expect(nobody.status).toBe(404);
  expect(await nobody.json()).toEqual({error: "not-found"});
  expect(theirs.status).toBe(404);
  expect(await shelfIds("acct-2", "weapons")).toEqual([]);
});

it("answers 409 shelf-full with the kind and its limit when the weapon space is used, and shelves nothing more", async () => {
  for (let index = 0; index < SHELF_LIMITS.weapons; index++) {
    await keepAndSaveItem({
      accountId: "acct-1",
      id: `weapon-${index}`,
      kind: "weapon",
      savedAt: new Date(2026, 10, 19, index),
    });
  }
  await keepItem("acct-1", "weapon-extra", "weapon");

  const response = await saveToShelf("acct-1", post({id: "weapon-extra"}));

  expect(response.status).toBe(409);
  expect(await response.json()).toEqual({error: "shelf-full", kind: "weapon", limit: SHELF_LIMITS.weapons});
  expect(await shelfIds("acct-1", "weapons")).toHaveLength(SHELF_LIMITS.weapons);
});

it("keeps arenas in a space of their own, with their own limit", async () => {
  for (let index = 0; index < SHELF_LIMITS.weapons; index++) {
    await keepAndSaveItem({
      accountId: "acct-1",
      id: `weapon-${index}`,
      kind: "weapon",
      savedAt: new Date(2026, 10, 19, index),
    });
  }
  for (let index = 0; index < SHELF_LIMITS.arenas; index++) {
    await keepItem("acct-1", `arena-${index}`, "arena");
    expect((await saveToShelf("acct-1", post({id: `arena-${index}`}))).status).toBe(200);
  }
  await keepItem("acct-1", "arena-extra", "arena");

  const response = await saveToShelf("acct-1", post({id: "arena-extra"}));

  expect(response.status).toBe(409);
  expect(await response.json()).toEqual({error: "shelf-full", kind: "arena", limit: SHELF_LIMITS.arenas});
});

it("does not count another account's shelf against this one", async () => {
  for (let index = 0; index < SHELF_LIMITS.arenas; index++) {
    await keepAndSaveItem({
      accountId: "acct-2",
      id: `arena-${index}`,
      kind: "arena",
      savedAt: new Date(2026, 10, 19, index),
    });
  }
  await keepItem("acct-1", "arena-mine", "arena");

  const response = await saveToShelf("acct-1", post({id: "arena-mine"}));

  expect(response.status).toBe(200);
});

it("answers 400 for a body that is not JSON, has no id or has an id that is not a text", async () => {
  for (const body of ["not json", "{}", "[]", "null", '{"id":7}', '{"id":""}', `{"id":"${"x".repeat(101)}"}`]) {
    const response = await saveToShelf(
      "acct-1",
      new Request("https://gunsmith.test/api/library", {method: "POST", body}),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({error: "bad-request"});
  }
});

function post(body: unknown): Request {
  return new Request("https://gunsmith.test/api/library", {method: "POST", body: JSON.stringify(body)});
}

async function shelfIds(accountId: string, section: "weapons" | "arenas"): Promise<string[]> {
  const answer = (await (await listShelf(accountId)).json()) as ShelfAnswer;

  return answer[section].map(item => item.id);
}
