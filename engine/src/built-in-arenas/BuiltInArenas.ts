import {DUEL_BUILT_IN_ARENA} from "@gunsmith/engine/built-in-arenas/DuelBuiltInArena";
import {CATWALK_BUILT_IN_ARENA} from "@gunsmith/engine/built-in-arenas/drawings/CatwalkBuiltInArena";
import {CELLBLOCK_BUILT_IN_ARENA} from "@gunsmith/engine/built-in-arenas/drawings/CellblockBuiltInArena";
import {COLONNADE_BUILT_IN_ARENA} from "@gunsmith/engine/built-in-arenas/drawings/ColonnadeBuiltInArena";
import {COVER_YARD_BUILT_IN_ARENA} from "@gunsmith/engine/built-in-arenas/drawings/CoverYardBuiltInArena";
import {CROSSROADS_BUILT_IN_ARENA} from "@gunsmith/engine/built-in-arenas/drawings/CrossroadsBuiltInArena";
import {HOURGLASS_BUILT_IN_ARENA} from "@gunsmith/engine/built-in-arenas/drawings/HourglassBuiltInArena";
import {KEEP_BUILT_IN_ARENA} from "@gunsmith/engine/built-in-arenas/drawings/KeepBuiltInArena";
import {LABYRINTH_BUILT_IN_ARENA} from "@gunsmith/engine/built-in-arenas/drawings/LabyrinthBuiltInArena";
import {PINWHEEL_BUILT_IN_ARENA} from "@gunsmith/engine/built-in-arenas/drawings/PinwheelBuiltInArena";
import {RIDGELINE_BUILT_IN_ARENA} from "@gunsmith/engine/built-in-arenas/drawings/RidgelineBuiltInArena";
import {SHOOTING_GALLERY_BUILT_IN_ARENA} from "@gunsmith/engine/built-in-arenas/drawings/ShootingGalleryBuiltInArena";
import {SLALOM_BUILT_IN_ARENA} from "@gunsmith/engine/built-in-arenas/drawings/SlalomBuiltInArena";
import {STEPPING_STONES_BUILT_IN_ARENA} from "@gunsmith/engine/built-in-arenas/drawings/SteppingStonesBuiltInArena";
import {SWITCHBACK_BUILT_IN_ARENA} from "@gunsmith/engine/built-in-arenas/drawings/SwitchbackBuiltInArena";
import {TOWER_OF_DEATH_BUILT_IN_ARENA} from "@gunsmith/engine/built-in-arenas/drawings/TowerOfDeathBuiltInArena";
import {TWIN_RIDGES_BUILT_IN_ARENA} from "@gunsmith/engine/built-in-arenas/drawings/TwinRidgesBuiltInArena";
import {WATCHTOWER_BUILT_IN_ARENA} from "@gunsmith/engine/built-in-arenas/drawings/WatchtowerBuiltInArena";
import {ZIGGURAT_BUILT_IN_ARENA} from "@gunsmith/engine/built-in-arenas/drawings/ZigguratBuiltInArena";
import {FAIR_DUEL_BUILT_IN_ARENA} from "@gunsmith/engine/built-in-arenas/FairDuelBuiltInArena";
import type {BuiltInArena} from "@gunsmith/engine/built-in-arenas/types/BuiltInArena";

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
];
