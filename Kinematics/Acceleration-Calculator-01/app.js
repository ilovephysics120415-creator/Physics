// State Management
let currentMode = 'combined'; // 'combined' or 'pure'
let testModeActive = false;
let hiddenVariable = null; // 'initial', 'final', 'time', or 'result'
let activeScenarioIndex = -1;
let usedScenarios = [];

// Scenarios Bank
const SCENARIOS = [
  {
    id: 1,
    csText: "An MRT train accelerates from rest to 22 m/s in 30 seconds",
    ppText: "An MRT train accelerates eastward from rest to 22 m/s in 30 seconds",
    u: 0,
    v: 22,
    t: 30,
    type: "acceleration"
  },
  {
    id: 2,
    csText: "A cyclist slows down from 12 m/s to 3 m/s in 6 seconds",
    ppText: "A cyclist slows down moving westward from 12 m/s to 3 m/s in 6 seconds",
    u: 12,
    v: 3,
    t: 6,
    type: "deceleration"
  },
  {
    id: 3,
    csText: "A car speeds up from 10 m/s to 35 m/s in 10 seconds",
    ppText: "A car speeds up moving northward from 10 m/s to 35 m/s in 10 seconds",
    u: 10,
    v: 35,
    t: 10,
    type: "acceleration"
  },
  {
    id: 4,
    csText: "A ball is thrown upward and slows from 20 m/s to 0 m/s in 2 seconds",
    ppText: "A ball is thrown upward and slows from 20 m/s to 0 m/s in 2 seconds",
    u: 20,
    v: 0,
    t: 2,
    type: "deceleration"
  },
  {
    id: 5,
    csText: "A skateboarder accelerates down a ramp from 2 m/s to 8 m/s in 4 seconds",
    ppText: "A skateboarder accelerates downslope from 2 m/s to 8 m/s in 4 seconds",
    u: 2,
    v: 8,
    t: 4,
    type: "acceleration"
  },
  {
    id: 6,
    csText: "A runner decelerates after the finish line from 10 m/s to 2 m/s in 8 seconds",
    ppText: "A runner decelerates moving southward from 10 m/s to 2 m/s in 8 seconds",
    u: 10,
    v: 2,
    t: 8,
    type: "deceleration"
  }
];

// Mask scenario description when test mode is on to avoid giving away the answer
function getScenarioText(sc, mode) {
  let uPart = "";
  let vPart = "";
  let tPart = "";

  const isInitialHidden = testModeActive && hiddenVariable === 'initial';
  const isFinalHidden = testModeActive && hiddenVariable === 'final';
  const isTimeHidden = testModeActive && hiddenVariable === 'time';

  if (sc.id === 1) { // MRT train
    if (mode === 'combined') {
      uPart = isInitialHidden ? "from [?]" : "from rest";
      vPart = isFinalHidden ? "[?]" : "22 m/s";
      tPart = isTimeHidden ? "[?] seconds" : "30 seconds";
      return `An MRT train accelerates ${uPart} to ${vPart} in ${tPart}`;
    } else {
      uPart = isInitialHidden ? "eastward from [?]" : "eastward from rest";
      vPart = isFinalHidden ? "[?]" : "22 m/s";
      tPart = isTimeHidden ? "[?] seconds" : "30 seconds";
      return `An MRT train accelerates ${uPart} to ${vPart} in ${tPart}`;
    }
  } else if (sc.id === 2) { // Cyclist
    if (mode === 'combined') {
      uPart = isInitialHidden ? "from [?]" : "from 12 m/s";
      vPart = isFinalHidden ? "[?]" : "3 m/s";
      tPart = isTimeHidden ? "[?] seconds" : "6 seconds";
      return `A cyclist slows down ${uPart} to ${vPart} in ${tPart}`;
    } else {
      uPart = isInitialHidden ? "moving westward from [?]" : "moving westward from 12 m/s";
      vPart = isFinalHidden ? "[?]" : "3 m/s";
      tPart = isTimeHidden ? "[?] seconds" : "6 seconds";
      return `A cyclist slows down ${uPart} to ${vPart} in ${tPart}`;
    }
  } else if (sc.id === 3) { // Car
    if (mode === 'combined') {
      uPart = isInitialHidden ? "from [?]" : "from 10 m/s";
      vPart = isFinalHidden ? "[?]" : "35 m/s";
      tPart = isTimeHidden ? "[?] seconds" : "10 seconds";
      return `A car speeds up ${uPart} to ${vPart} in ${tPart}`;
    } else {
      uPart = isInitialHidden ? "moving northward from [?]" : "moving northward from 10 m/s";
      vPart = isFinalHidden ? "[?]" : "35 m/s";
      tPart = isTimeHidden ? "[?] seconds" : "10 seconds";
      return `A car speeds up ${uPart} to ${vPart} in ${tPart}`;
    }
  } else if (sc.id === 4) { // Ball
    uPart = isInitialHidden ? "from [?]" : "from 20 m/s";
    vPart = isFinalHidden ? "[?]" : "0 m/s";
    tPart = isTimeHidden ? "[?] seconds" : "2 seconds";
    if (mode === 'combined') {
      return `A ball is thrown upward and slows ${uPart} to ${vPart} in ${tPart}`;
    } else {
      return `A ball is thrown upward and slows ${uPart} to ${vPart} in ${tPart}`;
    }
  } else if (sc.id === 5) { // Skateboarder
    uPart = isInitialHidden ? "from [?]" : "from 2 m/s";
    vPart = isFinalHidden ? "[?]" : "8 m/s";
    tPart = isTimeHidden ? "[?] seconds" : "4 seconds";
    if (mode === 'combined') {
      return `A skateboarder accelerates down a ramp ${uPart} to ${vPart} in ${tPart}`;
    } else {
      return `A skateboarder accelerates downslope ${uPart} to ${vPart} in ${tPart}`;
    }
  } else if (sc.id === 6) { // Runner
    if (mode === 'combined') {
      uPart = isInitialHidden ? "from [?]" : "from 10 m/s";
      vPart = isFinalHidden ? "[?]" : "2 m/s";
      tPart = isTimeHidden ? "[?] seconds" : "8 seconds";
      return `A runner decelerates after the finish line ${uPart} to ${vPart} in ${tPart}`;
    } else {
      uPart = isInitialHidden ? "moving southward from [?]" : "moving southward from 10 m/s";
      vPart = isFinalHidden ? "[?]" : "2 m/s";
      tPart = isTimeHidden ? "[?] seconds" : "8 seconds";
      return `A runner decelerates ${uPart} to ${vPart} in ${tPart}`;
    }
  }
  return "";
}

// DOM Elements
const btnCombined = document.getElementById('btn-combined-science');
const btnPure = document.getElementById('btn-pure-physics');
const togglePill = document.getElementById('syllabus-toggle-pill');
const modeBadge = document.getElementById('mode-badge');

const sliderInitial = document.getElementById('slider-initial');
const sliderFinal = document.getElementById('slider-final');
const sliderTime = document.getElementById('slider-time');

const valInitial = document.getElementById('val-initial');
const valFinal = document.getElementById('val-final');
const valTime = document.getElementById('val-time');
const valResult = document.getElementById('val-result');

const lblInitial = document.getElementById('lbl-initial');
const lblFinal = document.getElementById('lbl-final');
const lblTime = document.getElementById('lbl-time');
const lblResultTitle = document.getElementById('lbl-result-title');

const displayInitialContainer = document.getElementById('display-container-initial');
const displayFinalContainer = document.getElementById('display-container-final');
const displayTimeContainer = document.getElementById('display-container-time');
const displayResultContainer = document.getElementById('val-result-box');

const btnSolInitial = document.getElementById('btn-sol-initial');
const btnSolFinal = document.getElementById('btn-sol-final');
const btnSolTime = document.getElementById('btn-sol-time');
const btnSolResult = document.getElementById('btn-sol-result');

const resultIndicatorBadge = document.getElementById('result-indicator-badge');
const resultIndicatorIcon = document.getElementById('result-indicator-icon');
const resultIndicatorText = document.getElementById('result-indicator-text');
const formulaReminderContent = document.getElementById('formula-reminder-content');

const btnTestMode = document.getElementById('btn-test-mode');
const btnRandomize = document.getElementById('btn-randomize');
const btnReset = document.getElementById('btn-reset');

const scenarioBanner = document.getElementById('scenario-banner');
const scenarioText = document.getElementById('scenario-text');
const scenarioBadge = document.getElementById('scenario-badge');
const scenarioTypeIcon = document.getElementById('scenario-type-icon');

// Modal Elements
const modal = document.getElementById('solution-modal');
const modalBody = document.getElementById('solution-modal-body');
const btnCloseModal = document.getElementById('btn-close-modal');
const btnCloseModalFooter = document.getElementById('btn-close-modal-footer');

// Initialize App
function init() {
  // Event listeners for Syllabus toggle
  btnCombined.addEventListener('click', () => setSyllabusMode('combined'));
  btnPure.addEventListener('click', () => setSyllabusMode('pure'));

  // Event listeners for Sliders
  sliderInitial.addEventListener('input', handleSliderInput);
  sliderFinal.addEventListener('input', handleSliderInput);
  sliderTime.addEventListener('input', handleSliderInput);

  // Event listeners for Bottom Buttons
  btnTestMode.addEventListener('click', toggleTestMode);
  btnRandomize.addEventListener('click', randomizeScenario);
  btnReset.addEventListener('click', resetCalculator);

  // Modal close listeners
  btnCloseModal.addEventListener('click', closeModal);
  btnCloseModalFooter.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Eye icon solution click handlers
  btnSolInitial.addEventListener('click', () => showWorkedSolution('initial'));
  btnSolFinal.addEventListener('click', () => showWorkedSolution('final'));
  btnSolTime.addEventListener('click', () => showWorkedSolution('time'));
  btnSolResult.addEventListener('click', () => showWorkedSolution('result'));

  // Initial calculation and layout setup
  setSyllabusMode('combined');
}

// Update syllabus mode
function setSyllabusMode(mode) {
  currentMode = mode;
  document.documentElement.style.setProperty(
    '--accent-active',
    mode === 'pure' ? 'var(--accent-pure)' : 'var(--accent-combined)'
  );

  if (mode === 'combined') {
    // UI Classes and Toggles
    btnCombined.classList.remove('text-gray-400');
    btnCombined.classList.add('text-white');
    btnPure.classList.remove('text-white');
    btnPure.classList.add('text-gray-400');

    // Slide pill to Combined Science
    togglePill.style.left = '6px';
    togglePill.style.backgroundColor = 'var(--accent-combined)';

    // Mode Badge
    modeBadge.textContent = 'Combined Science Mode';
    modeBadge.style.backgroundColor = 'var(--accent-combined)';
    modeBadge.style.color = '#000000';

    // Label replacements (CS doesn't mention velocity or direction)
    lblInitial.textContent = 'Initial speed';
    lblFinal.textContent = 'Final speed';
    lblTime.textContent = 'Time taken';
    lblResultTitle.textContent = 'a =';

    // Update Formula Reminder
    formulaReminderContent.innerHTML = `
      <div>acceleration = (final speed - initial speed) / time taken</div>
      <div class="text-gray-500">a = (v - u) / t</div>
    `;

    // Scenario banner styling if visible
    scenarioBadge.className = "text-xs font-bold uppercase px-2 py-0.5 rounded mr-2 bg-amber-500/20 text-amber-300";
    scenarioBanner.className = scenarioBanner.className.replace(/border-cyan-\d+/g, '').replace(/border-[^ ]+/g, 'border-amber-500');

  } else {
    // Pure Physics
    btnPure.classList.remove('text-gray-400');
    btnPure.classList.add('text-white');
    btnCombined.classList.remove('text-white');
    btnCombined.classList.add('text-gray-400');

    // Slide pill to Pure Physics
    togglePill.style.left = 'calc(50% - 0px)';
    togglePill.style.backgroundColor = 'var(--accent-pure)';

    // Mode Badge
    modeBadge.textContent = 'Pure Physics Mode';
    modeBadge.style.backgroundColor = 'var(--accent-pure)';
    modeBadge.style.color = '#000000';

    // Label replacements with symbolic links
    lblInitial.textContent = 'Initial velocity (u)';
    lblFinal.textContent = 'Final velocity (v)';
    lblTime.textContent = 'Time (t)';
    lblResultTitle.textContent = 'a =';

    // Update Formula Reminder
    formulaReminderContent.innerHTML = `
      <div>a = (v - u) / t</div>
    `;

    // Scenario banner styling if visible
    scenarioBadge.className = "text-xs font-bold uppercase px-2 py-0.5 rounded mr-2 bg-cyan-500/20 text-cyan-300";
    scenarioBanner.className = scenarioBanner.className.replace(/border-amber-\d+/g, '').replace(/border-[^ ]+/g, 'border-cyan-500');
  }

  // Update scenario text if a scenario is active
  if (activeScenarioIndex !== -1) {
    const sc = SCENARIOS[activeScenarioIndex];
    scenarioText.textContent = getScenarioText(sc, currentMode);
  }

  // Recalculate and update displays
  calculate();
}

// Handle Slider drag events
function handleSliderInput() {
  calculate();
}

// Main Calculate Logic
function calculate() {
  const u = parseFloat(sliderInitial.value);
  const v = parseFloat(sliderFinal.value);
  const t = parseFloat(sliderTime.value);

  // Core acceleration calculation
  const a = (v - u) / t;
  const isDecel = v < u;

  // Update scenario text if active (keeps hidden variable masking updated)
  if (activeScenarioIndex !== -1) {
    const sc = SCENARIOS[activeScenarioIndex];
    scenarioText.textContent = getScenarioText(sc, currentMode);
  }

  // Render variables to displays (handling Test Mode hides)
  updateValueDisplay('initial', u, 'm/s');
  updateValueDisplay('final', v, 'm/s');
  updateValueDisplay('time', t, 's');

  // Handle Result display updates
  if (testModeActive && hiddenVariable === 'result') {
    valResult.textContent = '??.?';
    valResult.style.color = 'var(--result-decel)';
    displayResultContainer.classList.add('pulsing-red-border');
    btnSolResult.classList.remove('hidden');
  } else {
    // Format output
    const formattedVal = a.toFixed(2);
    valResult.textContent = formattedVal;
    displayResultContainer.classList.remove('pulsing-red-border');
    btnSolResult.classList.add('hidden');

    if (isDecel) {
      valResult.style.color = 'var(--result-decel)';
    } else {
      valResult.style.color = 'var(--result-accel)';
    }
  }

  // Update Acceleration/Deceleration labels and badge
  if (isDecel) {
    lblResultTitle.textContent = 'a =';
    resultIndicatorText.textContent = 'Deceleration';
    resultIndicatorIcon.textContent = '📉';
    resultIndicatorBadge.style.color = 'var(--result-decel)';
    resultIndicatorBadge.style.borderColor = 'rgba(239, 68, 68, 0.3)';
    resultIndicatorBadge.style.backgroundColor = 'rgba(239, 68, 68, 0.05)';
  } else {
    lblResultTitle.textContent = 'a =';
    resultIndicatorText.textContent = 'Uniform Acceleration';
    resultIndicatorIcon.textContent = '📈';
    resultIndicatorBadge.style.color = 'var(--result-accel)';
    resultIndicatorBadge.style.borderColor = 'rgba(57, 255, 20, 0.3)';
    resultIndicatorBadge.style.backgroundColor = 'rgba(57, 255, 20, 0.05)';
  }
}

// Utility to display value or hide it with red pulsing border in Test Mode
function updateValueDisplay(variable, val, unit) {
  let displaySpan, containerDiv, eyeBtn, sliderInput;
  
  if (variable === 'initial') {
    displaySpan = valInitial;
    containerDiv = displayInitialContainer;
    eyeBtn = btnSolInitial;
    sliderInput = sliderInitial;
  } else if (variable === 'final') {
    displaySpan = valFinal;
    containerDiv = displayFinalContainer;
    eyeBtn = btnSolFinal;
    sliderInput = sliderFinal;
  } else if (variable === 'time') {
    displaySpan = valTime;
    containerDiv = displayTimeContainer;
    eyeBtn = btnSolTime;
    sliderInput = sliderTime;
  }

  if (testModeActive && hiddenVariable === variable) {
    displaySpan.textContent = '??.?';
    containerDiv.classList.add('pulsing-red-border');
    eyeBtn.classList.remove('hidden');
    sliderInput.disabled = true;
    sliderInput.style.opacity = '0.3';
  } else {
    displaySpan.textContent = val;
    containerDiv.classList.remove('pulsing-red-border');
    eyeBtn.classList.add('hidden');
    sliderInput.disabled = false;
    sliderInput.style.opacity = '1';
  }
}

// Toggle Test Mode Function
function toggleTestMode() {
  testModeActive = !testModeActive;

  if (testModeActive) {
    btnTestMode.innerHTML = '🎯 <span>Exit Test Mode</span>';
    btnTestMode.classList.remove('border-red-500/30', 'bg-red-500/10', 'text-red-400');
    btnTestMode.classList.add('border-green-500/30', 'bg-green-500/10', 'text-green-400');

    // Pick a random variable to hide: 'initial', 'final', 'time', or 'result'
    const variables = ['initial', 'final', 'time', 'result'];
    const randomIndex = Math.floor(Math.random() * variables.length);
    hiddenVariable = variables[randomIndex];
  } else {
    btnTestMode.innerHTML = '🎯 <span>Enter Test Mode</span>';
    btnTestMode.classList.remove('border-green-500/30', 'bg-green-500/10', 'text-green-400');
    btnTestMode.classList.add('border-red-500/30', 'bg-red-500/10', 'text-red-400');
    hiddenVariable = null;
  }

  calculate();
}

// Randomize Scenario
function randomizeScenario() {
  if (usedScenarios.length === SCENARIOS.length) {
    usedScenarios = []; // Reset cycle once all scenarios are viewed
  }

  // Find scenarios not yet used in current cycle
  const availableIndices = SCENARIOS.map((_, idx) => idx).filter(idx => !usedScenarios.includes(idx));
  const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];

  usedScenarios.push(randomIndex);
  activeScenarioIndex = randomIndex;

  const sc = SCENARIOS[randomIndex];

  // Set sliders to match scenario
  sliderInitial.value = sc.u;
  sliderFinal.value = sc.v;
  sliderTime.value = sc.t;

  // Randomize the hidden variable if in test mode
  if (testModeActive) {
    const variables = ['initial', 'final', 'time', 'result'];
    const randomIndexVar = Math.floor(Math.random() * variables.length);
    hiddenVariable = variables[randomIndexVar];
  }

  // Show Scenario Banner
  scenarioText.textContent = getScenarioText(sc, currentMode);
  
  if (sc.type === 'acceleration') {
    scenarioTypeIcon.textContent = '🚀';
    scenarioBadge.textContent = 'Acceleration Scenario';
  } else {
    scenarioTypeIcon.textContent = '🛑';
    scenarioBadge.textContent = 'Deceleration Scenario';
  }

  scenarioBanner.classList.remove('hidden');

  calculate();
}

// Reset Calculator
function resetCalculator() {
  // Reset slider defaults
  sliderInitial.value = 20;
  sliderFinal.value = 40;
  sliderTime.value = 10;

  // Exit test mode
  testModeActive = false;
  hiddenVariable = null;
  btnTestMode.innerHTML = '🎯 <span>Enter Test Mode</span>';
  btnTestMode.classList.remove('border-green-500/30', 'bg-green-500/10', 'text-green-400');
  btnTestMode.classList.add('border-red-500/30', 'bg-red-500/10', 'text-red-400');

  // Hide scenario banner
  scenarioBanner.classList.add('hidden');
  activeScenarioIndex = -1;
  usedScenarios = [];

  calculate();
}

// Open Worked Solution Modal
function showWorkedSolution(variable) {
  const u = parseFloat(sliderInitial.value);
  const v = parseFloat(sliderFinal.value);
  const t = parseFloat(sliderTime.value);
  const a = (v - u) / t;

  let modalHtml = '';

  if (currentMode === 'combined') {
    // COMBINED SCIENCE: Word and Symbolic representation on every step
    if (variable === 'result') {
      modalHtml = `
        <div class="mb-2 text-sm text-gray-400">
          We want to calculate the <strong>acceleration</strong> given:
          <br>• Initial speed = <span class="font-mono-val text-white font-bold">${u} m/s</span>
          <br>• Final speed = <span class="font-mono-val text-white font-bold">${v} m/s</span>
          <br>• Time taken = <span class="font-mono-val text-white font-bold">${t} s</span>
        </div>
        <hr class="border-gray-800 my-2">
        <div class="space-y-4">
          <div>
            <div class="text-xs uppercase font-bold text-amber-500 tracking-wider mb-1">Step 1: Write Formula</div>
            <div class="font-mono-val bg-black/30 p-3 rounded-xl border border-gray-800 text-sm">
              acceleration = (final speed - initial speed) / time taken
              <br>a = (v - u) / t
            </div>
          </div>
          <div>
            <div class="text-xs uppercase font-bold text-amber-500 tracking-wider mb-1">Step 2: Substitute Values</div>
            <div class="font-mono-val bg-black/30 p-3 rounded-xl border border-gray-800 text-sm">
              a = (${v} - ${u}) / ${t}
            </div>
          </div>
          <div>
            <div class="text-xs uppercase font-bold text-amber-500 tracking-wider mb-1">Step 3: Simplify Expression</div>
            <div class="font-mono-val bg-black/30 p-3 rounded-xl border border-gray-800 text-sm">
              a = ${v - u} / ${t}
            </div>
          </div>
          <div>
            <div class="text-xs uppercase font-bold text-amber-500 tracking-wider mb-1">Step 4: State Final Answer</div>
            <div class="font-mono-val bg-black/30 p-3 rounded-xl border border-gray-800 text-sm text-green-400">
              acceleration = ${a.toFixed(2)} m/s²
            </div>
          </div>
        </div>
      `;
    } 
    else if (variable === 'initial') {
      modalHtml = `
        <div class="mb-2 text-sm text-gray-400">
          We want to calculate the <strong>initial speed</strong> given:
          <br>• Final speed = <span class="font-mono-val text-white font-bold">${v} m/s</span>
          <br>• Time taken = <span class="font-mono-val text-white font-bold">${t} s</span>
          <br>• Acceleration = <span class="font-mono-val text-white font-bold">${a.toFixed(2)} m/s²</span>
        </div>
        <hr class="border-gray-800 my-2">
        <div class="space-y-4">
          <div>
            <div class="text-xs uppercase font-bold text-amber-500 tracking-wider mb-1">Step 1: Write Formula</div>
            <div class="font-mono-val bg-black/30 p-3 rounded-xl border border-gray-800 text-sm">
              acceleration = (final speed - initial speed) / time taken
              <br>a = (v - u) / t
            </div>
          </div>
          <div>
            <div class="text-xs uppercase font-bold text-amber-500 tracking-wider mb-1">Step 2: Rearrange Formula</div>
            <div class="font-mono-val bg-black/30 p-3 rounded-xl border border-gray-800 text-sm">
              u = v - (a &times; t)
            </div>
          </div>
          <div>
            <div class="text-xs uppercase font-bold text-amber-500 tracking-wider mb-1">Step 3: Substitute Values</div>
            <div class="font-mono-val bg-black/30 p-3 rounded-xl border border-gray-800 text-sm">
              initial speed = ${v} - (${a.toFixed(2)} &times; ${t})
            </div>
          </div>
          <div>
            <div class="text-xs uppercase font-bold text-amber-500 tracking-wider mb-1">Step 4: State Final Answer</div>
            <div class="font-mono-val bg-black/30 p-3 rounded-xl border border-gray-800 text-sm text-green-400">
              initial speed = ${u.toFixed(2)} m/s
            </div>
          </div>
        </div>
      `;
    }
    else if (variable === 'final') {
      modalHtml = `
        <div class="mb-2 text-sm text-gray-400">
          We want to calculate the <strong>final speed</strong> given:
          <br>• Initial speed = <span class="font-mono-val text-white font-bold">${u} m/s</span>
          <br>• Time taken = <span class="font-mono-val text-white font-bold">${t} s</span>
          <br>• Acceleration = <span class="font-mono-val text-white font-bold">${a.toFixed(2)} m/s²</span>
        </div>
        <hr class="border-gray-800 my-2">
        <div class="space-y-4">
          <div>
            <div class="text-xs uppercase font-bold text-amber-500 tracking-wider mb-1">Step 1: Write Formula</div>
            <div class="font-mono-val bg-black/30 p-3 rounded-xl border border-gray-800 text-sm">
              acceleration = (final speed - initial speed) / time taken
              <br>a = (v - u) / t
            </div>
          </div>
          <div>
            <div class="text-xs uppercase font-bold text-amber-500 tracking-wider mb-1">Step 2: Rearrange Formula</div>
            <div class="font-mono-val bg-black/30 p-3 rounded-xl border border-gray-800 text-sm">
              v = u + (a &times; t)
            </div>
          </div>
          <div>
            <div class="text-xs uppercase font-bold text-amber-500 tracking-wider mb-1">Step 3: Substitute Values</div>
            <div class="font-mono-val bg-black/30 p-3 rounded-xl border border-gray-800 text-sm">
              final speed = ${u} + (${a.toFixed(2)} &times; ${t})
            </div>
          </div>
          <div>
            <div class="text-xs uppercase font-bold text-amber-500 tracking-wider mb-1">Step 4: State Final Answer</div>
            <div class="font-mono-val bg-black/30 p-3 rounded-xl border border-gray-800 text-sm text-green-400">
              final speed = ${v.toFixed(2)} m/s
            </div>
          </div>
        </div>
      `;
    }
    else if (variable === 'time') {
      modalHtml = `
        <div class="mb-2 text-sm text-gray-400">
          We want to calculate the <strong>time taken</strong> given:
          <br>• Initial speed = <span class="font-mono-val text-white font-bold">${u} m/s</span>
          <br>• Final speed = <span class="font-mono-val text-white font-bold">${v} m/s</span>
          <br>• Acceleration = <span class="font-mono-val text-white font-bold">${a.toFixed(2)} m/s²</span>
        </div>
        <hr class="border-gray-800 my-2">
        <div class="space-y-4">
          <div>
            <div class="text-xs uppercase font-bold text-amber-500 tracking-wider mb-1">Step 1: Write Formula</div>
            <div class="font-mono-val bg-black/30 p-3 rounded-xl border border-gray-800 text-sm">
              acceleration = (final speed - initial speed) / time taken
              <br>a = (v - u) / t
            </div>
          </div>
          <div>
            <div class="text-xs uppercase font-bold text-amber-500 tracking-wider mb-1">Step 2: Rearrange Formula</div>
            <div class="font-mono-val bg-black/30 p-3 rounded-xl border border-gray-800 text-sm">
              t = (v - u) / a
            </div>
          </div>
          <div>
            <div class="text-xs uppercase font-bold text-amber-500 tracking-wider mb-1">Step 3: Substitute Values</div>
            <div class="font-mono-val bg-black/30 p-3 rounded-xl border border-gray-800 text-sm">
              time taken = (${v} - ${u}) / ${a.toFixed(2)}
            </div>
          </div>
          <div>
            <div class="text-xs uppercase font-bold text-amber-500 tracking-wider mb-1">Step 4: State Final Answer</div>
            <div class="font-mono-val bg-black/30 p-3 rounded-xl border border-gray-800 text-sm text-green-400">
              time taken = ${t.toFixed(2)} s
            </div>
          </div>
        </div>
      `;
    }

    // Include deceleration warning statement for CS
    if (v < u) {
      modalHtml += `
        <div class="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
          ⚠️ <strong>Deceleration Context:</strong> Since final speed is less than initial speed, the object is decelerating.
        </div>
      `;
    }
  } 
  else {
    // PURE PHYSICS: Algebraic symbols only
    if (variable === 'result') {
      modalHtml = `
        <div class="mb-2 text-sm text-gray-400">
          We want to calculate the acceleration <span class="italic font-mono-val">a</span> given:
          <br>• Initial velocity (<span class="italic font-mono-val">u</span>) = <span class="font-mono-val text-white font-bold">${u} m/s</span>
          <br>• Final velocity (<span class="italic font-mono-val">v</span>) = <span class="font-mono-val text-white font-bold">${v} m/s</span>
          <br>• Time (<span class="italic font-mono-val">t</span>) = <span class="font-mono-val text-white font-bold">${t} s</span>
        </div>
        <hr class="border-gray-800 my-2">
        <div class="space-y-4">
          <div>
            <div class="text-xs uppercase font-bold text-cyan-400 tracking-wider mb-1">Step 1: Write Formula</div>
            <div class="font-mono-val bg-black/30 p-3 rounded-xl border border-gray-800 text-sm">
              a = (v - u) / t
            </div>
          </div>
          <div>
            <div class="text-xs uppercase font-bold text-cyan-400 tracking-wider mb-1">Step 2: Substitute</div>
            <div class="font-mono-val bg-black/30 p-3 rounded-xl border border-gray-800 text-sm">
              a = (${v} - ${u}) / ${t}
            </div>
          </div>
          <div>
            <div class="text-xs uppercase font-bold text-cyan-400 tracking-wider mb-1">Step 3: Simplify</div>
            <div class="font-mono-val bg-black/30 p-3 rounded-xl border border-gray-800 text-sm">
              a = ${v - u} / ${t}
            </div>
          </div>
          <div>
            <div class="text-xs uppercase font-bold text-cyan-400 tracking-wider mb-1">Step 4: Answer</div>
            <div class="font-mono-val bg-black/30 p-3 rounded-xl border border-gray-800 text-sm text-green-400">
              a = ${a.toFixed(2)} m/s²
            </div>
          </div>
        </div>
      `;
    }
    else if (variable === 'initial') {
      modalHtml = `
        <div class="mb-2 text-sm text-gray-400">
          We want to calculate the initial velocity <span class="italic font-mono-val">u</span> given:
          <br>• Final velocity (<span class="italic font-mono-val">v</span>) = <span class="font-mono-val text-white font-bold">${v} m/s</span>
          <br>• Time (<span class="italic font-mono-val">t</span>) = <span class="font-mono-val text-white font-bold">${t} s</span>
          <br>• Acceleration (<span class="italic font-mono-val">a</span>) = <span class="font-mono-val text-white font-bold">${a.toFixed(2)} m/s²</span>
        </div>
        <hr class="border-gray-800 my-2">
        <div class="space-y-4">
          <div>
            <div class="text-xs uppercase font-bold text-cyan-400 tracking-wider mb-1">Step 1: Write Formula</div>
            <div class="font-mono-val bg-black/30 p-3 rounded-xl border border-gray-800 text-sm">
              a = (v - u) / t
            </div>
          </div>
          <div>
            <div class="text-xs uppercase font-bold text-cyan-400 tracking-wider mb-1">Step 2: Rearrange</div>
            <div class="font-mono-val bg-black/30 p-3 rounded-xl border border-gray-800 text-sm">
              u = v - (a &times; t)
            </div>
          </div>
          <div>
            <div class="text-xs uppercase font-bold text-cyan-400 tracking-wider mb-1">Step 3: Substitute</div>
            <div class="font-mono-val bg-black/30 p-3 rounded-xl border border-gray-800 text-sm">
              u = ${v} - (${a.toFixed(2)} &times; ${t})
            </div>
          </div>
          <div>
            <div class="text-xs uppercase font-bold text-cyan-400 tracking-wider mb-1">Step 4: Answer</div>
            <div class="font-mono-val bg-black/30 p-3 rounded-xl border border-gray-800 text-sm text-green-400">
              u = ${u.toFixed(2)} m/s
            </div>
          </div>
        </div>
      `;
    }
    else if (variable === 'final') {
      modalHtml = `
        <div class="mb-2 text-sm text-gray-400">
          We want to calculate the final velocity <span class="italic font-mono-val">v</span> given:
          <br>• Initial velocity (<span class="italic font-mono-val">u</span>) = <span class="font-mono-val text-white font-bold">${u} m/s</span>
          <br>• Time (<span class="italic font-mono-val">t</span>) = <span class="font-mono-val text-white font-bold">${t} s</span>
          <br>• Acceleration (<span class="italic font-mono-val">a</span>) = <span class="font-mono-val text-white font-bold">${a.toFixed(2)} m/s²</span>
        </div>
        <hr class="border-gray-800 my-2">
        <div class="space-y-4">
          <div>
            <div class="text-xs uppercase font-bold text-cyan-400 tracking-wider mb-1">Step 1: Write Formula</div>
            <div class="font-mono-val bg-black/30 p-3 rounded-xl border border-gray-800 text-sm">
              a = (v - u) / t
            </div>
          </div>
          <div>
            <div class="text-xs uppercase font-bold text-cyan-400 tracking-wider mb-1">Step 2: Rearrange</div>
            <div class="font-mono-val bg-black/30 p-3 rounded-xl border border-gray-800 text-sm">
              v = u + (a &times; t)
            </div>
          </div>
          <div>
            <div class="text-xs uppercase font-bold text-cyan-400 tracking-wider mb-1">Step 3: Substitute</div>
            <div class="font-mono-val bg-black/30 p-3 rounded-xl border border-gray-800 text-sm">
              v = ${u} + (${a.toFixed(2)} &times; ${t})
            </div>
          </div>
          <div>
            <div class="text-xs uppercase font-bold text-cyan-400 tracking-wider mb-1">Step 4: Answer</div>
            <div class="font-mono-val bg-black/30 p-3 rounded-xl border border-gray-800 text-sm text-green-400">
              v = ${v.toFixed(2)} m/s
            </div>
          </div>
        </div>
      `;
    }
    else if (variable === 'time') {
      modalHtml = `
        <div class="mb-2 text-sm text-gray-400">
          We want to calculate the time <span class="italic font-mono-val">t</span> given:
          <br>• Initial velocity (<span class="italic font-mono-val">u</span>) = <span class="font-mono-val text-white font-bold">${u} m/s</span>
          <br>• Final velocity (<span class="italic font-mono-val">v</span>) = <span class="font-mono-val text-white font-bold">${v} m/s</span>
          <br>• Acceleration (<span class="italic font-mono-val">a</span>) = <span class="font-mono-val text-white font-bold">${a.toFixed(2)} m/s²</span>
        </div>
        <hr class="border-gray-800 my-2">
        <div class="space-y-4">
          <div>
            <div class="text-xs uppercase font-bold text-cyan-400 tracking-wider mb-1">Step 1: Write Formula</div>
            <div class="font-mono-val bg-black/30 p-3 rounded-xl border border-gray-800 text-sm">
              a = (v - u) / t
            </div>
          </div>
          <div>
            <div class="text-xs uppercase font-bold text-cyan-400 tracking-wider mb-1">Step 2: Rearrange</div>
            <div class="font-mono-val bg-black/30 p-3 rounded-xl border border-gray-800 text-sm">
              t = (v - u) / a
            </div>
          </div>
          <div>
            <div class="text-xs uppercase font-bold text-cyan-400 tracking-wider mb-1">Step 3: Substitute</div>
            <div class="font-mono-val bg-black/30 p-3 rounded-xl border border-gray-800 text-sm">
              t = (${v} - ${u}) / ${a.toFixed(2)}
            </div>
          </div>
          <div>
            <div class="text-xs uppercase font-bold text-cyan-400 tracking-wider mb-1">Step 4: Answer</div>
            <div class="font-mono-val bg-black/30 p-3 rounded-xl border border-gray-800 text-sm text-green-400">
              t = ${t.toFixed(2)} s
            </div>
          </div>
        </div>
      `;
    }

    // Include deceleration warning statement for Pure Physics
    if (v < u) {
      modalHtml += `
        <div class="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
          ⚠️ <strong>Deceleration Context:</strong> Since v &lt; u, the object is decelerating.
        </div>
      `;
    }
  }

  modalBody.innerHTML = modalHtml;

  // Render Modal (fade in)
  modal.classList.remove('opacity-0', 'pointer-events-none');
  modal.classList.add('opacity-100');
}

// Close Modal
function closeModal() {
  modal.classList.remove('opacity-100');
  modal.classList.add('opacity-0', 'pointer-events-none');
}

// Start Application
window.addEventListener('DOMContentLoaded', init);
