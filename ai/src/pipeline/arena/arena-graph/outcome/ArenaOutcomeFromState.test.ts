import {arenaOutcomeFromState} from "@gunsmith/ai/pipeline/arena/arena-graph/outcome/ArenaOutcomeFromState";
import {arenaGraphStateOf} from "@gunsmith/ai/pipeline/arena/arena-graph/testing/ArenaGraphStateOf";

const ARENA = {name: "Box", rows: ["#####", "#...#", "#####"]};
const BUILT_IN = {name: "Open Room", rows: ["######", "#....#", "######"]};

it("reports a turned-away request with the reason, no arena and nothing to refund", () => {
  const outcome = arenaOutcomeFromState(
    arenaGraphStateOf({rejectionReason: "not an arena", nodes: ["precheck", "moderation"], modelCalls: 1}),
  );

  expect(outcome).toEqual({
    status: "rejected",
    reason: "not an arena",
    refunded: false,
    nodes: ["precheck", "moderation"],
    modelCalls: 1,
  });
});

it("reports a made arena as created, with nothing refunded", () => {
  const outcome = arenaOutcomeFromState(
    arenaGraphStateOf({arena: ARENA, nodes: ["generate", "validate"], modelCalls: 2}),
  );

  expect(outcome).toEqual({
    status: "created",
    arena: ARENA,
    refunded: false,
    nodes: ["generate", "validate"],
    modelCalls: 2,
  });
});

it("reports a built-in arena, tells the player why and refunds the credit", () => {
  const outcome = arenaOutcomeFromState(
    arenaGraphStateOf({builtIn: BUILT_IN, errors: ["rows: too few"], repaired: true}),
  );

  expect(outcome).toMatchObject({status: "builtIn", arena: BUILT_IN, refunded: true});
  expect(outcome.reason).toContain("Your credit is refunded");
});

it("never hands on an arena that a later check refused", () => {
  expect(() => arenaOutcomeFromState(arenaGraphStateOf({arena: ARENA, errors: ["a later fault"]}))).toThrow(
    "no arena, no built-in arena and no rejection",
  );
});

it("throws when the graph ended with nothing at all", () => {
  expect(() => arenaOutcomeFromState(arenaGraphStateOf())).toThrow("ended with no arena");
});
