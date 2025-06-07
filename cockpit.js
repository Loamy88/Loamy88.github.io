// Build steering wheel only (for use inside GLB car model)
function createCockpit() {
  const cockpit = new THREE.Group();

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

  // Adjust position to fit your car model!
  wheelGroup.position.set(0, -0.3, -0.6);
  cockpit.add(wheelGroup);

  cockpit.userData.wheelGroup = wheelGroup; // for steering animation
  return cockpit;
}
