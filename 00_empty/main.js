//the OpenGL context
var gl = null;

//shaders
var shaderProgram1 = null;
var shaderProgram2 = null;
var shaderProgram3 = null;


var canvasWidth = 1300;
var canvasHeight = 650;
var aspectRatio = canvasWidth / canvasHeight;

//camera and projection settings


var cubeVertexBuffer, cubeColorBuffer, cubeIndexBuffer;

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
   0,1,1,1, 0,1,1,1, 0,1,1,1, 0,1,1,1,
   1,0,1,1, 1,0,1,1, 1,0,1,1, 1,0,1,1,
   1,0,0,1, 1,0,0,1, 1,0,0,1, 1,0,0,1,
   0,0,1,1, 0,0,1,1, 0,0,1,1, 0,0,1,1,
   1,1,0,1, 1,1,0,1, 1,1,0,1, 1,1,0,1,
   0,1,0,1, 0,1,0,1, 0,1,0,1, 0,1,0,1
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
var chimney;

//TEST
var testSystem = new ParticleSystem();

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
        case "F":
        case "f":{
            camera.isFree = !camera.isFree;
        } break;

    }
});

document.addEventListener("wheel", function(event) {
    camera.zoom(event.deltaY);
})

var updateQueue = []; //place objects that need to be updated in here
var resetQueue = []; //place objects that can be resetted here
var scenegraph;
/**
 * initializes OpenGL context, compile shader, and load buffers
 */
function init(resources) {
    //create a GL context
    gl = createWebGL2Context(canvasWidth, canvasHeight);
    //in WebGL / OpenGL3 we have to create and use our own shaders for the programmable pipeline
    //create the shader program
    shaderProgram1 = new ShaderProgram(resources.vs1, resources.fs);
    shaderProgram2 = new ShaderProgram(resources.vs2, resources.fs);
    shaderProgram3 = new ShaderProgram(resources.vs3, resources.fs2);


    //set attributes and uniforms that aren't shared by shaders
    shaderProgram1.colorLocation = gl.getAttribLocation(shaderProgram1.program, "a_color");

    shaderProgram2.colorLocation = gl.getUniformLocation(shaderProgram2.program, "u_color");

    //shader for particle system needs quite some data
    //the reason is, that we want to do as little processing of the particles on the cpu as possible
    shaderProgram3.centerLocation = gl.getAttribLocation(shaderProgram3.program, "a_centerPos");
    shaderProgram3.timeLocation = gl.getAttribLocation(shaderProgram3.program, "a_time");
    shaderProgram3.velocityLocation = gl.getAttribLocation(shaderProgram3.program, "a_velocity");
    shaderProgram3.lifeTimeLocation = gl.getAttribLocation(shaderProgram3.program, "a_lifeTime");
    shaderProgram3.forceLocation = gl.getAttribLocation(shaderProgram3.program, "a_force");
    shaderProgram3.massLocation = gl.getUniformLocation(shaderProgram3.program, "u_mass");
    shaderProgram3.finalColorLocation = gl.getUniformLocation(shaderProgram3.program, "u_finalColor");
    shaderProgram3.camRightLocation = gl.getUniformLocation(shaderProgram3.program, "u_camRight");
    shaderProgram3.generalDirLocation = gl.getUniformLocation(shaderProgram3.program, "u_generalDirection");
    shaderProgram3.colorLocation = gl.getUniformLocation(shaderProgram3.program, "u_color");
    shaderProgram3.vortexPosLocation = gl.getUniformLocation(shaderProgram3.program, "u_vortexPos");
    shaderProgram3.angularVelLocation = gl.getUniformLocation(shaderProgram3.program, "u_angularVel");
    shaderProgram3.vortexFactorLocation = gl.getUniformLocation(shaderProgram3.program, "u_vortexFactor");
    shaderProgram3.numVortexLocation = gl.getUniformLocation(shaderProgram3.program, "u_numVorteces");
    shaderProgram3.dampeningLocation = gl.getUniformLocation(shaderProgram3.program, "u_dampening");
    shaderProgram3.timeScaleLocation = gl.getUniformLocation(shaderProgram3.program, "u_timeScaling");

    initCubeBuffer();
    house = resources.house;
    chimney = resources.chimney;

    //TEST
    var testEmitter1= new PlaneEmitter([0,0,5], 2000, 1000, 0.01, [0.0,1.3,0], 0.05,
        0.01, [1,0,0,1], [1, 0.7, 0.3, 0.9], new FireParticle(null), 0.4, [.5,0,0], [0,0,.5]);
    var testEmitter2 = new SphereEmitter([1.5, 7.17818, 4.215], 1000, 2000, 0.0001, [0,1,0], 0.08,
        0.050, [0.0,0.0,0.0,1.0], [0.8, 0.8, 0.8, 0.1], new Particle(null), 1, 0.3, 1);
    var testEmitter3 = new CircleEmitter([500, 100, 0], 1000, 5000, 0.0001, [0,0,0], 3,
        0.01, [0.02,0.05,0.5,1], [0.7, 0.1, 0.5, 1], new Particle(null), 1, [0,0,1], [0,1,0], 70, 1.0);
    //TEST
    var testEmitter4= new PlaneEmitter([0,10,0], 1000, 10000, 0.03, [0.0,-0.6,0], 0.07,
        0.01, [1,1,1,1], [1, 1, 1, 1], new FuzzyParticle(null), 0, [20,0,0], [0,0,20]);

    updateQueue.push(testEmitter1);
    updateQueue.push(testEmitter2);
    // updateQueue.push(testEmitter3);
    updateQueue.push(testEmitter4);

    var shader1Node = sg.shader(shaderProgram1.program);
    var shader2Node = sg.shader(shaderProgram2.program);
    var shader3Node = sg.shader(shaderProgram3.program);

    //setup scenegraph
    scenegraph = new SGNode([shader3Node, shader2Node, shader1Node]);


    shader3Node.push(new NoAllocRenderSGNode(emitterRenderer(testEmitter1)));
    shader3Node.push(new RenderSGNode(emitterRenderer(testEmitter2)));
    // shader3Node.push(new RenderSGNode(emitterRenderer(testEmitter3)));
    shader3Node.push(new RenderSGNode(emitterRenderer(testEmitter4)));
    //setup ground plane
    node = new SetUniformSGNode("u_color", [0.9,0.9,0.9, 1.0]);
    node = shader2Node.push(node);
    node = node.push(sg.rotateX(-90));
    node.push(sg.drawRect(100, 100));

    //setup moon
    node = new SetUniformSGNode("u_color", [1,1,0.6, 1.0]);
    node = shader2Node.push(node);
    node = node.push(sg.translate(-70, 50, 0));
    node.push(sg.drawSphere(10, 30, 30));

    //setup house
    node =  new SetUniformSGNode("u_color", [0.6,0.6,0.6, 1.0]);
    let houseNode = node;
    node = shader2Node.push(node);
    node.push(sg.draw(house));

    //setup chimney relative to house
    node = houseNode.push( new SetUniformSGNode("u_color", [0.9,0.6,0.6, 1.0]));
    node = node.push(sg.translate(0, 0, 5));
    node = node.push(sg.rotateY(90));
    node = node.push(sg.scale(0.5, 0.5, 0.5));
    node.push(sg.draw(chimney));

    let chimneyNode = node.push(sg.shader(shaderProgram1.program));
    let scaleNode = sg.scale(0.6, 0.16, 0.16);
    //logs for fire relative to chimney
    node = chimneyNode;
    node = node.push(sg.translate(0.3, 0.5, 0));
    node = node.push(sg.rotateY(180));
    node = node.push(sg.rotateZ(45));
    node = node.push(scaleNode);
    node.push(new RenderSGNode(cubeRenderer([0.4,0.2,0,1])));

    node=chimneyNode;
    node = node.push(sg.translate(0, 0.5, 0.2));
    node = node.push(sg.rotateY(-90));
    node = node.push(sg.rotateZ(-45));
    node = node.push(scaleNode);
    node.push(new RenderSGNode(cubeRenderer([0.4,0.2,0,1])));

    node=chimneyNode;
    node = node.push(sg.translate(0, 0.5, -0.2));
    node = node.push(sg.rotateY(90));
    node = node.push(sg.rotateZ(-45));
    node = node.push(scaleNode);
    node.push(new RenderSGNode(cubeRenderer([0.4,0.2,0,1])));
    //end logs for fire

    //setup table relative to houseNode
    node = houseNode.push(new SetUniformSGNode("u_color", [0.81,0.909,0.1882, 1.0]));
    node = node.push(sg.translate(-2.5, 0, -1.5));
    node = node.push(sg.scale(0.3, 0.3, 0.3));
    node = node.push(sg.rotateY(90));
    node = node.push(new RenderSGNode(resources.table));

    //setup windows relative to house
    let windowBaseNode = houseNode.push(sg.shader(shaderProgram1.program));
    node = windowBaseNode.push(sg.translate(1.99791, 1.41766, 5.78689));
    let windowNode = sg.scale(1.9979, 0.69084, 0.05); //window is the same only translation and rotation changes
    node = node.push(windowNode);
    let renderWindowNode = new RenderSGNode(cubeRenderer([0.9, 0.9, 0.9, 0.1]));
    node = node.push(renderWindowNode);
    //windowbar 1
    node = windowNode.push(sg.rotateZ(90));
    scaleNode = sg.scale(0.1, 1, 1.2);
    node = node.push(scaleNode);
    node = node.push(new RenderSGNode(cubeRenderer([0.4,0.2,0,1])));
    //windowbar2
    node = windowNode.push(scaleNode);
    node = node.push(new RenderSGNode(cubeRenderer([0.4,0.2,0,1])));

    //window2
    node = windowBaseNode.push(sg.translate(-1.99791, 1.41766, 5.78689));
    node.push(windowNode);
    //window3
    node = windowBaseNode.push(sg.translate(1.99791, 1.41766, -5.78689));
    node.push(windowNode);
    //window4
    node = windowBaseNode.push(sg.translate(-1.99791, 1.41766, -5.78689));
    node.push(windowNode);

    //window4
    node = windowBaseNode.push(sg.translate(-3.95, 1.41766, 2.17008));
    node = node.push(sg.rotateY(90));
    node = node.push(sg.scale(4.34017, 0.69084, 0.05));
    windowNode.children.forEach(function(child) {
        node.push(child);
    });

    //window5
    node = windowBaseNode.push(sg.translate(-3.95, 1.41766, -3.61681));
    let rotateNode = node.push(sg.rotateY(90));
    node = rotateNode.push(sg.scale(1.44672, 0.69084, 0.05));
    windowNode.children.forEach(function(child) {
        node.push(child);
    });

    //window6
    node = windowBaseNode.push(sg.translate(3.95, 1.41766, 2.17008));
    node.push(rotateNode);

    //window7
    node = windowBaseNode.push(sg.translate(3.95, 1.41766, -0.72336));
    node.push(rotateNode);


    //setup list of resettable objects
    resetQueue.push(timer);
    resetQueue.push(camera);
    resetQueue.push(testSystem);

    //setup list of updatable objects
    updateQueue.push(camera);
    updateQueue.push(testSystem);


    cameraAnimator.addRotation(0,180,0,1);
    cameraAnimator.addRotation(0,180,0,1);
    cameraAnimator.addLocation([100,0,0],10);
    cameraAnimator.addLocation([-100,0,0],10);
    cameraAnimator.startRotating();
    cameraAnimator.startMoving();
    updateQueue.push(cameraAnimator);
}

function initCubeBuffer() {

  cubeVertexBuffer = setupStaticArrayBuffer(cubeVertices);

  cubeColorBuffer = setupStaticArrayBuffer(cubeColors);

  cubeIndexBuffer = setUpStaticElementBuffer(new Uint16Array(cubeIndices));
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
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    //base matrices to be applied to all objects
    var projectionMatrix = [];
    var sceneMatrix = [];
    var viewMatrix = [];
    mat4.identity(sceneMatrix);
    mat4.lookAt(viewMatrix, camera.pos, vec3.add([], camera.pos, camera.direction), camera.up);
    mat4.perspective(projectionMatrix, camera.fov, aspectRatio, 1, 2000);


    //update
    update();
    //render

    var context = createSGContext(gl, projectionMatrix);
    context.viewMatrix = viewMatrix;
    scenegraph.render(context);

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
  gl.vertexAttribPointer(shaderProgram1.colorLocation, 4, gl.FLOAT, false,0,0) ;
  gl.enableVertexAttribArray(shaderProgram1.colorLocation);
  gl.vertexAttribDivisor(shaderProgram1.colorLocation, 0);    //this is IMPORTANT -- even though we don't use it

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
  house: "../models/house.obj",
  chimney: "../models/chimney.obj",
  table: "../models/table.obj"
}).then(function (resources /*an object containing our keys with the loaded resources*/) {
  init(resources);

  //render one frame
  render();
});


//reset all state
function reset() {
    resetQueue.forEach(function(resettable) {
        resettable.reset();
    })
}

function update() {
    updateQueue.forEach(function(updatable) {
        updatable.update();
    })
}
