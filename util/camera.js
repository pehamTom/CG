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
    rightVec: [0,0,0],
    fov:glMatrix.toRadian(45),

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

    vec3.cross(this.rightVec, this.up, this.direction);
    vec3.normalize(this.rightVec, this.rightVec);
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
      console.log(camera.pos);
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
          vec3.cross(this.rightVec, this.up, this.direction);
          vec3.normalize(this.rightVec, this.rightVec);
          vec3.sub(this.pos, this.pos, vec3.scale(deltaPos,this.rightVec, timer.delta*sensitivity));
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
  lookAt: function(point) {

    //set camera to look at point
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
    this.pos = vec3.copy([], startPos);
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

      // console.log(this.currEvent + " =>" + currTime + ": " + this.events[this.currEvent].timestamp);

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
      camera.RotationPoint(this.point);
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
  cameraAnimator.addEvent(new CameraLookAtEvent([0,1.7,5],10));
  cameraAnimator.addEvent(new CameraSetRotationPointEvent([0,1.7,-4],0));
  cameraAnimator.addEvent(new CameraRotationEvent(0,-70,0,10,20));

  //Scene 1 Indoors
  cameraAnimator.addEvent(new CameraRotationEvent(0,60,0,2000,1250));
  cameraAnimator.addEvent(new CameraRotationEvent(0,10,0,700,3250));

  cameraAnimator.addEvent(new CameraRotationEvent(0,10,0,700,4300));
  cameraAnimator.addEvent(new CameraRotationEvent(0,80,0,2000,5000));
  cameraAnimator.addEvent(new CameraRotationEvent(0,25,0,500,7000));
  cameraAnimator.addEvent(new CameraRotationEvent(0,-10,-2,1000,7500));
  cameraAnimator.addEvent(new CameraRotationEvent(0,-20,0,500,8500));


  cameraAnimator.addEvent(new CameraRotationPointMoveEvent([0,1.7,-1.5],2000,4500));
  cameraAnimator.addEvent(new CameraRotationPointMoveEvent([1,1.7,-2],1000,6500));

  cameraAnimator.addEvent(new CameraRotationPointMoveEvent([4,1.6,-3.5],1500,7500));

  //Scene 2 House and Vortex
  cameraAnimator.addEvent(new CameraMoveEvent([23,7.3,0],1, 11000));
  cameraAnimator.addEvent(new CameraLookAtEvent([0,0,0],11010));
  cameraAnimator.addEvent(new CameraSetRotationPointEvent([0,0,0],11000));

  cameraAnimator.addEvent(new CameraRotationEvent(0,180,0,3000,11000));
  cameraAnimator.addEvent(new CameraRotationEvent(0,98,20,1500,14000));
  cameraAnimator.addEvent(new CameraRotationEvent(10,0,0,3000,15500));

  cameraAnimator.addEvent(new CameraRotationPointMoveEvent([0,7,-4],3000,14000));

  //Scene 3 The Run
  cameraAnimator.addEvent(new CameraMoveEvent([4,1.6,-3.5],1,19000));
  cameraAnimator.addEvent(new CameraLookAtEvent([6,1.6,-1.5],19010));
  cameraAnimator.addEvent(new CameraSetRotationPointEvent([4,1.6,-3.5],19020));

  var spotLightEvent = class extends CameraEvent{
      constructor(timestamp){
        super(0,timestamp);
      }
      fire(){
        spotLight.toggle();
      }

  };

  cameraAnimator.addEvent(new spotLightEvent(21000));
  cameraAnimator.addEvent(new CameraRotationPointMoveEvent([6,1.6,-3.5],1000,19100));
  cameraAnimator.addEvent(new CameraRotationPointMoveEvent([6,1.6,-1],1000,20800));
  cameraAnimator.addEvent(new CameraRotationEvent(0,120,20,1200,19100));
  cameraAnimator.addEvent(new CameraRotationEvent(0,-80,-20,500,20600));
  cameraAnimator.addEvent(new CameraRotationEvent(0,-80,-5,500,21100));
  cameraAnimator.addEvent(new CameraRotationPointMoveEvent([8,1.6,10],2000,21800));
  // cameraAnimator.addEvent(new CameraRotationPointMoveEvent([8,1.6,10],2000,21800));
  cameraAnimator.addEvent(new CameraRotationEvent(0,90,0,1000,19000));
  cameraAnimator.addEvent(new CameraRotationEvent(0,15,0,1000,22500));
  cameraAnimator.addEvent(new CameraRotationPointMoveEvent([17,1.6,40],5000,23800));
  cameraAnimator.addEvent(new CameraRotationEvent(0,90,30,750,23000));
    cameraAnimator.addEvent(new CameraRotationEvent(0,90,00,750,23750));
  cameraAnimator.addEvent(new CameraRotationEvent(0,-90,-30,750,25000));
  cameraAnimator.addEvent(new CameraRotationEvent(0,-90,0,750,25750));
  //add Camera Animator to update Queue
  updateQueue.push(cameraAnimator);
  console.log(cameraAnimator.events);
}
