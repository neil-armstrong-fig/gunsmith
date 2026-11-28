import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";
import {ArenaReveal} from "@src/react/components/dom/pre-round/components/arena-reveal/ArenaReveal";
import {Side} from "@src/react/components/dom/pre-round/components/side/Side";
import type {SlotWeapon} from "@src/react/components/dom/pre-round/components/side/types/SlotWeapon";
import {startTheMatch} from "@src/react/components/dom/pre-round/components/reveal/start-match/StartTheMatch";
import {gameState} from "@src/store/game/selectors/game-state/GameState";
import {useBotPreRoundStore} from "@src/store/bot-pre-round/UseBotPreRoundStore";
import type {JSX} from "react";

/** The last step: both fighters' weapons side by side with their ratings and stats, the opponent's as the match will give it, and beside them the arena the player chose and the button that begins round 1. */
export function Reveal(): JSX.Element | undefined {
  const picks = useBotPreRoundStore(state => state.picks);
  const arena = useBotPreRoundStore(state => state.arena);
  if (!picks || !arena) {
    return undefined;
  }

  const opponent = gameState().opponent?.loadout.map(carried => carried.weapon) ?? [];

  return (
    <div className="flex gap-6">
      <div data-testid="reveal" className="flex min-w-0 flex-1 gap-4">
        <Side testId="reveal-yours" title="You" weapons={inSlots([picks.first, picks.second])} />

        <Side testId="reveal-opponent" title="The bot" weapons={inSlots(opponent)} />
      </div>

      <div className="flex w-[22rem] shrink-0 flex-col gap-4">
        <ArenaReveal arena={arena} />

        <button
          type="button"
          className="self-start rounded-md bg-gs-team-blue px-6 py-3 text-lg font-semibold text-gs-background"
          onClick={() => {
            startTheMatch(picks, arena);
          }}
        >
          Start the match
        </button>
      </div>
    </div>
  );
}

function inSlots(weapons: readonly Weapon[]): SlotWeapon[] {
  return weapons.map((weapon, position) => ({slot: position + 1, weapon}));
}
