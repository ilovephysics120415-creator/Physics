// Global Variables
let currentSection = 'intro';
let introAnimationId = null;
let simCanvas, simCtx;
let introCanvas, introCtx;

// Simulator parameters
let currentMedium = 'water';
let refractiveIndices = { water: 1.33, glass: 1.50, diamond: 2.42 };
let incidenceAngle = 0; // degrees

// Drag and drop state
const dragAdvantages = [
  { id: 'tile-1', text: 'Fast data transmission', zones: ['telecom'] },
  { id: 'tile-2', text: 'Minimal signal loss', zones: ['telecom', 'medicine'] },
  { id: 'tile-3', text: 'Immune to electrical interference', zones: ['telecom'] },
  { id: 'tile-4', text: 'Small/flexible for use inside the body', zones: ['medicine'] },
  { id: 'tile-5', text: 'Allows internal examination without surgery', zones: ['medicine'] }
];
let activeDragTile = null;

// Flashcards state
const baseFlashcards = [
  { category: 'Definition', front: 'Critical Angle', back: 'The angle of incidence in an optically denser medium for which the angle of refraction in the less dense medium is 90°.' },
  { category: 'Definition', front: 'Total Internal Reflection (TIR)', back: 'The complete reflection of a light ray back into its original optically denser medium when it hits the boundary with a less dense medium.' },
  { category: 'Conditions', front: 'Conditions for TIR', back: '1. The light ray must travel from an optically denser medium towards a less dense medium.\n2. The angle of incidence must be greater than the critical angle (i > c).' },
  { category: 'Formula', front: 'Relationship between n and c', back: 'sin c = 1/n\nWhere c is the critical angle, and n is the refractive index of the denser medium (with respect to air/vacuum).' },
  { category: 'Applications', front: 'Advantages of Optical Fibres', back: 'Telecommunications: High bandwidth (fast data), low attenuation (minimal loss), immune to noise.\nMedicine: Small, flexible, allows bright light and clear image transmission via endoscopy.' }
];
let flashcards = [...baseFlashcards];
let currentCardIndex = 0;
let cardFlipped = false;

// Quiz State
let quizQuestions = [];
let currentQuizIndex = 0;
let quizScore = 0;
let quizQuestionsSelected = [];

// 1. App Section Switching
function switchSection(sectionId) {
  document.querySelectorAll('.app-section').forEach(sec => sec.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  
  document.getElementById(`section-${sectionId}`).classList.add('active');
  document.getElementById(`tab-${sectionId}`).classList.add('active');
  
  currentSection = sectionId;
  
  // Clean up and trigger animations
  if (introAnimationId) {
    cancelAnimationFrame(introAnimationId);
    introAnimationId = null;
  }
  
  if (sectionId === 'intro') {
    startIntroAnimation();
  } else if (sectionId === 'sim') {
    initSimulator();
  }
}

// 2. Section 1: Concept Introduction Animation
function startIntroAnimation() {
  introCanvas = document.getElementById('introCanvas');
  if (!introCanvas) return;
  introCtx = introCanvas.getContext('2d');
  
  // Set dimensions
  const dpr = window.devicePixelRatio || 1;
  const rect = introCanvas.getBoundingClientRect();
  introCanvas.width = rect.width * dpr;
  introCanvas.height = rect.height * dpr;
  introCtx.scale(dpr, dpr);
  
  const width = rect.width;
  const height = rect.height;
  
  let startTime = null;
  const duration = 5000; // 5 seconds loop
  
  function drawFrame(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = (timestamp - startTime) % duration;
    const progress = elapsed / duration;
    
    // Sweep incidence angle from 15 to 65 degrees
    const minAngle = 15;
    const maxAngle = 65;
    const currentIncidence = minAngle + (maxAngle - minAngle) * progress;
    
    // Physics
    const n = 1.50; // Glass
    const c = Math.asin(1 / n) * (180 / Math.PI); // approx 41.8
    
    introCtx.clearRect(0, 0, width, height);
    
    // Draw Background Mediums
    // Upper half: Air (less dense)
    introCtx.fillStyle = '#0f172a';
    introCtx.fillRect(0, 0, width, height / 2);
    
    // Lower half: Glass (denser)
    introCtx.fillStyle = 'rgba(0, 243, 255, 0.04)';
    introCtx.fillRect(0, height / 2, width, height / 2);
    
    // Boundary line
    introCtx.strokeStyle = 'rgba(0, 243, 255, 0.2)';
    introCtx.lineWidth = 2;
    introCtx.beginPath();
    introCtx.moveTo(0, height / 2);
    introCtx.lineTo(width, height / 2);
    introCtx.stroke();
    
    // Labels
    introCtx.fillStyle = '#64748b';
    introCtx.font = '11px sans-serif';
    introCtx.fillText('Air (n = 1.00)', 15, 25);
    introCtx.fillText('Glass (n = 1.50)', 15, height - 15);
    
    // Normal line
    introCtx.strokeStyle = '#ffee00';
    introCtx.lineWidth = 1;
    introCtx.setLineDash([4, 4]);
    introCtx.beginPath();
    introCtx.moveTo(width / 2, 10);
    introCtx.lineTo(width / 2, height - 10);
    introCtx.stroke();
    introCtx.setLineDash([]);
    introCtx.fillStyle = '#ffee00';
    introCtx.fillText('Normal', width / 2 + 6, 20);
    
    // Incident Ray (Lower half, moving up to center)
    const centerX = width / 2;
    const centerY = height / 2;
    const rayLength = Math.min(width, height) * 0.4;
    
    const incRad = currentIncidence * (Math.PI / 180);
    const fromX = centerX - rayLength * Math.sin(incRad);
    const fromY = centerY + rayLength * Math.cos(incRad);
    
    // Draw Incident Ray
    introCtx.strokeStyle = '#00f3ff';
    introCtx.lineWidth = 3;
    introCtx.beginPath();
    introCtx.moveTo(fromX, fromY);
    introCtx.lineTo(centerX, centerY);
    introCtx.stroke();
    
    // Arrow on incident ray
    drawArrow(introCtx, fromX, fromY, centerX, centerY, '#00f3ff');
    
    const banner = document.getElementById('intro-banner-text');
    
    if (currentIncidence < c) {
      // 1. Refraction
      const refRad = Math.asin(n * Math.sin(incRad));
      const toX = centerX + rayLength * Math.sin(refRad);
      const toY = centerY - rayLength * Math.cos(refRad);
      
      // Refracted ray (strong cyan)
      introCtx.strokeStyle = '#00f3ff';
      introCtx.beginPath();
      introCtx.moveTo(centerX, centerY);
      introCtx.lineTo(toX, toY);
      introCtx.stroke();
      drawArrow(introCtx, centerX, centerY, toX, toY, '#00f3ff');
      
      // Weak reflected ray (faint cyan)
      const refldX = centerX + rayLength * Math.sin(incRad);
      const refldY = centerY + rayLength * Math.cos(incRad);
      introCtx.strokeStyle = 'rgba(0, 243, 255, 0.2)';
      introCtx.beginPath();
      introCtx.moveTo(centerX, centerY);
      introCtx.lineTo(refldX, refldY);
      introCtx.stroke();
      
      if (banner) banner.textContent = `i = ${currentIncidence.toFixed(0)}° < C: Normal Refraction`;
    } else if (Math.abs(currentIncidence - c) < 1.0) {
      // 2. Critical Angle
      // Refracted ray along boundary (90 degrees)
      introCtx.strokeStyle = '#ffee00';
      introCtx.lineWidth = 4;
      introCtx.beginPath();
      introCtx.moveTo(centerX, centerY);
      introCtx.lineTo(centerX + rayLength, centerY);
      introCtx.stroke();
      
      if (banner) banner.textContent = `i = C ≈ 42°: Critical Angle (r = 90°)`;
    } else {
      // 3. Total Internal Reflection
      const refldX = centerX + rayLength * Math.sin(incRad);
      const refldY = centerY + rayLength * Math.cos(incRad);
      
      // Strong reflected ray inside denser medium
      introCtx.strokeStyle = '#00f3ff';
      introCtx.lineWidth = 3;
      introCtx.beginPath();
      introCtx.moveTo(centerX, centerY);
      introCtx.lineTo(refldX, refldY);
      introCtx.stroke();
      drawArrow(introCtx, centerX, centerY, refldX, refldY, '#00f3ff');
      
      if (banner) banner.textContent = `i = ${currentIncidence.toFixed(0)}° > C: Total Internal Reflection Only!`;
    }
    
    introAnimationId = requestAnimationFrame(drawFrame);
  }
  
  introAnimationId = requestAnimationFrame(drawFrame);
}

// Utility: Draw arrow on a ray
function drawArrow(ctx, fromx, fromy, tox, toy, color) {
  const dx = tox - fromx;
  const dy = toy - fromy;
  const angle = Math.atan2(dy, dx);
  const midX = fromx + dx * 0.5;
  const midY = fromy + dy * 0.5;
  
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(midX, midY);
  ctx.lineTo(midX - 10 * Math.cos(angle - Math.PI / 6), midY - 10 * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(midX - 10 * Math.cos(angle + Math.PI / 6), midY - 10 * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
}

// 3. Section 2: Interactive Exploration Simulator
function initSimulator() {
  simCanvas = document.getElementById('simCanvas');
  if (!simCanvas) return;
  simCtx = simCanvas.getContext('2d');
  
  // Set dimensions
  const dpr = window.devicePixelRatio || 1;
  const rect = simCanvas.getBoundingClientRect();
  simCanvas.width = rect.width * dpr;
  simCanvas.height = rect.height * dpr;
  simCtx.scale(dpr, dpr);
  
  renderSimulator();
}

// State variables for exploration problem mode
let exploreProblemActive = false;
let hiddenVariables = [];
let exploreCalculatedValues = {};

function selectMedium(medium) {
  if (exploreProblemActive) {
    exitExploreProblemMode();
  }
  currentMedium = medium;
  document.querySelectorAll('.medium-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`btn-${medium}`).classList.add('active');
  
  // Reset or adjust slider if needed
  renderSimulator();
}

function updateIncidence(val) {
  if (exploreProblemActive) {
    exitExploreProblemMode();
  }
  incidenceAngle = parseFloat(val);
  document.getElementById('val-incidence').textContent = `${incidenceAngle.toFixed(1)}°`;
  renderSimulator();
}

function exitExploreProblemMode() {
  exploreProblemActive = false;
  hiddenVariables = [];
  
  // Re-enable slider
  document.getElementById('slider-incidence').disabled = false;
  
  // Hide all input textboxes
  const variables = ['n', 'incidence', 'refraction', 'critical'];
  variables.forEach(v => {
    const el = document.getElementById(`input-${v}`);
    if (el) el.style.display = 'none';
  });
  
  // Hide panels
  document.getElementById('btn-show-working').style.display = 'none';
  document.getElementById('explore-working-panel').style.display = 'none';
}

function updateExploreValueDisplay(varName, normalText) {
  const valEl = document.getElementById(`val-${varName}`);
  const inputEl = document.getElementById(`input-${varName}`);
  
  if (exploreProblemActive && hiddenVariables.includes(varName)) {
    valEl.textContent = '?';
    inputEl.style.display = 'inline-block';
  } else {
    valEl.textContent = normalText;
    if (inputEl) inputEl.style.display = 'none';
  }
}

function renderSimulator() {
  if (!simCanvas || !simCtx) return;
  
  const width = simCanvas.width / (window.devicePixelRatio || 1);
  const height = simCanvas.height / (window.devicePixelRatio || 1);
  
  const n = refractiveIndices[currentMedium];
  const criticalAngle = Math.asin(1 / n) * (180 / Math.PI);
  const incRad = incidenceAngle * (Math.PI / 180);
  
  // Pre-calculate exact values for problem checks
  let refractionValText = '0.0°';
  let refractionNumericValue = 0;
  if (incidenceAngle < criticalAngle - 0.5) {
    const sinRef = n * Math.sin(incRad);
    const refRad = Math.asin(sinRef);
    refractionNumericValue = refRad * 180 / Math.PI;
    refractionValText = `${refractionNumericValue.toFixed(1)}°`;
  } else if (Math.abs(incidenceAngle - criticalAngle) <= 0.5) {
    refractionNumericValue = 90.0;
    refractionValText = '90.0°';
  } else {
    refractionNumericValue = null; // TIR
    refractionValText = 'None (TIR)';
  }
  
  // Store values for verification
  exploreCalculatedValues = {
    n: n,
    incidence: incidenceAngle,
    refraction: refractionNumericValue,
    critical: criticalAngle
  };
  
  // Update HTML display
  updateExploreValueDisplay('n', n.toFixed(2));
  updateExploreValueDisplay('critical', `${criticalAngle.toFixed(1)}°`);
  updateExploreValueDisplay('incidence', `${incidenceAngle.toFixed(1)}°`);
  updateExploreValueDisplay('refraction', refractionValText);
  
  simCtx.clearRect(0, 0, width, height);
  
  // Draw Background Mediums
  // Upper half: Air (less dense)
  simCtx.fillStyle = '#0f172a';
  simCtx.fillRect(0, 0, width, height / 2);
  
  // Lower half: Selectable medium (denser)
  if (currentMedium === 'water') {
    simCtx.fillStyle = 'rgba(0, 243, 255, 0.05)';
  } else if (currentMedium === 'glass') {
    simCtx.fillStyle = 'rgba(0, 243, 255, 0.09)';
  } else if (currentMedium === 'diamond') {
    simCtx.fillStyle = 'rgba(0, 243, 255, 0.15)';
  }
  simCtx.fillRect(0, height / 2, width, height / 2);
  
  // Boundary line
  simCtx.strokeStyle = 'rgba(0, 243, 255, 0.3)';
  simCtx.lineWidth = 2;
  simCtx.beginPath();
  simCtx.moveTo(0, height / 2);
  simCtx.lineTo(width, height / 2);
  simCtx.stroke();
  
  // Labels
  simCtx.fillStyle = '#64748b';
  simCtx.font = '12px sans-serif';
  simCtx.fillText('Air (n = 1.00)', 15, 25);
  
  if (exploreProblemActive && hiddenVariables.includes('n')) {
    simCtx.fillText(`${currentMedium.charAt(0).toUpperCase() + currentMedium.slice(1)}`, 15, height - 15);
  } else {
    simCtx.fillText(`${currentMedium.charAt(0).toUpperCase() + currentMedium.slice(1)} (n = ${n.toFixed(2)})`, 15, height - 15);
  }
  
  // Normal line
  simCtx.strokeStyle = '#ffee00';
  simCtx.lineWidth = 1;
  simCtx.setLineDash([6, 4]);
  simCtx.beginPath();
  simCtx.moveTo(width / 2, 15);
  simCtx.lineTo(width / 2, height - 15);
  simCtx.stroke();
  simCtx.setLineDash([]);
  
  simCtx.fillStyle = '#ffee00';
  simCtx.font = '10px sans-serif';
  simCtx.fillText('Normal', width / 2 + 8, 25);
  
  // Ray Calculation
  const centerX = width / 2;
  const centerY = height / 2;
  const rayLength = Math.min(width, height) * 0.42;
  
  // Incident Ray (Starts in lower half)
  const fromX = centerX - rayLength * Math.sin(incRad);
  const fromY = centerY + rayLength * Math.cos(incRad);
  
  simCtx.strokeStyle = '#00f3ff';
  simCtx.lineWidth = 3;
  simCtx.beginPath();
  simCtx.moveTo(fromX, fromY);
  simCtx.lineTo(centerX, centerY);
  simCtx.stroke();
  drawArrow(simCtx, fromX, fromY, centerX, centerY, '#00f3ff');
  
  const behaviorEl = document.getElementById('val-behavior');
  
  if (incidenceAngle < criticalAngle - 0.5) {
    // 1. Normal Refraction
    const sinRef = n * Math.sin(incRad);
    const refRad = Math.asin(sinRef);
    const toX = centerX + rayLength * Math.sin(refRad);
    const toY = centerY - rayLength * Math.cos(refRad);
    
    // Refracted ray
    simCtx.strokeStyle = '#00f3ff';
    simCtx.beginPath();
    simCtx.moveTo(centerX, centerY);
    simCtx.lineTo(toX, toY);
    simCtx.stroke();
    drawArrow(simCtx, centerX, centerY, toX, toY, '#00f3ff');
    
    // Faint reflected ray (natural partial reflection)
    const refldX = centerX + rayLength * Math.sin(incRad);
    const refldY = centerY + rayLength * Math.cos(incRad);
    simCtx.strokeStyle = 'rgba(0, 243, 255, 0.15)';
    simCtx.lineWidth = 1.5;
    simCtx.beginPath();
    simCtx.moveTo(centerX, centerY);
    simCtx.lineTo(refldX, refldY);
    simCtx.stroke();
    
    behaviorEl.textContent = 'Refraction + Weak Reflection';
    behaviorEl.style.color = '#00f3ff';
  } else if (Math.abs(incidenceAngle - criticalAngle) <= 0.5) {
    // 2. Critical Angle Reached
    simCtx.strokeStyle = '#ffee00';
    simCtx.lineWidth = 4;
    simCtx.beginPath();
    simCtx.moveTo(centerX, centerY);
    simCtx.lineTo(centerX + rayLength, centerY);
    simCtx.stroke();
    
    // Faint reflected ray
    const refldX = centerX + rayLength * Math.sin(incRad);
    const refldY = centerY + rayLength * Math.cos(incRad);
    simCtx.strokeStyle = 'rgba(0, 243, 255, 0.25)';
    simCtx.lineWidth = 2;
    simCtx.beginPath();
    simCtx.moveTo(centerX, centerY);
    simCtx.lineTo(refldX, refldY);
    simCtx.stroke();
    
    behaviorEl.textContent = 'Critical Angle Reached!';
    behaviorEl.style.color = '#ffee00';
  } else {
    // 3. Total Internal Reflection Only
    const refldX = centerX + rayLength * Math.sin(incRad);
    const refldY = centerY + rayLength * Math.cos(incRad);
    
    simCtx.strokeStyle = '#00f3ff';
    simCtx.lineWidth = 3.5;
    simCtx.beginPath();
    simCtx.moveTo(centerX, centerY);
    simCtx.lineTo(refldX, refldY);
    simCtx.stroke();
    drawArrow(simCtx, centerX, centerY, refldX, refldY, '#00f3ff');
    
    behaviorEl.textContent = 'Total Internal Reflection';
    behaviorEl.style.color = '#00f3ff';
  }
}

function randomiseExploreProblem() {
  exploreProblemActive = true;
  
  // 1. Pick a random medium
  const mediums = ['water', 'glass', 'diamond'];
  currentMedium = mediums[Math.floor(Math.random() * mediums.length)];
  
  document.querySelectorAll('.medium-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`btn-${currentMedium}`).classList.add('active');
  
  const n = refractiveIndices[currentMedium];
  const criticalAngle = Math.asin(1 / n) * (180 / Math.PI);
  
  // 2. Choose a random incidence angle safely below critical angle
  const maxI = Math.floor(criticalAngle - 5);
  const minI = 15;
  incidenceAngle = parseFloat((Math.random() * (maxI - minI) + minI).toFixed(1));
  
  // 3. Pick 2 random variables to hide
  const variables = ['n', 'incidence', 'refraction', 'critical'];
  hiddenVariables = [];
  while (hiddenVariables.length < 2) {
    const v = variables[Math.floor(Math.random() * variables.length)];
    if (!hiddenVariables.includes(v)) {
      hiddenVariables.push(v);
    }
    // Avoid hiding both incidence and refraction simultaneously
    if (hiddenVariables.length === 2 && 
        hiddenVariables.includes('incidence') && 
        hiddenVariables.includes('refraction')) {
      hiddenVariables = []; // Reset and pick again
    }
  }
  
  const slider = document.getElementById('slider-incidence');
  slider.value = incidenceAngle;
  slider.disabled = hiddenVariables.includes('incidence'); // Disable and grey out slider only if angle of incidence is hidden
  
  // Clear any existing input values
  variables.forEach(v => {
    const el = document.getElementById(`input-${v}`);
    if (el) {
      el.value = '';
      el.className = 'explore-inline-input';
    }
  });
  
  // Reset working controls
  document.getElementById('explore-working-panel').style.display = 'none';
  document.getElementById('btn-show-working').style.display = 'inline-block';
  
  renderSimulator();
}

function verifyExploreInput(type) {
  const inputEl = document.getElementById(`input-${type}`);
  const userVal = parseFloat(inputEl.value);
  
  if (isNaN(userVal)) {
    inputEl.className = 'explore-inline-input';
    return;
  }
  
  const target = exploreCalculatedValues[type];
  if (target === null) return;
  
  // 2% O-Level tolerance
  const diff = Math.abs(userVal - target) / target;
  if (diff <= 0.02) {
    inputEl.className = 'explore-inline-input correct';
  } else {
    inputEl.className = 'explore-inline-input incorrect';
  }
}

function toggleExploreWorking() {
  const panel = document.getElementById('explore-working-panel');
  const visible = panel.style.display === 'block';
  
  if (visible) {
    panel.style.display = 'none';
  } else {
    const n = exploreCalculatedValues.n;
    const i = exploreCalculatedValues.incidence;
    const r = exploreCalculatedValues.refraction;
    const c = exploreCalculatedValues.critical;
    
    let workingHTML = `<h3>Worked Solutions:</h3><br>`;
    
    hiddenVariables.forEach(v => {
      if (v === 'n') {
        workingHTML += `
          <div class="step-card">
            <div class="step-num">Find Refractive Index (<span class="lowercase-var">n</span>)</div>
            <div class="step-detail">
              Use Snell's Law for light entering air from the medium:
              <br>n * sin(i) = sin(r)
              <br>n = sin(r) / sin(i)
              <br>n = sin(${r.toFixed(1)}°) / sin(${i.toFixed(1)}°)
              <br>n = ${Math.sin(r * Math.PI / 180).toFixed(4)} / ${Math.sin(i * Math.PI / 180).toFixed(4)}
              <br><strong>n = ${n.toFixed(2)}</strong>
            </div>
          </div>
        `;
      } else if (v === 'critical') {
        workingHTML += `
          <div class="step-card">
            <div class="step-num">Find Critical Angle (<span class="lowercase-var">c</span>)</div>
            <div class="step-detail">
              Use the critical angle formula:
              <br>sin c = 1/n
              <br>sin c = 1/${n.toFixed(2)} = ${(1/n).toFixed(4)}
              <br>c = sin⁻¹(${(1/n).toFixed(4)})
              <br><strong>c = ${c.toFixed(1)}°</strong>
            </div>
          </div>
        `;
      } else if (v === 'incidence') {
        workingHTML += `
          <div class="step-card">
            <div class="step-num">Find Angle of Incidence (<span class="lowercase-var">i</span>)</div>
            <div class="step-detail">
              Use Snell's Law:
              <br>n * sin(i) = sin(r)
              <br>sin(i) = sin(r) / n
              <br>sin(i) = sin(${r.toFixed(1)}°) / ${n.toFixed(2)} = ${(Math.sin(r * Math.PI / 180) / n).toFixed(4)}
              <br>i = sin⁻¹(${(Math.sin(r * Math.PI / 180) / n).toFixed(4)})
              <br><strong>i = ${i.toFixed(1)}°</strong>
            </div>
          </div>
        `;
      } else if (v === 'refraction') {
        workingHTML += `
          <div class="step-card">
            <div class="step-num">Find Angle of Refraction (<span class="lowercase-var">r</span>)</div>
            <div class="step-detail">
              Use Snell's Law:
              <br>n * sin(i) = sin(r)
              <br>sin(r) = ${n.toFixed(2)} * sin(${i.toFixed(1)}°)
              <br>sin(r) = ${n.toFixed(2)} * ${Math.sin(i * Math.PI / 180).toFixed(4)} = ${(n * Math.sin(i * Math.PI / 180)).toFixed(4)}
              <br>r = sin⁻¹(${(n * Math.sin(i * Math.PI / 180)).toFixed(4)})
              <br><strong>r = ${r.toFixed(1)}°</strong>
            </div>
          </div>
        `;
      }
    });
    
    document.getElementById('explore-working-content').innerHTML = workingHTML;
    panel.style.display = 'block';
  }
}

// 4. Section 3: Worked Examples Navigation
function switchExample(exNum) {
  document.querySelectorAll('.example-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('[id^="tab-ex"]').forEach(btn => btn.classList.remove('active'));
  
  document.getElementById(`example-${exNum}`).classList.add('active');
  document.getElementById(`tab-ex${exNum}`).classList.add('active');
}

// 5. Section 4: Drag and Drop Game
function resetDragAndDrop() {
  const container = document.getElementById('drag-tiles');
  const zoneTelecom = document.getElementById('zone-telecom');
  const zoneMedicine = document.getElementById('zone-medicine');
  const feedback = document.getElementById('drag-feedback');
  
  feedback.style.display = 'none';
  feedback.className = 'match-feedback';
  
  // Clear drop zones except title
  zoneTelecom.innerHTML = '<div class="drop-zone-title">Telecommunications</div>';
  zoneMedicine.innerHTML = '<div class="drop-zone-title">Medicine (Endoscopy)</div>';
  
  // Shuffle advantages
  const shuffled = [...dragAdvantages].sort(() => Math.random() - 0.5);
  container.innerHTML = '';
  
  shuffled.forEach(tile => {
    const tileEl = document.createElement('div');
    tileEl.className = 'drag-tile';
    tileEl.id = tile.id;
    tileEl.draggable = true;
    tileEl.textContent = tile.text;
    
    // Drag events
    tileEl.addEventListener('dragstart', handleDragStart);
    tileEl.addEventListener('dragend', handleDragEnd);
    
    // Touch support for mobile devices
    tileEl.addEventListener('touchstart', handleTouchStart, { passive: false });
    tileEl.addEventListener('touchmove', handleTouchMove, { passive: false });
    tileEl.addEventListener('touchend', handleTouchEnd);
    
    container.appendChild(tileEl);
  });
}

function handleDragStart(e) {
  activeDragTile = this;
  this.classList.add('dragging');
  e.dataTransfer.setData('text/plain', this.id);
}

function handleDragEnd() {
  this.classList.remove('dragging');
  activeDragTile = null;
}

function allowDrop(e) {
  e.preventDefault();
  e.currentTarget.classList.add('dragover');
}

function dragLeave(e) {
  e.currentTarget.classList.remove('dragover');
}

function handleDrop(e, targetZone) {
  e.preventDefault();
  const zoneEl = e.currentTarget;
  zoneEl.classList.remove('dragover');
  
  const tileId = e.dataTransfer.getData('text/plain');
  const tileEl = document.getElementById(tileId);
  
  processDrop(tileEl, targetZone, zoneEl);
}

function processDrop(tileEl, targetZone, zoneEl) {
  if (!tileEl) return;
  
  const advantage = dragAdvantages.find(a => a.id === tileEl.id);
  const feedback = document.getElementById('drag-feedback');
  
  // Check if tile is already placed in this specific zone
  if (zoneEl.querySelector(`#${tileEl.id}`)) {
    return;
  }
  
  if (advantage.zones.includes(targetZone)) {
    // Correct drop
    const clone = tileEl.cloneNode(true);
    clone.id = tileEl.id + '-clone-' + targetZone;
    clone.draggable = false;
    clone.style.cursor = 'default';
    zoneEl.appendChild(clone);
    
    // Check if the advantage has more valid zones
    const placedZonesCount = document.querySelectorAll(`[id^="${tileEl.id}-clone-"]`).length;
    if (placedZonesCount === advantage.zones.length) {
      // Fully placed everywhere, remove from source deck
      tileEl.remove();
    }
    
    feedback.textContent = `Correct! "${advantage.text}" is a valid advantage for ${targetZone === 'telecom' ? 'Telecommunications' : 'Medicine'}.`;
    feedback.className = 'match-feedback success';
    
    // Win condition check
    checkDragWin();
  } else {
    // Incorrect drop
    feedback.textContent = `Try again! "${advantage.text}" is not specifically relevant to ${targetZone === 'telecom' ? 'Telecommunications' : 'Medicine (Endoscopy)'}.`;
    feedback.className = 'match-feedback error';
  }
}

function checkDragWin() {
  const container = document.getElementById('drag-tiles');
  if (container.children.length === 0) {
    const feedback = document.getElementById('drag-feedback');
    feedback.textContent = 'Excellent! You successfully categorized all the advantages of optical fibres.';
    feedback.className = 'match-feedback success';
    triggerConfetti();
  }
}

// Touch events for mobile drag-and-drop support
let touchStartX = 0;
let touchStartY = 0;

function handleTouchStart(e) {
  activeDragTile = this;
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
  this.style.position = 'relative';
  this.style.zIndex = '1000';
}

function handleTouchMove(e) {
  if (!activeDragTile) return;
  e.preventDefault();
  const touch = e.touches[0];
  const dx = touch.clientX - touchStartX;
  const dy = touch.clientY - touchStartY;
  activeDragTile.style.transform = `translate(${dx}px, ${dy}px)`;
}

function handleTouchEnd(e) {
  if (!activeDragTile) return;
  activeDragTile.style.position = '';
  activeDragTile.style.zIndex = '';
  activeDragTile.style.transform = '';
  
  const touch = e.changedTouches[0];
  const targetEl = document.elementFromPoint(touch.clientX, touch.clientY);
  
  // Find drop zones
  const telecomZone = document.getElementById('zone-telecom');
  const medicineZone = document.getElementById('zone-medicine');
  
  if (telecomZone && telecomZone.contains(targetEl)) {
    processDrop(activeDragTile, 'telecom', telecomZone);
  } else if (medicineZone && medicineZone.contains(targetEl)) {
    processDrop(activeDragTile, 'medicine', medicineZone);
  }
  
  activeDragTile = null;
}

// 6. Section 5: Flashcard Revision Mode
function renderCard() {
  const card = flashcards[currentCardIndex];
  document.getElementById('card-category').textContent = card.category;
  document.getElementById('card-front-text').textContent = card.front;
  document.getElementById('card-back-text').innerHTML = card.back.replace(/\n/g, '<br>');
  
  // Reset rotation
  const wrapper = document.getElementById('flashcard-wrapper');
  wrapper.classList.remove('flipped');
  cardFlipped = false;
  
  document.getElementById('card-index-info').textContent = `Card ${currentCardIndex + 1} of ${flashcards.length}`;
}

function flipCard() {
  const wrapper = document.getElementById('flashcard-wrapper');
  cardFlipped = !cardFlipped;
  if (cardFlipped) {
    wrapper.classList.add('flipped');
  } else {
    wrapper.classList.remove('flipped');
  }
}

function executeCardAction(callback) {
  if (cardFlipped) {
    const wrapper = document.getElementById('flashcard-wrapper');
    wrapper.classList.remove('flipped');
    cardFlipped = false;
    setTimeout(callback, 300); // Wait for the flip animation to finish
  } else {
    callback();
  }
}

function nextCard() {
  executeCardAction(() => {
    currentCardIndex = (currentCardIndex + 1) % flashcards.length;
    renderCard();
  });
}

function prevCard() {
  executeCardAction(() => {
    currentCardIndex = (currentCardIndex - 1 + flashcards.length) % flashcards.length;
    renderCard();
  });
}

function shuffleFlashcards() {
  executeCardAction(() => {
    flashcards.sort(() => Math.random() - 0.5);
    currentCardIndex = 0;
    renderCard();
  });
}

// 7. Section 6: Challenge Quiz (30 questions)
function generateQuizPool() {
  const pool = [];
  
  // Type A: Calculation - Find Critical Angle
  const mediumPresets = [
    { name: 'Water', nMin: 1.30, nMax: 1.36 },
    { name: 'Glass', nMin: 1.45, nMax: 1.55 },
    { name: 'Diamond', nMin: 2.40, nMax: 2.45 }
  ];
  
  for (let i = 0; i < 7; i++) {
    const preset = mediumPresets[i % 3];
    const n = parseFloat((Math.random() * (preset.nMax - preset.nMin) + preset.nMin).toFixed(2));
    const c = Math.asin(1 / n) * (180 / Math.PI);
    pool.push({
      type: 'numeric',
      category: 'calculation',
      medium: preset.name.toLowerCase(),
      n: n,
      correctVal: parseFloat(c.toFixed(1)),
      question: `A sample of ${preset.name} has a refractive index of ${n.toFixed(2)}. Calculate its critical angle in degrees. (Round to 1 decimal place)`,
      formula: `sin c = 1/n`,
      substitution: `sin c = 1/${n.toFixed(2)} ≈ ${parseFloat((1/n).toFixed(4))}`,
      answerExplanation: `c = sin⁻¹(${parseFloat((1/n).toFixed(4))}) = ${c.toFixed(1)}°`
    });
  }
  
  // Type B: Calculation - Find Refractive Index
  for (let i = 0; i < 8; i++) {
    // Generate valid critical angle range 22 to 43
    const c = parseFloat((Math.random() * (43 - 22) + 22).toFixed(1));
    const n = 1 / Math.sin(c * Math.PI / 180);
    pool.push({
      type: 'numeric',
      category: 'calculation_reverse',
      c: c,
      correctVal: parseFloat(n.toFixed(2)),
      question: `The critical angle of a glass medium is measured to be ${c.toFixed(1)}°. Determine the refractive index of this medium. (Round to 2 decimal places)`,
      formula: `n = 1 / sin c`,
      substitution: `n = 1 / sin(${c.toFixed(1)}°) = 1 / ${Math.sin(c * Math.PI / 180).toFixed(4)}`,
      answerExplanation: `n = ${n.toFixed(2)}`
    });
  }
  
  // Type C: Conceptual Questions (MCQ) - 15 total to complete pool of 30
  const conceptualMCQs = [
    {
      type: 'mcq',
      question: 'Which of the following describes the behavior of a light ray at the critical angle?',
      options: [
        'It reflects completely inside the denser medium.',
        'It refracts into the less dense medium at an angle of 0°.',
        'It refracts along the boundary between the two media (r = 90°).',
        'It passes straight through without bending.'
      ],
      correctIndex: 2,
      explanation: 'At the critical angle, the angle of refraction is exactly 90°, meaning the refracted ray grazes along the boundary.'
    },
    {
      type: 'mcq',
      question: 'What are the two necessary conditions for total internal reflection to occur?',
      options: [
        'Light travels from less dense to denser medium, and i < critical angle.',
        'Light travels from denser to less dense medium, and i > critical angle.',
        'Light travels from denser to less dense medium, and i = critical angle.',
        'Light travels from less dense to denser medium, and i > critical angle.'
      ],
      correctIndex: 1,
      explanation: 'For TIR to occur, light must travel from a optically denser to a less dense medium, and the angle of incidence must exceed the critical angle.'
    },
    {
      type: 'mcq',
      question: 'In which of the following media pair can total internal reflection occur?',
      options: [
        'Travelling from Air to Water.',
        'Travelling from Water to Glass.',
        'Travelling from Glass to Air.',
        'Travelling from Vacuum to Diamond.'
      ],
      correctIndex: 2,
      explanation: 'TIR can only occur when light travels from a denser medium (Glass, n=1.50) to a less dense medium (Air, n=1.00).'
    },
    {
      type: 'mcq',
      question: 'An optical fibre has a core and a cladding. Which statement is correct regarding their refractive indices?',
      options: [
        'The core and cladding have identical refractive indices.',
        'The cladding has a higher refractive index than the core.',
        'The core has a higher refractive index than the cladding.',
        'The cladding is made of air.'
      ],
      correctIndex: 2,
      explanation: 'The core must have a higher refractive index than the cladding so that light meets the boundary with a less dense medium to undergo TIR.'
    },
    {
      type: 'mcq',
      question: 'Why are optical fibres used in medicine (endoscopes) to view internal organs?',
      options: [
        'They are rigid structures that hold the organs in place.',
        'They are small and flexible, enabling light transmission without surgery.',
        'They convert light energy into high-energy X-rays.',
        'They increase the speed of light inside the stomach.'
      ],
      correctIndex: 1,
      explanation: 'Endoscopes use flexible bundles of optical fibres to guide light inside and carry the images back out safely.'
    },
    {
      type: 'mcq',
      question: 'If the critical angle of a medium is 42°, what happens to a ray incident at 45°?',
      options: [
        'Normal refraction only.',
        'Partial refraction and partial reflection.',
        'Total Internal Reflection only.',
        'The ray is fully absorbed by the boundary.'
      ],
      correctIndex: 2,
      explanation: 'Since the angle of incidence (45°) is greater than the critical angle (42°), the light ray undergoes Total Internal Reflection.'
    },
    {
      type: 'mcq',
      question: 'Which line in a ray diagram is the reference line from which all angles of incidence and refraction are measured?',
      options: [
        'The boundary line.',
        'The incident ray itself.',
        'The normal, which is perpendicular to the boundary.',
        'The refracted ray.'
      ],
      correctIndex: 2,
      explanation: 'All angles in optics are measured relative to the Normal, which is an imaginary line perpendicular (90°) to the boundary.'
    },
    {
      type: 'mcq',
      question: 'In an optical fibre telecommunication link, what advantage do optical signals have over electrical signals in copper wires?',
      options: [
        'They are immune to electromagnetic interference.',
        'They travel slower, allowing easier tracking.',
        'They carry less data, making files safer.',
        'They require thicker and heavier cables.'
      ],
      correctIndex: 0,
      explanation: 'Light signals are immune to electrical and electromagnetic noise, making transmission clear and highly reliable.'
    },
    {
      type: 'mcq',
      question: 'If n increases, what happens to the critical angle of the medium?',
      options: [
        'The critical angle increases.',
        'The critical angle decreases.',
        'The critical angle remains constant.',
        'The critical angle doubles.'
      ],
      correctIndex: 1,
      explanation: 'Because sin c = 1/n, as n increases, sin c decreases, which means the critical angle c decreases.'
    },
    {
      type: 'mcq',
      question: 'Which formula correctly links critical angle (c) and refractive index (n)?',
      options: [
        'n = sin c',
        'sin c = n',
        'sin c = 1 / n',
        'c = 1 / sin n'
      ],
      correctIndex: 2,
      explanation: 'The O-Level standard relationship is sin c = 1/n.'
    },
    {
      type: 'mcq',
      question: 'In an endoscopy application, what is the role of the two separate optical fibre bundles?',
      options: [
        'One conducts electrical signals, the other conducts fluids.',
        'One guides light inside to illuminate, the other returns the image.',
        'One is for the left eye, the other is for the right eye.',
        'One is a backup in case the first one breaks.'
      ],
      correctIndex: 1,
      explanation: 'One bundle carries light down to light up the cavity, while the second coherent bundle carries the reflected image back to the doctor.'
    },
    {
      type: 'mcq',
      question: 'If light travels from water (n=1.33) into air, and the angle of incidence is 30°, what behavior is observed?',
      options: [
        'TIR, because 30° is greater than the critical angle.',
        'Normal refraction, bending towards the normal.',
        'Normal refraction, bending away from the normal.',
        'No change in direction.'
      ],
      correctIndex: 2,
      explanation: 'The critical angle for water is 48.8°. Since 30° < 48.8°, normal refraction occurs. Light bends away from the normal as it enters the less dense air.'
    },
    {
      type: 'mcq',
      question: 'When TIR occurs, what percentage of the incident light energy is reflected back into the medium?',
      options: [
        'Approximately 50%',
        'Approximately 90%',
        'Practically 100%',
        '0% (all refracted)'
      ],
      correctIndex: 2,
      explanation: 'Unlike silvered mirrors which absorb some light, TIR is a total reflection where 100% of light energy is reflected.'
    },
    {
      type: 'mcq',
      question: 'If a ray diagram shows a refracted ray grazing along the boundary, what is the angle of refraction?',
      options: [
        '0°',
        '45°',
        '90°',
        '180°'
      ],
      correctIndex: 2,
      explanation: 'Grazing the boundary means the refracted ray is parallel to the surface, which is exactly 90° from the normal.'
    },
    {
      type: 'mcq',
      question: 'Which of the following is NOT an advantage of optical fibres in communications?',
      options: [
        'Very high data transmission capacity.',
        'Low transmission losses over long distances.',
        'Copper conductors inside allow high electric current carrying.',
        'Sleek, lightweight, and space-saving cabling.'
      ],
      correctIndex: 2,
      explanation: 'Optical fibres are made of glass/silica and carry light, not electrical currents, so they do not contain copper conductors.'
    }
  ];
  
  // Combine all into the pool
  pool.push(...conceptualMCQs);
  quizQuestions = pool;
}

function startQuiz() {
  generateQuizPool();
  
  // Randomly select 10 questions from the 30-question pool
  quizQuestionsSelected = [...quizQuestions].sort(() => Math.random() - 0.5).slice(0, 10);
  
  currentQuizIndex = 0;
  quizScore = 0;
  
  document.getElementById('quiz-screen-start').style.display = 'none';
  document.getElementById('quiz-screen-results').style.display = 'none';
  document.getElementById('quiz-screen-play').style.display = 'block';
  
  loadQuizQuestion();
}

function loadQuizQuestion() {
  const q = quizQuestionsSelected[currentQuizIndex];
  
  document.getElementById('quiz-question-num').textContent = `Question ${currentQuizIndex + 1} of 10`;
  document.getElementById('quiz-score-live').textContent = `Score: ${quizScore}`;
  document.getElementById('quiz-progress-bar').style.width = `${(currentQuizIndex / 10) * 100}%`;
  
  document.getElementById('quiz-question-text').textContent = q.question;
  document.getElementById('quiz-solution-panel').style.display = 'none';
  
  const optionsContainer = document.getElementById('quiz-options-container');
  const numericContainer = document.getElementById('quiz-numeric-container');
  const numericInput = document.getElementById('quiz-numeric-input');
  
  optionsContainer.innerHTML = '';
  numericInput.value = '';
  
  if (q.type === 'mcq') {
    optionsContainer.style.display = 'flex';
    numericContainer.style.display = 'none';
    
    q.options.forEach((opt, index) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option';
      btn.textContent = opt;
      btn.onclick = () => selectMCQOption(index);
      optionsContainer.appendChild(btn);
    });
  } else {
    optionsContainer.style.display = 'none';
    numericContainer.style.display = 'flex';
  }
}

function selectMCQOption(selectedIndex) {
  const q = quizQuestionsSelected[currentQuizIndex];
  const optionsContainer = document.getElementById('quiz-options-container');
  const options = optionsContainer.children;
  
  // Disable options clicking
  for (let opt of options) {
    opt.disabled = true;
  }
  
  let isCorrect = selectedIndex === q.correctIndex;
  
  if (isCorrect) {
    quizScore++;
    options[selectedIndex].classList.add('correct');
    showSolution(true, q.explanation, q);
    triggerConfetti();
  } else {
    options[selectedIndex].classList.add('incorrect');
    options[q.correctIndex].classList.add('correct');
    showSolution(false, q.explanation, q);
  }
}

function submitNumericAnswer() {
  const q = quizQuestionsSelected[currentQuizIndex];
  const inputEl = document.getElementById('quiz-numeric-input');
  const userVal = parseFloat(inputEl.value);
  
  if (isNaN(userVal)) {
    alert('Please enter a valid numeric value.');
    return;
  }
  
  // Disable inputs
  inputEl.disabled = true;
  document.getElementById('quiz-submit-btn').disabled = true;
  
  const target = q.correctVal;
  // O-Level tolerance is 2%
  const difference = Math.abs(userVal - target) / target;
  const isCorrect = difference <= 0.02;
  
  let explanation = `Formula: ${q.formula}<br>Substitution: ${q.substitution}<br>Calculated Answer: <strong>${q.correctVal}</strong>`;
  
  if (isCorrect) {
    quizScore++;
    inputEl.style.borderColor = 'var(--accent-cyan)';
    inputEl.style.boxShadow = 'var(--shadow-neon-cyan)';
    showSolution(true, explanation, q);
    triggerConfetti();
  } else {
    inputEl.style.borderColor = 'var(--accent-yellow)';
    inputEl.style.boxShadow = 'var(--shadow-neon-yellow)';
    showSolution(false, explanation + `<br><span style="color: var(--accent-yellow)">Your input of ${userVal} was outside the acceptable range (${(target*0.98).toFixed(2)} to ${(target*1.02).toFixed(2)}).</span>`, q);
  }
}

function showSolution(isCorrect, explanation, questionObj) {
  const panel = document.getElementById('quiz-solution-panel');
  const statusEl = document.getElementById('quiz-solution-status');
  const explanationEl = document.getElementById('quiz-solution-explanation');
  const diagramEl = document.getElementById('quiz-solution-diagram');
  
  panel.style.display = 'block';
  
  if (isCorrect) {
    statusEl.textContent = 'Correct Answer!';
    statusEl.className = 'solution-status correct';
  } else {
    statusEl.textContent = 'Incorrect Answer';
    statusEl.className = 'solution-status incorrect';
  }
  
  explanationEl.innerHTML = explanation;
  
  // Render Dynamic SVG Diagram representing this specific question
  diagramEl.innerHTML = generateSolutionSVG(questionObj);
}

function generateSolutionSVG(q) {
  // We'll draw a generic clean SVG depicting the normal, boundary, and the physical scenario
  let rayColor = '#00f3ff';
  let isTIR = false;
  let textLabel = '';
  
  if (q.category === 'calculation') {
    isTIR = false; // We just show the critical boundary ray for explanation
    textLabel = `sin c = 1/n`;
  } else if (q.category === 'calculation_reverse') {
    isTIR = false;
    textLabel = `n = 1/sin c`;
  } else {
    // Conceptual
    isTIR = true;
    textLabel = 'TIR Scenario';
  }
  
  return `
    <svg width="280" height="130" viewBox="0 0 280 130">
      <!-- Mediums -->
      <rect x="0" y="65" width="280" height="65" fill="rgba(0, 243, 255, 0.05)" />
      <text x="10" y="20" fill="#64748b" font-size="10">Air (Less Dense)</text>
      <text x="10" y="115" fill="#94a3b8" font-size="10">Medium (Denser)</text>
      
      <!-- Normal Line -->
      <line x1="140" y1="10" x2="140" y2="120" stroke="#ffee00" stroke-width="1.2" stroke-dasharray="4 4" />
      <text x="145" y="22" fill="#ffee00" font-size="9">Normal</text>
      
      <!-- Boundary -->
      <line x1="0" y1="65" x2="280" y2="65" stroke="rgba(0,243,255,0.2)" stroke-width="1.5" />
      
      <!-- Incident Ray -->
      <line x1="80" y1="110" x2="140" y2="65" stroke="#00f3ff" stroke-width="2.5" />
      <polygon points="110,87.5 107,93.5 116,83" fill="#00f3ff" />
      
      <!-- Refracted/Reflected ray path -->
      ${isTIR ? `
        <!-- Total Internal Reflection -->
        <line x1="140" y1="65" x2="200" y2="110" stroke="#00f3ff" stroke-width="2.5" />
        <polygon points="170,87.5 173,93.5 164,83" fill="#00f3ff" />
        <text x="160" y="120" fill="#00f3ff" font-size="9">TIR</text>
      ` : `
        <!-- Critical/Refraction path -->
        <line x1="140" y1="65" x2="220" y2="65" stroke="#ffee00" stroke-width="3" />
        <text x="170" y="55" fill="#ffee00" font-size="9">r = 90°</text>
      `}
      
      <!-- Math Text Annotation -->
      <text x="10" y="50" fill="#94a3b8" font-size="10">${textLabel}</text>
    </svg>
  `;
}

function nextQuizQuestion() {
  // Re-enable input state
  document.getElementById('quiz-numeric-input').disabled = false;
  document.getElementById('quiz-submit-btn').disabled = false;
  
  currentQuizIndex++;
  
  if (currentQuizIndex < 10) {
    loadQuizQuestion();
  } else {
    // End Quiz
    showQuizResults();
  }
}

function showQuizResults() {
  document.getElementById('quiz-screen-play').style.display = 'none';
  const resultsScreen = document.getElementById('quiz-screen-results');
  resultsScreen.style.display = 'block';
  
  const percentage = (quizScore / 10) * 100;
  document.getElementById('quiz-final-score').textContent = `You scored ${quizScore}/10 (${percentage.toFixed(0)}%)`;
  
  const titleEl = document.getElementById('quiz-grade-title');
  const summaryEl = document.getElementById('quiz-results-summary');
  
  if (percentage === 100) {
    titleEl.textContent = 'Physics Master!';
    summaryEl.textContent = 'Fantastic! You answered every question perfectly. You are fully prepared for critical angle questions in your O-Level exam!';
    triggerConfetti();
  } else if (percentage >= 80) {
    titleEl.textContent = 'Physics Expert!';
    summaryEl.textContent = 'Great job! You have a solid grasp of the concepts and calculations. Review your minor mistakes and try again for a perfect score!';
  } else if (percentage >= 50) {
    titleEl.textContent = 'Competent Learner';
    summaryEl.textContent = 'Good effort. You understand the basic principles, but need more practice with calculations. Try reviewing the worked examples and attempt the quiz again!';
  } else {
    titleEl.textContent = 'Revision Needed';
    summaryEl.textContent = 'Don\'t worry, physics takes practice. Re-read the flashcards, experiment with the exploration slider to see how TIR transitions, and try again.';
  }
}

function restartQuiz() {
  startQuiz();
}

// 8. Celebration Confetti Mechanics
let confettiActive = false;
let confettiParticles = [];
const confettiColors = ['#00f3ff', '#ffee00', '#0099ff', '#ffffff'];

function triggerConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  // Set dimensions
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  confettiActive = true;
  confettiParticles = [];
  
  for (let i = 0; i < 60; i++) {
    confettiParticles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      r: Math.random() * 6 + 4,
      d: Math.random() * canvas.height,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      tilt: Math.random() * 10 - 5,
      tiltAngleIncremental: Math.random() * 0.07 + 0.02,
      tiltAngle: 0
    });
  }
  
  let animationTimer = 0;
  
  function drawConfetti() {
    if (!confettiActive) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let finished = true;
    
    confettiParticles.forEach((p, index) => {
      p.tiltAngle += p.tiltAngleIncremental;
      p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
      p.x += Math.sin(p.tiltAngle);
      p.tilt = Math.sin(p.tiltAngle - index / 3) * 15;
      
      if (p.y <= canvas.height) {
        finished = false;
      }
      
      ctx.beginPath();
      ctx.lineWidth = p.r;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
      ctx.stroke();
    });
    
    animationTimer++;
    
    if (finished || animationTimer > 180) {
      confettiActive = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    } else {
      requestAnimationFrame(drawConfetti);
    }
  }
  
  requestAnimationFrame(drawConfetti);
}

// Window resizing
window.addEventListener('resize', () => {
  if (currentSection === 'intro') {
    startIntroAnimation();
  } else if (currentSection === 'sim') {
    initSimulator();
  }
});

// App Initialization on load
window.addEventListener('DOMContentLoaded', () => {
  startIntroAnimation();
  resetDragAndDrop();
  renderCard();
});
