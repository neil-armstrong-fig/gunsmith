import {isWeaponPipelineAvailable} from "@src/router/routes/weapons/pipeline/IsWeaponPipelineAvailable";
import {runWeaponPipeline} from "@src/router/routes/weapons/pipeline/RunWeaponPipeline";

vi.unmock("@src/router/routes/weapons/pipeline/IsWeaponPipelineAvailable");
vi.unmock("@src/router/routes/weapons/pipeline/RunWeaponPipeline");

it("has no production weapon pipeline until one is wired and a paid call is authorised", async () => {
  expect(isWeaponPipelineAvailable()).toBe(false);
  await expect(runWeaponPipeline("a rifle")).rejects.toThrow();
});
