
// the position of the point
attribute vec3 a_position;

//the color of the point
attribute vec3 a_color;

attribute vec4 a_centerPos;

attribute float a_time;

attribute vec3 a_initVel;

attribute vec3 a_acceleration;
//attribute vec3 a_fuzziness;

varying vec3 v_color;

uniform mat4 u_modelView;
uniform mat4 u_projection;
uniform vec3 u_generalDirection;
uniform float u_mass;
uniform float u_lifeTime;

//like a C program main is the main function
void main() {

  gl_Position = u_projection * u_modelView
    * vec4((a_position+a_centerPos.xyz*a_time) *a_centerPos.w, 1);

  //just copy the input color to the output varying color
  v_color = a_color;
}
