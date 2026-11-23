import type {OpponentBrain} from "@gunsmith/engine/opponent/types/OpponentBrain";
import type {OpponentContext} from "@gunsmith/engine/opponent/types/OpponentContext";
import type {StrafeSide} from "@gunsmith/engine/opponent/types/StrafeSide";

/** What `Engage` asks to work out where it walks: the brain and context, the side it circles, and whether it is ducked behind cover (then it holds still). */
export interface HeadingRequest {
  brain: OpponentBrain;
  context: OpponentContext;
  side: StrafeSide;
  ducking: boolean;
}
