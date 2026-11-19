import {generateArenaDraft} from "@gunsmith/ai/pipeline/arena/arena-drafting/generate/GenerateArenaDraft";
import {repairArenaDraft} from "@gunsmith/ai/pipeline/arena/arena-drafting/repair/RepairArenaDraft";
import {validateArenaDraft} from "@gunsmith/ai/pipeline/arena/check/validate/ValidateArenaDraft";
import {ArenaGenerationFakeModel} from "@evals/eval-criteria-mapping/setups/arena/fake/models/ArenaGenerationFakeModel";
import {FAKE_ARENA_REPLY} from "@evals/eval-criteria-mapping/setups/arena/fake/models/reply/FakeArenaReply";

const UNPLAYABLE_REQUEST = "an arena cut in two by a wall nobody can cross";
const COVER_REQUEST = "an arena with low cover blocks to crouch behind";

it("draws the canned valid arena for an ordinary request", async () => {
  const draft = await generateArenaDraft("an open arena with pillars", new ArenaGenerationFakeModel());

  expect(draft).toEqual(FAKE_ARENA_REPLY);
});

it("draws an arena with low cover blocks for the one request that asks for cover, and the validator accepts it", async () => {
  const draft = await generateArenaDraft(COVER_REQUEST, new ArenaGenerationFakeModel());

  expect(validateArenaDraft(draft)).toMatchObject({
    ok: true,
    arena: {rows: expect.arrayContaining([expect.stringContaining("c")])},
  });
});

it("draws an arena the validator refuses for the one request it gets wrong", async () => {
  const draft = await generateArenaDraft(UNPLAYABLE_REQUEST, new ArenaGenerationFakeModel());

  expect(validateArenaDraft(draft).ok).toBe(false);
});

it("draws the same unplayable arena again when asked to repair it", async () => {
  const model = new ArenaGenerationFakeModel();
  const first = await generateArenaDraft(UNPLAYABLE_REQUEST, model);

  const second = await repairArenaDraft({prompt: UNPLAYABLE_REQUEST, previous: first, errors: ["cut in two"]}, model);

  expect(second).toEqual(first);
});
