import {FakeListChatModel} from "@langchain/core/utils/testing";
import {fallbackAppearance} from "@gunsmith/shared/appearance/fallback/FallbackAppearance";
import {createWeaponGraph} from "@gunsmith/ai/pipeline/weapon/graph/CreateWeaponGraph";

const CANNED_WEAPON = {
  name: "Studio Rifle",
  bulletDamage: 24,
  fireIntervalSeconds: 0.2,
  bulletSpeed: 20,
  magazineSize: 12,
  reloadSeconds: 1.5,
  startingReserve: 36,
  visionDegrees: 90,
  visionRange: 12,
};

const CANNED_VERDICT = {isWeaponRequest: true, reason: "A weapon request."};

/**
 * The real weapon pipeline's topology (`createWeaponGraph`), on canned models, so `pnpm dev` and LangGraph Studio show its eight
 * steps and run it with no key and no network. Named in `ai/langgraph.json`. Not for production: `api/` hands `generateWeapon` the
 * real models.
 */
export const weaponSmithGraph = createWeaponGraph({
  generator: new FakeListChatModel({responses: [JSON.stringify(CANNED_WEAPON)]}),
  moderator: new FakeListChatModel({responses: [JSON.stringify(CANNED_VERDICT)]}),
  appearanceGenerator: new FakeListChatModel({responses: [JSON.stringify(fallbackAppearance())]}),
});
