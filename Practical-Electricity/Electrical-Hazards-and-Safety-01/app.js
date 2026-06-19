/* ==========================================
   APP DATA: HOTSPOTS, FLASHCARDS, & QUIZ POOL
   ========================================== */

// 1. Hotspot data for household room scene
const hotspotData = {
    "damp-kitchen": {
        title: "Damp Conditions (Kitchen Sink)",
        desc: "A kettle is placed near a sink with water splashing around, and a person might plug it in with damp hands.",
        danger: "Pure water is a poor conductor, but common tap water contains dissolved minerals and is a conductor. Wet skin has a much lower electrical resistance than dry skin, allowing a large current to pass through the body if contact is made, causing a severe electric shock.",
        solution: "Keep electrical appliances and sockets far away from water sources. Always dry hands thoroughly before handling electrical plugs, switches, or appliances."
    },
    "overloaded-socket": {
        title: "Overheating (Overloaded Socket)",
        desc: "Multiple high-power appliances are plugged into a single socket using stacked multi-way adapters.",
        danger: "Drawing excessive current through a single socket causes the cables behind the wall to carry more current than they are designed for. This causes the wires to get extremely hot, leading to insulation melting and starting an electrical fire.",
        solution: "Never overload power sockets. Spread high-power appliances across separate wall sockets. If multiple appliances must be used, ensure their total current draw does not exceed the socket/extension rating."
    },
    "frayed-cable": {
        title: "Damaged Insulation (Exposed Copper)",
        desc: "The protective plastic insulation of the lamp power cord is torn, exposing the internal copper wires.",
        danger: "Touching the exposed conducting copper wire directly connects a person to the live supply, causing a major electric shock. It can also cause a short circuit if wires touch, leading to sparks and fire.",
        solution: "Immediately stop using the appliance. Replace the damaged power cable or wrap it professionally. Regularly inspect cables for signs of wear."
    },
    "missing-earth": {
        title: "Missing Earth Wire (Metal-Cased Appliance)",
        desc: "A metal-cased table fan is wired incorrectly without an earth wire, or the earth connection inside the plug is broken.",
        danger: "If an internal fault occurs and the live wire touches the metal casing, the entire casing becomes live (at high voltage). Without an earth wire, the current has no path to ground. If a user touches the metal casing, they will provide that path, causing an electric shock.",
        solution: "Always ensure metal-cased appliances are earthed via a properly wired 3-pin plug. The earth wire ensures that if a fault occurs, the current flows safely to ground, melting the fuse to cut off the supply."
    },
    "double-insulated": {
        title: "Double Insulation (Safe Fan/Hairdryer)",
        desc: "A plastic-cased hairdryer showing the double insulation symbol (square within a square).",
        danger: "This appliance has two layers of protective insulation and no exposed metal parts on its casing. Even if a wire inside comes loose and touches the inner casing, the outer plastic casing does not conduct electricity, so the user is safe from electric shock.",
        solution: "This appliance is safe and correctly designed. Because of the double insulation, it only needs a 2-pin plug (Live and Neutral). An earth wire is not required."
    },
    "safe-microwave": {
        title: "Correctly-Earthed Microwave (Safe Appliance)",
        desc: "A microwave with a metal body that is correctly connected to a 3-pin plug with a working earth wire.",
        danger: "No danger present. If an internal fault causes the live wire to touch the metal body, current immediately routes through the earth wire to ground. This low-resistance path draws a large current, which melts the fuse and safely disconnects the power.",
        solution: "This is a safe configuration. Periodic checks on the plug pins and ensuring the socket is not damp are sufficient."
    }
};

// 2. Flashcard deck (14 cards)
const flashcards = [
    {
        category: "Mains Wiring",
        front: "What is the function and colour of the Live wire?",
        back: "The Live wire is <strong>Brown</strong>. It delivers current from the mains supply to the appliance at high voltage (usually 230V in Singapore)."
    },
    {
        category: "Mains Wiring",
        front: "What is the function and colour of the Neutral wire?",
        back: "The Neutral wire is <strong>Blue</strong>. It completes the circuit by returning current from the appliance back to the source at or near 0V."
    },
    {
        category: "Mains Wiring",
        front: "What is the function and colour of the Earth wire?",
        back: "The Earth wire is <strong>Yellow and Green striped</strong>. It is a safety wire connected to the metal casing of an appliance, providing a low-resistance path to ground for fault currents."
    },
    {
        category: "Electrical Hazards",
        front: "Explain the danger of damaged insulation.",
        back: "Torn or cracked plastic insulation exposes live conducting copper wires. Anyone touching these exposed wires will experience a severe electric shock."
    },
    {
        category: "Electrical Hazards",
        front: "Explain the danger and causes of overheating cables.",
        back: "Caused by overloading a socket or using wires that are too thin. The excessive current generates high temperatures, which can melt insulation and cause fires."
    },
    {
        category: "Electrical Hazards",
        front: "Why are damp conditions highly dangerous for electricity?",
        back: "Water lowers the electrical resistance of human skin. If a person with wet hands touches a switch or appliance, a much larger current will flow through them, causing a fatal shock."
    },
    {
        category: "Safety Devices",
        front: "How does a fuse protect an electrical circuit?",
        back: "A fuse contains a thin wire that <strong>melts and breaks</strong> the circuit when the current exceeds its rating, protecting wires from overheating and fire."
    },
    {
        category: "Safety Devices",
        front: "What is a fuse rating and how do you choose it?",
        back: "The fuse rating is the maximum current a fuse can carry before melting. You choose the smallest standard fuse rating (e.g., 1A, 3A, 5A, 13A) that is slightly larger than the appliance's normal operating current."
    },
    {
        category: "Safety Devices",
        front: "How does a circuit breaker differ from a fuse?",
        back: "A circuit breaker is an electromagnetic switch that trips to cut off current. Unlike fuses, it does not melt and can be <strong>reset</strong> after the fault is fixed."
    },
    {
        category: "Safety Devices",
        front: "Why must switches, fuses, and circuit breakers be placed on the Live wire?",
        back: "Placing them on the Live wire ensures that when they open/trip, the appliance is completely disconnected from the high-voltage supply, preventing shock risks when open."
    },
    {
        category: "Shock Prevention",
        front: "How does earthing a metal casing work during a fault?",
        back: "If a fault connects the live wire to the metal body, current flows through the earth wire to ground. This low-resistance path draws a massive current, melting the fuse and cutting power."
    },
    {
        category: "Shock Prevention",
        front: "What does double insulation mean and when is it used?",
        back: "It means an appliance has two layers of insulating casing. It is used for appliances with plastic bodies, which do not conduct electricity and therefore do not require an earth wire."
    },
    {
        category: "Mains Plug Wiring",
        front: "Describe the correct connections inside a standard three-pin mains plug.",
        back: "<strong>Live:</strong> Brown, connects to the right pin (near fuse).<br><strong>Neutral:</strong> Blue, connects to the left pin.<br><strong>Earth:</strong> Yellow/Green, connects to the top pin."
    },
    {
        category: "Safety Devices",
        front: "Why does an earth wire not carry current during normal operation?",
        back: "In a normal appliance, current only flows through the Live and Neutral wires. The Earth wire only carries current when a fault occurs and live voltage leaks onto the metal body."
    }
];

// 3. Quiz Question Pool (30 questions: MCQs, text inputs, calculations)
const quizQuestionPool = [
    // --- MCQs (1-18) ---
    {
        type: "mcq",
        question: "Which wire completes the electrical circuit by returning current back to the source at zero voltage?",
        options: ["Neutral wire", "Live wire", "Earth wire", "Fuse wire"],
        answer: 0,
        explanation: "The Neutral wire completes the circuit and is at approximately 0V. The Live wire carries current to the appliance at 230V, and the Earth wire is a safety path."
    },
    {
        type: "mcq",
        question: "Why are switches, fuses, and circuit breakers always installed in the live wire rather than the neutral wire?",
        options: [
            "It reduces the current passing through the neutral wire",
            "It isolates the appliance from the high-voltage source when opened or tripped",
            "It ensures current can flow directly to the earth wire",
            "Fuses melt faster in the neutral wire"
        ],
        answer: 1,
        explanation: "Placing safety components on the Live wire ensures that when they turn off or melt, the appliance is completely isolated from the high 230V voltage, preventing electric shock."
    },
    {
        type: "mcq",
        question: "An appliance has a plastic outer body with double insulation. Which of the following is true?",
        options: [
            "It must be earthed with a green-yellow wire",
            "It does not require an earth wire because the plastic casing cannot conduct current",
            "It requires a larger fuse than a metal-cased appliance",
            "It is highly unsafe to use in damp conditions compared to metal devices"
        ],
        answer: 1,
        explanation: "Double-insulated appliances have a non-conducting plastic casing. Even if a wire inside becomes loose and touches the casing, the user cannot get shocked, so an earth wire is not needed."
    },
    {
        type: "mcq",
        question: "What happens when the current in a circuit exceeds the rating of the fuse installed in it?",
        options: [
            "The circuit breaker resets automatically",
            "The fuse wire melts and breaks the circuit to prevent overheating",
            "The current is redirected safely into the earth wire",
            "The voltage increases to compensate for the current flow"
        ],
        answer: 1,
        explanation: "A fuse wire has a low melting point. When excess current flows, it melts and breaks the circuit, stopping current flow and preventing cable overheating or fire."
    },
    {
        type: "mcq",
        question: "Which electrical hazard directly corresponds to drawing too much current from a single socket using multiple adapters?",
        options: [
            "Damaged insulation",
            "Overheating of cables",
            "Damp conditions",
            "Inadequate earthing"
        ],
        answer: 1,
        explanation: "Overloading a socket with multiple adapters increases the total current drawn through the supply cables, which leads to overheating of cables and potential fires."
    },
    {
        type: "mcq",
        question: "Which wire in a three-pin plug is coloured yellow and green stripes?",
        options: ["Neutral wire", "Live wire", "Earth wire", "Fuse wire"],
        answer: 2,
        explanation: "The Earth wire has green and yellow stripes. Live is brown and Neutral is blue."
    },
    {
        type: "mcq",
        question: "What is the primary advantage of a circuit breaker over a fuse?",
        options: [
            "It does not require a live wire connection",
            "It can be reset after tripping, whereas a fuse must be replaced",
            "It operates at a much higher voltage than a fuse",
            "It uses a plastic insulator to redirect current"
        ],
        answer: 1,
        explanation: "Circuit breakers are electromagnetic switches that trip when current is too high. They can be reset after fixing the fault, making them more convenient than fuses."
    },
    {
        type: "mcq",
        question: "Why is water near electrical appliances considered a major hazard?",
        options: [
            "It increases the chemical reaction inside the cables",
            "It dramatically lowers the electrical resistance of the body, increasing shock current",
            "It melts the fuse wire prematurely",
            "It changes the live wire voltage from 230V to 0V"
        ],
        answer: 1,
        explanation: "Water (with dissolved minerals) is a conductor. Wet skin has very low electrical resistance, meaning any accidental contact will result in a much larger, potentially lethal current flowing through the body."
    },
    {
        type: "mcq",
        question: "To which pin of a standard 3-pin plug should the blue wire be connected?",
        options: ["Earth pin (top)", "Neutral pin (left)", "Live pin (right)", "Fuse holder"],
        answer: 1,
        explanation: "The blue wire is the Neutral wire, which must be connected to the Neutral pin on the left side of the plug."
    },
    {
        type: "mcq",
        question: "To which pin of a standard 3-pin plug should the brown wire be connected?",
        options: ["Earth pin (top)", "Neutral pin (left)", "Live pin (right)", "Ground connector"],
        answer: 2,
        explanation: "The brown wire is the Live wire, which connects to the Live pin on the right, which is in series with the fuse."
    },
    {
        type: "mcq",
        question: "If the current in an earthed metal-cased appliance reaches 15A due to a live-to-case fault, and the fuse is rated at 13A, what happens?",
        options: [
            "The earth wire melts and cuts the voltage",
            "The casing stays live indefinitely without action",
            "The fuse wire melts, breaking the circuit and isolating the appliance",
            "The circuit breaker increases its capacity"
        ],
        answer: 2,
        explanation: "Since 15A exceeds the 13A fuse rating, the fuse wire melts and breaks the circuit, isolating the appliance and removing the shock hazard."
    },
    {
        type: "mcq",
        question: "An appliance casing has the double-square symbol (🔳). Which wire is omitted from its mains cable?",
        options: ["Neutral wire", "Live wire", "Earth wire", "None, it needs all three"],
        answer: 2,
        explanation: "The double-square symbol stands for double insulation. Since it has a plastic body that cannot conduct electricity, the Earth wire is omitted."
    },
    {
        type: "mcq",
        question: "A student notices sparks from a frayed vacuum cord. What hazard is this?",
        options: ["Damp conditions", "Damaged insulation", "Overloaded sockets", "Incorrect earthing"],
        answer: 1,
        explanation: "Exposed wires due to cracks or tears in the outer rubber coating constitute a damaged insulation hazard, which can spark or shock."
    },
    {
        type: "mcq",
        question: "What is the normal operating potential (voltage) of the neutral wire in a healthy domestic circuit?",
        options: ["230 V", "110 V", "0 V", "It varies continuously based on power usage"],
        answer: 2,
        explanation: "The Neutral wire returns the current to the sub-station and is kept at 0V (earth potential) in a healthy system."
    },
    {
        type: "mcq",
        question: "Why is a fuse wire designed with a relatively low melting point?",
        options: [
            "So it can conduct current more efficiently",
            "So it melts easily to break the circuit when current is too high, preventing fires",
            "To withstand damp conditions inside the plug",
            "To prevent the earth wire from conducting current"
        ],
        answer: 1,
        explanation: "Fuses protect wires by melting when current is high. A low melting point ensures the wire melts before the copper household cables overheat."
    },
    {
        type: "mcq",
        question: "Which wire provides a low-resistance return path to the ground for fault currents in metal-cased appliances?",
        options: ["Neutral wire", "Live wire", "Earth wire", "Fuse wire"],
        answer: 2,
        explanation: "The Earth wire connects the metal casing of the appliance to the earth, creating a low-resistance path to ground for safety."
    },
    {
        type: "mcq",
        question: "What is the danger of placing a switch on the neutral wire instead of the live wire?",
        options: [
            "The appliance will run backwards",
            "The fuse will melt during normal use",
            "The appliance casing remains connected to the live 230V supply even when switched off",
            "The current will bypass the appliance entirely"
        ],
        answer: 2,
        explanation: "If the switch is on the neutral wire, turning it off cuts the current but leaves the appliance at 230V live potential. Touching a component inside could still result in a shock."
    },
    {
        type: "mcq",
        question: "Which standard fuse rating should NOT be selected if the calculated current of an appliance is 5.5A?",
        options: ["13 A", "5 A", "13 A or 5 A", "None, both are fine"],
        answer: 1,
        explanation: "A 5A fuse is too small for a 5.5A current and would melt during normal use. The next standard fuse rating (13A) should be chosen instead."
    },

    // --- Short Text Entry (19-24) ---
    {
        type: "text",
        question: "Name this hazard: a power cable running under a heavy rug that gets hot during use.",
        expected: ["overheating", "overheating of cables", "overheating cables", "cable overheating"],
        explanation: "Cables under rugs cannot dissipate heat. The current passing through them causes the cables to get hotter, leading to overheating of cables, which is a severe fire hazard."
    },
    {
        type: "text",
        question: "Name the safety device that is an electromagnetic switch that trips to cut off current and can be reset.",
        expected: ["circuit breaker", "circuit breakers", "mcb", "rcb"],
        explanation: "A circuit breaker is an electromagnetic switch that breaks the circuit during excess current and can be reset without replacement."
    },
    {
        type: "text",
        question: "Name the hazard that occurs when the plastic covering of a wire cracks, exposing copper conductors.",
        expected: ["damaged insulation", "damaged insulation of cables", "frayed wire", "frayed cable", "exposed wire"],
        explanation: "Damaged insulation refers to cracked or worn outer plastic sheath that exposes internal electrical conductors."
    },
    {
        type: "text",
        question: "What is the colour of the live wire in a standard three-pin plug?",
        expected: ["brown"],
        explanation: "The Live wire in modern international wiring standards is Brown."
    },
    {
        type: "text",
        question: "What is the colour of the neutral wire in a standard three-pin plug?",
        expected: ["blue"],
        explanation: "The Neutral wire is Blue."
    },
    {
        type: "text",
        question: "Name the hazard represented by touching a light switch with wet hands.",
        expected: ["damp conditions", "damp", "wet conditions", "wet hands"],
        explanation: "Damp conditions (or wet hands) introduce water, which reduces electrical resistance on skin, raising electric shock risk."
    },

    // --- Dynamic Calculation Templates (25-30) ---
    // These will be instantiated dynamically by app.js when drawn
    {
        type: "calculation",
        question: "An appliance is rated at [P] W and operates on a [V] V mains supply. Calculate the current and select the most suitable fuse rating from the standard options.",
        options: ["1 A", "3 A", "5 A", "13 A"],
        explanationTemplate: "First, calculate current using I = P ÷ V. Substituting P = [P] W and V = [V] V, we get I = [I] A. The most suitable fuse rating is the smallest standard rating greater than [I] A, which is [F]."
    },
    {
        type: "calculation",
        question: "A cooker rated at [P] W is plugged into a [V] V supply. Which standard fuse rating should be selected to protect the circuit?",
        options: ["1 A", "3 A", "5 A", "13 A"],
        explanationTemplate: "Use the formula I = P ÷ V. Current I = [P] W ÷ [V] V = [I] A. The fuse rating must be greater than the operating current. The smallest standard option above [I] A is [F]."
    },
    {
        type: "calculation",
        question: "A metal-cased water heater has a power of [P] W and is connected to a [V] V mains supply. Select the correct fuse rating for its plug.",
        options: ["1 A", "3 A", "5 A", "13 A"],
        explanationTemplate: "Applying I = P ÷ V gives I = [P] ÷ [V] = [I] A. A fuse rated at [F] is selected because it is the smallest standard rating above the operating current of [I] A."
    },
    {
        type: "calculation",
        question: "Calculate the normal operating current for a double-insulated fan rated at [P] W on a [V] V supply, and choose the correct fuse rating.",
        options: ["1 A", "3 A", "5 A", "13 A"],
        explanationTemplate: "Operating current I = P ÷ V = [P] ÷ [V] = [I] A. The smallest standard fuse rating that exceeds [I] A is [F]."
    },
    {
        type: "calculation",
        question: "A television rated at [P] W operates at [V] V. Select the appropriate standard fuse to install in the mains plug.",
        options: ["1 A", "3 A", "5 A", "13 A"],
        explanationTemplate: "Current I = P ÷ V = [P] ÷ [V] = [I] A. The smallest standard rating greater than [I] A is [F]."
    },
    {
        type: "calculation",
        question: "Determine the correct fuse rating to protect a microwave oven rated at [P] W when connected to a [V] V mains source.",
        options: ["1 A", "3 A", "5 A", "13 A"],
        explanationTemplate: "Current I = P ÷ V = [P] ÷ [V] = [I] A. The ideal fuse rating is [F] because it is the smallest standard fuse that will not melt under the normal current of [I] A."
    }
];


/* ==========================================
   STATE VARIABLES
   ========================================== */
let exploredHotspots = new Set();
let currentCardIndex = 0;

let quizQuestions = [];
let currentQuizQuestionIndex = 0;
let userScore = 0;
let currentQuestionActiveData = null; // Stores instantiated details for calculations

/* ==========================================
   INITIALIZATION & NAVIGATION
   ========================================== */
document.addEventListener("DOMContentLoaded", () => {
    initNavigation();
    initHotspots();
    initFlashcards();
    initQuiz();
});

function initNavigation() {
    const navButtons = document.querySelectorAll(".nav-btn");
    const sections = document.querySelectorAll(".app-section");

    navButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const target = btn.getAttribute("data-target");
            
            // Update button states
            navButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            // Hide all sections with transition
            sections.forEach(sec => {
                sec.classList.remove("active");
            });

            // Show target section
            const targetSection = document.getElementById(`section-${target}`);
            if (targetSection) {
                targetSection.classList.add("active");
            }

            // Custom actions when entering a section
            if (target === "cards") {
                renderCard();
            }
        });
    });

    // Wire results review button
    document.getElementById("review-learn-btn").addEventListener("click", () => {
        document.querySelector('[data-target="intro"]').click();
    });
}


/* ==========================================
   SECTION 2: HOUSEHOLD SCENE HOTSPOTS
   ========================================== */
function initHotspots() {
    const hotspots = document.querySelectorAll("#household-scene .clickable-element");
    const infoCard = document.getElementById("hazard-info-card");
    const closeBtn = document.getElementById("close-hazard-card");

    hotspots.forEach(el => {
        el.addEventListener("click", () => {
            const key = el.getAttribute("data-hotspot");
            const data = hotspotData[key];
            
            if (!data) return;

            // Highlight in SVG
            hotspots.forEach(h => h.classList.remove("highlighted"));
            el.classList.add("highlighted");

            // Mark as explored
            exploredHotspots.add(key);
            updateExplorationProgress();

            // Populate and show details card
            document.getElementById("hazard-title").textContent = data.title;
            document.getElementById("hazard-desc").textContent = data.desc;
            document.getElementById("hazard-danger").textContent = data.danger;
            document.getElementById("hazard-solution").textContent = data.solution;

            // Set badge based on if it's safe or hazard
            const badge = document.getElementById("hazard-badge");
            if (key === "safe-microwave" || key === "double-insulated") {
                badge.textContent = "SAFE PRACTICE";
                badge.style.backgroundColor = "var(--success-color)";
            } else {
                badge.textContent = "HAZARD IDENTIFIED";
                badge.style.backgroundColor = "var(--warn-color)";
            }

            infoCard.classList.remove("hidden");
            infoCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
    });

    closeBtn.addEventListener("click", () => {
        infoCard.classList.add("hidden");
        hotspots.forEach(h => h.classList.remove("highlighted"));
    });
}

function updateExplorationProgress() {
    const total = 6;
    const current = exploredHotspots.size;
    const progressText = document.getElementById("explore-progress-text");
    const progressFill = document.getElementById("explore-progress-fill");

    progressText.textContent = `${current} of ${total} scenarios analyzed`;
    const percentage = (current / total) * 100;
    progressFill.style.width = `${percentage}%`;
}


/* ==========================================
   SECTION 3: FLASHCARDS
   ========================================== */
function initFlashcards() {
    const cardElement = document.getElementById("active-flashcard");
    const prevBtn = document.getElementById("prev-card-btn");
    const nextBtn = document.getElementById("next-card-btn");
    const shuffleBtn = document.getElementById("shuffle-card-btn");

    cardElement.addEventListener("click", () => {
        cardElement.classList.toggle("flipped");
    });

    prevBtn.addEventListener("click", () => {
        if (currentCardIndex > 0) {
            currentCardIndex--;
            cardElement.classList.remove("flipped");
            setTimeout(renderCard, 150); // Small delay so flip back completes before text changes
        }
    });

    shuffleBtn.addEventListener("click", () => {
        // Shuffle the flashcards array in-place
        flashcards.sort(() => 0.5 - Math.random());
        currentCardIndex = 0;
        cardElement.classList.remove("flipped");
        setTimeout(renderCard, 150);
    });

    nextBtn.addEventListener("click", () => {
        if (currentCardIndex < flashcards.length - 1) {
            currentCardIndex++;
            cardElement.classList.remove("flipped");
            setTimeout(renderCard, 150);
        }
    });
}

function renderCard() {
    const data = flashcards[currentCardIndex];
    
    document.getElementById("card-front-category").textContent = data.category;
    document.getElementById("card-back-category").textContent = `${data.category} — EXPLANATION`;
    
    document.getElementById("card-front-text").textContent = data.front;
    document.getElementById("card-back-text").innerHTML = data.back;

    document.getElementById("card-index-text").textContent = `Card ${currentCardIndex + 1} of ${flashcards.length}`;

    // Enable/disable navigation buttons
    document.getElementById("prev-card-btn").disabled = currentCardIndex === 0;
    document.getElementById("next-card-btn").disabled = currentCardIndex === flashcards.length - 1;
}


/* ==========================================
   SECTION 4: QUIZ LOGIC
   ========================================== */
function initQuiz() {
    document.getElementById("start-quiz-btn").addEventListener("click", startQuiz);
    document.getElementById("restart-quiz-btn").addEventListener("click", () => {
        document.getElementById("section-results").classList.remove("active");
        document.getElementById("section-quiz").classList.add("active");
        startQuiz();
    });
    
    document.getElementById("reveal-working-btn").addEventListener("click", openWorkingModal);
    document.getElementById("close-modal").addEventListener("click", closeWorkingModal);
    document.getElementById("working-modal").addEventListener("click", (e) => {
        if (e.target.id === "working-modal") closeWorkingModal();
    });

    document.getElementById("next-question-btn").addEventListener("click", loadNextQuestion);
    document.getElementById("submit-text-btn").addEventListener("click", submitTextAnswer);
    
    // Add keypress handler for text inputs
    document.getElementById("quiz-text-input").addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            submitTextAnswer();
        }
    });
}

function startQuiz() {
    userScore = 0;
    currentQuizQuestionIndex = 0;
    
    // Shuffle and pick 15 questions from the 30-question pool
    const shuffledPool = [...quizQuestionPool].sort(() => 0.5 - Math.random());
    quizQuestions = shuffledPool.slice(0, 15);

    // Hide Start Screen, show Play Panel
    document.getElementById("quiz-start-screen").classList.add("hidden");
    document.getElementById("quiz-play-panel").classList.remove("hidden");

    loadQuestion();
}

function loadQuestion() {
    const question = quizQuestions[currentQuizQuestionIndex];
    currentQuestionActiveData = { ...question }; // Deep copy/reference

    // Reset UI panels
    document.getElementById("explanation-panel").classList.add("hidden");
    document.getElementById("calc-reveal-bar").classList.add("hidden");
    document.getElementById("quiz-options-container").innerHTML = "";
    document.getElementById("quiz-text-container").classList.add("hidden");
    document.getElementById("quiz-text-input").value = "";
    document.getElementById("quiz-text-input").disabled = false;
    document.getElementById("submit-text-btn").disabled = false;

    // Set counter & progress bar
    document.getElementById("q-counter").textContent = `Question ${currentQuizQuestionIndex + 1} of 15`;
    const percentage = ((currentQuizQuestionIndex + 1) / 15) * 100;
    document.getElementById("quiz-progress-fill").style.width = `${percentage}%`;

    // 1. If Calculation Question: Instantiate V and P
    if (question.type === "calculation") {
        instantiateCalculationQuestion(question);
    } else {
        document.getElementById("question-text").textContent = question.question;
    }

    // 2. Render options or text entry based on type
    if (question.type === "mcq" || question.type === "calculation") {
        renderMCQOptions();
    } else if (question.type === "text") {
        document.getElementById("quiz-text-container").classList.remove("hidden");
        document.getElementById("quiz-text-input").focus();
    }
}

// Instantiate randomized voltage and power for fuse calculations
function instantiateCalculationQuestion(questionObj) {
    // Voltage: 200 - 250 V
    const V = Math.floor(Math.random() * 51) + 200;
    // Power: 100 - 3000 W
    const P = Math.floor(Math.random() * 291) * 10 + 100; // Multiples of 10 for clean look
    
    const I = (P / V).toFixed(2);
    
    // Choose correct fuse based on standard fuses: 1A, 3A, 5A, 13A
    let correctFuse = "13 A";
    if (I <= 1.0) correctFuse = "1 A";
    else if (I <= 3.0) correctFuse = "3 A";
    else if (I <= 5.0) correctFuse = "5 A";
    else if (I <= 13.0) correctFuse = "13 A";
    else {
        return instantiateCalculationQuestion(questionObj); // Regenerate if current is out of range of 13A
    }

    // Embed current active parameters in the state data
    currentQuestionActiveData.voltage = V;
    currentQuestionActiveData.power = P;
    currentQuestionActiveData.calculatedCurrent = I;
    currentQuestionActiveData.correctAnswerString = correctFuse;

    // Fill in question text
    let text = questionObj.question;
    text = text.replace("[P]", P).replace("[V]", V);
    document.getElementById("question-text").textContent = text;

    // Set standard options (we know the index based on 1A, 3A, 5A, 13A)
    const options = ["1 A", "3 A", "5 A", "13 A"];
    currentQuestionActiveData.options = options;
    currentQuestionActiveData.answer = options.indexOf(correctFuse);

    // Show calculations reveal bar
    document.getElementById("calc-reveal-bar").classList.remove("hidden");
}

function renderMCQOptions() {
    const container = document.getElementById("quiz-options-container");
    const options = currentQuestionActiveData.options;

    options.forEach((opt, idx) => {
        const btn = document.createElement("button");
        btn.className = "option-btn";
        btn.textContent = opt;
        btn.addEventListener("click", () => handleMCQSelection(idx));
        container.appendChild(btn);
    });
}

function handleMCQSelection(selectedIdx) {
    const container = document.getElementById("quiz-options-container");
    const optionBtns = container.querySelectorAll(".option-btn");
    const correctIdx = currentQuestionActiveData.answer;

    // Disable all options
    optionBtns.forEach(btn => btn.disabled = true);

    // Style correct/incorrect selections
    optionBtns[correctIdx].classList.add("correct-choice");
    
    if (selectedIdx === correctIdx) {
        userScore++;
        triggerShortCelebration();
        showExplanation(true);
    } else {
        optionBtns[selectedIdx].classList.add("wrong-choice");
        showExplanation(false);
    }
}

function submitTextAnswer() {
    const input = document.getElementById("quiz-text-input");
    const answerVal = input.value.trim().toLowerCase();
    
    if (!answerVal) return;

    const expectedSynonyms = currentQuestionActiveData.expected;
    const isCorrect = expectedSynonyms.some(syn => answerVal.includes(syn) || syn.includes(answerVal));

    document.getElementById("submit-text-btn").disabled = true;
    input.disabled = true;

    if (isCorrect) {
        userScore++;
        triggerShortCelebration();
        showExplanation(true);
    } else {
        showExplanation(false);
    }
}

function showExplanation(isCorrect) {
    const panel = document.getElementById("explanation-panel");
    const statusText = document.getElementById("explanation-status-text");
    const statusIcon = document.getElementById("explanation-status-icon");
    const statusDiv = document.getElementById("explanation-status");
    const explanationText = document.getElementById("explanation-text-content");

    panel.classList.remove("hidden");
    
    if (isCorrect) {
        statusDiv.className = "explanation-status correct";
        statusIcon.textContent = "✔";
        statusText.textContent = "Correct!";
    } else {
        statusDiv.className = "explanation-status incorrect";
        statusIcon.textContent = "✘";
        statusText.textContent = "Incorrect";
    }

    // Build explanation text
    if (currentQuestionActiveData.type === "calculation") {
        let expl = currentQuestionActiveData.explanationTemplate;
        expl = expl.replace("[P]", currentQuestionActiveData.power)
                   .replace("[V]", currentQuestionActiveData.voltage)
                   .replace("[I]", currentQuestionActiveData.calculatedCurrent)
                   .replace("[I]", currentQuestionActiveData.calculatedCurrent) // replace second instance
                   .replace("[F]", currentQuestionActiveData.correctAnswerString);
        explanationText.innerHTML = expl;
    } else {
        explanationText.textContent = currentQuestionActiveData.explanation;
    }

    panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function loadNextQuestion() {
    currentQuizQuestionIndex++;
    if (currentQuizQuestionIndex < 15) {
        loadQuestion();
    } else {
        showResults();
    }
}


/* ==========================================
   STEP-BY-STEP CALCULATION MODAL
   ========================================== */
function openWorkingModal() {
    const V = currentQuestionActiveData.voltage;
    const P = currentQuestionActiveData.power;
    const I = currentQuestionActiveData.calculatedCurrent;
    const F = currentQuestionActiveData.correctAnswerString;

    document.getElementById("modal-val-p").textContent = P;
    document.getElementById("modal-val-v").textContent = V;
    document.getElementById("modal-sub-p").textContent = P;
    document.getElementById("modal-sub-v").textContent = V;
    document.getElementById("modal-val-i").textContent = I;
    document.getElementById("modal-val-i-2").textContent = I;
    document.getElementById("modal-val-i-3").textContent = I;

    // Update highlight reasoning text based on chosen fuse rating
    let limitStr = "";
    if (F === "1 A") {
        limitStr = `Since ${I} A is less than or equal to 1 A, we select the <strong>1 A</strong> fuse.`;
    } else if (F === "3 A") {
        limitStr = `Since ${I} A is greater than 1 A but less than 3 A, we select the <strong>3 A</strong> fuse.`;
    } else if (F === "5 A") {
        limitStr = `Since ${I} A is greater than 3 A but less than 5 A, we select the <strong>5 A</strong> fuse.`;
    } else if (F === "13 A") {
        limitStr = `Since ${I} A is greater than 5 A but less than 13 A, we select the <strong>13 A</strong> fuse.`;
    }
    
    document.querySelector(".highlight-reason").innerHTML = limitStr;
    document.getElementById("working-modal").classList.remove("hidden");
}

function closeWorkingModal() {
    document.getElementById("working-modal").classList.add("hidden");
}


/* ==========================================
   SECTION 5: FEEDBACK & CELEBRATIONS
   ========================================== */
function showResults() {
    // Hide play panel, show results section
    document.getElementById("quiz-play-panel").classList.add("hidden");
    
    // De-activate quiz navigation tab, activate results style
    document.querySelectorAll(".app-section").forEach(s => s.classList.remove("active"));
    document.getElementById("section-results").classList.add("active");

    const finalScoreEl = document.getElementById("final-score");
    finalScoreEl.textContent = userScore;

    const headline = document.getElementById("feedback-headline");
    const body = document.getElementById("feedback-body");

    // Evaluates Grade Bands
    if (userScore >= 12) {
        headline.textContent = "Excellent Work! 🏆";
        body.innerHTML = "Outstanding achievement! You have a strong grasp of electrical hazards, safety devices, and fuse rating calculations. Keep up the high standard!";
        triggerHighBandCelebration();
    } else if (userScore >= 7) {
        headline.textContent = "Good Effort! 👍";
        body.innerHTML = "Encouraging score! However, you should review specific areas such as <strong>live, neutral, and earth wiring functions</strong>, or spend some time practicing <strong>fuse rating selection calculations</strong> before retrying.";
    } else {
        headline.textContent = "Keep Practicing! 💪";
        body.innerHTML = "A supportive start! We highly recommend you return to the <strong>Concept Introduction</strong> and review the <strong>Flashcards</strong> revision deck to build confidence before challenging the quiz again.";
    }
}

// Particle micro-celebration for correct questions
function triggerShortCelebration() {
    const overlay = document.getElementById("celebration-overlay");
    overlay.classList.remove("hidden");
    overlay.innerHTML = "";

    const count = 30;
    for (let i = 0; i < count; i++) {
        createConfetti(overlay, false);
    }

    setTimeout(() => {
        overlay.classList.add("hidden");
        overlay.innerHTML = "";
    }, 2000);
}

// Major celebration for High Band (Score 12-15)
function triggerHighBandCelebration() {
    const overlay = document.getElementById("celebration-overlay");
    overlay.classList.remove("hidden");
    overlay.innerHTML = "";

    const count = 120;
    for (let i = 0; i < count; i++) {
        createConfetti(overlay, true);
    }

    setTimeout(() => {
        overlay.classList.add("hidden");
        overlay.innerHTML = "";
    }, 4000);
}

function createConfetti(container, isBig) {
    const el = document.createElement("div");
    el.className = "confetti-particle";

    // Randomize properties
    const colors = ["#bd00ff", "#30d158", "#00f0ff", "#ff9f0a", "#ff3b30"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const startX = Math.random() * 100; // position left %
    const scale = Math.random() * (isBig ? 1.5 : 0.8) + 0.5;
    const duration = Math.random() * (isBig ? 2.5 : 1.5) + 1.2;
    const delay = Math.random() * 0.5;

    el.style.backgroundColor = randomColor;
    el.style.left = `${startX}%`;
    el.style.transform = `scale(${scale})`;
    el.style.animationDuration = `${duration}s`;
    el.style.animationDelay = `${delay}s`;
    el.style.borderRadius = Math.random() > 0.5 ? "50%" : "0%";

    container.appendChild(el);
}
