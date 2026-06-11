document.addEventListener('DOMContentLoaded', () => {
  // --- Navigation & Tabs ---
  const btnSimulator = document.getElementById('btn-simulator');
  const btnQuiz = document.getElementById('btn-quiz');
  const secSimulator = document.getElementById('sec-simulator');
  const secQuiz = document.getElementById('sec-quiz');

  // --- Formula HUD elements ---
  const termF = document.getElementById('term-f');
  const termM = document.getElementById('term-m');
  const termA = document.getElementById('term-a');

  function clearHUDHighlights() {
    termF.classList.remove('highlighted');
    termM.classList.remove('highlighted');
    termA.classList.remove('highlighted');
  }

  btnSimulator.addEventListener('click', () => {
    btnSimulator.classList.add('active');
    btnQuiz.classList.remove('active');
    secSimulator.classList.add('active');
    secQuiz.classList.remove('active');
    clearHUDHighlights();
  });

  btnQuiz.addEventListener('click', () => {
    btnQuiz.classList.add('active');
    btnSimulator.classList.remove('active');
    secQuiz.classList.add('active');
    secSimulator.classList.remove('active');
    // Start or resume quiz state
    initQuiz();
  });

  // --- SECTION 1: SIMULATOR ---
  const sliderMass = document.getElementById('sliderMass');
  const sliderAppliedForce = document.getElementById('sliderAppliedForce');
  const sliderFriction = document.getElementById('sliderFriction');
  const valMass = document.getElementById('valMass');
  const valAppliedForce = document.getElementById('valAppliedForce');
  const valFriction = document.getElementById('valFriction');
  const telMass = document.getElementById('telMass');
  const telAppliedForce = document.getElementById('telAppliedForce');
  const telFriction = document.getElementById('telFriction');
  const telAccel = document.getElementById('telAccel');
  const simBox = document.getElementById('simBox');
  const boxLabel = document.getElementById('boxLabel');
  const boxAccelVal = document.getElementById('boxAccelVal');
  const forceArrow = document.getElementById('forceArrow');
  const arrowText = document.getElementById('arrowText');
  const frictionArrow = document.getElementById('frictionArrow');
  const frictionArrowText = document.getElementById('frictionArrowText');
  const workingFormula = document.getElementById('workingFormula');
  const promptText = document.getElementById('promptText');
  const btnResetSim = document.getElementById('btnResetSim');
  const gaugeNeedle = document.getElementById('gaugeNeedle');
  const speedDisplay = document.getElementById('speedDisplay');

  // Physics Simulation state variables
  let mass = parseFloat(sliderMass.value);
  let appliedForce = parseFloat(sliderAppliedForce.value);
  let friction = parseFloat(sliderFriction.value);
  let netForce = Math.max(0, appliedForce - friction);
  let acceleration = netForce / mass;
  let velocity = 0;
  let posX = 10; // percentage position along the track
  let lastTime = performance.now();
  let animationId = null;

  // Sound effects / visual feedback styling helper
  function getAccelColor(acc) {
    if (acc === 0) return { border: '#7f8c8d', bg: 'linear-gradient(135deg, #2c3e50, #34495e)', name: 'grey' };
    if (acc <= 5) return { border: '#f1c40f', bg: 'linear-gradient(135deg, #f39c12, #f1c40f)', name: 'yellow' };
    if (acc <= 15) return { border: '#e67e22', bg: 'linear-gradient(135deg, #d35400, #e67e22)', name: 'orange' };
    return { border: '#e74c3c', bg: 'linear-gradient(135deg, #c0392b, #e74c3c)', name: 'red' };
  }

  // --- Mode Toggle Logic ---
  const btnModeOpposing = document.getElementById('btnModeOpposing');
  const btnModeFriction = document.getElementById('btnModeFriction');
  let isFrictionMode = false;

  btnModeOpposing.addEventListener('click', () => {
    isFrictionMode = false;
    btnModeOpposing.classList.add('active');
    btnModeFriction.classList.remove('active');
    updateSimulatorLabels();
    updateSimulatorValues();
  });

  btnModeFriction.addEventListener('click', () => {
    isFrictionMode = true;
    btnModeFriction.classList.add('active');
    btnModeOpposing.classList.remove('active');
    updateSimulatorLabels();
    updateSimulatorValues();
  });

  function updateSimulatorLabels() {
    const sliderFrictionLabel = document.querySelector('label[for="sliderFriction"]');
    const telFrictionLabel = document.querySelector('.telemetry-card:nth-child(2) .card-label');
    
    if (isFrictionMode) {
      sliderFrictionLabel.innerHTML = 'Frictional Force (f)';
      telFrictionLabel.innerHTML = 'Frictional Force (f)';
    } else {
      sliderFrictionLabel.innerHTML = 'Opposing Applied Force (F<sub>opp</sub>)';
      telFrictionLabel.innerHTML = 'Opposing Applied Force (F<sub>opp</sub>)';
    }
  }

  function updateSimulatorValues() {
    mass = parseFloat(sliderMass.value);
    appliedForce = parseFloat(sliderAppliedForce.value);
    friction = parseFloat(sliderFriction.value);

    // Update labels and telemetry
    valMass.textContent = `${mass} kg`;
    valAppliedForce.textContent = `${appliedForce} N`;
    valFriction.textContent = `${friction} N`;
    telMass.textContent = `${mass} kg`;
    telAppliedForce.textContent = `${appliedForce} N`;
    arrowText.textContent = `${appliedForce} N`;

    // Scale applied force arrow visual width based on applied force value
    if (appliedForce === 0) {
      forceArrow.style.display = 'none';
    } else {
      forceArrow.style.display = 'flex';
      const width = 45 + (appliedForce / 100) * 75;
      forceArrow.style.width = `${width}px`;
      forceArrow.style.left = `-${width + 10}px`;
    }
  }

  function updateObservationPrompts(currentNetForce, currentAccel, activeOpposing) {
    const oppName = isFrictionMode ? 'Friction' : 'Opposing Applied Force';
    if (appliedForce === 0 && activeOpposing === 0) {
      promptText.innerHTML = `<strong>Notice:</strong> No forces acting = no acceleration. Object stays still or moves at constant velocity!`;
    } else if (currentNetForce === 0 && appliedForce > 0) {
      promptText.innerHTML = `<strong>Notice:</strong> ${oppName} (${activeOpposing} N) exactly balances Forward Force (${appliedForce} N). Net Force is 0 N, so acceleration is 0 m/s²! (Newton's 1st Law)`;
    } else if (velocity > 0 && appliedForce < friction) {
      promptText.innerHTML = `<strong>Notice:</strong> ${oppName} (${friction} N) exceeds Forward Force (${appliedForce} N). Net Force is negative (${currentNetForce} N), causing deceleration!`;
    } else if (isFrictionMode && velocity === 0 && appliedForce <= friction) {
      promptText.innerHTML = `<strong>Notice:</strong> Forward Force (${appliedForce} N) cannot overcome static friction (${friction} N). Crate remains stopped and frictional force is zero!`;
    } else if (mass >= 15 && currentNetForce <= 20) {
      promptText.innerHTML = `<strong>Notice:</strong> Large mass (${mass} kg) with small Net Force (${currentNetForce} N) results in very low acceleration. Heavy inertia!`;
    } else if (mass <= 5 && currentNetForce >= 60) {
      promptText.innerHTML = `<strong>Notice:</strong> High Net Force (${currentNetForce} N) on low mass (${mass} kg) produces massive acceleration (${currentAccel.toFixed(2)} m/s²)!`;
    } else {
      promptText.innerHTML = `Observe: Try increasing <strong>Forward Force</strong> or decreasing <strong>${oppName}</strong> to increase Net Force and Acceleration!`;
    }
  }

  // Animation Frame Loop
  function simLoop(timestamp) {
    const dt = (timestamp - lastTime) / 1000; // time delta in seconds
    lastTime = timestamp;

    let activeOpposingForce = friction;

    // Newton's 2nd Law simulation update:
    if (isFrictionMode) {
      if (velocity > 0.05) {
        netForce = appliedForce - friction;
        acceleration = netForce / mass;
        activeOpposingForce = friction;
      } else {
        // Once stopped, friction becomes zero
        activeOpposingForce = 0;
        if (appliedForce > friction) {
          netForce = appliedForce - friction;
          acceleration = netForce / mass;
        } else {
          netForce = 0;
          acceleration = 0;
          velocity = 0;
        }
      }
    } else {
      // Opposing Applied Force mode: Net Force is always Forward Force minus Opposing Force
      netForce = appliedForce - friction;
      acceleration = netForce / mass;
      activeOpposingForce = friction;
    }

    velocity += acceleration * dt;

    // In Friction Mode, opposing force cannot cause reverse movement.
    // When the crate decelerates to a stop, set both forward force and friction to zero.
    if (isFrictionMode && velocity <= 0.01 && (appliedForce > 0 || friction > 0)) {
      velocity = 0;
      acceleration = 0;
      netForce = 0;
      activeOpposingForce = 0;
      appliedForce = 0;
      friction = 0;
      sliderAppliedForce.value = 0;
      sliderFriction.value = 0;
      updateSimulatorValues();
    } else if (isFrictionMode && velocity < 0) {
      velocity = 0;
      acceleration = 0;
      netForce = 0;
    }
    
    // Update live working output
    telFriction.textContent = `${activeOpposingForce} N`;
    telAccel.textContent = `${acceleration.toFixed(2)} m/s²`;
    boxAccelVal.textContent = `${acceleration.toFixed(1)} m/s²`;
    frictionArrowText.textContent = `${activeOpposingForce} N`;

    // Scale opposing/friction arrow visual width
    if (activeOpposingForce === 0) {
      frictionArrow.style.display = 'none';
    } else {
      frictionArrow.style.display = 'flex';
      const width = 45 + (activeOpposingForce / 50) * 75;
      frictionArrow.style.width = `${width}px`;
      frictionArrow.style.right = `-${width + 10}px`;
    }
    
    const colors = getAccelColor(Math.abs(acceleration));
    simBox.style.borderColor = colors.border;
    simBox.style.background = colors.bg;

    // Formula working step display
    const oppSymbol = isFrictionMode ? 'f' : 'F<sub>opp</sub>';
    workingFormula.innerHTML = `F<sub>net</sub> = F<sub>fwd</sub> - ${oppSymbol} = ${appliedForce} - ${activeOpposingForce} = ${netForce} N<br>a = F<sub>net</sub> / m = ${netForce} / ${mass} = ${acceleration.toFixed(2)} m/s²`;

    // Dynamic prompt cards updating observation feedback
    updateObservationPrompts(netForce, acceleration, activeOpposingForce);

    // Position change based on velocity
    posX += velocity * dt * 8; // speed multiplier to look nice on screen

    // Wrap position around the screen viewport in both directions
    if (posX > 100) {
      posX = -15; // wrap around behind the left viewport edge
    } else if (posX < -15) {
      posX = 100; // wrap around behind the right viewport edge
    }

    simBox.style.left = `${posX}%`;

    // Update Speedometer needle and text indicator (based on absolute speed)
    const maxSpeedLimit = 40;
    const speedRatio = Math.min(Math.abs(velocity) / maxSpeedLimit, 1);
    const angle = -90 + (speedRatio * 180);
    gaugeNeedle.style.transform = `rotate(${angle}deg)`;
    speedDisplay.textContent = `${Math.abs(velocity).toFixed(1)} m/s`;

    animationId = requestAnimationFrame(simLoop);
  }

  // Handle resets
  btnResetSim.addEventListener('click', () => {
    sliderMass.value = 5;
    sliderAppliedForce.value = 30;
    sliderFriction.value = 5;
    velocity = 0;
    posX = 10;
    updateSimulatorValues();
  });

  // Sliders input listeners
  sliderMass.addEventListener('input', updateSimulatorValues);
  sliderAppliedForce.addEventListener('input', updateSimulatorValues);
  sliderFriction.addEventListener('input', updateSimulatorValues);

  // Initialize Simulator state
  updateSimulatorValues();
  lastTime = performance.now();
  animationId = requestAnimationFrame(simLoop);


  // --- SECTION 2: CALCULATION QUIZ ---
  const quizProgressFill = document.getElementById('quizProgressFill');
  const quizQuestionNum = document.getElementById('quizQuestionNum');
  const quizScore = document.getElementById('quizScore');
  const quizCard = document.getElementById('quizCard');
  const questionText = document.getElementById('questionText');
  const answerForm = document.getElementById('answerForm');
  const answerInput = document.getElementById('answerInput');
  const btnSubmitAnswer = document.getElementById('btnSubmitAnswer');
  const btnNextQuestion = document.getElementById('btnNextQuestion');
  const quizFeedback = document.getElementById('quizFeedback');
  const feedbackStatus = document.getElementById('feedbackStatus');
  const feedbackWorking = document.getElementById('feedbackWorking');
  const quizSummary = document.getElementById('quizSummary');
  const summaryScore = document.getElementById('summaryScore');
  const summaryEval = document.getElementById('summaryEval');
  const gradeBadge = document.getElementById('gradeBadge');
  const btnRestartQuiz = document.getElementById('btnRestartQuiz');

  // Interactive helper visual element IDs inside quiz
  const visualMass = document.getElementById('visualMass');
  const visualForceArrow = document.getElementById('visualForceArrow');
  const visualForce = document.getElementById('visualForce');
  const visualOpposingArrow = document.getElementById('visualOpposingArrow');
  const visualOpposingForce = document.getElementById('visualOpposingForce');
  const visualAccel = document.getElementById('visualAccel');

  let currentQuestionIndex = 0;
  let correctCount = 0;
  let questions = [];

  // Generate 9 randomized questions: 3 for Forward Force, 3 for mass, 3 for acceleration.
  // Each question incorporates Forward Force (F_fwd), Opposing Force (F_opp), mass (m), and acceleration (a).
  function generateQuizQuestions() {
    const list = [];

    // 3 questions for Forward Force (F_fwd = m * a + F_opp)
    for (let i = 0; i < 3; i++) {
      const m = Math.floor(Math.random() * 8) + 3;      // 3 to 10 kg
      const a = Math.floor(Math.random() * 6) + 2;      // 2 to 7 m/s^2
      const F_opp = Math.floor(Math.random() * 15) + 5;  // 5 to 19 N
      const answer = (m * a) + F_opp;
      list.push({
        type: 'F',
        m: m,
        a: a,
        F_opp: F_opp,
        answer: answer,
        prompt: `A box of mass <strong>${m} kg</strong> is accelerating forward at <strong>${a} m/s²</strong> against an opposing force of <strong>${F_opp} N</strong>. Calculate the forward force applied on the box.`,
        unit: 'N'
      });
    }

    // 3 questions for Mass (m = (F_fwd - F_opp) / a)
    for (let i = 0; i < 3; i++) {
      const m = Math.floor(Math.random() * 8) + 3;      // 3 to 10 kg
      const a = Math.floor(Math.random() * 6) + 2;      // 2 to 7 m/s^2
      const F_opp = Math.floor(Math.random() * 15) + 5;  // 5 to 19 N
      const F_fwd = (m * a) + F_opp;
      list.push({
        type: 'm',
        F_fwd: F_fwd,
        F_opp: F_opp,
        a: a,
        answer: m,
        prompt: `A forward force of <strong>${F_fwd} N</strong> is applied to a box against an opposing force of <strong>${F_opp} N</strong>, causing it to accelerate at <strong>${a} m/s²</strong>. Calculate the mass of the box.`,
        unit: 'kg'
      });
    }

    // 3 questions for Acceleration (a = (F_fwd - F_opp) / m)
    for (let i = 0; i < 3; i++) {
      const m = Math.floor(Math.random() * 8) + 3;      // 3 to 10 kg
      const a = Math.floor(Math.random() * 6) + 2;      // 2 to 7 m/s^2
      const F_opp = Math.floor(Math.random() * 15) + 5;  // 5 to 19 N
      const F_fwd = (m * a) + F_opp;
      list.push({
        type: 'a',
        F_fwd: F_fwd,
        F_opp: F_opp,
        m: m,
        answer: a,
        prompt: `A forward force of <strong>${F_fwd} N</strong> acts on a box of mass <strong>${m} kg</strong> against an opposing force of <strong>${F_opp} N</strong>. Calculate the acceleration of the box.`,
        unit: 'm/s2' // using m/s2 directly
      });
    }

    // Shuffle array helper
    return list.sort(() => Math.random() - 0.5);
  }

  function initQuiz() {
    questions = generateQuizQuestions();
    currentQuestionIndex = 0;
    correctCount = 0;
    
    quizCard.classList.remove('hidden');
    quizSummary.classList.add('hidden');
    
    showQuestion();
  }

  function showQuestion() {
    const q = questions[currentQuestionIndex];
    
    // Reset inputs and buttons
    answerInput.value = '';
    answerInput.disabled = false;
    btnSubmitAnswer.classList.remove('hidden');
    btnNextQuestion.classList.add('hidden');
    quizFeedback.classList.add('hidden');

    // Update Progress Indicators
    const totalQ = questions.length;
    quizQuestionNum.textContent = `Question ${currentQuestionIndex + 1} of ${totalQ}`;
    quizScore.textContent = `Score: ${correctCount}/${currentQuestionIndex}`;
    quizProgressFill.style.width = `${(currentQuestionIndex / totalQ) * 100}%`;

    // Highlight corresponding term in Formula HUD
    clearHUDHighlights();
    if (q.type === 'F') {
      termF.classList.add('highlighted');
    } else if (q.type === 'm') {
      termM.classList.add('highlighted');
    } else if (q.type === 'a') {
      termA.classList.add('highlighted');
    }

    // Update Question Prompt
    questionText.innerHTML = q.prompt;

    // Render interactive visualization box values
    if (q.type === 'F') {
      visualMass.textContent = `${q.m} kg`;
      visualForce.textContent = `? N`;
      visualOpposingForce.textContent = `${q.F_opp} N`;
      visualForceArrow.style.display = 'flex';
      visualOpposingArrow.style.display = 'flex';
      visualAccel.textContent = `a = ${q.a} m/s²`;
    } else if (q.type === 'm') {
      visualMass.textContent = `? kg`;
      visualForce.textContent = `${q.F_fwd} N`;
      visualOpposingForce.textContent = `${q.F_opp} N`;
      visualForceArrow.style.display = 'flex';
      visualOpposingArrow.style.display = 'flex';
      visualAccel.textContent = `a = ${q.a} m/s²`;
    } else if (q.type === 'a') {
      visualMass.textContent = `${q.m} kg`;
      visualForce.textContent = `${q.F_fwd} N`;
      visualOpposingForce.textContent = `${q.F_opp} N`;
      visualForceArrow.style.display = 'flex';
      visualOpposingArrow.style.display = 'flex';
      visualAccel.textContent = `a = ? m/s²`;
    }
  }

  answerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (btnSubmitAnswer.classList.contains('hidden')) return;

    const q = questions[currentQuestionIndex];
    const rawInput = answerInput.value.trim();
    
    // Parse value and unit using Regex
    const match = rawInput.match(/^([+-]?\d*(?:\.\d+)?)\s*(.*)$/);
    let numericPart = NaN;
    let unitPart = "";
    if (match) {
      numericPart = parseFloat(match[1]);
      unitPart = match[2].trim().replace(/\^/g, ''); // case-sensitive unit parsing (preserving case)
    }

    const correctUnit = q.unit.replace(/\^/g, '');
    const isNumCorrect = !isNaN(numericPart) && Math.abs(numericPart - q.answer) < 0.01;
    // accept both case-sensitive 'm/s2' and 'm/s^2' as correct units for acceleration
    const isUnitCorrect = (unitPart === correctUnit) || (correctUnit === 'm/s2' && unitPart === 'm/s^2');
    const isCorrect = isNumCorrect && isUnitCorrect;

    answerInput.disabled = true;
    btnSubmitAnswer.classList.add('hidden');
    btnNextQuestion.classList.remove('hidden');

    if (isCorrect) {
      correctCount++;
      feedbackStatus.textContent = "Correct! Outstanding work.";
      quizFeedback.className = "feedback-card correct";
    } else {
      if (isNumCorrect && !isUnitCorrect) {
        feedbackStatus.textContent = `Incorrect Unit. Your value is correct (${q.answer}), but you must specify the correct unit (${q.unit}).`;
      } else if (!isNumCorrect && isUnitCorrect) {
        feedbackStatus.textContent = `Incorrect Calculation. Your unit is correct (${q.unit}), but the correct value is ${q.answer}.`;
      } else {
        feedbackStatus.textContent = `Incorrect. The correct answer is ${q.answer} ${q.unit}.`;
      }
      quizFeedback.className = "feedback-card incorrect";
    }

    // Generate step-by-step physics working explanation
    let formulaWorkingSteps = '';
    if (q.type === 'F') {
      const net = q.m * q.a;
      formulaWorkingSteps = `1. Find Resultant Force (F<sub>net</sub>):<br>F<sub>net</sub> = ma = ${q.m} kg &times; ${q.a} m/s² = <strong>${net} N</strong><br><br>2. Solve for Forward Force (F<sub>fwd</sub>):<br>F<sub>net</sub> = F<sub>fwd</sub> - F<sub>opp</sub><br>${net} N = F<sub>fwd</sub> - ${q.F_opp} N<br>F<sub>fwd</sub> = ${net} + ${q.F_opp} = <strong>${q.answer} N</strong>`;
    } else if (q.type === 'm') {
      const net = q.F_fwd - q.F_opp;
      formulaWorkingSteps = `1. Find Resultant Force (F<sub>net</sub>):<br>F<sub>net</sub> = F<sub>fwd</sub> - F<sub>opp</sub> = ${q.F_fwd} N - ${q.F_opp} N = <strong>${net} N</strong><br><br>2. Solve for Mass (m):<br>F<sub>net</sub> = ma<br>m = F<sub>net</sub> / a = ${net} N / ${q.a} m/s² = <strong>${q.answer} kg</strong>`;
    } else if (q.type === 'a') {
      const net = q.F_fwd - q.F_opp;
      formulaWorkingSteps = `1. Find Resultant Force (F<sub>net</sub>):<br>F<sub>net</sub> = F<sub>fwd</sub> - F<sub>opp</sub> = ${q.F_fwd} N - ${q.F_opp} N = <strong>${net} N</strong><br><br>2. Solve for Acceleration (a):<br>F<sub>net</sub> = ma<br>a = F<sub>net</sub> / m = ${net} N / ${q.m} kg = <strong>${q.answer} m/s²</strong>`;
    }

    feedbackWorking.innerHTML = formulaWorkingSteps;
    quizFeedback.classList.remove('hidden');
    
    // Update live score HUD immediately
    quizScore.textContent = `Score: ${correctCount}/${currentQuestionIndex + 1}`;
  });

  btnNextQuestion.addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
      showQuestion();
    } else {
      showQuizSummary();
    }
  });

  function getGrade(score, total) {
    const percent = (score / total) * 100;
    if (percent >= 75) return { grade: 'A1', desc: 'Distinction - Outstanding understanding!' };
    if (percent >= 70) return { grade: 'A2', desc: 'Distinction - Excellent score!' };
    if (percent >= 65) return { grade: 'B3', desc: 'Merit - Very good work.' };
    if (percent >= 60) return { grade: 'B4', desc: 'Merit - Good understanding.' };
    if (percent >= 55) return { grade: 'C5', desc: 'Credit - Satisfactory understanding.' };
    if (percent >= 50) return { grade: 'C6', desc: 'Credit - Pass. Keep practicing!' };
    if (percent >= 45) return { grade: 'D7', desc: 'Sub-Pass - More revision needed.' };
    if (percent >= 40) return { grade: 'E8', desc: 'Weak - Focus on core concepts.' };
    return { grade: 'F9', desc: 'Ungraded - Review the formula structure and retry.' };
  }

  function showQuizSummary() {
    quizCard.classList.add('hidden');
    quizSummary.classList.remove('hidden');
    clearHUDHighlights();

    const totalQ = questions.length;
    quizProgressFill.style.width = '100%';
    summaryScore.textContent = `${correctCount}/${totalQ}`;

    const grading = getGrade(correctCount, totalQ);
    gradeBadge.textContent = grading.grade;
    summaryEval.textContent = grading.desc;
  }

  btnRestartQuiz.addEventListener('click', initQuiz);
});
