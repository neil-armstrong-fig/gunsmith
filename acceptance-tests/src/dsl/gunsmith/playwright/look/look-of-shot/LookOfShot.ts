import type {Page} from "@playwright/test";
import type {BulletSnapshot} from "@gunsmith/shared/state-hook/types/BulletSnapshot";
import {colourIsNear} from "@src/dsl/gunsmith/playwright/look/ColourIsNear";
import {shotPlacesOf} from "@src/dsl/gunsmith/playwright/look/look-of-shot/places-of-shot/ShotPlacesOf";
import {TEAM_BLUE} from "@src/dsl/gunsmith/playwright/look/TeamBlue";
import {TEAM_ORANGE} from "@src/dsl/gunsmith/playwright/look/TeamOrange";
import {coloursAtTiles} from "@src/dsl/gunsmith/playwright/screen/ColoursAtTiles";
import type {Colour} from "@src/dsl/gunsmith/types/Colour";
import type {ShotLook} from "@src/dsl/gunsmith/types/ShotLook";

// A shot is a flat fill with a stroke of the same colour, so its colour is exact inside it; a looser match covers the edge of a texture sampled between pixels.
const TOLERANCE = 12;

type Shooter = BulletSnapshot["shooter"];

// The stand-in disc's colour is the game's own, tone mapped, so it is matched loosely: orange and blue are far from it.
const PLACEHOLDER_GOLD: Colour = {red: 0xf2, green: 0xc6, blue: 0x6d};
const PLACEHOLDER_TOLERANCE = 40;

/**
 * What a player sees where a shot is in the air: the places along it, beside it, ahead of it and past its tail, counted by colour (`BulletSnapshot` says whose it is
 * and which way it flies). The game must be held still, since a shot is in the air for a fraction of a second.
 */
export async function lookOfShot(page: Page, bullet: BulletSnapshot): Promise<ShotLook> {
  const places = shotPlacesOf(bullet, bullet.directionDegrees);
  const team = teamColourOf(bullet.shooter);
  const otherTeam = teamColourOf(otherSide(bullet.shooter));

  // One screenshot for all of them, so they show the same moment.
  const colours = await coloursAtTiles(page, [
    ...places.along,
    ...places.across,
    ...places.ahead,
    ...places.beyondTail,
    ...places.atTheBullet,
  ]);
  const along = colours.slice(0, places.along.length);
  const across = colours.slice(along.length, along.length + places.across.length);
  const ahead = colours.slice(along.length + across.length, along.length + across.length + places.ahead.length);
  const beyondTail = colours.slice(
    along.length + across.length + ahead.length,
    along.length + across.length + ahead.length + places.beyondTail.length,
  );
  const atTheBullet = colours.slice(along.length + across.length + ahead.length + beyondTail.length);

  const isTeam = (colour: Colour): boolean => colourIsNear(colour, team, TOLERANCE);

  return {
    alongPoints: along.filter(isTeam).length,
    otherTeamAlongPoints: along.filter(colour => colourIsNear(colour, otherTeam, TOLERANCE)).length,
    acrossPoints: across.filter(isTeam).length,
    aheadPoints: ahead.filter(isTeam).length,
    beyondTailPoints: beyondTail.filter(isTeam).length,
    placeholderPoints: atTheBullet.filter(colour => colourIsNear(colour, PLACEHOLDER_GOLD, PLACEHOLDER_TOLERANCE))
      .length,
  };
}

function teamColourOf(shooter: Shooter): Colour {
  if (shooter === "player") {
    return TEAM_BLUE;
  }

  return TEAM_ORANGE;
}

function otherSide(shooter: Shooter): Shooter {
  if (shooter === "player") {
    return "opponent";
  }

  return "player";
}
