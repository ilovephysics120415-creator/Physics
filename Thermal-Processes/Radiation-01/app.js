// STATE AND CONSTANTS
const state = {
    activeTab: 'section-sim', // section-sim, section-cards, section-quiz
    simSubtab: 'emission', // emission, absorption
    
    // Left surface settings
    left: {
        color: 'black', // black, white
        texture: 'dull', // dull, shiny
        temp: 100, // 20 to 200
        area: 'large' // small, large
    },
    // Right surface settings
    right: {
        color: 'white', // black, white
        texture: 'shiny', // dull, shiny
        temp: 40, // 20 to 200
        area: 'small' // small, large
    },

    // Flashcard deck state
    flashcards: [],
    currentCardIndex: 0,

    // Quiz state
    quizQuestions: [],
    currentQuestionIndex: 0,
    score: 0,
    quizActive: false,
    quizAnswered: false
};

// FLASHCARDS DATA
const FLASHCARDS_POOL = [
    {
        q: "What is the definition of thermal radiation?",
        a: "Thermal radiation is the transfer of thermal energy by electromagnetic waves (mainly infrared radiation) without requiring a material medium."
    },
    {
        q: "Why does thermal radiation require no material medium?",
        a: "Because it travels as electromagnetic waves (which are part of the EM spectrum), allowing it to travel through a vacuum (empty space)."
    },
    {
        q: "Which surface colour is the best emitter and absorber of radiation?",
        a: "A matt black (black and dull) surface is the best emitter and the best absorber of thermal radiation."
    },
    {
        q: "Which surface colour is the poorest emitter and absorber of radiation?",
        a: "A shiny white (or silver) surface is the poorest emitter and the poorest absorber (best reflector) of thermal radiation."
    },
    {
        q: "How does surface texture affect the rate of emission and absorption?",
        a: "Dull, rough surfaces have microscopic irregularities that increase effective area, making them better emitters/absorbers than smooth, shiny surfaces."
    },
    {
        q: "What is the effect of surface temperature on the rate of emission?",
        a: "The higher the temperature of a surface relative to its surroundings, the higher its rate of thermal radiation emission."
    },
    {
        q: "What is the effect of surface area on the rate of emission?",
        a: "A larger surface area provides more space for electromagnetic waves to escape, thereby increasing the rate of emission."
    },
    {
        q: "What is the fundamental link between emission and absorption ability?",
        a: "Good emitters of radiation are also good absorbers of radiation. Poor emitters are also poor absorbers (but good reflectors)."
    },
    {
        q: "Why are shiny white or silver coatings used on objects that need to stay cool?",
        a: "They are poor absorbers (reflect most incident radiation away) and poor emitters (prevent heat loss if containing hot substances)."
    },
    {
        q: "Why are solar panels or water heaters painted dull black?",
        a: "Dull black surfaces are excellent absorbers of thermal radiation, maximizing the rate of heat absorption from sunlight."
    },
    {
        q: "Give one everyday example of an application utilizing a good emitter and a good absorber.",
        a: "Good absorber: Solar water heater tubes (black). Good emitter: Heat sinks on computer processors (black, ribbed to increase surface area)."
    }
];

// QUIZ POOL (30 O-LEVEL CONCEPTUAL QUESTIONS)
const QUIZ_POOL = [
    {
        q: "A metal block is painted dull black, has a surface area of 100 cm², and is heated to 180°C. How is this block classified as an emitter?",
        options: ["Strong emitter", "Weak emitter", "Perfect reflector", "Non-emitter"],
        answer: 0,
        explanation: "Dull black, large surface area, and high temperature are all factors that make it a very strong emitter."
    },
    {
        q: "Which of the following surfaces at 80°C will emit thermal radiation at the fastest rate?",
        options: [
            "A large surface area painted dull black",
            "A large surface area painted shiny white",
            "A small surface area painted dull black",
            "A small surface area painted shiny white"
        ],
        answer: 0,
        explanation: "Black color, dull texture, and a larger surface area maximize the rate of emission of thermal radiation."
    },
    {
        q: "A vacuum flask has shiny silvered walls. How does this feature reduce heat transfer?",
        options: [
            "It is a poor absorber and poor emitter of radiation",
            "It conducts heat away from the liquid quickly",
            "It sets up convection currents in the vacuum",
            "It increases the rate of condensation"
        ],
        answer: 0,
        explanation: "Silver/shiny surfaces are poor emitters of radiation (minimizes heat loss from inside) and poor absorbers/good reflectors (minimizes heat entering)."
    },
    {
        q: "True or False: 'Thermal radiation requires a physical medium like air or solid to travel through.'",
        options: ["True", "False"],
        answer: 1,
        explanation: "False. Radiation travels as electromagnetic waves, which can pass through the vacuum of space."
    },
    {
        q: "True or False: 'An object that is highly efficient at emitting radiation is also highly efficient at absorbing it.'",
        options: ["True", "False"],
        answer: 0,
        explanation: "True. Good emitters are always good absorbers. This is a fundamental thermodynamic principle."
    },
    {
        q: "Which combination of colour and texture results in the highest rate of absorption of thermal radiation?",
        options: [
            "Dull black",
            "Shiny black",
            "Dull white",
            "Shiny white"
        ],
        answer: 0,
        explanation: "Dull black surfaces absorb almost all incident infrared radiation, making them the most efficient absorbers."
    },
    {
        q: "Which combination of surface properties makes the poorest absorber (best reflector) of radiation?",
        options: [
            "Shiny white",
            "Dull white",
            "Shiny black",
            "Dull black"
        ],
        answer: 0,
        explanation: "Shiny white (or shiny silver) surfaces reflect the majority of radiation lines that fall on them."
    },
    {
        q: "Why are houses in hot, sunny countries often painted white?",
        options: [
            "White surfaces are poor absorbers of solar radiation",
            "White surfaces are excellent emitters of radiation",
            "White surfaces conduct heat better",
            "White surfaces prevent convection currents"
        ],
        answer: 0,
        explanation: "White is a poor absorber (good reflector) of radiation, reflecting the Sun's heat away to keep the house interior cool."
    },
    {
        q: "What happens to the rate of emission of radiation from an object when its temperature increases?",
        options: [
            "The rate of emission increases",
            "The rate of emission decreases",
            "The rate of emission remains unchanged",
            "Emission stops completely"
        ],
        answer: 0,
        explanation: "Higher temperatures cause atoms to vibrate more vigorously, increasing the rate of electromagnetic wave emission."
    },
    {
        q: "If you decrease the surface area of a hot object, what is the effect on its emission rate of radiation?",
        options: [
            "The emission rate decreases",
            "The emission rate increases",
            "The emission rate remains the same",
            "No radiation is emitted at all"
        ],
        answer: 0,
        explanation: "Smaller surface area means less surface space is available from which waves can radiate, decreasing the overall emission rate."
    },
    {
        q: "Which of the following factors does NOT affect the rate of absorption of incident radiation on an object's surface?",
        options: [
            "The surface area of the object",
            "The colour of the surface",
            "The texture of the surface",
            "The temperature of the object"
        ],
        answer: 3,
        explanation: "The rate of absorption of incoming radiation is determined by surface characteristics (colour, texture). Temperature affects emission rate, not the capability to absorb."
    },
    {
        q: "Two identical metal cans, one painted dull black and one shiny white, are filled with cold water and placed in direct sunlight. Which can heats up faster?",
        options: [
            "The dull black can, because it is a better absorber",
            "The shiny white can, because it is a better reflector",
            "Both cans heat up at exactly the same rate",
            "The shiny white can, because it is a better absorber"
        ],
        answer: 0,
        explanation: "Dull black is a much better absorber of solar radiation, absorbing heat at a faster rate and warming the water quicker."
    },
    {
        q: "Two identical metal cans, one painted dull black and one shiny white, are filled with hot water at 90°C and placed in a cool room. Which can cools down faster?",
        options: [
            "The dull black can, because it is a better emitter",
            "The shiny white can, because it is a better absorber",
            "Both cans cool down at the same rate",
            "The shiny white can, because it is a better emitter"
        ],
        answer: 0,
        explanation: "Dull black is a much better emitter of thermal radiation, losing heat to the surroundings at a faster rate."
    },
    {
        q: "Why are the cooling fins on the back of a domestic refrigerator painted dull black?",
        options: [
            "To maximize the rate of heat emission into the surroundings",
            "To reflect heat back into the refrigerator",
            "To prevent conduction from occurring",
            "To make the refrigerator look modern"
        ],
        answer: 0,
        explanation: "Dull black surfaces are excellent emitters, transferring heat from the coolant gas into the air efficiently via radiation."
    },
    {
        q: "Which statement about thermal radiation is correct?",
        options: [
            "It travels at the speed of light in a vacuum",
            "It can only travel through solid materials",
            "It is a form of convection current",
            "It requires the movement of air particles"
        ],
        answer: 0,
        explanation: "Since radiation consists of electromagnetic waves, it travels at the speed of light (3 × 10⁸ m/s) in a vacuum."
    },
    {
        q: "Why does a car with a black interior feel much hotter than a car with a white interior when parked in the sun?",
        options: [
            "Black surfaces absorb solar radiation much faster",
            "Black surfaces conduct heat better than white surfaces",
            "White surfaces emit heat at a faster rate than black",
            "Convection cannot occur inside a white car"
        ],
        answer: 0,
        explanation: "The black interior absorbs a higher percentage of the incident solar radiation, converting it to internal thermal energy."
    },
    {
        q: "What type of wave is thermal radiation?",
        options: [
            "Electromagnetic wave",
            "Longitudinal sound wave",
            "Mechanical water wave",
            "Seismic wave"
        ],
        answer: 0,
        explanation: "Thermal radiation consists of electromagnetic waves, primarily in the infrared region of the spectrum."
    },
    {
        q: "Which surface is the best reflector of thermal radiation?",
        options: [
            "Shiny white",
            "Dull white",
            "Shiny black",
            "Dull black"
        ],
        answer: 0,
        explanation: "A shiny white or silver surface reflects the highest proportion of incident thermal radiation."
    },
    {
        q: "If a hot object is placed in a vacuum, how can heat escape from it?",
        options: [
            "Only by radiation",
            "By conduction and radiation",
            "By convection and radiation",
            "Conduction, convection, and radiation"
        ],
        answer: 0,
        explanation: "Conduction and convection both require a material medium (particles) to transfer heat. In a vacuum, only radiation can occur."
    },
    {
        q: "Why do firemen wear shiny, reflective suits when entering a burning building?",
        options: [
            "To reflect intense radiant heat away from their bodies",
            "To emit their body heat more effectively",
            "To prevent convection currents from reaching them",
            "To increase conduction to their suits"
        ],
        answer: 0,
        explanation: "The shiny surface reflects the high amount of thermal radiation emitted by the fire, protecting the firefighter."
    },
    {
        q: "A hot block at 150°C is placed in a room. Which factor will NOT increase its rate of heat loss by radiation?",
        options: [
            "Painting it white",
            "Increasing its surface area",
            "Increasing its temperature to 200°C",
            "Painting it dull black"
        ],
        answer: 0,
        explanation: "Painting it white makes it a poorer emitter, which will decrease (not increase) its rate of heat loss."
    },
    {
        q: "Why is the heating element of a kettle placed at the bottom, but the outer surface of the kettle is made shiny?",
        options: [
            "The shiny exterior reduces heat loss by radiation",
            "The shiny exterior increases conduction into the water",
            "The shiny exterior creates a vacuum inside",
            "The shiny exterior absorbs heat from the air"
        ],
        answer: 0,
        explanation: "A shiny outer surface is a poor emitter, minimizing the rate of heat lost to the surrounding air by radiation."
    },
    {
        q: "Which has a higher rate of radiation emission: a shiny black object or a dull black object of the same shape, size, and temperature?",
        options: [
            "The dull black object",
            "The shiny black object",
            "They emit at the exact same rate",
            "It depends on the air pressure"
        ],
        answer: 0,
        explanation: "Dull texture is a more effective emitter of thermal radiation than a shiny texture, even if both are black."
    },
    {
        q: "If you place a black object and a white object in a dark, cold freezer, which one will emit radiation faster?",
        options: [
            "The black object",
            "The white object",
            "Both will emit at the same rate",
            "Neither will emit radiation in the cold"
        ],
        answer: 0,
        explanation: "Even in a cold environment, the black object remains a better emitter of radiation than the white object."
    },
    {
        q: "Why are solar panels covered in dark glass instead of clear, shiny glass?",
        options: [
            "To absorb more incident thermal radiation",
            "To reflect sunlight to surrounding areas",
            "To prevent heat from escaping by convection",
            "To insulate the panel from cold winds"
        ],
        answer: 0,
        explanation: "Dark surfaces absorb thermal energy from sunlight at a much higher rate, improving panel efficiency."
    },
    {
        q: "Which object will reach thermal equilibrium with its surroundings first when placed under a hot lamp?",
        options: [
            "An object with a dull black surface",
            "An object with a shiny silver surface",
            "Both reach equilibrium at the exact same time",
            "Neither object will absorb heat"
        ],
        answer: 0,
        explanation: "The dull black object absorbs heat at a faster rate, allowing it to heat up and adjust its temperature quicker."
    },
    {
        q: "Why are pipes at the back of air conditioners often painted dull black?",
        options: [
            "To emit unwanted heat energy into the atmosphere efficiently",
            "To absorb heat from the outdoor environment",
            "To prevent condensation on the pipe walls",
            "To reduce the friction of flow inside"
        ],
        answer: 0,
        explanation: "Being excellent emitters, dull black surfaces release heat from the refrigerant gas into the air rapidly."
    },
    {
        q: "Which of the following is the main reason why vacuum flasks are double-walled with a vacuum in between?",
        options: [
            "To stop conduction and convection",
            "To stop radiation",
            "To reflect heat waves",
            "To increase the weight of the flask"
        ],
        answer: 0,
        explanation: "Conduction and convection need a material medium. The vacuum stops these two modes of heat transfer completely."
    },
    {
        q: "If an object is a good reflector of radiation, what can you conclude about its absorption and emission qualities?",
        options: [
            "It is a poor absorber and a poor emitter",
            "It is a good absorber and a good emitter",
            "It is a good absorber but a poor emitter",
            "It is a poor absorber but a good emitter"
        ],
        answer: 0,
        explanation: "A good reflector bounces waves away (poor absorber) and does not radiate well (poor emitter)."
    },
    {
        q: "Which statement correctly describes how radiation travels from the Sun to the Earth?",
        options: [
            "It travels through a vacuum as electromagnetic waves",
            "It travels through air molecules by conduction",
            "It travels through empty space by convection currents",
            "It requires water vapour to carry the heat"
        ],
        answer: 0,
        explanation: "The space between Sun and Earth is a vacuum; heat can only cross this gap as electromagnetic radiation."
    }
];

// CANVAS ANIMATION SYSTEMS

// 1. Particle Systems
class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    burst(x, y, color) {
        for (let i = 0; i < 40; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 5;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1, // slight upward bias
                radius: 2 + Math.random() * 3,
                color: color,
                alpha: 1,
                decay: 0.015 + Math.random() * 0.02
            });
        }
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= p.decay;
            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        ctx.save();
        for (const p of this.particles) {
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}

const celebrationParticles = new ParticleSystem();

// Intro Animation Canvas Loops
let introPart1Id = null;
let introPart2Id = null;
let simLeftId = null;
let simRightId = null;

function stopAllAnimations() {
    if (introPart1Id) cancelAnimationFrame(introPart1Id);
    if (introPart2Id) cancelAnimationFrame(introPart2Id);
    if (simLeftId) cancelAnimationFrame(simLeftId);
    if (simRightId) cancelAnimationFrame(simRightId);
}

// INTRO PART 1 CANVAS
function runIntroPart1() {
    const canvas = document.getElementById('canvas-intro-part1');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Set internal size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    let time = 0;
    const waves = [];

    // Add new wave lines occasionally
    function addWave() {
        waves.push({
            x: 60,
            y: canvas.height / 2,
            progress: 0,
            amplitude: 15 + Math.random() * 10,
            frequency: 0.08,
            speed: 0.025
        });
    }

    // Initialize with a few waves
    for (let i = 0; i < 3; i++) {
        waves.push({
            x: 60,
            y: canvas.height / 2,
            progress: i * 0.3,
            amplitude: 15,
            frequency: 0.08,
            speed: 0.025
        });
    }

    function animate() {
        ctx.fillStyle = '#050608';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        time += 0.5;

        // Draw Vacuum label in the middle
        ctx.save();
        ctx.font = '700 14px "Rajdhani", sans-serif';
        ctx.fillStyle = '#8e95a5';
        ctx.textAlign = 'center';
        ctx.fillText('VACUUM', canvas.width / 2, canvas.height / 2 - 30);
        
        // Dotted borders for vacuum zone
        ctx.strokeStyle = '#26293c';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(90, 20);
        ctx.lineTo(90, canvas.height - 20);
        ctx.moveTo(canvas.width - 90, 20);
        ctx.lineTo(canvas.width - 90, canvas.height - 20);
        ctx.stroke();
        ctx.restore();

        // Draw Sun (Left)
        ctx.save();
        ctx.shadowColor = '#ffd000';
        ctx.shadowBlur = 25;
        ctx.fillStyle = '#ffd000';
        ctx.beginPath();
        ctx.arc(30, canvas.height / 2, 50, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#ff6c0a';
        ctx.font = '700 12px "Rajdhani", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('SUN', 30, canvas.height / 2 + 5);
        ctx.restore();

        // Draw Earth (Right)
        ctx.save();
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#00aeff';
        ctx.beginPath();
        ctx.arc(canvas.width - 35, canvas.height / 2, 30, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#fff';
        ctx.font = '700 10px "Rajdhani", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('EARTH', canvas.width - 35, canvas.height / 2 + 4);
        ctx.restore();

        // Update and draw electromagnetic waves
        if (Math.random() < 0.02 && waves.length < 6) {
            addWave();
        }

        ctx.save();
        ctx.strokeStyle = '#ff6c0a';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#ff6c0a';
        ctx.shadowBlur = 8;

        for (let i = waves.length - 1; i >= 0; i--) {
            const w = waves[i];
            w.progress += w.speed;

            if (w.progress >= 1) {
                waves.splice(i, 1);
                continue;
            }

            ctx.beginPath();
            const startX = w.x;
            const endX = canvas.width - 70;
            const currentMaxX = startX + (endX - startX) * w.progress;

            for (let px = startX; px <= currentMaxX; px += 2) {
                const py = w.y + Math.sin((px - startX) * w.frequency - time * 0.1) * w.amplitude;
                if (px === startX) {
                    ctx.moveTo(px, py);
                } else {
                    ctx.lineTo(px, py);
                }
            }
            ctx.stroke();
        }
        ctx.restore();

        introPart1Id = requestAnimationFrame(animate);
    }
    animate();
}

// INTRO PART 2 CANVAS
function runIntroPart2() {
    const canvas = document.getElementById('canvas-intro-part2');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    let time = 0;
    const radiations = [];

    function addRadiationRay() {
        const angle = -Math.PI/4 - Math.random() * Math.PI/2; // upper hemisphere
        radiations.push({
            x: canvas.width / 2,
            y: canvas.height - 30,
            angle: angle,
            length: 0,
            maxLength: 80 + Math.random() * 60,
            speed: 1.5 + Math.random() * 2,
            amp: 4 + Math.random() * 4,
            freq: 0.15
        });
    }

    for (let i = 0; i < 10; i++) {
        addRadiationRay();
        radiations[i].length = Math.random() * radiations[i].maxLength;
    }

    function animate() {
        ctx.fillStyle = '#050608';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        time += 0.4;

        // Draw Surface block (bottom)
        const surfX = canvas.width / 2 - 60;
        const surfY = canvas.height - 35;
        const surfW = 120;
        const surfH = 15;

        ctx.save();
        // Glow on surface
        ctx.shadowColor = '#ff6c0a';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#1c1e28';
        ctx.strokeStyle = '#ff6c0a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(surfX, surfY, surfW, surfH, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ff6c0a';
        ctx.font = '700 10px "Rajdhani", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('HOT SURFACE', canvas.width / 2, surfY + 11);
        ctx.restore();

        // Update and draw radiation waves radiating outward
        if (Math.random() < 0.15 && radiations.length < 15) {
            addRadiationRay();
        }

        ctx.save();
        ctx.strokeStyle = '#ff6c0a';
        ctx.lineWidth = 1.8;
        ctx.shadowColor = '#ff6c0a';
        ctx.shadowBlur = 6;

        for (let i = radiations.length - 1; i >= 0; i--) {
            const r = radiations[i];
            r.length += r.speed;

            if (r.length > r.maxLength) {
                radiations.splice(i, 1);
                continue;
            }

            ctx.beginPath();
            const startX = r.x;
            const startY = r.y;
            
            for (let d = 0; d <= r.length; d += 2) {
                // Base straight line vector
                const baseX = startX + Math.cos(r.angle) * d;
                const baseY = startY + Math.sin(r.angle) * d;

                // Perpendicular sine wave oscillation
                const perpX = -Math.sin(r.angle) * Math.sin(d * r.freq - time * 0.8) * r.amp;
                const perpY = Math.cos(r.angle) * Math.sin(d * r.freq - time * 0.8) * r.amp;

                const finalX = baseX + perpX;
                const finalY = baseY + perpY;

                if (d === 0) {
                    ctx.moveTo(finalX, finalY);
                } else {
                    ctx.lineTo(finalX, finalY);
                }
            }
            ctx.stroke();
        }
        ctx.restore();

        introPart2Id = requestAnimationFrame(animate);
    }
    animate();
}

// REALTIME SIMULATION RENDERING LOOPS (Left and Right Canvas)
function createSimAnimation(canvasId, side) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    let time = 0;
    const waves = [];

    // Helper to add lines based on properties
    function addWave(settings, mode) {
        if (mode === 'emission') {
            const angle = -Math.PI / 4 - Math.random() * Math.PI / 2; // radiate up
            waves.push({
                x: canvas.width / 2,
                y: canvas.height - 40,
                angle: angle,
                length: 0,
                maxLength: 50 + Math.random() * 50,
                speed: 1.2 + (settings.temp / 200) * 1.5,
                amp: 3 + Math.random() * 4,
                freq: 0.18,
                opacity: 1
            });
        } else {
            // Absorption: Waves arrive from top down
            const startX = Math.random() * canvas.width;
            const targetX = canvas.width / 2 - 30 + Math.random() * 60;
            waves.push({
                startX: startX,
                startY: 0,
                targetX: targetX,
                targetY: canvas.height - 40,
                progress: 0,
                speed: 0.008 + Math.random() * 0.012, // slightly slower incoming
                amp: 4 + Math.random() * 3,
                freq: 0.15,
                reflected: false,
                reflectAngle: -Math.PI/6 - Math.random() * Math.PI/1.5, // bounce upward
                reflectProg: 0
            });
        }
    }

    function animate() {
        const settings = state[side];
        const mode = state.simSubtab;

        // Calculate rate coefficient
        let colorCoeff = settings.color === 'black' ? 1.0 : 0.3;
        let textureCoeff = settings.texture === 'dull' ? 1.0 : 0.3;
        let tempCoeff = mode === 'emission' ? (settings.temp / 200) : 1.0;
        let areaCoeff = settings.area === 'large' ? 1.0 : 0.55;

        let totalCoeff = colorCoeff * textureCoeff * tempCoeff * areaCoeff;
        
        ctx.fillStyle = '#050608';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        time += 0.5;

        // Emission glow rendering
        let glowRadius = 5 + totalCoeff * 45;
        let surfaceColor = settings.color === 'black' ? '#181a24' : '#e2e5ec';
        let strokeColor = settings.color === 'black' ? '#2c3145' : '#8a94a6';

        if (settings.texture === 'shiny') {
            strokeColor = '#00f0ff'; // shiny cyan outline
        }

        const surfWidth = settings.area === 'large' ? 100 : 50;
        const surfHeight = 20;
        const surfX = canvas.width / 2 - surfWidth / 2;
        const surfY = canvas.height - 45;

        // Glow behind surface
        if (totalCoeff > 0.05) {
            ctx.save();
            const glowGrad = ctx.createRadialGradient(
                canvas.width / 2, surfY, 5, 
                canvas.width / 2, surfY, glowRadius
            );
            if (mode === 'emission') {
                glowGrad.addColorStop(0, `rgba(255, 108, 10, ${0.4 * totalCoeff})`);
                glowGrad.addColorStop(1, 'rgba(255, 108, 10, 0)');
            } else {
                // Absorption: black dull surface glows as it absorbs
                glowGrad.addColorStop(0, `rgba(255, 108, 10, ${0.65 * totalCoeff})`);
                glowGrad.addColorStop(1, 'rgba(255, 108, 10, 0)');
            }
            ctx.fillStyle = glowGrad;
            ctx.beginPath();
            ctx.arc(canvas.width/2, surfY, glowRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Generate wave lines dynamically based on emission/absorption score
        let spawnChance = mode === 'emission' ? (0.02 + totalCoeff * 0.25) : 0.15; // fixed incident rate for absorption
        if (Math.random() < spawnChance && waves.length < 25) {
            addWave(settings, mode);
        }

        // Render waves
        ctx.save();
        ctx.lineWidth = 1.8;

        for (let i = waves.length - 1; i >= 0; i--) {
            const w = waves[i];

            if (mode === 'emission') {
                w.length += w.speed;
                if (w.length > w.maxLength) {
                    waves.splice(i, 1);
                    continue;
                }

                ctx.strokeStyle = `rgba(255, 108, 10, ${1 - (w.length / w.maxLength)})`;
                ctx.beginPath();
                for (let d = 0; d <= w.length; d += 2) {
                    const baseX = w.x + Math.cos(w.angle) * d;
                    const baseY = w.y + Math.sin(w.angle) * d;

                    const perpX = -Math.sin(w.angle) * Math.sin(d * w.freq - time * 0.5) * w.amp;
                    const perpY = Math.cos(w.angle) * Math.sin(d * w.freq - time * 0.5) * w.amp;

                    if (d === 0) ctx.moveTo(baseX + perpX, baseY + perpY);
                    else ctx.lineTo(baseX + perpX, baseY + perpY);
                }
                ctx.stroke();
            } else {
                // Absorption Mode: Incident and reflection paths
                if (!w.reflected) {
                    w.progress += w.speed;
                    if (w.progress >= 1) {
                        // Wave hits the surface
                        // Determine if reflected or absorbed
                        // Shiny white reflects most; dull black absorbs most.
                        let reflectChance = settings.color === 'white' ? 0.8 : 0.15;
                        if (settings.texture === 'shiny') reflectChance += 0.15;

                        if (Math.random() < reflectChance) {
                            w.reflected = true;
                            w.reflectX = w.targetX;
                            w.reflectY = w.targetY;
                        } else {
                            // Absorbed (just remove particle)
                            waves.splice(i, 1);
                            continue;
                        }
                    } else {
                        // Drawing incoming wave
                        ctx.strokeStyle = 'rgba(255, 108, 10, 0.7)';
                        ctx.beginPath();
                        const currentX = w.startX + (w.targetX - w.startX) * w.progress;
                        const currentY = w.startY + (w.targetY - w.startY) * w.progress;
                        
                        const dist = Math.hypot(currentX - w.startX, currentY - w.startY);
                        const angle = Math.atan2(w.targetY - w.startY, w.targetX - w.startX);

                        for (let d = 0; d <= dist; d += 2) {
                            const baseX = w.startX + Math.cos(angle) * d;
                            const baseY = w.startY + Math.sin(angle) * d;

                            const perpX = -Math.sin(angle) * Math.sin(d * w.freq - time * 0.4) * w.amp;
                            const perpY = Math.cos(angle) * Math.sin(d * w.freq - time * 0.4) * w.amp;

                            if (d === 0) ctx.moveTo(baseX + perpX, baseY + perpY);
                            else ctx.lineTo(baseX + perpX, baseY + perpY);
                        }
                        ctx.stroke();
                    }
                } else {
                    // Drawing reflected wave deflecting away
                    w.reflectProg += 1.0; // slower, more distinct bounce
                    if (w.reflectProg > 140) { // longer reflection path
                        waves.splice(i, 1);
                        continue;
                    }

                    ctx.save();
                    ctx.shadowBlur = 6;
                    ctx.shadowColor = '#ff6c0a'; // neon orange glow on reflected lines
                    ctx.strokeStyle = `rgba(255, 108, 10, ${0.95 * (1 - (w.reflectProg / 140))})`;
                    ctx.lineWidth = 2.0; // slightly thicker reflection lines
                    ctx.beginPath();
                    for (let d = 0; d <= w.reflectProg; d += 2) {
                        const baseX = w.reflectX + Math.cos(w.reflectAngle) * d;
                        const baseY = w.reflectY + Math.sin(w.reflectAngle) * d;

                        const perpX = -Math.sin(w.reflectAngle) * Math.sin(d * w.freq - time * 0.4) * w.amp;
                        const perpY = Math.cos(w.reflectAngle) * Math.sin(d * w.freq - time * 0.4) * w.amp;

                        if (d === 0) ctx.moveTo(baseX + perpX, baseY + perpY);
                        else ctx.lineTo(baseX + perpX, baseY + perpY);
                    }
                    ctx.stroke();
                    ctx.restore();
                }
            }
        }
        ctx.restore();

        // Draw physical surface block
        ctx.save();
        ctx.fillStyle = surfaceColor;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2.5;
        
        ctx.beginPath();
        ctx.roundRect(surfX, surfY, surfWidth, surfHeight, 4);
        ctx.fill();
        ctx.stroke();

        // Shiny reflections gloss effect
        if (settings.texture === 'shiny') {
            ctx.strokeStyle = 'rgba(255,255,255,0.4)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(surfX + 5, surfY + 4);
            ctx.lineTo(surfX + surfWidth - 10, surfY + 4);
            ctx.stroke();
        }
        ctx.restore();

        if (side === 'left') {
            simLeftId = requestAnimationFrame(animate);
        } else {
            simRightId = requestAnimationFrame(animate);
        }
    }
    animate();
}

// UPDATE SIM LABELS & BANNER STATE
function updateSimulationLabels() {
    const isEmission = state.simSubtab === 'emission';

    // Left label logic
    const lblLeft = document.getElementById('label-left');
    const lblRight = document.getElementById('label-right');
    const banner = document.getElementById('comparison-banner');

    if (isEmission) {
        // Left emission strength
        const scoreLeft = (state.left.color === 'black' ? 1.0 : 0.3) *
                          (state.left.texture === 'dull' ? 1.0 : 0.3) *
                          (state.left.temp / 200) *
                          (state.left.area === 'large' ? 1.0 : 0.5);
        
        if (scoreLeft >= 0.45) {
            lblLeft.textContent = "Good emitter";
            lblLeft.className = "emitter-status status-strong";
        } else {
            lblLeft.textContent = "Weak emitter";
            lblLeft.className = "emitter-status status-weak";
        }

        // Right emission strength
        const scoreRight = (state.right.color === 'black' ? 1.0 : 0.3) *
                           (state.right.texture === 'dull' ? 1.0 : 0.3) *
                           (state.right.temp / 200) *
                           (state.right.area === 'large' ? 1.0 : 0.5);
        
        if (scoreRight >= 0.45) {
            lblRight.textContent = "Good emitter";
            lblRight.className = "emitter-status status-strong";
        } else {
            lblRight.textContent = "Weak emitter";
            lblRight.className = "emitter-status status-weak";
        }

        // Check for best vs worst comparison banner triggers
        const leftIsBest = state.left.color === 'black' && state.left.texture === 'dull' && state.left.temp === 200 && state.left.area === 'large';
        const leftIsWorst = state.left.color === 'white' && state.left.texture === 'shiny' && state.left.temp === 20;
        const rightIsBest = state.right.color === 'black' && state.right.texture === 'dull' && state.right.temp === 200 && state.right.area === 'large';
        const rightIsWorst = state.right.color === 'white' && state.right.texture === 'shiny' && state.right.temp === 20;

        if ((leftIsBest && rightIsWorst) || (rightIsBest && leftIsWorst)) {
            banner.style.display = 'block';
            banner.querySelector('span').textContent = "Compare: Best vs Worst Emitter";
            banner.style.borderColor = 'var(--neon-yellow)';
            banner.style.color = 'var(--neon-yellow)';
            banner.style.boxShadow = 'var(--neon-yellow-glow)';
        } else {
            banner.style.display = 'none';
        }

    } else {
        // Absorption Tab labels
        const absLeft = (state.left.color === 'black' ? 1.0 : 0.3) * (state.left.texture === 'dull' ? 1.0 : 0.3);
        if (absLeft >= 0.4) {
            lblLeft.textContent = "Strong absorber";
            lblLeft.className = "emitter-status status-strong";
        } else {
            lblLeft.textContent = "Weak absorber";
            lblLeft.className = "emitter-status status-weak";
        }

        const absRight = (state.right.color === 'black' ? 1.0 : 0.3) * (state.right.texture === 'dull' ? 1.0 : 0.3);
        if (absRight >= 0.4) {
            lblRight.textContent = "Strong absorber";
            lblRight.className = "emitter-status status-strong";
        } else {
            lblRight.textContent = "Weak absorber";
            lblRight.className = "emitter-status status-weak";
        }

        // Check if banner condition applies (best absorber vs worst absorber)
        const leftBestAbs = state.left.color === 'black' && state.left.texture === 'dull';
        const leftWorstAbs = state.left.color === 'white' && state.left.texture === 'shiny';
        const rightBestAbs = state.right.color === 'black' && state.right.texture === 'dull';
        const rightWorstAbs = state.right.color === 'white' && state.right.texture === 'shiny';

        if ((leftBestAbs && rightWorstAbs) || (rightBestAbs && leftWorstAbs)) {
            banner.style.display = 'block';
            banner.querySelector('span').textContent = "Compare: Best vs Worst Absorber";
            banner.style.borderColor = 'var(--neon-orange)';
            banner.style.color = 'var(--neon-orange)';
            banner.style.boxShadow = 'var(--neon-orange-glow)';
        } else {
            banner.style.display = 'none';
        }
    }
}

// SETUP CONTROLS INTERACTIVE EVENT LISTENERS
function setupSimControls() {
    const sides = ['left', 'right'];

    sides.forEach(side => {
        const col = document.getElementById(`surface-${side}`);
        
        // Color toggle buttons
        col.querySelectorAll('.color-toggle button').forEach(btn => {
            btn.addEventListener('click', () => {
                col.querySelectorAll('.color-toggle button').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state[side].color = btn.dataset.val;
                updateSimulationLabels();
            });
        });

        // Texture toggle buttons
        col.querySelectorAll('.texture-toggle button').forEach(btn => {
            btn.addEventListener('click', () => {
                col.querySelectorAll('.texture-toggle button').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state[side].texture = btn.dataset.val;
                updateSimulationLabels();
            });
        });

        // Temp slider
        const slider = document.getElementById(`temp-slider-${side}`);
        const display = document.getElementById(`temp-val-${side}`);
        slider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            state[side].temp = val;
            display.textContent = `${val}°C`;
            updateSimulationLabels();
        });

        // Area toggle buttons
        col.querySelectorAll('.area-toggle button').forEach(btn => {
            btn.addEventListener('click', () => {
                col.querySelectorAll('.area-toggle button').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state[side].area = btn.dataset.val;
                updateSimulationLabels();
            });
        });
    });

    // Subtab switching
    document.getElementById('subtab-emission').addEventListener('click', () => {
        setSimSubtab('emission');
    });
    document.getElementById('subtab-absorption').addEventListener('click', () => {
        setSimSubtab('absorption');
    });
}

function setSimSubtab(subtab) {
    state.simSubtab = subtab;
    document.querySelectorAll('.sim-subtabs button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`subtab-${subtab}`).classList.add('active');

    // Show/hide controls appropriate to subtab
    const tempControls = document.querySelectorAll('.temp-control');
    const areaControls = document.querySelectorAll('.area-control');

    if (subtab === 'emission') {
        tempControls.forEach(el => el.style.display = 'flex');
        areaControls.forEach(el => el.style.display = 'flex');
    } else {
        tempControls.forEach(el => el.style.display = 'none');
        areaControls.forEach(el => el.style.display = 'flex');
    }

    // Restart drawing canvas loops
    stopAllAnimations();
    createSimAnimation('canvas-left', 'left');
    createSimAnimation('canvas-right', 'right');
    updateSimulationLabels();
}

// FLASHCARD DECK ENGINE
function initFlashcards() {
    state.flashcards = [...FLASHCARDS_POOL];
    state.currentCardIndex = 0;
    renderFlashcard();

    const card = document.getElementById('current-card');
    card.addEventListener('click', () => {
        card.classList.toggle('flipped');
    });

    document.getElementById('card-prev').addEventListener('click', (e) => {
        e.stopPropagation();
        navigateCard(-1);
    });

    document.getElementById('card-next').addEventListener('click', (e) => {
        e.stopPropagation();
        navigateCard(1);
    });

    document.getElementById('btn-shuffle-cards').addEventListener('click', () => {
        shuffleArray(state.flashcards);
        state.currentCardIndex = 0;
        renderFlashcard();
        
        // Brief pop glow effect on shuffle
        const btn = document.getElementById('btn-shuffle-cards');
        btn.style.boxShadow = '0 0 20px var(--neon-blue)';
        setTimeout(() => btn.style.boxShadow = '', 400);
    });
}

function renderFlashcard() {
    const cardEl = document.getElementById('current-card');
    const isFlipped = cardEl.classList.contains('flipped');
    const current = state.flashcards[state.currentCardIndex];
    
    const updateTexts = () => {
        document.getElementById('card-index-display').textContent = `Card ${state.currentCardIndex + 1} of ${state.flashcards.length}`;
        document.getElementById('card-q-text').textContent = current.q;
        document.getElementById('card-a-text').textContent = current.a;
    };

    if (isFlipped) {
        cardEl.classList.remove('flipped');
        // Swap content midway through the rotation transition (approx 250ms)
        setTimeout(updateTexts, 250);
    } else {
        updateTexts();
    }

    // Render navigation indicators
    const dotsContainer = document.getElementById('dots-container');
    dotsContainer.innerHTML = '';
    
    // Determine responsive slide indicator format: dots if <= 8 cards, text otherwise to prevent overflow
    state.flashcards.forEach((_, idx) => {
        const dot = document.createElement('div');
        dot.className = `dot ${idx === state.currentCardIndex ? 'active' : ''}`;
        dot.addEventListener('click', () => {
            state.currentCardIndex = idx;
            renderFlashcard();
        });
        dotsContainer.appendChild(dot);
    });
}

function navigateCard(direction) {
    state.currentCardIndex += direction;
    if (state.currentCardIndex < 0) {
        state.currentCardIndex = state.flashcards.length - 1;
    } else if (state.currentCardIndex >= state.flashcards.length) {
        state.currentCardIndex = 0;
    }
    renderFlashcard();
}

// QUIZ SYSTEM ENGINE
function initQuiz() {
    document.getElementById('btn-start-quiz').addEventListener('click', () => {
        startNewQuiz();
    });

    document.getElementById('quiz-btn-next').addEventListener('click', () => {
        loadNextQuestion();
    });

    document.getElementById('btn-retry-quiz').addEventListener('click', () => {
        startNewQuiz();
    });

    document.getElementById('btn-back-to-sim').addEventListener('click', () => {
        switchTab('section-sim');
    });
}

function startNewQuiz() {
    state.quizActive = true;
    state.score = 0;
    state.currentQuestionIndex = 0;
    
    // Choose 10 random questions from the 30 pool
    const shuffledPool = [...QUIZ_POOL];
    shuffleArray(shuffledPool);
    state.quizQuestions = shuffledPool.slice(0, 10);

    // Hide score screen and start screen, show question panel
    document.getElementById('quiz-start-screen').classList.remove('active');
    document.getElementById('quiz-score-screen').classList.remove('active');
    document.getElementById('quiz-question-screen').classList.add('active');

    loadQuestion(state.currentQuestionIndex);
}

function loadQuestion(index) {
    state.quizAnswered = false;
    const qData = state.quizQuestions[index];

    // Progress bar fill
    document.getElementById('quiz-progress').style.width = `${((index) / 10) * 100}%`;
    document.getElementById('quiz-question-number').textContent = `Question ${index + 1} of 10`;
    document.getElementById('quiz-score-indicator').textContent = `Score: ${state.score}`;

    // Question content
    document.getElementById('quiz-q-text-content').textContent = qData.q;

    // Load options and shuffle their order
    const optionsContainer = document.getElementById('quiz-options');
    optionsContainer.innerHTML = '';

    const optionsObjects = qData.options.map((opt, idx) => {
        return { text: opt, isCorrect: idx === qData.answer };
    });
    shuffleArray(optionsObjects);

    optionsObjects.forEach((opt) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option-btn';
        btn.textContent = opt.text;
        
        btn.addEventListener('click', () => {
            if (state.quizAnswered) return;
            handleAnswerSelect(btn, opt.isCorrect, qData.explanation);
        });

        optionsContainer.appendChild(btn);
    });

    // Hide explanation box and Next button
    const expBox = document.getElementById('quiz-explanation');
    expBox.style.display = 'none';
    expBox.className = 'quiz-explanation-box';
    document.getElementById('quiz-btn-next').style.display = 'none';
}

function handleAnswerSelect(selectedBtn, isCorrect, explanation) {
    state.quizAnswered = true;
    const options = document.querySelectorAll('.quiz-option-btn');
    const container = document.getElementById('quiz-question-screen');

    // Disable all options
    options.forEach(btn => btn.disabled = true);

    if (isCorrect) {
        state.score++;
        selectedBtn.classList.add('correct');
        
        // Green flash visual effect
        container.classList.add('flash-correct');
        setTimeout(() => container.classList.remove('flash-correct'), 400);

        // Show explanation
        showExplanation(true, explanation);
    } else {
        selectedBtn.classList.add('wrong');
        
        // Red flash visual effect
        container.classList.add('flash-wrong');
        setTimeout(() => container.classList.remove('flash-wrong'), 400);

        // Highlight correct answer
        options.forEach(btn => {
            // Re-find which button is actually correct by checking if it matches the original correct option text
            const qData = state.quizQuestions[state.currentQuestionIndex];
            const correctText = qData.options[qData.answer];
            if (btn.textContent === correctText) {
                btn.classList.add('correct');
            }
        });

        showExplanation(false, explanation);
    }

    // Update current score counter
    document.getElementById('quiz-score-indicator').textContent = `Score: ${state.score}`;
    
    // Reveal 'Next' CTA button
    document.getElementById('quiz-btn-next').style.display = 'inline-flex';
}

function showExplanation(isCorrect, explanation) {
    const expBox = document.getElementById('quiz-explanation');
    expBox.style.display = 'block';
    
    if (isCorrect) {
        expBox.classList.add('correct');
        expBox.innerHTML = `<strong class="exp-correct-title">Correct!</strong>${explanation}`;
    } else {
        expBox.classList.add('wrong');
        expBox.innerHTML = `<strong class="exp-wrong-title">Incorrect</strong>${explanation}`;
    }
}

function loadNextQuestion() {
    state.currentQuestionIndex++;
    if (state.currentQuestionIndex < 10) {
        loadQuestion(state.currentQuestionIndex);
    } else {
        showScoreScreen();
    }
}

// SCORE AND END SCREEN REWARDS
function showScoreScreen() {
    document.getElementById('quiz-question-screen').classList.remove('active');
    
    const scoreScreen = document.getElementById('quiz-score-screen');
    scoreScreen.classList.add('active');

    // Fill progress bar fully
    document.getElementById('quiz-progress').style.width = '100%';

    const scorePct = state.score / 10;
    document.getElementById('score-text').textContent = `${state.score}/10`;

    // Animate circular progress ring
    const ring = document.getElementById('score-ring-fill');
    const strokeDashOffset = 283 - (283 * scorePct);
    
    // Force a reflow to trigger CSS transition
    ring.getBoundingClientRect();
    ring.style.strokeDashoffset = strokeDashOffset;

    const headline = document.getElementById('score-headline');
    const feedback = document.getElementById('score-feedback');
    const backBtn = document.getElementById('btn-back-to-sim');

    // Handle rating categories
    if (state.score >= 8) {
        headline.textContent = "Excellent!";
        headline.style.color = 'var(--neon-green)';
        feedback.textContent = "You understand radiation and surface properties well.";
        scoreScreen.classList.remove('score-pulsing-glow');
        
        // Trigger neon particle burst celebration!
        const scoreRect = scoreScreen.getBoundingClientRect();
        const centerX = scoreRect.left + scoreRect.width / 2;
        const centerY = scoreRect.top + scoreRect.height / 3;
        
        // Multiple bursts
        celebrationParticles.burst(centerX, centerY, 'var(--neon-green)');
        setTimeout(() => celebrationParticles.burst(centerX - 50, centerY + 20, 'var(--neon-blue)'), 200);
        setTimeout(() => celebrationParticles.burst(centerX + 50, centerY + 20, 'var(--neon-orange)'), 400);

    } else if (state.score >= 5) {
        headline.textContent = "Good Effort!";
        headline.style.color = 'var(--neon-blue)';
        feedback.textContent = "Review how surface properties affect emission and absorption.";
        
        // Pulsing glow animation
        scoreScreen.classList.add('score-pulsing-glow');
    } else {
        headline.textContent = "Keep Practising!";
        headline.style.color = 'var(--neon-red)';
        feedback.textContent = "Go back to the simulation and compare best vs worst emitter.";
        scoreScreen.classList.remove('score-pulsing-glow');
        
        // Prompt arrow highlights
        backBtn.classList.add('btn-primary');
        backBtn.classList.remove('btn-secondary');
    }
}

// NAVIGATION AND TAB CONTROL
function switchTab(targetId) {
    state.activeTab = targetId;

    // Toggle active classes on tab headers
    document.querySelectorAll('.nav-btn').forEach(btn => {
        if (btn.dataset.target === targetId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Toggle visible section content
    document.querySelectorAll('.app-section').forEach(sect => {
        if (sect.id === targetId) {
            sect.classList.add('active');
        } else {
            sect.classList.remove('active');
        }
    });

    // Handle special visual triggers on tab change
    stopAllAnimations();

    if (targetId === 'section-sim') {
        setSimSubtab(state.simSubtab);
    }
}

// TWO-PART INTRO SEQUENCE CONTROLLER
function startIntroSequence() {
    stopAllAnimations();

    const overlay = document.getElementById('intro-overlay');
    const p1 = document.getElementById('intro-part-1');
    const p2 = document.getElementById('intro-part-2');
    const cap1 = document.getElementById('caption-part1');
    const cap2 = document.getElementById('caption-part2');

    overlay.style.display = 'flex';
    p1.classList.add('active');
    p2.classList.remove('active');
    cap1.classList.remove('fade-in');
    cap2.classList.remove('fade-in');

    // Run canvas animation for part 1
    runIntroPart1();

    // Fade in text for part 1 after brief delay
    setTimeout(() => {
        cap1.classList.add('fade-in');
    }, 1000);

    // Transition to Part 2 after 6.5 seconds
    const part2Timeout = setTimeout(() => {
        if (introPart1Id) cancelAnimationFrame(introPart1Id);
        p1.classList.remove('active');
        p2.classList.add('active');
        
        runIntroPart2();
        
        setTimeout(() => {
            cap2.classList.add('fade-in');
        }, 1000);

    }, 6500);

    // Close overlay fully after 13.5 seconds
    const endTimeout = setTimeout(() => {
        closeIntroOverlay();
    }, 13500);

    // Handle skip events
    const skipBtn = document.getElementById('btn-skip-intro');
    const skipHandler = () => {
        clearTimeout(part2Timeout);
        clearTimeout(endTimeout);
        closeIntroOverlay();
        skipBtn.removeEventListener('click', skipHandler);
    };
    skipBtn.addEventListener('click', skipHandler);
}

function closeIntroOverlay() {
    stopAllAnimations();
    const overlay = document.getElementById('intro-overlay');
    overlay.style.display = 'none';

    // Start simulation loops immediately
    setSimSubtab('emission');
}

// CELEBRATION EFFECTS LOOP
function updateCelebration() {
    const canvas = document.getElementById('canvas-particles');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        celebrationParticles.update();
        celebrationParticles.draw(ctx);
    }
    requestAnimationFrame(updateCelebration);
}

// HELPER: ARRAY SHUFFLER
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// APP INITIALIZATION
window.addEventListener('DOMContentLoaded', () => {
    // Navigation bar click bindings
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.dataset.target);
        });
    });

    // Set up component engines
    setupSimControls();
    initFlashcards();
    initQuiz();

    // Start particles background rendering
    updateCelebration();

    // Initialize simulation immediately
    setSimSubtab('emission');
});
