// State variables
let state = {
  mode: 'science', // 'science' (Combined Science) or 'pure' (Pure Physics)
  distance: 500,   // 10 to 1000, step 10
  time: 25,        // 1 to 100, step 1
  testMode: false,
  hiddenIndex: null, // 0: distance/displacement, 1: time, 2: speed/velocity
  usedScenarios: []  // List of used scenario indices to prevent repeats
};

// Colors
const AMBER = '#F59E0B';
const CYAN = '#00F2FE';

// DOM Elements
const docRoot = document.documentElement;
const syllabusToggleBtn = document.getElementById('syllabus-toggle-btn');
const toggleDot = document.getElementById('toggle-dot');
const labelScience = document.getElementById('toggle-label-science');
const labelPure = document.getElementById('toggle-label-pure');

const sliderDistance = document.getElementById('slider-distance');
const sliderTime = document.getElementById('slider-time');

const labelDistance = document.getElementById('label-distance');
const displayDistance = document.getElementById('display-distance');
const displayDistanceContainer = document.getElementById('display-distance-container');

const displayTime = document.getElementById('display-time');
const displayTimeContainer = document.getElementById('display-time-container');

const labelResultHeader = document.getElementById('label-result-header');
const displayResult = document.getElementById('display-result');
const displayResultContainer = document.getElementById('display-result-container');
const formulaText = document.getElementById('formula-text');

// Eye icons / solution triggers
const triggerDistance = document.getElementById('solution-trigger-distance');
const triggerTime = document.getElementById('solution-trigger-time');
const triggerResult = document.getElementById('solution-trigger-result');

// Bottom controls
const btnTestMode = document.getElementById('btn-test-mode');
const testModeIndicator = document.getElementById('test-mode-indicator');
const btnRandomize = document.getElementById('btn-randomize');
const btnReset = document.getElementById('btn-reset');

// Scenario panel
const scenarioPanel = document.getElementById('scenario-panel');
const scenarioText = document.getElementById('scenario-text');

// Modal Elements
const solutionModal = document.getElementById('solution-modal');
const modalClose = document.getElementById('modal-close');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalStep1 = document.getElementById('modal-step1');
const modalStep2 = document.getElementById('modal-step2');
const modalStep3 = document.getElementById('modal-step3');

// Scenario Templates bank
const scenarioTemplates = [
  {
    science: "A cyclist travels {d} m along a straight road in {t} seconds.",
    pure: "A cyclist moves along a straight road, resulting in a displacement of {d} m in {t} seconds."
  },
  {
    science: "A remote-controlled toy car zoom across a classroom floor for {d} m in {t} seconds.",
    pure: "A remote-controlled toy car is displaced by {d} m in {t} seconds."
  },
  {
    science: "A swimmer completes a lap in a swimming pool, covering a total distance of {d} m in {t} seconds.",
    pure: "A swimmer completes a lap, ending with a net displacement of {d} m in {t} seconds."
  },
  {
    science: "A drone flies in a straight path from one field to another, travelling {d} m in {t} seconds.",
    pure: "A drone is displaced by {d} m in a straight line over {t} seconds."
  },
  {
    science: "A cheetah chases a gazelle, sprinting {d} m across the savannah in {t} seconds.",
    pure: "A cheetah sprints in a straight path with a displacement of {d} m in {t} seconds."
  },
  {
    science: "A skateboarder glides down a smooth sidewalk for {d} m in {t} seconds.",
    pure: "A skateboarder starts from rest and finishes with a displacement of {d} m in {t} seconds."
  },
  {
    science: "A golf ball rolls across the green, covering {d} m in {t} seconds.",
    pure: "A golf ball is hit straight towards the hole, covering a displacement of {d} m in {t} seconds."
  },
  {
    science: "A student walks from the school canteen to the science lab, travelling {d} m in {t} seconds.",
    pure: "A student walks from the canteen to the lab, resulting in a net displacement of {d} m in {t} seconds."
  },
  {
    science: "A model rocket shoots straight upwards, travelling {d} m in {t} seconds.",
    pure: "A model rocket launches vertically upwards with a displacement of {d} m in {t} seconds."
  },
  {
    science: "A bowling ball rolls down a lane, travelling {d} m in {t} seconds.",
    pure: "A bowling ball travels in a straight line with a displacement of {d} m in {t} seconds."
  },
  {
    science: "A paper plane glides through the air, covering {d} m in {t} seconds.",
    pure: "A paper plane glides in a straight line, achieving a displacement of {d} m in {t} seconds."
  },
  {
    science: "A horse gallops along a straight fence line, covering {d} m in {t} seconds.",
    pure: "A horse gallops in a straight line with a displacement of {d} m in {t} seconds."
  }
];

// Current scenario details (if any)
let currentScenarioIndex = null;

// Initialize theme color and UI elements
function updateThemeColors() {
  const currentAccent = state.mode === 'science' ? AMBER : CYAN;
  const currentGlow = state.mode === 'science' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(0, 242, 254, 0.2)';
  
  docRoot.style.setProperty('--accent-color', currentAccent);
  docRoot.style.setProperty('--accent-glow', currentGlow);

  // Update Syllabus toggle classes and positions
  if (state.mode === 'science') {
    toggleDot.style.left = '4px';
    toggleDot.style.transform = 'translateX(0)';
    labelScience.classList.add('accent-text-active');
    labelScience.classList.remove('text-gray-500');
    labelPure.classList.add('text-gray-500');
    labelPure.classList.remove('accent-text-active');
    
    // Set formula styles
    formulaText.className = "font-mono text-xs md:text-sm font-semibold tracking-normal text-amber-500";
  } else {
    toggleDot.style.left = 'calc(100% - 4px)';
    toggleDot.style.transform = 'translateX(-100%)';
    labelPure.classList.add('accent-text-active');
    labelPure.classList.remove('text-gray-500');
    labelScience.classList.add('text-gray-500');
    labelScience.classList.remove('accent-text-active');
    
    // Set formula styles
    formulaText.className = "font-mono text-xs md:text-sm font-semibold tracking-normal text-cyan-400";
  }

  // If in test mode, style the indicator
  if (state.testMode) {
    testModeIndicator.className = "w-2.5 h-2.5 rounded-full inline-block mr-1 bg-red-500 animate-pulse";
    btnTestMode.classList.add('border-red-500');
    btnTestMode.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.2)';
  } else {
    testModeIndicator.className = "w-2.5 h-2.5 rounded-full inline-block mr-1 bg-gray-500";
    btnTestMode.classList.remove('border-red-500');
    btnTestMode.style.boxShadow = 'none';
  }
}

// Compute the result based on current inputs
function getCalculatedValue() {
  return (state.distance / state.time).toFixed(1);
}

// Render the application text, input values, and formulas
function renderUI() {
  const result = getCalculatedValue();

  // Mode Specific Text Label Changes
  if (state.mode === 'science') {
    labelDistance.textContent = "Total Distance";
    labelResultHeader.textContent = "Calculated Average Speed";
    formulaText.textContent = "average speed = total distance / time taken";
  } else {
    labelDistance.textContent = "Total Displacement";
    labelResultHeader.textContent = "Calculated Average Velocity";
    formulaText.textContent = "average velocity = displacement / time taken";
  }

  // Update slider positions to match state
  sliderDistance.value = state.distance;
  sliderTime.value = state.time;

  // Handle normal or test mode values hidden representation
  if (state.testMode) {
    // Hidden Index 0: Distance/Displacement
    if (state.hiddenIndex === 0) {
      displayDistance.innerHTML = `<span class="pulsing-hidden-value font-bold text-red-500">??.?</span>`;
      triggerDistance.classList.remove('hidden');
      sliderDistance.disabled = true;
      sliderDistance.classList.add('opacity-40');
    } else {
      displayDistance.textContent = state.distance;
      triggerDistance.classList.add('hidden');
      sliderDistance.disabled = false;
      sliderDistance.classList.remove('opacity-40');
    }

    // Hidden Index 1: Time
    if (state.hiddenIndex === 1) {
      displayTime.innerHTML = `<span class="pulsing-hidden-value font-bold text-red-500">??.?</span>`;
      triggerTime.classList.remove('hidden');
      sliderTime.disabled = true;
      sliderTime.classList.add('opacity-40');
    } else {
      displayTime.textContent = state.time;
      triggerTime.classList.add('hidden');
      sliderTime.disabled = false;
      sliderTime.classList.remove('opacity-40');
    }

    // Hidden Index 2: Speed/Velocity
    if (state.hiddenIndex === 2) {
      displayResult.innerHTML = `<span class="pulsing-hidden-value font-bold text-red-500">??.?</span>`;
      triggerResult.classList.remove('hidden');
    } else {
      displayResult.textContent = result;
      triggerResult.classList.add('hidden');
    }
  } else {
    // Normal mode rendering
    displayDistance.textContent = state.distance;
    displayTime.textContent = state.time;
    displayResult.textContent = result;

    // Reset accessibility
    sliderDistance.disabled = false;
    sliderDistance.classList.remove('opacity-40');
    sliderTime.disabled = false;
    sliderTime.classList.remove('opacity-40');

    // Hide all worked solution modal triggers
    triggerDistance.classList.add('hidden');
    triggerTime.classList.add('hidden');
    triggerResult.classList.add('hidden');
  }

  // Render scenario context text if loaded
  if (currentScenarioIndex !== null) {
    scenarioPanel.classList.remove('hidden');
    const template = scenarioTemplates[currentScenarioIndex];
    const textPattern = state.mode === 'science' ? template.science : template.pure;
    scenarioText.textContent = textPattern
      .replace('{d}', state.distance)
      .replace('{t}', state.time);
  } else {
    scenarioPanel.classList.add('hidden');
  }

  updateThemeColors();
}

// Change Syllabus Stream Mode
function toggleMode() {
  state.mode = state.mode === 'science' ? 'pure' : 'science';
  renderUI();
}

// Set up random test mode scenario values
function activateTestMode() {
  state.testMode = true;
  // Choose which values to hide randomly: 0 (dist), 1 (time), 2 (speed)
  state.hiddenIndex = Math.floor(Math.random() * 3);
  renderUI();
}

function deactivateTestMode() {
  state.testMode = false;
  state.hiddenIndex = null;
  renderUI();
}

// Randomizer logic
function randomizeScenario() {
  // If test mode is active, choose a new variable to hide randomly
  if (state.testMode) {
    state.hiddenIndex = Math.floor(Math.random() * 3);
  }

  // Handle unique scenario picking
  if (state.usedScenarios.length >= scenarioTemplates.length) {
    state.usedScenarios = []; // Refresh once all templates have been used
  }

  let index;
  do {
    index = Math.floor(Math.random() * scenarioTemplates.length);
  } while (state.usedScenarios.includes(index));

  state.usedScenarios.push(index);
  currentScenarioIndex = index;

  // Generate clean readable random values
  // Distance: 10m to 1000m, step 10
  state.distance = Math.floor(Math.random() * 100 + 1) * 10;
  // Time: 1s to 100s, step 1
  state.time = Math.floor(Math.random() * 100 + 1);

  renderUI();
}

// Reset button logic
function resetCalculator() {
  deactivateTestMode();
  state.distance = 500;
  state.time = 25;
  currentScenarioIndex = null;
  state.usedScenarios = [];
  renderUI();
}

// Worked Solution Modal logic
function openSolutionModal() {
  const distanceTerm = state.mode === 'science' ? 'distance' : 'displacement';
  const speedTerm = state.mode === 'science' ? 'speed' : 'velocity';
  const totalTerm = state.mode === 'science' ? 'total distance' : 'displacement';
  
  const formattedDistance = `${state.distance}m`;
  const formattedTime = `${state.time}s`;
  const calculatedSpeed = `${getCalculatedValue()} m/s`;

  // Step 1: Formula definition text
  modalStep1.textContent = `average ${speedTerm} = ${totalTerm} / time taken`;

  // Step 2: Substituting values
  modalStep2.textContent = `average ${speedTerm} = ${formattedDistance} / ${formattedTime}`;

  // Step 3: Calculation output
  modalStep3.textContent = `average ${speedTerm} = ${calculatedSpeed}`;

  // Show Modal
  solutionModal.classList.add('active');
}

function closeSolutionModal() {
  solutionModal.classList.remove('active');
}

// Event Listeners
syllabusToggleBtn.addEventListener('click', toggleMode);

sliderDistance.addEventListener('input', (e) => {
  state.distance = parseInt(e.target.value, 10);
  renderUI();
});

sliderTime.addEventListener('input', (e) => {
  state.time = parseInt(e.target.value, 10);
  renderUI();
});

btnTestMode.addEventListener('click', () => {
  if (state.testMode) {
    deactivateTestMode();
  } else {
    activateTestMode();
  }
});

btnRandomize.addEventListener('click', randomizeScenario);
btnReset.addEventListener('click', resetCalculator);

// Solution Modal events
triggerDistance.addEventListener('click', openSolutionModal);
triggerTime.addEventListener('click', openSolutionModal);
triggerResult.addEventListener('click', openSolutionModal);

modalClose.addEventListener('click', closeSolutionModal);
modalCloseBtn.addEventListener('click', closeSolutionModal);

// Close modal when clicking background
solutionModal.addEventListener('click', (e) => {
  if (e.target === solutionModal) {
    closeSolutionModal();
  }
});

// Run UI Setup on script load
renderUI();
