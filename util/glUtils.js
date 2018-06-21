/**
* This file contains various functions / objects / classes that are useful for
* working with opengl
**/

/**
* Function that binds a buffer to an attribute in the currently bound shader program
* and activates it.
* The function assumes that content is tightly packed (stride = 0 & offset = 0)
* @param buffer - buffer to bind
* @param bufferLoc - attribute location to bind buffer to
* @param numElems - number of elements in the buffer (a buffer with triangle data
*                    would have #floats/3 as the number of elements)
**/
function setArrayBufferFloat(buffer, bufferLoc, numElems) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(bufferLoc, numElems, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(bufferLoc);
}

/**
* Similar to setArrayBufferFloat but sets the attribute divisor of the buffer being set
* @param buffer - buffer to bind
* @param bufferLoc - attribute location to bind buffer to
* @param numElems - number of elements in the buffer (a buffer with triangle data
*                    would have #floats/3 as the number of elements)
* @param divisor - attribute divisor of the buffer (0 -> same for all instances; 1 -> different for every instance)
**/
function setArrayBufferFloatInstanced(buffer, bufferLoc, numElems, divisor) {
    setArrayBufferFloat(buffer, bufferLoc, numElems);
    gl.vertexAttribDivisor(bufferLoc, divisor);
}

/**
* Sets up an array buffer whose data doesn't change. Creates a buffer, writes the data
* and returns the bufferindex
* @param bufferData - data to be written into the buffer
* @returns bufferindex of the created buffer
**/
function setupStaticArrayBuffer(bufferData) {
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, bufferData, gl.STATIC_DRAW);
    return buffer;
}

/**
* Similar to setupStaticArrayBuffer but creates an ELEMENT_ARRAY_BUFFER instead
* @param bufferData - data to be written into the buffer
* @returns bufferindex of the created buffer
**/
function setUpStaticElementBuffer(bufferData) {
    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, bufferData, gl.STATIC_DRAW);
    return buffer;
}

/**
* Write data into static array buffer. Sets buffer data with STATIC_DRAW flag
* @param buffer - buffer to write data into
* @param data - data to write
**/
function setStaticArrayBufferData(buffer, data) {
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
}

/**
* Write data into dynamic array buffer. Sets buffer data with DYNAMIC_DRAW flag
* @param buffer - buffer to write data into
* @param data - data to write
**/
function setDynamicArrayBufferData(buffer, data) {
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
}

/**
* Create WebGL2 context. This is actually pretty much identical to the createWebGlContext
* function in the lab framework. A webgl2 context is needed for the particle effects
* as they are drawn using instanced rendering, a feature not present in webgl1
**/
function createWebGL2Context(width, height) {
  var canvas = document.createElement('canvas');
  canvas.width = width || 400;
  canvas.height = height || 400;
  document.body.appendChild(canvas);
  createHtmlText(canvas)
  return canvas.getContext('webgl2');
}


//TODO: ADD TEXTURES
//convenience function for drawing a unit cube.
function cubeRenderer() {
    let s = 0.5;

    var cubeVertices = new Float32Array([
       -s,-s,-s, s,-s,-s, s, s,-s, -s, s,-s,
       -s,-s, s, s,-s, s, s, s, s, -s, s, s,
       -s,-s,-s, -s, s,-s, -s, s, s, -s,-s, s,
       s,-s,-s, s, s,-s, s, s, s, s,-s, s,
       -s,-s,-s, -s,-s, s, s,-s, s, s,-s,-s,
       -s, s,-s, -s, s, s, s, s, s, s, s,-s,
    ]);

    var cubeNormals = new Float32Array([
        0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1,
        0,0,1, 0,0,1, 0,0,1, 0,0,1,
        -1,0,0, -1,0,0, -1,0,0, -1,0,0,
        1,0,0, 1,0,0, 1,0,0, 1,0,0,
        0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0,
        0,1,0, 0,1,0, 0,1,0, 0,1,0
    ])

    var cubeIndices =  new Uint16Array([
       0,1,2, 0,2,3,
       4,5,6, 4,6,7,
       8,9,10, 8,10,11,
       12,13,14, 12,14,15,
       16,17,18, 16,18,19,
       20,21,22, 20,22,23
    ]);

    var cubeTextureCoords = new Float32Array([
      0,0, 0,1, 1,1, 1,0,
      0,0, 0,1, 1,1, 1,0,
      0,0, 0,1, 1,1, 1,0,
      0,0, 0,1, 1,1, 1,0,
      0,0, 0,1, 1,1, 1,0,
      0,0, 0,1, 1,1, 1,0
    ])

    var cubeVertexBuffer, cubeNormalBuffer, cubeIndexBuffer;

    /**
    * Initiallize the buffers on the gpu
    **/
    function init() {
        cubeVertexBuffer = setupStaticArrayBuffer(cubeVertices);

        cubeNormalBuffer = setupStaticArrayBuffer(cubeNormals);

        cubeIndexBuffer = setUpStaticElementBuffer(cubeIndices);

        cubeTextureBuffer = setupStaticArrayBuffer(cubeTextureCoords);
    }

    /**
    * This function does the actual rendering. This function can be passed to a
    * RenderSGNode which takes care of the correct rendering
    **/
    return function(context) {
        if(cubeVertexBuffer == null) {
            init();
        }
        let shader = context.shader;
        let gl = context.gl;

        let positionLoc = gl.getAttribLocation(shader, "a_position");
        let normalLoc = gl.getAttribLocation(shader, "a_normal");
        let texCoordLoc = gl.getAttribLocation(shader, "a_texCoord");


        setArrayBufferFloat(cubeVertexBuffer, positionLoc, 3);

        setArrayBufferFloat(cubeNormalBuffer, normalLoc, 3);

        setArrayBufferFloat(cubeTextureBuffer, texCoordLoc, 2);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
        gl.drawElements(gl.TRIANGLES, cubeIndices.length, gl.UNSIGNED_SHORT, 0); //LINE_STRIP
    }
}

/**
* This SGNode is a slight improvement on the SGNode provided by the framework. The
* RenderSGNode allocates storage space for a new matrix each time the render function
* is called. This SGNode caches the matrices in a variable whose storage space is reused.
* Usually this wouldn't really matter, but since the particle system uses quite some storage
* space, when many allocations happen per frame the browsers garbage collector is called
* often which kills the applications performance and introduces quite noticable lags.
*
* Furthermore this Node disables the vertexAttribArray for the texture coordinates
* in the shader after rendering. If we wouldn't disable the texture attribute the
* attribute would remain valid and objects that do not provide texture coordinates
* wouldn't be draw correctly even if the texture coordinates are never used.
**/
class NoAllocRenderSGNode extends RenderSGNode {

    /**
    * Constructor that creates the matrices for caching
    **/
    constructor(renderer, children) {
        super(renderer, children)
        this.modelView = mat4.create();
        this.normalMatrix = mat3.create();
    }

    /**
    * Works similar to setTransformationUniforms of the RenderSGNode but calculates
    * the matrix multiplications without creating new matrices
    * @param context - the webgl context
    **/
    setTransformationUniforms(context) {
        //set matrix uniforms
        mat4.multiply(this.modelView, context.viewMatrix, context.sceneMatrix);
        mat3.normalFromMat4(this.normalMatrix, this.modelView);
        const projectionMatrix = context.projectionMatrix;
        const gl = context.gl;
        const shader = context.shader;
        gl.uniformMatrix4fv(gl.getUniformLocation(shader, 'u_modelView'), false, this.modelView);
        gl.uniformMatrix3fv(gl.getUniformLocation(shader, 'u_normalMatrix'), false, this.normalMatrix);
        gl.uniformMatrix4fv(gl.getUniformLocation(shader, 'u_projection'), false, projectionMatrix);
    }

    /**
    * Renders underlying object and disables texture coordinates afterwards
    * @param context - the webgl context
    **/
    render(context){
        super.render(context);
        gl.disableVertexAttribArray(gl.getAttribLocation(context.shader, "a_texCoord"));
    }
}

/**
  * Scenegraph node for transformations that should change with time (they don't have to).
  * This is done by providing a function to the SGNode with which to recompute the
  * transformation matrix each frame.
  **/
class AnimationSGNode extends SGNode {

    /**
    * Construcor
    * @param calcMatrixFunc function that takes no parameters and returns a matrix (mat4)
    * @param children
    **/
    constructor(calcMatrixFunc, children) {
        super(children);
        this.calcMatrix = calcMatrixFunc;
        this.transForm = mat4.create(); //cache so no new matrix is allocated
    }

    render(context) {
        var previous = context.sceneMatrix;

        //compute the transformation matrix before rendering
        if(previous === null) {
            context.sceneMatrix = this.calcMatrix();
        } else {
            context.sceneMatrix = mat4.multiply(this.transForm, previous, this.calcMatrix());
        }

        super.render(context);
        context.sceneMatrix = previous;
    }
}

var doorAnimator = function(endTime) {
    var endTime = endTime;
    var elapsed = 0;
    var rotateQuat = quat.rotateY([], quat.create(), Math.PI/2);
    var beginQuat = quat.create();
    var trans3 = glm.translate(3.98, 0.89952, -3.61681);
    var interpolatedQuat = quat.create();
    var trans1 = glm.translate(0, 0, 0.72335);
    var trans2 = glm.translate(0, 0, -0.72235);
    var rotate = mat4.create();
    var transForm = mat4.create();
    var animate = false;
    timeEventQueue.push({timeStamp: 10000, fire: function(){ animate = true}});

    resetQueue.push({reset: function() {
        elapsed = 0;
        rotateQuat = quat.rotateY([], quat.create(), Math.PI/2);
        beginQuat = quat.create();
        animate = false;
    }});
    function reverse() {
        const h = beginQuat;
        beginQuat = rotateQuat;
        rotateQuat = h;
        elapsed = 0;
    };

    return function() {
        if(! animate) return trans3;
        elapsed += timer.delta;
        let t = elapsed / endTime;
        if(t > 1 ) {
            return transForm;
            t = 0;
        };
        quat.slerp(interpolatedQuat, beginQuat, rotateQuat, t);
        mat4.fromQuat(rotate, interpolatedQuat);
        mat4.copy(transForm, identityMat);
        mat4.multiply(transForm, transForm, trans3);
        mat4.multiply(transForm, transForm, trans2);
        mat4.multiply(transForm, transForm, rotate);
        mat4.multiply(transForm, transForm, trans1);
        return transForm;
    }
}
var transAnimator = function(startTime,duration,destination){
  var endTime = duration;
  var elapsed = 0;
  var animate = false;
  var destination = destination;
  var start = vec3.create();
  var transformation = vec3.create();

  timeEventQueue.push({timeStamp: startTime, fire: function(){ animate = true}});

  resetQueue.push({ reset:function(){
    elapsed = 0;
  }});

  function reverse() {
      const h = start;
      start = destination;
      destination = h;
      elapsed = 0;
  };

  return function(){
    if(animate)
    elapsed += timer.delta;
    var t = elapsed/duration;
    if(t > 1){
      reverse();
    }
    vec3.lerp(transformation,start,destination,t)
    return glm.translate(transformation[0],transformation[1],transformation[2]);
  }
}


var genericAnimator = function(startTime,reverseDuration,duration, rotpoint, angles){
  var endTime = duration;
  var duration = duration;
  var reverseDuration = reverseDuration;
  var elapsed = 0;
  var isreversing = false;
  var rotateQuat = quat.create();
  var beginQuat = quat.create();
  var interpolatedQuat = quat.create();
  var inversRotpoint = vec3.negate([], rotpoint);
  var trans1 = glm.translate(inversRotpoint[0],inversRotpoint[1],inversRotpoint[2]);
  var trans2 = glm.translate(rotpoint[0],rotpoint[1],rotpoint[2]);

  var rotate = mat4.create();
  var transForm = mat4.create();
  var animate = false;
  timeEventQueue.push({timeStamp: startTime, fire: function(){ animate = true}});

  quat.identity(rotateQuat);

  quat.rotateX(rotateQuat,rotateQuat, angles[0]*Math.PI/180);
  quat.rotateY(rotateQuat,rotateQuat, angles[1]*Math.PI/180);
  quat.rotateZ(rotateQuat,rotateQuat, angles[2]*Math.PI/180);
  quat.normalize(rotateQuat,rotateQuat);

  resetQueue.push({reset: function() {
      elapsed = 0;
      quat.rotateX(rotateQuat,quat.create(), angles[0]*Math.PI/180);
      quat.rotateY(rotateQuat,rotateQuat, angles[1]*Math.PI/180);
      quat.rotateZ(rotateQuat,rotateQuat, angles[2]*Math.PI/180);
      quat.normalize(rotateQuat,rotateQuat);
      beginQuat = quat.create();
      animate = false;
  }});
  function reverse() {
      if(isreversing){
        endTime = reverseDuration;
        isreversing = false;
      }else{
        endTime = duration;
        isreversing = true;
      }
      const h = beginQuat;
      beginQuat = rotateQuat;
      rotateQuat = h;
      elapsed = 0;
  };

  return function() {
      if(! animate)return glm.translate(0,0,0);

      elapsed += timer.delta;
      let t = elapsed / endTime;
      if(t > 1 ) {
          reverse();
          t = 0;
      };
      quat.slerp(interpolatedQuat, beginQuat, rotateQuat, t);
      mat4.fromQuat(rotate, interpolatedQuat);
      mat4.copy(transForm, identityMat);

      mat4.multiply(transForm, transForm, trans2);
      mat4.multiply(transForm, transForm, rotate);
      mat4.multiply(transForm, transForm, trans1);
      return transForm;

  }
}


var identityMat = mat4.create();

/**
*returns matrix that performs rotation around points*/
let cachedMat = [];
let cachedVec = [];
function rotateAroundPoint(point, rad, rotation){
    let transForm = mat4.copy(cachedMat, identityMat);
    let transVec = vec3.copy(cachedVec, point);

    mat4.translate(transForm, transForm, point);
    mat4.rotate(transForm, transForm, rad, rotation);
    mat4.translate(transForm, transForm, vec3.negate(transVec, transVec));
    return transForm;
}

/**
* convenience function that creates a MaterialSGNode and sets it's material
* properties to those of the material being passed into the function
* @param material - material to copy properties from
* @return a new MaterialSGNode
**/
function initMaterialSGNode(material) {

    mat = new MaterialSGNode();
    mat.ambient = material.ambient;
    mat.diffuse = material.diffuse;
    mat.specular = material.specular;
    mat.emission = material.emission;
    mat.shininess = material.shininess;
    return mat;
}

/**
* Constructor function for a material (call with new to create material)
* @param ambient - vec4
* @param diffuse - vec4
* @param specular - vec4
* @param emission - vec4
* @param shininess - float
**/
function Material(ambient, diffuse, specular, emission, shininess) {
    this.ambient = ambient;
    this.diffuse = diffuse;
    this.specular = specular;
    this.emission = emission;
    this.shininess = shininess;
}

/**
* convenience function that creates a material that is not affected by light
* sources. This is achieved by setting the materials emission to the color
* of the parameter and all other material properties tp [0,0,0,1] (black)
* @param color - vec4 to set the materials emission property to
**/
function constantColorMaterial(color) {
    return new Material([0,0,0,1], [0,0,0,1], [0,0,0,1], color, 0);
}
