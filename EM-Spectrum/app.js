// Constant speed of light (m/s)
const C_SPEED = 3.00e8; 

// Spectrum region parameters
const SPECTRUM_REGIONS = [
    {
        id: "radio",
        name: "Radio Waves",
        minLambda: 1.0, 
        maxLambda: Infinity,
        minFreq: 0,
        maxFreq: 3e8,
        description: "Radio waves have the longest wavelengths in the EM spectrum. They are used for long-distance communication, television, radio broadcasts, and mobile networks.",
        color: "#2c1e4d"
    },
    {
        id: "microwave",
        name: "Microwaves",
        minLambda: 1e-3,
        maxLambda: 1.0,
        minFreq: 3e8,
        maxFreq: 3e11,
        description: "Microwaves are sub-millimeter waves, useful for radar, satellite transmissions, cooking food, and high-speed wireless networks like Wi-Fi.",
        color: "#3f2275"
    },
    {
        id: "infrared",
        name: "Infrared Radiation",
        minLambda: 7.5e-7,
        maxLambda: 1e-3,
        minFreq: 3e11,
        maxFreq: 4e14,
        description: "Infrared light is experienced by humans primarily as heat. Used in thermal imaging, remote controls, optical fiber communications, and weather forecasting.",
        color: "#c0392b"
    },
    {
        id: "visible",
        name: "Visible Light",
        minLambda: 3.8e-7,
        maxLambda: 7.5e-7,
        minFreq: 4e14,
        maxFreq: 7.89e14,
        description: "The only region of the electromagnetic spectrum that human eyes can detect. Red has the longest wavelength, while violet has the shortest.",
        color: "linear-gradient(to right, #ff3b30, #ff9500, #ffcc00, #4cd964, #5ac8fa, #5856d6)"
    },
    {
        id: "ultraviolet",
        name: "Ultraviolet (UV)",
        minLambda: 1e-8,
        maxLambda: 3.8e-7,
        minFreq: 7.89e14,
        maxFreq: 3e16,
        description: "UV rays have higher energy than visible light. They are emitted by the Sun and are used in sterilizing equipment, blacklights, and security markings, but can cause sunburn.",
        color: "#7d3cff"
    },
    {
        id: "xray",
        name: "X-Rays",
        minLambda: 1e-11,
        maxLambda: 1e-8,
        minFreq: 3e16,
        maxFreq: 3e19,
        description: "X-rays are highly energetic waves capable of passing through soft tissues, making them essential for medical imaging, security scans, and crystallography.",
        color: "#4b0082"
    },
    {
        id: "gamma",
        name: "Gamma Rays",
        minLambda: 0,
        maxLambda: 1e-11,
        minFreq: 3e19,
        maxFreq: Infinity,
        description: "Gamma rays carry the highest energy and shortest wavelengths in the EM spectrum. They are produced by nuclear reactions, radioactive decay, and supermassive cosmic events.",
        color: "#2c004d"
    }
];

// Presets data
const PRESETS = {
    radio: { type: "freq", value: 100e6, unit: "MHz" }, // 100 MHz
    microwave: { type: "freq", value: 2.4e9, unit: "GHz" }, // 2.4 GHz
    infrared: { type: "wavelength", value: 10e-6, unit: "um" }, // 10 um
    red: { type: "wavelength", value: 650e-9, unit: "nm" }, // 650 nm
    green: { type: "wavelength", value: 530e-9, unit: "nm" }, // 530 nm
    blue: { type: "wavelength", value: 450e-9, unit: "nm" }, // 450 nm
    ultraviolet: { type: "wavelength", value: 254e-9, unit: "nm" }, // 254 nm
    xray: { type: "freq", value: 3e17, unit: "Hz" },
    gamma: { type: "freq", value: 3e20, unit: "Hz" }
};

// Unit conversion factors to base units (m or Hz)
const WAVELENGTH_UNITS = {
    m: 1.0,
    cm: 1e-2,
    mm: 1e-3,
    um: 1e-6,
    nm: 1e-9,
    pm: 1e-12
};

const FREQUENCY_UNITS = {
    Hz: 1.0,
    kHz: 1e3,
    MHz: 1e6,
    GHz: 1e9,
    THz: 1e12
};

// UI Elements
const waveTypeSelector = document.getElementById("wave-type-selector");
const calcTargetInputs = document.getElementsByName("calc-target");
const blockWavelength = document.getElementById("block-wavelength");
const blockFrequency = document.getElementById("block-frequency");

const inputWavelength = document.getElementById("input-wavelength");
const inputWavelengthExp = document.getElementById("input-wavelength-exp");
const unitWavelength = document.getElementById("unit-wavelength");

const inputFrequency = document.getElementById("input-frequency");
const inputFrequencyExp = document.getElementById("input-frequency-exp");
const unitFrequency = document.getElementById("unit-frequency");

const resultLabel = document.getElementById("result-label");
const resultValue = document.getElementById("result-value");
const resultConverted = document.getElementById("result-converted");
const calcFormula = document.getElementById("calc-formula-derivation");
const calcSteps = document.getElementById("calc-steps-list");

// Quiz Elements
let currentQuestion = null;
let score = { correct: 0, total: 0 };
let questionActive = true;

// Canvas Setup
const canvas = document.getElementById("waveCanvas");
const ctx = canvas.getContext("2d");
let animationFrameId;
let waveFrequencyFactor = 1.0; // Higher = tighter waves

// Initialize
window.addEventListener("load", () => {
    setupEventListeners();
    handlePresetChange();
    resizeCanvas();
    startWaveAnimation();
    generateQuestion();
});

window.addEventListener("resize", resizeCanvas);

function setupEventListeners() {
    // Calculator toggle
    calcTargetInputs.forEach(radio => {
        radio.addEventListener("change", (e) => {
            const target = e.target.value;
            if (target === "wavelength") {
                blockWavelength.style.display = "none";
                blockFrequency.style.display = "flex";
                resultLabel.innerHTML = 'Wavelength (<span class="keep-case">&lambda;</span>)';
            } else {
                blockWavelength.style.display = "flex";
                blockFrequency.style.display = "none";
                resultLabel.innerHTML = 'Frequency (<span class="keep-case">f</span>)';
            }
            calculate();
        });
    });

    // Preset Select
    waveTypeSelector.addEventListener("change", handlePresetChange);

    // Input listeners
    [inputWavelength, inputWavelengthExp, unitWavelength, 
     inputFrequency, inputFrequencyExp, unitFrequency].forEach(el => {
        el.addEventListener("input", () => {
            waveTypeSelector.value = "custom";
            calculate();
        });
        el.addEventListener("change", () => {
            waveTypeSelector.value = "custom";
            calculate();
        });
    });

    // Spectrum bar region clicks
    document.querySelectorAll(".spectrum-region").forEach(region => {
        region.addEventListener("click", () => {
            const regionId = region.getAttribute("data-region");
            if (PRESETS[regionId]) {
                waveTypeSelector.value = regionId;
                handlePresetChange();
            }
        });
    });
}

function switchTab(tabName) {
    document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(panel => panel.classList.remove("active"));

    document.getElementById(`tab-${tabName}`).classList.add("active");
    document.getElementById(`${tabName}-content`).classList.add("active");
}

function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
}

// Format numbers in scientific notation
function formatScientific(val) {
    if (val === 0) return "0";
    const exp = Math.floor(Math.log10(Math.abs(val)));
    const base = val / Math.pow(10, exp);
    // Keep 3 decimal places
    return `${base.toFixed(3)} × 10<sup>${exp}</sup>`;
}

// Convert wavelength to readable scale
function getReadableWavelength(m) {
    if (m >= 1.0) return `${m.toFixed(2)} m`;
    if (m >= 1e-2) return `${(m * 1e2).toFixed(2)} cm`;
    if (m >= 1e-3) return `${(m * 1e3).toFixed(2)} mm`;
    if (m >= 1e-6) return `${(m * 1e6).toFixed(2)} μm`;
    if (m >= 1e-9) return `${(m * 1e9).toFixed(2)} nm`;
    return `${(m * 1e12).toFixed(2)} pm`;
}

function getReadableFrequency(hz) {
    if (hz >= 1e12) return `${(hz * 1e-12).toFixed(2)} THz`;
    if (hz >= 1e9) return `${(hz * 1e-9).toFixed(2)} GHz`;
    if (hz >= 1e6) return `${(hz * 1e-6).toFixed(2)} MHz`;
    if (hz >= 1e3) return `${(hz * 1e-3).toFixed(2)} kHz`;
    return `${hz.toFixed(2)} Hz`;
}

// Get spectrum region metadata by wavelength
function getRegionByWavelength(lambda) {
    return SPECTRUM_REGIONS.find(r => lambda >= r.minLambda && lambda < r.maxLambda) || SPECTRUM_REGIONS[0];
}

function highlightSpectrumRegion(regionId) {
    document.querySelectorAll(".spectrum-region").forEach(r => {
        if (r.getAttribute("data-region") === regionId) {
            r.classList.add("active-region");
        } else {
            r.classList.remove("active-region");
        }
    });

    const region = SPECTRUM_REGIONS.find(r => r.id === regionId);
    if (region) {
        document.getElementById("info-title").textContent = region.name;
        document.getElementById("info-description").textContent = region.description;
        
        let lRange = region.minLambda === 0 ? `< 10⁻¹¹ m` : 
                     region.maxLambda === Infinity ? `> 1 m` : 
                     `${getReadableWavelength(region.minLambda)} to ${getReadableWavelength(region.maxLambda)}`;
                     
        let fRange = region.minFreq === 0 ? `< 300 MHz` :
                     region.maxFreq === Infinity ? `> 3 × 10¹⁹ Hz` :
                     `${getReadableFrequency(region.minFreq)} to ${getReadableFrequency(region.maxFreq)}`;

        document.getElementById("info-lambda-range").innerHTML = lRange;
        document.getElementById("info-f-range").innerHTML = fRange;
    }
}

// Handle Preset wave type change
function handlePresetChange() {
    const selected = waveTypeSelector.value;
    if (selected === "custom") return;

    const preset = PRESETS[selected];
    const calcTarget = document.querySelector('input[name="calc-target"]:checked').value;

    if (preset.type === "freq") {
        // Preset is frequency
        const val = preset.value;
        const exp = Math.floor(Math.log10(val));
        const base = val / Math.pow(10, exp);
        
        inputFrequency.value = base.toFixed(3);
        inputFrequencyExp.value = exp;
        unitFrequency.value = "Hz";
        
        if (calcTarget === "frequency") {
            // Need to switch target to wavelength to calculate
            document.querySelector('input[name="calc-target"][value="wavelength"]').checked = true;
            blockWavelength.style.display = "none";
            blockFrequency.style.display = "flex";
            resultLabel.innerHTML = 'Wavelength (<span class="keep-case">&lambda;</span>)';
        }
    } else {
        // Preset is wavelength
        const val = preset.value;
        const exp = Math.floor(Math.log10(val));
        const base = val / Math.pow(10, exp);

        inputWavelength.value = base.toFixed(3);
        inputWavelengthExp.value = exp;
        unitWavelength.value = "m";

        if (calcTarget === "wavelength") {
            // Need to switch target to frequency to calculate
            document.querySelector('input[name="calc-target"][value="frequency"]').checked = true;
            blockWavelength.style.display = "flex";
            blockFrequency.style.display = "none";
            resultLabel.innerHTML = 'Frequency (<span class="keep-case">f</span>)';
        }
    }

    calculate();
}

// Core calculation logic
function calculate() {
    const calcTarget = document.querySelector('input[name="calc-target"]:checked').value;
    
    if (calcTarget === "wavelength") {
        // Calculate Wavelength from frequency
        const freqBase = parseFloat(inputFrequency.value) || 0;
        const freqExp = parseInt(inputFrequencyExp.value) || 0;
        const freqUnitMult = FREQUENCY_UNITS[unitFrequency.value];
        const freqHz = freqBase * Math.pow(10, freqExp) * freqUnitMult;

        if (freqHz <= 0) {
            resultValue.innerHTML = "---";
            resultConverted.innerHTML = "Enter a valid frequency";
            return;
        }

        const lambda = C_SPEED / freqHz;
        
        resultValue.innerHTML = `${formatScientific(lambda)} m`;
        resultConverted.innerHTML = `Equivalent to: <strong>${getReadableWavelength(lambda)}</strong>`;
        
        // Show steps
        calcFormula.innerHTML = '<span class="keep-case">&lambda;</span> = <span class="fraction"><span class="numerator">c</span><span class="denominator">f</span></span>';
        calcSteps.innerHTML = `
            <div class="step-item"><span class="step-num">1.</span> Identify known variables: f = ${formatScientific(freqHz)} Hz, c = ${formatScientific(C_SPEED)} m/s</div>
            <div class="step-item"><span class="step-num">2.</span> Rearrange the wave equation: &lambda; = c / f</div>
            <div class="step-item"><span class="step-num">3.</span> Substitute values: &lambda; = (${formatScientific(C_SPEED)} m/s) / (${formatScientific(freqHz)} Hz)</div>
            <div class="step-item"><span class="step-num">4.</span> Calculate result: &lambda; = ${formatScientific(lambda)} m (${getReadableWavelength(lambda)})</div>
        `;

        const region = getRegionByWavelength(lambda);
        highlightSpectrumRegion(region.id);
        
        // Set wave frequency visualizer scale (logarithmic relationship)
        waveFrequencyFactor = Math.min(Math.max(Math.log10(freqHz) - 5, 0.5), 15);
    } else {
        // Calculate Frequency from wavelength
        const lambBase = parseFloat(inputWavelength.value) || 0;
        const lambExp = parseInt(inputWavelengthExp.value) || 0;
        const lambUnitMult = WAVELENGTH_UNITS[unitWavelength.value];
        const lambM = lambBase * Math.pow(10, lambExp) * lambUnitMult;

        if (lambM <= 0) {
            resultValue.innerHTML = "---";
            resultConverted.innerHTML = "Enter a valid wavelength";
            return;
        }

        const freqHz = C_SPEED / lambM;

        resultValue.innerHTML = `${formatScientific(freqHz)} Hz`;
        resultConverted.innerHTML = `Equivalent to: <strong>${getReadableFrequency(freqHz)}</strong>`;

        // Show steps
        calcFormula.innerHTML = 'f = <span class="fraction"><span class="numerator">c</span><span class="denominator"><span class="keep-case">&lambda;</span></span></span>';
        calcSteps.innerHTML = `
            <div class="step-item"><span class="step-num">1.</span> Identify known variables: &lambda; = ${formatScientific(lambM)} m, c = ${formatScientific(C_SPEED)} m/s</div>
            <div class="step-item"><span class="step-num">2.</span> Rearrange the wave equation: f = c / &lambda;</div>
            <div class="step-item"><span class="step-num">3.</span> Substitute values: f = (${formatScientific(C_SPEED)} m/s) / (${formatScientific(lambM)} m)</div>
            <div class="step-item"><span class="step-num">4.</span> Calculate result: f = ${formatScientific(freqHz)} Hz (${getReadableFrequency(freqHz)})</div>
        `;

        const region = getRegionByWavelength(lambM);
        highlightSpectrumRegion(region.id);
        
        // Set wave frequency visualizer scale
        waveFrequencyFactor = Math.min(Math.max(Math.log10(freqHz) - 5, 0.5), 15);
    }
}

// Wave Animation Loop
let time = 0;
function startWaveAnimation() {
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.beginPath();
        ctx.strokeStyle = "rgba(0, 240, 255, 0.8)";
        ctx.lineWidth = 2;
        
        const amplitude = canvas.height * 0.25;
        const centerY = canvas.height / 2;
        
        // Draw primary wave
        for (let x = 0; x < canvas.width; x++) {
            const waveLengthScale = 0.05 * waveFrequencyFactor;
            const y = centerY + Math.sin(x * waveLengthScale - time) * amplitude;
            if (x === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();

        // Draw dynamic particles matching wave speed
        time += 0.03 * Math.sqrt(waveFrequencyFactor);
        
        animationFrameId = requestAnimationFrame(animate);
    }
    animate();
}

// QUIZ LOGIC
function generateQuestion() {
    questionActive = true;
    document.getElementById("submit-ans-btn").disabled = false;
    document.getElementById("next-q-btn").textContent = "Skip Question";
    
    document.getElementById("quiz-feedback-box").classList.add("hidden");
    document.getElementById("solution-container").classList.add("hidden");
    document.getElementById("solution-placeholder-text").classList.remove("hidden");
    
    // Reset inputs
    document.getElementById("quiz-ans-val").value = "";
    document.getElementById("quiz-ans-exp").value = "";

    // Select a random wave preset type (e.g. microwave, ultraviolet, visible red, visible blue, xray)
    const waveKeys = Object.keys(PRESETS);
    const selectedKey = waveKeys[Math.floor(Math.random() * waveKeys.length)];
    const region = SPECTRUM_REGIONS.find(r => r.id === selectedKey) || getRegionByWavelength(PRESETS[selectedKey].value);
    
    const targetIsWavelength = Math.random() < 0.5;
    
    // Choose actual frequency/wavelength values
    let baseVal, expVal, calculatedVal;
    
    if (targetIsWavelength) {
        // Calculate Wavelength: Give Frequency
        const hzVal = PRESETS[selectedKey].type === "freq" ? PRESETS[selectedKey].value : C_SPEED / PRESETS[selectedKey].value;
        const freqExp = Math.floor(Math.log10(hzVal));
        const freqBase = hzVal / Math.pow(10, freqExp);
        
        // Slightly randomize parameters to keep quiz dynamic
        const fuzz = 0.9 + Math.random() * 0.2; // 0.9 to 1.1 multiplier
        const targetHz = hzVal * fuzz;
        const finalFreqExp = Math.floor(Math.log10(targetHz));
        const finalFreqBase = parseFloat((targetHz / Math.pow(10, finalFreqExp)).toFixed(2));
        const cleanHz = finalFreqBase * Math.pow(10, finalFreqExp);

        calculatedVal = C_SPEED / cleanHz;

        currentQuestion = {
            target: "wavelength",
            givenName: "frequency",
            givenValFormatted: `${finalFreqBase} &times; 10<sup>${finalFreqExp}</sup> Hz`,
            givenBase: finalFreqBase,
            givenExp: finalFreqExp,
            answer: calculatedVal,
            waveName: region.name,
            regionId: region.id,
            steps: [
                { title: "Identify Given Values", text: `We are asked to find the wavelength (&lambda;). We are given:<br>Frequency (f) = ${finalFreqBase} &times; 10<sup>${finalFreqExp}</sup> Hz<br>Speed of light (c) = 3.000 &times; 10<sup>8</sup> m/s` },
                { title: "Choose the Formula", text: `Rearrange wave equation (c = f &middot; &lambda;) to solve for wavelength:<br><div class="math-row">&lambda; = c / f</div>` },
                { title: "Substitute & Solve", text: `&lambda; = (3.000 &times; 10<sup>8</sup>) / (${finalFreqBase} &times; 10<sup>${finalFreqExp}</sup>)<br>Divide bases and subtract exponents:<br><div class="math-row">&lambda; = ${formatScientific(calculatedVal)} m</div>` }
            ]
        };

        document.getElementById("question-text").innerHTML = `An EM wave has a frequency of <strong>${finalFreqBase} &times; 10<sup>${finalFreqExp}</sup> Hz</strong>. Find its wavelength (&lambda;). The speed of light is 3.000 &times; 10<sup>8</sup> m/s.`;
        document.getElementById("quiz-unit-label").innerHTML = "m";
    } else {
        // Calculate Frequency: Give Wavelength
        const mVal = PRESETS[selectedKey].type === "wavelength" ? PRESETS[selectedKey].value : C_SPEED / PRESETS[selectedKey].value;
        const fuzz = 0.9 + Math.random() * 0.2;
        const targetM = mVal * fuzz;
        const finalMExp = Math.floor(Math.log10(targetM));
        const finalMBase = parseFloat((targetM / Math.pow(10, finalMExp)).toFixed(2));
        const cleanM = finalMBase * Math.pow(10, finalMExp);

        calculatedVal = C_SPEED / cleanM;

        currentQuestion = {
            target: "frequency",
            givenName: "wavelength",
            givenValFormatted: `${finalMBase} &times; 10<sup>${finalMExp}</sup> m`,
            givenBase: finalMBase,
            givenExp: finalMExp,
            answer: calculatedVal,
            waveName: region.name,
            regionId: region.id,
            steps: [
                { title: "Identify Given Values", text: `We are asked to find the frequency (f). We are given:<br>Wavelength (&lambda;) = ${finalMBase} &times; 10<sup>${finalMExp}</sup> m<br>Speed of light (c) = 3.000 &times; 10<sup>8</sup> m/s` },
                { title: "Choose the Formula", text: `Rearrange wave equation (c = f &middot; &lambda;) to solve for frequency:<br><div class="math-row">f = c / &lambda;</div>` },
                { title: "Substitute & Solve", text: `f = (3.000 &times; 10<sup>8</sup>) / (${finalMBase} &times; 10<sup>${finalMExp}</sup>)<br>Divide bases and subtract exponents:<br><div class="math-row">f = ${formatScientific(calculatedVal)} Hz</div>` }
            ]
        };

        document.getElementById("question-text").innerHTML = `An EM wave has a wavelength of <strong>${finalMBase} &times; 10<sup>${finalMExp}</sup> m</strong>. Find its frequency (f). The speed of light is 3.000 &times; 10<sup>8</sup> m/s.`;
        document.getElementById("quiz-unit-label").innerHTML = "Hz";
    }

    const badge = document.getElementById("question-badge");
    badge.textContent = region.name;
    badge.style.background = region.color.startsWith("linear") ? "var(--color-purple)" : region.color;
}

function insertExp(val) {
    document.getElementById("quiz-ans-exp").value = val;
}

function checkAnswer() {
    const userVal = parseFloat(document.getElementById("quiz-ans-val").value);
    const userExp = parseInt(document.getElementById("quiz-ans-exp").value);
    
    if (isNaN(userVal) || isNaN(userExp)) {
        alert("Please enter both value base and scientific exponent (e.g. 3.0 and 8).");
        return;
    }

    const userAnswer = userVal * Math.pow(10, userExp);
    const correctAns = currentQuestion.answer;
    
    // Check with 5% margin of error to accommodate rounding or speed of light approximation variations
    const margin = 0.05;
    const isCorrect = Math.abs(userAnswer - correctAns) / correctAns < margin;

    const feedbackBox = document.getElementById("quiz-feedback-box");
    const feedbackTitle = document.getElementById("feedback-title");
    const feedbackText = document.getElementById("feedback-text");

    score.total++;

    if (isCorrect) {
        score.correct++;
        feedbackBox.className = "quiz-feedback success";
        feedbackTitle.textContent = "Correct!";
        feedbackText.innerHTML = `Superb! The exact value is ${formatScientific(correctAns)} ${currentQuestion.target === "wavelength" ? "m" : "Hz"}.`;
    } else {
        feedbackBox.className = "quiz-feedback error";
        feedbackTitle.textContent = "Incorrect";
        feedbackText.innerHTML = `Not quite. Let's look at the worked steps to see where the calculation went wrong. The correct answer was ${formatScientific(correctAns)} ${currentQuestion.target === "wavelength" ? "m" : "Hz"}.`;
    }

    feedbackBox.classList.remove("hidden");
    document.getElementById("score-correct").textContent = score.correct;
    document.getElementById("score-total").textContent = score.total;

    questionActive = false;
    document.getElementById("submit-ans-btn").disabled = true;
    document.getElementById("next-q-btn").textContent = "Next Question";

    showSolution();
}

function handleSkipOrNext() {
    if (questionActive) {
        // Skip current question
        questionActive = false;
        score.total++;
        document.getElementById("score-total").textContent = score.total;
        
        const feedbackBox = document.getElementById("quiz-feedback-box");
        const feedbackTitle = document.getElementById("feedback-title");
        const feedbackText = document.getElementById("feedback-text");
        
        feedbackBox.className = "quiz-feedback error";
        feedbackTitle.textContent = "Skipped";
        feedbackText.innerHTML = `Question skipped. The correct answer was ${formatScientific(currentQuestion.answer)} ${currentQuestion.target === "wavelength" ? "m" : "Hz"}.`;
        feedbackBox.classList.remove("hidden");
        
        document.getElementById("submit-ans-btn").disabled = true;
        document.getElementById("next-q-btn").textContent = "Next Question";
        
        showSolution();
    } else {
        // Load next question
        generateQuestion();
    }
}

function showSolution() {
    const placeholder = document.getElementById("solution-placeholder-text");
    const container = document.getElementById("solution-container");

    placeholder.classList.add("hidden");
    container.classList.remove("hidden");

    container.innerHTML = "";
    
    currentQuestion.steps.forEach((step, idx) => {
        const stepDiv = document.createElement("div");
        stepDiv.className = "solution-step";
        stepDiv.innerHTML = `
            <h4>Step ${idx + 1}: ${step.title}</h4>
            <p>${step.text}</p>
        `;
        container.appendChild(stepDiv);
    });

    // Final region highlight
    const regionDiv = document.createElement("div");
    regionDiv.className = "solution-step";
    regionDiv.innerHTML = `
        <h4>Final Conclusion</h4>
        <p>This electromagnetic wave belongs to the <strong>${currentQuestion.waveName}</strong> spectrum band.</p>
    `;
    container.appendChild(regionDiv);
}
