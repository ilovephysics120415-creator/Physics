/* ==========================================================================
   ELECTRIC FIELD LINE BUILDER - CORE JAVASCRIPT
   Syllabus 6091 (Singapore O-Level Physics)
   ========================================================================== */

// --- Global App State ---
const state = {
  activeSection: 'intro',
  activeConcept: 'c1',
  explorerPart: 'part-a',
  
  // Section 2A State
  chargeASign: 1, // 1 for +, -1 for -
  testCharge: { x: 350, y: 160, r: 8 },
  isDraggingTestCharge: false,
  
  // Section 2B State
  chargesB: [
    { x: 180, y: 160, q: 1 },  // Left charge: + by default
    { x: 320, y: 160, q: -1 }  // Right charge: - by default
  ],
  
  // Section 3 State (MCQ)
  quizStarted: false,
  currentQuestionIndex: 0,
  quizQuestions: [],
  selectedOptionIndex: null,
  quizScore: 0,
  questionsAnsweredCount: 0,
  
  // Scoring Tracker
  explorerAInteracted: false,
  explorerBInteracted: false,
  
  // Section 5 State (Flashcards)
  flashcardIndex: 0,
  flashcardsList: []
};

// --- Helper Functions ---
function getDist(p1, p2) {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

// Draw positive/negative charges in SVG
function drawChargeNode(svg, x, y, q, label = "") {
  const color = q > 0 ? 'var(--color-cyan)' : 'var(--color-magenta)';
  const shadow = q > 0 ? 'var(--glow-cyan)' : 'var(--glow-magenta)';
  
  // Outer glowing circle
  const glow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  glow.setAttribute('cx', x);
  glow.setAttribute('cy', y);
  glow.setAttribute('r', 16);
  glow.setAttribute('fill', 'rgba(11, 8, 19, 0.9)');
  glow.setAttribute('stroke', color);
  glow.setAttribute('stroke-width', '2.5');
  glow.setAttribute('style', `filter: drop-shadow(${shadow.replace('0 0 15px', '0 0 6px')})`);
  svg.appendChild(glow);

  // Sign label text
  const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  text.setAttribute('x', x);
  text.setAttribute('y', y + 5);
  text.setAttribute('text-anchor', 'middle');
  text.setAttribute('fill', color);
  text.setAttribute('font-family', 'var(--font-family-header)');
  text.setAttribute('font-size', '16px');
  text.setAttribute('font-weight', '700');
  text.textContent = q > 0 ? '+' : '−';
  svg.appendChild(text);

  if (label) {
    const textLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textLabel.setAttribute('x', x);
    textLabel.setAttribute('y', y + 32);
    textLabel.setAttribute('text-anchor', 'middle');
    textLabel.setAttribute('fill', 'var(--color-text-secondary)');
    textLabel.setAttribute('font-size', '10px');
    textLabel.setAttribute('font-weight', '600');
    textLabel.textContent = label;
    svg.appendChild(textLabel);
  }
}

// Add markers for arrow directions along paths
function createSvgArrowMarker(svg, id, color) {
  let defs = svg.querySelector('defs');
  if (!defs) {
    defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    svg.appendChild(defs);
  }
  
  if (defs.querySelector(`#${id}`)) return;

  const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
  marker.setAttribute('id', id);
  marker.setAttribute('viewBox', '0 0 10 10');
  marker.setAttribute('refX', '7');
  marker.setAttribute('refY', '5');
  marker.setAttribute('markerWidth', '11');
  marker.setAttribute('markerHeight', '11');
  marker.setAttribute('orient', 'auto-start-reverse');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M 0 1 L 9 5 L 0 9 z');
  path.setAttribute('fill', color);
  marker.appendChild(path);
  defs.appendChild(marker);
}

// --- 30 MCQ QUESTION DATABASE ---
const QUIZ_POOL = [
  {
    id: 1,
    question: "Which of the following correctly defines an electric field?",
    options: [
      "A region in which an electric charge experiences a force.",
      "A region where current flows automatically without any voltage.",
      "The path taken by a neutral particle when placed near a charge.",
      "The total voltage divided by the resistance of a circuit."
    ],
    correct: 0,
    explanation: "According to the O-Level syllabus, an electric field is defined as a region in which an electric charge experiences an electric force."
  },
  {
    id: 2,
    question: "What is the direction of electric field lines defined as?",
    options: [
      "The direction of the force acting on a positive test charge.",
      "The direction of the force acting on a negative test charge.",
      "The path taken by a free electron in the field.",
      "The direction from lower potential to higher potential."
    ],
    correct: 0,
    explanation: "Electric field lines show the direction of the force that acts on a POSITIVE test charge."
  },
  {
    id: 3,
    question: "Which statement is true regarding the crossing of electric field lines?",
    options: [
      "Electric field lines never cross each other.",
      "Electric field lines cross only when unlike charges are placed close to each other.",
      "Electric field lines cross near the neutral point.",
      "Electric field lines can cross if the charges are extremely strong."
    ],
    correct: 0,
    explanation: "Field lines can never cross. If they crossed, a test charge at the intersection would experience force in two different directions simultaneously, which is impossible."
  },
  {
    id: 4,
    question: "How does the spacing of electric field lines relate to the strength of the electric field?",
    options: [
      "Closer spacing indicates a stronger electric field.",
      "Wider spacing indicates a stronger electric field.",
      "Spacing is independent of field strength.",
      "Closer lines mean the electric force is zero."
    ],
    correct: 0,
    explanation: "The density or closeness of the electric field lines represents the field strength. Closer lines indicate a stronger field region."
  },
  {
    id: 5,
    question: "A positive charge is placed in an electric field. In which direction will it experience a force?",
    options: [
      "In the direction of the field lines.",
      "Opposite to the direction of the field lines.",
      "Perpendicular to the direction of the field lines.",
      "It will not experience any force."
    ],
    correct: 0,
    explanation: "By definition, the electric field direction is the direction of force on a positive test charge. Thus, positive charges accelerate in the direction of field lines."
  },
  {
    id: 6,
    question: "A negative charge is placed in an electric field. In which direction will it experience a force?",
    options: [
      "Opposite to the direction of the field lines.",
      "In the direction of the field lines.",
      "At a right angle to the field lines.",
      "It remains completely stationary."
    ],
    correct: 0,
    explanation: "Since field lines show the direction of force on a POSITIVE charge, a NEGATIVE charge experiences a force in the exact opposite direction of the field lines."
  },
  {
    id: 7,
    question: "Which diagram correctly represents the field lines of an isolated positive point charge?",
    options: [
      "Straight radial lines pointing outwards.",
      "Straight radial lines pointing inwards.",
      "Concentric circular lines around the charge.",
      "Curved paths ending on the charge."
    ],
    correct: 0,
    explanation: "An isolated positive charge repels a positive test charge, pushing it radially outward. Therefore, field lines point straight away from positive charges."
  },
  {
    id: 8,
    question: "Which diagram correctly represents the field lines of an isolated negative point charge?",
    options: [
      "Straight radial lines pointing inwards.",
      "Straight radial lines pointing outwards.",
      "Curved paths looping out from the charge.",
      "Parallel straight lines going upwards."
    ],
    correct: 0,
    explanation: "An isolated negative charge attracts a positive test charge radially inward. Thus, lines point straight towards the negative charge."
  },
  {
    id: 9,
    question: "For two identical positive charges placed near each other, what feature appears in the field line pattern?",
    options: [
      "A neutral point (zero electric field) right between them with lines curving outwards.",
      "Continuous lines linking one positive charge to the other positive charge.",
      "Lines crossing each other exactly halfway between the charges.",
      "No field lines are produced in this configuration."
    ],
    correct: 0,
    explanation: "Identical positive charges repel each other. Their field lines curve away and repel outward, creating a neutral point (where E = 0) midway between them."
  },
  {
    id: 10,
    question: "For two unlike charges (+ and −) of equal magnitude, what does the field pattern look like?",
    options: [
      "Lines curve smoothly from the positive charge to the negative charge.",
      "Lines point straight outwards from both charges and repel away.",
      "Concentric loops enclosing both charges.",
      "Lines starting on the negative charge and ending on the positive charge."
    ],
    correct: 0,
    explanation: "Electric field lines start from the positive charge and curve continuously to end on the negative charge, demonstrating attraction."
  },
  {
    id: 11,
    question: "What error is present in a diagram where electric field lines form closed circles around a single charge?",
    options: [
      "Electric field lines must start on positive charges and end on negative charges; they do not form closed loops.",
      "The lines are pointing outwards instead of inwards.",
      "The circular loops must cross each other.",
      "There is no error; this is the correct magnetic field pattern."
    ],
    correct: 0,
    explanation: "Unlike magnetic fields, electrostatic field lines do not form closed loops. They must start on positive charges (or infinity) and end on negative charges (or infinity)."
  },
  {
    id: 12,
    question: "A student draws electric field lines between two negative charges pointing towards each other. What is the key error?",
    options: [
      "The lines should bend away (repel) rather than linking directly between them.",
      "The lines should point outwards.",
      "The lines must cross each other.",
      "No lines are allowed to start at infinity."
    ],
    correct: 0,
    explanation: "Two negative charges repel. The lines should bend outwards and point inwards towards each charge, creating a neutral point between them, rather than linking together."
  },
  {
    id: 13,
    question: "If the distance between two electric field lines increases, what does this indicate about the electric field?",
    options: [
      "The field strength is decreasing.",
      "The field strength is increasing.",
      "The field strength remains constant.",
      "The charge has suddenly changed sign."
    ],
    correct: 0,
    explanation: "Wider spacing of field lines indicates a weaker electric field. As lines spread out, the force experienced by a charge at that position decreases."
  },
  {
    id: 14,
    question: "Which of the following is NOT a property of electric field lines?",
    options: [
      "They are physical, visible strings in space.",
      "They never cross each other.",
      "They start on + charges and end on − charges.",
      "The spacing indicates the strength of the field."
    ],
    correct: 0,
    explanation: "Electric field lines are imaginary mathematical lines used to represent and visualize the electric field. They are not physical strings."
  },
  {
    id: 15,
    question: "At a neutral point between two charges, what is the net electric force on a positive test charge?",
    options: [
      "Zero",
      "Extremely large, pointing upwards",
      "Equal to the charge value times the speed of light",
      "Unstable, fluctuating rapidly"
    ],
    correct: 0,
    explanation: "At a neutral point, the electric field strengths from both charges are equal in magnitude and opposite in direction, cancel out, so the net force is zero."
  },
  {
    id: 16,
    question: "How do field lines behave near a sharp corner of a charged conductor compared to a flat surface?",
    options: [
      "They are crowded more closely together at sharp corners.",
      "They are spaced wider apart at sharp corners.",
      "They avoid sharp corners entirely.",
      "They cross each other only at the sharp corners."
    ],
    correct: 0,
    explanation: "Electric charges accumulate at sharp points. Thus, electric field lines are closer and more crowded near sharp corners, representing a stronger field."
  },
  {
    id: 17,
    question: "In an electric field diagram, a line is shown originating from a positive charge but does not end on a negative charge. Where does it go?",
    options: [
      "It extends to infinity.",
      "It disappears randomly in space.",
      "It curves back to the same positive charge.",
      "It must cross another line to terminate."
    ],
    correct: 0,
    explanation: "If there is no negative charge nearby, field lines starting from a positive charge extend all the way to infinity."
  },
  {
    id: 18,
    question: "When looking at the field pattern of a positive and a negative charge, why do the lines curve?",
    options: [
      "The force at any point is the vector sum of forces from both charges, changing direction dynamically.",
      "Light bends the field lines due to gravity.",
      "The charges are spinning rapidly.",
      "The medium between them causes refraction."
    ],
    correct: 0,
    explanation: "At any point, a test charge feels a repulsive force from the + charge and an attractive force to the − charge. The vector sum of these forces results in a curved trajectory."
  },

  {
    id: 20,
    question: "An uncharged metal sphere is placed in a uniform electric field. How do the field lines meet the sphere's surface?",
    options: [
      "They meet the surface at right angles (90 degrees).",
      "They meet the surface parallel (0 degrees).",
      "They pass straight through the sphere without bending.",
      "They form loops circling the outer sphere surface."
    ],
    correct: 0,
    explanation: "Electrostatic field lines always meet the surface of a conductor at right angles (90°)."
  },
  {
    id: 21,
    question: "Why can't field lines start and end on the same isolated point charge?",
    options: [
      "Because lines must go from positive to negative, not loop back to the same sign.",
      "Because a single charge does not produce any force.",
      "Because the charge would explode under its own field.",
      "Because the field lines are too thick to bend that way."
    ],
    correct: 0,
    explanation: "Field lines start on positive charges and end on negative ones. A loop starting and ending on the same charge would violate the direction of force rules."
  },
  {
    id: 22,
    question: "If a positive test charge is placed exactly in the middle of two identical negative charges, what happens?",
    options: [
      "It experiences zero net force.",
      "It accelerates to the right.",
      "It accelerates to the left.",
      "It moves in circular loops."
    ],
    correct: 0,
    explanation: "Since it is equidistant from two identical negative charges, it is pulled equally in opposite directions, resulting in a net force of zero."
  },
  {
    id: 23,
    question: "What does the density of lines entering a charge tell us about the charge?",
    options: [
      "It is proportional to the magnitude of the charge.",
      "It tells us the exact temperature of the charge.",
      "It indicates that the charge is positive.",
      "It is always constant regardless of charge value."
    ],
    correct: 0,
    explanation: "The number of field lines starting or ending on a charge is proportional to the magnitude of that charge."
  },
  {
    id: 24,
    question: "Which of the following describes a uniform electric field?",
    options: [
      "Parallel, equally spaced electric field lines.",
      "Concentric circular field lines.",
      "Radial lines spreading outwards.",
      "Wavy lines going in different directions."
    ],
    correct: 0,
    explanation: "A uniform electric field has the same strength and direction everywhere, represented by parallel, equally spaced straight lines (e.g. between parallel plates)."
  },
  {
    id: 25,
    question: "If you double the charge of an isolated point charge, what happens to the field lines?",
    options: [
      "The number of lines representing the field doubles, representing a stronger field.",
      "The lines reverse their direction.",
      "The lines cross each other near the center.",
      "The lines become circular."
    ],
    correct: 0,
    explanation: "More charge means a stronger field, which is represented by drawing a higher density of field lines (doubling them)."
  },
  {
    id: 26,
    question: "Which of the following objects can experience an electric force when placed inside an electric field?",
    options: [
      "An electron",
      "A neutron",
      "A neutral helium atom",
      "A piece of pure wood"
    ],
    correct: 0,
    explanation: "Only charged particles experience an electric force in an electric field. An electron has a negative charge and will experience a force."
  },
  {
    id: 27,
    question: "A test charge is used to map an electric field. What must be true about the test charge?",
    options: [
      "It must be positive and extremely small so it doesn't disturb the source charges.",
      "It must be negative and very large.",
      "It must have neutral net charge.",
      "It must be moving at the speed of light."
    ],
    correct: 0,
    explanation: "A test charge is defined as positive and must be infinitesimally small so its own electric field does not relocate the charges we are trying to measure."
  },
  {
    id: 28,
    question: "If two field lines are drawn crossing each other, what rule does this violate?",
    options: [
      "A positive test charge cannot experience forces in two different directions at one point.",
      "It violates the law of conservation of mass.",
      "The lines would cancel out and make the field disappear.",
      "The charges would attract each other too strongly."
    ],
    correct: 0,
    explanation: "If they crossed, a single positive test charge placed at the crossing point would experience two forces in different directions, yielding two net force vectors, which is physically impossible."
  },
  {
    id: 29,
    question: "Which charge combination matches: field lines curving outward and repelling with no lines linking the two?",
    options: [
      "Like charges (+/+ or −/−)",
      "Unlike charges (+/−)",
      "A single charge and a neutral plate",
      "This pattern is impossible to produce."
    ],
    correct: 0,
    explanation: "Like charges (+/+ or −/−) repel, causing their field lines to bend outwards away from the space between them."
  },
  {
    id: 30,
    question: "What is the force per unit charge defined as?",
    options: [
      "Electric Field Strength",
      "Electric Potential Difference",
      "Electric Current",
      "Electrostatic Resistance"
    ],
    correct: 0,
    explanation: "Electric Field Strength (E) is mathematically defined as the force (F) acting per unit positive charge (q). E = F / q."
  }
];

// --- FLASHCARDS DATABASE ---
const FLASHCARDS = [
  {
    category: "Definition",
    front: "What is an Electric Field?",
    back: "An electric field is a region in which an electric charge experiences an electric force."
  },
  {
    category: "Field Lines Rule 1",
    front: "What do Electric Field Lines represent?",
    back: "They show the direction of the force acting on a positive test charge placed in the field."
  },
  {
    category: "Field Lines Rule 2",
    front: "Which direction do field lines point relative to charge signs?",
    back: "They point AWAY from positive charges (+) and TOWARDS negative charges (−)."
  },
  {
    category: "Field Lines Rule 3",
    front: "Can electric field lines ever cross each other? Why?",
    back: "No. If they crossed, a test charge at the intersection would experience force in two directions at once, which is impossible."
  },
  {
    category: "Field Strength",
    front: "How is electric field strength shown by lines?",
    back: "By line spacing. Closer field lines indicate a stronger field; wider spacing indicates a weaker field."
  },
  {
    category: "Two Like Charges",
    front: "What is the field pattern and neutral point of like charges?",
    back: "Lines bend away from each other (repel). Exactly midway between identical charges, the fields cancel out creating a Neutral Point (E = 0)."
  },
  {
    category: "Two Unlike Charges",
    front: "Describe the pattern of unlike charges (+ and −).",
    back: "Lines curve smoothly and continuously from the positive charge and terminate on the negative charge, showing attraction."
  },
  {
    category: "Test Charge Force",
    front: "How does a negative charge move in a field compared to field lines?",
    back: "It experiences a force in the opposite direction of the field lines (since field lines are defined by positive charges)."
  }
];

// --- SECTION 1: ANIMATED CONCEPT VISUALIZATIONS ---
function drawConceptAnimation(conceptId) {
  const svg = document.getElementById('intro-svg');
  svg.innerHTML = ''; // Clear SVG
  
  const w = svg.clientWidth || 400;
  const h = 240;
  
  if (conceptId === 'c1') {
    // 1. Force Region: Glowing boundary around a charge
    const cx = w / 2;
    const cy = h / 2;
    
    // Draw background boundary ring
    const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ring.setAttribute('cx', cx);
    ring.setAttribute('cy', cy);
    ring.setAttribute('r', 80);
    ring.setAttribute('fill', 'none');
    ring.setAttribute('stroke', 'var(--color-cyan)');
    ring.setAttribute('stroke-width', '1.5');
    ring.setAttribute('stroke-dasharray', '5,5');
    ring.setAttribute('opacity', '0.6');
    
    // Add pulsing animation inside SVG
    const pulseAnim = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    pulseAnim.setAttribute('attributeName', 'r');
    pulseAnim.setAttribute('values', '60;90;60');
    pulseAnim.setAttribute('dur', '4s');
    pulseAnim.setAttribute('repeatCount', 'indefinite');
    ring.appendChild(pulseAnim);
    svg.appendChild(ring);

    // Source positive charge
    drawChargeNode(svg, cx, cy, 1);
    
    // Draw tiny test charge experiencing force
    const tx = cx + 55;
    const ty = cy - 35;
    
    // Force arrow
    const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    arrow.setAttribute('x1', tx);
    arrow.setAttribute('y1', ty);
    arrow.setAttribute('x2', tx + 30);
    arrow.setAttribute('y2', ty - 19);
    arrow.setAttribute('stroke', 'var(--color-yellow)');
    arrow.setAttribute('stroke-width', '3');
    createSvgArrowMarker(svg, 'arrow-gold', 'var(--color-yellow)');
    arrow.setAttribute('marker-end', 'url(#arrow-gold)');
    svg.appendChild(arrow);

    // Test charge dot
    const tc = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    tc.setAttribute('cx', tx);
    tc.setAttribute('cy', ty);
    tc.setAttribute('r', 6);
    tc.setAttribute('fill', 'var(--color-yellow)');
    svg.appendChild(tc);

    const tcText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    tcText.setAttribute('x', tx);
    tcText.setAttribute('y', ty - 10);
    tcText.setAttribute('fill', 'var(--color-yellow)');
    tcText.setAttribute('font-size', '10px');
    tcText.setAttribute('font-weight', '700');
    tcText.setAttribute('text-anchor', 'middle');
    tcText.textContent = "q⁺";
    svg.appendChild(tcText);
    
  } else if (conceptId === 'c2') {
    // 2. Direction: Test charge tracing force
    const cx = w / 2;
    const cy = h / 2;
    drawChargeNode(svg, cx, cy, 1);
    
    // Tracing path line
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', cx);
    line.setAttribute('y1', cy);
    line.setAttribute('x2', cx + 100);
    line.setAttribute('y2', cy);
    line.setAttribute('stroke', 'var(--color-cyan)');
    line.setAttribute('stroke-width', '2');
    line.setAttribute('stroke-dasharray', '5,5');
    svg.appendChild(line);
    
    // Animated test charge moving along the line
    const tc = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    tc.setAttribute('cx', cx + 30);
    tc.setAttribute('cy', cy);
    tc.setAttribute('r', 6);
    tc.setAttribute('fill', 'var(--color-yellow)');
    
    const moveAnim = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    moveAnim.setAttribute('attributeName', 'cx');
    moveAnim.setAttribute('values', `${cx + 25};${cx + 100};${cx + 25}`);
    moveAnim.setAttribute('dur', '3s');
    moveAnim.setAttribute('repeatCount', 'indefinite');
    tc.appendChild(moveAnim);
    svg.appendChild(tc);
    
  } else if (conceptId === 'c3') {
    // 3. Sign Rules: Positive outwards, Negative inwards
    // Positive charge left side
    const pX = w / 3;
    const pY = h / 2;
    drawChargeNode(svg, pX, pY, 1, "Positive (+)");

    // Negative charge right side
    const nX = (w / 3) * 2;
    const nY = h / 2;
    drawChargeNode(svg, nX, nY, -1, "Negative (−)");

    createSvgArrowMarker(svg, 'arrow-cyan', 'var(--color-cyan)');
    createSvgArrowMarker(svg, 'arrow-mag', 'var(--color-magenta)');

    // Draw outward/inward lines
    const angles = [0, 90, 180, 270];
    angles.forEach(a => {
      const rad = (a * Math.PI) / 180;
      
      // Outward from Positive
      const l1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      l1.setAttribute('x1', pX + Math.cos(rad) * 18);
      l1.setAttribute('y1', pY + Math.sin(rad) * 18);
      l1.setAttribute('x2', pX + Math.cos(rad) * 45);
      l1.setAttribute('y2', pY + Math.sin(rad) * 45);
      l1.setAttribute('stroke', 'var(--color-cyan)');
      l1.setAttribute('stroke-width', '2');
      l1.setAttribute('marker-end', 'url(#arrow-cyan)');
      svg.appendChild(l1);

      // Inward to Negative
      const l2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      l2.setAttribute('x1', nX + Math.cos(rad) * 45);
      l2.setAttribute('y1', nY + Math.sin(rad) * 45);
      l2.setAttribute('x2', nX + Math.cos(rad) * 18);
      l2.setAttribute('y2', nY + Math.sin(rad) * 18);
      l2.setAttribute('stroke', 'var(--color-magenta)');
      l2.setAttribute('stroke-width', '2');
      l2.setAttribute('marker-end', 'url(#arrow-mag)');
      svg.appendChild(l2);
    });

  } else if (conceptId === 'c4') {
    // 4. No Crossing: Illustrate lines curving away instead of crossing
    const c1x = w / 3;
    const c2x = (w / 3) * 2;
    const cy = h / 2;

    drawChargeNode(svg, c1x, cy, 1);
    drawChargeNode(svg, c2x, cy, 1);

    // Draw repelling lines (which bend away, avoiding crossing)
    for (let i = -2; i <= 2; i++) {
      const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const offset = i * 25;
      // Curved paths bending away from the center
      path1.setAttribute('d', `M ${c1x} ${cy} Q ${(c1x + c2x)/2 - 15} ${cy + offset} ${(c1x + c2x)/2 - 25} ${cy + offset * 1.8}`);
      path1.setAttribute('fill', 'none');
      path1.setAttribute('stroke', 'var(--color-cyan)');
      path1.setAttribute('stroke-width', '1.5');
      svg.appendChild(path1);

      const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path2.setAttribute('d', `M ${c2x} ${cy} Q ${(c1x + c2x)/2 + 15} ${cy + offset} ${(c1x + c2x)/2 + 25} ${cy + offset * 1.8}`);
      path2.setAttribute('fill', 'none');
      path2.setAttribute('stroke', 'var(--color-cyan)');
      path2.setAttribute('stroke-width', '1.5');
      svg.appendChild(path2);
    }

    // Add a text indicator for the gap
    const warnText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    warnText.setAttribute('x', w / 2);
    warnText.setAttribute('y', cy + 5);
    warnText.setAttribute('text-anchor', 'middle');
    warnText.setAttribute('fill', 'var(--color-yellow)');
    warnText.setAttribute('font-size', '10px');
    warnText.setAttribute('font-weight', '700');
    warnText.textContent = "Lines repel, never cross!";
    svg.appendChild(warnText);

  } else if (conceptId === 'c5') {
    // 5. Spacing/Strength: Closeness represents strength
    const cy = h / 2;
    
    // Left side: strong field (dense lines)
    const leftX = w / 4;
    for (let i = -4; i <= 4; i++) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', leftX - 35);
      line.setAttribute('y1', cy + i * 8);
      line.setAttribute('x2', leftX + 35);
      line.setAttribute('y2', cy + i * 8);
      line.setAttribute('stroke', 'var(--color-cyan)');
      line.setAttribute('stroke-width', '1.5');
      svg.appendChild(line);
    }
    
    const labelL = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    labelL.setAttribute('x', leftX);
    labelL.setAttribute('y', cy + 55);
    labelL.setAttribute('text-anchor', 'middle');
    labelL.setAttribute('fill', 'var(--color-cyan)');
    labelL.setAttribute('font-size', '11px');
    labelL.setAttribute('font-weight', '700');
    labelL.textContent = "Close = Strong";
    svg.appendChild(labelL);

    // Right side: weak field (sparse lines)
    const rightX = (w / 4) * 3;
    for (let i = -2; i <= 2; i++) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', rightX - 35);
      line.setAttribute('y1', cy + i * 18);
      line.setAttribute('x2', rightX + 35);
      line.setAttribute('y2', cy + i * 18);
      line.setAttribute('stroke', 'var(--color-cyan)');
      line.setAttribute('stroke-width', '1.5');
      svg.appendChild(line);
    }

    const labelR = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    labelR.setAttribute('x', rightX);
    labelR.setAttribute('y', cy + 55);
    labelR.setAttribute('text-anchor', 'middle');
    labelR.setAttribute('fill', 'var(--color-text-secondary)');
    labelR.setAttribute('font-size', '11px');
    labelR.setAttribute('font-weight', '700');
    labelR.textContent = "Spaced = Weak";
    svg.appendChild(labelR);
  }
}

// --- SECTION 2: INTERACTIVE FIELD SIMULATOR ENGINE ---

// Compute combined electric field vector E at (x, y)
function computeElectricField(x, y, charges) {
  let Ex = 0;
  let Ey = 0;
  const k = 80000; // Scaling constant
  
  charges.forEach(charge => {
    const dx = x - charge.x;
    const dy = y - charge.y;
    const r2 = dx * dx + dy * dy;
    const r = Math.sqrt(r2);
    if (r < 15) return; // Avoid singularity
    
    // E = k * q / r^2
    const Emag = (k * charge.q) / r2;
    Ex += Emag * (dx / r);
    Ey += Emag * (dy / r);
  });
  
  return { Ex, Ey };
}

// Plot field lines using Euler integration
function traceFieldLines(svg, charges) {
  svg.innerHTML = ''; // Clear previous SVG contents
  
  const w = svg.clientWidth || 500;
  const h = 320;
  
  const isSingle = charges.length === 1;
  const strokeColor = !isSingle ? 'var(--color-cyan)' : (charges[0].q > 0 ? 'var(--color-cyan)' : 'var(--color-magenta)');
  const markerId = !isSingle ? 'arr-cyan' : (charges[0].q > 0 ? 'arr-cyan' : 'arr-mag');
  createSvgArrowMarker(svg, markerId, strokeColor);

  const numLines = 12; // Standard O-Level field representation density
  const stepSize = 4;
  const maxSteps = 120;
  
  charges.forEach(charge => {
    // Start drawing lines near the surface of each charge
    const startRadius = 16;
    
    for (let i = 0; i < numLines; i++) {
      const angle = (i * 2 * Math.PI) / numLines;
      let x = charge.x + startRadius * Math.cos(angle);
      let y = charge.y + startRadius * Math.sin(angle);
      
      const pathPoints = [{ x, y }];
      let step = 0;
      let hitOtherCharge = false;
      
      // Determine trace direction based on charge sign (outward for +, inward for -)
      const direction = charge.q > 0 ? 1 : -1;
      
      while (step < maxSteps) {
        const field = computeElectricField(x, y, charges);
        const Emag = Math.sqrt(field.Ex * field.Ex + field.Ey * field.Ey);
        if (Emag < 0.05) break; // Terminate if field is too weak
        
        // Normalize vector & step
        const dx = (field.Ex / Emag) * stepSize * direction;
        const dy = (field.Ey / Emag) * stepSize * direction;
        
        x += dx;
        y += dy;
        
        // Check bounds
        if (x < 0 || x > w || y < 0 || y > h) break;
        
        // Check if we hit another charge
        let nearCharge = false;
        charges.forEach(other => {
          if (getDist({ x, y }, other) < 14) {
            nearCharge = true;
            hitOtherCharge = true;
          }
        });
        
        if (nearCharge) {
          pathPoints.push({ x, y });
          break;
        }
        
        pathPoints.push({ x, y });
        step++;
      }
      
      // Draw path
      if (pathPoints.length > 2) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        let d = `M ${pathPoints[0].x.toFixed(1)} ${pathPoints[0].y.toFixed(1)}`;
        for (let j = 1; j < pathPoints.length; j++) {
          d += ` L ${pathPoints[j].x.toFixed(1)} ${pathPoints[j].y.toFixed(1)}`;
        }
        
        path.setAttribute('d', d);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', strokeColor);
        path.setAttribute('stroke-width', '1.5');
        
        // Add arrow marker near the center of the path
        if (pathPoints.length > 15) {
          const midIndex = Math.floor(pathPoints.length * 0.4);
          
          // Place marker on a segment
          const segment = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          const segD = `M ${pathPoints[midIndex].x.toFixed(1)} ${pathPoints[midIndex].y.toFixed(1)} L ${pathPoints[midIndex + 1].x.toFixed(1)} ${pathPoints[midIndex + 1].y.toFixed(1)}`;
          segment.setAttribute('d', segD);
          segment.setAttribute('fill', 'none');
          segment.setAttribute('stroke', 'transparent');
          segment.setAttribute('marker-end', `url(#${markerId})`);
          svg.appendChild(segment);
        }
        
        svg.appendChild(path);
      }
    }
  });

  // Re-draw source charges on top so they sit nicely above lines
  charges.forEach((c, idx) => {
    drawChargeNode(svg, c.x, c.y, c.q, isSingle ? "Source Charge" : `q${idx + 1}`);
  });
}

// Render Explorer Part A
function renderExplorerA() {
  const svg = document.getElementById('canvas-a');
  const charges = [{ x: 250, y: 160, q: state.chargeASign }];
  
  // Trace field lines first
  traceFieldLines(svg, charges);
  
  // Calculate force vector on positive test charge
  const field = computeElectricField(state.testCharge.x, state.testCharge.y, charges);
  const Emag = Math.sqrt(field.Ex * field.Ex + field.Ey * field.Ey);
  
  // Normalize & scale force arrow representation
  const arrowScale = 45;
  const fx = Emag > 0 ? (field.Ex / Emag) * arrowScale : 0;
  const fy = Emag > 0 ? (field.Ey / Emag) * arrowScale : 0;
  
  // Draw force vector line
  if (Emag > 0.1) {
    const fLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    fLine.setAttribute('x1', state.testCharge.x);
    fLine.setAttribute('y1', state.testCharge.y);
    fLine.setAttribute('x2', state.testCharge.x + fx);
    fLine.setAttribute('y2', state.testCharge.y + fy);
    fLine.setAttribute('stroke', 'var(--color-yellow)');
    fLine.setAttribute('stroke-width', '3.5');
    createSvgArrowMarker(svg, 'force-arrow', 'var(--color-yellow)');
    fLine.setAttribute('marker-end', 'url(#force-arrow)');
    svg.appendChild(fLine);
    
    // Label force vector
    const fText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    fText.setAttribute('x', state.testCharge.x + fx * 1.3);
    fText.setAttribute('y', state.testCharge.y + fy * 1.3 + 4);
    fText.setAttribute('text-anchor', 'middle');
    fText.setAttribute('fill', 'var(--color-yellow)');
    fText.setAttribute('font-size', '11px');
    fText.setAttribute('font-weight', '700');
    fText.textContent = "Force (F)";
    svg.appendChild(fText);
  }

  // Draw draggable test charge node
  const testNode = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  testNode.setAttribute('class', 'test-charge-node');
  
  const outerGlow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  outerGlow.setAttribute('cx', state.testCharge.x);
  outerGlow.setAttribute('cy', state.testCharge.y);
  outerGlow.setAttribute('r', state.testCharge.r + 6);
  outerGlow.setAttribute('fill', 'rgba(255, 215, 0, 0.15)');
  outerGlow.setAttribute('stroke', 'var(--color-yellow)');
  outerGlow.setAttribute('stroke-width', '1.5');
  testNode.appendChild(outerGlow);
  
  const innerDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  innerDot.setAttribute('cx', state.testCharge.x);
  innerDot.setAttribute('cy', state.testCharge.y);
  innerDot.setAttribute('r', state.testCharge.r);
  innerDot.setAttribute('fill', 'var(--color-yellow)');
  testNode.appendChild(innerDot);

  const plusText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  plusText.setAttribute('x', state.testCharge.x);
  plusText.setAttribute('y', state.testCharge.y + 3.5);
  plusText.setAttribute('text-anchor', 'middle');
  plusText.setAttribute('fill', '#000');
  plusText.setAttribute('font-size', '10px');
  plusText.setAttribute('font-weight', '700');
  plusText.textContent = "+";
  testNode.appendChild(plusText);

  svg.appendChild(testNode);
  
  // Drag and drop event bindings
  const handleDrag = (e) => {
    if (!state.isDraggingTestCharge) return;
    const rect = svg.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    // Scale coords to viewBox
    const x = ((clientX - rect.left) / rect.width) * 500;
    const y = ((clientY - rect.top) / rect.height) * 320;
    
    // Keep test charge within limits and away from source charge center
    const distToCenter = getDist({ x, y }, { x: 250, y: 160 });
    if (distToCenter > 22 && x > 15 && x < 485 && y > 15 && y < 305) {
      state.testCharge.x = x;
      state.testCharge.y = y;
      renderExplorerA();
      state.explorerAInteracted = true;
    }
  };
  
  testNode.addEventListener('mousedown', () => state.isDraggingTestCharge = true);
  testNode.addEventListener('touchstart', (e) => {
    state.isDraggingTestCharge = true;
    e.preventDefault();
  }, { passive: false });
  
  window.addEventListener('mousemove', handleDrag);
  window.addEventListener('touchmove', handleDrag, { passive: false });
  
  const stopDrag = () => state.isDraggingTestCharge = false;
  window.addEventListener('mouseup', stopDrag);
  window.addEventListener('touchend', stopDrag);
}

// Render Explorer Part B
function renderExplorerB() {
  const svg = document.getElementById('canvas-b');
  traceFieldLines(svg, state.chargesB);
  
  // Analyze combinations and update labels
  const q1 = state.chargesB[0].q;
  const q2 = state.chargesB[1].q;
  const badge = document.getElementById('pattern-label-badge');
  const insight = document.getElementById('pattern-insight');
  
  if (q1 !== q2) {
    badge.textContent = "Unlike Charges (Attractive)";
    badge.className = "pattern-badge";
    insight.innerHTML = "<strong>Key Feature:</strong> Field lines form curved paths directly linking the positive charge to the negative charge, showing electrostatic attraction.";
  } else {
    badge.textContent = "Like Charges (Repulsive)";
    badge.className = "pattern-badge repel";
    const chargeType = q1 > 0 ? "positive" : "negative";
    insight.innerHTML = `<strong>Key Feature:</strong> Field lines repel and bend outwards away from the center line. A <strong>neutral point (E = 0)</strong> exists exactly halfway between them where fields cancel out.`;
  }
}

// --- SECTION 3: MCQ QUIZ ENGINE ---
function setupQuiz() {
  // Shuffle questions array and select 10
  const shuffled = [...QUIZ_POOL].sort(() => 0.5 - Math.random());
  state.quizQuestions = shuffled.slice(0, 10);
  state.currentQuestionIndex = 0;
  state.quizScore = 0;
  state.questionsAnsweredCount = 0;
  
  // Show start screen
  document.getElementById('quiz-start-screen').classList.add('active');
  document.getElementById('quiz-active-screen').classList.remove('active');
  document.getElementById('quiz-progress-num').textContent = "Question 1/10";
}

function startQuiz() {
  document.getElementById('quiz-start-screen').classList.remove('active');
  document.getElementById('quiz-active-screen').classList.add('active');
  renderQuizQuestion();
}

function drawQuizSvgDiagram(qId) {
  const svg = document.getElementById('quiz-q-svg');
  svg.innerHTML = '';
  const wrapper = document.getElementById('question-diagram-wrapper');
  
  // Enable or disable diagram based on question ID
  const diagramQuestions = [7, 8, 9, 10, 12, 29];
  if (!diagramQuestions.includes(qId)) {
    wrapper.style.display = 'none';
    return;
  }
  wrapper.style.display = 'block';
  
  const w = svg.clientWidth || 400;
  const h = 180;
  const cx = w / 2;
  const cy = h / 2;
  
  if (qId === 7) {
    // Isolated positive point charge representation
    drawChargeNode(svg, cx, cy, 1);
    createSvgArrowMarker(svg, 'q-arrow-cyan', 'var(--color-cyan)');
    for (let i = 0; i < 8; i++) {
      const angle = (i * 2 * Math.PI) / 8;
      const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      l.setAttribute('x1', cx + 18 * Math.cos(angle));
      l.setAttribute('y1', cy + 18 * Math.sin(angle));
      l.setAttribute('x2', cx + 45 * Math.cos(angle));
      l.setAttribute('y2', cy + 45 * Math.sin(angle));
      l.setAttribute('stroke', 'var(--color-cyan)');
      l.setAttribute('stroke-width', '1.5');
      l.setAttribute('marker-end', 'url(#q-arrow-cyan)');
      svg.appendChild(l);
    }
  } else if (qId === 8) {
    // Isolated negative point charge representation
    drawChargeNode(svg, cx, cy, -1);
    createSvgArrowMarker(svg, 'q-arrow-mag', 'var(--color-magenta)');
    for (let i = 0; i < 8; i++) {
      const angle = (i * 2 * Math.PI) / 8;
      const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      l.setAttribute('x1', cx + 45 * Math.cos(angle));
      l.setAttribute('y1', cy + 45 * Math.sin(angle));
      l.setAttribute('x2', cx + 18 * Math.cos(angle));
      l.setAttribute('y2', cy + 18 * Math.sin(angle));
      l.setAttribute('stroke', 'var(--color-magenta)');
      l.setAttribute('stroke-width', '1.5');
      l.setAttribute('marker-end', 'url(#q-arrow-mag)');
      svg.appendChild(l);
    }
  } else if (qId === 9 || qId === 12 || qId === 29) {
    // Like positive charge pattern representation
    const c1x = cx - 50;
    const c2x = cx + 50;
    drawChargeNode(svg, c1x, cy, 1);
    drawChargeNode(svg, c2x, cy, 1);
    for (let i = -2; i <= 2; i++) {
      const offset = i * 20;
      const p1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p1.setAttribute('d', `M ${c1x} ${cy} Q ${(c1x + c2x)/2 - 10} ${cy + offset} ${(c1x + c2x)/2 - 18} ${cy + offset * 1.5}`);
      p1.setAttribute('fill', 'none');
      p1.setAttribute('stroke', 'var(--color-cyan)');
      p1.setAttribute('stroke-width', '1.2');
      svg.appendChild(p1);

      const p2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p2.setAttribute('d', `M ${c2x} ${cy} Q ${(c1x + c2x)/2 + 10} ${cy + offset} ${(c1x + c2x)/2 + 18} ${cy + offset * 1.5}`);
      p2.setAttribute('fill', 'none');
      p2.setAttribute('stroke', 'var(--color-cyan)');
      p2.setAttribute('stroke-width', '1.2');
      svg.appendChild(p2);
    }
  } else if (qId === 10) {
    // Unlike charge pattern representation
    const c1x = cx - 60;
    const c2x = cx + 60;
    drawChargeNode(svg, c1x, cy, 1);
    drawChargeNode(svg, c2x, cy, -1);
    
    // Draw connecting field lines
    for (let i = -2; i <= 2; i++) {
      const offset = i * 30;
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M ${c1x} ${cy} C ${c1x + 30} ${cy + offset}, ${c2x - 30} ${cy + offset}, ${c2x} ${cy}`);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', 'var(--color-cyan)');
      path.setAttribute('stroke-width', '1.2');
      svg.appendChild(path);
    }
  }
}

function renderQuizQuestion() {
  const question = state.quizQuestions[state.currentQuestionIndex];
  state.selectedOptionIndex = null;
  
  // Hide feedback card
  document.getElementById('quiz-feedback-box').classList.add('hidden');
  
  // Set headers & progress
  document.getElementById('quiz-progress-num').textContent = `Question ${state.currentQuestionIndex + 1}/10`;
  document.getElementById('quiz-progress-bar').style.width = `${((state.currentQuestionIndex) / 10) * 100}%`;
  document.getElementById('question-text').textContent = question.question;
  
  // Render visual diagrams if appropriate
  drawQuizSvgDiagram(question.id);
  
  // Set options list
  const container = document.getElementById('options-container');
  container.innerHTML = '';
  
  // Map options to indices and shuffle
  const shuffledOptions = question.options.map((opt, originalIdx) => ({
    text: opt,
    originalIdx: originalIdx
  })).sort(() => 0.5 - Math.random());
  
  // Store the randomized order map to resolve correct answers on click
  state.currentShuffledOptionsMap = shuffledOptions;
  
  const letters = ['A', 'B', 'C', 'D'];
  shuffledOptions.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerHTML = `
      <span><span class="option-marker">${letters[idx]}.</span> ${opt.text}</span>
      <span class="option-status-icon"></span>
    `;
    btn.addEventListener('click', () => handleOptionSelection(idx));
    container.appendChild(btn);
  });
}

function handleOptionSelection(selectedIndex) {
  if (state.selectedOptionIndex !== null) return; // Disallow multiple attempts
  
  state.selectedOptionIndex = selectedIndex;
  state.questionsAnsweredCount++;
  
  const question = state.quizQuestions[state.currentQuestionIndex];
  const options = document.getElementById('options-container').children;
  const feedbackBox = document.getElementById('quiz-feedback-box');
  const feedbackIcon = document.getElementById('feedback-icon');
  const feedbackTitle = document.getElementById('feedback-title');
  const explanationText = document.getElementById('explanation-text');
  
  // Find index in shuffled options corresponding to the correct answer
  const correctShuffledIndex = state.currentShuffledOptionsMap.findIndex(opt => opt.originalIdx === question.correct);
  const isCorrect = selectedIndex === correctShuffledIndex;
  
  // Apply colors and classes
  for (let i = 0; i < options.length; i++) {
    const optBtn = options[i];
    const iconSpan = optBtn.querySelector('.option-status-icon');
    if (i === correctShuffledIndex) {
      optBtn.classList.add('correct');
      iconSpan.textContent = '✓';
    } else if (i === selectedIndex) {
      optBtn.classList.add('incorrect');
      iconSpan.textContent = '✕';
    }
  }
  
  if (isCorrect) {
    state.quizScore++;
    feedbackIcon.className = "feedback-icon correct";
    feedbackIcon.textContent = "✓";
    feedbackTitle.className = "feedback-title correct";
    feedbackTitle.textContent = "Correct!";
    triggerCelebrationBurst(); // Award micro-animation
  } else {
    feedbackIcon.className = "feedback-icon incorrect";
    feedbackIcon.textContent = "✕";
    feedbackTitle.className = "feedback-title incorrect";
    feedbackTitle.textContent = "Incorrect";
  }
  
  explanationText.textContent = question.explanation;
  feedbackBox.classList.remove('hidden');
  
  // Update score badge tracker in Section 4 automatically
  document.getElementById('score-3-val').textContent = `${state.quizScore}/10`;
}

function nextQuestion() {
  state.currentQuestionIndex++;
  if (state.currentQuestionIndex < 10) {
    renderQuizQuestion();
  } else {
    // Show results / Section 4
    document.getElementById('quiz-progress-bar').style.width = '100%';
    showSection('scoring');
  }
}

// --- SECTION 4: SCORING & FEEDBACK GRAPHICS ---
function calculateOverallStats() {
  // explorer A completion: state.explorerAInteracted
  // explorer B completion: state.explorerBInteracted
  document.getElementById('score-2a-val').textContent = state.explorerAInteracted ? "Completed" : "Not Interacted";
  document.getElementById('score-2a-val').className = `score-value ${state.explorerAInteracted ? 'text-cyan' : 'text-secondary'}`;
  
  document.getElementById('score-2b-val').textContent = state.explorerBInteracted ? "Completed" : "Not Interacted";
  document.getElementById('score-2b-val').className = `score-value ${state.explorerBInteracted ? 'text-magenta' : 'text-secondary'}`;
  
  const quizPct = (state.quizScore / 10) * 100;
  
  // Overall weighted performance indicator
  const interactedCount = (state.explorerAInteracted ? 1 : 0) + (state.explorerBInteracted ? 1 : 0);
  const totalScorePct = Math.round((interactedCount * 10) + (quizPct * 0.8)); // Weighted 80% MCQ, 20% exploration interaction
  
  document.getElementById('overall-percentage-txt').textContent = `${totalScorePct}%`;
  
  const title = document.getElementById('grade-tier-title');
  const desc = document.getElementById('grade-tier-desc');
  const guidance = document.getElementById('syllabus-guidance-box');
  const emoji = document.getElementById('score-emoji');
  
  if (totalScorePct >= 80) {
    emoji.textContent = "🏆";
    title.textContent = "Excellent Mastery!";
    desc.textContent = "You've fully achieved the static electricity learning outcomes.";
    guidance.innerHTML = `<strong>Syllabus Review:</strong> Superb work! You successfully identified the correct representations of electric fields and accurately computed the direction of force acting on test charges. You are fully ready for the O-Level examinations!`;
  } else if (totalScorePct >= 50) {
    emoji.textContent = "🌟";
    title.textContent = "Good Progress!";
    desc.textContent = "Review the basic rules of field lines to boost your score.";
    guidance.innerHTML = `<strong>Syllabus Review:</strong> You understand the general pattern shape, but had minor trouble with line direction rules or incorrect field line visual diagrams (crossing lines/non-perpendicular connections). Spend some time in the revision flashcard mode to lock in these rules.`;
  } else {
    emoji.textContent = "📖";
    title.textContent = "Let's Review Again!";
    desc.textContent = "Pay close attention to direction arrows and connection rules.";
    guidance.innerHTML = `<strong>Syllabus Review:</strong> We recommend re-reading the Concept Introduction tab. Pay particular attention to: 1. Field lines always point away from + and towards −. 2. Field lines never intersect. Click 'Restart Session' to give the challenge another try!`;
  }
}

// --- SECTION 5: FLASHCARD INTERACTIVITY ---
function setupFlashcards() {
  state.flashcardsList = [...FLASHCARDS].sort(() => 0.5 - Math.random());
  state.flashcardIndex = 0;
  renderFlashcard();
}

function renderFlashcard() {
  const card = state.flashcardsList[state.flashcardIndex];
  const container = document.getElementById('flashcard-interactive');
  
  // Reset card state (unflipped)
  container.classList.remove('flipped');
  
  setTimeout(() => {
    document.getElementById('card-front-text').textContent = card.front;
    document.getElementById('card-back-text').textContent = card.back;
    document.querySelector('.card-category').textContent = card.category;
    document.getElementById('flashcard-progress-txt').textContent = `Card ${state.flashcardIndex + 1}/${state.flashcardsList.length}`;
  }, 150); // Match half transition duration
}

function handleFlashcardFlip() {
  const container = document.getElementById('flashcard-interactive');
  container.classList.toggle('flipped');
}

// --- CELEBRATION CANVAS ANIMATIONS (CONFETTI/BURST) ---
let canvas, ctx, animationFrameId;
let particles = [];

function initCelebration() {
  canvas = document.getElementById('celebration-canvas');
  ctx = canvas.getContext('2d');
  resizeCelebrationCanvas();
  window.addEventListener('resize', resizeCelebrationCanvas);
}

function resizeCelebrationCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function triggerCelebrationBurst() {
  const colors = ['#00f2fe', '#f857a6', '#ffd700', '#39ff14'];
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  
  for (let i = 0; i < 60; i++) {
    particles.push({
      x: centerX,
      y: centerY,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 0.5) * 12 - 4,
      r: Math.random() * 4 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      decay: Math.random() * 0.02 + 0.015
    });
  }
  
  if (!animationFrameId) {
    animateParticles();
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.15; // Gravity
    p.alpha -= p.decay;
    
    if (p.alpha <= 0) {
      particles.splice(i, 1);
      continue;
    }
    
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  
  if (particles.length > 0) {
    animationFrameId = requestAnimationFrame(animateParticles);
  } else {
    animationFrameId = null;
  }
}

// --- SECTION TRANSITIONS ---
function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll('.content-section').forEach(sec => {
    sec.classList.remove('active');
  });
  
  // Show target
  const targetSec = document.getElementById(`section-${sectionId}`);
  if (targetSec) {
    targetSec.classList.add('active');
    state.activeSection = sectionId;
    
    // Sync Navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
      if (btn.getAttribute('data-section') === sectionId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Special trigger logic based on section entering
    if (sectionId === 'intro') {
      drawConceptAnimation(state.activeConcept);
    } else if (sectionId === 'explorer') {
      if (state.explorerPart === 'part-a') {
        renderExplorerA();
      } else {
        renderExplorerB();
      }
    } else if (sectionId === 'quiz') {
      if (!state.quizStarted) {
        setupQuiz();
      }
    } else if (sectionId === 'scoring') {
      calculateOverallStats();
    } else if (sectionId === 'flashcards') {
      setupFlashcards();
    }
  }
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  initCelebration();
  
  // Concept Introduction tab logic
  document.querySelectorAll('.concept-tab-btn').forEach(tab => {
    tab.addEventListener('click', (e) => {
      document.querySelectorAll('.concept-tab-btn').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      const conceptId = tab.getAttribute('data-concept');
      state.activeConcept = conceptId;
      
      // Update Explanations
      const title = document.getElementById('concept-title');
      const text = document.getElementById('concept-text');
      
      if (conceptId === 'c1') {
        title.textContent = "1. Force Region Definition";
        text.textContent = "An electric field is a region in which an electric charge experiences an electric force. In the interactive canvas above, you can see the force vector appearing on the test charge inside the force boundary.";
      } else if (conceptId === 'c2') {
        title.textContent = "2. Direction definition";
        text.textContent = "The direction of an electric field at any point is defined as the direction of the force acting on a positive test charge (q⁺) placed at that point.";
      } else if (conceptId === 'c3') {
        title.textContent = "3. Sign Convention Rules";
        text.textContent = "Electric field lines point away from positive charges (+) and point towards negative charges (−). Think of positive as a source and negative as a sink!";
      } else if (conceptId === 'c4') {
        title.textContent = "4. Lines Never Cross";
        text.textContent = "Electric field lines can never intersect. If they crossed, a positive charge would experience forces in two directions simultaneously at the intersection point, which is physically impossible.";
      } else if (conceptId === 'c5') {
        title.textContent = "5. Line Spacing vs Strength";
        text.textContent = "The density of electric field lines represents the field strength. Closer field lines indicate a stronger electric field, and wider spacing indicates a weaker field.";
      }
      
      drawConceptAnimation(conceptId);
    });
  });

  // Section Navigation Links
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.getAttribute('data-section');
      // Quiz routing check
      if (section === 'quiz' && !state.quizStarted) {
        setupQuiz();
      }
      showSection(section);
    });
  });

  // Proceed / Next section triggers
  document.querySelectorAll('.next-section-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target');
      showSection(target);
    });
  });

  // Exploration tabs switcher
  document.querySelectorAll('.sub-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sub-nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const part = btn.getAttribute('data-part');
      state.explorerPart = part;
      
      document.querySelectorAll('.explorer-part').forEach(p => p.classList.remove('active'));
      document.getElementById(`explorer-${part}`).classList.add('active');
      
      if (part === 'part-a') {
        renderExplorerA();
      } else {
        renderExplorerB();
      }
    });
  });

  // Explorer Control bindings: Part A
  document.getElementById('charge-a-sign-btn').addEventListener('click', () => {
    document.getElementById('charge-a-sign-btn').classList.add('active');
    document.getElementById('charge-a-sign-neg-btn').classList.remove('active');
    state.chargeASign = 1;
    renderExplorerA();
  });
  
  document.getElementById('charge-a-sign-neg-btn').addEventListener('click', () => {
    document.getElementById('charge-a-sign-btn').classList.remove('active');
    document.getElementById('charge-a-sign-neg-btn').classList.add('active');
    state.chargeASign = -1;
    renderExplorerA();
  });

  // Explorer Control bindings: Part B
  document.querySelectorAll('.q1-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.q1-toggle').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.chargesB[0].q = parseInt(btn.getAttribute('data-val'));
      state.explorerBInteracted = true;
      renderExplorerB();
    });
  });

  document.querySelectorAll('.q2-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.q2-toggle').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.chargesB[1].q = parseInt(btn.getAttribute('data-val'));
      state.explorerBInteracted = true;
      renderExplorerB();
    });
  });

  // Quiz Control buttons
  document.getElementById('start-quiz-btn').addEventListener('click', () => {
    state.quizStarted = true;
    startQuiz();
  });
  
  document.getElementById('next-q-btn').addEventListener('click', nextQuestion);
  
  // Section 4 control events
  document.getElementById('goto-quiz-btn').addEventListener('click', () => {
    setupQuiz();
    showSection('quiz');
  });
  
  document.getElementById('restart-app-btn').addEventListener('click', () => {
    state.explorerAInteracted = false;
    state.explorerBInteracted = false;
    state.quizStarted = false;
    setupQuiz();
    showSection('intro');
  });

  // Flashcards Controls
  document.getElementById('flashcard-interactive').addEventListener('click', handleFlashcardFlip);
  
  document.getElementById('fc-next-btn').addEventListener('click', () => {
    state.flashcardIndex = (state.flashcardIndex + 1) % state.flashcardsList.length;
    renderFlashcard();
  });
  
  document.getElementById('fc-prev-btn').addEventListener('click', () => {
    state.flashcardIndex = (state.flashcardIndex - 1 + state.flashcardsList.length) % state.flashcardsList.length;
    renderFlashcard();
  });
  
  document.getElementById('fc-shuffle-btn').addEventListener('click', () => {
    setupFlashcards();
  });

  // Initial draw
  drawConceptAnimation('c1');
});
