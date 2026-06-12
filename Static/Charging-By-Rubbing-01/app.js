// --- STATE MANAGEMENT ---
const state = {
  activeSection: 'section-concept',
  
  // Section 1: Concept Intro
  conceptStep: 0,
  
  // Section 2 Part A: Simulator
  simElectronsTransferred: 0,
  simInteractionCount: 0,
  isRubbing: false,

  // Section 2 Part B: Practice Game
  practiceScore: 0,
  practiceAttempts: 0,
  currentScenario: null,
  practiceSelected: { left: null, right: null },
  practiceChecked: false,

  // Section 3: MCQ Quiz
  quizPool: [],
  quizSelected: [],
  currentQuizIndex: 0,
  quizScore: 0,
  quizAnswered: false,

  // Section 5: Flashcards
  flashcardsDeck: [],
  currentCardIndex: 0,
  cardFlipped: false
};

// --- DATA STRUCTURES ---

// Material scenarios for Practice Game (Part B)
const Scenarios = [
  {
    pair: 'polythene-wool',
    m1: 'Polythene Rod',
    m2: 'Wool Cloth',
    m1Type: 'rod',
    m2Type: 'cloth',
    loses: 'm2', // Wool loses electrons
    explanation: 'When a Polythene Rod is rubbed with a Wool Cloth, electrons are transferred from the wool to the polythene. Since the Wool Cloth loses negative electrons, it becomes positively charged (+). The Polythene Rod gains these electrons, so it becomes negatively charged (−).'
  },
  {
    pair: 'glass-silk',
    m1: 'Glass Rod',
    m2: 'Silk Cloth',
    m1Type: 'rod',
    m2Type: 'cloth',
    loses: 'm1', // Glass loses electrons
    explanation: 'When a Glass Rod is rubbed with a Silk Cloth, electrons are transferred from the glass to the silk. The Glass Rod loses negative electrons, leaving it with excess positive charge (+). The Silk Cloth gains these electrons, becoming negatively charged (−).'
  },
  {
    pair: 'perspex-fur',
    m1: 'Perspex Rod',
    m2: 'Fur',
    m1Type: 'rod',
    m2Type: 'cloth',
    loses: 'm2', // Fur loses electrons
    explanation: 'When a Perspex Rod is rubbed with Fur, electrons are transferred from the fur to the perspex. The Fur loses negative electrons and becomes positively charged (+). The Perspex Rod gains these electrons, acquiring a negative charge (−).'
  }
];

// 30 O-Level Static Electricity Questions Pool (Syllabus 6091)
const MCQPool = [
  {
    text: "Which of the following particles actually move when an insulator is charged by rubbing?",
    options: ["Protons only", "Electrons only", "Neutrons only", "Both protons and electrons"],
    correct: 1,
    explanation: "Only negative electrons move. Protons are tightly bound in the nucleus of atoms and cannot be transferred by rubbing."
  },
  {
    text: "An object is rubbed and becomes positively charged. What occurred during the rubbing process?",
    options: [
      "It gained protons from the other object.",
      "It lost protons to the other object.",
      "It gained electrons from the other object.",
      "It lost electrons to the other object."
    ],
    correct: 3,
    explanation: "Losing negative electrons leaves the object with an excess of positive charges (protons), making it positively charged."
  },
  {
    text: "A polythene rod is rubbed with a dry woolen cloth. Which statement correctly describes the charges after rubbing?",
    options: [
      "Rod: negative, Cloth: positive",
      "Rod: positive, Cloth: negative",
      "Rod: negative, Cloth: neutral",
      "Rod: positive, Cloth: positive"
    ],
    correct: 0,
    explanation: "Electrons transfer from the wool cloth to the polythene rod. Thus, the rod gains electrons (negative) and the cloth loses electrons (positive)."
  },
  {
    text: "During charging by rubbing, what happens to the total electric charge of the system (both objects combined)?",
    options: [
      "It increases because friction creates new charges.",
      "It decreases because charges are destroyed by friction.",
      "It remains constant because charge is conserved.",
      "It fluctuates depending on how hard they are rubbed."
    ],
    correct: 2,
    explanation: "According to the Law of Conservation of Charge, charges cannot be created or destroyed, only transferred. The total charge remains constant."
  },
  {
    text: "Why is a neutral object said to have no net charge?",
    options: [
      "It contains absolutely no protons or electrons.",
      "It contains only neutrons.",
      "It contains equal numbers of positive and negative charges.",
      "Its electrons are locked and cannot move."
    ],
    correct: 2,
    explanation: "Neutral objects contain vast numbers of protons (+) and electrons (−), but they are present in equal numbers, canceling each other out."
  },
  {
    text: "Which of the following is the SI unit of electric charge?",
    options: ["Ampere (A)", "Volt (V)", "Coulomb (C)", "Ohm (Ω)"],
    correct: 2,
    explanation: "The Coulomb (C) is the SI unit of electric charge. Ampere is for current, Volt is for potential difference, and Ohm is for resistance."
  },
  {
    text: "A glass rod is rubbed with silk and becomes positively charged. What charge does the silk cloth acquire?",
    options: [
      "An equal positive charge",
      "An equal negative charge",
      "A smaller negative charge",
      "It remains neutral"
    ],
    correct: 1,
    explanation: "Due to conservation of charge, the number of electrons lost by the glass rod is exactly equal to the number gained by the silk cloth, resulting in equal and opposite charges."
  },
  {
    text: "What type of particles are located in the nucleus of an atom, and what is their charge?",
    options: [
      "Electrons (negative) and Protons (positive)",
      "Protons (positive) and Neutrons (neutral)",
      "Electrons (negative) and Neutrons (neutral)",
      "Protons (negative) and Neutrons (positive)"
    ],
    correct: 1,
    explanation: "The nucleus contains positive protons and neutral neutrons. Electrons circle the nucleus and are easily transferred."
  },
  {
    text: "Why are metals (conductors) difficult to charge by rubbing while holding them in your bare hand?",
    options: [
      "Metals cannot gain or lose electrons.",
      "Rubbing metals destroys any charge created.",
      "Metals conduct any transferred charge away through your hand to the ground.",
      "Metals are too hard to experience friction."
    ],
    correct: 2,
    explanation: "Metals are conductors. Any electrons gained or lost are immediately replaced or drained through your body to the earth (grounding)."
  },
  {
    text: "Which of the following materials is an insulator that can be easily charged by rubbing?",
    options: ["Copper rod", "Aluminium foil", "Perspex rod", "Iron nail"],
    correct: 2,
    explanation: "Perspex is an insulator. Insulators hold static charges in localized areas because electrons cannot flow easily through them."
  },
  {
    text: "If a charged object is brought near a neutral conductor, the charges in the conductor separate. What is this process called?",
    options: ["Charging by rubbing", "Electrostatic induction", "Conduction", "Grounding"],
    correct: 1,
    explanation: "Electrostatic induction is the process of charging or separating charges in a neutral conductor by bringing a charged object near it (without contact)."
  },
  {
    text: "A negatively charged balloon is placed near a neutral wooden wall. The balloon sticks to the wall. Why?",
    options: [
      "Wooden walls are magnetic.",
      "The balloon transfers all its electrons to the wall immediately.",
      "The balloon induces a positive charge on the surface of the wall, causing attraction.",
      "Gravity is weaker than the mass of the wood."
    ],
    correct: 2,
    explanation: "The negative balloon repels electrons in the wall's surface atoms, leaving the surface layer positive. The positive surface then attracts the negative balloon."
  },
  {
    text: "Which of the following statements about charging by rubbing is TRUE?",
    options: [
      "Only positive charges are transferred.",
      "Friction creates new protons in the material.",
      "Insulators cannot be charged by rubbing.",
      "Only negative charges (electrons) are transferred."
    ],
    correct: 3,
    explanation: "Charging by rubbing involves ONLY the transfer of negative electrons. Protons remain fixed in their atomic nuclei."
  },
  {
    text: "An object has a net charge of -3.2 × 10^-19 C. Approximately how many excess electrons does it have? (1 electron = -1.6 × 10^-19 C)",
    options: ["1 electron", "2 electrons", "3 electrons", "20 electrons"],
    correct: 1,
    explanation: "Number of electrons = Total charge / Charge of 1 electron = (-3.2 × 10^-19) / (-1.6 × 10^-19) = 2 excess electrons."
  },
  {
    text: "If you rub an acetate rod with dry wool, the rod becomes positively charged. Which statement is correct?",
    options: [
      "The wool gained electrons.",
      "The rod gained protons.",
      "The rod gained electrons.",
      "The wool lost electrons."
    ],
    correct: 0,
    explanation: "Since the rod becomes positive, it must have lost electrons. These electrons were gained by the wool."
  },
  {
    text: "Which of the following is a potential hazard of static electricity?",
    options: [
      "Photocopier paper jamming",
      "Sparking while refueling an aircraft",
      "Shock from a low-voltage battery",
      "Electric current in household wires"
    ],
    correct: 1,
    explanation: "Refueling aircraft can build up static charge due to fuel rubbing against the pipe. A spark could ignite fuel vapors, which is a major hazard."
  },
  {
    text: "Why are fuel tankers equipped with metal chains touching the ground?",
    options: [
      "To keep the tanker stable on the road.",
      "To produce warning sounds for other vehicles.",
      "To discharge any accumulated static charge safely to the ground.",
      "To measure the distance of the tanker from the ground."
    ],
    correct: 2,
    explanation: "The metal chains act as a conducting path to discharge built-up static electricity (from fuel friction) to the earth, preventing sparks."
  },
  {
    text: "How does an electrostatic precipitator clean smoke in factory chimneys?",
    options: [
      "It uses water filters to wash the dust particles.",
      "It charges dust particles so they are attracted to oppositely charged plates.",
      "It burns the dust particles using high heat.",
      "It uses high-speed fans to blow dust away."
    ],
    correct: 1,
    explanation: "Electrostatic precipitators give dust particles a negative charge, causing them to attract to grounded or positively charged metal collection plates."
  },
  {
    text: "Two charged rods, X and Y, are suspended close to each other. They swing away from each other. What does this indicate?",
    options: [
      "Both rods are neutral.",
      "One rod is positive, the other is negative.",
      "Both rods carry the same type of charge.",
      "Rod X has lost all its protons."
    ],
    correct: 2,
    explanation: "Like charges repel. Since the rods swing away (repel), they must carry the same type of charge (both positive or both negative)."
  },
  {
    text: "If object A attracts object B, and object B repels object C (which is known to be positive), what can we conclude about object A?",
    options: [
      "A must be positive.",
      "A must be negative.",
      "A is either negative or neutral.",
      "A is either positive or neutral."
    ],
    correct: 2,
    explanation: "Since B repels positive C, B must be positive. If A attracts positive B, A can either be negative (unlike charges attract) or neutral (charged objects attract neutral ones)."
  },
  {
    text: "What happens to a negatively charged gold-leaf electroscope when a positively charged rod is brought near (but not touching) its metal cap?",
    options: [
      "The gold leaf diverges further.",
      "The gold leaf collapses slightly.",
      "The gold leaf remains unchanged.",
      "The gold leaf falls off."
    ],
    correct: 1,
    explanation: "The positive rod attracts negative electrons up to the metal cap, reducing the number of negative charges on the gold leaf, causing it to collapse."
  },
  {
    text: "Which of the following is NOT a safe practice during a lightning storm?",
    options: [
      "Staying inside a car.",
      "Standing under a tall tree in an open field.",
      "Staying inside a building.",
      "Squatting low to the ground in an open area."
    ],
    correct: 1,
    explanation: "Lightning tends to strike the tallest objects. Standing under a tall tree makes you highly vulnerable to side flashes and direct hits."
  },
  {
    text: "A plastic comb is rubbed through dry hair and attracts tiny bits of paper. Why does this attraction occur?",
    options: [
      "Paper is a magnetic material.",
      "The comb induces opposite charges on the paper bits and attracts them.",
      "Gravity pulls the paper towards the comb.",
      "Dry hair creates magnetic fields."
    ],
    correct: 1,
    explanation: "The charged plastic comb induces an opposite charge on the surface of the paper, creating an attractive electrostatic force."
  },
  {
    text: "What is the electric field direction at a point in space?",
    options: [
      "The direction of the force on a positive test charge.",
      "The direction of the force on a negative test charge.",
      "The direction of electron flow.",
      "Towards the positive source charge."
    ],
    correct: 0,
    explanation: "By convention, the direction of an electric field is the direction of the force exerted on a positive test charge (away from + and towards −)."
  },
  {
    text: "An electric field line is drawn to represent field direction. How do lines behave around a positive point charge?",
    options: [
      "They curve in concentric circles around it.",
      "They point radially inwards towards it.",
      "They point radially outwards away from it.",
      "There are no field lines around positive charges."
    ],
    correct: 2,
    explanation: "Electric field lines point radially outwards from positive charges, as they show the path a positive charge would travel."
  },
  {
    text: "What describes the electric field lines between two equal and opposite charges?",
    options: [
      "They start on the positive charge and end on the negative charge.",
      "They start on the negative charge and end on the positive charge.",
      "They cross each other at the center point.",
      "They are parallel straight lines pointing downwards."
    ],
    correct: 0,
    explanation: "Electric field lines always start on positive charges and terminate on negative charges, and they never cross."
  },
  {
    text: "If you discharge a negatively charged plastic rod, what happens?",
    options: [
      "Protons flow from the ground to the rod.",
      "Excess electrons flow from the rod to the ground.",
      "Neutrons are added to neutralize the rod.",
      "The rod is heated to destroy the charges."
    ],
    correct: 1,
    explanation: "Discharging (or grounding) a negative rod allows its excess electrons to flow away into the ground to neutralize it."
  },
  {
    text: "Which of the following is NOT an application of electrostatics?",
    options: [
      "Photocopying machines",
      "Spray painting cars",
      "Electric doorbells",
      "Electrostatic air filters"
    ],
    correct: 2,
    explanation: "Electric doorbells use electromagnetism, not electrostatics. Photocopiers, spray painting, and air filters all utilize electrostatic charges."
  },
  {
    text: "An uncharged metal sphere is mounted on an insulating stand. A negative rod is held near it. Which side of the sphere becomes positive?",
    options: [
      "The side nearest the rod",
      "The side furthest from the rod",
      "The top half of the sphere",
      "The entire sphere becomes positive"
    ],
    correct: 0,
    explanation: "The negative rod repels negative electrons to the far side of the metal sphere, leaving the side nearest to the rod positive."
  },
  {
    text: "Two neutral glass blocks are rubbed together. Do they become charged?",
    options: [
      "Yes, because friction always creates charges.",
      "No, because they are made of the same material and have the same affinity for electrons.",
      "Yes, one becomes positive and one becomes negative.",
      "No, glass can never be charged under any circumstances."
    ],
    correct: 1,
    explanation: "For charging by rubbing to occur, materials must have different electron affinities. Rubbing identical materials results in no net transfer."
  }
];

// Flashcards revision data
const FlashcardDeck = [
  {
    q: "Which subatomic particle is transferred during charging by rubbing?",
    a: "Only electrons (negative charges) move. Protons are fixed in the nucleus and do not transfer."
  },
  {
    q: "What charge does an object acquire when it gains electrons?",
    a: "It becomes negatively charged (−) because it now has more negative electrons than positive protons."
  },
  {
    q: "What charge does an object acquire when it loses electrons?",
    a: "It becomes positively charged (+) because it now has fewer negative electrons, leaving an excess of positive protons."
  },
  {
    q: "State the Law of Conservation of Charge during rubbing.",
    a: "The total charge of an isolated system remains constant. Electrons are not created or destroyed; they are merely transferred from one object to another."
  },
  {
    q: "Explain why a neutral object has no net charge.",
    a: "A neutral object contains equal numbers of positive protons and negative electrons. Their charges cancel each other out."
  },
  {
    q: "What is the resulting charge when a polythene rod is rubbed with a wool cloth?",
    a: "Polythene Rod: Negatively charged (−)\nWool Cloth: Positively charged (+)\n(Electrons move from wool to polythene)."
  },
  {
    q: "What is the resulting charge when a glass rod is rubbed with a silk cloth?",
    a: "Glass Rod: Positively charged (+)\nSilk Cloth: Negatively charged (−)\n(Electrons move from glass to silk)."
  },
  {
    q: "Why does rubbing two objects made of the same material (e.g. glass on glass) not charge them?",
    a: "Identical materials have the same affinity for electrons, so no net transfer of electrons occurs."
  },
  {
    q: "What is grounding (or earthing) and how does it affect a charged object?",
    a: "Grounding provides a path for electrons to flow to or from the earth. A negative object loses electrons to ground; a positive object gains electrons from ground. Both become neutral."
  },
  {
    q: "Why do charged objects attract neutral insulators (like bits of paper)?",
    a: "The charged object induces a temporary opposite charge on the surface of the neutral insulator, creating an attractive electrostatic force."
  }
];


// --- CANVAS CONFETTI SYSTEM ---
const canvas = document.getElementById('confetti-canvas');
const ctx = canvas.getContext('2d');
let confettiParticles = [];
let confettiAnimationId = null;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class ConfettiParticle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * -canvas.height - 20;
    this.size = Math.random() * 8 + 6;
    this.speedY = Math.random() * 4 + 4;
    this.speedX = Math.random() * 4 - 2;
    this.rotation = Math.random() * 360;
    this.rotationSpeed = Math.random() * 4 - 2;
    const colors = [state.activeSection === 'section-quiz' ? '#39ff14' : '#00f0ff', '#ff007f', '#ffffff', '#ffb700', '#a000c8'];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }
  update() {
    this.y += this.speedY;
    this.x += this.speedX;
    this.rotation += this.rotationSpeed;
  }
  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    ctx.restore();
  }
}

function triggerConfetti() {
  confettiParticles = [];
  for (let i = 0; i < 80; i++) {
    confettiParticles.push(new ConfettiParticle());
  }
  if (!confettiAnimationId) {
    animateConfetti();
  }
}

function animateConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let active = false;
  confettiParticles.forEach((p) => {
    p.update();
    p.draw();
    if (p.y < canvas.height) {
      active = true;
    }
  });

  if (active) {
    confettiAnimationId = requestAnimationFrame(animateConfetti);
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    confettiAnimationId = null;
  }
}


// --- CORE ROUTING NAVIGATION ---
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.app-section');

navItems.forEach((item) => {
  item.addEventListener('click', () => {
    const targetSectionId = item.getAttribute('data-target');
    switchSection(targetSectionId);
  });
});

function switchSection(sectionId) {
  // Update state
  state.activeSection = sectionId;

  // Update navbar items
  navItems.forEach((btn) => {
    if (btn.getAttribute('data-target') === sectionId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update sections view
  sections.forEach((sec) => {
    if (sec.id === sectionId) {
      sec.classList.add('active');
    } else {
      sec.classList.remove('active');
    }
  });

  // Trigger special initializations on section entry
  if (sectionId === 'section-concept') {
    renderConceptStep();
  } else if (sectionId === 'section-exploration') {
    // Keep Part A or B state intact
  } else if (sectionId === 'section-quiz') {
    if (state.quizSelected.length === 0) {
      startNewQuiz();
    }
  } else if (sectionId === 'section-scoring') {
    updateScoringDashboard();
  } else if (sectionId === 'section-flashcards') {
    if (state.flashcardsDeck.length === 0) {
      shuffleFlashcards();
    }
    renderFlashcard();
  }
}


// --- SECTION 1: CONCEPT STEP-BY-STEP ANIMATION ---
const conceptStepsData = [
  {
    title: "1. Matter and Charges",
    text: "All matter contains positive charges (protons) and negative charges (electrons). In a neutral object, positive and negative charges are equal. Look at both materials: each has 6 positive and 6 negative charges. They have no net charge.",
    obj1Charges: { pos: 6, neg: 6 },
    obj2Charges: { pos: 6, neg: 6 },
    label1: "Neutral Rod",
    label2: "Neutral Cloth",
    shake: false,
    spark: false,
    migrate: false
  },
  {
    title: "2. The Rubbing Action",
    text: "When two objects are rubbed together, they are pressed closely. Friction forces electrons on the surface to interact. Positive charges are tightly bound inside the nuclei of the material lattice and cannot move. Only electrons move!",
    obj1Charges: { pos: 6, neg: 6 },
    obj2Charges: { pos: 6, neg: 6 },
    label1: "Rubbing...",
    label2: "Rubbing...",
    shake: true,
    spark: true,
    migrate: false
  },
  {
    title: "3. Electron Migration",
    text: "Due to differences in electron affinity, electrons (negative charges) physically migrate from one material to another. In this polythene-wool example, electrons escape the wool cloth and slide onto the polythene rod.",
    obj1Charges: { pos: 6, neg: 6 },
    obj2Charges: { pos: 6, neg: 6 },
    label1: "Receiving Electrons",
    label2: "Losing Electrons",
    shake: false,
    spark: false,
    migrate: true
  },
  {
    title: "4. Resulting Charged States",
    text: "The material that gains electrons now has excess negative charge and becomes negatively charged (−). The material that loses electrons is left with excess positive charge and becomes positively charged (+).",
    obj1Charges: { pos: 6, neg: 9 }, // Gains 3 electrons
    obj2Charges: { pos: 6, neg: 3 }, // Loses 3 electrons
    label1: "Negatively Charged (−)",
    label2: "Positively Charged (+)",
    shake: false,
    spark: false,
    migrate: false
  }
];

const btnConceptPrev = document.getElementById('btn-concept-prev');
const btnConceptNext = document.getElementById('btn-concept-next');
const conceptStepTitle = document.getElementById('concept-step-title');
const conceptStepText = document.getElementById('concept-step-text');
const conceptObj1Wrap = document.getElementById('concept-obj1-wrap');
const conceptObj2Wrap = document.getElementById('concept-obj2-wrap');
const conceptObj1Label = document.getElementById('concept-obj1-label');
const conceptObj2Label = document.getElementById('concept-obj2-label');
const conceptRodCharges = document.getElementById('concept-rod-charges');
const conceptClothCharges = document.getElementById('concept-cloth-charges');
const conceptSparkles = document.getElementById('concept-sparkles');
const conceptDots = document.querySelectorAll('.step-progress-dots .dot');

btnConceptPrev.addEventListener('click', () => {
  if (state.conceptStep > 0) {
    state.conceptStep--;
    renderConceptStep();
  }
});

btnConceptNext.addEventListener('click', () => {
  if (state.conceptStep < conceptStepsData.length - 1) {
    state.conceptStep++;
    renderConceptStep();
  } else {
    // If finished steps, automatically jump to Exploration
    switchSection('section-exploration');
  }
});

// Helper to draw charges inside SVG Group
function drawSVGCharges(groupElement, posCount, negCount, type) {
  groupElement.innerHTML = '';
  
  // Hardcoded coordinates to make it look neat and spread out
  let posCoords = [];
  let negCoords = [];

  if (type === 'rod') {
    posCoords = [
      {x: 25, y: 25}, {x: 50, y: 25}, {x: 75, y: 25},
      {x: 100, y: 25}, {x: 125, y: 25}, {x: 140, y: 25}
    ];
    negCoords = [
      {x: 15, y: 25}, {x: 38, y: 25}, {x: 62, y: 25},
      {x: 88, y: 25}, {x: 112, y: 25}, {x: 132, y: 25},
      // extra ones for final step
      {x: 30, y: 18}, {x: 80, y: 18}, {x: 120, y: 18}
    ];
  } else {
    // cloth shape coordinates
    posCoords = [
      {x: 25, y: 30}, {x: 40, y: 50}, {x: 55, y: 25},
      {x: 75, y: 35}, {x: 50, y: 60}, {x: 70, y: 55}
    ];
    negCoords = [
      {x: 32, y: 22}, {x: 28, y: 48}, {x: 65, y: 20},
      {x: 80, y: 45}, {x: 45, y: 40}, {x: 60, y: 45},
      {x: 10, y: 10}, {x: 10, y: 10}, {x: 10, y: 10} // ignored based on count
    ];
  }

  // Draw Positives
  for (let i = 0; i < posCount; i++) {
    const c = posCoords[i];
    if (c) {
      groupElement.appendChild(createChargeElement(c.x, c.y, '+'));
    }
  }

  // Draw Negatives
  for (let i = 0; i < negCount; i++) {
    const c = negCoords[i];
    if (c) {
      groupElement.appendChild(createChargeElement(c.x, c.y, '−'));
    }
  }
}

function createChargeElement(x, y, sign) {
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("transform", `translate(${x}, ${y})`);
  g.setAttribute("class", `charge-circle ${sign === '+' ? 'pos' : 'neg'}`);

  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("r", "5.5");
  
  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("class", "charge-sign");
  text.textContent = sign;

  g.appendChild(circle);
  g.appendChild(text);
  return g;
}

function renderConceptStep() {
  const stepData = conceptStepsData[state.conceptStep];
  
  // Set Text Content
  conceptStepTitle.textContent = stepData.title;
  conceptStepText.textContent = stepData.text;
  
  // Set Labels
  conceptObj1Label.textContent = stepData.label1;
  conceptObj2Label.textContent = stepData.label2;

  // Manage buttons
  btnConceptPrev.disabled = state.conceptStep === 0;
  btnConceptNext.textContent = state.conceptStep === conceptStepsData.length - 1 ? "Start Exploration 🔬" : "Next Step";

  // Manage Progress Dots
  conceptDots.forEach((dot, idx) => {
    if (idx === state.conceptStep) dot.classList.add('active');
    else dot.classList.remove('active');
  });

  // Manage SVGs & classes
  const rodBg = conceptObj1Wrap.querySelector('.material-rod-bg');
  const clothBg = conceptObj2Wrap.querySelector('.material-cloth-bg');

  // Remove old animations
  conceptObj1Wrap.classList.remove('shaking');
  conceptObj2Wrap.classList.remove('shaking');
  conceptSparkles.style.opacity = '0';
  conceptSparkles.style.transform = 'scale(0)';
  
  // Clear any existing animation loops
  if (state.conceptMigrationInterval) {
    clearInterval(state.conceptMigrationInterval);
  }

  // Draw static charges
  drawSVGCharges(conceptRodCharges, stepData.obj1Charges.pos, stepData.obj1Charges.neg, 'rod');
  drawSVGCharges(conceptClothCharges, stepData.obj2Charges.pos, stepData.obj2Charges.neg, 'cloth');

  // Handle step-specific logic
  if (stepData.shake) {
    conceptObj1Wrap.classList.add('shaking');
    conceptObj2Wrap.classList.add('shaking');
  }

  if (stepData.spark) {
    conceptSparkles.style.opacity = '0.8';
    conceptSparkles.style.transform = 'scale(1.5)';
    conceptSparkles.style.left = '50%';
    conceptSparkles.style.top = '50%';
  }

  if (stepData.migrate) {
    // Visualise active migration with moving circles
    conceptObj1Wrap.style.transform = 'translateX(25px)';
    conceptObj2Wrap.style.transform = 'translateX(-25px)';
    
    let particleCount = 0;
    state.conceptMigrationInterval = setInterval(() => {
      animateConceptMigrationSingle();
      particleCount++;
      if (particleCount >= 6) {
        clearInterval(state.conceptMigrationInterval);
      }
    }, 700);
  } else {
    conceptObj1Wrap.style.transform = 'none';
    conceptObj2Wrap.style.transform = 'none';
  }

  // Final step color glows
  if (state.conceptStep === 3) {
    rodBg.style.stroke = 'var(--neon-cyan)';
    rodBg.style.fill = '#17273a';
    clothBg.style.stroke = 'var(--neon-pink)';
    clothBg.style.fill = '#4a243d';
  } else {
    rodBg.style.stroke = 'rgba(255, 255, 255, 0.15)';
    rodBg.style.fill = '#2d3846';
    clothBg.style.stroke = 'rgba(255, 255, 255, 0.15)';
    clothBg.style.fill = '#3b364d';
  }
}

function animateConceptMigrationSingle() {
  const container = document.getElementById('concept-stage');
  if (!container) return;

  const el = document.createElement('div');
  el.className = 'migrating-electron';
  el.textContent = '−';

  // Get start coordinates (from cloth)
  const clothRect = conceptObj2Wrap.getBoundingClientRect();
  const stageRect = container.getBoundingClientRect();

  const startX = clothRect.left + clothRect.width / 2 - stageRect.left;
  const startY = clothRect.top + clothRect.height / 2 - stageRect.top;

  const endX = conceptObj1Wrap.getBoundingClientRect().left + 80 - stageRect.left;
  const endY = conceptObj1Wrap.getBoundingClientRect().top + 40 - stageRect.top;

  el.style.left = `${startX}px`;
  el.style.top = `${startY}px`;
  container.appendChild(el);

  // Transition path using simple JS animation frame or timeout
  let progress = 0;
  const steps = 30;
  const interval = setInterval(() => {
    progress++;
    const t = progress / steps;
    // quadratic bezier curve to lift it up slightly
    const currentX = startX + (endX - startX) * t;
    const currentY = startY + (endY - startY) * t - Math.sin(t * Math.PI) * 40;
    
    el.style.left = `${currentX}px`;
    el.style.top = `${currentY}px`;

    if (progress >= steps) {
      clearInterval(interval);
      el.remove();
    }
  }, 20);
}


// --- TAB SYSTEM (EXPLORATION) ---
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');

tabButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const targetTabId = btn.getAttribute('data-tab');
    
    tabButtons.forEach((b) => b.classList.remove('active'));
    tabPanes.forEach((p) => p.classList.remove('active'));

    btn.classList.add('active');
    document.getElementById(targetTabId).classList.add('active');

    if (targetTabId === 'tab-practice') {
      setupPracticeRound();
    }
  });
});


// --- SECTION 2 PART A: ELECTRON TRANSFER SIMULATOR ---
const btnRub = document.getElementById('btn-rub');
const btnSimReset = document.getElementById('btn-sim-reset');
const simWoolCharges = document.getElementById('sim-wool-charges');
const simRodCharges = document.getElementById('sim-rod-charges');
const woolStatus = document.getElementById('wool-status');
const rodStatus = document.getElementById('rod-status');
const electronsCounter = document.getElementById('electrons-counter');
const simWoolContainer = document.getElementById('sim-wool-container');
const simRodContainer = document.getElementById('sim-rod-container');

btnRub.addEventListener('click', () => {
  if (state.isRubbing || state.simElectronsTransferred >= 5) return;
  state.isRubbing = true;
  state.simInteractionCount++;

  // Shaking animations
  simWoolContainer.classList.add('shaking');
  simRodContainer.classList.add('shaking');

  // Electron migration visuals
  animateSimulatorMigration();
});

btnSimReset.addEventListener('click', resetSimulator);

function resetSimulator() {
  state.simElectronsTransferred = 0;
  electronsCounter.textContent = '0';
  btnRub.disabled = false;
  state.isRubbing = false;

  woolStatus.className = 'charge-status-badge badge-neutral';
  woolStatus.textContent = 'Neutral';
  rodStatus.className = 'charge-status-badge badge-neutral';
  rodStatus.textContent = 'Neutral';

  simWoolContainer.querySelector('.wool-bg').style.fill = '#433959';
  simWoolContainer.querySelector('.wool-bg').style.stroke = 'rgba(255, 255, 255, 0.15)';
  
  simRodContainer.querySelector('.polythene-bg').style.fill = '#222e3c';
  simRodContainer.querySelector('.polythene-bg').style.stroke = 'rgba(255, 255, 255, 0.15)';

  drawSimulatorInitialCharges();
}

function drawSimulatorInitialCharges() {
  // Wool charges (6 positive, 6 negative)
  simWoolCharges.innerHTML = '';
  const woolCoords = [
    {x:35, y:40}, {x:55, y:30}, {x:75, y:45},
    {x:45, y:60}, {x:65, y:55}, {x:85, y:35}
  ];
  woolCoords.forEach(c => {
    simWoolCharges.appendChild(createChargeElement(c.x, c.y, '+'));
    simWoolCharges.appendChild(createChargeElement(c.x + 8, c.y + 6, '−'));
  });

  // Polythene rod charges (6 positive, 6 negative)
  simRodCharges.innerHTML = '';
  const rodCoords = [
    {x:35, y:30}, {x:65, y:30}, {x:95, y:30},
    {x:125, y:30}, {x:155, y:30}, {x:175, y:30}
  ];
  rodCoords.forEach(c => {
    simRodCharges.appendChild(createChargeElement(c.x, c.y, '+'));
    simRodCharges.appendChild(createChargeElement(c.x + 8, c.y + 6, '−'));
  });
}

function animateSimulatorMigration() {
  const overlay = document.getElementById('sim-migration-overlay');
  const overlayRect = overlay.getBoundingClientRect();

  // Create migrating electron element
  const el = document.createElement('div');
  el.className = 'migrating-electron';
  el.textContent = '−';

  // Compute positions
  const startRect = simWoolContainer.getBoundingClientRect();
  const endRect = simRodContainer.getBoundingClientRect();

  const startX = startRect.left + startRect.width/2 - overlayRect.left;
  const startY = startRect.top + startRect.height/2 - overlayRect.top;

  const endX = endRect.left + endRect.width/2 - overlayRect.left;
  const endY = endRect.top + endRect.height/2 - overlayRect.top;

  el.style.left = `${startX}px`;
  el.style.top = `${startY}px`;
  overlay.appendChild(el);

  let progress = 0;
  const steps = 25;
  const animInterval = setInterval(() => {
    progress++;
    const t = progress / steps;
    const curX = startX + (endX - startX) * t;
    const curY = startY + (endY - startY) * t - Math.sin(t * Math.PI) * 50;

    el.style.left = `${curX}px`;
    el.style.top = `${curY}px`;

    if (progress >= steps) {
      clearInterval(animInterval);
      el.remove();
      
      // Stop shaking and update numbers
      simWoolContainer.classList.remove('shaking');
      simRodContainer.classList.remove('shaking');
      state.isRubbing = false;
      
      state.simElectronsTransferred++;
      electronsCounter.textContent = state.simElectronsTransferred;

      updateSimulatorStateGlows();
    }
  }, 24);
}

function updateSimulatorStateGlows() {
  const trans = state.simElectronsTransferred;
  
  // Redraw simulator charges based on current transfers
  simWoolCharges.innerHTML = '';
  const woolCoords = [
    {x:35, y:40}, {x:55, y:30}, {x:75, y:45},
    {x:45, y:60}, {x:65, y:55}, {x:85, y:35}
  ];
  // Positives remain at 6
  woolCoords.forEach(c => {
    simWoolCharges.appendChild(createChargeElement(c.x, c.y, '+'));
  });
  // Negatives diminish (6 - trans)
  const remainingWoolNegs = 6 - trans;
  for (let i = 0; i < remainingWoolNegs; i++) {
    const c = woolCoords[i];
    simWoolCharges.appendChild(createChargeElement(c.x + 8, c.y + 6, '−'));
  }

  // Rod charges
  simRodCharges.innerHTML = '';
  const rodCoords = [
    {x:35, y:30}, {x:65, y:30}, {x:95, y:30},
    {x:125, y:30}, {x:155, y:30}, {x:175, y:30}
  ];
  // Positives remain at 6
  rodCoords.forEach(c => {
    simRodCharges.appendChild(createChargeElement(c.x, c.y, '+'));
  });
  // Negatives grow (6 + trans)
  for (let i = 0; i < 6; i++) {
    const c = rodCoords[i];
    simRodCharges.appendChild(createChargeElement(c.x + 8, c.y + 6, '−'));
  }
  // Extra negative positions for migration
  const extraNegCoords = [
    {x:50, y:20}, {x:110, y:20}, {x:140, y:20}, {x:80, y:20}, {x:160, y:20}
  ];
  for (let i = 0; i < trans; i++) {
    const c = extraNegCoords[i];
    simRodCharges.appendChild(createChargeElement(c.x, c.y, '−'));
  }

  // Update badges
  if (trans > 0) {
    woolStatus.className = 'charge-status-badge badge-positive';
    woolStatus.textContent = `Positively Charged (+${trans})`;
    
    rodStatus.className = 'charge-status-badge badge-negative';
    rodStatus.textContent = `Negatively Charged (−${trans})`;

    // Style adjustments
    simWoolContainer.querySelector('.wool-bg').style.fill = '#4e253e';
    simWoolContainer.querySelector('.wool-bg').style.stroke = 'var(--neon-pink)';

    simRodContainer.querySelector('.polythene-bg').style.fill = '#152536';
    simRodContainer.querySelector('.polythene-bg').style.stroke = 'var(--neon-cyan)';
  }

  if (trans >= 5) {
    btnRub.disabled = true;
    triggerConfetti();
  }
}

// Initial draw
drawSimulatorInitialCharges();


// --- SECTION 2 PART B: PRACTICE GAME (CHARGE THE OBJECT) ---
const practiceScenarioText = document.getElementById('practice-scenario-text');
const practiceM1Name = document.getElementById('practice-m1-name');
const practiceM2Name = document.getElementById('practice-m2-name');
const practiceSvgLeft = document.getElementById('practice-svg-left');
const practiceSvgRight = document.getElementById('practice-svg-right');
const practiceFeedback = document.getElementById('practice-feedback');
const practiceFeedbackTitle = document.getElementById('practice-feedback-title');
const practiceFeedbackExplanation = document.getElementById('practice-feedback-explanation');
const btnPracticeSubmit = document.getElementById('btn-practice-submit');
const btnPracticeNext = document.getElementById('btn-practice-next');

// Event handler for selecting positive/negative button in Part B
document.querySelectorAll('.btn-charge').forEach((btn) => {
  btn.addEventListener('click', () => {
    if (state.practiceChecked) return;

    const objSide = btn.getAttribute('data-obj'); // 'left' or 'right'
    const chargeVal = btn.getAttribute('data-charge'); // 'positive' or 'negative'

    // Toggle selected state within same card
    document.querySelectorAll(`.btn-charge[data-obj="${objSide}"]`).forEach(b => {
      b.classList.remove('selected');
    });

    btn.classList.add('selected');
    state.practiceSelected[objSide] = chargeVal;
  });
});

btnPracticeSubmit.addEventListener('click', checkPracticeAnswer);
btnPracticeNext.addEventListener('click', setupPracticeRound);

function setupPracticeRound() {
  // Clear selection
  state.practiceSelected = { left: null, right: null };
  state.practiceChecked = false;
  
  document.querySelectorAll('.btn-charge').forEach(b => b.classList.remove('selected'));
  practiceFeedback.classList.add('hidden');
  btnPracticeSubmit.classList.remove('hidden');
  btnPracticeNext.classList.add('hidden');

  // Pick random scenario
  const randScen = Scenarios[Math.floor(Math.random() * Scenarios.length)];
  state.currentScenario = randScen;

  // Decide dynamically who loses electrons to add variation (randomize scenario statement)
  const isStandard = Math.random() > 0.4; // 60% standard O-level pair, 40% reversed statement for conceptual testing
  
  if (isStandard) {
    state.currentScenario.activeLoses = randScen.loses; // standard physics
    practiceScenarioText.innerHTML = `During friction rubbing, the <strong>${randScen.loses === 'm1' ? randScen.m1 : randScen.m2}</strong> physically loses negative electrons to the <strong>${randScen.loses === 'm1' ? randScen.m2 : randScen.m1}</strong>.`;
  } else {
    // Reverse scenario for theoretical practice
    state.currentScenario.activeLoses = randScen.loses === 'm1' ? 'm2' : 'm1';
    practiceScenarioText.innerHTML = `Imagine a hypothetical scenario where the <strong>${state.currentScenario.activeLoses === 'm1' ? randScen.m1 : randScen.m2}</strong> is forced to lose electrons to the <strong>${state.currentScenario.activeLoses === 'm1' ? randScen.m2 : randScen.m1}</strong> during contact rubbing.`;
  }

  // Populate names
  practiceM1Name.textContent = randScen.m1;
  practiceM2Name.textContent = randScen.m2;

  // Render SVG icons in cards
  renderPracticeSVGs(randScen);
}

function renderPracticeSVGs(scen) {
  // Left object (m1) SVG
  practiceSvgLeft.innerHTML = '';
  if (scen.m1Type === 'rod') {
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", "5"); rect.setAttribute("y", "20");
    rect.setAttribute("width", "90"); rect.setAttribute("height", "20");
    rect.setAttribute("rx", "10");
    rect.setAttribute("fill", "#273444");
    rect.setAttribute("stroke", "rgba(255,255,255,0.1)");
    practiceSvgLeft.appendChild(rect);
  } else {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M 10 20 C 10 10, 30 10, 45 20 C 55 10, 75 10, 90 20 C 100 35, 80 50, 50 45 C 20 50, 5 35, 10 20 Z");
    path.setAttribute("fill", "#38314a");
    path.setAttribute("stroke", "rgba(255,255,255,0.1)");
    practiceSvgLeft.appendChild(path);
  }

  // Right object (m2) SVG
  practiceSvgRight.innerHTML = '';
  if (scen.m2Type === 'rod') {
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", "5"); rect.setAttribute("y", "20");
    rect.setAttribute("width", "90"); rect.setAttribute("height", "20");
    rect.setAttribute("rx", "10");
    rect.setAttribute("fill", "#273444");
    rect.setAttribute("stroke", "rgba(255,255,255,0.1)");
    practiceSvgRight.appendChild(rect);
  } else {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M 10 20 C 10 10, 30 10, 45 20 C 55 10, 75 10, 90 20 C 100 35, 80 50, 50 45 C 20 50, 5 35, 10 20 Z");
    path.setAttribute("fill", "#38314a");
    path.setAttribute("stroke", "rgba(255,255,255,0.1)");
    practiceSvgRight.appendChild(path);
  }
}

function checkPracticeAnswer() {
  if (state.practiceChecked) return;

  const leftChoice = state.practiceSelected.left;
  const rightChoice = state.practiceSelected.right;

  if (!leftChoice || !rightChoice) {
    alert("Please select the resulting charge for BOTH materials first!");
    return;
  }

  state.practiceChecked = true;
  state.practiceAttempts++;

  // Determine correct answer based on activeLoses
  const correctLeft = state.currentScenario.activeLoses === 'm1' ? 'positive' : 'negative';
  const correctRight = state.currentScenario.activeLoses === 'm2' ? 'positive' : 'negative';

  const isCorrect = (leftChoice === correctLeft && rightChoice === correctRight);

  practiceFeedback.classList.remove('hidden');
  btnPracticeSubmit.classList.add('hidden');
  btnPracticeNext.classList.remove('hidden');

  if (isCorrect) {
    state.practiceScore++;
    practiceFeedback.classList.remove('incorrect');
    practiceFeedbackTitle.textContent = "Correct! 🌟";
    triggerConfetti();
  } else {
    practiceFeedback.classList.add('incorrect');
    practiceFeedbackTitle.textContent = "Incorrect";
  }

  // Formulate detailed O-Level response explanation
  const mLosingName = state.currentScenario.activeLoses === 'm1' ? state.currentScenario.m1 : state.currentScenario.m2;
  const mGainingName = state.currentScenario.activeLoses === 'm1' ? state.currentScenario.m2 : state.currentScenario.m1;

  practiceFeedbackExplanation.innerHTML = `
    <strong>Correct charges:</strong> ${state.currentScenario.m1} is <strong>${correctLeft.toUpperCase()}</strong>, and ${state.currentScenario.m2} is <strong>${correctRight.toUpperCase()}</strong>.<br><br>
    <strong>Explanation:</strong> Electrons carry a negative charge. Since the <strong>${mLosingName}</strong> loses electrons, it loses negative charges, leaving it with excess protons, making it <strong>positively charged</strong>. The <strong>${mGainingName}</strong> gains these negative electrons, acquiring an excess negative charge, making it <strong>negatively charged</strong>.
  `;
}


// --- SECTION 3: MCQ QUIZ ENGINE ---
const quizProgressText = document.getElementById('quiz-progress-text');
const quizProgressBar = document.getElementById('quiz-progress-bar');
const quizQuestionText = document.getElementById('quiz-question-text');
const quizOptionsContainer = document.getElementById('quiz-options-container');
const quizExplanationBox = document.getElementById('quiz-explanation-box');
const quizExplanationTitle = document.getElementById('quiz-explanation-title');
const quizExplanationText = document.getElementById('quiz-explanation-text');
const btnQuizNext = document.getElementById('btn-quiz-next');

btnQuizNext.addEventListener('click', handleQuizNextButton);

function startNewQuiz() {
  state.quizScore = 0;
  state.currentQuizIndex = 0;
  state.quizAnswered = false;

  // Shuffle questions pool
  const poolCopy = [...MCQPool];
  for (let i = poolCopy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [poolCopy[i], poolCopy[j]] = [poolCopy[j], poolCopy[i]];
  }

  // Draw exactly 10 questions
  state.quizSelected = poolCopy.slice(0, 10);
  renderQuizQuestion();
}

function renderQuizQuestion() {
  state.quizAnswered = false;
  quizExplanationBox.classList.add('hidden');
  btnQuizNext.classList.add('hidden');

  const q = state.quizSelected[state.currentQuizIndex];
  
  // Progress indicators
  quizProgressText.textContent = `Q${state.currentQuizIndex + 1} / 10`;
  quizProgressBar.style.width = `${(state.currentQuizIndex + 1) * 10}%`;

  // Render question text
  quizQuestionText.textContent = q.text;

  // Render option buttons
  quizOptionsContainer.innerHTML = '';
  q.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = `${String.fromCharCode(65 + idx)}. ${opt}`; // A, B, C, D
    btn.addEventListener('click', () => selectMCQOption(idx));
    quizOptionsContainer.appendChild(btn);
  });
}

function selectMCQOption(selectedIdx) {
  if (state.quizAnswered) return;
  state.quizAnswered = true;

  const q = state.quizSelected[state.currentQuizIndex];
  const optionBtns = quizOptionsContainer.querySelectorAll('.option-btn');

  // Disable all buttons
  optionBtns.forEach(btn => btn.disabled = true);

  const isCorrect = (selectedIdx === q.correct);

  if (isCorrect) {
    state.quizScore++;
    optionBtns[selectedIdx].classList.add('correct');
    triggerConfetti();
    quizExplanationTitle.textContent = "Correct! 🎉";
    quizExplanationTitle.style.color = "var(--neon-green)";
  } else {
    optionBtns[selectedIdx].classList.add('incorrect');
    optionBtns[q.correct].classList.add('correct'); // Highlight correct answer
    quizExplanationTitle.textContent = "Incorrect";
    quizExplanationTitle.style.color = "var(--neon-pink)";
  }

  // Show explanation
  quizExplanationText.textContent = q.explanation;
  quizExplanationBox.classList.remove('hidden');

  // Next Question or Finish button
  btnQuizNext.classList.remove('hidden');
  if (state.currentQuizIndex === 9) {
    btnQuizNext.textContent = "See Final Results 🏆";
  } else {
    btnQuizNext.textContent = "Next Question";
  }
}

function handleQuizNextButton() {
  if (state.currentQuizIndex < 9) {
    state.currentQuizIndex++;
    renderQuizQuestion();
  } else {
    // Finished last question, transition to results
    switchSection('section-scoring');
  }
}


// --- SECTION 4: SCORING & FEEDBACK DASHBOARD ---
const scorePercentage = document.getElementById('score-percentage');
const scoreFraction = document.getElementById('score-fraction');
const scoreRingProgress = document.getElementById('score-ring-progress');
const scoreSimCount = document.getElementById('score-sim-count');
const scorePracticeValue = document.getElementById('score-practice-value');
const scoreQuizValue = document.getElementById('score-quiz-value');
const feedbackTierCard = document.getElementById('feedback-tier-card');
const feedbackTierTitle = document.getElementById('feedback-tier-title');
const feedbackTierDesc = document.getElementById('feedback-tier-desc');
const btnRestartQuiz = document.getElementById('btn-restart-quiz');
const btnResetAll = document.getElementById('btn-reset-all');

btnRestartQuiz.addEventListener('click', () => {
  startNewQuiz();
  switchSection('section-quiz');
});

btnResetAll.addEventListener('click', () => {
  resetSimulator();
  state.practiceScore = 0;
  state.practiceAttempts = 0;
  startNewQuiz();
  switchSection('section-concept');
});

function updateScoringDashboard() {
  const percent = Math.round((state.quizScore / 10) * 100);
  scorePercentage.textContent = `${percent}%`;
  scoreFraction.textContent = `${state.quizScore} / 10 MCQ`;

  // Animate scoring circle ring
  // Circumference = 2 * PI * r = 2 * 3.14159 * 50 = 314.16
  const offset = 314.16 * (1 - percent / 100);
  scoreRingProgress.style.strokeDashoffset = offset;

  // Breakdown details
  scoreSimCount.textContent = `${state.simInteractionCount} rubs`;
  scorePracticeValue.textContent = `${state.practiceScore} / ${state.practiceAttempts} correct`;
  scoreQuizValue.textContent = `${state.quizScore} / 10 correct`;

  // Determine feedback card tier
  feedbackTierCard.className = 'feedback-tier-card'; // reset classes
  if (percent >= 80) {
    feedbackTierCard.classList.add('tier-top');
    feedbackTierTitle.textContent = "⚡ Outstanding Job! Electrostatics Expert";
    feedbackTierDesc.textContent = "Fantastic work! You have shown a superb understanding of O-Level Static Electricity. You fully master how electron transfer induces positive and negative charges. Keep this charge high for your examinations!";
    triggerConfetti();
  } else if (percent >= 50) {
    feedbackTierCard.classList.add('tier-mid');
    feedbackTierTitle.textContent = "🌟 Good Effort! Keep Reviewing";
    feedbackTierDesc.textContent = "Great job passing! To score even higher, make sure to review which particles move and which do not. Protons (+) NEVER transfer. Only electrons (−) migrate during friction contact.";
  } else {
    feedbackTierCard.classList.add('tier-low');
    feedbackTierTitle.textContent = "📘 Time to Recharge Your Knowledge";
    feedbackTierDesc.textContent = "Don't worry, static electricity takes practice! We recommend reviewing the Concept Introduction animations. Remember: losing electrons makes an object positive, and gaining electrons makes it negative.";
  }
}


// --- SECTION 5: FLASHCARD REVISION SYSTEM ---
const flashcardWrapper = document.getElementById('flashcard-wrapper');
const flashcardElement = document.getElementById('flashcard-element');
const flashcardFrontText = document.getElementById('flashcard-front-text');
const flashcardBackText = document.getElementById('flashcard-back-text');
const flashcardProgressText = document.getElementById('flashcard-progress-text');
const btnCardPrev = document.getElementById('btn-card-prev');
const btnCardNext = document.getElementById('btn-card-next');
const btnCardShuffle = document.getElementById('btn-card-shuffle');

flashcardWrapper.addEventListener('click', () => {
  state.cardFlipped = !state.cardFlipped;
  if (state.cardFlipped) {
    flashcardElement.classList.add('flipped');
  } else {
    flashcardElement.classList.remove('flipped');
  }
});

btnCardPrev.addEventListener('click', () => {
  if (state.currentCardIndex > 0) {
    state.currentCardIndex--;
    state.cardFlipped = false;
    flashcardElement.classList.remove('flipped');
    setTimeout(renderFlashcard, 200); // Wait briefly for flip-back animation
  }
});

btnCardNext.addEventListener('click', () => {
  if (state.currentCardIndex < state.flashcardsDeck.length - 1) {
    state.currentCardIndex++;
    state.cardFlipped = false;
    flashcardElement.classList.remove('flipped');
    setTimeout(renderFlashcard, 200);
  }
});

btnCardShuffle.addEventListener('click', () => {
  shuffleFlashcards();
  renderFlashcard();
  triggerConfetti();
});

function shuffleFlashcards() {
  state.currentCardIndex = 0;
  state.cardFlipped = false;
  flashcardElement.classList.remove('flipped');

  const deckCopy = [...FlashcardDeck];
  for (let i = deckCopy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deckCopy[i], deckCopy[j]] = [deckCopy[j], deckCopy[i]];
  }
  state.flashcardsDeck = deckCopy;
}

function renderFlashcard() {
  const card = state.flashcardsDeck[state.currentCardIndex];
  if (!card) return;

  flashcardFrontText.textContent = card.q;
  flashcardBackText.textContent = card.a;

  // Manage progress text
  flashcardProgressText.textContent = `Card ${state.currentCardIndex + 1} of ${state.flashcardsDeck.length}`;

  // Manage buttons
  btnCardPrev.disabled = state.currentCardIndex === 0;
  btnCardNext.disabled = state.currentCardIndex === state.flashcardsDeck.length - 1;
}


// --- INITIAL APP STARTUP LAUNCH ---
window.addEventListener('DOMContentLoaded', () => {
  // Setup default landing state
  switchSection('section-concept');
  resetSimulator();
  setupPracticeRound();
  startNewQuiz();
});
