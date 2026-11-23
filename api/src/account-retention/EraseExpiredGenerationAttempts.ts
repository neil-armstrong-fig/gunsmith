import {sweepGenerationAttempts} from "@src/accounts/sweep-generation-attempts/SweepGenerationAttempts";

export async function eraseExpiredGenerationAttempts(now: Date): Promise<void> {
  try {
    await sweepGenerationAttempts(now);
  } catch {
    console.warn(JSON.stringify({route: "account", outcome: "generation-history-not-swept"}));
  }
}
