import {Scene, PerspectiveCamera,
  WebGLRenderer,
  DirectionalLight,SpotLight,AmbientLight,
  Vector3,
  Mesh,
  PlaneBufferGeometry,BufferGeometry,ShapeBufferGeometry,BoxBufferGeometry,
  CylinderBufferGeometry, RingGeometry,
  Quaternion,
  GridHelper,
  ShadowMaterial,
  Clock,
  Line,
  LineBasicMaterial,
  Object3D,
  MeshPhongMaterial,
  DoubleSide,FrontSide, BackSide,
  MeshBasicMaterial,
  Color
// }  from './node_modules/three/build/three.module.js';
}  from 'https://unpkg.com/three/build/three.module.js';
import { Bob } from './bob.js';
import { Lightning, LightBubble, LightRay, Arrow, DoubleArrow, ParticleCloud, Arc } from './lightning.js';

export const TRAIN_LENGTH = 1;
export const PLATFORM_LENGTH = 1;
export const EPSILON = 0.001;
export const TRAIN_COLOR = 0xABEBC6;
export const PLATFORM_COLOR = 0xAAAAAA;
export const PLATFORM_CENTER = new Vector3(0.06, 0, 11);
const CAR_GAP = 0.1 / 4;
const CAR_LENGTH = 0.9 / 5;


function isClose(first, second, epsilon = EPSILON) {
  return Math.abs(first - second) <= epsilon;
}

class ReferenceFrame extends Object3D {
  constructor(scene, position, clock, velocity, maxDistance = 2 * PLATFORM_LENGTH, name = 'frame') {
    super();
    this.clock = clock;
    this.velocity = velocity;
    this.position.x = position.x;
    this.position.y = position.y;
    this.position.z = position.z;
    this.lightningBolts = [];
    this.lightBubbles = [];
    this.particleClouds = [];
    this.arcs = [];
    this.rays = [];
    this.paths = [];
    this.timeRate = 1;
    this.currentTime = 0;
    this.nearTarget = new Object3D();
    this.nearTarget.position.z = 1000;
    this.farTarget = new Object3D();
    this.spaceTimeEvents = [];
    this.maxDistance = maxDistance;
    this.name = name;
    scene.add(this);
  }

  clearMessage() {
    if (!!this.message) {
      this.remove(this.message);
      this.message = null;
    }
  }

  update(gmma = 1) {
    this.currentTime += this.timeRate * this.clock.getDelta();
    if (this.velocity.z < 0) {
      if (PLATFORM_CENTER.z - this.position.z <= this.maxDistance) {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.position.z += this.velocity.z * gmma;
        if (this.position.z < PLATFORM_CENTER.z - this.maxDistance) {
          this.position.z = PLATFORM_CENTER.z - this.maxDistance;
        }
      }
    }
    if (this.velocity.z > 0) {
      if (this.position.z - PLATFORM_CENTER.z <= this.maxDistance) {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.position.z += this.velocity.z * gmma;
        if (this.position.z > PLATFORM_CENTER.z + this.maxDistance) {
          this.position.z = PLATFORM_CENTER.z + this.maxDistance;
        }
      }
    }
  }

  clearLightning() {
    for (let bolt of this.lightningBolts) {
      this.remove(bolt);
    }
    for (let bubble of this.lightBubbles) {
      this.remove(bubble);
    }
    for (let cloud of this.particleClouds) {
      this.remove(cloud);
    }
    for (let arc of this.arcs) {
      this.remove(arc);
    }
    for (let ray of this.rays) {
      this.remove(ray);
    }
    for (let path of this.paths) {
      this.remove(path);
    }
    this.lightningBolts = [];
    this.lightBubbles = [];
    this.particleClouds = [];
    this.arcs = [];
    this.rays = [];
    this.paths = [];
  }

  dropLightning(position, c, color, life = 0.5, height = 20) {
    const bolt = new Lightning(position, c, 0.02, this.currentTime, color, life, height);
    this.add(bolt);
    this.lightningBolts.push(bolt);
  }

  dropLightBubble(position, c, delay, color, playRate = 1, renderOrder = 0, name = '') {
    const bubble = new LightBubble(position, c, 0.001, delay, playRate, color, renderOrder, name);
    this.add(bubble);
    this.lightBubbles.push(bubble);
  }

  dropLightRay(position, target, offset, c, delay, undilated, color, label, font, playRate = 1, renderOrder = 0) {
    const ray = new LightRay(position, target, offset, c, 0.001, delay, undilated, playRate, color, label, font);
    ray.renderOrder = renderOrder;
    this.add(ray);
    this.rays.push(ray);
    return ray;
  }

  // dropLightPath(position, target, offset, generator, color, text, font, renderOrder = 0) {
  //   const ray = new LightPath(position, target, offset, generator, color, text, font);
  //   ray.renderOrder = renderOrder;
  //   this.add(ray);
  //   this.paths.push(ray);
  // }

  dropParticleCloud(position, c, delay, color, playRate = 1, renderOrder = 0) {
    const cloud = new ParticleCloud(position, c, 0.001, delay, playRate, color);
    cloud.renderOrder = renderOrder;
    this.add(cloud);
    this.particleClouds.push(cloud);
  }

  dropArc(position, c, color, renderOrder = 0, life = 0.5) {
    const arc = new Arc(position, c, 0.02, this.currentTime, 1, color, life);
    arc.renderOrder = renderOrder;
    this.add(arc);
    this.arcs.push(arc);
  }

  addDoubleArrow(origin, left, right, color, label, font, yRotation = 0) {
    const doubleArrow = new DoubleArrow(origin, left, right, color, label, font);
    doubleArrow.rotation.y = yRotation;
    this.add(doubleArrow);
    this.paths.push(doubleArrow);
    return doubleArrow;

  }

  addArrow(origin, target, color, label, font, yRotation = 0) {
    const arrow = new Arrow(origin, target, color, label, font);
    arrow.rotation.y = yRotation;
    this.add(arrow);
    this.paths.push(arrow);
    return arrow;

  }

  updateLightning() {
    for (let cloud of this.particleClouds) {
      cloud.update();
    }
    for (let bolt of this.lightningBolts) {
      bolt.update(this.currentTime - bolt.startTime);
    }
    for (let bubble of this.lightBubbles) {
      bubble.update();
    }
    for (let arc of this.arcs) {
      arc.update(this.currentTime - arc.startTime);
    }
    for (let ray of this.rays) {
      ray.update();
    }
    for (let path of this.paths) {
      path.update();
    }
  }

  addEvent(x, y, z, t, gamma = 1, callback = () => { }) {
    const evt = new SpaceTimeEvent(this, x, y, z, t, gamma, callback);
    this.spaceTimeEvents.push(evt);
    return evt;
  }

}

class SpaceTimeEvent {
  constructor(frame, x, y, z, t, gamma = 1, callback = () => { }) {
    this.frame = frame;
    this.x = x;
    this.y = y;
    this.z = z;
    this.gamma = gamma;
    this.t = t;
    this.t = Math.floor(t);
    this.callback = callback;
  }

  lorentzTransform(targetFrame, v, c) {
    const gamma = 1 / Math.sqrt(1 - Math.pow(v / c, 2));
    const z = (this.z - v * this.t) * gamma;
    const x = this.x;
    const y = this.y;
    let t = (this.t - (v * (this.z)) / Math.pow(c, 2)) * gamma;
    t = Math.floor(t);
    const evtPrime = targetFrame.addEvent(x, y, z, t, gamma, () => { });
    return evtPrime;
  }


  fireWhenReady(ticks, ticksToOrigin) {
    if (ticks - Math.floor(ticksToOrigin / this.gamma) === this.t) {
      this.callback(this.frame, this.x, this.y, this.z);
    }
  }
}


class GedaClock extends Object3D {
  constructor(color, initialAngle, totalLength, c, gamma, ticking = false, visible = true, radius = 0.003, height = 0.05) {
    super();
    const handgeometry = new CylinderBufferGeometry(0.003, 0.003, 0.05, 32, 32, false);
    handgeometry.translate(0, +0.025, 0);
    const handmaterial = new MeshPhongMaterial({ color: color });
    const hand = new Mesh(handgeometry, handmaterial);
    hand.rotation.z = 0;

    const ringGeometry = new RingGeometry(.06, .065, 32);
    const casing = new Mesh(ringGeometry, new MeshBasicMaterial({ color: color, side: DoubleSide }));
    this.add(casing);

    this.hand = hand;
    this.add(hand);


    this.renderOrder = 0;
    this.totalLength = totalLength;
    this.ticks = 0;
    this.visible = visible;

    this.tickLength = (this.totalLength / c) * gamma;
    this.omega = Math.PI / this.tickLength;
    this.ticking = ticking;
    this.labels = [];

  }

  reset(c, gamma = 1, ticking = false) {
    this.ticks = 0;
    this.tickLength = this.totalLength / (c) * gamma;
    this.omega = Math.PI / this.tickLength;
    this.hand.rotation.z = 0;
    this.hand.rotation.x = 0;
    this.ticking = ticking;
    if (!!this.label) {
      this.remove(this.label);
      this.label = null;

    }
    this.labels.forEach(lbl => this.remove(lbl));
    this.labels = [];
  }

  tick() {
    if (this.ticking) {
      this.ticks++;
      this.hand.rotation.z += this.omega;

    }
  }

  setLabel(label, font, color = 0xFFFF00) {
    if (!!this.label) {
      this.remove(this.label);
    }
    const shapes = font.generateShapes(label, 0.03);
    const textgeometry = new ShapeBufferGeometry(shapes);
    textgeometry.computeBoundingBox();
    const xMid = - 0.5 * (textgeometry.boundingBox.max.x - textgeometry.boundingBox.min.x);
    const yMid = - 0.5 * (textgeometry.boundingBox.max.y - textgeometry.boundingBox.min.y);
    const zMid = - 0.5 * (textgeometry.boundingBox.max.z - textgeometry.boundingBox.min.z);
    textgeometry.translate(0, yMid, zMid);
    const basic = new MeshBasicMaterial({
      color: color,
      side: DoubleSide
    });
    const text = new Mesh(textgeometry, basic);
    text.renderOrder = -5;
    text.position.z = -0.02;
    text.position.x = - 0.10;
    text.rotation.y = Math.PI;
    this.add(text);
    this.label = text;
    return text;
  }
}

// Not used 
class Signal extends Object3D {
  constructor(z, motionDirection) {
    super();
    this.motionDirection = motionDirection;
    const forwardColor = (this.motionDirection === -1) ? 0x33FF66 : 0xFFFFFF;
    const rearColor = (this.motionDirection === -1) ? 0xFFFFFF : 0x33FF66;
    const signalPost = new Mesh(
      new CylinderBufferGeometry(.003, 0.003, 0.07),
      new MeshPhongMaterial({ color: 0xCB4335, shininess: 30 })
    );
    signalPost.position.x = -0.10;
    signalPost.position.y = 0.035;
    const signal = new SpotLight(0xFFFFE0, 15);
    signal.castShadow = true;
    signal.target.position.set(-0.08, 0.1, -this.motionDirection * 20);
    signal.angle = Math.PI / 40;
    signal.add(new Mesh(new CircleBufferGeometry(0.01, 10),
      new MeshBasicMaterial({ color: forwardColor, side: FrontSide })));

    signal.position.x = -0.10;
    signal.position.y = 0.08;
    signal.position.z = this.motionDirection * 0.003; //camera.position.z - 35 * .12;
    this.signal = signal;
    const rearface = new Mesh(
      new CircleBufferGeometry(0.01, 10),
      new MeshPhongMaterial({ color: rearColor, side: DoubleSide })
    );
    rearface.position.x = -0.10;
    rearface.position.y = 0.08;
    rearface.position.z = -this.motionDirection * 0.003;
    this.rearface = rearface;
    this.position.z = z;
    this.add(signal);
    this.add(signalPost);
    this.add(rearface);
    this.add(signal.target);
  }

  switch() {
    this.motionDirection = -this.motionDirection;
    const forwardColor = (this.motionDirection === -1) ? 0x33FF66 : 0xFFFFFF;
    const rearColor = (this.motionDirection === -1) ? 0xFFFFFF : 0x33FF66;
    this.signal.target.position.z = -this.motionDirection * 20;
    this.signal.children[0].material.side = (this.motionDirection === -1) ? FrontSide : BackSide;
  }
}

function moveCamera(omega, target, motionDirection = 1) {
  this.theta = this.theta + motionDirection * omega;
  this.position.x = target.position.x + 1.5 * TRAIN_LENGTH;
  this.position.z = target.position.z + 1.25 * TRAIN_LENGTH * Math.sin(this.theta);
  // this.position.z = target.position.z;// + motionDirection * 1.5 * TRAIN_LENGTH * Math.sin(this.theta);
  const targetPosition = target.position.clone();
  targetPosition.y = 0.3;
  this.position.y = targetPosition.y;
  this.lookAt(targetPosition);
}


class Dashboard extends Object3D {
  constructor(frame, camera, font) {
    super();
    this.frame = frame;
    this.camera = camera;
    this.font = font;
    this.quaternion.copy(camera.quaternion);
    this.camera.dashboard = this;
    this.frame.add(this);
    this.labels = [];
  }
  addLabel(label, position, color = 0xFFFF00) {
    const shapes = this.font.generateShapes(label, 0.02);
    const textgeometry = new ShapeBufferGeometry(shapes);
    textgeometry.computeBoundingBox();
    const xMid = - 0.5 * (textgeometry.boundingBox.max.x - textgeometry.boundingBox.min.x);
    const yMid = - 0.5 * (textgeometry.boundingBox.max.y - textgeometry.boundingBox.min.y);
    const zMid = - 0.5 * (textgeometry.boundingBox.max.z - textgeometry.boundingBox.min.z);
    textgeometry.translate(xMid, yMid, zMid);
    const basic = new MeshBasicMaterial({
      color: color,
      side: DoubleSide
    });
    const text = new Mesh(textgeometry, basic);
    text.renderOrder = -5;
    text.position.copy(position);
    this.add(text);
    this.labels.push(text);
    return text;
  }

  clearLabels() {
    this.labels.forEach(lbl => {
      this.remove(lbl);
    });
    this.labels = [];

  }
}


class Camera extends PerspectiveCamera {

  constructor(position, target, velocity, clock, containerId) {
    let aspect = window.innerWidth / window.innerHeight / 2;
    const container = document.getElementById(containerId);
    if (!!container) {
      const dimensions = container.getBoundingClientRect();
      aspect = dimensions.width / dimensions.height;
    }
    super(55, aspect, 0.01, 5);
    // this.updateProjectionMatrix();
    this.position.x = position.x;
    this.position.y = position.y;
    this.position.z = position.z;
    this.lookAt(target.position);
    this.velocity = velocity;
    this.clock = clock;
    this.timeDilation = 1;
    this.motion = this.defaultMotion;
    this.theta = -Math.PI / 2;
    this.sign = -1;
    this.labels = [];
  }

  addLabel(label, font, position, color = 0xFFFF00) {
    const shapes = font.generateShapes(label, 0.03);
    const textgeometry = new ShapeBufferGeometry(shapes);
    textgeometry.computeBoundingBox();
    const xMid = - 0.5 * (textgeometry.boundingBox.max.x - textgeometry.boundingBox.min.x);
    const yMid = - 0.5 * (textgeometry.boundingBox.max.y - textgeometry.boundingBox.min.y);
    const zMid = - 0.5 * (textgeometry.boundingBox.max.z - textgeometry.boundingBox.min.z);
    textgeometry.translate(xMid, yMid, zMid);
    const basic = new MeshBasicMaterial({
      color: color,
      side: DoubleSide
    });
    const text = new Mesh(textgeometry, basic);
    text.renderOrder = -5;
    text.position.copy(position);
    this.add(text);
    this.labels.push(text);
    return text;
  }

  clearLabels() {
    this.labels.forEach(lbl => {
      this.remove(lbl);
    });
    this.labels = [];

  }
}


class Gedanken {


  constructor(font, distanceInTrainLengths = 2, applyGamma = false, containerId = 'Irf', showLengths = false, numIntervals = 5, initialDistanceFactor = 1,
    v = 0.0025, cByv = 1.25
  ) {
    this.introduction = '';
    this.font = font;
    this.applyGamma = applyGamma;
    this.showLengths = showLengths;
    this.numIntervals = numIntervals;
    this.initialDistanceFactor = initialDistanceFactor;
    this.containerId = containerId;
    this.distanceInTrainLengths = distanceInTrainLengths;
    this.matLite = new MeshPhongMaterial({
      color: 0xffffff,
      side: DoubleSide
    });
    this.matLiteBasic = new MeshBasicMaterial({
      color: 0xffffff,
      side: DoubleSide
    });
    this.motionDirection = -1;
    this.NORMAL_V = v;
    this.NORMAL_C = this.NORMAL_V * cByv;

    this.C = this.NORMAL_C;
    this.V = this.NORMAL_V;
    this.initializeSpeeds();
    this.trainClockInTrainView = new Clock();
    this.platformClockInTrainView = new Clock();
    this.trainClockInPlatformView = new Clock();
    this.platformClockInPlatformView = new Clock();
    this.trainScene = this.createScene();
    this.placeDirectionalLight(this.trainScene, new Vector3(5, 5, 13.5));
    this.placeDirectionalLight(this.trainScene, new Vector3(-5, 5, -13.5));
    this.trainSceneRenderer = this.createRenderer('train' + containerId);

    this.platformScene = this.createScene();
    this.placeDirectionalLight(this.platformScene, new Vector3(5, 5, 13.5));
    this.placeDirectionalLight(this.platformScene, new Vector3(-5, 5, -13.5));
    this.platformSceneRenderer = this.createRenderer('platform' + containerId);

    this.infinityRailroadInTrainView = this.createRailroad(this.trainScene);
    this.infinityRailroadInPlatformView = this.createRailroad(this.platformScene);

    this.maxDistancePlatformView = this.initialDistanceFactor * this.distanceInTrainLengths * PLATFORM_LENGTH;
    this.maxDistanceTrainView = this.initialDistanceFactor * this.distanceInTrainLengths * TRAIN_LENGTH;
    this.trainFrameInTrainView = new ReferenceFrame(
      this.trainScene,
      new Vector3(0, 0, 11 + this.maxDistanceTrainView),
      this.trainClockInTrainView,
      new Vector3(0, 0, -this.v),
      this.maxDistanceTrainView,
      'Train Prime'
    );
    this.attachBobLabel(this.trainFrameInTrainView, "Train-Bob", 2 * Math.PI, .125, true);
    this.platformFrameInTrainView = new ReferenceFrame(
      this.trainScene,
      new Vector3(0.06, 0, 11),
      this.platformClockInTrainView,
      new Vector3(0, 0, 0),
      this.maxDistanceTrainView,
      'Platform Prime'
    );
    // this.platformFrameInTrainView.rotation.y = -Math.PI;
    this.attachBobLabel(this.platformFrameInTrainView, "Platform-Bob", 2 * Math.PI, .10, false);
    this.trainFrameInPlatformView = new ReferenceFrame(
      this.platformScene,
      new Vector3(0, 0, 11 + this.maxDistancePlatformView),
      this.trainClockInPlatformView,
      new Vector3(0, 0, -this.v),
      this.maxDistancePlatformView,
      'Train'
    );
    this.platformFrameInPlatformView = new ReferenceFrame(
      this.platformScene,
      new Vector3(0.06, 0, 11),
      this.platformClockInPlatformView,
      new Vector3(0, 0, 0),
      this.maxDistancePlatformView,
      'Platform');
    this.attachBobLabel(this.platformFrameInPlatformView, "Platform-Bob", Math.PI, .10, true);
    this.attachBobLabel(this.trainFrameInPlatformView, "Train-Bob", Math.PI, .125, false);

    // this.createSignals();

    this.platformInTrainView = this.createPlatform(this.platformFrameInTrainView);
    this.platformInPlatformView = this.createPlatform(this.platformFrameInPlatformView);
    this.trainCameraInitialPosition = new Vector3(0.06, .15, this.trainFrameInTrainView.position.z + 1.5 * TRAIN_LENGTH);
    this.trainCamera = new Camera(
      this.trainCameraInitialPosition,
      // new Vector3(0.06, .15, this.trainFrameInTrainView.position.z),
      this.trainFrameInTrainView,
      new Vector3(0, 0, .1),
      this.trainClockInTrainView,
      'train' + this.containerId
    );

    this.platformCameraInitialPosition = new Vector3(0, 0.15, this.platformFrameInPlatformView.position.z - 1.5 * TRAIN_LENGTH);
    this.platformCamera = new Camera(
      this.platformCameraInitialPosition,
      this.platformFrameInPlatformView,
      new Vector3(0, 0, 0),
      this.platformClockInPlatformView,
      'platform' + this.containerId
    );

    this.trainCamera.theta = - initialDistanceFactor * Math.PI / 2;
    this.platformCamera.theta = - initialDistanceFactor * Math.PI / 2;



    this.trainInTrainView = this.createTrain(this.trainFrameInTrainView);
    this.trainInPlatformView = this.createTrain(this.trainFrameInPlatformView);
    this.relatify();

    this.createBobs();
    this.bobDeltaPrevious = 0;
    this.bobDeltaPreviousTrainView = 0;
    this.trainScene.helper.position.z = this.platformFrameInTrainView.position.z;
    this.platformScene.helper.position.z = this.platformFrameInPlatformView.position.z;
  }

  resetScene() {
    this.trainFrameInTrainView.clearLightning();
    this.platformFrameInTrainView.clearLightning();
    this.trainFrameInPlatformView.clearLightning();
    this.platformFrameInPlatformView.clearLightning();

    this.trainFrameInTrainView.spaceTimeEvents = [];
    this.platformFrameInTrainView.spaceTimeEvents = [];
    this.trainFrameInPlatformView.spaceTimeEvents = [];
    this.platformFrameInPlatformView.spaceTimeEvents = [];
    this.trainFrameInTrainView.label.rotation.y = 2 * Math.PI;
    this.platformFrameInTrainView.label.rotation.y = 2 * Math.PI;
    this.trainFrameInPlatformView.label.rotation.y = Math.PI;
    this.platformFrameInPlatformView.label.rotation.y = Math.PI;

    this.motionDirection = -1;
    this.initializeSpeedsAndRelatify();
    const gmma = (this.applyGamma) ? this.gamma : 1;
    this.trainFrameInPlatformView.position.z = 11 + this.initialDistanceFactor * this.distanceInTrainLengths * PLATFORM_LENGTH;
    this.trainFrameInTrainView.position.z = 11 + this.initialDistanceFactor * this.distanceInTrainLengths * PLATFORM_LENGTH ;
    this.trainCamera.theta = - this.initialDistanceFactor * Math.PI / 2;
    this.platformCamera.theta = - this.initialDistanceFactor * Math.PI / 2;
    this.trainCamera.position.copy(this.trainCameraInitialPosition);
    this.platformCamera.position.copy(this.platformCameraInitialPosition);

    this.trainFrameInTrainView.clearMessage();
    this.trainFrameInPlatformView.clearMessage();
    this.platformFrameInPlatformView.clearMessage();
    this.platformFrameInTrainView.clearMessage();
  }

  initialize() {
    const lightSpeedElem = document.getElementById('lightSpeed');
    if (!!lightSpeedElem) {
      lightSpeedElem.addEventListener('change', this.updateLightSpeedFn);
    }
    this.animating = true;
  }


  updateLightSpeedFn = (event) => {
    event.stopPropagation();
    let cbyv = event.target.value;
    document.getElementById('lightSpeedValue').innerText = cbyv;
    this.updateLightSpeed(cbyv);
  }

  updateLightSpeed(cbyv) {
    this.updateC(cbyv);
    this.animating = false;
    this.resetScene();
    this.animating = true;

  }

  updateC(cbyv) {
    this.vByc = 1 / cbyv;
    this.C = this.V / this.vByc;
  }

  initializeSpeeds() {
    this.c = this.C;
    this.v = this.V;  // relative velocity
    this.playRate = this.c / this.NORMAL_C;
    this.vByc = this.v / this.c;
    this.gamma = 1 / Math.sqrt(1 - Math.pow(this.vByc, 2));
    const gmma = this.applyGamma ? this.gamma : 1;
    this.omega = - Math.PI / (2 * (this.distanceInTrainLengths * PLATFORM_LENGTH / this.v)); // angular velocity of camera
    this.omegaTrainView = - Math.PI / (2 * (this.distanceInTrainLengths * PLATFORM_LENGTH / this.v)); // angular velocity of camera
    this.omegaPlatformView = - Math.PI / (2 * (this.distanceInTrainLengths * PLATFORM_LENGTH / this.v)); // angular velocity of camera

  }

  initializeSpeedsAndRelatify() {
    this.initializeSpeeds();
    this.updateReferenceFrameSpeeds();
    this.relatify();
  }

  relatify() {
    if (this.applyGamma) {

      const distanceFromTrainBobToEndOfPlatform = this.maxDistancePlatformView + PLATFORM_LENGTH / 2;
      const distanceFromTrainBobToEndOfPlatformInTrainView = distanceFromTrainBobToEndOfPlatform / this.gamma;
      this.maxDistanceTrainView = distanceFromTrainBobToEndOfPlatformInTrainView - PLATFORM_LENGTH / 2 / this.gamma;


      // **** TMP *****/
      this.maxDistanceTrainView = this.maxDistancePlatformView;
      this.platformFrameInTrainView.maxDistance = this.maxDistanceTrainView;
      this.trainFrameInTrainView.maxDistance = this.maxDistanceTrainView;

      this.trainFrameInTrainView.position.z = 11 - this.motionDirection * this.maxDistanceTrainView;

      this.trainFrameInTrainView.position.z = this.platformFrameInTrainView.position.z - this.motionDirection * this.maxDistanceTrainView;
      this.trainFrameInPlatformView.position.z = this.platformFrameInPlatformView.position.z - this.motionDirection * this.maxDistancePlatformView;
      this.trainFrameInPlatformView.train.scale.set(1, 1, 1 / this.gamma);
      this.platformFrameInTrainView.platform.scale.set(1, 1, 1 / this.gamma);
    }
  }


  orientLabels() {
    const platformCameraQ = this.platformCamera.quaternion.clone();
    const trainCameraQ = this.trainCamera.quaternion.clone();
    let q = new Quaternion(0, 1, 0, 0);
    q.setFromAxisAngle(new Vector3(0, 1, 0), 2 * Math.PI);
    platformCameraQ.multiply(q);
    trainCameraQ.multiply(q);

    this.platformFrameInPlatformView.label.quaternion.copy(platformCameraQ);
    this.platformFrameInTrainView.label.quaternion.copy(trainCameraQ);
    this.trainFrameInPlatformView.label.quaternion.copy(platformCameraQ);
    this.trainFrameInTrainView.label.quaternion.copy(trainCameraQ);

    if (!!this.platformFrameInPlatformView.message)
      this.platformFrameInPlatformView.message.quaternion.copy(platformCameraQ);
    if (!!this.platformFrameInTrainView.message)
      this.platformFrameInTrainView.message.quaternion.copy(trainCameraQ);
    if (!!this.trainFrameInPlatformView.message)
      this.trainFrameInPlatformView.message.quaternion.copy(platformCameraQ);

    if (!!this.trainFrameInTrainView.message)
      this.trainFrameInTrainView.message.quaternion.copy(trainCameraQ);

    this.platformFrameInPlatformView.paths.forEach(path => {
      if (!!path.label) {
        path.label.quaternion.copy(platformCameraQ);
      }
    });
    this.trainFrameInPlatformView.paths.forEach(path => {
      if (!!path.label) {
        path.label.quaternion.copy(platformCameraQ);
      }
    });
    this.platformFrameInTrainView.paths.forEach(path => {
      if (!!path.label) {
        path.label.quaternion.copy(trainCameraQ);
      }
    });
    this.trainFrameInTrainView.paths.forEach(path => {
      if (!!path.label) {
        path.label.quaternion.copy(trainCameraQ);
      }
    });
    if (this.trainDashboard) {
      this.trainDashboard.quaternion.copy(trainCameraQ);
    }
    if (this.platformDashboard) {
      this.platformDashboard.quaternion.copy(platformCameraQ);
    }


  }

  orientClocks() {
    const platformCameraQ = this.platformCamera.quaternion.clone();
    const trainCameraQ = this.trainCamera.quaternion.clone();
    let q = new Quaternion(0, 1, 0, 0);
    q.setFromAxisAngle(new Vector3(0, 1, 0), Math.PI);
    platformCameraQ.multiply(q);
    trainCameraQ.multiply(q);

    if (!!this.platformFrameInPlatformView.watch) {
      this.platformFrameInPlatformView.watch.quaternion.copy(platformCameraQ);
    }
    if (!!this.platformFrameInTrainView.watch) {
      this.platformFrameInTrainView.watch.quaternion.copy(trainCameraQ);
    }
    if (!!this.trainFrameInPlatformView.watch) {
      this.trainFrameInPlatformView.watch.quaternion.copy(platformCameraQ);
    }
    if (!!this.trainFrameInTrainView.watch) {
      this.trainFrameInTrainView.watch.quaternion.copy(trainCameraQ);
    }
  }

  updateReferenceFrameSpeeds() {

    this.trainFrameInPlatformView.velocity.z = this.motionDirection * this.v;
    this.trainFrameInTrainView.velocity.z = this.motionDirection * this.v;
    // this.trainFrameInPlatformView.velocity.z = (this.trainFrameInPlatformView.velocity.z >= 0) ? this.v : -this.v;
    // this.trainFrameInTrainView.velocity.z = (this.trainFrameInTrainView.velocity.z >= 0) ? this.v : -this.v;
  }


  clear() {

  }

  createScene() {
    const scene = new Scene();
    scene.lights = [];
    scene.background = new Color(0x000000);
    const ambientLight = new AmbientLight(0x505050);
    ambientLight.castShadow = false;
    scene.add(ambientLight);
    scene.lights.push(ambientLight);
    const ground = new Mesh(
      new PlaneBufferGeometry(1000, 1000, 100, 100),
      new ShadowMaterial({ opacity: 1 })
    );



    ground.position.y = 0;
    ground.rotation.x = - Math.PI / 2; // rotates X/Y to X/Z
    ground.receiveShadow = true;
    ground.renderOrder = -100;
    scene.add(ground);
    scene.ground = ground;


    const helper = new GridHelper(100, 20);
    helper.material.opacity = 1;
    scene.add(helper);
    scene.helper = helper;
    scene.nearTarget = new Object3D();
    scene.nearTarget.position.z = 1000;
    scene.farTarget = new Object3D();
    scene.farTarget.position.z = -1000;
    return scene;
  }

  addLengthHelper(frame, xOffset = 0, gamma = 1, color = PLATFORM_COLOR) {
    const helper = new GridHelper(1, 5, color, color);
    helper.material.opacity = 1;
    helper.rotation.z = Math.PI / 2;
    helper.position.x = xOffset;
    frame.add(helper);

  }

  switchOffLights(scene) {
    scene.lights.forEach((light) => light.visible = false);
  }

  placeDirectionalLight(scene, position) {
    const dirLight = new DirectionalLight(0xffffff, 1);
    dirLight.position.x = position.x;
    dirLight.position.y = position.y;
    dirLight.position.z = position.z;
    dirLight.castShadow = false;
    scene.lights.push(dirLight);
    scene.add(dirLight);
  }

  createRenderer(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      return null;
    }
    const dimensions = container.getBoundingClientRect();
    const renderer = new WebGLRenderer({ antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.setSize(dimensions.width, dimensions.height);
    container.appendChild(renderer.domElement);
    return renderer;
  }

  createRailroad(scene) {
    const points = [];
    points.push(new Vector3(0.0075, 0, 100));
    points.push(new Vector3(0.0075, 0, -100));

    const track1geo = new BufferGeometry().setFromPoints(points);
    const track1 = new Line(track1geo, new LineBasicMaterial({ color: 0xffffff, linewidth: 2 }));

    const points2 = [];
    points2.push(new Vector3(-0.0075, 0, 100));
    points2.push(new Vector3(-0.0075, 0, -100));
    const track2geo = new BufferGeometry().setFromPoints(points2);
    const track2 = new Line(track2geo, new LineBasicMaterial({ color: 0xffffff, linewidth: 2 }));

    const railRoad = new Object3D();
    railRoad.add(track1);
    railRoad.add(track2);
    scene.add(railRoad);
    return railRoad;
  }

  addVerticalLine(frame, color = 0xFFFF00, top = 0.1, bottom = -0.1) {
    const points = [];
    points.push(new Vector3(0, top, 0));
    points.push(new Vector3(0, bottom, 0));
    const geo = new BufferGeometry().setFromPoints(points);
    const line = new Line(geo, new LineBasicMaterial({ color: color }));
    frame.add(line);

  }

  createSignals() {
    this.signalInTrainView = new Signal(-0.5, -1);
    this.signalInPlatformView = new Signal(-0.5, -1);
    this.platformFrameInTrainView.add(this.signalInTrainView);
    this.platformFrameInPlatformView.add(this.signalInPlatformView);

    this.signal2InTrainView = new Signal(0.5, -1);
    this.signal2InPlatformView = new Signal(0.5, -1);
    this.platformFrameInTrainView.add(this.signal2InTrainView);
    this.platformFrameInPlatformView.add(this.signal2InPlatformView);
  }



  createPlatform(referenceFrame, applyGamma = false, lengthLabel = '1') {
    const platform = new Mesh(
      new BoxBufferGeometry(0.06, 0.02, PLATFORM_LENGTH),
      new MeshPhongMaterial({ color: PLATFORM_COLOR, shininess: 30 })
    );
    platform.receiveShadow = true;
    platform.castShadow = true;
    platform.position.y = 0.01;

    if (this.showLengths) {
      let z = -PLATFORM_LENGTH / 2;
      for (let k = 0; k < (this.numIntervals + 1); k++) {

        const points = [];
        points.push(new Vector3(0, -.3, z));
        points.push(new Vector3(0, .3, z));

        const geo = new BufferGeometry().setFromPoints(points);
        const gridline = new Line(geo, new LineBasicMaterial({ color: PLATFORM_COLOR, linewidth: 2 }));
        platform.add(gridline);
        z += (PLATFORM_LENGTH / this.numIntervals);

      }



    }

    referenceFrame.add(platform);
    referenceFrame.platform = platform;
    return platform;
  }

  createTrain(referenceFrame, applyGamma = false) {
    const geometry = new BoxBufferGeometry(0.04, 0.05, CAR_LENGTH);
    const material = new MeshPhongMaterial({ color: TRAIN_COLOR, shininess: 30 });

    const train = new Object3D;

    let z = - TRAIN_LENGTH / 2 + CAR_LENGTH / 2;
    for (let c = 0; c < 5; c++) {
      let car = new Mesh(geometry, material);
      car.position.z = z;
      z += (CAR_LENGTH + CAR_GAP);
      car.position.y = 0.025;
      car.position.x = 0;
      car.castShadow = true;
      car.receiveShadow = true;
      if (c === 2) {
        this.attachInfinityLabel(car, [0.025, -0.01, 0], Math.PI / 2, .03);
        this.attachInfinityLabel(car, [-0.025, -0.01, 0], Math.PI / 2, .03);
      }
      if (c === 0) {
        this.attachInfinityLabel(car, [0, -0.01, -CAR_LENGTH / 2 - 0.005], 0, .02);
      }
      if (c === 4) {
        this.attachInfinityLabel(car, [0, -0.01, CAR_LENGTH / 2 + .01], 0, .02);
      }
      train.add(car);
    }

    if (this.showLengths) {
      let z = -TRAIN_LENGTH / 2;
      for (let k = 0; k < (this.numIntervals + 1); k++) {

        const points = [];
        points.push(new Vector3(0, -.3, z));
        points.push(new Vector3(0, .3, z));

        const geo = new BufferGeometry().setFromPoints(points);
        const gridline = new Line(geo, new LineBasicMaterial({ color: TRAIN_COLOR, linewidth: 2 }));
        train.add(gridline);
        z += (TRAIN_LENGTH / this.numIntervals);

      }
    }


    referenceFrame.train = train;
    referenceFrame.add(train);
    return train;
  }

  createClock(frame, color, height, angle, circumference = 6, gamma = 1, linearVelocity = 1, ticking = true) {
    const watch = new GedaClock(color, angle, circumference, linearVelocity, gamma, ticking, true);
    watch.position.y = height;
    frame.add(watch);
    frame.watch = watch;
  }


  attachLabel(frame, label, offset, color = 0xFFFFFF) {
    const shapes = this.font.generateShapes(label, 0.05);
    const textgeometry = new ShapeBufferGeometry(shapes);
    textgeometry.computeBoundingBox();
    const xMid = - 0.5 * (textgeometry.boundingBox.max.x - textgeometry.boundingBox.min.x) - 0.004;
    textgeometry.translate(xMid, 0, 0);
    const basic = new MeshBasicMaterial({
      color: color,
      side: DoubleSide
    });
    const text = new Mesh(textgeometry, basic);
    text.renderOrder = -5;
    // text.rotation.y = rotation;
    text.rotation.y = Math.PI / 2;
    text.position.x = offset.x;
    text.position.y = offset.y;
    text.position.z = offset.z;
    frame.add(text);
    return text;
  }

  attachBobLabel(frame, label, rotation, yPos = 0.125, visible = true) {
    const shapes = this.font.generateShapes(label, 0.03);
    const textgeometry = new ShapeBufferGeometry(shapes);
    textgeometry.computeBoundingBox();
    const xMid = - 0.5 * (textgeometry.boundingBox.max.x - textgeometry.boundingBox.min.x) - 0.004;
    textgeometry.translate(xMid, 0, 0);
    const text = new Mesh(textgeometry, this.matLiteBasic);
    text.renderOrder = -5;
    text.rotation.y = rotation;
    // text.position.x = .05;
    text.position.y = yPos;
    frame.label = text;
    frame.label.visible = visible;
    frame.add(text);
  }

  attachMessage(frame, message, rotation, yPos = 0.20, visible = true, color = 0xFFFF00) {
    const shapes = this.font.generateShapes(message, 0.03);
    const textgeometry = new ShapeBufferGeometry(shapes);
    textgeometry.computeBoundingBox();
    const xMid = - 0.5 * (textgeometry.boundingBox.max.x - textgeometry.boundingBox.min.x) - 0.004;
    textgeometry.translate(xMid, 0, 0);
    const basic = new MeshBasicMaterial({
      color: color,
      side: DoubleSide
    });
    const text = new Mesh(textgeometry, basic);
    text.renderOrder = -5;
    text.rotation.y = rotation;
    // text.position.x = .05;
    text.position.y = yPos;
    frame.message = text;
    frame.message.visible = visible;
    frame.add(text);
  }

  attachInfinityLabel(car, translation, rotationY, size = 0.03) {
    const message = '\u221E';
    const shapes = this.font.generateShapes(message, size);
    const textgeometry = new ShapeBufferGeometry(shapes);
    textgeometry.computeBoundingBox();
    const xMid = - 0.5 * (textgeometry.boundingBox.max.x - textgeometry.boundingBox.min.x) - 0.004;
    textgeometry.translate(xMid, 0, 0);
    const material = new MeshBasicMaterial({
      color: 0x666666,
      side: DoubleSide
    });

    const text = new Mesh(textgeometry, material);
    text.renderOrder = -10;
    text.position.x = translation[0];
    text.position.y = translation[1];
    text.position.z = translation[2];
    text.rotation.y = rotationY;
    car.add(text);
  }

  createBobs() {
    let trainBob = new Bob(0.002);
    trainBob.rotation.y = 2 * Math.PI;
    trainBob.position.y = 0.04;
    trainBob.position.z = 0; //0.24;
    trainBob.castShadow = true;
    trainBob.receiveShadow = true;

    this.trainBobInTrainView = trainBob;
    this.trainInTrainView.add(this.trainBobInTrainView);

    trainBob = new Bob(0.002);
    trainBob.rotation.y = 2 * Math.PI;
    trainBob.position.y = 0.04;
    trainBob.position.z = 0; //0.24;
    trainBob.castShadow = true;
    trainBob.receiveShadow = true;

    this.trainBobInPlatformView = trainBob;
    this.trainInPlatformView.add(this.trainBobInPlatformView);

    let platformBob = new Bob(0.002);
    platformBob.rotation.y = Math.PI;
    platformBob.position.y = 0;
    platformBob.position.z = 0; //0.24;
    platformBob.castShadow = true;
    platformBob.receiveShadow = true;

    this.platformBobInTrainView = platformBob;
    this.platformInTrainView.add(this.platformBobInTrainView);

    platformBob = new Bob(0.002);
    platformBob.rotation.y = Math.PI;
    platformBob.position.y = 0;
    platformBob.position.z = 0; //0.24;
    platformBob.castShadow = true;
    platformBob.receiveShadow = true;

    this.platformBobInPlatformView = platformBob;
    this.platformInPlatformView.add(this.platformBobInPlatformView);
  }

  animate() {
    this.bobDeltaPrevious = this.trainFrameInPlatformView.position.z - this.platformFrameInPlatformView.position.z;
    this.bobDeltaPreviousTrainView = this.trainFrameInTrainView.position.z - this.platformFrameInTrainView.position.z;

    const gmma = (this.applyGamma) ? this.gamma : 1;

    this.trainFrameInPlatformView.update();
    this.trainFrameInTrainView.update();
    this.platformFrameInPlatformView.update();
    this.platformFrameInTrainView.update();
  }

  renderScenes() {
    if (!!this.trainSceneRenderer)
      this.trainSceneRenderer.render(this.trainScene, this.trainCamera);
    if (!!this.platformSceneRenderer)
      this.platformSceneRenderer.render(this.platformScene, this.platformCamera);

  }


  endOfTheLine() {

    return (
      (this.motionDirection === -1
        && this.trainFrameInPlatformView.position.z <= this.platformFrameInPlatformView.position.z - this.maxDistancePlatformView)
      ||
      // (this.trainFrameInPlatformView.velocity.z > 0 && this.trainFrameInPlatformView.position.z >= this.platformFrameInPlatformView.position.z + this.maxDistancePlatformView)
      (this.motionDirection === 1 && this.trainFrameInPlatformView.position.z >= this.platformFrameInPlatformView.position.z + this.maxDistancePlatformView)
    );
  }

  bobsAreTogether() {
    return isClose(this.trainFrameInTrainView.position.z, this.platformFrameInTrainView.position.z);
  }


  bobsHaveCrossed() {
    const bobDelta = this.trainFrameInPlatformView.position.z - this.platformFrameInPlatformView.position.z;
    const crossed = (this.bobDeltaPrevious > 0 && bobDelta < 0 || this.bobDeltaPrevious < 0 && bobDelta > 0);
    return crossed;
  }

  crossingStartedInPlatformView() {
    const bobDelta = this.trainFrameInPlatformView.position.z - this.platformFrameInPlatformView.position.z;

    const gmma = (this.applyGamma) ? this.gamma : 1;
    const crossingDistance = TRAIN_LENGTH / 2 / gmma;
    let started = false;
    if (this.motionDirection === -1) {
      started = (this.bobDeltaPrevious > crossingDistance && bobDelta < crossingDistance);
    }
    if (this.motionDirection === 1) {
      started = (this.bobDeltaPrevious < -crossingDistance && bobDelta > -crossingDistance);
    }
    return started;
  }

  crossingEndedInPlatformView() {
    const bobDelta = this.trainFrameInPlatformView.position.z - this.platformFrameInPlatformView.position.z;

    const gmma = (this.applyGamma) ? this.gamma : 1;
    const crossingDistance = -TRAIN_LENGTH / 2 / gmma;
    let ended = false;
    if (this.motionDirection === -1) {
      ended = (this.bobDeltaPrevious > crossingDistance && bobDelta < crossingDistance);
    }
    if (this.motionDirection === 1) {
      ended = (this.bobDeltaPrevious < -crossingDistance && bobDelta > -crossingDistance);
    }
    return ended;
  }
  crossingStartedInTrainView() {
    const bobDelta = this.trainFrameInTrainView.position.z - this.platformFrameInTrainView.position.z;
    const crossingDistance = TRAIN_LENGTH / 2;
    let started = false;
    if (this.motionDirection === -1) {
      started = (this.bobDeltaPreviousTrainView > crossingDistance && bobDelta < crossingDistance);
    }
    if (this.motionDirection === 1) {
      started = (this.bobDeltaPreviousTrainView < -crossingDistance && bobDelta > -crossingDistance);
    }
    return started;
  }

  crossingEndedInTrainView() {
    const bobDelta = this.trainFrameInTrainView.position.z - this.platformFrameInTrainView.position.z;

    const crossingDistance = -TRAIN_LENGTH / 2;
    let ended = false;
    if (this.motionDirection === -1) {
      ended = (this.bobDeltaPreviousTrainView > crossingDistance && bobDelta < crossingDistance);
    }
    if (this.motionDirection === 1) {
      ended = (this.bobDeltaPreviousTrainView < -crossingDistance && bobDelta > -crossingDistance);
    }
    return ended;
  }


  switchDirection() {
    this.motionDirection = -this.motionDirection;
    this.trainFrameInPlatformView.velocity.z = -this.trainFrameInPlatformView.velocity.z;
    this.trainFrameInTrainView.velocity.z = -this.trainFrameInTrainView.velocity.z;
    // this.signalInTrainView.switch();
    // this.signalInPlatformView.switch();
    // this.signal2InTrainView.switch();
    // this.signal2InPlatformView.switch();
  }

  clearAllLightning() {
    this.trainFrameInTrainView.clearLightning();
    this.platformFrameInTrainView.clearLightning();
    this.trainFrameInPlatformView.clearLightning();
    this.platformFrameInPlatformView.clearLightning();
  }

  clearAllMessages() {
    this.trainFrameInTrainView.clearMessage();
    this.platformFrameInTrainView.clearMessage();
    this.trainFrameInPlatformView.clearMessage();
    this.platformFrameInPlatformView.clearMessage();
  }

  updateAllLightning() {
    this.trainFrameInTrainView.updateLightning();
    this.platformFrameInTrainView.updateLightning();
    this.trainFrameInPlatformView.updateLightning();
    this.platformFrameInPlatformView.updateLightning();
  }


}




export { Gedanken, Dashboard, GedaClock, moveCamera, isClose };

