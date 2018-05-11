
function setArrayBufferFloat(buffer, bufferLoc, numElems) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(bufferLoc, numElems, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(bufferLoc);
}

function setArrayBufferFloatInstanced(buffer, bufferLoc, numElems, numInstances) {
    setArrayBufferFloat(buffer, bufferLoc, numElems);
    gl.vertexAttribDivisor(bufferLoc, numInstances);
}

function setupStaticArrayBuffer(bufferData) {
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, bufferData, gl.STATIC_DRAW);
    return buffer;
}

function setUpStaticElementBuffer(bufferData) {
    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, bufferData, gl.STATIC_DRAW);
    return buffer;
}

function setStaticArrayBufferData(buffer, data) {
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
}

function setDynamicArrayBufferData(buffer, data) {
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
}

//shader class
function ShaderProgram(vs, fs, varyings) {
    this.program = createTransformFeedbackProgram(gl, vs, fs, varyings);

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

/**
 * creates a program by the given vertex and fragment shader
 * @param gl GL context
 * @param vertex vertex shader or code
 * @param fragment fragment shader or code
 * @returns {WebGLProgram}
 */
function createTransformFeedbackProgram(gl, vertex, fragment, varyings) {
  var program = gl.createProgram();
  gl.attachShader(program, typeof vertex === 'string' ? createShader(gl, vertex, gl.VERTEX_SHADER) : vertex);
  gl.attachShader(program, typeof fragment === 'string' ? createShader(gl, fragment, gl.FRAGMENT_SHADER) : fragment);
  if(varyings != null) {
      gl.transformFeedbackVaryings(program, varyings, gl.SEPARATE_ATTRIBS);
  }
  gl.linkProgram(program);
  var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!linked) {
    // something went wrong with the link
    var lastError = gl.getProgramInfoLog(program);
    console.error('Error in program linking:' + lastError);
    gl.deleteProgram(program);
    return null;
  }
  return program;
}


function createWebGL2Context(width, height) {
  var canvas = document.createElement('canvas');
  canvas.width = width || 400;
  canvas.height = height || 400;
  document.body.appendChild(canvas);
  createHtmlText(canvas)
  return canvas.getContext('webgl2');
}


//convenience function for drawing a unit cube with specified color
function cubeRenderer(color) {
    let s = 0.5;

    var cubeVertices = new Float32Array([
       -s,-s,-s, s,-s,-s, s, s,-s, -s, s,-s,
       -s,-s, s, s,-s, s, s, s, s, -s, s, s,
       -s,-s,-s, -s, s,-s, -s, s, s, -s,-s, s,
       s,-s,-s, s, s,-s, s, s, s, s,-s, s,
       -s,-s,-s, -s,-s, s, s,-s, s, s,-s,-s,
       -s, s,-s, -s, s, s, s, s, s, s, s,-s,
    ]);

    var cubeColors = new Float32Array([
       color[0],color[1],color[2],color[3],
       color[0],color[1],color[2],color[3],
       color[0],color[1],color[2],color[3],
       color[0],color[1],color[2],color[3],
       color[0],color[1],color[2],color[3],
       color[0],color[1],color[2],color[3],
       color[0],color[1],color[2],color[3],
       color[0],color[1],color[2],color[3],
       color[0],color[1],color[2],color[3],
       color[0],color[1],color[2],color[3],
       color[0],color[1],color[2],color[3],
       color[0],color[1],color[2],color[3],
       color[0],color[1],color[2],color[3],
       color[0],color[1],color[2],color[3],
       color[0],color[1],color[2],color[3],
       color[0],color[1],color[2],color[3],
       color[0],color[1],color[2],color[3],
       color[0],color[1],color[2],color[3],
       color[0],color[1],color[2],color[3],
       color[0],color[1],color[2],color[3],
       color[0],color[1],color[2],color[3],
       color[0],color[1],color[2],color[3],
       color[0],color[1],color[2],color[3],
       color[0],color[1],color[2],color[3]
    ]);

    var cubeIndices =  new Float32Array([
       0,1,2, 0,2,3,
       4,5,6, 4,6,7,
       8,9,10, 8,10,11,
       12,13,14, 12,14,15,
       16,17,18, 16,18,19,
       20,21,22, 20,22,23
    ]);

    var cubeVertexBuffer, cubeColorBuffer, cubeIndexBuffer;

    function init() {
        cubeVertexBuffer = setupStaticArrayBuffer(cubeVertices);

        cubeColorBuffer = setupStaticArrayBuffer(cubeColors);

        cubeIndexBuffer = setUpStaticElementBuffer(new Uint16Array(cubeIndices));
    }
    return function(context) {
        if(cubeVertexBuffer == null) {
            init();
        }
        let shader = context.shader;
        let gl = context.gl;

        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
        let positionLoc = gl.getAttribLocation(shader, "a_position");
        gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false,0,0) ;
        gl.enableVertexAttribArray(positionLoc);

        gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorBuffer);
        let colorLoc = gl.getAttribLocation(shader, "a_color");
        gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false,0,0) ;
        gl.enableVertexAttribArray(colorLoc);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
        gl.drawElements(gl.TRIANGLES, cubeIndices.length, gl.UNSIGNED_SHORT, 0); //LINE_STRIP
    }
}

class NoAllocRenderSGNode extends RenderSGNode {
    constructor(renderer, children) {
        super(renderer, children)
        this.modelView = mat4.create();
        this.normalMatrix = mat4.create();
    }

    setTransformationUniforms(context) {
        //set matrix uniforms
        mat4.multiply(this.modelView, context.viewMatrix, context.sceneMatrix);
        mat3.normalFromMat4(this.normalMatrix, this.modelView);
        const projectionMatrix = context.projectionMatrix;
        const gl = context.gl,
          shader = context.shader;
        gl.uniformMatrix4fv(gl.getUniformLocation(shader, 'u_modelView'), false, this.modelView);
        gl.uniformMatrix3fv(gl.getUniformLocation(shader, 'u_normalMatrix'), false, this.normalMatrix);
        gl.uniformMatrix4fv(gl.getUniformLocation(shader, 'u_projection'), false, projectionMatrix);
    }
}

/**
  *Scenegraph node for transformations that should change with time
  *@param calcMatrixFunc function that takes no parameters and returns a matrix
  */
class AnimationSGNode extends SGNode {
    constructor(calcMatrixFunc, children) {
        super(children);
        this.calcMatrix = calcMatrixFunc;
        this.transForm = mat4.create(); //cache so no new matrix is allocated
    }

    render(context) {
        var previous = context.sceneMatrix;

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
            reverse()
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
