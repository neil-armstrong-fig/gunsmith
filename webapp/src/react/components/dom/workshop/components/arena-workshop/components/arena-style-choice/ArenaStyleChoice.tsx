import {ARENA_STYLES} from "@gunsmith/shared/arena-style/ArenaStyle";
import type {ArenaStyle} from "@gunsmith/shared/arena-style/ArenaStyle";
import {useArenaWorkshopStore} from "@src/store/workshop/arena/UseArenaWorkshopStore";
import type {JSX} from "react";

const [OFF_STYLE, ON_STYLE] = ARENA_STYLES;

/**
 * Blue or red as a toggle switch: blue on the left (off), red on the right (on). The whole row is the one control, so a press on either
 * word or on the track toggles it, and the colour of the choice shows on the prompt box beneath (`ArenaPrompt`). It says nothing about how the arena is made. The choice is kept in
 * the store, so shutting the workshop keeps it.
 */
export function ArenaStyleChoice(): JSX.Element {
  const chosen = useArenaWorkshopStore(state => state.style);

  return (
    <div className="flex flex-col gap-1">
      <span id="arena-style-caption" className="text-xs uppercase tracking-wide text-gs-ui-muted">
        Generation Engine
      </span>

      <button
        type="button"
        role="switch"
        aria-checked={chosen === ON_STYLE}
        aria-labelledby="arena-style-caption"
        className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-md border border-gs-edge/40 bg-gs-background px-3 py-2 text-sm"
        onClick={() => {
          useArenaWorkshopStore.getState().setStyle(otherStyleThan(chosen));
        }}
      >
        <span className={labelColourOf(chosen === OFF_STYLE)}>Blue</span>

        <span className={`relative h-6 w-11 rounded-full transition-colors ${trackColourOf(chosen)}`}>
          <span
            className={`absolute left-0.5 top-0.5 size-5 rounded-full bg-gs-ui-text transition-transform ${thumbPositionOf(chosen)}`}
          />
        </span>

        <span className={labelColourOf(chosen === ON_STYLE)}>Red</span>
      </button>
    </div>
  );
}

function otherStyleThan(style: ArenaStyle): ArenaStyle {
  if (style === OFF_STYLE) {
    return ON_STYLE;
  }

  return OFF_STYLE;
}

function trackColourOf(style: ArenaStyle): string {
  if (style === ON_STYLE) {
    return "bg-gs-ring";
  }

  return "bg-gs-team-blue";
}

function thumbPositionOf(style: ArenaStyle): string {
  if (style === ON_STYLE) {
    return "translate-x-5";
  }

  return "translate-x-0";
}

function labelColourOf(active: boolean): string {
  if (active) {
    return "font-semibold text-gs-ui-text";
  }

  return "text-gs-ui-muted";
}
