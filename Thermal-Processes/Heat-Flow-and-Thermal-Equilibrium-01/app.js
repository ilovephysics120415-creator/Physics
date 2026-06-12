/* ==========================================================================
   JavaScript: O-Level Physics Thermal Processes Web Application
   ========================================================================== */

// --- STATE MANAGEMENT ---
const state = {
  currentTab: 'section-sim',
  scenario: 'hot', // 'hot' or 'cold'
  simRunning: false,
  simTime: 0,
  simInterval: null,
  drinkTemp: 80,
  roomTemp: 25,
  startingDrinkTemp: 80,
  startingRoomTemp: 25,
  
  // Graph Data
  graphData: {
    drink: [],
    room: [],
    time: []
  },
  maxGraphPoints: 120, // Total graph width steps
  equilibriumStep: 80, // 2/3 of total width (120 * 2/3 = 80)
  
  // Flashcards state
  flashcards: [
    {
      q: "What is the definition of thermal equilibrium?",
      a: "A state where two objects in thermal contact have equal temperatures, resulting in zero net heat flow between them."
    },
    {
      q: "What is the rule governing the direction of heat flow?",
      a: "Heat always flows spontaneously from a region of higher temperature to a region of lower temperature."
    },
    {
      q: "What happens to the rate of heat transfer as the temperature difference decreases?",
      a: "The rate of heat transfer decreases, causing the temperature change to slow down (represented by a flattening curve)."
    },
    {
      q: "What does 'net heat flow = 0' mean at thermal equilibrium?",
      a: "Heat energy continues to pass between the objects in both directions, but at equal rates, resulting in no net temperature change."
    },
    {
      q: "Why does the surrounding room temperature stay virtually constant in our simulation?",
      a: "The room has a vastly larger mass of air and heat capacity than the drink, making any temperature increase/decrease negligible."
    },
    {
      q: "How do hot and cold drink scenarios differ in heat flow direction?",
      a: "A hot drink transfers heat outward to the cooler room. A cold drink absorbs heat inward from the warmer room."
    },
    {
      q: "What does the flattening of a temperature-time graph line represent?",
      a: "It shows that the rate of temperature change is decreasing as the system approaches thermal equilibrium."
    }
  ],
  currentCardIndex: 0,
  
  // Quiz state
  quizQuestions: [],
  currentQuestionIndex: 0,
  score: 0,
  selectedAnswer: null,
  
  // Question Pool (30 conceptual questions, no calculations)
  questionPool: [
    {
      q: "A hot cup of Milo at 85°C is left in a room at 25°C. In which direction does net heat flow?",
      options: [
        "From the hot Milo to the surrounding air",
        "From the surrounding air to the hot Milo",
        "There is no net flow of heat because the liquid is static",
        "Heat flows in both directions equally from the start"
      ],
      correct: 0,
      explanation: "Heat always flows from a region of higher temperature (85°C Milo) to a lower temperature (25°C air)."
    },
    {
      q: "A cold soft drink at 5°C is placed in a room at 30°C. Which statement is correct before equilibrium is reached?",
      options: [
        "Net heat flows from the room to the cold drink.",
        "Net heat flows from the cold drink to the room.",
        "Coldness flows from the drink to the room.",
        "No heat is transferred since the glass isolates the drink."
      ],
      correct: 0,
      explanation: "Heat flows from the hotter region (30°C room) to the cooler region (5°C drink)."
    },
    {
      q: "What is the primary condition required for two bodies to be in thermal equilibrium?",
      options: [
        "They must have the exact same temperature.",
        "They must contain the same amount of total internal thermal energy.",
        "They must have the same mass and surface area.",
        "They must be separated by an insulating barrier."
      ],
      correct: 0,
      explanation: "Thermal equilibrium is achieved solely when the temperatures of both objects become equal."
    },
    {
      q: "Which of the following occurs when thermal equilibrium is reached between a drink and a room?",
      options: [
        "The net heat transfer between them becomes zero.",
        "All heat transfer stops completely in both directions.",
        "The drink becomes colder than the room temperature.",
        "The temperature of the room increases significantly to meet the drink."
      ],
      correct: 0,
      explanation: "At equilibrium, microscopic heat transfer continues in both directions at equal rates, so net heat transfer is zero."
    },
    {
      q: "As the temperature difference between a cooling coffee cup and the room decreases, what happens to the rate of heat transfer?",
      options: [
        "It decreases, causing the cooling curve to flatten out.",
        "It increases, causing the cup to cool faster.",
        "It remains constant until thermal equilibrium is suddenly reached.",
        "It becomes unpredictable and oscillates."
      ],
      correct: 0,
      explanation: "The rate of heat transfer is proportional to the temperature difference. A smaller difference means a slower transfer rate."
    },
    {
      q: "A temperature-time graph shows a curve starting at 90°C and curving downwards to flatten out at 25°C. What does this curve represent?",
      options: [
        "A hot drink cooling down to room temperature.",
        "A cold drink warming up to room temperature.",
        "The room temperature changing due to a hot drink.",
        "An object undergoing a phase change from liquid to gas."
      ],
      correct: 0,
      explanation: "The curve shows temperature decreasing from hot (90°C) and stabilizing at room temperature (25°C)."
    },
    {
      q: "Why does the surrounding room temperature line stay flat on the graph during the simulation?",
      options: [
        "The room has a much larger mass of air, so its temperature change is negligible.",
        "Air is a perfect insulator and cannot absorb any heat energy.",
        "The simulation is broken and does not simulate room temperature changes.",
        "The cup is placed in a vacuum flask that prevents heat from escaping."
      ],
      correct: 0,
      explanation: "The room's large air volume and high thermal capacity mean the energy absorbed causes an imperceptible temperature change."
    },
    {
      q: "Which graph line shape represents a cold canned drink warming up in a room?",
      options: [
        "A curve starting low, rising rapidly, then bending to flatten horizontally.",
        "A straight line sloping downwards at a constant angle.",
        "A curve starting high, falling rapidly, then bending to flatten horizontally.",
        "A flat horizontal line that suddenly jumps upwards at the end."
      ],
      correct: 0,
      explanation: "Warming starts fast due to the large initial temp difference, then slows down as the difference decreases, flattening at room temp."
    },
    {
      q: "True or False: 'At thermal equilibrium, heat flow stops completely.'",
      options: [
        "False. Molecular heat transfer continues in both directions at equal rates.",
        "True. Heat flow requires a physical motion which stops completely.",
        "True. Energy cannot exist in two objects at the same temperature.",
        "False. Heat only flows from the colder object to the hotter object now."
      ],
      correct: 0,
      explanation: "Heat flow does not stop; rather, the rates of heat flow in both directions balance out (net heat flow is zero)."
    },
    {
      q: "If Object A (30°C) and Object B (80°C) are placed in thermal contact, which of the following is a possible equilibrium temperature?",
      options: [
        "55°C",
        "25°C",
        "85°C",
        "110°C"
      ],
      correct: 0,
      explanation: "The final equilibrium temperature must lie between the two initial temperatures (30°C and 80°C)."
    },
    {
      q: "A hot copper block at 100°C is dropped into a large bucket of water at 25°C. The final equilibrium temperature is closer to 25°C than 100°C. Why?",
      options: [
        "The water has a much larger mass and capacity to absorb heat without a large temperature rise.",
        "Copper does not transfer heat well to liquids.",
        "Heat flows from the water to the copper block.",
        "Water holds coldness better than copper holds heat."
      ],
      correct: 0,
      explanation: "The substance with the larger heat capacity (mass × specific heat capacity) undergoes a much smaller temperature change."
    },
    {
      q: "What does the slope (gradient) of a temperature-time graph for a cooling drink represent?",
      options: [
        "The rate of temperature change of the drink.",
        "The total quantity of thermal energy in the drink.",
        "The thermal conductivity of the surrounding air.",
        "The mass of the drink."
      ],
      correct: 0,
      explanation: "A temperature-time graph's gradient (dT/dt) represents the rate at which temperature is changing over time."
    {
      q: "Two identical cups of hot tea are at 80°C. Cup A is in a room at 15°C, and Cup B is in a room at 30°C. Which cools faster initially?",
      options: [
        "Cup A, because the initial temperature difference is larger.",
        "Cup B, because the room is warmer and keeps the tea molecules active.",
        "Both cool at the exact same rate since the cups are identical.",
        "Cup B, because heat flows faster into a warmer room."
      ],
      correct: 0,
      explanation: "A larger temperature difference (80°C - 15°C = 65°C vs 80°C - 30°C = 50°C) drives a faster initial rate of heat transfer."
    },
    {
      q: "When a cold glass of milk is warmed by the room, what is the net direction of thermal energy transfer?",
      options: [
        "From the room surroundings to the cold milk.",
        "From the cold milk to the room surroundings.",
        "There is no transfer since milk has a high fat content.",
        "Net transfer is from the glass container to the room."
      ],
      correct: 0,
      explanation: "Heat always flows from the higher temperature environment (room) to the lower temperature object (cold milk)."
    },
    {
      q: "What can be said about the temperatures of two objects that have reached thermal equilibrium?",
      options: [
        "They must be equal.",
        "The smaller object will have a higher temperature.",
        "The denser object will have a lower temperature.",
        "They will sum up to exactly 100°C."
      ],
      correct: 0,
      explanation: "By definition, thermal equilibrium means no net heat flows because their temperatures are identical."
    },
    {
      q: "If you touch a cold metal pole and a wooden post outside, the metal feels colder even though they are at the same temperature. Why?",
      options: [
        "Metal is a better thermal conductor and conducts heat away from your hand faster.",
        "Metal contains less thermal energy than wood at any temperature.",
        "Wood generates its own heat internally.",
        "Your hand absorbs coldness from the metal block."
      ],
      correct: 0,
      explanation: "Sensory coldness is due to the rate of heat loss from your skin. Good conductors like metal conduct heat away from your hand faster."
    },
    {
      q: "When a hot object is placed in contact with a cold object in an isolated system, the heat lost by the hot object is...",
      options: [
        "equal to the heat gained by the cold object.",
        "greater than the heat gained by the cold object.",
        "less than the heat gained by the cold object.",
        "dependent on the chemical composition of the objects."
      ],
      correct: 0,
      explanation: "According to the principle of conservation of energy, in an isolated system, heat lost equals heat gained."
    },
    {
      q: "Which variable does NOT affect the rate of heat transfer from a hot drink on a desk?",
      options: [
        "The volume of the surrounding room air.",
        "The temperature difference between the drink and room.",
        "The surface area of the drink exposed to air.",
        "The material of the cup (insulating vs conducting)."
      ],
      correct: 0,
      explanation: "The total room volume does not affect the instant rate of heat transfer, whereas temperature difference, surface area, and conductivity do."
    },
    {
      q: "Why does the temperature of a hot drink drop rapidly at first, and then cool down more and more slowly?",
      options: [
        "The temperature difference decreases over time, reducing the heat transfer rate.",
        "Liquid molecules lose mass as they cool down.",
        "The cup starts absorbing heat from the surroundings after 5 minutes.",
        "Evaporation stops completely after the first few seconds."
      ],
      correct: 0,
      explanation: "As the drink cools, its temperature approaches the room temperature. This shrinking difference slows the cooling rate."
    },
    {
      q: "Which state represents the end-point of any natural thermal interaction between an object and its environment?",
      options: [
        "Thermal equilibrium",
        "Absolute zero",
        "Phase changes",
        "Thermal expansion"
      ],
      correct: 0,
      explanation: "Natural processes run until temperature differences disappear, reaching thermal equilibrium."
    },
    {
      q: "In the O-Level Physics simulation, what does it mean when the temperature curve of the drink becomes horizontal?",
      options: [
        "The drink has reached the same temperature as the room (thermal equilibrium).",
        "The drink has frozen solid.",
        "The thermometer has reached its maximum reading.",
        "Heat is flowing out faster than ever."
      ],
      correct: 0,
      explanation: "A flat horizontal line indicates a temperature gradient of zero, meaning no further temperature changes and thermal equilibrium."
    },
    {
      q: "If a hot object and cold object are in thermal equilibrium, the rate at which heat moves from hot-to-cold is...",
      options: [
        "equal to the rate of heat moving from cold-to-hot.",
        "zero, because heat cannot move at all.",
        "greater than the rate of heat moving from cold-to-hot.",
        "constantly changing in a random pattern."
      ],
      correct: 0,
      explanation: "Equilibrium is dynamic. Heat transfers in both directions at equal rates, resulting in zero net change."
    },
    {
      q: "A cold drink container has condensation forming on its outer surface. This is because...",
      options: [
        "water vapor in the warmer air loses heat to the cold glass and condenses.",
        "coldness flows out from the drink and condenses into liquid water.",
        "the drink is leaking through microscopic holes in the glass.",
        "the surrounding room is losing all its moisture to the table."
      ],
      correct: 0,
      explanation: "Water vapor in the warm air contacts the cold glass surface, transfers heat to the glass, and condenses into liquid water droplets."
    },
    {
      q: "When a cold drink warms up to room temperature, the condensation on the outside eventually dries up. Why?",
      options: [
        "The glass warms up, stopping condensation, and the liquid evaporates back into the air.",
        "The condensation is absorbed back through the glass into the drink.",
        "The coldness has fully evaporated.",
        "Ice cubes inside the glass absorb the condensation."
      ],
      correct: 0,
      explanation: "Once the glass reaches thermal equilibrium with the room, condensation stops forming, and existing droplets evaporate."
    },
    {
      q: "Which parameter remains constant during a simple heat flow process that does not involve phase changes?",
      options: [
        "The total energy of the closed system.",
        "The temperature of the cooling drink.",
        "The rate of heat transfer.",
        "The temperature difference between the two bodies."
      ],
      correct: 0,
      explanation: "Total energy of a closed system is conserved and remains constant, whereas temperatures and transfer rates change."
    },
    {
      q: "Which material will reach thermal equilibrium with a hot plate fastest if they have the same size and mass?",
      options: [
        "A copper block (good thermal conductor)",
        "A wooden block (poor thermal conductor)",
        "A plastic block (poor thermal conductor)",
        "They will all take the exact same time."
      ],
      correct: 0,
      explanation: "Copper has high thermal conductivity, allowing heat to flow through it much faster, reaching equilibrium quickly."
    },
    {
      q: "If an object is at 0°C in a room at 0°C, is there any heat flow between them?",
      options: [
        "Yes, but the net heat flow is zero.",
        "No, because heat cannot exist at 0°C.",
        "Yes, heat flows only from the room to the object.",
        "No, but the net heat flow is zero."
      ],
      correct: 0,
      explanation: "Since both are at the same temperature, they are in thermal equilibrium. Heat exchanges still happen, but net heat flow is zero."
    },
    {
      q: "The term 'thermal contact' means that two objects are...",
      options: [
        "positioned such that heat energy can transfer between them.",
        "physically glued together with a thermal paste.",
        "at different temperatures.",
        "both in the gaseous state."
      ],
      correct: 0,
      explanation: "Thermal contact simply means energy can flow between them by conduction, convection, or radiation."
    },
    {
      q: "Why is heat transfer considered a 'non-spontaneous' process in the reverse direction (cold to hot)?",
      options: [
        "Natural processes always tend to disperse concentrated energy, flowing from hot to cold.",
        "Cold molecules are too heavy to transfer energy.",
        "Thermodynamics forbids any heat from ever entering a hot object.",
        "Cold objects contain absolutely zero thermal energy."
      ],
      correct: 0,
      explanation: "Spontaneous heat flow always moves down the temperature gradient (hot to cold) to disperse energy."
    }
  ]
};

// --- DOM ELEMENTS ---
const elements = {
  introScreen: document.getElementById('intro-screen'),
  introText: document.getElementById('intro-text'),
  skipIntroBtn: document.getElementById('skip-intro'),
  mainContainer: document.querySelector('.main-container'),
  
  // Navigation Tabs
  navButtons: document.querySelectorAll('.nav-btn'),
  panels: document.querySelectorAll('.panel-section'),
  
  // Simulation
  scenarioHot: document.getElementById('scenario-hot'),
  scenarioCold: document.getElementById('scenario-cold'),
  roomBg: document.getElementById('room-bg'),
  hotCupGfx: document.getElementById('hot-cup-gfx'),
  coldGlassGfx: document.getElementById('cold-glass-gfx'),
  displayTempDrink: document.getElementById('display-temp-drink'),
  displayTempRoom: document.getElementById('display-temp-room'),
  
  // Indicators
  heatFlowIndicator: document.getElementById('heat-flow-indicator'),
  heatFlowText: document.getElementById('heat-flow-text'),
  equilibriumAlert: document.getElementById('equilibrium-alert'),
  
  // Sliders
  sliderDrink: document.getElementById('slider-drink'),
  sliderRoom: document.getElementById('slider-room'),
  sliderDrinkLabel: document.getElementById('slider-drink-label'),
  sliderRoomLabel: document.getElementById('slider-room-label'),
  valSliderDrink: document.getElementById('val-slider-drink'),
  valSliderRoom: document.getElementById('val-slider-room'),
  
  // Controls
  btnPlay: document.getElementById('btn-play'),
  btnReset: document.getElementById('btn-reset'),
  
  // Graph Canvas
  canvas: document.getElementById('temp-chart'),
  ctx: document.getElementById('temp-chart').getContext('2d'),
  
  // Flashcards
  cardQuestion: document.getElementById('card-question'),
  cardAnswer: document.getElementById('card-answer'),
  currentFlashcard: document.getElementById('current-flashcard'),
  btnPrevCard: document.getElementById('btn-prev-card'),
  btnNextCard: document.getElementById('btn-next-card'),
  btnShuffleCards: document.getElementById('btn-shuffle-cards'),
  deckProgressText: document.getElementById('deck-progress-text'),
  
  // Quiz Panels
  quizActivePanel: document.getElementById('quiz-active-panel'),
  quizScorePanel: document.getElementById('quiz-score-panel'),
  quizProgressBar: document.getElementById('quiz-progress-fill'),
  quizQuestionNumber: document.getElementById('quiz-question-number'),
  quizLiveScore: document.getElementById('quiz-live-score'),
  quizQuestionText: document.getElementById('quiz-question-text'),
  quizOptionsContainer: document.getElementById('quiz-options-container'),
  quizExplanationPanel: document.getElementById('quiz-explanation-panel'),
  explanationIcon: document.getElementById('explanation-icon'),
  explanationTitle: document.getElementById('explanation-title'),
  explanationText: document.getElementById('explanation-text'),
  btnNextQuestion: document.getElementById('btn-next-question'),
  
  // Score Screen
  particlesCanvas: document.getElementById('particles-canvas'),
  scoreText: document.getElementById('score-text'),
  scoreFeedbackText: document.getElementById('score-feedback-text'),
  btnRetryQuiz: document.getElementById('btn-retry-quiz')
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  initTabNavigation();
  initSimulationListeners();
  initFlashcardDeck();
  initQuizDeck();
  
  // Set default starting values
  resetSimulation();
  
  // Handle window resizing for Graph Canvas
  window.addEventListener('resize', drawGraph);
});

// Intro removed

// --- TAB NAVIGATION ---
function initTabNavigation() {
  elements.navButtons.forEach(button => {
    button.addEventListener('click', () => {
      const target = button.getAttribute('data-target');
      
      // Update nav class
      elements.navButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // Update panels visibility
      elements.panels.forEach(panel => {
        panel.classList.remove('active');
        if (panel.id === target) {
          panel.classList.add('active');
        }
      });
      
      state.currentTab = target;
      
      // Specific panel initializations
      if (target === 'section-sim') {
        resizeCanvasToFit();
        drawGraph();
      } else if (target === 'section-quiz') {
        // Stop particle loop if moving away from quiz end
        stopCelebration();
      }
    });
  });
}

// --- SECTION 2: INTERACTIVE SIMULATION ---

// Force canvas to match container width
function resizeCanvasToFit() {
  const container = elements.canvas.parentElement;
  elements.canvas.width = container.clientWidth;
  elements.canvas.height = container.clientHeight;
}

function initSimulationListeners() {
  // Scenario selector
  elements.scenarioHot.addEventListener('click', () => setScenario('hot'));
  elements.scenarioCold.addEventListener('click', () => setScenario('cold'));
  
  // Play / Reset
  elements.btnPlay.addEventListener('click', togglePlaySimulation);
  elements.btnReset.addEventListener('click', resetSimulation);
  
  // Sliders
  elements.sliderDrink.addEventListener('input', (e) => {
    state.startingDrinkTemp = parseInt(e.target.value);
    elements.valSliderDrink.textContent = `${state.startingDrinkTemp}°C`;
    resetSimulation();
  });
  
  elements.sliderRoom.addEventListener('input', (e) => {
    state.startingRoomTemp = parseInt(e.target.value);
    elements.valSliderRoom.textContent = `${state.startingRoomTemp}°C`;
    resetSimulation();
  });
}

function setScenario(scen) {
  if (state.scenario === scen) return;
  state.scenario = scen;
  
  if (scen === 'hot') {
    elements.scenarioHot.classList.add('active');
    elements.scenarioCold.classList.remove('active');
    elements.hotCupGfx.classList.remove('hidden');
    elements.coldGlassGfx.classList.add('hidden');
    
    // Set hot slider ranges
    elements.sliderDrink.min = 70;
    elements.sliderDrink.max = 90;
    // Set random starting hot temperature
    const randHot = Math.floor(Math.random() * 21) + 70; // 70 to 90
    elements.sliderDrink.value = randHot;
    state.startingDrinkTemp = randHot;
    elements.valSliderDrink.textContent = `${randHot}°C`;
    elements.sliderDrinkLabel.textContent = "Starting Drink Temp:";
    elements.sliderDrink.className = "neon-slider-orange";
    
    // Set Room slider
    elements.sliderRoom.value = 25;
    state.startingRoomTemp = 25;
    elements.valSliderRoom.textContent = "25°C";
    
  } else {
    elements.scenarioHot.classList.remove('active');
    elements.scenarioCold.classList.add('active');
    elements.hotCupGfx.classList.add('hidden');
    elements.coldGlassGfx.classList.remove('hidden');
    
    // Set cold slider ranges
    elements.sliderDrink.min = 4;
    elements.sliderDrink.max = 15;
    // Set random starting cold temperature
    const randCold = Math.floor(Math.random() * 12) + 4; // 4 to 15
    elements.sliderDrink.value = randCold;
    state.startingDrinkTemp = randCold;
    elements.valSliderDrink.textContent = `${randCold}°C`;
    elements.sliderDrinkLabel.textContent = "Starting Drink Temp:";
    elements.sliderDrink.className = "neon-slider-blue";
    
    // Set Room slider
    elements.sliderRoom.value = 30;
    state.startingRoomTemp = 30;
    elements.valSliderRoom.textContent = "30°C";
  }
  
  resetSimulation();
}

function resetSimulation() {
  // Stop simulation loop
  if (state.simInterval) {
    clearInterval(state.simInterval);
    state.simInterval = null;
  }
  state.simRunning = false;
  state.simTime = 0;
  elements.btnPlay.textContent = "Play Simulation";
  
  // Set starting values
  state.drinkTemp = state.startingDrinkTemp;
  state.roomTemp = state.startingRoomTemp;
  
  // Initialise Graph arrays
  state.graphData.drink = [state.drinkTemp];
  state.graphData.room = [state.roomTemp];
  state.graphData.time = [0];
  
  // Reset displays
  updateVisualDisplays(false); // not at equilibrium
  resizeCanvasToFit();
  drawGraph();
}

function togglePlaySimulation() {
  if (state.simRunning) {
    // Pause
    clearInterval(state.simInterval);
    state.simInterval = null;
    state.simRunning = false;
    elements.btnPlay.textContent = "Play Simulation";
  } else {
    // Play
    // If we are already at equilibrium, reset first
    if (state.simTime >= state.maxGraphPoints) {
      resetSimulation();
    }
    
    state.simRunning = true;
    elements.btnPlay.textContent = "Pause";
    
    state.simInterval = setInterval(() => {
      runSimulationStep();
    }, 100); // Step every 100ms for visual smoothness
  }
}

function runSimulationStep() {
  state.simTime++;
  
  const stepsToEquilibrium = state.equilibriumStep; // 80 steps
  
  if (state.simTime >= stepsToEquilibrium) {
    // Force absolute equilibrium
    state.drinkTemp = state.roomTemp;
  } else {
    // Newton's cooling curve calculation from 0 to 80 steps
    const tRatio = state.simTime / stepsToEquilibrium;
    const startDiff = state.startingDrinkTemp - state.startingRoomTemp;
    const decay = Math.exp(-5.3 * tRatio);
    state.drinkTemp = state.startingRoomTemp + (startDiff * decay);
    // Round to 1 decimal place
    state.drinkTemp = Math.round(state.drinkTemp * 10) / 10;
  }
  
  // Room stays constant in O-level physics simplification
  state.roomTemp = state.startingRoomTemp;
  
  // Store values
  state.graphData.drink.push(state.drinkTemp);
  state.graphData.room.push(state.roomTemp);
  state.graphData.time.push(state.simTime);
  
  const isEquilibrium = state.simTime >= stepsToEquilibrium;
  updateVisualDisplays(isEquilibrium);
  
  if (state.simTime >= state.maxGraphPoints) {
    // Stop simulation at full width (120 steps)
    clearInterval(state.simInterval);
    state.simInterval = null;
    state.simRunning = false;
    elements.btnPlay.textContent = "Simulation Ended";
  }
  
  drawGraph();
}

function updateVisualDisplays(isEquilibrium) {
  // Update numbers
  elements.displayTempDrink.textContent = `${state.drinkTemp.toFixed(1)}°C`;
  elements.displayTempRoom.textContent = `${state.roomTemp.toFixed(1)}°C`;
  
  // Update graphic representations (steam / condensation)
  if (state.scenario === 'hot') {
    if (isEquilibrium) {
      // Cup loses steam
      elements.hotCupGfx.querySelector('#sim-steam').style.opacity = '0';
      elements.equilibriumAlert.classList.remove('hidden');
      elements.heatFlowIndicator.classList.add('hidden');
    } else {
      // Hot cup steam active
      elements.hotCupGfx.querySelector('#sim-steam').style.opacity = '1';
      elements.equilibriumAlert.classList.add('hidden');
      elements.heatFlowIndicator.classList.remove('hidden');
      
      // Update heat flow text & class
      elements.heatFlowIndicator.className = "heat-flow-banner hot-flow";
      elements.heatFlowText.textContent = "Drink → Room";
    }
  } else {
    // Cold Scenario
    if (isEquilibrium) {
      // Glass loses condensation
      elements.coldGlassGfx.querySelector('#sim-condensation').style.opacity = '0';
      elements.equilibriumAlert.classList.remove('hidden');
      elements.heatFlowIndicator.classList.add('hidden');
    } else {
      // Glass has condensation
      elements.coldGlassGfx.querySelector('#sim-condensation').style.opacity = '1';
      elements.equilibriumAlert.classList.add('hidden');
      elements.heatFlowIndicator.classList.remove('hidden');
      
      // Update heat flow text & class
      elements.heatFlowIndicator.className = "heat-flow-banner cold-flow";
      elements.heatFlowText.textContent = "Room → Drink";
    }
  }
}

// Canvas graph drawer
function drawGraph() {
  const ctx = elements.ctx;
  const width = elements.canvas.width;
  const height = elements.canvas.height;
  
  // Clear canvas
  ctx.clearRect(0, 0, width, height);
  
  // Draw grid lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 1;
  const gridSpacing = 30;
  for (let x = 0; x < width; x += gridSpacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += gridSpacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  
  // Helper to map temperature values to Canvas space
  // Temperature range: 0°C to 100°C
  function getX(index) {
    // Spread graph data across total width
    return (index / state.maxGraphPoints) * width;
  }
  
  function getY(temp) {
    // 100°C is top (15px padding), 0°C is bottom (15px padding)
    const padding = 15;
    return height - padding - ((temp / 100) * (height - 2 * padding));
  }
  
  // Draw grid boundary line at Equilibrium boundary (1/3 of total width)
  const eqX = getX(state.equilibriumStep);
  ctx.strokeStyle = 'rgba(57, 255, 20, 0.15)';
  ctx.setLineDash([4, 4]);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(eqX, 0);
  ctx.lineTo(eqX, height);
  ctx.stroke();
  ctx.setLineDash([]); // Reset dash
  
  // Label for equilibrium marker line
  ctx.fillStyle = 'rgba(57, 255, 20, 0.4)';
  ctx.font = '700 8px Space Grotesk';
  ctx.fillText("EQUILIBRIUM POINT", eqX + 5, 12);
  
  const drinkPoints = state.graphData.drink;
  const roomPoints = state.graphData.room;
  
  if (drinkPoints.length < 1) return;
  
  // Draw Room Temperature line (Blue)
  ctx.beginPath();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#00d2ff';
  ctx.shadowColor = 'rgba(0, 210, 255, 0.5)';
  ctx.shadowBlur = 8;
  ctx.moveTo(getX(0), getY(roomPoints[0]));
  for (let i = 1; i < roomPoints.length; i++) {
    ctx.lineTo(getX(i), getY(roomPoints[i]));
  }
  ctx.stroke();
  
  // Draw Drink Temperature line (Orange for hot, Blue for cold)
  ctx.beginPath();
  ctx.lineWidth = 3;
  ctx.strokeStyle = state.scenario === 'hot' ? '#ff6b00' : '#00d2ff';
  ctx.shadowColor = state.scenario === 'hot' ? 'rgba(255, 107, 0, 0.5)' : 'rgba(0, 210, 255, 0.5)';
  ctx.shadowBlur = 8;
  ctx.moveTo(getX(0), getY(drinkPoints[0]));
  for (let i = 1; i < drinkPoints.length; i++) {
    ctx.lineTo(getX(i), getY(drinkPoints[i]));
  }
  ctx.stroke();
  
  // Reset shadow for subsequent draws
  ctx.shadowBlur = 0;
}


// --- SECTION 3: FLASHCARD REVISION ---
function initFlashcardDeck() {
  updateFlashcardUI();
  
  elements.currentFlashcard.addEventListener('click', () => {
    elements.currentFlashcard.classList.toggle('flipped');
  });
  
  elements.btnPrevCard.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent flip trigger
    elements.currentFlashcard.classList.remove('flipped');
    setTimeout(() => {
      state.currentCardIndex = (state.currentCardIndex - 1 + state.flashcards.length) % state.flashcards.length;
      updateFlashcardUI();
    }, 150);
  });
  
  elements.btnNextCard.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent flip trigger
    elements.currentFlashcard.classList.remove('flipped');
    setTimeout(() => {
      state.currentCardIndex = (state.currentCardIndex + 1) % state.flashcards.length;
      updateFlashcardUI();
    }, 150);
  });
  
  elements.btnShuffleCards.addEventListener('click', () => {
    elements.currentFlashcard.classList.remove('flipped');
    setTimeout(() => {
      // Shuffle array
      state.flashcards.sort(() => Math.random() - 0.5);
      state.currentCardIndex = 0;
      updateFlashcardUI();
    }, 150);
  });
}

function updateFlashcardUI() {
  const card = state.flashcards[state.currentCardIndex];
  elements.cardQuestion.textContent = card.q;
  elements.cardAnswer.textContent = card.a;
  elements.deckProgressText.textContent = `${state.currentCardIndex + 1} / ${state.flashcards.length}`;
}


// --- SECTION 4 & 5: QUIZ & SCORE SCREEN ---
function initQuizDeck() {
  elements.btnNextQuestion.addEventListener('click', loadNextQuizStep);
  elements.btnRetryQuiz.addEventListener('click', startNewQuizSession);
  startNewQuizSession();
}

function startNewQuizSession() {
  // Draw 10 random questions
  const shuffledPool = [...state.questionPool].sort(() => Math.random() - 0.5);
  state.quizQuestions = shuffledPool.slice(0, 10);
  state.currentQuestionIndex = 0;
  state.score = 0;
  state.selectedAnswer = null;
  
  elements.quizActivePanel.classList.remove('hidden');
  elements.quizScorePanel.classList.add('hidden');
  stopCelebration();
  
  loadQuizQuestion();
}

function loadQuizQuestion() {
  const qObj = state.quizQuestions[state.currentQuestionIndex];
  
  // Reset UI classes
  elements.quizExplanationPanel.classList.add('hidden');
  elements.quizLiveScore.textContent = `Score: ${state.score}`;
  elements.quizQuestionNumber.textContent = `Question ${state.currentQuestionIndex + 1} of 10`;
  
  // Progress Bar
  const progressPercent = (state.currentQuestionIndex / 10) * 100;
  elements.quizProgressBar.style.width = `${progressPercent}%`;
  
  // Set Text
  elements.quizQuestionText.textContent = qObj.q;
  
  // Set options with random placement index
  elements.quizOptionsContainer.innerHTML = '';
  state.selectedAnswer = null;
  
  // Pair options with original indices to track correctness
  const optionsWithIndices = qObj.options.map((opt, i) => ({ text: opt, originalIndex: i }));
  optionsWithIndices.sort(() => Math.random() - 0.5);
  
  optionsWithIndices.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt.text;
    btn.addEventListener('click', () => handleQuizOptionClick(btn, opt.originalIndex, qObj.correct));
    elements.quizOptionsContainer.appendChild(btn);
  });
}

function handleQuizOptionClick(buttonElement, chosenIndex, correctIndex) {
  if (state.selectedAnswer !== null) return; // Answer locked in
  
  state.selectedAnswer = chosenIndex;
  
  const optionButtons = elements.quizOptionsContainer.querySelectorAll('.option-btn');
  const qObj = state.quizQuestions[state.currentQuestionIndex];
  
  if (chosenIndex === correctIndex) {
    // Correct!
    state.score++;
    buttonElement.classList.add('correct');
    
    // Success feedback box
    elements.quizExplanationPanel.className = "explanation-box success-ui";
    elements.explanationIcon.textContent = "✓";
    elements.explanationTitle.textContent = "Correct!";
    elements.explanationText.textContent = qObj.explanation;
    
    // Body success flash
    document.body.classList.add('flash-correct');
    setTimeout(() => document.body.classList.remove('flash-correct'), 400);
  } else {
    // Wrong!
    buttonElement.classList.add('incorrect');
    
    // Highlight correct option
    optionButtons.forEach((btn, i) => {
      // We need to re-find which button maps to correctIndex by text match or data property
      // Let's check text match against original options
      if (btn.textContent === qObj.options[correctIndex]) {
        btn.classList.add('correct');
      }
    });
    
    // Error feedback box
    elements.quizExplanationPanel.className = "explanation-box error-ui";
    elements.explanationIcon.textContent = "✗";
    elements.explanationTitle.textContent = "Incorrect";
    elements.explanationText.textContent = qObj.explanation;
    
    // Body error flash
    document.body.classList.add('flash-incorrect');
    setTimeout(() => document.body.classList.remove('flash-incorrect'), 400);
  }
  
  // Show next button and explanation details
  elements.quizLiveScore.textContent = `Score: ${state.score}`;
  elements.quizExplanationPanel.classList.remove('hidden');
}

function loadNextQuizStep() {
  state.currentQuestionIndex++;
  if (state.currentQuestionIndex < 10) {
    loadQuizQuestion();
  } else {
    // Show End Screen
    elements.quizActivePanel.classList.add('hidden');
    elements.quizScorePanel.classList.remove('hidden');
    
    // Set score bar progress to 100%
    elements.quizProgressBar.style.width = `100%`;
    
    displayScoreResults();
  }
}

function displayScoreResults() {
  elements.scoreText.textContent = `${state.score} / 10`;
  
  // conically fill the radial score border based on score
  const percentAngle = (state.score / 10) * 360;
  document.querySelector('.score-radial-progress').style.background = `conic-gradient(var(--neon-purple) ${percentAngle}deg, rgba(255, 255, 255, 0.05) 0deg)`;
  
  const feedbackMsg = elements.scoreFeedbackText;
  
  // Reset potential classes
  feedbackMsg.className = "score-feedback-message";
  
  // Clean back prompt indicator if exists
  const existingBackIndicator = document.querySelector('.back-indicator');
  if (existingBackIndicator) existingBackIndicator.remove();
  
  if (state.score >= 8) {
    feedbackMsg.textContent = "Excellent! You understand heat flow well.";
    startCelebration(); // Neon particle explosion
  } else if (state.score >= 5) {
    feedbackMsg.textContent = "Good effort. Review the direction of heat flow.";
    feedbackMsg.classList.add('pulse-glow-feedback');
  } else {
    feedbackMsg.textContent = "Keep practising. Go back to the simulation first.";
    
    // Add prompt arrow back to Section 2
    const backArrow = document.createElement('div');
    backArrow.className = "back-indicator";
    backArrow.innerHTML = "<span>←</span> Back to Simulator";
    backArrow.addEventListener('click', () => {
      // Simulate click to tab button
      document.querySelector('[data-target="section-sim"]').click();
    });
    feedbackMsg.parentElement.insertBefore(backArrow, elements.btnRetryQuiz);
  }
}

// --- NEON PARTICLE SYSTEM CELEBRATION ---
let particleInterval = null;
let animationFrameId = null;
const particles = [];

function startCelebration() {
  const canvas = elements.particlesCanvas;
  const ctx = canvas.getContext('2d');
  
  // Set canvas bounds to fit container
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight;
  
  class Particle {
    constructor() {
      // Emit from center region
      this.x = canvas.width / 2;
      this.y = canvas.height / 2;
      
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      
      this.radius = Math.random() * 3 + 1;
      
      // Neon colors
      const colors = ['#ff6b00', '#00d2ff', '#39ff14', '#b900ff'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
      
      this.alpha = 1;
      this.decay = Math.random() * 0.02 + 0.01;
    }
    
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= this.decay;
    }
    
    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
  
  // Continuously produce particle bursts
  particleInterval = setInterval(() => {
    for (let i = 0; i < 6; i++) {
      particles.push(new Particle());
    }
  }, 100);
  
  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update();
      if (p.alpha <= 0) {
        particles.splice(i, 1);
      } else {
        p.draw();
      }
    }
    
    animationFrameId = requestAnimationFrame(loop);
  }
  
  loop();
}

function stopCelebration() {
  if (particleInterval) {
    clearInterval(particleInterval);
    particleInterval = null;
  }
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  particles.length = 0; // Clear particles array
  
  const ctx = elements.particlesCanvas.getContext('2d');
  ctx.clearRect(0, 0, elements.particlesCanvas.width, elements.particlesCanvas.height);
}
