import {
  Vector3,
  SphereBufferGeometry,
  MeshPhongMaterial,Mesh,Vector2, DoubleSide,
  LatheBufferGeometry,
  CylinderBufferGeometry,
  SkinnedMesh,
  Skeleton,
  Bone,
  Object3D,
  Scene,
  Uint16BufferAttribute,
  Float32BufferAttribute
 }  from './node_modules/three/build/three.module.js';

let gui, scene, camera, renderer, orbit, ambientLight, lights, mesh, bones, skeletonHelper;

let state = {

    animateBones: true

};

function initScene() {
  document.body.style.visibility = 'visible';

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);

    // camera.position.set(0, 1.3, 4);
    camera.position.set(0, .1, 4);

    // camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
    // camera.position.z = 30;
    // camera.position.y = 30;

    const container = document.getElementById('threeContainer');
    if (!container) {
      return null;
    }

    const dimensions = container.getBoundingClientRect();

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    // renderer.setSize(dimensions.width, dimensions.height);
    // renderer.shadowMap.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    // document.body.appendChild(renderer.domElement);
    container.appendChild(renderer.domElement);


    ambientLight = new THREE.AmbientLight(0x000000);
    scene.add(ambientLight);

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
    const points = [];
    for ( let i = 0; i < 10; i ++ ) {
        points.push( new THREE.Vector2( (Math.sin( i * 0.2 ) * 10 + 5)/10, (( i - 5 ) * 2)/10 ) );
    }
    window.addEventListener('resize', function () {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);

    }, false);

    initBones();

}

function createGeometry(sizing) {

    var geometry = new THREE.CylinderBufferGeometry(
        0.03,                       // radiusTop
        0.1,                       // radiusBottom
        sizing.height,           // height
        8,                       // radiusSegments
        sizing.segmentCount, // heightSegments
        true                     // openEnded
    );

    const skinIndices = [];
    const skinWeights = [];

    const position = geometry.attributes.position;

    for (let i = 0; i < position.count; i++) {

        const vertex = new THREE.Vector3();
        vertex.fromBufferAttribute(position, i);

        const y = (vertex.y + sizing.halfHeight);

        const skinIndex = Math.floor(y / sizing.segmentHeight);
        const skinWeight = (y % sizing.segmentHeight) / sizing.segmentHeight;

        skinIndices.push(skinIndex, skinIndex + 1, 0, 0);
        skinWeights.push(1 - skinWeight, skinWeight, 0, 0);

    }
    geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndices, 4));
    geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeights, 4));
    // for (var i = 0; i < geometry.attributes.position.count.length; i++) {

    //     var vertex = geometry.vertices[i];
    //     var y = (vertex.y + sizing.halfHeight);

    //     var skinIndex = Math.floor(y / sizing.segmentHeight);
    //     var skinWeight = (y % sizing.segmentHeight) / sizing.segmentHeight;

    //     geometry.skinIndices.push(new THREE.Vector4(skinIndex, skinIndex + 1, 0, 0));
    //     geometry.skinWeights.push(new THREE.Vector4(1 - skinWeight, skinWeight, 0, 0));

    // }

    return geometry;

};

function createBones(sizing) {

    bones = [];
    // const pelvis = new THREE.Bone();
    // const hip = new THREE.Bone();
    // const knee = new THREE.Bone();
    // const ankle = new THREE.Bone();

    // shoulder.position.z = 40 * .12 - 0.92;
    // elbow.position.z = 40 * .12 - 0.92;
    // hand.position.z = 40 * .12 - 0.92;
    // shoulder.position.y = 0;
    // shoulder.position.x = +100;
    // elbow.position.y = 1;
    // hand.position.y = 2;
    // pelvis.position.y = -sizing.halfHeight;
    // hip.position.y = sizing.segmentHeight;
    // knee.position.y = sizing.segmentHeight;
    // ankle.position.y = sizing.segmentHeight;

    // pelvis.add(hip);
    // hip.add(knee);
    // knee.add(ankle);

    // bones.push(pelvis);
    // bones.push(hip);
    // bones.push(knee);
    // // bones.push(ankle);

    var prevBone = new THREE.Bone();
    bones.push(prevBone);
    prevBone.position.y = -sizing.halfHeight;
    for (var i = 0; i < sizing.segmentCount; i++) {

        var bone = new THREE.Bone();
        bone.position.y = sizing.segmentHeight;
        bones.push(bone);
        prevBone.add(bone);
        prevBone = bone;
    }

    return bones;

};

function createMesh(geometry, bones) {

    var material = new THREE.MeshPhongMaterial({
        skinning: true,
        //color: 0x156289,
        color: 0xFF5733,
        emissive: 0x072534,
        side: THREE.DoubleSide,
    });
    // const material = new THREE.MeshPhongMaterial({ color:  0xFFFFFF, 
    //     skinning: true,
    //     shininess: 30 });

    var mesh = new THREE.SkinnedMesh(geometry, material);
    var skeleton = new THREE.Skeleton(bones);

    mesh.add(bones[0]);

    mesh.bind(skeleton);
    mesh.rotateZ(Math.PI);
    skeletonHelper = new THREE.SkeletonHelper(mesh);
    skeletonHelper.material.linewidth = 2;
    scene.add(skeletonHelper);

    return mesh;

};



function initBones() {

    var segmentHeight = .5;
    var segmentCount = 2;
    var height = segmentHeight * segmentCount;
    var halfHeight = height * 0.5;

    var sizing = {
        segmentHeight: segmentHeight,
        segmentCount: segmentCount,
        height: height,
        halfHeight: halfHeight
    };

    var geometry = createGeometry(sizing);
    var bones = createBones(sizing);
    mesh = createMesh(geometry, bones);

    mesh.scale.multiplyScalar(2);
    scene.add(mesh);

};

function render() {


    requestAnimationFrame(render);

    var time = Date.now() * 0.001;

    var bone = mesh;


    //Wiggle the bones
    if (state.animateBones) {

        for (let i = 0; i < mesh.skeleton.bones.length; i++) {

            //mesh.skeleton.bones[i].rotation.y = Math.sin(time) * 2 / mesh.skeleton.bones.length;
            mesh.skeleton.bones[i].rotation.z = Math.sin(time) * 2 / mesh.skeleton.bones.length;
            // mesh.skeleton.bones[i].rotation.x = Math.sin(time) * 2 / mesh.skeleton.bones.length;

        }

    }

    // skeletonHelper.update();

    renderer.render(scene, camera);

};

initScene();
render();

