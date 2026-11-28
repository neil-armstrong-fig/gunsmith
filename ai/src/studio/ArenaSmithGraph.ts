import {FakeListChatModel} from "@langchain/core/utils/testing";
import {EXAMPLE_ARENA_SHAPES} from "@gunsmith/ai/pipeline/arena/drafting/format/shapes/example/ExampleArenaShapes";
import {createArenaGraph} from "@gunsmith/ai/pipeline/arena/graph/CreateArenaGraph";

const CANNED_VERDICT = {isArenaRequest: true, reason: "An arena request."};

/**
 * The real arena pipeline's topology (`createArenaGraph`, in its default shapes format), on canned models, so `pnpm dev` and
 * LangGraph Studio show its five steps and run it with no key and no network. The canned arena is the shapes prompt's own
 * example, which a test already holds to the validator. Named in `ai/langgraph.json`. Not for production: `api/` hands
 * `generateArena` the real models.
 */
export const arenaSmithGraph = createArenaGraph({
  generator: new FakeListChatModel({responses: [JSON.stringify(EXAMPLE_ARENA_SHAPES)]}),
  moderator: new FakeListChatModel({responses: [JSON.stringify(CANNED_VERDICT)]}),
});
