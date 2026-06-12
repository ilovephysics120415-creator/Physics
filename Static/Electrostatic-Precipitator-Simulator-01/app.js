// Application State
const state = {
  activeSection: 'concept',
  conceptStep: 0,
  walkthroughTapped: new Set(),
  walkthroughPlaying: false,
  gameActive: false,
  gameScore: 0,
  gameTotalSpawned: 0,
  gameTimeLeft: 45,
  gameInterval: null,
  gameSpeedMultiplier: 1.0,
  quizQuestions: [],
  quizCurrentIdx: 0,
  quizScore: 0,
  quizAnswered: false,
  flashcards: [],
  flashcardIdx: 0,
  flashcardFlipped: false
};

// --- DATA DEFINITIONS ---

// Flashcard data
const flashcardData = [
  { q: "What is the primary function of an electrostatic precipitator?", a: "To remove dust, smoke, and pollutant particles from industrial waste gases before they escape into the atmosphere." },
  { q: "What charge is applied to the wire grid inside the precipitator?", a: "A high negative charge (often several kilovolts)." },
  { q: "How do smoke and dust particles become charged?", a: "They experience charging by friction as they flow through the wire grid and exhaust pipes, and they gain electrons from the negative wire grid to become negatively charged." },
  { q: "What is the electric charge of the collecting plates?", a: "They are grounded (positively charged relative to the negative grid) to attract negative particles." },
  { q: "Why are the collecting plates grounded instead of keeping them uncharged?", a: "Grounding keeps them at zero potential, making them positive relative to the highly negative wires, creating a strong attracting electric field." },
  { q: "How are collected particles removed from the collecting plates?", a: "The plates are periodically tapped or vibrated, causing the accumulated dust to fall into a collection bin below." },
  { q: "What is the main environmental benefit of electrostatic precipitators?", a: "It significantly reduces fine particulate air pollution (PM2.5 / PM10) from coal power stations and factories." },
  { q: "How is static electricity used in electrostatic spray painting?", a: "The paint spray nozzle is given a negative charge, and the target object is grounded. The paint drops repel each other (forming a fine mist) and are attracted evenly to the object's surface." },
  { q: "How does electrostatic charging help in agricultural crop spraying?", a: "Charging the chemical droplets causes them to repel each other for wider distribution and attract to the undersides of leaves, reducing chemical waste." },
  { q: "Explain the electrostatic principle in a photocopier drum.", a: "A drum is charged positively. Light reflected from white parts of the document discharges those areas, leaving a positive charge pattern. Negative toner powder sticks only to the positively charged pattern." }
];

// MCQ Quiz Question Pool (Exactly 30 distinct questions)
const quizPool = [
  {
    q: "What is the primary purpose of an electrostatic precipitator in a power station?",
    o: [
      "To cool down exhaust gases before they reach the chimney",
      "To remove smoke and dust particles from waste gases",
      "To produce electrical energy from moving exhaust fumes",
      "To filter out carbon dioxide gas chemically"
    ],
    a: 1,
    e: "An electrostatic precipitator is used specifically to capture fine dust and smoke particles from exhaust gases, reducing air pollution."
  },
  {
    q: "Which charge is applied to the wire grid near the exhaust gas inlet?",
    o: ["Positive charge", "Neutral (grounded)", "Negative charge", "Alternating positive and negative charge"],
    a: 2,
    e: "The wire grid is connected to a high-voltage negative supply to charge passing particles negative."
  },
  {
    q: "How do neutral dust particles become charged in the precipitator?",
    o: [
      "By rubbing against the outer walls of the inlet duct",
      "By gaining electrons from the air ionized by the negative wire grid",
      "By losing protons to the grounded collecting plates",
      "By absorbing heat from the combustion gases"
    ],
    a: 1,
    e: "The negative wire grid ionizes the air around it. Dust particles pass through and capture these negative ions (electrons), becoming negatively charged."
  },
  {
    q: "What charge do dust particles acquire after passing through the wire grid?",
    o: ["Positive charge", "Negative charge", "No charge", "They become neutralised"],
    a: 1,
    e: "Passing through the negatively charged grid causes dust particles to gain electrons and acquire a net negative charge."
  },
  {
    q: "Why are the collecting plates grounded (positively charged relative to the grid)?",
    o: [
      "To allow electrical current to flow safely into the earth",
      "To attract the negatively charged dust particles towards them",
      "To repel the exhaust gas molecules out of the stack",
      "To heat up the particles so they melt off"
    ],
    a: 1,
    e: "Grounded plates are positive relative to the high negative voltage of the grid. This attracts the negative dust particles."
  },
  {
    q: "What happens when the dust particles stick to the grounded collecting plates?",
    o: [
      "They lose their negative charge and remain on the plate",
      "They turn into positive ions immediately",
      "They spark and explode into gas",
      "They slide down continuously because of gravity"
    ],
    a: 0,
    e: "On contact with the grounded plates, the negative particles discharge (lose excess electrons to the ground) and stick to the plates."
  },
  {
    q: "How is the accumulated dust removed from the collecting plates?",
    o: [
      "By washing the plates with high-pressure water jets",
      "By tapping or vibrating the plates so the dust falls into a bin",
      "By reversing the electrical polarity to repel the particles",
      "By blowing clean air through the chimney at high speeds"
    ],
    a: 1,
    e: "The plates are periodically tapped or vibrated mechanically, causing the accumulated dust to drop into a collection bin at the bottom."
  },
  {
    q: "Which environmental issue is directly reduced by electrostatic precipitators?",
    o: ["Acid rain", "Global warming", "Particulate air pollution", "Ozone layer depletion"],
    a: 2,
    e: "By capturing ash, soot, and dust particles, precipitators reduce particulate pollution (smoke haze)."
  },
  {
    q: "If the wire grid is accidentally connected to a positive terminal, how will it affect neutral dust particles?",
    o: [
      "They will still become negative and attract to the plates",
      "They will become positive and attract to the negative plates",
      "They will lose all charge and float out of the chimney",
      "They will melt due to the positive field"
    ],
    a: 1,
    e: "A positive grid would charge the particles positive, meaning they would attract to negative (grounded) plates. However, precipitators use negative charging because it produces a more stable corona discharge."
  },
  {
    q: "In electrostatic spray painting, why are paint droplets given a charge?",
    o: [
      "To make the paint dry faster on the surface",
      "So droplets repel each other to form a fine spray, and are attracted to the grounded target",
      "To change the chemical composition and colour of the paint",
      "To prevent paint from sticking to the spray nozzle"
    ],
    a: 1,
    e: "Charged droplets repel each other, producing a highly uniform mist. They are also attracted to the grounded object, giving an even coat and wrapping around corners."
  },
  {
    q: "Why does electrostatic spray painting lead to less wastage of paint?",
    o: [
      "The paint evaporates faster in the air",
      "Paint droplets are attracted to the grounded object, even on its back side",
      "The paint becomes thicker when charged",
      "The nozzle blocks automatically when paint is wasted"
    ],
    a: 1,
    e: "The electrostatic attraction pulls the paint directly to the target object (even wrapping around curves), reducing overspray and wastage."
  },
  {
    q: "How are electrostatic principles applied in a photocopier?",
    o: [
      "Toner particles are heated to stick to the paper",
      "A charged drum attracts toner particles to form the image pattern",
      "The paper is magnetised to pull ink drops",
      "The laser light chemically burns the copy onto the page"
    ],
    a: 1,
    e: "In a photocopier, an electrostatic charge pattern is created on a drum. Oppositely charged toner powder adheres to these charged areas."
  },
  {
    q: "During crop spraying, agricultural droplets are given an electrostatic charge to:",
    o: [
      "Kill the insect pests directly using electric shocks",
      "Help the droplets spread evenly and stick to the top and bottom of leaves",
      "Ensure the pesticide does not mix with rainwater",
      "Prevent the liquid from evaporating under the sun"
    ],
    a: 1,
    e: "Charging the droplets makes them repel each other to spread widely and attract to the grounded plant surfaces, including under the leaves."
  },
  {
    q: "Why do dust particles drift towards the collecting plates instead of falling straight down initially?",
    o: [
      "The velocity of the exhaust gas pushes them sideways",
      "Gravity is temporarily cancelled by the magnetic field",
      "An electrostatic force of attraction acts on them towards the plates",
      "The particles are lighter than air"
    ],
    a: 2,
    e: "An electric field exists between the grid and plates, exerting an electrostatic force that pulls charged dust sideways to the plates."
  },
  {
    q: "Which component of the precipitator collects the dust?",
    o: ["The smoke stack chimney walls", "The negative wire grid", "The grounded collecting plates", "The exhaust gas inlet fans"],
    a: 2,
    e: "The grounded collecting plates attract and accumulate the charged dust particles."
  },
  {
    q: "A student states: 'Grounded plates are neutral, so they cannot attract charged particles.' Why is this incorrect?",
    o: [
      "Grounded plates acquire an opposite charge relative to the grid via induction/potential difference",
      "Grounded plates are actually connected to a high positive voltage source",
      "Neutral objects always repel charged particles",
      "Dust particles are magnetic, not electrostatic"
    ],
    a: 0,
    e: "Because the grid is highly negative, a grounded plate (0V) has a much higher potential (behaves positive relative to the grid) and attracts negative charges."
  },
  {
    q: "What is a major advantage of an electrostatic precipitator over a simple mesh filter?",
    o: [
      "It doesn't block the flow of exhaust gases, maintaining high efficiency",
      "It requires no electrical energy to operate",
      "It can filter out greenhouse gases like carbon dioxide",
      "It operates at room temperature only"
    ],
    a: 0,
    e: "Unlike physical mesh filters, precipitators do not restrict gas flow, meaning they do not slow down the industrial process."
  },
  {
    q: "What would happen if the dust was not tapped off the plates periodically?",
    o: [
      "The plates would become thicker and work even better",
      "The accumulated dust layers would insulate the plates, reducing efficiency",
      "The plates would melt under the weight",
      "The dust would turn into pure charcoal"
    ],
    a: 1,
    e: "Thick dust layers behave like insulators, reducing the electric field and preventing new particles from sticking, lowering efficiency."
  },
  {
    q: "What charge is present on the dust particles *before* they enter the precipitator?",
    o: ["Positive", "Negative", "Uncharged (Neutral)", "Both positive and negative equally on outer surface"],
    a: 2,
    e: "Dust and smoke particles entering in the dirty gas are neutral (uncharged)."
  },
  {
    q: "Which of the following is NOT an application of static electricity?",
    o: ["Electrostatic precipitator", "Photocopying machine", "Electrostatic crop spraying", "Electric kettle heating element"],
    a: 3,
    e: "Electric kettles use the heating effect of an electric current (resistance), not electrostatic attraction."
  },
  {
    q: "In spray painting, if both the paint nozzle and the car body are negatively charged:",
    o: [
      "The paint will stick very firmly to the car body",
      "The paint droplets will be repelled away from the car body",
      "The paint will dry instantly on contact",
      "The paint will turn positive upon landing"
    ],
    a: 1,
    e: "Like charges repel. If both carry negative charge, they will repel each other, and paint will fly away from the car."
  },
  {
    q: "The force of attraction between the dust particles and the collecting plates is due to:",
    o: ["Magnetic force", "Gravitational force", "Electrostatic force", "Centripetal force"],
    a: 2,
    e: "The force is due to static electric charges, which is an electrostatic force."
  },
  {
    q: "Under the Singapore Syllabus, which law explains the attraction between negative particles and positive plates?",
    o: [
      "Law of Conservation of Energy",
      "Law of Electrostatics (Like charges repel, unlike charges attract)",
      "Faraday's Law of Induction",
      "Ohm's Law of Resistance"
    ],
    a: 1,
    e: "The basic law of electrostatics states that opposite (unlike) charges attract."
  },
  {
    q: "What happens to the electrons when a negative dust particle touches the grounded plate?",
    o: [
      "They flow through the grounding wire into the earth",
      "They remain trapped in the particle forever",
      "They flow from the earth into the dust particle",
      "They vanish into air molecules"
    ],
    a: 0,
    e: "Excess electrons flow from the negatively charged dust particle to the grounded plate and safely down into the Earth."
  },
  {
    q: "Why is a high voltage required for the electrostatic wire grid?",
    o: [
      "To create a strong enough electric field to ionize air and charge particles",
      "To burn the dust particles before they reach the chimney",
      "To power the mechanical vibrators on the plates",
      "To speed up the exhaust gases using electric fans"
    ],
    a: 0,
    e: "High voltage (kilovolts) is needed to create a strong electric field that ionizes air, which is essential to charge the dust."
  },
  {
    q: "If an electrostatic precipitator shuts down its power supply:",
    o: [
      "Dust will continue to stick due to permanent magnetism",
      "Smoke and dust will escape freely from the chimney, causing air pollution",
      "The chimney will block instantly",
      "The exhaust gas will turn clean automatically"
    ],
    a: 1,
    e: "Without power, there is no electric field to charge or attract the dust, so pollutants will fly straight out."
  },
  {
    q: "Why do paint droplets in an electrostatic paint sprayer spread out into a very fine mist?",
    o: [
      "Because they repel each other as they all carry the same charge",
      "Because they attract the air molecules around them",
      "Because they are heated to their boiling point",
      "Because the nozzle is very narrow"
    ],
    a: 0,
    e: "Because all paint droplets carry the same negative charge, they repel each other, preventing clumping and creating a fine mist."
  },
  {
    q: "The collection bin at the bottom of the precipitator is designed to receive:",
    o: [
      "Cleaned gas molecules",
      "The soot and dust particles that fall off tapped plates",
      "Excess electrical charge from the wires",
      "Rainwater to wash the chimney"
    ],
    a: 1,
    e: "The bin collects the physical ash and soot vibrated off the plates."
  },
  {
    q: "Which of the following is correct regarding the electrostatic precipitator workflow?",
    o: [
      "Neutral gas -> positive charge -> negative plates -> bin",
      "Neutral gas -> negative grid -> charged particles -> grounded plates -> bin",
      "Positive gas -> neutral grid -> negative plates -> bin",
      "Grounded gas -> negative grid -> positive gas -> bin"
    ],
    a: 1,
    e: "The process is: neutral gas enters, particles pick up negative charge at the grid, move to grounded plates, and fall into the bin."
  },
  {
    q: "What is the net charge on the clean gas leaving the outlet of the precipitator?",
    o: ["Highly positive", "Highly negative", "Neutral", "Alternating charge"],
    a: 2,
    e: "Once the charged particulate matter is removed, the remaining gas escaping from the outlet is neutral and clean."
  }
];

// --- EVENT LISTENERS & DOM ROUTING ---

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initConceptIntro();
  initWalkthrough();
  initGameTab();
  initFlashcards();
  initQuiz();
  
  document.getElementById('resetSessionBtn').addEventListener('click', resetSession);
});

function initTabs() {
  const tabs = document.querySelectorAll('#mainNav .tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      switchSection(tab.dataset.target);
    });
  });
}

function switchSection(targetId) {
  // Pause any game loop if switching away from game
  if (targetId !== 'explore' || !document.getElementById('btnGame').classList.contains('active')) {
    stopGame();
  }
  
  // Render updates if switching to score section
  if (targetId === 'scoring') {
    updateScoringFeedback();
  }

  const sections = document.querySelectorAll('.app-section');
  sections.forEach(sec => {
    sec.classList.remove('active');
    if (sec.id === targetId) {
      sec.classList.add('active');
    }
  });
  
  state.activeSection = targetId;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- SECTION 1: CONCEPT STEP-BY-STEP ANIMATION ---

const particleOffsets = [
  { dx: 10, dy: 15 },
  { dx: 80, dy: 45 },
  { dx: 30, dy: 90 },
  { dx: 110, dy: 20 },
  { dx: 60, dy: 75 },
  { dx: 130, dy: 110 },
  { dx: 15, dy: 60 },
  { dx: 95, dy: 100 },
  { dx: 45, dy: 30 },
  { dx: 120, dy: 80 },
  { dx: 70, dy: 10 },
  { dx: 140, dy: 50 },
  { dx: 5, dy: 105 },
  { dx: 85, dy: 25 },
  { dx: 105, dy: 70 }
];

let introCtx;
let introAnimationTimer;
const introStages = [
  {
    desc: "1. Dirty exhaust gas (containing neutral dust and smoke particles) enters the precipitator from the factory furnace.",
    draw: (ctx, progress) => {
      drawPrecipitatorFrame(ctx);
      // Neutral particles entering from left
      for(let i=0; i<15; i++) {
        let offset = particleOffsets[i];
        let x = 40 + offset.dx + (progress * 80);
        let y = 65 + offset.dy * 1.4;
        if (x < 240) {
          drawParticle(ctx, x, y, 'neutral');
        }
      }
      drawFlowArrows(ctx, 40, 150, 100, 150, '#94a3b8');
    }
  },
  {
    desc: "2. The particles pass through a wire grid connected to a high voltage negative supply, ionizing the air around it.",
    draw: (ctx, progress) => {
      drawPrecipitatorFrame(ctx);
      // Glow around negative wires
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#fe0979';
      ctx.strokeStyle = '#fe0979';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(250, 40); ctx.lineTo(250, 260);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Particles passing grid and becoming negative
      for(let i=0; i<15; i++) {
        let offset = particleOffsets[i];
        let x = 110 + offset.dx + (progress * 80);
        let y = 65 + offset.dy * 1.4;
        let type = (x > 250) ? 'negative' : 'neutral';
        drawParticle(ctx, x, y, type);
      }
    }
  },
  {
    desc: "3. Negatively charged dust particles feel an electrostatic force, attracting them toward the grounded collecting plates.",
    draw: (ctx, progress) => {
      drawPrecipitatorFrame(ctx);
      // Negative grid
      ctx.strokeStyle = 'rgba(254, 9, 121, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(250, 40); ctx.lineTo(250, 260); ctx.stroke();

      // Show electric field/force vectors to plates (y=40 and y=260)
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.3)';
      ctx.setLineDash([4, 4]);
      for (let x = 270; x < 500; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 150);
        ctx.lineTo(x, 50);
        ctx.moveTo(x, 150);
        ctx.lineTo(x, 250);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Particles moving outwards to plates
      for(let i=0; i<15; i++) {
        let offset = particleOffsets[i];
        let pct = Math.min(1, progress + (i*0.04));
        let x = 240 + offset.dx + (pct * 120);
        let basey = 65 + offset.dy * 1.4;
        let y = basey;
        if (x > 260) {
          let distToPlate = (basey < 150) ? (basey - 45) : (255 - basey);
          y = (basey < 150) ? (basey - distToPlate * pct) : (basey + distToPlate * pct);
        }
        drawParticle(ctx, x, y, 'negative');
      }
    }
  },
  {
    desc: "4. The negative particles stick to the grounded plates. They transfer excess electrons to ground and become discharged.",
    draw: (ctx, progress) => {
      drawPrecipitatorFrame(ctx);
      // Sticking particles
      for(let i=0; i<18; i++) {
        let side = (i % 2 === 0);
        let x = 300 + (i * 10);
        let y = side ? 45 : 255;
        // Pulse glow
        let sz = 4 + Math.sin(progress * 10 + i) * 1.5;
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.arc(x, y, sz, 0, Math.PI*2);
        ctx.fill();
      }
    }
  },
  {
    desc: "5. Periodic vibration or tapping of the plates causes the accumulated dust clumps to fall down into the collection bin.",
    draw: (ctx, progress) => {
      drawPrecipitatorFrame(ctx);
      // Tapping vibration lines
      ctx.strokeStyle = '#00ff87';
      ctx.lineWidth = 2;
      let offset = Math.sin(progress * 25) * 3;
      // top plate
      ctx.beginPath(); ctx.moveTo(300 + offset, 40); ctx.lineTo(500 + offset, 40); ctx.stroke();
      // bottom plate
      ctx.beginPath(); ctx.moveTo(300 + offset, 260); ctx.lineTo(500 + offset, 260); ctx.stroke();

      // Falling particles
      for(let i=0; i<12; i++) {
        let x = 320 + (i * 15);
        let startY = (i % 2 === 0) ? 45 : 255;
        let y = startY + (progress * 120);
        if (y < 285) {
          drawParticle(ctx, x, y, 'neutral');
        }
      }
    }
  },
  {
    desc: "6. Clean, dust-free exhaust gas exits the outlet of the precipitator, keeping our air safe and reducing factory pollution.",
    draw: (ctx, progress) => {
      drawPrecipitatorFrame(ctx);
      // Clean air waves exiting right
      drawFlowArrows(ctx, 450, 150, 600, 150, '#00ff87');
      
      const cleanGasOffsets = [
        { dx: 10, dy: 95 },
        { dx: 90, dy: 25 },
        { dx: 45, dy: 70 },
        { dx: 115, dy: 90 },
        { dx: 60, dy: 15 },
        { dx: 130, dy: 50 },
        { dx: 25, dy: 40 },
        { dx: 95, dy: 105 }
      ];

      // A few small clean gas particles drifting out
      for(let i=0; i<8; i++) {
        let offset = cleanGasOffsets[i];
        let x = 430 + offset.dx + (progress * 100);
        let y = 80 + offset.dy * 1.2;
        ctx.fillStyle = 'rgba(0, 255, 135, 0.4)';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI*2);
        ctx.fill();
      }
    }
  }
];

function initConceptIntro() {
  const canvas = document.getElementById('introCanvas');
  introCtx = canvas.getContext('2d');
  
  document.getElementById('introPrevBtn').addEventListener('click', () => {
    if (state.conceptStep > 0) {
      state.conceptStep--;
      renderConceptStep();
    }
  });

  document.getElementById('introNextBtn').addEventListener('click', () => {
    if (state.conceptStep < introStages.length - 1) {
      state.conceptStep++;
      renderConceptStep();
    } else {
      // Direct user to interactive section
      document.querySelector('[data-target="explore"]').click();
    }
  });

  renderConceptStep();
}

function renderConceptStep() {
  // Update Buttons & Progress Fill
  document.getElementById('introPrevBtn').disabled = (state.conceptStep === 0);
  document.getElementById('introNextBtn').textContent = (state.conceptStep === introStages.length - 1) ? "Explore Simulator ➡️" : "Next Step";
  
  const progressPercent = ((state.conceptStep + 1) / introStages.length) * 100;
  document.getElementById('introProgressFill').style.width = `${progressPercent}%`;

  document.getElementById('stepDescription').textContent = introStages[state.conceptStep].desc;

  // Render animation loop for this stage
  if (introAnimationTimer) cancelAnimationFrame(introAnimationTimer);
  
  let start = null;
  function animate(timestamp) {
    if (!start) start = timestamp;
    let elapsed = (timestamp - start) % 2000;
    let progress = elapsed / 2000; // 0 to 1

    introCtx.clearRect(0, 0, 700, 280);
    introStages[state.conceptStep].draw(introCtx, progress);
    
    introAnimationTimer = requestAnimationFrame(animate);
  }
  introAnimationTimer = requestAnimationFrame(animate);
}

// Helpers for Drawing Precipitator Layout
function drawPrecipitatorFrame(ctx) {
  // Chimney boundaries
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 3;
  ctx.strokeRect(20, 20, 660, 270);

  // Grounded Plates (Top & Bottom)
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(300, 35, 200, 10);
  ctx.fillRect(300, 255, 200, 10);
  
  ctx.strokeStyle = '#00f2fe';
  ctx.lineWidth = 2;
  ctx.strokeRect(300, 35, 200, 10);
  ctx.strokeRect(300, 255, 200, 10);

  // Ground Symbols
  drawGroundSymbol(ctx, 400, 30);
  drawGroundSymbol(ctx, 400, 270);

  // High Voltage Grid Wire
  ctx.strokeStyle = '#fe0979';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(250, 40);
  ctx.lineTo(250, 260);
  ctx.stroke();

  // Labels
  ctx.fillStyle = '#64748b';
  ctx.font = '10px Outfit';
  ctx.fillText('INLET (DIRTY GAS)', 30, 280);
  ctx.fillText('OUTLET (CLEAN)', 590, 280);
  
  // Collection Bin below lower plate
  ctx.strokeStyle = '#ffd000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(330, 265);
  ctx.lineTo(350, 285);
  ctx.lineTo(450, 285);
  ctx.lineTo(470, 265);
  ctx.stroke();
  
  ctx.fillStyle = '#ffd000';
  ctx.fillText('BIN', 393, 280);
}

function drawGroundSymbol(ctx, x, y) {
  ctx.strokeStyle = '#00f2fe';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - 8, y);
  ctx.lineTo(x + 8, y);
  ctx.moveTo(x - 5, y + 3);
  ctx.lineTo(x + 5, y + 3);
  ctx.moveTo(x - 2, y + 6);
  ctx.lineTo(x + 2, y + 6);
  ctx.stroke();
}

function drawParticle(ctx, x, y, type) {
  ctx.beginPath();
  if (type === 'negative') {
    ctx.fillStyle = '#fe0979';
    ctx.arc(x, y, 6, 0, Math.PI*2);
    ctx.fill();
    // minus sign
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 3, y);
    ctx.lineTo(x + 3, y);
    ctx.stroke();
  } else {
    // Neutral particle
    ctx.fillStyle = '#64748b';
    ctx.arc(x, y, 5, 0, Math.PI*2);
    ctx.fill();
  }
}

function drawFlowArrows(ctx, x1, y1, x2, y2, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  
  // Arrow head
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x2, y2 - 6);
  ctx.lineTo(x2 + 8, y2);
  ctx.lineTo(x2, y2 + 6);
  ctx.fill();
}

// --- SECTION 2A: WALKTHROUGH SCHEMATIC ---

const walkthroughComponents = [
  { name: "Dirty Gas Inlet", role: "Industrial smoke containing ash, soot, and neutral dust particles enters from the factory furnace here." },
  { name: "Negatively Charged Wire Grid", role: "Connected to high voltage, this grid ionizes air molecules, generating free electrons to charge passing dust particles." },
  { name: "Charged Dust Particles", role: "Dust particles gain electrons in the grid zone, acquiring a net negative charge that subjects them to electric fields." },
  { name: "Grounded Collecting Plates", role: "Maintained at zero potential (positive relative to the highly negative wires), they attract and capture negative dust particles." },
  { name: "Collection Bin", role: "Ash drops into this bin when plates vibrate. Collected soot is then safely cleared, keeping chimney gases clean." },
  { name: "Clean Gas Outlet", role: "With particles trapped on the plates, only purified, dust-free gas escapes through the factory stack." }
];

let walkthroughCtx;
let walkthroughAnimTimer;

function initWalkthrough() {
  const canvas = document.getElementById('walkthroughCanvas');
  walkthroughCtx = canvas.getContext('2d');
  
  // Subtabs toggles
  document.getElementById('btnWalkthrough').addEventListener('click', () => {
    document.getElementById('btnWalkthrough').classList.add('active');
    document.getElementById('btnGame').classList.remove('active');
    document.getElementById('walkthroughContainer').style.display = 'block';
    document.getElementById('gameContainer').style.display = 'none';
    stopGame();
  });

  document.getElementById('btnGame').addEventListener('click', () => {
    document.getElementById('btnGame').classList.add('active');
    document.getElementById('btnWalkthrough').classList.remove('active');
    document.getElementById('walkthroughContainer').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'block';
    if (walkthroughAnimTimer) cancelAnimationFrame(walkthroughAnimTimer);
  });

  // Hotspots clicks
  const hotspots = document.querySelectorAll('.hotspot');
  hotspots.forEach(hs => {
    hs.addEventListener('click', () => {
      hotspots.forEach(h => h.classList.remove('active'));
      hs.classList.add('active');
      hs.classList.add('tapped');
      
      const idx = parseInt(hs.dataset.idx);
      state.walkthroughTapped.add(idx);
      
      document.getElementById('walkthroughText').innerHTML = `
        <strong>${walkthroughComponents[idx].name}:</strong><br>
        ${walkthroughComponents[idx].role}
      `;

      // Check if all tapped
      if (state.walkthroughTapped.size === 6) {
        document.getElementById('walkthroughPlayBtn').style.display = 'inline-flex';
      }
    });
  });

  document.getElementById('walkthroughPlayBtn').addEventListener('click', playWalkthroughCycle);

  drawWalkthroughStatic();
}

function drawWalkthroughStatic() {
  walkthroughCtx.clearRect(0, 0, 700, 320);
  // Boundary Box
  walkthroughCtx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  walkthroughCtx.strokeRect(10, 10, 680, 300);

  // Grounded Plates
  walkthroughCtx.fillStyle = 'rgba(0, 242, 254, 0.1)';
  walkthroughCtx.fillRect(250, 40, 250, 15);
  walkthroughCtx.fillRect(250, 260, 250, 15);
  
  walkthroughCtx.strokeStyle = '#00f2fe';
  walkthroughCtx.strokeRect(250, 40, 250, 15);
  walkthroughCtx.strokeRect(250, 260, 250, 15);
  drawGroundSymbol(walkthroughCtx, 375, 30);
  drawGroundSymbol(walkthroughCtx, 375, 285);

  // High voltage wire grid
  walkthroughCtx.strokeStyle = '#fe0979';
  walkthroughCtx.lineWidth = 3;
  walkthroughCtx.beginPath();
  walkthroughCtx.moveTo(220, 50);
  walkthroughCtx.lineTo(220, 270);
  walkthroughCtx.stroke();

  // Bin
  walkthroughCtx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  walkthroughCtx.beginPath();
  walkthroughCtx.moveTo(240, 290);
  walkthroughCtx.lineTo(260, 310);
  walkthroughCtx.lineTo(490, 310);
  walkthroughCtx.lineTo(510, 290);
  walkthroughCtx.stroke();
  
  walkthroughCtx.fillStyle = '#64748b';
  walkthroughCtx.font = '13px Outfit';
  walkthroughCtx.fillText("Dirty Gas Inlet", 20, 160);
  walkthroughCtx.fillText("Clean Gas Outlet", 550, 160);
}

function playWalkthroughCycle() {
  if (state.walkthroughPlaying) return;
  state.walkthroughPlaying = true;
  document.getElementById('walkthroughPlayBtn').disabled = true;

  let start = null;
  function anim(timestamp) {
    if (!start) start = timestamp;
    let elapsed = timestamp - start;
    let progress = (elapsed % 3000) / 3000;

    walkthroughCtx.clearRect(0, 0, 700, 320);
    drawWalkthroughStatic();

    // Spawn animated demo particles
    for (let i = 0; i < 12; i++) {
      let phase = (progress + i/12) % 1;
      let x = 80 + phase * 480;
      let y = 100 + (i * 11) % 120;
      
      let type = 'neutral';
      if (x > 220 && x < 350) {
        type = 'negative';
      } else if (x >= 350) {
        // attracted to plates
        type = 'negative';
        let targetY = (i % 2 === 0) ? 55 : 255;
        let pullFactor = Math.min(1, (x - 300) / 100);
        y = y + (targetY - y) * pullFactor;
      }
      
      if (x < 460 || (x >= 460 && y > 60 && y < 250)) {
        drawParticle(walkthroughCtx, x, y, type);
      }
    }

    if (elapsed < 6000) {
      walkthroughAnimTimer = requestAnimationFrame(anim);
    } else {
      state.walkthroughPlaying = false;
      document.getElementById('walkthroughPlayBtn').disabled = false;
      drawWalkthroughStatic();
    }
  }
  walkthroughAnimTimer = requestAnimationFrame(anim);
}

// --- SECTION 2B: PARTICLE CHARGING SIMULATOR GAME ---

let gameCanvas;
let gameCtx;
let gameParticles = [];
let gameSpawnTimer = 0;

class GameParticle {
  constructor(speedMul) {
    this.x = -15;
    this.y = 60 + Math.random() * (gameCanvas.height - 120);
    this.vx = (1.5 + Math.random() * 1.5) * speedMul;
    this.vy = 0;
    this.radius = 7;
    this.charged = false;
    this.collected = false;
    this.alpha = 1.0;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    
    // If charged, deflect towards closest plate (top/bottom)
    if (this.charged && !this.collected) {
      let targetY = (this.y < gameCanvas.height / 2) ? 25 : (gameCanvas.height - 25);
      // Accelerate vertical velocity towards the plate
      this.vy += (targetY - this.y) * 0.012;
      
      // Check collision with plates
      if (this.y <= 32 || this.y >= gameCanvas.height - 32) {
        this.collected = true;
        this.vx = 0;
        this.vy = 0;
        state.gameScore++;
        document.getElementById('gameScore').textContent = state.gameScore;
      }
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
    if (this.charged) {
      ctx.fillStyle = '#fe0979';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#fe0979';
      ctx.fill();
      
      // Minus symbol
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.x - 4, this.y);
      ctx.lineTo(this.x + 4, this.y);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#94a3b8';
      ctx.fill();
    }
    ctx.restore();
  }
}

function initGameTab() {
  gameCanvas = document.getElementById('gameCanvas');
  gameCtx = gameCanvas.getContext('2d');
  
  // Fit canvas to container size
  resizeGameCanvas();
  window.addEventListener('resize', resizeGameCanvas);

  document.getElementById('startGameBtn').addEventListener('click', startGame);
  
  // Clicking/Tapping Canvas
  gameCanvas.addEventListener('mousedown', handleGameInteraction);
  gameCanvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleGameInteraction(touch);
  });
}

function resizeGameCanvas() {
  const container = document.getElementById('gameCanvasContainer');
  if (container) {
    gameCanvas.width = container.clientWidth;
    gameCanvas.height = container.clientHeight;
  }
}

function handleGameInteraction(event) {
  if (!state.gameActive) return;
  
  const rect = gameCanvas.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;

  // Find if tapped inside a particle in grid area (grid area: x between 100 and 190)
  for (let p of gameParticles) {
    if (!p.charged && !p.collected) {
      let dist = Math.hypot(p.x - clickX, p.y - clickY);
      // Give a generous hit area for mobile devices
      if (dist < 32) {
        // Particle must be near grid zone to charge successfully
        if (p.x >= 90 && p.x <= 200) {
          p.charged = true;
          // Spawn little click splash
          createExplosion(p.x, p.y);
          break;
        }
      }
    }
  }
}

function createExplosion(x, y) {
  // Simple spark visual indicator
  gameCtx.save();
  gameCtx.strokeStyle = '#00ff87';
  gameCtx.lineWidth = 2;
  for (let i = 0; i < 8; i++) {
    let angle = (i / 8) * Math.PI * 2;
    gameCtx.beginPath();
    gameCtx.moveTo(x, y);
    gameCtx.lineTo(x + Math.cos(angle)*15, y + Math.sin(angle)*15);
    gameCtx.stroke();
  }
  gameCtx.restore();
}

function startGame() {
  state.gameActive = true;
  state.gameScore = 0;
  state.gameTotalSpawned = 0;
  state.gameTimeLeft = 45;
  state.gameSpeedMultiplier = 1.0;
  gameParticles = [];
  
  document.getElementById('gameScore').textContent = "0";
  document.getElementById('gameTime').textContent = "45s";
  document.getElementById('gameOverlay').style.display = 'none';
  document.getElementById('gameCanvasContainer').classList.add('active-border');

  // Game Loop Timer
  state.gameInterval = setInterval(() => {
    state.gameTimeLeft--;
    document.getElementById('gameTime').textContent = `${state.gameTimeLeft}s`;
    
    // Increase speed every 10 seconds
    if (state.gameTimeLeft % 10 === 0) {
      state.gameSpeedMultiplier += 0.25;
    }

    if (state.gameTimeLeft <= 0) {
      endGame();
    }
  }, 1000);

  runGameLoop();
}

function stopGame() {
  state.gameActive = false;
  if (state.gameInterval) {
    clearInterval(state.gameInterval);
  }
  document.getElementById('gameOverlay').style.display = 'flex';
  document.getElementById('gameCanvasContainer').classList.remove('active-border');
}

function endGame() {
  stopGame();
  
  // Update overlay text with results
  document.getElementById('gameOverlay').innerHTML = `
    <h3 style="font-size: 1.5rem; color: var(--neon-green); margin-bottom: 0.5rem;">Time's Up!</h3>
    <p style="font-size: 1.1rem; margin-bottom: 1rem;">You collected <strong style="color: var(--neon-cyan);">${state.gameScore}</strong> particles.</p>
    <button class="btn btn-pink" onclick="startGame()">Play Again</button>
  `;
  
  // Populate score into scoreboard
  document.getElementById('scoreGame').textContent = `${state.gameScore} Particles`;
}

function runGameLoop() {
  if (!state.gameActive) return;

  gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

  // Draw static components on Game Canvas
  // 1. Plates
  gameCtx.fillStyle = 'rgba(255,255,255,0.03)';
  gameCtx.fillRect(0, 0, gameCanvas.width, 25);
  gameCtx.fillRect(0, gameCanvas.height - 25, gameCanvas.width, 25);
  
  gameCtx.strokeStyle = 'rgba(0, 242, 254, 0.4)';
  gameCtx.lineWidth = 2;
  gameCtx.strokeRect(0, 0, gameCanvas.width, 25);
  gameCtx.strokeRect(0, gameCanvas.height - 25, gameCanvas.width, 25);
  
  // 2. Wire Grid (Tapping zone)
  gameCtx.strokeStyle = 'rgba(254, 9, 121, 0.6)';
  gameCtx.setLineDash([6, 6]);
  gameCtx.beginPath();
  gameCtx.moveTo(140, 25);
  gameCtx.lineTo(140, gameCanvas.height - 25);
  gameCtx.stroke();
  gameCtx.setLineDash([]);
  
  gameCtx.fillStyle = 'rgba(254, 9, 121, 0.15)';
  gameCtx.fillRect(110, 25, 60, gameCanvas.height - 50);

  // Text details on canvas
  gameCtx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  gameCtx.font = '11px Outfit';
  gameCtx.fillText("Grounded Collecting Plate (+)", 15, 18);
  gameCtx.fillText("Grounded Collecting Plate (+)", 15, gameCanvas.height - 10);
  
  gameCtx.fillStyle = '#fe0979';
  gameCtx.fillText("CHARGE ZONE", 105, 40);

  // Spawning Particles
  gameSpawnTimer++;
  let spawnRate = Math.max(15, 45 - Math.floor(state.gameSpeedMultiplier * 10));
  if (gameSpawnTimer >= spawnRate) {
    gameParticles.push(new GameParticle(state.gameSpeedMultiplier));
    state.gameTotalSpawned++;
    gameSpawnTimer = 0;
  }

  // Update & Draw Particles
  for (let i = gameParticles.length - 1; i >= 0; i--) {
    let p = gameParticles[i];
    p.update();
    p.draw(gameCtx);

    // Remove off-screen particles
    if (p.x > gameCanvas.width + 20) {
      gameParticles.splice(i, 1);
    }
  }

  requestAnimationFrame(runGameLoop);
}

// --- SECTION 3: MCQ PRACTICE QUIZ ---

function initQuiz() {
  document.getElementById('quizNextBtn').addEventListener('click', () => {
    state.quizCurrentIdx++;
    showQuizQuestion();
  });
}

function startQuizAttempt() {
  // Shuffle pool and slice 10 questions
  const shuffled = [...quizPool].sort(() => 0.5 - Math.random());
  state.quizQuestions = shuffled.slice(0, 10);
  state.quizCurrentIdx = 0;
  state.quizScore = 0;
  state.quizAnswered = false;
  
  showQuizQuestion();
}

function showQuizQuestion() {
  state.quizAnswered = false;
  document.getElementById('quizNextBtn').style.display = 'none';
  document.getElementById('quizExplanationBox').classList.remove('visible');

  if (state.quizCurrentIdx >= 10) {
    // End of quiz
    document.getElementById('quizQuestionNum').textContent = "Quiz Completed";
    document.getElementById('quizQuestionText').textContent = "Excellent work completing the quiz! View your score report details.";
    document.getElementById('quizOptionsList').innerHTML = "";
    document.getElementById('scoreQuiz').textContent = `${state.quizScore} / 10 Correct`;
    switchSection('scoring');
    return;
  }

  const qData = state.quizQuestions[state.quizCurrentIdx];
  document.getElementById('quizQuestionNum').textContent = `Question ${state.quizCurrentIdx + 1} of 10`;
  document.getElementById('quizScoreTracker').textContent = `Score: ${state.quizScore}/${state.quizCurrentIdx}`;
  document.getElementById('quizQuestionText').textContent = qData.q;

  const optionsContainer = document.getElementById('quizOptionsList');
  optionsContainer.innerHTML = "";

  qData.o.forEach((opt, idx) => {
    const card = document.createElement('div');
    card.className = "option-card";
    card.innerHTML = `
      <div class="option-badge">${String.fromCharCode(65 + idx)}</div>
      <div>${opt}</div>
    `;
    card.addEventListener('click', () => handleQuizAnswer(idx, card));
    optionsContainer.appendChild(card);
  });
}

function handleQuizAnswer(selectedIdx, cardElement) {
  if (state.quizAnswered) return;
  state.quizAnswered = true;

  const qData = state.quizQuestions[state.quizCurrentIdx];
  const optionCards = document.querySelectorAll('#quizOptionsList .option-card');

  // Highlight correct answer
  optionCards[qData.a].classList.add('correct');

  const explanationBox = document.getElementById('quizExplanationBox');
  const expTitle = document.getElementById('quizExplanationTitle');
  const expDesc = document.getElementById('quizExplanationDesc');

  if (selectedIdx === qData.a) {
    state.quizScore++;
    // Confetti effect
    triggerConfetti();
    triggerCorrectBanner();
    
    expTitle.textContent = "Correct Answer!";
    expTitle.className = "explanation-title correct";
  } else {
    cardElement.classList.add('incorrect');
    expTitle.textContent = "Incorrect";
    expTitle.className = "explanation-title incorrect";
  }

  expDesc.textContent = qData.e;
  explanationBox.classList.add('visible');
  document.getElementById('quizNextBtn').style.display = 'inline-flex';
  
  // Update live tracker
  document.getElementById('quizScoreTracker').textContent = `Score: ${state.quizScore}/${state.quizCurrentIdx + 1}`;
}

// Celebration / Correct Answer Feedbacks
function triggerConfetti() {
  const container = document.getElementById('confettiContainer');
  container.innerHTML = "";
  
  for (let i = 0; i < 40; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 60%)`;
    piece.style.animationDelay = `${Math.random() * 0.4}s`;
    container.appendChild(piece);
  }
}

function triggerCorrectBanner() {
  const banner = document.getElementById('correctBanner');
  banner.classList.add('show');
  setTimeout(() => {
    banner.classList.remove('show');
  }, 1200);
}

// --- SECTION 4: SCORING & DIAGNOSTIC FEEDBACK ---

function updateScoringFeedback() {
  const walkthroughPoints = state.walkthroughTapped.size;
  const gamePoints = state.gameScore;
  const quizPoints = state.quizScore;

  document.getElementById('scoreWalkthrough').textContent = `${walkthroughPoints} / 6 Tapped`;
  document.getElementById('scoreGame').textContent = `${gamePoints} Particles`;
  
  // Calculate weighted percent
  // Walkthrough: max 6, counts 20%
  const walkthroughPct = (walkthroughPoints / 6) * 20;
  // Game: max 20 particles for full game score, counts 30%
  const gamePct = Math.min(30, (gamePoints / 20) * 30);
  // Quiz: max 10 correct answers, counts 50%
  const quizPct = (state.quizQuestions.length > 0) ? (quizPoints / 10) * 50 : 0;

  const totalPct = Math.round(walkthroughPct + gamePct + quizPct);
  document.getElementById('totalScorePercent').textContent = `${totalPct}%`;

  const circle = document.getElementById('totalScoreCircle');
  const headline = document.getElementById('feedbackHeadline');
  const message = document.getElementById('feedbackMessage');

  // Remove old tier classes
  circle.className = "score-circle";

  if (totalPct >= 80) {
    circle.classList.add('top-tier');
    headline.textContent = "🥇 Outstanding! Excellent Physics Mastery!";
    message.innerHTML = "Fantastic performance! You clearly understand electrostatic forces, charging mechanisms, and real-world precipitator operations. Keep up the high standards for your Singapore O-Level examination!";
  } else if (totalPct >= 50) {
    circle.classList.add('mid-tier');
    headline.textContent = "🥈 Good Job! Keep Polishing Your Concepts";
    message.innerHTML = "You have a solid foundation! To secure an A, focus on clarifying the <strong>polarity profiles</strong>: remember that the wire grid is highly negative, passing particles acquire a negative charge, and the grounded plates act positive relative to the wires.";
  } else {
    circle.classList.add('low-tier');
    headline.textContent = "🥉 Keep Practicing! Let's Rebuild Your Core Concepts";
    message.innerHTML = "Do not worry, physics takes practice! We suggest heading back to <strong>Section 1: Learn</strong> and trace a single dust particle from entry to final collection. Remember: Grid is negative -> Particle gets negative -> Attracts to neutral/grounded plate.";
  }
}

function resetSession() {
  state.walkthroughTapped.clear();
  state.gameScore = 0;
  state.quizScore = 0;
  
  document.getElementById('scoreWalkthrough').textContent = "0 / 6 Tapped";
  document.getElementById('scoreGame').textContent = "0 Particles";
  document.getElementById('scoreQuiz').textContent = "0 / 10 Correct";
  document.getElementById('totalScorePercent').textContent = "0%";
  
  // Reset walkthrough labels
  document.querySelectorAll('.hotspot').forEach(h => {
    h.classList.remove('tapped');
    h.classList.remove('active');
  });
  document.getElementById('walkthroughText').textContent = "Tap on any hotspot (1-6) on the diagram above to inspect that component.";
  document.getElementById('walkthroughPlayBtn').style.display = 'none';

  // Start fresh quiz
  startQuizAttempt();
  
  switchSection('concept');
}

// --- SECTION 5: FLASHCARDS REVISION MODE ---

function initFlashcards() {
  state.flashcards = [...flashcardData];
  
  const cardElement = document.getElementById('revisionCard');
  cardElement.addEventListener('click', () => {
    state.flashcardFlipped = !state.flashcardFlipped;
    if (state.flashcardFlipped) {
      cardElement.classList.add('flipped');
    } else {
      cardElement.classList.remove('flipped');
    }
  });

  document.getElementById('cardPrevBtn').addEventListener('click', () => {
    if (state.flashcardIdx > 0) {
      state.flashcardIdx--;
      state.flashcardFlipped = false;
      cardElement.classList.remove('flipped');
      updateFlashcardView();
    }
  });

  document.getElementById('cardNextBtn').addEventListener('click', () => {
    if (state.flashcardIdx < state.flashcards.length - 1) {
      state.flashcardIdx++;
      state.flashcardFlipped = false;
      cardElement.classList.remove('flipped');
      updateFlashcardView();
    }
  });

  document.getElementById('shuffleCardsBtn').addEventListener('click', () => {
    state.flashcards.sort(() => 0.5 - Math.random());
    state.flashcardIdx = 0;
    state.flashcardFlipped = false;
    cardElement.classList.remove('flipped');
    updateFlashcardView();
  });

  updateFlashcardView();
  
  // Start the first quiz attempt prep
  startQuizAttempt();
}

function updateFlashcardView() {
  const currentCard = state.flashcards[state.flashcardIdx];
  document.getElementById('cardFrontText').textContent = currentCard.q;
  document.getElementById('cardBackText').textContent = currentCard.a;
  document.getElementById('cardProgress').textContent = `Card ${state.flashcardIdx + 1} / ${state.flashcards.length}`;
  
  document.getElementById('cardPrevBtn').disabled = (state.flashcardIdx === 0);
  document.getElementById('cardNextBtn').disabled = (state.flashcardIdx === state.flashcards.length - 1);
}
