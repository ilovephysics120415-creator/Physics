// Pressure Revision Challenge App Logic
class PressureApp {
  constructor() {
    this.sessionState = {
      overallCorrect: 0,
      overallTotal: 0,
      topicProgress: {
        Foundations: { completed: 0, total: 8, correct: 0 },
        Hydraulics: { completed: 0, total: 7, correct: 0 },
        Liquid: { completed: 0, total: 8, correct: 0 },
        Atmospheric: { completed: 0, total: 7, correct: 0 }
      },
      flashcards: this.initializeFlashcards()
    };

    // Load any existing session progress
    this.loadSession();

    // Quiz and Flashcard state
    this.currentQuiz = {
      type: 'full', // 'full' or topic name
      questions: [],
      currentIndex: 0,
      score: 0,
      topicScores: {
        Foundations: 0,
        Hydraulics: 0,
        Liquid: 0,
        Atmospheric: 0
      },
      hasChecked: false
    };

    this.activeFlashcards = [...this.sessionState.flashcards];
    this.currentFlashcardIndex = 0;
    this.currentFlashcardFilter = 'all';

    // Particle system for confetti
    this.confettiParticles = [];
    this.confettiActive = false;
  }

  init() {
    this.updateDashboardProgress();
    this.updateSessionStats();
    this.generateAllFormulaExamples();
    this.setupConfetti();
    this.resetFlashcardsUI();
  }

  // Session persistence
  loadSession() {
    const saved = sessionStorage.getItem('pressure_revision_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.sessionState.overallCorrect = parsed.overallCorrect || 0;
        this.sessionState.overallTotal = parsed.overallTotal || 0;
        if (parsed.topicProgress) {
          this.sessionState.topicProgress = parsed.topicProgress;
        }
      } catch (e) {
        console.error("Failed to load session progress", e);
      }
    }
  }

  saveSession() {
    sessionStorage.setItem('pressure_revision_session', JSON.stringify({
      overallCorrect: this.sessionState.overallCorrect,
      overallTotal: this.sessionState.overallTotal,
      topicProgress: this.sessionState.topicProgress
    }));
    this.updateSessionStats();
    this.updateDashboardProgress();
  }

  updateSessionStats() {
    document.getElementById('session-correct-count').innerText = this.sessionState.overallCorrect;
    document.getElementById('session-total-count').innerText = this.sessionState.overallTotal;
  }

  updateDashboardProgress() {
    const topics = ['Foundations', 'Hydraulics', 'Liquid', 'Atmospheric'];
    topics.forEach(t => {
      const state = this.sessionState.topicProgress[t];
      // Progress percent based on how many they've done
      const pct = state.total > 0 ? Math.min(100, Math.round((state.completed / state.total) * 100)) : 0;
      
      const ring = document.getElementById(`ring-${t.toLowerCase()}`);
      const text = document.getElementById(`text-${t.toLowerCase()}`);
      if (ring && text) {
        text.innerText = `${pct}%`;
        // Circle circumference is 2 * PI * 20 = 125.66
        const offset = 125.6 - (pct / 100) * 125.6;
        ring.setAttribute('stroke-dashoffset', offset);
      }
    });
  }

  // Routing
  navigateTo(sectionId) {
    // Hide all sections
    document.querySelectorAll('.app-section').forEach(s => s.classList.remove('active'));
    // Show selected
    const target = document.getElementById(`section-${sectionId}`);
    if (target) {
      target.classList.add('active');
    }

    // Update nav classes
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    const navItem = document.getElementById(`nav-${sectionId}`);
    if (navItem) {
      navItem.classList.add('active');
    }

    if (sectionId === 'quiz' && this.currentQuiz.questions.length === 0) {
      // Start a full quiz automatically if navigate to quiz view and nothing is in progress
      this.startQuiz('full');
    }
  }

  // SECTION 2: FORMULA SHEET WORKED EXAMPLES (RANDOMIZED VALUES)
  toggleFormulaExample(cardElement, formulaId) {
    const examplePane = cardElement.querySelector('.formula-worked-example');
    const chevron = cardElement.querySelector('.tap-to-expand i');
    
    if (examplePane.classList.contains('active')) {
      examplePane.classList.remove('active');
      chevron.className = 'fa-solid fa-chevron-down';
    } else {
      // Regenerate worked example on tap
      examplePane.innerHTML = this.generateFormulaExampleContent(formulaId);
      examplePane.classList.add('active');
      chevron.className = 'fa-solid fa-chevron-up';
    }
  }

  generateAllFormulaExamples() {
    const formulas = ['p-fa', 'hyd-ratio', 'hyd-f2', 'density', 'liquid-p', 'barometer', 'gas-above', 'gas-below'];
    formulas.forEach(fid => {
      const pane = document.getElementById(`example-${fid}`);
      if (pane) {
        pane.innerHTML = this.generateFormulaExampleContent(fid);
      }
    });
  }

  generateFormulaExampleContent(formulaId) {
    let html = '';
    switch (formulaId) {
      case 'p-fa': {
        const F = this.getRandomInt(20, 800, 10);
        const A = parseFloat((this.getRandomFloat(0.01, 1.5)).toFixed(3));
        const P = Math.round(F / A);
        html = `
          <div class="example-setup">
            <strong>Example problem:</strong> A box exerts a downward force of <strong>${F} N</strong> over a contact area of <strong>${A} m²</strong>. Calculate the pressure exerted.
          </div>
          <div class="example-math">
            P = F ÷ A<br>
            P = ${F} N ÷ ${A} m² = <strong>${P.toLocaleString()} Pa</strong> (or N/m²)
          </div>
        `;
        break;
      }
      case 'hyd-ratio': {
        const F1 = this.getRandomInt(10, 100, 10);
        const A1 = parseFloat((this.getRandomFloat(0.002, 0.010)).toFixed(3));
        const A2 = parseFloat((this.getRandomFloat(0.020, 0.100)).toFixed(3));
        const P = Math.round(F1 / A1);
        const F2 = Math.round(P * A2);
        html = `
          <div class="example-setup">
            <strong>Example problem:</strong> A force of <strong>${F1} N</strong> is applied to a small hydraulic piston of area <strong>${A1} m²</strong>. If the larger piston has an area of <strong>${A2} m²</strong>, find the transmitted fluid pressure and output force.
          </div>
          <div class="example-math">
            P = F₁ ÷ A₁ = ${F1} ÷ ${A1} = <strong>${P.toLocaleString()} Pa</strong><br>
            F₂ = P × A₂ = ${P} × ${A2} = <strong>${F2} N</strong>
          </div>
        `;
        break;
      }
      case 'hyd-f2': {
        const F1 = this.getRandomInt(20, 200, 10);
        const ratio = this.getRandomInt(5, 15, 1);
        const F2 = F1 * ratio;
        html = `
          <div class="example-setup">
            <strong>Example problem:</strong> An input force of <strong>${F1} N</strong> acts on piston 1. Piston 2 has an area <strong>${ratio} times</strong> larger than piston 1. Calculate the output force.
          </div>
          <div class="example-math">
            F₂ = F₁ × (A₂ ÷ A₁)<br>
            F₂ = ${F1} N × ${ratio} = <strong>${F2} N</strong>
          </div>
        `;
        break;
      }
      case 'density': {
        const V = parseFloat((this.getRandomFloat(0.002, 0.020)).toFixed(3));
        const rho = this.getRandomInt(800, 2500, 100);
        const m = parseFloat((rho * V).toFixed(2));
        html = `
          <div class="example-setup">
            <strong>Example problem:</strong> A block of mass <strong>${m} kg</strong> occupies a volume of <strong>${V} m³</strong>. Calculate its density.
          </div>
          <div class="example-math">
            ρ = m ÷ V<br>
            ρ = ${m} kg ÷ ${V} m³ = <strong>${rho.toLocaleString()} kg/m³</strong>
          </div>
        `;
        break;
      }
      case 'liquid-p': {
        const h = parseFloat((this.getRandomFloat(1.0, 8.0)).toFixed(1));
        const rho = 1000; // Water
        const g = 10;
        const P = h * rho * g;
        html = `
          <div class="example-setup">
            <strong>Example problem:</strong> Find the water pressure at a depth of <strong>${h} m</strong> in a freshwater reservoir. (Density of water = 1,000 kg/m³, g = 10 N/kg)
          </div>
          <div class="example-math">
            P = hρg<br>
            P = ${h} m × 1,000 kg/m³ × 10 N/kg = <strong>${P.toLocaleString()} Pa</strong> (${(P/1000).toFixed(1)} kPa)
          </div>
        `;
        break;
      }
      case 'barometer': {
        const h_mm = this.getRandomInt(730, 770, 5);
        const h_m = h_mm / 1000;
        const rho = 13600;
        const g = 10;
        const Pa = Math.round(h_m * rho * g);
        html = `
          <div class="example-setup">
            <strong>Example problem:</strong> A mercury barometer measures atmospheric height as <strong>${h_mm} mm</strong>. Determine atmospheric pressure. (Density of mercury = 13,600 kg/m³, g = 10 N/kg)
          </div>
          <div class="example-math">
            Pₐ = hρg = ${h_m} m × 13,600 kg/m³ × 10 N/kg<br>
            Pₐ = <strong>${Pa.toLocaleString()} Pa</strong>
          </div>
        `;
        break;
      }
      case 'gas-above': {
        const Pa = this.getRandomInt(100000, 102000, 500);
        const h_mm = this.getRandomInt(30, 120, 10);
        const h_m = h_mm / 1000;
        const rho = 13600;
        const g = 10;
        const diff = Math.round(h_m * rho * g);
        const Pgas = Pa + diff;
        html = `
          <div class="example-setup">
            <strong>Example problem:</strong> A manometer attached to a gas tank shows a mercury height difference of <strong>${h_mm} mm</strong>, with the atmospheric side higher. If atmospheric pressure is <strong>${Pa.toLocaleString()} Pa</strong>, calculate gas pressure.
          </div>
          <div class="example-math">
            Pgas = Pₐ + hρg<br>
            Pgas = ${Pa.toLocaleString()} + (${h_m} × 13,600 × 10)<br>
            Pgas = ${Pa.toLocaleString()} + ${diff.toLocaleString()} = <strong>${Pgas.toLocaleString()} Pa</strong>
          </div>
        `;
        break;
      }
      case 'gas-below': {
        const Pa = this.getRandomInt(100000, 102000, 500);
        const h_mm = this.getRandomInt(30, 120, 10);
        const h_m = h_mm / 1000;
        const rho = 13600;
        const g = 10;
        const diff = Math.round(h_m * rho * g);
        const Pgas = Pa - diff;
        html = `
          <div class="example-setup">
            <strong>Example problem:</strong> A manometer shows the mercury level on the gas side is higher by <strong>${h_mm} mm</strong>. Calculate gas pressure if Pₐ = <strong>${Pa.toLocaleString()} Pa</strong>.
          </div>
          <div class="example-math">
            Pgas = Pₐ - hρg<br>
            Pgas = ${Pa.toLocaleString()} - (${h_m} × 13,600 × 10)<br>
            Pgas = ${Pa.toLocaleString()} - ${diff.toLocaleString()} = <strong>${Pgas.toLocaleString()} Pa</strong>
          </div>
        `;
        break;
      }
    }
    return html;
  }

  // SECTION 3: QUIZ SYSTEM
  openTopicSelector() {
    document.getElementById('topic-quiz-modal').style.display = 'flex';
  }

  closeTopicSelector() {
    document.getElementById('topic-quiz-modal').style.display = 'none';
  }

  startQuiz(type) {
    this.closeTopicSelector();
    this.currentQuiz.type = type;
    this.currentQuiz.currentIndex = 0;
    this.currentQuiz.score = 0;
    this.currentQuiz.topicScores = {
      Foundations: 0,
      Hydraulics: 0,
      Liquid: 0,
      Atmospheric: 0
    };
    this.currentQuiz.hasChecked = false;

    // Generate questions
    this.currentQuiz.questions = this.generateQuizQuestions(type);
    
    // Reset accuracy stats
    this.navigateTo('quiz');
    this.showQuestion();
  }

  restartQuizAfterScore() {
    this.startQuiz(this.currentQuiz.type);
  }

  generateQuizQuestions(type) {
    let list = [];
    const countPerTopic = type === 'full' ? { Foundations: 8, Hydraulics: 7, Liquid: 8, Atmospheric: 7 } : { Foundations: 0, Hydraulics: 0, Liquid: 0, Atmospheric: 0 };
    
    if (type !== 'full') {
      countPerTopic[type] = 15; // Focus quiz has 15 questions
    }

    // Foundations Questions
    for (let i = 0; i < countPerTopic.Foundations; i++) {
      list.push(this.generateFoundationsQuestion(i));
    }
    // Hydraulics Questions
    for (let i = 0; i < countPerTopic.Hydraulics; i++) {
      list.push(this.generateHydraulicsQuestion(i));
    }
    // Liquid Questions
    for (let i = 0; i < countPerTopic.Liquid; i++) {
      list.push(this.generateLiquidQuestion(i));
    }
    // Atmospheric Questions
    for (let i = 0; i < countPerTopic.Atmospheric; i++) {
      list.push(this.generateAtmosphericQuestion(i));
    }

    // Shuffle the list
    return this.shuffle(list);
  }

  // Generate Questions per Topic
  generateFoundationsQuestion(index) {
    const qType = index % 3; // 0: Calculate P/F/A, 1: MCQ Conceptual, 2: MCQ Applied
    if (qType === 0) {
      // Calculate P, F, or A
      const rand = this.getRandomInt(0, 2, 1);
      const F = this.getRandomInt(20, 800, 10);
      const A = parseFloat((this.getRandomFloat(0.001, 2.000)).toFixed(3));
      const P = Math.round(F / A);

      if (rand === 0) {
        // Calculate P
        return {
          topic: 'Foundations',
          type: 'numeric',
          question: `A solid block exerts a perpendicular force of ${F} N over an area of ${A} m². Calculate the pressure exerted on the surface. (Round to the nearest integer)`,
          correctAnswer: F / A,
          unit: 'Pa',
          working: `<p><strong>Given:</strong> Force F = ${F} N, Area A = ${A} m²</p>
                    <p><strong>Formula:</strong> Pressure P = F / A</p>
                    <p><strong>Calculation:</strong> P = ${F} ÷ ${A} = ${(F / A).toFixed(1)} Pa</p>`
        };
      } else if (rand === 1) {
        // Calculate F
        return {
          topic: 'Foundations',
          type: 'numeric',
          question: `An atmospheric pressure chamber experiences a pressure of ${P} Pa over a panel of area ${A} m². Find the total force acting on the panel.`,
          correctAnswer: P * A,
          unit: 'N',
          working: `<p><strong>Given:</strong> Pressure P = ${P} Pa, Area A = ${A} m²</p>
                    <p><strong>Formula:</strong> Force F = P × A</p>
                    <p><strong>Calculation:</strong> F = ${P} × ${A} = ${(P * A).toFixed(3)} N</p>`
        };
      } else {
        // Calculate A
        return {
          topic: 'Foundations',
          type: 'numeric',
          question: `A container of force ${F} N exerts a pressure of ${P} Pa on a flat platform. Calculate the base contact area of the container.`,
          correctAnswer: F / P,
          unit: 'm²',
          working: `<p><strong>Given:</strong> Force F = ${F} N, Pressure P = ${P} Pa</p>
                    <p><strong>Formula:</strong> Area A = F / P</p>
                    <p><strong>Calculation:</strong> A = ${F} ÷ ${P} = ${(F / P).toFixed(4)} m²</p>`
        };
      }
    } else if (qType === 1) {
      // Conceptual MCQ
      const pool = [
        {
          q: "A nurse uses a thin needle instead of a thick one. Why does this help the needle pierce skin more easily?",
          options: ["Less force needed", "Smaller area increases pressure", "Larger area increases pressure", "The needle is lighter"],
          correct: 1,
          working: "A smaller cross-sectional area concentrates the applied force, resulting in a much higher pressure (P = F/A) to pierce the skin."
        },
        {
          q: "Which change would decrease the pressure on a surface?",
          options: ["Increase force, keep area same", "Decrease area, keep force same", "Increase area, keep force same", "Decrease force and area equally"],
          correct: 2,
          working: "Increasing the area spreads the force over a larger contact surface, reducing the pressure."
        }
      ];
      const selected = pool[index % pool.length];
      return {
        topic: 'Foundations',
        type: 'mcq',
        question: selected.q,
        options: selected.options,
        correctAnswer: selected.correct,
        working: selected.working
      };
    } else {
      // Applied context MCQ
      const weight = this.getRandomInt(150, 600, 50);
      const area = parseFloat((this.getRandomFloat(0.0002, 0.0006)).toFixed(4));
      const P = Math.round(weight / area);

      return {
        topic: 'Foundations',
        type: 'mcq',
        question: `A woman of weight ${weight} N stands on one stiletto heel of contact area ${area} m². What is the pressure exerted on the floor?`,
        options: [
          `${(P * 2).toLocaleString()} Pa`,
          `${Math.round(P / 2).toLocaleString()} Pa`,
          `${P.toLocaleString()} Pa`,
          `${Math.round(weight * area).toLocaleString()} Pa`
        ],
        correctAnswer: 2,
        working: `<p><strong>Given:</strong> Force F = ${weight} N, Area A = ${area} m²</p>
                  <p><strong>Formula:</strong> P = F / A</p>
                  <p><strong>Calculation:</strong> P = ${weight} ÷ ${area} = ${P.toLocaleString()} Pa</p>`
      };
    }
  }

  generateHydraulicsQuestion(index) {
    const qType = index % 3;
    if (qType === 0) {
      // Calculate force multiplier / Piston math
      const F1 = this.getRandomInt(20, 200, 10);
      const A1 = parseFloat((this.getRandomFloat(0.002, 0.020)).toFixed(3));
      const A2 = parseFloat((this.getRandomFloat(0.020, 0.200)).toFixed(3));
      const P = Math.round(F1 / A1);
      const F2 = Math.round(P * A2);

      const rand = this.getRandomInt(0, 2, 1);
      if (rand === 0) {
        return {
          topic: 'Hydraulics',
          type: 'numeric',
          question: `In a hydraulic system, a force of ${F1} N is applied to the small input piston of area ${A1} m². Find the output force F₂ on the large piston of area ${A2} m².`,
          correctAnswer: F1 * (A2 / A1),
          unit: 'N',
          working: `<p><strong>Given:</strong> F₁ = ${F1} N, A₁ = ${A1} m², A₂ = ${A2} m²</p>
                    <p><strong>Formula:</strong> F₂ = F₁ × (A₂ / A₁)</p>
                    <p><strong>Calculation:</strong> F₂ = ${F1} × (${A2} ÷ ${A1}) = ${(F1 * (A2 / A1)).toFixed(2)} N</p>`
        };
      } else if (rand === 1) {
        return {
          topic: 'Hydraulics',
          type: 'numeric',
          question: `A hydraulic lift requires an output force of ${F2} N to support a platform. Piston 1 has an area of ${A1} m² and Piston 2 has an area of ${A2} m². What input force F₁ is required?`,
          correctAnswer: F2 * (A1 / A2),
          unit: 'N',
          working: `<p><strong>Given:</strong> F₂ = ${F2} N, A₁ = ${A1} m², A₂ = ${A2} m²</p>
                    <p><strong>Formula:</strong> F₁ = F₂ × (A₁ / A₂)</p>
                    <p><strong>Calculation:</strong> F₁ = ${F2} × (${A1} ÷ ${A2}) = ${(F2 * (A1 / A2)).toFixed(2)} N</p>`
        };
      } else {
        return {
          topic: 'Hydraulics',
          type: 'numeric',
          question: `Calculate the uniform fluid pressure inside a hydraulic pipe system when a piston of area ${A1} m² is pushed with a force of ${F1} N.`,
          correctAnswer: F1 / A1,
          unit: 'Pa',
          working: `<p><strong>Given:</strong> Force F₁ = ${F1} N, Area A₁ = ${A1} m²</p>
                    <p><strong>Pascal's Principle:</strong> P = F₁ / A₁</p>
                    <p><strong>Calculation:</strong> P = ${F1} ÷ ${A1} = ${(F1 / A1).toFixed(1)} Pa</p>`
        };
      }
    } else if (qType === 1) {
      // MCQ Conceptual
      const pool = [
        {
          q: "What principle explains how a small force on a small piston can lift a heavy car?",
          options: ["Newton's Third Law", "Pascal's Principle", "Archimedes' Principle", "Hooke's Law"],
          correct: 1,
          working: "Pascal's Principle states that pressure applied to an enclosed fluid is transmitted equally in all directions throughout the fluid."
        },
        {
          q: "Why must hydraulic systems use an incompressible fluid (oil/water) instead of air?",
          options: ["Air is too heavy", "Air is corrosive", "Gases compress easily, reducing force transfer", "Liquids have less friction"],
          correct: 2,
          working: "If a gas is used, the applied force would compress the gas first, absorbing energy and failing to transmit pressure instantly to the output piston."
        }
      ];
      const selected = pool[index % pool.length];
      return {
        topic: 'Hydraulics',
        type: 'mcq',
        question: selected.q,
        options: selected.options,
        correctAnswer: selected.correct,
        working: selected.working
      };
    } else {
      // Applied MCQ with randomized values
      const A1 = parseFloat((this.getRandomFloat(0.005, 0.015)).toFixed(3));
      const A2 = parseFloat((A1 * this.getRandomInt(5, 12, 1)).toFixed(3));
      const multiplier = Math.round(A2 / A1);
      
      return {
        topic: 'Hydraulics',
        type: 'mcq',
        question: `In a car hydraulic braking system, the input master piston has an area of ${A1} m² and the output slave piston has an area of ${A2} m². By what factor is the input force multiplied?`,
        options: [
          `${(multiplier * 2)}x`,
          `${multiplier}x`,
          `1 / ${multiplier}x`,
          `${(multiplier * 10)}x`
        ],
        correctAnswer: 1,
        working: `<p><strong>Given:</strong> Area A₁ = ${A1} m², Area A₂ = ${A2} m²</p>
                  <p><strong>Multiplier Ratio:</strong> Force Multiplication = A₂ / A₁</p>
                  <p><strong>Calculation:</strong> ${A2} ÷ ${A1} = ${multiplier} times.</p>`
      };
    }
  }

  generateLiquidQuestion(index) {
    const qType = index % 3;
    if (qType === 0) {
      // Calculate P = hρg
      const h = parseFloat((this.getRandomFloat(0.5, 8.0)).toFixed(1));
      const rho = this.getRandomInt(800, 13600, 100);
      const g = 10;
      const P = Math.round(h * rho * g);

      return {
        topic: 'Liquid',
        type: 'numeric',
        question: `A column of liquid has density ${rho.toLocaleString()} kg/m³ and height ${h} m. Compute the liquid pressure exerted at its base. (Take g = 10 N/kg)`,
        correctAnswer: h * rho * g,
        unit: 'Pa',
        working: `<p><strong>Given:</strong> h = ${h} m, ρ = ${rho.toLocaleString()} kg/m³, g = 10 N/kg</p>
                  <p><strong>Formula:</strong> P = hρg</p>
                  <p><strong>Calculation:</strong> P = ${h} × ${rho} × 10 = ${(h * rho * g).toLocaleString()} Pa</p>`
      };
    } else if (qType === 1) {
      // Calculate rho = m / V
      const V = parseFloat((this.getRandomFloat(0.001, 0.020)).toFixed(3));
      const m = parseFloat((this.getRandomFloat(0.5, 20.0)).toFixed(1));

      return {
        topic: 'Liquid',
        type: 'numeric',
        question: `A liquid sample of mass ${m} kg occupies a container volume of ${V} m³. What is the density of the liquid?`,
        correctAnswer: m / V,
        unit: 'kg/m³',
        working: `<p><strong>Given:</strong> Mass m = ${m} kg, Volume V = ${V} m³</p>
                  <p><strong>Formula:</strong> Density ρ = m / V</p>
                  <p><strong>Calculation:</strong> ρ = ${m} ÷ ${V} = ${(m / V).toFixed(2)} kg/m³</p>`
      };
    } else {
      // Conceptual MCQ
      const pool = [
        {
          q: "At which point in a swimming pool is water pressure greatest?",
          options: ["At the surface", "At the shallow end", "At the deepest point", "Same throughout"],
          correct: 2,
          working: "Since liquid pressure P = hρg, pressure is directly proportional to the depth (h) from the surface. The deepest point experiences the highest pressure."
        },
        {
          q: "Two liquids of different densities are at the same depth. Which has greater pressure?",
          options: ["The less dense one", "The denser one", "Both equal", "Depends on container shape"],
          correct: 1,
          working: "Liquid pressure depends directly on density (ρ). For the same depth, the denser liquid will exert greater pressure."
        },
        {
          q: "Why does a submarine hull need to be stronger at greater depths?",
          options: ["Water is colder", "Pressure increases with depth", "Water density increases", "Gravity is stronger"],
          correct: 1,
          working: "As depth increases, the weight of the water column above increases, increasing the liquid pressure acting inwards on the hull."
        }
      ];
      const selected = pool[index % pool.length];
      return {
        topic: 'Liquid',
        type: 'mcq',
        question: selected.q,
        options: selected.options,
        correctAnswer: selected.correct,
        working: selected.working
      };
    }
  }

  generateAtmosphericQuestion(index) {
    const qType = index % 3;
    if (qType === 0) {
      // Barometer column height
      const h_mm = this.getRandomInt(720, 780, 5);
      const h_m = h_mm / 1000;
      const rho = 13600;
      const g = 10;
      const Pa = Math.round(h_m * rho * g);

      const rand = this.getRandomInt(0, 1, 1);
      if (rand === 0) {
        return {
          topic: 'Atmospheric',
          type: 'numeric',
          question: `A mercury barometer shows a vertical column height of ${h_mm} mm. Calculate atmospheric pressure. (Density of mercury = 13,600 kg/m³, g = 10 N/kg)`,
          correctAnswer: (h_mm / 1000) * 13600 * 10,
          unit: 'Pa',
          working: `<p><strong>Given:</strong> h = ${h_mm} mm = ${h_m} m, ρ = 13,600 kg/m³, g = 10 N/kg</p>
                    <p><strong>Formula:</strong> Pₐ = hρg</p>
                    <p><strong>Calculation:</strong> Pₐ = ${h_m} × 13,600 × 10 = ${((h_mm / 1000) * 13600 * 10).toLocaleString()} Pa</p>`
        };
      } else {
        return {
          topic: 'Atmospheric',
          type: 'numeric',
          question: `If atmospheric pressure is ${Pa.toLocaleString()} Pa, what is the mercury height in a barometer? (Density of mercury = 13,600 kg/m³, g = 10 N/kg)`,
          correctAnswer: (Pa / (13600 * 10)) * 1000,
          unit: 'mm',
          working: `<p><strong>Given:</strong> Pₐ = ${Pa.toLocaleString()} Pa, ρ = 13,600 kg/m³, g = 10 N/kg</p>
                    <p><strong>Formula:</strong> h = Pₐ / (ρg)</p>
                    <p><strong>Calculation:</strong> h = ${Pa} ÷ (13,600 × 10) = ${(Pa / (13600 * 10)).toFixed(4)} m = ${((Pa / (13600 * 10)) * 1000).toFixed(1)} mm</p>`
        };
      }
    } else if (qType === 1) {
      // Manometer readings
      const Pa = this.getRandomInt(99000, 102000, 1000);
      const h_mm = this.getRandomInt(20, 150, 10);
      const h_m = h_mm / 1000;
      const rho = 13600;
      const g = 10;
      const pDiff = Math.round(h_m * rho * g);

      const above = index % 2 === 0;
      const Pgas = above ? Pa + pDiff : Pa - pDiff;

      return {
        topic: 'Atmospheric',
        type: 'numeric',
        question: above 
          ? `A manometer connected to a gas container has its atmospheric side mercury level ${h_mm} mm higher than the gas side. Find the absolute gas pressure if Pₐ = ${Pa.toLocaleString()} Pa. (Density of mercury = 13,600 kg/m³, g = 10 N/kg)`
          : `A manometer shows the gas side mercury level is ${h_mm} mm higher than the atmospheric side. Find the absolute gas pressure if Pₐ = ${Pa.toLocaleString()} Pa. (Density of mercury = 13,600 kg/m³, g = 10 N/kg)`,
        correctAnswer: above ? Pa + (h_mm / 1000) * 13600 * 10 : Pa - (h_mm / 1000) * 13600 * 10,
        unit: 'Pa',
        working: `<p><strong>Given:</strong> Atmospheric Pressure Pₐ = ${Pa.toLocaleString()} Pa, height diff h = ${h_mm} mm = ${h_m} m</p>
                  <p><strong>Difference pressure (hρg):</strong> ${h_m} × 13,600 × 10 = ${((h_mm / 1000) * 13600 * 10).toLocaleString()} Pa</p>
                  <p><strong>Formula:</strong> ${above ? 'Pgas = Pₐ + hρg' : 'Pgas = Pₐ - hρg'}</p>
                  <p><strong>Calculation:</strong> ${above ? `${Pa.toLocaleString()} + ${((h_mm / 1000) * 13600 * 10).toLocaleString()} = ${(Pa + (h_mm / 1000) * 13600 * 10).toLocaleString()} Pa` : `${Pa.toLocaleString()} - ${((h_mm / 1000) * 13600 * 10).toLocaleString()} = ${(Pa - (h_mm / 1000) * 13600 * 10).toLocaleString()} Pa`}</p>`
      };
    } else {
      // MCQ Conceptual
      const pool = [
        {
          q: "A barometer is taken to the top of a high mountain. What happens to the mercury column height?",
          options: ["Increases", "Stays the same", "Decreases", "Drops to zero"],
          correct: 2,
          working: "At higher altitudes, atmospheric pressure is lower because there is less air above. Thus, the column height decreases."
        },
        {
          q: "The manometer shows the gas-side mercury is pushed down by 50 mm. Gas pressure is ___ atmospheric pressure.",
          options: ["equal to", "below", "above", "double"],
          correct: 2,
          working: "Since the gas pushed the mercury down, it means the gas pressure is greater than the atmospheric pressure pushing down on the other side."
        },
        {
          q: "What is the space above the mercury in a barometer tube filled with?",
          options: ["Air", "Vacuum", "Nitrogen", "Water vapour"],
          correct: 1,
          working: "The space at the top of a barometer tube is a vacuum (effectively zero pressure). If air gets in, it pushes down on the mercury column, causing a false low reading."
        }
      ];
      const selected = pool[index % pool.length];
      return {
        topic: 'Atmospheric',
        type: 'mcq',
        question: selected.q,
        options: selected.options,
        correctAnswer: selected.correct,
        working: selected.working
      };
    }
  }

  showQuestion() {
    this.currentQuiz.hasChecked = false;
    document.getElementById('quiz-feedback-pane').style.display = 'none';
    
    const question = this.currentQuiz.questions[this.currentQuiz.currentIndex];
    const totalQ = this.currentQuiz.questions.length;
    
    document.getElementById('quiz-progress-text').innerText = `Question ${this.currentQuiz.currentIndex + 1} of ${totalQ}`;
    document.getElementById('quiz-progress-bar').style.width = `${((this.currentQuiz.currentIndex) / totalQ) * 100}%`;

    const container = document.getElementById('quiz-question-card');
    container.className = `question-card card-${question.topic.toLowerCase()}`;

    let answersHtml = '';
    if (question.type === 'mcq') {
      answersHtml = `
        <div class="mcq-options">
          ${question.options.map((opt, idx) => `
            <button class="mcq-option" onclick="app.selectMCQOption(${idx})">
              <span class="mcq-label">${String.fromCharCode(65 + idx)}</span>
              <span>${opt}</span>
            </button>
          `).join('')}
        </div>
      `;
    } else {
      answersHtml = `
        <div class="numeric-input-container">
          <input type="text" class="numeric-input" id="quiz-numeric-answer" placeholder="Enter value and unit (e.g. 500 Pa)" onkeydown="if(event.key==='Enter') app.checkAnswer()" style="max-width: 500px; margin: 0 auto; display: block;">
        </div>
      `;
    }

    container.innerHTML = `
      <span class="question-topic-tag tag-${question.topic.toLowerCase()}">${question.topic}</span>
      <div class="question-number">Question ${this.currentQuiz.currentIndex + 1}</div>
      <div class="question-text">${question.question}</div>
      ${answersHtml}
      <div class="quiz-actions" id="quiz-check-action-bar">
        <button class="btn-check" onclick="app.checkAnswer()">Check Answer</button>
      </div>
    `;
  }

  selectMCQOption(idx) {
    if (this.currentQuiz.hasChecked) return;
    
    document.querySelectorAll('.mcq-option').forEach(el => el.classList.remove('selected'));
    const opts = document.querySelectorAll('.mcq-option');
    if (opts[idx]) {
      opts[idx].classList.add('selected');
      this.currentQuiz.selectedMCQIndex = idx;
    }
  }

  normalizeUnit(u) {
    let s = u.trim().toLowerCase().replace(/\s+/g, '');
    s = s.replace(/[\^·*•]/g, '');
    s = s.replace(/²/g, '2').replace(/³/g, '3').replace(/⁻²/g, '-2').replace(/⁻³/g, '-3');
    
    if (s === 'pa' || s === 'n/m2' || s === 'n/msq' || s === 'nm-2' || s === 'newtonpermetersquared') {
      return 'pa';
    }
    if (s === 'n' || s === 'newton' || s === 'newtons') {
      return 'n';
    }
    if (s === 'm2' || s === 'm²' || s === 'metersquared' || s === 'sqm') {
      return 'm2';
    }
    if (s === 'kg/m3' || s === 'kg/m³' || s === 'kgm-3' || s === 'kgm3') {
      return 'kg/m3';
    }
    if (s === 'mm' || s === 'millimeter' || s === 'millimeters') {
      return 'mm';
    }
    return s;
  }

  checkAnswer() {
    if (this.currentQuiz.hasChecked) return;

    const question = this.currentQuiz.questions[this.currentQuiz.currentIndex];
    let isCorrect = false;
    let studentAnswer = '';

    if (question.type === 'mcq') {
      if (this.currentQuiz.selectedMCQIndex === undefined) {
        alert("Please select an option first!");
        return;
      }
      isCorrect = (this.currentQuiz.selectedMCQIndex === question.correctAnswer);
      studentAnswer = String.fromCharCode(65 + this.currentQuiz.selectedMCQIndex);
    } else {
      const input = document.getElementById('quiz-numeric-answer');
      const valStrRaw = input.value.trim();
      const match = valStrRaw.match(/^([0-9.-]+)\s*(.*)$/);
      
      if (!match) {
        alert("Please enter a numerical value followed by the unit (e.g. 500 Pa)!");
        return;
      }
      
      const valStr = match[1];
      const unitStr = match[2];

      if (valStr === "" || unitStr === "") {
        alert("Please enter both the numerical value and the unit (e.g. 500 Pa)!");
        return;
      }

      const val = parseFloat(valStr);
      if (isNaN(val)) {
        alert("Please enter a valid numeric value!");
        return;
      }

      // Find decimal places entered by user
      const dotIdx = valStr.indexOf('.');
      let dp = 0;
      if (dotIdx !== -1) {
        dp = valStr.length - dotIdx - 1;
      }
      dp = Math.max(0, Math.min(4, dp));

      // Check numerical value rounded to the entered decimal places
      const targetRounded = parseFloat(question.correctAnswer.toFixed(dp));
      const valRounded = parseFloat(val.toFixed(dp));
      const numMatch = Math.abs(valRounded - targetRounded) < 0.0001;

      // Check unit
      const unitMatch = this.normalizeUnit(unitStr) === this.normalizeUnit(question.unit);

      isCorrect = numMatch && unitMatch;
      studentAnswer = `${valStr} ${unitStr}`;
    }

    this.currentQuiz.hasChecked = true;

    // Track score & topic progress
    this.sessionState.overallTotal++;
    this.sessionState.topicProgress[question.topic].completed++;

    if (isCorrect) {
      this.currentQuiz.score++;
      this.currentQuiz.topicScores[question.topic]++;
      this.sessionState.overallCorrect++;
      this.sessionState.topicProgress[question.topic].correct++;
      this.triggerCorrectEffects();
    } else {
      this.triggerWrongEffects();
    }

    this.saveSession();

    // Render feedback panel
    const feedbackPane = document.getElementById('quiz-feedback-pane');
    const fTitle = document.getElementById('feedback-pane-title');
    const fWorking = document.getElementById('feedback-pane-working');

    if (isCorrect) {
      feedbackPane.className = 'feedback-overlay correct';
      fTitle.innerHTML = `<i class="fa-solid fa-circle-check"></i> Correct!`;
      fWorking.innerHTML = `<p>Excellent job. Your answer is correct.</p>${question.working || ''}`;
    } else {
      feedbackPane.className = 'feedback-overlay wrong';
      fTitle.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> Incorrect`;
      
      let correctDisplay = question.type === 'mcq' 
        ? `<strong>${String.fromCharCode(65 + question.correctAnswer)}. ${question.options[question.correctAnswer]}</strong>` 
        : `<strong>${question.correctAnswer} ${question.unit}</strong>`;

      fWorking.innerHTML = `
        <p>Your answer: <strong>${studentAnswer}</strong>. Correct answer: ${correctDisplay}</p>
        <div style="margin-top:12px; padding-top:12px; border-top:1px solid rgba(255,255,255,0.08);">
          ${question.working || ''}
        </div>
      `;
    }

    // Hide the check button container
    document.getElementById('quiz-check-action-bar').style.display = 'none';
    feedbackPane.style.display = 'block';

    // Auto-scroll to feedback on mobile
    feedbackPane.scrollIntoView({ behavior: 'smooth' });
  }

  nextQuestion() {
    this.currentQuiz.currentIndex++;
    this.currentQuiz.selectedMCQIndex = undefined;

    if (this.currentQuiz.currentIndex < this.currentQuiz.questions.length) {
      this.showQuestion();
    } else {
      this.showScoreCard();
    }
  }

  triggerCorrectEffects() {
    // Canvas burst
    this.confettiActive = true;
    for (let i = 0; i < 60; i++) {
      this.confettiParticles.push(this.createConfettiParticle());
    }
  }

  triggerWrongEffects() {
    const card = document.getElementById('quiz-question-card');
    card.classList.add('shake');
    setTimeout(() => {
      card.classList.remove('shake');
    }, 500);
  }

  // SECTION 4: SCORE CARD
  showScoreCard() {
    const total = this.currentQuiz.questions.length;
    const score = this.currentQuiz.score;
    const pct = (score / total) * 100;

    document.getElementById('score-value').innerHTML = `${score}<span>/${total}</span>`;

    // Stars
    const starsContainer = document.getElementById('score-stars');
    let starCount = 1;
    if (pct >= 80) starCount = 3;
    else if (pct >= 50) starCount = 2;

    let starsHtml = '';
    for (let i = 1; i <= 3; i++) {
      starsHtml += `<i class="fa-solid fa-star ${i <= starCount ? 'star-gold' : 'star-gray'}"></i>`;
    }
    starsContainer.innerHTML = starsHtml;

    // Messages
    let msg = '';
    if (pct < 50) {
      msg = "More revision needed — use the formula sheet and topic flashcards before retrying.";
    } else if (pct < 80) {
      msg = "Good effort! Focus on your weakest topic before the next attempt.";
    } else {
      msg = "Outstanding! You're ready for Pressure questions in your O-Level exam.";
    }
    document.getElementById('score-message').innerText = msg;

    // Breakdown scores
    const counts = this.getTopicCounts();
    document.getElementById('breakdown-foundations').innerText = `${this.currentQuiz.topicScores.Foundations}/${counts.Foundations}`;
    document.getElementById('breakdown-hydraulics').innerText = `${this.currentQuiz.topicScores.Hydraulics}/${counts.Hydraulics}`;
    document.getElementById('breakdown-liquid').innerText = `${this.currentQuiz.topicScores.Liquid}/${counts.Liquid}`;
    document.getElementById('breakdown-atmospheric').innerText = `${this.currentQuiz.topicScores.Atmospheric}/${counts.Atmospheric}`;

    // Highlight weakest topic
    this.highlightWeakestTopic(counts);

    this.navigateTo('score');
  }

  getTopicCounts() {
    const counts = { Foundations: 0, Hydraulics: 0, Liquid: 0, Atmospheric: 0 };
    this.currentQuiz.questions.forEach(q => {
      counts[q.topic]++;
    });
    return counts;
  }

  highlightWeakestTopic(counts) {
    const topics = ['Foundations', 'Hydraulics', 'Liquid', 'Atmospheric'];
    let weakest = null;
    let minPct = 101;

    topics.forEach(t => {
      if (counts[t] > 0) {
        const pct = (this.currentQuiz.topicScores[t] / counts[t]) * 100;
        if (pct < minPct) {
          minPct = pct;
          weakest = t;
        }
      }
    });

    const banner = document.getElementById('weakest-topic-banner');
    if (weakest && minPct < 90) {
      // Highlight topic display names
      const displayNames = {
        Foundations: 'Pressure Foundations (P = F/A)',
        Hydraulics: "Pascal's Hydraulic Systems",
        Liquid: 'Liquid Pressure & Density',
        Atmospheric: 'Barometers & Manometers'
      };
      document.getElementById('weakest-topic-text').innerText = `You struggled most with ${displayNames[weakest]}. Tap here to revise.`;
      banner.style.display = 'flex';
      this.weakestTopicName = weakest;
    } else {
      banner.style.display = 'none';
    }
  }

  reviseWeakestTopic() {
    if (this.weakestTopicName) {
      this.jumpToFlashcards(this.weakestTopicName);
    }
  }

  jumpToFlashcards(topic) {
    this.navigateTo('flashcards');
    this.filterFlashcards(topic);
  }

  // SECTION 5: FLASHCARDS
  initializeFlashcards() {
    return [
      { id: 1, topic: 'Foundations', q: "What is the formula for Pressure?", a: "P = F ÷ A (Pressure = Force / Area)" },
      { id: 2, topic: 'Foundations', q: "What is the SI unit of Pressure?", a: "Pascal (Pa), equivalent to 1 N/m²" },
      { id: 3, topic: 'Foundations', q: "How do you increase pressure without altering the applied force?", a: "Decrease the contact area (since P ∝ 1/A)" },
      { id: 4, topic: 'Foundations', q: "Why do sharp knives cut materials easily compared to dull ones?", a: "The extremely small surface area of the blade edge produces very high pressure for the same cutting force, piercing fibers easily." },
      { id: 5, topic: 'Foundations', q: "If the force acting on a piston doubles and the area halves, what happens to the pressure?", a: "The pressure quadruples (multiplied by 4: P = 2F / 0.5A = 4 P_initial)" },
      
      { id: 6, topic: 'Hydraulics', q: "What is Pascal's Principle?", a: "Pressure applied to any point in an enclosed fluid is transmitted equally and undiminished to all parts of the fluid." },
      { id: 7, topic: 'Hydraulics', q: "State the hydraulic press transmission ratio formula.", a: "P₁ = P₂  ⇒  F₁ ÷ A₁ = F₂ ÷ A₂" },
      { id: 8, topic: 'Hydraulics', q: "Why must hydraulic systems be filled with liquid rather than gas?", a: "Gases are highly compressible. Applied force would compress the gas volume instead of transmitting pressure equally." },
      { id: 9, topic: 'Hydraulics', q: "If output piston area A₂ is 8 times input area A₁, how is the output force affected?", a: "The output force is multiplied: F₂ = 8 × F₁ (Force is magnified 8 times)" },
      { id: 10, topic: 'Hydraulics', q: "List two common applications of hydraulic systems.", a: "Car brake pads, hydraulic jacks/lifts, hydraulic dentist chairs, excavator arms." },

      { id: 11, topic: 'Liquid', q: "What is the formula for liquid pressure?", a: "P = hρg (height/depth × density × gravitational field strength)" },
      { id: 12, topic: 'Liquid', q: "What is the formula for density?", a: "ρ = m ÷ V (Density = Mass / Volume)" },
      { id: 13, topic: 'Liquid', q: "Does the liquid pressure at a certain depth depend on the shape of the container?", a: "No. It depends solely on depth (h), density (ρ), and g, not container geometry." },
      { id: 14, topic: 'Liquid', q: "State the standard density of mercury.", a: "13,600 kg/m³ (about 13.6 times denser than fresh water)" },
      { id: 15, topic: 'Liquid', q: "Compute pressure for h = 4 m, ρ = 1000 kg/m³, g = 10 N/kg.", a: "P = 4 × 1000 × 10 = 40,000 Pa (or 40 kPa)" },

      { id: 16, topic: 'Atmospheric', q: "What is the value of standard atmospheric pressure in Pascals and mmHg?", a: "101,325 Pa (≈ 101 kPa) or 760 mmHg" },
      { id: 17, topic: 'Atmospheric', q: "What occupies the space above the mercury in a standard barometer?", a: "A vacuum (virtually zero pressure, P = 0)" },
      { id: 18, topic: 'Atmospheric', q: "Why is mercury used instead of water in barometers?", a: "Mercury is 13.6 times denser. A water barometer would require a column taller than 10 meters, compared to just 760 mm for mercury." },
      { id: 19, topic: 'Atmospheric', q: "In a manometer, if the mercury level on the gas container side is lower than the atmospheric side, what does it signify?", a: "The gas pressure is ABOVE atmospheric pressure (Pgas = Pₐ + hρg)" },
      { id: 20, topic: 'Atmospheric', q: "State the manometer formula when gas pressure is lower than atmospheric pressure.", a: "Pgas = Pₐ - hρg" }
    ];
  }

  filterFlashcards(topic) {
    this.currentFlashcardFilter = topic;
    
    // Update filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    const activeBtn = document.querySelector(`.filter-btn.${topic.toLowerCase()}`);
    if (activeBtn) activeBtn.classList.add('active');

    this.resetFlashcardSession();
  }

  resetFlashcardSession() {
    const topic = this.currentFlashcardFilter;
    if (topic === 'all') {
      this.activeFlashcards = [...this.sessionState.flashcards];
    } else {
      this.activeFlashcards = this.sessionState.flashcards.filter(c => c.topic === topic);
    }
    
    this.currentFlashcardIndex = 0;
    
    document.getElementById('flashcards-deck-view').style.display = 'block';
    document.getElementById('flashcards-empty-view').style.display = 'none';

    this.updateFlashcardDisplay();
  }

  flipFlashcard() {
    const el = document.getElementById('interactive-flashcard');
    el.classList.toggle('flipped');
  }

  updateFlashcardDisplay() {
    if (this.activeFlashcards.length === 0) {
      document.getElementById('flashcards-deck-view').style.display = 'none';
      document.getElementById('flashcards-empty-view').style.display = 'block';
      return;
    }

    const card = this.activeFlashcards[this.currentFlashcardIndex];
    const cardEl = document.getElementById('interactive-flashcard');
    
    // Reset flip
    cardEl.classList.remove('flipped');
    cardEl.className = `flashcard-perspective ${card.topic.toLowerCase()}`;

    // Update index info
    document.getElementById('flashcard-deck-index').innerText = this.currentFlashcardIndex + 1;
    document.getElementById('flashcard-deck-total').innerText = this.activeFlashcards.length;
    document.getElementById('flashcard-remaining-review').innerText = this.activeFlashcards.length - this.currentFlashcardIndex;

    // Set text
    document.getElementById('card-topic-tag').innerText = card.topic;
    document.getElementById('card-topic-tag-back').innerText = card.topic;
    document.getElementById('card-front-text').innerText = card.q;
    document.getElementById('card-back-text').innerText = card.a;
  }

  handleFlashcardResponse(gotIt, event) {
    if (event) event.stopPropagation(); // Stop click bubbling to flip

    if (gotIt) {
      // Remove card from list
      this.activeFlashcards.splice(this.currentFlashcardIndex, 1);
      // Stay on same index unless out of range
      if (this.currentFlashcardIndex >= this.activeFlashcards.length) {
        this.currentFlashcardIndex = 0;
      }
    } else {
      // Keep card, advance to next index
      this.currentFlashcardIndex = (this.currentFlashcardIndex + 1) % this.activeFlashcards.length;
    }

    this.updateFlashcardDisplay();
  }

  // UTILITIES
  getRandomInt(min, max, step = 1) {
    const range = (max - min) / step;
    return min + Math.floor(Math.random() * (range + 1)) * step;
  }

  getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
  }

  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // CONFETTI ENGINE
  setupConfetti() {
    const canvas = document.getElementById('canvas-confetti');
    const ctx = canvas.getContext('2d');
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (this.confettiActive) {
        this.confettiParticles.forEach((p, idx) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += p.gravity;
          p.rotation += p.vRotation;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
          ctx.restore();

          // remove offscreen
          if (p.y > canvas.height) {
            this.confettiParticles.splice(idx, 1);
          }
        });

        if (this.confettiParticles.length === 0) {
          this.confettiActive = false;
        }
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  createConfettiParticle() {
    const colors = [
      '#00F5FF', // foundations
      '#FF6B00', // hydraulics
      '#00F5D4', // liquid
      '#FFD700', // atmospheric
      '#FF007F'  // secondary highlight
    ];
    return {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2 - 50,
      vx: (Math.random() - 0.5) * 15,
      vy: (Math.random() - 0.7) * 15 - 5,
      gravity: 0.3,
      w: Math.random() * 8 + 6,
      h: Math.random() * 12 + 6,
      rotation: Math.random() * Math.PI * 2,
      vRotation: (Math.random() - 0.5) * 0.2,
      color: colors[Math.floor(Math.random() * colors.length)]
    };
  }
}

// Global App Instance
const app = new PressureApp();
window.addEventListener('DOMContentLoaded', () => {
  app.init();
});
