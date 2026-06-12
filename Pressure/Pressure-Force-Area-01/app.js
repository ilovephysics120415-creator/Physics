// --- SECTIONS NAVIGATION ---
function switchSection(targetId) {
  // Hide all sections
  document.querySelectorAll('.nav-section').forEach(sec => {
    sec.classList.remove('active');
  });
  // Show target
  const targetSec = document.getElementById(`sec-${targetId}`);
  if (targetSec) targetSec.classList.add('active');

  // Update nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    if (btn.getAttribute('data-target') === targetId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Section specific initializers
  if (targetId === 'flashcards') {
    initFlashcards();
  }
}

// --- SECTION 1 & 2: SIMULATOR & CONCEPT ---

const sliderForce = document.getElementById('slider-force');
const sliderArea = document.getElementById('slider-area');
const forceNum = document.getElementById('force-num');
const areaNum = document.getElementById('area-num');
const pressureVal = document.getElementById('pressure-val');
const deformationPad = document.getElementById('deformation-pad');
const forceArrow = document.getElementById('force-arrow');
const presetFeedback = document.getElementById('preset-feedback');

// Listen to sliders
sliderForce.addEventListener('input', () => {
  presetFeedback.textContent = ''; // clear preset description if manually slider changes
  updateSimulation();
});
sliderArea.addEventListener('input', () => {
  presetFeedback.textContent = ''; // clear preset description if manually slider changes
  updateSimulation();
});

// Pulse effect on concept thumbnails
document.querySelectorAll('.thumb-card').forEach((card, idx) => {
  card.style.animationDelay = `${idx * 0.15}s`;
});

function updateSimulation(customF = null, customA = null) {
  let f = customF !== null ? customF : parseFloat(sliderForce.value);
  let a = customA !== null ? customA : parseFloat(sliderArea.value);

  // Sync sliders if within slider range
  if (customF !== null) {
    sliderForce.value = Math.min(Math.max(customF, 10), 1000);
  }
  if (customA !== null) {
    sliderArea.value = Math.min(Math.max(customA, 0.001), 2.0);
  }

  // Update labels
  forceNum.textContent = `${f.toLocaleString()} N`;
  areaNum.textContent = `${a.toFixed(4)} m²`;

  // Calculate Pressure
  let p = f / a;
  
  // Format readout
  if (p >= 100000) {
    pressureVal.innerHTML = `${(p/1000).toFixed(1)} <span class="readout-unit">kPa</span>`;
  } else {
    pressureVal.innerHTML = `${p.toFixed(1)} <span class="readout-unit">Pa</span>`;
  }

  // Deform Pad (Compression)
  // Map pressure to pad height (min 35px, max 10px compression height)
  // Use log scale since pressure varies heavily (from 5 Pa to 1.2M Pa)
  const logMin = Math.log10(5);
  const logMax = Math.log10(1200000);
  const logVal = Math.log10(p);
  
  // Normalized 0 to 1 value
  let pct = (logVal - logMin) / (logMax - logMin);
  pct = Math.min(Math.max(pct, 0), 1);

  // Pad Height: squashes down
  let padHeight = 35 - (pct * 25);
  deformationPad.style.height = `${padHeight}px`;

  // Pad Width: changes with area (non-linear square root mapping from 15% to 90%)
  let padWidthPct = 15 + Math.pow((a / 2.0), 0.5) * 75;
  deformationPad.style.width = `${Math.min(Math.max(padWidthPct, 15), 90)}%`;

  // Pad Color Interpolation (Green -> Yellow -> Red)
  let color;
  if (pct < 0.5) {
    // Green to Yellow
    let localPct = pct * 2;
    let r = Math.round(181 + (255 - 181) * localPct);
    let g = Math.round(255);
    let b = Math.round(60 + (0 - 60) * localPct);
    color = `rgb(${r}, ${g}, ${b})`;
  } else {
    // Yellow to Red
    let localPct = (pct - 0.5) * 2;
    let r = 255;
    let g = Math.round(255 - (255 - 77) * localPct);
    let b = Math.round(0 + (109 - 0) * localPct);
    color = `rgb(${r}, ${g}, ${b})`;
  }
  deformationPad.style.backgroundColor = color;

  // Arrow size and intensity
  // Force maps to arrow height
  let arrowScaleY = 0.3 + (f / 1000) * 1.2;
  // Account for massive preset Force
  if (f > 1000) {
    arrowScaleY = 1.8;
  }
  forceArrow.style.transform = `scaleY(${arrowScaleY})`;
}

// Preset Shortcut Handler
function setPreset(f, a, name) {
  // Animate change with transition
  presetFeedback.textContent = `That's like standing a ${name} on the surface!`;
  
  // Transition simulation
  updateSimulation(f, a);

  // Add active styling to trigger thumbnail pulse
  const simulatorCard = document.querySelector('.simulator-card');
  simulatorCard.classList.add('celebrate');
  setTimeout(() => simulatorCard.classList.remove('celebrate'), 500);
}

// Set initial state
updateSimulation();


// --- SECTION 3: RANDOMISED QUIZ ---
let currentQuizIndex = 0;
let score = 0;
let quizQuestions = [];
let selectedMcqOption = null;

const qText = document.getElementById('quiz-question-text');
const numericContainer = document.getElementById('quiz-numeric-container');
const numericInput = document.getElementById('quiz-numeric-input');
const unitIndicator = document.getElementById('quiz-unit-indicator');
const numericHelp = document.getElementById('quiz-numeric-help');
const mcqContainer = document.getElementById('quiz-mcq-container');
const feedbackBox = document.getElementById('quiz-feedback-box');
const feedbackIcon = document.getElementById('feedback-icon');
const feedbackTitle = document.getElementById('feedback-title');
const feedbackMsg = document.getElementById('feedback-message');
const btnCheck = document.getElementById('btn-quiz-check');
const btnNext = document.getElementById('btn-quiz-next');
const questionCounter = document.getElementById('quiz-question-counter');
const quizProgressBar = document.getElementById('quiz-progress-bar');

// Define dynamic questions
function generateQuiz() {
  quizQuestions = [];
  
  // Helper functions
  const randRange = (min, max, step) => {
    let steps = (max - min) / step;
    return min + Math.round(Math.random() * steps) * step;
  };

  // Type A: Calculate Pressure (8 questions)
  for (let i = 0; i < 8; i++) {
    let f = randRange(20, 800, 10);
    let a = parseFloat(randRange(0.001, 2.0, 0.001).toFixed(3));
    let p = parseFloat((f / a).toFixed(1));
    quizQuestions.push({
      type: 'A',
      question: `Calculate the pressure when a force of <strong>${f} N</strong> is applied to a contact area of <strong>${a.toFixed(3)} m²</strong>.`,
      correctAnswer: p,
      exactAnswer: f / a,
      unit: 'Pa',
      working: `Working Steps:\n1. Formula: P = F ÷ A\n2. Substitute values: P = ${f} N ÷ ${a} m²\n3. Calculate: P = ${(f/a).toFixed(4)} Pa\n4. Round to 1 d.p.: ${p} Pa`
    });
  }

  // Type B: Calculate Force (7 questions)
  for (let i = 0; i < 7; i++) {
    let p = randRange(100, 50000, 100);
    let a = parseFloat(randRange(0.01, 1.0, 0.01).toFixed(2));
    let f = parseFloat((p * a).toFixed(1));
    quizQuestions.push({
      type: 'B',
      question: `Find the force required to produce a pressure of <strong>${p.toLocaleString()} Pa</strong> over an area of <strong>${a.toFixed(2)} m²</strong>.`,
      correctAnswer: f,
      exactAnswer: p * a,
      unit: 'N',
      working: `Working Steps:\n1. Rearrange formula: F = P × A\n2. Substitute values: F = ${p} Pa × ${a} m²\n3. Calculate: F = ${f} N`
    });
  }

  // Type C: Calculate Area (7 questions)
  for (let i = 0; i < 7; i++) {
    let p = randRange(500, 20000, 500);
    let f = randRange(50, 500, 50);
    let a = parseFloat((f / p).toFixed(4));
    quizQuestions.push({
      type: 'C',
      question: `Determine the contact area if a force of <strong>${f} N</strong> produces a pressure of <strong>${p.toLocaleString()} Pa</strong>.`,
      correctAnswer: a,
      exactAnswer: f / p,
      unit: 'm²',
      working: `Working Steps:\n1. Rearrange formula: A = F ÷ P\n2. Substitute values: A = ${f} N ÷ ${p} Pa\n3. Calculate: A = ${(f/p).toFixed(6)} m²\n4. Round to 4 d.p.: ${a} m²`
    });
  }

  // Type D: Conceptual MCQ (8 questions)
  const mcqPool = [
    {
      question: "A woman in stiletto heels exerts more pressure than an elephant. Why?",
      options: [
        "Her heels have a much smaller area, making pressure very high.",
        "She weighs more than the elephant.",
        "She stands on one leg.",
        "Elephants have four feet so pressure is multiplied."
      ],
      correct: 0
    },
    {
      question: "If force doubles and area stays the same, pressure ___",
      options: [
        "doubles",
        "halves",
        "stays the same",
        "quadruples"
      ],
      correct: 0
    },
    {
      question: "Which unit is used for pressure?",
      options: [
        "Pascal (Pa)",
        "Newton (N)",
        "Joule (J)",
        "Watt (W)"
      ],
      correct: 0
    },
    {
      question: "If the contact area is doubled while keeping force constant, what happens to the pressure?",
      options: [
        "It is halved.",
        "It doubles.",
        "It remains the same.",
        "It is quadrupled."
      ],
      correct: 0
    },
    {
      question: "Which of the following is equivalent to 1 Pascal (Pa)?",
      options: [
        "1 N/m²",
        "1 N",
        "1 kg/m²",
        "1 J/s"
      ],
      correct: 0
    },
    {
      question: "Why do heavy vehicles like military tanks have continuous metal tracks instead of wheels?",
      options: [
        "To increase the contact area and decrease pressure on soft ground.",
        "To reduce friction with the ground.",
        "To increase the weight of the vehicle.",
        "To speed up the vehicle."
      ],
      correct: 0
    },
    {
      question: "A sharp knife cuts food more easily than a blunt knife because:",
      options: [
        "The sharp edge has a smaller area, producing larger pressure for the same force.",
        "The sharp knife weighs more.",
        "A sharp edge reduces the force required to hold the knife.",
        "Blunt knives create high pressure."
      ],
      correct: 0
    },
    {
      question: "If you stand on one foot instead of two, the pressure you exert on the ground:",
      options: [
        "Doubles because contact area is halved.",
        "Halves because contact area is halved.",
        "Remains unchanged.",
        "Decreases by four times."
      ],
      correct: 0
    }
  ];

  // Pick all MCQ questions and add them to shuffle list
  mcqPool.forEach(item => {
    quizQuestions.push({
      type: 'D',
      question: item.question,
      options: item.options,
      correctIndex: item.correct,
      working: `Explanation: Pressure = Force / Area. If contact area is smaller, pressure is greater. If area is larger, pressure is lower.`
    });
  });

  // Shuffle entire deck of 30 questions
  quizQuestions.sort(() => Math.random() - 0.5);
  currentQuizIndex = 0;
  score = 0;
  
  loadQuizQuestion();
}

function loadQuizQuestion() {
  // Clear status
  feedbackBox.classList.add('hidden');
  btnNext.classList.add('hidden');
  btnCheck.classList.remove('hidden');
  numericInput.value = '';
  selectedMcqOption = null;

  // Counter & Progress
  questionCounter.textContent = `Question ${currentQuizIndex + 1} of 30`;
  quizProgressBar.style.width = `${(currentQuizIndex / 30) * 100}%`;

  const q = quizQuestions[currentQuizIndex];
  qText.innerHTML = q.question;

  if (q.type === 'D') {
    // Hide numeric inputs, show MCQ
    numericContainer.classList.add('hidden');
    mcqContainer.classList.remove('hidden');
    
    // Clear and build MCQ options
    mcqContainer.innerHTML = '';
    // Store original index inside the option buttons
    const indexedOptions = q.options.map((opt, index) => ({ text: opt, index }));
    // Shuffle options to make it fun
    const shuffledOptions = [...indexedOptions].sort(() => Math.random() - 0.5);
    
    shuffledOptions.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'mcq-btn';
      btn.innerHTML = opt.text;
      btn.onclick = () => {
        document.querySelectorAll('.mcq-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedMcqOption = opt.index;
      };
      mcqContainer.appendChild(btn);
    });
  } else {
    // Show numeric, hide MCQ
    numericContainer.classList.remove('hidden');
    mcqContainer.classList.add('hidden');
    unitIndicator.textContent = q.unit;
    
    if (q.type === 'A') {
      numericHelp.textContent = 'Include the unit (e.g. Pa or N/m2). Round to 1 d.p.';
    } else if (q.type === 'B') {
      numericHelp.textContent = 'Include the unit (e.g. N). Round to 1 d.p.';
    } else if (q.type === 'C') {
      numericHelp.textContent = 'Include the unit (e.g. m2). Round to 4 d.p.';
    }
  }
}

// Handle answer checking
btnCheck.onclick = () => {
  const q = quizQuestions[currentQuizIndex];
  let isCorrect = false;
  let answerStr = '';

  if (q.type === 'D') {
    if (selectedMcqOption === null) {
      alert("Please select an option first!");
      return;
    }
    isCorrect = (selectedMcqOption === q.correctIndex);
    answerStr = q.options[q.correctIndex];
  } else {
    const inputStr = numericInput.value.trim();
    if (!inputStr) {
      alert("Please enter your answer!");
      return;
    }

    // Match number followed by optional space and unit string
    const regex = /^([\+\-]?\d+(?:\.\d+)?)\s*(.*)$/;
    const match = inputStr.match(regex);
    if (!match) {
      alert("Please enter a number followed by the unit (e.g. 15.4 Pa)");
      return;
    }

    const userVal = parseFloat(match[1]);
    const userUnit = match[2].trim().toLowerCase();

    if (isNaN(userVal) || !userUnit) {
      alert("Please enter both the numeric value and the unit (e.g. 15.4 Pa)");
      return;
    }

    // Check value - accept any precision between 0 d.p. and 4 d.p.
    const validAnswers = [
      parseFloat(q.exactAnswer.toFixed(0)),
      parseFloat(q.exactAnswer.toFixed(1)),
      parseFloat(q.exactAnswer.toFixed(2)),
      parseFloat(q.exactAnswer.toFixed(3)),
      parseFloat(q.exactAnswer.toFixed(4))
    ];
    const valCorrect = validAnswers.includes(userVal);

    // Check unit
    let unitCorrect = false;
    if (q.type === 'A') {
      unitCorrect = (userUnit === 'pa' || userUnit === 'n/m2' || userUnit === 'n/m^2');
    } else if (q.type === 'B') {
      unitCorrect = (userUnit === 'n');
    } else if (q.type === 'C') {
      unitCorrect = (userUnit === 'm2' || userUnit === 'm^2');
    }

    isCorrect = (valCorrect && unitCorrect);
    answerStr = `${q.correctAnswer} ${q.type === 'A' ? 'Pa' : q.type === 'C' ? 'm2' : 'N'}`;
  }

  // Display feedback
  feedbackBox.className = 'quiz-feedback-box'; // reset class
  if (isCorrect) {
    score++;
    feedbackBox.classList.add('celebrate');
    feedbackIcon.textContent = '✓';
    feedbackTitle.textContent = 'Nice work!';
    feedbackMsg.textContent = 'Your answer is correct!';
  } else {
    feedbackBox.classList.add('wrong');
    feedbackBox.classList.add('shake');
    feedbackIcon.textContent = '✗';
    feedbackTitle.textContent = 'Not quite!';
    feedbackMsg.textContent = `Correct Answer: ${answerStr}\n\n${q.working}`;
  }

  feedbackBox.classList.remove('hidden');
  btnCheck.classList.add('hidden');
  btnNext.classList.remove('hidden');
};

btnNext.onclick = () => {
  feedbackBox.classList.remove('shake');
  currentQuizIndex++;
  if (currentQuizIndex < 30) {
    loadQuizQuestion();
  } else {
    showQuizResults();
  }
};

// Start quiz immediately
generateQuiz();


// --- SECTION 4: SCORE & FEEDBACK ---
function showQuizResults() {
  switchSection('score');
  
  // Set Score Number
  document.getElementById('score-text').textContent = score;

  // Star Rating & Tiers
  const starsContainer = document.getElementById('score-stars');
  const tierTitle = document.getElementById('score-tier-title');
  const tierDesc = document.getElementById('score-tier-desc');

  let stars = 1;
  let feedbackText = "";
  let title = "";

  if (score >= 24) {
    stars = 3;
    title = "Excellent!";
    feedbackText = "Excellent! You've mastered Pressure Foundations.";
  } else if (score >= 15) {
    stars = 2;
    title = "Good effort!";
    feedbackText = "Good effort! Review the questions you got wrong.";
  } else {
    stars = 1;
    title = "Keep practising";
    feedbackText = "Keep practising — revisit the formula and try again.";
  }

  // Render Stars
  starsContainer.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const starSpan = document.createElement('span');
    starSpan.className = 'star';
    starSpan.textContent = i < stars ? '★' : '☆';
    starsContainer.appendChild(starSpan);
  }

  tierTitle.textContent = title;
  tierDesc.textContent = feedbackText;
}

function restartQuiz() {
  generateQuiz();
  switchSection('quiz');
}


// --- SECTION 5: FLASHCARD REVISION ---
const flashcardsDeck = [
  { front: "What is pressure?", back: "Force acting per unit area." },
  { front: "Formula for pressure", back: "P = F ÷ A" },
  { front: "Unit of pressure", back: "Pascal (Pa), which equals 1 N/m²" },
  { front: "How to increase pressure without changing force", back: "Decrease the contact area." },
  { front: "How to decrease pressure without changing force", back: "Increase the contact area." },
  { front: "Why do sharp knives cut easily?", back: "Small blade area = very high pressure for same cutting force." },
  { front: "Why do tractors have wide tyres?", back: "Large area = lower pressure = less sinking into soft ground." },
  { front: "What happens to pressure if force is doubled and area is halved?", back: "Pressure quadruples." },
  { front: "What is 1 Pascal equivalent to?", back: "1 Newton per square metre (1 N/m²)" },
  { front: "If P = 500 Pa and A = 0.2 m², what is F?", back: "F = P × A = 500 × 0.2 = 100 N" }
];

let activeFlashcards = [];
let currentFlashcardIndex = 0;

function initFlashcards() {
  activeFlashcards = [...flashcardsDeck];
  currentFlashcardIndex = 0;
  loadFlashcard();
}

function loadFlashcard() {
  const cardElement = document.getElementById('flashcard');
  cardElement.classList.remove('flipped');

  const countBadge = document.getElementById('flashcard-remaining-count');
  countBadge.textContent = activeFlashcards.length;

  if (activeFlashcards.length === 0) {
    document.getElementById('flashcard-front-text').textContent = "Revision Complete!";
    document.getElementById('flashcard-back-text').textContent = "Tap below or restart to revise again.";
    document.querySelector('.flashcard-actions').classList.add('hidden');
    return;
  }

  document.querySelector('.flashcard-actions').classList.remove('hidden');
  const cardData = activeFlashcards[currentFlashcardIndex];
  document.getElementById('flashcard-front-text').textContent = cardData.front;
  document.getElementById('flashcard-back-text').textContent = cardData.back;
}

function flipFlashcard() {
  const cardElement = document.getElementById('flashcard');
  cardElement.classList.toggle('flipped');
}

function handleFlashcardAction(action) {
  const cardElement = document.getElementById('flashcard');
  
  if (action === 'got-it') {
    // Remove from active list
    activeFlashcards.splice(currentFlashcardIndex, 1);
  } else {
    // Keep in deck, move to next card index
    currentFlashcardIndex = (currentFlashcardIndex + 1) % activeFlashcards.length;
  }

  // Visual card swipe transition
  cardElement.style.transform = "translateX(200px) rotate(20deg) scale(0.8)";
  cardElement.style.opacity = "0";

  setTimeout(() => {
    // Reset index if we went out of bounds
    if (activeFlashcards.length > 0) {
      currentFlashcardIndex = currentFlashcardIndex % activeFlashcards.length;
    }
    loadFlashcard();
    cardElement.style.transform = "";
    cardElement.style.opacity = "";
  }, 300);
}
