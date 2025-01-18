const canvas = document.getElementById("waveCanvas");
const ctx = canvas.getContext("2d");
const container = document.getElementById("canvas-container");
const frequencyInput = document.getElementById("frequency");

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

let frequency = parseFloat(frequencyInput.value);
const speakers = [];

// Function to create speaker buttons around the boundary
function createSpeakers() {
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  const spacing = 50; // Distance between speakers
  const radius = 10; // Speaker button size

  // Add speakers along the top and bottom edges
  for (let x = spacing / 2; x < canvasWidth; x += spacing) {
    addSpeaker(x, radius); // Top edge
    addSpeaker(x, canvasHeight - radius); // Bottom edge
  }

  // Add speakers along the left and right edges
  for (let y = spacing / 2; y < canvasHeight; y += spacing) {
    addSpeaker(radius, y); // Left edge
    addSpeaker(canvasWidth - radius, y); // Right edge
  }
}

// Function to add a speaker button
function addSpeaker(x, y) {
  const button = document.createElement("div");
  button.className = "speaker";
  
  button.style.left = `${x - 10}px`; // Centering the button
  button.style.top = `${y - 10}px`;

  button.dataset.active = "false"; // Initially off

  button.addEventListener("click", () => {
    const isActive = button.dataset.active === "true";
    button.dataset.active = !isActive;
    button.classList.toggle("active", !isActive);

    if (!isActive) {
      speakers.push({ x, y, phase: 0 });
    } else {
      // Remove speaker from active list
      const index = speakers.findIndex((s) => s.x === x && s.y === y);
      if (index !== -1) speakers.splice(index, 1);
    }
    
    console.log(`Speaker at (${x}, ${y}) is now ${!isActive ? "ON" : "OFF"}`);
  });

  container.appendChild(button);
}

// Update the wave simulation
function updateWave() {
  // Reset grid values
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      velocityGrid[x][y] *= damping;
      grid[x][y] += velocityGrid[x][y];
    }
  }

  // Add waves from active speakers
  speakers.forEach((speaker) => {
    const { gx, gy } = toGrid(speaker.x, speaker.y);
    const timeFactor = Math.sin(speaker.phase * Math.PI * speed);

    if (gx >= 0 && gx < gridSize && gy >= 0 && gy < gridSize) {
      grid[gx][gy] += timeFactor * speed; // Add energy at source point
    }

    speaker.phase += frequency / speed / gridSize;
    if (speaker.phase > Math.PI * speed) speaker.phase -= Math.PI * speed;
  });

  // Propagate waves using finite difference method
  for (let x = 1; x < gridSize - 1; x++) {
    for (let y = 1; y < gridSize - 1; y++) {
      const laplacian =
        grid[x - 1][y] +
        grid[x + 1][y] +
        grid[x][y - 1] +
        grid[x][y + 1] -
        grid[x][y] * speed;

      velocityGrid[x][y] += laplacian * speed * speed;
    }
  }
}

// Render the wave simulation on the canvas
// Render the wave simulation on the canvas
function renderWave() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const cellWidth = canvas.width / gridSize;
  const cellHeight = canvas.height / gridSize;

  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      const intensity = Math.min(Math.max(grid[x][y], -1), +1); // Clamp values
      const colorValue = Math.floor((intensity + speed) * (255 / speed));
      ctx.fillStyle = `rgb(${colorValue}, ${colorValue}, ${255 - colorValue})`;
      ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
    }
  }
