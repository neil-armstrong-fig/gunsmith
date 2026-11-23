import {lte} from "drizzle-orm";
import {database} from "@src/accounts/Database";
import {generationHistoryCutoff} from "@src/accounts/generation-history-retention/GenerationHistoryCutoff";
import {generationAttempts} from "@src/accounts/schema/GenerationAttempts";

export async function sweepGenerationAttempts(now: Date): Promise<void> {
  await database()
    .delete(generationAttempts)
    .where(lte(generationAttempts.createdAt, generationHistoryCutoff(now)));
}
