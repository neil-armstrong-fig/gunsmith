import {ArenaPreview} from "@src/react/components/dom/arena-preview/ArenaPreview";
import {usePreRoundStore} from "@src/store/pre-round/UsePreRoundStore";
import type {JSX} from "react";

/** The arena the match is played on, the one the player chose, with a preview of it. */
export function ArenaReveal(): JSX.Element | undefined {
  const arena = usePreRoundStore(state => state.arena);
  if (!arena) {
    return undefined;
  }

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
