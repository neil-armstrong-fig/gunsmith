import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";
import {weaponAppearances} from "@src/assets/weapon-drawings/appearances/WeaponAppearances";
import {weaponDrawingOfPage} from "@src/game/scenario/weapon-drawing/WeaponDrawingOfPage";
import {InventorySlot} from "@src/react/components/dom/ammo-hud/components/inventory-slot/InventorySlot";
import {selectAmmoReadout} from "@src/store/game/selectors/select-ammo-readout/SelectAmmoReadout";
import {useGameStore} from "@src/store/game/UseGameStore";
import type {JSX} from "react";
import {useShallow} from "zustand/react/shallow";

/**
 * Both carried weapons and the ammunition of the weapon in hand. The magazine bar uses a CSS animation during reload.
 */
export function AmmoHud(): JSX.Element {
  const ammo = useGameStore(useShallow(selectAmmoReadout));
  const [first, second] = useGameStore(
    useShallow(state => [state.world.player.loadout[0]?.weapon, state.world.player.loadout[1]?.weapon]),
  );
  const segments = Array.from({length: ammo.magazineSize}, (_, index) => index);

  return (
    <div
      role="group"
      aria-label="Ammunition"
      data-testid="ammo-hud"
      data-reloading={ammo.reloading}
      className="pointer-events-none fixed bottom-4 left-4 flex w-80 max-w-[calc(100%_-_2rem)] flex-col gap-1 rounded-md bg-gs-ui-surface/80 px-4 py-2 shadow-lg"
    >
      <div className="flex items-baseline justify-between gap-4">
        <span data-testid="inventory-weapon-name" className="min-w-0 truncate text-sm font-bold text-gs-ui-text">
          {ammo.selectedName}
        </span>

        <span className="shrink-0 font-mono text-2xl leading-7 text-gs-ui-text tabular-nums">
          <span data-testid="ammo-rounds">{ammo.rounds}</span>

          <span className="text-gs-ui-muted"> / </span>

          <span data-testid="ammo-reserve">{ammo.reserve}</span>
        </span>
      </div>

      <ul aria-label="Carried weapons" className="flex gap-2">
        <InventorySlot
          slot={1}
          name={ammo.firstName}
          iconKey={ammo.firstIconKey}
          appearance={appearanceOf(first)}
          selected={ammo.slot === 1}
        />

        <InventorySlot
          slot={2}
          name={ammo.secondName}
          iconKey={ammo.secondIconKey}
          appearance={appearanceOf(second)}
          selected={ammo.slot === 2}
        />
      </ul>

      <span data-testid="weapon-slot" className="sr-only">
        {ammo.slot}
      </span>

      <div className="relative flex gap-0.5">
        {segments.map(index => (
          <div
            key={index}
            data-testid="magazine-segment"
            data-loaded={index < ammo.rounds}
            className="h-1 flex-1 rounded-sm bg-gs-ui-muted/30 data-[loaded=true]:bg-gs-warning"
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

function appearanceOf(weapon: Weapon | undefined): unknown {
  if (!weapon) return undefined;

  return weaponAppearances.get(weapon) ?? weaponDrawingOfPage(weapon.identity?.key);
}
