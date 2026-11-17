import {END} from "@langchain/langgraph";
import {continueUnlessRejected} from "@gunsmith/ai/pipeline/arena/arena-graph/routing/ContinueUnlessRejected";
import {arenaGraphStateOf} from "@gunsmith/ai/pipeline/arena/arena-graph/testing/ArenaGraphStateOf";

it("goes on to the next node while the request has not been turned away", () => {
  expect(continueUnlessRejected("moderation")(arenaGraphStateOf())).toBe("moderation");
});

it("goes straight to the end once the request has been turned away", () => {
  expect(continueUnlessRejected("moderation")(arenaGraphStateOf({rejectionReason: "too long"}))).toBe(END);
});
