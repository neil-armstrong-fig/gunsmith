import {arenaChoicesOf} from "@src/react/components/dom/pre-round/components/choosing/choices/ArenaChoicesOf";
import {chosenChoiceOf} from "@src/react/components/dom/pre-round/components/choosing/choices/ChosenChoiceOf";
import {weaponChoicesOf} from "@src/react/components/dom/pre-round/components/choosing/choices/WeaponChoicesOf";
import {ArenaPicker} from "@src/react/components/dom/pre-round/components/choosing/components/arena-picker/ArenaPicker";
import {WeaponPicker} from "@src/react/components/dom/pre-round/components/choosing/components/weapon-picker/WeaponPicker";
import {usePreRoundChoicesStore} from "@src/store/pre-round-choices/UsePreRoundChoicesStore";
import {useBotPreRoundStore} from "@src/store/bot-pre-round/UseBotPreRoundStore";
import {useArenaShelfStore} from "@src/store/shelf/arena/UseArenaShelfStore";
import {useShelfStore} from "@src/store/shelf/UseShelfStore";
import type {JSX} from "react";
import {useMemo, useState} from "react";

/** What a player has chosen before they choose anything: the rifle and the marksman rifle on the Duel, a match as it is without a pre-round. */
const DEFAULT_FIRST_WEAPON_ID = "rifle";
const DEFAULT_SECOND_WEAPON_ID = "marksman-rifle";
const DEFAULT_ARENA_ID = "built-in:Duel";

/**
 * The first step: a weapon for each slot and an arena, from the built-ins and the shelf, beginning on what the player locked in last time (or the defaults, when that is gone).
 * Free and instant: nothing is written or made here, and the bot puts nothing forward, so the player's arena is the arena.
 */
export function Choosing(): JSX.Element | undefined {
  const savedWeapons = useShelfStore(state => state.weapons);
  const savedArenas = useArenaShelfStore(state => state.arenas);
  const weaponChoices = useMemo(() => weaponChoicesOf(savedWeapons), [savedWeapons]);
  const arenaChoices = useMemo(() => arenaChoicesOf(savedArenas), [savedArenas]);
  const [firstId, setFirstId] = useState(() => usePreRoundChoicesStore.getState().firstWeaponId);
  const [secondId, setSecondId] = useState(() => usePreRoundChoicesStore.getState().secondWeaponId);
  const [arenaId, setArenaId] = useState(() => usePreRoundChoicesStore.getState().arenaId);
  const first = chosenChoiceOf(weaponChoices, firstId, DEFAULT_FIRST_WEAPON_ID);
  const second = chosenChoiceOf(weaponChoices, secondId, DEFAULT_SECOND_WEAPON_ID);
  const arena = chosenChoiceOf(arenaChoices, arenaId, DEFAULT_ARENA_ID);
  if (!first || !second || !arena) {
    return undefined;
  }

  return (
    <>
      <WeaponPicker slot={1} choices={weaponChoices} chosenId={first.id} onChoose={setFirstId} />

      <WeaponPicker slot={2} choices={weaponChoices} chosenId={second.id} onChoose={setSecondId} />

      <ArenaPicker
        choices={arenaChoices}
        chosen={arena}
        onChoose={choice => {
          setArenaId(choice.id);
        }}
      />

      <button
        type="button"
        className="self-start rounded-md bg-gs-team-blue px-6 py-3 text-lg font-semibold text-gs-background"
        onClick={() => {
          usePreRoundChoicesStore.getState().remember({
            firstWeaponId: first.id,
            secondWeaponId: second.id,
            arenaId: arena.id,
          });
          useBotPreRoundStore.getState().lockIn({first: first.weapon, second: second.weapon}, arena);
        }}
      >
        Lock in
      </button>
    </>
  );
}
