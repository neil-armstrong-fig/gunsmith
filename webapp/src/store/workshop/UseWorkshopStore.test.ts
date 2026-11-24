import {RIFLE} from "@gunsmith/engine/weapon/weapons/Rifle";
import {SUBMACHINE_GUN} from "@gunsmith/engine/weapon/weapons/SubmachineGun";
import {useWorkshopStore} from "@src/store/workshop/UseWorkshopStore";

beforeEach(() => {
  useWorkshopStore.setState(useWorkshopStore.getInitialState(), true);
});

it("holds the prompt, result, shelf references and Make status", () => {
  expect(Object.keys(useWorkshopStore.getState()).sort()).toEqual([
    "accountItemId",
    "madeFromPrompt",
    "makeError",
    "making",
    "prompt",
    "savedId",
    "setAccountWeapon",
    "setMakeError",
    "setMaking",
    "setPrompt",
    "setSavedId",
    "setWeapon",
    "showSavedWeapon",
    "weapon",
  ]);
});

it("starts with nothing written and nothing made", () => {
  expect(useWorkshopStore.getState().prompt).toBe("");
  expect(useWorkshopStore.getState().weapon).toBeUndefined();
});

it("keeps the prompt as written, whatever its length", () => {
  const long = "a".repeat(5000);

  useWorkshopStore.getState().setPrompt(long);

  expect(useWorkshopStore.getState().prompt).toBe(long);
});

it("keeps the weapon it is given", () => {
  useWorkshopStore.getState().setWeapon(RIFLE);

  expect(useWorkshopStore.getState().weapon).toBe(RIFLE);
});

it("remembers the words a weapon was made from, whatever is written in the box afterwards", () => {
  useWorkshopStore.getState().setPrompt("a fast one");
  useWorkshopStore.getState().setWeapon(RIFLE);
  useWorkshopStore.getState().setPrompt("something else");

  expect(useWorkshopStore.getState().madeFromPrompt).toBe("a fast one");
});

it("starts with nothing saved, and a new weapon is not the saved one", () => {
  expect(useWorkshopStore.getState().savedId).toBeUndefined();

  useWorkshopStore.getState().setWeapon(RIFLE);
  useWorkshopStore.getState().setSavedId("a");
  useWorkshopStore.getState().setWeapon(SUBMACHINE_GUN);

  expect(useWorkshopStore.getState().savedId).toBeUndefined();
});

it("keeps the id a weapon was saved under", () => {
  useWorkshopStore.getState().setWeapon(RIFLE);
  useWorkshopStore.getState().setSavedId("a");

  expect(useWorkshopStore.getState().savedId).toBe("a");
});

it("brings a saved weapon back as the card, with its words in the box and its id", () => {
  useWorkshopStore.getState().setPrompt("something else");
  useWorkshopStore.getState().setWeapon(RIFLE);

  useWorkshopStore.getState().showSavedWeapon({id: "a", prompt: "a fast one", weapon: SUBMACHINE_GUN});

  expect(useWorkshopStore.getState()).toMatchObject({
    prompt: "a fast one",
    madeFromPrompt: "a fast one",
    weapon: SUBMACHINE_GUN,
    savedId: "a",
  });
});
