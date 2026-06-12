document.addEventListener('DOMContentLoaded', () => {
  // --- STATE VARIABLES ---
  let activeTab = 'concept';
  let activeSim = 'pendulum';
  let currentQuizSession = null;
  let currentCardIndex = 0;
  let reviewedCards = new Set();

  const g = 10; // Fixed gravity in N/kg

  // --- FLASHCARDS DATA ---
  const flashcardsData = [
    {
      front: "A 4 kg pendulum bob is released from a height of 2 m. What is the maximum energy in its kinetic store?",
      back: `<strong>Step 1: Calculate gravitational potential store energy at the top</strong><br>
             Ep = mgh = 4 × 10 × 2 = 80 J<br><br>
             <strong>Step 2: Apply conservation of energy</strong><br>
             At the bottom, all energy in the gravitational potential store is transferred to the kinetic store.<br>
             Ek = 80 J`
    },
    {
      front: "In a real roller coaster, where does the energy in the kinetic store transfer to as it moves up a hill?",
      back: `It transfers to the <strong>gravitational potential store</strong> as height increases, and to the <strong>internal store</strong> of the wheels and tracks due to friction and air resistance.`
    },
    {
      front: "State the principle of conservation of energy.",
      back: `Energy cannot be created or destroyed. It can only be transferred from one store to another. The total energy in all stores always remains constant.`
    },
    {
      front: "At the bottom of a swing, which store has maximum energy?",
      back: `The <strong>kinetic store</strong> has maximum energy at the bottom of the swing because all gravitational potential store energy has been transferred to it.`
    },
    {
      front: "A 500 kg roller coaster cart starts from a hill of height 40 m. Find the total energy in its stores.",
      back: `Etotal = Ep = mgh = 500 × 10 × 40 = 200,000 J (or 200 kJ).`
    },
    {
      front: "Why does a real pendulum bob eventually stop swinging?",
      back: `During each swing, energy is transferred to the <strong>internal store</strong> of the bob and the surrounding air due to friction and air resistance. Eventually, all mechanical energy is transferred to the internal store.`
    },
    {
      front: "Does the total energy of a system decrease in a real simulation?",
      back: `No. The total energy remains <strong>constant</strong>. Energy is transferred to the internal store, but it is not destroyed.`
    },
    {
      front: "An object is dropped from 5 m. What is its speed just before hitting the ground? (frictionless)",
      back: `Ep = Ek  =>  mgh = ½mv²<br>
             gh = ½v²  =>  10 × 5 = ½v²<br>
             v² = 100  =>  v = 10 m/s.`
    },
    {
      front: "State the SI unit of energy.",
      back: `The SI unit of energy is the <strong>Joule (J)</strong>.`
    },
    {
      front: "What energy transfer occurs as a stone falls freely in an ideal environment?",
      back: `Energy is transferred from the <strong>gravitational potential store</strong> to the <strong>kinetic store</strong>.`
    },
    {
      front: "If a cart starts with 1000 J of Ep, and 200 J is transferred to the internal store, how much Ek remains at the trough?",
      back: `Ek = Etotal - Eint = 1000 - 200 = 800 J.`
    },
    {
      front: "A 2 kg box is pushed up a hill. What store is energy transferred into?",
      back: `Energy is transferred into the <strong>gravitational potential store</strong> (due to increased height) and the <strong>internal store</strong> (due to friction).`
    },
    {
      front: "Is it correct to say energy disappears due to friction?",
      back: "No. Under the Singapore O-Level syllabus, energy never disappears. It is transferred to the internal store of the surroundings."
    },
    {
      front: "Write the formula for calculating energy in the gravitational potential store.",
      back: `Ep = mgh<br>where m is mass in kg, g is gravitational field strength (10 N/kg), and h is height in meters.`
    },
    {
      front: "Write the formula for calculating energy in the kinetic store.",
      back: `Ek = ½mv²<br>where m is mass in kg and v is speed in m/s.`
    }
  ];

  let currentDeck = [...flashcardsData];

  // --- TAB NAVIGATION ---
  const navBtns = document.querySelectorAll('.nav-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      navBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(tc => tc.classList.remove('active-content'));

      btn.classList.add('active');
      const targetTab = btn.getAttribute('data-tab');
      document.getElementById(`tab-${targetTab}`).classList.add('active-content');
      activeTab = targetTab;

      if (activeTab === 'simulations') {
        initSimulations();
      }
    });
  });

  // --- SIMULATION SWITCHING ---
  const simBtns = document.querySelectorAll('.sim-toggle-btn');
  const simViews = document.querySelectorAll('.sim-view');

  simBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      simBtns.forEach(b => b.classList.remove('active'));
      simViews.forEach(sv => sv.classList.remove('active-view'));

      btn.classList.add('active');
      const targetSim = btn.getAttribute('data-sim');
      document.getElementById(`sim-${targetSim}-content`).classList.add('active-view');
      activeSim = targetSim;
      initSimulations();
    });
  });

  // --- PENDULUM SIMULATION ---
  const canvasPendulum = document.getElementById('canvas-pendulum');
  const ctxPendulum = canvasPendulum.getContext('2d');
  const paramPendulumMass = document.getElementById('param-pendulum-mass');
  const paramPendulumHeight = document.getElementById('param-pendulum-height');
  const togglePendulumReal = document.getElementById('toggle-pendulum-real');
  const labelPendulumMode = document.getElementById('label-pendulum-mode');
  const rowPendulumInternal = document.getElementById('row-pendulum-internal');

  let pendulumState = {
    theta: 0,
    omega: 0,
    amplitude: 0,
    mass: 5,
    height: 2.0,
    isReal: false,
    pivotX: 300,
    pivotY: 80,
    length: 220
  };

  function updatePendulumParams() {
    pendulumState.mass = parseFloat(paramPendulumMass.value);
    document.getElementById('val-pendulum-mass').innerText = pendulumState.mass;
    
    pendulumState.height = parseFloat(paramPendulumHeight.value);
    document.getElementById('val-pendulum-height').innerText = pendulumState.height.toFixed(1);

    pendulumState.isReal = togglePendulumReal.checked;
    if (pendulumState.isReal) {
      labelPendulumMode.innerText = "Real (With Air Resistance)";
      rowPendulumInternal.style.display = "flex";
    } else {
      labelPendulumMode.innerText = "Ideal (Frictionless)";
      rowPendulumInternal.style.display = "none";
    }
  }

  function resetPendulum() {
    updatePendulumParams();
    // Map height (0.5 to 3 m) to angle amplitude (25 to 70 degrees)
    const maxH = 3.0;
    const minH = 0.5;
    const maxAngle = 70 * Math.PI / 180;
    const minAngle = 25 * Math.PI / 180;
    
    const t = (pendulumState.height - minH) / (maxH - minH);
    pendulumState.amplitude = minAngle + t * (maxAngle - minAngle);
    pendulumState.theta = pendulumState.amplitude;
    pendulumState.omega = 0;
  }

  let pendulumIsPaused = false;

  paramPendulumMass.addEventListener('input', updatePendulumParams);
  paramPendulumHeight.addEventListener('input', resetPendulum);
  togglePendulumReal.addEventListener('change', resetPendulum);
  
  const btnPendulumPlay = document.getElementById('btn-pendulum-play');
  const btnPendulumPause = document.getElementById('btn-pendulum-pause');
  
  btnPendulumPlay.addEventListener('click', () => {
    pendulumIsPaused = false;
    btnPendulumPlay.classList.add('active');
    btnPendulumPause.classList.remove('active');
  });

  btnPendulumPause.addEventListener('click', () => {
    pendulumIsPaused = true;
    btnPendulumPause.classList.add('active');
    btnPendulumPlay.classList.remove('active');
  });

  document.getElementById('btn-pendulum-reset').addEventListener('click', () => {
    resetPendulum();
    pendulumIsPaused = false;
    btnPendulumPlay.classList.add('active');
    btnPendulumPause.classList.remove('active');
  });

  // Initialize button visual state
  btnPendulumPlay.classList.add('active');

  // --- ROLLER COASTER SIMULATION ---
  const canvasCoaster = document.getElementById('canvas-coaster');
  const ctxCoaster = canvasCoaster.getContext('2d');
  const paramCoasterMass = document.getElementById('param-coaster-mass');
  const paramCoasterHeight = document.getElementById('param-coaster-height');
  const toggleCoasterReal = document.getElementById('toggle-coaster-real');
  const labelCoasterMode = document.getElementById('label-coaster-mode');
  const rowCoasterInternal = document.getElementById('row-coaster-internal');

  let coasterState = {
    mass: 1000,
    startHeight: 40,
    isReal: false,
    x: 50, // Cart x position in px
    v: 0,  // Velocity in m/s
    dir: 1, // 1 = right, -1 = left
    eInt: 0 // Accumulated internal store energy
  };

  // Coaster Track Profile Nodes (x in pixels, height in meters)
  const coasterNodes = [
    { x: 50, h: 40 },
    { x: 180, h: 0 },
    { x: 310, h: 25 },
    { x: 420, h: 5 },
    { x: 580, h: 55 }
  ];

  function getTrackHeight(x) {
    if (x <= coasterNodes[0].x) return coasterState.startHeight;
    if (x >= coasterNodes[coasterNodes.length - 1].x) return coasterNodes[coasterNodes.length - 1].h;

    for (let i = 0; i < coasterNodes.length - 1; i++) {
      const nA = coasterNodes[i];
      const nB = coasterNodes[i+1];
      if (x >= nA.x && x <= nB.x) {
        const hA = (i === 0) ? coasterState.startHeight : nA.h;
        const hB = nB.h;
        const t = (x - nA.x) / (nB.x - nA.x);
        const mu = (1 - Math.cos(t * Math.PI)) / 2;
        return hA * (1 - mu) + hB * mu;
      }
    }
    return 0;
  }

  function updateCoasterParams() {
    coasterState.mass = parseFloat(paramCoasterMass.value);
    document.getElementById('val-coaster-mass').innerText = coasterState.mass;

    coasterState.startHeight = parseFloat(paramCoasterHeight.value);
    document.getElementById('val-coaster-height').innerText = coasterState.startHeight;

    coasterState.isReal = toggleCoasterReal.checked;
    if (coasterState.isReal) {
      labelCoasterMode.innerText = "Real (With Friction)";
      rowCoasterInternal.style.display = "flex";
    } else {
      labelCoasterMode.innerText = "Ideal (Frictionless)";
      rowCoasterInternal.style.display = "none";
    }
  }

  function resetCoaster() {
    updateCoasterParams();
    coasterState.x = 55;
    coasterState.v = 0;
    coasterState.dir = 1;
    coasterState.eInt = 0;
  }

  let coasterIsPaused = false;

  paramCoasterMass.addEventListener('input', updateCoasterParams);
  paramCoasterHeight.addEventListener('input', resetCoaster);
  toggleCoasterReal.addEventListener('change', resetCoaster);
  
  const btnCoasterPlay = document.getElementById('btn-coaster-play');
  const btnCoasterPause = document.getElementById('btn-coaster-pause');

  btnCoasterPlay.addEventListener('click', () => {
    coasterIsPaused = false;
    btnCoasterPlay.classList.add('active');
    btnCoasterPause.classList.remove('active');
  });

  btnCoasterPause.addEventListener('click', () => {
    coasterIsPaused = true;
    btnCoasterPause.classList.add('active');
    btnCoasterPlay.classList.remove('active');
  });

  document.getElementById('btn-coaster-reset').addEventListener('click', () => {
    resetCoaster();
    coasterIsPaused = false;
    btnCoasterPlay.classList.add('active');
    btnCoasterPause.classList.remove('active');
  });

  // Initialize button visual state
  btnCoasterPlay.classList.add('active');

  // --- ANIMATION LOOP ENGINE ---
  let simLoopActive = false;

  function initSimulations() {
    if (!simLoopActive) {
      simLoopActive = true;
      resetPendulum();
      resetCoaster();
      requestAnimationFrame(simulationStep);
    }
  }

  function simulationStep() {
    if (activeTab !== 'simulations') {
      simLoopActive = false;
      return;
    }

    if (activeSim === 'pendulum') {
      // 1. Physics update for Pendulum
      const dt = pendulumIsPaused ? 0 : 0.05; // Time step
      const l_phys = 3.0; // Bob physical length (m)
      
      // Calculate angular acceleration
      let alpha = -(g / l_phys) * Math.sin(pendulumState.theta);
      
      if (pendulumState.isReal) {
        // Damping factor: small fraction transfers to internal store
        const damping = 0.08;
        alpha -= damping * pendulumState.omega;
      }

      pendulumState.omega += alpha * dt;
      pendulumState.theta += pendulumState.omega * dt;

      // Peak angle / amplitude decay logic for Real mode to calculate internal store cleanly
      if (pendulumState.isReal && !pendulumIsPaused) {
        pendulumState.amplitude *= 0.9982; // Gradual decay of potential amplitude
      }

      // 2. Calculations
      const e_total_max = pendulumState.mass * g * pendulumState.height;
      const initial_amplitude_angle = (pendulumState.height - 0.5) / 2.5 * (70 - 25) * Math.PI / 180 + 25 * Math.PI / 180;
      
      // Instant GPE based on current height
      const cur_h = pendulumState.height * (1 - Math.cos(pendulumState.theta)) / (1 - Math.cos(initial_amplitude_angle));
      let Ep = pendulumState.mass * g * Math.max(0, cur_h);
      
      let Ek = 0;
      let Eint = 0;

      if (!pendulumState.isReal) {
        Ek = Math.max(0, e_total_max - Ep);
      } else {
        // Energy in current mechanical oscillation envelope
        const cur_mech_max = e_total_max * (1 - Math.cos(pendulumState.amplitude)) / (1 - Math.cos(initial_amplitude_angle));
        Eint = Math.max(0, e_total_max - cur_mech_max);
        Ek = Math.max(0, cur_mech_max - Ep);
      }

      // Limit values
      Ep = Math.min(e_total_max, Ep);
      Ek = Math.min(e_total_max, Ek);
      Eint = Math.min(e_total_max, Eint);

      // 3. Render Canvas
      ctxPendulum.clearRect(0, 0, canvasPendulum.width, canvasPendulum.height);
      
      const bobX = pendulumState.pivotX + pendulumState.length * Math.sin(pendulumState.theta);
      const bobY = pendulumState.pivotY + pendulumState.length * Math.cos(pendulumState.theta);

      // Rod
      ctxPendulum.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctxPendulum.lineWidth = 3;
      ctxPendulum.beginPath();
      ctxPendulum.moveTo(pendulumState.pivotX, pendulumState.pivotY);
      ctxPendulum.lineTo(bobX, bobY);
      ctxPendulum.stroke();

      // Pivot
      ctxPendulum.fillStyle = 'white';
      ctxPendulum.beginPath();
      ctxPendulum.arc(pendulumState.pivotX, pendulumState.pivotY, 6, 0, Math.PI * 2);
      ctxPendulum.fill();

      // Bob Shadow/Glow
      ctxPendulum.shadowColor = varColor('--accent-color');
      ctxPendulum.shadowBlur = 15;

      // Bob
      ctxPendulum.fillStyle = varColor('--accent-color');
      ctxPendulum.beginPath();
      ctxPendulum.arc(bobX, bobY, 15 + pendulumState.mass * 1.5, 0, Math.PI * 2);
      ctxPendulum.fill();
      
      // Reset Shadow
      ctxPendulum.shadowBlur = 0;

      // 4. Update Bars
      document.getElementById('val-pendulum-ep').innerText = Math.round(Ep) + " J";
      document.getElementById('val-pendulum-ek').innerText = Math.round(Ek) + " J";
      document.getElementById('val-pendulum-eint').innerText = Math.round(Eint) + " J";
      document.getElementById('val-pendulum-etotal').innerText = Math.round(Ep + Ek + Eint) + " J";

      document.getElementById('fill-pendulum-ep').style.width = (Ep / e_total_max * 100) + "%";
      document.getElementById('fill-pendulum-ek').style.width = (Ek / e_total_max * 100) + "%";
      document.getElementById('fill-pendulum-eint').style.width = (Eint / e_total_max * 100) + "%";

    } else {
      // 1. Coaster physics
      const dt = coasterIsPaused ? 0 : 1.0;
      const x_min = 50;
      const x_max = 580;

      // Move cart step
      coasterState.x += coasterState.dir * coasterState.v * dt * 0.15;

      // Calculate heights
      const cur_h = getTrackHeight(coasterState.x);
      const e_total_max = coasterState.mass * g * coasterState.startHeight;

      if (coasterState.isReal && coasterState.v !== 0) {
        // Transfer friction to internal store (Work = Force * distance)
        const dist_meters = coasterState.v * dt * 0.015;
        const work_done_friction = (coasterState.mass * g * 0.045) * dist_meters;
        coasterState.eInt = Math.min(e_total_max, coasterState.eInt + work_done_friction);
      }

      const Ep = coasterState.mass * g * cur_h;
      const e_mech = Math.max(0, e_total_max - coasterState.eInt);
      let Ek = e_mech - Ep;

      if (Ek < 0) {
        // Out of energy to proceed! Reverse direction
        coasterState.dir = -coasterState.dir;
        if (!coasterState.isReal && coasterState.dir === 1 && coasterState.x < 100) {
          // In Ideal mode, snap back to release point (55) to prevent getting stuck in the flat peak region
          coasterState.x = 55;
          coasterState.v = 0;
        } else {
          coasterState.x += coasterState.dir * 0.2; // Tiny nudge to avoid loop lock and ensure smooth slowdown
          coasterState.v = 0.05; // Tiny initial speed in new direction
        }
        Ek = 0;
      } else {
        // Speed formula v = sqrt(2 * Ek / m)
        const v_energy = Math.sqrt(2 * Ek / coasterState.mass);
        
        // Cap the maximum acceleration per frame to ensure smooth speed transitions
        const max_a = 5.0; // m/s^2 maximum acceleration
        const v_accel = coasterState.v + max_a * dt * 0.05;
        coasterState.v = Math.min(v_energy, v_accel);
      }

      // Ideal mode return snap
      if (!coasterState.isReal && coasterState.x <= 55 && coasterState.dir === -1) {
        coasterState.dir = 1;
        coasterState.x = 55.1;
        coasterState.v = 0.05;
      }

      // Friction bounds
      if (coasterState.x <= x_min) {
        coasterState.dir = 1;
        coasterState.x = x_min + 5; // Nudge past peak to ensure velocity > 0 in Ideal mode
        if (coasterState.isReal) {
          coasterState.x = x_min;
          coasterState.v = 0; // stop at boundary
        }
      }
      if (coasterState.x >= x_max) {
        coasterState.dir = -1;
        coasterState.x = x_max - 5;
      }

      // 2. Render Canvas
      ctxCoaster.clearRect(0, 0, canvasCoaster.width, canvasCoaster.height);

      // Track Curve
      ctxCoaster.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctxCoaster.lineWidth = 6;
      ctxCoaster.beginPath();
      ctxCoaster.moveTo(x_min, 350 - getTrackHeight(x_min) * 6);
      for (let px = x_min; px <= x_max; px++) {
        ctxCoaster.lineTo(px, 350 - getTrackHeight(px) * 6);
      }
      ctxCoaster.stroke();

      // Support pillars
      ctxCoaster.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctxCoaster.lineWidth = 2;
      coasterNodes.forEach(n => {
        ctxCoaster.beginPath();
        const startH = (n.x === 50) ? coasterState.startHeight : n.h;
        ctxCoaster.moveTo(n.x, 350 - startH * 6);
        ctxCoaster.lineTo(n.x, 350);
        ctxCoaster.stroke();
      });

      // Draw Cart
      const cartX = coasterState.x;
      const cartY = 350 - cur_h * 6;

      ctxCoaster.shadowColor = varColor('--accent-color');
      ctxCoaster.shadowBlur = 10;

      ctxCoaster.fillStyle = varColor('--accent-color');
      ctxCoaster.beginPath();
      ctxCoaster.rect(cartX - 12, cartY - 14, 24, 12);
      ctxCoaster.fill();

      // Wheels
      ctxCoaster.fillStyle = 'white';
      ctxCoaster.beginPath();
      ctxCoaster.arc(cartX - 7, cartY - 2, 4, 0, Math.PI * 2);
      ctxCoaster.arc(cartX + 7, cartY - 2, 4, 0, Math.PI * 2);
      ctxCoaster.fill();

      ctxCoaster.shadowBlur = 0;

      // 3. Update Bars
      let ep_show = Ep;
      let ek_show = coasterState.isReal ? Ek : e_total_max - Ep;
      let e_int_show = coasterState.isReal ? coasterState.eInt : 0;

      // Ensure no negative values or drift errors are displayed
      ep_show = Math.max(0, Math.min(e_total_max, ep_show));
      ek_show = Math.max(0, Math.min(e_total_max, ek_show));
      e_int_show = Math.max(0, Math.min(e_total_max, e_int_show));

      document.getElementById('val-coaster-ep').innerText = Math.round(ep_show) + " J";
      document.getElementById('val-coaster-ek').innerText = Math.round(ek_show) + " J";
      document.getElementById('val-coaster-eint').innerText = Math.round(e_int_show) + " J";
      document.getElementById('val-coaster-etotal').innerText = Math.round(ep_show + ek_show + e_int_show) + " J";

      document.getElementById('fill-coaster-ep').style.width = (ep_show / e_total_max * 100) + "%";
      document.getElementById('fill-coaster-ek').style.width = (ek_show / e_total_max * 100) + "%";
      document.getElementById('fill-coaster-eint').style.width = (e_int_show / e_total_max * 100) + "%";
    }

    requestAnimationFrame(simulationStep);
  }

  function varColor(cssVarName) {
    return getComputedStyle(document.documentElement).getPropertyValue(cssVarName).trim();
  }

  // --- PRACTICE QUIZ ENGINE ---
  const quizStartPanel = document.getElementById('quiz-start-panel');
  const quizActivePanel = document.getElementById('quiz-active-panel');
  const quizResultsPanel = document.getElementById('quiz-results-panel');
  const btnStartQuiz = document.getElementById('btn-start-quiz');
  const btnRestartQuiz = document.getElementById('btn-restart-quiz');
  const btnNextQuestion = document.getElementById('btn-next-question');

  btnStartQuiz.addEventListener('click', startNewQuiz);
  btnRestartQuiz.addEventListener('click', startNewQuiz);

  function startNewQuiz() {
    currentQuizSession = {
      questions: generateQuizDeck(),
      currentIndex: 0,
      score: 0,
      userAnswers: []
    };
    quizStartPanel.style.display = 'none';
    quizResultsPanel.style.display = 'none';
    quizActivePanel.style.display = 'block';
    renderQuizQuestion();
  }

  // Generate 15 questions randomly from 30 templates
  function generateQuizDeck() {
    const templates = [
      // 1. Max Ek at bottom
      () => {
        const m = rand(1, 50);
        const h = rand(1, 20);
        const ans = m * g * h;
        return {
          type: 'mcq',
          text: `A mass of ${m} kg is released from rest at a height of ${h} m in a frictionless environment. Calculate the maximum energy in its kinetic store at the lowest point. (Take g = 10 N/kg)`,
          options: shuffleArray([
            `${ans} J`,
            `${ans + 50} J`,
            `${m * g} J`,
            `${m * h} J`
          ]),
          correct: `${ans} J`,
          solution: `Ep = mgh = ${m} × 10 × ${h} = ${ans} J. At the lowest point, all energy in the gravitational potential store is transferred to the kinetic store.`
        };
      },
      // 2. Height from speed
      () => {
        const v = rand(2, 20);
        const ans_h = (v * v) / (2 * g);
        return {
          type: 'mcq',
          text: `An object of mass 5 kg has a speed of ${v} m/s at the bottom of a frictionless slope. What is the height from which it was released? (Take g = 10 N/kg)`,
          options: shuffleArray([
            `${ans_h.toFixed(2)} m`,
            `${(ans_h + 2.5).toFixed(2)} m`,
            `${(v / g).toFixed(2)} m`,
            `1.50 m`
          ]),
          correct: `${ans_h.toFixed(2)} m`,
          solution: `Ek = Ep => ½mv² = mgh => h = v² / 2g = ${v}² / 20 = ${ans_h.toFixed(2)} m.`
        };
      },
      // 3. GPE and internal store transfer
      () => {
        const ep = rand(100, 1000);
        const loss_pct = rand(5, 30);
        const loss_j = Math.round(ep * (loss_pct / 100));
        const ans = ep - loss_j;
        return {
          type: 'mcq',
          text: `A roller coaster cart has a starting gravitational potential store of ${ep} J. During its descent to the trough, ${loss_j} J of energy is transferred to the internal store due to friction and air resistance. Calculate the remaining energy in its kinetic store at the trough.`,
          options: shuffleArray([
            `${ans} J`,
            `${ep} J`,
            `${loss_j} J`,
            `${ep + loss_j} J`
          ]),
          correct: `${ans} J`,
          solution: `Etotal = Ep + Ek + Eint => Ek = Etotal - Eint = ${ep} - ${loss_j} = ${ans} J.`
        };
      },
      // 4. MCQ pendulum arc
      () => ({
        type: 'mcq',
        text: "In a real pendulum, why does the amplitude of the swing arc get smaller over time?",
        options: shuffleArray([
          "Energy is transferred to the internal store of the bob and surroundings due to friction and air resistance.",
          "Energy is destroyed as the bob moves through the air.",
          "The mass of the bob decreases as it swings.",
          "Gravity behaves weaker on subsequent swings."
        ]),
        correct: "Energy is transferred to the internal store of the bob and surroundings due to friction and air resistance.",
        solution: "Friction and air resistance transfer mechanical energy to the internal store of the surroundings."
      }),
      // 5. MCQ coaster max Ek
      () => ({
        type: 'mcq',
        text: "At what point on a roller coaster track is the energy in the kinetic store at its maximum?",
        options: shuffleArray([
          "At the lowest trough/valley",
          "At the highest hill/peak",
          "At the starting platform",
          "Halfway up the second hill"
        ]),
        correct: "At the lowest trough/valley",
        solution: "At the lowest point, the height is minimal, so energy in the gravitational potential store is minimum and energy in the kinetic store is maximum."
      }),
      // 6. MCQ ideal pendulum total energy
      () => ({
        type: 'mcq',
        text: "In an ideal pendulum, what happens to the total energy in all stores over time?",
        options: shuffleArray([
          "It remains constant.",
          "It decreases during each swing.",
          "It increases during the downward swing.",
          "It fluctuates randomly."
        ]),
        correct: "It remains constant.",
        solution: "According to the principle of conservation of energy, the total energy of a closed system always remains constant."
      }),
      // 7. True False 1
      () => ({
        type: 'mcq',
        text: "True or False: According to the principle of conservation of energy, energy can be created in a frictionless, ideal environment.",
        options: ["True", "False"],
        correct: "False",
        solution: "Energy can never be created or destroyed under any circumstances."
      }),
      // 8. Ep and Ek given, find internal store transfer
      () => {
        const ep = rand(200, 1200);
        const ek = Math.round(ep * (1 - rand(5, 30) / 100));
        const ans = ep - ek;
        return {
          type: 'mcq',
          text: `A falling mass has ${ep} J of energy in its gravitational potential store at the top. At the bottom, it has ${ek} J of energy in its kinetic store. Calculate the energy transferred to the internal store.`,
          options: shuffleArray([
            `${ans} J`,
            `${ep} J`,
            `${ek} J`,
            `${ep + ek} J`
          ]),
          correct: `${ans} J`,
          solution: `Eint = Ep - Ek = ${ep} - ${ek} = ${ans} J.`
        };
      }
    ];

    // Build 30 questions by generating clones
    const pool = [];
    for (let i = 0; i < 30; i++) {
      const idx = i % templates.length;
      pool.push(templates[idx]());
    }

    return shuffleArray(pool).slice(0, 15);
  }

  function renderQuizQuestion() {
    const session = currentQuizSession;
    const q = session.questions[session.currentIndex];

    document.getElementById('quiz-progress-text').innerText = `Question ${session.currentIndex + 1} of 15`;
    document.getElementById('quiz-progress-bar').style.width = `${((session.currentIndex + 1) / 15) * 100}%`;
    document.getElementById('question-text').innerText = q.text;

    // Render Options
    const optContainer = document.getElementById('options-container');
    optContainer.innerHTML = '';
    document.getElementById('question-feedback-box').style.display = 'none';

    q.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.innerHTML = `<span class="option-letter">${String.fromCharCode(65 + idx)}</span> <span class="option-text">${opt}</span>`;
      btn.addEventListener('click', () => submitQuizAnswer(opt, btn));
      optContainer.appendChild(btn);
    });
  }

  function submitQuizAnswer(selectedOpt, btnElement) {
    const session = currentQuizSession;
    const q = session.questions[session.currentIndex];
    
    // Disable all options
    const allBtns = document.querySelectorAll('.option-btn');
    allBtns.forEach(btn => btn.replaceWith(btn.cloneNode(true))); // Remove listeners

    const reSelectedBtn = document.querySelectorAll('.option-btn');
    const isCorrect = (selectedOpt === q.correct);

    if (isCorrect) {
      session.score++;
      // Show correct feedback
      reSelectedBtn.forEach(btn => {
        if (btn.querySelector('.option-text').innerText === q.correct) {
          btn.classList.add('correct-reveal');
        }
      });
      showQuestionFeedback(true, q.solution);
      triggerCelebrationParticle(btnElement);
    } else {
      reSelectedBtn.forEach(btn => {
        if (btn.querySelector('.option-text').innerText === selectedOpt) {
          btn.classList.add('wrong-reveal');
        }
        if (btn.querySelector('.option-text').innerText === q.correct) {
          btn.classList.add('correct-reveal');
        }
      });
      showQuestionFeedback(false, q.solution);
    }
  }

  function showQuestionFeedback(isCorrect, solutionText) {
    const fbBox = document.getElementById('question-feedback-box');
    const fbIndicator = document.getElementById('feedback-indicator');
    const solTextEl = document.getElementById('solution-text');

    fbIndicator.innerText = isCorrect ? "Correct! 🎉" : "Incorrect.";
    fbIndicator.className = `feedback-indicator ${isCorrect ? 'correct' : 'wrong'}`;
    solTextEl.innerHTML = solutionText;
    
    fbBox.style.display = 'flex';
  }

  btnNextQuestion.addEventListener('click', () => {
    const session = currentQuizSession;
    session.currentIndex++;
    if (session.currentIndex < 15) {
      renderQuizQuestion();
    } else {
      finishQuiz();
    }
  });

  function finishQuiz() {
    quizActivePanel.style.display = 'none';
    quizResultsPanel.style.display = 'block';

    const score = currentQuizSession.score;
    document.getElementById('results-score').innerText = score;

    const feedbackEl = document.getElementById('results-feedback-text');
    if (score >= 13) {
      feedbackEl.innerText = "Conservation Champion! 🎢 Full mastery of energy transfer stores demonstrated.";
      triggerCelebratoryAnimation();
    } else if (score >= 9) {
      feedbackEl.innerText = "Good effort — revisit the simulations and check your working.";
    } else {
      feedbackEl.innerText = "Go back to the simulator — watch how the energy stores change at each point.";
    }
  }

  function triggerCelebrationParticle(originEl) {
    const rect = originEl.getBoundingClientRect();
    for (let i = 0; i < 15; i++) {
      const p = document.createElement('div');
      p.className = 'confetti';
      p.style.left = `${rect.left + rect.width / 2}px`;
      p.style.top = `${rect.top + rect.height / 2}px`;
      p.style.backgroundColor = `hsl(${rand(0, 360)}, 100%, 50%)`;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 2000);
    }
  }

  function triggerCelebratoryAnimation() {
    for (let i = 0; i < 80; i++) {
      setTimeout(() => {
        const p = document.createElement('div');
        p.className = 'confetti';
        p.style.left = `${rand(10, 90)}vw`;
        p.style.top = `-20px`;
        p.style.backgroundColor = `hsl(${rand(10, 40)}, 100%, 50%)`; // Orange range
        p.style.transform = `scale(${rand(0.6, 1.4)})`;
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 3000);
      }, i * 40);
    }
  }

  // --- FLASHCARDS SYSTEM ---
  const flashcardEl = document.getElementById('flashcard-element');
  const btnPrevCard = document.getElementById('btn-prev-card');
  const btnNextCardRev = document.getElementById('btn-next-card-rev');
  const btnShuffleCards = document.getElementById('btn-shuffle-cards');

  flashcardEl.addEventListener('click', () => {
    flashcardEl.classList.toggle('flipped');
    reviewedCards.add(currentCardIndex);
    document.getElementById('val-cards-reviewed').innerText = reviewedCards.size;
  });

  function updateFlashcardView() {
    flashcardEl.classList.remove('flipped');
    const c = currentDeck[currentCardIndex];
    document.getElementById('card-front-text').innerText = c.front;
    document.getElementById('card-back-text').innerHTML = c.back;
    document.getElementById('val-card-index').innerText = `Card ${currentCardIndex + 1} of 15`;
  }

  btnPrevCard.addEventListener('click', () => {
    if (currentCardIndex > 0) {
      currentCardIndex--;
      updateFlashcardView();
    }
  });

  btnNextCardRev.addEventListener('click', () => {
    if (currentCardIndex < 14) {
      currentCardIndex++;
      updateFlashcardView();
    }
  });

  btnShuffleCards.addEventListener('click', () => {
    currentDeck = shuffleArray([...flashcardsData]);
    currentCardIndex = 0;
    reviewedCards.clear();
    document.getElementById('val-cards-reviewed').innerText = 0;
    updateFlashcardView();
  });

  // --- HELPER UTILS ---
  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function shuffleArray(arr) {
    return arr.sort(() => Math.random() - 0.5);
  }

  // Initialize view
  updateFlashcardView();
});
