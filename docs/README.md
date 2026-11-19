# Documentation

## Understand the game

- [Game design and glossary](game-design.md): intended rules and current local behavior.
- [Architecture](architecture.md): existing packages and planned online system.
- [How the game is being built](build-approach.md): rough parts first, validated by playing; the case study's story.
- [Selection concept](selection-concept/README.md) ([mock-up](selection-concept/Mockup.html)): choosing weapons and the arena before a match.
- [Decisions](agent-reference/SessionDecisions.md): durable constraints and open proposals.
- [State management](state-management.md) and [shaders](shaders.md): implementation rationale and verification.

## AI and generated content

- [Pipeline](ai-pipeline.md): implemented stages, validation and eval boundaries.
- [Hosting decision](ai-hosting.md): in-process Worker integration and remaining measurements.
- [Schemas](schemas.md): current types and proposed future capabilities.
- [Weapon visuals](ai-visual-generation.md), [balancing](ai-stat-balancing.md), and [preference probe](ai-stat-preference-probe.md): accepted constraints and remaining calibration.
- [Art direction](art/README.md): assets, studies and integration requirements.

## Planned online services

These documents describe future integration, not a deployed service:

- [Match netcode](match-netcode.md)
- [Sign-in](sign-in.md)
- [Costs and budgets](cost-and-budget.md)
- [Privacy and data](privacy-and-data.md)
- [Manual setup](../MANUAL-SETUP-STEPS.md)

For development, start with [Contributing](../CONTRIBUTING.md), [AGENTS.md](../AGENTS.md), [TODO.md](../TODO.md), and [HANDOFF.md](../HANDOFF.md). [Operations](agent-reference/Operations.md) covers commands, worktrees and CI.
