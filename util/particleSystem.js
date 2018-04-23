class ParticleSystem {
	constructor() {
		this.emitter = [];
		this.vorteces = [];
		for(var i = 0; i < 10; i++) this.vorteces[i] = new Vortex([0,0,0], [0,0,0], 0, [0,0,0], 0);
		this.maxVorteces = 2; //TEST!!
		this.lastUsedVortex = 0;
	}


	addEmitter(emitter) {
		this.emitter.push(emitter);
	}

	update() {
		// this.vorteces.forEach(function(vortex) {
		// 	if(! vortex.isAlive()) {
		// 		var rand1 = Math.random();
		// 		var rand2 = Math.random();
		// 		var rand3 = Math.random();
		// 		vortex.spawn([rand3*2-1, 1+(rand2*4-2), 5+(rand1*3-1.5)], [rand1*2-1, rand2*2-1, rand3*2-1], 5000*(rand2*0.1+0.9), [rand2/100, rand1/100, rand3/100], rand3);
		// 	}
		// })
		this.vorteces[9].spawnConstant([500,100,0], [10000,0,0], 1);
		this.emitter.forEach(function(element) {
			element.update();
		})
		this.vorteces.forEach(function(vortex) {
			vortex.update();
			// if(! vortex.isAlive()) vortex.spawn([0,0,0], [0,1000,0], 5000, [0,0,0], 1000);
		})
	}

	render(viewMatrix, sceneMatrix, projectionMatrix) {
		var that = this;
		gl.useProgram(shaderProgram3.program);

		var pos = [];
		var ang = [];
		var fac = [];


		this.vorteces.forEach(function(vortex) {
			Array.prototype.push.apply(pos, vortex.pos); //glsl needs arrays to be flattened, merge arrays without creating new object
			Array.prototype.push.apply(ang, vortex.angularVel);
			fac.push(vortex.factor);
		})
		gl.uniform3fv(shaderProgram3.vortexPosLocation, pos);
		gl.uniform3fv(shaderProgram3.angularVelLocation, ang);
		gl.uniform1fv(shaderProgram3.vortexFactorLocation, fac);
		this.emitter.forEach(function(element) {
			element.render(viewMatrix, sceneMatrix, projectionMatrix);
		})
	}
}

class Vortex {
	constructor(pos, angularVel, lifeTime, vel, size) {
		this.pos = pos;
		this.angularVel = angularVel;
		this.lifeTime = lifeTime;
		this.time = 0;
		this.vel = vel;
		this.size = size;
		this.factor = 0;
		this.isConstant = false;
	}

	spawn(pos, angularVel, lifeTime, vel, size) {
		this.pos = pos;
		this.angularVel = angularVel;
		this.lifeTime = lifeTime;
		this.time = 0;
		this.vel = vel;
		this.size = size;
		this.factor = 0;
	}

	spawnConstant(pos, angularVel, size) {
		this.pos = pos;
		this.angularVel = angularVel;
		this.time = 0;
		this.size = size;
		this.factor = 0.5*0.5*60/size;
		this.isConstant = true;
	}

	kill() {
		this.isconstant = false;
		this.time = 0;
		this.lifeTime = 0;
	}
	update() {
		if(this.isConstant) {
			return;
		}
		//smoothly transition vortexLifeTime
		if(this.isAlive()) {
			this.time += timer.delta;
			if(! this.isAlive) {
				this.angularVel = [0,0,0];
				this.lifeTime = 0;
				this.time = 0;
				this.factor = 0;
				this.vel = [0,0,0];
			} else {
				var fac = this.time/this.lifeTime;
				this.factor = (1-fac)*fac*60/this.size;
				vec3.add(this.pos, this.pos, vec3.scale([], this.vel, this.time/1000));
			}
		}
	}

	isAlive() {
		if(this.isConstant) return true;
		return this.time <= this.lifeTime;
	}

	reset() {
		this.emitter.forEach(function(emitter) {
			emitter.reset();
		})
	}

}

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
	particleSize, fuzziness, startColor, finalColor, particleProto) {

	    this.quadVertices = new Float32Array([
	      -0.5*particleSize, -0.5*particleSize, 0.0,
	      0.5*particleSize, -0.5*particleSize, 0.0,
	      -0.5*particleSize, 0.5*particleSize, 0.0,
	      0.5*particleSize, 0.5*particleSize, 0.0]);

		//set max size of the particlebuffer
	    this.maxNumPart = partsPerSec*maxLifeTime/1000;

		this.emitterPos = emitterPos;
	    this.partsPerSec = partsPerSec;
		this.maxLifeTime = maxLifeTime;
		this.mass = mass;
		this.direction = direction;
		this.fuzziness = fuzziness;
		this.quadColors = startColor;
		this.finalColors = finalColor;
		this.dampening = 0.1;

		this.startForce = [0,0,0];
		this.forceToApply = [0,0,0];
		this.endForce = [0,0,0];
		this.forceTransitionTime = 5000;	//transition force slowly
		this.forceStates = {apply:0, reverse:1, skip:2};
		this.forceState = this.forceStates.skip;
		this.forceTime = 0;
		this.forceEndTime = 0;

		//local buffers
	    this.positions = [];
	    this.partTimes = [];
		this.velocitys = [];
		this.lifeTimes = [];
		this.particleBuffer = [];
		this.forces=[];

		//local state variables
	    this.numPart = 0;
		this.lastusedParticle = 0;
		for(var i = 0; i < this.maxNumPart; i++) {
			this.particleBuffer[i] = new particleProto.constructor(this);
		}
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

		this.numParticles = 0;
        for(i = 0; i < this.maxNumPart; i++) { //set data for all particles
			var p = this.particleBuffer[i];
			if(p.isAlive()) {	//check if particle is alive
				p.update();
	            if(p.isAlive()) { //check if particle still alive otherwise we don't update
					p.camDistance = vec3.length(vec3.sub([], this.particleBuffer[i].pos, camera.pos)); //TODO: needed for sorting

					var rand = Math.random()*(this.fuzziness)+(1-this.fuzziness);

					//copy values to gpu buffers
					p.force = this.forceToApply;
					this.positions[i*3] = p.pos[0];
					this.positions[i*3+1] = p.pos[1];
					this.positions[i*3+2] = p.pos[2];
					this.velocitys[i*3] = p.velocity[0];
					this.velocitys[i*3+1] = p.velocity[1];
					this.velocitys[i*3+2] = p.velocity[2];
					this.partTimes[i] = p.time;
					this.lifeTimes[i] = p.lifeTime;
					this.forces[i*3] = p.force[0];
					this.forces[i*3+1] = p.force[1];
					this.forces[i*3+2] = p.force[2];
	            } else {
					p.camDistance = -1; //TODO:if particle is dead make sure its at the end of the buffer after sorting
				}
				this.numParticles++;
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
					this.startForce = [0,0,0];
					this.forceState = this.forceStates.skip;
				} else {
					vec3.lerp(this.forceToApply, this.endForce, [0,0,0], this.forceTime/this.forceTransitionTime);
				}
			} break;
		}


		this.numParticles = this.numParticles == 0 ? 0 : this.numParticles-1;

		//set buffer data
		setDynamicArrayBufferData(this.timesBuffer, new Float32Array(this.partTimes.slice(0,this.numParticles)));
		setDynamicArrayBufferData(this.posbuffer, new Float32Array(this.positions.slice(0, this.numParticles*3)));
		setDynamicArrayBufferData(this.velocitysBuffer, new Float32Array(this.velocitys.slice(0, this.numParticles*3)));
		setDynamicArrayBufferData(this.lifeTimesBuffer, new Float32Array(this.lifeTimes.slice(0, this.numParticles)));
		setDynamicArrayBufferData(this.forcesBuffer, new Float32Array(this.forces.slice(0, this.numParticles*3)));
	}

    render(viewMatrix, sceneMatrix, projectionMatrix) {
        gl.useProgram(shaderProgram3.program); //shaderProgram3 is the particle shaderprogram

		//set uniforms
        gl.uniformMatrix4fv(shaderProgram3.projectionLocation, false, projectionMatrix);
        gl.uniform1f(shaderProgram3.massLocation, this.mass);
        gl.uniform4fv(shaderProgram3.colorLocation, this.quadColors);
        gl.uniform4fv(shaderProgram3.finalColorLocation, this.finalColors);
        gl.uniform3fv(shaderProgram3.generalDirLocation, this.direction);
		gl.uniform1f(shaderProgram3.dampeningLocation, this.dampening);

		var camRight = vec3.cross([], camera.direction, camera.up);
		gl.uniform3fv(shaderProgram3.camRightLocation, camRight);

        var tempSceneMat = [];	//don't overwrite parameter scenebuffer
        mat4.copy(tempSceneMat, sceneMatrix);
        shaderProgram3.setupModelView(viewMatrix, tempSceneMat);


        setArrayBufferFloat(this.quadBuffer, shaderProgram3.positionLoc, 3); //render all vertices per instance

		//apply these v
		setArrayBufferFloatInstanced(this.posbuffer, shaderProgram3.centerLocation, 3, 1);
        setArrayBufferFloatInstanced(this.timesBuffer, shaderProgram3.timeLocation, 1, 1);
		setArrayBufferFloatInstanced(this.velocitysBuffer, shaderProgram3.velocityLocation, 3, 1);
		setArrayBufferFloatInstanced(this.lifeTimesBuffer, shaderProgram3.lifeTimeLocation, 1, 1);
		setArrayBufferFloatInstanced(this.forcesBuffer, shaderProgram3.forceLocation, 3, 1);

        ext.drawArraysInstancedANGLE(gl.TRIANGLE_STRIP, 0, 4, this.numParticles);
    }

	reset(){
		for(var i = 0; i < this.maxNumPart; i++) this.particleBuffer[i].reset();
		this.lastusedParticle = 0;
	}

	applyForce(force, time) {
		this.startForce = this.forceToApply;
		this.forceTime = 0;
		this.endForce = force;
		this.forceEndTime = time + 0.00001;
		this.forceState = this.forceStates.apply;
	}

	spawnVortex(pos, angularVel, size, time) {
		this.vortexPos = pos;
		this.angularVel = angularVel;
		this.vortexSize = size;
		this.vortexTime = 0;
		this.vortexLifeTime = time; //prevent 0 division
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
	direction=[0,0,0], particleSize=0.01, fuzziness=0, startColor, finalColor, particleProto, planeX=[1,0,0], planeZ=[0,0,1]) {

		super(emitterPos, partsPerSec, maxLifeTime, mass, direction,
			particleSize, fuzziness, startColor, finalColor, particleProto);

		//local plane coordinate system
	    this.planeX = planeX;
	    this.planeZ = planeZ;
		this.planeWidth = vec3.length(this.planeX); //just for caching the value
	}
	createParticle(particle) {
        var rand1 = Math.random();
        var rand2 = Math.random();
        var rand3 = Math.random();

        var planePos = []; //spawn particle at random position on plane
        vec3.add(planePos, this.emitterPos,
            vec3.add([], vec3.scale([], this.planeX,(rand1*2-1)),
            vec3.scale([], this.planeZ, (rand2*2-1))));

		particle.spawn(planePos, [0,0,0]);
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
	direction=[0,0,0], particleSize=0.01, fuzziness=0, startColor, finalColor, particleProto, radius, impulse = 0) {

		super(emitterPos, partsPerSec, maxLifeTime, mass, direction,
			particleSize, fuzziness, startColor, finalColor, particleProto);
		this.radius = radius;
		this.impulse = impulse;
	}

	createParticle(particle) {

		//create random point on sphere
		var x = (Math.random()*2-1);
		var y = (Math.random()*2-1);
		var z = (Math.random()*2-1);
		var normalizer = 1/Math.sqrt(x*x+y*y+z*z);
		x *= normalizer*this.radius;
		y *= normalizer*this.radius;
		z *= normalizer*this.radius;

		var pos = vec3.add([], this.emitterPos, [x,y,z]);
		var velocity = vec3.scale([],  [x,y,z], this.impulse);
		particle.spawn(pos, velocity);
	}

}

class CircleEmitter extends PlaneEmitter {
	constructor(emitterPos = [0,0,0], partsPerSec, maxLifeTime, mass=1,
	direction=[0,0,0], particleSize=0.01, fuzziness=0, startColor, finalColor,
	particleProto, planeX=[1,0,0], planeZ=[0,0,1], radius, impulse = 0) {

		vec3.normalize(planeX, planeX);
		vec3.normalize(planeZ, planeZ);

		super(emitterPos, partsPerSec, maxLifeTime, mass,
		direction, particleSize, fuzziness, startColor,
		finalColor, particleProto, planeX, planeZ);

		this.radius = radius;
		this.impulse = impulse;

	}

	//create random point on circle
	createParticle(particle) {
		//create random point on sphere
		var x = (Math.random()*2-1);
		var z = (Math.random()*2-1);
		var normalizer = 1/Math.sqrt(x*x+z*z);
		x *= normalizer*this.radius;
		z *= normalizer*this.radius;

		var localX = vec3.scale([], this.planeX, x);
		var localZ = vec3.scale([], this.planeZ, z);
		var circlePoint = vec3.add([], localX, localZ);
		var pos = vec3.add([], this.emitterPos, circlePoint);
		var velocity = vec3.scale([],  circlePoint, this.impulse);
		particle.spawn(pos, velocity);
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
		this.pos = pos;
		this.velocity = velocity;
		this.camDistance = -1;
		this.lifeTime = this.emitter.maxLifeTime;
		this.force = this.emitter.forceToApply;
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
		this.pos = pos;
		this.velocity = velocity;
		this.camDistance = -1;
		this.force = this.emitter.forceToApply;
		if(this.emitter.planeWidth) { //if a planeemitter is used, lifetime of particle depends on distance from origin
			var centerDistance = vec3.distance(this.emitter.emitterPos, this.pos);
			this.lifeTime = this.emitter.maxLifeTime*(1-centerDistance/this.emitter.planeWidth);
			this.time = this.lifeTime;
		} else {
			this.lifeTime = this.emitter.maxLifeTime;
			this.time = this.lifeTime;
		}
	}
}
