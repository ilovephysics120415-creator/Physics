/**
 * Thermal Processes Challenge
 * O-Level Physics Syllabus 6091
 */

// ==========================================
// SCENARIO DATA & SVG GENERATORS
// ==========================================
const SCENARIOS = [
  {
    id: "vacuum_flask",
    name: "Vacuum Flask (Thermos)",
    description: "The vacuum layer between double walls prevents conduction and convection because there are no fluid particles to transfer heat. The silvered inner walls minimize radiation by reflecting infrared rays back into the flask.",
    modes: { conduction: false, convection: false, radiation: false },
    dominant: "none",
    note: "All three modes minimized to keep temperature constant.",
    svg: `
      <svg viewBox="0 0 200 220" width="100%" height="100%">
        <!-- Outer Shell -->
        <rect x="70" y="40" width="60" height="150" rx="15" fill="none" stroke="#555" stroke-width="3"/>
        <rect x="80" y="25" width="40" height="20" rx="3" fill="#333" stroke="#555" stroke-width="2"/>
        
        <!-- Inner Shell -->
        <rect x="76" y="46" width="48" height="138" rx="10" fill="#222" stroke="#aaa" stroke-dasharray="3,3" stroke-width="1.5"/>
        
        <!-- Content (hot liquid) -->
        <rect x="80" y="55" width="40" height="120" rx="5" fill="rgba(255, 107, 0, 0.2)"/>
        
        <!-- Vacuum Gap Annotations -->
        <path d="M 73,100 L 60,80" stroke="#00f0ff" stroke-width="1.5"/>
        <text x="50" y="75" fill="#00f0ff" font-size="8" text-anchor="middle" font-family="sans-serif">Vacuum Layer</text>
        <text x="50" y="85" fill="#aaa" font-size="7" text-anchor="middle" font-family="sans-serif">(Blocks Conduction & Convection)</text>
        
        <!-- Radiation reflection arrows -->
        <path d="M 90,120 L 82,120 L 89,123" fill="none" stroke="#ff007f" stroke-width="1.5" marker-end="url(#arrow)"/>
        <path d="M 110,120 L 118,120 L 111,123" fill="none" stroke="#ff007f" stroke-width="1.5"/>
        <text x="100" y="155" fill="#ff007f" font-size="8" text-anchor="middle" font-family="sans-serif">Silvered Surface Reflects Radiation</text>
      </svg>
    `
  },
  {
    id: "sea_land_breeze",
    name: "Sea Breeze / Land Breeze",
    description: "During the day, land heats up faster than the sea. The warm air above land expands, becomes less dense, and rises. Cooler, denser air from the sea flows in to take its place, forming a sea breeze convection current.",
    modes: { conduction: true, convection: true, radiation: true },
    dominant: "convection",
    note: "Convection current cycle drives the breeze.",
    svg: `
      <svg viewBox="0 0 200 220" width="100%" height="100%">
        <!-- Land & Sea -->
        <rect x="10" y="150" width="90" height="40" fill="#6d4c41"/>
        <text x="55" y="175" fill="#fff" font-size="10" font-weight="bold" text-anchor="middle">LAND (Hot)</text>
        
        <rect x="100" y="150" width="90" height="40" fill="#0277bd"/>
        <text x="145" y="175" fill="#fff" font-size="10" font-weight="bold" text-anchor="middle">SEA (Cool)</text>
        
        <!-- Convection loop -->
        <!-- Hot Air rising -->
        <path d="M 50,140 Q 50,70 90,70" fill="none" stroke="#ff6b00" stroke-width="3" stroke-dasharray="5,3"/>
        <polygon points="90,70 82,65 85,75" fill="#ff6b00"/>
        
        <!-- Cooler Sea Breeze -->
        <path d="M 145,140 L 65,140" fill="none" stroke="#0077ff" stroke-width="3"/>
        <polygon points="65,140 73,145 73,135" fill="#0077ff"/>
        
        <!-- Cold Air sinking -->
        <path d="M 145,70 Q 145,130 145,135" fill="none" stroke="#0077ff" stroke-width="3" stroke-dasharray="5,3"/>
        
        <!-- Return current high altitude -->
        <path d="M 90,70 L 140,70" fill="none" stroke="#aaa" stroke-width="1.5"/>
        
        <text x="45" y="100" fill="#ff6b00" font-size="8" text-anchor="middle">Warm Air Rises</text>
        <text x="105" y="130" fill="#0077ff" font-size="8" text-anchor="middle">Cool Sea Breeze</text>
      </svg>
    `
  },
  {
    id: "solar_water_heater",
    name: "Solar Water Heater",
    description: "The collector panel is painted dull black to maximize absorption of solar radiation. The absorbed heat conducts through the copper pipes into the water. Hot water rises into the storage tank above via convection.",
    modes: { conduction: true, convection: true, radiation: true },
    dominant: "radiation",
    note: "Solar radiation absorption is the primary energy source.",
    svg: `
      <svg viewBox="0 0 200 220" width="100%" height="100%">
        <!-- Sun -->
        <circle cx="30" cy="40" r="15" fill="#ffea00" filter="drop-shadow(0 0 8px #ffea00)"/>
        
        <!-- Radiation waves -->
        <line x1="50" y1="50" x2="90" y2="80" stroke="#ff007f" stroke-width="2" stroke-dasharray="4,4"/>
        <line x1="40" y1="65" x2="80" y2="95" stroke="#ff007f" stroke-width="2" stroke-dasharray="4,4"/>
        
        <!-- Black Panel -->
        <rect x="80" y="80" width="80" height="15" fill="#111" stroke="#ff007f" stroke-width="2" transform="rotate(20, 120, 85)"/>
        
        <!-- Copper tubes (inside panel) -->
        <rect x="90" y="82" width="60" height="6" fill="#ff6b00" transform="rotate(20, 120, 85)"/>
        
        <!-- Storage Tank -->
        <rect x="130" y="25" width="50" height="40" rx="5" fill="#444" stroke="#aaa" stroke-width="2"/>
        <text x="155" y="48" fill="#fff" font-size="8" text-anchor="middle">Water Tank</text>
        
        <!-- Convection tubes to tank -->
        <path d="M 120,95 L 140,65" stroke="#ff6b00" stroke-width="2"/>
        <path d="M 100,88 L 130,55" stroke="#0077ff" stroke-width="2"/>
        
        <text x="60" y="135" fill="#ff007f" font-size="8" text-anchor="middle">Black Surface Absorbs Solar Radiation</text>
        <text x="160" y="90" fill="#ff6b00" font-size="8" text-anchor="middle">Hot Water Rises</text>
      </svg>
    `
  },
  {
    id: "cooking_pot",
    name: "Cooking Pot Handle",
    description: "Heat conducts rapidly through the metal base of the pot to cook food. The handle is made of wood or plastic because they are poor conductors (insulators), slowing down heat conduction to protect the user's hand.",
    modes: { conduction: true, convection: false, radiation: false },
    dominant: "conduction",
    note: "Insulators prevent conduction to the hand.",
    svg: `
      <svg viewBox="0 0 200 220" width="100%" height="100%">
        <!-- Stove Fire -->
        <path d="M 70,170 Q 80,140 90,170 Q 100,140 110,170 Q 120,140 130,170" fill="none" stroke="#ff6b00" stroke-width="5"/>
        
        <!-- Metal Pot -->
        <path d="M 60,90 L 140,90 L 130,160 L 70,160 Z" fill="#777" stroke="#999" stroke-width="2"/>
        
        <!-- Wooden Handle -->
        <rect x="10" y="100" width="50" height="12" rx="4" fill="#8d6e63" stroke="#5d4037" stroke-width="1.5"/>
        
        <!-- Conduction Heat flow indicator -->
        <path d="M 100,160 L 100,110" stroke="#00f0ff" stroke-width="3" stroke-linecap="round"/>
        <polygon points="100,105 96,115 104,115" fill="#00f0ff"/>
        
        <!-- Annotations -->
        <text x="100" y="75" fill="#00f0ff" font-size="8" text-anchor="middle">Conduction cooked food</text>
        <text x="35" y="130" fill="#ff6b00" font-size="8" text-anchor="middle">Wood Handle (Insulator)</text>
        <text x="35" y="140" fill="#aaa" font-size="7" text-anchor="middle">Blocks Conduction</text>
      </svg>
    `
  },
  {
    id: "room_heater",
    name: "Room Heater at Floor Level",
    description: "Heaters are placed at floor level because hot air rises. The air near the heater warms up, expands, becomes less dense, and rises. Cooler air sinks to the floor to be heated, establishing a room-wide convection current.",
    modes: { conduction: false, convection: true, radiation: true },
    dominant: "convection",
    note: "Leverages buoyancy of warm air to heat the room.",
    svg: `
      <svg viewBox="0 0 200 220" width="100%" height="100%">
        <!-- Room walls -->
        <rect x="20" y="20" width="160" height="160" fill="none" stroke="#444" stroke-width="2"/>
        
        <!-- Heater at bottom right -->
        <rect x="140" y="150" width="30" height="25" rx="3" fill="#ff3d00" filter="drop-shadow(0 0 4px #ff3d00)"/>
        
        <!-- Rising hot air loop -->
        <path d="M 155,145 Q 155,50 100,50" fill="none" stroke="#ff6b00" stroke-width="2.5" stroke-dasharray="4,4"/>
        <polygon points="100,50 108,55 108,45" fill="#ff6b00"/>
        
        <!-- Falling cool air loop -->
        <path d="M 100,50 Q 40,50 40,150" fill="none" stroke="#0077ff" stroke-width="2.5" stroke-dasharray="4,4"/>
        <polygon points="40,150 35,142 45,142" fill="#0077ff"/>
        
        <!-- Bottom replacement current -->
        <path d="M 40,150 L 135,150" fill="none" stroke="#0077ff" stroke-width="2"/>
        
        <text x="145" y="100" fill="#ff6b00" font-size="8" text-anchor="end">Warm Air Rises</text>
        <text x="50" y="110" fill="#0077ff" font-size="8" text-anchor="start">Cool Air Sinks</text>
        <text x="100" y="195" fill="#aaa" font-size="9" text-anchor="middle">Heater at Floor Level</text>
      </svg>
    `
  },
  {
    id: "survival_blanket",
    name: "Shiny Survival Blanket",
    description: "A survival blanket has a shiny, silver-like metallic coating. Shiny and polished surfaces are highly efficient reflectors and extremely poor emitters of infrared radiation, reflecting body heat back inwards to prevent hypothermia.",
    modes: { conduction: false, convection: false, radiation: true },
    dominant: "radiation",
    note: "Designed to reflect thermal radiation back to the body.",
    svg: `
      <svg viewBox="0 0 200 220" width="100%" height="100%">
        <!-- Body representing heat source -->
        <circle cx="60" cy="100" r="30" fill="#333" stroke="#888" stroke-width="2"/>
        <text x="60" y="103" fill="#fff" font-size="8" text-anchor="middle">Body Heat</text>
        
        <!-- Shiny blanket wall -->
        <path d="M 130,40 C 140,80 140,120 130,160" fill="none" stroke="#00f0ff" stroke-width="4" filter="drop-shadow(0 0 4px var(--neon-cyan))"/>
        
        <!-- Radiation waves reflecting -->
        <path d="M 90,85 L 125,95 L 95,105" fill="none" stroke="#ff007f" stroke-width="2" stroke-linecap="round"/>
        <polygon points="95,105 103,101 100,109" fill="#ff007f"/>
        
        <path d="M 90,115 L 125,105 L 95,95" fill="none" stroke="#ff007f" stroke-width="2" stroke-linecap="round"/>
        
        <text x="145" y="100" fill="#00f0ff" font-size="8" transform="rotate(90,145,100)" text-anchor="middle">Silver Blanket</text>
        <text x="90" y="180" fill="#ff007f" font-size="8" text-anchor="middle">Radiation Reflected Back</text>
      </svg>
    `
  },
  {
    id: "car_radiator",
    name: "Car Radiator",
    description: "Heat conducts from the hot engine block to the coolant. The coolant pumps to the radiator fins, where heat conducts to the metal fins. Air flowing through the fins removes the heat primarily by forced convection.",
    modes: { conduction: true, convection: true, radiation: false },
    dominant: "convection",
    note: "Forced convection by cooling liquid and fan currents.",
    svg: `
      <svg viewBox="0 0 200 220" width="100%" height="100%">
        <!-- Radiator Frame -->
        <rect x="50" y="50" width="100" height="100" fill="none" stroke="#444" stroke-width="3"/>
        
        <!-- Metal Fins (grid lines) -->
        <line x1="60" y1="50" x2="60" y2="150" stroke="#777" stroke-width="2"/>
        <line x1="70" y1="50" x2="70" y2="150" stroke="#777" stroke-width="2"/>
        <line x1="80" y1="50" x2="80" y2="150" stroke="#777" stroke-width="2"/>
        <line x1="90" y1="50" x2="90" y2="150" stroke="#777" stroke-width="2"/>
        <line x1="100" y1="50" x2="100" y2="150" stroke="#777" stroke-width="2"/>
        <line x1="110" y1="50" x2="110" y2="150" stroke="#777" stroke-width="2"/>
        <line x1="120" y1="50" x2="120" y2="150" stroke="#777" stroke-width="2"/>
        <line x1="130" y1="50" x2="130" y2="150" stroke="#777" stroke-width="2"/>
        <line x1="140" y1="50" x2="140" y2="150" stroke="#777" stroke-width="2"/>
        
        <!-- Coolant pipe entry/exit -->
        <path d="M 30,60 L 50,60" stroke="#ff003c" stroke-width="4"/>
        <path d="M 30,140 L 50,140" stroke="#0077ff" stroke-width="4"/>
        
        <!-- Cooling Fan airflow -->
        <path d="M 100,25 Q 100,45 100,50" fill="none" stroke="#00f0ff" stroke-width="2" stroke-dasharray="3,3"/>
        <polygon points="100,50 96,42 104,42" fill="#00f0ff"/>
        
        <text x="25" y="50" fill="#ff003c" font-size="8" text-anchor="middle">Hot Coolant</text>
        <text x="25" y="155" fill="#0077ff" font-size="8" text-anchor="middle">Cold Coolant</text>
        <text x="100" y="175" fill="#ff6b00" font-size="8" text-anchor="middle">Convection cools the Fins</text>
      </svg>
    `
  },
  {
    id: "greenhouse_effect",
    name: "Greenhouse Effect",
    description: "Short-wavelength solar radiation passes through glass panels easily. The ground absorbs it and re-radiates it as longer-wavelength infrared radiation. This longwave radiation cannot pass back through the glass and gets trapped.",
    modes: { conduction: false, convection: false, radiation: true },
    dominant: "radiation",
    note: "Trapped long-wavelength infrared radiation warms the interior.",
    svg: `
      <svg viewBox="0 0 200 220" width="100%" height="100%">
        <!-- Glass Roof -->
        <polygon points="30,80 100,30 170,80" fill="none" stroke="#00f0ff" stroke-width="3"/>
        <line x1="30" y1="80" x2="170" y2="80" stroke="#00f0ff" stroke-dasharray="2,2"/>
        
        <!-- Ground -->
        <rect x="25" y="150" width="150" height="20" fill="#4e342e"/>
        
        <!-- Incoming Solar Radiation (Shortwave) -->
        <path d="M 80,10 L 95,60 L 105,145" fill="none" stroke="#ffea00" stroke-width="2.5"/>
        <polygon points="105,145 100,138 108,138" fill="#ffea00"/>
        
        <!-- Outgoing heat (Longwave trapped) -->
        <path d="M 110,145 Q 120,95 100,75" fill="none" stroke="#ff007f" stroke-width="2"/>
        <path d="M 100,75 Q 85,85 110,120" fill="none" stroke="#ff007f" stroke-width="2"/>
        
        <text x="50" y="55" fill="#ffea00" font-size="7">Solar Ray (Shortwave)</text>
        <text x="145" y="110" fill="#ff007f" font-size="7" text-anchor="middle">Trapped Longwave</text>
      </svg>
    `
  }
];

// ==========================================
// REVISION FLASHCARDS DATA
// ==========================================
const FLASHCARDS = [
  {
    question: "Why does a vacuum flask have a vacuum layer between its double walls?",
    answer: "A vacuum contains no particles. Since both conduction and convection require particles to transfer thermal energy, the vacuum layer effectively prevents heat loss or gain via these two modes."
  },
  {
    question: "Why are the walls of a vacuum flask silvered?",
    answer: "Silvered walls are highly reflective and extremely poor emitters of thermal radiation. This design reduces heat transfer by radiation to a minimum."
  },
  {
    question: "Why is a room heater placed at floor level?",
    answer: "Warm air is less dense and rises, while cold air sinks to replace it. Placing the heater at the bottom creates convection currents that efficiently circulate heat throughout the room."
  },
  {
    question: "Why are solar water heater panels painted dull black?",
    answer: "Dull black surfaces are excellent absorbers of infrared radiation. This maximizes the absorption of solar thermal energy."
  },
  {
    question: "Why do cooking pots use wooden or plastic handles?",
    answer: "Wood and plastic are poor conductors of heat (insulators). They prevent heat from conducting from the pot to the user's hand, avoiding burns."
  },
  {
    question: "Why does a shiny survival blanket keep a person warm?",
    answer: "The silver shiny surface reflects infrared radiation back to the person's body and is a poor emitter, preventing heat loss by radiation."
  },
  {
    question: "Why does a car radiator use convection to cool the engine?",
    answer: "The liquid coolant absorbs heat and circulates (convection) to the radiator, and air flowing past the radiator fins carries the heat away via convection currents."
  },
  {
    question: "How does the greenhouse effect trap heat?",
    answer: "Short-wavelength solar radiation passes through glass, but the ground absorbs it and re-radiates it as long-wavelength infrared radiation, which cannot pass through glass and gets trapped."
  },
  {
    question: "Why does land heat up and cool down faster than the sea?",
    answer: "Land has a lower specific heat capacity than water. It heats up faster during the day, producing sea breeze, and cools faster at night, producing land breeze."
  },
  {
    question: "Why does metal feel colder than wood at the same temperature?",
    answer: "Metal is a much better thermal conductor than wood. It conducts heat away from your hand at a much faster rate, creating the sensation of cold."
  }
];

// ==========================================
// QUIZ POOL (30 QUESTIONS)
// ==========================================
const QUIZ_POOL = [
  {
    q: "Which heat transfer mechanism is completely eliminated by the vacuum layer in a vacuum flask?",
    options: ["Radiation only", "Conduction and Convection", "Convection and Radiation", "Conduction and Radiation"],
    correct: 1,
    type: "single",
    explain: "Conduction and convection both require a physical material medium (particles) to transfer energy. A vacuum has no particles, eliminating both."
  },
  {
    q: "Why are the walls of a vacuum flask silvered?",
    options: [
      "To prevent heat loss via conduction",
      "To prevent heat loss via convection",
      "To reflect radiation back and minimize heat transfer",
      "To make the flask stronger and insulated"
    ],
    correct: 2,
    type: "single",
    explain: "Silvered walls reflect infrared radiation and are poor emitters, minimizing radiation heat transfer."
  },
  {
    q: "A room heater is placed near the floor. What is the main mode of heat transfer that warms up the entire room?",
    options: ["Conduction", "Convection", "Radiation", "Evaporation"],
    correct: 1,
    type: "single",
    explain: "Warm air is less dense and rises, setting up convection currents that carry thermal energy upward to heat the room."
  },
  {
    q: "Which type of surface is the best absorber of infrared radiation?",
    options: ["Shiny white surface", "Shiny silver surface", "Dull black surface", "Dull white surface"],
    correct: 2,
    type: "single",
    explain: "Dull black surfaces absorb almost all incident infrared radiation, making them the best absorbers."
  },
  {
    q: "A cooking pot has a copper base and a plastic handle. Why is plastic used for the handle?",
    options: [
      "It has high thermal conductivity to cool the hand",
      "It is a poor conductor of heat to prevent burns",
      "It emits radiation quickly to lose heat",
      "It sets up local convection currents"
    ],
    correct: 1,
    type: "single",
    explain: "Plastic is a poor conductor (insulator), which prevents heat from conducting to your hand."
  },
  {
    q: "A person wraps themselves in a shiny survival blanket. How does this reduce heat loss?",
    options: [
      "It blocks convection currents around the body",
      "It reflects infrared radiation back to the body",
      "It absorbs radiation from the sun",
      "It conducts cold away from the body"
    ],
    correct: 1,
    type: "single",
    explain: "The shiny surface reflects body radiation back to the user and is a poor emitter of radiation."
  },
  {
    q: "How does a car radiator primarily transfer heat from the hot coolant to the surrounding air?",
    options: ["Convection", "Conduction", "Radiation", "Sieving"],
    correct: 0,
    type: "single",
    explain: "Heat from the coolant is swept away by the air flowing through the radiator fins via convection."
  },
  {
    q: "In the greenhouse effect, which wavelength of radiation is trapped inside the greenhouse?",
    options: [
      "Short-wavelength solar radiation",
      "Long-wavelength infrared radiation",
      "Visible light",
      "Ultraviolet radiation"
    ],
    correct: 1,
    type: "single",
    explain: "Glass is transparent to shortwave solar rays, but opaque to long-wavelength infrared rays re-radiated by the ground."
  },
  {
    q: "During the day, which direction does a sea breeze blow and why?",
    options: [
      "From sea to land, because land is hotter and air rises",
      "From land to sea, because land is hotter and air rises",
      "From sea to land, because water is hotter and air rises",
      "From land to sea, because water is hotter and air rises"
    ],
    correct: 0,
    type: "single",
    explain: "Land heats up faster than the sea. Air above land rises, drawing in cool air from the sea."
  },
  {
    q: "Why does a metal spoon feel colder than a wooden spoon when both are left in a cold room at 15°C?",
    options: [
      "Metal is at a lower temperature than wood",
      "Metal conducts heat away from the hand faster than wood",
      "Metal is a poorer conductor than wood",
      "Wood absorbs cold from the room faster"
    ],
    correct: 1,
    type: "single",
    explain: "Since both are in the same room, they are at the same temperature. Metal feels colder because it conducts heat away from your warm skin faster."
  },
  {
    q: "Which of the following occurs without the need for a physical medium (can happen in a vacuum)?",
    options: ["Conduction", "Convection", "Radiation", "Both Conduction and Convection"],
    correct: 2,
    type: "single",
    explain: "Radiation travels as electromagnetic waves, which do not require a material medium to propagate."
  },
  {
    q: "Which statement about convection is true?",
    options: [
      "Convection occurs in solids and liquids",
      "Convection involves the bulk movement of fluid particles",
      "Convection does not depend on density differences",
      "Convection transfers heat via free electrons"
    ],
    correct: 1,
    type: "single",
    explain: "Convection is the transfer of heat by the actual bulk movement of the heated particles in a fluid (liquid or gas)."
  },
  {
    q: "Which surface property makes an object the worst emitter of radiation?",
    options: ["Dull black", "Shiny silvered", "Rough gray", "Dull white"],
    correct: 1,
    type: "single",
    explain: "Shiny, silvered, and polished surfaces are poor emitters (and good reflectors) of radiation."
  },
  {
    q: "Select all heat transfer modes present when boiling water in a metal pan on a stove.",
    options: [
      "Conduction only",
      "Convection only",
      "Conduction and Convection",
      "Convection and Radiation only"
    ],
    correct: 2,
    type: "single",
    explain: "Heat conducts from the stove through the metal base, and water inside circulates via convection currents."
  },
  {
    q: "A refrigerator's cooling unit is placed at the top of the compartment. Why?",
    options: [
      "To allow warm air to rise and escape",
      "So cold air (which is denser) sinks, creating convection currents",
      "To prevent conduction to the food below",
      "To maximize radiation emission downward"
    ],
    correct: 1,
    type: "single",
    explain: "Cool air is denser and sinks to the bottom, while warmer air at the bottom rises to be cooled, forming convection currents."
  },
  {
    q: "What makes copper an excellent conductor of heat?",
    options: [
      "Its atoms can move freely from one place to another",
      "The presence of a large number of free moving electrons",
      "It has a shiny surface that absorbs radiation",
      "It expands significantly when heated"
    ],
    correct: 1,
    type: "single",
    explain: "Copper has free electrons that quickly diffuse and collide with other atoms/electrons, accelerating conduction."
  },
  {
    q: "Why do we wear light-colored clothing in hot, sunny weather?",
    options: [
      "To absorb more radiation from the sun",
      "To reflect solar radiation and stay cooler",
      "To increase conduction of body heat to the air",
      "To prevent convection currents near the skin"
    ],
    correct: 1,
    type: "single",
    explain: "Light-colored clothes are poor absorbers and good reflectors of radiation, keeping you cooler."
  },
  {
    q: "What is the main reason double-glazed windows keep a house warm in winter?",
    options: [
      "They reflect all radiation back inside",
      "The air/vacuum gap between the panes blocks conduction and convection",
      "They absorb sunlight and generate heat",
      "The glass has free electrons that insulate"
    ],
    correct: 1,
    type: "single",
    explain: "Air is a poor conductor. When trapped in a thin gap, it cannot circulate easily, minimizing conduction and convection."
  },
  {
    q: "Which of the following is the best radiator (emitter) of heat?",
    options: ["A shiny tin can", "A painted black car roof", "A white plastic bucket", "A copper plate"],
    correct: 1,
    type: "single",
    explain: "Dull, dark black surfaces are excellent emitters of radiation."
  },
  {
    q: "True or False: A vacuum prevents all forms of heat transfer.",
    options: ["True", "False"],
    correct: 1,
    type: "single",
    explain: "False. While a vacuum blocks conduction and convection, radiation can still pass through it."
  },
  {
    q: "Why are the cooling fins of an air conditioner made of metal and painted black?",
    options: [
      "Metal conducts heat to the surface, and black maximizes radiation loss",
      "Metal blocks conduction, and black reflects heat",
      "Metal absorbs cold, and black keeps it insulated",
      "It is purely for aesthetic reasons"
    ],
    correct: 0,
    type: "single",
    explain: "Metal has high thermal conductivity to bring heat out, and the black coating increases the rate of radiation emission."
  },
  {
    q: "When a fluid is heated, it expands. How does this affect its density and movement?",
    options: [
      "Density increases; it sinks",
      "Density decreases; it rises",
      "Density increases; it rises",
      "Density decreases; it sinks"
    ],
    correct: 1,
    type: "single",
    explain: "Heating causes expansion (volume increases), so density decreases, causing the hot fluid to rise."
  },
  {
    q: "Which of these is the dominant mechanism of heat loss from a hot cup of tea to a cold drafty room?",
    options: ["Conduction", "Convection", "Radiation", "Expansion"],
    correct: 1,
    type: "single",
    explain: "In drafty conditions, air moves rapidly over the tea, removing heat primarily via convection."
  },
  {
    q: "Why does wrapping food in aluminum foil keep it hot?",
    options: [
      "Aluminum is a poor conductor",
      "The shiny foil reflects radiated heat back to the food",
      "Foil creates a vacuum around the food",
      "Foil absorbs cold air from the environment"
    ],
    correct: 1,
    type: "single",
    explain: "The shiny surface of the foil reflects radiated infrared energy back towards the food."
  },
  {
    q: "Land breeze occurs during the night. Which statement is correct?",
    options: [
      "Land cools down slower than the sea",
      "Warm air rises over the sea, and cool air blows from land to sea",
      "Warm air rises over the land, and cool air blows from sea to land",
      "Conduction is the main driving force"
    ],
    correct: 1,
    type: "single",
    explain: "At night, land cools faster than the sea. The air over the sea is warmer and rises, drawing cool air from the land."
  },
  {
    q: "Which mode of heat transfer is described as the transfer of energy through molecular vibrations without overall movement of the substance?",
    options: ["Convection", "Conduction", "Radiation", "Evaporation"],
    correct: 1,
    type: "single",
    explain: "Conduction is the transfer of heat through molecular collisions and lattice vibrations without the movement of the medium itself."
  },
  {
    q: "Identify the odd one out based on the dominant mechanism of heat transfer: Solar panel, Survival blanket, Sea breeze, Greenhouse.",
    options: ["Solar panel", "Survival blanket", "Sea breeze", "Greenhouse"],
    correct: 2,
    type: "single",
    explain: "Sea breeze is dominated by convection, while the others are dominated by radiation."
  },
  {
    q: "A hot metal block is placed in a vacuum chamber. How can it lose heat?",
    options: ["Only by conduction", "Only by radiation", "Only by convection", "It cannot lose heat"],
    correct: 1,
    type: "single",
    explain: "Since it is in a vacuum, conduction and convection cannot occur. It can only lose heat by radiation."
  },
  {
    q: "Which design feature is intended to REDUCE heat transfer?",
    options: [
      "Black-painted solar collector pipes",
      "Copper bottom on a cooking pot",
      "Polystyrene walls in an ice box",
      "Thin metal fins on a CPU cooler"
    ],
    correct: 2,
    type: "single",
    explain: "Polystyrene contains trapped air bubbles, acting as an insulator to reduce conduction and convection."
  },
  {
    q: "Why do igloos keep people relatively warm in polar regions?",
    options: [
      "Ice is an excellent conductor that draws in heat",
      "Snow contains trapped air, which acts as a thermal insulator",
      "The shape of the igloo generates radiation",
      "Convection currents are trapped inside the ice block itself"
    ],
    correct: 1,
    type: "single",
    explain: "Compact snow contains trapped air pockets, which are poor conductors, preventing heat loss from inside the igloo."
  }
];

// ==========================================
// STATE MANAGEMENT
// ==========================================
let currentTab = "explorer-section";
let activeScenario = null;
let currentFlashcardIndex = 0;
let shuffledFlashcards = [...FLASHCARDS];
let currentQuizSet = [];
let currentQuizIndex = 0;
let quizScore = 0;
let isAnswered = false;

// Particle Engine variables
const canvas = document.getElementById("particle-canvas");
const ctx = canvas.getContext("2d");
let particles = [];
let animationFrameId = null;

// ==========================================
// EVENT LISTENERS & ROUTING
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  initApp();
  
  // Tab navigation
  document.querySelectorAll(".app-tabs .nav-item").forEach(button => {
    button.addEventListener("click", (e) => {
      const targetTab = e.currentTarget.getAttribute("data-tab");
      switchTab(targetTab);
    });
  });

  // Scenario Explorer back button
  document.getElementById("detail-back-btn").addEventListener("click", () => {
    closeScenarioDetail();
  });

  // Flashcards navigation
  document.getElementById("prev-card-btn").addEventListener("click", () => navigateFlashcard(-1));
  document.getElementById("next-card-btn").addEventListener("click", () => navigateFlashcard(1));
  document.getElementById("shuffle-cards-btn").addEventListener("click", shuffleFlashcards);

  // Quiz next and retry buttons
  document.getElementById("quiz-next-btn").addEventListener("click", nextQuizQuestion);
  document.getElementById("quiz-retry-btn").addEventListener("click", startNewQuizSession);

  // Resize canvas handler
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();
});

function initApp() {
  renderScenariosGrid();
  shuffleFlashcards();
  startNewQuizSession();
}

function switchTab(tabId) {
  currentTab = tabId;
  
  // Reset active tabs
  document.querySelectorAll(".tab-content").forEach(tab => {
    tab.classList.remove("active");
    tab.classList.add("hidden");
  });
  
  document.querySelectorAll(".app-tabs .nav-item").forEach(item => {
    item.classList.remove("active");
  });

  // Activate selected tab
  const activeSection = document.getElementById(tabId);
  activeSection.classList.remove("hidden");
  activeSection.classList.add("active");

  const matchingBtn = document.querySelector(`.app-tabs .nav-item[data-tab="${tabId}"]`);
  if (matchingBtn) matchingBtn.classList.add("active");

  // Close details panel if switching away from explorer
  if (tabId !== "explorer-section") {
    closeScenarioDetail();
  }
}

// ==========================================
// SCENARIO EXPLORER LOGIC
// ==========================================
function renderScenariosGrid() {
  const grid = document.getElementById("scenarios-grid");
  grid.innerHTML = "";
  
  SCENARIOS.forEach(scenario => {
    const card = document.createElement("div");
    card.className = "scenario-card";
    card.innerHTML = `
      ${scenario.svg}
      <h3>${scenario.name}</h3>
    `;
    card.addEventListener("click", () => openScenarioDetail(scenario));
    grid.appendChild(card);
  });
}

function openScenarioDetail(scenario) {
  activeScenario = scenario;
  document.getElementById("detail-title").textContent = scenario.name;
  document.getElementById("detail-visual-container").innerHTML = scenario.svg;
  document.getElementById("detail-description-text").textContent = scenario.description;
  
  // Render Mechanisms list
  const modesList = document.getElementById("detail-modes-list");
  modesList.innerHTML = `
    <span>Conduction ${scenario.modes.conduction ? "✓" : "✗"}</span>
    <span>Convection ${scenario.modes.convection ? "✓" : "✗"}</span>
    <span>Radiation ${scenario.modes.radiation ? "✓" : "✗"}</span>
  `;

  // Render Dominant Mode Highlight
  const dominantPill = document.getElementById("detail-dominant-pill");
  if (scenario.dominant === "none") {
    dominantPill.className = "dominant-mode-pill font-neon-cyan";
    dominantPill.innerHTML = `<span>Main Mode: None (${scenario.note})</span>`;
  } else {
    let neonColorClass = "font-neon-cyan";
    if (scenario.dominant === "convection") neonColorClass = "font-neon-orange";
    if (scenario.dominant === "radiation") neonColorClass = "font-neon-magenta";

    dominantPill.className = `dominant-mode-pill ${neonColorClass}`;
    dominantPill.innerHTML = `<span>Main Mode: ${scenario.dominant.toUpperCase()}</span>`;
  }

  // Show detailed panel
  const panel = document.getElementById("scenario-detail");
  panel.classList.remove("hidden");
}

function closeScenarioDetail() {
  document.getElementById("scenario-detail").classList.add("hidden");
  activeScenario = null;
}

// ==========================================
// REVISION FLASHCARDS LOGIC
// ==========================================
function shuffleFlashcards() {
  shuffledFlashcards = [...FLASHCARDS].sort(() => Math.random() - 0.5);
  currentFlashcardIndex = 0;
  renderFlashcard();
}

function renderFlashcard() {
  const deck = document.getElementById("flashcard-deck");
  deck.innerHTML = "";
  
  const cardData = shuffledFlashcards[currentFlashcardIndex];
  
  const card = document.createElement("div");
  card.className = "flashcard";
  card.innerHTML = `
    <div class="card-face card-front">
      <div class="card-type">QUESTION</div>
      <div class="card-text">${cardData.question}</div>
      <div class="card-instruction">Tap to Flip</div>
    </div>
    <div class="card-face card-back">
      <div class="card-type">EXPLANATION</div>
      <div class="card-text">${cardData.answer}</div>
      <div class="card-instruction">Tap to Flip Back</div>
    </div>
  `;
  
  card.addEventListener("click", () => {
    card.classList.toggle("flipped");
  });
  
  deck.appendChild(card);
  
  // Update UI counter
  document.getElementById("card-counter").textContent = `${currentFlashcardIndex + 1} / ${shuffledFlashcards.length}`;
}

function navigateFlashcard(direction) {
  currentFlashcardIndex += direction;
  if (currentFlashcardIndex < 0) {
    currentFlashcardIndex = shuffledFlashcards.length - 1;
  } else if (currentFlashcardIndex >= shuffledFlashcards.length) {
    currentFlashcardIndex = 0;
  }
  renderFlashcard();
}

// ==========================================
// QUIZ SYSTEM LOGIC
// ==========================================
function startNewQuizSession() {
  // Select 10 questions randomly
  currentQuizSet = [...QUIZ_POOL].sort(() => Math.random() - 0.5).slice(0, 10);
  currentQuizIndex = 0;
  quizScore = 0;
  
  // Reset UI elements
  document.getElementById("quiz-active-panel").classList.remove("hidden");
  document.getElementById("quiz-score-panel").classList.add("hidden");
  
  showQuizQuestion();
}

function showQuizQuestion() {
  isAnswered = false;
  const qData = currentQuizSet[currentQuizIndex];
  
  // Progress Bar
  const progressPercent = ((currentQuizIndex) / 10) * 100;
  document.getElementById("quiz-progress-fill").style.width = `${progressPercent}%`;
  
  document.getElementById("quiz-question-number").textContent = `Question ${currentQuizIndex + 1} of 10`;
  document.getElementById("quiz-score-badge").textContent = `Score: ${quizScore}`;
  
  const quizCard = document.getElementById("quiz-card-element");
  quizCard.className = "quiz-card"; // Reset animation classes
  
  document.getElementById("quiz-question-text").textContent = qData.q;
  document.getElementById("quiz-feedback-box").classList.add("hidden");
  
  // Options render
  const optionsContainer = document.getElementById("quiz-options-container");
  optionsContainer.innerHTML = "";
  
  // Randomize Option Order
  const indexedOptions = qData.options.map((opt, index) => ({ text: opt, originalIndex: index }));
  const shuffledOptions = indexedOptions.sort(() => Math.random() - 0.5);
  
  shuffledOptions.forEach((opt, idx) => {
    const letter = String.fromCharCode(65 + idx); // A, B, C, D
    const optionBtn = document.createElement("button");
    optionBtn.className = "quiz-option";
    optionBtn.innerHTML = `
      <span class="option-letter">${letter}</span>
      <span>${opt.text}</span>
    `;
    optionBtn.addEventListener("click", () => handleOptionSelect(opt.originalIndex, optionBtn));
    optionsContainer.appendChild(optionBtn);
  });
}

function handleOptionSelect(selectedIndex, optionBtn) {
  if (isAnswered) return;
  isAnswered = true;
  
  const qData = currentQuizSet[currentQuizIndex];
  const isCorrect = selectedIndex === qData.correct;
  
  const quizCard = document.getElementById("quiz-card-element");
  const feedbackIndicator = document.getElementById("feedback-indicator");
  
  // Highlight choices
  document.querySelectorAll(".quiz-option").forEach(btn => {
    btn.disabled = true; // Disable all
  });
  
  if (isCorrect) {
    quizScore++;
    quizCard.classList.add("correct-flash");
    optionBtn.classList.add("correct-choice");
    
    feedbackIndicator.textContent = "CORRECT";
    feedbackIndicator.className = "feedback-indicator correct";
  } else {
    quizCard.classList.add("wrong-flash");
    optionBtn.classList.add("wrong-choice");
    
    // Also highlight correct answer
    document.querySelectorAll(".quiz-option").forEach(btn => {
      // Find the correct button inside grid
      if (btn.innerText.includes(qData.options[qData.correct])) {
        btn.classList.add("correct-choice");
      }
    });
    
    feedbackIndicator.textContent = "INCORRECT";
    feedbackIndicator.className = "feedback-indicator wrong";
  }
  
  // Display explanations
  document.getElementById("feedback-explanation").textContent = qData.explain;
  document.getElementById("quiz-feedback-box").classList.remove("hidden");
  
  document.getElementById("quiz-score-badge").textContent = `Score: ${quizScore}`;
}

function nextQuizQuestion() {
  currentQuizIndex++;
  if (currentQuizIndex < 10) {
    showQuizQuestion();
  } else {
    showScoreScreen();
  }
}

// ==========================================
// SCORE SCREEN & PARTICLE GENERATION
// ==========================================
function showScoreScreen() {
  document.getElementById("quiz-active-panel").classList.add("hidden");
  
  const scorePanel = document.getElementById("quiz-score-panel");
  scorePanel.classList.remove("hidden");

  // Animate progress fill
  document.getElementById("quiz-progress-fill").style.width = `100%`;

  // Draw Score Radial
  const radialFill = document.getElementById("score-radial-fill");
  const dashArray = 251.2;
  const offset = dashArray - (dashArray * quizScore) / 10;
  
  // Reset dashoffset then trigger transition
  radialFill.style.strokeDashoffset = dashArray;
  
  // Radial color selection based on score
  let accentColor = "var(--neon-red)";
  if (quizScore >= 8) accentColor = "var(--neon-green)";
  else if (quizScore >= 5) accentColor = "var(--neon-orange)";
  
  radialFill.style.stroke = accentColor;
  
  setTimeout(() => {
    radialFill.style.strokeDashoffset = offset;
  }, 100);

  document.getElementById("score-final-val").textContent = quizScore;
  
  const scoreCard = document.querySelector(".score-card");
  const verdictTitle = document.getElementById("score-verdict-title");
  const feedbackText = document.getElementById("score-feedback-text");
  
  // Reset animations/classes
  scoreCard.className = "score-card";
  verdictTitle.className = "score-verdict";

  if (quizScore >= 8) {
    verdictTitle.textContent = "Excellent!";
    verdictTitle.classList.add("font-neon-green");
    feedbackText.textContent = "You can apply heat transfer concepts to everyday situations.";
    
    // Trigger neon particle burst
    triggerNeonParticles();
  } else if (quizScore >= 5) {
    verdictTitle.textContent = "Good effort.";
    verdictTitle.classList.add("font-neon-orange");
    feedbackText.textContent = "Review the scenario explorer and check the main mode for each.";
    scoreCard.classList.add("pulse-glow");
  } else {
    verdictTitle.textContent = "Keep practising.";
    verdictTitle.classList.add("font-neon-red");
    feedbackText.innerHTML = `Go back to the scenario explorer and read each explanation carefully. <div style="margin-top: 10px; font-size: 1.2rem; animation: bounce 1s infinite;">↓</div>`;
  }
}

// Particle Burst Physics Engine (Canvas)
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function triggerNeonParticles() {
  particles = [];
  const colors = ["#00f0ff", "#ff6b00", "#ff007f", "#39ff14"];
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  // Generate 80 particles
  for (let i = 0; i < 80; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 8;
    particles.push({
      x: centerX,
      y: centerY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 2 + Math.random() * 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      decay: 0.01 + Math.random() * 0.02
    });
  }

  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  animateParticles();
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  let active = false;
  
  particles.forEach(p => {
    if (p.alpha > 0) {
      active = true;
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = p.color;
      ctx.fill();
      ctx.restore();
    }
  });

  if (active) {
    animationFrameId = requestAnimationFrame(animateParticles);
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}
