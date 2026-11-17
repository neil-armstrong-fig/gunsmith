import {useAppStore} from "@src/store/app/UseAppStore";

beforeEach(() => {
  useAppStore.setState(useAppStore.getInitialState(), true);
});

it("holds the choices about the game and nothing else, so adding state is a deliberate edit", () => {
  expect(Object.keys(useAppStore.getState()).sort()).toEqual(["muted", "toggleMuted"]);
});

it("starts with the sound on, as no page asks for it off", () => {
  expect(useAppStore.getState().muted).toBe(false);
});

it("turns the sound off and on again with each toggle", () => {
  useAppStore.getState().toggleMuted();

  expect(useAppStore.getState().muted).toBe(true);

  useAppStore.getState().toggleMuted();

  expect(useAppStore.getState().muted).toBe(false);
});
