import type {WeaponChoice} from "@src/react/components/dom/pre-round/components/choosing/choices/types/WeaponChoice";
import {WeaponPicture} from "@src/react/components/dom/pre-round/components/weapon-picture/WeaponPicture";
import type {JSX} from "react";

interface Props {
  slot: number;
  choices: readonly WeaponChoice[];
  chosenId: string;
  onChoose: (id: string) => void;
}

/** The weapons a player may take for one slot, one button each, the chosen one pressed. */
export function WeaponPicker({slot, choices, chosenId, onChoose}: Props): JSX.Element {
  return (
    <div role="group" aria-label={`Weapon ${slot}`} className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold text-gs-ui-text">{`Weapon ${slot}`}</h2>

      <div className="flex flex-wrap gap-2">
        {choices.map(choice => (
          <button
            key={choice.id}
            type="button"
            aria-pressed={choice.id === chosenId}
            className="flex items-center gap-2 rounded-md bg-gs-background px-3 py-2 text-gs-ui-text aria-pressed:outline-2 aria-pressed:outline-gs-team-blue"
            onClick={() => {
              onChoose(choice.id);
            }}
          >
            <WeaponPicture weapon={choice.weapon} />

            {choice.weapon.identity?.name ?? "Weapon"}
          </button>
        ))}
      </div>
    </div>
  );
}
