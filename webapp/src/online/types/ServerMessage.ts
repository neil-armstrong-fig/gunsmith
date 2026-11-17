import type {JoinedFrame} from "@src/online/types/JoinedFrame";
import type {SnapshotFrame} from "@src/online/types/SnapshotFrame";

/** A frame the server sends a browser: the seat it has and the arena (once, on sitting down), or what that seat may know of the match right now. */
export type ServerMessage = JoinedFrame | SnapshotFrame;
