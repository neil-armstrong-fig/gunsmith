import type {CreatedPath} from "@evals/dsl/pipeline/evaluators/outcome/types/CreatedPath";
import type {EvalInput} from "@evals/dsl/pipeline/types/EvalInput";
import type {EvalScore} from "@evals/dsl/types/EvalScore";
import type {WeaponOutcomeStatus} from "@gunsmith/ai/pipeline/types/WeaponOutcomeStatus";

const KEY = "nodePath";

const MAX_REPAIRS = 1;

const REQUIRED_FOR_CREATED = ["validate", "balance", "rate"];

// The drawing's nodes carry this prefix in the weapon's outcome (`appearance.generate`, `appearance.repair`, ...).
const DRAWING_PREFIX = "appearance.";
const DRAWING_START = `${DRAWING_PREFIX}generate`;
const DRAWING_REPAIR = `${DRAWING_PREFIX}repair`;
const DRAWING_ENDS = [`${DRAWING_PREFIX}validate`, `${DRAWING_PREFIX}fallback`];

/**
 * The graph is fixed, so its path is asserted node by node rather than with a trajectory judge (Focused reserves those for
 * agents with more than two tools): the pre-check runs first, so a rejection there costs nothing, the stats are repaired at most
 * once and so is the drawing, a weapon counts as created only if it was validated, balanced and rated, and then it is drawn, in
 * that order, and nothing else is: a request that was turned away or came out invalid draws nothing.
 */
export function nodePath({outcome}: EvalInput): EvalScore {
  if (outcome.nodes[0] !== "precheck") {
    return {
      key: KEY,
      score: 0,
      comment: `the pre-check must run first, but the nodes were [${outcome.nodes.join(", ")}]`,
    };
  }

  const drawingNodes = outcome.nodes.filter(node => node.startsWith(DRAWING_PREFIX));
  const statsNodes = outcome.nodes.filter(node => !node.startsWith(DRAWING_PREFIX));

  const repairs = statsNodes.filter(node => node === "repair").length;
  if (repairs > MAX_REPAIRS) {
    return {key: KEY, score: 0, comment: `repair ran ${repairs} times, allowed ${MAX_REPAIRS}`};
  }

  const drawingRepairs = drawingNodes.filter(node => node === DRAWING_REPAIR).length;
  if (drawingRepairs > MAX_REPAIRS) {
    return {key: KEY, score: 0, comment: `${DRAWING_REPAIR} ran ${drawingRepairs} times, allowed ${MAX_REPAIRS}`};
  }

  if (outcome.status !== "created") {
    return notDrawnPath(outcome.status, outcome.nodes);
  }

  return createdPath({nodes: outcome.nodes, statsNodes, drawingNodes});
}

/** A request that was turned away or came out invalid has no weapon to draw, so no drawing node may have run. */
function notDrawnPath(status: WeaponOutcomeStatus, nodes: string[]): EvalScore {
  if (nodes.some(node => node.startsWith(DRAWING_PREFIX))) {
    return {
      key: KEY,
      score: 0,
      comment: `a request that ended ${status} must not be drawn, but the nodes were [${nodes.join(", ")}]`,
    };
  }

  return {key: KEY, score: 1};
}

/** A weapon is only created once code has parsed it, balanced it and rated it (the last word of the stats, so any repair was checked), and it is drawn after that. */
function createdPath(path: CreatedPath): EvalScore {
  for (const required of REQUIRED_FOR_CREATED) {
    if (!path.statsNodes.includes(required)) {
      return {
        key: KEY,
        score: 0,
        comment: `a created weapon must have been ${required}d, but the nodes were [${path.nodes.join(", ")}]`,
      };
    }
  }

  if (path.statsNodes[path.statsNodes.length - 1] !== "rate") {
    return {
      key: KEY,
      score: 0,
      comment: `a created weapon must end its stats with rate, but the nodes were [${path.nodes.join(", ")}]`,
    };
  }

  return drawnPath(path);
}

/** The drawing runs after the stats and not between them, starts by generating, and ends checked or as the disclosed stand-in. */
function drawnPath(path: CreatedPath): EvalScore {
  const nodes = `[${path.nodes.join(", ")}]`;
  if (path.drawingNodes.length === 0) {
    return {key: KEY, score: 0, comment: `a created weapon must be drawn, but the nodes were ${nodes}`};
  }

  const afterTheStats = path.nodes.slice(path.statsNodes.length);
  if (afterTheStats.some(node => !node.startsWith(DRAWING_PREFIX))) {
    return {
      key: KEY,
      score: 0,
      comment: `the drawing must come after the weapon is rated, but the nodes were ${nodes}`,
    };
  }

  if (path.drawingNodes[0] !== DRAWING_START) {
    return {key: KEY, score: 0, comment: `the drawing must start with ${DRAWING_START}, but the nodes were ${nodes}`};
  }

  const last = path.drawingNodes[path.drawingNodes.length - 1] ?? "";
  if (!DRAWING_ENDS.includes(last)) {
    return {
      key: KEY,
      score: 0,
      comment: `the drawing must end with ${DRAWING_ENDS.join(" or ")}, but the nodes were ${nodes}`,
    };
  }

  return {key: KEY, score: 1};
}
