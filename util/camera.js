var camera = {
    pos:[-10, 0, 0],
    front:[10, 0, 0],
    up:[0, 1, 0],
    pitch:null,
    yaw:null,
    cameraSpeed: 0.05,
    movingForward:false,
    movingBackward:false,
    movingLeft:false,
    movingRight:false,
    deltaX:0,
    deltaY:0,
    animatedAngle:0,
    fov:glMatrix.toRadian(30),
    update: function(){
        var sensitivity = 0.005;
        //translation
        if(this.movingForward) {
            vec3.add(this.pos, this.pos, vec3.scale([], this.front, timer.delta*sensitivity));
        } else if(this.movingBackward) {
            vec3.add(this.pos, this.pos, vec3.scale([], this.front, -timer.delta*sensitivity));
        }

        if(this.movingLeft) {
            vec3.add(this.pos, this.pos, vec3.scale([], vec3.cross([], this.up, this.front), timer.delta*sensitivity));
        } else if(this.movingRight) {
            vec3.add(this.pos, this.pos, vec3.scale([], vec3.cross([], this.front, this.up), timer.delta*sensitivity));
        }

        //rotation
        this.yaw += timer.delta*this.deltaX*sensitivity/10.0;
        this.pitch -= timer.delta*this.deltaY*sensitivity/10.0;
        var limit = glMatrix.toRadian(89.0);
        if(this.pitch > limit)
            this.pitch =  limit;
        if(this.pitch < -limit)
            this.pitch = -limit;

        this.front[0] = Math.cos(this.pitch) * Math.cos(this.yaw);
        this.front[1] = Math.sin(this.pitch);
        this.front[2] = Math.cos(this.pitch) * Math.sin(this.yaw);
        vec3.normalize(this.front, this.front);
        this.deltaX = 0;
        this.deltaY = 0;
    },
	lookAt: function(point) {
		this.deltaX = 0;
		this.deltaY = 0;	//don't rotate because of mouse movement
        var direction = vec3.subtract([], point, this.pos);
		vec3.normalize(direction, direction);
		this.pitch = Math.asin(direction[1]);
		this.yaw = Math.atan2(direction[2], direction[0]);
	},
    zoom: function(offSet) {
        this.fov += offSet*0.01;
        if(this.fov < glMatrix.toRadian(1)) {
            this.fov = glMatrix.toRadian(1);
        } else if(this.fov > glMatrix.toRadian(70)) {
            this.fov = glMatrix.toRadian(70);
        }
    },
    reset: function() {
        this.pos = [-10, 0, 0];
        this.up = [0, 1, 0];
        this.lookAt(vec3.negate(this.front, this.pos));
    }
};
