// SPA Navigation
const navBtns = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.app-section');

function navigateTo(targetId) {
    sections.forEach(sec => {
        if (sec.id === targetId) {
            sec.classList.add('active');
        } else {
            sec.classList.remove('active');
        }
    });
    
    navBtns.forEach(btn => {
        if (btn.getAttribute('data-target') === targetId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Reset components if moving away/into
    if (targetId === 'explore') {
        initExploration();
    } else if (targetId === 'flashcards') {
        initFlashcards();
    } else if (targetId === 'quiz') {
        startQuizSession();
    }
}

navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        navigateTo(btn.getAttribute('data-target'));
    });
});

document.getElementById('start-explore-btn').addEventListener('click', () => navigateTo('explore'));
document.getElementById('explore-to-flash-btn').addEventListener('click', () => navigateTo('flashcards'));
document.getElementById('start-quiz-btn').addEventListener('click', () => navigateTo('quiz'));
document.getElementById('review-concepts-btn').addEventListener('click', () => navigateTo('concept'));

// ----------------------------------------------------
// Section 2: Interactive Exploration (Wiring simulator)
// ----------------------------------------------------
const WIRE_TYPES = [
    { id: 'brown', name: 'Brown Wire', color: 'var(--wire-live)', class: 'wire-brown', terminal: 'live', functionName: 'Live', explanation: 'Carries high voltage (230V) from the source to the appliance.' },
    { id: 'blue', name: 'Blue Wire', color: 'var(--wire-neutral)', class: 'wire-blue', terminal: 'neutral', functionName: 'Neutral', explanation: 'Completes the circuit, returning current at near 0V.' },
    { id: 'striped', name: 'Striped Wire', color: 'var(--wire-earth-stripes)', class: 'wire-striped', terminal: 'earth', functionName: 'Earth', explanation: 'Safety wire connecting metal casing to ground to divert leakage currents.' }
];

let exploreState = {
    wiresPlaced: { earth: null, neutral: null, live: null },
    selectedWireId: null // For tap-to-select mobile matching
};

function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function initExploration() {
    exploreState.wiresPlaced = { earth: null, neutral: null, live: null };
    exploreState.selectedWireId = null;

    document.getElementById('explore-feedback').classList.add('id-hidden');
    document.getElementById('explore-to-flash-btn').classList.add('id-hidden');

    // Reset Terminals
    const terminals = document.querySelectorAll('#explore .terminal-target');
    terminals.forEach(term => {
        term.classList.remove('correct', 'shake');
        const slot = term.querySelector('.wire-slot');
        const defaultText = term.id.includes('earth') ? 'Drop Earth Here' : (term.id.includes('neutral') ? 'Drop Neutral Here' : 'Drop Live Here');
        slot.textContent = defaultText;
        slot.style.background = '';
        slot.style.color = '';
    });

    // Shuffle & Render Wires
    const shuffledWires = shuffleArray(WIRE_TYPES);
    const container = document.getElementById('draggable-wires-container');
    container.innerHTML = '';

    shuffledWires.forEach(w => {
        const div = document.createElement('div');
        div.className = `wire-block ${w.class}`;
        div.draggable = true;
        div.id = `explore-wire-${w.id}`;
        div.dataset.wireId = w.id;
        div.textContent = w.name;
        
        // Drag events
        div.addEventListener('dragstart', handleDragStart);
        div.addEventListener('dragend', handleDragEnd);
        
        // Tap selection for mobile/touch
        div.addEventListener('click', handleWireTap);

        container.appendChild(div);
    });
}

function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.wireId);
    e.target.classList.add('dragging');
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function handleWireTap(e) {
    const allBlocks = document.querySelectorAll('#explore .wire-block');
    allBlocks.forEach(b => b.classList.remove('selected'));

    const wireId = e.target.dataset.wireId;
    if (exploreState.selectedWireId === wireId) {
        exploreState.selectedWireId = null;
    } else {
        exploreState.selectedWireId = wireId;
        e.target.classList.add('selected');
    }
}

// Set up drop target listeners for Section 2
const exploreTerminals = document.querySelectorAll('#explore .terminal-target');
exploreTerminals.forEach(term => {
    term.addEventListener('dragover', (e) => e.preventDefault());
    term.addEventListener('drop', (e) => {
        e.preventDefault();
        const wireId = e.dataTransfer.getData('text/plain');
        placeWireOnTerminal(wireId, term);
    });
    term.addEventListener('click', () => {
        if (exploreState.selectedWireId) {
            placeWireOnTerminal(exploreState.selectedWireId, term);
            exploreState.selectedWireId = null;
            const allBlocks = document.querySelectorAll('#explore .wire-block');
            allBlocks.forEach(b => b.classList.remove('selected'));
        }
    });
});

function placeWireOnTerminal(wireId, terminalEl) {
    const wireData = WIRE_TYPES.find(w => w.id === wireId);
    const targetTerminalName = terminalEl.dataset.terminal;

    if (!wireData) return;

    if (wireData.terminal === targetTerminalName) {
        // Correct placement
        exploreState.wiresPlaced[targetTerminalName] = wireId;
        terminalEl.classList.add('correct');
        
        const slot = terminalEl.querySelector('.wire-slot');
        slot.textContent = `✓ ${wireData.functionName}`;
        slot.style.background = wireData.color;
        slot.style.color = wireId === 'striped' ? '#111827' : '#ffffff';

        // Remove the wire block from panel
        const block = document.getElementById(`explore-wire-${wireId}`);
        if (block) block.remove();

        // Check if all are wired
        checkExplorationComplete();
    } else {
        // Incorrect placement
        terminalEl.classList.add('shake');
        setTimeout(() => terminalEl.classList.remove('shake'), 400);
    }
}

function checkExplorationComplete() {
    const allWired = Object.values(exploreState.wiresPlaced).every(v => v !== null);
    if (allWired) {
        const feedback = document.getElementById('explore-feedback');
        const desc = document.getElementById('explore-feedback-desc');
        feedback.classList.remove('id-hidden');
        
        desc.innerHTML = `
            <strong>Earth (Striped)</strong> connects to the top pin. It carries leaking current safely into the ground.<br>
            <strong>Neutral (Blue)</strong> connects to the bottom left pin. It completes the circuit return path.<br>
            <strong>Live (Brown)</strong> connects to the bottom right pin. It delivers high voltage to power the device.
        `;
        
        document.getElementById('explore-to-flash-btn').classList.remove('id-hidden');
        triggerCelebration();
    }
}

document.getElementById('reset-explore-btn').addEventListener('click', initExploration);

// ----------------------------------------------------
// Section 3: Flashcard Revision
// ----------------------------------------------------
const FLASHCARDS_DATA = [
    { q: "What is the primary function of the Live wire?", a: "To deliver the alternating high voltage current (approx. 230V) from the electrical source to the appliance." },
    { q: "What is the primary function of the Neutral wire?", a: "To complete the electrical circuit path, returning current to the power source at near-zero voltage." },
    { q: "What is the safety function of the Earth wire?", a: "To provide a low-resistance safety path to the ground for any leakage current, preventing severe electric shocks." },
    { q: "What represents the Brown wire in the mains cable?", a: "The Live wire, carrying the high voltage supply." },
    { q: "What represents the Blue wire in the mains cable?", a: "The Neutral wire, completing the path at zero potential." },
    { q: "What represents the Green-and-Yellow striped wire?", a: "The Earth wire, dedicated to grounding metal casings." },
    { q: "Describe the correct position of the Earth pin in a UK 3-pin plug.", a: "The top center pin, which is also longer than the other two to ensure early grounding connection." },
    { q: "Describe the correct positions of the Live and Neutral pins in a 3-pin plug.", a: "Looking inside the plug, the Live terminal (L) is on the bottom right, and the Neutral terminal (N) is on the bottom left." },
    { q: "Why must switches be connected to the Live wire side?", a: "So that when the switch is open (off), the high voltage is disconnected before it reaches the appliance, isolating it safely." },
    { q: "Why must fuses be connected to the Live wire side?", a: "So that if an overcurrent occurs, the fuse blows and isolates the entire appliance from the high voltage source." },
    { q: "Why must circuit breakers be connected to the Live wire side?", a: "So that when the circuit breaker trips, it immediately disconnects the high voltage line and prevents electrocution risks." },
    { q: "What happens if a safety fuse or switch is incorrectly placed on the Neutral wire?", a: "If the switch is opened or the fuse blows, current stops flowing, but the internal appliance components and metal casing remain at high voltage, posing a shock risk." }
];

let currentFlashIndex = 0;
let flashcardsDeck = [...FLASHCARDS_DATA];

function initFlashcards() {
    currentFlashIndex = 0;
    flashcardsDeck = [...FLASHCARDS_DATA];
    showFlashcard();
}

function showFlashcard() {
    const card = document.getElementById('current-flashcard');
    card.classList.remove('flipped');
    
    document.getElementById('flash-progress').textContent = `Card ${currentFlashIndex + 1} / ${flashcardsDeck.length}`;
    document.getElementById('flash-front-text').textContent = flashcardsDeck[currentFlashIndex].q;
    document.getElementById('flash-back-text').textContent = flashcardsDeck[currentFlashIndex].a;
}

document.getElementById('current-flashcard').addEventListener('click', function() {
    this.classList.toggle('flipped');
});

function navigateFlashcard(actionFn) {
    const card = document.getElementById('current-flashcard');
    if (card.classList.contains('flipped')) {
        card.classList.remove('flipped');
        setTimeout(() => {
            actionFn();
            showFlashcard();
        }, 600); // matches CSS transition time
    } else {
        actionFn();
        showFlashcard();
    }
}

document.getElementById('prev-flash-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentFlashIndex > 0) {
        navigateFlashcard(() => {
            currentFlashIndex--;
        });
    }
});

document.getElementById('shuffle-flash-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    navigateFlashcard(() => {
        flashcardsDeck = shuffleArray(flashcardsDeck);
        currentFlashIndex = 0;
    });
});

document.getElementById('next-flash-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentFlashIndex < flashcardsDeck.length - 1) {
        navigateFlashcard(() => {
            currentFlashIndex++;
        });
    }
});

// ----------------------------------------------------
// Section 4: Quiz
// ----------------------------------------------------
// 24 MCQ Questions and 6 Drag & Drop questions = 30 total pool
const QUIZ_POOL = [
    // 24 MCQ Questions
    {
        type: 'mcq',
        q: "Which wire delivers the alternating high voltage supply (~230V) to the appliance?",
        options: ["Earth wire", "Neutral wire", "Live wire", "Ground wire"],
        correctIndex: 2,
        explanation: "The live wire (brown) carries the alternating high voltage to power the appliance, making it the most hazardous wire."
    },
    {
        type: 'mcq',
        q: "What is the primary role of the neutral wire in a household circuit?",
        options: ["Completes the circuit at near-zero voltage", "Provides a safety link to the metal frame", "Shunts excess currents to the ground", "Isolates high voltages during overload"],
        correctIndex: 0,
        explanation: "The neutral wire completing the circuit path ensures current has a low-voltage route back to the substation."
    },
    {
        type: 'mcq',
        q: "In a standard UK-type plug, what is the color of the earth wire?",
        options: ["Solid brown", "Solid blue", "Green and yellow stripes", "Red and white stripes"],
        correctIndex: 2,
        explanation: "The earth wire is easily distinguished by its green and yellow striped color code for maximum safety visibility."
    },
    {
        type: 'mcq',
        q: "When wiring a standard 3-pin plug, which terminal does the blue wire connect to?",
        options: ["Live (L) on bottom right", "Neutral (N) on bottom left", "Earth (E) on top center", "Fuse link"],
        correctIndex: 1,
        explanation: "The blue wire is the neutral wire and connects to the Neutral (N) terminal, which is on the bottom left."
    },
    {
        type: 'mcq',
        q: "Why are switches always connected to the live wire instead of the neutral wire?",
        options: ["So that turning off the switch isolates the appliance from the high voltage", "To increase the current flow inside the circuit", "To prevent the earth wire from getting disconnected", "To reduce the electricity billing rates"],
        correctIndex: 0,
        explanation: "Placing the switch on the live wire ensures that when open, the appliance is entirely isolated from high voltage."
    },
    {
        type: 'mcq',
        q: "What happens if a fuse is mistakenly connected on the neutral wire instead of the live wire?",
        options: ["The appliance becomes double insulated", "The fuse will blow immediately on startup", "If the fuse blows, the appliance remains at a dangerous high voltage", "The earth wire will take over normal operation"],
        correctIndex: 2,
        explanation: "With the fuse on the neutral wire, blowing it cuts the circuit current, but leaves the internal components at high live voltage."
    },
    {
        type: 'mcq',
        q: "Which wire is connected directly to the metal casing of an appliance to protect users from shock?",
        options: ["Live wire", "Neutral wire", "Earth wire", "Copper conductor"],
        correctIndex: 2,
        explanation: "The earth wire connects to the casing so any electrical fault path flows to earth rather than through the user."
    },
    {
        type: 'mcq',
        q: "What color is the live wire in the standard UK-type 3-pin plug?",
        options: ["Brown", "Blue", "Green", "Striped yellow"],
        correctIndex: 0,
        explanation: "The live wire is color-coded brown."
    },
    {
        type: 'mcq',
        q: "Which device is designed to melt and break the live circuit when the current gets too high?",
        options: ["Earth leakage path", "Circuit breaker switch", "Fuse", "Three-way plug"],
        correctIndex: 2,
        explanation: "A fuse contains a thin wire that melts when current exceeds its safety rating, cutting the circuit flow."
    },
    {
        type: 'mcq',
        q: "If an appliance does not have a metal casing (double insulated), what safety wire is omitted?",
        options: ["Live wire", "Neutral wire", "Earth wire", "All wires"],
        correctIndex: 2,
        explanation: "Without a metal exterior casing to become live, double-insulated appliances do not require an earth safety wire."
    },
    {
        type: 'mcq',
        q: "What is the typical potential difference between the neutral wire and the earth wire?",
        options: ["230 V", "110 V", "0 V", "400 V"],
        correctIndex: 2,
        explanation: "Both neutral and earth lines are at or near zero volts relative to ground under normal conditions."
    },
    {
        type: 'mcq',
        q: "Looking at the interior of a UK 3-pin plug, where is the Earth terminal located?",
        options: ["Bottom left", "Bottom right", "Top center", "Behind the fuse container"],
        correctIndex: 2,
        explanation: "The earth terminal is located at the top center position of the plug."
    },
    {
        type: 'mcq',
        q: "What is the risk of having a switch on the neutral wire when the switch is set to off?",
        options: ["The fuse will blow automatically", "Current will continue to flow to ground", "The appliance is off but remains at high voltage, posing a shock hazard", "The appliance will use more electrical power"],
        correctIndex: 2,
        explanation: "Opening a switch on the neutral wire interrupts current loop, but leaves the entire device live at full voltage."
    },
    {
        type: 'mcq',
        q: "Which pin is designed to be longer than the others to ensure early safety connection?",
        options: ["Live pin", "Neutral pin", "Earth pin", "Fuse pin"],
        correctIndex: 2,
        explanation: "The earth pin is longest, meaning it engages first with the socket to establish a safe grounding path before voltage lines connect."
    },
    {
        type: 'mcq',
        q: "What color represents the neutral wire?",
        options: ["Brown", "Blue", "Green-Yellow", "Black"],
        correctIndex: 1,
        explanation: "The neutral wire is blue."
    },
    {
        type: 'mcq',
        q: "Which component is an electromagnetic switch that automatically trips to break the live wire path during faults?",
        options: ["Fuse", "Earth wire", "Circuit breaker", "Double insulation layer"],
        correctIndex: 2,
        explanation: "Circuit breakers are electromagnetic safety switches that trip automatically when current spikes above safe limits."
    },
    {
        type: 'mcq',
        q: "If a live wire breaks off and contacts the metal frame of an earthed appliance, how does the system prevent shock?",
        options: ["The current returns via the neutral wire and shuts down", "Large current flows down the earth wire, blowing the fuse on the live wire", "The metal casing absorbs all electrical charges", "The voltage immediately drops to zero without breaking the circuit"],
        correctIndex: 1,
        explanation: "The low resistance earth wire creates a high-current path, which immediately melts the fuse, isolating the appliance."
    },
    {
        type: 'mcq',
        q: "What is the main danger of using an appliance with damaged wire insulation?",
        options: ["It consumes double the current", "Fuses melt automatically on standby", "Exposed live wires cause shock hazards if touched", "The neutral wire switches off"],
        correctIndex: 2,
        explanation: "Damaged insulation exposes conductors, leading to risk of severe shock if touched by a user."
    },
    {
        type: 'mcq',
        q: "Why are the pins on a standard plug made of brass?",
        options: ["It is a poor electrical conductor", "It is strong, resistant to wear, and a good electrical conductor", "It matches the green and yellow earth wire", "It resists melting at high potentials"],
        correctIndex: 1,
        explanation: "Brass is strong and conductive, ensuring low resistance contacts that do not deform over time."
    },
    {
        type: 'mcq',
        q: "In what way are double-insulated appliances marked?",
        options: ["A green stripe symbol", "A square-within-a-square symbol", "A grounding symbol", "A yellow triangle warning sign"],
        correctIndex: 1,
        explanation: "The symbol of a square within a square indicates that the appliance is double-insulated."
    },
    {
        type: 'mcq',
        q: "Under normal conditions, what is the voltage value of the earth wire?",
        options: ["230 V", "0 V", "12 V", "Alternating between 0 V and 230 V"],
        correctIndex: 1,
        explanation: "The earth wire is grounded, meaning its electrical potential remains at 0 V."
    },
    {
        type: 'mcq',
        q: "What could happen if a copper wire of incorrect thickness is used instead of a rated safety fuse?",
        options: ["The appliance works normally but consumes less current", "During overcurrent, the copper wire will not melt, risking damage and fires", "The switch on the live wire will melt instantly", "The neutral voltage increases to 230V"],
        correctIndex: 1,
        explanation: "Standard copper wires are too thick to melt during current overloads, defeating the fuse's purpose of breaking the circuit."
    },
    {
        type: 'mcq',
        q: "Which wire connects to the terminal labeled with the letter 'L'?",
        options: ["Blue wire", "Brown wire", "Green-and-yellow wire", "Striped wire"],
        correctIndex: 1,
        explanation: "The brown live wire connects to the terminal labeled L."
    },
    {
        type: 'mcq',
        q: "Which wire connects to the terminal labeled with the letter 'N'?",
        options: ["Brown wire", "Blue wire", "Green-and-yellow wire", "Yellow wire"],
        correctIndex: 1,
        explanation: "The blue neutral wire connects to the terminal labeled N."
    },

    // 6 Drag and Drop Questions
    { type: 'drag-drop', id: 'dd1' },
    { type: 'drag-drop', id: 'dd2' },
    { type: 'drag-drop', id: 'dd3' },
    { type: 'drag-drop', id: 'dd4' },
    { type: 'drag-drop', id: 'dd5' },
    { type: 'drag-drop', id: 'dd6' }
];

let quizSessionQuestions = [];
let currentQuestionIndex = 0;
let quizScore = 0;
let quizDragState = {
    wiresPlaced: { earth: null, neutral: null, live: null },
    selectedWireId: null
};

function startQuizSession() {
    quizScore = 0;
    currentQuestionIndex = 0;
    
    // Choose 15 random questions from the pool
    quizSessionQuestions = shuffleArray(QUIZ_POOL).slice(0, 15);
    
    loadQuizQuestion();
}

function loadQuizQuestion() {
    const question = quizSessionQuestions[currentQuestionIndex];
    
    // Update progress
    document.getElementById('quiz-question-number').textContent = `Question ${currentQuestionIndex + 1} of 15`;
    const progressPercent = (currentQuestionIndex / 15) * 100;
    document.getElementById('quiz-progress-fill').style.width = `${progressPercent}%`;

    // Reset feedback panel
    document.getElementById('quiz-feedback-box').classList.add('id-hidden');

    if (question.type === 'mcq') {
        renderMCQQuestion(question);
    } else {
        renderDragQuestion();
    }
}

function renderMCQQuestion(qData) {
    document.getElementById('quiz-mcq-view').classList.remove('id-hidden');
    document.getElementById('quiz-drag-view').classList.add('id-hidden');

    document.getElementById('mcq-question-text').textContent = qData.q;
    
    const container = document.getElementById('mcq-options-container');
    container.innerHTML = '';

    qData.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-opt-btn';
        btn.textContent = opt;
        btn.addEventListener('click', () => submitMCQAnswer(idx));
        container.appendChild(btn);
    });
}

function submitMCQAnswer(selectedIndex) {
    const qData = quizSessionQuestions[currentQuestionIndex];
    const buttons = document.querySelectorAll('#mcq-options-container .quiz-opt-btn');
    
    // Disable all options
    buttons.forEach(btn => btn.disabled = true);

    const feedbackBox = document.getElementById('quiz-feedback-box');
    const indicator = document.getElementById('quiz-feedback-indicator');
    const explanation = document.getElementById('quiz-feedback-explanation');

    if (selectedIndex === qData.correctIndex) {
        quizScore++;
        buttons[selectedIndex].classList.add('correct-choice');
        indicator.textContent = "Correct! 🎉";
        indicator.className = "feedback-indicator correct-state";
        triggerCelebration();
    } else {
        buttons[selectedIndex].classList.add('incorrect-choice');
        buttons[qData.correctIndex].classList.add('correct-choice');
        indicator.textContent = "Incorrect";
        indicator.className = "feedback-indicator incorrect-state";
    }

    explanation.textContent = qData.explanation;
    feedbackBox.classList.remove('id-hidden');
}

function renderDragQuestion() {
    document.getElementById('quiz-mcq-view').classList.add('id-hidden');
    document.getElementById('quiz-drag-view').classList.remove('id-hidden');

    quizDragState.wiresPlaced = { earth: null, neutral: null, live: null };
    quizDragState.selectedWireId = null;

    const submitBtn = document.getElementById('quiz-submit-drag-btn');
    submitBtn.disabled = true;
    submitBtn.classList.remove('id-hidden');

    // Reset Terminals
    const terminals = document.querySelectorAll('#quiz-plug-casing .terminal-target');
    terminals.forEach(term => {
        term.classList.remove('correct', 'shake');
        term.querySelector('.wire-slot').textContent = 'Empty Terminal';
        term.querySelector('.wire-slot').style.background = '';
        term.querySelector('.wire-slot').style.color = '';
    });

    // Shuffle terminal layout positions dynamically in the DOM
    const plugCasing = document.getElementById('quiz-plug-casing');
    const positions = [
        { top: '25px', left: '85px' },    // Top
        { bottom: '30px', left: '20px' }, // Bottom Left
        { bottom: '30px', right: '20px' } // Bottom Right
    ];
    
    const shuffledPositions = shuffleArray(positions);
    terminals.forEach((term, idx) => {
        term.style.top = shuffledPositions[idx].top || 'auto';
        term.style.bottom = shuffledPositions[idx].bottom || 'auto';
        term.style.left = shuffledPositions[idx].left || 'auto';
        term.style.right = shuffledPositions[idx].right || 'auto';
    });

    // Shuffle Wires
    const shuffledWires = shuffleArray(WIRE_TYPES);
    const container = document.getElementById('quiz-wires-container');
    container.innerHTML = '';

    shuffledWires.forEach(w => {
        const div = document.createElement('div');
        div.className = `wire-block ${w.class}`;
        div.draggable = true;
        div.id = `quiz-wire-${w.id}`;
        div.dataset.wireId = w.id;
        div.textContent = w.name;

        div.addEventListener('dragstart', handleQuizDragStart);
        div.addEventListener('dragend', handleQuizDragEnd);
        div.addEventListener('click', handleQuizWireTap);

        container.appendChild(div);
    });
}

function handleQuizDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.wireId);
    e.target.classList.add('dragging');
}

function handleQuizDragEnd(e) {
    e.target.classList.remove('dragging');
}

function handleQuizWireTap(e) {
    const allBlocks = document.querySelectorAll('#quiz-wires-container .wire-block');
    allBlocks.forEach(b => b.classList.remove('selected'));

    const wireId = e.target.dataset.wireId;
    if (quizDragState.selectedWireId === wireId) {
        quizDragState.selectedWireId = null;
    } else {
        quizDragState.selectedWireId = wireId;
        e.target.classList.add('selected');
    }
}

// Quiz Drop targets
const quizTerminals = document.querySelectorAll('#quiz-plug-casing .terminal-target');
quizTerminals.forEach(term => {
    term.addEventListener('dragover', (e) => e.preventDefault());
    term.addEventListener('drop', (e) => {
        e.preventDefault();
        const wireId = e.dataTransfer.getData('text/plain');
        placeQuizWire(wireId, term);
    });
    term.addEventListener('click', () => {
        if (quizDragState.selectedWireId) {
            placeQuizWire(quizDragState.selectedWireId, term);
            quizDragState.selectedWireId = null;
            const allBlocks = document.querySelectorAll('#quiz-wires-container .wire-block');
            allBlocks.forEach(b => b.classList.remove('selected'));
        }
    });
});

function placeQuizWire(wireId, terminalEl) {
    const wireData = WIRE_TYPES.find(w => w.id === wireId);
    const targetTerminalName = terminalEl.dataset.terminal;

    if (!wireData) return;

    // Check if terminal is already filled, return previous wire back if needed
    const prevWireId = quizDragState.wiresPlaced[targetTerminalName];
    if (prevWireId) {
        returnWireToPanel(prevWireId);
    }

    // Check if wire was placed elsewhere, clear that terminal
    for (let t in quizDragState.wiresPlaced) {
        if (quizDragState.wiresPlaced[t] === wireId) {
            quizDragState.wiresPlaced[t] = null;
            const otherTerm = document.querySelector(`#quiz-plug-casing [data-terminal="${t}"]`);
            otherTerm.querySelector('.wire-slot').textContent = 'Empty Terminal';
            otherTerm.querySelector('.wire-slot').style.background = '';
            otherTerm.querySelector('.wire-slot').style.color = '';
        }
    }

    // Place wire
    quizDragState.wiresPlaced[targetTerminalName] = wireId;
    
    const slot = terminalEl.querySelector('.wire-slot');
    slot.textContent = wireData.name;
    slot.style.background = wireData.color;
    slot.style.color = wireId === 'striped' ? '#111827' : '#ffffff';

    // Remove from panel
    const block = document.getElementById(`quiz-wire-${wireId}`);
    if (block) block.style.display = 'none';

    // Check if all slots filled to enable submit button
    const allFilled = Object.values(quizDragState.wiresPlaced).every(v => v !== null);
    document.getElementById('quiz-submit-drag-btn').disabled = !allFilled;
}

function returnWireToPanel(wireId) {
    const block = document.getElementById(`quiz-wire-${wireId}`);
    if (block) block.style.display = 'block';
}

document.getElementById('quiz-submit-drag-btn').addEventListener('click', submitQuizDragAnswer);

function submitQuizDragAnswer() {
    const submitBtn = document.getElementById('quiz-submit-drag-btn');
    submitBtn.classList.add('id-hidden'); // Hide confirm button

    // Check answers
    let allCorrect = true;
    for (let termName in quizDragState.wiresPlaced) {
        const wireId = quizDragState.wiresPlaced[termName];
        const wireData = WIRE_TYPES.find(w => w.id === wireId);
        
        const termEl = document.querySelector(`#quiz-plug-casing [data-terminal="${termName}"]`);
        
        if (wireData && wireData.terminal === termName) {
            termEl.classList.add('correct');
        } else {
            allCorrect = false;
            termEl.classList.add('shake');
            setTimeout(() => termEl.classList.remove('shake'), 400);
        }
    }

    const feedbackBox = document.getElementById('quiz-feedback-box');
    const indicator = document.getElementById('quiz-feedback-indicator');
    const explanation = document.getElementById('quiz-feedback-explanation');

    if (allCorrect) {
        quizScore++;
        indicator.textContent = "Correct! 🎉";
        indicator.className = "feedback-indicator correct-state";
        triggerCelebration();
    } else {
        indicator.textContent = "Incorrect";
        indicator.className = "feedback-indicator incorrect-state";
    }

    // Force display of the correct config on the terminals for explanation
    const terminals = document.querySelectorAll('#quiz-plug-casing .terminal-target');
    terminals.forEach(term => {
        const termName = term.dataset.terminal;
        const correctWire = WIRE_TYPES.find(w => w.terminal === termName);
        term.classList.add('correct');
        const slot = term.querySelector('.wire-slot');
        slot.textContent = `✓ ${correctWire.functionName}`;
        slot.style.background = correctWire.color;
        slot.style.color = correctWire.id === 'striped' ? '#111827' : '#ffffff';
    });

    explanation.innerHTML = `
        <strong>Correct Wiring Code:</strong><br>
        • <strong>Earth (Green/Yellow)</strong> connects to the top center terminal.<br>
        • <strong>Neutral (Blue)</strong> connects to the bottom left terminal.<br>
        • <strong>Live (Brown)</strong> connects to the bottom right terminal.
    `;
    feedbackBox.classList.remove('id-hidden');
}

// Next button in feedback handles quiz logic
document.getElementById('quiz-next-btn').addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < 15) {
        loadQuizQuestion();
    } else {
        showResults();
    }
});

// ----------------------------------------------------
// Section 5: Scoring and Feedback
// ----------------------------------------------------
function showResults() {
    navigateTo('results');
    
    document.getElementById('final-score').textContent = quizScore;
    
    const title = document.getElementById('feedback-grade-title');
    const msg = document.getElementById('feedback-message');
    
    if (quizScore >= 12) {
        title.textContent = "Excellent Score! 🏆";
        msg.textContent = "Outstanding grasp of plug wiring and safety configurations! You perfectly understand the functions of the live, neutral, and earth wires.";
        triggerBigCelebration();
    } else if (quizScore >= 7) {
        title.textContent = "Good Effort! 👍";
        msg.textContent = "You have a solid foundation, but review wire color codes and the placement of switches/fuses on the live wire for a perfect score.";
    } else {
        title.textContent = "Keep Practicing! 💪";
        msg.textContent = "We recommend going back to the Concept Introduction and Flashcards to review functions of each wire before attempting the quiz again.";
    }
}

document.getElementById('restart-quiz-btn').addEventListener('click', () => {
    navigateTo('quiz');
});

// ----------------------------------------------------
// Celebratory Neon Particles / Confetti Animation
// ----------------------------------------------------
const canvas = document.getElementById('confetti-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
let animationFrameId = null;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
    constructor(isBig = false) {
        this.x = Math.random() * canvas.width;
        this.y = isBig ? canvas.height + 20 : Math.random() * (canvas.height * 0.4);
        this.radius = Math.random() * (isBig ? 6 : 3) + 2;
        this.color = Math.random() > 0.5 ? '#00f5ff' : '#00ff88';
        this.speedX = Math.random() * 4 - 2;
        this.speedY = isBig ? -(Math.random() * 10 + 6) : -(Math.random() * 3 + 1);
        this.gravity = 0.15;
        this.opacity = 1;
        this.fade = Math.random() * 0.01 + 0.01;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.speedY += this.gravity;
        this.opacity -= this.fade;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.opacity);
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles = particles.filter(p => p.opacity > 0);
    particles.forEach(p => {
        p.update();
        p.draw();
    });

    if (particles.length > 0) {
        animationFrameId = requestAnimationFrame(animateParticles);
    } else {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

function triggerCelebration() {
    // Standard mini animation for single answers
    for (let i = 0; i < 40; i++) {
        particles.push(new Particle(false));
    }
    if (!animationFrameId) {
        animateParticles();
    }
}

function triggerBigCelebration() {
    // Big explosion from bottom
    for (let i = 0; i < 150; i++) {
        particles.push(new Particle(true));
    }
    if (!animationFrameId) {
        animateParticles();
    }
}

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
    initExploration();
});
