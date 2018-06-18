
// the position of the vertex
attribute vec3 a_position;
//position of the center of the quad. this is needed for correct billboarding
attribute vec3 a_centerPos;
//time the particle has left to live
attribute float a_time;
//velocity of particle
attribute vec3 a_velocity;
//maximum life time of the particle
attribute float a_lifeTime;

attribute vec2 a_texCoord;

varying vec4 v_color;
varying vec2 v_texCoord;

uniform mat4 u_modelView;
uniform mat4 u_projection;
uniform float u_mass;
uniform vec3 u_generalDirection;
uniform vec4 u_color;
uniform vec4 u_finalColor;
uniform vec3 u_camRight;
uniform float u_timeScaling;

//TODO: Remove? Does not quite give the intended results
uniform vec3 u_vortexPos;
uniform vec3 u_angularVel;
uniform float u_vortexFactor;
uniform int u_numVorteces;
uniform float u_dampening;

void main() {
  float time = (a_lifeTime-a_time)/1000.0; //convert to seconds
  float gravity = time*time*u_mass;

  vec3 vortexVel = cross(u_angularVel, a_centerPos-u_vortexPos) * u_vortexFactor;
  // vec3 vortexVel = vec3(0,0,0);
  // for(int i = 0; i < 10; i++) { //add up contribution of each vortex
  //   if(u_vortexFactor[i] <= 0.00001)  {
  //     continue;
  //   }
  //   vec3 vortexDist = a_centerPos-u_vortexPos[i];
  //   vec3 tempVel = normalize(cross(u_angularVel[i], vortexDist));
  //   float radius = length(vortexDist);
  //   float inverseSquare = 1.0/(1.0+radius*radius);
  //   tempVel *= inverseSquare * u_vortexFactor[i]; //factor by inverse square distance
  //   vortexVel += tempVel;
  // }

  //scale the particle with time
  vec3 scaledPos = a_position*(1.0+u_timeScaling*time);

  //billboard the particle, see visual effects discription for explanation
  vec3 billboardedVert = a_centerPos + u_camRight*scaledPos.x + vec3(0.0, 1, 0.0) * scaledPos.y;

  //calculate the particles movement as a sum of the velocties*time - gravity
  vec3 movement = vortexVel*time + a_velocity*time + u_generalDirection*time-vec3(0.0,gravity < 0.0 ? 0.0 : gravity,0);
  //decrease velocity with lifetime
  movement *= (1.0-u_dampening*(time/(a_lifeTime/1000.0)));

  gl_Position = u_projection * u_modelView
    * vec4((billboardedVert+movement), 1);

  //interpolate color between starting and end value
  vec4 interPolatedColor = mix(u_color, u_finalColor, time/(a_lifeTime/1000.0));

  //send data to fragment shader
  v_color = interPolatedColor;
  v_texCoord = a_texCoord;

}
