import {arenaOutcomeFromState} from "@gunsmith/ai/pipeline/arena/graph/outcome/ArenaOutcomeFromState";
import {reasonForInvalidArena} from "@gunsmith/ai/pipeline/arena/graph/outcome/invalid-reason/ReasonForInvalidArena";
import {arenaGraphStateOf} from "@gunsmith/ai/pipeline/arena/graph/testing/ArenaGraphStateOf";

const ARENA = {name: "Box", rows: ["#####", "#...#", "#####"]};

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

it("reports a request whose repair did not help as invalid, with no arena, a reason of ours and no refund, because the model's work was paid for", () => {
  const outcome = arenaOutcomeFromState(
    arenaGraphStateOf({
      errors: ["4 tiles of floor, starting at column 3, row 2, cannot be walked to from the rest of the arena."],
      validationFailure: "unplayable-arena",
      problemKinds: ["disconnected"],
      repaired: true,
      nodes: ["precheck", "moderation", "generate", "validate", "repair", "validate"],
      modelCalls: 3,
    }),
  );

  expect(outcome).toEqual({
    status: "invalid",
    reason: reasonForInvalidArena("unplayable-arena", ["disconnected"]),
    refunded: false,
    nodes: ["precheck", "moderation", "generate", "validate", "repair", "validate"],
    modelCalls: 3,
  });
});

it("tells the player what the last check found, not the first, and never the validator's own words", () => {
  const outcome = arenaOutcomeFromState(
    arenaGraphStateOf({
      errors: ["rows: too few"],
      validationFailure: "invalid-draft",
      problemKinds: [],
      repaired: true,
      modelCalls: 3,
    }),
  );

  expect(outcome.reason).toBe(reasonForInvalidArena("invalid-draft", []));
  expect(outcome.reason).not.toContain("rows: too few");
});

it("never hands on an arena that a later check refused", () => {
  const outcome = arenaOutcomeFromState(
    arenaGraphStateOf({arena: ARENA, errors: ["a later fault"], validationFailure: "unplayable-arena", modelCalls: 3}),
  );

  expect(outcome.status).toBe("invalid");
  expect(outcome).not.toHaveProperty("arena");
});

it("throws when the graph ended with nothing at all", () => {
  expect(() => arenaOutcomeFromState(arenaGraphStateOf())).toThrow("ended with no arena");
});
