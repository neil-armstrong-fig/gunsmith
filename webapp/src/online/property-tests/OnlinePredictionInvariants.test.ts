import fc from "fast-check";
import {heldAsks} from "@src/online/property-tests/arbitraries/HeldAsks";
import {jitteryMatches} from "@src/online/property-tests/arbitraries/JitteryMatches";
import {steadyMatches} from "@src/online/property-tests/arbitraries/SteadyMatches";
import type {HeldAsk} from "@src/online/property-tests/arbitraries/types/HeldAsk";
import {unevenMatches} from "@src/online/property-tests/arbitraries/UnevenMatches";
import {PILLARED_ROOM} from "@src/online/property-tests/simulated-network/arenas/PillaredRoom";
import {playMatch} from "@src/online/property-tests/simulated-network/PlayMatch";
import type {MatchPlan} from "@src/online/property-tests/simulated-network/types/MatchPlan";

/**
 * What must hold for any player and any network, not only the ones someone wrote down. A unit test (`OnlineMatch.test.ts`) says what one
 * snapshot does to one prediction; this plays whole matches, with random inputs, random latency and a random snapshot rate, between the
 * real `OnlineMatch` and a server modelled on `api/`'s (`simulated-network/PlayMatch.ts`), and says what is true of every one. When a
 * property fails, fast-check shrinks the match to the smallest that still breaks it and prints a seed to replay it.
 *
 * Deliberately outside `pnpm checks`: a fresh seed each run means a failure is not reproducible from the same commit
 * (`vitest.config.ts`). Run it with `pnpm test:properties`; `PROPERTY_TEST_RUNS` sets how many cases each property gets.
 */
const RUNS = Number(process.env["PROPERTY_TEST_RUNS"] ?? 100);

/** A tolerance for numbers that are the same but for the order the arithmetic was done in. */
const SAME = 1e-9;

/** How far a player walks in one step: 6 tiles a second, a sixtieth of a second. */
const ONE_STEP = 0.1;

/** How much more a correction may move the player in a step: an eased offset under a tile gives up a sixth of itself each step (a tenth of a second to fade, a sixtieth of a second a step). */
const A_LITTLE = 0.16;

it("shows the player exactly where a game with no network would, when the network is steady, whatever the delay and snapshot rate", () => {
  fc.assert(fc.property(steadyMatches(), expectTheShownPlayerToBeTheIdealOne), {numRuns: RUNS});
});

it("ends where the server has the player, once the inputs stop and the frames in flight arrive, however unevenly the network held them up", () => {
  fc.assert(fc.property(unevenMatches(), expectToEndWhereTheServerHasThePlayer), {numRuns: RUNS});
});

it("only ever shows the player somewhere real, however unevenly the network held frames up", () => {
  fc.assert(fc.property(unevenMatches(), expectOnlyRealPlaces), {numRuns: RUNS});
});

it("sends a steady ask about ten times a second, however long it is held: often enough to line the server's count up, rarely enough to cost little", () => {
  fc.assert(fc.property(heldAsks(), expectAboutTenFramesASecond), {numRuns: RUNS});
});

it("never moves the player more than a step and a little between two frames when frames arrive a few steps apart, so a correction is eased, not a jump", () => {
  fc.assert(fc.property(jitteryMatches(), expectNoJump), {numRuns: RUNS});
});

function expectTheShownPlayerToBeTheIdealOne(plan: MatchPlan): void {
  const outcome = playMatch(plan);

  outcome.shown.forEach((place, step) => {
    const wanted = outcome.ideal[step];

    expect(Math.abs(place.x - (wanted?.x ?? NaN))).toBeLessThan(SAME);
    expect(Math.abs(place.y - (wanted?.y ?? NaN))).toBeLessThan(SAME);
  });
}

function expectToEndWhereTheServerHasThePlayer(plan: MatchPlan): void {
  const outcome = playMatch(plan);
  const last = outcome.shown.at(-1);

  expect(last).toBeDefined();
  expect(Math.abs((last?.x ?? NaN) - outcome.serverFinal.x)).toBeLessThan(1e-3);
  expect(Math.abs((last?.y ?? NaN) - outcome.serverFinal.y)).toBeLessThan(1e-3);
}

function expectOnlyRealPlaces(plan: MatchPlan): void {
  for (const place of playMatch(plan).shown) {
    expect(Number.isFinite(place.x)).toBe(true);
    expect(Number.isFinite(place.y)).toBe(true);
    expect(place.x).toBeGreaterThan(0);
    expect(place.x).toBeLessThan(16);
    expect(place.y).toBeGreaterThan(0);
    expect(place.y).toBeLessThan(8);
  }
}

function expectAboutTenFramesASecond(held: HeldAsk): void {
  const outcome = playMatch({
    inputs: Array.from({length: held.steps}, () => held.input),
    settleSteps: 0,
    upstreamDelays: [0],
    downstreamDelays: [0],
    snapshotEvery: 2,
    arenaRows: PILLARED_ROOM,
  });

  expect(outcome.framesSent).toBeLessThanOrEqual(Math.ceil(held.steps / 6) + 1);
  expect(outcome.framesSent).toBeGreaterThanOrEqual(Math.floor(held.steps / 6));
}

function expectNoJump(plan: MatchPlan): void {
  const {shown} = playMatch(plan);

  shown.forEach((place, step) => {
    const before = shown[step - 1];
    if (before) {
      expect(Math.hypot(place.x - before.x, place.y - before.y)).toBeLessThan(ONE_STEP + A_LITTLE);
    }
  });
}
