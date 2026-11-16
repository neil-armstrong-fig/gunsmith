import aimReticleUrl from "@src/react/components/three/arena-canvas/reticle/AimReticle.png";
import aimReticleSharpUrl from "@src/react/components/three/arena-canvas/reticle/AimReticleSharp.png";

/**
 * The reticle's centre, in CSS pixels from the picture's top-left corner: its 32 by 32 picture is `art`'s precision crosshair
 * (`docs/art/concepts/aim-reticle/`, copied here as `AimReticle.png`), whose open centre is the aimed-at point. The 64 by 64 picture
 * for a sharp screen (`AimReticleSharp.png`, `art`'s 2x export) has the same centre, since a cursor's hotspot is counted in CSS
 * pixels and a 2x picture has two of its own to each.
 */
const HOTSPOT = 16;

/**
 * The CSS `cursor` value for the arena while a round is played: the reticle, the 32 pixel picture on an ordinary screen and the
 * 64 pixel one on a sharp screen (so it is not soft there), then the browser's own crosshair for when the pictures cannot be used
 * (CSS requires a keyword last). It is set on the arena only, so overlays keep the ordinary pointer.
 */
export const aimReticleCursor = `image-set(url("${aimReticleUrl}") 1x, url("${aimReticleSharpUrl}") 2x) ${HOTSPOT} ${HOTSPOT}, crosshair`;
