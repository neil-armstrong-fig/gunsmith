import type {CreditLedger} from "@src/ai/credits/CreditLedger";
import type {WeaponSmith} from "@src/generation/types/WeaponSmith";

/** A weapon request whose credit is reserved: what it takes to run the pipeline and then settle or refund that reservation. */
export interface WeaponSettlement {
  credits: DurableObjectStub<CreditLedger>;
  key: string;
  prompt: string;
  weaponSmith: WeaponSmith;
}
