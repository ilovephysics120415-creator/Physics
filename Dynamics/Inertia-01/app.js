// -------------------------------------------------------------------
// STATE MANAGEMENT & DATA UTILS
// -------------------------------------------------------------------

const state = {
  activeTab: 'explore',
  scores: {
    scenarios: 0,
    massQuiz: 0,
    conceptQuiz: 0
  },
  
  // Section 1: Explore State
  sim: {
    running: false,
    braking: false,
    car: {
      mass: 1000,
      acceleration: 5.0,
      position: 0, // percentage of lane width
      velocity: 0,
      stopDistance: 0
    },
    truck: {
      mass: 5000,
      acceleration: 1.0,
      position: 0,
      velocity: 0,
      stopDistance: 0
    },
    force: 5000,
    animationFrameId: null,
    startTime: null
  },

  // Section 2: Scenarios State
  scenarios: {
    pool: [],
    currentIdx: 0,
    active: null,
    answered: false
  },

  // Section 3: Mass Quiz State
  massQuiz: {
    questions: [],
    currentIdx: 0,
    active: null,
    answered: false
  },

  // Section 4: Concept Quiz State
  conceptQuiz: {
    pool: [],
    questions: [],
    currentIdx: 0,
    active: null,
    answered: false
  }
};

// -------------------------------------------------------------------
// SCENARIOS & CONCEPT QUESTIONS POOLS
// -------------------------------------------------------------------

const SCENARIOS_DATA = [
  {
    id: 1,
    title: "The Tablecloth Trick",
    description: "A magician pulls a tablecloth quickly from under dishes on a table. The dishes barely move.",
    question: "Why do the dishes stay on the table?",
    options: [
      { text: "A — The dishes are glued to the table", isCorrect: false },
      { text: "B — The dishes have inertia and resist the sudden change in motion", isCorrect: true },
      { text: "C — Friction holds the dishes in place", isCorrect: false },
      { text: "D — The tablecloth pushes the dishes back", isCorrect: false }
    ],
    explanation: "The dishes have inertia. When the tablecloth is pulled quickly, the dishes tend to remain in their state of rest. The force acts for too short a time to significantly change the dishes' motion.",
    renderAnimation: (stage, timePercent) => {
      const width = stage.clientWidth;
      const height = stage.clientHeight;
      const clothOffset = timePercent < 40 ? 0 : (timePercent - 40) * 4;
      const dishWobble = timePercent < 45 ? 0 : Math.sin((timePercent - 45) * 0.5) * 2;
      
      stage.innerHTML = `
        <svg width="100%" height="100%" viewBox="0 0 400 200">
          <rect x="80" y="120" width="240" height="20" fill="#8d6e63" stroke="#000" stroke-width="3"/>
          <rect x="100" y="140" width="20" height="60" fill="#70554b" stroke="#000" stroke-width="3"/>
          <rect x="280" y="140" width="20" height="60" fill="#70554b" stroke="#000" stroke-width="3"/>
          <path d="M ${100 + clothOffset} 118 L ${300 + clothOffset} 118 L ${310 + clothOffset} 150 L ${312 + clothOffset} 150 L ${302 + clothOffset} 118 Z" fill="#ffffff" stroke="#000" stroke-width="2"/>
          <ellipse cx="${200 + dishWobble}" cy="110" rx="25" ry="6" fill="#e0e0e0" stroke="#000" stroke-width="2"/>
          <path d="M ${190 + dishWobble} 108 L ${192 + dishWobble} 90 L ${208 + dishWobble} 90 L ${210 + dishWobble} 108 Z" fill="#ffd700" stroke="#000" stroke-width="2"/>
          <path d="M ${208 + dishWobble} 93 A 5 5 0 0 1 ${215 + dishWobble} 98 A 5 5 0 0 1 ${208 + dishWobble} 103" fill="none" stroke="#000" stroke-width="2"/>
          ${timePercent > 35 && timePercent < 75 ? `
            <line x1="330" y1="125" x2="360" y2="125" stroke="#ff0000" stroke-width="3" stroke-dasharray="5 5"/>
            <line x1="320" y1="135" x2="350" y2="135" stroke="#ff0000" stroke-width="3" stroke-dasharray="5 5"/>
          ` : ''}
        </svg>
      `;
    }
  },
  {
    id: 2,
    title: "Passengers Lurch Forward When Bus Brakes",
    description: "A bus brakes suddenly. Passengers who are standing lurch forward.",
    question: "Why do the passengers lurch forward?",
    options: [
      { text: "A — A forward force pushes them", isCorrect: false },
      { text: "B — Their inertia keeps them moving forward when the bus stops", isCorrect: true },
      { text: "C — Gravity pulls them forward", isCorrect: false },
      { text: "D — The bus floor pushes them forward", isCorrect: false }
    ],
    explanation: "When the bus brakes, the passengers' bodies tend to continue moving forward due to inertia. Their feet stop with the bus but their upper body keeps moving forward until another force (seatbelt, handrail) stops them.",
    renderAnimation: (stage, timePercent) => {
      const isBraking = timePercent >= 45;
      const angle = timePercent < 45 ? 0 : Math.min(25, (timePercent - 45) * 1.5);
      const busPos = timePercent < 45 ? (timePercent / 45) * 100 : 100 + Math.sin((timePercent - 45) * 0.05) * 10;
      
      stage.innerHTML = `
        <svg width="100%" height="100%" viewBox="0 0 400 200">
          <g transform="translate(${(busPos * 1.2) - 100}, 0)">
            <rect x="50" y="40" width="200" height="100" fill="#29b6f6" stroke="#000" stroke-width="3" rx="10"/>
            <rect x="210" y="50" width="30" height="40" fill="#e0f7fa" stroke="#000" stroke-width="2"/>
            <rect x="160" y="50" width="30" height="40" fill="#e0f7fa" stroke="#000" stroke-width="2"/>
            <rect x="110" y="50" width="30" height="40" fill="#e0f7fa" stroke="#000" stroke-width="2"/>
            <rect x="60" y="50" width="30" height="40" fill="#e0f7fa" stroke="#000" stroke-width="2"/>
            <circle cx="90" cy="140" r="16" fill="#333" stroke="#fff" stroke-width="2"/>
            <circle cx="210" cy="140" r="16" fill="#333" stroke="#fff" stroke-width="2"/>
            <line x1="75" y1="50" x2="225" y2="50" stroke="#000" stroke-width="3"/>
            <line x1="125" y1="50" x2="125" y2="65" stroke="#000" stroke-width="2"/>
            <circle cx="125" cy="68" r="4" fill="none" stroke="#000" stroke-width="1.5"/>
            <g transform="translate(120, 110) rotate(${angle}, 5, 30)">
              <line x1="5" y1="30" x2="5" y2="0" stroke="#ff5722" stroke-width="5" stroke-linecap="round"/>
              <line x1="5" y1="10" x2="5" y2="-30" stroke="#ff5722" stroke-width="4" stroke-linecap="round"/>
              <circle cx="5" cy="-8" r="7" fill="#ffcc80" stroke="#000" stroke-width="1.5"/>
            </g>
            ${isBraking ? `<text x="210" y="30" fill="#ff4d4d" font-weight="bold" font-size="14" font-family="Space Grotesk">SCREECH!</text>` : ''}
          </g>
        </svg>
      `;
    }
  },
  {
    id: 3,
    title: "Hammer Head Tightening",
    description: "A carpenter tightens a loose hammer head by hitting the handle end on a hard surface.",
    question: "Why does the hammer head slide onto the handle?",
    options: [
      { text: "A — Gravity pulls the head down", isCorrect: false },
      { text: "B — The head has inertia and continues moving down when the handle stops", isCorrect: true },
      { text: "C — The handle pushes the head up", isCorrect: false },
      { text: "D — Friction pulls the head down", isCorrect: false }
    ],
    explanation: "When the handle hits the surface and stops suddenly, the hammer head tends to continue moving downward due to inertia. This drives the head further onto the handle, tightening it.",
    renderAnimation: (stage, timePercent) => {
      const startY = 20;
      const hitY = 110;
      const isHit = timePercent >= 50;
      const currentY = timePercent < 50 ? startY + (timePercent / 50) * (hitY - startY) : hitY;
      const headOffset = timePercent < 50 ? 0 : Math.min(25, (timePercent - 50) * 1.2);
      
      stage.innerHTML = `
        <svg width="100%" height="100%" viewBox="0 0 400 200">
          <rect x="100" y="160" width="200" height="15" fill="#555" stroke="#000" stroke-width="2"/>
          <g transform="translate(180, ${currentY})">
            <rect x="15" y="-10" width="10" height="60" fill="#d7ccc8" stroke="#000" stroke-width="2" rx="2"/>
            <g transform="translate(0, ${headOffset})">
              <rect x="0" y="0" width="40" height="20" fill="#78909c" stroke="#000" stroke-width="2" rx="3"/>
              <path d="M 0 0 L -10 10 L 0 20 Z" fill="#78909c" stroke="#000" stroke-width="2"/>
            </g>
          </g>
          ${isHit && timePercent < 75 ? `
            <path d="M 180 155 L 170 145 M 220 155 L 230 145 M 200 155 L 200 142" stroke="#ffd700" stroke-width="3" stroke-linecap="round"/>
          ` : ''}
        </svg>
      `;
    }
  },
  {
    id: 4,
    title: "Coins on a Card on a Glass",
    description: "A card is placed on top of a glass. A coin is placed on the card. The card is flicked away quickly. The coin drops into the glass.",
    question: "Why does the coin fall into the glass instead of flying off with the card?",
    options: [
      { text: "A — The coin is too heavy to move", isCorrect: false },
      { text: "B — The coin has inertia and stays in place when the card is removed", isCorrect: true },
      { text: "C — Gravity pulls the coin faster than the card", isCorrect: false },
      { text: "D — The glass attracts the coin", isCorrect: false }
    ],
    explanation: "The coin has inertia and resists the sudden change in motion. When the card is flicked away quickly, the coin remains in its state of rest and drops straight down into the glass due to gravity.",
    renderAnimation: (stage, timePercent) => {
      const cardX = timePercent < 40 ? 120 : 120 + (timePercent - 40) * 8;
      let coinX = 200;
      let coinY = 90;
      
      if (timePercent >= 40 && timePercent < 60) {
        // Coin waiting
      } else if (timePercent >= 60) {
        coinY = 90 + Math.min(60, (timePercent - 60) * 3);
      }
      
      stage.innerHTML = `
        <svg width="100%" height="100%" viewBox="0 0 400 200">
          <path d="M 170 100 L 175 160 L 225 160 L 230 100 Z" fill="none" stroke="#ffffff" stroke-width="3" stroke-dasharray="1 1"/>
          <ellipse cx="200" cy="100" rx="30" ry="8" fill="rgba(255,255,255,0.1)" stroke="#ffffff" stroke-width="2"/>
          <ellipse cx="200" cy="160" rx="25" ry="6" fill="rgba(255,255,255,0.1)" stroke="#ffffff" stroke-width="2"/>
          <rect x="${cardX}" y="88" width="160" height="6" fill="#ff4d4d" stroke="#000" stroke-width="2" rx="2"/>
          <circle cx="${coinX}" cy="${coinY}" r="10" fill="#ffd700" stroke="#000" stroke-width="2"/>
          <circle cx="${coinX}" cy="${coinY}" r="6" fill="none" stroke="#e6c200" stroke-width="1"/>
          ${timePercent > 30 && timePercent < 55 ? `
            <path d="M 90 120 C 110 110 125 95 130 95" fill="none" stroke="#ffcc80" stroke-width="8" stroke-linecap="round"/>
            <circle cx="130" cy="95" r="7" fill="#ffcc80"/>
            <path d="M 125 85 L 115 80 M 135 85 L 145 80" stroke="#ffd700" stroke-width="2"/>
          ` : ''}
        </svg>
      `;
    }
  },
  {
    id: 5,
    title: "Heavy Truck vs Small Car — Emergency Stop",
    description: "A truck and a car travel at the same speed. Both apply maximum brakes at the same time.",
    question: "Which vehicle stops first and why?",
    options: [
      { text: "A — The truck, because it has more powerful brakes", isCorrect: false },
      { text: "B — The car, because it has less mass and therefore less inertia", isCorrect: true },
      { text: "C — Both stop at the same time, same speed", isCorrect: false },
      { text: "D — The truck, because it has more momentum", isCorrect: false }
    ],
    explanation: "The car has less mass, so less inertia. With the same braking force, the car decelerates faster (a = F/m) and stops in a shorter distance. The truck's greater inertia means it resists the change in motion more.",
    renderAnimation: (stage, timePercent) => {
      let carX = 100;
      let truckX = 100;
      
      if (timePercent < 30) {
        carX = 50 + (timePercent / 30) * 60;
      } else if (timePercent < 60) {
        const brakeT = (timePercent - 30) / 30;
        carX = 110 + brakeT * (2 - brakeT) * 70;
      } else {
        carX = 250;
      }
      
      if (timePercent < 30) {
        truckX = 50 + (timePercent / 30) * 60;
      } else if (timePercent < 95) {
        const brakeT = (timePercent - 30) / 65;
        truckX = 110 + brakeT * (2 - brakeT) * 170;
      } else {
        truckX = 350;
      }
      
      stage.innerHTML = `
        <svg width="100%" height="100%" viewBox="0 0 400 200">
          <line x1="20" y1="90" x2="380" y2="90" stroke="#444" stroke-width="2"/>
          <line x1="20" y1="160" x2="380" y2="160" stroke="#444" stroke-width="2"/>
          <text x="20" y="40" fill="#fff" font-size="10">CAR (Less Inertia)</text>
          <text x="20" y="115" fill="#fff" font-size="10">TRUCK (More Inertia)</text>
          <g transform="translate(${carX - 40}, 50)">
            <rect x="0" y="15" width="50" height="18" fill="#ff4d4d" stroke="#000" stroke-width="1.5" rx="3"/>
            <rect x="15" y="5" width="20" height="10" fill="#e0f7fa" stroke="#000" stroke-width="1.5"/>
            <circle cx="12" cy="33" r="5" fill="#222"/>
            <circle cx="38" cy="33" r="5" fill="#222"/>
            ${timePercent >= 30 && timePercent < 60 ? '<path d="M -5 20 L -15 20" stroke="#ff4d4d" stroke-width="2"/>' : ''}
          </g>
          <g transform="translate(${truckX - 50}, 118)">
            <rect x="0" y="8" width="60" height="25" fill="#ffd700" stroke="#000" stroke-width="1.5" rx="2"/>
            <rect x="42" y="12" width="14" height="10" fill="#e0f7fa" stroke="#000" stroke-width="1"/>
            <circle cx="15" cy="33" r="6" fill="#222"/>
            <circle cx="45" cy="33" r="6" fill="#222"/>
            ${timePercent >= 30 && timePercent < 95 ? '<path d="M -5 25 L -20 25" stroke="#ff4d4d" stroke-width="3"/>' : ''}
          </g>
        </svg>
      `;
    }
  },
  {
    id: 6,
    title: "Astronaut in Space Pushing a Boulder",
    description: "An astronaut in space pushes a large boulder. The boulder barely moves but the astronaut shoots backward.",
    question: "Why does the boulder barely move even though there is no gravity in space?",
    options: [
      { text: "A — Space has no air so nothing can move", isCorrect: false },
      { text: "B — The boulder has large mass and therefore large inertia, resisting the push", isCorrect: true },
      { text: "C — The boulder is attached to something", isCorrect: false },
      { text: "D — Forces do not work in space", isCorrect: false }
    ],
    explanation: "Inertia depends on mass, not gravity. Even in space, the boulder's large mass gives it large inertia. It resists the change in motion. The astronaut, having much less mass, accelerates backward more easily (Newton's 3rd Law).",
    renderAnimation: (stage, timePercent) => {
      let astroX = 160;
      let boulderX = 220;
      
      if (timePercent > 30) {
        const t = (timePercent - 30) / 70;
        astroX = 160 - t * 110;
        boulderX = 220 + t * 15;
      }
      
      stage.innerHTML = `
        <svg width="100%" height="100%" viewBox="0 0 400 200">
          <defs>
            <radialGradient id="space-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#111222"/>
              <stop offset="100%" stop-color="#050508"/>
            </radialGradient>
          </defs>
          <rect width="400" height="200" fill="url(#space-grad)"/>
          <circle cx="50" cy="40" r="1" fill="#fff"/>
          <circle cx="320" cy="50" r="1.5" fill="#fff"/>
          <circle cx="280" cy="150" r="1" fill="#fff"/>
          <circle cx="100" cy="170" r="2" fill="#ffd700"/>
          <g transform="translate(${boulderX}, 100)">
            <circle cx="0" cy="0" r="35" fill="#757575" stroke="#000" stroke-width="2"/>
            <circle cx="-10" cy="-10" r="8" fill="#616161"/>
            <circle cx="12" cy="12" r="6" fill="#616161"/>
            <text x="-25" y="5" fill="#fff" font-weight="bold" font-size="10">MASSIVE</text>
          </g>
          <g transform="translate(${astroX}, 100)">
            <rect x="-15" y="-20" width="30" height="40" fill="#eceff1" stroke="#000" stroke-width="2" rx="8"/>
            <circle cx="0" cy="-28" r="12" fill="#cfd8dc" stroke="#000" stroke-width="2"/>
            <ellipse cx="0" cy="-28" rx="8" ry="6" fill="#00e5ff"/>
            <line x1="-15" y1="-5" x2="-25" y2="-10" stroke="#eceff1" stroke-width="6" stroke-linecap="round"/>
            <line x1="15" y1="-5" x2="25" y2="-10" stroke="#eceff1" stroke-width="6" stroke-linecap="round"/>
          </g>
          ${timePercent > 28 && timePercent < 45 ? `
            <path d="M 180 85 L 200 85 M 180 115 L 200 115" stroke="#ff0000" stroke-width="3" stroke-linecap="round"/>
          ` : ''}
        </svg>
      `;
    }
  },
  {
    id: 7,
    title: "Shaking Sauce from a Bottle",
    description: "You shake a sauce bottle downward then stop suddenly. The sauce comes out.",
    question: "Why does the sauce come out when you stop the bottle suddenly?",
    options: [
      { text: "A — Gravity pulls the sauce out", isCorrect: false },
      { text: "B — The sauce has inertia and continues moving downward when the bottle stops", isCorrect: true },
      { text: "C — The bottle squeezes the sauce out", isCorrect: false },
      { text: "D — Air pressure pushes the sauce out", isCorrect: false }
    ],
    explanation: "When the bottle stops suddenly, the sauce inside tends to continue moving downward due to inertia. This forces it out of the bottle opening.",
    renderAnimation: (stage, timePercent) => {
      let bottleY = 40;
      let sauceY = 40;
      let showSauceSplatter = false;
      
      if (timePercent < 25) {
        bottleY = 40 + (timePercent / 25) * 40;
      } else if (timePercent < 50) {
        bottleY = 80 - ((timePercent - 25) / 25) * 40;
      } else {
        bottleY = 70;
        showSauceSplatter = true;
        sauceY = 70 + (timePercent - 50) * 3;
      }
      
      stage.innerHTML = `
        <svg width="100%" height="100%" viewBox="0 0 400 200">
          <g transform="translate(180, 0)">
            <g transform="translate(0, ${bottleY})">
              <rect x="-18" y="-40" width="36" height="70" fill="#e53935" stroke="#000" stroke-width="2" rx="4"/>
              <rect x="-8" y="30" width="16" height="15" fill="#f5f5f5" stroke="#000" stroke-width="2"/>
              <rect x="-14" y="-20" width="28" height="30" fill="#ffd700" stroke="#000" stroke-width="1.5"/>
              <text x="-12" y="-2" fill="#000" font-size="8" font-weight="bold">SAUCE</text>
            </g>
            ${showSauceSplatter ? `
              <circle cx="0" cy="${sauceY + 20}" r="5" fill="#b71c1c" stroke="#000" stroke-width="1"/>
              <circle cx="-6" cy="${sauceY + 35}" r="4" fill="#b71c1c" stroke="#000" stroke-width="1"/>
              <circle cx="5" cy="${sauceY + 50}" r="3" fill="#b71c1c" stroke="#000" stroke-width="1"/>
            ` : ''}
          </g>
        </svg>
      `;
    }
  }
];

const MCQ_POOL = [
  {
    q: "What is inertia?",
    options: [
      { text: "A — The force needed to move an object", isCorrect: false },
      { text: "B — The tendency of an object to resist any change in its state of motion", isCorrect: true },
      { text: "C — The speed of a moving object", isCorrect: false },
      { text: "D — The weight of an object", isCorrect: false }
    ],
    explanation: "Inertia is the property of mass that resists changes in motion. It is not a force — it is a property."
  },
  {
    q: "Which object has the greatest inertia?",
    options: [
      { text: "A — A 1 kg book", isCorrect: false },
      { text: "B — A 5 kg bag", isCorrect: false },
      { text: "C — A 500 kg motorbike", isCorrect: false },
      { text: "D — A 2000 kg car", isCorrect: true }
    ],
    explanation: "Inertia depends entirely on mass. The 2000 kg car has the greatest mass, therefore the greatest inertia."
  },
  {
    q: "A passenger is not wearing a seatbelt. The car brakes suddenly. What happens to the passenger?",
    options: [
      { text: "A — Pushed backward into the seat", isCorrect: false },
      { text: "B — Pushed sideways", isCorrect: false },
      { text: "C — Thrown forward due to inertia", isCorrect: true },
      { text: "D — Nothing happens", isCorrect: false }
    ],
    explanation: "The passenger's body continues moving forward due to inertia when the car decelerates. Without a seatbelt, nothing stops the passenger from continuing forward."
  },
  {
    q: "Why are seatbelts and airbags important in cars?",
    options: [
      { text: "A — They reduce the mass of the car", isCorrect: false },
      { text: "B — They provide the force needed to decelerate the passenger safely", isCorrect: true },
      { text: "C — They increase friction between tyres and road", isCorrect: false },
      { text: "D — They reduce air resistance on the car", isCorrect: false }
    ],
    explanation: "Due to inertia, passengers continue moving forward when the car stops. Seatbelts and airbags provide the force needed to decelerate the passenger over a longer time, reducing injury."
  },
  {
    q: "On the Moon, an astronaut has the same mass as on Earth. How does his inertia on the Moon compare to his inertia on Earth?",
    options: [
      { text: "A — Less inertia on the Moon because gravity is weaker", isCorrect: false },
      { text: "B — More inertia on the Moon because there is no air resistance", isCorrect: false },
      { text: "C — Same inertia because mass does not change", isCorrect: true },
      { text: "D — Cannot be compared", isCorrect: false }
    ],
    explanation: "Inertia depends on mass, not gravity. Since mass does not change between Earth and the Moon, inertia remains the same."
  },
  {
    q: "A stationary object will remain stationary unless:",
    options: [
      { text: "A — It has no inertia", isCorrect: false },
      { text: "B — An unbalanced force acts on it", isCorrect: true },
      { text: "C — It is on a smooth surface", isCorrect: false },
      { text: "D — Its weight decreases", isCorrect: false }
    ],
    explanation: "This is Newton's 1st Law. An object at rest stays at rest due to inertia, unless an unbalanced (resultant) force acts on it."
  },
  {
    q: "Two students push identical boxes across the floor. Student A pushes a 10 kg box. Student B pushes a 50 kg box using the same force. Whose box accelerates more?",
    options: [
      { text: "A — Student A's box", isCorrect: true },
      { text: "B — Student B's box", isCorrect: false },
      { text: "C — Both boxes accelerate the same", isCorrect: false },
      { text: "D — Neither box moves", isCorrect: false }
    ],
    explanation: "Same force, less mass = greater acceleration. a = F/m. The 10 kg box has less inertia and accelerates more easily."
  },
  {
    q: "Which of the following is NOT an example of inertia?",
    options: [
      { text: "A — Passengers lurching forward when a bus brakes", isCorrect: false },
      { text: "B — A ball rolling downhill due to gravity", isCorrect: true },
      { text: "C — Dishes staying on a table when the tablecloth is pulled away", isCorrect: false },
      { text: "D — A boulder in space being hard to push", isCorrect: false }
    ],
    explanation: "A ball rolling downhill is caused by gravity (a force acting on it), not inertia. Inertia describes resistance to change in motion, not motion caused by a force."
  }
];

// Helper to shuffle arrays
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// -------------------------------------------------------------------
// SECTION 1: INERTIA DEMONSTRATOR
// -------------------------------------------------------------------

function initSection1() {
  const massSliderA = document.getElementById('mass-a');
  const massSliderB = document.getElementById('mass-b');
  const valMassA = document.getElementById('val-mass-a');
  const valMassB = document.getElementById('val-mass-b');
  const lblMassA = document.getElementById('lbl-mass-a');
  const lblMassB = document.getElementById('lbl-mass-b');
  const valAccA = document.getElementById('val-acc-a');
  const valAccB = document.getElementById('val-acc-b');
  
  const btnStart = document.getElementById('btn-start');
  const btnBrake = document.getElementById('btn-brake');
  const btnResetSim = document.getElementById('btn-reset-sim');
  const simPrompt = document.getElementById('sim-prompt');
  
  const wrapperCar = document.getElementById('wrapper-car');
  const wrapperTruck = document.getElementById('wrapper-truck');
  const stopBarA = document.getElementById('stop-bar-a');
  const stopBarB = document.getElementById('stop-bar-b');
  const stopDistA = document.getElementById('stop-dist-a');
  const stopDistB = document.getElementById('stop-dist-b');

  const toggleGhosts = document.getElementById('toggle-ghosts');
  
  toggleGhosts.addEventListener('change', () => {
    const show = toggleGhosts.checked;
    document.querySelectorAll('.ghost-trail').forEach(el => {
      el.style.display = show ? 'block' : 'none';
    });
  });

  function updateCalculations() {
    state.sim.car.mass = parseInt(massSliderA.value);
    state.sim.truck.mass = parseInt(massSliderB.value);
    
    state.sim.car.acceleration = (state.sim.force / state.sim.car.mass).toFixed(2);
    state.sim.truck.acceleration = (state.sim.force / state.sim.truck.mass).toFixed(2);
    
    valMassA.textContent = state.sim.car.mass;
    valMassB.textContent = state.sim.truck.mass;
    lblMassA.textContent = state.sim.car.mass;
    lblMassB.textContent = state.sim.truck.mass;
    valAccA.textContent = state.sim.car.acceleration;
    valAccB.textContent = state.sim.truck.acceleration;

    if (!state.sim.running && !state.sim.braking) {
      if (state.sim.car.mass > 1500) {
        simPrompt.innerHTML = `💡 <strong>Notice:</strong> As Object A's mass increases, acceleration decreases. Inertia increases!`;
      } else if (state.sim.truck.mass > 8000) {
        simPrompt.innerHTML = `💡 <strong>Notice:</strong> The truck has much greater inertia. Same force produces much less acceleration.`;
      } else {
        simPrompt.innerHTML = `💡 Drag the sliders to change mass and see the acceleration live. Press "GO!" to start the test.`;
      }
    }
  }

  massSliderA.addEventListener('input', updateCalculations);
  massSliderB.addEventListener('input', updateCalculations);
  
  updateCalculations();

  btnStart.addEventListener('click', () => {
    if (state.sim.running || state.sim.braking) return;
    
    state.sim.running = true;
    state.sim.braking = false;
    state.sim.startTime = null;
    
    state.sim.car.lastGhostTime = 0;
    state.sim.truck.lastGhostTime = 0;
    
    // Clear old ghost trails
    document.querySelectorAll('.ghost-trail').forEach(el => el.remove());
    
    btnStart.disabled = true;
    btnBrake.disabled = false;
    massSliderA.disabled = true;
    massSliderB.disabled = true;
    
    wrapperCar.classList.add('spinning');
    wrapperTruck.classList.add('spinning');
    
    simPrompt.innerHTML = `🚀 Accelerating! Both vehicles are pushed by 5000 N. The lighter car accelerates faster because it has less inertia!`;
    
    function dropGhost(laneId, svgClass, positionPercent) {
      const track = document.querySelector(`#${laneId} .track`);
      const originalSvg = track.querySelector(`.${svgClass}`);
      if (!originalSvg) return;
      const ghost = originalSvg.cloneNode(true);
      ghost.classList.add('ghost-trail');
      ghost.classList.remove('spinning');
      ghost.style.position = 'absolute';
      ghost.style.left = `${positionPercent}%`;
      ghost.style.bottom = '0px';
      ghost.style.opacity = '0.18';
      ghost.style.pointerEvents = 'none';
      ghost.style.transform = 'none';
      
      // Inherit visual visibility from checkbox status
      ghost.style.display = toggleGhosts.checked ? 'block' : 'none';
      
      track.appendChild(ghost);
    }
    
    function step(timestamp) {
      if (!state.sim.running) return;
      if (!state.sim.startTime) state.sim.startTime = timestamp;
      const elapsed = (timestamp - state.sim.startTime) / 1000;
      
      const distA = 0.5 * state.sim.car.acceleration * elapsed * elapsed;
      const distB = 0.5 * state.sim.truck.acceleration * elapsed * elapsed;
      
      // Let them go off screen (up to 110%)
      state.sim.car.position = distA * 8; 
      state.sim.truck.position = distB * 8;
      
      state.sim.car.velocity = state.sim.car.acceleration * elapsed;
      state.sim.truck.velocity = state.sim.truck.acceleration * elapsed;
      
      wrapperCar.style.left = `${state.sim.car.position}%`;
      wrapperTruck.style.left = `${state.sim.truck.position}%`;
      
      const showGhosts = toggleGhosts.checked;
      
      // Drop ghosts every 0.5 seconds (we keep track of elapsed time even if toggle is temporarily unchecked)
      if (elapsed - state.sim.car.lastGhostTime >= 0.5 && state.sim.car.position < 100) {
        if (showGhosts) dropGhost('lane-car', 'car', state.sim.car.position);
        state.sim.car.lastGhostTime = elapsed;
      }
      if (elapsed - state.sim.truck.lastGhostTime >= 0.5 && state.sim.truck.position < 100) {
        if (showGhosts) dropGhost('lane-truck', 'truck', state.sim.truck.position);
        state.sim.truck.lastGhostTime = elapsed;
      }
      
      if (state.sim.car.position < 110 || state.sim.truck.position < 110) {
        state.sim.animationFrameId = requestAnimationFrame(step);
      } else {
        simPrompt.innerHTML = `⚠️ Both vehicles have moved off-screen! Press RESET to run the test again or try braking.`;
        wrapperCar.classList.remove('spinning');
        wrapperTruck.classList.remove('spinning');
        btnBrake.disabled = true;
      }
    }
    
    state.sim.animationFrameId = requestAnimationFrame(step);
  });

  btnBrake.addEventListener('click', () => {
    if (!state.sim.running || state.sim.braking) return;
    
    state.sim.running = false;
    state.sim.braking = true;
    btnBrake.disabled = true;
    
    simPrompt.innerHTML = `🛑 Brakes applied! Both vehicles receive the same deceleration force. Greater mass = greater inertia = longer stopping distance!`;
    
    const initialV_A = state.sim.car.velocity;
    const initialV_B = state.sim.truck.velocity;
    const initialPos_A = state.sim.car.position;
    const initialPos_B = state.sim.truck.position;
    
    const decelForce = 6000;
    const decelA = decelForce / state.sim.car.mass;
    const decelB = decelForce / state.sim.truck.mass;
    
    const stopTimeA = initialV_A / decelA;
    const stopTimeB = initialV_B / decelB;
    
    const s_A = (initialV_A * initialV_A) / (2 * decelA);
    const s_B = (initialV_B * initialV_B) / (2 * decelB);
    
    state.sim.car.stopDistance = s_A;
    state.sim.truck.stopDistance = s_B;
    
    let brakeStartTime = null;
    
    function brakeStep(timestamp) {
      if (!state.sim.braking) return;
      if (!brakeStartTime) brakeStartTime = timestamp;
      const elapsed = (timestamp - brakeStartTime) / 1000;
      
      if (elapsed < stopTimeA) {
        const dist = initialV_A * elapsed - 0.5 * decelA * elapsed * elapsed;
        wrapperCar.style.left = `${Math.min(90, initialPos_A + dist * 8)}%`;
        const percentage = (elapsed / stopTimeA) * 100;
        stopBarA.style.width = `${percentage}%`;
        stopDistA.textContent = `${s_A.toFixed(1)}m`;
      } else {
        wrapperCar.style.left = `${Math.min(90, initialPos_A + s_A * 8)}%`;
        wrapperCar.classList.remove('spinning');
        stopBarA.style.width = `100%`;
        stopDistA.textContent = `${s_A.toFixed(1)}m`;
      }
      
      if (elapsed < stopTimeB) {
        const dist = initialV_B * elapsed - 0.5 * decelB * elapsed * elapsed;
        wrapperTruck.style.left = `${Math.min(90, initialPos_B + dist * 8)}%`;
        const percentage = (elapsed / stopTimeB) * 100;
        stopBarB.style.width = `${percentage}%`;
        stopDistB.textContent = `${s_B.toFixed(1)}m`;
      } else {
        wrapperTruck.style.left = `${Math.min(90, initialPos_B + s_B * 8)}%`;
        wrapperTruck.classList.remove('spinning');
        stopBarB.style.width = `100%`;
        stopDistB.textContent = `${s_B.toFixed(1)}m`;
      }
      
      if (elapsed < Math.max(stopTimeA, stopTimeB)) {
        state.sim.animationFrameId = requestAnimationFrame(brakeStep);
      } else {
        state.sim.braking = false;
        simPrompt.innerHTML = `💡 <strong>Notice:</strong> The more massive truck travels further before stopping. Greater inertia means greater resistance to change in motion.`;
      }
    }
    
    state.sim.animationFrameId = requestAnimationFrame(brakeStep);
  });

  btnResetSim.addEventListener('click', () => {
    if (state.sim.animationFrameId) {
      cancelAnimationFrame(state.sim.animationFrameId);
    }
    
    state.sim.running = false;
    state.sim.braking = false;
    
    // Clear ghost trails
    document.querySelectorAll('.ghost-trail').forEach(el => el.remove());
    
    wrapperCar.style.left = '0%';
    wrapperTruck.style.left = '0%';
    wrapperCar.classList.remove('spinning');
    wrapperTruck.classList.remove('spinning');
    
    stopBarA.style.width = `0%`;
    stopBarB.style.width = `0%`;
    stopDistA.textContent = `0.0m`;
    stopDistB.textContent = `0.0m`;
    
    btnStart.disabled = false;
    btnBrake.disabled = true;
    massSliderA.disabled = false;
    massSliderB.disabled = false;
    
    updateCalculations();
  });
}

// -------------------------------------------------------------------
// SECTION 2: SCENARIOS CHALLENGE
// -------------------------------------------------------------------

function initSection2() {
  // Clear any cached shuffles to allow fresh randomization on restarts
  SCENARIOS_DATA.forEach(sc => {
    delete sc.shuffledOptions;
  });
  
  state.scenarios.pool = shuffle([...SCENARIOS_DATA]);
  state.scenarios.currentIdx = 0;
  loadScenario();
  
  // Replay animation click handler
  document.getElementById('btn-replay-scenario').addEventListener('click', () => {
    replayScenarioAnimation();
  });
}

function replayScenarioAnimation() {
  const currentIdx = state.scenarios.currentIdx;
  const scenario = state.scenarios.active;
  const stage = document.getElementById('scenario-stage');
  const questionBox = document.getElementById('scenario-question-box');
  const explanationBox = document.getElementById('scenario-explanation');
  
  questionBox.style.display = 'none';
  explanationBox.style.display = 'none';
  
  const wasAnswered = state.scenarios.answered;
  state.scenarios.answered = false; // Temporarily allow rendering loop to proceed
  
  let animStart = null;
  const duration = 3000;
  
  function animStep(timestamp) {
    if (state.scenarios.currentIdx !== currentIdx) return;
    if (!animStart) animStart = timestamp;
    const progress = Math.min(100, ((timestamp - animStart) / duration) * 100);
    
    scenario.renderAnimation(stage, progress);
    
    if (progress < 100) {
      requestAnimationFrame(animStep);
    } else {
      state.scenarios.answered = wasAnswered;
      questionBox.style.display = 'block';
      if (wasAnswered) {
        explanationBox.style.display = 'block';
      }
    }
  }
  
  requestAnimationFrame(animStep);
}

function loadScenario() {
  const currentIdx = state.scenarios.currentIdx;
  const currentProgress = ((currentIdx + 1) / 7) * 100;
  
  document.getElementById('scenario-current').textContent = currentIdx + 1;
  document.getElementById('scenario-progress').style.width = `${currentProgress}%`;
  
  const scenario = state.scenarios.pool[currentIdx];
  state.scenarios.active = scenario;
  state.scenarios.answered = false;
  
  // Randomise the options order once when scenario is first loaded
  if (!scenario.shuffledOptions) {
    scenario.shuffledOptions = shuffle([...scenario.options]);
  }
  
  document.getElementById('scenario-desc').textContent = scenario.description;
  document.getElementById('scenario-question').textContent = scenario.question;
  
  const stage = document.getElementById('scenario-stage');
  const questionBox = document.getElementById('scenario-question-box');
  const explanationBox = document.getElementById('scenario-explanation');
  
  questionBox.style.display = 'none';
  explanationBox.style.display = 'none';
  
  let animStart = null;
  let duration = 3000;
  
  function animStep(timestamp) {
    if (state.scenarios.answered || state.scenarios.currentIdx !== currentIdx) return;
    if (!animStart) animStart = timestamp;
    const progress = Math.min(100, ((timestamp - animStart) / duration) * 100);
    
    scenario.renderAnimation(stage, progress);
    
    if (progress < 100) {
      requestAnimationFrame(animStep);
    } else {
      questionBox.style.display = 'block';
    }
  }
  
  requestAnimationFrame(animStep);
  
  const optionsGrid = document.getElementById('scenario-options');
  optionsGrid.innerHTML = '';
  
  const prefixes = ['A', 'B', 'C', 'D'];
  scenario.shuffledOptions.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    
    // Strip static letter prefix and prepend new shuffled prefix
    const cleanedText = opt.text.replace(/^[A-D]\s*—\s*/, '');
    btn.textContent = `${prefixes[idx]} — ${cleanedText}`;
    
    btn.addEventListener('click', () => handleScenarioAnswer(btn, opt));
    optionsGrid.appendChild(btn);
  });
}

function handleScenarioAnswer(selectedBtn, option) {
  if (state.scenarios.answered) return;
  state.scenarios.answered = true;
  
  const buttons = document.querySelectorAll('#scenario-options .option-btn');
  buttons.forEach(btn => btn.disabled = true);
  
  const explanationBox = document.getElementById('scenario-explanation');
  const statusIndicator = document.getElementById('scenario-status');
  const pointsGain = document.getElementById('scenario-points');
  const explanationText = document.getElementById('scenario-exp-text');
  
  explanationText.textContent = state.scenarios.active.explanation;
  
  if (option.isCorrect) {
    selectedBtn.classList.add('correct');
    statusIndicator.textContent = "CORRECT!";
    statusIndicator.className = "status-indicator correct";
    pointsGain.textContent = "+2 Points";
    state.scores.scenarios += 2;
  } else {
    selectedBtn.classList.add('wrong');
    statusIndicator.textContent = "INCORRECT";
    statusIndicator.className = "status-indicator wrong";
    pointsGain.textContent = "+0 Points";
    
    // Highlight correct answer in the randomized options layout
    buttons.forEach((btn, idx) => {
      if (state.scenarios.active.shuffledOptions[idx].isCorrect) {
        btn.classList.add('correct');
      }
    });
  }
  
  updateGlobalScore();
  explanationBox.style.display = 'block';
}

document.getElementById('btn-next-scenario').addEventListener('click', () => {
  state.scenarios.currentIdx++;
  if (state.scenarios.currentIdx < 7) {
    loadScenario();
  } else {
    switchTab('mass-quiz');
  }
});

// -------------------------------------------------------------------
// SECTION 3: MASS COMPARISON QUIZ (Random values)
// -------------------------------------------------------------------

function generateMassQuizQuestions() {
  const list = [];
  
  // Type A: Compare Inertia
  for (let i = 0; i < 2; i++) {
    const mass1 = Math.floor(Math.random() * 41) + 10;
    const mass2 = Math.floor(Math.random() * 141) + 60;
    list.push({
      type: 'TYPE A: COMPARE INERTIA',
      question: `Object 1 has a mass of ${mass1} kg. Object 2 has a mass of ${mass2} kg. Which object has greater inertia?`,
      options: [
        { text: 'Object 1', isCorrect: false },
        { text: 'Object 2', isCorrect: true },
        { text: 'Both the same', isCorrect: false },
        { text: 'Cannot tell', isCorrect: false }
      ],
      explanation: `Greater mass means greater inertia. Object 2 (${mass2} kg) is more massive than Object 1 (${mass1} kg), so it has greater inertia.`
    });
  }

  // Type B: Predict Motion
  for (let i = 0; i < 2; i++) {
    const force = Math.floor(Math.random() * 51) + 50;
    const mass1 = Math.floor(Math.random() * 16) + 5;
    const mass2 = Math.floor(Math.random() * 151) + 50;
    
    list.push({
      type: 'TYPE B: PREDICT MOTION',
      question: `The same force of ${force} N is applied to a ${mass1} kg object and a ${mass2} kg object. Which accelerates more?`,
      options: [
        { text: 'The lighter object', isCorrect: true },
        { text: 'The heavier object', isCorrect: false },
        { text: 'Both the same', isCorrect: false },
        { text: 'Cannot tell', isCorrect: false }
      ],
      explanation: `Using a = F/m, acceleration is inversely proportional to mass. The lighter object (${mass1} kg) has less inertia and will accelerate more under the same force.`
    });
  }

  // Type C: Real Life Application
  const bowlingMass = (Math.random() * 3 + 4).toFixed(1);
  const tennisMass = (Math.random() * 20 + 50).toFixed(0);
  const tennisMassKg = (tennisMass / 1000).toFixed(3);
  list.push({
    type: 'TYPE C: REAL LIFE APPLICATION',
    question: `A ${bowlingMass} kg bowling ball and a ${tennisMass} g (${tennisMassKg} kg) tennis ball roll toward you at the same speed. Which is harder to stop?`,
    options: [
      { text: 'The bowling ball', isCorrect: true },
      { text: 'The tennis ball', isCorrect: false },
      { text: 'Both the same', isCorrect: false },
      { text: 'Cannot tell', isCorrect: false }
    ],
    explanation: `The bowling ball has significantly greater mass (${bowlingMass} kg vs ${tennisMassKg} kg), giving it greater inertia. It resists changes in motion more, making it harder to stop.`
  });

  const speedVal = Math.floor(Math.random() * 41) + 50;
  const carMassVal = Math.floor(Math.random() * 501) + 1000;
  list.push({
    type: 'TYPE C: REAL LIFE APPLICATION',
    question: `A driver is travelling at ${speedVal} km/h in a ${carMassVal} kg car. He brakes suddenly. What property of the car resists the change in motion?`,
    options: [
      { text: 'Inertia (due to its mass)', isCorrect: true },
      { text: 'Gravity (due to its weight)', isCorrect: false },
      { text: 'Speed', isCorrect: false },
      { text: 'Friction', isCorrect: false }
    ],
    explanation: `Inertia is the property of the car (arising from its mass) that resists any changes to its current state of motion.`
  });

  state.massQuiz.questions = list;
}

function initSection3() {
  generateMassQuizQuestions();
  state.massQuiz.currentIdx = 0;
  loadMassQuestion();
}

function loadMassQuestion() {
  const currentIdx = state.massQuiz.currentIdx;
  const currentProgress = ((currentIdx + 1) / 6) * 100;
  
  document.getElementById('mass-current').textContent = currentIdx + 1;
  document.getElementById('mass-progress').style.width = `${currentProgress}%`;
  
  const qObj = state.massQuiz.questions[currentIdx];
  state.massQuiz.active = qObj;
  state.massQuiz.answered = false;
  
  document.getElementById('mass-question-type').textContent = qObj.type;
  document.getElementById('mass-question').textContent = qObj.question;
  
  const explanationBox = document.getElementById('mass-explanation');
  explanationBox.style.display = 'none';
  
  const optionsGrid = document.getElementById('mass-options');
  optionsGrid.innerHTML = '';
  
  qObj.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt.text;
    btn.addEventListener('click', () => handleMassAnswer(btn, opt));
    optionsGrid.appendChild(btn);
  });
}

function handleMassAnswer(selectedBtn, option) {
  if (state.massQuiz.answered) return;
  state.massQuiz.answered = true;
  
  const buttons = document.querySelectorAll('#mass-options .option-btn');
  buttons.forEach(btn => btn.disabled = true);
  
  const explanationBox = document.getElementById('mass-explanation');
  const statusIndicator = document.getElementById('mass-status');
  const pointsGain = document.getElementById('mass-points');
  const explanationText = document.getElementById('mass-exp-text');
  
  explanationText.textContent = state.massQuiz.active.explanation;
  
  if (option.isCorrect) {
    selectedBtn.classList.add('correct');
    statusIndicator.textContent = "CORRECT!";
    statusIndicator.className = "status-indicator correct";
    pointsGain.textContent = "+2 Points";
    state.scores.massQuiz += 2;
  } else {
    selectedBtn.classList.add('wrong');
    statusIndicator.textContent = "INCORRECT";
    statusIndicator.className = "status-indicator wrong";
    pointsGain.textContent = "+0 Points";
    
    buttons.forEach((btn, idx) => {
      if (state.massQuiz.active.options[idx].isCorrect) {
        btn.classList.add('correct');
      }
    });
  }
  
  updateGlobalScore();
  explanationBox.style.display = 'block';
}

document.getElementById('btn-next-mass').addEventListener('click', () => {
  state.massQuiz.currentIdx++;
  if (state.massQuiz.currentIdx < 6) {
    loadMassQuestion();
  } else {
    switchTab('concept-quiz');
  }
});

// -------------------------------------------------------------------
// SECTION 4: MCQ CONCEPT QUIZ
// -------------------------------------------------------------------

function initSection4() {
  state.conceptQuiz.pool = shuffle([...MCQ_POOL]);
  state.conceptQuiz.questions = state.conceptQuiz.pool.slice(0, 6);
  state.conceptQuiz.currentIdx = 0;
  loadConceptQuestion();
}

function loadConceptQuestion() {
  const currentIdx = state.conceptQuiz.currentIdx;
  const currentProgress = ((currentIdx + 1) / 6) * 100;
  
  document.getElementById('concept-current').textContent = currentIdx + 1;
  document.getElementById('concept-progress').style.width = `${currentProgress}%`;
  
  const qObj = state.conceptQuiz.questions[currentIdx];
  state.conceptQuiz.active = qObj;
  state.conceptQuiz.answered = false;
  
  document.getElementById('concept-question').textContent = qObj.q;
  
  const explanationBox = document.getElementById('concept-explanation');
  explanationBox.style.display = 'none';
  
  const optionsGrid = document.getElementById('concept-options');
  optionsGrid.innerHTML = '';
  
  qObj.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt.text;
    btn.addEventListener('click', () => handleConceptAnswer(btn, opt));
    optionsGrid.appendChild(btn);
  });
}

function handleConceptAnswer(selectedBtn, option) {
  if (state.conceptQuiz.answered) return;
  state.conceptQuiz.answered = true;
  
  const buttons = document.querySelectorAll('#concept-options .option-btn');
  buttons.forEach(btn => btn.disabled = true);
  
  const explanationBox = document.getElementById('concept-explanation');
  const statusIndicator = document.getElementById('concept-status');
  const pointsGain = document.getElementById('concept-points');
  const explanationText = document.getElementById('concept-exp-text');
  
  explanationText.textContent = state.conceptQuiz.active.explanation;
  
  if (option.isCorrect) {
    selectedBtn.classList.add('correct');
    statusIndicator.textContent = "CORRECT!";
    statusIndicator.className = "status-indicator correct";
    pointsGain.textContent = "+2 Points";
    state.scores.conceptQuiz += 2;
  } else {
    selectedBtn.classList.add('wrong');
    statusIndicator.textContent = "INCORRECT";
    statusIndicator.className = "status-indicator wrong";
    pointsGain.textContent = "+0 Points";
    
    buttons.forEach((btn, idx) => {
      if (state.conceptQuiz.active.options[idx].isCorrect) {
        btn.classList.add('correct');
      }
    });
  }
  
  updateGlobalScore();
  explanationBox.style.display = 'block';
}

document.getElementById('btn-next-concept').addEventListener('click', () => {
  state.conceptQuiz.currentIdx++;
  if (state.conceptQuiz.currentIdx < 6) {
    loadConceptQuestion();
  } else {
    showSummaryPage();
  }
});

// -------------------------------------------------------------------
// SUMMARY & GLOBAL SCORE UTILS
// -------------------------------------------------------------------

function updateGlobalScore() {
  const total = state.scores.scenarios + state.scores.massQuiz + state.scores.conceptQuiz;
  document.getElementById('global-score').textContent = total;
}

function showSummaryPage() {
  switchTab('summary');
  
  const total = state.scores.scenarios + state.scores.massQuiz + state.scores.conceptQuiz;
  document.getElementById('summary-total-score').textContent = total;
  
  document.getElementById('score-scenarios').textContent = `${state.scores.scenarios} / 14`;
  document.getElementById('score-mass').textContent = `${state.scores.massQuiz} / 12`;
  document.getElementById('score-concept').textContent = `${state.scores.conceptQuiz} / 12`;
  
  const gradeLabel = document.getElementById('summary-grade');
  const feedbackPanel = document.getElementById('summary-feedback');
  
  if (total >= 34) {
    gradeLabel.textContent = "Excellent — inertia master!";
    gradeLabel.style.color = "var(--correct-green)";
    feedbackPanel.innerHTML = "🏆 Fantastic job! You have fully mastered the physics of inertia, mass, and acceleration under Syllabus 6091 guidelines. Go share your brilliance!";
  } else if (total >= 25) {
    gradeLabel.textContent = "Good — review the scenario explanations.";
    gradeLabel.style.color = "var(--accent-color)";
    feedbackPanel.innerHTML = "👍 Well done! You have a solid grasp of the concepts, but some tricky applications caught you. Click restart to practice again and check the scenario details.";
  } else {
    gradeLabel.textContent = "Needs practice — redo Section 1 with the sliders.";
    gradeLabel.style.color = "var(--wrong-red)";
    feedbackPanel.innerHTML = "📚 Inertia is all about mass resisting change in motion! Return to Section 1 (Explore Mode), drag the mass sliders, and observe how different masses affect acceleration and braking.";
  }
}

function restartGame() {
  state.scores.scenarios = 0;
  state.scores.massQuiz = 0;
  state.scores.conceptQuiz = 0;
  updateGlobalScore();
  
  initSection1();
  initSection2();
  initSection3();
  initSection4();
  
  switchTab('explore');
}

document.getElementById('btn-global-restart').addEventListener('click', () => {
  if (confirm("Are you sure you want to restart all progress? Your scores will be reset.")) {
    restartGame();
  }
});

document.getElementById('btn-restart-quiz').addEventListener('click', restartGame);

// -------------------------------------------------------------------
// TAB ROUTER / CONTROLLER
// -------------------------------------------------------------------

function switchTab(tabId) {
  state.activeTab = tabId;
  
  const tabs = document.querySelectorAll('#mainTabs .tab-btn');
  tabs.forEach(tab => {
    if (tab.getAttribute('data-tab') === tabId) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
  
  const contents = document.querySelectorAll('.tab-content');
  contents.forEach(content => {
    if (content.id === tabId) {
      content.classList.add('active');
    } else {
      content.classList.remove('active');
    }
  });

  if (tabId === 'explore') {
    document.getElementById('btn-reset-sim').click();
  }
}

document.getElementById('mainTabs').addEventListener('click', (e) => {
  if (e.target.classList.contains('tab-btn')) {
    const tabId = e.target.getAttribute('data-tab');
    switchTab(tabId);
  }
});

// -------------------------------------------------------------------
// APPLICATION INITIALIZATION
// -------------------------------------------------------------------
window.addEventListener('DOMContentLoaded', () => {
  initSection1();
  initSection2();
  initSection3();
  initSection4();
});
