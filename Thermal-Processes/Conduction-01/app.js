// State variables
let currentSection = 'cond'; // Default to Conductor tab
let heatSourceActive = false; // Compare tab heat button
let condOnlyHeatSource = null; // 'left' or 'right' or null
let insOnlyHeatSource = null; // 'left' or 'right' or null

// Temperature arrays
let condOnlyTemperatures = Array(100).fill(0.0);
let insOnlyTemperatures = Array(100).fill(0.0);
let conductorTemperatures = Array(100).fill(0.0);
let insulatorTemperatures = Array(100).fill(0.0);

let animationFrameId = null;

// Atoms details
let condOnlyAtoms = [];
let insOnlyAtoms = [];
let conductorAtoms = [];
let insulatorAtoms = [];

// Electrons details
let condOnlyElectrons = [];
let conductorElectrons = [];

// Flashcards Data
const flashcardsData = [
  {
    q: "What is the definition of conduction?",
    a: "Conduction is the transfer of thermal energy through a medium without any flow of the medium itself."
  },
  {
    q: "What are the two mechanisms of heat conduction in solids?",
    a: "1. Atom/Lattice vibration (slow)\n2. Free electron diffusion (extremely fast, in metals only)"
  },
  {
    q: "Why are metals significantly better heat conductors than non-metals?",
    a: "Metals contain a high concentration of free/delocalised electrons that can rapidly drift and transfer kinetic energy through collisions."
  },
  {
    q: "Why do insulators conduct heat poorly?",
    a: "Insulators lack free electrons. Heat can only be transferred slowly through atomic/lattice vibrations passing from atom to atom."
  },
  {
    q: "What happens to the vibration amplitude of atoms as temperature increases?",
    a: "As temperature increases, the atoms gain kinetic energy, causing them to vibrate faster and with a larger amplitude about their fixed positions."
  },
  {
    q: "Why is the end furthest from the heat source the last to heat up?",
    a: "Thermal energy is transferred sequentially from particle to particle. It takes time for the vibrations and electron collisions to propagate across the solid lattice."
  },
  {
    q: "How does conduction differ at the microscopic level between conductors and insulators?",
    a: "Conductors use both rapid free-electron movement and slower lattice vibrations. Insulators only use slower, adjacent-particle lattice vibrations."
  },
  {
    q: "Name an everyday use of a conductor and an insulator.",
    a: "Conductor: Copper base in frying pans to heat food quickly. Insulator: Plastic handles on pans to protect hands from burning."
  }
];

let currentCardIndex = 0;
let isCardFlipped = false;

// 30-Question Quiz Pool
const quizQuestionsPool = [
  {
    q: "Which mechanism is responsible for heat conduction in a non-metal solid like wood?",
    options: ["Vibration of atoms only", "Movement of free electrons only", "Both vibration of atoms and movement of free electrons", "Flow of the solid material itself"],
    correct: 0,
    exp: "Insulators lack free electrons, so heat is conducted solely via atom vibrations."
  },
  {
    q: "Which mechanism allows metals to conduct heat much faster than non-metals?",
    options: ["Rapid movement of free electrons", "Expansion of the metal atoms", "Convection currents inside the solid lattice", "Radiation from the heated surface"],
    correct: 0,
    exp: "Free electrons gain kinetic energy and diffuse rapidly through the metal structure."
  },
  {
    q: "Which statement about insulators is correct?",
    options: ["Insulators conduct absolutely no heat at all.", "Insulators conduct heat via slower atom vibrations only.", "Insulators conduct heat faster than metals.", "Insulators have a high concentration of free electrons."],
    correct: 1,
    exp: "Insulators still conduct heat, but slowly through atom-to-atom vibrations."
  },
  {
    q: "If a heat source is placed at the left end of a metal bar, which part heats up last?",
    options: ["The right end", "The left end", "The exact middle", "All parts heat up at the same time"],
    correct: 0,
    exp: "Heat propagates from the hot source (left) to the cool end (right), making the right end last."
  },
  {
    q: "Which of the following contains ONLY electrical and thermal conductors?",
    options: ["Copper, Aluminium, Iron", "Glass, Rubber, Wood", "Steel, Plastic, Copper", "Aluminium, Air, Gold"],
    correct: 0,
    exp: "Copper, aluminium, and iron are all metals with abundant free electrons."
  },
  {
    q: "As the temperature of a solid block increases, how does the microscopic behavior of its atoms change?",
    options: ["They vibrate with larger amplitude and speed.", "They stop vibrating entirely.", "They begin to drift freely from left to right.", "They shrink in size."],
    correct: 0,
    exp: "Higher temperature means higher kinetic energy, leading to larger and faster oscillations."
  },
  {
    q: "A student observes a simulation showing small yellow dots moving rapidly and carrying energy. Which material is this likely representing?",
    options: ["A metal conductor", "A plastic insulator", "A glass block", "Vacuum"],
    correct: 0,
    exp: "The yellow dots represent free electrons, which are characteristic of metallic conductors."
  },
  {
    q: "What happens to the rate of conduction when you switch a heating bar from Conductor to Insulator mode?",
    options: ["The rate of conduction decreases noticeably.", "The rate of conduction increases.", "The rate of conduction remains identical.", "Conduction stops completely."],
    correct: 0,
    exp: "Without free electrons, heat transfer relies solely on slower lattice vibrations."
  },
  {
    q: "How is energy passed from one atom to the next during lattice vibration?",
    options: ["Vibrating atoms collide with and push neighboring atoms.", "Atoms swap places in the lattice.", "Atoms emit high-energy light waves to adjacent atoms.", "Atoms melt and flow to the cooler end."],
    correct: 0,
    exp: "Atoms are held in fixed positions and transfer energy by vibrating and bumping into neighbors."
  },
  {
    q: "Why does air act as an excellent insulator when trapped?",
    options: ["Its particles are far apart, making collisions very rare.", "It has too many free electrons.", "Air particles do not vibrate at all.", "It undergoes rapid convection."],
    correct: 0,
    exp: "In gases, particles are widely spaced, so energy transfer via collisions is extremely slow."
  },
  {
    q: "Which of the following is an everyday application of a thermal insulator?",
    options: ["Woolen blankets to reduce heat loss from the body", "Copper base of a kettle to boil water quickly", "Aluminium cooling fins in a computer", "Solder used to join electrical wires"],
    correct: 0,
    exp: "Wool traps air, reducing heat transfer from the body to the cold surroundings."
  },
  {
    q: "Which of the following is an everyday application of a thermal conductor?",
    options: ["An iron soldering tip to melt solder quickly", "Rubber handles on tools", "Double-glazed window panels", "A styrofoam hot cup"],
    correct: 0,
    exp: "The soldering tip must conduct heat rapidly to melt the solder wire."
  },
  {
    q: "Which material uses both lattice vibration and free electron diffusion to transfer heat?",
    options: ["Aluminium foil", "Wood block", "Glass pane", "Rubber sheet"],
    correct: 0,
    exp: "Aluminium is a metal (conductor) and utilizes both mechanisms."
  },
  {
    q: "What carries kinetic energy from the hot region of a metal to its cooler regions?",
    options: ["Fast-moving free electrons", "Protons drifting through the lattice", "Convection currents of liquid metal", "Static magnetic fields"],
    correct: 0,
    exp: "Free electrons diffuse from high-temperature areas to low-temperature areas, colliding with ions."
  },
  {
    q: "True or False: Heat transfer in a vacuum can occur by conduction.",
    options: ["False, conduction requires a physical medium.", "True, because electrons can travel through a vacuum.", "False, but only if the vacuum is cold.", "True, vacuum conducts heat very slowly."],
    correct: 0,
    exp: "Conduction requires particles to vibrate or collide, so it cannot happen in a vacuum."
  },
  {
    q: "In non-metal solids, why is thermal conduction a slow process?",
    options: ["Atoms are fixed and can only transfer energy to immediate neighbors.", "Atoms move too quickly.", "There are too many free electrons blocking the path.", "Non-metals are always cold."],
    correct: 0,
    exp: "Without free electrons to travel long distances, energy must slowly propagate atom-by-atom."
  },
  {
    q: "What is the role of free electrons in thermal conduction?",
    options: ["They drift through the lattice, carrying energy rapidly.", "They lock the atoms in place to stop vibration.", "They radiate infrared light out of the solid.", "They absorb all heat and turn it into electricity."],
    correct: 0,
    exp: "Free electrons act as fast-moving energy carriers, spreading heat throughout the material."
  },
  {
    q: "Which of the following best explains why a metal spoon feels colder than a wooden spoon at room temperature?",
    options: ["Metal conducts heat away from your hand faster.", "Metal is physically at a lower temperature.", "Wood generates its own thermal energy.", "Metal has a lower density than wood."],
    correct: 0,
    exp: "Both spoons are at room temperature, but metal conducts heat away from your warm fingers rapidly."
  },
  {
    q: "In the context of conduction, what does 'lattice' refer to?",
    options: ["The orderly 3D arrangement of atoms in a solid", "The speed at which electrons drift", "The liquid layer on the surface", "The heat source applied to the block"],
    correct: 0,
    exp: "A lattice is the regular, repeating geometric arrangement of particles in a crystalline solid."
  },
  {
    q: "Why do we use plastic handles for kitchen cookware?",
    options: ["Plastic is a poor conductor of heat, protecting hands.", "Plastic conducts heat quickly to cool the handle.", "Plastic has free electrons that disperse heat.", "Plastic increases the rate of boiling."],
    correct: 0,
    exp: "Plastic is an insulator, keeping the handle cool and safe to hold."
  },
  {
    q: "What happens when you heat one end of a solid metal rod?",
    options: ["Atoms at that end vibrate more vigorously and free electrons gain kinetic energy.", "Atoms start moving freely down the rod.", "The heated end contracts.", "The free electrons disappear."],
    correct: 0,
    exp: "Thermal energy increases the kinetic energy of both lattice atoms and free electrons at the heated end."
  },
  {
    q: "Which property is shared by most good electrical conductors?",
    options: ["They are also good thermal conductors.", "They are excellent insulators.", "They have no free electrons.", "They transfer heat only by radiation."],
    correct: 0,
    exp: "Free electrons are responsible for both electrical conduction and rapid thermal conduction."
  },
  {
    q: "If a heat source is placed at the right end of a bar, what is the direction of net heat flow?",
    options: ["From right to left", "From left to right", "From the center outward in both directions", "No net heat flow occurs"],
    correct: 0,
    exp: "Heat always flows from a region of higher temperature (right) to a region of lower temperature (left)."
  },
  {
    q: "Why is fiberglass used in home insulation?",
    options: ["It traps pockets of air, which is a poor conductor.", "It contains a high concentration of free electrons.", "It conducts heat out of the house rapidly.", "It accelerates lattice vibrations."],
    correct: 0,
    exp: "Trapped air is an excellent insulator because its particles are far apart and cannot easily transfer heat."
  },
  {
    q: "Which of the following describes the conduction mechanism in an iron nail?",
    options: ["Lattice vibrations AND free electron diffusion", "Lattice vibrations only", "Free electron diffusion only", "Convection currents only"],
    correct: 0,
    exp: "Iron is a metal, so it utilizes both lattice vibrations and free electron movements."
  },
  {
    q: "How does the density of a solid affect its conduction speed compared to a gas?",
    options: ["Higher density means closely packed particles, leading to faster conduction.", "Higher density slows down conduction because particles cannot move.", "Density has no effect on conduction.", "Gases conduct heat faster than solids."],
    correct: 0,
    exp: "Closely packed particles in solids collide and transfer energy much more easily than distant gas particles."
  },
  {
    q: "Why does wrapping food in aluminium foil help keep it warm?",
    options: ["Aluminium reflects radiation and traps warm air.", "Aluminium conducts cold away from the food.", "Aluminium is a poor thermal conductor.", "Aluminium generates thermal energy."],
    correct: 0,
    exp: "Foil reflects heat radiation back and prevents warm air from escaping through convection."
  },
  {
    q: "Which of the following materials would heat up slowest when placed in hot water?",
    options: ["Wood", "Copper", "Iron", "Aluminium"],
    correct: 0,
    exp: "Wood is an insulator, so heat conducts through it extremely slowly."
  },
  {
    q: "What is the temperature of the atoms at the cold end of a conducting bar compared to the hot end?",
    options: ["Lower, because they have less kinetic energy.", "Higher, because they vibrate faster.", "Equal, because they are in the same bar.", "Zero Kelvin absolute temperature."],
    correct: 0,
    exp: "Lower temperature corresponds to less kinetic energy and smaller vibration amplitudes."
  },
  {
    q: "In conduction, does any bulk movement of the solid material occur?",
    options: ["No, particles only vibrate about fixed positions.", "Yes, atoms flow from the hot end to the cold end.", "Yes, but only in metals.", "No, only electrons vibrate; atoms remain completely static."],
    correct: 0,
    exp: "Conduction involves energy transfer via vibrations/collisions, with no bulk transport of the medium."
  }
];

let quizSessionQuestions = [];
let quizCurrentIndex = 0;
let quizScore = 0;
let quizAnswered = false;

// Initialization
window.addEventListener('DOMContentLoaded', () => {
  // Switch to simulation immediately
  switchSection('cond');
  
  // Setup flashcards
  updateCardDisplay();

  // Setup canvas sizing
  setupCanvasSizes();
  window.addEventListener('resize', setupCanvasSizes);
});

function setupCanvasSizes() {
  // Individual Conductor Canvas sizing
  const condOnlyBlock = document.getElementById('cond-only-block-canvas');
  if (condOnlyBlock) {
    condOnlyBlock.width = condOnlyBlock.parentElement.clientWidth;
    condOnlyBlock.height = condOnlyBlock.parentElement.clientHeight;
  }
  const condOnlyCloseup = document.getElementById('cond-only-closeup-canvas');
  if (condOnlyCloseup) {
    condOnlyCloseup.width = condOnlyCloseup.parentElement.clientWidth;
    condOnlyCloseup.height = condOnlyCloseup.parentElement.clientHeight;
  }

  // Individual Insulator Canvas sizing
  const insOnlyBlock = document.getElementById('ins-only-block-canvas');
  if (insOnlyBlock) {
    insOnlyBlock.width = insOnlyBlock.parentElement.clientWidth;
    insOnlyBlock.height = insOnlyBlock.parentElement.clientHeight;
  }
  const insOnlyCloseup = document.getElementById('ins-only-closeup-canvas');
  if (insOnlyCloseup) {
    insOnlyCloseup.width = insOnlyCloseup.parentElement.clientWidth;
    insOnlyCloseup.height = insOnlyCloseup.parentElement.clientHeight;
  }

  // Compare Tab Canvas sizing
  const condBlockCanvas = document.getElementById('conductor-block-canvas');
  if (condBlockCanvas) {
    condBlockCanvas.width = condBlockCanvas.parentElement.clientWidth;
    condBlockCanvas.height = condBlockCanvas.parentElement.clientHeight;
  }
  const condCloseupCanvas = document.getElementById('conductor-closeup-canvas');
  if (condCloseupCanvas) {
    condCloseupCanvas.width = condCloseupCanvas.parentElement.clientWidth;
    condCloseupCanvas.height = condCloseupCanvas.parentElement.clientHeight;
  }
  const insBlockCanvas = document.getElementById('insulator-block-canvas');
  if (insBlockCanvas) {
    insBlockCanvas.width = insBlockCanvas.parentElement.clientWidth;
    insBlockCanvas.height = insBlockCanvas.parentElement.clientHeight;
  }
  const insCloseupCanvas = document.getElementById('insulator-closeup-canvas');
  if (insCloseupCanvas) {
    insCloseupCanvas.width = insCloseupCanvas.parentElement.clientWidth;
    insCloseupCanvas.height = insCloseupCanvas.parentElement.clientHeight;
  }
  
  initAtomsAndElectrons();
}

// Switch between panels
function switchSection(sectionId) {
  currentSection = sectionId;
  
  // Hide all sections
  document.querySelectorAll('.app-section').forEach(sec => sec.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  
  // Reset score containers
  document.getElementById('quiz-question-container').style.display = 'block';
  document.getElementById('quiz-score-container').style.display = 'none';

  if (sectionId === 'cond') {
    document.getElementById('section-cond').classList.add('active');
    document.getElementById('tab-cond').classList.add('active');
    setupCanvasSizes(); // Resize active canvases after making display flex
    startSimulationLoop();
  } else if (sectionId === 'ins') {
    document.getElementById('section-ins').classList.add('active');
    document.getElementById('tab-ins').classList.add('active');
    setupCanvasSizes(); // Resize active canvases after making display flex
    startSimulationLoop();
  } else if (sectionId === 'compare') {
    document.getElementById('section-compare').classList.add('active');
    document.getElementById('tab-compare').classList.add('active');
    setupCanvasSizes(); // Resize active canvases after making display flex
    startSimulationLoop();
  } else if (sectionId === 'cards') {
    document.getElementById('section-cards').classList.add('active');
    document.getElementById('tab-cards').classList.add('active');
    cancelAnimationFrame(animationFrameId);
  } else if (sectionId === 'quiz') {
    document.getElementById('section-quiz').classList.add('active');
    document.getElementById('tab-quiz').classList.add('active');
    cancelAnimationFrame(animationFrameId);
    startNewQuizSession();
  }
}



// ------------------- Simulation Engine -------------------
// ------------------- Simulation Engine -------------------
function initAtomsAndElectrons() {
  const condOnlyCanvas = document.getElementById('cond-only-closeup-canvas');
  const insOnlyCanvas = document.getElementById('ins-only-closeup-canvas');
  const condCanvas = document.getElementById('conductor-closeup-canvas');
  const insCanvas = document.getElementById('insulator-closeup-canvas');
  
  if (!condOnlyCanvas || !insOnlyCanvas || !condCanvas || !insCanvas) return;

  const cols = 8;
  const rows = 3;

  function fillGrid(canvas, atomsArray) {
    atomsArray.length = 0;
    const colSpacing = canvas.width / (cols + 1);
    const rowSpacing = canvas.height / (rows + 1);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        atomsArray.push({
          defaultX: colSpacing * (c + 1),
          defaultY: rowSpacing * (r + 1),
          x: colSpacing * (c + 1),
          y: rowSpacing * (r + 1),
          phase: Math.random() * Math.PI * 2,
          phaseY: Math.random() * Math.PI * 2
        });
      }
    }
  }

  function fillElectrons(canvas, electronsArray) {
    electronsArray.length = 0;
    for (let i = 0; i < 30; i++) {
      electronsArray.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        color: '#ffeb3b'
      });
    }
  }

  fillGrid(condOnlyCanvas, condOnlyAtoms);
  fillGrid(insOnlyCanvas, insOnlyAtoms);
  fillGrid(condCanvas, conductorAtoms);
  fillGrid(insCanvas, insulatorAtoms);

  fillElectrons(condOnlyCanvas, condOnlyElectrons);
  fillElectrons(condCanvas, conductorElectrons);
}

function startSimultaneousHeating() {
  heatSourceActive = true;
}

function resetSimulation() {
  heatSourceActive = false;
  conductorTemperatures.fill(0.0);
  insulatorTemperatures.fill(0.0);
}

function resetSingleSimulation(type) {
  if (type === 'cond') {
    condOnlyHeatSource = null;
    condOnlyTemperatures.fill(0.0);
    const hint = document.getElementById('cond-canvas-hint');
    if (hint) hint.style.display = 'block';
  } else if (type === 'ins') {
    insOnlyHeatSource = null;
    insOnlyTemperatures.fill(0.0);
    const hint = document.getElementById('ins-canvas-hint');
    if (hint) hint.style.display = 'block';
  }
}

function handleSingleBlockClick(type, event) {
  const canvas = document.getElementById(type === 'cond' ? 'cond-only-block-canvas' : 'ins-only-block-canvas');
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const clickPercent = clickX / rect.width;

  const hint = document.getElementById(type === 'cond' ? 'cond-canvas-hint' : 'ins-canvas-hint');
  if (hint) hint.style.display = 'none';

  if (type === 'cond') {
    condOnlyHeatSource = clickPercent < 0.5 ? 'left' : 'right';
  } else {
    insOnlyHeatSource = clickPercent < 0.5 ? 'left' : 'right';
  }
}

function startSimulationLoop() {
  if (animationFrameId) cancelAnimationFrame(animationFrameId);

  const condOnlyBlock = document.getElementById('cond-only-block-canvas');
  const condOnlyCloseup = document.getElementById('cond-only-closeup-canvas');
  const insOnlyBlock = document.getElementById('ins-only-block-canvas');
  const insOnlyCloseup = document.getElementById('ins-only-closeup-canvas');
  const condBlockCanvas = document.getElementById('conductor-block-canvas');
  const condCloseupCanvas = document.getElementById('conductor-closeup-canvas');
  const insBlockCanvas = document.getElementById('insulator-block-canvas');
  const insCloseupCanvas = document.getElementById('insulator-closeup-canvas');

  const condOnlyBlockCtx = condOnlyBlock?.getContext('2d');
  const condOnlyCloseupCtx = condOnlyCloseup?.getContext('2d');
  const insOnlyBlockCtx = insOnlyBlock?.getContext('2d');
  const insOnlyCloseupCtx = insOnlyCloseup?.getContext('2d');
  const condBlockCtx = condBlockCanvas?.getContext('2d');
  const condCloseupCtx = condCloseupCanvas?.getContext('2d');
  const insBlockCtx = insBlockCanvas?.getContext('2d');
  const insCloseupCtx = insCloseupCanvas?.getContext('2d');

  function loop() {
    if (currentSection !== 'cond' && currentSection !== 'ins' && currentSection !== 'compare') return;

    // Run the heat transfer calculations 8 times per frame
    for (let i = 0; i < 8; i++) {
      updateHeatTransfer();
    }
    
    if (currentSection === 'cond' && condOnlyBlockCtx && condOnlyCloseupCtx) {
      drawBlock(condOnlyBlockCtx, condOnlyBlock, condOnlyTemperatures, condOnlyHeatSource);
      drawCloseup(condOnlyCloseupCtx, condOnlyCloseup, condOnlyTemperatures, true, condOnlyAtoms, condOnlyElectrons, condOnlyHeatSource);
    } else if (currentSection === 'ins' && insOnlyBlockCtx && insOnlyCloseupCtx) {
      drawBlock(insOnlyBlockCtx, insOnlyBlock, insOnlyTemperatures, insOnlyHeatSource);
      drawCloseup(insOnlyCloseupCtx, insOnlyCloseup, insOnlyTemperatures, false, insOnlyAtoms, [], insOnlyHeatSource);
    } else if (currentSection === 'compare' && condBlockCtx && condCloseupCtx && insBlockCtx && insCloseupCtx) {
      drawBlock(condBlockCtx, condBlockCanvas, conductorTemperatures, heatSourceActive ? 'left' : null);
      drawCloseup(condCloseupCtx, condCloseupCanvas, conductorTemperatures, true, conductorAtoms, conductorElectrons, heatSourceActive ? 'left' : null);

      drawBlock(insBlockCtx, insBlockCanvas, insulatorTemperatures, heatSourceActive ? 'left' : null);
      drawCloseup(insCloseupCtx, insCloseupCanvas, insulatorTemperatures, false, insulatorAtoms, [], heatSourceActive ? 'left' : null);
    }

    animationFrameId = requestAnimationFrame(loop);
  }

  animationFrameId = requestAnimationFrame(loop);
}

function updateHeatTransfer() {
  // 1. Conductor Only
  if (condOnlyHeatSource === 'left') {
    condOnlyTemperatures[0] = 1.0;
  } else if (condOnlyHeatSource === 'right') {
    condOnlyTemperatures[99] = 1.0;
  }

  // 2. Insulator Only
  if (insOnlyHeatSource === 'left') {
    insOnlyTemperatures[0] = 1.0;
  } else if (insOnlyHeatSource === 'right') {
    insOnlyTemperatures[99] = 1.0;
  }

  // 3. Compare Tab
  if (heatSourceActive) {
    conductorTemperatures[0] = 1.0;
    insulatorTemperatures[0] = 1.0;
  }

  // Diffusion Rates
  const condDiffRate = 0.3;
  const insDiffRate = 0.05;

  const condOnlyCopy = [...condOnlyTemperatures];
  const insOnlyCopy = [...insOnlyTemperatures];
  const condCopy = [...conductorTemperatures];
  const insCopy = [...insulatorTemperatures];

  for (let i = 1; i < 99; i++) {
    condOnlyTemperatures[i] = condOnlyCopy[i] + condDiffRate * (condOnlyCopy[i-1] - 2*condOnlyCopy[i] + condOnlyCopy[i+1]);
    insOnlyTemperatures[i] = insOnlyCopy[i] + insDiffRate * (insOnlyCopy[i-1] - 2*insOnlyCopy[i] + insOnlyCopy[i+1]);
    
    conductorTemperatures[i] = condCopy[i] + condDiffRate * (condCopy[i-1] - 2*condCopy[i] + condCopy[i+1]);
    insulatorTemperatures[i] = insCopy[i] + insDiffRate * (insCopy[i-1] - 2*insCopy[i] + insCopy[i+1]);
  }

  // Boundaries behavior for Conductor Only
  if (condOnlyHeatSource !== 'left') {
    condOnlyTemperatures[0] = condOnlyCopy[0] + condDiffRate * (condOnlyCopy[1] - condOnlyCopy[0]);
  }
  if (condOnlyHeatSource !== 'right') {
    condOnlyTemperatures[99] = condOnlyCopy[99] + condDiffRate * (condOnlyCopy[98] - condOnlyCopy[99]);
  }

  // Boundaries behavior for Insulator Only
  if (insOnlyHeatSource !== 'left') {
    insOnlyTemperatures[0] = insOnlyCopy[0] + insDiffRate * (insOnlyCopy[1] - insOnlyCopy[0]);
  }
  if (insOnlyHeatSource !== 'right') {
    insOnlyTemperatures[99] = insOnlyCopy[99] + insDiffRate * (insOnlyCopy[98] - insOnlyCopy[99]);
  }

  // Boundaries behavior for Compare
  if (!heatSourceActive) {
    conductorTemperatures[0] = condCopy[0] + condDiffRate * (condCopy[1] - condCopy[0]);
    insulatorTemperatures[0] = insCopy[0] + insDiffRate * (insCopy[1] - insCopy[0]);
  }
  conductorTemperatures[99] = condCopy[99] + condDiffRate * (condCopy[98] - condCopy[99]);
  insulatorTemperatures[99] = insCopy[99] + insDiffRate * (insCopy[98] - insCopy[99]);
}

function drawBlock(ctx, canvas, temperatures, heatSourceSide) {
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  // Draw solid block with temperature gradient
  const blockX = 15;
  const blockY = 15;
  const blockW = w - 30;
  const blockH = h - 30;

  // Main block fill with dynamic gradients
  const grad = ctx.createLinearGradient(blockX, 0, blockX + blockW, 0);
  for (let i = 0; i < 100; i += 5) {
    const pos = i / 100;
    const temp = temperatures[i];
    
    // Mix cold neon (#00d2ff) with hot neon (#ff0055) based on local temp
    const r = Math.floor(0 * (1 - temp) + 255 * temp);
    const g = Math.floor(210 * (1 - temp) + 0 * temp);
    const b = Math.floor(255 * (1 - temp) + 85 * temp);
    grad.addColorStop(pos, `rgb(${r}, ${g}, ${b})`);
  }

  ctx.fillStyle = grad;
  ctx.fillRect(blockX, blockY, blockW, blockH);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 2;
  ctx.strokeRect(blockX, blockY, blockW, blockH);

  // Draw Heat Source indicator if active
  if (heatSourceSide === 'left') {
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ff0055';
    ctx.fillStyle = '#ff0055';
    ctx.beginPath();
    ctx.arc(blockX, blockY + blockH/2, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  } else if (heatSourceSide === 'right') {
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ff0055';
    ctx.fillStyle = '#ff0055';
    ctx.beginPath();
    ctx.arc(blockX + blockW, blockY + blockH/2, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

function drawCloseup(ctx, canvas, temperatures, showElectrons, atomsList, electronsList, activeHeatSource) {
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  // Update and draw atoms
  atomsList.forEach(atom => {
    // Determine local temperature from the global array
    const tempIndex = Math.min(Math.floor((atom.defaultX / w) * 100), 99);
    const temp = temperatures[tempIndex];

    // Atom vibration speed and amplitude scale with temperature
    const amp = 1.5 + temp * 7.5;
    const speed = 0.08 + temp * 0.25;
    atom.phase += speed;
    atom.phaseY += speed * 1.1;

    // Vibrational displacement from fixed anchor
    const dx = Math.sin(atom.phase) * amp;
    const dy = Math.cos(atom.phaseY) * amp;

    atom.x = atom.defaultX + dx;
    atom.y = atom.defaultY + dy;

    // Draw atom with motion blur or layered shadow circles
    const tempColor = `rgba(${Math.floor(255 * temp)}, ${Math.floor(210 * (1 - temp))}, ${Math.floor(255 * (1 - temp) + 85 * temp)}, 0.85)`;
    
    // Core atom
    ctx.beginPath();
    ctx.arc(atom.x, atom.y, 11, 0, Math.PI * 2);
    ctx.fillStyle = tempColor;
    ctx.shadowBlur = amp * 0.8;
    ctx.shadowColor = temp > 0.5 ? '#ff0055' : '#00d2ff';
    ctx.fill();
    ctx.shadowBlur = 0;

    // Inner glow
    ctx.beginPath();
    ctx.arc(atom.x, atom.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fill();
  });

  // Update and draw electrons (only if conductor mode)
  if (showElectrons && electronsList) {
    electronsList.forEach(el => {
      // Find local temperature
      const tempIndex = Math.min(Math.floor((el.x / w) * 100), 99);
      const temp = temperatures[tempIndex];

      // Electrons move faster near the hot end
      const speedMultiplier = 1.0 + temp * 4.0;
      
      // Random movement with horizontal bias away from active heat source
      let driftBias = 0;
      if (activeHeatSource === 'left') {
        driftBias = 1.5;
      } else if (activeHeatSource === 'right') {
        driftBias = -1.5;
      }

      el.vx += (Math.random() - 0.5) * 0.6 + driftBias * 0.15;
      el.vy += (Math.random() - 0.5) * 0.6;

      // Limit speed
      const currentSpeed = Math.sqrt(el.vx * el.vx + el.vy * el.vy);
      const targetSpeed = 2.0 * speedMultiplier;
      if (currentSpeed > targetSpeed) {
        el.vx = (el.vx / currentSpeed) * targetSpeed;
        el.vy = (el.vy / currentSpeed) * targetSpeed;
      }

      // Move electron
      el.x += el.vx;
      el.y += el.vy;

      // Wrap-around recycling to show continuous flow from hot source to cold end
      if (activeHeatSource === 'left') {
        if (el.x > w - 8) {
          el.x = 8;
          el.y = Math.random() * h;
        }
      } else if (activeHeatSource === 'right') {
        if (el.x < 8) {
          el.x = w - 8;
          el.y = Math.random() * h;
        }
      } else {
        // Standard wall bounce when no active heat source is applied
        if (el.x < 10) { el.x = 10; el.vx *= -1; }
        if (el.x > w - 10) { el.x = w - 10; el.vx *= -1; }
      }

      // Vertical bounce
      if (el.y < 10) { el.y = 10; el.vy *= -1; }
      if (el.y > h - 10) { el.y = h - 10; el.vy *= -1; }

      // Draw electron as bright neon yellow dot
      ctx.beginPath();
      ctx.arc(el.x, el.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = el.color;
      ctx.shadowBlur = 6;
      ctx.shadowColor = el.color;
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }
}

// ------------------- Flashcards Mode -------------------
function updateCardDisplay() {
  // Reset flipped state
  isCardFlipped = false;
  const card = document.getElementById('revision-card');
  if (card) card.classList.remove('flipped');
  renderCardText();
}

function renderCardText() {
  const qText = document.getElementById('card-question-text');
  const aText = document.getElementById('card-answer-text');
  const cardIndexText = document.getElementById('card-index-display');
  if (!qText || !aText || !cardIndexText) return;

  const currentCard = flashcardsData[currentCardIndex];
  qText.textContent = currentCard.q;
  aText.textContent = currentCard.a;
  cardIndexText.textContent = `${currentCardIndex + 1}/${flashcardsData.length}`;
}

function flipCard() {
  isCardFlipped = !isCardFlipped;
  const card = document.getElementById('revision-card');
  if (card) {
    if (isCardFlipped) {
      card.classList.add('flipped');
    } else {
      card.classList.remove('flipped');
    }
  }
}

function nextCard() {
  if (isCardFlipped) {
    isCardFlipped = false;
    const card = document.getElementById('revision-card');
    if (card) card.classList.remove('flipped');
    
    // Swap text mid-flip
    setTimeout(() => {
      currentCardIndex = (currentCardIndex + 1) % flashcardsData.length;
      renderCardText();
    }, 300);
  } else {
    currentCardIndex = (currentCardIndex + 1) % flashcardsData.length;
    renderCardText();
  }
}

function prevCard() {
  if (isCardFlipped) {
    isCardFlipped = false;
    const card = document.getElementById('revision-card');
    if (card) card.classList.remove('flipped');
    
    // Swap text mid-flip
    setTimeout(() => {
      currentCardIndex = (currentCardIndex - 1 + flashcardsData.length) % flashcardsData.length;
      renderCardText();
    }, 300);
  } else {
    currentCardIndex = (currentCardIndex - 1 + flashcardsData.length) % flashcardsData.length;
    renderCardText();
  }
}

function shuffleCards() {
  // Fisher-Yates shuffle
  for (let i = flashcardsData.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [flashcardsData[i], flashcardsData[j]] = [flashcardsData[j], flashcardsData[i]];
  }
  currentCardIndex = 0;

  if (isCardFlipped) {
    isCardFlipped = false;
    const card = document.getElementById('revision-card');
    if (card) card.classList.remove('flipped');
    
    // Swap text mid-flip
    setTimeout(() => {
      renderCardText();
    }, 300);
  } else {
    renderCardText();
  }
}

// ------------------- Quiz Mode -------------------
function startNewQuizSession() {
  // Shuffle and pick 10 questions
  const shuffledPool = [...quizQuestionsPool];
  for (let i = shuffledPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledPool[i], shuffledPool[j]] = [shuffledPool[j], shuffledPool[i]];
  }
  quizSessionQuestions = shuffledPool.slice(0, 10);
  quizCurrentIndex = 0;
  quizScore = 0;
  loadQuizQuestion();
}

function loadQuizQuestion() {
  quizAnswered = false;
  document.getElementById('quiz-next-btn').style.display = 'none';
  document.getElementById('quiz-feedback').style.display = 'none';

  const qData = quizSessionQuestions[quizCurrentIndex];
  document.getElementById('quiz-q-num').textContent = quizCurrentIndex + 1;
  document.getElementById('quiz-score-num').textContent = quizScore;
  document.getElementById('quiz-question-text').textContent = qData.q;
  
  // Calculate progress fill percentage
  const progressPercent = (quizCurrentIndex / 10) * 100;
  document.getElementById('quiz-progress-fill').style.width = `${progressPercent}%`;

  // Render options (randomized order)
  const optionsContainer = document.getElementById('quiz-options');
  optionsContainer.innerHTML = '';

  // Store original indices so we know which one is selected
  const mappedOptions = qData.options.map((opt, index) => ({ text: opt, originalIndex: index }));
  
  // Shuffle options
  for (let i = mappedOptions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [mappedOptions[i], mappedOptions[j]] = [mappedOptions[j], mappedOptions[i]];
  }

  mappedOptions.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option-btn';
    btn.textContent = opt.text;
    btn.onclick = () => selectQuizOption(opt.originalIndex, btn);
    optionsContainer.appendChild(btn);
  });
}

function selectQuizOption(selectedIndex, btnElement) {
  if (quizAnswered) return;
  quizAnswered = true;

  const qData = quizSessionQuestions[quizCurrentIndex];
  const isCorrect = (selectedIndex === qData.correct);

  // Disable all options
  const optionButtons = document.querySelectorAll('.quiz-option-btn');
  optionButtons.forEach(btn => btn.disabled = true);

  const feedbackDiv = document.getElementById('quiz-feedback');

  if (isCorrect) {
    btnElement.classList.add('correct');
    quizScore++;
    document.getElementById('quiz-score-num').textContent = quizScore;
    
    feedbackDiv.className = "quiz-feedback correct";
    feedbackDiv.textContent = `Correct! ${qData.exp}`;
  } else {
    btnElement.classList.add('incorrect');
    // Highlight correct option
    optionButtons.forEach(btn => {
      // Re-find which button has the correct answer
      // Since it's stored dynamically we find by comparing text
      if (btn.textContent === qData.options[qData.correct]) {
        btn.classList.add('correct');
      }
    });

    feedbackDiv.className = "quiz-feedback incorrect";
    feedbackDiv.textContent = `Incorrect. ${qData.exp}`;
  }

  feedbackDiv.style.display = 'block';
  document.getElementById('quiz-next-btn').style.display = 'block';
}

function handleQuizNext() {
  quizCurrentIndex++;
  if (quizCurrentIndex < 10) {
    loadQuizQuestion();
  } else {
    // Show Score Screen
    showScoreScreen();
  }
}

function showScoreScreen() {
  document.getElementById('quiz-question-container').style.display = 'none';
  document.getElementById('quiz-score-container').style.display = 'flex';
  
  // Fill progress bar fully
  document.getElementById('quiz-progress-fill').style.width = `100%`;

  const scoreCircle = document.getElementById('score-circle');
  const scoreTitle = document.getElementById('score-title');
  const scoreDesc = document.getElementById('score-desc');

  scoreCircle.textContent = `${quizScore}/10`;
  
  // Clear classes
  scoreCircle.className = "score-circle";

  if (quizScore >= 8) {
    scoreCircle.classList.add('excellent');
    scoreTitle.textContent = "Excellent!";
    scoreDesc.textContent = "You understand conduction at the microscopic level.";
    startCelebration();
  } else if (quizScore >= 5) {
    scoreCircle.style.borderColor = 'var(--cold-neon)';
    scoreCircle.style.boxShadow = 'var(--shadow-cold)';
    scoreTitle.textContent = "Good effort.";
    scoreDesc.textContent = "Review the difference between conductors and insulators.";
  } else {
    scoreCircle.classList.add('poor');
    scoreTitle.textContent = "Keep practising.";
    scoreDesc.textContent = "Go back to the simulation and watch the electron layer carefully.";
  }
}

function restartQuiz() {
  document.getElementById('quiz-question-container').style.display = 'block';
  document.getElementById('quiz-score-container').style.display = 'none';
  startNewQuizSession();
}

// ------------------- Celebration / Particles Effect -------------------
let particleAnimationId = null;
let celebrationParticles = [];

function startCelebration() {
  const canvas = document.getElementById('celebration-canvas');
  const ctx = canvas.getContext('2d');
  canvas.style.display = 'block';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  celebrationParticles = [];
  const colors = ['#ff0055', '#00d2ff', '#00ff88', '#ffeb3b'];

  // Spawn 100 particles from the center
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  for (let i = 0; i < 120; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 8;
    celebrationParticles.push({
      x: centerX,
      y: centerY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2, // Slight upward bias
      size: 3 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      decay: 0.015 + Math.random() * 0.02
    });
  }

  if (particleAnimationId) cancelAnimationFrame(particleAnimationId);

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;

    celebrationParticles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1; // gravity
      p.alpha -= p.decay;

      if (p.alpha > 0) {
        active = true;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.restore();
      }
    });

    if (active) {
      particleAnimationId = requestAnimationFrame(animateParticles);
    } else {
      canvas.style.display = 'none';
    }
  }

  animateParticles();
}
