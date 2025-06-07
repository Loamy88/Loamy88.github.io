// citygen.js - City Grid Environment Generator for Three.js

function randomGray() {
  const shade = Math.floor(60 + Math.random() * 140);
  return new THREE.Color(`rgb(${shade},${shade},${shade})`);
}
function randomGreen() {
  // random-ish green for fields
  const base = 60 + Math.floor(Math.random() * 60);
  return new THREE.Color(`rgb(${base},${160 + Math.floor(Math.random()*60)},${base})`);
}

/**
 * Generates a city grid with roads, buildings, fields, and perimeter wall.
 * @param {Object} options
 * @param {number} options.gridSize - Number of blocks per side (default 8)
 * @param {number} options.cellSize - Size of each block (default 8)
 * @param {number} options.roadWidth - Width of roads (default 2)
 * @param {number} options.fieldChance - Chance (0-1) of a building being a field (default 0.12)
 * @param {number} options.missingRoadChance - Chance (0-1) a road segment is missing (default 0.18)
 * @param {THREE.Vector2} [options.startBlock] - Block where car starts (road guaranteed)
 * @returns {THREE.Group} City group
 */
function generateCityGrid({
  gridSize = 8,
  cellSize = 25,
  roadWidth = 10,
  fieldChance = 0.12,
  missingRoadChance = 0.18,
  startBlock = new THREE.Vector2(0, 0),
} = {}) {
  const group = new THREE.Group();

  // Road networks: true = present, false = missing
  const horizRoads = Array.from({length: gridSize+1}, () =>
    Array(gridSize).fill(true)
  );
  const vertRoads = Array.from({length: gridSize}, () =>
    Array(gridSize+1).fill(true)
  );

  // Randomly remove some roads, but not too many
  for (let y = 0; y < gridSize+1; y++) {
    for (let x = 0; x < gridSize; x++) {
      if (y === startBlock.y || x === startBlock.x) continue; // guarantee start block connected
      if (Math.random() < missingRoadChance) horizRoads[y][x] = false;
    }
  }
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize+1; x++) {
      if (y === startBlock.y || x === startBlock.x) continue;
      if (Math.random() < missingRoadChance) vertRoads[y][x] = false;
    }
  }

  // BUILDINGS & FIELDS
  const buildingColors = [];
  for (let y = 0; y < gridSize; y++) {
    buildingColors[y] = [];
    for (let x = 0; x < gridSize; x++) {
      // Each building is a single color OR a green field
      if (Math.random() < fieldChance) {
        buildingColors[y][x] = { type: "field", color: randomGreen() };
      } else {
        buildingColors[y][x] = { type: "building", color: randomGray() };
      }
    }
  }

  // Place buildings/fields in grid
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      // Compute building area: shrink to leave road space
      const cx = x * cellSize + cellSize / 2;
      const cz = y * cellSize + cellSize / 2;
      // Compute road gaps around this cell
      const roadNorth = horizRoads[y][x];
      const roadSouth = horizRoads[y+1][x];
      const roadWest  = vertRoads[y][x];
      const roadEast  = vertRoads[y][x+1];

      // Shrink building if adjacent to road, else fill to edge
      const shrink = roadWidth * 0.6;
      const half = cellSize / 2;

      let minX = cx - half + (roadWest ? shrink : 0);
      let maxX = cx + half - (roadEast ? shrink : 0);
      let minZ = cz - half + (roadNorth ? shrink : 0);
      let maxZ = cz + half - (roadSouth ? shrink : 0);

      // Merge with neighbor if road is missing (to connect buildings)
      if (!roadEast && x < gridSize-1) {
        maxX += shrink;
      }
      if (!roadSouth && y < gridSize-1) {
        maxZ += shrink;
      }

      // Building height: fields are almost flat
      const isField = buildingColors[y][x].type === "field";
      const height = isField ? 0.01 : 2 + Math.random() * 2;

      // Place mesh
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(maxX-minX, height, maxZ-minZ),
        new THREE.MeshStandardMaterial({
          color: buildingColors[y][x].color,
          roughness: 0.7,
          metalness: 0.1
        })
      );
      mesh.position.set((minX+maxX)/2 - cellSize*gridSize/2, height/2, (minZ+maxZ)/2 - cellSize*gridSize/2);
      group.add(mesh);
    }
  }

  // ROADS
  // Horizontal roads
  for (let y = 0; y < gridSize+1; y++) {
    for (let x = 0; x < gridSize; x++) {
      if (!horizRoads[y][x]) continue;
      const road = new THREE.Mesh(
        new THREE.BoxGeometry(cellSize, 0.11, roadWidth),
        new THREE.MeshStandardMaterial({ color: 0x111111 })
      );
      road.position.set(
        x * cellSize + cellSize/2 - cellSize*gridSize/2,
        0.055,
        y * cellSize - cellSize*gridSize/2
      );
      group.add(road);

      // Center road lines (yellow dashed)
      const lineCount = Math.floor(cellSize / 2.2);
      for (let i = 0; i < lineCount; i++) {
        const line = new THREE.Mesh(
          new THREE.BoxGeometry(cellSize/lineCount*0.5, 0.12, 0.3),
          new THREE.MeshBasicMaterial({ color: 0xffff00 })
        );
        line.position.set(
          road.position.x - cellSize/2 + (i+0.5)*cellSize/lineCount,
          0.13,
          road.position.z
        );
        group.add(line);
      }
    }
  }
  // Vertical roads
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize+1; x++) {
      if (!vertRoads[y][x]) continue;
      const road = new THREE.Mesh(
        new THREE.BoxGeometry(roadWidth, 0.11, cellSize),
        new THREE.MeshStandardMaterial({ color: 0x111111 })
      );
      road.position.set(
        x * cellSize - cellSize*gridSize/2,
        0.055,
        y * cellSize + cellSize/2 - cellSize*gridSize/2
      );
      group.add(road);

      // Center road lines (white dashed)
      const lineCount = Math.floor(cellSize / 2.2);
      for (let i = 0; i < lineCount; i++) {
        const line = new THREE.Mesh(
          new THREE.BoxGeometry(0.3, 0.12, cellSize/lineCount*0.5),
          new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        line.position.set(
          road.position.x,
          0.13,
          road.position.z - cellSize/2 + (i+0.5)*cellSize/lineCount
        );
        group.add(line);
      }
    }
  }

  // WALL: perimeter
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.6 });
  const wallHeight = 6;
  const wallThick = 1.1;
  const outer = cellSize * gridSize / 2 + wallThick/2;

  // North/South
  for (let i = 0; i < 2; i++) {
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(cellSize*gridSize + wallThick*2, wallHeight, wallThick),
      wallMat
    );
    wall.position.set(0, wallHeight/2, (i===0 ? -1 : 1)*outer);
    group.add(wall);
  }
  // East/West
  for (let i = 0; i < 2; i++) {
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThick, wallHeight, cellSize*gridSize + wallThick*2),
      wallMat
    );
    wall.position.set((i===0 ? -1 : 1)*outer, wallHeight/2, 0);
    group.add(wall);
  }

  group.name = "CityGrid";
  return group;
}
