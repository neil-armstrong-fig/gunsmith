import type {CreditsStore} from "@src/store/credits/types/CreditsStore";
import {z} from "zod";
import {create} from "zustand";

const creditsAnswer = z.object({
  balance: z.number().nonnegative(),
  dailyAllowance: z.number().int().nonnegative(),
  prices: z.object({weapon: z.number().nonnegative()}),
});

let creditsRequest = 0;

/**
 * A signed-in player's credits, read from `GET /api/credits` (`api/` `CreditStatusRoute`): a read that costs nothing. Only the
 * newest answer is kept, and one that fails or does not parse leaves the last balance as it was.
 */
export const useCreditsStore = create<CreditsStore>()(set => ({
  credits: undefined,
  load: async creditsUrl => {
    const request = ++creditsRequest;
    try {
      const response = await fetch(creditsUrl, {credentials: "include"});
      if (!response.ok) return;

      const answer = creditsAnswer.safeParse(await response.json());
      if (!answer.success || request !== creditsRequest) return;

      const {balance, dailyAllowance, prices} = answer.data;
      set({credits: {balance, dailyAllowance, makePrice: prices.weapon}});
    } catch {
      return;
    }
  },
}));
