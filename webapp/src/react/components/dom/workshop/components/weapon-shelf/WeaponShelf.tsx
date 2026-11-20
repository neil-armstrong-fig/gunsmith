import {ShelfItem} from "@src/react/components/dom/workshop/components/weapon-shelf/components/shelf-item/ShelfItem";
import {useShelfStore} from "@src/store/shelf/UseShelfStore";
import type {JSX} from "react";

/** The weapons a player has saved, with how many of the shelf's places they fill. Saved weapons need no AI, so the shelf is there whatever the making is doing. */
export function WeaponShelf(): JSX.Element {
  const weapons = useShelfStore(state => state.weapons);
  const limit = useShelfStore(state => state.weaponLimit);

  return (
    <section aria-label="Weapon shelf" className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-sm font-semibold text-gs-ui-text">Saved weapons</h2>

        <p data-testid="shelf-count" className="font-mono text-sm text-gs-ui-muted tabular-nums">
          {weapons.length} of {limit}
        </p>
      </div>

      {weapons.length === 0 && (
        <p className="text-sm text-gs-ui-muted">Nothing saved yet. Make a weapon and press Save.</p>
      )}

      {weapons.length > 0 && (
        <ul className="flex flex-col gap-2">
          {weapons.map(saved => (
            <ShelfItem key={saved.id} saved={saved} />
          ))}
        </ul>
      )}
    </section>
  );
}
