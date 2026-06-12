// Learning Areas Definition
const LEARNING_AREAS = [
  { id: 0, title: "Types of Charge & Coulombs", icon: "fa-circle-nodes", color: "var(--neon-cyan)", desc: "Units, attraction, repulsion, and base charges." },
  { id: 1, title: "Electric Fields & Field Lines", icon: "fa-arrow-right-arrow-left", color: "var(--neon-magenta)", desc: "Field directions, patterns, and point charges." },
  { id: 2, title: "Charging by Rubbing", icon: "fa-hands-asl-interpreting", color: "var(--neon-yellow)", desc: "Electron transfer, gains, losses, and materials." },
  { id: 3, title: "Charging by Induction", icon: "fa-magnet", color: "var(--neon-green)", desc: "Conductors, earthing steps, and charge migration." },
  { id: 4, title: "Electrostatic Hazards", icon: "fa-triangle-exclamation", color: "var(--neon-orange)", desc: "Sparks, refuelling, lightning, and safety earthing." },
  { id: 5, title: "Electrostatic Precipitator & Applications", icon: "fa-industry", color: "var(--neon-purple)", desc: "Industrial filters, spray painting, and copiers." }
];

// --- SECTION 2A: Concept Matcher Pool ---
const CONCEPTS = [
  { term: "Coulomb (C)", definition: "The SI unit of electric charge.", explain: "One Coulomb is a very large amount of charge; an electron carries only -1.6 x 10^-19 C.", category: 0 },
  { term: "Electron", definition: "A subatomic particle carrying a negative charge, free to transfer.", explain: "Only negative electrons can move in solids; positive protons are locked in the nucleus.", category: 0 },
  { term: "Electrostatic Force", definition: "Attractive or repulsive force between stationary electric charges.", explain: "Like charges repel; opposite charges attract.", category: 0 },
  { term: "Electric Field", definition: "A region in which an electric charge experiences an electric force.", explain: "Any charged body creates an electric field in the space surrounding it.", category: 1 },
  { term: "Electric Field Line", definition: "A path along which a free positive charge would move.", explain: "Field lines always point away from positive charges and towards negative charges.", category: 1 },
  { term: "Uniform Electric Field", definition: "An electric field where strength is constant and lines are parallel.", explain: "Created between two parallel oppositely-charged metal plates.", category: 1 },
  { term: "Insulator", definition: "A material that holds its electrons tightly and does not conduct charge easily.", explain: "Examples include plastics, glass, dry wood, and rubber.", category: 2 },
  { term: "Conductor", definition: "A material containing free electrons that can move easily through it.", explain: "All metals are excellent conductors because of their sea of delocalised electrons.", category: 3 },
  { term: "Induced Charge", definition: "A charge that is separated or concentrated on an object without direct contact.", explain: "Bringing a charged rod near a metal sphere shifts its free electrons, inducing charge.", category: 3 },
  { term: "Earthing (Grounding)", definition: "Providing a path for charge to flow to or from the Earth.", explain: "The Earth is a massive reservoir that can easily donate or absorb electrons.", category: 3 },
  { term: "Sparking", definition: "A sudden discharge of electricity through air when the field is very strong.", explain: "Air ionises under very high voltage, causing an electric current/spark to jump.", category: 4 },
  { term: "Bonding Strap", definition: "A metal cable connecting two bodies to prevent potential differences.", explain: "Used when refuelling aircraft to prevent sparking between nozzle and tank.", category: 4 },
  { term: "Electrostatic Precipitator", definition: "A device used to remove ash, dust, and smoke particles from waste gases.", explain: "Uses highly charged grids to charge particles and attract them to collection plates.", category: 5 },
  { term: "Corona Discharge", definition: "Ionisation of fluid surrounding a conductor, creating a local glow.", explain: "Occurs near highly charged sharp points on the precipitator wire electrodes.", category: 5 },
  { term: "Photocopier Drum", definition: "A light-sensitive drum that holds static charge in the dark.", explain: "Where light hits, charge leaks away, leaving a static image that attracts toner.", category: 5 }
];

// --- SECTION 2B: Scenario Sorter Pool ---
const SCENARIOS = [
  {
    text: "A polythene rod is rubbed vigorously with a dry woollen cloth, making the rod negative.",
    category: 2,
    question: "Which particle transfers during this rubbing process?",
    options: ["Electrons move from cloth to rod", "Protons move from rod to cloth", "Electrons move from rod to cloth", "Protons move from cloth to rod"],
    correctIdx: 0,
    explain: "Polythene gains electrons from the wool, leaving the rod negative and the cloth positive."
  },
  {
    text: "Fuel flows through a hose at high speed into an aircraft, accumulating static charge.",
    category: 4,
    question: "What safety precaution prevents a dangerous spark during this process?",
    options: ["Connecting a copper bonding wire", "Using plastic tires on the plane", "Painting the plane with insulating paint", "Refuelling at a slower speed only"],
    correctIdx: 0,
    explain: "A copper bonding wire keeps the aircraft and nozzle at the same electrical potential, preventing sparks."
  },
  {
    text: "A negatively charged rod is held close to a neutral metal sphere resting on an insulating stand.",
    category: 3,
    question: "What happens to the electrons inside the metal sphere?",
    options: ["They are repelled to the far side", "They escape into the air", "They move to the side nearest the rod", "They remain uniformly distributed"],
    correctIdx: 0,
    explain: "Negative charges in the rod repel the free electrons in the metal sphere to the far side."
  },
  {
    text: "Fine paint droplets pass through a nozzle connected to a high-voltage positive terminal.",
    category: 5,
    question: "What happens when these charged paint droplets are sprayed onto a neutral metal car body?",
    options: ["They repel each other and spread evenly", "They stick to the nozzle", "They are repelled by the car body", "They lose charge instantly in the air"],
    correctIdx: 0,
    explain: "Droplets have the same positive charge, repelling each other to form a fine, uniform mist attracted to the earthed car."
  },
  {
    text: "Dust-laden flue gas flows upward past highly negative metal wires in an industrial chimney.",
    category: 5,
    question: "How do the neutral dust particles acquire their charge in this zone?",
    options: ["Colliding with negative ions in ionised air", "Rubbing against the chimney walls", "Direct contact with the negative wire", "Losing protons due to the heat"],
    correctIdx: 0,
    explain: "The high voltage ionises the air, and dust particles collide with and capture negative gas ions."
  },
  {
    text: "A metal sphere is charged by induction using a positive rod. The sphere is earthed briefly.",
    category: 3,
    question: "In what direction do electrons move when the sphere is earthed?",
    options: ["From the Earth into the sphere", "From the sphere into the Earth", "They do not move at all", "From the positive rod into the sphere"],
    correctIdx: 0,
    explain: "The positive rod attracts electrons, pulling them up from the Earth to neutralise the positive side of the sphere."
  }
];

// --- SECTION 2C: True/False Rapid Fire Pool ---
const TRUE_FALSE_STATEMENTS = [
  { text: "Neutral objects contain equal amounts of positive and negative charge.", answer: true, explain: "Neutrality means the net charge is zero, not that there are no charges at all." },
  { text: "Protons are easily transferred from one insulator to another by friction.", answer: false, explain: "Protons are bound in the nucleus; only electrons are transferred by rubbing." },
  { text: "Electric field lines point towards positive charges.", answer: false, explain: "Field lines point AWAY from positive charges and TOWARDS negative charges." },
  { text: "A conductor can easily be charged by rubbing while held directly in the hand.", answer: false, explain: "Charge leaks through your hand to the earth instantly because both are conductors." },
  { text: "Earthing an induced positive charge requires electrons to flow from the Earth.", answer: true, explain: "Electrons flow up from the Earth to neutralise the positive charge." },
  { text: "Static electricity poses a high risk of explosion in grain silos.", answer: true, explain: "Fine dust suspended in air can explode if ignited by a static discharge spark." },
  { text: "The wire grids in an electrostatic precipitator are kept at a very high positive potential.", answer: false, explain: "They are kept at a high negative potential (typically several kilovolts) to ionise air." },
  { text: "Water is a good conductor compared to polythene.", answer: true, explain: "Polythene is an excellent insulator, whereas tap water contains ions and conducts electricity." },
  { text: "Like charges attract, while opposite charges repel.", answer: false, explain: "Like charges repel; opposite charges attract." },
  { text: "Coulomb is the unit of current.", answer: false, explain: "Coulomb (C) is the unit of charge. Ampere (A) is the unit of current." }
];

// --- SECTION 3: Mixed Quiz Pool (30 Questions, 5 per category) ---
const QUIZ_POOL = [
  // Topic 0: Types of Charge & Coulombs
  {
    q: "A plastic rod becomes negatively charged when rubbed with wool. What has occurred?",
    options: ["The rod has gained electrons from the wool", "The rod has lost protons to the wool", "The rod has gained protons from the wool", "The rod has lost electrons to the wool"],
    correctIdx: 0,
    explain: "Charging is solely due to the transfer of electrons. Gaining electrons makes an object negative.",
    category: 0
  },
  {
    q: "What is the charge of a single electron in Coulombs?",
    options: ["-1.6 x 10^-19 C", "-1.6 x 10^-9 C", "-9.1 x 10^-31 C", "-1.0 C"],
    correctIdx: 0,
    explain: "The elementary charge of an electron is -1.6 x 10^-19 C.",
    category: 0
  },
  {
    q: "Two suspended spheres repel each other when placed close. What can be deduced?",
    options: ["They both have the same type of charge", "They have opposite charges", "One is charged and the other is neutral", "They are both made of copper"],
    correctIdx: 0,
    explain: "Repulsion is the only sure test for charge. Like charges repel.",
    category: 0
  },
  {
    q: "An object has a net charge of +3.2 x 10^-19 C. How many electrons did it lose?",
    options: ["2 electrons", "1 electron", "20 electrons", "1.6 electrons"],
    correctIdx: 0,
    explain: "Since one electron has a charge of 1.6 x 10^-19 C, a charge of 3.2 x 10^-19 C corresponds to a deficit of 2 electrons.",
    category: 0
  },
  {
    q: "Which of the following is an insulator?",
    options: ["Dry paper", "Salt water", "Aluminium foil", "Carbon graphite"],
    correctIdx: 0,
    explain: "Dry paper holds its valence electrons tightly and does not let them flow, making it an insulator.",
    category: 0
  },

  // Topic 1: Electric Fields & Field Lines
  {
    q: "How is the direction of an electric field defined?",
    options: ["The direction of the force on a positive test charge", "The direction of the force on a negative test charge", "The direction in which electrons move", "The direction of gravity"],
    correctIdx: 0,
    explain: "An electric field's direction is defined as the direction of the force acting on a small positive charge placed in the field.",
    category: 1
  },
  {
    q: "What do closely spaced electric field lines indicate?",
    options: ["A stronger electric field strength", "A weaker electric field strength", "A region of negative potential only", "A region of positive potential only"],
    correctIdx: 0,
    explain: "The density of field lines represents the strength of the field. Closer lines mean a stronger field.",
    category: 1
  },
  {
    q: "Describe the electric field lines between two parallel plates, one positive and one negative.",
    options: ["Parallel, equally-spaced lines pointing from positive to negative", "Parallel, equally-spaced lines pointing from negative to positive", "Curved lines bulging outward from the center", "Radiating lines starting from the negative plate"],
    correctIdx: 0,
    explain: "A uniform field exists between parallel plates, with straight, parallel lines directed positive-to-negative.",
    category: 1
  },
  {
    q: "What is the pattern of electric field lines around a single isolated negative point charge?",
    options: ["Straight lines radiating inwards towards the center", "Straight lines radiating outwards away from the center", "Concentric circular loops around the charge", "Spiral lines directed outwards"],
    correctIdx: 0,
    explain: "Field lines radiate inwards to negative charges since a positive test charge would be attracted to it.",
    category: 1
  },
  {
    q: "Which statement is true about electric field lines?",
    options: ["They never cross each other", "They always form closed loops", "They start at negative charges and end at positive charges", "They are parallel near point charges"],
    correctIdx: 0,
    explain: "Electric field lines represent the net force direction at any point; they can never cross, or a point would have two net force directions.",
    category: 1
  },

  // Topic 2: Charging by Rubbing
  {
    q: "Why does rubbing a glass rod with silk charge both objects?",
    options: ["Friction provides energy for electrons to migrate", "Friction creates new protons in the glass", "Protons flow due to heat generated", "Atoms split, releasing thermal ions"],
    correctIdx: 0,
    explain: "Rubbing creates contact friction, which allows electrons to transfer from the material with weaker electron affinity to the stronger one.",
    category: 2
  },
  {
    q: "A balloon rubbed on a wool jumper sticks to a neutral wall. Why?",
    options: ["The charged balloon induces opposite charge on the wall surface", "The balloon transfers its charge to the wall immediately", "The wall is magnetized by the balloon", "The wall becomes a conductor"],
    correctIdx: 0,
    explain: "The charged balloon repels electrons in the wall surface, inducing an opposite charge on the surface. Attraction follows.",
    category: 2
  },
  {
    q: "If a material loses electrons during friction, what charge does it acquire?",
    options: ["Positive", "Negative", "Neutral", "Alternating"],
    correctIdx: 0,
    explain: "Losing negative electrons leaves an excess of positive protons in the nucleus, making the material positive.",
    category: 2
  },
  {
    q: "Why can't you charge a brass rod by rubbing it while holding it in your bare hands?",
    options: ["Brass is a conductor, so charge immediately leaks to earth through your body", "Brass does not transfer electrons under friction", "Brass has too many protons", "Hands are insulators that block charge transfer"],
    correctIdx: 0,
    explain: "Because both brass and your body conduct charge, any static charge generated flows instantly to the ground.",
    category: 2
  },
  {
    q: "Which material is most likely to gain electrons when rubbed according to triboelectric series?",
    options: ["Polythene", "Glass", "Perspex", "Wool"],
    correctIdx: 0,
    explain: "Polythene has a strong affinity for electrons and routinely gains them to become negative.",
    category: 2
  },

  // Topic 3: Charging by Induction
  {
    q: "What is the correct sequence of steps to charge a metal sphere negatively by induction using a positive rod?",
    options: [
      "Bring rod near, earth sphere, remove earth, remove rod",
      "Bring rod near, remove rod, earth sphere, remove earth",
      "Earth sphere, bring rod near, remove rod, remove earth",
      "Bring rod near, earth sphere, remove rod, remove earth"
    ],
    correctIdx: 0,
    explain: "You must break the earthing connection *before* removing the inducing rod, or the excess electrons will leak back to earth.",
    category: 3
  },
  {
    q: "During induction charging of a sphere using a negative rod, why is it earthed?",
    options: [
      "To allow electrons to escape from the sphere to the Earth",
      "To allow protons to enter the sphere from the Earth",
      "To allow electrons to enter the sphere from the Earth",
      "To neutralise the inducing charged rod"
    ],
    correctIdx: 0,
    explain: "The negative rod repels free electrons in the sphere, driving them down the earth wire into the ground.",
    category: 3
  },
  {
    q: "If you touch a metal sphere with a negatively charged rod, what happens?",
    options: [
      "The sphere gains negative charge by conduction",
      "The sphere gains positive charge by induction",
      "No charge is transferred because it's not earthed",
      "The rod loses all its protons"
    ],
    correctIdx: 0,
    explain: "Direct contact results in charging by conduction; electrons flow directly onto the sphere.",
    category: 3
  },
  {
    q: "Why must a metal sphere be mounted on an insulating stand during electrostatic induction?",
    options: [
      "To prevent charge from leaking to the ground",
      "To attract more electrons from the air",
      "To magnetise the sphere",
      "To hold the sphere closer to the rod"
    ],
    correctIdx: 0,
    explain: "An insulating stand prevents the charge on the sphere from draining into the table or floor.",
    category: 3
  },
  {
    q: "What happens if you remove the charged rod *before* removing the earth connection during induction?",
    options: [
      "The sphere returns to neutral",
      "The sphere remains charged",
      "The sphere explodes",
      "The sphere becomes magnetic"
    ],
    correctIdx: 0,
    explain: "If earthed without the rod present, electrons flow to restore balance, leaving the sphere neutral.",
    category: 3
  },

  // Topic 4: Electrostatic Hazards
  {
    q: "Why is a fuel tanker truck fitted with a metal chain touching the ground?",
    options: [
      "To continuously discharge static charge built up by friction with air and tyres",
      "To increase friction with the road",
      "To warn other drivers by making noise",
      "To prevent tyres from overheating"
    ],
    correctIdx: 0,
    explain: "Friction between tyres, fuel flow, and air creates static charge. The chain earths the truck to prevent sparks.",
    category: 4
  },
  {
    q: "Under what conditions can static electricity start a fire in a flour mill?",
    options: [
      "Fine dust particles in the air ignited by an electrostatic spark",
      "Excessive moisture in the grain causing a short circuit",
      "Magnetic attraction of metal particles in the flour",
      "Radio waves from grinding machinery"
    ],
    correctIdx: 0,
    explain: "Suspended flour dust is highly flammable. A static spark can supply the activation energy for a dust explosion.",
    category: 4
  },
  {
    q: "How does a bonding strap protect planes during refuelling?",
    options: [
      "It ensures the plane and nozzle are at the same potential, preventing sparks",
      "It filters impurities from the fuel",
      "It grounds the pilot to prevent electric shocks",
      "It increases the speed of fuel delivery"
    ],
    correctIdx: 0,
    explain: "Equalizing the potential ensures no voltage differences can cause a spark to jump through flammable fuel vapours.",
    category: 4
  },
  {
    q: "Which weather condition makes static shocks more frequent?",
    options: ["Dry and cold air", "Humid and hot air", "Rainy weather", "Foggy mornings"],
    correctIdx: 0,
    explain: "Dry air is an excellent insulator, allowing charge to build up. Moist air allows charge to bleed off slowly.",
    category: 4
  },
  {
    q: "What is the primary danger of lightning strikes?",
    options: [
      "Huge currents heating and vaporising structures, causing fires",
      "Radiation from the lightning bolt",
      "Magnetic fields destroying metal structures",
      "Creating permanent static fields on the ground"
    ],
    correctIdx: 0,
    explain: "The massive energy transfer heats air to 30,000K and vaporizes materials, causing severe explosive fires.",
    category: 4
  },

  // Topic 5: Electrostatic Precipitator & Applications
  {
    q: "In an electrostatic precipitator, what charge is given to the dust particles?",
    options: ["Negative", "Positive", "Neutral", "Alternating positive and negative"],
    correctIdx: 0,
    explain: "They capture negative ions created by corona discharge near the negative wire grids, becoming negative.",
    category: 5
  },
  {
    q: "To which component of an electrostatic precipitator are the dust particles attracted?",
    options: [
      "Earthed positive metal plates",
      "Negative wire electrodes",
      "The chimney opening",
      "The chemical scrubbers"
    ],
    correctIdx: 0,
    explain: "Negatively charged dust is attracted to the earthed collection plates, which act positively relative to the negative wires.",
    category: 5
  },
  {
    q: "How does electrostatic spray painting improve efficiency?",
    options: [
      "Charged droplets repel each other and cover curved surfaces evenly, reducing waste",
      "The paint dries instantly due to the charge",
      "The paint changes colour when charged",
      "It makes the paint magnetic"
    ],
    correctIdx: 0,
    explain: "Like-charged droplets spread into a fine mist. They curve around and wrap to the back of the earthed target, coating it completely.",
    category: 5
  },
  {
    q: "Which property is essential for a photocopier drum to function?",
    options: ["Photoconductivity (conducts only when exposed to light)", "High magnetic susceptibility", "Superconductivity at room temperature", "Opacity to all forms of light"],
    correctIdx: 0,
    explain: "A photoconductive drum holds static charge in the dark, but lets charge leak away to the earth when struck by light.",
    category: 5
  },
  {
    q: "Why are the plates of an electrostatic precipitator tapped (hammered) regularly?",
    options: [
      "To shake off accumulated dust so it falls into collection hoppers",
      "To recharge the plates",
      "To clear blockages in the flue gas pipe",
      "To test for structural damage"
    ],
    correctIdx: 0,
    explain: "Regular mechanical rapping releases the collected dust layer, which drops safely into hoppers for disposal.",
    category: 5
  }
];

// --- SECTION 5: Flashcard Revision Deck (24 Cards, 4 per area) ---
const FLASHCARDS = [
  // Area 0
  { category: 0, q: "What is the SI unit of electric charge?", a: "The Coulomb (C)." },
  { category: 0, q: "State the law of electrostatics.", a: "Like charges repel; opposite charges attract." },
  { category: 0, q: "Which subatomic particle is free to move in conductors?", a: "The electron. Protons are fixed in the nucleus." },
  { category: 0, q: "What is the charge of a proton?", a: "+1.6 x 10^-19 C." },
  
  // Area 1
  { category: 1, q: "Define an electric field.", a: "A region where an electric charge experiences an electric force." },
  { category: 1, q: "In which direction do electric field lines point?", a: "Away from positive charges, towards negative charges." },
  { category: 1, q: "Describe the electric field lines between two parallel oppositely charged plates.", a: "Straight, parallel, and equally spaced lines pointing from the positive to the negative plate." },
  { category: 1, q: "Can electric field lines cross? Why?", a: "No. If they crossed, a charge placed there would experience forces in two different directions, which is physically impossible." },
  
  // Area 2
  { category: 2, q: "What is the atomic cause of charging by rubbing?", a: "Contact friction transfers valence electrons from one material to another." },
  { category: 2, q: "What charge does an object get if it gains electrons?", a: "Negative charge." },
  { category: 2, q: "What charge does an object get if it loses electrons?", a: "Positive charge." },
  { category: 2, q: "Why can't you easily charge a copper rod by rubbing if you hold it directly?", a: "Copper is a conductor. Any charge generated immediately escapes through your body to the Earth." },

  // Area 3
  { category: 3, q: "What is electrostatic induction?", a: "A process of charging a conductor without direct contact with the charging body." },
  { category: 3, q: "What must be done to a conductor during induction to give it a permanent charge?", a: "It must be earthed (grounded) while the inducing rod is present, then the earth is removed before the rod." },
  { category: 3, q: "Why does earthing remove induced charges?", a: "It allows electrons to flow into or out of the conductor to neutralise unbalanced potentials." },
  { category: 3, q: "If you use a negative rod to charge a sphere by induction, what charge does the sphere end up with?", a: "Positive charge (electrons are driven to earth, leaving net positive)." },

  // Area 4
  { category: 4, q: "Name two hazards of static electricity.", a: "1. Explosions in flammable dust environments (like flour mills/silos). 2. Fuel vapour ignition during vehicle/aircraft refuelling." },
  { category: 4, q: "How are aircraft protected from static sparks during refuelling?", a: "A metal bonding strap connects the plane and fuel nozzle to equalise their potentials before fuel flows." },
  { category: 4, q: "Why are lightning conductors spiked at the top?", a: "The sharp spikes generate a high electric field, causing local corona discharge that neutralises clouds or guides the strike safely to earth." },
  { category: 4, q: "Why does wearing rubber-soled shoes sometimes cause static shocks?", a: "Rubber is an insulator, which prevents static charge from draining into the ground, leading to sudden discharge when you touch metal." },

  // Area 5
  { category: 5, q: "What is the function of an electrostatic precipitator?", a: "To remove ash, dust, and smoke particles from chimneys before they escape into the atmosphere." },
  { category: 5, q: "What happens to dust particles as they pass the high-voltage wires in a precipitator?", a: "They become negatively charged by capturing ions from the ionised air." },
  { category: 5, q: "Explain how electrostatic spray painting works.", a: "Paint droplets are given a charge at the nozzle. They repel each other to form a fine spray and are strongly attracted to the earthed, oppositely charged metal target." },
  { category: 5, q: "How is dust removed from the collection plates in a precipitator?", a: "The plates are periodically hammered (rapped), causing the dust to slide down into collection hoppers." }
];

// --- APP STATE ---
let activeSection = 'overview';
let activeExploreTab = 'matcher';

// Quiz State
let quizQuestions = [];
let currentQuizIdx = 0;
let quizScoresByTopic = [0, 0, 0, 0, 0, 0];
let quizQuestionsCountByTopic = [0, 0, 0, 0, 0, 0];
let quizCorrectCount = 0;

// Flashcard State
let filteredFlashcards = [...FLASHCARDS];
let currentCardIdx = 0;

// Rapid Fire State
let rapidScore = 0;
let rapidTimer = null;
let rapidTimeLeft = 60;
let currentRapidStatement = null;
let rapidStatementPool = [];

// --- CONFETTI ANIMATION ---
const canvas = document.getElementById('confetti-canvas');
const ctx = canvas.getContext('2d');
let confettiParticles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class ConfettiParticle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * -canvas.height - 20;
    this.size = Math.random() * 8 + 6;
    this.speedY = Math.random() * 4 + 4;
    this.speedX = Math.random() * 2 - 1;
    this.rotation = Math.random() * 360;
    this.rotationSpeed = Math.random() * 4 - 2;
    const colors = [
      '#00f2fe', // cyan
      '#ff007f', // magenta
      '#ffd000', // yellow
      '#05ffc5', // green
      '#ff5e00', // orange
      '#b927ff'  // purple
    ];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }

  update() {
    this.y += this.speedY;
    this.x += this.speedX;
    this.rotation += this.rotationSpeed;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    ctx.restore();
  }
}

function triggerConfetti() {
  confettiParticles = [];
  for (let i = 0; i < 120; i++) {
    confettiParticles.push(new ConfettiParticle());
  }
  
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;
    confettiParticles.forEach((p) => {
      p.update();
      p.draw();
      if (p.y < canvas.height) {
        active = true;
      }
    });
    if (active) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  animate();
}

// --- NAVIGATION & VIEW SYSTEM ---
function switchSection(sectionId) {
  // Hide active sections
  document.querySelectorAll('.view-section').forEach(section => {
    section.classList.remove('active');
  });

  // Show selected section
  const sectionEl = document.getElementById(`section-${sectionId}`);
  if (sectionEl) {
    sectionEl.classList.add('active');
  }

  // Set active nav button
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  const navBtn = document.getElementById(`nav-${sectionId}`);
  if (navBtn) navBtn.classList.add('active');

  // Handle header label
  const subtitleEl = document.getElementById('current-section-subtitle');
  if (sectionId === 'overview') subtitleEl.textContent = 'Topic Overview';
  if (sectionId === 'explore') subtitleEl.textContent = 'Interactive Exploration';
  if (sectionId === 'quiz') subtitleEl.textContent = 'Mixed Quiz';
  if (sectionId === 'scoring') subtitleEl.textContent = 'Results & Feedback';
  if (sectionId === 'flashcards') subtitleEl.textContent = 'Flashcard Revision';

  // Stop rapid fire timer if active and switching away
  if (sectionId !== 'explore' || activeExploreTab !== 'rapid') {
    clearInterval(rapidTimer);
    rapidTimer = null;
  }

  activeSection = sectionId;
}

// Switch Explore Tabs (Matcher, Sorter, Rapid Fire)
function switchExploreTab(tabName) {
  activeExploreTab = tabName;
  document.querySelectorAll('.sub-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Update Buttons
  const buttons = document.querySelectorAll('.sub-btn');
  if (tabName === 'matcher') buttons[0].classList.add('active');
  if (tabName === 'sorter') buttons[1].classList.add('active');
  if (tabName === 'rapid') buttons[2].classList.add('active');

  // Hide all explore panels
  document.getElementById('explore-matcher').style.display = 'none';
  document.getElementById('explore-sorter').style.display = 'none';
  document.getElementById('explore-rapid').style.display = 'none';

  // Show target panel
  document.getElementById(`explore-${tabName}`).style.display = 'flex';

  // Initialize or reset target view
  if (tabName === 'matcher') {
    loadConceptMatcher();
  } else if (tabName === 'sorter') {
    loadScenarioSorter();
  } else if (tabName === 'rapid') {
    resetRapidFire();
  }
}

// --- SECTION 1: TOPIC OVERVIEW ---
function initTopicOverview() {
  const container = document.getElementById('topic-grid-container');
  container.innerHTML = '';

  LEARNING_AREAS.forEach((topic) => {
    const tile = document.createElement('div');
    tile.className = `topic-tile topic-${topic.id}`;
    tile.innerHTML = `
      <div class="tile-icon"><i class="fa-solid ${topic.icon}"></i></div>
      <div class="tile-info">
        <div class="tile-title">${topic.title}</div>
        <div class="tile-desc">${topic.desc}</div>
      </div>
    `;
    tile.addEventListener('click', () => {
      // Jump to Flashcards with selected filter
      const filterSelect = document.getElementById('flashcard-filter');
      filterSelect.value = topic.id;
      filterFlashcards();
      switchSection('flashcards');
    });
    container.appendChild(tile);
  });
}

// --- SECTION 2A: Concept Matcher Game ---
let currentConcept = null;

function loadConceptMatcher() {
  // Hide feedback & next button
  document.getElementById('matcher-feedback').style.display = 'none';
  document.getElementById('matcher-next').style.display = 'none';

  // Draw a random concept
  currentConcept = CONCEPTS[Math.floor(Math.random() * CONCEPTS.length)];
  document.getElementById('matcher-term').textContent = currentConcept.term;

  // Gather 3 random distractor definitions + the correct definition
  let correctDef = currentConcept.definition;
  let distractors = CONCEPTS
    .filter(c => c.definition !== correctDef)
    .map(c => c.definition);

  // Shuffle distractors & select 3
  distractors.sort(() => 0.5 - Math.random());
  let options = [correctDef, distractors[0], distractors[1], distractors[2]];
  options.sort(() => 0.5 - Math.random()); // Shuffled choices

  // Render buttons
  const optContainer = document.getElementById('matcher-options');
  optContainer.innerHTML = '';
  options.forEach(optText => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = optText;
    btn.onclick = () => submitMatcherAnswer(btn, optText === correctDef);
    optContainer.appendChild(btn);
  });
}

function submitMatcherAnswer(selectedBtn, isCorrect) {
  // Disable all options
  document.querySelectorAll('#matcher-options .option-btn').forEach(btn => {
    btn.disabled = true;
    // Highlight correct option in green
    if (btn.textContent === currentConcept.definition) {
      btn.classList.add('correct');
    }
  });

  const feedbackEl = document.getElementById('matcher-feedback');
  feedbackEl.style.display = 'block';

  if (isCorrect) {
    selectedBtn.classList.add('correct');
    feedbackEl.className = 'feedback-panel correct';
    feedbackEl.innerHTML = `<strong>Correct!</strong> ${currentConcept.explain}`;
    triggerConfetti();
  } else {
    selectedBtn.classList.add('wrong');
    feedbackEl.className = 'feedback-panel wrong';
    feedbackEl.innerHTML = `<strong>Incorrect.</strong> ${currentConcept.explain}`;
  }

  // Show Next Button
  document.getElementById('matcher-next').style.display = 'block';
}

// --- SECTION 2B: Scenario Sorter Game ---
let currentScenario = null;
let sorterPhase = 1; // 1 = Topic categorization, 2 = Follow-up detail

function loadScenarioSorter() {
  sorterPhase = 1;
  document.getElementById('sorter-phase-1').style.display = 'flex';
  document.getElementById('sorter-phase-2').style.display = 'none';
  document.getElementById('sorter-feedback').style.display = 'none';
  document.getElementById('sorter-next').style.display = 'none';

  currentScenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
  document.getElementById('sorter-scenario-text').textContent = currentScenario.text;

  // Render 6 Topic buttons
  const gridContainer = document.getElementById('sorter-topic-options');
  gridContainer.innerHTML = '';

  LEARNING_AREAS.forEach(topic => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.style.padding = '12px 6px';
    btn.style.fontSize = '0.75rem';
    btn.style.textAlign = 'center';
    btn.textContent = topic.title;
    btn.onclick = () => submitSorterPhase1(btn, topic.id === currentScenario.category);
    gridContainer.appendChild(btn);
  });
}

function submitSorterPhase1(selectedBtn, isCorrect) {
  // Disable options
  document.querySelectorAll('#sorter-topic-options .option-btn').forEach(btn => {
    btn.disabled = true;
  });

  const feedbackEl = document.getElementById('sorter-feedback');
  feedbackEl.style.display = 'block';

  if (isCorrect) {
    selectedBtn.classList.add('correct');
    feedbackEl.className = 'feedback-panel correct';
    feedbackEl.innerHTML = `<strong>Correct Area!</strong> Let's look at the physics detail.`;
    triggerConfetti();
    
    // Proceed to phase 2 after a brief delay
    setTimeout(() => {
      loadScenarioPhase2();
    }, 1400);
  } else {
    selectedBtn.classList.add('wrong');
    feedbackEl.className = 'feedback-panel wrong';
    
    // Highlight correct topic
    document.querySelectorAll('#sorter-topic-options .option-btn').forEach(btn => {
      if (btn.textContent === LEARNING_AREAS[currentScenario.category].title) {
        btn.classList.add('correct');
      }
    });

    feedbackEl.innerHTML = `<strong>Incorrect Area.</strong> This belongs to "${LEARNING_AREAS[currentScenario.category].title}". Let's review the detail anyway!`;
    
    // Proceed to phase 2 after delay
    setTimeout(() => {
      loadScenarioPhase2();
    }, 2200);
  }
}

function loadScenarioPhase2() {
  sorterPhase = 2;
  document.getElementById('sorter-phase-1').style.display = 'none';
  document.getElementById('sorter-phase-2').style.display = 'flex';
  document.getElementById('sorter-feedback').style.display = 'none';

  document.getElementById('sorter-question-text').textContent = currentScenario.question;

  const optContainer = document.getElementById('sorter-detail-options');
  optContainer.innerHTML = '';

  // Render options
  currentScenario.options.forEach((optText, idx) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = optText;
    btn.onclick = () => submitSorterPhase2(btn, idx === currentScenario.correctIdx);
    optContainer.appendChild(btn);
  });
}

function submitSorterPhase2(selectedBtn, isCorrect) {
  document.querySelectorAll('#sorter-detail-options .option-btn').forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === currentScenario.options[currentScenario.correctIdx]) {
      btn.classList.add('correct');
    }
  });

  const feedbackEl = document.getElementById('sorter-feedback');
  feedbackEl.style.display = 'block';

  if (isCorrect) {
    selectedBtn.classList.add('correct');
    feedbackEl.className = 'feedback-panel correct';
    feedbackEl.innerHTML = `<strong>Correct!</strong> ${currentScenario.explain}`;
    triggerConfetti();
  } else {
    selectedBtn.classList.add('wrong');
    feedbackEl.className = 'feedback-panel wrong';
    feedbackEl.innerHTML = `<strong>Incorrect.</strong> ${currentScenario.explain}`;
  }

  document.getElementById('sorter-next').style.display = 'block';
}


// --- SECTION 2C: True/False Rapid Fire ---
function resetRapidFire() {
  clearInterval(rapidTimer);
  rapidTimer = null;
  rapidTimeLeft = 60;
  rapidScore = 0;
  
  document.getElementById('rapid-start-screen').style.display = 'flex';
  document.getElementById('rapid-gameplay-screen').style.display = 'none';
  document.getElementById('rapid-result-screen').style.display = 'none';
}

function startRapidFire() {
  document.getElementById('rapid-start-screen').style.display = 'none';
  document.getElementById('rapid-gameplay-screen').style.display = 'flex';

  // Clone and shuffle statements pool
  rapidStatementPool = [...TRUE_FALSE_STATEMENTS].sort(() => 0.5 - Math.random());
  rapidScore = 0;
  rapidTimeLeft = 60;
  
  document.getElementById('rapid-score-val').textContent = rapidScore;
  updateTimerDisplay();

  // Start interval
  rapidTimer = setInterval(() => {
    rapidTimeLeft--;
    updateTimerDisplay();

    if (rapidTimeLeft <= 0) {
      endRapidFire();
    }
  }, 1000);

  nextRapidStatement();
}

function updateTimerDisplay() {
  const timerEl = document.getElementById('rapid-timer');
  timerEl.innerHTML = `<i class="fa-regular fa-clock"></i> ${rapidTimeLeft}s`;
  if (rapidTimeLeft <= 10) {
    timerEl.classList.add('low-time');
  } else {
    timerEl.classList.remove('low-time');
  }
}

function nextRapidStatement() {
  // Hide feedback and next button
  document.getElementById('rapid-feedback').style.display = 'none';
  document.getElementById('rapid-next').style.display = 'none';

  // Enable choice buttons
  document.getElementById('rapid-tf-btns').style.display = 'flex';

  if (rapidStatementPool.length === 0) {
    // Refill pool if empty
    rapidStatementPool = [...TRUE_FALSE_STATEMENTS].sort(() => 0.5 - Math.random());
  }

  currentRapidStatement = rapidStatementPool.pop();
  document.getElementById('rapid-statement').textContent = currentRapidStatement.text;
}

function submitRapidAnswer(userAnswer) {
  const isCorrect = (userAnswer === currentRapidStatement.answer);
  
  // Hide true/false buttons
  document.getElementById('rapid-tf-btns').style.display = 'none';

  const feedbackEl = document.getElementById('rapid-feedback');
  feedbackEl.style.display = 'block';

  if (isCorrect) {
    rapidScore++;
    document.getElementById('rapid-score-val').textContent = rapidScore;
    feedbackEl.className = 'feedback-panel correct';
    feedbackEl.innerHTML = `<strong>Correct!</strong> ${currentRapidStatement.explain}`;
    triggerConfetti();
  } else {
    feedbackEl.className = 'feedback-panel wrong';
    feedbackEl.innerHTML = `<strong>Incorrect.</strong> ${currentRapidStatement.explain}`;
  }

  // Show Next Action
  document.getElementById('rapid-next').style.display = 'block';
}

function endRapidFire() {
  clearInterval(rapidTimer);
  rapidTimer = null;

  document.getElementById('rapid-gameplay-screen').style.display = 'none';
  document.getElementById('rapid-result-screen').style.display = 'flex';

  document.getElementById('rapid-final-score').textContent = rapidScore;
  
  // Custom feedback messages
  const msgEl = document.getElementById('rapid-feedback-message');
  if (rapidScore >= 8) {
    msgEl.innerHTML = "Stellar performance! Your fast recall demonstrates solid conceptual knowledge under exam conditions.";
  } else if (rapidScore >= 4) {
    msgEl.innerHTML = "Good attempt! Revise the topic flashcards to speed up your accuracy.";
  } else {
    msgEl.innerHTML = "Keep practice going. Try reviewing definitions in the Concept Matcher first!";
  }
}


// --- SECTION 3: MIXED MCQ QUIZ ---
function startQuiz() {
  // Reset quiz arrays
  quizQuestions = [];
  currentQuizIdx = 0;
  quizCorrectCount = 0;
  quizScoresByTopic = [0, 0, 0, 0, 0, 0];
  quizQuestionsCountByTopic = [0, 0, 0, 0, 0, 0];

  // Draw 15 questions from the pool. Must guarantee at least 2 questions per category (0-5).
  // Total categories = 6. 6 * 2 = 12 guaranteed questions.
  // The remaining 3 questions are selected randomly from the rest of the pool.
  
  let selectedPool = [];
  
  // Group pool by category
  let categorisedPool = [[], [], [], [], [], []];
  QUIZ_POOL.forEach(q => {
    categorisedPool[q.category].push(q);
  });

  // Shuffle questions in each category
  categorisedPool.forEach(catList => {
    catList.sort(() => 0.5 - Math.random());
  });

  // Pick 2 from each category
  for (let c = 0; c < 6; c++) {
    selectedPool.push(categorisedPool[c].pop());
    selectedPool.push(categorisedPool[c].pop());
  }

  // Now we need 3 more questions. Combine all remaining questions and pick 3.
  let remaining = [];
  for (let c = 0; c < 6; c++) {
    remaining = remaining.concat(categorisedPool[c]);
  }
  remaining.sort(() => 0.5 - Math.random());
  
  selectedPool.push(remaining.pop());
  selectedPool.push(remaining.pop());
  selectedPool.push(remaining.pop());

  // Shuffle the final 15 questions
  selectedPool.sort(() => 0.5 - Math.random());
  quizQuestions = selectedPool;

  // Toggle View Elements
  document.getElementById('quiz-start-screen').style.display = 'none';
  document.getElementById('quiz-gameplay-screen').style.display = 'flex';

  loadQuizQuestion();
}

function loadQuizQuestion() {
  document.getElementById('quiz-feedback').style.display = 'none';
  document.getElementById('quiz-next').style.display = 'none';

  const qData = quizQuestions[currentQuizIdx];
  
  // Keep count of questions per topic
  quizQuestionsCountByTopic[qData.category]++;

  // Update headers
  document.getElementById('quiz-topic-badge').textContent = LEARNING_AREAS[qData.category].title;
  document.getElementById('quiz-curr-q').textContent = currentQuizIdx + 1;
  
  // Update progress bar
  const pct = ((currentQuizIdx) / 15) * 100;
  document.getElementById('quiz-progress-fill').style.width = `${pct}%`;

  // Render question text
  document.getElementById('quiz-question-text').textContent = qData.q;

  // Render option buttons
  const optContainer = document.getElementById('quiz-options');
  optContainer.innerHTML = '';
  
  // Shuffle options for display, keeping track of the correct one
  let correctVal = qData.options[qData.correctIdx];
  let displayOptions = [...qData.options].sort(() => 0.5 - Math.random());

  displayOptions.forEach(optText => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = optText;
    btn.onclick = () => submitQuizAnswer(btn, optText === correctVal);
    optContainer.appendChild(btn);
  });
}

function submitQuizAnswer(selectedBtn, isCorrect) {
  const qData = quizQuestions[currentQuizIdx];
  const correctVal = qData.options[qData.correctIdx];

  // Disable buttons
  document.querySelectorAll('#quiz-options .option-btn').forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === correctVal) {
      btn.classList.add('correct');
    }
  });

  const feedbackEl = document.getElementById('quiz-feedback');
  feedbackEl.style.display = 'block';

  if (isCorrect) {
    selectedBtn.classList.add('correct');
    feedbackEl.className = 'feedback-panel correct';
    feedbackEl.innerHTML = `<strong>Correct!</strong> ${qData.explain}`;
    triggerConfetti();
    quizCorrectCount++;
    quizScoresByTopic[qData.category]++;
  } else {
    selectedBtn.classList.add('wrong');
    feedbackEl.className = 'feedback-panel wrong';
    feedbackEl.innerHTML = `<strong>Incorrect.</strong> ${qData.explain}`;
  }

  document.getElementById('quiz-next').style.display = 'block';
}

function nextQuizQuestion() {
  currentQuizIdx++;
  if (currentQuizIdx < 15) {
    loadQuizQuestion();
  } else {
    // Quiz completed. Render results screen!
    document.getElementById('quiz-progress-fill').style.width = `100%`;
    renderQuizResults();
  }
}

// --- SECTION 4: SCORING & FEEDBACK ---
function renderQuizResults() {
  switchSection('scoring');

  // Math percentages
  const finalPct = Math.round((quizCorrectCount / 15) * 100);
  document.getElementById('final-score-pct').textContent = `${finalPct}%`;
  document.getElementById('final-score-fraction').textContent = `${quizCorrectCount}/15 Correct`;

  // Custom grade message
  const titleEl = document.getElementById('feedback-tier-title');
  const textEl = document.getElementById('feedback-tier-text');
  
  if (finalPct >= 80) {
    titleEl.textContent = "🏆 Exam Ready! Excellent Job.";
    titleEl.style.color = "var(--neon-green)";
    textEl.textContent = "Your understanding of electrostatics is solid. You are fully prepared to tackle any O-Level challenge in this chapter!";
    triggerConfetti();
  } else if (finalPct >= 50) {
    titleEl.textContent = "⚡ Solid Effort! Keep Polishing.";
    titleEl.style.color = "var(--neon-yellow)";
    textEl.textContent = "You have a decent grasp, but check the feedback breakdown below to identify weak topics. Revise them in Flashcards.";
  } else {
    titleEl.textContent = "📚 Revisit Fundamentals.";
    titleEl.style.color = "var(--neon-magenta)";
    textEl.textContent = "Please return to your revision notebooks or individual interactive labs to clarify key concepts before trying this challenge again.";
  }

  // Populate dynamic topic breakdown rows
  const breakdownList = document.getElementById('topic-breakdown-list');
  breakdownList.innerHTML = '';

  for (let c = 0; c < 6; c++) {
    const score = quizScoresByTopic[c];
    const total = quizQuestionsCountByTopic[c];
    const pct = total > 0 ? Math.round((score / total) * 100) : 100;
    
    const row = document.createElement('div');
    row.className = `topic-score-row ${pct < 50 ? 'low' : 'high'}`;
    
    // Highlight if below 50%
    const statusText = pct < 50 ? `<span class="topic-score-pct low"><i class="fa-solid fa-triangle-exclamation"></i> ${pct}%</span>` : `<span class="topic-score-pct high"><i class="fa-solid fa-circle-check"></i> ${pct}%</span>`;

    row.innerHTML = `
      <span class="topic-score-name">${LEARNING_AREAS[c].title}</span>
      <div>
        <span style="color: var(--text-secondary); margin-right: 10px;">(${score}/${total})</span>
        ${statusText}
      </div>
    `;
    breakdownList.appendChild(row);
  }
}

// --- SECTION 5: FLASHCARD REVISION ---
function filterFlashcards() {
  const filterVal = document.getElementById('flashcard-filter').value;
  
  if (filterVal === 'all') {
    // Get all cards, but shuffle them
    filteredFlashcards = [...FLASHCARDS].sort(() => 0.5 - Math.random());
  } else {
    // Get specific cards and shuffle them
    const catId = parseInt(filterVal);
    filteredFlashcards = FLASHCARDS.filter(c => c.category === catId).sort(() => 0.5 - Math.random());
  }
  
  currentCardIdx = 0;
  displayFlashcard();
}

function displayFlashcard() {
  if (filteredFlashcards.length === 0) {
    document.getElementById('card-front-text').textContent = "No cards matches filter.";
    document.getElementById('card-back-text').textContent = "";
    return;
  }

  // Ensure card resets to unflipped front face
  document.getElementById('flashcard-container').classList.remove('flipped');

  const card = filteredFlashcards[currentCardIdx];
  const topicMeta = LEARNING_AREAS[card.category];

  // Set tags
  const frontTag = document.getElementById('card-front-tag');
  const backTag = document.getElementById('card-back-tag');
  
  frontTag.textContent = topicMeta.title;
  backTag.textContent = topicMeta.title;

  // Custom colors for tags depending on topic ID
  const colors = ["#00f2fe", "#ff007f", "#ffd000", "#05ffc5", "#ff5e00", "#b927ff"];
  frontTag.style.borderColor = colors[card.category];
  frontTag.style.color = colors[card.category];
  backTag.style.borderColor = colors[card.category];
  backTag.style.color = colors[card.category];

  // Set texts
  document.getElementById('card-front-text').textContent = card.q;
  document.getElementById('card-back-text').textContent = card.a;

  // Update progress indicator
  document.getElementById('card-progress').textContent = `Card ${currentCardIdx + 1} of ${filteredFlashcards.length}`;
}

function flipFlashcard() {
  const container = document.getElementById('flashcard-container');
  container.classList.toggle('flipped');
}

function nextFlashcard() {
  if (filteredFlashcards.length === 0) return;
  currentCardIdx = (currentCardIdx + 1) % filteredFlashcards.length;
  displayFlashcard();
}

function prevFlashcard() {
  if (filteredFlashcards.length === 0) return;
  currentCardIdx = (currentCardIdx - 1 + filteredFlashcards.length) % filteredFlashcards.length;
  displayFlashcard();
}

function shuffleFlashcards() {
  filteredFlashcards.sort(() => 0.5 - Math.random());
  currentCardIdx = 0;
  displayFlashcard();
}

// --- INITIALIZATION ---
window.addEventListener('DOMContentLoaded', () => {
  initTopicOverview();
  
  // Pre-load concept matcher first inside Section 2
  loadConceptMatcher();

  // Populate initial flashcard lists
  filterFlashcards();
});
