import * as THREE from './node_modules/three/build/three.module.js';
class Bob extends THREE.Object3D {
    constructor(scaleFactor=0.15, color= 0xff6347) {
        super();
        this.color = color;
        const scale = new THREE.Vector3(1, 1, 1);
        scale.x *= -1;
        this.head = createHead.apply(this);
        this.head.position.z = 0;
        this.head.position.y = 27;
        this.head.position.x = 0;
        this.head.rotation.z = Math.PI / 4;
        this.head.scale.multiplyScalar(.24);
        super.add(this.head);

        this.rightArm = createArm.apply(this);
        raiseArm(this.rightArm);

        this.rightArm.position.z = -2.5;
        this.rightArm.position.y = 24.5;
        this.rightArm.position.x = 0;
        this.rightArm.scale.multiply(scale);
        this.rightArm.scale.multiplyScalar(.12);
        super.add(this.rightArm);

        this.torso = createTorso.apply(this);
        const torsoScale = new THREE.Vector3(1.5, .76, 2.5);
        this.torso.scale.multiply(torsoScale);
        this.torso.position.z = 0;
        this.torso.position.y = 14;
        this.torso.position.x = 0;
        this.torso.renderOrder=8;
        this.torso.scale.multiplyScalar(.15);
        super.add(this.torso);

        this.belt = createBelt.apply(this);
        const beltScale = new THREE.Vector3(0.5, 1.2, 0.7);
        this.belt.scale.multiply(beltScale);
        this.belt.position.z = 0;
        this.belt.position.y = 16;
        this.belt.position.x = 0;
        this.belt.renderOrder=7;
        this.belt.scale.multiplyScalar(.15);
        //super.add(this.belt);

        this.rightLeg = createLeg.apply(this);
        this.rightLeg.position.z = -1.5;
        this.rightLeg.position.y = 17;
        this.rightLeg.position.x = 0;
        this.rightLeg.renderOrder=9;
        this.rightLeg.scale.multiplyScalar(.18);
        super.add(this.rightLeg);

        this.leftLeg = createLeg.apply(this);
        this.leftLeg.position.z = 1.5;
        this.leftLeg.position.y = 17;
        this.leftLeg.position.x = 0;
        this.leftLeg.renderOrder=9;
        this.leftLeg.scale.multiply(scale);
        this.leftLeg.scale.multiplyScalar(.18);
        super.add(this.leftLeg);

        this.leftArm = createArm.apply(this);
        raiseArm(this.leftArm, 1);
        this.leftArm.position.z = 2.5;
        this.leftArm.position.y = 24.5;
        this.leftArm.position.x = 0;
        this.leftArm.scale.multiplyScalar(.12);
        super.add(this.leftArm);
        this.scale.multiplyScalar(scaleFactor);

    }

    walk(speedFactor = 0.005) {
        const time = Date.now() * speedFactor;
        oscillateArm(this.leftArm, 0, time);
        oscillateArm(this.rightArm, 1, time);
        oscillateLeg(this.leftLeg, 1, time);
        oscillateLeg(this.rightLeg, 0, time);
    }

}

function createHead() {
    const geometry = new THREE.SphereBufferGeometry(10, 32, 32);
    const material = new THREE.MeshPhongMaterial({
        skinning: true,
        color: this.color,
        // emissive: 0x072534,
        side: THREE.DoubleSide,
    });
    const sphere = new THREE.Mesh(geometry, material);
    const scale = new THREE.Vector3(.7, 1, .7);
    scale.x *= -1;
    sphere.scale.multiply(scale);
    return sphere;

}
function createTorso() {
    const points = [];
    points.push(new THREE.Vector2(0, 0));
    points.push(new THREE.Vector2(7, 10));
    points.push(new THREE.Vector2(10, 80));
    points.push(new THREE.Vector2(8, 90));
    points.push(new THREE.Vector2(7, 95));
    points.push(new THREE.Vector2(0, 100));
    const geometry = new THREE.LatheBufferGeometry(points);
    const material = new THREE.MeshPhongMaterial({
        skinning: true,
        color: this.color,
        // emissive: 0x072534,
        side: THREE.DoubleSide,
    });
    const lathe = new THREE.Mesh(geometry, material);
    return lathe;
}

function createBelt() {
    const geometry = new THREE.CylinderBufferGeometry(30,30,20,32);
    const material = new THREE.MeshPhongMaterial({
        skinning: true,
        color: this.color,
        // emissive: 0x072534,
        side: THREE.DoubleSide,
    });
    const lathe = new THREE.Mesh(geometry, material);
    return lathe;
}
function createArm() {
    const points = [];
    // const n = 20;
    // for ( let i = 0; i < n; i ++ ) {
    //     points.push( new THREE.Vector2( (Math.sin( i * 0.2 ) * 10 + 5), (( i - n / 2 ) * 2)) );
    // }
    for (let i = 0; i < 8; i++) {
        points.push(new THREE.Vector2(Math.sqrt(64 - Math.pow((i - 8), 2)), i));
        // points.push( new THREE.Vector2( i^2, i ));
    }
    // points.push(new THREE.Vector2( 0, 0));
    points.push(new THREE.Vector2(8, 10));
    points.push(new THREE.Vector2(8, 42));
    points.push(new THREE.Vector2(6, 90));
    for (let i = 5; i >= 0; i--) {
        points.push(new THREE.Vector2(Math.sqrt(36 - Math.pow((i - 6), 2)), 96 - i));
        // points.push( new THREE.Vector2( i^2, i ));
    }
    const geometry = new THREE.LatheBufferGeometry(points);
    const segmentHeight = 33;
    const segmentCount = 3;
    const height = segmentHeight * segmentCount;
    const halfHeight = 0;

    const sizing = {
        segmentHeight: segmentHeight,
        segmentCount: segmentCount,
        height: height,
        halfHeight: halfHeight
    };
    const material = new THREE.MeshPhongMaterial({
        skinning: true,
        color: this.color,
        // emissive: 0x072534,
        side: THREE.DoubleSide,
    });



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

    const bones = createBones(sizing);

    const lathe = new THREE.SkinnedMesh(geometry, material);
    const skeleton = new THREE.Skeleton(bones);

    lathe.add(bones[0]);
    lathe.bind(skeleton);
    lathe.rotateZ(Math.PI);
    return lathe;
}

function createLeg() {
    const points = [];
    points.push(new THREE.Vector2( 0, 0));
    points.push(new THREE.Vector2( 6, 5));
    points.push(new THREE.Vector2(8, 10));
    points.push(new THREE.Vector2(8, 40));
    points.push(new THREE.Vector2(8, 50));
    points.push(new THREE.Vector2(5, 90));
    for (let i = 4; i >= 0; i--) {
        points.push(new THREE.Vector2(Math.sqrt(25 - Math.pow((i - 5), 2)), 95 - i));
    }
    const geometry = new THREE.LatheBufferGeometry(points);
    const segmentHeight = 48;
    const segmentCount = 2;
    const height = segmentHeight * segmentCount;
    const halfHeight = 0;

    const sizing = {
        segmentHeight: segmentHeight,
        segmentCount: segmentCount,
        height: height,
        halfHeight: halfHeight
    };
    const material = new THREE.MeshPhongMaterial({
        skinning: true,
        color: this.color,
        // emissive: 0x072534,
        side: THREE.DoubleSide,
    });



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

    const bones = createBones(sizing);

    const lathe = new THREE.SkinnedMesh(geometry, material);
    const skeleton = new THREE.Skeleton(bones);

    lathe.add(bones[0]);
    lathe.bind(skeleton);
    lathe.rotateZ(Math.PI);
    return lathe;
}

function createBones(sizing) {

    const bones = [];


    let prevBone = new THREE.Bone();
    bones.push(prevBone);
    prevBone.position.y = -sizing.halfHeight;
    for (let i = 0; i < sizing.segmentCount; i++) {

        const bone = new THREE.Bone();
        bone.position.y = sizing.segmentHeight;
        bones.push(bone);
        prevBone.add(bone);
        prevBone = bone;
    }

    return bones;

};

function raiseArm(arm, direction = -1) {
        arm.skeleton.bones[0].rotation.x = direction* Math.PI / 5;
        arm.skeleton.bones[2].rotation.x = -direction* Math.PI / 2;

}


function oscillateArm(arm, direction = 0, time) {
    const sinval = Math.sin(time);
    for (let i = 0; i < arm.skeleton.bones.length; i++) {
        if ((direction == 0 && sinval < 0) || (direction > 0 && sinval > 0)) {
            if (i === 0) {
                arm.skeleton.bones[i].rotation.z = sinval / 2;
            }

        } else {
            arm.skeleton.bones[i].rotation.z = sinval / arm.skeleton.bones.length;

        }
    }

}

function oscillateLeg(arm, direction = 0, time) {
    const sinval = Math.sin(time);
    for (let i = 0; i < arm.skeleton.bones.length; i++) {
        if ((direction == 0 && sinval < 0) || (direction > 0 && sinval > 0)) {
            arm.skeleton.bones[i].rotation.z = sinval / arm.skeleton.bones.length;

        } else {
            if (i === 0) {
                arm.skeleton.bones[i].rotation.z = sinval / 2;
            }

        }
    }

}

export { Bob };


