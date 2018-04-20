
function setArrayBufferFloat(buffer, bufferLoc, numElems) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(bufferLoc, numElems, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(bufferLoc);
}

function setArrayBufferFloatInstanced(buffer, bufferLoc, numElems, numInstances) {
    setArrayBufferFloat(buffer, bufferLoc, numElems);
    ext.vertexAttribDivisorANGLE(bufferLoc, numInstances);
}

function setupStaticArrayBuffer(bufferData) {
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, bufferData, gl.STATIC_DRAW);
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
