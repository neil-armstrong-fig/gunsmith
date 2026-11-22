import {and, desc, eq, gt} from "drizzle-orm";
import {database} from "@src/accounts/Database";
import {generationHistoryCutoff} from "@src/accounts/generation-history-retention/GenerationHistoryCutoff";
import {generationAttempts} from "@src/accounts/schema/GenerationAttempts";
import type {GenerationAttempt} from "@src/accounts/types/GenerationAttempt";

/** Internal account-scoped read for authorized review and access requests. */
export async function generationAttemptsOfAccount(userId: string, now: Date): Promise<GenerationAttempt[]> {
  const attempts = await database()
    .select()
    .from(generationAttempts)
    .where(and(eq(generationAttempts.userId, userId), gt(generationAttempts.createdAt, generationHistoryCutoff(now))))
    .orderBy(desc(generationAttempts.createdAt));

  return attempts.map(({prompt, failureStage, failureReason, ...attempt}) => ({
    ...attempt,
    prompt: prompt ?? undefined,
    failureStage: failureStage ?? undefined,
    failureReason: failureReason ?? undefined,
  }));
}
