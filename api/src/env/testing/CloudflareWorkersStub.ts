/**
 * What `cloudflare:workers` is in a test (`vitest.config.ts` aliases it here): an empty `env` that tests fill, and the minimal base
 * class the Durable Objects extend. Tests run in plain node, where the real module does not exist.
 */
export const env: Record<string, unknown> = {};

export class DurableObject {
  constructor(
    readonly ctx: unknown,
    readonly env: unknown,
  ) {}
}
