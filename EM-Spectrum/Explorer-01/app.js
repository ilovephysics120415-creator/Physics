// Spectrum Regions Dataset
const spectrumData = [
    {
        id: "radio",
        name: "Radio Waves",
        wavelength: "> 1 m",
        wavelengthValue: 1e0, // Relative order for sorting
        frequency: "< 300 MHz",
        frequencyValue: 3e8,
        energy: "< 1.24 μeV",
        uses: [
            "AM/FM radio broadcasting",
            "Television signals transmission",
            "Mobile communication & Wi-Fi routers",
            "Radar and navigation tracking systems"
        ],
        hazards: [
            "Generally considered safe & non-ionizing",
            "Extremely high exposure can cause tissue heating"
        ],
        scaleTitle: "Football Field to House",
        scaleDesc: "Radio wavelengths can range from the size of a football field to a standard house, allowing them to pass through solid walls easily.",
        scaleIcon: "🏈",
        color: "var(--color-radio)",
        waveFreq: 0.005,
        waveSpeed: 0.02
    },
    {
        id: "microwave",
        name: "Microwaves",
        wavelength: "1 mm - 1 m",
        wavelengthValue: 1e-3,
        frequency: "300 MHz - 300 GHz",
        frequencyValue: 3e11,
        energy: "1.24 μeV - 1.24 meV",
        uses: [
            "Cooking and heating food quickly",
            "Satellite communication and GPS networks",
            "Speed cameras and traffic enforcement",
            "Bluetooth connections and wireless LAN"
        ],
        hazards: [
            "Can cause internal heating of body tissue at high levels",
            "Corneal damage (cataracts) from intense direct exposure"
        ],
        scaleTitle: "Honeybee to Coin",
        scaleDesc: "Microwaves have wavelengths roughly equivalent to the size of a honeybee or a coin, which interacts perfectly with water molecules.",
        scaleIcon: "🐝",
        color: "var(--color-microwave)",
        waveFreq: 0.015,
        waveSpeed: 0.04
    },
    {
        id: "infrared",
        name: "Infrared",
        wavelength: "700 nm - 1 mm",
        wavelengthValue: 7e-7,
        frequency: "300 GHz - 430 THz",
        frequencyValue: 4.3e14,
        energy: "1.24 meV - 1.7 eV",
        uses: [
            "TV remote control signal transmitters",
            "Thermal imaging cameras for night vision",
            "Short-range wireless data communication",
            "Infrared saunas and physical therapy heat lamps"
        ],
        hazards: [
            "Feels like heat, can cause thermal burns to skin",
            "Prolonged exposure can damage lens and retina"
        ],
        scaleTitle: "Pinpoint to Needle",
        scaleDesc: "Infrared wavelengths are about the size of a needle tip or a tiny pinpoint, carrying thermal energy released as heat.",
        scaleIcon: "📍",
        color: "var(--color-infrared)",
        waveFreq: 0.035,
        waveSpeed: 0.07
    },
    {
        id: "visible",
        name: "Visible Light",
        wavelength: "400 nm - 700 nm",
        wavelengthValue: 4e-7,
        frequency: "430 THz - 750 THz",
        frequencyValue: 7.5e14,
        energy: "1.7 eV - 3.1 eV",
        uses: [
            "Human vision and color perception",
            "Photography, lasers, and optical microscopes",
            "Fiber optic communications (high speed internet)",
            "Photosynthesis in plants to sustain life"
        ],
        hazards: [
            "High-intensity beams (like lasers) can damage the retina",
            "Generally harmless under everyday exposure conditions"
        ],
        scaleTitle: "Protozoan / Cell",
        scaleDesc: "Visible light waves are roughly the size of a single-celled protozoan. It is the only band humans can see naturally.",
        scaleIcon: "🦠",
        color: "var(--color-visible)",
        waveFreq: 0.08,
        waveSpeed: 0.12
    },
    {
        id: "ultraviolet",
        name: "Ultraviolet",
        wavelength: "10 nm - 400 nm",
        wavelengthValue: 1e-8,
        frequency: "750 THz - 30 PHz",
        frequencyValue: 3e16,
        energy: "3.1 eV - 124 eV",
        uses: [
            "Sterilization of medical tools and water purification",
            "Forensics and currency authentication (black lights)",
            "Stimulating Vitamin D production in human skin",
            "Tanning beds and polymer curing processes"
        ],
        hazards: [
            "Can cause sunburn, premature skin aging, and wrinkles",
            "Increased risk of skin cancers (melanoma)",
            "Can cause eye damage (photokeratitis)"
        ],
        scaleTitle: "Molecules & Virus",
        scaleDesc: "Ultraviolet waves are similar in scale to viruses and large molecules. They carry enough energy to damage chemical bonds.",
        scaleIcon: "🧬",
        color: "var(--color-ultraviolet)",
        waveFreq: 0.16,
        waveSpeed: 0.2
    },
    {
        id: "xray",
        name: "X-Rays",
        wavelength: "0.01 nm - 10 nm",
        wavelengthValue: 1e-11,
        frequency: "30 PHz - 30 EHz",
        frequencyValue: 3e19,
        energy: "124 eV - 124 keV",
        uses: [
            "Medical imaging (viewing bone fractures)",
            "Airport security screening of luggage",
            "Industrial inspection of welds and structural metals",
            "X-ray crystallography to determine molecular shapes"
        ],
        hazards: [
            "Ionizing radiation: can damage DNA and cellular structures",
            "Increases lifetime risk of developing cancer"
        ],
        scaleTitle: "Atom",
        scaleDesc: "X-ray wavelengths are about the size of an atom. Their high energy allows them to pass through soft human tissues easily.",
        scaleIcon: "⚛️",
        color: "var(--color-xray)",
        waveFreq: 0.32,
        waveSpeed: 0.35
    },
    {
        id: "gamma",
        name: "Gamma Rays",
        wavelength: "< 0.01 nm",
        wavelengthValue: 1e-13,
        frequency: "> 30 EHz",
        frequencyValue: 3e20,
        energy: "> 124 keV",
        uses: [
            "Cancer radiotherapy (killing cancer cells)",
            "Sterilizing medical equipment and food supply",
            "Nuclear engineering research and astrophysics",
            "PET scans in molecular medical diagnostics"
        ],
        hazards: [
            "Highly penetrating ionizing radiation: severe cellular damage",
            "Can cause acute radiation sickness and cellular mutation",
            "Must be shielded by thick lead or concrete walls"
        ],
        scaleTitle: "Atomic Nuclei",
        scaleDesc: "Gamma rays are the shortest and most energetic waves, equivalent to the size of an atomic nucleus. They are born in nuclear events.",
        scaleIcon: "💫",
        color: "var(--color-gamma)",
        waveFreq: 0.6,
        waveSpeed: 0.5
    }
];

// App State
let activeTab = "map-tab";
let activeRegionId = null;
let currentPhase = 0;
let matchScore = 0;
let matchedItems = {}; // targetId: itemText
let draggedItemData = null;

// DOM Elements
const navButtons = document.querySelectorAll(".nav-btn");
const tabContents = document.querySelectorAll(".tab-content");
const spectrumBar = document.getElementById("spectrum-bar");
const detailsCard = document.getElementById("details-card");
const scaleVisual = document.getElementById("scale-visual");
const scaleTitle = document.getElementById("scale-title");
const scaleDesc = document.getElementById("scale-desc");
const scaleIcon = document.getElementById("scale-icon");

// --- NAVIGATION ---
navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const tabId = btn.getAttribute("data-tab");
        navButtons.forEach(b => b.classList.remove("active"));
        tabContents.forEach(tc => tc.classList.remove("active"));
        
        btn.classList.add("active");
        document.getElementById(tabId).classList.add("active");
        
        activeTab = tabId;
        if (tabId === "match-tab") initMatchQuiz();
        if (tabId === "order-tab") initOrderQuiz();
    });
});

// --- DYNAMIC WAVE ANIMATION ---
function animateWave() {
    const svg = document.getElementById("wave-svg");
    const path = document.getElementById("wave-path");
    if (!svg || !path) return;

    const width = svg.clientWidth || 1200;
    const height = svg.clientHeight || 120;
    const centerY = height / 2;

    // Determine current wave configuration based on activeRegionId
    let freq = 0.02;
    let speed = 0.05;
    
    if (activeRegionId) {
        const region = spectrumData.find(r => r.id === activeRegionId);
        if (region) {
            freq = region.waveFreq;
            speed = region.waveSpeed;
        }
    } else {
        // Default gradient spectrum wave across the screen
        freq = null; 
    }

    currentPhase += speed;

    let pathD = `M 0 ${centerY}`;
    
    for (let x = 0; x <= width; x += 2) {
        let y = centerY;
        
        if (freq !== null) {
            // Constant frequency based on selected region
            const amplitude = 35 * Math.sin(x / 100); // Taper amplitude at edges
            y = centerY + (30 * Math.sin(x * freq + currentPhase));
        } else {
            // Dynamic variable frequency (increasing from left to right)
            // Left (Radio) is low frequency, Right (Gamma) is high frequency
            const progress = x / width;
            const variableFreq = 0.003 + (progress * 0.18);
            y = centerY + (25 * Math.sin(x * variableFreq + currentPhase));
        }
        
        pathD += ` L ${x} ${y}`;
    }

    path.setAttribute("d", pathD);
    requestAnimationFrame(animateWave);
}

// --- SPECTRUM MAP LOGIC ---
function initSpectrumMap() {
    spectrumBar.innerHTML = "";
    
    spectrumData.forEach(region => {
        const div = document.createElement("div");
        div.className = "spectrum-region";
        div.id = `region-${region.id}`;
        div.style.backgroundColor = region.color;
        div.textContent = region.name;
        
        div.addEventListener("click", () => {
            selectRegion(region.id);
        });
        
        spectrumBar.appendChild(div);
    });
}

function selectRegion(regionId) {
    activeRegionId = regionId;
    
    // Update active state in spectrum bar
    document.querySelectorAll(".spectrum-region").forEach(el => {
        el.classList.remove("active");
    });
    document.getElementById(`region-${regionId}`).classList.add("active");
    
    const region = spectrumData.find(r => r.id === regionId);
    if (!region) return;
    
    // Update Details Card
    detailsCard.style.setProperty('--badge-color', region.color);
    detailsCard.innerHTML = `
        <div class="details-content">
            <div class="details-header">
                <h2>${region.name}</h2>
                <span class="badge" style="background-color: rgba(255,255,255,0.08); border: 1px solid ${region.color}; color: ${region.color}">${region.id}</span>
            </div>
            
            <div class="metrics-grid">
                <div class="metric-box">
                    <div class="metric-label">Wavelength</div>
                    <div class="metric-value">${region.wavelength}</div>
                </div>
                <div class="metric-box">
                    <div class="metric-label">Frequency</div>
                    <div class="metric-value">${region.frequency}</div>
                </div>
                <div class="metric-box">
                    <div class="metric-label">Energy</div>
                    <div class="metric-value">${region.energy}</div>
                </div>
            </div>
            
            <div class="info-sections">
                <div class="info-block">
                    <h4>Uses / Applications</h4>
                    <ul>
                        ${region.uses.map(use => `<li>${use}</li>`).join('')}
                    </ul>
                </div>
                <div class="info-block">
                    <h4>Potential Hazards</h4>
                    <ul>
                        ${region.hazards.map(hazard => `<li>${hazard}</li>`).join('')}
                    </ul>
                </div>
            </div>
        </div>
    `;
    
    // Update Scale Comparison Card
    scaleVisual.style.backgroundColor = `rgba(255, 255, 255, 0.04)`;
    scaleIcon.textContent = region.scaleIcon;
    scaleTitle.textContent = region.scaleTitle;
    scaleDesc.textContent = region.scaleDesc;
}

// --- QUIZ 1: MATCHING QUIZ ---
function initMatchQuiz() {
    const dragContainer = document.getElementById("drag-items-container");
    const dropContainer = document.getElementById("drop-targets-container");
    
    dragContainer.innerHTML = "";
    dropContainer.innerHTML = "";
    matchScore = 0;
    matchedItems = {};
    updateMatchScoreDisplay();
    
    // Create random list of matches (3 unique typical uses from each region)
    const matchQuestions = [];
    spectrumData.forEach(region => {
        // Pick 3 random uses (shuffle and slice)
        const sampledUses = [...region.uses].sort(() => Math.random() - 0.5).slice(0, 3);
        sampledUses.forEach(useText => {
            matchQuestions.push({
                regionId: region.id,
                regionName: region.name,
                color: region.color,
                useText: useText
            });
        });
    });
    
    // Shuffle drag items
    const shuffledQuestions = [...matchQuestions].sort(() => Math.random() - 0.5);
    
    shuffledQuestions.forEach((q, index) => {
        const item = document.createElement("div");
        item.className = "drag-item";
        item.draggable = true;
        item.id = `drag-item-${index}`;
        item.dataset.regionId = q.regionId;
        item.textContent = q.useText;
        
        item.addEventListener("dragstart", (e) => {
            item.classList.add("dragging");
            draggedItemData = {
                id: item.id,
                regionId: q.regionId,
                text: q.useText
            };
        });
        
        item.addEventListener("dragend", () => {
            item.classList.remove("dragging");
            draggedItemData = null;
        });
        
        dragContainer.appendChild(item);
    });
    
    // Create Drop Targets (all 7 regions, each with 3 distinct slots)
    spectrumData.forEach(region => {
        const dropCard = document.createElement("div");
        dropCard.className = "drop-target-card";
        dropCard.dataset.regionId = region.id;
        
        dropCard.innerHTML = `
            <div class="drop-target-header">
                <span class="drop-target-name">${region.name}</span>
                <span class="badge" style="background-color: rgba(255,255,255,0.05); color: ${region.color}">${region.name[0]}</span>
            </div>
            <div class="slots-container">
                <div class="drop-slot" data-region-id="${region.id}" data-slot-index="0"></div>
                <div class="drop-slot" data-region-id="${region.id}" data-slot-index="1"></div>
                <div class="drop-slot" data-region-id="${region.id}" data-slot-index="2"></div>
            </div>
        `;
        
        const slots = dropCard.querySelectorAll(".drop-slot");
        slots.forEach(slot => {
            slot.addEventListener("dragover", (e) => {
                e.preventDefault();
                if (slot.children.length === 0) {
                    slot.classList.add("drag-over");
                }
            });
            
            slot.addEventListener("dragleave", () => {
                slot.classList.remove("drag-over");
            });
            
            slot.addEventListener("drop", (e) => {
                e.preventDefault();
                slot.classList.remove("drag-over");
                
                if (draggedItemData && slot.children.length === 0) {
                    const targetRegionId = slot.dataset.regionId;
                    const matches = draggedItemData.regionId === targetRegionId;
                    const slotKey = `${targetRegionId}-${slot.dataset.slotIndex}`;
                    
                    matchedItems[slotKey] = draggedItemData.text;
                    
                    // Add matched card visual inside the slot
                    slot.innerHTML = `
                        <div class="matched-item" style="width: 100%;">
                            <span>${draggedItemData.text}</span>
                            <button class="remove-btn">&times;</button>
                        </div>
                    `;
                    
                    // Hide drag source
                    const originalDragItem = document.getElementById(draggedItemData.id);
                    if (originalDragItem) originalDragItem.style.display = "none";
                    
                    // Verify correctness
                    if (matches) {
                        slot.classList.add("correct");
                        matchScore++;
                    } else {
                        slot.classList.add("incorrect");
                    }
                    
                    // Add removal event
                    slot.querySelector(".remove-btn").addEventListener("click", () => {
                        slot.innerHTML = "";
                        slot.classList.remove("correct", "incorrect");
                        if (matches) {
                            matchScore--;
                        }
                        delete matchedItems[slotKey];
                        if (originalDragItem) originalDragItem.style.display = "block";
                        updateMatchScoreDisplay();
                    });
                    
                    updateMatchScoreDisplay();
                }
            });
        });
        
        dropContainer.appendChild(dropCard);
    });
}

function updateMatchScoreDisplay() {
    document.getElementById("match-score").textContent = matchScore;
}

document.getElementById("reset-match-btn").addEventListener("click", initMatchQuiz);


// --- QUIZ 2: ORDERING QUIZ ---
let orderListItems = [];

function initOrderQuiz() {
    const orderContainer = document.getElementById("order-list-container");
    const feedbackBanner = document.getElementById("order-feedback");
    
    orderContainer.innerHTML = "";
    feedbackBanner.style.display = "none";
    
    // Shuffle the 7 regions
    orderListItems = [...spectrumData].sort(() => Math.random() - 0.5);
    
    renderOrderList();
}

function renderOrderList() {
    const orderContainer = document.getElementById("order-list-container");
    orderContainer.innerHTML = "";
    
    orderListItems.forEach((region, index) => {
        const item = document.createElement("div");
        item.className = "order-card";
        item.draggable = true;
        item.dataset.index = index;
        
        item.innerHTML = `
            <div class="order-card-left">
                <span class="drag-handle">☰</span>
                <span class="order-index">${index + 1}</span>
                <span class="order-name">${region.name}</span>
            </div>
            <div class="order-spec">${region.wavelength} &bull; ${region.frequency}</div>
        `;
        
        // Drag Events for list reordering
        item.addEventListener("dragstart", (e) => {
            item.classList.add("dragging");
            e.dataTransfer.setData("text/plain", index);
        });
        
        item.addEventListener("dragend", () => {
            item.classList.remove("dragging");
        });
        
        item.addEventListener("dragover", (e) => {
            e.preventDefault();
            const draggingEl = orderContainer.querySelector(".dragging");
            const siblings = [...orderContainer.querySelectorAll(".order-card:not(.dragging)")];
            
            const nextSibling = siblings.find(sibling => {
                const box = sibling.getBoundingClientRect();
                const offset = e.clientY - box.top - box.height / 2;
                return offset < 0;
            });
            
            if (nextSibling) {
                orderContainer.insertBefore(draggingEl, nextSibling);
            } else {
                orderContainer.appendChild(draggingEl);
            }
        });
        
        item.addEventListener("drop", (e) => {
            e.preventDefault();
            // Recompute our local array based on the DOM nodes order
            const currentDOMCards = [...orderContainer.querySelectorAll(".order-card")];
            const newOrder = currentDOMCards.map(card => {
                const originalIndex = parseInt(card.dataset.index);
                return orderListItems[originalIndex];
            });
            orderListItems = newOrder;
            renderOrderList();
        });
        
        orderContainer.appendChild(item);
    });
}

function checkOrder() {
    const criteria = document.getElementById("order-criteria").value;
    const feedbackBanner = document.getElementById("order-feedback");
    
    // Formulate expected correct sequence order
    let correctSequence = [...spectrumData];
    
    if (criteria === "wavelength-desc") {
        // Radio (longest) to Gamma (shortest)
        // Already naturally ordered in spectrumData
    } else if (criteria === "wavelength-asc") {
        // Gamma (shortest) to Radio (longest)
        correctSequence.reverse();
    } else if (criteria === "frequency-asc") {
        // Radio (lowest) to Gamma (highest)
        // Same as wavelength-desc
    } else if (criteria === "frequency-desc") {
        // Gamma (highest) to Radio (lowest)
        correctSequence.reverse();
    }
    
    let allCorrect = true;
    for (let i = 0; i < orderListItems.length; i++) {
        if (orderListItems[i].id !== correctSequence[i].id) {
            allCorrect = false;
            break;
        }
    }
    
    feedbackBanner.className = "feedback-banner " + (allCorrect ? "success" : "error");
    if (allCorrect) {
        feedbackBanner.textContent = "🎉 Outstanding! You ordered the electromagnetic spectrum perfectly.";
    } else {
        feedbackBanner.textContent = "❌ Incorrect sequence. Try shifting the regions around and double checking their wavelengths/frequencies.";
    }
}

document.getElementById("check-order-btn").addEventListener("click", checkOrder);
document.getElementById("reset-order-btn").addEventListener("click", initOrderQuiz);
document.getElementById("order-criteria").addEventListener("change", initOrderQuiz);


// --- INITIALIZATION ---
window.addEventListener("DOMContentLoaded", () => {
    initSpectrumMap();
    animateWave();
    
    // Pre-select radio waves to get the user started
    selectRegion("radio");
});
