
// the position of the point
attribute vec3 a_position;

attribute vec3 a_centerPos;

attribute float a_time;

attribute vec3 a_offset;


varying vec4 v_color;

uniform mat4 u_modelView;
uniform mat4 u_projection;
uniform float u_mass;
uniform float u_lifeTime;
uniform vec3 u_generalDirection;
uniform vec4 u_color;
uniform vec4 u_finalColor;


//like a C program main is the main function
void main() {
  float time = (u_lifeTime-a_time)/1000.0; //convert to seconds
  float gravity = time*time*u_mass;
  vec3 temp = u_generalDirection*time-vec3(0.0,gravity < 0.0 ? 0.0 : gravity,0);
  gl_Position = u_projection * u_modelView
    * vec4((a_position+a_offset+temp+a_centerPos), 1);

  //just copy the input color to the output varying color
  vec4 interPolatedColor = mix(u_color, u_finalColor, time/(u_lifeTime/1000.0));
  if(a_time >= 0.0)
    v_color = interPolatedColor;
  else
    v_color = vec4(interPolatedColor.xyz, 0.0);
}
