/* Demonstrates that time dilates */
import {Vector3, Quaternion} from 'https://unpkg.com/three/build/three.module.js'; //'./node_modules/three/build/three.module.js';
import * as GD from './gedanken.js';
import { beginMultiple, begin, narrate } from './common.js';


class TimeDilation extends GD.Gedanken {

  introduction = "~ ".repeat(120) + "A light clock keeps time on the train. "
  +"~ ".repeat(20) + "\r\nPlatform-Bob sees the train clock as running slower...";
  constructor(font) {
    super(font, 1.5, false);
    this.createClock(this.trainFrameInTrainView, 0xABEBC6, GD.TRAIN_LENGTH / 4 + 0.1, Math.PI / 2);
    this.createClock(this.trainFrameInPlatformView, 0xABEBC6, GD.TRAIN_LENGTH / 4 + 0.1, Math.PI / 2);
  }

  initialize() {
    super.initialize();
    narrate(this.introduction, () => { });
    this.ticks = 0;
    this.computeEventCoordinates();

  }
  resetScene() {
    super.resetScene();
    this.trainFrameInTrainView.watch.reset(1, 1, true);
    this.trainFrameInPlatformView.watch.reset(1, 1, true);
    this.signalTime = 0;
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
      this.clearAllLightning();
      this.initializeSpeedsAndRelatify();
      this.trainFrameInTrainView.watch.reset(1, 1, true);
      this.trainFrameInPlatformView.watch.reset(1, 1, true);
      this.ticks = 0;
      this.computeEventCoordinates();
    }
    this.fireEvents();
    this.updateAllLightning();
    this.renderScenes();
  }

  clear() {
    super.clear();
  }


  computeEventCoordinates() {
    this.platformFrameInPlatformView.spaceTimeEvents = [];
    this.trainFrameInTrainView.spaceTimeEvents = [];
    this.trainFrameInPlatformView.spaceTimeEvents = [];

    this.ticksToStartEventsInTrainView = 0;
    const trainSignalTime = Math.floor(GD.TRAIN_LENGTH / 4 / this.c);
    const trainPulseDistance = this.v * trainSignalTime * 2;
    const numberOfTrainPulses = Math.floor(2 * this.maxDistanceTrainView / trainPulseDistance);


    for (let k = 1; k < numberOfTrainPulses; k++) {
      this.trainFrameInTrainView.addEvent(0, 0, 0, 2 * trainSignalTime * k, 1,
        (frame, x, y, z) => {
          this.trainFrameInTrainView.dropArc(
            new Vector3(0, GD.TRAIN_LENGTH / 4, 0), this.c, 0x00CCFF);
          if (!!this.previousTrainRayForward) {
            this.previousTrainRayForward.visible = false;
          }
          if (!!this.previousTrainRayReverse) {
            this.previousTrainRayReverse.visible = false;
          }
          this.previousTrainRayForward = this.trainFrameInTrainView.dropLightRay(
            new Vector3(0, GD.TRAIN_LENGTH / 4 + 0.02, 0), this.trainFrameInTrainView, new Vector3(0, 0.02, 0), this.c, trainSignalTime, trainSignalTime, 0xFFFFFF,
            '', this.font,
            0);
        });

      this.trainFrameInTrainView.addEvent(0, 0, 0, 2 * trainSignalTime * k + trainSignalTime, 1,
        (frame, x, y, z) => {
          this.previousTrainRayReverse = this.trainFrameInTrainView.dropLightRay(
            new Vector3(0, 0.02, 0), this.trainFrameInTrainView, new Vector3(0, GD.TRAIN_LENGTH / 4 + .02, 0), this.c, trainSignalTime, trainSignalTime, 0xFFFFFF,
            '', this.font,
            0);
        });

      this.trainFrameInTrainView.addEvent(0, 0, 0, 2 * trainSignalTime * (k + 1), 1,
        (frame, x, y, z) => {
          this.trainFrameInTrainView.watch.tick();
          this.trainFrameInTrainView.watch.setLabel('' + this.trainFrameInTrainView.watch.ticks, this.font);
        });
    }
    const platformSignalTime = Math.floor(trainSignalTime * this.gamma);
    const platformDistance = this.v * platformSignalTime;
    const numberOfPlatformPulses = Math.floor(2 * this.maxDistanceTrainView / platformDistance / 2);

    for (let k = 1; k < numberOfPlatformPulses; k++) {
      const zDelta = -this.motionDirection * (this.maxDistancePlatformView - k * 2 * platformDistance);
      this.platformFrameInPlatformView.addEvent(0, 0, 0, 2 * platformSignalTime * k, 1,
        (frame, x, y, z) => {
          this.platformFrameInPlatformView.dropArc(
            new Vector3(-0.06, GD.TRAIN_LENGTH / 4 + 0.02, zDelta), this.c, 0x00CCFF);
          if (!!this.previousPlatformRayForward) {
            this.previousPlatformRayForward.visible = false;
          }
          if (!!this.previousPlatformRayReverse) {
            this.previousPlatformRayReverse.visible = false;
          }
          this.previousPlatformRayForward = this.platformFrameInPlatformView.dropLightRay(
            new Vector3(-0.06, GD.TRAIN_LENGTH / 4 + 0.02, zDelta), this.platformFrameInPlatformView,
            new Vector3(-0.06, 0.02, zDelta + this.motionDirection * platformDistance), this.c, platformSignalTime, platformSignalTime, 0xFFFFFF,
            '', this.font,
            0);
        });
      this.platformFrameInPlatformView.addEvent(0, 0, 0, 2 * platformSignalTime * k + platformSignalTime, 1,
        (frame, x, y, z) => {
          this.previousPlatformRayReverse = this.platformFrameInPlatformView.dropLightRay(
            new Vector3(-0.06, 0.02, zDelta + this.motionDirection * platformDistance), this.platformFrameInPlatformView,
            new Vector3(-0.06, GD.TRAIN_LENGTH / 4 + + 0.02, zDelta + this.motionDirection * 2 * platformDistance), this.c, platformSignalTime, platformSignalTime, 0xFFFFFF,
            '', this.font,
            0);
        });
      this.trainFrameInPlatformView.addEvent(0, 0, 0, 2 * platformSignalTime * (k + 1), 1,
        (frame, x, y, z) => {
          this.trainFrameInPlatformView.watch.tick();
          this.trainFrameInPlatformView.watch.setLabel('' + this.trainFrameInPlatformView.watch.ticks, this.font);
        });
    }


  }

  fireEvents() {
    const ticks = this.ticks;
    this.platformFrameInPlatformView.spaceTimeEvents.forEach((evt) => {
      evt.fireWhenReady(ticks, this.ticksToStartEventsInTrainView);
    });
    this.trainFrameInPlatformView.spaceTimeEvents.forEach((evt) => {
      evt.fireWhenReady(ticks, this.ticksToStartEventsInTrainView);
    });
    this.trainFrameInTrainView.spaceTimeEvents.forEach((evt) => {
      evt.fireWhenReady(ticks, this.ticksToStartEventsInTrainView);
    });
  }



}



class LightClock extends GD.Gedanken {

  constructor(font) {
    super(font, 0.5, false, 'LightClock', false);
    this.V = this.NORMAL_V / 1.5;
    this.updateC(2);
    this.initializeSpeedsAndRelatify();
    this.createClock(this.trainFrameInTrainView, 0xABEBC6, GD.TRAIN_LENGTH / 4 + 0.1, Math.PI / 2);
    this.createClock(this.trainFrameInPlatformView, 0xABEBC6, GD.TRAIN_LENGTH / 4 + 0.1, Math.PI / 2);

    let target = this.platformFrameInPlatformView;
    this.platformCamera.position.y = 0.2;
    this.platformCamera.theta = this.platformCamera.theta + this.motionDirection * this.omega;
    this.platformCamera.position.x = target.position.x + .5 * GD.TRAIN_LENGTH;
    this.platformCamera.position.z = target.position.z;
    const targetPosition = target.position.clone();
    targetPosition.y = target.position.y + 0.2;
    this.platformCamera.lookAt(targetPosition);

    const cameraRot = this.platformCamera.quaternion.clone();
    let q = new Quaternion(0, 1, 0, 0);
    q.setFromAxisAngle(new Vector3(0, 1, 0), Math.PI);
    cameraRot.multiply(q);
    this.trainFrameInPlatformView.watch.quaternion.copy(cameraRot);
    // this.platformFrameInPlatformView.label.quaternion.copy(this.platformCamera.quaternion.clone());
  }

  initialize() {
    super.initialize();
    this.ticks = 0;
    this.animating = true;
    this.computeEventCoordinates();
    this.renderScenes();

  }
  resetScene() {
    super.resetScene();
    this.trainFrameInTrainView.watch.reset(1, 1, true);
    this.trainFrameInPlatformView.watch.reset(1, 1, true);
    this.signalTime = 0;
    this.ticks = 0;
    this.computeEventCoordinates();
  }

  animate() {
    if (!this.animating) {
      return;
    }
    super.animate();
    this.ticks++;
    this.orientClocks();
    this.fireEvents();
    this.updateAllLightning();
    this.renderScenes();
  }

  clear() {
    super.clear();
  }


  computeEventCoordinates() {
    this.platformFrameInPlatformView.spaceTimeEvents = [];
    this.trainFrameInTrainView.spaceTimeEvents = [];
    this.trainFrameInPlatformView.spaceTimeEvents = [];

    this.ticksToStartEventsInTrainView = 0;
    const trainSignalTime = Math.floor(GD.TRAIN_LENGTH / 4 / this.c);
    const trainPulseDistance = this.v * trainSignalTime * 2;


    const platformSignalTime = Math.floor(trainSignalTime * this.gamma);
    const platformDistance = this.v * platformSignalTime;
    const numberOfPlatformPulses = Math.floor(2 * this.maxDistanceTrainView / platformDistance / 2);

    for (let k = 1; k < numberOfPlatformPulses; k++) {
      const zDelta = -this.motionDirection * (this.maxDistancePlatformView - k * 2 * platformDistance);
      this.platformFrameInPlatformView.addEvent(0, 0, 0, 2 * platformSignalTime * k, 1,
        (frame, x, y, z) => {
          this.platformFrameInPlatformView.dropArc(
            new Vector3(-0.03, GD.TRAIN_LENGTH / 4 + 0.02, zDelta), this.c, 0x00CCFF, 2, 2);
          this.previousPlatformRayForward = this.platformFrameInPlatformView.dropLightRay(
            new Vector3(-0.03, GD.TRAIN_LENGTH / 4 + 0.02, zDelta), this.platformFrameInPlatformView,
            new Vector3(-0.03, 0.02, zDelta + this.motionDirection * platformDistance), this.c, platformSignalTime, platformSignalTime, 0xFFFFFF,
            'ct\'', this.font,
            0);
        });
      this.platformFrameInPlatformView.addEvent(0, 0, 0, 2 * platformSignalTime * k, 1,
        (frame, x, y, z) => {
          this.previousPlatformRayForward = this.platformFrameInPlatformView.dropLightRay(
            new Vector3(-0.03, GD.TRAIN_LENGTH / 4 + 0.02, zDelta + this.motionDirection * platformDistance), this.platformFrameInPlatformView,
            new Vector3(-0.03, 0.02, zDelta + this.motionDirection * platformDistance), this.c, trainSignalTime, trainSignalTime, 0xFFFFFF,
            'ct', this.font,
            0);
        });
      this.platformFrameInPlatformView.addEvent(0, 0, 0, 2 * platformSignalTime * k, 1,
        (frame, x, y, z) => {
          this.platformFrameInPlatformView.dropLightRay(
            new Vector3(-0.03, GD.TRAIN_LENGTH / 4 + 0.02, zDelta), this.platformFrameInPlatformView,
            new Vector3(-0.03, GD.TRAIN_LENGTH / 4 + 0.02, zDelta + this.motionDirection * platformDistance), this.v, platformSignalTime, platformSignalTime, 0xFFFFFF,
            'vt\'', this.font,
            0);
        });
      this.trainFrameInPlatformView.addEvent(0, 0, 0, Math.floor(2 * platformSignalTime * (k + 0.5)), 1,
        (frame, x, y, z) => {
          this.animating = false;
          // this.trainFrameInPlatformView.watch.tick();
          // this.trainFrameInPlatformView.watch.setLabel('' + this.trainFrameInPlatformView.watch.ticks, this.font);
        });
    }


  }

  fireEvents() {
    const ticks = this.ticks;
    this.trainFrameInPlatformView.spaceTimeEvents.forEach((evt) => {
      evt.fireWhenReady(ticks, this.ticksToStartEventsInTrainView);
    });
    if (!!this.animating) {
      this.platformFrameInPlatformView.spaceTimeEvents.forEach((evt) => {
        evt.fireWhenReady(ticks, this.ticksToStartEventsInTrainView);
      });

    }
  }


  updateLightSpeed(cbyv) {
    event.stopPropagation();
 
    // do nothing in this class

  }


}



beginMultiple([TimeDilation, LightClock], ['platformIrf', 'platformLightClock']);


