document.addEventListener('DOMContentLoaded', () => {
  // --- NAV TRANSITIONS ---
  const navButtons = document.querySelectorAll('.nav-btn');
  const sections = document.querySelectorAll('.section-pane');

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetSec = btn.getAttribute('data-section');
      
      navButtons.forEach(b => b.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));
      
      btn.classList.add('active');
      const targetEl = document.getElementById(targetSec);
      targetEl.classList.add('active');

      // Refresh dimensions of dynamic SVGs upon switching sections
      if (targetSec === 'section2') {
        updateExplorer();
      } else if (targetSec === 'section3') {
        updateBuilder();
      }
    });
  });

  // ==========================================
  // SECTION 2: ANGLE EXPLORER
  // ==========================================
  const expAngleSlider = document.getElementById('explorer-angle-slider');
  const expAngleVal = document.getElementById('explorer-angle-val');
  const expCalcD = document.getElementById('exp-calc-d');
  const expCalcM = document.getElementById('exp-calc-m');

  function updateExplorer() {
    const angleDeg = parseInt(expAngleSlider.value, 10);
    const angleRad = (angleDeg * Math.PI) / 180;
    expAngleVal.textContent = `${angleDeg}°`;

    const F = 20; // N
    const L = 1.0; // m
    const L_px = 250; // pixels for drawing
    const pivotX = 100;
    const pivotY = 250;
    
    // Arm end coordinate
    const armEndX = pivotX + L_px;
    const armEndY = pivotY;

    // Line of action unit vector (direction is 180 - angleDeg)
    const ux = -Math.cos(angleRad);
    const uy = -Math.sin(angleRad);

    // Projection calculation: projection of pivot-to-end vector onto line of action
    // EP = P - E = (-250, 0)
    // projection = EP . u = 250 * cos(angleRad)
    const projLen = L_px * Math.cos(angleRad);
    
    // Proj Point D
    const dx = armEndX + projLen * ux;
    const dy = armEndY + projLen * uy;

    // Force arrow vector (length = 80 px)
    const F_len = 80;
    const fEndX = armEndX + F_len * ux;
    const fEndY = armEndY + F_len * uy;

    // SVG elements
    const expLineAction = document.getElementById('exp-line-action');
    const expPerpLine = document.getElementById('exp-perp-line');
    const expRightAngle = document.getElementById('exp-right-angle');
    const expForceGroup = document.getElementById('exp-force-group');
    const expAngleArc = document.getElementById('exp-angle-arc');
    
    const expLblPerp = document.getElementById('exp-lbl-perp');
    const expLblForce = document.getElementById('exp-lbl-force');
    const expLblAngle = document.getElementById('exp-lbl-angle');

    // Update force arrow paths
    expForceGroup.querySelector('.force-arrow').setAttribute('d', `M ${armEndX},${armEndY} L ${fEndX},${fEndY}`);
    
    // Rotate force head
    const forceHead = expForceGroup.querySelector('.force-head');
    const alpha = (Math.atan2(uy, ux) * 180) / Math.PI;
    forceHead.setAttribute('transform', `translate(${fEndX}, ${fEndY}) rotate(${alpha + 90})`);

    // Draw line of action (extending both directions)
    const actionStartX = armEndX - 100 * ux;
    const actionStartY = armEndY - 100 * uy;
    const actionEndX = armEndX + 200 * ux;
    const actionEndY = armEndY + 200 * uy;
    expLineAction.setAttribute('x1', actionStartX);
    expLineAction.setAttribute('y1', actionStartY);
    expLineAction.setAttribute('x2', actionEndX);
    expLineAction.setAttribute('y2', actionEndY);

    // Perpendicular distance line
    expPerpLine.setAttribute('x1', pivotX);
    expPerpLine.setAttribute('y1', pivotY);
    expPerpLine.setAttribute('x2', dx);
    expPerpLine.setAttribute('y2', dy);

    // Right angle bracket at point D
    // Project towards pivot (v) and along line of action (u)
    const d_len = Math.sqrt((pivotX - dx) ** 2 + (pivotY - dy) ** 2);
    const vx = d_len > 0 ? (pivotX - dx) / d_len : -1;
    const vy = d_len > 0 ? (pivotY - dy) / d_len : 0;

    const scale = 12;
    const rx1 = dx + vx * scale;
    const ry1 = dy + vy * scale;
    const rx2 = dx + vx * scale + ux * scale;
    const ry2 = dy + vy * scale + uy * scale;
    const rx3 = dx + ux * scale;
    const ry3 = dy + uy * scale;
    expRightAngle.setAttribute('d', `M ${rx1},${ry1} L ${rx2},${ry2} L ${rx3},${ry3}`);

    // Update labels position
    // Label force at tip + offset
    expLblForce.setAttribute('x', fEndX - ux * 10);
    expLblForce.setAttribute('y', fEndY - uy * 10 - 5);
    
    // Label perpendicular distance at midpoint of perpendicular line
    const midX = (pivotX + dx) / 2;
    const midY = (pivotY + dy) / 2;
    expLblPerp.setAttribute('x', midX - 15);
    expLblPerp.setAttribute('y', midY - 15);
    const perpDist = L * Math.sin(angleRad);
    expLblPerp.textContent = `d = ${perpDist.toFixed(2)} m`;

    // Angle label & arc
    const arcRadius = 30;
    const arcStartX = armEndX - arcRadius;
    const arcStartY = armEndY;
    const arcEndX = armEndX - arcRadius * Math.cos(angleRad);
    const arcEndY = armEndY - arcRadius * Math.sin(angleRad);
    expAngleArc.setAttribute('d', `M ${arcStartX},${arcStartY} A ${arcRadius},${arcRadius} 0 0,1 ${arcEndX},${arcEndY}`);
    
    // Place theta label inside arc
    const thetaLblX = armEndX - (arcRadius + 15) * Math.cos(angleRad / 2);
    const thetaLblY = armEndY - (arcRadius + 15) * Math.sin(angleRad / 2);
    expLblAngle.setAttribute('x', thetaLblX);
    expLblAngle.setAttribute('y', thetaLblY);
    expLblAngle.textContent = `${angleDeg}°`;

    // Calculations text
    expCalcD.innerHTML = `1.0 m &times; sin(${angleDeg}&deg;) = <strong>${perpDist.toFixed(2)} m</strong>`;
    const moment = F * perpDist;
    expCalcM.innerHTML = `${F} N &times; ${perpDist.toFixed(2)} m = <strong>${moment.toFixed(1)} Nm</strong>`;
  }

  expAngleSlider.addEventListener('input', updateExplorer);

  // ==========================================
  // SECTION 3: INTERACTIVE DIAGRAM BUILDER
  // ==========================================
  const buildForceSlider = document.getElementById('build-force-slider');
  const buildArmSlider = document.getElementById('build-arm-slider');
  const buildAngleSlider = document.getElementById('build-angle-slider');

  const buildForceVal = document.getElementById('build-force-val');
  const buildArmVal = document.getElementById('build-arm-val');
  const buildAngleVal = document.getElementById('build-angle-val');

  const buildCalcD = document.getElementById('build-calc-d');
  const buildCalcM = document.getElementById('build-calc-m');

  function updateBuilder() {
    const F = parseInt(buildForceSlider.value, 10);
    const L = parseFloat(buildArmSlider.value);
    const angleDeg = parseInt(buildAngleSlider.value, 10);
    const angleRad = (angleDeg * Math.PI) / 180;

    buildForceVal.textContent = `${F} N`;
    buildArmVal.textContent = `${L.toFixed(1)} m`;
    buildAngleVal.textContent = `${angleDeg}°`;

    // Visual scale: 1.0 m = 130 pixels
    const pxScale = 130;
    const L_px = L * pxScale;
    const pivotX = 100;
    const pivotY = 250;

    const armEndX = pivotX + L_px;
    const armEndY = pivotY;

    // Update lever arm line
    document.getElementById('build-arm').setAttribute('x2', armEndX);
    document.getElementById('build-lbl-arm').setAttribute('x', pivotX + L_px / 2);
    document.getElementById('build-lbl-arm').textContent = `L = ${L.toFixed(1)} m`;

    const ux = -Math.cos(angleRad);
    const uy = -Math.sin(angleRad);

    const projLen = L_px * Math.cos(angleRad);
    const dx = armEndX + projLen * ux;
    const dy = armEndY + projLen * uy;

    // Force arrow vector length dynamic (30 to 90px)
    const F_len = 35 + (F / 50) * 60;
    const fEndX = armEndX + F_len * ux;
    const fEndY = armEndY + F_len * uy;

    // SVG elements
    const buildLineAction = document.getElementById('build-line-action');
    const buildPerpLine = document.getElementById('build-perp-line');
    const buildRightAngle = document.getElementById('build-right-angle');
    const buildForceGroup = document.getElementById('build-force-group');
    const buildAngleArc = document.getElementById('build-angle-arc');
    
    const buildLblPerp = document.getElementById('build-lbl-perp');
    const buildLblForce = document.getElementById('build-lbl-force');
    const buildLblAngle = document.getElementById('build-lbl-angle');

    // Force Arrow
    buildForceGroup.querySelector('.force-arrow').setAttribute('d', `M ${armEndX},${armEndY} L ${fEndX},${fEndY}`);
    const forceHead = buildForceGroup.querySelector('.force-head');
    const alpha = (Math.atan2(uy, ux) * 180) / Math.PI;
    forceHead.setAttribute('transform', `translate(${fEndX}, ${fEndY}) rotate(${alpha + 90})`);
    
    // Drag handle circle placed at arrow end for drag interactions
    const dragHandle = document.getElementById('build-drag-handle');
    dragHandle.setAttribute('cx', fEndX);
    dragHandle.setAttribute('cy', fEndY);

    // Line of action
    const actionStartX = armEndX - 100 * ux;
    const actionStartY = armEndY - 100 * uy;
    const actionEndX = armEndX + 200 * ux;
    const actionEndY = armEndY + 200 * uy;
    buildLineAction.setAttribute('x1', actionStartX);
    buildLineAction.setAttribute('y1', actionStartY);
    buildLineAction.setAttribute('x2', actionEndX);
    buildLineAction.setAttribute('y2', actionEndY);

    // Perpendicular line
    buildPerpLine.setAttribute('x1', pivotX);
    buildPerpLine.setAttribute('y1', pivotY);
    buildPerpLine.setAttribute('x2', dx);
    buildPerpLine.setAttribute('y2', dy);

    // Right angle bracket
    const d_len = Math.sqrt((pivotX - dx) ** 2 + (pivotY - dy) ** 2);
    const vx = d_len > 0 ? (pivotX - dx) / d_len : -1;
    const vy = d_len > 0 ? (pivotY - dy) / d_len : 0;

    const scale = 12;
    const rx1 = dx + vx * scale;
    const ry1 = dy + vy * scale;
    const rx2 = dx + vx * scale + ux * scale;
    const ry2 = dy + vy * scale + uy * scale;
    const rx3 = dx + ux * scale;
    const ry3 = dy + uy * scale;
    buildRightAngle.setAttribute('d', `M ${rx1},${ry1} L ${rx2},${ry2} L ${rx3},${ry3}`);

    // Labels
    buildLblForce.setAttribute('x', fEndX - ux * 10);
    buildLblForce.setAttribute('y', fEndY - uy * 10 - 5);
    buildLblForce.textContent = `F = ${F} N`;

    const midX = (pivotX + dx) / 2;
    const midY = (pivotY + dy) / 2;
    buildLblPerp.setAttribute('x', midX - 15);
    buildLblPerp.setAttribute('y', midY - 15);
    const perpDist = L * Math.sin(angleRad);
    buildLblPerp.textContent = `d = ${perpDist.toFixed(2)} m`;

    const arcRadius = 30;
    const arcStartX = armEndX - arcRadius;
    const arcStartY = armEndY;
    const arcEndX = armEndX - arcRadius * Math.cos(angleRad);
    const arcEndY = armEndY - arcRadius * Math.sin(angleRad);
    buildAngleArc.setAttribute('d', `M ${arcStartX},${arcStartY} A ${arcRadius},${arcRadius} 0 0,1 ${arcEndX},${arcEndY}`);

    const thetaLblX = armEndX - (arcRadius + 15) * Math.cos(angleRad / 2);
    const thetaLblY = armEndY - (arcRadius + 15) * Math.sin(angleRad / 2);
    buildLblAngle.setAttribute('x', thetaLblX);
    buildLblAngle.setAttribute('y', thetaLblY);
    buildLblAngle.textContent = `${angleDeg}°`;

    // Workings Text
    buildCalcD.innerHTML = `${L.toFixed(1)}m &times; sin(${angleDeg}&deg;) = <strong>${perpDist.toFixed(2)} m</strong>`;
    const moment = F * perpDist;
    buildCalcM.innerHTML = `${F} N &times; ${perpDist.toFixed(2)} m = <strong>${moment.toFixed(1)} Nm</strong>`;
  }

  // Bind sliders
  buildForceSlider.addEventListener('input', updateBuilder);
  buildArmSlider.addEventListener('input', updateBuilder);
  buildAngleSlider.addEventListener('input', updateBuilder);

  // --- MOUSE/TOUCH DRAG FORCE ANGLE HANDLE ---
  let isDragging = false;
  const buildSvg = document.getElementById('builder-svg');

  function getAngleFromMouse(e) {
    const rect = buildSvg.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    // Mouse coords relative to SVG system
    const mouseX = ((clientX - rect.left) / rect.width) * 500;
    const mouseY = ((clientY - rect.top) / rect.height) * 350;

    // Origin of rotation is the end of the lever arm
    const L = parseFloat(buildArmSlider.value);
    const L_px = L * 130;
    const armEndX = 100 + L_px;
    const armEndY = 250;

    // Vector from armEnd to mouse
    const dx = mouseX - armEndX;
    const dy = mouseY - armEndY;

    // Angle relative to horizontal left
    // We want the angle pointing up-left. Vector angle from horizontal right is atan2(dy, dx)
    // For theta = 90deg, dy = -y, dx = 0 (atan2(-1, 0) = -90deg or 270deg)
    // We want output angle from 10 to 90
    let thetaRad = Math.atan2(-dy, -dx);
    let thetaDeg = Math.round((thetaRad * 180) / Math.PI);
    
    // Clamp to [10, 90]
    if (thetaDeg < 10) thetaDeg = 10;
    if (thetaDeg > 90) thetaDeg = 90;
    
    return thetaDeg;
  }

  function handleStart(e) {
    isDragging = true;
    e.preventDefault();
  }

  function handleMove(e) {
    if (!isDragging) return;
    const angle = getAngleFromMouse(e);
    buildAngleSlider.value = angle;
    updateBuilder();
  }

  function handleEnd() {
    isDragging = false;
  }

  const dragHandle = document.getElementById('build-drag-handle');
  dragHandle.addEventListener('mousedown', handleStart);
  dragHandle.addEventListener('touchstart', handleStart, { passive: false });

  window.addEventListener('mousemove', handleMove);
  window.addEventListener('touchmove', handleMove, { passive: false });

  window.addEventListener('mouseup', handleEnd);
  window.addEventListener('touchend', handleEnd);

  // ==========================================
  // SECTION 4: QUIZ ENGINE
  // ==========================================
  const startQuizBtn = document.getElementById('start-quiz-btn');
  const quizStartScreen = document.getElementById('quiz-start-screen');
  const quizQuestionScreen = document.getElementById('quiz-question-screen');
  const quizEndScreen = document.getElementById('quiz-end-screen');

  const quizQNum = document.getElementById('quiz-q-num');
  const quizScoreVal = document.getElementById('quiz-score-val');
  const quizPromptText = document.getElementById('quiz-prompt-text');
  
  const statPerp = document.getElementById('stat-perp');
  const statForce = document.getElementById('stat-force');
  const statMoment = document.getElementById('stat-moment');

  const quizAnswerInput = document.getElementById('quiz-answer-input');
  const quizActionBtn = document.getElementById('quiz-action-btn');
  const quizSubmitForm = document.getElementById('quiz-submit-form');
  const quizFeedbackBox = document.getElementById('quiz-feedback-box');
  const quizNextBtn = document.getElementById('quiz-next-btn');

  const finalScore = document.getElementById('quiz-final-score');
  const radialProgress = document.getElementById('quiz-radial-progress');
  const gradeTitle = document.getElementById('quiz-grade-title');
  const gradeMsg = document.getElementById('quiz-grade-msg');
  const restartBtn = document.getElementById('quiz-restart-btn');

  let quizQuestions = [];
  let currentQIndex = 0;
  let score = 0;

  const anglePool = [30, 45, 60, 90];

  function generateQuizPool() {
    quizQuestions = [];
    for (let i = 0; i < 30; i++) {
      const arm = parseFloat((Math.random() * (2.0 - 0.2) + 0.2).toFixed(1)); // visual arm (0.2 to 2.0 m)
      const force = Math.floor(Math.random() * (50 - 5 + 1)) + 5; // 5 to 50 N
      const angle = anglePool[Math.floor(Math.random() * anglePool.length)];
      
      const typeOptions = ['A', 'B', 'C'];
      const type = typeOptions[Math.floor(Math.random() * 3)];

      // Calculate perfect correct values
      const sinVal = Math.sin((angle * Math.PI) / 180);
      const d = parseFloat((arm * sinVal).toFixed(2)); // perpendicular distance is computed but shown directly
      const moment = parseFloat((force * d).toFixed(2));

      quizQuestions.push({ arm, force, angle, type, d, moment });
    }
  }

  function startQuiz() {
    score = 0;
    currentQIndex = 0;
    generateQuizPool();
    quizStartScreen.classList.remove('active');
    quizEndScreen.classList.remove('active');
    quizQuestionScreen.classList.add('active');
    quizScoreVal.textContent = score;
    loadQuestion(currentQIndex);
  }

  function loadQuestion(index) {
    const q = quizQuestions[index];
    quizQNum.textContent = index + 1;
    
    // Reset inputs and UI state
    quizAnswerInput.value = '';
    quizAnswerInput.disabled = false;
    quizActionBtn.classList.remove('hidden');
    quizFeedbackBox.classList.add('hidden');
    quizFeedbackBox.classList.remove('incorrect');
    quizSubmitForm.classList.remove('celebrate-pop');

    // Display appropriate diagram and fill text info
    let targetText = '';
    let unitLabel = '';
    
    if (q.type === 'A') {
      targetText = "Calculate the resulting Moment of the force shown from the pivot.";
      unitLabel = "Nm";
      
      statPerp.innerHTML = `Perpendicular Distance (d): <span class="val">${q.d.toFixed(2)} m</span>`;
      statForce.innerHTML = `Force (F): <span class="val">${q.force} N</span>`;
      statMoment.innerHTML = `Moment (M): <span class="val accent-magenta">?</span>`;
    } else if (q.type === 'B') {
      targetText = "Calculate the Perpendicular Distance (d) from the pivot to the line of action.";
      unitLabel = "m";

      statPerp.innerHTML = `Perpendicular Distance (d): <span class="val accent-magenta">?</span>`;
      statForce.innerHTML = `Force (F): <span class="val">${q.force} N</span>`;
      statMoment.innerHTML = `Moment (M): <span class="val">${q.moment.toFixed(2)} Nm</span>`;
    } else {
      targetText = "Calculate the magnitude of the applied Force (F).";
      unitLabel = "N";

      statPerp.innerHTML = `Perpendicular Distance (d): <span class="val">${q.d.toFixed(2)} m</span>`;
      statForce.innerHTML = `Force (F): <span class="val accent-magenta">?</span>`;
      statMoment.innerHTML = `Moment (M): <span class="val">${q.moment.toFixed(2)} Nm</span>`;
    }

    quizPromptText.textContent = targetText;

    // Render Quiz SVG
    renderQuizSvg(q);
  }

  function renderQuizSvg(q) {
    const angleRad = (q.angle * Math.PI) / 180;
    
    // Scale: L of 2.0m matches 230px
    const L_px = (q.arm / 2.0) * 230 + 40;
    const pivotX = 100;
    const pivotY = 250;

    const armEndX = pivotX + L_px;
    const armEndY = pivotY;

    // Lever arm
    const quizArm = document.getElementById('quiz-arm');
    quizArm.setAttribute('x2', armEndX);

    // Label for arm - hide it to keep it purely about d
    const quizLblArm = document.getElementById('quiz-lbl-arm');
    quizLblArm.textContent = "";

    // Project vectors
    const ux = -Math.cos(angleRad);
    const uy = -Math.sin(angleRad);

    const projLen = L_px * Math.cos(angleRad);
    const dx = armEndX + projLen * ux;
    const dy = armEndY + projLen * uy;

    // Force vector coordinates
    const F_len = 70;
    const fEndX = armEndX + F_len * ux;
    const fEndY = armEndY + F_len * uy;

    const quizLineAction = document.getElementById('quiz-line-action');
    const quizPerpLine = document.getElementById('quiz-perp-line');
    const quizRightAngle = document.getElementById('quiz-right-angle');
    const quizForceGroup = document.getElementById('quiz-force-group');
    const quizLblPerp = document.getElementById('quiz-lbl-perp');
    
    const quizLblForce = document.getElementById('quiz-lbl-force');

    // Force line
    quizForceGroup.querySelector('.force-arrow').setAttribute('d', `M ${armEndX},${armEndY} L ${fEndX},${fEndY}`);
    const forceHead = quizForceGroup.querySelector('.force-head');
    const alpha = (Math.atan2(uy, ux) * 180) / Math.PI;
    forceHead.setAttribute('transform', `translate(${fEndX}, ${fEndY}) rotate(${alpha + 90})`);

    // Line of action (dashed projection)
    const actionStartX = armEndX - 100 * ux;
    const actionStartY = armEndY - 100 * uy;
    const actionEndX = armEndX + 200 * ux;
    const actionEndY = armEndY + 200 * uy;
    quizLineAction.setAttribute('x1', actionStartX);
    quizLineAction.setAttribute('y1', actionStartY);
    quizLineAction.setAttribute('x2', actionEndX);
    quizLineAction.setAttribute('y2', actionEndY);

    // Perpendicular line
    quizPerpLine.setAttribute('x1', pivotX);
    quizPerpLine.setAttribute('y1', pivotY);
    quizPerpLine.setAttribute('x2', dx);
    quizPerpLine.setAttribute('y2', dy);

    // Right angle indicator
    const d_len = Math.sqrt((pivotX - dx) ** 2 + (pivotY - dy) ** 2);
    const vx = d_len > 0 ? (pivotX - dx) / d_len : -1;
    const vy = d_len > 0 ? (pivotY - dy) / d_len : 0;

    const scale = 12;
    const rx1 = dx + vx * scale;
    const ry1 = dy + vy * scale;
    const rx2 = dx + vx * scale + ux * scale;
    const ry2 = dy + vy * scale + uy * scale;
    const rx3 = dx + ux * scale;
    const ry3 = dy + uy * scale;
    quizRightAngle.setAttribute('d', `M ${rx1},${ry1} L ${rx2},${ry2} L ${rx3},${ry3}`);

    // Adjust labels
    quizLblForce.setAttribute('x', fEndX - ux * 24);
    quizLblForce.setAttribute('y', fEndY - uy * 24 - 5);
    quizLblForce.textContent = q.type === 'C' ? 'F = ?' : `F = ${q.force} N`;

    // Position perpendicular label
    const midX = (pivotX + dx) / 2;
    const midY = (pivotY + dy) / 2;
    quizLblPerp.setAttribute('x', midX - 15);
    quizLblPerp.setAttribute('y', midY - 15);
    quizLblPerp.textContent = q.type === 'B' ? 'd = ?' : `d = ${q.d.toFixed(2)} m`;
  }

  // Answer verification
  quizSubmitForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const rawInput = quizAnswerInput.value.trim();
    const q = quizQuestions[currentQIndex];

    let correctVal = 0;
    let expectedUnit = '';
    if (q.type === 'A') {
      correctVal = q.moment;
      expectedUnit = 'nm';
    } else if (q.type === 'B') {
      correctVal = q.d;
      expectedUnit = 'm';
    } else {
      correctVal = q.force;
      expectedUnit = 'n';
    }

    let studentAns = NaN;
    let studentUnit = '';
    let isCorrect = false;
    let formatError = false;

    const match = rawInput.match(/^([+-]?\d+(?:\.\d+)?)\s*([a-zA-Z\s]+)$/);
    if (match) {
      studentAns = parseFloat(match[1]);
      studentUnit = match[2].replace(/\s+/g, '').toLowerCase();
      
      const errorMargin = Math.abs(studentAns - correctVal) / correctVal;
      isCorrect = (errorMargin <= 0.02) && (studentUnit === expectedUnit);
    } else {
      formatError = true;
    }

    quizAnswerInput.disabled = true;
    quizActionBtn.classList.add('hidden');
    quizFeedbackBox.classList.remove('hidden');

    const feedbackTitle = document.getElementById('feedback-title');
    const feedbackIcon = document.getElementById('feedback-icon');
    const solutionBox = document.getElementById('worked-solution-content');

    if (isCorrect) {
      score++;
      quizScoreVal.textContent = score;
      feedbackTitle.textContent = "Correct!";
      feedbackIcon.innerHTML = "✨";
      quizFeedbackBox.classList.remove('incorrect');
      quizSubmitForm.classList.add('celebrate-pop');
    } else {
      feedbackTitle.textContent = "Incorrect";
      feedbackIcon.innerHTML = "❌";
      quizFeedbackBox.classList.add('incorrect');
    }

    // Build explanatory worked steps
    let stepsHTML = '';
    const dStr = q.d.toFixed(2);

    stepsHTML += `<p><strong>Worked Solution:</strong></p>`;
    stepsHTML += `<div class="solution-formula">Moment = Force &times; Perpendicular Distance (d)</div>`;

    if (q.type === 'A') {
      stepsHTML += `<p>Moment = ${q.force} N &times; ${dStr} m = <strong>${q.moment.toFixed(1)} Nm</strong></p>`;
    } else if (q.type === 'B') {
      stepsHTML += `<p>d = Moment / Force = ${q.moment.toFixed(2)} Nm / ${q.force} N = <strong>${dStr} m</strong></p>`;
    } else {
      stepsHTML += `<p>Force = Moment / d = ${q.moment.toFixed(2)} Nm / ${dStr} m = <strong>${q.force} N</strong></p>`;
    }

    if (formatError) {
      stepsHTML += `<p class="accent-danger">Your answer: "${rawInput || "(empty)"}" (Format error! Enter numeric value followed by the correct unit, e.g. 24 Nm)</p>`;
    } else {
      const displayExpectedUnit = expectedUnit === 'nm' ? 'Nm' : expectedUnit;
      stepsHTML += `<p>Your answer: "${rawInput}" (Expected: ${correctVal.toFixed(q.type === 'A' ? 1 : 2).replace(/\.00$/, '')} ${displayExpectedUnit})</p>`;
    }

    solutionBox.innerHTML = stepsHTML;
  });

  quizNextBtn.addEventListener('click', () => {
    currentQIndex++;
    if (currentQIndex < 30) {
      loadQuestion(currentQIndex);
    } else {
      showQuizEnd();
    }
  });

  function showQuizEnd() {
    quizQuestionScreen.classList.remove('active');
    quizEndScreen.classList.add('active');
    finalScore.textContent = score;

    // Dynamic circular score progress loader
    const percentage = score / 30;
    const offset = 283 - 283 * percentage;
    radialProgress.style.strokeDashoffset = offset;

    // Score categorization messages
    if (score >= 25) {
      gradeTitle.textContent = "Excellent Mastery!";
      gradeTitle.className = "accent-success";
      gradeMsg.textContent = "Outstanding work! You have completely mastered finding perpendicular distances in moment calculations.";
    } else if (score >= 15) {
      gradeTitle.textContent = "Good Effort!";
      gradeTitle.className = "accent-amber";
      gradeMsg.textContent = "Great job! A bit more review on the step-by-step worked calculations and you will hit full mastery.";
    } else {
      gradeTitle.textContent = "Keep Practising!";
      gradeTitle.className = "accent-danger";
      gradeMsg.textContent = "Revisit the Concept Diagrams (Section 1) and Angle Explorer (Section 2) to build stronger geometric intuition.";
    }
  }

  startQuizBtn.addEventListener('click', startQuiz);
  restartBtn.addEventListener('click', startQuiz);


  // ==========================================
  // SECTION 5: FLASHCARDS
  // ==========================================
  const flashcardsData = [
    {
      q: "What does perpendicular distance mean in turning effect calculations?",
      a: "The shortest, straight-line distance from the pivot point to the line along which the force acts (line of action)."
    },
    {
      q: "Why is the physical length of the lever arm not always the distance used to calculate moments?",
      a: "If the force is applied at an angle other than 90° to the arm, the shortest path to the force's line of action is shorter than the arm length."
    },
    {
      q: "How do you locate the 'line of action' of a force?",
      a: "Imagine drawing an infinite dashed line extending forward and backward along the direction of the force arrow."
    },
    {
      q: "What is the formula to calculate the perpendicular distance (d) when a force is applied at angle θ to an arm of length L?",
      a: "d = L × sin(θ)  (where θ is the angle between the force line and the lever arm)."
    },
    {
      q: "What happens to the moment of a force as the angle of the applied force decreases from 90° towards 0°?",
      a: "The moment decreases because the perpendicular distance (d) gets smaller, even though the force magnitude and arm length remain identical."
    },
    {
      q: "Why does a force applied exactly along the axis of the lever arm (pushing/pulling directly toward/away from pivot) produce zero moment?",
      a: "The line of action passes directly through the pivot. Hence, the perpendicular distance (d) is exactly zero, so Moment = F × 0 = 0."
    },
    {
      q: "Contrast the 90° force case with an angled force case.",
      a: "At 90°, the arm is the perpendicular distance. At any other angle, you must project a right angle to the force line; this distance is always smaller than the arm."
    },
    {
      q: "What is the first step you should always take when resolving a moment problem with an angled force?",
      a: "Draw the line of action of the force and locate the right-angled projection from the pivot to find 'd'."
    },
    {
      q: "Write the general formula for the moment of a force.",
      a: "Moment = Force (F) × Perpendicular distance from pivot (d). Unit: Nm (Newton-meters)."
    },
    {
      q: "What is the most common mistake students make in O-Level moment calculations?",
      a: "Directly multiplying the force by the raw arm length, ignoring the angle at which the force acts."
    }
  ];

  let currentCardIndex = 0;
  const flashcard = document.getElementById('flashcard');
  const cardFrontText = document.getElementById('card-front-text');
  const cardBackText = document.getElementById('card-back-text');
  const cardCurrentNum = document.getElementById('card-current-num');
  
  const prevCardBtn = document.getElementById('prev-card-btn');
  const nextCardBtn = document.getElementById('next-card-btn');
  const shuffleCardsBtn = document.getElementById('shuffle-cards-btn');

  function renderCard() {
    flashcard.classList.remove('flipped');
    cardCurrentNum.textContent = currentCardIndex + 1;
    cardFrontText.textContent = flashcardsData[currentCardIndex].q;
    cardBackText.textContent = flashcardsData[currentCardIndex].a;
  }

  // Flip card
  flashcard.addEventListener('click', () => {
    flashcard.classList.toggle('flipped');
  });

  // Nav cards
  prevCardBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    currentCardIndex = (currentCardIndex - 1 + flashcardsData.length) % flashcardsData.length;
    renderCard();
  });

  nextCardBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    currentCardIndex = (currentCardIndex + 1) % flashcardsData.length;
    renderCard();
  });

  // Shuffle cards
  shuffleCardsBtn.addEventListener('click', () => {
    for (let i = flashcardsData.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [flashcardsData[i], flashcardsData[j]] = [flashcardsData[j], flashcardsData[i]];
    }
    currentCardIndex = 0;
    renderCard();
  });

  // Init sections
  updateExplorer();
  renderCard();
});
