// EM Hazards Case Study App Logic

// Spectrum Presets
const EM_SPECTRUM = [
    { name: "Radio Waves", frequency: "3e5 Hz", wavelength: "1000 m", energy: "1.24e-9 eV", hazard: "none", val: 0 },
    { name: "Microwaves", frequency: "3e9 Hz", wavelength: "0.1 m", energy: "1.24e-5 eV", hazard: "heating", val: 1 },
    { name: "Infrared", frequency: "3e12 Hz", wavelength: "1e-4 m", energy: "0.012 eV", hazard: "heating", val: 2 },
    { name: "Visible Light", frequency: "6e14 Hz", wavelength: "5e-7 m", energy: "2.5 eV", hazard: "none", val: 3 },
    { name: "Ultraviolet", frequency: "1e16 Hz", wavelength: "3e-8 m", energy: "41 eV", hazard: "ionisation", val: 4 },
    { name: "X-Rays", frequency: "3e18 Hz", wavelength: "1e-10 m", energy: "12.4 keV", hazard: "ionisation", val: 5 },
    { name: "Gamma Rays", frequency: "3e20 Hz", wavelength: "1e-12 m", energy: "1.24 MeV", hazard: "ionisation", val: 6 }
];

// 8 Case Study Scenarios
const SCENARIOS = [
    {
        title: "Kitchen Microwave Oven Operation",
        desc: "A student is heating food in a kitchen microwave oven. They notice that food gets extremely hot within two minutes, but they are standing right next to the oven during operation. What wave is involved, what is the hazard, and how is safety ensured?",
        location: "Home Kitchen",
        wave: "Microwaves",
        hazard: "heating",
        safety: "Metal mesh door screen",
        options: {
            waves: ["Microwaves", "Infrared", "Radio Waves", "Visible Light"],
            safety: ["Lead-lined apron", "Metal mesh door screen", "UV block safety goggles", "Standing 100 meters away"]
        },
        explanation: "Microwaves match the natural frequency of water molecules, exciting them and causing internal heating. A Faraday cage (metal mesh screen on the door) reflects and contains the microwave energy, preventing it from heating human tissue."
    },
    {
        title: "Medical Dental X-Ray Clinic",
        desc: "A patient is getting routine dental work done. The technician places a heavy protective collar and bib over the patient's torso before pressing a button behind a protective partition to snap an image of the patient's molars.",
        location: "Medical Practice",
        wave: "X-Rays",
        hazard: "ionisation",
        safety: "Lead-lined apron",
        options: {
            waves: ["Visible Light", "Ultraviolet", "X-Rays", "Gamma Rays"],
            safety: ["Standard sunglasses", "Laser safety goggles", "Lead-lined apron", "Sunscreen SPF 50"]
        },
        explanation: "X-Rays are high-energy ionising radiation that can penetrate soft tissues to image bone structure. Because they are ionising, shielding sensitive internal organs (like the thyroid and chest) with a lead apron blocks the rays and prevents cell mutations."
    },
    {
        title: "Sunbed/Solarium Tanning",
        desc: "An individual visits a solarium to get a quick cosmetic tan using a tanning bed. They lie down inside the illuminated chamber without wearing any protective eyewear or applying barrier lotions.",
        location: "Tanning Salon",
        wave: "Ultraviolet",
        hazard: "ionisation",
        safety: "UV block safety goggles",
        options: {
            waves: ["Infrared", "Visible Light", "Ultraviolet", "X-Rays"],
            safety: ["Lead-lined apron", "UV block safety goggles", "Metal mesh shielding", "Aluminum foil suit"]
        },
        explanation: "Tanning beds emit high-intensity ultraviolet (UV) radiation. UV radiation is ionising to outer tissue layers, leading to DNA mutations (skin cancer risk) and cataracts or eye damage if eyes are left exposed without UV-blocking goggles."
    },
    {
        title: "Nuclear Medicine - Thyroid Scan",
        desc: "A patient is administered Iodine-131, a radioactive tracer that accumulates in the thyroid gland to locate abnormal growths. The patient emits highly penetrative radiation and is advised to avoid close contact with small children for several days.",
        location: "Oncology Dept",
        wave: "Gamma Rays",
        hazard: "ionisation",
        safety: "Maximize distance and minimize contact time",
        options: {
            waves: ["X-Rays", "Gamma Rays", "Ultraviolet", "Infrared"],
            safety: ["Wearing cotton clothing", "Laser safety goggles", "Maximize distance and minimize contact time", "Drinking glass of water"]
        },
        explanation: "Radioactive isotopes like Iodine-131 emit gamma rays (highly energised, deeply penetrating ionising particles/waves). The primary hazard is cellular ionisation/DNA damage. Since the patient themselves emits the rays, maximizing distance and minimizing contact time is the primary safety measure for others."
    },
    {
        title: "Infrared Heat Lamp Therapy",
        desc: "A physiotherapist uses a glowing red heating lamp to treat muscular tension in an athlete's back. The lamp is placed near the athlete's bare skin for a prolonged session without checking the skin temperature.",
        location: "Physiotherapy Room",
        wave: "Infrared",
        hazard: "heating",
        safety: "Limit exposure time & check skin temperature",
        options: {
            waves: ["Infrared", "Microwaves", "Radio Waves", "Ultraviolet"],
            safety: ["Lead shield apron", "Limit exposure time & check skin temperature", "High SPF sunblock", "Polarized sunglasses"]
        },
        explanation: "Infrared radiation carries heat energy directly to the molecules on the skin's surface, triggering thermal agitation. It does not ionise cells, but prolonged exposure can cause thermal burns if the distance and duration are not carefully monitored."
    },
    {
        title: "Commercial Radio Broadcast Station",
        desc: "An engineer is carrying out maintenance on a high-power cellular and broadcast antenna tower. The tower transmits communications signals to an entire city. Which EM wave is utilized, what hazard exists near the antenna, and how is safety maintained?",
        location: "Communications Mast",
        wave: "Radio Waves",
        hazard: "none",
        safety: "Keep safe clearance distance & turn off transmitter",
        options: {
            waves: ["Radio Waves", "Visible Light", "X-Rays", "Gamma Rays"],
            safety: ["Lead-lined apron", "Keep safe clearance distance & turn off transmitter", "SPF 30 Sunscreen", "Laser safety glasses"]
        },
        explanation: "Radio waves have low frequencies and long wavelengths with insufficient energy to heat or ionise cells under ordinary exposure. However, extremely close proximity to active high-power transmitters should be restricted (keep distance/power off) to maintain occupational standards."
    },
    {
        title: "Surgical CO2 Laser Procedure",
        desc: "A surgeon is using a highly focused CO2 laser beam to make precise cuts in tissue during a minor surgery. The laser emits intense invisible thermal radiation, and everyone in the operating room must wear special glasses.",
        location: "Operating Theatre",
        wave: "Infrared",
        hazard: "heating",
        safety: "Special wavelength safety glasses",
        options: {
            waves: ["Microwaves", "Infrared", "X-Rays", "Radio Waves"],
            safety: ["Lead apron", "Metal foil mesh", "Special wavelength safety glasses", "Applying protective lotion"]
        },
        explanation: "High-power lasers (specifically CO2 lasers emitting in the infrared spectrum) heat and vaporize water molecules in tissue to make incisions. The safety risk is accidental thermal burns to the eyes, which is mitigated by wearing wavelength-specific safety glasses."
    },
    {
        title: "Rooftop Solar Array Maintenance",
        desc: "A maintenance crew is working outdoors on a skyscraper's solar array panels during peak afternoon sunlight in mid-summer. The workers are exposed to direct sunlight for 6 consecutive hours.",
        location: "Outdoor Rooftop",
        wave: "Ultraviolet",
        hazard: "ionisation",
        safety: "Sunscreen lotion & protective clothing",
        options: {
            waves: ["Radio Waves", "Visible Light", "Ultraviolet", "Microwaves"],
            safety: ["Metal mesh screens", "Sunscreen lotion & protective clothing", "Lead aprons", "Distance from panels"]
        },
        explanation: "Direct sunlight contains ultraviolet radiation. Continuous exposure causes ionising damage to skin cells, leading to sunburn and long-term DNA damage. High SPF sunscreen, broad-brimmed hats, and protective clothing block these rays."
    }
];

// App State
let currentTab = "quiz";
let currentScenarioIndex = 0;
let userSelections = { wave: null, hazard: null, safety: null };
let quizScore = 0;
let completedCount = 0;
let quizScenariosList = [];

// Simulation State
let activeSimWaveIndex = 1; // Start with Microwave
let activeSimIntensity = 50;
let activeSimDuration = 10;
let activeShields = { eyewear: false, lead: false, distance: false };

// Specimen Cell Grid Setup
function createCellGrid() {
    const grid = document.getElementById("cell-grid");
    grid.innerHTML = "";
    for (let i = 0; i < 16; i++) {
        const cell = document.createElement("div");
        cell.className = "skin-cell";
        
        const nucleus = document.createElement("div");
        nucleus.className = "cell-nucleus";
        
        cell.appendChild(nucleus);
        grid.appendChild(cell);
    }
}

// Switch Tabs
function switchTab(tabId) {
    currentTab = tabId;
    document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(content => content.classList.remove("active"));
    
    document.getElementById(`tab-${tabId}`).classList.add("active");
    document.getElementById(`content-${tabId}`).classList.add("active");

    if (tabId === "sim") {
        updateSimWave();
    } else if (tabId === "quiz") {
        loadScenario(currentScenarioIndex);
    }
}

// Initial Setup
window.onload = function() {
    lucide.createIcons();
    createCellGrid();
    shuffleScenarios();
    loadScenario(0);
    startWaveCanvasAnimation();
};

// Shuffle Scenarios for random layout
function shuffleScenarios() {
    quizScenariosList = [...SCENARIOS].sort(() => 0.5 - Math.random()).slice(0, 5); // Take 5 random scenarios
    quizScore = 0;
    completedCount = 0;
    document.getElementById("score-val").textContent = "0";
}

// Load Scenario in Quiz Tab
function loadScenario(index) {
    if (index >= quizScenariosList.length) {
        // Quiz completed
        showQuizEndSummary();
        return;
    }

    currentScenarioIndex = index;
    userSelections = { wave: null, hazard: null, safety: null };
    
    const sc = quizScenariosList[index];
    
    // Update texts
    document.getElementById("quiz-count").textContent = `Case ${index + 1}/${quizScenariosList.length}`;
    document.getElementById("scenario-location").textContent = sc.location;
    document.getElementById("scenario-title").textContent = sc.title;
    document.getElementById("scenario-desc").textContent = sc.desc;
    
    // Render options
    renderWaveOptions(sc.options.waves);
    renderSafetyOptions(sc.options.safety);
    
    // Clear hazard selections
    document.querySelectorAll(".hazard-card").forEach(c => c.classList.remove("selected"));
    
    // Hide feedback
    document.getElementById("feedback-panel").style.display = "none";
    document.getElementById("submit-btn").style.display = "flex";
    document.getElementById("next-btn").style.display = "none";

    // Update chamber preview
    const matchingWaveInfo = EM_SPECTRUM.find(w => w.name === sc.wave) || EM_SPECTRUM[3];
    updateChamberReadings(matchingWaveInfo, 0, 0, "Warning: Live Scanner Active");
}

function renderWaveOptions(options) {
    const container = document.getElementById("wave-options");
    container.innerHTML = "";
    options.forEach(opt => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "option-card";
        btn.innerHTML = `<i data-lucide="radio" class="wave-icon"></i> <span>${opt}</span>`;
        btn.onclick = () => selectOption("wave", btn, opt);
        container.appendChild(btn);
    });
    lucide.createIcons();
}

function renderSafetyOptions(options) {
    const container = document.getElementById("safety-options");
    container.innerHTML = "";
    options.forEach(opt => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "option-card option-row";
        btn.innerHTML = `<i data-lucide="shield" class="safety-icon"></i> <span>${opt}</span>`;
        btn.onclick = () => selectOption("safety", btn, opt);
        container.appendChild(btn);
    });
    lucide.createIcons();
}

function selectOption(type, element, val) {
    // If element has already been evaluated as incorrect/correct, block clicks
    if (document.getElementById("next-btn").style.display === "flex") return;

    if (type === "hazard") {
        document.querySelectorAll(".hazard-card").forEach(c => c.classList.remove("selected"));
        element.classList.add("selected");
        userSelections.hazard = element.getAttribute("data-val");
    } else {
        const container = element.parentElement;
        container.querySelectorAll(".option-card").forEach(c => c.classList.remove("selected"));
        element.classList.add("selected");
        userSelections[type] = val;
    }
}

// Handle Quiz Submit
function handleQuizSubmit(event) {
    event.preventDefault();
    
    if (!userSelections.wave || !userSelections.hazard || !userSelections.safety) {
        alert("Please complete all 3 parts of the safety assessment before submitting.");
        return;
    }

    const sc = quizScenariosList[currentScenarioIndex];
    const isWaveCorrect = userSelections.wave === sc.wave;
    const isHazardCorrect = userSelections.hazard === sc.hazard;
    const isSafetyCorrect = userSelections.safety === sc.safety;

    const isAllCorrect = isWaveCorrect && isHazardCorrect && isSafetyCorrect;
    
    // Update live chamber preview to show full risk animation
    const matchingWaveInfo = EM_SPECTRUM.find(w => w.name === sc.wave) || EM_SPECTRUM[3];
    let thermalVal = 0;
    let ionisingVal = 0;

    if (sc.hazard === "heating") {
        thermalVal = 70;
        updateChamberAnimation("heating");
    } else if (sc.hazard === "ionisation") {
        ionisingVal = 85;
        updateChamberAnimation("ionisation");
    } else {
        updateChamberAnimation("none");
    }
    
    updateChamberReadings(matchingWaveInfo, thermalVal, ionisingVal, sc.hazard === "none" ? "Safe" : "Hazard Detected");

    // Score Calculation
    let earnedPoints = 0;
    if (isWaveCorrect) earnedPoints += 10;
    if (isHazardCorrect) earnedPoints += 10;
    if (isSafetyCorrect) earnedPoints += 10;
    
    quizScore += earnedPoints;
    document.getElementById("score-val").textContent = quizScore;

    // Show Feedback Panel
    const feedbackBox = document.getElementById("feedback-panel");
    feedbackBox.style.display = "flex";
    
    if (isAllCorrect) {
        feedbackBox.className = "feedback-panel feedback-correct";
        document.getElementById("feedback-title").textContent = "Assessment Success - Protocol Verified";
        document.getElementById("feedback-content").innerHTML = `
            <p><strong>Excellent work!</strong> You correctly diagnosed the situation.</p>
            <p style="margin-top: 8px;"><strong>Scientific Basis:</strong> ${sc.explanation}</p>
        `;
    } else {
        feedbackBox.className = "feedback-panel feedback-incorrect";
        document.getElementById("feedback-title").textContent = "Safety Deviation Detected";
        
        let errorMsg = "Review details below:<br>";
        if (!isWaveCorrect) errorMsg += `• Involved Wave is actually <strong>${sc.wave}</strong> (you guessed ${userSelections.wave}).<br>`;
        if (!isHazardCorrect) errorMsg += `• Hazard Class is actually <strong>${sc.hazard === "heating" ? "Thermal/Heating" : sc.hazard === "ionisation" ? "Ionising Radiation" : "None/Low Risk"}</strong>.<br>`;
        if (!isSafetyCorrect) errorMsg += `• Recommended Precaution should be <strong>${sc.safety}</strong>.<br>`;

        document.getElementById("feedback-content").innerHTML = `
            <p>${errorMsg}</p>
            <p style="margin-top: 8px;"><strong>Scientific Basis:</strong> ${sc.explanation}</p>
        `;
    }

    document.getElementById("submit-btn").style.display = "none";
    document.getElementById("next-btn").style.display = "flex";
}

function nextScenario() {
    completedCount++;
    loadScenario(completedCount);
}

function showQuizEndSummary() {
    const activeContent = document.getElementById("content-quiz");
    activeContent.innerHTML = `
        <div class="panel-header border-b">
            <div class="panel-title">
                <i data-lucide="award"></i>
                <h2>Evaluation Complete</h2>
            </div>
        </div>
        <div class="summary-results-card" style="text-align: center; padding: 2.5rem 1.5rem; gap: 1.5rem;">
            <div class="pulse-ring" style="margin: 0 auto; width: 60px; height: 60px; background: rgba(16, 185, 129, 0.1); border-color: var(--color-safe);">
                <i data-lucide="trophy" style="color: var(--color-safe); width: 30px; height: 30px;"></i>
            </div>
            <div>
                <h3 style="font-size: 1.5rem; font-family: var(--font-display);">Lab Protocol Cleared</h3>
                <p style="color: var(--text-secondary); margin-top: 8px;">You have finalized safety assessments on all active bio-exposure dossiers.</p>
            </div>
            <div class="results-grid" style="max-width: 300px; margin: 0 auto;">
                <div class="result-tile">
                    <span class="label">FINAL SCORE</span>
                    <span class="value font-orbitron" style="font-size: 1.4rem; color: var(--color-safe);">${quizScore}/150</span>
                </div>
            </div>
            <button class="btn btn-primary btn-glow" style="margin: 0 auto;" onclick="resetQuiz()">
                <i data-lucide="refresh-cw"></i> Run New Scenarios
            </button>
        </div>
    `;
    lucide.createIcons();
    updateChamberAnimation("none");
    updateChamberReadings(EM_SPECTRUM[3], 0, 0, "Ready");
}

function resetQuiz() {
    // Restore layout
    window.location.reload();
}

// Live Chamber Status Update
function updateChamberReadings(waveInfo, thermalVal, ionisingVal, textStatus) {
    document.getElementById("hud-freq").textContent = waveInfo.frequency;
    document.getElementById("hud-wave").textContent = waveInfo.wavelength;
    document.getElementById("hud-energy").textContent = waveInfo.energy;
    
    document.getElementById("val-thermal").textContent = `${(thermalVal * 0.6 + 37).toFixed(1)}°C`;
    document.getElementById("bar-thermal").style.width = `${thermalVal}%`;
    
    document.getElementById("val-ionising").textContent = `${ionisingVal}%`;
    document.getElementById("bar-ionising").style.width = `${ionisingVal}%`;

    const badge = document.getElementById("chamber-status-badge");
    badge.textContent = textStatus;
    badge.className = "status-badge";
    if (textStatus === "Safe" || textStatus === "Ready") {
        badge.classList.add("status-safe");
    } else if (thermalVal > 40 && ionisingVal === 0) {
        badge.classList.add("status-warning");
    } else {
        badge.classList.add("status-danger");
    }
}

function updateChamberAnimation(state) {
    const cells = document.querySelectorAll(".skin-cell");
    cells.forEach((cell, idx) => {
        cell.className = "skin-cell"; // reset
        
        if (state === "heating") {
            cell.classList.add("heating");
        } else if (state === "ionisation") {
            if (idx % 3 === 0) {
                cell.classList.add("dna-damaged");
            } else {
                cell.classList.add("ionised");
            }
        }
    });

    const overlay = document.getElementById("danger-overlay");
    if (state !== "none") {
        overlay.style.opacity = "1";
        overlay.style.background = state === "heating" 
            ? "radial-gradient(circle, rgba(245, 158, 11, 0) 40%, rgba(245, 158, 11, 0.25) 100%)"
            : "radial-gradient(circle, rgba(217, 70, 239, 0) 40%, rgba(217, 70, 239, 0.25) 100%)";
    } else {
        overlay.style.opacity = "0";
    }
}

// SIMULATOR LOGIC
function updateSimWave() {
    const slider = document.getElementById("sim-wave-slider");
    activeSimWaveIndex = parseInt(slider.value);
    
    const waveInfo = EM_SPECTRUM[activeSimWaveIndex];
    document.getElementById("sim-wave-name").textContent = waveInfo.name;
    
    updateSimReadouts();
}

function toggleShield(shieldType) {
    activeShields[shieldType] = !activeShields[shieldType];
    const btn = document.getElementById(`shield-${shieldType}`);
    if (activeShields[shieldType]) {
        btn.classList.add("active");
    } else {
        btn.classList.remove("active");
    }
    updateSimReadouts();
}

function updateSimReadouts() {
    const intensitySlider = document.getElementById("sim-intensity-slider");
    activeSimIntensity = parseInt(intensitySlider.value);
    document.getElementById("sim-intensity-readout").textContent = `${activeSimIntensity}%`;

    const durationSlider = document.getElementById("sim-duration-slider");
    activeSimDuration = parseInt(durationSlider.value);
    document.getElementById("sim-duration-readout").textContent = `${activeSimDuration}s`;

    const waveInfo = EM_SPECTRUM[activeSimWaveIndex];
    
    // Physics calculation models
    let hazardType = waveInfo.hazard;
    let baseThermal = 0;
    let baseIonising = 0;

    if (hazardType === "heating") {
        // Microwaves & IR heat tissue
        baseThermal = (activeSimIntensity * (activeSimDuration / 60)) * 50; 
        if (baseThermal > 100) baseThermal = 100;
    } else if (hazardType === "ionisation") {
        // UV, X-Ray, Gamma ionise
        baseIonising = (activeSimIntensity * (activeSimDuration / 30)) * 25;
        if (baseIonising > 100) baseIonising = 100;
    }

    // Apply shield mitigations
    let shieldFeedback = [];
    if (activeShields.eyewear) {
        shieldFeedback.push("UV Eyewear protects eyes");
        if (waveInfo.name === "Ultraviolet") {
            baseIonising *= 0.15; // blocks 85% of UV
        }
    }
    if (activeShields.lead) {
        shieldFeedback.push("Lead Shielding blocks X-Ray/Gamma");
        if (waveInfo.name === "X-Rays" || waveInfo.name === "Gamma Rays") {
            baseIonising *= 0.05; // blocks 95% of high frequency
        }
    }
    if (activeShields.distance) {
        shieldFeedback.push("Safe Distance minimizes exposure");
        // Inverse square law simulation (reduces everything significantly)
        baseThermal *= 0.2;
        baseIonising *= 0.2;
    }

    // Rounding
    baseThermal = Math.round(baseThermal);
    baseIonising = Math.round(baseIonising);

    // Update chamber readings
    let statusText = "Safe";
    if (baseThermal > 60 || baseIonising > 50) {
        statusText = "Critical Hazard";
    } else if (baseThermal > 20 || baseIonising > 15) {
        statusText = "Caution";
    }
    
    updateChamberReadings(waveInfo, baseThermal, baseIonising, statusText);
    
    // Update specimen animation
    if (baseThermal > 20) {
        updateChamberAnimation("heating");
    } else if (baseIonising > 15) {
        updateChamberAnimation("ionisation");
    } else {
        updateChamberAnimation("none");
    }

    // Update Sandbox HUD Outputs
    const tempCelsius = 37.0 + (baseThermal * 0.6);
    document.getElementById("sim-temp-display").textContent = `${tempCelsius.toFixed(1)} °C`;
    document.getElementById("sim-mutation-display").textContent = `${baseIonising.toFixed(1)}%`;
    
    const tissueStatus = document.getElementById("sim-tissue-status");
    tissueStatus.className = "value font-orbitron";
    
    if (tempCelsius > 44 || baseIonising > 50) {
        tissueStatus.textContent = "Severely Damaged";
        tissueStatus.classList.add("text-ionising");
    } else if (tempCelsius > 39 || baseIonising > 15) {
        tissueStatus.textContent = "Agitated";
        tissueStatus.classList.add("text-thermal");
    } else {
        tissueStatus.textContent = "Healthy";
        tissueStatus.classList.add("text-safe");
    }

    // Generate dynamic feedback text
    const feedbackBox = document.getElementById("sim-feedback-box");
    let reportHTML = "";
    
    if (statusText === "Safe") {
        reportHTML = `No critical hazards detected. ${shieldFeedback.length > 0 ? 'Shields active: ' + shieldFeedback.join(', ') + '.' : 'Specimen remains fully stable.'}`;
    } else if (hazardType === "heating") {
        reportHTML = `<strong>Thermal Agitation Warning!</strong> The specimen's water molecules are vibrating rapidly under high intensity ${waveInfo.name}. Internal cellular heat is rising. ${activeShields.distance ? 'Distance mitigation prevents catastrophic tissue boiling.' : 'Reduce intensity/time or increase distance immediately!'}`;
    } else if (hazardType === "ionisation") {
        reportHTML = `<strong>Ionising Radiation Danger!</strong> High energy ${waveInfo.name} photons are breaking molecular bonds and altering cell nuclei. Cumulative DNA damage is scaling. ${activeShields.lead ? 'Lead shielding is successfully absorbing most radiation.' : 'Apply shielding, goggles, or distance to mitigate exposure!'}`;
    }
    
    feedbackBox.innerHTML = reportHTML;
}

// WAVE CANVAS ANIMATION
let wavePhase = 0;
function startWaveCanvasAnimation() {
    const canvas = document.getElementById("wave-canvas");
    const ctx = canvas.getContext("2d");
    
    function resizeCanvas() {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
    }
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function drawWave() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        let freqVal = 3; // default intermediate
        let waveColor = "rgba(59, 130, 246, 0.4)";
        let amplitude = 25;

        if (currentTab === "quiz") {
            const sc = quizScenariosList[currentScenarioIndex];
            if (sc) {
                const w = EM_SPECTRUM.find(x => x.name === sc.wave);
                if (w) {
                    freqVal = w.val;
                    waveColor = w.hazard === "heating" ? "rgba(245, 158, 11, 0.4)" : w.hazard === "ionisation" ? "rgba(217, 70, 239, 0.4)" : "rgba(16, 185, 129, 0.4)";
                }
            }
        } else if (currentTab === "sim") {
            freqVal = activeSimWaveIndex;
            const w = EM_SPECTRUM[activeSimWaveIndex];
            waveColor = w.hazard === "heating" ? "rgba(245, 158, 11, 0.45)" : w.hazard === "ionisation" ? "rgba(217, 70, 239, 0.45)" : "rgba(16, 185, 129, 0.45)";
            amplitude = Math.max(10, activeSimIntensity * 0.5);
        }

        // Draw sine wave
        ctx.beginPath();
        ctx.strokeStyle = waveColor;
        ctx.lineWidth = 3;
        
        const frequencyScale = Math.pow(1.8, freqVal) * 0.005;

        for (let x = 0; x < canvas.width; x++) {
            const y = canvas.height / 2 + Math.sin(x * frequencyScale + wavePhase) * amplitude;
            if (x === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();

        wavePhase += 0.05 + (freqVal * 0.01);
        requestAnimationFrame(drawWave);
    }
    
    drawWave();
}
