// Build cockpit interior and return as a THREE.Group
function createCockpit() {
  const cockpit = new THREE.Group();

  // Dashboard
  const dashGeo = new THREE.BoxGeometry(2.5, 0.5, 1);
  const dashMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
  const dashboard = new THREE.Mesh(dashGeo, dashMat);
  dashboard.position.set(0, -0.6, -1.5);
  cockpit.add(dashboard);

  // Steering wheel
  const wheelGroup = new THREE.Group();
  const wheelGeometry = new THREE.TorusGeometry(0.4, 0.05, 16, 100);
  const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
  const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
  wheel.rotation.y = Math.PI;
  wheelGroup.add(wheel);

  const spokeGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.4, 12);
  const spoke = new THREE.Mesh(spokeGeo, wheelMaterial);
  spoke.rotation.z = Math.PI / 2;
  wheelGroup.add(spoke);

  const center = new THREE.CylinderGeometry(0.1, 0.1, 0.05, 32);
  const centerMesh = new THREE.Mesh(center, new THREE.MeshStandardMaterial({ color: 0x888888 }));
  centerMesh.rotation.x = Math.PI / 2;
  wheelGroup.add(centerMesh);

  wheelGroup.position.set(0, -0.3, -0.6);
  cockpit.add(wheelGroup);

  // Window frame
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
  const frameT = 0.1, frameW = 3.5, frameH = 2, frameZ = -1.1;
  const topFrame = new THREE.Mesh(new THREE.BoxGeometry(frameW, frameT, frameT), frameMat);
  topFrame.position.set(0, frameH / 2, frameZ);
  cockpit.add(topFrame);
  const bottomFrame = new THREE.Mesh(new THREE.BoxGeometry(frameW, frameT, frameT), frameMat);
  bottomFrame.position.set(0, -frameH / 2, frameZ);
  cockpit.add(bottomFrame);
  const leftFrame = new THREE.Mesh(new THREE.BoxGeometry(frameT, frameH, frameT), frameMat);
  leftFrame.position.set(-frameW / 2 + frameT / 2, 0, frameZ);
  cockpit.add(leftFrame);
  const rightFrame = new THREE.Mesh(new THREE.BoxGeometry(frameT, frameH, frameT), frameMat);
  rightFrame.position.set(frameW / 2 - frameT / 2, 0, frameZ);
  cockpit.add(rightFrame);

  cockpit.userData.wheelGroup = wheelGroup; // for steering animation
  return cockpit;
}
