var startPos = [1, 2, 0];
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
    rotationQuat : quat.create(),
    rotationDuration: 0,
    rotationTime: 0,
    rotationPoint: vec3.create(),
    moveToPoint: vec3.create(),
    moveToDuration: 0,
    moveToTime:0 ,

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

rotateBy: function(xAngle,yAngle,zAngle,timeinSeconds){
   quat.identity(this.destinationQuat);

   this.rotationDuration = timeinSeconds * 1000;
   this.rotationTime = 0;
   quat.rotateX(this.destinationQuat,this.destinationQuat, xAngle*Math.PI/180);
   quat.rotateY(this.destinationQuat,this.destinationQuat, yAngle*Math.PI/180);
   quat.rotateZ(this.destinationQuat,this.destinationQuat, zAngle*Math.PI/180);
   quat.normalize(this.destinationQuat,this.destinationQuat);
},

moveTo: function(point, timeinSeconds)
{
    this.moveToDuration = timeinSeconds * 1000;
    this.moveToPoint = vec3.sub([],point,this.rotationPoint);
    this.moveToTime = 0;

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

var cameraAnimator = {
  rotations:[],
  rDurations:[],
  rTime: 0,
  currentRotation: 0,
  loopRotation: true,
  isRotating: false,
  numberOfRotations: 0,

  locations:[],
  lDurations:[],
  lTime: 0,
  currentLocation: 0,
  loopMovement: true,
  isMoving: false,
  numberOfLocations: 0,

  startRotating: function(){
    this.isRotating = true;
    var rotation = this.rotations[0];
    camera.rotateBy(rotation[0],rotation[1],rotation[2],this.rDurations[0]);
  },
  startMoving: function(){
    this.isMoving = true;
    camera.moveTo(this.locations[0],this.lDurations[0]);
  },
  addRotation: function(xAngle,yAngle,zAngle,timeInSeconds){
    var rotation=[0,0,0];
    rotation[0] = xAngle;
    rotation[1] = yAngle;
    rotation[2] = zAngle;
    this.rotations[this.numberOfRotations] = rotation;
    this.rDurations[this.numberOfRotations] = timeInSeconds;
    this.numberOfRotations++;
  },
  addLocation:function(point, timeInSeconds){
    this.locations[this.numberOfLocations] = point;
    this.lDurations[this.numberOfLocations] = timeInSeconds;
    this.numberOfLocations++;
  },
  update: function(){
    if(!camera.isFree){

      if(this.isRotating){
        this.rTime += timer.delta;
        if(this.rTime >= this.rDurations[this.currentRotation] * 1000){
          this.rTime = 0;
          this.currentRotation ++;
          if(this.currentRotation >= this.numberOfRotations)
          {
            this.currentRotation = 0;
          }
          var rotation = this.rotations[this.currentRotation];
          camera.rotateBy(rotation[0],rotation[1],rotation[2],this.rDurations[this.currentRotation]);
        }
      }
      if(this.isMoving){
        this.lTime += timer.delta;
        if(this.lTime >= this.lDurations[this.currentLocation] * 1000){
          this.lTime = 0;
          this.currentLocation++;
          if(this.currentLocation >= this.numberOfLocations)
          {
            this.currentLocation = 0;
          }
          camera.moveTo(this.locations[this.currentLocation], this.lDurations[this.currentLocation]);
        }
      }
    }

  }





}
