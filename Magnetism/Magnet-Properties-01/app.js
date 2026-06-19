// Initialize Lucide Icons
lucide.createIcons();

// --- NAVIGATION & ROUTING ---
const navTabs = document.querySelectorAll('.nav-tab');
const appSections = document.querySelectorAll('.app-section');

navTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.getAttribute('data-target');
    
    // Update active tab
    navTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    // Update active section with smooth transition
    appSections.forEach(section => {
      section.classList.remove('active');
      if (section.id === `section-${target}`) {
        section.classList.add('active');
      }
    });

    // Re-render/reset specific sections if needed
    if (target === 'explore') {
      resetLabPositions();
    }
  });
});

// --- SECTION 2: INTERACTIVE LAB STATE ---
let labState = {
  mode: 'magnet', // 'magnet' or 'solenoid'
  material: 'iron', // 'iron' or 'steel'
  solenoidSwitch: false,
  isDragging: false,
  dragOffset: { x: 0, y: 0 },
  magnetised: false,
  steelPoles: null // Stores last poles if steel is permanently magnetised
};

// DOM Elements for Lab
const modeToggleBtns = document.querySelectorAll('#mode-toggle .toggle-btn');
const materialToggleBtns = document.querySelectorAll('#material-toggle .toggle-btn');
const playgroundMagnetMode = document.getElementById('playground-magnet-mode');
const playgroundSolenoidMode = document.getElementById('playground-solenoid-mode');
const dragBar = document.getElementById('draggable-bar');
const dragLabel = document.getElementById('drag-material-label');
const dragLeftPole = document.getElementById('drag-left-pole');
const dragRightPole = document.getElementById('drag-right-pole');
const solenoidSwitch = document.getElementById('solenoid-switch');
const solenoidLeftPole = document.getElementById('solenoid-left-pole');
const solenoidRightPole = document.getElementById('solenoid-right-pole');
const playground = document.getElementById('lab-playground');
const fieldFlowGlow = document.getElementById('field-flow-glow');

// Live Status Board Elements
const statusMaterial = document.getElementById('status-material');
const statusMagnetised = document.getElementById('status-magnetised');
const statusForce = document.getElementById('status-force');
const analysisText = document.getElementById('analysis-text');

// Lab Controls Toggles
modeToggleBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    modeToggleBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    labState.mode = btn.getAttribute('data-mode');

    if (labState.mode === 'magnet') {
      playgroundMagnetMode.classList.add('active-mode');
      playgroundSolenoidMode.classList.remove('active-mode');
    } else {
      playgroundMagnetMode.classList.remove('active-mode');
      playgroundSolenoidMode.classList.add('active-mode');
    }
    resetLabPositions();
  });
});

materialToggleBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    materialToggleBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    labState.material = btn.getAttribute('data-material');
    dragLabel.textContent = labState.material.toUpperCase();
    
    // Reset magnetization
    labState.magnetised = false;
    labState.steelPoles = null;
    updateAnalysis();
  });
});

solenoidSwitch.addEventListener('change', (e) => {
  labState.solenoidSwitch = e.target.checked;
  
  // Select all front windings and circuit components to glow together
  const circuitElements = document.querySelectorAll(
    '#playground-solenoid-mode .front-winding-line, ' +
    '#playground-solenoid-mode .circuit-feed-line, ' +
    '#playground-solenoid-mode .circuit-battery-line, ' +
    '#playground-solenoid-mode .circuit-resistor-box'
  );

  if (labState.solenoidSwitch) {
    solenoidLeftPole.classList.add('active-north');
    solenoidLeftPole.textContent = 'N';
    solenoidRightPole.classList.add('active-south');
    solenoidRightPole.textContent = 'S';
    circuitElements.forEach(el => el.classList.add('solenoid-active-glow'));
  } else {
    solenoidLeftPole.classList.remove('active-north');
    solenoidRightPole.classList.remove('active-south');
    circuitElements.forEach(el => el.classList.remove('solenoid-active-glow'));
  }
  updatePhysicsLogic();
});

// Pointer drag logic
dragBar.addEventListener('pointerdown', (e) => {
  labState.isDragging = true;
  dragBar.style.transition = 'none';
  const rect = dragBar.getBoundingClientRect();
  labState.dragOffset.x = e.clientX - rect.left;
  labState.dragOffset.y = e.clientY - rect.top;
  dragBar.setPointerCapture(e.pointerId);
});

dragBar.addEventListener('pointermove', (e) => {
  if (!labState.isDragging) return;
  const playRect = playground.getBoundingClientRect();
  
  // Calculate relative coordinates
  let left = e.clientX - playRect.left - labState.dragOffset.x;
  let top = e.clientY - playRect.top - labState.dragOffset.y;

  // Keep within playground limits
  const maxLeft = playRect.width - dragBar.offsetWidth;
  const maxTop = playRect.height - dragBar.offsetHeight;

  left = Math.max(0, Math.min(left, maxLeft));
  top = Math.max(0, Math.min(top, maxTop));

  dragBar.style.left = `${left}px`;
  dragBar.style.top = `${top}px`;

  updatePhysicsLogic();
});

const endDrag = (e) => {
  if (labState.isDragging) {
    labState.isDragging = false;
    dragBar.style.transition = 'left 0.2s, top 0.2s';
    updatePhysicsLogic();
  }
};

dragBar.addEventListener('pointerup', endDrag);
dragBar.addEventListener('pointercancel', endDrag);

function resetLabPositions() {
  dragBar.style.transition = 'none';
  dragBar.style.left = '30px';
  dragBar.style.top = '270px';
  labState.magnetised = false;
  labState.steelPoles = null;
  solenoidSwitch.checked = false;
  labState.solenoidSwitch = false;
  solenoidLeftPole.classList.remove('active-north');
  solenoidRightPole.classList.remove('active-south');
  updatePhysicsLogic();
}

function updatePhysicsLogic() {
  const barRect = dragBar.getBoundingClientRect();
  const playRect = playground.getBoundingClientRect();
  const barCenterX = barRect.left + barRect.width / 2;
  const barCenterY = barRect.top + barRect.height / 2;

  let isNearActiveSource = false;
  let nearestSourcePole = ''; // 'N' or 'S'
  let nearLeft = false; // Is the left end of the bar closer to the source pole than the right end?

  if (labState.mode === 'magnet') {
    // Bar Magnet configuration (Horizontal & Centered):
    // Center is (playRect.width/2, playRect.height/2). Width: 150px, Height: 50px.
    // South pole is on the left half, North pole is on the right half.
    const magnetCenterY = playRect.top + playRect.height / 2;
    const sPoleX = playRect.left + playRect.width / 2 - 37.5;
    const nPoleX = playRect.left + playRect.width / 2 + 37.5;

    // Draggable bar ends
    const dragLeftX = barRect.left;
    const dragRightX = barRect.right;
    const dragY = barRect.top + barRect.height / 2;

    // Distances
    const distLeftToN = Math.hypot(dragLeftX - nPoleX, dragY - magnetCenterY);
    const distRightToN = Math.hypot(dragRightX - nPoleX, dragY - magnetCenterY);
    const distLeftToS = Math.hypot(dragLeftX - sPoleX, dragY - magnetCenterY);
    const distRightToS = Math.hypot(dragRightX - sPoleX, dragY - magnetCenterY);

    const minDist = Math.min(distLeftToN, distRightToN, distLeftToS, distRightToS);

    if (minDist < 120) {
      isNearActiveSource = true;
      if (minDist === distLeftToN) {
        nearestSourcePole = 'N';
        nearLeft = true;
      } else if (minDist === distRightToN) {
        nearestSourcePole = 'N';
        nearLeft = false;
      } else if (minDist === distLeftToS) {
        nearestSourcePole = 'S';
        nearLeft = true;
      } else {
        nearestSourcePole = 'S';
        nearLeft = false;
      }
    }
  } else {
    // Solenoid configuration:
    // Check if the center of the draggable bar is inside the solenoid dropzone bounding box
    const dropzone = document.getElementById('solenoid-dropzone');
    if (dropzone && labState.solenoidSwitch) {
      const dropRect = dropzone.getBoundingClientRect();
      const isInsideDropzone = (
        barCenterX > dropRect.left &&
        barCenterX < dropRect.right &&
        barCenterY > dropRect.top &&
        barCenterY < dropRect.bottom
      );

      if (isInsideDropzone) {
        isNearActiveSource = true;
        labState.isInsideSolenoid = true;
      } else {
        labState.isInsideSolenoid = false;
        // Solenoid Left is North (N), Right is South (S)
        const nPoleX = dropRect.left;
        const sPoleX = dropRect.right;
        const poleY = dropRect.top + dropRect.height / 2;

        const dragLeftX = barRect.left;
        const dragRightX = barRect.right;
        const dragY = barRect.top + barRect.height / 2;

        const distLeftToN = Math.hypot(dragLeftX - nPoleX, dragY - poleY);
        const distRightToN = Math.hypot(dragRightX - nPoleX, dragY - poleY);
        const distLeftToS = Math.hypot(dragLeftX - sPoleX, dragY - poleY);
        const distRightToS = Math.hypot(dragRightX - sPoleX, dragY - poleY);

        const minDist = Math.min(distLeftToN, distRightToN, distLeftToS, distRightToS);

        if (minDist < 120) {
          isNearActiveSource = true;
          if (minDist === distLeftToN) {
            nearestSourcePole = 'N';
            nearLeft = true;
          } else if (minDist === distRightToN) {
            nearestSourcePole = 'N';
            nearLeft = false;
          } else if (minDist === distLeftToS) {
            nearestSourcePole = 'S';
            nearLeft = true;
          } else {
            nearestSourcePole = 'S';
            nearLeft = false;
          }
        }
      }
    } else {
      labState.isInsideSolenoid = false;
    }
  }

  // Handle induced magnetism rules
  if (isNearActiveSource) {
    labState.magnetised = true;
    
    let inducedLeftPole = '';
    let inducedRightPole = '';

    if (labState.mode === 'solenoid' && labState.isInsideSolenoid) {
      // Inside a solenoid: domains align with the internal field lines (from S to N).
      // Left end (near Solenoid N) becomes induced North (N).
      // Right end (near Solenoid S) becomes induced South (S).
      inducedLeftPole = 'N';
      inducedRightPole = 'S';
    } else {
      // Near a Bar Magnet or OUTSIDE an active Solenoid: Nearest end is induced with the OPPOSITE pole.
      if (nearLeft) {
        inducedLeftPole = (nearestSourcePole === 'N') ? 'S' : 'N';
        inducedRightPole = (inducedLeftPole === 'N') ? 'S' : 'N';
      } else {
        inducedRightPole = (nearestSourcePole === 'N') ? 'S' : 'N';
        inducedLeftPole = (inducedRightPole === 'N') ? 'S' : 'N';
      }
    }

    labState.steelPoles = { left: inducedLeftPole, right: inducedRightPole };
    setBarPoles(inducedLeftPole, inducedRightPole);
    
  } else {
    // Moved away or source turned off
    if (labState.material === 'iron') {
      labState.magnetised = false;
      clearBarPoles();
    } else {
      // Steel retains magnetism
      if (labState.steelPoles) {
        labState.magnetised = true;
        setBarPoles(labState.steelPoles.left, labState.steelPoles.right);
      } else {
        labState.magnetised = false;
        clearBarPoles();
      }
    }
  }

  updateAnalysis();
}

function setBarPoles(left, right) {
  dragLeftPole.textContent = left;
  dragRightPole.textContent = right;

  if (left === 'N') {
    dragLeftPole.className = 'pole-indicator left-pole active-n';
    dragRightPole.className = 'pole-indicator right-pole active-s';
  } else {
    dragLeftPole.className = 'pole-indicator left-pole active-s';
    dragRightPole.className = 'pole-indicator right-pole active-n';
  }

  // Apply glowing container classes
  dragBar.className = `draggable-material magnetized-${labState.material}`;
}

function clearBarPoles() {
  dragLeftPole.textContent = '';
  dragRightPole.textContent = '';
  dragLeftPole.className = 'pole-indicator left-pole';
  dragRightPole.className = 'pole-indicator right-pole';
  dragBar.className = 'draggable-material';
}

function updateAnalysis() {
  // Update Live Board
  statusMaterial.textContent = labState.material === 'iron' ? 'Iron (Temporary)' : 'Steel (Permanent)';
  statusMaterial.className = `stat-value ${labState.material === 'iron' ? 'text-cyan' : 'text-amber'}`;

  if (labState.magnetised) {
    if (labState.material === 'iron') {
      statusMagnetised.textContent = 'Magnetised (Induced)';
      statusMagnetised.className = 'stat-value text-cyan';
      statusForce.textContent = labState.mode === 'solenoid' ? 'Solenoid Alignment' : 'Strong Attraction';
      if (labState.mode === 'solenoid') {
        analysisText.innerHTML = `<strong>Iron (soft magnetic material)</strong> aligns its domains with the solenoid's internal magnetic field. The left end becomes **North (N)** and the right end becomes **South (S)**.`;
      } else {
        analysisText.innerHTML = `<strong>Iron (soft magnetic material)</strong> aligns its magnetic domains instantly. An opposite pole is induced at the closest end, creating a strong <strong>attractive force</strong>.`;
      }
    } else {
      statusMagnetised.textContent = 'Magnetised (Permanent)';
      statusMagnetised.className = 'stat-value text-amber';
      statusForce.textContent = labState.mode === 'solenoid' ? 'Solenoid Alignment' : 'Attraction / Retention';
      if (labState.mode === 'solenoid') {
        analysisText.innerHTML = `<strong>Steel (hard magnetic material)</strong> aligns its domains with the solenoid's internal magnetic field. It becomes magnetised with **North (N)** on the left and **South (S)** on the right.`;
      } else {
        analysisText.innerHTML = `<strong>Steel (hard magnetic material)</strong> retains its alignment of magnetic domains. It remains magnetised even after leaving the magnetic field.`;
      }
    }
  } else {
    statusMagnetised.textContent = 'Unmagnetised';
    statusMagnetised.className = 'stat-value';
    statusForce.textContent = 'None';
    if (labState.material === 'iron') {
      analysisText.textContent = `Iron demagnetises instantly because it is a soft magnetic material. The domains scramble as soon as the external field is removed.`;
    } else {
      analysisText.textContent = `Drag steel into the field to magnetise it. Steel requires a stronger force to align domains, but it will retain its poles.`;
    }
  }
}


// --- SECTION 3: FLASHCARDS DATA & CONTROLS ---
const flashcardsData = [
  { term: "Magnet", definition: "A material or object that produces a magnetic field and can attract magnetic materials." },
  { term: "Magnetic Material", definition: "A material that can be attracted by a magnet (e.g. Iron, Steel, Cobalt, Nickel)." },
  { term: "Induced Magnetism", definition: "The process where a magnetic material becomes a temporary magnet when placed inside a magnetic field." },
  { term: "Temporary Magnet", definition: "A magnet made of soft magnetic material (like iron) that magnetises easily but loses its magnetism quickly when removed from a magnetic field." },
  { term: "Permanent Magnet", definition: "A magnet made of hard magnetic material (like steel) that is hard to magnetise but retains its magnetism for a long time." },
  { term: "Magnetic Poles", definition: "Regions of a magnet where the magnetic forces are strongest. Every magnet has a North (N) and South (S) pole." },
  { term: "Law of Magnetism", definition: "Like poles repel each other; unlike poles attract each other." },
  { term: "Temporary Magnet Uses", definition: "Used in electromagnets, relays, electric bells, and magnetic cranes where magnetic force needs to be turned on/off." },
  { term: "Permanent Magnet Uses", definition: "Used in compasses, electric motors, dynamos, loudspeakers, fridge doors, and magnetic locks." },
  { term: "Induced Pole Rule", definition: "The induced pole closest to the inducing magnet is always an opposite pole, ensuring attraction occurs." }
];

let currentCardIndex = 0;
let shuffledCards = [...flashcardsData];

const flashcardDeck = document.getElementById('flashcard-deck');
const flashcardCounter = document.getElementById('flashcard-counter');
const prevCardBtn = document.getElementById('prev-card-btn');
const nextCardBtn = document.getElementById('next-card-btn');
const shuffleBtn = document.getElementById('btn-shuffle-flashcards');

function renderCard() {
  const card = shuffledCards[currentCardIndex];
  flashcardDeck.innerHTML = `
    <div class="flashcard" id="active-flashcard">
      <div class="card-face front">
        <h3>Front</h3>
        <p>${card.term}</p>
        <div class="tap-hint"><i data-lucide="help-circle"></i> Tap to flip</div>
      </div>
      <div class="card-face back">
        <h3>Back</h3>
        <p>${card.definition}</p>
        <div class="tap-hint"><i data-lucide="rotate-cw"></i> Tap to flip back</div>
      </div>
    </div>
  `;
  
  // Re-init lucide icons on the newly created card
  lucide.createIcons();
  
  flashcardCounter.textContent = `${currentCardIndex + 1} / ${shuffledCards.length}`;
  
  const activeCard = document.getElementById('active-flashcard');
  activeCard.addEventListener('click', () => {
    activeCard.classList.toggle('flipped');
  });
}

prevCardBtn.addEventListener('click', () => {
  currentCardIndex = (currentCardIndex - 1 + shuffledCards.length) % shuffledCards.length;
  renderCard();
});

nextCardBtn.addEventListener('click', () => {
  currentCardIndex = (currentCardIndex + 1) % shuffledCards.length;
  renderCard();
});

shuffleBtn.addEventListener('click', () => {
  // Fisher-Yates shuffle
  for (let i = shuffledCards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]];
  }
  currentCardIndex = 0;
  renderCard();
});

// Render first flashcard
renderCard();


// --- SECTION 4 & 5: QUIZ SYSTEM ---
const quizPool = [
  // 1-5 Induced Pole Polarity
  {
    q: "A soft iron nail is placed with its head near the North pole of a bar magnet. What is the induced polarity at the nail's tip (far end)?",
    options: ["North", "South", "No pole is induced", "It changes dynamically"],
    answer: 0,
    explanation: "The head of the nail (near end) gets an opposite pole (South) induced. Therefore, the tip of the nail (far end) becomes North."
  },
  {
    q: "Two steel pins hang from the South pole of a bar magnet. What happens to the free lower tips of the pins?",
    options: ["They attract and stick together", "They repel and swing apart", "They do not interact", "They fall off instantly"],
    answer: 1,
    explanation: "The top ends of the pins attached to the South pole become North poles. The lower free tips both become South poles. Since like poles repel, they repel and swing apart."
  },
  {
    q: "An unmagnetized steel bar is placed inside a solenoid. The left end of the solenoid becomes a South pole. What pole is induced on the left end of the steel bar?",
    options: ["North Pole", "South Pole", "No pole is induced", "Alternates between N and S"],
    answer: 0,
    explanation: "The induced pole closest to the inducing source is always the opposite. Since the left of the solenoid is South, the left of the steel bar is induced as a North pole."
  },
  {
    q: "Why does an unmagnetized iron bar always get attracted to either pole of a permanent magnet?",
    options: ["Its domains are already aligned", "Induced poles are always opposite to the nearest magnet pole", "Gravity pulls it towards the magnet", "Iron contains miniature currents"],
    answer: 1,
    explanation: "When brought near a magnet, the iron bar gets induced poles. The nearest side is always induced with an opposite pole, resulting in an attractive force."
  },
  {
    q: "An electromagnet has a North pole on the left. A temporary iron rod is placed next to it on the left. What is the induced pole on the right side of the iron rod?",
    options: ["North", "South", "Unmagnetised", "Both North and South"],
    answer: 1,
    explanation: "The right side of the iron rod is closest to the North pole of the electromagnet, so it becomes a South pole (opposite pole)."
  },
  
  // 6-10 Iron vs Steel retention
  {
    q: "Which of the following materials would be most suitable to make a permanent compass needle?",
    options: ["Soft Iron", "Steel", "Copper", "Aluminum"],
    answer: 1,
    explanation: "Steel is a hard magnetic material. It retains its magnetism for a long period, making it suitable for permanent magnets like compass needles."
  },
  {
    q: "An iron rod and a steel rod are placed inside a strong solenoid. The current is turned off. What is the state of magnetism in both rods?",
    options: [
      "Both remain highly magnetised",
      "Both lose all magnetism immediately",
      "Iron retains magnetism, steel loses it",
      "Steel retains magnetism, iron loses it"
    ],
    answer: 3,
    explanation: "Iron is a soft magnetic material and loses its induced magnetism quickly. Steel is a hard magnetic material and retains its magnetisation."
  },
  {
    q: "Why is soft iron used as the core of an electromagnet instead of steel?",
    options: [
      "Iron is harder to magnetise than steel",
      "Iron can be turned on and off easily as it loses magnetism quickly",
      "Iron becomes a permanent magnet",
      "Iron does not conduct electricity"
    ],
    answer: 1,
    explanation: "An electromagnet needs to be temporary. Soft iron magnetises and demagnetises easily, allowing the magnet to turn off when current is stopped."
  },
  {
    q: "Which property is characteristic of a 'hard' magnetic material?",
    options: [
      "Difficult to magnetise and loses magnetism easily",
      "Easy to magnetise and retains magnetism",
      "Difficult to magnetise and retains magnetism",
      "Easy to magnetise and loses magnetism easily"
    ],
    answer: 2,
    explanation: "Hard magnetic materials (like steel) require a strong field to align domains, but once aligned, they retain magnetism permanently."
  },
  {
    q: "A magnetic crane in a scrapyard drops iron scraps when the current is turned off. What is the core of this electromagnet made of?",
    options: ["Steel", "Soft Iron", "Copper", "Cobalt"],
    answer: 1,
    explanation: "It must be soft iron. If it were steel, the crane would remain permanent and would not drop the scrap iron when the current is turned off."
  },

  // 11-15 Classifications & Applications
  {
    q: "Which application requires a temporary magnet?",
    options: ["Magnetic compass", "Refrigerator door seal magnet", "Magnetic lock safety latch", "Electric relay switch core"],
    answer: 3,
    explanation: "A relay core must demagnetise immediately when current is cut, so it must be a temporary magnet (usually soft iron)."
  },
  {
    q: "Which of the following is made of a permanent magnet?",
    options: ["Electric bell armature core", "Loudspeaker magnet", "Transformer core", "Electromagnetic crane core"],
    answer: 1,
    explanation: "Loudspeakers require a constant, steady magnetic field to vibrate the coil, so they use strong permanent magnets (steel/alloys)."
  },
  {
    q: "An object is easily attracted by a magnet but does not attract other magnetic objects on its own when removed. This object is a:",
    options: ["Permanent magnet", "Magnetic material", "Non-magnetic material", "North pole"],
    answer: 1,
    explanation: "It is a magnetic material (like iron) that is unmagnetised. It gets attracted because of induced magnetism, but has no permanent field."
  },
  {
    q: "If you want to store permanent magnets safely, they should be stored in pairs with soft iron pieces called:",
    options: ["Resistors", "Keepers", "Solenoids", "Shields"],
    answer: 1,
    explanation: "Magnet keepers (made of soft iron) provide a closed path for magnetic field lines, preventing demagnetisation over time."
  },
  {
    q: "What material is typically used to shield sensitive electronic instruments from external magnetic fields?",
    options: ["Steel", "Soft Iron", "Glass", "Plastic"],
    answer: 1,
    explanation: "Soft iron has high magnetic permeability, redirecting external magnetic fields around the shielded space rather than through it."
  },

  // 16-20 General Properties of Magnets
  {
    q: "If a bar magnet is cut in half, what is the result?",
    options: [
      "Two magnets, one with only North and one with only South",
      "Two complete smaller magnets, each with both N and S poles",
      "The pieces lose all magnetism",
      "Only the North pole retains magnetism"
    ],
    answer: 1,
    explanation: "Magnetic poles always exist in pairs (dipoles). Breaking a magnet always results in two smaller, complete magnets."
  },
  {
    q: "Which of the following methods CANNOT be used to demagnetise a permanent magnet?",
    options: [
      "Heating it to a high temperature",
      "Hammering it repeatedly while pointing East-West",
      "Placing it in a solenoid connected to a high DC current",
      "Placing it in a solenoid connected to AC current and slowly withdrawing it"
    ],
    answer: 2,
    explanation: "DC current in a solenoid magnetises materials. AC current followed by slow withdrawal, heating, or hammering will demagnetise it."
  },
  {
    q: "What is the only sure test to identify if a metal bar is a permanent magnet?",
    options: ["Attraction to a known magnet", "Repulsion from a known magnet", "Attraction to a piece of iron", "Deflection near copper wires"],
    answer: 1,
    explanation: "Repulsion is the only sure test. An unmagnetised magnetic material is attracted to both poles, but only another magnet can be repelled."
  },
  {
    q: "Which statement about magnetic poles is correct?",
    options: [
      "Magnetic poles are located exactly at the ends of a magnet.",
      "The North pole of a compass needle points to Earth's geographic south pole.",
      "Like poles repel; unlike poles attract.",
      "Poles can exist individually as monopoles."
    ],
    answer: 2,
    explanation: "The fundamental law of magnetism states that like poles repel, and unlike poles attract."
  },
  {
    q: "Which of the following is NOT a magnetic material?",
    options: ["Cobalt", "Nickel", "Brass", "Steel"],
    answer: 2,
    explanation: "Brass is an alloy of copper and zinc, which are non-magnetic. Cobalt, Nickel, and Steel are magnetic."
  },

  // 21-30 Field Behaviour & Extra Conceptual
  {
    q: "Where is the magnetic field of a bar magnet strongest?",
    options: ["At the center of the magnet", "Near both poles", "Equally strong everywhere", "Just outside the side edges"],
    answer: 1,
    explanation: "The field lines are most dense (concentrated) near the North and South poles, indicating the strongest magnetic force."
  },
  {
    q: "What is the direction of magnetic field lines outside a bar magnet?",
    options: ["From South to North", "From North to South", "Radial outwards", "Circular around the poles"],
    answer: 1,
    explanation: "By convention, magnetic field lines always travel from the North pole to the South pole outside the magnet."
  },
  {
    q: "What does the spacing of magnetic field lines represent?",
    options: [
      "The speed of magnetic waves",
      "The strength of the magnetic field",
      "The polarity of the magnet",
      "The material inside the magnet"
    ],
    answer: 1,
    explanation: "Closer field lines represent a stronger magnetic field. Wider spacing represents a weaker field."
  },
  {
    q: "A magnetic material is placed in a field. What is the alignment of its magnetic domains when it is fully magnetised?",
    options: [
      "They point in random directions",
      "They point perpendicular to the field",
      "They all point in the same direction parallel to the field",
      "They cancel each other out"
    ],
    answer: 2,
    explanation: "Magnetisation aligns all magnetic domains in one uniform direction parallel to the external field lines."
  },
  {
    q: "Which of the following best describes magnetic domains?",
    options: [
      "Tiny atomic magnets that exist in all materials",
      "Groups of atoms with aligned magnetic fields in magnetic materials",
      "The poles of an electromagnet",
      "Regions of electric charge"
    ],
    answer: 1,
    explanation: "Magnetic domains are microscopic regions where atomic magnetic moments are aligned in a common direction."
  },
  {
    q: "How does the magnetism of a permanent magnet change if it is hammered heavily while aligned North-South?",
    options: ["It becomes stronger", "It weakens or demagnetises", "It reverses poles", "It has no effect"],
    answer: 1,
    explanation: "Vigorous hammering shakes up the aligned domains. If aligned N-S, it might actually acquire magnetism from Earth's field, or get weakened. But generally, hammering causes demagnetisation (weakening)."
  },
  {
    q: "Which method is the most efficient way to magnetise a steel bar?",
    options: [
      "Stroking it with a copper rod",
      "Placing it inside a solenoid connected to a DC supply",
      "Heating it and cooling it in ice",
      "Leaving it near a compass overnight"
    ],
    answer: 1,
    explanation: "A solenoid connected to a Direct Current (DC) supply creates a strong, steady magnetic field that aligns steel domains efficiently."
  },
  {
    q: "What type of current is used to demagnetise a magnet using a solenoid?",
    options: ["Direct Current (DC)", "Alternating Current (AC)", "Static Electricity", "High voltage battery pulse"],
    answer: 1,
    explanation: "AC current is used. The alternating field continuously reverses domains while the magnet is slowly pulled away, scrambling them."
  },
  {
    q: "Which of these materials is considered magnetically soft?",
    options: ["Alnico", "Hard steel", "Soft iron", "Neodymium"],
    answer: 2,
    explanation: "Soft iron is magnetically soft because it can be magnetised and demagnetised very easily."
  },
  {
    q: "An compass needle points North because Earth acts like a giant magnet with its magnetic South pole near the:",
    options: ["Geographic South Pole", "Geographic North Pole", "Equator", "Prime Meridian"],
    answer: 1,
    explanation: "Since the North pole of a compass needle points North, it must be attracted to a South magnetic pole. Therefore, Earth's magnetic South pole is near the geographic North Pole."
  }
];

let quizQuestions = [];
let currentQuestionIndex = 0;
let quizScore = 0;

// Quiz DOM Elements
const quizGamePanel = document.getElementById('quiz-game-panel');
const quizResultsPanel = document.getElementById('quiz-results-panel');
const quizProgressFill = document.getElementById('quiz-progress-fill');
const quizQuestionNumber = document.getElementById('quiz-question-number');
const quizLiveScore = document.getElementById('quiz-live-score');
const quizQuestionText = document.getElementById('quiz-question-text');
const quizOptionsList = document.getElementById('quiz-options-list');
const quizExplanationPanel = document.getElementById('quiz-explanation-panel');
const explanationStatusIcon = document.getElementById('explanation-status-icon');
const explanationStatusText = document.getElementById('explanation-status-text');
const quizExplanationText = document.getElementById('quiz-explanation-text');
const btnNextQuestion = document.getElementById('btn-next-question');

// Scoreboard Elements
const resultsScoreFraction = document.getElementById('results-score-fraction');
const resultsFeedbackTitle = document.getElementById('results-feedback-title');
const resultsFeedbackDesc = document.getElementById('results-feedback-desc');
const btnRetryQuiz = document.getElementById('btn-retry-quiz');

function startQuizSession() {
  quizScore = 0;
  currentQuestionIndex = 0;
  
  // Shuffle and pick 10 random questions
  const shuffledPool = [...quizPool].sort(() => 0.5 - Math.random());
  quizQuestions = shuffledPool.slice(0, 10);
  
  quizResultsPanel.classList.add('hidden');
  quizGamePanel.classList.remove('hidden');
  
  showQuestion();
}

function showQuestion() {
  quizExplanationPanel.classList.add('hidden');
  const q = quizQuestions[currentQuestionIndex];
  
  // Update progress bar & text
  const progressPercent = ((currentQuestionIndex) / 10) * 100;
  quizProgressFill.style.width = `${progressPercent}%`;
  quizQuestionNumber.textContent = `Question ${currentQuestionIndex + 1} of 10`;
  quizLiveScore.textContent = `Score: ${quizScore}`;
  
  quizQuestionText.textContent = q.q;
  quizOptionsList.innerHTML = '';
  
  q.options.forEach((option, idx) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerHTML = `<span>${option}</span>`;
    btn.addEventListener('click', () => handleOptionSelection(idx));
    quizOptionsList.appendChild(btn);
  });
}

function handleOptionSelection(selectedIdx) {
  const q = quizQuestions[currentQuestionIndex];
  const optionButtons = quizOptionsList.querySelectorAll('.option-btn');
  
  // Disable all options
  optionButtons.forEach(btn => btn.classList.add('disabled'));
  
  const isCorrect = (selectedIdx === q.answer);
  
  if (isCorrect) {
    quizScore++;
    optionButtons[selectedIdx].classList.add('correct');
    
    // Celebratory icon state
    explanationStatusIcon.className = 'lucide-icon text-cyan';
    explanationStatusIcon.setAttribute('data-lucide', 'check-circle-2');
    explanationStatusText.textContent = 'Correct!';
    explanationStatusText.parentElement.className = 'explanation-heading correct-text';
    
    // Trigger canvas confetti
    triggerConfetti();
  } else {
    optionButtons[selectedIdx].classList.add('incorrect');
    optionButtons[q.answer].classList.add('correct');
    
    explanationStatusIcon.className = 'lucide-icon text-amber';
    explanationStatusIcon.setAttribute('data-lucide', 'alert-circle');
    explanationStatusText.textContent = 'Incorrect';
    explanationStatusText.parentElement.className = 'explanation-heading incorrect-text';
  }
  
  lucide.createIcons();
  
  // Set explanation text & reveal panel
  quizExplanationText.textContent = q.explanation;
  quizExplanationPanel.classList.remove('hidden');
}

btnNextQuestion.addEventListener('click', () => {
  currentQuestionIndex++;
  if (currentQuestionIndex < 10) {
    showQuestion();
  } else {
    showQuizResults();
  }
});

function showQuizResults() {
  quizGamePanel.classList.add('hidden');
  quizResultsPanel.classList.remove('hidden');
  
  resultsScoreFraction.textContent = `${quizScore} / 10`;
  
  // Set tiered feedback
  if (quizScore >= 9) {
    resultsFeedbackTitle.textContent = "Excellent!";
    resultsFeedbackDesc.textContent = "You've completely mastered this magnetism syllabus topic. Ready for the O-Levels!";
  } else if (quizScore >= 7) {
    resultsFeedbackTitle.textContent = "Great work!";
    resultsFeedbackDesc.textContent = "Just a few minor areas to review. Take a look at the flashcards.";
  } else if (quizScore >= 5) {
    resultsFeedbackTitle.textContent = "Good attempt!";
    resultsFeedbackDesc.textContent = "A decent score, but revisit the Concept and Revision Flashcards sections before trying again.";
  } else {
    resultsFeedbackTitle.textContent = "Needs revision!";
    resultsFeedbackDesc.textContent = "Revisit the Concept and Flashcard sections carefully, then try the quiz again.";
  }
}

btnRetryQuiz.addEventListener('click', startQuizSession);

// Initialize Quiz on App Load
startQuizSession();


// --- CELEBRATORY CONFETTI CANVAS ---
const canvas = document.getElementById('confetti-canvas');
const ctx = canvas.getContext('2d');

let confettiArray = [];
let animationFrameId;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class ConfettiParticle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height - canvas.height;
    this.size = Math.random() * 6 + 4;
    this.speed = Math.random() * 5 + 3;
    this.angle = Math.random() * 360;
    this.spin = Math.random() * 4 - 2;
    this.color = Math.random() > 0.5 ? '#06b6d4' : '#f59e0b'; // colorblind safe neon cyan and amber
  }
  
  update() {
    this.y += this.speed;
    this.angle += this.spin;
  }
  
  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.angle * Math.PI) / 180);
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    ctx.restore();
  }
}

function animateConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  confettiArray.forEach((p, idx) => {
    p.update();
    p.draw();
    if (p.y > canvas.height) {
      confettiArray.splice(idx, 1);
    }
  });
  
  if (confettiArray.length > 0) {
    animationFrameId = requestAnimationFrame(animateConfetti);
  } else {
    cancelAnimationFrame(animationFrameId);
  }
}

function triggerConfetti() {
  confettiArray = [];
  for (let i = 0; i < 80; i++) {
    confettiArray.push(new ConfettiParticle());
  }
  cancelAnimationFrame(animationFrameId);
  animateConfetti();
}
