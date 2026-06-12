// Application views & Navigation
let currentView = 'sim-view';
const views = ['sim-view', 'cards-view', 'quiz-view', 'score-view'];

function switchView(viewId) {
  views.forEach(v => {
    document.getElementById(v).classList.remove('active');
  });
  document.getElementById(viewId).classList.add('active');
  currentView = viewId;

  // Navigation is always visible now
  document.getElementById('app-nav').style.display = 'flex';

  // Handle active navigation tabs
  const tabSim = document.getElementById('tab-sim');
  const tabCards = document.getElementById('tab-cards');
  const tabQuiz = document.getElementById('tab-quiz');

  tabSim.classList.remove('active');
  tabCards.classList.remove('active');
  tabQuiz.classList.remove('active');

  if (viewId === 'sim-view') tabSim.classList.add('active');
  if (viewId === 'cards-view') tabCards.classList.add('active');
  if (viewId === 'quiz-view') tabQuiz.classList.add('active');

  // Trigger specific view initializations/resets
  if (viewId === 'sim-view') {
    initSimCanvas();
  }
}


// ----------------------------------------------------
// SECTION 2: INTERACTIVE SIMULATION
// ----------------------------------------------------
let simCanvas, simCtx;
let simMode = 'particles'; // 'particles' or 'streamlines'
let heatSource = 'bottom'; // 'bottom', 'side', 'top'
let simAnimationId;
let simParticles = [];
let streamlinesOffset = 0;

function setSimMode(mode) {
  simMode = mode;
  document.getElementById('mode-particles').classList.toggle('active', mode === 'particles');
  document.getElementById('mode-streamlines').classList.toggle('active', mode === 'streamlines');
}

function setHeatSource(source) {
  heatSource = source;
  document.getElementById('heat-bottom').classList.toggle('active', source === 'bottom');
  document.getElementById('heat-top').classList.toggle('active', source === 'top');

  updateLabels();
  
  if (source === 'top') {
    // Top heating flicker animation trigger
    playTopHeatFlicker();
    // Distribute all particles throughout the container to represent initial state
    if (simParticles && simCanvas) {
      const w = simCanvas.width / (window.devicePixelRatio || 1);
      const h = simCanvas.height / (window.devicePixelRatio || 1);
      const topLimit = h * 0.35;
      simParticles.forEach((p, idx) => {
        p.x = Math.random() * (w - 36) + 18;
        p.y = Math.random() * (h - 40) + 20;
        p.vx = (Math.random() - 0.5) * 1.0;
        p.vy = (Math.random() - 0.5) * 1.0;
        p.colorProgress = p.y < topLimit ? 0.8 : 0;
        p.heatedByCollision = false;
      });
    }
  }
}

function updateLabels() {
  const labelHot = document.getElementById('label-hot');
  const labelCool = document.getElementById('label-cool');
  const labelExplanation = document.getElementById('label-explanation');

  labelHot.style.display = 'none';
  labelCool.style.display = 'none';
  labelExplanation.style.display = 'none';

  // Reset positioning styles to prevent absolute coordinate stretching
  labelHot.style.top = 'auto';
  labelHot.style.bottom = 'auto';
  labelHot.style.left = 'auto';
  labelHot.style.right = 'auto';
  labelHot.style.transform = 'none';

  labelCool.style.top = 'auto';
  labelCool.style.bottom = 'auto';
  labelCool.style.left = 'auto';
  labelCool.style.right = 'auto';
  labelCool.style.transform = 'none';

  if (heatSource === 'bottom') {
    labelHot.style.display = 'block';
    labelHot.textContent = "Lower density — rises";
    labelHot.style.left = '50%';
    labelHot.style.bottom = '60px';
    labelHot.style.transform = 'translateX(-50%)';

    labelCool.style.display = 'block';
    labelCool.textContent = "Higher density — sinks";
    labelCool.style.left = '50%';
    labelCool.style.top = '30px';
    labelCool.style.transform = 'translateX(-50%)';
  } else if (heatSource === 'top') {
    labelHot.style.display = 'block';
    labelHot.textContent = "Lower density — already at top";
    labelHot.style.left = '50%';
    labelHot.style.top = '50px';
    labelHot.style.transform = 'translateX(-50%)';
  }
}

let topFlickerActive = false;
let topFlickerStartTime = 0;
function playTopHeatFlicker() {
  topFlickerActive = true;
  topFlickerStartTime = Date.now();
  setTimeout(() => {
    topFlickerActive = false;
    document.getElementById('label-explanation').style.display = 'block';
    document.getElementById('label-explanation').textContent = "Hot fluid is already at the top. No upward movement possible. Convection does not occur.";
  }, 2000); // 2s flicker
}

function resetSim() {
  heatSource = 'bottom';
  setHeatSource('bottom');
  document.getElementById('label-explanation').style.display = 'none';
  
  if (!simCanvas) return;
  const width = simCanvas.width / (window.devicePixelRatio || 1);
  const centerX = width / 2;
  const yellowRegionWidth = width * 0.44;

  // Re-init particles with cold state except the ones directly above the heat source
  simParticles.forEach(p => {
    const isInsideYellow = Math.abs(p.x - centerX) < yellowRegionWidth / 2;
    p.colorProgress = isInsideYellow ? 0.8 : 0;
    p.vx = (Math.random() - 0.5) * 0.5;
    p.vy = isInsideYellow ? -1.0 : 0.5;
    p.heatedByCollision = false;
  });
}

function initSimCanvas() {
  simCanvas = document.getElementById('sim-canvas');
  simCtx = simCanvas.getContext('2d');
  
  const width = simCanvas.clientWidth;
  const height = simCanvas.clientHeight;
  const dpr = window.devicePixelRatio || 1;
  simCanvas.width = width * dpr;
  simCanvas.height = height * dpr;
  simCtx.scale(dpr, dpr);

  // Read current slider value to initialize particles
  const currentCount = parseInt(document.getElementById('particle-slider').value, 10);
  document.getElementById('particle-count-label').textContent = currentCount;

  const centerX = width / 2;
  const yellowRegionWidth = width * 0.44;

  // Initialize interactive simulation particles
  simParticles = [];
  for (let i = 0; i < currentCount; i++) {
    const x = Math.random() * (width - 30) + 15;
    const y = Math.random() * (height - 30) + 15;
    const isInsideYellow = Math.abs(x - centerX) < yellowRegionWidth / 2;

    simParticles.push({
      x: x,
      y: y,
      colorProgress: isInsideYellow ? 0.8 : 0,
      vx: (Math.random() - 0.5) * 0.5,
      vy: isInsideYellow ? -1.0 : 0.5,
      heatedByCollision: false
    });
  }

  if (simAnimationId) cancelAnimationFrame(simAnimationId);
  updateLabels();
  runSimulation();
}

function changeParticleCount(val) {
  const newCount = parseInt(val, 10);
  document.getElementById('particle-count-label').textContent = newCount;
  
  if (!simCanvas || !simParticles) return;
  const width = simCanvas.clientWidth;
  const height = simCanvas.clientHeight;
  const centerX = width / 2;
  const yellowRegionWidth = width * 0.44;

  if (newCount > simParticles.length) {
    const diff = newCount - simParticles.length;
    for (let i = 0; i < diff; i++) {
      const x = Math.random() * (width - 30) + 15;
      const y = Math.random() * (height - 30) + 15;
      const isInsideYellow = heatSource === 'bottom' && Math.abs(x - centerX) < yellowRegionWidth / 2;

      simParticles.push({
        x: x,
        y: y,
        colorProgress: isInsideYellow ? 0.8 : 0,
        vx: (Math.random() - 0.5) * 0.5,
        vy: isInsideYellow ? -1.0 : 0.5,
        heatedByCollision: false
      });
    }
  } else if (newCount < simParticles.length) {
    simParticles = simParticles.slice(0, newCount);
  }
}

function runSimulation() {
  const w = simCanvas.width / (window.devicePixelRatio || 1);
  const h = simCanvas.height / (window.devicePixelRatio || 1);

  simCtx.clearRect(0, 0, w, h);

  // Draw Heat Source glow depending on selection
  drawSimHeatSource(w, h);

  // Update streamline dash patterns over time
  streamlinesOffset -= 0.8;

  if (heatSource === 'top' && topFlickerActive) {
    // Render brief flickering neon red upward motion at top
    const elapsed = Date.now() - topFlickerStartTime;
    const alpha = Math.max(1 - elapsed / 2000, 0);
    simCtx.fillStyle = `rgba(255, 42, 95, ${alpha * 0.3})`;
    simCtx.fillRect(15, 15, w - 30, 40);
  }

  // Draw Mode specific
  if (simMode === 'particles') {
    updateAndDrawParticles(w, h);
  } else {
    drawStreamlines(w, h);
  }

  // Container border outline
  simCtx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
  simCtx.lineWidth = 3;
  simCtx.strokeRect(10, 10, w - 20, h - 20);

  simAnimationId = requestAnimationFrame(runSimulation);
}

function drawSimHeatSource(w, h) {
  simCtx.shadowBlur = 0;
  if (heatSource === 'bottom') {
    // Bottom heat
    const grad = simCtx.createLinearGradient(0, h - 20, 0, h - 45);
    grad.addColorStop(0, 'rgba(255, 42, 95, 0.4)');
    grad.addColorStop(1, 'rgba(255, 42, 95, 0)');
    simCtx.fillStyle = grad;
    simCtx.fillRect(12, h - 45, w - 24, 33);
    // Draw neon heat bar
    simCtx.shadowBlur = 10;
    simCtx.shadowColor = '#ff2a5f';
    simCtx.fillStyle = '#ff2a5f';
    simCtx.fillRect(w / 2 - 50, h - 18, 100, 5);
  } else if (heatSource === 'top') {
    // Top heat
    const grad = simCtx.createLinearGradient(0, 12, 0, 45);
    grad.addColorStop(0, 'rgba(255, 42, 95, 0.4)');
    grad.addColorStop(1, 'rgba(255, 42, 95, 0)');
    simCtx.fillStyle = grad;
    simCtx.fillRect(12, 12, w - 24, 33);
    // Neon bar
    simCtx.shadowBlur = 10;
    simCtx.shadowColor = '#ff2a5f';
    simCtx.fillStyle = '#ff2a5f';
    simCtx.fillRect(w / 2 - 50, 12, 100, 5);
  }
  simCtx.shadowBlur = 0;
}

function updateAndDrawParticles(w, h) {
  const centerX = w / 2;

  simParticles.forEach(p => {
    // Ensure velocity exists
    if (p.vx === undefined) p.vx = 0;
    if (p.vy === undefined) p.vy = 0;

    // Apply drag to keep speeds stable
    p.vx *= 0.92;
    p.vy *= 0.92;

    if (heatSource === 'bottom') {
      const yellowRegionWidth = w * 0.44;
      const isInsideYellow = Math.abs(p.x - centerX) < yellowRegionWidth / 2;

      // 1. Heat absorption at the bottom center
      if (p.y > h - 45 && isInsideYellow) {
        p.colorProgress = Math.min(p.colorProgress + 0.08, 1);
      }

      // Continuous random walk velocity steering (prevents straight line movements)
      p.vx += (Math.random() - 0.5) * 0.22;
      p.vy += (Math.random() - 0.5) * 0.18;

      // Global gravity and buoyancy (applies to all particles to ensure sinking/rising)
      p.vy += 0.06 * (1 - p.colorProgress); // gravity pulls cold down
      p.vy -= 0.14 * p.colorProgress;       // buoyancy pushes hot up

      if (isInsideYellow) {
        // 2. Yellow region: Heated rising column
        // Cap upward velocity independently so horizontal drift is never suppressed
        p.vy = Math.max(p.vy, -1.8);
        
        // Push particles horizontally outward near the bottom heater to spread them out
        if (p.y > h - 80) {
          p.vx += (p.x < centerX ? -0.06 : 0.06) * p.colorProgress;
        }

        // Steer back center only if they drift near the boundary edge of the yellow region
        if (Math.abs(p.x - centerX) > (yellowRegionWidth / 2 - 8)) {
          p.vx += (centerX - p.x) * 0.04 * p.colorProgress;
        }

        // Limit horizontal velocity to keep movement smooth and natural
        p.vx = Math.max(Math.min(p.vx, 1.2), -1.2);
      } else {
        // 3. Green region (sides): Cold sinking zones
        p.colorProgress = Math.max(p.colorProgress - 0.02, 0);
        p.vy = Math.min(p.vy, 0.7);

        // Keep particles in the side channels while allowing slow, random horizontal drift
        if (p.y < h - 45) {
          const innerBoundary = yellowRegionWidth / 2;
          if (Math.abs(p.x - centerX) < (innerBoundary + 6)) {
            p.vx += (p.x < centerX ? -0.08 : 0.08); // push back to side
          }
          // Add slow random drift velocity (no straight line queue)
          p.vx += (Math.random() - 0.5) * 0.06;
          p.vx = Math.max(Math.min(p.vx, 0.6), -0.6);
        }
      }

      // 4. Boundary transitions:
      // Near top: push outwards to sides
      if (p.y < 45) {
        p.colorProgress = Math.max(p.colorProgress - 0.03, 0);
        p.vx += (p.x < centerX ? -0.16 : 0.16);
      }
      // Near bottom: pull back towards center heater
      if (p.y > h - 45) {
        p.vx += (p.x < centerX ? 0.16 : -0.16);
      }

      // Update position smoothly by velocity (removes shaking vibration)
      p.x += p.vx;
      p.y += p.vy;

    } else if (heatSource === 'top') {
      // Top heat: No circulation, smooth randomized thermal motion (no vibration)
      const topLimit = h * 0.35;
      
      // Collision detection for energy transfer at the boundary interface
      if (p.colorProgress > 0.5) {
        simParticles.forEach(other => {
          if (other !== p && other.y >= topLimit && !other.heatedByCollision) {
            const dx = other.x - p.x;
            const dy = other.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 22) {
              // Heat transfer!
              other.colorProgress = Math.min(other.colorProgress + 0.35, 0.7);
              other.heatedByCollision = true; // Kinetically excited, will move faster
              p.colorProgress = Math.max(p.colorProgress - 0.2, 0.4);
              
              // Elastic collision impulse
              const angle = Math.atan2(dy, dx);
              other.vx += Math.cos(angle) * 0.7;
              other.vy += Math.sin(angle) * 0.7;
              p.vx -= Math.cos(angle) * 0.7;
              p.vy -= Math.sin(angle) * 0.7;
            }
          }
        });
      }

      if (p.y < topLimit) {
        p.colorProgress = Math.min(p.colorProgress + 0.04, 1);
        
        // Random steering force for hot particles (fast)
        p.vx += (Math.random() - 0.5) * 0.45;
        p.vy += (Math.random() - 0.5) * 0.45;
        
        // Keep hot particles floating in the upper yellow region
        if (p.y > topLimit - 8) {
          p.vy -= 0.18;
        }

        // Limit speed to a fast range (1.2 to 2.4)
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 2.4) {
          p.vx *= 2.4 / speed;
          p.vy *= 2.4 / speed;
        } else if (speed < 1.2) {
          p.vx *= 1.2;
          p.vy *= 1.2;
        }
      } else {
        // Cold region: update temperatures unless heated by collision
        if (!p.heatedByCollision) {
          p.colorProgress = Math.max(p.colorProgress - 0.03, 0);
        }

        // Random steering force for cold particles (slow)
        p.vx += (Math.random() - 0.5) * 0.06;
        p.vy += (Math.random() - 0.5) * 0.06;
        
        // Keep cold particles in the lower green region
        if (p.y < topLimit + 8) {
          p.vy += 0.18;
        }

        // Limit speed based on whether it was heated by collision
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (p.heatedByCollision) {
          // Energetic speed limit: slightly faster range (0.8 to 1.5) and does not decay to slow
          if (speed > 1.5) {
            p.vx *= 1.5 / speed;
            p.vy *= 1.5 / speed;
          } else if (speed < 0.8) {
            p.vx *= 1.15;
            p.vy *= 1.15;
          }
        } else {
          // Default slow range (0.2 to 0.5)
          if (speed > 0.5) {
            p.vx *= 0.5 / speed;
            p.vy *= 0.5 / speed;
          } else if (speed < 0.2) {
            p.vx *= 1.1;
            p.vy *= 1.1;
          }
        }
      }

      // Update position smoothly by velocity (removes shaking vibration)
      p.x += p.vx;
      p.y += p.vy;
    }

    // Keep particles in boundaries
    if (p.x < 18) { p.x = 18; p.vx *= -0.5; }
    if (p.x > w - 18) { p.x = w - 18; p.vx *= -0.5; }
    if (p.y < 18) { p.y = 18; p.vy *= -0.5; }
    if (p.y > h - 22) { p.y = h - 22; p.vy *= -0.5; }

    // Draw particle
    simCtx.beginPath();
    simCtx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
    const r = Math.floor(255 * p.colorProgress + 0 * (1 - p.colorProgress));
    const g = Math.floor(42 * p.colorProgress + 229 * (1 - p.colorProgress));
    const b = Math.floor(95 * p.colorProgress + 255 * (1 - p.colorProgress));
    simCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    simCtx.fill();
  });
}

function drawStreamlines(w, h) {
  if (heatSource === 'top') return; // No arrows for top heat

  simCtx.lineWidth = 3;
  simCtx.lineCap = 'round';
  simCtx.setLineDash([8, 12]);
  simCtx.lineDashOffset = streamlinesOffset;

  if (heatSource === 'bottom') {
    // Left Loop (Hot center rise -> Top left corner -> Sinking wall -> Bottom center return)
    let gradLeft = simCtx.createLinearGradient(w/2, h - 30, 30, 30);
    gradLeft.addColorStop(0.0, '#ff2a5f'); // Hot at bottom
    gradLeft.addColorStop(0.4, '#ff2a5f'); // Hot rising center
    gradLeft.addColorStop(0.7, '#00e5ff'); // Cool top-left corner
    gradLeft.addColorStop(1.0, '#00e5ff'); // Cool sinking wall
    simCtx.strokeStyle = gradLeft;

    simCtx.beginPath();
    simCtx.moveTo(w/2 - 15, h - 30);
    simCtx.lineTo(w/2 - 15, 45);
    simCtx.arcTo(w/2 - 15, 30, w/2 - 30, 30, 15);
    simCtx.lineTo(45, 30);
    simCtx.arcTo(30, 30, 30, 45, 15);
    simCtx.lineTo(30, h - 45);
    simCtx.arcTo(30, h - 30, 45, h - 30, 15);
    simCtx.lineTo(w/2 - 30, h - 30);
    simCtx.arcTo(w/2 - 15, h - 30, w/2 - 15, h - 45, 15);
    simCtx.stroke();

    // Right Loop (Hot center rise -> Top right corner -> Sinking wall -> Bottom center return)
    let gradRight = simCtx.createLinearGradient(w/2, h - 30, w - 30, 30);
    gradRight.addColorStop(0.0, '#ff2a5f');
    gradRight.addColorStop(0.4, '#ff2a5f');
    gradRight.addColorStop(0.7, '#00e5ff');
    gradRight.addColorStop(1.0, '#00e5ff');
    simCtx.strokeStyle = gradRight;

    simCtx.beginPath();
    simCtx.moveTo(w/2 + 15, h - 30);
    simCtx.lineTo(w/2 + 15, 45);
    simCtx.arcTo(w/2 + 15, 30, w/2 + 30, 30, 15);
    simCtx.lineTo(w - 45, 30);
    simCtx.arcTo(w - 30, 30, w - 30, 45, 15);
    simCtx.lineTo(w - 30, h - 45);
    simCtx.arcTo(w - 30, h - 30, w - 45, h - 30, 15);
    simCtx.lineTo(w/2 + 30, h - 30);
    simCtx.arcTo(w/2 + 15, h - 30, w/2 + 15, h - 45, 15);
    simCtx.stroke();
  }

  simCtx.setLineDash([]); // Reset dash
}

// ----------------------------------------------------
// SECTION 3: FLASHCARDS
// ----------------------------------------------------
const flashcardsPool = [
  { q: "Definition of Convection", a: "Convection is the transfer of thermal energy in a fluid (liquid or gas) by the physical movement of the fluid itself, caused by density differences." },
  { q: "Why convection only occurs in fluids", a: "Convective flow requires atoms/molecules to be free to move and flow. In solids, particles are locked in fixed positions and can only vibrate." },
  { q: "Fluid density when heated", a: "When heated, a fluid expands, increasing its volume. Because density = mass/volume, the density decreases (becomes lighter)." },
  { q: "Fluid density when cooled", a: "When cooled, a fluid contracts, decreasing its volume. Because density = mass/volume, the density increases (becomes heavier)." },
  { q: "Why hot fluid rises & cool fluid sinks", a: "Hot fluid expands and becomes less dense than the surrounding cooler fluid, so it floats upward. Cooler, denser fluid sinks to displace it." },
  { q: "Why top heating prevents convection", a: "Heating at the top creates a layer of hot, less-dense fluid already at the top. Since it cannot rise any further, no circulating current can form." },
  { q: "What is a convection current?", a: "A continuous circulating flow loop within a fluid, driven by hotter (less dense) fluid rising and cooler (more dense) fluid sinking." },
  { q: "Role of density changes", a: "Density changes act as the driving force. Temperature differences generate local density variations, which gravity pulls into circulation loops." },
  { q: "Convection vs Conduction", a: "Conduction transfers heat via particle collisions and free electron diffusion without bulk matter movement. Convection transfers heat via bulk fluid flow." },
  { q: "Everyday example: Floor Heater", a: "A floor heater heats the air at the bottom, making it less dense so it rises. Cold air at the ceiling sinks, forming a room-wide convection current." }
];

let flashcards = [...flashcardsPool];
let cardIndex = 0;

function updateFlashcardUI() {
  const card = flashcards[cardIndex];
  document.getElementById('card-front-text').textContent = card.q;
  document.getElementById('card-back-text').textContent = card.a;
  document.getElementById('cards-counter-text').textContent = `Card ${cardIndex + 1} of ${flashcards.length}`;
  document.getElementById('flashcard-element').classList.remove('flipped');
}

function flipCard() {
  document.getElementById('flashcard-element').classList.toggle('flipped');
}

function shuffleCards() {
  const cardEl = document.getElementById('flashcard-element');
  const isFlipped = cardEl.classList.contains('flipped');

  if (isFlipped) {
    // Flip the card back to the question side first
    cardEl.classList.remove('flipped');
    // Wait for the flip animation transition to finish before shuffling
    setTimeout(() => {
      flashcards.sort(() => Math.random() - 0.5);
      cardIndex = 0;
      updateFlashcardUI();
    }, 350);
  } else {
    // Shuffle immediately if already on the question side
    flashcards.sort(() => Math.random() - 0.5);
    cardIndex = 0;
    updateFlashcardUI();
  }
}

// Mobile swipe detection for flashcards
let touchStartX = 0;
let touchEndX = 0;

function handleGesture() {
  if (touchEndX < touchStartX - 50) {
    // Swipe left: next card
    if (cardIndex < flashcards.length - 1) {
      cardIndex++;
      updateFlashcardUI();
    }
  }
  if (touchEndX > touchStartX + 50) {
    // Swipe right: previous card
    if (cardIndex > 0) {
      cardIndex--;
      updateFlashcardUI();
    }
  }
}

const deckContainer = document.getElementById('deck-container-element');
deckContainer.addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].screenX;
});

deckContainer.addEventListener('touchend', e => {
  touchEndX = e.changedTouches[0].screenX;
  handleGesture();
});

// Add desktop fallback mouse dragging simulation for swipe
let isDragging = false;
deckContainer.addEventListener('mousedown', e => {
  touchStartX = e.clientX;
  isDragging = true;
});
deckContainer.addEventListener('mouseup', e => {
  if (!isDragging) return;
  touchEndX = e.clientX;
  isDragging = false;
  handleGesture();
});

// ----------------------------------------------------
// SECTION 4: QUIZ ENGINE
// ----------------------------------------------------
const quizQuestionsPool = [
  {
    q: "In which of the following states of matter can convection take place?",
    options: ["Gases and liquids only", "Solids and liquids only", "Gases only", "Solids, liquids, and gases"],
    correct: 0,
    explanation: "Convection requires particles to be free to move, which is only possible in fluids (liquids and gases)."
  },
  {
    q: "Why can't convection happen in a solid block of metal?",
    options: ["Solid particles cannot flow or move freely", "Metal is a poor conductor", "Metals do not expand when heated", "Solids are already too dense to rise"],
    correct: 0,
    explanation: "Solid particles are locked in fixed lattice positions and cannot move bulk-wise to form currents."
  },
  {
    q: "When a liquid is heated, its density decreases. What causes this change in density?",
    options: ["The liquid expands, increasing its volume", "The mass of the liquid decreases", "The particles get lighter", "The particles slow down"],
    correct: 0,
    explanation: "Heating causes expansion (larger volume). Since density is mass divided by volume, the density drops."
  },
  {
    q: "What happens to a fluid when it is cooled?",
    options: ["It contracts, volume decreases, and density increases", "It expands, volume increases, and density decreases", "It loses mass, lowering density", "It expands, volume decreases, and density increases"],
    correct: 0,
    explanation: "Cooling causes contraction, reducing the volume. This makes the fluid denser, causing it to sink."
  },
  {
    q: "Why does hot air rise in a room?",
    options: ["It is less dense than the surrounding cool air", "It is pushed up by conduction forces", "Hot particles are lighter than cold particles", "Hot air experiences less gravity"],
    correct: 0,
    explanation: "Hot air expands, becoming less dense than the cool air around it. The cooler, denser air sinks and pushes the hot air upward."
  },
  {
    q: "If you heat a container of water from the top, what happens?",
    options: ["Convection does not occur because the hot water stays at the top", "A strong convection current is established immediately", "Convection occurs because hot water sinks", "The top water cools down and sinks"],
    correct: 0,
    explanation: "Since hot water is less dense and is already at the top, it cannot rise further. Thus, no convection current is formed."
  },
  {
    q: "Where is the best position to place a heating element to heat a beaker of water quickly?",
    options: ["At the bottom", "At the top", "On the side near the top", "Outside the container"],
    correct: 0,
    explanation: "Placing it at the bottom allows the heated water to rise and cool water to sink, forming a full convection loop."
  },
  {
    q: "Which heat source placement produces a stronger, more symmetrical convection current?",
    options: ["Bottom", "Side", "Top", "Both bottom and side are identical"],
    correct: 0,
    explanation: "Heating from the bottom creates two symmetric loop cells that circulate throughout the entire fluid."
  },
  {
    q: "What drives a convection current?",
    options: ["Density differences within the fluid", "The vibration of atoms in a lattice", "Molecular collisions along a path", "The movement of free electrons"],
    correct: 0,
    explanation: "Convection is driven by gravity acting on regions of differing fluid density."
  },
  {
    q: "Why is a home air conditioning unit typically mounted near the ceiling?",
    options: ["Cool air is denser and sinks to the floor", "Cool air is less dense and rises", "It prevents conduction through the floor", "It looks more premium"],
    correct: 0,
    explanation: "ACs cool the top air, making it denser. This air sinks to cool the room, while warmer air rises to be cooled."
  },
  {
    q: "A fluid is heated from the bottom. What direction does the heated fluid move?",
    options: ["Vertically upward", "Vertically downward", "Horizontally to the sides", "It remains stationary"],
    correct: 0,
    explanation: "Heated fluid expands, decreases in density, and rises straight up."
  },
  {
    q: "True or False: Convection can occur in a vacuum.",
    options: ["False, because convection requires a medium (fluid particles)", "True, because radiant heat drives density changes", "True, because gravity works in a vacuum", "False, because density does not exist in a vacuum"],
    correct: 0,
    explanation: "Convection is the physical movement of fluid particles. Since a vacuum has no particles, it cannot occur."
  },
  {
    q: "Which region in a convection current container has the highest density?",
    options: ["The cool region opposite the heat source", "The region directly above the heat source", "The center of the rising column", "All regions have equal density"],
    correct: 0,
    explanation: "The cool region has the lowest temperature, causing the fluid to contract and have the highest relative density."
  },
  {
    q: "What happens to the rate of convection as you increase the temperature of the heat source?",
    options: ["It increases because of larger density differences", "It decreases because particles move too fast", "It remains constant", "It stops completely"],
    correct: 0,
    explanation: "A hotter source creates larger temperature and density differences, accelerating the convective flow."
  },
  {
    q: "What role does gravity play in convection currents?",
    options: ["Gravity pulls denser, cooler fluid downward, displacing lighter fluid", "Gravity pushes less-dense hot fluid upward directly", "Gravity makes hot particles expand", "Convection is independent of gravity"],
    correct: 0,
    explanation: "Gravity pulls the heavier (more dense) cool fluid down, which forces the lighter, hot fluid to float upwards."
  },
  {
    q: "In streamlines mode, what do the arrows show?",
    options: ["The path and direction of the convection flow loop", "The vibrations of individual atoms", "The velocity vectors of free electrons", "The rate of conduction energy transfer"],
    correct: 0,
    explanation: "Streamlines represent the continuous circulation paths of the fluid current."
  },
  {
    q: "A beaker is heated from the side. How does the convection loop behave?",
    options: ["It forms an asymmetric loop rising along the heated wall and sinking opposite", "It forms two symmetric loops rising in the middle", "It does not circulate", "It oscillates up and down randomly"],
    correct: 0,
    explanation: "Fluid near the side wall heats and rises there, flowing across the top and sinking down the cooler opposite wall."
  },
  {
    q: "Why does a hot air balloon rise?",
    options: ["The hot air inside is less dense than the cool air outside", "The fabric of the balloon is lighter than air", "The burner pushes the balloon up with gas pressure", "Conduction heats the air below the balloon"],
    correct: 0,
    explanation: "Heating the air inside the balloon lowers its density compared to the surrounding air, creating an upward buoyant force."
  },
  {
    q: "In which situation is convection the primary method of heat transfer?",
    options: ["Boiling water in a kettle", "Heating one end of a copper rod", "Heat traveling from the Sun to Earth", "Using an ice pack on a sprained ankle"],
    correct: 0,
    explanation: "Boiling water relies on hot water rising from the bottom heating element, making convection the primary mechanism."
  },
  {
    q: "What is the relative density of the fluid directly above a bottom heat source?",
    options: ["Lower than the surrounding fluid", "Higher than the surrounding fluid", "Same as the surrounding fluid", "Varies randomly"],
    correct: 0,
    explanation: "Directly above the heat source, the fluid absorbs thermal energy, expands, and decreases in density."
  },
  {
    q: "If a fluid has uniform temperature throughout, what happens to convection?",
    options: ["No convection occurs because there are no density differences", "Convection continues at a slow rate", "Convection accelerates", "Particles move in circular paths anyway"],
    correct: 0,
    explanation: "Without a temperature difference, density remains uniform, meaning there is no driving force for circulation."
  },
  {
    q: "Which everyday scenario is NOT primarily a result of convection?",
    options: ["A metal spoon becoming hot in a cup of tea", "Land and sea breezes", "The circulating water in a boiling pot", "Hot air rising from a toaster"],
    correct: 0,
    explanation: "The heating of a metal spoon in tea is caused by conduction through the solid metal structure."
  },
  {
    q: "What is a main difference between conduction and convection at the particle level?",
    options: ["Convection involves bulk movement of particles; conduction does not", "Conduction involves movement of particles; convection does not", "Convection only occurs via free electrons", "Conduction is faster than convection in gases"],
    correct: 0,
    explanation: "In conduction, particles only pass kinetic energy through collisions. In convection, the particles move from place to place."
  },
  {
    q: "Why are refrigerators designed with the cooling compartment at the top?",
    options: ["Cold air is denser and sinks to cool the lower shelves", "It prevents heat from rising out when opening the door", "It is easier to clean", "Cold air rises to cool the ceiling"],
    correct: 0,
    explanation: "Air cooled at the top becomes denser and sinks, ensuring the entire refrigerator stays cool."
  },
  {
    q: "If you heat a liquid at the side, why does it cross the top?",
    options: ["Rising hot fluid is pushed horizontally when it hits the surface boundary", "The top air pulls the fluid across", "The fluid cools instantly at the top and sinks", "Gravity pulls it horizontally"],
    correct: 0,
    explanation: "As the hot fluid rises to the surface, it has nowhere else to go but horizontally along the surface, cooling as it goes."
  },
  {
    q: "Which statement is true about convection currents in gases?",
    options: ["They occur faster than in liquids due to lower density and viscosity", "They do not occur in gases", "They require higher gravity than liquids", "They require solids to initiate them"],
    correct: 0,
    explanation: "Gases have much lower viscosity and density than liquids, allowing convection currents to form very rapidly."
  },
  {
    q: "How does a sea breeze form during a hot sunny day?",
    options: ["Land heats up faster than the sea, causing air above land to rise and cool sea air to blow in", "Sea heats up faster than land, causing sea air to rise", "Cool land air blows out to the warm sea", "Wind is driven only by the rotation of the Earth"],
    correct: 0,
    explanation: "Land warms faster, heating the air above it so it rises. Cooler air over the sea moves in to replace it, creating a breeze."
  },
  {
    q: "What happens to the density label near a side heat source?",
    options: ["It reads 'Lower density — rises'", "It reads 'Higher density — sinks'", "It reads 'Lower density — already at top'", "It is hidden"],
    correct: 0,
    explanation: "The side heat source reduces the density of the fluid next to it, causing it to rise."
  },
  {
    q: "Why do coastal regions experience land breezes at night?",
    options: ["Land cools down faster than the sea, so warm air above the sea rises and cool land air blows out", "Sea cools down faster, driving cold air to land", "Tides pull the air out", "The moon cools the land air"],
    correct: 0,
    explanation: "At night, the land cools faster. The air above the warmer sea rises, and cooler air from the land blows out to sea."
  },
  {
    q: "If a fluid container is placed in a zero-gravity environment (like space), will convection occur?",
    options: ["No, because gravity is required to pull denser fluid down and float lighter fluid up", "Yes, because heating still changes fluid density", "Yes, because molecules still collide", "No, because density is zero in space"],
    correct: 0,
    explanation: "Without gravity, density differences do not cause buoyant forces (nothing rises or sinks), so convection cannot occur."
  }
];

let selectedQuestions = [];
let quizIndex = 0;
let quizScore = 0;
let userHasAnswered = false;

function startQuiz() {
  selectedQuestions = [...quizQuestionsPool];
  selectedQuestions.sort(() => Math.random() - 0.5);
  selectedQuestions = selectedQuestions.slice(0, 10); // pick 10
  
  quizIndex = 0;
  quizScore = 0;
  
  showQuestion();
}

function showQuestion() {
  userHasAnswered = false;
  document.getElementById('quiz-next-btn').disabled = true;
  document.getElementById('quiz-feedback').classList.remove('show', 'correct-style', 'wrong-style');

  const qData = selectedQuestions[quizIndex];
  document.getElementById('quiz-progress-text').textContent = `Question ${quizIndex + 1}/10`;
  document.getElementById('quiz-score-text').textContent = `Score: ${quizScore}`;
  document.getElementById('quiz-question-el').textContent = qData.q;

  // Render options shuffled
  const optionsContainer = document.getElementById('quiz-options-container');
  optionsContainer.innerHTML = '';

  // Store original indices with values
  const indexedOptions = qData.options.map((opt, idx) => ({ text: opt, originalIndex: idx }));
  indexedOptions.sort(() => Math.random() - 0.5); // shuffle options

  indexedOptions.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt.text;
    btn.onclick = () => selectOption(btn, opt.originalIndex, qData.correct, qData.explanation);
    optionsContainer.appendChild(btn);
  });
}

function selectOption(btnEl, originalIndex, correctIndex, explanation) {
  if (userHasAnswered) return;
  userHasAnswered = true;

  const optionsContainer = document.getElementById('quiz-options-container');
  const buttons = optionsContainer.getElementsByClassName('option-btn');
  const feedbackEl = document.getElementById('quiz-feedback');

  if (originalIndex === correctIndex) {
    btnEl.classList.add('correct');
    quizScore++;
    feedbackEl.textContent = `Correct! ${explanation}`;
    feedbackEl.className = 'feedback-container show correct-style';
    // Flash green
    flashScreen('rgba(57, 255, 20, 0.2)');
  } else {
    btnEl.classList.add('wrong');
    feedbackEl.textContent = `Incorrect. ${explanation}`;
    feedbackEl.className = 'feedback-container show wrong-style';
    
    // Highlight correct option too
    Array.from(buttons).forEach(btn => {
      // We need to re-match the button's option with correct index.
      // But we can just find which button holds the text of the correct index.
      const qData = selectedQuestions[quizIndex];
      if (btn.textContent === qData.options[correctIndex]) {
        btn.classList.add('correct');
      }
    });

    // Flash red
    flashScreen('rgba(255, 42, 95, 0.2)');
  }

  document.getElementById('quiz-score-text').textContent = `Score: ${quizScore}`;
  document.getElementById('quiz-next-btn').disabled = false;
}

function flashScreen(color) {
  const overlay = document.createElement('div');
  overlay.style.position = 'absolute';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = color;
  overlay.style.pointerEvents = 'none';
  overlay.style.zIndex = '99';
  overlay.style.transition = 'opacity 0.3s ease';
  document.getElementById('app-container').appendChild(overlay);
  setTimeout(() => {
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 300);
  }, 100);
}

function nextQuestion() {
  quizIndex++;
  if (quizIndex < 10) {
    showQuestion();
  } else {
    showScoreScreen();
  }
}

// ----------------------------------------------------
// SECTION 5: SCORE SCREEN & CELEBRATION
// ----------------------------------------------------
let celebrationAnimationId;
let celebrationParticles = [];

function showScoreScreen() {
  switchView('score-view');

  const circle = document.getElementById('score-circle-el');
  const rating = document.getElementById('score-rating-el');
  const feedback = document.getElementById('score-feedback-el');

  circle.textContent = `${quizScore}/10`;

  // Clear previous celebration loops
  if (celebrationAnimationId) cancelAnimationFrame(celebrationAnimationId);

  if (quizScore >= 8) {
    rating.textContent = "Excellent!";
    feedback.textContent = "You understand convection and density changes well.";
    startCelebration();
  } else if (quizScore >= 5) {
    rating.textContent = "Good effort.";
    feedback.textContent = "Review why density changes drive convection.";
    // Pulse glow animation styling (CSS class active)
    circle.style.borderColor = 'var(--neon-green)';
    circle.style.boxShadow = 'var(--shadow-green)';
  } else {
    rating.textContent = "Keep practising.";
    feedback.textContent = "Go back to the simulation and try all three heat source positions.";
    circle.style.borderColor = 'var(--neon-red)';
    circle.style.boxShadow = 'var(--shadow-red)';
  }
}

function startCelebration() {
  const canvas = document.getElementById('celebration-canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight;

  celebrationParticles = [];
  for (let i = 0; i < 80; i++) {
    celebrationParticles.push({
      x: canvas.width / 2,
      y: canvas.height / 2 - 50,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.8) * 8 - 2,
      size: Math.random() * 4 + 2,
      color: Math.random() > 0.5 ? '#ff2a5f' : '#00e5ff',
      alpha: 1
    });
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let activeParticles = 0;
    celebrationParticles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1; // gravity
      p.alpha -= 0.015;

      if (p.alpha > 0) {
        activeParticles++;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    ctx.globalAlpha = 1;
    if (activeParticles > 0) {
      celebrationAnimationId = requestAnimationFrame(loop);
    }
  }
  loop();
}

function restartQuiz() {
  switchView('quiz-view');
  startQuiz();
}

// ----------------------------------------------------
// INITIALIZATION ON LOAD
// ----------------------------------------------------
window.onload = () => {
  // Start with Simulation view directly
  switchView('sim-view');
  
  // Setup flashcards
  shuffleCards();

  // Setup initial quiz pool
  startQuiz();
};
