// THE VERTEX SHADER
//
// A shader is a small program that runs on the graphics card. A mesh (here, one flat rectangle the size of the arena) is made of
// points called vertices. The vertex shader runs once for every vertex and answers one question: where on the screen does this
// point go? (Its other job, here, is to pass information on to the fragment shader, which is in RingEdgeFragment.glsl.)
//
// You will see names in this file that are never declared. three.js declares them for us and puts them ahead of this text when it
// compiles it: `position` (this vertex's place inside the mesh), `modelMatrix` (moves the mesh to where it sits in the arena),
// `viewMatrix` (the camera's place) and `projectionMatrix` (the camera's lens: how the arena is squashed onto the screen).
// A "matrix" is a grid of numbers that moves, turns or squashes a point when you multiply the point by it.

// A `varying` carries a value from the vertex shader to the fragment shader. The graphics card fills in the values between the
// rectangle's corners for us: a pixel half way between two corners receives a value half way between theirs. So here each pixel
// of the rectangle receives its own place in the arena, in tiles, as an (x, y) pair: `vec2` is a pair of decimal numbers.
varying vec2 vArenaPlace;

// `main` is the function the card runs for every vertex. Every shader has one.
void main() {
  // `vec4(position, 1.0)` makes a four-number point from the three-number position (matrices work on four numbers; the 1.0 says
  // "this is a place, not a direction"). Multiplying by `modelMatrix` turns the place inside the mesh into a place in the arena,
  // and `.xy` keeps only the first two numbers, x and y, dropping the height. The arena is drawn flat, so we never need the third.
  vArenaPlace = (modelMatrix * vec4(position, 1.0)).xy;

  // `gl_Position` is the answer the card is waiting for: where this vertex lands on the screen. The multiplication runs the point
  // through the three steps in turn, from the right: the mesh to the arena (model), the arena as the camera sees it (view), and
  // the camera's lens onto the screen (projection). This line is the same in nearly every vertex shader.
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}
