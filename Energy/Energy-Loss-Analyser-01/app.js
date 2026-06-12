// Singapore O-Level Physics: Sankey Diagrams & Efficiency Analyser
// Syllabus 6091 Strict Terminology Enforcement

const DEVICES = {
  lightbulb: {
    name: "Light Bulb",
    inputLabel: "energy in chemical potential store (via electricity transfer)",
    outputLabel: "energy transferred by wave propagation (light)",
    remainderLabel: "energy transferred to internal store",
    summaryFormat: "For every {in} J entering the light bulb, {out} J transfers by wave propagation (light) and {rem} J transfers to the internal store.",
    inputVal: 100,
    outputVal: 30,
    animate: "bulb"
  },
  motor: {
    name: "Electric Motor",
    inputLabel: "energy transferred electrically",
    outputLabel: "energy in kinetic store",
    remainderLabel: "energy transferred to internal store",
    summaryFormat: "For every {in} J entering the motor, {out} J transfers to the kinetic store and {rem} J transfers to the internal store.",
    inputVal: 100,
    outputVal: 70,
    animate: "motor"
  },
  kettle: {
    name: "Kettle",
    inputLabel: "energy transferred electrically",
    outputLabel: "energy in internal store (of water)",
    remainderLabel: "energy transferred to internal store (of surroundings)",
    summaryFormat: "For every {in} J entering the kettle, {out} J transfers to the internal store of the water and {rem} J transfers to the internal store of the surroundings.",
    inputVal: 2000,
    outputVal: 1600,
    animate: "kettle"
  },
  car: {
    name: "Car Engine",
    inputLabel: "energy in chemical potential store (petrol)",
    outputLabel: "energy in kinetic store",
    remainderLabel: "energy transferred to internal store",
    summaryFormat: "For every {in} J entering the car engine, {out} J transfers to the kinetic store and {rem} J transfers to the internal store.",
    inputVal: 1000,
    outputVal: 250,
    animate: "car"
  },
  solar: {
    name: "Solar Panel",
    inputLabel: "energy transferred by wave propagation (sunlight)",
    outputLabel: "energy transferred electrically",
    remainderLabel: "energy transferred to internal store",
    summaryFormat: "For every {in} J entering the solar panel, {out} J transfers electrically and {rem} J transfers to the internal store.",
    inputVal: 500,
    outputVal: 95,
    animate: "solar"
  },
  hydro: {
    name: "Hydroelectric Generator",
    inputLabel: "energy in gravitational potential store (water)",
    outputLabel: "energy transferred electrically",
    remainderLabel: "energy transferred to internal store",
    summaryFormat: "For every {in} J entering the generator, {out} J transfers electrically and {rem} J transfers to the internal store.",
    inputVal: 4000,
    outputVal: 3600,
    animate: "hydro"
  }
};

// FLASHCARDS DATA (20 Cards)
const FLASHCARDS = [
  {
    front: "A light bulb takes in 100 J and transfers 20 J by wave propagation (light). What is its efficiency?",
    back: "Efficiency = (useful energy output ÷ total energy input) × 100%\nEfficiency = (20 J ÷ 100 J) × 100% = 20%"
  },
  {
    front: "In a Sankey diagram, which arrow points downward?",
    back: "The arrow pointing downward represents the energy transferred to the internal store."
  },
  {
    front: "A motor is 75% efficient and receives 400 J. How much energy transfers to the kinetic store?",
    back: "Useful output = Efficiency × Total input\nUseful output = 0.75 × 400 J = 300 J"
  },
  {
    front: "A car engine transfers 800 J to the kinetic store from 2000 J input. What transfers to the internal store?",
    back: "Total Input = Useful Output + Transferred to Internal Store\nTransferred to internal store = 2000 J − 800 J = 1200 J"
  },
  {
    front: "Why is no device 100% efficient?",
    back: "Some energy is always transferred to the internal store due to friction, air resistance, or electrical resistance."
  },
  {
    front: "What does the width of each arrow in a Sankey diagram represent?",
    back: "The width of the arrow represents the quantity of energy (in Joules) transferred."
  },
  {
    front: "Define efficiency in terms of O-Level Physics stores.",
    back: "Efficiency = (Useful energy output ÷ Total energy input) × 100%\nIt is the percentage of input energy that is usefully transferred."
  },
  {
    front: "A kettle receives 3000 J of electrical energy. 2700 J is transferred to the internal store of the water. Calculate its efficiency.",
    back: "Efficiency = (2700 ÷ 3000) × 100% = 90%"
  },
  {
    front: "If a solar panel takes in 5000 J of energy from sunlight and has an efficiency of 18%, how much energy is transferred electrically?",
    back: "Useful energy output = 0.18 × 5000 J = 900 J"
  },
  {
    front: "An electric motor takes in 1200 J of energy. If 900 J is transferred to the internal store, what is the motor's efficiency?",
    back: "Useful output (kinetic store) = 1200 J − 900 J = 300 J\nEfficiency = (300 ÷ 1200) × 100% = 25%"
  },
  {
    front: "What is the useful energy output form of a hydroelectric generator?",
    back: "Energy transferred electrically."
  },
  {
    front: "For a kettle, what is the correct label for the useful energy output store?",
    back: "Energy in the internal store (of water)."
  },
  {
    front: "A device has a power input of 100 W. If it operates for 5 s, what is the total input energy?",
    back: "Energy = Power × Time\nEnergy = 100 W × 5 s = 500 J"
  },
  {
    front: "In the formula card, what are the units used for Energy Input and Energy Output?",
    back: "Joules (J)."
  },
  {
    front: "True or False: The useful energy output arrow in a Sankey diagram can be drawn pointing down.",
    back: "False. The useful energy output arrow must continue to the right, while the energy transferred to the internal store exits downward."
  },
  {
    front: "A motor has an efficiency of 80% and outputs 400 J of energy to the kinetic store. What was the total energy input?",
    back: "Total Input = Useful Output ÷ Efficiency\nTotal Input = 400 J ÷ 0.80 = 500 J"
  },
  {
    front: "Name the input energy store for a car engine.",
    back: "Energy in the chemical potential store (of the petrol)."
  },
  {
    front: "What is the input energy store of a hydroelectric generator before water falls?",
    back: "Energy in the gravitational potential store (of water)."
  },
  {
    front: "Explain what happens to the width of the main input arrow after a branch splits off.",
    back: "The width of the main input arrow equals the sum of the widths of all branching arrows (Total Input = Total Output)."
  },
  {
    front: "If a light bulb is 15% efficient, how much energy is transferred to the internal store for every 200 J input?",
    back: "Useful energy = 0.15 × 200 = 30 J\nEnergy transferred to internal store = 200 J − 30 J = 170 J"
  }
];

// STATE MANAGEMENT
let currentTab = "section-intro";
let activeDeviceKey = "lightbulb";
let quizQuestions = [];
let currentQuizIdx = 0;
let quizScore = 0;
let flashcardsDeck = [...FLASHCARDS];
let currentFlashcardIdx = 0;
let reviewedCards = new Set();

// SVG SANKEY DRAWING ENGINE
function renderSankey(svgElement, total, useful, deviceKey) {
  const device = DEVICES[deviceKey];
  const pathsContainer = svgElement.querySelector("#sankey-paths") || svgElement;
  const labelsContainer = svgElement.querySelector("#sankey-labels") || svgElement;
  
  // Clear previous drawings
  pathsContainer.innerHTML = "";
  if (svgElement.querySelector("#sankey-labels")) {
    labelsContainer.innerHTML = "";
  }

  const internal = total - useful;
  const efficiency = ((useful / total) * 100).toFixed(1);

  // Layout Dimensions (ViewBox 500x350)
  const xStart = 30;
  const xSplit = 200;
  const xEndUseful = 440;
  const yStart = 60;
  
  // Scale the thickness
  const maxThickness = 120;
  const minThickness = 5;
  const scale = maxThickness / total;

  const tTotal = Math.max(scale * total, minThickness * 2);
  const tUseful = scale * useful;
  const tInternal = scale * internal;

  // Render SVG Paths
  // 1. Useful Output Path (Horizontal arrow + arrowhead)
  const usefulPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  const uTop = yStart;
  const uBot = yStart + tUseful;
  
  // Custom Arrowhead specs
  const uArrowLen = Math.max(15, tUseful * 0.4);
  const uArrowHt = Math.max(10, tUseful * 0.3);

  // Drawing useful arrow
  const dUseful = `
    M ${xStart} ${uTop}
    L ${xEndUseful} ${uTop}
    L ${xEndUseful} ${uTop - uArrowHt}
    L ${xEndUseful + uArrowLen} ${uTop + tUseful/2}
    L ${xEndUseful} ${uBot + uArrowHt}
    L ${xEndUseful} ${uBot}
    L ${xSplit} ${uBot}
    L ${xStart} ${uBot}
    Z
  `;
  usefulPath.setAttribute("d", dUseful);
  usefulPath.setAttribute("fill", "url(#live-useful-grad)");
  pathsContainer.appendChild(usefulPath);

  // 2. Internal Store Path (Curve downwards)
  if (internal > 0) {
    const internalPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const iTop = uBot;
    const iBot = yStart + tTotal;
    const yEndInternal = 290;
    const xEndInternal = xSplit + 30;
    
    const iArrowLen = Math.max(15, tInternal * 0.4);
    const iArrowHt = Math.max(10, tInternal * 0.3);

    // Dynamic curve using bezier curves
    const dInternal = `
      M ${xStart} ${iTop}
      L ${xSplit} ${iTop}
      C ${xSplit + 50} ${iTop}, ${xEndInternal} ${yEndInternal - 50}, ${xEndInternal} ${yEndInternal}
      L ${xEndInternal + iArrowHt} ${yEndInternal}
      L ${xEndInternal - tInternal/2} ${yEndInternal + iArrowLen}
      L ${xEndInternal - tInternal - iArrowHt} ${yEndInternal}
      L ${xEndInternal - tInternal} ${yEndInternal}
      C ${xEndInternal - tInternal} ${yEndInternal - 55}, ${xSplit - 30} ${iBot}, ${xSplit - 30} ${iBot}
      L ${xStart} ${iBot}
      Z
    `;
    internalPath.setAttribute("d", dInternal);
    internalPath.setAttribute("fill", "url(#live-internal-grad)");
    pathsContainer.appendChild(internalPath);
  }

  // Render Labels
  const labels = [
    {
      text: `${total} J - Input`,
      x: xStart + 10,
      y: yStart - 10,
      anchor: "start",
      class: "lbl-input"
    },
    {
      text: `${useful} J - Useful (${efficiency}%)`,
      x: xEndUseful - 10,
      y: uTop - 15,
      anchor: "end",
      class: "lbl-useful"
    },
    {
      text: `${internal} J - Transferred to internal store`,
      x: xSplit + 80,
      y: 320,
      anchor: "middle",
      class: "lbl-internal"
    }
  ];

  labels.forEach(l => {
    const txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
    txt.setAttribute("x", l.x);
    txt.setAttribute("y", l.y);
    txt.setAttribute("text-anchor", l.anchor);
    txt.setAttribute("class", `svg-lbl ${l.class}`);
    txt.textContent = l.text;
    labelsContainer.appendChild(txt);
  });
}

// SIMULATION HANDLERS
function updateExplorer() {
  const device = DEVICES[activeDeviceKey];
  const inputTotal = document.getElementById("input-total");
  const inputUseful = document.getElementById("input-useful");
  const errorToast = document.getElementById("explorer-error");

  let total = parseFloat(inputTotal.value) || 100;
  let useful = parseFloat(inputUseful.value) || 0;

  if (useful > total) {
    errorToast.classList.remove("hide");
    // visual error state
    inputUseful.style.borderColor = "var(--error-red)";
  } else {
    errorToast.classList.add("hide");
    inputUseful.style.borderColor = "var(--border-glass)";
  }

  // Calculate efficiency
  const eff = total > 0 ? (useful / total) * 100 : 0;
  document.getElementById("explorer-efficiency").textContent = `${eff.toFixed(1)}%`;

  // Update Summary text
  const rem = total - useful;
  const summary = device.summaryFormat
    .replace("{in}", total)
    .replace("{out}", useful)
    .replace("{rem}", rem);
  document.getElementById("explorer-summary-text").textContent = summary;

  // Render SVG Sankey
  const svg = document.getElementById("live-sankey-svg");
  renderSankey(svg, total, useful, activeDeviceKey);
}

// SETUP DEVICE SELECTOR
function initDeviceTabs() {
  const tabsContainer = document.getElementById("device-tabs");
  tabsContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("device-tab")) {
      document.querySelectorAll(".device-tab").forEach(t => t.classList.remove("active"));
      e.target.classList.add("active");
      activeDeviceKey = e.target.dataset.device;
      
      const device = DEVICES[activeDeviceKey];
      document.getElementById("explorer-device-title").textContent = device.name;
      
      // Load default values
      document.getElementById("input-total").value = device.inputVal;
      document.getElementById("input-useful").value = device.outputVal;
      
      // Update custom animations in helper box
      updateDeviceAnimation(device.animate);
      
      updateExplorer();
    }
  });

  // Attach input event listeners
  document.getElementById("input-total").addEventListener("input", updateExplorer);
  document.getElementById("input-useful").addEventListener("input", updateExplorer);
}

function updateDeviceAnimation(type) {
  const box = document.getElementById("device-animation");
  box.innerHTML = "";
  const elem = document.createElement("div");
  if (type === "bulb") {
    elem.className = "bulb-glow-circle";
  } else if (type === "motor") {
    elem.className = "motor-spin-box";
    elem.innerHTML = "⚙️";
    elem.style.fontSize = "24px";
    elem.style.animation = "spin 2s linear infinite";
  } else if (type === "kettle") {
    elem.className = "kettle-steam-box";
    elem.innerHTML = "♨️";
    elem.style.fontSize = "24px";
    elem.style.animation = "pulse 1s ease-in-out infinite alternate";
  } else if (type === "car") {
    elem.className = "car-box";
    elem.innerHTML = "🚗";
    elem.style.fontSize = "24px";
    elem.style.animation = "bounce 0.5s infinite alternate";
  } else if (type === "solar") {
    elem.className = "solar-box";
    elem.innerHTML = "☀️";
    elem.style.fontSize = "24px";
    elem.style.animation = "pulse 2s infinite alternate";
  } else if (type === "hydro") {
    elem.className = "hydro-box";
    elem.innerHTML = "💧";
    elem.style.fontSize = "24px";
    elem.style.animation = "fall 1.5s infinite linear";
  }
  box.appendChild(elem);
}

// Add CSS keyframes dynamically for the mini animations
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes spin { 100% { transform: rotate(360deg); } }
  @keyframes fall { 0% { transform: translateY(-10px); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateY(10px); opacity: 0; } }
  @keyframes bounce { 0% { transform: translateY(0); } 100% { transform: translateY(-4px); } }
  .svg-lbl {
    font-family: var(--font-title);
    font-size: 11px;
    font-weight: 600;
  }
  .lbl-input { fill: #f3f4f6; }
  .lbl-useful { fill: #c084fc; }
  .lbl-internal { fill: #a78bfa; }
  .mcq-btn {
    text-align: left;
    background: rgba(168, 85, 247, 0.05);
    border: 1px solid var(--border-glass);
    padding: 0.75rem 1rem;
    border-radius: 8px;
    color: var(--text-primary);
    cursor: pointer;
    font-family: var(--font-body);
    font-size: 0.85rem;
    transition: all 0.2s;
  }
  .mcq-btn:hover {
    background: rgba(168, 85, 247, 0.15);
    border-color: var(--accent-glow);
  }
`;
document.head.appendChild(styleSheet);


// QUIZ DATABASE GENERATORS (30 Questions Pool)
function buildQuizPool() {
  const pool = [];
  const devicesList = Object.keys(DEVICES);

  // Helper to generate values
  const randRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const randEff = () => randRange(20, 95);

  // Type 1: Calculate efficiency given input and useful output (6 questions, 1 for each device)
  devicesList.forEach((dKey) => {
    pool.push(() => {
      const dev = DEVICES[dKey];
      const total = randRange(100, 5000);
      const eff = randEff();
      const useful = Math.round(total * (eff / 100));
      const calculatedEff = ((useful / total) * 100);

      return {
        type: "text",
        category: "Efficiency Calculation",
        question: `A certain <strong>${dev.name}</strong> takes in <strong>${total} J</strong> of energy. The ${dev.outputLabel} is measured to be <strong>${useful} J</strong>. Calculate the efficiency of the device.`,
        correctVal: calculatedEff,
        correctUnit: "%",
        solution: `Efficiency = (Useful energy output ÷ Total energy input) × 100%\nEfficiency = (${useful} J ÷ ${total} J) × 100% = ${calculatedEff.toFixed(2)}%`
      };
    });
  });
  // Type 2: Find useful output given efficiency and input (6 questions)
  devicesList.forEach((dKey) => {
    pool.push(() => {
      const dev = DEVICES[dKey];
      const total = randRange(200, 4000);
      const eff = randEff();
      const useful = total * (eff / 100);

      return {
        type: "text",
        category: "Energy Output Calculation",
        question: `An O-Level student analyses a <strong>${dev.name}</strong> with a total energy input of <strong>${total} J</strong> and an efficiency of <strong>${eff}%</strong>. Calculate the quantity of ${dev.outputLabel} in Joules.`,
        correctVal: useful,
        correctUnit: "J",
        solution: `Useful energy output = (Efficiency ÷ 100%) × Total energy input\nUseful energy output = (${eff}% ÷ 100%) × ${total} J = ${parseFloat(useful.toFixed(2))} J`
      };
    });
  });

  // Type 3: Find total input given efficiency and useful output (6 questions)
  devicesList.forEach((dKey) => {
    pool.push(() => {
      const dev = DEVICES[dKey];
      const eff = randEff();
      const useful = randRange(50, 1500);
      const total = useful / (eff / 100);

      return {
        type: "text",
        category: "Energy Input Calculation",
        question: `A student measures the useful energy output of a <strong>${dev.name}</strong> to be <strong>${useful} J</strong>. If the device operates at an efficiency of <strong>${eff}%</strong>, calculate the total energy input required in Joules.`,
        correctVal: total,
        correctUnit: "J",
        solution: `Total energy input = Useful energy output ÷ (Efficiency ÷ 100%)\nTotal energy input = ${useful} J ÷ (${eff}% ÷ 100%) = ${parseFloat(total.toFixed(2))} J`
      };
    });
  });

  // Type 4: Find missing value in a Sankey diagram (4 questions)
  for (let i = 0; i < 4; i++) {
    pool.push(() => {
      const total = randRange(500, 3000);
      const useful = randRange(150, total - 100);
      const internal = total - useful;
      const missingType = ["total", "useful", "internal"][i % 3];

      let question = "";
      let correctVal = 0;
      let solution = "";

      if (missingType === "total") {
        question = `In a Sankey diagram, the arrow representing useful output corresponds to <strong>${useful} J</strong>, and the downward arrow representing energy transferred to the internal store represents <strong>${internal} J</strong>. Find the total energy input.`;
        correctVal = total;
        solution = `Total Energy Input = Useful Output + Transferred to Internal Store\nTotal = ${useful} J + ${internal} J = ${total} J`;
      } else if (missingType === "useful") {
        question = `A Sankey diagram has a total energy input arrow of <strong>${total} J</strong>. The downward arrow showing energy transferred to the internal store represents <strong>${internal} J</strong>. Find the useful energy output.`;
        correctVal = useful;
        solution = `Useful Energy Output = Total Input − Transferred to Internal Store\nUseful = ${total} J − ${internal} J = ${useful} J`;
      } else {
        question = `A Sankey diagram shows a total input of <strong>${total} J</strong> and a useful output of <strong>${useful} J</strong> going to the right. Find the value of the energy transferred to the internal store.`;
        correctVal = internal;
        solution = `Energy Transferred to Internal Store = Total Input − Useful Output\nInternal Store = ${total} J − ${useful} J = ${internal} J`;
      }

      return {
        type: "text",
        category: "Sankey Diagram Mechanics",
        question: question,
        correctVal: correctVal,
        correctUnit: "J",
        solution: solution
      };
    });
  }

  // Type 5: Conceptual MCQ - arrows orientation (1 question)
  pool.push(() => {
    return {
      type: "mcq",
      category: "Sankey Concepts",
      question: "In a correct Singapore O-Level Physics Sankey diagram, which direction represents the non-useful energy transferred to the internal store?",
      options: [
        "The arrow exiting downward",
        "The arrow continuing to the right",
        "The arrow entering from the left",
        "The arrow exiting upward"
      ],
      correctIdx: 0,
      solution: "In Sankey diagrams, the input enters from the left, useful output continues to the right, and any energy transferred to the non-useful internal store exits downwards."
    };
  });

  // Type 6: Conceptual MCQ - 80% efficiency meaning (1 question)
  pool.push(() => {
    return {
      type: "mcq",
      category: "Efficiency Concepts",
      question: "An electric motor is determined to operate at 80% efficiency. Which statement correctly describes the remaining 20% of the energy?",
      options: [
        "20% of the input energy is transferred to the internal store.",
        "20% of the energy is lost or destroyed.",
        "20% of the energy is transferred by wave propagation.",
        "20% of the energy is destroyed by friction."
      ],
      correctIdx: 0,
      solution: "Energy cannot be created or destroyed. The remaining 20% of energy is not usefully transferred; it is transferred to the internal store."
    };
  });

  // Type 7: MCQ - Identify correct Sankey diagram structure (1 question)
  pool.push(() => {
    return {
      type: "mcq",
      category: "Sankey Diagrams",
      question: "Which option outlines the correct layout principles of a standard O-Level Sankey diagram?",
      options: [
        "Input enters from left, useful output goes right, internal store transfer goes down.",
        "Input enters from left, useful output goes down, internal store transfer goes right.",
        "Input enters from bottom, useful output goes right, internal store transfer goes top.",
        "Input enters from top, useful output goes down, internal store transfer goes left."
      ],
      correctIdx: 0,
      solution: "Correct Sankey terminology states that input enters from left, useful output continues right, and internal store energy transfer exits downward."
    };
  });

  // Type 8: MCQ - Identify most efficient device from a table (2 questions)
  for (let i = 0; i < 2; i++) {
    pool.push(() => {
      const aIn = 1000, aOut = 300; // 30%
      const bIn = 2000, bOut = 800; // 40%
      const cIn = 500,  cOut = 450; // 90%
      const dIn = 1500, dOut = 1200; // 80%
      
      return {
        type: "mcq",
        category: "Comparison Analysis",
        question: `Based on the following measurements, which device has the highest efficiency?<br><br>
                   Device A: Input = 1000 J, Useful Output = 300 J<br>
                   Device B: Input = 2000 J, Useful Output = 800 J<br>
                   Device C: Input = 500 J, Useful Output = 450 J<br>
                   Device D: Input = 1500 J, Useful Output = 1200 J`,
        options: [
          "Device C",
          "Device D",
          "Device B",
          "Device A"
        ],
        correctIdx: 0,
        solution: "Efficiency calculation:\n- A = (300 ÷ 1000) × 100% = 30%\n- B = (800 ÷ 2000) × 100% = 40%\n- C = (450 ÷ 500) × 100% = 90%\n- D = (1200 ÷ 1500) × 100% = 80%\nDevice C is the most efficient (90%)."
      };
    });
  }

  // Type 9: True/False syllabus terminology check (2 questions)
  pool.push(() => {
    return {
      type: "mcq",
      category: "Syllabus Terminology",
      question: "True or False: In O-Level syllabus answers, it is acceptable to use the terms 'lost energy' or 'wasted heat' when describing energy transfers that are not useful.",
      options: [
        "False. Energy must be described as 'energy transferred to the internal store'.",
        "True. 'Wasted heat' is standard terminology."
      ],
      correctIdx: 0,
      solution: "In the Singapore O-Level Physics syllabus, energy that is not useful is always formally described as 'energy transferred to internal store'. Bare terms like 'lost' or 'wasted' are scientifically incorrect."
    };
  });

  pool.push(() => {
    return {
      type: "mcq",
      category: "Syllabus Terminology",
      question: "True or False: The sum of the useful energy output and the energy transferred to the internal store must always equal the total energy input.",
      options: [
        "True. This is a direct consequence of the Principle of Conservation of Energy.",
        "False. Energy is always lost during transfers."
      ],
      correctIdx: 0,
      solution: "Due to the Principle of Conservation of Energy, the total energy input must equal the sum of all useful and non-useful energy outputs."
    };
  });

  // Type 10: Multi-step: input power and time, find useful output (2 questions)
  pool.push(() => {
    const power = randRange(10, 200); // W
    const time = randRange(5, 30); // s
    const eff = randEff();
    const totalEnergy = power * time;
    const usefulEnergy = totalEnergy * (eff / 100);

    return {
      type: "text",
      category: "Multi-Step Calculation",
      question: `An electric motor has an input power rating of <strong>${power} W</strong> and runs for <strong>${time} s</strong>. If the motor is <strong>${eff}%</strong> efficient, calculate the useful energy output transferred to the kinetic store.`,
      correctVal: usefulEnergy,
      correctUnit: "J",
      solution: `Step 1: Calculate Total Energy Input\nEnergy Input = Power × Time = ${power} W × ${time} s = ${totalEnergy} J\n\nStep 2: Calculate Useful Energy Output\nUseful energy output = (Efficiency ÷ 100%) × Total energy input\nUseful output = (${eff}% ÷ 100%) × ${totalEnergy} J = ${parseFloat(usefulEnergy.toFixed(2))} J`
    };
  });

  pool.push(() => {
    const power = randRange(100, 1500); // W
    const time = randRange(2, 10); // s
    const eff = randEff();
    const totalEnergy = power * time;
    const usefulEnergy = totalEnergy * (eff / 100);

    return {
      type: "text",
      category: "Multi-Step Calculation",
      question: `A kettle has an input power of <strong>${power} W</strong>. If it is switched on for <strong>${time} s</strong> and operates at an efficiency of <strong>${eff}%</strong>, calculate the useful energy transferred to the internal store of the water.`,
      correctVal: usefulEnergy,
      correctUnit: "J",
      solution: `Step 1: Calculate Total Energy Input\nEnergy Input = Power × Time = ${power} W × ${time} s = ${totalEnergy} J\n\nStep 2: Calculate Useful Energy Output\nUseful output = (Efficiency ÷ 100%) × Total energy input\nUseful output = (${eff}% ÷ 100%) × ${totalEnergy} J = ${parseFloat(usefulEnergy.toFixed(2))} J`
    };
  });

  return pool;
}

// STRICT UNIT & NUMERICAL CHECKER
function verifyStudentAnswer(studentAns, correctValue, correctUnit) {
  const match = studentAns.trim().match(/^([\d.]+)\s*([a-zA-Z%]+)$/);
  if (!match) {
    return {
      correct: false,
      reason: "unit_missing",
      message: "Check your unit — W for watts, J for joules, % for efficiency."
    };
  }

  const valNum = parseFloat(match[1]);
  const valUnit = match[2];

  if (valUnit !== correctUnit) {
    return {
      correct: false,
      reason: "unit_case",
      message: "Check your unit — W for watts, J for joules, % for efficiency."
    };
  }

  // Allow student to input answers rounded to 0-4 decimal places.
  let isNumericMatch = false;
  for (let d = 0; d <= 4; d++) {
    const rounded = parseFloat(correctValue.toFixed(d));
    if (Math.abs(valNum - rounded) < 1e-6) {
      isNumericMatch = true;
      break;
    }
  }

  if (!isNumericMatch) {
    return {
      correct: false,
      reason: "value_error",
      message: `Incorrect numerical value. The correct value is ${correctValue.toFixed(1)} ${correctUnit}.`
    };
  }

  return { correct: true };
}

// QUIZ RUNNER
function startQuiz() {
  const pool = buildQuizPool();
  
  // Shuffle and pick 15 templates
  const shuffled = pool.sort(() => 0.5 - Math.random());
  quizQuestions = shuffled.slice(0, 15).map(template => template());

  currentQuizIdx = 0;
  quizScore = 0;

  document.getElementById("quiz-start-screen").classList.add("hide");
  document.getElementById("quiz-result-screen").classList.add("hide");
  document.getElementById("quiz-play-screen").classList.remove("hide");

  loadQuizQuestion();
}

function loadQuizQuestion() {
  const question = quizQuestions[currentQuizIdx];
  
  // Reset outputs
  document.getElementById("current-q-num").textContent = currentQuizIdx + 1;
  document.getElementById("running-score").textContent = quizScore;
  document.getElementById("quiz-progress-fill").style.width = `${((currentQuizIdx) / 15) * 100}%`;
  
  document.getElementById("question-category").textContent = question.category;
  document.getElementById("quiz-question-text").innerHTML = question.question;
  document.getElementById("quiz-feedback-box").classList.add("hide");
  document.getElementById("quiz-student-answer").value = "";

  // Render Diagram if visual question
  const diagContainer = document.getElementById("quiz-diagram-container");
  diagContainer.classList.add("hide");

  // Determine Answer input UI (MCQ vs Text)
  const textInputWrap = document.getElementById("quiz-text-input-wrap");
  const mcqWrap = document.getElementById("quiz-mcq-wrap");

  if (question.type === "mcq") {
    textInputWrap.classList.add("hide");
    mcqWrap.classList.remove("hide");

    // Populate MCQ options
    mcqWrap.innerHTML = "";
    question.options.forEach((opt, idx) => {
      const btn = document.createElement("button");
      btn.className = "mcq-btn";
      btn.innerHTML = opt;
      btn.addEventListener("click", () => handleMcqSubmit(idx));
      mcqWrap.appendChild(btn);
    });
  } else {
    textInputWrap.classList.remove("hide");
    mcqWrap.classList.add("hide");
  }
}

function handleTextSubmit() {
  const inputEl = document.getElementById("quiz-student-answer");
  const answerVal = inputEl.value;
  const question = quizQuestions[currentQuizIdx];

  const result = verifyStudentAnswer(answerVal, question.correctVal, question.correctUnit);
  showQuizFeedback(result.correct, result.message, question.solution);
}

function handleMcqSubmit(chosenIdx) {
  const question = quizQuestions[currentQuizIdx];
  const isCorrect = (chosenIdx === question.correctIdx);
  const feedbackMsg = isCorrect ? "Correct! 🌟" : "Incorrect answer.";
  showQuizFeedback(isCorrect, feedbackMsg, question.solution);
}

function showQuizFeedback(isCorrect, statusText, solutionText) {
  if (isCorrect) {
    quizScore++;
    document.getElementById("running-score").textContent = quizScore;
    document.getElementById("quiz-feedback-title").textContent = "Correct! 🌟";
    document.getElementById("quiz-feedback-title").className = "feedback-status-title correct";
    triggerConfetti(30);
  } else {
    document.getElementById("quiz-feedback-title").textContent = statusText;
    document.getElementById("quiz-feedback-title").className = "feedback-status-title wrong";
  }

  document.getElementById("quiz-worked-solution").innerHTML = solutionText.replace(/\n/g, "<br>");
  document.getElementById("quiz-feedback-box").classList.remove("hide");

  // Disable further inputs for this turn
  document.querySelectorAll(".mcq-btn").forEach(btn => btn.disabled = true);
  document.getElementById("quiz-submit-btn").disabled = true;
}

function nextQuizQuestion() {
  // Re-enable submit button
  document.getElementById("quiz-submit-btn").disabled = false;
  
  currentQuizIdx++;
  if (currentQuizIdx < 15) {
    loadQuizQuestion();
  } else {
    showQuizResults();
  }
}

function showQuizResults() {
  document.getElementById("quiz-play-screen").classList.add("hide");
  const resultScreen = document.getElementById("quiz-result-screen");
  resultScreen.classList.remove("hide");

  document.getElementById("final-score").textContent = quizScore;
  const commentEl = document.getElementById("score-comment");

  if (quizScore >= 13) {
    commentEl.textContent = "Sankey Star! 🌟";
    triggerConfetti(150);
  } else if (quizScore >= 9) {
    commentEl.textContent = "Good effort — check your Sankey diagram labels and formula.";
  } else {
    commentEl.textContent = "Review the device tabs and try the Sankey builder again before retrying.";
  }
}


// FLASHCARDS DECK MECHANICS
function initFlashcards() {
  const cardElement = document.getElementById("flashcard-element");
  
  cardElement.addEventListener("click", () => {
    cardElement.classList.toggle("flipped");
  });

  document.getElementById("fc-prev-btn").addEventListener("click", () => {
    cardElement.classList.remove("flipped");
    setTimeout(() => {
      currentFlashcardIdx = (currentFlashcardIdx - 1 + flashcardsDeck.length) % flashcardsDeck.length;
      loadFlashcard();
    }, 150);
  });

  document.getElementById("fc-next-btn").addEventListener("click", () => {
    cardElement.classList.remove("flipped");
    setTimeout(() => {
      reviewedCards.add(currentFlashcardIdx);
      document.getElementById("cards-reviewed-count").textContent = reviewedCards.size;
      currentFlashcardIdx = (currentFlashcardIdx + 1) % flashcardsDeck.length;
      loadFlashcard();
    }, 150);
  });

  document.getElementById("fc-shuffle-btn").addEventListener("click", () => {
    cardElement.classList.remove("flipped");
    setTimeout(() => {
      flashcardsDeck.sort(() => 0.5 - Math.random());
      currentFlashcardIdx = 0;
      reviewedCards.clear();
      document.getElementById("cards-reviewed-count").textContent = "0";
      loadFlashcard();
    }, 150);
  });

  loadFlashcard();
}

function loadFlashcard() {
  const card = flashcardsDeck[currentFlashcardIdx];
  document.getElementById("fc-front-text").textContent = card.front;
  document.getElementById("fc-back-text").textContent = card.back;
}


// CELEBRATION EFFECTS (Confetti Canvas)
const canvas = document.getElementById("confetti-canvas");
const ctx = canvas.getContext("2d");
let confettiActive = false;
let confettiParticles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

class ConfettiParticle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height - canvas.height;
    this.size = Math.random() * 6 + 4;
    this.speedY = Math.random() * 3 + 2;
    this.speedX = Math.random() * 2 - 1;
    this.color = `hsl(${Math.random() * 360}, 80%, 60%)`;
  }
  update() {
    this.y += this.speedY;
    this.x += this.speedX;
    if (this.y > canvas.height) {
      this.y = -20;
      this.x = Math.random() * canvas.width;
    }
  }
  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
  }
}

function triggerConfetti(amount) {
  confettiParticles = [];
  for (let i = 0; i < amount; i++) {
    confettiParticles.push(new ConfettiParticle());
  }
  confettiActive = true;
  requestAnimationFrame(animateConfetti);
  setTimeout(() => {
    confettiActive = false;
  }, 3000);
}

function animateConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!confettiActive && confettiParticles.length === 0) return;
  
  confettiParticles.forEach((p, idx) => {
    p.update();
    p.draw();
  });

  if (confettiActive) {
    requestAnimationFrame(animateConfetti);
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}


// MAIN NAVIGATION & INITIALISATION
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", (e) => {
    const target = btn.getAttribute("data-target");
    if (target) {
      document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      document.querySelectorAll(".screen-section").forEach(sec => sec.classList.remove("active"));
      document.getElementById(target).classList.add("active");
      
      currentTab = target;
      if (target === "section-exploration") {
        updateExplorer();
      }
    }
  });
});

// Attach quiz actions
document.getElementById("start-quiz-btn").addEventListener("click", startQuiz);
document.getElementById("quiz-submit-btn").addEventListener("click", handleTextSubmit);
document.getElementById("quiz-next-btn").addEventListener("click", nextQuizQuestion);
document.getElementById("retry-quiz-btn").addEventListener("click", startQuiz);
document.getElementById("review-builder-btn").addEventListener("click", () => {
  document.querySelector('.nav-btn[data-target="section-exploration"]').click();
});

// App startup
window.addEventListener("DOMContentLoaded", () => {
  initDeviceTabs();
  initFlashcards();
  updateExplorer();
  updateDeviceAnimation("bulb");
});
