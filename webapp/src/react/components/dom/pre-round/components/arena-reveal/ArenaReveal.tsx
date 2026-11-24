import type {OfferedArena} from "@src/game/pre-round/types/OfferedArena";
import {ArenaPreview} from "@src/react/components/dom/arena-preview/ArenaPreview";
import type {JSX} from "react";

interface Props {
  arena: OfferedArena;
}

/** The arena the match is played on, with a preview of it. */
export function ArenaReveal({arena}: Props): JSX.Element {
  return (
    <section data-testid="reveal-arena" className="flex max-w-[22rem] flex-col gap-1 [--arena-preview-max-height:22vh]">
      <h2 className="text-lg font-semibold text-gs-ui-text">Arena</h2>

      <p data-testid="reveal-arena-name" className="font-semibold wrap-anywhere text-gs-ui-text">
        {arena.name}
      </p>

      <ArenaPreview arena={arena.arena} name={arena.name} />
    </section>
  );
}
