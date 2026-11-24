import type {AccountItemKind} from "@src/account/types/AccountItemKind";
import {z} from "zod";

const failure = z.object({error: z.string(), reason: z.string().optional()});

export async function generationFailureMessage(response: Response, item: AccountItemKind): Promise<string> {
  const parsed = failure.safeParse(await response.json().catch(() => undefined));
  const answer = parsed.data;
  const name = {arena: "Arena", weapon: "Weapon"}[item];
  const description = {arena: "an arena", weapon: "a weapon"}[item];
  if (response.status === 401) return `Sign in again to make ${description}.`;
  if (response.status === 402) return "You’re out of credits.";
  if (response.status === 504 && answer?.error === "generation-timed-out") {
    return `${answer.reason ?? `Making the ${item} timed out.`} Your credit was refunded.`;
  }
  if (response.status === 502 && answer?.error === "generation-failed") {
    return `${answer.reason ?? `Could not make the ${item}.`} Your credit was refunded.`;
  }
  if (answer?.reason) return answer.reason;

  if (response.status === 503) {
    if (answer?.error === "ai-off") return `${name} generation is paused.`;

    return `${name} generation is unavailable.`;
  }

  return `Could not make the ${item}.`;
}
