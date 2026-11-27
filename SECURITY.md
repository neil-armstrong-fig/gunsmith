# Security policy

Gunsmith runs live at `gunsmith.neilarmstrong.dev`, with Google sign-in, a per-account library and paid AI generation behind credits and
spend caps. Only the current `main` branch and the live deployment are supported.

## Reporting a vulnerability

Please report it privately through GitHub's
[private vulnerability reporting](https://github.com/neil-armstrong-fig/gunsmith/security/advisories/new) (the **Security** tab, then
**Report a vulnerability**). Do not open a public issue.

Useful things to include: what is affected (the site, the API, a match room, generation or credits), how to reproduce it, and what an
attacker could gain. This is a personal project maintained by one person, so expect an acknowledgement within a week; fixes are made on
a best-effort basis.

## In scope

- Getting another player's hidden state from a match (fog is enforced on the server: an opponent you cannot see must never reach your browser).
- Reading or changing another account's library, history, credits or session.
- Making the service spend money beyond its credit and spend limits, or bypassing the AI kill switch.
- Injecting content that runs in another player's browser.

Please do not run load or denial-of-service tests against the live site, or use real players' accounts.
