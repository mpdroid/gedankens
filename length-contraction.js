
/* Demonstrates that moving objects appear shorter */
import {Vector3} from 'https://unpkg.com/three/build/three.module.js'; //'./node_modules/three/build/three.module.js';
import * as GD from './gedanken.js';
import { begin, narrate } from './common.js';


class LengthContraction extends GD.Gedanken {


  constructor(font) {
    super(font, 1.5, true, 'Irf', true, 2);
    this.introduction = "~ ".repeat(120) + "The train makes one complete pass across Platform-Bob. "
    +"~ ".repeat(40) + "\r\nPlatform-Bob observes the train to be shorter than its proper length...";
      this.createClock(this.trainFrameInTrainView, GD.TRAIN_COLOR, GD.TRAIN_LENGTH / 4 + 0.1, Math.PI / 2, GD.TRAIN_LENGTH / 2, 1, this.c, false);
    this.createClock(this.platformFrameInPlatformView, GD.PLATFORM_COLOR, GD.TRAIN_LENGTH / 4 + 0.1, Math.PI / 2, GD.TRAIN_LENGTH / 2, 1, this.c, false);

  }

  initialize() {
    super.initialize();
    narrate(this.introduction, () => { });
  }

  resetScene() {
    super.resetScene();
    this.trainFrameInTrainView.watch.reset(this.c);
    this.platformFrameInPlatformView.watch.reset(this.c);
  }

  animate() {
    super.animate();
    GD.moveCamera.apply(this.platformCamera, [this.omega, this.platformFrameInPlatformView]);
    GD.moveCamera.apply(this.trainCamera, [this.omega, this.trainFrameInTrainView, -1]);
    this.orientClocks();
    this.orientLabels();

    if (this.endOfTheLine()) {
      this.switchDirection();
      this.clearAllLightning();
      this.initializeSpeedsAndRelatify();
      this.trainFrameInTrainView.watch.reset(this.c);
      this.platformFrameInPlatformView.watch.reset(this.c);
    }

    if (this.crossingStartedInTrainView()) {
      this.trainFrameInTrainView.watch.ticking = true;
    }

    if (this.crossingEndedInTrainView()) {
      this.trainFrameInTrainView.watch.ticking = false;
      this.trainFrameInTrainView.watch.setLabel('t\' = \u03B3t = '+this.trainFrameInTrainView.watch.ticks + ' ticks', this.font);
      this.trainFrameInTrainView.addDoubleArrow(new Vector3(0, -.1, 0),
      new Vector3(0, -0.1, -GD.TRAIN_LENGTH / 2),
      new Vector3(0, -0.1, GD.TRAIN_LENGTH/2),
      0xFFFF00,
      'l\' = v x ' + this.trainFrameInTrainView.watch.ticks,
      this.font,
      this.motionDirection*Math.PI*2
    );

    }
    if (this.crossingStartedInPlatformView()) {
      this.platformFrameInPlatformView.watch.ticking = true;
    }

    if (this.crossingEndedInPlatformView()) {
      this.platformFrameInPlatformView.watch.ticking = false;
      this.platformFrameInPlatformView.watch.setLabel('t = '+this.platformFrameInPlatformView.watch.ticks + ' ticks', this.font);
      this.trainFrameInPlatformView.addDoubleArrow(new Vector3(0, -.1, 0),
      new Vector3(0, -0.1, -GD.TRAIN_LENGTH / this.gamma / 2),
      new Vector3(0, -0.1, GD.TRAIN_LENGTH/ this.gamma/2),
      0xFFFF00,
      'l = v x ' + this.platformFrameInPlatformView.watch.ticks,
      this.font,
      this.motionDirection*Math.PI*2
    );
    }
    this.tickWatches();

    this.renderScenes();
  }

  clear() {
    super.clear();
  }

  tickWatches() {
    this.trainFrameInTrainView.watch.tick();
    this.platformFrameInPlatformView.watch.tick();
  }

}

begin(LengthContraction);