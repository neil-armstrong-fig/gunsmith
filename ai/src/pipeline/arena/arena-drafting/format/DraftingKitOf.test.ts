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
