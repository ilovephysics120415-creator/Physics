// O-Level Physics - Energy Resources App

// 1. Resources Database
const resources = [
  {
    id: "coal",
    name: "Coal, Oil & Gas",
    type: "non-renewable",
    displayType: "Fossil Fuels",
    energyStore: "Chemical potential store",
    ratings: {
      efficiency: 4, // 4/5
      cost: 4,       // 4/5 (Favorable, relatively low setup cost)
      reliability: 5, // 5/5 (Weather independent)
      environmental: 1 // 1/5 (High carbon footprint)
    },
    explanations: {
      efficiency: "Thermal power stations convert chemical potential store efficiently but substantial energy is dissipated to surroundings as thermal energy.",
      cost: "Established technology makes setup and operation highly cost-effective.",
      reliability: "Can burn fuel continuously to generate electricity to meet demand at any time.",
      environmental: "Combustion releases greenhouse gases (carbon dioxide) contributing to global warming, and sulfur dioxide which causes acid rain."
    }
  },
  {
    id: "nuclear",
    name: "Nuclear Fuel",
    type: "non-renewable",
    displayType: "Nuclear",
    energyStore: "Nuclear energy store",
    ratings: {
      efficiency: 5,
      cost: 1,       // 1/5 (Unfavorable, extremely high setup & waste disposal)
      reliability: 5,
      environmental: 2
    },
    explanations: {
      efficiency: "High energy density. A tiny amount of uranium releases vast electrical energy through nuclear fission.",
      cost: "Building nuclear reactors, maintaining strict safety, and decommissioning are extremely expensive.",
      reliability: "Provides continuous, reliable baseload power 24/7 regardless of weather conditions.",
      environmental: "Produces highly radioactive waste requiring secure storage for thousands of years, although it does not emit greenhouse gases during operation."
    }
  },
  {
    id: "biofuel",
    name: "Biofuel",
    type: "renewable",
    displayType: "Biofuel",
    energyStore: "Chemical potential store",
    ratings: {
      efficiency: 3,
      cost: 3,
      reliability: 4,
      environmental: 3
    },
    explanations: {
      efficiency: "Conversion of biomass to electricity has moderate efficiency; energy is dissipated as thermal energy during combustion.",
      cost: "Moderate setup costs, but requires ongoing agricultural cultivation, processing, and transportation.",
      reliability: "Biofuels can be stored and burned whenever power is needed, offering stable supply.",
      environmental: "Theoretically carbon-neutral, but growing crops requires vast land, leading to deforestation and competition with food crops."
    }
  },
  {
    id: "wind",
    name: "Wind Energy",
    type: "renewable",
    displayType: "Wind",
    energyStore: "Kinetic store of wind",
    ratings: {
      efficiency: 2,
      cost: 3,
      reliability: 2,
      environmental: 4
    },
    explanations: {
      efficiency: "Wind turbines are aerodynamically limited; a large portion of wind's kinetic store bypasses the blades.",
      cost: "High initial setup costs for turbines, but zero ongoing fuel cost and moderate maintenance.",
      reliability: "Highly intermittent; no electricity is generated when wind speeds are too low or too high.",
      environmental: "No air pollution during operation, but requires large open land/sea areas and may disrupt bird migration patterns."
    }
  },
  {
    id: "tides",
    name: "Tidal Energy",
    type: "renewable",
    displayType: "Tides",
    energyStore: "Kinetic store of water",
    ratings: {
      efficiency: 3,
      cost: 2,
      reliability: 4,
      environmental: 3
    },
    explanations: {
      efficiency: "Converting kinetic energy of tidal currents into electricity has moderate mechanical efficiency.",
      cost: "Very high setup costs for building tidal barrages and underwater turbines in harsh marine environments.",
      reliability: "Predictable cycles based on gravitational pull of the Moon and Sun, though power output varies throughout the day.",
      environmental: "Zero carbon emissions, but barrage installations can disrupt local marine habitats and alter coastal ecosystems."
    }
  },
  {
    id: "hydropower",
    name: "Hydropower",
    type: "renewable",
    displayType: "Hydropower",
    energyStore: "Gravitational potential store",
    ratings: {
      efficiency: 5,
      cost: 2,
      reliability: 5,
      environmental: 2
    },
    explanations: {
      efficiency: "Highly efficient; converts gravitational potential store of water directly into kinetic store, then to electrical energy with minimal dissipation.",
      cost: "Dams require massive capital investments to construct, though operating costs are extremely low once complete.",
      reliability: "Highly reliable; water flow can be controlled instantly via sluice gates to meet peak demand.",
      environmental: "Floods large areas upstream, destroying natural habitats, disrupting aquatic migration, and displacing local communities."
    }
  },
  {
    id: "geothermal",
    name: "Geothermal Energy",
    type: "renewable",
    displayType: "Geothermal",
    energyStore: "Thermal store of the Earth",
    ratings: {
      efficiency: 3,
      cost: 2,
      reliability: 5,
      environmental: 4
    },
    explanations: {
      efficiency: "Moderate thermal conversion efficiency due to limitations of underground steam temperatures.",
      cost: "Deep drilling and geothermal plant setup costs are high, with risks of dry wells.",
      reliability: "Extremely reliable; draws from the Earth's constant thermal store, operating 24/7 regardless of weather.",
      environmental: "Very low emissions and small land footprint, though there is a minor risk of releasing underground toxic gases."
    }
  },
  {
    id: "solar",
    name: "Solar Energy",
    type: "renewable",
    displayType: "Solar",
    energyStore: "Solar radiation (Electromagnetic wave)",
    ratings: {
      efficiency: 2,
      cost: 3,
      reliability: 1,
      environmental: 5
    },
    explanations: {
      efficiency: "Solar photovoltaic panels have low conversion efficiency; most incoming light energy is dissipated as thermal energy to the surroundings.",
      cost: "Setup costs are moderate and falling rapidly, with negligible operating and maintenance costs.",
      reliability: "Highly unreliable; power output fluctuates with weather conditions and is completely unavailable at night.",
      environmental: "Environmentally friendly with zero emissions during operation; panels can be integrated onto existing building rooftops."
    }
  }
];

// Definitions of Criteria
const criteriaInfo = {
  efficiency: {
    title: "Efficiency of energy transfer",
    desc: "How much input energy becomes useful electrical energy",
    icon: "⚡"
  },
  cost: {
    title: "Cost",
    desc: "Setup, running and maintenance costs (Higher is more favorable)",
    icon: "💰"
  },
  reliability: {
    title: "Reliability",
    desc: "Consistency of supply regardless of weather or time",
    icon: "🔒"
  },
  environmental: {
    title: "Environmental impact",
    desc: "Pollution, carbon emissions, land use, ecosystem disruption (Higher is more favorable/lower impact)",
    icon: "🌱"
  }
};

// 2. Scenario Pools
const locations = [
  {
    id: "island",
    name: "A small remote island with no grid connection",
    description: "Requires a decentralized solution. Setting up long-distance cables or massive nuclear stations is impossible. Fuel imports are difficult.",
    modifiers: { solar: 4, wind: 3, biofuel: 4, coal: 1, nuclear: 0, hydropower: 1, geothermal: 1, tides: 2 }
  },
  {
    id: "city",
    name: "A densely populated city with high electricity demand",
    description: "Requires high power density and reliable baseload electricity within a small spatial footprint.",
    modifiers: { coal: 4, nuclear: 5, solar: 1, wind: 1, hydropower: 2, geothermal: 3, tides: 2, biofuel: 2 }
  },
  {
    id: "developing",
    name: "A developing nation with limited budget",
    description: "Prioritizes immediate low capital cost and simple, cheap technology to kickstart infrastructure.",
    modifiers: { coal: 5, biofuel: 3, solar: 3, wind: 2, nuclear: 0, hydropower: 1, geothermal: 1, tides: 1 }
  },
  {
    id: "coastline",
    name: "A country with long coastlines and strong winds",
    description: "Abundant marine and coastal kinetic energy resources available to tap.",
    modifiers: { wind: 5, tides: 5, solar: 2, coal: 2, nuclear: 2, hydropower: 2, geothermal: 1, biofuel: 2 }
  },
  {
    id: "mountain",
    name: "A mountainous region with fast-flowing rivers",
    description: "High elevation changes provide a large gravitational potential store of water.",
    modifiers: { hydropower: 5, solar: 1, wind: 2, geothermal: 2, coal: 2, nuclear: 2, tides: 1, biofuel: 2 }
  },
  {
    id: "desert",
    name: "A desert country with high solar radiation",
    description: "Vast barren land with extremely high solar irradiance levels daily.",
    modifiers: { solar: 5, hydropower: 0, tides: 0, wind: 3, coal: 2, nuclear: 2, geothermal: 2, biofuel: 1 }
  },
  {
    id: "carbon",
    name: "A country that needs to reduce carbon emissions urgently",
    description: "Must phase out fossil fuels entirely to meet zero-carbon targets, prioritizing clean resources.",
    modifiers: { solar: 5, wind: 5, hydropower: 4, geothermal: 5, nuclear: 4, tides: 4, biofuel: 3, coal: 0 }
  },
  {
    id: "volcanic",
    name: "A nation with geologically active volcanic regions",
    description: "High geothermal gradients close to the Earth's surface make underground thermal stores highly accessible.",
    modifiers: { geothermal: 5, solar: 2, wind: 2, hydropower: 2, tides: 1, coal: 2, nuclear: 2, biofuel: 2 }
  }
];

const constraints = [
  { id: "cost", label: "lowest cost", criteriaKey: "cost", weight: 2.5 },
  { id: "reliability", label: "highest reliability", criteriaKey: "reliability", weight: 2.5 },
  { id: "environmental", label: "lowest environmental impact", criteriaKey: "environmental", weight: 2.5 },
  { id: "efficiency", label: "highest efficiency", criteriaKey: "efficiency", weight: 2.5 }
];

// 3. Quiz Pool (30 Syllabus-Compliant Questions)
const quizPool = [
  {
    q: "Which resource is most reliable for 24/7 baseload electricity generation?",
    options: ["Solar energy", "Wind energy", "Nuclear fuel", "Biofuel"],
    answer: 2,
    explanation: "Nuclear fuel energy release is weather-independent and runs continuously. Solar and wind depend on atmospheric conditions and daylight."
  },
  {
    q: "Which energy resource has the lowest carbon dioxide emissions during operation?",
    options: ["Coal", "Biofuel", "Natural gas", "Wind energy"],
    answer: 3,
    explanation: "Wind turbines generate electricity directly by converting the kinetic store of wind. No combustion occurs, releasing zero carbon emissions."
  },
  {
    q: "Which renewable energy resource is most directly dependent on weather conditions?",
    options: ["Geothermal energy", "Solar energy", "Tidal energy", "Nuclear fuel"],
    answer: 1,
    explanation: "Solar energy output depends heavily on solar radiation, which is reduced by clouds, rain, and nighttime."
  },
  {
    q: "Why is nuclear fuel classified as a non-renewable energy resource?",
    options: [
      "It produces radioactive waste.",
      "Uranium is finite and cannot be replenished as fast as it is consumed.",
      "It releases carbon dioxide when reacted.",
      "It has low energy density."
    ],
    answer: 1,
    explanation: "Non-renewable resources are finite. Uranium reserves in the Earth's crust cannot be replenished once consumed."
  },
  {
    q: "A country wants low cost and low environmental impact. Which renewable resource is most suitable on rooftops?",
    options: ["Solar energy", "Nuclear fuel", "Coal", "Hydropower"],
    answer: 0,
    explanation: "Solar energy can be mounted directly on existing rooftops to minimize environmental impact with zero operational cost."
  },
  {
    q: "Which energy resource produces highly radioactive waste that requires secure long-term storage?",
    options: ["Coal power", "Geothermal energy", "Nuclear fuel", "Biofuel"],
    answer: 2,
    explanation: "Nuclear fission of uranium produces radioactive waste byproducts that remain hazardous for thousands of years."
  },
  {
    q: "Why is hydropower considered highly reliable compared to solar and wind?",
    options: [
      "Water is always flowing at the same rate.",
      "Water flow can be controlled instantly via dams to match demand.",
      "Hydropower does not require setup costs.",
      "Hydropower relies on the combustion of water."
    ],
    answer: 1,
    explanation: "Dams store water in a gravitational potential store. Sluice gates can be opened instantly to release water as needed, ensuring high reliability."
  },
  {
    q: "What is the primary environmental concern with burning fossil fuels?",
    options: [
      "It releases carbon dioxide, contributing to global warming.",
      "It causes radioactive waste leaks.",
      "It consumes too much kinetic energy.",
      "It occupies larger land areas than solar arrays."
    ],
    answer: 0,
    explanation: "Burning fossil fuels releases carbon dioxide (a greenhouse gas) that traps energy in the atmosphere, driving global warming."
  },
  {
    q: "Which renewable resource requires the largest land area relative to its electrical energy output?",
    options: ["Nuclear fuel", "Biofuel", "Geothermal energy", "Natural gas"],
    answer: 1,
    explanation: "Biofuels require vast agricultural land to grow crops like corn or sugarcane to harvest chemical potential energy."
  },
  {
    q: "A coastal country wants renewable energy with highly predictable timing. Which is most suitable?",
    options: ["Solar energy", "Wind energy", "Tidal energy", "Geothermal energy"],
    answer: 2,
    explanation: "Tidal cycles are driven by gravity (gravitational pull of Moon and Sun) and are highly predictable, unlike atmospheric weather."
  },
  {
    q: "Comparing typical efficiency of solar panels vs coal power stations, which is correct?",
    options: [
      "Solar panels are significantly more efficient (~90%).",
      "Coal power stations have higher efficiency than solar panels.",
      "Both have 100% conversion efficiency.",
      "Solar panels have no energy dissipated as thermal energy."
    ],
    answer: 1,
    explanation: "Coal power plants operate at ~35-40% efficiency. Typical solar panels are only ~15-20% efficient; most solar energy is dissipated as thermal energy."
  },
  {
    q: "Why is geothermal energy only available in specific geographical locations?",
    options: [
      "It requires cold weather to freeze water.",
      "It requires hot volcanic rocks near the Earth's surface to access underground thermal stores.",
      "It relies on high wind speeds.",
      "It needs coastal tides."
    ],
    answer: 1,
    explanation: "To be viable, hot rock formations or volcanic activity must lie close enough to the crust to tap the thermal store of the Earth."
  },
  {
    q: "Which resource has the highest setup cost per unit of electricity generated?",
    options: ["Coal", "Natural gas", "Nuclear fuel", "Biofuel"],
    answer: 2,
    explanation: "Nuclear power plants demand massive capital for safety containment, specialized reactors, and long-term radioactive waste facilities."
  },
  {
    q: "Why does biofuel produce environmental concerns despite being renewable?",
    options: [
      "It depletes uranium reserves.",
      "Cultivation leads to deforestation, habitat destruction, and food supply competition.",
      "It produces radioactive isotopes.",
      "It requires constant high wind."
    ],
    answer: 1,
    explanation: "Growing fuel crops requires clearing natural forests, which disrupts ecosystems and uses land that could grow food crops."
  },
  {
    q: "A developing nation with low budget wants to build simple, established power plants. Which is most cost-effective?",
    options: ["Nuclear power", "Fossil fuels (coal/gas)", "Geothermal systems", "Tidal barrages"],
    answer: 1,
    explanation: "Fossil fuel power plants are well-established, cheap to set up initially, and do not require highly complex materials like nuclear."
  },
  {
    q: "True or False: Nuclear power produces zero greenhouse gases during operation.",
    options: ["True", "False", "Only in winter", "Only when burning coal"],
    answer: 0,
    explanation: "Nuclear reactors run on fission. No combustion occurs, so zero carbon dioxide or greenhouse gases are emitted during operation."
  },
  {
    q: "True or False: Solar energy is reliable for 24/7 electricity generation without energy storage.",
    options: ["True", "False", "True in deserts", "True in Singapore"],
    answer: 1,
    explanation: "False. Without batteries to store energy, solar panels cannot generate electricity at night or during heavy cloud cover."
  },
  {
    q: "True or False: Tidal energy is predictable and therefore more reliable than wind energy.",
    options: ["True", "False", "Only in the mountains", "Only during storms"],
    answer: 0,
    explanation: "True. Tidal movements are governed by celestial gravitational cycles and can be calculated years in advance, unlike wind."
  },
  {
    q: "Which energy store is tapped to generate electricity using wind turbines?",
    options: ["Chemical potential store", "Kinetic store of wind", "Thermal store", "Nuclear energy store"],
    answer: 1,
    explanation: "Wind turbines capture the kinetic store of moving air masses and transfer it into electrical energy through generators."
  },
  {
    q: "What is the initial energy store tapped in a coal-fired power station?",
    options: ["Chemical potential store", "Thermal store", "Kinetic store", "Gravitational potential store"],
    answer: 0,
    explanation: "Coal contains chemical potential store, which is released as thermal energy during combustion to boil water."
  },
  {
    q: "Which resource converts gravitational potential store directly to kinetic store, then electrical energy?",
    options: ["Wind energy", "Solar energy", "Hydropower", "Geothermal energy"],
    answer: 2,
    explanation: "Water stored high up behind a dam has a gravitational potential store. As it falls, it gains kinetic store to turn generators."
  },
  {
    q: "Why is geothermal energy considered renewable?",
    options: [
      "It uses burning wood.",
      "The heat from the Earth's core is continuously replenished by radioactive decay.",
      "It depends on sunlight.",
      "It requires wind."
    ],
    answer: 1,
    explanation: "Geothermal draws from the Earth's thermal store, which is continuously replenished by radioactive decay deep within the core."
  },
  {
    q: "Which of the following is a disadvantage of wind turbines?",
    options: [
      "They release carbon dioxide.",
      "They are highly predictable.",
      "They can cause visual and noise pollution, and impact local bird life.",
      "They require fuel combustion."
    ],
    answer: 2,
    explanation: "Wind turbines create noise and alter landscapes, and their rotating blades can pose hazards to birds and bats."
  },
  {
    q: "What energy store is tapped in biofuel generation?",
    options: ["Chemical potential store", "Thermal store of the Earth", "Nuclear energy store", "Kinetic store of water"],
    answer: 0,
    explanation: "Biofuels store energy chemically. Photosynthesis converts light to chemical potential store in plant matter, which is harvested."
  },
  {
    q: "Which energy resource does NOT trace its energy back to nuclear fusion in the Sun?",
    options: ["Fossil fuels", "Solar energy", "Wind energy", "Geothermal energy"],
    answer: 3,
    explanation: "Geothermal comes from the Earth's internal thermal store (nuclear decay). Fossil fuels (biomass), solar, and wind (atmospheric temperature differences) all trace back to the Sun."
  },
  {
    q: "Why is biofuel energy carbon-neutral in theory?",
    options: [
      "It does not contain carbon.",
      "Carbon dioxide released during burning equals carbon dioxide absorbed during crop growth.",
      "It is non-combustible.",
      "It does not release thermal energy."
    ],
    answer: 1,
    explanation: "Plants absorb carbon dioxide via photosynthesis while growing. Burning them releases the same amount back into the carbon cycle."
  },
  {
    q: "Which criterion describes a resource's capacity to maintain a stable, uninterrupted supply?",
    options: ["Cost", "Efficiency of energy transfer", "Reliability", "Environmental impact"],
    answer: 2,
    explanation: "Reliability is the measure of how consistent and dependable the energy source is, independent of time or weather."
  },
  {
    q: "A country with volcanic activity wants to minimize environmental impact and maximize reliability. Which is best?",
    options: ["Coal", "Solar energy", "Geothermal energy", "Wind energy"],
    answer: 2,
    explanation: "Geothermal taps the Earth's thermal store. It is extremely reliable (24/7) and has low environmental impact if volcanic sources are available."
  },
  {
    q: "In an O-level physics context, when energy is not useful, we say that energy is:",
    options: [
      "Lost forever.",
      "Wasted as heat.",
      "Dissipated to the surroundings as thermal energy.",
      "Destroyed."
    ],
    answer: 2,
    explanation: "According to the Principle of Conservation of Energy, energy cannot be created or destroyed. Unuseful energy is dissipated to surroundings as thermal energy."
  },
  {
    q: "Why is tidal energy intermittent even though it is predictable?",
    options: [
      "It depends on cloud cover.",
      "Tides only occur during daylight hours.",
      "High and low tides occur at specific cyclic times, meaning power is not generated continuously 24/7.",
      "Wind speeds vary over oceans."
    ],
    answer: 2,
    explanation: "Tidal power is cyclic (peaks during high/low flows). Thus, there are hours between tides when no energy is generated."
  }
];

// 4. Flashcards Database (20 Syllabus-Compliant Flashcards)
const flashcards = [
  {
    front: "Name two non-renewable energy resources.",
    back: "Fossil fuels (coal, oil, natural gas) and nuclear fuel."
  },
  {
    front: "Why is solar energy unreliable as a sole electricity source?",
    back: "Output depends on sunlight — unavailable at night and reduced on cloudy days."
  },
  {
    front: "Which renewable resource is most reliable regardless of weather?",
    back: "Hydropower and geothermal — not dependent on weather conditions."
  },
  {
    front: "What is the main environmental concern with fossil fuels?",
    back: "Burning fossil fuels releases carbon dioxide, contributing to global warming and climate change."
  },
  {
    front: "A country has fast-flowing rivers and mountains — which resource is most suitable?",
    back: "Hydropower — uses gravitational potential store of water to generate electricity reliably."
  },
  {
    front: "Why is nuclear power controversial despite high efficiency?",
    back: "It produces radioactive waste that is difficult to dispose of safely, and carries risk of catastrophic accidents."
  },
  {
    front: "What are the four criteria for evaluating energy resources?",
    back: "Efficiency of energy transfer, cost, reliability, environmental impact."
  },
  {
    front: "Define 'renewable energy resource'.",
    back: "An energy resource that is replenished naturally in a short period of time and is not depleted by use."
  },
  {
    front: "What energy store does wind possess?",
    back: "Kinetic store."
  },
  {
    front: "State the energy store of biofuel.",
    back: "Chemical potential store."
  },
  {
    front: "What energy store is tapped in nuclear reactors?",
    back: "Nuclear energy store."
  },
  {
    front: "Instead of saying energy is 'wasted' or 'lost', how should we state it?",
    back: "Energy is dissipated to the surroundings as non-useful thermal energy."
  },
  {
    front: "What is the environmental drawback of building huge reservoirs for hydropower?",
    back: "Large-scale flooding upstream ruins terrestrial ecosystems, destroys habitats, and displaces local communities."
  },
  {
    front: "Which renewable energy resource does NOT depend on solar radiation directly or indirectly?",
    back: "Tidal energy (gravitational pull of Moon/Sun) and Geothermal energy (Earth's thermal store)."
  },
  {
    front: "Why is biofuel considered carbon-neutral in theory?",
    back: "The carbon dioxide absorbed during crop growth matches the carbon dioxide released during combustion."
  },
  {
    front: "Why does wind energy have a low efficiency rating?",
    back: "A significant fraction of the wind's kinetic store bypasses the turbine blades without doing work."
  },
  {
    front: "What causes acid rain when burning coal?",
    back: "Combustion of coal releases sulfur dioxide, which reacts with rainwater to form sulfurous/sulfuric acid."
  },
  {
    front: "How does geothermal energy generate electricity?",
    back: "Taps thermal store of volcanic rocks to heat water into steam, which spins turbines and generators."
  },
  {
    front: "What is the primary drawback of tidal energy?",
    back: "High setup cost and is site-specific; can only be built in areas with large tidal ranges."
  },
  {
    front: "What are the three main fossil fuels?",
    back: "Coal, oil, and natural gas."
  }
];

// --- APP STATE ---
let currentTab = "intro";
let activeFilter = "all"; // 'all', 'renewable', 'non-renewable'
let activeHighlightCriterion = null; // criteria filter
let selectedResourcesForCompare = []; // comparison elements

let currentScenario = null;
let scenarioSelectedResource = null;

let quizQuestions = [];
let currentQuizIndex = 0;
let quizScore = 0;
let quizAnswersChecked = []; // tracks student answers and explanation triggers

let currentFlashcardIndex = 0;
let flashcardsShuffled = [];
let cardsReviewedCount = 0;
let cardsReviewedSet = new Set();

// --- CONFETTI ANIMATION SYSTEM ---
let animationFrameId = null;
function triggerCelebration() {
  const canvas = document.getElementById("confetti-canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ["#e6ff00", "#2eff77", "#00e5ff", "#ffffff"];
  const particles = [];

  for (let i = 0; i < 120; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      r: Math.random() * 6 + 4,
      d: Math.random() * canvas.height,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 5,
      tiltAngleIncremental: Math.random() * 0.07 + 0.02,
      tiltAngle: 0
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;

    particles.forEach((p, idx) => {
      p.tiltAngle += p.tiltAngleIncremental;
      p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
      p.x += Math.sin(p.tiltAngle);
      p.tilt = Math.sin(p.tiltAngle - idx / 3) * 15;

      if (p.y < canvas.height) {
        active = true;
      }

      ctx.beginPath();
      ctx.lineWidth = p.r;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
      ctx.stroke();
    });

    if (active) {
      animationFrameId = requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  draw();
}

// --- SANKEY DIAGRAM RENDERER ---
function generateSankeySVG(resourceId) {
  const res = resources.find(r => r.id === resourceId);
  if (!res) return "";

  const efficiencyPct = res.ratings.efficiency * 20; // 1 -> 20%, 5 -> 100%
  const dissipatedPct = 100 - efficiencyPct;
  
  // Height configurations
  const totalHeight = 120;
  const inputWidth = 35;
  const usefulWidth = (efficiencyPct / 100) * inputWidth;
  const dissipatedWidth = (dissipatedPct / 100) * inputWidth;

  const inputY = 40;
  const usefulY = 15;
  const dissipatedY = 85;

  // Paths
  // Total input goes from x=40 to x=110, then splits.
  // Useful goes up to x=220
  // Dissipated goes down to x=220
  
  const usefulPath = `
    M 90 ${inputY} 
    C 140 ${inputY}, 140 ${usefulY}, 200 ${usefulY}
    L 200 ${usefulY + usefulWidth}
    C 140 ${usefulY + usefulWidth}, 140 ${inputY + usefulWidth}, 90 ${inputY + usefulWidth}
    Z
  `;

  const dissipatedPath = `
    M 90 ${inputY + usefulWidth}
    C 130 ${inputY + usefulWidth}, 140 ${dissipatedY}, 200 ${dissipatedY}
    L 200 ${dissipatedY + dissipatedWidth}
    C 140 ${dissipatedY + dissipatedWidth}, 130 ${inputY + inputWidth}, 90 ${inputY + inputWidth}
    Z
  `;

  return `
    <svg viewBox="0 0 320 ${totalHeight}" width="100%" height="${totalHeight}">
      <!-- Background rails/labels -->
      
      <!-- Input flow bar -->
      <rect x="15" y="${inputY}" width="75" height="${inputWidth}" fill="#e6ff00" rx="3" opacity="0.85" />
      <text x="22" y="${inputY + 22}" fill="#090a0f" font-size="8" font-weight="700">INPUT ENERGY (100%)</text>
      
      <!-- Split links -->
      <path d="${usefulPath}" fill="#2eff77" opacity="0.75" />
      <path d="${dissipatedPath}" fill="#ff2a5f" opacity="0.65" />
      
      <!-- Useful electrical energy output -->
      <rect x="200" y="${usefulY}" width="105" height="${usefulWidth}" fill="#2eff77" rx="3" />
      <text x="204" y="${usefulY + Math.max(8, usefulWidth/2 + 3)}" fill="#090a0f" font-size="7" font-weight="700">USEFUL ELEC. (${efficiencyPct}%)</text>
      
      <!-- Dissipated Thermal Energy -->
      <rect x="200" y="${dissipatedY}" width="105" height="${dissipatedWidth}" fill="#ff2a5f" rx="3" />
      <text x="204" y="${dissipatedY + Math.max(8, dissipatedWidth/2 + 3)}" fill="#ffffff" font-size="7" font-weight="600">DISSIPATED THERMAL (${dissipatedPct}%)</text>
    </svg>
  `;
}

// --- INTERACTIVE NAVIGATION & TABS ---
function switchTab(tabId) {
  currentTab = tabId;
  document.querySelectorAll(".app-section").forEach(sec => sec.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach(btn => btn.classList.remove("active"));
  
  const targetSection = document.getElementById(`section-${tabId}`);
  const targetBtn = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
  
  if (targetSection) targetSection.classList.add("active");
  if (targetBtn) targetBtn.classList.add("active");

  // Load context triggers
  if (tabId === "scenarios") {
    loadScenario();
  } else if (tabId === "quiz") {
    resetQuiz();
  } else if (tabId === "flashcards") {
    resetFlashcards();
  }
  
  window.scrollTo(0, 0);
}

// --- SECTION 1: CONCEPT INTRO ---
function renderConceptIntro() {
  const nonRenewableTags = resources.filter(r => r.type === "non-renewable").map(r => `<span class="resource-tag">${r.name}</span>`).join("");
  const renewableTags = resources.filter(r => r.type === "renewable").map(r => `<span class="resource-tag">${r.name}</span>`).join("");

  document.getElementById("non-renewable-list").innerHTML = nonRenewableTags;
  document.getElementById("renewable-list").innerHTML = renewableTags;
}

// --- SECTION 2: COMPARISON MATRIX ---
function renderComparisonMatrix() {
  const container = document.getElementById("matrix-table-container");
  
  // Filter resources based on type
  const filteredResources = resources.filter(res => {
    if (activeFilter === "renewable") return res.type === "renewable";
    if (activeFilter === "non-renewable") return res.type === "non-renewable";
    return true;
  });

  let html = `<table class="comparison-table"><thead><tr><th>Criteria</th>`;
  
  filteredResources.forEach(res => {
    const isSelected = selectedResourcesForCompare.includes(res.id);
    const selClass = isSelected ? (selectedResourcesForCompare.indexOf(res.id) === 0 ? "selected-1" : "selected-2") : "";
    html += `<th class="resource-header-cell ${selClass}" onclick="toggleResourceSelection('${res.id}')">
      <div>${res.name}</div>
      <span class="tag">${res.type}</span>
    </th>`;
  });
  html += `</tr></thead><tbody>`;

  // Criteria rows
  Object.keys(criteriaInfo).forEach(critKey => {
    const isCritActive = activeHighlightCriterion === critKey;
    html += `<tr class="${isCritActive ? 'row-highlight' : ''}">
      <th onclick="toggleCriterionHighlight('${critKey}')" style="cursor:pointer; text-decoration: underline; text-decoration-color: var(--accent-yellow);">
        ${criteriaInfo[critKey].icon} ${criteriaInfo[critKey].title}
      </th>`;
      
    filteredResources.forEach(res => {
      const rating = res.ratings[critKey];
      let ratingClass = "filled-medium";
      if (rating >= 4) ratingClass = "filled-high";
      if (rating <= 2) ratingClass = "filled-low";

      // Highlight best resources for this criterion
      let isHighScoring = false;
      if (isCritActive) {
        const maxVal = Math.max(...filteredResources.map(r => r.ratings[critKey]));
        if (rating === maxVal) isHighScoring = true;
      }

      html += `<td class="${isHighScoring ? 'highlight' : ''}">
        <div class="rating-meter">`;
        for (let i = 1; i <= 5; i++) {
          html += `<div class="rating-bar ${i <= rating ? ratingClass : ''}"></div>`;
        }
      html += `</div>
        <div class="cell-comment">${res.explanations[critKey]}</div>
      </td>`;
    });
    html += `</tr>`;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;

  // Render selector grid for side-by-side selection
  const gridContainer = document.getElementById("selection-grid-container");
  let gridHtml = "";
  resources.forEach(res => {
    const idx = selectedResourcesForCompare.indexOf(res.id);
    let selClass = "";
    if (idx === 0) selClass = "selected selected-1";
    else if (idx === 1) selClass = "selected selected-2";

    gridHtml += `
      <button class="select-resource-btn ${selClass}" onclick="toggleResourceSelection('${res.id}')">
        <span>${res.displayType}</span>
      </button>
    `;
  });
  gridContainer.innerHTML = gridHtml;

  // Render Side by Side details panel
  renderSBSPanel();
}

function toggleFilter(type) {
  activeFilter = type;
  document.querySelectorAll("#comparison-filter-bar .filter-btn").forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-filter") === type);
  });
  renderComparisonMatrix();
}

function toggleCriterionHighlight(critKey) {
  if (activeHighlightCriterion === critKey) {
    activeHighlightCriterion = null;
  } else {
    activeHighlightCriterion = critKey;
  }
  renderComparisonMatrix();
}

function toggleResourceSelection(resId) {
  const index = selectedResourcesForCompare.indexOf(resId);
  if (index > -1) {
    selectedResourcesForCompare.splice(index, 1);
  } else {
    if (selectedResourcesForCompare.length >= 2) {
      selectedResourcesForCompare.shift(); // Remove first selected
    }
    selectedResourcesForCompare.push(resId);
  }
  renderComparisonMatrix();
}

function renderSBSPanel() {
  const panel = document.getElementById("side-by-side-panel");
  if (selectedResourcesForCompare.length < 2) {
    panel.style.display = "none";
    return;
  }
  
  panel.style.display = "block";
  const resA = resources.find(r => r.id === selectedResourcesForCompare[0]);
  const resB = resources.find(r => r.id === selectedResourcesForCompare[1]);
  
  document.getElementById("sbs-res-a-name").innerText = resA.name;
  document.getElementById("sbs-res-b-name").innerText = resB.name;
  
  const contentGrid = document.getElementById("sbs-content-grid");
  let html = "";

  Object.keys(criteriaInfo).forEach(critKey => {
    const crit = criteriaInfo[critKey];
    
    // Ratings formatting
    const rA = resA.ratings[critKey];
    const rB = resB.ratings[critKey];
    
    let clsA = rA >= 4 ? "filled-high" : (rA <= 2 ? "filled-low" : "filled-medium");
    let clsB = rB >= 4 ? "filled-high" : (rB <= 2 ? "filled-low" : "filled-medium");
    
    let starsA = "", starsB = "";
    for(let i=1; i<=5; i++) {
      starsA += `<div class="rating-bar ${i <= rA ? clsA : ''}"></div>`;
      starsB += `<div class="rating-bar ${i <= rB ? clsB : ''}"></div>`;
    }

    html += `
      <div class="sbs-row">
        <div class="sbs-row-title">${crit.icon} ${crit.title}</div>
        <div class="sbs-comparison-columns">
          <div class="sbs-column col-a">
            <span class="sbs-column-name">${resA.name}</span>
            <div class="rating-meter">${starsA}</div>
            <div class="cell-comment">${resA.explanations[critKey]}</div>
          </div>
          <div class="sbs-column col-b">
            <span class="sbs-column-name">${resB.name}</span>
            <div class="rating-meter">${starsB}</div>
            <div class="cell-comment">${resB.explanations[critKey]}</div>
          </div>
        </div>
      </div>
    `;
  });
  
  contentGrid.innerHTML = html;
}

function closeSBSPanel() {
  selectedResourcesForCompare = [];
  renderComparisonMatrix();
}

// --- SECTION 3: DECISION-MAKING SCENARIOS ---
function loadScenario() {
  scenarioSelectedResource = null;
  document.getElementById("scenario-feedback-container").innerHTML = "";
  
  // Select random location
  const loc = locations[Math.floor(Math.random() * locations.length)];
  
  // Select random primary constraint
  const pConst = constraints[Math.floor(Math.random() * constraints.length)];
  
  // Select random secondary constraint (different from primary)
  let sConst;
  do {
    sConst = constraints[Math.floor(Math.random() * constraints.length)];
  } while (sConst.id === pConst.id);

  currentScenario = {
    location: loc,
    primary: pConst,
    secondary: sConst
  };

  // Render context details
  document.getElementById("scenario-context-text").innerText = loc.name;
  document.getElementById("scenario-context-desc").innerText = loc.description;
  
  document.getElementById("primary-constraint-tag").innerHTML = `⚡ Primary: ${pConst.label}`;
  document.getElementById("secondary-constraint-tag").innerHTML = `🔒 Secondary: ${sConst.label}`;

  // Render resource pick buttons
  const optionsGrid = document.getElementById("scenario-options-grid");
  let optionsHtml = "";
  resources.forEach(res => {
    optionsHtml += `
      <button class="scenario-btn" onclick="submitScenarioSelection('${res.id}', this)">
        ${res.name}
      </button>
    `;
  });
  optionsGrid.innerHTML = optionsHtml;
}

function submitScenarioSelection(resourceId, clickedBtn) {
  if (scenarioSelectedResource) return; // Prevent double submission
  
  scenarioSelectedResource = resourceId;
  
  // Calculate best-fit energy resource based on scenario matching algorithm
  let bestResource = null;
  let highestScore = -999;
  let scores = {};

  resources.forEach(res => {
    const baseMod = currentScenario.location.modifiers[res.id] !== undefined ? currentScenario.location.modifiers[res.id] : 2;
    const priRating = res.ratings[currentScenario.primary.criteriaKey];
    const secRating = res.ratings[currentScenario.secondary.criteriaKey];

    // Total weighted score
    const totalScore = baseMod * 2 + priRating * currentScenario.primary.weight + secRating * currentScenario.secondary.weight;
    scores[res.id] = totalScore;

    if (totalScore > highestScore) {
      highestScore = totalScore;
      bestResource = res.id;
    }
  });

  const isCorrect = (resourceId === bestResource);
  const selectedRes = resources.find(r => r.id === resourceId);
  const correctRes = resources.find(r => r.id === bestResource);

  // Apply colors to buttons
  const btns = document.querySelectorAll(".scenario-btn");
  btns.forEach(btn => {
    const resName = btn.innerText.trim();
    const res = resources.find(r => r.name === resName);
    if (res.id === bestResource) {
      btn.classList.add("correct");
    } else if (res.id === resourceId && !isCorrect) {
      btn.classList.add("incorrect");
    }
  });

  const feedbackContainer = document.getElementById("scenario-feedback-container");
  
  // Build justifications
  let correctExplanation = "";
  if (isCorrect) {
    correctExplanation = `Excellent decision! **${selectedRes.name}** perfectly satisfies the requirements:
      <ul>
        <li>**Location Compatibility**: ${currentScenario.location.description} (Suitability index: ${currentScenario.location.modifiers[selectedRes.id]}/5).</li>
        <li>**Primary Constraint (${currentScenario.primary.label})**: Rated ${selectedRes.ratings[currentScenario.primary.criteriaKey]}/5 (${selectedRes.explanations[currentScenario.primary.criteriaKey]}).</li>
        <li>**Secondary Constraint (${currentScenario.secondary.label})**: Rated ${selectedRes.ratings[currentScenario.secondary.criteriaKey]}/5 (${selectedRes.explanations[currentScenario.secondary.criteriaKey]}).</li>
      </ul>`;
      triggerCelebration();
  } else {
    correctExplanation = `**Incorrect selection.** Although ${selectedRes.name} was chosen, **${correctRes.name}** is the best fit for this scenario.
      <ul>
        <li>**Location Suitability**: ${correctRes.name} scores ${currentScenario.location.modifiers[correctRes.id]}/5 for this context compared to ${selectedRes.name}'s score of ${currentScenario.location.modifiers[selectedRes.id]}/5.</li>
        <li>**Primary Constraint (${currentScenario.primary.label})**: ${correctRes.name} is rated ${correctRes.ratings[currentScenario.primary.criteriaKey]}/5 vs ${selectedRes.name}'s rating of ${selectedRes.ratings[currentScenario.primary.criteriaKey]}/5.</li>
      </ul>`;
  }

  // Generate Sankey diagrams
  const sankeyHTML = `
    <div class="sankey-container">
      <div class="sankey-title">Sankey Energy Flow: ${selectedRes.name}</div>
      ${generateSankeySVG(selectedRes.id)}
      <div style="font-size: 0.75rem; margin-top: 8px; color: var(--text-muted);">
        The width of the arrows represents the amount of energy transferred per unit time. The initial energy is stored in the <strong>${selectedRes.energyStore}</strong>. During operation, ${100 - (selectedRes.ratings.efficiency * 20)}% of the input energy is dissipated to the surroundings as non-useful thermal energy.
      </div>
    </div>
  `;

  feedbackContainer.innerHTML = `
    <div class="feedback-box ${isCorrect ? 'correct' : 'incorrect'}">
      <div class="feedback-status ${isCorrect ? 'correct' : 'incorrect'}">
        ${isCorrect ? '🎉 Correct Match!' : '❌ Incorrect Match'}
      </div>
      <div class="feedback-explanation">
        ${correctExplanation}
      </div>
      ${sankeyHTML}
    </div>
  `;
}

// --- SECTION 4 & 5: QUIZ & SCORING ---
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function resetQuiz() {
  quizQuestions = shuffleArray(quizPool).slice(0, 15);
  currentQuizIndex = 0;
  quizScore = 0;
  quizAnswersChecked = [];
  
  // Show quiz card, hide results
  document.getElementById("quiz-play-card").style.display = "block";
  document.getElementById("quiz-results-card").style.display = "none";
  
  showQuizQuestion();
}

function showQuizQuestion() {
  if (currentQuizIndex >= quizQuestions.length) {
    showQuizResults();
    return;
  }

  const qData = quizQuestions[currentQuizIndex];
  
  // Progress Bar
  const progPct = (currentQuizIndex / quizQuestions.length) * 100;
  document.getElementById("quiz-prog-inner").style.style = `width: ${progPct}%`;
  document.getElementById("quiz-prog-inner").style.width = `${progPct}%`;
  document.getElementById("quiz-current-num").innerText = currentQuizIndex + 1;
  document.getElementById("quiz-total-num").innerText = quizQuestions.length;

  document.getElementById("quiz-q-text").innerText = qData.q;
  
  // Options
  const optionsBox = document.getElementById("quiz-options-box");
  optionsBox.innerHTML = "";
  
  // Clean explanation box
  document.getElementById("quiz-explanation-container").innerHTML = "";

  qData.options.forEach((opt, idx) => {
    optionsBox.innerHTML += `
      <button class="quiz-option-btn" onclick="selectQuizOption(${idx})">
        <span>${opt}</span>
      </button>
    `;
  });
}

function selectQuizOption(selectedIdx) {
  const qData = quizQuestions[currentQuizIndex];
  const btns = document.querySelectorAll(".quiz-option-btn");
  
  // Prevent double click
  if (quizAnswersChecked[currentQuizIndex] !== undefined) return;
  
  quizAnswersChecked[currentQuizIndex] = selectedIdx;
  const isCorrect = (selectedIdx === qData.answer);
  
  if (isCorrect) {
    quizScore++;
    btns[selectedIdx].classList.add("correct");
    triggerCelebration();
  } else {
    btns[selectedIdx].classList.add("incorrect");
    btns[qData.answer].classList.add("correct");
  }

  // Display explanation inline
  const expBox = document.getElementById("quiz-explanation-container");
  expBox.innerHTML = `
    <div class="quiz-explanation-box">
      <strong>Explanation:</strong> ${qData.explanation}
    </div>
  `;

  // Autoplay delay or show next button
  setTimeout(() => {
    currentQuizIndex++;
    showQuizQuestion();
  }, 3500);
}

function showQuizResults() {
  document.getElementById("quiz-play-card").style.display = "none";
  document.getElementById("quiz-results-card").style.display = "block";
  
  // Update Score Card
  document.getElementById("results-score-num").innerText = quizScore;
  
  const title = document.getElementById("results-status-title");
  const desc = document.getElementById("results-status-desc");
  
  if (quizScore >= 13) {
    title.innerText = "Energy Strategist! 🌍";
    title.style.color = "var(--rating-high)";
    desc.innerText = "Phenomenal score! You have masterfully synthesized the O-level physics concepts, trade-offs, and environmental requirements.";
    triggerCelebration();
  } else if (quizScore >= 9) {
    title.innerText = "Good Effort!";
    title.style.color = "var(--rating-medium)";
    desc.innerText = "Revisit the comparison table and review your reasoning to perfect your energy concepts.";
  } else {
    title.innerText = "Needs Review";
    title.style.color = "var(--rating-low)";
    desc.innerText = "Go back to the comparison table and decision-making scenarios before retrying the quiz.";
  }

  // Render Per-Question Summary & Feedback
  const summaryBox = document.getElementById("quiz-review-summary");
  summaryBox.innerHTML = "";
  
  quizQuestions.forEach((qData, idx) => {
    const studentAns = quizAnswersChecked[idx];
    const isCorrect = (studentAns === qData.answer);
    
    summaryBox.innerHTML += `
      <div class="review-item">
        <div class="review-q">${idx + 1}. ${qData.q}</div>
        <div class="review-answers">
          ${!isCorrect ? `<div class="review-wrong-ans">❌ Your answer: ${qData.options[studentAns]}</div>` : ''}
          <div class="review-correct-ans">✅ Correct: ${qData.options[qData.answer]}</div>
        </div>
        <div class="review-exp">${qData.explanation}</div>
      </div>
    `;
  });
}

// --- SECTION 6: FLASHCARDS ---
function resetFlashcards() {
  flashcardsShuffled = shuffleArray(flashcards);
  currentFlashcardIndex = 0;
  cardsReviewedCount = 0;
  cardsReviewedSet.clear();
  
  document.getElementById("flashcards-reviewed").innerText = 0;
  document.getElementById("flashcards-total").innerText = flashcards.length;
  
  showFlashcard();
}

function showFlashcard() {
  const cardArea = document.getElementById("flashcard-item");
  cardArea.classList.remove("flipped");
  
  const cardData = flashcardsShuffled[currentFlashcardIndex];
  
  document.getElementById("card-front-content").innerText = cardData.front;
  document.getElementById("card-back-content").innerText = cardData.back;

  // Track review state
  if (!cardsReviewedSet.has(currentFlashcardIndex)) {
    cardsReviewedSet.add(currentFlashcardIndex);
    cardsReviewedCount = cardsReviewedSet.size;
    document.getElementById("flashcards-reviewed").innerText = cardsReviewedCount;
  }
}

function flipFlashcard() {
  const cardArea = document.getElementById("flashcard-item");
  cardArea.classList.toggle("flipped");
}

function nextFlashcard() {
  currentFlashcardIndex = (currentFlashcardIndex + 1) % flashcardsShuffled.length;
  showFlashcard();
}

function shuffleFlashcardDeck() {
  resetFlashcards();
}

// --- INITIALIZE APP ---
window.addEventListener("DOMContentLoaded", () => {
  renderConceptIntro();
  renderComparisonMatrix();
  
  // Hook navigation handlers
  document.querySelectorAll(".nav-item").forEach(item => {
    item.addEventListener("click", () => {
      switchTab(item.getAttribute("data-tab"));
    });
  });
});
