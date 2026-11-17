import {passingAppearance} from "@gunsmith/ai/pipeline/appearance/testing/PassingAppearance";
import {ToolCallingFakeModel} from "@gunsmith/ai/pipeline/appearance/testing/ToolCallingFakeModel";
import {weaponGraphStateOf} from "@gunsmith/ai/pipeline/weapon-graph/testing/WeaponGraphStateOf";
import {appearanceNode} from "@gunsmith/ai/pipeline/weapon-graph/drawing/AppearanceNode";

it("draws the weapon, adds the drawing's own steps under an appearance prefix and counts its model calls", async () => {
  const appearanceGenerator = new ToolCallingFakeModel({answers: [passingAppearance()]});

  const update = await appearanceNode(weaponGraphStateOf({prompt: "a rubber duck cannon"}), appearanceGenerator);

  expect(update.appearance?.status).toBe("valid");
  expect(update.nodes).toEqual(["appearance.generate", "appearance.fix", "appearance.validate"]);
  expect(update.modelCalls).toBe(1);
});

it("draws from the player's own words and from nothing in the weapon", async () => {
  const appearanceGenerator = new ToolCallingFakeModel({answers: [passingAppearance()]});
  const invoke = vi.spyOn(appearanceGenerator, "invoke");

  await appearanceNode(weaponGraphStateOf({prompt: "a rubber duck cannon"}), appearanceGenerator);

  const sent = (invoke.mock.calls[0]?.[0] as {content: unknown}[]).map(message => String(message.content));
  expect(sent.join("\n")).toContain("a rubber duck cannon");
});
