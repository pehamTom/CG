/**
Abstract base class implementing a particle emitter.
Classes that inherit from this must implement the functions:
 - updateParticle(particle)
 - createParticle(particle)
**/
function Emitter(emitterPos, partsPerSec, maxLifeTime, mass, direction,
	particleSize, fuzziness, startColor, finalColor) {

    this.quadVertices = new Float32Array([
      -1.0*particleSize, -1.0*particleSize, 0.0,
      1.0*particleSize, -1.0*particleSize, 0.0,
      -1.0*particleSize, 1.0*particleSize, 0.0,
      1.0*particleSize, 1.0*particleSize, 0.0]);

    this.quadColors = startColor;
    this.finalColors = finalColor;
    this.emitterPos = emitterPos;
    this.maxNumPart = partsPerSec*maxLifeTime/1000;
    this.mass = mass;
    this.maxLifeTime = maxLifeTime;
    this.direction = direction;
    this.partsPerSec = partsPerSec;
	this.fuzziness = fuzziness;
	//local buffers
    this.positions = [];
    this.partTimes = [];
	this.velocities = [];
	this.lifeTimes = [];
	this.particleBuffer = [];

    this.numPart = 0;
	this.lastusedParticle = 0;


	for(i = 0; i < this.maxNumPart; i++) this.particleBuffer[i] = new Particle(0, [0,0,0], [0,0,0], -1, 0);

	//gpu buffers
    this.quadBuffer = setupStaticArrayBuffer(this.quadVertices);
    this.timesBufferffer = gl.createBuffer();
    this.posbuffer = gl.createBuffer();
	this.velocitiesBuffer = gl.createBuffer();
	this.lifeTimesBuffer = gl.createBuffer();

    this.update = function() {
        var partsToSpawn = this.partsPerSec*timer.delta/1000;
		var maxParts = this.partsPerSec*0.04;
		if(partsToSpawn > maxParts) {
			partsToSpawn = maxParts; //clamp to 25FPS
		}
		for(i = 0; i < partsToSpawn; i++) {

            var j = this.lastusedParticle;

			this.createParticle(this.particleBuffer[j]);

            this.lastusedParticle = (this.lastusedParticle+1)%this.maxNumPart;
        }
		this.numParticles = 0;
        for(i = 0; i < this.maxNumPart; i++) {
			var p = this.particleBuffer[i];
			if(p.time > 0) {
				p.time -= timer.delta;
	            if(p.time > 0) {
					p.camDistance = vec3.length(vec3.sub([], this.particleBuffer[i].pos, camera.pos));
					this.updateParticle(p);

	            } else {
					p.camDistance = -1;
				}
				this.numParticles++;
			}
        }
		this.numParticles = this.numParticles == 0 ? 0 : this.numParticles-1;

		setDynamicArrayBufferData(this.timesBufferffer, new Float32Array(this.partTimes.slice(0,this.numParticles)));
		setDynamicArrayBufferData(this.posbuffer, new Float32Array(this.positions.slice(0, this.numParticles*3)));
		setDynamicArrayBufferData(this.velocitiesBuffer, new Float32Array(this.velocities.slice(0, this.numParticles*3)));
		setDynamicArrayBufferData(this.lifeTimesBuffer, new Float32Array(this.lifeTimes.slice(0, this.numParticles)));
    };

    this.render = function(viewMatrix, sceneMatrix, projectionMatrix) {
        gl.useProgram(shaderProgram3.program);
        gl.uniformMatrix4fv(shaderProgram3.projectionLocation, false, projectionMatrix);
        gl.uniform1f(shaderProgram3.massLocation, this.mass);
        gl.uniform4fv(shaderProgram3.colorLocation, this.quadColors);
        gl.uniform4fv(shaderProgram3.finalColorLocation, this.finalColors);
        gl.uniform3fv(shaderProgram3.generalDirLocation, this.direction);

        var tempSceneMat = []
        mat4.copy(tempSceneMat, sceneMatrix);
        mat4.rotate(tempSceneMat, tempSceneMat, glMatrix.toRadian(90), [0, 1, 0]);
        shaderProgram3.setupModelView(viewMatrix, tempSceneMat);

        setArrayBufferFloat(this.quadBuffer, shaderProgram3.positionLoc, 3);
        setArrayBufferFloatInstanced(this.posbuffer, shaderProgram3.centerLocation, 3, 1);
        setArrayBufferFloatInstanced(this.timesBufferffer, shaderProgram3.timeLocation, 1, 1);
		setArrayBufferFloatInstanced(this.velocitiesBuffer, shaderProgram3.velocityLocation, 3, 1);
		setArrayBufferFloatInstanced(this.lifeTimesBuffer, shaderProgram3.lifeTimeLocation, 1, 1);

        ext.drawArraysInstancedANGLE(gl.TRIANGLE_STRIP, 0, 4, this.numParticles);
    }
}

function Particle(time, pos, velocity, camDistance, lifeTime) {
	this.time = time;
	this.position = pos;
	this.velocitie = velocity;
	this.camDistance = camDistance;
	this.lifeTime = lifeTime;
}

/**
Implementation of a particle emitter
Emits Particles origining on a plane and sinds them towards direction
**/
function PlaneEmitter(emitterPos = [0,0,0], partsPerSec, maxLifeTime, mass=1,
	direction=[0,0,0], particleSize=0.01, fuzziness=0, startColor, finalColor, planeX=[1,0,0], planeZ=[0,0,1]) {

	Emitter.call(this, emitterPos, partsPerSec, maxLifeTime, mass, direction,
		particleSize, fuzziness, startColor, finalColor);


    this.planeX = planeX;
    this.planeZ = planeZ;
	this.planeWidth = vec3.length(this.planeX);
	this.createParticle = function(particle) {

        var rand1 = Math.random();
        var rand2 = Math.random();
        var rand3 = Math.random();
        var planeOffset = [];
        vec3.add(planeOffset, this.emitterPos,
            vec3.add([], vec3.scale([], this.planeX,(rand1*2-1)),
            vec3.scale([], this.planeZ, (rand2*2-1))));

		var centerDistance = vec3.distance(this.emitterPos, planeOffset); //color depends on distance from plane center
		particle.lifeTime = this.maxLifeTime*(1-centerDistance/this.planeWidth);
		particle.time = particle.lifeTime;
		particle.pos = planeOffset;
		particle.velocity = [0,0,0];

	};
	this.updateParticle = function(particle) {
		var i = this.numParticles;
		var rand1 = Math.random();
		var rand2 = Math.random();
		var rand3 = Math.random();
		this.positions[i*3] = particle.pos[0];
		this.positions[i*3+1] = particle.pos[1];
		this.positions[i*3+2] = particle.pos[2];
		this.velocities[i*3] = particle.velocity[0]+(rand1*2-1)*this.fuzziness;
		this.velocities[i*3+1] = particle.velocity[1]+(rand2*2-1)*this.fuzziness;
		this.velocities[i*3+2] = particle.velocity[2]+(rand3*2-1)*this.fuzziness;
		this.partTimes[i] = particle.time;
		this.lifeTimes[this.numParticles] = particle.lifeTime;
	}
}

function SphereEmitter(emitterPos = [0,0,0], partsPerSec, maxLifeTime, mass=1,
	direction=[0,0,0], particleSize=0.01, fuzziness=0, startColor, finalColor, radius) {

	Emitter.call(this, emitterPos, partsPerSec, maxLifeTime, mass, direction,
		particleSize, fuzziness, startColor, finalColor);
	this.radius = radius;

	this.createParticle = function(particle) {
		var x = (Math.random()*2-1);
		var y = (Math.random()*2-1);
		var z = (Math.random()*2-1);
		var normalizer = Math.sqrt(x*x+y*y+z*z);
		x *= this.radius;
		y *= this.radius;
		z *= this.radius;

		particle.pos = vec3.add([], this.emitterPos, [x,y,z]);
		particle.lifeTime = this.maxLifeTime*Math.random();
		particle.time = particle.lifeTime;
		particle.velocity = vec3.normalize([], vec3.sub([], [x,y,z], this.emitterPos));

	};

	this.updateParticle = function(particle){
		var i = this.numParticles;
		particle.velocity[0] += (Math.random()*2-1)*this.fuzziness
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
