import {EDIT_BASES} from "@gunsmith/ai/pipeline/arena/drafting/format/edit-built-in/bases/EditBases";

it("offers three built-in arenas, a plain room, one raised level and two raised levels, each found in engine's pool", () => {
  expect(EDIT_BASES.map(base => base.arena.name)).toEqual(["Duel", "Fair duel", "Ziggurat"]);
});

it("describes every base it offers, so the prompt says what each one is", () => {
  expect(EDIT_BASES.filter(base => base.description.trim() === "")).toEqual([]);
});
