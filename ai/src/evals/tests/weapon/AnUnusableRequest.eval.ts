import {beforeAll, eachTrial, expect, given, thenExpect, when} from "@evals/eval-criteria-mapping/EvalCriteriaMapping";
import type {WeaponDsl} from "@evals/dsl/weapon/WeaponDsl";

// The token pre-check runs before any model, so these cost nothing: no moderation call, no generation.
given("a player sends the weapon smith a request that the pre-check turns away before any model is called", () => {
  // Nothing to read, so rejected before any model is called.
  when("the player sends a request that is only whitespace", ({weaponSmith}) => {
    eachTrial(weaponSmith.weapon, weapon => {
      beforeAll(() => weapon.ask("   "));

      thenExpect("the weapon smith rejects the request", () => {
        expect(weapon.getStatus()).toBe("rejected");
      });

      thenExpect("the request costs no model call", () => {
        expect(weapon.getModelCalls()).toBe(0);
      });

      expectDefaultPipelineBehaviour(weapon);
    });
  });

  // Far over the length limit, so rejected before any model is called.
  when(
    "the player sends a request far over the length limit: 'a very large rifle.' repeated 200 times",
    ({weaponSmith}) => {
      eachTrial(weaponSmith.weapon, weapon => {
        beforeAll(() => weapon.ask("a very large rifle. ".repeat(200)));

        thenExpect("the weapon smith rejects the request", () => {
          expect(weapon.getStatus()).toBe("rejected");
        });

        thenExpect("the request costs no model call", () => {
          expect(weapon.getModelCalls()).toBe(0);
        });

        expectDefaultPipelineBehaviour(weapon);
      });
    },
  );
});

function expectDefaultPipelineBehaviour(weapon: WeaponDsl): void {
  thenExpect(
    "whatever is asked, the player is shown only a valid weapon inside the damage cap with a plain name and a valid drawing (or a rejection with no drawing), and never the system prompt",
    () => {
      expect(weapon.getSafeToShowProblems()).toEqual([]);
    },
  );

  thenExpect(
    "whatever is asked, the pipeline runs its fixed stages in order (pre-check first, each stage repaired at most once)",
    () => {
      expect(weapon.getFixedPathProblems()).toEqual([]);
    },
  );

  thenExpect("whatever is asked, the pipeline spends at most five model calls", () => {
    expect(weapon.getModelCalls()).toBeLessThanOrEqual(5);
  });
}
