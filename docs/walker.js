/* Tests Bob's walking skills */
import {
  Scene, PerspectiveCamera,
  WebGLRenderer,
  DirectionalLight, PointLight,
  Vector3,
  Mesh,
  PlaneBufferGeometry,
  GridHelper,
  ShadowMaterial,
  Clock
} from 'https://unpkg.com/three/build/three.module.js'; //'./node_modules/three/build/three.module.js';
import { Bob } from './bob.js';



let scene, camera, renderer, lights;
let bob;
let frameCount = 0;


function initScene() {
  document.body.style.visibility = 'visible';

  scene = new Scene();

  camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.x = -5;
  camera.position.y = 8;
  camera.position.z = 10;
  // camera.lookAt(new Vector3(0, 0,20));

  const container = document.getElementById('threeContainer');
  if (!container) {
    return null;
  }

  const dimensions = container.getBoundingClientRect();

  renderer = new WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);


  const dirLight = new DirectionalLight(0xffffff, 1);
  dirLight.position.set(20, 30, 20);
  dirLight.castShadow = true;
  dirLight.shadow.camera.near = 1;
  dirLight.shadow.camera.far = 10;

  dirLight.shadow.camera.right = 1;
  dirLight.shadow.camera.left = - 1;
  dirLight.shadow.camera.top = 1;
  dirLight.shadow.camera.bottom = - 1;

  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  scene.add(dirLight);

  lights = [];
  lights[0] = new PointLight(0xffffff, 1, 0);
  lights[1] = new PointLight(0xffffff, 1, 0);
  lights[2] = new PointLight(0xffffff, 1, 0);

  lights[0].position.set(0, 200, 0);
  lights[1].position.set(100, 200, 100);
  lights[2].position.set(-100, -200, -100);

  scene.add(lights[0]);
  scene.add(lights[1]);
  scene.add(lights[2]);

  const scale = new Vector3(1, 1, 1);
  scale.x *= -1;

  const ground = new Mesh(
    new PlaneBufferGeometry(1000, 1000, 100, 100),
    new ShadowMaterial({ opacity: 1 })
  );

  ground.rotation.x = - Math.PI / 2; // rotates X/Y to X/Z
  ground.receiveShadow = true;
  scene.add(ground);

  const helper = new GridHelper(1000, 100);
  helper.material.opacity = 1;
  scene.add(helper);
  const bobPosition = new Vector3(0, 0, 0);

  bob = new Bob(0.15);
  bob.rotation.y = -Math.PI / 2;
  bob.position.copy(bobPosition);
  bob.castShadow = true;
  bob.receiveShadow = true;
  scene.add(bob);

  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }, false);



}

function render() {
  frameCount++;
  if (frameCount > 110)
     return;
  requestAnimationFrame(render);
  if (frameCount > 100)
    bob.stopWalking();
  else {
    bob.walk();
    bob.position.z += 0.05;
  }
  camera.position.z += 0.05;
  camera.lookAt(bob.position);

  renderer.render(scene, camera);
}


document.body.style.visibility = 'visible';
initScene();
render();

