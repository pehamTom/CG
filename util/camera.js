var startPos = [0.1, 1.7, 0];
var deltaPos = [0, 0, 0];
//object bundling all data and operation needed for camera

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
    rotationQuat : quat.create(),   //the current quat the camera is rotating with
    rotationDuration: 0,            //animation duration of current quad rotation
    rotationTime: 0,                //time since the Rotation started
    rotationPoint: vec3.create(),   //point around which the camera is rotating
    //Movement
    moveToPoint: vec3.create(),     //when a cameraRotationPointMoveEvent is used, this will holde the point to which the RotationPoint is translate to
    moveToDuration: 0,              //time the animation takes to move the RotationPoint to moveToPoint
    moveToTime:0 ,                  //time since the start of the Movement animation

    moveCameraToPoint: vec3.create(),//holds the point to which the camera is translated when using a CameraMoveEvent
    moveCameraToDuration: 0,         //time the camera takes to move to moveCameraToPoint
    moveCameraToTime:0 ,             //time since the start of the movement

    // this function will be called by the updateQueue.
    // Computes the camera transformations every frame in order to animate it.
    update: function(){
      //update the rightVec for billboarding
      vec3.cross(this.rightVec, this.direction, this.up);
      vec3.normalize(this.rightVec, this.rightVec);


      if(this.isFree){
          //camera is in free moving mode
          this.freeMovement();
      }else{
        //performe quaternion rotation
        if(this.rotationDuration > 0){
          this.updateRotation();
        }
        //performe linear movements
        this.updatePosition();
  }

},

//interpolate quaternion rotation using slerp
//will only be called when rotationDuration is bigger than zero
updateRotation: function(){
  var timeElapsed = timer.delta;
  var timeLeft = this.rotationDuration - this.rotationTime;

  if(timeLeft < timeElapsed){
      //if the time left till the end of the rotation is smaller than the last frametime
      //it is necessary to set the timeElapsed to  timeLeft in order to prevenent overshoot
      timeElapsed = timeLeft;
  }
  var temp = quat.create();
  quat.identity(temp);
  quat.slerp(this.rotationQuat ,temp, this.destinationQuat, timeElapsed/this.rotationDuration );

  //transform look at vector
  vec3.transformQuat(this.direction, this.direction, this.rotationQuat);

  var pos = vec3.create();
  //rotate around rotationPoint
  vec3.subtract(pos, this.pos, this.rotationPoint);
  vec3.transformQuat(pos, pos, this.rotationQuat);
  vec3.add(this.pos,pos,this.rotationPoint);

  if(timeLeft <= 0){
      this.rotationDuration = 0;
  }

  this.rotationTime += timeElapsed;
},

//performe linear interpolation in order to move the RotationPoint with the camera
//and also the camera in relation to the RotationPoint
updatePosition: function(){

    var timeElapsed = timer.delta;
    var timeLeft,temp;

    if(this.moveToDuration > 0){
      timeLeft = this.moveToDuration - this.moveToTime;

      if(timeLeft < timeElapsed){
          timeElapsed = timeLeft;
      }
      temp = vec3.create();
      //perform linear interpolation
      vec3.lerp(temp,[0,0,0],this.moveToPoint, timeElapsed/this.moveToDuration);
      //translate rotationPoint and camera position accordingly
      vec3.add(this.rotationPoint,this.rotationPoint,temp);
      vec3.add(this.pos,this.pos,temp);
      if(timeLeft <= 0){
        //no time left, end Animation
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
       //perform linear interpolation
       vec3.lerp(temp, [0,0,0], this.moveCameraToPoint, timeElapsed/this.moveCameraToDuration);
       //translate only the camera position
       vec3.add(this.pos, this.pos,temp);
       if(timeLeft <= 0){
         this.moveCameraToDuration = 0;
       }
       this.moveCameraToTime += timeElapsed;
    }
  },
  //this function handles the free camera flight
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


  /**
   * sets rotation point
   * @param rotationPoint point to rotate around
   */
  RotationPoint: function(rotationPoint){
      this.rotationPoint = rotationPoint;
  },

  //returns true if the camera is currently rotating
  isRotating: function(){
    return rotationDuration != 0;
  },

  /**
   * start and set up the quaternion rotation
   * @param xAngle angle to rotate aournd x axes
   * @param yAngle angle to rotate around y axes
   * @param zAngle angle to rotate around y axes
   * @param duration time the rotation animation takes
   */
  rotateQuadBy: function(xAngle,yAngle,zAngle,duration){
     //reset quat
     quat.identity(this.destinationQuat);

     //start the animation by setting the rotationDuration
     this.rotationDuration = duration;
     this.rotationTime = 0;
     //set up destination Quat
     quat.rotateX(this.destinationQuat,this.destinationQuat, xAngle*Math.PI/180);
     quat.rotateY(this.destinationQuat,this.destinationQuat, yAngle*Math.PI/180);
     quat.rotateZ(this.destinationQuat,this.destinationQuat, zAngle*Math.PI/180);
     quat.normalize(this.destinationQuat,this.destinationQuat);
  },
  //
  /**
   * start the movement of the RotationPoint, the camera will also be translated by the same amount
   * @param point Point to move camera to
   * @param duration time it will take to move to point
   */
  moveRPTo: function(point, duration){

      this.moveToDuration = duration;
      this.moveToPoint = vec3.sub([],point,this.rotationPoint);
      this.moveToTime = 0;
  },
  //start the camera movement animation
  /**
   * sets the camera diraction vector so that it looks at a point
   * @param point Point to look at
   * @param duration time it will take to move to point
   */
  moveTo: function(point, duration){
      this.moveCameraToDuration = duration;
      //calculate relative vec
      this.moveCameraToPoint =  vec3.sub([],point,this.pos);
      this.moveCameraToTime = 0;
  },
  /**
   * sets the camera diraction vector so that it looks at a point
   * @param point Point to look at
   */
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
  /**
   * changes camera field of view
   * @param offSet amount by which the fiel of view is changed
   */
  zoom: function(offSet) {
      //multiply by constant factor in order to make zooming with the mouseweel smooth
      this.fov += offSet*0.0001;
      if(this.fov < glMatrix.toRadian(1)) {
          this.fov = glMatrix.toRadian(1);
      } else if(this.fov > glMatrix.toRadian(70)) {
          this.fov = glMatrix.toRadian(70);
      }
  },
  /**
   * reset camera parameters
   */
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

  //this object controllst the automatic camera flight by calling the animation functions of the camera
  var cameraAnimator = {
    startTime: 0,   //time the camera animation started at
    events:[],      //the events the of the camera animation.
    currEvent: 0,   //the current event the camera is performing
    running: false,

    //start the camera animation and reset the camera.
    begin:function(){
      this.currEvent = 0;
      this.startTime = timer.elapsed;
      camera.reset();
      this.running = true;
      camera.isFree = false;

        spotLight.active = false;
    },
    /**
     * adds an event to the event queue and sorts the queue
     * @param event Camera event must have a fire function and a timestamp
     */
    addEvent:function(event){
      this.events.push(event);
      //sort events desceniding
      this.events.sort(function(a,b){
          return a.timestamp - b.timestamp;
      });
    },

    //will be called by the update queue every frame in order to update the current animation the camera is performing
    update: function(){
      if(this.running){
        //calculate the time since the animation has started by using the timer
        var currTime =timer.elapsed - this.startTime;
        //when the next event timestamp is reached the event.fire method will be called.
        if(currTime >= this.events[this.currEvent].timestamp){
          //fire event
          this.events[this.currEvent].fire();
          //go to next event
          this.currEvent++;
          if(this.currEvent > this.events.length-1){
            //stop animating because the move is over
            this.currEvent = 0;
            this.running = false;
          }
        }
      }
    },
    //resets the camera Animator
    reset: function(){
        this.currEvent = 0;
        this.running = false;
        this.currTime = 0;
        this.startTime = 0;
    }
};

//basic CameraEvent
class CameraEvent{
  constructor(duration,timestamp){
    this.duration = duration;
    this.timestamp = timestamp;
  }
  fire (){
  }
}

//camera rotation event
// takes a timestamp and a duration as well as three angles and starts a quaternion roatation when the fire function is called.
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

//camera rotaton point move event
//takes a timestamp and a duration as well as a position to move to.
//When the timestamp is reached the camera and the rotationPoint will be translated to it via a linear interpolation.
class CameraRotationPointMoveEvent extends CameraEvent{
  constructor(pos,duration,timestamp){
    super(duration,timestamp)
    this.pos = pos;

  }
  fire(){
    camera.moveRPTo(this.pos, this.duration);
  }
}

//camera move event
//moves the camera independent of the rotation point
class CameraMoveEvent extends CameraEvent{
  constructor(pos,duration,timestamp){
    super(duration,timestamp)
    this.pos = pos;

  }
    fire(){
      camera.moveTo(this.pos, this.duration);
    }
}

//camera set rotation point Event
//the rotation point will be set to point when the timestamp is reached.
class CameraSetRotationPointEvent {
  constructor(point,timestamp){
    this.timestamp = timestamp;
    this.point = point;
  }
  fire(){
      camera.RotationPoint(vec3.copy([],this.point));

  }
}
//camera look at event
//when this event fires, the camera direction vector will be set so that the camera looks at the point.
class CameraLookAtEvent{
  constructor(point,timestamp){
    this.timestamp = timestamp;
    this.point = point;
  }
  fire(){
    camera.lookAt(this.point);
  }
}

//intitalise the camera event queue
function initMove(){


  //start Position
  cameraAnimator.addEvent(new CameraMoveEvent([0,1.7,-4],1,0));
  cameraAnimator.addEvent(new CameraLookAtEvent([Math.sin(glm.deg2rad(-70)),1.7,-4 + Math.cos(glm.deg2rad(-70))],10));
  cameraAnimator.addEvent(new CameraSetRotationPointEvent([0,1.7,-4],20));

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

  //Scene 3 The Run
  cameraAnimator.addEvent(new CameraMoveEvent([4,1.6,-3.5],1,20000));
  cameraAnimator.addEvent(new CameraLookAtEvent([6,1.6,-3.5],20010));
  cameraAnimator.addEvent(new CameraSetRotationPointEvent([4,1.6,-3.5],20020));

  //event for turning on the spotLight
  var spotLightEvent = class extends CameraEvent{
      constructor(timestamp){
        super(0,timestamp);
      }
      fire(){
        spotLight.active = true;
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

  //put cameraAnimator in update Queue
  updateQueue.push(cameraAnimator);
}
