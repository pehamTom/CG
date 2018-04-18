//the OpenGL context
var gl = null;
//our shader program
var shaderProgram = null;

var canvasWidth = 1300;
var canvasHeight = 650;
var aspectRatio = canvasWidth / canvasHeight;

var lastTime = 0;

//camera and projection settings
var camera = {pos:[-10, 0, 0], front:[10, 0, 0], up:[0, 1, 0], pitch:null, yaw:null,
    cameraSpeed: 0.05, movingForward:false, movingBackward:false,
    movingLeft:false, movingRight:false, deltaX:0, deltaY:0,
    animatedAngle:0, fov:glMatrix.toRadian(30),
    update: function(deltaTime){
        var sensitivity = 0.005;
        console.log(deltaTime);
        //translation
        if(this.movingForward) {
            vec3.add(this.pos, this.pos, vec3.scale([], this.front, deltaTime*sensitivity));
        } else if(this.movingBackward) {
            vec3.add(this.pos, this.pos, vec3.scale([], this.front, -deltaTime*sensitivity));
        }

        if(this.movingLeft) {
            vec3.add(this.pos, this.pos, vec3.scale([], vec3.cross([], this.up, this.front), deltaTime*sensitivity));
        } else if(this.movingRight) {
            vec3.add(this.pos, this.pos, vec3.scale([], vec3.cross([], this.front, this.up), deltaTime*sensitivity));
        }

        //rotation
        this.yaw += deltaTime*this.deltaX*sensitivity/10;
        this.pitch -= deltaTime*this.deltaY*sensitivity/10;
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
    }
};


var modelViewLocation;
var positionLocation;
var colorLocation;
var projectionLocation;

//links to buffer stored on the GPU
var quadVertexBuffer, quadColorBuffer;
var cubeVertexBuffer, cubeColorBuffer, cubeIndexBuffer;

var quadVertices = new Float32Array([
    -1.0, -1.0,
    1.0, -1.0,
    -1.0, 1.0,
    -1.0, 1.0,
    1.0, -1.0,
    1.0, 1.0]);

var quadColors = new Float32Array([
    1, 0, 0, 1,
    0, 1, 0, 1,
    0, 0, 1, 1,
    0, 0, 1, 1,
    0, 1, 0, 1,
    0, 0, 0, 1]);

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

    //in WebGL / OpenGL3 we have to create and use our own shaders for the programmable pipeline
    //create the shader program
    shaderProgram = createProgram(gl, resources.vs, resources.fs);

    modelViewLocation = gl.getUniformLocation(shaderProgram, 'u_modelView');
    projectionLocation = gl.getUniformLocation(shaderProgram, 'u_projection');

    //we are looking up the internal location after compilation of the shader program given the name of the attribute
    positionLocation = gl.getAttribLocation(shaderProgram, "a_position");
    //same for color
    colorLocation = gl.getAttribLocation(shaderProgram, "a_color");

    //set buffers for quad
    initQuadBuffer();

    // TASK 8-1 //set buffers for cube
    initCubeBuffer();
}

function initQuadBuffer() {

  //create buffer for vertices
  quadVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadVertexBuffer);
  //copy data to GPU
  gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);

  //same for the color
  quadColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, quadColors, gl.STATIC_DRAW);
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

    if(isNaN(timeInMilliseconds)) timeInMilliseconds = 0;

    var deltaTime = timeInMilliseconds-lastTime;
    lastTime = timeInMilliseconds;


    //set background color to light gray
    gl.clearColor(0.9, 0.9, 0.9, 1.0);
    //clear the buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    //enable depth test to let objects in front occluse objects further away
    gl.enable(gl.DEPTH_TEST);

    //checkForWindowResize(gl);
    //aspectRatio = gl.canvasWidth / gl.canvasHeight;

    //activate this shader program
    gl.useProgram(shaderProgram);

    var projectionMatrix = [];
    mat4.perspective(projectionMatrix, camera.fov, aspectRatio, 1, 1000);
    camera.update(deltaTime);
    // TASK 6

    //TASK 7
    // camera.pos[0] = Math.sin(timeInMilliseconds/1000) * 10.0;
    // camera.pos[2] = Math.cos(timeInMilliseconds/1000) * 10.0;


    gl.uniformMatrix4fv(projectionLocation, false, projectionMatrix);
    var sceneMatrix = [];
    var viewMatrix = [];
    mat4.identity(sceneMatrix);
    mat4.lookAt(viewMatrix, camera.pos, vec3.add([], camera.pos, camera.front), camera.up);
    setUpModelViewMatrix(viewMatrix, sceneMatrix);
    renderQuad(mat4.identity([]), viewMatrix);

    // TASK 8-2
    renderRobot(sceneMatrix, viewMatrix);
    //request another render call as soon as possible
    requestAnimationFrame(render);

    camera.animatedAngle = timeInMilliseconds/1000;
}

function renderQuad(sceneMatrix, viewMatrix) {
  var tempSceneMat = []
  mat4.copy(tempSceneMat, sceneMatrix);
  //TASK 2-2 and TASK 3 and TASK 4
  mat4.rotate(tempSceneMat, tempSceneMat, glMatrix.toRadian(45), [1, 0, 0]);
  mat4.translate(tempSceneMat, tempSceneMat, [0, -0.5, 0]);
  mat4.scale(tempSceneMat, tempSceneMat, [0.5, 0.5, 0]);
  setUpModelViewMatrix(viewMatrix, tempSceneMat);

  gl.bindBuffer(gl.ARRAY_BUFFER, quadVertexBuffer);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  //enable this vertex attribute
  gl.enableVertexAttribArray(positionLocation);

  //const colorLocation = gl.getAttribLocation(shaderProgram, 'a_color');
  //gl.enableVertexAttribArray(colorLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, quadColorBuffer);
  gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(colorLocation);

  // draw the bound data as 6 vertices = 2 triangles starting at index 0
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function renderCube() {
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
  gl.drawElements(gl.TRIANGLES, cubeIndices.length, gl.UNSIGNED_SHORT, 0); //LINE_STRIP
}

var trans = 0;
function renderRobot(sceneMatrix, viewMatrix) {

  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
  gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false,0,0) ;
  gl.enableVertexAttribArray(positionLocation);

  gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorBuffer);
  gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false,0,0) ;
  gl.enableVertexAttribArray(colorLocation);

  // TASK 10-2
  // store current sceneMatrix in originSceneMatrix, so it can be restored
  var originSceneMatrix = []
  mat4.rotate(originSceneMatrix, sceneMatrix, camera.animatedAngle*2, [0,1,0]);
  mat4.translate(originSceneMatrix, originSceneMatrix, [0.7,0.9,0]);

  setUpModelViewMatrix(viewMatrix, originSceneMatrix);
  // TASK 8-3
  renderCube(); // render body
  // TASK 10-1

  //right leg
  // sceneMatrix = originSceneMatrix;
  // sceneMatrix = matrixMultiply(sceneMatrix, makeScaleMatrix(0.1, 1, 1));
  // var t = sceneMatrix;
  // sceneMatrix = matrixMultiply(sceneMatrix, makeTranslationMatrix(-1.5, -0.6, 0));
  // setUpModelViewMatrix(viewMatrix, sceneMatrix);
  // renderCube();
  // //left leg
  // sceneMatrix = matrixMultiply(t, makeTranslationMatrix(1.5, -0.6, 0));
  // setUpModelViewMatrix(viewMatrix, sceneMatrix);
  // renderCube();
  //
  // //head
  // sceneMatrix = originSceneMatrix;
  // sceneMatrix = matrixMultiply(sceneMatrix, makeScaleMatrix(0.5, 0.3, 0.5));
  // sceneMatrix = matrixMultiply(sceneMatrix, makeTranslationMatrix(0, 1.3, 0));
  // setUpModelViewMatrix(viewMatrix, sceneMatrix);
  // renderCube();
}


//load the shader resources using a utility function
loadResources({
  vs: 'shader/simple.vs.glsl',
  fs: 'shader/simple.fs.glsl'
}).then(function (resources /*an object containing our keys with the loaded resources*/) {
  init(resources);

  //render one frame
  render();
});

function setUpModelViewMatrix(viewMatrix, sceneMatrix) {
  var modelViewMatrix = [];
  mat4.mul(modelViewMatrix, viewMatrix, sceneMatrix);
  gl.uniformMatrix4fv(modelViewLocation, false, modelViewMatrix);
}

function updateCamera(pitch, yaw) {
    var qPitch = quat.rotateX(quat.create(), quat.create(), pitch);
    var qYaw = quat.rotateX(quat.create(), quat.create(), yaw);

    var orientation = quat.mul(quat.create(), qPitch, qYaw);
    quat.normalize(orientation, orientation);
    return mat4.fromRotationTranslation(mat4.create(), orientation, camera.pos);

}
