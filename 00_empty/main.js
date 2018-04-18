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
        this.yaw += deltaTime*this.deltaX*sensitivity/10.0;
        this.pitch -= deltaTime*this.deltaY*sensitivity/10.0;
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
var houseVertexBuffer, houseIndexBuffer;

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

var house = parseObjFile(getHouse());
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

    //set buffers
    initQuadBuffer();

    initCubeBuffer();

    initHouseBuffer();
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
    renderHouse();
    // TASK 8-2
    renderRobot(sceneMatrix, viewMatrix);
    //request another render call as soon as possible
    requestAnimationFrame(render);

    camera.animatedAngle = timeInMilliseconds/1000;
}

function renderQuad(sceneMatrix, viewMatrix) {
  var tempSceneMat = []
  mat4.copy(tempSceneMat, sceneMatrix);
  // //TASK 2-2 and TASK 3 and TASK 4
  // mat4.rotate(tempSceneMat, tempSceneMat, glMatrix.toRadian(45), [1, 0, 0]);
  // mat4.translate(tempSceneMat, tempSceneMat, [0, -0.5, 0]);
  // mat4.scale(tempSceneMat, tempSceneMat, [0.5, 0.5, 0]);
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
function getHouse() {
    return  "# Blender v2.79 (sub 0) OBJ File: 'house.blend'\n\
    # www.blender.org\n\
    mtllib house.mtl\n\
    o Cube_Cube.001\n\
    v -1.132698 -0.002618 1.466474\n\
    v -1.132698 1.997382 1.466474\n\
    v -1.132698 -0.002618 -1.556915\n\
    v -1.132698 1.997382 -1.556915\n\
    v 1.099442 -0.002618 1.466474\n\
    v 1.099442 1.997382 1.466474\n\
    v 1.099442 -0.002618 -1.556915\n\
    v 1.099442 1.997382 -1.556915\n\
    v 1.347789 1.997382 -1.893296\n\
    v 1.347789 1.997382 1.802855\n\
    v -1.381045 1.997382 -1.893296\n\
    v -1.381045 1.997382 1.802855\n\
    v 1.347789 1.997382 -1.893296\n\
    v 1.347789 1.997382 1.802855\n\
    v -1.381045 1.997382 -1.893296\n\
    v -1.381045 1.997382 1.802855\n\
    v 1.347789 3.820522 -1.893296\n\
    v 1.347789 3.820522 1.802855\n\
    v -1.381045 3.820522 -1.893296\n\
    v -1.381045 3.820522 1.802855\n\
    v -0.016628 5.218891 -1.893296\n\
    v -0.016628 5.218891 1.802855\n\
    v 1.447351 3.768713 -2.028151\n\
    v 1.447351 3.768713 1.937710\n\
    v -1.480607 3.768713 1.937710\n\
    v -1.480607 3.768713 -2.028151\n\
    v -0.016628 5.269122 -2.028151\n\
    v -0.016628 5.269122 1.937710\n\
    v 1.447351 3.856097 -2.028151\n\
    v 1.447351 3.856097 1.937710\n\
    v -1.480607 3.856097 1.937710\n\
    v -1.480607 3.856097 -2.028151\n\
    v -0.016628 5.356505 -2.028151\n\
    v -0.016628 5.356505 1.937710\n\
    vn -1.0000 0.0000 0.0000\n\
    vn 0.0000 0.0000 -1.0000\n\
    vn 1.0000 0.0000 0.0000\n\
    vn 0.0000 0.0000 1.0000\n\
    vn 0.0000 -1.0000 0.0000\n\
    vn 0.4616 -0.8871 0.0000\n\
    vn -0.6927 -0.6759 -0.2517\n\
    vn -0.6927 -0.6759 0.2517\n\
    vn -0.4616 -0.8871 0.0000\n\
    vn 0.6927 -0.6759 -0.2517\n\
    vn 0.6927 -0.6759 0.2517\n\
    vn -0.7157 0.6984 0.0000\n\
    vn 0.7157 0.6984 0.0000\n\
    usemtl None\n\
    s off\n\
    f 1//1 2//1 4//1 3//1\n\
    f 3//2 4//2 8//2 7//2\n\
    f 7//3 8//3 6//3 5//3\n\
    f 5//4 6//4 2//4 1//4\n\
    f 3//5 7//5 5//5 1//5\n\
    f 8//5 4//5 10//5 12//5\n\
    f 11//4 12//4 16//4 15//4\n\
    f 6//5 8//5 12//5 11//5\n\
    f 4//5 2//5 9//5 10//5\n\
    f 2//5 6//5 11//5 9//5\n\
    f 13//2 15//2 19//2 17//2\n\
    f 10//4 9//4 13//4 14//4\n\
    f 9//4 11//4 15//4 13//4\n\
    f 12//4 10//4 14//4 16//4\n\
    f 19//6 20//6 25//6 26//6\n\
    f 16//4 14//4 18//4 20//4\n\
    f 15//1 16//1 20//1 19//1\n\
    f 14//3 13//3 17//3 18//3\n\
    f 17//7 21//7 27//7 23//7\n\
    f 17//2 19//2 21//2\n\
    f 20//4 18//4 22//4\n\
    f 23//2 27//2 33//2 29//2\n\
    f 25//4 28//4 34//4 31//4\n\
    f 22//8 18//8 24//8 28//8\n\
    f 18//9 17//9 23//9 24//9\n\
    f 21//10 19//10 26//10 27//10\n\
    f 20//11 22//11 28//11 25//11\n\
    f 32//12 31//12 34//12 33//12\n\
    f 30//13 29//13 33//13 34//13\n\
    f 24//3 23//3 29//3 30//3\n\
    f 28//4 24//4 30//4 34//4\n\
    f 27//2 26//2 32//2 33//2\n\
    f 26//1 25//1 31//1 32//1\n\
    "
};

function initHouseBuffer() {
    houseVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, houseVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, house.position, gl.STATIC_DRAW);

    houseIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, houseIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(house.index), gl.STATIC_DRAW);
    console.log(house.index);
    console.log(house.position.length%3);
}

function renderHouse() {
    gl.bindBuffer(gl.ARRAY_BUFFER, houseVertexBuffer);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false,0,0);
    gl.enableVertexAttribArray(positionLocation);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, houseIndexBuffer);
    gl.drawElements(gl.TRIANGLES, house.index.length, gl.UNSIGNED_SHORT, 0);
}
