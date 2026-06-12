/**
 * Principle of Moments - Interactive Web App
 * Designed for 16-year-old O-Level Physics Students
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // NAVIGATION SETUP
  // ==========================================================================
  const navButtons = document.querySelectorAll('.nav-btn');
  const sections = document.querySelectorAll('.section-panel');

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-section');
      
      navButtons.forEach(b => b.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));
      
      btn.classList.add('active');
      const targetSection = document.getElementById(targetId);
      targetSection.classList.add('active');

      // Trigger section-specific initializers if necessary
      if (targetId === 'section-intro') {
        initIntroSection();
      } else if (targetId === 'section-lab') {
        initLabSection();
      } else if (targetId === 'section-walkthrough') {
        initWalkthroughSection();
      } else if (targetId === 'section-quiz') {
        // Keeps state or lets user start
      } else if (targetId === 'section-flashcards') {
        initFlashcardsSection();
      }
    });
  });


  // ==========================================================================
  // SECTION 1: CONCEPT INTRODUCTION INTERACTION
  // ==========================================================================
  let currentIntroStep = 0;
  const introSteps = [
    {
      title: "Clockwise & Anticlockwise Moments",
      html: `
        <p>A <strong>moment</strong> is the turning effect of a force. Moments tilt beams around a fixed pivot point.</p>
        <ul>
          <li><span class="highlight-cyan">Anticlockwise moments</span> try to rotate the beam counter-clockwise (to the left).</li>
          <li><span class="highlight-pink">Clockwise moments</span> try to rotate the beam clockwise (to the right).</li>
        </ul>
        <p>Use the simulator above to see the tilt when moments are unequal, or watch them align in perfect balance.</p>
      `,
      action: () => {
        // Animate tilt left/right periodically to demonstrate unequal and equal moments
        animateIntroBeam('periodic-tilt');
      }
    },
    {
      title: "Principle of Moments",
      html: `
        <p>For a body in <strong>equilibrium</strong> (balanced and not rotating), the turning effects on both sides must cancel out:</p>
        <div class="equation-display">
          <span class="highlight-cyan">&Sigma;M<sub>anticlockwise</sub></span> = <span class="highlight-pink">&Sigma;M<sub>clockwise</sub></span>
        </div>
        <p>The sum of clockwise moments about any pivot equals the sum of anticlockwise moments about the same pivot.</p>
      `,
      action: () => {
        // Bring beam to balance state
        animateIntroBeam('balanced');
      }
    },
    {
      title: "Reaction Force at the Pivot",
      html: `
        <p>When in equilibrium, all downward forces must balance. The pivot pushes upward with a <strong>Reaction Force (R)</strong>.</p>
        <p>Since the reaction force passes directly through the pivot, its perpendicular distance from the pivot is <strong>zero</strong>. Therefore, it produces <strong>zero moment</strong>.</p>
        <div class="equation-display">
          <span class="highlight-green">R = Sum of all weights</span>
        </div>
      `,
      action: () => {
        // Highlight reaction force R
        animateIntroBeam('reaction-focus');
      }
    }
  ];

  const introTextPanel = document.getElementById('intro-text-panel');
  const introPrevBtn = document.getElementById('intro-prev-btn');
  const introNextBtn = document.getElementById('intro-next-btn');
  const introDots = document.querySelectorAll('.step-dot');
  let introTimer = null;

  function initIntroSection() {
    currentIntroStep = 0;
    renderIntroStep();
  }

  function renderIntroStep() {
    clearInterval(introTimer);
    introTimer = null;

    // Update dots
    introDots.forEach((dot, idx) => {
      if (idx === currentIntroStep) dot.classList.add('active');
      else dot.classList.remove('active');
    });

    // Load step text
    const step = introSteps[currentIntroStep];
    introTextPanel.innerHTML = `
      <div class="intro-text-block">
        <h3>Part ${String.fromCharCode(65 + currentIntroStep)} — ${step.title}</h3>
        ${step.html}
      </div>
    `;

    // Button states
    introPrevBtn.disabled = currentIntroStep === 0;
    if (currentIntroStep === introSteps.length - 1) {
      introNextBtn.textContent = "Finish & Open Lab";
    } else {
      introNextBtn.textContent = "Next";
    }

    // Execute diagram animation state
    step.action();
  }

  function animateIntroBeam(state) {
    const beam = document.getElementById('intro-rotating-beam');
    const leftMass = document.getElementById('intro-left-mass-group');
    const rightMass = document.getElementById('intro-right-mass-group');
    const reactionGroup = document.getElementById('intro-reaction-group');
    const reactionArrowhead = document.getElementById('reaction-arrowhead');
    const anticlockwiseCurve = document.getElementById('anticlockwise-curve');
    const anticlockwiseLabel = document.getElementById('anticlockwise-label');
    const clockwiseCurve = document.getElementById('clockwise-curve');
    const clockwiseLabel = document.getElementById('clockwise-label');

    // Reset standard transforms
    beam.style.transition = "transform 1.5s ease-in-out";
    beam.style.transformOrigin = "300px 220px";

    if (state === 'periodic-tilt') {
      reactionGroup.style.opacity = "0";
      reactionArrowhead.style.opacity = "0";
      anticlockwiseCurve.style.display = "block";
      anticlockwiseLabel.style.display = "block";
      clockwiseCurve.style.display = "block";
      clockwiseLabel.style.display = "block";

      // Periodically tilt the beam to show balance vs imbalance
      let phase = 0;
      beam.style.transform = "rotate(0deg)";
      introTimer = setInterval(() => {
        phase = (phase + 1) % 4;
        if (phase === 0) {
          beam.style.transform = "rotate(-8deg)"; // Tilt anticlockwise
          rightMass.style.opacity = "0.3";
          leftMass.style.opacity = "1";
        } else if (phase === 1) {
          beam.style.transform = "rotate(0deg)"; // Balanced
          rightMass.style.opacity = "1";
          leftMass.style.opacity = "1";
        } else if (phase === 2) {
          beam.style.transform = "rotate(8deg)"; // Tilt clockwise
          rightMass.style.opacity = "1";
          leftMass.style.opacity = "0.3";
        } else {
          beam.style.transform = "rotate(0deg)"; // Balanced
          rightMass.style.opacity = "1";
          leftMass.style.opacity = "1";
        }
      }, 2500);

    } else if (state === 'balanced') {
      reactionGroup.style.opacity = "0";
      reactionArrowhead.style.opacity = "0";
      anticlockwiseCurve.style.display = "block";
      anticlockwiseLabel.style.display = "block";
      clockwiseCurve.style.display = "block";
      clockwiseLabel.style.display = "block";
      leftMass.style.opacity = "1";
      rightMass.style.opacity = "1";
      beam.style.transform = "rotate(0deg)";
    } else if (state === 'reaction-focus') {
      beam.style.transform = "rotate(0deg)";
      leftMass.style.opacity = "0.4";
      rightMass.style.opacity = "0.4";
      anticlockwiseCurve.style.display = "none";
      anticlockwiseLabel.style.display = "none";
      clockwiseCurve.style.display = "none";
      clockwiseLabel.style.display = "none";

      reactionGroup.style.opacity = "1";
      reactionGroup.style.transition = "opacity 0.5s ease";
      reactionArrowhead.style.opacity = "1";
    }
  }

  introNextBtn.addEventListener('click', () => {
    if (currentIntroStep < introSteps.length - 1) {
      currentIntroStep++;
      renderIntroStep();
    } else {
      // Transition to Section 2 (Lab)
      document.getElementById('nav-lab').click();
    }
  });

  introPrevBtn.addEventListener('click', () => {
    if (currentIntroStep > 0) {
      currentIntroStep--;
      renderIntroStep();
    }
  });


  // ==========================================================================
  // SECTION 2: INTERACTIVE BEAM LAB INTERACTION
  // ==========================================================================
  let labWeights = [
    { id: 1, side: 'left', mass: 200, dist: 0.6 },
    { id: 2, side: 'right', mass: 300, dist: 0.4 }
  ];
  let nextWeightId = 3;

  function initLabSection() {
    renderRulerMarkers();
    updateLabUI();
  }

  function renderRulerMarkers() {
    const markersGroup = document.getElementById('ruler-markers');
    markersGroup.innerHTML = '';
    
    // Total width of ruler in px: 600 (from 100 to 700)
    // Pivot at 400.
    // 0.1m corresponds to 30px.
    // Add mark ticks and numbers
    for (let d = -1.0; d <= 1.0; d = parseFloat((d + 0.1).toFixed(1))) {
      if (Math.abs(d) < 0.05) continue; // Skip zero (pivot center)
      
      const x = 400 + d * 300;
      // Drawing ticks
      const isMajor = parseFloat((Math.abs(d) % 0.2).toFixed(1)) === 0 || Math.abs(d) === 1.0 || Math.abs(d) === 0.5;
      const height = isMajor ? 12 : 6;
      
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", x);
      line.setAttribute("y1", 240 - height);
      line.setAttribute("x2", x);
      line.setAttribute("y2", 240);
      line.setAttribute("stroke", isMajor ? "#a0aec0" : "#718096");
      line.setAttribute("stroke-width", isMajor ? "2" : "1");
      markersGroup.appendChild(line);

      // Add label on major marks
      if (isMajor) {
        const txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
        txt.setAttribute("x", x);
        txt.setAttribute("y", 220);
        txt.setAttribute("fill", "#718096");
        txt.setAttribute("font-family", "Plus Jakarta Sans");
        txt.setAttribute("font-size", "10");
        txt.setAttribute("text-anchor", "middle");
        txt.textContent = `${Math.abs(d).toFixed(1)}m`;
        markersGroup.appendChild(txt);
      }
    }
  }

  function updateLabUI() {
    const hangingGroup = document.getElementById('lab-hanging-masses');
    hangingGroup.innerHTML = '';

    // Calculate moments
    let totalACW = 0;
    let totalCW = 0;
    let totalMass = 0;

    labWeights.forEach(weight => {
      const wN = (weight.mass / 1000) * 10; // weight in Newtons
      const moment = wN * weight.dist;

      if (weight.side === 'left') {
        totalACW += moment;
      } else {
        totalCW += moment;
      }
      totalMass += weight.mass;

      // Draw SVG element
      const directionFactor = weight.side === 'left' ? -1 : 1;
      const x = 400 + directionFactor * weight.dist * 300;
      
      // Box size based on mass
      const boxWidth = 30 + (weight.mass / 500) * 20;
      const boxHeight = 20 + (weight.mass / 500) * 15;
      
      const massG = document.createElementNS("http://www.w3.org/2000/svg", "g");
      massG.setAttribute("class", "drag-handle");
      massG.setAttribute("data-id", weight.id);

      // Thread line hanging from beam (from y: 250 to weight box)
      const thread = document.createElementNS("http://www.w3.org/2000/svg", "line");
      thread.setAttribute("x1", x);
      thread.setAttribute("y1", 255);
      thread.setAttribute("x2", x);
      thread.setAttribute("y2", 285);
      thread.setAttribute("stroke", "#718096");
      thread.setAttribute("stroke-width", "2");
      massG.appendChild(thread);

      // Weight Rect
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", x - boxWidth / 2);
      rect.setAttribute("y", 285);
      rect.setAttribute("width", boxWidth);
      rect.setAttribute("height", boxHeight);
      rect.setAttribute("rx", "4");
      rect.setAttribute("fill", "#0f172a");
      rect.setAttribute("stroke", weight.side === 'left' ? "var(--neon-cyan)" : "var(--neon-pink)");
      rect.setAttribute("stroke-width", "2");
      rect.setAttribute("filter", weight.side === 'left' ? "url(#neon-glow-cyan)" : "url(#neon-glow-pink)");
      massG.appendChild(rect);

      // Mass text label
      const txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
      txt.setAttribute("x", x);
      txt.setAttribute("y", 285 + boxHeight / 2 + 4);
      txt.setAttribute("fill", "#fff");
      txt.setAttribute("font-family", "Orbitron");
      txt.setAttribute("font-size", "10");
      txt.setAttribute("font-weight", "bold");
      txt.setAttribute("text-anchor", "middle");
      txt.textContent = `${weight.mass}g`;
      massG.appendChild(txt);

      // Distance tag
      const distTxt = document.createElementNS("http://www.w3.org/2000/svg", "text");
      distTxt.setAttribute("x", x);
      distTxt.setAttribute("y", 277);
      distTxt.setAttribute("fill", weight.side === 'left' ? "var(--neon-cyan)" : "var(--neon-pink)");
      distTxt.setAttribute("font-family", "Plus Jakarta Sans");
      distTxt.setAttribute("font-size", "9");
      distTxt.setAttribute("font-weight", "bold");
      distTxt.setAttribute("text-anchor", "middle");
      distTxt.textContent = `${weight.dist.toFixed(1)}m`;
      massG.appendChild(distTxt);

      // Drag/Interactive behaviors (Mouse & Touch support)
      let isDragging = false;
      const startDrag = () => { isDragging = true; };
      const doDrag = (e) => {
        if (!isDragging) return;
        const rectSvg = document.getElementById('lab-svg').getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const relativeX = clientX - rectSvg.left;
        const svgWidth = rectSvg.width;
        // Map relativeX (0 to svgWidth) to SVG view box coords (0 to 800)
        const svgX = (relativeX / svgWidth) * 800;
        
        // Pivot is at 400
        const deltaX = svgX - 400;
        
        if (weight.side === 'left' && deltaX < 0) {
          // Range is -300 to -30 px corresponding to 1.0m to 0.1m
          const targetDist = Math.max(0.1, Math.min(1.0, Math.abs(deltaX) / 300));
          weight.dist = parseFloat(targetDist.toFixed(1));
          updateLabUI();
        } else if (weight.side === 'right' && deltaX > 0) {
          const targetDist = Math.max(0.1, Math.min(1.0, deltaX / 300));
          weight.dist = parseFloat(targetDist.toFixed(1));
          updateLabUI();
        }
      };
      const endDrag = () => { isDragging = false; };

      massG.addEventListener('mousedown', startDrag);
      window.addEventListener('mousemove', doDrag);
      window.addEventListener('mouseup', endDrag);

      massG.addEventListener('touchstart', startDrag);
      window.addEventListener('touchmove', doDrag);
      window.addEventListener('touchend', endDrag);

      hangingGroup.appendChild(massG);
    });

    // Reaction Force calculation
    const totalDownForceN = (totalMass / 1000) * 10;
    document.getElementById('lab-reaction-val').textContent = totalDownForceN.toFixed(1);
    
    // Scale Reaction arrow height based on force
    const reactionArrow = document.getElementById('lab-reaction-arrow');
    const scaleFactor = Math.min(1.5, Math.max(0.4, totalDownForceN / 10));
    reactionArrow.style.transform = `scaleY(${scaleFactor})`;
    reactionArrow.style.transformOrigin = "400px 250px";

    // Text metrics
    document.getElementById('lab-total-acw').textContent = totalACW.toFixed(2);
    document.getElementById('lab-total-cw').textContent = totalCW.toFixed(2);

    const acwMath = document.querySelector('.acw-math');
    const cwMath = document.querySelector('.cw-math');
    const relationSymbol = document.querySelector('.relation-symbol');
    const comparisonBox = document.getElementById('lab-comparison-box');
    const balanceCard = document.getElementById('lab-balance-card');
    const balanceStatus = document.getElementById('lab-balance-status');
    const rotatingGroup = document.getElementById('lab-rotating-group');

    acwMath.textContent = `${totalACW.toFixed(2)} N·m`;
    cwMath.textContent = `${totalCW.toFixed(2)} N·m`;

    // Tolerance and Balance evaluation
    const diff = totalCW - totalACW;
    const absDiff = Math.abs(diff);

    // Apply tilt animation to beam representation
    rotatingGroup.style.transition = "transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
    rotatingGroup.style.transformOrigin = "400px 250px";

    if (absDiff < 0.01) { // Balanced
      relationSymbol.textContent = "=";
      comparisonBox.className = "math-comparison-box balanced";
      balanceCard.className = "balance-card balanced";
      balanceStatus.textContent = "BALANCED";
      rotatingGroup.style.transform = "rotate(0deg)";
    } else if (diff > 0) { // Clockwise tilt
      relationSymbol.textContent = "<";
      comparisonBox.className = "math-comparison-box";
      balanceCard.className = "balance-card tilted-cw";
      balanceStatus.textContent = "TILTING CLOCKWISE";
      // Cap rotation at 10 deg
      const rot = Math.min(10, 2 + absDiff * 15);
      rotatingGroup.style.transform = `rotate(${rot}deg)`;
    } else { // Anticlockwise tilt
      relationSymbol.textContent = ">";
      comparisonBox.className = "math-comparison-box";
      balanceCard.className = "balance-card tilted-acw";
      balanceStatus.textContent = "TILTING ANTICLOCKWISE";
      const rot = Math.min(10, 2 + absDiff * 15);
      rotatingGroup.style.transform = `rotate(${-rot}deg)`;
    }

    // Populate Sidebar weight lists with sliders
    renderLabList('left', totalACW);
    renderLabList('right', totalCW);
  }

  function renderLabList(side, total) {
    const listEl = document.getElementById(`lab-${side}-list`);
    listEl.innerHTML = '';

    const weights = labWeights.filter(w => w.side === side);
    
    if (weights.length === 0) {
      listEl.innerHTML = `<div class="text-muted" style="font-size:0.8rem;text-align:center;padding:1rem;">No masses added</div>`;
      return;
    }

    weights.forEach(weight => {
      const wN = (weight.mass / 1000) * 10;
      const mVal = wN * weight.dist;

      const item = document.createElement('div');
      item.className = 'mass-item';
      item.innerHTML = `
        <div class="mass-item-top">
          <span style="font-weight:bold;">Mass Block (${weight.mass}g)</span>
          <button class="mass-del-btn" data-id="${weight.id}">&times;</button>
        </div>
        <div class="mass-sliders">
          <div class="slider-group">
            <label>Mass</label>
            <input type="range" class="mass-slider" data-id="${weight.id}" min="50" max="500" step="50" value="${weight.mass}">
            <span class="slider-val">${weight.mass}g</span>
          </div>
          <div class="slider-group">
            <label>Dist.</label>
            <input type="range" class="dist-slider" data-id="${weight.id}" min="0.1" max="1.0" step="0.1" value="${weight.dist}">
            <span class="slider-val">${weight.dist.toFixed(1)}m</span>
          </div>
        </div>
        <div class="mass-item-calculation">
          <span>Moment = F &times; d = ${wN.toFixed(1)}N &times; ${weight.dist.toFixed(1)}m</span>
          <span class="val-hi">${mVal.toFixed(2)} N&middot;m</span>
        </div>
      `;

      // Slider Listeners
      item.querySelector('.mass-slider').addEventListener('input', (e) => {
        weight.mass = parseInt(e.target.value);
        updateLabUI();
      });
      item.querySelector('.dist-slider').addEventListener('input', (e) => {
        weight.dist = parseFloat(e.target.value);
        updateLabUI();
      });
      // Delete Listener
      item.querySelector('.mass-del-btn').addEventListener('click', () => {
        labWeights = labWeights.filter(w => w.id !== weight.id);
        updateLabUI();
      });

      listEl.appendChild(item);
    });
  }

  // Add Left / Right mass handlers
  document.getElementById('add-left-mass').addEventListener('click', () => {
    const sideMasses = labWeights.filter(w => w.side === 'left');
    if (sideMasses.length >= 4) {
      alert("Maximum of 4 masses per side reached!");
      return;
    }
    // Pick an empty distance slot to avoid overlapping perfectly if possible
    const usedDists = sideMasses.map(w => w.dist);
    let newDist = 0.5;
    for (let d = 0.2; d <= 1.0; d += 0.2) {
      if (!usedDists.includes(parseFloat(d.toFixed(1)))) {
        newDist = parseFloat(d.toFixed(1));
        break;
      }
    }
    labWeights.push({ id: nextWeightId++, side: 'left', mass: 100, dist: newDist });
    updateLabUI();
  });

  document.getElementById('add-right-mass').addEventListener('click', () => {
    const sideMasses = labWeights.filter(w => w.side === 'right');
    if (sideMasses.length >= 4) {
      alert("Maximum of 4 masses per side reached!");
      return;
    }
    const usedDists = sideMasses.map(w => w.dist);
    let newDist = 0.5;
    for (let d = 0.2; d <= 1.0; d += 0.2) {
      if (!usedDists.includes(parseFloat(d.toFixed(1)))) {
        newDist = parseFloat(d.toFixed(1));
        break;
      }
    }
    labWeights.push({ id: nextWeightId++, side: 'right', mass: 100, dist: newDist });
    updateLabUI();
  });


  // ==========================================================================
  // SECTION 3: WORKED EXAMPLES INTERACTION
  // ==========================================================================
  let currentWalkthroughExample = 1;
  let currentWalkthroughStep = 0;

  const walkthroughData = {
    example1: {
      stepsCount: 4,
      steps: [
        {
          title: "Identify Clockwise & Anticlockwise Forces",
          desc: `
            <p>Locate the forces acting on the beam relative to the central pivot:</p>
            <ul>
              <li><strong>Left Side (Anticlockwise):</strong> A known mass of 200 g at 0.6 m.</li>
              <li><strong>Right Side (Clockwise):</strong> An unknown mass <strong>m</strong> at 0.4 m.</li>
            </ul>
            <p>Convert masses to weights (Force = mass in kg &times; 10 N/kg):</p>
            <ul>
              <li>Left Force = 0.2 kg &times; 10 N/kg = 2.0 N</li>
              <li>Right Force = W = (m / 1000) &times; 10 = 0.01m Newtons</li>
            </ul>
          `,
          render: (svg) => {
            svg.innerHTML = `
              <!-- Left Force (Anticlockwise) -->
              <rect x="200" y="218" width="30" height="20" rx="3" fill="#0f172a" stroke="var(--neon-cyan)" stroke-width="2" filter="url(#neon-glow-cyan)" />
              <text x="215" y="232" fill="#fff" font-size="10" font-family="Orbitron" text-anchor="middle">200g</text>
              <line x1="215" y1="238" x2="215" y2="280" stroke="var(--neon-cyan)" stroke-width="2" />
              <polygon points="215,285 210,277 220,277" fill="var(--neon-cyan)" />
              <text x="215" y="298" fill="var(--neon-cyan)" font-size="11" font-weight="bold" font-family="Orbitron" text-anchor="middle">2.0 N</text>
              
              <!-- Right Force (Clockwise) -->
              <rect x="410" y="218" width="30" height="20" rx="3" fill="#0f172a" stroke="var(--neon-pink)" stroke-width="2" filter="url(#neon-glow-pink)" />
              <text x="425" y="232" fill="#fff" font-size="10" font-family="Orbitron" text-anchor="middle">m</text>
              <line x1="425" y1="238" x2="425" y2="280" stroke="var(--neon-pink)" stroke-width="2" />
              <polygon points="425,285 420,277 430,277" fill="var(--neon-pink)" />
              
              <!-- Distances -->
              <line x1="215" y1="190" x2="300" y2="190" stroke="var(--neon-cyan)" stroke-width="1.5" stroke-dasharray="2,2" />
              <text x="257" y="182" fill="var(--neon-cyan)" font-size="10" text-anchor="middle">0.6 m</text>

              <line x1="300" y1="190" x2="425" y2="190" stroke="var(--neon-pink)" stroke-width="1.5" stroke-dasharray="2,2" />
              <text x="362" y="182" fill="var(--neon-pink)" font-size="10" text-anchor="middle">0.4 m</text>
            `;
          }
        },
        {
          title: "Apply the Principle of Moments",
          desc: `
            <p>Since the beam is balanced, the sum of clockwise moments equals the sum of anticlockwise moments:</p>
            <div class="equation-display">
              <span class="highlight-cyan">&Sigma;M<sub>anticlockwise</sub></span> = <span class="highlight-pink">&Sigma;M<sub>clockwise</sub></span>
            </div>
            <p>Write out the raw equation using: Moment = Force &times; Distance</p>
            <p style="text-align:center; font-family:var(--font-logo);">
              (2.0 N &times; 0.6 m) = (W<sub>right</sub> &times; 0.4 m)
            </p>
          `,
          render: (svg) => {
            svg.innerHTML = `
              <!-- Left Weight & Moment Curve -->
              <rect x="200" y="218" width="30" height="20" rx="3" fill="#0f172a" stroke="var(--neon-cyan)" stroke-width="2" opacity="0.5" />
              <path d="M 230 170 A 70 70 0 0 0 290 130" fill="none" stroke="var(--neon-cyan)" stroke-width="3" stroke-dasharray="3,3" filter="url(#neon-glow-cyan)" />
              <text x="220" y="145" fill="var(--neon-cyan)" font-size="11" font-weight="bold" font-family="Orbitron">1.20 N·m</text>

              <!-- Right Weight & Moment Curve -->
              <rect x="410" y="218" width="30" height="20" rx="3" fill="#0f172a" stroke="var(--neon-pink)" stroke-width="2" opacity="0.5" />
              <path d="M 370 170 A 70 70 0 0 1 310 130" fill="none" stroke="var(--neon-pink)" stroke-width="3" stroke-dasharray="3,3" filter="url(#neon-glow-pink)" />
              <text x="380" y="145" fill="var(--neon-pink)" font-size="11" font-weight="bold" font-family="Orbitron">W &times; 0.4 m</text>
            `;
          }
        },
        {
          title: "Solve for the Unknown Mass",
          desc: `
            <p>1. Calculate the left-hand moment:<br>
            Moment = 2.0 &times; 0.6 = <strong>1.2 N&middot;m</strong></p>
            <p>2. Solve for Weight of right mass (W):<br>
            1.2 = W &times; 0.4 &rArr; W = 1.2 / 0.4 = <strong>3.0 N</strong></p>
            <p>3. Convert Weight back to Mass:<br>
            Mass = (3.0 N / 10 N/kg) &times; 1000 = <strong>300 g</strong></p>
          `,
          render: (svg) => {
            svg.innerHTML = `
              <!-- Left Side -->
              <rect x="200" y="218" width="30" height="20" rx="3" fill="#0f172a" stroke="var(--neon-cyan)" stroke-width="2" />
              <text x="215" y="232" fill="#fff" font-size="10" font-family="Orbitron" text-anchor="middle">200g</text>

              <!-- Right Side solved -->
              <rect x="410" y="218" width="30" height="20" rx="3" fill="#0f172a" stroke="var(--neon-green)" stroke-width="2" filter="url(#neon-glow-green)" />
              <text x="425" y="232" fill="#39ff14" font-size="10" font-weight="bold" font-family="Orbitron" text-anchor="middle">300g</text>
              <line x1="425" y1="238" x2="425" y2="280" stroke="var(--neon-green)" stroke-width="2" filter="url(#neon-glow-green)" />
              <polygon points="425,285 420,277 430,277" fill="var(--neon-green)" />
              <text x="425" y="298" fill="var(--neon-green)" font-size="11" font-weight="bold" font-family="Orbitron" text-anchor="middle">3.0 N</text>
            `;
          }
        },
        {
          title: "State Reaction Force at the Pivot",
          desc: `
            <p>In equilibrium, upward forces equal downward forces. The pivot reacts to hold up the total load.</p>
            <div class="equation-display">
              <span class="highlight-green">R = Weight<sub>left</sub> + Weight<sub>right</sub></span>
            </div>
            <p>R = 2.0 N + 3.0 N = <strong>5.0 N</strong></p>
            <p>The pivot exerts an upward force of <strong>5.0 N</strong>. Because this force has no perpendicular distance from the pivot, it produces no moment.</p>
          `,
          render: (svg) => {
            svg.innerHTML = `
              <!-- Left Weight -->
              <rect x="200" y="218" width="30" height="20" rx="3" fill="#0f172a" stroke="#4a5568" stroke-width="2" opacity="0.4" />
              <!-- Right Weight -->
              <rect x="410" y="218" width="30" height="20" rx="3" fill="#0f172a" stroke="#4a5568" stroke-width="2" opacity="0.4" />

              <!-- Reaction Force R -->
              <line x1="300" y1="210" x2="300" y2="120" stroke="var(--neon-green)" stroke-width="4" filter="url(#neon-glow-green)" />
              <polygon points="300,110 293,120 307,120" fill="var(--neon-green)" />
              <text x="315" y="135" fill="var(--neon-green)" font-family="Orbitron" font-size="16" font-weight="bold" filter="url(#neon-glow-green)">R = 5.0 N</text>
            `;
          }
        }
      ]
    },
    example2: {
      stepsCount: 5,
      steps: [
        {
          title: "Identify Clockwise & Anticlockwise Forces",
          desc: `
            <p>This problem has <strong>three forces</strong> acting on the beam:</p>
            <ul>
              <li><strong>Left Side (Anticlockwise):</strong>
                <ul>
                  <li>Mass 1: 300 g (3.0 N) at 0.5 m</li>
                  <li>Mass 2: 100 g (1.0 N) at 0.3 m</li>
                </ul>
              </li>
              <li><strong>Right Side (Clockwise):</strong>
                <ul>
                  <li>Mass 3: 400 g (4.0 N) at unknown distance <strong>d</strong></li>
                </ul>
              </li>
            </ul>
          `,
          render: (svg) => {
            svg.innerHTML = `
              <!-- Left Force 1 -->
              <rect x="150" y="218" width="30" height="20" rx="3" fill="#0f172a" stroke="var(--neon-cyan)" stroke-width="2" />
              <text x="165" y="232" fill="#fff" font-size="10" font-family="Orbitron" text-anchor="middle">300g</text>
              <line x1="165" y1="238" x2="165" y2="280" stroke="var(--neon-cyan)" stroke-width="2" />
              <polygon points="165,285 160,277 170,277" fill="var(--neon-cyan)" />
              <text x="165" y="298" fill="var(--neon-cyan)" font-size="9" font-family="Orbitron" text-anchor="middle">3.0 N</text>

              <!-- Left Force 2 -->
              <rect x="210" y="218" width="30" height="20" rx="3" fill="#0f172a" stroke="var(--neon-cyan)" stroke-width="2" />
              <text x="225" y="232" fill="#fff" font-size="10" font-family="Orbitron" text-anchor="middle">100g</text>
              <line x1="225" y1="238" x2="225" y2="280" stroke="var(--neon-cyan)" stroke-width="2" />
              <polygon points="225,285 220,277 230,277" fill="var(--neon-cyan)" />
              <text x="225" y="298" fill="var(--neon-cyan)" font-size="9" font-family="Orbitron" text-anchor="middle">1.0 N</text>

              <!-- Right Force -->
              <rect x="420" y="218" width="30" height="20" rx="3" fill="#0f172a" stroke="var(--neon-pink)" stroke-width="2" />
              <text x="435" y="232" fill="#fff" font-size="10" font-family="Orbitron" text-anchor="middle">400g</text>
              <line x1="435" y1="238" x2="435" y2="280" stroke="var(--neon-pink)" stroke-width="2" />
              <polygon points="435,285 430,277 440,277" fill="var(--neon-pink)" />
              <text x="435" y="298" fill="var(--neon-pink)" font-size="9" font-family="Orbitron" text-anchor="middle">4.0 N</text>
              
              <!-- Distances -->
              <line x1="165" y1="190" x2="300" y2="190" stroke="var(--neon-cyan)" stroke-width="1.5" stroke-dasharray="2,2" />
              <text x="232" y="182" fill="var(--neon-cyan)" font-size="10" text-anchor="middle">0.5 m</text>

              <line x1="225" y1="165" x2="300" y2="165" stroke="var(--neon-cyan)" stroke-width="1" stroke-dasharray="2,2" />
              <text x="262" y="157" fill="var(--neon-cyan)" font-size="9" text-anchor="middle">0.3 m</text>

              <line x1="300" y1="190" x2="435" y2="190" stroke="var(--neon-pink)" stroke-width="1.5" stroke-dasharray="2,2" />
              <text x="367" y="182" fill="var(--neon-pink)" font-size="10" text-anchor="middle">d</text>
            `;
          }
        },
        {
          title: "Sum the Anticlockwise Moments",
          desc: `
            <p>Compute the sum of moments turning the beam anticlockwise (left of pivot):</p>
            <p style="font-family:var(--font-logo); font-size: 0.9rem;">
              &Sigma;M<sub>anticlockwise</sub> = (F<sub>1</sub> &times; d<sub>1</sub>) + (F<sub>2</sub> &times; d<sub>2</sub>)
            </p>
            <p>Substitute our values:</p>
            <ul>
              <li>Moment 1 = 3.0 N &times; 0.5 m = 1.50 N&middot;m</li>
              <li>Moment 2 = 1.0 N &times; 0.3 m = 0.30 N&middot;m</li>
            </ul>
            <p>Total Anticlockwise Moment = 1.50 + 0.30 = <strong>1.80 N&middot;m</strong></p>
          `,
          render: (svg) => {
            svg.innerHTML = `
              <rect x="150" y="218" width="30" height="20" rx="3" fill="#0f172a" stroke="var(--neon-cyan)" stroke-width="2" opacity="0.6" />
              <rect x="210" y="218" width="30" height="20" rx="3" fill="#0f172a" stroke="var(--neon-cyan)" stroke-width="2" opacity="0.6" />
              
              <!-- Total ACW curve -->
              <path d="M 180 170 A 90 90 0 0 0 290 120" fill="none" stroke="var(--neon-cyan)" stroke-width="4" stroke-dasharray="4,4" filter="url(#neon-glow-cyan)" />
              <text x="180" y="130" fill="var(--neon-cyan)" font-size="12" font-weight="bold" font-family="Orbitron">Total ACW = 1.80 N·m</text>
            `;
          }
        },
        {
          title: "Apply the Principle of Moments",
          desc: `
            <p>For the beam to balance, the clockwise moments must equal the anticlockwise moments:</p>
            <div class="equation-display">
              <span class="highlight-cyan">&Sigma;M<sub>anticlockwise</sub></span> = <span class="highlight-pink">&Sigma;M<sub>clockwise</sub></span>
            </div>
            <p>Equation:</p>
            <p style="text-align:center; font-family:var(--font-logo); font-size:1.1rem;">
              1.80 N&middot;m = 4.0 N &times; d
            </p>
          `,
          render: (svg) => {
            svg.innerHTML = `
              <!-- Left side representation -->
              <text x="200" y="150" fill="var(--neon-cyan)" font-size="12" font-family="Orbitron" font-weight="bold" text-anchor="middle">1.80 N·m</text>
              <line x1="200" y1="160" x2="290" y2="160" stroke="var(--neon-cyan)" stroke-width="2" stroke-dasharray="3,3" />

              <!-- Right side representation -->
              <text x="400" y="150" fill="var(--neon-pink)" font-size="12" font-family="Orbitron" font-weight="bold" text-anchor="middle">4.0 N &times; d</text>
              <line x1="310" y1="160" x2="400" y2="160" stroke="var(--neon-pink)" stroke-width="2" stroke-dasharray="3,3" />
            `;
          }
        },
        {
          title: "Solve for Unknown Distance (d)",
          desc: `
            <p>Rearrange the moment equation to find distance:</p>
            <p style="text-align:center; font-family:var(--font-logo); font-size:1.1rem;">
              d = 1.80 N&middot;m / 4.0 N
            </p>
            <p style="text-align:center; font-family:var(--font-logo); font-size:1.1rem; color:var(--neon-green)">
              d = 0.45 m
            </p>
            <p>The 400 g mass must be placed exactly <strong>0.45 m</strong> (or 45 cm) to the right of the pivot to balance the beam.</p>
          `,
          render: (svg) => {
            svg.innerHTML = `
              <!-- Solved distance display -->
              <rect x="420" y="218" width="30" height="20" rx="3" fill="#0f172a" stroke="var(--neon-green)" stroke-width="2" filter="url(#neon-glow-green)" />
              <text x="435" y="232" fill="#fff" font-size="10" font-family="Orbitron" text-anchor="middle">400g</text>

              <line x1="300" y1="190" x2="435" y2="190" stroke="var(--neon-green)" stroke-width="2" filter="url(#neon-glow-green)" />
              <text x="367" y="182" fill="var(--neon-green)" font-weight="bold" font-size="11" text-anchor="middle">d = 0.45 m</text>
            `;
          }
        },
        {
          title: "State Reaction Force at the Pivot",
          desc: `
            <p>Calculate total weight pressing down on the beam structure:</p>
            <p style="font-family:var(--font-logo);">
              R = W<sub>1</sub> + W<sub>2</sub> + W<sub>3</sub>
            </p>
            <p>R = 3.0 N + 1.0 N + 4.0 N = <strong>8.0 N</strong></p>
            <p>The upward pivot force is <strong>8.0 N</strong>. It acts through the pivot itself, meaning it has zero moment effect.</p>
          `,
          render: (svg) => {
            svg.innerHTML = `
              <!-- Pivot Reaction force R arrow -->
              <line x1="300" y1="210" x2="300" y2="120" stroke="var(--neon-green)" stroke-width="4" filter="url(#neon-glow-green)" />
              <polygon points="300,110 293,120 307,120" fill="var(--neon-green)" />
              <text x="315" y="135" fill="var(--neon-green)" font-family="Orbitron" font-size="16" font-weight="bold" filter="url(#neon-glow-green)">R = 8.0 N</text>
            `;
          }
        }
      ]
    }
  };

  function initWalkthroughSection() {
    currentWalkthroughStep = 0;
    renderWalkthroughStep();
  }

  function renderWalkthroughStep() {
    const data = currentWalkthroughExample === 1 ? walkthroughData.example1 : walkthroughData.example2;
    const step = data.steps[currentWalkthroughStep];

    // Stepper header details
    document.getElementById('walk-step-num').textContent = currentWalkthroughStep + 1;
    document.getElementById('walk-step-total').textContent = data.stepsCount;
    document.getElementById('walk-step-title').textContent = step.title;
    document.getElementById('walk-step-desc').innerHTML = step.desc;

    // Render custom drawing to the SVG panel
    const dynamicGroup = document.getElementById('walk-dynamic-elements');
    step.render(dynamicGroup);

    // Button states
    document.getElementById('walk-prev-btn').disabled = currentWalkthroughStep === 0;
    if (currentWalkthroughStep === data.stepsCount - 1) {
      document.getElementById('walk-next-btn').textContent = "Restart Walkthrough";
    } else {
      document.getElementById('walk-next-btn').textContent = "Next Step";
    }
  }

  document.getElementById('walk-prev-btn').addEventListener('click', () => {
    if (currentWalkthroughStep > 0) {
      currentWalkthroughStep--;
      renderWalkthroughStep();
    }
  });

  document.getElementById('walk-next-btn').addEventListener('click', () => {
    const data = currentWalkthroughExample === 1 ? walkthroughData.example1 : walkthroughData.example2;
    if (currentWalkthroughStep < data.stepsCount - 1) {
      currentWalkthroughStep++;
      renderWalkthroughStep();
    } else {
      currentWalkthroughStep = 0;
      renderWalkthroughStep();
    }
  });

  // Example selectors tabs
  document.getElementById('tab-example1').addEventListener('click', () => {
    document.getElementById('tab-example1').classList.add('active');
    document.getElementById('tab-example2').classList.remove('active');
    currentWalkthroughExample = 1;
    initWalkthroughSection();
  });

  document.getElementById('tab-example2').addEventListener('click', () => {
    document.getElementById('tab-example1').classList.remove('active');
    document.getElementById('tab-example2').classList.add('active');
    currentWalkthroughExample = 2;
    initWalkthroughSection();
  });


  // ==========================================================================
  // SECTION 4: RANDOMIZED QUIZ INTERACTION (30 QUESTIONS)
  // ==========================================================================
  let quizQuestions = [];
  let currentQuizIndex = 0;
  let quizScore = 0;
  let currentQuestion = null;

  function generateQuizPool() {
    quizQuestions = [];

    // Type A: 2 Forces (10 Questions)
    for (let i = 0; i < 10; i++) {
      quizQuestions.push(generateTypeAQuestion());
    }

    // Type B: 3 Forces (10 Questions)
    for (let i = 0; i < 10; i++) {
      quizQuestions.push(generateThreeForceQuestion(false)); // Balanced distribution or mixed
    }

    // Type C: 3 Forces Unequal Distribution (10 Questions)
    for (let i = 0; i < 10; i++) {
      quizQuestions.push(generateThreeForceQuestion(true)); // Specifically unequal (2 on one side, 1 on other)
    }

    // Shuffle the entire 30 question pool to mix difficulty
    shuffleArray(quizQuestions);
  }

  // Helper: Shuffle
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  function generateTypeAQuestion() {
    let m1, d1, m2, d2, unknownType, targetAnswer, questionPrompt, unitLabel;
    const scenarioType = Math.random() < 0.5 ? 'mass' : 'force';

    while (true) {
      m1 = getRandomInt(100, 500, 50);
      d1 = parseFloat(getRandomFloat(0.2, 1.0, 1).toFixed(1));
      unknownType = Math.random() < 0.5 ? 'load' : 'distance'; // 'load' means solving for mass/force

      if (unknownType === 'load') {
        d2 = parseFloat(getRandomFloat(0.2, 1.0, 1).toFixed(1));
        const idealMass = Math.round((m1 * d1) / d2);
        m2 = Math.round(idealMass / 10) * 10;
        if (m2 >= 100 && m2 <= 500) {
          if (scenarioType === 'mass') {
            targetAnswer = m2;
            questionPrompt = "Calculate the unknown mass <strong>m</strong> on the right side. State your answer <strong>in grams (g)</strong>.";
            unitLabel = "g";
          } else {
            targetAnswer = parseFloat(((m2 / 1000) * 10).toFixed(1));
            questionPrompt = "Calculate the unknown force <strong>F</strong> on the right side. State your answer <strong>in Newtons (N)</strong>.";
            unitLabel = "N";
          }
          break;
        }
      } else {
        m2 = getRandomInt(100, 500, 50);
        d2 = parseFloat(((m1 * d1) / m2).toFixed(1));
        if (d2 >= 0.2 && d2 <= 1.0) {
          targetAnswer = d2;
          questionPrompt = "Calculate the distance <strong>d</strong> of the right-hand load from the pivot. State your answer <strong>in meters (m)</strong>.";
          unitLabel = "m";
          break;
        }
      }
    }

    const w1N = (m1 / 1000) * 10;
    const w2N = (m2 / 1000) * 10;
    const reactionR = w1N + w2N;
    const momentLeft = w1N * d1;

    // Build label strings
    const label1 = scenarioType === 'mass' ? `${m1}g` : `${w1N.toFixed(1)}N`;
    let label2 = "";
    if (unknownType === 'load') {
      label2 = scenarioType === 'mass' ? 'm' : 'F';
    } else {
      label2 = scenarioType === 'mass' ? `${m2}g` : `${w2N.toFixed(1)}N`;
    }

    return {
      type: 'A',
      masses: [
        { side: 'left', mass: m1, dist: d1, isUnknown: false, label: label1 },
        { side: 'right', mass: m2, dist: d2, isUnknown: unknownType === 'load', label: label2, distLabel: unknownType === 'distance' ? 'd' : `${d2.toFixed(1)}m` }
      ],
      targetAnswer: targetAnswer,
      unit: unitLabel,
      prompt: questionPrompt,
      explanation: `
        <p><strong>1. Identify the Moments:</strong></p>
        <p>Left side (Anticlockwise): Force = ${w1N.toFixed(1)} N, Distance = ${d1.toFixed(1)} m.<br>
        Moment = ${w1N.toFixed(1)} &times; ${d1.toFixed(1)} = <strong>${momentLeft.toFixed(2)} N&middot;m</strong></p>
        
        <p>Right side (Clockwise): Force = ${unknownType === 'load' ? (scenarioType === 'mass' ? 'W' : 'F') : w2N.toFixed(1) + ' N'}, Distance = ${unknownType === 'distance' ? 'd' : d2.toFixed(1) + ' m'}.</p>
        
        <p><strong>2. Apply Principle of Moments:</strong></p>
        <div class="solution-formula">&Sigma;M<sub>anticlockwise</sub> = &Sigma;M<sub>clockwise</sub></div>
        
        <p>${momentLeft.toFixed(2)} N&middot;m = ${unknownType === 'load' ? (scenarioType === 'mass' ? 'W &times; ' + d2.toFixed(1) : 'F &times; ' + d2.toFixed(1)) : w2N.toFixed(1) + ' &times; d'}</p>
        
        <p><strong>3. Calculate the Unknown:</strong></p>
        ${unknownType === 'load' 
          ? (scenarioType === 'mass' 
             ? `<p>W = ${momentLeft.toFixed(2)} / ${d2.toFixed(1)} = ${(targetAnswer/100).toFixed(2)} N<br>
                Mass = ${(targetAnswer/100).toFixed(2)} N / 10 N/kg = ${(targetAnswer/1000).toFixed(3)} kg = <strong>${targetAnswer} g</strong></p>`
             : `<p>F = ${momentLeft.toFixed(2)} / ${d2.toFixed(1)} = <strong>${targetAnswer.toFixed(1)} N</strong></p>`)
          : `<p>d = ${momentLeft.toFixed(2)} / ${w2N.toFixed(1)} = <strong>${targetAnswer.toFixed(2)} m</strong></p>`
        }
        
        <p><strong>4. State Reaction Force (R):</strong></p>
        <p>Total Downward Force = W<sub>left</sub> + W<sub>right</sub> = ${w1N.toFixed(1)} N + ${w2N.toFixed(1)} N = <strong>${reactionR.toFixed(1)} N</strong></p>
        <p>Thus, reaction force at the pivot <strong>R = ${reactionR.toFixed(1)} N</strong> (directed upwards).</p>
      `
    };
  }

  function generateThreeForceQuestion(forceUnequal) {
    let leftCount = 2;
    let rightCount = 1;
    if (!forceUnequal && Math.random() < 0.5) {
      leftCount = 1;
      rightCount = 2;
    }

    let m1, d1, m2, d2, d2Adjusted, sumMomentsKnown, unknownType, m3, d3, targetAnswer, questionPrompt, unitLabel;
    const scenarioType = Math.random() < 0.5 ? 'mass' : 'force';

    while (true) {
      m1 = getRandomInt(100, 400, 50);
      d1 = parseFloat(getRandomFloat(0.2, 0.8, 1).toFixed(1));
      
      m2 = getRandomInt(100, 300, 50);
      d2 = parseFloat(getRandomFloat(0.2, 0.8, 1).toFixed(1));

      d2Adjusted = d2;
      if (leftCount === 2 && d1 === d2) {
        d2Adjusted = d1 > 0.5 ? d1 - 0.2 : d1 + 0.2;
      }

      if (leftCount === 2) {
        sumMomentsKnown = (m1 * d1) + (m2 * d2Adjusted);
      } else {
        sumMomentsKnown = (m1 * d1);
      }

      unknownType = Math.random() < 0.5 ? 'load' : 'distance';

      if (leftCount === 2) {
        if (unknownType === 'load') {
          d3 = parseFloat(getRandomFloat(0.3, 0.8, 1).toFixed(1));
          const idealM3 = Math.round(sumMomentsKnown / d3);
          m3 = Math.round(idealM3 / 10) * 10;
          if (m3 >= 100 && m3 <= 500) {
            if (scenarioType === 'mass') {
              targetAnswer = m3;
              questionPrompt = "Find the unknown mass <strong>m</strong> on the right side. State your answer <strong>in grams (g)</strong>.";
              unitLabel = "g";
            } else {
              targetAnswer = parseFloat(((m3 / 1000) * 10).toFixed(1));
              questionPrompt = "Find the unknown force <strong>F</strong> on the right side. State your answer <strong>in Newtons (N)</strong>.";
              unitLabel = "N";
            }
            break;
          }
        } else {
          m3 = getRandomInt(150, 400, 50);
          d3 = parseFloat((sumMomentsKnown / m3).toFixed(1));
          if (d3 >= 0.2 && d3 <= 1.0) {
            targetAnswer = d3;
            questionPrompt = "Find the distance <strong>d</strong> of the right-hand load from the pivot. State your answer <strong>in meters (m)</strong>.";
            unitLabel = "m";
            break;
          }
        }
      } else {
        // 1 left, 2 right
        if (unknownType === 'load') {
          const mR1 = getRandomInt(100, 300, 50);
          const dR1 = parseFloat(getRandomFloat(0.2, 0.8, 1).toFixed(1));
          const mR2 = getRandomInt(100, 300, 50);
          const dR2 = parseFloat(getRandomFloat(0.2, 0.8, 1).toFixed(1));
          const sumCW = (mR1 * dR1) + (mR2 * dR2);
          
          d3 = d1;
          m3 = Math.round((sumCW / d3) / 10) * 10;
          if (m3 >= 100 && m3 <= 500) {
            m1 = mR1; d1 = dR1;
            m2 = mR2; d2 = dR2;
            d2Adjusted = dR2;
            if (scenarioType === 'mass') {
              targetAnswer = m3;
              questionPrompt = "Find the unknown mass <strong>m</strong> on the left side. State your answer <strong>in grams (g)</strong>.";
              unitLabel = "g";
            } else {
              targetAnswer = parseFloat(((m3 / 1000) * 10).toFixed(1));
              questionPrompt = "Find the unknown force <strong>F</strong> on the left side. State your answer <strong>in Newtons (N)</strong>.";
              unitLabel = "N";
            }
            break;
          }
        } else {
          const mR1 = getRandomInt(100, 300, 50);
          const dR1 = parseFloat(getRandomFloat(0.2, 0.8, 1).toFixed(1));
          const mR2 = getRandomInt(100, 300, 50);
          const dR2 = parseFloat(getRandomFloat(0.2, 0.8, 1).toFixed(1));
          const sumCW = (mR1 * dR1) + (mR2 * dR2);
          
          m3 = getRandomInt(100, 400, 50);
          d3 = parseFloat((sumCW / m3).toFixed(1));
          if (d3 >= 0.2 && d3 <= 1.0) {
            m1 = mR1; d1 = dR1;
            m2 = mR2; d2 = dR2;
            d2Adjusted = dR2;
            targetAnswer = d3;
            questionPrompt = "Find the distance <strong>d</strong> of the left-hand load from the pivot. State your answer <strong>in meters (m)</strong>.";
            unitLabel = "m";
            break;
          }
        }
      }
    }

    const w1N = (m1 / 1000) * 10;
    const w2N = (m2 / 1000) * 10;
    const w3N = (m3 / 1000) * 10;

    let listMasses = [];
    let calcR = ((m1 + m2 + m3) / 1000) * 10;

    const lbl1 = scenarioType === 'mass' ? `${m1}g` : `${w1N.toFixed(1)}N`;
    const lbl2 = scenarioType === 'mass' ? `${m2}g` : `${w2N.toFixed(1)}N`;
    let lbl3 = "";
    if (unknownType === 'load') {
      lbl3 = scenarioType === 'mass' ? 'm' : 'F';
    } else {
      lbl3 = scenarioType === 'mass' ? `${m3}g` : `${w3N.toFixed(1)}N`;
    }

    if (leftCount === 2) {
      listMasses = [
        { side: 'left', mass: m1, dist: d1, isUnknown: false, label: lbl1, distLabel: `${d1.toFixed(1)}m` },
        { side: 'left', mass: m2, dist: d2Adjusted, isUnknown: false, label: lbl2, distLabel: `${d2Adjusted.toFixed(1)}m` },
        { side: 'right', mass: m3, dist: d3, isUnknown: unknownType === 'load', label: lbl3, distLabel: unknownType === 'distance' ? 'd' : `${d3.toFixed(1)}m` }
      ];
    } else {
      listMasses = [
        { side: 'left', mass: m3, dist: d3, isUnknown: unknownType === 'load', label: lbl3, distLabel: unknownType === 'distance' ? 'd' : `${d3.toFixed(1)}m` },
        { side: 'right', mass: m1, dist: d1, isUnknown: false, label: lbl1, distLabel: `${d1.toFixed(1)}m` },
        { side: 'right', mass: m2, dist: d2, isUnknown: false, label: lbl2, distLabel: `${d2.toFixed(1)}m` }
      ];
    }

    return {
      type: forceUnequal ? 'C' : 'B',
      masses: listMasses,
      targetAnswer: targetAnswer,
      unit: unitLabel,
      prompt: questionPrompt,
      explanation: `
        <p><strong>1. Identify and Sum the Moments on the known side:</strong></p>
        <p>Follow the Principle of Moments to balance anticlockwise and clockwise vectors.</p>
        <div class="solution-formula">&Sigma;M<sub>anticlockwise</sub> = &Sigma;M<sub>clockwise</sub></div>
        
        <p><strong>2. Solve the equation:</strong></p>
        <p>Verify that your calculations equal standard pivot reactions.</p>
        
        <p><strong>3. Pivot Reaction Force (R):</strong></p>
        <p>Total Downward Load = W<sub>1</sub> + W<sub>2</sub> + W<sub>3</sub> = <strong>${calcR.toFixed(1)} N</strong>.<br>
        Reaction force at pivot <strong>R = ${calcR.toFixed(1)} N</strong> upward.</p>
      `
    };
  }

  function getRandomInt(min, max, step) {
    const range = (max - min) / step;
    return min + Math.floor(Math.random() * (range + 1)) * step;
  }

  function getRandomFloat(min, max, decimals) {
    const str = (Math.random() * (max - min) + min).toFixed(decimals);
    return parseFloat(str);
  }

  const startQuizBtn = document.getElementById('start-quiz-btn');
  const quizStartScreen = document.getElementById('quiz-start-screen');
  const quizActiveScreen = document.getElementById('quiz-active-screen');
  const quizResultScreen = document.getElementById('quiz-result-screen');
  const studentInput = document.getElementById('quiz-student-input');
  const submitAnswerBtn = document.getElementById('quiz-submit-btn');
  const continueBtn = document.getElementById('quiz-continue-btn');
  const solutionBox = document.getElementById('quiz-solution-box');
  const questionNumText = document.getElementById('quiz-q-num');
  const currentScoreText = document.getElementById('quiz-current-score');

  startQuizBtn.addEventListener('click', () => {
    quizScore = 0;
    currentQuizIndex = 0;
    generateQuizPool();
    quizStartScreen.classList.remove('active');
    quizResultScreen.classList.remove('active');
    quizActiveScreen.classList.add('active');
    loadQuizQuestion();
  });

  function loadQuizQuestion() {
    currentQuestion = quizQuestions[currentQuizIndex];
    questionNumText.textContent = currentQuizIndex + 1;
    currentScoreText.textContent = `${quizScore}/${currentQuizIndex}`;
    document.getElementById('quiz-question-text').innerHTML = currentQuestion.prompt;
    studentInput.value = '';
    studentInput.disabled = false;
    submitAnswerBtn.style.display = 'block';
    continueBtn.style.display = 'none';
    solutionBox.style.display = 'none';
    drawQuizDiagram(currentQuestion);
  }

  function checkUnitMatch(input, target) {
    const normalizedInput = input.trim().toLowerCase();
    const normalizedTarget = target.trim().toLowerCase();
    if (normalizedTarget === 'g') {
      return ['g', 'grams', 'gram'].includes(normalizedInput);
    }
    if (normalizedTarget === 'm') {
      return ['m', 'meters', 'meter', 'metre', 'metres'].includes(normalizedInput);
    }
    if (normalizedTarget === 'n') {
      return ['n', 'newtons', 'newton'].includes(normalizedInput);
    }
    return normalizedInput === normalizedTarget;
  }

  submitAnswerBtn.addEventListener('click', () => {
    const rawInput = studentInput.value.trim();
    if (!rawInput) {
      alert("Please enter your answer.");
      return;
    }
    studentInput.disabled = true;
    submitAnswerBtn.style.display = 'none';
    continueBtn.style.display = 'block';
    const match = rawInput.match(/^([+-]?\d*(?:\.\d+)?)\s*([a-zA-Z]+)$/);
    let val = NaN;
    let unitVal = "";
    if (match) {
      val = parseFloat(match[1]);
      unitVal = match[2];
    }
    const target = currentQuestion.targetAnswer;
    let isCorrect = false;
    let errorMsg = "Incorrect. ";
    if (isNaN(val) || !unitVal) {
      isCorrect = false;
      errorMsg += "You must include both the numerical value and the unit (e.g., 300g, 4.0N or 0.45m).";
    } else {
      const valueCorrect = Math.abs(val - target) <= (target * 0.02);
      const unitCorrect = checkUnitMatch(unitVal, currentQuestion.unit);
      isCorrect = valueCorrect && unitCorrect;
      if (!isCorrect) {
        if (!valueCorrect && !unitCorrect) {
          errorMsg += "Both value and unit are wrong.";
        } else if (!valueCorrect) {
          errorMsg += "Value is incorrect.";
        } else {
          errorMsg += `Unit is incorrect (Expected: ${currentQuestion.unit}).`;
        }
      }
    }
    const outcomeEl = document.getElementById('solution-outcome');
    const stepsEl = document.getElementById('solution-steps');
    if (isCorrect) {
      quizScore++;
      outcomeEl.textContent = "Correct!";
      outcomeEl.className = "highlight-green";
      solutionBox.className = "quiz-solution-panel correct";
      triggerCelebration();
    } else {
      outcomeEl.textContent = `${errorMsg} (Expected: ${target.toFixed(1)}${currentQuestion.unit})`;
      outcomeEl.className = "highlight-pink";
      solutionBox.className = "quiz-solution-panel incorrect";
    }
    stepsEl.innerHTML = currentQuestion.explanation;
    solutionBox.style.display = 'block';
  });

  function drawQuizDiagram(q) {
    const dynamicGroup = document.getElementById('quiz-dynamic-elements');
    dynamicGroup.innerHTML = '';
    q.masses.forEach(mass => {
      const directionFactor = mass.side === 'left' ? -1 : 1;
      const x = 400 + directionFactor * mass.dist * 300;
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", x);
      line.setAttribute("y1", 202);
      line.setAttribute("x2", x);
      line.setAttribute("y2", 225);
      line.setAttribute("stroke", "#718096");
      line.setAttribute("stroke-width", "2");
      dynamicGroup.appendChild(line);
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", x - 18);
      rect.setAttribute("y", 225);
      rect.setAttribute("width", 36);
      rect.setAttribute("height", 24);
      rect.setAttribute("rx", "3");
      rect.setAttribute("fill", "#0f172a");
      rect.setAttribute("stroke", mass.isUnknown ? "var(--neon-yellow)" : (mass.side === 'left' ? "var(--neon-cyan)" : "var(--neon-pink)"));
      rect.setAttribute("stroke-width", "2");
      rect.setAttribute("filter", mass.isUnknown ? "url(#neon-glow-pink)" : (mass.side === 'left' ? "url(#neon-glow-cyan)" : "url(#neon-glow-pink)"));
      dynamicGroup.appendChild(rect);
      const txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
      txt.setAttribute("x", x);
      txt.setAttribute("y", 241);
      txt.setAttribute("fill", mass.isUnknown ? "var(--neon-yellow)" : "#fff");
      txt.setAttribute("font-family", "Orbitron");
      txt.setAttribute("font-size", "10");
      txt.setAttribute("font-weight", "bold");
      txt.setAttribute("text-anchor", "middle");
      txt.textContent = mass.label;
      dynamicGroup.appendChild(txt);
      const distTxt = document.createElementNS("http://www.w3.org/2000/svg", "text");
      distTxt.setAttribute("x", x);
      distTxt.setAttribute("y", 175);
      distTxt.setAttribute("fill", mass.isUnknown ? "var(--neon-yellow)" : (mass.side === 'left' ? "var(--neon-cyan)" : "var(--neon-pink)"));
      distTxt.setAttribute("font-family", "Plus Jakarta Sans");
      distTxt.setAttribute("font-size", "10");
      distTxt.setAttribute("font-weight", "bold");
      distTxt.setAttribute("text-anchor", "middle");
      distTxt.textContent = mass.distLabel || `${mass.dist.toFixed(1)}m`;
      dynamicGroup.appendChild(distTxt);
      const distLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
      distLine.setAttribute("x1", x);
      distLine.setAttribute("y1", 182);
      distLine.setAttribute("x2", 400);
      distLine.setAttribute("y2", 182);
      distLine.setAttribute("stroke", mass.side === 'left' ? "var(--neon-cyan)" : "var(--neon-pink)");
      distLine.setAttribute("stroke-dasharray", "2,2");
      distLine.setAttribute("stroke-width", "1");
      dynamicGroup.appendChild(distLine);
    });
    q.masses.forEach(mass => {
      const directionFactor = mass.side === 'left' ? -1 : 1;
      const x = 400 + directionFactor * mass.dist * 300;
      const fLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
      fLine.setAttribute("x1", x);
      fLine.setAttribute("y1", 249);
      fLine.setAttribute("x2", x);
      fLine.setAttribute("y2", 275);
      fLine.setAttribute("stroke", mass.side === 'left' ? "var(--neon-cyan)" : "var(--neon-pink)");
      fLine.setAttribute("stroke-width", "2");
      dynamicGroup.appendChild(fLine);
      const arrowhead = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      arrowhead.setAttribute("points", `${x},280 ${x-4},272 ${x+4},272`);
      arrowhead.setAttribute("fill", mass.side === 'left' ? "var(--neon-cyan)" : "var(--neon-pink)");
      dynamicGroup.appendChild(arrowhead);
    });
  }

  continueBtn.addEventListener('click', () => {
    currentQuizIndex++;
    if (currentQuizIndex < 30) {
      loadQuizQuestion();
    } else {
      showQuizResults();
    }
  });

  function showQuizResults() {
    quizActiveScreen.classList.remove('active');
    quizResultScreen.classList.add('active');
    document.getElementById('final-score-val').textContent = quizScore;
    const gradeText = document.getElementById('final-grade-text');
    const resultIcon = document.getElementById('result-icon');
    if (quizScore >= 25) {
      gradeText.textContent = "Excellent — you have mastered the principle of moments!";
      resultIcon.textContent = "🏆";
    } else if (quizScore >= 15) {
      gradeText.textContent = "Good effort — review the worked solutions and try again.";
      resultIcon.textContent = "⭐";
    } else {
      gradeText.textContent = "Keep practising — revisit the beam lab in Section 2.";
      resultIcon.textContent = "📚";
    }
  }

  document.getElementById('restart-quiz-btn').addEventListener('click', () => {
    quizResultScreen.classList.remove('active');
    quizStartScreen.classList.add('active');
  });

  function triggerCelebration() {
    const parent = document.getElementById('section-quiz');
    for (let i = 0; i < 40; i++) {
      const conf = document.createElement('div');
      conf.className = 'confetti';
      conf.style.left = `${Math.random() * 80 + 10}%`;
      conf.style.top = `20%`;
      conf.style.background = i % 2 === 0 ? 'var(--neon-green)' : 'var(--neon-cyan)';
      parent.appendChild(conf);
      setTimeout(() => conf.remove(), 1500);
    }
  }

  const flashcards = [
    { q: "What is the Definition of the Principle of Moments?", a: "For a body in equilibrium, the sum of clockwise moments about any pivot is equal to the sum of anticlockwise moments about the same pivot." },
    { q: "What is the condition for equilibrium using moments?", a: "The resultant moment about any point/pivot must be zero (ΣM clockwise = ΣM anticlockwise)." },
    { q: "What do clockwise and anticlockwise moments mean?", a: "Clockwise moments try to rotate the object in the direction of clock hands (right/down on right). Anticlockwise moments try to rotate it opposite (left/down on left)." },
    { q: "How do you identify which side produces which type of moment?", a: "Imagine only that force acting: if pushing down on the left pivots it counter-clockwise, it's an anticlockwise moment. Pushing down on the right is clockwise." },
    { q: "What is the formula for the moment of a force?", a: "Moment = Force (N) &times; Perpendicular distance from the pivot (m). Unit: Newton-meter (N·m)." },
    { q: "Why does the reaction force at the pivot produce no moment?", a: "Because the force passes directly through the pivot. Its perpendicular distance (d) is 0, so Moment = F &times; 0 = 0." },
    { q: "How do you calculate the reaction force R at the pivot?", a: "Add all downward forces/weights acting on the beam: R = W₁ + W₂ + ... (since upward forces = downward forces in equilibrium)." },
    { q: "How do you set up the moment equation for 3 forces?", a: "Group moments by direction: Sum of all left-side moments (e.g. F₁d₁ + F₂d₂) = Sum of right-side moments (F₃d₃)." },
    { q: "What is a common mistake when summing moments?", a: "Forgetting to include all forces on a side, or multiplying force by total beam length instead of distance from the pivot." },
    { q: "What are the standard SI units of moment and force?", a: "Moment is measured in Newton-meters (N·m) or Newton-centimeters (N·cm). Force is measured in Newtons (N)." }
  ];

  let currentCardIndex = 0;
  let flashcardOrder = Array.from({ length: 10 }, (_, i) => i);

  function initFlashcardsSection() {
    currentCardIndex = 0;
    renderFlashcard();
  }

  function renderFlashcard() {
    const flipContainer = document.getElementById('flashcard-flip-container');
    flipContainer.classList.remove('flipped');
    const card = flashcards[flashcardOrder[currentCardIndex]];
    document.getElementById('card-index-val').textContent = currentCardIndex + 1;
    document.getElementById('card-question-text').innerHTML = card.q;
    document.getElementById('card-answer-text').innerHTML = card.a;
  }

  document.getElementById('flashcard-flip-container').addEventListener('click', () => {
    document.getElementById('flashcard-flip-container').classList.toggle('flipped');
  });

  document.getElementById('card-prev-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentCardIndex > 0) {
      currentCardIndex--;
      renderFlashcard();
    }
  });

  document.getElementById('card-next-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentCardIndex < flashcards.length - 1) {
      currentCardIndex++;
      renderFlashcard();
    }
  });

  document.getElementById('flashcard-shuffle-btn').addEventListener('click', () => {
    shuffleArray(flashcardOrder);
    currentCardIndex = 0;
    renderFlashcard();
  });

});
