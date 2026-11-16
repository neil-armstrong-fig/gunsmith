#version 100
// What three.js declares ahead of a ShaderMaterial's vertex shader, so a linter that sees the file alone knows these names.
precision highp float;
uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat3 normalMatrix;
uniform vec3 cameraPosition;
attribute vec3 position;
