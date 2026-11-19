import {SHELF_LIMITS} from "@src/router/routes/library/limits/ShelfLimits";
import {listShelf} from "@src/router/routes/library/list-shelf/ListShelf";
import {keepAndSaveItem} from "@src/router/routes/library/testing/KeepAndSaveItem";
import type {ShelfAnswer} from "@src/router/routes/library/types/ShelfAnswer";
import {keepItem} from "@src/router/routes/library/testing/KeepItem";

const FIRST = new Date("2026-11-19T12:00:00Z");
const SECOND = new Date("2026-11-19T13:00:00Z");

it("answers the limits and an empty shelf for an account that has saved nothing", async () => {
  const response = await listShelf("acct-1");

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({limits: SHELF_LIMITS, weapons: [], arenas: []});
});

it("lists weapons with their drawing and arenas apart, each with its prompt and the time it was saved", async () => {
  await keepAndSaveItem({accountId: "acct-1", id: "weapon-1", kind: "weapon", savedAt: FIRST});
  await keepAndSaveItem({accountId: "acct-1", id: "arena-1", kind: "arena", savedAt: SECOND});

  const answer = await (await listShelf("acct-1")).json();

  expect(answer).toEqual({
    limits: SHELF_LIMITS,
    weapons: [
      {
        id: "weapon-1",
        prompt: "prompt of weapon-1",
        savedAt: FIRST.toISOString(),
        weapon: {name: "weapon-1"},
        appearance: {shapes: ["weapon-1"]},
      },
    ],
    arenas: [{id: "arena-1", prompt: "prompt of arena-1", savedAt: SECOND.toISOString(), arena: {rows: ["arena-1"]}}],
  });
});

it("lists items in the order they were saved", async () => {
  await keepAndSaveItem({accountId: "acct-1", id: "weapon-b", kind: "weapon", savedAt: FIRST});
  await keepAndSaveItem({accountId: "acct-1", id: "weapon-a", kind: "weapon", savedAt: SECOND});

  const answer = (await (await listShelf("acct-1")).json()) as ShelfAnswer;

  expect(answer.weapons.map(item => item.id)).toEqual(["weapon-b", "weapon-a"]);
});

it("leaves out items that were kept but not saved, and other accounts' items", async () => {
  await keepItem("acct-1", "weapon-unsaved", "weapon");
  await keepAndSaveItem({accountId: "acct-2", id: "weapon-theirs", kind: "weapon", savedAt: FIRST});

  const answer = await (await listShelf("acct-1")).json();

  expect(answer).toEqual({limits: SHELF_LIMITS, weapons: [], arenas: []});
});
