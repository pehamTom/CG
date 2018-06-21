var startPos = [0.1, 1.7, 0];
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
    rightVec: vec3.normalize([], vec3.cross([], vec3.negate([], startPos), [0,1,0])),
    fov:glMatrix.toRadian(50),
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

  vec3.cross(this.rightVec, this.direction, this.up);
  vec3.normalize(this.rightVec, this.rightVec);
  if(this.isFree){
      this.freeMovement();
  }else{
    //performe quaternion rotation
    if(this.rotationDuration > 0){
      this.updateRotation();
    }
    //performe linear movement
    this.updatePosition();
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
  // vec3.transformQuat(this.up, this.up,this.rotationQuat);

  if(timeLeft <= 0){
      this.rotationDuration = 0;
  }

  this.rotationTime += timeElapsed;
},
updatePosition: function(){

    var timeElapsed = timer.delta;
    var timeLeft,temp;

    if(this.moveToDuration > 0){
      timeLeft = this.moveToDuration - this.moveToTime;

      if(timeLeft < timeElapsed){
          timeElapsed = timeLeft;
      }
      temp = vec3.create();
      vec3.lerp(temp,[0,0,0],this.moveToPoint, timeElapsed/this.moveToDuration);
      vec3.add(this.rotationPoint,this.rotationPoint,temp);
      vec3.add(this.pos,this.pos,temp);
      if(timeLeft <= 0){
        this.moveToDuration = 0;
      }

      this.moveToTime += timeElapsed;
    }
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

      vec3.cross(this.rightVec, this.direction, this.up);
      vec3.normalize(this.rightVec, this.rightVec);
      if(this.movingLeft) {
          vec3.add(this.pos, vec3.scale(deltaPos, this.rightVec, -timer.delta*sensitivity), this.pos);
      } else if(this.movingRight) {
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

     this.rotationDuration = timeinSeconds;
     this.rotationTime = 0;
     quat.rotateX(this.destinationQuat,this.destinationQuat, xAngle*Math.PI/180);
     quat.rotateY(this.destinationQuat,this.destinationQuat, yAngle*Math.PI/180);
     quat.rotateZ(this.destinationQuat,this.destinationQuat, zAngle*Math.PI/180);
     quat.normalize(this.destinationQuat,this.destinationQuat);
  },

  moveRPTo: function(point, timeinSeconds){
      this.moveToDuration = timeinSeconds;
      this.moveToPoint = vec3.sub([],point,this.rotationPoint);
      this.moveToTime = 0;
  },
  moveTo: function(point, timeinSeconds){

      this.moveCameraToDuration = timeinSeconds;
      this.moveCameraToPoint =  vec3.sub([],point,this.pos);
      this.moveCameraToTime = 0;
  },
  lookAt: function(point) { //set camera to look at point
    this.deltaX = 0;
    this.deltaY = 0;	//don't rotate because of mouse movement

    var direction = vec3.subtract([], point, this.pos);
    vec3.normalize(direction, direction);
    this.pitch = Math.asin(direction[1]);
    this.yaw = Math.atan2(direction[2], direction[0]);

    this.direction[0] = Math.cos(this.pitch) * Math.cos(this.yaw);
    this.direction[1] = Math.sin(this.pitch);
    this.direction[2] = Math.cos(this.pitch) * Math.sin(this.yaw);
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
    this.pos = vec3.copy([], [0,0,0]);
    this.up = [0, 1, 0];
    this.fov = glMatrix.toRadian(50);
    this.rotationDuration= 0;
    this.moveToDuration= 0;
    this.moveCameraToDuration= 0;
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
    camera.reset();
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

      if(currTime >= this.events[this.currEvent].timestamp){

        this.events[this.currEvent].fire();

        this.currEvent++;
        if(this.currEvent > this.events.length-1){
          this.currEvent = 0;
          this.running = false;
        }
      }
    }
  },
  reset: function(){
      this.currEvent = 0;
      this.running = false;
      this.currTime = 0;
      this.startTime = 0;


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
    camera.rotateQuadBy(this.xangle, this.yangle,this.zangle,this.duration);
  }
}

class CameraRotationPointMoveEvent extends CameraEvent{
  constructor(pos,duration,timestamp){
    super(duration,timestamp)
    this.pos = pos;

  }
  fire(){
    camera.moveRPTo(this.pos, this.duration);
  }
}
class CameraMoveEvent extends CameraEvent{

  constructor(pos,duration,timestamp){
    super(duration,timestamp)
    this.pos = pos;

  }
    fire(){
      camera.moveTo(this.pos, this.duration);
    }
}

class CameraSetRotationPointEvent {
  constructor(point,timestamp){
    this.timestamp = timestamp;
    this.point = point;
  }
  fire(){
      camera.RotationPoint(vec3.copy([],this.point));

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

function initMove(){


  //start Position
  cameraAnimator.addEvent(new CameraMoveEvent([0,1.7,-4],1,0));
  cameraAnimator.addEvent(new CameraLookAtEvent([Math.sin(glm.deg2rad(-70)),1.7,-4 + Math.cos(glm.deg2rad(-70))],10));
  cameraAnimator.addEvent(new CameraSetRotationPointEvent([0,1.7,-4],20));
  // cameraAnimator.addEvent(new CameraRotationEvent(0,-70,0,10,20));


//
  //Scene 1 Indoors
  cameraAnimator.addEvent(new CameraRotationEvent(0,60,0,3000,1250));
  cameraAnimator.addEvent(new CameraRotationEvent(0,10,0,700,4250));

  cameraAnimator.addEvent(new CameraRotationEvent(0,10,0,700,4300));
  cameraAnimator.addEvent(new CameraRotationEvent(0,80,0,2000,5000));
  cameraAnimator.addEvent(new CameraRotationEvent(0,25,0,500,7000));
  cameraAnimator.addEvent(new CameraRotationEvent(0,-10,-2,1000,7500));
  cameraAnimator.addEvent(new CameraRotationEvent(0,-20,0,500,8500));


  cameraAnimator.addEvent(new CameraRotationPointMoveEvent([0,1.7,-1.5],2000,4500));
  cameraAnimator.addEvent(new CameraRotationPointMoveEvent([1,1.7,-2],1000,6500));

  cameraAnimator.addEvent(new CameraRotationPointMoveEvent([2,1.6,-3.5],1500,7500));
  cameraAnimator.addEvent(new CameraRotationPointMoveEvent([5,1.6,-3.5],2000,11000))
  //Scene 2 House and Vortex

  cameraAnimator.addEvent(new CameraMoveEvent([23,7.3,0],1, 13000));
  cameraAnimator.addEvent(new CameraLookAtEvent([0,0,0],13100));
  cameraAnimator.addEvent(new CameraSetRotationPointEvent([0,0,0],13020));

  cameraAnimator.addEvent(new CameraRotationEvent(0,180,0,4000,13200));
  cameraAnimator.addEvent(new CameraRotationEvent(0,90,30,2000,17200));

  cameraAnimator.addEvent(new CameraRotationPointMoveEvent([2,12,-4],3000,15000));
//
  //Scene 3 The Run
  cameraAnimator.addEvent(new CameraMoveEvent([4,1.6,-3.5],1,20000));
  cameraAnimator.addEvent(new CameraLookAtEvent([6,1.6,-3.5],20010));
  cameraAnimator.addEvent(new CameraSetRotationPointEvent([4,1.6,-3.5],20020));

  var spotLightEvent = class extends CameraEvent{
      constructor(timestamp){
        super(0,timestamp);
      }
      fire(){
        spotLight.activate();
      }

  };

  cameraAnimator.addEvent(new spotLightEvent(21000));
  cameraAnimator.addEvent(new CameraRotationPointMoveEvent([6,1.6,-3.5],1000,21100));
  cameraAnimator.addEvent(new CameraRotationPointMoveEvent([6,1.6,-1],1000,22800));
  cameraAnimator.addEvent(new CameraRotationEvent(0,90,20,1200,21100));
  cameraAnimator.addEvent(new CameraRotationEvent(0,-80,-30,500,22600));
  cameraAnimator.addEvent(new CameraRotationEvent(0,-80,0,500,23100));
  cameraAnimator.addEvent(new CameraRotationPointMoveEvent([8,1.6,10],2000,23800));

  cameraAnimator.addEvent(new CameraRotationEvent(0,165,0,1000,25800));
  cameraAnimator.addEvent(new CameraRotationPointMoveEvent([17,1.6,40],4200,25800));
  cameraAnimator.addEvent(new CameraRotationEvent(0,0,90,750,27800));
  cameraAnimator.addEvent(new CameraRotationEvent(20,-10,0,750,28550));
  cameraAnimator.addEvent(new CameraRotationEvent(30,-5,0,700,29300));

  updateQueue.push(cameraAnimator);
}
