import {promptReadoutOf} from "@src/react/components/dom/workshop/components/workshop-prompt/readout/PromptReadoutOf";
import type {JSX} from "react";

interface Props {
  id: string;
  label: string;
  prompt: string;
  limit: number;
  placeholder?: string;
  onPromptChange: (prompt: string) => void;
  onMake: () => void;
}

export function WorkshopPrompt({id, label, prompt, limit, placeholder, onPromptChange, onMake}: Props): JSX.Element {
  const readout = promptReadoutOf(prompt, limit);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm text-gs-ui-muted">
        {label}
      </label>

      <textarea
        id={id}
        rows={4}
        value={prompt}
        placeholder={placeholder}
        aria-invalid={readout.over}
        className="w-full resize-none rounded-md border border-gs-edge/40 bg-gs-background px-3 py-2 text-gs-ui-text aria-[invalid=true]:border-gs-ring"
        onChange={event => {
          onPromptChange(event.target.value);
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
          onClick={onMake}
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
