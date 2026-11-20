import type {ArenaFrame} from "@src/online/types/ArenaFrame";
import type {JoinedFrame} from "@src/online/types/JoinedFrame";
import type {PreRoundFrame} from "@src/online/types/pre-round/PreRoundFrame";
import type {SnapshotFrame} from "@src/online/types/SnapshotFrame";

/**
 * A frame the server sends a browser: the seat it has and the arena (once, on sitting down), what that seat may know of the choosing
 * before the match, the arena the match is played in (once, when it is decided), or what that seat may know of the match right now.
 */
export type ServerMessage = JoinedFrame | ArenaFrame | PreRoundFrame | SnapshotFrame;
