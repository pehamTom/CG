/**
 * as simple fragment shader just setting the provided color as fragment color
 * Created by Samuel Gratzl on 08.02.2016.
 */

//need to specify how "precise" float should be
precision mediump float;

//interpolate argument between vertex and fragment shader
varying vec4 v_color;

//entry point again
void main() {
  if(v_color.w <= 0.0) discard; 
  gl_FragColor = v_color;
}
