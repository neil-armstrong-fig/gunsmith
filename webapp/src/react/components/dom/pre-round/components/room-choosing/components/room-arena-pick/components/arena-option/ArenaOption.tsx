import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import type {ShownArena} from "@src/game/online-pre-round/types/ShownArena";
import {ArenaPreview} from "@src/react/components/dom/arena-preview/ArenaPreview";
import type {JSX} from "react";

interface Props {
  title: string;
  arena: ShownArena | undefined;
}

/** One of the two arenas the players pick between: whose it is and its name, with a preview of it once the server has sent its drawing. Nothing while there is no arena to show. */
export function ArenaOption({title, arena}: Props): JSX.Element | undefined {
  if (!arena) {
    return undefined;
  }

  return (
    <div className="flex max-w-[16rem] flex-col gap-1 [--arena-preview-max-height:16vh]">
      <h3 className="font-semibold">{`${title}: ${arena.name}`}</h3>

      {arena.rows && <ArenaPreview arena={arenaFrom(arena.rows)} name={arena.name} />}
    </div>
  );
}
