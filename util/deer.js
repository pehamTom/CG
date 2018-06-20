var deerBodyVertices = new Float32Array([0,0,0 , 0.65,0,0, 0,0,.5 ,
                                         0.65,0,.5, -0.2,0.15,0, -0.2,0.15,.5,
                                        -0.3,0.6,0 ,-0.3,0.6,.5, -0.15,0.7,0
                                        ,-0.15,0.7,.5, 0.65,.15,0.55, 0,.15,0.55,
                                        0.65,.15,-0.05, 0,.15,-0.05, 0.65,0.7,.5,
                                        0.65,0.7,0 , 1.5,.05,.15 , 1.5,.05,.35,
                                        1.3,.75,0.1 , 1.3,.75,.4, 1.7,.5,.1,
                                        1.7,.5,.4, 1.7,.2,.1, 1.7,.2,.4]);

var deerBodyIndices = new Uint16Array([0,1,2, 2,1,3, 0,2,5,
                                       0,4,5, 4,5,6, 5,6,7,
                                       7,8,6, 7,8,9, 2,3,10,
                                       2,10,11, 0,1,12, 0,12,13,
                                       5,11,2, 0,13,4, 11,5,7,
                                       7,9,11, 8,6,13, 13,4,6,
                                       11,10,9, 13,12,8, 8,9,14,
                                       14,8,15, 9,10,14, 8,12,15,
                                       3,1,16, 16,17,3, 3,10,17,
                                       1,12,16, 15,14,18, 18,19,14,
                                       18,19,20, 19,20,21, 20,21,22,
                                       21,22,23, 16,23,22, 17,16,23,
                                       23,10,17, 22,12,16, 18,15,20,
                                       19,14,21, 21,23,10, 10,14,21,
                                       22,20,15, 15,12,22]);

var deerBodyNormals = new Float32Array([0.00,1.00,0.00,
-0.00,1.00,-0.00,0.60,0.80,0.00,0.60,0.80,0.00,
0.98,0.22,0.00,0.98,0.22,0.00,0.55,-0.83,-0.00,
0.55,-0.83,0.00,-0.00,0.32,-0.95,-0.00,0.32,-0.95,
0.00,0.32,0.95,0.00,0.32,0.95,0.23,0.31,-0.92,
0.23,0.31,0.92,0.24,0.05,-0.97,0.05,-0.08,-1.00,
0.05,-0.08,1.00,0.24,0.05,0.97,-0.00,-0.09,-1.00,
0.00,-0.09,1.00,-0.00,-1.00,-0.00,0.00,-1.00,0.00,
-0.00,-0.09,-1.00,0.00,-0.09,1.00,-0.06,1.00,-0.00,
-0.06,1.00,-0.00,-0.18,0.31,-0.93,-0.18,0.31,0.93,
0.08,-1.00,-0.00,0.08,-1.00,0.00,-0.53,-0.85,-0.00,
-0.53,-0.85,0.00,-1.00,0.00,-0.00,-1.00,0.00,0.00,
-0.60,0.80,0.00,-0.60,0.80,-0.00,-0.15,0.48,-0.86,
-0.15,0.48,0.86,-0.13,-0.21,0.97,-0.13,-0.21,-0.97,
-0.14,0.00,-0.99,-0.11,-0.09,-0.99,-0.09,0.00,1.00,
-0.14,-0.09,0.99]);

var deerHeadVertices = new Float32Array([0,0,0 , .45,0,0, 0.15,0,.2,
                                         .3,0,.2, .2,0,.5, .3,0,.5,
                                         0,.3,-0.1 , .45,.3,-0.1, .05,.3,-0.1,
                                        .40,.3,-0.1, -0.05,.4,-0.05 ,.50,.4,-0.05,
                                        .2,0.05,.47, .3,0.05,.47, 0,0.1,.1,
                                        .45,0.1,.1, 0,.3,-.05 , .45,.3,-.05,
                                        0,.3,-.05 , .45,.3,-.05,
                                      ]);

var deerHeadIndices = new Uint16Array([0,1,2,
                                       1,2,3,
                                       2,3,4,
                                       3,4,5,
                                       0,1,6,
                                       1,6,7,
                                       6,8,10,
                                       7,9,11,
                                       5,4,12,
                                       5,13,12,
                                       12,4,14,
                                       3,5,15,
                                       15,13,5,
                                       14,2,4,
                                       14,0,2,
                                       15,3,1,
                                       7,15,1,
                                       6,14,0,
                                       6,14,16,
                                       7,15,17,
                                       16,17,6,
                                       6,7,17,
                                       17,14,15,
                                       16,14,17,
                                       15,14,12,
                                       15,12,13
                                       ]);
var deerHeadNormals = new Float32Array([-0.00,-1.00,-0.00 ,
                                        0.00,-1.00,0.00   ,-0.60,-0.80,-0.00,-0.60,-0.80,-0.00,
                                        -0.98,-0.22,-0.00 ,-0.98,-0.22,-0.00,-0.55,0.83,0.00,
                                        -0.55,0.83,-0.00  ,0.00,-0.32,0.95  ,0.00,-0.32,0.95,
                                        -0.00,-0.32,-0.95 ,-0.00,-0.32,-0.95,-0.23,-0.31,0.92,
                                        -0.23,-0.31,-0.92 ,-0.24,-0.05,0.97 ,-0.05,0.08,1.00,
                                        -0.05,0.08,-1.00  ,-0.24,-0.05,-0.97,0.00,0.09,1.00,
                                        0.00,0.09,-1.00   ,0.00,1.00,0.00   ,-0.00,1.00,-0.00,
                                        0.00,0.09,1.00    ,-0.00,0.09,-1.00 ,0.06,-1.00,0.00,
                                        0.06,-1.00,0.00]);


function initDeer(parent,resources){
    var deer;
    var body;
    var brown = [.6,.3,.1,1];
    var temp;
    //Deer


    deer = parent.push(sg.translate(0,1.15,0))
    deer = deer.push(sg.rotateX(0));
    //body
    var deerBodyModel = {
      position: deerBodyVertices,
      index: deerBodyIndices,
      normal: deerBodyNormals,
      texture: []
    };
    for(var i = 0; i < deerBodyModel.index.length; i++){
      deerBodyModel.texture.push(0);
      deerBodyModel.texture.push(0);
      deerBodyModel.texture.push(1);
      deerBodyModel.texture.push(0);
      deerBodyModel.texture.push(1);
      deerBodyModel.texture.push(1);
    }

    body = deer.push(sg.translate(20,0,0));
    temp = body.push(sg.rotateY(90));
    temp = temp.push(sg.scale(1.3,1.3,1.3));
    temp = temp.push(new SetUniformSGNode("u_enableObjectTexture",true));
    temp = temp.push(new AdvancedTextureSGNode(resources.snowFloor));
    temp = temp.push(new NoAllocRenderSGNode(modelRenderer(deerBodyModel)));
    temp.push(new SetUniformSGNode("u_enableObjectTexture", false));
    //neck
    temp = body.push(sg.translate(0.35,0.9,0.35));
    temp = temp.push(sg.rotateX(-40));
    temp = temp.push(sg.scale(.25,.25,.5));
    temp.push(new NoAllocRenderSGNode(cubeRenderer(brown)));
    //node.push(new NoAllocRenderSGNode(cylinderRenderer()));

    //head
   var deerHeadModel = {
      position: deerHeadVertices,
      index:    deerHeadIndices,
      normal:   deerHeadNormals,
      texture: []
    };
    for(var i = 0; i < deerHeadModel.index.length/3; i++){
      deerHeadModel.texture.push(0);
      deerHeadModel.texture.push(0);
      deerHeadModel.texture.push(0);
      deerHeadModel.texture.push(1);
      deerHeadModel.texture.push(1);
      deerHeadModel.texture.push(0);
    }

    temp = body.push(sg.translate(0,1,.40));
    temp = temp.push(sg.rotateX(30));
    temp = temp.push(sg.scale(1.5,1.5,1.5));
    temp = temp.push(new SetUniformSGNode("u_enableObjectTexture", true));
    temp = temp.push(new AdvancedTextureSGNode(resources.snowFloor));
    temp = temp.push(new NoAllocRenderSGNode(modelRenderer(deerHeadModel)));
    temp.push(new SetUniformSGNode("u_enableObjectTexture", false));

    // right front leg
    temp = body.push(sg.rotateX(-25));
    temp = temp.push(new AnimationSGNode(genericAnimator(1000,500,1000,[0,0.25,0],[-20,0,0])));
    temp = temp.push(sg.translate(0,.1,-.1));
    temp = temp.push(sg.rotateX(5));
    node = temp.push(sg.scale(0.25,0.8,0.3));
    node.push(new NoAllocRenderSGNode(cubeRenderer(brown)));
    temp = temp.push(new AnimationSGNode(genericAnimator(1000,500,1000,[0,-.35,0],[-60,0,0])));
    temp = temp.push(sg.translate(0,-0.4,-.4));
    temp = temp.push(sg.rotateX(80));
    node = temp.push(sg.scale(.15,1.,.15));
    node.push(new NoAllocRenderSGNode(cubeRenderer(brown)));
    temp = temp.push(new AnimationSGNode(genericAnimator(1000,500,1000,[0,-.40,0.03],[30,0,0])));
    temp = temp.push(sg.translate(0,-.45,0.05));
    temp = temp.push(sg.rotateX(-25));
    node = temp.push(sg.scale(.2,0.1,.3));
    node.push(new NoAllocRenderSGNode(cubeRenderer(brown)));
    //left front leg

    temp = body.push(sg.rotateX(-25));
    temp = temp.push(new AnimationSGNode(genericAnimator(2000,500,1000,[0,0.25,0],[-20,0,0])));
    temp = temp.push(sg.translate(.7,.1,-.1));
    temp = temp.push(sg.rotateX(5));
    node = temp.push(sg.scale(0.25,0.8,0.3));
    node.push(new NoAllocRenderSGNode(cubeRenderer(brown)));
    temp = temp.push(new AnimationSGNode(genericAnimator(2000,500,1000,[0,-.35,0],[-60,0,0])));
    temp = temp.push(sg.translate(0,-0.4,-.4));
    temp = temp.push(sg.rotateX(80));
    node = temp.push(sg.scale(.15,1.,.15));
    node.push(new NoAllocRenderSGNode(cubeRenderer(brown)));
    temp = temp.push(new AnimationSGNode(genericAnimator(2000,500,1000,[0,-.40,0.03],[30,0,0])));
    temp = temp.push(sg.translate(0,-.45,0.05));
    temp = temp.push(sg.rotateX(-25));
    node = temp.push(sg.scale(.2,0.1,.3));
    node.push(new NoAllocRenderSGNode(cubeRenderer(brown)));


    //right hind leg
    temp = body.push(sg.translate(0,.25,-1.7));
    temp = temp.push(new AnimationSGNode(genericAnimator(0,500,1000,[0,0,0],[50,0,0])));
    temp = temp.push(sg.rotateX(-50));
    node = temp.push(sg.scale(.2,.7,.6));
    node.push(new NoAllocRenderSGNode(cubeRenderer(brown)));

    temp = temp.push(sg.translate(0,-0.3,-.2));
    temp = temp.push(new AnimationSGNode(genericAnimator(0,500,1000,[0,0,.30],[40,0,0])));
    temp = temp.push(sg.rotateX(-30));
    node = temp.push(sg.scale(.2,.2,1));
    node.push(new NoAllocRenderSGNode(cubeRenderer(brown)));

    temp = temp.push(sg.rotateX(-20));
    temp = temp.push(sg.translate(0,-.4,-.5));
    temp = temp.push(new AnimationSGNode(genericAnimator(0,500,1000,[0,0.35,0.15],[50,0,0])));
    temp = temp.push(sg.rotateX(100));
    node = temp.push(sg.scale(.15,.15,0.95));
    node.push(new NoAllocRenderSGNode(cubeRenderer(brown)));

    temp = temp.push(sg.translate(0,0.075,0.5));
    temp = temp.push(new AnimationSGNode(genericAnimator(0,500,1000,[0,-0.05,-.03],[-80,0,0])));
    temp = temp.push(sg.rotateX(60));
    node = temp.push(sg.scale(.15,.25,.1));
    node.push(new NoAllocRenderSGNode(cubeRenderer(brown)));


    //left hind leg
    temp = body.push(sg.translate(0.7,.25,-1.7));
    temp = temp.push(new AnimationSGNode(genericAnimator(2000,500,1000,[0,0,0],[50,0,0])));
    temp = temp.push(sg.rotateX(-50));
    node = temp.push(sg.scale(.2,.7,.6));
    node.push(new NoAllocRenderSGNode(cubeRenderer(brown)));

    temp = temp.push(sg.translate(0,-0.3,-.2));
    temp = temp.push(new AnimationSGNode(genericAnimator(2000,500,1000,[0,0,.30],[40,0,0])));
    temp = temp.push(sg.rotateX(-30));
    node = temp.push(sg.scale(.2,.2,1));
    node.push(new NoAllocRenderSGNode(cubeRenderer(brown)));

    temp = temp.push(sg.rotateX(-20));
    temp = temp.push(sg.translate(0,-.4,-.5));
    temp = temp.push(new AnimationSGNode(genericAnimator(2000,500,1000,[0,0.35,0.15],[50,0,0])));
    temp = temp.push(sg.rotateX(100));
    node = temp.push(sg.scale(.15,.15,0.95));
    node.push(new NoAllocRenderSGNode(cubeRenderer(brown)));

    temp = temp.push(sg.translate(0,0.075,0.5));
    temp = temp.push(new AnimationSGNode(genericAnimator(2000,500,1000,[0,-0.05,-.03],[-80,0,0])));
    temp = temp.push(sg.rotateX(60));
    node = temp.push(sg.scale(.15,.25,.1));
    node.push(new NoAllocRenderSGNode(cubeRenderer(brown)));

    //tail
    temp = body.push(sg.translate(0.3,.8,-2));
    temp = temp.push(sg.rotateX(60));
    node = temp.push(sg.scale(.1,.1,.1));
    node.push(new NoAllocRenderSGNode(cubeRenderer(brown)));
}
