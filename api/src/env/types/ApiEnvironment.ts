/** The bindings the Worker is given: one `Match` Durable Object per friend code. (`wrangler.jsonc` declares them; `infra/` will too.) */
export interface ApiEnvironment {
  MATCHES: DurableObjectNamespace;
}
