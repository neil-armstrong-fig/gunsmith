import fc from "fast-check";
import {comings} from "@src/durable-objects/match/property-tests/match-room/arbitraries/Comings";
import {cuts} from "@src/durable-objects/match/property-tests/match-room/arbitraries/Cuts";
import {steps} from "@src/durable-objects/match/property-tests/match-room/arbitraries/Steps";
import {expectTheScoreToStayLegal} from "@src/durable-objects/match/property-tests/match-room/score-checks/ExpectTheScoreToStayLegal";
import {expectAckToFollowTheInputs} from "@src/durable-objects/match/property-tests/match-room/step-checks/ExpectAckToFollowTheInputs";
import {expectOnlyAllowedFields} from "@src/durable-objects/match/property-tests/match-room/step-checks/ExpectOnlyAllowedFields";
import {expectTheSameWhenCutUp} from "@src/durable-objects/match/property-tests/match-room/step-checks/ExpectTheSameWhenCutUp";

/**
 * What must hold for any input a browser could send and any clock, not only the ones someone wrote down. `MatchRoom.test.ts` says what one
 * input does; this puts random sequences of inputs and ticks through a room and says what is true of every one. When a property fails,
 * fast-check shrinks the case and prints a seed to replay it. The parser has its own (`ParseInputMessageInvariants.test.ts`).
 *
 * Deliberately outside `pnpm checks`: a fresh seed each run means a failure is not reproducible from the same commit
 * (`vitest.config.ts`). Run it with `pnpm test:properties`; `PROPERTY_TEST_RUNS` sets how many cases each property gets.
 */
const RUNS = Number(process.env["PROPERTY_TEST_RUNS"] ?? 100);

it("tells a seat the newest input it has sent and how many steps were played with it, never going back", () => {
  fc.assert(fc.property(steps(), expectAckToFollowTheInputs), {numRuns: RUNS});
});

it("plays the steps it is told the same however they are cut up, when nothing new is asked in between", () => {
  fc.assert(fc.property(steps(), cuts(), expectTheSameWhenCutUp), {numRuns: RUNS});
});

it("sends a seat only the fields it may know, whatever has been asked and played", () => {
  fc.assert(fc.property(steps(), expectOnlyAllowedFields), {numRuns: RUNS});
});

it("keeps the score legal, and restarts it only as a fresh match, whoever leaves, returns, asks or waits", () => {
  fc.assert(fc.property(comings(), expectTheScoreToStayLegal), {numRuns: RUNS});
});
