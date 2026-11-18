import {AppearanceDsl} from "@evals/dsl/appearance/AppearanceDsl";
import {ArenaDsl} from "@evals/dsl/arena/ArenaDsl";
import {ArenaSubmissionDsl} from "@evals/dsl/arena-submission/ArenaSubmissionDsl";
import {WeaponDsl} from "@evals/dsl/weapon/WeaponDsl";
import type {EvalDrivers} from "@evals/eval-criteria-mapping/drivers/types/EvalDrivers";
import {TrackedFixtures} from "@evals/eval-criteria-mapping/mapping/when/fixtures/TrackedFixtures";

/**
 * The DSLs of one `when`, one of each on the run's drivers, so its `then`s share the answers its `beforeAll` asked for, and no
 * other `when` does. They are tracked, so the mapping learns which of them the body took.
 */
export function createTrackedFixtures(drivers: EvalDrivers): TrackedFixtures {
  return new TrackedFixtures({
    weaponSmith: new WeaponDsl(drivers.weapon),
    appearance: new AppearanceDsl(drivers.appearance),
    arena: new ArenaDsl(drivers.arena),
    arenaSubmission: new ArenaSubmissionDsl(drivers.arenaSubmission),
  });
}
