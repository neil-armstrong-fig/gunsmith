# Copy brief

Owner: `art`. English only, hard-coded in the webapp (no translation layer). The game is not text-heavy, so every line
earns its place. Tone: terse, dry, a little workshop-and-blueprint; never preachy.

## Needed (A5)

| Where | What | Notes |
| ----- | ---- | ----- |
| Landing page | One-line pitch, three-line "how it works", buttons: Practice, Private room, Public queue, Sign in | Mention the twist (the weapons are shared) |
| Practice arena | Control hints (WASD, mouse, Ctrl or C, 1 and 2, reload, pick up and drop), what the dummies are for, the "make a weapon here" prompt | Short |
| Sign-in | Why sign in (credits and a library); guests can still play | Honest about what Google shares (`openid` only) |
| Pre-round | Help text for a weapon prompt and an arena prompt; the token counter; the timer; what the opponent can see | |
| **Example prompts** | 12 weapon prompts and 6 arena prompts: sensible, silly, deliberately overpowered, and a few that should be rejected | These also seed `ai`'s datasets. Mark each with an expected outcome (accept, accept but wild, reject) |
| Generation progress | Labels for the steps: checking, judging, generating, validating, rating | One short line each |
| Reveal | Labels for the power rating (words for low to absurd) and a one-line "gamble" explanation | |
| Rejections and errors | Over the limit; rejected by the judge (without scolding); out of credits; timed out and refunded; library full; disconnected; opponent left | |
| AI-off banner | "AI is resting for the day/month; the game still works" and what still works | Variants for daily and monthly |
| Credits | How many, when they reset (00:00 UTC), what things cost, that reuse is free | |
| Library | Empty states; the slot limit message (a future upgrade is a stretch goal; do not promise it) | |
| Match | Round start, ring warning, forfeit, round won, match won | |
| Legal | Privacy and terms pages that match `docs/privacy-and-data.md` | Plain language |

## Style rules

- Second person, present tense, short sentences. No exclamation marks except in the round-win line, at most.
- Never blame the player for a rejection. Say what to change.
- Do not mention models or vendors in the UI beyond the privacy page.
- Numbers are written as numerals.

## Status

Not started. Write the finished copy below this line or in sibling files under `docs/art/`.
