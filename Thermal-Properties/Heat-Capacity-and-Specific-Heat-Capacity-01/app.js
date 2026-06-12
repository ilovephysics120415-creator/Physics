// --- State Management ---
const AppState = {
  currentSection: 'section-intro',
  activeSimulatorTab: 'tab-shc',
  quiz: {
    pool: [],
    sessionQuestions: [],
    currentIndex: 0,
    score: 0,
    answersLog: [] // tracks { question, correct, userAnswer, working }
  },
  flashcards: {
    deck: [
      {
        front: "What is internal energy composed of?",
        back: "Internal energy is the total energy store of a system, made up of the total kinetic energy (due to motion of particles) and total potential energy (due to intermolecular forces/bonding) of the particles."
      },
      {
        front: "Define Heat Capacity (C)",
        back: "Heat capacity is the amount of thermal energy required to raise the temperature of an object by 1°C (or 1 K) without any change in state. Formula: Q = CΔT. Unit: J/°C or J/K."
      },
      {
        front: "Define Specific Heat Capacity (c)",
        back: "Specific heat capacity is the amount of thermal energy required to raise the temperature of 1 kg of a substance by 1°C (or 1 K) without any change in state. Formula: Q = mcΔT. Unit: J/(kg°C) or J/(kg K)."
      },
      {
        front: "What is the key difference between Heat Capacity (C) and Specific Heat Capacity (c)?",
        back: "Heat capacity (C) is a property of a specific object (dependent on its mass, C = mc), whereas specific heat capacity (c) is a property of the material itself (independent of mass)."
      },
      {
        front: "What are the standard SI units for Q, m, c, C, and ΔT?",
        back: "• Q: Joules (J)\n• m: Kilograms (kg)\n• c: J/(kg°C) or J/(kg K)\n• C: J/°C or J/K\n• ΔT: °C or K"
      },
      {
        front: "If the mass of a copper block is doubled, what happens to its Heat Capacity (C) and Specific Heat Capacity (c)?",
        back: "The Heat Capacity (C) doubles (since C = mc). However, the Specific Heat Capacity (c) remains unchanged because it is a constant material property."
      },
      {
        front: "Why is water commonly used as a coolant in car radiators and central heating systems?",
        back: "Water has an exceptionally high specific heat capacity (4200 J/kg°C). It can absorb a large amount of thermal energy with only a small rise in temperature."
      },
      {
        front: "If a metal block of 2 kg requires 1800 J to heat up by 2°C, what is its specific heat capacity (c)?",
        back: "Using Q = mcΔT:\nc = Q / (mΔT) = 1800 / (2 × 2) = 450 J/(kg°C).\n(This matches Iron!)"
      }
    ],
    currentIndex: 0,
    shuffledDeck: []
  }
};

// Real materials for generator
const MATERIALS = [
  { name: 'Water', c: 4200 },
  { name: 'Aluminium', c: 900 },
  { name: 'Glass', c: 840 },
  { name: 'Iron', c: 450 },
  { name: 'Copper', c: 390 }
];

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initSimulator();
  initQuiz();
  initFlashcards();
});

// --- 1. Navigation Controller ---
function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.app-section');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const target = item.getAttribute('data-target');
      
      // Update Active Navigation Item
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');

      // Switch Visible Section
      sections.forEach(section => {
        if (section.id === target) {
          section.classList.add('active');
        } else {
          section.classList.remove('active');
        }
      });
      
      AppState.currentSection = target;
    });
  });
}

// --- 2. Interactive Simulator Controller ---
function initSimulator() {
  // Tabs
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      tabPanels.forEach(panel => {
        if (panel.id === tabId) {
          panel.classList.add('active');
        } else {
          panel.classList.remove('active');
        }
      });

      AppState.activeSimulatorTab = tabId;
      updateSimulatorVisuals();
    });
  });

  // Panel A (SHC) Inputs
  const matSelect = document.getElementById('material-select');
  const massSlider = document.getElementById('mass-slider');
  const massVal = document.getElementById('mass-val');
  const tempSliderA = document.getElementById('temp-slider-a');
  const tempValA = document.getElementById('temp-val-a');

  const shcWorking = document.getElementById('shc-working');
  const shcResult = document.getElementById('shc-result');
  const shcResultKj = document.getElementById('shc-result-kj');

  function calculateSHC() {
    const c = parseInt(matSelect.value);
    const m = parseFloat(massSlider.value);
    const dT = parseInt(tempSliderA.value);

    massVal.textContent = `${m.toFixed(1)} kg`;
    tempValA.textContent = `${dT} °C`;

    const Q = m * c * dT;
    
    shcWorking.textContent = `Q = ${m.toFixed(1)}kg × ${c} J/kg°C × ${dT}°C`;
    shcResult.textContent = `${Q.toLocaleString()} J`;
    shcResultKj.textContent = `(${(Q / 1000).toFixed(2)} kJ)`;

    updateSimulatorVisuals();
  }

  matSelect.addEventListener('change', calculateSHC);
  massSlider.addEventListener('input', calculateSHC);
  tempSliderA.addEventListener('input', calculateSHC);

  // Panel B (HC) Inputs
  const hcSlider = document.getElementById('hc-slider');
  const hcVal = document.getElementById('hc-val');
  const tempSliderB = document.getElementById('temp-slider-b');
  const tempValB = document.getElementById('temp-val-b');

  const hcWorking = document.getElementById('hc-working');
  const hcResult = document.getElementById('hc-result');
  const hcResultKj = document.getElementById('hc-result-kj');

  function calculateHC() {
    const C = parseInt(hcSlider.value);
    const dT = parseInt(tempSliderB.value);

    hcVal.textContent = `${C} J/°C`;
    tempValB.textContent = `${dT} °C`;

    const Q = C * dT;

    hcWorking.textContent = `Q = ${C} J/°C × ${dT}°C`;
    hcResult.textContent = `${Q.toLocaleString()} J`;
    hcResultKj.textContent = `(${(Q / 1000).toFixed(2)} kJ)`;

    updateSimulatorVisuals();
  }

  hcSlider.addEventListener('input', calculateHC);
  tempSliderB.addEventListener('input', calculateHC);

  // Practice Reveal Toggles
  const revealBtns = document.querySelectorAll('.reveal-toggle-btn');
  revealBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const target = document.getElementById(targetId);
      const isBlurred = target.classList.toggle('blurred');
      btn.textContent = isBlurred ? "Show Answer" : "Hide Answer";
    });
  });

  // Run initial calculator computations
  calculateSHC();
  calculateHC();
}

function updateSimulatorVisuals() {
  if (AppState.activeSimulatorTab === 'tab-shc') {
    const m = parseFloat(document.getElementById('mass-slider').value);
    const dT = parseInt(document.getElementById('temp-slider-a').value);
    const liquid = document.getElementById('shc-liquid');
    const heaterGlow = document.querySelector('#shc-heater .glow-ring');
    const bubblesContainer = document.getElementById('shc-bubbles');

    // Mass corresponds to liquid level (e.g. 0.1 to 5.0kg -> 15% to 85% beaker height)
    const pct = 15 + ((m - 0.1) / (5.0 - 0.1)) * 70;
    liquid.style.height = `${pct}%`;

    // Temperature change corresponds to heater glow intensity and bubble count
    const heatIntensity = dT / 100;
    heaterGlow.style.opacity = heatIntensity * 0.9;
    
    // Bubble count and speed
    bubblesContainer.innerHTML = '';
    const numBubbles = Math.floor(dT / 8);
    for (let i = 0; i < numBubbles; i++) {
      const bubble = document.createElement('div');
      bubble.className = 'bubble';
      bubble.style.left = `${Math.random() * 90}%`;
      bubble.style.width = `${Math.random() * 6 + 4}px`;
      bubble.style.height = bubble.style.width;
      bubble.style.animationDuration = `${1.8 - (dT/100)*1.3}s`;
      bubble.style.animationDelay = `${Math.random() * 1.5}s`;
      bubblesContainer.appendChild(bubble);
    }
  } else {
    // Heat Capacity Block glow
    const dT = parseInt(document.getElementById('temp-slider-b').value);
    const hcBlockGlow = document.getElementById('hc-glow');
    const heaterGlow = document.querySelector('#hc-heater .glow-ring');

    const intensity = dT / 100;
    hcBlockGlow.style.opacity = intensity * 0.8;
    heaterGlow.style.opacity = intensity * 0.9;
  }
}

// --- 3. Randomized Quiz Engine ---
function initQuiz() {
  const startBtn = document.getElementById('start-quiz-btn');
  const startScreen = document.getElementById('quiz-start-screen');
  const playScreen = document.getElementById('quiz-play-screen');
  const scoreScreen = document.getElementById('quiz-score-screen');
  const retryBtn = document.getElementById('retry-quiz-btn');

  startBtn.addEventListener('click', startQuizSession);
  retryBtn.addEventListener('click', startQuizSession);

  // Submits
  document.getElementById('submit-numerical-btn').addEventListener('click', checkNumericalAnswer);
  document.getElementById('next-question-btn').addEventListener('click', loadNextQuestion);
}

// Generates a dynamic pool of 30 questions
function generateQuizPool() {
  const pool = [];

  // Add 10 Specific Heat Capacity questions (Q = mcΔT) with randomized hidden variable
  for (let i = 0; i < 10; i++) {
    const mat = MATERIALS[i % MATERIALS.length];
    const m = Math.round((0.2 + Math.random() * 4.5) * 10) / 10; // 0.2 to 4.7 kg
    const dT = Math.round(5 + Math.random() * 70); // 5 to 75 °C
    const Q = Math.round(m * mat.c * dT);

    const variables = ['Q', 'm', 'c', 'dT'];
    const hidden = variables[i % variables.length];

    let question = "";
    let correctValue = 0;
    let unit = "";
    let working = "";

    switch(hidden) {
      case 'Q':
        question = `A block of ${mat.name} has a mass of ${m} kg. Calculate the thermal energy required to raise its temperature by ${dT}°C. (Specific heat capacity of ${mat.name} = ${mat.c} J/kg°C)`;
        correctValue = Q;
        unit = "J";
        working = `Q = mcΔT\nQ = ${m} kg × ${mat.c} J/kg°C × ${dT}°C\nQ = ${Q} J`;
        break;
      case 'm':
        question = `An energy of ${Q} J is supplied to heat a block of ${mat.name} (c = ${mat.c} J/kg°C). If the temperature increases by ${dT}°C, calculate the mass of the block.`;
        correctValue = m;
        unit = "kg";
        working = `m = Q / (cΔT)\nm = ${Q} J / (${mat.c} J/kg°C × ${dT}°C)\nm = ${m} kg`;
        break;
      case 'c':
        question = `A metal block of mass ${m} kg absorbs ${Q} J of thermal energy to raise its temperature by ${dT}°C. Calculate its specific heat capacity.`;
        correctValue = mat.c;
        unit = "J/kg°C";
        working = `c = Q / (mΔT)\nc = ${Q} J / (${m} kg × ${dT}°C)\nc = ${mat.c} J/kg°C`;
        break;
      case 'dT':
        question = `A ${m} kg object made of ${mat.name} (c = ${mat.c} J/kg°C) absorbs ${Q} J of energy. Calculate the change in temperature (ΔT).`;
        correctValue = dT;
        unit = "°C";
        working = `ΔT = Q / (mc)\nΔT = ${Q} J / (${m} kg × ${mat.c} J/kg°C)\nΔT = ${dT}°C`;
        break;
    }

    pool.push({
      type: 'numerical',
      text: question,
      correctAnswer: correctValue,
      unit: unit,
      working: working
    });
  }

  // Add 10 Heat Capacity questions (Q = CΔT) with randomized hidden variables
  for (let i = 0; i < 10; i++) {
    const C = Math.round(200 + Math.random() * 3800); // 200 to 4000 J/°C
    const dT = Math.round(5 + Math.random() * 70); // 5 to 75 °C
    const Q = C * dT;

    const variables = ['Q', 'C', 'dT'];
    const hidden = variables[i % variables.length];

    let question = "";
    let correctValue = 0;
    let unit = "";
    let working = "";

    switch(hidden) {
      case 'Q':
        question = `An object has a heat capacity of ${C} J/°C. Calculate the thermal energy needed to increase its temperature by ${dT}°C.`;
        correctValue = Q;
        unit = "J";
        working = `Q = CΔT\nQ = ${C} J/°C × ${dT}°C\nQ = ${Q} J`;
        break;
      case 'C':
        question = `An object requires ${Q} J of energy to increase its temperature by ${dT}°C. Find its heat capacity.`;
        correctValue = C;
        unit = "J/°C";
        working = `C = Q / ΔT\nC = ${Q} J / ${dT}°C\nC = ${C} J/°C`;
        break;
      case 'dT':
        question = `A piece of glassware with a heat capacity of ${C} J/°C is heated with ${Q} J of energy. Calculate the resulting temperature rise in °C.`;
        correctValue = dT;
        unit = "°C";
        working = `ΔT = Q / C\nΔT = ${Q} J / ${C} J/°C\nΔT = ${dT}°C`;
        break;
    }

    pool.push({
      type: 'numerical',
      text: question,
      correctAnswer: correctValue,
      unit: unit,
      working: working
    });
  }

  // Add 10 Conceptual MCQ Questions
  const MCQs = [
    {
      text: "The thermal energy required to heat an object is Q. If the mass of the object is doubled and the temperature rise is halved, what is the new energy required?",
      options: ["Q / 2", "Q (Unchanged)", "2Q", "4Q"],
      correct: 1, // index of option
      working: "Using Q = mcΔT, doubling mass (2m) and halving temp rise (0.5ΔT) gives: Q' = (2m) * c * (0.5ΔT) = mcΔT = Q. Energy remains unchanged."
    },
    {
      text: "Why does specific heat capacity remain constant when the size of a copper block is doubled?",
      options: [
        "Because specific heat capacity is independent of mass.",
        "Because the heat capacity also remains constant.",
        "Because copper expands with temperature.",
        "Because mass cancels out temperature rise."
      ],
      correct: 0,
      working: "Specific heat capacity (c) is a bulk property of the material (copper). It measures energy required per unit mass (1 kg), so it does not depend on the object's total mass."
    },
    {
      text: "Which substance will experience the lowest temperature increase when the same amount of thermal energy is supplied to 1 kg of each?",
      options: [
        "Water (c = 4200 J/kg°C)",
        "Aluminium (c = 900 J/kg°C)",
        "Iron (c = 450 J/kg°C)",
        "Copper (c = 390 J/kg°C)"
      ],
      correct: 0,
      working: "Since ΔT = Q / (mc), temperature change is inversely proportional to specific heat capacity. Water has the highest c, so it has the smallest ΔT."
    },
    {
      text: "How is internal energy of a substance defined in the O-Level syllabus?",
      options: [
        "The heat energy stored due to its temperature.",
        "The total kinetic energy and total potential energy of the particles.",
        "The total kinetic energy only of the molecules.",
        "The potential difference between hot and cold zones."
      ],
      correct: 1,
      working: "Internal energy is the sum of total kinetic energy (from particle motion) and total potential energy (from molecular forces) of all particles in the system."
    },
    {
      text: "Object X has a mass of 2 kg, and Object Y has a mass of 1 kg. Both are made of the same metal. Which statement about their heat capacities is correct?",
      options: [
        "Heat capacity of X is twice that of Y.",
        "Heat capacity of Y is twice that of X.",
        "They have the exact same heat capacity.",
        "Heat capacity depends only on volume, not mass."
      ],
      correct: 0,
      working: "Heat capacity C = mc. Since they have the same c (same metal) and object X has double the mass of Y (2 kg vs 1 kg), the heat capacity of X is twice that of Y."
    },
    {
      text: "A 500 g block has a heat capacity of 400 J/°C. What is its specific heat capacity?",
      options: [
        "200 J/(kg°C)",
        "800 J/(kg°C)",
        "400 J/(kg°C)",
        "0.8 J/(kg°C)"
      ],
      correct: 1,
      working: "c = C / m. Convert mass to kg first: 500 g = 0.5 kg. Therefore, c = 400 J/°C / 0.5 kg = 800 J/(kg°C)."
    },
    {
      text: "Which of the following describes a scenario where an object's heat capacity is extremely high?",
      options: [
        "It heats up rapidly when exposed to small amounts of flame.",
        "It requires a massive amount of energy to change its temperature slightly.",
        "It undergoes change of state instantly when energy is supplied.",
        "Its temperature drops to absolute zero immediately when cooled."
      ],
      correct: 1,
      working: "High heat capacity (C = Q/ΔT) means that for a given input of energy Q, the temperature change ΔT is very small. Thus, it resists changes in temperature."
    },
    {
      text: "Under the formula Q = mcΔT, if the heat capacity of a body is C, what is the alternative equivalent formula?",
      options: [
        "Q = C / ΔT",
        "Q = C ΔT",
        "Q = c ΔT / m",
        "Q = m C / ΔT"
      ],
      correct: 1,
      working: "Since C = mc, we can substitute mc with C in Q = mcΔT to get Q = CΔT."
    },
    {
      text: "Which of the following has the unit J/°C?",
      options: [
        "Thermal energy Q",
        "Heat capacity C",
        "Specific heat capacity c",
        "Temperature change ΔT"
      ],
      correct: 1,
      working: "Heat capacity (C) is thermal energy (J) divided by temperature change (°C), yielding J/°C."
    },
    {
      text: "What happens to the internal potential energy of particles as a solid melts into a liquid at constant temperature?",
      options: [
        "It increases as bonds are broken/weakened.",
        "It decreases because kinetic energy increases.",
        "It remains completely constant.",
        "It is transformed into nuclear energy."
      ],
      correct: 0,
      working: "During melting at constant temperature, kinetic energy remains constant (constant temperature). The absorbed thermal energy is used to overcome intermolecular forces, increasing the potential energy."
    }
  ];

  MCQs.forEach(mcq => {
    pool.push({
      type: 'mcq',
      text: mcq.text,
      options: mcq.options,
      correctAnswer: mcq.correct,
      working: mcq.working
    });
  });

  return pool;
}

// Draw 10 randomized questions for a session
function startQuizSession() {
  AppState.quiz.pool = generateQuizPool();
  
  // Shuffle pool
  const shuffled = [...AppState.quiz.pool].sort(() => 0.5 - Math.random());
  AppState.quiz.sessionQuestions = shuffled.slice(0, 10);
  AppState.quiz.currentIndex = 0;
  AppState.quiz.score = 0;
  AppState.quiz.answersLog = [];

  // Toggle UI Screens
  document.getElementById('quiz-start-screen').classList.remove('active');
  document.getElementById('quiz-score-screen').classList.remove('active');
  document.getElementById('quiz-play-screen').classList.add('active');

  loadQuizQuestion();
}

function loadQuizQuestion() {
  const currentQ = AppState.quiz.sessionQuestions[AppState.quiz.currentIndex];
  
  // Update Indicators
  document.getElementById('question-index').textContent = `Question ${AppState.quiz.currentIndex + 1} of 10`;
  document.getElementById('quiz-score-badge').textContent = `Score: ${AppState.quiz.score}`;
  document.getElementById('quiz-progress-fill').style.width = `${((AppState.quiz.currentIndex + 1) / 10) * 100}%`;

  // Hide Feedback
  document.getElementById('question-feedback').classList.remove('active');
  document.getElementById('quiz-play-screen').classList.remove('confetti-active');

  // Set Question Text
  document.getElementById('question-text').textContent = currentQ.text;

  const mcqContainer = document.getElementById('mcq-options');
  const numericalContainer = document.getElementById('numerical-input-container');

  if (currentQ.type === 'mcq') {
    mcqContainer.style.display = 'flex';
    numericalContainer.style.display = 'none';

    mcqContainer.innerHTML = '';
    currentQ.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.textContent = opt;
      btn.addEventListener('click', () => selectMCQOption(idx, btn));
      mcqContainer.appendChild(btn);
    });
  } else {
    mcqContainer.style.display = 'none';
    numericalContainer.style.display = 'flex';
    
    // Clear previous input
    const inputField = document.getElementById('numerical-answer');
    inputField.value = '';
    inputField.disabled = false;
    document.getElementById('submit-numerical-btn').disabled = false;
    document.getElementById('numerical-unit').textContent = currentQ.unit;
  }
}

function selectMCQOption(selectedIdx, selectedBtn) {
  const currentQ = AppState.quiz.sessionQuestions[AppState.quiz.currentIndex];
  const buttons = document.querySelectorAll('.option-btn');
  
  // Disable options
  buttons.forEach(btn => btn.disabled = true);

  const isCorrect = (selectedIdx === currentQ.correctAnswer);
  
  if (isCorrect) {
    selectedBtn.classList.add('correct');
    AppState.quiz.score++;
    triggerCelebration();
  } else {
    selectedBtn.classList.add('wrong');
    // Highlight correct
    buttons[currentQ.correctAnswer].classList.add('correct');
  }

  AppState.quiz.answersLog.push({
    question: currentQ.text,
    correct: isCorrect,
    userAnswer: currentQ.options[selectedIdx],
    working: currentQ.working
  });

  showFeedback(isCorrect, currentQ.working);
}

function checkNumericalAnswer() {
  const currentQ = AppState.quiz.sessionQuestions[AppState.quiz.currentIndex];
  const inputField = document.getElementById('numerical-answer');
  const userVal = parseFloat(inputField.value);

  if (isNaN(userVal)) {
    alert("Please enter a valid numeric value.");
    return;
  }

  // Disable
  inputField.disabled = true;
  document.getElementById('submit-numerical-btn').disabled = true;

  const target = currentQ.correctAnswer;
  // Calculate margin of tolerance (+/- 2%)
  const margin = Math.abs(target * 0.02);
  const isCorrect = (Math.abs(userVal - target) <= margin);

  if (isCorrect) {
    AppState.quiz.score++;
    triggerCelebration();
  }

  AppState.quiz.answersLog.push({
    question: currentQ.text,
    correct: isCorrect,
    userAnswer: `${userVal} ${currentQ.unit}`,
    working: currentQ.working
  });

  showFeedback(isCorrect, currentQ.working);
}

function triggerCelebration() {
  document.getElementById('quiz-play-screen').classList.add('confetti-active');
}

function showFeedback(isCorrect, workingSteps) {
  const feedback = document.getElementById('question-feedback');
  const icon = document.getElementById('feedback-icon');
  const title = document.getElementById('feedback-title');
  const working = document.getElementById('working-steps');

  if (isCorrect) {
    icon.innerHTML = '<i class="fa-solid fa-circle-check" style="color: var(--success-color); font-size: 1.5rem;"></i>';
    title.textContent = "Correct!";
    title.className = "feedback-correct";
  } else {
    icon.innerHTML = '<i class="fa-solid fa-circle-xmark" style="color: var(--error-color); font-size: 1.5rem;"></i>';
    title.textContent = "Incorrect";
    title.className = "feedback-wrong";
  }

  working.textContent = workingSteps;
  feedback.classList.add('active');
}

function loadNextQuestion() {
  AppState.quiz.currentIndex++;
  if (AppState.quiz.currentIndex < 10) {
    loadQuizQuestion();
  } else {
    showQuizScore();
  }
}

// --- Section 4: Scoring & Feedback ---
function showQuizScore() {
  document.getElementById('quiz-play-screen').classList.remove('active');
  
  const scoreScreen = document.getElementById('quiz-score-screen');
  scoreScreen.classList.add('active');

  const finalScore = AppState.quiz.score;
  document.getElementById('score-num').textContent = finalScore;

  // Animate final Score Ring
  const circle = document.getElementById('score-ring-fill');
  const radius = circle.r.baseVal.value;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (finalScore / 10) * circumference;
  
  // Force reset then animate
  circle.style.strokeDashoffset = circumference;
  setTimeout(() => {
    circle.style.strokeDashoffset = offset;
  }, 100);

  // Set message based on three tiers
  const titleEl = document.getElementById('grade-tier-title');
  const msgEl = document.getElementById('grade-tier-message');

  if (finalScore >= 9) {
    titleEl.textContent = "Distinction! A1 Standard";
    msgEl.textContent = "Spectacular score! You have completely mastered specific heat capacity and heat capacity calculations.";
    titleEl.style.color = "var(--accent-cyan)";
  } else if (finalScore >= 6) {
    titleEl.textContent = "Good Pass! B3/C5 Standard";
    msgEl.textContent = "Strong effort. A few calculation mistakes or conceptual slips. Review the incorrect answers below to improve!";
    titleEl.style.color = "var(--text-main)";
  } else {
    titleEl.textContent = "Revision Needed! F9/U";
    msgEl.textContent = "Make sure to re-read the core concept card sheets and practice with flashcards before your next attempt.";
    titleEl.style.color = "var(--error-color)";
  }

  // Output list of incorrect questions
  const mistakesContainer = document.getElementById('mistakes-container');
  mistakesContainer.innerHTML = '';
  
  const incorrects = AppState.quiz.answersLog.filter(log => !log.correct);
  
  if (incorrects.length > 0) {
    const header = document.createElement('div');
    header.className = 'mistakes-title';
    header.textContent = "Incorrect Answers Summary & Working:";
    mistakesContainer.appendChild(header);

    incorrects.forEach(item => {
      const container = document.createElement('div');
      container.className = 'mistake-item';
      
      const q = document.createElement('div');
      q.className = 'mistake-q';
      q.textContent = item.question;

      const w = document.createElement('div');
      w.className = 'mistake-w';
      w.innerHTML = `<strong>Your Answer:</strong> ${item.userAnswer}<br><br><strong>Correct working steps:</strong><br>${item.working.replace(/\n/g, '<br>')}`;

      container.appendChild(q);
      container.appendChild(w);
      mistakesContainer.appendChild(container);
    });
    mistakesContainer.style.display = 'block';
  } else {
    mistakesContainer.style.display = 'none';
  }
}

// --- 5. Flashcards Revision Mode ---
function initFlashcards() {
  // Shallow copy deck
  AppState.flashcards.shuffledDeck = [...AppState.flashcards.deck];

  const card = document.getElementById('active-flashcard');
  const btnPrev = document.getElementById('fc-prev');
  const btnNext = document.getElementById('fc-next');
  const btnFlip = document.getElementById('fc-flip');
  const btnShuffle = document.getElementById('fc-shuffle');

  // Tap to Flip
  card.addEventListener('click', flipCard);
  btnFlip.addEventListener('click', flipCard);

  // Deck Controls
  btnPrev.addEventListener('click', () => navigateFlashcard(-1));
  btnNext.addEventListener('click', () => navigateFlashcard(1));
  btnShuffle.addEventListener('click', shuffleDeck);

  // Keyboard navigation inside Flashcards Section
  document.addEventListener('keydown', (e) => {
    if (AppState.currentSection !== 'section-flashcards') return;
    if (e.key === 'ArrowLeft') navigateFlashcard(-1);
    if (e.key === 'ArrowRight') navigateFlashcard(1);
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      flipCard();
    }
  });

  // Touch Swipe implementation
  initSwipeSupport(card);

  renderFlashcard();
}

function flipCard() {
  const card = document.getElementById('active-flashcard');
  card.classList.toggle('flipped');
}

function navigateFlashcard(direction) {
  const card = document.getElementById('active-flashcard');
  
  // Unflip first
  card.classList.remove('flipped');

  // Slide transition
  const directionClass = direction > 0 ? 'swipe-left' : 'swipe-right';
  card.classList.add(directionClass);

  setTimeout(() => {
    const deck = AppState.flashcards.shuffledDeck;
    const len = deck.length;
    AppState.flashcards.currentIndex = (AppState.flashcards.currentIndex + direction + len) % len;
    
    renderFlashcard();
    
    // Slide back from opposite side
    card.classList.remove(directionClass);
  }, 250);
}

function shuffleDeck() {
  const card = document.getElementById('active-flashcard');
  card.classList.remove('flipped');

  AppState.flashcards.shuffledDeck.sort(() => 0.5 - Math.random());
  AppState.flashcards.currentIndex = 0;

  // Flash card color animation
  card.style.transform = 'scale(0.95)';
  setTimeout(() => {
    renderFlashcard();
    card.style.transform = 'scale(1)';
  }, 150);
}

function renderFlashcard() {
  const currentCard = AppState.flashcards.shuffledDeck[AppState.flashcards.currentIndex];
  document.getElementById('card-front-content').textContent = currentCard.front;
  document.getElementById('card-back-content').textContent = currentCard.back;
  document.getElementById('card-counter').textContent = `${AppState.flashcards.currentIndex + 1} / ${AppState.flashcards.shuffledDeck.length}`;
}

// Simple Touch/Pointer swiper
function initSwipeSupport(element) {
  let startX = 0;
  let dist = 0;
  const threshold = 80; // Min distance for swipe

  element.addEventListener('pointerdown', (e) => {
    startX = e.clientX;
    element.setPointerCapture(e.pointerId);
  });

  element.addEventListener('pointerup', (e) => {
    dist = e.clientX - startX;
    
    if (Math.abs(dist) >= threshold) {
      if (dist > 0) {
        // Swipe Right -> Prev
        navigateFlashcard(-1);
      } else {
        // Swipe Left -> Next
        navigateFlashcard(1);
      }
    }
    element.releasePointerCapture(e.pointerId);
  });
}
