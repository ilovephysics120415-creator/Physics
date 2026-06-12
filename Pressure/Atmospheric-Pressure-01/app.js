// constants
const RHO_MERCURY = 13600; // kg/m3
const G_ACCEL = 10; // N/kg
const PA_TO_MM = 136; // P / (rho * g) in mm: P / (13600 * 10) * 1000 = P / 136

// DOM Elements
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.app-section');
const sectionBadge = document.getElementById('section-badge');

// Section Switching
function switchSection(sectionId) {
  sections.forEach(sec => sec.classList.remove('active'));
  navItems.forEach(item => item.classList.remove('active'));
  
  const targetSec = document.getElementById(`section-${sectionId}`);
  if (targetSec) {
    targetSec.classList.add('active');
  }
  
  const navBtn = document.querySelector(`.nav-item[data-section="${sectionId}"]`);
  if (navBtn) {
    navBtn.classList.add('active');
  }

  // Update section title badge
  sectionBadge.textContent = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);

  // Trigger animations for concept page
  if (sectionId === 'concept') {
    animateConceptThumbs();
  }
}

navItems.forEach(item => {
  item.addEventListener('click', () => {
    const target = item.getAttribute('data-section');
    switchSection(target);
  });
});

// Section 1: Animation on Concept Load
function animateConceptThumbs() {
  const earthThumb = document.getElementById('thumb-earth');
  const mercuryThumb = document.getElementById('thumb-mercury');
  earthThumb.classList.remove('animated');
  mercuryThumb.classList.remove('animated');
  
  // Stagger animation
  setTimeout(() => earthThumb.classList.add('animated'), 50);
  setTimeout(() => mercuryThumb.classList.add('animated'), 250);
}

// Initial Load Animation
document.addEventListener('DOMContentLoaded', () => {
  animateConceptThumbs();
});


// SECTION 2A: BAROMETER INTERACTIVE
const barometerSvg = document.getElementById('barometer-svg');
const barSlider = document.getElementById('bar-slider');
const barSliderVal = document.getElementById('bar-slider-val');
const barReadout = document.getElementById('bar-readout');
const barWeatherStatus = document.getElementById('bar-weather-status');
const barStatusLabel = document.getElementById('bar-status-label');
const barMercuryColumn = document.getElementById('bar-mercury-column');
const barHeightMarker = document.getElementById('bar-height-marker');
const barIndicatorLine = document.getElementById('bar-indicator-line');
const barIndicatorVal = document.getElementById('bar-indicator-val');

// Sensor elements
const barSensorDot = document.getElementById('bar-sensor-dot');
const barSensorLbl = document.getElementById('bar-sensor-lbl');
const barSensorRulerLine = document.getElementById('bar-sensor-ruler-line');
const barSensorMmhgVal = document.getElementById('bar-sensor-mmhg-val');
const barSensorPVal = document.getElementById('bar-sensor-p-val');
const barSensorHVal = document.getElementById('bar-sensor-h-val');

let sensorY = 150; // Initial sensor Y height

function updateSensorPosition() {
  // Constrain sensor Y between 40 (800 mm ruler top) and 272 (0 mm reservoir)
  sensorY = Math.max(40, Math.min(sensorY, 272));
  
  barSensorDot.setAttribute('cy', sensorY);
  barSensorRulerLine.setAttribute('y1', sensorY);
  barSensorRulerLine.setAttribute('y2', sensorY);

  const pxPerMm = 232 / 800;
  const h_dot = (272 - sensorY) / pxPerMm;

  const Pa = parseInt(barSlider.value);
  const h_mercury = Pa / PA_TO_MM;

  let p_at_point = 0;
  let p_at_point_mmhg = 0;

  if (h_dot <= h_mercury) {
    // Under the mercury column level, pressure increases with depth: P = Pa - h_dot * rho * g
    p_at_point = Math.round(Pa - (h_dot * PA_TO_MM));
    p_at_point_mmhg = h_mercury - h_dot;
  } else {
    // In the Torricellian vacuum above the mercury column
    p_at_point = 0;
    p_at_point_mmhg = 0;
  }

  barSensorLbl.setAttribute('y', sensorY - 7);
  barSensorMmhgVal.textContent = `P = ${p_at_point_mmhg.toFixed(1)} mmHg`;
  barSensorPVal.textContent = `P = ${p_at_point.toLocaleString()} Pa`;
  barSensorHVal.textContent = `h = ${h_dot.toFixed(1)} mm`;
}

function updateBarometer() {
  const Pa = parseInt(barSlider.value);
  barSliderVal.textContent = Pa.toLocaleString() + ' Pa';
  
  // Height in mm: h = Pa / (13.6 * 10)
  const h_mm = Pa / PA_TO_MM;
  const h_mm_rounded = h_mm.toFixed(1);
  
  barReadout.textContent = `Pₐ = ${Pa.toLocaleString()} Pa | Column height = ${h_mm_rounded} mm`;
  
  // Weather status
  let statusText = "";
  let statusClass = "neutral";
  if (Pa < 100000) {
    statusText = "Low pressure (stormy weather likely)";
    statusClass = "violet";
  } else if (Pa > 102000) {
    statusText = "High pressure (fair weather)";
    statusClass = "crimson";
  } else {
    statusText = "Standard pressure";
    statusClass = "neutral";
  }
  
  barWeatherStatus.textContent = statusText;
  barWeatherStatus.className = `status-badge ${statusClass}`;
  barStatusLabel.textContent = statusClass === 'neutral' ? "Standard Pressure" : (statusClass === 'crimson' ? "High Pressure" : "Low Pressure");
  barStatusLabel.style.color = `var(--${statusClass === 'neutral' ? 'brass-gold' : (statusClass === 'crimson' ? 'high-crimson' : 'low-violet')})`;
  barStatusLabel.style.borderColor = barStatusLabel.style.color;

  // SVG update
  // Scale details: 0 mm height = y: 272. 800 mm height = y: 40.
  // 800 mm range = 232 pixels. 232 / 800 = 0.29 px/mm.
  const pxPerMm = 232 / 800;
  const colHeightPx = h_mm * pxPerMm;
  const colY = 272 - colHeightPx;

  barMercuryColumn.setAttribute('y', colY);
  barMercuryColumn.setAttribute('height', colHeightPx);

  // Update height indicator
  barIndicatorLine.setAttribute('y1', colY);
  barIndicatorLine.setAttribute('y2', colY);
  
  // Position label and bracket pointer
  barHeightMarker.querySelector('polygon').setAttribute('points', `125,${colY} 130,${colY-4} 130,${colY+4}`);
  barIndicatorVal.setAttribute('y', colY + 3);
  barIndicatorVal.textContent = `${h_mm_rounded} mm`;

  // Update sensor pressure calculations based on the new mercury height
  updateSensorPosition();
}

// Drag interactions for sensor dot inside the tube
let isDraggingSensor = false;

function handleSensorDrag(clientY) {
  const rect = barometerSvg.getBoundingClientRect();
  const relativeY = ((clientY - rect.top) / rect.height) * 320; // 320 matches viewBox height
  sensorY = relativeY;
  updateSensorPosition();
}

barometerSvg.addEventListener('mousedown', (e) => {
  const rect = barometerSvg.getBoundingClientRect();
  const relativeX = ((e.clientX - rect.left) / rect.width) * 200; // 200 matches viewBox width
  const relativeY = ((e.clientY - rect.top) / rect.height) * 320;

  // Click must be inside or near the glass column region to move sensor
  if (relativeX >= 75 && relativeX <= 125 && relativeY >= 35 && relativeY <= 275) {
    isDraggingSensor = true;
    handleSensorDrag(e.clientY);
  }
});

window.addEventListener('mousemove', (e) => {
  if (isDraggingSensor) {
    handleSensorDrag(e.clientY);
  }
});

window.addEventListener('mouseup', () => {
  isDraggingSensor = false;
});

// Touch events for mobile
barometerSvg.addEventListener('touchstart', (e) => {
  const touch = e.touches[0];
  const rect = barometerSvg.getBoundingClientRect();
  const relativeX = ((touch.clientX - rect.left) / rect.width) * 200;
  const relativeY = ((touch.clientY - rect.top) / rect.height) * 320;

  if (relativeX >= 75 && relativeX <= 125 && relativeY >= 35 && relativeY <= 275) {
    isDraggingSensor = true;
    handleSensorDrag(touch.clientY);
    e.preventDefault(); // prevent screen scrolling while dragging sensor
  }
}, { passive: false });

window.addEventListener('touchmove', (e) => {
  if (isDraggingSensor) {
    handleSensorDrag(e.touches[0].clientY);
    e.preventDefault();
  }
}, { passive: false });

window.addEventListener('touchend', () => {
  isDraggingSensor = false;
});

barSlider.addEventListener('input', updateBarometer);
updateBarometer(); // Run once to initialize

// Accordion Logic
const barWhyMercury = document.getElementById('bar-why-mercury');
barWhyMercury.querySelector('.accordion-header').addEventListener('click', () => {
  barWhyMercury.classList.toggle('expanded');
});


// SECTION 2B: MANOMETER INTERACTIVE
const manPgasSlider = document.getElementById('man-pgas-slider');
const manPaSlider = document.getElementById('man-pa-slider');
const manPgasVal = document.getElementById('man-pgas-val');
const manPaVal = document.getElementById('man-pa-val');
const manReadoutPgas = document.getElementById('man-readout-pgas');
const manReadoutPa = document.getElementById('man-readout-pa');
const manReadoutDiff = document.getElementById('man-readout-diff');
const manReadoutH = document.getElementById('man-readout-h');
const manStatusLabel = document.getElementById('man-status-label');
const manMercuryFill = document.getElementById('man-mercury-fill');
const manLeftIndicator = document.getElementById('man-left-indicator');
const manRightIndicator = document.getElementById('man-right-indicator');
const manBracketLine = document.getElementById('man-bracket-line');
const manBracketTop = document.getElementById('man-bracket-top');
const manBracketBot = document.getElementById('man-bracket-bot');
const manHeightLbl = document.getElementById('man-height-lbl');
const manStepFormula = document.getElementById('man-step-formula');
const manStepCalc = document.getElementById('man-step-calc');

function updateManometer() {
  const Pgas = parseInt(manPgasSlider.value);
  const Pa = parseInt(manPaSlider.value);
  
  manPgasVal.textContent = Pgas.toLocaleString() + ' Pa';
  manPaVal.textContent = Pa.toLocaleString() + ' Pa';

  manReadoutPgas.textContent = `${Pgas.toLocaleString()} Pa`;
  manReadoutPa.textContent = `${Pa.toLocaleString()} Pa`;
  
  const diff = Pgas - Pa;
  const absDiff = Math.abs(diff);
  const h_mm = absDiff / PA_TO_MM;
  const h_mm_rounded = h_mm.toFixed(1);

  manReadoutDiff.textContent = `${absDiff.toLocaleString()} Pa`;
  manReadoutH.textContent = `${h_mm_rounded} mm`;

  // Determine status & color coding
  let statusText = "Gas pressure EQUALS atmospheric";
  let colorVar = "var(--brass-gold)";
  let colorHex = "#FFD700";
  let statusBadgeText = "Pgas = Pₐ";

  if (diff > 0) {
    statusText = "Gas pressure ABOVE atmospheric";
    colorVar = "var(--high-crimson)";
    colorHex = "#DC143C";
    statusBadgeText = "Pgas > Pₐ";
  } else if (diff < 0) {
    statusText = "Gas pressure BELOW atmospheric";
    colorVar = "var(--low-violet)";
    colorHex = "#7B2FBE";
    statusBadgeText = "Pgas < Pₐ";
  }

  manStatusLabel.textContent = statusBadgeText;
  manStatusLabel.style.color = colorVar;
  manStatusLabel.style.borderColor = colorVar;

  // Interactive SVG mercury animation
  // Base line: both levels flat at y = 160.
  // Scale height difference visual representation: 1 mm difference = 0.25 pixels level offset.
  // Maximum visual offset = 50px (which corresponds to 200mm).
  const pxPerMm = 0.25;
  const visualOffset = Math.min((h_mm / 2) * pxPerMm, 50);

  let yLeft = 160;
  let yRight = 160;

  if (diff > 0) {
    // Gas pressure pushes left arm down, right arm goes up
    yLeft = 160 + visualOffset;
    yRight = 160 - visualOffset;
  } else if (diff < 0) {
    // Gas pressure is lower, atmosphere pushes right arm down, left arm goes up
    yLeft = 160 - visualOffset;
    yRight = 160 + visualOffset;
  }

  // Draw U-tube mercury fill
  manMercuryFill.setAttribute('d', `M 86 ${yLeft} L 104 ${yLeft} L 104 240 A 15 15 0 0 0 136 240 L 136 ${yRight} L 154 ${yRight} L 154 240 A 34 34 0 0 1 86 240 Z`);

  // Left & Right Indicators
  manLeftIndicator.setAttribute('y1', yLeft);
  manLeftIndicator.setAttribute('y2', yLeft);
  manLeftIndicator.setAttribute('stroke', diff < 0 ? 'var(--low-violet)' : (diff > 0 ? 'var(--high-crimson)' : 'var(--brass-gold)'));
  
  manRightIndicator.setAttribute('y1', yRight);
  manRightIndicator.setAttribute('y2', yRight);
  manRightIndicator.setAttribute('stroke', 'var(--brass-gold)');

  // Height difference brackets
  if (h_mm > 0) {
    const topY = Math.min(yLeft, yRight);
    const botY = Math.max(yLeft, yRight);

    manBracketLine.setAttribute('x1', 170);
    manBracketLine.setAttribute('y1', topY);
    manBracketLine.setAttribute('x2', 170);
    manBracketLine.setAttribute('y2', botY);
    manBracketLine.setAttribute('stroke', colorHex);
    manBracketLine.style.display = 'block';

    manBracketTop.setAttribute('x1', 165);
    manBracketTop.setAttribute('y1', topY);
    manBracketTop.setAttribute('x2', 175);
    manBracketTop.setAttribute('y2', topY);
    manBracketTop.setAttribute('stroke', colorHex);
    manBracketTop.style.display = 'block';

    manBracketBot.setAttribute('x1', 165);
    manBracketBot.setAttribute('y1', botY);
    manBracketBot.setAttribute('x2', 175);
    manBracketBot.setAttribute('y2', botY);
    manBracketBot.setAttribute('stroke', colorHex);
    manBracketBot.style.display = 'block';

    manHeightLbl.setAttribute('y', (topY + botY) / 2 + 3);
    manHeightLbl.setAttribute('fill', colorHex);
    manHeightLbl.textContent = `h = ${h_mm_rounded} mm`;
    manHeightLbl.style.display = 'block';
  } else {
    // Hide brackets when equal
    manBracketLine.style.display = 'none';
    manBracketTop.style.display = 'none';
    manBracketBot.style.display = 'none';
    manHeightLbl.style.display = 'none';
  }

  // Live Working Steps UI
  if (diff > 0) {
    manStepFormula.textContent = `Pgas = Pₐ + hρg`;
    manStepCalc.innerHTML = `
      <span>h = ${h_mm_rounded} mm = ${(h_mm / 1000).toFixed(4)} m</span>
      <span>Pgas = ${Pa.toLocaleString()} + (${(h_mm / 1000).toFixed(4)} × 13,600 × 10)</span>
      <span>Pgas = ${Pa.toLocaleString()} + ${Math.round(h_mm/1000 * 136000).toLocaleString()}</span>
      <span style="color:var(--high-crimson); font-weight:bold;">Pgas = ${Pgas.toLocaleString()} Pa</span>
    `;
  } else if (diff < 0) {
    manStepFormula.textContent = `Pgas = Pₐ − hρg`;
    manStepCalc.innerHTML = `
      <span>h = ${h_mm_rounded} mm = ${(h_mm / 1000).toFixed(4)} m</span>
      <span>Pgas = ${Pa.toLocaleString()} − (${(h_mm / 1000).toFixed(4)} × 13,600 × 10)</span>
      <span>Pgas = ${Pa.toLocaleString()} − ${Math.round(h_mm/1000 * 136000).toLocaleString()}</span>
      <span style="color:var(--low-violet); font-weight:bold;">Pgas = ${Pgas.toLocaleString()} Pa</span>
    `;
  } else {
    manStepFormula.textContent = `Pgas = Pₐ`;
    manStepCalc.innerHTML = `
      <span>h = 0 mm</span>
      <span>Pgas = Pₐ = ${Pa.toLocaleString()} Pa</span>
    `;
  }
}

manPgasSlider.addEventListener('input', updateManometer);
manPaSlider.addEventListener('input', updateManometer);
updateManometer(); // Initialize


// SECTION 3: RANDOMISED QUIZ (30 QUESTIONS)
let quizQuestions = [];
let currentQuestionIndex = 0;
let quizScore = 0;
let hasCheckedAnswer = false;

const conceptualPool = [
  {
    type: 'E',
    question: "In a mercury barometer, what fills the space above the mercury column?",
    options: ["Air", "Nitrogen", "Vacuum", "Water vapour"],
    correctIndex: 2,
    working: "Since the tube was originally completely filled with mercury and then inverted, no air could enter. The space left above the falling mercury column contains empty space or a vacuum (pressure ≈ 0)."
  },
  {
    type: 'E',
    question: "Why is mercury preferred over water in a barometer?",
    options: [
      "Mercury is cheaper than water",
      "Mercury is less toxic to handle",
      "Mercury is much denser so the column stays short",
      "Mercury does not evaporate at all"
    ],
    correctIndex: 2,
    working: "Because mercury's density (13,600 kg/m³) is 13.6 times that of water (1,000 kg/m³), the height of the column required to balance standard atmospheric pressure is 13.6 times shorter (approx. 760 mm instead of 10.3 meters)."
  },
  {
    type: 'E',
    question: "A manometer shows the gas-side mercury level is lower than the open side. This means gas pressure is ___.",
    options: ["equal to atmospheric pressure", "below atmospheric pressure", "above atmospheric pressure", "zero"],
    correctIndex: 2,
    working: "If the mercury level on the gas side is pushed further down, it indicates that the gas pressure is pushing harder than the atmospheric pressure on the open side. Thus, Pgas > Pₐ."
  },
  {
    type: 'E',
    question: "Standard atmospheric pressure is approximately ___.",
    options: ["10,000 Pa", "101,000 Pa", "760,000 Pa", "1,000,000 Pa"],
    correctIndex: 1,
    working: "Standard atmospheric pressure at sea level is 1 atm = 101,325 Pa ≈ 101,000 Pa (or 101 kPa)."
  },
  {
    type: 'E',
    question: "If atmospheric pressure increases, what happens to the mercury column height in a barometer?",
    options: ["Decreases", "Stays the same", "Increases", "Depends on tube width"],
    correctIndex: 2,
    working: "According to Pₐ = hρg, if atmospheric pressure (Pₐ) increases, the height (h) must increase proportionally to balance the higher downward pressure."
  },
  {
    type: 'E',
    question: "How does the diameter of the glass tube affect the height of the mercury column in a barometer?",
    options: [
      "Wider tubes support taller columns",
      "Narrower tubes support taller columns",
      "It has no effect on the column height",
      "It doubles the column height"
    ],
    correctIndex: 2,
    working: "Pressure depends only on vertical depth/height of the liquid column (P = hρg). The diameter or cross-sectional area of the tube does not affect the vertical height balanced by atmospheric pressure."
  }
];

function generateQuiz() {
  quizQuestions = [];
  
  // 1. Generate 6 Type A questions: Calculate Pa from h
  for (let i = 0; i < 6; i++) {
    // h between 720 and 780 in multiples of 5 mm
    const h_mm = 720 + Math.floor(Math.random() * 13) * 5;
    const h_m = h_mm / 1000;
    const ans_pa = Math.round(h_m * RHO_MERCURY * G_ACCEL);
    
    quizQuestions.push({
      type: 'A',
      question: `A mercury barometer shows a mercury column height of ${h_mm} mm. Calculate the atmospheric pressure Pₐ. (Take density of mercury ρ = 13,600 kg/m³ and g = 10 N/kg)`,
      correctAnswer: ans_pa,
      working: `Formula: Pₐ = h × ρ × g\n` +
               `1. Convert height to meters: h = ${h_mm} mm = ${h_m} m\n` +
               `2. Substitute values: Pₐ = ${h_m} m × 13,600 kg/m³ × 10 N/kg\n` +
               `3. Calculation: Pₐ = ${ans_pa.toLocaleString()} Pa`
    });
  }

  // 2. Generate 6 Type B questions: Calculate h from Pa
  for (let i = 0; i < 6; i++) {
    // Pa between 97000 and 105000 in multiples of 1000 Pa
    const pa = 97000 + Math.floor(Math.random() * 9) * 1000;
    const exact_h = pa / PA_TO_MM;
    const ans_h_mm_1dp = exact_h.toFixed(1);
    
    quizQuestions.push({
      type: 'B',
      question: `If the atmospheric pressure is ${pa.toLocaleString()} Pa, calculate the height h of the mercury column in a barometer. (Take ρ = 13,600 kg/m³ and g = 10 N/kg)`,
      correctAnswer: exact_h,
      ans1dp: parseFloat(ans_h_mm_1dp),
      working: `Formula: h = Pₐ ÷ (ρ × g)\n` +
               `1. Substitute values: h = ${pa.toLocaleString()} ÷ (13,600 × 10)\n` +
               `2. Calculate in meters: h = ${pa} ÷ 136,000 = ${(pa / 136000).toFixed(4)} m\n` +
               `3. Convert to millimeters: ${(pa / 136000).toFixed(4)} m × 1000 = ${exact_h.toFixed(4)} mm\n` +
               `Note: Any rounding between 0 to 4 decimal places (e.g. ${Math.round(exact_h)} mm, ${ans_h_mm_1dp} mm, or ${exact_h.toFixed(4)} mm) is accepted.`
    });
  }

  // 3. Generate 6 Type C questions: Manometer Pgas (above atmospheric)
  for (let i = 0; i < 6; i++) {
    const pa = 99000 + Math.floor(Math.random() * 4) * 1000;
    const h_mm = 20 + Math.floor(Math.random() * 14) * 10;
    const h_m = h_mm / 1000;
    const p_diff = Math.round(h_m * RHO_MERCURY * G_ACCEL);
    const ans_pgas = pa + p_diff;

    quizQuestions.push({
      type: 'C',
      question: `A U-tube manometer filled with mercury is connected to a gas supply. The mercury level on the gas side is lower than the open side by a height difference of ${h_mm} mm. If atmospheric pressure is ${pa.toLocaleString()} Pa, calculate the gas pressure Pgas. (Take ρ = 13,600 kg/m³ and g = 10 N/kg)`,
      correctAnswer: ans_pgas,
      working: `1. Identify pressure relation: since gas-side mercury is lower, gas pressure is ABOVE atmospheric (Pgas > Pₐ).\n` +
               `2. Formula: Pgas = Pₐ + hρg\n` +
               `3. Convert height to meters: h = ${h_mm} mm = ${h_m} m\n` +
               `4. Calculate pressure difference: hρg = ${h_m} × 13,600 × 10 = ${p_diff.toLocaleString()} Pa\n` +
               `5. Add to atmospheric: Pgas = ${pa.toLocaleString()} + ${p_diff.toLocaleString()} = ${ans_pgas.toLocaleString()} Pa`
    });
  }

  // 4. Generate 6 Type D questions: Manometer Pgas (below atmospheric)
  for (let i = 0; i < 6; i++) {
    const pa = 100000 + Math.floor(Math.random() * 4) * 1000;
    const h_mm = 10 + Math.floor(Math.random() * 10) * 10;
    const h_m = h_mm / 1000;
    const p_diff = Math.round(h_m * RHO_MERCURY * G_ACCEL);
    const ans_pgas = pa - p_diff;

    quizQuestions.push({
      type: 'D',
      question: `A U-tube manometer filled with mercury is connected to a gas supply. The mercury level on the gas side is higher than the open side by a height difference of ${h_mm} mm. If atmospheric pressure is ${pa.toLocaleString()} Pa, calculate the gas pressure Pgas. (Take ρ = 13,600 kg/m³ and g = 10 N/kg)`,
      correctAnswer: ans_pgas,
      working: `1. Identify pressure relation: since gas-side mercury is higher, gas pressure is BELOW atmospheric (Pgas < Pₐ).\n` +
               `2. Formula: Pgas = Pₐ − hρg\n` +
               `3. Convert height to meters: h = ${h_mm} mm = ${h_m} m\n` +
               `4. Calculate pressure difference: hρg = ${h_m} × 13,600 × 10 = ${p_diff.toLocaleString()} Pa\n` +
               `5. Subtract from atmospheric: Pgas = ${pa.toLocaleString()} − ${p_diff.toLocaleString()} = ${ans_pgas.toLocaleString()} Pa`
    });
  }

  // 5. Add 6 Conceptual MCQ questions
  conceptualPool.forEach(q => {
    quizQuestions.push(q);
  });

  // Shuffle entire set
  shuffleArray(quizQuestions);
  
  currentQuestionIndex = 0;
  quizScore = 0;
  showQuestion();
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Quiz UI display elements
const progressText = document.getElementById('quiz-progress-text');
const progressBar = document.getElementById('quiz-progress-bar');
const questionTextEl = document.getElementById('question-text');
const numericArea = document.getElementById('quiz-numeric-area');
const numberInput = document.getElementById('quiz-number-input');
const mcqArea = document.getElementById('quiz-mcq-area');
const feedbackArea = document.getElementById('quiz-feedback');
const quizActionBtn = document.getElementById('quiz-action-btn');

function showQuestion() {
  hasCheckedAnswer = false;
  feedbackArea.style.display = 'none';
  quizActionBtn.textContent = 'Check Answer';
  
  // Progress indicators
  progressText.textContent = `Question ${currentQuestionIndex + 1} of 30`;
  progressBar.style.width = `${((currentQuestionIndex) / 30) * 100}%`;
  
  const q = quizQuestions[currentQuestionIndex];
  questionTextEl.textContent = q.question;

  // Clear previous values
  numberInput.value = '';
  mcqArea.innerHTML = '';

  if (q.type === 'E') {
    // MCQ question
    numericArea.style.display = 'none';
    mcqArea.style.display = 'flex';
    
    q.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'mcq-option';
      btn.textContent = `${String.fromCharCode(65 + idx)}. ${opt}`;
      btn.addEventListener('click', () => {
        document.querySelectorAll('.mcq-option').forEach(el => el.classList.remove('selected'));
        btn.classList.add('selected');
      });
      mcqArea.appendChild(btn);
    });
  } else {
    // Numeric question
    numericArea.style.display = 'block';
    mcqArea.style.display = 'none';
  }
}

// Celebration / Confetti Animation
function triggerConfetti() {
  const container = document.getElementById('section-quiz');
  for (let i = 0; i < 40; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.top = '0px';
    confetti.style.backgroundColor = ['#FFD700', '#C0C0C0', '#4CAF50', '#00E676'][Math.floor(Math.random() * 4)];
    confetti.style.transform = `scale(${Math.random() * 0.6 + 0.4})`;
    
    const duration = Math.random() * 1.5 + 1;
    confetti.style.animationDuration = duration + 's';
    
    container.appendChild(confetti);
    
    setTimeout(() => {
      confetti.remove();
    }, duration * 1000);
  }
}

function checkAnswer() {
  const q = quizQuestions[currentQuestionIndex];
  let isCorrect = false;
  let userAnsStr = "";
  
  if (q.type === 'E') {
    const selectedOpt = mcqArea.querySelector('.mcq-option.selected');
    if (!selectedOpt) {
      alert("Please select an option before checking.");
      return;
    }
    const selectedIndex = Array.from(mcqArea.children).indexOf(selectedOpt);
    isCorrect = (selectedIndex === q.correctIndex);
    userAnsStr = q.options[selectedIndex];
  } else {
    const rawInput = numberInput.value.trim();
    if (!rawInput) {
      alert("Please enter your answer.");
      return;
    }
    
    // Remove commas (e.g. 101,300 -> 101300)
    const cleanInput = rawInput.replace(/,/g, '');
    // Regex matches a float/integer, optional spacing, and unit containing chars/symbols
    const match = cleanInput.match(/^([\d.]+)\s*([a-zA-Z0-9/^²]+)$/);
    
    if (!match) {
      isCorrect = false;
      userAnsStr = `${rawInput} (Error: you must write the unit next to your numerical answer, e.g. Pa or mm)`;
    } else {
      const userVal = parseFloat(match[1]);
      const userUnit = match[2].toLowerCase();
      
      let unitMatches = false;
      if (q.type === 'B') {
        unitMatches = (userUnit === 'mm');
      } else {
        // Pa or equivalent N/m2 formats
        unitMatches = (userUnit === 'pa' || userUnit === 'n/m2' || userUnit === 'n/m^2' || userUnit === 'n/m²');
      }
      
      if (!unitMatches) {
        isCorrect = false;
        const expectedUnitText = (q.type === 'B') ? 'MM' : 'Pa (or N/m²)';
        userAnsStr = `${match[1]} ${match[2]} (Error: incorrect unit, expected ${expectedUnitText})`;
      } else {
        if (q.type === 'B') {
          // Check if matches rounding of true value to 0, 1, 2, 3, or 4 decimal places
          let matchesRounding = false;
          const exactVal = q.correctAnswer;
          for (let dp = 0; dp <= 4; dp++) {
            const roundedVal = parseFloat(exactVal.toFixed(dp));
            if (Math.abs(userVal - roundedVal) < 0.0001) {
              matchesRounding = true;
              break;
            }
          }
          isCorrect = matchesRounding;
          userAnsStr = `${userVal} ${match[2]}`;
        } else {
          // Type A, C, D are whole numbers (integers)
          isCorrect = (Math.abs(userVal - q.correctAnswer) < 0.1);
          userAnsStr = `${userVal} ${match[2]}`;
        }
      }
    }
  }

  hasCheckedAnswer = true;
  const feedbackTitle = document.getElementById('feedback-title');
  const feedbackMsg = document.getElementById('feedback-msg');
  const feedbackWorking = document.getElementById('feedback-working');
  const qBox = document.getElementById('quiz-question-box');

  if (isCorrect) {
    quizScore++;
    feedbackArea.className = "feedback-area correct";
    feedbackTitle.textContent = "Spot on! ✓";
    feedbackMsg.textContent = "Excellent work. You completed this calculation perfectly.";
    feedbackWorking.innerHTML = "";
    triggerConfetti();
  } else {
    feedbackArea.className = "feedback-area wrong";
    feedbackTitle.textContent = "Not quite! ✕";
    
    let displayCorrectAns = "";
    if (q.type === 'E') {
      displayCorrectAns = q.options[q.correctIndex];
    } else if (q.type === 'B') {
      displayCorrectAns = `${q.correctAnswer.toFixed(1)} mm (or rounded from 0 to 4 decimal places)`;
    } else {
      displayCorrectAns = `${q.correctAnswer.toLocaleString()} Pa (or N/m²)`;
    }
    
    feedbackMsg.textContent = `Your answer: ${userAnsStr}. Correct Answer: ${displayCorrectAns}`;
    
    // Add shake animation
    qBox.classList.add('shake');
    setTimeout(() => qBox.classList.remove('shake'), 400);

    // Show step by step calculation
    feedbackWorking.innerHTML = `<strong>Step-by-step working:</strong><br>${q.working.replace(/\n/g, '<br>')}`;
  }

  feedbackArea.style.display = 'block';
  quizActionBtn.textContent = (currentQuestionIndex < 29) ? 'Next Question' : 'Finish Quiz';
}

quizActionBtn.addEventListener('click', () => {
  if (!hasCheckedAnswer) {
    checkAnswer();
  } else {
    currentQuestionIndex++;
    if (currentQuestionIndex < 30) {
      showQuestion();
    } else {
      showResults();
    }
  }
});


// SECTION 4: SCORE AND FEEDBACK
const scoreVal = document.getElementById('score-val');
const starRating = document.getElementById('star-rating');
const scoreFeedback = document.getElementById('score-feedback');
const scoreRetryBtn = document.getElementById('score-retry-btn');
const scoreFlashcardsBtn = document.getElementById('score-flashcards-btn');

function showResults() {
  switchSection('score');
  
  scoreVal.textContent = `${quizScore}/30`;
  
  // Stars & Feedback Message
  let rating = "";
  let feedback = "";
  
  if (quizScore >= 24) {
    rating = "★★★";
    feedback = "Excellent! You've mastered atmospheric pressure measurement.";
  } else if (quizScore >= 15) {
    rating = "★★☆";
    feedback = "Good effort! Review the questions you got wrong.";
  } else {
    rating = "★☆☆";
    feedback = "Keep practising — revisit the barometer and manometer diagrams and try again.";
  }
  
  starRating.textContent = rating;
  scoreFeedback.textContent = feedback;
}

scoreRetryBtn.addEventListener('click', () => {
  generateQuiz();
  switchSection('quiz');
});

scoreFlashcardsBtn.addEventListener('click', () => {
  switchSection('flashcards');
});


// SECTION 5: FLASHCARD REVISION MODE
const flashcardsPool = [
  { q: "What is atmospheric pressure?", a: "The pressure exerted by the weight of the air above a surface." },
  { q: "Standard atmospheric pressure value", a: "101,325 Pa ≈ 101 kPa (or 1 atm)" },
  { q: "What is a barometer used for?", a: "Measuring atmospheric pressure." },
  { q: "What is above the mercury in a barometer tube?", a: "A vacuum (pressure = 0)." },
  { q: "Formula to find atmospheric pressure from barometer", a: "Pₐ = hρg (h = column height, ρ = 13,600 kg/m³, g = 10 N/kg)." },
  { q: "Why is mercury used in barometers instead of water?", a: "Mercury is very dense — the column height stays manageable (~760 mm vs ~10 m for water)." },
  { q: "What does a manometer measure?", a: "The difference between gas pressure and atmospheric pressure." },
  { q: "If manometer gas-side mercury is lower, gas pressure is ___", a: "Above atmospheric (Pgas > Pₐ)." },
  { q: "If manometer gas-side mercury is higher, gas pressure is ___", a: "Below atmospheric (Pgas < Pₐ)." },
  { q: "Formula for gas pressure using manometer (above atm)", a: "Pgas = Pₐ + hρg" },
  { q: "Formula for gas pressure using manometer (below atm)", a: "Pgas = Pₐ − hρg" },
  { q: "Standard atmospheric pressure in mm of mercury", a: "760 mmHg" }
];

let flashcardsState = [];
let currentFlashcardIndex = 0;

function initFlashcards() {
  // Reset deck state
  flashcardsState = flashcardsPool.map((card, index) => ({
    ...card,
    id: index,
    needsReview: true
  }));
  currentFlashcardIndex = 0;
  updateFlashcardUI();
}

const flashcardEl = document.getElementById('flashcard-el');
const flashcardFrontText = document.getElementById('flashcard-front-text');
const flashcardBackText = document.getElementById('flashcard-back-text');
const flashcardBadge = document.getElementById('flashcard-badge');
const deckStatus = document.getElementById('deck-status');
const fcReviewBtn = document.getElementById('fc-review-btn');
const fcGotBtn = document.getElementById('fc-got-btn');

function updateFlashcardUI() {
  const activeCards = flashcardsState.filter(c => c.needsReview);
  
  if (activeCards.length === 0) {
    flashcardFrontText.textContent = "All Done! 🎉";
    flashcardBackText.textContent = "You have reviewed all flashcards. Tap 'Review Again' to reset.";
    deckStatus.textContent = "0 cards remaining";
    flashcardBadge.textContent = "Completed";
    fcGotBtn.style.display = 'none';
    fcReviewBtn.style.textContent = "Restart Deck";
    
    // Customize button behaviour to restart
    fcReviewBtn.onclick = () => {
      initFlashcards();
      fcGotBtn.style.display = 'flex';
      fcReviewBtn.onclick = handleReviewBtn;
    };
    return;
  }

  // Make sure card shows front face
  flashcardEl.classList.remove('flipped');

  if (currentFlashcardIndex >= activeCards.length) {
    currentFlashcardIndex = 0;
  }

  const card = activeCards[currentFlashcardIndex];
  
  // Delay content updating until flip animation completes if we were flipped
  flashcardFrontText.textContent = card.q;
  flashcardBackText.textContent = card.a;
  
  flashcardBadge.textContent = `Card ${currentFlashcardIndex + 1} / ${activeCards.length}`;
  deckStatus.textContent = `${activeCards.length} cards remaining`;
}

// Flip toggle
flashcardEl.addEventListener('click', () => {
  flashcardEl.classList.toggle('flipped');
});

function handleReviewBtn() {
  // Push this card to the end of review queue
  currentFlashcardIndex++;
  updateFlashcardUI();
}

function handleGotBtn() {
  const activeCards = flashcardsState.filter(c => c.needsReview);
  if (activeCards.length > 0) {
    const card = activeCards[currentFlashcardIndex];
    card.needsReview = false;
    updateFlashcardUI();
  }
}

fcReviewBtn.onclick = handleReviewBtn;
fcGotBtn.onclick = handleGotBtn;

// Initialize App Engines on Load
generateQuiz();
initFlashcards();
