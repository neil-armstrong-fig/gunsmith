import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {BUILT_IN_ARENAS} from "@gunsmith/engine/built-in-arenas/BuiltInArenas";
import {ArenaPreview} from "@src/react/components/dom/arena-preview/ArenaPreview";
import type {JSX} from "react";
import {useLayoutEffect, useRef, useState} from "react";

const BUILT_INS = BUILT_IN_ARENAS.map(({name, rows}) => ({name, arena: arenaFrom(rows)}));

export function ArenaWorkshop(): JSX.Element {
  const [selected, setSelected] = useState<(typeof BUILT_INS)[number]>();
  const resultRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    resultRef.current?.scrollIntoView({block: "nearest"});
  }, [selected]);

  return (
    <div className="flex flex-col gap-3">
      <section aria-label="Built-in arenas">
        <h2 className="mb-2 text-sm font-semibold">Built-in arenas</h2>

        <div className="grid grid-cols-2 gap-2 [@media(max-height:680px)]:[--arena-preview-max-height:13vh]">
          {BUILT_INS.map(builtIn => (
            <div key={builtIn.name} className="min-w-0 rounded-md bg-gs-background p-2">
              <button
                type="button"
                aria-pressed={selected === builtIn}
                className="mb-2 w-full rounded-sm border border-gs-edge/40 px-2 py-1 text-sm aria-pressed:border-gs-team-blue"
                onClick={() => {
                  if (selected === builtIn) {
                    resultRef.current?.scrollIntoView({block: "nearest"});
                    return;
                  }

                  setSelected(builtIn);
                }}
              >
                {builtIn.name}
              </button>

              <ArenaPreview arena={builtIn.arena} name={builtIn.name} />
            </div>
          ))}
        </div>
      </section>

      {selected && (
        <section
          ref={resultRef}
          aria-label="Arena result"
          className="rounded-md bg-gs-background p-3 [@media(max-height:680px)]:[--arena-preview-max-height:24vh]"
        >
          <h2 className="font-semibold">{selected.name}</h2>

          <p className="mb-2 text-sm text-gs-ui-muted">
            {selected.arena.width} × {selected.arena.height} tiles · {levelsOf(selected.arena)}
          </p>

          <ArenaPreview arena={selected.arena} name={selected.name} />
        </section>
      )}
    </div>
  );
}

function levelsOf(arena: Arena): string {
  const count = Math.max(...arena.levels) + 1;
  if (count === 1) return "1 level";

  return `${count} levels`;
}
