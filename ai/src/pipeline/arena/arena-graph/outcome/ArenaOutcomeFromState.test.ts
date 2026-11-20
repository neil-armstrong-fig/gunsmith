import {arenaOutcomeFromState} from "@gunsmith/ai/pipeline/arena/arena-graph/outcome/ArenaOutcomeFromState";
import {arenaGraphStateOf} from "@gunsmith/ai/pipeline/arena/arena-graph/testing/ArenaGraphStateOf";

const ARENA = {name: "Box", rows: ["#####", "#...#", "#####"]};
const BUILT_IN = {name: "Open Room", rows: ["######", "#....#", "######"]};

it("reports a request turned away after a model call with the reason, no arena, and no refund, because the model was used", () => {
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

it("refunds a request turned away before any model call, the only request that costs nothing", () => {
  const outcome = arenaOutcomeFromState(
    arenaGraphStateOf({rejectionReason: "too long", nodes: ["precheck"], modelCalls: 0}),
  );

  expect(outcome).toMatchObject({status: "rejected", refunded: true, modelCalls: 0});
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

it("reports a built-in arena and tells the player why, without a refund, because the model's work was paid for", () => {
  const outcome = arenaOutcomeFromState(
    arenaGraphStateOf({builtIn: BUILT_IN, errors: ["rows: too few"], repaired: true, modelCalls: 3}),
  );

  expect(outcome).toMatchObject({status: "builtIn", arena: BUILT_IN, refunded: false});
  expect(outcome.reason).toBe("We could not build a playable arena from that request, so here is one of ours.");
});

it("never hands on an arena that a later check refused", () => {
  expect(() => arenaOutcomeFromState(arenaGraphStateOf({arena: ARENA, errors: ["a later fault"]}))).toThrow(
    "no arena, no built-in arena and no rejection",
  );
});

it("throws when the graph ended with nothing at all", () => {
  expect(() => arenaOutcomeFromState(arenaGraphStateOf())).toThrow("ended with no arena");
});
