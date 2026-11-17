import {PLAYER_HEALTH} from "@gunsmith/engine/health/PlayerHealth";
import type {JSX} from "react";
import {useEffect, useRef} from "react";

interface Props {
  health: number;
  /** How many steps a bullet has hurt the player in: a fall in health that comes with a new hit is a bullet's. */
  bulletHits: number;
}

/**
 * The part of the health bar a burst of bullets took, shown a moment longer: an amber bar behind the real one that follows it down in 350 ms. Only bullets
 * leave a trail, as in art's study; the ring's loss, a little at a time, and a rise in health, as at the start of a round, put it with the bar at once. Told
 * apart by the hit count, which the loop writes with the same step that took the health, so the two arrive in one render.
 */
export function HealthTrail({health, bulletHits}: Props): JSX.Element {
  const shownRef = useRef({health, bulletHits});
  const trailing = health < shownRef.current.health && bulletHits !== shownRef.current.bulletHits;

  useEffect(() => {
    shownRef.current = {health, bulletHits};
  }, [health, bulletHits]);

  return (
    <div
      data-testid="health-trail"
      className="absolute inset-y-0 left-0 rounded-sm bg-gs-warning"
      style={{width: `${(health / PLAYER_HEALTH) * 100}%`, transition: transitionOf(trailing)}}
    />
  );
}

function transitionOf(trailing: boolean): string {
  if (trailing) {
    return "width 350ms linear";
  }

  return "none";
}
