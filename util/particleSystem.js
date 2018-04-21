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
	-add billboarding
**/
class Emitter {

	constructor(emitterPos, partsPerSec, maxLifeTime, mass, direction,
	particleSize, fuzziness, startColor, finalColor) {

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

		//local buffers
	    this.positions = [];
	    this.partTimes = [];
		this.velocities = [];
		this.lifeTimes = [];
		this.particleBuffer = [];

		//local state variables
	    this.numPart = 0;
		this.lastusedParticle = 0;


		for(var i = 0; i < this.maxNumPart; i++) this.particleBuffer[i] = new Particle(0, [0,0,0], [0,0,0], -1, 0);

		//gpu buffers
	    this.quadBuffer = setupStaticArrayBuffer(this.quadVertices);
	    this.timesBuffer = gl.createBuffer();
	    this.posbuffer = gl.createBuffer();
		this.velocitiesBuffer = gl.createBuffer();
		this.lifeTimesBuffer = gl.createBuffer();
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
			if(p.time > 0) {	//check if particle is alive
				p.time -= timer.delta;
	            if(p.time > 0) { //check if particle still alive otherwise we don't update
					p.camDistance = vec3.length(vec3.sub([], this.particleBuffer[i].pos, camera.pos)); //TODO: needed for sorting
					this.updateParticle(p); //use "abstract" update function
	            } else {
					p.camDistance = -1; //TODO:if particle is dead make sure its at the end of the buffer after sorting
				}
				this.numParticles++;
			}
        }
		this.numParticles = this.numParticles == 0 ? 0 : this.numParticles-1;

		//set buffer data
		setDynamicArrayBufferData(this.timesBuffer, new Float32Array(this.partTimes.slice(0,this.numParticles)));
		setDynamicArrayBufferData(this.posbuffer, new Float32Array(this.positions.slice(0, this.numParticles*3)));
		setDynamicArrayBufferData(this.velocitiesBuffer, new Float32Array(this.velocities.slice(0, this.numParticles*3)));
		setDynamicArrayBufferData(this.lifeTimesBuffer, new Float32Array(this.lifeTimes.slice(0, this.numParticles)));
    }

    render(viewMatrix, sceneMatrix, projectionMatrix) {
        gl.useProgram(shaderProgram3.program); //shaderProgram3 is the particle shaderprogram

		//set uniforms
        gl.uniformMatrix4fv(shaderProgram3.projectionLocation, false, projectionMatrix);
        gl.uniform1f(shaderProgram3.massLocation, this.mass);
        gl.uniform4fv(shaderProgram3.colorLocation, this.quadColors);
        gl.uniform4fv(shaderProgram3.finalColorLocation, this.finalColors);
        gl.uniform3fv(shaderProgram3.generalDirLocation, this.direction);

		var camRight = vec3.cross([], camera.direction, camera.up);
		gl.uniform3fv(shaderProgram3.camRightLocation, camRight);

        var tempSceneMat = [];	//don't overwrite parameter scenebuffer
        mat4.copy(tempSceneMat, sceneMatrix);
        shaderProgram3.setupModelView(viewMatrix, tempSceneMat);


        setArrayBufferFloat(this.quadBuffer, shaderProgram3.positionLoc, 3); //render all vertices per instance

		//apply these v
		setArrayBufferFloatInstanced(this.posbuffer, shaderProgram3.centerLocation, 3, 1);
        setArrayBufferFloatInstanced(this.timesBuffer, shaderProgram3.timeLocation, 1, 1);
		setArrayBufferFloatInstanced(this.velocitiesBuffer, shaderProgram3.velocityLocation, 3, 1);
		setArrayBufferFloatInstanced(this.lifeTimesBuffer, shaderProgram3.lifeTimeLocation, 1, 1);

        ext.drawArraysInstancedANGLE(gl.TRIANGLE_STRIP, 0, 4, this.numParticles);
    }

	reset(){
		for(var i = 0; i < this.maxNumPart; i++) this.particleBuffer[i] = new Particle(0, [0,0,0], [0,0,0], -1, 0);
		this.lastusedParticle = 0;
	}
}

//TODO: maybe prototypes are good enough
//TODO: add normal vectors for billboarding
class Particle {
	constructor(time, pos, velocity, camDistance, lifeTime) {
		this.time = time;
		this.position = pos;
		this.velocitie = velocity;
		this.camDistance = camDistance;
		this.lifeTime = lifeTime;
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
	direction=[0,0,0], particleSize=0.01, fuzziness=0, startColor, finalColor, planeX=[1,0,0], planeZ=[0,0,1]) {

		super(emitterPos, partsPerSec, maxLifeTime, mass, direction,
			particleSize, fuzziness, startColor, finalColor);

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

		var centerDistance = vec3.distance(this.emitterPos, planePos);

		particle.lifeTime = this.maxLifeTime*(1-centerDistance/this.planeWidth);
		particle.time = particle.lifeTime;
		particle.pos = planePos;
		particle.velocity = [0,0,0];

	}

	updateParticle(particle) {
		var i = this.numParticles;
		var rand1 = Math.random();
		var rand2 = Math.random();
		var rand3 = Math.random();

		this.positions[i*3] = particle.pos[0];
		this.positions[i*3+1] = particle.pos[1];
		this.positions[i*3+2] = particle.pos[2];

		//add a bit of randomness to particle movement
		this.velocities[i*3] = particle.velocity[0]+(rand1*2-1)*this.fuzziness;
		this.velocities[i*3+1] = particle.velocity[1]+(rand2*2-1)*this.fuzziness;
		this.velocities[i*3+2] = particle.velocity[2]+(rand3*2-1)*this.fuzziness;
		this.partTimes[i] = particle.time;
		this.lifeTimes[this.numParticles] = particle.lifeTime;
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
	direction=[0,0,0], particleSize=0.01, fuzziness=0, startColor, finalColor, radius, impulse = 0) {

		super(emitterPos, partsPerSec, maxLifeTime, mass, direction,
			particleSize, fuzziness, startColor, finalColor);
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

		particle.pos = vec3.add([], this.emitterPos, [x,y,z]);
		particle.lifeTime = this.maxLifeTime*(Math.random()*0.2+0.8);
		particle.time = particle.lifeTime;
		particle.velocity = vec3.scale([], vec3.normalize([], vec3.sub([], [x,y,z], this.emitterPos)), this.impulse);
	}

	updateParticle(particle){
		var i = this.numParticles;

		this.positions[i*3] = particle.pos[0];
		this.positions[i*3+1] = particle.pos[1];
		this.positions[i*3+2] = particle.pos[2];
		this.velocities[i*3] = particle.velocity[0];
		this.velocities[i*3+1] = particle.velocity[1];
		this.velocities[i*3+2] = particle.velocity[2];
		this.partTimes[i] = particle.time;
		this.lifeTimes[i] = particle.lifeTime;
	}
}
