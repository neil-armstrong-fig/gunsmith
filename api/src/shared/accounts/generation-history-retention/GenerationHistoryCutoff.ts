const GENERATION_HISTORY_RETENTION_DAYS = 14;

export function generationHistoryCutoff(now: Date): Date {
  return new Date(now.getTime() - GENERATION_HISTORY_RETENTION_DAYS * 86_400_000);
}
