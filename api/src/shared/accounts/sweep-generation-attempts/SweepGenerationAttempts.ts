import {lte} from "drizzle-orm";
import {database} from "@src/shared/accounts/Database";
import {generationHistoryCutoff} from "@src/shared/accounts/generation-history-retention/GenerationHistoryCutoff";
import {generationAttempts} from "@src/shared/accounts/schema/GenerationAttempts";

export async function sweepGenerationAttempts(now: Date): Promise<void> {
  await database()
    .delete(generationAttempts)
    .where(lte(generationAttempts.createdAt, generationHistoryCutoff(now)));
}
