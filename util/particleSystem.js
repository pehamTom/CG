var zero = [0,0,0];

function emitterRenderer(emitter) {
	var em = emitter;
	return function(context) {
		var gl = context.gl;
		var shader = context.shader;
		gl.useProgram(shader);

		var centerLocation = gl.getAttribLocation(shader, "a_centerPos");
	    var timeLocation = gl.getAttribLocation(shader, "a_time");
	    var velocityLocation = gl.getAttribLocation(shader, "a_velocity");
	    var lifeTimeLocation = gl.getAttribLocation(shader, "a_lifeTime");
	    var forceLocation = gl.getAttribLocation(shader, "a_force");
	    var massLocation = gl.getUniformLocation(shader, "u_mass");
	    var finalColorLocation = gl.getUniformLocation(shader, "u_finalColor");
	    var camRightLocation = gl.getUniformLocation(shader, "u_camRight");
	    var generalDirLocation = gl.getUniformLocation(shader, "u_generalDirection");
	    var colorLocation = gl.getUniformLocation(shader, "u_color");
	    var vortexPosLocation = gl.getUniformLocation(shader, "u_vortexPos");
	    var angularVelLocation = gl.getUniformLocation(shader, "u_angularVel");
	    var vortexFactorLocation = gl.getUniformLocation(shader, "u_vortexFactor");
	    var numVortexLocation = gl.getUniformLocation(shader, "u_numVorteces");
	    var dampeningLocation = gl.getUniformLocation(shader, "u_dampening");
	    var timeScaleLocation = gl.getUniformLocation(shader, "u_timeScaling");
		var positionLoc = gl.getAttribLocation(shader, "a_position");

		//set uniforms
        gl.uniform1f(massLocation, em.mass);
        gl.uniform4fv(colorLocation, em.quadColors);
        gl.uniform4fv(finalColorLocation, em.finalColors);
        gl.uniform3fv(generalDirLocation, em.direction);
		gl.uniform1f(dampeningLocation, em.dampening);
		gl.uniform1f(timeScaleLocation, em.timeScaling);
		vec3.cross(em.camRight, camera.direction, camera.up);
		gl.uniform3fv(camRightLocation, em.camRight);

        setArrayBufferFloat(em.quadBuffer, positionLoc, 3); //render all vertices per instance

		setArrayBufferFloatInstanced(em.posbuffer, centerLocation, 3, 1);
        setArrayBufferFloatInstanced(em.timesBuffer, timeLocation, 1, 1);
		setArrayBufferFloatInstanced(em.velocitysBuffer, velocityLocation, 3, 1);
		setArrayBufferFloatInstanced(em.lifeTimesBuffer, lifeTimeLocation, 1, 1);
		setArrayBufferFloatInstanced(em.forcesBuffer, forceLocation, 3, 1);
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, em.numParticles);

		//i think this is a bug in webgl2. If we don't do this here, then
		//the lighting doesn't work properly because webgl suddenly renders
		//everything instanced and assumes a divisor of 1 for the normals
		let normalLoc = gl.getAttribLocation(phongShader, 'a_normal')
	    gl.vertexAttribDivisor(normalLoc, 0);
		let texLoc = gl.getAttribLocation(phongShader, 'a_texCoord')
	    gl.vertexAttribDivisor(texLoc, 0);
	}
}
//
// class ParticleSystem {
// 	constructor() {
// 		this.emitter = [];
// 		this.vorteces = [];
// 		this.maxVorteces = 10;
// 		for(var i = 0; i < this.maxVorteces; i++) this.vorteces[i] = new Vortex(zero, zero, 0, zero, 10);
// 		this.lastUsedVortex = 0;
// 		this.numConstantVorteces = 0;
// 		this.turbulence = false;
// 	}
//
//
// 	addEmitter(emitter) {
// 		this.emitter.push(emitter);
// 	}
//
// 	update() {
// 		if(this.turbulence) {
// 			for(let i = this.numConstantVorteces; i < 2; i++) {
// 				if(! this.vorteces[i].isAlive()) {
// 					let rand = Math.random()*this.emitter.length;
// 					let emitter = this.emitter[Math.floor(rand)];
// 					let angular = [Math.random()*0.001, Math.random()*0.001, Math.random()*0.001];
// 					this.vorteces[i].spawn(vec3.add([], [0,5,0],emitter.emitterPos), [0,0.01,0], 10000, zero, 0.000000001);
// 				}
// 				this.vorteces[i].update();
// 			}
// 		}
//
//
// 		this.emitter.forEach(function(element) {
// 			element.update();
// 		})
// 	}
//
// 	render(viewMatrix, sceneMatrix, projectionMatrix) {
// 		var that = this;
// 		gl.useProgram(particleShader.program);
//
// 		var pos = [];
// 		var ang = [];
// 		var fac = [];
//
// 		let i = 0;
// 		this.vorteces.forEach(function(vortex) {
// 			Array.prototype.push.apply(pos, vortex.pos); //glsl needs arrays to be flattened, merge arrays without creating new object
// 			Array.prototype.push.apply(ang, vortex.angularVel);
// 			fac.push(vortex.factor);
// 		})
// 		gl.uniform3fv(particleShader.vortexPosLocation, pos);
// 		gl.uniform3fv(particleShader.angularVelLocation, ang);
// 		gl.uniform1fv(particleShader.vortexFactorLocation, fac);
// 		this.emitter.forEach(function(element) {
// 			element.render(viewMatrix, sceneMatrix, projectionMatrix);
// 		})
// 	}
//
// 	setConstantVortex(pos, angularVel, size) {
// 		if(this.numConstantVorteces >= 10) return;	//all slots full
// 		this.vorteces[this.numConstantVorteces].spawnConstant(pos, angularVel, size);
// 		this.numConstantVorteces++;
// 	}
//
// 	enableTurbulence() {
// 		this.turbulence = true;
// 	}
//
// 	disableTurbulence() {
// 		this.turbulence = false;
// 	}
// }
//
// class Vortex {
// 	constructor(pos, angularVel, lifeTime, vel, size) {
// 		this.pos = vec3.copy([], pos);
// 		this.angularVel = vec3.copy([], angularVel);
// 		this.lifeTime = lifeTime;
// 		this.time = 0;
// 		this.vel = vec3.copy([], vel);
// 		this.size = size;
// 		this.factor = 0;
// 		this.isConstant = false;
// 	}
//
// 	spawn(pos, angularVel, lifeTime, vel, size) {
// 		vec3.copy(this.pos, pos);
// 		vec3.copy(this.angularVel, angularVel);
// 		this.lifeTime = lifeTime;
// 		this.time = 0;
// 		vec3.copy(this.vel, vel);
// 		vec3.copy(this.size, size);
// 		this.factor = 0;
// 	}
//
// 	spawnConstant(pos, angularVel, size) {
// 		vec3.copy(this.pos, pos);
// 		vec3.copy(this.angularVel, angularVel);
// 		this.time = 0;
// 		this.size = size;
// 		this.factor = 0.5*0.5*60*size;
// 		this.isConstant = true;
// 	}
//
// 	kill() {
// 		this.isConstant = false;
// 		this.time = 0;
// 		this.lifeTime = 0;
// 	}
// 	update() {
// 		if(this.isConstant) {
// 			return;
// 		}
// 		//smoothly transition vortexLifeTime
// 		if(this.isAlive()) {
// 			this.time += timer.delta;
// 			if(! this.isAlive()) {
// 				vec3.copy(this.angularVel, zero);
// 				this.lifeTime = 0;
// 				this.time = 0;
// 				this.factor = 0;
// 				vec3.copy(this.vel, zero);
// 			} else {
// 				var fac = this.time/this.lifeTime;
// 				this.factor = (1-fac)*fac*60*this.size;
// 				vec3.add(this.pos, this.pos, vec3.lerp([], zero, this.vel, this.time/this.lifeTime));
// 			}
// 		}
// 	}
//
// 	isAlive() {
// 		if(this.isConstant) return true;
// 		return this.time < this.lifeTime;
// 	}
//
//
// }

/**
Abstract base class implementing a particle emitter.
Classes that inherit from this must implement the functions:
 - updateParticle(particle)
 - createParticle(particle)

 Parameters:
 	-emitterPos: Location of emitter in world coordinates
	-partsPerSec: rate at which particles should be emitted in millisecond
	-maxLifeTime: maximum lifetime a particle can have
	-mass: mass of particle in kg
	-direction: direction that particles should move towards in general (applied to all particles)
	-particleSize: relative size of particle compared to unit quad
	-fuzziness: the degree of randomness (usage depends on emitter implementation)
	-startColor: color the particle has when spawned
	- finalColor: color particle has when lifetime ends

 TODO:
 	-add alpha blending (particles probably need to be sorted)
	-add textures
	-OPTIONAL: encode data in texture instead of individual buffers
**/
class Emitter {

	constructor(emitterPos, partsPerSec, maxLifeTime, mass, direction,
	particleSize, fuzziness, startColor, finalColor, particleProto, timeScaling) {

	    this.quadVertices = new Float32Array([
	      -0.5*particleSize, -0.5*particleSize, 0.0,
	      0.5*particleSize, -0.5*particleSize, 0.0,
	      -0.5*particleSize, 0.5*particleSize, 0.0,
	      0.5*particleSize, 0.5*particleSize, 0.0]);

		//set max size of the particlebuffer
	    this.maxNumPart = 10*partsPerSec*maxLifeTime/1000;

		this.emitterPos = emitterPos;
	    this.partsPerSec = partsPerSec;
		this.maxLifeTime = maxLifeTime;
		this.mass = mass;
		this.direction = direction;
		this.fuzziness = fuzziness;
		this.quadColors = startColor;
		this.finalColors = finalColor;
		this.dampening = 0.1;
		this.timeScaling = timeScaling;

		this.startForce = [0,0,0];
		this.forceToApply = [0,0,0];
		this.endForce = [0,0,0];
		this.forceTransitionTime = 5000;	//transition force slowly
		this.forceStates = {apply:0, reverse:1, skip:2};
		this.forceState = this.forceStates.skip;
		this.forceTime = 0;
		this.forceEndTime = 0;

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
		for(var i = 0; i < this.maxNumPart; i++) {
			this.particleBuffer[i] = new particleProto.constructor(this);
		}

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

	update() {
        var partsToSpawn = this.partsPerSec*timer.delta/1000; //particles to spawn this fram
		var maxParts = this.partsPerSec*0.04;
		if(partsToSpawn > maxParts) {
			partsToSpawn = maxParts; //clamp to 25FPS
		}
		for(var i = 0; i < partsToSpawn; i++) { //cycle through buffer from last known position and spawn new particles
			this.createParticle(this.particleBuffer[this.lastusedParticle]); //use "abstract" create function

			this.lastusedParticle = (this.lastusedParticle+1)%this.maxNumPart;
        }
		let p = null;
		this.numParticles = 0;
        for(i = 0; i < this.maxNumPart; i++) { //set data for all particles
			p = this.particleBuffer[i];
			if(p.isAlive()) {	//check if particle is alive
				p.update();
	            if(p.isAlive()) { //check if particle still alive otherwise we don't update
					vec3.sub(this.camDir, this.particleBuffer[i].pos, camera.pos);
					p.camDistance = vec3.length(this.camDir);

					var rand = Math.random()*(this.fuzziness)+(1-this.fuzziness);

					// copy values to gpu buffers
					p.force = this.forceToApply;
					this.positions[this.numParticles*3] = p.pos[0];
					this.positions[this.numParticles*3+1] = p.pos[1];
					this.positions[this.numParticles*3+2] = p.pos[2];
					this.velocitys[this.numParticles*3] = p.velocity[0];
					this.velocitys[this.numParticles*3+1] = p.velocity[1];
					this.velocitys[this.numParticles*3+2] = p.velocity[2];
					this.partTimes[this.numParticles] = p.time;
					this.lifeTimes[this.numParticles] = p.lifeTime;
					this.forces[this.numParticles*3] = p.force[0];
					this.forces[this.numParticles*3+1] = p.force[1];
					this.forces[this.numParticles*3+2] = p.force[2];
					this.numParticles++;
	            } else {
					p.camDistance = -1; //TODO:if particle is dead make sure its at the end of the buffer after sorting
				}
			}
        }

		//smoothly transition the force
		switch(this.forceState) {
			case this.forceStates.apply: {
				this.forceTime += timer.delta;
				if(this.forceTime >= this.forceEndTime) {
					this.forceTime = 0;
					this.forceState = this.forceStates.reverse;
				} else {
					if(this.forceTime <= this.forceTransitionTime) {
						vec3.lerp(this.forceToApply, this.startForce, this.endForce,  this.forceTime/this.forceTransitionTime);
					}
				}
			} break;
			case this.forceStates.reverse: {
				this.forceTime += timer.delta;
				if(this.forceTime >= this.forceTransitionTime) {
					vec3.copy(this.startForce, zero);
					this.forceState = this.forceStates.skip;
				} else {
					vec3.lerp(this.forceToApply, this.endForce, zero, this.forceTime/this.forceTransitionTime);
				}
			} break;
		}


		this.numParticles = this.numParticles == 0 ? 0 : this.numParticles-1;

		//set buffer data
		setDynamicArrayBufferData(this.timesBuffer, this.partTimes);
		setDynamicArrayBufferData(this.posbuffer, this.positions);
		setDynamicArrayBufferData(this.velocitysBuffer, this.velocitys);
		setDynamicArrayBufferData(this.lifeTimesBuffer, this.lifeTimes);
		setDynamicArrayBufferData(this.forcesBuffer, this.forces);
	}

	reset(){
		for(var i = 0; i < this.maxNumPart; i++) this.particleBuffer[i].reset();
		this.lastusedParticle = 0;
	}

	applyForce(force, time) {
		vec3.copy(this.startForce, this.forceToApply);
		this.forceTime = 0;
		vec3.copy(this.endForce, force);
		this.forceEndTime = time + 0.00001;
		this.forceState = this.forceStates.apply;
	}

}


/**
Implementation of a particle emitter
Emits Particles origining on a plane and sends them towards direction
 Additional Parameters:
 	-planeX: local x-coordinate
	-planeZ: local z-coordinate
**/
class PlaneEmitter extends Emitter {
	constructor(emitterPos = [0,0,0], partsPerSec, maxLifeTime, mass=1,
	direction=[0,0,0], particleSize=0.01, fuzziness=0, startColor, finalColor, particleProto, timeScaling, planeX=[1,0,0], planeZ=[0,0,1]) {

		super(emitterPos, partsPerSec, maxLifeTime, mass, direction,
			particleSize, fuzziness, startColor, finalColor, particleProto, timeScaling);

		//local plane coordinate system
	    this.planeX = planeX;
	    this.planeZ = planeZ;
		this.planeWidth = vec3.distance(this.emitterPos, vec3.add([], this.emitterPos, vec3.add([], this.planeX, this.planeZ))); //just for caching the value
		this.planePos = [];
		this.localX = [];
		this.localZ = [];
	}
	createParticle(particle) {
        var rand1 = Math.random();
        var rand2 = Math.random();
		this.planePos[0] = 0;
		this.planePos[1] = 0;
		this.planePos[2] = 0;
        vec3.add(this.planePos, this.planePos, this.emitterPos);
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
Additional Parameters:
	-radius: radius of sphere
**/
class SphereEmitter extends Emitter {
	constructor(emitterPos = [0,0,0], partsPerSec, maxLifeTime, mass=1,
	direction=[0,0,0], particleSize=0.01, fuzziness=0, startColor, finalColor, particleProto, timeScaling, radius, impulse = 0) {

		super(emitterPos, partsPerSec, maxLifeTime, mass, direction,
			particleSize, fuzziness, startColor, finalColor, particleProto, timeScaling);
		this.radius = radius;
		this.impulse = impulse;

		this.pos = [0, 0, 0];
		this.xyz = [0, 0, 0];
		this.velocity = [0, 0, 0];
	}

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
		vec3.scale(this.velocity,  this.xyz, this.impulse);
		particle.spawn(this.pos, this.velocity);
	}

}

class CircleEmitter extends PlaneEmitter {
	constructor(emitterPos = [0,0,0], partsPerSec, maxLifeTime, mass=1,
	direction=[0,0,0], particleSize=0.01, fuzziness=0, startColor, finalColor,
	particleProto, timeScaling, planeX=[1,0,0], planeZ=[0,0,1], radius, impulse = 0) {

		vec3.normalize(planeX, planeX);
		vec3.normalize(planeZ, planeZ);

		super(emitterPos, partsPerSec, maxLifeTime, mass,
		direction, particleSize, fuzziness, startColor,
		finalColor, particleProto, timeScaling, planeX, planeZ);

		this.radius = radius;
		this.impulse = impulse;

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
		//create random point on sphere
		this.x = (Math.random()*2-1);
		this.z = (Math.random()*2-1);
		this.normalizer = 1/Math.sqrt(this.x*this.x+this.z*this.z);
		this.x *= this.normalizer*this.radius;
		this.z *= this.normalizer*this.radius;


		vec3.scale(this.localX, this.planeX, this.x);
		vec3.scale(this.localZ, this.planeZ, this.z);
		vec3.add(this.circlePoint, this.localX, this.localZ);
		vec3.add(this.pos, this.emitterPos, this.circlePoint);
		vec3.scale(this.velocity,  this.circlePoint, this.impulse);
		particle.spawn(this.pos, this.velocity);
	}
}


//TODO: maybe prototypes are good enough
class Particle {
	constructor(emitter) {
		this.time = 0;
		this.pos = [0,0,0];
		this.velocity = [0,0,0];
		this.camDistance = -1;
		this.lifeTime = 0;
		this.force = [0,0,0];
		this.emitter = emitter;
	}
	spawn(pos, velocity) {
		this.time =this.emitter.maxLifeTime;
		vec3.copy(this.pos, pos);
		vec3.copy(this.velocity, velocity);
		this.camDistance = -1;
		this.lifeTime = this.emitter.maxLifeTime;
		vec3.copy(this.force, this.emitter.forceToApply);
	}

	reset() {
		this.time = 0;
		this.pos = [0,0,0];
		this.velocity = [0,0,0];
		this.camDistance = -1;
		this.lifeTime = 0;
		this.force = [0,0,0];
	}

	update() {
		this.time -= timer.delta;
	}

	isAlive() {
		return this.time > 0;
	}
}

class SmokeParticle extends Particle {
	constructor(emitter) {
		super(emitter)
	}

	spawn(pos, velocity) {
		super.spawn(pos, velocity);
		this.lifeTime = this.emitter.maxLifeTime*(Math.random()*this.emitter.fuzziness+(1-this.emitter.fuzziness));
	}
}

class FireParticle extends Particle {
	constructor(emitter) {
		super(emitter);
	}

	spawn(pos, velocity) {
		vec3.copy(this.pos, pos);
		vec3.copy(this.velocity, velocity);
		this.camDistance = -1;
		vec3.copy(this.force, this.emitter.forceToApply);
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

var ps = {
	createSnowEmitter: function(pos, length, width, maxLifeTime) {
		return new PlaneEmitter(pos, 200, maxLifeTime, 0.03, [0.0,-3.5,0], 0.07,
	        0.01, [1,1,1,1], [1, 1, 1, 1], new FuzzyParticle(null), 0, [length,0,0], [0,0,width]);
	}
}
