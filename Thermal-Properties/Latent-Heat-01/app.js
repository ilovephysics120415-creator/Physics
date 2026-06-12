// --- APP SECTIONS NAVIGATION ---
function switchSection(sectionId) {
  document.querySelectorAll('.app-section').forEach(section => {
    section.classList.remove('active');
  });
  const activeSection = document.getElementById(`section-${sectionId}`);
  if (activeSection) {
    activeSection.classList.add('active');
  }

  // Update nav item active states
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('onclick').includes(sectionId)) {
      item.classList.add('active');
    }
  });

  // Special triggers per section
  if (sectionId === 'curves') {
    triggerCurveDraw();
  } else if (sectionId === 'simulate') {
    switchSimTab('fusion');
  }
}

// --- SECTION 1: SIMULATION ENGINE ---
let currentSimTab = 'fusion';

const substances = {
  fusion: [
    { name: "Water (Ice ↔ Liquid)", value: 334000 },
    { name: "Ethanol", value: 109000 },
    { name: "Copper", value: 205000 },
    { name: "Iron", value: 270000 },
    { name: "Lead", value: 23000 }
  ],
  vapor: [
    { name: "Water (Liquid ↔ Gas)", value: 2260000 },
    { name: "Ethanol", value: 855000 },
    { name: "Copper", value: 4730000 },
    { name: "Iron", value: 6290000 },
    { name: "Lead", value: 859000 }
  ]
};

function switchSimTab(tab) {
  currentSimTab = tab;
  
  // Toggle tab buttons active states
  const btnFusion = document.getElementById('sim-btn-fusion');
  const btnVapor = document.getElementById('sim-btn-vapor');
  const selectSub = document.getElementById('sim-substance');
  
  if (tab === 'fusion') {
    btnFusion.classList.add('active');
    btnVapor.classList.remove('active');
    
    // Set substance select values
    selectSub.innerHTML = substances.fusion.map((sub, idx) => `
      <option value="${idx}">${sub.name} (L_f = ${sub.value.toLocaleString()} J/kg)</option>
    `).join('');
    
    // Set calculation panel text
    document.getElementById('sim-calc-title').innerText = "Calculate the energy needed to melt/solidify this mass of substance.";
  } else {
    btnFusion.classList.remove('active');
    btnVapor.classList.add('active');
    
    // Set substance select values
    selectSub.innerHTML = substances.vapor.map((sub, idx) => `
      <option value="${idx}">${sub.name} (L_v = ${sub.value.toLocaleString()} J/kg)</option>
    `).join('');
    
    // Set calculation panel text
    document.getElementById('sim-calc-title').innerText = "Calculate the energy needed to boil/condense this mass of substance.";
  }
  
  // Reset Answer box
  document.getElementById('sim-answer-box').style.display = 'none';
  document.getElementById('sim-show-answer-btn').innerText = "Show Answer";
  
  updateSimValues();
}

function toggleSimAnswer() {
  const answerBox = document.getElementById('sim-answer-box');
  const btn = document.getElementById('sim-show-answer-btn');
  if (answerBox.style.display === 'none') {
    answerBox.style.display = 'block';
    btn.innerText = "Hide Answer";
  } else {
    answerBox.style.display = 'none';
    btn.innerText = "Show Answer";
  }
}

function updateSimValues() {
  const massInput = document.getElementById('sim-mass');
  const massVal = parseFloat(massInput.value);
  document.getElementById('sim-mass-val').innerText = massVal.toFixed(1);
  
  const selectSub = document.getElementById('sim-substance');
  const selectedIdx = parseInt(selectSub.value) || 0;
  const sub = substances[currentSimTab][selectedIdx];
  
  const L = sub.value;
  const symbol = currentSimTab === 'fusion' ? 'L<sub>f</sub>' : 'L<sub>v</sub>';
  const Q = massVal * L;
  
  // Calculate dynamic steps
  document.getElementById('sim-calc-steps').innerHTML = `Q = m × ${symbol}<br>Q = ${massVal.toFixed(1)} kg × ${L.toLocaleString()} J/kg`;
  document.getElementById('sim-calc-result').innerHTML = `Q = ${Q.toLocaleString()} J <span style="font-size:0.9rem; color:var(--text-secondary); font-weight:normal;">(${(Q / 1000).toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})} kJ)</span>`;
  
  // Dynamic comparative callout note
  const nameClean = sub.name.split(" ")[0]; // e.g. "Water", "Ethanol"
  const otherTab = currentSimTab === 'fusion' ? 'vapor' : 'fusion';
  const otherSub = substances[otherTab].find(s => s.name.startsWith(nameClean));
  
  if (otherSub) {
    const otherL = otherSub.value;
    const otherQ = massVal * otherL;
    if (currentSimTab === 'fusion') {
      document.getElementById('sim-calc-note').innerHTML = `Note: To melt ${massVal.toFixed(1)} kg of ${nameClean} requires **${Q.toLocaleString()} J**.<br>To boil the exact same mass requires **${otherQ.toLocaleString()} J** (${(otherL / L).toFixed(1)}x more energy!).`;
    } else {
      document.getElementById('sim-calc-note').innerHTML = `Note: To boil ${massVal.toFixed(1)} kg of ${nameClean} requires **${Q.toLocaleString()} J**.<br>To melt the exact same mass requires **${otherQ.toLocaleString()} J** (only ${(otherL / L * 100).toFixed(1)}% of this energy).`;
    }
  } else {
    document.getElementById('sim-calc-note').innerHTML = `Note: To change the state of ${massVal.toFixed(1)} kg of ${nameClean} requires **${Q.toLocaleString()} J**.`;
  }

  // Draw Beaker SVG Animation
  drawBeakerSVG(massVal);
}

function drawBeakerSVG(mass) {
  const container = document.getElementById('beaker-animation-container');
  const isFusion = currentSimTab === 'fusion';
  
  // Liquid height scales dynamically from y=155 (empty) to y=75 (full)
  const maxH = 80;
  const liquidH = (mass / 5.0) * maxH;
  const liquidY = 155 - liquidH;
  
  // Color configuration
  const liquidColor = isFusion ? "rgba(0, 140, 255, 0.45)" : "rgba(255, 102, 0, 0.4)";
  
  let svg = `
    <svg viewBox="0 0 180 180" style="width:100%; height:100%;">
      <!-- Beaker ticks -->
      <line x1="120" y1="135" x2="128" y2="135" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" />
      <text x="133" y="138" fill="rgba(255,255,255,0.4)" font-size="8">2L</text>
      
      <line x1="120" y1="115" x2="128" y2="115" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" />
      
      <line x1="120" y1="95" x2="128" y2="95" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" />
      <text x="133" y="98" fill="rgba(255,255,255,0.4)" font-size="8">4L</text>
      
      <line x1="120" y1="75" x2="128" y2="75" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" />

      <!-- Beaker Glass Outer Outline -->
      <path d="M 50 45 L 50 155 Q 50 160 55 160 L 125 160 Q 130 160 130 155 L 130 45" fill="none" stroke="#ffffff" stroke-width="3" />
      <!-- Beaker Lip -->
      <path d="M 45 45 C 45 45, 50 43, 53 45" fill="none" stroke="#ffffff" stroke-width="3" />
      <path d="M 135 45 C 135 45, 130 43, 127 45" fill="none" stroke="#ffffff" stroke-width="3" />

      <!-- Liquid Body -->
      <rect x="52" y="${liquidY}" width="76" height="${liquidH}" fill="${liquidColor}" />
  `;

  // Draw details based on fusion/vaporisation
  if (isFusion) {
    // FUSION: Draw ice cubes floating
    // Number of cubes depends on mass
    const numCubes = Math.min(5, Math.ceil(mass));
    const cubePositions = [
      {x: 60, y: liquidY + 5, r: -15},
      {x: 85, y: liquidY + 8, r: 10},
      {x: 72, y: liquidY + liquidH - 22, r: 5},
      {x: 95, y: liquidY + liquidH - 18, r: -25},
      {x: 78, y: liquidY + 2, r: 35}
    ];

    for (let i = 0; i < numCubes; i++) {
      const pos = cubePositions[i];
      // Keep cubes inside liquid boundaries
      const boundedY = Math.max(liquidY - 5, pos.y);
      svg += `
        <rect x="${pos.x}" y="${boundedY}" width="16" height="16" rx="2" ry="2" 
              fill="rgba(220, 240, 255, 0.75)" stroke="#ffffff" stroke-width="1"
              transform="rotate(${pos.r}, ${pos.x + 8}, ${pos.y + 8})" />
      `;
    }
  } else {
    // VAPORISATION: Draw bubbles rising and steam coming out
    // More bubbles for larger mass
    const numBubbles = Math.ceil(mass * 4);
    for (let i = 0; i < numBubbles; i++) {
      const bx = 56 + (i * 15) % 68;
      const by = liquidY + 10 + (i * 22) % (liquidH - 20);
      const bDelay = (i * 0.4).toFixed(1);
      svg += `
        <circle cx="${bx}" cy="${by}" r="3" fill="#ffffff" opacity="0.6" class="beaker-bubble" style="animation-delay: ${bDelay}s" />
      `;
    }

    // Steam paths rising from mouth
    svg += `
      <!-- Steam -->
      <path d="M 65 35 Q 60 25 65 15 T 60 -5" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="3" stroke-linecap="round" class="beaker-steam" style="animation-delay: 0s" />
      <path d="M 90 35 Q 85 25 90 15 T 85 -5" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="3" stroke-linecap="round" class="beaker-steam" style="animation-delay: 1s" />
      <path d="M 115 35 Q 110 25 115 15 T 110 -5" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="3" stroke-linecap="round" class="beaker-steam" style="animation-delay: 2s" />
    `;
  }

  svg += `</svg>`;
  container.innerHTML = svg;
}

// --- PARTICLE / CONFETTI EFFECT SYSTEM ---
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 6 + 4;
    this.speedX = Math.random() * 6 - 3;
    this.speedY = Math.random() * -8 - 4;
    this.gravity = 0.3;
    this.color = `hsl(${Math.random() * 30 + 15}, 100%, 50%)`; // Hues around orange/yellow
    this.alpha = 1;
    this.decay = Math.random() * 0.015 + 0.01;
  }
  update() {
    this.x += this.speedX;
    this.speedY += this.gravity;
    this.y += this.speedY;
    this.alpha -= this.decay;
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function triggerCelebration() {
  const startX = window.innerWidth / 2;
  const startY = window.innerHeight * 0.8;
  for (let i = 0; i < 40; i++) {
    particles.push(new Particle(startX, startY));
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles = particles.filter(p => p.alpha > 0);
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  requestAnimationFrame(animateParticles);
}
animateParticles();


// --- SECTION 2: INTERACTIVE CURVES ---
let currentCurveType = 'heating';

const curveData = {
  heating: {
    title: "Heating Curve (Water)",
    description: "Thermal energy is supplied to ice at a constant rate.",
    segments: [
      {
        id: "solid-heating",
        name: "Solid Heating (Ice)",
        desc: "Ice is warming up. Temperature rises from -20°C to 0°C.",
        particles: "Average kinetic energy of water molecules increases as they vibrate faster about fixed positions.",
        energy: "Energy is transferred to the kinetic energy of the particles.",
        badge: "Average kinetic energy of molecules increasing",
        points: "30,230 90,190",
        labelPos: {x: 45, y: 220}
      },
      {
        id: "melting",
        name: "Melting Plateau (0°C)",
        desc: "Ice is melting into water. Temperature remains constant at 0°C.",
        particles: "Arrangement of molecules change from regular to irregular. Average distance between molecules increases.",
        energy: "Energy is transferred to the potential energy of the molecules to overcome forces of attraction between molecules. Average kinetic energy of the molecules is constant.",
        badge: "Potential energy increasing (State Change)",
        points: "90,190 200,190",
        labelPos: {x: 145, y: 180}
      },
      {
        id: "liquid-heating",
        name: "Liquid Heating (Water)",
        desc: "Liquid water is warming up. Temperature rises from 0°C to 100°C.",
        particles: "Molecules move faster, sliding past one another with increasing speed.",
        energy: "Energy is transferred to the kinetic energy of the particles.",
        badge: "Average kinetic energy of molecules increasing",
        points: "200,190 270,90",
        labelPos: {x: 235, y: 135}
      },
      {
        id: "boiling",
        name: "Boiling Plateau (100°C)",
        desc: "Water is boiling into steam. Temperature remains constant at 100°C. Note: Boiling plateau is longer than melting plateau because more energy is needed to completely break molecular forces and push particles far apart.",
        particles: "Molecules remain in irregular arrangement. Molecules move faster and much further apart.",
        energy: "Energy is transferred to the potential energy of the particles to overcome forces of attraction between molecules. Average kinetic energy of the molecules is constant.",
        badge: "Potential energy of molecules increasing (State Change)",
        points: "270,90 420,90",
        labelPos: {x: 345, y: 80}
      },
      {
        id: "gas-heating",
        name: "Gas Heating (Steam)",
        desc: "Steam is warming up. Temperature rises above 100°C.",
        particles: "Gas molecules move randomly and very rapidly, colliding with container walls.",
        energy: "Energy is transferred to the kinetic energy of the particles.",
        badge: "Average kinetic energy of molecules increasing",
        points: "420,90 470,50",
        labelPos: {x: 445, y: 65}
      }
    ]
  },
  cooling: {
    title: "Cooling Curve (Water)",
    description: "Thermal energy is removed from steam at a constant rate.",
    segments: [
      {
        id: "gas-cooling",
        name: "Gas Cooling (Steam)",
        desc: "Steam is cooling down towards 100°C.",
        particles: "Gas molecules lose speed and move less rapidly.",
        energy: "Energy is transferred out of the kinetic energy of the particles",
        badge: "Average kinetic energy of molecules decreasing",
        points: "30,50 90,90",
        labelPos: {x: 55, y: 65}
      },
      {
        id: "condensation",
        name: "Condensation Plateau (100°C)",
        desc: "Steam is condensing into water. Temperature remains constant at 100°C.",
        particles: "Molecules move closer together. Forces of attraction between molecules are set up but molecules remain in irregular arrangement.",
        energy: "Energy is transferred out of the potential energy of the molecules as forces of attraction between molecules are set up.",
        badge: "Potential energy of molecules decreasing (State Change)",
        points: "90,90 240,90",
        labelPos: {x: 165, y: 80}
      },
      {
        id: "liquid-cooling",
        name: "Liquid Cooling (Water)",
        desc: "Water is cooling down from 100°C to 0°C.",
        particles: "Molecules slide past each other at lower speeds.",
        energy: "Energy is transferred out of the kinetic energy of the particles.",
        badge: "Average kinetic energy of molecules decreasing",
        points: "240,90 310,190",
        labelPos: {x: 275, y: 135}
      },
      {
        id: "solidification",
        name: "Solidification Plateau (0°C)",
        desc: "Water is freezing/solidifying into ice. Temperature remains constant at 0°C.",
        particles: "Molecules move closer together. Forces of attraction between molecules are set up that hold the molecules in place in regular arrangement.",
        energy: "Energy is transferred out of the potential energy of the molecules. Average kinetic energy of the molecules is constant.",
        badge: "Potential energy of molecules decreasing (State Change)",
        points: "310,190 420,190",
        labelPos: {x: 365, y: 180}
      },
      {
        id: "solid-cooling",
        name: "Solid Cooling (Ice)",
        desc: "Ice is cooling down below 0°C.",
        particles: "Molecules vibrate slower about their fixed positions.",
        energy: "Energy is transferred out of the kinetic energy of the particles.",
        badge: "Average kinetic energy decreasing",
        points: "420,190 470,230",
        labelPos: {x: 445, y: 220}
      }
    ]
  }
};

function switchCurveTab(tab) {
  currentCurveType = tab;
  document.querySelectorAll('#section-curves .tab-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.innerText.toLowerCase() === tab) btn.classList.add('active');
  });
  triggerCurveDraw();
  
  // Reset info panel
  document.getElementById('info-title').innerText = "Tap a region on the curve";
  document.getElementById('info-desc').innerText = "Select any segment of the graph to analyze energy changes and particle behavior.";
  document.getElementById('info-badge-container').innerHTML = "";
}

function triggerCurveDraw() {
  const placeholder = document.getElementById('svg-placeholder');
  const curve = curveData[currentCurveType];
  
  // Base coordinates path for the full curve
  let dPath = "";
  curve.segments.forEach((seg, index) => {
    const coords = seg.points.split(" ");
    if (index === 0) {
      dPath += `M ${coords[0].replace(',', ' ')} L ${coords[1].replace(',', ' ')}`;
    } else {
      dPath += ` L ${coords[1].replace(',', ' ')}`;
    }
  });

  let html = `
    <svg viewBox="0 0 500 280" class="curve-svg">
      <!-- Grid Lines -->
      <line x1="30" y1="50" x2="470" y2="50" stroke="rgba(255,255,255,0.05)" stroke-width="1" />
      <line x1="30" y1="90" x2="470" y2="90" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" stroke-dasharray="3" />
      <line x1="30" y1="190" x2="470" y2="190" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" stroke-dasharray="3" />
      <line x1="30" y1="230" x2="470" y2="230" stroke="rgba(255,255,255,0.05)" stroke-width="1" />

      <!-- Axes -->
      <line x1="30" y1="20" x2="30" y2="250" stroke="#a0a5b5" stroke-width="2" />
      <line x1="20" y1="240" x2="480" y2="240" stroke="#a0a5b5" stroke-width="2" />

      <!-- Axes Arrows -->
      <polygon points="30,15 26,23 34,23" fill="#a0a5b5" />
      <polygon points="485,240 477,236 477,244" fill="#a0a5b5" />

      <!-- Axes Labels -->
      <text x="15" y="45" class="axis-label" transform="rotate(-90, 15, 45)">Temperature (°C)</text>
      <text x="420" y="265" class="axis-label">Time (s)</text>

      <!-- Key Temperature Marks -->
      <text x="8" y="94" class="temp-mark">100°C</text>
      <text x="15" y="194" class="temp-mark">0°C</text>
  `;

  // Draw static helper curve line (dark backdrop)
  html += `<path d="${dPath}" class="svg-curve-path" />`;

  // Draw animated curve line
  html += `<path id="animated-path" d="${dPath}" class="svg-curve-path-animated" />`;

  // Interactive hotspots overlay
  curve.segments.forEach(seg => {
    const coords = seg.points.split(" ");
    const start = coords[0].split(",");
    const end = coords[1].split(",");
    
    // We draw thick overlay lines for easy tapping
    html += `
      <line x1="${start[0]}" y1="${start[1]}" x2="${end[0]}" y2="${end[1]}" 
            class="curve-segment-hotspot" stroke-width="25" stroke-linecap="round"
            onclick="selectCurveSegment('${seg.id}')" />
    `;
  });

  // Small labels on regions
  curve.segments.forEach(seg => {
    let nameLabel = "";
    if (seg.id.includes("solid-heating") || seg.id.includes("solid-cooling")) nameLabel = "Solid";
    else if (seg.id.includes("liquid-heating") || seg.id.includes("liquid-cooling")) nameLabel = "Liquid";
    else if (seg.id.includes("gas-heating") || seg.id.includes("gas-cooling")) nameLabel = "Gas";
    else if (seg.id.includes("melting")) nameLabel = "Melting";
    else if (seg.id.includes("solidification")) nameLabel = "Freezing";
    else if (seg.id.includes("boiling")) nameLabel = "Boiling";
    else if (seg.id.includes("condensation")) nameLabel = "Condensing";

    html += `
      <text x="${seg.labelPos.x}" y="${seg.labelPos.y}" text-anchor="middle" class="region-label" id="lbl-${seg.id}">${nameLabel}</text>
    `;
  });

  html += `</svg>`;
  placeholder.innerHTML = html;

  // Trigger drawing animation
  const container = document.getElementById('curve-viewer');
  container.classList.remove('animate-draw');
  void container.offsetWidth; // Force reflow
  container.classList.add('animate-draw');
}

function selectCurveSegment(segmentId) {
  const curve = curveData[currentCurveType];
  const segment = curve.segments.find(s => s.id === segmentId);
  if (!segment) return;

  // Highlight label
  document.querySelectorAll('.region-label').forEach(lbl => lbl.classList.remove('active'));
  const activeLbl = document.getElementById(`lbl-${segmentId}`);
  if (activeLbl) activeLbl.classList.add('active');

  // Highlight hotspot visual
  document.querySelectorAll('.curve-segment-hotspot').forEach(hot => hot.classList.remove('active'));
  // Render details in panel
  document.getElementById('info-title').innerText = segment.name;
  document.getElementById('info-desc').innerHTML = `
    <strong>Process</strong>: ${segment.desc}<br><br>
    <strong>Particles</strong>: ${segment.particles}<br><br>
    <strong>Energy Transfer</strong>: ${segment.energy}
  `;
  document.getElementById('info-badge-container').innerHTML = `
    <span class="energy-store-badge">${segment.badge}</span>
  `;
}


// --- SECTION 3: REVISION FLASHCARDS ---
const flashcards = [
  {
    front: "What is Latent Heat?",
    back: "The thermal energy absorbed or released during a change of state at a constant temperature."
  },
  {
    front: "Define Specific Latent Heat (L)",
    back: "The thermal energy required to change the state of 1 kg of a substance without any change in temperature. Formula: Q = mL."
  },
  {
    front: "What are the standard SI units of Specific Latent Heat (L)?",
    back: "Joules per kilogram (J/kg)."
  },
  {
    front: "Why does the temperature stay constant during a change of state?",
    back: "The thermal energy input is used to overcome intermolecular forces of attraction (increasing potential energy), rather than increasing the speed/vibration of the particles (kinetic energy)."
  },
  {
    front: "What is the difference between specific latent heat of Fusion and Vaporisation?",
    back: "Fusion (Lf) refers to solid↔liquid state changes (melting/freezing). Vaporisation (Lv) refers to liquid↔gas state changes (boiling/condensing)."
  },
  {
    front: "What does melting point represent on a heating curve?",
    back: "The constant temperature (0°C for water) at which the solid state changes into the liquid state."
  },
  {
    front: "What does boiling point represent on a heating curve?",
    back: "The constant temperature (100°C for water) at which the liquid state changes into the gaseous state."
  },
  {
    front: "Why is the boiling plateau typically longer than the melting plateau on a curve?",
    back: "More energy is required to completely break intermolecular forces (turning liquid to gas) than to just weaken/disrupt them (turning solid to liquid)."
  },
  {
    front: "What energy changes during sloped regions vs. plateaus?",
    back: "Sloped regions: Energy changes the average kinetic energy of particles (temperature changes). Plateaus: Energy changes the potential energy of particles (state changes)."
  }
];

let activeCardIndex = 0;
let flashcardList = [...flashcards];

function updateCardUI() {
  const wrapper = document.getElementById('flashcard-wrapper');
  wrapper.classList.remove('flipped');
  document.getElementById('card-index-indicator').innerText = `Card ${activeCardIndex + 1} of ${flashcardList.length}`;
  document.getElementById('card-front-text').innerText = flashcardList[activeCardIndex].front;
  document.getElementById('card-back-text').innerText = flashcardList[activeCardIndex].back;
}

function flipCard() {
  document.getElementById('flashcard-wrapper').classList.toggle('flipped');
}

function handleCardNavigation(action) {
  const wrapper = document.getElementById('flashcard-wrapper');
  const isFlipped = wrapper.classList.contains('flipped');
  
  const performNavigation = () => {
    if (action === 'next') {
      activeCardIndex = (activeCardIndex + 1) % flashcardList.length;
    } else if (action === 'prev') {
      activeCardIndex = (activeCardIndex - 1 + flashcardList.length) % flashcardList.length;
    } else if (action === 'shuffle') {
      for (let i = flashcardList.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [flashcardList[i], flashcardList[j]] = [flashcardList[j], flashcardList[i]];
      }
      activeCardIndex = 0;
    }
    
    // Update contents on front & back
    document.getElementById('card-index-indicator').innerText = `Card ${activeCardIndex + 1} of ${flashcardList.length}`;
    document.getElementById('card-front-text').innerText = flashcardList[activeCardIndex].front;
    document.getElementById('card-back-text').innerText = flashcardList[activeCardIndex].back;
  };

  if (isFlipped) {
    wrapper.classList.remove('flipped');
    // Wait for the flip animation to reach the edge (90 degrees, approx 300ms) before changing the text
    setTimeout(performNavigation, 300);
  } else {
    performNavigation();
  }
}

function nextCard() {
  handleCardNavigation('next');
}

function prevCard() {
  handleCardNavigation('prev');
}

function shuffleCards() {
  handleCardNavigation('shuffle');
}


// --- SECTION 4 & 5: RANDOMIZED QUIZ ENGINE ---
// Static pools of questions
const conceptualQuestions = [
  {
    type: "mcq",
    question: "During melting, why does the temperature of the substance remain constant despite continuous heating?",
    options: [
      "The heating source automatically regulates its temperature.",
      "The input thermal energy is used entirely to overcome forces of attraction between particles.",
      "The average kinetic energy of the particles is increasing rapidly.",
      "Conduction is blocked by the presence of both solid and liquid states."
    ],
    answer: 1,
    explanation: "During melting, temperature is constant because the thermal energy input is transferred to the potential energy to break or weaken intermolecular bonds, not the kinetic energy."
  },
  {
    type: "mcq",
    question: "Which statement best describes the changes in energy during a plateau on a cooling curve?",
    options: [
      "Kinetic energy is decreasing, potential energy is constant.",
      "Kinetic energy is constant, potential energy is decreasing.",
      "Both kinetic and potential energy are decreasing.",
      "Kinetic energy is constant, potential energy is increasing."
    ],
    answer: 1,
    explanation: "At a plateau, temperature is constant (kinetic energy is constant) and the state changes from liquid to solid or gas to liquid, meaning molecular bonds form and potential energy decreases."
  },
  {
    type: "mcq",
    question: "Why is the boiling plateau of water on a heating curve significantly longer than the melting plateau?",
    options: [
      "Water has a higher boiling point than melting point.",
      "The heating source cools down during boiling.",
      "Much more energy is required to completely break intermolecular bonds and separate gas particles compared to weakening them during melting.",
      "Steam has a higher density than liquid water."
    ],
    answer: 2,
    explanation: "Complete separation of molecules from liquid to gas requires breaking all bonds and doing work against atmospheric pressure, requiring much more energy (L_v = 2,260,000 J/kg vs L_f = 334,000 J/kg)."
  },
  {
    type: "mcq",
    question: "What state(s) of matter coexist during the condensation plateau of water?",
    options: [
      "Solid and Liquid",
      "Liquid and Gas",
      "Solid only",
      "Gas only"
    ],
    answer: 1,
    explanation: "During condensation, steam (gas) is turning into water (liquid). Both states coexist until all steam is fully condensed."
  },
  {
    type: "mcq",
    question: "A heating curve has sloped regions. What is happening to the particles in these regions?",
    options: [
      "Their potential energy is increasing, moving further apart.",
      "Their kinetic energy is increasing, vibrating or moving faster.",
      "Bonds are being broken completely.",
      "The particles are shrinking in physical size."
    ],
    answer: 1,
    explanation: "In sloped regions, temperature is rising. This means average kinetic energy of the particles is increasing."
  }
];

// Calculation questions generator
function generateCalculationQuestion() {
  const isFusion = Math.random() < 0.5;
  const hideVariable = ["Q", "m", "L"][Math.floor(Math.random() * 3)];
  
  // Realistic values
  const m = parseFloat((Math.random() * 4.9 + 0.1).toFixed(1)); // 0.1 - 5.0 kg
  const L = isFusion ? 334000 : 2260000;
  const Q = m * L;
  
  const processStr = isFusion ? "melt" : "vaporise";
  const stateStr = isFusion ? "fusion" : "vaporisation";
  
  let questionText = "";
  let answerVal = 0;
  let steps = "";
  
  let unit = "";
  if (hideVariable === "Q") {
    questionText = `Calculate the thermal energy required to completely ${processStr} ${m} kg of ice/water at constant temperature. (Specific latent heat of ${stateStr} = ${L.toLocaleString()} J/kg)`;
    answerVal = Q;
    steps = `Formula: Q = m × L\nGiven: m = ${m} kg, L = ${L.toLocaleString()} J/kg\nCalculation: Q = ${m} × ${L} = ${Q.toLocaleString()} J`;
    unit = "J";
  } else if (hideVariable === "m") {
    questionText = `A sample of water absorbs ${Q.toLocaleString()} J of thermal energy during ${stateStr} at constant temperature. What is the mass of the water? (Specific latent heat of ${stateStr} = ${L.toLocaleString()} J/kg)`;
    answerVal = m;
    steps = `Formula: Q = m × L  =>  m = Q / L\nGiven: Q = ${Q.toLocaleString()} J, L = ${L.toLocaleString()} J/kg\nCalculation: m = ${Q} / ${L} = ${m} kg`;
    unit = "kg";
  } else {
    // Hide L
    questionText = `If ${Q.toLocaleString()} J of thermal energy is required to completely ${processStr} ${m} kg of a substance at its constant transition temperature, calculate the specific latent heat of ${stateStr} of the substance.`;
    answerVal = L;
    steps = `Formula: Q = m × L  =>  L = Q / m\nGiven: Q = ${Q.toLocaleString()} J, m = ${m} kg\nCalculation: L = ${Q} / ${m} = ${L.toLocaleString()} J/kg`;
    unit = "J/kg";
  }

  return {
    type: "calc",
    question: questionText,
    correctAnswer: answerVal,
    unit: unit,
    working: steps
  };
}

// Diagram read-off questions
const diagramQuestions = [
  {
    type: "diagram",
    curve: "heating",
    unlabelledRegion: "melting",
    question: "Look at the heating curve. What temperature is the melting point of the substance?",
    options: ["-20°C", "0°C", "100°C", "120°C"],
    answer: 1,
    explanation: "The melting plateau occurs at the first constant temperature flat line, which is at 0°C."
  },
  {
    type: "diagram",
    curve: "heating",
    unlabelledRegion: "boiling",
    question: "Look at the heating curve. What state(s) exist in the plateau region marked 'B' at 100°C?",
    options: ["Solid only", "Solid & Liquid", "Liquid only", "Liquid & Gas"],
    answer: 3,
    explanation: "At 100°C, the substance is boiling, so both liquid and gas (steam) coexist."
  },
  {
    type: "diagram",
    curve: "cooling",
    unlabelledRegion: "condensation",
    question: "Look at the cooling curve. What process is occurring during the plateau at 100°C?",
    options: ["Solidification", "Condensation", "Boiling", "Melting"],
    answer: 1,
    explanation: "On a cooling curve, the plateau at 100°C represents gas turning to liquid, which is Condensation."
  },
  {
    type: "diagram",
    curve: "cooling",
    unlabelledRegion: "solidification",
    question: "Look at the cooling curve. What temperature is the solidification (freezing) point of the substance?",
    options: ["100°C", "50°C", "0°C", "-10°C"],
    answer: 2,
    explanation: "The solidification plateau occurs at 0°C where water transitions to ice."
  }
];

// Let's generate a full pool of 30 questions
let activeQuizQuestions = [];
let currentQuestionIndex = 0;
let quizScore = 0;
let wrongAnswersHistory = [];

function generateQuizPool() {
  const pool = [];
  
  // Add 10 conceptual MCQs
  conceptualQuestions.forEach(q => pool.push(q));
  
  // Add diagram questions
  diagramQuestions.forEach(q => pool.push(q));
  
  // Fill the rest with randomized calculation questions to reach at least 30
  while (pool.length < 30) {
    pool.push(generateCalculationQuestion());
  }
  
  return pool;
}

function startQuiz() {
  document.getElementById('quiz-intro').style.display = 'none';
  document.getElementById('quiz-results').style.display = 'none';
  document.getElementById('quiz-play').style.display = 'block';
  
  const fullPool = generateQuizPool();
  // Shuffle and pick 10
  for (let i = fullPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [fullPool[i], fullPool[j]] = [fullPool[j], fullPool[i]];
  }
  
  activeQuizQuestions = fullPool.slice(0, 10);
  currentQuestionIndex = 0;
  quizScore = 0;
  wrongAnswersHistory = [];
  
  showQuestion();
}

function showQuestion() {
  const q = activeQuizQuestions[currentQuestionIndex];
  
  // Reset UI elements
  document.getElementById('quiz-feedback-box').style.display = 'none';
  document.getElementById('quiz-numeric-input').value = '';
  document.getElementById('quiz-mcq-options').innerHTML = '';
  document.getElementById('quiz-calc-box').style.display = 'none';
  
  // Update progress
  document.getElementById('quiz-q-num').innerText = `Question ${currentQuestionIndex + 1}/10`;
  document.getElementById('quiz-progress-bar').style.width = `${((currentQuestionIndex) / 10) * 100}%`;
  
  document.getElementById('quiz-question-text').innerText = q.question;
  
  // Show Diagram if applicable
  const diagramContainer = document.getElementById('quiz-diagram-container');
  if (q.type === 'diagram') {
    diagramContainer.style.display = 'flex';
    diagramContainer.innerHTML = drawStaticQuizDiagram(q.curve, q.unlabelledRegion);
  } else {
    diagramContainer.style.display = 'none';
  }
  
  // Render input fields depending on type
  if (q.type === 'mcq' || q.type === 'diagram') {
    document.getElementById('quiz-mcq-options').style.display = 'flex';
    q.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.innerText = opt;
      btn.onclick = () => submitMCQAnswer(idx);
      document.getElementById('quiz-mcq-options').appendChild(btn);
    });
  } else if (q.type === 'calc') {
    document.getElementById('quiz-mcq-options').style.display = 'none';
    document.getElementById('quiz-calc-box').style.display = 'flex';
  }
}

// Draw static vector diagram for quiz questions
function drawStaticQuizDiagram(type, highlightRegion) {
  const isHeating = type === 'heating';
  const path = isHeating ? "M 30,220 L 90,180 L 200,180 L 270,80 L 420,80 L 470,40" : "M 30,40 L 90,80 L 240,80 L 310,180 L 420,180 L 470,220";
  
  let labelA = "?";
  let labelB = "?";
  if (isHeating) {
    labelA = highlightRegion === 'melting' ? "Region A (?)" : "0°C (Melting)";
    labelB = highlightRegion === 'boiling' ? "Region B (?)" : "100°C (Boiling)";
  } else {
    labelA = highlightRegion === 'condensation' ? "Region A (?)" : "100°C (Condensation)";
    labelB = highlightRegion === 'solidification' ? "Region B (?)" : "0°C (Solidification)";
  }

  return `
    <svg viewBox="0 0 500 240" style="background:#111218; border-radius:8px;">
      <!-- Grid -->
      <line x1="30" y1="80" x2="470" y2="80" stroke="rgba(255,255,255,0.08)" stroke-width="1.5" stroke-dasharray="3" />
      <line x1="30" y1="180" x2="470" y2="180" stroke="rgba(255,255,255,0.08)" stroke-width="1.5" stroke-dasharray="3" />
      
      <!-- Axes -->
      <line x1="30" y1="15" x2="30" y2="220" stroke="#a0a5b5" stroke-width="1.5" />
      <line x1="20" y1="210" x2="480" y2="210" stroke="#a0a5b5" stroke-width="1.5" />
      
      <!-- Curve line -->
      <path d="${path}" fill="none" stroke="#ff6600" stroke-width="3" />
      
      <!-- Horizontal markers -->
      <text x="145" y="${isHeating ? 172 : 72}" fill="#ffffff" font-size="10" text-anchor="middle" font-weight="600">${labelA}</text>
      <text x="345" y="${isHeating ? 72 : 172}" fill="#ffffff" font-size="10" text-anchor="middle" font-weight="600">${labelB}</text>

      <text x="8" y="84" fill="#a0a5b5" font-size="9">100°C</text>
      <text x="15" y="184" fill="#a0a5b5" font-size="9">0°C</text>
      <text x="430" y="225" fill="#a0a5b5" font-size="9">Time &rarr;</text>
      <text x="35" y="25" fill="#a0a5b5" font-size="9">Temp &rarr;</text>
    </svg>
  `;
}

function submitMCQAnswer(selectedIdx) {
  const q = activeQuizQuestions[currentQuestionIndex];
  const options = document.querySelectorAll('.option-btn');
  
  // Disable options click
  options.forEach(btn => btn.disabled = true);
  
  const isCorrect = selectedIdx === q.answer;
  
  if (isCorrect) {
    options[selectedIdx].classList.add('correct');
    showFeedback(true, q.explanation);
    quizScore++;
    triggerCelebration();
  } else {
    options[selectedIdx].classList.add('wrong');
    options[q.answer].classList.add('correct');
    showFeedback(false, q.explanation);
    wrongAnswersHistory.push({
      question: q.question,
      userAnswer: q.options[selectedIdx],
      correctAnswer: q.options[q.answer],
      working: q.explanation
    });
  }
}

function submitNumericAnswer() {
  const q = activeQuizQuestions[currentQuestionIndex];
  const inputEl = document.getElementById('quiz-numeric-input');
  const rawInput = inputEl.value.trim().toLowerCase();
  
  if (rawInput === "") {
    alert("Please enter your answer.");
    return;
  }
  
  // Clean commas and parse: matches digits with optional decimals followed by optional spaces and unit (J, kg, J/kg)
  const cleanedInput = rawInput.replace(/,/g, '');
  const match = cleanedInput.match(/^([+-]?\d*(?:\.\d+)?)\s*(j|kg|j\/kg)?$/i);
  
  if (!match || match[1] === "") {
    alert("Please enter a valid number followed by the unit (e.g. 1.5 kg, 334000 J).");
    return;
  }
  
  const userNum = parseFloat(match[1]);
  const userUnit = (match[2] || "").trim();
  const expectedUnit = q.unit.toLowerCase();
  
  // Accept within +/- 2%
  const target = q.correctAnswer;
  const tolerance = target * 0.02;
  const isValueCorrect = Math.abs(userNum - target) <= tolerance;
  const isUnitCorrect = userUnit === expectedUnit;
  
  const isCorrect = isValueCorrect && isUnitCorrect;
  
  inputEl.disabled = true;
  document.querySelector('#quiz-calc-box button').disabled = true;
  
  const displayTarget = target.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 4}) + " " + q.unit;
  
  if (isCorrect) {
    showFeedback(true, `Perfect! The exact value is ${displayTarget}.`);
    document.getElementById('feedback-steps').innerText = q.working;
    quizScore++;
    triggerCelebration();
  } else {
    let feedbackDesc = "";
    if (isValueCorrect && !isUnitCorrect) {
      feedbackDesc = `Value is correct, but the unit is wrong or missing. Expected unit is "${q.unit}".`;
    } else {
      feedbackDesc = `Incorrect. The correct answer is ${displayTarget}.`;
    }
    showFeedback(false, feedbackDesc);
    document.getElementById('feedback-steps').innerText = q.working;
    wrongAnswersHistory.push({
      question: q.question,
      userAnswer: inputEl.value.trim(),
      correctAnswer: displayTarget,
      working: q.working
    });
  }
}

function showFeedback(isCorrect, desc) {
  const fb = document.getElementById('quiz-feedback-box');
  fb.className = `feedback-box ${isCorrect ? 'correct' : 'wrong'}`;
  document.getElementById('feedback-title').innerText = isCorrect ? 'Correct!' : 'Incorrect';
  document.getElementById('feedback-desc').innerText = desc;
  document.getElementById('feedback-steps').innerText = ''; // Clear by default, populated manually if calc
  fb.style.display = 'block';
}

function nextQuizQuestion() {
  // Re-enable calculation elements
  document.getElementById('quiz-numeric-input').disabled = false;
  document.querySelector('#quiz-calc-box button').disabled = false;
  
  currentQuestionIndex++;
  if (currentQuestionIndex < 10) {
    showQuestion();
  } else {
    showResults();
  }
}

function showResults() {
  document.getElementById('quiz-play').style.display = 'none';
  document.getElementById('quiz-results').style.display = 'block';
  
  const scoreEl = document.getElementById('results-score');
  const gradeEl = document.getElementById('results-grade');
  const msgEl = document.getElementById('results-message');
  
  scoreEl.innerText = `${quizScore}/10`;
  document.getElementById('quiz-progress-bar').style.width = `100%`;
  
  // Three-tier grade messages
  if (quizScore >= 9) {
    gradeEl.innerText = "Distinction (A1/A2)";
    gradeEl.style.color = "var(--success)";
    msgEl.innerText = "Excellent understanding! You have mastered Latent Heat and phase change curves.";
  } else if (quizScore >= 6) {
    gradeEl.innerText = "Pass (B3/C6)";
    gradeEl.style.color = "var(--accent)";
    msgEl.innerText = "Good job! You understand the key concepts well, but keep reviewing the calculations.";
  } else {
    gradeEl.innerText = "Needs Improvement";
    gradeEl.style.color = "var(--error)";
    msgEl.innerText = "Review the concepts and revision cards, then try again to boost your score.";
  }
  
  // Wrong answers summary
  const wrongSection = document.getElementById('wrong-answers-section');
  const container = document.getElementById('wrong-answers-container');
  container.innerHTML = '';
  
  if (wrongAnswersHistory.length > 0) {
    wrongSection.style.display = 'block';
    wrongAnswersHistory.forEach(item => {
      const card = document.createElement('div');
      card.className = 'wrong-answer-item';
      card.innerHTML = `
        <div class="wrong-answer-q">${item.question}</div>
        <div class="wrong-answer-detail">Your answer: ${item.userAnswer}</div>
        <div class="wrong-answer-correct">Correct answer: ${item.correctAnswer}</div>
        <div class="working-steps" style="display:block; margin-top:8px;">${item.working}</div>
      `;
      container.appendChild(card);
    });
  } else {
    wrongSection.style.display = 'none';
  }
}

function restartQuiz() {
  startQuiz();
}


// --- INITIALIZATION ---
window.onload = () => {
  // Setup first state
  switchSection('concepts');
  updateCardUI();
  updateSimValues();
};
