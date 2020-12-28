/* Introduces Special Relativity and the gedankens*/
import * as THREE from './node_modules/three/build/three.module.js';
import * as GD from './gedanken.js';
import { beginMultiple, narrate } from './common.js';

function cameraMotion(omega, trainFrame, platformFrame, motionDirection = 1) {
  if (this.locked === undefined) {
    this.locked = false;
  }
  this.theta = this.theta + motionDirection * omega;
  this.position.z = platformFrame.position.z;// + platformFrame.maxDistance;

  if (this.locked === false) {
    const targetPosition = platformFrame.position.clone();
    targetPosition.y = .2 - .1 * Math.cos(this.theta);
    targetPosition.x = platformFrame.position.x;
    targetPosition.z = platformFrame.position.z;
    if (targetPosition.z > trainFrame.position.z) {
      this.locked = true;
      this.targetY = .2 - .1 * Math.cos(this.theta);
    } else {
      this.position.x = platformFrame.position.x
        - 1 * GD.TRAIN_LENGTH
        + .5 * GD.TRAIN_LENGTH * Math.cos(this.theta);
      this.position.y = .2 - .1 * Math.cos(this.theta);
      this.lookAt(targetPosition);
    }
  }
  if (this.locked === true) {
    this.position.y = this.targetY;
    const targetPosition = trainFrame.position.clone();
    targetPosition.y = this.targetY;
    targetPosition.x = platformFrame.position.x;
    this.lookAt(targetPosition);
  }
}


class MeetTheBobs extends GD.Gedanken {

  introduction = "Meet Bob. " +
    "~ ".repeat(40) +
    "Bob is waiting on a platform in the vacuum of space. " +
    "~ ".repeat(30) +
    "\r\nHis twin, also Bob, " + "~ ".repeat(20) + "is traveling on a train, " +
    "~ ".repeat(20) +
    "passing by at near light speed... "
    ;

  constructor(font) {
    super(font, 2, true, 'Intro');
    this.platformCamera.theta = Math.PI / 2;
    this.trainFrameInPlatformView.label.visible = true;
    this.createClock(this.platformFrameInPlatformView, GD.PLATFORM_COLOR, GD.TRAIN_LENGTH / 6 + 0.1, Math.PI / 2,
      600);
    this.createClock(this.trainFrameInPlatformView, GD.TRAIN_COLOR, GD.TRAIN_LENGTH / 6 + 0.1, Math.PI / 2,
      600, this.gamma);
  }

  initialize() {
    super.initialize();
    this.ticks = 0;
    this.computeEventCoordinates();
    narrate(this.introduction, () => { });
  }

  resetScene() {
    super.resetScene();
    this.platformFrameInPlatformView.watch.reset(1, 1, true);
    this.trainFrameInPlatformView.watch.reset(1, this.gamma, true);
    this.computeEventCoordinates();
    this.ticks = 0;
  }

  animate() {
    super.animate();
    this.ticks++;
    cameraMotion.apply(this.platformCamera, [this.omega, this.trainFrameInPlatformView, this.platformFrameInPlatformView, this.motionDirection]);

    this.orientLabels();
    this.orientClocks();

    if (this.endOfTheLine()) {
      this.switchDirection();
      this.initializeSpeedsAndRelatify();
      this.platformFrameInPlatformView.watch.reset(1, 1, true);
      this.trainFrameInPlatformView.watch.reset(1, this.gamma, true);
      this.clearAllLightning();
      this.computeEventCoordinates();
      this.ticks = 0;
    }

    this.tickWatches();
    this.fireEvents();
    this.updateAllLightning();
    this.renderScenes();
  }

  clear() {
    super.clear();
  }


  tickWatches() {
    this.platformFrameInPlatformView.watch.tick();
    this.trainFrameInPlatformView.watch.tick();
  }

  computeEventCoordinates() {
    this.platformFrameInPlatformView.spaceTimeEvents = [];
    this.trainFrameInPlatformView.spaceTimeEvents = [];

    this.ticksToOrigin = Math.floor(this.maxDistancePlatformView / this.v);
    const ticksToLightning = Math.floor(GD.TRAIN_LENGTH / 2 / this.v);
    this.platformFrameInPlatformView.addEvent(GD.TRAIN_LENGTH / 1.5, 0, this.motionDirection * GD.TRAIN_LENGTH / 2, ticksToLightning, 1,
      (frame, x, y, z) => {
        frame.dropLightning(
          new THREE.Vector3(x, y, z), this.c, 0x00CCFF);
        frame.dropLightBubble(
          new THREE.Vector3(x, y, z), this.c, -1, 0x11AAFF, this.playRate, 1);
      });


  }

  fireEvents() {
    const ticks = this.ticks;
    this.platformFrameInPlatformView.spaceTimeEvents.forEach((evt) => {
      evt.fireWhenReady(ticks, this.ticksToOrigin);
    });
  }
}


beginMultiple([MeetTheBobs], ['platformIntro']);

