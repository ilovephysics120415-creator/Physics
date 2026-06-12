// O-Level Physics: Energy Stores App

const TEXTS = {
  EK: "energy in the kinetic store",
  EP: "energy in the gravitational potential store",
  G: "gravitational field strength (g = 10 N/kg)",
};

document.addEventListener("DOMContentLoaded", () => {
  // Navigation
  const navButtons = document.querySelectorAll(".nav-btn");
  const sections = document.querySelectorAll("main > section");
  
  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      
      // Update nav class
      navButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      // Update section display
      sections.forEach(s => {
        if (s.id === targetId) {
          s.classList.add("active");
        } else {
          s.classList.remove("active");
        }
      });

      // Resize canvas on switch
      if (targetId === "sim-section") {
        resizeBegCanvas();
      }
    });
  });

  // Global State
  const state = {
    currentQuizQuestionIndex: 0,
    quizScore: 0,
    activeQuizQuestions: [],
    selectedOptionIndex: null,
    answeredQuestions: [],
    flashcards: [],
    currentFlashcardIndex: 0,
    reviewedCardIds: new Set(),
    
    // Beginner simulation
    begPlaying: false,
    begTime: 0,
    begParams: {
      mass: 10,
      height: 10
    }
  };

  // --- SIMULATION (SLOPE + HORIZONTAL ROLL-AWAY) ---
  const begCanvas = document.getElementById("simCanvas");
  const begCtx = begCanvas.getContext("2d");
  
  const slideMass = document.getElementById("slideMass");
  const slideHeight = document.getElementById("slideHeight");
  const valMass = document.getElementById("valMass");
  const valHeight = document.getElementById("valHeight");
  const readoutEp = document.getElementById("readoutEp");
  const readoutEk = document.getElementById("readoutEk");
  
  const btnPlay = document.getElementById("btnSimPlay");
  const btnReset = document.getElementById("btnSimReset");

  function resizeBegCanvas() {
    const rect = begCanvas.parentElement.getBoundingClientRect();
    begCanvas.width = rect.width;
    begCanvas.height = rect.height;
    drawBegSimulation();
  }
  window.addEventListener("resize", resizeBegCanvas);

  function updateBegParams() {
    state.begParams.mass = parseFloat(slideMass.value);
    state.begParams.height = parseFloat(slideHeight.value);

    valMass.textContent = `${state.begParams.mass} kg`;
    valHeight.textContent = `${state.begParams.height} m`;

    const ep = state.begParams.mass * 10 * state.begParams.height;
    readoutEp.textContent = `${Math.round(ep)} J`;
    readoutEk.textContent = `0 J`; // initial Ek is 0 at the top

    if (!state.begPlaying) {
      drawBegSimulation();
    }
  }

  [slideMass, slideHeight].forEach(slider => {
    slider.addEventListener("input", updateBegParams);
  });

  btnPlay.addEventListener("click", () => {
    if (state.begPlaying) {
      state.begPlaying = false;
      btnPlay.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        <span>Play</span>
      `;
    } else {
      state.begPlaying = true;
      if (state.begTime >= 2.0) {
        state.begTime = 0;
      }
      btnPlay.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
        <span>Pause</span>
      `;
      animateBegSim();
    }
  });

  btnReset.addEventListener("click", () => {
    state.begPlaying = false;
    state.begTime = 0;
    btnPlay.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
      <span>Play</span>
    `;
    updateBegParams();
  });

  function animateBegSim() {
    if (!state.begPlaying) return;

    state.begTime += 0.012; // Time increment
    if (state.begTime > 2.0) {
      state.begPlaying = false;
      state.begTime = 2.0;
      btnPlay.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        <span>Play</span>
      `;
    }

    drawBegSimulation();

    if (state.begPlaying) {
      requestAnimationFrame(animateBegSim);
    }
  }

  function drawBegSimulation() {
    begCtx.clearRect(0, 0, begCanvas.width, begCanvas.height);
    drawGrid(begCtx, begCanvas.width, begCanvas.height);

    const padLeft = 60;
    const padRight = 60;
    const groundY = begCanvas.height - 70;
    const simHeightRatio = state.begParams.height / 20;

    const startX = padLeft;
    const startY = groundY - (180 * simHeightRatio);
    const endX = begCanvas.width - padRight;
    const endY = groundY;

    // Draw Ramp
    begCtx.strokeStyle = "#242936";
    begCtx.lineWidth = 4;
    begCtx.beginPath();
    begCtx.moveTo(startX, startY);
    begCtx.lineTo(endX, endY);
    begCtx.stroke();

    // Ground Line
    begCtx.beginPath();
    begCtx.moveTo(0, groundY);
    begCtx.lineTo(begCanvas.width, groundY);
    begCtx.stroke();

    let objX = 0;
    let objY = 0;
    let epNow = 0;
    let ekNow = 0;

    if (state.begTime <= 1.0) {
      // Accelerating motion along the ramp: d = t^2
      const t = state.begTime;
      const tPrime = Math.pow(t, 2);
      
      objX = startX + (endX - startX) * tPrime;
      objY = startY + (endY - startY) * tPrime;

      // Calculations based on current height
      const currentHeight = state.begParams.height * (1 - tPrime);
      epNow = state.begParams.mass * 10 * currentHeight;
      const epInitial = state.begParams.mass * 10 * state.begParams.height;
      ekNow = epInitial - epNow; // Conservation of energy
    } else {
      // Roll away horizontally: constant speed (final speed is 2 * dx/dt at t=1, i.e. 2 * slope length)
      const tFlat = state.begTime - 1.0;
      objX = endX + 2 * (endX - startX) * tFlat;
      objY = groundY;

      epNow = 0;
      ekNow = state.begParams.mass * 10 * state.begParams.height;
    }

    // Draw sliding ball
    begCtx.fillStyle = "rgba(0, 255, 102, 0.15)";
    begCtx.strokeStyle = "#00ff66";
    begCtx.lineWidth = 2.5;
    begCtx.beginPath();
    begCtx.arc(objX, objY - 12, 12, 0, Math.PI * 2);
    begCtx.fill();
    begCtx.stroke();

    readoutEp.textContent = `${Math.round(epNow)} J`;
    readoutEk.textContent = `${Math.round(ekNow)} J`;

    drawEnergyBars(begCtx, epNow, ekNow);
  }

  // --- DRAW UTILITIES ---
  function drawGrid(ctxTarget, w, h) {
    ctxTarget.strokeStyle = "#161821";
    ctxTarget.lineWidth = 1;
    const gridSize = 25;
    for (let x = 0; x < w; x += gridSize) {
      ctxTarget.beginPath();
      ctxTarget.moveTo(x, 0);
      ctxTarget.lineTo(x, h);
      ctxTarget.stroke();
    }
    for (let y = 0; y < h; y += gridSize) {
      ctxTarget.beginPath();
      ctxTarget.moveTo(0, y);
      ctxTarget.lineTo(w, y);
      ctxTarget.stroke();
    }
  }

  function drawEnergyBars(ctxTarget, ep, ek) {
    const barWidth = 80;
    const barMaxHeight = 80;
    const maxVal = Math.max(2000, ep, ek);

    // Ep Bar (Top Left)
    const epHeight = (ep / maxVal) * barMaxHeight;
    ctxTarget.fillStyle = "rgba(0, 255, 102, 0.05)";
    ctxTarget.strokeStyle = "rgba(0, 255, 102, 0.2)";
    ctxTarget.lineWidth = 1;
    ctxTarget.fillRect(20, 20, barWidth, barMaxHeight);
    ctxTarget.strokeRect(20, 20, barWidth, barMaxHeight);

    ctxTarget.fillStyle = "#00ff66";
    ctxTarget.fillRect(20, 20 + (barMaxHeight - epHeight), barWidth, epHeight);

    ctxTarget.fillStyle = "#94a3b8";
    ctxTarget.font = "bold 9px 'Space Grotesk', monospace";
    ctxTarget.fillText("E_p STORE", 20, 115);
    ctxTarget.fillText(`${Math.round(ep)} J`, 20, 128);

    // Ek Bar
    const ekHeight = (ek / maxVal) * barMaxHeight;
    ctxTarget.fillStyle = "rgba(0, 255, 102, 0.05)";
    ctxTarget.strokeStyle = "rgba(0, 255, 102, 0.2)";
    ctxTarget.fillRect(120, 20, barWidth, barMaxHeight);
    ctxTarget.strokeRect(120, 20, barWidth, barMaxHeight);

    ctxTarget.fillStyle = "#00ff66";
    ctxTarget.fillRect(120, 20 + (barMaxHeight - ekHeight), barWidth, ekHeight);

    ctxTarget.fillStyle = "#94a3b8";
    ctxTarget.fillText("E_k STORE", 120, 115);
    ctxTarget.fillText(`${Math.round(ek)} J`, 120, 128);
  }

  // --- QUIZ WORK (30 beginner questions) ---
  function generateQuizPool() {
    const pool = [];
    
    // Rotate calculations to generate 30 distinct questions
    for (let i = 0; i < 28; i++) {
      const mass = Math.floor(Math.random() * 45) + 5; // 5-50 kg
      const speed = Math.floor(Math.random() * 18) + 2; // 2-20 m/s
      const height = Math.floor(Math.random() * 48) + 2; // 2-50 m
      const g = 10;

      const type = i % 5;
      if (type === 0) {
        // Find Ek
        const ek = 0.5 * mass * speed * speed;
        pool.push({
          text: `An object with a mass of ${mass} kg is moving along a track at a speed of ${speed} m/s. Calculate the energy in its kinetic store.`,
          answer: `${ek.toFixed(0)} J`,
          options: shuffle([`${ek.toFixed(0)} J`, `${(ek * 1.5).toFixed(0)} J`, `${(ek * 0.5).toFixed(0)} J`, `${(mass * speed).toFixed(0)} J`]),
          formula: "E_k = ½mv²",
          working: `E_k = ½ × ${mass} kg × (${speed} m/s)² = ${ek.toFixed(0)} J`
        });
      } else if (type === 1) {
        // Find Ep
        const ep = mass * g * height;
        pool.push({
          text: `A load of mass ${mass} kg is lifted to a height of ${height} m. Calculate the energy in its gravitational potential store. (g = 10 N/kg)`,
          answer: `${ep.toFixed(0)} J`,
          options: shuffle([`${ep.toFixed(0)} J`, `${(ep * 0.8).toFixed(0)} J`, `${(ep * 1.2).toFixed(0)} J`, `${(mass * height).toFixed(0)} J`]),
          formula: "E_p = mgh",
          working: `E_p = ${mass} kg × 10 N/kg × ${height} m = ${ep.toFixed(0)} J`
        });
      } else if (type === 2) {
        // Find v
        const ek = 0.5 * mass * speed * speed;
        pool.push({
          text: `An object of mass ${mass} kg has ${ek.toFixed(0)} J of energy in its kinetic store. Calculate its speed.`,
          answer: `${speed.toFixed(1)} m/s`,
          options: shuffle([`${speed.toFixed(1)} m/s`, `${(speed * 1.5).toFixed(1)} m/s`, `${(speed * 0.5).toFixed(1)} m/s`, `${Math.sqrt(ek).toFixed(1)} m/s`]),
          formula: "v = √(2E_k / m)",
          working: `v = √(2 × ${ek.toFixed(0)} J / ${mass} kg) = ${speed.toFixed(1)} m/s`
        });
      } else if (type === 3) {
        // Find h
        const ep = mass * g * height;
        pool.push({
          text: `An object of mass ${mass} kg has ${ep.toFixed(0)} J of energy in its gravitational potential store. Calculate its height. (g = 10 N/kg)`,
          answer: `${height.toFixed(1)} m`,
          options: shuffle([`${height.toFixed(1)} m`, `${(height * 1.4).toFixed(1)} m`, `${(height * 0.6).toFixed(1)} m`, `${(ep / mass).toFixed(1)} m`]),
          formula: "h = E_p / (mg)",
          working: `h = ${ep.toFixed(0)} J / (${mass} kg × 10 N/kg) = ${height.toFixed(1)} m`
        });
      } else {
        // Find m
        const ek = 0.5 * mass * speed * speed;
        pool.push({
          text: `An object has ${ek.toFixed(0)} J of energy in its kinetic store while moving at a constant speed of ${speed} m/s. Calculate its mass.`,
          answer: `${mass.toFixed(1)} kg`,
          options: shuffle([`${mass.toFixed(1)} kg`, `${(mass * 1.3).toFixed(1)} kg`, `${(mass * 0.7).toFixed(1)} kg`, `${(ek / speed).toFixed(1)} kg`]),
          formula: "m = 2E_k / v²",
          working: `m = (2 × ${ek.toFixed(0)} J) / (${speed} m/s)² = ${mass.toFixed(1)} kg`
        });
      }
    }

    // Add 2 conceptual MCQ questions to total exactly 30 questions
    pool.push({
      text: "Which variable, if doubled, has the greater effect on the energy in the kinetic store of a moving vehicle?",
      answer: "Speed of the vehicle",
      options: ["Mass of the vehicle", "Speed of the vehicle", "Both have the exact same effect", "Neither affect the store"],
      formula: "E_k = ½mv²",
      working: "Since speed (v) is squared in the formula, doubling speed quadruples (×4) the store, while doubling mass only doubles (×2) the store."
    });

    pool.push({
      text: "If an object is lifted three times higher above the ground, what happens to the energy in its gravitational potential store?",
      answer: "It triples (increases by 3 times)",
      options: ["It triples (increases by 3 times)", "It increases by 9 times", "It stays the same", "It decreases by 3 times"],
      formula: "E_p = mgh",
      working: "Since Ep is directly proportional to height (h), tripling the height will triple the energy in the gravitational potential store."
    });

    return pool;
  }

  function shuffle(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  // --- INITIALIZE FLASHCARDS ---
  state.flashcards = [
    { id: 1, front: "What is the formula for calculating energy in the kinetic store?", back: "Ek = ½mv²" },
    { id: 2, front: "What is the formula for energy in the gravitational potential store?", back: "Ep = mgh" },
    { id: 3, front: "In the formula Ek = ½mv², what units must mass (m) and speed (v) be in?", back: "m in kilograms (kg)\nv in meters per second (m/s)" },
    { id: 4, front: "What is the constant value and unit of gravitational field strength (g) in the O-level syllabus?", back: "g = 10 N/kg" },
    { id: 5, front: "A 4 kg drone flies at a speed of 5 m/s. Calculate the energy in its kinetic store.", back: "Ek = ½ × 4 × 5²\nEk = 2 × 25 = 50 J" },
    { id: 6, front: "A 2 kg brick rests on a ledge 15 m above the ground. Calculate the energy in its gravitational potential store.", back: "Ep = 2 × 10 × 15\nEp = 300 J" },
    { id: 7, front: "If the speed of a toy car is doubled, what happens to the energy in its kinetic store?", back: "Since Ek ∝ v²,\ndoubling speed increases the store by 2² = 4 times." },
    { id: 8, front: "If the mass of an elevator is doubled while staying at the same height, what happens to the energy in its gravitational potential store?", back: "Since Ep ∝ m,\ndoubling mass increases the store by exactly 2 times." },
    { id: 9, front: "An object with a mass of 10 kg has 80 J of energy in its kinetic store. Calculate its speed.", back: "v = √(2Ek / m)\nv = √(2 × 80 / 10) = √16 = 4 m/s" },
    { id: 10, front: "A book of mass 0.5 kg has 20 J of energy in its gravitational potential store. What is its height?", back: "h = Ep / (mg)\nh = 20 / (0.5 × 10) = 20 / 5 = 4 m" },
    { id: 11, front: "What is the unit of energy used for both kinetic and gravitational potential stores?", back: "Joules (J)" },
    { id: 12, front: "A box of unknown mass is lifted 6 m, gaining 120 J of energy in its gravitational potential store. Find its mass.", back: "m = Ep / (gh)\nm = 120 / (10 × 6) = 120 / 60 = 2 kg" },
    { id: 13, front: "State the principle of conservation of energy using correct stores terminology.", back: "Energy cannot be created or destroyed. It can only be transferred from one store to another." },
    { id: 14, front: "A metal ball of mass 3 kg has 150 J of energy in its kinetic store. What is its mass in grams?", back: "3 kg = 3000 g (Mass must remain in kg for energy calculations)." },
    { id: 15, front: "For a falling object with no air resistance, which store transfers energy to which store?", back: "Energy in the gravitational potential store transfers to energy in the kinetic store." }
  ];

  updateBegParams();

  // Initialize Quiz
  const quizPool = generateQuizPool();
  
  function startQuizSession() {
    const allShuffled = shuffle(quizPool);
    state.activeQuizQuestions = allShuffled.slice(0, 15);
    state.currentQuizQuestionIndex = 0;
    state.quizScore = 0;
    state.answeredQuestions = [];
    
    document.getElementById("scorePanel").style.display = "none";
    document.getElementById("questionContainer").style.display = "block";
    
    renderQuizQuestion();
  }

  function renderQuizQuestion() {
    const currentQ = state.activeQuizQuestions[state.currentQuizQuestionIndex];
    
    document.getElementById("quizProgressText").textContent = `Question ${state.currentQuizQuestionIndex + 1} of 15`;
    document.getElementById("quizScoreText").textContent = `Score: ${state.quizScore}`;
    document.getElementById("quizProgressBar").style.width = `${((state.currentQuizQuestionIndex) / 15) * 100}%`;

    document.getElementById("questionText").textContent = currentQ.text;
    
    const container = document.getElementById("optionsContainer");
    container.innerHTML = "";
    document.getElementById("solutionContainer").style.display = "none";
    document.getElementById("btnQuizNext").style.display = "none";

    currentQ.options.forEach((opt, idx) => {
      const btn = document.createElement("button");
      btn.className = "option-btn";
      btn.innerHTML = `<span>${opt}</span>`;
      btn.addEventListener("click", () => selectOption(idx));
      container.appendChild(btn);
    });

    state.selectedOptionIndex = null;
  }

  function selectOption(idx) {
    if (state.selectedOptionIndex !== null) return;
    state.selectedOptionIndex = idx;

    const currentQ = state.activeQuizQuestions[state.currentQuizQuestionIndex];
    const optionButtons = document.querySelectorAll(".option-btn");
    const chosenText = currentQ.options[idx];
    const isCorrect = chosenText === currentQ.answer;

    if (isCorrect) {
      state.quizScore++;
      optionButtons[idx].classList.add("correct");
      showFeedback(true, currentQ);
      triggerCelebration();
    } else {
      optionButtons[idx].classList.add("wrong");
      currentQ.options.forEach((opt, oIdx) => {
        if (opt === currentQ.answer) {
          optionButtons[oIdx].classList.add("correct");
        }
      });
      showFeedback(false, currentQ);
    }

    document.getElementById("quizScoreText").textContent = `Score: ${state.quizScore}`;
    document.getElementById("btnQuizNext").style.display = "block";
  }

  function showFeedback(correct, question) {
    const feedbackBox = document.getElementById("solutionContainer");
    const title = document.getElementById("feedbackTitle");
    const text = document.getElementById("solutionText");
    const formula = document.getElementById("solutionEquation");

    feedbackBox.style.display = "block";
    if (correct) {
      title.className = "feedback-title correct";
      title.innerHTML = `<span>Correct! Excellent.</span>`;
    } else {
      title.className = "feedback-title wrong";
      title.innerHTML = `<span>Incorrect.</span>`;
    }

    text.textContent = question.working;
    formula.textContent = `Formula used: ${question.formula}`;
  }

  document.getElementById("btnQuizNext").addEventListener("click", () => {
    state.currentQuizQuestionIndex++;
    if (state.currentQuizQuestionIndex < 15) {
      renderQuizQuestion();
    } else {
      showFinalScore();
    }
  });

  function showFinalScore() {
    document.getElementById("questionContainer").style.display = "none";
    document.getElementById("solutionContainer").style.display = "none";
    document.getElementById("btnQuizNext").style.display = "none";
    
    const panel = document.getElementById("scorePanel");
    panel.style.display = "block";
    
    const scoreBig = document.getElementById("scoreBig");
    const commentary = document.getElementById("scoreCommentary");

    scoreBig.textContent = `${state.quizScore} / 15`;
    document.getElementById("quizProgressBar").style.width = "100%";

    if (state.quizScore >= 13) {
      commentary.textContent = "Energy Expert! ⚡";
      triggerCelebration();
    } else if (state.quizScore >= 9) {
      commentary.textContent = "Nearly there — review your formula and try again.";
    } else {
      commentary.textContent = "Go back to the simulator and check your working.";
    }
  }

  document.getElementById("btnRestartQuiz").addEventListener("click", startQuizSession);

  // Confetti
  function triggerCelebration() {
    const container = document.getElementById("confettiContainer");
    container.innerHTML = "";

    for (let i = 0; i < 40; i++) {
      const piece = document.createElement("div");
      piece.className = "confetti-piece";
      piece.style.left = `${Math.random() * 100}vw`;
      piece.style.animationDelay = `${Math.random() * 2}s`;
      piece.style.backgroundColor = `hsl(${Math.random() * 120 + 80}, 100%, 50%)`;
      container.appendChild(piece);
    }

    setTimeout(() => {
      container.innerHTML = "";
    }, 4000);
  }

  // --- FLASHCARDS ---
  const flashcardWrapper = document.getElementById("flashcardWrapper");
  const frontText = document.getElementById("flashcardFrontText");
  const backText = document.getElementById("flashcardBackText");
  const cardCounter = document.getElementById("cardCounter");
  
  function updateFlashcard() {
    flashcardWrapper.classList.remove("flipped");
    const card = state.flashcards[state.currentFlashcardIndex];
    frontText.textContent = card.front;
    backText.innerHTML = card.back.replace(/\n/g, "<br>");
    cardCounter.textContent = `Card ${state.currentFlashcardIndex + 1} of ${state.flashcards.length}`;
    state.reviewedCardIds.add(card.id);
  }

  flashcardWrapper.addEventListener("click", () => {
    flashcardWrapper.classList.toggle("flipped");
  });

  document.getElementById("btnNextCard").addEventListener("click", () => {
    state.currentFlashcardIndex = (state.currentFlashcardIndex + 1) % state.flashcards.length;
    updateFlashcard();
  });

  document.getElementById("btnPrevCard").addEventListener("click", () => {
    state.currentFlashcardIndex = (state.currentFlashcardIndex - 1 + state.flashcards.length) % state.flashcards.length;
    updateFlashcard();
  });

  document.getElementById("btnShuffleCards").addEventListener("click", () => {
    state.flashcards = shuffle(state.flashcards);
    state.currentFlashcardIndex = 0;
    updateFlashcard();
  });

  // Start initialization
  startQuizSession();
  updateFlashcard();
});
