import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {BUILT_IN_ARENAS} from "@gunsmith/engine/built-in-arenas/BuiltInArenas";
import {ArenaPreview} from "@src/react/components/dom/arena-preview/ArenaPreview";
import {walkTheArena} from "@src/react/components/dom/workshop/arena-on-trial/WalkTheArena";
import {ArenaPrompt} from "@src/react/components/dom/workshop/components/arena-workshop/components/arena-prompt/ArenaPrompt";
import {ArenaResult} from "@src/react/components/dom/workshop/components/arena-workshop/components/arena-result/ArenaResult";
import {ArenaShelf} from "@src/react/components/dom/workshop/components/arena-workshop/components/arena-shelf/ArenaShelf";
import {SaveArena} from "@src/react/components/dom/workshop/components/arena-workshop/components/save-arena/SaveArena";
import {SaveAccountItem} from "@src/react/components/dom/workshop/components/save-account-item/SaveAccountItem";
import {useAccountLibraryStore} from "@src/store/account-library/UseAccountLibraryStore";
import {useArenaWorkshopStore} from "@src/store/workshop/arena/UseArenaWorkshopStore";
import type {JSX} from "react";
import {useLayoutEffect, useRef} from "react";

const BUILT_INS = BUILT_IN_ARENAS.map(({name, rows}) => ({name, rows, arena: arenaFrom(rows)}));

export function ArenaWorkshop(): JSX.Element {
  const result = useArenaWorkshopStore(state => state.result);
  const session = useAccountLibraryStore(state => state.session);
  const resultRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    resultRef.current?.scrollIntoView({block: "nearest"});
  }, [result]);

  return (
    <div className="flex flex-col gap-3">
      <ArenaPrompt />

      <section aria-label="Built-in arenas">
        <h2 className="mb-2 text-sm font-semibold">Built-in arenas</h2>

        <div className="grid grid-cols-2 gap-2 [@media(max-height:680px)]:[--arena-preview-max-height:13vh]">
          {BUILT_INS.map(builtIn => (
            <div key={builtIn.name} className="min-w-0 rounded-md bg-gs-background p-2">
              <button
                type="button"
                aria-pressed={result === builtIn}
                className="mb-2 w-full rounded-sm border border-gs-edge/40 px-2 py-1 text-sm aria-pressed:border-gs-team-blue"
                onClick={() => {
                  if (result === builtIn) {
                    resultRef.current?.scrollIntoView({block: "nearest"});
                    return;
                  }

                  useArenaWorkshopStore.getState().setResult(builtIn);
                }}
              >
                {builtIn.name}
              </button>

              <ArenaPreview arena={builtIn.arena} name={builtIn.name} isScreenshot />
            </div>
          ))}
        </div>
      </section>

      {result && (
        <ArenaResult ref={resultRef} arena={result.arena} name={result.name}>
          {result.fallbackReason && (
            <p role="status" className="mt-2 text-sm text-gs-ui-muted">
              {result.fallbackReason}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-start gap-2">
            <button
              type="button"
              className="rounded-md bg-gs-team-blue px-4 py-1.5 font-semibold text-gs-background"
              onClick={() => {
                walkTheArena(result.arena);
              }}
            >
              Walk it
            </button>

            {session === "guest" && result.madeFromPrompt !== undefined && (
              <SaveArena result={result} prompt={result.madeFromPrompt} />
            )}

            {session === "signed-in" && result.accountItemId !== undefined && (
              <SaveAccountItem kind="arena" key={result.accountItemId} id={result.accountItemId} />
            )}
          </div>
        </ArenaResult>
      )}

      <ArenaShelf />
    </div>
  );
}
