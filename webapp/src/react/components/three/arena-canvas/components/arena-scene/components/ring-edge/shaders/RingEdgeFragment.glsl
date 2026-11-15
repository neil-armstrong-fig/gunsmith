// THE FRAGMENT SHADER
//
// After the vertex shader has placed the rectangle on the screen, the graphics card works out which screen pixels it covers. The
// fragment shader runs once for every one of those pixels, in parallel, thousands at a time, and answers: what colour is this pixel?
// (A "fragment" is a pixel that may be drawn.) It cannot remember anything from one pixel to the next: each runs on its own.
//
// What this one draws, for the closing ring (a circle that shrinks, with its centre and radius in tiles):
//   - inside the circle: nothing at all (the pixel is thrown away, so the arena shows through untouched),
//   - a thin bright red band along the circle's edge,
//   - outside the circle: a faint red tint, because the ground there hurts.
//
// The colour is the palette's `--color-gs-ring` (#ff5b62) written as numbers, since WebGL cannot read CSS.

// A `uniform` is a value the game sets from outside, once per frame. It is the same for every pixel. Here the game writes them from
// the engine's own ring (see RingEdge.tsx), the same circle that decides who takes damage.
uniform vec2 uCentre;  // where the circle's centre is, in tiles: x then y
uniform float uRadius; // how far the safe ground reaches from the centre, in tiles; it shrinks as the ring closes

// Arrives from the vertex shader (see RingEdgeVertex.glsl): where in the arena, in tiles, this pixel is. It must be declared the same
// way here as there.
varying vec2 vArenaPlace;

// `const` values never change. Colours are written as red, green and blue, each from 0.0 (none) to 1.0 (full), not 0 to 255:
// #ff5b62 is red 255, green 91, blue 98, and 255 / 255 = 1.0, 91 / 255 = 0.357, 98 / 255 = 0.384.
const vec3 RING_COLOUR = vec3(1.0, 0.357, 0.384);
// How wide the bright band is, in tiles. It is fixed, so it stays the same width however small the ring has closed.
const float EDGE_WIDTH = 0.12;
// How see-through the red tint outside the ring is: 0.0 is invisible, 1.0 is solid. 0.16 is a faint wash.
const float OUTSIDE_TINT = 0.16;

// `main` runs once for every pixel the rectangle covers.
void main() {
  // How far this pixel is from the ring's centre, in tiles. `distance` is the straight-line distance between two points.
  float distanceFromCentre = distance(vArenaPlace, uCentre);

  // Safely inside the circle, further in than the band: draw nothing. `discard` throws this pixel away, so whatever is behind it (the
  // arena floor, the walls) stays exactly as it was.
  if (distanceFromCentre < uRadius - EDGE_WIDTH) {
    discard;
  }

  // Not discarded, so the pixel is either in the band or outside. In the band (between the inner edge of the band and the circle's
  // edge itself): the bright ring colour, almost solid. `vec4` adds a fourth number to a colour: its opacity, called alpha. The
  // `return` ends `main` here, so the lines below only run for pixels outside the circle.
  if (distanceFromCentre <= uRadius) {
    gl_FragColor = vec4(RING_COLOUR, 0.95);
    return;
  }

  // Outside the circle: the same colour, but only faintly opaque, so the ground under it still shows through. `gl_FragColor` is the
  // answer the card is waiting for from every fragment shader: this pixel's colour. (The material is marked transparent in
  // RingEdge.tsx, which is what lets the opacity blend the red with what is underneath.)
  gl_FragColor = vec4(RING_COLOUR, OUTSIDE_TINT);
}
