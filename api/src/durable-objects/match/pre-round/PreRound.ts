import {resolveArenaPicks} from "@gunsmith/engine/arena-picking/ResolveArenaPicks";
import type {ArenaPick} from "@gunsmith/engine/arena-picking/types/ArenaPick";
import {DUEL_BUILT_IN_ARENA} from "@gunsmith/engine/built-in-arenas/DuelBuiltInArena";
import type {Seat} from "@gunsmith/engine/seat/types/Seat";
import {arenaOfChoice} from "@src/durable-objects/match/pre-round/arena-choice/ArenaOfChoice";
import {arenaViewOf} from "@src/durable-objects/match/pre-round/arena-choice/ArenaViewOf";
import {isSameArena} from "@src/durable-objects/match/pre-round/arena-choice/IsSameArena";
import type {ArenaOutcome} from "@src/durable-objects/match/pre-round/types/ArenaOutcome";
import type {ChosenArena} from "@src/durable-objects/match/pre-round/types/ChosenArena";
import type {ChosenWeapon} from "@src/durable-objects/match/pre-round/types/ChosenWeapon";
import type {ChosenWeapons} from "@src/durable-objects/match/pre-round/types/ChosenWeapons";
import type {OpponentPreRound} from "@src/durable-objects/match/pre-round/types/OpponentPreRound";
import type {OwnPreRound} from "@src/durable-objects/match/pre-round/types/OwnPreRound";
import type {PreRoundMessage} from "@src/durable-objects/match/pre-round/types/PreRoundMessage";
import type {PreRoundOutcome} from "@src/durable-objects/match/pre-round/types/PreRoundOutcome";
import type {PreRoundSeat} from "@src/durable-objects/match/pre-round/types/PreRoundSeat";
import type {PreRoundStage} from "@src/durable-objects/match/pre-round/types/PreRoundStage";
import type {SeatPick} from "@src/durable-objects/match/pre-round/types/SeatPick";
import type {ShownSavedWeapon} from "@src/durable-objects/match/pre-round/types/ShownSavedWeapon";
import type {WeaponSlot} from "@src/durable-objects/match/pre-round/types/WeaponSlot";
import type {WeaponSlotView} from "@src/durable-objects/match/pre-round/types/WeaponSlotView";
import type {WeaponsOfSeat} from "@src/durable-objects/match/pre-round/types/WeaponsOfSeat";
import {builtInWeaponKeyed} from "@src/durable-objects/match/pre-round/weapons/BuiltInWeaponKeyed";
import {DEFAULT_WEAPONS} from "@src/durable-objects/match/pre-round/weapons/DefaultWeapons";
import {weaponPairOf} from "@src/durable-objects/match/pre-round/weapons/WeaponPairOf";
import {weaponViewOf} from "@src/durable-objects/match/pre-round/weapons/WeaponViewOf";
import type {SeedMaker} from "@src/durable-objects/match/room/types/SeedMaker";

const SEATS: readonly Seat[] = ["first", "second"];

const OTHER_SEAT: Record<Seat, Seat> = {first: "second", second: "first"};

/** The slots in the order they are chosen and locked in. */
const SLOTS: readonly WeaponSlot[] = [1, 2];

/**
 * What two players choose before a match, as plain state with no network in it (`MatchRoom` owns one and `Match` sends what it says).
 * Each seat puts forward an arena (a built-in, or one of its own saved ones the room has already checked) and locks it in (a seat that never chooses puts forward the duel arena). A seat may do all of
 * that on its own, with no limit of time: the clock (`secondsAllowed`) only begins when `startClock` says both seats have sat. Once both
 * are locked in, a seat sees the other's arena. If the two are the same arena that is the arena; if they differ each seat picks one of
 * them, random, or nothing, and the engine's `resolveArenaPicks` settles it from a seed. When the clock runs out a seat that has not
 * locked in gets the duel arena and one that has not picked picks nothing, so the room never waits on a person. A seat's view holds only
 * what it may know: the other's arena is absent until both are locked in, and no prompt is ever here.
 *
 * Weapons go one at a time. A seat chooses and locks in its first weapon, then its second (the second can be neither chosen nor locked in
 * before the first is locked in, so a seat that has seen the other's first weapon can answer it). A seat sees the other's weapon in a slot only
 * once **both** seats have locked in that slot. The pre-round is decided when the arena is settled and all four weapons are locked in; with
 * `revealSeconds` above 0 the decided arena and weapons are then shown for that long (`revealing`) until it runs out or both seats have asked to
 * go on (`ready`), and `revealOver` says when the match may begin.
 */
export class PreRound {
  private readonly seats: Record<Seat, PreRoundSeat> = {first: freshSeat(), second: freshSeat()};
  private secondsLeft: number;
  private revealSecondsLeft: number;
  private clockRunning = false;
  private arenaSettled: ArenaOutcome | undefined;
  private decided: PreRoundOutcome | undefined;

  constructor(
    secondsAllowed: number,
    private readonly makeSeed: SeedMaker,
    private readonly revealSeconds = 0,
  ) {
    this.secondsLeft = secondsAllowed;
    this.revealSecondsLeft = revealSeconds;
  }

  /** `seat` puts `choice` forward, if it is a built-in arena or a saved one the room checked, and the seat has not locked in. Anything else is ignored. */
  chooseArena(seat: Seat, choice: ChosenArena): void {
    if (this.stage() !== "choosing" || this.seats[seat].locked) {
      return;
    }
    if (!arenaOfChoice(choice)) {
      return;
    }

    this.seats[seat].arena = choice;
  }

  /** `seat` locks in the arena it has chosen (the duel arena if it chose none). It cannot change it afterwards. */
  lockInArena(seat: Seat): void {
    if (this.stage() !== "choosing" || this.seats[seat].locked) {
      return;
    }

    this.seats[seat].arena ??= {kind: "builtIn", name: DUEL_BUILT_IN_ARENA.name};
    this.seats[seat].locked = true;
    this.settle();
  }

  /**
   * `seat` puts a weapon forward for `slot`, if it is a built-in the room knows (or a saved one the room checked), the slot is not locked in
   * and, for slot 2, the first weapon is locked in. Anything else is ignored.
   */
  chooseWeapon(seat: Seat, slot: WeaponSlot, chosen: ChosenWeapon): void {
    if (this.decided || !this.isOpen(seat, slot)) {
      return;
    }
    if (chosen.kind === "builtIn" && !builtInWeaponKeyed(chosen.key)) {
      return;
    }

    this.seats[seat].weapons[slot].chosen = chosen;
  }

  /**
   * `seat` locks in the weapon it has put forward for `slot` (the default for that slot if it put none), once the slot is open: the second
   * only after the first. It cannot change it afterwards.
   */
  lockInWeapon(seat: Seat, slot: WeaponSlot): void {
    if (this.decided || !this.isOpen(seat, slot)) {
      return;
    }

    const weapon = this.seats[seat].weapons[slot];
    weapon.chosen ??= DEFAULT_WEAPONS[slot];
    weapon.locked = true;
    this.settle();
  }

  /** `seat` picks, once, when both arenas are shown and differ. A pick at any other time, or a second one, is ignored. */
  pickArena(seat: Seat, pick: SeatPick): void {
    if (this.stage() !== "picking" || this.seats[seat].pick) {
      return;
    }

    this.seats[seat].pick = pick;
    this.settle();
  }

  /** `seat` has left on its own before the other sat: whatever it chose is forgotten, so whoever sits there next starts clean. */
  release(seat: Seat): void {
    this.seats[seat] = freshSeat();
  }

  /** `seat` asks to begin the match while the decided arena and weapons are shown. Before that, and for a seat that has already asked, it does nothing. */
  ready(seat: Seat): void {
    if (!this.decided) {
      return;
    }

    this.seats[seat].ready = true;
  }

  /** Whether the match may begin: the pre-round is decided and its reveal has run out, both seats have asked to go on, or there is none to hold. */
  revealOver(): boolean {
    if (!this.decided) {
      return false;
    }

    return this.revealSecondsLeft <= 0 || (this.seats.first.ready && this.seats.second.ready);
  }

  /** Both seats have sat: the time allowed begins to run. With none allowed the pre-round is decided on the defaults at once. */
  startClock(): void {
    this.clockRunning = true;
    this.expireIfOutOfTime();
  }

  /** Lets `seconds` of game time pass. Nothing runs until `startClock`, so a seat on its own has no limit. */
  tick(seconds: number): void {
    if (this.decided) {
      this.revealSecondsLeft = Math.max(0, this.revealSecondsLeft - seconds);

      return;
    }
    if (!this.clockRunning) {
      return;
    }

    this.secondsLeft = Math.max(0, this.secondsLeft - seconds);
    this.expireIfOutOfTime();
  }

  /** The arena the match is played in and how it was settled, or `undefined` while the seats are still choosing. */
  outcome(): PreRoundOutcome | undefined {
    return this.decided;
  }

  /** What `seat` may be told right now. */
  viewOf(seat: Seat): PreRoundMessage {
    const message: PreRoundMessage = {
      kind: "preRound",
      stage: this.stage(),
      own: this.ownOf(seat),
      opponent: this.opponentOf(seat),
    };
    if (this.decided) {
      message.how = this.decided.how;
      if (this.isRevealing()) {
        message.secondsLeft = Math.ceil(this.revealSecondsLeft);
      }

      return message;
    }
    if (this.clockRunning) {
      message.secondsLeft = Math.ceil(this.secondsLeft);
    }

    return message;
  }

  /** The other seat's saved weapons `seat` may be shown with their numbers and drawing: each in a slot both seats have locked in. A built-in's the page has. */
  savedWeaponsShownTo(seat: Seat): readonly ShownSavedWeapon[] {
    const other = this.seats[OTHER_SEAT[seat]].weapons;
    const shown: ShownSavedWeapon[] = [];
    for (const slot of SLOTS) {
      const chosen = other[slot].chosen;
      if (chosen?.kind === "saved" && this.seats.first.weapons[slot].locked && this.seats.second.weapons[slot].locked) {
        shown.push({slot, weapon: chosen.weapon, appearance: chosen.appearance});
      }
    }

    return shown;
  }

  /** Whether the decided arena and weapons are being shown before the match: some time was allowed for it. */
  private isRevealing(): boolean {
    return this.revealSeconds > 0;
  }

  /** Whether `seat` may choose or lock in the weapon in `slot` now: it is not locked in and, for the second, the first is. */
  private isOpen(seat: Seat, slot: WeaponSlot): boolean {
    const weapons = this.seats[seat].weapons;
    if (weapons[slot].locked) {
      return false;
    }

    return slot === 1 || weapons[1].locked;
  }

  private stage(): PreRoundStage {
    if (this.decided) {
      if (this.isRevealing()) {
        return "revealing";
      }

      return "decided";
    }
    if (this.arenaSettled) {
      return "choosing";
    }
    if (this.seats.first.locked && this.seats.second.locked) {
      return "picking";
    }

    return "choosing";
  }

  /** What `seat` may be told of itself: its arena by name (a saved one without its drawing, it has that), its pick and its weapons by name or key. */
  private ownOf(seat: Seat): OwnPreRound {
    const own = this.seats[seat];
    const view: OwnPreRound = {locked: own.locked, weapons: this.weaponsOf(seat, seat)};
    if (own.arena) {
      view.arena = arenaViewOf(own.arena, false);
    }
    if (own.pick) {
      view.pick = own.pick;
    }
    if (this.decided) {
      view.ready = own.ready;
    }

    return view;
  }

  /** What `seat` may see of the other seat: flags always, their arena only once both are locked in and each weapon only once both seats have locked in that slot. */
  private opponentOf(seat: Seat): OpponentPreRound {
    const other = this.seats[OTHER_SEAT[seat]];
    const opponent: OpponentPreRound = {
      locked: other.locked,
      picked: other.pick !== undefined,
      weapons: this.weaponsOf(seat, OTHER_SEAT[seat]),
    };
    if (this.seats.first.locked && this.seats.second.locked && other.arena) {
      opponent.arena = arenaViewOf(other.arena, true);
    }
    if (this.decided) {
      opponent.ready = other.ready;
    }

    return opponent;
  }

  /** The weapons of `of` as `viewer` may be told them: its own at once, the other's slot only once both seats have locked in that slot. */
  private weaponsOf(viewer: Seat, of: Seat): WeaponsOfSeat {
    return {slots: [this.slotViewOf(viewer, of, 1), this.slotViewOf(viewer, of, 2)]};
  }

  private slotViewOf(viewer: Seat, of: Seat, slot: WeaponSlot): WeaponSlotView {
    const state = this.seats[of].weapons[slot];
    const bothLocked = this.seats.first.weapons[slot].locked && this.seats.second.weapons[slot].locked;
    const view: WeaponSlotView = {locked: state.locked};
    if (state.chosen && (viewer === of || bothLocked)) {
      view.choice = weaponViewOf(state.chosen);
    }

    return view;
  }

  /** Decides if the seats' locks and picks say enough: the arena settled and both seats' weapons locked in. */
  private settle(): void {
    this.settleArena();
    if (!this.arenaSettled || !this.allWeaponsLocked()) {
      return;
    }

    this.decided = {
      ...this.arenaSettled,
      weapons: {
        first: weaponPairOf(this.chosenWeaponsOf("first")),
        second: weaponPairOf(this.chosenWeaponsOf("second")),
      },
      chosen: {
        first: this.chosenWeaponsOf("first"),
        second: this.chosenWeaponsOf("second"),
      },
    };
  }

  private allWeaponsLocked(): boolean {
    return SEATS.every(seat => SLOTS.every(slot => this.seats[seat].weapons[slot].locked));
  }

  /** The two weapons a seat carries: what it locked in, slot 1 then slot 2. */
  private chosenWeaponsOf(seat: Seat): ChosenWeapons {
    const weapons = this.seats[seat].weapons;

    return [weapons[1].chosen ?? DEFAULT_WEAPONS[1], weapons[2].chosen ?? DEFAULT_WEAPONS[2]];
  }

  /** Settles the arena if the seats' arena locks and picks say enough: one arena between them, or both have picked. */
  private settleArena(): void {
    if (this.stage() !== "picking") {
      return;
    }

    const first = this.seats.first.arena;
    if (isSameArena(first, this.seats.second.arena)) {
      this.arenaSettled = {arena: arenaOfChoice(first) ?? DUEL_BUILT_IN_ARENA, how: "same"};

      return;
    }
    if (this.seats.first.pick && this.seats.second.pick) {
      this.arenaSettled = this.resolved();
    }
  }

  private expireIfOutOfTime(): void {
    if (this.secondsLeft > 0 || this.decided) {
      return;
    }

    for (const seat of SEATS) {
      if (!this.seats[seat].locked) {
        delete this.seats[seat].arena;
      }
      for (const slot of SLOTS) {
        if (!this.seats[seat].weapons[slot].locked) {
          delete this.seats[seat].weapons[slot].chosen;
        }
        this.lockInWeapon(seat, slot);
      }
      this.lockInArena(seat);
    }
    for (const seat of SEATS) {
      this.pickArena(seat, {kind: "nothing"});
    }
  }

  /** The engine's rule over the two picks, drawing from a seed made now. Both seats have picked when this is called. */
  private resolved(): ArenaOutcome {
    const picks = SEATS.map(seat => arenaPickOf(seat, this.seats[seat].pick));
    const resolution = resolveArenaPicks({picks, seed: this.makeSeed()});
    const chosen = SEATS.find(seat => seat === resolution.chosenPlayerId) ?? "first";

    return {arena: arenaOfChoice(this.seats[chosen].arena) ?? DUEL_BUILT_IN_ARENA, how: resolution.how};
  }
}

function freshSeat(): PreRoundSeat {
  return {locked: false, weapons: {1: {locked: false}, 2: {locked: false}}, ready: false};
}

function arenaPickOf(seat: Seat, pick: SeatPick | undefined): ArenaPick {
  if (pick?.kind === "arena") {
    return {playerId: seat, choice: {kind: "arena", chosenPlayerId: pick.seat}};
  }
  if (pick?.kind === "random") {
    return {playerId: seat, choice: {kind: "random"}};
  }

  return {playerId: seat, choice: {kind: "nothing"}};
}
