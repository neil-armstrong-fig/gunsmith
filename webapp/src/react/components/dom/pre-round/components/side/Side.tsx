import {RevealedWeapon} from "@src/react/components/dom/pre-round/components/side/components/revealed-weapon/RevealedWeapon";
import type {SlotWeapon} from "@src/react/components/dom/pre-round/components/side/types/SlotWeapon";
import type {JSX} from "react";

interface Props {
  testId: string;
  title: string;
  weapons: readonly SlotWeapon[];
}

/** One fighter's weapons in the reveal, under a title, one card for each slot with its power rating and stats. */
export function Side({testId, title, weapons}: Props): JSX.Element {
  return (
    <section data-testid={testId} className="flex min-w-0 flex-1 flex-col gap-2">
      <h2 className="text-lg font-semibold text-gs-ui-text">{title}</h2>

      <ul className="flex flex-col gap-2">
        {weapons.map(({slot, weapon}) => (
          <li
            key={slot}
            data-testid="reveal-weapon"
            className="rounded-md border border-gs-edge/40 bg-gs-background/35 px-3 py-2"
          >
            <RevealedWeapon weapon={weapon} />
          </li>
        ))}
      </ul>
    </section>
  );
}
