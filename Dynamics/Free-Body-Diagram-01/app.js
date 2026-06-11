/**
 * Dynamics Free Body Diagram Builder - Game Script
 * Designed for O-Level Physics Syllabus 6091
 */

// Scenarios database
const SCENARIOS = [
  {
    id: 1,
    name: "Book resting on a table",
    graphic: "📘",
    description: "A textbook is resting horizontally at rest on a flat study table. Identify and draw the force arrows acting on the textbook.",
    isBalanced: true,
    correctForces: [
      { force: "Weight", direction: "down", relativeSize: "medium" },
      { force: "Normal Force", direction: "up", relativeSize: "medium" }
    ],
    subQuestion: {
      question: "Is this object accelerating?",
      options: [
        "Yes, upward",
        "Yes, downward",
        "No, the forces are balanced"
      ],
      answer: "No, the forces are balanced",
      explanation: "Since the book is at rest, its acceleration is zero. By Newton's First Law, the resultant force is zero, meaning forces must be balanced (Weight = Normal Force)."
    }
  },
  {
    id: 2,
    name: "Box pushed at constant speed",
    graphic: "📦",
    description: "A heavy wooden box is being pushed to the right across a rough horizontal concrete floor at a constant speed. Identify and draw the forces acting on the box.",
    isBalanced: true,
    correctForces: [
      { force: "Weight", direction: "down", relativeSize: "medium" },
      { force: "Normal Force", direction: "up", relativeSize: "medium" },
      { force: "Applied Force", direction: "right", relativeSize: "medium" },
      { force: "Friction", direction: "left", relativeSize: "medium" }
    ],
    subQuestion: {
      question: "What is the resultant force acting on the box?",
      options: [
        "Equal to the Applied Force",
        "Equal to Friction",
        "0 N",
        "Cannot be determined"
      ],
      answer: "0 N",
      explanation: "Constant speed means zero acceleration. According to Newton's First Law, zero acceleration implies the resultant force is exactly 0 N."
    }
  },
  {
    id: 3,
    name: "Ball falling (before terminal velocity)",
    graphic: "⚽",
    description: "A tennis ball is falling downwards through the air, before reaching terminal velocity. Identify and draw the forces acting on the ball. (Hint: Pay attention to arrow lengths!)",
    isBalanced: false,
    correctForces: [
      { force: "Weight", direction: "down", relativeSize: "large" },
      { force: "Air Resistance", direction: "up", relativeSize: "small" }
    ],
    subQuestion: {
      question: "Which direction is the ball accelerating?",
      options: [
        "Downward",
        "Upward",
        "It is not accelerating"
      ],
      answer: "Downward",
      explanation: "Since the ball has not yet reached terminal velocity, the downward weight is greater than the upward air resistance. The resultant force is downward, causing downward acceleration."
    }
  },
  {
    id: 4,
    name: "Ball at terminal velocity",
    graphic: "⚽",
    description: "A tennis ball is falling downwards through the air, having now reached its terminal velocity. Identify and draw the forces acting on the ball.",
    isBalanced: true,
    correctForces: [
      { force: "Weight", direction: "down", relativeSize: "medium" },
      { force: "Air Resistance", direction: "up", relativeSize: "medium" }
    ],
    subQuestion: {
      question: "What is the resultant force at terminal velocity?",
      options: [
        "Equal to weight",
        "0 N",
        "Equal to air resistance",
        "Increasing downwards"
      ],
      answer: "0 N",
      explanation: "At terminal velocity, the upward air resistance increases until it equals the downward weight. The forces are balanced, so the resultant force is 0 N and acceleration is zero."
    }
  },
  {
    id: 5,
    name: "Hanging traffic light",
    graphic: "🚦",
    description: "A traffic light is suspended in equilibrium, hanging from two cables angled upwards and outwards. Identify and draw the forces acting on the traffic light.",
    isBalanced: true,
    correctForces: [
      { force: "Weight", direction: "down", relativeSize: "medium" },
      { force: "Tension", direction: "diag-left", relativeSize: "medium" },
      { force: "Tension", direction: "diag-right", relativeSize: "medium" }
    ],
    subQuestion: {
      question: "How many forces act on the traffic light?",
      options: [
        "2 forces",
        "3 forces",
        "4 forces",
        "5 forces"
      ],
      answer: "3 forces",
      explanation: "The traffic light is acted on by 3 forces: its weight pulling it downwards, and two tension forces pulling along the cables (angled left-up and right-up)."
    }
  },
  {
    id: 6,
    name: "Rocket accelerating upward",
    graphic: "🚀",
    description: "A space rocket is accelerating vertically upward after launch. Identify and draw the forces acting on the rocket.",
    isBalanced: false,
    correctForces: [
      { force: "Thrust", direction: "up", relativeSize: "large" },
      { force: "Weight", direction: "down", relativeSize: "medium" }
    ],
    subQuestion: {
      question: "What is the direction of the resultant force?",
      options: [
        "Downward",
        "Upward",
        "Zero resultant force"
      ],
      answer: "Upward",
      explanation: "To accelerate upward, the upward thrust must exceed the downward weight. The resultant force is directed upward, in the direction of acceleration."
    }
  },
  {
    id: 7,
    name: "Car braking to a stop",
    graphic: "🚗",
    description: "A car is traveling to the right on a flat road and brakes to a stop. Identify and draw the forces acting on the car during braking.",
    isBalanced: false,
    correctForces: [
      { force: "Weight", direction: "down", relativeSize: "medium" },
      { force: "Normal Force", direction: "up", relativeSize: "medium" },
      { force: "Friction", direction: "left", relativeSize: "medium" }
    ],
    subQuestion: {
      question: "What force is causing the car to decelerate?",
      options: [
        "Weight",
        "Normal Force",
        "Friction",
        "Applied engine force"
      ],
      answer: "Friction",
      explanation: "Friction between the tires and the road surface acts in the direction opposing motion (to the left), creating an unbalanced resultant force that causes deceleration."
    }
  }
];

// MCQ Quiz Database (Pool of 7 questions, 5 will be selected)
const MCQ_POOL = [
  {
    question: "A skydiver reaches terminal velocity. What can you say about the forces?",
    options: [
      "Weight > Air Resistance",
      "Weight = Air Resistance",
      "Weight < Air Resistance",
      "No forces act on him"
    ],
    answer: "Weight = Air Resistance",
    explanation: "At terminal velocity, air resistance equals the weight of the skydiver. The resultant force is 0 N, so forces are balanced."
  },
  {
    question: "A box moves at constant speed on a rough surface. What is the resultant force?",
    options: [
      "Equal to friction",
      "Equal to applied force",
      "0 N",
      "Cannot be determined"
    ],
    answer: "0 N",
    explanation: "Constant speed means zero acceleration, so according to Newton's Second Law (F = ma), the resultant force is 0 N."
  },
  {
    question: "Which pair of forces is an action-reaction pair when a book rests on a table?",
    options: [
      "Weight and Normal Force",
      "Earth pulling book down and book pulling Earth up",
      "Friction and Applied Force",
      "Tension and Weight"
    ],
    answer: "Earth pulling book down and book pulling Earth up",
    explanation: "Action-reaction pairs must act on DIFFERENT objects. Weight and Normal Force both act on the book, so they are not an action-reaction pair. Earth's gravitational pull on the book and the book's pull on Earth is a true action-reaction pair."
  },
  {
    question: "A free body diagram shows only ONE force acting on an object. What must be true?",
    options: [
      "Object is stationary",
      "Object is accelerating",
      "Object moves at constant speed",
      "Object has no mass"
    ],
    answer: "Object is accelerating",
    explanation: "A single unbalanced force means the resultant force is non-zero, which according to Newton's Second Law must result in acceleration."
  },
  {
    question: "In which scenario are the forces on an object balanced?",
    options: [
      "Car speeding up",
      "Ball thrown upward",
      "Parachutist at terminal velocity",
      "Rocket launching"
    ],
    answer: "Parachutist at terminal velocity",
    explanation: "At terminal velocity, the upward air resistance balances the downward weight, resulting in zero acceleration and a constant velocity."
  },
  {
    question: "A tension force in a rope always acts:",
    options: [
      "Downward",
      "Away from the object along the rope",
      "Toward the object along the rope",
      "Perpendicular to the rope"
    ],
    answer: "Away from the object along the rope",
    explanation: "Tension is a pulling force. It always pulls away from the object to which the rope is attached."
  },
  {
    question: "Which of the following is NOT shown in a free body diagram?",
    options: [
      "Weight",
      "Normal Force",
      "The surface the object rests on",
      "Friction"
    ],
    answer: "The surface the object rests on",
    explanation: "Free Body Diagrams only depict the object itself and the external force vectors acting directly ON that object, not surrounding surfaces or structures."
  }
];

// Game State
let currentScenarioIndex = 0;
let shuffledScenarios = [];
let activeForces = []; // { force, direction, relativeSize }
let selectedForce = null;
let currentAttempt = 2;
let fbdScore = 0;
let quizScore = 0;

// MCQ Quiz state
let shuffledQuizQuestions = [];
let currentQuizQuestionIndex = 0;

// Force style specifications
const FORCE_CONFIGS = {
  "Weight": { id: "arrow-weight", color: "#ef4444" },
  "Normal Force": { id: "arrow-normal", color: "#3b82f6" },
  "Friction": { id: "arrow-friction", color: "#f97316" },
  "Tension": { id: "arrow-tension", color: "#a855f7" },
  "Air Resistance": { id: "arrow-air", color: "#06b6d4" },
  "Thrust": { id: "arrow-thrust", color: "#d97706" },
  "Applied Force": { id: "arrow-applied", color: "#10b981" }
};

// Size Length specifications
const SIZE_LENGTHS = {
  "small": 60,
  "medium": 100,
  "large": 140
};

// Direction vector values relative to COG
const DIRECTION_VECTORS = {
  "up": { dx: 0, dy: -1 },
  "down": { dx: 0, dy: 1 },
  "left": { dx: -1, dy: 0 },
  "right": { dx: 1, dy: 0 },
  "diag-left": { dx: -0.707, dy: -0.707 },
  "diag-right": { dx: 0.707, dy: -0.707 }
};

// DOM Elements
const fbdScoreEl = document.getElementById("fbd-score");
const quizScoreEl = document.getElementById("quiz-score");
const totalScoreEl = document.getElementById("total-score");

const scenarioCounterEl = document.getElementById("scenario-counter");
const currentScenarioNameEl = document.getElementById("current-scenario-name");
const progressFillEl = document.getElementById("progress-fill");
const scenarioDescriptionEl = document.getElementById("scenario-description");

const physicalObjectEl = document.getElementById("physical-object");
const objectGraphicEl = document.getElementById("object-graphic");
const svgEl = document.getElementById("fbd-svg");
const arrowsGroupEl = document.getElementById("arrows-group");
const hotspotsLayer = document.getElementById("hotspots-layer");
const hotspots = document.querySelectorAll(".hotspot-btn");

const forceBtns = document.querySelectorAll(".force-btn");
const sizeSelectorContainer = document.getElementById("size-selector-container");
const sizeBtns = document.querySelectorAll(".size-btn");
const activeForcesList = document.getElementById("active-forces-list");

const attemptsLeftEl = document.getElementById("attempts-left");
const checkAnswerBtn = document.getElementById("check-answer-btn");
const resetScenarioBtn = document.getElementById("reset-scenario-btn");

// Modal Elements
const modalContainer = document.getElementById("modal-container");
const scenarioFeedbackContent = document.getElementById("scenario-feedback-content");
const finalResultsContent = document.getElementById("final-results-content");
const feedbackTitle = document.getElementById("feedback-title");
const validationSummary = document.getElementById("validation-summary");
const quizSubQuestionContainer = document.getElementById("quiz-sub-question-container");
const subQuestionText = document.getElementById("sub-question-text");
const subQuestionOptions = document.getElementById("sub-question-options");
const subExplanation = document.getElementById("sub-explanation");
const nextScenarioBtn = document.getElementById("next-scenario-btn");

// MCQ Central Quiz Screen Elements
const gameMain = document.getElementById("game-main");
const mcqQuizScreen = document.getElementById("mcq-quiz-screen");
const quizCounterEl = document.getElementById("quiz-counter");
const mcqQuestionText = document.getElementById("mcq-question-text");
const mcqOptionsContainer = document.getElementById("mcq-options-container");
const mcqExplanation = document.getElementById("mcq-explanation");
const mcqNextBtn = document.getElementById("mcq-next-btn");
const quizProgressFill = document.getElementById("quiz-progress-fill");

// Results Elements
const finalBadgeGraphic = document.getElementById("final-badge-graphic");
const gradeBanner = document.getElementById("grade-banner");
const finalFbdScore = document.getElementById("final-fbd-score");
const finalQuizScore = document.getElementById("final-quiz-score");
const finalTotalScore = document.getElementById("final-total-score");
const gradeComment = document.getElementById("grade-comment");
const restartGameBtn = document.getElementById("restart-game-btn");

// Initial Setup
window.addEventListener("DOMContentLoaded", () => {
  initGame();
  setupEventListeners();
});

// Initialize / Restart game
function initGame() {
  currentScenarioIndex = 0;
  fbdScore = 0;
  quizScore = 0;
  
  // Shuffle Scenarios
  shuffledScenarios = [...SCENARIOS].sort(() => Math.random() - 0.5);
  
  // Shuffle MCQ quiz questions and select 5
  shuffledQuizQuestions = [...MCQ_POOL]
    .sort(() => Math.random() - 0.5)
    .slice(0, 5);
    
  updateScoresDisplay();
  loadScenario(currentScenarioIndex);
  
  // Reset visibility
  gameMain.classList.remove("hidden");
  mcqQuizScreen.classList.add("hidden");
  modalContainer.classList.add("hidden");
  scenarioFeedbackContent.classList.remove("hidden");
  finalResultsContent.classList.add("hidden");
}

// Load a specific scenario by index
function loadScenario(index) {
  const scenario = shuffledScenarios[index];
  currentAttempt = 2;
  activeForces = [];
  selectedForce = null;
  
  // Update Header & Progress
  scenarioCounterEl.textContent = `Scenario ${index + 1} of ${shuffledScenarios.length}`;
  currentScenarioNameEl.textContent = scenario.name;
  progressFillEl.style.width = `${((index + 1) / shuffledScenarios.length) * 100}%`;
  scenarioDescriptionEl.textContent = scenario.description;
  
  // Update Physical Object Graphic
  objectGraphicEl.textContent = scenario.graphic;
  if (scenario.graphic === "🚀") {
    objectGraphicEl.style.transform = "rotate(-45deg)";
    objectGraphicEl.style.display = "inline-block";
  } else {
    objectGraphicEl.style.transform = "";
    objectGraphicEl.style.display = "";
  }
  
  // Clear Force UI & selections
  forceBtns.forEach(btn => btn.classList.remove("active"));
  hotspotsLayer.classList.remove("active-force-selected");
  
  // Toggle length size adjustments depending on balanced state
  if (scenario.isBalanced) {
    sizeSelectorContainer.classList.add("hidden");
  } else {
    sizeSelectorContainer.classList.remove("hidden");
  }
  
  // Set default size selection to Medium
  sizeBtns.forEach(btn => {
    if (btn.getAttribute("data-size") === "medium") {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
  
  updateAttemptsDisplay();
  checkAnswerBtn.disabled = false;
  
  // Refresh canvas drawing and placed lists
  drawArrows();
  renderPlacedForcesList();
}

// Update attempts indicator text
function updateAttemptsDisplay() {
  attemptsLeftEl.textContent = `Attempts Remaining: ${currentAttempt}`;
}

// Update points display in the header
function updateScoresDisplay() {
  fbdScoreEl.textContent = `${fbdScore} / 21`;
  quizScoreEl.textContent = `${quizScore} / 10`;
  totalScoreEl.textContent = `${fbdScore + quizScore} / 31`;
}

// Draw all arrows on the SVG canvas
function drawArrows(feedbackMode = false, evaluationResults = null) {
  arrowsGroupEl.innerHTML = "";
  
  // SVG Canvas dimensions: 650x500 is the grid size
  const svgWidth = svgEl.clientWidth || 600;
  const svgHeight = svgEl.clientHeight || 500;
  const cogX = svgWidth / 2;
  const cogY = svgHeight / 2;
  
  activeForces.forEach(f => {
    const config = FORCE_CONFIGS[f.force] || { id: "arrow-normal", color: "#3b82f6" };
    const vec = DIRECTION_VECTORS[f.direction];
    const len = SIZE_LENGTHS[f.relativeSize] || 100;
    
    if (!vec) return;
    
    // Draw the force arrow line
    const x2 = cogX + vec.dx * len;
    const y2 = cogY + vec.dy * len;
    
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", cogX);
    line.setAttribute("y1", cogY);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.setAttribute("stroke-width", "3.5");
    
    // Marker behavior (e.g. green for correct, red for incorrect in feedback mode)
    let markerId = config.id;
    let strokeColor = config.color;
    
    if (feedbackMode && evaluationResults) {
      const match = evaluationResults.find(res => res.force === f.force && res.direction === f.direction);
      if (match) {
        if (match.correct) {
          markerId = "arrow-correct";
          strokeColor = "#22c55e"; // Correct green
        } else {
          markerId = "arrow-incorrect";
          strokeColor = "#ef4444"; // Incorrect red
        }
      }
    }
    
    line.setAttribute("stroke", strokeColor);
    line.setAttribute("marker-end", `url(#${markerId})`);
    arrowsGroupEl.appendChild(line);
    
    // Create text label background to ensure readability on grid
    const textX = cogX + vec.dx * (len + 15);
    const textY = cogY + vec.dy * (len + 15);
    
    // Add text label
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", textX);
    text.setAttribute("y", textY);
    text.setAttribute("fill", strokeColor);
    text.setAttribute("font-size", "0.85rem");
    text.setAttribute("font-weight", "bold");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "middle");
    text.textContent = f.force;
    arrowsGroupEl.appendChild(text);
  });
}

// Render the list of placed forces in the side panel
function renderPlacedForcesList() {
  activeForcesList.innerHTML = "";
  
  if (activeForces.length === 0) {
    activeForcesList.innerHTML = '<div class="empty-list-msg">Click a force, then click a directional arrow on the grid to add it.</div>';
    return;
  }
  
  activeForces.forEach((f, idx) => {
    const card = document.createElement("div");
    card.className = "force-item-card";
    
    const details = document.createElement("div");
    details.className = "force-item-details";
    
    const name = document.createElement("span");
    name.className = "force-item-name";
    const color = (FORCE_CONFIGS[f.force] || {}).color || "#fff";
    name.innerHTML = `<span class="color-dot" style="background-color: ${color}"></span> ${f.force}`;
    
    const dir = document.createElement("span");
    dir.className = "force-item-dir";
    dir.textContent = `Direction: ${f.direction}`;
    
    details.appendChild(name);
    details.appendChild(dir);
    
    const controls = document.createElement("div");
    controls.className = "force-item-controls";
    
    // If unbalanced scenario, let student change size of specific arrow
    const scenario = shuffledScenarios[currentScenarioIndex];
    if (!scenario.isBalanced) {
      const sizeSelect = document.createElement("select");
      sizeSelect.className = "size-select-dropdown";
      sizeSelect.style.background = "#1e293b";
      sizeSelect.style.color = "#fff";
      sizeSelect.style.border = "1px solid rgba(255,255,255,0.2)";
      sizeSelect.style.fontSize = "0.75rem";
      sizeSelect.style.borderRadius = "0.25rem";
      sizeSelect.style.padding = "0.15rem";
      
      ["small", "medium", "large"].forEach(sz => {
        const opt = document.createElement("option");
        opt.value = sz;
        opt.textContent = sz.charAt(0).toUpperCase() + sz.slice(1);
        if (sz === f.relativeSize) opt.selected = true;
        sizeSelect.appendChild(opt);
      });
      
      sizeSelect.addEventListener("change", (e) => {
        activeForces[idx].relativeSize = e.target.value;
        drawArrows();
      });
      
      controls.appendChild(sizeSelect);
    }
    
    const removeBtn = document.createElement("button");
    removeBtn.className = "btn-remove-force";
    removeBtn.innerHTML = "×";
    removeBtn.title = "Delete arrow";
    removeBtn.addEventListener("click", () => {
      activeForces.splice(idx, 1);
      drawArrows();
      renderPlacedForcesList();
    });
    
    controls.appendChild(removeBtn);
    card.appendChild(details);
    card.appendChild(controls);
    activeForcesList.appendChild(card);
  });
}

// Setup core application event bindings
function setupEventListeners() {
  // Force buttons selection
  forceBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      forceBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedForce = btn.getAttribute("data-force");
      hotspotsLayer.classList.add("active-force-selected");
    });
  });
  
  // Canvas hotspot click direction handler
  hotspots.forEach(hs => {
    hs.addEventListener("click", () => {
      if (!selectedForce) {
        alert("Please select a force from the sidebar first!");
        return;
      }
      
      const dir = hs.getAttribute("data-dir");
      const activeSizeBtn = document.querySelector(".size-btn.active");
      const size = activeSizeBtn ? activeSizeBtn.getAttribute("data-size") : "medium";
      
      // Look if force is already placed in this direction
      const existingIdx = activeForces.findIndex(f => f.direction === dir);
      if (existingIdx !== -1) {
        // Replace direction with new selected force
        activeForces[existingIdx] = { force: selectedForce, direction: dir, relativeSize: size };
      } else {
        // Place new arrow
        activeForces.push({ force: selectedForce, direction: dir, relativeSize: size });
      }
      
      drawArrows();
      renderPlacedForcesList();
    });
  });
  
  // Size selection toggles (sidebar segment control)
  sizeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      sizeBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });
  
  // Clear / Reset scenario workspace
  resetScenarioBtn.addEventListener("click", () => {
    activeForces = [];
    drawArrows();
    renderPlacedForcesList();
  });
  
  // Check FBD Answer handler
  checkAnswerBtn.addEventListener("click", () => {
    evaluateFBD();
  });
  
  // Next Scenario Button Click
  nextScenarioBtn.addEventListener("click", () => {
    modalContainer.classList.add("hidden");
    currentScenarioIndex++;
    if (currentScenarioIndex < shuffledScenarios.length) {
      loadScenario(currentScenarioIndex);
    } else {
      // Transition to Central MCQ Quiz
      startMCQQuiz();
    }
  });
  
  // Restart Game from final scores screen
  restartGameBtn.addEventListener("click", () => {
    initGame();
  });
}

// Evaluate the correctness of the drawn Free Body Diagram
function evaluateFBD() {
  const scenario = shuffledScenarios[currentScenarioIndex];
  let evaluationResults = [];
  let mistakes = [];
  
  // Step 1: Check presence of correct forces (and correct direction)
  scenario.correctForces.forEach(correct => {
    // Find matching force drawn by student
    const match = activeForces.find(f => f.force === correct.force && f.direction === correct.direction);
    
    if (match) {
      evaluationResults.push({ force: match.force, direction: match.direction, correct: true });
    } else {
      // Missing force or placed in wrong direction
      const sameForceWrongDir = activeForces.find(f => f.force === correct.force);
      if (sameForceWrongDir) {
        mistakes.push(`The <strong>${correct.force}</strong> is acting in the wrong direction. (Drawn: ${sameForceWrongDir.direction}, Correct: ${correct.direction})`);
        evaluationResults.push({ force: sameForceWrongDir.force, direction: sameForceWrongDir.direction, correct: false });
      } else {
        mistakes.push(`Missing force: <strong>${correct.force}</strong> is missing from the FBD.`);
      }
    }
  });
  
  // Step 2: Check for extraneous (wrong) forces
  activeForces.forEach(f => {
    const isCorrectForce = scenario.correctForces.some(correct => correct.force === f.force && correct.direction === f.direction);
    if (!isCorrectForce) {
      // Check if it's already highlighted as wrong direction
      const alreadyLogged = evaluationResults.some(res => res.force === f.force && res.direction === f.direction);
      if (!alreadyLogged) {
        mistakes.push(`Incorrect force: <strong>${f.force}</strong> does not act on the object in this scenario (or has the wrong direction).`);
        evaluationResults.push({ force: f.force, direction: f.direction, correct: false });
      }
    }
  });
  
  // Step 3: Size relations check (if unbalanced scenario)
  if (!scenario.isBalanced && mistakes.length === 0) {
    if (scenario.id === 3) { // Ball falling before terminal velocity
      const weight = activeForces.find(f => f.force === "Weight");
      const air = activeForces.find(f => f.force === "Air Resistance");
      if (weight && air) {
        const order = ["small", "medium", "large"];
        const wIdx = order.indexOf(weight.relativeSize);
        const aIdx = order.indexOf(air.relativeSize);
        if (wIdx <= aIdx) {
          mistakes.push("Arrow length error: Before terminal velocity, Weight (pulling down) must be larger than Air Resistance (pushing up) because the ball is accelerating downward.");
        }
      }
    } else if (scenario.id === 6) { // Rocket accelerating upward
      const thrust = activeForces.find(f => f.force === "Thrust");
      const weight = activeForces.find(f => f.force === "Weight");
      if (thrust && weight) {
        const order = ["small", "medium", "large"];
        const tIdx = order.indexOf(thrust.relativeSize);
        const wIdx = order.indexOf(weight.relativeSize);
        if (tIdx <= wIdx) {
          mistakes.push("Arrow length error: To accelerate upward, the Thrust (pushing up) must be larger than Weight (pulling down).");
        }
      }
    }
  }
  
  // Re-draw arrows with color-coded feedback
  drawArrows(true, evaluationResults);
  
  // Evaluate Attempt Scores
  if (mistakes.length === 0) {
    // Correct! Add points based on attempt
    const earned = currentAttempt === 2 ? 3 : 2;
    fbdScore += earned;
    updateScoresDisplay();
    
    // Show Feedback Dialog
    showScenarioSuccessModal(earned);
  } else {
    currentAttempt--;
    updateAttemptsDisplay();
    
    if (currentAttempt > 0) {
      // Attempt 1 failure: show mistakes, let student correct them
      alert(`Some forces are incorrect or missing! You have 1 attempt remaining.\n\nHints:\n- ${mistakes.map(m => m.replace(/<\/?[^>]+(>|$)/g, "")).join("\n- ")}`);
      // Re-draw regular arrows so they can adjust
      setTimeout(() => drawArrows(), 2000);
    } else {
      // Final attempt failure: reveal answer, show explanations
      checkAnswerBtn.disabled = true;
      alert("Attempts exhausted! Let's review the correct diagram together.");
      revealCorrectAnswer();
    }
  }
}

// Force the correct diagram onto the canvas & proceed to question
function revealCorrectAnswer() {
  const scenario = shuffledScenarios[currentScenarioIndex];
  activeForces = JSON.parse(JSON.stringify(scenario.correctForces)); // Clone correct answers
  drawArrows();
  renderPlacedForcesList();
  
  // Trigger transition modal
  showScenarioSuccessModal(0);
}

// Show scenario validation summary and the mini quiz
function showScenarioSuccessModal(earnedPoints) {
  const scenario = shuffledScenarios[currentScenarioIndex];
  
  modalContainer.classList.remove("hidden");
  scenarioFeedbackContent.classList.remove("hidden");
  finalResultsContent.classList.add("hidden");
  
  if (earnedPoints > 0) {
    feedbackTitle.textContent = `Excellent! +${earnedPoints} Points`;
    feedbackTitle.style.color = "#22c55e";
  } else {
    feedbackTitle.textContent = "Scenario Review";
    feedbackTitle.style.color = "#eab308";
  }
  
  // Fill validation info
  validationSummary.innerHTML = "";
  scenario.correctForces.forEach(correct => {
    const div = document.createElement("div");
    div.className = "val-item correct";
    div.innerHTML = `<span class="val-bullet">✓</span> <strong>${correct.force}</strong> acts ${correct.direction}.`;
    validationSummary.appendChild(div);
  });
  
  // Show Sub Question (Quiz details)
  subExplanation.classList.add("hidden");
  nextScenarioBtn.classList.add("hidden");
  subQuestionText.textContent = scenario.subQuestion.question;
  
  subQuestionOptions.innerHTML = "";
  scenario.subQuestion.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "quiz-opt-btn";
    btn.textContent = opt;
    btn.addEventListener("click", () => {
      // Disable other choices
      const allOptBtns = subQuestionOptions.querySelectorAll(".quiz-opt-btn");
      allOptBtns.forEach(b => b.disabled = true);
      
      if (opt === scenario.subQuestion.answer) {
        btn.classList.add("correct");
      } else {
        btn.classList.add("incorrect");
        // highlight correct one
        allOptBtns.forEach(b => {
          if (b.textContent === scenario.subQuestion.answer) b.classList.add("correct");
        });
      }
      
      subExplanation.innerHTML = `<strong>Explanation:</strong> ${scenario.subQuestion.explanation}`;
      subExplanation.classList.remove("hidden");
      nextScenarioBtn.classList.remove("hidden");
    });
    subQuestionOptions.appendChild(btn);
  });
}

// Launch the central O-Level MCQ Quiz Round
function startMCQQuiz() {
  gameMain.classList.add("hidden");
  mcqQuizScreen.classList.remove("hidden");
  currentQuizQuestionIndex = 0;
  loadMCQQuestion(currentQuizQuestionIndex);
}

// Load a single MCQ question
function loadMCQQuestion(index) {
  const q = shuffledQuizQuestions[index];
  
  quizCounterEl.textContent = `Question ${index + 1} of ${shuffledQuizQuestions.length}`;
  quizProgressFill.style.width = `${((index + 1) / shuffledQuizQuestions.length) * 100}%`;
  mcqQuestionText.textContent = q.question;
  
  mcqExplanation.classList.add("hidden");
  mcqNextBtn.classList.add("hidden");
  
  mcqOptionsContainer.innerHTML = "";
  q.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "quiz-opt-btn";
    btn.textContent = opt;
    btn.addEventListener("click", () => {
      const allBtns = mcqOptionsContainer.querySelectorAll(".quiz-opt-btn");
      allBtns.forEach(b => b.disabled = true);
      
      if (opt === q.answer) {
        btn.classList.add("correct");
        quizScore += 2;
        updateScoresDisplay();
      } else {
        btn.classList.add("incorrect");
        allBtns.forEach(b => {
          if (b.textContent === q.answer) b.classList.add("correct");
        });
      }
      
      mcqExplanation.innerHTML = `<strong>Explanation:</strong> ${q.explanation}`;
      mcqExplanation.classList.remove("hidden");
      mcqNextBtn.classList.remove("hidden");
    });
    mcqOptionsContainer.appendChild(btn);
  });
}

// Event action for Next Quiz MCQ button
mcqNextBtn.addEventListener("click", () => {
  currentQuizQuestionIndex++;
  if (currentQuizQuestionIndex < shuffledQuizQuestions.length) {
    loadMCQQuestion(currentQuizQuestionIndex);
  } else {
    // Show Final Results
    showFinalResults();
  }
});

// Display final results page with master grade and scores breakdown
function showFinalResults() {
  mcqQuizScreen.classList.add("hidden");
  modalContainer.classList.remove("hidden");
  scenarioFeedbackContent.classList.add("hidden");
  finalResultsContent.classList.remove("hidden");
  
  const total = fbdScore + quizScore;
  
  finalFbdScore.textContent = `${fbdScore} / 21`;
  finalQuizScore.textContent = `${quizScore} / 10`;
  finalTotalScore.textContent = `${total} / 31`;
  
  let gradeText = "";
  let commentText = "";
  let badgeGraphic = "🎓";
  
  if (total >= 28) {
    gradeText = "Excellent — FBD master!";
    commentText = "Outstanding understanding of balanced/unbalanced force concepts and vector representation!";
    badgeGraphic = "🏆";
  } else if (total >= 20) {
    gradeText = "Good — check your force directions.";
    commentText = "Solid performance! Review scenarios where forces accelerate to refine your vector drawing precision.";
    badgeGraphic = "⭐";
  } else {
    gradeText = "Needs practice — revisit forces first.";
    commentText = "Keep practicing! Review difference between contact and non-contact forces (Weight, Friction, Normal Force).";
    badgeGraphic = "📚";
  }
  
  finalBadgeGraphic.textContent = badgeGraphic;
  gradeBanner.textContent = gradeText;
  gradeComment.textContent = commentText;
}
