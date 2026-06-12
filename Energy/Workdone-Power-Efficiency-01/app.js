// --- Navigation and Section Management ---
let currentSection = 'concept';

function switchNavSection(sectionId) {
  document.querySelectorAll('.section-view').forEach(view => {
    view.classList.remove('active');
  });
  
  const target = document.getElementById(`section-${sectionId}`);
  if (target) {
    target.classList.add('active');
    currentSection = sectionId;
  }

  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  
  // Find nav button
  const navBtn = Array.from(document.querySelectorAll('.nav-item')).find(btn => 
    btn.getAttribute('onclick').includes(sectionId)
  );
  if (navBtn) navBtn.classList.add('active');

  // Trigger setup or resize of canvases if switching to Explore
  if (sectionId === 'explore') {
    setTimeout(() => {
      initCanvases();
      updateWorkSim();
      updatePowerSim();
      updateEffSim();
      drawCombinedScene();
    }, 50);
  }
}

// --- Section 1: Concept Carousel Swipe ---
let currentSlide = 0;
const track = document.getElementById('formula-track');
const indicators = document.querySelectorAll('.indicator');

function jumpToSlide(index) {
  currentSlide = index;
  track.style.transform = `translateX(-${index * 100}%)`;
  
  indicators.forEach((ind, i) => {
    if (i === index) ind.classList.add('active');
    else ind.classList.remove('active');
  });
}

// Swipe detection
let touchstartX = 0;
let touchendX = 0;

track.addEventListener('touchstart', e => {
  touchstartX = e.changedTouches[0].screenX;
});

track.addEventListener('touchend', e => {
  touchendX = e.changedTouches[0].screenX;
  handleSwipe();
});

function handleSwipe() {
  if (touchendX < touchstartX - 50) {
    // Swipe left -> next slide
    if (currentSlide < 2) jumpToSlide(currentSlide + 1);
  }
  if (touchendX > touchstartX + 50) {
    // Swipe right -> prev slide
    if (currentSlide > 0) jumpToSlide(currentSlide - 1);
  }
}

// --- Section 2: Explore Tabs ---
let currentExploreTab = 'work';

function switchExploreTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

  // Cancel any active animation loops
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }

  // Reset work sim state and button
  workSimState.animating = false;
  workSimState.paused = false;
  setControlsDisabled('work', false);
  const playWorkBtn = document.getElementById('btn-play-work');
  if (playWorkBtn) playWorkBtn.innerText = "Animate Push";

  // Reset power sim state and button
  powerSimState.animating = false;
  powerSimState.paused = false;
  setControlsDisabled('power', false);
  const playPowerBtn = document.getElementById('btn-play-power');
  if (playPowerBtn) playPowerBtn.innerText = "Animate Lift";

  // Reset efficiency sim state and button
  effSimState.animating = false;
  effSimState.paused = false;
  setControlsDisabled('efficiency', false);
  const playEffBtn = document.getElementById('btn-play-eff');
  if (playEffBtn) playEffBtn.innerText = "Animate Conveyor";

  // Set active btn
  const activeBtn = Array.from(document.querySelectorAll('.tab-btn')).find(btn => 
    btn.getAttribute('onclick').includes(tabId)
  );
  if (activeBtn) activeBtn.classList.add('active');

  const targetTab = document.getElementById(`tab-${tabId}`);
  if (targetTab) targetTab.classList.add('active');
  currentExploreTab = tabId;

  // Redraw canvas
  setTimeout(() => {
    initCanvases();
    updateWorkSim();
    updatePowerSim();
    updateEffSim();
  }, 10);
}

// Helper to disable/enable slider controls and checkbuttons during animation
function setControlsDisabled(tab, disabled) {
  if (tab === 'work') {
    const inputs = [
      document.getElementById('slider-work-force'),
      document.getElementById('slider-work-distance'),
      document.getElementById('toggle-work-friction')
    ];
    inputs.forEach(input => {
      if (input) {
        input.disabled = disabled;
        const group = input.closest('.control-group');
        if (group) {
          if (disabled) group.classList.add('disabled');
          else group.classList.remove('disabled');
        }
      }
    });
  } else if (tab === 'power') {
    const inputs = [
      document.getElementById('slider-power-mass'),
      document.getElementById('slider-power-height'),
      document.getElementById('slider-power-time')
    ];
    inputs.forEach(input => {
      if (input) {
        input.disabled = disabled;
        const group = input.closest('.control-group');
        if (group) {
          if (disabled) group.classList.add('disabled');
          else group.classList.remove('disabled');
        }
      }
    });
  } else if (tab === 'efficiency') {
    const inputs = [
      document.getElementById('slider-eff-input'),
      document.getElementById('slider-eff-output')
    ];
    inputs.forEach(input => {
      if (input) {
        input.disabled = disabled;
        const group = input.closest('.control-group');
        if (group) {
          if (disabled) group.classList.add('disabled');
          else group.classList.remove('disabled');
        }
      }
    });
  }
}

// --- Canvas & Simulation Drawing Logics ---
let cvWork, ctxWork, cvPower, ctxPower, cvEff, ctxEff, cvComb, ctxComb;
let animationFrameId = null;

function initCanvases() {
  cvWork = document.getElementById('canvas-work');
  ctxWork = cvWork.getContext('2d');

  cvPower = document.getElementById('canvas-power');
  ctxPower = cvPower.getContext('2d');

  cvEff = document.getElementById('canvas-efficiency');
  ctxEff = cvEff.getContext('2d');

  cvComb = document.getElementById('canvas-combined');
  ctxComb = cvComb.getContext('2d');
}

// Simulation variables (supporting Play, Pause, Resume, and real time)
let workSimState = { animating: false, paused: false, progress: 0, elapsed: 0, startTime: 0, startX: 50, targetX: 0 };
let powerSimState = { animating: false, paused: false, progress: 0, elapsed: 0, startTime: 0, timeLimit: 10 };
let effSimState = { animating: false, paused: false, progress: 0, elapsed: 0, startTime: 0 };

function drawWorkStatic(boxXProgress = 50) {
  if (!ctxWork) return;
  ctxWork.clearRect(0, 0, cvWork.width, cvWork.height);

  // Draw background floor
  ctxWork.strokeStyle = '#334155';
  ctxWork.lineWidth = 3;
  ctxWork.beginPath();
  ctxWork.moveTo(0, 140);
  ctxWork.lineTo(cvWork.width, 140);
  ctxWork.stroke();

  // Draw box
  const boxWidth = 50;
  const boxHeight = 50;
  const boxY = 140 - boxHeight;
  ctxWork.fillStyle = '#1e293b';
  ctxWork.strokeStyle = varColor('--accent-cyan');
  ctxWork.lineWidth = 2.5;
  ctxWork.fillRect(boxXProgress, boxY, boxWidth, boxHeight);
  ctxWork.strokeRect(boxXProgress, boxY, boxWidth, boxHeight);

  // Label inside the box
  ctxWork.fillStyle = varColor('--text-primary');
  ctxWork.font = '10px monospace';
  ctxWork.textAlign = 'center';
  ctxWork.fillText("Box", boxXProgress + boxWidth / 2, boxY + 28);

  // Draw person pushing
  const personX = boxXProgress - 35;
  const personY = 140;
  ctxWork.strokeStyle = '#94a3b8';
  ctxWork.lineWidth = 2.5;
  
  // Head
  ctxWork.beginPath();
  ctxWork.arc(personX, personY - 45, 7, 0, Math.PI * 2);
  ctxWork.stroke();
  // Body
  ctxWork.beginPath();
  ctxWork.moveTo(personX, personY - 38);
  ctxWork.lineTo(personX - 5, personY - 18);
  ctxWork.stroke();
  // Legs
  ctxWork.beginPath();
  ctxWork.moveTo(personX - 5, personY - 18);
  ctxWork.lineTo(personX - 15, personY);
  ctxWork.moveTo(personX - 5, personY - 18);
  ctxWork.lineTo(personX, personY);
  ctxWork.stroke();
  // Arms pushing box
  ctxWork.beginPath();
  ctxWork.moveTo(personX - 2, personY - 30);
  ctxWork.lineTo(boxXProgress, personY - 28);
  ctxWork.stroke();

  // Force arrow
  ctxWork.strokeStyle = varColor('--accent-cyan');
  ctxWork.fillStyle = varColor('--accent-cyan');
  ctxWork.lineWidth = 3;
  ctxWork.beginPath();
  ctxWork.moveTo(boxXProgress - 55, personY - 30);
  ctxWork.lineTo(boxXProgress - 10, personY - 30);
  ctxWork.stroke();
  // Arrowhead
  ctxWork.beginPath();
  ctxWork.moveTo(boxXProgress - 10, personY - 34);
  ctxWork.lineTo(boxXProgress - 2, personY - 30);
  ctxWork.lineTo(boxXProgress - 10, personY - 26);
  ctxWork.fill();

  ctxWork.fillStyle = varColor('--accent-cyan');
  ctxWork.font = '11px sans-serif';
  ctxWork.fillText("F", boxXProgress - 32, personY - 38);

  // If friction is on, show red resistance arrow
  const frictionOn = document.getElementById('toggle-work-friction').checked;
  if (frictionOn) {
    ctxWork.strokeStyle = varColor('--accent-red');
    ctxWork.fillStyle = varColor('--accent-red');
    ctxWork.lineWidth = 2;
    ctxWork.beginPath();
    ctxWork.moveTo(boxXProgress + boxWidth + 10, 130);
    ctxWork.lineTo(boxXProgress + boxWidth + 45, 130);
    ctxWork.stroke();
    // Arrowhead (pointing left, against direction)
    ctxWork.beginPath();
    ctxWork.moveTo(boxXProgress + boxWidth + 10, 130);
    ctxWork.lineTo(boxXProgress + boxWidth + 16, 127);
    ctxWork.lineTo(boxXProgress + boxWidth + 16, 133);
    ctxWork.fill();

    ctxWork.font = '10px sans-serif';
    ctxWork.fillText("Friction", boxXProgress + boxWidth + 30, 120);
  }
}

// Work Simulation logic
let workFrictionForce = 0;
function updateWorkSim() {
  initCanvases();
  const force = parseFloat(document.getElementById('slider-work-force').value);
  const dist = parseFloat(document.getElementById('slider-work-distance').value);
  const frictionOn = document.getElementById('toggle-work-friction').checked;

  document.getElementById('val-work-force').innerText = `${force} N`;
  document.getElementById('val-work-distance').innerText = `${dist} m`;

  const workApplied = force * dist;
  document.getElementById('out-work-applied').innerText = `${workApplied.toFixed(1)} J`;

  if (frictionOn) {
    document.getElementById('row-work-friction').style.display = 'flex';
    document.getElementById('row-work-net').style.display = 'flex';
    
    // Setup a stable but randomized friction force based on settings if not set
    if (!workFrictionForce || workFrictionForce >= force) {
      workFrictionForce = Math.round(force * 0.4);
    }
    const frictionWork = workFrictionForce * dist;
    const netWork = Math.max(0, workApplied - frictionWork);

    document.getElementById('out-work-friction').innerText = `-${frictionWork.toFixed(1)} J`;
    document.getElementById('out-work-net').innerText = `${netWork.toFixed(1)} J`;
    document.getElementById('out-work-friction').style.color = 'var(--accent-red)';
  } else {
    document.getElementById('row-work-friction').style.display = 'none';
    document.getElementById('row-work-net').style.display = 'none';
  }

  // Draw statically
  if (!workSimState.animating) {
    drawWorkStatic(50);
  }
}

function playWorkSim() {
  const btn = document.getElementById('btn-play-work');
  
  if (!workSimState.animating) {
    // Start fresh
    workSimState.animating = true;
    workSimState.paused = false;
    workSimState.progress = 0;
    workSimState.elapsed = 0;
    workSimState.startTime = performance.now();
    workSimState.startX = 50;
    
    const distanceSet = parseFloat(document.getElementById('slider-work-distance').value);
    const maxMove = 220;
    const normalizedDistance = Math.min(1.0, distanceSet / 20.0);
    workSimState.targetX = workSimState.startX + (maxMove * normalizedDistance);

    setControlsDisabled('work', true);
    btn.innerText = "Pause Push";
    
    animateWorkLoop();
  } else if (!workSimState.paused) {
    // Pause it
    workSimState.paused = true;
    workSimState.elapsed += performance.now() - workSimState.startTime;
    btn.innerText = "Resume Push";
  } else {
    // Resume it
    workSimState.paused = false;
    workSimState.startTime = performance.now();
    btn.innerText = "Pause Push";
    animateWorkLoop();
  }
}

function animateWorkLoop() {
  if (workSimState.paused || !workSimState.animating) return;

  function frame(time) {
    if (workSimState.paused || !workSimState.animating) return;

    const totalElapsedMs = workSimState.elapsed + (time - workSimState.startTime);
    const durationMs = 1500; // 1.5s animation
    const progress = Math.min(1.0, totalElapsedMs / durationMs);

    const currentX = workSimState.startX + (workSimState.targetX - workSimState.startX) * progress;
    drawWorkStatic(currentX);

    if (progress < 1) {
      animationFrameId = requestAnimationFrame(frame);
    } else {
      // Finished
      drawWorkStatic(workSimState.targetX);
      workSimState.animating = false;
      workSimState.paused = false;
      setControlsDisabled('work', false);
      document.getElementById('btn-play-work').innerText = "Animate Push";
    }
  }
  animationFrameId = requestAnimationFrame(frame);
}

// Power Simulation
function drawPowerStatic(heightProgress = 0, timeText = "0.0s") {
  if (!ctxPower) return;
  ctxPower.clearRect(0, 0, cvPower.width, cvPower.height);

  const heightVal = parseFloat(document.getElementById('slider-power-height').value);
  const groundFloor = 250;
  const loadHeight = 30;

  // Motor Y height scales proportionally with the height slider (1 to 20 m)
  const travel = (heightVal - 1) / (20 - 1); // normalized 0 to 1
  const motorPulleyY = 220 - (travel * 170); // Y ranges from 220 (at 1m) to 50 (at 20m)

  // Motor base (top right relative to motorPulleyY)
  ctxPower.fillStyle = '#1e293b';
  ctxPower.strokeStyle = varColor('--accent-cyan');
  ctxPower.lineWidth = 2;
  ctxPower.fillRect(260, motorPulleyY - 20, 50, 40);
  ctxPower.strokeRect(260, motorPulleyY - 20, 50, 40);

  // Pulley axle
  ctxPower.fillStyle = '#334155';
  ctxPower.beginPath();
  ctxPower.arc(285, motorPulleyY, 15, 0, Math.PI * 2);
  ctxPower.fill();
  ctxPower.stroke();

  // Load line
  const startY = motorPulleyY;
  const loadMaxLiftPx = groundFloor - loadHeight - motorPulleyY;
  const currentHeightPixels = loadMaxLiftPx * heightProgress;
  const boxY = groundFloor - loadHeight - currentHeightPixels;

  ctxPower.strokeStyle = '#94a3b8';
  ctxPower.lineWidth = 2;
  ctxPower.beginPath();
  ctxPower.moveTo(270, startY);
  ctxPower.lineTo(270, boxY);
  ctxPower.stroke();

  // Load box
  ctxPower.fillStyle = '#0f172a';
  ctxPower.strokeStyle = varColor('--accent-cyan');
  ctxPower.lineWidth = 2;
  ctxPower.fillRect(250, boxY, 40, loadHeight);
  ctxPower.strokeRect(250, boxY, 40, loadHeight);

  // Mass label inside load
  ctxPower.fillStyle = varColor('--text-primary');
  ctxPower.font = '10px monospace';
  ctxPower.textAlign = 'center';
  ctxPower.fillText("Load", 270, boxY + 18);

  // Ground level line
  ctxPower.strokeStyle = '#334155';
  ctxPower.lineWidth = 2;
  ctxPower.beginPath();
  ctxPower.moveTo(180, groundFloor);
  ctxPower.lineTo(340, groundFloor);
  ctxPower.stroke();

  // Draw Timer text on Canvas
  ctxPower.fillStyle = '#fff';
  ctxPower.font = '14px monospace';
  ctxPower.textAlign = 'left';
  ctxPower.fillText(`Timer: ${timeText}`, 20, 40);

  // Simple motor icon detail
  ctxPower.fillStyle = varColor('--accent-cyan');
  ctxPower.font = '8px sans-serif';
  ctxPower.fillText("MOTOR", 285, motorPulleyY - 25);
}

function updatePowerSim() {
  initCanvases();
  const mass = parseFloat(document.getElementById('slider-power-mass').value);
  const height = parseFloat(document.getElementById('slider-power-height').value);
  const timeVal = parseFloat(document.getElementById('slider-power-time').value);

  document.getElementById('val-power-mass').innerText = `${mass} kg`;
  document.getElementById('val-power-height').innerText = `${height} m`;
  document.getElementById('val-power-time').innerText = `${timeVal} s`;

  // g = 10 N/kg
  const energy = mass * 10 * height;
  const power = energy / timeVal;

  document.getElementById('out-power-energy').innerText = `${energy.toFixed(1)} J`;
  document.getElementById('out-power-power').innerText = `${power.toFixed(1)} W`;

  if (!powerSimState.animating) {
    drawPowerStatic(0, "0.0s");
  }
}

function playPowerSim() {
  const btn = document.getElementById('btn-play-power');

  if (!powerSimState.animating) {
    // Start fresh
    powerSimState.animating = true;
    powerSimState.paused = false;
    powerSimState.progress = 0;
    powerSimState.elapsed = 0;
    powerSimState.startTime = performance.now();
    powerSimState.timeLimit = parseFloat(document.getElementById('slider-power-time').value);

    setControlsDisabled('power', true);
    btn.innerText = "Pause Lift";

    animatePowerLoop();
  } else if (!powerSimState.paused) {
    // Pause it
    powerSimState.paused = true;
    powerSimState.elapsed += performance.now() - powerSimState.startTime;
    btn.innerText = "Resume Lift";
  } else {
    // Resume it
    powerSimState.paused = false;
    powerSimState.startTime = performance.now();
    btn.innerText = "Pause Lift";
    animatePowerLoop();
  }
}

function animatePowerLoop() {
  if (powerSimState.paused || !powerSimState.animating) return;

  function frame(time) {
    if (powerSimState.paused || !powerSimState.animating) return;

    const totalElapsedMs = powerSimState.elapsed + (time - powerSimState.startTime);
    const durationMs = powerSimState.timeLimit * 1000;
    const progress = Math.min(1.0, totalElapsedMs / durationMs);
    const virtualSeconds = (progress * powerSimState.timeLimit).toFixed(1);

    drawPowerStatic(progress, `${virtualSeconds}s`);

    if (progress < 1) {
      animationFrameId = requestAnimationFrame(frame);
    } else {
      // Finished
      drawPowerStatic(1.0, `${powerSimState.timeLimit.toFixed(1)}s`);
      powerSimState.animating = false;
      powerSimState.paused = false;
      setControlsDisabled('power', false);
      document.getElementById('btn-play-power').innerText = "Animate Lift";
    }
  }
  animationFrameId = requestAnimationFrame(frame);
}

// Efficiency Simulation
function drawEffStatic(boxProgress = 0.5) {
  if (!ctxEff) return;
  ctxEff.clearRect(0, 0, cvEff.width, cvEff.height);

  const cx1 = 60;
  const cx2 = 300;
  const cy = 90;
  const r = 20;

  // Calculate energy in internal store ratio to compute heat color interpolation
  const totalInput = parseFloat(document.getElementById('slider-eff-input').value) || 500;
  const usefulOutput = parseFloat(document.getElementById('slider-eff-output').value) || 300;
  const internalRatio = (totalInput - usefulOutput) / totalInput; // 0.1 to 0.95

  // Interpolate color from greyish-blue (#334155) to hot neon-red (#ff3b30)
  const rColor = Math.round(51 + (255 - 51) * internalRatio);
  const gColor = Math.round(65 + (59 - 65) * internalRatio);
  const bColor = Math.round(85 + (48 - 85) * internalRatio);
  const heatColor = `rgb(${rColor}, ${gColor}, ${bColor})`;

  // Add subtle glowing effect representing heat radiating
  ctxEff.shadowColor = `rgba(255, 59, 48, ${internalRatio * 0.4})`;
  ctxEff.shadowBlur = internalRatio * 10;

  // Draw background pulleys
  ctxEff.strokeStyle = heatColor;
  ctxEff.lineWidth = 4;
  ctxEff.beginPath();
  ctxEff.arc(cx1, cy, r, 0, Math.PI * 2);
  ctxEff.arc(cx2, cy, r, 0, Math.PI * 2);
  ctxEff.stroke();

  // Draw pulley spokes rotating
  ctxEff.strokeStyle = heatColor;
  ctxEff.lineWidth = 2.5;
  const angleOffset = boxProgress * Math.PI * 6; // rotates with progress
  for (let i = 0; i < 3; i++) {
    const angle = angleOffset + (i * Math.PI * 2 / 3);
    
    // Left wheel spoke
    ctxEff.beginPath();
    ctxEff.moveTo(cx1, cy);
    ctxEff.lineTo(cx1 + Math.cos(angle) * r, cy + Math.sin(angle) * r);
    ctxEff.stroke();

    // Right wheel spoke
    ctxEff.beginPath();
    ctxEff.moveTo(cx2, cy);
    ctxEff.lineTo(cx2 + Math.cos(angle) * r, cy + Math.sin(angle) * r);
    ctxEff.stroke();
  }

  // Belt lines with dashes that move
  ctxEff.strokeStyle = heatColor;
  ctxEff.lineWidth = 3;
  ctxEff.setLineDash([8, 8]);
  ctxEff.lineDashOffset = -boxProgress * 150; // offset shifts as belt runs

  ctxEff.beginPath();
  ctxEff.moveTo(cx1, cy - r);
  ctxEff.lineTo(cx2, cy - r);
  ctxEff.moveTo(cx1, cy + r);
  ctxEff.lineTo(cx2, cy + r);
  ctxEff.stroke();

  // Reset line dash and shadow for other structures
  ctxEff.setLineDash([]);
  ctxEff.shadowColor = 'transparent';
  ctxEff.shadowBlur = 0;

  // Draw box moving from left to right along the top belt
  const boxWidth = 30;
  const boxHeight = 20;
  const boxX = cx1 + ((cx2 - cx1 - boxWidth) * boxProgress);
  const boxY = cy - r - boxHeight;

  ctxEff.fillStyle = varColor('--accent-cyan');
  ctxEff.strokeStyle = '#fff';
  ctxEff.lineWidth = 1.5;
  ctxEff.fillRect(boxX, boxY, boxWidth, boxHeight);
  ctxEff.strokeRect(boxX, boxY, boxWidth, boxHeight);
  
  ctxEff.fillStyle = '#fff';
  ctxEff.font = '10px sans-serif';
  ctxEff.textAlign = 'center';
  ctxEff.fillText("Conveyor Belt", 180, cy + 5);
}

function updateEffSim(triggerSource) {
  initCanvases();
  let totalInput = parseFloat(document.getElementById('slider-eff-input').value);
  let usefulOutput = parseFloat(document.getElementById('slider-eff-output').value);

  // Cap logic
  if (triggerSource === 'input' && usefulOutput > totalInput) {
    usefulOutput = totalInput;
    document.getElementById('slider-eff-output').value = usefulOutput;
  } else if (triggerSource === 'output' && usefulOutput > totalInput) {
    totalInput = usefulOutput;
    document.getElementById('slider-eff-input').value = totalInput;
  }

  document.getElementById('val-eff-input').innerText = `${totalInput} J`;
  document.getElementById('val-eff-output').innerText = `${usefulOutput} J`;

  const efficiency = (usefulOutput / totalInput) * 100;
  document.getElementById('out-eff-percentage').innerText = `${efficiency.toFixed(2)}%`;

  // Update Sankey visual bars
  const usefulPct = efficiency;
  const internalPct = 100 - efficiency;

  document.getElementById('sankey-useful').style.width = `${usefulPct}%`;
  document.getElementById('sankey-internal').style.width = `${internalPct}%`;

  document.getElementById('label-sankey-useful').innerText = `${usefulOutput} J`;
  document.getElementById('label-sankey-internal').innerText = `${(totalInput - usefulOutput)} J`;

  if (!effSimState.animating) {
    drawEffStatic(0.5);
  }
}

function playEffSim() {
  const btn = document.getElementById('btn-play-eff');

  if (!effSimState.animating) {
    // Start fresh
    effSimState.animating = true;
    effSimState.paused = false;
    effSimState.progress = 0;
    effSimState.elapsed = 0;
    effSimState.startTime = performance.now();

    // Calculate dynamic duration based on efficiency ratio
    const totalInput = parseFloat(document.getElementById('slider-eff-input').value);
    const usefulOutput = parseFloat(document.getElementById('slider-eff-output').value);
    const effRatio = usefulOutput / totalInput; // ranges from ~0.05 to ~0.9

    // Scale duration: 10% efficiency -> 4.0s (slow), 90% efficiency -> 0.8s (fast)
    const minDur = 800;
    const maxDur = 4000;
    effSimState.durationMs = maxDur - (effRatio * (maxDur - minDur));

    setControlsDisabled('efficiency', true);
    btn.innerText = "Pause Conveyor";

    animateEffLoop();
  } else if (!effSimState.paused) {
    // Pause it
    effSimState.paused = true;
    effSimState.elapsed += performance.now() - effSimState.startTime;
    btn.innerText = "Resume Conveyor";
  } else {
    // Resume it
    effSimState.paused = false;
    effSimState.startTime = performance.now();
    btn.innerText = "Pause Conveyor";
    animateEffLoop();
  }
}

function animateEffLoop() {
  if (effSimState.paused || !effSimState.animating) return;

  function frame(time) {
    if (effSimState.paused || !effSimState.animating) return;

    const totalElapsedMs = effSimState.elapsed + (time - effSimState.startTime);
    const durationMs = effSimState.durationMs || 2000;
    const progress = Math.min(1.0, totalElapsedMs / durationMs);

    drawEffStatic(progress);

    if (progress < 1) {
      animationFrameId = requestAnimationFrame(frame);
    } else {
      // Finished
      drawEffStatic(1.0);
      effSimState.animating = false;
      effSimState.paused = false;
      setControlsDisabled('efficiency', false);
      document.getElementById('btn-play-eff').innerText = "Animate Conveyor";
    }
  }
  animationFrameId = requestAnimationFrame(frame);
}

// --- Section 2 Tab D: Combined Scenarios ---
const combinedScenariosList = [
  {
    title: "Motor lifting a roller coaster cart",
    desc: "A motor pulls a cart with a mass of 400 kg up a track to the top of a hill of height 25 m. The lift takes 20 s. The input power of the motor is 8000 W.",
    mathValues: { m: 400, h: 25, t: 20, Pin: 8000 },
    steps: [
      {
        prompt: "Step 1: Calculate the work done by the motor to transfer energy to the gravitational potential store.",
        formula: "W = mgh",
        working: "W = 400 × 10 × 25 = 100 000 J",
        correctVal: 100000,
        unit: "J"
      },
      {
        prompt: "Step 2: Calculate the useful power output of the motor during this lift.",
        formula: "P = E/t",
        working: "P = 100 000 ÷ 20 = 5000 W",
        correctVal: 5000,
        unit: "W"
      },
      {
        prompt: "Step 3: Calculate the percentage efficiency of the motor.",
        formula: "efficiency = (useful power output / total input power) × 100%",
        working: "efficiency = (5000 ÷ 8000) × 100% = 62.5%",
        correctVal: 62.5,
        unit: "%"
      }
    ],
    draw: (ctx, progress) => {
      // Coaster hill
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(10, 110);
      ctx.lineTo(240, 30);
      ctx.lineTo(350, 110);
      ctx.stroke();

      // Cart
      const pct = Math.min(1, progress);
      const cartX = 10 + (230 * pct);
      const cartY = 110 - (80 * pct);

      ctx.fillStyle = varColor('--accent-cyan');
      ctx.fillRect(cartX - 10, cartY - 10, 20, 10);
      // Wheels
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(cartX - 6, cartY, 3, 0, Math.PI*2);
      ctx.arc(cartX + 6, cartY, 3, 0, Math.PI*2);
      ctx.fill();
    }
  },
  {
    title: "Electric vehicle accelerating",
    desc: "An electric car accelerates from rest along a level road. The motor exerts a constant forward force of 1200 N over a distance of 150 m in a time of 15 s. The total electrical energy input from the battery is 240 000 J.",
    mathValues: { F: 1200, d: 150, t: 15, Ein: 240000 },
    steps: [
      {
        prompt: "Step 1: Calculate the work done by the motor force.",
        formula: "W = Fd",
        working: "W = 1200 × 150 = 180 000 J",
        correctVal: 180000,
        unit: "J"
      },
      {
        prompt: "Step 2: Calculate the useful power output of the motor.",
        formula: "P = E/t",
        working: "P = 180 000 ÷ 15 = 12 000 W",
        correctVal: 12000,
        unit: "W"
      },
      {
        prompt: "Step 3: Calculate the percentage efficiency of the vehicle's electrical system.",
        formula: "efficiency = (useful energy output / total input energy) × 100%",
        working: "efficiency = (180 000 ÷ 240 000) × 100% = 75%",
        correctVal: 75,
        unit: "%"
      }
    ],
    draw: (ctx, progress) => {
      // Road
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(10, 110);
      ctx.lineTo(350, 110);
      ctx.stroke();

      // Vehicle
      const pct = Math.min(1, progress);
      const carX = 20 + (280 * pct);
      const carY = 110;

      ctx.fillStyle = varColor('--accent-cyan');
      ctx.fillRect(carX, carY - 20, 35, 12);
      ctx.fillRect(carX + 8, carY - 28, 18, 9);

      // Wheels
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(carX + 8, carY, 5, 0, Math.PI*2);
      ctx.arc(carX + 27, carY, 5, 0, Math.PI*2);
      ctx.fill();
    }
  },
  {
    title: "Cyclist climbing a hill",
    desc: "A cyclist climbs a slope against a gravity force components and friction. The cyclist transfers 40 000 J of energy from chemical stores in muscles. The useful work done climbing to a vertical height of 30 m (rider + bike total mass 80 kg) takes 125 s.",
    mathValues: { Ein: 40000, h: 30, m: 80, t: 125 },
    steps: [
      {
        prompt: "Step 1: Calculate the work done by the cyclist to increase the gravitational potential store of rider and bike.",
        formula: "W = mgh",
        working: "W = 80 × 10 × 30 = 24 000 J",
        correctVal: 24000,
        unit: "J"
      },
      {
        prompt: "Step 2: Calculate the useful power developed by the cyclist.",
        formula: "P = E/t",
        working: "P = 24 000 ÷ 125 = 192 W",
        correctVal: 192,
        unit: "W"
      },
      {
        prompt: "Step 3: Calculate the percentage efficiency of the cyclist.",
        formula: "efficiency = (useful energy output / total energy input) × 100%",
        working: "efficiency = (24 000 ÷ 40 000) × 100% = 60%",
        correctVal: 60,
        unit: "%"
      }
    ],
    draw: (ctx, progress) => {
      // Slope
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(10, 110);
      ctx.lineTo(340, 40);
      ctx.stroke();

      const pct = Math.min(1, progress);
      const bikeX = 10 + (320 * pct);
      const bikeY = 110 - (70 * pct);

      // Bike outline
      ctx.strokeStyle = varColor('--accent-cyan');
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(bikeX - 8, bikeY, 4, 0, Math.PI*2);
      ctx.arc(bikeX + 8, bikeY, 4, 0, Math.PI*2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(bikeX - 8, bikeY);
      ctx.lineTo(bikeX, bikeY - 8);
      ctx.lineTo(bikeX + 8, bikeY);
      ctx.stroke();
    }
  },
  {
    title: "A sprinter accelerating over 100 m",
    desc: "A sprinter of mass 70 kg accelerates over a distance of 40 m to reach top speed, applying an average forward force of 140 N in 4.0 s. The total energy expended in the body's energy in the internal store is 25 000 J.",
    mathValues: { m: 70, d: 40, F: 140, t: 4.0, Ein: 25000 },
    steps: [
      {
        prompt: "Step 1: Calculate the work done by the sprinter's muscles to accelerate.",
        formula: "W = Fd",
        working: "W = 140 × 40 = 5600 J",
        correctVal: 5600,
        unit: "J"
      },
      {
        prompt: "Step 2: Calculate the average power output developed by the sprinter during acceleration.",
        formula: "P = E/t",
        working: "P = 5600 ÷ 4 = 1400 W",
        correctVal: 1400,
        unit: "W"
      },
      {
        prompt: "Step 3: Calculate the percentage efficiency of the sprinter.",
        formula: "efficiency = (useful energy output / total input energy) × 100%",
        working: "efficiency = (5600 ÷ 25000) × 100% = 22.4%",
        correctVal: 22.4,
        unit: "%"
      }
    ],
    draw: (ctx, progress) => {
      // Track
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(10, 110);
      ctx.lineTo(350, 110);
      ctx.stroke();

      const pct = Math.min(1, progress);
      const runnerX = 20 + (280 * pct);
      const runnerY = 110;

      // Stick figure runner
      ctx.strokeStyle = varColor('--accent-cyan');
      ctx.lineWidth = 2.5;
      // Head
      ctx.beginPath();
      ctx.arc(runnerX, runnerY - 25, 4, 0, Math.PI*2);
      ctx.stroke();
      // Body
      ctx.beginPath();
      ctx.moveTo(runnerX, runnerY - 21);
      ctx.lineTo(runnerX - 3, runnerY - 10);
      ctx.stroke();
      // Leg 1
      ctx.beginPath();
      ctx.moveTo(runnerX - 3, runnerY - 10);
      ctx.lineTo(runnerX - 8, runnerY);
      ctx.stroke();
    }
  }
];

let activeCombScenarioIndex = 0;
let currentScenarioState = { step: 1, completed: false, answers: [] };

function drawCombinedScene() {
  if (!ctxComb) return;
  const scenario = combinedScenariosList[activeCombScenarioIndex];
  ctxComb.clearRect(0, 0, cvComb.width, cvComb.height);

  // Set animation progress based on current step
  const progress = (currentScenarioState.step - 1) / 3.0;
  scenario.draw(ctxComb, progress);
}

function nextCombinedScenario() {
  activeCombScenarioIndex = (activeCombScenarioIndex + 1) % combinedScenariosList.length;
  resetCombinedScenario();
}

function resetCombinedScenario() {
  currentScenarioState = { step: 1, completed: false, answers: [] };
  
  const scenario = combinedScenariosList[activeCombScenarioIndex];
  document.getElementById('comb-scenario-number').innerText = `Scenario ${activeCombScenarioIndex + 1} of 4`;
  document.getElementById('comb-title').innerText = scenario.title;
  document.getElementById('comb-desc').innerText = scenario.desc;

  // Reset steps DOM
  for (let i = 1; i <= 3; i++) {
    const card = document.getElementById(`comb-step-${i}-card`);
    const badge = document.getElementById(`comb-step-${i}-badge`);
    const area = document.getElementById(`comb-step-${i}-input-area`);
    const val = document.getElementById(`comb-step-${i}-input`);
    const sol = document.getElementById(`comb-step-${i}-sol`);

    card.className = "step-card";
    badge.className = "step-badge pending";
    badge.innerText = "Pending";
    val.value = "";
    val.className = "input-box";
    val.disabled = false;
    sol.style.display = "none";
    
    if (i === 1) {
      card.classList.add('active');
      badge.className = "step-badge current";
      badge.innerText = "Current";
      area.style.display = "flex";
    } else {
      area.style.display = "none";
    }
  }

  // Draw scene
  setTimeout(() => {
    initCanvases();
    drawCombinedScene();
  }, 10);
}

function submitCombinedStep(stepNum) {
  const scenario = combinedScenariosList[activeCombScenarioIndex];
  const stepObj = scenario.steps[stepNum - 1];
  const inputEl = document.getElementById(`comb-step-${stepNum}-input`);
  const userInput = inputEl.value;

  const validation = parseAnswer(userInput, stepObj.correctVal, stepObj.unit);

  if (validation.valid) {
    // Correct!
    inputEl.className = "input-box correct";
    inputEl.disabled = true;

    // Show check success badge
    const badge = document.getElementById(`comb-step-${stepNum}-badge`);
    badge.className = "step-badge success";
    badge.innerText = "Success";

    const card = document.getElementById(`comb-step-${stepNum}-card`);
    card.className = "step-card completed";

    // Show solution
    const sol = document.getElementById(`comb-step-${stepNum}-sol`);
    sol.style.display = "block";
    sol.innerHTML = `
      <div class="solution-title">
        <svg style="width:14px;height:14px;" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4" stroke="var(--accent-green)" stroke-width="3" fill="none"/></svg>
        Correct
      </div>
      <div class="solution-content">
        <div class="math-working">${stepObj.working}</div>
        <p>Correctly matched unit: <strong>${stepObj.unit}</strong></p>
      </div>
    `;

    // Move to next step if not complete
    if (stepNum < 3) {
      currentScenarioState.step = stepNum + 1;
      
      const nextCard = document.getElementById(`comb-step-${stepNum + 1}-card`);
      const nextBadge = document.getElementById(`comb-step-${stepNum + 1}-badge`);
      const nextArea = document.getElementById(`comb-step-${stepNum + 1}-input-area`);
      
      nextCard.classList.add('active');
      nextBadge.className = "step-badge current";
      nextBadge.innerText = "Current";
      nextArea.style.display = "flex";
      
      drawCombinedScene();
    } else {
      // Full completion of scenario
      currentScenarioState.completed = true;
      triggerConfetti();
      drawCombinedScene();
    }
  } else {
    // Marked wrong
    inputEl.className = "input-box error";
    // Show validation error helper
    alert(validation.reason);
  }
}

// --- Answer Parsing Logic ---
function parseAnswer(inputStr, correctVal, correctUnit) {
  if (!inputStr) {
    return { valid: false, reason: "Please type an answer in the box." };
  }

  // Regex to extract numeric value and the unit tail
  const match = inputStr.trim().match(/^([+-]?\d+(?:\.\d+)?)\s*([a-zA-Z%]+)$/);
  if (!match) {
    return { 
      valid: false, 
      reason: `Format incorrect. Make sure to input your number and unit together (e.g. "120 J", "4.5 s", "85.2%").` 
    };
  }

  const numPart = parseFloat(match[1]);
  const unitPart = match[2];

  // Unit match checks (case-sensitive)
  if (unitPart !== correctUnit) {
    let specificFeedback = `Unit must be exactly '${correctUnit}'.`;
    if (correctUnit === 'J' && unitPart.toLowerCase() === 'j') {
      specificFeedback = "Check your unit - it must match exactly. J for Joules (capital J, not j).";
    } else if (correctUnit === 'W' && unitPart.toLowerCase() === 'w') {
      specificFeedback = "Check your unit - it must match exactly. W for Watts (capital W, not w).";
    } else if (correctUnit === 's' && unitPart.toLowerCase() === 's') {
      specificFeedback = "Check your unit - it must match exactly. s for seconds (lowercase s, not S).";
    } else if (correctUnit === '%' && unitPart !== '%') {
      specificFeedback = "Check your unit - it must match exactly. % symbol is required for efficiency calculations.";
    }
    return { valid: false, reason: specificFeedback };
  }

  // Value checks (accept answers rounded to 0-4 decimal places)
  // We check if the difference is very small (within 0.05% tolerance or math rounding match)
  const difference = Math.abs(numPart - correctVal);
  const percentDiff = correctVal === 0 ? difference : (difference / correctVal) * 100;
  
  if (percentDiff < 0.2 || difference < 0.01) {
    return { valid: true };
  }

  return { 
    valid: false, 
    reason: `Calculated value is incorrect. Try calculation again and keep standard precision.` 
  };
}

// --- Section 3: Quiz Pools and Session engine ---
// Generate questions dynamically to satisfy pool size requirement.
// Work done questions (5 types), Power questions (5 types), Efficiency (5 types), Combined (4 types)
function generateQuestion(category) {
  // categories: 'work', 'power', 'efficiency', 'combined'
  const randRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const randFloat = (min, max, dec = 1) => parseFloat((Math.random() * (max - min) + min).toFixed(dec));

  if (category === 'work') {
    const type = randRange(1, 5);
    if (type === 1) {
      // Find W given F and d
      const F = randRange(10, 500);
      const d = randFloat(1.0, 50.0);
      const ans = F * d;
      return {
        type: 'Work Done',
        mcq: false,
        text: `A constant force of ${F} N pushes an object horizontally. If the object moves a distance of ${d} m in the direction of the force, calculate the work done.`,
        correctVal: ans,
        unit: 'J',
        solution: `Formula: W = Fd <br> W = ${F} N × ${d} m = <strong>${ans.toFixed(1)} J</strong>`
      };
    } else if (type === 2) {
      // Find F given W and d
      const d = randFloat(2.0, 20.0);
      const F = randRange(15, 300);
      const W = F * d;
      return {
        type: 'Work Done',
        mcq: false,
        text: `An electric toy does ${W.toFixed(1)} J of work in moving along a path of length ${d} m in the direction of its thrust force. Calculate the average force exerted.`,
        correctVal: F,
        unit: 'N', // prompt asks for force
        solution: `Formula: W = Fd  ➔  F = W / d <br> F = ${W.toFixed(1)} J ÷ ${d} m = <strong>${F} N</strong>`
      };
    } else if (type === 3) {
      // Find d given W and F
      const F = randRange(10, 250);
      const d = randFloat(2.0, 40.0);
      const W = F * d;
      return {
        type: 'Work Done',
        mcq: false,
        text: `A winch does ${W.toFixed(1)} J of work in pulling a metal block with a constant tension force of ${F} N. What distance is the block moved?`,
        correctVal: d,
        unit: 'm',
        solution: `Formula: W = Fd  ➔  d = W / F <br> d = ${W.toFixed(1)} J ÷ ${F} N = <strong>${d.toFixed(1)} m</strong>`
      };
    } else if (type === 4) {
      // Conceptual MCQ
      return {
        type: 'Work Done',
        mcq: true,
        text: "A student carries a box of mass 5 kg horizontally at a constant height for a distance of 10 m. Is any work done against the gravitational force?",
        options: [
          "Yes, work is done because the box is moved a distance of 10 m.",
          "No, because there is no displacement of the box in the direction of the gravitational force (vertically).",
          "Yes, because force is required to keep the box lifted.",
          "No, because the box has no energy in the gravitational potential store."
        ],
        correctIndex: 1,
        solution: "Work done is defined as the force multiplied by distance moved in the direction of that force. Since the gravity force acts vertically downwards and the movement is horizontal, no work is done against gravity."
      };
    } else {
      // Given two forces, find net work
      const F_apply = randRange(100, 400);
      const F_friction = randRange(10, 80);
      const d = randFloat(5.0, 30.0);
      const netForce = F_apply - F_friction;
      const ans = netForce * d;
      return {
        type: 'Work Done',
        mcq: false,
        text: `A box is pushed along a floor with an applied force of ${F_apply} N against a friction force of ${F_friction} N. If the box moves ${d} m, calculate the net work done to transfer energy to the kinetic store.`,
        correctVal: ans,
        unit: 'J',
        solution: `Net Force = Applied Force - Friction = ${F_apply} - ${F_friction} = ${netForce} N.<br> Net Work Done = Net Force × d = ${netForce} N × ${d} m = <strong>${ans.toFixed(1)} J</strong>`
      };
    }
  }

  if (category === 'power') {
    const type = randRange(1, 5);
    if (type === 1) {
      // Find power given E and t
      const E = randRange(200, 5000);
      const t = randRange(5, 120);
      const ans = E / t;
      return {
        type: 'Power',
        mcq: false,
        text: `An appliance transfers ${E} J of energy to the energy in the internal store of its surroundings in ${t} s. Calculate its power.`,
        correctVal: ans,
        unit: 'W',
        solution: `Formula: P = E / t <br> P = ${E} J ÷ ${t} s = <strong>${ans.toFixed(2)} W</strong>`
      };
    } else if (type === 2) {
      // Find E given P and t
      const P = randRange(100, 2000);
      const t = randRange(10, 60);
      const ans = P * t;
      return {
        type: 'Power',
        mcq: false,
        text: `A lightbulb has a power rating of ${P} W. How much energy is transferred by the lightbulb in ${t} s?`,
        correctVal: ans,
        unit: 'J',
        solution: `Formula: P = E / t  ➔  E = P × t <br> E = ${P} W × ${t} s = <strong>${ans} J</strong>`
      };
    } else if (type === 3) {
      // Find t given P and E
      const P = randRange(50, 500);
      const t = randRange(10, 100);
      const E = P * t;
      return {
        type: 'Power',
        mcq: false,
        text: `A small motor has a power output of ${P} W. How long does it take to transfer ${E} J of energy to the load's gravitational potential store?`,
        correctVal: t,
        unit: 's',
        solution: `Formula: P = E / t  ➔  t = E / P <br> t = ${E} J ÷ ${P} W = <strong>${t} s</strong>`
      };
    } else if (type === 4) {
      // Conceptual MCQ
      return {
        type: 'Power',
        mcq: true,
        text: "Two electric motors, X and Y, lift identical loads of mass 10 kg to the same vertical height. Motor X takes 12 seconds, while Motor Y takes 24 seconds. Which statement is correct?",
        options: [
          "Motor Y is more powerful because it takes longer to do the work.",
          "Motor X is more powerful because it transfers the same energy in half the time.",
          "Both motors are equally powerful since they lift the same loads.",
          "Motor X performs twice as much work as Motor Y."
        ],
        correctIndex: 1,
        solution: "Power is the rate of energy transfer. Motor X does the same work in less time, meaning its rate of energy transfer is higher, hence X is more powerful."
      };
    } else {
      // Given mass, height, time, find power (g = 10)
      const m = randRange(10, 200);
      const h = randRange(2, 30);
      const t = randRange(5, 60);
      const E = m * 10 * h;
      const P = E / t;
      return {
        type: 'Power',
        mcq: false,
        text: `A motor lifts a block of mass ${m} kg vertically upwards through a height of ${h} m in ${t} s. Calculate the power developed by the motor. (Use g = 10 N/kg)`,
        correctVal: P,
        unit: 'W',
        solution: `Energy transferred to gravitational potential store = mgh = ${m} kg × 10 N/kg × ${h} m = ${E} J.<br> Power = E / t = ${E} J ÷ ${t} s = <strong>${P.toFixed(2)} W</strong>`
      };
    }
  }

  if (category === 'efficiency') {
    const type = randRange(1, 5);
    if (type === 1) {
      // Find efficiency given output and input
      const input = randRange(500, 5000);
      const output = randRange(100, Math.floor(input * 0.9));
      const ans = (output / input) * 100;
      return {
        type: 'Efficiency',
        mcq: false,
        text: `An electrical machine takes in ${input} J of electrical energy and outputs ${output} J of useful energy. Calculate the percentage efficiency of the machine.`,
        correctVal: ans,
        unit: '%',
        solution: `Formula: efficiency = (useful output / total input) × 100% <br> efficiency = (${output} J / ${input} J) × 100% = <strong>${ans.toFixed(1)}%</strong>`
      };
    } else if (type === 2) {
      // Find output given eff and input
      const input = randRange(500, 3000);
      const eff = randRange(30, 90);
      const ans = (eff / 100) * input;
      return {
        type: 'Efficiency',
        mcq: false,
        text: `A solar panel system has an efficiency of ${eff}%. If it receives a total energy input of ${input} J from sunlight, calculate the useful energy output.`,
        correctVal: ans,
        unit: 'J',
        solution: `Formula: useful output = efficiency × total input <br> useful output = (${eff}% ÷ 100) × ${input} J = <strong>${ans.toFixed(1)} J</strong>`
      };
    } else if (type === 3) {
      // Find input given eff and output
      const output = randRange(100, 1500);
      const eff = randRange(40, 95);
      const ans = (output / eff) * 100;
      return {
        type: 'Efficiency',
        mcq: false,
        text: `A generator with a percentage efficiency of ${eff}% delivers a useful electrical energy output of ${output} J. Calculate the total energy input required.`,
        correctVal: ans,
        unit: 'J',
        solution: `Formula: total input = useful output / (efficiency / 100) <br> total input = ${output} J ÷ (${eff / 100}) = <strong>${ans.toFixed(1)} J</strong>`
      };
    } else if (type === 4) {
      // Given power input and efficiency, find useful power
      const Pin = randRange(100, 3000);
      const eff = randRange(25, 90);
      const ans = (eff / 100) * Pin;
      return {
        type: 'Efficiency',
        mcq: false,
        text: `An electric pump draws ${Pin} W of power from the mains electricity. If its power efficiency is ${eff}%, find its useful power output.`,
        correctVal: ans,
        unit: 'W',
        solution: `Formula: useful power = (efficiency / 100) × input power <br> useful power = (${eff}% ÷ 100) × ${Pin} W = <strong>${ans.toFixed(1)} W</strong>`
      };
    } else {
      // MCQ
      return {
        type: 'Efficiency',
        mcq: true,
        text: "Why can the efficiency of a real machine never exceed or even equal 100%?",
        options: [
          "Because some energy is always transferred to the surroundings' energy in the internal store.",
          "Because energy is destroyed when machines operate.",
          "Because total energy input is always smaller than useful energy output.",
          "Because friction acts to create new heat energy."
        ],
        correctIndex: 0,
        solution: "In all real devices, some input energy is inevitably transferred to the energy in the internal store of the machine components and the surroundings (e.g. by friction). Therefore, useful output is always less than total input."
      };
    }
  }

  // category === 'combined'
  const scenario = combinedScenariosList[randRange(0, 3)];
  const stepIdx = randRange(0, 2);
  const stepObj = scenario.steps[stepIdx];

  // Randomise the prompt slightly by giving the scenario context
  return {
    type: 'Combined',
    mcq: false,
    text: `[Context: ${scenario.title}] ${scenario.desc} <br><br> <strong>Question:</strong> ${stepObj.prompt}`,
    correctVal: stepObj.correctVal,
    unit: stepObj.unit,
    solution: `Syllabus Step worked solution: <br> ${stepObj.working}`
  };
}

let quizQuestions = [];
let currentQuizIndex = 0;
let quizScore = 0;
let quizAnswersLog = []; // track errors for detailed feedback

function startQuiz() {
  quizScore = 0;
  currentQuizIndex = 0;
  quizAnswersLog = [];
  
  // Construct 15 questions: 4 work, 4 power, 4 efficiency, 3 combined
  quizQuestions = [];
  for (let i = 0; i < 4; i++) quizQuestions.push(generateQuestion('work'));
  for (let i = 0; i < 4; i++) quizQuestions.push(generateQuestion('power'));
  for (let i = 0; i < 4; i++) quizQuestions.push(generateQuestion('efficiency'));
  for (let i = 0; i < 3; i++) quizQuestions.push(generateQuestion('combined'));

  // Shuffle
  quizQuestions.sort(() => Math.random() - 0.5);

  document.getElementById('quiz-intro-card').style.display = 'none';
  document.getElementById('section-score').style.display = 'none';
  document.getElementById('quiz-question-card').style.display = 'block';

  showQuizQuestion();
}

function showQuizQuestion() {
  const q = quizQuestions[currentQuizIndex];
  document.getElementById('quiz-progress-text').innerText = `Question ${currentQuizIndex + 1} of 15`;
  document.getElementById('quiz-question-type').innerText = q.type;
  
  const progressPct = ((currentQuizIndex) / 15) * 100;
  document.getElementById('quiz-progress-bar').style.width = `${progressPct}%`;

  document.getElementById('quiz-question-text').innerHTML = q.text;
  document.getElementById('quiz-solution-box').style.display = 'none';

  if (q.mcq) {
    document.getElementById('quiz-input-container').style.display = 'none';
    document.getElementById('quiz-mcq-container').style.display = 'flex';
    
    // Load options
    const mcqBox = document.getElementById('quiz-mcq-container');
    mcqBox.innerHTML = '';
    q.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'mcq-option';
      btn.innerText = opt;
      btn.onclick = () => submitMCQAnswer(idx);
      mcqBox.appendChild(btn);
    });
  } else {
    document.getElementById('quiz-input-container').style.display = 'block';
    document.getElementById('quiz-mcq-container').style.display = 'none';
    
    const textInput = document.getElementById('quiz-text-input');
    textInput.value = '';
    textInput.className = 'input-box';
    textInput.disabled = false;
    document.getElementById('quiz-submit-btn').disabled = false;
  }
}

function handleQuizEnter(e) {
  if (e.key === 'Enter') {
    submitQuizAnswer();
  }
}

function submitQuizAnswer() {
  const q = quizQuestions[currentQuizIndex];
  const inputEl = document.getElementById('quiz-text-input');
  const userText = inputEl.value;

  const check = parseAnswer(userText, q.correctVal, q.unit);

  inputEl.disabled = true;
  document.getElementById('quiz-submit-btn').disabled = true;

  const isCorrect = check.valid;
  if (isCorrect) {
    quizScore++;
    inputEl.className = 'input-box correct';
    showQuizFeedback(true, q.solution);
  } else {
    inputEl.className = 'input-box error';
    showQuizFeedback(false, q.solution, check.reason);
  }

  // Log answer
  quizAnswersLog.push({
    question: q.text,
    correct: isCorrect,
    userAnswer: userText,
    solution: q.solution,
    reason: check.reason || null
  });
}

function submitMCQAnswer(selectedIdx) {
  const q = quizQuestions[currentQuizIndex];
  const options = document.querySelectorAll('.mcq-option');
  
  options.forEach(opt => opt.disabled = true);

  const isCorrect = (selectedIdx === q.correctIndex);
  if (isCorrect) {
    quizScore++;
    options[selectedIdx].classList.add('correct');
    showQuizFeedback(true, q.solution);
  } else {
    options[selectedIdx].classList.add('wrong');
    options[q.correctIndex].classList.add('correct');
    showQuizFeedback(false, q.solution);
  }

  quizAnswersLog.push({
    question: q.text,
    correct: isCorrect,
    userAnswer: q.options[selectedIdx],
    solution: q.solution,
    reason: isCorrect ? null : "Incorrect conceptual choice."
  });
}

function showQuizFeedback(correct, solutionHtml, errorMsg = "") {
  const solBox = document.getElementById('quiz-solution-box');
  const titleText = document.getElementById('quiz-feedback-status');
  const titleIcon = document.getElementById('quiz-feedback-icon');
  const solText = document.getElementById('quiz-solution-text');

  solBox.style.display = 'block';

  if (correct) {
    titleText.innerText = "Correct! ⚡";
    titleText.style.color = 'var(--accent-green)';
    titleIcon.innerHTML = `<svg style="width:18px;height:18px;" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4" stroke="var(--accent-green)" stroke-width="3" fill="none"/></svg>`;
    solText.innerHTML = solutionHtml;
  } else {
    titleText.innerText = "Incorrect";
    titleText.style.color = 'var(--accent-red)';
    titleIcon.innerHTML = `<svg style="width:18px;height:18px;" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" stroke="var(--accent-red)" stroke-width="3" fill="none"/></svg>`;
    
    let explanation = "";
    if (errorMsg) {
      explanation = `<p style="color:var(--accent-red); font-weight:600; margin-bottom: 0.5rem;">${errorMsg}</p>`;
    }
    solText.innerHTML = explanation + solutionHtml;
  }
}

function nextQuizQuestion() {
  currentQuizIndex++;
  if (currentQuizIndex < 15) {
    showQuizQuestion();
  } else {
    finishQuiz();
  }
}

function finishQuiz() {
  document.getElementById('quiz-question-card').style.display = 'none';
  document.getElementById('section-score').style.display = 'block';

  // Update Score layout
  document.getElementById('score-num').innerText = quizScore;
  const headline = document.getElementById('score-headline');
  const feedback = document.getElementById('score-feedback-text');

  if (quizScore >= 13) {
    headline.innerText = "Power Player! ⚡";
    feedback.innerText = "Fantastic performance! You have fully mastered work done, power, and efficiency calculation structures and terminology.";
    triggerConfetti();
  } else if (quizScore >= 9) {
    headline.innerText = "Good effort!";
    feedback.innerText = "A solid try. Double-check your formula setups and pay careful attention to case-sensitive units next time.";
  } else {
    headline.innerText = "Keep practicing!";
    feedback.innerText = "Review the concepts in Section 1 and Section 2, then try again. Focus on getting units (J, W, s, %) correct.";
  }
}

function viewDetailedFeedback() {
  const container = document.getElementById('detailed-feedback-container');
  const list = document.getElementById('detailed-feedback-list');
  
  container.style.display = 'block';
  list.innerHTML = '';

  quizAnswersLog.forEach((log, index) => {
    const item = document.createElement('div');
    item.className = 'step-card';
    item.style.marginBottom = '1rem';
    item.style.borderColor = log.correct ? 'var(--accent-green)' : 'var(--accent-red)';
    
    item.innerHTML = `
      <div class="step-header">
        <span class="step-number" style="color:${log.correct ? 'var(--accent-green)' : 'var(--accent-red)'}">Question ${index + 1}</span>
        <span class="step-badge ${log.correct ? 'success' : 'pending'}">${log.correct ? 'Correct' : 'Incorrect'}</span>
      </div>
      <p style="font-size:0.9rem; margin-bottom:0.5rem;">${log.question}</p>
      <div style="font-size:0.8rem; color:var(--text-secondary);">
        <p>Your Answer: <strong style="color:${log.correct ? 'var(--accent-green)' : 'var(--accent-red)'}">${log.userAnswer || '[No Answer]'}</strong></p>
        ${log.reason ? `<p style="color:var(--accent-red); margin-top:0.2rem;">⚠️ ${log.reason}</p>` : ''}
        <div class="solution-box" style="margin-top:0.5rem; padding:0.75rem;">
          <div class="solution-title" style="font-size:0.75rem;">Worked Solution</div>
          <div class="solution-content" style="font-size:0.8rem;">${log.solution}</div>
        </div>
      </div>
    `;
    list.appendChild(item);
  });
}

// --- Section 5: Flashcards ---
const flashcardsList = [
  { f: "A force of 50 N pushes a box 4 m. What is the work done?", b: "W = Fd = 50 × 4 = 200 J", unit: "J" },
  { f: "A motor transfers 600 J in 30 s. What is its power?", b: "P = E/t = 600 ÷ 30 = 20 W", unit: "W" },
  { f: "A machine has a useful output of 400 J and total input of 500 J. What is its efficiency?", b: "Efficiency = (400 ÷ 500) × 100% = 80%", unit: "%" },
  { f: "What is the unit of power?", b: "Watts (W) — capital W", unit: "W" },
  { f: "A 10 kg mass is lifted 5 m in 10 s. What is the power of the motor? (g = 10 N/kg)", b: "E = mgh = 10 × 10 × 5 = 500 J. P = 500 ÷ 10 = 50 W", unit: "W" },
  { f: "Define Work Done in terms of force and displacement.", b: "Work done is the product of the force and the distance moved in the direction of the force.", unit: "J" },
  { f: "What is the SI unit of work done and energy?", b: "Joules (J) — capital J", unit: "J" },
  { f: "How do you calculate efficiency using power values?", b: "Efficiency = (useful power output ÷ total power input) × 100%", unit: "%" },
  { f: "A motor of power rating 60 W runs for 5 seconds. How much energy is transferred?", b: "E = P × t = 60 × 5 = 300 J", unit: "J" },
  { f: "What energy store does a raised object transfer its energy to?", b: "Gravitational potential store", unit: "J" },
  { f: "What energy store increases when an object is pushed against friction?", b: "Energy in the internal store of the box and the floor", unit: "J" },
  { f: "A machine is supplied 1000 J of energy. If 400 J is useful output, how much is transferred to the energy in the internal store?", b: "Energy in the internal store = 1000 - 400 = 600 J (do not use the word 'lost')", unit: "J" },
  { f: "Calculate work done if a 20 N force acts perpendicular to a 5 m displacement.", b: "0 J — No movement in the direction of the force.", unit: "J" },
  { f: "State the formula for Gravitational Potential Store change.", b: "E = mgh (where g = 10 N/kg in Singapore Syllabus)", unit: "J" },
  { f: "Define Power in terms of energy transfer rate.", b: "Power is the rate of energy transfer or rate of doing work.", unit: "W" },
  { f: "What is the correct symbol representation of seconds?", b: "Lowercase s (case-sensitive)", unit: "s" },
  { f: "A device is 45% efficient. If input energy is 200 J, what is the useful energy output?", b: "Useful output = 0.45 × 200 = 90 J", unit: "J" },
  { f: "What is the unit of force?", b: "Newtons (N) — capital N", unit: "N" },
  { f: "Why is energy in the internal store often considered non-useful in mechanics?", b: "It is dissipated to the surroundings and cannot be easily repurposed for mechanical work.", unit: "J" },
  { f: "A runner of mass 50 kg climbs a 10 m tall staircase. What is the increase in their gravitational potential store?", b: "E = mgh = 50 × 10 × 10 = 5000 J", unit: "J" }
];

let activeFlashcards = [...flashcardsList];
let currentFlashIndex = 0;
let reviewedCount = 0;
let reviewedSet = new Set();

function renderFlashcard() {
  const card = activeFlashcards[currentFlashIndex];
  const cardEl = document.getElementById('flashcard');
  
  // Reset flipped state
  cardEl.classList.remove('flipped');
  
  document.getElementById('flashcard-front-text').innerText = card.f;
  document.getElementById('flashcard-back-text').innerText = card.b;
  document.getElementById('flashcard-back-math').style.display = "none"; // we put standard answers together inside text

  // Set progress
  document.getElementById('flash-progress').innerText = `Card ${currentFlashIndex + 1} of ${activeFlashcards.length} • Reviewed: ${reviewedSet.size}`;
}

function flipFlashcard() {
  const cardEl = document.getElementById('flashcard');
  cardEl.classList.toggle('flipped');
  
  // Track reviewed cards
  reviewedSet.add(currentFlashIndex);
  document.getElementById('flash-progress').innerText = `Card ${currentFlashIndex + 1} of ${activeFlashcards.length} • Reviewed: ${reviewedSet.size}`;
}

function nextFlashcard() {
  currentFlashIndex = (currentFlashIndex + 1) % activeFlashcards.length;
  renderFlashcard();
}

function prevFlashcard() {
  currentFlashIndex = (currentFlashIndex - 1 + activeFlashcards.length) % activeFlashcards.length;
  renderFlashcard();
}

function shuffleFlashcards() {
  activeFlashcards.sort(() => Math.random() - 0.5);
  currentFlashIndex = 0;
  reviewedSet.clear();
  renderFlashcard();
}

// --- Confetti celebration helper ---
function triggerConfetti() {
  for (let i = 0; i < 40; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = `${Math.random() * 100}vw`;
    confetti.style.animationDelay = `${Math.random() * 1.5}s`;
    
    // Random color
    const colors = [varColor('--accent-cyan'), varColor('--accent-green'), '#ffffff', '#ffed4a'];
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    
    document.body.appendChild(confetti);

    // Remove element
    setTimeout(() => {
      confetti.remove();
    }, 4500);
  }
}

// Helper to get CSS root variables
function varColor(variableName) {
  return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
}

// Page load event
window.onload = () => {
  initCanvases();
  updateWorkSim();
  updatePowerSim();
  updateEffSim();
  resetCombinedScenario();
  renderFlashcard();
};
