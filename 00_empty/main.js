//the OpenGL context
var gl = null;

//shaders
var colorShader = null;
var constColorShader = null;
var particleShader = null;
var phongShader = null;

//test
var cube = null;

var canvasWidth = 1300;
var canvasHeight = 650;
var aspectRatio = canvasWidth / canvasHeight;

var lightWoodMaterial = new Material([.227,.1137,.0392,1],
                                [0.43,0.223,0.0863,1],
                                [0, 0, 0, 1],
                                [0, 0, 0, 1],
                                0);

var darkWoodMaterial = new Material([.227,.1137,.0392,1],
                                [.227,.1137,.0392,1],
                                [0, 0, 0, 1],
                                [0, 0, 0, 1],
                                0);

var goldMaterial = new Material([0.24725, 0.1995, 0.0745, 1],
                                [0.75164, 0.60648, 0.22648, 1],
                                [0.628281, 0.555802, 0.366065, 1],
                                [0, 0, 0, 1],
                                40);

var stoneMaterial = new Material([0.3, 0.3, 0.3, 1],
                                [0.7, 0.7, 0.7, 1],
                                [0, 0, 0, 1],
                                [0, 0, 0, 1],
                                0);

var snowMaterial = new Material([1, 1, 1, 1],
								[1, 1, 1, 1],
								[0, 0, 0, 1],
								[0.2, 0.2, 0.2, 1],
								0);

var metalMaterial = new Material([0.1, 0.1, 0.1, 1.0],
								[0.3, 0.3, 0.3, 1],
								[1, 1, 1, 1],
								[0, 0, 0, 1],
								100);

var glassMaterial = new Material([0, 0, 0, 0],
								[0.9, 0.9, 0.9, 0.1],
								[0.9, 0.9, 0.9, 0.1],
								[0, 0, 0, 0],
								40);
var house;
var chimney;

var blackHolePos = [0,100,-250];

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
var timeEventQueue = []; //register timestamp and event here
var scenegraph;
/**
 * initializes OpenGL context, compile shader, and load buffers
 */
function init(resources) {
    //create a GL context
    gl = createWebGL2Context(canvasWidth, canvasHeight);
    //in WebGL / OpenGL3 we have to create and use our own shaders for the programmable pipeline
    //create the shader program
    colorShader = createProgram(gl, resources.simpleVs, resources.simpleFs);
    constColorShader = createProgram(gl, resources.noColorVs, resources.simpleFs);
    particleShader = createProgram(gl, resources.particleVs, resources.particleFs);
    phongShader = createProgram(gl, resources.phongVs, resources.phongFs);

    house = resources.house;
    chimney = resources.chimney;
    cube = resources.cube;



    //TEST
    var fireEmitter= new PlaneEmitter([0,0,0], 3000, 1300, 0.01, [0.0,1.3,0], 0.05,
        0.01, [1,0,0,1], [1, 0.7, 0.3, 0.9], new FireParticle(null), 0.7, [.6,0,0], [0,0,.6]);
    var smokeEmitter = new SphereEmitter([1.5, 7.17818, 4.215], 1000, 3000, 0.0001, [0,1,0], 0.08,
        0.050, [0.0,0.0,0.0,1.0], [0.8, 0.8, 0.8, 0.1], new Particle(null), 1, 0.3, 1);
    var blackHoleParticleEmitter = new CircleEmitter([0, 0, 0], 1000, 5000, 0.0001, [0,0,0], 3,
        0.01, [0.02,0.05,0.5,1], [0.7, 0.1, 0.5, 1], new Particle(null), 1, [1,0,0], [0,1,0], 70, 1.0);

    var snowEmitter1 = ps.createSnowEmitter([20, 20, 0], 10, 10, 5000);
    var snowEmitter2 = ps.createSnowEmitter([-20, 20, 0], 10, 10, 5000);
    var snowEmitter3 = ps.createSnowEmitter([0, 20, 20], 10, 10, 5000);
    var snowEmitter4 = ps.createSnowEmitter([0, 20, -20], 10, 10, 5000);

    updateQueue.push(fireEmitter);
    // updateQueue.push(smokeEmitter);
    updateQueue.push(blackHoleParticleEmitter);
    // updateQueue.push(snowEmitter1);
    // updateQueue.push(snowEmitter2);
    // updateQueue.push(snowEmitter3);
    // updateQueue.push(snowEmitter4);

    var colorShaderNode = sg.shader(colorShader);
    var constColorShaderNode = sg.shader(constColorShader);
    var particleShaderNode = sg.shader(particleShader);
    var phongShaderNode = sg.shader(phongShader);
    //setup scenegraph
    scenegraph = new SGNode([particleShaderNode, colorShaderNode, constColorShaderNode, phongShaderNode]);

    //spawn trees around circle
    var treeNode = colorShaderNode;
    for(let i = 0; i < 50; i++) {
        let alpha = -Math.PI/2 + i*7*Math.PI/(4*50)
        let radius = 10;
        let x = Math.cos(alpha);
		let z = Math.sin(alpha);
		x *= radius;
		z *= radius;
        let centerDist = [x, 0, z];
        vec3.scale(centerDist, centerDist, (Math.random()*2-1)*0.5);
        vec3.add(centerDist, [x, 0, z], centerDist);
        vec3.add(centerDist, centerDist, [20, 2, 20]);
       treeNode.push(new NoAllocRenderSGNode(billboardRenderer(centerDist, 2, 4, [0, 0.2, 0, 1])));

    }

    // particleShaderNode.push(new NoAllocRenderSGNode(emitterRenderer(fireEmitter)));
    // particleShaderNode.push(new RenderSGNode(emitterRenderer(smokeEmitter)));
    // particleShaderNode.push(new RenderSGNode(emitterRenderer(snowEmitter1)));
    // particleShaderNode.push(new RenderSGNode(emitterRenderer(snowEmitter2)));
    // particleShaderNode.push(new RenderSGNode(emitterRenderer(snowEmitter3)));
    // particleShaderNode.push(new RenderSGNode(emitterRenderer(snowEmitter4)));

	//setup ground plane
    node = initMaterialSGNode(snowMaterial);
    phongShaderNode.push(node);
    node = node.push(sg.rotateX(-90));
    node.push(sg.drawRect(300, 300));


    node = colorShaderNode.push(sg.translate(10,0,10));
    node = node.push(sg.scale(0.7,0.7,0.7));
    // initDeer(node);

    node = colorShaderNode.push(sg.translate(5,0,10));
    node = node.push(sg.scale(0.7,0.7,0.7));
    // initDeer(node);


    //setup moon
    node = initMaterialSGNode(constantColorMaterial([1, 0.2, 0.1, 1]));
    node = phongShaderNode.push(node);
    node = node.push(new AnimationSGNode(function() {
        return rotateAroundPoint([0,-50,0], timer.elapsed*0.00001, [0, 0, 1]);
    }));

    let trans3 = node.push(new AnimationSGNode(function() {
        return glm.translate(-200, 30, 0);
    }));
    trans3.push(sg.drawSphere(10, 30, 30));

	let moonLight = new LightSGNode([0, 0, 0]);
	moonLight.ambient = [0.1, 0.1, 0.1, 1.0];
	moonLight.diffuse = [1, 0.4, 0.1, 1.0];
	moonLight.specular = [1, 0.4, 0.1, 1.0];
	moonLight.uniform = 'u_light2';
	node = trans3.push(sg.shader(phongShader));
	node.push(moonLight);

    //setup black hole
    node = initMaterialSGNode(constantColorMaterial([0,0,0,1]));
    node = phongShaderNode.push(node);
    let beforeTrans = node;
    node = node.push(new AnimationSGNode(function() {
        var endTime = 15000;
        var elapsed = 0;
        var endPos = [20, 50, -80];
        var animate = false;
        var interpolatedVec = [0,0,0];
        timeEventQueue.push({timeStamp: 15000, fire: function() {animate = true}});
        resetQueue.push({reset: function() {
            elapsed = 0;
            animate = false;
        }});

        return function() {
            if(! animate) return glm.translate(blackHolePos[0], blackHolePos[1], blackHolePos[2]);
            elapsed += timer.delta;
            let t = Math.min(elapsed/endTime, 1);
            vec3.lerp(interpolatedVec, blackHolePos, blackHolePos, t); //TODO: change to interpolate between endpoint
            return glm.translate(interpolatedVec[0], interpolatedVec[1], interpolatedVec[2]);
        }
    }()));
    let blackHole = node;
    node.push(sg.drawSphere(70, 30, 30));

    //set particles emitted by black hole
    node = blackHole.push(sg.shader(particleShader));
    node = node.push(new NoAllocRenderSGNode(emitterRenderer(blackHoleParticleEmitter)));


    for(let i = 0; i < 100; i++) {
        let rand = [Math.random(), Math.random(), Math.random()];
        node = blackHole.push(new AnimationSGNode(function() {
            return rotateAroundPoint([0,0,0], timer.elapsed*0.001, rand);
        }));
        let sign1 = (Math.random()*2-1) < 0 ? -1 : 1;
        let sign2 = (Math.random()*2-1) < 0 ? -1 : 1;
        let sign3 = (Math.random()*2-1) < 0 ? -1 : 1;

        node = node.push(sg.translate(60*sign1+(Math.random()*2-1)*5, 60*sign2+(Math.random()*2-1)*5, 60*sign3+(Math.random()*2-1)*5));
        node = node.push(sg.drawSphere(3+ Math.random()*3, 30, 30));
    }


	//setup firelight
	var fireLight  = new LightSGNode([0, 0.5, 5]);
    fireLight.ambient = [0.1, 0, 0, 1.0];
	fireLight.diffuse = [1.0, 0.2, 0, 1.0];
	fireLight.diffuse = [1.0, 0.3, 0, 1.0];
	fireLight.specular = [1.0, 0.2, 0, 1.0];
    node = node.push(sg.translate(2, 1.5, 0));
    node = phongShaderNode.push(fireLight);

	//setup tableLight -- for now this is a test
	var tableLight = new LightSGNode([-2.4,2, 0]);
	tableLight.ambient = [0.1, 0.1, 0.1, 1.0];
	tableLight.diffuse = [0.5, 0.5, 0.5, 1.0];
	tableLight.uniform = "u_light2";
	node = tableLight.push(initMaterialSGNode(constantColorMaterial([0.8, 0.8, 0.1, 1.0])));
	node.push(sg.drawSphere(0.1, 30, 30));
	// phongShaderNode.push(tableLight);

    //setup house
    node =  new initMaterialSGNode(lightWoodMaterial);
    node = phongShaderNode.push(node);
    let houseNode = node;
	node = node.push(sg.translate(2, 1.5, 0));
    node = phongShaderNode.push(fireLight);
    houseNode.push(sg.draw(house));


    //setup door relative to house
    let doorNode = houseNode.push(new AnimationSGNode(doorAnimator(3000)));
    node = doorNode.push(sg.scale(0.08, 1.72712,1.4467));
    node = node.push(initMaterialSGNode(darkWoodMaterial));
    node = node.push(new NoAllocRenderSGNode(cubeRenderer([0.4,0.2,0,1])));

    //setup inside doorknob relative to door
    node = doorNode.push(initMaterialSGNode(goldMaterial));
    let doorknob = node;
    node = node.push(sg.translate(-0.1, 0, 0.6));
    let knobSphere = node.push(sg.drawSphere(0.05, 10, 10));

    //setup outside doorknob relative to door
    node = doorknob.push(sg.translate(0.1, 0, 0.6));
    node.push(knobSphere);

    //setup chimney relative to house
    node = houseNode.push(initMaterialSGNode(stoneMaterial));
    let trans1 = node.push(sg.translate(0, 0, 5));
    node = trans1.push(sg.rotateY(90));
    node = node.push(sg.scale(0.6, 0.6, 0.6));
    node.push(sg.draw(chimney));

    let chimneyNode = node.push(initMaterialSGNode(darkWoodMaterial));
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

	//setup fire relative to chimney
	node = trans1.push(sg.shader(particleShader));
	node = node.push(new NoAllocRenderSGNode(emitterRenderer(fireEmitter)));


    //setup table relative to houseNode
    node = houseNode.push(initMaterialSGNode(metalMaterial));
    node = node.push(sg.translate(-2.5, 0, 0));
    node = node.push(sg.scale(0.3, 0.35, 0.3));
    node = node.push(sg.rotateY(90));
    node = node.push(new RenderSGNode(resources.table));

    //setup chair relative to houseNode
    node = houseNode.push(initMaterialSGNode(lightWoodMaterial));
    node = node.push(sg.translate(-1, 0, 0));
    node = node.push(sg.scale(0.28, 0.28, 0.28));
    // node = node.push(sg.rotateY(90));
    node = node.push(new RenderSGNode(resources.chair));

    //setup windows relative to house
    let windowBaseNode = houseNode;
    node = windowBaseNode.push(sg.translate(1.99791, 1.41766, 5.78689));
	let windowNode = sg.scale(1.9979, 0.69084, 0.05); //window is the same only translation and rotation changes

	node = node.push(windowNode);
	node = node.push(initMaterialSGNode(glassMaterial));
	let renderWindowNode = new RenderSGNode(cubeRenderer([0.9, 0.9, 0.9, 0.1]));
    node = node.push(renderWindowNode);
    //windowbar 1
    node = windowNode.push(sg.rotateZ(90));
    scaleNode = sg.scale(0.1, 1, 1.2);
    node = node.push(scaleNode);
	node = node.push(initMaterialSGNode(darkWoodMaterial));
    node = node.push(new RenderSGNode(cubeRenderer([0.4,0.2,0,1])));
    //windowbar2
    node = windowNode.push(scaleNode);
	node = node.push(initMaterialSGNode(darkWoodMaterial));
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

    //setup list of updatable objects
    updateQueue.push(camera);


    cameraAnimator.addRotation(0,180,0,10);
    cameraAnimator.addRotation(0,180,0,1);
    cameraAnimator.addLocation([100,0,0],10);
    cameraAnimator.addLocation([-100,0,0],10);
    cameraAnimator.startRotating();
    cameraAnimator.startMoving();

    //camera.lookAt([0,0,0]);
    //camera.rotateBy(0,0,-20,1);
    camera.rotationPoint = [0,0,0];
    vec3.add(camera.pos, camera.pos, [-10,0,0]);
    //fcameraAnimator.startMoving();
    //camera.isFree = false;
    updateQueue.push(cameraAnimator);
}

var deerBodyVertexBuffer;
var deerBodyIndexBuffer;
function initDeer(parent){
    var deer;
    var body;
    var brown = [.6,.3,.1,1];
    var temp;
    //Deer


    deer = parent.push(sg.translate(0,1.7,0))
    deer = deer.push(sg.rotateX(0));
    //body
    deerBodyVertexBuffer = setupStaticArrayBuffer(deerBodyVertices);
    deerBodyIndexBuffer = setUpStaticElementBuffer(deerBodyIndices);

    body = deer.push(sg.translate(20,0,0));
    temp = body.push(sg.rotateY(90));
    temp = temp.push(sg.scale(1.3,1.3,1.3));
    temp = temp.push(sg.shader(constColorShader));
    temp = temp.push(new SetUniformSGNode("u_color", brown));
    temp = temp.push(new NoAllocRenderSGNode(function(context){
       gl.bindBuffer(gl.ARRAY_BUFFER, deerBodyVertexBuffer);
       var loc = gl.getAttribLocation(context.shader, "a_position");

       gl.vertexAttribPointer(loc, 3, gl.FLOAT, false,0,0) ;
       gl.enableVertexAttribArray(loc);

       gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, deerBodyIndexBuffer);
       gl.drawElements(gl.TRIANGLES, deerBodyIndices.length,gl.UNSIGNED_SHORT, 0);

    }));
    temp = temp.push(sg.shader(colorShader));
    //neck
    temp = body.push(sg.translate(0.35,0.9,0.35));
    temp = temp.push(sg.rotateX(-40));
    //temp = temp.push(sg.shader(constColorShader.program))
    node = temp.push(sg.scale(.25,.25,.5));
    node.push(new NoAllocRenderSGNode(cubeRenderer(brown)));
    //node.push(new NoAllocRenderSGNode(cylinderRenderer()));

    //head

    deerHeadVertexBuffer = setupStaticArrayBuffer(deerHeadVertices);
    deerHeadIndexBuffer  = setUpStaticElementBuffer(deerHeadIndices);

    temp = body.push(sg.translate(0,1,.40));
    temp = temp.push(sg.rotateX(30));
    temp = temp.push(sg.scale(1.5,1.5,1.5));
    temp = temp.push(new NoAllocRenderSGNode(function(context){
       gl.bindBuffer(gl.ARRAY_BUFFER, deerHeadVertexBuffer);
       var loc = gl.getAttribLocation(context.shader, "a_position");

       gl.vertexAttribPointer(loc, 3, gl.FLOAT, false,0,0) ;
       gl.enableVertexAttribArray(loc);

       gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, deerHeadIndexBuffer);
       gl.drawElements(gl.TRIANGLES, deerHeadIndices.length,gl.UNSIGNED_SHORT, 0);

    }));

    // right front leg
    temp = body.push(sg.translate(0,.1,0));
    temp = temp.push(sg.rotateX(2));
    node = temp.push(sg.scale(0.25,0.8,0.3));
    node.push(new NoAllocRenderSGNode(cubeRenderer(brown)));
    temp = temp.push(sg.translate(0,-0.7,-0.05));
    temp = temp.push(sg.rotateX(15));
    node = temp.push(sg.scale(.15,1.,.15));
    node.push(new NoAllocRenderSGNode(cubeRenderer(brown)));
    temp = temp.push(sg.translate(0,-.5,.05));
    temp = temp.push(sg.rotateX(-10));
    node = temp.push(sg.scale(.2,0.1,.3));
    node.push(new NoAllocRenderSGNode(cubeRenderer(brown)));
    //left front leg
    temp = body.push(sg.translate(0.7,.1,0));
    temp = temp.push(sg.rotateX(2));
    node = temp.push(sg.scale(0.25,0.8,0.3));
    node.push(new NoAllocRenderSGNode(cubeRenderer(brown)));
    temp = temp.push(sg.translate(0,-0.7,-0.05));
    temp = temp.push(sg.rotateX(15));
    node = temp.push(sg.scale(.15,1.,.15));
    node.push(new NoAllocRenderSGNode(cubeRenderer(brown)));
    temp = temp.push(sg.translate(0,-.5,.05));
    temp = temp.push(sg.rotateX(-10));
    node = temp.push(sg.scale(.2,0.1,.3));
    node.push(new NoAllocRenderSGNode(cubeRenderer(brown)));
    //right hind leg
    temp = body.push(sg.translate(0,.25,-1.7));
    temp = temp.push(sg.rotateX(-20));
    node = temp.push(sg.scale(.2,.7,.6));
    node.push(new NoAllocRenderSGNode(cubeRenderer(brown)));
    temp = temp.push(sg.translate(0,-0.3,-0.1));
    temp = temp.push(sg.rotateX(-20));
    node = temp.push(sg.scale(.2,.2,1));
    node.push(new NoAllocRenderSGNode(cubeRenderer(brown)));
    temp = temp.push(sg.translate(0,-.4,-.5));
    temp = temp.push(sg.rotateX(100));
    node = temp.push(sg.scale(.15,.15,0.95));
    node.push(new NoAllocRenderSGNode(cubeRenderer(brown)));
    temp = temp.push(sg.translate(0,.1,.5));
    temp = temp.push(sg.rotateX(30));
    node = temp.push(sg.scale(.15,.25,.1));
    node.push(new NoAllocRenderSGNode(cubeRenderer(brown)));
    //left hind leg
    temp = body.push(sg.translate(0.7,.25,-1.7));
    temp = temp.push(sg.rotateX(-20));
    node = temp.push(sg.scale(.2,.7,.6));
    node.push(new NoAllocRenderSGNode(cubeRenderer(brown)));
    temp = temp.push(sg.translate(0,-0.3,-0.1));
    temp = temp.push(sg.rotateX(-20));
    node = temp.push(sg.scale(.2,.2,1));
    node.push(new NoAllocRenderSGNode(cubeRenderer(brown)));
    temp = temp.push(sg.translate(0,-.4,-.5));
    temp = temp.push(sg.rotateX(100));
    node = temp.push(sg.scale(.15,.15,0.95));
    node.push(new NoAllocRenderSGNode(cubeRenderer(brown)));
    temp = temp.push(sg.translate(0,.1,.5));
    temp = temp.push(sg.rotateX(30));
    node = temp.push(sg.scale(.15,.25,.1));
    node.push(new NoAllocRenderSGNode(cubeRenderer(brown)));

    //tail
    temp = body.push(sg.translate(0.45,.8,-2.));
    temp = temp.push(sg.rotateX(60));
    node = temp.push(sg.scale(.1,.1,.1));
    node.push(new NoAllocRenderSGNode(cubeRenderer(brown)));
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


//load resources like shader and obj files
loadResources({
  simpleVs: 'shader/simple.vs.glsl',
  simpleFs: 'shader/simple.fs.glsl',
  noColorVs: "shader/nocolorshader.vs.glsl",
  particleVs: "shader/particleShader.vs.glsl",
  particleFs: "shader/particleShader.fs.glsl",
  phongVs: 'shader/phong.vs.glsl',
  phongFs: 'shader/phong.fs.glsl',
  house: "../models/house.obj",
  chimney: "../models/chimney.obj",
  table: "../models/table.obj",
  chair: "../models/chair.obj",
  cube: "../models/cube.obj"
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
    timeEventQueue.forEach(function(e) {
        if(timer.elapsed >= e.timeStamp)
            e.fire();
    });
}
