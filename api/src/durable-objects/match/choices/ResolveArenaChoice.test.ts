import {resolveArenaChoice} from "@src/durable-objects/match/choices/ResolveArenaChoice";

it("takes a built-in arena by name, for a guest and for a signed-in player alike", async () => {
  expect(await resolveArenaChoice(undefined, {kind: "builtIn", name: "Duel"})).toEqual({kind: "builtIn", name: "Duel"});
  expect(await resolveArenaChoice("acct-1", {kind: "builtIn", name: "Duel"})).toEqual({kind: "builtIn", name: "Duel"});
});

it("refuses a saved arena for a guest: a guest has no library", async () => {
  expect(await resolveArenaChoice(undefined, {kind: "saved", id: "arena-1"})).toBeUndefined();
});
