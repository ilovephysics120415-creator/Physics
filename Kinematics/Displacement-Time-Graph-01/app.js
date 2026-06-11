// Application State
let appMode = 'combined'; // 'combined' or 'pure'
let activeBuilderMotion = 'rest';
let builderChart = null;
let quizChart = null;

// Quiz State
let quizScore = 0;
let quizAttempts = 0;
let currentQuizQuestion = null; // { shape, duration, initialPos, finalPos, acceptedAnswers, explanation }

// Section 3: Gradient Quiz State
let gradScore = 0;
let gradAttempts = 0;
let gradChart = null;
let currentGradQuestion = null; // { scenario, yStart, yEnd, tStart, tEnd, slope, hidden, correctAnswer, unit }

// Elements
const elBtnCombined = document.getElementById('btn-combined');
const elBtnPure = document.getElementById('btn-pure');
const elToggleSlider = document.getElementById('toggle-slider');
const elModeBanner = document.getElementById('mode-banner');
const elModeBannerText = document.getElementById('mode-banner-text');

// Builder Inputs
const elSlideDuration = document.getElementById('slide-duration');
const elSlideInitialPos = document.getElementById('slide-initial-pos');
const elSlideFinalPos = document.getElementById('slide-final-pos');
const elValDuration = document.getElementById('val-duration');
const elValInitialPos = document.getElementById('val-initial-pos');
const elValFinalPos = document.getElementById('val-final-pos');
const elLabelInitialPos = document.getElementById('label-initial-pos');
const elLabelFinalPos = document.getElementById('label-final-pos');

// Output Info
const elInfoMotionDetected = document.getElementById('info-motion-detected');
const elInfoSpeedLabel = document.getElementById('info-speed-label');
const elInfoSpeedValue = document.getElementById('info-speed-value');
const elFormulaReminder = document.getElementById('formula-reminder');
const elGraphMainTitle = document.getElementById('graph-main-title');

// Quiz Elements
const elBtnQuizMe = document.getElementById('btn-quiz-me');
const elQuizWorkspace = document.getElementById('quiz-workspace');
const elQuizPlaceholder = document.getElementById('quiz-placeholder');
const elQuizAnswer = document.getElementById('quiz-answer');
const elBtnSubmitAnswer = document.getElementById('btn-submit-answer');
const elBtnShowAnswer = document.getElementById('btn-show-answer');
const elBtnNextQuestion = document.getElementById('btn-next-question');
const elQuizFeedback = document.getElementById('quiz-feedback');
const elQuizFeedbackIcon = document.getElementById('quiz-feedback-icon');
const elQuizFeedbackTitle = document.getElementById('quiz-feedback-title');
const elQuizFeedbackBody = document.getElementById('quiz-feedback-body');
const elQuizScoreText = document.getElementById('quiz-score');

// Modal Elements
const elExplanationModal = document.getElementById('explanation-modal');
const elBtnOpenExplanation = document.getElementById('btn-open-explanation');
const elBtnCloseExplanation = document.getElementById('btn-close-explanation');
const elBtnCloseExplanationFooter = document.getElementById('btn-close-explanation-footer');
const elExpStep1Title = document.getElementById('exp-step-1-title');
const elExpStep1Body = document.getElementById('exp-step-1-body');
const elExpStep3Body = document.getElementById('exp-step-3-body');
const elExpStep4Summary = document.getElementById('exp-step-4-summary');

// Section 3: Gradient Quiz Elements
const elBtnGradQuizMe = document.getElementById('btn-grad-quiz-me');
const elGradWorkspace = document.getElementById('grad-workspace');
const elGradPlaceholderState = document.getElementById('grad-placeholder-state');
const elGradAnswerInput = document.getElementById('grad-answer-input');
const elBtnSubmitGrad = document.getElementById('btn-submit-grad');
const elBtnShowGrad = document.getElementById('btn-show-grad');
const elBtnNextGrad = document.getElementById('btn-next-grad');
const elGradFeedback = document.getElementById('grad-feedback');
const elGradFeedbackIcon = document.getElementById('grad-feedback-icon');
const elGradFeedbackTitle = document.getElementById('grad-feedback-title');
const elGradFeedbackBody = document.getElementById('grad-feedback-body');
const elGradScoreText = document.getElementById('grad-score');
const elBtnOpenGradExplanation = document.getElementById('btn-open-grad-explanation');
const elGradFormulaText = document.getElementById('grad-formula-text');
const elGradQuestionLabel = document.getElementById('grad-question-label');
const elGradPlaceholder = document.getElementById('grad-placeholder');
const elGradScenarioType = document.getElementById('grad-scenario-type');
const elGradPromptText = document.getElementById('grad-prompt-text');
const elGradInputLabel = document.getElementById('grad-input-label');
const elGradUnitLabel = document.getElementById('grad-unit-label');

// Gradient Modal Elements
const elGradModal = document.getElementById('gradient-modal');
const elBtnCloseGradModal = document.getElementById('btn-close-grad-modal');
const elBtnCloseGradModalFooter = document.getElementById('btn-close-grad-modal-footer');
const elGradModalStep1 = document.getElementById('grad-modal-step1');
const elGradModalStep2Title = document.getElementById('grad-modal-step2-title');
const elGradModalStep2Body = document.getElementById('grad-modal-step2-body');
const elGradModalStep3 = document.getElementById('grad-modal-step3');
const elGradModalStep4 = document.getElementById('grad-modal-step4');

// Define Motion buttons
const motionButtons = document.querySelectorAll('.motion-btn');

// Initialize App
window.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  updateModeUI();
  initBuilderChart();
  updateBuilder();
});

// Setup Events
function setupEventListeners() {
  // Motion Selector
  motionButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      motionButtons.forEach(b => b.classList.remove('active-motion'));
      btn.classList.add('active-motion');
      activeBuilderMotion = btn.dataset.motion;
      
      // Auto adjust final position slider based on selected motion
      adjustSlidersForMotion(activeBuilderMotion);
      updateBuilder();
    });
  });

  // Slider events
  elSlideDuration.addEventListener('input', (e) => {
    elValDuration.textContent = `${e.target.value} s`;
    updateBuilder();
  });

  elSlideInitialPos.addEventListener('input', (e) => {
    elValInitialPos.textContent = `${e.target.value} m`;
    // If At rest, sync final position
    if (activeBuilderMotion === 'rest') {
      elSlideFinalPos.value = e.target.value;
      elValFinalPos.textContent = `${e.target.value} m`;
    }
    updateBuilder();
  });

  elSlideFinalPos.addEventListener('input', (e) => {
    elValFinalPos.textContent = `${e.target.value} m`;
    // If At rest, sync initial position
    if (activeBuilderMotion === 'rest') {
      elSlideInitialPos.value = e.target.value;
      elValInitialPos.textContent = `${e.target.value} m`;
    }
    updateBuilder();
  });

  // Quiz events
  elBtnQuizMe.addEventListener('click', startQuiz);
  elBtnSubmitAnswer.addEventListener('click', checkQuizAnswer);
  elBtnShowAnswer.addEventListener('click', showQuizAnswer);
  elBtnNextQuestion.addEventListener('click', startQuiz);
  elQuizAnswer.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkQuizAnswer();
  });

  // Modal events
  elBtnOpenExplanation.addEventListener('click', openExplanationModal);
  elBtnCloseExplanation.addEventListener('click', closeExplanationModal);
  elBtnCloseExplanationFooter.addEventListener('click', closeExplanationModal);
  
  // Close modal when clicking outside
  elExplanationModal.addEventListener('click', (e) => {
    if (e.target === elExplanationModal) {
      closeExplanationModal();
    }
  });

  // Section 3: Gradient Quiz events
  elBtnGradQuizMe.addEventListener('click', startGradQuiz);
  elBtnSubmitGrad.addEventListener('click', checkGradAnswer);
  elBtnShowGrad.addEventListener('click', showGradAnswer);
  elBtnNextGrad.addEventListener('click', startGradQuiz);
  elBtnOpenGradExplanation.addEventListener('click', openGradSolutionModal);
  elBtnCloseGradModal.addEventListener('click', closeGradSolutionModal);
  elBtnCloseGradModalFooter.addEventListener('click', closeGradSolutionModal);
  
  elGradModal.addEventListener('click', (e) => {
    if (e.target === elGradModal) {
      closeGradSolutionModal();
    }
  });

  elGradAnswerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkGradAnswer();
  });
}

// Adjust Sliders based on motion type
function adjustSlidersForMotion(motion) {
  const initVal = parseInt(elSlideInitialPos.value);
  
  if (motion === 'rest') {
    elSlideFinalPos.value = initVal;
    elValFinalPos.textContent = `${initVal} m`;
  } else if (motion === 'uniform' || motion === 'non-uniform-acc') {
    // Needs positive slope
    if (parseInt(elSlideFinalPos.value) <= initVal) {
      const newVal = Math.min(200, initVal + 50);
      elSlideFinalPos.value = newVal;
      elValFinalPos.textContent = `${newVal} m`;
    }
  } else if (motion === 'non-uniform-dec') {
    // Decelerating - curve flattening. Let's make it end higher than start.
    if (parseInt(elSlideFinalPos.value) <= initVal) {
      const newVal = Math.min(200, initVal + 60);
      elSlideFinalPos.value = newVal;
      elValFinalPos.textContent = `${newVal} m`;
    }
  } else if (motion === 'backwards') {
    // Needs negative slope
    if (parseInt(elSlideFinalPos.value) >= initVal) {
      const newVal = appMode === 'pure' ? -20 : 0;
      elSlideFinalPos.value = newVal;
      elValFinalPos.textContent = `${newVal} m`;
    }
  }
}

// Mode Selector Trigger
function setSyllabusMode(mode) {
  if (appMode === mode) return;
  appMode = mode;
  updateModeUI();
  
  // Adjust position sliders boundaries for Pure Physics
  if (appMode === 'pure') {
    elSlideFinalPos.min = "-100";
    document.getElementById('btn-backwards-motion').classList.remove('hidden');
  } else {
    elSlideFinalPos.min = "0";
    if (parseInt(elSlideFinalPos.value) < 0) {
      elSlideFinalPos.value = "0";
      elValFinalPos.textContent = "0 m";
    }
    document.getElementById('btn-backwards-motion').classList.add('hidden');
    if (activeBuilderMotion === 'backwards') {
      // Switch back to rest or uniform
      activeBuilderMotion = 'uniform';
      motionButtons.forEach(b => {
        b.classList.remove('active-motion');
        if (b.dataset.motion === 'uniform') b.classList.add('active-motion');
      });
    }
  }
  
  adjustSlidersForMotion(activeBuilderMotion);
  updateBuilder();
  
  // If quiz is running, reset or adapt it
  if (currentQuizQuestion) {
    startQuiz();
  }
  if (currentGradQuestion) {
    startGradQuiz();
  }
}

// Update Mode Accent colors and labels
function updateModeUI() {
  const isPure = appMode === 'pure';
  
  // Update theme classes
  if (isPure) {
    document.body.classList.add('pure-physics-theme');
    elToggleSlider.style.transform = 'translateX(138px)';
    elToggleSlider.style.width = '112px';
    elToggleSlider.style.backgroundColor = '#00F2FE';
    document.documentElement.style.setProperty('--accent-color', '#00F2FE');
    document.documentElement.style.setProperty('--accent-color-rgb', '0, 242, 254');
    
    elBtnPure.classList.add('text-white');
    elBtnPure.classList.remove('text-gray-400');
    elBtnCombined.classList.remove('text-white');
    elBtnCombined.classList.add('text-gray-400');
    
    // Labels
    elLabelInitialPos.textContent = "Initial Displacement";
    elLabelFinalPos.textContent = "Final Displacement";
    elInfoSpeedLabel.textContent = "Avg. Velocity:";
    elFormulaReminder.textContent = "velocity = gradient of displacement-time graph";
    elGraphMainTitle.textContent = "Displacement-Time Graph";
    
    // Banner
    elModeBanner.className = "bg-[#00F2FE]/10 border border-[#00F2FE]/30 rounded-2xl p-4 text-center transition-all duration-300";
    elModeBannerText.className = "text-sm font-semibold tracking-wide uppercase text-[#00F2FE]";
    elModeBannerText.textContent = "Pure Physics Mode Active: Exploring Displacement-Time & Velocity (Allows negative values)";
  } else {
    document.body.classList.remove('pure-physics-theme');
    elToggleSlider.style.transform = 'translateX(0)';
    elToggleSlider.style.width = '130px';
    elToggleSlider.style.backgroundColor = '#F59E0B';
    document.documentElement.style.setProperty('--accent-color', '#F59E0B');
    document.documentElement.style.setProperty('--accent-color-rgb', '245, 158, 11');
    
    elBtnCombined.classList.add('text-white');
    elBtnCombined.classList.remove('text-gray-400');
    elBtnPure.classList.remove('text-white');
    elBtnPure.classList.add('text-gray-400');
    
    // Labels
    elLabelInitialPos.textContent = "Initial Distance";
    elLabelFinalPos.textContent = "Final Distance";
    elInfoSpeedLabel.textContent = "Avg. Speed:";
    elFormulaReminder.textContent = "speed = gradient of distance-time graph";
    elGraphMainTitle.textContent = "Distance-Time Graph";
    
    // Banner
    elModeBanner.className = "bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-center transition-all duration-300";
    elModeBannerText.className = "text-sm font-semibold tracking-wide uppercase text-amber-400";
    elModeBannerText.textContent = "Combined Science Mode Active: Exploring Distance-Time & Speed";
  }
}

// Generate data points for chart
function generateGraphData(motion, t, yStart, yEnd) {
  const points = [];
  const steps = 40;
  const dt = t / steps;
  
  for (let i = 0; i <= steps; i++) {
    const time = i * dt;
    let pos = 0;
    
    if (motion === 'rest') {
      pos = yStart;
    } else if (motion === 'uniform' || motion === 'backwards') {
      pos = yStart + (yEnd - yStart) * (time / t);
    } else if (motion === 'non-uniform-acc') {
      // Concave up: starts flat, gets steeper
      // y = yStart + (yEnd - yStart) * (time/t)^2
      pos = yStart + (yEnd - yStart) * Math.pow(time / t, 2);
    } else if (motion === 'non-uniform-dec') {
      // Concave down: starts steep, gets flatter
      // y = yStart + (yEnd - yStart) * (1 - (1 - time/t)^2)
      pos = yStart + (yEnd - yStart) * (1 - Math.pow(1 - (time / t), 2));
    }
    
    points.push({ x: time, y: pos });
  }
  return points;
}

// Initialize Builder Chart
function initBuilderChart() {
  const ctx = document.getElementById('builderChart').getContext('2d');
  
  builderChart = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [{
        label: 'Motion Curve',
        data: [],
        borderColor: '#8B5CF6',
        borderWidth: 3,
        pointRadius: 0,
        fill: false,
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true }
      },
      scales: {
        x: {
          type: 'linear',
          min: 0,
          position: appMode === 'pure' ? { y: 0 } : 'bottom',
          title: {
            display: true,
            text: 'Time t (s)',
            color: '#9ca3af',
            font: { family: 'Outfit', size: 12 }
          },
          grid: { color: 'rgba(75, 85, 99, 0.15)' },
          ticks: { color: '#9ca3af', font: { family: 'Fira Code' }, stepSize: 1 }
        },
        y: {
          type: 'linear',
          title: {
            display: true,
            text: appMode === 'pure' ? 'Displacement (m)' : 'Distance (m)',
            color: '#9ca3af',
            font: { family: 'Outfit', size: 12 }
          },
          grid: { color: 'rgba(75, 85, 99, 0.15)' },
          ticks: { color: '#9ca3af', font: { family: 'Fira Code' }, stepSize: 20 }
        }
      }
    }
  });
}

// Redraw / Update Builder Chart and Output Dashboard
function updateBuilder() {
  const t = parseFloat(elSlideDuration.value);
  const yStart = parseFloat(elSlideInitialPos.value);
  const yEnd = parseFloat(elSlideFinalPos.value);
  
  // Sync slider label values
  elValDuration.textContent = `${t} s`;
  elValInitialPos.textContent = `${yStart} m`;
  elValFinalPos.textContent = `${yEnd} m`;

  const datasetPoints = generateGraphData(activeBuilderMotion, t, yStart, yEnd);
  
  // Update Chart
  builderChart.data.datasets[0].data = datasetPoints;
  builderChart.options.scales.y.title.text = appMode === 'pure' ? 'Displacement (m)' : 'Distance (m)';
  
  builderChart.options.scales.x.min = 0;
  builderChart.options.scales.x.max = 20;
  builderChart.options.scales.x.ticks.stepSize = 1;
  if (appMode === 'pure') {
    builderChart.options.scales.x.position = { y: 0 };
    builderChart.options.scales.y.min = -100;
    builderChart.options.scales.y.max = 200;
    builderChart.options.scales.y.ticks.stepSize = 20;
  } else {
    builderChart.options.scales.x.position = 'bottom';
    builderChart.options.scales.y.min = 0;
    builderChart.options.scales.y.max = 200;
    builderChart.options.scales.y.ticks.stepSize = 10;
  }
  
  builderChart.update();

  // Update Output Dash
  let motionText = "At Rest";
  let velocityValue = 0;
  
  if (activeBuilderMotion === 'uniform') {
    motionText = appMode === 'pure' ? "Uniform Velocity" : "Uniform Speed";
    velocityValue = (yEnd - yStart) / t;
  } else if (activeBuilderMotion === 'non-uniform-acc') {
    motionText = appMode === 'pure' ? "Non-uniform Velocity (Accelerating)" : "Non-uniform Speed (Accelerating)";
    velocityValue = (yEnd - yStart) / t; // average
  } else if (activeBuilderMotion === 'non-uniform-dec') {
    motionText = appMode === 'pure' ? "Non-uniform Velocity (Decelerating)" : "Non-uniform Speed (Decelerating)";
    velocityValue = (yEnd - yStart) / t; // average
  } else if (activeBuilderMotion === 'backwards') {
    motionText = "Uniform Velocity (Moving Backwards)";
    velocityValue = (yEnd - yStart) / t;
  }
  
  elInfoMotionDetected.textContent = motionText;
  
  if (appMode === 'pure') {
    elInfoSpeedLabel.textContent = "Avg. Velocity:";
    elInfoSpeedValue.textContent = `${velocityValue >= 0 ? '+' : ''}${velocityValue.toFixed(2)} m/s`;
  } else {
    elInfoSpeedLabel.textContent = "Avg. Speed:";
    // Speed is scalar, so use absolute distance difference
    const avgSpeed = Math.abs(yEnd - yStart) / t;
    elInfoSpeedValue.textContent = `${avgSpeed.toFixed(2)} m/s`;
  }
}

// SECTION 2 — QUIZ SYSTEM

const QUIZ_SCENARIOS = {
  combined: [
    {
      shape: 'rest',
      title: 'At rest',
      generate: () => {
        const y = 20 + Math.floor(Math.random() * 10) * 10;
        return { yStart: y, yEnd: y, duration: 10 + Math.floor(Math.random() * 10) };
      },
      answers: ['at rest', 'stationary', 'not moving', 'stopped', 'zero speed'],
      explanation: 'Step 1: The gradient represents speed. Step 2: The gradient is flat/horizontal (zero slope). Step 3: Zero slope means zero speed. Step 4: The object is at rest.'
    },
    {
      shape: 'uniform-pos',
      title: 'Uniform speed',
      generate: () => {
        const yStart = Math.floor(Math.random() * 8) * 10;
        const yEnd = yStart + 60 + Math.floor(Math.random() * 8) * 10;
        return { yStart, yEnd, duration: 10 + Math.floor(Math.random() * 10) };
      },
      answers: ['uniform speed', 'constant speed', 'uniform velocity', 'constant velocity'],
      explanation: 'Step 1: The slope of a distance-time graph represents speed. Step 2: The graph is a straight line, which means the slope is constant. Step 3: Constant slope means constant speed. Step 4: The motion is uniform speed.'
    },
    {
      shape: 'acc',
      title: 'Accelerating',
      generate: () => {
        const yStart = Math.floor(Math.random() * 5) * 10;
        const yEnd = yStart + 80 + Math.floor(Math.random() * 8) * 10;
        return { yStart, yEnd, duration: 10 + Math.floor(Math.random() * 10) };
      },
      answers: ['non-uniform speed', 'increasing speed', 'accelerating', 'non-uniform velocity'],
      explanation: 'Step 1: Slope represents speed. Step 2: The line curve bends upwards, becoming steeper as time passes. Step 3: Increasing steepness means increasing speed. Step 4: The motion is accelerating (increasing speed).'
    },
    {
      shape: 'dec',
      title: 'Decelerating',
      generate: () => {
        const yStart = Math.floor(Math.random() * 5) * 10;
        const yEnd = yStart + 80 + Math.floor(Math.random() * 8) * 10;
        return { yStart, yEnd, duration: 10 + Math.floor(Math.random() * 10) };
      },
      answers: ['non-uniform speed', 'decelerating', 'slowing down', 'non-uniform velocity'],
      explanation: 'Step 1: Slope represents speed. Step 2: The curve flattens out, becoming less steep as time passes. Step 3: Decreasing steepness means decreasing speed. Step 4: The object is decelerating (slowing down).'
    }
  ],
  pure: [
    {
      shape: 'rest',
      title: 'At rest',
      generate: () => {
        const y = -40 + Math.floor(Math.random() * 16) * 10;
        return { yStart: y, yEnd: y, duration: 10 + Math.floor(Math.random() * 10) };
      },
      answers: ['at rest', 'stationary', 'not moving', 'stopped', 'zero velocity'],
      explanation: 'Step 1: The gradient of a displacement-time graph represents velocity. Step 2: The gradient is flat/horizontal (zero slope). Step 3: Zero slope means zero velocity. Step 4: The object is at rest.'
    },
    {
      shape: 'uniform-pos',
      title: 'Uniform velocity (moving forward)',
      generate: () => {
        const yStart = -50 + Math.floor(Math.random() * 8) * 10;
        const yEnd = yStart + 80 + Math.floor(Math.random() * 8) * 10;
        return { yStart, yEnd, duration: 10 + Math.floor(Math.random() * 10) };
      },
      answers: ['uniform speed', 'constant speed', 'uniform velocity', 'constant velocity', 'positive velocity'],
      explanation: 'Step 1: The slope represents velocity. Step 2: The graph is a straight line sloping upwards. Step 3: A constant positive slope means positive uniform velocity. Step 4: The motion is positive uniform velocity.'
    },
    {
      shape: 'uniform-neg',
      title: 'Uniform velocity (moving backwards)',
      generate: () => {
        const yStart = 80 + Math.floor(Math.random() * 8) * 10;
        const yEnd = yStart - 100 - Math.floor(Math.random() * 4) * 10; // Can cross x-axis
        return { yStart, yEnd, duration: 10 + Math.floor(Math.random() * 10) };
      },
      answers: ['uniform velocity', 'moving backwards', 'negative velocity', 'returning', 'constant velocity'],
      explanation: 'Step 1: The slope represents velocity. Step 2: The line is straight and slopes downwards. Step 3: A constant negative slope means negative uniform velocity. Step 4: The object is moving backwards with uniform velocity.'
    },
    {
      shape: 'acc',
      title: 'Accelerating',
      generate: () => {
        const yStart = -50 + Math.floor(Math.random() * 6) * 10;
        const yEnd = yStart + 100 + Math.floor(Math.random() * 5) * 10;
        return { yStart, yEnd, duration: 10 + Math.floor(Math.random() * 10) };
      },
      answers: ['non-uniform velocity', 'increasing speed', 'accelerating', 'non-uniform speed'],
      explanation: 'Step 1: Slope represents velocity. Step 2: The line curve bends upwards (steeper). Step 3: Increasing steepness means velocity is increasing. Step 4: The object is accelerating.'
    },
    {
      shape: 'dec',
      title: 'Decelerating',
      generate: () => {
        const yStart = -50 + Math.floor(Math.random() * 6) * 10;
        const yEnd = yStart + 100 + Math.floor(Math.random() * 5) * 10;
        return { yStart, yEnd, duration: 10 + Math.floor(Math.random() * 10) };
      },
      answers: ['non-uniform velocity', 'decelerating', 'slowing down', 'non-uniform speed'],
      explanation: 'Step 1: Slope represents velocity. Step 2: The line curve flattens out. Step 3: Decreasing steepness means velocity is decreasing. Step 4: The object is decelerating (slowing down).'
    }
  ]
};

// Start a new Quiz Question
function startQuiz() {
  elQuizPlaceholder.style.display = 'none';
  elQuizWorkspace.style.display = 'grid';
  elQuizAnswer.value = '';
  elQuizAnswer.disabled = false;
  elQuizAnswer.focus();
  elBtnSubmitAnswer.classList.remove('hidden');
  elBtnShowAnswer.classList.remove('hidden');
  elBtnNextQuestion.classList.add('hidden');
  
  elQuizFeedback.className = "rounded-xl p-4 border transition-all duration-300 hidden";
  elQuizWorkspace.classList.remove('flash-correct', 'flash-wrong');

  // Load scenarios based on active mode
  const list = QUIZ_SCENARIOS[appMode];
  const selectedScenario = list[Math.floor(Math.random() * list.length)];
  
  const parameters = selectedScenario.generate();
  
  currentQuizQuestion = {
    shape: selectedScenario.shape,
    duration: parameters.duration,
    initialPos: parameters.yStart,
    finalPos: parameters.yEnd,
    answers: selectedScenario.answers,
    explanation: selectedScenario.explanation
  };

  drawQuizChart();
}

// Draw Quiz Curve on Quiz canvas
function drawQuizChart() {
  let mappedShape = 'rest';
  if (currentQuizQuestion.shape === 'uniform-pos') mappedShape = 'uniform';
  if (currentQuizQuestion.shape === 'uniform-neg') mappedShape = 'backwards';
  if (currentQuizQuestion.shape === 'acc') mappedShape = 'non-uniform-acc';
  if (currentQuizQuestion.shape === 'dec') mappedShape = 'non-uniform-dec';

  const datasetPoints = generateGraphData(
    mappedShape, 
    currentQuizQuestion.duration, 
    currentQuizQuestion.initialPos, 
    currentQuizQuestion.finalPos
  );

  if (quizChart) {
    quizChart.destroy();
  }

  const ctx = document.getElementById('quizChart').getContext('2d');
  
  quizChart = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [{
        data: datasetPoints,
        borderColor: '#8B5CF6',
        borderWidth: 3,
        pointRadius: 0,
        fill: false,
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      },
      scales: {
        x: {
          type: 'linear',
          min: 0,
          max: 20,
          position: appMode === 'pure' ? { y: 0 } : 'bottom',
          title: {
            display: true,
            text: 'Time t (s)',
            color: '#9ca3af',
            font: { family: 'Outfit', size: 11 }
          },
          grid: { color: 'rgba(75, 85, 99, 0.15)' },
          ticks: { color: '#9ca3af', font: { family: 'Fira Code' }, stepSize: 1 }
        },
        y: {
          type: 'linear',
          title: {
            display: true,
            text: appMode === 'pure' ? 'Displacement (m)' : 'Distance (m)',
            color: '#9ca3af',
            font: { family: 'Outfit', size: 11 }
          },
          grid: { color: 'rgba(75, 85, 99, 0.15)' },
          ticks: { color: '#9ca3af', font: { family: 'Fira Code' }, stepSize: appMode === 'pure' ? 20 : 10 }
        }
      }
    }
  });
}

// Check Quiz Answer Fuzzy Matcher
function checkQuizAnswer() {
  const answer = elQuizAnswer.value.trim().toLowerCase();
  if (!answer) return;

  quizAttempts++;
  let isCorrect = false;

  // Perform a fuzzy match against accepted answers
  for (let accepted of currentQuizQuestion.answers) {
    // Exact or contains match to increase success rate for 16yo students
    if (answer === accepted || answer.includes(accepted) || accepted.includes(answer)) {
      isCorrect = true;
      break;
    }
  }

  // Double check basic keywords for safety
  if (!isCorrect) {
    if (currentQuizQuestion.shape === 'rest' && (answer.includes('rest') || answer.includes('station') || answer.includes('stop') || answer.includes('not mov'))) {
      isCorrect = true;
    } else if (currentQuizQuestion.shape === 'uniform-pos' && (answer.includes('uniform') || answer.includes('constant'))) {
      isCorrect = true;
    } else if (currentQuizQuestion.shape === 'uniform-neg' && (answer.includes('back') || answer.includes('return') || answer.includes('negative') || answer.includes('reverse'))) {
      isCorrect = true;
    } else if (currentQuizQuestion.shape === 'acc' && (answer.includes('accel') || answer.includes('increas'))) {
      isCorrect = true;
    } else if (currentQuizQuestion.shape === 'dec' && (answer.includes('decel') || answer.includes('slow') || answer.includes('decreas'))) {
      isCorrect = true;
    }
  }

  // Display Feedback
  elQuizWorkspace.classList.remove('flash-correct', 'flash-wrong');
  void elQuizWorkspace.offsetWidth; // Trigger reflow

  if (isCorrect) {
    quizScore++;
    elQuizWorkspace.classList.add('flash-correct');
    showFeedback(true, "Correct!", currentQuizQuestion.explanation);
  } else {
    elQuizWorkspace.classList.add('flash-wrong');
    let hint = "Hint: Look at the slope. Is it constant (straight line) or changing (curve)? Is the slope positive, negative or zero?";
    showFeedback(false, "Not Quite...", hint);
  }

  elQuizAnswer.disabled = true;
  elBtnSubmitAnswer.classList.add('hidden');
  elBtnShowAnswer.classList.add('hidden');
  elBtnNextQuestion.classList.remove('hidden');

  updateQuizScoreText();
}

function showFeedback(isCorrect, title, message) {
  elQuizFeedback.className = `rounded-xl p-4 border transition-all duration-300 block ${
    isCorrect ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400' : 'bg-red-950/20 border-red-500/30 text-red-400'
  }`;
  elQuizFeedbackIcon.innerHTML = isCorrect 
    ? `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`
    : `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`;
  elQuizFeedbackTitle.textContent = title;
  elQuizFeedbackBody.textContent = message;
}

function showQuizAnswer() {
  showFeedback(false, "Explanation:", currentQuizQuestion.explanation);
  elQuizAnswer.disabled = true;
  elBtnSubmitAnswer.classList.add('hidden');
  elBtnShowAnswer.classList.add('hidden');
  elBtnNextQuestion.classList.remove('hidden');
}

function updateQuizScoreText() {
  elQuizScoreText.textContent = `${quizScore} / ${quizAttempts}`;
}

// Explanation Modal logic
function openExplanationModal() {
  // Update step 1 context based on active mode
  if (appMode === 'pure') {
    elExpStep1Title.textContent = "What does the slope of a Displacement-Time graph represent?";
    elExpStep1Body.textContent = "On a Displacement-Time graph, the gradient/slope represents the velocity of the object (velocity = rate of change of displacement). Unlike speed, velocity has a direction, so a downward line indicates negative velocity.";
    elExpStep3Body.textContent = `• A zero slope means velocity is 0, so the object is at rest.
• A positive constant slope means the object is moving forward at a constant velocity.
• A curve bending upwards (steeper slope) means the velocity is increasing (accelerating).
• A curve bending downwards (flatter slope) means the velocity is decreasing (decelerating).
• A straight line sloping downwards means a negative uniform velocity (moving backwards).`;
  } else {
    elExpStep1Title.textContent = "What does the slope of a Distance-Time graph represent?";
    elExpStep1Body.textContent = "On a Distance-Time graph, the gradient/slope represents the speed of the object (speed = rate of change of distance). Distance is always positive and cannot decrease, so the line can never slope downwards.";
    elExpStep3Body.textContent = `• A zero slope means speed is 0, so the object is at rest.
• A positive constant slope means the object is moving forward at a constant speed.
• A curve bending upwards (steeper slope) means the speed is increasing (accelerating).
• A curve bending downwards (flatter slope) means the speed is decreasing (decelerating).`;
  }

  // Compile summary of current Builder state
  let currentSummary = "";
  if (activeBuilderMotion === 'rest') {
    currentSummary = `The current builder graph shows a horizontal flat line at position y = ${elSlideInitialPos.value} m. The gradient is zero. Therefore, the object is at rest (speed/velocity is 0 m/s).`;
  } else if (activeBuilderMotion === 'uniform') {
    const val = (parseInt(elSlideFinalPos.value) - parseInt(elSlideInitialPos.value)) / parseInt(elSlideDuration.value);
    currentSummary = `The current builder graph shows a straight line starting at position ${elSlideInitialPos.value} m and ending at ${elSlideFinalPos.value} m. The gradient is constant. Therefore, the object moves at a uniform ${appMode === 'pure' ? 'velocity' : 'speed'} of ${Math.abs(val).toFixed(2)} m/s.`;
  } else if (activeBuilderMotion === 'non-uniform-acc') {
    currentSummary = `The current builder graph is a curve bending upwards (concave up). The slope is becoming increasingly steep. Therefore, the object is accelerating (speed/velocity is increasing).`;
  } else if (activeBuilderMotion === 'non-uniform-dec') {
    currentSummary = `The current builder graph is a curve bending downwards (concave down). The slope is becoming flatter. Therefore, the object is decelerating (speed/velocity is decreasing).`;
  } else if (activeBuilderMotion === 'backwards') {
    const val = (parseInt(elSlideFinalPos.value) - parseInt(elSlideInitialPos.value)) / parseInt(elSlideDuration.value);
    currentSummary = `The current builder graph shows a straight line sloping downwards. The gradient is constant and negative. Therefore, the object is moving backwards with a negative constant velocity of ${val.toFixed(2)} m/s.`;
  }

  elExpStep4Summary.textContent = currentSummary;

  elExplanationModal.classList.remove('pointer-events-none');
  elExplanationModal.classList.remove('opacity-0');
  elExplanationModal.firstElementChild.classList.remove('scale-95');
}

function closeExplanationModal() {
  elExplanationModal.classList.add('pointer-events-none');
  elExplanationModal.classList.add('opacity-0');
  elExplanationModal.firstElementChild.classList.add('scale-95');
}

// ==========================================
// SECTION 3: GRADIENT CALCULATION QUIZ LOGIC
// ==========================================

function startGradQuiz() {
  elGradPlaceholderState.style.display = 'none';
  elGradWorkspace.style.display = 'grid';
  elGradAnswerInput.value = '';
  elGradAnswerInput.disabled = false;
  elGradAnswerInput.focus();
  
  elBtnSubmitGrad.classList.remove('hidden');
  elBtnShowGrad.classList.remove('hidden');
  elBtnNextGrad.classList.add('hidden');
  
  elGradFeedback.className = "rounded-xl p-4 border transition-all duration-300 hidden";
  elGradWorkspace.classList.remove('flash-correct', 'flash-wrong');

  // Randomize Scenario A or B
  const scenario = Math.random() < 0.5 ? 'A' : 'B';
  
  // Choose friendly values
  const dtOptions = [5, 10, 20];
  const dt = dtOptions[Math.floor(Math.random() * dtOptions.length)];
  const t1 = 0;
  const t2 = dt;
  
  const slopeOptions = [2, 3, 4, 5, 8, 10];
  let slope = slopeOptions[Math.floor(Math.random() * slopeOptions.length)];
  
  // 30% chance of negative slope in pure physics
  if (appMode === 'pure' && Math.random() < 0.3) {
    slope = -slope;
  }
  
  const dy = slope * dt;
  let y1 = 0;
  if (appMode === 'pure') {
    // start at a reasonable coordinate between -40 and 40
    y1 = -40 + Math.floor(Math.random() * 9) * 10;
  } else {
    // combined science starts at 0 to 40
    y1 = Math.floor(Math.random() * 5) * 10;
  }
  const y2 = y1 + dy;

  // Double check boundaries to keep the line clean on the y-axis
  if (y2 < -80 || y2 > 180) {
    // retry simple fallback
    startGradQuiz();
    return;
  }

  const isPure = appMode === 'pure';
  const labelText = isPure ? 'velocity' : 'speed';
  
  let correctAnswer = 0;
  let unit = '';
  let promptText = '';

  if (scenario === 'A') {
    // Scenario A: Find Speed/Velocity
    correctAnswer = slope;
    unit = 'm/s';
    
    promptText = isPure
      ? `A straight-line displacement-time graph starts at displacement ${y1} m at t = 0 s, and ends at displacement ${y2} m at t = ${t2} s. Calculate the velocity (gradient) of the object.`
      : `A straight-line distance-time graph starts at distance ${y1} m at t = 0 s, and ends at distance ${y2} m at t = ${t2} s. Calculate the speed (gradient) of the object.`;
      
    elGradQuestionLabel.textContent = isPure ? "Hidden Velocity (v)" : "Hidden Speed (s)";
    elGradPlaceholder.textContent = "??.?";
    elGradUnitLabel.textContent = "m/s";
    elGradInputLabel.textContent = isPure ? "Enter calculated velocity (m/s):" : "Enter calculated speed (m/s):";
  } else {
    // Scenario B: Find Time
    correctAnswer = t2;
    unit = 's';
    
    promptText = isPure
      ? `An object moves with a constant velocity of ${slope} m/s. It starts at displacement ${y1} m at t = 0 s and reaches displacement ${y2} m at time t₂. Find the value of time t₂.`
      : `An object moves with a constant speed of ${Math.abs(slope)} m/s. It starts at distance ${y1} m at t = 0 s and reaches distance ${y2} m at time t₂. Find the value of time t₂.`;
      
    elGradQuestionLabel.textContent = "Hidden Time (t₂)";
    elGradPlaceholder.textContent = "??.?";
    elGradUnitLabel.textContent = "s";
    elGradInputLabel.textContent = "Enter calculated time value t₂ (s):";
  }

  currentGradQuestion = {
    scenario,
    yStart: y1,
    yEnd: y2,
    tStart: t1,
    tEnd: t2,
    slope: slope,
    correctAnswer: correctAnswer,
    unit: unit,
    promptText: promptText
  };

  // Configure formula reminder text
  if (isPure) {
    elGradFormulaText.textContent = "velocity = gradient = change in displacement / change in time";
  } else {
    elGradFormulaText.textContent = "speed = gradient = change in distance / change in time";
  }

  elGradScenarioType.textContent = `Scenario ${scenario}`;
  elGradPromptText.textContent = promptText;

  drawGradChart();
}

function drawGradChart() {
  const points = [
    { x: currentGradQuestion.tStart, y: currentGradQuestion.yStart },
    { x: currentGradQuestion.tEnd, y: currentGradQuestion.yEnd }
  ];

  if (gradChart) {
    gradChart.destroy();
  }

  const ctx = document.getElementById('gradChart').getContext('2d');
  
  const xPosition = appMode === 'pure' ? { y: 0 } : 'bottom';
  const yMin = appMode === 'pure' ? -100 : 0;
  const yMax = 200;
  const yStep = appMode === 'pure' ? 20 : 10;

  const showXTicks = currentGradQuestion.scenario !== 'B' || currentGradQuestion.answered;
  const showYTicks = currentGradQuestion.scenario !== 'A' || currentGradQuestion.answered;

  gradChart = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [{
        label: 'Motion Segment',
        data: points,
        borderColor: '#8B5CF6',
        borderWidth: 3,
        pointRadius: 6,
        pointBackgroundColor: '#00F2FE',
        pointBorderColor: '#8B5CF6',
        pointBorderWidth: 2,
        fill: false,
        tension: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          callbacks: {
            label: (context) => {
              return `Time: ${context.parsed.x} s, ${appMode === 'pure' ? 'Displacement' : 'Distance'}: ${context.parsed.y} m`;
            }
          }
        }
      },
      scales: {
        x: {
          type: 'linear',
          min: 0,
          max: 20,
          position: xPosition,
          grid: { color: 'rgba(75, 85, 99, 0.15)' },
          ticks: { color: '#9ca3af', font: { family: 'Fira Code' }, stepSize: 1, display: showXTicks }
        },
        y: {
          type: 'linear',
          min: yMin,
          max: yMax,
          grid: { color: 'rgba(75, 85, 99, 0.15)' },
          ticks: { color: '#9ca3af', font: { family: 'Fira Code' }, stepSize: yStep, display: showYTicks }
        }
      }
    }
  });
}

function checkGradAnswer() {
  const userAnsRaw = elGradAnswerInput.value.trim();
  if (!userAnsRaw) return;
  
  const userAns = parseFloat(userAnsRaw);
  gradAttempts++;
  
  let isCorrect = Math.abs(userAns - currentGradQuestion.correctAnswer) < 0.05;
  
  elGradWorkspace.classList.remove('flash-correct', 'flash-wrong');
  void elGradWorkspace.offsetWidth; // force reflow
  
  if (isCorrect) {
    gradScore++;
    elGradWorkspace.classList.add('flash-correct');
    showGradFeedback(true, "Correct Answer!", `Excellent calculations! The exact mathematical answer is ${currentGradQuestion.correctAnswer} ${currentGradQuestion.unit}.`);
    
    // Reveal value in placeholder
    elGradPlaceholder.textContent = `${currentGradQuestion.correctAnswer.toFixed(1)}`;
    elGradPlaceholder.className = "bg-emerald-500/10 border-emerald-500/50 text-emerald-400 px-3 py-1.5 rounded-lg font-mono text-base font-bold tracking-wider leading-none";
  } else {
    elGradWorkspace.classList.add('flash-wrong');
    showGradFeedback(false, "Incorrect", `Hint: Click the eye icon next to the question placeholder to check the step-by-step worked solution!`);
  }
  
  elGradAnswerInput.disabled = true;
  elBtnSubmitGrad.classList.add('hidden');
  elBtnShowGrad.classList.add('hidden');
  elBtnNextGrad.classList.remove('hidden');
  
  currentGradQuestion.answered = true;
  drawGradChart();
  
  updateGradScoreText();
}

function showGradFeedback(isCorrect, title, message) {
  elGradFeedback.className = `rounded-xl p-4 border transition-all duration-300 block ${
    isCorrect ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400' : 'bg-red-950/20 border-red-500/30 text-red-400'
  }`;
  elGradFeedbackIcon.innerHTML = isCorrect 
    ? `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`
    : `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`;
  elGradFeedbackTitle.textContent = title;
  elGradFeedbackBody.textContent = message;
}

function showGradAnswer() {
  showGradFeedback(false, "Correct Answer:", `The value is ${currentGradQuestion.correctAnswer.toFixed(1)} ${currentGradQuestion.unit}.`);
  elGradPlaceholder.textContent = `${currentGradQuestion.correctAnswer.toFixed(1)}`;
  elGradPlaceholder.className = "bg-amber-500/10 border-amber-500/50 text-amber-400 px-3 py-1.5 rounded-lg font-mono text-base font-bold tracking-wider leading-none";
  
  elGradAnswerInput.disabled = true;
  elBtnSubmitGrad.classList.add('hidden');
  elBtnShowGrad.classList.add('hidden');
  elBtnNextGrad.classList.remove('hidden');

  currentGradQuestion.answered = true;
  drawGradChart();
}

function updateGradScoreText() {
  elGradScoreText.textContent = `${gradScore} / ${gradAttempts}`;
}

function openGradSolutionModal() {
  if (!currentGradQuestion) return;

  const isPure = appMode === 'pure';
  const scenario = currentGradQuestion.scenario;
  
  const yStart = currentGradQuestion.yStart;
  const yEnd = currentGradQuestion.yEnd;
  const tStart = currentGradQuestion.tStart;
  const tEnd = currentGradQuestion.tEnd;
  const slope = currentGradQuestion.slope;
  
  const dy = yEnd - yStart;
  const dt = tEnd - tStart;

  if (!isPure) {
    // COMBINED SCIENCE
    if (scenario === 'A') {
      // Find speed
      elGradModalStep1.textContent = "speed = gradient = change in distance / change in time";
      
      elGradModalStep2Title.textContent = "Step 2: Read values from graph";
      elGradModalStep2Body.innerHTML = `• Change in distance (y₂ - y₁) = ${yEnd} - ${yStart} = <b>${dy} m</b><br>• Change in time (t₂ - t₁) = ${tEnd} - ${tStart} = <b>${dt} s</b>`;
      
      elGradModalStep3.textContent = `speed = ${dy} / ${dt}`;
      elGradModalStep4.textContent = `speed = ${slope.toFixed(1)} m/s`;
    } else {
      // Find time
      elGradModalStep1.textContent = "speed = change in distance / change in time";
      
      elGradModalStep2Title.textContent = "Step 2: Rearrange formula for time";
      elGradModalStep2Body.innerHTML = `• Speed = ${Math.abs(slope)} m/s<br>• Change in distance = ${yEnd} - ${yStart} = <b>${dy} m</b><br>• Rearranged: <b>change in time = change in distance / speed</b>`;
      
      elGradModalStep3.textContent = `change in time = ${dy} / ${Math.abs(slope)}`;
      elGradModalStep4.textContent = `change in time = ${dt.toFixed(1)} s`;
    }
  } else {
    // PURE PHYSICS
    if (scenario === 'A') {
      // Find velocity
      elGradModalStep1.textContent = "velocity = gradient = change in displacement / change in time";
      
      elGradModalStep2Title.textContent = "Step 2: Read values from graph";
      elGradModalStep2Body.innerHTML = `• Change in displacement (y₂ - y₁) = ${yEnd} - (${yStart}) = <b>${dy} m</b><br>• Change in time (t₂ - t₁) = ${tEnd} - ${tStart} = <b>${dt} s</b>`;
      
      elGradModalStep3.textContent = `velocity = ${dy} / ${dt}`;
      elGradModalStep4.textContent = `velocity = ${slope.toFixed(1)} m/s`;
    } else {
      // Find time
      elGradModalStep1.textContent = "velocity = change in displacement / change in time";
      
      elGradModalStep2Title.textContent = "Step 2: Rearrange formula for time";
      elGradModalStep2Body.innerHTML = `• Velocity = ${slope} m/s<br>• Change in displacement = ${yEnd} - (${yStart}) = <b>${dy} m</b><br>• Rearranged: <b>change in time = change in displacement / velocity</b>`;
      
      elGradModalStep3.textContent = `change in time = ${dy} / ${slope}`;
      elGradModalStep4.textContent = `change in time = ${dt.toFixed(1)} s`;
    }
  }

  elGradModal.classList.remove('pointer-events-none');
  elGradModal.classList.remove('opacity-0');
  elGradModal.firstElementChild.classList.remove('scale-95');
}

function closeGradSolutionModal() {
  elGradModal.classList.add('pointer-events-none');
  elGradModal.classList.add('opacity-0');
  elGradModal.firstElementChild.classList.add('scale-95');
}
