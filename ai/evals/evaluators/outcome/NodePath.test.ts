import {evalInput} from "@evals/evaluators/EvalInputBuilder";
import {nodePath} from "@evals/evaluators/outcome/NodePath";

function ran(nodes: string[]): ReturnType<typeof evalInput> {
  return evalInput({outcome: {nodes}});
}

it("passes the pre-check followed by generation", () => {
  expect(nodePath(ran(["precheck", "generate"])).score).toBe(1);
});

it("passes a rejection that stopped at the pre-check", () => {
  expect(nodePath(ran(["precheck"])).score).toBe(1);
});

it("passes one repair", () => {
  expect(nodePath(ran(["precheck", "moderation", "generate", "validate", "repair", "validate"])).score).toBe(1);
});

it("fails two repairs", () => {
  const score = nodePath(ran(["precheck", "generate", "validate", "repair", "validate", "repair"]));

  expect(score.comment).toBe("repair ran 2 times, allowed 1");
});

it("fails when the pre-check was not first", () => {
  expect(nodePath(ran(["generate", "precheck"])).score).toBe(0);
});

it("fails when no node ran at all", () => {
  expect(nodePath(ran([])).score).toBe(0);
});
