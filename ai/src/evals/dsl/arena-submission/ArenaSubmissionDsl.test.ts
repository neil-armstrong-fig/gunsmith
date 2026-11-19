import type {ArenaSubmissionDriver} from "@evals/dsl/arena-submission/types/ArenaSubmissionDriver";
import {ArenaSubmissionDsl} from "@evals/dsl/arena-submission/ArenaSubmissionDsl";
import type {ArenaSubmission} from "@gunsmith/ai/pipeline/arena-submission/types/ArenaSubmission";

interface ScriptedSubmissionDriver extends ArenaSubmissionDriver {
  screenings: number;
}

it("names its domain and the trials its driver runs", () => {
  const dsl = new ArenaSubmissionDsl(scriptedDriver(3));

  expect(dsl.domain).toBe("arenaSubmission");
  expect(dsl.trials).toBe(3);
});

it("hands a trial a DSL that screens once, on the same driver, whatever the run's trial count", async () => {
  const driver = scriptedDriver(3);
  const dsl = new ArenaSubmissionDsl(driver);
  const firstTrial = dsl.forTrial();
  const secondTrial = dsl.forTrial();

  await firstTrial.askWithPrompts({player1: "a maze"});
  await secondTrial.askWithPrompts({player1: "a yard"});

  expect(firstTrial.trials).toBe(1);
  expect(driver.screenings).toBe(2);
});

function scriptedDriver(trials: number): ScriptedSubmissionDriver {
  const driver: ScriptedSubmissionDriver = {
    trials,
    screenings: 0,
    run: (submissions: readonly ArenaSubmission[]) => {
      driver.screenings += 1;

      return Promise.resolve({status: "none", survivors: [], rejected: [], modelCalls: submissions.length});
    },
  };

  return driver;
}
