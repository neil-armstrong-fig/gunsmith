import {generationFailureMessage} from "@src/account/generation/GenerationFailureMessage";
import {ARENA_LIMITS} from "@gunsmith/engine/arena-limits/ArenaLimits";
import {validateArena} from "@gunsmith/engine/arena-validation/ValidateArena";
import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {accountUrl} from "@src/account/AccountUrl";
import type {WorkshopArena} from "@src/store/workshop/arena/types/WorkshopArena";
import {z} from "zod";

const arenaAnswer = z.object({
  status: z.enum(["created", "builtIn", "rejected", "invalid"]),
  id: z.string().min(1).optional(),
  reason: z.string().optional(),
  arena: z
    .object({
      name: z.string().trim().min(1),
      rows: z
        .array(
          z
            .string()
            .min(ARENA_LIMITS.width.min)
            .max(ARENA_LIMITS.width.max)
            .regex(/^[#.c12^v<>]+$/),
        )
        .min(ARENA_LIMITS.height.min)
        .max(ARENA_LIMITS.height.max),
    })
    .optional(),
});
const FALLBACK_REASON = "We could not build a playable arena, so here is a built-in arena.";

export async function makeAccountArena(prompt: string): Promise<WorkshopArena> {
  const response = await fetch(accountUrl("/api/arenas"), {
    method: "POST",
    credentials: "include",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({prompt}),
  });
  if (!response.ok) throw new Error(await generationFailureMessage(response, "arena"));

  const parsed = arenaAnswer.safeParse(await response.json());
  if (!parsed.success) throw new Error("The arena response was incomplete.");

  const answer = parsed.data;
  if (!answer.arena) throw new Error(answer.reason ?? "Could not make an arena.");

  const {name, rows} = answer.arena;
  const arena = arenaFrom(rows);
  if (validateArena(arena).length > 0) throw new Error("The arena could not be played.");

  if (answer.status === "created" && answer.id) {
    return {name, rows, arena, accountItemId: answer.id, madeFromPrompt: prompt};
  }

  if (answer.status === "builtIn") {
    return {name, rows, arena, fallbackReason: answer.reason ?? FALLBACK_REASON};
  }

  throw new Error("Could not make an arena.");
}
