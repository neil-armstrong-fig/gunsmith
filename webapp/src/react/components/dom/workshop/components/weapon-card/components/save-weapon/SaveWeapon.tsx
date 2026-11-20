import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";
import {ratingPercentOf} from "@src/react/components/dom/workshop/rating-percent/RatingPercentOf";
import {useShelfStore} from "@src/store/shelf/UseShelfStore";
import type {ShelfWeaponRequest} from "@src/store/shelf/types/ShelfWeaponRequest";
import {useWorkshopStore} from "@src/store/workshop/UseWorkshopStore";
import type {JSX} from "react";
import {useState} from "react";

interface Props {
  weapon: Weapon;
}

/**
 * Save, for the weapon on the card: it goes on the shelf with the words that made it. It says **Saved** while the shelf still holds it. With the shelf full it asks which
 * saved weapon to replace and drops nothing until the player chooses; Cancel leaves everything as it was.
 */
export function SaveWeapon({weapon}: Props): JSX.Element {
  // The weapon the question is about, not a flag: a new Make gives a new weapon, which ends the question without anyone having to.
  const [askedAbout, setAskedAbout] = useState<Weapon>();
  const saved = useShelfStore(state => state.weapons);
  const limit = useShelfStore(state => state.weaponLimit);
  const savedId = useWorkshopStore(state => state.savedId);

  const isSaved = savedId !== undefined && saved.some(item => item.id === savedId);
  const asking = askedAbout === weapon && saved.length >= limit;

  return (
    <>
      {isSaved && (
        <button type="button" disabled className="rounded-md border border-gs-edge/40 px-5 py-2 text-gs-ui-muted">
          Saved
        </button>
      )}

      {!isSaved && (
        <>
          {!asking && (
            <button
              type="button"
              className="rounded-md border border-gs-team-blue px-5 py-2 font-semibold text-gs-team-blue"
              onClick={() => {
                const id = useShelfStore.getState().saveWeapon(requestOf(weapon));
                if (id === undefined) {
                  setAskedAbout(weapon);
                  return;
                }

                useWorkshopStore.getState().setSavedId(id);
              }}
            >
              Save
            </button>
          )}

          {asking && (
            <div
              role="group"
              aria-label="Replace which weapon?"
              className="flex w-full flex-col gap-2 rounded-md border border-gs-edge/40 px-3 py-2"
            >
              <p className="text-sm text-gs-ui-muted">The shelf is full. Replace which weapon?</p>

              <ul className="flex flex-col gap-1">
                {saved.map(item => (
                  <li key={item.id} className="flex items-center justify-between gap-3">
                    <span className="min-w-0 truncate text-sm text-gs-ui-text">
                      {item.weapon.identity?.name ?? "Weapon"}
                      <span className="text-gs-ui-muted"> · {ratingPercentOf(item.weapon)}</span>
                    </span>

                    <button
                      type="button"
                      className="rounded-sm border border-gs-edge/40 px-2 py-0.5 text-sm text-gs-ui-text"
                      onClick={() => {
                        const id = useShelfStore.getState().replaceWeapon(item.id, requestOf(weapon));
                        if (id !== undefined) {
                          useWorkshopStore.getState().setSavedId(id);
                        }

                        setAskedAbout(undefined);
                      }}
                    >
                      Replace
                    </button>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className="self-start rounded-sm px-2 py-0.5 text-sm text-gs-ui-muted"
                onClick={() => {
                  setAskedAbout(undefined);
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}

function requestOf(weapon: Weapon): ShelfWeaponRequest {
  return {prompt: useWorkshopStore.getState().madeFromPrompt, weapon};
}
