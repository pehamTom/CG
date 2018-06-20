
precision mediump float;

//interpolate argument between vertex and fragment shader
varying vec4 v_color;

//for the particles we simply pass on the color
//correct lighting of the particles (smoke for example) is not correctly
//achieved with phong shading
void main() {
  gl_FragColor = v_color;
}
