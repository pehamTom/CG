var startPos = [10, 2, 0];
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
    rightVec: [0,0,0],
    fov:glMatrix.toRadian(30),

    isFree: true,

    destinationQuat: quat.create(),
    //Rotation
    rotationQuat : quat.create(),
    rotationDuration: 0,
    rotationTime: 0,
    rotationPoint: vec3.create(),
    //Movement
    moveToPoint: vec3.create(),
    moveToDuration: 0,
    moveToTime:0 ,

    moveCameraToPoint: vec3.create(),
    moveCameraToDuration: 0,
    moveCameraToTime:0 ,

update: function(){
      if(this.isFree){
          this.freeMovement();
      }else{
      //performe quaternion rotation
      if(this.rotationDuration > 0){
        this.updateRotation();
      }
      //performe linear movement
      if(this.moveToDuration > 0){
        this.updatePosition();
      }
    }
},
updateRotation: function(){
  var timeElapsed = timer.delta;
  var timeLeft = this.rotationDuration - this.rotationTime;

  if(timeLeft < timeElapsed){
      timeElapsed = timeLeft;
  }
  var temp = quat.create();
  quat.identity(temp);
  quat.slerp(this.rotationQuat ,temp, this.destinationQuat, timeElapsed/this.rotationDuration );

  vec3.transformQuat(this.direction, this.direction, this.rotationQuat);
  var pos = vec3.create();
  vec3.subtract(pos, this.pos, this.rotationPoint);
  vec3.transformQuat(pos, pos, this.rotationQuat);
  vec3.add(this.pos,pos,this.rotationPoint);
  vec3.transformQuat(this.up, this.up,this.rotationQuat);

  if(timeLeft <= 0){
      this.rotationDuration = 0;
  }

  this.rotationTime += timeElapsed;


},
updatePosition: function(){

    var timeElapsed = timer.delta;
    var timeLeft = this.moveToDuration - this.moveToTime;

    if(timeLeft < timeElapsed){
        timeElapsed = timeLeft;
    }
    var temp = vec3.create();
    vec3.lerp(temp,[0,0,0],this.moveToPoint, timeElapsed/this.moveToDuration);
    vec3.add(this.rotationPoint,this.rotationPoint,temp);
    vec3.add(this.pos,this.pos,temp);
    if(timeLeft <= 0){
      this.moveToDuration = 0;
    }

    this.moveToTime += timeElapsed;

    if(this.moveCameraToDuration > 0){
       timeLeft = this.moveCameraToDuration - this.moveCameraToTime;

       if(timeLeft < timeElapsed){
         timeElapsed = timeLeft;
       }
       temp = vec3.create();
       vec3.lerp(temp, [0,0,0], this.moveCameraToPoint, timeElapsed/this.moveCameraToDuration);
       vec3.add(this.pos, this.pos,temp);
       if(timeLeft <= 0){
         this.moveCameraToDuration = 0;
       }
        this.moveCameraToTime += timeElapsed;
    }
  },
  freeMovement:function(){
      var sensitivity = 0.005;
      //translation
      if(this.movingForward) {
          vec3.add(this.pos, this.pos, vec3.scale(deltaPos, this.direction, timer.delta*sensitivity));
      } else if(this.movingBackward) {
          vec3.add(this.pos, this.pos, vec3.scale(deltaPos, this.direction, -timer.delta*sensitivity));
      }

      if(this.movingLeft) {
          vec3.cross(this.rightVec, this.up, this.direction);
          vec3.normalize(this.rightVec, this.rightVec);
          vec3.add(this.pos, this.pos, vec3.scale(deltaPos, this.rightVec, timer.delta*sensitivity));
      } else if(this.movingRight) {
          vec3.cross(this.rightVec, this.direction, this.up);
          vec3.normalize(this.rightVec, this.rightVec);
          vec3.add(this.pos, this.pos, vec3.scale(deltaPos,this.rightVec, timer.delta*sensitivity));
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
  RotationPoint: function(rotationPoint){
      this.rotationPoint = rotationPoint;
  },

  isRotating: function(){
    return rotationDuration != 0;
  },

  rotateQuadBy: function(xAngle,yAngle,zAngle,timeinSeconds){
     quat.identity(this.destinationQuat);

     this.rotationDuration = timeinSeconds * 1000;
     this.rotationTime = 0;
     quat.rotateX(this.destinationQuat,this.destinationQuat, xAngle*Math.PI/180);
     quat.rotateY(this.destinationQuat,this.destinationQuat, yAngle*Math.PI/180);
     quat.rotateZ(this.destinationQuat,this.destinationQuat, zAngle*Math.PI/180);
     quat.normalize(this.destinationQuat,this.destinationQuat);
  },

  moveRBTo: function(point, timeinSeconds){
      this.moveToDuration = timeinSeconds * 1000;
      this.moveToPoint = vec3.sub([],point,this.rotationPoint);
      this.moveToTime = 0;
  },
  moveTo: function(point, timeinSeconds){
      this.moveCameraToDuration = timeinSeconds * 1000;
      this.moveCameraToPoint = point;
      this.moveCameraTime = 0;
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
    this.fov += offSet*0.0001;
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

var cameraAnimator = {
  startTime: 0,
  events:[],
  currEvent: 0,
  running: false,


  begin:function(){
    this.currEvent = 0;
    this.startTime = timer.elapsed;

    this.running = true;
    camera.isFree = false;
  },
  addEvent:function(event){
    this.events.push(event);
    this.events.sort(function(a,b){
        return a.timestamp - b.timestamp;
    });
  },
  update: function(){
    if(this.running){
      var currTime =timer.elapsed - this.startTime;

      console.log(this.currEvent + " =>" + currTime + ": " + this.events[this.currEvent].timestamp);

      if(currTime >= this.events[this.currEvent].timestamp){
        this.events[this.currEvent].fire();
        this.currEvent++;
        if(this.currEvent > this.events.length-1){
          this.currEvent = 0;
          this.running = false;
        }
      }
    }
  }
};

class CameraEvent{
  constructor(duration,timestamp){
    this.duration = duration;
    this.timestamp = timestamp;
  }
  fire (){
  }
}

class CameraRotationEvent extends CameraEvent{
  constructor(xangle,yangle,zangle,duration,timestamp){
    super(duration,timestamp);
    this.xangle = xangle;
    this.yangle = yangle;
    this.zangle = zangle;

  }
  fire(){
    camera.rotateBy(this.xangle,this.yangle,this.zangle,this.duration);
  }
}


class CameraQuadRotationEvent extends CameraRotationEvent{
  fire(){
    camera.rotateQuadBy(this.xangle, this.yangle,this.zangle,this.duration);
  }
}

class CameraMoveEvent extends CameraEvent{
  constructor(pos,duration,timestamp){
    super(duration,timestamp)
    this.pos = pos;

  }
  fire(){
    camera.moveRBTo(this.pos, this.duration);
  }
}

class CameraSetRotationPointEvent {
  constructor(point,timestamp){
    this.timestamp = timestamp;
    this.point = point;
  }
  fire(){
      camera.RotationPoint(this.pos);
  }
}

class CameraLookAtEvent{
  constructor(point,timestamp){
    this.timestamp = timestamp;
    this.point = point;
  }
  fire(){
    camera.lookAt(this.point);
  }

}
