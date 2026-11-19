import {inventoryIconUrl} from "@src/assets/inventory-icons/InventoryIconUrl";
import {weaponThumbnailUrl} from "@src/assets/weapon-drawings/WeaponThumbnailUrl";
import {useMemo, useState} from "react";
import type {JSX} from "react";

interface Props {
  slot: number;
  name: string | undefined;
  iconKey: string | undefined;
  appearance: unknown;
  selected: boolean;
}

export function InventorySlot({slot, name, iconKey, appearance, selected}: Props): JSX.Element {
  const icon = useMemo(() => iconFor(iconKey, appearance), [iconKey, appearance]);
  const [failedIcon, setFailedIcon] = useState<string>();
  const visibleIcon = icon && icon !== failedIcon;

  return (
    <li
      data-testid={`inventory-slot-${slot}`}
      aria-label={`Slot ${slot}: ${name ?? "Empty"}`}
      aria-current={selected}
      className="relative grid size-12 place-items-center rounded border border-gs-edge/60 bg-gs-ui-surface aria-[current=true]:border-2 aria-[current=true]:border-gs-team-blue"
    >
      <span aria-hidden="true" className="absolute top-0.5 left-1 text-[10px] leading-none text-gs-ui-muted">
        {slot}
      </span>

      {visibleIcon && (
        <img
          data-testid="inventory-icon"
          src={icon}
          alt=""
          width={34}
          height={34}
          onError={() => setFailedIcon(icon)}
        />
      )}

      {!visibleIcon && (
        <span aria-hidden="true" className="text-sm text-gs-ui-muted">
          {name && "◇"}
          {!name && "–"}
        </span>
      )}

      {selected && <span aria-hidden="true" className="absolute bottom-0.5 h-0.5 w-3 rounded bg-gs-ui-text" />}
    </li>
  );
}

function iconFor(iconKey: string | undefined, appearance: unknown): string | undefined {
  if (appearance === undefined) return inventoryIconUrl(iconKey);

  return weaponThumbnailUrl(appearance);
}
