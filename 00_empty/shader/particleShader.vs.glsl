precision mediump float;

struct Material {
	vec4 ambient;
	vec4 diffuse;
	vec4 specular;
	vec4 emission;
	float shininess;
};

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

uniform mat4 u_modelView;
uniform mat4 u_projection;
uniform mat3 u_normalMatrix;

uniform float u_mass;
uniform vec3 u_generalDirection;
uniform Material u_material;
uniform Material u_finalMaterial;
uniform vec3 u_camRight;
uniform float u_timeScaling;

uniform vec3 u_lightPos;
uniform vec3 u_light2Pos;
uniform vec3 u_spotLightPos;

uniform vec3 u_vortexPos;
uniform vec3 u_angularVel;

uniform float u_dampening;

varying vec4 v_diffuse;
varying vec4 v_ambient;
varying vec4 v_specular;
varying vec4 v_emission;
varying float v_shininess;
varying vec3 v_normalVec;
varying vec3 v_eyeVec;
varying vec3 v_lightVec;
varying vec3 v_light2Vec;
varying vec3 v_spotLightVec;
varying vec2 v_texCoord;

void main() {
  float time = (a_lifeTime-a_time)/1000.0; //convert to seconds
  float gravity = time*time*u_mass;

  vec3 vortexVel = cross(u_angularVel, a_centerPos-u_vortexPos);



  //scale the particle with time
  vec3 scaledPos = a_position*(1.0+u_timeScaling*time);

  //billboard the particle, see visual effects discription for explanation
  vec3 billboardedVert = a_centerPos + u_camRight*scaledPos.x + vec3(0.0, 1, 0.0) * scaledPos.y;

  //calculate the particles movement as a sum of the velocties*time - gravity (gravity is positive but should pull the fragment towards the negative y-axis)
  vec3 movement = vortexVel*time + a_velocity*time + u_generalDirection*time-vec3(0.0,gravity < 0.0 ? 0.0 : gravity,0);
  //decrease velocity with lifetime
  movement *= (1.0-u_dampening*(time/(a_lifeTime/1000.0)));

  vec3 worldPos = billboardedVert+movement;
  gl_Position = u_projection * u_modelView
    * vec4((worldPos), 1);


  vec4 eyePosition = u_modelView * vec4(worldPos,1);

	//ignore homogenous coordinate in camera space
	v_eyeVec = -eyePosition.xyz;
  //calculate vector from vertex to light
  v_lightVec = u_lightPos - eyePosition.xyz;
  v_light2Vec = u_light2Pos - eyePosition.xyz;
  v_spotLightVec = u_spotLightPos - eyePosition.xyz;

  //interpolate material properties between start and endvalue
  float interpolationVal = time/(a_lifeTime/1000.0);
  v_diffuse = mix(u_material.diffuse, u_finalMaterial.diffuse, interpolationVal);
  v_ambient = mix(u_material.ambient, u_finalMaterial.ambient, interpolationVal);
  v_emission = mix(u_material.emission, u_finalMaterial.emission, interpolationVal);
  v_specular = mix(u_material.specular, u_finalMaterial.specular, interpolationVal);
  v_shininess = mix(u_material.shininess, u_finalMaterial.shininess, interpolationVal);

  v_texCoord = a_texCoord;

  //the normalVector of the particle depends only on the up and rightvector of the
  //camera because the particles are aligned along the camera plane
  v_normalVec = cross(u_camRight, vec3(0, 1, 0));
  v_normalVec = u_normalMatrix * v_normalVec;
}
