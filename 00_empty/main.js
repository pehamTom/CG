//the OpenGL context
var gl = null;

//shaders
var shaderProgram1 = null;
var shaderProgram2 = null;
var shaderProgram3 = null;

var canvasWidth = 1300;
var canvasHeight = 650;
var aspectRatio = canvasWidth / canvasHeight;

var ext;
//camera and projection settings


var cubeVertexBuffer, cubeColorBuffer, cubeIndexBuffer;
var houseVertexBuffer, houseIndexBuffer; //TEST

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

var house; //TEST

//TEST
var testEmitter1;
var testEmitter2;

//handle mouse input
document.addEventListener("mousemove", function(event){
    if(! event.shiftKey) return;
    camera.deltaX = event.movementX;
    camera.deltaY = event.movementY;
});

//handle keyboard input
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

var updateQueue = []; //place objects that need to be updated in here
var scenegraph;
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

    //set attributes and uniforms that aren't shared by shaders
    shaderProgram1.colorLocation = gl.getAttribLocation(shaderProgram1.program, "a_color");

    shaderProgram2.colorLocation = gl.getUniformLocation(shaderProgram2.program, "u_color");

    shaderProgram3.colorLocation = gl.getUniformLocation(shaderProgram3.program, "u_color");
    shaderProgram3.centerLocation = gl.getAttribLocation(shaderProgram3.program, "a_centerPos");
    shaderProgram3.timeLocation = gl.getAttribLocation(shaderProgram3.program, "a_time");
    shaderProgram3.generalDirLocation = gl.getUniformLocation(shaderProgram3.program, "u_generalDirection");
    shaderProgram3.massLocation = gl.getUniformLocation(shaderProgram3.program, "u_mass");
    shaderProgram3.velocityLocation = gl.getAttribLocation(shaderProgram3.program, "a_velocity");
    shaderProgram3.finalColorLocation = gl.getUniformLocation(shaderProgram3.program, "u_finalColor");
    shaderProgram3.lifeTimeLocation = gl.getAttribLocation(shaderProgram3.program, "a_lifeTime");
    shaderProgram3.camRightLocation = gl.getUniformLocation(shaderProgram3.program, "u_camRight");
    shaderProgram3.forceLocation = gl.getAttribLocation(shaderProgram3.program, "a_force");
    shaderProgram3.vortexPosLocation = gl.getUniformLocation(shaderProgram3.program, "u_vortexPos");
    shaderProgram3.angularVelLocation = gl.getUniformLocation(shaderProgram3.program, "u_angularVel");
    shaderProgram3.vortexPullLocation = gl.getUniformLocation(shaderProgram3.program, "u_vortexPull");

    initCubeBuffer();
    house = resources.house;
    initHouseBuffer();

    //TEST
    testEmitter1= new PlaneEmitter([0,0,5], 1000, 10000, 0.01, [0.0,1,0], 0.040,
        0.01, [1,0,0,1], [0.9, 0.7, 0.3, 1], [3,0,0], [0,0,3]);
    testEmitter2 = new SphereEmitter([-2.93,4.694, -0.85], 500, 1000, 0.0001, [0,1,0], 0.08,
        0.001, [0.3,0.3,0.3,1], [1, 1, 1, 1], 1, 1);

    var shader1Node = sg.shader(shaderProgram1.program);
    var shader2Node = sg.shader(shaderProgram2.program);

    //setup scenegraph
    scenegraph = shader2Node;

    //setup ground plane
    // node = scenegraph.push(shader2Node);
    node = new SetUniformSGNode("u_color", [0.9,0.9,0.9]);
    node = shader2Node.push(node);
    node = node.push(sg.rotateX(90));
    node.push(sg.drawRect(100, 100));

    //setup house
    node =  new SetUniformSGNode("u_color", [0.4,0.2,0]);
    node = scenegraph.push(node);
    // node = node.push(sg.translate(0,0.7,0));
    // node = node.push(sg.scale(0.7, 0.7, 0.7));
    node.push(sg.draw(house));

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
    gl.clearColor(0.2, 0.2, 0.2, 1.0);
    //clear the buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    //enable depth test to let objects in front occluse objects further away
    gl.enable(gl.DEPTH_TEST);

    //base matrices to be applied to all objects
    var projectionMatrix = [];
    var sceneMatrix = [];
    var viewMatrix = [];
    mat4.identity(sceneMatrix);
    mat4.lookAt(viewMatrix, camera.pos, vec3.add([], camera.pos, camera.direction), camera.up);
    mat4.perspective(projectionMatrix, camera.fov, aspectRatio, 1, 1000);

    var context = createSGContext(gl, projectionMatrix);
    context.viewMatrix = viewMatrix;
    // scenegraph.render(context);
    //update
    camera.update();
    testEmitter1.update();
    testEmitter2.update();

    //render
    testEmitter1.render(viewMatrix, sceneMatrix, projectionMatrix);
    testEmitter2.render(viewMatrix, sceneMatrix, projectionMatrix);

    gl.useProgram(shaderProgram2.program);
    shaderProgram2.setProjectionMat(projectionMatrix);
    renderHouse(mat4.identity([]), viewMatrix);

    gl.useProgram(shaderProgram1.program);
    shaderProgram1.setProjectionMat(projectionMatrix);
    renderRobot(sceneMatrix, viewMatrix);

    camera.animatedAngle = timer.elapsed/1000;
    //request another render call as soon as possible
    requestAnimationFrame(render);
}

function renderCube() {
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
  gl.drawElements(gl.TRIANGLES, cubeIndices.length, gl.UNSIGNED_SHORT, 0); //LINE_STRIP
}

function renderRobot(sceneMatrix, viewMatrix) {

  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
  gl.vertexAttribPointer(shaderProgram1.positionLocation, 3, gl.FLOAT, false,0,0) ;
  gl.enableVertexAttribArray(shaderProgram1.positionLocation);

  gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorBuffer);
  gl.vertexAttribPointer(shaderProgram1.colorLocation, 3, gl.FLOAT, false,0,0) ;
  gl.enableVertexAttribArray(shaderProgram1.colorLocation);
  ext.vertexAttribDivisorANGLE(shaderProgram1.colorLocation, 0);    //this is IMPORTANT -- even though we don't use it

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


//load resources like shader and obj files
loadResources({
  vs1: 'shader/simple.vs.glsl',
  fs: 'shader/simple.fs.glsl',
  vs2: "shader/nocolorshader.vs.glsl",
  vs3: "shader/particleShader.vs.glsl",
  fs2: "shader/particleShader.fs.glsl",
  house: "../models/house.obj"
}).then(function (resources /*an object containing our keys with the loaded resources*/) {
  init(resources);

  //render one frame
  render();
});

//TEST
function initHouseBuffer() {
    houseVertexBuffer = gl.createBuffer();
    houseVert = new Float32Array(house.position);
    gl.bindBuffer(gl.ARRAY_BUFFER, houseVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, houseVert, gl.STATIC_DRAW);

    houseIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, houseIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(house.index), gl.STATIC_DRAW);
}

//TEST
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

//reset all state
function reset() {
    timer.reset();
    camera.reset();
    testEmitter1.reset();
    testEmitter2.reset();
}
