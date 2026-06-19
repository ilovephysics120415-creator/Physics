// Wave Speed Equation JS App

document.addEventListener('DOMContentLoaded', () => {
  // Navigation and Tabs
  const tabs = document.querySelectorAll('.nav-tab');
  const sections = document.querySelectorAll('.app-section');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
        t.setAttribute('tabindex', '-1');
      });
      sections.forEach(s => s.classList.remove('active'));

      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      tab.setAttribute('tabindex', '0');
      const targetSec = document.getElementById(tab.getAttribute('aria-controls'));
      if (targetSec) {
        targetSec.classList.add('active');
        
        // Handle canvas resize on section activation
        if (targetSec.id === 'sec-intro') {
          resizeCanvas(introCanvas);
        } else if (targetSec.id === 'sec-sim') {
          resizeCanvas(simCanvas);
        }
      }
    });
  });

  // SECTION 1: CONCEPT INTRO WAVE CANVAS
  const introCanvas = document.getElementById('intro-wave-canvas');
  const introCtx = introCanvas.getContext('2d');
  
  // Wave state for intro
  let introWave = {
    frequency: 1.0,  // Hz
    wavelength: 2.0, // m (normalized range coordinates)
    speed: 2.0,      // m/s
    amplitude: 40,
    time: 0,
    highlight: 'v'   // 'v', 'f', 'l'
  };

  const introSymbols = document.querySelectorAll('#intro-formula .formula-symbol');
  const introCards = document.querySelectorAll('.symbol-details .symbol-card');

  introSymbols.forEach(symbol => {
    symbol.addEventListener('click', () => {
      introSymbols.forEach(s => s.classList.remove('active'));
      introCards.forEach(c => c.classList.remove('active'));

      symbol.classList.add('active');
      const dataSymbol = symbol.getAttribute('data-symbol');
      const targetCard = document.querySelector(`.symbol-card[data-symbol="${dataSymbol}"]`);
      if (targetCard) targetCard.classList.add('active');

      introWave.highlight = dataSymbol;
    });
  });

  // SECTION 2: INTERACTIVE EXPLORATION SIMULATOR
  const simCanvas = document.getElementById('sim-wave-canvas');
  const simCtx = simCanvas.getContext('2d');

  const sliderF = document.getElementById('sim-slider-f');
  const sliderL = document.getElementById('sim-slider-l');
  const valF = document.getElementById('sim-val-f');
  const valL = document.getElementById('sim-val-l');
  const valV = document.getElementById('sim-val-v');

  const tagRipple = document.getElementById('tag-ripple');
  const tagSoundAir = document.getElementById('tag-sound-air');
  const tagSoundWater = document.getElementById('tag-sound-water');

  let simWave = {
    frequency: parseFloat(sliderF.value),
    wavelength: parseFloat(sliderL.value),
    amplitude: 35,
    time: 0
  };

  function updateSimulator() {
    const f = parseFloat(sliderF.value);
    const l = parseFloat(sliderL.value);
    const v = f * l;

    simWave.frequency = f;
    simWave.wavelength = l;

    valF.textContent = `${f.toFixed(2)} Hz`;
    valL.textContent = `${l.toFixed(2)} m`;
    valV.textContent = v.toFixed(2);

    // Context highlights:
    // Ripples ~ 1-2 m/s
    // Sound in Air ~340 m/s
    // Sound in Water ~1500 m/s
    tagRipple.classList.remove('active');
    tagSoundAir.classList.remove('active');
    tagSoundWater.classList.remove('active');

    if (v >= 0.8 && v <= 2.2) {
      tagRipple.classList.add('active');
    } else if (v >= 330 && v <= 350) {
      tagSoundAir.classList.add('active');
    } else if (v >= 1450 && v <= 1550) {
      tagSoundWater.classList.add('active');
    }
  }

  sliderF.addEventListener('input', updateSimulator);
  sliderL.addEventListener('input', updateSimulator);

  // Resize canvas helper
  function resizeCanvas(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
  }

  window.addEventListener('resize', () => {
    resizeCanvas(introCanvas);
    resizeCanvas(simCanvas);
  });

  // Initialize Canvas Dimensions
  resizeCanvas(introCanvas);
  resizeCanvas(simCanvas);

  // Animation Loop for wave graphics
  let lastTime = 0;
  function animateWaves(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const delta = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    if (document.getElementById('sec-intro').classList.contains('active')) {
      drawIntroWave(delta);
    } else if (document.getElementById('sec-sim').classList.contains('active')) {
      drawSimWave(delta);
    }

    requestAnimationFrame(animateWaves);
  }

  // Draw Function for Section 1 (Concept Intro)
  let countTimer = 0;
  let cycleCounter = 0;
  function drawIntroWave(delta) {
    const ctx = introCtx;
    const canvas = introCanvas;
    const width = canvas.width;
    const height = canvas.height;
    const dpr = window.devicePixelRatio || 1;

    ctx.clearRect(0, 0, width, height);

    // Update time parameter for wave motion based on speed
    introWave.time += delta * introWave.speed * 2; 

    // Visual setup
    const centerY = height / 2;
    const points = [];
    
    // Scale spatial dimensions
    // Wavelength visual width on canvas is scaled
    const visualWavelength = (introWave.wavelength / 4) * width;
    const k = (2 * Math.PI) / visualWavelength; // wave number

    // Collect sine wave coordinates
    for (let x = 0; x < width; x++) {
      // y = A * sin(k*x - omega*t)
      const y = centerY + introWave.amplitude * dpr * Math.sin(k * x - introWave.time);
      points.push({ x, y });
    }

    // Draw grid/background guide
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1 * dpr;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();

    // Render Wave Line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 3 * dpr;
    ctx.beginPath();
    points.forEach((p, idx) => {
      if (idx === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();

    // HIGHLIGHTS
    if (introWave.highlight === 'v') {
      // Speed: Highlight tracking moving crest
      ctx.strokeStyle = 'var(--accent-color)';
      ctx.lineWidth = 5 * dpr;
      ctx.beginPath();
      points.forEach((p, idx) => {
        if (idx === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();

      // Draw horizontal speed vector arrows
      // A crest is at sin(k*x - time) = -1, which is k*x - time = -pi/2 => x = (time - pi/2)/k
      let speedMarkerX = ((introWave.time - Math.PI / 2) / k) % width;
      if (speedMarkerX < 0) speedMarkerX += width;
      const speedMarkerY = centerY - introWave.amplitude * dpr;

      ctx.fillStyle = 'var(--accent-color)';
      ctx.shadowBlur = 15;
      ctx.shadowColor = 'var(--accent-color)';
      
      ctx.beginPath();
      ctx.arc(speedMarkerX, speedMarkerY, 8 * dpr, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0; // Reset shadow
      
      // Speed arrow label
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${11 * dpr}px var(--font-mono)`;
      ctx.fillText('v (speed)', speedMarkerX - 25 * dpr, speedMarkerY - 15 * dpr);
    } 
    else if (introWave.highlight === 'l') {
      // Wavelength: Draw dimension bar showing one full wave λ
      const startX = width / 6;
      const endX = startX + visualWavelength;
      
      ctx.strokeStyle = 'var(--accent-color)';
      ctx.lineWidth = 2 * dpr;
      
      // Horizontal bar
      ctx.beginPath();
      ctx.moveTo(startX, centerY - 60 * dpr);
      ctx.lineTo(endX, centerY - 60 * dpr);
      // Left vertical tick
      ctx.moveTo(startX, centerY - 70 * dpr);
      ctx.lineTo(startX, centerY - 50 * dpr);
      // Right vertical tick
      ctx.moveTo(endX, centerY - 70 * dpr);
      ctx.lineTo(endX, centerY - 50 * dpr);
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.font = `bold ${12 * dpr}px var(--font-sans)`;
      ctx.fillText('λ (Wavelength = 1 full wave cycle)', startX + 10 * dpr, centerY - 68 * dpr);

      // Pulse color of wave portion representing that λ
      ctx.strokeStyle = 'var(--accent-color)';
      ctx.lineWidth = 5 * dpr;
      ctx.beginPath();
      for (let x = Math.round(startX); x <= Math.round(endX); x++) {
        if (x >= 0 && x < points.length) {
          if (x === Math.round(startX)) ctx.moveTo(points[x].x, points[x].y);
          else ctx.lineTo(points[x].x, points[x].y);
        }
      }
      ctx.stroke();
    } 
    else if (introWave.highlight === 'f') {
      // Frequency: Count waves passing a reference line
      const refX = width / 2;
      
      // Reference vertical line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1.5 * dpr;
      ctx.setLineDash([5 * dpr, 5 * dpr]);
      ctx.beginPath();
      ctx.moveTo(refX, 0);
      ctx.lineTo(refX, height);
      ctx.stroke();
      ctx.setLineDash([]); // Reset dash

      // Frequency ticker count logic
      countTimer += delta;
      if (countTimer >= 1.0) {
        cycleCounter++;
        countTimer = 0;
        
        // Trigger pulse on the symbol
        const symF = document.getElementById('symbol-f-lbl');
        symF.classList.add('pulse-animation');
        setTimeout(() => symF.classList.remove('pulse-animation'), 500);
      }

      // Live ticker info
      ctx.fillStyle = 'var(--accent-color)';
      ctx.font = `bold ${12 * dpr}px var(--font-mono)`;
      ctx.fillText(`Waves Counter: ${cycleCounter}`, refX + 10 * dpr, 30 * dpr);
      ctx.fillText('Reference Point', refX - 110 * dpr, height - 15 * dpr);

      // Flash point when wave crest crosses reference line
      const yAtRef = centerY + introWave.amplitude * dpr * Math.sin(k * refX - introWave.time);
      ctx.beginPath();
      ctx.arc(refX, yAtRef, 6 * dpr, 0, Math.PI * 2);
      ctx.fillStyle = 'var(--accent-color)';
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'var(--accent-color)';
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  // Draw Function for Section 2 (Simulator)
  function drawSimWave(delta) {
    const ctx = simCtx;
    const canvas = simCanvas;
    const width = canvas.width;
    const height = canvas.height;
    const dpr = window.devicePixelRatio || 1;

    ctx.clearRect(0, 0, width, height);

    // Wave calculations
    // Speed v = f * lambda. Let animation velocity scale with calculated v.
    const speed = simWave.frequency * simWave.wavelength;
    simWave.time += delta * speed * 2;

    const centerY = height / 2;
    const points = [];
    
    // Convert simulator parameters to appropriate visual scale
    const visualWavelength = (simWave.wavelength / 4) * width;
    const k = (2 * Math.PI) / visualWavelength;

    for (let x = 0; x < width; x++) {
      const y = centerY + simWave.amplitude * dpr * Math.sin(k * x - simWave.time);
      points.push({ x, y });
    }

    // Draw centerline guide
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1 * dpr;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();

    // Render Sim Wave
    ctx.strokeStyle = 'var(--accent-color)';
    ctx.shadowBlur = 8;
    ctx.shadowColor = 'var(--accent-glow)';
    ctx.lineWidth = 3 * dpr;
    ctx.beginPath();
    points.forEach((p, idx) => {
      if (idx === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();
    ctx.shadowBlur = 0; // Reset glow
  }

  // Start animation loop
  requestAnimationFrame(animateWaves);


  // SECTION 3: FLASHCARD REVISION SYSTEM
  const flashcardDeck = document.getElementById('flashcard');
  const btnPrev = document.getElementById('btn-prev-card');
  const btnNext = document.getElementById('btn-next-card');
  const btnShuffle = document.getElementById('btn-shuffle-cards');

  const cardQFront = document.getElementById('card-q-front');
  const cardQBack = document.getElementById('card-q-back');
  const cardExpBack = document.getElementById('card-exp-back');
  const cardIndexFront = document.getElementById('card-index-front');
  const cardIndexBack = document.getElementById('card-index-back');
  const cardPromptFront = document.getElementById('card-prompt-front');
  const cardPromptBack = document.getElementById('card-prompt-back');

  const defaultCards = [
    {
      prompt: "Formula",
      front: "Wave Speed (v)",
      back: "v = f &times; &lambda;",
      explanation: "Wave Speed = Frequency &times; Wavelength"
    },
    {
      prompt: "Rearrangement",
      front: "Frequency (f)",
      back: "f = v / &lambda;",
      explanation: "Frequency = Wave Speed &divide; Wavelength"
    },
    {
      prompt: "Rearrangement",
      front: "Wavelength (&lambda;)",
      back: "&lambda; = v / f",
      explanation: "Wavelength = Wave Speed &divide; Frequency"
    },
    {
      prompt: "Reference Value",
      front: "Speed of Sound in Air",
      back: "~340 m/s",
      explanation: "Standard speed used in air wave calculations."
    },
    {
      prompt: "Reference Value",
      front: "Speed of Light (Electromagnetic)",
      back: "3 &times; 10<sup>8</sup> m/s",
      explanation: "Speed of all EM waves in vacuum (radio, light, X-rays, etc.)."
    }
  ];

  let currentCardIndex = 0;
  let flashcardList = [...defaultCards];

  function showCard(idx) {
    flashcardDeck.classList.remove('flipped');
    const card = flashcardList[idx];

    // Wait for card flip animation to finish before replacing values
    setTimeout(() => {
      cardQFront.innerHTML = card.front;
      cardQBack.innerHTML = card.back;
      cardExpBack.innerHTML = card.explanation;
      cardPromptFront.textContent = card.prompt;
      cardPromptBack.textContent = `${card.prompt} Answer`;
      cardIndexFront.textContent = `Card ${idx + 1}/${flashcardList.length}`;
      cardIndexBack.textContent = `Card ${idx + 1}/${flashcardList.length}`;
    }, 150);

    btnPrev.disabled = idx === 0;
    btnNext.disabled = idx === flashcardList.length - 1;
  }

  // Flip gesture/tap
  flashcardDeck.addEventListener('click', () => {
    flashcardDeck.classList.toggle('flipped');
  });

  flashcardDeck.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      flashcardDeck.classList.toggle('flipped');
    }
  });

  btnPrev.addEventListener('click', () => {
    if (currentCardIndex > 0) {
      currentCardIndex--;
      showCard(currentCardIndex);
    }
  });

  btnNext.addEventListener('click', () => {
    if (currentCardIndex < flashcardList.length - 1) {
      currentCardIndex++;
      showCard(currentCardIndex);
    }
  });

  btnShuffle.addEventListener('click', () => {
    // Shuffle array using Fisher-Yates
    for (let i = flashcardList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [flashcardList[i], flashcardList[j]] = [flashcardList[j], flashcardList[i]];
    }
    currentCardIndex = 0;
    showCard(currentCardIndex);
  });

  // Swipe Gestures Support
  let touchStartX = 0;
  let touchEndX = 0;

  flashcardDeck.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });

  flashcardDeck.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });

  function handleSwipe() {
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) { // Threshold
      if (diff > 0 && currentCardIndex < flashcardList.length - 1) {
        currentCardIndex++;
        showCard(currentCardIndex);
      } else if (diff < 0 && currentCardIndex > 0) {
        currentCardIndex--;
        showCard(currentCardIndex);
      }
    }
  }

  // Show first card initially
  showCard(currentCardIndex);


  // SECTION 4: RANDOMISED QUIZ POOL
  const quizIntroPanel = document.getElementById('quiz-intro-panel');
  const quizQuestionPanel = document.getElementById('quiz-question-panel');
  const quizResultsPanel = document.getElementById('quiz-results-panel');

  const btnStartQuiz = document.getElementById('btn-start-quiz');
  const btnRetryQuiz = document.getElementById('btn-retry-quiz');
  const btnRevisitIntro = document.getElementById('btn-revisit-intro');
  const btnNextQuestion = document.getElementById('btn-next-question');

  const txtQuestion = document.getElementById('question-text');
  const listOptions = document.getElementById('options-list');
  const boxFeedback = document.getElementById('quiz-feedback-box');
  const txtFeedbackHeader = document.getElementById('feedback-header');
  const txtFeedbackWorking = document.getElementById('feedback-working');

  const progressText = document.getElementById('quiz-progress-text');
  const scoreLiveText = document.getElementById('quiz-score-live');
  const progressFill = document.getElementById('quiz-progress-fill');

  let activeQuizQuestions = [];
  let currentQuestionIndex = 0;
  let quizScore = 0;
  let hasAnswered = false;

  // Breakdown metrics
  let quizMetrics = {
    calculationTotal: 0,
    calculationCorrect: 0,
    conceptualTotal: 0,
    conceptualCorrect: 0
  };

  btnStartQuiz.addEventListener('click', startNewQuiz);
  btnRetryQuiz.addEventListener('click', startNewQuiz);
  btnRevisitIntro.addEventListener('click', () => {
    document.getElementById('tab-intro').click();
  });

  function startNewQuiz() {
    quizIntroPanel.style.display = 'none';
    quizResultsPanel.style.display = 'none';
    quizQuestionPanel.style.display = 'block';

    currentQuestionIndex = 0;
    quizScore = 0;
    
    // Reset breakdown
    quizMetrics = {
      calculationTotal: 0,
      calculationCorrect: 0,
      conceptualTotal: 0,
      conceptualCorrect: 0
    };

    activeQuizQuestions = generateQuizQuestions();
    showQuizQuestion(currentQuestionIndex);
  }

  // Question Generator Pool (Calculations dynamically randomized + conceptual MCQs)
  function generateQuizQuestions() {
    const questions = [];

    // Helper: shuffle options
    function shuffleOptions(opts) {
      for (let i = opts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [opts[i], opts[j]] = [opts[j], opts[i]];
      }
      return opts;
    }

    // --- TEMPLATE GENERATOR FOR CALCULATION QUESTIONS ---
    
    // Context 1: Sound in air (~340 m/s)
    // Dynamic variant 1: Ask for wavelength (l = v / f)
    const soundAirL = () => {
      const v = 340;
      const fOptions = [20, 50, 100, 200, 500, 1000, 2000];
      const f = fOptions[Math.floor(Math.random() * fOptions.length)];
      const correctVal = v / f;
      const questionText = `A sound wave travels through air at 340 m/s. If its frequency is ${f} Hz, calculate its wavelength.`;
      
      const optCorrect = `${correctVal.toFixed(3)} m`;
      const optWrong1 = `${(f / v).toFixed(3)} m`;
      const optWrong2 = `${(v * f).toFixed(0)} m`;
      const optWrong3 = `${(correctVal * 10).toFixed(3)} m`;

      return {
        type: 'calculation',
        text: questionText,
        options: shuffleOptions([
          { text: optCorrect, isCorrect: true },
          { text: optWrong1, isCorrect: false },
          { text: optWrong2, isCorrect: false },
          { text: optWrong3, isCorrect: false }
        ]),
        working: `Formula: <span>&lambda; = v / f</span><br>Substitution: &lambda; = 340 / ${f}<br>Calculation: &lambda; = <span>${correctVal.toFixed(3)} m</span>`
      };
    };

    // Dynamic variant 2: Ask for frequency (f = v / l)
    const soundAirF = () => {
      const v = 340;
      const lOptions = [0.17, 0.34, 0.5, 1.0, 2.0, 5.0, 10.0, 17.0];
      const l = lOptions[Math.floor(Math.random() * lOptions.length)];
      const correctVal = v / l;
      const questionText = `A loudspeaker emits a sound wave with a wavelength of ${l} m. Taking the speed of sound in air as 340 m/s, what is the frequency of the sound?`;

      const optCorrect = `${correctVal.toFixed(1)} Hz`;
      const optWrong1 = `${(l / v).toFixed(3)} Hz`;
      const optWrong2 = `${(v * l).toFixed(0)} Hz`;
      const optWrong3 = `${(correctVal / 2).toFixed(1)} Hz`;

      return {
        type: 'calculation',
        text: questionText,
        options: shuffleOptions([
          { text: optCorrect, isCorrect: true },
          { text: optWrong1, isCorrect: false },
          { text: optWrong2, isCorrect: false },
          { text: optWrong3, isCorrect: false }
        ]),
        working: `Formula: <span>f = v / &lambda;</span><br>Substitution: f = 340 / ${l}<br>Calculation: f = <span>${correctVal.toFixed(1)} Hz</span>`
      };
    };

    // Context 2: Sound in water (~1500 m/s)
    // Dynamic variant 3: Ask for wavelength (l = v / f)
    const soundWaterL = () => {
      const v = 1500;
      const fOptions = [300, 500, 750, 1000, 1500, 3000];
      const f = fOptions[Math.floor(Math.random() * fOptions.length)];
      const correctVal = v / f;
      const questionText = `An underwater sonar system sends a pulse of frequency ${f} Hz. If the speed of sound in water is 1500 m/s, find the wavelength.`;

      const optCorrect = `${correctVal.toFixed(2)} m`;
      const optWrong1 = `${(f / v).toFixed(4)} m`;
      const optWrong2 = `${(v * f).toLocaleString()} m`;
      const optWrong3 = `${(correctVal * 2.5).toFixed(2)} m`;

      return {
        type: 'calculation',
        text: questionText,
        options: shuffleOptions([
          { text: optCorrect, isCorrect: true },
          { text: optWrong1, isCorrect: false },
          { text: optWrong2, isCorrect: false },
          { text: optWrong3, isCorrect: false }
        ]),
        working: `Formula: <span>&lambda; = v / f</span><br>Substitution: &lambda; = 1500 / ${f}<br>Calculation: &lambda; = <span>${correctVal.toFixed(2)} m</span>`
      };
    };

    // Context 3: Water ripple or general wave
    // Dynamic variant 4: Ask for wave speed (v = f * l)
    const generalV = () => {
      const f = parseFloat((Math.random() * 9.5 + 0.5).toFixed(1)); // 0.5 - 10.0 Hz
      const l = parseFloat((Math.random() * 2.9 + 0.1).toFixed(2)); // 0.1 - 3.0 m
      const correctVal = f * l;
      const questionText = `Water waves of frequency ${f} Hz are seen traveling across a pond with a wavelength of ${l} m. Determine the speed of these waves.`;

      const optCorrect = `${correctVal.toFixed(2)} m/s`;
      const optWrong1 = `${(f / l).toFixed(2)} m/s`;
      const optWrong2 = `${(l / f).toFixed(2)} m/s`;
      const optWrong3 = `${(correctVal * 10).toFixed(2)} m/s`;

      return {
        type: 'calculation',
        text: questionText,
        options: shuffleOptions([
          { text: optCorrect, isCorrect: true },
          { text: optWrong1, isCorrect: false },
          { text: optWrong2, isCorrect: false },
          { text: optWrong3, isCorrect: false }
        ]),
        working: `Formula: <span>v = f &times; &lambda;</span><br>Substitution: v = ${f} &times; ${l}<br>Calculation: v = <span>${correctVal.toFixed(2)} m/s</span>`
      };
    };

    // Add calculation questions (drawing 5 randomized calculation questions)
    const calcPool = [soundAirL, soundAirF, soundWaterL, generalV];
    for (let i = 0; i < 5; i++) {
      const generator = calcPool[Math.floor(Math.random() * calcPool.length)];
      questions.push(generator());
    }

    // --- CONCEPTUAL MCQ QUESTIONS ---
    const conceptualPool = [
      {
        type: 'conceptual',
        text: "If the frequency of a wave doubles while the wavelength remains the same, what happens to the wave speed?",
        options: shuffleOptions([
          { text: "It doubles", isCorrect: true },
          { text: "It is halved", isCorrect: false },
          { text: "It remains constant", isCorrect: false },
          { text: "It quadruples", isCorrect: false }
        ]),
        working: "Using <span>v = f&lambda;</span>: Since speed $v$ is directly proportional to frequency $f$, doubling frequency while keeping wavelength $\lambda$ constant doubles the speed."
      },
      {
        type: 'conceptual',
        text: "A wave travels through a medium at a constant speed. If its wavelength is increased, what must happen to its frequency?",
        options: shuffleOptions([
          { text: "It decreases", isCorrect: true },
          { text: "It increases", isCorrect: false },
          { text: "It remains the same", isCorrect: false },
          { text: "It becomes zero", isCorrect: false }
        ]),
        working: "Rearranging formula: <span>f = v / &lambda;</span>. For a constant speed $v$, frequency is inversely proportional to wavelength. Increasing wavelength decreases the frequency."
      },
      {
        type: 'conceptual',
        text: "Match the wave variables: wave speed (v), frequency (f), and wavelength (&lambda;) to their correct standard SI units.",
        options: shuffleOptions([
          { text: "v (m/s), f (Hz), &lambda; (m)", isCorrect: true },
          { text: "v (m), f (Hz), &lambda; (m/s)", isCorrect: false },
          { text: "v (m/s), f (m), &lambda; (Hz)", isCorrect: false },
          { text: "v (Hz), f (m/s), &lambda; (m)", isCorrect: false }
        ]),
        working: "Standard SI Units:<br>Speed (v) = <span>m/s</span> (metres per second)<br>Frequency (f) = <span>Hz</span> (hertz)<br>Wavelength (&lambda;) = <span>m</span> (metres)."
      },
      {
        type: 'conceptual',
        text: "Which of the following is the correct rearrangement of v = f&lambda; to solve for frequency (f)?",
        options: shuffleOptions([
          { text: "f = v / &lambda;", isCorrect: true },
          { text: "f = v &times; &lambda;", isCorrect: false },
          { text: "f = &lambda; / v", isCorrect: false },
          { text: "f = v + &lambda;", isCorrect: false }
        ]),
        working: "To isolate $f$ in the wave equation: divide both sides of <span>v = f &times; &lambda;</span> by $\lambda$. This gives <span>f = v / &lambda;</span>."
      },
      {
        type: 'conceptual',
        text: "When a wave moves from shallow water to deep water, its speed increases. If the frequency of the source remains constant, what happens to the wavelength?",
        options: shuffleOptions([
          { text: "It increases", isCorrect: true },
          { text: "It decreases", isCorrect: false },
          { text: "It remains unchanged", isCorrect: false },
          { text: "It drops to zero", isCorrect: false }
        ]),
        working: "From <span>v = f&lambda;</span>: Since frequency $f$ remains constant, wavelength $\lambda$ is directly proportional to speed $v$. If speed increases, the wavelength must also increase."
      }
    ];

    // Pick 4 conceptual questions
    const shuffledConceptual = shuffleOptions([...conceptualPool]);
    for (let i = 0; i < 4; i++) {
      if (shuffledConceptual[i]) {
        questions.push(shuffledConceptual[i]);
      }
    }

    // Shuffle the final drawn list of 9 questions so calculation and conceptual are mixed
    return shuffleOptions(questions);
  }

  function showQuizQuestion(idx) {
    hasAnswered = false;
    boxFeedback.classList.remove('active');
    btnNextQuestion.style.display = 'none';

    const q = activeQuizQuestions[idx];

    // Update Progress UI
    progressText.textContent = `Question ${idx + 1} of ${activeQuizQuestions.length}`;
    scoreLiveText.textContent = `Score: ${quizScore}/${idx}`;
    progressFill.style.width = `${((idx) / activeQuizQuestions.length) * 100}%`;

    // Set Text
    txtQuestion.textContent = q.text;
    listOptions.innerHTML = '';

    // Render Options
    q.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.innerHTML = `
        <span>${opt.text}</span>
        <span class="option-feedback-icon" aria-hidden="true"></span>
      `;
      btn.addEventListener('click', () => handleOptionClick(btn, opt, q));
      listOptions.appendChild(btn);
    });
  }

  function handleOptionClick(selectedBtn, option, question) {
    if (hasAnswered) return;
    hasAnswered = true;

    // Track total metrics
    if (question.type === 'calculation') {
      quizMetrics.calculationTotal++;
    } else {
      quizMetrics.conceptualTotal++;
    }

    const allButtons = listOptions.querySelectorAll('.option-btn');
    
    // Check answer correctness
    if (option.isCorrect) {
      quizScore++;
      selectedBtn.classList.add('correct');
      selectedBtn.querySelector('.option-feedback-icon').textContent = '✓';
      
      // Live scoring update
      scoreLiveText.textContent = `Score: ${quizScore}/${currentQuestionIndex + 1}`;
      
      txtFeedbackHeader.textContent = 'Correct!';
      txtFeedbackHeader.style.color = 'var(--accent-color)';
      
      if (question.type === 'calculation') {
        quizMetrics.calculationCorrect++;
      } else {
        quizMetrics.conceptualCorrect++;
      }
    } else {
      selectedBtn.classList.add('incorrect');
      selectedBtn.querySelector('.option-feedback-icon').textContent = '✗';
      
      // Screen shake (colorblind feedback)
      quizQuestionPanel.classList.add('shake');
      setTimeout(() => quizQuestionPanel.classList.remove('shake'), 400);

      txtFeedbackHeader.textContent = 'Incorrect';
      txtFeedbackHeader.style.color = '#ff9900'; // Accessible high contrast color

      // Show correct answer with a visual indicator (checkmark/double-border)
      allButtons.forEach((btn, index) => {
        if (question.options[index].isCorrect) {
          btn.classList.add('correct');
          btn.querySelector('.option-feedback-icon').textContent = '✓';
        }
      });
    }

    // Disable all options
    allButtons.forEach(btn => btn.disabled = true);

    // Show working/explanation
    txtFeedbackWorking.innerHTML = question.working;
    boxFeedback.classList.add('active');
    btnNextQuestion.style.display = 'block';
  }

  btnNextQuestion.addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < activeQuizQuestions.length) {
      showQuizQuestion(currentQuestionIndex);
    } else {
      showQuizResults();
    }
  });

  function showQuizResults() {
    quizQuestionPanel.style.display = 'none';
    quizResultsPanel.style.display = 'block';

    const finalPercent = (quizScore / activeQuizQuestions.length) * 100;
    
    // Fill final progress bar
    progressFill.style.width = '100%';

    // Set Results UI
    document.getElementById('results-score').textContent = `${quizScore}/${activeQuizQuestions.length}`;

    const gradeMsg = document.getElementById('results-grade-message');
    
    if (finalPercent >= 80) {
      gradeMsg.innerHTML = 'Outstanding! You have a solid grasp of the Wave Speed Equation.';
      btnRevisitIntro.style.display = 'none';
      startConfetti();
    } else if (finalPercent >= 50) {
      gradeMsg.innerHTML = 'Good effort! You understand the basics, but review formula rearrangement for calculations.';
      btnRevisitIntro.style.display = 'none';
    } else {
      gradeMsg.innerHTML = 'Let\'s revisit the wave formulas and visual guides to strengthen your foundation.';
      btnRevisitIntro.style.display = 'block';
    }

    // Performance Breakdown Calculations
    const calcAcc = quizMetrics.calculationTotal > 0 
      ? Math.round((quizMetrics.calculationCorrect / quizMetrics.calculationTotal) * 100) 
      : 100;
    
    const conceptAcc = quizMetrics.conceptualTotal > 0 
      ? Math.round((quizMetrics.conceptualCorrect / quizMetrics.conceptualTotal) * 100) 
      : 100;

    document.getElementById('breakdown-calc').textContent = `${calcAcc}%`;
    document.getElementById('breakdown-concept').textContent = `${conceptAcc}%`;
  }

  // --- CONFETTI ENGINE (HTML5 CANVAS) ---
  const confettiCanvas = document.getElementById('confetti-canvas');
  const confettiCtx = confettiCanvas.getContext('2d');
  let confettiAnimationId = null;
  let particles = [];

  function startConfetti() {
    confettiCanvas.style.display = 'block';
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
    
    particles = [];
    // Spawn 100 particles
    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * confettiCanvas.width,
        y: Math.random() * confettiCanvas.height - confettiCanvas.height,
        r: Math.random() * 6 + 4,
        d: Math.random() * confettiCanvas.height,
        color: `hsl(${Math.random() * 360}, 80%, 60%)`,
        tilt: Math.random() * 10 - 5,
        tiltAngleIncremental: Math.random() * 0.07 + 0.02,
        tiltAngle: 0
      });
    }

    if (confettiAnimationId) cancelAnimationFrame(confettiAnimationId);
    drawConfetti();

    // Stop after 4 seconds
    setTimeout(() => {
      if (confettiAnimationId) cancelAnimationFrame(confettiAnimationId);
      confettiCanvas.style.display = 'none';
    }, 4000);
  }

  function drawConfetti() {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    
    particles.forEach((p, idx) => {
      p.tiltAngle += p.tiltAngleIncremental;
      p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
      p.x += Math.sin(p.tiltAngle);
      p.tilt = Math.sin(p.tiltAngle - idx / 3) * 15;

      confettiCtx.beginPath();
      confettiCtx.lineWidth = p.r;
      confettiCtx.strokeStyle = p.color;
      confettiCtx.moveTo(p.x + p.tilt + p.r / 2, p.y);
      confettiCtx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
      confettiCtx.stroke();
    });

    // Reset particles that fall off bottom
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (p.y > confettiCanvas.height) {
        particles[i] = {
          ...p,
          x: Math.random() * confettiCanvas.width,
          y: -20,
          tilt: Math.random() * 10 - 5
        };
      }
    }

    confettiAnimationId = requestAnimationFrame(drawConfetti);
  }
});
