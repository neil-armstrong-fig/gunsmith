import {and, eq, gt, sql} from "drizzle-orm";
import {database} from "@src/accounts/Database";
import {generationAttempts} from "@src/accounts/schema/GenerationAttempts";
import {sessions} from "@src/accounts/schema/Sessions";
import type {GenerationAttempt} from "@src/accounts/types/GenerationAttempt";

/** A deleted session cannot write history even if its account ID has since been reclaimed. */
export async function keepGenerationAttempt(attempt: GenerationAttempt, sessionHash: string, now: Date): Promise<void> {
  const {
    id,
    userId,
    kind,
    createdAt,
    pipelineVersion,
    outcome,
    codeEdits,
    modelRepairs,
    failureStage,
    failureReason,
    prompt,
  } = attempt;
  await database()
    .insert(generationAttempts)
    .select(query => {
      return query
        .select({
          id: sql`${id}`.as("id"),
          userId: sessions.userId,
          kind: sql`${kind}`.as("kind"),
          createdAt: sql`${sql.param(createdAt, generationAttempts.createdAt)}`.as("createdAt"),
          pipelineVersion: sql`${pipelineVersion}`.as("pipelineVersion"),
          outcome: sql`${outcome}`.as("outcome"),
          codeEdits: sql`${codeEdits}`.as("codeEdits"),
          modelRepairs: sql`${modelRepairs}`.as("modelRepairs"),
          failureStage: sql`${failureStage ?? null}`.as("failureStage"),
          failureReason: sql`${failureReason ?? null}`.as("failureReason"),
          prompt: sql`${prompt ?? null}`.as("prompt"),
        })
        .from(sessions)
        .where(and(eq(sessions.idHash, sessionHash), eq(sessions.userId, userId), gt(sessions.expiresAt, now)));
    })
    .onConflictDoNothing({target: generationAttempts.id});
}
