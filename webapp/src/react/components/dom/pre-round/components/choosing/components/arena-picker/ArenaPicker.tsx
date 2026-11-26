import type {OfferedArena} from "@src/game/pre-round/types/OfferedArena";
import {ArenaPreview} from "@src/react/components/dom/arena-preview/ArenaPreview";
import type {JSX} from "react";

interface Props {
  choices: readonly OfferedArena[];
  chosen: OfferedArena;
  onChoose: (arena: OfferedArena) => void;
}

/**
 * The arenas a player may put forward, one button each, three to a row (the user, 2026-11-26), the chosen one pressed, and beside them a preview
 * of the chosen one: the real tiles, walls, levels and stairs. Side by side, so a room's arena step fits 1280 by 720 whichever five the day offers.
 */
export function ArenaPicker({choices, chosen, onChoose}: Props): JSX.Element {
  return (
    <div role="group" aria-label="Arena" className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold text-gs-ui-text">Arena</h2>

      <div className="flex items-start gap-4">
        <div className="grid min-w-0 flex-1 grid-cols-3 content-start gap-2">
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

        <div className="w-[14rem] shrink-0 [--arena-preview-max-height:18vh]">
          <ArenaPreview arena={chosen.arena} name={chosen.name} />
        </div>
      </div>
    </div>
  );
}
