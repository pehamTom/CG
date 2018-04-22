/**
 * as simple vertex shader setting the position of a vertex
 * Original file created by Samuel Gratzl on 08.02.2016.
 */

// the position of the point
attribute vec3 a_position;

varying vec3 v_color;

uniform mat4 u_modelView;
uniform mat4 u_projection;
uniform vec3 u_color;
uniform mat3 u_normalMatrix;

//like a C program main is the main function
void main() {

  gl_Position = u_projection * u_modelView
    * vec4(a_position, 1);

  //just copy the input color to the output varying color
  v_color = u_color;
}
