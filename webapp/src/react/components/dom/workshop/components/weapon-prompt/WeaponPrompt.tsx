import {promptReadoutOf} from "@src/react/components/dom/workshop/components/weapon-prompt/readout/PromptReadoutOf";
import {standInWeaponFor} from "@src/react/components/dom/workshop/components/weapon-prompt/stand-in/StandInWeaponFor";
import {useWorkshopStore} from "@src/store/workshop/UseWorkshopStore";
import type {JSX} from "react";

/** Where a weapon is described: the box, a live count of characters against the limit (red and Make off while over, the text kept), and Make. */
export function WeaponPrompt(): JSX.Element {
  const prompt = useWorkshopStore(state => state.prompt);
  const readout = promptReadoutOf(prompt);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="workshop-weapon-prompt" className="text-sm text-gs-ui-muted">
        Describe your weapon
      </label>

      <textarea
        id="workshop-weapon-prompt"
        rows={4}
        value={prompt}
        aria-invalid={readout.over}
        className="w-full resize-none rounded-md border border-gs-edge/40 bg-gs-background px-3 py-2 text-gs-ui-text aria-[invalid=true]:border-gs-ring"
        onChange={event => {
          useWorkshopStore.getState().setPrompt(event.target.value);
        }}
      />

      <div className="flex items-center justify-between gap-4">
        <p data-testid="workshop-count" className={`font-mono text-sm tabular-nums ${countColourOf(readout.over)}`}>
          {readout.length} / {readout.limit}
        </p>

        <button
          type="button"
          disabled={!readout.canMake}
          className="rounded-md bg-gs-team-blue px-5 py-2 font-semibold text-gs-background disabled:opacity-40"
          onClick={() => {
            useWorkshopStore.getState().setWeapon(standInWeaponFor(prompt));
          }}
        >
          Make
        </button>
      </div>
    </div>
  );
}

function countColourOf(over: boolean): string {
  if (over) {
    return "text-gs-ring";
  }

  return "text-gs-ui-muted";
}
