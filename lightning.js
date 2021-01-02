/* Wrapper for the wonderful lightning generator included with the ThreeJS examples*/
/* Provides Lightning and Light related features */

import {
  Vector3, ArrowHelper, ShapeBufferGeometry, MeshBasicMaterial, Mesh, Object3D,
  DoubleSide,SphereBufferGeometry, BufferGeometry, PointsMaterial, Float32BufferAttribute,
  Points, Box3
} from 'https://unpkg.com/three/build/three.module.js'; //'./node_modules/three/build/three.module.js';
import { LightningStrike } from './node_modules/three/examples/jsm/geometries/LightningStrike.js';

class DoubleArrow extends Object3D {
  constructor(origin, left, right, color = 0x00FFFF, label = '', font) {
    super();
    this.font = font;

    let leftdir = left.clone().sub(origin);
    leftdir = leftdir.normalize();
    const leftradius = origin.distanceTo(left);
    this.leftarrow = new ArrowHelper(leftdir, origin, leftradius, color, .02, .01);
    this.add(this.leftarrow);


    let rightdir = right.clone().sub(origin);
    rightdir = rightdir.normalize();
    const rightradius = origin.distanceTo(right);
    this.rightarrow = new ArrowHelper(rightdir, origin, rightradius, color, .02, .01);
    this.add(this.rightarrow);
    let labelPosition = origin.clone();
    labelPosition.y -= .03;
    this.label = this.attachLabel(label, labelPosition, color);

  }
  attachLabel(label, offset, color = 0xFFFFFF) {
    const shapes = this.font.generateShapes(label, 0.03);
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
    // text.rotation.y = rotation;
    text.rotation.y = Math.PI / 2;
    text.position.x = offset.x;
    text.position.y = offset.y;
    text.position.z = offset.z;
    this.add(text);
    return text;
  }
  update() {
  }

}

class Arrow extends Object3D {
  constructor(origin, target, color = 0xFFFFFF, label = '', font) {
    super();
    this.font = font;

    let dir = target.clone().sub(origin);
    dir = dir.normalize();
    const radius = origin.distanceTo(target);
    this.arrow = new ArrowHelper(dir, origin, radius, color, .02, .01);
    this.add(this.arrow);


    let labelPosition = origin.clone();
    labelPosition.x = (origin.x + target.x) / 2;
    labelPosition.y = (origin.y + target.y) / 2 - .03;
    labelPosition.z = (origin.z + target.z) / 2;
    // labelPosition.y -= .03;
    this.label = this.attachLabel(label, labelPosition, color);

  }
  attachLabel(label, offset, color = 0xFFFFFF) {
    const shapes = this.font.generateShapes(label, 0.03);
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
    // text.rotation.y = rotation;
    text.rotation.y = Math.PI / 2;
    text.position.x = offset.x;
    text.position.y = offset.y;
    text.position.z = offset.z;
    this.add(text);
    return text;
  }
  update() {
  }
}

class LightRay extends Object3D {
  constructor(position, target, offset, lightSpeed = 5, scaleFactor = 0.15, delay = -1, undilated = -1, playRate = 1, color = 0x00FFFF, label = '', font) {
    super();
    // this.scale.multiplyScalar(scaleFactor);
    this.color = color;
    this.target = target;
    this.offset = offset;
    this.playRate = playRate;
    this.delay = delay;
    this.lightSpeed = lightSpeed;
    this.undilated = undilated;
    this.label = label;
    this.font = font;
    this.radius = 0;
    this.bubbleScale = 1;
    this.renderOrder = 8;
    this.clicks = 0;
    this.position.x = position.x;
    this.position.y = position.y;
    this.position.z = position.z;
    let targetPosition = target.position.clone();
    targetPosition = targetPosition.add(offset);
    let dir = targetPosition.sub(position);
    dir = dir.normalize();
    this.arrow = new ArrowHelper(dir, new Vector3(0, 0, 0), this.radius, color, 0.02, 0.02);
    // this.bubble = new Mesh(
    //   new SphereBufferGeometry(1, 52, 52),
    //   new MeshBasicMaterial({ color: this.color, opacity: 0, transparent: true })
    // );
    this.add(this.arrow);
    let labelPosition = dir.clone();
    labelPosition = labelPosition.multiplyScalar(this.radius + .2);
    this.label = this.attachLabel(label, labelPosition);

  }
  update() {
    this.clicks++;

    this.radius = this.radius + this.lightSpeed;
    let targetPosition = this.target.position.clone();
    let originPosition = this.position;
    if (this.parent.uuid === this.target.uuid) {
      targetPosition = new Vector3(0, 0, 0);
    } else {
      targetPosition.sub(this.parent.position);
    }
    targetPosition.add(this.offset);
    if (this.radius <= targetPosition.distanceTo(this.position)) {
      let dir = targetPosition.sub(originPosition);
      dir = dir.normalize();
      this.arrow.setDirection(dir);
      this.arrow.setLength(this.radius, 0.02, 0.02);
      let labelPosition = dir.clone();
      labelPosition = labelPosition.multiplyScalar(this.radius / 2);
      this.label.position.x = labelPosition.x;
      this.label.position.y = labelPosition.y;
      this.label.position.z = labelPosition.z;
    } else {
      // this.arrow.visible = false;
    }
  }

  attachLabel(label, offset, color = 0xFFFFFF) {
    const shapes = this.font.generateShapes(label, 0.03);
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
    // text.rotation.y = rotation;
    text.rotation.y = Math.PI / 2;
    text.position.x = offset.x;
    text.position.y = offset.y;
    text.position.z = offset.z;
    this.add(text);
    return text;
  }
}

class LightBubble extends Object3D {
  constructor(position, lightSpeed = 5, scaleFactor = 0.15, delay = -1, playRate = 1, color = 0x00FFFF, renderOrder = 0, name = '') {
    super();
    this.scale.multiplyScalar(scaleFactor);
    this.color = color;
    this.playRate = playRate;
    this.delay = delay;
    this.lightSpeed = lightSpeed;
    this.scaleFactor = scaleFactor;
    this.radius = 0;
    this.bubbleScale = 1;
    this.renderOrder = renderOrder;
    this.clicks = 0;
    this.bubble = new Mesh(
      new SphereBufferGeometry(this.lightSpeed / scaleFactor, 52, 52),
      new MeshBasicMaterial({ color: this.color, opacity: 0.3, transparent: true })
    );
    this.bubble.renderOrder = renderOrder;
    this.name = name;
    this.add(this.bubble);
    this.position.x = position.x;
    this.position.y = position.y;
    this.position.z = position.z;
  }
  update() {
    this.clicks++;

    const ex = Math.exp(this.clicks / 10);
    const decay = ex / (1 + ex);
    this.bubble.scale.set(this.clicks, this.clicks, this.clicks);

    this.bubble.material.opacity -= 0.0005 * decay;// * this.playRate;

  }
}

class Arc extends Object3D {
  constructor(position, lightSpeed = 5, scaleFactor = 0.15, startTime = 0, playRate = 1, color = 0x00FFFF, life = 0.5) {
    super();
    this.color = color;
    this.lightSpeed = lightSpeed;
    this.scale.multiplyScalar(scaleFactor);
    this.strikes = [];
    this.meshes = [];
    this.renderOrder = 10;
    this.startTime = startTime;
    const from = new Vector3(0, 0, 0);
    const to = new Vector3(0, 0.0, 2);

    let theta = 0;
    for (let k = 0; k < 2; k++) {
      theta += 2 * Math.PI / 2;
      const strike = new LightningStrike({
        sourceOffset: new Vector3(0, 0, 0),
        destOffset: new Vector3(2 * Math.cos(theta), 0.5, 2 * Math.sin(theta)),
        radius0: .3,
        radius1: .3,
        isEternal: false,
        // roughness: .5,
        straightness: 0.8,
        birthTime: 0,
        deathTime: life,
        propagationTimeFactor: .1,
        vanishingTimeFactor: .9,
        maxIterations: 5
      });
      const light = new Mesh(
        strike,
        new MeshBasicMaterial({ color: this.color })
      );
      this.strikes.push(strike);
      this.meshes.push(light);
      this.add(light);
    }
    this.position.x = position.x;
    this.position.y = position.y;
    this.position.z = position.z;
  }

  update(currentTime) {
    for (let i = 0; i < this.strikes.length; i++) {
      this.strikes[i].update(currentTime);
      this.meshes[i].visible = this.strikes[i].visible;
    }
  }

}


class Lightning extends Object3D {
  constructor(position, lightSpeed = 5, scaleFactor = 0.15, startTime = 0, color = 0x00FFFF, life = 0.5, height = 20) {
    super();
    this.color = color;
    this.lightSpeed = lightSpeed;
    this.scale.multiplyScalar(scaleFactor);
    this.strikes = [];
    this.meshes = [];
    this.renderOrder = 10;
    this.startTime = startTime;
    const from = new Vector3(0, 0, 0);
    const to = new Vector3(0, height, 0);
    const strike = new LightningStrike({
      sourceOffset: from,
      destOffset: to,
      radius0: 0.3,
      radius1: 0.3,
      isEternal: false,
      straightness: 0.8,
      birthTime: 0,
      deathTime: life,
      propagationTimeFactor: .1,
      vanishingTimeFactor: .9,
      maxIterations: 5
    });
    const light = new Mesh(
      strike,
      new MeshBasicMaterial({ color: this.color })
    );
    this.strikes.push(strike);
    this.meshes.push(light);
    this.add(light);
    this.position.x = position.x;
    this.position.y = position.y;
    this.position.z = position.z;
  }

  update(currentTime) {
    for (let i = 0; i < this.strikes.length; i++) {
      this.strikes[i].update(currentTime);
      this.meshes[i].visible = this.strikes[i].visible;
    }
  }

}

// Based on https://aerotwist.com/tutorials/creating-particles-with-three-js/
class ParticleCloud extends Object3D {
  constructor(position, lightSpeed = 5, scaleFactor = 0.15, delay = -1, playRate = 1, color = 0x00FFFF) {
    super();
    this.scale.multiplyScalar(scaleFactor);
    this.color = color;
    this.playRate = playRate;
    this.delay = delay;
    this.lightSpeed = lightSpeed;
    this.radius = 0;
    this.bubbleScale = 1;
    this.renderOrder = 8;
    this.clicks = 0;


    const particleCount = 1000;
    const vertices = [];
    const pMaterial = new PointsMaterial({
      color: this.color,
      size: .01
      // ,transparent: true,
      // opacity: 1
    });

    for (let p = 0; p < particleCount; p++) {

      const r = Math.random() * .01 - .005;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 2;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      vertices.push(x, y, z);
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));

    this.particleSystem = new Points(
      geometry,
      pMaterial);

    this.add(this.particleSystem);
    this.position.x = position.x;
    this.position.y = position.y;
    this.position.z = position.z;
  }

  update() {
    this.clicks++;
    const box = new Box3().setFromObject(this.particleSystem);
    const target = new Vector3();
    box.getSize(target)
    let width = target.y;
    this.bubbleScale = (width + this.lightSpeed * 2) / width;

    width += this.lightSpeed * 2;

    this.particleSystem.scale.multiplyScalar(this.bubbleScale);
    // this.particleSystem.material.opacity -= (0.002 * this.playRate);
    this.particleSystem.material.size -= (0.00004 * this.playRate);
    this.radius = width / 2;
  }



}
export { Lightning, LightBubble, LightRay, DoubleArrow, Arrow, Arc, ParticleCloud };


