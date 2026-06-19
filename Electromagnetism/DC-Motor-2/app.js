// 3D DC Motor Simulation
// Singapore O-Level Physics Syllabus 6091

// State Variables
let state = {
    angle: 0,
    angularVelocity: 0,
    current: 1.5, // Amperes
    turns: 1,     // 1 to 4
    fieldStrength: 1.0, // Tesla
    hasIronCore: false,
    torque: 0,
    isPaused: false,
    speedMultiplier: 1.0,
    resistance: 1.0
};

// Physics Constants
const INERTIA_BASE = 0.05;
const FRICTION = 0.02;
const FIELD_LINE_COUNT = 15;
const TIME_SCALE = 0.15; // Slow down the simulation (15% speed) for O-level observation

// Three.js Globals
let scene, camera, renderer, controls;
let raycaster, mouse;
let interactiveObjects = [];
let hoverObject = null;

// Mesh references for animation/update
let rotorGroup; // Group containing coil, commutator rings, and axle (rotates)
let coilGroup;  // Contains the copper loops
let coreMesh;   // Soft-iron cylinder
let fieldLinesGroup;
let forceArrows = [];
let currentArrows = [];
let batteryGroup;
let brushLeft, brushRight;
let commutatorRing1, commutatorRing2;
let magnetNorth, magnetSouth;
let rheostatMesh, rheostatCollar;
let wireRightLine;

// Initialize the Application
function init() {
    const container = document.getElementById('animation-section');
    const canvas = document.getElementById('threejs-canvas');
    const width = container.clientWidth || window.innerWidth * 0.75;
    const height = container.clientHeight || (window.innerHeight - 150);

    // 1. Scene Setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0b10);
    scene.fog = new THREE.FogExp2(0x0a0b10, 0.04);

    // 2. Camera Setup
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(6, 4, 8);

    // 3. Renderer Setup
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 4. Orbit Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.1; // Limit looking underneath too much
    controls.minDistance = 3;
    controls.maxDistance = 20;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight1.position.set(5, 10, 7);
    dirLight1.castShadow = true;
    dirLight1.shadow.mapSize.width = 1024;
    dirLight1.shadow.mapSize.height = 1024;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x00f0ff, 0.3); // Cyberpunk accent light
    dirLight2.position.set(-5, -5, -5);
    scene.add(dirLight2);

    // 6. Build the DC Motor Components
    buildMotor();

    // 7. Raycasting & Interaction Setup
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onClick);
    document.getElementById('btn-play-pause').addEventListener('click', togglePlayPause);
    
    // Polarity Reverse Click Handler
    document.getElementById('btn-toggle-polarity').addEventListener('click', () => {
        state.current = -state.current;
        updateHUD();
        triggerPopEffect(new THREE.Vector3(0, -1.8, 1.6));
    });

    // Speed Slider Input Handler
    document.getElementById('slider-time-scale').addEventListener('input', (e) => {
        state.speedMultiplier = parseFloat(e.target.value);
        document.getElementById('val-time-scale').innerText = `${state.speedMultiplier.toFixed(1)}x`;
    });

    // Rheostat Resistance Slider Input Handler
    document.getElementById('slider-resistance').addEventListener('input', (e) => {
        state.resistance = parseFloat(e.target.value);
        document.getElementById('val-resistance').innerHTML = `${state.resistance.toFixed(1)} &Omega;`;
        
        // Ohm's Law: I = V / R. V = 1.5 V
        const currentSign = Math.sign(state.current);
        state.current = currentSign * (1.5 / state.resistance);

        updateCollarPosition();
        updateRheostatWire();
        updateHUD();
    });

    document.getElementById('quiz-submit-btn').addEventListener('click', checkQuizAnswers);

    // 8. Start Animation Loop
    animate();
}

// Build 3D Elements
function buildMotor() {
    // Parent group for all rotating elements (axle, coil, commutator, core)
    rotorGroup = new THREE.Group();
    scene.add(rotorGroup);

    // --- Axle (Rotation axis along Z) ---
    const axleGeo = new THREE.CylinderGeometry(0.1, 0.1, 4.5, 16);
    axleGeo.rotateX(Math.PI / 2);
    const axleMat = new THREE.MeshStandardMaterial({ 
        color: 0x8a99ad, 
        metalness: 0.2, 
        roughness: 0.4,
        emissive: 0x4a5568,
        emissiveIntensity: 0.1
    });
    const axle = new THREE.Mesh(axleGeo, axleMat);
    rotorGroup.add(axle);

    // --- Permanent Magnets (N = Left/Red, S = Right/Blue) ---
    const magnetGeo = new THREE.BoxGeometry(1.8, 2.5, 4);
    
    // North Magnet (Left, -X)
    const nMat = new THREE.MeshStandardMaterial({ color: 0xff3366, metalness: 0.5, roughness: 0.3, emissive: 0xff3366, emissiveIntensity: 0.2 });
    magnetNorth = new THREE.Mesh(magnetGeo, nMat);
    magnetNorth.position.set(-3.2, 0, 0);
    magnetNorth.userData = { type: 'magnet' };
    scene.add(magnetNorth);
    interactiveObjects.push(magnetNorth);

    // South Magnet (Right, +X)
    const sMat = new THREE.MeshStandardMaterial({ color: 0x0066ff, metalness: 0.5, roughness: 0.3, emissive: 0x0066ff, emissiveIntensity: 0.2 });
    magnetSouth = new THREE.Mesh(magnetGeo, sMat);
    magnetSouth.position.set(3.2, 0, 0);
    magnetSouth.userData = { type: 'magnet' };
    scene.add(magnetSouth);
    interactiveObjects.push(magnetSouth);

    // Magnet Labels
    create3DTextLabel("N", new THREE.Vector3(-2.2, 0.8, 0), "#ff3366");
    create3DTextLabel("S", new THREE.Vector3(2.2, 0.8, 0), "#0066ff");

    // --- Armature Coil (Rotating Group) ---
    coilGroup = new THREE.Group();
    rotorGroup.add(coilGroup);
    rebuildCoilLoops();

    // --- Soft-Iron Cylinder Core (Inside rotorGroup but optional scale/visibility) ---
    const coreGeo = new THREE.CylinderGeometry(0.7, 0.7, 2.4, 32);
    coreGeo.rotateX(Math.PI / 2);
    const coreMat = new THREE.MeshStandardMaterial({ 
        color: 0x334155, 
        metalness: 0.8, 
        roughness: 0.4,
        bumpScale: 0.05
    });
    coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.userData = { type: 'core' };
    coreMesh.scale.set(0.001, 0.001, 0.001); // Start hidden/removed
    rotorGroup.add(coreMesh);
    interactiveObjects.push(coreMesh);

    // --- Split-Ring Commutator ---
    // Two half-cylinders around the axle at the front (+Z)
    const commGroup = new THREE.Group();
    commGroup.position.set(0, 0, 1.6);
    rotorGroup.add(commGroup);

        const ringRadius = 0.22;
    const ringHeight = 0.5;
    // Semicircle geometries with a wider visual gap (20 degrees)
    const gapAngle = 0.35; // radians (approx 20 degrees)
    const ringGeo1 = new THREE.CylinderGeometry(ringRadius, ringRadius, ringHeight, 16, 1, true, gapAngle, Math.PI - 2 * gapAngle);
    ringGeo1.rotateX(Math.PI / 2);
    const ringGeo2 = new THREE.CylinderGeometry(ringRadius, ringRadius, ringHeight, 16, 1, true, Math.PI + gapAngle, Math.PI - 2 * gapAngle);
    ringGeo2.rotateX(Math.PI / 2);

    const commMat = new THREE.MeshStandardMaterial({ 
        color: 0x39ff14, // Bright green color
        metalness: 0.1, 
        roughness: 0.3, 
        emissive: 0x39ff14,
        emissiveIntensity: 0.3,
        side: THREE.DoubleSide 
    });

    commutatorRing1 = new THREE.Mesh(ringGeo1, commMat);
    commutatorRing2 = new THREE.Mesh(ringGeo2, commMat);
    commutatorRing1.userData = { type: 'commutator' };
    commutatorRing2.userData = { type: 'commutator' };

    commGroup.add(commutatorRing1);
    commGroup.add(commutatorRing2);
    interactiveObjects.push(commutatorRing1, commutatorRing2);

    // --- Carbon Brushes (Stationary, Left & Right touching commutator) ---
    const brushGeo = new THREE.BoxGeometry(0.15, 0.15, 0.4);
    const brushMat = new THREE.MeshStandardMaterial({ color: 0x1a202c, roughness: 0.9, metalness: 0.1 });
    
    brushLeft = new THREE.Mesh(brushGeo, brushMat);
    brushLeft.position.set(-ringRadius - 0.07, 0, 1.6);
    scene.add(brushLeft);

    brushRight = new THREE.Mesh(brushGeo, brushMat);
    brushRight.position.set(ringRadius + 0.07, 0, 1.6);
    scene.add(brushRight);

    // --- 3D Battery Source ---
    batteryGroup = new THREE.Group();
    batteryGroup.position.set(0, -1.8, 1.6);
    scene.add(batteryGroup);

    // Battery Body (cylinder)
    const batRadius = 0.25;
    const batHeight = 1.0;
    const batGeo = new THREE.CylinderGeometry(batRadius, batRadius, batHeight, 24);
    batGeo.rotateZ(Math.PI / 2); // Lay horizontal along X-axis

    // Two materials: positive side (left/red) and negative side (right/black)
    const batPosMat = new THREE.MeshStandardMaterial({ color: 0xff3333, metalness: 0.5, roughness: 0.3, emissive: 0xff3333, emissiveIntensity: 0.1 });
    const batNegMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8, roughness: 0.4 });

    // Positive terminal (cap tip)
    const capGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.1, 16);
    capGeo.rotateZ(Math.PI / 2);
    const capMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.1 }); // Gold cap

    const batPosMesh = new THREE.Mesh(new THREE.CylinderGeometry(batRadius, batRadius, batHeight / 2, 24).rotateZ(Math.PI / 2), batPosMat);
    batPosMesh.position.set(-batHeight / 4, 0, 0);
    const batNegMesh = new THREE.Mesh(new THREE.CylinderGeometry(batRadius, batRadius, batHeight / 2, 24).rotateZ(Math.PI / 2), batNegMat);
    batNegMesh.position.set(batHeight / 4, 0, 0);

    const batCap = new THREE.Mesh(capGeo, capMat);
    batCap.position.set(-batHeight / 2 - 0.05, 0, 0);

    batteryGroup.add(batPosMesh);
    batteryGroup.add(batNegMesh);
    batteryGroup.add(batCap);

    // --- 3D Rheostat (Sliding Variable Resistor) ---
    const rheoGroup = new THREE.Group();
    rheoGroup.position.set(1.2, -0.9, 1.6);
    scene.add(rheoGroup);

    // Resistor Tube (gray cylinder with rings to represent wire windings)
    const tubeGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.8, 16);
    const tubeMat = new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.3, roughness: 0.8 });
    rheostatMesh = new THREE.Mesh(tubeGeo, tubeMat);
    rheostatMesh.userData = { type: 'rheostat' };
    rheoGroup.add(rheostatMesh);
    interactiveObjects.push(rheostatMesh);

    // Ribs representing windings
    for (let r = 0; r < 8; r++) {
        const ringGeo = new THREE.TorusGeometry(0.125, 0.015, 6, 24);
        ringGeo.rotateX(Math.PI/2);
        const ringMesh = new THREE.Mesh(ringGeo, new THREE.MeshStandardMaterial({ 
            color: 0xffa500, 
            metalness: 0.2, 
            roughness: 0.3,
            emissive: 0xb87333,
            emissiveIntensity: 0.1
        }));
        ringMesh.position.y = -0.35 + r * 0.1;
        rheoGroup.add(ringMesh);
    }

    // Sliding Collar contact
    const collarGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 16);
    const collarMat = new THREE.MeshStandardMaterial({ 
        color: 0xffd700, 
        metalness: 0.2, 
        roughness: 0.3, 
        emissive: 0xd4af37,
        emissiveIntensity: 0.15 
    });
    rheostatCollar = new THREE.Mesh(collarGeo, collarMat);
    rheostatCollar.userData = { type: 'rheostat' };
    
    // Position collar based on current magnitude
    updateCollarPosition();
    rheoGroup.add(rheostatCollar);
    interactiveObjects.push(rheostatCollar);

    // Wire leads setup:
    const wireMat = new THREE.LineBasicMaterial({ color: 0xa0aec0 });
    const wireLeftGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-ringRadius - 0.07, 0, 1.6),
        new THREE.Vector3(-1, 0, 1.6),
        new THREE.Vector3(-1, -1.8, 1.6),
        new THREE.Vector3(-0.5, -1.8, 1.6)
    ]);
    scene.add(new THREE.Line(wireLeftGeo, wireMat));

    // Right wire from brush to top of rheostat
    const wireRightFixedGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(ringRadius + 0.07, 0, 1.6),
        new THREE.Vector3(1.2, 0, 1.6),
        new THREE.Vector3(1.2, -0.5, 1.6)
    ]);
    scene.add(new THREE.Line(wireRightFixedGeo, wireMat));

    // Right wire from sliding collar to battery (we'll update this dynamically)
    wireRightLine = new THREE.Line(new THREE.BufferGeometry(), wireMat);
    scene.add(wireRightLine);
    updateRheostatWire();

    // --- Magnetic Field Lines (Permanent red lines North to South) ---
    fieldLinesGroup = new THREE.Group();
    scene.add(fieldLinesGroup);
    rebuildFieldLines();

    // --- Force Arrows ---
    // Yellow arrows indicating Lorentz Force direction (Up on one side, Down on the other)
    createForceArrows();

    // --- Current Flow Arrows ---
    createCurrentArrows();
}

// Generate the wire loop geometries depending on the number of turns
function rebuildCoilLoops() {
    // Clear old coil meshes
    while (coilGroup.children.length > 0) {
        coilGroup.remove(coilGroup.children[0]);
    }
    interactiveObjects = interactiveObjects.filter(obj => obj.userData.type !== 'coil');

    const coilRadius = 0.025;
    const halfWidth = 1.0;
    const halfLength = 1.2;
    
    // For each turn, create a loop offset slightly inward or outward
    const copperMat = new THREE.MeshStandardMaterial({ 
        color: 0xffa500, // Bright copper orange
        metalness: 0.2, 
        roughness: 0.3,
        emissive: 0xff8c00,
        emissiveIntensity: 0.15
    });

    for (let t = 0; t < state.turns; t++) {
        const offset = t * 0.09;
        const w = halfWidth - offset;
        const l = halfLength;

        // Path connecting the armature coil to the split-ring commutator directly (removing the front cross wire segment)
        const ringRadius = 0.22;
        const points = [
            new THREE.Vector3(-ringRadius, 0, 1.35), // Connect to left split ring commutator half
            new THREE.Vector3(-w, 0, 1.35),          // Bend outward to left armature side
            new THREE.Vector3(-w, 0, -l),            // Left side wire
            new THREE.Vector3(w, 0, -l),             // Back wire across magnets
            new THREE.Vector3(w, 0, 1.35),           // Right side wire
            new THREE.Vector3(ringRadius, 0, 1.35)   // Bend inward to right split ring commutator half
        ];

        const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0);
        const tubeGeo = new THREE.TubeGeometry(curve, 64, coilRadius, 8, false);
        const coilMesh = new THREE.Mesh(tubeGeo, copperMat);
        coilMesh.userData = { type: 'coil' };
        coilGroup.add(coilMesh);
        interactiveObjects.push(coilMesh);
    }
}

// Generate / Rebuild Magnetic Field Lines
function rebuildFieldLines() {
    // Clear old lines
    while (fieldLinesGroup.children.length > 0) {
        fieldLinesGroup.remove(fieldLinesGroup.children[0]);
    }

    const fieldMat = new THREE.LineBasicMaterial({ 
        color: 0xff3366, 
        transparent: true, 
        opacity: 0.35 
    });

    // We draw lines across the gap from N to S
    for (let i = 0; i < FIELD_LINE_COUNT; i++) {
        const theta = (i / (FIELD_LINE_COUNT - 1)) * Math.PI - Math.PI / 2;
        const z = ((i % 5) - 2) * 0.8;
        const y = Math.sin(theta) * 0.9;

        let points = [];
        if (state.hasIronCore) {
            // When core is present, the field lines curve to pass radially into/through the cylinder
            // Creating a radial field configuration
            const nX = -2.3;
            const sX = 2.3;
            const coreRadius = 0.7;

            // Sample path
            points.push(new THREE.Vector3(nX, y, z));
            points.push(new THREE.Vector3(-1.0, y * 0.9, z));
            points.push(new THREE.Vector3(-coreRadius, y * (coreRadius/1.0), z));
            points.push(new THREE.Vector3(coreRadius, y * (coreRadius/1.0), z));
            points.push(new THREE.Vector3(1.0, y * 0.9, z));
            points.push(new THREE.Vector3(sX, y, z));
        } else {
            // Air core: Straight lines across
            points.push(new THREE.Vector3(-2.3, y, z));
            points.push(new THREE.Vector3(2.3, y, z));
        }

        const curve = new THREE.CatmullRomCurve3(points);
        const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(20));
        const line = new THREE.Line(geo, fieldMat);
        fieldLinesGroup.add(line);
    }
}

// Force Vector Arrows (Yellow)
function createForceArrows() {
    // Clear existing
    forceArrows.forEach(arrow => scene.remove(arrow));
    forceArrows = [];

    // Left side force arrow
    const arrowLeft = new THREE.ArrowHelper(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(-1, 0, 0),
        1.2,
        0xffea00,
        0.3,
        0.15
    );
    scene.add(arrowLeft);
    forceArrows.push(arrowLeft);

    // Right side force arrow
    const arrowRight = new THREE.ArrowHelper(
        new THREE.Vector3(0, -1, 0),
        new THREE.Vector3(1, 0, 0),
        1.2,
        0xffea00,
        0.3,
        0.15
    );
    scene.add(arrowRight);
    forceArrows.push(arrowRight);
}

// Create static cyan arrows on the coil to visualize conventional current direction
function createCurrentArrows() {
    currentArrows.forEach(arrow => coilGroup.remove(arrow));
    currentArrows = [];

    const w = 1.0;
    const l = 1.2;
    const arrowColor = 0x00f0ff; // Cyan
    const arrowLength = 1.2;
    const headLength = 0.4;
    const headWidth = 0.25;

    // Left side arrow (centered along Z, pointing back)
    const arrowLeft = new THREE.ArrowHelper(
        new THREE.Vector3(0, 0, -1),
        new THREE.Vector3(-w, 0, 0.6),
        arrowLength,
        arrowColor,
        headLength,
        headWidth
    );
    coilGroup.add(arrowLeft);
    currentArrows.push(arrowLeft);

    // Back side arrow (centered along X, pointing right)
    const arrowBack = new THREE.ArrowHelper(
        new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(-0.6, 0, -l),
        arrowLength,
        arrowColor,
        headLength,
        headWidth
    );
    coilGroup.add(arrowBack);
    currentArrows.push(arrowBack);

    // Right side arrow (centered along Z, pointing forward)
    const arrowRight = new THREE.ArrowHelper(
        new THREE.Vector3(0, 0, 1),
        new THREE.Vector3(w, 0, -0.6),
        arrowLength,
        arrowColor,
        headLength,
        headWidth
    );
    coilGroup.add(arrowRight);
    currentArrows.push(arrowRight);

}

// Calculate the rectangular path coordinate at progress t (0 to 1)
function getCoilPathPoint(t, turnsIndex) {
    const offset = turnsIndex * 0.09;
    const w = 1.0 - offset;
    const l = 1.2;
    const totalLen = (w * 2 + l * 2) * 2;

    // Segment boundaries
    const p1 = w / totalLen;           // Axle connector top
    const p2 = (w + l) / totalLen;      // Side left
    const p3 = (w * 3 + l) / totalLen;  // Back wire
    const p4 = (w * 3 + l * 2) / totalLen; // Side right
    const p5 = 1.0;

    let localPos = new THREE.Vector3();
    
    // Map progress along the loop
    if (t < 0.25) {
        // Front left to back left (-w to -w, length direction)
        const localT = t / 0.25;
        localPos.set(-w, 0, 1.2 - 2.4 * localT);
    } else if (t < 0.5) {
        // Back left to back right (-w to +w)
        const localT = (t - 0.25) / 0.25;
        localPos.set(-w + 2 * w * localT, 0, -1.2);
    } else if (t < 0.75) {
        // Back right to front right (+w, length direction)
        const localT = (t - 0.5) / 0.75;
        localPos.set(w, 0, -1.2 + 2.4 * localT);
    } else {
        // Front right to front left (+w to -w)
        const localT = (t - 0.75) / 0.25;
        localPos.set(w - 2 * w * localT, 0, 1.2);
    }

    // Apply coil rotation
    localPos.applyAxisAngle(new THREE.Vector3(0, 0, 1), state.angle);
    return localPos;
}

// 3D Text Label helper using a canvas texture (since FontLoader is heavy)
function create3DTextLabel(text, position, color) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0,0,128,128);
    ctx.font = 'bold 80px Orbitron';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(mat);
    sprite.position.copy(position);
    sprite.scale.set(0.8, 0.8, 0.8);
    scene.add(sprite);
}

// --- Window Resize ---
function onWindowResize() {
    const container = document.getElementById('animation-section');
    if (!container) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

// --- Mouse Movement (Hover Effect) ---
function onMouseMove(event) {
    const container = document.getElementById('animation-section');
    if (!container) return;
    const rect = container.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactiveObjects, true);

    if (intersects.length > 0) {
        let rootObj = intersects[0].object;
        // Traverse to find custom interactive parent
        while (rootObj.parent && rootObj.parent !== scene && rootObj.parent !== rotorGroup && !rootObj.userData.type) {
            rootObj = rootObj.parent;
        }

        if (hoverObject !== rootObj) {
            if (hoverObject) setGlow(hoverObject, false);
            hoverObject = rootObj;
            setGlow(hoverObject, true);
            document.body.classList.add('pointer-cursor');
        }
    } else {
        if (hoverObject) {
            setGlow(hoverObject, false);
            hoverObject = null;
            document.body.classList.remove('pointer-cursor');
        }
    }
}

// Apply visual highlight on hover
function setGlow(obj, active) {
    if (!obj || !obj.material) return;
    const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
    materials.forEach(mat => {
        if (active) {
            mat.emissiveSelf = mat.emissive ? mat.emissive.clone() : new THREE.Color(0);
            mat.emissive.setHex(0xffaa00);
            mat.emissiveIntensity = 0.5;
        } else {
            mat.emissive.copy(mat.emissiveSelf || new THREE.Color(0));
            mat.emissiveIntensity = 0.2;
        }
    });
}

// --- Clicks (Interactions) ---
function onClick() {
    if (!hoverObject) return;

    const type = hoverObject.userData.type;

    if (type === 'coil') {
        // Toggle turns (1 -> 2 -> 3 -> 4 -> 1)
        state.turns = (state.turns % 4) + 1;
        rebuildCoilLoops();
        triggerPopEffect(hoverObject.position);
    } 
    else if (type === 'commutator') {
        // Reverse battery current polarity
        state.current = -state.current;
        triggerPopEffect(new THREE.Vector3(0, 0, 1.6));
    } 
    else if (type === 'magnet') {
        // Toggle magnetic field strength (1.0 -> 2.0 -> 0.5 -> 1.0)
        if (state.fieldStrength === 1.0) state.fieldStrength = 2.0;
        else if (state.fieldStrength === 2.0) state.fieldStrength = 0.5;
        else state.fieldStrength = 1.0;
        rebuildFieldLines();
        triggerPopEffect(hoverObject.position);
    } 
    else if (type === 'core') {
        // Toggle soft-iron core insertion
        state.hasIronCore = !state.hasIronCore;
        rebuildFieldLines();
        
        // Slide in/out animation
        let targetScale = state.hasIronCore ? 1 : 0.001;
        new THREE.Vector3(targetScale, targetScale, targetScale);
        coreMesh.scale.set(targetScale, targetScale, targetScale);
        triggerPopEffect(new THREE.Vector3(0, 0, 0));
    }
    else if (type === 'rheostat') {
        // Cycle resistance: 1.0 -> 0.5 -> 3.0 -> 1.0
        if (state.resistance === 1.0) state.resistance = 0.5;
        else if (state.resistance === 0.5) state.resistance = 3.0;
        else state.resistance = 1.0;

        document.getElementById('slider-resistance').value = state.resistance;
        document.getElementById('val-resistance').innerHTML = `${state.resistance.toFixed(1)} &Omega;`;

        const currentSign = Math.sign(state.current);
        state.current = currentSign * (1.5 / state.resistance);

        updateCollarPosition();
        updateRheostatWire();
        triggerPopEffect(new THREE.Vector3(1.2, -0.9 + rheostatCollar.position.y, 1.6));
    }

    updateHUD();
}

// Simple flash effect on interaction
function triggerPopEffect(pos) {
    const flashGeo = new THREE.SphereGeometry(0.1, 8, 8);
    const flashMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
    const flash = new THREE.Mesh(flashGeo, flashMat);
    flash.position.copy(pos);
    scene.add(flash);

    let scale = 1.0;
    const interval = setInterval(() => {
        scale += 0.4;
        flash.scale.set(scale, scale, scale);
        flash.material.opacity -= 0.15;
        if (flash.material.opacity <= 0) {
            clearInterval(interval);
            scene.remove(flash);
            flashGeo.dispose();
            flashMat.dispose();
        }
    }, 30);
}

// Update text overlays
function updateHUD() {
    const speedRPM = Math.round(state.angularVelocity * (30 / Math.PI) * 60);
    document.getElementById('val-speed').innerText = `${speedRPM} RPM`;
    document.getElementById('val-turns').innerText = state.turns;
    document.getElementById('val-current').innerText = `${state.current > 0 ? '+' : ''}${state.current.toFixed(1)} A`;
    document.getElementById('val-core').innerText = state.hasIronCore ? "Soft-Iron Core" : "None";
}

// --- Animation & Physics Loop ---
function animate() {
    requestAnimationFrame(animate);

    if (!state.isPaused) {
        // 1. Rotate the Armature based on Physics
        updatePhysics();

        // 2. Update conventional current arrows direction/visibility
        updateCurrentArrows();

        // 3. Update Force vector visual representations
        updateForceVectors();
    }

    // 4. Render
    controls.update();
    renderer.render(scene, camera);
}

function updatePhysics() {
    // Current state angle in degrees normalized [0, 360]
    let deg = (state.angle * (180 / Math.PI)) % 360;
    if (deg < 0) deg += 360;

    // Split-ring commutator gap angle checks (Gap is vertical at 90 and 270 degrees)
    // If the gap aligns with the carbon brushes, current disconnects completely
    let actualCurrent = state.current;
    let gapMargin = 20; // degrees width of commutator gap (non-contact zone)
    let isDisconnected = (deg > 90 - gapMargin && deg < 90 + gapMargin) || 
                         (deg > 270 - gapMargin && deg < 270 + gapMargin);

    if (isDisconnected) {
        actualCurrent = 0;
    } else {
        // Commutator Reversing Action:
        // Carbon brushes are static. As the split ring rotates, the current swaps side relative to the coil.
        // If angle is between 90 and 270, the sides have flipped orientation, so commutator reverses the internal current path.
        if (deg > 90 && deg < 270) {
            actualCurrent = -state.current;
        }
    }

    // Force scale based on variables: F = B * I * L * N
    // Core boosts magnetic flux concentration (radial field effect) by 2.2x
    const coreMultiplier = state.hasIronCore ? 2.2 : 1.0;
    const forceFactor = state.fieldStrength * actualCurrent * state.turns * coreMultiplier;

    // Torque torque = F * width * cos(angle)
    // If soft-iron cylinder is active, it forms a radial field, meaning the force is always perpendicular to the coil surface
    // Thus the cos(angle) drop-off is avoided! Torque remains maximum throughout the rotation cycle.
    const angleTerm = state.hasIronCore ? 1.0 : Math.cos(state.angle);
    state.torque = forceFactor * 0.8 * angleTerm;

    // Physics integration: Acceleration = Torque / Inertia
    // Winding coil on soft-iron core increases rotor inertia slightly
    const inertia = INERTIA_BASE + (state.hasIronCore ? 0.02 : 0) + (state.turns * 0.005);
    const angularAcceleration = state.torque / inertia;

    // Update velocity and angle scaled by the speedMultiplier
    const dt = 0.016 * TIME_SCALE * state.speedMultiplier;
    state.angularVelocity += angularAcceleration * dt;
    state.angularVelocity *= (1 - FRICTION * TIME_SCALE * state.speedMultiplier); // Scale friction with simulation step
    state.angle += state.angularVelocity * dt;

    // Rotate 3D group
    rotorGroup.rotation.z = state.angle;

    // Rotate battery 180 degrees if current polarity is reversed
    if (batteryGroup) {
        batteryGroup.rotation.y = (state.current >= 0) ? 0 : Math.PI;
    }
}

function updateCurrentArrows() {
    let deg = (state.angle * (180 / Math.PI)) % 360;
    if (deg < 0) deg += 360;

    let gapMargin = 20;
    let isDisconnected = (deg > 90 - gapMargin && deg < 90 + gapMargin) || 
                         (deg > 270 - gapMargin && deg < 270 + gapMargin);

    if (isDisconnected || state.current === 0) {
        currentArrows.forEach(a => { a.visible = false; });
        return;
    }

    currentArrows.forEach(a => { a.visible = true; });

    // Determine conventional current direction relative to the physical coil sides.
    // If the angle is between 90 and 270 degrees, the contacts swap.
    let baseDirection = state.current > 0 ? 1 : -1;
    if (deg > 90 && deg < 270) {
        baseDirection = -baseDirection;
    }

    const w = 1.0;
    const l = 1.2;

    // Set Arrow directions and shift their local origins so they stay centered along the coil wire segments
    if (baseDirection > 0) {
        currentArrows[0].setDirection(new THREE.Vector3(0, 0, -1)); // Left side points back
        currentArrows[0].position.set(-w, 0, 0.6);

        currentArrows[1].setDirection(new THREE.Vector3(1, 0, 0));  // Back side points right
        currentArrows[1].position.set(-0.6, 0, -l);

        currentArrows[2].setDirection(new THREE.Vector3(0, 0, 1));   // Right side points forward
        currentArrows[2].position.set(w, 0, -0.6);
    } else {
        currentArrows[0].setDirection(new THREE.Vector3(0, 0, 1));  // Left side points forward
        currentArrows[0].position.set(-w, 0, -0.6);

        currentArrows[1].setDirection(new THREE.Vector3(-1, 0, 0)); // Back side points left
        currentArrows[1].position.set(0.6, 0, -l);

        currentArrows[2].setDirection(new THREE.Vector3(0, 0, -1));  // Right side points back
        currentArrows[2].position.set(w, 0, 0.6);
    }
}

function updateForceVectors() {
    let deg = (state.angle * (180 / Math.PI)) % 360;
    if (deg < 0) deg += 360;

    let gapMargin = 8;
    let isDisconnected = (deg > 90 - gapMargin && deg < 90 + gapMargin) || 
                         (deg > 270 - gapMargin && deg < 270 + gapMargin);

    if (isDisconnected || state.current === 0) {
        forceArrows.forEach(a => { a.visible = false; });
        return;
    }

    forceArrows.forEach(a => { a.visible = true; });

    // Determine direction based on Left-Hand Rule:
    // Left side coil is at -X. Right side coil is at +X.
    // If current flows in conventional direction (say, +Z on right side, -Z on left side)
    // Left side: current inward (⊗), field left-to-right (→). Force is DOWN (↓).
    // Right side: current outward (⊙), field left-to-right (→). Force is UP (↑).
    // We reverse forces as coil rotates past the gaps (handled by physical side positions)
    
    // Coil width vector
    const halfWidth = 1.0 - (state.turns - 1) * 0.03;
    
    // Left physical side position (3D coordinates)
    const leftPos = new THREE.Vector3(-halfWidth, 0, 0).applyAxisAngle(new THREE.Vector3(0, 0, 1), state.angle);
    // Right physical side position (3D coordinates)
    const rightPos = new THREE.Vector3(halfWidth, 0, 0).applyAxisAngle(new THREE.Vector3(0, 0, 1), state.angle);

    forceArrows[0].position.copy(leftPos);
    forceArrows[1].position.copy(rightPos);

    // Forces are always perpendicular to the magnetic field.
    // B-field is from -X to +X.
    // Force is purely vertical (+/- Y) in the standard case, or radial (perpendicular to coil loop) if core is active.
    let forceDirLeft = new THREE.Vector3(0, -1, 0);
    let forceDirRight = new THREE.Vector3(0, 1, 0);

    // Flip forces depending on which split-ring commutator half is connected
    let actualCurrent = state.current;
    if (deg > 90 && deg < 270) {
        actualCurrent = -state.current;
    }

    if (actualCurrent < 0) {
        forceDirLeft.set(0, 1, 0);
        forceDirRight.set(0, -1, 0);
    }

    forceArrows[0].setDirection(forceDirLeft);
    forceArrows[1].setDirection(forceDirRight);

    // Scale length of arrow depending on force magnitude
    const fMag = Math.min(Math.abs(state.torque) * 1.5 + 0.3, 2.0);
    forceArrows[0].setLength(fMag, 0.3, 0.15);
    forceArrows[1].setLength(fMag, 0.3, 0.15);
}

// Start everything
init();
updateHUD();
updatePhysics();

function togglePlayPause(e) {
    if (e) e.stopPropagation();
    state.isPaused = !state.isPaused;
    const btn = document.getElementById('btn-play-pause');
    if (state.isPaused) {
        btn.innerHTML = '<i class="fa-solid fa-play"></i> Play/Pause';
    } else {
        btn.innerHTML = '<i class="fa-solid fa-pause"></i> Play/Pause';
    }
}

function updateCollarPosition() {
    if (!rheostatCollar) return;
    // Map resistance 0.5 -> 3.0 linearly to y height 0.3 -> -0.3
    const norm = (state.resistance - 0.5) / 2.5;
    rheostatCollar.position.y = 0.3 - 0.6 * norm;
}

function updateRheostatWire() {
    if (!wireRightLine || !rheostatCollar) return;
    const collarYGlobal = -0.9 + rheostatCollar.position.y;
    const points = [
        new THREE.Vector3(1.2, collarYGlobal, 1.6),
        new THREE.Vector3(1.5, collarYGlobal, 1.6),
        new THREE.Vector3(1.5, -1.8, 1.6),
        new THREE.Vector3(0.5, -1.8, 1.6)
    ];
    wireRightLine.geometry.setFromPoints(points);
}

// --- Interactive Syllabus Quiz Logic ---
const quizAnswers = {
    q1: 'B',
    q2: 'B',
    q3: 'A',
    q4: 'B',
    q5: 'C',
    q6: 'A',
    q7: 'B',
    q8: 'B',
    q9: 'B',
    q10: ['torque', 'moment', 'moment of a force', 'moments']
};

function checkQuizAnswers(e) {
    if (e) e.preventDefault();
    let score = 0;
    
    // Q1 - Q9 MCQs
    for (let q = 1; q <= 9; q++) {
        const qCard = document.querySelector(`.question-card[data-qid="${q}"]`);
        const feedbackDiv = qCard.querySelector('.feedback');
        const selected = document.querySelector(`input[name="q${q}"]:checked`);
        
        qCard.className = 'question-card'; // reset classes
        feedbackDiv.className = 'feedback';
        
        if (!selected) {
            feedbackDiv.innerText = 'Please select an answer.';
            feedbackDiv.className = 'feedback incorrect-text';
            qCard.classList.add('incorrect-card');
            continue;
        }

        if (selected.value === quizAnswers[`q${q}`]) {
            score++;
            feedbackDiv.innerText = 'Correct! Great job.';
            feedbackDiv.className = 'feedback correct-text';
            qCard.classList.add('correct-card');
        } else {
            feedbackDiv.innerText = `Incorrect. The correct answer was ${quizAnswers[`q${q}`]}.`;
            feedbackDiv.className = 'feedback incorrect-text';
            qCard.classList.add('incorrect-card');
        }
    }

    // Q10: Fill-in-the-blank
    const q10Card = document.querySelector(`.question-card[data-qid="10"]`);
    const q10Feedback = q10Card.querySelector('.feedback');
    const q10Input = document.getElementById('q10-answer');
    const answerText = q10Input.value.trim().toLowerCase();

    q10Card.className = 'question-card';
    q10Feedback.className = 'feedback';

    if (answerText === '') {
        q10Feedback.innerText = 'Please fill in the blank.';
        q10Feedback.className = 'feedback incorrect-text';
        q10Card.classList.add('incorrect-card');
    } else if (quizAnswers.q10.includes(answerText)) {
        score++;
        q10Feedback.innerText = 'Correct! "Torque" or "Moment of a force" is correct.';
        q10Feedback.className = 'feedback correct-text';
        q10Card.classList.add('correct-card');
    } else {
        q10Feedback.innerText = 'Incorrect. The correct answer is "torque" or "moment of a force".';
        q10Feedback.className = 'feedback incorrect-text';
        q10Card.classList.add('incorrect-card');
    }

    // Update Score badge
    document.getElementById('quiz-score-badge').innerText = `Score: ${score} / 10`;
}
