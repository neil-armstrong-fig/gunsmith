import type {ArenaOutcome} from "@gunsmith/ai/pipeline/arena/types/ArenaOutcome";
import type {ArenaHistoryPrivacyCheck} from "@src/router/routes/arenas/history/types/ArenaHistoryPrivacyCheck";

export async function clearedArenaPrompt(
  outcome: ArenaOutcome,
  privacyCheck: ArenaHistoryPrivacyCheck,
  prompt: string,
): Promise<string | undefined> {
  if (outcome.status === "rejected" || outcome.history?.relevance !== "accepted") return undefined;

  try {
    if ((await privacyCheck(prompt)) === true) return prompt;
  } catch {
    return undefined;
  }

  return undefined;
}
