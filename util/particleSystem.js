var zero = [0,0,0];

/**
* Function that returns a function to render a Particle Emitter
* @param Emitter to render
**/
function emitterRenderer(emitter) {
	var em = emitter;
	return function(context) {
		var gl = context.gl;
		var shader = context.shader;
		gl.useProgram(shader);

		//get attribute and uniform locations
		var centerLocation = gl.getAttribLocation(shader, "a_centerPos");
	    var timeLocation = gl.getAttribLocation(shader, "a_time");
	    var velocityLocation = gl.getAttribLocation(shader, "a_velocity");
	    var lifeTimeLocation = gl.getAttribLocation(shader, "a_lifeTime");

	    var massLocation = gl.getUniformLocation(shader, "u_mass");
	    var finalColorLocation = gl.getUniformLocation(shader, "u_finalColor");
	    var camRightLocation = gl.getUniformLocation(shader, "u_camRight");
	    var generalDirLocation = gl.getUniformLocation(shader, "u_generalDirection");
	    var colorLocation = gl.getUniformLocation(shader, "u_color");
	    var vortexPosLocation = gl.getUniformLocation(shader, "u_vortexPos");
	    var angularVelLocation = gl.getUniformLocation(shader, "u_angularVel");
	    var vortexFactorLocation = gl.getUniformLocation(shader, "u_vortexFactor");
			var vortexPosLoc = gl.getUniformLocation(shader, "u_vortexPos");
			var angularVelLoc = gl.getUniformLocation(shader, "u_angularVel");
	    var dampeningLocation = gl.getUniformLocation(shader, "u_dampening");
	    var timeScaleLocation = gl.getUniformLocation(shader, "u_timeScaling");
			var positionLoc = gl.getAttribLocation(shader, "a_position");

			var ambientLoc = gl.getUniformLocation(context.shader, "u_material.ambient");
			var diffuseLoc = gl.getUniformLocation(context.shader, "u_material.diffuse");
			var specularLoc = gl.getUniformLocation(context.shader, "u_material.specular");
			var shininessLoc = gl.getUniformLocation(context.shader, "u_material.shininess");
			var emissionLoc = gl.getUniformLocation(context.shader, "u_material.emission");

			var finalAmbientLoc = gl.getUniformLocation(context.shader, "u_finalMaterial.ambient");
			var finalDiffuseLoc = gl.getUniformLocation(context.shader, "u_finalMaterial.diffuse");
			var finalSpecularLoc = gl.getUniformLocation(context.shader, "u_finalMaterial.specular");
			var finalShininessLoc = gl.getUniformLocation(context.shader, "u_finalMaterial.shininess");
			var finalEmissionLoc = gl.getUniformLocation(context.shader, "u_finalMaterial.emission");

			gl.uniform4fv(ambientLoc, em.material.ambient);
			gl.uniform4fv(diffuseLoc, em.material.diffuse);
			gl.uniform4fv(specularLoc, em.material.specular);
			gl.uniform4fv(emissionLoc, em.material.emission);
			gl.uniform1f(shininessLoc, em.material.shininess);

			gl.uniform4fv(finalAmbientLoc, em.finalMaterial.ambient);
			gl.uniform4fv(finalDiffuseLoc, em.finalMaterial.diffuse);
			gl.uniform4fv(finalSpecularLoc, em.finalMaterial.specular);
			gl.uniform4fv(finalEmissionLoc, em.finalMaterial.emission);
			gl.uniform1f(finalShininessLoc, em.finalMaterial.shininess);
		//set uniforms
        gl.uniform1f(massLocation, em.mass);
        gl.uniform3fv(generalDirLocation, em.direction);
		gl.uniform1f(dampeningLocation, em.dampening);
		gl.uniform1f(timeScaleLocation, em.timeScaling);
		if(em.activeVortex) {
			gl.uniform3fv(vortexPosLoc, em.vortexPos);
			gl.uniform3fv(angularVelLoc, em.angularVel);
		}

		//calculate the right vector of the camera; this is used for billboarding
		vec3.cross(em.camRight, camera.direction, camera.up);
		gl.uniform3fv(camRightLocation, camera.rightVec);

		//set buffer for vertex data; AttribDivisor of 0 indicates that the same
		//data should be used for each particle
		setArrayBufferFloatInstanced(em.quadBuffer, positionLoc, 3, 0); //render all vertices per instance

		//set per-vertex buffer data
		setArrayBufferFloatInstanced(em.posbuffer, centerLocation, 3, 1);
        setArrayBufferFloatInstanced(em.timesBuffer, timeLocation, 1, 1);
		setArrayBufferFloatInstanced(em.velocitysBuffer, velocityLocation, 3, 1);
		setArrayBufferFloatInstanced(em.lifeTimesBuffer, lifeTimeLocation, 1, 1);

        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, em.numParticles);

		//i think this is a bug in webgl2. If we don't do this here, then
		//the lighting doesn't work properly because webgl suddenly renders
		//everything instanced and assumes a divisor of 1 if not explicitly statet otherwise
		let normalLoc = gl.getAttribLocation(phongShader, 'a_normal')
	    gl.vertexAttribDivisor(normalLoc, 0);
		let texLoc = gl.getAttribLocation(phongShader, 'a_texCoord')
	    gl.vertexAttribDivisor(texLoc, 0);


		gl.uniform3fv(angularVelLoc, [0,0,0]); //reset Vortex so other particles aren't affected
	}
}

/**
Abstract base class implementing a particle emitter.
Classes that inherit from this must implement the functions:
 - updateParticle(particle)
 - createParticle(particle)


**/
class Emitter {

	/**
	* Constructor for this Emitter. Sets up all the Buffers on the GPU as well as
	* the Buffer for the particles that are emitted
	* @param emitterPos - Position of Emitter in Local coordinates
	* @param partsPerSec - Number of particles to be spawned per second
	* @param maxLifeTime - maximum time a particle should be allowed to exist
	* @param mass - mass of particle (same for every particle)
	* @param direction - direction to send all particles towards
	* @param particleSize - sidelength of one particle (quad)
	* @param fuzziness - factor that weights how much randomness contributes to particle attributes
	* @param startColor - color of particle when lifeTime equals maximum lifeTime
	* @param finalColor - color of particle when lifetime equals 0
	* @param particleProto - Particle prototype to use as template for the creation of all particles
	* @param timeScaling - factor by which particle is scaled over time
	**/
	constructor(emitterPos, partsPerSec, maxLifeTime, mass, direction,
		particleSize, fuzziness, startMaterial, finalMaterial, particleProto, timeScaling) {

		//particle vertex data, this is used to draw each instance of a particle
	    this.quadVertices = new Float32Array([
	      -0.5*particleSize, -0.5*particleSize, 0.0,
	      0.5*particleSize, -0.5*particleSize, 0.0,
	      -0.5*particleSize, 0.5*particleSize, 0.0,
	      0.5*particleSize, 0.5*particleSize, 0.0]
	  );

		//set max size of the particlebuffer
	    this.maxNumPart = partsPerSec*maxLifeTime/1000;

		//copy constructor parameters
		this.emitterPos = emitterPos;
	    this.partsPerSec = partsPerSec;
		this.maxLifeTime = maxLifeTime;
		this.mass = mass;
		this.direction = direction;
		this.fuzziness = fuzziness;
		this.material = startMaterial;
		this.finalMaterial = finalMaterial;
		this.dampening = 0.1;
		this.timeScaling = timeScaling;
		this.activeVortex = false;

		//local buffers
    this.positions = new Float32Array(this.maxNumPart*3);
    this.partTimes = new Float32Array(this.maxNumPart);
		this.velocitys = new Float32Array(this.maxNumPart*3);
		this.lifeTimes = new Float32Array(this.maxNumPart);
		this.particleBuffer = [];
		this.forces=new Float32Array(this.maxNumPart*3);

		//local state variables
	    this.numParticles = 0;
		this.lastusedParticle = 0;

		//create all particles at startup, all particles are initially not alive
		for(var i = 0; i < this.maxNumPart; i++) {
			this.particleBuffer[i] = new particleProto.constructor(this);
		}

		//member variables used to cache data
		this.camDir = [];
		this.camRight = [];

		//gpu buffers
	    this.quadBuffer = setupStaticArrayBuffer(this.quadVertices);
	    this.timesBuffer = gl.createBuffer();
	    this.posbuffer = gl.createBuffer();
		this.velocitysBuffer = gl.createBuffer();
		this.lifeTimesBuffer = gl.createBuffer();
		this.forcesBuffer = gl.createBuffer();
	}

	/**
	* Function for updating the particles in the particle buffer. Generates new particles
	* and copies the data of alive particles into the respective buffers. This function needs to be
	* called each frame
	**/
	update() {

		//calculate number of particles to be spawned this frame
        var partsToSpawn = this.partsPerSec*timer.delta/1000;
		var maxParts = this.partsPerSec*0.04;
		if(partsToSpawn > maxParts) {
			partsToSpawn = maxParts; //clamp to 25FPS
		}

		for(var i = 0; i < partsToSpawn; i++) { //cycle through buffer from last known position and spawn new particles
			this.createParticle(this.particleBuffer[this.lastusedParticle]); //use "abstract" create function

			this.lastusedParticle = (this.lastusedParticle+1)%this.maxNumPart; //cycle through buffer
        }
		let p = null;
		this.numParticles = 0;
        for(i = 0; i < this.maxNumPart; i++) { //set data for all particles
			p = this.particleBuffer[i];
			if(p.isAlive()) {	//check if particle is alive
				p.update();
	            if(p.isAlive()) { //check if particle still alive otherwise we don't update

					// copy values to gpu buffers
					this.positions[this.numParticles*3] = p.pos[0];
					this.positions[this.numParticles*3+1] = p.pos[1];
					this.positions[this.numParticles*3+2] = p.pos[2];
					this.velocitys[this.numParticles*3] = p.velocity[0];
					this.velocitys[this.numParticles*3+1] = p.velocity[1];
					this.velocitys[this.numParticles*3+2] = p.velocity[2];
					this.partTimes[this.numParticles] = p.time;
					this.lifeTimes[this.numParticles] = p.lifeTime;
					this.numParticles++;
	            }
			}
        }

		//numParticles has been incremented once too often
		//if no particle was created (for some reason) set number of particles to 0
		this.numParticles = this.numParticles == 0 ? 0 : this.numParticles-1;

		//set buffer data
		setDynamicArrayBufferData(this.timesBuffer, this.partTimes);
		setDynamicArrayBufferData(this.posbuffer, this.positions);
		setDynamicArrayBufferData(this.velocitysBuffer, this.velocitys);
		setDynamicArrayBufferData(this.lifeTimesBuffer, this.lifeTimes);
	}

	/**
	* Reset all particles to being dead
	**/
	reset(){
		this.particleBuffer.forEach(function(particle) {
			particle.reset();
		})
		this.lastusedParticle = 0;
	}

	setVortex(vortexPos, angularVel) {
		this.activeVortex = true;
		this.vortexPos = vortexPos;
		this.angularVel = angularVel;
	}
}



/**
Implementation of a particle emitter
Emits Particles origining on a plane and sends them towards direction
**/
class PlaneEmitter extends Emitter {

	/**
	* planeX and planeZ span the plane
	* @param planeX - x coordinate of plane
	* @param planeZ - z coordinate of plane
	**/
	constructor(emitterPos = [0,0,0], partsPerSec, maxLifeTime, mass=1,
	direction=[0,0,0], particleSize=0.01, fuzziness=0, startColor, finalColor, particleProto, timeScaling, planeX=[1,0,0], planeZ=[0,0,1]) {

		super(emitterPos, partsPerSec, maxLifeTime, mass, direction,
			particleSize, fuzziness, startColor, finalColor, particleProto, timeScaling);

		//local plane coordinate system
	    this.planeX = planeX;
	    this.planeZ = planeZ;
		this.planeWidth = vec3.distance(this.emitterPos, vec3.add([], this.emitterPos, vec3.add([], this.planeX, this.planeZ))); //just for caching the value

		//variables used for caching
		this.planePos = [];
		this.localX = [];
		this.localZ = [];
	}

	/**
	* Create Particle on a random point on the plane
	**/
	createParticle(particle) {
        var rand1 = Math.random();
        var rand2 = Math.random();
        vec3.copy(this.planePos, this.emitterPos);
		vec3.scale(this.localX, this.planeX, (rand1*2-1));
		vec3.scale(this.localZ, this.planeZ, (rand2*2-1));
		vec3.add(this.planePos, this.planePos, this.localX);
		vec3.add(this.planePos, this.planePos, this.localZ);
		particle.spawn(this.planePos, zero);
	}

}

/**
Implementation of a particle emitter
Emits Particles on the boundaries of a sphere and sends them uniformly around the sphere+direction

**/
class SphereEmitter extends Emitter {
	/**
	* Additional parameters
	* @param radius - radius of the sphere
	* @param momentum - speed at which particles are emitted perpendicular to the tangent of  the sphere
	**/
	constructor(emitterPos = [0,0,0], partsPerSec, maxLifeTime, mass=1,
	direction=[0,0,0], particleSize=0.01, fuzziness=0, startColor, finalColor, particleProto, timeScaling, radius, momentum = 0) {

		super(emitterPos, partsPerSec, maxLifeTime, mass, direction,
			particleSize, fuzziness, startColor, finalColor, particleProto, timeScaling);
		this.radius = radius;
		this.momentum = momentum;

		//variables used for caching
		this.pos = [0, 0, 0];
		this.xyz = [0, 0, 0];
		this.velocity = [0, 0, 0];
	}

	/**
	* Create particle on a random point on the sphere
	**/
	createParticle(particle) {

		//create random point on sphere
		let x = (Math.random()*2-1);
		let y = (Math.random()*2-1);
		let z = (Math.random()*2-1);
		let normalizer = 1/Math.sqrt(x*x+y*y+z*z);
		x *= normalizer*this.radius;
		y *= normalizer*this.radius;
		z *= normalizer*this.radius;

		vec3.copy(this.pos, zero);
		this.xyz[0] = x;
		this.xyz[1] = y;
		this.xyz[2] = z;
		vec3.add(this.pos, this.emitterPos, this.xyz);
		vec3.sub(this.velocity, this.pos, this.emitterPos);
		vec3.normalize(this.velocity, this.velocity);
		vec3.scale(this.velocity,  this.xyz, this.momentum);
		particle.spawn(this.pos, this.velocity);
	}

}

/**
* Implementation of an Emitter. Emits particles on a random point on a sphere
**/
class CircleEmitter extends PlaneEmitter {

	/**
	* Additional parameters
	* @param planeX - local X coordinate of the plane the circle lies on
	* @param planeZ - local Z coordinate of the plane the circle lies on
	* @param radius- radius of the circle
	* @param momentum - speed at which particles are emitted perpendicular to the tangent of  the circle
	**/
	constructor(emitterPos = [0,0,0], partsPerSec, maxLifeTime, mass=1,
	direction=[0,0,0], particleSize=0.01, fuzziness=0, startColor, finalColor,
	particleProto, timeScaling, planeX=[1,0,0], planeZ=[0,0,1], radius, momentum = 0) {

		vec3.normalize(planeX, planeX);
		vec3.normalize(planeZ, planeZ);

		super(emitterPos, partsPerSec, maxLifeTime, mass,
		direction, particleSize, fuzziness, startColor,
		finalColor, particleProto, timeScaling, planeX, planeZ);

		this.radius = radius;
		this.momentum = momentum;

		this.localX = [0, 0, 0];
		this.localZ = [0, 0, 0];
		this.circlePoint = [0, 0, 0];
		this.pos = [0, 0, 0];
		this.velocity = [0, 0, 0];
		this.x = 0;
		this.z = 0;
		this.normalizer = 0;
	}

	//create random point on circle
	createParticle(particle) {
		this.x = (Math.random()*2-1);
		this.z = (Math.random()*2-1);
		this.normalizer = 1/Math.sqrt(this.x*this.x+this.z*this.z);
		this.x *= this.normalizer*this.radius;
		this.z *= this.normalizer*this.radius;


		vec3.scale(this.localX, this.planeX, this.x);
		vec3.scale(this.localZ, this.planeZ, this.z);
		vec3.add(this.circlePoint, this.localX, this.localZ);
		vec3.add(this.pos, this.emitterPos, this.circlePoint);
		vec3.scale(this.velocity,  this.circlePoint, this.momentum);
		particle.spawn(this.pos, this.velocity);
	}
}


/**
* Base class for particles
**/
class Particle {

	/**
	* Constructor for this particle. Initially the particle is not alive and at position 0
	* @param emitter - emitter this particle belongs to
	**/
	constructor(emitter) {
		this.time = 0;
		this.pos = [0,0,0];
		this.velocity = [0,0,0];
		this.lifeTime = 0;
		this.force = [0,0,0];
		this.emitter = emitter;
	}

	/**
	* Spawn particle
	* @param pos - center position of the particles quad
	* @param velocity - velocity of particle
	**/
	spawn(pos, velocity) {
		this.time = this.emitter.maxLifeTime;
		vec3.copy(this.pos, pos);
		vec3.copy(this.velocity, velocity);
		this.lifeTime = this.emitter.maxLifeTime;
	}

	/**
	* Reset particle to it's initial state (after construction)
	**/
	reset() {
		this.time = 0;
		this.pos = [0,0,0];
		this.velocity = [0,0,0];
		this.lifeTime = 0;
		this.force = [0,0,0];
	}

	/**
	* Update particles timer
	**/
	update() {
		this.time -= timer.delta;
	}

	/**
	* Check if particle time has not exceeded it's maximum lifetime
	**/
	isAlive() {
		return this.time > 0;
	}
}

/**
* Particle used to emulate smoke effect
**/
class SmokeParticle extends Particle {

	spawn(pos, velocity) {
		super.spawn(pos, velocity);
		this.lifeTime = this.emitter.maxLifeTime*(Math.random()*this.emitter.fuzziness+(1-this.emitter.fuzziness));
	}
}

/**
* Particle to emulate a campfire
**/
class FireParticle extends Particle {
	constructor(emitter) {
		super(emitter);
	}

	/**
	* When a FireParticle is used on a PlaneEmitter, the particles lifeTime
	* decreases with it's distance from the center of the plane. Thus the effect
	* of a cone shaped fire is created
	**/
	spawn(pos, velocity) {
		vec3.copy(this.pos, pos);
		vec3.copy(this.velocity, velocity);

		if(this.emitter.planeWidth) { //if a planeemitter is used, lifetime of particle depends on distance from origin
			var centerDistance = vec3.distance(this.pos, this.emitter.emitterPos);
			this.lifeTime = this.emitter.maxLifeTime*(1-centerDistance*2/this.emitter.planeWidth);
			this.time = this.lifeTime;
		} else {
			this.lifeTime = this.emitter.maxLifeTime;
			this.time = this.lifeTime;
		}
	}
}

/**
* Particle that factors randomness into it's velocity. The random numbers are
* weighted with the fuzziness of the parent emitter
**/
class FuzzyParticle extends Particle {

	constructor(emitter) {
		super(emitter);
		this.randVec = vec3.copy([], zero);
	}

	spawn(pos, velocity) {
		super.spawn(pos, velocity);
		this.randVec[0] = Math.random()*2-1;
		this.randVec[1] = Math.random()*2-1;
		this.randVec[2] = Math.random()*2-1;
		vec3.add(this.velocity, this.velocity, this.randVec);
	}
}

/**
* Factory for emitters
* TODO: Remove? Might be superfluous
**/
var ps = {
	createSnowEmitter: function(pos, length, width, maxLifeTime, partsPerSec) {
		return new PlaneEmitter(pos, partsPerSec, maxLifeTime, 0.03, [0.0,-3.5,0], 0.07,
	        0.01, snowMaterial, snowMaterial, new FuzzyParticle(null), 0, [length,0,0], [0,0,width]);
	}
}
