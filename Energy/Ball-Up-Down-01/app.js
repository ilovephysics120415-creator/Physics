// Physics and simulation state
let state = {
    // Inputs (Sliders)
    g: 9.8,
    h0: 5.0,
    m: 2.0,
    u: 4.0,
    animSpeed: 1,

    // Simulation runtime
    time: 0,
    isRunning: false,
    isFinished: false,
    
    // Physics output states
    h: 5.0,
    v: 4.0,
    tImpact: 0,
    vImpact: 0,
    hMax: 5.0,
    tApex: 0,
    
    // Capture state
    captured: null, // { t, h, v }

    // Test mode state
    testMode: false,
    hiddenParamA: null, // 'h' or 'v'
    hiddenParamB: null, // 'g', 'hmax', or 'u'
    revealedParams: {
        h: false,
        v: false,
        g: false,
        hmax: false,
        u: false
    }
};

// Canvas elements & context
const simCanvas = document.getElementById('canvas-sim');
const simCtx = simCanvas.getContext('2d');
const graphCanvas = document.getElementById('canvas-graph');
const graphCtx = graphCanvas.getContext('2d');

// DOM elements
const sliderG = document.getElementById('slider-g');
const sliderH0 = document.getElementById('slider-h0');
const sliderM = document.getElementById('slider-m');
const sliderU = document.getElementById('slider-u');
const sliderSpeed = document.getElementById('slider-speed');

const valG = document.getElementById('g-val');
const valH0 = document.getElementById('h0-val');
const valM = document.getElementById('m-val');
const valU = document.getElementById('u-val');
const valSpeed = document.getElementById('speed-val');

const teleH0 = document.getElementById('tele-h0');
const teleU = document.getElementById('tele-u');
const teleH = document.getElementById('tele-h');
const teleV = document.getElementById('tele-v');
const teleVImpact = document.getElementById('tele-v-impact');
const teleHMax = document.getElementById('tele-hmax');
const teleHMaxCard = document.getElementById('tele-hmax-card');

const lblHCaptured = document.getElementById('lbl-h-captured');
const lblVCaptured = document.getElementById('lbl-v-captured');

const btnStart = document.getElementById('btn-start');
const btnCapture = document.getElementById('btn-capture');
const btnTest = document.getElementById('btn-test');
const btnReset = document.getElementById('btn-reset');

const modal = document.getElementById('working-modal');
const modalClose = document.getElementById('modal-close-btn');
const modalContent = document.getElementById('modal-content');

// Hidden status wrappers/buttons
const hHideBtn = document.getElementById('h-hide-btn');
const vHideBtn = document.getElementById('v-hide-btn');
const gHideBtn = document.getElementById('g-hide-btn');
const uHideBtn = document.getElementById('u-hide-btn');
const hmaxHideBtn = document.getElementById('hmax-hide-btn');

// History of points plotted on the graph
let timeSeries = [];

// Initialize sliders and listeners
function init() {
    updateInputs();
    resizeCanvases();
    resetSim();
    
    // Sliders
    sliderG.addEventListener('input', () => { state.g = parseFloat(sliderG.value); updateInputs(); resetSim(); });
    sliderH0.addEventListener('input', () => { state.h0 = parseFloat(sliderH0.value); updateInputs(); resetSim(); });
    sliderM.addEventListener('input', () => { state.m = parseInt(sliderM.value); updateInputs(); resetSim(); });
    sliderU.addEventListener('input', () => { state.u = parseFloat(sliderU.value); updateInputs(); resetSim(); });
    sliderSpeed.addEventListener('input', () => { state.animSpeed = parseInt(sliderSpeed.value); valSpeed.textContent = state.animSpeed + 'x'; });

    // Buttons
    btnStart.addEventListener('click', startSim);
    btnCapture.addEventListener('click', captureState);
    btnTest.addEventListener('click', toggleTestMode);
    btnReset.addEventListener('click', resetSim);
    
    // Modal Close
    modalClose.addEventListener('click', () => modal.classList.remove('active'));
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });

    // Hide/reveal click listeners
    hHideBtn.addEventListener('click', () => showWorking('h'));
    vHideBtn.addEventListener('click', () => showWorking('v'));
    gHideBtn.addEventListener('click', () => showWorking('g'));
    uHideBtn.addEventListener('click', () => showWorking('u'));
    hmaxHideBtn.addEventListener('click', () => showWorking('hmax'));

    window.addEventListener('resize', () => {
        resizeCanvases();
        draw();
    });
}

function resizeCanvases() {
    const dpr = window.devicePixelRatio || 1;
    [simCanvas, graphCanvas].forEach(canvas => {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
    });
}

function updateInputs() {
    valG.textContent = state.g.toFixed(1) + ' N/kg';
    valH0.textContent = state.h0.toFixed(1) + ' m';
    valM.textContent = state.m + ' kg';
    valU.textContent = state.u.toFixed(1) + ' m/s';
    
    teleH0.textContent = state.h0.toFixed(2) + ' m';
    teleU.textContent = state.u.toFixed(2) + ' m/s';

    // Physics constants derivation
    // v^2 = u^2 + 2gh0 => v = sqrt(u^2 + 2gh0)
    state.vImpact = Math.sqrt(state.u * state.u + 2 * state.g * state.h0);
    state.tApex = state.u / state.g;
    state.hMax = state.h0 + (state.u * state.u) / (2 * state.g);
    // h0 + u*t - 0.5*g*t^2 = 0 => 0.5*g*t^2 - u*t - h0 = 0
    state.tImpact = (state.u + Math.sqrt(state.u * state.u + 2 * state.g * state.h0)) / state.g;

    teleVImpact.textContent = state.vImpact.toFixed(2) + ' m/s';
    teleHMax.textContent = state.hMax.toFixed(2) + ' m';
}

function resetSim() {
    state.time = 0;
    state.isRunning = false;
    state.isFinished = false;
    state.captured = null;
    timeSeries = [];
    
    state.h = state.h0;
    state.v = state.u;
    
    btnStart.innerHTML = '<i class="fa-solid fa-play"></i> Start';
    lblHCaptured.textContent = '';
    lblVCaptured.textContent = '';

    // Apply hides depending on testMode
    applyTestModeHides();
    updateTelemetry();
    draw();
}

function startSim() {
    if (state.isFinished) {
        resetSim();
    }
    state.isRunning = !state.isRunning;
    if (state.isRunning) {
        btnStart.innerHTML = '<i class="fa-solid fa-pause"></i> Pause';
        lastFrameTime = performance.now();
        requestAnimationFrame(simLoop);
    } else {
        btnStart.innerHTML = '<i class="fa-solid fa-play"></i> Resume';
    }
}

let lastFrameTime = 0;
function simLoop(now) {
    if (!state.isRunning) return;
    
    let dt = (now - lastFrameTime) / 1000;
    lastFrameTime = now;
    
    // Cap dt to prevent massive jumps when tab is inactive
    if (dt > 0.1) dt = 0.1;
    
    // Scale dt by simulation speed slider
    state.time += dt * state.animSpeed;
    
    if (state.time >= state.tImpact) {
        state.time = state.tImpact;
        state.isRunning = false;
        state.isFinished = true;
        btnStart.innerHTML = '<i class="fa-solid fa-rotate-left"></i> Restart';
    }

    // Kinematic calculations
    const t = state.time;
    state.h = state.h0 + state.u * t - 0.5 * state.g * t * t;
    state.v = state.u - state.g * t;

    // Safety clamps
    if (state.h < 0) {
        state.h = 0;
        state.v = -state.vImpact;
    }

    // Add to graphing series
    const ke = 0.5 * state.m * state.v * state.v;
    const gpe = state.m * state.g * state.h;
    const te = ke + gpe;
    timeSeries.push({ t, ke, gpe, te });

    updateTelemetry();
    draw();

    if (state.isRunning) {
        requestAnimationFrame(simLoop);
    }
}

function captureState() {
    // Captures the current physics state of the ball
    state.captured = {
        t: state.time,
        h: state.h,
        v: state.v
    };
    
    lblHCaptured.textContent = '(Captured)';
    lblVCaptured.textContent = '(Captured)';

    updateTelemetry();
    draw();
}

function toggleTestMode() {
    state.testMode = !state.testMode;
    if (state.testMode) {
        btnTest.classList.add('active');
        teleHMaxCard.style.display = 'flex';
        randomizeTestHides();
    } else {
        btnTest.classList.remove('active');
        teleHMaxCard.style.display = 'none';
        resetTestHides();
    }
    resetSim();
}

function randomizeTestHides() {
    // Category A: Hide height (h) or speed (v)
    state.hiddenParamA = Math.random() < 0.5 ? 'h' : 'v';
    // Category B: Hide g, hmax, or initial speed (u)
    const choices = ['g', 'hmax', 'u'];
    state.hiddenParamB = choices[Math.floor(Math.random() * choices.length)];
    
    // Clear reveal state
    for (let key in state.revealedParams) {
        state.revealedParams[key] = false;
    }
}

function resetTestHides() {
    state.hiddenParamA = null;
    state.hiddenParamB = null;
    for (let key in state.revealedParams) {
        state.revealedParams[key] = false;
    }
}

function applyTestModeHides() {
    // Hide buttons
    const btns = {
        h: hHideBtn, v: vHideBtn, g: gHideBtn, u: uHideBtn, hmax: hmaxHideBtn
    };
    
    // Hide all eye buttons initially
    for (let k in btns) {
        btns[k].style.display = 'none';
    }

    if (!state.testMode) return;

    // Show eye buttons for selected hidden parameters if they aren't revealed yet
    if (state.hiddenParamA && !state.revealedParams[state.hiddenParamA]) {
        btns[state.hiddenParamA].style.display = 'inline-block';
    }
    if (state.hiddenParamB && !state.revealedParams[state.hiddenParamB]) {
        btns[state.hiddenParamB].style.display = 'inline-block';
    }
}

function updateTelemetry() {
    const showOrHide = (param, valueStr) => {
        if (state.testMode && param === state.hiddenParamA && !state.revealedParams[param]) {
            return '⚡ HIDDEN';
        }
        if (state.testMode && param === state.hiddenParamB && !state.revealedParams[param]) {
            return '⚡ HIDDEN';
        }
        return valueStr;
    };

    // Calculate displays
    let dispH = state.h;
    let dispV = state.v;

    // If there is a capture, telemetry shows captured value
    if (state.captured) {
        dispH = state.captured.h;
        dispV = state.captured.v;
    }

    teleH.textContent = showOrHide('h', dispH.toFixed(2) + ' m');
    teleV.textContent = showOrHide('v', Math.abs(dispV).toFixed(2) + ' m/s');

    // Labels next to sliders
    valG.textContent = showOrHide('g', state.g.toFixed(1) + ' N/kg');
    valU.textContent = showOrHide('u', state.u.toFixed(1) + ' m/s');
    
    teleHMax.textContent = showOrHide('hmax', state.hMax.toFixed(2) + ' m');
}

// Drawing Routine
function draw() {
    drawSimulation();
    drawGraph();
}

function drawSimulation() {
    const w = simCanvas.width;
    const h = simCanvas.height;
    simCtx.clearRect(0, 0, w, h);
    
    const scaleFactor = 1; 
    const groundY = h - 50;
    
    // Dynamically calculate simulation height bounds based on max physics height reached
    let maxSimHeight = Math.max(25, Math.ceil(state.hMax / 5) * 5 + 5);
    
    // Helper to convert physical height in meters to screen pixel Y coordinate
    function toPixelY(metHeight) {
        return groundY - (metHeight / maxSimHeight) * (groundY - 40);
    }

    // Grid lines & height marks
    simCtx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    simCtx.lineWidth = 1;
    simCtx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    simCtx.font = '12px Outfit';
    
    const gridStep = maxSimHeight <= 50 ? 5 : (maxSimHeight <= 150 ? 25 : 50);
    for (let height = 0; height <= maxSimHeight; height += gridStep) {
        let py = toPixelY(height);
        simCtx.beginPath();
        simCtx.moveTo(40, py);
        simCtx.lineTo(w - 20, py);
        simCtx.stroke();
        simCtx.fillText(height + 'm', 10, py + 4);
    }

    // Ground drawing
    simCtx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    simCtx.fillRect(0, groundY, w, h - groundY);
    simCtx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    simCtx.beginPath();
    simCtx.moveTo(0, groundY);
    simCtx.lineTo(w, groundY);
    simCtx.stroke();

    // Draw apex lines
    simCtx.strokeStyle = 'rgba(129, 140, 248, 0.2)';
    simCtx.setLineDash([4, 4]);
    simCtx.beginPath();
    simCtx.moveTo(40, toPixelY(state.hMax));
    simCtx.lineTo(w - 20, toPixelY(state.hMax));
    simCtx.stroke();
    simCtx.setLineDash([]);
    simCtx.fillStyle = '#818cf8';
    
    if (!(state.testMode && state.hiddenParamB === 'hmax' && !state.revealedParams.hmax)) {
        simCtx.fillText('Max Height: ' + state.hMax.toFixed(2) + 'm', w - 150, toPixelY(state.hMax) - 6);
    }

    const ballX = w / 2;
    
    // Draw captured line & text if applicable
    if (state.captured) {
        const capY = toPixelY(state.captured.h);
        simCtx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
        simCtx.lineWidth = 2;
        simCtx.beginPath();
        simCtx.moveTo(40, capY);
        simCtx.lineTo(w - 20, capY);
        simCtx.stroke();
        
        simCtx.fillStyle = '#c7d2fe';
        let capHStr = (state.testMode && state.hiddenParamA === 'h' && !state.revealedParams.h) ? 'HIDDEN' : state.captured.h.toFixed(2) + ' m';
        let capVStr = (state.testMode && state.hiddenParamA === 'v' && !state.revealedParams.v) ? 'HIDDEN' : Math.abs(state.captured.v).toFixed(2) + ' m/s';
        simCtx.fillText(`Captured: h = ${capHStr}, v = ${capVStr}`, 45, capY - 6);
    }

    // Ball physics drawing
    const ballY = toPixelY(state.h);
    const radius = 18;
    
    // Velocity vector arrow
    if (Math.abs(state.v) > 0.1) {
        simCtx.strokeStyle = state.v > 0 ? '#10b981' : '#ef4444';
        simCtx.lineWidth = 3;
        simCtx.fillStyle = state.v > 0 ? '#10b981' : '#ef4444';
        const arrowLength = state.v * 8; // scale arrow length
        simCtx.beginPath();
        simCtx.moveTo(ballX, ballY);
        simCtx.lineTo(ballX, ballY - arrowLength);
        simCtx.stroke();
        
        // Arrow head
        simCtx.beginPath();
        simCtx.moveTo(ballX - 6, ballY - arrowLength + (state.v > 0 ? 6 : -6));
        simCtx.lineTo(ballX, ballY - arrowLength);
        simCtx.lineTo(ballX + 6, ballY - arrowLength + (state.v > 0 ? 6 : -6));
        simCtx.fill();
    }

    // Draw the ball
    let ballGradient = simCtx.createRadialGradient(ballX - 4, ballY - 4, 2, ballX, ballY, radius);
    ballGradient.addColorStop(0, '#fff');
    ballGradient.addColorStop(0.3, '#818cf8');
    ballGradient.addColorStop(1, '#4f46e5');
    
    simCtx.beginPath();
    simCtx.arc(ballX, ballY, radius, 0, Math.PI * 2);
    simCtx.fillStyle = ballGradient;
    simCtx.shadowColor = 'rgba(99, 102, 241, 0.5)';
    simCtx.shadowBlur = 10;
    simCtx.fill();
    simCtx.shadowBlur = 0; // reset
}

function drawGraph() {
    const w = graphCanvas.width;
    const h = graphCanvas.height;
    graphCtx.clearRect(0, 0, w, h);

    const padding = 50;
    const graphW = w - padding - 20;
    const graphH = h - padding - 20;

    // Drawing Grid Axis
    graphCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    graphCtx.lineWidth = 1;
    graphCtx.beginPath();
    graphCtx.moveTo(padding, 20);
    graphCtx.lineTo(padding, h - padding);
    graphCtx.lineTo(w - 20, h - padding);
    graphCtx.stroke();

    // Axis Labels
    graphCtx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    graphCtx.font = '12px Outfit';
    graphCtx.textAlign = 'center';
    graphCtx.fillText('Time (s)', padding + graphW / 2, h - 15);
    
    graphCtx.save();
    graphCtx.translate(15, 20 + graphH / 2);
    graphCtx.rotate(-Math.PI / 2);
    graphCtx.fillText('Energy (J)', 0, 0);
    graphCtx.restore();

    // Scale Calculations
    // Max Time matches computed impact time
    const maxT = Math.max(state.tImpact, 1.0);
    // Max Energy = Initial Total Energy (constant)
    const maxEnergy = Math.max(state.m * state.g * state.hMax, 10.0);

    // Grid ticks
    graphCtx.textAlign = 'right';
    graphCtx.textBaseline = 'middle';
    for (let i = 0; i <= 4; i++) {
        let frac = i / 4;
        let valE = frac * maxEnergy;
        let py = h - padding - frac * graphH;
        graphCtx.fillText(valE.toFixed(0) + 'J', padding - 8, py);
        
        graphCtx.beginPath();
        graphCtx.moveTo(padding, py);
        graphCtx.lineTo(w - 20, py);
        graphCtx.stroke();
    }

    graphCtx.textAlign = 'center';
    graphCtx.textBaseline = 'top';
    for (let i = 0; i <= 4; i++) {
        let frac = i / 4;
        let valT = frac * maxT;
        let px = padding + frac * graphW;
        graphCtx.fillText(valT.toFixed(2) + 's', px, h - padding + 8);
    }

    // Helper map coordinates
    function mapCoords(tVal, eVal) {
        return {
            x: padding + (tVal / maxT) * graphW,
            y: h - padding - (eVal / maxEnergy) * graphH
        };
    }

    // Plot time series lines
    if (timeSeries.length > 0) {
        // GPE (indigo)
        graphCtx.strokeStyle = '#818cf8';
        graphCtx.lineWidth = 3;
        graphCtx.beginPath();
        let pt0 = mapCoords(timeSeries[0].t, timeSeries[0].gpe);
        graphCtx.moveTo(pt0.x, pt0.y);
        for (let i = 1; i < timeSeries.length; i++) {
            let pt = mapCoords(timeSeries[i].t, timeSeries[i].gpe);
            graphCtx.lineTo(pt.x, pt.y);
        }
        graphCtx.stroke();

        // KE (emerald)
        graphCtx.strokeStyle = '#10b981';
        graphCtx.beginPath();
        pt0 = mapCoords(timeSeries[0].t, timeSeries[0].ke);
        graphCtx.moveTo(pt0.x, pt0.y);
        for (let i = 1; i < timeSeries.length; i++) {
            let pt = mapCoords(timeSeries[i].t, timeSeries[i].ke);
            graphCtx.lineTo(pt.x, pt.y);
        }
        graphCtx.stroke();

        // TE (amber)
        graphCtx.strokeStyle = '#fbbf24';
        graphCtx.beginPath();
        pt0 = mapCoords(timeSeries[0].t, timeSeries[0].te);
        graphCtx.moveTo(pt0.x, pt0.y);
        for (let i = 1; i < timeSeries.length; i++) {
            let pt = mapCoords(timeSeries[i].t, timeSeries[i].te);
            graphCtx.lineTo(pt.x, pt.y);
        }
        graphCtx.stroke();
    }

    // Capture point marker on graph
    if (state.captured && timeSeries.length > 0) {
        const capGpe = state.m * state.g * state.captured.h;
        const capKe = 0.5 * state.m * state.captured.v * state.captured.v;
        
        // Draw vertical dotted line at capture time
        const pxTime = padding + (state.captured.t / maxT) * graphW;
        graphCtx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        graphCtx.setLineDash([3, 3]);
        graphCtx.beginPath();
        graphCtx.moveTo(pxTime, 20);
        graphCtx.lineTo(pxTime, h - padding);
        graphCtx.stroke();
        graphCtx.setLineDash([]);

        // Plot indicators
        const ptGpe = mapCoords(state.captured.t, capGpe);
        const ptKe = mapCoords(state.captured.t, capKe);

        // Dots
        [ptGpe, ptKe].forEach((pt, idx) => {
            graphCtx.fillStyle = idx === 0 ? '#818cf8' : '#10b981';
            graphCtx.beginPath();
            graphCtx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
            graphCtx.fill();
            graphCtx.strokeStyle = '#fff';
            graphCtx.lineWidth = 1.5;
            graphCtx.stroke();
        });
    }
}

// O-Level Step-by-Step Popups and Working
function showWorking(param) {
    let titleHtml = '';
    let bodyHtml = '';

    // Variables check
    const m = state.m;
    const g = state.g;
    const h0 = state.h0;
    const u = state.u;
    const hMax = state.hMax;
    const capH = state.captured ? state.captured.h : state.h;
    const capV = state.captured ? state.captured.v : state.v;

    // Calculated constants for equations
    const startKE = 0.5 * m * u * u;
    const startGPE = m * g * h0;
    const totalE = startKE + startGPE;

    if (param === 'h') {
        titleHtml = 'Solving for Height (h) using Conservation of Energy';
        bodyHtml = `
            <div class="formula-card">
                <h5>Principle of Conservation of Energy:</h5>
                <p>Total Energy is constant. Therefore, the energy at start equals energy at the current/captured position:</p>
                <div class="math-eq">E_total = GPE_start + KE_start = GPE_current + KE_current</div>
            </div>
            
            <div class="working-step">
                <h4>Step 1: Calculate Total Initial Energy (E_total)</h4>
                <p>Initial state (at height h₀ = ${h0.toFixed(2)} m, velocity u = ${u.toFixed(2)} m/s):</p>
                <div class="math-eq">GPE = m * g * h₀ = ${m} * ${g.toFixed(1)} * ${h0.toFixed(2)} = ${startGPE.toFixed(1)} J</div>
                <div class="math-eq">KE = 1/2 * m * u² = 0.5 * ${m} * ${u.toFixed(2)}² = ${startKE.toFixed(1)} J</div>
                <div class="math-eq">E_total = GPE + KE = ${startGPE.toFixed(1)} + ${startKE.toFixed(1)} = ${totalE.toFixed(1)} J</div>
            </div>

            <div class="working-step">
                <h4>Step 2: Calculate Kinetic Energy at the Capture point</h4>
                <p>Captured velocity is v = ${Math.abs(capV).toFixed(2)} m/s:</p>
                <div class="math-eq">KE = 1/2 * m * v² = 0.5 * ${m} * (${Math.abs(capV).toFixed(2)})² = ${(0.5 * m * capV * capV).toFixed(1)} J</div>
            </div>

            <div class="working-step">
                <h4>Step 3: Solve for Height (h) using remaining GPE</h4>
                <p>Energy Conservation states:</p>
                <div class="math-eq">GPE_current = E_total - KE_current</div>
                <div class="math-eq">GPE_current = ${totalE.toFixed(1)} - ${(0.5 * m * capV * capV).toFixed(1)} = ${(totalE - 0.5 * m * capV * capV).toFixed(1)} J</div>
                <p>Since GPE = m * g * h:</p>
                <div class="math-eq">h = GPE_current / (m * g) = ${(totalE - 0.5 * m * capV * capV).toFixed(1)} / (${m} * ${g.toFixed(1)}) = ${capH.toFixed(2)} m</div>
            </div>
        `;
    } 
    else if (param === 'v') {
        titleHtml = 'Solving for Velocity (v) using Conservation of Energy';
        bodyHtml = `
            <div class="formula-card">
                <h5>Principle of Conservation of Energy:</h5>
                <p>Total Energy is constant. Therefore, energy at start equals energy at the current/captured position:</p>
                <div class="math-eq">E_total = GPE_start + KE_start = GPE_current + KE_current</div>
            </div>
            
            <div class="working-step">
                <h4>Step 1: Calculate Total Initial Energy (E_total)</h4>
                <p>Initial state (at height h₀ = ${h0.toFixed(2)} m, velocity u = ${u.toFixed(2)} m/s):</p>
                <div class="math-eq">GPE = m * g * h₀ = ${m} * ${g.toFixed(1)} * ${h0.toFixed(2)} = ${startGPE.toFixed(1)} J</div>
                <div class="math-eq">KE = 1/2 * m * u² = 0.5 * ${m} * ${u.toFixed(2)}² = ${startKE.toFixed(1)} J</div>
                <div class="math-eq">E_total = GPE + KE = ${startGPE.toFixed(1)} + ${startKE.toFixed(1)} = ${totalE.toFixed(1)} J</div>
            </div>

            <div class="working-step">
                <h4>Step 2: Calculate Gravitational Potential Energy (GPE) at current height</h4>
                <p>Captured height is h = ${capH.toFixed(2)} m:</p>
                <div class="math-eq">GPE_current = m * g * h = ${m} * ${g.toFixed(1)} * ${capH.toFixed(2)} = ${(m * g * capH).toFixed(1)} J</div>
            </div>

            <div class="working-step">
                <h4>Step 3: Solve for velocity (v) using Kinetic Energy</h4>
                <p>Energy Conservation states:</p>
                <div class="math-eq">KE_current = E_total - GPE_current</div>
                <div class="math-eq">KE_current = ${totalE.toFixed(1)} - ${(m * g * capH).toFixed(1)} = ${(totalE - m * g * capH).toFixed(1)} J</div>
                <p>Since KE = 1/2 * m * v²:</p>
                <div class="math-eq">v² = (2 * KE_current) / m = (2 * ${(totalE - m * g * capH).toFixed(1)}) / ${m} = ${(2 * (totalE - m * g * capH) / m).toFixed(1)}</div>
                <div class="math-eq">v = sqrt(${(2 * (totalE - m * g * capH) / m).toFixed(1)}) = ${Math.abs(capV).toFixed(2)} m/s</div>
            </div>
        `;
    }
    else if (param === 'g') {
        titleHtml = 'Solving for Gravity (g) using Conservation of Energy';
        bodyHtml = `
            <div class="formula-card">
                <h5>Key Concept:</h5>
                <p>At the apex (maximum height h_max), the ball momentarily stops. Its speed is v = 0 m/s, so KE = 0.</p>
                <div class="math-eq">E_start = E_apex => m * g * h₀ + 1/2 * m * u² = m * g * h_max</div>
            </div>

            <div class="working-step">
                <h4>Step 1: Simplify conservation equations</h4>
                <p>Mass (m) cancels out from both sides:</p>
                <div class="math-eq">g * h₀ + 1/2 * u² = g * h_max</div>
            </div>

            <div class="working-step">
                <h4>Step 2: Isolate gravity (g)</h4>
                <div class="math-eq">1/2 * u² = g * h_max - g * h₀ = g * (h_max - h₀)</div>
                <div class="math-eq">g = u² / [2 * (h_max - h₀)]</div>
            </div>

            <div class="working-step">
                <h4>Step 3: Substitute values and calculate</h4>
                <p>Given: initial height h₀ = ${h0.toFixed(2)} m, max height h_max = ${hMax.toFixed(2)} m, initial speed u = ${u.toFixed(2)} m/s:</p>
                <div class="math-eq">g = ${u.toFixed(2)}² / [2 * (${hMax.toFixed(2)} - ${h0.toFixed(2)})] = ${(u*u).toFixed(2)} / ${(2 * (hMax - h0)).toFixed(2)} = ${g.toFixed(1)} N/kg</div>
            </div>
        `;
    }
    else if (param === 'hmax') {
        titleHtml = 'Solving for Max Height (h_max) using Conservation of Energy';
        bodyHtml = `
            <div class="formula-card">
                <h5>Key Concept:</h5>
                <p>At maximum height (h_max), the ball is momentarily at rest (v = 0 m/s, KE = 0).</p>
                <div class="math-eq">E_start = E_apex => m * g * h₀ + 1/2 * m * u² = m * g * h_max</div>
            </div>

            <div class="working-step">
                <h4>Step 1: Simplify equations</h4>
                <p>Divide by mass (m) on both sides:</p>
                <div class="math-eq">g * h₀ + 1/2 * u² = g * h_max</div>
            </div>

            <div class="working-step">
                <h4>Step 2: Solve for h_max</h4>
                <div class="math-eq">h_max = h₀ + u² / (2 * g)</div>
            </div>

            <div class="working-step">
                <h4>Step 3: Substitute values and calculate</h4>
                <p>Given: g = ${g.toFixed(1)} N/kg, h₀ = ${h0.toFixed(2)} m, u = ${u.toFixed(2)} m/s:</p>
                <div class="math-eq">h_max = ${h0.toFixed(2)} + ${u.toFixed(2)}² / (2 * ${g.toFixed(1)}) = ${h0.toFixed(2)} + ${(u*u).toFixed(2)} / ${(2*g).toFixed(1)} = ${hMax.toFixed(2)} m</div>
            </div>
        `;
    }
    else if (param === 'u') {
        titleHtml = 'Solving for Initial Speed (u) using Conservation of Energy';
        bodyHtml = `
            <div class="formula-card">
                <h5>Key Concept:</h5>
                <p>At the apex (maximum height h_max), the ball stops (v = 0 m/s), so KE = 0.</p>
                <div class="math-eq">E_start = E_apex => m * g * h₀ + 1/2 * m * u² = m * g * h_max</div>
            </div>

            <div class="working-step">
                <h4>Step 1: Simplify equations</h4>
                <p>Cancel mass (m) from both sides:</p>
                <div class="math-eq">g * h₀ + 1/2 * u² = g * h_max</div>
            </div>

            <div class="working-step">
                <h4>Step 2: Isolate initial velocity u</h4>
                <div class="math-eq">1/2 * u² = g * (h_max - h₀)</div>
                <div class="math-eq">u² = 2 * g * (h_max - h₀)</div>
                <div class="math-eq">u = sqrt(2 * g * (h_max - h₀))</div>
            </div>

            <div class="working-step">
                <h4>Step 3: Substitute values and calculate</h4>
                <p>Given: g = ${g.toFixed(1)} N/kg, h₀ = ${h0.toFixed(2)} m, h_max = ${hMax.toFixed(2)} m:</p>
                <div class="math-eq">u = sqrt(2 * ${g.toFixed(1)} * (${hMax.toFixed(2)} - ${h0.toFixed(2)})) = sqrt(${(2 * g * (hMax - h0)).toFixed(2)}) = ${u.toFixed(2)} m/s</div>
            </div>
        `;
    }

    // Set popup headers and dynamic markup contents
    modal.querySelector('h3').innerHTML = `<i class="fa-solid fa-calculator" style="color: var(--color-gpe)"></i> ${titleHtml}`;
    modalContent.innerHTML = bodyHtml;
    
    // Auto-reveal the hidden parameter once working is viewed
    state.revealedParams[param] = true;
    applyTestModeHides();
    updateTelemetry();
    draw();

    modal.classList.add('active');
}

// Window load init
window.addEventListener('DOMContentLoaded', init);
