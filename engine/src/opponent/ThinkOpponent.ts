import type {World} from "@gunsmith/engine/game-loop/types/World";
import {canSee} from "@gunsmith/engine/opponent/sight/CanSee";
import {noticePlayer} from "@gunsmith/engine/opponent/sight/NoticePlayer";
import {noticeShot} from "@gunsmith/engine/opponent/sight/NoticeShot";
import {shelterFromRing} from "@gunsmith/engine/opponent/shelter/ShelterFromRing";
import {actOnState} from "@gunsmith/engine/opponent/state/ActOnState";
import {chooseState} from "@gunsmith/engine/opponent/state/ChooseState";
import {watchForStuck} from "@gunsmith/engine/opponent/steering/WatchForStuck";
import type {OpponentBrain} from "@gunsmith/engine/opponent/types/OpponentBrain";
import type {OpponentContext} from "@gunsmith/engine/opponent/types/OpponentContext";
import type {OpponentDecision} from "@gunsmith/engine/opponent/types/OpponentDecision";
import type {StateAct} from "@gunsmith/engine/opponent/types/StateAct";
import {unstickBrain} from "@gunsmith/engine/opponent/unstick/UnstickBrain";

/**
 * What the opponent asks for this step, in the same shape as a player's input so it is played by the same rules, and the
 * brain it carries into the next step. It looks (`canSee`, `noticePlayer`), takes in a shot that hurt it last step
 * (`noticeShot`, then forgotten once its state is chosen), checks its state's transitions (`chooseState`), lets the state it is in decide the input (`actOnState`), walks it in from the closing ring's edge
 * if the ring has come near (`shelterFromRing`), and finally notices if it has been walking
 * without getting anywhere (`watchForStuck`). It reads only the world and the brain's own memory and seed, so the same
 * world always gives the same answer. An opponent with no brain, or no opponent at all, asks for nothing: a still target.
 */
export function thinkOpponent(world: World, seconds: number): OpponentDecision {
  const {opponent, opponentBrain, player, arena, ring, pickup} = world;
  if (!opponent || !opponentBrain) {
    return {input: {direction: {x: 0, y: 0}, firing: false, reload: false}, brain: undefined};
  }

  const sees = canSee(arena, opponent, player);
  const context: OpponentContext = {arena, opponent, target: player, sees, seconds, ring, pickup};
  const noticed = noticeShot(noticePlayer(opponentBrain, {sees, target: player.position, seconds}), {sees});
  const chosen = {...chooseState(noticed, context), shotFrom: undefined};
  const acted = actOnState({...chosen, secondsInState: chosen.secondsInState + seconds}, context);
  const act = shelterFromRing(acted, context);

  return {input: act.input, brain: afterStuckCheck(act, context)};
}

function afterStuckCheck(act: StateAct, context: OpponentContext): OpponentBrain {
  const walking = act.input.direction.x !== 0 || act.input.direction.y !== 0;
  const check = watchForStuck(act.brain.stuckWatch, {
    position: context.opponent.position,
    walking,
    seconds: context.seconds,
  });
  const brain = {...act.brain, stuckWatch: check.watch};

  if (check.stuck) {
    return unstickBrain(brain);
  }

  return brain;
}
