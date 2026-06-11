/**
 * Terminal Velocity Simulator - JavaScript Controller
 * O-Level Physics Singapore Syllabus 6091
 */

// --- Physics Config & Parameters ---
const OBJECTS = {
  skydiver: {
    name: 'Skydiver',
    terminalVelocity: 50, // m/s
    mass: 80, // kg
    svg: `<svg viewBox="0 0 64 64" width="60" height="60">
      <!-- Parachute backpack/harness -->
      <rect x="26" y="24" width="12" height="18" rx="3" fill="#475569" stroke="#f8fafc" stroke-width="2"/>
      <!-- Body -->
      <circle cx="32" cy="18" r="7" fill="#f59e0b"/>
      <path d="M22 28 C28 28, 30 32, 32 32 C34 32, 36 28, 42 28 C44 32, 44 42, 38 46 L36 56 L28 56 L26 46 C20 42, 20 32, 22 28 Z" fill="#3b82f6" stroke="#f8fafc" stroke-width="1.5"/>
      <!-- Arms in skydiving pose -->
      <path d="M20 26 C14 20, 10 24, 14 30 L22 30" stroke="#f59e0b" stroke-width="4" stroke-linecap="round" fill="none"/>
      <path d="M44 26 C50 20, 54 24, 50 30 L42 30" stroke="#f59e0b" stroke-width="4" stroke-linecap="round" fill="none"/>
    </svg>`
  }
};

const G = 10; // Acceleration of gravity in Singapore O-Level syllabus (10 m/s^2)

// --- State Variables ---
let simActive = false;
let simTime = 0;
let velocity = 0;
let acceleration = G;
let yPos = 0; // Cumulative distance fallen in meters
let pathHistory = []; // Array of {t, v} for the graph

let isAirResistance = true;
let selectedObjectKey = 'skydiver';
let simSpeed = 1.0;
let lastTimestamp = null;
let animationFrameId = null;

// Layout variables
let maxSimDuration = 14; // Limit simulation to 14s for visual landing
let landingHeightThreshold = 350; // Dynamic height trigger for ground arrival

// Quiz State Variables
let currentScore = {
  section2: 0,
  section3: 0
};
let answeredQuestionsSec2 = new Set();
let answeredQuestionsSec3 = new Set();

// --- Elements Cache ---
const el = {
  tabAnimate: document.getElementById('tab-animate'),
  tabConcept: document.getElementById('tab-concept'),
  tabQuiz: document.getElementById('tab-quiz'),
  
  secAnimate: document.getElementById('section-animate'),
  secConcept: document.getElementById('section-concept'),
  secQuiz: document.getElementById('section-quiz'),
  
  btnPlayPause: document.getElementById('btn-play-pause'),
  btnRestart: document.getElementById('btn-restart'),
  toggleAR: document.getElementById('toggle-air-resistance'),
  arStatusText: document.getElementById('ar-status-text'),
  selectObject: document.getElementById('select-object'),
  selectSpeed: document.getElementById('select-speed'),
  
  fallingObjectWrapper: document.getElementById('falling-object-wrapper'),
  fallingObject: document.getElementById('falling-object'),
  vectorAR: document.getElementById('vector-ar'),
  vectorW: document.getElementById('vector-w'),
  arrowAR: document.querySelector('#vector-ar .arrow-line'),
  arrowW: document.querySelector('#vector-w .arrow-line'),
  
  stageOverlay: document.getElementById('stage-overlay'),
  shaftBg: document.getElementById('shaft-bg'),
  ground: document.getElementById('shaft-ground'),
  
  canvasVT: document.getElementById('vt-graph'),
  canvasQuiz: document.getElementById('quiz-graph'),
  
  statTime: document.getElementById('stat-time'),
  statVelocity: document.getElementById('stat-velocity'),
  statAcceleration: document.getElementById('stat-acceleration'),
  infoStageBox: document.getElementById('info-stage-box'),
  summaryTable: document.getElementById('summary-table-container'),
  
  formulaWeight: document.getElementById('formula-weight'),
  formulaResultant: document.getElementById('formula-resultant'),
  
  // Scoring / Quizzes
  totalScoreDisplay: document.getElementById('total-score-display'),
  btnResetAll: document.getElementById('btn-reset-all'),
  
  // Section 2 elements
  conceptCurrentNum: document.getElementById('concept-current-num'),
  conceptTotalNum: document.getElementById('concept-total-num'),
  conceptProgressBar: document.getElementById('concept-progress-bar'),
  conceptQuestionText: document.getElementById('concept-question-text'),
  conceptOptions: document.getElementById('concept-options'),
  conceptExplanation: document.getElementById('concept-explanation'),
  conceptExplanationText: document.getElementById('concept-explanation-text'),
  btnConceptNext: document.getElementById('btn-concept-next'),
  
  // Section 3 elements
  graphCurrentNum: document.getElementById('graph-current-num'),
  graphProgressBar: document.getElementById('graph-progress-bar'),
  graphQuestionText: document.getElementById('graph-question-text'),
  graphOptions: document.getElementById('graph-options'),
  graphExplanation: document.getElementById('graph-explanation'),
  graphExplanationText: document.getElementById('graph-explanation-text'),
  btnGraphNext: document.getElementById('btn-graph-next'),
  graphPointBadge: document.getElementById('graph-point-badge'),
  
  // Modal Results
  resultsModal: document.getElementById('results-modal'),
  btnCloseModal: document.getElementById('btn-close-modal'),
  btnModalRestart: document.getElementById('btn-modal-restart'),
  btnModalCloseAction: document.getElementById('btn-modal-close-action'),
  modalScoreSec2: document.getElementById('modal-score-sec2'),
  modalScoreSec3: document.getElementById('modal-score-sec3'),
  modalScoreTotal: document.getElementById('modal-score-total'),
  modalGradeBanner: document.getElementById('modal-grade-banner'),
  modalFeedbackText: document.getElementById('modal-feedback-text')
};

// --- Initial Setup & Tab Navigation ---
window.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  setupSimulationEventListeners();
  loadObject(selectedObjectKey);
  initGraphCanvas();
  renderQuizGraphReference();
  initQuizzes();
  updateTotalScoreDisplay();
});

function setupTabs() {
  const tabs = [
    { btn: el.tabAnimate, sec: el.secAnimate },
    { btn: el.tabConcept, sec: el.secConcept },
    { btn: el.tabQuiz, sec: el.secQuiz }
  ];

  tabs.forEach(tab => {
    tab.btn.addEventListener('click', () => {
      tabs.forEach(t => {
        t.btn.classList.remove('active');
        t.btn.setAttribute('aria-selected', 'false');
        t.sec.classList.remove('active');
      });
      tab.btn.classList.add('active');
      tab.btn.setAttribute('aria-selected', 'true');
      tab.sec.classList.add('active');
      
      // If switching to Animate, redraw graph; if to quiz, render reference
      if (tab.sec === el.secAnimate) {
        drawVTGraph();
      } else if (tab.sec === el.secQuiz) {
        renderQuizGraphReference();
      }
    });
  });
}

// --- Simulation Logic ---

function setupSimulationEventListeners() {
  el.btnPlayPause.addEventListener('click', togglePlayPause);
  el.btnRestart.addEventListener('click', restartSimulation);
  
  el.toggleAR.addEventListener('change', (e) => {
    isAirResistance = e.target.checked;
    el.arStatusText.textContent = isAirResistance ? 'ON' : 'OFF';
    el.arStatusText.style.color = isAirResistance ? 'var(--accent-blue)' : 'var(--text-muted)';
    restartSimulation();
  });
  
  el.selectObject.addEventListener('change', (e) => {
    selectedObjectKey = e.target.value;
    loadObject(selectedObjectKey);
    restartSimulation();
  });
  
  el.selectSpeed.addEventListener('change', (e) => {
    simSpeed = parseFloat(e.target.value);
  });
}

function loadObject(key) {
  const obj = OBJECTS[key];
  el.fallingObject.innerHTML = obj.svg;
  
  // Set terminal velocity dependent properties
  if (key === 'skydiver') {
    landingHeightThreshold = 950;
  }
}

function togglePlayPause() {
  if (simActive) {
    // Pause
    simActive = false;
    showPlayIcon(true);
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
  } else {
    // Play
    simActive = true;
    showPlayIcon(false);
    lastTimestamp = performance.now();
    animationFrameId = requestAnimationFrame(simulationLoop);
  }
}

function showPlayIcon(isPlay) {
  const playIcon = el.btnPlayPause.querySelector('.play-icon');
  const pauseIcon = el.btnPlayPause.querySelector('.pause-icon');
  const text = el.btnPlayPause.querySelector('span');
  
  if (isPlay) {
    playIcon.classList.remove('hidden');
    pauseIcon.classList.add('hidden');
    text.textContent = 'Play';
  } else {
    playIcon.classList.add('hidden');
    pauseIcon.classList.remove('hidden');
    text.textContent = 'Pause';
  }
}

function restartSimulation() {
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  simActive = false;
  showPlayIcon(true);
  
  simTime = 0;
  velocity = 0;
  acceleration = G;
  yPos = 0;
  pathHistory = [];
  lastTimestamp = null;
  
  // Reset DOM displays
  el.ground.style.bottom = '-60px';
  el.fallingObjectWrapper.style.top = '50px';
  el.summaryTable.classList.add('hidden');
  
  updateFormulaHighlighting(null);
  updateStatsDOM();
  drawVTGraph();
  
  el.stageOverlay.textContent = 'Stage 1: Just Released';
  el.stageOverlay.style.opacity = '1';
  el.infoStageBox.innerHTML = `Press <strong>Play</strong> to start the drop.`;
}

function simulationLoop(timestamp) {
  if (!simActive) return;
  
  if (!lastTimestamp) lastTimestamp = timestamp;
  let dt = (timestamp - lastTimestamp) / 1000 * simSpeed;
  lastTimestamp = timestamp;
  
  // Cap dt to prevent massive jumps on tab switches
  if (dt > 0.1) dt = 0.1;
  
  updatePhysics(dt);
  updateAnimationDOM();
  updateStatsDOM();
  drawVTGraph();
  
  // Determine if landed (decide strictly based on simTime = 24s)
  let hasLanded = simTime >= 24.0;
  
  if (hasLanded) {
    // End simulation
    simActive = false;
    showPlayIcon(true);
    
    // Position object exactly on ground
    el.fallingObjectWrapper.style.top = '315px'; // resting on ground
    el.ground.style.bottom = '0px';
    
    // Show summary table
    el.summaryTable.classList.remove('hidden');
    el.summaryTable.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Zero out vectors
    velocity = 0;
    acceleration = 0;
    updateStatsDOM();
    updateForcesVectors(0); 
    
    el.stageOverlay.textContent = 'Object Landed!';
    el.infoStageBox.innerHTML = `Object has landed. Check the <strong>Stages of Motion Summary Table</strong> below.`;
    
    return;
  }
  
  animationFrameId = requestAnimationFrame(simulationLoop);
}

function updatePhysics(dt) {
  const obj = OBJECTS[selectedObjectKey];
  
  if (isAirResistance) {
    // Quadratic Drag Model: a = g * (1 - (v / v_terminal)^2)
    const ratio = velocity / obj.terminalVelocity;
    acceleration = G * (1 - ratio * ratio);
    
    // Cap acceleration to avoid negative values
    if (acceleration < 0) acceleration = 0;
    
    velocity += acceleration * dt;
    
    // Lock to terminal velocity when within 0.1% to get zero gradient smoothly
    if (velocity >= obj.terminalVelocity * 0.999) {
      velocity = obj.terminalVelocity;
      acceleration = 0;
    }
  } else {
    // No air resistance: free fall constant acceleration
    acceleration = G;
    velocity += acceleration * dt;
  }
  
  yPos += velocity * dt;
  simTime += dt;
  
  // Store path point for graph
  pathHistory.push({ t: simTime, v: velocity });
}

function updateAnimationDOM() {
  const obj = OBJECTS[selectedObjectKey];
  
  // Object relative top position in shaft viewport based on simTime (24s limit)
  // Starts at 50px, moves down to 220px as it falls, then stays centered while background scrolls
  let objectTop = 50 + (simTime / 24.0) * 170;
  if (objectTop > 220) objectTop = 220;
  el.fallingObjectWrapper.style.top = `${objectTop}px`;
  
  // Scroll shaft cloud background upwards based on speed
  const bgScrollRate = 3.5; // multiplier
  const bgPos = -(yPos * bgScrollRate) % 400;
  el.shaftBg.style.backgroundPositionY = `${bgPos}px`;
  
  // If approaching ground threshold (last 2.5 seconds of the 24s fall), slide ground up
  if (simTime > 24.0 - 2.5) {
    const remainingTime = 24.0 - simTime;
    // Ground starts at -60px, goes to 0px
    const groundBottom = -60 + (1 - remainingTime / 2.5) * 60;
    el.ground.style.bottom = `${Math.min(0, groundBottom)}px`;
  } else {
    el.ground.style.bottom = '-60px';
  }
  
  // Update forces arrows length
  updateForcesVectors(velocity);
  
  // Determine Stages & Labels
  let stageText = '';
  let infoText = '';
  
  if (!isAirResistance) {
    stageText = 'No Air Resistance — Constant Acceleration';
    infoText = `With air resistance <strong>OFF</strong>, only <strong>Weight (W)</strong> acts on the object. Resultant force is constant ($F = W$). Acceleration remains at $10\\text{ m/s}^2$ throughout.`;
    updateFormulaHighlighting('weight');
  } else {
    const obj = OBJECTS[selectedObjectKey];
    if (simTime < 0.8) {
      stageText = 'Accelerating — Weight > Air Resistance';
      infoText = `At release, velocity is $0$, so <strong>Air Resistance (AR) = 0 N</strong>. Resultant force is at its maximum (equals weight). Acceleration is $10\\text{ m/s}^2$.`;
      updateFormulaHighlighting('weight');
    } else if (velocity < obj.terminalVelocity * 0.999) {
      stageText = 'Still accelerating but decreasing acceleration, increasing velocity, rate of increasing velocity is decreasing - air resistance increase';
      infoText = `As speed increases, <strong>Air Resistance increases</strong>. Resultant force ($W - AR$) and acceleration both <strong>decrease</strong>, but velocity is still increasing!`;
      updateFormulaHighlighting('resultant');
    } else {
      stageText = 'Terminal Velocity reached — Weight = Air Resistance, Resultant Force = 0 N';
      infoText = `<strong>Terminal Velocity reached!</strong> Air Resistance has grown equal to Weight. Resultant force is $0\\text{ N}$, meaning acceleration is $0\\text{ m/s}^2$. Velocity is constant.`;
      updateFormulaHighlighting('resultant');
    }
  }
  
  el.stageOverlay.textContent = stageText;
  el.infoStageBox.innerHTML = infoText;
}

function updateForcesVectors(currVelocity) {
  const obj = OBJECTS[selectedObjectKey];
  
  // Weight arrow stays constant
  const baseWeightHeight = 60;
  el.vectorW.style.height = `${baseWeightHeight}px`;
  el.arrowW.style.height = `${baseWeightHeight - 15}px`;
  
  if (!isAirResistance || currVelocity === 0) {
    // Hide or zero-out Air Resistance arrow
    el.vectorAR.style.opacity = '0';
    el.vectorAR.style.height = '0px';
    el.arrowAR.style.height = '0px';
  } else {
    el.vectorAR.style.opacity = '1';
    
    // AR grows with velocity ratio
    const arRatio = currVelocity / obj.terminalVelocity;
    const arHeight = baseWeightHeight * arRatio;
    
    el.vectorAR.style.height = `${Math.max(15, arHeight)}px`;
    el.arrowAR.style.height = `${Math.max(2, arHeight - 15)}px`;
  }
}

function updateFormulaHighlighting(activeStage) {
  if (activeStage === 'weight') {
    el.formulaWeight.classList.add('highlight-yellow');
    el.formulaResultant.classList.remove('highlight-yellow');
  } else if (activeStage === 'resultant') {
    el.formulaWeight.classList.remove('highlight-yellow');
    el.formulaResultant.classList.add('highlight-yellow');
  } else {
    el.formulaWeight.classList.remove('highlight-yellow');
    el.formulaResultant.classList.remove('highlight-yellow');
  }
}

function updateStatsDOM() {
  el.statTime.innerHTML = `${simTime.toFixed(2)} <small>s</small>`;
  el.statVelocity.innerHTML = `${velocity.toFixed(1)} <small>m/s</small>`;
  el.statAcceleration.innerHTML = `${acceleration.toFixed(1)} <small>m/s²</small>`;
}

// --- Live Graph Panel Drawing (Canvas) ---

let graphCtx = null;
function initGraphCanvas() {
  graphCtx = el.canvasVT.getContext('2d');
  drawVTGraph();
}

function drawVTGraph() {
  if (!graphCtx) return;
  
  const ctx = graphCtx;
  const w = el.canvasVT.width;
  const h = el.canvasVT.height;
  
  // Clear canvas
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  
  const padding = { top: 30, right: 30, bottom: 45, left: 55 };
  const graphWidth = w - padding.left - padding.right;
  const graphHeight = h - padding.top - padding.bottom;
  
  // Grid lines
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  for (let i = 1; i <= 5; i++) {
    // Horizontal grid lines
    const yGrid = padding.top + (graphHeight / 5) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, yGrid);
    ctx.lineTo(w - padding.right, yGrid);
    ctx.stroke();
    
    // Vertical grid lines
    const xGrid = padding.left + (graphWidth / 5) * (i - 1);
    ctx.beginPath();
    ctx.moveTo(xGrid, padding.top);
    ctx.lineTo(xGrid, h - padding.bottom);
    ctx.stroke();
  }
  
  // Draw Axes
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top);
  ctx.lineTo(padding.left, h - padding.bottom);
  ctx.lineTo(w - padding.right, h - padding.bottom);
  ctx.stroke();
  
  // Axis Labels
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 13px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('Time (seconds)', padding.left + graphWidth / 2, h - 10);
  
  ctx.save();
  ctx.translate(15, padding.top + graphHeight / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('Velocity (m/s)', 0, 0);
  ctx.restore();
  
  // Physics Scales limits
  const maxT = 24; // max time on graph X axis
  const obj = OBJECTS[selectedObjectKey];
  // Set Y-axis scale based on terminal velocity or expected free fall max speed
  const maxV = !isAirResistance ? 120 : (obj.terminalVelocity === 9 ? 12 : 60);
  
  // Axis numbers
  ctx.fillStyle = '#475569';
  ctx.font = '11px Inter';
  ctx.textAlign = 'right';
  for (let i = 0; i <= 5; i++) {
    const valY = Math.round((maxV / 5) * i);
    const posY = h - padding.bottom - (graphHeight / 5) * i;
    ctx.fillText(valY, padding.left - 8, posY + 4);
  }
  
  ctx.textAlign = 'center';
  for (let i = 0; i <= 5; i++) {
    const valX = Math.round((maxT / 5) * i);
    const posX = padding.left + (graphWidth / 5) * i;
    ctx.fillText(valX, posX, h - padding.bottom + 18);
  }
  
  // Target Dotted Line for Terminal Velocity (If air resistance ON)
  if (isAirResistance) {
    const termY = h - padding.bottom - (obj.terminalVelocity / maxV) * graphHeight;
    ctx.strokeStyle = '#e2e8f0';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padding.left, termY);
    ctx.lineTo(w - padding.right, termY);
    ctx.stroke();
    ctx.setLineDash([]); // Reset
    
    ctx.fillStyle = '#3b82f6';
    ctx.font = 'bold 11px Inter';
    ctx.textAlign = 'left';
    ctx.fillText(`Terminal Velocity (${obj.terminalVelocity} m/s)`, padding.left + 8, termY - 5);
  }
  
  // Plot path points
  if (pathHistory.length > 0) {
    ctx.strokeStyle = isAirResistance ? '#3b82f6' : '#ef4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    pathHistory.forEach((pt, idx) => {
      const x = padding.left + (pt.t / maxT) * graphWidth;
      const y = h - padding.bottom - (pt.v / maxV) * graphHeight;
      
      // Don't draw outside right bound of graph area
      if (x <= w - padding.right) {
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
  }
  
  // Dotted Markers and Labels on graph
  if (isAirResistance && pathHistory.length > 0) {
    // Marker A: Maximum acceleration at t=0
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(padding.left, h - padding.bottom, 4, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillStyle = '#475569';
    ctx.font = '10px Inter';
    ctx.textAlign = 'left';
    ctx.fillText('Max Accel (t=0)', padding.left + 8, h - padding.bottom - 12);
    
    // Marker B: Decreasing acceleration (t around 3s or when v hits 50%)
    const midPt = pathHistory.find(pt => pt.v >= obj.terminalVelocity * 0.5);
    if (midPt && midPt.t <= maxT) {
      const midX = padding.left + (midPt.t / maxT) * graphWidth;
      const midY = h - padding.bottom - (midPt.v / maxV) * graphHeight;
      
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(midX, midY, 4, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.fillStyle = '#475569';
      ctx.fillText('Decreasing Accel', midX + 8, midY - 6);
    }
    
    // Marker C: Terminal velocity reached (t when v reaches 100%)
    const termPt = pathHistory.find(pt => pt.t >= 16.0);
    if (termPt && termPt.t <= maxT) {
      const termX = padding.left + (termPt.t / maxT) * graphWidth;
      const termY = h - padding.bottom - (termPt.v / maxV) * graphHeight;
      
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(termX, termY, 4, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.fillStyle = '#10b981';
      ctx.fillText('Terminal Velocity', termX - 30, termY - 12);
    }
  } else if (!isAirResistance && pathHistory.length > 0) {
    // Linear label
    ctx.fillStyle = '#ef4444';
    ctx.font = '11px Inter';
    ctx.textAlign = 'left';
    ctx.fillText('Constant Accel (gradient = g)', padding.left + 15, padding.top + 30);
  }
}

// --- Section 3: Static Graph Labelling Reference Canvas ---

function renderQuizGraphReference() {
  const canvas = el.canvasQuiz;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  
  const padding = { top: 30, right: 30, bottom: 45, left: 55 };
  const graphWidth = w - padding.left - padding.right;
  const graphHeight = h - padding.top - padding.bottom;
  
  // Grid lines
  ctx.strokeStyle = '#f1f5f9';
  ctx.lineWidth = 1;
  for (let i = 1; i <= 5; i++) {
    const yGrid = padding.top + (graphHeight / 5) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, yGrid);
    ctx.lineTo(w - padding.right, yGrid);
    ctx.stroke();
  }
  
  // Axes
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top);
  ctx.lineTo(padding.left, h - padding.bottom);
  ctx.lineTo(w - padding.right, h - padding.bottom);
  ctx.stroke();
  
  // Labels
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 12px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('Time (s)', padding.left + graphWidth / 2, h - 10);
  
  ctx.save();
  ctx.translate(15, padding.top + graphHeight / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('Velocity (m/s)', 0, 0);
  ctx.restore();
  
  // Curve
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(padding.left, h - padding.bottom);
  
  // Draw nice exponential curve
  const steps = 100;
  for (let i = 0; i <= steps; i++) {
    const ratio = i / steps;
    const t = ratio * 10;
    const v = 50 * (1 - Math.exp(-0.45 * t));
    const x = padding.left + (t / 12) * graphWidth;
    const y = h - padding.bottom - (v / 60) * graphHeight;
    ctx.lineTo(x, y);
  }
  ctx.stroke();
  
  // Draw markers A, B, C, D, E
  const points = {
    A: { t: 0, v: 0, label: 'A' },
    B: { t: 1.5, v: 50 * (1 - Math.exp(-0.45 * 1.5)), label: 'B' },
    C: { t: 3.5, v: 50 * (1 - Math.exp(-0.45 * 3.5)), label: 'C' },
    D: { t: 6.5, v: 50 * (1 - Math.exp(-0.45 * 6.5)), label: 'D' },
    E: { t: 10, v: 50 * (1 - Math.exp(-0.45 * 10)), label: 'E' }
  };
  
  Object.keys(points).forEach(key => {
    const pt = points[key];
    const x = padding.left + (pt.t / 12) * graphWidth;
    const y = h - padding.bottom - (pt.v / 60) * graphHeight;
    
    // Draw dot
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Draw Label badge
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px Outfit';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Offset labels slightly so they don't overlap the curve
    let labelOffset = { x: 0, y: -16 };
    if (key === 'A') labelOffset = { x: 12, y: -12 };
    if (key === 'B') labelOffset = { x: 12, y: -14 };
    if (key === 'C') labelOffset = { x: 12, y: -14 };
    if (key === 'D') labelOffset = { x: 0, y: -16 };
    if (key === 'E') labelOffset = { x: -12, y: -14 };
    
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(x + labelOffset.x - 8, y + labelOffset.y - 8, 16, 16);
    ctx.strokeStyle = '#0f172a';
    ctx.strokeRect(x + labelOffset.x - 8, y + labelOffset.y - 8, 16, 16);
    
    ctx.fillStyle = '#ffffff';
    ctx.fillText(pt.label, x + labelOffset.x, y + labelOffset.y + 1);
  });
}

// --- Section 2: Concept Check Questions ---

const CONCEPT_QUESTIONS = [
  {
    id: 1,
    question: "At the moment of release, what is the air resistance on the falling object?",
    options: ["Equal to weight", "Greater than weight", "Less than weight", "Zero"],
    answer: "Zero",
    explanation: "At the moment of release, velocity = 0, so air resistance = 0. Only weight acts on the object at this instant."
  },
  {
    id: 2,
    question: "As a skydiver falls faster, what happens to air resistance?",
    options: ["Decreases", "Stays the same", "Increases", "Becomes zero"],
    answer: "Increases",
    explanation: "Air resistance increases with speed. The faster the object falls, the greater the air resistance acting upward on it."
  },
  {
    id: 3,
    question: "At terminal velocity, what is the resultant force on the object?",
    options: ["Equal to weight", "Greater than weight", "Less than weight", "Zero"],
    answer: "Zero",
    explanation: "At terminal velocity, Weight = Air Resistance. Resultant force = W - AR = 0 N. Zero resultant force = zero acceleration."
  },
  {
    id: 4,
    question: "At terminal velocity, what is the acceleration of the object?",
    options: ["10 m/s²", "Increasing", "Zero", "Equal to g"],
    answer: "Zero",
    explanation: "Zero resultant force means zero acceleration. The object moves at constant speed, not constant acceleration."
  },
  {
    id: 5,
    question: "A skydiver opens his parachute. What happens immediately after?",
    options: [
      "He accelerates downward", 
      "He stops instantly", 
      "Air resistance suddenly increases, he decelerates", 
      "His weight increases"
    ],
    answer: "Air resistance suddenly increases, he decelerates",
    explanation: "The parachute greatly increases surface area, so air resistance jumps above weight momentarily. Resultant force acts upward. He decelerates until a new, lower terminal velocity is reached."
  },
  {
    id: 6,
    question: "Which velocity-time graph correctly shows a falling object with air resistance?",
    options: [
      "A — Straight line with constant positive gradient",
      "B — Curve with decreasing gradient that levels off horizontally",
      "C — Horizontal straight line from the start",
      "D — Curve that goes up then comes back down"
    ],
    answer: "B",
    explanation: "The object accelerates at first (steep gradient) but as air resistance increases, acceleration decreases (gradient reduces) until terminal velocity is reached (horizontal line)."
  },
  {
    id: 7,
    question: "Without air resistance, how would a ball fall in a gravitational field?",
    options: ["At constant speed", "With decreasing acceleration", "With constant acceleration", "It would not fall"],
    answer: "With constant acceleration",
    explanation: "Without air resistance, only weight acts on the object. Resultant force = Weight = constant. So acceleration = g = constant."
  },
  {
    id: 8,
    question: "A heavier skydiver and a lighter skydiver jump together. Who reaches terminal velocity first?",
    options: ["The heavier one", "The lighter one", "Both at the same time", "Neither reaches terminal velocity"],
    answer: "The lighter one",
    explanation: "The lighter skydiver has less weight, so air resistance equals weight at a lower speed. Terminal velocity is reached sooner and at a lower speed."
  }
];

// --- Section 3: Graph Quiz Questions ---

const GRAPH_QUESTIONS = [
  {
    point: "A",
    badge: "Point A (t = 0, v = 0)",
    question: "What is the velocity of the object at Point A?",
    options: ["10 m/s", "0 m/s", "50 m/s", "Constant velocity"],
    answer: "0 m/s",
    explanation: "The object just started falling from rest."
  },
  {
    point: "B",
    badge: "Point B (steep part of curve)",
    question: "At Point B, is the object accelerating or decelerating?",
    options: ["Accelerating", "Decelerating", "Moving at constant speed", "At rest"],
    answer: "Accelerating",
    explanation: "Gradient is still positive, meaning velocity is still increasing."
  },
  {
    point: "C",
    badge: "Point C (middle of curve, gradient reducing)",
    question: "At Point C, how does the acceleration compare to Point B?",
    options: ["Acceleration is larger", "Acceleration is the same", "Acceleration is smaller", "Acceleration is zero"],
    answer: "Acceleration is smaller",
    explanation: "The gradient is less steep at C than B, meaning acceleration has decreased because air resistance has increased."
  },
  {
    point: "D",
    badge: "Point D (curve just levelling off)",
    question: "At Point D, what can you say about Weight and Air Resistance?",
    options: [
      "Weight is equal to zero",
      "Weight is equal to Air Resistance",
      "Air Resistance is zero",
      "Weight is much greater than Air Resistance"
    ],
    answer: "Weight is equal to Air Resistance",
    explanation: "As the graph approaches horizontal, resultant force approaches zero, meaning forces are nearly balanced."
  },
  {
    point: "E",
    badge: "Point E (flat horizontal section)",
    question: "At Point E, what is the resultant force on the object?",
    options: ["Equal to Weight", "Equal to Air Resistance", "0 N", "10 N"],
    answer: "0 N",
    explanation: "Horizontal line means constant velocity, zero acceleration, therefore zero resultant force. Terminal velocity reached."
  }
];

// Active randomized quiz sets
let shuffledSec2 = [];
let shuffledSec3 = [];
let idxSec2 = 0;
let idxSec3 = 0;

function initQuizzes() {
  shuffledSec2 = shuffleArray([...CONCEPT_QUESTIONS]);
  shuffledSec3 = shuffleArray([...GRAPH_QUESTIONS]);
  
  idxSec2 = 0;
  idxSec3 = 0;
  
  currentScore.section2 = 0;
  currentScore.section3 = 0;
  
  answeredQuestionsSec2.clear();
  answeredQuestionsSec3.clear();
  
  loadConceptQuestion();
  loadGraphQuestion();
}

function loadConceptQuestion() {
  el.conceptExplanation.classList.add('hidden');
  el.btnConceptNext.classList.add('hidden');
  
  const q = shuffledSec2[idxSec2];
  
  el.conceptCurrentNum.textContent = idxSec2 + 1;
  el.conceptTotalNum.textContent = shuffledSec2.length;
  el.conceptProgressBar.style.width = `${((idxSec2 + 1) / shuffledSec2.length) * 100}%`;
  el.conceptQuestionText.textContent = q.question;
  
  el.conceptOptions.innerHTML = '';
  q.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt;
    btn.addEventListener('click', () => selectConceptAnswer(btn, opt, q));
    el.conceptOptions.appendChild(btn);
  });
}

function selectConceptAnswer(selectedBtn, chosenOption, questionObj) {
  // Disable all options
  const optionBtns = el.conceptOptions.querySelectorAll('.option-btn');
  optionBtns.forEach(btn => btn.classList.add('disabled'));
  
  const isCorrect = chosenOption === questionObj.answer;
  
  if (isCorrect) {
    selectedBtn.classList.remove('disabled');
    selectedBtn.classList.add('correct');
    if (!answeredQuestionsSec2.has(questionObj.id)) {
      currentScore.section2 += 2;
      answeredQuestionsSec2.add(questionObj.id);
    }
  } else {
    selectedBtn.classList.remove('disabled');
    selectedBtn.classList.add('wrong');
    // Highlight correct option
    optionBtns.forEach(btn => {
      if (btn.textContent === questionObj.answer) {
        btn.classList.remove('disabled');
        btn.classList.add('correct');
      }
    });
  }
  
  // Show explanation
  el.conceptExplanationText.textContent = questionObj.explanation;
  el.conceptExplanation.classList.remove('hidden');
  
  // Update scores
  updateTotalScoreDisplay();
  
  // Show next button
  el.btnConceptNext.classList.remove('hidden');
  if (idxSec2 === shuffledSec2.length - 1) {
    el.btnConceptNext.textContent = "Finish & See Results";
  } else {
    el.btnConceptNext.textContent = "Next Question";
  }
}

el.btnConceptNext.addEventListener('click', () => {
  if (idxSec2 < shuffledSec2.length - 1) {
    idxSec2++;
    loadConceptQuestion();
  } else {
    showResultsModal();
  }
});

function loadGraphQuestion() {
  el.graphExplanation.classList.add('hidden');
  el.btnGraphNext.classList.add('hidden');
  
  const q = shuffledSec3[idxSec3];
  
  el.graphCurrentNum.textContent = idxSec3 + 1;
  el.graphProgressBar.style.width = `${((idxSec3 + 1) / shuffledSec3.length) * 100}%`;
  el.graphPointBadge.textContent = q.badge;
  el.graphQuestionText.textContent = q.question;
  
  el.graphOptions.innerHTML = '';
  q.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt;
    btn.addEventListener('click', () => selectGraphAnswer(btn, opt, q));
    el.graphOptions.appendChild(btn);
  });
}

function selectGraphAnswer(selectedBtn, chosenOption, questionObj) {
  const optionBtns = el.graphOptions.querySelectorAll('.option-btn');
  optionBtns.forEach(btn => btn.classList.add('disabled'));
  
  const isCorrect = chosenOption === questionObj.answer;
  
  if (isCorrect) {
    selectedBtn.classList.remove('disabled');
    selectedBtn.classList.add('correct');
    if (!answeredQuestionsSec3.has(questionObj.point)) {
      currentScore.section3 += 2;
      answeredQuestionsSec3.add(questionObj.point);
    }
  } else {
    selectedBtn.classList.remove('disabled');
    selectedBtn.classList.add('wrong');
    // Highlight correct option
    optionBtns.forEach(btn => {
      if (btn.textContent === questionObj.answer) {
        btn.classList.remove('disabled');
        btn.classList.add('correct');
      }
    });
  }
  
  // Show explanation
  el.graphExplanationText.textContent = questionObj.explanation;
  el.graphExplanation.classList.remove('hidden');
  
  updateTotalScoreDisplay();
  
  el.btnGraphNext.classList.remove('hidden');
  if (idxSec3 === shuffledSec3.length - 1) {
    el.btnGraphNext.textContent = "Finish & See Results";
  } else {
    el.btnGraphNext.textContent = "Next Question";
  }
}

el.btnGraphNext.addEventListener('click', () => {
  if (idxSec3 < shuffledSec3.length - 1) {
    idxSec3++;
    loadGraphQuestion();
  } else {
    showResultsModal();
  }
});

// --- Results Handling & Scoring ---

function updateTotalScoreDisplay() {
  const total = currentScore.section2 + currentScore.section3;
  el.totalScoreDisplay.textContent = total;
}

function showResultsModal() {
  const total = currentScore.section2 + currentScore.section3;
  
  el.modalScoreSec2.textContent = currentScore.section2;
  el.modalScoreSec3.textContent = currentScore.section3;
  el.modalScoreTotal.textContent = total;
  
  let grade = '';
  let feedback = '';
  let emoji = '';
  
  if (total >= 23) {
    grade = 'Excellent';
    feedback = 'Excellent — terminal velocity fully understood!';
    emoji = '🏆';
    el.modalGradeBanner.style.background = 'var(--accent-green)';
    el.modalGradeBanner.style.color = '#fff';
  } else if (total >= 16) {
    grade = 'Good';
    feedback = 'Good — review the stages of fall and what happens to forces.';
    emoji = '👍';
    el.modalGradeBanner.style.background = 'var(--accent-yellow)';
    el.modalGradeBanner.style.color = '#000';
  } else {
    grade = 'Needs Practice';
    feedback = 'Needs practice — watch the animation again with air resistance ON, focus on the force arrows.';
    emoji = '📚';
    el.modalGradeBanner.style.background = 'var(--accent-red)';
    el.modalGradeBanner.style.color = '#fff';
  }
  
  el.modalEmoji.textContent = emoji;
  el.modalGradeBanner.textContent = grade;
  el.modalFeedbackText.textContent = feedback;
  
  el.resultsModal.classList.remove('hidden');
}

// Reset Buttons
el.btnResetAll.addEventListener('click', () => {
  if (confirm("Are you sure you want to reset all quiz scores?")) {
    initQuizzes();
    updateTotalScoreDisplay();
  }
});

el.btnModalRestart.addEventListener('click', () => {
  el.resultsModal.classList.add('hidden');
  initQuizzes();
  updateTotalScoreDisplay();
});

el.btnCloseModal.addEventListener('click', () => {
  el.resultsModal.classList.add('hidden');
});

el.btnModalCloseAction.addEventListener('click', () => {
  el.resultsModal.classList.add('hidden');
});

// --- Helper Functions ---

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
