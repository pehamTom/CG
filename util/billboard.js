//TODO consider texture mapping
class Billboard {
	constructor(pos, width, height) {
		this.pos = vec3.copy([], pos);
		this.width = width/2;
		this.height = height/2;
		this.verts = new Float32Array(12);
		this.planeVec = [0,0,0]; //for caching
		this.vec = [0,0,0]; //for caching
	}

	update() {
		this.planeVec[0] = this.pos[2] - camera.pos[2];
		this.planeVec[1] = 0;
		this.planeVec[2] = camera.pos[0] - this.pos[0];
		vec3.normalize(this.planeVec, this.planeVec);
		vec3.scale(this.planeVec, this.planeVec, this.width)
		vec3.add(this.vec, this.pos, this.planeVec);
		this.verts[0] = this.vec[0];
		this.verts[1] = this.vec[1] + this.height;
		this.verts[2] = this.vec[2];

		this.verts[6] = this.vec[0];
		this.verts[7] = this.vec[1] - this.height;
		this.verts[8] = this.vec[2];

		vec3.sub(this.vec, this.pos, this.planeVec);
		this.verts[3] = this.vec[0];
		this.verts[4] = this.vec[1] + this.height;
		this.verts[5] = this.vec[2];


		this.verts[9] = this.vec[0];
		this.verts[10] = this.vec[1] - this.height;
		this.verts[11] = this.vec[2];

	}
}

//TODO: add textures
function billboardRenderer(pos, width, height, color) {
	var vertexBuffer, colorBuffer;
	var billBoard = new Billboard(pos, width, height);
	var billBoardColors = new Float32Array([
		color[0], color[1], color[2], color[3],
		color[0], color[1], color[2], color[3],
		color[0], color[1], color[2], color[3],
		color[0], color[1], color[2], color[3]
	]);

	function init() {
		vertexBuffer = gl.createBuffer();
		colorBuffer = setupStaticArrayBuffer(billBoardColors);
	}

	return function(context) {
		billBoard.update();
		if(vertexBuffer == null) init();
		let shader = context.shader;
		let gl = context.gl;
		setDynamicArrayBufferData(vertexBuffer, billBoard.verts);
		let positionLoc = gl.getAttribLocation(shader, "a_position");
        gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false,0,0) ;
        gl.enableVertexAttribArray(positionLoc);


		gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        let colorLoc = gl.getAttribLocation(shader, "a_color");
        gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false,0,0) ;
        gl.enableVertexAttribArray(colorLoc);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	}
}
