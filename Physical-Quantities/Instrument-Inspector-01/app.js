// Instrument Data
const instruments = [
  {
    id: "ruler",
    name: "Ruler",
    precision: "0.1 cm",
    dpText: "1 decimal place (in cm)",
    unit: "cm",
    glyph: "ruler",
    typicalScenarios: [
      "the length of a textbook",
      "the width of a desk",
      "the height of a glass beaker"
    ],
    generateCorrect: () => {
      const val = (Math.random() * 20 + 5).toFixed(1);
      return `${val} cm`;
    },
    generateIncorrect: (correctStr) => {
      const correctVal = parseFloat(correctStr);
      return [
        `${correctVal.toFixed(0)} cm`,
        `${correctVal.toFixed(2)} cm`,
        `${correctVal.toFixed(3)} cm`
      ];
    },
    explanation: "A standard ruler has a precision of 0.1 cm (1 decimal place in cm)."
  },
  {
    id: "caliper",
    name: "Digital caliper",
    precision: "0.001 cm",
    dpText: "3 decimal places (in cm)",
    unit: "cm",
    glyph: "scale",
    typicalScenarios: [
      "the diameter of a small test tube",
      "the internal diameter of a metal nut",
      "the depth of a plastic bottle cap"
    ],
    generateCorrect: () => {
      const val = (Math.random() * 4 + 1).toFixed(3);
      return `${val} cm`;
    },
    generateIncorrect: (correctStr) => {
      const correctVal = parseFloat(correctStr);
      return [
        `${correctVal.toFixed(1)} cm`,
        `${correctVal.toFixed(2)} cm`,
        `${correctVal.toFixed(4)} cm`
      ];
    },
    explanation: "A digital caliper reads to a precision of 0.001 cm (3 decimal places in cm)."
  },
  {
    id: "micrometer",
    name: "Digital micrometer screw gauge",
    precision: "0.0005 cm (0.005 mm)",
    dpText: "4 decimal places in cm, ending in 0 or 5",
    unit: "cm",
    glyph: "binary",
    typicalScenarios: [
      "the thickness of a copper wire",
      "the diameter of a steel ball bearing",
      "the thickness of a sheet of glass"
    ],
    generateCorrect: () => {
      // Must be a multiple of 0.0005 cm
      const ticks = Math.floor(Math.random() * 800) + 100; // e.g. 100 to 900 ticks
      const val = (ticks * 0.0005).toFixed(4);
      return `${val} cm`;
    },
    generateIncorrect: (correctStr) => {
      const correctVal = parseFloat(correctStr);
      return [
        `${correctVal.toFixed(2)} cm`,
        `${correctVal.toFixed(3)} cm`,
        `${(correctVal + 0.0001).toFixed(5)} cm`
      ];
    },
    explanation: "A digital micrometer reads to 0.0005 cm (4 decimal places ending in 0 or 5)."
  },
  {
    id: "cylinder",
    name: "Measuring cylinder",
    precision: "0.5 cm³",
    dpText: "0.5 cm³ (ends in .0 or .5)",
    unit: "cm³",
    glyph: "droplet",
    typicalScenarios: [
      "the volume of a sample of water",
      "the volume of a small stone (using water displacement)",
      "the volume of glycerin solution"
    ],
    generateCorrect: () => {
      const whole = Math.floor(Math.random() * 80) + 10;
      const dec = Math.random() > 0.5 ? 0.5 : 0.0;
      return `${(whole + dec).toFixed(1)} cm³`;
    },
    generateIncorrect: (correctStr) => {
      const correctVal = parseFloat(correctStr);
      return [
        `${Math.floor(correctVal)} cm³`,
        `${(correctVal + 0.23).toFixed(2)} cm³`,
        `${(correctVal + 0.005).toFixed(3)} cm³`
      ];
    },
    explanation: "A standard measuring cylinder reads to the nearest 0.5 cm³."
  },
  {
    id: "thermometer",
    name: "Thermometer",
    precision: "0.5°C",
    dpText: "0.5°C (ends in .0 or .5)",
    unit: "°C",
    glyph: "thermometer",
    typicalScenarios: [
      "the temperature of a beaker of hot water",
      "the boiling point of an ethanol solution",
      "the room temperature during an experiment"
    ],
    generateCorrect: () => {
      const whole = Math.floor(Math.random() * 60) + 20;
      const dec = Math.random() > 0.5 ? 0.5 : 0.0;
      return `${(whole + dec).toFixed(1)}°C`;
    },
    generateIncorrect: (correctStr) => {
      const correctVal = parseFloat(correctStr);
      return [
        `${Math.floor(correctVal)}°C`,
        `${(correctVal + 0.12).toFixed(2)}°C`,
        `${(correctVal + 0.005).toFixed(3)}°C`
      ];
    },
    explanation: "A liquid-in-glass thermometer reads to the nearest 0.5°C."
  },
  {
    id: "stopwatch",
    name: "Stopwatch",
    precision: "0.1 s",
    dpText: "1 decimal place (in s)",
    unit: "s",
    glyph: "timer",
    typicalScenarios: [
      "the time taken for 20 oscillations of a pendulum",
      "the time taken for a toy car to roll down a ramp",
      "the interval between water drops dripping from a tap"
    ],
    generateCorrect: () => {
      const val = (Math.random() * 30 + 10).toFixed(1);
      return `${val} s`;
    },
    generateIncorrect: (correctStr) => {
      const correctVal = parseFloat(correctStr);
      return [
        `${correctVal.toFixed(0)} s`,
        `${correctVal.toFixed(2)} s`,
        `${correctVal.toFixed(3)} s`
      ];
    },
    explanation: "O-level stopwatches are recorded to 0.1 s (accounting for human reaction time)."
  },
  {
    id: "beam_balance",
    name: "Beam balance",
    precision: "0.1 g",
    dpText: "1 decimal place (in g)",
    unit: "g",
    glyph: "scale-3d",
    typicalScenarios: [
      "the mass of a copper block",
      "the mass of a beaker containing salt solution",
      "the mass of an iron cylinder"
    ],
    generateCorrect: () => {
      const val = (Math.random() * 150 + 20).toFixed(1);
      return `${val} g`;
    },
    generateIncorrect: (correctStr) => {
      const correctVal = parseFloat(correctStr);
      return [
        `${correctVal.toFixed(0)} g`,
        `${correctVal.toFixed(2)} g`,
        `${correctVal.toFixed(3)} g`
      ];
    },
    explanation: "A triple beam balance reads to a precision of 0.1 g (1 decimal place)."
  },
  {
    id: "electronic_balance",
    name: "Electronic balance",
    precision: "0.01 g",
    dpText: "2 decimal places (in g)",
    unit: "g",
    glyph: "tablet",
    typicalScenarios: [
      "the mass of a small marble",
      "the mass of salt crystals used in a chemistry setup",
      "the mass of a watch glass"
    ],
    generateCorrect: () => {
      const val = (Math.random() * 50 + 5).toFixed(2);
      return `${val} g`;
    },
    generateIncorrect: (correctStr) => {
      const correctVal = parseFloat(correctStr);
      return [
        `${correctVal.toFixed(1)} g`,
        `${correctVal.toFixed(3)} g`,
        `${correctVal.toFixed(4)} g`
      ];
    },
    explanation: "A standard lab electronic balance reads to 0.01 g (2 decimal places)."
  },
  {
    id: "ammeter",
    name: "Ammeter",
    precision: "0.01 A",
    dpText: "2 decimal places (in A)",
    unit: "A",
    glyph: "zap",
    typicalScenarios: [
      "the current flowing through a series circuit resister",
      "the electric current output of a d.c. power supply",
      "the current passing through a filament lamp"
    ],
    generateCorrect: () => {
      const val = (Math.random() * 2 + 0.1).toFixed(2);
      return `${val} A`;
    },
    generateIncorrect: (correctStr) => {
      const correctVal = parseFloat(correctStr);
      return [
        `${correctVal.toFixed(1)} A`,
        `${correctVal.toFixed(3)} A`,
        `${correctVal.toFixed(4)} A`
      ];
    },
    explanation: "A standard laboratory ammeter has a precision of 0.01 A (2 decimal places)."
  },
  {
    id: "voltmeter",
    name: "Voltmeter",
    precision: "0.05 V",
    dpText: "2 decimal places (ends in .00 or .05)",
    unit: "V",
    glyph: "activity",
    typicalScenarios: [
      "the potential difference across a light bulb",
      "the electromotive force (e.m.f.) of a dry cell",
      "the voltage drop across a rheostat component"
    ],
    generateCorrect: () => {
      // Must be multiple of 0.05 V
      const ticks = Math.floor(Math.random() * 100) + 10;
      const val = (ticks * 0.05).toFixed(2);
      return `${val} V`;
    },
    generateIncorrect: (correctStr) => {
      const correctVal = parseFloat(correctStr);
      return [
        `${correctVal.toFixed(1)} V`,
        `${(correctVal + 0.01).toFixed(2)} V`,
        `${(correctVal + 0.005).toFixed(3)} V`
      ];
    },
    explanation: "A standard laboratory voltmeter reads to a precision of 0.05 V (ends in .00 or .05)."
  },
  {
    id: "protractor",
    name: "Protractor",
    precision: "1°",
    dpText: "nearest whole degree (0 decimal places)",
    unit: "°",
    glyph: "pie-chart",
    typicalScenarios: [
      "the angle of incidence of a light ray in glass",
      "the angle of refraction at a boundary",
      "the angle of deviation in a triangular prism"
    ],
    generateCorrect: () => {
      const val = Math.floor(Math.random() * 80) + 10;
      return `${val}°`;
    },
    generateIncorrect: (correctStr) => {
      const correctVal = parseInt(correctStr);
      return [
        `${correctVal.toFixed(1)}°`,
        `${correctVal.toFixed(2)}°`,
        `${correctVal.toFixed(3)}°`
      ];
    },
    explanation: "A standard protractor reads to the nearest whole degree (1°)."
  },
  {
    id: "spring_balance",
    name: "Spring balance",
    precision: "0.05 N",
    dpText: "2 decimal places (ends in .00 or .05)",
    unit: "N",
    glyph: "archive-restore",
    typicalScenarios: [
      "the weight of a metal block in air",
      "the pulling force required to move a wooden block",
      "the tension in a suspended string"
    ],
    generateCorrect: () => {
      // Must be multiple of 0.05 N
      const ticks = Math.floor(Math.random() * 80) + 10;
      const val = (ticks * 0.05).toFixed(2);
      return `${val} N`;
    },
    generateIncorrect: (correctStr) => {
      const correctVal = parseFloat(correctStr);
      return [
        `${correctVal.toFixed(1)} N`,
        `${(correctVal + 0.02).toFixed(2)} N`,
        `${(correctVal + 0.005).toFixed(3)} N`
      ];
    },
    explanation: "A spring balance reads to the nearest 0.05 N."
  }
];

// App State
let currentMode = null; // 'flashcards' or 'quiz'
let flashcardDeck = [...instruments];
let currentCardIndex = 0;
let quizQuestions = [];
let currentQuestionIndex = 0;
let quizScore = 0;
let hasAnsweredCurrentQuestion = false;

// DOM Elements
const screenStart = document.getElementById("screen-start");
const screenFlashcards = document.getElementById("screen-flashcards");
const screenQuiz = document.getElementById("screen-quiz");
const screenResult = document.getElementById("screen-result");

const btnModeFlashcards = document.getElementById("btn-mode-flashcards");
const btnModeQuiz = document.getElementById("btn-mode-quiz");
const btnShuffleDeck = document.getElementById("btn-shuffle-deck");
const btnPrevCard = document.getElementById("btn-prev-card");
const btnNextCard = document.getElementById("btn-next-card");
const btnNextQuestion = document.getElementById("btn-next-question");
const btnRetryQuiz = document.getElementById("btn-retry-quiz");
const btnResultHome = document.getElementById("btn-result-home");
const btnBackToStartList = document.querySelectorAll(".btn-back-to-start");

const flashcard = document.getElementById("flashcard");
const fcIndicator = document.getElementById("fc-indicator");
const fcIndicatorBack = document.getElementById("fc-indicator-back");
const fcGlyph = document.getElementById("fc-glyph");
const fcName = document.getElementById("fc-name");
const fcPrecision = document.getElementById("fc-precision");
const fcDp = document.getElementById("fc-dp");
const fcUse = document.getElementById("fc-use");

const quizScoreVal = document.getElementById("quiz-score-val");
const quizProgressFill = document.getElementById("quiz-progress-fill");
const quizQNum = document.getElementById("quiz-q-num");
const quizQuestionText = document.getElementById("quiz-question-text");
const quizOptions = document.getElementById("quiz-options");
const quizFeedback = document.getElementById("quiz-feedback");
const feedbackTitle = document.getElementById("feedback-title");
const feedbackVal = document.getElementById("feedback-val");
const feedbackExplanationText = document.getElementById("feedback-explanation-text");

const resultGradeBadge = document.getElementById("result-grade-badge");
const resultScore = document.getElementById("result-score");
const resultMessage = document.getElementById("result-message");

// Celebration Particle System
const canvas = document.getElementById("celebration-canvas");
const ctx = canvas.getContext("2d");
let particles = [];
let animationFrameId = null;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 6 + 4;
    this.speedX = Math.random() * 8 - 4;
    this.speedY = Math.random() * -12 - 4;
    this.gravity = 0.4;
    // Neon colors
    const colors = ["#00f2fe", "#ff007f", "#39ff14", "#fefe33"];
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.alpha = 1;
    this.decay = Math.random() * 0.015 + 0.01;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.speedY += this.gravity;
    this.alpha -= this.decay;
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function startCelebration() {
  // Fire particles from multiple bottom points
  const spawnPoints = [
    { x: window.innerWidth * 0.2, y: window.innerHeight },
    { x: window.innerWidth * 0.5, y: window.innerHeight },
    { x: window.innerWidth * 0.8, y: window.innerHeight }
  ];
  spawnPoints.forEach(pt => {
    for (let i = 0; i < 40; i++) {
      particles.push(new Particle(pt.x, pt.y));
    }
  });

  if (!animationFrameId) {
    animateParticles();
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles = particles.filter(p => p.alpha > 0);
  particles.forEach(p => {
    p.update();
    p.draw();
  });

  if (particles.length > 0) {
    animationFrameId = requestAnimationFrame(animateParticles);
  } else {
    animationFrameId = null;
  }
}

// Navigation & Screen Switcher
function showScreen(screenEl) {
  // Hide all screens
  [screenStart, screenFlashcards, screenQuiz, screenResult].forEach(s => {
    s.classList.remove("active");
  });
  // Show target
  screenEl.classList.add("active");
}

btnBackToStartList.forEach(btn => {
  btn.addEventListener("click", () => {
    showScreen(screenStart);
  });
});

// Mode 1: Flashcard Deck Functions
function initFlashcardMode() {
  flashcardDeck = [...instruments];
  currentCardIndex = 0;
  flashcard.classList.remove("flipped");
  updateFlashcardUI();
  showScreen(screenFlashcards);
}

function updateFlashcardUI() {
  const current = flashcardDeck[currentCardIndex];
  fcIndicator.textContent = `${currentCardIndex + 1} / ${flashcardDeck.length}`;
  fcIndicatorBack.textContent = `${currentCardIndex + 1} / ${flashcardDeck.length}`;
  
  // Set content
  fcName.textContent = current.name;
  fcPrecision.textContent = current.precision;
  fcDp.textContent = current.dpText;
  
  // Sample use
  fcUse.textContent = current.typicalScenarios[0] ? `e.g. measuring ${current.typicalScenarios[0]}` : "";

  // Set lucide icon based on name
  let iconName = "help-circle";
  if (current.id === "ruler") iconName = "ruler";
  else if (current.id === "caliper") iconName = "drafting-compass";
  else if (current.id === "micrometer") iconName = "binary";
  else if (current.id === "cylinder") iconName = "droplets";
  else if (current.id === "thermometer") iconName = "thermometer";
  else if (current.id === "stopwatch") iconName = "timer";
  else if (current.id === "beam_balance" || current.id === "electronic_balance") iconName = "scale";
  else if (current.id === "ammeter" || current.id === "voltmeter") iconName = "zap";
  else if (current.id === "protractor") iconName = "pie-chart";
  else if (current.id === "spring_balance") iconName = "anchor";

  fcGlyph.setAttribute("data-lucide", iconName);
  lucide.createIcons();
}

// Card flips on click/tap
flashcard.addEventListener("click", () => {
  flashcard.classList.toggle("flipped");
});

btnNextCard.addEventListener("click", (e) => {
  e.stopPropagation(); // Avoid flipping the card when clicking navigation
  flashcard.classList.remove("flipped");
  setTimeout(() => {
    currentCardIndex = (currentCardIndex + 1) % flashcardDeck.length;
    updateFlashcardUI();
  }, 150);
});

btnPrevCard.addEventListener("click", (e) => {
  e.stopPropagation();
  flashcard.classList.remove("flipped");
  setTimeout(() => {
    currentCardIndex = (currentCardIndex - 1 + flashcardDeck.length) % flashcardDeck.length;
    updateFlashcardUI();
  }, 150);
});

btnShuffleDeck.addEventListener("click", (e) => {
  e.stopPropagation();
  // Shuffle implementation
  for (let i = flashcardDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [flashcardDeck[i], flashcardDeck[j]] = [flashcardDeck[j], flashcardDeck[i]];
  }
  currentCardIndex = 0;
  flashcard.classList.remove("flipped");
  // Visual flash effect on card
  flashcard.classList.add("pop-animation");
  setTimeout(() => flashcard.classList.remove("pop-animation"), 400);
  
  setTimeout(() => {
    updateFlashcardUI();
  }, 150);
});


// Mode 2: Quiz Functions
function initQuizMode() {
  quizScore = 0;
  currentQuestionIndex = 0;
  quizScoreVal.textContent = "0";
  quizQuestions = [];

  // Generate 30 questions. We will loop/cycle through the 12 instruments to ensure rich coverage.
  for (let i = 0; i < 30; i++) {
    const inst = instruments[i % instruments.length];
    const scenario = inst.typicalScenarios[Math.floor(Math.random() * inst.typicalScenarios.length)];
    
    // Generate correct and incorrect answers
    const correctAns = inst.generateCorrect();
    const incorrects = inst.generateIncorrect(correctAns);
    
    // Combine and shuffle options
    const options = [
      { text: correctAns, isCorrect: true },
      ...incorrects.map(text => ({ text, isCorrect: false }))
    ];

    // Shuffle options
    for (let o = options.length - 1; o > 0; o--) {
      const r = Math.floor(Math.random() * (o + 1));
      [options[o], options[r]] = [options[r], options[o]];
    }

    quizQuestions.push({
      instrument: inst,
      scenario: scenario,
      options: options,
      correctText: correctAns
    });
  }

  showScreen(screenQuiz);
  loadQuestion();
}

function loadQuestion() {
  hasAnsweredCurrentQuestion = false;
  quizFeedback.classList.add("hidden");
  
  const current = quizQuestions[currentQuestionIndex];
  
  // Progress Bar
  const progressPercent = (currentQuestionIndex / 30) * 100;
  quizProgressFill.style.width = `${progressPercent}%`;

  // Headers
  quizQNum.textContent = `Question ${currentQuestionIndex + 1} of 30`;
  
  // Question text e.g., "You are using a digital caliper to measure the length of a copper wire..."
  quizQuestionText.textContent = `You are using a ${current.instrument.name.toLowerCase()} to measure ${current.scenario}. Which reading was taken by the ${current.instrument.name.toLowerCase()}?`;

  // Render options
  quizOptions.innerHTML = "";
  current.options.forEach((opt, idx) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.innerHTML = `
      <span>${opt.text}</span>
      <span class="option-marker">${String.fromCharCode(65 + idx)}</span>
    `;
    btn.addEventListener("click", () => handleAnswerSelect(btn, opt, current));
    quizOptions.appendChild(btn);
  });
}

function handleAnswerSelect(selectedBtn, option, questionData) {
  if (hasAnsweredCurrentQuestion) return;
  hasAnsweredCurrentQuestion = true;

  // Disable all option buttons
  const allButtons = quizOptions.querySelectorAll(".option-btn");
  allButtons.forEach(btn => btn.disabled = true);

  if (option.isCorrect) {
    selectedBtn.classList.add("correct");
    quizScore++;
    quizScoreVal.textContent = quizScore;
    feedbackTitle.textContent = "Correct!";
    feedbackTitle.className = "feedback-status correct";
    
    // Celebratory effect
    selectedBtn.classList.add("pop-animation");
    startCelebration();
  } else {
    selectedBtn.classList.add("wrong");
    feedbackTitle.textContent = "Incorrect";
    feedbackTitle.className = "feedback-status wrong";
    
    // Highlight the correct answer
    allButtons.forEach(btn => {
      const textVal = btn.querySelector("span").textContent;
      if (textVal === questionData.correctText) {
        btn.classList.add("correct");
      }
    });

    // Shake animation for the wrong selected button
    selectedBtn.classList.add("shake-animation");
  }

  // Populate feedback card
  feedbackVal.textContent = questionData.correctText;
  feedbackExplanationText.textContent = questionData.instrument.explanation;
  quizFeedback.classList.remove("hidden");
}

btnNextQuestion.addEventListener("click", () => {
  currentQuestionIndex++;
  if (currentQuestionIndex < 30) {
    loadQuestion();
  } else {
    showResults();
  }
});

// Results screen
function showResults() {
  quizProgressFill.style.width = "100%";
  
  resultScore.textContent = quizScore;

  // Grade & feedback messages
  let grade = "C6 PASS";
  let message = "Keep reviewing physical quantities and instruments to improve your decimal precision!";
  let badgeClass = "badge highlight-yellow";

  if (quizScore >= 28) {
    grade = "A1 EXCELLENT";
    message = "Outstanding precision! You fully master Singapore O-level instrument readings.";
  } else if (quizScore >= 24) {
    grade = "A2 SPLENDID";
    message = "Great job! A bit more focus on caliper and micrometer screw gauge rules will secure a perfect score.";
  } else if (quizScore >= 20) {
    grade = "B3 GOOD";
    message = "Solid performance. Remember the specific decimal requirements for balances and timers.";
  } else if (quizScore >= 15) {
    grade = "C5 SATISFACTORY";
    message = "Decent. Check the flashcard revision mode again to secure these exam marks.";
  }

  resultGradeBadge.textContent = grade;
  resultGradeBadge.className = `badge ${badgeClass}`;
  resultMessage.textContent = message;

  showScreen(screenResult);
}

// Global Event Listeners for Modes
btnModeFlashcards.addEventListener("click", initFlashcardMode);
btnModeQuiz.addEventListener("click", initQuizMode);
btnRetryQuiz.addEventListener("click", initQuizMode);
btnResultHome.addEventListener("click", () => showScreen(screenStart));
