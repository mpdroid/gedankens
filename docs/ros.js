/* Demonstrates that time is relative */
import {Vector3} from 'https://unpkg.com/three/build/three.module.js'; //'./node_modules/three/build/three.module.js';
import * as GD from './gedanken.js';
import { begin, narrate } from './common.js';

class TimeIsRelative extends GD.Gedanken {


  constructor(font, applyGamma = false, showLengths = false) {
    super(font, 1.5, applyGamma, 'Irf', showLengths);
    this.introduction = "~ ".repeat(120) + "Just as the Bobs pass each other, " +
    "~ ".repeat(40) +
    "lightning strikes both ends of the platform... ";
    this.trainScene.ground.visible = false;
    this.platformScene.ground.visible = false;
    this.updateC(2);
    this.initializeSpeedsAndRelatify();
    this.createClock(this.trainFrameInTrainView, GD.TRAIN_COLOR, GD.TRAIN_LENGTH / 4 + 0.1, Math.PI / 2, GD.TRAIN_LENGTH / 2, 1, this.c, false);
    this.createClock(this.platformFrameInPlatformView, GD.PLATFORM_COLOR, GD.TRAIN_LENGTH / 4 + 0.1, Math.PI / 2, GD.TRAIN_LENGTH / 2, 1, this.c, false);

  }

  initialize() {
    super.initialize();
    narrate(this.introduction, () => { });
    this.ticks = 0;
    this.computeEventCoordinates();
  }

  resetScene() {
    super.resetScene();
    this.trainFrameInTrainView.watch.reset(this.c, 1, false);
    this.platformFrameInPlatformView.watch.reset(this.c, 1, false);
    this.ticksToOrigin = 0;
    this.ticks = 0;
    this.computeEventCoordinates();
  }

  animate() {
    super.animate();
    this.ticks++;

    GD.moveCamera.apply(this.platformCamera, [this.omega, this.platformFrameInPlatformView]);
    GD.moveCamera.apply(this.trainCamera, [this.omega, this.trainFrameInTrainView, -1]);
    this.orientLabels();
    this.orientClocks();


    if (this.endOfTheLine()) {
      this.switchDirection();
      this.clearAllLightning();
      this.initializeSpeedsAndRelatify();
      this.trainFrameInTrainView.watch.reset(this.c, 1, false);
      this.platformFrameInPlatformView.watch.reset(this.c, 1, false);
      this.ticksToOrigin = 0;
      this.ticks = 0;
      this.computeEventCoordinates();
    }





    this.tickWatches();
    this.updateAllLightning();
    this.fireEvents();
    this.triggerLightBubbleActions();
    this.renderScenes();
  }

  computeEventCoordinates() {
    this.platformFrameInPlatformView.spaceTimeEvents = [];
    this.trainFrameInTrainView.spaceTimeEvents = [];
    this.platformFrameInTrainView.spaceTimeEvents = [];
    this.trainFrameInTrainView.xOffset = 0.03;
    this.trainFrameInTrainView.ctLabel = 'ct\'';
    this.platformFrameInPlatformView.xOffset = -0.03;
    this.platformFrameInTrainView.xOffset = -0.03;
    this.platformFrameInPlatformView.ctLabel = 'ct';

    this.ticksToOrigin = this.maxDistancePlatformView / this.v;
    this.ticksToOrigin = Math.floor(this.ticksToOrigin);
    this.clicks = {};
    this.clicksPrime = {};
    const lPlatform = GD.PLATFORM_LENGTH;
    const P = GD.PLATFORM_LENGTH;
    const D = this.maxDistancePlatformView;

    const redSignalTime = Math.floor(lPlatform / 2 / this.c);
    const blueSignalTime = Math.floor(lPlatform / 2 / this.c);

    const redLightning = this.platformFrameInPlatformView.addEvent(
      -0.03, 0, this.motionDirection * P / 2,
      0,
      1,
      (frame, x, y, z) => {
        frame.dropLightning(
          new Vector3(frame.xOffset, y, z), this.c, 0xFF0000);
        frame.dropLightBubble(
          new Vector3(frame.xOffset, y, z), this.c, redSignalTime, 0xFF0000, this.playRate, 3, 'Red');
      });

    const timeForRedLightningToReachTrainBob = Math.floor(lPlatform / 2 / (this.c + this.v));

    const tRedTrainView = timeForRedLightningToReachTrainBob - redSignalTime;

    const redLightningInTrainView = this.trainFrameInTrainView.addEvent(
      -0.03, 0,
      redLightning.z,
      tRedTrainView,
      1,
      (frame, x, y, z) => {
        frame.dropLightning(
          new Vector3(frame.xOffset, y, z), this.c, 0xFF0000);
        frame.dropLightBubble(
          new Vector3(frame.xOffset, y, z), this.c, redSignalTime, 0xFF0000, this.playRate, 3, 'Red');
      });

    this.clicks['Red'] = this.ticksToOrigin + redLightning.t;
    this.clicksPrime['Red'] = this.ticksToOrigin + redLightningInTrainView.t;

    ///Blue

    const blueLightning = this.platformFrameInPlatformView.addEvent(
      -0.03, 0, -this.motionDirection * P / 2,
      0,
      1,
      (frame, x, y, z) => {
        frame.dropLightning(
          new Vector3(frame.xOffset, y, z), this.c, 0x11AAFF);
        frame.dropLightBubble(
          new Vector3(frame.xOffset, y, z), this.c, blueSignalTime, 0x11AAFF, this.playRate, 2, 'Blue');
      });

      const timeForBlueLightningToReachTrainBob = Math.floor(lPlatform / 2 / (this.c - this.v));

      const tBlueTrainView = timeForBlueLightningToReachTrainBob - blueSignalTime;


        const blueLightningInTrainView = this.trainFrameInTrainView.addEvent(
      0.03, 0,
      blueLightning.z,
      tBlueTrainView,
      1,
      (frame, x, y, z) => {
        frame.dropLightning(
          new Vector3(frame.xOffset, y, z), this.c, 0x11AAFF);
        frame.dropLightBubble(
          new Vector3(frame.xOffset, y, z), this.c, blueSignalTime, 0x11AAFF, this.playRate, 2, 'Blue');
      });

    this.clicks['Blue'] = this.ticksToOrigin + blueLightning.t;
    this.clicksPrime['Blue'] = this.ticksToOrigin + blueLightningInTrainView.t;
  }

  clear() {
    super.clear();
  }

  tickWatches() {
    this.trainFrameInTrainView.watch.tick();
    this.platformFrameInPlatformView.watch.tick();

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


  triggerLightBubbleActions() {
    for (let bubble of this.trainFrameInTrainView.lightBubbles) {
      if (bubble.clicks === bubble.delay) {
        if (bubble.name === 'Red') {
          this.trainFrameInTrainView.watch.ticking = true;
        }
        if (bubble.name === 'Blue') {
          this.trainFrameInTrainView.watch.ticking = false;
          const delta = this.clicksPrime['Blue'] - this.clicksPrime['Red'];
          const tBlue = this.ticksToOrigin + this.clicksPrime['Blue']
          this.trainFrameInTrainView.watch.setLabel(
            '\u0394t\' = ' + delta + ' ticks', this.font);
        }
      }
    }
    this.platformFrameInPlatformView.lightBubbles.forEach((bubble) => {
      if (bubble.clicks === bubble.delay) {
        if (bubble.name === 'Red') {
          this.platformFrameInPlatformView.watch.ticking = true;
        }
        if (bubble.name === 'Blue') {
          this.platformFrameInPlatformView.watch.ticking = false;
          const delta = this.clicks['Blue'] - this.clicks['Red'];
          this.platformFrameInPlatformView.watch.setLabel('\u0394t = ' + delta + ' ticks', this.font);
        }
      }
    });
  }


}


begin(TimeIsRelative);

