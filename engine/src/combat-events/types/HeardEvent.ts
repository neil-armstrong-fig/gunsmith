import type {HeardSound} from "@gunsmith/engine/sound/types/HeardSound";
import type {Loudness} from "@gunsmith/engine/sound/types/Loudness";
import type {Sector} from "@gunsmith/engine/sound/types/Sector";

/**
 * The other fighter was heard making `sound` (a shot, a footfall or the taking of a weapon) from `sector`, whether or not they could
 * be seen: a direction of about eight and a loudness of three and nothing else, no place and no distance, and no level for each
 * speaker, so a hidden fighter gives away which way and roughly how near. The browser works out what each ear hears.
 */
export interface HeardEvent {
  kind: "heard";
  sound: HeardSound;
  sector: Sector;
  loudness: Loudness;
}
