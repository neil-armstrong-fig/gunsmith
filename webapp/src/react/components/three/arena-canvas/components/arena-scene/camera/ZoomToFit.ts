import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Viewport} from "@src/react/components/three/arena-canvas/components/arena-scene/camera/types/Viewport";

/** Pixels per tile that make the whole arena fit in the window, using as much of it as the arena's shape allows. */
export function zoomToFit(arena: Arena, viewport: Viewport): number {
  return Math.min(viewport.width / arena.width, viewport.height / arena.height);
}
