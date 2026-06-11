// ==========================================
// STATE VARIABLES & PHYSICS CONFIG
// ==========================================
const physics = {
  // Constant values
  Cd: 0.47, // Sphere drag coefficient
  objectDensity: 1000, // kg/m^3 (approximate water density for scaling volume)
  
  // User-adjusted values (initialized below)
  g: 9.8,
  h0: 2000,
  m: 10,
  fluidType: 'air',
  fluidDensity: 1.2,
  animationSpeed: 1,

  // Live simulation states
  t: 0,
  y: 0,
  v: 0,
  a: 0,
  impactSpeed: null,
  isFinished: false,
  isRunning: false,
  vtCalculated: 0,
  tTerm: 0,
  tMax: 0,

  // History for graphing
  history: []
};

// Canvas references and contexts
let animCanvas, animCtx;
let graphCanvas, graphCtx;
let animFrameId = null;

// Cloud particles for parallax background
const clouds = [];
const NUM_CLOUDS = 12;

// Quiz Correct Answers
const QUIZ_ANSWERS = {
  q1: 0,       // Acceleration equals g at t = 0s
  q2: 0,       // Velocity at start of fall is 0 m/s
  q3: 'increase',
  q4: 'decreasing',
  q5: 'decreasing'
};

// ==========================================
// DOM ELEMENT SELECTIONS
// ==========================================
const dom = {
  // Sliders
  gravitySlider: document.getElementById('gravity-slider'),
  gravityVal: document.getElementById('gravity-val'),
  heightSlider: document.getElementById('height-slider'),
  heightVal: document.getElementById('height-val'),
  massSlider: document.getElementById('mass-slider'),
  massVal: document.getElementById('mass-val'),
  densitySlider: document.getElementById('density-slider'),
  densityVal: document.getElementById('density-val'),
  densityTitle: document.getElementById('density-title'),
  speedSlider: document.getElementById('speed-slider'),
  speedVal: document.getElementById('speed-val'),
  fluidAir: document.getElementById('fluid-air'),
  fluidLiquid: document.getElementById('fluid-liquid'),

  // Controls
  btnStart: document.getElementById('btn-start'),
  btnReset: document.getElementById('btn-reset'),
  statusDot: document.getElementById('status-dot'),
  statusLabel: document.getElementById('status-label'),
  graphStatus: document.getElementById('graph-status'),
  altOverlay: document.getElementById('alt-overlay'),

  // Telemetry
  teleInitHeight: document.getElementById('tele-init-height'),
  teleInstSpeed: document.getElementById('tele-inst-speed'),
  teleImpactSpeed: document.getElementById('tele-impact-speed'),
  teleAccel: document.getElementById('tele-accel'),
  teleTerminalCalc: document.getElementById('tele-terminal-calc'),

  // Quiz
  q1Input: document.getElementById('q1-input'),
  q2Input: document.getElementById('q2-input'),
  q3Select: document.getElementById('q3-select'),
  q4Select: document.getElementById('q4-select'),
  q5Select: document.getElementById('q5-select'),
  btnCheckQuiz: document.getElementById('btn-check-quiz'),
  quizResult: document.getElementById('quiz-result')
};

// ==========================================
// INITIALIZATION
// ==========================================
function init() {
  animCanvas = document.getElementById('animation-canvas');
  animCtx = animCanvas.getContext('2d');
  graphCanvas = document.getElementById('graph-canvas');
  graphCtx = graphCanvas.getContext('2d');

  setupEventListeners();
  updateParamsFromUI();
  resetSimulation();
  setupClouds();

  // Handle window resizing
  window.addEventListener('resize', () => {
    resizeCanvases();
    render();
  });
  
  resizeCanvases();
  render();
}

// Setup background parallax particles (clouds/bubbles)
function setupClouds() {
  clouds.length = 0;
  for (let i = 0; i < NUM_CLOUDS; i++) {
    clouds.push({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 5 + Math.random() * 25,
      opacity: 0.1 + Math.random() * 0.3,
      speedScale: 0.3 + Math.random() * 0.7
    });
  }
}

function resizeCanvases() {
  const scaleCanvas = (canvas) => {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.resetTransform();
    ctx.scale(dpr, dpr);
  };
  
  scaleCanvas(animCanvas);
  scaleCanvas(graphCanvas);
}

// ==========================================
// PHYSICS COMPUTATIONS
// ==========================================
function getCrossSectionalArea(mass) {
  // V = mass / objectDensity
  const volume = mass / physics.objectDensity;
  // V = 4/3 * pi * r^3 => r = (3V / 4pi)^(1/3)
  const radius = Math.pow((3 * volume) / (4 * Math.PI), 1 / 3);
  // Area = pi * r^2
  return Math.PI * radius * radius;
}

function updateParamsFromUI() {
  physics.g = parseFloat(dom.gravitySlider.value);
  physics.h0 = parseInt(dom.heightSlider.value);
  physics.m = parseInt(dom.massSlider.value);
  physics.fluidType = dom.fluidAir.checked ? 'air' : 'liquid';
  physics.fluidDensity = parseFloat(dom.densitySlider.value);
  physics.animationSpeed = parseInt(dom.speedSlider.value);

  // Update text values
  dom.gravityVal.textContent = `${physics.g.toFixed(1)} m/s²`;
  dom.heightVal.textContent = `${physics.h0} m`;
  dom.massVal.textContent = `${physics.m} kg`;
  dom.densityVal.textContent = `${physics.fluidDensity.toFixed(1)} kg/m³`;
  dom.speedVal.textContent = `${physics.animationSpeed}x`;

  // Calculate area and terminal velocity
  const A = getCrossSectionalArea(physics.m);
  // vt = sqrt( (2 * m * g) / (Cd * rho * A) )
  physics.vtCalculated = Math.sqrt((2 * physics.m * physics.g) / (physics.Cd * physics.fluidDensity * A));
  
  // Time scale calculation:
  // v(t) reaches 99% of vt when t_term = 2.65 * vt / g
  physics.tTerm = 2.65 * (physics.vtCalculated / physics.g);
  physics.tMax = 2 * physics.tTerm;

  // Update telemetry display
  dom.teleInitHeight.textContent = `${physics.h0} m`;
  dom.teleTerminalCalc.textContent = `${physics.vtCalculated.toFixed(1)} m/s`;
  
  if (!physics.isRunning) {
    physics.y = physics.h0;
    dom.altOverlay.textContent = `Height: ${physics.y.toFixed(0)}m`;
  }
}

// ==========================================
// EVENT LISTENERS
// ==========================================
function setupEventListeners() {
  // Sliders
  const inputs = [dom.gravitySlider, dom.heightSlider, dom.massSlider, dom.densitySlider, dom.speedSlider];
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      updateParamsFromUI();
      if (!physics.isRunning) {
        resetSimulation();
      }
    });
  });

  // Medium radio toggle
  const toggleFluid = (type) => {
    if (type === 'air') {
      dom.densityTitle.textContent = 'Air Density (ρ)';
      dom.densitySlider.min = '0.5';
      dom.densitySlider.max = '2.0';
      dom.densitySlider.step = '0.1';
      dom.densitySlider.value = '1.2';
    } else {
      dom.densityTitle.textContent = 'Liquid Density (ρ)';
      dom.densitySlider.min = '500';
      dom.densitySlider.max = '1200';
      dom.densitySlider.step = '10';
      dom.densitySlider.value = '1000';
    }
    updateParamsFromUI();
    resetSimulation();
  };

  dom.fluidAir.addEventListener('change', () => toggleFluid('air'));
  dom.fluidLiquid.addEventListener('change', () => toggleFluid('liquid'));

  // Buttons
  dom.btnStart.addEventListener('click', toggleSimulation);
  dom.btnReset.addEventListener('click', resetSimulation);

  // Quiz Submit
  dom.btnCheckQuiz.addEventListener('click', checkQuiz);
}

// ==========================================
// SIMULATION FLOW
// ==========================================
function toggleSimulation() {
  if (physics.isFinished) {
    resetSimulation();
  }

  if (physics.isRunning) {
    physics.isRunning = false;
    dom.btnStart.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> RUN`;
    dom.statusDot.className = 'status-dot orange';
    dom.statusLabel.textContent = 'PAUSED';
  } else {
    physics.isRunning = true;
    dom.btnStart.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg> PAUSE`;
    dom.statusDot.className = 'status-dot green';
    dom.statusLabel.textContent = 'FALLING';
    tick();
  }
}

function resetSimulation() {
  physics.isRunning = false;
  physics.isFinished = false;
  physics.t = 0;
  physics.y = physics.h0;
  physics.v = 0;
  physics.a = physics.g;
  physics.impactSpeed = null;
  physics.history = [];
  
  if (animFrameId) {
    cancelAnimationFrame(animFrameId);
    animFrameId = null;
  }

  dom.btnStart.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> RUN`;
  dom.statusDot.className = 'status-dot green';
  dom.statusLabel.textContent = 'READY';
  dom.graphStatus.textContent = 'Sketching...';
  dom.teleImpactSpeed.textContent = '--';
  dom.teleInstSpeed.textContent = '0.0 m/s';
  dom.teleAccel.textContent = `${physics.g.toFixed(1)} m/s²`;
  dom.altOverlay.textContent = `Height: ${physics.y.toFixed(0)}m`;

  render();
}

function tick() {
  if (!physics.isRunning) return;

  // Run multiple physics iterations per animation frame to support animation speed slider (1x - 10x)
  const dt = 0.005; // fixed time step for physics update (5ms)
  const iterations = physics.animationSpeed * 3; // scale simulation speed

  for (let i = 0; i < iterations; i++) {
    if (physics.y <= 0) {
      physics.y = 0;
      physics.v = 0;
      physics.a = 0;
      physics.isRunning = false;
      physics.isFinished = true;
      physics.impactSpeed = physics.history.length > 0 ? physics.history[physics.history.length - 1].v : 0;
      break;
    }

    // Weight force: W = m * g
    const W = physics.m * physics.g;
    
    // Drag force: Fd = 0.5 * Cd * rho * A * v^2
    const A = getCrossSectionalArea(physics.m);
    const Fd = 0.5 * physics.Cd * physics.fluidDensity * A * physics.v * physics.v;
    
    // Net Force: Fnet = W - Fd
    const Fnet = W - Fd;
    physics.a = Fnet / physics.m;
    
    // Euler Integration
    physics.v += physics.a * dt;
    physics.y -= physics.v * dt;
    physics.t += dt;

    // Record graph data until the terminal velocity occupies half of the graph axis (tMax)
    if (physics.t <= physics.tMax) {
      physics.history.push({ t: physics.t, v: physics.v });
    }
  }

  // Update outputs
  dom.teleInstSpeed.textContent = `${physics.v.toFixed(1)} m/s`;
  dom.teleAccel.textContent = `${physics.a.toFixed(2)} m/s²`;
  dom.altOverlay.textContent = `Height: ${physics.y.toFixed(0)}m`;

  if (physics.isFinished) {
    dom.btnStart.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> RUN`;
    dom.statusDot.className = 'status-dot red';
    dom.statusLabel.textContent = 'IMPACTED';
    dom.graphStatus.textContent = 'Finished';
    dom.teleImpactSpeed.textContent = `${physics.impactSpeed.toFixed(1)} m/s`;
  }

  if (physics.t > physics.tMax) {
    dom.graphStatus.textContent = 'Plot Suspended (Terminal Velocity Region)';
    // Check if terminal velocity indicator should update status
    if (Math.abs(physics.a) < 0.1 && physics.isRunning) {
      dom.statusDot.className = 'status-dot green';
      dom.statusLabel.textContent = 'TERMINAL VELOCITY';
    }
  }

  render();

  if (physics.isRunning) {
    animFrameId = requestAnimationFrame(tick);
  }
}

// ==========================================
// RENDER ROUTINES
// ==========================================
function render() {
  drawAnimationCanvas();
  drawGraphCanvas();
}

function drawAnimationCanvas() {
  const w = animCanvas.width / (window.devicePixelRatio || 1);
  const h = animCanvas.height / (window.devicePixelRatio || 1);
  animCtx.clearRect(0, 0, w, h);

  // 1. Draw Medium Background
  if (physics.fluidType === 'liquid') {
    // Liquid has a dark teal hue
    const grad = animCtx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#04222b');
    grad.addColorStop(1, '#021217');
    animCtx.fillStyle = grad;
  } else {
    // Air has dark sky/atmosphere gradient
    const grad = animCtx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#090d16');
    grad.addColorStop(1, '#0e172a');
    animCtx.fillStyle = grad;
  }
  animCtx.fillRect(0, 0, w, h);

  // 2. Draw Parallax clouds/bubbles
  animCtx.fillStyle = physics.fluidType === 'liquid' ? 'rgba(0, 242, 254, 0.4)' : 'rgba(255, 255, 255, 0.9)';
  clouds.forEach(cloud => {
    // Move clouds upwards proportional to instantaneous velocity v
    if (physics.isRunning) {
      cloud.y -= (physics.v * 0.05 * cloud.speedScale * physics.animationSpeed);
      if (cloud.y < -30) {
        cloud.y = h + 20;
        cloud.x = Math.random() * w;
      }
    }
    
    // Draw bubble or soft cloud shape
    animCtx.beginPath();
    animCtx.globalAlpha = cloud.opacity;
    if (physics.fluidType === 'liquid') {
      // Bubbles
      animCtx.arc(cloud.x * (w / 100), cloud.y, cloud.size * 0.2, 0, Math.PI * 2);
      animCtx.strokeStyle = '#00f2fe';
      animCtx.lineWidth = 1;
      animCtx.stroke();
    } else {
      // Clouds
      animCtx.arc(cloud.x * (w / 100), cloud.y, cloud.size * 0.8, 0, Math.PI * 2);
      animCtx.fill();
    }
    animCtx.globalAlpha = 1.0;
  });

  // 3. Draw Height Overview Gauge (Left side of left canvas)
  const gaugeX = 25;
  const gaugeYStart = 40;
  const gaugeHeight = h - 80;
  
  // Track
  animCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  animCtx.lineWidth = 4;
  animCtx.lineCap = 'round';
  animCtx.beginPath();
  animCtx.moveTo(gaugeX, gaugeYStart);
  animCtx.lineTo(gaugeX, gaugeYStart + gaugeHeight);
  animCtx.stroke();

  // Progress filling
  const progressRatio = physics.y / physics.h0;
  const currentGaugeY = gaugeYStart + gaugeHeight * (1 - progressRatio);
  animCtx.strokeStyle = 'var(--accent-cyan)';
  animCtx.lineWidth = 4;
  animCtx.beginPath();
  animCtx.moveTo(gaugeX, gaugeYStart + gaugeHeight);
  animCtx.lineTo(gaugeX, currentGaugeY);
  animCtx.stroke();

  // Gauge Indicator Bulb
  animCtx.fillStyle = 'var(--accent-cyan)';
  animCtx.beginPath();
  animCtx.arc(gaugeX, currentGaugeY, 6, 0, Math.PI * 2);
  animCtx.fill();
  
  // Text labels on gauge
  animCtx.fillStyle = 'var(--text-muted)';
  animCtx.font = '8px var(--font-display)';
  animCtx.fillText(`${physics.h0}m`, gaugeX + 10, gaugeYStart + 3);
  animCtx.fillText('0m', gaugeX + 10, gaugeYStart + gaugeHeight + 3);

  // 4. Draw Falling Capsule / Sphere in the center
  const centerX = w / 2 + 10;
  const centerY = gaugeYStart + gaugeHeight * (1 - progressRatio); // Fall dynamically along scaled height
  
  // Calculate visual radius from mass
  const baseRadius = 15;
  const areaRatio = getCrossSectionalArea(physics.m) / getCrossSectionalArea(10);
  const radius = baseRadius * Math.sqrt(areaRatio);

  // Draw the falling capsule body
  animCtx.shadowBlur = 15;
  animCtx.shadowColor = 'rgba(249, 115, 22, 0.5)'; // Orange glow
  animCtx.fillStyle = '#f97316'; // Orange object color
  animCtx.strokeStyle = '#ffedd5';
  animCtx.lineWidth = 3;
  animCtx.beginPath();
  animCtx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  animCtx.fill();
  animCtx.stroke();
  animCtx.shadowBlur = 0; // reset shadow

  // Technical cockpit detail
  animCtx.fillStyle = '#0f172a';
  animCtx.beginPath();
  animCtx.arc(centerX, centerY - radius*0.3, radius*0.4, 0, Math.PI, true);
  animCtx.fill();

  // 5. Draw Force Vector Arrows (Physics Visual)
  const forceScale = 0.5; // pixels per Newton force scale factor
  const W = physics.m * physics.g;
  const A = getCrossSectionalArea(physics.m);
  const Fd = 0.5 * physics.Cd * physics.fluidDensity * A * physics.v * physics.v;

  const wArrowLength = Math.max(10, Math.min(100, W * forceScale));
  const dArrowLength = Math.max(0, Math.min(100, Fd * forceScale));

  // Helper function to draw arrow
  const drawArrow = (x, y, length, angle, color, label) => {
    if (length <= 0) return;
    animCtx.save();
    animCtx.translate(x, y);
    animCtx.rotate(angle);
    animCtx.strokeStyle = color;
    animCtx.fillStyle = color;
    animCtx.lineWidth = 3;
    
    // Draw stem
    animCtx.beginPath();
    animCtx.moveTo(0, 0);
    animCtx.lineTo(0, length);
    animCtx.stroke();

    // Draw head
    animCtx.beginPath();
    animCtx.moveTo(-6, length - 8);
    animCtx.lineTo(0, length);
    animCtx.lineTo(6, length - 8);
    animCtx.fill();

    // Draw Label text
    animCtx.restore();
    animCtx.fillStyle = '#facc15'; // Written in yellow
    animCtx.font = 'bold 10px var(--font-display)';
    const textOffset = angle === 0 ? length + 14 : -length - 6;
    animCtx.fillText(label, x + radius + 8, y + (angle === 0 ? textOffset : textOffset));
  };

  // Downward: Weight (Pink)
  drawArrow(centerX, centerY, wArrowLength, 0, 'var(--accent-pink)', `W = ${W.toFixed(0)} N`);

  // Upward: Air resistance (Cyan/Teal)
  if (physics.v > 0.1) {
    drawArrow(centerX, centerY, dArrowLength, Math.PI, 'var(--accent-cyan)', `Fd = ${Fd.toFixed(0)} N`);
  }
}

function drawGraphCanvas() {
  const w = graphCanvas.width / (window.devicePixelRatio || 1);
  const h = graphCanvas.height / (window.devicePixelRatio || 1);
  graphCtx.clearRect(0, 0, w, h);

  // Background
  graphCtx.fillStyle = '#090d16';
  graphCtx.fillRect(0, 0, w, h);

  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 30;
  const paddingBottom = 40;

  const graphWidth = w - paddingLeft - paddingRight;
  const graphHeight = h - paddingTop - paddingBottom;

  // Axis lines
  graphCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  graphCtx.lineWidth = 1.5;
  
  // Y-axis
  graphCtx.beginPath();
  graphCtx.moveTo(paddingLeft, paddingTop);
  graphCtx.lineTo(paddingLeft, paddingTop + graphHeight);
  graphCtx.stroke();

  // X-axis
  graphCtx.beginPath();
  graphCtx.moveTo(paddingLeft, paddingTop + graphHeight);
  graphCtx.lineTo(paddingLeft + graphWidth, paddingTop + graphHeight);
  graphCtx.stroke();

  // Grid Lines
  graphCtx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  graphCtx.lineWidth = 1;
  const numGridLines = 5;
  
  // Y Grid
  for (let i = 0; i <= numGridLines; i++) {
    const gridY = paddingTop + (graphHeight / numGridLines) * i;
    graphCtx.beginPath();
    graphCtx.moveTo(paddingLeft, gridY);
    graphCtx.lineTo(paddingLeft + graphWidth, gridY);
    graphCtx.stroke();
  }

  // X Grid
  for (let i = 0; i <= numGridLines; i++) {
    const gridX = paddingLeft + (graphWidth / numGridLines) * i;
    graphCtx.beginPath();
    graphCtx.moveTo(gridX, paddingTop);
    graphCtx.lineTo(gridX, paddingTop + graphHeight);
    graphCtx.stroke();
  }

  // Determine Max Scales
  // Velocity max scale should clear vtCalculated
  const vMax = Math.max(5, physics.vtCalculated * 1.2);
  const tMax = physics.tMax; // Terminal velocity should occupy exactly 50% (tTerm is half of tMax)

  // Draw plot curve
  if (physics.history.length > 0) {
    graphCtx.strokeStyle = '#facc15'; // Yellow curve
    graphCtx.lineWidth = 3;
    graphCtx.beginPath();

    physics.history.forEach((point, index) => {
      // Map points to graph dimensions
      const ptX = paddingLeft + (point.t / tMax) * graphWidth;
      const ptY = paddingTop + graphHeight - (point.v / vMax) * graphHeight;

      // Don't draw past graph boundary
      if (ptX <= paddingLeft + graphWidth) {
        if (index === 0) {
          graphCtx.moveTo(ptX, ptY);
        } else {
          graphCtx.lineTo(ptX, ptY);
        }
      }
    });
    graphCtx.stroke();
  }

  // Draw Terminal Velocity dashed horizontal line
  const vtY = paddingTop + graphHeight - (physics.vtCalculated / vMax) * graphHeight;
  graphCtx.strokeStyle = 'var(--accent-pink)';
  graphCtx.setLineDash([4, 4]);
  graphCtx.lineWidth = 1.5;
  graphCtx.beginPath();
  graphCtx.moveTo(paddingLeft, vtY);
  graphCtx.lineTo(paddingLeft + graphWidth, vtY);
  graphCtx.stroke();
  graphCtx.setLineDash([]); // Reset line dash

  // Labels & Typography
  graphCtx.fillStyle = 'var(--text-muted)';
  graphCtx.font = '9px var(--font-display)';
  
  // Y-axis labels
  graphCtx.fillText(vMax.toFixed(0), paddingLeft - 24, paddingTop + 4);
  graphCtx.fillText((vMax / 2).toFixed(0), paddingLeft - 24, paddingTop + (graphHeight / 2) + 4);
  graphCtx.fillText('0', paddingLeft - 15, paddingTop + graphHeight + 4);

  // X-axis labels
  graphCtx.fillText('0s', paddingLeft - 5, paddingTop + graphHeight + 16);
  graphCtx.fillText((tMax / 2).toFixed(1) + 's (vt)', paddingLeft + (graphWidth / 2) - 20, paddingTop + graphHeight + 16);
  graphCtx.fillText(tMax.toFixed(1) + 's', paddingLeft + graphWidth - 15, paddingTop + graphHeight + 16);

  // Titles at the ends of the axes
  graphCtx.fillStyle = '#facc15'; // Colored yellow
  graphCtx.font = 'bold 24px var(--font-display)';
  graphCtx.textAlign = 'center';
  
  // Y-axis label: v at the top
  graphCtx.fillText('v', paddingLeft - 15, paddingTop - 10);
  
  // X-axis label: t at the right end
  graphCtx.fillText('t', paddingLeft + graphWidth + 12, paddingTop + graphHeight + 4);

  // Terminal velocity label next to dashed line
  graphCtx.fillStyle = 'var(--accent-pink)';
  graphCtx.font = 'bold 24px var(--font-display)';
  graphCtx.textAlign = 'left';
  graphCtx.fillText(`vt = ${physics.vtCalculated.toFixed(1)} m/s`, paddingLeft + 10, vtY - 6);
}

// ==========================================
// INTERACTIVE PHYSICS QUIZ CHECKER
// ==========================================
function checkQuiz() {
  let score = 0;
  const total = 5;

  // Helper to mark feedback UI
  const setFeedback = (elementId, isCorrect) => {
    const row = document.getElementById(elementId).closest('.quiz-row');
    if (isCorrect) {
      row.className = 'quiz-row correct';
    } else {
      row.className = 'quiz-row incorrect';
    }
  };

  // Q1 check: "acceleration is equal to the acceleration due to gravity" -> at t = 0s
  const q1Val = parseFloat(dom.q1Input.value);
  if (!isNaN(q1Val) && q1Val === QUIZ_ANSWERS.q1) {
    score++;
    setFeedback('q1-input', true);
  } else {
    setFeedback('q1-input', false);
  }

  // Q2 check: "velocity at start of fall" -> 0 m/s
  const q2Val = parseFloat(dom.q2Input.value);
  if (!isNaN(q2Val) && q2Val === QUIZ_ANSWERS.q2) {
    score++;
    setFeedback('q2-input', true);
  } else {
    setFeedback('q2-input', false);
  }

  // Q3 check: velocity of the object (increase)
  const q3Val = dom.q3Select.value;
  if (q3Val === QUIZ_ANSWERS.q3) {
    score++;
    setFeedback('q3-select', true);
  } else {
    setFeedback('q3-select', false);
  }

  // Q4 check: gradient of v-t graph is (decreasing)
  const q4Val = dom.q4Select.value;
  if (q4Val === QUIZ_ANSWERS.q4) {
    score++;
    setFeedback('q4-select', true);
  } else {
    setFeedback('q4-select', false);
  }

  // Q5 check: acceleration of falling object is (decreasing)
  const q5Val = dom.q5Select.value;
  if (q5Val === QUIZ_ANSWERS.q5) {
    score++;
    setFeedback('q5-select', true);
  } else {
    setFeedback('q5-select', false);
  }

  // Update feedback UI message
  if (score === total) {
    dom.quizResult.textContent = `A PERFECT SCORE! 🎉 ${score}/${total} Correct. You master Terminal Velocity!`;
    dom.quizResult.style.color = 'var(--success)';
  } else {
    dom.quizResult.textContent = `Keep going! Score: ${score}/${total}. Review your incorrect answers and try again.`;
    dom.quizResult.style.color = '#ff9f00';
  }
}

// Start the simulation application on load
window.addEventListener('DOMContentLoaded', init);
