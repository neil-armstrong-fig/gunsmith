import type {Player} from "@gunsmith/engine/player/types/Player";
import type {SeatView} from "@gunsmith/engine/seat/types/SeatView";
import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";
import {appearanceToDraw} from "@src/assets/weapon-drawings/appearance-to-draw/AppearanceToDraw";
import {weaponAppearances} from "@src/assets/weapon-drawings/appearances/WeaponAppearances";
import type {SavedDrawing} from "@src/online/revealed-drawings/types/SavedDrawing";
import type {RevealedWeapon} from "@src/online/types/RevealedWeapon";
import type {RevealFrame} from "@src/online/types/RevealFrame";

/**
 * The drawings of the saved weapons a reveal named, which the server sends nowhere else. The page draws a weapon from `weaponAppearances`,
 * keyed by the weapon object (the reveal's cards, the held weapon, the HUD), and every snapshot is new JSON, so each one's weapons are
 * given their drawing as it comes (`noteOn`). A drawing is matched by fighter and slot, as well as by key and name: every saved weapon
 * shares one key and two can share a name, and a weapon picked up into the slot is a built-in, which keeps its own picture.
 */
export class RevealedDrawings {
  private readonly player: readonly (SavedDrawing | undefined)[];
  private readonly opponent: readonly (SavedDrawing | undefined)[];

  /** Parses each saved weapon's drawing once (one the schema refuses is the stand-in) and gives it to the reveal's own weapon object. */
  constructor(reveal: RevealFrame) {
    this.player = reveal.weapons.own.map(revealed => this.drawingOf(revealed));
    this.opponent = reveal.weapons.opponent.map(revealed => this.drawingOf(revealed));
  }

  /** Gives each weapon in `view`'s loadouts that is the saved weapon the reveal named in that fighter's same slot the same drawing. */
  noteOn(view: SeatView): void {
    this.noteOnFighter(view.player, this.player);
    if (view.opponent) {
      this.noteOnFighter(view.opponent, this.opponent);
    }
  }

  private drawingOf(revealed: RevealedWeapon): SavedDrawing | undefined {
    if (revealed.kind !== "saved" || !revealed.weapon.identity) {
      return undefined;
    }

    const appearance = appearanceToDraw(revealed.appearance);
    weaponAppearances.set(revealed.weapon, appearance);

    return {identity: revealed.weapon.identity, appearance};
  }

  private noteOnFighter(fighter: Player, drawings: readonly (SavedDrawing | undefined)[]): void {
    fighter.loadout.forEach(({weapon}, slot) => {
      const drawing = drawings[slot];
      if (drawing && this.isWeaponOf(weapon, drawing)) {
        weaponAppearances.set(weapon, drawing.appearance);
      }
    });
  }

  private isWeaponOf(weapon: Weapon, drawing: SavedDrawing): boolean {
    return weapon.identity?.key === drawing.identity.key && weapon.identity.name === drawing.identity.name;
  }
}
