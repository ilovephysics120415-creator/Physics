/* app.js - Logic for Reflection Laws & Ray Diagrams App */

document.addEventListener('DOMContentLoaded', () => {
  // Navigation Tabs
  initNavigation();

  // Section 2: Interactive Exploration
  initInteractiveExploration();

  // Section 3: Worked Examples
  initWorkedExamples();

  // Section 4: Flashcards
  initFlashcards();

  // Section 5: Quiz Engine
  initQuiz();
});

// ==========================================
// NAVIGATION SYSTEM
// ==========================================
function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.app-section');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetSection = item.getAttribute('data-section');
      
      // Update active nav item
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');

      // Update active section
      sections.forEach(sec => {
        if (sec.id === targetSection) {
          sec.classList.add('active');
        } else {
          sec.classList.remove('active');
        }
      });
    });
  });
}

// ==========================================
// SECTION 2: INTERACTIVE EXPLORATION
// ==========================================
function initInteractiveExploration() {
  const slider = document.getElementById('angle-slider');
  const angleValue = document.getElementById('angle-value');
  const toggleLabels = document.getElementById('toggle-labels');
  
  const incidentRay = document.getElementById('explore-incident-ray');
  const reflectedRay = document.getElementById('explore-reflected-ray');
  const exploreIncidentArrow = document.getElementById('explore-incident-arrow');
  const exploreReflectedArrow = document.getElementById('explore-reflected-arrow');
  const arcI = document.getElementById('explore-arc-i');
  const arcR = document.getElementById('explore-arc-r');
  const labelI = document.getElementById('explore-label-i');
  const labelR = document.getElementById('explore-label-r');

  function updateDiagram() {
    const angle = parseInt(slider.value);
    angleValue.textContent = `${angle}°`;

    // Center point is (200, 220) where normal intersects mirror
    const centerX = 200;
    const centerY = 220;
    const rayLength = 160;

    const angleRad = (angle * Math.PI) / 180;
    
    // Incident ray source
    const incX = centerX - rayLength * Math.sin(angleRad);
    const incY = centerY - rayLength * Math.cos(angleRad);

    // Reflected ray destination
    const refX = centerX + rayLength * Math.sin(angleRad);
    const refY = centerY - rayLength * Math.cos(angleRad);

    // Update SVG Line endpoints
    incidentRay.setAttribute('x1', incX);
    incidentRay.setAttribute('y1', incY);
    incidentRay.setAttribute('x2', centerX);
    incidentRay.setAttribute('y2', centerY);

    reflectedRay.setAttribute('x1', centerX);
    reflectedRay.setAttribute('y1', centerY);
    reflectedRay.setAttribute('x2', refX);
    reflectedRay.setAttribute('y2', refY);

    // Update SVG Arrow paths
    exploreIncidentArrow.setAttribute('d', getLineArrowPath(incX, incY, centerX, centerY));
    exploreReflectedArrow.setAttribute('d', getLineArrowPath(centerX, centerY, refX, refY));

    // Draw arcs. We want an arc from the normal (x=200, y=220-R) to the incident/reflected rays
    const arcRadius = 45;
    
    if (angle > 0) {
      // Arc coordinates
      // Normal top of arc: (200, 220 - arcRadius)
      const normalArcY = centerY - arcRadius;

      // Incident ray intersection with arc
      const incArcX = centerX - arcRadius * Math.sin(angleRad);
      const incArcY = centerY - arcRadius * Math.cos(angleRad);

      // Reflected ray intersection with arc
      const refArcX = centerX + arcRadius * Math.sin(angleRad);
      const refArcY = centerY - arcRadius * Math.cos(angleRad);

      // SVG path: A rx ry x-axis-rotation large-arc-flag sweep-flag x y
      // sweep-flag is 0 for counterclockwise, 1 for clockwise.
      arcI.setAttribute('d', `M ${incArcX} ${incArcY} A ${arcRadius} ${arcRadius} 0 0 1 ${centerX} ${normalArcY}`);
      arcR.setAttribute('d', `M ${centerX} ${normalArcY} A ${arcRadius} ${arcRadius} 0 0 1 ${refArcX} ${refArcY}`);
      
      // Update label positions slightly offset from the center of the arc
      const labelRadius = 65;
      const labelIncX = centerX - labelRadius * Math.sin(angleRad / 2);
      const labelIncY = centerY - labelRadius * Math.cos(angleRad / 2);
      const labelRefX = centerX + labelRadius * Math.sin(angleRad / 2);
      const labelRefY = centerY + labelRadius * Math.cos(angleRad / 2); // Wait, make y same height for symmetry
      const labelRefYCorrect = centerY - labelRadius * Math.cos(angleRad / 2);

      labelI.setAttribute('x', labelIncX);
      labelI.setAttribute('y', labelIncY);
      labelI.textContent = `i = ${angle}°`;

      labelR.setAttribute('x', labelRefX);
      labelR.setAttribute('y', labelRefYCorrect);
      labelR.textContent = `r = ${angle}°`;
      
      arcI.style.display = 'block';
      arcR.style.display = 'block';
    } else {
      // 0 degrees
      arcI.style.display = 'none';
      arcR.style.display = 'none';
      labelI.setAttribute('x', centerX - 25);
      labelI.setAttribute('y', centerY - 60);
      labelI.textContent = `i = 0°`;
      labelR.setAttribute('x', centerX + 25);
      labelR.setAttribute('y', centerY - 60);
      labelR.textContent = `r = 0°`;
    }

    // Toggle labels visibility
    const showLabels = toggleLabels.checked;
    labelI.style.display = showLabels ? 'block' : 'none';
    labelR.style.display = showLabels ? 'block' : 'none';
    arcI.style.stroke = showLabels ? 'var(--neon-yellow)' : 'transparent';
    arcR.style.stroke = showLabels ? 'var(--neon-yellow)' : 'transparent';
  }

  // Event Listeners
  slider.addEventListener('input', updateDiagram);
  toggleLabels.addEventListener('change', updateDiagram);

  // Initial draw
  updateDiagram();
}

// ==========================================
// UTILITY: DYNAMIC MIDPOINT RAY ARROWHEAD
// ==========================================
function getLineArrowPath(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return '';
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;
  
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  
  const w1x = mx - 12 * ux + 6 * px;
  const w1y = my - 12 * uy + 6 * py;
  const w2x = mx - 12 * ux - 6 * px;
  const w2y = my - 12 * uy - 6 * py;
  
  return `M ${w1x} ${w1y} L ${mx} ${my} L ${w2x} ${w2y}`;
}

// ==========================================
// SECTION 3: WORKED EXAMPLES
// ==========================================
const EXAMPLES_DATA = [
  {
    title: "Example 1: Basic Law Application",
    steps: [
      {
        desc: "An incident ray hits a flat mirror at an angle of <strong>40°</strong> to the normal. We need to find the angle of reflection.",
        diagram: `
          <svg viewBox="0 0 400 250">
            <line x1="50" y1="200" x2="350" y2="200" class="mirror-line" />
            <line x1="200" y1="40" x2="200" y2="200" class="normal-line" />
            <line x1="97" y1="77" x2="200" y2="200" class="ray incident-ray" />
            <path d="${getLineArrowPath(97, 77, 200, 200)}" fill="none" stroke="var(--neon-cyan)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" class="ray" />
            <path d="M 171,165 A 40,40 0 0 1 200,160" class="angle-arc arc-i" style="opacity: 1;" />
            <text x="200" y="30" class="label-text label-normal">Normal</text>
            <text x="160" y="150" class="label-text angle-label" style="opacity: 1;">40°</text>
            <text x="100" y="65" class="label-text">Incident Ray</text>
          </svg>
        `,
        math: "Given: Angle of incidence (i) = 40°"
      },
      {
        desc: "According to the <strong>First Law of Reflection</strong>, the normal line, incident ray, and reflected ray all lie in the same plane. The <strong>Second Law of Reflection</strong> states that the angle of incidence is equal to the angle of reflection ($i = r$).",
        diagram: `
          <svg viewBox="0 0 400 250">
            <line x1="50" y1="200" x2="350" y2="200" class="mirror-line" />
            <line x1="200" y1="40" x2="200" y2="200" class="normal-line" />
            <line x1="97" y1="77" x2="200" y2="200" class="ray incident-ray" />
            <line x1="200" y1="200" x2="303" y2="77" class="ray reflected-ray" />
            <path d="${getLineArrowPath(97, 77, 200, 200)}" fill="none" stroke="var(--neon-cyan)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" class="ray" />
            <path d="${getLineArrowPath(200, 200, 303, 77)}" fill="none" stroke="var(--neon-cyan)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" class="ray" />
            <path d="M 171,165 A 40,40 0 0 1 200,160" class="angle-arc arc-i" style="opacity: 1;" />
            <text x="200" y="30" class="label-text label-normal">Normal</text>
            <text x="160" y="150" class="label-text angle-label" style="opacity: 1;">40°</text>
            <text x="100" y="65" class="label-text">Incident Ray</text>
            <text x="300" y="65" class="label-text">Reflected Ray</text>
          </svg>
        `,
        math: "Law: Angle of reflection (r) = Angle of incidence (i)"
      },
      {
        desc: "Therefore, the angle of reflection is also <strong>40°</strong>. Both angles are measured between their respective rays and the perpendicular normal line.",
        diagram: `
          <svg viewBox="0 0 400 250">
            <line x1="50" y1="200" x2="350" y2="200" class="mirror-line" />
            <line x1="200" y1="40" x2="200" y2="200" class="normal-line" />
            <line x1="97" y1="77" x2="200" y2="200" class="ray incident-ray" />
            <line x1="200" y1="200" x2="303" y2="77" class="ray reflected-ray" />
            <path d="${getLineArrowPath(97, 77, 200, 200)}" fill="none" stroke="var(--neon-cyan)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" class="ray" />
            <path d="${getLineArrowPath(200, 200, 303, 77)}" fill="none" stroke="var(--neon-cyan)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" class="ray" />
            <path d="M 171,165 A 40,40 0 0 1 200,160" class="angle-arc arc-i" style="opacity: 1;" />
            <path d="M 200,160 A 40,40 0 0 1 229,165" class="angle-arc arc-r" style="opacity: 1;" />
            <text x="200" y="30" class="label-text label-normal">Normal</text>
            <text x="160" y="150" class="label-text angle-label" style="opacity: 1;">i = 40°</text>
            <text x="240" y="150" class="label-text angle-label" style="opacity: 1;">r = 40°</text>
            <text x="100" y="65" class="label-text">Incident Ray</text>
            <text x="300" y="65" class="label-text">Reflected Ray</text>
          </svg>
        `,
        math: "Solution: r = 40°"
      }
    ]
  },
  {
    title: "Example 2: Angle from Mirror Surface",
    steps: [
      {
        desc: "A ray of light strikes a horizontal mirror surface. The angle between the incident ray and the mirror surface is <strong>35°</strong>. Find the angle of reflection.",
        diagram: `
          <svg viewBox="0 0 400 250">
            <line x1="50" y1="200" x2="350" y2="200" class="mirror-line" />
            <line x1="69" y1="108" x2="200" y2="200" class="ray incident-ray" />
            <path d="${getLineArrowPath(69, 108, 200, 200)}" fill="none" stroke="var(--neon-cyan)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" class="ray" />
            <path d="M 160,200 A 40,40 0 0 1 167,177" class="angle-arc" style="stroke: var(--neon-yellow); fill: none;" />
            <text x="142" y="192" class="label-text angle-label" style="opacity: 1;">35°</text>
            <text x="80" y="90" class="label-text">Incident Ray</text>
          </svg>
        `,
        math: "Given: Angle with mirror surface = 35°"
      },
      {
        desc: "The normal is perpendicular (at 90°) to the mirror surface. Therefore, the angle of incidence ($i$) is the remaining angle between the normal and the incident ray: $i = 90° - 35°$.",
        diagram: `
          <svg viewBox="0 0 400 250">
            <line x1="50" y1="200" x2="350" y2="200" class="mirror-line" />
            <line x1="200" y1="40" x2="200" y2="200" class="normal-line" />
            <line x1="69" y1="108" x2="200" y2="200" class="ray incident-ray" />
            <path d="${getLineArrowPath(69, 108, 200, 200)}" fill="none" stroke="var(--neon-cyan)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" class="ray" />
            <path d="M 160,200 A 40,40 0 0 1 167,177" class="angle-arc" style="stroke: var(--neon-yellow); fill: none;" />
            <path d="M 118,142 A 100,100 0 0 1 200,100" class="angle-arc arc-i" style="opacity: 1;" />
            <text x="200" y="30" class="label-text label-normal">Normal</text>
            <text x="142" y="192" class="label-text angle-label" style="opacity: 1;">35°</text>
            <text x="160" y="120" class="label-text angle-label" style="opacity: 1;">i = 55°</text>
            <text x="80" y="90" class="label-text">Incident Ray</text>
          </svg>
        `,
        math: "i = 90° - 35° = 55°"
      },
      {
        desc: "By applying the Law of Reflection ($r = i$), the angle of reflection is also <strong>55°</strong>. We can now construct and draw the reflected ray.",
        diagram: `
          <svg viewBox="0 0 400 250">
            <line x1="50" y1="200" x2="350" y2="200" class="mirror-line" />
            <line x1="200" y1="40" x2="200" y2="200" class="normal-line" />
            <line x1="69" y1="108" x2="200" y2="200" class="ray incident-ray" />
            <line x1="200" y1="200" x2="331" y2="108" class="ray reflected-ray" />
            <path d="${getLineArrowPath(69, 108, 200, 200)}" fill="none" stroke="var(--neon-cyan)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" class="ray" />
            <path d="${getLineArrowPath(200, 200, 331, 108)}" fill="none" stroke="var(--neon-cyan)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" class="ray" />
            <path d="M 160,200 A 40,40 0 0 1 167,177" class="angle-arc" style="stroke: rgba(255, 230, 0, 0.4); fill: none;" />
            <path d="M 118,142 A 100,100 0 0 1 200,100" class="angle-arc arc-i" style="opacity: 1;" />
            <path d="M 200,100 A 100,100 0 0 1 282,142" class="angle-arc arc-r" style="opacity: 1;" />
            <text x="200" y="30" class="label-text label-normal">Normal</text>
            <text x="142" y="192" class="label-text angle-label" style="opacity: 0.5;">35°</text>
            <text x="160" y="120" class="label-text angle-label" style="opacity: 1;">i = 55°</text>
            <text x="240" y="120" class="label-text angle-label" style="opacity: 1;">r = 55°</text>
            <text x="80" y="90" class="label-text">Incident Ray</text>
            <text x="320" y="90" class="label-text">Reflected Ray</text>
          </svg>
        `,
        math: "Solution: r = 55°"
      }
    ]
  },
  {
    title: "Example 3: Tilted Mirror Construction",
    steps: [
      {
        desc: "A mirror is tilted at an angle of <strong>30°</strong>. A vertical light ray shoots straight down and hits the mirror. Let's find the angle of reflection.",
        diagram: `
          <svg viewBox="0 0 400 250">
            <!-- Tilted Mirror at 30 deg: center 200, 155. length 300 -->
            <line x1="70" y1="230" x2="330" y2="80" class="mirror-line" />
            <text x="280" y="110" class="label-text label-mirror">Tilted Mirror</text>
            <!-- Vertical Incident Ray -->
            <line x1="200" y1="30" x2="200" y2="155" class="ray incident-ray" />
            <path d="${getLineArrowPath(200, 30, 200, 155)}" fill="none" stroke="var(--neon-cyan)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" class="ray" />
            <text x="225" y="65" class="label-text">Vertical Ray</text>
          </svg>
        `,
        math: "Mirror Tilt = 30° from horizontal"
      },
      {
        desc: "First, draw the <strong>Normal</strong> line perpendicular (90°) to the tilted mirror surface. Geometrically, if the mirror is tilted by 30° up-right, its normal line points up-left, making a 30° angle with the vertical incident ray.",
        diagram: `
          <svg viewBox="0 0 400 250">
            <line x1="70" y1="230" x2="330" y2="80" class="mirror-line" />
            <!-- Correct Normal line pointing up-left perpendicular to mirror surface -->
            <line x1="200" y1="155" x2="125" y2="25" class="normal-line" />
            <line x1="200" y1="30" x2="200" y2="155" class="ray incident-ray" />
            <path d="${getLineArrowPath(200, 30, 200, 155)}" fill="none" stroke="var(--neon-cyan)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" class="ray" />
            <text x="115" y="20" class="label-text label-normal">Normal</text>
            <!-- Angle i -->
            <path d="M 200,105 A 50,50 0 0 0 175,112" class="angle-arc" style="stroke: var(--neon-yellow); fill: none;" />
            <text x="190" y="95" class="label-text angle-label" style="opacity: 1;">i = 30°</text>
          </svg>
        `,
        math: "Angle of incidence (i) = 30° (relative to the normal)"
      },
      {
        desc: "Now, apply the Law of Reflection: $r = i = 30°$. Draw the reflected ray at 30° on the other side of the normal line (making a 60° angle to the left of the vertical).",
        diagram: `
          <svg viewBox="0 0 400 250">
            <line x1="70" y1="230" x2="330" y2="80" class="mirror-line" />
            <line x1="200" y1="155" x2="125" y2="25" class="normal-line" />
            <line x1="200" y1="30" x2="200" y2="155" class="ray incident-ray" />
            <!-- Reflected ray shoots out at angle 60 deg to vertical (up-left) -->
            <line x1="200" y1="155" x2="87" y2="90" class="ray reflected-ray" />
            <path d="${getLineArrowPath(200, 30, 200, 155)}" fill="none" stroke="var(--neon-cyan)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" class="ray" />
            <path d="${getLineArrowPath(200, 155, 87, 90)}" fill="none" stroke="var(--neon-cyan)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" class="ray" />
            <text x="115" y="20" class="label-text label-normal">Normal</text>
            <text x="75" y="80" class="label-text">Reflected Ray</text>
            <!-- Arcs -->
            <path d="M 200,105 A 50,50 0 0 0 175,112" class="angle-arc" style="stroke: rgba(255,230,0,0.4); fill: none;" />
            <path d="M 175,112 A 50,50 0 0 0 157,130" class="angle-arc" style="stroke: var(--neon-yellow); fill: none;" />
            <text x="190" y="95" class="label-text angle-label" style="opacity: 0.5;">i = 30°</text>
            <text x="155" y="115" class="label-text angle-label" style="opacity: 1;">r = 30°</text>
          </svg>
        `,
        math: "Solution: r = 30°"
      }
    ]
  }
];

function initWorkedExamples() {
  const exampleContentArea = document.getElementById('example-content-area');
  const btnPrevStep = document.getElementById('btn-prev-step');
  const btnNextStep = document.getElementById('btn-next-step');
  const btnRevealAnswer = document.getElementById('btn-reveal-answer');
  const stepIndicator = document.getElementById('step-indicator');
  const tabs = document.querySelectorAll('.example-selector .btn-tab');

  let currentExampleIdx = 0;
  let currentStepIdx = 0;

  function renderStep() {
    const example = EXAMPLES_DATA[currentExampleIdx];
    const step = example.steps[currentStepIdx];

    exampleContentArea.innerHTML = `
      <h3 class="neon-text-cyan">${example.title}</h3>
      <p class="example-content-text">${step.desc}</p>
      <div class="intro-animation-container">
        ${step.diagram}
      </div>
      <div class="example-math">
        ${step.math}
      </div>
    `;

    stepIndicator.textContent = `Step ${currentStepIdx + 1} of ${example.steps.length}`;

    // Enable/disable buttons
    btnPrevStep.disabled = currentStepIdx === 0;
    btnNextStep.textContent = currentStepIdx === example.steps.length - 1 ? "Reset" : "Next Step";

    // Disable reveal button if already on final solution step
    if (currentStepIdx === example.steps.length - 1) {
      btnRevealAnswer.disabled = true;
      btnRevealAnswer.style.opacity = '0.4';
      btnRevealAnswer.style.cursor = 'default';
    } else {
      btnRevealAnswer.disabled = false;
      btnRevealAnswer.style.opacity = '1';
      btnRevealAnswer.style.cursor = 'pointer';
    }
  }

  // Handle Tab Switch
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      currentExampleIdx = parseInt(tab.getAttribute('data-example'));
      currentStepIdx = 0;
      renderStep();
    });
  });

  // Step Controllers
  btnPrevStep.addEventListener('click', () => {
    if (currentStepIdx > 0) {
      currentStepIdx--;
      renderStep();
    }
  });

  btnNextStep.addEventListener('click', () => {
    const example = EXAMPLES_DATA[currentExampleIdx];
    if (currentStepIdx < example.steps.length - 1) {
      currentStepIdx++;
      renderStep();
    } else {
      // Loop back to start
      currentStepIdx = 0;
      renderStep();
    }
  });

  btnRevealAnswer.addEventListener('click', () => {
    const example = EXAMPLES_DATA[currentExampleIdx];
    currentStepIdx = example.steps.length - 1;
    renderStep();
  });

  // Load first step
  renderStep();
}

// ==========================================
// SECTION 4: FLASHCARDS
// ==========================================
const FLASHCARDS_DATA = [
  {
    front: "What is the 'Normal' line in reflection?",
    back: "An imaginary dashed line drawn perpendicular (at 90°) to the mirror surface at the point where the light ray strikes it."
  },
  {
    front: "Define 'Angle of Incidence' (i).",
    back: "The angle formed between the incident light ray and the normal line. It is NOT measured from the mirror surface!"
  },
  {
    front: "Define 'Angle of Reflection' (r).",
    back: "The angle formed between the reflected light ray and the normal line."
  },
  {
    front: "State the Law of Reflection.",
    back: "1. The incident ray, the reflected ray, and the normal at the point of incidence all lie in the same plane.\n2. The angle of incidence is equal to the angle of reflection (i = r)."
  },
  {
    front: "Common Mistake: Measuring angles from the mirror surface.",
    back: "Always calculate from the Normal! If the ray is 20° to the mirror surface, the angle of incidence is 90° - 20° = 70°."
  }
];

function initFlashcards() {
  const card = document.getElementById('flashcard');
  const cardFrontText = document.getElementById('card-front-text');
  const cardBackText = document.getElementById('card-back-text');
  const btnShuffle = document.getElementById('btn-shuffle-cards');
  const btnNext = document.getElementById('btn-card-next');
  const btnBack = document.getElementById('btn-card-back');
  const counter = document.getElementById('flashcard-counter');
  const progressBar = document.getElementById('flashcard-progress-bar');

  let cards = [...FLASHCARDS_DATA];
  let currentIndex = 0;
  let masteredCount = 0;

  function updateCard() {
    card.classList.remove('flipped');
    
    // Smooth text update after flip transition back
    setTimeout(() => {
      cardFrontText.textContent = cards[currentIndex].front;
      cardBackText.textContent = cards[currentIndex].back.replace(/\n/g, '<br>');
    }, 150);

    counter.textContent = `Card ${currentIndex + 1} of ${cards.length}`;
    
    // Mastered progress tracking
    const progressPercent = ((currentIndex) / cards.length) * 100;
    progressBar.style.width = `${progressPercent}%`;
  }

  // Flip Card Action
  card.addEventListener('click', () => {
    card.classList.toggle('flipped');
  });

  // Shuffle Cards Action
  btnShuffle.addEventListener('click', () => {
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    currentIndex = 0;
    updateCard();
  });

  // Navigation Buttons
  btnNext.addEventListener('click', (e) => {
    e.stopPropagation(); // Stop card flipping when button clicked
    if (currentIndex < cards.length - 1) {
      currentIndex++;
    } else {
      currentIndex = 0;
    }
    updateCard();
  });

  btnBack.addEventListener('click', (e) => {
    e.stopPropagation(); // Stop card flipping
    if (currentIndex > 0) {
      currentIndex--;
    } else {
      currentIndex = cards.length - 1;
    }
    updateCard();
  });

  // Initial draw
  updateCard();
}

// ==========================================
// SECTION 5: QUIZ ENGINE
// ==========================================
let quizPool = [];
let currentQuizIdx = 0;
let quizScore = 0;
const TOTAL_QUIZ_QUESTIONS = 30;

function initQuiz() {
  const startView = document.getElementById('quiz-start-view');
  const questionView = document.getElementById('quiz-question-view');
  const solutionView = document.getElementById('quiz-solution-view');
  const resultsView = document.getElementById('quiz-results-view');

  const btnStart = document.getElementById('btn-start-quiz');
  const btnRestart = document.getElementById('btn-restart-quiz');
  const btnNext = document.getElementById('btn-next-question');

  btnStart.addEventListener('click', () => {
    generateQuizPool();
    currentQuizIdx = 0;
    quizScore = 0;
    startView.classList.remove('active');
    questionView.classList.add('active');
    showQuizQuestion();
  });

  btnNext.addEventListener('click', () => {
    solutionView.classList.remove('active');
    currentQuizIdx++;
    if (currentQuizIdx < TOTAL_QUIZ_QUESTIONS) {
      questionView.classList.add('active');
      showQuizQuestion();
    } else {
      resultsView.classList.add('active');
      showQuizResults();
    }
  });

  btnRestart.addEventListener('click', () => {
    resultsView.classList.remove('active');
    startView.classList.add('active');
  });
}

function generateQuizPool() {
  quizPool = [];
  
  // 15 MCQ Conceptual Questions
  const conceptualPool = [
    {
      type: "mcq",
      text: "Which of the following is true about the Normal line in a reflection diagram?",
      options: [
        "It is always a solid horizontal line representing the mirror surface.",
        "It is a perpendicular dashed line drawn at the point of incidence.",
        "It is the path taken by the incident light ray.",
        "It is always parallel to the reflected ray."
      ],
      correct: 1,
      explain: "The Normal is an imaginary reference line drawn <strong>perpendicular (90°)</strong> to the mirror surface at the point where the incident ray hits.",
      drawSvg: (containerId) => {
        return `
          <svg viewBox="0 0 400 200">
            <line x1="50" y1="160" x2="350" y2="160" class="mirror-line" />
            <line x1="200" y1="30" x2="200" y2="160" class="normal-line" />
            <text x="200" y="25" class="label-text label-normal">Normal (90° to Mirror)</text>
          </svg>
        `;
      }
    },
    {
      type: "mcq",
      text: "State the First Law of Reflection.",
      options: [
        "The angle of incidence is always greater than the angle of reflection.",
        "Light only reflects off polished glass surfaces.",
        "The incident ray, normal, and reflected ray all lie in the same plane.",
        "The light ray speeds up when it is reflected from the surface."
      ],
      correct: 2,
      explain: "The First Law of Reflection states that the incident ray, reflected ray, and the normal at the point of incidence <strong>all lie in the same flat plane</strong>.",
      drawSvg: () => ""
    },
    {
      type: "mcq",
      text: "Which angle corresponds to the angle of incidence?",
      options: [
        "The angle between the incident ray and the normal line.",
        "The angle between the incident ray and the mirror surface.",
        "The angle between the normal line and the reflected ray.",
        "The angle between the incident ray and the reflected ray."
      ],
      correct: 0,
      explain: "The angle of incidence is the angle <strong>between the incident ray and the normal line</strong>.",
      drawSvg: (containerId) => {
        return `
          <svg viewBox="0 0 400 200">
            <defs>
              <marker id="concept-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--neon-cyan)" />
              </marker>
            </defs>
            <line x1="50" y1="160" x2="350" y2="160" class="mirror-line" />
            <line x1="200" y1="30" x2="200" y2="160" class="normal-line" />
            <line x1="100" y1="60" x2="200" y2="160" class="ray incident-ray" marker-end="url(#concept-arrow)" />
            <path d="M 172,132 A 40,40 0 0 1 200,120" class="angle-arc arc-i" style="opacity:1;" />
            <text x="160" y="110" class="label-text angle-label" style="opacity: 1;">i</text>
            <text x="200" y="25" class="label-text label-normal">Normal</text>
          </svg>
        `;
      }
    },
    {
      type: "mcq",
      text: "If a light ray hits a mirror normal to its surface (90° to surface), what is its angle of incidence?",
      options: [
        "90°",
        "45°",
        "0°",
        "180°"
      ],
      correct: 2,
      explain: "If a ray is perpendicular to the mirror surface, it aligns perfectly with the normal line. Therefore, the angle between the ray and the normal is <strong>0°</strong>. It will reflect straight back along the same path.",
      drawSvg: (containerId) => {
        return `
          <svg viewBox="0 0 400 200">
            <defs>
              <marker id="concept-arrow-norm" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--neon-cyan)" />
              </marker>
            </defs>
            <line x1="50" y1="160" x2="350" y2="160" class="mirror-line" />
            <line x1="200" y1="30" x2="200" y2="160" class="normal-line" />
            <line x1="200" y1="30" x2="200" y2="160" class="ray incident-ray" style="stroke: var(--neon-cyan); stroke-dasharray: 4,4;" marker-end="url(#concept-arrow-norm)" />
            <text x="200" y="25" class="label-text label-normal">Normal & Incident Ray</text>
          </svg>
        `;
      }
    },
    {
      type: "mcq",
      text: "Which diagram represents a CORRECTLY labelled reflection layout?",
      options: [
        "Diagram A: Angle i is between ray and mirror, Angle r is between normal and ray.",
        "Diagram B: Angle i is between normal and ray, Angle r is between ray and mirror.",
        "Diagram C: Both angles i and r are measured between their respective rays and the normal.",
        "Diagram D: Both angles i and r are measured between their respective rays and the mirror."
      ],
      correct: 2,
      explain: "In a correctly labelled diagram, <strong>both angles i and r</strong> must be measured relative to the normal line, not the mirror surface.",
      drawSvg: () => ""
    },
    {
      type: "mcq",
      text: "What happens to light during regular reflection off a mirror?",
      options: [
        "Light rays scatter in all random directions.",
        "Parallel incident rays reflect as parallel rays in a single direction.",
        "The light ray bends inside the glass medium (refracts).",
        "The light ray is completely absorbed by the silver backing."
      ],
      correct: 1,
      explain: "In **regular (specular) reflection**, parallel light rays hitting a smooth flat surface reflect as parallel rays in one direction.",
      drawSvg: () => ""
    },
    {
      type: "mcq",
      text: "A student states 'Angle of reflection is measured from the mirror surface'. Is this statement correct?",
      options: [
        "Yes, because the mirror is the reflecting plane.",
        "No, it must always be measured relative to the normal.",
        "Yes, but only for curved mirrors.",
        "No, it is measured relative to the incident ray."
      ],
      correct: 1,
      explain: "All reflection angles in physics are formally defined and measured relative to the **perpendicular normal line**.",
      drawSvg: () => ""
    },
    {
      type: "mcq",
      text: "If a flat mirror is rotated clockwise by 10°, what happens to the normal line?",
      options: [
        "It stays in its original vertical position.",
        "It rotates clockwise by 10°.",
        "It rotates counterclockwise by 10°.",
        "It disappears."
      ],
      correct: 1,
      explain: "Since the normal line is permanently perpendicular to the mirror surface, rotating the mirror by 10° causes the normal line to rotate by exactly <strong>10°</strong> in the same direction.",
      drawSvg: () => ""
    },
    {
      type: "mcq",
      text: "Why do we draw the normal line as a dashed line rather than a solid line?",
      options: [
        "To show that light travels through it.",
        "To indicate it is a construction line, not a physical light ray.",
        "To represent the mirror boundary.",
        "Because it represents diffuse reflection."
      ],
      correct: 1,
      explain: "The normal is a **conceptual helper (construction line)**, not an actual light ray, so it is standard to represent it as a dashed line.",
      drawSvg: () => ""
    },
    {
      type: "mcq",
      text: "If the angle of incidence is increased, the angle of reflection will:",
      options: [
        "Decrease by the same amount.",
        "Increase by the same amount.",
        "Stay exactly the same.",
        "Double in size."
      ],
      correct: 1,
      explain: "Since $r = i$, any change in the angle of incidence causes an **equal and identical change** in the angle of reflection.",
      drawSvg: () => ""
    },
    {
      type: "mcq",
      text: "Which of the following describes diffuse reflection?",
      options: [
        "Light reflecting off a highly polished mirror.",
        "Light scattering off a rough, uneven surface like paper.",
        "Light passing completely through water.",
        "Light reflecting without a normal line."
      ],
      correct: 1,
      explain: "Diffuse reflection occurs on **rough surfaces**, causing the parallel rays to reflect at different angles and scatter.",
      drawSvg: () => ""
    },
    {
      type: "mcq",
      text: "What is the total angle between the incident ray and the reflected ray if i = 30°?",
      options: [
        "30°",
        "60°",
        "90°",
        "120°"
      ],
      correct: 1,
      explain: "The total angle between the rays is $i + r$. Since $i = r = 30°$, the total angle is $30° + 30° = 60°$.",
      drawSvg: () => ""
    },
    {
      type: "mcq",
      text: "Which property of light does NOT change during reflection?",
      options: [
        "Direction of travel",
        "Speed",
        "Both speed and frequency",
        "Neither speed nor direction"
      ],
      correct: 2,
      explain: "Since the medium remains the same, both the **speed** and the **frequency** (and color) of the light ray do not change during reflection.",
      drawSvg: () => ""
    },
    {
      type: "mcq",
      text: "In reflection diagrams, arrows on light rays represent:",
      options: [
        "The speed of the ray.",
        "The direction of propagation of the light.",
        "The strength of the light source.",
        "The position of the normal."
      ],
      correct: 1,
      explain: "Arrows are critical in ray optics because they indicate the **direction in which the light is traveling**.",
      drawSvg: () => ""
    },
    {
      type: "mcq",
      text: "The reflection of light off a smooth lake surface is an example of:",
      options: [
        "Diffuse reflection.",
        "Regular (specular) reflection.",
        "Refraction.",
        "Total internal reflection."
      ],
      correct: 1,
      explain: "A smooth surface behaves like a mirror, giving rise to **regular (specular) reflection** which forms clear images.",
      drawSvg: () => ""
    }
  ];

  // Shuffle and pick 15 conceptual questions
  const selectedConceptual = shuffleArray(conceptualPool).slice(0, 15);
  quizPool.push(...selectedConceptual);

  // Generate 15 randomized calculation questions
  for (let i = 0; i < 15; i++) {
    // Generate a random angle of incidence between 10 and 80 degrees
    const angleI = Math.floor(Math.random() * 71) + 10; 
    
    // Choose between 3 types of calculation questions
    const calcType = Math.floor(Math.random() * 3);
    
    if (calcType === 0) {
      // Trivial incidence -> reflection
      quizPool.push({
        type: "calc",
        angleI: angleI,
        answer: angleI,
        text: `A light ray strikes a horizontal mirror with an angle of incidence of ${angleI}°. What is the angle of reflection in degrees?`,
        explain: `By the Second Law of Reflection, the angle of reflection (r) equals the angle of incidence (i). Therefore, <strong>r = ${angleI}°</strong>.`,
        drawSvg: (angleVal) => {
          return drawCalculationSvg(angleVal, angleVal);
        }
      });
    } else if (calcType === 1) {
      // Angle with surface given, find reflection
      const surfaceAngle = 90 - angleI;
      quizPool.push({
        type: "calc",
        angleI: angleI,
        answer: angleI,
        text: `A light ray strikes a horizontal mirror surface. The angle between the incident ray and the mirror surface is ${surfaceAngle}°. What is the angle of reflection in degrees?`,
        explain: `First, find the angle of incidence (i) by subtracting the surface angle from 90°: <strong>i = 90° - ${surfaceAngle}° = ${angleI}°</strong>.<br>Since r = i, the angle of reflection is also <strong>${angleI}°</strong>.`,
        drawSvg: (angleVal) => {
          return drawCalculationWithSurfaceSvg(angleVal, surfaceAngle);
        }
      });
    } else {
      // Total angle between incident and reflected ray given, find reflection
      const totalAngle = angleI * 2;
      quizPool.push({
        type: "calc",
        angleI: angleI,
        answer: angleI,
        text: `The total angle between the incident ray and the reflected ray is ${totalAngle}°. What is the angle of reflection in degrees?`,
        explain: `The total angle is equal to i + r. Since the angle of incidence equals the angle of reflection (i = r), we can divide the total angle by 2: <strong>r = ${totalAngle}° / 2 = ${angleI}°</strong>.`,
        drawSvg: (angleVal) => {
          return drawCalculationSvg(angleVal, angleVal, true);
        }
      });
    }
  }

  // Shuffle the entire quizPool containing 30 questions
  quizPool = shuffleArray(quizPool);
}

function shuffleArray(arr) {
  const newArr = [...arr];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

function drawCalculationSvg(angleVal, resultVal, showTotalArc = false) {
  const rad = (angleVal * Math.PI) / 180;
  const cx = 200, cy = 160, len = 110;
  const incX = cx - len * Math.sin(rad);
  const incY = cy - len * Math.cos(rad);
  const refX = cx + len * Math.sin(rad);
  const refY = cy - len * Math.cos(rad);

  return `
    <svg viewBox="0 0 400 200">
      <line x1="50" y1="160" x2="350" y2="160" class="mirror-line" />
      <line x1="200" y1="30" x2="200" y2="160" class="normal-line" />
      <line x1="${incX}" y1="${incY}" x2="${cx}" y2="${cy}" class="ray incident-ray" />
      <line x1="${cx}" y1="${cy}" x2="${refX}" y2="${refY}" class="ray reflected-ray" />
      <path d="${getLineArrowPath(incX, incY, cx, cy)}" fill="none" stroke="var(--neon-cyan)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" class="ray" />
      <path d="${getLineArrowPath(cx, cy, refX, refY)}" fill="none" stroke="var(--neon-cyan)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" class="ray" />
      ${showTotalArc ? `
        <path d="M ${incX/2 + 100} ${incY/2 + 80} A 50,50 0 0 1 ${refX/2 + 100} ${refY/2 + 80}" class="angle-arc" style="stroke: var(--neon-yellow); fill:none;" />
      ` : `
        <path d="M ${cx - 30*Math.sin(rad)} ${cy - 30*Math.cos(rad)} A 30,30 0 0 1 ${cx} ${cy - 30}" class="angle-arc" style="stroke: var(--neon-yellow); fill:none;" />
        <path d="M ${cx} ${cy - 30} A 30,30 0 0 1 ${cx + 30*Math.sin(rad)} ${cy - 30*Math.cos(rad)}" class="angle-arc" style="stroke: var(--neon-yellow); fill:none;" />
      `}
      <text x="200" y="25" class="label-text label-normal">Normal</text>
    </svg>
  `;
}

function drawCalculationWithSurfaceSvg(angleVal, surfaceAngle) {
  const rad = (angleVal * Math.PI) / 180;
  const cx = 200, cy = 160, len = 110;
  const incX = cx - len * Math.sin(rad);
  const incY = cy - len * Math.cos(rad);

  return `
    <svg viewBox="0 0 400 200">
      <line x1="50" y1="160" x2="350" y2="160" class="mirror-line" />
      <line x1="200" y1="30" x2="200" y2="160" class="normal-line" />
      <line x1="${incX}" y1="${incY}" x2="${cx}" y2="${cy}" class="ray incident-ray" />
      <path d="${getLineArrowPath(incX, incY, cx, cy)}" fill="none" stroke="var(--neon-cyan)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" class="ray" />
      <path d="M ${cx - 40} ${cy} A 40,40 0 0 1 ${cx - 40*Math.sin(rad)} ${cy - 40*Math.cos(rad)}" class="angle-arc" style="stroke: var(--neon-yellow); fill:none;" />
      <text x="${cx - 60}" y="${cy - 15}" class="label-text angle-label" style="opacity:1;">${surfaceAngle}°</text>
      <text x="200" y="25" class="label-text label-normal">Normal</text>
    </svg>
  `;
}

function showQuizQuestion() {
  const q = quizPool[currentQuizIdx];
  
  // Update Header progress
  document.getElementById('quiz-progress-text').textContent = `Question ${currentQuizIdx + 1}/${TOTAL_QUIZ_QUESTIONS}`;
  const progressPercent = ((currentQuizIdx) / TOTAL_QUIZ_QUESTIONS) * 100;
  document.getElementById('quiz-progress-bar').style.width = `${progressPercent}%`;

  // Update question text
  document.getElementById('quiz-question-text').textContent = q.text;

  // Draw diagram
  const diagramContainer = document.getElementById('quiz-question-diagram');
  if (q.drawSvg) {
    diagramContainer.style.display = 'flex';
    diagramContainer.innerHTML = q.drawSvg(q.angleI || 45);
  } else {
    diagramContainer.style.display = 'none';
  }

  // Show corresponding inputs
  const mcqContainer = document.getElementById('quiz-mcq-options');
  const numContainer = document.getElementById('quiz-num-input-container');
  const numInput = document.getElementById('quiz-num-input');

  if (q.type === "mcq") {
    mcqContainer.style.display = 'flex';
    numContainer.style.display = 'none';
    
    // Draw MCQ buttons
    mcqContainer.innerHTML = '';
    q.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'btn-option';
      btn.textContent = opt;
      btn.addEventListener('click', () => handleMcqSubmit(idx));
      mcqContainer.appendChild(btn);
    });
  } else {
    mcqContainer.style.display = 'none';
    numContainer.style.display = 'flex';
    numInput.value = '';
    
    // Wire submit button
    const submitBtn = document.getElementById('btn-submit-num');
    // Remove old listeners
    const newSubmitBtn = submitBtn.cloneNode(true);
    submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);
    newSubmitBtn.addEventListener('click', handleNumSubmit);
  }
}

function handleMcqSubmit(selectedIdx) {
  const q = quizPool[currentQuizIdx];
  const isCorrect = selectedIdx === q.correct;
  
  showSolutionView(isCorrect);
}

function handleNumSubmit() {
  const q = quizPool[currentQuizIdx];
  const numInput = document.getElementById('quiz-num-input');
  const value = parseFloat(numInput.value);

  if (isNaN(value)) {
    alert("Please enter a valid number!");
    return;
  }

  // Verify within 2% tolerance
  const diff = Math.abs(value - q.answer);
  const percentageDiff = (diff / q.answer) * 100;
  const isCorrect = percentageDiff <= 2;

  showSolutionView(isCorrect);
}

function showSolutionView(isCorrect) {
  const q = quizPool[currentQuizIdx];
  const questionView = document.getElementById('quiz-question-view');
  const solutionView = document.getElementById('quiz-solution-view');
  const feedbackTitle = document.getElementById('quiz-feedback-title');
  const solutionDiagram = document.getElementById('quiz-solution-diagram');
  const solutionText = document.getElementById('quiz-solution-text');

  if (isCorrect) {
    quizScore++;
    feedbackTitle.textContent = "Correct! ✓";
    feedbackTitle.className = "feedback-title neon-text-cyan";
    triggerConfetti();
  } else {
    feedbackTitle.textContent = "Incorrect ⚠";
    feedbackTitle.className = "feedback-title neon-text-yellow";
  }

  // Draw full worked solution diagram
  // In solution, draw full incident + normal + reflected rays
  const angleVal = q.angleI || 45;
  const rad = (angleVal * Math.PI) / 180;
  const cx = 200, cy = 160, len = 110;
  const incX = cx - len * Math.sin(rad);
  const incY = cy - len * Math.cos(rad);
  const refX = cx + len * Math.sin(rad);
  const refY = cy - len * Math.cos(rad);

  solutionDiagram.innerHTML = `
    <svg viewBox="0 0 400 200">
      <line x1="50" y1="160" x2="350" y2="160" class="mirror-line" />
      <line x1="200" y1="30" x2="200" y2="160" class="normal-line" />
      <line x1="${incX}" y1="${incY}" x2="${cx}" y2="${cy}" class="ray incident-ray" />
      <line x1="${cx}" y1="${cy}" x2="${refX}" y2="${refY}" class="ray reflected-ray" />
      <path d="${getLineArrowPath(incX, incY, cx, cy)}" fill="none" stroke="var(--neon-cyan)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" class="ray" />
      <path d="${getLineArrowPath(cx, cy, refX, refY)}" fill="none" stroke="var(--neon-cyan)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" class="ray" />
      <path d="M ${cx - 30*Math.sin(rad)} ${cy - 30*Math.cos(rad)} A 30,30 0 0 1 ${cx} ${cy - 30}" class="angle-arc" style="stroke: var(--neon-yellow); fill:none;" />
      <path d="M ${cx} ${cy - 30} A 30,30 0 0 1 ${cx + 30*Math.sin(rad)} ${cy - 30*Math.cos(rad)}" class="angle-arc" style="stroke: var(--neon-yellow); fill:none;" />
      <text x="200" y="25" class="label-text label-normal">Normal</text>
      <text x="${cx - 45*Math.sin(rad/2)}" y="${cy - 45*Math.cos(rad/2)}" class="label-text angle-label" style="opacity:1;">i = ${angleVal}°</text>
      <text x="${cx + 45*Math.sin(rad/2)}" y="${cy - 45*Math.cos(rad/2)}" class="label-text angle-label" style="opacity:1;">r = ${angleVal}°</text>
    </svg>
  `;

  solutionText.innerHTML = `
    <p>${q.explain}</p>
    <p class="margin-top-8"><strong>Law:</strong> Angle of incidence (i) = Angle of reflection (r) = ${angleVal}°.</p>
  `;

  questionView.classList.remove('active');
  solutionView.classList.add('active');
}

function showQuizResults() {
  const resultsView = document.getElementById('quiz-results-view');
  const finalScore = document.getElementById('final-score');
  const finalPercentage = document.getElementById('final-percentage');
  const gradeFeedback = document.getElementById('grade-feedback');
  const gradeComment = document.getElementById('grade-comment');

  finalScore.textContent = `${quizScore}/${TOTAL_QUIZ_QUESTIONS}`;
  
  const percentage = Math.round((quizScore / TOTAL_QUIZ_QUESTIONS) * 100);
  finalPercentage.textContent = `${percentage}%`;

  let grade = "";
  let comment = "";

  if (percentage >= 90) {
    grade = "A1 (Distinction)";
    comment = "Outstanding! You have masterfully applied the laws of reflection.";
  } else if (percentage >= 80) {
    grade = "A2 (Distinction)";
    comment = "Excellent work! Solid grasp of ray diagrams.";
  } else if (percentage >= 70) {
    grade = "B3 (Merit)";
    comment = "Good job! A few minor errors, but well on track.";
  } else if (percentage >= 60) {
    grade = "B4 (Merit)";
    comment = "Decent effort. Try reviewing the tilted mirror worked examples.";
  } else if (percentage >= 50) {
    grade = "C5/C6 (Pass)";
    comment = "You passed! Review the flashcards to secure a stronger distinction grade.";
  } else {
    grade = "F9 (Ungraded)";
    comment = "Let's review the concepts and interactive ray diagram before retrying!";
  }

  gradeFeedback.textContent = `Grade: ${grade}`;
  gradeComment.textContent = comment;
}

// ==========================================
// CONFETTI CELEBRATION
// ==========================================
function triggerConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  
  // Set canvas bounds
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight;

  const colors = ['#00f3ff', '#ffe600', '#ffffff', '#00b4d8'];
  const particles = [];

  for (let i = 0; i < 40; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.7) * 10,
      radius: Math.random() * 4 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      decay: Math.random() * 0.02 + 0.015
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let active = false;
    particles.forEach(p => {
      if (p.alpha > 0) {
        active = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2; // gravity
        p.alpha -= p.decay;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      }
    });

    if (active) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  animate();
}
