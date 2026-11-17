import {FakeListChatModel} from "@langchain/core/utils/testing";
import {fallbackAppearance} from "@gunsmith/ai/pipeline/appearance/fallback/FallbackAppearance";
import {createWeaponGraph} from "@gunsmith/ai/pipeline/weapon-graph/CreateWeaponGraph";

const CANNED_WEAPON = {
  name: "Proof Rifle",
  bulletDamage: 24,
  fireIntervalSeconds: 0.2,
  bulletSpeed: 20,
  magazineSize: 12,
  reloadSeconds: 1.5,
  startingReserve: 36,
};

const CANNED_VERDICT = {isWeaponRequest: true, reason: "A weapon request."};

/**
 * The real weapon pipeline's topology (`createWeaponGraph`), on canned models so `pnpm dev` and Studio show its eight nodes and
 * run it with no key and no network. The proof graph beside it stays for the Worker spike. Not for production: the Worker hands
 * `createWeaponGraph` the real models.
 */
export const weaponSmithGraph = createWeaponGraph({
  generator: new FakeListChatModel({responses: [JSON.stringify(CANNED_WEAPON)]}),
  moderator: new FakeListChatModel({responses: [JSON.stringify(CANNED_VERDICT)]}),
  appearanceGenerator: new FakeListChatModel({responses: [JSON.stringify(fallbackAppearance())]}),
});
