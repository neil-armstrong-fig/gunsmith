import {END} from "@langchain/langgraph";
import {routeAfterValidate} from "@gunsmith/ai/pipeline/arena/graph/routing/RouteAfterValidate";
import {arenaGraphStateOf} from "@gunsmith/ai/pipeline/arena/graph/testing/ArenaGraphStateOf";

it("ends the run when the draft passed", () => {
  expect(routeAfterValidate(arenaGraphStateOf())).toBe(END);
});

it("ends the run when a repaired draft passed", () => {
  expect(routeAfterValidate(arenaGraphStateOf({repaired: true}))).toBe(END);
});

it("sends a refused draft to the one repair", () => {
  expect(routeAfterValidate(arenaGraphStateOf({errors: ["rows: too few"]}))).toBe("repair");
});

it("ends the run for a refused repaired draft, never sending it to a second repair or to a substitute", () => {
  expect(routeAfterValidate(arenaGraphStateOf({errors: ["rows: too few"], repaired: true}))).toBe(END);
});
