/**
 * Sound Waves: Production & Transmission
 * Singapore O-Level Physics (6091) Interactive Simulation App
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  lucide.createIcons();

  // Tab management & navigation
  setupTabs();

  // Initialize Canvas Simulations
  initIntroSimulation();
  initComparisonSimulations();
  initVibrationSimulation();
  initVacuumSimulation();
  initLabelingSimulation();

  // Flashcards Logic
  initFlashcards();

  // Quiz Engine
  initQuiz();
});

/* ==========================================
   TAB MANAGEMENT
   ========================================== */
function setupTabs() {
  const navButtons = document.querySelectorAll('.nav-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');
  const nextTabButtons = document.querySelectorAll('.next-tab-btn');

  function switchTab(targetId) {
    // Deactivate current active nav/panels
    navButtons.forEach(btn => btn.classList.remove('active'));
    tabPanels.forEach(panel => panel.classList.remove('active'));

    // Activate target
    const targetPanel = document.getElementById(targetId);
    if (targetPanel) {
      targetPanel.classList.add('active');
    }

    const matchedNavBtn = document.querySelector(`.nav-btn[data-target="${targetId}"]`);
    if (matchedNavBtn) {
      matchedNavBtn.classList.add('active');
    }

    // Trigger canvas resizing or clean draws when tabs are switched
    window.dispatchEvent(new Event('resize'));
  }

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target');
      switchTab(target);
    });
  });

  nextTabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-next');
      switchTab(target);
    });
  });
}

/* ==========================================
   CANVAS SIMULATION HELPERS
   ========================================== */
function setupCanvas(canvasId) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext('2d');

  function resize() {
    // Use container-relative sizing for fluid responsiveness
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = (rect.width * 0.45) * window.devicePixelRatio; // Keep ratio stable
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  window.addEventListener('resize', resize);
  resize();

  return { canvas, ctx, resize };
}


/* ==========================================
   SECTION 1: CONCEPT INTRO SIMULATION
   ========================================== */
function initIntroSimulation() {
  const { canvas, ctx } = setupCanvas('intro-canvas');
  let particles = [];
  const particleCount = 800; // Increased density for extremely obvious compression/rarefactions
  let time = 0;

  // Initialize randomized particles
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      baseX: Math.random() * (canvas.clientWidth - 80) + 60,
      baseY: Math.random() * (canvas.clientHeight)
    });
  }

  function draw() {
    if (!document.getElementById('intro-section').classList.contains('active')) {
      requestAnimationFrame(draw);
      return;
    }

    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    time += 0.05;

    // Vibrating speaker membrane on the left
    const speakerX = 25;
    const speakerOffset = Math.sin(time * 2) * 8;

    // Draw speaker body
    ctx.fillStyle = '#1b233d';
    ctx.fillRect(0, 0, speakerX - 10, canvas.clientHeight);

    ctx.fillStyle = '#ffb300';
    ctx.beginPath();
    ctx.moveTo(speakerX - 10, 10);
    ctx.lineTo(speakerX + speakerOffset, canvas.clientHeight * 0.3);
    ctx.lineTo(speakerX + speakerOffset, canvas.clientHeight * 0.7);
    ctx.lineTo(speakerX - 10, canvas.clientHeight - 10);
    ctx.closePath();
    ctx.fill();

    // Wave travels rightward
    const waveSpeed = 2.5;
    const waveFreq = 0.08;

    particles.forEach(p => {
      // Calculate wave phase displacement based on position from speaker
      const distFromSource = p.baseX - speakerX;
      // Longitudinal displacement: particles wiggle horizontally in wave propagation direction
      const displacement = Math.sin(distFromSource * waveFreq - time * waveSpeed) * 12;

      ctx.fillStyle = '#ffb300'; // Always yellow
      ctx.beginPath();
      const actualX = p.baseX + displacement;
      
      ctx.arc(actualX, p.baseY, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw propagating labels "C" and "R" at the top of the canvas
    ctx.font = 'bold 32px var(--font-display)';
    ctx.fillStyle = '#00e676'; // Bright, highly visible green
    ctx.textAlign = 'center';
    
    // Wave speed and frequency parameters
    const wavelength = (2 * Math.PI) / waveFreq; // Length of one wave (~78.5 pixels)
    
    // Calculate the position of the wave peak (compression) at speaker
    // phase = dist * waveFreq - time * waveSpeed
    // Peak density (Compression) occurs where phase is PI (or odd multiples of PI)
    // x_compression = (PI + time * waveSpeed) / waveFreq
    const baseCompressionX = (Math.PI + time * waveSpeed) / waveFreq + speakerX;
    
    // Render labels at integer multiples of wavelength to cover the canvas
    const startDrawX = speakerX + 20;
    const endDrawX = canvas.clientWidth - 20;
    
    // Find first compression that fits
    let currentC_X = baseCompressionX;
    while (currentC_X > startDrawX) {
      currentC_X -= wavelength;
    }
    currentC_X += wavelength; // Step inside the screen boundaries
    
    // Render all visible Compression and Rarefaction marks
    while (currentC_X < endDrawX) {
      if (currentC_X > startDrawX) {
        ctx.fillText('C', currentC_X, 32);
      }
      
      // Rarefaction is half a wavelength away from Compression
      const currentR_X = currentC_X - wavelength / 2;
      if (currentR_X > startDrawX && currentR_X < endDrawX) {
        ctx.fillText('R', currentR_X, 32);
      }
      
      currentC_X += wavelength;
    }

    requestAnimationFrame(draw);
  }

  draw();
}

/* ==========================================
   SECTION 1 COMPARISONS: AIR VS VACUUM
   ========================================== */
function initComparisonSimulations() {
  const airSetup = setupCanvas('compare-air-canvas');
  const vacuumSetup = setupCanvas('compare-vacuum-canvas');
  
  let time = 0;
  const particleCount = 40;
  
  let airParticles = [];
  let vacuumParticles = [];

  function initParticles(setup, arr) {
    arr.length = 0;
    for (let i = 0; i < particleCount; i++) {
      arr.push({
        baseX: Math.random() * (setup.canvas.clientWidth - 70) + 40,
        baseY: Math.random() * (setup.canvas.clientHeight)
      });
    }
  }

  function handleResize() {
    initParticles(airSetup, airParticles);
    initParticles(vacuumSetup, vacuumParticles);
  }
  
  window.addEventListener('resize', handleResize);
  handleResize();

  function draw() {
    if (!document.getElementById('intro-section').classList.contains('active')) {
      requestAnimationFrame(draw);
      return;
    }

    time += 0.08;

    // Draw Air Canvas (Waves Travel)
    const ctxA = airSetup.ctx;
    const canvasA = airSetup.canvas;
    ctxA.clearRect(0, 0, canvasA.clientWidth, canvasA.clientHeight);
    
    // Draw speaker line
    ctxA.fillStyle = '#ffb300';
    const dispA = Math.sin(time * 1.5) * 4;
    ctxA.fillRect(15, 10, 4 + dispA, canvasA.clientHeight - 20);

    airParticles.forEach(p => {
      const dist = p.baseX - 15;
      const waveOffset = Math.sin(dist * 0.08 - time * 1.5) * 6;
      ctxA.fillStyle = '#94a3b8';
      ctxA.beginPath();
      ctxA.arc(p.baseX + waveOffset, p.baseY, 2, 0, Math.PI * 2);
      ctxA.fill();
    });

    // Draw Vacuum Canvas (No Transmission)
    const ctxV = vacuumSetup.ctx;
    const canvasV = vacuumSetup.canvas;
    ctxV.clearRect(0, 0, canvasV.clientWidth, canvasV.clientHeight);
    
    // Speaker line wiggles but no waves propagate because there is complete vacuum (no particles)
    ctxV.fillStyle = '#ffb300';
    const dispV = Math.sin(time * 1.5) * 4;
    ctxV.fillRect(15, 10, 4 + dispV, canvasV.clientHeight - 20);

    // No particles rendered here in vacuum
    requestAnimationFrame(draw);
  }

  draw();
}

/* ==========================================
   SECTION 2: VIBRATION SIMULATION
   ========================================== */
function initVibrationSimulation() {
  const { canvas, ctx } = setupCanvas('vibration-canvas');
  const slider = document.getElementById('freq-slider');
  const freqValLabel = document.getElementById('freq-val');
  const btnFork = document.getElementById('btn-source-fork');
  const btnSpeaker = document.getElementById('btn-source-speaker');

  let freqMode = 2; // 1 = Low, 2 = Medium, 3 = High
  let sourceMode = 'fork'; // 'fork' or 'speaker'
  let particles = [];
  const particleCount = 700; // Increased density for more obvious compression and rarefaction
  let time = 0;

  // Initialize particles
  function resetParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        baseX: Math.random() * (canvas.clientWidth - 100) + 80,
        baseY: Math.random() * (canvas.clientHeight)
      });
    }
  }
  resetParticles();
  window.addEventListener('resize', resetParticles);

  slider.addEventListener('input', (e) => {
    freqMode = parseInt(e.target.value);
    const labels = { 1: 'Low', 2: 'Medium', 3: 'High' };
    freqValLabel.textContent = labels[freqMode];
  });

  btnFork.addEventListener('click', () => {
    btnFork.classList.add('active');
    btnSpeaker.classList.remove('active');
    sourceMode = 'fork';
  });

  btnSpeaker.addEventListener('click', () => {
    btnSpeaker.classList.add('active');
    btnFork.classList.remove('active');
    sourceMode = 'speaker';
  });

  function draw() {
    if (!document.getElementById('vibration-section').classList.contains('active')) {
      requestAnimationFrame(draw);
      return;
    }

    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    // Vibration parameters based on slider
    const speedMultiplier = freqMode === 1 ? 1.5 : (freqMode === 2 ? 3 : 5.5);
    const frequency = freqMode === 1 ? 0.05 : (freqMode === 2 ? 0.09 : 0.15);
    const amp = freqMode === 1 ? 14 : (freqMode === 2 ? 10 : 7);

    time += 0.03 * speedMultiplier;

    // Draw Source on the left
    const sourceX = 60;
    const displacement = Math.sin(time) * amp;

    if (sourceMode === 'fork') {
      // Draw vibrating tuning fork as a green vertical line oscillating back and forth
      ctx.strokeStyle = '#00e676'; // Accessible green color
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(sourceX + displacement, 20);
      ctx.lineTo(sourceX + displacement, canvas.clientHeight - 20);
      ctx.stroke();
    } else {
      // Draw Speaker
      ctx.fillStyle = '#1b233d';
      ctx.fillRect(0, 0, sourceX - 15, canvas.clientHeight);

      ctx.fillStyle = '#ffb300';
      ctx.beginPath();
      ctx.moveTo(sourceX - 15, 15);
      ctx.lineTo(sourceX + displacement, canvas.clientHeight * 0.3);
      ctx.lineTo(sourceX + displacement, canvas.clientHeight * 0.7);
      ctx.lineTo(sourceX - 15, canvas.clientHeight - 15);
      ctx.closePath();
      ctx.fill();
    }

    // Render longitudinal air particles
    particles.forEach(p => {
      const dist = p.baseX - sourceX;
      // Longitudinal wave equation
      const xDisplacement = Math.sin(dist * frequency - time) * amp;
      const finalX = p.baseX + xDisplacement;

      ctx.fillStyle = '#ffb300'; // Keep particles yellow always
      ctx.beginPath();
      ctx.arc(finalX, p.baseY, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  draw();
}

/* ==========================================
   SECTION 3: SOUND IN A VACUUM
   ========================================== */
function initVacuumSimulation() {
  const { canvas, ctx } = setupCanvas('vacuum-canvas');
  const slider = document.getElementById('pressure-slider');
  const badge = document.getElementById('pressure-badge');
  const gaugeVal = document.getElementById('gauge-val');
  const heardIndicator = document.getElementById('heard-indicator');
  const heardIcon = document.getElementById('heard-icon');
  const heardText = document.getElementById('heard-text');
  const vacuumExplanation = document.getElementById('vacuum-explanation');

  let pressure = 100; // 0 to 100
  let particles = [];
  const particleCount = 200;
  let time = 0;

  // Jar parameters
  function getJarCenter() {
    return {
      x: canvas.clientWidth / 2,
      y: canvas.clientHeight / 2,
      radius: canvas.clientHeight / 2 - 12
    };
  }

  function resetParticles() {
    const center = getJarCenter();
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      // Initialize particles inside the circle
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * (center.radius - 8);
      particles.push({
        x: center.x + Math.cos(angle) * dist,
        y: center.y + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5
      });
    }
  }
  resetParticles();
  window.addEventListener('resize', resetParticles);

  slider.addEventListener('input', (e) => {
    pressure = parseInt(e.target.value);
    
    // Update labels & badges
    gaugeVal.textContent = `${pressure} kPa`;
    if (pressure === 100) {
      badge.textContent = 'Atmospheric';
      heardText.textContent = 'Sound Heard Outside';
      heardIndicator.style.opacity = '1';
    } else if (pressure === 0) {
      badge.textContent = 'Vacuum';
      heardText.textContent = 'NO SOUND HEARD OUTSIDE';
      heardIndicator.style.opacity = '0.35';
    } else {
      badge.textContent = `Partial (${pressure}%)`;
      heardText.textContent = 'Sound Muffled';
      heardIndicator.style.opacity = `${0.35 + (pressure / 100) * 0.65}`;
    }

    // Dynamic explanation text
    if (pressure > 70) {
      vacuumExplanation.textContent = 'Air molecules act as the medium. At normal pressure, there are plenty of molecules to carry the vibration.';
    } else if (pressure > 20) {
      vacuumExplanation.textContent = 'As air is removed, the density of particles drops. The wave struggles to travel; sound grows faint and muffled.';
    } else {
      vacuumExplanation.textContent = 'At complete vacuum, there are zero particles. The speaker vibrates, but sound waves cannot form or travel. Space is silent!';
    }
  });

  function draw() {
    if (!document.getElementById('vacuum-section').classList.contains('active')) {
      requestAnimationFrame(draw);
      return;
    }

    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    time += 0.05;

    const center = getJarCenter();

    // 1. Draw Bell/Speaker centered inside the jar
    const bellX = center.x;
    const bellY = center.y;
    const vibrationAmp = (pressure / 100) * 8;
    const displacement = Math.sin(time * 3) * 5; // Vibrates continuously regardless of pressure

    // Draw Bell body
    ctx.fillStyle = '#ffb300';
    ctx.beginPath();
    ctx.arc(bellX + displacement, bellY - 8, 15, Math.PI, 0);
    ctx.lineTo(bellX + 15 + displacement, bellY + 2);
    ctx.lineTo(bellX - 15 + displacement, bellY + 2);
    ctx.closePath();
    ctx.fill();

    // Bell handle & support base
    ctx.fillStyle = '#2e3b5e';
    ctx.fillRect(bellX - 4 + displacement, bellY + 2, 8, 15);
    ctx.fillRect(bellX - 25 + displacement, bellY + 17, 50, 6);

    // 2. Draw surrounding particles (controlled by pressure level)
    // Keep only a fraction of particles visible depending on pressure
    const activeParticleCount = Math.round((pressure / 100) * particleCount);

    for (let i = 0; i < activeParticleCount; i++) {
      const p = particles[i];
      if (!p) continue;

      // Update particle positions randomly (Brownian movement simulated)
      p.x += p.vx;
      p.y += p.vy;

      // Keep particles inside the circle boundary
      const dx = p.x - center.x;
      const dy = p.y - center.y;
      const currentDist = Math.sqrt(dx * dx + dy * dy);
      
      if (currentDist > center.radius - 4) {
        // Bounce off circular wall by reversing velocity vector along normal
        const nx = dx / currentDist;
        const ny = dy / currentDist;
        const dotProduct = p.vx * nx + p.vy * ny;
        p.vx -= 2 * dotProduct * nx;
        p.vy -= 2 * dotProduct * ny;
        // Reposition slightly inside boundary
        p.x = center.x + nx * (center.radius - 6);
        p.y = center.y + ny * (center.radius - 6);
      }

      // Longitudinal/Radial sound transmission wave wiggles outward from bell center
      let waveDisplacementX = 0;
      let waveDisplacementY = 0;
      if (pressure > 0) {
        const dxFromBell = p.x - bellX;
        const dyFromBell = p.y - bellY;
        const distFromBell = Math.sqrt(dxFromBell * dxFromBell + dyFromBell * dyFromBell);
        if (distFromBell > 15) {
          const waveVal = Math.sin(distFromBell * 0.1 - time * 2) * vibrationAmp;
          waveDisplacementX = (dxFromBell / distFromBell) * waveVal;
          waveDisplacementY = (dyFromBell / distFromBell) * waveVal;
        }
      }

      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(p.x + waveDisplacementX, p.y + waveDisplacementY, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw Jar Outline
    ctx.strokeStyle = '#2e3b5e';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(center.x, center.y, center.radius, 0, Math.PI * 2);
    ctx.stroke();

    requestAnimationFrame(draw);
  }

  draw();
}

/* ==========================================
   SECTION 4: DRAG-LABEL FORMAT DIAGRAM
   ========================================== */
function initLabelingSimulation() {
  const { canvas, ctx } = setupCanvas('labeling-canvas');
  let time = 0;

  function draw() {
    if (!document.getElementById('drag-section').classList.contains('active')) {
      requestAnimationFrame(draw);
      return;
    }

    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    time += 0.02;

    // Draw longitudinal wave diagram with compressed and spread out regions
    const startX = 50;
    const endX = canvas.clientWidth - 50;
    const waveFreq = 0.055;

    // Create a regular wave layout for drag labeling - increase wave amplitude and space out steps to cut particles in half
    const amp = 18; // Increased from 14 for even more obvious compression/rarefaction
    for (let x = startX; x < endX; x += 8) { // Increased step from 4 to 8 to cut horizontal particle density in half
      for (let y = 30; y < canvas.clientHeight - 30; y += 12) {
        // High compression at specific x nodes
        const waveX = Math.sin(x * waveFreq - time * 1.5) * amp;
        const actualX = x + waveX + (Math.sin(y) * 2); // add minor jitter
        
        ctx.fillStyle = '#ffb300';
        ctx.beginPath();
        ctx.arc(actualX, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Calculate dynamic positions for Compression and Rarefaction wave peaks
    // Period is wavelength = 2 * PI / waveFreq (~114.2 pixels)
    const wavelength = (2 * Math.PI) / waveFreq;
    
    // Wave peaks propagate rightwards. 
    // Rarefaction (spread out) center: phase = 0 (and even multiples of PI).
    // Let's track a rarefaction wave peak and apply horizontal offset to the left to align the box center
    let rarefyX = (((time * 1.5) / waveFreq) % canvas.clientWidth) + 28;
    if (rarefyX < 0) rarefyX += canvas.clientWidth;
    
    // Compression (bunched) center: phase = PI (and odd multiples of PI).
    // Track compression peak and apply horizontal offset to the left to align the box center
    let compX = (((Math.PI + time * 1.5) / waveFreq) + wavelength) % canvas.clientWidth - 80;
    if (compX < 0) compX += canvas.clientWidth;

    // Update HTML dropzone positions dynamically (converted to percentages for responsive canvas container matching scale)
    const dzCompression = document.getElementById('dz-compression');
    const dzRarefaction = document.getElementById('dz-rarefaction');
    
    if (dzCompression && dzRarefaction) {
      const parentWidth = canvas.clientWidth;
      dzCompression.style.left = `${(compX / parentWidth) * 100}%`;
      dzRarefaction.style.left = `${(rarefyX / parentWidth) * 100}%`;
      
      // Shift Y positions as requested: Compression (higher up), Rarefaction (lower down)
      dzCompression.style.top = '22%';
      dzRarefaction.style.top = '62%';
    }

    // Draw traveling arrow helper at the bottom
    ctx.strokeStyle = '#ffb300';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(startX, canvas.clientHeight - 20);
    ctx.lineTo(endX, canvas.clientHeight - 20);
    ctx.stroke();

    // Arrow tip
    ctx.fillStyle = '#ffb300';
    ctx.beginPath();
    ctx.moveTo(endX, canvas.clientHeight - 20);
    ctx.lineTo(endX - 10, canvas.clientHeight - 25);
    ctx.lineTo(endX - 10, canvas.clientHeight - 15);
    ctx.closePath();
    ctx.fill();

    requestAnimationFrame(draw);
  }

  draw();

  // Setup Drag and Drop events
  const draggables = document.querySelectorAll('.draggable-label');
  const dropzones = document.querySelectorAll('.dropzone');
  const checkBtn = document.getElementById('btn-check-labels');
  const resetBtn = document.getElementById('btn-reset-labels');

  draggables.forEach(draggable => {
    draggable.addEventListener('dragstart', () => {
      draggable.classList.add('dragging');
    });

    draggable.addEventListener('dragend', () => {
      draggable.classList.remove('dragging');
    });
  });

  dropzones.forEach(dropzone => {
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('drag-over');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('drag-over');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('drag-over');
      const draggedLabel = document.querySelector('.dragging');
      if (!draggedLabel) return;

      const acceptType = dropzone.getAttribute('data-accept');
      const labelType = draggedLabel.getAttribute('data-label');

      // Snap logic
      if (acceptType === labelType) {
        dropzone.classList.add('correct');
        dropzone.textContent = draggedLabel.textContent.trim();
        draggedLabel.classList.add('hidden');
      } else {
        // Incorrect placement: Shake dropzone & return
        dropzone.classList.add('shake-animation');
        setTimeout(() => {
          dropzone.classList.remove('shake-animation');
        }, 500);
      }
    });
  });

  resetBtn.addEventListener('click', () => {
    dropzones.forEach(dz => {
      dz.classList.remove('correct');
      dz.innerHTML = '<span class="dz-placeholder">Drop Here</span>';
    });
    draggables.forEach(lbl => {
      lbl.classList.remove('hidden');
    });
  });

  checkBtn.addEventListener('click', () => {
    let allCorrect = true;
    dropzones.forEach(dz => {
      if (!dz.classList.contains('correct')) {
        allCorrect = false;
        dz.classList.add('shake-animation');
        setTimeout(() => {
          dz.classList.remove('shake-animation');
        }, 500);
      }
    });

    if (allCorrect) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#ffb300', '#f8fafc', '#1b233d']
      });
    }
  });
}

/* ==========================================
   SECTION 5: FLASHCARD REVISION
   ========================================== */
function initFlashcards() {
  const flashcard = document.getElementById('main-flashcard');
  const qText = document.getElementById('card-question-text');
  const aText = document.getElementById('card-answer-text');
  const numIndicator = document.getElementById('card-num-indicator');
  const visualSlot = document.getElementById('card-visual-slot');

  const btnPrev = document.getElementById('btn-prev-card');
  const btnNext = document.getElementById('btn-next-card');
  const btnShuffle = document.getElementById('btn-shuffle-cards');

  const cardsData = [
    {
      q: "How is sound produced?",
      a: "Sound is produced by vibrating sources which push and pull surrounding air molecules.",
      visual: "🔊 Vibration → Sound"
    },
    {
      q: "Why does sound need a medium?",
      a: "Sound is a mechanical wave. It requires particles to pass along vibrations. In a vacuum, no particles exist.",
      visual: "🚫 Vacuum = Silent"
    },
    {
      q: "What is a compression?",
      a: "A region in a longitudinal wave where air particles are closest together (high pressure).",
      visual: "░░████░░ (Compressed)"
    },
    {
      q: "What is a rarefaction?",
      a: "A region in a longitudinal wave where air particles are furthest apart (low pressure).",
      visual: "░  ░  ░  (Spread out)"
    },
    {
      q: "What is a longitudinal wave?",
      a: "A wave where the direction of particle vibration is parallel to the direction of wave travel.",
      visual: "⬅➡ Vibration | ➡ Wave Travel"
    }
  ];

  let currentIdx = 0;

  function updateCard() {
    flashcard.classList.remove('flipped');
    setTimeout(() => {
      const current = cardsData[currentIdx];
      qText.textContent = current.q;
      aText.textContent = current.a;
      numIndicator.textContent = `${currentIdx + 1} / ${cardsData.length}`;
      visualSlot.textContent = current.visual;
    }, 150);
  }

  // Flip card trigger
  flashcard.addEventListener('click', () => {
    flashcard.classList.toggle('flipped');
  });

  btnPrev.addEventListener('click', (e) => {
    e.stopPropagation();
    currentIdx = (currentIdx - 1 + cardsData.length) % cardsData.length;
    updateCard();
  });

  btnNext.addEventListener('click', (e) => {
    e.stopPropagation();
    currentIdx = (currentIdx + 1) % cardsData.length;
    updateCard();
  });

  btnShuffle.addEventListener('click', (e) => {
    e.stopPropagation();
    // Simple shuffle
    cardsData.sort(() => Math.random() - 0.5);
    currentIdx = 0;
    updateCard();
  });

  // Initial call
  updateCard();
}

/* ==========================================
   SECTION 6 & 7: RANDOMISED QUIZ ENGINE
   ========================================== */
function initQuiz() {
  const introCard = document.getElementById('quiz-intro-card');
  const questionCard = document.getElementById('quiz-question-card');
  const resultsCard = document.getElementById('quiz-results-card');

  const btnStart = document.getElementById('btn-start-quiz');
  const btnRestart = document.getElementById('btn-restart-quiz');
  const btnBackIntro = document.getElementById('btn-back-intro');
  const btnNextQuestion = document.getElementById('btn-next-question');

  const qProgress = document.getElementById('quiz-progress');
  const qProgressFill = document.getElementById('quiz-progress-fill');
  const qText = document.getElementById('q-text');
  const qOptions = document.getElementById('q-options');
  const qFeedback = document.getElementById('q-feedback');
  const feedbackIcon = document.getElementById('feedback-icon');
  const feedbackTitle = document.getElementById('feedback-title');
  const feedbackDesc = document.getElementById('feedback-desc');

  const resultsScore = document.getElementById('results-score');
  const tierTitle = document.getElementById('tier-title');
  const tierDescription = document.getElementById('tier-description');

  // Breakdown metrics
  const bdProduction = document.getElementById('bd-production');
  const bdProductionPct = document.getElementById('bd-production-pct');
  const bdMedium = document.getElementById('bd-medium');
  const bdMediumPct = document.getElementById('bd-medium-pct');
  const bdProperties = document.getElementById('bd-properties');
  const bdPropertiesPct = document.getElementById('bd-properties-pct');

  // Comprehensive 30-question pool covering O-Level Syllabus
  const questionPool = [
    {
      category: 'production',
      q: "Sound is produced by ___.",
      options: ["Vibrating sources", "Light sources", "Static magnetic fields", "Thermal heat sources"],
      correct: 0,
      explanation: "Sound is created when a vibrating object oscillates, displacing nearby particles."
    },
    {
      category: 'properties',
      q: "What type of wave is a sound wave?",
      options: ["Longitudinal wave", "Transverse wave", "Electromagnetic wave", "Torsional wave"],
      correct: 0,
      explanation: "Sound waves are longitudinal because the vibration direction of air particles is parallel to the wave energy travel."
    },
    {
      category: 'medium',
      q: "True or False: Sound can travel through a vacuum.",
      options: ["False — Sound is a mechanical wave requiring a medium.", "True — Sound propagates via radiation."],
      correct: 0,
      explanation: "A vacuum contains no particles to transmit mechanical vibrations; therefore sound cannot travel."
    },
    {
      category: 'properties',
      q: "A region in a longitudinal wave where the particles are furthest apart is called a ___.",
      options: ["Rarefaction", "Compression", "Peak", "Trough"],
      correct: 0,
      explanation: "Rarefactions are low-density regions where particles spread out."
    },
    {
      category: 'properties',
      q: "A region in a longitudinal wave where the particles are closest together is called a ___.",
      options: ["Compression", "Rarefaction", "Amplitude", "Wavelength"],
      correct: 0,
      explanation: "Compressions are high-density regions where particles bunch together."
    },
    {
      category: 'medium',
      q: "Why can't astronauts hear explosions in space?",
      options: ["Space is a vacuum with no air to act as a medium.", "The helmet blocks all incoming sound.", "Explosions do not produce vibrations in space.", "Sound waves travel too fast in space to hear."],
      correct: 0,
      explanation: "Space has no atmosphere or particles to compress and expand to carry sound energy."
    },
    {
      category: 'properties',
      q: "As a tuning fork's vibration frequency increases, what happens to the spacing between compressions?",
      options: ["Decreases", "Increases", "Stays the same", "Becomes zero"],
      correct: 0,
      explanation: "Higher frequency means a shorter wavelength, making compressions appear closer together."
    },
    {
      category: 'production',
      q: "Which sequence correctly describes sound travel from a speaker to your ear?",
      options: [
        "Speaker vibrates ➔ Compressions & rarefactions travel ➔ Eardrum vibrates",
        "Speaker vibrates ➔ Air particles travel to your ear ➔ Eardrum vibrates",
        "Air particles travel ➔ Speaker vibrates ➔ Eardrum vibrates",
        "Speaker vibrates ➔ Vacuum forms ➔ Eardrum vibrates"
      ],
      correct: 0,
      explanation: "Particles pass vibration energy locally without migrating from the speaker to the ear."
    },
    {
      category: 'medium',
      q: "Through which medium does sound travel fastest?",
      options: ["Solid (e.g. Iron)", "Liquid (e.g. Water)", "Gas (e.g. Air)", "Vacuum"],
      correct: 0,
      explanation: "Particles are closest together in solids, allowing vibrations to pass along much faster."
    },
    {
      category: 'medium',
      q: "Through which medium does sound travel slowest (excluding vacuum)?",
      options: ["Gas (e.g. Air)", "Liquid (e.g. Water)", "Solid (e.g. Steel)", "Glass"],
      correct: 0,
      explanation: "Gases have widely spaced molecules, slowing down collision rates and energy transmission."
    },
    {
      category: 'properties',
      q: "The distance between two consecutive compressions is equal to the ___.",
      options: ["Wavelength", "Amplitude", "Frequency", "Wave speed"],
      correct: 0,
      explanation: "The length of one complete wave cycle is the distance between consecutive similar points (e.g., compression to compression)."
    },
    {
      category: 'production',
      q: "If a speaker membrane stops vibrating, what happens to the sound?",
      options: ["The sound stops immediately.", "The sound continues to travel indefinitely.", "The sound gets louder.", "The wave becomes transverse."],
      correct: 0,
      explanation: "Sound is directly produced by vibration; stopping vibration halts the production of waves."
    },
    {
      category: 'medium',
      q: "What role does air play when someone speaks to you?",
      options: ["It acts as the medium.", "It acts as the source.", "It acts as the receiver.", "It has no role."],
      correct: 0,
      explanation: "Air acts as the gas medium through which the sound waves travel."
    },
    {
      category: 'properties',
      q: "In a longitudinal wave, the direction of energy propagation is ___ to the direction of particle vibration.",
      options: ["Parallel", "Perpendicular", "At 45 degrees", "Opposite"],
      correct: 0,
      explanation: "Longitudinal waves vibrate parallel (along the same line) to energy travel."
    },
    {
      category: 'medium',
      q: "A bell jar's sound level decreases as air is pumped out because ___.",
      options: ["There are fewer particles to transmit the vibration.", "The bell stops vibrating.", "The glass absorbs all the sound waves.", "The electric current stops flowing."],
      correct: 0,
      explanation: "Removing air molecules starves the mechanical wave of its transmission medium."
    }
  ];

  let currentQuestions = [];
  let questionIndex = 0;
  let score = 0;
  let categoryScores = { production: { got: 0, total: 0 }, medium: { got: 0, total: 0 }, properties: { got: 0, total: 0 } };

  function startQuiz() {
    introCard.classList.add('hidden');
    resultsCard.classList.add('hidden');
    questionCard.classList.remove('hidden');

    // Reset scores & picks
    score = 0;
    questionIndex = 0;
    categoryScores = { production: { got: 0, total: 0 }, medium: { got: 0, total: 0 }, properties: { got: 0, total: 0 } };

    // Select 8 random questions
    currentQuestions = [...questionPool].sort(() => Math.random() - 0.5).slice(0, 8);
    showQuestion();
  }

  function showQuestion() {
    qFeedback.classList.add('hidden');
    btnNextQuestion.classList.add('hidden');
    
    const qData = currentQuestions[questionIndex];
    
    // Update progress elements
    qProgress.textContent = `Question ${questionIndex + 1} of 8`;
    qProgressFill.style.width = `${((questionIndex + 1) / 8) * 100}%`;
    qText.textContent = qData.q;

    // Track total category questions
    categoryScores[qData.category].total += 1;

    // Dynamic Options setup
    qOptions.innerHTML = '';
    
    // Shuffle options array keeping correct mapping
    const optionObjs = qData.options.map((opt, i) => ({ text: opt, isCorrect: i === qData.correct }));
    optionObjs.sort(() => Math.random() - 0.5);

    optionObjs.forEach(opt => {
      const button = document.createElement('button');
      button.className = 'option-btn';
      button.textContent = opt.text;
      
      button.addEventListener('click', () => {
        // Disable all option buttons
        document.querySelectorAll('.option-btn').forEach(b => {
          b.disabled = true;
          if (b.textContent === opt.text) {
            b.classList.add('selected');
          }
        });

        // Evaluate answer
        handleAnswer(opt.isCorrect, qData.explanation, qData.category);
      });

      qOptions.appendChild(button);
    });
  }

  function handleAnswer(isCorrect, explanation, category) {
    if (isCorrect) {
      score += 1;
      categoryScores[category].got += 1;
      feedbackTitle.textContent = 'Correct!';
      feedbackIcon.setAttribute('data-lucide', 'check-circle');
      
      // Correct glow class
      const selBtn = document.querySelector('.option-btn.selected');
      if (selBtn) selBtn.classList.add('correct-glow');
    } else {
      feedbackTitle.textContent = 'Incorrect';
      feedbackIcon.setAttribute('data-lucide', 'x-circle');
      
      // Neutral shake simulation
      const selBtn = document.querySelector('.option-btn.selected');
      if (selBtn) {
        selBtn.classList.add('shake-animation');
      }
    }

    feedbackDesc.textContent = explanation;
    lucide.createIcons();
    qFeedback.classList.remove('hidden');
    btnNextQuestion.classList.remove('hidden');
  }

  btnNextQuestion.addEventListener('click', () => {
    questionIndex += 1;
    if (questionIndex < 8) {
      showQuestion();
    } else {
      showResults();
    }
  });

  function showResults() {
    questionCard.classList.add('hidden');
    resultsCard.classList.remove('hidden');

    resultsScore.textContent = `${score} / 8`;

    // Apply 3-tier system messages
    if (score >= 7) {
      tierTitle.textContent = 'Excellent Master!';
      tierDescription.textContent = 'Fantastic score! You clearly understand O-Level Sound Waves concept areas inside out.';
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.75 },
        colors: ['#ffb300', '#f8fafc', '#1b233d']
      });
    } else if (score >= 4) {
      tierTitle.textContent = 'Good Effort!';
      tierDescription.textContent = 'Nice job. We suggest reviewing the Vacuum Simulation and Compression properties to get a perfect score next time.';
    } else {
      tierTitle.textContent = 'Let\'s Learn Again!';
      tierDescription.textContent = 'Take another look at the vibration simulation and try the drag & drop section to reinforce your basics.';
    }

    // Set metrics
    const productionPct = Math.round((categoryScores.production.got / Math.max(1, categoryScores.production.total)) * 100);
    const mediumPct = Math.round((categoryScores.medium.got / Math.max(1, categoryScores.medium.total)) * 100);
    const propertiesPct = Math.round((categoryScores.properties.got / Math.max(1, categoryScores.properties.total)) * 100);

    bdProduction.style.width = `${productionPct}%`;
    bdProductionPct.textContent = `${productionPct}%`;

    bdMedium.style.width = `${mediumPct}%`;
    bdMediumPct.textContent = `${mediumPct}%`;

    bdProperties.style.width = `${propertiesPct}%`;
    bdPropertiesPct.textContent = `${propertiesPct}%`;
  }

  btnStart.addEventListener('click', startQuiz);
  btnRestart.addEventListener('click', startQuiz);
  btnBackIntro.addEventListener('click', () => {
    resultsCard.classList.add('hidden');
    introCard.classList.remove('hidden');
    // switch to intro section
    const matchedNavBtn = document.querySelector(`.nav-btn[data-target="intro-section"]`);
    if (matchedNavBtn) matchedNavBtn.click();
  });
}
