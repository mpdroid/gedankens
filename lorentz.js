
/* Shows how lorentz transformations work */
import {Vector3, Quaternion} from './node_modules/three/build/three.module.js';
import * as GD from './gedanken.js';
import { begin, beginMultiple, narrate } from './common.js';




class Lorentz extends GD.Gedanken {

  introduction = "~ ".repeat(20) + "As the Bobs pass each other, "
    + "~ ".repeat(20) + "there is absolute chaos. "
    + "~ ".repeat(40) + "\r\nLengths contract, time dilates, "
    + "~ ".repeat(40) + "location and time of events do not line up..."

  constructor(font) {
    super(font, 1.5, true, 'Irf', false);
    this.createClock(this.trainFrameInTrainView, GD.TRAIN_COLOR, GD.TRAIN_LENGTH / 4 + 0.1, Math.PI / 2, this.maxDistanceTrainView / 2, 1, this.v, true);
    this.createClock(this.platformFrameInPlatformView, GD.PLATFORM_COLOR, GD.TRAIN_LENGTH / 4 + 0.1, Math.PI / 2, this.maxDistancePlatformView / 2, 1, this.v, true);
    this.createClock(this.trainFrameInPlatformView, GD.TRAIN_COLOR, GD.TRAIN_LENGTH / 4 + 0.1, Math.PI / 2, this.maxDistanceTrainView / 2, this.gamma, this.v, true);
    this.createClock(this.platformFrameInTrainView, GD.PLATFORM_COLOR, GD.TRAIN_LENGTH / 4 + 0.1, Math.PI / 2, this.maxDistancePlatformView / 2, this.gamma, this.v, true);
    this.trainDashboard = new GD.Dashboard(this.trainFrameInTrainView, this.trainCamera, this.font);
    this.platformDashboard = new GD.Dashboard(this.platformFrameInPlatformView, this.platformCamera, this.font);
  }

  initialize() {
    super.initialize();
    narrate(this.introduction, () => { });
    this.ticks = 0;
    this.computeEventCoordinates();
  }

  resetScene() {
    super.resetScene();
    this.trainDashboard.clearLabels();
    this.platformDashboard.clearLabels();
    this.clearAllMessages();
    this.trainFrameInTrainView.watch.reset(this.c, 1, true);
    this.trainFrameInPlatformView.watch.reset(this.c, this.gamma, true);
    this.platformFrameInPlatformView.watch.reset(this.c, 1, true);
    this.platformFrameInTrainView.watch.reset(this.c, this.gamma, true);
    this.ticks = 0;
    this.computeEventCoordinates();
  }
  animate() {
    super.animate();
    this.ticks++;
    GD.moveCamera.apply(this.platformCamera, [this.omega, this.platformFrameInPlatformView]);
    GD.moveCamera.apply(this.trainCamera, [this.omega, this.trainFrameInTrainView, -1]);
    this.orientClocks();
    this.orientLabels();


    if (this.endOfTheLine()) {
      this.switchDirection();
      this.initializeSpeedsAndRelatify();
      this.trainDashboard.clearLabels();
      this.platformDashboard.clearLabels();
      this.clearAllMessages();
      this.trainFrameInTrainView.watch.reset(this.c, 1, true);
      this.trainFrameInPlatformView.watch.reset(this.c, this.gamma, true);
      this.platformFrameInPlatformView.watch.reset(this.c, 1, true);
      this.platformFrameInTrainView.watch.reset(this.c, this.gamma, true);
      this.ticks = 0;
      this.computeEventCoordinates();
    }

    this.fireEvents();

    this.tickWatches();
    this.showLightningBolts();

    this.updateAllLightning();
    this.renderScenes();
  }

  clear() {
    super.clear();
  }


  tickWatches() {

    this.trainFrameInTrainView.watch.tick();
    this.trainFrameInPlatformView.watch.tick();


    this.platformFrameInPlatformView.watch.tick();
    this.platformFrameInTrainView.watch.tick();
  }

  computeEventCoordinates() {
    this.platformFrameInPlatformView.spaceTimeEvents = [];
    this.trainFrameInTrainView.spaceTimeEvents = [];
    this.trainFrameInTrainView.xOffset = 0.03;
    this.trainFrameInTrainView.ctLabel = 'ct\'';
    this.platformFrameInPlatformView.xOffset = -0.03;
    this.platformFrameInPlatformView.ctLabel = 'ct';




    this.ticksToOrigin = this.maxDistancePlatformView / this.v;
    this.ticksToOrigin = Math.floor(this.ticksToOrigin);
    this.ticksToOriginPrime = Math.floor(this.ticksToOrigin / this.gamma);
    this.trainDashboard.messageHeight = .2;
    this.platformDashboard.messageHeight = .2;
    const lPlatform = GD.PLATFORM_LENGTH;
    this.clicks = {};
    this.clicksPrime = {};
    const P = GD.PLATFORM_LENGTH;
    const D = this.maxDistancePlatformView;

    const radialTime = (first, second, c = this.c) => {
      return Math.abs(Math.floor(first.distanceTo(second) / c));
    };

    const xToPrime = (x, t) => {
      return this.gamma * (x - this.motionDirection * this.v * t);
    }
    const tToPrime = (x, t) => {
      return Math.floor(this.gamma * (t - this.motionDirection * this.v * x / this.c / this.c));
    }

    const redSignalTime = radialTime(
      new Vector3(-0.03, 0.2,
        this.motionDirection * P / 2),
      new Vector3(-0.03, 0,
        0));



    const redDistanceToTrainBobInPlatformView = this.motionDirection * this.v * P / 2 / (this.c + this.v);


    const redTimeToReachTrainBobInPlatformView = radialTime(
      new Vector3(-0.03, 0.2,
        this.motionDirection * P / 2),
      new Vector3(-0.03, 0,
        redDistanceToTrainBobInPlatformView));

    const redDistanceToTrainBobInTrainView = xToPrime(redDistanceToTrainBobInPlatformView, redTimeToReachTrainBobInPlatformView);
    const redTimeToReachTrainBobInTrainView = tToPrime(redDistanceToTrainBobInPlatformView, redTimeToReachTrainBobInPlatformView);
    const redEmitTimeInTrainView = redTimeToReachTrainBobInTrainView - redSignalTime;


    const redPlatform = this.platformFrameInPlatformView.addEvent(
      -0.03, 0.2,
      this.motionDirection * P / 2,
      0,
      1,
      (frame, x, y, z) => {
        frame.dropLightning(
          new Vector3(frame.xOffset, 0.2, z), this.c, 0xFF0000, .5, 5);
        frame.dropLightBubble(
          new Vector3(frame.xOffset, 0.2, z), this.c, redTimeToReachTrainBobInPlatformView, 0xFF0000, this.playRate, 3, 'Red');
      });


    const redTrain = this.trainFrameInTrainView.addEvent(
      0.03, 0.2,
      redPlatform.z,
      redEmitTimeInTrainView,
      1,
      (frame, x, y, z) => {
        frame.dropLightning(
          new Vector3(frame.xOffset, 0.2, z), this.c, 0xFF0000, 0.5, 2);
        frame.dropLightBubble(
          new Vector3(frame.xOffset, y, z), this.c, redSignalTime, 0xFF0000, this.playRate, 3, 'Red');
      });

    this.clicks['Red'] =  0;
    this.clicksPrime['Red'] =   redEmitTimeInTrainView ;



  }


  fireEvents() {
    const ticks = this.ticks;
    this.platformFrameInTrainView.spaceTimeEvents.forEach((evt) => {
      evt.fireWhenReady(ticks, this.ticksToOrigin);
    });
    this.platformFrameInPlatformView.spaceTimeEvents.forEach((evt) => {
      evt.fireWhenReady(ticks, this.ticksToOrigin);
    });
    this.trainFrameInTrainView.spaceTimeEvents.forEach((evt) => {
      evt.fireWhenReady(ticks, this.ticksToOrigin);
    });
  }

  showLightningBolts() {
    for (let bubble of this.trainFrameInTrainView.lightBubbles) {
      if (bubble.clicks === bubble.delay) {
        const msg =  bubble.name + ' lightning struck at ' + 
        this.clicksPrime[bubble.name] + ' ticks from rendezvous';
        this.attachMessage(this.trainFrameInTrainView, msg, 2 * Math.PI);
      }
    }
    this.platformFrameInPlatformView.lightBubbles.forEach((bubble) => {
      if (bubble.clicks === bubble.delay) {
        const msg =  bubble.name + ' lightning struck at ' + 
        this.clicks[bubble.name] + ' ticks from rendezvous';
        this.attachMessage(this.trainFrameInPlatformView, msg, 2 * Math.PI);
      }
    });
  }

}




class UnitLengths extends GD.Gedanken {


  constructor(font) {
    super(font, 0, true, 'UnitLength', true, 1);

    this.trainFrameInPlatformView.position.z = this.platformFrameInPlatformView.position.z;
    this.trainFrameInTrainView.position.z = this.platformFrameInTrainView.position.z;

    this.platformBobInTrainView.visible = false;
    this.trainBobInPlatformView.visible = false;
    this.V = this.NORMAL_V / 2;
    this.updateC(1.25);
    this.initializeSpeedsAndRelatify();

    let target = this.platformFrameInPlatformView;
    this.platformCamera.position.y = 0;
    this.platformCamera.theta = this.platformCamera.theta + this.motionDirection * this.omega;
    this.platformCamera.position.x = target.position.x + .5 * GD.TRAIN_LENGTH;
    this.platformCamera.position.z = target.position.z;
    this.platformCamera.lookAt(target.position);


    target = this.trainFrameInTrainView;
    this.trainCamera.position.y = 0;
    this.trainCamera.theta = this.trainCamera.theta + this.motionDirection * this.omega;
    this.trainCamera.position.x = target.position.x + .5 * GD.TRAIN_LENGTH;
    this.trainCamera.position.z = target.position.z;
    this.trainCamera.lookAt(target.position);

    this.platformFrameInPlatformView.label.rotation.y = Math.PI / 2;
    this.trainFrameInTrainView.label.rotation.y = Math.PI / 2;

    const unitLength = GD.TRAIN_LENGTH;
    this.trainFrameInTrainView.addDoubleArrow(new Vector3(0, -.2, 0),
      new Vector3(0, -0.2, -unitLength / 2),
      new Vector3(0, -0.2, unitLength / 2),
      0xFFFFFF,
      '1',
      this.font
    );
    this.platformFrameInPlatformView.addDoubleArrow(new Vector3(0, -.2,),
      new Vector3(0, -0.2, -unitLength / 2),
      new Vector3(0, -0.2, unitLength / 2),
      0xFFFFFF,
      '1',
      this.font
    );

    const unitLengthPrime = GD.PLATFORM_LENGTH / this.gamma;

    this.platformFrameInTrainView.addDoubleArrow(new Vector3(0, -.1, 0),
      new Vector3(0, -0.1, -unitLengthPrime / 2),
      new Vector3(0, -0.1, unitLengthPrime / 2),
      0xFFFFFF,
      '1 / \u03B3',
      this.font
    );
    this.trainFrameInPlatformView.addDoubleArrow(new Vector3(0, -.1, 0),
      new Vector3(0, -0.1, -unitLengthPrime / 2),
      new Vector3(0, -0.1, unitLengthPrime / 2),
      0xFFFFFF,
      '1 / \u03B3',
      this.font
    );


  }

  initialize() {
    super.initialize();

    this.renderScenes()
  }

  resetScene() {
    super.resetScene();
  }


  animate() {
  }

  updateLightSpeed(cbyv) {
 
    // do nothing in this class

  }


}


class LightPath extends GD.Gedanken {

  constructor(font) {
    super(font, .4, true, 'LightPath', false);

    let target = this.platformFrameInPlatformView;
    this.platformCamera.position.y = 0.2;
    this.platformCamera.theta = this.platformCamera.theta + this.motionDirection * this.omega;
    this.platformCamera.position.x = target.position.x + 1 * GD.TRAIN_LENGTH;
    this.platformCamera.position.z = target.position.z;
    let targetPosition = target.position.clone();
    targetPosition.y = 0.2;
    this.platformCamera.lookAt(targetPosition);


    target = this.trainFrameInTrainView;
    this.trainCamera.position.y = 0.2;
    this.trainCamera.theta = this.trainCamera.theta + this.motionDirection * this.omega;
    this.trainCamera.position.x = target.position.x + 1 * GD.TRAIN_LENGTH;
    this.trainCamera.position.z = target.position.z;
    let targetPosition1 = target.position.clone();
    targetPosition1.y = 0.2;
    this.trainCamera.lookAt(targetPosition1);

    this.platformFrameInPlatformView.label.rotation.y = Math.PI / 2;
    this.trainFrameInPlatformView.label.rotation.y = Math.PI / 2;
    this.trainFrameInTrainView.label.rotation.y = Math.PI / 2;


  }

  initialize() {
    super.initialize();
    this.ticks = 0;
    this.animating = true;
    this.computeEventCoordinates();
  }

  resetScene() {
    super.resetScene();
    this.ticks = 0;
    this.computeEventCoordinates();
  }
  animate() {
    if (!this.animating) {
      return;
    }
    super.animate();
    this.ticks++;
    this.trainCamera.position.z = this.trainFrameInTrainView.position.z;

    this.fireEvents();

    this.trackLightBubbles();
    this.updateAllLightning();


    this.renderScenes();
  }

  clear() {
    super.clear();
  }



  computeEventCoordinates() {
    this.platformFrameInPlatformView.spaceTimeEvents = [];
    this.trainFrameInTrainView.spaceTimeEvents = [];
    this.trainFrameInPlatformView.xOffset = 0.14;
    this.platformFrameInPlatformView.xOffset = 0.08;

    this.trainFrameInTrainView.xOffset = 0.14;
    this.platformFrameInTrainView.xOffset = 0.08;



    this.ticksToOrigin = this.maxDistancePlatformView / this.v;
    this.ticksToOrigin = Math.floor(this.ticksToOrigin);
    this.ticksToOriginPrime = Math.floor(this.ticksToOrigin / this.gamma);
    const lPlatform = GD.PLATFORM_LENGTH;
    this.clicks = {};
    this.clicksPrime = {};
    const P = GD.PLATFORM_LENGTH;
    const D = this.maxDistancePlatformView;

    const signalTime = Math.floor(lPlatform / 2 / this.c);
    const radialTime = (first, second, c = this.c) => {
      return Math.abs(Math.floor(first.distanceTo(second) / c));
    };

    const xToPrime = (x, t) => {
      return this.gamma * (x - this.motionDirection * this.v * t);
    }
    const tToPrime = (x, t) => {
      return Math.floor(this.gamma * (t - this.motionDirection * this.v * x / this.c / this.c));
    }

    const redSignalTime = radialTime(
      new Vector3(-0.03, 0.2,
        this.motionDirection * P / 2),
      new Vector3(-0.03, 0,
        0));



    const redDistanceToTrainBobInPlatformView = this.motionDirection * this.v * P / 2 / (this.c + this.v);


    const redTimeToReachTrainBobInPlatformView = radialTime(
      new Vector3(-0.03, 0.2,
        this.motionDirection * P / 2),
      new Vector3(-0.03, 0,
        redDistanceToTrainBobInPlatformView));

    const redDistanceToTrainBobInTrainView = xToPrime(redDistanceToTrainBobInPlatformView, redTimeToReachTrainBobInPlatformView);
    const redTimeToReachTrainBobInTrainView = tToPrime(redDistanceToTrainBobInPlatformView, redTimeToReachTrainBobInPlatformView);
    const redEmitTimeInTrainView = redTimeToReachTrainBobInTrainView - redSignalTime;
    
    const redPlatform = this.platformFrameInPlatformView.addEvent(
      -0.03, 0.3,
      this.motionDirection * P / 2,
      0,
      1,
      (frame, x, y, z) => {
        frame.dropArc(
          new Vector3(frame.xOffset, 0.3, z), this.c, 0xFF0000, 1, 3);

        frame.addArrow(new Vector3(frame.xOffset, y, z),
          new Vector3(frame.xOffset, 0, 0 + redDistanceToTrainBobInPlatformView),
          0xFFFFFF, 'ct', this.font, 0);

        frame.addArrow(
          new Vector3(frame.xOffset, y, z), new Vector3(frame.xOffset, y, 0 + redDistanceToTrainBobInPlatformView),
          0xFFFFFF, 'x', this.font, 0);
        frame.addArrow(
          new Vector3(frame.xOffset, y, z), new Vector3(frame.xOffset, 0, z),
          0xFFFFFF, 'y = y\'', this.font, 0);

      });

    const stopMotion = this.platformFrameInPlatformView.addEvent(
      0, 0, 0, redTimeToReachTrainBobInPlatformView, 1,
      (frame, x, y, z) => { this.animating = false; }
    );


    const redTrain = this.trainFrameInTrainView.addEvent(
      0.03, 0.3,
      redPlatform.z,
      redEmitTimeInTrainView,
      1,
      (frame, x, y, z) => {
        frame.dropArc(
          new Vector3(frame.xOffset, 0.3, z), this.c, 0xFF0000, 1, 3);

        frame.addArrow(new Vector3(frame.xOffset, y, z),
          new Vector3(frame.xOffset, 0, 0 ),
          0xFFFFFF, 'ct\'', this.font, 0);

        frame.addArrow(
          new Vector3(frame.xOffset, y, z), new Vector3(frame.xOffset, y, 0 ),
          0xFFFFFF, 'x\'', this.font, 0);
        frame.addArrow(
          new Vector3(frame.xOffset, y, z), new Vector3(frame.xOffset, 0, z),
          0xFFFFFF, 'y\' = y', this.font, 0);
      });


  }


  fireEvents() {
    const ticks = this.ticks;
    this.trainFrameInTrainView.spaceTimeEvents.forEach((evt) => {
      evt.fireWhenReady(ticks, this.ticksToOrigin);
    });
    this.platformFrameInPlatformView.spaceTimeEvents.forEach((evt) => {
      evt.fireWhenReady(ticks, this.ticksToOrigin);
    });
  }

  trackLightBubbles() {
    for (let bubble of this.trainFrameInTrainView.lightBubbles) {
      if (bubble.clicks === bubble.delay) {
        if (bubble.name === 'Blue') {
          this.animating = false;
        }
      }
    }
    this.platformFrameInPlatformView.lightBubbles.forEach((bubble) => {
      if (bubble.clicks === bubble.delay) {
        if (bubble.name === 'Blue') {
          this.animating = false;
        }
      }
    });
  }

}



beginMultiple([Lorentz, LightPath, UnitLengths], ['platformIrf', 'platformLightPath', 'platformUnitLength']);

