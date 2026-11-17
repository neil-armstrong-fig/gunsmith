# Generated weapon visuals

Owner: ai for generation and renderer; art reviews readability. Stats and appearance are separate stages. Pipeline integration exists; the browser renderer consumer remains active work in [TODO-ai.md](../TODO-ai.md).

## Accepted constraints

- Generate appearance only after stats pass validation, balancing and rating. Rejected/invalid stats never incur drawing calls.
- Keep one repair per stage and five model calls at most overall. Use one cumulative paid-spend guard.
- Parse unknown output, complete only code-owned omissions, then enforce strict bounds. Repair sees the previous drawing and its faults as data.
- Preserve gameplay stats even if drawing fails. Return a validated stand-in and disclose it truthfully.
- Drawings cannot change hitboxes, visibility, damage, behavior or audio limits. Unsupported identity/mechanics must not be claimed as implemented.
- The appearance schema stays local until the renderer genuinely consumes it; coordinate any move through HANDOFF.

## Drawing vocabulary and review

The current draft uses a 64×64 design space, bounded circle/ellipse/rect/polygon/polyline primitives, palette roles and known effect/animation presets. Bounds include stroke and rotation. Inspect the schema and tests for actual limits rather than treating historical study numbers as a frozen contract.

[Art’s schema proposal](art/visual-schema-proposal.md), [simple machinery](art/concepts/simple-machinery-04/README.md), and [top-down oddities](art/concepts/top-down-oddities/README.md) provide fixtures and human readability targets. Authored parts-kit experiments remain shelved. Kept concept assets and evidence explain those experiments; they do not authorize another runtime kit system.

Validity and recognisability are separate. Local-model drawings historically passed safety criteria while failing identity criteria. A valid fallback is not proof the model understood the request. Scores do not transfer across fake, local and paid tiers.

## Integration evidence and remaining work

Historical integrated Haiku measurements recorded approximately $0.00105 and median 5.9 seconds per created weapon, excluding arena generation. These are dated measurements, not current provider pricing or a production latency promise. [Cost and budget](cost-and-budget.md) retains measurement context.

Renderer acceptance must cover malformed/partial drawings, unknown versions/roles, geometry excess, fallback disclosure and unchanged stats. Prove criteria with mutations and inspect the production rendering at native scale. Art reviews output only after the renderer and its acceptance evidence exist.

Before any paid probe, reconcile the actual cumulative ledger across checkouts under the existing $1 ceiling. A missing ledger is not a fresh allowance. Commands and model boundaries are in [ai/AGENTS.md](../ai/AGENTS.md).
