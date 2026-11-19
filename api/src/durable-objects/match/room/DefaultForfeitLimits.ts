import type {ForfeitLimits} from "@src/durable-objects/match/room/types/ForfeitLimits";

/**
 * What a room waits for a player (tunable, `docs/match-netcode.md`, "Reconnect and forfeits"): a person who has left has 30 seconds to come
 * back, and one who is there but asks for nothing new for about 60 seconds is idle. Either way the round is forfeited. A room may be made to wait
 * less (`match/forfeit-limits/ParseForfeitLimits`, beside this folder), never more.
 */
export const DEFAULT_FORFEIT_LIMITS: ForfeitLimits = {reconnectSeconds: 30, idleSeconds: 60};
