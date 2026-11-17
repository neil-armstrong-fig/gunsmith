import {END} from "@langchain/langgraph";
import {routeAfterValidate} from "@gunsmith/ai/pipeline/arena/arena-graph/routing/RouteAfterValidate";
import {arenaGraphStateOf} from "@gunsmith/ai/pipeline/arena/arena-graph/testing/ArenaGraphStateOf";

it("ends the run when the draft passed", () => {
  expect(routeAfterValidate(arenaGraphStateOf())).toBe(END);
});

it("ends the run when a repaired draft passed", () => {
  expect(routeAfterValidate(arenaGraphStateOf({repaired: true}))).toBe(END);
});

it("sends a refused draft to the one repair", () => {
  expect(routeAfterValidate(arenaGraphStateOf({errors: ["rows: too few"]}))).toBe("repair");
});

it("sends a refused repaired draft to the built-in arena, never to a second repair", () => {
  expect(routeAfterValidate(arenaGraphStateOf({errors: ["rows: too few"], repaired: true}))).toBe("fallback");
});
