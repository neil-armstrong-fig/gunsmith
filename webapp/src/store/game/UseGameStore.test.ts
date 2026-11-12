import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import {PRACTICE_ARENA} from "@src/game/practice/PracticeArena";
import {PRACTICE_DUMMIES} from "@src/game/practice/PracticeDummies";
import {useGameStore} from "@src/store/game/UseGameStore";

beforeEach(() => {
  useGameStore.setState(useGameStore.getInitialState(), true);
});

it("starts as the practice match, with nothing played yet", () => {
  expect(useGameStore.getState().world).toEqual(startingWorld(PRACTICE_ARENA, PRACTICE_DUMMIES));
});

it("replaces the world with the one it is given", () => {
  const next = {...startingWorld(PRACTICE_ARENA, PRACTICE_DUMMIES), elapsedSeconds: 3};

  useGameStore.getState().setWorld(next);

  expect(useGameStore.getState().world.elapsedSeconds).toBe(3);
});

it("keeps the very world it is given, not a copy, so a step costs one swap and no more", () => {
  const next = {...startingWorld(PRACTICE_ARENA, PRACTICE_DUMMIES), elapsedSeconds: 3};

  useGameStore.getState().setWorld(next);

  expect(useGameStore.getState().world).toBe(next);
});

it("tells a subscriber when the world changes", () => {
  const heard: number[] = [];
  const unsubscribe = useGameStore.subscribe(state => {
    heard.push(state.world.elapsedSeconds);
  });

  useGameStore.getState().setWorld({...startingWorld(PRACTICE_ARENA, PRACTICE_DUMMIES), elapsedSeconds: 7});
  unsubscribe();

  expect(heard).toEqual([7]);
});

it("holds the world and nothing else", () => {
  // This is the rule that keeps the game store from bloating: it holds what the engine's `World` holds. Menus, lobby,
  // library and credits belong in the app store, and values derived from the world are selectors, never state. If you
  // are here to add a key, you want a different store, or a selector.
  expect(Object.keys(useGameStore.getState()).sort()).toEqual(["setWorld", "world"]);
});
