// State Variables
let state = {
    angle: 0,
    angularVelocity: 1.0 * 2 * Math.PI,
    turns: 1,
    frequency: 1.0,
    hasIronCore: false,
    peakEMF: 12.0,
    currentEMF: 0,
    isPaused: false
};

let visualAngle = 0; // Visual angle for high frequency visual smoothing

// Canvas Graph References
const canvasGraph = document.getElementById('canvas-graph');
const ctxGraph = canvasGraph.getContext('2d');
const valPeakV = document.getElementById('val-peak-v');
const hudAngle = document.getElementById('hud-angle');
const hudAlert = document.getElementById('hud-alert');

// Control elements
const sliderTurns = document.getElementById('input-turns');
const sliderFrequency = document.getElementById('input-frequency');
const toggleCore = document.getElementById('input-core');

const valTurns = document.getElementById('val-turns');
const valFrequency = document.getElementById('val-frequency');

let voltageHistory = [];
const maxHistoryLength = 200;
let time = 0;

// Three.js Globals
let scene, camera, renderer, controls;
let rotorGroup; // Axle, coil, slip rings
let coilGroup;  // Contains the copper loops
let coreMesh;   // Soft-iron cylinder
let fieldLinesGroup;
let forceArrows = [];
let currentArrows = [];
let bulbGlow;
let bulbMesh;

// Initialize the Application
function init() {
    const container = document.getElementById('animation-section');
    const canvas = document.getElementById('threejs-canvas');
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene Setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07090e);
    scene.fog = new THREE.FogExp2(0x07090e, 0.05);

    // 2. Camera Setup
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(5.5, 3.5, 6.5);

    // 3. Renderer Setup
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 4. Orbit Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 15;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.85);
    dirLight1.position.set(5, 10, 7);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x00f0ff, 0.35); // Accent light
    dirLight2.position.set(-5, -5, -5);
    scene.add(dirLight2);

    // 6. Build the AC Generator Components
    buildGenerator();

    // 7. Attach Input Listeners
    setupInputListeners();

    window.addEventListener('resize', onWindowResize);
    
    // Set initial graph layout size
    resizeGraph();
    
    // Start loop
    animate(0);
}

// Build 3D Elements
function buildGenerator() {
    // Parent group for all rotating elements (axle, coil, slip rings)
    rotorGroup = new THREE.Group();
    scene.add(rotorGroup);

    // --- Axle (Rotating shaft along Z-axis) ---
    const axleGeo = new THREE.CylinderGeometry(0.08, 0.08, 4.8, 16);
    axleGeo.rotateX(Math.PI / 2);
    const axleMat = new THREE.MeshStandardMaterial({ 
        color: 0x8a99ad, 
        metalness: 0.8, 
        roughness: 0.2
    });
    const axle = new THREE.Mesh(axleGeo, axleMat);
    rotorGroup.add(axle);

    // --- Permanent Magnets (N = Left/Red, S = Right/Blue) ---
    const magnetGeo = new THREE.BoxGeometry(1.6, 2.2, 3.5);
    
    // North Magnet (Left, -X)
    const nMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.6, roughness: 0.3, emissive: 0xef4444, emissiveIntensity: 0.15 });
    magnetNorth = new THREE.Mesh(magnetGeo, nMat);
    magnetNorth.position.set(-2.8, 0, 0);
    scene.add(magnetNorth);

    // South Magnet (Right, +X)
    const sMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, metalness: 0.6, roughness: 0.3, emissive: 0x3b82f6, emissiveIntensity: 0.15 });
    magnetSouth = new THREE.Mesh(magnetGeo, sMat);
    magnetSouth.position.set(2.8, 0, 0);
    scene.add(magnetSouth);

    // Labels
    create3DTextLabel("N", new THREE.Vector3(-1.9, 0.7, 0), "#ef4444");
    create3DTextLabel("S", new THREE.Vector3(1.9, 0.7, 0), "#3b82f6");

    // --- Armature Coil (Rotating Loop Group) ---
    coilGroup = new THREE.Group();
    rotorGroup.add(coilGroup);
    rebuildCoilLoops();

    // --- Soft-Iron Cylinder Core (Inside rotorGroup, hidden/revealed) ---
    const coreGeo = new THREE.CylinderGeometry(0.55, 0.55, 1.8, 24);
    coreGeo.rotateX(Math.PI / 2);
    const coreMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.4 });
    coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.set(0, 0, 0.2); // offset along Z
    coreMesh.visible = false;
    rotorGroup.add(coreMesh);

    // --- Two Slip Rings (Coaxial continuous cylinders) ---
    const ringRadius = 0.18;
    const ringHeight = 0.22;
    const ringGeo = new THREE.CylinderGeometry(ringRadius, ringRadius, ringHeight, 24);
    ringGeo.rotateX(Math.PI / 2);
    
    const ringMat = new THREE.MeshStandardMaterial({ 
        color: 0xea580c, 
        metalness: 0.7, 
        roughness: 0.2,
        emissive: 0xea580c,
        emissiveIntensity: 0.2
    });

    slipRing1 = new THREE.Mesh(ringGeo, ringMat);
    slipRing1.position.set(0, 0, 1.2);
    rotorGroup.add(slipRing1);

    slipRing2 = new THREE.Mesh(ringGeo, ringMat);
    slipRing2.position.set(0, 0, 1.6);
    rotorGroup.add(slipRing2);

    // --- Carbon Brushes (Stationary) ---
    const brushGeo = new THREE.BoxGeometry(0.12, 0.12, 0.24);
    const brushMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8, metalness: 0.2 });

    brushLeft = new THREE.Mesh(brushGeo, brushMat);
    brushLeft.position.set(0, -ringRadius - 0.05, 1.2);
    scene.add(brushLeft);

    brushRight = new THREE.Mesh(brushGeo, brushMat);
    brushRight.position.set(0, ringRadius + 0.05, 1.6);
    scene.add(brushRight);

    // --- Stationary External Wires to Bulb ---
    const wireMat = new THREE.LineBasicMaterial({ color: 0x64748b });
    
    const wireLeftGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, -ringRadius - 0.05, 1.2),
        new THREE.Vector3(0, -1.6, 1.2),
        new THREE.Vector3(-0.6, -1.6, 1.4)
    ]);
    scene.add(new THREE.Line(wireLeftGeo, wireMat));

    const wireRightGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, ringRadius + 0.05, 1.6),
        new THREE.Vector3(0, -1.6, 1.6),
        new THREE.Vector3(-0.4, -1.6, 1.4)
    ]);
    scene.add(new THREE.Line(wireRightGeo, wireMat));

    // --- Light Bulb (Output Indicator) ---
    const bulbGroup = new THREE.Group();
    bulbGroup.position.set(-0.5, -1.6, 1.4);
    scene.add(bulbGroup);

    // Socket
    const socketGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.12, 16);
    const socketMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5 });
    const socket = new THREE.Mesh(socketGeo, socketMat);
    bulbGroup.add(socket);

    // Bulb Glass
    const glassGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x475569, transparent: true, opacity: 0.85, roughness: 0.1 });
    bulbMesh = new THREE.Mesh(glassGeo, glassMat);
    bulbMesh.position.y = 0.2;
    bulbGroup.add(bulbMesh);

    // Glow Effect
    const glowGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.0 });
    bulbGlow = new THREE.Mesh(glowGeo, glowMat);
    bulbGlow.position.y = 0.2;
    bulbGroup.add(bulbGlow);

    // --- Magnetic Field Lines ---
    fieldLinesGroup = new THREE.Group();
    scene.add(fieldLinesGroup);
    rebuildFieldLines();

    // --- Vector Arrows (Forces & Current) ---
    createVectors();
}

function rebuildCoilLoops() {
    // Clear old loops
    while (coilGroup.children.length > 0) {
        coilGroup.remove(coilGroup.children[0]);
    }

    const baseW = 0.9;
    const l = 1.1;
    const coilRadius = 0.028;
    const copperMat = new THREE.MeshStandardMaterial({ 
        color: 0xf59e0b, 
        metalness: 0.8, 
        roughness: 0.2,
        emissive: 0xd97706,
        emissiveIntensity: 0.1
    });

    const maxOffset = 0.62;
    const spacing = state.turns > 1 ? maxOffset / (state.turns - 1) : 0;

    for (let t = 0; t < state.turns; t++) {
        // Offset each nested loop slightly inwards
        const offset = t * spacing;
        const w = baseW - offset;
        const points = [
            new THREE.Vector3(-0.16, 0, 1.2), // Connect to slip ring 1
            new THREE.Vector3(-w, 0, 1.2),
            new THREE.Vector3(-w, 0, -l),
            new THREE.Vector3(w, 0, -l),
            new THREE.Vector3(w, 0, 1.6),
            new THREE.Vector3(0.16, 0, 1.6)   // Connect to slip ring 2
        ];
        const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0);
        const tubeGeo = new THREE.TubeGeometry(curve, 64, coilRadius, 8, false);
        const loopMesh = new THREE.Mesh(tubeGeo, copperMat);
        coilGroup.add(loopMesh);
    }
}

function rebuildFieldLines() {
    while (fieldLinesGroup.children.length > 0) {
        fieldLinesGroup.remove(fieldLinesGroup.children[0]);
    }

    const lineMat = new THREE.LineBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.25 });
    
    for (let i = -1.2; i <= 1.2; i += 0.3) {
        const y = i * 0.6;
        let points = [];
        
        if (state.hasIronCore) {
            // Radial configuration: Bending lines towards the center iron core
            const coreRadius = 0.55;
            points.push(new THREE.Vector3(-2.0, y, 0));
            points.push(new THREE.Vector3(-0.9, y * 0.8, 0));
            points.push(new THREE.Vector3(-coreRadius, y * (coreRadius/0.9), 0));
            points.push(new THREE.Vector3(coreRadius, y * (coreRadius/0.9), 0));
            points.push(new THREE.Vector3(0.9, y * 0.8, 0));
            points.push(new THREE.Vector3(2.0, y, 0));
        } else {
            // Straight lines
            points.push(new THREE.Vector3(-2.0, y, 0));
            points.push(new THREE.Vector3(2.0, y, 0));
        }
        
        const curve = new THREE.CatmullRomCurve3(points);
        const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(16));
        const line = new THREE.Line(geo, lineMat);
        fieldLinesGroup.add(line);
    }
}

function createVectors() {
    // Force arrows (Magenta)
    const arrowLeft = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(-0.9, 0, 0), 0.9, 0xec4899, 0.22, 0.11);
    scene.add(arrowLeft);
    forceArrows.push(arrowLeft);

    const arrowRight = new THREE.ArrowHelper(new THREE.Vector3(0, -1, 0), new THREE.Vector3(0.9, 0, 0), 0.9, 0xec4899, 0.22, 0.11);
    scene.add(arrowRight);
    forceArrows.push(arrowRight);

    // Current arrows along the coil sides (Yellow)
    const arrowCoilLeft = new THREE.ArrowHelper(new THREE.Vector3(0, 0, -1), new THREE.Vector3(-0.9, 0, 0.4), 0.8, 0xfbbf24, 0.22, 0.11);
    rotorGroup.add(arrowCoilLeft);
    currentArrows.push(arrowCoilLeft);

    const arrowCoilRight = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0.9, 0, -0.4), 0.8, 0xfbbf24, 0.22, 0.11);
    rotorGroup.add(arrowCoilRight);
    currentArrows.push(arrowCoilRight);
}

// 3D Text Label Helper
function create3DTextLabel(text, position, color) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.font = 'bold 44px sans-serif';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 32, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(mat);
    sprite.position.copy(position);
    sprite.scale.set(0.65, 0.65, 0.65);
    scene.add(sprite);
}

function setupInputListeners() {
    sliderTurns.addEventListener('input', (e) => {
        state.turns = parseInt(e.target.value);
        valTurns.textContent = state.turns + (state.turns === 1 ? " Turn" : " Turns");
        rebuildCoilLoops();
    });

    const freqNotice = document.getElementById('frequency-notice');
    sliderFrequency.addEventListener('input', (e) => {
        state.frequency = parseFloat(e.target.value);
        valFrequency.textContent = state.frequency.toFixed(0) + " Hz";
        state.angularVelocity = state.frequency * 2 * Math.PI;
        if (state.frequency === 50) {
            freqNotice.style.display = 'block';
        } else {
            freqNotice.style.display = 'none';
        }
    });

    toggleCore.addEventListener('change', (e) => {
        state.hasIronCore = e.target.checked;
        coreMesh.visible = state.hasIronCore;
        rebuildFieldLines();
    });
}

function resizeGraph() {
    const parent = canvasGraph.parentElement;
    const width = parent.clientWidth;
    const height = parent.clientHeight || 380;
    const dpr = window.devicePixelRatio || 1;
    
    canvasGraph.width = width * dpr;
    canvasGraph.height = height * dpr;
    canvasGraph.style.width = width + 'px';
    canvasGraph.style.height = height + 'px';
    
    ctxGraph.resetTransform();
    ctxGraph.scale(dpr, dpr);
}

function onWindowResize() {
    const container = document.getElementById('animation-section');
    if (!container) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    
    resizeGraph();
}

// Draw CRO voltage-time graph
function drawGraph() {
    ctxGraph.clearRect(0, 0, canvasGraph.width / (window.devicePixelRatio || 1), canvasGraph.height / (window.devicePixelRatio || 1));
    
    const w = canvasGraph.clientWidth;
    const h = canvasGraph.clientHeight;
    const centerY = h / 2;
    const paddingLeft = 45;
    const paddingRight = 20;
    const graphWidth = w - paddingLeft - paddingRight;
    const calculatedPeak = state.peakEMF;
    const maxVoltageScale = Math.max(80.0, Math.ceil(calculatedPeak / 40.0) * 40.0);
    const verticalRange = h / 2 - 20;

    // Draw Grid Lines and Y-Axis labels at fixed voltage intervals
    ctxGraph.lineWidth = 1;
    const stepVal = maxVoltageScale / 2;
    const intervals = [maxVoltageScale, stepVal, 0, -stepVal, -maxVoltageScale];
    
    intervals.forEach(v => {
        const y = centerY - (v / maxVoltageScale) * verticalRange;
        
        // Horizontal Grid Line
        ctxGraph.strokeStyle = v === 0 ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.04)';
        ctxGraph.beginPath();
        ctxGraph.moveTo(paddingLeft, y);
        ctxGraph.lineTo(w - paddingRight, y);
        ctxGraph.stroke();
        
        // Label on Y-axis
        ctxGraph.fillStyle = 'var(--text-secondary)';
        ctxGraph.font = '10px var(--font-mono)';
        ctxGraph.textAlign = 'right';
        ctxGraph.textBaseline = 'middle';
        let labelText = v > 0 ? `+${v}V` : `${v}V`;
        if (v === 0) labelText = "0V";
        ctxGraph.fillText(labelText, paddingLeft - 6, y);
    });

    // Draw Vertical Grid Lines (Time axis)
    ctxGraph.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    for (let x = paddingLeft + 40; x < w - paddingRight; x += 40) {
        ctxGraph.beginPath();
        ctxGraph.moveTo(x, 10);
        ctxGraph.lineTo(x, h - 10);
        ctxGraph.stroke();
    }

    // Axes lines (Y-axis and X-axis main lines)
    ctxGraph.strokeStyle = 'var(--text-secondary)';
    ctxGraph.lineWidth = 1.5;
    
    // Y-Axis line
    ctxGraph.beginPath();
    ctxGraph.moveTo(paddingLeft, 10);
    ctxGraph.lineTo(paddingLeft, h - 10);
    ctxGraph.stroke();

    // Plot alternating voltage path
    if (voltageHistory.length > 1) {
        ctxGraph.strokeStyle = '#ffffff';
        ctxGraph.lineWidth = 2.2;
        ctxGraph.shadowColor = 'rgba(255, 255, 255, 0.5)';
        ctxGraph.shadowBlur = 6;
        ctxGraph.beginPath();
        
        for (let i = 0; i < voltageHistory.length; i++) {
            const pt = voltageHistory[i];
            const x = paddingLeft + (i / maxHistoryLength) * graphWidth;
            const y = centerY - (pt.voltage / maxVoltageScale) * verticalRange;
            
            if (i === 0) {
                ctxGraph.moveTo(x, y);
            } else {
                ctxGraph.lineTo(x, y);
            }
        }
        ctxGraph.stroke();
        ctxGraph.shadowBlur = 0;
    }

    // Tracer Dot
    if (voltageHistory.length > 0) {
        const lastPt = voltageHistory[voltageHistory.length - 1];
        const x = paddingLeft + ((voltageHistory.length - 1) / maxHistoryLength) * graphWidth;
        const y = centerY - (lastPt.voltage / maxVoltageScale) * verticalRange;
        
        ctxGraph.fillStyle = '#fff';
        ctxGraph.beginPath();
        ctxGraph.arc(x, y, 3.5, 0, 2*Math.PI);
        ctxGraph.fill();
        ctxGraph.strokeStyle = '#ffffff';
        ctxGraph.lineWidth = 1.5;
        ctxGraph.stroke();
    }
}

// Physics & Vectors updates
function updateGenerator(dt) {
    // 1. Update rotation angle
    state.angle = (state.angle + state.angularVelocity * dt) % (2 * Math.PI);
    rotorGroup.rotation.z = state.angle;
    visualAngle = state.angle;

    // 2. EMF = N * B * A * omega * cos(angle)
    // Turns increases voltage linearly. Frequency increases voltage and speed.
    // Soft-iron core concentrates field lines, increasing B by 2.2x
    const coreMultiplier = state.hasIronCore ? 2.2 : 1.0;
    state.peakEMF = 3.2 * state.turns * state.frequency * coreMultiplier;
    state.currentEMF = state.frequency > 0 ? state.peakEMF * Math.cos(state.angle) : 0;

    valPeakV.textContent = state.frequency > 0 ? state.peakEMF.toFixed(0) + " V" : "0.0 V";
    hudAngle.textContent = Math.round(state.angle * 180 / Math.PI) + "°";

    const deg = Math.round(state.angle * 180 / Math.PI) % 180;
    if (state.frequency === 0) {
        hudAlert.style.opacity = "1";
        hudAlert.textContent = "Coil is stationary: No flux change (0V Output)";
    } else if (state.frequency > 20) {
        hudAlert.style.opacity = "1";
        hudAlert.textContent = "High Frequency AC: Smooth alternating current";
    } else if (Math.abs(deg - 90) < 6) {
        hudAlert.style.opacity = "1";
        hudAlert.textContent = "Coil is Vertical: Cutting no flux (0V Output)";
    } else if (Math.abs(deg - 0) < 6 || Math.abs(deg - 180) < 6) {
        hudAlert.style.opacity = "1";
        hudAlert.textContent = "Coil is Horizontal: Max rate of cutting (PEAK Voltage!)";
    } else {
        hudAlert.style.opacity = "0";
    }

    // 3. Update bulb brightness based on EMF intensity (clamped peak)
    const bulbPeak = Math.max(state.peakEMF, 3.2); // avoid division by zero
    const isHighFreq = state.frequency > 15.0;
    const brightness = isHighFreq ? 0.75 : (Math.abs(state.currentEMF) / bulbPeak);
    
    // Scale visual brightness factor with turns and core
    const scalingFactor = isHighFreq ? 1.0 : (state.peakEMF / 10.0);
    const bulbIntensity = Math.min(brightness * scalingFactor, 1.0);

    if (bulbMesh && bulbGlow) {
        bulbMesh.material.color.setHSL(0.12, 0.9, 0.3 + 0.5 * bulbIntensity);
        bulbGlow.material.opacity = bulbIntensity * 0.85;
        // Glow radius grows at higher voltages
        const scaleVal = 0.5 + 0.8 * bulbIntensity;
        bulbGlow.scale.set(scaleVal, scaleVal, scaleVal);
    }

    // 4. Update Vectors
    const motionYDir = Math.cos(visualAngle) > 0 ? 1 : -1;
    
    const w = 0.9;
    const leftPos = new THREE.Vector3(-w, 0, 0).applyAxisAngle(new THREE.Vector3(0, 0, 1), visualAngle);
    const rightPos = new THREE.Vector3(w, 0, 0).applyAxisAngle(new THREE.Vector3(0, 0, 1), visualAngle);

    forceArrows[0].position.copy(leftPos);
    forceArrows[1].position.copy(rightPos);

    if (state.frequency > 0) {
        forceArrows.forEach(a => a.visible = true);
        forceArrows[0].setDirection(new THREE.Vector3(0, -motionYDir, 0));
        forceArrows[1].setDirection(new THREE.Vector3(0, motionYDir, 0));
    } else {
        forceArrows.forEach(a => a.visible = false);
    }

    // Current arrows direction changes polarity based on EMF
    if (Math.abs(state.currentEMF) > 0.5) {
        currentArrows.forEach(a => a.visible = true);
        const currentDir = state.currentEMF > 0 ? 1 : -1;
        
        currentArrows[0].setDirection(new THREE.Vector3(0, 0, currentDir));
        currentArrows[0].position.z = 0.05 - 0.4 * currentDir;

        currentArrows[1].setDirection(new THREE.Vector3(0, 0, -currentDir));
        currentArrows[1].position.z = 0.25 + 0.4 * currentDir;
    } else {
        currentArrows.forEach(a => a.visible = false);
    }
}

// Main Animation Loop
let lastTime = 0;
function animate(timestamp) {
    requestAnimationFrame(animate);

    if (!lastTime) lastTime = timestamp;
    const dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    if (!state.isPaused) {
        const physicsDt = Math.min(dt, 0.1); 
        updateGenerator(physicsDt);

        if (state.frequency > 3.0) {
            // Fill history with dynamic frequency-scaled time base
            voltageHistory = [];
            const step = 0.015 / state.frequency;
            for (let i = 0; i < maxHistoryLength; i++) {
                voltageHistory.push({
                    voltage: state.peakEMF * Math.cos(2 * Math.PI * state.frequency * (time + i * step))
                });
            }
            time += dt;
        } else {
            // Record voltage history sequentially
            voltageHistory.push({ voltage: state.currentEMF });
            if (voltageHistory.length > maxHistoryLength) {
                voltageHistory.shift();
            }
        }
    }

    controls.update();
    renderer.render(scene, camera);
    drawGraph();
}

// Start app
init();
