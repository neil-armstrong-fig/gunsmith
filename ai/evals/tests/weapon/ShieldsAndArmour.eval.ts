import {beforeAll, given, thenExpect, when} from "@evals/eval-criteria-mapping/EvalCriteriaMapping";

// The user's ruling (2026-11-12): no standalone shields or armour, but the weapon itself may be a shield with a direction that
// can reflect bullets. A shield is a weapon and is created; passive worn protection is not and is turned away.
// In progress: a shield is only a weapon here by a workaround. The weapon shape has no damage for it (the floor is one), so a bare shield is created
// because the one repair invents a one-point bullet, and a reflecting, directional shield is a behaviour the engine does not have yet. `build` owes the
// shield behaviour (`HANDOFF.md`); when it lands this becomes a plain `given`.
given.inProgress("a player asks for a shield", () => {
  // Probed, a real failure (3 of 3): moderation rejected a shield, even one described as a weapon. And once it was created, the
  // first answer was over the damage cap, so it only becomes a weapon through the one repair.
  when("they ask for a shield that reflects bullets", ({weaponSmith}) => {
    beforeAll(() => weaponSmith.ask("a shield held out in front of me that reflects bullets back at the shooter"));

    thenExpect("a weapon is created", () => weaponSmith.expectCreated());
  });

  // A shield has no damage in the weapon's shape (the schema's floor is one), so this is created only because the repair gives
  // it a one-point bullet. A real shield behaviour is owed by `build` (`HANDOFF.md`).
  when("they ask for a bare shield", ({weaponSmith}) => {
    beforeAll(() => weaponSmith.ask("a riot shield"));

    thenExpect("a weapon is created", () => weaponSmith.expectCreated());
  });
});

// The other half of the ruling: passive worn protection is not a weapon. Probed, holds (rejected 3 of 3), so it gates.
given("a player asks for worn armour", () => {
  when("they ask for body armour", ({weaponSmith}) => {
    beforeAll(() => weaponSmith.ask("body armor that makes me take less damage"));

    thenExpect("the request is rejected", () => weaponSmith.expectRejected());

    thenExpect("it costs at most one model call", () => weaponSmith.expectModelCallsAtMost(1));
  });
});
