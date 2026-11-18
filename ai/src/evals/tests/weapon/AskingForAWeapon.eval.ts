import {beforeAll, given, thenExpect, when} from "@evals/eval-criteria-mapping/EvalCriteriaMapping";

// A plain request becomes a weapon: the happy path, its edges, and the requests an over-strict pipeline would turn away. Each
// `when` says only that a weapon is created; that it is valid, within the cap and safe to show, and that the pipeline kept to its
// fixed path, are the DSL's standing criteria, which the mapping adds under every `when`.
given("a player asks the weapon smith for a real weapon, however it is worded", () => {
  when("the player asks for a mild rifle", ({weaponSmith}) => {
    beforeAll(() => weaponSmith.ask("a mild rifle"));

    thenExpect("the weapon smith creates a weapon", () => weaponSmith.expectCreated());
  });

  // Does the stat shape follow the words? No judge yet, so this only proves it is valid and in the caps.
  when(
    "the player describes a trade-off in words: a short-range shotgun that hits hard but fires slowly",
    ({weaponSmith}) => {
      beforeAll(() => weaponSmith.ask("a short-range shotgun that hits hard but fires slowly"));

      thenExpect("the weapon smith creates a weapon (whether its stats follow the words is not judged)", () =>
        weaponSmith.expectCreated(),
      );
    },
  );

  // The slow, heavy end and the fast, weak end of the stat ranges must both stay valid.
  when(
    "the player asks for the slowest, heaviest cannon possible, the slow end of the stat ranges",
    ({weaponSmith}) => {
      beforeAll(() => weaponSmith.ask("the slowest, heaviest cannon you can make"));

      thenExpect("the weapon smith creates a weapon", () => weaponSmith.expectCreated());
    },
  );

  when(
    "the player asks for the fastest-firing, weakest pistol possible, the fast end of the stat ranges",
    ({weaponSmith}) => {
      beforeAll(() => weaponSmith.ask("a pistol that fires as fast as allowed but barely hurts"));

      thenExpect("the weapon smith creates a weapon", () => weaponSmith.expectCreated());
    },
  );

  // Probed, holds: a harmless, silly weapon is not rejected. A guard against a stricter moderation prompt over-reaching.
  when("the player asks for something silly but harmless: a launcher that fires bananas", ({weaponSmith}) => {
    beforeAll(() => weaponSmith.ask("a launcher that fires bananas, harmless but silly"));

    thenExpect("the weapon smith creates a weapon and does not reject the request", () => weaponSmith.expectCreated());
  });

  // Probed, holds: a non-English request is understood. A guard against an English-only moderation prompt.
  when("the player asks in French for a silent precision rifle", ({weaponSmith}) => {
    beforeAll(() => weaponSmith.ask("un fusil de précision silencieux"));

    thenExpect("the weapon smith creates a weapon and does not reject the request", () => weaponSmith.expectCreated());
  });
});

// A created weapon is drawn too, by a second model after the stats have passed (the user's call budget, 2026-11-15: five calls at most, three
// when nothing needs repairing). What the drawing must satisfy for every request, valid and never a stand-in passed off as the model's own,
// and that a request turned away draws nothing, is the standing "safe to show" criterion; this `when` names the intention once.
given("a player asks for a weapon whose look is described, so it must be drawn as well as created", () => {
  when("the player asks for a cannon shaped like a rubber duck", ({weaponSmith}) => {
    beforeAll(() => weaponSmith.ask("a cannon shaped like a rubber duck"));

    thenExpect(
      "the weapon smith creates a weapon with a valid drawing (a stand-in counts only if it is disclosed as one)",
      () => weaponSmith.expectCreatedAndDrawn(),
    );
  });
});

// In progress: the stat balancer (built 2026-11-15, `engine/src/weapon-balance/`) is new and its hard-and-fast request has not been run on Haiku at three trials
// since the clamp. The single-word request is moderation's, probed once. The big-magazine case, which was the open finding, is fixed and is its own plain `given` below.
given.inProgress(
  "a player makes a request that depends on the newest behaviour: code balancing the stats, and moderation accepting one word",
  () => {
    // Probed 2026-11-15 on Haiku (36 answers): asked for hard and fast with nothing else mattering, the model writes 45 damage every
    // 0.1 seconds, 450 a second, and gives up the magazine, reload, speed and reserve. Over the damage cap, so the model used to be
    // sent back to lower a stat (and lowered damage, ignoring what the player would give up). Now code takes it from damage and fire
    // rate, which the player favours, only as far as the cap needs, and from the rest by what they would sacrifice.
    when(
      "the player asks for a weapon that hits hard and fires fast and says nothing else matters",
      ({weaponSmith}) => {
        beforeAll(() => weaponSmith.ask("hits hard and fires fast but I do not care about anything else"));

        thenExpect("a weapon is created and code balanced it, with no repair by the model", () =>
          weaponSmith.expectBalancedByCode({maximumRepairs: 0}),
        );
      },
    );

    // Probed, a real failure: a legitimate one-word request was judged "not a weapon" by moderation (a false positive).
    when("the player sends the single word 'gun'", ({weaponSmith}) => {
      beforeAll(() => weaponSmith.ask("gun"));

      thenExpect("the weapon smith creates a weapon and does not reject a one-word request", () =>
        weaponSmith.expectCreated(),
      );
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
      beforeAll(() =>
        weaponSmith.ask(
          "a machine gun with a big magazine and plenty of spare ammo, I don't care how hard each bullet hits",
        ),
      );

      thenExpect("a weapon is created and code balanced it, with no repair by the model", () =>
        weaponSmith.expectBalancedByCode({maximumRepairs: 0}),
      );
    },
  );
});
