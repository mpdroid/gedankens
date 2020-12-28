/* Tests Lightning and Light Bubble */
import * as THREE from './node_modules/three/build/three.module.js';
import {Lightning, LightBubble} from './lightning.js';

let clock;
let currentTime = 0;
const timeRate = 1;




let scene, camera, renderer, lights;
let lightning, bubble;
let lightningx;
let lightningz;

let state = {

    animateBones: true

};

function initScene() {
    document.body.style.visibility = 'visible';

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.x = 0;
    camera.position.y =20;
    camera.position.z = 0;
    // camera.lookAt(new THREE.Vector3(0, 0,20));

    const container = document.getElementById('threeContainer');
    if (!container) {
      return null;
    }

    const dimensions = container.getBoundingClientRect();

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);


    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
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
    lights[0] = new THREE.PointLight(0xffffff, 1, 0);
    lights[1] = new THREE.PointLight(0xffffff, 1, 0);
    lights[2] = new THREE.PointLight(0xffffff, 1, 0);

    lights[0].position.set(0, 200, 0);
    lights[1].position.set(100, 200, 100);
    lights[2].position.set(-100, -200, -100);

    scene.add(lights[0]);
    scene.add(lights[1]);
    scene.add(lights[2]);

    const scale = new THREE.Vector3(1, 1, 1);
    scale.x *= -1;

    const ground = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(1000, 1000, 100, 100),
        new THREE.ShadowMaterial({ opacity: 1 })
    );

    ground.rotation.x = - Math.PI / 2; // rotates X/Y to X/Z
    ground.receiveShadow = true;
    scene.add(ground);

    const helper = new THREE.GridHelper(1000, 100);
    helper.material.opacity = 1;
    scene.add(helper);



    const lightningPosition = new THREE.Vector3(0, 20, -20);
    const lightSpeed = 0.05;
    clock = new THREE.Clock();
    lightning = new Lightning(lightningPosition, lightSpeed, 0.5, 0, 0x00FFFF, 2, 10);
    bubble = new LightBubble(lightningPosition, lightSpeed, 1);
    scene.add(lightning);
    scene.add(bubble);


    window.addEventListener('resize', function () {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);

    }, false);



}

let frameCount = 0;
function render() {
    frameCount++;
    currentTime += timeRate * clock.getDelta();
    requestAnimationFrame(render);
    if (!!lightning) {
        lightning.update(currentTime);
        bubble.update();
    }

    renderer.render(scene, camera);

}


initScene();
render();

