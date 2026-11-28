import {GENERATION_PROMPT} from "@gunsmith/ai/pipeline/weapon/drafting/generate/prompts/GenerationPrompt";

it("asks for the vision cone and its range, each with the numbers the schema holds it to", () => {
  const lines = GENERATION_PROMPT.split("\n");

  expect(lines.find(line => line.startsWith("- visionDegrees:"))).toContain("50 to 130");
  expect(lines.find(line => line.startsWith("- visionRange:"))).toContain("6 to 20");
});

it("tells the model what each vision stat in a preference means, because the names are not the fields' own", () => {
  const preference = GENERATION_PROMPT.split("\n").find(line => line.startsWith("- preference:"));

  expect(preference).toContain("visionCone, visionRange");
  expect(preference).toContain("visionCone is visionDegrees");
  expect(preference).toContain("visionRange is visionRange");
});

it("says why range matters beyond sight: a shot cannot go where the holder cannot see", () => {
  expect(GENERATION_PROMPT).toMatch(/limits how far a shot can reach/);
});
