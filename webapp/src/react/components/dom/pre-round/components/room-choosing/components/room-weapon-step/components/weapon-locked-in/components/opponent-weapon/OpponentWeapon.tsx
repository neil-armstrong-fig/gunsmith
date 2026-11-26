import {BUILT_IN_WEAPONS} from "@gunsmith/engine/built-in-weapons/BuiltInWeapons";
import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";
import type {ShownWeapon} from "@src/game/room-pre-round/types/ShownWeapon";
import {FoldedOpponentWeapon} from "@src/react/components/dom/pre-round/components/room-choosing/components/room-weapon-step/components/weapon-locked-in/components/opponent-weapon/components/folded-opponent-weapon/FoldedOpponentWeapon";
import {OpenedOpponentWeapon} from "@src/react/components/dom/pre-round/components/room-choosing/components/room-weapon-step/components/weapon-locked-in/components/opponent-weapon/components/opened-opponent-weapon/OpenedOpponentWeapon";
import {OpponentWeaponCard} from "@src/react/components/dom/pre-round/components/room-choosing/components/room-weapon-step/components/weapon-locked-in/components/opponent-weapon/components/opponent-weapon-card/OpponentWeaponCard";
import {nameOfShownWeapon} from "@src/react/components/dom/pre-round/components/room-choosing/components/room-weapon-step/components/weapon-locked-in/shown-weapon-name/NameOfShownWeapon";
import {useRoomPreRoundStore} from "@src/store/room-pre-round/UseRoomPreRoundStore";
import type {JSX} from "react";
import {useState} from "react";

interface Props {
  slot: 1 | 2;
}

/**
 * The other player's weapon in a slot: a built-in from the page's own list, a saved one from the numbers and drawing the server told once. While
 * the player is still choosing their second weapon it is a card as the reveal shows it (drawing, power rating and stats), so they can weigh it
 * first. Once both of the player's weapons are locked in it folds to its picture and name, so the arena step fits the screen, and a press
 * anywhere on it opens or folds it (the user, 2026-11-25 and 26). A weapon the page cannot make out is shown by its name alone.
 */
export function OpponentWeapon({slot}: Props): JSX.Element | undefined {
  const shown = useRoomPreRoundStore(state => state.readout?.opponent.slots[slot - 1]?.shown);
  const bothLocked = useRoomPreRoundStore(state => state.readout?.own.slots[1]?.locked === true);
  const [opened, setOpened] = useState(false);
  if (!shown) {
    return undefined;
  }

  const weapon = weaponOfShown(shown);

  return (
    <>
      {weapon && !bothLocked && <OpponentWeaponCard slot={slot} weapon={weapon} />}

      {weapon && bothLocked && opened && (
        <OpenedOpponentWeapon
          slot={slot}
          weapon={weapon}
          onFold={() => {
            setOpened(false);
          }}
        />
      )}

      {weapon && bothLocked && !opened && (
        <FoldedOpponentWeapon
          slot={slot}
          weapon={weapon}
          onOpen={() => {
            setOpened(true);
          }}
        />
      )}

      {!weapon && (
        <p>
          {"Theirs: "}

          <span data-testid={`room-opponent-weapon-${slot}`}>
            <span data-testid="reveal-weapon-name" className="font-semibold">
              {nameOfShownWeapon(shown)}
            </span>
          </span>
        </p>
      )}
    </>
  );
}

function weaponOfShown(shown: ShownWeapon): Weapon | undefined {
  if (shown.kind === "saved") {
    return shown.weapon;
  }

  return BUILT_IN_WEAPONS.find(weapon => weapon.identity?.key === shown.key);
}
