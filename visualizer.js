const canvas = document.getElementById("waveCanvas");
const ctx = canvas.getContext("2d");
const frequencyInput = document.getElementById("frequency");

const sources = [];
const gridSize = 200; // Higher resolution grid
const damping = 0.99; // Damping factor for wave decay
const speed = 2; // Speed of wave propagation

// Create a grid for the simulation
const grid = Array(gridSize)
  .fill(null)
  .map(() => Array(gridSize).fill(0));
const velocityGrid = Array(gridSize)
  .fill(null)
  .map(() => Array(gridSize).fill(0));

// Convert canvas coordinates to grid coordinates
function toGrid(x, y) {
  return {
    gx: Math.floor((x / canvas.width) * gridSize),
    gy: Math.floor((y / canvas.height) * gridSize),
  };
}

// Add a new sound source on click (only on the boundary)
canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const frequency = parseFloat(frequencyInput.value);

  if (frequency >= 1 && frequency <= 50) {
    // Check if the click is on the boundary
    if (x <= 5 || x >= canvas.width - 5 || y <= 5 || y >= canvas.height - 5) {
      sources.push({ x, y, frequency, phase: 0 });
      console.log(`Added source at (${x}, ${y}) with frequency ${frequency}Hz`);
    } else {
      alert("Please click on the boundary of the canvas to place a source.");
    }
  } else {
    alert("Frequency must be between 1 and 50 Hz.");
  }
});

// Update the wave simulation
function updateWave() {
  // Reset grid values
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      velocityGrid[x][y] *= damping;
      grid[x][y] += velocityGrid[x][y];
    }
  }

  // Add waves from sources
  sources.forEach((source) => {
    const { gx, gy } = toGrid(source.x, source.y);
    const timeFactor = Math.sin(source.phase * Math.PI * 2);

    if (gx >= 0 && gx < gridSize && gy >= 0 && gy < gridSize) {
      grid[gx][gy] += timeFactor * 10; // Add energy at source point
    }

    source.phase += source.frequency / speed / gridSize;
    if (source.phase > 1) source.phase -= 1;
  });

  // Propagate waves using finite difference method
  for (let x = 1; x < gridSize - 1; x++) {
    for (let y = 1; y < gridSize - 1; y++) {
      const laplacian =
        grid[x - 1][y] +
        grid[x + 1][y] +
        grid[x][y - 1] +
        grid[x][y + 1] -
        grid[x][y] * 4;
      velocityGrid[x][y] += laplacian * speed * speed;
    }
  }
}

// Render the wave simulation
function renderWave() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const cellWidth = canvas.width / gridSize;
  const cellHeight = canvas.height / gridSize;

  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      const intensity = Math.min(Math.max(grid[x][y], -1), +1); // Clamp values
      const colorValue = Math.floor((intensity + 1) * (255 / 2));
      ctx.fillStyle = `rgb(${colorValue}, ${colorValue}, ${255 - colorValue})`;
      ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
    }
  }

  // Draw sources as red dots on the boundary
  sources.forEach((source) => {
    ctx.beginPath();
    ctx.arc(source.x, source.y, Math.max(cellWidth /2),Math.PI*2)
}}
