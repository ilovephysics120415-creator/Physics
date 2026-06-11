// ==========================================================================
// GAME CONFIGURATION AND CONSTANTS
// ==========================================================================

const PLANETS = [
  { name: 'Earth', g: 10, class: 'planet-earth', dotClass: 'earth-dot' },
  { name: 'Moon', g: 1.6, class: 'planet-moon', dotClass: 'moon-dot' },
  { name: 'Mars', g: 3.7, class: 'planet-mars', dotClass: 'mars-dot' },
  { name: 'Jupiter', g: 25, class: 'planet-jupiter', dotClass: 'jupiter-dot' },
  { name: 'Venus', g: 8.9, class: 'planet-venus', dotClass: 'venus-dot' }
];

const MCQ_BANK = [
  {
    question: "An astronaut has a mass of <strong>70 kg</strong> on Earth. What is his mass on the Moon?",
    options: ["11.2 kg", "70 kg", "700 kg", "112 kg"],
    answer: "70 kg",
    explanation: "Mass is the amount of matter in an object and does NOT change. Only weight changes depending on gravitational field strength (g)."
  },
  {
    question: "What is the weight of a <strong>50 kg</strong> object on Earth? (g = 10 N/kg)",
    options: ["50 N", "500 N", "5 N", "50 kg"],
    answer: "500 N",
    explanation: "W = m × g = 50 kg × 10 N/kg = 500 N. Note: Weight is measured in Newtons (N), not kilograms (kg)."
  },
  {
    question: "On the Moon, a 60 kg astronaut weighs less than on Earth. Why?",
    options: [
      "His mass decreased",
      "Gravity is weaker on the Moon",
      "He lost body fat",
      "The Moon has no atmosphere"
    ],
    answer: "Gravity is weaker on the Moon",
    explanation: "The gravitational field strength on the Moon is only 1.6 N/kg compared to Earth's 10 N/kg, so the downward pulling force is smaller."
  },
  {
    question: "Which instrument is used to measure <strong>mass</strong>?",
    options: ["Spring balance", "Weighing scale", "Beam balance", "Newton meter"],
    answer: "Beam balance",
    explanation: "A beam balance measures mass by comparing it against reference weights. A spring balance measures force/weight."
  },
  {
    question: "A rock weighs <strong>370 N</strong> on Mars (g = 3.7 N/kg). What is its mass?",
    options: ["1369 kg", "100 kg", "370 kg", "37 kg"],
    answer: "100 kg",
    explanation: "m = W / g = 370 N / 3.7 N/kg = 100 kg. Mass stays constant regardless of the environment."
  },
  {
    question: "Weight is measured in ___ and mass is measured in ___.",
    options: ["kg and N", "N and kg", "N and N", "kg and kg"],
    answer: "N and kg",
    explanation: "Weight is a force, measured in Newtons (N). Mass is the amount of matter, measured in kilograms (kg)."
  }
];

// ==========================================================================
// GAME STATE STATE ENGINE
// ==========================================================================

let gameState = {
  currentRound: 1, // 1: Find Weight, 2: Find Mass, 3: MCQ Trap
  questionIndex: 0, // 0 to 2 for R1 & R2; 0 to 3 for R3
  score: 0,
  scoreBreakdown: {
    round1: 0,
    round2: 0,
    round3: 0
  },
  currentQuestion: null, // Stores active question parameters
  mcqList: [] // Randomised list of 4 MCQ questions for Round 3
};

// ==========================================================================
// DOM ELEMENT SELECTORS
// ==========================================================================

const welcomeScreen = document.getElementById('welcomeScreen');
const questionScreen = document.getElementById('questionScreen');
const resultsScreen = document.getElementById('resultsScreen');
const gameBoard = document.getElementById('gameBoard');

// HUD
const currentRoundVal = document.getElementById('currentRoundVal');
const progressVal = document.getElementById('progressVal');
const scoreVal = document.getElementById('scoreVal');
const progressBarFill = document.getElementById('progressBarFill');

// Question Elements
const roundIntroText = document.getElementById('roundIntroText');
const dynamicPlanet = document.getElementById('dynamicPlanet');
const astronautElement = document.getElementById('astronautElement');
const envPlanetName = document.getElementById('envPlanetName');
const envGVal = document.getElementById('envGVal');
const questionText = document.getElementById('questionText');

// Calculation Form Elements
const mathInputSection = document.getElementById('mathInputSection');
const formulaHelper = document.getElementById('formulaHelper');
const formulaHelperTarget = document.getElementById('formulaHelperTarget');
const studentAnswer = document.getElementById('studentAnswer');
const studentUnit = document.getElementById('studentUnit');
const submitBtn = document.getElementById('submitBtn');

// MCQ Options Elements
const mcqSection = document.getElementById('mcqSection');
const mcqOptions = document.querySelectorAll('.mcq-option');

// Feedback Elements
const feedbackPanel = document.getElementById('feedbackPanel');
const feedbackIcon = document.getElementById('feedbackIcon');
const feedbackTitle = document.getElementById('feedbackTitle');
const workingDisplay = document.getElementById('workingDisplay');
const explanationText = document.getElementById('explanationText');
const nextBtn = document.getElementById('nextBtn');

// Control Buttons
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

// Results Display
const finalScoreVal = document.getElementById('finalScoreVal');
const gradeBadge = document.getElementById('gradeBadge');
const gradeFeedback = document.getElementById('gradeFeedback');
const r1Breakdown = document.getElementById('r1Breakdown');
const r2Breakdown = document.getElementById('r2Breakdown');
const r3Breakdown = document.getElementById('r3Breakdown');

// ==========================================================================
// EVENT LISTENERS INITIALIZATION
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  startBtn.addEventListener('click', startGame);
  restartBtn.addEventListener('click', restartGame);
  submitBtn.addEventListener('click', checkMathAnswer);
  nextBtn.addEventListener('click', handleNext);
  
  // Submit on entering input fields
  const handleKeydown = (e) => {
    if (e.key === 'Enter') {
      checkMathAnswer();
    }
  };
  studentAnswer.addEventListener('keydown', handleKeydown);
  studentUnit.addEventListener('keydown', handleKeydown);

  // MCQ button clicks
  mcqOptions.forEach(btn => {
    btn.addEventListener('click', (e) => {
      checkMcqAnswer(e.target);
    });
  });
});

// ==========================================================================
// GAME FLOW MANAGEMENT
// ==========================================================================

function startGame() {
  gameState = {
    currentRound: 1,
    questionIndex: 0,
    score: 0,
    scoreBreakdown: { round1: 0, round2: 0, round3: 0 },
    currentQuestion: null,
    mcqList: selectRandomMcqs(MCQ_BANK, 4)
  };
  
  updateHUD();
  showScreen(questionScreen);
  loadQuestion();
}

function restartGame() {
  showScreen(welcomeScreen);
  updateHUD();
}

function showScreen(screen) {
  [welcomeScreen, questionScreen, resultsScreen].forEach(s => {
    s.classList.remove('active');
  });
  screen.classList.add('active');
}

// Utility to randomize array and slice
function selectRandomMcqs(bank, num) {
  const shuffled = [...bank].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, num);
}

// ==========================================================================
// HUD UPDATES
// ==========================================================================

function updateHUD() {
  scoreVal.textContent = String(gameState.score).padStart(2, '0');
  
  if (gameState.currentRound === 1 || gameState.currentRound === 2) {
    currentRoundVal.textContent = `${gameState.currentRound} / 3`;
    progressVal.textContent = `${gameState.questionIndex + 1} / 3`;
    
    // Calculate progress (out of 10 total questions: 3 + 3 + 4)
    const completed = ((gameState.currentRound - 1) * 3) + gameState.questionIndex;
    const percentage = (completed / 10) * 100;
    progressBarFill.style.width = `${percentage}%`;
  } else if (gameState.currentRound === 3) {
    currentRoundVal.textContent = `3 / 3`;
    progressVal.textContent = `${gameState.questionIndex + 1} / 4`;
    
    const completed = 6 + gameState.questionIndex;
    const percentage = (completed / 10) * 100;
    progressBarFill.style.width = `${percentage}%`;
  } else {
    // Game completed
    progressBarFill.style.width = '100%';
  }
}

// ==========================================================================
// QUESTION BUILDER & RENDERING
// ==========================================================================

function loadQuestion() {
  // Clear layout feedback and inputs
  feedbackPanel.classList.remove('correct', 'wrong');
  feedbackPanel.style.display = 'none';
  studentAnswer.value = '';
  studentAnswer.disabled = false;
  studentUnit.value = '';
  studentUnit.disabled = false;
  submitBtn.disabled = false;
  
  mcqOptions.forEach(btn => {
    btn.classList.remove('correct-choice', 'wrong-choice', 'disabled');
  });

  const planet = PLANETS[Math.floor(Math.random() * PLANETS.length)];
  updatePlanetVisuals(planet);

  if (gameState.currentRound === 1) {
    roundIntroText.textContent = "Round 1: Find the Weight (W = mg)";
    mathInputSection.style.display = 'flex';
    mcqSection.style.display = 'none';
    
    // Generate mass between 20kg and 120kg
    const mass = Math.floor(Math.random() * 101) + 20;
    const exactWeight = mass * planet.g;
    
    gameState.currentQuestion = {
      planet: planet,
      mass: mass,
      correctVal: exactWeight,
      tolerance: 1, // +/- 1 N tolerance
      correctUnit: 'N'
    };

    questionText.innerHTML = `An astronaut has a mass of <strong>${mass} kg</strong> on ${planet.name}.<br>What is their calculated weight?`;
    formulaHelperTarget.textContent = `Weight = ?`;
    studentAnswer.focus();

  } else if (gameState.currentRound === 2) {
    roundIntroText.textContent = "Round 2: Find the Mass (m = W / g)";
    mathInputSection.style.display = 'flex';
    mcqSection.style.display = 'none';
    
    // Generate weight between 100N and 1200N (multiples of 10)
    const weight = (Math.floor(Math.random() * 111) + 10) * 10;
    const exactMass = Number((weight / planet.g).toFixed(2));
    
    gameState.currentQuestion = {
      planet: planet,
      weight: weight,
      correctVal: exactMass,
      tolerance: 0.5, // +/- 0.5 kg tolerance
      correctUnit: 'kg'
    };

    questionText.innerHTML = `An object weighs <strong>${weight} N</strong> on ${planet.name}.<br>What is its calculated mass?`;
    formulaHelperTarget.textContent = `Mass = ?`;
    studentAnswer.focus();

  } else if (gameState.currentRound === 3) {
    roundIntroText.textContent = "Round 3: Misconception Trap (MCQ)";
    mathInputSection.style.display = 'none';
    mcqSection.style.display = 'grid';
    
    const activeMcq = gameState.mcqList[gameState.questionIndex];
    gameState.currentQuestion = activeMcq;

    questionText.innerHTML = activeMcq.question;
    
    mcqOptions.forEach((btn, index) => {
      btn.textContent = activeMcq.options[index];
      btn.dataset.text = activeMcq.options[index];
    });
  }
}

function updatePlanetVisuals(planet) {
  // Clear existing planet class
  dynamicPlanet.className = 'dynamic-planet';
  dynamicPlanet.classList.add(planet.class);

  // Set environment badge
  envPlanetName.textContent = planet.name;
  envGVal.textContent = planet.g;
  
  // Custom height/gravity feel by shifting astronaut slightly based on planet
  // More heavy gravity (Jupiter) pulls astronaut lower, low gravity (Moon) floats higher
  const baseBottom = 95; // Earth base
  let bottomShift = 0;
  if (planet.name === 'Moon') bottomShift = 20;
  if (planet.name === 'Mars') bottomShift = 10;
  if (planet.name === 'Jupiter') bottomShift = -20;
  if (planet.name === 'Venus') bottomShift = 5;
  
  astronautElement.style.bottom = `${baseBottom + bottomShift}px`;
}

// ==========================================================================
// CALCULATOR ANSWER CHECKS
// ==========================================================================

function checkMathAnswer() {
  const ans = parseFloat(studentAnswer.value);
  const enteredUnit = studentUnit.value.trim();

  if (isNaN(ans)) {
    alert("Please enter a numeric answer.");
    return;
  }
  if (!enteredUnit) {
    alert("Please enter a unit (e.g. N or kg).");
    return;
  }

  const q = gameState.currentQuestion;
  const diff = Math.abs(ans - q.correctVal);
  const isValCorrect = diff <= q.tolerance;
  const isUnitCorrect = enteredUnit.toLowerCase() === q.correctUnit.toLowerCase();
  const isCorrect = isValCorrect && isUnitCorrect;

  studentAnswer.disabled = true;
  studentUnit.disabled = true;
  submitBtn.disabled = true;

  if (isCorrect) {
    gameState.score += 2;
    if (gameState.currentRound === 1) gameState.scoreBreakdown.round1 += 2;
    if (gameState.currentRound === 2) gameState.scoreBreakdown.round2 += 2;
    
    showFeedback(true, ans, '');
  } else {
    let detail = '';
    if (!isValCorrect && !isUnitCorrect) {
      detail = `Incorrect value and incorrect unit (expected unit: ${q.correctUnit}).`;
    } else if (!isValCorrect) {
      detail = `Incorrect calculation value (unit "${enteredUnit}" was correct).`;
    } else {
      detail = `Correct value! But wrong unit (entered "${enteredUnit}", expected "${q.correctUnit}").`;
    }
    showFeedback(false, ans, detail);
  }
  
  updateHUD();
}

function checkMcqAnswer(selectedButton) {
  const q = gameState.currentQuestion;
  const choice = selectedButton.dataset.text;
  const isCorrect = choice === q.answer;

  mcqOptions.forEach(btn => {
    btn.classList.add('disabled');
    if (btn.dataset.text === q.answer) {
      btn.classList.add('correct-choice');
    }
  });

  if (isCorrect) {
    selectedButton.classList.add('correct-choice');
    gameState.score += 1;
    gameState.scoreBreakdown.round3 += 1;
    showFeedback(true, choice);
  } else {
    selectedButton.classList.add('wrong-choice');
    showFeedback(false, choice);
  }
  
  updateHUD();
}

// ==========================================================================
// FEEDBACK PANEL MANAGER
// ==========================================================================

function showFeedback(isCorrect, playerVal, detailMsg = '') {
  feedbackPanel.classList.remove('correct', 'wrong');
  feedbackPanel.classList.add(isCorrect ? 'correct' : 'wrong');
  
  feedbackIcon.textContent = isCorrect ? '✅' : '❌';
  feedbackTitle.textContent = isCorrect ? 'Correct!' : 'Incorrect';

  const q = gameState.currentQuestion;

  if (gameState.currentRound === 1) {
    // Show Round 1 formula working
    const gValText = q.planet.name === 'Moon' || q.planet.name === 'Mars' || q.planet.name === 'Venus' ? `${q.planet.g}` : `${q.planet.g}`;
    workingDisplay.innerHTML = `<strong>Working:</strong> W = m × g = ${q.mass} kg × ${gValText} N/kg = ${q.correctVal} N`;
    workingDisplay.style.display = 'block';
    
    explanationText.textContent = isCorrect 
      ? `Spot on! The weight on ${q.planet.name} is indeed ${q.correctVal} N.`
      : `${detailMsg ? detailMsg + ' ' : ''}The correct formula is W = m × g. Plugging in the values: ${q.mass} × ${q.planet.g} = ${q.correctVal} N.`;

  } else if (gameState.currentRound === 2) {
    // Show Round 2 formula working
    workingDisplay.innerHTML = `<strong>Working:</strong> m = W / g = ${q.weight} N / ${q.planet.g} N/kg = ${q.correctVal} kg`;
    workingDisplay.style.display = 'block';
    
    explanationText.textContent = isCorrect 
      ? `Excellent. Calculating mass from weight yields ${q.correctVal} kg.`
      : `${detailMsg ? detailMsg + ' ' : ''}Remember, to find mass: m = W / g. Dividing weight by gravity: ${q.weight} / ${q.planet.g} = ${q.correctVal} kg.`;

  } else if (gameState.currentRound === 3) {
    // Show MCQ Explanation
    workingDisplay.style.display = 'none';
    explanationText.textContent = q.explanation;
  }

  feedbackPanel.style.display = 'flex';
  
  // Auto-scroll feedback into view if needed
  feedbackPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ==========================================================================
// STAGE TRANSITIONS
// ==========================================================================

function handleNext() {
  gameState.questionIndex++;

  if (gameState.currentRound === 1 && gameState.questionIndex >= 3) {
    gameState.currentRound = 2;
    gameState.questionIndex = 0;
  } else if (gameState.currentRound === 2 && gameState.questionIndex >= 3) {
    gameState.currentRound = 3;
    gameState.questionIndex = 0;
  } else if (gameState.currentRound === 3 && gameState.questionIndex >= 4) {
    showResults();
    return;
  }

  updateHUD();
  loadQuestion();
}

// ==========================================================================
// RESULTS & GRADING CALCULATOR
// ==========================================================================

function showResults() {
  updateHUD();
  showScreen(resultsScreen);

  finalScoreVal.textContent = gameState.score;
  
  // Clear older grades
  gradeBadge.className = 'grade-badge';
  
  if (gameState.score >= 14) {
    gradeBadge.textContent = 'EXCELLENT';
    gradeBadge.classList.add('excellent');
    gradeFeedback.textContent = "Superb! You perfectly understand gravity, mass stability, and W = mg calculations!";
  } else if (gameState.score >= 10) {
    gradeBadge.textContent = 'GOOD';
    gradeBadge.classList.add('good');
    gradeFeedback.textContent = "Great job! Be sure to review calculation formulas and always double-check your units.";
  } else {
    gradeBadge.textContent = 'NEEDS PRACTICE';
    gradeBadge.classList.add('needs-practice');
    gradeFeedback.textContent = "Keep practicing! Remember that mass is constant, and weight is mass multiplied by gravity (W = mg).";
  }

  // Populate score breakdown stats
  r1Breakdown.textContent = `${gameState.scoreBreakdown.round1 / 2} / 3 correct`;
  r2Breakdown.textContent = `${gameState.scoreBreakdown.round2 / 2} / 3 correct`;
  r3Breakdown.textContent = `${gameState.scoreBreakdown.round3} / 4 correct`;
}
