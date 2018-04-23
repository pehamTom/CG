
// the position of the point
attribute vec3 a_position;
attribute vec3 a_centerPos;
attribute float a_time;
attribute vec3 a_velocity;
attribute float a_lifeTime;
attribute vec3 a_force;

varying vec4 v_color;

uniform mat4 u_modelView;
uniform mat4 u_projection;
uniform float u_mass;
uniform vec3 u_generalDirection;
uniform vec4 u_color;
uniform vec4 u_finalColor;
uniform vec3 u_camRight;
uniform vec3 u_timeScaling;

uniform vec3 u_vortexPos[10];
uniform vec3 u_angularVel[10];
uniform float u_vortexFactor[10];
uniform int u_numVorteces;
uniform float u_dampening;

//like a C program main is the main function
void main() {
  float time = (a_lifeTime-a_time)/1000.0; //convert to seconds
  float gravity = time*time*u_mass;

  vec3 vortexVel = vec3(0,0,0);
  for(int i = 0; i < 10; i++) { //add up contribution of each vortex
    if(u_vortexFactor[i] <= 0.00001)  {
      continue;
    }
    vec3 vortexDist = a_centerPos-u_vortexPos[i];
    vec3 tempVel = length(u_angularVel[i])*normalize(cross(u_angularVel[i], vortexDist));
    float radius = length(vortexDist);
    float inverseSquare = 1.0/(1.0+vortexDist.x*vortexDist.x+vortexDist.y*vortexDist.y+vortexDist.z*vortexDist.z);
    tempVel *= inverseSquare * u_vortexFactor[i]; //factor by inverse square distance
    vortexVel += tempVel;
  }

  vec3 billboardedVert = a_centerPos + u_camRight*a_position.x + vec3(0.0, 1, 0.0) * a_position.y;
  vec3 movement = a_velocity*time + vortexVel*time + a_force*time*time/(u_mass+0.00000001) + u_generalDirection*time-vec3(0.0,gravity < 0.0 ? 0.0 : gravity,0);
  movement *= (1.0-u_dampening*(time/(a_lifeTime/1000.0)));
  gl_Position = u_projection * u_modelView
    * vec4((billboardedVert+movement), 1);

  vec4 interPolatedColor = mix(u_color, u_finalColor, time/(a_lifeTime/1000.0));
  v_color = interPolatedColor;
}
