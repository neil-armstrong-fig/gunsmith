import type {CreditLedger} from "@src/ai/credits/CreditLedger";
import type {SpendLedger} from "@src/ai/spend/SpendLedger";
import type {WeaponSmith} from "@src/generation/types/WeaponSmith";

/** A weapon request whose credit and spend are reserved: what it takes to run the pipeline and then settle or refund those reservations. */
export interface WeaponSettlement {
  credits: DurableObjectStub<CreditLedger>;
  spend: DurableObjectStub<SpendLedger>;
  key: string;
  prompt: string;
  weaponSmith: WeaponSmith;
}
