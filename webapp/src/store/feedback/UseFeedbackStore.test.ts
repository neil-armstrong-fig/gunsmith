import {useFeedbackStore} from "@src/store/feedback/UseFeedbackStore";

beforeEach(() => {
  useFeedbackStore.setState(useFeedbackStore.getInitialState(), true);
});

it("holds the cues of the damage taken and nothing else, so adding state is a deliberate edit", () => {
  expect(Object.keys(useFeedbackStore.getState()).sort()).toEqual(["bulletHits", "ringHurting", "setCues"]);
});

it("starts with no hit and no ring", () => {
  expect(useFeedbackStore.getState().bulletHits).toBe(0);
  expect(useFeedbackStore.getState().ringHurting).toBe(false);
});

it("takes the cues it is given", () => {
  useFeedbackStore.getState().setCues({bulletHits: 3, ringHurting: true});

  expect(useFeedbackStore.getState().bulletHits).toBe(3);
  expect(useFeedbackStore.getState().ringHurting).toBe(true);
});
