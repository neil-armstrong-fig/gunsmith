import {z} from "zod";
import {BUILT_IN_ARENAS} from "@gunsmith/engine/built-in-arenas/BuiltInArenas";
import {draftingKitOf} from "@gunsmith/ai/pipeline/arena/arena-drafting/format/DraftingKitOf";

it("asks for rows with the rows prompt, and for shapes with the shapes prompt", () => {
  expect(draftingKitOf("rows").generationPrompt).toContain("rows: the arena drawn as a list of text rows");
  expect(draftingKitOf("shapes").generationPrompt).toContain("walls: a list of wall rectangles");
});

it("repairs in the format it generated in, with the same task and the refusal note added", () => {
  expect(draftingKitOf("rows").repairPrompt).toContain(draftingKitOf("rows").generationPrompt);
  expect(draftingKitOf("shapes").repairPrompt).toContain(draftingKitOf("shapes").generationPrompt);
  expect(draftingKitOf("shapes").repairPrompt).toContain("<problems>");
});

it("answers rows through a function with rows, and shapes through a function with a size", () => {
  expect(draftingKitOf("rows").replySchema.safeParse({rows: ["##"]}).success).toBe(true);
  expect(draftingKitOf("shapes").replySchema.safeParse({width: 10, walls: []}).success).toBe(true);
  expect(draftingKitOf("shapes").replySchema.safeParse({width: "ten"}).success).toBe(false);
});

it("reads a rows reply as the drawing it already is, and a shapes reply by drawing its shapes", () => {
  const rows = {name: "Plain Room", rows: ["###", "#.#", "###"]};

  expect(draftingKitOf("rows").read(rows)).toEqual({ok: true, drawing: rows});
  expect(draftingKitOf("shapes").read({name: "Plain Room", width: 10, height: 5})).toEqual({
    ok: true,
    drawing: {name: "Plain Room", rows: ["##########", "#........#", "#........#", "#........#", "##########"]},
  });
});

it("says what is wrong with a shapes reply it cannot read", () => {
  expect(draftingKitOf("shapes").read({name: "No Size"})).toEqual({
    ok: false,
    errors: [expect.stringMatching(/^width: /), expect.stringMatching(/^height: /)],
    reason: "invalid-draft",
  });
});

it("asks for an edit of a built-in arena, shows every built-in arena it may start from, and has the model keep to the fixed tiles", () => {
  const kit = draftingKitOf("editBuiltIn");

  for (const arena of BUILT_IN_ARENAS) {
    expect(kit.generationPrompt).toContain(`"${arena.name}"`);
    expect(kit.generationPrompt).toContain(arena.rows.join("\n"));
  }

  expect(kit.repairPrompt).toContain(kit.generationPrompt);
});

it("asks for shapes with a floor list for an arena whose outline is not a rectangle, through a function that has one", () => {
  const kit = draftingKitOf("shapes");

  expect(kit.generationPrompt).toContain("floor: a list of rectangles {x, y, width, height}");
  expect(kit.repairPrompt).toContain(kit.generationPrompt);
  expect(Object.keys(z.toJSONSchema(kit.replySchema).properties ?? {})).toContain("floor");
  expect(Object.keys(z.toJSONSchema(draftingKitOf("editBuiltIn").replySchema).properties ?? {})).not.toContain("floor");
});

it("reads a shapes reply with a floor list by walling everything outside it, and still refuses a stray field", () => {
  const read = draftingKitOf("shapes").read;

  expect(read({name: "Corner Room", width: 8, height: 5, floor: [{x: 1, y: 1, width: 3, height: 3}]})).toEqual({
    ok: true,
    drawing: {name: "Corner Room", rows: ["########", "#...####", "#...####", "#...####", "########"]},
  });
  expect(read({name: "Odd Room", width: 8, height: 5, doors: []})).toMatchObject({ok: false, reason: "invalid-draft"});
  expect(read({name: "Odd Room", width: 8, height: 5, floor: [{x: 1, y: 1, width: "three", height: 3}]})).toEqual({
    ok: false,
    errors: [expect.stringMatching(/^floor/)],
    reason: "invalid-draft",
  });
});
