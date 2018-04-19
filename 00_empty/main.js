//the OpenGL context
var gl = null;
//our shader program
var shaderProgram1 = null;
var shaderProgram2 = null;
var shaderProgram3 = null;

var canvasWidth = 1300;
var canvasHeight = 650;
var aspectRatio = canvasWidth / canvasHeight;

var ext;
//camera and projection settings
var camera = {pos:[-10, 0, 0], front:[10, 0, 0], up:[0, 1, 0], pitch:null, yaw:null,
    cameraSpeed: 0.05, movingForward:false, movingBackward:false,
    movingLeft:false, movingRight:false, deltaX:0, deltaY:0,
    animatedAngle:0, fov:glMatrix.toRadian(30),
    update: function(){
        var sensitivity = 0.005;
        //translation
        if(this.movingForward) {
            vec3.add(this.pos, this.pos, vec3.scale([], this.front, timer.delta*sensitivity));
        } else if(this.movingBackward) {
            vec3.add(this.pos, this.pos, vec3.scale([], this.front, -timer.delta*sensitivity));
        }

        if(this.movingLeft) {
            vec3.add(this.pos, this.pos, vec3.scale([], vec3.cross([], this.up, this.front), timer.delta*sensitivity));
        } else if(this.movingRight) {
            vec3.add(this.pos, this.pos, vec3.scale([], vec3.cross([], this.front, this.up), timer.delta*sensitivity));
        }

        //rotation
        this.yaw += timer.delta*this.deltaX*sensitivity/10.0;
        this.pitch -= timer.delta*this.deltaY*sensitivity/10.0;
        var limit = glMatrix.toRadian(89.0);
        if(this.pitch > limit)
            this.pitch =  limit;
        if(this.pitch < -limit)
            this.pitch = -limit;

        this.front[0] = Math.cos(this.pitch) * Math.cos(this.yaw);
        this.front[1] = Math.sin(this.pitch);
        this.front[2] = Math.cos(this.pitch) * Math.sin(this.yaw);
        vec3.normalize(this.front, this.front);
        this.deltaX = 0;
        this.deltaY = 0;
    },
	lookAt: function(point) {
		this.deltaX = 0;
		this.deltaY = 0;	//don't rotate because of mouse movement
        var direction = vec3.subtract([], point, this.pos);
		vec3.normalize(direction, direction);
		this.pitch = Math.asin(direction[1]);
		this.yaw = Math.atan2(direction[2], direction[0]);
	},
    zoom: function(offSet) {
        this.fov += offSet*0.01;
        if(this.fov < glMatrix.toRadian(1)) {
            this.fov = glMatrix.toRadian(1);
        } else if(this.fov > glMatrix.toRadian(70)) {
            this.fov = glMatrix.toRadian(70);
        }
    },
    reset: function() {
        this.pos = [-10, 0, 0];
        this.up = [0, 1, 0];
        this.lookAt(vec3.negate(this.front, this.pos));
    }
};

var timer = {elapsed: 0, delta:0, offSet:0, prev:0, absolute:0,
            reset: function() {
                this.offSet = this.absolute;
                this.elapsed = 0;
                this.delta = 0;
            },
            advance: function(timeInMilliseconds) {
                if(isNaN(timeInMilliseconds)) return;
                this.absolute = timeInMilliseconds;
                this.prev = this.elapsed;
                this.elapsed = timeInMilliseconds - this.offSet;
                this.delta = this.elapsed - this.prev;
            }
}

//links to buffer stored on the GPU
var quadVertexBuffer, quadColorBuffer, quadPosBuffer;
var cubeVertexBuffer, cubeColorBuffer, cubeIndexBuffer;
var houseVertexBuffer, houseIndexBuffer;

var maxPart = 100;
var particlesCount = 1;

var s = 0.3; //size of cube
var cubeVertices = new Float32Array([
   -s,-s,-s, s,-s,-s, s, s,-s, -s, s,-s,
   -s,-s, s, s,-s, s, s, s, s, -s, s, s,
   -s,-s,-s, -s, s,-s, -s, s, s, -s,-s, s,
   s,-s,-s, s, s,-s, s, s, s, s,-s, s,
   -s,-s,-s, -s,-s, s, s,-s, s, s,-s,-s,
   -s, s,-s, -s, s, s, s, s, s, s, s,-s,
]);

var cubeColors = new Float32Array([
   0,1,1, 0,1,1, 0,1,1, 0,1,1,
   1,0,1, 1,0,1, 1,0,1, 1,0,1,
   1,0,0, 1,0,0, 1,0,0, 1,0,0,
   0,0,1, 0,0,1, 0,0,1, 0,0,1,
   1,1,0, 1,1,0, 1,1,0, 1,1,0,
   0,1,0, 0,1,0, 0,1,0, 0,1,0
]);

var cubeIndices =  new Float32Array([
   0,1,2, 0,2,3,
   4,5,6, 4,6,7,
   8,9,10, 8,10,11,
   12,13,14, 12,14,15,
   16,17,18, 16,18,19,
   20,21,22, 20,22,23
]);

var house;
var testEmitter;
//handle mouse input
document.addEventListener("mousemove", function(event){
    if(! event.shiftKey) return;
    camera.deltaX = event.movementX;
    camera.deltaY = event.movementY;
});

document.addEventListener("keypress", function(event) {
    switch(event.key) {
        case "W":
        case "w": {
            camera.movingForward = true;
            camera.movingBackward = false;
        } break;
        case "S":
        case "s": {
            camera.movingBackward = true;
            camera.movingForward = false;
        } break;
        case "A":
        case "a": {
            camera.movingLeft = true;
            camera.movingRight = false;
        } break;
        case "D":
        case "d": {
            camera.movingRight = true;
            camera.movingLeft = false;
        } break;
        case "R":
        case "r": {
            camera.lookAt([0,0,0]);
        }break;
        case "T":
        case "t": {
            reset();
        } break;
    }
});

document.addEventListener("keyup", function(event) {
    switch(event.key) {
        case "W":
        case "w": {
            camera.movingForward = false;
        } break;
        case "S":
        case "s": {
            camera.movingBackward = false;
        } break;
        case "A":
        case "a": {
            camera.movingLeft = false;
        } break;
        case "D":
        case "d": {
            camera.movingRight = false;
        } break;

    }
});

document.addEventListener("wheel", function(event) {
    camera.zoom(event.deltaY);
})

/**
 * initializes OpenGL context, compile shader, and load buffers
 */
function init(resources) {
    //create a GL context
    gl = createContext(canvasWidth, canvasHeight);

    ext = gl.getExtension("ANGLE_instanced_arrays");
    //in WebGL / OpenGL3 we have to create and use our own shaders for the programmable pipeline
    //create the shader program
    shaderProgram1 = new ShaderProgram(resources.vs1, resources.fs);
    shaderProgram2 = new ShaderProgram(resources.vs2, resources.fs);
    shaderProgram3 = new ShaderProgram(resources.vs3, resources.fs2);

    //same for color
    shaderProgram1.colorLocation = gl.getAttribLocation(shaderProgram1.program, "a_color");

    shaderProgram3.colorLocation = gl.getAttribLocation(shaderProgram3.program, "a_color");
    shaderProgram3.centerLocation = gl.getAttribLocation(shaderProgram3.program, "a_centerPos");
    shaderProgram3.timeLocation = gl.getAttribLocation(shaderProgram3.program, "a_time");
    shaderProgram3.directionLocation = gl.getUniformLocation(shaderProgram3.program, "u_generalDirection");
    shaderProgram3.lifeTimeLocation = gl.getUniformLocation(shaderProgram3.program, "u_lifeTime");
    shaderProgram3.massLocation = gl.getUniformLocation(shaderProgram3.program, "u_mass");
    shaderProgram3.accelerationLocation = gl.getAttribLocation(shaderProgram3.program, "a_acceleration");
    shaderProgram3.initVelLocation = gl.getAttribLocation(shaderProgram3.program, "a_initVel");

    initCubeBuffer();
    house = resources.house;
    initHouseBuffer();

    testEmitter = new Emitter([0,0,0], 10000, 0.0, [1,1,0]);
}


function initCubeBuffer() {

  cubeVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, cubeVertices, gl.STATIC_DRAW);

  cubeColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, cubeColors, gl.STATIC_DRAW);

  cubeIndexBuffer = gl.createBuffer ();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);
}

/**
 * render one frame
 */
function render(timeInMilliseconds) {

    timer.advance(timeInMilliseconds);

    //set background color to light gray
    gl.clearColor(0.9, 0.9, 0.9, 1.0);
    //clear the buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    //enable depth test to let objects in front occluse objects further away
    gl.enable(gl.DEPTH_TEST);

    //checkForWindowResize(gl);
    //aspectRatio = gl.canvasWidth / gl.canvasHeight;

    //activate this shader program
    gl.useProgram(shaderProgram1.program);

    var projectionMatrix = [];
    var sceneMatrix = [];
    var viewMatrix = [];
    mat4.identity(sceneMatrix);
    mat4.lookAt(viewMatrix, camera.pos, vec3.add([], camera.pos, camera.front), camera.up);
    mat4.perspective(projectionMatrix, camera.fov, aspectRatio, 1, 1000);
    camera.update();

    console.log(timer.delta);
    testEmitter.update();
    testEmitter.render(viewMatrix, sceneMatrix, projectionMatrix);
    gl.useProgram(shaderProgram2.program);
    shaderProgram2.setProjectionMat(projectionMatrix);
    renderHouse(mat4.identity([]), viewMatrix);

    gl.useProgram(shaderProgram1.program);
    shaderProgram1.setProjectionMat(projectionMatrix);
    // TASK 8-2
    renderRobot(sceneMatrix, viewMatrix);

    camera.animatedAngle = timer.elapsed/1000;
    //request another render call as soon as possible
    requestAnimationFrame(render);
}

function renderCube() {
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
  gl.drawElements(gl.TRIANGLES, cubeIndices.length, gl.UNSIGNED_SHORT, 0); //LINE_STRIP
}

var trans = 0;
var particlesCount = 1;
function renderRobot(sceneMatrix, viewMatrix) {

  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
  gl.vertexAttribPointer(shaderProgram1.positionLocation, 3, gl.FLOAT, false,0,0) ;
  gl.enableVertexAttribArray(shaderProgram1.positionLocation);

  gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorBuffer);
  gl.vertexAttribPointer(shaderProgram1.colorLocation, 3, gl.FLOAT, false,0,0) ;
  gl.enableVertexAttribArray(shaderProgram1.colorLocation);

  // TASK 10-2
  // store current sceneMatrix in originSceneMatrix, so it can be restored
  var originSceneMatrix = []
  mat4.rotate(originSceneMatrix, sceneMatrix, camera.animatedAngle*2, [0,1,0]);
  mat4.translate(originSceneMatrix, originSceneMatrix, [0.7,0.9,0]);

  shaderProgram1.setupModelView(viewMatrix, originSceneMatrix);
  renderCube(); // render body

  //right leg
  sceneMatrix = mat4.copy([], originSceneMatrix);
  sceneMatrix = mat4.scale(sceneMatrix, sceneMatrix, [0.1, 1, 1]);
  var t = mat4.copy([], sceneMatrix);
  sceneMatrix = mat4.translate(sceneMatrix, sceneMatrix, [-1.5, -0.6, 0]);
  shaderProgram1.setupModelView(viewMatrix, sceneMatrix);
  renderCube();
  //left leg
  sceneMatrix = mat4.translate(sceneMatrix, t, [1.5, -0.6, 0]);
  shaderProgram1.setupModelView(viewMatrix, sceneMatrix);
  renderCube();

  //head
  sceneMatrix = mat4.copy(sceneMatrix, originSceneMatrix);
  sceneMatrix = mat4.scale(sceneMatrix, sceneMatrix, [0.5, 0.3, 0.5]);
  sceneMatrix = mat4.translate(sceneMatrix, sceneMatrix, [0, 1.3, 0]);
  shaderProgram1.setupModelView(viewMatrix, sceneMatrix);
  renderCube();
}


//load the shader resources using a utility function
loadResources({
  vs1: 'shader/simple.vs.glsl',
  fs: 'shader/simple.fs.glsl',
  vs2: "shader/nocolorshader.vs.glsl",
  vs3: "shader/particleShader.vs.glsl",
  fs2: "shader/particleShader.fs.glsl",
  house: "./house.obj"
}).then(function (resources /*an object containing our keys with the loaded resources*/) {
  init(resources);

  //render one frame
  render();
});

function setUpModelViewMatrix(viewMatrix, sceneMatrix, modelViewLoc) {
  var modelViewMatrix = [];
  mat4.mul(modelViewMatrix, viewMatrix, sceneMatrix);
  gl.uniformMatrix4fv(modelViewLoc, false, modelViewMatrix);
}

function initHouseBuffer() {
    houseVertexBuffer = gl.createBuffer();
    houseVert = new Float32Array(house.position);
    gl.bindBuffer(gl.ARRAY_BUFFER, houseVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, houseVert, gl.STATIC_DRAW);

    houseIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, houseIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(house.index), gl.STATIC_DRAW);
}

function renderHouse(viewMatrix, originSceneMatrix) {
    var tempSceneMat = mat4.translate([], originSceneMatrix, [0, 2, 0]);
    tempSceneMat = mat4.scale(tempSceneMat, tempSceneMat, [0.2, 0.2, 0.2]);
    shaderProgram2.setupModelView(viewMatrix, tempSceneMat);
    gl.bindBuffer(gl.ARRAY_BUFFER, houseVertexBuffer);
    gl.vertexAttribPointer(shaderProgram2.positionLocation, 3, gl.FLOAT, false,0,0);
    gl.enableVertexAttribArray(shaderProgram2.positionLocation);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, houseIndexBuffer);
    gl.drawElements(gl.TRIANGLES, house.index.length, gl.UNSIGNED_SHORT, 0);
}

//create shader with uniforms for modelview and projection and attribute for vertexposition
function ShaderProgram(vs, fs) {
    this.program = createProgram(gl, vs, fs);

    this.modelViewLoc = gl.getUniformLocation(this.program, 'u_modelView');
    this.projectionLocation = gl.getUniformLocation(this.program, 'u_projection');
    this.positionLocation = gl.getAttribLocation(this.program, "a_position");

    this.setProjectionMat = function(projectionMatrix) {
        gl.uniformMatrix4fv(this.projectionLocation, false, projectionMatrix);
    };

    this.setupModelView = function(viewMatrix, sceneMatrix) {
        var modelViewMatrix = [];
        mat4.mul(modelViewMatrix, viewMatrix, sceneMatrix);
        gl.uniformMatrix4fv(this.modelViewLoc, false, modelViewMatrix);
    }
}

function reset() {
    timer.reset();
    camera.reset();
}

function Emitter(emitterPos, maxNumPart, mass, direction) {
    this.quadVertices = new Float32Array([
      -1.0, -1.0, 0.0,
      1.0, -1.0, 0.0,
      -1.0, 1.0, 0.0,
      -1.0, 1.0, 0.0,
      1.0, -1.0, 0.0,
      1.0, 1.0, 0.0]);
    this.quadColors = new Float32Array([
      1, 0.5, 0, 1,
      1, 0.5, 0, 1,
      1, 0.5, 0, 1,
      1, 0.5, 0, 1,
      1, 0.5, 0, 1,
      1, 0.5, 0, 1]);

    this.maxNumPart = maxNumPart;
    this.mass = mass;
    this.numPart = maxNumPart; //only for testing
    this.lifeParticles = 0;
    this.direction = direction;
    this.accel = new Float32Array([
        0.0,0.0,0.0
    ]);
    this.pos = new Float32Array(maxNumPart*4);
    this.time = new Float32Array(maxNumPart);

    for(i = 0; i < maxNumPart; i++) {
        this.pos[i*4] = 0.1 * (Math.random() < 0.5 ? i*Math.random() : -i*Math.random());
        this.pos[i*4+1] = 0.1 * (Math.random() < 0.5 ? i*Math.random() : -i*Math.random());
        this.pos[i*4+2] = 0;
        this.pos[i*4+3] = 0.05;
        this.time[i] = 0;
    }

    this.quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.quadVertices, gl.STATIC_DRAW);

    this.colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.quadColors, gl.STATIC_DRAW);

    this.accelBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.accelBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.accel, gl.STATIC_DRAW);

    this.timeBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.timeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.time, gl.DYNAMIC_DRAW);

    this.posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.pos, gl.STATIC_DRAW);

    this.update = function() {
        for(i = 0; i < this.numPart; i++) {
            this.time[i] += 0.001;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.timeBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.time), gl.DYNAMIC_DRAW);

    };

    this.render = function(viewMatrix, sceneMatrix, projectionMatrix) {
        // this.numPart = 10;
         gl.useProgram(shaderProgram3.program);
         gl.uniformMatrix4fv(shaderProgram3.projectionLocation, false, projectionMatrix);

        var tempSceneMat = []
        mat4.copy(tempSceneMat, sceneMatrix);
        // //TASK 2-2 and TASK 3 and TASK 4
        mat4.rotate(tempSceneMat, tempSceneMat, glMatrix.toRadian(90), [0, 1, 0]);
        //mat4.translate(tempSceneMat, tempSceneMat, [0.1*Math.sin(timer.elapsed/100), timer.elapsed/1000, 0]);
        mat4.scale(tempSceneMat, tempSceneMat, [0.1, 0.1, 0.1]);
        shaderProgram3.setupModelView(viewMatrix, tempSceneMat);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
        gl.vertexAttribPointer(shaderProgram3.positionLocation, 3, gl.FLOAT, false, 0, 0);
        ext.vertexAttribDivisorANGLE(shaderProgram3.positionLocation, 0);
        //enable this vertex attribute
        gl.enableVertexAttribArray(shaderProgram3.positionLocation);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
        gl.enableVertexAttribArray(shaderProgram3.centerLocation);
        gl.vertexAttribPointer(shaderProgram3.centerLocation, 4, gl.FLOAT, false, 0, 0);
        ext.vertexAttribDivisorANGLE(shaderProgram3.centerLocation, 1);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.vertexAttribPointer(shaderProgram3.colorLocation, 4, gl.FLOAT, false, 0, 0);
        ext.vertexAttribDivisorANGLE(shaderProgram3.colorLocation, 0);
        gl.enableVertexAttribArray(shaderProgram3.colorLocation);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.timeBuffer);
        gl.vertexAttribPointer(shaderProgram3.timeLocation, 1, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shaderProgram3.timeLocation);
        ext.vertexAttribDivisorANGLE(shaderProgram3.timeLocation, 1);

        // draw the bound data as 6 vertices = 2 triangles starting at index 0
        ext.drawArraysInstancedANGLE(gl.TRIANGLES, 0, 6, this.numPart);
        ext.vertexAttribDivisorANGLE(shaderProgram3.colorLocation, 0); // gotta do this --> SUPERSTRANGE
    }
}
