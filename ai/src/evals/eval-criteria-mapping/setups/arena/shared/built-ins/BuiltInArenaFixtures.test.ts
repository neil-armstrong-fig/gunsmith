import {validateArenaDraft} from "@gunsmith/ai/pipeline/arena/check/validate/ValidateArenaDraft";
import {BUILT_IN_ARENA_FIXTURES} from "@evals/eval-criteria-mapping/setups/arena/shared/built-ins/BuiltInArenaFixtures";

it("gives only arenas that pass the checks a generated arena meets, as a built-in must", () => {
  for (const arena of BUILT_IN_ARENA_FIXTURES) {
    expect(validateArenaDraft(arena), arena.name).toEqual({ok: true, arena});
  }
});
