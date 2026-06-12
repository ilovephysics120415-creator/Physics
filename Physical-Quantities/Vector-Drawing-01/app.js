// State Management
const state = {
    currentScreen: 'menu-screen',
    // Explore Mode state
    explore: {
        magA: 10,
        dirA: 30,
        magB: 10,
        dirB: 120,
        viewSize: 60
    },
    // Quiz Mode state
    quiz: {
        active: false,
        questionIndex: 0,
        totalQuestions: 30,
        score: 0,
        currentQuestion: null,
        answered: false
    }
};

// SVG Grid Configuration
const GRID_CONFIG = {
    viewSize: 60, // -30 to +30
    step: 5,      // Grid lines every 5 units
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    lucide.createIcons();
    
    setupNavigation();
    setupExploreMode();
    setupQuizMode();
    
    // Initial renders
    renderExploreCanvas();
});

// Navigation logic
function setupNavigation() {
    const screens = {
        'menu-screen': document.getElementById('menu-screen'),
        'explore-screen': document.getElementById('explore-screen'),
        'quiz-screen': document.getElementById('quiz-screen'),
        'completion-screen': document.getElementById('completion-screen')
    };

    function showScreen(screenId) {
        Object.keys(screens).forEach(key => {
            if (key === screenId) {
                screens[key].classList.add('active');
            } else {
                screens[key].classList.remove('active');
            }
        });
        state.currentScreen = screenId;
    }

    document.getElementById('btn-goto-explore').addEventListener('click', () => {
        showScreen('explore-screen');
        renderExploreCanvas();
    });

    document.getElementById('btn-goto-quiz').addEventListener('click', () => {
        showScreen('quiz-screen');
        startQuiz();
    });

    document.querySelectorAll('.btn-back').forEach(btn => {
        btn.addEventListener('click', () => {
            showScreen('menu-screen');
            state.quiz.active = false;
        });
    });

    document.getElementById('btn-menu-from-complete').addEventListener('click', () => {
        showScreen('menu-screen');
    });

    document.getElementById('btn-retry-quiz').addEventListener('click', () => {
        showScreen('quiz-screen');
        startQuiz();
    });
}

// Explore Mode Setup
function setupExploreMode() {
    const sliders = {
        magA: document.getElementById('slide-mag-a'),
        dirA: document.getElementById('slide-dir-a'),
        magB: document.getElementById('slide-mag-b'),
        dirB: document.getElementById('slide-dir-b')
    };

    const labels = {
        magA: document.getElementById('lbl-mag-a'),
        dirA: document.getElementById('lbl-dir-a'),
        magB: document.getElementById('lbl-mag-b'),
        dirB: document.getElementById('lbl-dir-b')
    };

    // Update state and re-render
    function updateExplore() {
        state.explore.magA = parseFloat(sliders.magA.value);
        state.explore.dirA = parseFloat(sliders.dirA.value);
        state.explore.magB = parseFloat(sliders.magB.value);
        state.explore.dirB = parseFloat(sliders.dirB.value);

        labels.magA.textContent = state.explore.magA;
        labels.dirA.textContent = state.explore.dirA + '°';
        labels.magB.textContent = state.explore.magB;
        labels.dirB.textContent = state.explore.dirB + '°';

        renderExploreCanvas();
    }

    Object.values(sliders).forEach(slider => {
        slider.addEventListener('input', updateExplore);
    });

    // Zoom controls
    const btnZoomIn = document.getElementById('btn-zoom-in');
    const btnZoomOut = document.getElementById('btn-zoom-out');

    btnZoomIn.addEventListener('click', () => {
        // Zoom in: Decrease viewBox size to make elements look larger (min: 20)
        if (state.explore.viewSize > 20) {
            state.explore.viewSize -= 10;
            renderExploreCanvas();
        }
    });

    btnZoomOut.addEventListener('click', () => {
        // Zoom out: Increase viewBox size to make elements look smaller (max: 120)
        if (state.explore.viewSize < 120) {
            state.explore.viewSize += 10;
            renderExploreCanvas();
        }
    });
}

// Calculate vector endpoint / components
function getVectorComponents(magnitude, angleDeg) {
    const angleRad = (angleDeg * Math.PI) / 180;
    const x = magnitude * Math.cos(angleRad);
    const y = -magnitude * Math.sin(angleRad); // Inverted for SVG canvas coordinate system (-y is UP)
    return { x, y };
}

// Vector calculations (addition)
function calculateResultant(v1, v2) {
    const rx = v1.x + v2.x;
    const ry = v1.y + v2.y;
    const mag = Math.sqrt(rx * rx + ry * ry);
    
    // Get angle from standard Cartesian angle
    let angleRad = Math.atan2(-ry, rx);
    let angleDeg = (angleRad * 180) / Math.PI;
    if (angleDeg < 0) {
        angleDeg += 360;
    }
    
    return { x: rx, y: ry, magnitude: mag, angle: angleDeg };
}

// Helper to calculate the angle between two vectors using the dot product formula
function getAngleBetween(v1, v2) {
    const dot = v1.x * v2.x + v1.y * v2.y;
    const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
    const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
    
    if (mag1 === 0 || mag2 === 0) return 0;
    
    let cosTheta = dot / (mag1 * mag2);
    cosTheta = Math.max(-1, Math.min(1, cosTheta)); // Clamp bounds
    
    return Math.round((Math.acos(cosTheta) * 180) / Math.PI);
}

// Helper to draw an arrowhead precisely at the midpoint with correct rotation
function drawArrowhead(mx, my, vx, vy, color, double = false) {
    const angleRad = Math.atan2(vy, vx);
    const angleDeg = (angleRad * 180) / Math.PI;
    
    if (double) {
        // Centered double arrowhead pointing in the vector direction (scaled down further)
        return `<g transform="translate(${mx}, ${my}) rotate(${angleDeg})">
            <path d="M -1.4 -0.8 L 0.2 0 L -1.4 0.8 Z M -0.2 -0.8 L 1.4 0 L -0.2 0.8 Z" fill="${color}" />
        </g>`;
    } else {
        // Centered single arrowhead pointing in the vector direction (scaled down further)
        return `<g transform="translate(${mx}, ${my}) rotate(${angleDeg})">
            <path d="M -0.8 -0.8 L 0.8 0 L -0.8 0.8 Z" fill="${color}" />
        </g>`;
    }
}

function createVectorSVG({ vA, vB, vR, showResultant, quizMode }) {
    const size = quizMode ? GRID_CONFIG.viewSize : state.explore.viewSize;
    const half = size / 2;
    const step = GRID_CONFIG.step;

    let svgContent = `
        <svg viewBox="-${half} -${half} ${size} ${size}">
    `;

    // 1. Draw grid lines
    for (let i = -half + step; i < half; i += step) {
        // Horizontal lines
        svgContent += `<line x1="-${half}" y1="${i}" x2="${half}" y2="${i}" stroke="rgba(255,255,255,0.03)" stroke-width="0.3"/>`;
        // Vertical lines
        svgContent += `<line x1="${i}" y1="-${half}" x2="${i}" y2="${half}" stroke="rgba(255,255,255,0.03)" stroke-width="0.3"/>`;
    }

    // 2. Main Axes (X & Y)
    svgContent += `<line x1="-${half}" y1="0" x2="${half}" y2="0" stroke="rgba(255,255,255,0.12)" stroke-width="0.7"/>`;
    svgContent += `<line x1="0" y1="-${half}" x2="0" y2="${half}" stroke="rgba(255,255,255,0.12)" stroke-width="0.7"/>`;

    // Axis Labeling
    for (let i = -half + 10; i < half; i += 10) {
        if (i !== 0) {
            // X labels
            svgContent += `<text x="${i}" y="3" fill="rgba(255,255,255,0.3)" font-size="2" text-anchor="middle" font-family="'Fira Code', monospace">${i}</text>`;
            // Y labels (-i to correct coordinate flip for drawing label)
            svgContent += `<text x="-3" y="${i + 0.7}" fill="rgba(255,255,255,0.3)" font-size="2" text-anchor="end" font-family="'Fira Code', monospace">${-i}</text>`;
        }
    }
    svgContent += `<text x="${half - 3}" y="-2" fill="rgba(255,255,255,0.4)" font-size="2.5" font-weight="600">x</text>`;
    svgContent += `<text x="2" y="-${half - 3}" fill="rgba(255,255,255,0.4)" font-size="2.5" font-weight="600">y</text>`;

    // Vector Triangle Method Setup:
    // Vector A starts at (0,0), goes to (vA.x, vA.y)
    // Vector B starts at (vA.x, vA.y), goes to (vA.x + vB.x, vA.y + vB.y)
    const ax = 0;
    const ay = 0;
    const bx = vA.x;
    const by = vA.y;
    const cx = vA.x + vB.x;
    const cy = vA.y + vB.y;

    // Line widths: thinner for Explore mode (quizMode is false)
    const swAB = quizMode ? "0.5" : "0.35";
    const swR = quizMode ? "1.0" : "0.45";

    // Vector A
    svgContent += `<line x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}" stroke="#00f3ff" stroke-width="${swAB}" filter="drop-shadow(0 0 2px rgba(0, 243, 255, 0.4))"/>`;
    svgContent += drawArrowhead(bx / 2, by / 2, bx, by, '#00f3ff');
    // Label A
    svgContent += `<text x="${bx / 2 - 1.5}" y="${by / 2 - 1.5}" fill="#00f3ff" font-size="2.5" font-weight="700">A</text>`;

    // Vector B
    svgContent += `<line x1="${bx}" y1="${by}" x2="${cx}" y2="${cy}" stroke="#ff007f" stroke-width="${swAB}" filter="drop-shadow(0 0 2px rgba(255, 0, 127, 0.4))"/>`;
    svgContent += drawArrowhead(bx + (cx - bx) / 2, by + (cy - by) / 2, cx - bx, cy - by, '#ff007f');
    // Label B
    svgContent += `<text x="${bx + (cx - bx) / 2 + 1.5}" y="${by + (cy - by) / 2 - 1.5}" fill="#ff007f" font-size="2.5" font-weight="700">B</text>`;

    // Resultant Vector R (if shown)
    if (showResultant) {
        const dash = quizMode ? `stroke-dasharray="0.8 0.4"` : '';
        svgContent += `<line x1="${ax}" y1="${ay}" x2="${cx}" y2="${cy}" stroke="#ffdd00" stroke-width="${swR}" ${dash} filter="drop-shadow(0 0 3px rgba(255, 221, 0, 0.5))"/>`;
        svgContent += drawArrowhead(cx / 2, cy / 2, cx, cy, '#ffdd00', true);
        // Label R
        svgContent += `<text x="${cx / 2 + 2}" y="${cy / 2 + 2}" fill="#ffdd00" font-size="3" font-weight="800">R</text>`;
    }

    svgContent += `</svg>`;
    return svgContent;
}

// Render Explore Mode canvas
function renderExploreCanvas() {
    const vA = getVectorComponents(state.explore.magA, state.explore.dirA);
    const vB = getVectorComponents(state.explore.magB, state.explore.dirB);
    const vR = calculateResultant(vA, vB);

    // Update displays
    document.getElementById('exp-val-a').innerHTML = `${state.explore.magA.toFixed(1)} N @ ${Math.round(state.explore.dirA)}°`;
    document.getElementById('exp-val-b').innerHTML = `${state.explore.magB.toFixed(1)} N @ ${Math.round(state.explore.dirB)}°`;
    document.getElementById('exp-val-r').innerHTML = `${vR.magnitude.toFixed(1)} N @ ${Math.round(vR.angle)}°`;

    const container = document.getElementById('explore-canvas-container');
    container.innerHTML = createVectorSVG({ vA, vB, vR, showResultant: true, quizMode: false });
}

// Quiz Mode Implementation
function setupQuizMode() {
    document.getElementById('btn-next-question').addEventListener('click', nextQuizQuestion);
}

function startQuiz() {
    state.quiz.active = true;
    state.quiz.questionIndex = 0;
    state.quiz.score = 0;
    
    nextQuizQuestion();
}

function nextQuizQuestion() {
    if (state.quiz.questionIndex >= state.quiz.totalQuestions) {
        endQuiz();
        return;
    }

    state.quiz.answered = false;
    state.quiz.questionIndex++;
    
    // Update labels
    document.getElementById('quiz-q-num').textContent = state.quiz.questionIndex;
    document.getElementById('quiz-score').textContent = state.quiz.score;
    
    // Hide feedback panel
    document.getElementById('quiz-feedback-panel').classList.add('hidden');
    
    // Generate new question
    state.quiz.currentQuestion = generateQuestion();
    
    // Update vector info above options
    const q = state.quiz.currentQuestion;
    const angleBetween = getAngleBetween(q.vA, q.vB);
    document.getElementById('quiz-vector-info').innerHTML = `
        <span>Vector A: <strong>${q.magA.toFixed(1)} N</strong></span>
        <span>Vector B: <strong>${q.magB.toFixed(1)} N</strong></span>
        <span>Angle Between: <strong>${angleBetween}°</strong></span>
    `;
    
    // Render question
    renderQuizCanvas();
    renderQuizOptions();
}

// Generates question with nice integer/semi-integer coordinates so the O-Level student can solve it on the grid
function generateQuestion() {
    // Limit components so the resulting triangle fits in the -30 to +30 viewport
    // Vector A component ranges
    const ax = Math.floor(Math.random() * 19) - 9; // -9 to 9
    const ay = Math.floor(Math.random() * 19) - 9; // -9 to 9
    
    // Vector B component ranges
    const bx = Math.floor(Math.random() * 19) - 9;
    const by = Math.floor(Math.random() * 19) - 9;
    
    // Ensure vectors aren't completely zero
    if ((ax === 0 && ay === 0) || (bx === 0 && by === 0) || (ax + bx === 0 && ay + by === 0)) {
        return generateQuestion();
    }

    const magA = Math.sqrt(ax*ax + ay*ay);
    const magB = Math.sqrt(bx*bx + by*by);
    
    const rx = ax + bx;
    const ry = ay + by;
    const magR = Math.sqrt(rx*rx + ry*ry);

    // Correct option
    const correctVal = parseFloat(magR.toFixed(1));

    // Generate incorrect options
    const options = new Set();
    options.add(correctVal);

    while (options.size < 4) {
        // Generate values close to correct but distinct
        const variance = (Math.random() * 8 - 4).toFixed(1);
        const opt = parseFloat((correctVal + parseFloat(variance)).toFixed(1));
        if (opt > 0 && opt !== correctVal) {
            options.add(opt);
        }
    }

    return {
        vA: { x: ax, y: -ay }, // Flipping Y component for standard Cartesian input logic (as getVectorComponents does)
        vB: { x: bx, y: -by },
        magA,
        magB,
        rx,
        ry,
        correctValue: correctVal,
        options: Array.from(options).sort((a, b) => a - b)
    };
}

function renderQuizCanvas() {
    const q = state.quiz.currentQuestion;
    const container = document.getElementById('quiz-canvas-container');
    container.innerHTML = createVectorSVG({
        vA: q.vA,
        vB: q.vB,
        vR: null,
        showResultant: state.quiz.answered, // Only show resultant line after answer
        quizMode: true
    });
}

function renderQuizOptions() {
    const q = state.quiz.currentQuestion;
    const container = document.getElementById('quiz-options-container');
    container.innerHTML = '';

    q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = `${opt.toFixed(1)} N`;
        btn.dataset.value = opt;
        btn.addEventListener('click', () => handleOptionSelection(opt, btn));
        container.appendChild(btn);
    });
}

function handleOptionSelection(selectedVal, selectedBtn) {
    if (state.quiz.answered) return;
    state.quiz.answered = true;

    const q = state.quiz.currentQuestion;
    const isCorrect = (selectedVal === q.correctValue);
    
    if (isCorrect) {
        state.quiz.score++;
        document.getElementById('quiz-score').textContent = state.quiz.score;
        selectedBtn.classList.add('correct');
        showCelebration();
    } else {
        selectedBtn.classList.add('incorrect');
        // Highlight correct button
        const buttons = document.querySelectorAll('.option-btn');
        buttons.forEach(btn => {
            if (parseFloat(btn.dataset.value) === q.correctValue) {
                btn.classList.add('correct');
            }
        });
    }

    // Update feedback screen
    const statusDiv = document.querySelector('.feedback-status');
    const msgSpan = document.getElementById('feedback-message');
    const icon = document.getElementById('feedback-icon');
    const explanation = document.getElementById('feedback-explanation');
    
    if (isCorrect) {
        statusDiv.className = 'feedback-status status-correct';
        msgSpan.textContent = 'Correct!';
        icon.setAttribute('data-lucide', 'check-circle-2');
    } else {
        statusDiv.className = 'feedback-status status-incorrect';
        msgSpan.textContent = 'Incorrect';
        icon.setAttribute('data-lucide', 'x-circle');
    }
    lucide.createIcons();

    // 1-line standard physics explanation
    explanation.innerHTML = `Using Pythagoras theorem: R = √(${q.rx}² + ${q.ry}²) = <strong>${q.correctValue} N</strong>.`;
    
    // Show resultant vector line on the canvas
    renderQuizCanvas();
    
    // Display feedback panel
    document.getElementById('quiz-feedback-panel').classList.remove('hidden');
}

// Celebration particle effects
function showCelebration() {
    const overlay = document.getElementById('celebration-overlay');
    overlay.innerHTML = '';
    
    const colors = ['#00f3ff', '#ff007f', '#ffdd00', '#39ff14'];
    
    for (let i = 0; i < 40; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random starting positions
        particle.style.left = Math.random() * 100 + 'vw';
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        // Random size and speeds
        const size = Math.random() * 6 + 6;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        particle.style.animationDuration = (Math.random() * 1 + 1) + 's';
        particle.style.animationDelay = (Math.random() * 0.2) + 's';
        
        overlay.appendChild(particle);
        
        // Remove element after animation
        setTimeout(() => {
            particle.remove();
        }, 2000);
    }
}

// End Quiz Screen
function endQuiz() {
    state.quiz.active = false;
    
    // Toggle screens
    document.getElementById('quiz-screen').classList.remove('active');
    document.getElementById('completion-screen').classList.add('active');
    
    document.getElementById('final-score').textContent = state.quiz.score;
    
    // Generate text feedback based on score
    const feedbackText = document.getElementById('completion-feedback');
    const ratio = state.quiz.score / state.quiz.totalQuestions;
    
    if (ratio >= 0.85) {
        feedbackText.textContent = 'Excellent! You are a master at vector addition. Ready for the O-level exam!';
    } else if (ratio >= 0.6) {
        feedbackText.textContent = 'Good effort! You understand the concept well, but try to refine your estimations.';
    } else {
        feedbackText.textContent = 'Keep practicing! Review Explore Mode to visualize the triangle method additions.';
    }
}
