import {promptReadoutOf} from "@src/react/components/dom/workshop/components/workshop-prompt/readout/PromptReadoutOf";

const LIMIT = 600;

it("counts the characters written against the limit", () => {
  expect(promptReadoutOf("a fast one", LIMIT)).toEqual({length: 10, limit: LIMIT, over: false, canMake: true});
});

it("cannot make from nothing, or from only spaces", () => {
  expect(promptReadoutOf("", LIMIT).canMake).toBe(false);
  expect(promptReadoutOf("   \n ", LIMIT).canMake).toBe(false);
});

it("can make at exactly the limit", () => {
  expect(promptReadoutOf("a".repeat(LIMIT), LIMIT)).toMatchObject({over: false, canMake: true});
});

it("is over, and cannot make, one character past the limit", () => {
  expect(promptReadoutOf("a".repeat(LIMIT + 1), LIMIT)).toMatchObject({over: true, canMake: false});
});

it("counts the way the pre-check does, in UTF-16 units: a character outside the basic plane counts as two", () => {
  expect(promptReadoutOf("😀", LIMIT).length).toBe(2);
});
