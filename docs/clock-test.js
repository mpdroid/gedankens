/* Tests Bob's walking skills */
import * as THREE from './node_modules/three/build/three.module.js';
import {GedaClock} from './gedanken.js';



let scene, camera, renderer, lights;
let clock;
let frameCount = 0;


function initScene() {
    document.body.style.visibility = 'visible';
    document.body.style.backgroundColor = 'rgba(255,255,255,0)'

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xFFFFFF);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 20;
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
    document.body.style.backgroundColor = 'rgba(255,255,255,0)';


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
    // scene.add(ground);

    const helper = new THREE.GridHelper(1000, 100);
    helper.material.opacity = 1;
    // scene.add(helper);
  
    clock = new GedaClock( 0xFFA500,  Math.PI / 2, 600, 1, 1, true, true);
    clock.scale.multiplyScalar(100);
    clock.rotation.y = -Math.PI;
    scene.add(clock);
    window.addEventListener('resize', function () {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }, false);



}

function render() {
    frameCount++;
    requestAnimationFrame(render);
    clock.tick();
    camera.lookAt(clock.position);

    renderer.render(scene, camera);
}


initScene();
render();

