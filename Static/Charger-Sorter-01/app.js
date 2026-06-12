/**
 * CHARGE SORTER APP LOGIC
 * O-Level Physics Singapore Syllabus 6091 - Static Electricity
 */

// --- DATA: SHUFFLE & QUESTION POOLS ---

const OBJECT_TEMPLATES = [
  // POSITIVE objects
  { text: "Glass rod rubbed with silk", charge: "positive", expl: "Rubbing transfers electrons from the glass rod to the silk. The glass rod loses electrons, becoming positively charged." },
  { text: "Perspex rod rubbed with wool", charge: "positive", expl: "Perspex loses electrons to wool when rubbed, leaving a net positive charge." },
  { text: "Metal sphere that has lost electrons", charge: "positive", expl: "Losing negatively charged electrons leaves the sphere with an excess of protons (positive charge)." },
  { text: "Neutral atom after losing 3 valence electrons", charge: "positive", expl: "When an atom loses electrons, it becomes a positive ion." },
  { text: "A cloud that has discharged electrons to the ground", charge: "positive", expl: "Losing negative electrons results in a positive charge accumulation." },
  { text: "A comb that has electrons scraped off", charge: "positive", expl: "Scraping off electrons results in a deficit of negative charge." },
  
  // NEGATIVE objects
  { text: "Polythene rod rubbed with wool", charge: "negative", expl: "Polythene has a higher affinity for electrons and gains them from wool, becoming negatively charged." },
  { text: "Ebonite rod rubbed with fur", charge: "negative", expl: "Ebonite gains electrons from fur during rubbing, giving it a net negative charge." },
  { text: "A neutral balloon rubbed against a woollen jumper", charge: "negative", expl: "The balloon gains electrons from the woollen jumper, acquiring a negative charge." },
  { text: "Metal dome of a Van de Graaff generator packed with excess electrons", charge: "negative", expl: "An excess of electrons means there are more negative charges than protons." },
  { text: "A plastic ruler after gaining electrons from hair", charge: "negative", expl: "Gaining electrons creates an excess of negative charge." },
  { text: "A dust particle that captured free electrons", charge: "negative", expl: "Captured electrons increase the negative charge on the particle." }
];

const FLASHCARDS = [
  { cat: "Definition", q: "What is static electricity?", a: "The build-up of electric charge on the surface of objects, usually insulators, caused by friction (rubbing)." },
  { cat: "Law", q: "State the Law of Electrostatics.", a: "Like charges repel; unlike charges attract. Neutral objects can be attracted to charged objects due to electrostatic induction." },
  { cat: "SI Unit", q: "What is the S.I. unit of electric charge?", a: "The coulomb (C)." },
  { cat: "Theory", q: "Which particle is transferred during charging?", a: "Only electrons (negative charges) move. Protons remain fixed in the nucleus." },
  { cat: "Charging", q: "How does an object become positively charged?", a: "By losing electrons. (It does NOT gain protons!)" },
  { cat: "Charging", q: "How does an object become negatively charged?", a: "By gaining electrons." },
  { cat: "Conductor", q: "Why can't a copper rod be charged by friction while holding it?", a: "Copper is a conductor. Any charge generated immediately flows through the conductor and your hand to the ground." },
  { cat: "Induction", q: "What is electrostatic induction?", a: "A process where a charged object, placed near a neutral conductor, causes the charges in the conductor to separate without making contact." },
  { cat: "Earthing", q: "What happens when a negatively charged conductor is earthed?", a: "Excess electrons flow from the conductor to the earth, neutralizing the conductor." },
  { cat: "Earthing", q: "What happens when a positively charged conductor is earthed?", a: "Electrons flow from the earth to the conductor to neutralize the positive charge." },
  { cat: "Application", q: "How does electrostatic paint spraying work?", a: "The paint droplets are given a positive charge, making them repel each other (fine mist) and be attracted to the earthed target object (even coverage)." },
  { cat: "Hazard", q: "How do fuel tankers prevent electrostatic spark hazards?", a: "They use a metal chain dragging on the ground to earth the tanker, discharging any static charge built up by friction with air." }
];

const QUIZ_POOL = [
  {
    q: "Which of the following occurs when a plastic rod becomes negatively charged by rubbing with a cloth?",
    o: ["Electrons are transferred from the cloth to the rod.", "Electrons are transferred from the rod to the cloth.", "Protons are transferred from the cloth to the rod.", "Protons are transferred from the rod to the cloth."],
    a: 0,
    e: "Only electrons are transferred. Gaining electrons makes the plastic rod negative."
  },
  {
    q: "What is the SI unit of electric charge?",
    o: ["Ampere (A)", "Volt (V)", "Coulomb (C)", "Ohm (Ω)"],
    a: 2,
    e: "The S.I. unit of charge is the Coulomb (C)."
  },
  {
    q: "A glass rod is rubbed with a silk cloth. The glass rod becomes positively charged. What happens to the silk cloth?",
    o: ["It remains neutral.", "It gains protons and becomes positive.", "It gains electrons and becomes negative.", "It loses protons and becomes negative."],
    a: 2,
    e: "By conservation of charge, the electrons lost by the glass rod are gained by the silk cloth, making the silk negatively charged."
  },
  {
    q: "Why are electrostatic charges easily built up on insulators but not on metal conductors?",
    o: ["Insulators contain more protons than conductors.", "Conductors quickly transfer any charges away to the surroundings or earth.", "Conductors do not contain electrons.", "Friction cannot transfer electrons on conductors."],
    a: 1,
    e: "Conductors allow free electrons to move easily, so static charge immediately flows away (e.g., to the ground through your hand) unless insulated."
  },
  {
    q: "Which statement best describes the movement of charges during the earthing of a positively charged metal sphere?",
    o: ["Protons flow from the sphere to the earth.", "Electrons flow from the sphere to the earth.", "Protons flow from the earth to the sphere.", "Electrons flow from the earth to the sphere."],
    a: 3,
    e: "A positively charged sphere lacks electrons. Earthing allows electrons to flow from the earth into the sphere to neutralize it."
  },
  {
    q: "A negatively charged balloon is held near a neutral, insulated metal sphere. Which diagram represents the charge distribution on the sphere?",
    o: ["Positive on the near side, negative on the far side", "Negative on the near side, positive on the far side", "Positive everywhere", "Negative everywhere"],
    a: 0,
    e: "By electrostatic induction, the negative balloon repels free electrons to the far side, leaving the near side positively charged."
  },
  {
    q: "Two suspended light spheres repel each other. What can be concluded about their charges?",
    o: ["One is positive, one is neutral.", "Both must be neutral.", "Both have the same sign of charge.", "They have opposite signs of charge."],
    a: 2,
    e: "Repulsion is the only sure test of charge. Like charges repel."
  },
  {
    q: "A charged rod attracts small pieces of paper. Why does this happen?",
    o: ["The paper is also permanently charged.", "The rod induces opposite charges on the near side of the paper pieces.", "The rod transfers protons to the paper.", "Paper is a good conductor of electricity."],
    a: 1,
    e: "The charged rod induces charge separation in the neutral paper pieces, causing attraction."
  },
  {
    q: "In an electrostatic precipitator, dust particles become negatively charged. What are they attracted to?",
    o: ["Negatively charged plates", "Neutral plates", "Positively charged plates", "The chimney outlet"],
    a: 2,
    e: "Unlike charges attract. Negatively charged dust is attracted to positively charged plates."
  },
  {
    q: "Which of the following is a safety hazard caused by static electricity?",
    o: ["Photocopying machine operation", "Fires during refuelling of aircraft", "Electrostatic spray painting", "Laser printing"],
    a: 1,
    e: "Friction between fuel and pipes builds up charge; a spark can ignite fuel vapor."
  },
  {
    q: "Which of the following describes the charge of an electron?",
    o: ["Positive, 1.6 × 10^-19 C", "Negative, 1.6 × 10^-19 C", "Negative, 1 C", "Neutral, 0 C"],
    a: 1,
    e: "An electron has a negative charge of approximately 1.6 × 10^-19 C."
  },
  {
    q: "A neutral metal sphere is earthed while a negative polythene rod is held near it. The earth connection is removed first, then the rod is taken away. What is the charge on the sphere?",
    o: ["Neutral", "Negative", "Positive", "Alternating positive and negative"],
    a: 2,
    e: "Earthing lets electrons escape to the ground. Breaking the earth line first traps the deficit of electrons, leaving it positive."
  },
  {
    q: "If you rub a polythene rod with a woollen cloth, the rod gains 5.0 × 10^-9 C of charge. What is the charge on the cloth?",
    o: ["0 C", "+5.0 × 10^-9 C", "-5.0 × 10^-9 C", "+1.6 × 10^-19 C"],
    a: 1,
    e: "By the Principle of Conservation of Charge, charge is not created. If the rod gains -5nC, the cloth must lose that amount, becoming +5nC."
  },
  {
    q: "Which of the following is NOT an application of static electricity?",
    o: ["Electrostatic precipitator", "Photocopier", "Cathode-ray tube deflection", "Lightning conductor protecting a building"],
    a: 3,
    e: "A lightning conductor is a safety device designed to discharge static buildup and safely guide lightning to earth, preventing damage."
  },
  {
    q: "An object A is attracted to a positive charge. Object A is also attracted to a negative charge. What is object A?",
    o: ["Positively charged", "Negatively charged", "Neutral", "An insulator only"],
    a: 2,
    e: "A neutral object can be attracted to both positive and negative charges through electrostatic induction."
  },
  {
    q: "During spray painting, why is the object being painted earthed?",
    o: ["To prevent painting it", "To attract the charged paint droplets", "To keep it cold", "To let protons escape"],
    a: 1,
    e: "Earthing the object keeps it at a neutral/opposite potential relative to the charged paint droplets, attracting them uniformly."
  },
  {
    q: "How does a lightning conductor protect a tall building?",
    o: ["It repels the clouds.", "It provides a low-resistance path for the charge to flow safely to the ground.", "It absorbs the lightning bolt completely and stores it.", "It turns the building into an insulator."],
    a: 1,
    e: "It provides a safe, low-resistance path for lightning currents to bypass the building's structure into the earth."
  },
  {
    q: "If an object has a net charge of +1.0 C, what does this tell us?",
    o: ["It has a surplus of electrons.", "It has a deficit of protons.", "It has a deficit of electrons.", "It contains no electrons at all."],
    a: 2,
    e: "A net positive charge indicates a deficit of negatively charged electrons."
  },
  {
    q: "Which material makes the best electrostatic insulator?",
    o: ["Copper", "Salt water", "Polythene", "Carbon rod"],
    a: 2,
    e: "Polythene is a polymer with tightly bound electrons, making it an excellent insulator."
  },
  {
    q: "Why do your hairs stand up after rubbing a balloon on your head?",
    o: ["The balloon attracts the air around the hair.", "Each hair acquires a similar charge and they repel each other.", "The hair loses all its protons.", "The hair becomes a magnet."],
    a: 1,
    e: "Friction transfers electrons. Each hair strand gets the same charge type (e.g. positive) and repels adjacent strands."
  },
  {
    q: "Which particles are easily transferred from one object to another by friction?",
    o: ["Electrons only", "Protons only", "Both electrons and protons", "Neutrons only"],
    a: 0,
    e: "Only valence electrons can be transferred through friction. Protons are bound in the nucleus."
  },
  {
    q: "What prevents static charge from accumulating on a metal rod when rubbed?",
    o: ["Friction doesn't occur on metals.", "Metals have no electrons.", "Charges flow through the metal and the person holding it to the ground.", "Metals immediately destroy charges."],
    a: 2,
    e: "Since metals are conductors, charge easily leaks away to the ground unless the metal is held by an insulating handle."
  },
  {
    q: "What type of force is the electrostatic force?",
    o: ["Contact force", "Non-contact force", "Magnetic force only", "Friction force"],
    a: 1,
    e: "Electrostatic force acts at a distance without physical contact, making it a non-contact force."
  },
  {
    q: "A rubber rod rubbed with fur is negative. A glass rod rubbed with silk is positive. What happens if they are brought close?",
    o: ["They repel.", "They attract.", "Nothing happens.", "They will explode."],
    a: 1,
    e: "Unlike charges attract (negative rubber attracts positive glass)."
  },
  {
    q: "How does the distance between two charges affect the electrostatic force between them?",
    o: ["The force increases as distance increases.", "The force decreases as distance increases.", "The force remains unchanged.", "The force becomes zero instantly."],
    a: 1,
    e: "Electrostatic force is inversely proportional to the square of the distance between the charges; it weakens as distance increases."
  },
  {
    q: "What charge does an atom have overall when it is neutral?",
    o: ["Positive", "Negative", "Zero", "Variable depending on temperature"],
    a: 2,
    e: "Neutral atoms have an equal number of positive protons and negative electrons, yielding a net charge of zero."
  },
  {
    q: "Which of the following is NOT a hazard of static electricity?",
    o: ["Dust explosion in flour mills", "Shock from a metal door knob on a dry day", "Refuelling fire in planes", "Photocopier jam"],
    a: 3,
    e: "A photocopier jam is a mechanical issue, not an electrostatic hazard."
  },
  {
    q: "A conductor has an excess of negative charge. When touched by a finger, it discharges. What moves and where?",
    o: ["Electrons move from the finger to the conductor.", "Electrons move from the conductor to the finger.", "Protons move from the conductor to the finger.", "Protons move from the finger to the conductor."],
    a: 1,
    e: "Excess electrons flow from the charged conductor through the body (finger) to the earth."
  },
  {
    q: "Which of the following can be used to test if an object is charged?",
    o: ["An ammeter", "A gold-leaf electroscope", "A voltmeter", "A barometer"],
    a: 1,
    e: "A gold-leaf electroscope is a classic instrument used to detect the presence and type of electrostatic charge."
  },
  {
    q: "An uncharged metal rod is brought near a positive dome. The rod is briefly touched by hand, then the hand is removed. What is the rod's charge?",
    o: ["Positive", "Negative", "Neutral", "Double positive"],
    a: 1,
    e: "Touching the rod allows electrons from the body to enter the rod, attracted by the positive dome. Removing the hand traps them, leaving the rod negative."
  }
];

// --- APP STATE ---
let currentSection = "section-intro";
let sorterState = {
  currentIdx: 0,
  score: 0,
  items: [],
  maxItems: 5
};
let attractState = {
  currentIdx: 0,
  score: 0,
  maxRounds: 5,
  leftCharge: "+",
  rightCharge: "-"
};
let quizState = {
  questions: [],
  currentIdx: 0,
  score: 0,
  maxQuestions: 10,
  answered: false
};
let flashcardState = {
  cards: [],
  currentIdx: 0
};

// --- DOM ELEMENTS ---
const sections = document.querySelectorAll(".app-section");
const navButtons = document.querySelectorAll(".nav-btn");

// Confetti Setup
const canvas = document.getElementById("confetti-canvas");
const ctx = canvas.getContext("2d");
let confettiActive = false;
let confettiParticles = [];

// Sorter elements
const sorterObject = document.getElementById("sorter-object");
const sorterObjText = document.getElementById("sorter-object-text");
const binPositive = document.getElementById("bin-positive");
const binNegative = document.getElementById("bin-negative");
const sorterCurrentText = document.getElementById("sorter-current");
const sorterScoreText = document.getElementById("sorter-score");
const sorterFeedback = document.getElementById("sorter-feedback");
const sorterFeedbackIcon = document.getElementById("sorter-feedback-icon");
const sorterFeedbackTitle = document.getElementById("sorter-feedback-title");
const sorterFeedbackDesc = document.getElementById("sorter-feedback-desc");

// Attract elements
const nodeLeft = document.getElementById("node-left");
const nodeRight = document.getElementById("node-right");
const sandbox = document.querySelector(".charges-display-sandbox");
const attractCurrentText = document.getElementById("attract-current");
const attractScoreText = document.getElementById("attract-score");
const attractFeedback = document.getElementById("attract-feedback");
const attractFeedbackIcon = document.getElementById("attract-feedback-icon");
const attractFeedbackTitle = document.getElementById("attract-feedback-title");
const attractFeedbackDesc = document.getElementById("attract-feedback-desc");

// Quiz elements
const quizStartScreen = document.getElementById("quiz-start-container");
const quizActiveScreen = document.getElementById("quiz-active-container");
const quizQuestionIdxText = document.getElementById("quiz-question-index");
const quizScoreIndicator = document.getElementById("quiz-score-indicator");
const quizQuestionText = document.getElementById("quiz-question-text");
const quizOptionsContainer = document.getElementById("quiz-options-container");
const quizFeedbackBox = document.getElementById("quiz-feedback-box");
const quizFeedbackExplanation = document.getElementById("quiz-feedback-explanation");

// Scoring elements
const scoringSection = document.getElementById("section-scoring");
const scoreValSorter = document.getElementById("score-val-sorter");
const scoreValAttract = document.getElementById("score-val-attract");
const scoreValQuiz = document.getElementById("score-val-quiz");
const scoreValTotal = document.getElementById("score-val-total");
const tierTitle = document.getElementById("tier-title");
const tierDesc = document.getElementById("tier-desc");
const tierBox = document.getElementById("tier-box");

// Flashcard elements
const flashcard = document.getElementById("interactive-flashcard");
const cardFrontText = document.getElementById("card-front-text");
const cardFrontCategory = document.getElementById("card-front-category");
const cardBackText = document.getElementById("card-back-text");
const cardCurrentIdx = document.getElementById("card-current-idx");
const cardTotalCount = document.getElementById("card-total-count");
const cardProgressFill = document.getElementById("card-progress-fill");


// --- INITIALIZATION ---
window.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  setupSection1Demo();
  setupSorterDragDrop();
  setupAttractRepelEvents();
  setupQuizEvents();
  setupFlashcardsEvents();
  setupResizeCanvas();
  
  // Start the background animation loop for confetti
  requestAnimationFrame(confettiLoop);
});

// Navigation logic
function setupNavigation() {
  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-target");
      navigateToSection(target);
    });
  });

  // Home screen primary buttons
  document.querySelector(".start-journey-btn").addEventListener("click", () => {
    navigateToSection("section-games");
  });

  // Game select screen buttons
  document.getElementById("btn-start-sorter").addEventListener("click", () => {
    startSorterGame();
  });
  document.getElementById("btn-start-attract").addEventListener("click", () => {
    startAttractGame();
  });
  document.getElementById("btn-start-quiz").addEventListener("click", () => {
    startMCQQuiz();
  });

  // Back buttons
  document.getElementById("back-to-games-a").addEventListener("click", () => navigateToSection("section-games"));
  document.getElementById("back-to-games-b").addEventListener("click", () => navigateToSection("section-games"));

  // Scoring button actions
  document.getElementById("btn-retry-all").addEventListener("click", () => {
    navigateToSection("section-games");
  });
  document.getElementById("btn-goto-revision").addEventListener("click", () => {
    navigateToSection("section-cards");
  });
  document.getElementById("btn-goto-intro-redo").addEventListener("click", () => {
    navigateToSection("section-intro");
  });
}

function navigateToSection(sectionId) {
  // Clear any active game alerts / transitions
  sorterFeedback.classList.add("hide");
  attractFeedback.classList.add("hide");

  sections.forEach(sec => {
    if (sec.id === sectionId) {
      sec.style.display = "flex";
      // Force repaint
      sec.offsetHeight;
      sec.classList.add("active-section");
    } else {
      sec.classList.remove("active-section");
      sec.style.display = "none";
    }
  });

  // Sync nav buttons active states
  navButtons.forEach(btn => {
    const target = btn.getAttribute("data-target");
    if (target === sectionId || (sectionId.startsWith("game-") && target === "section-games")) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  currentSection = sectionId;
}


// --- CONFETTI SYSTEM (CELEBRATORY EFFECTS) ---
function setupResizeCanvas() {
  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function triggerCelebration() {
  confettiActive = true;
  confettiParticles = [];
  const colors = ["#00f0ff", "#ff007f", "#ffe600", "#00ff66", "#ffffff"];
  
  for (let i = 0; i < 60; i++) {
    confettiParticles.push({
      x: canvas.width / 2 + (Math.random() - 0.5) * 100,
      y: canvas.height * 0.4 + (Math.random() - 0.5) * 60,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedX: (Math.random() - 0.5) * 12,
      speedY: -Math.random() * 12 - 4,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      opacity: 1
    });
  }

  // Deactivate after 1.5 seconds
  setTimeout(() => {
    confettiActive = false;
  }, 1500);
}

function confettiLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (confettiParticles.length > 0) {
    for (let i = confettiParticles.length - 1; i >= 0; i--) {
      const p = confettiParticles[i];
      p.x += p.speedX;
      p.y += p.speedY;
      p.speedY += 0.35; // Gravity
      p.rotation += p.rotationSpeed;
      p.opacity -= 0.015;

      if (p.opacity <= 0 || p.y > canvas.height) {
        confettiParticles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      
      // Draw rectangular confetti piece
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
      ctx.restore();
    }
  }

  requestAnimationFrame(confettiLoop);
}


// --- SECTION 1: CONCEPT INTRO LIVE DEMO ---
function setupSection1Demo() {
  const btnUnlike = document.getElementById("demo-unlike");
  const btnLike = document.getElementById("demo-like");
  const demoViewport = document.querySelector(".demo-viewport");
  const leftCharge = document.getElementById("demo-charge-left");
  const rightCharge = document.getElementById("demo-charge-right");

  // Default is unlike attract
  demoViewport.classList.add("attract-mode");

  btnUnlike.addEventListener("click", () => {
    btnUnlike.classList.add("active");
    btnLike.classList.remove("active");
    
    demoViewport.classList.remove("repel-mode");
    demoViewport.classList.add("attract-mode");

    leftCharge.className = "demo-charge positive";
    leftCharge.textContent = "+";
    rightCharge.className = "demo-charge negative";
    rightCharge.textContent = "−";
  });

  btnLike.addEventListener("click", () => {
    btnLike.classList.add("active");
    btnUnlike.classList.remove("active");

    demoViewport.classList.remove("attract-mode");
    demoViewport.classList.add("repel-mode");

    leftCharge.className = "demo-charge negative";
    leftCharge.textContent = "−";
    rightCharge.className = "demo-charge negative";
    rightCharge.textContent = "−";
  });
}


// --- SECTION 2 PART A: CHARGE SORTER GAME ---
function startSorterGame() {
  sorterState.score = 0;
  sorterState.currentIdx = 0;
  // Shuffle and pick 5 templates
  sorterState.items = [...OBJECT_TEMPLATES]
    .sort(() => 0.5 - Math.random())
    .slice(0, sorterState.maxItems);

  navigateToSection("game-sorter-mode");
  loadSorterItem();
}

function loadSorterItem() {
  sorterFeedback.classList.add("hide");
  sorterObject.style.transform = "translate(0, 0)";
  
  if (sorterState.currentIdx >= sorterState.maxItems) {
    completeSorterGame();
    return;
  }

  sorterCurrentText.textContent = sorterState.currentIdx + 1;
  sorterScoreText.textContent = sorterState.score;

  const currentItem = sorterState.items[sorterState.currentIdx];
  sorterObjText.textContent = currentItem.text;

  // Simple animation to fly in object
  sorterObject.style.opacity = 0;
  sorterObject.style.transform = "translateY(-40px)";
  setTimeout(() => {
    sorterObject.style.transition = "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s";
    sorterObject.style.opacity = 1;
    sorterObject.style.transform = "translate(0,0)";
  }, 50);
}

function setupSorterDragDrop() {
  // Mouse Drag Events
  sorterObject.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", "sorter-item");
    sorterObject.classList.add("dragging");
  });

  sorterObject.addEventListener("dragend", () => {
    sorterObject.classList.remove("dragging");
  });

  [binPositive, binNegative].forEach(bin => {
    bin.addEventListener("dragover", (e) => {
      e.preventDefault();
      bin.classList.add("drag-over");
    });

    bin.addEventListener("dragleave", () => {
      bin.classList.remove("drag-over");
    });

    bin.addEventListener("drop", (e) => {
      e.preventDefault();
      bin.classList.remove("drag-over");
      handleBinSelection(bin.getAttribute("data-charge"));
    });

    // Touch support / Tap fallback support
    bin.addEventListener("click", () => {
      handleBinSelection(bin.getAttribute("data-charge"));
    });
  });

  // Touch Move Drag & Drop Support
  let touchStartPos = { x: 0, y: 0 };
  let currentObjPos = { x: 0, y: 0 };

  sorterObject.addEventListener("touchstart", (e) => {
    const touch = e.touches[0];
    touchStartPos.x = touch.clientX;
    touchStartPos.y = touch.clientY;
    sorterObject.style.transition = "none";
  }, { passive: true });

  sorterObject.addEventListener("touchmove", (e) => {
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartPos.x;
    const dy = touch.clientY - touchStartPos.y;
    currentObjPos.x = dx;
    currentObjPos.y = dy;
    sorterObject.style.transform = `translate(${dx}px, ${dy}px)`;

    // Detect if hover over bin
    const binPos = binPositive.getBoundingClientRect();
    const binNeg = binNegative.getBoundingClientRect();
    const touchX = touch.clientX;
    const touchY = touch.clientY;

    if (touchX > binPos.left && touchX < binPos.right && touchY > binPos.top && touchY < binPos.bottom) {
      binPositive.classList.add("drag-over");
    } else {
      binPositive.classList.remove("drag-over");
    }

    if (touchX > binNeg.left && touchX < binNeg.right && touchY > binNeg.top && touchY < binNeg.bottom) {
      binNegative.classList.add("drag-over");
    } else {
      binNegative.classList.remove("drag-over");
    }
  }, { passive: true });

  sorterObject.addEventListener("touchend", (e) => {
    binPositive.classList.remove("drag-over");
    binNegative.classList.remove("drag-over");

    // Check where finger was lifted
    const touch = e.changedTouches[0];
    const binPos = binPositive.getBoundingClientRect();
    const binNeg = binNegative.getBoundingClientRect();
    const touchX = touch.clientX;
    const touchY = touch.clientY;

    if (touchX > binPos.left && touchX < binPos.right && touchY > binPos.top && touchY < binPos.bottom) {
      handleBinSelection("positive");
    } else if (touchX > binNeg.left && touchX < binNeg.right && touchY > binNeg.top && touchY < binNeg.bottom) {
      handleBinSelection("negative");
    } else {
      // Return to center
      sorterObject.style.transition = "transform 0.3s ease";
      sorterObject.style.transform = "translate(0, 0)";
    }
  });

  // Next item button on Sorter feedback
  document.getElementById("btn-next-sorter").addEventListener("click", () => {
    sorterState.currentIdx++;
    loadSorterItem();
  });
}

function handleBinSelection(selectedCharge) {
  // Prevent duplicate submissions while feedback is active
  if (!sorterFeedback.classList.contains("hide")) return;

  const currentItem = sorterState.items[sorterState.currentIdx];
  const isCorrect = currentItem.charge === selectedCharge;

  if (isCorrect) {
    sorterState.score++;
    sorterFeedbackIcon.textContent = "🎉";
    sorterFeedbackTitle.textContent = "Correct!";
    triggerCelebration();
  } else {
    sorterFeedbackIcon.textContent = "❌";
    sorterFeedbackTitle.textContent = "Incorrect";
  }

  sorterFeedbackDesc.textContent = currentItem.expl;
  sorterFeedback.classList.remove("hide");
}

function completeSorterGame() {
  navigateToSection("section-games");
  alert(`Charge Sorter Complete! Score: ${sorterState.score}/5`);
}


// --- SECTION 2 PART B: ATTRACT OR REPEL GAME ---
function startAttractGame() {
  attractState.score = 0;
  attractState.currentIdx = 0;
  navigateToSection("game-attract-mode");
  loadAttractRound();
}

function loadAttractRound() {
  attractFeedback.classList.add("hide");
  sandbox.className = "charges-display-sandbox";
  
  if (attractState.currentIdx >= attractState.maxRounds) {
    completeAttractGame();
    return;
  }

  attractCurrentText.textContent = attractState.currentIdx + 1;
  attractScoreText.textContent = attractState.score;

  // Randomize charges: "+" or "−"
  const signs = ["+", "−"];
  attractState.leftCharge = signs[Math.floor(Math.random() * 2)];
  attractState.rightCharge = signs[Math.floor(Math.random() * 2)];

  // Apply signs
  nodeLeft.textContent = attractState.leftCharge;
  nodeLeft.className = `charge-node ${attractState.leftCharge === "+" ? "positive" : "negative"}`;
  
  nodeRight.textContent = attractState.rightCharge;
  nodeRight.className = `charge-node ${attractState.rightCharge === "+" ? "positive" : "negative"}`;

  // Fly in animation reset
  nodeLeft.style.transform = "translateX(0px)";
  nodeRight.style.transform = "translateX(0px)";
}

function setupAttractRepelEvents() {
  document.getElementById("btn-choose-attract").addEventListener("click", () => handleAttractChoice("ATTRACT"));
  document.getElementById("btn-choose-repel").addEventListener("click", () => handleAttractChoice("REPEL"));
  
  document.getElementById("btn-next-attract").addEventListener("click", () => {
    attractState.currentIdx++;
    loadAttractRound();
  });
}

function handleAttractChoice(choice) {
  if (!attractFeedback.classList.contains("hide")) return;

  const isLike = attractState.leftCharge === attractState.rightCharge;
  const correctChoice = isLike ? "REPEL" : "ATTRACT";
  const isCorrect = choice === correctChoice;

  // Apply visual movement animation
  if (correctChoice === "ATTRACT") {
    sandbox.classList.add("animate-attract");
  } else {
    sandbox.classList.add("animate-repel");
  }

  if (isCorrect) {
    attractState.score++;
    attractFeedbackIcon.textContent = "🎉";
    attractFeedbackTitle.textContent = "Correct!";
    triggerCelebration();
  } else {
    attractFeedbackIcon.textContent = "❌";
    attractFeedbackTitle.textContent = "Incorrect";
  }

  attractFeedbackDesc.textContent = isLike 
    ? "Like charges always push apart (repel)." 
    : "Unlike charges always pull together (attract).";

  attractFeedback.classList.remove("hide");
}

function completeAttractGame() {
  navigateToSection("section-games");
  alert(`Attract or Repel Complete! Score: ${attractState.score}/5`);
}


// --- SECTION 3: MCQ QUIZ LOGIC ---
function startMCQQuiz() {
  quizState.score = 0;
  quizState.currentIdx = 0;
  quizState.answered = false;
  
  // Choose 10 non-repeating questions
  quizState.questions = [...QUIZ_POOL]
    .sort(() => 0.5 - Math.random())
    .slice(0, quizState.maxQuestions);

  quizStartScreen.classList.add("hide");
  quizActiveScreen.classList.remove("hide");
  loadQuizQuestion();
}

function loadQuizQuestion() {
  quizFeedbackBox.classList.add("hide");
  quizState.answered = false;

  if (quizState.currentIdx >= quizState.maxQuestions) {
    completeQuiz();
    return;
  }

  quizQuestionIdxText.textContent = quizState.currentIdx + 1;
  quizScoreIndicator.textContent = `Score: ${quizState.score}/${quizState.currentIdx}`;

  const currentQ = quizState.questions[quizState.currentIdx];
  quizQuestionText.textContent = currentQ.q;
  quizOptionsContainer.innerHTML = "";

  currentQ.o.forEach((optText, index) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = optText;
    btn.addEventListener("click", () => handleQuizAnswer(index, btn));
    quizOptionsContainer.appendChild(btn);
  });
}

function handleQuizAnswer(selectedIndex, selectedBtn) {
  if (quizState.answered) return;
  quizState.answered = true;

  const currentQ = quizState.questions[quizState.currentIdx];
  const isCorrect = selectedIndex === currentQ.a;
  
  // Highlight correct/incorrect buttons
  const optionButtons = quizOptionsContainer.querySelectorAll(".option-btn");
  optionButtons.forEach((btn, index) => {
    btn.disabled = true;
    if (index === currentQ.a) {
      btn.classList.add("correct");
    } else if (index === selectedIndex && !isCorrect) {
      btn.classList.add("incorrect");
    }
  });

  if (isCorrect) {
    quizState.score++;
    quizFeedbackBox.className = "quiz-feedback-box correct-feedback";
    quizFeedbackBox.querySelector(".quiz-feedback-status-icon").textContent = "🎉";
    quizFeedbackBox.querySelector(".quiz-feedback-status-text").textContent = "Correct!";
    triggerCelebration();
  } else {
    quizFeedbackBox.className = "quiz-feedback-box incorrect-feedback";
    quizFeedbackBox.querySelector(".quiz-feedback-status-icon").textContent = "❌";
    quizFeedbackBox.querySelector(".quiz-feedback-status-text").textContent = "Incorrect";
  }

  quizFeedbackExplanation.textContent = currentQ.e;
  quizFeedbackBox.classList.remove("hide");
}

function setupQuizEvents() {
  document.getElementById("btn-quiz-next").addEventListener("click", () => {
    quizState.currentIdx++;
    loadQuizQuestion();
  });
}

function completeQuiz() {
  quizActiveScreen.classList.add("hide");
  quizStartScreen.classList.remove("hide");
  showScoringBreakdown();
}


// --- SECTION 4: SCORING & FEEDBACK ---
function showScoringBreakdown() {
  scoreValSorter.textContent = `${sorterState.score} / 5`;
  scoreValAttract.textContent = `${attractState.score} / 5`;
  scoreValQuiz.textContent = `${quizState.score} / 10`;

  const totalPoints = sorterState.score + attractState.score + quizState.score;
  const maxPoints = 20;
  const percentage = Math.round((totalPoints / maxPoints) * 100);
  scoreValTotal.textContent = `${percentage}%`;

  // Determine feedback tier
  tierBox.className = "tier-message-box"; // reset
  const redoIntroBtn = document.getElementById("btn-goto-intro-redo");

  if (percentage >= 80) {
    tierTitle.textContent = "🏆 Excellent Performance! (Distinction)";
    tierDesc.textContent = "Fantastic work! You have full mastery of O-Level Static Electricity. You are ready to ace this topic in your exams!";
    tierBox.classList.add("tier-gold");
    redoIntroBtn.classList.add("hide");
  } else if (percentage >= 50) {
    tierTitle.textContent = "👍 Good Effort! (Pass)";
    tierDesc.textContent = "You're on the right track! However, a quick review of electron transfers and induction will secure you a top grade. Try reviewing the flashcards!";
    tierBox.classList.add("tier-silver");
    redoIntroBtn.classList.add("hide");
  } else {
    tierTitle.textContent = "💪 Keep Practising! (Needs Review)";
    tierDesc.textContent = "Static electricity can be tricky. Remember: only negative electrons flow! We highly recommend revisiting the concept intro section.";
    tierBox.classList.add("tier-bronze");
    redoIntroBtn.classList.remove("hide");
  }

  navigateToSection("section-scoring");
}


// --- SECTION 5: FLASHCARD REVISION ---
function startFlashcards() {
  // Shuffle cards
  flashcardState.cards = [...FLASHCARDS].sort(() => 0.5 - Math.random());
  flashcardState.currentIdx = 0;
  loadFlashcard();
}

function loadFlashcard() {
  flashcard.classList.remove("flipped");
  
  const total = flashcardState.cards.length;
  cardTotalCount.textContent = total;
  cardCurrentIdx.textContent = flashcardState.currentIdx + 1;

  // Update Progress Fill
  const progressPercent = ((flashcardState.currentIdx + 1) / total) * 100;
  cardProgressFill.style.width = `${progressPercent}%`;

  const currentCard = flashcardState.cards[flashcardState.currentIdx];
  cardFrontCategory.textContent = currentCard.cat;
  cardFrontText.textContent = currentCard.q;
  cardBackText.textContent = currentCard.a;
}

function setupFlashcardsEvents() {
  // Flip Card on tap
  flashcard.addEventListener("click", () => {
    flashcard.classList.toggle("flipped");
  });

  // Buttons controls
  document.getElementById("btn-prev-card").addEventListener("click", (e) => {
    e.stopPropagation();
    if (flashcardState.currentIdx > 0) {
      flashcardState.currentIdx--;
      loadFlashcard();
    }
  });

  document.getElementById("btn-next-card").addEventListener("click", (e) => {
    e.stopPropagation();
    if (flashcardState.currentIdx < flashcardState.cards.length - 1) {
      flashcardState.currentIdx++;
      loadFlashcard();
    }
  });

  document.getElementById("btn-shuffle-cards").addEventListener("click", (e) => {
    e.stopPropagation();
    startFlashcards();
  });

  // Start deck when navigating to cards section
  document.getElementById("btn-nav-cards").addEventListener("click", () => {
    startFlashcards();
  });
}
