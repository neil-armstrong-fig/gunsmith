#version 100
// What three.js declares ahead of a ShaderMaterial's fragment shader, so a linter that sees the file alone knows these names.
precision highp float;
uniform mat4 viewMatrix;
uniform vec3 cameraPosition;
