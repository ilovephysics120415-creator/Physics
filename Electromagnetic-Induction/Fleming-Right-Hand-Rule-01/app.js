// app.js

// Global variables for State Management
const state = {
    motionDir: 'outwards', // 'inwards', 'outwards', 'left', 'right', 'up', 'down' (replacing currentDir)
    fieldDir: 'left',       // 'left', 'right', 'up', 'down', 'inwards', 'outwards'
    flowType: 'conventional',  // 'conventional' or 'electron'
    showField: true,
    showHand: true,
    score: 0,
    testMode: false,
    showCurrentFlow: true // Controlled by challenge mode
};

// Vector mappings
const directionVectors = {
    left: new THREE.Vector3(-1, 0, 0),
    right: new THREE.Vector3(1, 0, 0),
    up: new THREE.Vector3(0, 1, 0),
    down: new THREE.Vector3(0, -1, 0),
    inwards: new THREE.Vector3(0, 0, -1),
    outwards: new THREE.Vector3(0, 0, 1)
};

// UI elements
const elMotionDir = document.getElementById('select-motion-dir');
const elFieldDir = document.getElementById('select-field-dir');
const elFlowType = document.getElementById('toggle-flow-type');
const elShowField = document.getElementById('show-field-lines');
const elShowHand = document.getElementById('show-hand-model');
const elResetCam = document.getElementById('reset-cam');
const elToggleTestMode = document.getElementById('toggle-test-mode');
const elStatusField = document.getElementById('status-field');
const elStatusFlow = document.getElementById('status-flow');
const elFlowWarningBanner = document.getElementById('flow-warning-banner');

// Challenge Elements
const elChallengePrompt = document.getElementById('challenge-prompt');
const elChallengeFeedback = document.getElementById('challenge-feedback');
const elNextChallenge = document.getElementById('next-challenge');
const elScoreBadge = document.getElementById('score-badge');
const elChoiceBtns = document.querySelectorAll('.btn-choice');

// Three.js Variables
let scene, camera, renderer, controls;
let magnetN, magnetS;
let wire;
let wireSymbolsGroup;
let fieldLines = [];
let chargeCarriers = [];
let fieldArrow, currentArrow;
let forceIndicatorGroup; // Green force indicator group
let handGroup;
let wireDeflection = new THREE.Vector3();
let targetWireDeflection = new THREE.Vector3();

// Setup Scene
function initThree() {
    const container = document.getElementById('canvas-container');
    
    // Scene
    scene = new THREE.Scene();
    
    // Camera
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    resetCameraPosition();

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 4;
    controls.maxDistance = 20;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight1.position.set(5, 10, 7);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x00d2ff, 0.3); // Neon blue fill
    dirLight2.position.set(-10, -2, -5);
    scene.add(dirLight2);

    // Build components
    buildGridFloor();
    buildWire();
    buildHand();
    buildVectors();
    
    // Force indicator setup
    forceIndicatorGroup = new THREE.Group();
    scene.add(forceIndicatorGroup);
    
    // Initial update of components structure
    updateSetup();

    // Event listeners
    window.addEventListener('resize', onWindowResize);
    
    // Start loop
    animate();
}

function resetCameraPosition() {
    // Standard flat 2D worksheet perspective looking down the Z axis
    camera.position.set(0, 0, 9);
    camera.lookAt(0, 0, 0);
    if (controls) {
        controls.target.set(0, 0, 0);
    }
}

function buildGridFloor() {
    const gridHelper = new THREE.GridHelper(20, 20, 0x00d2ff, 0x11111a);
    gridHelper.position.y = -3.5;
    scene.add(gridHelper);
}

// Wire shell and charge carriers setup
function buildWire() {
    // Base wire shell cylinder
    const wireGeo = new THREE.CylinderGeometry(0.12, 0.12, 10, 16);
    
    const wireMat = new THREE.MeshStandardMaterial({
        color: 0x888899,
        transparent: true,
        opacity: 0.4,
        roughness: 0.1,
        metalness: 0.9,
    });
    wire = new THREE.Mesh(wireGeo, wireMat);
    scene.add(wire);

    // Group for end-on symbols (X or Dot)
    wireSymbolsGroup = new THREE.Group();
    scene.add(wireSymbolsGroup);

    // Create charge carrier particles (dots)
    const particleCount = 18;
    const particleGeo = new THREE.SphereGeometry(0.08, 8, 8);
    
    for (let i = 0; i < particleCount; i++) {
        const particleMat = new THREE.MeshBasicMaterial({ color: 0xff4d4d });
        const particle = new THREE.Mesh(particleGeo, particleMat);
        scene.add(particle);
        chargeCarriers.push(particle);
    }
}

// Helper to create 3D cross (X) symbol for conventional current (red/purple)
function create3DInSymbol(scale = 0.25) {
    const group = new THREE.Group();
    const material = new THREE.MeshBasicMaterial({ color: 0xff4d4d });
    
    // Circle outline
    const ringGeo = new THREE.TorusGeometry(scale * 1.2, scale * 0.15, 8, 24);
    const ring = new THREE.Mesh(ringGeo, material);
    group.add(ring);

    // Cross bars
    const barGeo = new THREE.CylinderGeometry(scale * 0.12, scale * 0.12, scale * 1.8, 8);
    barGeo.rotateZ(Math.PI / 4);
    const bar1 = new THREE.Mesh(barGeo, material);
    group.add(bar1);

    const bar2 = bar1.clone();
    bar2.rotateZ(Math.PI / 2);
    group.add(bar2);

    return group;
}

// Helper to create 3D dot symbol for conventional current (red/purple)
function create3DOutSymbol(scale = 0.25) {
    const group = new THREE.Group();
    const material = new THREE.MeshBasicMaterial({ color: 0xff4d4d });
    
    // Circle outline
    const ringGeo = new THREE.TorusGeometry(scale * 1.2, scale * 0.15, 8, 24);
    const ring = new THREE.Mesh(ringGeo, material);
    group.add(ring);

    // Center dot
    const dotGeo = new THREE.SphereGeometry(scale * 0.45, 8, 8);
    const dot = new THREE.Mesh(dotGeo, material);
    group.add(dot);

    return group;
}

// Dynamically generate field lines based on direction
function buildFieldLines() {
    // Clear existing
    fieldLines.forEach(line => scene.remove(line));
    fieldLines = [];

    if (!state.showField) return;

    const dirKey = state.fieldDir;
    const direction = directionVectors[dirKey].clone();

    if (dirKey === 'inwards' || dirKey === 'outwards') {
        const size = 3.0;
        const positions = [-1.5, 0, 1.5];
        
        positions.forEach(x => {
            positions.forEach(y => {
                // Skip center where the wire is if wire is end-on
                const inducedValForField = calculateInducedCurrentVector();
                const inducedDirKeyForField = getDirectionKey(inducedValForField);
                if (Math.abs(x) < 0.1 && Math.abs(y) < 0.1 && (inducedDirKeyForField === 'inwards' || inducedDirKeyForField === 'outwards')) {
                    return;
                }

                let symbol;
                if (dirKey === 'inwards') {
                    symbol = new THREE.Group();
                    const mat = new THREE.LineBasicMaterial({ color: 0x00d2ff, linewidth: 2 });
                    
                    const points1 = [new THREE.Vector3(-0.15, -0.15, 0), new THREE.Vector3(0.15, 0.15, 0)];
                    const geo1 = new THREE.BufferGeometry().setFromPoints(points1);
                    symbol.add(new THREE.Line(geo1, mat));

                    const points2 = [new THREE.Vector3(-0.15, 0.15, 0), new THREE.Vector3(0.15, -0.15, 0)];
                    const geo2 = new THREE.BufferGeometry().setFromPoints(points2);
                    symbol.add(new THREE.Line(geo2, mat));
                } else {
                    const geo = new THREE.SphereGeometry(0.08, 8, 8);
                    const mat = new THREE.MeshBasicMaterial({ color: 0x00d2ff });
                    symbol = new THREE.Mesh(geo, mat);
                }

                symbol.position.set(x, y, 0);
                scene.add(symbol);
                fieldLines.push(symbol);
            });
        });
    } else {
        const offsetAxis = (dirKey === 'left' || dirKey === 'right') ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(1, 0, 0);
        const startOffset = -1.6;
        const length = 5.0;

        for (let i = 0; i < 5; i++) {
            const currentOffset = startOffset + 0.8 * i;
            const origin = offsetAxis.clone().multiplyScalar(currentOffset);
            
            origin.addScaledVector(direction, -length / 2);

            const arrow = new THREE.ArrowHelper(
                direction,
                origin,
                length,
                0x00d2ff,
                0.4,
                0.25
            );
            arrow.line.material.linewidth = 2;
            arrow.line.material.transparent = true;
            arrow.line.material.opacity = 0.7;

            scene.add(arrow);
            fieldLines.push(arrow);
        }
    }
}

// Build 3D vector indicator arrows projecting from wire center
function buildVectors() {
    // Field (B) Arrow - Greenish Blue
    const dirB = new THREE.Vector3(1, 0, 0);
    fieldArrow = new THREE.ArrowHelper(dirB, new THREE.Vector3(0, 0.5, 0), 1.8, 0x00d2ff, 0.4, 0.25);
    scene.add(fieldArrow);

    // Induced Current (I) Arrow - Red
    const dirI = new THREE.Vector3(0, 0, -1);
    currentArrow = new THREE.ArrowHelper(dirI, new THREE.Vector3(0, 0.5, 0), 1.8, 0xff4d4d, 0.4, 0.25);
    scene.add(currentArrow);
}

// Rebuild green force/motion indicators based on direction (No Outer Circles)
function updateForceIndicator() {
    // Clear existing
    while (forceIndicatorGroup.children.length > 0) {
        forceIndicatorGroup.remove(forceIndicatorGroup.children[0]);
    }

    const dirKey = state.motionDir;
    const color = 0x00ff66; // Bright Green

    if (dirKey === 'inwards') {
        // Green Cross (No outer circle)
        const crossGroup = new THREE.Group();
        const material = new THREE.MeshBasicMaterial({ color: color });
        const barGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.6, 8);
        
        const bar1 = new THREE.Mesh(barGeo, material);
        bar1.rotation.z = Math.PI / 4;
        crossGroup.add(bar1);
        
        const bar2 = new THREE.Mesh(barGeo, material);
        bar2.rotation.z = -Math.PI / 4;
        crossGroup.add(bar2);
        
        crossGroup.position.copy(wireDeflection);
        forceIndicatorGroup.add(crossGroup);
    } else if (dirKey === 'outwards') {
        // Green Dot (No outer circle)
        const dotGeo = new THREE.SphereGeometry(0.12, 16, 16);
        const material = new THREE.MeshBasicMaterial({ color: color });
        const dot = new THREE.Mesh(dotGeo, material);
        
        dot.position.copy(wireDeflection);
        forceIndicatorGroup.add(dot);
    } else {
        // Planar directions -> Green Arrow Helper
        const dirVec = directionVectors[dirKey].clone();
        const arrow = new THREE.ArrowHelper(dirVec, new THREE.Vector3(0, 0, 0), 1.8, color, 0.4, 0.25);
        arrow.position.copy(wireDeflection);
        forceIndicatorGroup.add(arrow);
    }
}

function updateVectors() {
    const currentPos = wireDeflection.clone();
    
    // 1. Field Arrow
    const fieldVec = directionVectors[state.fieldDir].clone();
    fieldArrow.setDirection(fieldVec);
    fieldArrow.position.copy(currentPos);
    fieldArrow.visible = state.showField;

    // 2. Induced Current Arrow
    const isConventional = state.flowType === 'conventional';
    const inducedVec = calculateInducedCurrentVector();
    
    // If electron flow, flow is opposite to conventional current direction
    const arrowVec = isConventional ? inducedVec.clone() : inducedVec.clone().negate();
    currentArrow.setDirection(arrowVec);
    currentArrow.position.copy(currentPos);
    
    // Only show current arrow if flow visibility is allowed
    currentArrow.visible = state.showCurrentFlow;
    
    // Color depends on flow type
    if (isConventional) {
        currentArrow.line.material.color.setHex(0xff4d4d);
        currentArrow.cone.material.color.setHex(0xff4d4d);
    } else {
        currentArrow.line.material.color.setHex(0xd500f9);
        currentArrow.cone.material.color.setHex(0xd500f9);
    }
}

// Helper to get direction key matching a 3D vector
function getDirectionKey(vector) {
    for (const key in directionVectors) {
        if (directionVectors[key].distanceTo(vector) < 0.01) {
            return key;
        }
    }
    return 'up'; // Fallback
}

// Fleming's Right-Hand Rule calculation: I = v x B
function calculateInducedCurrentVector() {
    const v = directionVectors[state.motionDir].clone();
    const B = directionVectors[state.fieldDir].clone();
    
    return new THREE.Vector3().crossVectors(v, B);
}

// Procedural 3D hand model (Palm & Wrist ONLY)
function buildHand() {
    handGroup = new THREE.Group();
    // Mirror the mesh coordinates horizontally to turn a Left Hand into a Right Hand
    handGroup.scale.set(-1, 1, 1);

    const handMat = new THREE.MeshStandardMaterial({
        color: 0x334466,
        roughness: 0.4,
        metalness: 0.7,
        transparent: true,
        opacity: 0.85
    });

    // Palm / Back of hand
    const palmGeo = new THREE.BoxGeometry(0.8, 0.8, 0.4);
    const palm = new THREE.Mesh(palmGeo, handMat);
    palm.position.set(0, 0, 0);
    handGroup.add(palm);

    // Wrist / Cuff
    const wristGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.6, 12);
    const wrist = new THREE.Mesh(wristGeo, handMat);
    wrist.position.set(0, -0.7, 0);
    handGroup.add(wrist);

    scene.add(handGroup);
    updateHandTransform();
}

// Rotates the hand palm to align with standard right-hand rule coordinates
function updateHandTransform() {
    handGroup.visible = state.showHand;
    if (!state.showHand) return;

    // Position hand slightly offset from wire along the current direction
    const I = calculateInducedCurrentVector();
    const offset = I.clone().normalize().multiplyScalar(-0.8);
    handGroup.position.copy(wireDeflection).add(offset);

    // Rotate palm to face active directions
    const v = directionVectors[state.motionDir];
    const B = directionVectors[state.fieldDir];
    
    // Align Basis: X with Field, Y with Motion, Z with Conventional Current
    const matrix = new THREE.Matrix4();
    matrix.makeBasis(B, v, I);
    handGroup.rotation.setFromRotationMatrix(matrix);
}

// Re-orientates all physical structures (magnets, wire orientation, particles distribution)
function updateSetup() {
    const inducedVal = calculateInducedCurrentVector();
    const inducedDirKey = getDirectionKey(inducedVal);
    const wireVector = directionVectors[inducedDirKey];

    // --- 2. Orient Wire along Induced Current Direction ---
    wire.rotation.set(0, 0, 0);
    
    if (inducedDirKey === 'left' || inducedDirKey === 'right') {
        wire.rotation.z = Math.PI / 2;
    } else if (inducedDirKey === 'inwards' || inducedDirKey === 'outwards') {
        wire.rotation.x = Math.PI / 2;
    }

    // Remove old symbols from wire ends
    while (wireSymbolsGroup.children.length > 0) {
        wireSymbolsGroup.remove(wireSymbolsGroup.children[0]);
    }

    // Add conventional induced current 3D indicators at wire ends if looking end-on
    if ((inducedDirKey === 'inwards' || inducedDirKey === 'outwards') && state.showCurrentFlow) {
        const isCurrentInward = inducedVal.z < 0;

        const symbolIn = create3DInSymbol(0.35);
        const symbolOut = create3DOutSymbol(0.35);

        const sym1 = isCurrentInward ? symbolIn : symbolOut;
        sym1.position.set(0, 0, 2.5);
        wireSymbolsGroup.add(sym1);

        const sym2 = sym1.clone();
        sym2.position.set(0, 0, -2.5);
        wireSymbolsGroup.add(sym2);
    }

    // --- 3. Re-distribute Charge Carriers ---
    const particleCount = chargeCarriers.length;
    for (let i = 0; i < particleCount; i++) {
        const posVal = -4.5 + (9 / (particleCount - 1)) * i;
        const particle = chargeCarriers[i];
        
        particle.position.copy(wireVector).multiplyScalar(posVal);
    }

    // --- 4. Rebuild static field lines ---
    buildFieldLines();
    
    // --- 5. Update force/motion indicator shape ---
    updateForceIndicator();
}

// Particle flow simulation along the Induced Current direction
function animateParticles(delta) {
    const inducedVec = calculateInducedCurrentVector();
    const inducedDirKey = getDirectionKey(inducedVec);
    const wireVector = directionVectors[inducedDirKey];
    const isConventional = state.flowType === 'conventional';
    
    // Speed of flowing charge carriers
    const speed = 4.0;
    
    // Conventional current flows along the wireVector axis; electron flow goes opposite
    const flowDirection = isConventional ? 1 : -1;

    chargeCarriers.forEach(particle => {
        // Hide particles if current flow is hidden
        particle.visible = state.showCurrentFlow;
        
        if (state.showCurrentFlow) {
            const axisProj = particle.position.dot(wireVector);
            let newProj = axisProj + flowDirection * speed * delta;

            // Wrap around boundaries
            if (newProj > 4.5) {
                newProj = -4.5;
            } else if (newProj < -4.5) {
                newProj = 4.5;
            }

            particle.position.copy(wireVector).multiplyScalar(newProj).add(wireDeflection);
        }

        // Update colors based on conventional (Red) or electron (Purple)
        if (isConventional) {
            particle.material.color.setHex(0xff4d4d);
        } else {
            particle.material.color.setHex(0xd500f9);
        }
    });
}

// Animation loop
let lastTime = 0;
function animate(time) {
    requestAnimationFrame(animate);
    
    const delta = (time - lastTime) / 1000;
    lastTime = time;

    // Elastic wire deflection to show physical motion
    const motionDirection = directionVectors[state.motionDir].clone();
    targetWireDeflection.copy(motionDirection).multiplyScalar(0.4); 
    
    // Damp deflection
    wireDeflection.lerp(targetWireDeflection, 0.15);
    wire.position.copy(wireDeflection);
    wireSymbolsGroup.position.copy(wireDeflection);

    // Update force indicator positions in real-time
    if (forceIndicatorGroup) {
        forceIndicatorGroup.children.forEach(child => {
            child.position.copy(wireDeflection);
        });
    }

    // Update particles
    animateParticles(delta);

    // Update helpers
    updateVectors();
    updateHandTransform();

    // Render scene
    controls.update();
    renderer.render(scene, camera);
}

function onWindowResize() {
    const container = document.getElementById('canvas-container');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// --- UI Interaction Event Listeners ---

elMotionDir.addEventListener('change', (e) => {
    state.motionDir = e.target.value;
    updateSetup();
});

elFieldDir.addEventListener('change', (e) => {
    state.fieldDir = e.target.value;
    elStatusField.textContent = state.fieldDir.charAt(0).toUpperCase() + state.fieldDir.slice(1);
    updateSetup();
});

elFlowType.addEventListener('change', (e) => {
    state.flowType = e.target.checked ? 'electron' : 'conventional';
    elStatusFlow.textContent = state.flowType === 'conventional' ? 'Conventional' : 'Electron Flow';
    elFlowWarningBanner.textContent = state.flowType === 'conventional' ? '⚠️ Flow: Conventional Current' : '⚠️ Flow: Electron Flow';
    updateSetup();
});

elShowField.addEventListener('change', (e) => {
    state.showField = e.target.checked;
    buildFieldLines();
});

elShowHand.addEventListener('change', (e) => {
    state.showHand = e.target.checked;
});

elResetCam.addEventListener('click', () => {
    resetCameraPosition();
});

function setControlsDisabled(disabled) {
    elMotionDir.disabled = disabled;
    elFieldDir.disabled = disabled;
    elFlowType.disabled = disabled;
    elShowField.disabled = disabled;
    elShowHand.disabled = disabled;
    elResetCam.disabled = disabled;
    
    const sidebar = document.getElementById('controls-sidebar');
    if (disabled) {
        sidebar.classList.add('controls-locked');
    } else {
        sidebar.classList.remove('controls-locked');
    }
}

elToggleTestMode.addEventListener('click', () => {
    state.testMode = !state.testMode;
    setControlsDisabled(state.testMode);
    if (state.testMode) {
        elToggleTestMode.innerHTML = '<i class="fa-solid fa-lock"></i> Test Mode: ON';
        elToggleTestMode.classList.add('btn-primary');
        elToggleTestMode.classList.remove('btn-secondary');
        
        resetCameraPosition();
        if (controls) {
            controls.enabled = false;
        }
    } else {
        elToggleTestMode.innerHTML = '<i class="fa-solid fa-lock-open"></i> Test Mode: OFF';
        elToggleTestMode.classList.remove('btn-primary');
        elToggleTestMode.classList.add('btn-secondary');
        
        if (controls) {
            controls.enabled = true;
        }
    }
});


// --- Gamified Challenge Mode (24 configurations) ---
// Base answers defined for conventional current direction
const challenges = [
    // Motion Outwards (towards camera)
    { motion: 'outwards', field: 'left', answer: 'down', prompt: 'Motion: Out of Screen ⊙<br>Field: Left ←<br>Predict Induced Current direction:' },
    { motion: 'outwards', field: 'right', answer: 'up', prompt: 'Motion: Out of Screen ⊙<br>Field: Right →<br>Predict Induced Current direction:' },
    { motion: 'outwards', field: 'up', answer: 'left', prompt: 'Motion: Out of Screen ⊙<br>Field: Up ↑<br>Predict Induced Current direction:' },
    { motion: 'outwards', field: 'down', answer: 'right', prompt: 'Motion: Out of Screen ⊙<br>Field: Down ↓<br>Predict Induced Current direction:' },

    // Motion Inwards (into screen)
    { motion: 'inwards', field: 'left', answer: 'up', prompt: 'Motion: Into Screen ⊗<br>Field: Left ←<br>Predict Induced Current direction:' },
    { motion: 'inwards', field: 'right', answer: 'down', prompt: 'Motion: Into Screen ⊗<br>Field: Right →<br>Predict Induced Current direction:' },
    { motion: 'inwards', field: 'up', answer: 'right', prompt: 'Motion: Into Screen ⊗<br>Field: Up ↑<br>Predict Induced Current direction:' },
    { motion: 'inwards', field: 'down', answer: 'left', prompt: 'Motion: Into Screen ⊗<br>Field: Down ↓<br>Predict Induced Current direction:' },

    // Motion Left
    { motion: 'left', field: 'up', answer: 'inwards', prompt: 'Motion: Left ←<br>Field: Up ↑<br>Predict Induced Current direction:' },
    { motion: 'left', field: 'down', answer: 'outwards', prompt: 'Motion: Left ←<br>Field: Down ↓<br>Predict Induced Current direction:' },
    { motion: 'left', field: 'outwards', answer: 'up', prompt: 'Motion: Left ←<br>Field: Out of Screen ⊙<br>Predict Induced Current direction:' },
    { motion: 'left', field: 'inwards', answer: 'down', prompt: 'Motion: Left ←<br>Field: Into Screen ⊗<br>Predict Induced Current direction:' },

    // Motion Right
    { motion: 'right', field: 'up', answer: 'outwards', prompt: 'Motion: Right →<br>Field: Up ↑<br>Predict Induced Current direction:' },
    { motion: 'right', field: 'down', answer: 'inwards', prompt: 'Motion: Right →<br>Field: Down ↓<br>Predict Induced Current direction:' },
    { motion: 'right', field: 'outwards', answer: 'down', prompt: 'Motion: Right →<br>Field: Out of Screen ⊙<br>Predict Induced Current direction:' },
    { motion: 'right', field: 'inwards', answer: 'up', prompt: 'Motion: Right →<br>Field: Into Screen ⊗<br>Predict Induced Current direction:' },

    // Motion Up
    { motion: 'up', field: 'left', answer: 'outwards', prompt: 'Motion: Up ↑<br>Field: Left ←<br>Predict Induced Current direction:' },
    { motion: 'up', field: 'right', answer: 'inwards', prompt: 'Motion: Up ↑<br>Field: Right →<br>Predict Induced Current direction:' },
    { motion: 'up', field: 'outwards', answer: 'right', prompt: 'Motion: Up ↑<br>Field: Out of Screen ⊙<br>Predict Induced Current direction:' },
    { motion: 'up', field: 'inwards', answer: 'left', prompt: 'Motion: Up ↑<br>Field: Into Screen ⊗<br>Predict Induced Current direction:' },

    // Motion Down
    { motion: 'down', field: 'left', answer: 'inwards', prompt: 'Motion: Down ↓<br>Field: Left ←<br>Predict Induced Current direction:' },
    { motion: 'down', field: 'right', answer: 'outwards', prompt: 'Motion: Down ↓<br>Field: Right →<br>Predict Induced Current direction:' },
    { motion: 'down', field: 'outwards', answer: 'left', prompt: 'Motion: Down ↓<br>Field: Out of Screen ⊙<br>Predict Induced Current direction:' },
    { motion: 'down', field: 'inwards', answer: 'right', prompt: 'Motion: Down ↓<br>Field: Into Screen ⊗<br>Predict Induced Current direction:' }
];

let currentChallengeIndex = 0;

function getExpectedAnswer(challenge) {
    const isConventional = state.flowType === 'conventional';
    if (isConventional) return challenge.answer;
    
    // Reverse direction if electron flow is active
    const opposites = {
        up: 'down',
        down: 'up',
        left: 'right',
        right: 'left',
        inwards: 'outwards',
        outwards: 'inwards'
    };
    return opposites[challenge.answer];
}

function loadChallenge() {
    elChoiceBtns.forEach(btn => {
        btn.className = 'btn btn-choice';
    });
    elChallengeFeedback.textContent = '';
    elNextChallenge.style.display = 'none';

    // Hide induced current flow on new challenge
    state.showCurrentFlow = false;

    // Pick random challenge
    let newIndex = currentChallengeIndex;
    while (newIndex === currentChallengeIndex) {
        newIndex = Math.floor(Math.random() * challenges.length);
    }
    currentChallengeIndex = newIndex;

    const challenge = challenges[currentChallengeIndex];
    elChallengePrompt.innerHTML = challenge.prompt;

    // Apply to simulation state
    state.motionDir = challenge.motion;
    state.fieldDir = challenge.field;

    // Sync select dropdowns
    elMotionDir.value = challenge.motion;
    elFieldDir.value = challenge.field;
    
    elStatusField.textContent = state.fieldDir.charAt(0).toUpperCase() + state.fieldDir.slice(1);
    
    if (scene) {
        updateSetup();
        resetCameraPosition(); // Snap to 2D view for worksheet alignment
        setControlsDisabled(state.testMode);
        if (state.testMode && controls) {
            controls.enabled = false;
        }
    }
}

elChoiceBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        if (elNextChallenge.style.display === 'block') return;

        const selectedAnswer = btn.getAttribute('data-answer');
        const challenge = challenges[currentChallengeIndex];
        const correctAnswer = getExpectedAnswer(challenge);

        // Show induced current flow on answer submission
        state.showCurrentFlow = true;
        updateSetup();

        if (selectedAnswer === correctAnswer) {
            btn.classList.add('selected-correct');
            elChallengeFeedback.textContent = '🎉 CORRECT! induced current is ' + correctAnswer.toUpperCase().replace('INWARDS', 'INTO SCREEN').replace('OUTWARDS', 'OUT OF SCREEN') + '.';
            elChallengeFeedback.className = 'feedback-text correct';
            state.score += 10;
        } else {
            btn.classList.add('selected-incorrect');
            elChallengeFeedback.textContent = '❌ INCORRECT. Re-align your Right Hand and try again!';
            elChallengeFeedback.className = 'feedback-text incorrect';
            state.score = Math.max(0, state.score - 5);
            
            // Highlight correct choice
            elChoiceBtns.forEach(b => {
                if (b.getAttribute('data-answer') === correctAnswer) {
                    b.classList.add('selected-correct');
                }
            });
        }
        
        elScoreBadge.textContent = 'Score: ' + state.score;
        elNextChallenge.style.display = 'block';
    });
});

elNextChallenge.addEventListener('click', loadChallenge);

// Initialize everything on load
window.addEventListener('DOMContentLoaded', () => {
    initThree();
    loadChallenge();
});
