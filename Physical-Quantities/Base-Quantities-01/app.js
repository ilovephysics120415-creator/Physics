// Base Quantities Blitz - Game Engine

// 6 Base Quantities from Singapore O-Level Physics 6091 syllabus
const BASE_QUANTITIES = [
  { id: 'mass', name: 'Mass', unitName: 'kilogram', symbol: 'kg' },
  { id: 'length', name: 'Length', unitName: 'metre', symbol: 'm' },
  { id: 'time', name: 'Time', unitName: 'second', symbol: 's' },
  { id: 'current', name: 'Electric Current', unitName: 'ampere', symbol: 'A' },
  { id: 'temperature', name: 'Thermodynamic Temperature', unitName: 'kelvin', symbol: 'K' },
  { id: 'amount', name: 'Amount of Substance', unitName: 'mole', symbol: 'mol' }
];

// App State
let state = {
  score: 0,
  totalQuestions: 0,
  currentQuantity: null,
  questionQueue: [],
  hasAnswered: false
};

// UI Elements
const screens = {
  start: document.getElementById('start-screen'),
  game: document.getElementById('game-screen'),
  end: document.getElementById('end-screen')
};

const buttons = {
  start: document.getElementById('start-btn'),
  retry: document.getElementById('retry-btn'),
  next: document.getElementById('next-btn'),
  stop: document.getElementById('stop-btn'),
  options: document.querySelectorAll('.btn-option')
};

const displays = {
  score: document.getElementById('score-val'),
  quantity: document.getElementById('quantity-display'),
  quizCard: document.getElementById('quiz-card'),
  feedbackPanel: document.getElementById('feedback-panel'),
  explanation: document.getElementById('explanation-text'),
  finalCorrect: document.getElementById('final-correct'),
  finalTotal: document.getElementById('final-total'),
  gradeTitle: document.getElementById('grade-title'),
  gradeDesc: document.getElementById('grade-desc')
};

// --- Confetti Celebratory System ---
const canvas = document.getElementById('confetti-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let animationId = null;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class ConfettiParticle {
  constructor() {
    this.x = window.innerWidth / 2;
    this.y = window.innerHeight / 2 + 100; // Emit near buttons/card area
    this.size = Math.random() * 8 + 6;
    this.color = ['#00f2fe', '#fe019a', '#39ff14', '#ffaa00'][Math.floor(Math.random() * 4)];
    
    // Random angle and speed
    const angle = Math.random() * Math.PI * 1.5 + Math.PI * 1.75;
    const speed = Math.random() * 8 + 8;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    
    this.gravity = 0.35;
    this.alpha = 1.0;
    this.rotation = Math.random() * 360;
    this.rotationSpeed = Math.random() * 10 - 5;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity;
    this.alpha -= 0.02;
    this.rotation += this.rotationSpeed;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    ctx.restore();
  }
}

function triggerConfetti() {
  particles = [];
  for (let i = 0; i < 40; i++) {
    particles.push(new ConfettiParticle());
  }
  
  if (animationId) cancelAnimationFrame(animationId);
  animateConfetti();
}

function animateConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles = particles.filter(p => p.alpha > 0);
  
  particles.forEach(p => {
    p.update();
    p.draw();
  });

  if (particles.length > 0) {
    animationId = requestAnimationFrame(animateConfetti);
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

// --- Game Logic ---

// Helper to shuffle arrays
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

// Start Game / Round
function startGame() {
  state.score = 0;
  state.totalQuestions = 0;
  state.hasAnswered = false;
  
  displays.score.innerText = state.score;

  // Change screens
  showScreen('game');

  // Generate Queue of physical quantities
  generateQueue();
  nextQuestion();
}

function showScreen(screenId) {
  Object.keys(screens).forEach(key => {
    if (key === screenId) {
      screens[key].classList.add('active');
    } else {
      screens[key].classList.remove('active');
    }
  });
}

function generateQueue() {
  state.questionQueue = shuffle([...BASE_QUANTITIES]);
}

function nextQuestion() {
  state.hasAnswered = false;
  displays.feedbackPanel.classList.add('hidden');
  displays.quizCard.classList.remove('shake');

  // Refill queue if empty
  if (state.questionQueue.length === 0) {
    generateQueue();
  }

  // Get current quantity
  state.currentQuantity = state.questionQueue.pop();
  displays.quantity.innerText = state.currentQuantity.name;

  // Options configuration
  // The correct option is the symbol representing the SI unit
  const correctUnit = `${state.currentQuantity.symbol} (${state.currentQuantity.unitName})`;
  
  // Distractors
  const distractors = BASE_QUANTITIES
    .filter(q => q.id !== state.currentQuantity.id)
    .map(q => `${q.symbol} (${q.unitName})`);
  
  // Pick 3 random distractors
  const chosenDistractors = shuffle(distractors).slice(0, 3);
  
  // Pool and Shuffle options
  const optionsPool = shuffle([correctUnit, ...chosenDistractors]);

  // Render option buttons
  buttons.options.forEach((btn, idx) => {
    btn.className = 'btn btn-option'; // reset classes
    btn.innerText = optionsPool[idx];
    btn.dataset.unit = optionsPool[idx];
    btn.disabled = false;
  });
}

function selectAnswer(buttonIndex) {
  if (state.hasAnswered) return;
  state.hasAnswered = true;
  state.totalQuestions++;

  const selectedBtn = buttons.options[buttonIndex];
  const selectedText = selectedBtn.dataset.unit;
  
  const correctText = `${state.currentQuantity.symbol} (${state.currentQuantity.unitName})`;
  const isCorrect = selectedText === correctText;

  // Visual cues
  buttons.options.forEach(btn => {
    btn.classList.add('disabled');
    if (btn.dataset.unit === correctText) {
      btn.classList.add('correct');
    }
  });

  if (isCorrect) {
    state.score++;
    displays.score.innerText = state.score;
    selectedBtn.classList.add('correct');
    triggerConfetti();
  } else {
    selectedBtn.classList.add('wrong');
    displays.quizCard.classList.add('shake');
  }

  // Brief 1-line feedback explanation
  displays.explanation.innerText = `${state.currentQuantity.name} is measured in ${state.currentQuantity.unitName}s (${state.currentQuantity.symbol}).`;
  displays.feedbackPanel.classList.remove('hidden');
}

function endGame() {
  showScreen('end');

  // Set final scores
  displays.finalCorrect.innerText = state.score;
  displays.finalTotal.innerText = state.totalQuestions;

  // Compute O-Level styled Grade Feedback
  const percentage = state.totalQuestions > 0 ? (state.score / state.totalQuestions) * 100 : 0;
  
  if (state.totalQuestions === 0) {
    displays.gradeTitle.innerText = 'NO SHOTS TAKEN!';
    displays.gradeDesc.innerText = 'Try to answer at least one question next time!';
  } else if (percentage >= 85) {
    displays.gradeTitle.innerText = 'DISTINCTION (A1)!';
    displays.gradeDesc.innerText = 'Flawless physics mastery. Exam ready!';
  } else if (percentage >= 70) {
    displays.gradeTitle.innerText = 'MERIT (B3)!';
    displays.gradeDesc.innerText = 'Great knowledge! Just refine your speed.';
  } else if (percentage >= 50) {
    displays.gradeTitle.innerText = 'PASS (C6)!';
    displays.gradeDesc.innerText = 'You know the base units. Practice for distinction!';
  } else {
    displays.gradeTitle.innerText = 'UNGRADED (F9)';
    displays.gradeDesc.innerText = 'Review the 6 base quantities and retry!';
  }
}

// Event Listeners
buttons.start.addEventListener('click', startGame);
buttons.retry.addEventListener('click', startGame);
buttons.next.addEventListener('click', nextQuestion);
buttons.stop.addEventListener('click', endGame);

buttons.options.forEach((btn, idx) => {
  btn.addEventListener('click', () => selectAnswer(idx));
});
