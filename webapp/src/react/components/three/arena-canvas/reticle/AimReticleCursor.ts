import aimReticleUrl from "@src/react/components/three/arena-canvas/reticle/AimReticle.png";

/**
 * The reticle's centre, in pixels from the picture's top-left corner: its 32 by 32 picture is `art`'s precision crosshair
 * (`docs/art/concepts/aim-reticle/`, copied here as `AimReticle.png`), whose open centre is the aimed-at point.
 */
const HOTSPOT_PIXELS = 16;

/**
 * The CSS `cursor` value for the arena while a round is played: the reticle, then the browser's own crosshair for when
 * the picture cannot be used (CSS requires a keyword last). It is set on the arena only, so overlays keep the ordinary pointer.
 */
export const aimReticleCursor = `url("${aimReticleUrl}") ${HOTSPOT_PIXELS} ${HOTSPOT_PIXELS}, crosshair`;
