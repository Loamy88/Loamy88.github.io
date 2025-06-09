import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';
// controls.js - Handles keyboard input and car movement logic for a GLB car model (and steering wheel/camera)
// Assumes your main.js loads the car model, creates the camera, and attaches both cockpit (wheel only) and camera to the car.

// Usage in main.js:
// const controls = new CarControls(car, cockpit, camera, speedometer, trailGroup);
// controls.update() should be called in the animation loop.

export class CarControls {
  /**
   * @param {THREE.Object3D} car - The loaded car.glb model (parent for camera and cockpit)
   * @param {THREE.Object3D} cockpit - The steering wheel group (child of car)
   * @param {THREE.Camera} camera - The camera (child of car, positioned inside or just outside windshield)
   * @param {HTMLElement} speedometer - The speedometer DOM element
   * @param {THREE.Group} trailGroup - Group to hold trail mesh objects
   */
  constructor(car, cockpit, camera, speedometer, trailGroup) {
    this.car = car;
    this.cockpit = cockpit;
    this.camera = camera;
    this.speedometer = speedometer;
    this.trailGroup = trailGroup;

    // Physics and movement state
    this.angle = Math.PI;
    this.forwardSpeed = 0;
    this.steering = 0;
    this.driftX = 0;
    this.driftZ = 0;
    this.maxSpeed = 0.35;
    this.baseMax = 0.35;
    this.topMax = 0.5;
    this.accelerationRate = 0.0055;
    this.maxReverseSpeed = -0.30;
    this.reverseAcceleration = 0.006;

    // Input state
    this.keys = {};
    window.addEventListener('keydown', e => this.keys[e.key.toLowerCase()] = true);
    window.addEventListener('keyup', e => this.keys[e.key.toLowerCase()] = false);
  }

  update() {
    // Handle steering input
    if (this.keys['a']) this.steering = Math.min(this.steering + 0.003, 0.12);
    else if (this.keys['d']) this.steering = Math.max(this.steering - 0.003, -0.12);
    else this.steering *= 0.9;

    // Animate steering wheel
    if (this.cockpit && this.cockpit.userData && this.cockpit.userData.wheelGroup) {
      this.cockpit.userData.wheelGroup.rotation.z = this.steering * 8;
    }

    // Acceleration and braking
    if (this.keys['w']) {
      this.forwardSpeed += this.accelerationRate;
      this.forwardSpeed = Math.min(this.forwardSpeed, this.maxSpeed);
    }
    if (this.keys['s']) {
      this.forwardSpeed -= this.reverseAcceleration;
      this.forwardSpeed = Math.max(this.forwardSpeed, this.maxReverseSpeed);
    }
    if (!this.keys['w'] && !this.keys['s']) this.forwardSpeed *= 0.97;

    // Turning and drift
    this.angle += this.steering * this.forwardSpeed * 2;

    if (Math.abs(this.steering) > 0.05) {
      this.driftX += Math.cos(this.angle) * this.steering * this.forwardSpeed * 4;
      this.driftZ += -Math.sin(this.angle) * this.steering * this.forwardSpeed * 4;
    }
    this.driftX *= 0.9;
    this.driftZ *= 0.9;

    // Calculate movement vector
    const dx = -Math.sin(this.angle) * this.forwardSpeed + this.driftX;
    const dz = -Math.cos(this.angle) * this.forwardSpeed + this.driftZ;

    // Move the car mesh (which moves the camera and wheel, as they're attached)
    if (this.car) {
      this.car.position.x += dx;
      this.car.position.z += dz;
      this.car.rotation.y = this.angle;
    }

    // Animate speedometer
    if (this.speedometer) {
      this.speedometer.textContent = `Speed: ${(this.forwardSpeed * 100).toFixed(0)}`;
    }

    // Draw tire trails (if trailGroup provided)
    if (this.trailGroup && this.car) {
      const trailGeo = new THREE.SphereGeometry(0.05, 6, 6);
      const trailMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.7 });
      const angle = this.angle;
      const backOffset = -1.2;
      const sideOffset = 0.5;
      const sin = Math.sin(angle);
      const cos = Math.cos(angle);

      // Left tire
      const trailLeft = new THREE.Mesh(trailGeo, trailMaterial.clone());
      trailLeft.position.set(
        this.car.position.x + cos * backOffset + sin * sideOffset,
        0.05,
        this.car.position.z + sin * backOffset - cos * sideOffset
      );

      // Right tire
      const trailRight = new THREE.Mesh(trailGeo, trailMaterial.clone());
      trailRight.position.set(
        this.car.position.x + cos * backOffset - sin * sideOffset,
        0.05,
        this.car.position.z + sin * backOffset + cos * sideOffset
      );

      this.trailGroup.add(trailLeft);
      this.trailGroup.add(trailRight);

      // Fade and remove trail
      for (let i = this.trailGroup.children.length - 1; i >= 0; i--) {
        const child = this.trailGroup.children[i];
        child.material.opacity -= 0.01;
        if (child.material.opacity <= 0) this.trailGroup.remove(child);
      }
    }
  }
}
