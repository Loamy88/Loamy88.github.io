// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa0c4ff);
scene.fog = new THREE.Fog(0xa0c4ff, 10, 200);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(5, 10, 7.5);
scene.add(dirLight);

// Minimap
const miniCam = new THREE.OrthographicCamera(-50, 50, 50, -50, 1, 1000);
miniCam.position.set(0, 100, 0);
miniCam.lookAt(0, 0, 0);

// Trail group
const trailMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
const trailGeo = new THREE.SphereGeometry(0.05, 6, 6);
const trailGroup = new THREE.Group();
scene.add(trailGroup);

// Generate city grid
const city = generateCityGrid({
  gridSize: 8,
  cellSize: 25,
  roadWidth: 10,
  fieldChance: 0.12,
  missingRoadChance: 0.18,
  startBlock: new THREE.Vector2(0, 0)
});
scene.add(city);

// Cockpit
const cockpit = createCockpit();
camera.add(cockpit);
camera.position.set(-32, 1.5, -32);
scene.add(camera);

// UI
createOverlay();
const speedometer = createSpeedometer();

// Controls
const controls = new CarControls(camera, cockpit, speedometer, trailGroup);

function animate() {
  requestAnimationFrame(animate);
  controls.update();

  // Trail drawing (reuse your logic here as needed)
  // ...

  // Minimap update
  miniCam.position.set(camera.position.x, 100, camera.position.z);
  miniCam.lookAt(camera.position.x, 0, camera.position.z);

  renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);

  renderer.setViewport(10, 10, 200, 200);
  renderer.setScissor(10, 10, 200, 200);
  renderer.setScissorTest(true);
  renderer.render(scene, miniCam);
  renderer.setScissorTest(false);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
