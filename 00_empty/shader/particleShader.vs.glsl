
// the position of the point
attribute vec3 a_position;
attribute vec3 a_centerPos;
attribute float a_time;
attribute vec3 a_velocity;
attribute float a_lifeTime;

varying vec4 v_color;

uniform mat4 u_modelView;
uniform mat4 u_projection;
uniform float u_mass;
uniform vec3 u_generalDirection;
uniform vec4 u_color;
uniform vec4 u_finalColor;
uniform vec3 u_camRight;

//like a C program main is the main function
void main() {
  mat4 toCenter = mat4(1.0, 0.0, 0.0, 0.0,
              0.0, 1.0, 0.0, 0.0,
              0.0, 0.0, 1.0, 0.0,
              -a_centerPos, 1.0);
  mat4 back = mat4(1.0, 0.0, 0.0, 0.0,
              0.0, 1.0, 0.0, 0.0,
              0.0, 0.0, 1.0, 0.0,
              a_centerPos, 1.0);

  float time = (a_lifeTime-a_time)/1000.0; //convert to seconds
  float gravity = time*time*u_mass;
  vec3 billboardedVert = a_centerPos + u_camRight*a_position.x + vec3(0.0, 1, 0.0) * a_position.y;
  vec3 temp = a_velocity*time + u_generalDirection*time-vec3(0.0,gravity < 0.0 ? 0.0 : gravity,0);
  gl_Position = u_projection * back * u_modelView * toCenter
    * vec4((billboardedVert+temp), 1);

  vec4 interPolatedColor = mix(u_color, u_finalColor, time/(a_lifeTime/1000.0));
  v_color = interPolatedColor;
}
