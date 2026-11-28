import {DUEL_BUILT_IN_ARENA} from "@gunsmith/engine/arena/built-in/DuelBuiltInArena";
import {CATWALK_BUILT_IN_ARENA} from "@gunsmith/engine/arena/built-in/drawings/CatwalkBuiltInArena";
import {CELLBLOCK_BUILT_IN_ARENA} from "@gunsmith/engine/arena/built-in/drawings/CellblockBuiltInArena";
import {COLONNADE_BUILT_IN_ARENA} from "@gunsmith/engine/arena/built-in/drawings/ColonnadeBuiltInArena";
import {COVER_YARD_BUILT_IN_ARENA} from "@gunsmith/engine/arena/built-in/drawings/CoverYardBuiltInArena";
import {CROSSROADS_BUILT_IN_ARENA} from "@gunsmith/engine/arena/built-in/drawings/CrossroadsBuiltInArena";
import {HOURGLASS_BUILT_IN_ARENA} from "@gunsmith/engine/arena/built-in/drawings/HourglassBuiltInArena";
import {KEEP_BUILT_IN_ARENA} from "@gunsmith/engine/arena/built-in/drawings/KeepBuiltInArena";
import {LABYRINTH_BUILT_IN_ARENA} from "@gunsmith/engine/arena/built-in/drawings/LabyrinthBuiltInArena";
import {PINWHEEL_BUILT_IN_ARENA} from "@gunsmith/engine/arena/built-in/drawings/PinwheelBuiltInArena";
import {RIDGELINE_BUILT_IN_ARENA} from "@gunsmith/engine/arena/built-in/drawings/RidgelineBuiltInArena";
import {SHOOTING_GALLERY_BUILT_IN_ARENA} from "@gunsmith/engine/arena/built-in/drawings/ShootingGalleryBuiltInArena";
import {SLALOM_BUILT_IN_ARENA} from "@gunsmith/engine/arena/built-in/drawings/SlalomBuiltInArena";
import {STEPPING_STONES_BUILT_IN_ARENA} from "@gunsmith/engine/arena/built-in/drawings/SteppingStonesBuiltInArena";
import {SWITCHBACK_BUILT_IN_ARENA} from "@gunsmith/engine/arena/built-in/drawings/SwitchbackBuiltInArena";
import {TOWER_OF_DEATH_BUILT_IN_ARENA} from "@gunsmith/engine/arena/built-in/drawings/TowerOfDeathBuiltInArena";
import {TWIN_RIDGES_BUILT_IN_ARENA} from "@gunsmith/engine/arena/built-in/drawings/TwinRidgesBuiltInArena";
import {WATCHTOWER_BUILT_IN_ARENA} from "@gunsmith/engine/arena/built-in/drawings/WatchtowerBuiltInArena";
import {ZIGGURAT_BUILT_IN_ARENA} from "@gunsmith/engine/arena/built-in/drawings/ZigguratBuiltInArena";
import {SUNKEN_COURT_BUILT_IN_ARENA} from "@gunsmith/engine/arena/built-in/drawings/SunkenCourtBuiltInArena";
import {FAIR_DUEL_BUILT_IN_ARENA} from "@gunsmith/engine/arena/built-in/FairDuelBuiltInArena";
import type {BuiltInArena} from "@gunsmith/engine/arena/built-in/types/BuiltInArena";

/**
 * Every arena a player may pick by name, and the ones ai falls back to when a drawn arena cannot be used. Each is held to the same
 * checks as a drawn one (it reads, it is playable, it fits `ARENA_LIMITS`) and, because the fighters start on matching ground, it
 * is the same picture turned half way round. The scenario fixtures in the webapp (heights, practice, overwatch, terraced) are not
 * in the pool. Duel and Fair duel stay at this folder's root because the API and the webapp read them by name; every other
 * drawing is read only by this list and lives in `drawings/`.
 */
export const BUILT_IN_ARENAS: readonly BuiltInArena[] = [
  DUEL_BUILT_IN_ARENA,
  FAIR_DUEL_BUILT_IN_ARENA,
  COVER_YARD_BUILT_IN_ARENA,
  CROSSROADS_BUILT_IN_ARENA,
  TWIN_RIDGES_BUILT_IN_ARENA,
  WATCHTOWER_BUILT_IN_ARENA,
  TOWER_OF_DEATH_BUILT_IN_ARENA,
  PINWHEEL_BUILT_IN_ARENA,
  CATWALK_BUILT_IN_ARENA,
  SWITCHBACK_BUILT_IN_ARENA,
  ZIGGURAT_BUILT_IN_ARENA,
  SHOOTING_GALLERY_BUILT_IN_ARENA,
  CELLBLOCK_BUILT_IN_ARENA,
  STEPPING_STONES_BUILT_IN_ARENA,
  HOURGLASS_BUILT_IN_ARENA,
  RIDGELINE_BUILT_IN_ARENA,
  COLONNADE_BUILT_IN_ARENA,
  SLALOM_BUILT_IN_ARENA,
  KEEP_BUILT_IN_ARENA,
  LABYRINTH_BUILT_IN_ARENA,
  SUNKEN_COURT_BUILT_IN_ARENA,
];
