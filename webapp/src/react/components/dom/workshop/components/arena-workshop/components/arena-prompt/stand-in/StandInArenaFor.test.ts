import {validateArena} from "@gunsmith/engine/arena-validation/ValidateArena";
import {standInArenaFor} from "@src/react/components/dom/workshop/components/arena-workshop/components/arena-prompt/stand-in/StandInArenaFor";

it.each(["a courtyard with a pillar", "a raised platform with stairs"])(
  "gives the engine a playable arena for %s",
  prompt => {
    expect(validateArena(standInArenaFor(prompt).arena)).toEqual([]);
  },
);
