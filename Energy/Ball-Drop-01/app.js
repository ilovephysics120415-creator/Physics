// --- DOM Elements ---
const gInput = document.getElementById('g-input');
const h0Input = document.getElementById('h0-input');
const mInput = document.getElementById('m-input');
const v0Input = document.getElementById('v0-input');

const gVal = document.getElementById('g-val');
const h0Val = document.getElementById('h0-val');
const mVal = document.getElementById('m-val');
const v0Val = document.getElementById('v0-val');

const btnStart = document.getElementById('btn-start');
const btnCapture = document.getElementById('btn-capture');
const btnTest = document.getElementById('btn-test');
const btnReset = document.getElementById('btn-reset');

const animCanvas = document.getElementById('animation-canvas');
const graphCanvas = document.getElementById('graph-canvas');

const liveH = document.getElementById('live-h');
const liveV = document.getElementById('live-v');
const liveH0 = document.getElementById('live-h0');
const liveVFinal = document.getElementById('live-vfinal');
const capturedListContainer = document.getElementById('captured-list-container');

const modalOverlay = document.getElementById('modal-overlay');
const btnCloseModal = document.getElementById('btn-close-modal');
const solutionContent = document.getElementById('solution-content');

// --- Physics State ---
let simRunning = false;
let startTime = null;
let elapsedTime = 0; // in seconds
let ballY = 0; // current position from top (m)
let currentH = 100; // current height (m)
let currentV = 0; // current velocity (m/s)
let isImpacted = false;

// Parameters (synchronized with sliders)
let g = 9.8;
let h0 = 100;
let m = 2;
let v0 = 0;

// Impact characteristics
let tImpact = 0;
let vImpact = 0;

// Captures
let captures = [];

// --- Test Mode State ---
let testModeActive = false;
let hiddenVars = {
  // Group 1: 'h' or 'v' (captured/current variables)
  g1: null,
  // Group 2: 'g', 'h0', or 'v0' (initial configuration variables)
  g2: null
};

// --- Color Configuration for Canvas (Hex Values) ---
const colorGPE = '#FF2E93';
const colorKE = '#00F2FE';
const colorTotal = '#39FF14';

// --- Canvas Contexts ---
const ctxAnim = animCanvas.getContext('2d');
const ctxGraph = graphCanvas.getContext('2d');

// Canvas dimensions logic
function resizeCanvases() {
  const rectAnim = animCanvas.getBoundingClientRect();
  animCanvas.width = rectAnim.width * window.devicePixelRatio;
  animCanvas.height = 380 * window.devicePixelRatio;
  ctxAnim.scale(window.devicePixelRatio, window.devicePixelRatio);

  const rectGraph = graphCanvas.getBoundingClientRect();
  graphCanvas.width = rectGraph.width * window.devicePixelRatio;
  graphCanvas.height = 380 * window.devicePixelRatio;
  ctxGraph.scale(window.devicePixelRatio, window.devicePixelRatio);

  drawAnimation();
  drawGraph();
}

// --- Physics Equations ---
function updatePhysicsConstants() {
  g = parseFloat(gInput.value);
  h0 = parseFloat(h0Input.value);
  m = parseFloat(mInput.value);
  v0 = parseFloat(v0Input.value);

  // Solve quadratic: 1/2 * g * t^2 + v0 * t - h0 = 0
  // t = (-v0 + sqrt(v0^2 - 4 * (0.5 * g) * (-h0))) / (2 * 0.5 * g)
  // t = (-v0 + sqrt(v0^2 + 2 * g * h0)) / g
  tImpact = (-v0 + Math.sqrt(v0 * v0 + 2 * g * h0)) / g;
  vImpact = v0 + g * tImpact;
}

// Get state at any time t
function getPhysicsState(t) {
  if (t >= tImpact) {
    return {
      h: 0,
      v: vImpact,
      gpe: 0,
      ke: 0.5 * m * vImpact * vImpact,
      total: 0.5 * m * vImpact * vImpact,
      impacted: true
    };
  }
  const y = v0 * t + 0.5 * g * t * t;
  const h = h0 - y;
  const v = v0 + g * t;
  const gpe = m * g * h;
  const ke = 0.5 * m * v * v;
  return {
    h: h,
    v: v,
    gpe: gpe,
    ke: ke,
    total: gpe + ke,
    impacted: false
  };
}

// --- Live Data Displays & Test Mode Overrides ---

function renderDisplays() {
  gVal.textContent = g.toFixed(1);
  h0Val.textContent = h0.toFixed(0);
  mVal.textContent = m.toFixed(0);
  v0Val.textContent = v0.toFixed(1);

  liveH0.textContent = h0.toFixed(2);
  liveVFinal.textContent = vImpact.toFixed(2);

  // Apply hidden states for labels if test mode is active
  if (testModeActive) {
    // Check Group 2: g, h0, v0
    overrideDisplayWithEyeIcon('g-display-wrapper', g.toFixed(1) + ' N/kg', 'g', hiddenVars.g2 === 'g');
    overrideDisplayWithEyeIcon('h0-display-wrapper', h0.toFixed(0) + ' m', 'h0', hiddenVars.g2 === 'h0');
    overrideDisplayWithEyeIcon('v0-display-wrapper', v0.toFixed(1) + ' m/s', 'v0', hiddenVars.g2 === 'v0');

    // Live display also affected if height/velocity final is selected
    overrideDisplayWithEyeIcon('live-h0-wrapper', h0.toFixed(2) + ' m', 'h0', hiddenVars.g2 === 'h0');
  } else {
    // Restore normal styles
    document.getElementById('g-display-wrapper').innerHTML = `<span id="g-val">${g.toFixed(1)}</span> N/kg`;
    document.getElementById('h0-display-wrapper').innerHTML = `<span id="h0-val">${h0.toFixed(0)}</span> m`;
    document.getElementById('v0-display-wrapper').innerHTML = `<span id="v0-val">${v0.toFixed(1)}</span> m/s`;
    document.getElementById('live-h0-wrapper').innerHTML = `<span id="live-h0">${h0.toFixed(2)}</span> m`;
  }

  // Update current live display values
  updateLiveStateDisplays();
}

function updateLiveStateDisplays() {
  if (testModeActive && hiddenVars.g1 === 'h') {
    overrideDisplayWithEyeIcon('live-h-wrapper', currentH.toFixed(2) + ' m', 'h', true);
  } else {
    document.getElementById('live-h-wrapper').innerHTML = `<span id="live-h">${currentH.toFixed(2)}</span> m`;
  }

  if (testModeActive && hiddenVars.g1 === 'v') {
    overrideDisplayWithEyeIcon('live-v-wrapper', currentV.toFixed(2) + ' m/s', 'v', true);
  } else {
    document.getElementById('live-v-wrapper').innerHTML = `<span id="live-v">${currentV.toFixed(2)}</span> m/s`;
  }
}

function overrideDisplayWithEyeIcon(elementId, trueValue, variableKey, shouldHide) {
  const container = document.getElementById(elementId);
  if (shouldHide) {
    container.innerHTML = `
      <span class="hidden-value-container">
        <span class="hidden-text">?</span>
        <button class="reveal-btn" onclick="showSolution('${variableKey}')" title="Reveal Working Solution">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
      </span>
    `;
  } else {
    // Normal format depending on the identifier
    if (elementId.includes('display-wrapper')) {
      if (variableKey === 'g') container.innerHTML = `<span id="g-val">${g.toFixed(1)}</span> N/kg`;
      if (variableKey === 'h0') container.innerHTML = `<span id="h0-val">${h0.toFixed(0)}</span> m`;
      if (variableKey === 'v0') container.innerHTML = `<span id="v0-val">${v0.toFixed(1)}</span> m/s`;
    } else {
      if (variableKey === 'h0') container.innerHTML = `<span id="live-h0">${h0.toFixed(2)}</span> m`;
    }
  }
}

// --- Renders / Canvases Drawing ---

function drawAnimation() {
  const w = animCanvas.width / window.devicePixelRatio;
  const h = animCanvas.height / window.devicePixelRatio;

  ctxAnim.clearRect(0, 0, w, h);

  // Background grid
  ctxAnim.strokeStyle = 'rgba(255,255,255,0.03)';
  ctxAnim.lineWidth = 1;
  for (let x = 0; x < w; x += 20) {
    ctxAnim.beginPath();
    ctxAnim.moveTo(x, 0);
    ctxAnim.lineTo(x, h);
    ctxAnim.stroke();
  }
  for (let y = 0; y < h; y += 20) {
    ctxAnim.beginPath();
    ctxAnim.moveTo(0, y);
    ctxAnim.lineTo(w, y);
    ctxAnim.stroke();
  }

  // Draw Ruler Scale on left
  const rulerX = 50;
  const topY = 40;
  const bottomY = h - 40;
  const usableHeight = bottomY - topY;

  ctxAnim.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctxAnim.lineWidth = 2;
  ctxAnim.beginPath();
  ctxAnim.moveTo(rulerX, topY);
  ctxAnim.lineTo(rulerX, bottomY);
  ctxAnim.stroke();

  // Tick marks
  const tickCount = 10;
  ctxAnim.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctxAnim.font = '10px "Fira Code"';
  ctxAnim.textAlign = 'right';
  ctxAnim.textBaseline = 'middle';

  for (let i = 0; i <= tickCount; i++) {
    const tickVal = (h0 * (i / tickCount)).toFixed(0);
    const tickY = bottomY - (i / tickCount) * usableHeight;
    ctxAnim.beginPath();
    ctxAnim.moveTo(rulerX - 6, tickY);
    ctxAnim.lineTo(rulerX, tickY);
    ctxAnim.stroke();
    ctxAnim.fillText(tickVal + 'm', rulerX - 10, tickY);
  }

  // Ground level line
  ctxAnim.strokeStyle = '#374151';
  ctxAnim.lineWidth = 4;
  ctxAnim.beginPath();
  ctxAnim.moveTo(10, bottomY);
  ctxAnim.lineTo(w - 10, bottomY);
  ctxAnim.stroke();

  // Draw Captured markers
  captures.forEach((cap, index) => {
    const capFraction = cap.h / h0;
    const capY = bottomY - capFraction * usableHeight;

    // Line across
    ctxAnim.strokeStyle = 'rgba(0, 242, 254, 0.25)';
    ctxAnim.lineWidth = 1;
    ctxAnim.setLineDash([4, 4]);
    ctxAnim.beginPath();
    ctxAnim.moveTo(rulerX, capY);
    ctxAnim.lineTo(w - 20, capY);
    ctxAnim.stroke();
    ctxAnim.setLineDash([]);

    // Captured Flag text
    ctxAnim.fillStyle = colorKE;
    ctxAnim.font = 'bold 11px "Outfit"';
    ctxAnim.textAlign = 'left';
    
    // Hide captured values in test mode if matched
    let displayH = cap.h.toFixed(1) + ' m';
    let displayV = cap.v.toFixed(1) + ' m/s';
    
    if (testModeActive && hiddenVars.g1 === 'h') {
      displayH = '?';
    }
    if (testModeActive && hiddenVars.g1 === 'v') {
      displayV = '?';
    }

    ctxAnim.fillText(`Cap ${index + 1}: h=${displayH}, v=${displayV}`, rulerX + 15, capY - 6);
  });

  // Calculate ball position
  const ballFraction = currentH / h0;
  const ballYPos = bottomY - ballFraction * usableHeight;
  const ballXPos = w / 2 + 30;

  // Draw Energy Bar visual overlay (beside the ball)
  const barWidth = 14;
  const maxBarH = 60;
  const totalE = m * g * h0 + 0.5 * m * v0 * v0;
  const state = getPhysicsState(elapsedTime);

  const keFraction = state.ke / totalE;
  const gpeFraction = state.gpe / totalE;

  const barX = ballXPos - 50;
  const barY = ballYPos - maxBarH / 2;

  // GPE Bar (Pink)
  ctxAnim.fillStyle = colorGPE;
  ctxAnim.fillRect(barX, barY + (1 - gpeFraction) * maxBarH, barWidth, gpeFraction * maxBarH);

  // KE Bar (Cyan)
  ctxAnim.fillStyle = colorKE;
  ctxAnim.fillRect(barX + barWidth + 4, barY + (1 - keFraction) * maxBarH, barWidth, keFraction * maxBarH);

  // Ball glow
  const grad = ctxAnim.createRadialGradient(ballXPos, ballYPos, 2, ballXPos, ballYPos, 22);
  grad.addColorStop(0, '#FFFFFF');
  grad.addColorStop(0.3, 'rgba(139, 92, 246, 0.8)');
  grad.addColorStop(1, 'rgba(139, 92, 246, 0)');
  ctxAnim.fillStyle = grad;
  ctxAnim.beginPath();
  ctxAnim.arc(ballXPos, ballYPos, 22, 0, Math.PI * 2);
  ctxAnim.fill();

  // Core ball
  ctxAnim.fillStyle = '#C084FC';
  ctxAnim.strokeStyle = '#FFFFFF';
  ctxAnim.lineWidth = 2;
  ctxAnim.beginPath();
  ctxAnim.arc(ballXPos, ballYPos, 12, 0, Math.PI * 2);
  ctxAnim.fill();
  ctxAnim.stroke();
}

function drawGraph() {
  const w = graphCanvas.width / window.devicePixelRatio;
  const h = graphCanvas.height / window.devicePixelRatio;

  ctxGraph.clearRect(0, 0, w, h);

  const paddingLeft = 55;
  const paddingRight = 20;
  const paddingTop = 30;
  const paddingBottom = 40;

  const graphW = w - paddingLeft - paddingRight;
  const graphH = h - paddingTop - paddingBottom;

  // Drawing axes
  ctxGraph.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctxGraph.lineWidth = 1.5;
  ctxGraph.beginPath();
  ctxGraph.moveTo(paddingLeft, paddingTop);
  ctxGraph.lineTo(paddingLeft, h - paddingBottom);
  ctxGraph.lineTo(w - paddingRight, h - paddingBottom);
  ctxGraph.stroke();

  // Grid lines
  ctxGraph.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctxGraph.lineWidth = 1;
  const gridLines = 5;
  for (let i = 1; i <= gridLines; i++) {
    // Horizontals
    const yLine = h - paddingBottom - (i / gridLines) * graphH;
    ctxGraph.beginPath();
    ctxGraph.moveTo(paddingLeft, yLine);
    ctxGraph.lineTo(w - paddingRight, yLine);
    ctxGraph.stroke();

    // Verticals
    const xLine = paddingLeft + (i / gridLines) * graphW;
    ctxGraph.beginPath();
    ctxGraph.moveTo(xLine, paddingTop);
    ctxGraph.lineTo(xLine, h - paddingBottom);
    ctxGraph.stroke();
  }

  // Label axes
  ctxGraph.fillStyle = 'var(--text-secondary)';
  ctxGraph.font = '11px "Outfit"';
  ctxGraph.textAlign = 'center';
  ctxGraph.fillText('Time (s)', paddingLeft + graphW / 2, h - 10);

  ctxGraph.save();
  ctxGraph.translate(15, paddingTop + graphH / 2);
  ctxGraph.rotate(-Math.PI / 2);
  ctxGraph.fillText('Energy (J)', 0, 0);
  ctxGraph.restore();

  // Scale Y max (Total Energy)
  const totalE = m * g * h0 + 0.5 * m * v0 * v0;
  const maxYVal = totalE * 1.1; // 10% headroom

  ctxGraph.fillStyle = 'rgba(255,255,255,0.6)';
  ctxGraph.font = '10px "Fira Code"';
  ctxGraph.textAlign = 'right';
  ctxGraph.textBaseline = 'middle';
  ctxGraph.fillText(maxYVal.toFixed(0) + ' J', paddingLeft - 8, paddingTop);
  ctxGraph.fillText((maxYVal / 2).toFixed(0) + ' J', paddingLeft - 8, paddingTop + graphH / 2);
  ctxGraph.fillText('0 J', paddingLeft - 8, h - paddingBottom);

  // Time scale limits: adjusts based on impact time
  const maxTime = tImpact * 1.05; // 5% headroom
  ctxGraph.textAlign = 'center';
  ctxGraph.fillText(maxTime.toFixed(2) + 's', paddingLeft + graphW, h - paddingBottom + 15);
  ctxGraph.fillText((maxTime / 2).toFixed(2) + 's', paddingLeft + graphW / 2, h - paddingBottom + 15);

  // Plot trajectories
  const points = 100;
  const currentTimeLimit = Math.min(elapsedTime, tImpact);

  const getCanvasCoords = (timeVal, energyVal) => {
    const x = paddingLeft + (timeVal / maxTime) * graphW;
    const y = h - paddingBottom - (energyVal / maxYVal) * graphH;
    return { x, y };
  };

  // Helper to draw single line
  const drawEnergyLine = (evaluator, color, glowColor) => {
    ctxGraph.strokeStyle = color;
    ctxGraph.lineWidth = 2.5;
    ctxGraph.shadowColor = glowColor;
    ctxGraph.shadowBlur = 4;
    ctxGraph.beginPath();

    for (let i = 0; i <= points; i++) {
      const tVal = (i / points) * currentTimeLimit;
      const state = getPhysicsState(tVal);
      const eVal = evaluator(state);
      const coords = getCanvasCoords(tVal, eVal);
      if (i === 0) {
        ctxGraph.moveTo(coords.x, coords.y);
      } else {
        ctxGraph.lineTo(coords.x, coords.y);
      }
    }
    ctxGraph.stroke();
    ctxGraph.shadowBlur = 0; // reset
  };

  if (elapsedTime > 0) {
    // GPE (Pink)
    drawEnergyLine(s => s.gpe, colorGPE, 'rgba(255, 46, 147, 0.4)');
    // KE (Cyan)
    drawEnergyLine(s => s.ke, colorKE, 'rgba(0, 242, 254, 0.4)');
    // Total (Green)
    drawEnergyLine(s => s.total, colorTotal, 'rgba(57, 255, 20, 0.4)');
  }

  // Draw capture flags on the graph
  captures.forEach((cap, index) => {
    const coords = getCanvasCoords(cap.time, cap.gpe);
    ctxGraph.fillStyle = colorKE;
    ctxGraph.beginPath();
    ctxGraph.arc(coords.x, coords.y, 4, 0, Math.PI * 2);
    ctxGraph.fill();

    ctxGraph.font = '10px "Outfit"';
    ctxGraph.fillText(`Cap ${index + 1}`, coords.x, coords.y - 8);
  });
}

// --- Animation Loop ---

function animate(timestamp) {
  if (!simRunning) return;

  if (!startTime) startTime = timestamp;
  elapsedTime = (timestamp - startTime) / 1000;

  const state = getPhysicsState(elapsedTime);
  currentH = state.h;
  currentV = state.v;

  if (state.impacted) {
    simRunning = false;
    currentH = 0;
    currentV = vImpact;
    isImpacted = true;
    btnStart.innerHTML = `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg> Start`;
    btnCapture.disabled = true;
  }

  updateLiveStateDisplays();
  drawAnimation();
  drawGraph();

  if (simRunning) {
    requestAnimationFrame(animate);
  }
}

// --- Event Handlers ---

function onStart() {
  if (isImpacted) {
    // Auto reset if start is clicked after hitting ground
    onReset();
  }

  if (simRunning) {
    // Pause
    simRunning = false;
    btnStart.innerHTML = `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg> Resume`;
    btnCapture.disabled = true;
  } else {
    // Start / Resume
    simRunning = true;
    btnStart.innerHTML = `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> Pause`;
    btnCapture.disabled = false;
    
    // Adjust startTime to continue smoothly from pause
    startTime = performance.now() - (elapsedTime * 1000);
    requestAnimationFrame(animate);
  }
}

// Custom handler to capture current state
function onCapture() {
  if (elapsedTime <= 0) return;

  const state = getPhysicsState(elapsedTime);
  const captureItem = {
    index: captures.length + 1,
    time: Math.min(elapsedTime, tImpact),
    h: state.h,
    v: state.v,
    gpe: state.gpe,
    ke: state.ke
  };

  captures.push(captureItem);
  renderCapturedList();
  drawAnimation();
  drawGraph();
}

function renderCapturedList() {
  if (captures.length === 0) {
    capturedListContainer.style.display = 'none';
    capturedListContainer.innerHTML = '';
    return;
  }

  capturedListContainer.style.display = 'flex';
  capturedListContainer.innerHTML = `<h3 style="font-size:0.9rem; font-weight:600; color:var(--text-secondary); margin-bottom:0.25rem;">Captured Points:</h3>`;

  captures.forEach(cap => {
    let displayH = cap.h.toFixed(2) + ' m';
    let displayV = cap.v.toFixed(2) + ' m/s';

    // Render with question mark and hide-reveal action in Test Mode
    let hContent = displayH;
    let vContent = displayV;

    if (testModeActive && hiddenVars.g1 === 'h') {
      hContent = `
        <span class="hidden-value-container">
          <span class="hidden-text">?</span>
          <button class="reveal-btn" onclick="showSolution('h', ${cap.index - 1})" title="Solve for height">
            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </span>
      `;
    }

    if (testModeActive && hiddenVars.g1 === 'v') {
      vContent = `
        <span class="hidden-value-container">
          <span class="hidden-text">?</span>
          <button class="reveal-btn" onclick="showSolution('v', ${cap.index - 1})" title="Solve for speed">
            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </span>
      `;
    }

    const div = document.createElement('div');
    div.className = 'captured-item';
    div.innerHTML = `
      <span class="captured-title">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
        Point ${cap.index} (t = ${cap.time.toFixed(2)}s)
      </span>
      <div>
        <span style="margin-right: 1.5rem;">Height: ${hContent}</span>
        <span>Speed: ${vContent}</span>
      </div>
    `;
    capturedListContainer.appendChild(div);
  });
}

function onReset() {
  simRunning = false;
  startTime = null;
  elapsedTime = 0;
  isImpacted = false;
  captures = [];

  updatePhysicsConstants();
  currentH = h0;
  currentV = v0;

  btnStart.innerHTML = `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg> Start`;
  btnCapture.disabled = true;

  renderDisplays();
  renderCapturedList();
  drawAnimation();
  drawGraph();
}

// Toggle Test Mode State
function onTestMode() {
  testModeActive = !testModeActive;

  if (testModeActive) {
    btnTest.classList.add('active');
    btnTest.innerHTML = `
      <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
      Exit Quiz
    `;

    // Randomise hidden parameters
    const g1Options = ['h', 'v'];
    const g2Options = ['g', 'h0', 'v0'];

    hiddenVars.g1 = g1Options[Math.floor(Math.random() * g1Options.length)];
    hiddenVars.g2 = g2Options[Math.floor(Math.random() * g2Options.length)];
  } else {
    btnTest.classList.remove('active');
    btnTest.innerHTML = `
      <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      Test Mode
    `;
    hiddenVars.g1 = null;
    hiddenVars.g2 = null;
  }

  // Refresh renders with updated visibility rules
  renderDisplays();
  renderCapturedList();
  drawAnimation();
  drawGraph();
}

// --- Worked Solutions Generator ---

window.showSolution = function(varKey, captureIndex = null) {
  let explanation = '';
  
  // Decide actual values based on capture or slider
  let cap = null;
  if (captureIndex !== null) {
    cap = captures[captureIndex];
  } else {
    // If live display clicked, use the current active values
    cap = {
      h: currentH,
      v: currentV,
      time: elapsedTime
    };
  }

  // Generate equations based on Conservation of Energy
  // E_total = GPE + KE = m*g*h + 0.5*m*v^2 = constant
  // Since mass cancels: g*h0 + 0.5*v0^2 = g*h + 0.5*v^2
  
  if (varKey === 'v') {
    // Find velocity v at height h
    explanation = `
      <p>By the <strong>Principle of Conservation of Energy</strong> (no air resistance):</p>
      <div class="step-formula">Total Mechanical Energy at Start = Total Mechanical Energy at Point</div>
      <div class="step-formula">GPE<sub>initial</sub> + KE<sub>initial</sub> = GPE<sub>final</sub> + KE<sub>final</sub></div>
      <div class="step-formula">m·g·h₀ + ½·m·v₀² = m·g·h + ½·m·v²</div>
      
      <p>Divide the entire equation by mass (<strong>m</strong>) to cancel it out (showing that acceleration of free fall does not depend on mass):</p>
      <div class="step-formula">g·h₀ + ½·v₀² = g·h + ½·v²</div>
      
      <p>Substitute our known parameters:</p>
      <div class="step-formula">(${g.toFixed(1)})·(${h0.toFixed(0)}) + ½·(${v0.toFixed(1)})² = (${g.toFixed(1)})·(${cap.h.toFixed(2)}) + ½·v²</div>
      <div class="step-formula">${(g*h0 + 0.5*v0*v0).toFixed(2)} = ${(g*cap.h).toFixed(2)} + ½·v²</div>
      
      <p>Rearrange to isolate the kinetic energy term:</p>
      <div class="step-formula">½·v² = ${(g*h0 + 0.5*v0*v0).toFixed(2)} - ${(g*cap.h).toFixed(2)}</div>
      <div class="step-formula">½·v² = ${(g * (h0 - cap.h) + 0.5*v0*v0).toFixed(2)}</div>
      <div class="step-formula">v² = ${(2 * (g * (h0 - cap.h) + 0.5*v0*v0)).toFixed(2)}</div>
      
      <div class="step-formula">v = √[${(2 * (g * (h0 - cap.h) + 0.5*v0*v0)).toFixed(2)}]</div>
      
      <div class="highlight-box">
        <strong>Final Answer:</strong> Speed (v) at height ${cap.h.toFixed(2)}m is <strong>${cap.v.toFixed(2)} m/s</strong>.
      </div>
    `;
  } else if (varKey === 'h') {
    // Find height h at speed v
    explanation = `
      <p>By the <strong>Principle of Conservation of Energy</strong>:</p>
      <div class="step-formula">GPE<sub>initial</sub> + KE<sub>initial</sub> = GPE<sub>final</sub> + KE<sub>final</sub></div>
      <div class="step-formula">m·g·h₀ + ½·m·v₀² = m·g·h + ½·m·v²</div>
      
      <p>Cancel out mass (<strong>m</strong>) from all terms:</p>
      <div class="step-formula">g·h₀ + ½·v₀² = g·h + ½·v²</div>
      
      <p>Substitute known values:</p>
      <div class="step-formula">(${g.toFixed(1)})·(${h0.toFixed(0)}) + ½·(${v0.toFixed(1)})² = (${g.toFixed(1)})·h + ½·(${cap.v.toFixed(2)})²</div>
      <div class="step-formula">${(g*h0 + 0.5*v0*v0).toFixed(2)} = (${g.toFixed(1)})·h + ${(0.5*cap.v*cap.v).toFixed(2)}</div>
      
      <p>Rearrange to solve for height (<strong>h</strong>):</p>
      <div class="step-formula">(${g.toFixed(1)})·h = ${(g*h0 + 0.5*v0*v0).toFixed(2)} - ${(0.5*cap.v*cap.v).toFixed(2)}</div>
      <div class="step-formula">(${g.toFixed(1)})·h = ${(g*h0 + 0.5*v0*v0 - 0.5*cap.v*cap.v).toFixed(2)}</div>
      <div class="step-formula">h = ${(g*h0 + 0.5*v0*v0 - 0.5*cap.v*cap.v).toFixed(2)} / ${g.toFixed(1)}</div>
      
      <div class="highlight-box">
        <strong>Final Answer:</strong> Height (h) at speed ${cap.v.toFixed(2)} m/s is <strong>${cap.h.toFixed(2)} m</strong>.
      </div>
    `;
  } else if (varKey === 'g') {
    // Find gravitational field strength g
    explanation = `
      <p>By the <strong>Principle of Conservation of Energy</strong>:</p>
      <div class="step-formula">GPE<sub>initial</sub> + KE<sub>initial</sub> = GPE<sub>final</sub> + KE<sub>final</sub></div>
      <div class="step-formula">m·g·h₀ + ½·m·v₀² = m·g·h + ½·m·v²</div>
      
      <p>Cancel out mass (<strong>m</strong>):</p>
      <div class="step-formula">g·h₀ + ½·v₀² = g·h + ½·v²</div>
      
      <p>Rearrange the formula to group the gravity (<strong>g</strong>) terms:</p>
      <div class="step-formula">g·h₀ - g·h = ½·v² - ½·v₀²</div>
      <div class="step-formula">g·(h₀ - h) = ½·(v² - v₀²)</div>
      
      <p>Substitute known variables:</p>
      <div class="step-formula">g·(${h0.toFixed(0)} - ${cap.h.toFixed(2)}) = ½·((${cap.v.toFixed(2)})² - (${v0.toFixed(1)})²)</div>
      <div class="step-formula">g·(${(h0 - cap.h).toFixed(2)}) = ${(0.5 * (cap.v*cap.v - v0*v0)).toFixed(2)}</div>
      
      <p>Divide by displacement to isolate gravity (<strong>g</strong>):</p>
      <div class="step-formula">g = ${(0.5 * (cap.v*cap.v - v0*v0)).toFixed(2)} / ${(h0 - cap.h).toFixed(2)}</div>
      
      <div class="highlight-box">
        <strong>Final Answer:</strong> Gravitational field strength (g) is <strong>${g.toFixed(1)} N/kg</strong> (or m/s²).
      </div>
    `;
  } else if (varKey === 'h0') {
    // Find initial height h0
    explanation = `
      <p>By the <strong>Principle of Conservation of Energy</strong>:</p>
      <div class="step-formula">GPE<sub>initial</sub> + KE<sub>initial</sub> = GPE<sub>final</sub> + KE<sub>final</sub></div>
      <div class="step-formula">m·g·h₀ + ½·m·v₀² = m·g·h + ½·m·v²</div>
      
      <p>Cancel out mass (<strong>m</strong>):</p>
      <div class="step-formula">g·h₀ + ½·v₀² = g·h + ½·v²</div>
      
      <p>Substitute our known parameters:</p>
      <div class="step-formula">(${g.toFixed(1)})·h₀ + ½·(${v0.toFixed(1)})² = (${g.toFixed(1)})·(${cap.h.toFixed(2)}) + ½·(${cap.v.toFixed(2)})²</div>
      <div class="step-formula">(${g.toFixed(1)})·h₀ + ${(0.5*v0*v0).toFixed(2)} = ${(g*cap.h).toFixed(2)} + ${(0.5*cap.v*cap.v).toFixed(2)}</div>
      <div class="step-formula">(${g.toFixed(1)})·h₀ + ${(0.5*v0*v0).toFixed(2)} = ${(g*cap.h + 0.5*cap.v*cap.v).toFixed(2)}</div>
      
      <p>Rearrange to solve for initial height (<strong>h₀</strong>):</p>
      <div class="step-formula">(${g.toFixed(1)})·h₀ = ${(g*cap.h + 0.5*cap.v*cap.v).toFixed(2)} - ${(0.5*v0*v0).toFixed(2)}</div>
      <div class="step-formula">h₀ = ${(g*cap.h + 0.5*cap.v*cap.v - 0.5*v0*v0).toFixed(2)} / ${g.toFixed(1)}</div>
      
      <div class="highlight-box">
        <strong>Final Answer:</strong> Initial height (h₀) is <strong>${h0.toFixed(0)} m</strong>.
      </div>
    `;
  } else if (varKey === 'v0') {
    // Find initial speed v0
    explanation = `
      <p>By the <strong>Principle of Conservation of Energy</strong>:</p>
      <div class="step-formula">GPE<sub>initial</sub> + KE<sub>initial</sub> = GPE<sub>final</sub> + KE<sub>final</sub></div>
      <div class="step-formula">m·g·h₀ + ½·m·v₀² = m·g·h + ½·m·v²</div>
      
      <p>Cancel out mass (<strong>m</strong>):</p>
      <div class="step-formula">g·h₀ + ½·v₀² = g·h + ½·v²</div>
      
      <p>Substitute our known parameters:</p>
      <div class="step-formula">(${g.toFixed(1)})·(${h0.toFixed(0)}) + ½·v₀² = (${g.toFixed(1)})·(${cap.h.toFixed(2)}) + ½·(${cap.v.toFixed(2)})²</div>
      <div class="step-formula">${(g*h0).toFixed(2)} + ½·v₀² = ${(g*cap.h).toFixed(2)} + ${(0.5*cap.v*cap.v).toFixed(2)}</div>
      <div class="step-formula">${(g*h0).toFixed(2)} + ½·v₀² = ${(g*cap.h + 0.5*cap.v*cap.v).toFixed(2)}</div>
      
      <p>Rearrange to isolate the initial kinetic energy term:</p>
      <div class="step-formula">½·v₀² = ${(g*cap.h + 0.5*cap.v*cap.v).toFixed(2)} - ${(g*h0).toFixed(2)}</div>
      <div class="step-formula">½·v₀² = ${(g*cap.h + 0.5*cap.v*cap.v - g*h0).toFixed(2)}</div>
      <div class="step-formula">v₀² = ${(2 * (g*cap.h + 0.5*cap.v*cap.v - g*h0)).toFixed(2)}</div>
      
      <div class="step-formula">v₀ = √[${Math.max(0, 2 * (g*cap.h + 0.5*cap.v*cap.v - g*h0)).toFixed(2)}]</div>
      
      <div class="highlight-box">
        <strong>Final Answer:</strong> Initial speed (v₀) is <strong>${v0.toFixed(1)} m/s</strong>.
      </div>
    `;
  }

  solutionContent.innerHTML = explanation;
  modalOverlay.classList.add('open');
};

function closeModal() {
  modalOverlay.classList.remove('open');
}

// --- Setup Event Listeners ---
gInput.addEventListener('input', () => { updatePhysicsConstants(); onReset(); });
h0Input.addEventListener('input', () => { updatePhysicsConstants(); onReset(); });
mInput.addEventListener('input', () => { updatePhysicsConstants(); onReset(); });
v0Input.addEventListener('input', () => { updatePhysicsConstants(); onReset(); });

btnStart.addEventListener('click', onStart);
btnCapture.addEventListener('click', onCapture);
btnReset.addEventListener('click', onReset);
btnTest.addEventListener('click', onTestMode);

btnCloseModal.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

// Window resize listener
window.addEventListener('resize', resizeCanvases);

// Initial initialization
updatePhysicsConstants();
resizeCanvases();
onReset();
