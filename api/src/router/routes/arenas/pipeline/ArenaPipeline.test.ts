import {isArenaPipelineAvailable} from "@src/router/routes/arenas/pipeline/IsArenaPipelineAvailable";
import {runArenaPipeline} from "@src/router/routes/arenas/pipeline/RunArenaPipeline";

vi.unmock("@src/router/routes/arenas/pipeline/IsArenaPipelineAvailable");
vi.unmock("@src/router/routes/arenas/pipeline/RunArenaPipeline");

it("has no production arena pipeline until one is wired and a paid call is authorised", async () => {
  expect(isArenaPipelineAvailable()).toBe(false);
  await expect(runArenaPipeline("a maze")).rejects.toThrow();
});
