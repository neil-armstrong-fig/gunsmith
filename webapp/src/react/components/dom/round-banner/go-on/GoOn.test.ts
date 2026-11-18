import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {goOn} from "@src/react/components/dom/round-banner/go-on/GoOn";
import {useAppStore} from "@src/store/app/UseAppStore";
import {useGameStore} from "@src/store/game/UseGameStore";

const FRESH = startingWorld(arenaFrom(["####", "#..#", "####"]));

beforeEach(() => {
  useAppStore.setState(useAppStore.getInitialState(), true);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

it("puts the fresh world in the game store in a local game", () => {
  goOn(() => FRESH);

  expect(useGameStore.getState().world).toBe(FRESH);
  expect(useAppStore.getState().nextRoundAsked).toBe(false);
});

it("only asks to go on in an online room, where the server plays the match", () => {
  vi.stubGlobal("location", {search: "?room=ABC234"});
  const before = useGameStore.getState().world;

  goOn(() => FRESH);

  expect(useAppStore.getState().nextRoundAsked).toBe(true);
  expect(useGameStore.getState().world).toBe(before);
});
