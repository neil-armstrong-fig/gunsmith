import {chosenChoiceOf} from "@src/react/components/dom/pre-round/components/choosing/choices/ChosenChoiceOf";

const CHOICES = [{id: "a"}, {id: "b"}, {id: "c"}];

it("is the remembered choice when it is still offered", () => {
  expect(chosenChoiceOf(CHOICES, "c", "a")).toBe(CHOICES[2]);
});

it("is the default when nothing was remembered", () => {
  expect(chosenChoiceOf(CHOICES, undefined, "b")).toBe(CHOICES[1]);
});

it("is the default when the remembered choice has left the shelf", () => {
  expect(chosenChoiceOf(CHOICES, "gone", "b")).toBe(CHOICES[1]);
});

it("is the first on offer when the default is not offered either, and nothing when nothing is", () => {
  expect(chosenChoiceOf(CHOICES, "gone", "also gone")).toBe(CHOICES[0]);
  expect(chosenChoiceOf([], "a", "a")).toBeUndefined();
});
