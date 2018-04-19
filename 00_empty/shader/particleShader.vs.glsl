
// the position of the point
attribute vec3 a_position;

//the color of the point
attribute vec4 a_color;

attribute vec4 a_centerPos;

attribute float a_time;

attribute vec3 a_initVel;

attribute vec3 a_offset;

varying vec4 v_color;

uniform mat4 u_modelView;
uniform mat4 u_projection;
uniform float u_mass;
uniform float u_lifeTime;

//like a C program main is the main function
void main() {
  float time = u_lifeTime-a_time;
  float gravity = time*time*u_mass/1000000.0;
  vec3 temp = a_centerPos.xyz*time/1000.0-vec3(0.0,gravity < 0.0 ? 0.0 : gravity,0);
  gl_Position = u_projection * u_modelView
    * vec4((a_position+a_offset+temp) *a_centerPos.w, 1);

  //just copy the input color to the output varying color
  if(a_time >= 0.0)
    v_color = a_color;
  else
    v_color = vec4(a_color.xyz, 0.0);
}
