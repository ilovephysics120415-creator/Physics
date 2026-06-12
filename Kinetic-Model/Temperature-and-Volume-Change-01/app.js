// Main App Controller
document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initExploreSimulation();
  initKineticEnergySimulation();
  initFlashcards();
  initQuiz();
});

// ==========================================
// 1. TABS NAVIGATION
// ==========================================
function initNavigation() {
  const navItems = document.querySelectorAll(".nav-item");
  const tabContents = document.querySelectorAll(".tab-content");

  navItems.forEach(item => {
    item.addEventListener("click", () => {
      const targetTab = item.getAttribute("data-tab");
      
      navItems.forEach(nav => nav.classList.remove("active"));
      tabContents.forEach(tab => tab.classList.remove("active"));
      
      item.classList.add("active");
      const activeTab = document.getElementById(targetTab);
      activeTab.classList.add("active");

      // Trigger redraw/resize handler on canvas elements when tab changes
      window.dispatchEvent(new Event('resize'));
    });
  });
}

// ==========================================
// 2. PARTICLE SIMULATION UTILITIES
// ==========================================
class Particle {
  constructor(x, y, radius, speed, angle, canvasWidth, canvasHeight) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.speed = speed;
    this.angle = angle;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.history = [];
    this.historyMaxLength = 6;
  }

  update(speedMultiplier, containerWidth, canvasHeight) {
    // Keep speed updated relative to temperature
    const currentSpeed = this.speed * speedMultiplier;
    const currentAngle = Math.atan2(this.vy, this.vx);
    this.vx = Math.cos(currentAngle) * currentSpeed;
    this.vy = Math.sin(currentAngle) * currentSpeed;

    // Save history for trails
    this.history.push({ x: this.x, y: this.y });
    if (this.history.length > this.historyMaxLength) {
      this.history.shift();
    }

    // Move
    this.x += this.vx;
    this.y += this.vy;

    // Bounce off left/right container boundaries
    const leftBound = this.radius;
    const rightBound = containerWidth - this.radius;
    if (this.x < leftBound) {
      this.x = leftBound;
      this.vx = -this.vx;
      return true; // Collided
    } else if (this.x > rightBound) {
      this.x = rightBound;
      this.vx = -this.vx;
      return true; // Collided
    }

    // Bounce off top/bottom
    const topBound = this.radius;
    const bottomBound = canvasHeight - this.radius;
    if (this.y < topBound) {
      this.y = topBound;
      this.vy = -this.vy;
      return true; // Collided
    } else if (this.y > bottomBound) {
      this.y = bottomBound;
      this.vy = -this.vy;
      return true; // Collided
    }

    return false; // No collision
  }

  draw(ctx, color, drawTrails, maxTrailLength) {
    // Trails disabled
    drawTrails = false;
    // Draw motion trail
    if (drawTrails && this.history.length > 1) {
      ctx.beginPath();
      ctx.moveTo(this.history[0].x, this.history[0].y);
      const limit = Math.min(this.history.length, maxTrailLength);
      for (let i = 1; i < limit; i++) {
        ctx.lineTo(this.history[i].x, this.history[i].y);
      }
      ctx.strokeStyle = color.replace("1)", "0.25)");
      ctx.lineWidth = this.radius * 0.8;
      ctx.lineCap = "round";
      ctx.stroke();
    }

    // Draw main particle
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.shadowBlur = 8;
    ctx.shadowColor = color;
    ctx.fill();
    ctx.shadowBlur = 0; // Reset
  }
}

// ==========================================
// SECTION 1: EXPLORE SIMULATION
// ==========================================
function initExploreSimulation() {
  const canvas = document.getElementById("explore-canvas");
  const ctx = canvas.getContext("2d");
  
  const sliderTemp = document.getElementById("slider-temp");
  const sliderVolume = document.getElementById("slider-volume");
  const sliderCount = document.getElementById("slider-count");
  const tempValDisplay = document.getElementById("temp-val-display");
  const volValDisplay = document.getElementById("vol-val-display");
  const countValDisplay = document.getElementById("count-val-display");
  
  const pressureNum = document.getElementById("pressure-num");
  const pressureLevel = document.getElementById("pressure-level");
  const dialProgress = document.getElementById("dial-progress");
  const feedbackMsg = document.getElementById("explore-feedback");

  let particles = [];
  const particleRadius = 4.5;
  const baseSpeed = 1.6;

  function resizeCanvas() {
    const rect = canvas.parentNode.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height || 220;
  }

  window.addEventListener("resize", () => {
    if (document.getElementById("tab-explore").classList.contains("active")) {
      resizeCanvas();
    }
  });

  resizeCanvas();

  // Initialize Particles
  function createParticles() {
    particles = [];
    const currentCount = parseInt(sliderCount.value);
    for (let i = 0; i < currentCount; i++) {
      const radius = particleRadius;
      // Start them well inside the minimum volume boundaries
      const minX = radius + 20;
      const maxX = canvas.width - radius - 20;
      const minY = radius + 20;
      const maxY = canvas.height - radius - 20;
      
      const x = Math.random() * (maxX - minX) + minX;
      const y = Math.random() * (maxY - minY) + minY;
      const angle = Math.random() * Math.PI * 2;
      
      particles.push(new Particle(x, y, radius, baseSpeed, angle, canvas.width, canvas.height));
    }
  }

  // Add event listener for particle count slider
  sliderCount.addEventListener("input", () => {
    countValDisplay.innerText = sliderCount.value;
    createParticles();
  });

  createParticles();

  // Color interpolation for particles depending on temperature
  function getParticleColor(tempPercent) {
    // Shifts from dim magenta (cold) to bright glowing neon magenta (hot)
    // Low: hsl(300, 40%, 35%) -> High: hsl(300, 100%, 55%)
    const saturation = 40 + (tempPercent / 100) * 60;
    const lightness = 30 + (tempPercent / 100) * 25;
    return `hsl(300, ${saturation}%, ${lightness}%)`;
  }

  // Animation Loop
  function tick() {
    if (!document.getElementById("tab-explore").classList.contains("active")) {
      requestAnimationFrame(tick);
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const temp = parseInt(sliderTemp.value);
    const volume = parseInt(sliderVolume.value);

    // Compute UI updates
    const tempPercent = (temp - 15) / (100 - 15); // normalized 0-1
    const volPercent = (volume - 30) / (100 - 30);  // normalized 0-1

    // Update Slider text labels
    if (temp < 40) tempValDisplay.innerText = "Cold";
    else if (temp < 75) tempValDisplay.innerText = "Medium";
    else tempValDisplay.innerText = "Hot";

    if (volume < 50) volValDisplay.innerText = "Small";
    else if (volume < 80) volValDisplay.innerText = "Medium";
    else volValDisplay.innerText = "Large";

    // Dynamic description builder
    let textDesc = "";
    if (temp >= 75 && volume < 50) {
      textDesc = "Particles move extremely fast in a small space — collision frequency and force are very high — pressure is extreme!";
    } else if (temp >= 75) {
      textDesc = "Particles move faster and hit the walls more often — pressure increases.";
    } else if (volume < 50) {
      textDesc = "Container is smaller — particles hit the walls more frequently — pressure increases.";
    } else if (temp < 40 && volume >= 80) {
      textDesc = "Particles are slow and spread out — pressure is low.";
    } else {
      textDesc = "Particles move at moderate speed — pressure is stable.";
    }
    feedbackMsg.innerText = textDesc;

    // Calculate real-time pressure
    // P = c * (T / V)
    // Range temp: 15 to 100
    // Range volume: 30 to 100
    const rawPressure = (temp / volume) * 65;
    const pressureVal = Math.min(Math.max(Math.round(rawPressure), 10), 160);
    pressureNum.innerText = pressureVal;

    // Update Pressure Gauge Arc
    const progressPercent = Math.min((pressureVal / 160) * 100, 100);
    const dasharray = 251.2;
    const offset = dasharray - (progressPercent / 100) * dasharray;
    dialProgress.style.strokeDashoffset = offset;

    // Color code dial and status badge based on pressure
    if (pressureVal < 45) {
      pressureLevel.innerText = "LOW";
      pressureLevel.className = "pressure-badge level-low";
      dialProgress.style.stroke = "var(--state-low)";
    } else if (pressureVal < 95) {
      pressureLevel.innerText = "NORMAL";
      pressureLevel.className = "pressure-badge level-medium";
      dialProgress.style.stroke = "var(--state-medium)";
    } else {
      pressureLevel.innerText = "HIGH";
      pressureLevel.className = "pressure-badge level-high";
      dialProgress.style.stroke = "var(--accent-neon)";
    }

    // Dynamic width container based on Volume
    // Container stretches from a minimum of 40% of canvas width to 100%
    const minContainerWidth = canvas.width * 0.35;
    const currentContainerWidth = minContainerWidth + (canvas.width - minContainerWidth) * volPercent;

    // Draw container boundaries
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, currentContainerWidth, canvas.height);

    // Speed multiplier from temperature slider - wider range
    const speedMultiplier = 0.05 + (tempPercent * 4.5);
    const color = getParticleColor(tempPercent * 100);

    // Update and draw particles
    particles.forEach(p => {
      p.update(speedMultiplier, currentContainerWidth, canvas.height);
      p.draw(ctx, color, false, 0);
    });

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

// ==========================================
// SECTION 2: KINETIC ENERGY SIMULATION
// ==========================================
function initKineticEnergySimulation() {
  // Canvases
  const canvasLow = document.getElementById("canvas-ke-low");
  const canvasHigh = document.getElementById("canvas-ke-high");
  const canvasInteractive = document.getElementById("canvas-ke-interactive");
  
  const ctxLow = canvasLow.getContext("2d");
  const ctxHigh = canvasHigh.getContext("2d");
  const ctxInter = canvasInteractive.getContext("2d");

  const dialKeTemp = document.getElementById("dial-ke-temp");
  const keStatusBadge = document.getElementById("ke-status-badge");

  const particlesLow = [];
  const particlesHigh = [];
  const particlesInter = [];

  const particleCount = 15;
  const particleRadius = 4;

  let populated = false;
  function resizeMiniCanvases() {
    [canvasLow, canvasHigh].forEach(c => {
      const rect = c.parentNode.getBoundingClientRect();
      c.width = rect.width;
      c.height = rect.height || 120;
    });

    const rectInter = canvasInteractive.parentNode.getBoundingClientRect();
    canvasInteractive.width = rectInter.width;
    canvasInteractive.height = rectInter.height || 160;

    // Populate particles only when canvas dimensions are valid/resolved
    if (!populated && canvasLow.width > 50) {
      populate(particlesLow, canvasLow, 0.15); // extremely slow
      populate(particlesHigh, canvasHigh, 5.5); // extremely fast
      populate(particlesInter, canvasInteractive, 1.5);
      populated = true;
    }
  }

  resizeMiniCanvases();
  window.addEventListener("resize", () => {
    if (document.getElementById("tab-ke").classList.contains("active")) {
      resizeMiniCanvases();
    }
  });

  // Populate particles
  function populate(list, canvas, speed) {
    list.length = 0;
    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * (canvas.width - 20) + 10;
      const y = Math.random() * (canvas.height - 20) + 10;
      const angle = Math.random() * Math.PI * 2;
      list.push(new Particle(x, y, particleRadius, speed, angle, canvas.width, canvas.height));
    }
  }

  function tickKE() {
    if (!document.getElementById("tab-ke").classList.contains("active")) {
      requestAnimationFrame(tickKE);
      return;
    }

    // 1. Low Temp Container Canvas
    ctxLow.clearRect(0, 0, canvasLow.width, canvasLow.height);
    ctxLow.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctxLow.strokeRect(0, 0, canvasLow.width, canvasLow.height);
    particlesLow.forEach(p => {
      p.update(1, canvasLow.width, canvasLow.height);
      p.draw(ctxLow, "hsl(180, 70%, 40%)", false, 0); // Trails disabled
    });

    // 2. High Temp Container Canvas
    ctxHigh.clearRect(0, 0, canvasHigh.width, canvasHigh.height);
    ctxHigh.strokeStyle = "rgba(255, 0, 255, 0.2)";
    ctxHigh.strokeRect(0, 0, canvasHigh.width, canvasHigh.height);
    particlesHigh.forEach(p => {
      p.update(1, canvasHigh.width, canvasHigh.height);
      p.draw(ctxHigh, "#ff00ff", false, 0); // Fixed color string
    });

    // 3. Interactive Container Canvas
    ctxInter.clearRect(0, 0, canvasInteractive.width, canvasInteractive.height);
    ctxInter.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctxInter.strokeRect(0, 0, canvasInteractive.width, canvasInteractive.height);

    const tempVal = parseInt(dialKeTemp.value); // 10 to 100
    const speedMult = 0.05 + (tempVal / 100) * 4.5; // wider range

    // Render Badge depending on value
    let color = "#ffcc00"; // Fixed color string
    if (tempVal < 35) {
      keStatusBadge.innerText = "Low Average KE";
      keStatusBadge.className = "ke-status-badge state-low";
      color = "#00ffcc"; // Fixed color string
    } else if (tempVal <= 75) {
      keStatusBadge.innerText = "Medium Average KE";
      keStatusBadge.className = "ke-status-badge state-medium";
      color = "#ffcc00"; // Fixed color string
    } else {
      keStatusBadge.innerText = "High Average KE";
      keStatusBadge.className = "ke-status-badge state-high";
      color = "#ff00ff"; // Fixed color string
    }

    particlesInter.forEach(p => {
      p.update(speedMult, canvasInteractive.width, canvasInteractive.height);
      p.draw(ctxInter, color, false, 0); // Trails disabled
    });

    requestAnimationFrame(tickKE);
  }

  requestAnimationFrame(tickKE);
}

// ==========================================
// SECTION 3: FLASHCARDS
// ==========================================
function initFlashcards() {
  const flashcardData = [
    { front: "Temperature", back: "A physical quantity that is a measure of the average kinetic energy of the particles in a substance." },
    { front: "Kinetic Energy", back: "The energy a particle possesses due to its motion. Faster motion equals more kinetic energy." },
    { front: "Average Kinetic Energy", back: "The mean kinetic energy of all gas particles. It is directly proportional to the absolute temperature." },
    { front: "Gas Pressure", back: "The force exerted per unit area per unit time by gas particles when they collide with the walls of the container." },
    { front: "Particle Collision", back: "An event where a gas particle strikes another particle or the container wall, transferring momentum." },
    { front: "Container Walls", back: "The boundaries holding the gas. Collisions against these walls are what generate pressure." },
    { front: "Volume", back: "The amount of space occupied by the gas container. Decreasing volume increases particle collision frequency." },
    { front: "Particle Speed", back: "How fast individual particles are moving. Higher temperature increases the average speed." },
    { front: "Frequency of Collisions", back: "How often particles hit the container walls per second. More frequent collisions increase pressure." },
    { front: "Force of Collisions", back: "The impact strength of each particle hitting the wall. Faster particles hit with greater force, increasing pressure." },
    { front: "Gas Compression", back: "Reducing the volume of a gas. This crowds the particles, leading to more frequent wall collisions and higher air pressure." },
    { front: "Gas Expansion", back: "Increasing the volume of a gas container. This spreads out the particles, reducing collision frequency and lowering air pressure." },
    { front: "Absolute Zero", back: "The theoretical temperature at which particles have zero kinetic energy and stop moving completely." },
    { front: "Heating a Gas", back: "Adds energy in internal store of the gas, which increases the average speed and kinetic energy of the particles." },
    { front: "Cooling a Gas", back: "Removes energy in internal store of the gas, causing the particles to slow down and have lower average kinetic energy." }
  ];

  let currentCardIndex = 0;
  let cards = [...flashcardData];

  const cardElement = document.getElementById("active-card");
  const frontText = document.getElementById("card-front-text");
  const backText = document.getElementById("card-back-text");
  const cardIndexDisplay = document.getElementById("card-index-display");

  const btnPrev = document.getElementById("btn-prev-card");
  const btnNext = document.getElementById("btn-next-card");
  const btnShuffle = document.getElementById("btn-shuffle-cards");

  function updateCardUI() {
    cardElement.classList.remove("flipped");
    // Wait for flip back animation to complete before updating text
    setTimeout(() => {
      frontText.innerText = cards[currentCardIndex].front;
      backText.innerText = cards[currentCardIndex].back;
      cardIndexDisplay.innerText = `${currentCardIndex + 1} / ${cards.length}`;
    }, 150);
  }

  // Flip on click
  cardElement.addEventListener("click", () => {
    cardElement.classList.toggle("flipped");
  });

  btnPrev.addEventListener("click", (e) => {
    e.stopPropagation();
    currentCardIndex = (currentCardIndex - 1 + cards.length) % cards.length;
    updateCardUI();
  });

  btnNext.addEventListener("click", (e) => {
    e.stopPropagation();
    currentCardIndex = (currentCardIndex + 1) % cards.length;
    updateCardUI();
  });

  btnShuffle.addEventListener("click", (e) => {
    e.stopPropagation();
    // Fisher-Yates shuffle
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    currentCardIndex = 0;
    updateCardUI();
  });

  // Init card content
  updateCardUI();
}

// ==========================================
// SECTION 4: MCQ QUIZ
// ==========================================
function initQuiz() {
  const quizPool = [
    // Temperature & KE
    {
      q: "When the temperature of a gas increases, what happens to the average speed of its particles?",
      a: ["It increases", "It decreases", "It remains constant", "It drops to zero"],
      c: 0
    },
    {
      q: "What does a higher temperature indicate about the particles in a substance?",
      a: [
        "They have a higher average kinetic energy",
        "They have a lower average kinetic energy",
        "They are closer together",
        "They have increased in mass"
      ],
      c: 0
    },
    {
      q: "Two containers hold the same gas. Container A is hotter than Container B. Which container has particles with higher average kinetic energy?",
      a: [
        "Container A",
        "Container B",
        "Both have the exact same average kinetic energy",
        "Cannot be determined without knowing the volume"
      ],
      c: 0
    },
    {
      q: "When a gas is cooled, what happens to the average kinetic energy of its particles?",
      a: ["It decreases", "It increases", "It remains constant", "It doubles"],
      c: 0
    },
    {
      q: "Which statement best describes the relationship between temperature and particle motion?",
      a: [
        "Higher temperature causes particles to move faster with higher average kinetic energy",
        "Higher temperature causes particles to move slower and expand",
        "Lower temperature causes particles to vibrate with greater frequency",
        "Temperature has no direct correlation with particle speed"
      ],
      c: 0
    },
    {
      q: "A gas is heated. What happens to the speed of its particles?",
      a: [
        "The average speed of the particles increases",
        "The average speed of the particles decreases",
        "All particles move at the exact same constant speed",
        "The particles stop moving"
      ],
      c: 0
    },
    {
      q: "What happens to the average kinetic energy of gas particles when temperature decreases?",
      a: ["It decreases", "It increases", "It stays the same", "It fluctuates unpredictably"],
      c: 0
    },
    {
      q: "Which of the following has particles with the highest average kinetic energy?",
      a: [
        "A gas heated to 100°C",
        "A gas cooled to 0°C",
        "A gas at room temperature (25°C)",
        "A gas frozen at -50°C"
      ],
      c: 0
    },
    {
      q: "Temperature is a measure of —",
      a: [
        "the average kinetic energy of the particles",
        "the total thermal energy of all particles",
        "the speed of the single fastest particle",
        "the total number of particles in a system"
      ],
      c: 0
    },
    {
      q: "If two gases are at the same temperature, what can be said about their particles' average kinetic energy?",
      a: [
        "They have the same average kinetic energy",
        "The heavier gas has much higher average kinetic energy",
        "The lighter gas has much higher average kinetic energy",
        "Their average kinetic energy depends entirely on their volumes"
      ],
      c: 0
    },
    // Gas Pressure
    {
      q: "Why does a gas exert gas pressure on the walls of its container?",
      a: [
        "Gas pressure is exerted because gas particles move randomly and collide with the walls, exerting forces during impacts",
        "Liquid pressure is exerted because liquid particles flow downwards due to gravity and push against the boundaries",
        "Solid pressure is exerted because solid particles vibrate about fixed positions and push outward against external surfaces",
        "Gas pressure is reduced because forces of attraction between gas particles increase to pull the container walls inward"
      ],
      c: 0
    },
    {
      q: "What happens to gas pressure when temperature increases, volume kept constant?",
      a: [
        "Gas pressure increases because gas particles gain average kinetic energy, colliding with the walls more frequently and with greater force",
        "Liquid pressure decreases because liquid particles are closer together and move slower",
        "Solid pressure remains constant because solid particles vibrate with unchanged frequency in their fixed positions",
        "Gas pressure decreases because gas particles move slower and collide with the walls less frequently"
      ],
      c: 0
    },
    {
      q: "When gas particles move faster, what happens to the force of their collisions with the walls?",
      a: [
        "The force of each collision increases",
        "The force of each collision decreases",
        "The force of collisions remains unchanged",
        "The collisions exert no force whatsoever"
      ],
      c: 0
    },
    {
      q: "What happens to the frequency of collisions when gas is heated?",
      a: [
        "Particles collide with the walls more frequently",
        "Particles collide with the walls less frequently",
        "The frequency of collisions remains exactly the same",
        "Collisions cease entirely"
      ],
      c: 0
    },
    {
      q: "A gas is compressed into a smaller volume. What happens to the frequency of particle collisions with the walls?",
      a: [
        "It increases, because the particles are crowded into a smaller space",
        "It decreases, because the particles have less room to move",
        "It remains constant because the temperature is unchanged",
        "It decreases to zero"
      ],
      c: 0
    },
    {
      q: "Why does reducing the volume of a gas increase its gas pressure?",
      a: [
        "Gas pressure increases because gas particles are crowded in a smaller space, colliding with the container walls more frequently",
        "Liquid pressure increases because liquid particles move faster and hit the container walls with greater force",
        "Solid pressure increases because solid particles expand in size and become heavier",
        "Gas pressure decreases because gas particles have less space to gain speed and collide less frequently"
      ],
      c: 0
    },
    {
      q: "A sealed container of gas is heated. What happens to the gas pressure inside?",
      a: [
        "Gas pressure increases because gas particles move faster and collide with the walls more frequently and forcefully",
        "Liquid pressure decreases because liquid particles slide past each other more slowly",
        "Solid pressure remains constant because solid particles vibrate within fixed positions",
        "Gas pressure decreases because gas particles lose kinetic energy and slow down"
      ],
      c: 0
    },
    {
      q: "Gas pressure increases when temperature rises because —",
      a: [
        "gas particles move faster and collide more frequently and forcefully with the walls",
        "liquid particles become heavier and exert more downward force",
        "solid particles multiply in number and crowd the container space",
        "gas particles stick to the walls permanently, exerting a constant pull"
      ],
      c: 0
    },
    {
      q: "What two factors determine the gas pressure exerted on the container walls?",
      a: [
        "The frequency of gas particle collisions and the force of each impact against the walls",
        "The total mass of the container and the density of the air outside",
        "The color of the gas particles and the surrounding room temperature",
        "The chemical bonds between gas molecules and the container walls"
      ],
      c: 0
    },
    {
      q: "A gas is expanded into a larger volume at constant temperature. What happens to gas pressure?",
      a: [
        "Gas pressure decreases because gas particles are spread out over a larger volume, colliding with the walls less frequently",
        "Liquid pressure increases because liquid particles have more space to gain speed and hit the boundaries harder",
        "Solid pressure remains constant because solid particles do not change their average spacing or vibration",
        "Gas pressure increases because gas particles collide with the walls more frequently"
      ],
      c: 0
    },
    {
      q: "Which change would cause the greatest increase in gas pressure?",
      a: [
        "Increase temperature AND decrease volume",
        "Decrease temperature AND increase volume",
        "Increase temperature AND increase volume",
        "Decrease temperature AND decrease volume"
      ],
      c: 0
    },
    {
      q: "When volume decreases, particles collide with the walls more often. Why?",
      a: [
        "The particles are packed closer together, so they travel shorter distances before hitting a wall",
        "The particles gain speed as they are compressed",
        "The walls of the container exert an electrostatic attraction",
        "The particles become highly unstable and split"
      ],
      c: 0
    },
    {
      q: "A student compresses a gas and notices the gas pressure increases. What is the best explanation?",
      a: [
        "Gas pressure increases because gas particles are more closely packed into a smaller space, hitting the container walls more frequently",
        "Liquid pressure increases because liquid particles move much faster and hit the boundaries with greater force",
        "Solid pressure remains constant because solid particles vibrate with unchanged average kinetic energy",
        "Gas pressure decreases because gas particles collide with the walls less frequently"
      ],
      c: 0
    },
    {
      q: "What happens to gas pressure if temperature is kept constant but volume is doubled?",
      a: [
        "The gas pressure is halved because gas particles are spread out, colliding with the walls half as frequently",
        "The liquid pressure is doubled because liquid particles gain average speed and hit the walls harder",
        "The solid pressure remains unchanged because solid particles vibrate with the same average kinetic energy",
        "The gas pressure is doubled because gas particles collide with the container walls twice as frequently"
      ],
      c: 0
    },
    {
      q: "Two identical containers hold the same gas. Container X is at higher temperature. Which has higher gas pressure and why?",
      a: [
        "Container X has higher gas pressure because its gas particles have higher average kinetic energy, colliding with the walls more frequently and forcefully",
        "Container Y has higher liquid pressure because its liquid particles slide past each other faster and are packed tighter",
        "Both have the same solid pressure since the solid container walls vibrate with the same frequency",
        "Container X has lower gas pressure because gas particles move slower and collide with the walls less frequently"
      ],
      c: 0
    },
    // Combined
    {
      q: "A gas is heated and also compressed. What happens to gas pressure?",
      a: [
        "Gas pressure increases significantly because gas particles move faster (colliding with greater force) and are packed closer (colliding more frequently)",
        "Liquid pressure decreases because liquid particles are closer to one another and move slower",
        "Solid pressure remains constant because solid particles vibrate with unchanged average kinetic energy",
        "Gas pressure decreases because gas particles move slower and collide with the walls less frequently"
      ],
      c: 0
    },
    {
      q: "Which change would reduce gas pressure?",
      a: [
        "Decrease temperature",
        "Decrease volume",
        "Increase temperature",
        "Add more gas molecules to the container"
      ],
      c: 0
    },
    {
      q: "A gas is cooled and expanded. What happens to gas pressure?",
      a: [
        "Gas pressure decreases because gas particles move slower (colliding with less force) and are more spread out (colliding less frequently)",
        "Liquid pressure increases because liquid particles are closer to one another and slide past each other faster",
        "Solid pressure remains constant because solid particles vibrate with unchanged average kinetic energy",
        "Gas pressure increases because gas particles collide with the walls more frequently and forcefully"
      ],
      c: 0
    },
    {
      q: "Which statement correctly links temperature, particle speed, and gas pressure?",
      a: [
        "Higher temperature leads to faster gas particles, which collide more frequently and forcefully with the walls, raising gas pressure",
        "Higher temperature leads to slower liquid particles, which reduces collisions against boundaries, lowering liquid pressure",
        "Lower temperature leads to faster solid particles, which increases vibration against boundaries, raising solid pressure",
        "There is no direct link between temperature, gas particle speed, and gas pressure"
      ],
      c: 0
    },
    {
      q: "A sealed rigid container is heated. Volume stays the same. What happens to gas pressure and why?",
      a: [
        "Gas pressure increases because gas particles gain average kinetic energy, colliding with the walls more frequently and forcefully",
        "Liquid pressure decreases because liquid particles slide past each other more slowly",
        "Solid pressure remains constant because the solid container walls do not expand",
        "Gas pressure remains constant because the volume of the container does not change"
      ],
      c: 0
    }
  ];

  let currentQuestions = [];
  let currentQuestionIndex = 0;
  let score = 0;
  let selectedOptionIndex = null;
  let quizHistory = []; // Track mistakes: { q: String, userAns: String, correctAns: String }

  const startScreen = document.getElementById("quiz-start-screen");
  const questionScreen = document.getElementById("quiz-question-screen");
  const resultsScreen = document.getElementById("quiz-results-screen");

  const btnStart = document.getElementById("btn-start-quiz");
  const btnSubmit = document.getElementById("btn-submit-answer");
  const btnNext = document.getElementById("btn-next-question");
  const btnRetry = document.getElementById("btn-retry-quiz");

  const progress = document.getElementById("quiz-progress");
  const questionIndexLabel = document.getElementById("question-index-label");
  const liveScoreLabel = document.getElementById("quiz-live-score");
  const questionText = document.getElementById("quiz-question-text");
  const optionsContainer = document.getElementById("quiz-options-container");

  const resultsScoreNum = document.getElementById("results-score-num");
  const resultsMsgText = document.getElementById("results-message-text");
  const reviewSection = document.getElementById("quiz-review-section");
  const reviewList = document.getElementById("quiz-review-list");

  // Canvas for celebration particle burst
  const celebCanvas = document.getElementById("celebration-canvas");
  const celebCtx = celebCanvas.getContext("2d");
  let celebParticles = [];
  let celebAnimationId = null;

  btnStart.addEventListener("click", startQuiz);
  btnSubmit.addEventListener("click", submitAnswer);
  btnNext.addEventListener("click", nextQuestion);
  btnRetry.addEventListener("click", startQuiz);

  function startQuiz() {
    cancelAnimationFrame(celebAnimationId);
    celebParticles = [];
    celebCtx.clearRect(0, 0, celebCanvas.width, celebCanvas.height);
    
    // Choose 10 random questions
    const shuffledPool = [...quizPool].sort(() => 0.5 - Math.random());
    currentQuestions = shuffledPool.slice(0, 10);
    
    currentQuestionIndex = 0;
    score = 0;
    quizHistory = [];
    
    startScreen.classList.remove("active");
    resultsScreen.classList.remove("active");
    questionScreen.classList.add("active");
    
    loadQuestion();
  }

  function loadQuestion() {
    selectedOptionIndex = null;
    btnSubmit.disabled = true;
    btnSubmit.style.display = "block";
    btnNext.style.display = "none";
    
    const qData = currentQuestions[currentQuestionIndex];
    
    // Update labels
    questionIndexLabel.innerText = `Question ${currentQuestionIndex + 1} of 10`;
    liveScoreLabel.innerText = `Score: ${score}/${currentQuestionIndex}`;
    progress.style.width = `${(currentQuestionIndex / 10) * 100}%`;
    questionText.innerText = qData.q;
    
    // Prepare options with shuffling
    // We want to keep track of where the correct option ends up.
    const originalOptions = qData.a.map((optionText, idx) => ({
      text: optionText,
      isCorrect: idx === qData.c
    }));
    
    // Shuffle options
    const shuffledOptions = [...originalOptions].sort(() => 0.5 - Math.random());
    
    optionsContainer.innerHTML = "";
    shuffledOptions.forEach((opt, idx) => {
      const optionBtn = document.createElement("button");
      optionBtn.className = "quiz-option";
      optionBtn.innerHTML = `
        <span class="option-letter">${String.fromCharCode(65 + idx)}</span>
        <span>${opt.text}</span>
      `;
      
      optionBtn.addEventListener("click", () => {
        if (selectedOptionIndex !== null && btnSubmit.style.display === "none") return; // Already submitted
        
        // Deselect others
        document.querySelectorAll(".quiz-option").forEach(b => b.classList.remove("selected"));
        optionBtn.classList.add("selected");
        
        selectedOptionIndex = idx;
        btnSubmit.disabled = false;
      });
      
      // Store reference data inside elements
      optionBtn.dataset.isCorrect = opt.isCorrect;
      optionBtn.dataset.text = opt.text;
      
      optionsContainer.appendChild(optionBtn);
    });
  }

  function submitAnswer() {
    if (selectedOptionIndex === null) return;
    
    btnSubmit.style.display = "none";
    btnNext.style.display = "block";
    
    const options = document.querySelectorAll(".quiz-option");
    let selectedBtn = options[selectedOptionIndex];
    let correctBtn = null;
    
    options.forEach(btn => {
      if (btn.dataset.isCorrect === "true") {
        correctBtn = btn;
      }
    });

    const isUserCorrect = selectedBtn.dataset.isCorrect === "true";
    
    if (isUserCorrect) {
      score++;
      selectedBtn.classList.add("correct");
    } else {
      selectedBtn.classList.add("wrong");
      correctBtn.classList.add("correct");
      // Add to history review
      quizHistory.push({
        q: currentQuestions[currentQuestionIndex].q,
        userAns: selectedBtn.dataset.text,
        correctValue: correctBtn.dataset.text
      });
    }

    liveScoreLabel.innerText = `Score: ${score}/${currentQuestionIndex + 1}`;
  }

  function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < 10) {
      loadQuestion();
    } else {
      showResults();
    }
  }

  function showResults() {
    questionScreen.classList.remove("active");
    resultsScreen.classList.add("active");
    
    resultsScoreNum.innerText = score;
    progress.style.width = "100%";

    // Set feedback based on score
    if (score >= 8) {
      resultsMsgText.innerText = "Excellent! You've mastered this topic.";
      resultsMsgText.style.color = "var(--accent-neon)";
      triggerCelebration();
    } else if (score >= 5) {
      resultsMsgText.innerText = "Good effort! Review the tabs and try again.";
      resultsMsgText.style.color = "var(--state-medium)";
    } else {
      resultsMsgText.innerText = "Keep going! Revisit the simulations before retrying.";
      resultsMsgText.style.color = "var(--state-low)";
    }

    // Populate review list
    if (quizHistory.length > 0) {
      reviewSection.style.display = "block";
      reviewList.innerHTML = "";
      quizHistory.forEach(item => {
        const div = document.createElement("div");
        div.className = "review-item";
        div.innerHTML = `
          <div class="review-question">${item.q}</div>
          <div class="review-answers">
            <span class="review-user-ans">✗ Your answer: ${item.userAns}</span>
            <span class="review-correct-ans">✓ Correct answer: ${item.correctValue}</span>
          </div>
        `;
        reviewList.appendChild(div);
      });
    } else {
      reviewSection.style.display = "none";
    }
  }

  // Celebratory Burst
  function triggerCelebration() {
    const rect = resultsScreen.getBoundingClientRect();
    celebCanvas.width = rect.width;
    celebCanvas.height = rect.height;

    celebParticles = [];
    // Spawn 80 particles in center
    const cx = celebCanvas.width / 2;
    const cy = celebCanvas.height / 3;

    for (let i = 0; i < 90; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 2;
      celebParticles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 3 + 2,
        alpha: 1,
        color: Math.random() > 0.35 ? "var(--accent-neon)" : "var(--state-low)"
      });
    }

    function animateCeleb() {
      celebCtx.clearRect(0, 0, celebCanvas.width, celebCanvas.height);
      
      let active = false;
      celebParticles.forEach(p => {
        if (p.alpha > 0.01) {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.08; // Gravity
          p.alpha -= 0.015;
          
          celebCtx.save();
          celebCtx.globalAlpha = p.alpha;
          celebCtx.beginPath();
          celebCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          
          let fill = p.color;
          if (fill.startsWith("var")) {
            fill = fill === "var(--accent-neon)" ? "#ff00ff" : "#00ffcc";
          }
          celebCtx.fillStyle = fill;
          celebCtx.shadowBlur = 8;
          celebCtx.shadowColor = fill;
          celebCtx.fill();
          celebCtx.restore();
          
          active = true;
        }
      });

      if (active) {
        celebAnimationId = requestAnimationFrame(animateCeleb);
      }
    }

    animateCeleb();
  }
}
