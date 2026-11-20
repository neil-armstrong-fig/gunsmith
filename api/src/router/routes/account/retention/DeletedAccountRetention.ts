/**
 * How long the digest and credit id of a deleted account are kept so that deleting and signing in again cannot hand out a fresh daily
 * allowance: 90 days, the most `docs/privacy-and-data.md` allows for a record kept past deletion (the user's choice, 2026-11-19). A
 * tunable. The allowance itself refills at 00:00 UTC, so a shorter time would stop the same abuse; this is the ceiling, not the need.
 */
export const DELETED_ACCOUNT_RETENTION_DAYS = 90;
