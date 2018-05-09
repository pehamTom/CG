
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
