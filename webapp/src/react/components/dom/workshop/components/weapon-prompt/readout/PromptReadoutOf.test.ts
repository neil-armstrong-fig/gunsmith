import {promptReadoutOf} from "@src/react/components/dom/workshop/components/weapon-prompt/readout/PromptReadoutOf";
import {WEAPON_PROMPT_LIMIT} from "@src/react/components/dom/workshop/components/weapon-prompt/readout/WeaponPromptLimit";

it("counts the characters written against the limit", () => {
  expect(promptReadoutOf("a fast gun")).toEqual({length: 10, limit: WEAPON_PROMPT_LIMIT, over: false, canMake: true});
});

it("cannot make from nothing, or from only spaces", () => {
  expect(promptReadoutOf("").canMake).toBe(false);
  expect(promptReadoutOf("   \n ").canMake).toBe(false);
});

it("can make at exactly the limit", () => {
  expect(promptReadoutOf("a".repeat(WEAPON_PROMPT_LIMIT))).toMatchObject({over: false, canMake: true});
});

it("is over, and cannot make, one character past the limit", () => {
  expect(promptReadoutOf("a".repeat(WEAPON_PROMPT_LIMIT + 1))).toMatchObject({over: true, canMake: false});
});

it("counts the way the pre-check does, in UTF-16 units: a character outside the basic plane counts as two", () => {
  expect(promptReadoutOf("😀").length).toBe(2);
});
