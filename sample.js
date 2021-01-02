import {
  WebGLRenderer,
  Scene,
  Mesh,
  BoxBufferGeometry,
  MeshBasicMaterial,
  MeshPhongMaterial,
  PerspectiveCamera,
  CameraHelper,
  AxesHelper,
  Object3D,
  Vector3,
  BufferGeometry,
  Line,
  LineBasicMaterial,
  AmbientLight, DirectionalLight,
  FontLoader,
  ShapeBufferGeometry,
  DoubleSide,
  Quaternion,
  Clock
} from 'https://unpkg.com/three/build/three.module.js'; //'./node_modules/three/build/three.module.js';

// bad for memory utilization
// import * as THREE from 'three';


import { Bob } from './bob.js';
import { Lightning } from './lightning.js';

const EPSILON = 0.01;
// RENDERER 

// use the element id to find the div hosting the scene
// match the stage dimensions to the container dimensions
const container = document.getElementById('stage');
const dimensions = container.getBoundingClientRect();
const renderer = new WebGLRenderer();
renderer.setSize(dimensions.width, dimensions.height);
container.appendChild(renderer.domElement);


// SCENE 
const scene = new Scene();
const axesHelper = new AxesHelper( 5 ); 
scene.add( axesHelper );


// PLATFORM
const platform = new Mesh(
  new BoxBufferGeometry(0.06, 0.02, 1),
  new MeshBasicMaterial({ color: 0xAAAAAA, shininess: 30 })
);
platform.position.set(0, 0.01, 0);
scene.add(platform);

const aspect = dimensions.width / dimensions.height;
const camera = new PerspectiveCamera(55, aspect, 0.01, 5);
// place the camera near the platform at an offset
// so you can see the perspective effect
camera.position.set(.75, 0.3, 1);
camera.lookAt(platform.position);


// RAILROAD
// railRoad is a composite object
const railRoad = new Object3D();
railRoad.position.set(0.08, 0, 0);

const points = [];
points.push(new Vector3(0, 0, 5));
points.push(new Vector3(0, 0, -5));
const trackGeometry = new BufferGeometry().setFromPoints(points);
const track1 = new Line(trackGeometry, 
      new LineBasicMaterial({ color: 0xffffff, linewidth: 2 }));
track1.position.set(-0.02, 0 , 0);
railRoad.add(track1);

// meshes can be deep cloned
const track2 = track1.clone();
track2.position.set(0.02, 0 , 0);
railRoad.add(track2);

scene.add(railRoad);

// TRAIN
const trainLength = 1;
const carLength = 0.9 /5 ;
const carGap = 0.1 / 4;
const carGeometry = new BoxBufferGeometry(0.04, 0.05, carLength);
const carMaterial = new MeshPhongMaterial({ color: 0xABEBC6, shininess: 30 });
const protoCar = new Mesh(carGeometry, carMaterial);
protoCar.castShadow = true;
protoCar.receiveShadow = true;

protoCar.position.y = 0.025;
protoCar.position.x = 0;

const train = new Object3D;
let z = - trainLength / 2 + carLength / 2;
for (let c = 0; c < 5; c++) {
  const car = protoCar.clone();
  car.position.z = z;
  z += (carLength + carGap);
  train.add(car);
}

train.position.set(0.08, 0 , -0.75);
scene.add(train);

// BOB
const trainBob = new Bob(0.002);
trainBob.rotation.y = 2 * Math.PI;
trainBob.position.y = 0.04;
trainBob.position.z = 0;
trainBob.castShadow = true;
trainBob.receiveShadow = true;
train.add(trainBob);

const platformBob = trainBob.clone();
platformBob.position.y = 0.01;
platformBob.position.z = 0;
platform.add(platformBob);

// TEXT
function addLabel(fnt, object3D, text) {
  const shapes = fnt.generateShapes(text, 0.03);
  const geometry = new ShapeBufferGeometry(shapes);
  geometry.computeBoundingBox();
  const xMid = - 0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x) - 0.004;
  geometry.translate(xMid, 0, 0);
  const basic = new MeshBasicMaterial({
    color: 0xFFFFFF,
    side: DoubleSide
  });
  const label = new Mesh(geometry, basic);
  label.position.y = .15;
  object3D.add(label);
  object3D.label = label;
}

// LIGHTS
const ambientLight = new AmbientLight(0xFFFFFF);
scene.add(ambientLight);

const dirLight = new DirectionalLight(0xCCCCCC, 1);
dirLight.position.set(0, 0, 5);
scene.add(dirLight);

// TEXT

const fontloader = new FontLoader();
fontloader.load('./assets/Roboto_Regular.json', (fnt) => {
  addLabel(fnt, platform, 'Platform Bob');
  addLabel(fnt, train, 'Train Bob');
  // initial rendering after fonts are loaded
  renderer.render(scene, camera);
});

function orientLabels() {
  const cameraQuaternion = camera.quaternion.clone();
  let q = new Quaternion(0, 1, 0, 0);
  q.setFromAxisAngle(new Vector3(0, 1, 0), 2 * Math.PI);
  cameraQuaternion.multiply(q);
  if(!!platform.label) {
    platform.label.quaternion.copy(cameraQuaternion);
  }
  if(!!train.label) {
    train.label.quaternion.copy(cameraQuaternion);
  }
}




// functions to drive animation
const omega = Math.PI / 1000;
let theta = 0;
function sinTheta() {
  return Math.sin(theta+=omega);
}

let lightning;
const clock = new Clock();
let currentTime = 0;
function isCrossing(displacement) {
  return Math.abs(displacement) < EPSILON;
}

function isEndOfLine(displacement) {
  return Math.abs(displacement) > 1 - EPSILON;
}

// renders scene in a loop
function render() {
  requestAnimationFrame(render);
  const displacement = sinTheta();
  const xDistanceToTrain =  displacement; 
  camera.position.x = xDistanceToTrain;
  camera.lookAt(platform.position);
  orientLabels();

  const zDistanceFromTrainToPlatform = displacement;
  train.position.z = zDistanceFromTrainToPlatform;

  // drop lightning if center of pass
  if (isCrossing(displacement)) {
    if (!lightning) {
      currentTime = 0;
      lightning = new Lightning(
        new Vector3(0.2, 0.01, 0), 5,
        0.01, .15, 0x00FFFF, 2, 20);
      scene.add(lightning);
    }
  }
  // remove lightning if end of pass
  if (isEndOfLine(displacement)) {
    if(!!lightning) {
      scene.remove(lightning);
      lightning = null;
    }
  }

  if(!!lightning) {
    lightning.update(currentTime);
  }

  currentTime += clock.getDelta();

  renderer.render(scene, camera);
}

render();