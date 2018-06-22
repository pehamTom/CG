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

var deerBodyNormals = new Float32Array([-0.24,-0.59,-0.47,
                                        0.00,-0.84,-0.47,
                                        -0.14,-0.76,0.39,
                                        0.03,-0.88,0.45,
                                        -0.50,-0.56,-0.36,
                                        -0.69,-0.49,0.26,
                                        -0.70,-0.01,-0.34,
                                        -0.62,0.29,0.32,
                                        -0.25,0.60,-0.38,
                                        -0.17,0.54,0.52,
                                        0.05,-0.08,1.02,
                                        -0.09,-0.12,1.17,
                                        0.05,-0.18,-0.79,
                                        -0.09,-0.14,-1.12,
                                        -0.00,0.61,0.26,
                                        0.05,0.50,-0.61,
                                        0.28,-0.65,-0.40,
                                        0.32,-0.81,0.35,
                                        0.21,0.56,-0.15,
                                        0.33,0.87,0.20,
                                        0.52,0.55,-0.35,
                                        0.57,0.28,0.43,
                                        0.59,-0.15,-0.40,
                                        0.62,-0.45,0.29]);

var deerBodyTextureCoord = new Float32Array([0.483,0.628,0,0,0,1, 0,0,0,1,0.483,0.628, 0,0,0.400,0.800,0,1,
0,0,0.400,0.200,0,1, 0.498,0.541,0,0,0,1, 0,0,0,1,0.498,0.459,
0,0,0,1,0.319,0.885, 0,0,0,1,0.319,0.115, 0,0,0.230,0.944,0,1,
0,0,0,1,0.230,0.056, 0,0,0.230,0.944,0,1, 0,0,0,1,0.230,0.056,
0,0,0.520,0.640,0,1, 0,0,0.520,0.360,0,1, 0,0,0.315,0.212,0,1,
0,0,0.332,0.000,0,1, 0,0,0.299,0.099,0,1, 0,0,0.315,0.212,0,1,
0.380,0.550,0,0,0,1, 0.380,0.550,0,0,0,1, 0,0,0.449,0.281,0,1,
0,0,0,1,0.449,0.281, 0,0,0,1,0.468,0.677, 0,0,0,1,0.468,0.677,
0,0,0.502,0.206,0,1, 0,0,0.201,0.083,0,1, 0.177,0.032,0,0,0,1,
0.177,0.032,0,0,0,1, 0,0,0.749,0.115,0,1, 0,0,0.334,0.205,0,1,
0.453,0.288,0,0,0,1, 0,0,0,1,0.453,0.712, 0.500,0.500,0,0,0,1,
0,0,0,1,0.500,0.500, 0,0,0,1,0.600,0.400, 0.400,0.400,0,0,0,1,
0,0,0,1,0.152,0.186, 0,0,0,1,0.152,0.186, 0.164,0.592,0,0,0,1,
0.164,0.592,0,0,0,1, 0,0,0.255,0.084,0,1, 0,0,0.468,0.160,0,1,
0,0,0.232,0.110,0,1, 0,0,0.430,0.198,0,1]);


var deerHeadVertices = new Float32Array([0,0,0 , .45,0,0, 0.15,0,.2,
                                         .3,0,.2, .2,0,.5, .3,0,.5,
                                         0,.3,-0.1 , .45,.3,-0.1, .05,.3,-0.1,
                                        .40,.3,-0.1, -0.05,.4,-0.05 ,.50,.4,-0.05,
                                        .2,0.05,.47, .3,0.05,.47, 0,0.1,.1,
                                        .45,0.1,.1, 0,.3,-.05 , .45,.3,-.05
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
var deerHeadNormals = new Float32Array([-0.42,-0.46,-0.11,
                                        0.21,-0.60,-0.25,
                                        -0.21,-0.98,0.07,
                                        0.21,-1.07,0.12,
                                        -0.24,-0.61,0.31,
                                        0.24,-0.24,0.48,
                                        -0.25,0.23,-0.33,
                                        0.35,0.27,-0.43,
                                        0.35,0.72,-1.33,
                                        0.35,1.17,-2.22,
                                        0.35,1.61,-3.12,
                                        0.35,2.06,-4.01,
                                        -0.09,0.28,-0.42,
                                        0.26,0.01,0.23,
                                        -0.48,-0.10,0.35,
                                        0.46,-0.32,0.22,
                                        -0.18,0.43,0.34,
                                        0.16,0.73,0.39]);

var deerHeadTextureCoord = new Float32Array([ 0,0,0,1,0.444,0.333, 0,0,0,1,0.231,0.654, 0,0,0.486,0.081,0,1,
0,0,0,1,0.300,0.900, 0.470,0.669,0,0,0,1, 0,0,0,1,0.470,0.331,
0.248,0.222,0,0,0,1, 0.248,0.222,0,0,0,1, 0,0,0.435,0.746,0,1,
0,0,0.435,0.254,0,1, 0.098,0.081,0,0,0,1, 0.281,0.623,0,0,0,1,
0,0,0.099,0.912,0,1, 0,0,0.239,0.381,0,1, 0.466,0.320,0,0,0,1,
0.466,0.680,0,0,0,1, 0,0,0.400,0.800,0,1, 0,0,0.400,0.800,0,1,
0,0,0,1,0.125,0.125, 0,0,0,1,0.125,0.125, 0.110,0.988,0,0,0,1,
0,0,0.110,0.988,0,1, 0,0,0,1,0.425,0.236, 0.425,0.236,0,0,0,1,
0,0,0,1,0.830,0.556, 0,0,0,1,0.185,0.876]);
var deerBodyModel = null;
var deerHeadModel = null;

function initDeer(parent,resources){
    var deer;
    var body;
    var brown = [.6,.3,.1,1];
    var temp;
    //Deer
    if(deerBodyModel == null){
      initDeerBodyModel();
    }

    if(deerHeadModel == null){
      initDeerHeadModel();
    }
    deer = parent.push(sg.translate(0,1.15,0))
    deer = deer.push(sg.rotateX(0));
    //body


    body = deer.push(sg.translate(0,0,0));
    body = body.push(new SetUniformSGNode("u_enableObjectTexture",true));
    body = body.push(new AdvancedTextureSGNode(resources.deerSkin));
    temp = body.push(sg.rotateY(90));
    node = temp.push(sg.scale(1.3,1.3,1.3));
    node = node.push(new NoAllocRenderSGNode(modelRenderer(deerBodyModel)));
    //neck
    temp = body.push(sg.translate(0.35,0.9,0.35));
    temp = temp.push(sg.rotateX(-40));
    temp = temp.push(sg.scale(.25,.25,.5));
    temp.push(new NoAllocRenderSGNode(cubeRenderer(brown)));


    // right front leg

    temp = body.push(sg.rotateX(-25));
    temp = temp.push(new AnimationSGNode(genericAnimator(1000,500,1000,[0,0.25,0],[-20,0,0])));
    temp = temp.push(sg.translate(0,.1,-.1));
    temp = temp.push(sg.rotateX(5));
    node = temp.push(sg.scale(0.25,0.8,0.3));
    node.push(new NoAllocRenderSGNode(cubeRenderer()));
    temp = temp.push(new AnimationSGNode(genericAnimator(1000,500,1000,[0,-.35,0],[-60,0,0])));
    temp = temp.push(sg.translate(0,-0.4,-.4));
    temp = temp.push(sg.rotateX(80));
    node = temp.push(sg.scale(.15,1.,.15));
    node.push(new NoAllocRenderSGNode(cubeRenderer()));
    temp = temp.push(new AnimationSGNode(genericAnimator(1000,500,1000,[0,-.40,0.03],[30,0,0])));
    temp = temp.push(sg.translate(0,-.45,0.05));
    temp = temp.push(sg.rotateX(-25));
    node = temp.push(sg.scale(.2,0.1,.3));
    node.push(new NoAllocRenderSGNode(cubeRenderer()));
    //left front leg

    temp = body.push(sg.rotateX(-25));
    temp = temp.push(new AnimationSGNode(genericAnimator(2000,500,1000,[0,0.25,0],[-20,0,0])));
    temp = temp.push(sg.translate(.7,.1,-.1));
    temp = temp.push(sg.rotateX(5));
    node = temp.push(sg.scale(0.25,0.8,0.3));
    node.push(new NoAllocRenderSGNode(cubeRenderer()));
    temp = temp.push(new AnimationSGNode(genericAnimator(2000,500,1000,[0,-.35,0],[-60,0,0])));
    temp = temp.push(sg.translate(0,-0.4,-.4));
    temp = temp.push(sg.rotateX(80));
    node = temp.push(sg.scale(.15,1.,.15));
    node.push(new NoAllocRenderSGNode(cubeRenderer()));
    temp = temp.push(new AnimationSGNode(genericAnimator(2000,500,1000,[0,-.40,0.03],[30,0,0])));
    temp = temp.push(sg.translate(0,-.45,0.05));
    temp = temp.push(sg.rotateX(-25));
    node = temp.push(sg.scale(.2,0.1,.3));
    node.push(new NoAllocRenderSGNode(cubeRenderer()));


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
    node = node.push(new NoAllocRenderSGNode(cubeRenderer(brown)));
    node = node.push(new SetUniformSGNode("u_enableObjectTexture", false));

    //head
    temp = body.push(sg.translate(0,1,.40));
    temp = temp.push(sg.rotateX(30));
    temp = temp.push(sg.scale(1.5,1.5,1.5));
    node = temp.push(new SetUniformSGNode("u_enableObjectTexture", true));
    node = node.push(new AdvancedTextureSGNode(resources.eyes));
    node = node.push(new NoAllocRenderSGNode(modelRenderer(deerHeadModel)));

}

function initDeerBodyModel(){
    let positions = [];
    let normals = [];
    let texture = [];
    deerBodyModel = {
      position: [],
      normal: [],
      texture: []
    };
    for(var i = 0; i < deerBodyIndices.length; i++){
      let idx = deerBodyIndices[i];
      positions.push(deerBodyVertices[idx * 3 + 0]);
      positions.push(deerBodyVertices[idx * 3 + 1]);
      positions.push(deerBodyVertices[idx * 3 + 2]);
      normals.push(deerBodyNormals[   idx * 3 + 0]);
      normals.push(deerBodyNormals[   idx * 3 + 1]);
      normals.push(deerBodyNormals[   idx * 3 + 2]);

    }
    console.log(deerBodyTextureCoord);
    deerBodyModel.position =new Float32Array(positions);
    deerBodyModel.normal =new Float32Array(normals);
    deerBodyModel.texture = new Float32Array(deerBodyTextureCoord);

}

function initDeerHeadModel(){
    let positions = [];
    let normals = [];
    let texture = [];
    deerHeadModel = {
      position: [],
      normal: [],
      texture: []
    };
    for(var i = 0; i < deerHeadIndices.length; i++){
      let idx = deerHeadIndices[i];
      positions.push(deerHeadVertices[idx * 3 + 0]);
      positions.push(deerHeadVertices[idx * 3 + 1]);
      positions.push(deerHeadVertices[idx * 3 + 2]);
      normals.push(deerHeadNormals[idx * 3 + 0]);
      normals.push(deerHeadNormals[idx * 3 + 1]);
      normals.push(deerHeadNormals[idx * 3 + 2]);

    }

    deerHeadModel.position =new Float32Array(positions);
    deerHeadModel.normal =new Float32Array(normals);
    deerHeadModel.texture = new Float32Array(deerHeadTextureCoord);
    console.log(deerHeadModel.texture.length);
}
