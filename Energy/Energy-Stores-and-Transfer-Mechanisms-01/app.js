// Global App State
const state = {
    currentSection: 'concept-intro',
    explorationPart: 'A',
    
    // Part A: Store Identifier
    identifierScenarios: [
        { id: 1, name: 'A compressed metal spring', answer: 'Energy in elastic potential store', isCorrect: null, chosen: null },
        { id: 2, name: 'A sports car speeding down a track', answer: 'Energy in kinetic store', isCorrect: null, chosen: null },
        { id: 3, name: 'An alkaline battery cell', answer: 'Energy in chemical potential store', isCorrect: null, chosen: null },
        { id: 4, name: 'A physics textbook raised 2m high', answer: 'Energy in gravitational potential store', isCorrect: null, chosen: null },
        { id: 5, name: 'A steaming cup of black coffee', answer: 'Energy in internal store', isCorrect: null, chosen: null },
        { id: 6, name: 'A uranium fuel rod in a reactor core', answer: 'Energy in nuclear store', isCorrect: null, chosen: null }
    ],

    // Part B: Pathway Builder
    builderScenarios: [
        {
            title: 'A Falling Tennis Ball',
            context: 'Gravity pulling a ball down',
            html: `<div class="scenario-static-box" style="font-size: 3.5rem;">🎾</div>`,
            start: 'Energy in gravitational potential store',
            transfer: 'Mechanical',
            end: 'Energy in kinetic store'
        },
        {
            title: 'A plant undergoing photosynthesis',
            context: 'Sunlight converting carbon dioxide and water into glucose',
            html: `<div class="scenario-static-box" style="font-size: 3.5rem;">🌱</div>`,
            start: 'Energy in nuclear store',
            transfer: 'Wave Propagation',
            end: 'Energy in chemical potential store'
        },
        {
            title: 'A battery powered fan',
            context: 'Chemical cells driving the rotation of a fan motor',
            html: `<div class="scenario-static-box" style="font-size: 3.5rem;">🌀</div>`,
            start: 'Energy in chemical potential store',
            transfer: 'Electrical',
            end: 'Energy in kinetic store'
        },
        {
            title: 'A heating coil in an electric kettle heating up water',
            context: 'Hot electric heating coil transferring heat to the surrounding water',
            html: `<div class="scenario-static-box" style="font-size: 3.5rem;">☕</div>`,
            start: 'Energy in internal store',
            transfer: 'Heating',
            end: 'Energy in internal store'
        },
        {
            title: 'A Catapult Launching a Stone',
            context: 'Stretched rubber band releasing a rock',
            html: `<div class="scenario-static-box" style="font-size: 3.5rem;">🎯</div>`,
            start: 'Energy in elastic potential store',
            transfer: 'Mechanical',
            end: 'Energy in kinetic store'
        }
    ],
    currentBuilderIndex: 0,
    builderUserChoices: { start: null, transfer: null, end: null },
    builderActiveSlot: null,

    // Quiz Data (30 questions pool)
    quizPool: [
        {
            type: 'store',
            question: 'Identify the primary energy store in a fully charged smartphone lithium battery.',
            options: ['Electrical energy store', 'Energy in internal store', 'Energy in chemical potential store', 'Energy in kinetic store'],
            correctIndex: 2,
            explanation: 'Batteries store energy in chemical bonds, representing energy in chemical potential store.'
        },
        {
            type: 'transfer',
            question: 'An electric hair dryer blows hot air. What transfer mechanism carries energy from the heating element to your wet hair?',
            options: ['Mechanical', 'Heating', 'Electrical', 'Wave Propagation'],
            correctIndex: 1,
            explanation: 'Energy is transferred from the higher-temperature element to cooler air via heating.'
        },
        {
            type: 'match',
            question: 'Match the pathway: A kid slides down a frictionless playground slide. Identify the ending store and the transfer mechanism.',
            options: [
                'End: Energy in kinetic store | Transfer: Mechanical',
                'End: Energy in elastic potential store | Transfer: Mechanical',
                'End: Energy in gravitational potential store | Transfer: Heating',
                'End: Energy in internal store | Transfer: Electrical'
            ],
            correctIndex: 0,
            explanation: 'The initial energy in gravitational potential store shifts to the energy in kinetic store via mechanical work done by gravity.'
        },
        {
            type: 'odd',
            question: 'Which of the following scenarios involves a DIFFERENT transfer mechanism than the other three?',
            options: [
                'Sound waves traveling from a loudspeaker to your ears',
                'Sunshine heating up a solar panel on an HDB roof',
                'A force pushing a shopping cart across the supermarket floor',
                'Laser light beam carrying signals along a fiber optic cable'
            ],
            correctIndex: 2,
            explanation: 'Pushing a shopping cart uses mechanical transfer, while the others use wave propagation (sound and EM waves).'
        },
        {
            type: 'tf',
            question: 'True or False: Energy in internal store includes the total potential and kinetic energies of the particles inside an object.',
            options: ['True', 'False'],
            correctIndex: 0,
            explanation: 'Energy in internal store is the sum of random kinetic energy and potential energy of the molecules in a substance.'
        },
        {
            type: 'store',
            question: 'When a piece of uranium nucleus undergoes fission inside a nuclear plant, which store decreases?',
            options: ['Energy in chemical potential store', 'Energy in internal store', 'Energy in nuclear store', 'Energy in elastic potential store'],
            correctIndex: 2,
            explanation: 'Nuclear reactions release energy from the energy in nuclear store of atomic nuclei.'
        },
        {
            type: 'transfer',
            question: 'A gymnast bounces high off a trampoline bed. What transfer mechanism shifts energy from the stretched trampoline springs to the gymnast?',
            options: ['Mechanical', 'Electrical', 'Heating', 'Wave Propagation'],
            correctIndex: 0,
            explanation: 'The elastic force exerted by the springs acts over a distance, transferring energy mechanically.'
        },
        {
            type: 'store',
            question: 'Identify the energy store in the air trapped inside a hot air balloon that is rising upwards.',
            options: ['Energy in kinetic store only', 'Energy in nuclear store', 'Energy in internal store (due to thermal temperature)', 'Energy in elastic potential store'],
            correctIndex: 2,
            explanation: 'Hot air particles have higher kinetic and potential energy, representing a larger energy in internal store.'
        },
        {
            type: 'transfer',
            question: 'What is the transfer mechanism when electromagnetic radiation (infrared radiation) warms a cold object?',
            options: ['Mechanical', 'Heating', 'Electrical', 'Wave Propagation'],
            correctIndex: 3,
            explanation: 'Electromagnetic radiation travels via waves, making this wave propagation.'
        },
        {
            type: 'match',
            question: 'Match the pathway: A heavy box is pushed up a rough ramp. Identify the ending store and the transfer mechanism.',
            options: [
                'End: Energy in gravitational potential store (and Energy in internal store) | Transfer: Mechanical',
                'End: Energy in kinetic store | Transfer: Electrical',
                'End: Energy in chemical potential store | Transfer: Wave Propagation',
                'End: Energy in nuclear store | Transfer: Heating'
            ],
            correctIndex: 0,
            explanation: 'Pushing the box does mechanical work, increasing its energy in gravitational potential store and energy in internal store (frictional heating).'
        },
        {
            type: 'tf',
            question: 'True or False: A book resting on the ground has zero total energy inside any of its stores.',
            options: ['True', 'False'],
            correctIndex: 1,
            explanation: 'Even on the ground, the book has energy in chemical potential store in its fibers, and energy in internal store due to its temperature.'
        },
        {
            type: 'odd',
            question: 'Odd one out: Which of these devices does NOT rely on electrical transfer to function?',
            options: [
                'A ceiling fan rotating in a classroom',
                'A wind-up clock ticking on a wall',
                'An electric stove boiling water',
                'A smartphone charger plugged into a wall plug'
            ],
            correctIndex: 1,
            explanation: 'A wind-up clock relies entirely on a mechanical spring (energy in elastic potential store) and mechanical transfer.'
        },
        {
            type: 'store',
            question: 'What energy store increases when a steel bow is pulled back by an archer?',
            options: ['Energy in chemical potential store', 'Energy in elastic potential store', 'Energy in gravitational potential store', 'Energy in nuclear store'],
            correctIndex: 1,
            explanation: 'The deformation of the bow structure stores energy in its energy in elastic potential store.'
        },
        {
            type: 'transfer',
            question: 'A lightning strike travels from a cloud to a lightning rod. What is the primary energy transfer mechanism during this event?',
            options: ['Electrical', 'Mechanical', 'Heating', 'Wave Propagation'],
            correctIndex: 0,
            explanation: 'A lightning bolt is a flow of electric charge (current), representing electrical transfer.'
        },
        {
            type: 'tf',
            question: 'True or False: Standard O-Level Physics teaches that "light" and "sound" are distinct energy stores.',
            options: ['True', 'False'],
            correctIndex: 1,
            explanation: 'Light and sound are wave propagation mechanisms, not energy stores.'
        },
        {
            type: 'match',
            question: 'Match the pathway: A microwave oven heats up a bowl of soup. Identify the ending store and the primary transfer mechanism.',
            options: [
                'End: Energy in internal store | Transfer: Wave Propagation',
                'End: Energy in kinetic store | Transfer: Mechanical',
                'End: Energy in chemical potential store | Transfer: Electrical',
                'End: Energy in gravitational potential store | Transfer: Heating'
            ],
            correctIndex: 0,
            explanation: 'Microwaves are electromagnetic waves (wave propagation) that increase the thermal/energy in internal store of the soup.'
        },
        {
            type: 'store',
            question: 'Identify the main energy store in a compressed gas canister used for portable stoves.',
            options: ['Energy in chemical potential store', 'Energy in elastic potential store', 'Energy in internal store', 'Energy in kinetic store'],
            correctIndex: 0,
            explanation: 'The butane gas inside the canister represents energy in chemical potential store before combustion.'
        },
        {
            type: 'transfer',
            question: 'A campfire warms campers sitting 2 meters away. What transfer mechanism explains the infrared radiation traveling to the campers?',
            options: ['Heating', 'Electrical', 'Mechanical', 'Wave Propagation'],
            correctIndex: 3,
            explanation: 'Infrared radiation is an electromagnetic wave, meaning the energy transfers via wave propagation.'
        },
        {
            type: 'odd',
            question: 'Odd one out: Which of these scenarios does NOT involve an energy in kinetic store?',
            options: [
                'A boulder rolling down Bukit Timah Hill',
                'A ceiling fan that has been turned off and is still spinning',
                'An HDB elevator sitting stationary on the 10th floor',
                'An MRT train decelerating as it enters a station'
            ],
            correctIndex: 2,
            explanation: 'A stationary elevator has no motion, so its energy in kinetic store is zero (it has energy in gravitational potential store).'
        },
        {
            type: 'tf',
            question: 'True or False: Doing work on an object always increases its energy in chemical potential store.',
            options: ['True', 'False'],
            correctIndex: 1,
            explanation: 'Doing work (mechanical transfer) usually increases kinetic, gravitational potential, or internal stores, not chemical potential stores.'
        },
        {
            type: 'store',
            question: 'A piece of hot coal cools down as it sits in a fireplace. Which store decreases?',
            options: ['Energy in nuclear store', 'Energy in chemical potential store', 'Energy in internal store', 'Energy in elastic potential store'],
            correctIndex: 2,
            explanation: 'The hot coal loses thermal energy, causing its energy in internal store to decrease.'
        },
        {
            type: 'transfer',
            question: 'A meteor burns up as it crashes through the Earth\'s atmosphere. Friction with air molecules transfers energy into the meteor. What is this transfer mechanism?',
            options: ['Mechanical', 'Electrical', 'Heating', 'Wave Propagation'],
            correctIndex: 0,
            explanation: 'Frictional force opposing the motion over a distance represents a mechanical transfer of energy.'
        },
        {
            type: 'match',
            question: 'Match the pathway: A solar panel on a house roof charges a backup battery. Identify the starting store of the energy source and the ending store of the battery.',
            options: [
                'Start: Energy in nuclear store (Sun) | End: Energy in chemical potential store',
                'Start: Energy in chemical potential store | End: Energy in kinetic store',
                'Start: Energy in internal store | End: Electrical transfer',
                'Start: Energy in kinetic store | End: Energy in elastic potential store'
            ],
            correctIndex: 0,
            explanation: 'Energy originates from fusion in the Sun (energy in nuclear store) and is stored inside the battery (energy in chemical potential store) after electrical transfer.'
        },
        {
            type: 'tf',
            question: 'True or False: Food contains energy stored in a energy in chemical potential store.',
            options: ['True', 'False'],
            correctIndex: 0,
            explanation: 'Digesting food breaks chemical bonds, releasing stored energy in chemical potential store for our bodies.'
        },
        {
            type: 'store',
            question: 'A compressed mattress springs back when you stand up. What store decreases as it decompresses?',
            options: ['Energy in kinetic store', 'Energy in gravitational potential store', 'Energy in elastic potential store', 'Energy in internal store'],
            correctIndex: 2,
            explanation: 'The decompression releases energy stored in the mattress\'s energy in elastic potential store.'
        },
        {
            type: 'transfer',
            question: 'An iron heats clothes. What is the transfer mechanism from the metal plate of the iron to the clothes?',
            options: ['Heating', 'Electrical', 'Mechanical', 'Wave Propagation'],
            correctIndex: 0,
            explanation: 'Direct contact transfers thermal energy from a hotter plate to cooler clothes via conduction (heating).'
        },
        {
            type: 'odd',
            question: 'Odd one out: Which of these matches contains an INCORRECT store/transfer classification?',
            options: [
                'Sunlight -> Wave Propagation',
                'Battery -> Energy in chemical potential store',
                'Electric Current -> Electrical Store',
                'Moving train -> Energy in kinetic store'
            ],
            correctIndex: 2,
            explanation: 'Electric current is an electrical transfer mechanism, not an energy store.'
        },
        {
            type: 'match',
            question: 'Match the pathway: A toy car is wound up and released, speeding across the room. Identify the transfer mechanism during release.',
            options: [
                'Mechanical',
                'Electrical',
                'Heating',
                'Wave Propagation'
            ],
            correctIndex: 0,
            explanation: 'The spring exerts a force on the wheels over a distance, transferring energy mechanically.'
        },
        {
            type: 'tf',
            question: 'True or False: According to the Law of Conservation of Energy, energy can be created if a system is highly efficient.',
            options: ['True', 'False'],
            correctIndex: 1,
            explanation: 'Energy can never be created or destroyed; it can only be stored or transferred from one form to another.'
        },
        {
            type: 'store',
            question: 'Identify the energy store that increases as a helium balloon ascends high into the sky.',
            options: ['Energy in gravitational potential store', 'Energy in elastic potential store', 'Energy in nuclear store', 'Energy in chemical potential store'],
            correctIndex: 0,
            explanation: 'As height above the ground increases, the energy in gravitational potential store increases.'
        }
    ],
    activeQuizQuestions: [],
    currentQuizIndex: 0,
    quizScore: 0,
    selectedQuizOption: null,

    // Flashcards Data (20 flashcards)
    flashcardPool: [
        { front: 'A moving MRT train', backStore: 'Energy in kinetic store', backDesc: 'Energy stored due to the motion of the heavy train.' },
        { front: 'A coconut hanging high on a tree', backStore: 'Energy in gravitational potential store', backDesc: 'Energy stored due to its position above the ground.' },
        { front: 'A lithium-ion phone battery', backStore: 'Energy in chemical potential store', backDesc: 'Energy stored within the chemical reactants inside the cell.' },
        { front: 'A stretched rubber slingshot', backStore: 'Energy in elastic potential store', backDesc: 'Energy stored due to the deformation of the elastic band.' },
        { front: 'A hot cup of Milo dinosaur', backStore: 'Energy in internal store', backDesc: 'The sum of random kinetic and potential energies of the drink\'s particles.' },
        { front: 'Uranium rod in power plant', backStore: 'Energy in nuclear store', backDesc: 'Energy stored in the binding forces holding atomic nuclei together.' },
        { front: 'A weightlifter lifting weights', backStore: 'Mechanical transfer', backDesc: 'The weightlifter exerts upward force, transferring energy over a distance.' },
        { front: 'Electricity powering a lamp', backStore: 'Electrical transfer', backDesc: 'Energy shifted along copper cables via flowing electrons.' },
        { front: 'Ice melting on a warm table', backStore: 'Heating transfer', backDesc: 'Conduction of thermal energy due to temperature differences.' },
        { front: 'Sound traveling from a speaker', backStore: 'Wave Propagation', backDesc: 'Mechanical vibrations pushing sound energy through air.' },
        { front: 'A torch light shining on a wall', backStore: 'Energy in chemical potential store → Light (Wave propagation) → Energy in internal store', backDesc: 'Battery energy converts to light wave, which warms up the wall.' },
        { front: 'An electric iron warming clothes', backStore: 'Electrical transfer → Energy in internal store (Heating)', backDesc: 'Electricity heats the plate, which conducts heat to the shirt.' },
        { front: 'Car braking to a full stop', backStore: 'Energy in kinetic store → Energy in internal store (Mechanical)', backDesc: 'Friction between brake pads and wheels converts motion into heat.' },
        { front: 'Food being digested and burned', backStore: 'Energy in chemical potential store → Energy in internal store', backDesc: 'Cellular respiration releases chemical bonds to keep body warm.' },
        { front: 'Sunlight shining on plants', backStore: 'Energy in nuclear store → Wave propagation → Energy in chemical potential store', backDesc: 'Sun\'s nuclear fusion releases light waves, fueling photosynthesis.' },
        { front: 'Wind turbine spinning in a breeze', backStore: 'Energy in kinetic store (wind) → Mechanical transfer → Electrical transfer', backDesc: 'Air forces blades to spin, rotating a generator to produce electric current.' },
        { front: 'Compressing a metal springs toy', backStore: 'Energy in chemical potential store (muscle) → Mechanical transfer → Energy in elastic potential store', backDesc: 'Arm muscles do work on the springs, storing elastic energy.' },
        { front: 'A buzzer sounding in a circuit', backStore: 'Electrical transfer → Wave propagation (Sound)', backDesc: 'Electric current energizes the buzzer to release sound waves.' },
        { front: 'Water falling down a waterfall', backStore: 'Energy in gravitational potential store → Mechanical transfer → Energy in kinetic store', backDesc: 'Gravity pulls water down, shifting height energy to velocity.' },
        { front: 'Rubbing hands together to warm up', backStore: 'Energy in chemical potential store → Mechanical transfer → Energy in internal store', backDesc: 'Muscles move hands against friction, raising skin temperature.' }
    ],
    currentFlashcardIndex: 0,
    isCardFlipped: false,
    reviewedCardIds: new Set()
};

// Lists of options for modals
const energyStores = [
    'Energy in kinetic store',
    'Energy in gravitational potential store',
    'Energy in chemical potential store',
    'Energy in elastic potential store',
    'Energy in internal store',
    'Energy in nuclear store'
];
const transferMechanisms = ['Mechanical', 'Electrical', 'Heating', 'Wave Propagation'];

// Init Application
window.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    initPartA();
    initPartB();
    initFlashcards();
});

// Setup Main Tab Navigation
function setupNavigation() {
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const target = tab.dataset.target;
            document.querySelectorAll('.app-section').forEach(sec => sec.classList.remove('active'));
            document.getElementById(target).classList.add('active');
            state.currentSection = target;

            // Handle section specific initializations
            if (target === 'exploration') {
                if (state.explorationPart === 'A') {
                    initPartA();
                } else {
                    initPartB();
                }
            } else if (target === 'flashcards') {
                initFlashcards();
            }
        });
    });
}

/* ==========================================================================
   SECTION 2A: Energy Store Identifier
   ========================================================================== */
function initPartA() {
    const grid = document.getElementById('store-identifier-grid');
    grid.innerHTML = '';

    state.identifierScenarios.forEach(item => {
        const card = document.createElement('div');
        card.className = 'scenario-card';
        card.id = `identifier-card-${item.id}`;
        
        let statusHtml = '';
        if (item.isCorrect === true) {
            card.classList.add('correct');
            statusHtml = `<span class="store-badge">${item.chosen} ✓</span>`;
        } else if (item.isCorrect === false) {
            card.classList.add('incorrect');
            statusHtml = `<span class="store-badge" style="background:rgba(255,0,127,0.15); border-color:var(--neon-magenta); color:var(--neon-magenta)">${item.chosen} ✗</span>`;
        } else {
            statusHtml = `<span class="store-badge" style="background:transparent; border-color:rgba(255,255,255,0.2); color:var(--text-secondary)">Tap to identify</span>`;
        }

        card.innerHTML = `
            <div class="scenario-card-title">${item.name}</div>
            ${statusHtml}
        `;

        card.addEventListener('click', () => {
            if (item.isCorrect) return; // Already solved
            openIdentifierSelection(item);
        });

        grid.appendChild(card);
    });
}

function openIdentifierSelection(item) {
    const listContainer = document.getElementById('modal-options-list');
    document.getElementById('modal-heading').innerText = 'Select Primary Energy Store';
    document.getElementById('modal-subheading').innerText = `Identify store for: "${item.name}"`;
    listContainer.innerHTML = '';

    energyStores.forEach(store => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerHTML = `<span>${store}</span> <span>&rarr;</span>`;
        btn.onclick = () => {
            closeOptionsModal();
            selectStoreAnswer(item.id, store);
        };
        listContainer.appendChild(btn);
    });

    document.getElementById('options-modal').classList.add('active');
}

function selectStoreAnswer(itemId, chosenStore) {
    const item = state.identifierScenarios.find(s => s.id === itemId);
    item.chosen = chosenStore;
    
    if (chosenStore === item.answer) {
        item.isCorrect = true;
        triggerCelebration(30);
    } else {
        item.isCorrect = false;
        // Reset card after short display delay so they can try again
        setTimeout(() => {
            item.isCorrect = null;
            item.chosen = null;
            initPartA();
        }, 1500);
    }
    initPartA();
}

function switchExplorationPart(part) {
    state.explorationPart = part;
    const btnA = document.getElementById('btn-part-a');
    const btnB = document.getElementById('btn-part-b');
    const panelA = document.getElementById('part-a-panel');
    const panelB = document.getElementById('part-b-panel');

    if (part === 'A') {
        btnA.classList.add('btn-primary');
        btnB.classList.remove('btn-primary');
        panelA.style.display = 'block';
        panelB.style.display = 'none';
        initPartA();
    } else {
        btnB.classList.add('btn-primary');
        btnA.classList.remove('btn-primary');
        panelB.style.display = 'block';
        panelA.style.display = 'none';
        initPartB();
    }
}

/* ==========================================================================
   SECTION 2B: Pathway Builder
   ========================================================================== */
function initPartB() {
    // Reset inputs
    state.builderUserChoices = { start: null, transfer: null, end: null };
    
    const sc = state.builderScenarios[state.currentBuilderIndex];
    document.getElementById('builder-scenario-title').innerText = sc.title;
    document.getElementById('builder-scenario-desc').innerText = sc.context;
    
    const animBox = document.getElementById('builder-animation-box');
    animBox.innerHTML = sc.html;

    updateSlotUI('start');
    updateSlotUI('transfer');
    updateSlotUI('end');
    
    document.getElementById('builder-feedback-msg').innerHTML = '';
    document.getElementById('builder-feedback-msg').style.color = 'var(--text-secondary)';

    // Reset arrows
    document.querySelector('#arrow-start-to-transfer svg').style.color = 'var(--text-secondary)';
    document.querySelector('#arrow-transfer-to-end svg').style.color = 'var(--text-secondary)';
}

function openSlotSelection(slotType) {
    state.builderActiveSlot = slotType;
    const listContainer = document.getElementById('modal-options-list');
    document.getElementById('modal-heading').innerText = slotType === 'transfer' ? 'Select Transfer Mechanism' : 'Select Energy Store';
    document.getElementById('modal-subheading').innerText = `Identify the correct step in the pathway.`;
    listContainer.innerHTML = '';

    const items = slotType === 'transfer' ? transferMechanisms : energyStores;

    items.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerHTML = `<span>${choice}</span> <span>&rarr;</span>`;
        btn.onclick = () => {
            closeOptionsModal();
            state.builderUserChoices[slotType] = choice;
            updateSlotUI(slotType);
        };
        listContainer.appendChild(btn);
    });

    document.getElementById('options-modal').classList.add('active');
}

function updateSlotUI(slotType) {
    const slot = document.getElementById(`slot-${slotType}`);
    const choice = state.builderUserChoices[slotType];
    
    if (choice) {
        slot.innerHTML = `<span class="slot-name">${choice}</span>`;
        slot.classList.add('filled');
    } else {
        slot.innerHTML = `<span class="slot-placeholder">Tap to choose</span>`;
        slot.classList.remove('filled');
    }
}

function checkPathwayAnswer() {
    const sc = state.builderScenarios[state.currentBuilderIndex];
    const user = state.builderUserChoices;

    if (!user.start || !user.transfer || !user.end) {
        showBuilderFeedback('Please fill out all spots in the pathway!', 'var(--neon-yellow)');
        return;
    }

    const startCorrect = user.start === sc.start;
    const transferCorrect = user.transfer === sc.transfer;
    const endCorrect = user.end === sc.end;

    if (startCorrect && transferCorrect && endCorrect) {
        showBuilderFeedback('Correct! Pathways connected successfully. ⚡', 'var(--neon-green)');
        triggerCelebration(40);
        
        // Highlight arrow glows
        document.querySelector('#arrow-start-to-transfer svg').style.color = 'var(--neon-cyan)';
        document.querySelector('#arrow-start-to-transfer svg').style.filter = 'drop-shadow(0 0 5px var(--neon-cyan))';
        document.querySelector('#arrow-transfer-to-end svg').style.color = 'var(--neon-magenta)';
        document.querySelector('#arrow-transfer-to-end svg').style.filter = 'drop-shadow(0 0 5px var(--neon-magenta))';
    } else {
        let msg = 'Incorrect pathway details. Try again! Details: ';
        let details = [];
        if (!startCorrect) details.push('Start Store');
        if (!transferCorrect) details.push('Transfer Mechanism');
        if (!endCorrect) details.push('End Store');
        msg += details.join(', ') + ' incorrect.';
        showBuilderFeedback(msg, 'var(--neon-magenta)');
    }
}

function showBuilderFeedback(msg, color) {
    const fb = document.getElementById('builder-feedback-msg');
    fb.innerHTML = msg;
    fb.style.color = color;
}

function nextBuilderScenario() {
    state.currentBuilderIndex = (state.currentBuilderIndex + 1) % state.builderScenarios.length;
    initPartB();
}

function closeOptionsModal() {
    document.getElementById('options-modal').classList.remove('active');
}

/* ==========================================================================
   SECTION 3 & 4: Quiz Engine
   ========================================================================== */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function startQuiz() {
    // Select 15 random questions from 30 pool
    const shuffledPool = shuffleArray([...state.quizPool]);
    state.activeQuizQuestions = shuffledPool.slice(0, 15);
    state.currentQuizIndex = 0;
    state.quizScore = 0;

    document.getElementById('quiz-lobby').style.display = 'none';
    document.getElementById('quiz-results').style.display = 'none';
    document.getElementById('quiz-play').style.display = 'block';

    loadQuizQuestion();
}

function loadQuizQuestion() {
    const q = state.activeQuizQuestions[state.currentQuizIndex];
    state.selectedQuizOption = null;

    // Set badge type
    const badge = document.getElementById('question-badge');
    badge.innerText = q.type.toUpperCase() + ' QUESTION';
    if (q.type === 'store' || q.type === 'tf') {
        badge.className = 'question-type-badge store';
    } else {
        badge.className = 'question-type-badge transfer';
    }

    // Progress info
    document.getElementById('quiz-question-num').innerText = `Question ${state.currentQuizIndex + 1} of 15`;
    const progressPercent = (state.currentQuizIndex / 15) * 100;
    document.getElementById('quiz-progress-bar').style.width = `${progressPercent}%`;
    document.getElementById('quiz-timer-score').innerText = `Score: ${state.quizScore}`;

    // Question body
    document.getElementById('question-text').innerText = q.question;
    
    // Set up options
    const optionsContainer = document.getElementById('question-options');
    optionsContainer.innerHTML = '';

    q.options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option';
        btn.innerText = opt;
        btn.onclick = () => selectQuizOption(index);
        optionsContainer.appendChild(btn);
    });

    // Reset explanation area
    const explanation = document.getElementById('question-explanation');
    explanation.style.display = 'none';
    explanation.innerHTML = '';

    // Disable Next button until selection
    document.getElementById('quiz-next-btn').disabled = true;
}

function selectQuizOption(index) {
    if (state.selectedQuizOption !== null) return; // Prevent double taps

    state.selectedQuizOption = index;
    const q = state.activeQuizQuestions[state.currentQuizIndex];
    const options = document.querySelectorAll('.quiz-option');

    // Disable all option hover styles
    options.forEach(opt => opt.classList.add('disabled'));

    if (index === q.correctIndex) {
        options[index].classList.add('correct-review');
        state.quizScore++;
        triggerCelebration(20);
    } else {
        options[index].classList.add('incorrect-review');
        options[q.correctIndex].classList.add('correct-review');
    }

    // Display one-line explanation feedback
    const explanation = document.getElementById('question-explanation');
    explanation.innerHTML = `<strong>Explanation:</strong> ${q.explanation}`;
    explanation.style.display = 'block';

    // Enable next button
    document.getElementById('quiz-timer-score').innerText = `Score: ${state.quizScore}`;
    document.getElementById('quiz-next-btn').disabled = false;
}

function nextQuizQuestion() {
    state.currentQuizIndex++;
    if (state.currentQuizIndex < 15) {
        loadQuizQuestion();
    } else {
        showQuizResults();
    }
}

function showQuizResults() {
    document.getElementById('quiz-play').style.display = 'none';
    document.getElementById('quiz-results').style.display = 'block';

    const numScore = document.getElementById('results-score-num');
    numScore.innerText = state.quizScore;

    const verdict = document.getElementById('results-verdict');
    const comment = document.getElementById('results-comment');

    if (state.quizScore >= 13) {
        verdict.innerText = 'Energy Master! ⚡';
        verdict.className = 'result-verdict master';
        comment.innerText = 'Exceptional job! You have fully mastered energy stores and transfer pathways.';
        triggerCelebration(100);
    } else if (state.quizScore >= 9) {
        verdict.innerText = 'Good effort!';
        verdict.className = 'result-verdict';
        comment.innerText = 'Review the transfer types and try again to hit the maximum score.';
    } else {
        verdict.innerText = 'Keep practising!';
        verdict.className = 'result-verdict';
        comment.innerText = 'Go back to the Explorer revision modules and retry to strengthen your fundamentals.';
    }
}

/* ==========================================================================
   SECTION 5: Flashcard Revision Mode
   ========================================================================== */
function initFlashcards() {
    state.isCardFlipped = false;
    document.getElementById('flashcard-deck').classList.remove('flipped');
    showFlashcardContent();
}

function showFlashcardContent() {
    const card = state.flashcardPool[state.currentFlashcardIndex];
    document.getElementById('card-front-text').innerText = card.front;
    document.getElementById('card-back-title').innerText = card.backStore;
    document.getElementById('card-back-desc').innerText = card.backDesc;

    // Track reviewed cards count
    state.reviewedCardIds.add(state.currentFlashcardIndex);
    document.getElementById('card-stats').innerText = `Reviewed: ${state.reviewedCardIds.size} / ${state.flashcardPool.length}`;
}

function flipFlashcard() {
    state.isCardFlipped = !state.isCardFlipped;
    const deck = document.getElementById('flashcard-deck');
    if (state.isCardFlipped) {
        deck.classList.add('flipped');
    } else {
        deck.classList.remove('flipped');
    }
}

function nextFlashcard() {
    state.isCardFlipped = false;
    document.getElementById('flashcard-deck').classList.remove('flipped');
    
    // Give half second for flip animation before swapping content
    setTimeout(() => {
        state.currentFlashcardIndex = (state.currentFlashcardIndex + 1) % state.flashcardPool.length;
        showFlashcardContent();
    }, 150);
}

function prevFlashcard() {
    state.isCardFlipped = false;
    document.getElementById('flashcard-deck').classList.remove('flipped');

    setTimeout(() => {
        state.currentFlashcardIndex = (state.currentFlashcardIndex - 1 + state.flashcardPool.length) % state.flashcardPool.length;
        showFlashcardContent();
    }, 150);
}

function shuffleFlashcards() {
    state.flashcardPool = shuffleArray([...state.flashcardPool]);
    state.currentFlashcardIndex = 0;
    state.reviewedCardIds.clear();
    initFlashcards();
}

/* ==========================================================================
   CELEBRATION ANIMATION (Confetti Particle Generator)
   ========================================================================== */
function triggerCelebration(particleCount) {
    const holder = document.getElementById('confetti-holder');
    const colors = ['#00f0ff', '#ff007f', '#39ff14', '#fffb00', '#9d4edd'];
    
    for (let i = 0; i < particleCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        
        // Random characteristics
        const color = colors[Math.floor(Math.random() * colors.length)];
        const left = Math.random() * 100; // view width %
        const size = Math.random() * 8 + 4; // size in px
        const duration = Math.random() * 2 + 1.5; // duration in seconds
        const delay = Math.random() * 0.5;

        confetti.style.background = color;
        confetti.style.left = `${left}vw`;
        confetti.style.width = `${size}px`;
        confetti.style.height = `${size}px`;
        confetti.style.animationDuration = `${duration}s`;
        confetti.style.animationDelay = `${delay}s`;
        
        // Add neon box shadow matching color
        confetti.style.boxShadow = `0 0 5px ${color}`;

        holder.appendChild(confetti);

        // Remove element after animation ends
        setTimeout(() => {
            confetti.remove();
        }, (duration + delay) * 1000);
    }
}
