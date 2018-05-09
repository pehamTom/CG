var startPos = [-30, 5, 0];
var deltaPos = [0, 0, 0];
//object bundling all data and operation needed for camera animation
var camera = {
    pos:vec3.copy([], startPos),
    direction:vec3.negate([], startPos),
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
            vec3.add(this.pos, this.pos, vec3.scale(deltaPos, this.direction, timer.delta*sensitivity));
        } else if(this.movingBackward) {
            vec3.add(this.pos, this.pos, vec3.scale(deltaPos, this.direction, -timer.delta*sensitivity));
        }

        if(this.movingLeft) {
            vec3.add(this.pos, this.pos, vec3.scale(deltaPos, vec3.cross([], this.up, this.direction), timer.delta*sensitivity));
        } else if(this.movingRight) {
            vec3.add(this.pos, this.pos, vec3.scale(deltaPos, vec3.cross([], this.direction, this.up), timer.delta*sensitivity));
        }

        //rotation using euler angles
        this.yaw += timer.delta*this.deltaX*sensitivity/10.0;
        this.pitch -= timer.delta*this.deltaY*sensitivity/10.0;
        var limit = glMatrix.toRadian(89.0);
        if(this.pitch > limit)
            this.pitch =  limit;
        if(this.pitch < -limit)
            this.pitch = -limit;

        this.direction[0] = Math.cos(this.pitch) * Math.cos(this.yaw);
        this.direction[1] = Math.sin(this.pitch);
        this.direction[2] = Math.cos(this.pitch) * Math.sin(this.yaw);
        vec3.normalize(this.direction, this.direction);
        this.deltaX = 0;
        this.deltaY = 0;
    },
	lookAt: function(point) { //set camera to look at point
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
        this.pos = vec3.copy([], startPos);
        this.up = [0, 1, 0];
        this.fov = glMatrix.toRadian(30)
        this.lookAt(vec3.negate(this.direction, this.pos));
    }
};
