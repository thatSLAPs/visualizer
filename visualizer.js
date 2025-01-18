const canvas = document.getElementById('waveCanvas');
const ctx = canvas.getContext('2d');
const addSourceButton = document.getElementById('addSource');
const frequencyInput = document.getElementById('frequency');

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let soundSources = [];

// Function to create a sound source
function createSoundSource(x, y, frequency) {
  const oscillator = audioContext.createOscillator();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  
  const gainNode = audioContext.createGain();
  gainNode.gain.value = 0.5; // Adjust volume

  oscillator.connect(gainNode).connect(audioContext.destination);
  oscillator.start();

  return { x, y, frequency, oscillator };
}

// Function to draw the wave pattern
function drawWaves() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  soundSources.forEach(source => {
    const { x, y, frequency } = source;

    ctx.beginPath();
    ctx.strokeStyle = `rgba(0, 0, ${Math.min(frequency / 10, 255)}, 0.8)`;
    ctx.lineWidth = 1;

    const wavelength = canvas.width / (frequency / 50); // Adjust wavelength scaling
    for (let i = -wavelength; i <= canvas.width + wavelength; i += wavelength / 20) {
      const distance = Math.hypot(i - x, y - canvas.height / 2);
      const amplitude = Math.sin((distance / wavelength) * Math.PI * 2);

      const waveY = y + amplitude * 50; // Adjust amplitude scaling
      ctx.lineTo(i, waveY);
    }

    ctx.stroke();
    ctx.closePath();
    
    // Draw source point
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = 'red';
    ctx.fill();
    ctx.closePath();
  });

  requestAnimationFrame(drawWaves);
}

// Add new sound source on button click
addSourceButton.addEventListener('click', () => {
  const frequency = parseFloat(frequencyInput.value);
  
  if (frequency >= 20 && frequency <= 2000) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;

    const newSource = createSoundSource(x, y, frequency);
    soundSources.push(newSource);
    
    console.log(`Added sound source at (${x}, ${y}) with frequency ${frequency}Hz`);
  } else {
    alert('Please enter a frequency between 20Hz and 2000Hz.');
  }
});

// Start drawing waves
drawWaves();
