# Documentation

## Understand the game

- [Game design and glossary](game-design.md): the rules and the words the code uses for them.
- [Architecture](architecture.md): the packages and how they fit together.
- [How the game is being built](build-approach.md): rough parts first, validated by playing.
- [Selection concept](selection-concept/README.md) ([mock-up](selection-concept/Mockup.html)): choosing weapons and the arena before a match.
- [Decisions](agent-reference/SessionDecisions.md): durable constraints and open proposals.
- [State management](state-management.md) and [shaders](shaders.md): implementation rationale and verification.

## AI and generated content

- [Pipeline](ai-pipeline.md): stages, validation and eval boundaries.
- [Diagrams](ai-diagrams/README.md): how an eval run works and how the LangGraphs are put together.
- [Hosting decision](ai-hosting.md): the pipeline runs in-process in the Worker.
- [Arena generation research](ai-arena-research.md) and [judge research](ai-judge-research.md).
- [Schemas](schemas.md): current types and proposed future capabilities.
- [Weapon visuals](ai-visual-generation.md), [balancing](ai-stat-balancing.md), and [preference probe](ai-stat-preference-probe.md).
- [Art direction](art/README.md): assets, studies and integration requirements.

## Online services

- [Match netcode](match-netcode.md): the authoritative room, fog on the wire, prediction and reconnects.
- [Sign-in](sign-in.md): Google OAuth with PKCE and opaque session tokens.
- [Costs and budgets](cost-and-budget.md): credits, spend caps, alerts and the shutdown drill.
- [Privacy and data](privacy-and-data.md).
- [Manual setup](../MANUAL-SETUP-STEPS.md): accounts, secrets and the first deploy.

For development, start with [Contributing](../CONTRIBUTING.md) and [AGENTS.md](../AGENTS.md). The open work is in
[MVP-TODO.md](../MVP-TODO.md) and [POSTMVP-TODO.md](../POSTMVP-TODO.md); [Operations](agent-reference/Operations.md) covers commands,
worktrees and CI.
