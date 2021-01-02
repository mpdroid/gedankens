import {Vector3} from 'https://unpkg.com/three/build/three.module.js'; //'./node_modules/three/build/three.module.js';
import * as GD from './gedanken.js';
import { begin, narrate } from './common.js';

// Demostrates why speed of light is constant in all reference frames
class ConstantC extends GD.Gedanken {

  introduction = "~ ".repeat(120) + "Just as the Bobs pass each other, " +
    "~ ".repeat(40) +
    "lightning strikes the center of the platform, " +
    "~ ".repeat(30) +
    "kicking up a cloud of dust...";

  constructor(font) {
    super(font, 1.5);
  }

  initialize() {
    super.initialize();
    narrate(this.introduction, () => { });
    // this.omega = 0; // angular velocity of camera
  }

  resetScene() {
    super.resetScene();
  }

  animate() {
    super.animate();
    GD.moveCamera.apply(this.platformCamera, [this.omega, this.platformFrameInPlatformView]);
    this.orientLabels();
    GD.moveCamera.apply(this.trainCamera, [this.omega, this.trainFrameInTrainView, -1]);

    if (this.endOfTheLine()) {
      this.switchDirection();
      this.clearAllLightning();
      this.initializeSpeeds();
      this.updateReferenceFrameSpeeds();
;
    }

    if (this.bobsHaveCrossed()) {

      this.platformFrameInTrainView.dropParticleCloud(
        new Vector3(0, .03, 0), (this.v) / 5, 0, 0xFFFFFF, 1, 5);
      this.trainFrameInTrainView.dropLightBubble(
        new Vector3(0.06, 0, 0), this.c, 0, 0x00CCFF, 0);

      this.platformFrameInPlatformView.dropParticleCloud(
        new Vector3(0, 0.03, 0), (this.v) / 5, 0, 0xFFFFFF, 1, 5);

      this.platformFrameInPlatformView.dropLightBubble(
        new Vector3(0, 0, 0), this.c, 0, 0x00CCFF, 1, 10);
      this.platformFrameInPlatformView.dropLightning(
        new Vector3(0, 0, 0), this.c, 0x00CCFF);
      this.trainFrameInTrainView.dropLightning(
        new Vector3(0.06, 0, 0), this.c, 0x00CCFF);

    }

    this.updateAllLightning();

    this.renderScenes();

  }

  clear() {
    super.clear();
  }

}


begin(ConstantC);
