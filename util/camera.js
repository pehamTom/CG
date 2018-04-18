exports.camera;

var camera = {pos:[0, 0, 0], front:[0, 0, 0], up:[0, 1, 0], pitch:0, yaw:0,
    cameraSpeed: 0.05, movementX:[0, 0, 0], movementY:[0,0,0], deltaX:0, deltaY:0,
    update: function(timeElapsed){
        var sensitivity = 0.00005;
        vec3.add(this.pos, this.pos, vec3.scale([], this.movementX, timeElapsed*sensitivity));
        vec3.add(this.pos, this.pos, vec3.scale([], this.movementY, timeElapsed*sensitivity));

        //rotation
        this.yaw += this.deltaX*sensitivity*1000;
        this.pitch -= this.deltaY*sensitivity*1000;
        var limit = glMatrix.toRadian(89.0);
        if(this.pitch > limit)
            this.pitch =  limit;
        if(this.pitch < -limit)
            this.pitch = -limit;

        this.front[0] = Math.cos(this.pitch) * Math.cos(this.yaw);
        this.front[1] = Math.sin(this.pitch);
        this.front[2] = Math.cos(this.pitch) * Math.sin(this.yaw);
        vec3.normalize(this.front, this.front);
        var test = vec3.add([], this.pos, vec3.scale([], this.front, vec3.length(this.pos)));
        console.log(this.pos[0]+ " " + this.pos[1] + " " + this.pos[2]);
        this.deltaX = 0;
        this.deltaY = 0;
    },
	lookAt: function(direction) {
		this.deltaX = 0;
		this.deltaY = 0;	//don't rotate because of mouse movement
		vec3.negate(this.front, this.pos);
		direction = vec3.normalize([], direction);
		this.pitch = Math.asin(direction[0]);
		this.yaw = Math.atan2(direction[2], direction[0]);
	}
};
