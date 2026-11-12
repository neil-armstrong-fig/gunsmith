import {selectAmmoReadout} from "@src/store/game/selectors/select-ammo-readout/SelectAmmoReadout";
import {useGameStore} from "@src/store/game/UseGameStore";
import type {JSX} from "react";
import {useShallow} from "zustand/react/shallow";

/**
 * The ammunition of the weapon in hand, over the bottom left of the arena: its slot, the rounds in the magazine and the
 * reserve, and a bar with a segment for each round the magazine holds. While a reload runs, a blue fill sweeps the bar
 * over the time the reload takes (a CSS animation, so React never sees a per-frame value). It re-renders only when
 * the numbers change, which is a few times a second at most, though the world behind it is replaced every frame.
 */
export function AmmoHud(): JSX.Element {
  const ammo = useGameStore(useShallow(selectAmmoReadout));
  const segments = Array.from({length: ammo.magazineSize}, (_, index) => index);

  return (
    <div
      role="group"
      aria-label="Ammunition"
      data-testid="ammo-hud"
      data-reloading={ammo.reloading}
      className="pointer-events-none fixed bottom-4 left-4 flex flex-col gap-2 rounded-md bg-gs-ui-surface/80 px-4 py-3 shadow-lg"
    >
      <div className="flex items-baseline justify-between gap-6">
        <span className="text-xs tracking-wide text-gs-ui-muted uppercase">
          Weapon <span data-testid="weapon-slot">{ammo.slot}</span>
        </span>

        <span className="font-mono text-2xl text-gs-ui-text tabular-nums">
          <span data-testid="ammo-rounds">{ammo.rounds}</span>

          <span className="text-gs-ui-muted"> / </span>

          <span data-testid="ammo-reserve">{ammo.reserve}</span>
        </span>
      </div>

      <div className="relative flex gap-1">
        {segments.map(index => (
          <div
            key={index}
            data-testid="magazine-segment"
            data-loaded={index < ammo.rounds}
            className="h-2 w-3 rounded-sm bg-gs-ui-muted/30 data-[loaded=true]:bg-gs-warning"
          />
        ))}

        {ammo.reloading && (
          <div
            className="animate-reload-fill absolute inset-0 origin-left rounded-sm bg-gs-team-blue/80"
            style={{animationDuration: `${ammo.reloadSeconds}s`}}
          />
        )}
      </div>
    </div>
  );
}
