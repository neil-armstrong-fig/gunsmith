import {useArenaWorkshopStore} from "@src/store/workshop/arena/UseArenaWorkshopStore";

beforeEach(() => {
  useArenaWorkshopStore.setState(useArenaWorkshopStore.getInitialState(), true);
});

it("starts in the blue style, the one that can make any size", () => {
  expect(useArenaWorkshopStore.getState().style).toBe("blue");
});

it("holds the style the player chose", () => {
  useArenaWorkshopStore.getState().setStyle("red");

  expect(useArenaWorkshopStore.getState().style).toBe("red");
});

it("keeps the style when the prompt changes, so the words and the style are chosen separately", () => {
  useArenaWorkshopStore.getState().setStyle("red");
  useArenaWorkshopStore.getState().setPrompt("a yard with one pillar");

  expect(useArenaWorkshopStore.getState().style).toBe("red");
});
