// ==========================================
// 1. STATE DEFINITIONS
// ==========================================

const simState = {
  f1: 50,      // Input Force (N)
  a1: 0.002,   // Input Area (m^2)
  a2: 0.020,   // Output Area (m^2)
  pressure: 25000, // Pa
  f2: 500,     // Output Force (N)
  mechAdvantage: 10,
  animationTime: 0,
};

const quizState = {
  questions: [],
  currentIndex: 0,
  score: 0,
  isChecked: false,
  selectedMcqOption: null,
};

const cardDeck = [
  {
    q: "What is Pascal's Principle?",
    a: "Pressure applied to an enclosed fluid is transmitted equally and undiminished in all directions."
  },
  {
    q: "What is the formula linking pressure, force, and area for the two pistons?",
    a: "P = F₁ ÷ A₁ = F₂ ÷ A₂"
  },
  {
    q: "How does a hydraulic press multiply force?",
    a: "The output piston has a larger area, so the same fluid pressure acting on a larger area produces a larger output force (F₂ = P × A₂)."
  },
  {
    q: "What type of fluid is used in hydraulic systems?",
    a: "A non-compressible liquid (e.g., mineral oil or specialized hydraulic oil)."
  },
  {
    q: "Why can't gases be used in hydraulic systems?",
    a: "Gases are highly compressible. Pushing the input piston would compress the gas rather than transmitting pressure to move the output piston."
  },
  {
    q: "If output area A₂ is 5 times larger than input area A₁, how does output force F₂ compare to F₁?",
    a: "F₂ = 5 × F₁ (Force is multiplied 5 times)."
  },
  {
    q: "What is the SI unit of pressure in hydraulic calculations?",
    a: "Pascal (Pa), which is equal to 1 Newton per square meter (N/m²)."
  },
  {
    q: "Give two real-world examples of hydraulic systems.",
    a: "Car hydraulic brake systems, hydraulic lifts, dentist chairs, and construction excavator arms."
  },
  {
    q: "If F₁ = 100 N, A₁ = 0.01 m², and A₂ = 0.05 m², find the output force F₂.",
    a: "F₂ = F₁ × (A₂ ÷ A₁) = 100 × (0.05 ÷ 0.01) = 500 N."
  },
  {
    q: "What happens to force and pressure if the output piston is smaller than the input piston?",
    a: "Force is reduced, not multiplied (F₂ < F₁). However, fluid pressure remains the same at both pistons."
  }
];

const cardState = {
  activeDeck: [],
  currentIndex: 0,
  isFlipped: false
};

// ==========================================
// 2. SIMULATION ENGINE
// ==========================================

let svg, fluidChamber, inputPiston, inputShaft, outputPiston, outputShaft;
let labelF1Arrow, labelF2Arrow, textA1, textA2;
let bubbleF1, bubbleA1, bubbleA2;
let valPressure, valF2, valMulti, warningLabel;

function initSimulation() {
  svg = document.getElementById('press-svg');
  fluidChamber = document.getElementById('fluid-chamber');
  inputPiston = document.getElementById('input-piston');
  inputShaft = document.getElementById('input-shaft');
  outputPiston = document.getElementById('output-piston');
  outputShaft = document.getElementById('output-shaft');
  labelF1Arrow = document.getElementById('label-f1-arrow');
  labelF2Arrow = document.getElementById('label-f2-arrow');
  textA1 = document.getElementById('text-a1');
  textA2 = document.getElementById('text-a2');

  bubbleF1 = document.getElementById('bubble-f1');
  bubbleA1 = document.getElementById('bubble-a1');
  bubbleA2 = document.getElementById('bubble-a2');

  valPressure = document.getElementById('val-pressure');
  valF2 = document.getElementById('val-f2');
  valMulti = document.getElementById('val-multi');
  warningLabel = document.getElementById('warning-label');

  const inputF1 = document.getElementById('input-f1');
  const inputA1 = document.getElementById('input-a1');
  const inputA2 = document.getElementById('input-a2');

  const updateFromSliders = () => {
    simState.f1 = parseFloat(inputF1.value);
    simState.a1 = parseFloat(inputA1.value);
    simState.a2 = parseFloat(inputA2.value);
    calculatePhysics();
    updateUI();
  };

  inputF1.addEventListener('input', updateFromSliders);
  inputA1.addEventListener('input', updateFromSliders);
  inputA2.addEventListener('input', updateFromSliders);

  document.querySelectorAll('[data-scenario]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const scenario = e.currentTarget.getAttribute('data-scenario');
      document.querySelectorAll('[data-scenario]').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');

      if (scenario === 'brake') {
        inputF1.value = 50;
        inputA1.value = 0.002;
        inputA2.value = 0.020;
      } else if (scenario === 'lift') {
        inputF1.value = 200;
        inputA1.value = 0.005;
        inputA2.value = 0.200;
      } else if (scenario === 'dentist') {
        inputF1.value = 80;
        inputA1.value = 0.003;
        inputA2.value = 0.060;
      }
      updateFromSliders();
    });
  });

  requestAnimationFrame(animationLoop);
  calculatePhysics();
  updateUI();
}

function calculatePhysics() {
  simState.pressure = simState.f1 / simState.a1;
  simState.f2 = simState.pressure * simState.a2;
  simState.mechAdvantage = simState.f2 / simState.f1;
}

function updateUI() {
  bubbleF1.textContent = `${simState.f1} N`;
  bubbleA1.textContent = `${simState.a1.toFixed(3)} m²`;
  bubbleA2.textContent = `${simState.a2.toFixed(3)} m²`;

  valPressure.textContent = `${simState.pressure.toLocaleString(undefined, {maximumFractionDigits: 1})} Pa`;
  valF2.textContent = `${simState.f2.toLocaleString(undefined, {maximumFractionDigits: 1})} N`;
  valMulti.textContent = `× ${simState.mechAdvantage.toFixed(2)}`;

  if (simState.a1 > simState.a2) {
    warningLabel.classList.remove('hidden');
  } else {
    warningLabel.classList.add('hidden');
  }
}

function animationLoop() {
  simState.animationTime += 0.015;
  const cycle = (Math.sin(simState.animationTime) + 1) / 2;
  
  const leftStroke = cycle * 45;
  const y1 = 60 + leftStroke;

  const areaRatio = simState.a1 / simState.a2;
  const rightStroke = leftStroke * areaRatio;
  const y2 = 105 - rightStroke;

  const w1 = 14 + (simState.a1 - 0.001) * (40 / 0.049);
  const w2 = 24 + (simState.a2 - 0.010) * (90 / 0.490);

  const leftCenter = 80;
  const rightCenter = 280;

  if (inputPiston && outputPiston) {
    inputPiston.setAttribute('x', leftCenter - w1/2);
    inputPiston.setAttribute('y', y1);
    inputPiston.setAttribute('width', w1);

    inputShaft.setAttribute('x1', leftCenter);
    inputShaft.setAttribute('y1', 10);
    inputShaft.setAttribute('x2', leftCenter);
    inputShaft.setAttribute('y2', y1);

    labelF1Arrow.setAttribute('x', leftCenter);
    const leftArrow = document.querySelector('#input-piston-group path');
    if (leftArrow) {
      leftArrow.setAttribute('d', `M ${leftCenter},22 L ${leftCenter},${y1 - 5} M ${leftCenter - 4},${y1 - 10} L ${leftCenter},${y1 - 5} L ${leftCenter + 4},${y1 - 10}`);
    }
    textA1.setAttribute('x', leftCenter);
    textA1.setAttribute('y', y1 + 25);
    textA1.textContent = `${simState.a1.toFixed(3)} m²`;

    outputPiston.setAttribute('x', rightCenter - w2/2);
    outputPiston.setAttribute('y', y2);
    outputPiston.setAttribute('width', w2);

    outputShaft.setAttribute('x1', rightCenter);
    outputShaft.setAttribute('y1', 10);
    outputShaft.setAttribute('x2', rightCenter);
    outputShaft.setAttribute('y2', y2);

    labelF2Arrow.setAttribute('x', rightCenter);
    const rightArrow = document.querySelector('#output-piston-group path');
    if (rightArrow) {
      const arrowLength = Math.min(30, 10 + (simState.f2 / 500) * 15);
      rightArrow.setAttribute('d', `M ${rightCenter},${y2 - 5} L ${rightCenter},${y2 - 5 - arrowLength} M ${rightCenter - 4},${y2 - arrowLength} L ${rightCenter},${y2 - 5 - arrowLength} L ${rightCenter + 4},${y2 - arrowLength}`);
    }
    textA2.setAttribute('x', rightCenter);
    textA2.setAttribute('y', y2 + 25);
    textA2.textContent = `${simState.a2.toFixed(3)} m²`;

    const leftOuter = leftCenter - w1/2;
    const leftInner = leftCenter + w1/2;
    const rightInner = rightCenter - w2/2;
    const rightOuter = rightCenter + w2/2;
    const bottomY = 215;
    const innerBottomY = 175;

    const pathD = `
      M ${leftOuter},${y1 + 14}
      L ${leftOuter},${bottomY - 15}
      Q ${leftOuter},${bottomY} ${leftOuter + 15},${bottomY}
      L ${rightOuter - 15},${bottomY}
      Q ${rightOuter},${bottomY} ${rightOuter},${bottomY - 15}
      L ${rightOuter},${y2 + 14}
      L ${rightInner},${y2 + 14}
      L ${rightInner},${innerBottomY + 15}
      Q ${rightInner},${innerBottomY} ${rightInner - 15},${innerBottomY}
      L ${leftInner + 15},${innerBottomY}
      Q ${leftInner},${innerBottomY} ${leftInner},${innerBottomY + 15}
      L ${leftInner},${y1 + 14}
      Z
    `.replace(/\s+/g, ' ').trim();

    fluidChamber.setAttribute('d', pathD);
  }

  requestAnimationFrame(animationLoop);
}

// ==========================================
// 3. QUIZ ENGINE
// ==========================================

const conceptualQuestions = [
  {
    text: "Why must a hydraulic fluid not be compressible?",
    options: [
      "It would leak under pressure",
      "Pressure would not transmit equally as work is lost compressing the fluid",
      "The pistons would corrode much faster",
      "The fluid would heat up and boil"
    ],
    correctIndex: 1,
    explanation: "If a fluid is compressible (like a gas), applying force merely compresses the fluid molecules closer together instead of transmitting that pressure directly to push the output piston. An incompressible liquid ensures efficient, equal transmission."
  },
  {
    text: "Piston A has area 0.01 m². Piston B has area 0.05 m². Which produces more force for the same input fluid pressure?",
    options: ["Piston A", "Piston B", "Both produce equal force", "Neither produces force"],
    correctIndex: 1,
    explanation: "Since Force = Pressure × Area, and both pistons experience the same pressure, the piston with the larger area (Piston B) will produce a larger output force."
  },
  {
    text: "Pascal's Principle states that pressure applied to an enclosed fluid is transmitted ___.",
    options: [
      "only in the upward direction",
      "only to pistons of a larger size",
      "equally in all directions to all parts of the fluid",
      "proportional to the depth of the cylinder"
    ],
    correctIndex: 2,
    explanation: "Pascal's Principle states that pressure applied to any part of an enclosed incompressible fluid is transmitted undiminished and equally in all directions throughout the fluid."
  },
  {
    text: "In a hydraulic system, if output area A₂ = 10 × A₁, what happens to output force F₂ compared to F₁?",
    options: ["F₂ = F₁", "F₂ = F₁ ÷ 10", "F₂ = F₁ × 10", "F₂ = F₁²"],
    correctIndex: 2,
    explanation: "Since pressure is equal throughout ($F_1 / A_1 = F_2 / A_2$), we rearrange to get $F_2 = F_1 \\times (A_2 / A_1)$. If $A_2$ is 10 times larger, the force is multiplied by 10 ($F_2 = 10 \\times F_1$)."
  },
  {
    text: "Which of the following is NOT a common application of hydraulic systems?",
    options: [
      "Car disc brake systems",
      "Hot air balloon lift mechanics",
      "Dentist chair height adjustments",
      "Hydraulic car lifts in workshop garages"
    ],
    correctIndex: 1,
    explanation: "Hot air balloons use density and buoyancy (Archimedes' Principle) of heated air to lift off, not hydraulic fluid pressure transmission."
  },
  {
    text: "If air bubbles are trapped inside a hydraulic cylinder, the system becomes less efficient because ___.",
    options: [
      "air is incompressible and blocks fluid flow",
      "air is compressible and absorbs input work, reducing force transmission",
      "air increases the overall density of the hydraulic oil",
      "air acts as a physical weight load on the output piston"
    ],
    correctIndex: 1,
    explanation: "Gases like air are highly compressible. When you push the input piston, the energy is wasted compressing the gas bubbles instead of transmitting pressure directly to the output piston, causing a 'spongy' feel and loss of force."
  },
  {
    text: "What is the primary unit of fluid pressure in the SI system?",
    options: ["Newton (N)", "Joule (J)", "Pascal (Pa)", "Watt (W)"],
    correctIndex: 2,
    explanation: "The SI unit of pressure is the Pascal (Pa), which is defined as one Newton per square meter ($1\\text{ N/m}^2$)."
  },
  {
    text: "A hydraulic press acts as a force multiplier because ___.",
    options: [
      "it generates extra energy inside the fluid",
      "the output piston has a larger surface area than the input piston",
      "the output piston moves a larger distance than the input piston",
      "fluid molecules speed up as they flow from narrow to wide tubes"
    ],
    correctIndex: 1,
    explanation: "The force is multiplied because the same pressure acts over a larger output area ($F = P \\times A$). Note that energy is conserved: the output piston moves a much smaller distance than the input piston."
  },
  {
    text: "If you apply a force of 10 N on a piston of area 0.02 m², the pressure created in the liquid is:",
    options: ["0.2 Pa", "5 Pa", "200 Pa", "500 Pa"],
    correctIndex: 3,
    explanation: "Using the pressure formula $P = F \\div A$:\n$P = 10\\text{ N} \\div 0.02\\text{ m}^2 = 500\\text{ Pa}$."
  },
  {
    text: "How does the fluid pressure at the output piston compare to the fluid pressure at the input piston in an ideal closed hydraulic system?",
    options: [
      "Output pressure is higher because the area is larger",
      "Output pressure is lower because the force is larger",
      "Pressure is exactly the same at both pistons",
      "Pressure is zero at the output piston until it moves"
    ],
    correctIndex: 2,
    explanation: "According to Pascal's Principle, pressure applied to an enclosed fluid is transmitted equally in all directions. Thus, the pressure is identical at both pistons."
  }
];

function roundTo(num, decimals) {
  return parseFloat(num.toFixed(decimals));
}

function generateQuiz() {
  quizState.questions = [];
  quizState.currentIndex = 0;
  quizState.score = 0;
  quizState.isChecked = false;
  quizState.selectedMcqOption = null;

  // Type A: Calculate Force (4 find F2, 4 find F1)
  for (let i = 0; i < 8; i++) {
    if (i < 4) {
      // Find F2
      const f1 = Math.floor(Math.random() * 19 + 2) * 10; // 20 to 200 N
      const a1 = roundTo(Math.random() * 0.018 + 0.002, 3); // 0.002 to 0.020 m^2
      let a2 = roundTo(Math.random() * 0.180 + 0.020, 3);
      if (a2 <= a1) a2 = roundTo(a1 + 0.02, 3);

      const p = f1 / a1;
      const f2 = roundTo(p * a2, 1);

      quizState.questions.push({
        type: 'A',
        text: `A hydraulic press has an input piston of area A₁ = ${a1.toFixed(3)} m² and an output piston of area A₂ = ${a2.toFixed(3)} m². If an input force F₁ = ${f1} N is applied to the input piston, calculate the output force F₂ produced on the output piston.`,
        given: { f1, a1, a2 },
        correctVal: f2,
        exactVal: p * a2,
        unit: 'N',
        explanation: `1. Find the pressure transmitted through the fluid: \n   P = F₁ ÷ A₁ = ${f1} N ÷ ${a1.toFixed(3)} m² = ${p.toFixed(1)} Pa\n2. Use the pressure to find the output force:\n   F₂ = P × A₂ = ${p.toFixed(1)} Pa × ${a2.toFixed(3)} m² = ${f2.toFixed(1)} N.`
      });
    } else {
      // Find F1
      const f2 = Math.floor(Math.random() * 46 + 5) * 100; // 500 to 5000 N
      const a1 = roundTo(Math.random() * 0.008 + 0.002, 3);
      const a2 = roundTo(Math.random() * 0.180 + 0.020, 3);

      const p = f2 / a2;
      const f1 = roundTo(p * a1, 1);

      quizState.questions.push({
        type: 'A',
        text: `An output force F₂ = ${f2} N is required on a hydraulic lift's output piston (area A₂ = ${a2.toFixed(3)} m²). If the input piston has an area A₁ = ${a1.toFixed(3)} m², calculate the input force F₁ that must be applied.`,
        given: { f2, a1, a2 },
        correctVal: f1,
        exactVal: p * a1,
        unit: 'N',
        explanation: `1. Find the fluid pressure required by the output piston:\n   P = F₂ ÷ A₂ = ${f2} N ÷ ${a2.toFixed(3)} m² = ${p.toFixed(1)} Pa\n2. Calculate the corresponding input force:\n   F₁ = P × A₁ = ${p.toFixed(1)} Pa × ${a1.toFixed(3)} m² = ${f1.toFixed(1)} N.`
      });
    }
  }

  // Type B: Calculate Area (4 find A2, 3 find A1)
  for (let i = 0; i < 7; i++) {
    if (i < 4) {
      // Find A2
      const f1 = Math.floor(Math.random() * 19 + 2) * 10; // 20 to 200 N
      const a1 = roundTo(Math.random() * 0.018 + 0.002, 3);
      const f2 = Math.floor(Math.random() * 26 + 10) * 50; // 500 to 1800 N
      const p = f1 / a1;
      const a2 = roundTo(f2 / p, 3);

      quizState.questions.push({
        type: 'B',
        text: `A hydraulic cylinder has an input piston of area A₁ = ${a1.toFixed(3)} m². When an input force F₁ = ${f1} N is applied, an output force F₂ = ${f2} N is produced. Calculate the output piston area A₂.`,
        given: { f1, a1, f2 },
        correctVal: a2,
        exactVal: f2 / p,
        unit: 'm²',
        explanation: `1. Find the pressure transmitted through the fluid:\n   P = F₁ ÷ A₁ = ${f1} N ÷ ${a1.toFixed(3)} m² = ${p.toFixed(1)} Pa\n2. Rearrange the output formula (F₂ = P × A₂) to solve for Area:\n   A₂ = F₂ ÷ P = ${f2} N ÷ ${p.toFixed(1)} Pa = ${a2.toFixed(3)} m².`
      });
    } else {
      // Find A1
      const f2 = Math.floor(Math.random() * 36 + 5) * 100; // 500 to 4000 N
      const a2 = roundTo(Math.random() * 0.180 + 0.020, 3);
      const f1 = Math.floor(Math.random() * 19 + 2) * 10; // 20 to 200 N
      const p = f2 / a2;
      const a1 = roundTo(f1 / p, 3);

      quizState.questions.push({
        type: 'B',
        text: `A hydraulic lift has an output piston of area A₂ = ${a2.toFixed(3)} m² that exerts a force F₂ = ${f2} N. If the input force F₁ is ${f1} N, calculate the input piston area A₁.`,
        given: { f2, a2, f1 },
        correctVal: a1,
        exactVal: f1 / p,
        unit: 'm²',
        explanation: `1. Find the pressure transmitted through the fluid:\n   P = F₂ ÷ A₂ = ${f2} N ÷ ${a2.toFixed(3)} m² = ${p.toFixed(1)} Pa\n2. Rearrange the input formula (P = F₁ ÷ A₁) to solve for Area:\n   A₁ = F₁ ÷ P = ${f1} N ÷ ${p.toFixed(1)} Pa = ${a1.toFixed(3)} m².`
      });
    }
  }

  // Type C: Calculate Fluid Pressure (7 find P)
  for (let i = 0; i < 7; i++) {
    const f1 = Math.floor(Math.random() * 49 + 2) * 10; // 20 to 500 N
    const a1 = roundTo(Math.random() * 0.048 + 0.002, 3);
    const p = roundTo(f1 / a1, 1);

    quizState.questions.push({
      type: 'C',
      text: `A physics student applies a force F₁ = ${f1} N to the input piston of area A₁ = ${a1.toFixed(3)} m² in an enclosed hydraulic cylinder. Calculate the fluid pressure P transmitted throughout the system.`,
      given: { f1, a1 },
      correctVal: p,
      exactVal: f1 / a1,
      unit: 'Pa',
      explanation: `Apply Pascal's Principle formula for fluid pressure:\nP = F₁ ÷ A₁\nP = ${f1} N ÷ ${a1.toFixed(3)} m² = ${p.toFixed(1)} Pa.`
    });
  }

  const shuffledConceptual = [...conceptualQuestions].sort(() => Math.random() - 0.5);
  for (let i = 0; i < 8; i++) {
    const mcq = shuffledConceptual[i];
    quizState.questions.push({
      type: 'D',
      text: mcq.text,
      options: mcq.options,
      correctIndex: mcq.correctIndex,
      explanation: mcq.explanation
    });
  }

  quizState.questions.sort(() => Math.random() - 0.5);
}

function renderActiveQuestion() {
  quizState.isChecked = false;
  quizState.selectedMcqOption = null;

  const currentQ = quizState.questions[quizState.currentIndex];

  const progressText = document.getElementById('quiz-progress-text');
  const progressFill = document.getElementById('quiz-progress-fill');
  const liveScore = document.getElementById('quiz-live-score');
  const questionText = document.getElementById('quiz-question-text');
  const interactionContainer = document.getElementById('quiz-interaction-container');
  const feedbackBox = document.getElementById('quiz-feedback-box');
  const btnAction = document.getElementById('btn-quiz-action');

  progressText.textContent = `Question ${quizState.currentIndex + 1} of 30`;
  progressFill.style.width = `${((quizState.currentIndex + 1) / 30) * 100}%`;
  liveScore.textContent = `Score: ${quizState.score}/${quizState.currentIndex}`;

  const bodyPanel = document.querySelector('.quiz-body-panel');
  bodyPanel.classList.remove('shake-wrong', 'pop-correct');
  feedbackBox.classList.add('hidden');

  questionText.textContent = currentQ.text;
  interactionContainer.innerHTML = '';

  btnAction.textContent = "CHECK ANSWER";

  if (currentQ.type === 'D') {
    currentQ.options.forEach((opt, idx) => {
      const optBtn = document.createElement('button');
      optBtn.className = 'mcq-option';
      optBtn.innerHTML = `<strong>${String.fromCharCode(65 + idx)}.</strong> ${opt}`;
      optBtn.addEventListener('click', () => {
        if (quizState.isChecked) return;
        document.querySelectorAll('.mcq-option').forEach(b => b.classList.remove('selected'));
        optBtn.classList.add('selected');
        quizState.selectedMcqOption = idx;
      });
      interactionContainer.appendChild(optBtn);
    });
  } else {
    const wrapper = document.createElement('div');
    wrapper.className = 'input-num-wrapper';

    const inputNum = document.createElement('input');
    inputNum.type = 'text';
    inputNum.placeholder = 'e.g. 50 N or 25000 Pa';
    inputNum.className = 'quiz-input-num';
    inputNum.id = 'quiz-numeric-input';

    wrapper.appendChild(inputNum);
    interactionContainer.appendChild(wrapper);

    setTimeout(() => inputNum.focus(), 100);
  }
}

function checkAnswer() {
  const currentQ = quizState.questions[quizState.currentIndex];
  const bodyPanel = document.querySelector('.quiz-body-panel');
  const feedbackBox = document.getElementById('quiz-feedback-box');
  const feedbackBadge = document.getElementById('feedback-badge');
  const feedbackExplanation = document.getElementById('feedback-explanation');
  const btnAction = document.getElementById('btn-quiz-action');

  let isCorrect = false;

  if (currentQ.type === 'D') {
    if (quizState.selectedMcqOption === null) {
      alert("Please select an option first!");
      return;
    }
    isCorrect = (quizState.selectedMcqOption === currentQ.correctIndex);
  } else {
    const inputEl = document.getElementById('quiz-numeric-input');
    const userStr = inputEl.value.trim();
    if (!userStr) {
      alert("Please enter your answer!");
      return;
    }

    const match = userStr.match(/^([+-]?[0-9]+(?:\.[0-9]+)?)\s*([a-zA-Z0-9²^]+)$/);
    if (!match) {
      alert("Please enter the number followed by the unit (e.g. '500 N', '25000 Pa', or '0.05 m²')!");
      return;
    }

    const userVal = parseFloat(match[1]);
    const userUnit = match[2].trim();
    const expectedUnit = currentQ.unit;

    let unitCorrect = false;
    if (expectedUnit === 'N') {
      unitCorrect = (userUnit === 'N' || userUnit === 'Newton' || userUnit === 'Newtons');
    } else if (expectedUnit === 'Pa') {
      unitCorrect = (userUnit === 'Pa' || userUnit === 'Pascal' || userUnit === 'Pascals');
    } else if (expectedUnit === 'm²') {
      unitCorrect = (userUnit === 'm²' || userUnit === 'm2' || userUnit === 'm^2' || userUnit === 'm' || userUnit === 'meter' || userUnit === 'meters' || userUnit === 'sqm');
    }

    let numCorrect = false;
    if (Math.abs(userVal - currentQ.exactVal) <= 0.2) {
      numCorrect = true;
    } else {
      for (let dp = 0; dp <= 4; dp++) {
        const expected = roundTo(currentQ.exactVal, dp);
        if (Math.abs(userVal - expected) <= 0.2) {
          numCorrect = true;
          break;
        }
      }
    }

    isCorrect = numCorrect && unitCorrect;

    if (!isCorrect) {
      if (numCorrect && !unitCorrect) {
        currentQ.unitFeedback = "Your calculated value is correct, but your unit was incorrect or missing. Remember to write 'N', 'Pa', or 'm²'!";
      } else if (!numCorrect && unitCorrect) {
        currentQ.unitFeedback = "Your unit is correct, but your calculation was incorrect.";
      } else {
        currentQ.unitFeedback = "Both your number and unit were incorrect.";
      }
    }
  }

  quizState.isChecked = true;
  feedbackBox.classList.remove('hidden');
  
  if (isCorrect) {
    quizState.score++;
    bodyPanel.classList.add('pop-correct');
    feedbackBox.className = "quiz-feedback-box feedback-correct";
    feedbackBadge.textContent = "Nailed it! ✓";
    feedbackExplanation.innerHTML = `<strong>Correct.</strong> <br/>${currentQ.explanation.replace(/\n/g, '<br/>')}`;
  } else {
    bodyPanel.classList.add('shake-wrong');
    feedbackBox.className = "quiz-feedback-box feedback-wrong";
    feedbackBadge.textContent = "Wrong! ↩";
    
    const correctStr = currentQ.type === 'D' 
      ? `Option ${String.fromCharCode(65 + currentQ.correctIndex)}` 
      : `${currentQ.correctVal} ${currentQ.unit}`;
      
    let explanationText = `<strong>Correct Answer: ${correctStr}</strong> <br/><br/>`;
    if (currentQ.unitFeedback) {
      explanationText += `<span style="color: #ff8533; font-weight: bold;">Feedback: ${currentQ.unitFeedback}</span><br/><br/>`;
    }
    explanationText += `<strong>Step-by-step working:</strong><br/>${currentQ.explanation.replace(/\n/g, '<br/>')}`;
    feedbackExplanation.innerHTML = explanationText;
  }

  if (currentQ.type === 'D') {
    document.querySelectorAll('.mcq-option').forEach((optBtn, idx) => {
      if (idx === currentQ.correctIndex) {
        optBtn.style.borderColor = 'var(--success-green)';
        optBtn.style.color = 'var(--success-green)';
        optBtn.style.backgroundColor = 'rgba(0, 230, 118, 0.08)';
      } else if (idx === quizState.selectedMcqOption) {
        optBtn.style.borderColor = 'var(--error-red)';
        optBtn.style.color = 'var(--error-red)';
        optBtn.style.backgroundColor = 'rgba(255, 23, 68, 0.08)';
      }
    });
  }

  if (quizState.currentIndex < 29) {
    btnAction.textContent = "NEXT QUESTION";
  } else {
    btnAction.textContent = "VIEW FINAL RESULTS";
  }
}

// ==========================================
// 4. FLASHCARD SYSTEM
// ==========================================

let activeCardDOM, questionTextDOM, answerTextDOM, counterDOM, reviewBadgeDOM;

function initFlashcards() {
  activeCardDOM = document.getElementById('active-card');
  questionTextDOM = document.getElementById('card-question-text');
  answerTextDOM = document.getElementById('card-answer-text');
  counterDOM = document.getElementById('flashcard-counter');
  reviewBadgeDOM = document.getElementById('review-badge');

  activeCardDOM.addEventListener('click', () => {
    cardState.isFlipped = !cardState.isFlipped;
    if (cardState.isFlipped) {
      activeCardDOM.classList.add('flipped');
    } else {
      activeCardDOM.classList.remove('flipped');
    }
  });

  document.getElementById('btn-card-gotit').addEventListener('click', (e) => {
    e.stopPropagation();
    handleCardAction(true);
  });

  document.getElementById('btn-card-review').addEventListener('click', (e) => {
    e.stopPropagation();
    handleCardAction(false);
  });

  resetDeck();
}

function resetDeck() {
  cardState.activeDeck = cardDeck.map(c => ({ ...c }));
  cardState.currentIndex = 0;
  cardState.isFlipped = false;
  activeCardDOM.classList.remove('flipped');
  renderCard();
}

function renderCard() {
  if (cardState.activeDeck.length === 0) {
    questionTextDOM.textContent = "All cards mastered! 🎉";
    answerTextDOM.textContent = "Click navigation to review or try the quiz.";
    counterDOM.textContent = "0 of 0";
    reviewBadgeDOM.textContent = "0";
    return;
  }

  if (cardState.currentIndex >= cardState.activeDeck.length) {
    cardState.currentIndex = 0;
  }

  const current = cardState.activeDeck[cardState.currentIndex];
  questionTextDOM.textContent = current.q;
  answerTextDOM.textContent = current.a;
  counterDOM.textContent = `${cardState.currentIndex + 1} of ${cardState.activeDeck.length}`;
  reviewBadgeDOM.textContent = cardState.activeDeck.length - (cardState.currentIndex + 1);
}

function handleCardAction(isGotIt) {
  if (cardState.activeDeck.length === 0) return;

  cardState.isFlipped = false;
  activeCardDOM.classList.remove('flipped');

  setTimeout(() => {
    if (isGotIt) {
      cardState.activeDeck.splice(cardState.currentIndex, 1);
    } else {
      const [card] = cardState.activeDeck.splice(cardState.currentIndex, 1);
      cardState.activeDeck.push(card);
    }
    renderCard();
  }, 150);
}

// ==========================================
// 5. COORDINATOR & TAB VIEW
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  const navItems = document.querySelectorAll('.nav-item');
  const screens = document.querySelectorAll('.screen');

  function showScreen(screenId) {
    screens.forEach(s => s.classList.remove('active'));
    navItems.forEach(n => n.classList.remove('active'));

    const activeScreen = document.getElementById(screenId);
    if (activeScreen) {
      activeScreen.classList.add('active');
    }

    const activeNav = document.querySelector(`[data-target="${screenId}"]`);
    if (activeNav) {
      activeNav.classList.add('active');
    }

    if (screenId === 'screen-quiz') {
      if (quizState.questions.length === 0) {
        startQuizSession();
      }
    } else if (screenId === 'screen-flashcards') {
      resetDeck();
    }
  }

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const targetScreen = e.currentTarget.getAttribute('data-target');
      showScreen(targetScreen);
    });
  });

  const btnQuizAction = document.getElementById('btn-quiz-action');
  btnQuizAction.addEventListener('click', () => {
    if (!quizState.isChecked) {
      checkAnswer();
    } else {
      if (quizState.currentIndex < 29) {
        quizState.currentIndex++;
        renderActiveQuestion();
      } else {
        showResults();
      }
    }
  });

  document.getElementById('btn-restart-quiz').addEventListener('click', () => {
    startQuizSession();
  });

  document.getElementById('btn-score-flashcards').addEventListener('click', () => {
    showScreen('screen-flashcards');
  });

  function startQuizSession() {
    generateQuiz();
    showScreen('screen-quiz');
    renderActiveQuestion();
  }

  function showResults() {
    showScreen('screen-score');
    
    const scorePoints = document.getElementById('score-points');
    scorePoints.textContent = `${quizState.score} / 30`;

    const ring = document.querySelector('.score-display-ring');
    const percent = Math.round((quizState.score / 30) * 100);
    ring.style.setProperty('--percent', `${percent}%`);

    const starContainer = document.getElementById('score-stars');
    const feedbackMsg = document.getElementById('score-feedback-msg');

    let starsHtml = '';
    let msg = '';

    if (quizState.score <= 14) {
      starsHtml = '<span class="star active">★</span><span class="star">★</span><span class="star">★</span>';
      msg = "Keep practising — go back to the hydraulic diagram and try again.";
    } else if (quizState.score <= 23) {
      starsHtml = '<span class="star active">★</span><span class="star active">★</span><span class="star">★</span>';
      msg = "Good effort! Review the questions you got wrong.";
    } else {
      starsHtml = '<span class="star active">★</span><span class="star active">★</span><span class="star active">★</span>';
      msg = "Excellent! You understand hydraulic systems.";
    }

    starContainer.innerHTML = starsHtml;
    feedbackMsg.textContent = msg;
  }

  initSimulation();
  initFlashcards();
});
