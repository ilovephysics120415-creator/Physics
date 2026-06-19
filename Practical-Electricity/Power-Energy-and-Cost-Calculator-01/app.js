// Power, Energy & Cost Calculator - Application Logic

// Global State
let tariffRate = 0.30;
let currentFlashcardIndex = 0;
let quizQuestions = [];
let currentQuestionIndex = 0;
let quizScore = 0;
let currentQuestionData = null;
let quizCompleted = false;

// Challenge Mode State
let challengeActive = false;
let hiddenGroup1 = null; // 'voltage' | 'current' | 'power'
let hiddenGroup2 = null; // 'daily_usage' | 'days' | 'energy_kwh'
let hiddenGroup3 = null; // 'tariff' | 'cost'

let targetVoltage = 0;
let targetCurrent = 0;
let targetPower = 0;
let targetTime = 0;
let targetDays = 0;
let targetEnergyKwh = 0;
let targetTariff = 0;
let targetCost = 0;

// 12 Flashcards Data
const flashcards = [
    {
        topic: "Power Formula",
        front: "State the formula relating electrical Power, Voltage, and Current.",
        back: "P = V × I <br><br>Power (P, in Watts) is the product of Potential Difference (V, in Volts) and Current (I, in Amperes)."
    },
    {
        topic: "Energy Formula",
        front: "State the formula relating Energy transferred, Power, and Time.",
        back: "E = P × t <br><br>Energy transferred (E, in Joules) is Power (P, in Watts) multiplied by time (t, in seconds)."
    },
    {
        topic: "Energy (VIt)",
        front: "State the multi-variable formula relating Energy, Voltage, Current, and Time.",
        back: "E = V × I × t <br><br>Derived by substituting P = VI into E = Pt. Note: For E in Joules, time must be in seconds."
    },
    {
        topic: "The Kilowatt-hour",
        front: "What is a kilowatt-hour (kWh) and what does it represent?",
        back: "The kilowatt-hour is a commercial unit of energy.<br><br>It is the energy transferred by a 1 kW (1000 W) appliance operating for 1 hour (3600 s)."
    },
    {
        topic: "Joule to kWh Conversion",
        front: "State the conversion factor between 1 kWh and Joules.",
        back: "1 kWh = 3.6 × 10⁶ J (or 3,600,000 Joules).<br><br>Calculated as: 1000 W × 3600 s = 3,600,000 J."
    },
    {
        topic: "Calculating Total Hours",
        front: "How do you calculate total operating hours from usage per day and duration?",
        back: "Total Time (hours) = Hours per day × Number of days.<br><br>Example: 2 hours/day for 30 days = 60 hours."
    },
    {
        topic: "Calculating Cost",
        front: "What is the formula to calculate the cost of electricity usage?",
        back: "Cost = Energy (in kWh) × Tariff Rate (in $/kWh).<br><br>Always convert energy into kWh before applying the cost tariff rate."
    },
    {
        topic: "Kettle Benchmark",
        front: "What is the typical power rating of an electric kettle, and why?",
        back: "Typical Kettle: ~2000 W.<br><br>Requires high electrical power to rapidly transfer energy and boil water in a short time."
    },
    {
        topic: "Air Conditioner Benchmark",
        front: "What is the typical power rating of an air conditioner?",
        back: "Typical Aircon: ~1000 W to 1500 W.<br><br>Consumes substantial energy over time due to continuous operation of the cooling compressor."
    },
    {
        topic: "LED Bulb Benchmark",
        front: "What is the typical power rating of an LED bulb?",
        back: "Typical LED Bulb: ~10 W.<br><br>Highly efficient, consuming minimal power while producing standard room illumination."
    },
    {
        topic: "Power Definition",
        front: "Define electrical power in terms of energy transfer.",
        back: "Power is the rate at which electrical energy is transferred or converted into other forms of energy per unit time."
    },
    {
        topic: "Why use kWh for bills?",
        front: "Why do electricity bills use kWh instead of Joules?",
        back: "A Joule is too small. A typical household uses billions of Joules monthly. Measurement in kWh keeps numbers manageable."
    }
];

// Document Elements
document.addEventListener("DOMContentLoaded", () => {
    initNavigation();
    initInteractiveSandbox();
    initFlashcards();
    initQuiz();
});

// ==========================================================================
// 1. Navigation Routing
// ==========================================================================
function initNavigation() {
    const navButtons = document.querySelectorAll(".nav-btn");
    const sections = document.querySelectorAll(".app-section");

    navButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const sectionId = btn.getAttribute("data-section");

            // Update Nav Active State
            navButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            // Show active section
            sections.forEach(sec => {
                sec.classList.remove("active");
                if (sec.id === `sec-${sectionId}`) {
                    sec.classList.add("active");
                }
            });

            // Specific Tab Initializers
            if (sectionId === "explore") {
                // Regenerate tariff on panel load
                tariffRate = parseFloat((Math.random() * (0.35 - 0.25) + 0.25).toFixed(2));
                document.getElementById("slide-tariff").value = tariffRate;
                document.getElementById("explore-tariff-val").textContent = `$${tariffRate.toFixed(2)}`;
                updateSandboxCalculations();
            }
        });
    });

    // Score page redirect
    document.getElementById("quiz-go-intro").addEventListener("click", () => {
        document.getElementById("btn-intro").click();
    });
}

// ==========================================================================
// 2. Interactive Exploration (Sandbox)
// ==========================================================================
function initInteractiveSandbox() {
    const slideVoltage = document.getElementById("slide-voltage");
    const slideCurrent = document.getElementById("slide-current");
    const slideTime = document.getElementById("slide-time");
    const slideTariff = document.getElementById("slide-tariff");
    const slideDays = document.getElementById("slide-days");

    // Live update text bubbles
    slideVoltage.addEventListener("input", (e) => {
        document.getElementById("val-voltage").textContent = `${e.target.value} V`;
        updateSandboxCalculations();
    });

    slideCurrent.addEventListener("input", (e) => {
        document.getElementById("val-current").textContent = `${e.target.value} A`;
        updateSandboxCalculations();
    });

    slideTime.addEventListener("input", (e) => {
        document.getElementById("val-time").textContent = `${e.target.value} hr`;
        updateSandboxCalculations();
    });

    slideTariff.addEventListener("input", (e) => {
        tariffRate = parseFloat(e.target.value);
        document.getElementById("explore-tariff-val").textContent = `$${tariffRate.toFixed(2)}`;
        updateSandboxCalculations();
    });

    slideDays.addEventListener("input", (e) => {
        document.getElementById("val-days").textContent = `${e.target.value} days`;
        updateSandboxCalculations();
    });

    // Challenge buttons
    document.getElementById("btn-challenge-rand").addEventListener("click", startChallengeMode);
    document.getElementById("btn-challenge-check").addEventListener("click", checkChallengeGuesses);
    document.getElementById("btn-challenge-reveal").addEventListener("click", revealChallengeAnswers);

    // Sync power input guesses
    document.getElementById("guess-power").addEventListener("input", (e) => {
        document.getElementById("guess-power-box").value = e.target.value;
    });
    document.getElementById("guess-power-box").addEventListener("input", (e) => {
        document.getElementById("guess-power").value = e.target.value;
    });

    // Run initial calculation
    updateSandboxCalculations();
}

function startChallengeMode() {
    challengeActive = true;

    // Reset inputs & styles
    document.querySelectorAll(".guess-input").forEach(inp => {
        inp.value = "";
        inp.classList.remove("correct", "incorrect");
        inp.style.display = "none";
    });

    // Restore sliders & defaults
    resetChallengeUI();

    // Randomize initial positions
    document.getElementById("slide-voltage").value = Math.floor(Math.random() * (240 - 100) + 100);
    document.getElementById("slide-current").value = parseFloat((Math.random() * (13 - 1) + 1).toFixed(1));
    document.getElementById("slide-time").value = parseFloat((Math.random() * (24 - 1) + 1).toFixed(1));
    document.getElementById("slide-days").value = Math.floor(Math.random() * (31 - 1) + 1);
    tariffRate = parseFloat((Math.random() * (0.35 - 0.25) + 0.25).toFixed(2));
    document.getElementById("slide-tariff").value = tariffRate;

    // Update bubbles for randomized inputs
    document.getElementById("val-voltage").textContent = `${document.getElementById("slide-voltage").value} V`;
    document.getElementById("val-current").textContent = `${document.getElementById("slide-current").value} A`;
    document.getElementById("val-time").textContent = `${document.getElementById("slide-time").value} hr`;
    document.getElementById("val-days").textContent = `${document.getElementById("slide-days").value} days`;
    document.getElementById("explore-tariff-val").textContent = `$${tariffRate.toFixed(2)}`;

    // Group Choices
    const grp1 = ['voltage', 'current', 'power'];
    const grp2 = ['daily_usage', 'days', 'energy_kwh'];
    const grp3 = ['tariff', 'cost'];

    hiddenGroup1 = grp1[Math.floor(Math.random() * grp1.length)];
    hiddenGroup2 = grp2[Math.floor(Math.random() * grp2.length)];
    hiddenGroup3 = grp3[Math.floor(Math.random() * grp3.length)];

    // Calculate actual targets
    updateSandboxCalculations();

    // Apply masks
    applyChallengeUI();

    // Show action buttons
    document.getElementById("btn-challenge-check").style.display = "inline-block";
    document.getElementById("btn-challenge-reveal").style.display = "inline-block";
}

function applyChallengeUI() {
    if (hiddenGroup1 === 'voltage') {
        document.getElementById("slide-voltage").disabled = true;
        document.getElementById("val-voltage").style.display = "none";
        document.getElementById("guess-voltage").style.display = "inline-block";
    } else if (hiddenGroup1 === 'current') {
        document.getElementById("slide-current").disabled = true;
        document.getElementById("val-current").style.display = "none";
        document.getElementById("guess-current").style.display = "inline-block";
    } else if (hiddenGroup1 === 'power') {
        document.getElementById("calc-p").style.display = "none";
        document.getElementById("guess-power").style.display = "inline-block";
        document.getElementById("metric-p").style.display = "none";
        document.getElementById("guess-power-box").style.display = "inline-block";
    }

    if (hiddenGroup2 === 'daily_usage') {
        document.getElementById("slide-time").disabled = true;
        document.getElementById("val-time").style.display = "none";
        document.getElementById("guess-time").style.display = "inline-block";
    } else if (hiddenGroup2 === 'days') {
        document.getElementById("slide-days").disabled = true;
        document.getElementById("val-days").style.display = "none";
        document.getElementById("guess-days").style.display = "inline-block";
    } else if (hiddenGroup2 === 'energy_kwh') {
        document.getElementById("metric-e-kwh").style.display = "none";
        document.getElementById("guess-energy").style.display = "inline-block";
    }

    if (hiddenGroup3 === 'tariff') {
        document.getElementById("slide-tariff").disabled = true;
        document.getElementById("explore-tariff-val").style.display = "none";
        document.getElementById("guess-tariff").style.display = "inline-block";
    } else if (hiddenGroup3 === 'cost') {
        document.getElementById("metric-cost").style.display = "none";
        document.getElementById("guess-cost").style.display = "inline-block";
    }
}

function resetChallengeUI() {
    document.getElementById("slide-voltage").disabled = false;
    document.getElementById("val-voltage").style.display = "inline-block";
    document.getElementById("guess-voltage").style.display = "none";

    document.getElementById("slide-current").disabled = false;
    document.getElementById("val-current").style.display = "inline-block";
    document.getElementById("guess-current").style.display = "none";

    document.getElementById("calc-p").style.display = "inline-block";
    document.getElementById("guess-power").style.display = "none";
    document.getElementById("metric-p").style.display = "inline-block";
    document.getElementById("guess-power-box").style.display = "none";

    document.getElementById("slide-time").disabled = false;
    document.getElementById("val-time").style.display = "inline-block";
    document.getElementById("guess-time").style.display = "none";

    document.getElementById("slide-days").disabled = false;
    document.getElementById("val-days").style.display = "inline-block";
    document.getElementById("guess-days").style.display = "none";

    document.getElementById("metric-e-kwh").style.display = "inline-block";
    document.getElementById("guess-energy").style.display = "none";

    document.getElementById("slide-tariff").disabled = false;
    document.getElementById("explore-tariff-val").style.display = "inline-block";
    document.getElementById("guess-tariff").style.display = "none";

    document.getElementById("metric-cost").style.display = "inline-block";
    document.getElementById("guess-cost").style.display = "none";
}

function checkChallengeGuesses() {
    let allCorrect = true;

    function checkField(inputId, targetVal, expectedUnit) {
        const field = document.getElementById(inputId);
        if (field && field.style.display !== "none") {
            const val = field.value.trim();
            const correct = checkAnswer(val, targetVal, expectedUnit);
            field.classList.remove("correct", "incorrect");
            if (correct) {
                field.classList.add("correct");
            } else {
                field.classList.add("incorrect");
                allCorrect = false;
            }
        }
    }

    if (hiddenGroup1 === 'voltage') checkField("guess-voltage", targetVoltage, "V");
    if (hiddenGroup1 === 'current') checkField("guess-current", targetCurrent, "A");
    if (hiddenGroup1 === 'power') {
        checkField("guess-power", targetPower, "W");
        checkField("guess-power-box", targetPower, "W");
    }

    if (hiddenGroup2 === 'daily_usage') checkField("guess-time", targetTime, "hr");
    if (hiddenGroup2 === 'days') checkField("guess-days", targetDays, "days");
    if (hiddenGroup2 === 'energy_kwh') checkField("guess-energy", targetEnergyKwh, "kWh");

    if (hiddenGroup3 === 'tariff') checkField("guess-tariff", targetTariff, "$");
    if (hiddenGroup3 === 'cost') checkField("guess-cost", targetCost, "$");

    if (allCorrect) {
        showCorrectAnimation();
    }
}

function revealChallengeAnswers() {
    challengeActive = false;
    resetChallengeUI();
    updateSandboxCalculations();

    document.getElementById("btn-challenge-check").style.display = "none";
    document.getElementById("btn-challenge-reveal").style.display = "none";
}

function updateSandboxCalculations() {
    const v = parseFloat(document.getElementById("slide-voltage").value);
    const i = parseFloat(document.getElementById("slide-current").value);
    const t = parseFloat(document.getElementById("slide-time").value);
    const days = parseInt(document.getElementById("slide-days").value);

    // Formulas
    // P = V * I
    const pWatts = v * i;
    // Total Hours
    const totalHours = t * days;
    // Total Seconds
    const totalSeconds = totalHours * 3600;
    // E (Joules) = P * t(seconds)
    const eJoules = pWatts * totalSeconds;
    // E (kWh) = P * t(hours) / 1000
    const eKwh = (pWatts * totalHours) / 1000;
    // Cost = E (kWh) * Tariff
    const cost = eKwh * tariffRate;

    // Cache target values for verification
    targetVoltage = v;
    targetCurrent = i;
    targetPower = pWatts;
    targetTime = t;
    targetDays = days;
    targetEnergyKwh = eKwh;
    targetTariff = tariffRate;
    targetCost = cost;

    // UI Updates
    document.getElementById("calc-p").textContent = `${pWatts.toLocaleString(undefined, {maximumFractionDigits: 1})} W`;
    document.getElementById("metric-p").textContent = `${pWatts.toLocaleString(undefined, {maximumFractionDigits: 1})} W`;

    // format Joules nicely (J, kJ, MJ)
    let joulesStr = "";
    if (eJoules >= 1000000) {
        joulesStr = `${(eJoules / 1000000).toFixed(2)} MJ`;
    } else if (eJoules >= 1000) {
        joulesStr = `${(eJoules / 1000).toFixed(1)} kJ`;
    } else {
        joulesStr = `${eJoules.toFixed(0)} J`;
    }
    document.getElementById("metric-e-j").textContent = joulesStr;
    document.getElementById("metric-e-kwh").textContent = `${eKwh.toFixed(2)} kWh`;
    document.getElementById("metric-cost").textContent = `$${cost.toFixed(2)}`;

    // Mask value tags in challenge mode to stay hidden
    if (challengeActive) {
        document.getElementById("metric-e-j").textContent = "? J";
        if (hiddenGroup1 === 'voltage') document.getElementById("val-voltage").textContent = "? V";
        if (hiddenGroup1 === 'current') document.getElementById("val-current").textContent = "? A";
        if (hiddenGroup1 === 'power') {
            document.getElementById("calc-p").textContent = "? W";
            document.getElementById("metric-p").textContent = "? W";
        }
        if (hiddenGroup2 === 'daily_usage') document.getElementById("val-time").textContent = "? hr";
        if (hiddenGroup2 === 'days') document.getElementById("val-days").textContent = "? days";
        if (hiddenGroup2 === 'energy_kwh') document.getElementById("metric-e-kwh").textContent = "? kWh";
        if (hiddenGroup3 === 'tariff') document.getElementById("explore-tariff-val").textContent = "? $/kWh";
        if (hiddenGroup3 === 'cost') document.getElementById("metric-cost").textContent = "? $";
    }

    // High Power animation trigger
    const glow = document.getElementById("power-glow");
    const circle = document.querySelector(".power-meter-circle");
    const warn = document.getElementById("meter-warn");

    if (pWatts > 1000) {
        circle.classList.add("high-load");
        warn.classList.add("show");
        glow.style.transform = `scale(${1 + (pWatts - 1000) / 2000})`;
        glow.style.background = `radial-gradient(circle, rgba(0, 243, 255, 0.4) 0%, transparent 70%)`;
    } else {
        circle.classList.remove("high-load");
        warn.classList.remove("show");
        glow.style.transform = "scale(1)";
        glow.style.background = `radial-gradient(circle, rgba(0, 243, 255, 0.15) 0%, transparent 70%)`;
    }
}

// ==========================================================================
// 3. Flashcards Revision
// ==========================================================================
function initFlashcards() {
    const deck = document.getElementById("flashcards-deck");
    const prevBtn = document.getElementById("fc-prev");
    const shuffleBtn = document.getElementById("fc-shuffle");
    const nextBtn = document.getElementById("fc-next");
    const progressText = document.getElementById("fc-progress");

    // Render all flashcards, hide all except the first one
    deck.innerHTML = "";
    flashcards.forEach((card, idx) => {
        const cardEl = document.createElement("div");
        cardEl.className = `flashcard ${idx === 0 ? "active" : ""}`;
        cardEl.style.display = idx === 0 ? "block" : "none";
        
        cardEl.innerHTML = `
            <div class="flashcard-front">
                <span class="fc-topic">${card.topic}</span>
                <div class="fc-front-title">${card.front}</div>
            </div>
            <div class="flashcard-back">
                <span class="fc-topic">${card.topic} - Explanation</span>
                <div class="fc-back-desc">${card.back}</div>
            </div>
        `;

        // Flip listener
        cardEl.addEventListener("click", () => {
            cardEl.classList.toggle("flipped");
        });

        deck.appendChild(cardEl);
    });

    function showCard(index) {
        const cardsList = document.querySelectorAll(".flashcard");
        cardsList.forEach((c, idx) => {
            c.classList.remove("flipped");
            if (idx === index) {
                c.style.display = "block";
                setTimeout(() => c.classList.add("active"), 10);
            } else {
                c.style.display = "none";
                c.classList.remove("active");
            }
        });
        progressText.textContent = `${index + 1} / ${flashcards.length}`;
        currentFlashcardIndex = index;
    }

    function changeCard(targetIndex) {
        const activeCard = document.querySelector(".flashcard.active");
        if (activeCard && activeCard.classList.contains("flipped")) {
            // Flip back first
            activeCard.classList.remove("flipped");
            // Wait for flip transition (approx 300ms) before swapping card
            setTimeout(() => {
                showCard(targetIndex);
            }, 300);
        } else {
            showCard(targetIndex);
        }
    }

    prevBtn.addEventListener("click", () => {
        const prevIdx = (currentFlashcardIndex - 1 + flashcards.length) % flashcards.length;
        changeCard(prevIdx);
    });

    nextBtn.addEventListener("click", () => {
        const nextIdx = (currentFlashcardIndex + 1) % flashcards.length;
        changeCard(nextIdx);
    });

    shuffleBtn.addEventListener("click", () => {
        let newIdx = currentFlashcardIndex;
        if (flashcards.length > 1) {
            while (newIdx === currentFlashcardIndex) {
                newIdx = Math.floor(Math.random() * flashcards.length);
            }
        }
        changeCard(newIdx);
    });
}

// ==========================================================================
// 4. Quiz Engine
// ==========================================================================

// Setup 15 Conceptual MCQ Questions Definitions
const conceptualPool = [
    {
        type: "mcq",
        text: "What does the equation P = VI represent?",
        options: [
            "The rate of electrical energy transfer in a circuit",
            "The total electrical energy transferred over a duration",
            "The cost of operating a electrical device",
            "The resistance of a conductor"
        ],
        correctIndex: 0,
        working: "P represents Power, which is defined as the rate of transfer of electrical energy. The formula is Power = Voltage (V) &times; Current (I).",
        solution: "P = V &times; I. Power is measured in Watts (W) and represents energy transfer rate in Joules per second."
    },
    {
        type: "mcq",
        text: "What does the equation E = VIt represent?",
        options: [
            "The rate of energy transfer",
            "The total electrical energy transferred",
            "The total cost of electricity",
            "The amount of electric current flowing"
        ],
        correctIndex: 1,
        working: "E represents Energy transferred. Since Power P = VI and Energy E = P &times; t, substituting VI gives E = V &times; I &times; t.",
        solution: "E = V &times; I &times; t. This calculates total energy transferred (in Joules or kWh depending on units used for variables)."
    },
    {
        type: "mcq",
        text: "What physical quantity does the kilowatt-hour (kWh) measure?",
        options: [
            "Electrical power",
            "Potential difference",
            "Electrical energy",
            "Current"
        ],
        correctIndex: 2,
        working: "kWh is the unit of energy used by utility companies. Power (kW) multiplied by Time (hours) equals Energy (kWh).",
        solution: "Kilowatt-hour (kWh) is a unit of Energy. E = Power (kW) &times; Time (h)."
    },
    {
        type: "mcq",
        text: "Why do electricity supply companies charge customers per kWh rather than per Joule?",
        options: [
            "The Joule is too small, which would lead to extremely large numbers on bills",
            "Joules only measure rate of energy transfer, not total energy",
            "A Joule is not an official scientific SI unit of energy",
            "Voltage cannot be measured using Joules"
        ],
        correctIndex: 0,
        working: "A single Joule is very small (1 W for 1 second). A household using 500 kWh of energy would have a bill displaying 1.8 billion Joules, which is impractical.",
        solution: "1 kWh = 3,600,000 Joules. Billing in kWh avoids unwieldy numbers on utility bills."
    },
    {
        type: "mcq",
        text: "Which of the following domestic appliances typically has the highest power rating?",
        options: [
            "Air Conditioner (~1200 W)",
            "LED Television (~100 W)",
            "Table Fan (~50 W)",
            "Electric Kettle (~2200 W)"
        ],
        correctIndex: 3,
        working: "Heating appliances require substantial electrical energy transfer in a short period. Kettles typically draw ~2000 W to 2400 W.",
        solution: "Electric kettle (~2200 W) draws the highest power among these choices to boil water rapidly."
    },
    {
        type: "mcq",
        text: "Which of the following domestic appliances typically has the lowest power rating?",
        options: [
            "Refrigerator (~150 W)",
            "LED Desk Lamp (~10 W)",
            "Microwave Oven (~1000 W)",
            "Vacuum Cleaner (~800 W)"
        ],
        correctIndex: 1,
        working: "Modern LED bulbs are designed to be highly energy-efficient and draw minimal electrical power (typically 8 W - 15 W).",
        solution: "LED Desk Lamp (~10 W) has a low electrical power draw, making it highly efficient."
    },
    {
        type: "mcq",
        text: "How is 1 kilowatt-hour (kWh) expressed in Joules?",
        options: [
            "3.6 &times; 10⁶ J",
            "1.8 &times; 10⁶ J",
            "3.6 &times; 10⁵ J",
            "1.0 &times; 10³ J"
        ],
        correctIndex: 0,
        working: "1 kWh = 1 kW &times; 1 hour = 1000 W &times; 3600 seconds = 3,600,000 J = 3.6 &times; 10⁶ J.",
        solution: "1 kWh = 1,000 W &times; 3,600 s = 3,600,000 J = 3.6 &times; 10⁶ J."
    },
    {
        type: "mcq",
        text: "If an appliance is operated for t hours per day for d days, how is the total operating time calculated?",
        options: [
            "Total operating hours = t &times; d",
            "Total operating hours = t + d",
            "Total operating hours = (t &times; 3600) / d",
            "Total operating hours = t / d"
        ],
        correctIndex: 0,
        working: "To find the cumulative usage, multiply the daily hours (t) by the number of days (d).",
        solution: "Total hours = Hours per day &times; Number of days."
    },
    {
        type: "mcq",
        text: "An appliance power label states '240 V, 5 A'. What does this indicate?",
        options: [
            "It consumes 1200 J of electrical energy per second",
            "It has a resistance of 1200 Ohms",
            "It requires 5 V to operate safely",
            "It transfers 48 J of electrical energy per second"
        ],
        correctIndex: 0,
        working: "Calculate power: P = V &times; I = 240 &times; 5 = 1200 W. Power is the rate of energy transfer in Joules per second.",
        solution: "P = VI = 240 V &times; 5 A = 1200 W (1200 J/s). The appliance consumes 1200 Joules of electrical energy per second."
    },
    {
        type: "mcq",
        text: "When two appliances are connected to the same voltage supply, the appliance with the higher power rating will:",
        options: [
            "Draw a larger current",
            "Draw a smaller current",
            "Have a higher electrical resistance",
            "Use less energy in the same time"
        ],
        correctIndex: 0,
        working: "From P = VI, if V is constant, P is directly proportional to I. Therefore, higher power implies larger current drawn.",
        solution: "P = VI. Since voltage V is constant, current I increases when power P is higher."
    },
    {
        type: "mcq",
        text: "Which of the following is equivalent to a power of 1 Watt (W)?",
        options: [
            "1 Joule per second (J/s)",
            "1 Joule-second (J&middot;s)",
            "1 Volt per Ampere (V/A)",
            "1 Kilowatt-hour (kWh)"
        ],
        correctIndex: 0,
        working: "Power = Energy / Time. Unit: Watt = Joule / second.",
        solution: "1 W = 1 J/s. Power is the rate of energy transfer."
    },
    {
        type: "mcq",
        text: "Electrical energy supplied to a kettle is not fully converted to warming the water. What happens to the remaining energy?",
        options: [
            "It is dissipated to the surrounding environment",
            "It is completely destroyed",
            "It accumulates as static electric charges inside the kettle",
            "It flows back into the electrical supply"
        ],
        correctIndex: 0,
        working: "According to the principle of conservation of energy, energy cannot be destroyed, only converted or dissipated to surroundings.",
        solution: "The remaining energy is dissipated to the surroundings."
    },
    {
        type: "mcq",
        text: "What is the correct mathematical relationship to find the financial cost of electricity usage?",
        options: [
            "Cost = Energy (kWh) &times; Tariff Rate ($/kWh)",
            "Cost = Power (W) &times; Tariff Rate ($/kWh)",
            "Cost = Energy (Joules) &times; Tariff Rate ($/kWh)",
            "Cost = Current (A) &times; Tariff Rate ($/kWh)"
        ],
        correctIndex: 0,
        working: "Cost is calculated using commercial units of energy (kWh) and multiplying by the tariff rate in dollars per kWh.",
        solution: "Cost = Energy (in kWh) &times; Tariff ($/kWh)."
    },
    {
        type: "mcq",
        text: "An LED light bulb is rated at 8 W while an old filament bulb is rated at 60 W. What is the practical advantage of the LED bulb?",
        options: [
            "It transfers less electrical energy per second to provide a similar operation",
            "It draws a larger current from the mains supply",
            "It requires a higher operating voltage",
            "It has a lower electrical resistance"
        ],
        correctIndex: 0,
        working: "Lower power rating means it consumes less electrical energy per second, reducing electricity bills.",
        solution: "An 8 W LED transfers less electrical energy per second than a 60 W filament bulb."
    },
    {
        type: "mcq",
        text: "A household heater has a power rating of 2.5 kW. How is this power expressed in Watts?",
        options: [
            "2500 W",
            "250 W",
            "25000 W",
            "0.0025 W"
        ],
        correctIndex: 0,
        working: "1 kW = 1000 W. Therefore, 2.5 kW = 2.5 &times; 1000 W = 2500 W.",
        solution: "2.5 kW = 2.5 &times; 1000 W = 2500 W."
    }
];

// Calculation Templates (15 items)
const calculationPool = [
    {
        id: "calc_1",
        generate: () => {
            const v = Math.floor(Math.random() * (240 - 100) + 100); // 100V - 240V
            const i = parseFloat((Math.random() * (10 - 1) + 1).toFixed(1)); // 1.0A - 10.0A
            const p = v * i;
            return {
                text: `An electrical appliance operates on a ${v} V mains supply while drawing a current of ${i} A. Calculate its power rating.`,
                correctAnswer: p,
                unit: "W",
                working: `Formula: P = V &times; I<br>Substitute: V = ${v} V, I = ${i} A.`,
                solution: `P = V &times; I<br>P = ${v} &times; ${i} = ${p.toFixed(1)} W`
            };
        }
    },
    {
        id: "calc_2",
        generate: () => {
            const p = Math.floor(Math.random() * (2400 - 500) + 500); // 500W - 2400W
            const v = 240; // Standard voltage
            const i = parseFloat((p / v).toFixed(2));
            return {
                text: `An electric oven rated at ${p} W is connected to a standard ${v} V supply. Calculate the current drawn by the oven.`,
                correctAnswer: i,
                unit: "A",
                working: `Formula: P = V &times; I &rArr; I = P / V<br>Substitute: P = ${p} W, V = ${v} V.`,
                solution: `I = P / V<br>I = ${p} / ${v} = ${i.toFixed(2)} A`
            };
        }
    },
    {
        id: "calc_3",
        generate: () => {
            const p = Math.floor(Math.random() * (1500 - 100) + 100); // 100W - 1500W
            const i = parseFloat((Math.random() * (6 - 0.5) + 0.5).toFixed(1));
            const v = parseFloat((p / i).toFixed(1));
            return {
                text: `A device consumes ${p} W of power and draws a current of ${i} A when active. Calculate the supply voltage it is operating on.`,
                correctAnswer: v,
                unit: "V",
                working: `Formula: P = V &times; I &rArr; V = P / I<br>Substitute: P = ${p} W, I = ${i} A.`,
                solution: `V = P / I<br>V = ${p} / ${i} = ${v.toFixed(1)} V`
            };
        }
    },
    {
        id: "calc_4",
        generate: () => {
            const p = Math.floor(Math.random() * (2000 - 800) + 800); // 800W - 2000W
            const hours = parseFloat((Math.random() * (5 - 1) + 1).toFixed(1)); // 1h - 5h
            const tSeconds = hours * 3600;
            const eJoules = p * tSeconds;
            return {
                text: `A hairdryer has a power rating of ${p} W. Calculate the electrical energy in Joules transferred when it is used for ${hours} hours.`,
                correctAnswer: eJoules,
                unit: "J",
                working: `Formula: E = P &times; t<br>Convert time to seconds: t = ${hours} hours &times; 3600 s/hr = ${tSeconds} s.<br>Substitute: P = ${p} W.`,
                solution: `E = P &times; t<br>E = ${p} W &times; (${hours} &times; 3600 s) = ${eJoules.toLocaleString()} J`
            };
        }
    },
    {
        id: "calc_5",
        generate: () => {
            const p = Math.floor(Math.random() * (3000 - 1000) + 1000); // 1000W - 3000W
            const hours = parseFloat((Math.random() * (8 - 2) + 2).toFixed(1)); // 2h - 8h
            const eKwh = (p * hours) / 1000;
            return {
                text: `An air conditioning system has a power rating of ${p} W. Calculate the energy consumed in kilowatt-hours (kWh) when it runs continuously for ${hours} hours.`,
                correctAnswer: eKwh,
                unit: "kWh",
                working: `Formula: E(kWh) = Power(kW) &times; Time(hours)<br>Convert power to kW: Power = ${p} W / 1000 = ${(p/1000).toFixed(2)} kW.<br>Substitute: Time = ${hours} hours.`,
                solution: `E = (Power in kW) &times; (Time in hr)<br>E = (${p} / 1000) &times; ${hours} = ${eKwh.toFixed(3)} kWh`
            };
        }
    },
    {
        id: "calc_6",
        generate: () => {
            const eKwh = parseFloat((Math.random() * (120 - 20) + 20).toFixed(1)); // 20 - 120 kWh
            const tariff = parseFloat((Math.random() * (0.35 - 0.25) + 0.25).toFixed(3)); // $0.25 - $0.35
            const cost = eKwh * tariff;
            return {
                text: `An apartment unit consumes ${eKwh} kWh of electricity during a billing period. If the tariff rate is $${tariff.toFixed(3)} per kWh, calculate the cost of usage.`,
                correctAnswer: cost,
                unit: "$",
                working: `Formula: Cost = Energy (kWh) &times; Tariff Rate ($/kWh)<br>Substitute: Energy = ${eKwh} kWh, Tariff = $${tariff.toFixed(3)}.`,
                solution: `Cost = ${eKwh} &times; ${tariff.toFixed(3)} = $${cost.toFixed(2)}`
            };
        }
    },
    {
        id: "calc_7",
        generate: () => {
            const v = 240;
            const i = parseFloat((Math.random() * (10 - 2) + 2).toFixed(1)); // 2A - 10A
            const hours = parseFloat((Math.random() * (6 - 1) + 1).toFixed(1)); // 1h - 6h
            const days = Math.floor(Math.random() * (30 - 7) + 7); // 7 - 30 days
            const tariff = parseFloat((Math.random() * (0.35 - 0.25) + 0.25).toFixed(3));
            
            const pWatts = v * i;
            const totalHours = hours * days;
            const eKwh = (pWatts * totalHours) / 1000;
            const cost = eKwh * tariff;

            return {
                text: `A household appliance is connected to a ${v} V supply and draws a current of ${i} A. It is used for ${hours} hours per day for ${days} days. Calculate the total cost of electricity at a tariff of $${tariff.toFixed(3)} per kWh.`,
                correctAnswer: cost,
                unit: "$",
                working: `Multi-step Process:<br>1. Calculate Power: P = V &times; I<br>2. Calculate Total Time in hours: hours/day &times; days<br>3. Calculate Energy in kWh: (P &times; time) / 1000<br>4. Calculate Cost: Energy (kWh) &times; Tariff`,
                solution: `P = VI = ${v} &times; ${i} = ${pWatts} W = ${(pWatts/1000).toFixed(2)} kW<br>Total Hours = ${hours} &times; ${days} = ${totalHours} hours<br>E = ${(pWatts/1000).toFixed(2)} &times; ${totalHours} = ${eKwh.toFixed(2)} kWh<br>Cost = ${eKwh.toFixed(2)} &times; $${tariff.toFixed(3)} = $${cost.toFixed(2)}`
            };
        }
    },
    {
        id: "calc_8",
        generate: () => {
            const pKw = parseFloat((Math.random() * (3.0 - 0.5) + 0.5).toFixed(1)); // 0.5 - 3.0 kW
            const hours = parseFloat((Math.random() * (12 - 2) + 2).toFixed(1)); // 2h - 12h
            const days = Math.floor(Math.random() * (31 - 5) + 5);
            const tSeconds = hours * days * 3600;
            const pWatts = pKw * 1000;
            const eJoules = pWatts * tSeconds;

            return {
                text: `A water heater with a power of ${pKw} kW is used for ${hours} hours per day for ${days} days. Calculate the electrical energy transferred in Joules.`,
                correctAnswer: eJoules,
                unit: "J",
                working: `Formula: E = P &times; t<br>Convert Power to Watts: P = ${pKw} kW &times; 1000 = ${pWatts} W.<br>Convert total time to seconds: t = ${hours} hr &times; ${days} days &times; 3600 s/hr.`,
                solution: `P = ${pKw} &times; 1000 = ${pWatts} W<br>t = ${hours} &times; ${days} &times; 3600 = ${tSeconds} s<br>E = ${pWatts} &times; ${tSeconds} = ${eJoules.toLocaleString()} J`
            };
        }
    },
    {
        id: "calc_9",
        generate: () => {
            const pKw = parseFloat((Math.random() * (2.2 - 0.8) + 0.8).toFixed(1)); // 0.8 - 2.2 kW
            const hours = parseFloat((Math.random() * (4 - 0.5) + 0.5).toFixed(1)); // 0.5h - 4h
            const days = Math.floor(Math.random() * (30 - 5) + 5);
            const eKwh = pKw * hours * days;

            return {
                text: `A electric stove rated at ${pKw} kW is operated for ${hours} hours per day over a period of ${days} days. Calculate the electrical energy consumed in kWh.`,
                correctAnswer: eKwh,
                unit: "kWh",
                working: `Formula: E(kWh) = Power(kW) &times; Time(hours)<br>Calculate Total Time in hours: ${hours} &times; ${days} days.<br>Multiply by Power.`,
                solution: `Total Hours = ${hours} &times; ${days} = ${hours*days} hr<br>E = ${pKw} kW &times; ${hours*days} hr = ${eKwh.toFixed(2)} kWh`
            };
        }
    },
    {
        id: "calc_10",
        generate: () => {
            const p = Math.floor(Math.random() * (150 - 40) + 40); // 40W - 150W TV
            const hours = parseFloat((Math.random() * (12 - 3) + 3).toFixed(1)); // 3h - 12h
            const tariff = parseFloat((Math.random() * (0.35 - 0.25) + 0.25).toFixed(3));
            const eKwh = (p * hours) / 1000;
            const cost = eKwh * tariff;

            return {
                text: `A television has a power rating of ${p} W. If it is switched on for ${hours} hours in a day, and the tariff is $${tariff.toFixed(3)} per kWh, calculate the cost of usage.`,
                correctAnswer: cost,
                unit: "$",
                working: `Formula: E(kWh) = (Power in Watts / 1000) &times; Time (hours)<br>Cost = E(kWh) &times; Tariff Rate`,
                solution: `E = (${p} / 1000) kW &times; ${hours} hr = ${eKwh.toFixed(4)} kWh<br>Cost = ${eKwh.toFixed(4)} &times; $${tariff.toFixed(3)} = $${cost.toFixed(2)}`
            };
        }
    },
    {
        id: "calc_11",
        generate: () => {
            const eKwh = parseFloat((Math.random() * (15 - 2) + 2).toFixed(1)); // 2 - 15 kWh
            const hours = parseFloat((Math.random() * (10 - 2) + 2).toFixed(1)); // 2h - 10h
            const pKw = parseFloat((eKwh / hours).toFixed(2));

            return {
                text: `An industrial motor consumes ${eKwh} kWh of electrical energy during a test duration of ${hours} hours. Calculate its average power rating in kW.`,
                correctAnswer: pKw,
                unit: "kW",
                working: `Formula: E = P &times; t &rArr; Power (kW) = Energy (kWh) / Time (hours)<br>Substitute: E = ${eKwh} kWh, t = ${hours} hours.`,
                solution: `Power = Energy / Time<br>Power = ${eKwh} / ${hours} = ${pKw.toFixed(2)} kW`
            };
        }
    },
    {
        id: "calc_12",
        generate: () => {
            const v = 240;
            const hours = parseFloat((Math.random() * (10 - 3) + 3).toFixed(1)); // 3h - 10h
            const i = parseFloat((Math.random() * (8 - 1) + 1).toFixed(1)); // 1A - 8A
            const pWatts = v * i;
            const eKwh = parseFloat(((pWatts * hours) / 1000).toFixed(3));

            return {
                text: `A heating device operating on a ${v} V supply consumes ${eKwh} kWh of electrical energy when used for ${hours} hours. Calculate the current running through it.`,
                correctAnswer: i,
                unit: "A",
                working: `Steps:<br>1. Power = Energy(kWh) &times; 1000 / Time(hours)<br>2. Current = Power / Voltage`,
                solution: `Power = (${eKwh} kWh / ${hours} hr) &times; 1000 = ${pWatts.toFixed(0)} W<br>Current = Power / Voltage = ${pWatts.toFixed(0)} / ${v} = ${i.toFixed(1)} A`
            };
        }
    },
    {
        id: "calc_13",
        generate: () => {
            const i = parseFloat((Math.random() * (12 - 2) + 2).toFixed(1)); // 2A - 12A
            const hours = parseFloat((Math.random() * (6 - 2) + 2).toFixed(1)); // 2h - 6h
            const v = 230; // standard voltage
            const eKwh = parseFloat(((v * i * hours) / 1000).toFixed(3));

            return {
                text: `A device drawing a current of ${i} A consumes ${eKwh} kWh of energy over a continuous run of ${hours} hours. Calculate the voltage supply of the circuit.`,
                correctAnswer: v,
                unit: "V",
                working: `Steps:<br>1. Power = (Energy in kWh &times; 1000) / time in hours<br>2. Voltage = Power / Current`,
                solution: `Power = (${eKwh} &times; 1000) / ${hours} = ${(eKwh*1000/hours).toFixed(1)} W<br>Voltage = Power / Current = ${(eKwh*1000/hours).toFixed(1)} / ${i} = ${v} V`
            };
        }
    },
    {
        id: "calc_14",
        generate: () => {
            const p = Math.floor(Math.random() * (1500 - 500) + 500); // 500W - 1500W
            const eKwh = parseFloat((Math.random() * (10 - 2) + 2).toFixed(1));
            const hours = parseFloat((eKwh / (p / 1000)).toFixed(1));

            return {
                text: `How many hours must a ${p} W computer terminal operate to consume exactly ${eKwh} kWh of electrical energy?`,
                correctAnswer: hours,
                unit: "hr",
                working: `Formula: Time (hours) = Energy (kWh) / Power (kW)<br>Convert Power to kW: ${p} W = ${(p/1000).toFixed(2)} kW.<br>Substitute: Energy = ${eKwh} kWh.`,
                solution: `Power = ${p} / 1000 = ${(p/1000).toFixed(2)} kW<br>Time = Energy / Power = ${eKwh} / ${(p/1000).toFixed(2)} = ${hours.toFixed(1)} hours`
            };
        }
    },
    {
        id: "calc_15",
        generate: () => {
            const p = Math.floor(Math.random() * (1200 - 300) + 300); // 300W - 1200W
            const hours = parseFloat((Math.random() * (8 - 2) + 2).toFixed(1)); // 2h - 8h
            const tariff = parseFloat((Math.random() * (0.35 - 0.25) + 0.25).toFixed(3));
            const days = Math.floor(Math.random() * (30 - 5) + 5); // 5 - 30 days
            
            const eKwh = (p * hours * days) / 1000;
            const cost = parseFloat((eKwh * tariff).toFixed(2));

            return {
                text: `An appliance of ${p} W is operated for ${hours} hours per day. If the tariff is $${tariff.toFixed(3)} per kWh, and the total bill for this appliance over a set period is $${cost.toFixed(2)}, calculate the number of days of operation.`,
                correctAnswer: days,
                unit: "days",
                working: `Steps:<br>1. Calculate Energy used: Cost / Tariff<br>2. Calculate energy used per day: Power (kW) &times; Daily Hours<br>3. Total Days = Total Energy / Energy per day`,
                solution: `Total Energy = $${cost.toFixed(2)} / $${tariff.toFixed(3)} = ${(cost/tariff).toFixed(3)} kWh<br>Energy per day = (${p} / 1000) &times; ${hours} = ${(p*hours/1000).toFixed(3)} kWh/day<br>Days = ${(cost/tariff).toFixed(3)} / ${(p*hours/1000).toFixed(3)} = ${days} days`
            };
        }
    }
];

// ==========================================================================
// Quiz Controller Methods
// ==========================================================================
function initQuiz() {
    const startBtn = document.getElementById("quiz-start-btn");
    const retryBtn = document.getElementById("quiz-retry-btn");
    const submitBtn = document.getElementById("quiz-submit-btn");
    const nextBtn = document.getElementById("quiz-next-btn");
    const revealBtn = document.getElementById("quiz-reveal-btn");

    startBtn.addEventListener("click", startQuiz);
    retryBtn.addEventListener("click", startQuiz);
    submitBtn.addEventListener("click", submitAnswer);
    nextBtn.addEventListener("click", loadNextQuestion);

    // Reveal working drawer toggle
    revealBtn.addEventListener("click", () => {
        const panel = document.getElementById("quiz-working-panel");
        panel.classList.toggle("show");
    });
}

function startQuiz() {
    quizScore = 0;
    currentQuestionIndex = 0;
    quizCompleted = false;

    // Generate random 15 questions mix
    // 7 conceptual from pool of 15, and 8 calculation from pool of 15
    const shuffledConceptual = [...conceptualPool].sort(() => 0.5 - Math.random());
    const shuffledCalculation = [...calculationPool].sort(() => 0.5 - Math.random());

    quizQuestions = [];
    
    // Pick 7 MCQs
    for (let i = 0; i < 7; i++) {
        quizQuestions.push(shuffledConceptual[i]);
    }
    // Pick 8 calculations
    for (let i = 0; i < 8; i++) {
        // Instantiate the calculation question
        const generated = shuffledCalculation[i].generate();
        quizQuestions.push({
            type: "calc",
            text: generated.text,
            correctAnswer: generated.correctAnswer,
            unit: generated.unit,
            working: generated.working,
            solution: generated.solution
        });
    }

    // Shuffle final list of 15
    quizQuestions.sort(() => 0.5 - Math.random());

    // UI Updates
    document.getElementById("quiz-hud").style.display = "flex";
    document.getElementById("quiz-start-screen").classList.remove("active");
    document.getElementById("quiz-result-screen").classList.remove("active");
    document.getElementById("quiz-active-screen").classList.add("active");

    loadQuestion(0);
}

function loadQuestion(index) {
    currentQuestionIndex = index;
    currentQuestionData = quizQuestions[index];

    // Reset working panel
    const workingPanel = document.getElementById("quiz-working-panel");
    workingPanel.classList.remove("show");
    document.getElementById("quiz-working-content").innerHTML = currentQuestionData.working;

    // Reset feedback panel
    document.getElementById("quiz-feedback-box").classList.remove("show");
    document.getElementById("quiz-submit-btn").style.display = "block";
    document.getElementById("quiz-submit-btn").disabled = false;

    // Set progress bar
    document.getElementById("quiz-progress-text").textContent = `${index + 1} / 15`;
    document.getElementById("quiz-score-text").textContent = quizScore.toString();
    document.getElementById("quiz-progress-fill").style.width = `${((index) / 15) * 100}%`;

    // Display Text
    document.getElementById("quiz-q-text").innerHTML = currentQuestionData.text;

    const inputFormat = document.getElementById("quiz-input-format");
    const mcqFormat = document.getElementById("quiz-mcq-format");

    if (currentQuestionData.type === "mcq") {
        document.getElementById("quiz-q-type").textContent = "CONCEPTUAL MCQ";
        inputFormat.classList.remove("show");
        mcqFormat.classList.add("show");

        // Render MCQ buttons
        const mcqGrid = document.getElementById("quiz-mcq-options");
        mcqGrid.innerHTML = "";
        currentQuestionData.options.forEach((opt, idx) => {
            const btn = document.createElement("button");
            btn.className = "mcq-option";
            btn.innerHTML = opt;
            btn.addEventListener("click", () => {
                document.querySelectorAll(".mcq-option").forEach(b => b.classList.remove("selected"));
                btn.classList.add("selected");
            });
            mcqGrid.appendChild(btn);
        });
    } else {
        document.getElementById("quiz-q-type").textContent = "CALCULATION TASK";
        mcqFormat.classList.remove("show");
        inputFormat.classList.add("show");

        // Clear input box
        const inputField = document.getElementById("quiz-user-input");
        inputField.value = "";
        inputField.disabled = false;
        inputField.focus();
    }
}

function submitAnswer() {
    let isCorrect = false;
    let userAnsText = "";

    if (currentQuestionData.type === "mcq") {
        const selected = document.querySelector(".mcq-option.selected");
        if (!selected) {
            alert("Please select an option first!");
            return;
        }
        const options = Array.from(document.querySelectorAll(".mcq-option"));
        const userIdx = options.indexOf(selected);
        isCorrect = (userIdx === currentQuestionData.correctIndex);
        userAnsText = selected.textContent;

        // Visual highlights
        options.forEach((optBtn, idx) => {
            optBtn.disabled = true;
            if (idx === currentQuestionData.correctIndex) {
                optBtn.style.borderColor = "var(--success-color)";
                optBtn.style.background = "rgba(16, 185, 129, 0.15)";
            } else if (idx === userIdx && !isCorrect) {
                optBtn.style.borderColor = "var(--danger-color)";
                optBtn.style.background = "rgba(239, 68, 68, 0.15)";
            }
        });
    } else {
        const inputField = document.getElementById("quiz-user-input");
        userAnsText = inputField.value.trim();
        if (!userAnsText) {
            alert("Please type an answer!");
            return;
        }

        isCorrect = checkAnswer(userAnsText, currentQuestionData.correctAnswer, currentQuestionData.unit);
        inputField.disabled = true;
    }

    // Update score
    if (isCorrect) {
        quizScore++;
        document.getElementById("quiz-score-text").textContent = quizScore.toString();
        showCorrectAnimation();
    }

    // Display Feedback Box
    const feedbackBox = document.getElementById("quiz-feedback-box");
    const indicator = document.getElementById("quiz-feedback-indicator");
    const solution = document.getElementById("quiz-worked-solution");

    indicator.className = `feedback-indicator ${isCorrect ? "correct" : "incorrect"}`;
    indicator.innerHTML = isCorrect ? 
        `<i class="fa-solid fa-circle-check"></i> <span>Correct! Nice job.</span>` : 
        `<i class="fa-solid fa-circle-xmark"></i> <span>Incorrect. Check the solution below.</span>`;

    // Solution steps
    solution.querySelector(".solution-text").innerHTML = currentQuestionData.solution;
    
    // Hide submit btn, show feedback
    document.getElementById("quiz-submit-btn").style.display = "none";
    feedbackBox.classList.add("show");
}

function loadNextQuestion() {
    if (currentQuestionIndex + 1 < 15) {
        loadQuestion(currentQuestionIndex + 1);
    } else {
        showQuizResults();
    }
}

// ==========================================================================
// Answer Checker with Tolerance & Unit Parsing
// ==========================================================================
function checkAnswer(userInput, correctAnswer, expectedUnit, tolerance = 0.02) {
    let cleanInput = userInput.trim();
    let userNum = null;
    let userUnit = null;

    if (expectedUnit === '$') {
        // Must start with $
        if (!cleanInput.startsWith('$')) {
            return false;
        }
        let numStr = cleanInput.slice(1).trim();
        userNum = parseFloat(numStr);
        userUnit = '$';
    } else {
        // General unit matching - must include the unit after the answer
        let match = cleanInput.match(/^([+-]?\d*(?:\.\d+)?)\s*([a-zA-Z/⁶\s\u2076]+)$/);
        if (!match) {
            // User did not include a unit or formatting is invalid
            return false;
        } else {
            userNum = parseFloat(match[1]);
            userUnit = match[2].replace(/\s+/g, '');
        }
    }

    if (isNaN(userNum)) return false;

    // Verify correct unit (CASE SENSITIVE as requested)
    let unitValid = false;

    if (expectedUnit === '$') {
        unitValid = true;
    } else {
        // Enforce case-sensitive unit checks
        if (expectedUnit === 'kWh') {
            unitValid = (userUnit === 'kWh');
        } else if (expectedUnit === 'W') {
            unitValid = (userUnit === 'W');
        } else if (expectedUnit === 'kW') {
            unitValid = (userUnit === 'kW');
        } else if (expectedUnit === 'J') {
            unitValid = (userUnit === 'J' || userUnit === 'Joules' || userUnit === 'Joule');
        } else if (expectedUnit === 'A') {
            unitValid = (userUnit === 'A' || userUnit === 'Amps' || userUnit === 'Ampere' || userUnit === 'Amperes');
        } else if (expectedUnit === 'V') {
            unitValid = (userUnit === 'V' || userUnit === 'Volts' || userUnit === 'Volt');
        } else if (expectedUnit === 'hr' || expectedUnit === 'hours' || expectedUnit === 'h') {
            unitValid = (userUnit === 'hr' || userUnit === 'hrs' || userUnit === 'hours' || userUnit === 'h');
        } else if (expectedUnit === 'days') {
            unitValid = (userUnit === 'days' || userUnit === 'day');
        }
    }

    if (!unitValid) return false;

    // Verify margin of error
    let diff = Math.abs(userNum - correctAnswer);
    let maxAllowedDiff = Math.abs(correctAnswer) * tolerance;
    return diff <= maxAllowedDiff;
}

// ==========================================================================
// Celebration Overlay Engine
// ==========================================================================
function showCorrectAnimation() {
    const overlay = document.getElementById("celebration-overlay");
    overlay.innerHTML = "";

    // Generate 35 particles falling down
    for (let i = 0; i < 35; i++) {
        const p = document.createElement("div");
        p.className = "particle";
        
        // Random layout values
        p.style.left = `${Math.random() * 100}vw`;
        p.style.top = `-20px`;
        p.style.width = `${Math.random() * 8 + 4}px`;
        p.style.height = p.style.width;
        p.style.opacity = Math.random();
        
        // Random falling speeds
        const duration = Math.random() * 1.5 + 1.2;
        p.style.animationDuration = `${duration}s`;
        
        // Neon color variations
        const colors = ["#00f3ff", "#38bdf8", "#0ea5e9", "#f8fafc"];
        p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        overlay.appendChild(p);
    }
}

// ==========================================================================
// Quiz Ending Scoring Panel
// ==========================================================================
function showQuizResults() {
    document.getElementById("quiz-hud").style.display = "none";
    document.getElementById("quiz-active-screen").classList.remove("active");
    
    const resultScreen = document.getElementById("quiz-result-screen");
    resultScreen.classList.add("active");

    const scoreVal = document.getElementById("result-score-val");
    const headline = document.getElementById("result-headline");
    const message = document.getElementById("result-message");

    scoreVal.textContent = quizScore.toString();

    // Three Bands of Feedback
    if (quizScore >= 12) {
        headline.textContent = "Outstanding Mastery!";
        message.innerHTML = "You displayed an encouraging grasp of <strong>P = VI</strong> and <strong>E = VIt</strong> formulas. Excellent job converting units to calculate total cost!";
        showCorrectAnimation();
        setTimeout(showCorrectAnimation, 800); // Larger double celebration
    } else if (quizScore >= 7) {
        headline.textContent = "Good Progress!";
        message.innerHTML = "You got a solid foundation. Make sure to review **unit conversions** (J to kWh) and **multi-step calculation steps** before trying again.";
    } else {
        headline.textContent = "Keep Practicing!";
        message.innerHTML = "A supportive review of the **Concept Introduction** and **Revision Cards** will help build your confidence. Try again and you will improve!";
    }
}
