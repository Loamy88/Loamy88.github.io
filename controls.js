// Handles keyboard input and car movement logic.
class CarControls {
  constructor(camera, cockpit, speedometer, trailGroup) {
    this.camera = camera;
    this.cockpit = cockpit;
    this.speedometer = speedometer;
    this.trailGroup = trailGroup;
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
    this.reverseAcceleration = 0.005;
    this.keys = {};
    window.addEventListener('keydown', e => this.keys[e.key.toLowerCase()] = true);
    window.addEventListener('keyup', e => this.keys[e.key.toLowerCase()] = false);
  }

  update() {
    // Input handling and car movement logic as per your original
    // Animate steering wheel
    const wheelGroup = this.cockpit.userData.wheelGroup;
    if (this.keys['a']) this.steering = Math.min(this.steering + 0.002, 0.1);
    else if (this.keys['d']) this.steering = Math.max(this.steering - 0.002, -0.1);
    else this.steering *= 0.9;
    if (wheelGroup) wheelGroup.rotation.z = this.steering * 8;

    if (this.keys['w']) {
      this.forwardSpeed += this.accelerationRate;
      this.forwardSpeed = Math.min(this.forwardSpeed, this.maxSpeed);
    }
    if (this.keys['s']) {
      this.forwardSpeed -= this.reverseAcceleration;
      this.forwardSpeed = Math.max(this.forwardSpeed, this.maxReverseSpeed);
    }
    if (!this.keys['w'] && !this.keys['s']) this.forwardSpeed *= 0.97;
    this.angle += this.steering * this.forwardSpeed * 2;

    if (Math.abs(this.steering) > 0.06) {
      this.driftX += Math.cos(this.angle) * this.steering * this.forwardSpeed * 3;
      this.driftZ += -Math.sin(this.angle) * this.steering * this.forwardSpeed * 3;
    }
    this.driftX *= 0.9;
    this.driftZ *= 0.9;

    const dx = -Math.sin(this.angle) * this.forwardSpeed;
    const dz = -Math.cos(this.angle) * this.forwardSpeed;
    this.camera.position.x += dx;
    this.camera.position.z += dz;
    this.camera.rotation.y = this.angle;

    // Speedometer
    if (this.speedometer) {
      this.speedometer.textContent = `Speed: ${(this.forwardSpeed * 100).toFixed(0)}`;
    }
  }
}
