// Liquid Pressure Lab - Core Application Logic

// ==========================================
// 1. STATE & CONSTANTS
// ==========================================
const STATE = {
  currentTab: 'concept',
  
  // Density Explorer state
  density: {
    mass: 10.0,    // kg
    volume: 0.010, // m3
    calculated: 1000.0 // kg/m3
  },
  
  // Pressure Explorer state
  pressure: {
    depth: 5.0,    // m
    density: 1000, // kg/m3
    g: 10,         // N/kg
    calculated: 50000 // Pa
  },
  
  // Quiz State
  quiz: {
    questions: [],
    currentIndex: 0,
    correctCount: 0,
    answersSubmitted: [], // array of objects { question, type, userAns, correctAns, isCorrect, steps }
    selectedMCQOption: null
  },
  
  // Flashcard Deck State
  flashcards: {
    cards: [
      { q: "Formula for density", a: "ρ = m ÷ V" },
      { q: "SI unit of density", a: "kg/m³" },
      { q: "Formula for liquid pressure", a: "P = hρg" },
      { q: "What does h represent in P = hρg?", a: "The vertical depth of the liquid column (in metres)" },
      { q: "Value of g used in O-Level problems", a: "10 N/kg" },
      { q: "Does liquid pressure depend on container shape?", a: "No — only depth and density matter" },
      { q: "What happens to pressure as you go deeper?", a: "Pressure increases" },
      { q: "Which is denser — fresh water or seawater?", a: "Seawater (1025 kg/m³ vs 1000 kg/m³)" },
      { q: "Density of mercury", a: "13,600 kg/m³" },
      { q: "If h = 3 m, ρ = 1000 kg/m³, g = 10 N/kg, find P", a: "P = 3 × 1000 × 10 = 30,000 Pa" },
      { q: "A liquid has mass 5 kg and volume 0.005 m³. Find ρ", a: "ρ = 5 ÷ 0.005 = 1000 kg/m³" },
      { q: "Why is pressure at the bottom of the ocean extremely high?", a: "Very large depth h means very large P = hρg" }
    ],
    currentIndex: 0,
    reviewQueue: [], // list of card indexes to review again
    completed: false
  }
};

// Known Liquid Reference Points for Toast/Labels
const LIQUID_REFERENCES = [
  { name: "Air", density: 1.2, margin: 10 },
  { name: "Oil", density: 800, margin: 50 },
  { name: "Fresh Water", density: 1000, margin: 25 },
  { name: "Seawater", density: 1025, margin: 15 },
  { name: "Glycerol", density: 1260, margin: 40 },
  { name: "Mercury", density: 13600, margin: 200 }
];

// ==========================================
// 2. DOM ELEMENTS SELECTORS
// ==========================================
const DOM = {
  // Navigation Tabs
  navBtns: document.querySelectorAll('.nav-tab-btn'),
  tabs: {
    concept: document.getElementById('section-concept'),
    density: document.getElementById('section-density'),
    pressure: document.getElementById('section-pressure'),
    quiz: document.getElementById('section-quiz'),
    score: document.getElementById('section-score'),
    flashcards: document.getElementById('section-flashcards')
  },
  
  // Concept Panel elements
  insight1: document.getElementById('insight-1'),
  insight2: document.getElementById('insight-2'),
  
  // Density Explorer Elements
  densityMassSlider: document.getElementById('density-mass-slider'),
  densityVolumeSlider: document.getElementById('density-volume-slider'),
  densityMassReadout: document.getElementById('density-mass-readout'),
  densityVolumeReadout: document.getElementById('density-volume-readout'),
  calculatedDensity: document.getElementById('calculated-density'),
  densityMarker: document.getElementById('density-marker'),
  liquidIdentToast: document.getElementById('liquid-ident-toast'),
  liquidIdentName: document.getElementById('liquid-ident-name'),
  
  // Pressure Explorer Elements
  pressureDepthSlider: document.getElementById('pressure-depth-slider'),
  pressureDensitySlider: document.getElementById('pressure-density-slider'),
  pressureDepthReadout: document.getElementById('pressure-depth-readout'),
  pressureDensityReadout: document.getElementById('pressure-density-readout'),
  calculatedPressure: document.getElementById('calculated-pressure'),
  calculatedPressureUnit: document.getElementById('calculated-pressure-unit'),
  calculationSteps: document.getElementById('calculation-steps'),
  pressureProbe: document.getElementById('pressure-probe'),
  pressureDot: document.getElementById('pressure-dot'),
  dotElement: document.getElementById('dot-element'),
  liquidVolume: document.getElementById('liquid-volume-element'),
  pressureTank: document.getElementById('pressure-tank-bg'),
  presetBtns: document.querySelectorAll('.preset-btn'),
  
  // Quiz Elements
  quizProgressText: document.getElementById('quiz-progress-text'),
  quizCorrectCount: document.getElementById('quiz-correct-count'),
  quizProgressBar: document.getElementById('quiz-progress-bar'),
  quizBox: document.getElementById('quiz-box'),
  quizTypeBadge: document.getElementById('quiz-type-badge'),
  quizQuestionPrompt: document.getElementById('quiz-question-prompt'),
  quizInputArea: document.getElementById('quiz-input-area'),
  quizFeedbackPanel: document.getElementById('quiz-feedback-panel'),
  quizFeedbackIcon: document.getElementById('quiz-feedback-icon'),
  quizFeedbackTitle: document.getElementById('quiz-feedback-title'),
  quizFeedbackDesc: document.getElementById('quiz-feedback-desc'),
  quizSubmitBtn: document.getElementById('quiz-submit-btn'),
  quizNextBtn: document.getElementById('quiz-next-btn'),
  celebrationCanvas: document.getElementById('canvas-celebration'),
  
  // Score Screen Elements
  finalScoreReadout: document.getElementById('final-score-readout'),
  starRatingContainer: document.getElementById('star-rating-container'),
  scoreGradeMessage: document.getElementById('score-grade-message'),
  scoreRetryBtn: document.getElementById('score-retry-btn'),
  scoreFlashcardsBtn: document.getElementById('score-flashcards-btn'),
  
  // Flashcard Elements
  flashcardCardBox: document.getElementById('flashcard-card-box'),
  cardQuestionText: document.getElementById('card-question-text'),
  cardAnswerText: document.getElementById('card-answer-text'),
  cardIndexCounter: document.getElementById('card-index-counter'),
  cardTotalCounter: document.getElementById('card-total-counter'),
  cardPendingCounter: document.getElementById('card-pending-counter'),
  cardReviewBtn: document.getElementById('card-review-btn'),
  cardGotitBtn: document.getElementById('card-gotit-btn'),
  deckCompletePanel: document.getElementById('deck-complete-panel'),
  cardResetDeckBtn: document.getElementById('card-reset-deck-btn')
};

// ==========================================
// 3. NAVIGATION CONTROLLER
// ==========================================
function switchTab(tabId) {
  STATE.currentTab = tabId;
  
  // Update UI tabs view visibility
  Object.keys(DOM.tabs).forEach(id => {
    if (id === tabId) {
      DOM.tabs[id].classList.remove('hidden');
    } else {
      DOM.tabs[id].classList.add('hidden');
    }
  });

  // Update navigation button active state
  DOM.navBtns.forEach(btn => {
    const target = btn.getAttribute('data-target');
    if (target === tabId) {
      btn.classList.add('text-aqua');
      btn.classList.remove('text-gray-500', 'hover:text-gray-300');
    } else {
      btn.classList.remove('text-aqua');
      btn.classList.add('text-gray-500', 'hover:text-gray-300');
    }
  });
  
  // Tab-specific trigger actions
  if (tabId === 'concept') {
    triggerConceptAnimations();
  } else if (tabId === 'quiz') {
    renderQuestion();
  }
}

function triggerConceptAnimations() {
  // Reset animations
  DOM.insight1.classList.remove('animate-flash');
  DOM.insight2.classList.remove('animate-flash');
  
  // Reflow and trigger highlight flash on load/switch
  void DOM.insight1.offsetWidth; 
  void DOM.insight2.offsetWidth; 
  
  DOM.insight1.classList.add('animate-flash');
  DOM.insight2.classList.add('animate-flash');
}

// Bind navigation clicks
DOM.navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.getAttribute('data-target');
    switchTab(target);
  });
});

// ==========================================
// 4. SECTION 2A — DENSITY SIMULATOR
// ==========================================
function updateDensitySimulator() {
  const m = parseFloat(DOM.densityMassSlider.value);
  const V = parseFloat(DOM.densityVolumeSlider.value);
  
  STATE.density.mass = m;
  STATE.density.volume = V;
  
  // Formula: rho = m / V
  const rho = m / V;
  STATE.density.calculated = rho;
  
  // Update labels
  DOM.densityMassReadout.textContent = m.toFixed(1);
  DOM.densityVolumeReadout.textContent = V.toFixed(3);
  DOM.calculatedDensity.textContent = rho.toFixed(1);
  
  // Map density to logarithmic scale position or linear position for the bar indicator
  // Density range possible: 0.1/0.020 = 5 kg/m3 to 20/0.001 = 20,000 kg/m3
  // Let's use a nice custom scaling for visualization mapping (5 to 14,000)
  const minDensity = 5;
  const maxDensity = 14000;
  let percent = ((rho - minDensity) / (maxDensity - minDensity)) * 100;
  percent = Math.min(Math.max(percent, 2), 95); // bounds clamp
  DOM.densityMarker.style.left = `${percent}%`;
  
  // Find close liquid references
  let detected = null;
  for (const ref of LIQUID_REFERENCES) {
    if (Math.abs(rho - ref.density) <= ref.margin) {
      detected = ref;
      break;
    }
  }
  
  if (detected) {
    DOM.liquidIdentName.textContent = detected.name;
    DOM.liquidIdentToast.classList.remove('opacity-0');
    DOM.liquidIdentToast.classList.add('opacity-100');
  } else {
    DOM.liquidIdentToast.classList.remove('opacity-100');
    DOM.liquidIdentToast.classList.add('opacity-0');
  }
}

DOM.densityMassSlider.addEventListener('input', updateDensitySimulator);
DOM.densityVolumeSlider.addEventListener('input', updateDensitySimulator);

// ==========================================
// 5. SECTION 2B — LIQUID PRESSURE SIMULATOR
// ==========================================
function updatePressureSimulator() {
  const h = parseFloat(STATE.pressure.depth);
  const rho = parseInt(STATE.pressure.density);
  const g = STATE.pressure.g;
  
  // Calculate P = h * rho * g
  const P = h * rho * g;
  STATE.pressure.calculated = P;
  
  // Update Readout labels
  DOM.pressureDepthSlider.value = h.toFixed(1);
  DOM.pressureDepthReadout.textContent = h.toFixed(1);
  DOM.pressureDensitySlider.value = rho;
  DOM.pressureDensityReadout.textContent = rho.toLocaleString();
  
  if (P > 10000) {
    DOM.calculatedPressure.textContent = (P / 1000).toFixed(1);
    DOM.calculatedPressureUnit.textContent = 'kPa';
  } else {
    DOM.calculatedPressure.textContent = P.toLocaleString();
    DOM.calculatedPressureUnit.textContent = 'Pa';
  }
  
  // Working steps breakdown
  DOM.calculationSteps.innerHTML = `P = ${h.toFixed(1)} &times; ${rho} &times; ${g} = <span class="text-aqua font-bold font-tech">${P.toLocaleString()} Pa</span>`;
  
  // Update tank visualization liquid color shift (density based)
  // Low density (800) -> light blue, High density (13600) -> dark teal/grey
  // Scale density from 800 to 13600 onto liquid hue/opacity
  const densityRatio = (rho - 800) / (13600 - 800);
  const liquidHue = 195 + (45 * densityRatio); // shift blue towards cyan/grey
  const liquidLightness = 35 - (25 * densityRatio); // darken with density
  const liquidColor = `hsla(${liquidHue}, 70%, ${liquidLightness}%, 0.65)`;
  DOM.liquidVolume.style.backgroundColor = liquidColor;
  DOM.liquidVolume.style.borderTop = `2px solid hsla(${liquidHue}, 90%, ${liquidLightness + 10}%, 0.9)`;
  
  // Position visual pressure probe inside tank
  // Depth h maps: 0m to 10m -> top to bottom
  const tankHeight = DOM.pressureTank.clientHeight;
  const probeYPercent = (h / 10.0) * 100; // percent from top
  // Clamp visually
  const clampedYPercent = Math.min(Math.max(probeYPercent, 5), 95);
  
  DOM.pressureProbe.style.bottom = `${100 - clampedYPercent}%`;
  DOM.pressureDot.style.bottom = `${100 - clampedYPercent}%`;
  
  // Update dot size proportional to pressure magnitude
  const maxVisualP = 100000;
  const scaleFactor = Math.min(Math.max(P / maxVisualP, 0.5), 4.0);
  DOM.dotElement.style.transform = `scale(${scaleFactor})`;
}

// Draggable Probe Logic
let isDraggingProbe = false;

function handleProbeDrag(clientY) {
  const rect = DOM.pressureTank.getBoundingClientRect();
  const relativeY = clientY - rect.top;
  let percentage = relativeY / rect.height;
  percentage = Math.min(Math.max(percentage, 0.01), 0.99); // boundary clamp
  
  // Calculate corresponding depth from Y coordinate percentage
  const newDepth = percentage * 10.0;
  STATE.pressure.depth = Math.round(newDepth * 10) / 10; // round to 1 d.p.
  
  updatePressureSimulator();
}

DOM.pressureProbe.addEventListener('pointerdown', (e) => {
  isDraggingProbe = true;
  DOM.pressureProbe.setPointerCapture(e.pointerId);
  e.preventDefault();
});

DOM.pressureProbe.addEventListener('pointermove', (e) => {
  if (isDraggingProbe) {
    handleProbeDrag(e.clientY);
  }
});

DOM.pressureProbe.addEventListener('pointerup', () => {
  isDraggingProbe = false;
});

// Also make the tank container clickable to relocate probe
DOM.pressureTank.addEventListener('pointerdown', (e) => {
  if (e.target !== DOM.pressureProbe) {
    handleProbeDrag(e.clientY);
  }
});

// Sliders and presets triggers
DOM.pressureDepthSlider.addEventListener('input', (e) => {
  STATE.pressure.depth = parseFloat(e.target.value);
  updatePressureSimulator();
});

DOM.pressureDensitySlider.addEventListener('input', (e) => {
  STATE.pressure.density = parseInt(e.target.value);
  updatePressureSimulator();
});

DOM.presetBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const val = parseInt(btn.getAttribute('data-density'));
    STATE.pressure.density = val;
    updatePressureSimulator();
  });
});

// ==========================================
// 6. SECTION 3 — RANDOMISED QUIZ
// ==========================================
function generateQuiz() {
  const questions = [];
  
  // --- TYPE A: Calculate Density (6 questions) ---
  for (let i = 0; i < 6; i++) {
    const mass = Math.round((0.5 + Math.random() * 19.5) * 10) / 10; // 0.5 to 20.0 kg
    const vol = Math.round((0.001 + Math.random() * 0.019) * 1000) / 1000; // 0.001 to 0.020 m3
    const correctAns = Math.round((mass / vol) * 10) / 10;
    
    questions.push({
      type: 'A',
      title: 'CALCULATE DENSITY',
      prompt: `An object has a mass of <strong>${mass.toFixed(1)} kg</strong> and occupies a volume of <strong>${vol.toFixed(3)} m³</strong>. Calculate its density.`,
      answerType: 'numeric',
      correctAns: correctAns,
      exactCorrectVal: mass / vol,
      unit: 'kg/m³',
      steps: `&rho; = m &divide; V <br> &rho; = ${mass.toFixed(1)} &divide; ${vol.toFixed(3)} = <strong>${correctAns.toFixed(1)} kg/m³</strong>`
    });
  }

  // --- TYPE B: Calculate Mass (5 questions) ---
  for (let i = 0; i < 5; i++) {
    const rho = (Math.floor(5 + Math.random() * 131) * 100); // 500 to 13600 kg/m3 (multiples of 100)
    const vol = Math.round((0.001 + Math.random() * 0.049) * 1000) / 1000; // 0.001 to 0.050 m3
    const correctAns = Math.round((rho * vol) * 10) / 10;
    
    questions.push({
      type: 'B',
      title: 'CALCULATE MASS',
      prompt: `A liquid of density <strong>${rho.toLocaleString()} kg/m³</strong> is poured into a container. If the volume of the liquid is <strong>${vol.toFixed(3)} m³</strong>, calculate its mass.`,
      answerType: 'numeric',
      correctAns: correctAns,
      exactCorrectVal: rho * vol,
      unit: 'kg',
      steps: `m = &rho; &times; V <br> m = ${rho} &times; ${vol.toFixed(3)} = <strong>${correctAns.toFixed(1)} kg</strong>`
    });
  }

  // --- TYPE C: Calculate Volume (5 questions) ---
  for (let i = 0; i < 5; i++) {
    const rho = (Math.floor(8 + Math.random() * 43) * 100); // 800 to 5000 kg/m3
    const mass = Math.round((1.0 + Math.random() * 49.0) * 10) / 10; // 1.0 to 50.0 kg
    const correctAns = Math.round((mass / rho) * 10000) / 10000;
    
    questions.push({
      type: 'C',
      title: 'CALCULATE VOLUME',
      prompt: `Find the volume of a block of material with mass <strong>${mass.toFixed(1)} kg</strong> and density <strong>${rho.toLocaleString()} kg/m³</strong>.`,
      answerType: 'numeric',
      correctAns: correctAns,
      exactCorrectVal: mass / rho,
      unit: 'm³',
      steps: `V = m &divide; &rho; <br> V = ${mass.toFixed(1)} &divide; ${rho} = <strong>${correctAns.toFixed(4)} m³</strong>`
    });
  }

  // --- TYPE D: Calculate Liquid Pressure (6 questions) ---
  for (let i = 0; i < 6; i++) {
    const depth = Math.round((0.5 + Math.random() * 7.5) * 10) / 10; // 0.5 to 8.0 m
    const rho = (Math.floor(8 + Math.random() * 129) * 100); // 800 to 13600 kg/m3
    const correctAnsVal = depth * rho * 10;
    
    let displayAns, stepsText;
    if (correctAnsVal >= 10000) {
      displayAns = Math.round((correctAnsVal / 1000) * 10) / 10; // to 1 d.p. in kPa
      stepsText = `P = h &rho; g <br> P = ${depth.toFixed(1)} &times; ${rho} &times; 10 = ${correctAnsVal.toLocaleString()} Pa = <strong>${displayAns.toFixed(1)} kPa</strong>`;
    } else {
      displayAns = correctAnsVal;
      stepsText = `P = h &rho; g <br> P = ${depth.toFixed(1)} &times; ${rho} &times; 10 = <strong>${displayAns} Pa</strong>`;
    }

    questions.push({
      type: 'D',
      title: 'CALCULATE LIQUID PRESSURE',
      prompt: `Calculate the pressure exerted by a liquid column at a depth of <strong>${depth.toFixed(1)} m</strong>. The density of the liquid is <strong>${rho.toLocaleString()} kg/m³</strong>. (g = 10 N/kg)`,
      answerType: 'numeric',
      correctAns: displayAns,
      exactCorrectVal: correctAnsVal, // stored in base units (Pa)
      unit: correctAnsVal >= 10000 ? 'kPa' : 'Pa',
      steps: stepsText
    });
  }

  // --- TYPE E: Conceptual MCQs (8 questions shuffled from templates) ---
  const mcqTemplates = [
    {
      prompt: "Two containers of different shapes are filled with water to the same height. How does the pressure at the bottom compare?",
      options: [
        "The wider one has more pressure",
        "It depends on container width",
        "It depends on container volume",
        "They are equal"
      ],
      correctIdx: 3,
      steps: "Liquid pressure is given by P = hρg. Since depth (h), density (ρ), and g are identical, the pressure is equal regardless of shape."
    },
    {
      prompt: "A diver descends deeper underwater. What happens to the water pressure on the diver?",
      options: [
        "Decreases",
        "Stays the same",
        "Increases",
        "Depends on water temperature"
      ],
      correctIdx: 2,
      steps: "As depth (h) increases, pressure increases proportionally because P = hρg."
    },
    {
      prompt: "Which liquid would produce the greatest pressure at a depth of 2 m?",
      options: [
        "Fresh water (ρ = 1000 kg/m³)",
        "Oil (ρ = 800 kg/m³)",
        "Seawater (ρ = 1025 kg/m³)",
        "Mercury (ρ = 13,600 kg/m³)"
      ],
      correctIdx: 3,
      steps: "Since P = hρg, the liquid with the highest density (mercury) produces the greatest pressure at any given depth."
    },
    {
      prompt: "The SI unit of density is:",
      options: [
        "kg/m²",
        "N/m³",
        "kg/m³",
        "Pa"
      ],
      correctIdx: 2,
      steps: "Density is mass divided by volume. Mass is measured in kg and volume in m³, giving the unit kg/m³."
    },
    {
      prompt: "If depth doubles and density stays the same, liquid pressure:",
      options: [
        "halves",
        "stays the same",
        "doubles",
        "quadruples"
      ],
      correctIdx: 2,
      steps: "P = hρg. Pressure is directly proportional to depth (h). Doubling depth doubles the pressure."
    },
    {
      prompt: "Which of the following factors does NOT affect liquid pressure?",
      options: [
        "Shape of the container",
        "Depth of the liquid",
        "Density of the liquid",
        "Gravitational field strength"
      ],
      correctIdx: 0,
      steps: "P = hρg only depends on depth (h), density (ρ), and gravity (g). Container shape does not play a role."
    },
    {
      prompt: "What is the density of a substance if 2 kg of it occupies a volume of 0.002 m³?",
      options: [
        "100 kg/m³",
        "1000 kg/m³",
        "10 kg/m³",
        "500 kg/m³"
      ],
      correctIdx: 1,
      steps: "ρ = m ÷ V = 2 ÷ 0.002 = 1000 kg/m³."
    },
    {
      prompt: "Why is a brick wall at the base of a dam much thicker than at the top?",
      options: [
        "To look architecturally pleasing",
        "Because water pressure increases with depth",
        "Because water is denser at the bottom",
        "To prevent fish from jumping over"
      ],
      correctIdx: 1,
      steps: "Liquid pressure increases with depth, requiring stronger and thicker structures at the bottom to withstand the high force."
    }
  ];

  mcqTemplates.forEach(t => {
    questions.push({
      type: 'E',
      title: 'CONCEPTUAL CHECK',
      prompt: t.prompt,
      answerType: 'mcq',
      options: t.options,
      correctAns: t.options[t.correctIdx],
      steps: t.steps
    });
  });

  // Shuffle quiz questions
  STATE.quiz.questions = questions.sort(() => Math.random() - 0.5);
  STATE.quiz.currentIndex = 0;
  STATE.quiz.correctCount = 0;
  STATE.quiz.answersSubmitted = [];
}

// --- QUIZ HELPERS FOR DYNAMIC UNIT ENTRY ---
function parseUserNumericInput(inputStr) {
  // Regex to extract number (integer or float) and the trailing unit string
  const match = inputStr.trim().match(/^([+-]?[0-9]*\.?[0-9]+)\s*(.*)$/);
  if (!match) {
    return { value: NaN, unit: "" };
  }
  return {
    value: parseFloat(match[1]),
    unit: match[2].trim()
  };
}

function normalizeUnit(unitStr, qType) {
  let u = unitStr.toLowerCase().replace(/\s+/g, '').replace(/\^/g, '');
  if (qType === 'D') {
    if (u === 'pa' || u === 'n/m2' || u === 'n/m²') return 'pa';
    if (u === 'kpa' || u === 'kn/m2' || u === 'kn/m²') return 'kpa';
  } else if (qType === 'A') {
    if (u === 'kg/m3' || u === 'kg/m³') return 'kg/m3';
  } else if (qType === 'B') {
    if (u === 'kg') return 'kg';
  } else if (qType === 'C') {
    if (u === 'm3' || u === 'm³') return 'm3';
  }
  return u.replace(/³/g, '3').replace(/²/g, '2');
}

function renderQuestion() {
  const currentIdx = STATE.quiz.currentIndex;
  const q = STATE.quiz.questions[currentIdx];
  
  // Update Header & Progress UI
  DOM.quizProgressText.textContent = `Question ${currentIdx + 1} of 30`;
  DOM.quizCorrectCount.textContent = `${STATE.quiz.correctCount}/${currentIdx}`;
  DOM.quizProgressBar.style.width = `${((currentIdx + 1) / 30) * 100}%`;
  
  // Setup Badge & Question
  DOM.quizTypeBadge.textContent = q.title;
  DOM.quizQuestionPrompt.innerHTML = q.prompt;
  
  // Hide feedback & buttons
  DOM.quizFeedbackPanel.classList.add('hidden');
  DOM.quizSubmitBtn.classList.remove('hidden');
  DOM.quizNextBtn.classList.add('hidden');
  
  // Reset selected state
  STATE.quiz.selectedMCQOption = null;
  DOM.quizInputArea.innerHTML = '';
  
  if (q.answerType === 'numeric') {
    // Render text input for value + unit entry
    const div = document.createElement('div');
    div.className = 'flex flex-col items-center space-y-2 max-w-sm mx-auto mt-4';
    div.innerHTML = `
      <input type="text" id="quiz-numeric-input" placeholder="e.g. 10.5 ${q.unit}" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center text-lg font-tech font-semibold text-aqua outline-none focus:border-aqua transition-all">
      <span class="text-[10px] text-gray-500 italic font-tech text-center">Enter both numerical value and correct unit (0 to 4 decimal places accepted)</span>
    `;
    DOM.quizInputArea.appendChild(div);
  } else {
    // Render MCQ Button Grid
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-1 gap-3 mt-4';
    
    q.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'mcq-opt-btn w-full text-left px-5 py-3.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all font-medium text-sm flex items-center space-x-3';
      btn.innerHTML = `
        <span class="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center text-xs font-tech text-gray-400">${String.fromCharCode(65 + idx)}</span>
        <span>${opt}</span>
      `;
      btn.addEventListener('click', () => {
        // Select logic
        document.querySelectorAll('.mcq-opt-btn').forEach(b => {
          b.classList.remove('border-green-500', 'bg-green-500/10');
          b.querySelector('span').classList.remove('border-green-500', 'text-green-400');
        });
        btn.classList.add('border-green-500', 'bg-green-500/10');
        btn.querySelector('span').classList.add('border-green-500', 'text-green-400');
        STATE.quiz.selectedMCQOption = opt;
      });
      grid.appendChild(btn);
    });
    DOM.quizInputArea.appendChild(grid);
  }
}

function checkQuizAnswer() {
  const currentIdx = STATE.quiz.currentIndex;
  const q = STATE.quiz.questions[currentIdx];
  let userAns, isCorrect = false;
  
  if (q.answerType === 'numeric') {
    const input = document.getElementById('quiz-numeric-input');
    const inputVal = input.value.trim();
    if (!inputVal) {
      alert("Please enter your answer.");
      return;
    }
    
    const parsed = parseUserNumericInput(inputVal);
    userAns = inputVal;
    
    if (isNaN(parsed.value)) {
      isCorrect = false;
    } else {
      const normUserUnit = normalizeUnit(parsed.unit, q.type);
      const normCorrectUnit = normalizeUnit(q.unit, q.type);
      
      let targetVal = q.exactCorrectVal;
      let unitValid = (normUserUnit === normCorrectUnit);
      
      if (q.type === 'D') {
        if (normUserUnit === 'kpa') {
          targetVal = q.exactCorrectVal / 1000.0;
          unitValid = true;
        } else if (normUserUnit === 'pa') {
          targetVal = q.exactCorrectVal;
          unitValid = true;
        }
      }
      
      const valStr = parsed.value.toString();
      const dotIdx = valStr.indexOf('.');
      const dp = dotIdx === -1 ? 0 : valStr.length - dotIdx - 1;
      const clampedDp = Math.min(Math.max(dp, 0), 4);
      
      const factor = Math.pow(10, clampedDp);
      const roundedTarget = Math.round(targetVal * factor) / factor;
      
      const numCorrect = Math.abs(parsed.value - roundedTarget) < 1e-9;
      isCorrect = numCorrect && unitValid;
    }
  } else {
    if (!STATE.quiz.selectedMCQOption) {
      alert("Please select one option.");
      return;
    }
    userAns = STATE.quiz.selectedMCQOption;
    isCorrect = (userAns === q.correctAns);
  }
  
  // Submit state update
  DOM.quizSubmitBtn.classList.add('hidden');
  DOM.quizNextBtn.classList.remove('hidden');
  
  // Style feedback panel
  DOM.quizFeedbackPanel.classList.remove('hidden');
  if (isCorrect) {
    STATE.quiz.correctCount++;
    DOM.quizFeedbackPanel.className = "p-4 rounded-xl border border-green-500/20 bg-green-500/10 flex items-start space-x-3 text-green-400";
    DOM.quizFeedbackIcon.innerHTML = `<i class="fa-solid fa-circle-check"></i>`;
    DOM.quizFeedbackTitle.textContent = "Great work! Correct.";
    DOM.quizFeedbackDesc.innerHTML = q.steps;
    
    // Celebratory burst animation
    triggerQuizCelebration();
  } else {
    DOM.quizFeedbackPanel.className = "p-4 rounded-xl border border-red-500/20 bg-red-500/10 flex items-start space-x-3 text-red-400";
    DOM.quizFeedbackIcon.innerHTML = `<i class="fa-solid fa-circle-xmark"></i>`;
    DOM.quizFeedbackTitle.textContent = "Incorrect";
    
    let feedbackHint = "";
    if (q.answerType === 'numeric') {
      const input = document.getElementById('quiz-numeric-input');
      const inputVal = input.value.trim();
      const parsed = parseUserNumericInput(inputVal);
      if (!isNaN(parsed.value)) {
        const normUserUnit = normalizeUnit(parsed.unit, q.type);
        const normCorrectUnit = normalizeUnit(q.unit, q.type);
        
        let targetVal = q.exactCorrectVal;
        let unitValid = (normUserUnit === normCorrectUnit);
        
        if (q.type === 'D') {
          if (normUserUnit === 'kpa') {
            targetVal = q.exactCorrectVal / 1000.0;
            unitValid = true;
          } else if (normUserUnit === 'pa') {
            targetVal = q.exactCorrectVal;
            unitValid = true;
          }
        }
        
        const valStr = parsed.value.toString();
        const dotIdx = valStr.indexOf('.');
        const dp = dotIdx === -1 ? 0 : valStr.length - dotIdx - 1;
        const clampedDp = Math.min(Math.max(dp, 0), 4);
        const factor = Math.pow(10, clampedDp);
        const roundedTarget = Math.round(targetVal * factor) / factor;
        const numCorrect = Math.abs(parsed.value - roundedTarget) < 1e-9;
        
        if (numCorrect && !unitValid) {
          feedbackHint = "<span class='text-amber font-semibold font-tech'><i class='fa-solid fa-circle-info mr-1'></i> Hint: Your calculation value is correct, but check your unit spelling! (Allowed: " + (q.type === 'D' ? 'Pa, kPa, N/m², kN/m²' : q.unit) + ")</span><br><br>";
        } else if (!numCorrect && unitValid) {
          feedbackHint = "<span class='text-amber font-semibold font-tech'><i class='fa-solid fa-circle-info mr-1'></i> Hint: Your unit is correct, but check your calculation value! (Accepts 0 to 4 decimal places)</span><br><br>";
        }
      }
    }
    
    DOM.quizFeedbackDesc.innerHTML = `${feedbackHint}Correct Answer: <strong>${q.correctAns} ${q.unit || ''}</strong><br><br>${q.steps}`;
    
    // Error shake animation
    DOM.quizBox.classList.add('animate-shake');
    setTimeout(() => DOM.quizBox.classList.remove('animate-shake'), 400);
  }
  
  STATE.quiz.answersSubmitted.push({
    question: q.prompt,
    type: q.type,
    userAns: userAns,
    correctAns: q.correctAns,
    isCorrect: isCorrect
  });
}

function nextQuizQuestion() {
  STATE.quiz.currentIndex++;
  if (STATE.quiz.currentIndex < 30) {
    renderQuestion();
  } else {
    showScoreReport();
  }
}

DOM.quizSubmitBtn.addEventListener('click', checkQuizAnswer);
DOM.quizNextBtn.addEventListener('click', nextQuizQuestion);

// Simple canvas celebration particles
let particles = [];
let celebrationCtx = null;
let animationFrameId = null;

function triggerQuizCelebration() {
  const canvas = DOM.celebrationCanvas;
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight;
  celebrationCtx = canvas.getContext('2d');
  
  particles = [];
  for (let i = 0; i < 60; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.7) * 8 - 2,
      color: `hsl(${Math.random() * 360}, 80%, 60%)`,
      size: Math.random() * 4 + 2,
      alpha: 1
    });
  }
  
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  animateParticles();
}

function animateParticles() {
  const ctx = celebrationCtx;
  const canvas = DOM.celebrationCanvas;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  let active = false;
  particles.forEach(p => {
    if (p.alpha > 0.01) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15; // gravity
      p.alpha -= 0.015;
      
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      active = true;
    }
  });
  
  if (active) {
    animationFrameId = requestAnimationFrame(animateParticles);
  }
}

// ==========================================
// 7. SECTION 4 — SCORE REPORT
// ==========================================
function showScoreReport() {
  const score = STATE.quiz.correctCount;
  DOM.finalScoreReadout.textContent = score;
  
  // Star rating algorithm (1-3 stars)
  let starsHtml = '';
  let rating = 1;
  
  if (score >= 24) {
    rating = 3;
  } else if (score >= 15) {
    rating = 2;
  } else {
    rating = 1;
  }
  
  for (let i = 1; i <= 3; i++) {
    if (i <= rating) {
      starsHtml += `<i class="fa-solid fa-star text-amber glow-amber"></i>`;
    } else {
      starsHtml += `<i class="fa-solid fa-star text-gray-700"></i>`;
    }
  }
  DOM.starRatingContainer.innerHTML = starsHtml;
  
  // Grade evaluation messages
  let desc = "";
  if (score >= 24) {
    desc = "Excellent! You've mastered liquid pressure and density.";
  } else if (score >= 15) {
    desc = "Good effort! Review the questions you got wrong.";
  } else {
    desc = "Keep practising — revisit both formulas and try again.";
  }
  DOM.scoreGradeMessage.textContent = desc;
  
  switchTab('score');
}

DOM.scoreRetryBtn.addEventListener('click', () => {
  generateQuiz();
  switchTab('quiz');
  renderQuestion();
});

DOM.scoreFlashcardsBtn.addEventListener('click', () => {
  resetFlashcardDeck();
  switchTab('flashcards');
});

// ==========================================
// 8. SECTION 5 — FLASHCARD SYSTEM
// ==========================================
function resetFlashcardDeck() {
  STATE.flashcards.currentIndex = 0;
  STATE.flashcards.reviewQueue = [];
  STATE.flashcards.completed = false;
  
  DOM.deckCompletePanel.classList.add('hidden');
  DOM.flashcardCardBox.classList.remove('hidden');
  document.getElementById('card-review-btn').parentElement.classList.remove('hidden');
  
  updateFlashcardView();
}

function updateFlashcardView() {
  const fState = STATE.flashcards;
  let activeCardIndex;
  
  if (fState.currentIndex < fState.cards.length) {
    activeCardIndex = fState.currentIndex;
  } else if (fState.reviewQueue.length > 0) {
    activeCardIndex = fState.reviewQueue[0];
  } else {
    // Done!
    fState.completed = true;
    DOM.flashcardCardBox.classList.add('hidden');
    document.getElementById('card-review-btn').parentElement.classList.add('hidden');
    DOM.deckCompletePanel.classList.remove('hidden');
    return;
  }
  
  const card = fState.cards[activeCardIndex];
  
  // Set content
  DOM.cardQuestionText.textContent = card.q;
  DOM.cardAnswerText.textContent = card.a;
  
  // Unflip card
  DOM.flashcardCardBox.classList.remove('flipped');
  
  // Metadata update
  DOM.cardIndexCounter.textContent = activeCardIndex + 1;
  DOM.cardTotalCounter.textContent = fState.cards.length;
  DOM.cardPendingCounter.textContent = (fState.cards.length - fState.currentIndex) + fState.reviewQueue.length;
}

// Flip toggle click
DOM.flashcardCardBox.addEventListener('click', () => {
  DOM.flashcardCardBox.classList.toggle('flipped');
});

DOM.cardGotitBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  const fState = STATE.flashcards;
  
  if (fState.currentIndex < fState.cards.length) {
    fState.currentIndex++;
  } else if (fState.reviewQueue.length > 0) {
    fState.reviewQueue.shift(); // remove from queue
  }
  
  updateFlashcardView();
});

DOM.cardReviewBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  const fState = STATE.flashcards;
  let activeCardIndex;
  
  if (fState.currentIndex < fState.cards.length) {
    activeCardIndex = fState.currentIndex;
    fState.currentIndex++;
    if (!fState.reviewQueue.includes(activeCardIndex)) {
      fState.reviewQueue.push(activeCardIndex);
    }
  } else if (fState.reviewQueue.length > 0) {
    // Re-queue at end of review stack
    activeCardIndex = fState.reviewQueue.shift();
    fState.reviewQueue.push(activeCardIndex);
  }
  
  updateFlashcardView();
});

DOM.cardResetDeckBtn.addEventListener('click', resetFlashcardDeck);

// ==========================================
// 9. INITIALIZATION
// ==========================================
function init() {
  // Setup views
  updateDensitySimulator();
  updatePressureSimulator();
  generateQuiz();
  resetFlashcardDeck();
  
  // Load default view
  switchTab('concept');
}

// Run initializer
document.addEventListener('DOMContentLoaded', init);
window.addEventListener('load', init);
// Run straight away in case of early loads
init();
