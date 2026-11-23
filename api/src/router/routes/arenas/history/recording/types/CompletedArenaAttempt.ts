import type {ArenaOutcome} from "@gunsmith/ai/pipeline/arena/types/ArenaOutcome";
import type {CreditReservation} from "@src/router/routes/shared/types/CreditReservation";

export interface CompletedArenaAttempt {
  reservation: CreditReservation;
  outcome: ArenaOutcome;
  response: Response;
}
