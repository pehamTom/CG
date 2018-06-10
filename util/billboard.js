//TODO consider texture mapping
class Billboard {
	constructor(pos, width, height) {
		this.pos = vec3.copy([], pos);
		this.width = width/2;
		this.height = height/2;
		this.verts = new Float32Array(12);

		this.normals = new Float32Array(12)

		this.texCoords = new Float32Array([
			1,0, 0,0, 1,1, 0,1
		]);

		this.planeVec = [0,0,0]; //for caching
		this.vec = [0,0,0]; //for caching
		this.normalVec = [0, 0, 0];
		this.camDistance = -1;
	}

	update() {
		this.camDistance = vec3.distance(camera.pos, this.pos);

		this.planeVec[0] = this.pos[2] - camera.pos[2];
		this.planeVec[1] = 0;
		this.planeVec[2] = camera.pos[0] - this.pos[0];
		vec3.normalize(this.planeVec, this.planeVec);
		vec3.scale(this.planeVec, this.planeVec, this.width)
		vec3.add(this.vec, this.pos, this.planeVec);

		//left upper corner
		this.verts[0] = this.vec[0];
		this.verts[1] = this.vec[1] + this.height;
		this.verts[2] = this.vec[2];

		//left lower corner
		this.verts[6] = this.vec[0];
		this.verts[7] = this.vec[1] - this.height;
		this.verts[8] = this.vec[2];

		//right upper corner
		vec3.sub(this.vec, this.pos, this.planeVec);
		this.verts[3] = this.vec[0];
		this.verts[4] = this.vec[1] + this.height;
		this.verts[5] = this.vec[2];

		//right lower corner
		this.verts[9] = this.vec[0];
		this.verts[10] = this.vec[1] - this.height;
		this.verts[11] = this.vec[2];

		this.vec[0] = this.verts[0];
		this.vec[1] = this.verts[1];
		this.vec[2] = this.verts[2];

		this.normalVec[0] = this.verts[6];
		this.normalVec[1] = this.verts[7];
		this.normalVec[2] = this.verts[8];

		vec3.sub(this.vec, this.vec, this.normalVec);
		vec3.cross(this.normalVec, this.vec, this.planeVec);
		vec3.normalize(this.normalVec, this.normalVec);

		for(let i = 0; i < 4; i ++) {
			this.normals[i*3] = this.normalVec[0];
			this.normals[i*3+1] = this.normalVec[1];
			this.normals[i*3+2] = this.normalVec[2];
		}

	}
}

function billboardRenderer(pos, width, height, color) {
	var vertexBuffer, colorBuffer, normalBuffer, texCoordBuffer;
	var billBoard = new Billboard(pos, width, height);
	var billBoardColors = new Float32Array([
		color[0], color[1], color[2], color[3],
		color[0], color[1], color[2], color[3],
		color[0], color[1], color[2], color[3],
		color[0], color[1], color[2], color[3]
	]);

	function init() {
		vertexBuffer = gl.createBuffer();
		texCoordBuffer = setupStaticArrayBuffer(billBoard.texCoords);
		normalBuffer = gl.createBuffer();
	}

	return function(context) {
		billBoard.update();
		if(vertexBuffer == null) init();
		let shader = context.shader;
		let gl = context.gl;

		let positionLoc = gl.getAttribLocation(shader, "a_position");
		let normalLoc = gl.getAttribLocation(shader, "a_normal");
		let texCoordLoc = gl.getAttribLocation(shader, "a_texCoord");

		setDynamicArrayBufferData(vertexBuffer, billBoard.verts);
        gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false,0,0) ;
        gl.enableVertexAttribArray(positionLoc);

		setDynamicArrayBufferData(normalBuffer, billBoard.normals);
        gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false,0,0) ;
        gl.enableVertexAttribArray(normalLoc);

		setArrayBufferFloat(texCoordBuffer, texCoordLoc, 2);

		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	}
}


function ForestRenderer(trees) {

	var texCoords = new Float32Array([
		1,0, 0,0, 1,1, 0,1
	]);

	var billBoards = trees;

	var vertexBuffer, normalBuffer, texCoordBuffer;

	function init() {
		vertexBuffer = gl.createBuffer();
		texCoordBuffer = setupStaticArrayBuffer(texCoords);
		normalBuffer = gl.createBuffer();
	}

	return function(context) {

		if(vertexBuffer == null) {
            init();
        }

		billBoards.forEach(function(billBoard) {
			billBoard.update();
		})

		billBoards.sort(function(a, b) {
			return b.camDistance - a.camDistance;
		})

		let shader = context.shader;
		let gl = context.gl;

		let positionLoc = gl.getAttribLocation(shader, "a_position");
		let normalLoc = gl.getAttribLocation(shader, "a_normal");
		let texCoordLoc = gl.getAttribLocation(shader, "a_texCoord");

		billBoards.forEach(function(billBoard) {
			setDynamicArrayBufferData(vertexBuffer, billBoard.verts);
	        gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false,0,0) ;
	        gl.enableVertexAttribArray(positionLoc);

			setDynamicArrayBufferData(normalBuffer, billBoard.normals);
	        gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false,0,0) ;
	        gl.enableVertexAttribArray(normalLoc);

			setArrayBufferFloat(texCoordBuffer, gl.getAttribLocation(shader, "a_texCoord"), 2);

			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		})
	}
}
