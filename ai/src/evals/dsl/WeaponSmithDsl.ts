import {AppearanceDsl} from "@evals/dsl/appearance/AppearanceDsl";
import {ArenaDsl} from "@evals/dsl/arena/ArenaDsl";
import {ArenaSubmissionDsl} from "@evals/dsl/arena-submission/ArenaSubmissionDsl";
import {WeaponDsl} from "@evals/dsl/weapon/WeaponDsl";
import type {EvalDrivers} from "@evals/dsl/types/EvalDrivers";

/**
 * The weapon smith as a spec sees it: every area is a member of this rather than a fixture of its own, as `GunsmithDsl` holds its
 * components in `acceptance-tests/`. A `when` is handed it, and takes a component into a scope of its own for each trial
 * (`eachTrial(weaponSmith.weapon, weapon => {…})`).
 */
export class WeaponSmithDsl {
  readonly weapon: WeaponDsl;
  readonly appearance: AppearanceDsl;
  readonly arena: ArenaDsl;
  readonly arenaSubmission: ArenaSubmissionDsl;

  constructor(drivers: EvalDrivers) {
    this.weapon = new WeaponDsl(drivers.weapon);
    this.appearance = new AppearanceDsl(drivers.appearance);
    this.arena = new ArenaDsl(drivers.arena);
    this.arenaSubmission = new ArenaSubmissionDsl(drivers.arenaSubmission);
  }
}
