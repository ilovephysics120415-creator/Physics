// Color Palette
const COLORS = {
  bgPrimary: '#0a0e17',
  bgSecondary: '#121824',
  cyan: '#00f0ff',
  yellow: '#ffd700',
  textSecondary: '#a0aec0',
  white: '#ffffff',
  red: '#ff4d4d' // Colorblind-friendly red accent only used for warnings if needed, else yellow/cyan
};

// Global App State
let currentSection = 'section-intro';
let selectedPair = 'air-water'; // 'air-water', 'air-glass', 'water-glass'
let lightGoesToDenser = true; // true = Air -> Denser, false = Denser -> Air
let incidenceAngle = 30; // degrees
let hiddenUnknown = null; // 'n', 'theta1', 'theta2', or null
let isWorkingRevealed = false;

// Refractive indices for sandbox
const N_VALUES = {
  air: 1.00,
  water: 1.33,
  glass: 1.50,
  diamond: 2.42
};

// Get active mediums based on selectedPair and direction
function getMediums() {
  let lessDense, denser;
  if (selectedPair === 'air-water') {
    lessDense = { name: 'Air', n: N_VALUES.air };
    denser = { name: 'Water', n: N_VALUES.water };
  } else if (selectedPair === 'air-glass') {
    lessDense = { name: 'Air', n: N_VALUES.air };
    denser = { name: 'Glass', n: N_VALUES.glass };
  } else {
    lessDense = { name: 'Water', n: N_VALUES.water };
    denser = { name: 'Glass', n: N_VALUES.glass };
  }

  if (lightGoesToDenser) {
    return { from: lessDense, to: denser };
  } else {
    return { from: denser, to: lessDense };
  }
}

// ----------------------------------------------------
// Section Routing
// ----------------------------------------------------
function switchSection(sectionId) {
  document.querySelectorAll('section').forEach(sec => sec.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  
  const targetSection = document.getElementById(sectionId);
  if (targetSection) targetSection.classList.add('active');
  
  // Find nav button mapping to sectionId
  const navBtnId = 'nav-' + sectionId.replace('section-', '');
  const targetNavBtn = document.getElementById(navBtnId);
  if (targetNavBtn) targetNavBtn.classList.add('active');
  
  currentSection = sectionId;

  // Initial draw/triggers when section becomes active
  if (sectionId === 'section-intro') {
    initIntroAnimation();
  } else if (sectionId === 'section-exploration') {
    drawSandbox();
  } else if (sectionId === 'section-examples') {
    drawExampleDiagrams();
  } else if (sectionId === 'section-quiz') {
    initQuiz();
  }
}

// ----------------------------------------------------
// Canvas Utilities
// ----------------------------------------------------
function resizeCanvasToDisplaySize(canvas) {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    return true;
  }
  return false;
}

// Draw a simple arrow indicating ray direction
function drawArrow(ctx, fromX, fromY, toX, toY, color) {
  const dx = toX - fromX;
  const dy = toY - fromY;
  const angle = Math.atan2(dy, dx);
  const midX = fromX + dx * 0.5;
  const midY = fromY + dy * 0.5;
  
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(midX, midY);
  ctx.lineTo(midX - 12 * Math.cos(angle - Math.PI / 6), midY - 12 * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(midX - 12 * Math.cos(angle + Math.PI / 6), midY - 12 * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
}

// ----------------------------------------------------
// Section 1: Concept Introduction Loop
// ----------------------------------------------------
let introAnimId = null;
function initIntroAnimation() {
  const canvas = document.getElementById('intro-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  if (introAnimId) {
    cancelAnimationFrame(introAnimId);
  }
  
  let startTime = null;

  function animate(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = (timestamp - startTime) / 1000; // seconds
    const loopTime = elapsed % 5; // 5-second loop
    
    resizeCanvasToDisplaySize(canvas);
    const w = canvas.width;
    const h = canvas.height;
    
    // Clear and draw background
    ctx.fillStyle = COLORS.bgSecondary;
    ctx.fillRect(0, 0, w, h);
    
    const boundaryY = h / 2;
    
    // Draw Denser Medium (bottom half)
    ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
    ctx.fillRect(0, boundaryY, w, h - boundaryY);
    
    // Draw boundary line
    ctx.strokeStyle = COLORS.textSecondary;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, boundaryY);
    ctx.lineTo(w, boundaryY);
    ctx.stroke();
    
    // Draw Normal line (dashed)
    ctx.strokeStyle = '#ffffff';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(w / 2, 20);
    ctx.lineTo(w / 2, h - 20);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Normal Text
    ctx.fillStyle = COLORS.white;
    ctx.font = '12px Outfit';
    ctx.fillText('Normal', w / 2 + 10, 35);
    
    // Medium Texts
    ctx.fillStyle = COLORS.textSecondary;
    ctx.fillText('Air (n = 1.00)', 20, boundaryY - 20);
    ctx.fillStyle = COLORS.cyan;
    ctx.fillText('Water (n = 1.33)', 20, boundaryY + 30);
    
    // Ray Calculations
    const incidentAngleRad = 45 * Math.PI / 180;
    const refractionAngleRad = Math.asin(Math.sin(incidentAngleRad) / 1.33);
    
    // Normal intersection
    const cx = w / 2;
    const cy = boundaryY;
    
    // Determine drawing lengths
    const len = Math.min(w, h) * 0.4;
    
    const incidentX = cx - len * Math.sin(incidentAngleRad);
    const incidentY = cy - len * Math.cos(incidentAngleRad);
    
    const refractedX = cx + len * Math.sin(refractionAngleRad);
    const refractedY = cy + len * Math.cos(refractionAngleRad);
    
    // Draw Ray path based on animation time
    ctx.lineWidth = 3;
    
    if (loopTime < 2) {
      // Light entering
      const progress = loopTime / 2;
      const rx = incidentX + (cx - incidentX) * progress;
      const ry = incidentY + (cy - incidentY) * progress;
      ctx.strokeStyle = COLORS.yellow;
      ctx.beginPath();
      ctx.moveTo(incidentX, incidentY);
      ctx.lineTo(rx, ry);
      ctx.stroke();
      if (progress > 0.2) drawArrow(ctx, incidentX, incidentY, rx, ry, COLORS.yellow);
    } else if (loopTime < 4) {
      // Light refracted
      const progress = (loopTime - 2) / 2;
      ctx.strokeStyle = COLORS.yellow;
      ctx.beginPath();
      ctx.moveTo(incidentX, incidentY);
      ctx.lineTo(cx, cy);
      ctx.stroke();
      drawArrow(ctx, incidentX, incidentY, cx, cy, COLORS.yellow);
      
      const rx = cx + (refractedX - cx) * progress;
      const ry = cy + (refractedY - cy) * progress;
      ctx.strokeStyle = COLORS.cyan;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(rx, ry);
      ctx.stroke();
      if (progress > 0.2) drawArrow(ctx, cx, cy, rx, ry, COLORS.cyan);
    } else {
      // Fully drawn state before resetting
      ctx.strokeStyle = COLORS.yellow;
      ctx.beginPath();
      ctx.moveTo(incidentX, incidentY);
      ctx.lineTo(cx, cy);
      ctx.stroke();
      drawArrow(ctx, incidentX, incidentY, cx, cy, COLORS.yellow);
      
      ctx.strokeStyle = COLORS.cyan;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(refractedX, refractedY);
      ctx.stroke();
      drawArrow(ctx, cx, cy, refractedX, refractedY, COLORS.cyan);
    }
    
    // Draw Angles
    ctx.strokeStyle = COLORS.yellow;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 30, -Math.PI / 2, -Math.PI / 2 - incidentAngleRad, true);
    ctx.stroke();
    ctx.fillStyle = COLORS.yellow;
    ctx.fillText('i = 45°', cx - 25, cy - 35);
    
    ctx.strokeStyle = COLORS.cyan;
    ctx.beginPath();
    ctx.arc(cx, cy, 30, Math.PI / 2, Math.PI / 2 - refractionAngleRad, true);
    ctx.stroke();
    ctx.fillStyle = COLORS.cyan;
    ctx.fillText('r = 32°', cx + 10, cy + 45);
    
    introAnimId = requestAnimationFrame(animate);
  }
  
  introAnimId = requestAnimationFrame(animate);
}

// ----------------------------------------------------
// Section 2: Interactive Exploration Sandbox
// ----------------------------------------------------
const sliderIncidence = document.getElementById('slider-incidence');
if (sliderIncidence) {
  sliderIncidence.addEventListener('input', (e) => {
    incidenceAngle = parseInt(e.target.value);
    document.getElementById('lbl-angle').innerText = incidenceAngle + '°';
    drawSandbox();
  });
}

function setMediumPair(pair) {
  selectedPair = pair;
  document.querySelectorAll('.media-grid .btn-choice').forEach(btn => btn.classList.remove('active'));
  document.getElementById('pair-' + pair).classList.add('active');
  
  // Update name labels
  const meds = getMediums();
  document.getElementById('lbl-medium-pair').innerText = meds.from.name + ' to ' + meds.to.name;
  
  drawSandbox();
}

function setDirection(toDenser) {
  lightGoesToDenser = toDenser;
  document.querySelectorAll('.direction-toggle .toggle-btn').forEach(btn => btn.classList.remove('active'));
  if (toDenser) {
    document.getElementById('dir-forward').classList.add('active');
  } else {
    document.getElementById('dir-backward').classList.add('active');
  }
  
  const meds = getMediums();
  document.getElementById('lbl-medium-pair').innerText = meds.from.name + ' to ' + meds.to.name;
  
  drawSandbox();
}

function drawSandbox() {
  const canvas = document.getElementById('sandbox-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  resizeCanvasToDisplaySize(canvas);
  
  const w = canvas.width;
  const h = canvas.height;
  const boundaryY = h / 2;
  const cx = w / 2;
  const cy = boundaryY;
  
  // Clear and background
  ctx.fillStyle = COLORS.bgSecondary;
  ctx.fillRect(0, 0, w, h);
  
  const meds = getMediums();
  const n1 = meds.from.n;
  const n2 = meds.to.n;
  
  // Calculate critical angle if traveling from denser to less dense
  let criticalAngle = null;
  let isTIR = false;
  
  if (n1 > n2) {
    criticalAngle = Math.asin(n2 / n1) * 180 / Math.PI;
    if (incidenceAngle >= criticalAngle) {
      isTIR = true;
    }
  }
  
  // Draw medium overlays
  // Determine which half is denser based on direction
  const fromDenser = n1 > n2;
  if (fromDenser) {
    // Top half is denser
    ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
    ctx.fillRect(0, 0, w, boundaryY);
  } else {
    // Bottom half is denser
    ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
    ctx.fillRect(0, boundaryY, w, h - boundaryY);
  }
  
  // Boundary line
  ctx.strokeStyle = COLORS.textSecondary;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, boundaryY);
  ctx.lineTo(w, boundaryY);
  ctx.stroke();
  
  // Dash normal
  ctx.strokeStyle = COLORS.white;
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(cx, 10);
  ctx.lineTo(cx, h - 10);
  ctx.stroke();
  ctx.setLineDash([]);
  
  // Labels
  ctx.fillStyle = COLORS.white;
  ctx.font = '11px Outfit';
  ctx.fillText('Normal', cx + 10, 25);
  
  let n1Str = n1.toFixed(2);
  let n2Str = n2.toFixed(2);
  if (hiddenUnknown === 'n') {
    if (n1 > n2) {
      n1Str = '?';
    } else {
      n2Str = '?';
    }
  }

  ctx.fillStyle = fromDenser ? COLORS.cyan : COLORS.textSecondary;
  ctx.fillText(`${meds.from.name} (n = ${n1Str})`, 15, 30);
  
  ctx.fillStyle = fromDenser ? COLORS.textSecondary : COLORS.cyan;
  ctx.fillText(`${meds.to.name} (n = ${n2Str})`, 15, h - 20);
  
  // Ray math
  const iRad = incidenceAngle * Math.PI / 180;
  const len = Math.min(w, h) * 0.45;
  
  // Incident ray (always comes from top left)
  const incidentX = cx - len * Math.sin(iRad);
  const incidentY = cy - len * Math.cos(iRad);
  
  ctx.lineWidth = 3;
  ctx.strokeStyle = COLORS.yellow;
  ctx.beginPath();
  ctx.moveTo(incidentX, incidentY);
  ctx.lineTo(cx, cy);
  ctx.stroke();
  drawArrow(ctx, incidentX, incidentY, cx, cy, COLORS.yellow);
  
  // Draw Angle of Incidence curve & label
  ctx.strokeStyle = COLORS.yellow;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, 25, -Math.PI / 2, -Math.PI / 2 - iRad, true);
  ctx.stroke();
  
  // Output Values updating
  let textIncidence = incidenceAngle.toFixed(1) + '°';
  let textRefraction = '';
  let textRatio = '';
  
  if (isTIR) {
    // TIR: Ray reflects back into top medium
    const reflectX = cx + len * Math.sin(iRad);
    const reflectY = cy - len * Math.cos(iRad);
    
    ctx.lineWidth = 3;
    ctx.strokeStyle = COLORS.yellow;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(reflectX, reflectY);
    ctx.stroke();
    drawArrow(ctx, cx, cy, reflectX, reflectY, COLORS.yellow);
    
    // Draw reflected angle curve
    ctx.strokeStyle = COLORS.yellow;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 25, -Math.PI / 2, -Math.PI / 2 + iRad);
    ctx.stroke();
    
    textRefraction = 'N/A';
    textRatio = 'N/A';
    document.getElementById('tir-warning').style.display = 'block';
  } else {
    // Normal Refraction
    const sinR = (n1 * Math.sin(iRad)) / n2;
    const rRad = Math.asin(sinR);
    const rDeg = rRad * 180 / Math.PI;
    
    const refractedX = cx + len * Math.sin(rRad);
    const refractedY = cy + len * Math.cos(rRad);
    
    ctx.lineWidth = 3;
    ctx.strokeStyle = COLORS.cyan;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(refractedX, refractedY);
    ctx.stroke();
    drawArrow(ctx, cx, cy, refractedX, refractedY, COLORS.cyan);
    
    // Draw Refraction Angle curve
    ctx.strokeStyle = COLORS.cyan;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 25, Math.PI / 2, Math.PI / 2 - rRad, true);
    ctx.stroke();
    
    // Ratios
    const ratio = Math.sin(iRad) / Math.sin(rRad);
    
    textRefraction = rDeg.toFixed(1) + '°';
    textRatio = ratio.toFixed(2);
    document.getElementById('tir-warning').style.display = 'none';
  }

  // If in practice mode, mask the selected unknown
  const sliderEl = document.getElementById('slider-incidence');
  const lblAngleEl = document.getElementById('lbl-angle');

  if (hiddenUnknown === 'theta1') {
    textIncidence = '? (Find me!)';
    if (sliderEl) sliderEl.disabled = true;
    if (lblAngleEl) lblAngleEl.innerText = '?';
  } else {
    if (sliderEl) sliderEl.disabled = false;
    if (lblAngleEl) lblAngleEl.innerText = incidenceAngle + '°';
  }

  if (hiddenUnknown === 'theta2') {
    textRefraction = '? (Find me!)';
  } else if (hiddenUnknown === 'n') {
    textRatio = '? (Find me!)';
  }

  document.getElementById('val-incidence').innerText = textIncidence;
  document.getElementById('val-refraction').innerText = textRefraction;
  document.getElementById('val-ratio').innerText = textRatio;

  // Real-time update working if visible
  if (isWorkingRevealed) {
    updateWorkingPanel();
  }
}

// ----------------------------------------------------
// Practice Mode Logic (Explore Tab)
// ----------------------------------------------------
function randomiseUnknown() {
  const choices = ['theta1', 'theta2', 'n'];
  hiddenUnknown = choices[Math.floor(Math.random() * choices.length)];
  isWorkingRevealed = false;
  document.getElementById('explore-working-panel').style.display = 'none';
  document.getElementById('btn-reveal-working').removeAttribute('disabled');
  
  const names = {
    theta1: 'Angle in Air (θ₁)',
    theta2: 'Angle in Medium (θ₂)',
    n: 'Refractive Index (n)'
  };
  document.getElementById('lbl-practice-status').innerText = `Hidden: ${names[hiddenUnknown]}`;
  
  drawSandbox();
}

function revealWorking() {
  if (!hiddenUnknown) return;
  isWorkingRevealed = true;
  updateWorkingPanel();
}

function updateWorkingPanel() {
  const panel = document.getElementById('explore-working-panel');
  if (!panel || !isWorkingRevealed) return;
  
  const meds = getMediums();
  const n1 = meds.from.n;
  const n2 = meds.to.n;
  const iRad = incidenceAngle * Math.PI / 180;
  
  let criticalAngle = null;
  let isTIR = false;
  if (n1 > n2) {
    criticalAngle = Math.asin(n2 / n1) * 180 / Math.PI;
    if (incidenceAngle >= criticalAngle) {
      isTIR = true;
    }
  }
  
  if (isTIR && (hiddenUnknown === 'theta2' || hiddenUnknown === 'n')) {
    panel.innerHTML = `<div><strong>Cannot solve:</strong> Total Internal Reflection has occurred. Angle of incidence (${incidenceAngle.toFixed(1)}&deg;) is greater than critical angle (${criticalAngle.toFixed(1)}&deg;). No light is refracted!</div>`;
    panel.style.display = 'block';
    return;
  }
  
  const sinR = (n1 * Math.sin(iRad)) / n2;
  const rRad = Math.asin(sinR);
  const rDeg = rRad * 180 / Math.PI;
  
  const angleAir = lightGoesToDenser ? incidenceAngle : rDeg;
  const angleMedium = lightGoesToDenser ? rDeg : incidenceAngle;
  const nMedium = lightGoesToDenser ? n2 : n1;
  
  let workingHTML = '';
  
  if (hiddenUnknown === 'n') {
    workingHTML = `
      <div><strong>Step 1: O-Level Formula</strong></div>
      <div class="formula">n = <span class="fraction"><span class="numerator">sin &theta;<sub>air</sub></span><span class="denominator">sin &theta;<sub>medium</sub></span></span></div>
      <div><strong>Step 2: Substitution</strong></div>
      <div class="formula">n = <span class="fraction"><span class="numerator">sin(${angleAir.toFixed(1)}&deg;)</span><span class="denominator">sin(${angleMedium.toFixed(1)}&deg;)</span></span></div>
      <div><strong>Step 3: Calculate</strong></div>
      <div>n = <span class="fraction"><span class="numerator">${Math.sin(angleAir * Math.PI / 180).toFixed(4)}</span><span class="denominator">${Math.sin(angleMedium * Math.PI / 180).toFixed(4)}</span></span> &approx; <strong>${nMedium.toFixed(2)}</strong></div>
    `;
  } else if (hiddenUnknown === 'theta1') {
    // Determine which parameter we seek: Air angle vs Medium angle
    if (lightGoesToDenser) {
      // Find angle in Air (incident)
      workingHTML = `
        <div><strong>Step 1: Start with O-Level Formula</strong></div>
        <div class="formula">n = <span class="fraction"><span class="numerator">sin &theta;<sub>air</sub></span><span class="denominator">sin &theta;<sub>medium</sub></span></span></div>
        <div>Rearrange for &theta;<sub>air</sub>:</div>
        <div class="formula">sin &theta;<sub>air</sub> = n &times; sin &theta;<sub>medium</sub></div>
        <div><strong>Step 2: Substitution</strong></div>
        <div class="formula">sin &theta;<sub>air</sub> = ${nMedium.toFixed(2)} &times; sin(${angleMedium.toFixed(1)}&deg;)</div>
        <div class="formula">sin &theta;<sub>air</sub> = ${nMedium.toFixed(2)} &times; ${Math.sin(angleMedium * Math.PI / 180).toFixed(4)} = ${Math.sin(angleAir * Math.PI / 180).toFixed(4)}</div>
        <div><strong>Step 3: Solve</strong></div>
        <div class="formula">&theta;<sub>air</sub> = sin<sup>-1</sup>(${Math.sin(angleAir * Math.PI / 180).toFixed(4)}) &approx; <strong>${angleAir.toFixed(1)}&deg;</strong></div>
      `;
    } else {
      // Find angle in Medium (incident)
      workingHTML = `
        <div><strong>Step 1: Start with O-Level Formula</strong></div>
        <div class="formula">n = <span class="fraction"><span class="numerator">sin &theta;<sub>air</sub></span><span class="denominator">sin &theta;<sub>medium</sub></span></span></div>
        <div>Rearrange for &theta;<sub>medium</sub>:</div>
        <div class="formula">sin &theta;<sub>medium</sub> = <span class="fraction"><span class="numerator">sin &theta;<sub>air</sub></span><span class="denominator">n</span></span></div>
        <div><strong>Step 2: Substitution</strong></div>
        <div class="formula">sin &theta;<sub>medium</sub> = <span class="fraction"><span class="numerator">sin(${angleAir.toFixed(1)}&deg;)</span><span class="denominator">${nMedium.toFixed(2)}</span></span></div>
        <div class="formula">sin &theta;<sub>medium</sub> = <span class="fraction"><span class="numerator">${Math.sin(angleAir * Math.PI / 180).toFixed(4)}</span><span class="denominator">${nMedium.toFixed(2)}</span></span> = ${Math.sin(angleMedium * Math.PI / 180).toFixed(4)}</div>
        <div><strong>Step 3: Solve</strong></div>
        <div class="formula">&theta;<sub>medium</sub> = sin<sup>-1</sup>(${Math.sin(angleMedium * Math.PI / 180).toFixed(4)}) &approx; <strong>${angleMedium.toFixed(1)}&deg;</strong></div>
      `;
    }
  } else if (hiddenUnknown === 'theta2') {
    if (lightGoesToDenser) {
      // Find angle in Medium (refraction)
      workingHTML = `
        <div><strong>Step 1: Start with O-Level Formula</strong></div>
        <div class="formula">n = <span class="fraction"><span class="numerator">sin &theta;<sub>air</sub></span><span class="denominator">sin &theta;<sub>medium</sub></span></span></div>
        <div>Rearrange for &theta;<sub>medium</sub>:</div>
        <div class="formula">sin &theta;<sub>medium</sub> = <span class="fraction"><span class="numerator">sin &theta;<sub>air</sub></span><span class="denominator">n</span></span></div>
        <div><strong>Step 2: Substitution</strong></div>
        <div class="formula">sin &theta;<sub>medium</sub> = <span class="fraction"><span class="numerator">sin(${angleAir.toFixed(1)}&deg;)</span><span class="denominator">${nMedium.toFixed(2)}</span></span></div>
        <div class="formula">sin &theta;<sub>medium</sub> = <span class="fraction"><span class="numerator">${Math.sin(angleAir * Math.PI / 180).toFixed(4)}</span><span class="denominator">${nMedium.toFixed(2)}</span></span> = ${Math.sin(angleMedium * Math.PI / 180).toFixed(4)}</div>
        <div><strong>Step 3: Solve</strong></div>
        <div class="formula">&theta;<sub>medium</sub> = sin<sup>-1</sup>(${Math.sin(angleMedium * Math.PI / 180).toFixed(4)}) &approx; <strong>${angleMedium.toFixed(1)}&deg;</strong></div>
      `;
    } else {
      // Find angle in Air (refraction)
      workingHTML = `
        <div><strong>Step 1: Start with O-Level Formula</strong></div>
        <div class="formula">n = <span class="fraction"><span class="numerator">sin &theta;<sub>air</sub></span><span class="denominator">sin &theta;<sub>medium</sub></span></span></div>
        <div>Rearrange for &theta;<sub>air</sub>:</div>
        <div class="formula">sin &theta;<sub>air</sub> = n &times; sin &theta;<sub>medium</sub></div>
        <div><strong>Step 2: Substitution</strong></div>
        <div class="formula">sin &theta;<sub>air</sub> = ${nMedium.toFixed(2)} &times; sin(${angleMedium.toFixed(1)}&deg;)</div>
        <div class="formula">sin &theta;<sub>air</sub> = ${nMedium.toFixed(2)} &times; ${Math.sin(angleMedium * Math.PI / 180).toFixed(4)} = ${Math.sin(angleAir * Math.PI / 180).toFixed(4)}</div>
        <div><strong>Step 3: Solve</strong></div>
        <div class="formula">&theta;<sub>air</sub> = sin<sup>-1</sup>(${Math.sin(angleAir * Math.PI / 180).toFixed(4)}) &approx; <strong>${angleAir.toFixed(1)}&deg;</strong></div>
      `;
    }
  }
  
  panel.innerHTML = workingHTML;
  panel.style.display = 'block';
}

// ----------------------------------------------------
// Section 3: Worked Examples Diagrams
// ----------------------------------------------------
let activeExampleIndex = 0;
function showExample(index) {
  activeExampleIndex = index;
  document.querySelectorAll('.examples-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.example-content').forEach(c => c.classList.remove('active'));
  
  document.getElementById('tab-ex' + (index + 1)).classList.add('active');
  document.getElementById('ex-content-' + index).classList.add('active');
  
  drawExampleDiagrams();
}

function drawExampleDiagrams() {
  const canvas = document.getElementById('ex-canvas-' + activeExampleIndex);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  resizeCanvasToDisplaySize(canvas);
  
  const w = canvas.width;
  const h = canvas.height;
  const boundaryY = h / 2;
  const cx = w / 2;
  const cy = boundaryY;
  
  ctx.fillStyle = COLORS.bgSecondary;
  ctx.fillRect(0, 0, w, h);
  
  // Boundary line
  ctx.strokeStyle = COLORS.textSecondary;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, boundaryY);
  ctx.lineTo(w, boundaryY);
  ctx.stroke();
  
  // Dash normal
  ctx.strokeStyle = COLORS.white;
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(cx, 10);
  ctx.lineTo(cx, h - 10);
  ctx.stroke();
  ctx.setLineDash([]);
  
  ctx.fillStyle = COLORS.white;
  ctx.font = '10px Outfit';
  ctx.fillText('Normal', cx + 10, 20);
  
  const len = Math.min(w, h) * 0.4;
  let iAngle, rAngle;
  let n1Text = '', n2Text = '';
  
  if (activeExampleIndex === 0) {
    // Find θ₂: Air (1.0) -> Glass (1.5), i = 40, r = 25.4
    iAngle = 40;
    rAngle = 25.4;
    n1Text = 'Air (n₁ = 1.00)';
    n2Text = 'Glass (n₂ = 1.50)';
    ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
    ctx.fillRect(0, boundaryY, w, h - boundaryY);
  } else if (activeExampleIndex === 1) {
    // Find n: Air (1.0) -> Block (1.5), i = 50, r = 30.7
    iAngle = 50;
    rAngle = 30.7;
    n1Text = 'Air (n₁ = 1.00)';
    n2Text = 'Block (n₂ = ?)';
    ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
    ctx.fillRect(0, boundaryY, w, h - boundaryY);
  } else {
    // Find θ₁: Diamond (2.42) -> Water (1.33), i = 18.4, r = 35
    iAngle = 18.4;
    rAngle = 35;
    n1Text = 'Diamond (n₁ = 2.42)';
    n2Text = 'Water (n₂ = 1.33)';
    ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
    ctx.fillRect(0, 0, w, boundaryY);
  }
  
  ctx.fillStyle = COLORS.textSecondary;
  ctx.fillText(n1Text, 10, 20);
  ctx.fillText(n2Text, 10, h - 15);
  
  // Incident ray
  const iRad = iAngle * Math.PI / 180;
  const incidentX = cx - len * Math.sin(iRad);
  const incidentY = cy - len * Math.cos(iRad);
  ctx.strokeStyle = COLORS.yellow;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(incidentX, incidentY);
  ctx.lineTo(cx, cy);
  ctx.stroke();
  drawArrow(ctx, incidentX, incidentY, cx, cy, COLORS.yellow);
  
  // Incident angle curve
  ctx.strokeStyle = COLORS.yellow;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, 20, -Math.PI/2, -Math.PI/2 - iRad, true);
  ctx.stroke();
  ctx.fillText(`i = ${iAngle}°`, cx - 25, cy - 25);
  
  // Refracted ray
  const rRad = rAngle * Math.PI / 180;
  const refractedX = cx + len * Math.sin(rRad);
  const refractedY = cy + len * Math.cos(rRad);
  ctx.strokeStyle = COLORS.cyan;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(refractedX, refractedY);
  ctx.stroke();
  drawArrow(ctx, cx, cy, refractedX, refractedY, COLORS.cyan);
  
  // Refracted angle curve
  ctx.strokeStyle = COLORS.cyan;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, 20, Math.PI/2, Math.PI/2 - rRad, true);
  ctx.stroke();
  ctx.fillText(`r = ${rAngle}°`, cx + 8, cy + 30);
}

// ----------------------------------------------------
// Section 4: Flashcard Revision Mode
// ----------------------------------------------------
const flashcardsData = [
  {
    category: 'Definition',
    front: 'Normal Line',
    back: 'An imaginary perpendicular line (at 90°) drawn to the boundary surface at the point of incidence where the light ray strikes.'
  },
  {
    category: 'Definition',
    front: 'Angle of Incidence (i)',
    back: 'The angle measured between the incident light ray and the normal line.'
  },
  {
    category: 'Definition',
    front: 'Angle of Refraction (r)',
    back: 'The angle measured between the refracted light ray and the normal line.'
  },
  {
    category: 'Formula',
    front: 'Refractive Index (n) Definition',
    back: 'The ratio of the speed of light in a vacuum (c ≈ 3.0 × 10⁸ m/s) to the speed of light in the medium (v). Formula: n = c / v. Always ≥ 1.00.'
  },
  {
    category: 'Syllabus Law',
    front: "Snell's Law Statement",
    back: 'For two given media, the ratio of the sine of the angle in air to the sine of the angle in the medium is a constant. Formula: n = sin(θ_air) / sin(θ_medium).'
  },
  {
    category: 'Common Mistake',
    front: 'Measuring Angles',
    back: 'A very common error is measuring the angle of incidence or refraction from the boundary surface itself. Angles MUST always be measured relative to the perpendicular normal line.'
  }
];

let currentCardIndex = 0;
let flashcards = [...flashcardsData];

function renderFlashcard() {
  const cardElement = document.getElementById('flashcard');
  if (!cardElement) return;
  cardElement.classList.remove('flipped');
  
  const card = flashcards[currentCardIndex];
  document.getElementById('fc-category').innerText = card.category;
  document.getElementById('fc-front-text').innerText = card.front;
  document.getElementById('fc-back-text').innerText = card.back;
}

function flipCard() {
  const cardElement = document.getElementById('flashcard');
  if (cardElement) {
    cardElement.classList.toggle('flipped');
  }
}

function prevCard() {
  currentCardIndex = (currentCardIndex - 1 + flashcards.length) % flashcards.length;
  renderFlashcard();
}

function nextCard() {
  currentCardIndex = (currentCardIndex + 1) % flashcards.length;
  renderFlashcard();
}

function shuffleCards() {
  for (let i = flashcards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [flashcards[i], flashcards[j]] = [flashcards[j], flashcards[i]];
  }
  currentCardIndex = 0;
  renderFlashcard();
}

// ----------------------------------------------------
// Section 5: O-Level Quiz System
// ----------------------------------------------------
let quizQuestions = [];
let currentQuizIndex = 0;
let quizScore = 0;
let activeQuestionType = 'mcq'; // 'mcq' or 'numeric'
let selectedOptionIndex = null;
let currentCorrectAnswer = null; // Option index or numeric float

// Conceptual MCQ questions pool template
const CONCEPT_MCQS = [
  {
    question: "Which line represents the line drawn perpendicular to the boundary surface at the point where light enters?",
    options: ["Boundary line", "Refracted ray", "Incident ray", "Normal line"],
    correctIndex: 3,
    solution: "The normal is always an imaginary line drawn perpendicular (90°) to the boundary surface at the point of incidence.",
    diagramType: "normal-concept"
  },
  {
    question: "When a light ray enters a optically denser medium (e.g. from air into glass), how does it bend?",
    options: ["It bends towards the normal", "It bends away from the normal", "It continues in a straight line", "It is fully absorbed"],
    correctIndex: 0,
    solution: "Entering a denser medium causes the speed of light to decrease, bending the ray towards the normal (θ₂ < θ₁).",
    diagramType: "bend-towards"
  },
  {
    question: "Which of the following is the correct definition of the refractive index 'n' of a medium?",
    options: ["n = speed of light in medium / speed of light in vacuum", "n = speed of light in vacuum / speed of light in medium", "n = speed of light in air / speed of light in water", "n = speed of light in medium × speed of light in vacuum"],
    correctIndex: 1,
    solution: "Refractive index is defined as n = c / v, which represents the speed of light in vacuum (c) divided by the speed of light in that medium (v).",
    diagramType: "n-def"
  },
  {
    question: "If light enters a less dense medium from a denser medium (e.g. glass to air), how does it bend?",
    options: ["It bends towards the normal", "It bends away from the normal", "It does not bend at all", "It turns 180 degrees"],
    correctIndex: 1,
    solution: "Entering a less dense medium causes the light ray to speed up, bending it away from the normal (θ₂ > θ₁).",
    diagramType: "bend-away"
  },
  {
    question: "What is the refractive index of a vacuum (or approximately air)?",
    options: ["0.00", "0.50", "1.00", "1.50"],
    correctIndex: 2,
    solution: "By definition, the refractive index of a vacuum is exactly 1.00. Air is very close and also approximated as 1.00 in O-Level Physics.",
    diagramType: "air-refraction"
  }
];

function generateQuizPool() {
  const pool = [];
  
  // 1. Generate 15 randomized calculation questions (distributed across the three variants)
  // Variant A: Find angle of refraction (given angle of incidence and refractive index)
  // Variant B: Find refractive index (given angle of incidence and angle of refraction)
  // Variant C: Find angle of incidence (given refractive index and angle of refraction)
  
  const mediums = [
    { name: 'Water', minN: 1.30, maxN: 1.36 },
    { name: 'Glass', minN: 1.45, maxN: 1.55 },
    { name: 'Diamond', minN: 2.40, maxN: 2.45 }
  ];

  for (let i = 0; i < 15; i++) {
    const variant = i % 3; // 0, 1, 2
    const med = mediums[Math.floor(Math.random() * mediums.length)];
    const nMedium = parseFloat((Math.random() * (med.maxN - med.minN) + med.minN).toFixed(2));
    
    // Choose direction: 0 = air to medium, 1 = medium to air
    const direction = Math.floor(Math.random() * 2);
    
    let iDeg, rDeg, n1, n2, targetValue, questionText, labelFormula;
    
    if (direction === 0) {
      // Less dense (Air) -> Denser (Medium)
      n1 = 1.00;
      n2 = nMedium;
      
      if (variant === 0) {
        // Find r (refraction angle)
        iDeg = Math.floor(Math.random() * 50) + 20; // 20 - 70 degrees
        const iRad = iDeg * Math.PI / 180;
        const sinR = Math.sin(iRad) / n2;
        rDeg = Math.asin(sinR) * 180 / Math.PI;
        
        targetValue = parseFloat(rDeg.toFixed(1));
        questionText = `A ray of light enters ${med.name} (refractive index = ${n2.toFixed(2)}) from air. The angle of incidence is ${iDeg.toFixed(1)}°. Calculate the angle of refraction. (Provide answer to 1 decimal place)`;
        labelFormula = `sin(r) = sin(i) / n = sin(${iDeg}°) / ${n2.toFixed(2)}`;
      } else if (variant === 1) {
        // Find n (refractive index)
        iDeg = Math.floor(Math.random() * 50) + 20;
        const iRad = iDeg * Math.PI / 180;
        // Generate realistic refractive index target
        const tempR = Math.asin(Math.sin(iRad) / n2) * 180 / Math.PI;
        rDeg = parseFloat(tempR.toFixed(1)); // round to 1 decimal place
        
        targetValue = n2;
        questionText = `A light ray enters a block of ${med.name} from air. The angle of incidence is ${iDeg.toFixed(1)}° and the angle of refraction is measured as ${rDeg.toFixed(1)}°. Calculate the refractive index of this medium. (Provide answer to 2 decimal places)`;
        labelFormula = `n = sin(i) / sin(r) = sin(${iDeg}°) / sin(${rDeg}°)`;
      } else {
        // Find i (incidence angle)
        rDeg = Math.floor(Math.random() * 25) + 10; // 10 - 35 degrees
        const rRad = rDeg * Math.PI / 180;
        const sinI = n2 * Math.sin(rRad);
        iDeg = Math.asin(sinI) * 180 / Math.PI;
        
        targetValue = parseFloat(iDeg.toFixed(1));
        questionText = `Light travels from air into ${med.name} (refractive index = ${n2.toFixed(2)}). The angle of refraction is ${rDeg.toFixed(1)}°. Find the angle of incidence. (Provide answer to 1 decimal place)`;
        labelFormula = `sin(i) = n × sin(r) = ${n2.toFixed(2)} × sin(${rDeg}°)`;
      }
    } else {
      // Denser (Medium) -> Less dense (Air)
      n1 = nMedium;
      n2 = 1.00;
      
      const criticalAngle = Math.asin(n2 / n1) * 180 / Math.PI;
      
      if (variant === 0) {
        // Find r (refraction angle)
        // Ensure angle of incidence is less than critical angle
        iDeg = Math.floor(Math.random() * (criticalAngle - 10)) + 5; // safely below critical angle
        const iRad = iDeg * Math.PI / 180;
        const sinR = (n1 * Math.sin(iRad)) / n2;
        rDeg = Math.asin(sinR) * 180 / Math.PI;
        
        targetValue = parseFloat(rDeg.toFixed(1));
        questionText = `Light travels from ${med.name} (refractive index = ${n1.toFixed(2)}) out into air. The angle of incidence inside the ${med.name} is ${iDeg.toFixed(1)}°. Find the angle of refraction in air. (Provide answer to 1 decimal place)`;
        labelFormula = `sin(r) = n × sin(i) = ${n1.toFixed(2)} × sin(${iDeg}°)`;
      } else if (variant === 1) {
        // Find n
        // Ensure incidence is safely below critical angle
        iDeg = Math.floor(Math.random() * (criticalAngle - 10)) + 5;
        const iRad = iDeg * Math.PI / 180;
        const tempR = Math.asin((n1 * Math.sin(iRad)) / n2) * 180 / Math.PI;
        rDeg = parseFloat(tempR.toFixed(1));
        
        targetValue = n1;
        questionText = `A light ray traveling inside a block of ${med.name} exits into air. The angle of incidence is ${iDeg.toFixed(1)}° and the angle of refraction in air is ${rDeg.toFixed(1)}°. Determine the refractive index of this medium. (Provide answer to 2 decimal places)`;
        labelFormula = `n = sin(r) / sin(i) = sin(${rDeg}°) / sin(${iDeg}°)`;
      } else {
        // Find i (incidence angle)
        rDeg = Math.floor(Math.random() * 45) + 25; // 25 - 70 degrees refraction in air
        const rRad = rDeg * Math.PI / 180;
        const sinI = (n2 * Math.sin(rRad)) / n1;
        iDeg = Math.asin(sinI) * 180 / Math.PI;
        
        targetValue = parseFloat(iDeg.toFixed(1));
        questionText = `Light exits ${med.name} (refractive index = ${n1.toFixed(2)}) into air. The angle of refraction in air is ${rDeg.toFixed(1)}°. Calculate the angle of incidence inside the ${med.name}. (Provide answer to 1 decimal place)`;
        labelFormula = `sin(i) = sin(r) / n = sin(${rDeg}°) / ${n1.toFixed(2)}`;
      }
    }

    pool.push({
      type: 'numeric',
      question: questionText,
      correctValue: targetValue,
      tolerance: variant === 1 ? 0.02 : 2.0, // ±0.02 for index, ±2% (approx 1-2 degrees) for angles
      n1: n1,
      n2: n2,
      i: iDeg,
      r: rDeg,
      formula: labelFormula,
      solution: `Using the relationship n = sin(θ_air) / sin(θ_medium), we substitute the known values: angle in air = ${direction === 0 ? iDeg.toFixed(1) : rDeg.toFixed(1)}° and angle in medium = ${direction === 0 ? rDeg.toFixed(1) : iDeg.toFixed(1)}°. Solving for the unknown gives the final value.`,
      diagramType: 'calculation'
    });
  }

  // 2. Add Conceptual MCQs to make up the rest of the 30-question pool
  // Duplicate / customize conceptual questions to have 15 distinct concept ones
  for (let i = 0; i < 15; i++) {
    const template = CONCEPT_MCQS[i % CONCEPT_MCQS.length];
    pool.push({
      type: 'mcq',
      question: template.question,
      options: [...template.options],
      correctIndex: template.correctIndex,
      solution: template.solution,
      diagramType: template.diagramType,
      i: 40,
      r: 25.4,
      n1: 1.0,
      n2: 1.5
    });
  }

  // Shuffle the entire quiz pool
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, 30); // returns exactly 30 questions
}

function initQuiz() {
  quizQuestions = generateQuizPool();
  currentQuizIndex = 0;
  quizScore = 0;
  
  document.getElementById('quiz-container').style.display = 'block';
  document.getElementById('quiz-results-container').style.display = 'none';
  
  loadQuestion();
}

function loadQuestion() {
  const q = quizQuestions[currentQuizIndex];
  
  // UI updates
  document.getElementById('quiz-progress-text').innerText = `Question ${currentQuizIndex + 1} of 30`;
  document.getElementById('quiz-score-text').innerText = `Score: ${quizScore}/${currentQuizIndex}`;
  document.getElementById('quiz-progress-fill').style.width = `${((currentQuizIndex) / 30) * 100}%`;
  
  document.getElementById('quiz-question-text').innerText = q.question;
  document.getElementById('quiz-solution-panel').style.display = 'none';
  
  activeQuestionType = q.type;
  selectedOptionIndex = null;
  
  if (q.type === 'mcq') {
    document.getElementById('quiz-options-container').style.display = 'flex';
    document.getElementById('quiz-numeric-container').style.display = 'none';
    
    // Render options
    const container = document.getElementById('quiz-options-container');
    container.innerHTML = '';
    q.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.innerText = opt;
      btn.onclick = () => selectMCQOption(idx);
      container.appendChild(btn);
    });
  } else {
    document.getElementById('quiz-options-container').style.display = 'none';
    document.getElementById('quiz-numeric-container').style.display = 'flex';
    document.getElementById('quiz-numeric-input').value = '';
    document.getElementById('quiz-numeric-input').disabled = false;
  }
  
  drawQuizDiagram(q);
}

function selectMCQOption(index) {
  const q = quizQuestions[currentQuizIndex];
  const container = document.getElementById('quiz-options-container');
  const buttons = container.getElementsByTagName('button');
  
  // Disable all options
  for (let btn of buttons) {
    btn.disabled = true;
  }
  
  const isCorrect = (index === q.correctIndex);
  if (isCorrect) {
    buttons[index].classList.add('correct');
    quizScore++;
    triggerConfetti();
  } else {
    buttons[index].classList.add('incorrect');
    buttons[q.correctIndex].classList.add('correct');
  }
  
  showQuizSolution(isCorrect);
}

function submitNumericAnswer() {
  const q = quizQuestions[currentQuizIndex];
  const inputEl = document.getElementById('quiz-numeric-input');
  const userVal = parseFloat(inputEl.value);
  
  if (isNaN(userVal)) return; // Don't submit blank
  
  inputEl.disabled = true;
  
  // Verify with tolerance
  let isCorrect = false;
  const target = q.correctValue;
  
  // Tolerance calculation: absolute difference or percent
  // If target is refractive index (e.g. 1.5), tolerance of ±0.02
  // If target is angle (e.g. 45), ±2% tolerance (approx 0.9 degrees)
  const isIndex = target < 5.0;
  const allowedDiff = isIndex ? 0.03 : (target * 0.02);
  
  if (Math.abs(userVal - target) <= allowedDiff) {
    isCorrect = true;
    quizScore++;
    triggerConfetti();
  }
  
  showQuizSolution(isCorrect);
}

function showQuizSolution(isCorrect) {
  const q = quizQuestions[currentQuizIndex];
  const panel = document.getElementById('quiz-solution-panel');
  const statusEl = document.getElementById('quiz-solution-status');
  const textEl = document.getElementById('quiz-solution-text');
  const formulaEl = document.getElementById('quiz-solution-formula');
  
  statusEl.className = 'solution-status ' + (isCorrect ? 'correct' : 'incorrect');
  statusEl.innerText = isCorrect ? 'Correct! 🎉' : `Incorrect. The correct answer is: ${q.type === 'mcq' ? q.options[q.correctIndex] : q.correctValue}`;
  
  textEl.innerText = q.solution;
  formulaEl.innerText = q.formula || 'n₁ sin(θ₁) = n₂ sin(θ₂)';
  
  panel.style.display = 'block';
}

function nextQuestion() {
  currentQuizIndex++;
  if (currentQuizIndex < 30) {
    loadQuestion();
  } else {
    // Show End Screen
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('quiz-results-container').style.display = 'block';
    
    // Calculate Grade
    const pct = (quizScore / 30) * 100;
    let grade = '';
    let description = '';
    
    if (pct >= 75) {
      grade = 'Grade: A1 (Excellent Mastery)';
      description = 'Superb performance! You have fully mastered Refraction and Snell\'s Law for the O-Level Physics syllabus.';
    } else if (pct >= 70) {
      grade = 'Grade: A2 (Very Good)';
      description = 'Great work! Just a few minor errors. You are well prepared.';
    } else if (pct >= 60) {
      grade = 'Grade: B3 / B4 (Good)';
      description = 'Solid understanding. Review your calculations and worked examples to push for an A grade.';
    } else if (pct >= 50) {
      grade = 'Grade: C5 / C6 (Credit)';
      description = 'You passed! Make sure to revisit the flashcards and practice the formula variants.';
    } else {
      grade = 'Grade: D7 / E8 / F9 (Needs Review)';
      description = 'Let\'s practice a bit more. Go back to the sandbox simulation to build visual intuition.';
    }
    
    document.getElementById('results-score').innerText = `${quizScore}/30`;
    document.getElementById('results-grade').innerText = grade;
    document.getElementById('results-summary-text').innerText = description;
  }
}

function restartQuiz() {
  initQuiz();
}

function drawQuizDiagram(q) {
  const canvas = document.getElementById('quiz-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  resizeCanvasToDisplaySize(canvas);
  
  const w = canvas.width;
  const h = canvas.height;
  const boundaryY = h / 2;
  const cx = w / 2;
  const cy = boundaryY;
  
  ctx.fillStyle = COLORS.bgSecondary;
  ctx.fillRect(0, 0, w, h);
  
  // Boundary line
  ctx.strokeStyle = COLORS.textSecondary;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, boundaryY);
  ctx.lineTo(w, boundaryY);
  ctx.stroke();
  
  // Dash normal
  ctx.strokeStyle = COLORS.white;
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(cx, 10);
  ctx.lineTo(cx, h - 10);
  ctx.stroke();
  ctx.setLineDash([]);
  
  ctx.fillStyle = COLORS.white;
  ctx.font = '10px Outfit';
  ctx.fillText('Normal', cx + 10, 20);
  
  // Shading based on denser medium location
  const isDenserBottom = q.n2 > q.n1;
  ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
  if (isDenserBottom) {
    ctx.fillRect(0, boundaryY, w, h - boundaryY);
  } else {
    ctx.fillRect(0, 0, w, boundaryY);
  }
  
  // Render rays
  const len = Math.min(w, h) * 0.4;
  const iRad = (q.i || 40) * Math.PI / 180;
  const rRad = (q.r || 25) * Math.PI / 180;
  
  // Incident ray
  const incidentX = cx - len * Math.sin(iRad);
  const incidentY = cy - len * Math.cos(iRad);
  ctx.strokeStyle = COLORS.yellow;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(incidentX, incidentY);
  ctx.lineTo(cx, cy);
  ctx.stroke();
  drawArrow(ctx, incidentX, incidentY, cx, cy, COLORS.yellow);
  
  // Refracted ray
  const refractedX = cx + len * Math.sin(rRad);
  const refractedY = cy + len * Math.cos(rRad);
  ctx.strokeStyle = COLORS.cyan;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(refractedX, refractedY);
  ctx.stroke();
  drawArrow(ctx, cx, cy, refractedX, refractedY, COLORS.cyan);
  
  // Helper labels depending on concept question type
  ctx.fillStyle = COLORS.white;
  if (q.diagramType === 'bend-towards') {
    ctx.fillText('Entering denser medium', 10, 20);
  } else if (q.diagramType === 'bend-away') {
    ctx.fillText('Entering less dense medium', 10, 20);
  }
}

// ----------------------------------------------------
// Confetti Animation Engine
// ----------------------------------------------------
let confettiParticles = [];
let confettiAnimId = null;

function triggerConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  confettiParticles = [];
  const particleCount = 60;
  
  for (let i = 0; i < particleCount; i++) {
    confettiParticles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 15,
      vy: (Math.random() - 0.7) * 15 - 5,
      color: Math.random() > 0.5 ? COLORS.cyan : COLORS.yellow,
      size: Math.random() * 6 + 4,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      opacity: 1
    });
  }
  
  if (confettiAnimId) cancelAnimationFrame(confettiAnimId);
  updateConfetti();
}

function updateConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  let alive = false;
  
  confettiParticles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.35; // gravity
    p.vx *= 0.98; // air drag
    p.rotation += p.rotationSpeed;
    p.opacity -= 0.015;
    
    if (p.opacity > 0) {
      alive = true;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation * Math.PI / 180);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    }
  });
  
  if (alive) {
    confettiAnimId = requestAnimationFrame(updateConfetti);
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

// ----------------------------------------------------
// Page Initial Load Setup
// ----------------------------------------------------
window.addEventListener('load', () => {
  // Switch to Section 1 (Intro) initially
  switchSection('section-intro');
  renderFlashcard();
});
