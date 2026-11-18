import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import {stepFighters} from "@gunsmith/engine/game-loop/StepFighters";
import type {FighterInputs} from "@gunsmith/engine/game-loop/types/FighterInputs";
import type {Input} from "@gunsmith/engine/game-loop/types/Input";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import type {Seat} from "@gunsmith/engine/seat/types/Seat";
import {viewOfSeat} from "@gunsmith/engine/seat/ViewOfSeat";
import {MATCH_ARENA_ROWS} from "@src/match/room/arena/MatchArenaRows";
import type {InputAck} from "@gunsmith/shared/online/types/InputAck";
import type {JoinedMessage} from "@src/match/room/types/JoinedMessage";
import type {SnapshotMessage} from "@src/match/room/types/SnapshotMessage";
import {MATCH_TICK} from "@src/match/tick/MatchTick";

const SECOND_FIGHTER_STARTS_AT = {x: 16.5, y: 6.5};

const NOTHING_ASKED: Input = {direction: {x: 0, y: 0}, firing: false, reload: false};

/**
 * One private room's match, as plain state with no network in it: who has taken which seat, what each seat last asked for, and
 * the engine's world, which only this class steps. The Durable Object (`match/Match.ts`) feeds it frames and a clock and sends
 * what it answers. The match begins when the second seat is taken; before that no world exists and nothing is sent.
 */
export class MatchRoom {
  private readonly arena: Arena = arenaFrom(MATCH_ARENA_ROWS);
  private readonly seated: Seat[] = [];
  private readonly asked: Record<Seat, Input> = {first: NOTHING_ASKED, second: NOTHING_ASKED};
  private readonly acked: Partial<Record<Seat, InputAck>> = {};
  private readonly pulled: Record<Seat, boolean> = {first: false, second: false};
  private world: World | undefined;

  /** The next free seat, or `undefined` when both are taken. The second to sit starts the match. */
  join(): Seat | undefined {
    const seat = this.nextFreeSeat();
    if (!seat) {
      return undefined;
    }

    this.seated.push(seat);
    if (seat === "second") {
      this.world = startingWorld(this.arena, [], SECOND_FIGHTER_STARTS_AT);
    }

    return seat;
  }

  /**
   * Gives `seat` back, but only before the match begins: a browser that connects and goes (a page reloading) must not keep the
   * room full. Once it has begun a seat is kept for its person, who may not be replaced by a stranger (reconnecting comes later).
   */
  leave(seat: Seat): void {
    if (this.world) {
      return;
    }

    const index = this.seated.indexOf(seat);
    if (index >= 0) {
      this.seated.splice(index, 1);
    }
  }

  /** The word a browser is sent as it sits down. */
  joinedMessage(seat: Seat): JoinedMessage {
    return {kind: "joined", seat, arena: MATCH_ARENA_ROWS};
  }

  /**
   * Remembers what `seat` last asked for, under the number the browser gave it (`seq`). It is played at the next tick. A reload, a weapon
   * switch or a trigger pull is asked once and is not lost to a later input that arrives before the tick (a click pressed and released
   * between two ticks is two inputs, and only the last would otherwise be played): it stays until played. An input older than one already
   * received is dropped. The seat is told which input it has reached in each snapshot (`ack`).
   */
  setInput(seat: Seat, input: Input, seq: number): void {
    const before = this.asked[seat];
    const reached = this.acked[seat];
    if (reached && seq < reached.seq) {
      return;
    }

    this.acked[seat] = {seq, held: 0};
    this.pulled[seat] = this.pulled[seat] || input.firing;
    this.asked[seat] = {...input, reload: input.reload || before.reload, switchTo: input.switchTo ?? before.switchTo};
  }

  /**
   * Plays `steps` engine steps (one by default) from what each seat asked for: the clock says how many it owes, since a timer
   * fires late and unevenly. Nothing happens before the match begins or when no step is owed (so a one-shot ask waits for a step that
   * plays it). A reload, weapon switch or trigger pull is played in the first step only.
   */
  tick(steps = 1): void {
    if (!this.world || steps <= 0) {
      return;
    }

    let world = this.world;
    for (let step = 0; step < steps; step += 1) {
      world = stepFighters(world, this.inputsOfStep(step), MATCH_TICK.stepSeconds);
    }
    this.world = world;
    this.asked.first = withoutOneShots(this.asked.first);
    this.asked.second = withoutOneShots(this.asked.second);
    this.pulled.first = false;
    this.pulled.second = false;
    this.countSteps(steps);
  }

  /** What `seat` may be told right now: only what the engine says it sees, and how far its inputs have been played. `undefined` before the match begins. */
  snapshotFor(seat: Seat): SnapshotMessage | undefined {
    if (!this.world) {
      return undefined;
    }

    return {kind: "snapshot", ...viewOfSeat(this.world, seat), ack: this.acked[seat]};
  }

  private countSteps(steps: number): void {
    for (const seat of this.seated) {
      const reached = this.acked[seat];
      if (reached) {
        this.acked[seat] = {...reached, held: reached.held + steps};
      }
    }
  }

  private nextFreeSeat(): Seat | undefined {
    if (this.seated.length === 0) {
      return "first";
    }
    if (this.seated.length === 1) {
      return "second";
    }

    return undefined;
  }

  /** A reload, a weapon switch or a trigger pull is asked once: only the tick's first step plays it. */
  private inputsOfStep(step: number): FighterInputs {
    if (step === 0) {
      return {first: this.withPulls("first"), second: this.withPulls("second")};
    }

    return {first: withoutOneShots(this.asked.first), second: withoutOneShots(this.asked.second)};
  }

  /** What `seat` asked for, with the trigger down if it was pulled at any time since the last tick, even if let go again. */
  private withPulls(seat: Seat): Input {
    return {...this.asked[seat], firing: this.asked[seat].firing || this.pulled[seat]};
  }
}

function withoutOneShots(input: Input): Input {
  return {...input, reload: false, switchTo: undefined};
}
