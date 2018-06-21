precision mediump float;

/**
 * definition of a material structure containing common properties
 */
struct Material {
	vec4 ambient;
	vec4 diffuse;
	vec4 specular;
	vec4 emission;
	float shininess;
};

/**
 * definition of the light properties related to material properties
 */
struct Light {
	vec4 ambient;
	vec4 diffuse;
	vec4 specular;
};

uniform Light u_light;
uniform Light u_light2;

uniform Light u_spotLight;
uniform vec3 u_spotLightPos;
uniform vec3 u_spotLightDirection;
uniform float u_spotLightAngle;
//flag that indicates if spotlight should be considered in shading
uniform bool u_spotLightActive;

//texture for this fragment
uniform sampler2D u_tex;

//flag that indicates if texture should be applied
uniform bool u_enableObjectTexture;

//varying vectors for light computation
varying vec3 v_normalVec;
varying vec3 v_eyeVec;
varying vec3 v_lightVec;
varying vec3 v_light2Vec;
varying vec3 v_spotLightVec;
varying vec2 v_texCoord;
varying vec4 u_ambient;

varying vec4 v_diffuse;
varying vec4 v_ambient;
varying vec4 v_specular;
varying vec4 v_emission;
varying float v_shininess;


vec4 calculateSimplePointLight(Light light, Material material, vec3 lightVec, vec3 normalVec, vec3 eyeVec, vec4 textureColor) {
	lightVec = normalize(lightVec);
	normalVec = normalize(normalVec);
	eyeVec = normalize(eyeVec);

	//compute diffuse term
	float diffuse = max(dot(normalVec,lightVec),0.0);

	//compute specular term
	vec3 reflectVec = reflect(-lightVec,normalVec);
	float spec = pow( max( dot(reflectVec, eyeVec), 0.0) , material.shininess);

	if(u_enableObjectTexture)
	{
		material.diffuse = textureColor;
		material.ambient = textureColor;
		material.specular = vec4(0.0, 0.0, 0.0, 0.0);
		material.emission = vec4(0.0, 0.0, 0.0, 0.0);
	}

	vec4 c_amb  = clamp(light.ambient * material.ambient, 0.0, 1.0);
	vec4 c_diff = clamp(diffuse * light.diffuse * material.diffuse, 0.0, 1.0);
	vec4 c_spec = clamp(spec * light.specular * material.specular, 0.0, 1.0);

	return c_amb + c_diff + c_spec;
}

void main() {

  Material particleMaterial = Material(v_ambient,
                                    v_diffuse,
                                    v_specular,
                                    v_emission,
                                    v_shininess);
	vec4 textureColor = vec4(0,0,0,0);
  if(u_enableObjectTexture)
  {
		textureColor = texture2D(u_tex, v_texCoord);
	}

	gl_FragColor =
		calculateSimplePointLight(u_light, particleMaterial, v_lightVec, v_normalVec, v_eyeVec, textureColor)
		+ calculateSimplePointLight(u_light2, particleMaterial, v_light2Vec, v_normalVec, v_eyeVec, textureColor);

	//calculate the angle between the direction vector of the spotlight and the
	//direction vector (interpolated) from fragment to the spotlight position
	float angleToSpotLight = acos(dot(u_spotLightDirection, (-v_eyeVec)) / (length(u_spotLightDirection) * length(v_eyeVec)));

	//if angleToSpotLight is within the radius of the cone of the spotlight
	//then shade the fragment also with the spotlight
	if(u_spotLightActive && angleToSpotLight < u_spotLightAngle) {
		//the color is also weighted so that fragments that are close to the center
		//of the cone are brighter. This looks more natural
		gl_FragColor += 3.0 * (1.0 - (angleToSpotLight / u_spotLightAngle)) * calculateSimplePointLight(u_spotLight, particleMaterial, v_spotLightVec, v_normalVec, v_eyeVec, textureColor);

  }

    //the emission component shouldn't be added more than once
    //it doesn't make sense that a light emitting source emits more light
    //if more light shines on it (fire isn't brighter if you light a lamp at it)
    gl_FragColor += particleMaterial.emission;
}
