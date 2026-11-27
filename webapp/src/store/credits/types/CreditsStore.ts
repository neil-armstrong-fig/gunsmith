import type {CreditBalance} from "@src/store/credits/types/CreditBalance";

export interface CreditsStore {
  credits: CreditBalance | undefined;
  load: (creditsUrl: string) => Promise<void>;
}
