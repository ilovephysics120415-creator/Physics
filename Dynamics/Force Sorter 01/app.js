/**
 * Dynamics Force Sorter Game Engine
 * Specifically designed for 16-year-old O-Level Physics Revision.
 */

// --- Audio Synthesizer (Visual-Audio Reinforcement via Web Audio API) ---
class SoundEffects {
  constructor() {
    this.ctx = null;
  }
  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }
  playCorrect() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
    osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  }
  playWrong() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now); // A3
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.25);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }
  playClick() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }
}

const sfx = new SoundEffects();

// --- Game Configurations & Data ---
const FORCE_CARDS_DATA = [
  { id: 'friction', name: 'Friction', type: 'contact', icon: '🏃', desc: 'Resists motion between surfaces' },
  { id: 'air-resistance', name: 'Air Resistance', type: 'contact', icon: '🪂', desc: 'Fluid drag force in atmosphere' },
  { id: 'tension', name: 'Tension', type: 'contact', icon: '🪢', desc: 'Pulling force exerted by a rope or cable' },
  { id: 'normal-force', name: 'Normal Force', type: 'contact', icon: '🧱', desc: 'Support force perpendicular to surface' },
  { id: 'upthrust', name: 'Upthrust', type: 'contact', icon: '⛵', desc: 'Upward buoyant force in fluids' },
  { id: 'applied-force', name: 'Applied Force', type: 'contact', icon: '💪', desc: 'Direct push or pull exerted on an object' },
  { id: 'gravity', name: 'Gravity', type: 'non-contact', icon: '🍎', desc: 'Attractive force between mass bodies' },
  { id: 'electrostatic', name: 'Electrostatic Force', type: 'non-contact', icon: '🎈', desc: 'Force between electric charges' },
  { id: 'magnetic', name: 'Magnetic Force', type: 'non-contact', icon: '🧲', desc: 'Attractive/repulsive magnetic poles' },
  { id: 'gravitational-pull', name: 'Gravitational Pull', type: 'non-contact', icon: '🌍', desc: 'Planetary gravitational pull' }
];

const QUIZ_QUESTIONS = [
  {
    q: "A book slides on a table. What contact force slows it down?",
    correct: "Friction",
    options: ["Friction", "Normal Force", "Gravity", "Upthrust"],
    explanation: "Friction is the contact force that acts parallel to the contact surface and opposes the relative sliding motion of the book."
  },
  {
    q: "The Earth pulls a ball downward. What type of force is this?",
    correct: "Gravitational (Non-contact)",
    options: ["Gravitational (Non-contact)", "Tension (Contact)", "Friction (Contact)", "Electrostatic (Non-contact)"],
    explanation: "Gravity acts over a distance without requiring physical contact, making it a non-contact force."
  },
  {
    q: "A crane lifts a load using a rope. What force acts along the rope?",
    correct: "Tension",
    options: ["Tension", "Upthrust", "Normal Force", "Magnetic Force"],
    explanation: "Tension is the contact force transmitted through a string, rope, cable or wire when it is pulled tight by forces acting from opposite ends."
  },
  {
    q: "Two magnets repel each other without touching. What type of force is this?",
    correct: "Magnetic (Non-contact)",
    options: ["Magnetic (Non-contact)", "Applied Force (Contact)", "Normal Force (Contact)", "Electrostatic (Non-contact)"],
    explanation: "Magnetic forces are non-contact because magnetic fields interact and exert forces across space without physical touch."
  },
  {
    q: "A swimmer feels resistance moving through water. Name this contact force.",
    correct: "Fluid resistance / Drag",
    options: ["Fluid resistance / Drag", "Upthrust", "Tension", "Gravity"],
    explanation: "As a swimmer moves through water, the water molecules collide with the swimmer, creating a resistive contact force (drag)."
  },
  {
    q: "What force acts perpendicular to a surface when two objects are in contact?",
    correct: "Normal Force",
    options: ["Normal Force", "Friction", "Upthrust", "Applied Force"],
    explanation: "The normal force is the perpendicular support force exerted by a surface on an object in contact with it."
  },
  {
    q: "A charged balloon attracts paper without touching. What force is this?",
    correct: "Electrostatic (Non-contact)",
    options: ["Electrostatic (Non-contact)", "Magnetic (Non-contact)", "Gravity (Non-contact)", "Air Resistance (Contact)"],
    explanation: "The electrostatic force acts between electrical charges across a distance without physical contact."
  }
];

// --- State Variables ---
let currentDeck = [];
let sorterTries = 0;
let sorterCorrectCount = 0;
let activeDragCard = null;

let selectedQuizQuestions = [];
let currentQuizIdx = 0;
let quizScore = 0;

// --- Drag-and-Drop Coordinates & Math Engine ---
let startX = 0, startY = 0;
let currentX = 0, currentY = 0;
let initialTransform = '';

// --- DOM References ---
const screens = {
  start: document.getElementById('screen-start'),
  sorter: document.getElementById('screen-sorter'),
  quiz: document.getElementById('screen-quiz'),
  results: document.getElementById('screen-results')
};

const deckContainer = document.getElementById('cards-deck');
const binContact = document.getElementById('bin-contact');
const binNonContact = document.getElementById('bin-non-contact');

// --- Helper Functions ---
function showScreen(screenId) {
  Object.keys(screens).forEach(key => {
    screens[key].classList.remove('active');
  });
  screens[screenId].classList.add('active');
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// --- Initialization & UI Generation ---
function initGame() {
  sorterTries = 0;
  sorterCorrectCount = 0;
  currentQuizIdx = 0;
  quizScore = 0;
  
  // Clear bins
  document.querySelectorAll('.bin-dropzone').forEach(dz => {
    dz.querySelectorAll('.sorted-card').forEach(c => c.remove());
    dz.querySelector('.drop-placeholder').style.display = 'block';
  });

  // Prepare cards
  currentDeck = shuffleArray([...FORCE_CARDS_DATA]);
  renderDeck();
  updateSorterStats();
}

function renderDeck() {
  deckContainer.innerHTML = '';
  currentDeck.forEach((card, index) => {
    const cardEl = document.createElement('div');
    cardEl.classList.add('force-card');
    cardEl.dataset.id = card.id;
    cardEl.dataset.type = card.type;
    cardEl.style.zIndex = currentDeck.length - index;

    cardEl.innerHTML = `
      <div class="card-icon">${card.icon}</div>
      <h3>${card.name}</h3>
      <p>${card.desc}</p>
    `;

    // Equip pointer events for cross-platform drag & drop (Desktop & Mobile)
    cardEl.addEventListener('pointerdown', onPointerDown);

    deckContainer.appendChild(cardEl);
  });
}

// --- Drag & Drop Mechanics using PointerEvents ---
function onPointerDown(e) {
  // Prevent default action & capture pointer
  e.preventDefault();
  sfx.playClick();
  
  activeDragCard = e.currentTarget;
  activeDragCard.setPointerCapture(e.pointerId);
  activeDragCard.classList.add('dragging');

  // Record initial positions
  startX = e.clientX;
  startY = e.clientY;
  
  // Save initial transform if any
  initialTransform = window.getComputedStyle(activeDragCard).transform;
  if (initialTransform === 'none') initialTransform = '';

  activeDragCard.addEventListener('pointermove', onPointerMove);
  activeDragCard.addEventListener('pointerup', onPointerUp);
  activeDragCard.addEventListener('pointercancel', onPointerCancel);
}

function onPointerMove(e) {
  if (!activeDragCard) return;
  e.preventDefault();
  
  currentX = e.clientX - startX;
  currentY = e.clientY - startY;
  
  activeDragCard.style.transform = `translate(${currentX}px, ${currentY}px) scale(1.05)`;

  // Check collision & apply visual highlights
  const contactRect = binContact.getBoundingClientRect();
  const nonContactRect = binNonContact.getBoundingClientRect();
  
  // Highlight bin hover state
  if (e.clientX >= contactRect.left && e.clientX <= contactRect.right &&
      e.clientY >= contactRect.top && e.clientY <= contactRect.bottom) {
    binContact.classList.add('drag-over');
  } else {
    binContact.classList.remove('drag-over');
  }

  if (e.clientX >= nonContactRect.left && e.clientX <= nonContactRect.right &&
      e.clientY >= nonContactRect.top && e.clientY <= nonContactRect.bottom) {
    binNonContact.classList.add('drag-over');
  } else {
    binNonContact.classList.remove('drag-over');
  }
}

function onPointerUp(e) {
  if (!activeDragCard) return;
  activeDragCard.releasePointerCapture(e.pointerId);
  cleanupPointerListeners();

  const cardType = activeDragCard.dataset.type;
  const cardId = activeDragCard.dataset.id;
  const cardData = FORCE_CARDS_DATA.find(d => d.id === cardId);

  // Check collision with dropzones
  const contactRect = binContact.getBoundingClientRect();
  const nonContactRect = binNonContact.getBoundingClientRect();
  let targetBin = null;

  if (e.clientX >= contactRect.left && e.clientX <= contactRect.right &&
      e.clientY >= contactRect.top && e.clientY <= contactRect.bottom) {
    targetBin = 'contact';
  } else if (e.clientX >= nonContactRect.left && e.clientX <= nonContactRect.right &&
             e.clientY >= nonContactRect.top && e.clientY <= nonContactRect.bottom) {
    targetBin = 'non-contact';
  }

  binContact.classList.remove('drag-over');
  binNonContact.classList.remove('drag-over');

  sorterTries++;

  if (targetBin && targetBin === cardType) {
    // Correct Drop
    sfx.playCorrect();
    activeDragCard.classList.remove('dragging');
    activeDragCard.classList.add('correct-drop');
    
    // Add to side list representation inside the dropzone
    const dropzone = targetBin === 'contact' ? 
      binContact.querySelector('.bin-dropzone') : 
      binNonContact.querySelector('.bin-dropzone');
    
    // Hide placeholder
    dropzone.querySelector('.drop-placeholder').style.display = 'none';

    const listCard = document.createElement('div');
    listCard.classList.add('sorted-card');
    listCard.innerHTML = `
      <span class="sorted-icon">${cardData.icon}</span>
      <span>${cardData.name}</span>
    `;
    dropzone.appendChild(listCard);

    // Remove from array and animate disappearance
    const cardElToRemove = activeDragCard;
    setTimeout(() => {
      cardElToRemove.remove();
    }, 300);

    sorterCorrectCount++;
    currentDeck = currentDeck.filter(c => c.id !== cardId);

    // Check if sorter round is complete
    if (currentDeck.length === 0) {
      setTimeout(startQuizRound, 800);
    }
  } else {
    // Incorrect drop or dropped outside
    sfx.playWrong();
    activeDragCard.classList.add('wrong-drop');
    
    // Elastic animation back to deck center
    activeDragCard.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    activeDragCard.style.transform = '';
    
    const badCard = activeDragCard;
    setTimeout(() => {
      badCard.classList.remove('wrong-drop', 'dragging');
      badCard.style.transition = '';
    }, 400);
  }

  activeDragCard = null;
  updateSorterStats();
}

function onPointerCancel(e) {
  if (!activeDragCard) return;
  cleanupPointerListeners();
  activeDragCard.classList.remove('dragging', 'wrong-drop');
  activeDragCard.style.transform = '';
  activeDragCard = null;
}

function cleanupPointerListeners() {
  activeDragCard.removeEventListener('pointermove', onPointerMove);
  activeDragCard.removeEventListener('pointerup', onPointerUp);
  activeDragCard.removeEventListener('pointercancel', onPointerCancel);
}

function updateSorterStats() {
  document.getElementById('sorted-count').innerText = sorterCorrectCount;
  const rate = sorterTries === 0 ? 100 : Math.round((sorterCorrectCount / sorterTries) * 100);
  document.getElementById('sorter-score').innerText = `${rate}%`;
}

// --- Quiz Engine Mechanics ---
function startQuizRound() {
  // Select 5 random questions
  selectedQuizQuestions = shuffleArray([...QUIZ_QUESTIONS]).slice(0, 5);
  currentQuizIdx = 0;
  quizScore = 0;
  showScreen('quiz');
  loadQuestion();
}

function loadQuestion() {
  const currentQuestion = selectedQuizQuestions[currentQuizIdx];
  
  document.getElementById('quiz-current-num').innerText = currentQuizIdx + 1;
  document.getElementById('question-text').innerText = currentQuestion.q;
  document.getElementById('quiz-feedback-box').classList.add('hidden');
  
  const optionsContainer = document.getElementById('options-container');
  optionsContainer.innerHTML = '';

  // Shuffle option answers
  const shuffledOptions = shuffleArray([...currentQuestion.options]);
  
  shuffledOptions.forEach(opt => {
    const btn = document.createElement('button');
    btn.classList.add('option-btn');
    btn.innerHTML = `<span>${opt}</span>`;
    btn.addEventListener('click', () => checkQuizAnswer(opt, btn));
    optionsContainer.appendChild(btn);
  });
}

function checkQuizAnswer(selectedOption, clickedBtn) {
  const currentQuestion = selectedQuizQuestions[currentQuizIdx];
  const allButtons = document.querySelectorAll('.option-btn');
  
  // Disable all buttons immediately
  allButtons.forEach(btn => btn.disabled = true);

  const feedbackBox = document.getElementById('quiz-feedback-box');
  const feedbackIcon = document.getElementById('feedback-icon');
  const feedbackStatus = document.getElementById('feedback-status-text');
  const feedbackExp = document.getElementById('feedback-explanation');

  feedbackBox.className = 'quiz-feedback-box'; // reset

  if (selectedOption === currentQuestion.correct) {
    sfx.playCorrect();
    clickedBtn.classList.add('correct');
    quizScore++;
    
    feedbackBox.classList.add('correct-feedback');
    feedbackIcon.innerText = '✓';
    feedbackStatus.innerText = 'Correct!';
  } else {
    sfx.playWrong();
    clickedBtn.classList.add('incorrect');
    
    // Highlight correct answer
    allButtons.forEach(btn => {
      if (btn.querySelector('span').innerText === currentQuestion.correct) {
        btn.classList.add('correct');
      }
    });

    feedbackBox.classList.add('incorrect-feedback');
    feedbackIcon.innerText = '✗';
    feedbackStatus.innerText = 'Incorrect';
  }

  feedbackExp.innerText = currentQuestion.explanation;
  feedbackBox.classList.remove('hidden');
}

// --- End Screen & Game Logic ---
function showFinalResults() {
  showScreen('results');
  
  document.getElementById('final-sorter-score').innerText = `${sorterCorrectCount}/10`;
  document.getElementById('final-quiz-score').innerText = `${quizScore}/5`;

  // Customize end messages
  const tagline = document.getElementById('results-tagline');
  const summaryText = document.getElementById('final-summary-text');
  
  const totalScore = sorterCorrectCount + quizScore;

  if (totalScore >= 14) {
    tagline.innerText = "Excellent! Grade A1 Dynamics Master!";
    summaryText.innerText = "You have demonstrated a comprehensive conceptual and analytical mastery of contact and non-contact forces. Excellent revision!";
  } else if (totalScore >= 11) {
    tagline.innerText = "Solid Performance! Good Job!";
    summaryText.innerText = "You have a strong understanding of physical forces. Review the minor slips on incorrect selections to secure your distinction.";
  } else {
    tagline.innerText = "Keep Practicing!";
    summaryText.innerText = "Review the basic definitions of contact forces (which require touch) versus field-mediated forces like Gravity, Electrostatic, and Magnetic forces.";
  }
}

// --- Event Listeners ---
document.getElementById('btn-start').addEventListener('click', () => {
  sfx.playClick();
  showScreen('sorter');
  initGame();
});

document.getElementById('btn-next-question').addEventListener('click', () => {
  sfx.playClick();
  currentQuizIdx++;
  if (currentQuizIdx < 5) {
    loadQuestion();
  } else {
    showFinalResults();
  }
});

document.getElementById('btn-restart').addEventListener('click', () => {
  sfx.playClick();
  showScreen('sorter');
  initGame();
});
