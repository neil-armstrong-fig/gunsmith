import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";
import {Side} from "@src/react/components/dom/pre-round/components/reveal/components/side/Side";
import type {SlotWeapon} from "@src/react/components/dom/pre-round/components/reveal/types/SlotWeapon";
import {startTheMatch} from "@src/react/components/dom/pre-round/components/reveal/start-match/StartTheMatch";
import {gameState} from "@src/store/game/selectors/game-state/GameState";
import {usePreRoundStore} from "@src/store/pre-round/UsePreRoundStore";
import type {JSX} from "react";

/** The second step: both fighters' weapons side by side, the opponent's as the match will give it, and the button that begins round 1. */
export function Reveal(): JSX.Element | undefined {
  const picks = usePreRoundStore(state => state.picks);
  if (!picks) {
    return undefined;
  }

  const opponent = gameState().opponent?.loadout.map(carried => carried.weapon) ?? [];

  return (
    <>
      <div data-testid="reveal" className="flex gap-8">
        <Side testId="reveal-yours" title="You" weapons={inSlots([picks.first, picks.second])} />

        <Side testId="reveal-opponent" title="The bot" weapons={inSlots(opponent)} />
      </div>

      <button
        type="button"
        className="self-start rounded-md bg-gs-team-blue px-6 py-3 text-lg font-semibold text-gs-background"
        onClick={() => {
          startTheMatch(picks);
        }}
      >
        Start the match
      </button>
    </>
  );
}

function inSlots(weapons: readonly Weapon[]): SlotWeapon[] {
  return weapons.map((weapon, position) => ({slot: position + 1, weapon}));
}
