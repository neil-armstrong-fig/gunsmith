import type {ArenaEvalInput} from "@evals/dsl/arena/pipeline/types/ArenaEvalInput";
import type {EvalScore} from "@evals/dsl/shared/types/EvalScore";

const KEY = "arenaNodePath";

const MAX_REPAIRS = 1;

// Nodes that only a request that went on to be written may have run.
const WRITING_NODES = ["generate", "validate", "repair", "fallback"];

/**
 * The graph is fixed, so its path is asserted node by node: the pre-check runs first, the arena is repaired at most once, an arena
 * counts as created only if it was validated last (so any repair was checked), a built-in arena is given only after a repair did not
 * help, and a request that was turned away wrote nothing.
 */
export function arenaNodePath({outcome}: ArenaEvalInput): EvalScore {
  const nodes = `[${outcome.nodes.join(", ")}]`;
  if (outcome.nodes[0] !== "precheck") {
    return {key: KEY, score: 0, comment: `the pre-check must run first, but the nodes were ${nodes}`};
  }

  const repairs = outcome.nodes.filter(node => node === "repair").length;
  if (repairs > MAX_REPAIRS) {
    return {key: KEY, score: 0, comment: `repair ran ${repairs} times, allowed ${MAX_REPAIRS}`};
  }

  if (outcome.status === "rejected") {
    return rejectedPath(outcome.nodes);
  }

  if (outcome.status === "builtIn") {
    return builtInPath(outcome.nodes, repairs);
  }

  return createdPath(outcome.nodes);
}

function rejectedPath(nodes: string[]): EvalScore {
  if (nodes.some(node => WRITING_NODES.includes(node))) {
    return {
      key: KEY,
      score: 0,
      comment: `a request that was turned away must not be written, but the nodes were [${nodes.join(", ")}]`,
    };
  }

  return {key: KEY, score: 1};
}

function builtInPath(nodes: string[], repairs: number): EvalScore {
  if (repairs !== MAX_REPAIRS) {
    return {
      key: KEY,
      score: 0,
      comment: `a built-in arena is given only after one repair did not help, but the nodes were [${nodes.join(", ")}]`,
    };
  }

  if (nodes[nodes.length - 1] !== "fallback") {
    return {
      key: KEY,
      score: 0,
      comment: `a built-in arena must end the run with fallback, but the nodes were [${nodes.join(", ")}]`,
    };
  }

  return {key: KEY, score: 1};
}

function createdPath(nodes: string[]): EvalScore {
  if (nodes.includes("fallback")) {
    return {
      key: KEY,
      score: 0,
      comment: `a created arena must not fall back, but the nodes were [${nodes.join(", ")}]`,
    };
  }

  if (nodes[nodes.length - 1] !== "validate") {
    return {
      key: KEY,
      score: 0,
      comment: `a created arena must end with validate, but the nodes were [${nodes.join(", ")}]`,
    };
  }

  return {key: KEY, score: 1};
}
