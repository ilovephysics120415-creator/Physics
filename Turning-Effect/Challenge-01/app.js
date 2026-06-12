/**
 * Turning Effect of Forces Revision App - JS Controller
 */

// --- FLASHCARDS DATA (50 cards) ---
const FLASHCARDS = [
  // Topic 0: Moment of a Force (8 cards)
  { id: 0, topic: 0, question: "What is the definition of the moment of a force?", answer: "The moment of a force is the product of the force and the perpendicular distance from the pivot to the line of action of the force." },
  { id: 1, topic: 0, question: "State the SI unit for the moment of a force.", answer: "Newton-metre (Nm)." },
  { id: 2, topic: 0, question: "Is moment a vector or scalar quantity? Why?", answer: "Moment is a vector quantity because it has both magnitude and direction (clockwise or anticlockwise)." },
  { id: 3, topic: 0, question: "Name three everyday examples of moments of forces in action.", answer: "1. Pushing a door open (turning about hinges)\n2. Using a spanner to loosen a bolt\n3. Operating a wheelbarrow" },
  { id: 4, topic: 0, question: "Why is a door handle placed furthest from the hinge?", answer: "To maximize the perpendicular distance (d) from the pivot. For the same required moment, a larger distance decreases the force (F) needed to turn the door (M = F × d)." },
  { id: 5, topic: 0, question: "What formula is used to calculate the moment of a force?", answer: "Moment (M) = Force (F) × Perpendicular distance (d) from pivot to line of action of force." },
  { id: 6, topic: 0, question: "If you double the force applied to a lever but halve its distance from the pivot, what happens to the moment?", answer: "The moment remains unchanged (2F × 0.5d = Fd)." },
  { id: 7, topic: 0, question: "What does it mean when a turning effect is zero?", answer: "It means either the force applied is zero, or the line of action of the force passes directly through the pivot (perpendicular distance is zero)." },

  // Topic 1: Perpendicular Distance (8 cards)
  { id: 8, topic: 1, question: "What is the 'line of action' of a force?", answer: "It is the infinite geometric line along which a force vector acts." },
  { id: 9, topic: 1, question: "Why is the perpendicular distance used instead of the direct distance from pivot to force application point?", answer: "Only the force component perpendicular to the lever arm creates torque; using perpendicular distance automatically accounts for this component." },
  { id: 10, topic: 1, question: "If a force acts at an angle θ to a lever arm of length L, how do you find the perpendicular distance from the pivot?", answer: "Perpendicular distance (d) = L × sin(θ), where θ is the angle between the force and the lever." },
  { id: 11, topic: 1, question: "When is the perpendicular distance equal to the length of the lever arm?", answer: "When the force is applied perpendicular (at 90 degrees) to the lever arm." },
  { id: 12, topic: 1, question: "If you pull a wrench at an angle of 30° instead of 90°, what happens to the perpendicular distance?", answer: "The perpendicular distance is halved (since sin(30°) = 0.5), meaning the moment produced is halved." },
  { id: 13, topic: 1, question: "True or False: If a force is parallel to the lever arm, the moment it produces is at its maximum.", answer: "False. The moment is zero because the line of action passes through the pivot (d = 0)." },
  { id: 14, topic: 1, question: "How does the pivot's position affect the perpendicular distance of a force?", answer: "Moving the pivot closer to the force's line of action reduces the perpendicular distance, thereby reducing the moment." },
  { id: 15, topic: 1, question: "In a diagram with angled forces, what is the best first step to find the moment?", answer: "Extend the line of action of the force and drop a perpendicular line from the pivot to that line of action." },

  // Topic 2: Principle of Moments (9 cards)
  { id: 16, topic: 2, question: "State the Principle of Moments.", answer: "For an object in rotational equilibrium, the sum of clockwise moments about any pivot is equal to the sum of anticlockwise moments about the same pivot." },
  { id: 17, topic: 2, question: "What are the two conditions required for a rigid body to be in static equilibrium?", answer: "1. Translational equilibrium: Resultant force = 0.\n2. Rotational equilibrium: Resultant moment = 0." },
  { id: 18, topic: 2, question: "How do you distinguish between clockwise (CW) and anticlockwise (ACW) moments?", answer: "Trace the circle the force would make around the pivot: if it moves in the direction of clock hands, it is CW; otherwise, it is ACW." },
  { id: 19, topic: 2, question: "A uniform beam is balanced at its center. If a 10N weight is placed 2m to the left of the pivot, where must a 5N weight be placed to balance it?", answer: "4m to the right of the pivot. (10N × 2m = 5N × d => d = 4m)." },
  { id: 20, topic: 2, question: "Why doesn't the weight of a uniform beam create a moment when the pivot is at its midpoint?", answer: "The centre of gravity of a uniform beam is at its midpoint, so the weight acts directly through the pivot (d = 0), yielding zero moment." },
  { id: 21, topic: 2, question: "What is a 'uniform' beam?", answer: "A beam with constant cross-sectional area and density, meaning its weight is distributed evenly and acts at its geometrical midpoint." },
  { id: 22, topic: 2, question: "Can the Principle of Moments be applied about any point on a balanced body?", answer: "Yes, for a body in static equilibrium, the sum of CW moments equals the sum of ACW moments about ANY chosen point/pivot." },
  { id: 23, topic: 2, question: "If a see-saw is not uniform, where does its weight act?", answer: "At its Centre of Gravity (CG), which will not be at the geometric midpoint." },
  { id: 24, topic: 2, question: "What is the torque equation for a beam with pivot on left, ACW moment from support on right, and CW moment from downward load?", answer: "Clockwise Moment (Load × d_load) = Anticlockwise Moment (Support Force × d_support)." },

  // Topic 3: Reaction Force at Pivot (8 cards)
  { id: 25, topic: 3, question: "Why does the reaction force at the pivot produce zero moment about the pivot?", answer: "Because its line of action passes directly through the pivot, making the perpendicular distance zero (M = R × 0 = 0)." },
  { id: 26, topic: 3, question: "How do you calculate the upward reaction force (R) at a single pivot for a balanced beam?", answer: "Use the upward force balance: R = sum of all downward forces acting on the beam (including the beam's own weight)." },
  { id: 27, topic: 3, question: "A 2.0 kg uniform beam has a pivot supporting it at the center. If two loads of 15N and 25N are placed on it, what is the reaction force at the pivot? (g = 10 N/kg)", answer: "R = 15N + 25N + (2.0kg × 10 N/kg) = 60N. (Upward forces = Downward forces)." },
  { id: 28, topic: 3, question: "If a beam is supported by two pivots (A and B), what is the sum of reaction forces R_A + R_B equal to?", answer: "The sum of all downward forces acting on the beam (loads + beam weight)." },
  { id: 29, topic: 3, question: "Why does a support force exist at a pivot?", answer: "To prevent the beam from accelerating downwards under gravity and external loads, keeping the net vertical force zero." },
  { id: 30, topic: 3, question: "In a diagram of a see-saw, what is the direction of the reaction force at the pivot?", answer: "Vertically upwards, counteracting the downward loads and the see-saw's weight." },
  { id: 31, topic: 3, question: "Can a pivot provide horizontal reaction force?", answer: "Yes, if there are horizontal forces applied, the pivot will react horizontally to keep the body in translational equilibrium." },
  { id: 32, topic: 3, question: "Does the position of the pivot affect the value of the pivot reaction force R?", answer: "No, R is determined solely by the sum of vertical loads. However, the pivot position does dictate how loads must be distributed to keep it balanced." },

  // Topic 4: Centre of Gravity (8 cards)
  { id: 33, topic: 4, question: "Define the term 'Centre of Gravity' (CG).", answer: "The Centre of Gravity of an object is the single point through which its entire weight appears to act." },
  { id: 34, topic: 4, question: "Where is the centre of gravity of a uniform sphere or circle located?", answer: "At its geometrical centre." },
  { id: 35, topic: 4, question: "Briefly explain the plumb-line method for finding the CG of an irregular lamina.", answer: "Suspend the lamina from a pivot. Hang a plumb line from the same pivot. Draw the vertical line. Repeat from another pivot. The CG is the intersection of the two lines." },
  { id: 36, topic: 4, question: "Why must suspended objects hang so their CG is directly below the pivot?", answer: "If the CG is offset, the weight acts at a perpendicular distance from the pivot, creating a restoring moment that rotates the object until the CG is directly underneath (d = 0)." },
  { id: 37, topic: 4, question: "Can the centre of gravity of an object lie outside the physical material of the object?", answer: "Yes! Examples include a doughnut (centre of the hole), a hollow box, or a bent metal rod." },
  { id: 38, topic: 4, question: "What is a 'loaded object' and how does loading affect the CG?", answer: "An object with extra mass added to it. Adding mass shifts the overall CG towards the position of the added load." },
  { id: 39, topic: 4, question: "How does the weight of a non-uniform object affect torque calculation?", answer: "We must apply the object's entire weight at its specific CG location when calculating its moment." },
  { id: 40, topic: 4, question: "Why does a plumb line hang vertically?", answer: "Because gravity acts directly downwards along the line of action, minimizing the torque on the thread to zero." },

  // Topic 5: Stability (9 cards)
  { id: 41, topic: 5, question: "Define stability in physics.", answer: "Stability is a measure of an object's ability to return to its original position after being slightly displaced." },
  { id: 42, topic: 5, question: "State the two design factors that increase the stability of an object.", answer: "1. Lowering its Centre of Gravity (CG).\n2. Broadening its base width." },
  { id: 43, topic: 5, question: "Describe stable equilibrium.", answer: "After a slight displacement, the object returns to its original position because its weight creates a restoring moment about the contact pivot." },
  { id: 44, topic: 5, question: "Describe unstable equilibrium.", answer: "After a slight displacement, the object continues to fall/topple over because its weight creates a turning moment that pulls it further away." },
  { id: 45, topic: 5, question: "Describe neutral equilibrium.", answer: "After a displacement, the object remains in its new position because its CG height remains constant and its weight line always passes through the contact point (no moment is created)." },
  { id: 46, topic: 5, question: "What is the 'tipping rule' or critical tipping point for stability?", answer: "An object will topple over if its line of action of weight falls outside its base of support." },
  { id: 47, topic: 5, question: "Why is a double-decker bus tested by tilting it?", answer: "To ensure that its CG is low enough so that the vertical line of action of its weight does not fall outside its outer tires during sharp turns." },
  { id: 48, topic: 5, question: "Give an example of an object in neutral equilibrium.", answer: "A uniform sphere or cylinder rolling on a flat horizontal table." },
  { id: 49, topic: 5, question: "Why do racing cars have low CG heights and wide wheelbases?", answer: "To maximize stability, allowing them to turn corners at high speeds without tipping over." }
];

// --- APP STATE ---
let state = {
  activeSection: 'dashboard',
  fcMode: 'topic', // 'topic', 'shuffle', 'weak'
  fcTopic: 0,
  fcIndex: 0,
  fcList: [],
  gotItCards: [], // list of card IDs
  needReviewCards: [], // list of card IDs
  quizActive: false,
  quizStep: 0, // 0 to 29
  quizQuestions: [],
  quizAnswers: [], // user inputs
  quizScoreBreakdown: [0, 0, 0, 0, 0, 0], // cumulative score per topic (out of total lifetime questions)
  quizAttempts: 0,
  quizBestScore: null,
  quizHistory: [] // last 5 quiz scores
};

// --- INITIALIZE LOCAL STORAGE ---
function loadState() {
  const stored = localStorage.getItem('torque_lab_state');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      state = { ...state, ...parsed };
    } catch (e) {
      console.error("Error loading progress, resetting state.", e);
    }
  }
}

function saveState() {
  localStorage.setItem('torque_lab_state', JSON.stringify({
    gotItCards: state.gotItCards,
    needReviewCards: state.needReviewCards,
    quizScoreBreakdown: state.quizScoreBreakdown,
    quizAttempts: state.quizAttempts,
    quizBestScore: state.quizBestScore,
    quizHistory: state.quizHistory
  }));
}

// --- DOM ELEMENTS ---
const sections = {
  dashboard: document.getElementById('section-dashboard'),
  flashcards: document.getElementById('section-flashcards'),
  quiz: document.getElementById('section-quiz'),
  tracker: document.getElementById('section-tracker')
};

const navBtns = {
  dashboard: document.getElementById('nav-dashboard-btn'),
  flashcards: document.getElementById('nav-flashcards-btn'),
  quiz: document.getElementById('nav-quiz-btn'),
  tracker: document.getElementById('nav-tracker-btn')
};

// --- NAVIGATION CONTROLLER ---
function switchSection(secId) {
  state.activeSection = secId;
  Object.keys(sections).forEach(key => {
    if (key === secId) {
      sections[key].classList.add('active');
      navBtns[key].classList.add('active');
    } else {
      sections[key].classList.remove('active');
      navBtns[key].classList.remove('active');
    }
  });

  if (secId === 'flashcards') {
    initFlashcards();
  } else if (secId === 'tracker') {
    renderTracker();
  } else if (secId === 'dashboard') {
    renderDashboardProgress();
  }
}

// Attach Nav Listeners
Object.keys(navBtns).forEach(key => {
  navBtns[key].addEventListener('click', () => {
    if (state.quizActive && !confirm("You have a quiz in progress! Switching sections will lose your quiz data. Continue?")) {
      return;
    }
    state.quizActive = false;
    switchSection(key);
  });
});

// Topic cards click event on dashboard
document.querySelectorAll('.topic-tile').forEach(tile => {
  tile.addEventListener('click', () => {
    const topicId = parseInt(tile.getAttribute('data-topic'));
    state.fcMode = 'topic';
    state.fcTopic = topicId;
    switchSection('flashcards');
  });
});

// --- SECTION 1: DASHBOARD METER CONTROLLER ---
function renderDashboardProgress() {
  const topicCounts = [0, 0, 0, 0, 0, 0];
  const topicCorrects = [0, 0, 0, 0, 0, 0];

  // We will base dashboard progress on flashcard mastery or quiz correctness
  // O-Level specifies "shows progress indicator showing the student's quiz score for that topic (updates after the quiz is completed)"
  // So let's calculate average score per topic from the last quiz attempt or overall cumulative percentage
  for (let t = 0; t < 6; t++) {
    const scoreVal = state.quizScoreBreakdown[t] || 0;
    const attempts = state.quizAttempts;
    let percentage = 0;
    if (attempts > 0) {
      // average correct over quiz questions of that topic (each quiz has exactly 5 questions per topic)
      // total answers evaluated for topic 't' across all quizzes is attempts * 5
      percentage = Math.round((scoreVal / (attempts * 5)) * 100) || 0;
    }
    
    document.getElementById(`tile-progress-${t}`).style.width = `${percentage}%`;
    document.getElementById(`tile-perc-${t}`).textContent = `${percentage}%`;
  }
}

// --- SECTION 2: FLASHCARDS MANAGER ---
const fcSelectWrapper = document.getElementById('fc-topic-selector-wrapper');
const fcTopicSelect = document.getElementById('fc-topic-select');
const fcToggles = document.getElementById('flashcard-toggles');
const fcCard = document.getElementById('interactive-flashcard');
const fcQuestion = document.getElementById('card-question');
const fcAnswer = document.getElementById('card-answer');
const fcTagFront = document.getElementById('card-tag-front');
const fcTagBack = document.getElementById('card-tag-back');
const fcIndexText = document.getElementById('fc-index-text');
const fcGotItCount = document.getElementById('fc-got-it-count');
const fcMasteryProgress = document.getElementById('fc-mastery-progress');

const TOPIC_NAMES = [
  "Moment of a Force",
  "Perpendicular Distance",
  "Principle of Moments",
  "Reaction Force at Pivot",
  "Centre of Gravity",
  "Stability"
];

function initFlashcards() {
  // Update select input
  fcTopicSelect.value = state.fcTopic;

  // Toggle Mode buttons
  Array.from(fcToggles.children).forEach(btn => {
    if (btn.getAttribute('data-mode') === state.fcMode) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Show or hide selector depending on mode
  if (state.fcMode === 'topic') {
    fcSelectWrapper.style.display = 'flex';
  } else {
    fcSelectWrapper.style.display = 'none';
  }

  // Filter & assemble flashcard list
  if (state.fcMode === 'topic') {
    state.fcList = FLASHCARDS.filter(c => c.topic === state.fcTopic);
  } else if (state.fcMode === 'shuffle') {
    state.fcList = [...FLASHCARDS].sort(() => Math.random() - 0.5);
  } else if (state.fcMode === 'weak') {
    // Show weak cards first, then others
    const weak = FLASHCARDS.filter(c => state.needReviewCards.includes(c.id));
    const rest = FLASHCARDS.filter(c => !state.needReviewCards.includes(c.id));
    state.fcList = [...weak, ...rest];
  }

  // Bound index
  if (state.fcIndex >= state.fcList.length) {
    state.fcIndex = 0;
  }

  updateFlashcardUI();
  updateMasteryStats();
}

function updateFlashcardUI() {
  if (state.fcList.length === 0) {
    fcQuestion.textContent = "No cards available in this filter.";
    fcAnswer.textContent = "No cards available.";
    fcIndexText.textContent = "0 of 0";
    return;
  }

  // Flip card back first
  fcCard.classList.remove('flipped');

  setTimeout(() => {
    const card = state.fcList[state.fcIndex];
    fcQuestion.textContent = card.question;
    fcAnswer.textContent = card.answer;
    const topicLabel = `Topic: ${TOPIC_NAMES[card.topic]}`;
    fcTagFront.textContent = topicLabel;
    fcTagBack.textContent = topicLabel;
    fcIndexText.textContent = `Card ${state.fcIndex + 1} of ${state.fcList.length}`;
  }, 150);
}

function updateMasteryStats() {
  const mastered = state.gotItCards.length;
  fcGotItCount.textContent = mastered;
  const perc = Math.round((mastered / 50) * 100);
  fcMasteryProgress.style.width = `${perc}%`;
}

// Bind Flashcard Mode Controls
Array.from(fcToggles.children).forEach(btn => {
  btn.addEventListener('click', () => {
    state.fcMode = btn.getAttribute('data-mode');
    state.fcIndex = 0;
    initFlashcards();
  });
});

fcTopicSelect.addEventListener('change', (e) => {
  state.fcTopic = parseInt(e.target.value);
  state.fcIndex = 0;
  initFlashcards();
});

// Card Flips
fcCard.addEventListener('click', (e) => {
  // Don't flip when clicking action buttons on the back
  if (e.target.closest('.card-actions')) return;
  fcCard.classList.toggle('flipped');
});

// Got It / Review Actions
document.getElementById('card-btn-got-it').addEventListener('click', () => {
  const currentCard = state.fcList[state.fcIndex];
  if (currentCard) {
    if (!state.gotItCards.includes(currentCard.id)) {
      state.gotItCards.push(currentCard.id);
    }
    state.needReviewCards = state.needReviewCards.filter(id => id !== currentCard.id);
    saveState();
    updateMasteryStats();
    nextCard();
  }
});

document.getElementById('card-btn-review').addEventListener('click', () => {
  const currentCard = state.fcList[state.fcIndex];
  if (currentCard) {
    if (!state.needReviewCards.includes(currentCard.id)) {
      state.needReviewCards.push(currentCard.id);
    }
    state.gotItCards = state.gotItCards.filter(id => id !== currentCard.id);
    saveState();
    updateMasteryStats();
    nextCard();
  }
});

function nextCard() {
  if (state.fcList.length > 0) {
    state.fcIndex = (state.fcIndex + 1) % state.fcList.length;
    updateFlashcardUI();
  }
}

document.getElementById('fc-next-btn').addEventListener('click', nextCard);
document.getElementById('fc-prev-btn').addEventListener('click', () => {
  if (state.fcList.length > 0) {
    state.fcIndex = (state.fcIndex - 1 + state.fcList.length) % state.fcList.length;
    updateFlashcardUI();
  }
});


// --- SECTION 3: MIXED REVISION QUIZ GENERATORS ---
// Generate dynamic parameters, diagrams, solutions, and check tolerances

function generateTopic0Question() {
  // Moment of a Force (M = F * d)
  // Types: A (Find Moment), B (Find Force), C (Find Distance)
  const type = ['A', 'B', 'C'][Math.floor(Math.random() * 3)];
  let force = Math.round((10 + Math.random() * 40) * 10) / 10; // 10.0 to 50.0 N
  let dist = Math.round((0.2 + Math.random() * 1.8) * 100) / 100; // 0.20 to 2.00 m
  let moment = Math.round((force * dist) * 100) / 100;

  let description = "";
  let solution = "";
  let answerVal = 0;
  let unit = "";

  if (type === 'A') {
    description = `A heavy crowbar is used to lift a rock. If a force of <strong>${force} N</strong> is applied vertically downwards at a perpendicular distance of <strong>${dist} m</strong> from the pivot, calculate the turning moment produced.`;
    answerVal = moment;
    unit = "Nm";
    solution = `<p><strong>Given:</strong><br>Force (F) = ${force} N<br>Perpendicular Distance (d) = ${dist} m</p>
                <p><strong>Formula:</strong><br>Moment = F x d</p>
                <p><strong>Calculation:</strong><br>Moment = ${force} N x ${dist} m = <strong>${moment} Nm</strong></p>`;
  } else if (type === 'B') {
    description = `To tighten a bolt on a bicycle wheel to a required moment of <strong>${moment} Nm</strong>, a mechanic applies a force perpendicular to a spanner at a distance of <strong>${dist} m</strong> from the pivot. Find the magnitude of the force required.`;
    answerVal = force;
    unit = "N";
    solution = `<p><strong>Given:</strong><br>Moment (M) = ${moment} Nm<br>Perpendicular Distance (d) = ${dist} m</p>
                <p><strong>Formula:</strong><br>M = F x d   ==&gt;   F = M / d</p>
                <p><strong>Calculation:</strong><br>F = ${moment} / ${dist} = <strong>${force} N</strong></p>`;
  } else {
    description = `A worker pushes a heavy gate with a force of <strong>${force} N</strong> perpendicular to the hinge. If the force produces a moment of <strong>${moment} Nm</strong>, calculate the perpendicular distance from the force line of action to the pivot.`;
    answerVal = dist;
    unit = "m";
    solution = `<p><strong>Given:</strong><br>Moment (M) = ${moment} Nm<br>Force (F) = ${force} N</p>
                <p><strong>Formula:</strong><br>M = F x d   ==&gt;   d = M / F</p>
                <p><strong>Calculation:</strong><br>d = ${moment} / ${force} = <strong>${dist} m</strong></p>`;
  }

  return {
    topic: 0,
    description,
    solution,
    answerVal,
    unit,
    inputType: 'numeric',
    draw: (ctx) => {
      // Draw simple horizontal spanner/lever
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(120, 130);
      ctx.lineTo(380, 130);
      ctx.stroke();

      // Pivot
      ctx.fillStyle = '#ff9e00';
      ctx.beginPath();
      ctx.moveTo(120, 130);
      ctx.lineTo(105, 155);
      ctx.lineTo(135, 155);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText("Pivot P", 100, 175);

      // Force Vector
      ctx.strokeStyle = '#00f3ff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(360, 50);
      ctx.lineTo(360, 120);
      ctx.stroke();
      ctx.fillStyle = '#00f3ff';
      ctx.beginPath();
      ctx.moveTo(360, 125);
      ctx.lineTo(354, 115);
      ctx.lineTo(366, 115);
      ctx.closePath();
      ctx.fill();
      ctx.font = 'bold 14px Orbitron';
      ctx.fillText(`${type === 'B' ? 'F = ?' : force + ' N'}`, 375, 80);

      // Perpendicular helper line & dimension
      ctx.strokeStyle = '#ff007f';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(120, 110);
      ctx.lineTo(360, 110);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#ff007f';
      ctx.font = 'italic 12px sans-serif';
      ctx.fillText(`d = ${type === 'C' ? '?' : dist + ' m'}`, 220, 100);
    }
  };
}

function generateTopic1Question() {
  // Perpendicular Distance to line of action (without trigonometric formulas)
  const force = Math.round((10 + Math.random() * 40)); // 10 to 50 N
  const perpDist = Math.round((0.3 + Math.random() * 1.7) * 100) / 100; // 0.30 to 2.00 m
  const moment = Math.round((force * perpDist) * 100) / 100;

  const type = ['A', 'B', 'C'][Math.floor(Math.random() * 3)];
  let description = "";
  let solution = "";
  let answerVal = 0;
  let unit = "";

  if (type === 'A') {
    description = `A force of <strong>${force} N</strong> acts along a line of action as shown. The force produces a turning moment of <strong>${moment} Nm</strong> about pivot P. Find the perpendicular distance (d) from pivot P to the line of action of the force.`;
    answerVal = perpDist;
    unit = "m";
    solution = `<p><strong>Given:</strong><br>Moment (M) = ${moment} Nm<br>Force (F) = ${force} N</p>
                <p><strong>Formula:</strong><br>Moment = Force x Perpendicular Distance (d)<br>d = M / F</p>
                <p><strong>Calculation:</strong><br>d = ${moment} Nm / ${force} N = <strong>${perpDist} m</strong></p>`;
  } else if (type === 'B') {
    description = `An angled force of <strong>${force} N</strong> acts along a line of action. If the perpendicular distance (d) from pivot P to the line of action of the force is <strong>${perpDist} m</strong>, calculate the moment of the force produced about P.`;
    answerVal = moment;
    unit = "Nm";
    solution = `<p><strong>Given:</strong><br>Force (F) = ${force} N<br>Perpendicular Distance (d) = ${perpDist} m</p>
                <p><strong>Formula:</strong><br>Moment (M) = F x d</p>
                <p><strong>Calculation:</strong><br>M = ${force} N x ${perpDist} m = <strong>${moment} Nm</strong></p>`;
  } else {
    description = `A force acts along a line of action whose perpendicular distance (d) from pivot P is <strong>${perpDist} m</strong>. If the turning moment produced about P is <strong>${moment} Nm</strong>, calculate the magnitude of the force (F).`;
    answerVal = force;
    unit = "N";
    solution = `<p><strong>Given:</strong><br>Moment (M) = ${moment} Nm<br>Perpendicular Distance (d) = ${perpDist} m</p>
                <p><strong>Formula:</strong><br>Moment = F x d   ==&gt;   F = M / d</p>
                <p><strong>Calculation:</strong><br>F = ${moment} Nm / ${perpDist} m = <strong>${force} N</strong></p>`;
  }

  return {
    topic: 1,
    description,
    solution,
    answerVal,
    unit,
    inputType: 'numeric',
    draw: (ctx) => {
      // Draw tilted rod starting from pivot P
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(150, 180);
      ctx.lineTo(300, 100);
      ctx.stroke();

      // Pivot
      ctx.fillStyle = '#ff9e00';
      ctx.beginPath();
      ctx.moveTo(150, 180);
      ctx.lineTo(135, 205);
      ctx.lineTo(165, 205);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText("Pivot P", 125, 220);

      // Vertical Force Line of Action (dotted)
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(300, 60);
      ctx.lineTo(300, 210);
      ctx.stroke();
      ctx.setLineDash([]);

      // Force Vector (acts downwards along line of action)
      ctx.strokeStyle = '#00f3ff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(300, 60);
      ctx.lineTo(300, 100);
      ctx.stroke();
      // Arrowhead
      ctx.fillStyle = '#00f3ff';
      ctx.beginPath();
      ctx.moveTo(300, 105);
      ctx.lineTo(295, 95);
      ctx.lineTo(305, 95);
      ctx.closePath();
      ctx.fill();
      ctx.font = 'bold 14px Orbitron';
      ctx.fillText(type === 'C' ? 'F = ?' : `${force} N`, 315, 85);

      // Horizontal perpendicular distance indicator
      ctx.strokeStyle = '#ff007f';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(150, 180);
      ctx.lineTo(300, 180);
      ctx.stroke();
      
      // Right angle square at (300, 180)
      ctx.strokeStyle = '#ff007f';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(285, 165, 15, 15);

      ctx.fillStyle = '#ff007f';
      ctx.font = 'italic 12px sans-serif';
      ctx.fillText(type === 'A' ? 'd = ?' : `d = ${perpDist} m`, 200, 170);
      ctx.fillStyle = '#94a3b8';
      ctx.fillText("Line of Action", 295, 225);
    }
  };
}

function generateTopic2And3Question() {
  // Beams & Principle of Moments + Reaction support. (Topics 2/3/4 combined)
  const type = ['A', 'B', 'C'][Math.floor(Math.random() * 3)];
  const beamWeight = 10; // 10 N
  const p1_dist = Math.round((0.2 + Math.random() * 0.6) * 10) / 10; // 0.2 to 0.8 m
  const p1_force = Math.round(15 + Math.random() * 15); // 15 to 30 N
  // For equilibrium: F1 * d1 = F2 * d2. Make F2 variable
  const p2_dist = Math.round((0.3 + Math.random() * 0.7) * 10) / 10;
  const p2_force = Math.round((p1_force * p1_dist) / p2_dist);
  const correct_p2_force = Math.round((p1_force * p1_dist) / p2_dist * 10) / 10;

  // Total reaction force R = weight of beam + loads
  const R = Math.round((beamWeight + p1_force + correct_p2_force) * 10) / 10;

  let description = "";
  let solution = "";
  let answerVal = 0;
  let unit = "";

  if (type === 'A') {
    description = `A uniform plank of weight <strong>${beamWeight} N</strong> balances horizontally on a pivot at its center. A mass of weight <strong>${p1_force} N</strong> is placed <strong>${p1_dist} m</strong> to the left of the pivot. Find the force (F) that must be applied at a distance of <strong>${p2_dist} m</strong> to the right to maintain rotational equilibrium.`;
    answerVal = correct_p2_force;
    unit = "N";
    solution = `<p><strong>Rotational Equilibrium:</strong><br>Clockwise Moments = Anticlockwise Moments about pivot.</p>
                <p><strong>Equation:</strong><br>F x ${p2_dist} m = ${p1_force} N x ${p1_dist} m<br>F = (${p1_force} x ${p1_dist}) / ${p2_dist} = <strong>${correct_p2_force} N</strong></p>
                <p><strong>Pivot Reaction Force (R):</strong><br>Under translational equilibrium (Upward Force = Downward Forces):<br>R = F_left + F_right + W_beam = ${p1_force} N + ${correct_p2_force} N + ${beamWeight} N = <strong>${R} N</strong></p>`;
  } else if (type === 'B') {
    description = `A uniform plank of weight <strong>${beamWeight} N</strong> is balanced at its midpoint. A load of <strong>${p1_force} N</strong> is placed <strong>${p1_dist} m</strong> to the left of the pivot. An unknown load F is placed to the right to balance it. If the upward reaction force supporting the pivot is <strong>${R} N</strong>, calculate the distance from the pivot at which F is placed.`;
    answerVal = p2_dist;
    unit = "m";
    solution = `<p><strong>Translational Equilibrium:</strong><br>Total Upward Force = Total Downward Forces<br>R = F_left + F_right + W_beam<br>${R} = ${p1_force} + F_right + ${beamWeight}  ==&gt;  F_right = ${correct_p2_force} N</p>
                <p><strong>Rotational Equilibrium:</strong><br>CW Moment = ACW Moment<br>${correct_p2_force} N x d_2 = ${p1_force} N x ${p1_dist} m<br>d_2 = (${p1_force} x ${p1_dist}) / ${correct_p2_force} = <strong>${p2_dist} m</strong></p>`;
  } else {
    description = `A uniform horizontal wooden plank of weight <strong>${beamWeight} N</strong> is pivoted at its center. A load of <strong>${p1_force} N</strong> is placed <strong>${p1_dist} m</strong> to the left, and a load of <strong>${correct_p2_force} N</strong> balances it at <strong>${p2_dist} m</strong> to the right. State the vertical reaction force (R) acting at the pivot support.`;
    answerVal = R;
    unit = "N";
    solution = `<p><strong>Given:</strong><br>Downward load 1 = ${p1_force} N<br>Downward load 2 = ${correct_p2_force} N<br>Plank weight = ${beamWeight} N</p>
                <p><strong>Translational Equilibrium:</strong><br>Upward Reaction Force (R) = Sum of all vertical downward loads<br>R = ${p1_force} N + ${correct_p2_force} N + ${beamWeight} N = <strong>${R} N</strong></p>`;
  }

  return {
    topic: 2, // Map to topic index 2 (Principle of Moments) or 3 (Reaction force)
    description,
    solution,
    answerVal,
    unit,
    inputType: 'numeric',
    draw: (ctx) => {
      // Draw balanced wooden plank
      ctx.fillStyle = '#b45309';
      ctx.fillRect(80, 120, 340, 15);

      // Support Pivot
      ctx.fillStyle = '#ff9e00';
      ctx.beginPath();
      ctx.moveTo(250, 135);
      ctx.lineTo(235, 165);
      ctx.lineTo(265, 165);
      ctx.closePath();
      ctx.fill();

      // Left Box
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(140, 95, 30, 25);
      ctx.fillStyle = '#060913';
      ctx.font = '11px sans-serif';
      ctx.fillText(`${p1_force}N`, 142, 112);

      // Right Box
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(320, 95, 30, 25);
      ctx.fillStyle = '#060913';
      ctx.fillText(type === 'A' ? 'F' : `${correct_p2_force}N`, 322, 112);

      // Distances indicator lines
      ctx.strokeStyle = '#00f3ff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(155, 150);
      ctx.lineTo(250, 150);
      ctx.stroke();
      ctx.fillText(`${p1_dist}m`, 190, 145);

      ctx.beginPath();
      ctx.moveTo(250, 150);
      ctx.lineTo(335, 150);
      ctx.stroke();
      ctx.fillText(type === 'B' ? 'd = ?' : `${p2_dist}m`, 280, 145);
    }
  };
}

function generateTopic3ReactionQuestion() {
  // Reaction Force specific (Topic 3)
  const pivotPosLeft = 0.3; // pivot is 0.3m from left end of a 1.5m beam
  const beamWeight = Math.round((5 + Math.random() * 10) * 10) / 10; // weight of beam, e.g., 8.5 N (acts at 0.75m)
  const loadF = Math.round(10 + Math.random() * 20); // external load force

  // Calculations for Reaction
  // This is a direct test of the translational balance.
  const reactionForce = Math.round((beamWeight + loadF) * 10) / 10;

  const description = `A non-uniform rod has a total weight of <strong>${beamWeight} N</strong>. It is supported by a single pivot, and a heavy mass exerting a downward force of <strong>${loadF} N</strong> is placed directly on it. If the rod remains perfectly balanced and horizontal, what is the upward reaction force (R) provided by the pivot?`;

  return {
    topic: 3,
    description,
    solution: `<p><strong>Concept:</strong><br>Regardless of how the loads are balanced or placed, the upward force at the pivot support must balance all downward gravitational forces for vertical equilibrium.</p>
               <p><strong>Forces Acting Downward:</strong><br>Weight of Rod = ${beamWeight} N<br>Applied Load = ${loadF} N</p>
               <p><strong>Calculation:</strong><br>R = W_rod + F_load = ${beamWeight} N + ${loadF} N = <strong>${reactionForce} N</strong></p>`,
    answerVal: reactionForce,
    unit: "N",
    inputType: 'numeric',
    draw: (ctx) => {
      // Beam
      ctx.fillStyle = '#64748b';
      ctx.fillRect(80, 120, 340, 15);

      // Support Pivot
      ctx.fillStyle = '#ff9e00';
      ctx.beginPath();
      ctx.moveTo(170, 135);
      ctx.lineTo(155, 165);
      ctx.lineTo(185, 165);
      ctx.closePath();
      ctx.fill();

      // Downward load indicator
      ctx.strokeStyle = '#00f3ff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(280, 60);
      ctx.lineTo(280, 110);
      ctx.stroke();
      ctx.fillStyle = '#00f3ff';
      ctx.beginPath();
      ctx.moveTo(280, 115);
      ctx.lineTo(275, 105);
      ctx.lineTo(285, 105);
      ctx.closePath();
      ctx.fill();
      ctx.fillText(`${loadF} N`, 295, 85);

      // Pivot support vector upward
      ctx.strokeStyle = '#ff007f';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(170, 170);
      ctx.lineTo(170, 140);
      ctx.stroke();
      ctx.fillStyle = '#ff007f';
      ctx.fillText("R = ?", 145, 190);
    }
  };
}

function generateTopic4CGQuestion() {
  // Centre of Gravity (Topic 4)
  const items = [
    {
      q: "Where is the centre of gravity of a thin, uniform circular metal sheet situated?",
      a: "At the geometric centre",
      options: ["At the geometric centre", "At the bottom edge", "Outside the sheet", "It varies depending on weight"],
      sol: "For a uniform object with a symmetrical shape, the centre of gravity lies exactly at its geometrical center."
    },
    {
      q: "What instrument is used to determine the direction of vertical lines when locating the CG of a lamina?",
      a: "Plumb line",
      options: ["Plumb line", "Spirit level", "Protractor", "Newtonmeter"],
      sol: "A plumb line consists of a light string with a heavy weight (bob) suspended. Due to gravity, the string always aligns perfectly vertically."
    },
    {
      q: "If a uniform meter rule of weight 2N is loaded with a 3N weight at the 20cm mark, how far from the 0cm end is the new CG?",
      a: "38",
      type: "numeric",
      unit: "cm",
      sol: `<p><strong>Taking moments about the 0cm mark:</strong><br>CG location = Sum(w_i x x_i) / Sum(w_i)</p>
            <p>1. Rule weight (2N) acts at 50cm mark: 2 N x 50 cm = 100 Ncm<br>2. Extra load (3N) acts at 20cm mark: 3 N x 20 cm = 60 Ncm<br>3. Total weight = 2 N + 3 N = 5 N</p>
            <p><strong>Calculation:</strong><br>New CG = (100 + 60) / 5 = 160 / 5 = <strong>38 cm</strong></p>`
    }
  ];

  const chosen = items[Math.floor(Math.random() * items.length)];

  if (chosen.type === 'numeric') {
    return {
      topic: 4,
      description: chosen.q,
      solution: chosen.sol,
      answerVal: parseFloat(chosen.a),
      unit: chosen.unit,
      inputType: 'numeric',
      draw: (ctx) => {
        // Draw meter rule with loads
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(80, 120, 340, 15);
        // Tick marks
        ctx.fillStyle = '#0f172a';
        for (let i = 0; i <= 10; i++) {
          ctx.fillRect(80 + i * 34, 120, 2, 6);
        }
        ctx.font = '9px sans-serif';
        ctx.fillText("0cm", 75, 150);
        ctx.fillText("100cm", 400, 150);

        // Load at 20cm (offset from 80 by 0.2 * 340 = 68px => 148px)
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(148, 90, 20, 30);
        ctx.fillStyle = '#ffffff';
        ctx.fillText("3N", 152, 108);
      }
    };
  } else {
    return {
      topic: 4,
      description: chosen.q,
      solution: chosen.sol,
      answerVal: chosen.a,
      options: chosen.options,
      inputType: 'mcq',
      draw: (ctx) => {
        // Draw irregular lamina suspended with plumb line
        ctx.strokeStyle = '#94a3b8';
        ctx.beginPath();
        ctx.arc(250, 130, 40, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#ff007f';
        ctx.beginPath();
        ctx.arc(250, 90, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#00f3ff';
        ctx.beginPath();
        ctx.moveTo(250, 90);
        ctx.lineTo(250, 210);
        ctx.stroke();

        // Plumb bob
        ctx.fillStyle = '#00f3ff';
        ctx.beginPath();
        ctx.arc(250, 210, 8, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillText("Plumb Line", 265, 170);
      }
    };
  }
}

function generateTopic5StabilityQuestion() {
  // Stability (Topic 5)
  const items = [
    {
      q: "A high-stability block has a broad base and low CG. If it is tilted slightly so its CG rises, what type of equilibrium is it in?",
      a: "Stable equilibrium",
      options: ["Stable equilibrium", "Unstable equilibrium", "Neutral equilibrium", "Unbalanced state"],
      sol: "In stable equilibrium, a slight tilt raises the CG, creating a restoring torque that returns the object to its original base position."
    },
    {
      q: "A block with a square base of width <strong>4 cm</strong> has its Centre of Gravity at a height of <strong>10 cm</strong>. Calculate the critical angle of tilt at which the block will just topple.",
      a: "11.3",
      type: "numeric",
      unit: "degrees",
      sol: `<p><strong>Concept:</strong><br>A block starts to topple when the vertical line of action of its weight falls outside its base edge.</p>
            <p><strong>Geometry:</strong><br>The base half-width is w / 2 = 4 / 2 = 2 cm.<br>The height of the CG is h = 10 cm.</p>
            <p><strong>Formula:</strong><br>Critical angle = tan^-1((w / 2) / h)</p>
            <p><strong>Calculation:</strong><br>Angle = tan^-1(2 / 10) = tan^-1(0.2) = <strong>11.3 degrees</strong></p>`
    }
  ];

  const chosen = items[Math.floor(Math.random() * items.length)];

  if (chosen.type === 'numeric') {
    return {
      topic: 5,
      description: chosen.q,
      solution: chosen.sol,
      answerVal: parseFloat(chosen.a),
      unit: chosen.unit,
      inputType: 'numeric',
      draw: (ctx) => {
        // Draw tilted block showing base width and height to CG
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.strokeRect(200, 70, 80, 130);

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(240, 135, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillText("CG (h=10cm)", 255, 140);
        ctx.fillText("Base (w=4cm)", 205, 215);
      }
    };
  } else {
    return {
      topic: 5,
      description: chosen.q,
      solution: chosen.sol,
      answerVal: chosen.a,
      options: chosen.options,
      inputType: 'mcq',
      draw: (ctx) => {
        // Draw stable block tilting
        ctx.strokeStyle = '#00f3ff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(180, 200);
        ctx.lineTo(240, 110);
        ctx.lineTo(320, 160);
        ctx.lineTo(260, 250);
        ctx.closePath();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.fillText("Tilted position", 210, 180);
      }
    };
  }
}

// Map generators to topic indices
const QUESTION_GENERATORS = [
  generateTopic0Question,
  generateTopic1Question,
  generateTopic2And3Question,
  generateTopic3ReactionQuestion,
  generateTopic4CGQuestion,
  generateTopic5StabilityQuestion
];

function buildQuizQuestionPool() {
  const pool = [];
  // 5 questions per topic = 30 questions total
  for (let topicId = 0; topicId < 6; topicId++) {
    const generator = QUESTION_GENERATORS[topicId];
    for (let count = 0; count < 5; count++) {
      pool.push(generator());
    }
  }
  // Shuffle overall pool
  return pool.sort(() => Math.random() - 0.5);
}

// --- QUIZ VIEW RENDERER ---
const quizIntro = document.getElementById('quiz-intro-screen');
const quizPlay = document.getElementById('quiz-play-screen');
const quizResults = document.getElementById('quiz-results-screen');
const quizProgressText = document.getElementById('quiz-progress-text');
const quizProgressFill = document.getElementById('quiz-progress-fill');
const quizTopicLabel = document.getElementById('quiz-question-topic');
const quizDesc = document.getElementById('quiz-question-description');
const quizInputZone = document.getElementById('quiz-answer-input-zone');
const quizSubmitBtn = document.getElementById('quiz-submit-btn');
const quizSolutionBox = document.getElementById('quiz-solution-box');
const solutionStatusText = document.getElementById('solution-status-text');
const solutionExplanation = document.getElementById('solution-explanation');
const quizNextBtn = document.getElementById('quiz-next-btn');

document.getElementById('start-quiz-btn').addEventListener('click', startNewQuiz);
document.getElementById('quiz-restart-btn').addEventListener('click', startNewQuiz);
document.getElementById('quiz-view-flashcards-btn').addEventListener('click', () => {
  state.fcMode = 'weak';
  switchSection('flashcards');
});

function startNewQuiz() {
  state.quizActive = true;
  state.quizStep = 0;
  state.quizQuestions = buildQuizQuestionPool();
  state.quizAnswers = [];

  quizIntro.classList.remove('active');
  quizResults.classList.remove('active');
  quizPlay.classList.add('active');

  loadQuestionStep();
}

function loadQuestionStep() {
  const q = state.quizQuestions[state.quizStep];
  quizProgressText.textContent = `Question ${state.quizStep + 1} of 30`;
  const progressPerc = ((state.quizStep + 1) / 30) * 100;
  quizProgressFill.style.width = `${progressPerc}%`;

  quizTopicLabel.textContent = `Topic: ${TOPIC_NAMES[q.topic]}`;
  quizDesc.innerHTML = q.description;

  // Render canvas diagram
  const canvas = document.getElementById('quiz-diagram');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  q.draw(ctx);

  // Render input controls
  quizInputZone.innerHTML = "";
  if (q.inputType === 'numeric') {
    const wrap = document.createElement('div');
    wrap.className = 'numeric-input-wrapper';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'quiz-num-input';
    input.placeholder = `e.g., 12.5 ${q.unit}`;
    input.id = 'quiz-numeric-input';
    
    wrap.appendChild(input);
    quizInputZone.appendChild(wrap);

    // Enter key submit
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submitQuizAnswer();
    });
  } else {
    // MCQ
    const grid = document.createElement('div');
    grid.className = 'mcq-grid';
    q.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'mcq-option';
      btn.innerHTML = `<span class="mcq-marker">${String.fromCharCode(65 + idx)}</span> <span class="mcq-text">${opt}</span>`;
      btn.addEventListener('click', () => {
        Array.from(grid.children).forEach(o => o.classList.remove('selected'));
        btn.classList.add('selected');
      });
      grid.appendChild(btn);
    });
    quizInputZone.appendChild(grid);
  }

  // Reset Solution Box
  quizSolutionBox.classList.add('hidden');
  quizSubmitBtn.style.display = 'inline-flex';
}

function normalizeUnit(unitStr) {
  const u = unitStr.trim().toLowerCase();
  if (u === 'nm') return 'Nm';
  if (u === 'n') return 'N';
  if (u === 'm') return 'm';
  if (u === 'cm') return 'cm';
  if (u === 'degrees' || u === 'deg' || u === '°' || u === 'degree') return 'degrees';
  return u;
}

quizSubmitBtn.addEventListener('click', submitQuizAnswer);

function submitQuizAnswer() {
  const q = state.quizQuestions[state.quizStep];
  let isCorrect = false;
  let userVal = "";

  if (q.inputType === 'numeric') {
    const input = document.getElementById('quiz-numeric-input');
    if (!input.value) {
      alert("Please enter an answer with its unit (e.g. 15 N).");
      return;
    }
    const match = input.value.trim().match(/^\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*([a-zA-Z°]+)\s*$/);
    if (!match) {
      alert(`Please enter a number followed by its unit (e.g., "12.5 ${q.unit}").`);
      return;
    }
    userVal = parseFloat(match[1]);
    const userUnit = match[2];

    const expectedUnit = normalizeUnit(q.unit);
    const providedUnit = normalizeUnit(userUnit);

    if (expectedUnit !== providedUnit) {
      isCorrect = false;
    } else {
      // Check with ±2% tolerance
      const diff = Math.abs(userVal - q.answerVal);
      const maxDiff = Math.abs(q.answerVal) * 0.02;
      isCorrect = diff <= maxDiff;
    }
  } else {
    // MCQ
    const selected = quizInputZone.querySelector('.mcq-option.selected');
    if (!selected) {
      alert("Please select one of the options.");
      return;
    }
    userVal = selected.querySelector('.mcq-text').textContent;
    isCorrect = (userVal === q.answerVal);
  }

  // Record Answer state
  state.quizAnswers.push({ userVal, isCorrect, topic: q.topic });

  // Update solution box
  solutionStatusText.className = `solution-status-indicator ${isCorrect ? 'correct' : 'incorrect'}`;
  solutionStatusText.textContent = isCorrect ? "CORRECT" : "INCORRECT";
  solutionExplanation.innerHTML = `${isCorrect ? 'Awesome job!' : 'Not quite. Here is how to solve it:'} <br><br> ${q.solution}`;

  if (isCorrect) {
    triggerCelebration();
  }

  quizSolutionBox.classList.remove('hidden');
  quizSubmitBtn.style.display = 'none';
}

quizNextBtn.addEventListener('click', () => {
  state.quizStep++;
  if (state.quizStep < 30) {
    loadQuestionStep();
  } else {
    finishQuiz();
  }
});

function finishQuiz() {
  state.quizActive = false;
  state.quizAttempts++;

  // Calculate results
  const totalCorrect = state.quizAnswers.filter(ans => ans.isCorrect).length;
  if (state.quizBestScore === null || totalCorrect > state.quizBestScore) {
    state.quizBestScore = totalCorrect;
  }

  // Update history (max 5)
  state.quizHistory.push(totalCorrect);
  if (state.quizHistory.length > 5) {
    state.quizHistory.shift();
  }

  // Update breakdown
  state.quizAnswers.forEach(ans => {
    if (ans.isCorrect) {
      state.quizScoreBreakdown[ans.topic]++;
    }
  });

  saveState();

  // Load results screen UI
  quizPlay.classList.remove('active');
  quizResults.classList.add('active');

  document.getElementById('result-score-ratio').textContent = `${totalCorrect}/30`;
  const perc = Math.round((totalCorrect / 30) * 100);
  document.getElementById('result-score-perc').textContent = `${perc}%`;

  // Grade Message
  const gradeText = document.getElementById('result-grade-heading');
  const gradeDesc = document.getElementById('result-grade-desc');
  if (totalCorrect >= 25) {
    gradeText.textContent = "Excellent";
    gradeText.style.color = 'var(--accent-green)';
    gradeDesc.textContent = "You are ready for your O-Level exam on this topic!";
  } else if (totalCorrect >= 15) {
    gradeText.textContent = "Good Effort";
    gradeText.style.color = 'var(--accent-amber)';
    gradeDesc.textContent = "Focus on your weak topics and try again.";
  } else {
    gradeText.textContent = "Keep Practising";
    gradeText.style.color = 'var(--accent-magenta)';
    gradeDesc.textContent = "Revisit the flashcard bank in Section 2.";
  }

  // Topic breakdown listing
  const topicList = document.getElementById('result-topic-list');
  topicList.innerHTML = "";
  
  // Find weak topic (the one with lowest correct score in this test)
  let lowestTopicScore = 6;
  let lowestTopicId = 0;

  const thisQuizBreakdown = [0, 0, 0, 0, 0, 0];
  state.quizAnswers.forEach(ans => {
    if (ans.isCorrect) {
      thisQuizBreakdown[ans.topic]++;
    }
  });

  for (let t = 0; t < 6; t++) {
    const score = thisQuizBreakdown[t];
    if (score < lowestTopicScore) {
      lowestTopicScore = score;
      lowestTopicId = t;
    }

    const item = document.createElement('div');
    item.className = 'topic-score-item';
    
    let colorClass = "high";
    if (score <= 2) colorClass = "low";
    else if (score <= 4) colorClass = "mid";

    item.innerHTML = `<span class="topic-score-name">${TOPIC_NAMES[t]}</span>
                      <span class="topic-score-value ${colorClass}">${score}/5</span>`;
    topicList.appendChild(item);
  }

  // Recommendation box
  const recText = document.getElementById('result-recommendation-text');
  recText.innerHTML = `We recommend that you revisit the topic <strong>"${TOPIC_NAMES[lowestTopicId]}"</strong> in the Flashcards section to strengthen your concepts.`;
}

// --- SECTION 4: PROGRESS TRACKER MANAGER ---
const barChart = document.getElementById('attempts-bar-chart');
const trackerTopicList = document.getElementById('tracker-topic-list');

function renderTracker() {
  document.getElementById('stat-total-attempts').textContent = state.quizAttempts;
  document.getElementById('stat-best-score').textContent = state.quizBestScore !== null ? `${state.quizBestScore}/30` : 'N/A';

  // Find strongest and weakest topics based on lifetime percentages
  let maxPerc = -1;
  let minPerc = 101;
  let strongest = "N/A";
  let weakest = "N/A";

  const attempts = state.quizAttempts;

  if (attempts > 0) {
    for (let t = 0; t < 6; t++) {
      const scoreVal = state.quizScoreBreakdown[t] || 0;
      const totalPossible = attempts * 5;
      const perc = Math.round((scoreVal / totalPossible) * 100);
      if (perc > maxPerc) {
        maxPerc = perc;
        strongest = TOPIC_NAMES[t];
      }
      if (perc < minPerc) {
        minPerc = perc;
        weakest = TOPIC_NAMES[t];
      }
    }
  }

  document.getElementById('stat-strongest-topic').textContent = strongest;
  document.getElementById('stat-weakest-topic').textContent = weakest;

  // Render Bar Chart (Last 5 attempts)
  barChart.innerHTML = "";
  if (state.quizHistory.length === 0) {
    barChart.innerHTML = `<div class="chart-empty-state" id="chart-placeholder">No attempts logged yet. Complete a quiz to view history!</div>`;
  } else {
    state.quizHistory.forEach((score, idx) => {
      const wrap = document.createElement('div');
      wrap.className = 'chart-bar-wrapper';

      const heightPerc = (score / 30) * 100;

      const bar = document.createElement('div');
      bar.className = 'chart-bar';
      bar.style.height = `${heightPerc}%`;
      bar.innerHTML = `<span class="chart-bar-value">${score}</span>`;

      const label = document.createElement('span');
      label.className = 'chart-bar-label';
      label.textContent = `Quiz #${state.quizAttempts - state.quizHistory.length + idx + 1}`;

      wrap.appendChild(bar);
      wrap.appendChild(label);
      barChart.appendChild(wrap);
    });
  }

  // Render cumulative topic list
  trackerTopicList.innerHTML = "";
  for (let t = 0; t < 6; t++) {
    const scoreVal = state.quizScoreBreakdown[t] || 0;
    const totalPossible = attempts > 0 ? (attempts * 5) : 1;
    const perc = attempts > 0 ? Math.round((scoreVal / totalPossible) * 100) : 0;

    const div = document.createElement('div');
    div.className = 'breakdown-item';
    div.innerHTML = `<div class="breakdown-meta">
                       <span class="breakdown-topic">${TOPIC_NAMES[t]}</span>
                       <span class="breakdown-score">${perc}% (${scoreVal}/${attempts > 0 ? (attempts * 5) : 0})</span>
                     </div>
                     <div class="progress-bar-container">
                       <div class="progress-bar-fill" style="width: ${perc}%"></div>
                     </div>`;
    trackerTopicList.appendChild(div);
  }
}

// Reset Database Progress
document.getElementById('btn-reset-progress').addEventListener('click', () => {
  if (confirm("Are you sure you want to reset all quiz scores, history, and flashcard markers? This action is irreversible.")) {
    state = {
      ...state,
      gotItCards: [],
      needReviewCards: [],
      quizScoreBreakdown: [0, 0, 0, 0, 0, 0],
      quizAttempts: 0,
      quizBestScore: null,
      quizHistory: []
    };
    saveState();
    renderTracker();
    alert("Database successfully wiped.");
  }
});

// --- PARTICLES / CELEBRATION EFFECT ---
const pCanvas = document.getElementById('particles-canvas');
const pCtx = pCanvas.getContext('2d');
let particles = [];

function resizeCanvas() {
  pCanvas.width = window.innerWidth;
  pCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 4 + 2;
    this.speedX = Math.random() * 6 - 3;
    this.speedY = Math.random() * -5 - 2;
    this.color = ['#00f3ff', '#ff007f', '#39ff14', '#bd00ff'][Math.floor(Math.random() * 4)];
    this.alpha = 1;
    this.decay = Math.random() * 0.02 + 0.015;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.speedY += 0.1; // gravity
    this.alpha -= this.decay;
  }
  draw() {
    pCtx.save();
    pCtx.globalAlpha = this.alpha;
    pCtx.fillStyle = this.color;
    pCtx.beginPath();
    pCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    pCtx.fill();
    pCtx.restore();
  }
}

function triggerCelebration() {
  // spawn particles from bottom center
  const startX = window.innerWidth / 2;
  const startY = window.innerHeight * 0.8;
  for (let i = 0; i < 40; i++) {
    particles.push(new Particle(startX, startY));
  }
}

function animateParticles() {
  pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
  particles.forEach((p, idx) => {
    p.update();
    p.draw();
    if (p.alpha <= 0) {
      particles.splice(idx, 1);
    }
  });
  requestAnimationFrame(animateParticles);
}
animateParticles();

// --- STARTUP LOGIC ---
loadState();
renderDashboardProgress();
updateMasteryStats();
