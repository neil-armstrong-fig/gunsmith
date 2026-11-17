import {validateArenaDraft} from "@gunsmith/ai/pipeline/arena/check/validate/ValidateArenaDraft";
import {FAKE_ARENA_REPLY} from "@evals/eval-criteria-mapping/arena/models/fake/FakeArenaReply";

it("is an arena that passes every check, so the fake tier's clean path creates it", () => {
  expect(validateArenaDraft(FAKE_ARENA_REPLY)).toEqual({ok: true, arena: FAKE_ARENA_REPLY});
});
