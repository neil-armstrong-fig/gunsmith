import type {OfferedArena} from "@src/game/pre-round/types/OfferedArena";
import {ArenaPreview} from "@src/react/components/dom/arena-preview/ArenaPreview";
import type {JSX} from "react";

interface Props {
  choices: readonly OfferedArena[];
  chosen: OfferedArena;
  onChoose: (arena: OfferedArena) => void;
}

/** The arenas a player may put forward, one button each, the chosen one pressed, and a preview of the chosen one: the real tiles, walls, levels and stairs. */
export function ArenaPicker({choices, chosen, onChoose}: Props): JSX.Element {
  return (
    <div role="group" aria-label="Arena" className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold text-gs-ui-text">Arena</h2>

      <div className="flex flex-wrap gap-2">
        {choices.map(choice => (
          <button
            key={choice.id}
            type="button"
            aria-pressed={choice.id === chosen.id}
            className="rounded-md bg-gs-background px-3 py-2 text-gs-ui-text aria-pressed:outline-2 aria-pressed:outline-gs-team-blue"
            onClick={() => {
              onChoose(choice);
            }}
          >
            {choice.name}
          </button>
        ))}
      </div>

      <div className="max-w-[20rem] [--arena-preview-max-height:18vh]">
        <ArenaPreview arena={chosen.arena} name={chosen.name} />
      </div>
    </div>
  );
}
