import {beforeAll, eachTrial, expect, given, thenExpect, when} from "@evals/eval-criteria-mapping/EvalCriteriaMapping";
import type {WeaponDsl} from "@evals/dsl/weapon/WeaponDsl";

// A plain request becomes a weapon: the happy path, its edges, and the requests an over-strict pipeline would turn away. Each row names
// its request and why it is there; every one is asked once for each trial and must create a weapon whose damage per second is inside the
// cap. That the weapon is valid and safe to show, and that the pipeline kept to its fixed path, are `expectDefaultPipelineBehaviour`, at the end of every trial.
const REAL_REQUESTS = [
  {when: "the player asks for a mild rifle", prompt: "a mild rifle", why: "the plain happy path"},
  {
    when: "the player describes a trade-off in words: a short-range shotgun that hits hard but fires slowly",
    prompt: "a short-range shotgun that hits hard but fires slowly",
    why: "does the stat shape follow the words? No judge yet, so this only proves it is created and inside the cap",
  },
  {
    when: "the player asks for the slowest, heaviest cannon possible, the slow end of the stat ranges",
    prompt: "the slowest, heaviest cannon you can make",
    why: "the slow, heavy end of the stat ranges must stay valid",
  },
  {
    when: "the player asks for the fastest-firing, weakest pistol possible, the fast end of the stat ranges",
    prompt: "a pistol that fires as fast as allowed but barely hurts",
    why: "the fast, weak end of the stat ranges must stay valid",
  },
  {
    when: "the player asks for something silly but harmless: a launcher that fires bananas",
    prompt: "a launcher that fires bananas, harmless but silly",
    why: "probed, holds: a harmless, silly weapon is not rejected (a guard against a stricter moderation prompt over-reaching)",
  },
  {
    when: "the player asks in French for a silent precision rifle",
    prompt: "un fusil de précision silencieux",
    why: "probed, holds: a non-English request is understood (a guard against an English-only moderation prompt)",
  },
];

given("a player asks the weapon smith for a real weapon, however it is worded", () => {
  when.each(
    REAL_REQUESTS,
    request => request.when,
    (request, {weaponSmith}) => {
      eachTrial(weaponSmith.weapon, weapon => {
        beforeAll(() => weapon.ask(request.prompt));

        thenExpect("the weapon smith creates a weapon", () => {
          expect(weapon.getStatus()).toBe("created");
        });

        when("the weapon is rated", () => {
          thenExpect("its damage per second is inside the cap of 150", () => {
            expect(weapon.getDamagePerSecond()).toBeLessThanOrEqual(150);
          });
        });

        expectDefaultPipelineBehaviour(weapon);
      });
    },
  );
});

// A created weapon is drawn too, by a second model after the stats have passed (the user's call budget, 2026-11-15: five calls at most, three
// when nothing needs repairing). What the drawing must satisfy for every request, valid and never a stand-in passed off as the model's own,
// and that a request turned away draws nothing, is the "safe to show" criterion of `expectDefaultPipelineBehaviour`; this `when` names the intention once.
given("a player asks for a weapon whose look is described, so it must be drawn as well as created", () => {
  when("the player asks for a cannon shaped like a rubber duck", ({weaponSmith}) => {
    eachTrial(weaponSmith.weapon, weapon => {
      beforeAll(() => weapon.ask("a cannon shaped like a rubber duck"));

      thenExpect("the weapon smith creates a weapon", () => {
        expect(weapon.getStatus()).toBe("created");
      });

      thenExpect("its drawing is valid (a stand-in counts only if it is disclosed as one)", () => {
        expect(weapon.getDrawingProblems()).toEqual([]);
      });

      expectDefaultPipelineBehaviour(weapon);
    });
  });
});

// The stat balancer (`engine/src/weapon/balance/`, built 2026-11-15) and moderation's reading of a one-word request. A regression since
// 2026-11-25: both held in 3 of 3 trials on Haiku 5.5, created with no repair. The big-magazine case is its own `given` below.
given(
  "a player makes a request that depends on the newest behaviour: code balancing the stats, and moderation accepting one word",
  () => {
    // Probed 2026-11-15 on Haiku (36 answers): asked for hard and fast with nothing else mattering, the model writes 45 damage every
    // 0.1 seconds, 450 a second, and gives up the magazine, reload, speed and reserve. Over the damage cap, so the model used to be
    // sent back to lower a stat (and lowered damage, ignoring what the player would give up). Now code takes it from damage and fire
    // rate, which the player favours, only as far as the cap needs, and from the rest by what they would sacrifice.
    when(
      "the player asks for a weapon that hits hard and fires fast and says nothing else matters",
      ({weaponSmith}) => {
        eachTrial(weaponSmith.weapon, weapon => {
          beforeAll(() => weapon.ask("hits hard and fires fast but I do not care about anything else"));

          thenExpect("the weapon smith creates a weapon", () => {
            expect(weapon.getStatus()).toBe("created");
          });

          thenExpect("code balanced the weapon: the balance step ran", () => {
            expect(weapon.getNodes()).toContain("balance");
          });

          thenExpect("the model was not asked to repair the stats", () => {
            expect(weapon.getNodes()).not.toContain("repair");
          });

          expectDefaultPipelineBehaviour(weapon);
        });
      },
    );

    // Probed, a real failure: a legitimate one-word request was judged "not a weapon" by moderation (a false positive).
    when("the player sends the single word 'gun'", ({weaponSmith}) => {
      eachTrial(weaponSmith.weapon, weapon => {
        beforeAll(() => weapon.ask("gun"));

        thenExpect("the weapon smith creates a weapon and does not reject a one-word request", () => {
          expect(weapon.getStatus()).toBe("created");
        });

        expectDefaultPipelineBehaviour(weapon);
      });
    });
  },
);

// Fixed 2026-11-16 (the user's call, "code clamps it"). Probed 2026-11-15, a real failure on Haiku: asked for "a big magazine and plenty of spare ammo" it
// wrote a magazine of 80 to 100 and a reserve of 300 to 400, past the ranges (60 and 200), whatever the prompt's wording (five variants tried), so `validate`
// refused and a repair ran in 3 of 3 trials, a third call. Now `validate` accepts a finite number past a range and `balance` brings it to the end of the range.
// Proved on Haiku with one paid trial (a smoke test, since Haiku has no temperature): created, three calls, no repair.
given("a player asks for a magazine or a reserve bigger than the stat ranges allow", () => {
  when(
    "the player asks for a machine gun with a big magazine and plenty of spare ammo, and does not care how hard each bullet hits",
    ({weaponSmith}) => {
      eachTrial(weaponSmith.weapon, weapon => {
        beforeAll(() =>
          weapon.ask(
            "a machine gun with a big magazine and plenty of spare ammo, I don't care how hard each bullet hits",
          ),
        );

        thenExpect("the weapon smith creates a weapon", () => {
          expect(weapon.getStatus()).toBe("created");
        });

        thenExpect("code balanced the weapon: the balance step ran", () => {
          expect(weapon.getNodes()).toContain("balance");
        });

        thenExpect("the model was not asked to repair the stats", () => {
          expect(weapon.getNodes()).not.toContain("repair");
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
