// --- CONFIG & STATE ---
const state = {
  activeView: 'concept',
  currentSimScenario: 'aircraft',
  simChargeLevel: 0,
  simEarthed: false,
  
  // Section 2 Part A State
  partAScenarios: [],
  currentPartAIndex: 0,
  partAScore: 0,
  
  // Section 2 Part B State
  partBScenarios: [], // subset of Part A that are hazards
  currentPartBIndex: 0,
  partBScore: 0,

  // Section 3 (MCQ) State
  quizPool: [],
  quizQuestions: [],
  currentQuizIndex: 0,
  quizScore: 0,
  
  // Section 5 (Flashcards) State
  flashcards: [],
  currentFlashcardIndex: 0,
  flashcardFlipped: false
};

// --- DATA DEFINITIONS ---

// Scenarios for Section 2 (Part A)
const scenariosData = [
  {
    id: 'aircraft',
    title: 'Aircraft refuelling',
    description: 'An aircraft is being refuelled. Friction between the fast-flowing fuel and the hose builds up electrostatic charge.',
    isHazard: true,
    feedbackHazard: 'Friction between fuel and pipe builds up charge. A spark could ignite flammable fuel vapor, causing an explosion.',
    feedbackSafe: 'Incorrect. This is a severe hazard because spark discharges can ignite fuel vapors.',
    svgType: 'aircraft'
  },
  {
    id: 'tanker',
    title: 'Fuel tanker filling at a petrol station',
    description: 'A tanker is delivering fuel. The metal body accumulates charge as fuel flows in, creating a potential difference to the ground.',
    isHazard: true,
    feedbackHazard: 'Charges accumulate on the metal tanker body. A spark discharge to the ground or nozzle can ignite fuel vapor, causing an explosion.',
    feedbackSafe: 'Incorrect. The accumulation of charge on a vehicle handling highly flammable fuel is a major hazard.',
    svgType: 'tanker'
  },
  {
    id: 'carpet',
    title: 'Person walking on a carpeted floor in dry weather',
    description: 'A person walks across a wool carpet in a dry air-conditioned room. Their body accumulates static charge.',
    isHazard: false,
    feedbackHazard: 'Incorrect. While it causes a minor shock, it is NOT considered a significant safety hazard under normal domestic conditions.',
    feedbackSafe: 'Correct! This causes a minor, harmless shock when touching conducting surfaces, but does not present a dangerous fire or explosion risk in everyday life.',
    svgType: 'carpet'
  },
  {
    id: 'theatre',
    title: 'Surgeon operating with electrical equipment in an oxygen-rich room',
    description: 'A surgeon moves around, accumulating charge from synthetic scrubs. Highly flammable anesthetic gases and oxygen are present nearby.',
    isHazard: true,
    feedbackHazard: 'Electrostatic sparks can ignite flammable anesthetic gases or oxygen-rich atmospheres in operating theatres, leading to fires or explosions.',
    feedbackSafe: 'Incorrect. Anesthetizing gases and high oxygen concentrations make any electrostatic spark a serious fire hazard.',
    svgType: 'theatre'
  },
  {
    id: 'electronics',
    title: 'Handling microchips without anti-static precautions',
    description: 'A technician picks up a delicate microprocessor containing sub-micron silicon transistors without wearing a ground strap.',
    isHazard: true,
    feedbackHazard: 'Delicate transistors are easily melted or vaporized by micro-sparks (ESD) from human hands, rendering the chip useless.',
    feedbackSafe: 'Incorrect. Microprocessors are highly sensitive; electrostatic discharge is a major manufacturing/repair hazard.',
    svgType: 'electronics'
  },
  {
    id: 'lightning',
    title: 'Lightning strike on a tall building',
    description: 'A thundercloud accumulates large negative charges at its base, inducing positive charges on top of a concrete tower.',
    isHazard: true,
    feedbackHazard: 'Huge amounts of electric energy discharge down the building, causing structural fire, exploding masonry, or electrocution.',
    feedbackSafe: 'Incorrect. Lightning discharges are a massive hazard that must be safely diverted to the earth.',
    svgType: 'lightning'
  },
  {
    id: 'powders',
    title: 'Pouring dry chemical powders in a factory silo',
    description: 'Fine dust particles rub against each other and the plastic chute as they fall, building up high static charge.',
    isHazard: true,
    feedbackHazard: 'A high concentration of dry organic/chemical dust is explosive. An electrostatic spark between particles can trigger a devastating dust explosion.',
    feedbackSafe: 'Incorrect. Dust explosions caused by static electricity are a severe risk in chemical, grain, and textile industries.',
    svgType: 'powders'
  },
  {
    id: 'car-dry',
    title: 'Driving a car on a dry day',
    description: 'A commuter drives along a dry highway. Friction between the air and the metal body builds up a small charge.',
    isHazard: false,
    feedbackHazard: 'Incorrect. While it might lead to a tiny annoying shock when stepping out, there is no serious fire or safety risk.',
    feedbackSafe: 'Correct. A dry car is insulated by rubber tires, but unless refuelling, the minor static buildup represents no significant danger.',
    svgType: 'car'
  },
  {
    id: 'synthetic',
    title: 'Wearing synthetic clothing in a dry environment',
    description: 'A student wears a polyester jacket. Friction with their cotton shirt builds up static charges.',
    isHazard: false,
    feedbackHazard: 'Incorrect. The crackling noise or clingy clothes is only an annoyance, not a dangerous hazard.',
    feedbackSafe: 'Correct. Wearing synthetic clothing yields low-energy discharges that do not constitute a hazard under ordinary circumstances.',
    svgType: 'synthetic'
  },
  {
    id: 'metal-handle',
    title: 'Touching a metal door handle after walking on carpet',
    description: 'You walk on a carpeted hallway, accumulate static charge, and extend your finger to touch the brass handle.',
    isHazard: false,
    feedbackHazard: 'Incorrect. The tiny spark causes a mild sensory shock, but carries no safety risk.',
    feedbackSafe: 'Correct. The discharge is immediate and causes a small shock but is otherwise safe and harmless.',
    svgType: 'door'
  }
];

// Safety follow-up questions for Part B
const safetyQuestions = {
  'aircraft': {
    options: [
      'Paint the aircraft with insulated plastic coating.',
      'Connect the aircraft body to the fuel tanker/ground with a copper earthing cable before refuelling.',
      'Refuel the aircraft at higher speeds to blow away charge.',
      'Ensure the pilot remains inside the cockpit during refuelling.'
    ],
    correct: 1,
    explanation: 'Connecting a conducting metal cable (earthing wire) allows charge to flow harmlessly to the ground, preventing potential differences and sparks.'
  },
  'tanker': {
    options: [
      'Fit the tanker with fully insulated tires.',
      'Avoid driving on tarmac roads.',
      'Use a metal earthing strap connected to earth before fuel transfer, and conducting rubber tires.',
      'Fill the fuel tanker as slowly as possible to let charge dissipate.'
    ],
    correct: 2,
    explanation: 'An earthing strap connects the metal tanker body to the ground, dispersing electrostatic charge before a spark can form.'
  },
  'theatre': {
    options: [
      'Use fully synthetic rubber shoes and plastic operating tables.',
      'Use conducting rubber floors, anti-static clothing, and maintain high humidity levels.',
      'Only use battery-powered surgical equipment.',
      'Keep the operating room extremely dry to prevent dampness.'
    ],
    correct: 1,
    explanation: 'Conducting floors and anti-static materials let charges flow away, while high humidity allows water vapor in the air to slowly discharge surfaces.'
  },
  'electronics': {
    options: [
      'Wear plastic gloves and work on a wooden table.',
      'Keep the workstation dry and air-conditioned.',
      'Wear an anti-static wrist strap connected to earth and use conducting mats.',
      'Wipe all components with a dry cloth before touching.'
    ],
    correct: 2,
    explanation: 'An anti-static wrist strap contains a conductor that continuously drains static charge from the technician\'s body safely to the earth.'
  },
  'lightning': {
    options: [
      'Build the roof out of plastic panels.',
      'Install a copper lightning conductor from the top of the building deep into the earth.',
      'Keep the building walls damp to conduct water.',
      'Cover the building with insulated rubber sheets.'
    ],
    correct: 1,
    explanation: 'A thick copper strip (lightning conductor) provides a low-resistance path for the lightning strike directly to earth, protecting the building\'s structure.'
  },
  'powders': {
    options: [
      'Speed up the pouring process to minimize airborne duration.',
      'Earth all metal pipes and ducts, and humidify the factory atmosphere.',
      'Use plastic pipes to block charge flow.',
      'Blow hot dry air into the silo.'
    ],
    correct: 1,
    explanation: 'Earthing the metal ducts lets charges leak away. High humidity makes the air more conductive, preventing electrostatic charges from building up on powder dust.'
  }
};

// MCQ Quiz Pool (30 high-quality questions for O-Level Physics 6091)
const mcqQuizPool = [
  {
    question: "Why does electrostatic charge build up on an object during rubbing?",
    options: [
      "Protons are transferred from one material to another.",
      "Electrons are transferred from one material to another.",
      "Neutrons are created due to friction.",
      "Charges are induced by the magnetic field of the earth."
    ],
    correct: 1,
    explanation: "Friction causes the transfer of outer electrons. The material that loses electrons becomes positively charged, and the one that gains them becomes negatively charged."
  },
  {
    question: "Which conditions are most likely to lead to a rapid buildup of static electricity?",
    options: [
      "Humid air and conducting surfaces",
      "Humid air and insulating surfaces",
      "Dry air and conducting surfaces",
      "Dry air and insulating surfaces"
    ],
    correct: 3,
    explanation: "Insulators prevent charge from escaping, while dry air lacks water vapor molecules that normally help slowly discharge static electricity into the environment."
  },
  {
    question: "How does earthing a metal container prevent electrostatic hazards?",
    options: [
      "It makes the metal container an insulator.",
      "It provides a low-resistance path for excess charge to flow to the ground.",
      "It increases the friction between container and air.",
      "It prevents fuel from vaporizing."
    ],
    correct: 1,
    explanation: "Earthing provides a path of low electrical resistance. Excess electrons flow to ground (or from ground) to neutralize the container, eliminating spark risks."
  },
  {
    question: "Why is a fuel tanker fitted with conducting rubber tires instead of normal rubber tires?",
    options: [
      "To increase friction with the road to stop faster.",
      "To prevent the tires from getting hot.",
      "To allow accumulated static charge to flow safely to the road.",
      "To insulate the tanker from lightning strikes."
    ],
    correct: 2,
    explanation: "Conducting rubber allows electrostatic charge accumulated on the tanker body due to air resistance or fuel sloshing to continuously drain to the ground."
  },
  {
    question: "Which of the following is NOT an electrostatic hazard?",
    options: [
      "Sparks in an operating theatre where flammable gases are used.",
      "An electric shock felt when touching the metal casing of a faulty electrical appliance.",
      "Charge buildup on an aircraft body during flight.",
      "Spark discharge during powder flow in a silo."
    ],
    correct: 1,
    explanation: "A shock from a faulty appliance casing is a mains electricity hazard caused by current leakage (requiring a fuse/ground wire), not static electricity."
  },
  {
    question: "During refuelling of an aircraft, what is the primary cause of charge accumulation?",
    options: [
      "The aircraft engine's combustion process.",
      "Friction between the moving fuel and the fuel hose pipe.",
      "Solar radiation charging the wings.",
      "Electromagnetic waves from the control tower."
    ],
    correct: 1,
    explanation: "Fuel flowing through a hose rubs against the inner walls of the hose, transferring electrons and causing static charge buildup on both hose and plane."
  },
  {
    question: "Why does a worker handling microchips wear a wrist strap containing a conductor?",
    options: [
      "To keep their hands warm.",
      "To prevent electricity from the mains shocking them.",
      "To continuously discharge any static buildup on their body to the ground.",
      "To increase the resistance of their skin."
    ],
    correct: 2,
    explanation: "The strap earths the worker's body, preventing static charge accumulation that could otherwise discharge into and destroy delicate microchips."
  },
  {
    question: "What physical danger is directly caused by a sudden electrostatic discharge in a flour mill?",
    options: [
      "Corrosion of metal machinery.",
      "Chemical poisoning of the flour.",
      "A dust explosion due to flour particles igniting.",
      "Short-circuiting the main power grid."
    ],
    correct: 2,
    explanation: "Flour dust in the air is highly flammable. A static spark can supply the activation energy to initiate a rapid combustion reaction (dust explosion)."
  },
  {
    question: "How does increasing the humidity of the air reduce static charge buildup?",
    options: [
      "Moist air acts as a better insulator.",
      "Water droplets in moist air conduct charges away from surfaces slowly.",
      "Moisture reduces the friction coefficient to zero.",
      "Humid air prevents electrons from moving inside materials."
    ],
    correct: 1,
    explanation: "Water vapor in humid air makes the air slightly conductive, allowing accumulated surface static charges to slowly and safely bleed away into the atmosphere."
  },
  {
    question: "Why is a metal chain sometimes seen dragging behind fuel delivery trucks?",
    options: [
      "To make noise to warn pedestrians.",
      "To provide earthing and drain accumulated static electricity to the road surface.",
      "To keep the spare tire secure.",
      "To measure the ground clearance of the truck."
    ],
    correct: 1,
    explanation: "The metal chain acts as a conductor, earthing the truck by providing a path for static charges to discharge to the asphalt road."
  },
  {
    question: "Which statement best explains why static charges remain on insulators?",
    options: [
      "Insulators have free-moving electrons that block external charge.",
      "Charges are unable to move easily through insulating materials to escape.",
      "Insulators always attract positive charge.",
      "Friction only occurs on insulators."
    ],
    correct: 1,
    explanation: "In an insulator, electrons are tightly bound to atoms and cannot flow freely. Hence, charges deposited on an insulator remain localized."
  },
  {
    question: "A lightning conductor is made of copper. What is its main function?",
    options: [
      "To attract lightning away from other buildings.",
      "To store the lightning's electrical energy for home use.",
      "To provide a low-resistance path to conduct lightning current safely to earth.",
      "To insulate the building's roof."
    ],
    correct: 2,
    explanation: "It provides a direct, low-resistance path to ground, bypassing the high-resistance building structure and avoiding thermal or mechanical destruction."
  },
  {
    question: "Which of the following materials is an anti-static material?",
    options: [
      "A dry polyester sheet.",
      "A plastic casing that accumulates positive charge.",
      "A polymer blended with conducting fibres.",
      "A thick piece of dry glass."
    ],
    correct: 2,
    explanation: "Anti-static materials are designed to prevent static charge buildup, often by incorporating microscopic conducting fibers to leak charges away."
  },
  {
    question: "Why is an electrostatic spark dangerous near flammable gases?",
    options: [
      "It causes the gas to condense into liquid.",
      "It can ignite the gas, leading to a fire or explosion.",
      "It removes oxygen from the room.",
      "It decreases the temperature of the room."
    ],
    correct: 1,
    explanation: "The heat from the spark can ignite the flammable gas-air mixture, triggering an explosion."
  },
  {
    question: "Under which condition is a spark most likely to form between a charged conductor and an earthed conductor?",
    options: [
      "When they are far apart.",
      "When the air between them is highly humid.",
      "When the potential difference is large and they are close.",
      "When they are made of identical insulating materials."
    ],
    correct: 2,
    explanation: "A spark occurs when the electric field exceeds the breakdown strength of air, which happens when the potential difference is high and the distance is small."
  },
  {
    question: "A plastic comb becomes negatively charged when rubbed with a wool cloth. Which statement is correct?",
    options: [
      "The wool cloth gained protons.",
      "The plastic comb gained electrons.",
      "The wool cloth gained electrons.",
      "The plastic comb lost protons."
    ],
    correct: 1,
    explanation: "Charging by friction involves the transfer of electrons. The comb becomes negatively charged because it gained electrons from the wool."
  },
  {
    question: "What does the process of 'earthing' do to a positively charged metal sphere?",
    options: [
      "Electrons flow from the earth to the sphere to neutralize it.",
      "Protons flow from the sphere into the earth.",
      "Positive charges flow from the earth to the sphere.",
      "Electrons flow from the sphere into the earth."
    ],
    correct: 0,
    explanation: "Since protons cannot move, earthing a positive sphere causes negative electrons to flow UP from the earth to neutralize the positive excess."
  },
  {
    question: "What happens to electrons when a negatively charged rod is earthed?",
    options: [
      "Electrons flow from the rod to the earth.",
      "Electrons flow from the earth to the rod.",
      "Protons flow from the earth to the rod.",
      "The rod gains more negative charge."
    ],
    correct: 0,
    explanation: "The excess electrons on the negatively charged rod flow down into the earth, leaving the rod neutral."
  },
  {
    question: "Which of the following is a domestic hazard associated with electricity but NOT static electricity?",
    options: [
      "An overloaded power socket catching fire.",
      "A spark igniting butane gas on a stove.",
      "Static shock when stepping out of a car.",
      "Dust accumulation on television screens."
    ],
    correct: 0,
    explanation: "An overloaded socket involves high electrical currents from mains electricity (current electricity), whereas static electricity involves stationary charges."
  },
  {
    question: "Why do dust particles easily stick to a television screen?",
    options: [
      "The screen is magnetized when turned on.",
      "The screen becomes electrostatically charged and induces charges on dust particles.",
      "The screen heats up and melts the dust.",
      "The dust particles are chemically attracted to glass."
    ],
    correct: 1,
    explanation: "The television screen builds up a static charge, which attracts neutral dust particles by inducing an opposite charge on the side closest to the screen."
  },
  {
    question: "Which of the following is the most suitable safety gear for a worker refuelling an aircraft?",
    options: [
      "Thick plastic boots to block current.",
      "Anti-static clothing and conducting shoes.",
      "Woolen sweaters to absorb charges.",
      "Rubber gloves to prevent contact with metal."
    ],
    correct: 1,
    explanation: "Anti-static clothing and conducting shoes prevent the buildup of static charges on the worker's body, allowing any charges to drain to the ground."
  },
  {
    question: "In which of the following processes is electrostatic charge buildup intentionally utilized rather than avoided as a hazard?",
    options: [
      "Pumping oil into storage tanks.",
      "Operating room ventilation.",
      "Photocopying and electrostatic precipitators.",
      "Manufacturing semiconductor microprocessor chips."
    ],
    correct: 2,
    explanation: "Photocopiers and electrostatic precipitators (air filters) deliberately use static charges to attract toner or dust particles. The other choices list hazards."
  },
  {
    question: "Why is lightning considered a static electricity phenomenon?",
    options: [
      "It only occurs when clouds remain completely still.",
      "It is the discharge of massive amounts of accumulated static charge in clouds.",
      "It does not involve any moving charges.",
      "It operates under low voltages."
    ],
    correct: 1,
    explanation: "Friction between ice particles and water droplets in clouds creates a huge buildup of static charge, which eventually discharges as lightning."
  },
  {
    question: "Why does dry weather increase the risk of receiving an electric shock from a door handle?",
    options: [
      "Dry air conducts electricity much better than humid air.",
      "Dry air prevents static charge from escaping into the atmosphere, causing more buildup.",
      "Metal door handles become magnetic in dry weather.",
      "Human skin loses all resistance when dry."
    ],
    correct: 1,
    explanation: "In dry weather, the low water vapor content prevents charges from leaking away from the body, leading to higher charge accumulation and sudden discharges."
  },
  {
    question: "How do aircraft dissipate static charge built up during flight?",
    options: [
      "They have static dischargers (wicks) on their wings to leak charge into the air.",
      "They stop mid-air to let charges drop off.",
      "They are coated with thick layers of plastic paint.",
      "They carry lightning rods on their tail."
    ],
    correct: 0,
    explanation: "Static discharge wicks on wingtips have sharp points that allow static charges accumulated from friction with air molecules to leak back into the atmosphere."
  },
  {
    question: "A metal rod held in a hand is rubbed with wool. Why does it not show any static charge?",
    options: [
      "The metal rod cannot be charged by friction.",
      "The human hand and body act as conductors, earthing the rod immediately.",
      "Wool is not capable of charging metals.",
      "Metals can only accumulate positive charges."
    ],
    correct: 1,
    explanation: "Metal is a conductor. Any charge generated by rubbing is conducted through the hand and body directly to the earth, so it remains neutral."
  },
  {
    question: "What is the primary danger when powder is poured quickly through a metal chute?",
    options: [
      "The chute will melt due to electric current.",
      "Static charge can accumulate and discharge as a spark, igniting powder dust.",
      "The powder will turn into liquid due to pressure.",
      "The chute will become highly magnetic."
    ],
    correct: 1,
    explanation: "Pouring powder creates friction, leading to static charge accumulation. If a spark discharges, it can trigger a dangerous dust explosion."
  },
  {
    question: "Why must the hose and aircraft be earthed together before fuel starts flowing?",
    options: [
      "To make sure the fuel doesn't spill.",
      "To equalize their electric potentials and prevent sparks.",
      "To warm up the metal parts.",
      "To increase the speed of the fuel flow."
    ],
    correct: 1,
    explanation: "Earthing them together prevents any potential difference from building up between the nozzle and the fuel tank, eliminating spark hazards."
  },
  {
    question: "Which of the following is true about static discharge?",
    options: [
      "It requires a complete circuit to occur.",
      "It is a sudden flow of charge between objects at different electrical potentials.",
      "It only occurs through wires.",
      "It only happens between two insulators."
    ],
    correct: 1,
    explanation: "Static discharge is the rapid, brief transfer of net charges between objects due to a large potential difference (voltage)."
  },
  {
    question: "How does wearing anti-static shoes protect electronic components?",
    options: [
      "By preventing the technician from slipping.",
      "By allowing static charges on the technician's body to flow to the floor.",
      "By insulating the technician from the floor.",
      "By absorbing magnetic fields."
    ],
    correct: 1,
    explanation: "Anti-static shoes contain conducting pathways that allow charge buildup on the body to bleed off safely into the floor rather than discharging into electronics."
  }
];

// Flashcard Deck Definition
const flashcardsData = [
  {
    front: 'Under what conditions does static electricity build up?',
    back: 'When charges cannot flow away. This happens on insulating surfaces or under dry atmospheric conditions.'
  },
  {
    front: 'Why is a sudden static discharge dangerous?',
    back: 'The sudden flow of charge creates a spark, which releases heat and can ignite flammable gases, liquids, or powders.'
  },
  {
    front: 'What hazard is present during aircraft refuelling?',
    back: 'Friction between moving fuel and the hose generates static charge on the aircraft body. A spark can ignite fuel vapours.'
  },
  {
    front: 'How is the fuel tanker hazard minimized?',
    back: 'By using an earthing cable to connect the tanker to the ground before fuel transfer, and fitting conducting rubber tires.'
  },
  {
    front: 'Why do operating theatres require safety precautions against static?',
    back: 'Sparks from surgeons or equipment could ignite explosive mixtures of anesthetic gases or oxygen.'
  },
  {
    front: 'What static risk is associated with electronics manufacturing?',
    back: 'Electrostatic discharge (ESD) from human hands can melt microcircuits and destroy transistors.'
  },
  {
    front: 'What is earthing in the context of static hazards?',
    back: 'Connecting a charged conductor to the earth with a low-resistance wire, allowing electrons to flow and neutralize the charge.'
  },
  {
    front: 'How do anti-static wrist straps work?',
    back: 'They contain a high-resistance conducting path that continuously drains static charge from the wearer to the ground.'
  },
  {
    front: 'Why does high humidity reduce static charge buildup?',
    back: 'Water vapor in moist air makes the air slightly conductive, allowing static charge to bleed off slowly and continuously.'
  },
  {
    front: 'Why are lightning conductors installed on tall buildings?',
    back: 'To provide a safe, low-resistance path for lightning current to flow directly to earth, protecting the building\'s structure.'
  },
  {
    front: 'Why do dry powders pose an electrostatic hazard?',
    back: 'Friction as powder is poured generates charge. The high concentration of dust particles in the air can ignite, causing a dust explosion.'
  },
  {
    front: 'Why can a metal key or key chain shock you after walking on a carpet?',
    back: 'Your charged body discharges through the low resistance of the metal key to the earthed door handle, creating a rapid, concentrated spark.'
  }
];

// --- APP INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  initConfetti();
  initConceptIntro();
  initPartA();
  initQuiz();
  initFlashcards();
});

// --- NAVIGATION ---
function setupNavigation() {
  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = btn.getAttribute('data-target');
      switchTab(target);
    });
  });
}

function switchTab(viewName) {
  state.activeView = viewName;
  
  // Update nav buttons
  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach(btn => {
    if (btn.getAttribute('data-target') === viewName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Toggle sections
  const sections = document.querySelectorAll('.view-section');
  sections.forEach(sec => {
    sec.classList.remove('active');
  });

  let targetId = 'view-' + viewName;
  if (viewName === 'exploration') {
    // Determine which sub-part to show when clicking explore
    targetId = 'view-exploration';
    document.getElementById('explore-part-a').classList.remove('hidden');
    document.getElementById('explore-part-b').classList.add('hidden');
  }

  const activeSec = document.getElementById(targetId);
  if (activeSec) {
    activeSec.classList.add('active');
  }
}

// --- CONFETTI CELEBRATION ENGINE ---
let canvas, ctx, confettiParticles = [];
function initConfetti() {
  canvas = document.getElementById('confetti-canvas');
  ctx = canvas.getContext('2d');
  
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
}

function triggerCelebration() {
  confettiParticles = [];
  const colors = [state.activeView === 'concept' ? '#00f2fe' : '#ff007f', '#00f2fe', '#ff9900', '#39ff14', '#ffffff'];
  for (let i = 0; i < 120; i++) {
    confettiParticles.push({
      x: canvas.width / 2,
      y: canvas.height + 20,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedX: (Math.random() - 0.5) * 12,
      speedY: -Math.random() * 15 - 10,
      gravity: 0.4,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10
    });
  }
  requestAnimationFrame(updateConfetti);
}

function updateConfetti() {
  if (confettiParticles.length === 0) return;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  confettiParticles.forEach((p, index) => {
    p.speedY += p.gravity;
    p.x += p.speedX;
    p.y += p.speedY;
    p.rotation += p.rotationSpeed;
    
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rotation * Math.PI) / 180);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
    ctx.restore();
    
    // Remove out of screen particles
    if (p.y > canvas.height + 20) {
      confettiParticles.splice(index, 1);
    }
  });
  
  if (confettiParticles.length > 0) {
    requestAnimationFrame(updateConfetti);
  }
}

// --- SECTION 1: CONCEPT SIMULATIONS ---
const conceptSVGs = {
  aircraft: `<svg viewBox="0 0 400 160" width="100%" height="100%">
    <!-- Ground line -->
    <line x1="10" y1="145" x2="390" y2="145" stroke="#333" stroke-width="2" />
    
    <!-- Clouds -->
    <path d="M 30,30 Q 45,15 60,30 Q 75,15 90,30 Q 105,30 110,40 Q 60,50 30,30 Z" fill="#1b1f38" opacity="0.4"/>
    
    <!-- Fuel Truck -->
    <rect x="30" y="90" width="80" height="40" fill="#222" rx="4"/>
    <circle cx="50" cy="135" r="8" fill="#444"/>
    <circle cx="90" cy="135" r="8" fill="#444"/>
    <rect x="80" y="80" width="30" height="20" fill="#2c163a" rx="2"/>
    <text x="45" y="115" fill="#f0f3fa" font-size="10" font-weight="bold">FUEL</text>

    <!-- Aircraft Body -->
    <g id="aircraft-body">
      <ellipse cx="280" cy="85" rx="70" ry="18" fill="#1e293b" />
      <path d="M 230,85 L 200,60 L 210,60 L 250,85 Z" fill="#1e293b" /> <!-- Wing L -->
      <path d="M 270,85 L 300,120 L 315,120 L 290,85 Z" fill="#334155" /> <!-- Wing R -->
      <path d="M 340,85 L 360,60 L 368,60 L 350,85 Z" fill="#1e293b" /> <!-- Tail -->
      <circle cx="230" cy="115" r="6" fill="#444"/> <!-- Gear L -->
      <circle cx="310" cy="115" r="6" fill="#444"/> <!-- Gear R -->
    </g>

    <!-- Fuel Hose -->
    <path id="hose" d="M 110,105 Q 165,130 220,100" fill="none" stroke="#6b7280" stroke-width="4"/>
    <path id="safety-wire" d="M 110,90 L 220,80" fill="none" stroke="#39ff14" stroke-width="2" stroke-dasharray="4" opacity="0"/>

    <text x="140" y="140" fill="#8e9bb0" font-size="10">Insulating Tires isolate plane</text>
  </svg>`,

  tanker: `<svg viewBox="0 0 400 160" width="100%" height="100%">
    <line x1="10" y1="145" x2="390" y2="145" stroke="#333" stroke-width="2" />
    
    <!-- Fuel Tanker -->
    <g id="tanker-body">
      <rect x="100" y="65" width="160" height="55" fill="#1e293b" rx="6" />
      <rect x="260" y="80" width="40" height="40" fill="#0f172a" rx="4" />
      <circle cx="130" cy="130" r="12" fill="#333" />
      <circle cx="170" cy="130" r="12" fill="#333" />
      <circle cx="270" cy="130" r="12" fill="#333" />
    </g>

    <!-- Pipe / Dispenser -->
    <rect x="30" y="60" width="40" height="85" fill="#2c163a" />
    <path id="dispenser-pipe" d="M 70,80 Q 90,80 110,80" fill="none" stroke="#6b7280" stroke-width="5"/>
    <path id="earth-strap" d="M 120,120 L 120,145" fill="none" stroke="#39ff14" stroke-width="3" opacity="0"/>
    <text x="120" y="95" fill="#f0f3fa" font-size="11" font-weight="bold">PETROL TANKER</text>
  </svg>`,

  theatre: `<svg viewBox="0 0 400 160" width="100%" height="100%">
    <!-- Floor -->
    <line x1="10" y1="140" x2="390" y2="140" stroke="#444" stroke-width="2" />
    
    <!-- Operating Table -->
    <rect x="130" y="90" width="140" height="15" fill="#334155" rx="3" />
    <rect x="190" y="105" width="20" height="35" fill="#1e293b" />
    
    <!-- Surgeon -->
    <g id="surgeon">
      <circle cx="100" cy="80" r="10" fill="#0d9488" />
      <rect x="90" y="90" width="20" height="40" fill="#0d9488" rx="4" />
      <line x1="100" y1="130" x2="95" y2="140" stroke="#0d9488" stroke-width="4"/>
      <line x1="100" y1="130" x2="105" y2="140" stroke="#0d9488" stroke-width="4"/>
      <!-- Surgeon arm reaching out -->
      <line x1="105" y1="95" x2="135" y2="95" stroke="#0d9488" stroke-width="4" stroke-linecap="round"/>
    </g>

    <!-- Patient outline -->
    <ellipse cx="200" cy="83" rx="55" ry="8" fill="#94a3b8" />
    <circle cx="140" cy="80" r="7" fill="#fbcfe8" />

    <!-- Humid Air Indicator -->
    <g id="humid-particles" opacity="0"></g>
  </svg>`,

  electronics: `<svg viewBox="0 0 400 160" width="100%" height="100%">
    <rect x="30" y="110" width="340" height="30" fill="#1e293b" rx="4" />
    
    <!-- Circuit Board -->
    <g id="pcb">
      <rect x="140" y="95" width="120" height="15" fill="#065f46" rx="2" />
      <!-- Silicon chip -->
      <rect x="180" y="85" width="40" height="10" fill="#111827" />
      <line x1="185" y1="95" x2="185" y2="100" stroke="#fbbf24" stroke-width="2" />
      <line x1="195" y1="95" x2="195" y2="100" stroke="#fbbf24" stroke-width="2" />
      <line x1="205" y1="95" x2="205" y2="100" stroke="#fbbf24" stroke-width="2" />
      <line x1="215" y1="95" x2="215" y2="100" stroke="#fbbf24" stroke-width="2" />
    </g>

    <!-- Hand ESD -->
    <g id="hand-operator">
      <!-- Arm -->
      <rect x="280" y="30" width="30" height="70" fill="#fbcfe8" rx="5" transform="rotate(-30 280 30)" />
    </g>
    
    <!-- Wrist Strap -->
    <path id="wrist-strap" d="M 290,52 Q 330,40 370,120" fill="none" stroke="#00f2fe" stroke-width="3" stroke-dasharray="3" opacity="0" />
    <text x="120" y="152" fill="#8e9bb0" font-size="10">Tech body accumulates static without grounding</text>
  </svg>`
};

const conceptExplanations = {
  aircraft: {
    start: "A fast flow of fuel generates friction inside the hose, depositing electrons onto the aircraft's metal body. Insulating tires isolate the plane, meaning charge builds up.",
    spark: "DANGER! The high potential difference between plane body and nozzle generates a spark. Near fuel vapors, this triggers a catastrophic aircraft explosion!",
    safe: "Safe! The green earthing wire provides a low-resistance pathway to drain all static charges directly to the earth. No potential difference can build up, eliminating spark risk."
  },
  tanker: {
    start: "As fuel is pumped, charge accumulates on the metal hull of the tanker. The fuel truck is insulated by normal rubber tires, creating a high potential difference.",
    spark: "DANGER! A spark jumps between the tanker and the earthed nozzle, igniting vaporised petrol. This results in a petrol station explosion!",
    safe: "Safe! The metal earthing strap connects the tanker hull to ground, draining charge continuously. Spark danger is completely eliminated."
  },
  theatre: {
    start: "A surgeon walking on insulating floors builds up electric charge on their body. Operating theaters contain highly flammable gases and high oxygen concentrations.",
    spark: "DANGER! Reaching for metal surgical equipment causes a spark discharge, which can immediately ignite anesthetic gases, causing a sudden room fire.",
    safe: "Safe! Conducting floors leak charge away continuously. Increased room humidity allows microscopic air droplets to conduct charge away, keeping conditions safe."
  },
  electronics: {
    start: "Technician's hand accumulates charge from clothing friction. Reaching for the circuit board causes a spark to jump to the microchip.",
    spark: "DAMAGE! The electrostatic discharge (ESD) generates localized heat, melting microscopic silicon transistors on the chip, ruining the motherboard.",
    safe: "Safe! The anti-static wrist strap connects the operator's body directly to ground, leaking charge away constantly. The microchip remains undamaged."
  }
};

function initConceptIntro() {
  const selectors = document.querySelectorAll('.sim-selector');
  selectors.forEach(sel => {
    sel.addEventListener('click', () => {
      selectors.forEach(s => s.classList.remove('active'));
      sel.classList.add('active');
      state.currentSimScenario = sel.getAttribute('data-scenario');
      resetSimulation();
    });
  });

  document.getElementById('btn-trigger-charge').addEventListener('click', runChargeSimulation);
  document.getElementById('btn-trigger-spark').addEventListener('click', triggerSparkSimulation);
  document.getElementById('btn-apply-safety').addEventListener('click', applySafetySimulation);

  resetSimulation();
}

function resetSimulation() {
  state.simChargeLevel = 0;
  state.simEarthed = false;
  
  const viewport = document.getElementById('sim-visual');
  viewport.innerHTML = conceptSVGs[state.currentSimScenario];
  
  document.getElementById('btn-trigger-charge').disabled = false;
  document.getElementById('btn-trigger-spark').disabled = true;
  document.getElementById('btn-apply-safety').disabled = true;

  document.getElementById('sim-explanation').innerText = conceptExplanations[state.currentSimScenario].start;
  document.getElementById('sim-explanation').style.borderColor = 'var(--neon-cyan)';
  
  // Clean up any extra charges visual elements
  const charges = viewport.querySelectorAll('.charge');
  charges.forEach(c => c.remove());
}

function runChargeSimulation() {
  state.simChargeLevel = 5;
  const viewport = document.getElementById('sim-visual');
  
  // Inject some charges inside the SVG viewport
  const container = viewport.querySelector('svg');
  if (!container) return;

  // Let's generate absolute positioned charge indicators on top of the elements
  let coords = [];
  if (state.currentSimScenario === 'aircraft') {
    coords = [{x: 230, y: 75}, {x: 250, y: 80}, {x: 270, y: 70}, {x: 300, y: 85}, {x: 280, y: 95}];
  } else if (state.currentSimScenario === 'tanker') {
    coords = [{x: 120, y: 75}, {x: 160, y: 85}, {x: 200, y: 75}, {x: 240, y: 80}, {x: 180, y: 95}];
  } else if (state.currentSimScenario === 'theatre') {
    coords = [{x: 95, y: 95}, {x: 105, y: 105}, {x: 100, y: 115}, {x: 105, y: 85}, {x: 95, y: 120}];
  } else if (state.currentSimScenario === 'electronics') {
    coords = [{x: 250, y: 65}, {x: 260, y: 75}, {x: 270, y: 55}, {x: 280, y: 85}, {x: 240, y: 75}];
  }

  coords.forEach((coord, i) => {
    setTimeout(() => {
      const isNegative = i % 2 === 0;
      const chargeText = isNegative ? '-' : '+';
      const chargeClass = isNegative ? 'charge neg' : 'charge pos';
      
      const el = document.createElementNS("http://www.w3.org/2000/svg", 'text');
      el.setAttribute('x', coord.x);
      el.setAttribute('y', coord.y);
      el.setAttribute('fill', isNegative ? '#ff007f' : '#00f2fe');
      el.setAttribute('font-weight', 'bold');
      el.setAttribute('font-size', '16px');
      el.setAttribute('class', 'sim-charge-indicator');
      el.textContent = chargeText;
      container.appendChild(el);
    }, i * 200);
  });

  document.getElementById('btn-trigger-charge').disabled = true;
  document.getElementById('btn-trigger-spark').disabled = false;
  document.getElementById('btn-apply-safety').disabled = false;
  
  document.getElementById('sim-explanation').innerText = "Static charge has built up. We have a high potential difference and dry conditions. Spark discharge can now occur!";
}

function triggerSparkSimulation() {
  const container = document.querySelector('#sim-visual svg');
  if (!container) return;

  // Draw a zigzag spark path dynamically
  let dPath = "";
  if (state.currentSimScenario === 'aircraft') {
    dPath = "M 220,100 L 205,108 L 195,102 L 180,112 L 165,130";
  } else if (state.currentSimScenario === 'tanker') {
    dPath = "M 110,80 L 100,85 L 90,75 L 80,80 L 70,80";
  } else if (state.currentSimScenario === 'theatre') {
    dPath = "M 135,95 L 145,92 L 152,98 L 162,93 L 170,90";
  } else if (state.currentSimScenario === 'electronics') {
    dPath = "M 220,70 L 210,75 L 205,80 L 200,85";
  }

  const sparkPath = document.createElementNS("http://www.w3.org/2000/svg", 'path');
  sparkPath.setAttribute('d', dPath);
  sparkPath.setAttribute('class', 'svg-spark-line');
  sparkPath.setAttribute('fill', 'none');
  container.appendChild(sparkPath);

  document.getElementById('sim-explanation').innerText = conceptExplanations[state.currentSimScenario].spark;
  document.getElementById('sim-explanation').style.borderColor = 'var(--neon-red)';
  
  document.getElementById('btn-trigger-spark').disabled = true;
  document.getElementById('btn-apply-safety').disabled = true;

  // Add flashing screen effect
  const view = document.getElementById('sim-visual');
  view.style.boxShadow = '0 0 30px rgba(255, 51, 102, 0.4)';
  setTimeout(() => {
    view.style.boxShadow = 'none';
  }, 400);
}

function applySafetySimulation() {
  const container = document.querySelector('#sim-visual svg');
  if (!container) return;

  // Remove any spark and charges
  const spark = container.querySelector('.svg-spark-line');
  if (spark) spark.remove();
  
  const charges = container.querySelectorAll('.sim-charge-indicator');
  charges.forEach(c => c.remove());

  // Show earthing mechanism visually
  if (state.currentSimScenario === 'aircraft') {
    const wire = container.querySelector('#safety-wire');
    if (wire) wire.style.opacity = "1";
  } else if (state.currentSimScenario === 'tanker') {
    const strap = container.querySelector('#earth-strap');
    if (strap) strap.style.opacity = "1";
  } else if (state.currentSimScenario === 'theatre') {
    // Modify visual to reflect conducting path
    const floor = container.querySelector('line');
    if (floor) {
      floor.setAttribute('stroke', '#39ff14');
      floor.style.filter = 'drop-shadow(0 0 5px var(--neon-green))';
    }
  } else if (state.currentSimScenario === 'electronics') {
    const strap = container.querySelector('#wrist-strap');
    if (strap) strap.style.opacity = "1";
  }

  document.getElementById('sim-explanation').innerText = conceptExplanations[state.currentSimScenario].safe;
  document.getElementById('sim-explanation').style.borderColor = 'var(--neon-green)';

  document.getElementById('btn-trigger-charge').disabled = true;
  document.getElementById('btn-trigger-spark').disabled = true;
  document.getElementById('btn-apply-safety').disabled = true;

  triggerCelebration();
}

// --- SECTION 2: INTERACTIVE EXPLORATION ---

// Initialize Part A (Hazard vs Safe)
function initPartA() {
  state.partAScenarios = [...scenariosData];
  shuffleArray(state.partAScenarios);
  state.currentPartAIndex = 0;
  state.partAScore = 0;
  state.partBScenarios = []; // To hold hazards identified in A
  state.partBScore = 0;
  state.currentPartBIndex = 0;

  renderPartACard();
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function renderPartACard() {
  const currentScen = state.partAScenarios[state.currentPartAIndex];
  
  // Progress counter
  document.getElementById('part-a-progress').innerText = `${state.currentPartAIndex + 1} / 10`;
  const pct = ((state.currentPartAIndex) / 10) * 100;
  document.getElementById('part-a-progress-fill').style.width = `${pct}%`;

  // Content update
  document.getElementById('scenario-title').innerText = currentScen.title;
  document.getElementById('scenario-description').innerText = currentScen.description;

  // Render minimal inline visual SVG
  document.getElementById('scenario-svg').innerHTML = getMinimalScenarioSVG(currentScen.svgType);

  // Hide feedback, show actions
  document.getElementById('part-a-actions').classList.remove('hidden');
  document.getElementById('part-a-feedback').classList.add('hidden');
}

function getMinimalScenarioSVG(type) {
  // Return sleek simplified SVGs for exploration cards
  switch(type) {
    case 'aircraft':
      return `<svg viewBox="0 0 100 80" class="mini-svg" style="width:100%;height:100%"><circle cx="50" cy="40" r="15" fill="none" stroke="var(--neon-cyan)" stroke-width="2"/><path d="M25,40 L75,40 M50,15 L50,65" stroke="var(--neon-cyan)" stroke-width="2"/><text x="42" y="44" fill="#fff" font-size="12">✈️</text></svg>`;
    case 'tanker':
      return `<svg viewBox="0 0 100 80" class="mini-svg" style="width:100%;height:100%"><rect x="25" y="25" width="50" height="30" rx="5" fill="none" stroke="var(--neon-amber)" stroke-width="2"/><circle cx="35" cy="62" r="6" fill="none" stroke="var(--neon-amber)" stroke-width="2"/><circle cx="65" cy="62" r="6" fill="none" stroke="var(--neon-amber)" stroke-width="2"/><text x="42" y="44" fill="#fff" font-size="12">⛽</text></svg>`;
    case 'carpet':
      return `<svg viewBox="0 0 100 80" class="mini-svg" style="width:100%;height:100%"><line x1="10" y1="60" x2="90" y2="60" stroke="var(--text-muted)" stroke-width="4"/><text x="42" y="45" fill="#fff" font-size="20">🚶</text></svg>`;
    case 'theatre':
      return `<svg viewBox="0 0 100 80" class="mini-svg" style="width:100%;height:100%"><rect x="30" y="45" width="40" height="15" rx="3" fill="none" stroke="var(--neon-pink)" stroke-width="2"/><text x="42" y="32" fill="#fff" font-size="16">🏥</text></svg>`;
    case 'electronics':
      return `<svg viewBox="0 0 100 80" class="mini-svg" style="width:100%;height:100%"><rect x="20" y="20" width="60" height="40" rx="3" fill="none" stroke="var(--neon-cyan)" stroke-width="2"/><text x="42" y="46" fill="#fff" font-size="18">💻</text></svg>`;
    case 'lightning':
      return `<svg viewBox="0 0 100 80" class="mini-svg" style="width:100%;height:100%"><path d="M50,15 L35,45 L50,45 L40,75 L70,35 L52,35 Z" fill="none" stroke="var(--neon-amber)" stroke-width="2"/></svg>`;
    case 'powders':
      return `<svg viewBox="0 0 100 80" class="mini-svg" style="width:100%;height:100%"><path d="M30,20 L70,20 L55,50 L45,50 Z" fill="none" stroke="var(--neon-cyan)" stroke-width="2"/><circle cx="50" cy="65" r="3" fill="var(--neon-cyan)"/></svg>`;
    case 'car':
      return `<svg viewBox="0 0 100 80" class="mini-svg" style="width:100%;height:100%"><rect x="20" y="30" width="60" height="25" rx="4" fill="none" stroke="var(--text-muted)" stroke-width="2"/><circle cx="35" cy="60" r="7" fill="none" stroke="var(--text-muted)" stroke-width="2"/><circle cx="65" cy="60" r="7" fill="none" stroke="var(--text-muted)" stroke-width="2"/></svg>`;
    case 'synthetic':
      return `<svg viewBox="0 0 100 80" class="mini-svg" style="width:100%;height:100%"><text x="40" y="45" fill="#fff" font-size="28">👕</text></svg>`;
    case 'door':
      return `<svg viewBox="0 0 100 80" class="mini-svg" style="width:100%;height:100%"><rect x="35" y="15" width="30" height="55" fill="none" stroke="var(--text-muted)" stroke-width="2"/><circle cx="43" cy="45" r="3" fill="var(--text-muted)"/></svg>`;
    default:
      return `<svg viewBox="0 0 100 80"></svg>`;
  }
}

function handlePartAAnswer(studentSaysHazard) {
  const currentScen = state.partAScenarios[state.currentPartAIndex];
  const isCorrect = (studentSaysHazard === currentScen.isHazard);
  
  if (isCorrect) {
    state.partAScore++;
    showPartAFeedback(true, currentScen.isHazard ? currentScen.feedbackHazard : currentScen.feedbackSafe);
  } else {
    showPartAFeedback(false, currentScen.isHazard ? currentScen.feedbackSafe : currentScen.feedbackHazard);
  }

  // If this was indeed a hazard scenario, queue it up for Part B
  if (currentScen.isHazard) {
    state.partBScenarios.push(currentScen);
  }
}

function showPartAFeedback(isCorrect, text) {
  document.getElementById('part-a-actions').classList.add('hidden');
  const feedback = document.getElementById('part-a-feedback');
  feedback.classList.remove('hidden');
  
  const badge = document.getElementById('part-a-result-badge');
  const nextBtn = document.getElementById('btn-part-a-next');

  if (isCorrect) {
    badge.innerText = "Correct!";
    badge.className = "badge success";
    triggerCelebration();
  } else {
    badge.innerText = "Incorrect";
    badge.className = "badge danger";
  }

  document.getElementById('part-a-explanation').innerText = text;

  nextBtn.onclick = () => {
    state.currentPartAIndex++;
    if (state.currentPartAIndex < state.partAScenarios.length) {
      renderPartACard();
    } else {
      // Done with A, progress to Part B
      document.getElementById('explore-part-a').classList.add('hidden');
      document.getElementById('explore-part-b').classList.remove('hidden');
      initPartB();
    }
  };
}

// Initialize Part B (Staying Safe)
function initPartB() {
  // Randomise the order of the identified hazards for Part B
  shuffleArray(state.partBScenarios);
  state.currentPartBIndex = 0;
  state.partBScore = 0;
  
  renderPartBCard();
}

function renderPartBCard() {
  if (state.partBScenarios.length === 0) {
    // Fallback if somehow no hazards were selected
    finishPartB();
    return;
  }

  const currentScen = state.partBScenarios[state.currentPartBIndex];
  const questionData = safetyQuestions[currentScen.id];

  // Update progress
  document.getElementById('part-b-progress').innerText = `${state.currentPartBIndex + 1} / ${state.partBScenarios.length}`;
  const pct = ((state.currentPartBIndex) / state.partBScenarios.length) * 100;
  document.getElementById('part-b-progress-fill').style.width = `${pct}%`;

  // Content
  document.getElementById('safety-scenario-title').innerText = currentScen.title;
  document.getElementById('safety-scenario-desc').innerText = currentScen.description;
  
  // Render options grid
  const optionsGrid = document.getElementById('safety-options');
  optionsGrid.innerHTML = '';

  // Get options and shuffle their visual display
  let indexedOptions = questionData.options.map((opt, idx) => ({ text: opt, originalIndex: idx }));
  shuffleArray(indexedOptions);

  indexedOptions.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerText = opt.text;
    btn.onclick = () => handlePartBAnswer(btn, opt.originalIndex, questionData.correct, questionData.explanation);
    optionsGrid.appendChild(btn);
  });

  // Hide feedback
  document.getElementById('part-b-feedback').classList.add('hidden');
}

function handlePartBAnswer(selectedBtn, originalIndex, correctIndex, explanationText) {
  const options = document.querySelectorAll('#safety-options .option-btn');
  options.forEach(btn => btn.disabled = true);

  const isCorrect = (originalIndex === correctIndex);
  
  if (isCorrect) {
    state.partBScore++;
    selectedBtn.classList.add('correct');
    showPartBFeedback(true, explanationText);
  } else {
    selectedBtn.classList.add('wrong');
    // Highlight the correct one
    options.forEach(btn => {
      // Find matching button text to reveal correct choice
      const qData = safetyQuestions[state.partBScenarios[state.currentPartBIndex].id];
      if (btn.innerText === qData.options[correctIndex]) {
        btn.classList.add('correct');
      }
    });
    showPartBFeedback(false, explanationText);
  }
}

function showPartBFeedback(isCorrect, text) {
  const feedback = document.getElementById('part-b-feedback');
  feedback.classList.remove('hidden');

  const badge = document.getElementById('part-b-result-badge');
  const nextBtn = document.getElementById('btn-part-b-next');

  if (isCorrect) {
    badge.innerText = "Correct!";
    badge.className = "badge success";
    triggerCelebration();
  } else {
    badge.innerText = "Incorrect";
    badge.className = "badge danger";
  }

  document.getElementById('part-b-explanation').innerText = text;

  nextBtn.onclick = () => {
    state.currentPartBIndex++;
    if (state.currentPartBIndex < state.partBScenarios.length) {
      renderPartBCard();
    } else {
      finishPartB();
    }
  };
}

function finishPartB() {
  // Jump to Flashcards next.
  switchTab('flashcard');
}

// --- SECTION 3: COMPREHENSIVE QUIZ (MCQ) ---
function initQuiz() {
  state.quizPool = [...mcqQuizPool];
  shuffleArray(state.quizPool);
  // Pick exactly 10 questions for this attempt
  state.quizQuestions = state.quizPool.slice(0, 10);
  state.currentQuizIndex = 0;
  state.quizScore = 0;

  renderQuizQuestion();
}

function renderQuizQuestion() {
  const currentQ = state.quizQuestions[state.currentQuizIndex];
  
  // Update indicators
  document.getElementById('quiz-progress').innerText = `${state.currentQuizIndex + 1} / 10`;
  const pct = ((state.currentQuizIndex) / 10) * 100;
  document.getElementById('quiz-progress-fill').style.width = `${pct}%`;

  document.getElementById('quiz-q-index').innerText = state.currentQuizIndex + 1;
  document.getElementById('quiz-question-text').innerText = currentQ.question;

  const optionsGrid = document.getElementById('quiz-options');
  optionsGrid.innerHTML = '';

  // Options shuffling
  let indexedOpts = currentQ.options.map((opt, idx) => ({ text: opt, originalIndex: idx }));
  shuffleArray(indexedOpts);

  indexedOpts.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerText = opt.text;
    btn.onclick = () => handleQuizAnswer(btn, opt.originalIndex, currentQ.correct, currentQ.explanation);
    optionsGrid.appendChild(btn);
  });

  // Hide feedback
  document.getElementById('quiz-feedback').classList.add('hidden');
}

function handleQuizAnswer(selectedBtn, originalIndex, correctIndex, explanationText) {
  const options = document.querySelectorAll('#quiz-options .option-btn');
  options.forEach(btn => btn.disabled = true);

  const isCorrect = (originalIndex === correctIndex);
  
  if (isCorrect) {
    state.quizScore++;
    selectedBtn.classList.add('correct');
    showQuizFeedback(true, explanationText);
  } else {
    selectedBtn.classList.add('wrong');
    // Reveal correct option
    options.forEach(btn => {
      const currentQ = state.quizQuestions[state.currentQuizIndex];
      if (btn.innerText === currentQ.options[correctIndex]) {
        btn.classList.add('correct');
      }
    });
    showQuizFeedback(false, explanationText);
  }
}

function showQuizFeedback(isCorrect, text) {
  const feedback = document.getElementById('quiz-feedback');
  feedback.classList.remove('hidden');

  const badge = document.getElementById('quiz-result-badge');
  const nextBtn = document.getElementById('btn-quiz-next');

  if (isCorrect) {
    badge.innerText = "Correct!";
    badge.className = "badge success";
    triggerCelebration();
  } else {
    badge.innerText = "Incorrect";
    badge.className = "badge danger";
  }

  document.getElementById('quiz-explanation').innerText = text;

  nextBtn.onclick = () => {
    state.currentQuizIndex++;
    if (state.currentQuizIndex < 10) {
      renderQuizQuestion();
    } else {
      showFinalScores();
    }
  };
}

// --- SECTION 4: SCORING & FEEDBACK ---
function showFinalScores() {
  switchTab('score');

  // Set individual score texts
  document.getElementById('score-val-part-a').innerText = `${state.partAScore} / 10`;
  document.getElementById('score-val-part-b').innerText = `${state.partBScore} / ${state.partBScenarios.length}`;
  document.getElementById('score-val-quiz').innerText = `${state.quizScore} / 10`;

  // Calculate overall percentage
  const totalAttempted = 10 + state.partBScenarios.length + 10;
  const totalCorrect = state.partAScore + state.partBScore + state.quizScore;
  const percentage = Math.round((totalCorrect / totalAttempted) * 100);

  document.getElementById('score-val-total').innerText = `${percentage}%`;

  // Customize grade-dependent responses
  const gradeTitle = document.getElementById('grade-title');
  const gradeDesc = document.getElementById('grade-description');
  const box = document.getElementById('grade-feedback-box');

  // Remove past grades
  box.className = "grade-feedback-box";

  if (percentage >= 80) {
    gradeTitle.innerText = "🌟 Outstanding physicist! O-Level Mastered!";
    gradeDesc.innerText = "Exceptional performance. You fully understand how electrostatic charges accumulate on insulating surfaces, why spark discharges occur, and how grounding mechanisms keep processes safe.";
    box.style.borderLeft = "5px solid var(--neon-green)";
    triggerCelebration();
    // Extra celebration burst
    setTimeout(triggerCelebration, 600);
  } else if (percentage >= 50) {
    gradeTitle.innerText = "👍 Good Progress! Let's Refine Your Knowledge";
    gradeDesc.innerText = "Encouraging effort! We suggest checking Section 1 again to review exactly how electrostatic charge accumulates under dry conditions, and how earthing neutralizes potential difference.";
    box.style.borderLeft = "5px solid var(--neon-amber)";
  } else {
    gradeTitle.innerText = "🔄 Review Recommended. Let's Do This!";
    gradeDesc.innerText = "Supportive tip: Please go back to the concept simulations in Section 1. Pay close attention to what causes a spark, the dangers of combustible environments, and how earthing drains charges away.";
    box.style.borderLeft = "5px solid var(--neon-red)";
  }
}

function restartSession() {
  initPartA();
  initQuiz();
  switchTab('concept');
}

// --- SECTION 5: FLASHCARD REVISION MODE ---
function initFlashcards() {
  state.flashcards = [...flashcardsData];
  shuffleArray(state.flashcards);
  state.currentFlashcardIndex = 0;
  state.flashcardFlipped = false;

  renderFlashcard();
}

function renderFlashcard() {
  const currentCard = state.flashcards[state.currentFlashcardIndex];
  
  // Progress
  document.getElementById('flashcard-progress').innerText = `${state.currentFlashcardIndex + 1} / ${state.flashcards.length}`;
  const pct = ((state.currentFlashcardIndex + 1) / state.flashcards.length) * 100;
  document.getElementById('flashcard-progress-fill').style.width = `${pct}%`;

  // Texts
  document.getElementById('flashcard-front-text').innerText = currentCard.front;
  document.getElementById('flashcard-back-text').innerText = currentCard.back;

  // Reset flip class
  const cardElement = document.getElementById('revision-flashcard');
  cardElement.classList.remove('flipped');
  state.flashcardFlipped = false;
}

function flipFlashcard() {
  const cardElement = document.getElementById('revision-flashcard');
  cardElement.classList.toggle('flipped');
  state.flashcardFlipped = !state.flashcardFlipped;
}

function changeFlashcard(direction) {
  state.currentFlashcardIndex += direction;
  
  // Loop back logic
  if (state.currentFlashcardIndex < 0) {
    state.currentFlashcardIndex = state.flashcards.length - 1;
  } else if (state.currentFlashcardIndex >= state.flashcards.length) {
    state.currentFlashcardIndex = 0;
  }

  renderFlashcard();
}

function shuffleFlashcards() {
  shuffleArray(state.flashcards);
  state.currentFlashcardIndex = 0;
  renderFlashcard();
}
