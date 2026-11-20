import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";
import {SaveWeaponButton} from "@src/react/components/dom/workshop/components/weapon-card/components/save-weapon/components/save-weapon-button/SaveWeaponButton";
import {SavedWeaponButton} from "@src/react/components/dom/workshop/components/weapon-card/components/save-weapon/components/saved-weapon-button/SavedWeaponButton";
import {WeaponReplacementPicker} from "@src/react/components/dom/workshop/components/weapon-card/components/save-weapon/components/weapon-replacement-picker/WeaponReplacementPicker";
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

  const save = (): void => {
    const id = useShelfStore.getState().saveWeapon(requestOf(weapon));
    if (id === undefined) {
      setAskedAbout(weapon);
      return;
    }

    useWorkshopStore.getState().setSavedId(id);
  };

  const replace = (idToReplace: string): void => {
    const id = useShelfStore.getState().replaceWeapon(idToReplace, requestOf(weapon));
    if (id !== undefined) {
      useWorkshopStore.getState().setSavedId(id);
    }

    setAskedAbout(undefined);
  };

  const cancel = (): void => {
    setAskedAbout(undefined);
  };

  if (isSaved) {
    return <SavedWeaponButton />;
  }

  if (asking) {
    return <WeaponReplacementPicker weapons={saved} onReplace={replace} onCancel={cancel} />;
  }

  return <SaveWeaponButton onSave={save} />;
}

function requestOf(weapon: Weapon): ShelfWeaponRequest {
  return {prompt: useWorkshopStore.getState().madeFromPrompt, weapon};
}
