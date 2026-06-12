// Kinetic Particle Model of Matter (Syllabus 6091) - SPA Core

// --- State Management ---
const AppState = {
  currentTab: 'particles',
  particlesState: 'solid',
  bondsState: 'solid',
  smokeShowAir: false,
  pollenShowWater: false,
  smokeShowTrail: true,
  pollenShowTrail: true,
  flashcards: [],
  currentCardIndex: 0,
  quizPool: [],
  currentQuizQuestions: [],
  currentQuestionIndex: 0,
  userScore: 0,
  quizAnswers: [], // { question, selected, correct, options }
  animationFrameIds: {} // Active requestAnimationFrame IDs per canvas
};

// --- DOM References ---
const DOM = {
  tabs: document.querySelectorAll('.nav-item'),
  sections: document.querySelectorAll('.tab-content'),
  particleControls: document.querySelectorAll('#section-particles .toggle-btn'),
  bondControls: document.querySelectorAll('#section-bonds .toggle-btn'),
  descParticles: document.getElementById('desc-particles'),
  labelForceStrength: document.getElementById('label-force-strength'),
  btnToggleAirSmoke: document.getElementById('toggle-air-smoke'),
  btnToggleWaterPollen: document.getElementById('toggle-water-pollen'),
  btnToggleTrailSmoke: document.getElementById('toggle-trail-smoke'),
  btnToggleTrailPollen: document.getElementById('toggle-trail-pollen'),
  
  // Flashcards
  cardElement: document.getElementById('current-card'),
  cardFrontText: document.getElementById('front-text'),
  cardBackText: document.getElementById('back-text'),
  cardCounter: document.getElementById('card-counter'),
  btnPrevCard: document.getElementById('btn-prev-card'),
  btnNextCard: document.getElementById('btn-next-card'),
  btnShuffleCards: document.getElementById('btn-shuffle-cards'),
  
  // Quiz
  quizStartScreen: document.getElementById('quiz-start-screen'),
  quizQuestionScreen: document.getElementById('quiz-question-screen'),
  quizResultScreen: document.getElementById('quiz-result-screen'),
  btnStartQuiz: document.getElementById('btn-start-quiz'),
  btnRetryQuiz: document.getElementById('btn-retry-quiz'),
  quizProgress: document.getElementById('quiz-progress'),
  quizProgressFill: document.getElementById('quiz-progress-fill'),
  quizQuestionText: document.getElementById('quiz-question-text'),
  quizOptions: document.getElementById('quiz-options'),
  scoreNumber: document.getElementById('score-number'),
  resultFeedbackText: document.getElementById('result-feedback-text'),
  wrongReviewContainer: document.getElementById('wrong-review-container'),
  wrongAnswersList: document.getElementById('wrong-answers-list'),
  
  // Canvases
  canvasParticles: document.getElementById('canvas-particles'),
  canvasBonds: document.getElementById('canvas-bonds'),
  canvasSmoke: document.getElementById('canvas-smoke'),
  canvasPollen: document.getElementById('canvas-pollen'),
  canvasConfetti: document.getElementById('canvas-confetti')
};

// --- DATA: Flashcards ---
const FLASHCARD_DATA = [
  { term: "Kinetic Particle Model", explanation: "All matter is made up of tiny particles that are in constant, random motion." },
  { term: "Solid: Arrangement", explanation: "Particles are arranged in a regular, very closely-packed, orderly pattern." },
  { term: "Solid: Motion", explanation: "Particles vibrate about their fixed positions with very small amplitudes." },
  { term: "Solid: Forces", explanation: "Forces of attraction between particles are very strong, holding them in fixed positions." },
  { term: "Liquid: Arrangement", explanation: "Particles are arranged in an irregular / a disorderly / a random pattern, but still closely packed." },
  { term: "Liquid: Motion", explanation: "Particles slide over one another." },
  { term: "Liquid: Forces", explanation: "Forces between particles are strong, but weaker than in solids, allowing particles to slide over one another." },
  { term: "Gas: Arrangement", explanation: "Particles are very far apart and arranged in an irregular / a disorderly / a random manner." },
  { term: "Gas: Motion", explanation: "Particles move rapidly in random directions, colliding with each other and container walls." },
  { term: "Gas: Forces", explanation: "Forces of attraction between particles are negligible (almost non-existent)." },
  { term: "Compressibility", explanation: "Gases are highly compressible because of large spaces between particles; solids/liquids are incompressible." },
  { term: "Density", explanation: "Mass per unit volume. Solids/liquids have high density (particles closely packed). Gases have very low density." },
  { term: "Brownian Motion", explanation: "The random, zigzag, haphazard motion of suspended particles (like smoke or pollen) in a fluid." },
  { term: "Smoke Cell Experiment", explanation: "Bright specks of smoke are seen moving in random, zigzag paths when viewed under a microscope." },
  { term: "Cause of Smoke Motion", explanation: "Random bombardment of the larger smoke particles by invisible, fast-moving air molecules." },
  { term: "Pollen Grain Experiment", explanation: "Pollen grains suspended in water perform random zigzag motion due to collisions with water molecules." },
  { term: "Evidence from Brownian Motion", explanation: "Provides direct evidence that fluid (air/water) molecules are in continuous, random motion." },
  { term: "Temperature", explanation: "A measure of the average kinetic energy of the particles in a substance. Higher temp = faster particles." },
  { term: "Gas Pressure", explanation: "Caused by gas particles colliding with the walls of the container, exerting a force per unit area." },
  { term: "Effect of Heating Gas", explanation: "Particles gain average kinetic energy, move faster, and collide with walls harder and more frequently, increasing pressure." }
];

// --- DATA: Quiz Pool (30 Syllabus Questions) ---
const QUIZ_QUESTIONS = [
  {
    q: "Which state of matter has particles in a fixed, regular arrangement?",
    o: ["Solid", "Liquid", "Gas", "Plasma"],
    a: "Solid"
  },
  {
    q: "In which state do particles move freely and fill the entire container?",
    o: ["Gas", "Liquid", "Solid", "None of the above"],
    a: "Gas"
  },
  {
    q: "Which state of matter is the least compressible?",
    o: ["Solid", "Liquid", "Gas", "Both Solid and Liquid"],
    a: "Solid"
  },
  {
    q: "Which state of matter typically has the highest density?",
    o: ["Solid", "Liquid", "Gas", "Vacuum"],
    a: "Solid"
  },
  {
    q: "In a solid, the particles —",
    o: ["Vibrate in fixed positions", "Move freely around each other", "Have negligible forces between them", "Move slowly in random paths"],
    a: "Vibrate in fixed positions"
  },
  {
    q: "Which state of matter has the weakest forces of attraction between particles?",
    o: ["Gas", "Liquid", "Solid", "Liquid crystal"],
    a: "Gas"
  },
  {
    q: "A substance has a definite volume but no definite shape. What state is it in?",
    o: ["Liquid", "Solid", "Gas", "Vapor"],
    a: "Liquid"
  },
  {
    q: "Which state has particles that are far apart and moving rapidly in random directions?",
    o: ["Gas", "Liquid", "Solid", "All states"],
    a: "Gas"
  },
  {
    q: "In a liquid, the arrangement of particles is —",
    o: ["Irregular and close together", "Regular and far apart", "Regular and close together", "Irregular and far apart"],
    a: "Irregular and close together"
  },
  {
    q: "Which physical property is the same for both solids and liquids?",
    o: ["Definite volume", "Definite shape", "High compressibility", "Ability to flow"],
    a: "Definite volume"
  },
  {
    q: "Why are gases easily compressible compared to solids?",
    o: ["There are large spaces between gas particles", "Gas particles are soft and squishy", "Forces between gas particles are very strong", "Gas particles move very slowly"],
    a: "There are large spaces between gas particles"
  },
  {
    q: "Which state of matter has the strongest inter-particle forces?",
    o: ["Solid", "Liquid", "Gas", "Superfluid"],
    a: "Solid"
  },
  {
    q: "As a substance changes from solid to liquid, what happens to the arrangement of particles?",
    o: ["It changes from regular to irregular", "It changes from irregular to regular", "Particles become much further apart", "Particles become fixed in new lines"],
    a: "It changes from regular to irregular"
  },
  {
    q: "In which state do particles have the most freedom of movement?",
    o: ["Gas", "Liquid", "Solid", "Liquid and Gas have equal freedom"],
    a: "Gas"
  },
  {
    q: "Which state of matter has a definite shape and a definite volume?",
    o: ["Solid", "Liquid", "Gas", "Both Solid and Liquid"],
    a: "Solid"
  },
  {
    q: "What does Brownian motion provide direct evidence for?",
    o: ["Random, continuous motion of fluid molecules", "Forces holding solid particles together", "The speed of gravity", "Thermal expansion of metal rods"],
    a: "Random, continuous motion of fluid molecules"
  },
  {
    q: "In the smoke cell experiment, what is observed moving in a random, zigzag path?",
    o: ["Bright smoke particles", "Invisible air molecules", "Light beams", "Dust mites"],
    a: "Bright smoke particles"
  },
  {
    q: "Why does the smoke particle move in a zigzag, unpredictable path under a microscope?",
    o: ["It is hit randomly by fast-moving air molecules in all directions.", "It has its own active propulsion", "Convection currents push it in circles", "Gravity acts unevenly on it"],
    a: "It is hit randomly by fast-moving air molecules in all directions."
  },
  {
    q: "In the pollen-in-water experiment, what causes the pollen grain to move randomly?",
    o: ["Collisions with invisible, moving water molecules", "Convection currents inside the water", "Photosynthesis in the pollen grain", "Magnetic fields in water"],
    a: "Collisions with invisible, moving water molecules"
  },
  {
    q: "If air molecules were completely stationary, what would happen to the smoke particles?",
    o: ["They would drift downwards slowly or stay still", "They would move faster", "They would explode", "They would still perform Brownian motion"],
    a: "They would drift downwards slowly or stay still"
  },
  {
    q: "The path of a smoke particle is random because —",
    o: ["Air molecules collide with it unevenly from random directions", "Smoke particles repel each other magnetically", "Gravity keeps changing its pull", "The microscope lens distorts its real path"],
    a: "Air molecules collide with it unevenly from random directions"
  },
  {
    q: "What would happen to Brownian motion if the temperature of the fluid increases?",
    o: ["The motion becomes more vigorous because molecules move faster", "The motion stops completely", "The motion slows down", "The particles group into a solid"],
    a: "The motion becomes more vigorous because molecules move faster"
  },
  {
    q: "Why can we not see the air molecules directly in the smoke cell experiment?",
    o: ["Air molecules are too small to be seen with a light microscope", "Air molecules are transparent to all light", "Air molecules move faster than the speed of light", "Air molecules are not real"],
    a: "Air molecules are too small to be seen with a light microscope"
  },
  {
    q: "The random motion of the pollen grain is evidence that water molecules are —",
    o: ["Moving randomly in all directions", "Stationary and highly packed", "Arranged in perfect rows", "All moving in a single direction"],
    a: "Moving randomly in all directions"
  },
  {
    q: "Which of the following best describes the path of a smoke particle in Brownian motion?",
    o: ["Zigzag and random", "Smooth circular loops", "A straight line down to the bottom", "A perfect sine wave pattern"],
    a: "Zigzag and random"
  },
  {
    q: "When the temperature of a gas increases, what happens to the average speed of its particles?",
    o: ["It increases", "It decreases", "It remains the exact same", "It drops to zero"],
    a: "It increases"
  },
  {
    q: "What does a higher temperature indicate about the particles in a substance?",
    o: ["Higher average kinetic energy of the particles", "Lower average kinetic energy of the particles", "Stronger forces between particles", "More electrons in the atoms"],
    a: "Higher average kinetic energy of the particles"
  },
  {
    q: "Two containers hold the same gas. Container A is hotter than Container B. Which has higher average kinetic energy?",
    o: ["Container A", "Container B", "Both are equal", "Cannot be determined"],
    a: "Container A"
  },
  {
    q: "When a gas is heated in a fixed, rigid container, the pressure increases. Why?",
    o: ["Particles collide with container walls faster and harder", "Particles grow larger in size", "Particles escape from the walls", "Inter-particle forces become stronger"],
    a: "Particles collide with container walls faster and harder"
  },
  {
    q: "Why does gas exert pressure on the walls of its container?",
    o: ["Gas particles collide with the walls", "Gas particles repel the walls magnetically", "Gas particles expand to touch the walls", "The walls pull the gas particles inward"],
    a: "Gas particles collide with the walls"
  }
];

// --- Simulation Physics Engines ---

class Simulation {
  constructor(canvas, type) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.type = type;
    this.particles = [];
    this.smokeParticle = null;
    this.pollenParticle = null;
    this.smokeTrace = [];
    this.pollenTrace = [];
    this.airMolecules = [];
    this.waterMolecules = [];
    this.resizeCanvas();
    this.init();
  }

  resizeCanvas() {
    // Canvas dimensions are fixed to 400x300 for logical pixel rendering
    this.width = 400;
    this.height = 300;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  init() {
    this.particles = [];
    const state = this.type === 'bonds' ? AppState.bondsState : AppState.particlesState;
    
    if (this.type === 'particles' || this.type === 'bonds') {
      if (state === 'solid') {
        const rows = 6;
        const cols = 8;
        const startX = 60;
        const startY = 50;
        const spacingX = 40;
        const spacingY = 40;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            this.particles.push({
              x: startX + c * spacingX,
              y: startY + r * spacingY,
              origX: startX + c * spacingX,
              origY: startY + r * spacingY,
              vx: 0,
              vy: 0,
              radius: 8
            });
          }
        }
      } else if (state === 'liquid') {
        // High density, packed at the bottom but fluid
        const count = 55;
        for (let i = 0; i < count; i++) {
          this.particles.push({
            x: 40 + Math.random() * (this.width - 80),
            y: 120 + Math.random() * (this.height - 150),
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5,
            radius: 8
          });
        }
      } else if (state === 'gas') {
        // Low density, high velocity, random directions
        const count = 15;
        for (let i = 0; i < count; i++) {
          this.particles.push({
            x: 20 + Math.random() * (this.width - 40),
            y: 20 + Math.random() * (this.height - 40),
            vx: (Math.random() - 0.5) * 7,
            vy: (Math.random() - 0.5) * 7,
            radius: 7
          });
        }
      }
    } else if (this.type === 'smoke') {
      // Large smoke particle in center
      this.smokeParticle = {
        x: this.width / 2,
        y: this.height / 2,
        vx: 0,
        vy: 0,
        radius: 12,
        mass: 9 // Reduced mass from 35 to make bombardment effects more prominent
      };
      this.smokeTrace = [];
      // Small fast air molecules
      this.airMolecules = [];
      for (let i = 0; i < 45; i++) {
        this.airMolecules.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          vx: (Math.random() - 0.5) * 14, // Increased speed from 12
          vy: (Math.random() - 0.5) * 14,
          radius: 2.5,
          mass: 1.3 // Increased mass slightly to transfer more momentum
        });
      }
    } else if (this.type === 'pollen') {
      // Large pollen grain in center
      this.pollenParticle = {
        x: this.width / 2,
        y: this.height / 2,
        vx: 0,
        vy: 0,
        radius: 14,
        mass: 10 // Reduced mass from 40 to make bombardment effects more prominent
      };
      this.pollenTrace = [];
      // Small fast water molecules
      this.waterMolecules = [];
      for (let i = 0; i < 50; i++) {
        this.waterMolecules.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          vx: (Math.random() - 0.5) * 12, // Increased velocity slightly
          vy: (Math.random() - 0.5) * 12,
          radius: 3,
          mass: 1.5 // Increased mass slightly to transfer more momentum
        });
      }
    }
  }

  update() {
    const state = this.type === 'bonds' ? AppState.bondsState : AppState.particlesState;

    if (this.type === 'particles' || this.type === 'bonds') {
      if (state === 'solid') {
        // Vibration in fixed positions
        this.particles.forEach(p => {
          const angle = Math.random() * Math.PI * 2;
          const amp = Math.random() * 1.5;
          p.x = p.origX + Math.cos(angle) * amp;
          p.y = p.origY + Math.sin(angle) * amp;
        });
      } else if (state === 'liquid') {
        // Move around each other, keep at lower container section
        this.particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;

          // Gentle boundaries
          if (p.x - p.radius < 10) { p.x = 10 + p.radius; p.vx *= -1; }
          if (p.x + p.radius > this.width - 10) { p.x = this.width - 10 - p.radius; p.vx *= -1; }
          if (p.y - p.radius < 80) { p.y = 80 + p.radius; p.vy *= -1; }
          if (p.y + p.radius > this.height - 10) { p.y = this.height - 10 - p.radius; p.vy *= -1; }

          // Minor random nudge to simulate continuous flow/collisions
          p.vx += (Math.random() - 0.5) * 0.1;
          p.vy += (Math.random() - 0.5) * 0.1;
          // Speed limit
          const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          if (speed > 1.5) {
            p.vx = (p.vx / speed) * 1.5;
            p.vy = (p.vy / speed) * 1.5;
          }
        });

        // Resolve overlaps slightly to look fluid
        for (let i = 0; i < this.particles.length; i++) {
          for (let j = i + 1; j < this.particles.length; j++) {
            const dx = this.particles[j].x - this.particles[i].x;
            const dy = this.particles[j].y - this.particles[i].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = 15; // slightly overlapping but close
            if (dist < minDist && dist > 0) {
              const overlap = minDist - dist;
              const pushX = (dx / dist) * overlap * 0.15;
              const pushY = (dy / dist) * overlap * 0.15;
              this.particles[i].x -= pushX;
              this.particles[i].y -= pushY;
              this.particles[j].x += pushX;
              this.particles[j].y += pushY;
            }
          }
        }
      } else if (state === 'gas') {
        // Fast random motion, bouncing off walls
        this.particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;

          if (p.x - p.radius < 10) { p.x = 10 + p.radius; p.vx *= -1; }
          if (p.x + p.radius > this.width - 10) { p.x = this.width - 10 - p.radius; p.vx *= -1; }
          if (p.y - p.radius < 10) { p.y = 10 + p.radius; p.vy *= -1; }
          if (p.y + p.radius > this.height - 10) { p.y = this.height - 10 - p.radius; p.vy *= -1; }
        });

        // Bouncing off each other (elastic collision)
        for (let i = 0; i < this.particles.length; i++) {
          for (let j = i + 1; j < this.particles.length; j++) {
            const p1 = this.particles[i];
            const p2 = this.particles[j];
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < p1.radius + p2.radius) {
              // Swap velocities for identical masses roughly
              const tempVx = p1.vx;
              const tempVy = p1.vy;
              p1.vx = p2.vx;
              p1.vy = p2.vy;
              p2.vx = tempVx;
              p2.vy = tempVy;

              // Prevent sticking
              const overlap = (p1.radius + p2.radius) - dist;
              p1.x -= (dx / dist) * overlap * 0.5;
              p1.y -= (dy / dist) * overlap * 0.5;
              p2.x += (dx / dist) * overlap * 0.5;
              p2.y += (dy / dist) * overlap * 0.5;
            }
          }
        }
      }
    } else if (this.type === 'smoke' || this.type === 'pollen') {
      const largeP = this.type === 'smoke' ? this.smokeParticle : this.pollenParticle;
      const smallMs = this.type === 'smoke' ? this.airMolecules : this.waterMolecules;
      const trace = this.type === 'smoke' ? this.smokeTrace : this.pollenTrace;

      // Update small molecules
      smallMs.forEach(m => {
        m.x += m.vx;
        m.y += m.vy;

        if (m.x - m.radius < 0) { m.x = m.radius; m.vx *= -1; }
        if (m.x + m.radius > this.width) { m.x = this.width - m.radius; m.vx *= -1; }
        if (m.y - m.radius < 0) { m.y = m.radius; m.vy *= -1; }
        if (m.y + m.radius > this.height) { m.y = this.height - m.radius; m.vy *= -1; }

        // Collision with large particle
        const dx = m.x - largeP.x;
        const dy = m.y - largeP.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < m.radius + largeP.radius) {
          // Elastic collision calculation
          const normalX = dx / dist;
          const normalY = dy / dist;

          // Relative velocity
          const rvx = m.vx - largeP.vx;
          const rvy = m.vy - largeP.vy;

          // Velocity along normal
          const velAlongNormal = rvx * normalX + rvy * normalY;

          // Only resolve if velocities are moving towards each other
          if (velAlongNormal < 0) {
            const impulse = (-(1 + 0.95) * velAlongNormal) / (1 / m.mass + 1 / largeP.mass);
            
            // Apply impulse
            m.vx += (impulse / m.mass) * normalX;
            m.vy += (impulse / m.mass) * normalY;
            largeP.vx -= (impulse / largeP.mass) * normalX;
            largeP.vy -= (impulse / largeP.mass) * normalY;
          }

          // Prevent overlaps
          const overlap = (m.radius + largeP.radius) - dist;
          m.x += normalX * overlap;
          m.y += normalY * overlap;
        }
      });

      // Update large particle position
      largeP.x += largeP.vx;
      largeP.y += largeP.vy;

      // Friction to prevent infinite acceleration build-up
      const friction = (this.type === 'pollen' || this.type === 'smoke') ? 0.98 : 0.95;
      largeP.vx *= friction;
      largeP.vy *= friction;

      // Keep large particle in bounds
      if (largeP.x - largeP.radius < 10) { largeP.x = 10 + largeP.radius; largeP.vx *= -1; }
      if (largeP.x + largeP.radius > this.width - 10) { largeP.x = this.width - 10 - largeP.radius; largeP.vx *= -1; }
      if (largeP.y - largeP.radius < 10) { largeP.y = 10 + largeP.radius; largeP.vy *= -1; }
      if (largeP.y + largeP.radius > this.height - 10) { largeP.y = this.height - 10 - largeP.radius; largeP.vy *= -1; }

      // Trace the path of the large particle
      trace.push({ x: largeP.x, y: largeP.y });
      if (trace.length > 4000) { // High limit to keep trail permanent without memory leaks
        trace.shift();
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    const state = this.type === 'bonds' ? AppState.bondsState : AppState.particlesState;

    if (this.type === 'particles' || this.type === 'bonds') {
      // Draw border box
      this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(8, 8, this.width - 16, this.height - 16);

      // Bonds drawing
      if (this.type === 'bonds') {
        this.ctx.lineWidth = 2;
        if (state === 'solid') {
          this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
          // Connect neighboring particles in grid
          const rows = 6;
          const cols = 8;
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              const idx = r * cols + c;
              const p = this.particles[idx];
              // Connect right
              if (c < cols - 1) {
                const rightP = this.particles[idx + 1];
                this.ctx.beginPath();
                this.ctx.moveTo(p.x, p.y);
                this.ctx.lineTo(rightP.x, rightP.y);
                this.ctx.stroke();
              }
              // Connect down
              if (r < rows - 1) {
                const downP = this.particles[idx + cols];
                this.ctx.beginPath();
                this.ctx.moveTo(p.x, p.y);
                this.ctx.lineTo(downP.x, downP.y);
                this.ctx.stroke();
              }
            }
          }
        } else if (state === 'liquid') {
          // Dynamic temporary bonds between very close particles
          for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
              const p1 = this.particles[i];
              const p2 = this.particles[j];
              const dx = p2.x - p1.x;
              const dy = p2.y - p1.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 26) {
                const alpha = (1 - dist / 26) * 0.4;
                this.ctx.strokeStyle = `rgba(0, 255, 255, ${alpha})`;
                this.ctx.beginPath();
                this.ctx.moveTo(p1.x, p1.y);
                this.ctx.lineTo(p2.x, p2.y);
                this.ctx.stroke();
              }
            }
          }
        }
      }

      // Draw all particles
      this.particles.forEach(p => {
        this.ctx.fillStyle = '#00ffff';
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fill();
        // Give a neon glow effect inside canvas
        this.ctx.shadowColor = '#00ffff';
        this.ctx.shadowBlur = 4;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0; // Reset
      });

    } else if (this.type === 'smoke' || this.type === 'pollen') {
      const largeP = this.type === 'smoke' ? this.smokeParticle : this.pollenParticle;
      const smallMs = this.type === 'smoke' ? this.airMolecules : this.waterMolecules;
      const trace = this.type === 'smoke' ? this.smokeTrace : this.pollenTrace;
      const showSmall = this.type === 'smoke' ? AppState.smokeShowAir : AppState.pollenShowWater;

      // Draw small molecules if visible
      if (showSmall) {
        smallMs.forEach(m => {
          this.ctx.fillStyle = 'rgba(0, 255, 255, 0.25)';
          this.ctx.beginPath();
          this.ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
          this.ctx.fill();
        });
      }

      // Draw solid trace path
      const showTrail = this.type === 'smoke' ? AppState.smokeShowTrail : AppState.pollenShowTrail;
      if (showTrail && trace.length > 1) {
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.6)'; // Solid glowing accent color
        this.ctx.beginPath();
        this.ctx.moveTo(trace[0].x, trace[0].y);
        for (let i = 1; i < trace.length; i++) {
          this.ctx.lineTo(trace[i].x, trace[i].y);
        }
        this.ctx.stroke();
      }

      // Draw Large Particle
      this.ctx.fillStyle = '#00ffff';
      this.ctx.shadowColor = '#00ffff';
      this.ctx.shadowBlur = 10;
      this.ctx.beginPath();
      this.ctx.arc(largeP.x, largeP.y, largeP.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.shadowBlur = 0; // Reset
    }
  }

  loop() {
    this.update();
    this.draw();
    AppState.animationFrameIds[this.type] = requestAnimationFrame(() => this.loop());
  }

  stop() {
    if (AppState.animationFrameIds[this.type]) {
      cancelAnimationFrame(AppState.animationFrameIds[this.type]);
    }
  }
}

// Active simulation tracking
const SimInstances = {};

function startSimulation(tab) {
  // Stop others
  Object.keys(SimInstances).forEach(k => SimInstances[k].stop());

  if (tab === 'particles' || tab === 'bonds' || tab === 'smoke' || tab === 'pollen') {
    if (!SimInstances[tab]) {
      const canvasEl = DOM[`canvas${tab.charAt(0).toUpperCase() + tab.slice(1)}`];
      SimInstances[tab] = new Simulation(canvasEl, tab);
    } else {
      SimInstances[tab].init();
    }
    SimInstances[tab].loop();
  }
}

// --- Navigation / Routing ---
function handleNavigation(tabName) {
  AppState.currentTab = tabName;
  
  DOM.tabs.forEach(btn => {
    if (btn.dataset.tab === tabName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  DOM.sections.forEach(sec => {
    if (sec.id === `section-${tabName}`) {
      sec.classList.add('active');
    } else {
      sec.classList.remove('active');
    }
  });

  // Start specific sim
  startSimulation(tabName);

  if (tabName === 'flashcards') {
    initFlashcards();
  } else if (tabName === 'quiz') {
    // Reset to start screen on click if quiz not active
    if (!DOM.quizQuestionScreen.classList.contains('active') && !DOM.quizResultScreen.classList.contains('active')) {
      DOM.quizStartScreen.classList.add('active');
    }
  }
}

// --- Particles UI ---
function updateParticlesUI(state) {
  AppState.particlesState = state;
  DOM.particleControls.forEach(btn => {
    if (btn.dataset.state === state) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update description line
  const descriptions = {
    solid: "Arrangement: Regular, very closely-packed | Motion: Vibrate about fixed positions | Force: Very strong",
    liquid: "Arrangement: Irregular, close together | Motion: Slide around each other | Force: Strong",
    gas: "Arrangement: Irregular, very far apart | Motion: Move rapidly in random directions | Force: Negligible"
  };
  DOM.descParticles.textContent = descriptions[state];

  // Update Highlighted State Column/Rows in Properties Table
  const table = document.querySelector('.properties-table');
  const headers = table.querySelectorAll('thead th');
  const rows = table.querySelectorAll('tbody tr');

  // Find column index (Solid: 1, Liquid: 2, Gas: 3)
  const colIndex = state === 'solid' ? 1 : state === 'liquid' ? 2 : 3;

  // Clear previous highlights
  table.querySelectorAll('td').forEach(td => td.classList.remove('highlight'));
  
  // Apply highlight classes to correct cells
  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    cells[colIndex].classList.add('highlight');
  });

  // Restart sim
  if (SimInstances['particles']) {
    SimInstances['particles'].init();
  }
}

// --- Bonds UI ---
function updateBondsUI(state) {
  AppState.bondsState = state;
  DOM.bondControls.forEach(btn => {
    if (btn.dataset.state === state) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  const labels = {
    solid: "Strong",
    liquid: "Weak",
    gas: "Negligible"
  };
  DOM.labelForceStrength.textContent = labels[state];

  // Restart sim
  if (SimInstances['bonds']) {
    SimInstances['bonds'].init();
  }
}

// --- Flashcards Logic ---
function shuffle(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

function initFlashcards() {
  AppState.flashcards = [...FLASHCARD_DATA];
  AppState.currentCardIndex = 0;
  displayFlashcard();
}

function displayFlashcard() {
  const card = AppState.flashcards[AppState.currentCardIndex];
  DOM.cardFrontText.textContent = card.term;
  DOM.cardBackText.textContent = card.explanation;
  DOM.cardCounter.textContent = `${AppState.currentCardIndex + 1} / ${AppState.flashcards.length}`;
  DOM.cardElement.classList.remove('flipped');
}

// --- Quiz Logic ---
function initQuiz() {
  AppState.userScore = 0;
  AppState.currentQuestionIndex = 0;
  AppState.quizAnswers = [];
  
  // Copy original questions and shuffle
  const shuffledPool = shuffle([...QUIZ_QUESTIONS]);
  
  // Pick exactly 10 questions
  AppState.currentQuizQuestions = shuffledPool.slice(0, 10);
  
  showQuizScreen('question');
  displayQuestion();
}

function showQuizScreen(screenName) {
  DOM.quizStartScreen.classList.remove('active');
  DOM.quizQuestionScreen.classList.remove('active');
  DOM.quizResultScreen.classList.remove('active');

  if (screenName === 'start') DOM.quizStartScreen.classList.add('active');
  if (screenName === 'question') DOM.quizQuestionScreen.classList.add('active');
  if (screenName === 'result') DOM.quizResultScreen.classList.add('active');
}

function displayQuestion() {
  const qObj = AppState.currentQuizQuestions[AppState.currentQuestionIndex];
  DOM.quizProgress.textContent = `Question ${AppState.currentQuestionIndex + 1} of 10`;
  DOM.quizProgressFill.style.width = `${((AppState.currentQuestionIndex + 1) / 10) * 100}%`;
  DOM.quizQuestionText.textContent = qObj.q;

  // Randomise option order for this question
  const shuffledOptions = shuffle([...qObj.o]);
  
  DOM.quizOptions.innerHTML = '';
  shuffledOptions.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt;
    btn.addEventListener('click', () => handleQuizAnswer(opt, qObj));
    DOM.quizOptions.appendChild(btn);
  });
}

function handleQuizAnswer(selectedOpt, qObj) {
  const isCorrect = selectedOpt === qObj.a;
  if (isCorrect) AppState.userScore++;

  AppState.quizAnswers.push({
    question: qObj.q,
    selected: selectedOpt,
    correct: qObj.a,
    isCorrect: isCorrect
  });

  // Next question or end
  AppState.currentQuestionIndex++;
  if (AppState.currentQuestionIndex < 10) {
    displayQuestion();
  } else {
    showQuizResults();
  }
}

// Custom Confetti Burst Animation
let confettiParticles = [];
let confettiAnimationFrameId = null;

function startConfetti() {
  const canvas = DOM.canvasConfetti;
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = 120;
  
  confettiParticles = [];
  for (let i = 0; i < 70; i++) {
    confettiParticles.push({
      x: canvas.width / 2,
      y: canvas.height - 10,
      vx: (Math.random() - 0.5) * 8,
      vy: -Math.random() * 6 - 4,
      radius: Math.random() * 4 + 2,
      color: `rgba(0, 255, 255, ${Math.random() * 0.7 + 0.3})`,
      gravity: 0.18,
      life: 80
    });
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    confettiParticles.forEach((p, idx) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.life--;

      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();

      if (p.life <= 0) {
        confettiParticles.splice(idx, 1);
      }
    });

    if (confettiParticles.length > 0) {
      confettiAnimationFrameId = requestAnimationFrame(loop);
    }
  }
  
  if (confettiAnimationFrameId) cancelAnimationFrame(confettiAnimationFrameId);
  loop();
}

function showQuizResults() {
  showQuizScreen('result');
  DOM.scoreNumber.textContent = AppState.userScore;

  // Clear review
  DOM.wrongAnswersList.innerHTML = '';
  DOM.wrongReviewContainer.style.display = 'none';

  // Three-tier score feedback
  if (AppState.userScore >= 8) {
    DOM.resultFeedbackText.textContent = "Excellent! You've mastered this topic.";
    startConfetti();
  } else if (AppState.userScore >= 5) {
    DOM.resultFeedbackText.textContent = "Good effort! Review the tabs and try again.";
  } else {
    DOM.resultFeedbackText.textContent = "Keep going! Revisit the simulations before retrying.";
  }

  // Generate incorrect answers review list
  const wrongAnswers = AppState.quizAnswers.filter(ans => !ans.isCorrect);
  if (wrongAnswers.length > 0) {
    DOM.wrongReviewContainer.style.display = 'flex';
    wrongAnswers.forEach(ans => {
      const card = document.createElement('div');
      card.className = 'review-card';
      
      const qText = document.createElement('p');
      qText.className = 'review-q';
      qText.textContent = `Q: ${ans.question}`;
      
      const aText = document.createElement('p');
      aText.className = 'review-a';
      aText.textContent = `✓ Correct Answer: ${ans.correct}`;

      card.appendChild(qText);
      card.appendChild(aText);
      DOM.wrongAnswersList.appendChild(card);
    });
  }
}

// --- Swipe Logic for Flashcards ---
let touchstartX = 0;
let touchendX = 0;

function checkDirection() {
  if (touchendX < touchstartX - 60) {
    // Swiped left -> next card
    if (AppState.currentCardIndex < AppState.flashcards.length - 1) {
      AppState.currentCardIndex++;
      displayFlashcard();
    }
  }
  if (touchendX > touchstartX + 60) {
    // Swiped right -> prev card
    if (AppState.currentCardIndex > 0) {
      AppState.currentCardIndex--;
      displayFlashcard();
    }
  }
}

// --- Event Listeners Setup ---
function setupEventListeners() {
  // Tabs Navigation
  DOM.tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      handleNavigation(btn.dataset.tab);
    });
  });

  // Particles Toggle
  DOM.particleControls.forEach(btn => {
    btn.addEventListener('click', () => {
      updateParticlesUI(btn.dataset.state);
    });
  });

  // Bonds Toggle
  DOM.bondControls.forEach(btn => {
    btn.addEventListener('click', () => {
      updateBondsUI(btn.dataset.state);
    });
  });

  // Smoke Air Molecules Toggle
  DOM.btnToggleAirSmoke.addEventListener('click', () => {
    AppState.smokeShowAir = !AppState.smokeShowAir;
    DOM.btnToggleAirSmoke.textContent = AppState.smokeShowAir ? "Hide Air Molecules" : "Show Air Molecules";
    DOM.btnToggleAirSmoke.classList.toggle('active', AppState.smokeShowAir);
  });

  // Pollen Water Molecules Toggle
  DOM.btnToggleWaterPollen.addEventListener('click', () => {
    AppState.pollenShowWater = !AppState.pollenShowWater;
    DOM.btnToggleWaterPollen.textContent = AppState.pollenShowWater ? "Hide Water Molecules" : "Show Water Molecules";
    DOM.btnToggleWaterPollen.classList.toggle('active', AppState.pollenShowWater);
  });

  // Smoke Trail Toggle
  DOM.btnToggleTrailSmoke.addEventListener('click', () => {
    AppState.smokeShowTrail = !AppState.smokeShowTrail;
    DOM.btnToggleTrailSmoke.textContent = AppState.smokeShowTrail ? "Hide Trail" : "Show Trail";
    DOM.btnToggleTrailSmoke.classList.toggle('active', AppState.smokeShowTrail);
  });

  // Pollen Trail Toggle
  DOM.btnToggleTrailPollen.addEventListener('click', () => {
    AppState.pollenShowTrail = !AppState.pollenShowTrail;
    DOM.btnToggleTrailPollen.textContent = AppState.pollenShowTrail ? "Hide Trail" : "Show Trail";
    DOM.btnToggleTrailPollen.classList.toggle('active', AppState.pollenShowTrail);
  });

  // Flashcards navigation
  DOM.cardElement.addEventListener('click', () => {
    DOM.cardElement.classList.toggle('flipped');
  });

  DOM.btnPrevCard.addEventListener('click', (e) => {
    e.stopPropagation();
    if (AppState.currentCardIndex > 0) {
      AppState.currentCardIndex--;
      displayFlashcard();
    }
  });

  DOM.btnNextCard.addEventListener('click', (e) => {
    e.stopPropagation();
    if (AppState.currentCardIndex < AppState.flashcards.length - 1) {
      AppState.currentCardIndex++;
      displayFlashcard();
    }
  });

  DOM.btnShuffleCards.addEventListener('click', () => {
    shuffle(AppState.flashcards);
    AppState.currentCardIndex = 0;
    displayFlashcard();
  });

  // Flashcard Swipe Triggers
  DOM.cardElement.addEventListener('touchstart', e => {
    touchstartX = e.changedTouches[0].screenX;
  });
  DOM.cardElement.addEventListener('touchend', e => {
    touchendX = e.changedTouches[0].screenX;
    checkDirection();
  });

  // Quiz events
  DOM.btnStartQuiz.addEventListener('click', initQuiz);
  DOM.btnRetryQuiz.addEventListener('click', initQuiz);
}

// --- App Initialization ---
function initApp() {
  setupEventListeners();
  
  // Set default states
  updateParticlesUI('solid');
  updateBondsUI('solid');
  
  // Load default view
  handleNavigation('particles');
}

window.addEventListener('DOMContentLoaded', initApp);
