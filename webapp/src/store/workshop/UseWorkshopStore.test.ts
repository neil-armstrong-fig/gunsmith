import {RIFLE} from "@gunsmith/engine/weapon/weapons/Rifle";
import {useWorkshopStore} from "@src/store/workshop/UseWorkshopStore";

beforeEach(() => {
  useWorkshopStore.setState(useWorkshopStore.getInitialState(), true);
});

it("holds the prompt and the last weapon and nothing else, so adding state is a deliberate edit", () => {
  expect(Object.keys(useWorkshopStore.getState()).sort()).toEqual(["prompt", "setPrompt", "setWeapon", "weapon"]);
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
