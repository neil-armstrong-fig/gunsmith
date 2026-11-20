import type {StartingPlaces} from "@gunsmith/engine/arena-symmetry/types/StartingPlaces";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {ArenaPreview} from "@src/react/components/dom/arena-preview/ArenaPreview";
import type {JSX, ReactNode, Ref} from "react";

interface Props {
  arena: Arena;
  name: string;
  startingPlaces?: StartingPlaces;
  ref: Ref<HTMLElement>;
  children?: ReactNode;
}

export function ArenaResult({arena, name, startingPlaces, ref, children}: Props): JSX.Element {
  return (
    <section
      ref={ref}
      aria-label="Arena result"
      className="rounded-md bg-gs-background p-3 [@media(max-height:680px)]:[--arena-preview-max-height:24vh]"
    >
      <h2 className="font-semibold wrap-anywhere">{name}</h2>

      <p className="mb-2 text-sm text-gs-ui-muted">
        {arena.width} × {arena.height} tiles · {levelsOf(arena)}
      </p>

      <ArenaPreview arena={arena} name={name} startingPlaces={startingPlaces} />

      {children}
    </section>
  );
}

function levelsOf(arena: Arena): string {
  const count = Math.max(...arena.levels) + 1;
  if (count === 1) return "1 level";

  return `${count} levels`;
}
