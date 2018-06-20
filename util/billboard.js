/**
* Class representing a billboard. The billboard is a quad (2 triangles) that is
* dynamically computed based on the position and direction of the camera.
* For details on the implementation, see the visual effects description.
**/
class Billboard {

	/**
	* Constructor for this billboard. Allocates space for the dynamically computed
	* values
	* @param pos - The position of the billboard in local coordinates
	* @param width
	* @param height
	**/
	constructor(pos, width, height) {
		this.pos = vec3.copy([], pos);
		this.width = width/2;
		this.height = height/2;
		this.verts = new Float32Array(12);

		this.normals = new Float32Array(12)

		//variables used for caching
		this.planeVec = [0,0,0];
		this.vec = [0,0,0];
		this.normalVec = [0, 0, 0];

		//camera distance is used for sorting
		this.camDistance = -1;
	}

	/**
	* Function that recomputes the vertices and normals of the billboard according
	* to it's relative position to the camera
	**/
	update() {

		//compute distance to camera, this is used for sorting
		this.camDistance = vec3.distance(camera.pos, this.pos);

		//compute vector on the plane of the billboard
		this.planeVec[0] = this.pos[2] - camera.pos[2];
		this.planeVec[1] = 0; //billboard is constrained have a fixed y-axis
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

		//compute normalvector as the crossproduct of two non-colinear vectors
		//on the plane
		this.vec[0] = this.verts[0];
		this.vec[1] = this.verts[1];
		this.vec[2] = this.verts[2];

		this.normalVec[0] = this.verts[6];
		this.normalVec[1] = this.verts[7];
		this.normalVec[2] = this.verts[8];

		//this.vec is a vector from left lower corner to left upper corner after subtraction
		vec3.sub(this.vec, this.vec, this.normalVec);

		//this.vec and this.planevec are orthogonal on the plane, cross product of these
		//two vectors is normal to the plane
		vec3.cross(this.normalVec, this.vec, this.planeVec);
		vec3.normalize(this.normalVec, this.normalVec);

		//use same normal vector for all 4 vertices
		for(let i = 0; i < 4; i ++) {
			this.normals[i*3] = this.normalVec[0];
			this.normals[i*3+1] = this.normalVec[1];
			this.normals[i*3+2] = this.normalVec[2];
		}

	}
}

/**
* For our movie the billboards are used for trees. To make it look like there is
* a forest around the cabin this function returns a renderer that can be passed
* as the render function to a RenderSGNode. Before rendering the trees are sorted
* back to front according to their distance to the camera. That way the invisible
* parts of the trees do not lead to strange artifacts.
**/
function ForestRenderer(trees) {

	//texture coordinates are the same for all billboards
	var texCoords = new Float32Array([
		1,0, 0,0, 1,1, 0,1
	]);

	var billBoards = trees;

	//gpu buffers for the data
	var vertexBuffer, normalBuffer, texCoordBuffer;

	/**
	* Initiallize the gpu buffers
	**/
	function init() {
		vertexBuffer = gl.createBuffer();
		//texture coordinates do not change, so we use a static array buffer
		texCoordBuffer = setupStaticArrayBuffer(texCoords);
		normalBuffer = gl.createBuffer();
	}

	/**
	* This is the function that takes care of rendering the trees in the billBoards
	* array
	**/
	return function(context) {

		if(vertexBuffer == null) {
            init();
        }

		//compute billBoards
		billBoards.forEach(function(billBoard) {
			billBoard.update();
		})

		//sort billboards from back to front
		billBoards.sort(function(a, b) {
			return b.camDistance - a.camDistance;
		})

		let shader = context.shader;
		let gl = context.gl;

		let positionLoc = gl.getAttribLocation(shader, "a_position");
		let normalLoc = gl.getAttribLocation(shader, "a_normal");
		let texCoordLoc = gl.getAttribLocation(shader, "a_texCoord");

		//render each billboard
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
