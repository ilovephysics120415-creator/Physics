// --- APP STATE ---
let activeTab = 'concept';
let conceptSlide = 1;
const totalConceptSlides = 4;

let activeExploreSubTab = 'compass'; // 'compass' or 'strength'
let currentConfig = 'single'; // 'single', 'unlike', 'like'
let currentStrength = 3; // 1 to 5
let showFieldLines = true;

// Flashcards
let flashcards = [
  {
    front: "How does a compass needle indicate the direction of a magnetic field at a point?",
    back: "The North (N) pole of the compass needle points in the direction of the magnetic field at that point."
  },
  {
    front: "What is the convention for the direction of magnetic field lines outside a magnet?",
    back: "Field lines always leave the North (N) pole, curve around, and enter the South (S) pole."
  },
  {
    front: "How does the spacing/density of magnetic field lines relate to magnetic field strength?",
    back: "Denser (closer) lines represent a stronger magnetic field, while widely spaced lines represent a weaker field."
  },
  {
    front: "Where is the magnetic field strength of a bar magnet strongest?",
    back: "It is strongest near the magnet's poles (N and S) where the field lines are most dense."
  },
  {
    front: "What pattern is formed by field lines between two unlike poles (N facing S)?",
    back: "The field lines connect directly from the North pole of one magnet to the South pole of the other, indicating attraction."
  },
  {
    front: "What pattern is formed by field lines between two like poles (N facing N, or S facing S)?",
    back: "The field lines bend away and repel each other, leaving a gap in the center."
  },
  {
    front: "What is a 'Neutral Point' in a magnetic field?",
    back: "A point where the magnetic fields of multiple sources cancel out completely, resulting in a net magnetic field strength of zero."
  },
  {
    front: "What would a compass do if placed exactly at a neutral point?",
    back: "It would display erratic, random rotation or point in any random direction because the net magnetic force acting on it is zero."
  },
  {
    front: "Why do magnetic field lines never cross or intersect each other?",
    back: "Because the magnetic field can only point in one unique direction at any given point. If they crossed, a compass would point in two directions at once."
  },
  {
    front: "What happens to the field lines of a magnet as its magnetic strength decreases?",
    back: "The field lines become fewer, more spread out, and less dense near the poles."
  }
];
let currentCardIndex = 0;

// Quiz Pool of 30 Questions
const quizQuestionPool = [
  {
    id: 1,
    question: "If a plotting compass is placed near the North pole of a bar magnet, which direction does the North pole of the compass needle point?",
    options: [
      "Directly towards the North pole",
      "Directly away from the North pole",
      "Parallel to the sides of the magnet",
      "It spins continuously"
    ],
    answer: 1,
    explanation: "Like poles repel. The North pole of the compass needle is repelled by the North pole of the bar magnet, so it points directly away from it.",
    visual: "single_n"
  },
  {
    id: 2,
    question: "Which of the following describes the direction of magnetic field lines?",
    options: [
      "From South to North both inside and outside the magnet",
      "From North to South outside, and South to North inside",
      "From North to South both inside and outside",
      "They do not have a defined direction"
    ],
    answer: 1,
    explanation: "By convention, magnetic field lines leave the North pole and enter the South pole on the outside of a magnet, completing loops inside from South to North.",
    visual: "none"
  },
  {
    id: 3,
    question: "Where is the magnetic field around a single bar magnet strongest?",
    options: [
      "Directly in the center of the magnet",
      "At the poles, where the field lines are closest together",
      "Far away from the magnet where lines are spread out",
      "The strength is uniform everywhere around the magnet"
    ],
    answer: 1,
    explanation: "The field strength is proportional to the density (closeness) of the field lines. Field lines are most dense near the poles, indicating the strongest magnetic field.",
    visual: "none"
  },
  {
    id: 4,
    question: "Two magnets are placed with their North poles facing each other. What is the magnetic field strength at the midpoint between them?",
    options: [
      "Double the strength of a single magnet",
      "Zero, creating a neutral point",
      "Weaker than a single magnet, but not zero",
      "Infinitely strong"
    ],
    answer: 1,
    explanation: "The equal and opposite magnetic fields from the two identical North poles cancel each other out at the exact midpoint, creating a neutral point of zero field strength.",
    visual: "like_poles"
  },
  {
    id: 5,
    question: "If a compass is placed at the neutral point between two like poles, how will its needle behave?",
    options: [
      "It will point directly to the nearest North pole",
      "It will spin rapidly in a clockwise direction",
      "It will have no preferred direction and may orient randomly",
      "It will point straight up to the sky"
    ],
    answer: 2,
    explanation: "At a neutral point, the net magnetic field is zero. Without an external magnetic field to align it, the compass needle experiences no alignment torque and can point in any direction.",
    visual: "none"
  },
  {
    id: 6,
    question: "A field diagram shows lines that are very close together in Region A and widely separated in Region B. What does this tell us?",
    options: [
      "Region A has a weaker field than Region B",
      "Region A has a stronger field than Region B",
      "Both regions have the same field strength",
      "Region A is a North pole and Region B is a South pole"
    ],
    answer: 1,
    explanation: "Line density represents magnetic field strength. Closely spaced lines indicate a stronger field; widely separated lines indicate a weaker field.",
    visual: "none"
  },
  {
    id: 7,
    question: "When drawing the magnetic field lines between two unlike poles (N facing S), what pattern is observed?",
    options: [
      "The lines repel and curve away from the space between magnets",
      "The lines run directly from the North pole to the South pole",
      "The lines form concentric circles around the midpoint",
      "There are no field lines between them"
    ],
    answer: 1,
    explanation: "Unlike poles attract, and field lines run continuously from the North pole of one magnet directly into the South pole of the facing magnet.",
    visual: "unlike_poles"
  },
  {
    id: 8,
    question: "In a diagram showing repelling field lines between two facing poles, there is a point marked 'X' in the center with no lines passing through it. What is this point called?",
    options: [
      "The Magnetic Center",
      "The Attraction Point",
      "The Neutral Point",
      "The Focal Point"
    ],
    answer: 2,
    explanation: "The point where field lines repel and cancel out, leaving a region of zero field, is called the neutral point.",
    visual: "like_poles"
  },
  {
    id: 9,
    question: "If the strength slider on a bar magnet simulation is increased from 1 to 5, how should the field line diagram change to reflect this?",
    options: [
      "The lines should become further apart",
      "The lines should become more dense and tightly packed",
      "The lines should change direction from S-to-N to N-to-S",
      "The lines should disappear completely"
    ],
    answer: 1,
    explanation: "Increasing the magnet strength means the magnetic field is stronger. This is visually represented by an increased density (more lines, packed closer together) of field lines.",
    visual: "none"
  },
  {
    id: 10,
    question: "What direction does the South pole of a compass needle point when placed in a magnetic field?",
    options: [
      "In the direction of the magnetic field",
      "Opposite to the direction of the magnetic field",
      "At a right angle to the magnetic field",
      "Towards the center of the earth"
    ],
    answer: 1,
    explanation: "By definition, the North pole of the compass points in the direction of the field, which means the South pole points in the opposite direction.",
    visual: "none"
  },
  {
    id: 11,
    question: "If we label a magnet's poles X and Y, and find that field lines emerge from X and enter Y, what are the polarities of X and Y?",
    options: [
      "X is South, Y is North",
      "X is North, Y is South",
      "Both X and Y are North",
      "Both X and Y are South"
    ],
    answer: 1,
    explanation: "Since magnetic field lines exit North poles and enter South poles, X must be North and Y must be South.",
    visual: "none"
  },
  {
    id: 12,
    question: "Which of the following is true about a neutral point between two magnets?",
    options: [
      "It only occurs between unlike poles",
      "It only occurs between like poles",
      "It is a region of maximum magnetic force",
      "It can be mapped using a single isolated magnet"
    ],
    answer: 1,
    explanation: "A neutral point is created when opposing fields cancel out. This occurs between two like poles (which push against each other) or in combination configurations, but not between facing unlike poles.",
    visual: "none"
  },
  {
    id: 13,
    question: "Why does a compass needle rotate when moved around a magnet?",
    options: [
      "It aligns itself parallel to the magnet's physical surface",
      "It aligns itself tangent to the magnetic field line at that point",
      "It is attracted by the gravitational pull of the magnet",
      "The electric charges in the compass repel the magnet"
    ],
    answer: 1,
    explanation: "A compass needle is a small dipole that experiences torque in a magnetic field, aligning its axis tangent to the field line at its current location.",
    visual: "none"
  },
  {
    id: 14,
    question: "If you place a compass directly above the center of a horizontal bar magnet, which direction does the N-pole of the compass point?",
    options: [
      "Towards the South pole of the bar magnet",
      "Towards the North pole of the bar magnet",
      "Straight upwards away from the magnet",
      "It spins continuously"
    ],
    answer: 0,
    explanation: "Outside the magnet, field lines flow from the North pole to the South pole. Directly above the center, the field lines are moving parallel to the magnet towards the South pole side.",
    visual: "single_center"
  },
  {
    id: 15,
    question: "What happens to the density of magnetic field lines as you move further away from a bar magnet?",
    options: [
      "It increases",
      "It decreases",
      "It remains constant",
      "It becomes zero immediately"
    ],
    answer: 1,
    explanation: "As you move away from the magnet, the magnetic field strength decreases, which is represented by the field lines becoming more spread out (decreasing density).",
    visual: "none"
  },
  {
    id: 16,
    question: "Two magnets repel each other. What does this tell you about their facing poles?",
    options: [
      "They must be unlike poles",
      "They must be like poles",
      "One is magnetic and the other is not",
      "They are both South poles only"
    ],
    answer: 1,
    explanation: "Repulsion only occurs between like poles (North-North or South-South).",
    visual: "none"
  },
  {
    id: 17,
    question: "If a compass needle's N-pole points to the left at a certain position, what is the direction of the magnetic field at that position?",
    options: [
      "To the right",
      "To the left",
      "Upwards",
      "Downwards"
    ],
    answer: 1,
    explanation: "The direction of a magnetic field at any point is defined as the direction in which the North pole of a compass needle points.",
    visual: "none"
  },
  {
    id: 18,
    question: "Which magnetic configuration has a neutral point between the magnets?",
    options: [
      "A single bar magnet",
      "Two unlike poles facing each other",
      "Two like poles facing each other",
      "A horseshoe magnet"
    ],
    answer: 2,
    explanation: "Like poles facing each other create opposing magnetic fields that cancel out in the space between them, resulting in a neutral point.",
    visual: "like_poles"
  },
  {
    id: 19,
    question: "If two magnets are placed with their S poles facing each other, where is the neutral point located?",
    options: [
      "At the North pole of the left magnet",
      "At the midpoint between the two S poles",
      "Inside the right magnet",
      "There is no neutral point for S-S configurations"
    ],
    answer: 1,
    explanation: "Just like N-N configurations, S-S configurations repel and create opposing fields that cancel out at the midpoint, forming a neutral point.",
    visual: "none"
  },
  {
    id: 20,
    question: "If you break a bar magnet in half, what do you obtain?",
    options: [
      "Two magnets, each with a North and a South pole",
      "One separate North pole and one separate South pole",
      "Two non-magnetic pieces of metal",
      "One magnet and one unmagnetized piece"
    ],
    answer: 0,
    explanation: "Magnetic monopoles do not exist. Breaking a magnet in half results in two smaller magnets, each having its own North and South poles.",
    visual: "none"
  },
  {
    id: 21,
    question: "What does a dense concentration of magnetic field lines at the corners of a magnet indicate?",
    options: [
      "The field is very weak there",
      "The field is very strong there",
      "The magnet is demagnetized at the corners",
      "The field direction is reversing"
    ],
    answer: 1,
    explanation: "High density of field lines always represents a strong magnetic field region.",
    visual: "none"
  },
  {
    id: 22,
    question: "A student places a compass near a mystery pole of a magnet, and the North end of the compass needle points directly at the pole. What is the polarity of this mystery pole?",
    options: [
      "North pole",
      "South pole",
      "It could be either North or South",
      "It is a neutral point"
    ],
    answer: 1,
    explanation: "The North pole of a compass needle is attracted to South poles (unlike poles attract). Since it points directly at the pole, that pole must be South.",
    visual: "mystery_pole"
  },
  {
    id: 23,
    question: "Which diagram correctly shows the magnetic field of a single bar magnet?",
    options: [
      "Lines starting from South, entering North",
      "Lines starting from North, entering South",
      "Lines crossing each other in the middle",
      "Lines pointing straight out radially from both poles without looping"
    ],
    answer: 1,
    explanation: "Outside the magnet, lines emerge from the North pole and curve around to enter the South pole, forming closed loops.",
    visual: "none"
  },
  {
    id: 24,
    question: "What is the primary material used to make permanent magnets?",
    options: [
      "Copper",
      "Steel (or Iron alloys)",
      "Aluminum",
      "Plastic"
    ],
    answer: 1,
    explanation: "Ferromagnetic materials like iron, steel, nickel, and cobalt are used to make permanent magnets because they can retain magnetization.",
    visual: "none"
  },
  {
    id: 25,
    question: "If you increase the strength of a magnet, how does the position of the neutral point between two like poles change?",
    options: [
      "It moves closer to the stronger magnet",
      "It remains at the exact midpoint if both magnets are increased equally",
      "It disappears completely",
      "It moves inside the stronger magnet"
    ],
    answer: 1,
    explanation: "If both magnets are increased in strength equally, the cancelation point remains exactly in the middle. If only one magnet is strengthened, the neutral point moves further away from the stronger magnet.",
    visual: "none"
  },
  {
    id: 26,
    question: "Which of the following is NOT a property of magnetic field lines?",
    options: [
      "They form continuous closed loops",
      "They can intersect under very strong fields",
      "They exit North and enter South poles",
      "Their density indicates field strength"
    ],
    answer: 1,
    explanation: "Field lines never intersect or cross. If they crossed, it would mean the magnetic field has two different directions at the intersection point, which is impossible.",
    visual: "none"
  },
  {
    id: 27,
    question: "How does a compass mapper show a neutral point?",
    options: [
      "The compass points steadily towards the North pole",
      "The compass needle shows erratic or random alignment due to zero field strength",
      "The compass needle breaks",
      "The compass needle points to the South pole"
    ],
    answer: 1,
    explanation: "At a neutral point, the opposing fields cancel out. The absence of a net magnetic field allows the compass needle to rotate erratically or sit in a random direction.",
    visual: "none"
  },
  {
    id: 28,
    question: "What would the magnetic field pattern look like for two magnets placed with Unlike poles facing, compared to Like poles facing?",
    options: [
      "Unlike poles have repelling lines; Like poles have connecting lines",
      "Unlike poles have connecting lines; Like poles have repelling lines",
      "Both configurations look exactly the same",
      "Neither configuration has any field lines between them"
    ],
    answer: 1,
    explanation: "Unlike poles attract (connecting lines from N of one to S of the other), whereas like poles repel (lines bend away from each other).",
    visual: "none"
  },
  {
    id: 29,
    question: "Why do we use steel rather than soft iron to make permanent magnets?",
    options: [
      "Steel is easier to magnetize but loses its magnetism easily",
      "Steel is harder to magnetize but retains its magnetism much longer",
      "Steel is non-magnetic",
      "Soft iron does not conduct magnetic fields"
    ],
    answer: 1,
    explanation: "Steel is a magnetically hard material. It is harder to magnetize than soft iron, but it retains its magnetism, making it suitable for permanent magnets.",
    visual: "none"
  },
  {
    id: 30,
    question: "If a compass is placed very far from a magnet, why does it stop pointing towards the magnet's poles?",
    options: [
      "The compass becomes demagnetized",
      "The magnet's field becomes weaker than the Earth's magnetic field",
      "The compass needle gets stuck",
      "The field lines loop back inside the compass"
    ],
    answer: 1,
    explanation: "As distance increases, the magnet's field strength drops significantly. Eventually, it becomes weaker than the Earth's ambient magnetic field, so the compass aligns with the Earth's field instead.",
    visual: "none"
  }
];

let activeQuestions = [];
let currentQuestionIndex = 0;
let quizScore = 0;
let hasAnswered = false;

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initConceptSlider();
  initExploreCanvas();
  initFlashcards();
  initQuiz();
});

// --- NAVIGATION LOGIC ---
function initNavigation() {
  const navButtons = document.querySelectorAll('.nav-btn');
  const sections = document.querySelectorAll('.tab-content');

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      
      // Update buttons
      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update sections
      sections.forEach(s => s.classList.remove('active'));
      
      if (targetTab === 'concept') {
        document.getElementById('concept-section').classList.add('active');
      } else if (targetTab === 'explore') {
        document.getElementById('explore-section').classList.add('active');
        // Trigger canvas resize and redraw when tab becomes visible
        resizeCanvas();
        updateCanvas();
      } else if (targetTab === 'flashcards') {
        document.getElementById('flashcards-section').classList.add('active');
      } else if (targetTab === 'quiz') {
        document.getElementById('quiz-section').classList.add('active');
      }
      
      activeTab = targetTab;
    });
  });
}

// --- CONCEPT SLIDER LOGIC ---
function initConceptSlider() {
  const cards = document.querySelectorAll('.concept-card');
  const prevBtn = document.getElementById('prev-slide-btn');
  const nextBtn = document.getElementById('next-slide-btn');
  const indicator = document.querySelector('.slide-indicator');

  function updateSlide() {
    cards.forEach(card => {
      card.classList.remove('active');
      if (parseInt(card.getAttribute('data-slide')) === conceptSlide) {
        card.classList.add('active');
      }
    });

    indicator.textContent = `${conceptSlide} / ${totalConceptSlides}`;
    prevBtn.disabled = conceptSlide === 1;
    nextBtn.disabled = conceptSlide === totalConceptSlides;
  }

  prevBtn.addEventListener('click', () => {
    if (conceptSlide > 1) {
      conceptSlide--;
      updateSlide();
    }
  });

  nextBtn.addEventListener('click', () => {
    if (conceptSlide < totalConceptSlides) {
      conceptSlide++;
      updateSlide();
    }
  });
}

// --- EXPLORATION CANVAS & PHYSICS ENGINE ---
let canvas, ctx, compassElement;
let isDraggingCompass = false;
let compassOffset = { x: 0, y: 0 };
let compassPos = { x: 150, y: 120 }; // Relative coordinates in wrapper

function initExploreCanvas() {
  canvas = document.getElementById('field-canvas');
  ctx = canvas.getContext('2d');
  compassElement = document.getElementById('interactive-compass');

  // Sub-tabs Toggle
  const tabCompass = document.getElementById('tab-compass');
  const tabStrength = document.getElementById('tab-strength');
  const compassControls = document.getElementById('compass-controls');
  const strengthControls = document.getElementById('strength-controls');

  tabCompass.addEventListener('click', () => {
    tabCompass.classList.add('active');
    tabStrength.classList.remove('active');
    activeExploreSubTab = 'compass';
    compassControls.classList.remove('hidden');
    strengthControls.classList.add('hidden');
    compassElement.classList.remove('hidden');
    updateCanvas();
  });

  tabStrength.addEventListener('click', () => {
    tabStrength.classList.add('active');
    tabCompass.classList.remove('active');
    activeExploreSubTab = 'strength';
    strengthControls.classList.remove('hidden');
    compassControls.classList.add('hidden');
    compassElement.classList.add('hidden');
    updateCanvas();
  });

  // Config toggles (Single, Unlike, Like)
  const configBtns = document.querySelectorAll('.toggle-btn');
  configBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      configBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentConfig = btn.getAttribute('data-config');
      updateCanvas();
      updateCompassOrientation();
    });
  });

  // Field Lines Checkbox
  const toggleFieldLines = document.getElementById('toggle-fieldlines');
  toggleFieldLines.addEventListener('change', (e) => {
    showFieldLines = e.target.checked;
    updateCanvas();
  });

  // Strength Slider
  const strengthSlider = document.getElementById('strength-slider');
  const strengthLabelText = document.getElementById('strength-label-text');
  strengthSlider.addEventListener('input', (e) => {
    currentStrength = parseInt(e.target.value);
    const labels = ["Very Weak", "Weak", "Medium", "Strong", "Very Strong"];
    strengthLabelText.textContent = labels[currentStrength - 1];
    updateCanvas();
  });

  // Setup Dragging for Compass
  setupCompassDrag();

  // Resize listener
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
}

function resizeCanvas() {
  const wrapper = canvas.parentElement;
  canvas.width = wrapper.clientWidth;
  // Keep aspect ratio 700 / 450
  canvas.height = wrapper.clientWidth * (450 / 700);
  
  // Reposition compass within bounds if resized
  limitCompassBounds();
  updateCanvas();
  updateCompassOrientation();
}

function limitCompassBounds() {
  const wrapper = canvas.parentElement;
  const wRect = wrapper.getBoundingClientRect();
  compassPos.x = Math.max(20, Math.min(wRect.width - 20, compassPos.x));
  compassPos.y = Math.max(20, Math.min(wRect.height - 20, compassPos.y));
  
  compassElement.style.left = `${compassPos.x}px`;
  compassElement.style.top = `${compassPos.y}px`;
}

function setupCompassDrag() {
  const startDrag = (e) => {
    isDraggingCompass = true;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    compassOffset.x = clientX - compassElement.offsetLeft;
    compassOffset.y = clientY - compassElement.offsetTop;
    
    compassElement.style.transition = 'none';
    e.preventDefault();
  };

  const dragMove = (e) => {
    if (!isDraggingCompass) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const wrapper = canvas.parentElement;
    const wrapperRect = wrapper.getBoundingClientRect();
    
    let left = clientX - compassOffset.x;
    let top = clientY - compassOffset.y;
    
    // Clamp to wrapper bounds
    left = Math.max(20, Math.min(wrapperRect.width - 20, left));
    top = Math.max(20, Math.min(wrapperRect.height - 20, top));
    
    compassPos.x = left;
    compassPos.y = top;
    
    compassElement.style.left = `${left}px`;
    compassElement.style.top = `${top}px`;
    
    updateCompassOrientation();
  };

  const endDrag = () => {
    isDraggingCompass = false;
  };

  compassElement.addEventListener('mousedown', startDrag);
  compassElement.addEventListener('touchstart', startDrag, { passive: false });
  window.addEventListener('mousemove', dragMove);
  window.addEventListener('touchmove', dragMove, { passive: false });
  window.addEventListener('mouseup', endDrag);
  window.addEventListener('touchend', endDrag);
}

// Compute the magnetic field vector B = (Bx, By) at a given point
function getFieldAt(x, y, config, strengthVal) {
  const W = canvas.width;
  const H = canvas.height;
  
  // Setup magnet poles as charge locations
  let poles = [];
  const q = 35000 * (strengthVal / 3); // Scale magnetic charge
  
  if (config === 'single') {
    // Single magnet in center: N on left, S on right (poles inside visual block)
    poles.push({ x: W * 0.38, y: H * 0.5, type: 1 });  // N
    poles.push({ x: W * 0.62, y: H * 0.5, type: -1 }); // S
  } else if (config === 'unlike') {
    // Left magnet: N on left, S on right
    poles.push({ x: W * 0.2, y: H * 0.5, type: 1 });   // N
    poles.push({ x: W * 0.38, y: H * 0.5, type: -1 }); // S
    // Right magnet: N on left, S on right
    poles.push({ x: W * 0.62, y: H * 0.5, type: 1 });  // N
    poles.push({ x: W * 0.8, y: H * 0.5, type: -1 });  // S
  } else if (config === 'like') {
    // Left magnet: N on left, S on right
    poles.push({ x: W * 0.2, y: H * 0.5, type: 1 });   // N
    poles.push({ x: W * 0.38, y: H * 0.5, type: -1 }); // S
    // Right magnet: S on left, N on right
    poles.push({ x: W * 0.62, y: H * 0.5, type: -1 }); // S
    poles.push({ x: W * 0.8, y: H * 0.5, type: 1 });   // N
  }
  
  let Bx = 0;
  let By = 0;
  
  for (let pole of poles) {
    let dx = x - pole.x;
    let dy = y - pole.y;
    let r2 = dx*dx + dy*dy;
    let r = Math.sqrt(r2);
    if (r < 8) continue; // Prevent infinity division near center
    
    // Field contribution: B = (q * type * r_vector) / r^3
    let f = (q * pole.type) / (r2 * r);
    Bx += f * dx;
    By += f * dy;
  }
  
  return { x: Bx, y: By, poles };
}

function updateCompassOrientation() {
  if (activeExploreSubTab !== 'compass') return;
  
  // Calculate relative coordinates in canvas space
  const rect = canvas.getBoundingClientRect();
  
  // Position of compass in canvas coordinate space
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const canvasX = compassPos.x * scaleX;
  const canvasY = compassPos.y * scaleY;
  
  // Use strength 3 (fixed for mapper to isolate configuration effect)
  const field = getFieldAt(canvasX, canvasY, currentConfig, 3);
  const B_mag = Math.sqrt(field.x * field.x + field.y * field.y);
  
  let angle = 0;
  
  // Check if compass is near the neutral point in Like Poles configuration
  let isNearNeutralPoint = false;
  if (currentConfig === 'like') {
    // Center point of canvas is approximately the neutral point
    const neutralX = canvas.width / 2;
    const neutralY = canvas.height / 2;
    const distToNeutral = Math.hypot(canvasX - neutralX, canvasY - neutralY);
    if (distToNeutral < 35) {
      isNearNeutralPoint = true;
    }
  }

  if (isNearNeutralPoint || B_mag < 0.12) {
    // Aligns with the Earth's background magnetic field (pointing straight up / geographic North)
    angle = -90;
  } else {
    // Arrow N points in direction of field vector
    angle = Math.atan2(field.y, field.x) * (180 / Math.PI);
  }
  
  // Add 90 degrees offset to match visual top-pointing needle layout
  compassElement.style.transform = `translate(-50%, -50%) rotate(${angle + 90}deg)`;
}

// Traces field lines starting around both North (forward) and South (backward) poles
function drawFieldLinesPattern(strengthVal) {
  const W = canvas.width;
  const H = canvas.height;
  const config = activeExploreSubTab === 'strength' ? 'single' : currentConfig;
  
  const { poles } = getFieldAt(W/2, H/2, config, strengthVal);
  
  ctx.strokeStyle = 'rgba(168, 85, 247, 0.45)';
  ctx.lineWidth = 1.8;
  
  // Euler tracing settings
  const stepSize = 5;
  const maxSteps = 150;
  
  // Adjust density: strength scales line count
  // 1: 8 lines, 2: 12 lines, 3: 16 lines, 4: 20 lines, 5: 24 lines
  const numLinesPerPole = 4 + strengthVal * 4;
  
  poles.forEach(pole => {
    const isNorth = (pole.type === 1);
    const directionMultiplier = isNorth ? 1 : -1;
    
    for (let i = 0; i < numLinesPerPole; i++) {
      let angle = (i * 2 * Math.PI) / numLinesPerPole;
      
      // Start tracing slightly outside pole radius
      let x = pole.x + 18 * Math.cos(angle);
      let y = pole.y + 18 * Math.sin(angle);
      
      let path = [{x, y}];
      let connectedToOpposite = false;
      let hitBoundary = false;
      
      for (let step = 0; step < maxSteps; step++) {
        let field = getFieldAt(x, y, config, strengthVal);
        let B_mag = Math.sqrt(field.x * field.x + field.y * field.y);
        
        if (B_mag < 0.02) break; // Neutral point cutoff
        
        let dx = (field.x / B_mag) * stepSize * directionMultiplier;
        let dy = (field.y / B_mag) * stepSize * directionMultiplier;
        
        let prevX = x;
        x += dx;
        y += dy;
        
        // Prevent lines from crossing the vertical symmetry plane between two like poles
        if (config === 'like') {
          const midX = W / 2;
          if ((prevX < midX && x >= midX) || (prevX > midX && x <= midX)) {
            hitBoundary = true;
            break;
          }
        }
        
        path.push({x, y});
        
        // Terminate trace if we hit the opposite pole
        let hitOpposite = false;
        for (let other of poles) {
          if (other.type === -pole.type) {
            let dist = Math.hypot(x - other.x, y - other.y);
            if (dist < 16) {
              hitOpposite = true;
              break;
            }
          }
        }
        
        if (hitOpposite) {
          connectedToOpposite = true;
          break;
        }
        
        if (x < -20 || x > W + 20 || y < -20 || y > H + 20) {
          break;
        }
      }
      
      // Only draw lines traced forward from North, or lines traced backward from South that do NOT connect to North (to avoid duplication).
      // Discard lines that hit the symmetry boundary (horizontal connecting lines).
      if (!hitBoundary && (isNorth || !connectedToOpposite)) {
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        for (let pt of path) {
          ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
        
        // Draw directional arrowhead at the midpoint of the field line
        if (path.length > 8) {
          const midIdx = Math.floor(path.length * 0.5);
          const p1 = path[midIdx - 1];
          const p2 = path[midIdx];
          
          let angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
          if (!isNorth) {
            angle += Math.PI; // Flip direction for backward traces from South
          }
          
          ctx.save();
          ctx.fillStyle = 'rgba(168, 85, 247, 0.95)'; // Brighter purple for visible arrows
          ctx.translate(p2.x, p2.y);
          ctx.rotate(angle);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(-8, -4.5);
          ctx.lineTo(-8, 4.5);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      }
    }
  });
}

function updateCanvas() {
  if (!canvas || !ctx) return;
  
  const W = canvas.width;
  const H = canvas.height;
  
  // Clear canvas
  ctx.clearRect(0, 0, W, H);
  
  // 1. Draw Field grid background effect
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, W, H);
  
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 1;
  const gridSize = 25;
  for (let x = 0; x < W; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y < H; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // 2. Draw Field Lines
  const strengthVal = activeExploreSubTab === 'strength' ? currentStrength : 3;
  const drawLines = activeExploreSubTab === 'strength' ? true : showFieldLines;
  
  if (drawLines) {
    drawFieldLinesPattern(strengthVal);
  }
  
  // 3. Render magnets based on current config
  const config = activeExploreSubTab === 'strength' ? 'single' : currentConfig;
  
  if (config === 'single') {
    drawMagnet(W * 0.35, H * 0.5 - 20, W * 0.3, 40);
  } else if (config === 'unlike') {
    // Left Magnet (S - N)
    drawMagnet(W * 0.17, H * 0.5 - 18, W * 0.24, 36);
    // Right Magnet (S - N)
    drawMagnet(W * 0.59, H * 0.5 - 18, W * 0.24, 36);
  } else if (config === 'like') {
    // Left Magnet (S - N)
    drawMagnet(W * 0.17, H * 0.5 - 18, W * 0.24, 36);
    // Right Magnet (N - S) flipped
    drawMagnet(W * 0.59, H * 0.5 - 18, W * 0.24, 36, true);
  }
  
  // 4. Draw neutral point indicator in Like Poles config
  if (config === 'like') {
    ctx.save();
    ctx.strokeStyle = '#facc15';
    ctx.fillStyle = '#facc15';
    ctx.lineWidth = 2.5;
    
    // Draw an 'X' at center
    const cx = W / 2;
    const cy = H / 2;
    ctx.beginPath();
    ctx.moveTo(cx - 7, cy - 7);
    ctx.lineTo(cx + 7, cy + 7);
    ctx.moveTo(cx + 7, cy - 7);
    ctx.lineTo(cx - 7, cy + 7);
    ctx.stroke();
    
    ctx.font = 'bold 11px Outfit';
    ctx.textAlign = 'center';
    ctx.fillText('Neutral Point (X)', cx, cy + 22);
    ctx.restore();
  }
}

function drawMagnet(x, y, w, h, isFlipped = false) {
  ctx.save();
  
  // Magnet Body Shadow
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  
  // Base Rounded Magnet
  ctx.fillStyle = '#161e2e';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 6);
  ctx.fill();
  ctx.shadowColor = 'transparent'; // Reset shadow
  
  const halfW = w / 2;
  
  // Draw Poles
  ctx.beginPath();
  if (!isFlipped) {
    // Left half = North (Cyan)
    ctx.fillStyle = varColor('--pole-n');
    ctx.roundRect(x, y, halfW, h, {tl: 6, bl: 6, tr: 0, br: 0});
    ctx.fill();
    
    // Right half = South (Amber)
    ctx.beginPath();
    ctx.fillStyle = varColor('--pole-s');
    ctx.roundRect(x + halfW, y, halfW, h, {tl: 0, bl: 0, tr: 6, br: 6});
    ctx.fill();
    
    // Text labels
    ctx.fillStyle = '#0b0f19';
    ctx.font = 'bold 16px Outfit';
    ctx.textAlign = 'center';
    ctx.fillText('N', x + halfW / 2, y + h / 2 + 5);
    ctx.fillText('S', x + halfW + halfW / 2, y + h / 2 + 5);
  } else {
    // Left half = South (Amber)
    ctx.fillStyle = varColor('--pole-s');
    ctx.roundRect(x, y, halfW, h, {tl: 6, bl: 6, tr: 0, br: 0});
    ctx.fill();
    
    // Right half = North (Cyan)
    ctx.beginPath();
    ctx.fillStyle = varColor('--pole-n');
    ctx.roundRect(x + halfW, y, halfW, h, {tl: 0, bl: 0, tr: 6, br: 6});
    ctx.fill();
    
    // Text labels
    ctx.fillStyle = '#0b0f19';
    ctx.font = 'bold 16px Outfit';
    ctx.textAlign = 'center';
    ctx.fillText('S', x + halfW / 2, y + h / 2 + 5);
    ctx.fillText('N', x + halfW + halfW / 2, y + h / 2 + 5);
  }
  
  // Center Divider Line
  ctx.strokeStyle = '#0b0f19';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + halfW, y);
  ctx.lineTo(x + halfW, y + h);
  ctx.stroke();
  
  ctx.restore();
}

function varColor(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

// --- FLASHCARDS LOGIC ---
function initFlashcards() {
  const cardElement = document.getElementById('flashcard-element');
  const frontText = cardElement.querySelector('.card-front .card-text');
  const backText = cardElement.querySelector('.card-back .card-text');
  const cardIndexFront = cardElement.querySelector('.card-front .card-index');
  const cardIndexBack = cardElement.querySelector('.card-back .card-index');
  
  const progressText = document.getElementById('card-progress');
  const prevBtn = document.getElementById('prev-card-btn');
  const nextBtn = document.getElementById('next-card-btn');
  const shuffleBtn = document.getElementById('shuffle-btn');

  function updateCard() {
    cardElement.classList.remove('flipped');
    
    // Load content
    const card = flashcards[currentCardIndex];
    frontText.textContent = card.front;
    backText.textContent = card.back;
    
    cardIndexFront.textContent = `Card ${currentCardIndex + 1} of ${flashcards.length}`;
    cardIndexBack.textContent = `Answer (Card ${currentCardIndex + 1})`;
    progressText.textContent = `${currentCardIndex + 1} / ${flashcards.length}`;
    
    prevBtn.disabled = currentCardIndex === 0;
    nextBtn.disabled = currentCardIndex === flashcards.length - 1;
  }

  // Flip card on click
  cardElement.addEventListener('click', () => {
    cardElement.classList.toggle('flipped');
  });

  function changeCard(action) {
    if (cardElement.classList.contains('flipped')) {
      cardElement.classList.remove('flipped');
      // Wait for the flip animation (approx 200ms) to hide the back face before loading new card
      setTimeout(() => {
        action();
      }, 200);
    } else {
      action();
    }
  }

  prevBtn.addEventListener('click', () => {
    if (currentCardIndex > 0) {
      changeCard(() => {
        currentCardIndex--;
        updateCard();
      });
    }
  });

  nextBtn.addEventListener('click', () => {
    if (currentCardIndex < flashcards.length - 1) {
      changeCard(() => {
        currentCardIndex++;
        updateCard();
      });
    }
  });

  shuffleBtn.addEventListener('click', () => {
    changeCard(() => {
      // Shuffle algorithm
      for (let i = flashcards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [flashcards[i], flashcards[j]] = [flashcards[j], flashcards[i]];
      }
      currentCardIndex = 0;
      updateCard();
      
      // Subtle flash card animation
      cardElement.style.transform = 'scale(0.95)';
      setTimeout(() => {
        cardElement.style.transform = 'none';
      }, 150);
    });
  });

  // Load first card
  updateCard();
}

// --- PRACTICE QUIZ LOGIC ---
function initQuiz() {
  const nextBtn = document.getElementById('next-question-btn');
  const retryBtn = document.getElementById('retry-quiz-btn');

  nextBtn.addEventListener('click', () => {
    goToNextQuestion();
  });

  retryBtn.addEventListener('click', () => {
    startNewQuizSession();
  });

  startNewQuizSession();
}

function startNewQuizSession() {
  // Hide results, show quiz container
  document.getElementById('results-container').classList.add('hidden');
  document.getElementById('quiz-container').classList.remove('hidden');
  
  // Randomly select 10 questions from the pool of 30
  const shuffledPool = [...quizQuestionPool].sort(() => 0.5 - Math.random());
  activeQuestions = shuffledPool.slice(0, 10);
  
  currentQuestionIndex = 0;
  quizScore = 0;
  
  loadQuestion();
}

function loadQuestion() {
  hasAnswered = false;
  
  // Hide explanation drawer
  document.getElementById('explanation-drawer').classList.add('hidden');
  
  // Get current question details
  const q = activeQuestions[currentQuestionIndex];
  
  // Update Header Progress
  const progressPercent = ((currentQuestionIndex + 1) / 10) * 100;
  document.getElementById('quiz-progress-bar').style.width = `${progressPercent}%`;
  document.getElementById('question-number').textContent = `Question ${currentQuestionIndex + 1} of 10`;
  document.getElementById('quiz-score-tracker').textContent = `Score: ${quizScore}/${currentQuestionIndex}`;

  // Update text
  document.getElementById('quiz-question-text').textContent = q.question;
  
  // Render visual if required
  renderQuizVisual(q.visual);

  // Render options
  const container = document.getElementById('quiz-options-container');
  container.innerHTML = '';
  
  q.options.forEach((optText, index) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerHTML = `<span>${optText}</span><span class="indicator"></span>`;
    btn.addEventListener('click', () => handleAnswerSelect(index));
    container.appendChild(btn);
  });
}

function renderQuizVisual(visualType) {
  const visualBox = document.getElementById('quiz-question-visual');
  
  if (visualType === 'none') {
    visualBox.classList.add('hidden');
    return;
  }
  
  visualBox.classList.remove('hidden');
  
  let svgContent = '';
  
  // Setup SVGs for questions to display clear diagram options
  if (visualType === 'single_n') {
    svgContent = `
      <svg viewBox="0 0 320 120" style="width: 100%; max-width: 280px; height: auto;">
        <rect x="0" y="0" width="100%" height="100%" fill="#0b0f19" rx="8"/>
        <!-- Magnet -->
        <g transform="translate(100, 40)">
          <rect x="0" y="0" width="60" height="40" fill="${varColor('--pole-n')}" rx="3"/>
          <text x="30" y="26" fill="#0b0f19" font-weight="bold" font-size="16" text-anchor="middle">N</text>
          <rect x="60" y="0" width="60" height="40" fill="${varColor('--pole-s')}" rx="3"/>
          <text x="90" y="26" fill="#0b0f19" font-weight="bold" font-size="16" text-anchor="middle">S</text>
          <line x1="60" y1="0" x2="60" y2="40" stroke="#0b0f19" stroke-width="2"/>
        </g>
        <!-- Compass placement point -->
        <circle cx="60" cy="60" r="16" fill="rgba(255,255,255,0.05)" stroke="#a855f7" stroke-width="1.5" stroke-dasharray="3,2"/>
        <text x="60" y="64" fill="#a855f7" font-weight="bold" font-size="12" text-anchor="middle">?</text>
      </svg>
    `;
  } else if (visualType === 'like_poles') {
    svgContent = `
      <svg viewBox="0 0 320 120" style="width: 100%; max-width: 280px; height: auto;">
        <rect x="0" y="0" width="100%" height="100%" fill="#0b0f19" rx="8"/>
        <!-- Magnet 1 -->
        <g transform="translate(30, 40)">
          <rect x="0" y="0" width="50" height="40" fill="${varColor('--pole-s')}" rx="3"/>
          <text x="25" y="26" fill="#0b0f19" font-weight="bold" font-size="14" text-anchor="middle">S</text>
          <rect x="50" y="0" width="50" height="40" fill="${varColor('--pole-n')}" rx="3"/>
          <text x="75" y="26" fill="#0b0f19" font-weight="bold" font-size="14" text-anchor="middle">N</text>
          <line x1="50" y1="0" x2="50" y2="40" stroke="#0b0f19" stroke-width="2"/>
        </g>
        <!-- Magnet 2 -->
        <g transform="translate(190, 40)">
          <rect x="0" y="0" width="50" height="40" fill="${varColor('--pole-n')}" rx="3"/>
          <text x="25" y="26" fill="#0b0f19" font-weight="bold" font-size="14" text-anchor="middle">N</text>
          <rect x="50" y="0" width="50" height="40" fill="${varColor('--pole-s')}" rx="3"/>
          <text x="75" y="26" fill="#0b0f19" font-weight="bold" font-size="14" text-anchor="middle">S</text>
          <line x1="50" y1="0" x2="50" y2="40" stroke="#0b0f19" stroke-width="2"/>
        </g>
        <!-- Neutral point location marker -->
        <line x1="155" y1="55" x2="165" y2="65" stroke="#facc15" stroke-width="2.5" />
        <line x1="165" y1="55" x2="155" y2="65" stroke="#facc15" stroke-width="2.5" />
        <text x="160" y="80" fill="#facc15" font-size="11" font-weight="bold" text-anchor="middle">Midpoint X</text>
      </svg>
    `;
  } else if (visualType === 'unlike_poles') {
    svgContent = `
      <svg viewBox="0 0 320 120" style="width: 100%; max-width: 280px; height: auto;">
        <rect x="0" y="0" width="100%" height="100%" fill="#0b0f19" rx="8"/>
        <!-- Magnet 1 -->
        <g transform="translate(30, 40)">
          <rect x="0" y="0" width="50" height="40" fill="${varColor('--pole-s')}" rx="3"/>
          <text x="25" y="26" fill="#0b0f19" font-weight="bold" font-size="14" text-anchor="middle">S</text>
          <rect x="50" y="0" width="50" height="40" fill="${varColor('--pole-n')}" rx="3"/>
          <text x="75" y="26" fill="#0b0f19" font-weight="bold" font-size="14" text-anchor="middle">N</text>
          <line x1="50" y1="0" x2="50" y2="40" stroke="#0b0f19" stroke-width="2"/>
        </g>
        <!-- Magnet 2 -->
        <g transform="translate(190, 40)">
          <rect x="0" y="0" width="50" height="40" fill="${varColor('--pole-s')}" rx="3"/>
          <text x="25" y="26" fill="#0b0f19" font-weight="bold" font-size="14" text-anchor="middle">S</text>
          <rect x="50" y="0" width="50" height="40" fill="${varColor('--pole-n')}" rx="3"/>
          <text x="75" y="26" fill="#0b0f19" font-weight="bold" font-size="14" text-anchor="middle">N</text>
          <line x1="50" y1="0" x2="50" y2="40" stroke="#0b0f19" stroke-width="2"/>
        </g>
        <!-- Path connection representation -->
        <path d="M 130 60 L 190 60" fill="none" stroke="#a855f7" stroke-width="2" stroke-dasharray="3,3"/>
      </svg>
    `;
  } else if (visualType === 'single_center') {
    svgContent = `
      <svg viewBox="0 0 320 120" style="width: 100%; max-width: 280px; height: auto;">
        <rect x="0" y="0" width="100%" height="100%" fill="#0b0f19" rx="8"/>
        <!-- Magnet -->
        <g transform="translate(100, 50)">
          <rect x="0" y="0" width="60" height="40" fill="${varColor('--pole-n')}" rx="3"/>
          <text x="30" y="26" fill="#0b0f19" font-weight="bold" font-size="16" text-anchor="middle">N</text>
          <rect x="60" y="0" width="60" height="40" fill="${varColor('--pole-s')}" rx="3"/>
          <text x="90" y="26" fill="#0b0f19" font-weight="bold" font-size="16" text-anchor="middle">S</text>
          <line x1="60" y1="0" x2="60" y2="40" stroke="#0b0f19" stroke-width="2"/>
        </g>
        <!-- Compass placement point directly above -->
        <circle cx="160" cy="25" r="14" fill="rgba(255,255,255,0.05)" stroke="#a855f7" stroke-width="1.5" stroke-dasharray="3,2"/>
        <text x="160" y="29" fill="#a855f7" font-weight="bold" font-size="11" text-anchor="middle">?</text>
      </svg>
    `;
  } else if (visualType === 'mystery_pole') {
    svgContent = `
      <svg viewBox="0 0 320 120" style="width: 100%; max-width: 280px; height: auto;">
        <rect x="0" y="0" width="100%" height="100%" fill="#0b0f19" rx="8"/>
        <!-- Magnet -->
        <g transform="translate(140, 40)">
          <rect x="0" y="0" width="100%" height="40" fill="#222d42" rx="3" stroke="rgba(255,255,255,0.1)"/>
          <text x="50" y="26" fill="#ffffff" font-weight="bold" font-size="18" text-anchor="middle">P</text>
        </g>
        <!-- Compass on left pointing directly to the magnet -->
        <g transform="translate(70, 60)">
          <circle cx="0" cy="0" r="20" fill="#172033" stroke="#00d2ff" stroke-width="2"/>
          <polygon points="0,-14 5,0 0,3" fill="${varColor('--pole-n')}" transform="rotate(90)"/>
          <polygon points="0,14 5,0 0,3" fill="${varColor('--pole-s')}" transform="rotate(90)"/>
          <circle cx="0" cy="0" r="2" fill="#fff"/>
        </g>
      </svg>
    `;
  }
  
  visualBox.innerHTML = svgContent;
}

function handleAnswerSelect(selectedIndex) {
  if (hasAnswered) return;
  hasAnswered = true;
  
  const q = activeQuestions[currentQuestionIndex];
  const buttons = document.querySelectorAll('.option-btn');
  
  // Highlight choice results
  buttons.forEach((btn, index) => {
    btn.disabled = true; // Disable further selections
    
    if (index === q.answer) {
      btn.classList.add('correct');
      btn.querySelector('.indicator').textContent = '✅';
    } else if (index === selectedIndex) {
      btn.classList.add('incorrect');
      btn.querySelector('.indicator').textContent = '❌';
    }
  });
  
  // Check answer correctness
  const isCorrect = (selectedIndex === q.answer);
  if (isCorrect) {
    quizScore++;
    triggerCorrectEffects();
  }
  
  // Update scoreboard live tracker
  document.getElementById('quiz-score-tracker').textContent = `Score: ${quizScore}/${currentQuestionIndex + 1}`;

  // Fill in and reveal explanation drawer
  const drawer = document.getElementById('explanation-drawer');
  const statusMsg = document.getElementById('status-msg');
  const statusIcon = document.getElementById('status-icon');
  
  if (isCorrect) {
    statusMsg.textContent = "Correct!";
    statusMsg.style.color = 'var(--success)';
    statusIcon.textContent = "✅";
  } else {
    statusMsg.textContent = "Incorrect";
    statusMsg.style.color = 'var(--error)';
    statusIcon.textContent = "❌";
  }
  
  document.getElementById('explanation-text').textContent = q.explanation;
  drawer.classList.remove('hidden');
}

function triggerCorrectEffects() {
  const container = document.getElementById('quiz-container');
  const colors = ['#00d2ff', '#ff9f00', '#a855f7', '#ffffff'];
  
  // Create small neon confetti burst
  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    particle.className = 'confetti-particle';
    particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    particle.style.left = `${50 + (Math.random() - 0.5) * 40}%`;
    particle.style.top = `30%`;
    particle.style.transform = `scale(${Math.random() * 0.8 + 0.4})`;
    
    // Custom animation values
    const dx = (Math.random() - 0.5) * 300;
    const dy = (Math.random() - 0.2) * 150;
    particle.animate([
      { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
      { transform: `translate(${dx}px, ${dy}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
    ], {
      duration: 1000 + Math.random() * 400,
      easing: 'cubic-bezier(0.1, 0.8, 0.3, 1)',
      fill: 'forwards'
    });
    
    container.appendChild(particle);
    setTimeout(() => particle.remove(), 1500);
  }
}

function goToNextQuestion() {
  currentQuestionIndex++;
  
  if (currentQuestionIndex < 10) {
    loadQuestion();
  } else {
    showQuizResults();
  }
}

function showQuizResults() {
  document.getElementById('quiz-container').classList.add('hidden');
  document.getElementById('results-container').classList.remove('hidden');
  
  // Update Score Displays
  document.getElementById('final-score-val').textContent = quizScore;
  
  // Feedback Messages based on Score Tiers
  const feedbackMsg = document.getElementById('feedback-tier-msg');
  if (quizScore >= 9) {
    feedbackMsg.textContent = "Excellent! You've mastered this topic. 🚀";
    feedbackMsg.style.color = '#22c55e';
  } else if (quizScore >= 7) {
    feedbackMsg.textContent = "Great work! Just a few areas to review. 👍";
    feedbackMsg.style.color = '#3b82f6';
  } else if (quizScore >= 5) {
    feedbackMsg.textContent = "Good attempt — review flashcards before trying again. 📚";
    feedbackMsg.style.color = '#facc15';
  } else {
    feedbackMsg.textContent = "Keep practicing! Revisit Concept and Flashcard tabs. 🔄";
    feedbackMsg.style.color = '#ef4444';
  }
}
