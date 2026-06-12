// Quiz state variables
export const quizState = {
  questions: [],
  currentIndex: 0,
  score: 0,
  isChecked: false,
  selectedMcqOption: null,
};

// MCQ bank
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
    options: [
      "Piston A",
      "Piston B",
      "Both produce equal force",
      "Neither produces force"
    ],
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
    options: [
      "F₂ = F₁",
      "F₂ = F₁ ÷ 10",
      "F₂ = F₁ × 10",
      "F₂ = F₁²"
    ],
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
    options: [
      "Newton (N)",
      "Joule (J)",
      "Pascal (Pa)",
      "Watt (W)"
    ],
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
    options: [
      "0.2 Pa",
      "5 Pa",
      "200 Pa",
      "500 Pa"
    ],
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

// Utility: helper to round numbers
function roundTo(num, decimals) {
  return parseFloat(num.toFixed(decimals));
}

// Generate randomized quiz set (30 questions)
export function generateQuiz() {
  quizState.questions = [];
  quizState.currentIndex = 0;
  quizState.score = 0;
  quizState.isChecked = false;
  quizState.selectedMcqOption = null;

  // We need:
  // 8 Type A (Calculate F2)
  // 7 Type B (Calculate F1)
  // 7 Type C (Calculate P)
  // 8 Type D (Conceptual MCQ)

  // Generate 8 Type A questions
  for (let i = 0; i < 8; i++) {
    const f1 = Math.floor(Math.random() * 19 + 2) * 10; // 20 to 200 N (multiples of 10)
    const a1 = roundTo(Math.random() * 0.018 + 0.002, 3); // 0.002 to 0.020 m^2
    let a2 = roundTo(Math.random() * 0.180 + 0.020, 3); // 0.020 to 0.200 m^2
    if (a2 <= a1) a2 = roundTo(a1 + 0.02, 3);

    const p = f1 / a1;
    const f2 = roundTo(p * a2, 1);

    quizState.questions.push({
      type: 'A',
      text: `A hydraulic press has an input piston of area A₁ = ${a1.toFixed(3)} m² and an output piston of area A₂ = ${a2.toFixed(3)} m². If an input force F₁ = ${f1} N is applied to the input piston, calculate the output force F₂ produced on the output piston.`,
      given: { f1, a1, a2 },
      correctVal: f2,
      unit: 'N',
      explanation: `1. Find the pressure transmitted through the fluid: \n   P = F₁ ÷ A₁ = ${f1} N ÷ ${a1.toFixed(3)} m² = ${p.toFixed(1)} Pa\n2. Use the pressure to find the output force:\n   F₂ = P × A₂ = ${p.toFixed(1)} Pa × ${a2.toFixed(3)} m² = ${f2.toFixed(1)} N.`
    });
  }

  // Generate 7 Type B questions
  for (let i = 0; i < 7; i++) {
    const f2 = Math.floor(Math.random() * 46 + 5) * 100; // 500 to 5000 N (multiples of 100)
    const a1 = roundTo(Math.random() * 0.008 + 0.002, 3); // 0.002 to 0.010 m^2
    const a2 = roundTo(Math.random() * 0.180 + 0.020, 3); // 0.020 to 0.200 m^2

    const p = f2 / a2;
    const f1 = roundTo(p * a1, 1);

    quizState.questions.push({
      type: 'B',
      text: `An output force F₂ = ${f2} N is required on a hydraulic lift's output piston (area A₂ = ${a2.toFixed(3)} m²). If the input piston has an area A₁ = ${a1.toFixed(3)} m², calculate the input force F₁ that must be applied.`,
      given: { f2, a1, a2 },
      correctVal: f1,
      unit: 'N',
      explanation: `1. Find the fluid pressure required by the output piston:\n   P = F₂ ÷ A₂ = ${f2} N ÷ ${a2.toFixed(3)} m² = ${p.toFixed(1)} Pa\n2. Calculate the corresponding input force:\n   F₁ = P × A₁ = ${p.toFixed(1)} Pa × ${a1.toFixed(3)} m² = ${f1.toFixed(1)} N.`
    });
  }

  // Generate 7 Type C questions
  for (let i = 0; i < 7; i++) {
    const f1 = Math.floor(Math.random() * 49 + 2) * 10; // 20 to 500 N (multiples of 10)
    const a1 = roundTo(Math.random() * 0.048 + 0.002, 3); // 0.002 to 0.050 m^2

    const p = roundTo(f1 / a1, 1);

    quizState.questions.push({
      type: 'C',
      text: `A physics student applies a force F₁ = ${f1} N to the input piston of area A₁ = ${a1.toFixed(3)} m² in an enclosed hydraulic cylinder. Calculate the fluid pressure P transmitted throughout the system.`,
      given: { f1, a1 },
      correctVal: p,
      unit: 'Pa',
      explanation: `Apply Pascal's Principle formula for fluid pressure:\nP = F₁ ÷ A₁\nP = ${f1} N ÷ ${a1.toFixed(3)} m² = ${p.toFixed(1)} Pa.`
    });
  }

  // Generate 8 Type D questions (Conceptual MCQ)
  // Shuffle the conceptual bank and take 8
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

  // Shuffle the final 30 questions
  quizState.questions.sort(() => Math.random() - 0.5);
}

// Render the active question to DOM
export function renderActiveQuestion() {
  quizState.isChecked = false;
  quizState.selectedMcqOption = null;

  const currentQ = quizState.questions[quizState.currentIndex];

  // DOM Elements
  const progressText = document.getElementById('quiz-progress-text');
  const progressFill = document.getElementById('quiz-progress-fill');
  const liveScore = document.getElementById('quiz-live-score');
  const questionText = document.getElementById('quiz-question-text');
  const interactionContainer = document.getElementById('quiz-interaction-container');
  const feedbackBox = document.getElementById('quiz-feedback-box');
  const btnAction = document.getElementById('btn-quiz-action');

  // Set top progress bar
  progressText.textContent = `Question ${quizState.currentIndex + 1} of 30`;
  progressFill.style.width = `${((quizState.currentIndex + 1) / 30) * 100}%`;
  liveScore.textContent = `Score: ${quizState.score}/${quizState.currentIndex}`;

  // Reset animations
  const bodyPanel = document.querySelector('.quiz-body-panel');
  bodyPanel.classList.remove('shake-wrong', 'pop-correct');
  feedbackBox.classList.add('hidden');

  // Set question statement
  questionText.textContent = currentQ.text;
  interactionContainer.innerHTML = ''; // clear previous inputs

  btnAction.textContent = "CHECK ANSWER";

  if (currentQ.type === 'D') {
    // Render MCQ
    currentQ.options.forEach((opt, idx) => {
      const optBtn = document.createElement('button');
      optBtn.className = 'mcq-option';
      optBtn.innerHTML = `<strong>${String.fromCharCode(65 + idx)}.</strong> ${opt}`;
      optBtn.addEventListener('click', () => {
        if (quizState.isChecked) return;
        
        // Clear selected classes
        document.querySelectorAll('.mcq-option').forEach(b => b.classList.remove('selected'));
        optBtn.classList.add('selected');
        quizState.selectedMcqOption = idx;
      });
      interactionContainer.appendChild(optBtn);
    });
  } else {
    // Render Numeric input
    const wrapper = document.createElement('div');
    wrapper.className = 'input-num-wrapper';

    const inputNum = document.createElement('input');
    inputNum.type = 'number';
    inputNum.step = '0.1';
    inputNum.placeholder = 'Enter value';
    inputNum.className = 'quiz-input-num';
    inputNum.id = 'quiz-numeric-input';

    const unit = document.createElement('span');
    unit.className = 'unit-label';
    unit.textContent = currentQ.unit;

    wrapper.appendChild(inputNum);
    wrapper.appendChild(unit);
    interactionContainer.appendChild(wrapper);

    // Auto-focus input
    setTimeout(() => inputNum.focus(), 100);
  }
}

// Grade the answer
export function checkAnswer() {
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
    const userVal = parseFloat(inputEl.value);
    if (isNaN(userVal)) {
      alert("Please enter a valid numeric value!");
      return;
    }
    // Accept standard floating precision buffer of 0.2
    const diff = Math.abs(userVal - currentQ.correctVal);
    isCorrect = (diff <= 0.2);
  }

  // Update status
  quizState.isChecked = true;

  // Apply visual indicators and styles
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
      
    feedbackExplanation.innerHTML = `<strong>Correct Answer: ${correctStr}</strong> <br/><br/><strong>Step-by-step working:</strong><br/>${currentQ.explanation.replace(/\n/g, '<br/>')}`;
  }

  // Style answers on check
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

  // Change action button
  if (quizState.currentIndex < 29) {
    btnAction.textContent = "NEXT QUESTION";
  } else {
    btnAction.textContent = "VIEW FINAL RESULTS";
  }
}
