// Database of Singapore O-level Physical Quantities (Syllabus 6091)
const QUANTITIES = [
  { name: 'Distance', type: 'Scalar', definition: 'Distance is the total length of path covered by a moving object, regardless of the direction of motion.' },
  { name: 'Displacement', type: 'Vector', definition: 'Displacement is distance measured in a specified direction (or change in position of an object).' },
  { name: 'Speed', type: 'Scalar', definition: 'Speed is the rate of change of distance (distance travelled per unit time).' },
  { name: 'Velocity', type: 'Vector', definition: 'Velocity is the rate of change of displacement.' },
  { name: 'Mass', type: 'Scalar', definition: 'Mass is a measure of the amount of matter in a body.' },
  { name: 'Weight', type: 'Vector', definition: 'Weight is the gravitational force acting on a body.' },
  { name: 'Temperature', type: 'Scalar', definition: 'Temperature is a measure of the degree of hotness or coldness of a body.' },
  { name: 'Force', type: 'Vector', definition: 'Force is a pull or push that can change a body\'s state of rest or motion.' },
  { name: 'Energy', type: 'Scalar', definition: 'Energy is the capacity to do work.' },
  { name: 'Acceleration', type: 'Vector', definition: 'Acceleration is the rate of change of velocity.' },
  { name: 'Time', type: 'Scalar', definition: 'Time is a measure of the interval between two events.' },
  { name: 'Momentum', type: 'Vector', definition: 'Momentum is the product of a body\'s mass and its velocity.' },
  { name: 'Power', type: 'Scalar', definition: 'Power is the rate of work done or rate of energy transferred.' },
  { name: 'Electric current', type: 'Scalar', definition: 'Electric current is the rate of flow of electric charge.' },
  { name: 'Pressure', type: 'Scalar', definition: 'Pressure is the force acting per unit area.' }
];

// App state variables
let currentMode = 'menu'; // 'menu', 'flashcards', 'quiz', 'end'
let flashcardDeck = [...QUANTITIES];
let currentCardIndex = 0;

let quizQuestions = [];
let currentQuizIndex = 0;
let quizScore = 0;
const TOTAL_QUIZ_QUESTIONS = 30;

// DOM Cache
const views = {
  menu: document.getElementById('menu-view'),
  flashcards: document.getElementById('flashcards-view'),
  quiz: document.getElementById('quiz-view'),
  end: document.getElementById('end-view')
};

// Navigation
function switchView(viewName) {
  currentMode = viewName;
  Object.keys(views).forEach(key => {
    if (key === viewName) {
      views[key].classList.add('active');
    } else {
      views[key].classList.remove('active');
    }
  });

  // Reset overlay panels if leaving views
  closeExplanation();
}

// ---------------- FLASHCARD REVISION MODE ----------------
function startFlashcards() {
  flashcardDeck = [...QUANTITIES];
  currentCardIndex = 0;
  switchView('flashcards');
  updateFlashcard();
}

function updateFlashcard() {
  const card = document.getElementById('card');
  card.classList.remove('flipped');

  const quantity = flashcardDeck[currentCardIndex];
  
  // Front face
  document.getElementById('card-qty-front').textContent = quantity.name;
  
  // Back face
  const cardBack = document.getElementById('card-back');
  cardBack.className = 'card-face card-back'; // clear type classes
  
  const typeText = quantity.type.toUpperCase();
  cardBack.classList.add(quantity.type === 'Scalar' ? 'scalar-card' : 'vector-card');
  
  document.getElementById('card-type-badge').textContent = typeText;
  document.getElementById('card-def').textContent = quantity.definition;
  
  // Progress Counter
  document.getElementById('card-progress').textContent = `${currentCardIndex + 1} / ${flashcardDeck.length}`;
}

function flipCard() {
  document.getElementById('card').classList.toggle('flipped');
}

function nextCard() {
  currentCardIndex = (currentCardIndex + 1) % flashcardDeck.length;
  updateFlashcard();
}

function prevCard() {
  currentCardIndex = (currentCardIndex - 1 + flashcardDeck.length) % flashcardDeck.length;
  updateFlashcard();
}

function shuffleFlashcards() {
  // Fisher-Yates Shuffle
  for (let i = flashcardDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [flashcardDeck[i], flashcardDeck[j]] = [flashcardDeck[j], flashcardDeck[i]];
  }
  currentCardIndex = 0;
  updateFlashcard();
}

// ---------------- SORT IT! QUIZ MODE ----------------
function startQuiz() {
  quizScore = 0;
  currentQuizIndex = 0;
  quizQuestions = generateQuizQuestions(TOTAL_QUIZ_QUESTIONS);
  switchView('quiz');
  updateQuizQuestion();
}

// Generate 30 questions by pulling from our 15, and duplication if necessary
function generateQuizQuestions(count) {
  let list = [];
  while (list.length < count) {
    // Shuffle base items first to make it organic
    const shuffledBase = [...QUANTITIES].sort(() => Math.random() - 0.5);
    list = list.concat(shuffledBase);
  }
  return list.slice(0, count);
}

function updateQuizQuestion() {
  const q = quizQuestions[currentQuizIndex];
  document.getElementById('quiz-qty').textContent = q.name;
  document.getElementById('quiz-progress-num').textContent = `Question ${currentQuizIndex + 1} of ${TOTAL_QUIZ_QUESTIONS}`;
  document.getElementById('quiz-score-num').textContent = `Score: ${quizScore}`;
  
  // Reset card styles
  const card = document.getElementById('quiz-card');
  card.className = 'quiz-card';
}

function handleAnswer(selectedType) {
  const q = quizQuestions[currentQuizIndex];
  const isCorrect = q.type.toLowerCase() === selectedType.toLowerCase();
  
  const quizCard = document.getElementById('quiz-card');
  const expPanel = document.getElementById('explanation-panel');
  const expStatus = document.getElementById('exp-status');
  const expText = document.getElementById('exp-text');
  
  if (isCorrect) {
    quizScore++;
    quizCard.classList.add('correct-flash');
    expStatus.className = 'exp-status correct';
    expStatus.textContent = 'Correct!';
    triggerCelebration();
  } else {
    quizCard.classList.add('incorrect-flash');
    expStatus.className = 'exp-status incorrect';
    expStatus.textContent = 'Incorrect';
  }

  // Set explanation text based on quantity properties
  expText.textContent = `${q.name} is a ${q.type.toLowerCase()} quantity because ${
    q.type === 'Scalar' ? 'it has magnitude only.' : 'it has both magnitude and direction.'
  } ${q.definition}`;

  // Open explanation slide up panel
  expPanel.classList.add('active');
}

function closeExplanation() {
  document.getElementById('explanation-panel').classList.remove('active');
}

function nextQuizQuestion() {
  closeExplanation();
  
  // Short delay to allow slide-down animation to start before content changes
  setTimeout(() => {
    currentQuizIndex++;
    if (currentQuizIndex < TOTAL_QUIZ_QUESTIONS) {
      updateQuizQuestion();
    } else {
      endQuiz();
    }
  }, 200);
}

function endQuiz() {
  switchView('end');
  document.getElementById('final-score').textContent = quizScore;
  
  // Calculate Grade boundary and custom comment for O-level SG standard
  const percentage = (quizScore / TOTAL_QUIZ_QUESTIONS) * 100;
  let grade = 'F9';
  let comment = 'Let\'s revise again! Vector and Scalar concepts are fundamental for Kinematics and Forces.';
  
  if (percentage >= 75) {
    grade = 'A1';
    comment = 'Outstanding! You have a perfect mastery of Physical Quantities for your O-levels!';
  } else if (percentage >= 70) {
    grade = 'A2';
    comment = 'Excellent job! You are well prepared. Keep up the high standard!';
  } else if (percentage >= 65) {
    grade = 'B3';
    comment = 'Good job! Just a few minor slips. A little more revision will secure an A!';
  } else if (percentage >= 60) {
    grade = 'B4';
    comment = 'Solid effort! Focus on displacement, velocity, and weight vs mass.';
  } else if (percentage >= 55) {
    grade = 'C5';
    comment = 'Passable! Go through the Flashcards to review the differences between vector and scalar properties.';
  } else if (percentage >= 50) {
    grade = 'C6';
    comment = 'Keep practicing! Review your vector definitions and remember direction matters!';
  }

  document.getElementById('final-grade').textContent = `O-Level Grade: ${grade}`;
  document.getElementById('grade-comment').textContent = comment;
}

// ---------------- CELEBRATORY ANIMATIONS (Confetti) ----------------
const canvas = document.getElementById('confetti-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let animationFrameId = null;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class ConfettiParticle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = -20;
    this.size = Math.random() * 6 + 6;
    this.speed = Math.random() * 5 + 4;
    this.angle = Math.random() * 360;
    this.spin = Math.random() * 0.2 - 0.1;
    // Neon palette colors matching cyan, magenta, and purple
    const colors = ['#00f0ff', '#ff007f', '#9d4edd', '#ffcc00'];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }

  update() {
    this.y += this.speed;
    this.angle += this.spin;
    this.x += Math.sin(this.angle) * 1.5;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;
    ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    ctx.restore();
  }
}

function triggerCelebration() {
  // Add 40 new particles
  for (let i = 0; i < 40; i++) {
    particles.push(new ConfettiParticle());
  }
  
  if (!animationFrameId) {
    animateParticles();
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Filter out particles off bottom
  particles = particles.filter(p => p.y < canvas.height);
  
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

// Switch to initial state
switchView('menu');
