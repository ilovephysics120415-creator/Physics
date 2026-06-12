document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  /* ==========================================================================
     1. NAVIGATION SYSTEM
     ========================================================================== */
  const navButtons = document.querySelectorAll('.nav-btn');
  const sections = document.querySelectorAll('.app-section');

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const sectionId = btn.getAttribute('data-section');
      
      // Update active nav button
      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update active section
      sections.forEach(sec => {
        sec.classList.remove('active');
        if (sec.id === sectionId) {
          sec.classList.add('active');
        }
      });

      // Special action on Section 1 load
      if (sectionId === 'section1') {
        playConceptIntroAnimation();
      }
    });
  });

  /* ==========================================================================
     2. SECTION 1 — CONCEPT INTRODUCTION ANIMATION
     ========================================================================== */
  const replayBtn = document.getElementById('btn-replay-intro');
  
  function playConceptIntroAnimation() {
    const structure = document.getElementById('concept-lever-structure');
    const fGroup = document.getElementById('concept-f-group');
    const dGroup = document.getElementById('concept-d-group');

    if (!structure || !fGroup || !dGroup) return;

    // Reset styles for animation
    structure.style.transform = 'rotate(0deg)';
    structure.style.transformOrigin = '300px 195px';
    fGroup.style.opacity = '0';
    fGroup.style.transform = 'translateY(-20px)';
    dGroup.style.opacity = '0';
    
    // Animation Timeline
    setTimeout(() => {
      // 1. Show distance
      dGroup.style.transition = 'opacity 0.8s ease';
      dGroup.style.opacity = '1';
    }, 400);

    setTimeout(() => {
      // 2. Fade in force arrow
      fGroup.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      fGroup.style.opacity = '1';
      fGroup.style.transform = 'translateY(0)';
    }, 1200);

    setTimeout(() => {
      // 3. Make lever structure spin one full round about pivot
      structure.style.transition = 'transform 2.2s cubic-bezier(0.4, 0, 0.2, 1)';
      structure.style.transform = 'rotate(360deg)';
    }, 2200);
  }

  // Initial trigger
  playConceptIntroAnimation();

  if (replayBtn) {
    replayBtn.addEventListener('click', () => {
      // Reset rotation styles immediately then replay
      const structure = document.getElementById('concept-lever-structure');
      if (structure) {
        structure.style.transition = 'none';
        structure.style.transform = 'rotate(0deg)';
      }
      setTimeout(playConceptIntroAnimation, 50);
    });
  }

  /* ==========================================================================
     3. SECTION 2 — EVERYDAY EXAMPLES EXPLORER
     ========================================================================== */
  const exampleCards = document.querySelectorAll('.example-card');
  const detailPanel = document.getElementById('example-detail');
  const closeDetailBtn = document.getElementById('close-detail-btn');
  const detailTitle = document.getElementById('detail-title');
  const detailDesc = document.getElementById('detail-desc');
  const detailSvg = document.getElementById('detail-svg');
  const sliderLabel = document.getElementById('slider-label');
  const exampleSlider = document.getElementById('example-param-slider');
  const sliderValueBadge = document.getElementById('example-slider-value');
  const sliderHint = document.getElementById('example-slider-hint');
  const detailSummary = document.getElementById('detail-summary');

  let activeExample = 'spanner';

  const examplesData = {
    spanner: {
      title: 'Spanner tightening a nut',
      desc: 'The pivot is located at the center of the nut. Applying force at the handle creates a turning effect (moment) to rotate the nut.',
      sliderText: 'Adjust Spanner Handle Length (d):',
      hintText: 'A longer spanner increases the perpendicular distance (d), creating a larger turning effect with the exact same effort!',
      unit: 'x'
    },
    door: {
      title: 'Door being pushed open',
      desc: 'The hinges act as the pivot. By pushing on the handle at the far edge, you maximize the perpendicular distance (d) to turn the door easily.',
      sliderText: 'Position of Push on Door (d):',
      hintText: 'If you push closer to the hinge (small d), you need a much greater force (F) to open the door because the moment is smaller.',
      unit: 'x'
    },
    scissors: {
      title: 'Scissors cutting paper',
      desc: 'The screw in the center is the pivot. Squeezing the loops generates two moments in opposite directions to shear the paper.',
      sliderText: 'Adjust cutting force effort (F):',
      hintText: 'Increasing your hand squeeze force (F) creates a larger turning effect, allowing you to cut through thicker materials.',
      unit: 'x'
    },
    wheelbarrow: {
      title: 'Wheelbarrow being lifted',
      desc: 'The wheel axle acts as the pivot. Lifting the handles creates an upward turning moment that rotates the frame to raise the load.',
      sliderText: 'Adjust Length of Handles (d):',
      hintText: 'Longer handles increase the perpendicular distance (d) from the wheel pivot, making the heavy load much easier to lift.',
      unit: 'x'
    }
  };

  function selectExample(exampleKey) {
    activeExample = exampleKey;
    exampleCards.forEach(c => {
      c.classList.remove('selected');
      if (c.getAttribute('data-example') === exampleKey) {
        c.classList.add('selected');
      }
    });

    const data = examplesData[exampleKey];
    detailTitle.textContent = data.title;
    detailDesc.textContent = data.desc;
    sliderLabel.textContent = data.sliderText;
    sliderHint.textContent = data.hintText;
    exampleSlider.value = 1;
    sliderValueBadge.textContent = '1.0' + data.unit;

    detailPanel.classList.remove('hidden');
    drawExampleGraphics();
  }

  function drawExampleGraphics() {
    const factor = parseFloat(exampleSlider.value);
    sliderValueBadge.textContent = factor.toFixed(1) + examplesData[activeExample].unit;

    // Reset SVG
    detailSvg.innerHTML = '';

    // Create marker defs
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <marker id="det-arrow-green" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--neon-green)" />
      </marker>
      <marker id="det-arrow-yellow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--neon-yellow)" />
      </marker>
    `;
    detailSvg.appendChild(defs);

    let momentVal = 20 * factor;
    detailSummary.innerHTML = `With scale multiplier at <strong>${factor.toFixed(1)}</strong>, the Moment increases from 20 N m to <strong>${momentVal.toFixed(1)} N m</strong>!`;

    if (activeExample === 'spanner') {
      const length = 120 * factor;
      detailSvg.innerHTML += `
        <!-- Nut (Pivot) -->
        <circle cx="80" cy="120" r="18" fill="none" stroke="#6b7280" stroke-width="6" />
        <polygon points="80,102 96,111 96,129 80,138 64,129 64,111" fill="var(--neon-pink)" />
        <circle cx="80" cy="120" r="5" fill="#fff" />
        <text x="80" y="160" text-anchor="middle" fill="var(--neon-pink)" class="label-text-small">Pivot (Nut)</text>
        
        <!-- Spanner handle -->
        <rect x="94" y="112" width="${length}" height="16" rx="4" fill="#4b5563" />
        <circle cx="${94 + length}" cy="120" r="14" fill="#4b5563" />
        
        <!-- Distance Label (d) -->
        <line x1="80" y1="120" x2="${80 + length}" y2="120" stroke="var(--neon-blue)" stroke-width="2" stroke-dasharray="3,3" />
        <text x="${80 + length/2}" y="110" text-anchor="middle" fill="var(--neon-blue)" class="math-label-small">d = ${factor.toFixed(1)} m</text>
        
        <!-- Force Arrow (F) -->
        <line x1="${80 + length}" y1="50" x2="${80 + length}" y2="106" stroke="var(--neon-green)" stroke-width="4" marker-end="url(#det-arrow-green)" />
        <text x="${100 + length}" y="75" fill="var(--neon-green)" class="math-label-small">Force (F)</text>
      `;
    } else if (activeExample === 'door') {
      const width = 100 * factor;
      detailSvg.innerHTML += `
        <!-- Hinge (Pivot) -->
        <rect x="50" y="110" width="8" height="20" fill="var(--neon-pink)" />
        <circle cx="54" cy="120" r="4" fill="#fff" />
        <text x="54" y="160" text-anchor="middle" fill="var(--neon-pink)" class="label-text-small">Pivot (Hinges)</text>

        <!-- Door (Top View) -->
        <line x1="54" y1="120" x2="${54 + width}" y2="120" stroke="#4b5563" stroke-width="12" stroke-linecap="round" />
        <circle cx="${54 + width - 10}" cy="120" r="3" fill="#fff" /> <!-- Handle -->

        <!-- Distance Label (d) -->
        <line x1="54" y1="95" x2="${54 + width}" y2="95" stroke="var(--neon-blue)" stroke-width="2" stroke-dasharray="3,3" />
        <text x="${54 + width/2}" y="85" text-anchor="middle" fill="var(--neon-blue)" class="math-label-small">d = ${factor.toFixed(1)} m</text>

        <!-- Force (Push) -->
        <line x1="${54 + width}" y1="170" x2="${54 + width}" y2="130" stroke="var(--neon-green)" stroke-width="4" marker-end="url(#det-arrow-green)" />
        <text x="${54 + width + 10}" y="160" fill="var(--neon-green)" class="math-label-small">Push (F)</text>
      `;
    } else if (activeExample === 'scissors') {
      const fVal = 20 * factor;
      const arrowLen = 20 * factor;
      detailSvg.innerHTML += `
        <!-- Screw / Pivot -->
        <circle cx="200" cy="120" r="10" fill="var(--neon-pink)" />
        <circle cx="200" cy="120" r="3" fill="#fff" />
        <text x="200" y="150" text-anchor="middle" fill="var(--neon-pink)" class="label-text-small">Pivot (Screw)</text>

        <!-- Blades & Handles -->
        <path d="M 120 100 L 190 115 L 200 120 L 250 140 C 270 148, 290 140, 290 120" fill="none" stroke="#4b5563" stroke-width="8" />
        <path d="M 120 140 L 190 125 L 200 120 L 250 100 C 270 92, 290 100, 290 120" fill="none" stroke="#6b7280" stroke-width="8" />

        <!-- Force Vectors on Handles -->
        <line x1="280" y1="60" x2="280" y2="${100 - arrowLen}" stroke="var(--neon-green)" stroke-width="4" marker-end="url(#det-arrow-green)" />
        <line x1="280" y1="180" x2="280" y2="${140 + arrowLen}" stroke="var(--neon-green)" stroke-width="4" marker-end="url(#det-arrow-green)" />
        <text x="310" y="70" fill="var(--neon-green)" class="math-label-small">F = ${fVal.toFixed(0)} N</text>

        <!-- Cut action arrow -->
        <path d="M 130 90 A 40 40 0 0 1 130 150" fill="none" stroke="var(--neon-yellow)" stroke-width="2" stroke-dasharray="3,3" marker-end="url(#det-arrow-yellow)" />
        <text x="90" y="125" fill="var(--neon-yellow)" class="label-text-small">Slicing Effect</text>
      `;
    } else if (activeExample === 'wheelbarrow') {
      const length = 120 * factor;
      detailSvg.innerHTML += `
        <!-- Wheel / Pivot -->
        <circle cx="100" cy="160" r="24" fill="#374151" stroke="#4b5563" stroke-width="4" />
        <circle cx="100" cy="160" r="6" fill="var(--neon-pink)" />
        <text x="100" y="200" text-anchor="middle" fill="var(--neon-pink)" class="label-text-small">Pivot (Wheel Axle)</text>

        <!-- Wheelbarrow frame and handle -->
        <line x1="100" y1="160" x2="${100 + length}" y2="110" stroke="#6b7280" stroke-width="8" stroke-linecap="round" />
        <!-- Bucket -->
        <polygon points="120,150 180,150 200,100 130,100" fill="#4b5563" stroke="#fff" stroke-width="2" />
        
        <!-- Distance Line -->
        <line x1="100" y1="80" x2="${100 + length}" y2="80" stroke="var(--neon-blue)" stroke-width="2" stroke-dasharray="3,3" />
        <text x="${100 + length/2}" y="70" text-anchor="middle" fill="var(--neon-blue)" class="math-label-small">d = ${factor.toFixed(1)} m</text>

        <!-- Lift Force -->
        <line x1="${100 + length}" y1="160" x2="${100 + length}" y2="120" stroke="var(--neon-green)" stroke-width="4" marker-end="url(#det-arrow-green)" />
        <text x="${100 + length}" y="180" text-anchor="middle" fill="var(--neon-green)" class="math-label-small">Lift Force (F)</text>
      `;
    }
  }

  exampleCards.forEach(card => {
    card.addEventListener('click', () => {
      selectExample(card.getAttribute('data-example'));
    });
  });

  if (closeDetailBtn) {
    closeDetailBtn.addEventListener('click', () => {
      detailPanel.classList.add('hidden');
      exampleCards.forEach(c => c.classList.remove('selected'));
    });
  }

  if (exampleSlider) {
    exampleSlider.addEventListener('input', drawExampleGraphics);
  }

  // Pre-load the first one
  selectExample('spanner');

  /* ==========================================================================
     4. SECTION 3 — INTERACTIVE LEVER SIMULATOR
     ========================================================================== */
  const simFVal = document.getElementById('sim-f-val');
  const simDVal = document.getElementById('sim-d-val');
  const simMVal = document.getElementById('sim-m-val');
  const simEqMath = document.getElementById('sim-eq-math');
  const rangeF = document.getElementById('range-f');
  const rangeFVal = document.getElementById('range-f-val');

  // SVG Elements for simulator
  const simForceLine = document.getElementById('sim-force-line');
  const dragAnchorV = document.getElementById('drag-anchor-v');
  const dragAnchorH = document.getElementById('drag-anchor-h');
  const forceArrowGroup = document.getElementById('sim-force-arrow-group');
  const simForceLabel = document.getElementById('sim-f-label');
  const simDistanceLabel = document.getElementById('sim-d-label');
  const simDistLineGroup = document.getElementById('sim-dist-line-group');
  const simPivotGroup = document.getElementById('sim-pivot-group');

  let simulatorState = {
    force: 25,          // 1 to 50 N
    direction: 1,       // 1 for Downward, -1 for Upward
    forceX: 410,        // absolute coordinate (80 to 520 px)
    pivotX: 300,        // absolute coordinate (80 to 520 px)
    isDraggingForceH: false,
    isDraggingForceV: false,
    isDraggingPivot: false
  };

  function updateSimulatorUI() {
    const force = simulatorState.force;
    const direction = simulatorState.direction;
    const forceX = simulatorState.forceX;
    const pivotX = simulatorState.pivotX;

    // Map pixels (80 to 520) to meters (0.0 to 2.0)
    const forceMeters = (forceX - 80) / 220;
    const pivotMeters = (pivotX - 80) / 220;
    const distance = Math.abs(forceMeters - pivotMeters);
    const moment = force * distance;

    // Determine turning direction
    let turningDirection = 'Balanced';
    if (Math.abs(forceX - pivotX) > 1) {
      if (forceX > pivotX) {
        turningDirection = (direction === 1) ? 'Clockwise' : 'Anticlockwise';
      } else {
        turningDirection = (direction === 1) ? 'Anticlockwise' : 'Clockwise';
      }
    }

    // 1. Update text displays
    const dirString = direction === 1 ? 'Down' : 'Up';
    simFVal.textContent = `${force} N (${dirString})`;
    simDVal.textContent = `${distance.toFixed(2)} m`;

    let momentDirSuffix = '';
    if (turningDirection === 'Clockwise') momentDirSuffix = ' (CW)';
    else if (turningDirection === 'Anticlockwise') momentDirSuffix = ' (ACW)';
    else momentDirSuffix = ' (Balanced)';

    simMVal.textContent = `${moment.toFixed(1)} N m${momentDirSuffix}`;

    const turnColorClass = turningDirection === 'Clockwise' ? 'neon-yellow-text' : (turningDirection === 'Anticlockwise' ? 'neon-pink-text' : '');
    simEqMath.innerHTML = `Moment = ${force} N &times; ${distance.toFixed(2)} m = <span class="${turnColorClass}">${moment.toFixed(1)} N m (${turningDirection})</span>`;

    // Update form controls
    rangeF.value = force;
    rangeFVal.textContent = `${force} N`;

    const rangeForcePos = document.getElementById('range-force-pos');
    const rangePivotPos = document.getElementById('range-pivot-pos');
    const rangeForcePosVal = document.getElementById('range-force-pos-val');
    const rangePivotPosVal = document.getElementById('range-pivot-pos-val');

    if (rangeForcePos) {
      rangeForcePos.value = forceMeters.toFixed(1);
      rangeForcePosVal.textContent = `${forceMeters.toFixed(1)} m`;
    }
    if (rangePivotPos) {
      rangePivotPos.value = pivotMeters.toFixed(1);
      rangePivotPosVal.textContent = `${pivotMeters.toFixed(1)} m`;
    }

    const btnDirDown = document.getElementById('btn-dir-down');
    const btnDirUp = document.getElementById('btn-dir-up');
    if (btnDirDown && btnDirUp) {
      if (direction === 1) {
        btnDirDown.classList.add('active');
        btnDirUp.classList.remove('active');
      } else {
        btnDirDown.classList.remove('active');
        btnDirUp.classList.add('active');
      }
    }

    // 2. SVG Updates
    // Update Pivot Position
    const pivotPolygon = document.getElementById('sim-pivot-polygon');
    const pivotCircle = document.getElementById('sim-pivot-circle');
    const pivotText = document.getElementById('sim-pivot-text');

    if (pivotPolygon) pivotPolygon.setAttribute('points', `${pivotX},200 ${pivotX - 20},240 ${pivotX + 20},240`);
    if (pivotCircle) pivotCircle.setAttribute('cx', pivotX);
    if (pivotText) pivotText.setAttribute('x', pivotX);

    // Update Force Arrow Position and Height
    const arrowLength = 40 + (force * 1.6);
    let arrowStartY, arrowEndY;

    if (direction === 1) {
      // Downwards: points down towards Y=190
      arrowStartY = 190 - arrowLength;
      arrowEndY = 190;
      simForceLine.setAttribute('x1', forceX);
      simForceLine.setAttribute('y1', arrowStartY);
      simForceLine.setAttribute('x2', forceX);
      simForceLine.setAttribute('y2', arrowEndY);
      
      dragAnchorV.setAttribute('cx', forceX);
      dragAnchorV.setAttribute('cy', arrowStartY);
    } else {
      // Upwards: points up away from Y=190
      arrowStartY = 190;
      arrowEndY = 190 - arrowLength;
      simForceLine.setAttribute('x1', forceX);
      simForceLine.setAttribute('y1', arrowStartY);
      simForceLine.setAttribute('x2', forceX);
      simForceLine.setAttribute('y2', arrowEndY);

      dragAnchorV.setAttribute('cx', forceX);
      dragAnchorV.setAttribute('cy', arrowEndY);
    }

    dragAnchorH.setAttribute('cx', forceX);
    dragAnchorH.setAttribute('cy', 190);

    simForceLabel.setAttribute('x', forceX);
    simForceLabel.setAttribute('y', 190 - arrowLength - 15);
    simForceLabel.textContent = `${force} N`;

    // Distance guideline
    const guideLine = simDistLineGroup.querySelector('line');
    const guidePaths = simDistLineGroup.querySelectorAll('path');

    guideLine.setAttribute('x1', pivotX);
    guideLine.setAttribute('x2', forceX);
    if (guidePaths.length > 1) {
      guidePaths[0].setAttribute('d', `M${pivotX},165 L${pivotX},175`);
      guidePaths[1].setAttribute('d', `M${forceX},165 L${forceX},175`);
    } else if (guidePaths.length > 0) {
      guidePaths[0].setAttribute('d', `M${pivotX},165 L${pivotX},175 M${forceX},165 L${forceX},175`);
    }

    simDistanceLabel.setAttribute('x', pivotX + (forceX - pivotX) / 2);
    simDistanceLabel.textContent = `${distance.toFixed(2)} m`;

    // Turning Direction Arc indicator
    const turnArc = document.getElementById('sim-turn-arc');
    if (turnArc) {
      if (turningDirection === 'Balanced') {
        turnArc.style.display = 'none';
      } else {
        turnArc.style.display = 'block';
        if (turningDirection === 'Clockwise') {
          turnArc.setAttribute('d', `M ${pivotX - 30},180 A 30,30 0 0,1 ${pivotX + 30},180`);
          turnArc.setAttribute('stroke', 'var(--neon-yellow)');
        } else {
          turnArc.setAttribute('d', `M ${pivotX + 30},180 A 30,30 0 0,0 ${pivotX - 30},180`);
          turnArc.setAttribute('stroke', 'var(--neon-pink)');
        }
      }
    }
  }

  // Hook input controls
  rangeF.addEventListener('input', (e) => {
    simulatorState.force = parseInt(e.target.value);
    updateSimulatorUI();
  });

  const btnDirDown = document.getElementById('btn-dir-down');
  const btnDirUp = document.getElementById('btn-dir-up');
  const rangeForcePos = document.getElementById('range-force-pos');
  const rangePivotPos = document.getElementById('range-pivot-pos');

  if (btnDirDown) {
    btnDirDown.addEventListener('click', () => {
      simulatorState.direction = 1;
      updateSimulatorUI();
    });
  }
  if (btnDirUp) {
    btnDirUp.addEventListener('click', () => {
      simulatorState.direction = -1;
      updateSimulatorUI();
    });
  }
  if (rangeForcePos) {
    rangeForcePos.addEventListener('input', (e) => {
      const meters = parseFloat(e.target.value);
      simulatorState.forceX = meters * 220 + 80;
      updateSimulatorUI();
    });
  }
  if (rangePivotPos) {
    rangePivotPos.addEventListener('input', (e) => {
      const meters = parseFloat(e.target.value);
      simulatorState.pivotX = meters * 220 + 80;
      updateSimulatorUI();
    });
  }

  // SVG Drag & Drop Implementation
  const svg = document.getElementById('simulator-svg');
  
  function getSVGMouseCoords(evt) {
    const rect = svg.getBoundingClientRect();
    const x = ((evt.clientX - rect.left) / rect.width) * 600;
    const y = ((evt.clientY - rect.top) / rect.height) * 300;
    return { x, y };
  }

  function getSVGTouchCoords(evt) {
    if (!evt.touches || evt.touches.length === 0) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const x = ((evt.touches[0].clientX - rect.left) / rect.width) * 600;
    const y = ((evt.touches[0].clientY - rect.top) / rect.height) * 300;
    return { x, y };
  }

  // Mouse Down triggers
  simPivotGroup.addEventListener('mousedown', (e) => {
    simulatorState.isDraggingPivot = true;
    simPivotGroup.style.cursor = 'grabbing';
    e.preventDefault();
  });

  dragAnchorH.addEventListener('mousedown', (e) => {
    simulatorState.isDraggingForceH = true;
    forceArrowGroup.style.cursor = 'grabbing';
    e.preventDefault();
  });

  dragAnchorV.addEventListener('mousedown', (e) => {
    simulatorState.isDraggingForceV = true;
    forceArrowGroup.style.cursor = 'grabbing';
    e.preventDefault();
  });

  // Touch Starts
  simPivotGroup.addEventListener('touchstart', (e) => {
    simulatorState.isDraggingPivot = true;
    e.preventDefault();
  });

  dragAnchorH.addEventListener('touchstart', (e) => {
    simulatorState.isDraggingForceH = true;
    e.preventDefault();
  });

  dragAnchorV.addEventListener('touchstart', (e) => {
    simulatorState.isDraggingForceV = true;
    e.preventDefault();
  });

  // Global move handlers
  window.addEventListener('mousemove', (e) => {
    if (!simulatorState.isDraggingForceV && !simulatorState.isDraggingForceH && !simulatorState.isDraggingPivot) return;
    const coords = getSVGMouseCoords(e);
    handleDragMove(coords);
  });

  window.addEventListener('touchmove', (e) => {
    if (!simulatorState.isDraggingForceV && !simulatorState.isDraggingForceH && !simulatorState.isDraggingPivot) return;
    const coords = getSVGTouchCoords(e);
    handleDragMove(coords);
  });

  // Drag logic
  function handleDragMove(coords) {
    if (simulatorState.isDraggingPivot) {
      let targetX = coords.x;
      if (targetX < 124) targetX = 124; // 0.2 m
      if (targetX > 476) targetX = 476; // 1.8 m
      let meters = (targetX - 80) / 220;
      meters = Math.round(meters * 10) / 10;
      simulatorState.pivotX = meters * 220 + 80;
    }

    if (simulatorState.isDraggingForceH) {
      let targetX = coords.x;
      if (targetX < 124) targetX = 124; // 0.2 m
      if (targetX > 476) targetX = 476; // 1.8 m
      let meters = (targetX - 80) / 220;
      meters = Math.round(meters * 10) / 10;
      simulatorState.forceX = meters * 220 + 80;
    }

    if (simulatorState.isDraggingForceV) {
      // Drag handle vertically to change magnitude and direction dynamically
      const diffY = 190 - coords.y;
      const direction = diffY >= 0 ? 1 : -1;
      
      let magnitude = Math.abs(diffY);
      let fVal = Math.round((magnitude - 40) / 1.6);
      if (fVal < 1) fVal = 1;
      if (fVal > 50) fVal = 50;

      simulatorState.force = fVal;
      simulatorState.direction = direction;
    }

    updateSimulatorUI();
  }

  // Release drags
  const releaseDrag = () => {
    simulatorState.isDraggingForceV = false;
    simulatorState.isDraggingForceH = false;
    simulatorState.isDraggingPivot = false;
    forceArrowGroup.style.cursor = 'grab';
    simPivotGroup.style.cursor = 'grab';
  };

  window.addEventListener('mouseup', releaseDrag);
  window.addEventListener('touchend', releaseDrag);

  // Initial draw
  updateSimulatorUI();

  /* ==========================================================================
     5. SECTION 4 — QUIZ SYSTEM
     ========================================================================== */
  let quizQuestions = [];
  let currentQuestionIndex = 0;
  let quizScore = 0;
  let activeQuestion = null;

  const startQuizBtn = document.getElementById('start-quiz-btn');
  const quizStartView = document.getElementById('quiz-start-view');
  const quizPlayView = document.getElementById('quiz-play-view');
  const quizEndView = document.getElementById('quiz-end-view');
  const restartQuizBtn = document.getElementById('restart-quiz-btn');

  const qCurrent = document.getElementById('q-current');
  const qScore = document.getElementById('q-score');
  const qProgressFill = document.getElementById('quiz-progress-fill');
  const qPrompt = document.getElementById('question-prompt');
  
  const ftTopVal = document.getElementById('ft-top-val');
  const ftLeftVal = document.getElementById('ft-left-val');
  const ftRightVal = document.getElementById('ft-right-val');

  const studentAnswerInput = document.getElementById('student-answer');
  const quizForm = document.getElementById('quiz-submit-form');
  const addonUnit = document.getElementById('addon-unit');
  const feedbackPanel = document.getElementById('quiz-feedback');
  const feedbackStatusText = document.getElementById('feedback-status-text');
  const workedSolutionText = document.getElementById('worked-solution-text');
  const btnNextQuestion = document.getElementById('btn-next-question');

  // Generator helper function
  function generateQuizPool() {
    const pool = [];
    // Generate exactly 30 randomized questions, 10 of each type (A, B, C)
    
    // Type A: Given F and d, find Moment.
    for (let i = 0; i < 10; i++) {
      const f = Math.floor(Math.random() * 50) + 1; // 1 to 50
      const d = parseFloat((Math.random() * 1.9 + 0.1).toFixed(1)); // 0.1 to 2.0
      const moment = f * d;
      pool.push({
        type: 'A',
        f: f,
        d: d,
        ans: moment,
        unit: 'N m'
      });
    }

    // Type B: Given Moment and d, find F.
    for (let i = 0; i < 10; i++) {
      const d = parseFloat((Math.random() * 1.9 + 0.1).toFixed(1)); // 0.1 to 2.0
      // F should work out to integer or exactly 1 decimal place.
      // Let's randomize F (either integer or .5 values) and back-calculate Moment to keep clean.
      const fType = Math.random() > 0.5 ? 1 : 2;
      const f = fType === 1 ? Math.floor(Math.random() * 49) + 1 : Math.floor(Math.random() * 49) + 1.5;
      const moment = Math.round(f * d); // Round to avoid float errors
      const exactF = Math.round((moment / d) * 10) / 10; // F as answer

      pool.push({
        type: 'B',
        d: d,
        moment: moment,
        ans: exactF,
        unit: 'N'
      });
    }

    // Type C: Given Moment and F, find d.
    for (let i = 0; i < 10; i++) {
      const f = Math.floor(Math.random() * 50) + 1; // 1 to 50
      // We want d to resolve nicely to 1 decimal place.
      const d = parseFloat((Math.random() * 1.9 + 0.1).toFixed(1)); // 0.1 to 2.0
      const moment = Math.round(f * d);
      const exactD = Math.round((moment / f) * 10) / 10; // Target d

      pool.push({
        type: 'C',
        f: f,
        moment: moment,
        ans: exactD,
        unit: 'm'
      });
    }

    // Shuffle pool
    return pool.sort(() => Math.random() - 0.5);
  }

  function startQuiz() {
    quizQuestions = generateQuizPool();
    currentQuestionIndex = 0;
    quizScore = 0;
    
    quizStartView.classList.add('hidden');
    quizEndView.classList.add('hidden');
    quizPlayView.classList.remove('hidden');

    loadQuestion();
  }

  function loadQuestion() {
    activeQuestion = quizQuestions[currentQuestionIndex];
    studentAnswerInput.value = '';
    studentAnswerInput.disabled = false;
    feedbackPanel.classList.add('hidden');
    quizForm.querySelector('button[type="submit"]').classList.remove('hidden');

    // Update UI numbers
    qCurrent.textContent = currentQuestionIndex + 1;
    qScore.textContent = quizScore;
    qProgressFill.style.width = `${((currentQuestionIndex + 1) / 30) * 100}%`;

    // Render questions nicely & set helper placeholders
    if (activeQuestion.type === 'A') {
      qPrompt.innerHTML = `A force of <span class="neon-green-text">${activeQuestion.f} N</span> is applied perpendicular to a beam at a distance of <span class="neon-blue-text">${activeQuestion.d} m</span> from the pivot. <br><br>Calculate the <strong>Moment of the Force</strong>.`;
      studentAnswerInput.placeholder = "e.g. 25 N m";

      ftTopVal.textContent = '?';
      ftTopVal.className = 'ft-top neon-yellow-text';
      ftLeftVal.textContent = `${activeQuestion.f} N`;
      ftLeftVal.className = 'ft-b-left neon-green-text';
      ftRightVal.textContent = `${activeQuestion.d} m`;
      ftRightVal.className = 'ft-b-right neon-blue-text';
    } 
    else if (activeQuestion.type === 'B') {
      qPrompt.innerHTML = `A force acting <span class="neon-blue-text">${activeQuestion.d} m</span> from a pivot produces a turning moment of <span class="neon-yellow-text">${activeQuestion.moment} N m</span>. <br><br>Find the magnitude of the applied <strong>Force</strong>.`;
      studentAnswerInput.placeholder = "e.g. 15 N";

      ftTopVal.textContent = `${activeQuestion.moment} N m`;
      ftTopVal.className = 'ft-top neon-yellow-text';
      ftLeftVal.textContent = '?';
      ftLeftVal.className = 'ft-b-left neon-green-text';
      ftRightVal.textContent = `${activeQuestion.d} m`;
      ftRightVal.className = 'ft-b-right neon-blue-text';
    } 
    else if (activeQuestion.type === 'C') {
      qPrompt.innerHTML = `A force of <span class="neon-green-text">${activeQuestion.f} N</span> produces a turning moment of <span class="neon-yellow-text">${activeQuestion.moment} N m</span> about a pivot. <br><br>Find the <strong>Perpendicular Distance (d)</strong> of the force from the pivot.`;
      studentAnswerInput.placeholder = "e.g. 1.5 m";

      ftTopVal.textContent = `${activeQuestion.moment} N m`;
      ftTopVal.className = 'ft-top neon-yellow-text';
      ftLeftVal.textContent = `${activeQuestion.f} N`;
      ftLeftVal.className = 'ft-b-left neon-green-text';
      ftRightVal.textContent = '?';
      ftRightVal.className = 'ft-b-right neon-blue-text';
    }

    studentAnswerInput.focus();
  }

  function checkAnswer(e) {
    e.preventDefault();
    const userInput = studentAnswerInput.value.trim();
    if (!userInput) return;

    studentAnswerInput.disabled = true;
    quizForm.querySelector('button[type="submit"]').classList.add('hidden');

    const expectedVal = activeQuestion.ans;
    const expectedUnit = activeQuestion.unit;

    // Extract number and text unit
    const match = userInput.match(/^([+-]?\d+(?:\.\d+)?)\s*(.+)$/);
    
    let isCorrect = false;
    let userVal = NaN;
    let userUnitRaw = '';
    let isValueMatch = false;
    let isUnitMatch = false;

    if (match) {
      userVal = parseFloat(match[1]);
      userUnitRaw = match[2].trim();
      
      const userUnitNormalized = userUnitRaw.toLowerCase().replace(/[\s\.\*\u00D7\u22C5\u00B7-]/g, '');
      const expectedUnitNormalized = expectedUnit.toLowerCase().replace(/[\s\.\*\u00D7\u22C5\u00B7-]/g, '');

      // Allow spacing/formatting unit variations
      if (expectedUnitNormalized === 'nm') {
        isUnitMatch = ['nm', 'mn', 'newtonmetre', 'newtonmetres', 'newtonmeter', 'newtonmeters'].includes(userUnitNormalized);
      } else if (expectedUnitNormalized === 'n') {
        isUnitMatch = ['n', 'newton', 'newtons'].includes(userUnitNormalized);
      } else if (expectedUnitNormalized === 'm') {
        isUnitMatch = ['m', 'meter', 'meters', 'metre', 'metres'].includes(userUnitNormalized);
      }

      const tolerance = expectedVal * 0.02; // 2% tolerance
      isValueMatch = Math.abs(userVal - expectedVal) <= tolerance;
      isCorrect = isValueMatch && isUnitMatch;
    }

    feedbackPanel.classList.remove('hidden');
    feedbackPanel.className = 'feedback-panel ' + (isCorrect ? 'correct' : 'incorrect');

    if (isCorrect) {
      quizScore++;
      feedbackStatusText.textContent = '\u2714 Correct! Well done.';
      triggerConfetti();
    } else {
      if (isValueMatch && !isUnitMatch) {
        feedbackStatusText.textContent = '\u2718 Value is correct, but check your units!';
      } else if (!isValueMatch && isUnitMatch) {
        feedbackStatusText.textContent = '\u2718 Unit is correct, but the calculation is off!';
      } else {
        feedbackStatusText.textContent = '\u2718 Incorrect. Check both your calculation and unit:';
      }
    }

    // Solution step generator
    let solutionHTML = '';
    const displayUserAnswer = match ? `${userVal} ${userUnitRaw}` : userInput;
    if (activeQuestion.type === 'A') {
      solutionHTML = `
        To calculate the Moment, multiply the applied Force ($F$) by the Perpendicular Distance ($d$):
        <span class="equation">Moment = Force &times; Distance</span>
        <span class="equation">Moment = ${activeQuestion.f} N &times; ${activeQuestion.d} m = ${expectedVal.toFixed(1)} N m</span>
        Your answer: <strong>${displayUserAnswer}</strong> (Target: ${expectedVal.toFixed(1)} N m)
      `;
    } 
    else if (activeQuestion.type === 'B') {
      solutionHTML = `
        To calculate the Force ($F$), divide the Moment ($M$) by the Perpendicular Distance ($d$):
        <span class="equation">Force = Moment / Distance</span>
        <span class="equation">Force = ${activeQuestion.moment} N m / ${activeQuestion.d} m = ${expectedVal.toFixed(1)} N</span>
        Your answer: <strong>${displayUserAnswer}</strong> (Target: ${expectedVal.toFixed(1)} N)
      `;
    } 
    else if (activeQuestion.type === 'C') {
      solutionHTML = `
        To calculate the Perpendicular Distance ($d$), divide the Moment ($M$), by the Force ($F$):
        <span class="equation">Distance = Moment / Force</span>
        <span class="equation">Distance = ${activeQuestion.moment} N m / ${activeQuestion.f} N = ${expectedVal.toFixed(1)} m</span>
        Your answer: <strong>${displayUserAnswer}</strong> (Target: ${expectedVal.toFixed(1)} m)
      `;
    }

    workedSolutionText.innerHTML = solutionHTML;
    qScore.textContent = quizScore;
  }

  function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < 30) {
      loadQuestion();
    } else {
      showQuizEnd();
    }
  }

  function showQuizEnd() {
    quizPlayView.classList.add('hidden');
    quizEndView.classList.remove('hidden');

    const finalScoreText = document.getElementById('final-score-text');
    const gradeBadgeText = document.getElementById('grade-badge-text');
    const gradeMessageText = document.getElementById('grade-message-text');

    finalScoreText.textContent = `${quizScore}/30`;

    if (quizScore >= 25) {
      gradeBadgeText.textContent = 'Excellent';
      gradeBadgeText.style.color = 'var(--neon-green)';
      gradeBadgeText.style.borderColor = 'var(--neon-green)';
      gradeMessageText.textContent = 'Excellent — you have mastered moments!';
      triggerConfetti();
    } else if (quizScore >= 15) {
      gradeBadgeText.textContent = 'Good Effort';
      gradeBadgeText.style.color = 'var(--neon-yellow)';
      gradeBadgeText.style.borderColor = 'var(--neon-yellow)';
      gradeMessageText.textContent = 'Good effort — review your working and try again.';
    } else {
      gradeBadgeText.textContent = 'Keep Practising';
      gradeBadgeText.style.color = 'var(--neon-pink)';
      gradeBadgeText.style.borderColor = 'var(--neon-pink)';
      gradeMessageText.textContent = 'Keep practising — revisit the concept in Section 1.';
    }
  }

  if (startQuizBtn) startQuizBtn.addEventListener('click', startQuiz);
  if (quizForm) quizForm.addEventListener('submit', checkAnswer);
  if (btnNextQuestion) btnNextQuestion.addEventListener('click', nextQuestion);
  if (restartQuizBtn) restartQuizBtn.addEventListener('click', startQuiz);

  /* ==========================================================================
     6. CONFETTI CELEBRATORY SYSTEM
     ========================================================================== */
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  let confettiParticles = [];
  let animationFrameId = null;

  function resizeConfettiCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeConfettiCanvas);
  resizeConfettiCanvas();

  class ConfettiParticle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * -100 - 20;
      this.size = Math.random() * 8 + 6;
      this.speedY = Math.random() * 5 + 3;
      this.speedX = Math.random() * 3 - 1.5;
      this.color = ['#00e5ff', '#ff007f', '#00ff66', '#ffe600'][Math.floor(Math.random() * 4)];
      this.rotation = Math.random() * 360;
      this.rotationSpeed = Math.random() * 4 - 2;
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      this.rotation += this.rotationSpeed;
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.fillStyle = this.color;
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
      ctx.restore();
    }
  }

  function triggerConfetti() {
    confettiParticles = [];
    for (let i = 0; i < 80; i++) {
      confettiParticles.push(new ConfettiParticle());
    }
    
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    animateConfetti();
  }

  function animateConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;

    confettiParticles.forEach(p => {
      p.update();
      p.draw();
      if (p.y < canvas.height) {
        active = true;
      }
    });

    if (active) {
      animationFrameId = requestAnimationFrame(animateConfetti);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  /* ==========================================================================
     7. SECTION 5 — FLASHCARD REVISION SYSTEM
     ========================================================================== */
  const flashcardsData = [
    {
      cat: 'Concept',
      q: 'What is the definition of the moment of a force?',
      a: 'The turning effect of a force about a pivot.'
    },
    {
      cat: 'Formula',
      q: 'What is the formula to calculate the moment?',
      a: 'Moment = Force \u00D7 Perpendicular Distance from Pivot'
    },
    {
      cat: 'Units',
      q: 'What is the SI unit of the moment of a force?',
      a: 'Newton-metre (N m).'
    },
    {
      cat: 'Physics',
      q: 'What does "perpendicular distance" refer to in the moment formula?',
      a: 'The shortest distance from the pivot to the line of action of the force.'
    },
    {
      cat: 'Principle',
      q: 'Name two ways to increase the moment (turning effect) of a force.',
      a: '1. Apply a larger force (F)\n2. Apply the force at a greater perpendicular distance (d) from the pivot.'
    },
    {
      cat: 'Everyday Example',
      q: 'How does a spanner apply the moment concept?',
      a: 'The pivot is at the nut. The long handle increases the distance (d), reducing the force needed to turn it.'
    },
    {
      cat: 'Everyday Example',
      q: 'Where is the pivot on a standard door, and how is distance maximized?',
      a: 'The pivot is at the hinges. The handle is on the opposite edge to maximize perpendicular distance (d) for easy turning.'
    },
    {
      cat: 'Everyday Example',
      q: 'Where is the pivot on a pair of scissors, and how is it used to cut?',
      a: 'The pivot is the central screw. Force is applied by fingers on the handles, generating a turning effect to cut at the blades.'
    },
    {
      cat: 'Everyday Example',
      q: 'How does a wheelbarrow use the concept of moments to make lifting loads easier?',
      a: 'The pivot is at the wheel. Drastic distance is provided by the long handles, reducing the lifting force required.'
    },
    {
      cat: 'Safety',
      q: 'Why can pushing directly on a door hinge never open the door?',
      a: 'Because the distance (d) from the pivot is zero, so the turning moment is zero (Moment = F \u00D7 0 = 0).'
    }
  ];

  let currentFlashcardIndex = 0;
  let activeFlashcards = [...flashcardsData];

  const flashcardElement = document.getElementById('active-flashcard');
  const cardIndexDisplay = document.getElementById('card-index-display');
  const btnShuffle = document.getElementById('btn-shuffle-cards');
  const btnPrevCard = document.getElementById('prev-card-btn');
  const btnNextCard = document.getElementById('next-card-btn');

  const cardCatFront = document.getElementById('card-cat-front');
  const cardCatBack = document.getElementById('card-cat-back');
  const cardQuestionText = document.getElementById('card-question-text');
  const cardAnswerText = document.getElementById('card-answer-text');

  function renderFlashcard() {
    // Reset flip animation
    flashcardElement.classList.remove('flipped');
    
    // Fetch data
    const cardData = activeFlashcards[currentFlashcardIndex];
    
    // Populate card text after short timeout to allow transition to hide face changes
    setTimeout(() => {
      cardCatFront.textContent = cardData.cat;
      cardCatBack.textContent = cardData.cat;
      cardQuestionText.textContent = cardData.q;
      cardAnswerText.textContent = cardData.a;
    }, 150);

    cardIndexDisplay.textContent = currentFlashcardIndex + 1;
  }

  // Handle Flipping
  flashcardElement.addEventListener('click', () => {
    flashcardElement.classList.toggle('flipped');
  });

  // Next / Prev triggers
  btnPrevCard.addEventListener('click', () => {
    if (currentFlashcardIndex > 0) {
      currentFlashcardIndex--;
    } else {
      currentFlashcardIndex = activeFlashcards.length - 1; // loop
    }
    renderFlashcard();
  });

  btnNextCard.addEventListener('click', () => {
    if (currentFlashcardIndex < activeFlashcards.length - 1) {
      currentFlashcardIndex++;
    } else {
      currentFlashcardIndex = 0; // loop
    }
    renderFlashcard();
  });

  // Shuffle Cards
  btnShuffle.addEventListener('click', () => {
    activeFlashcards.sort(() => Math.random() - 0.5);
    currentFlashcardIndex = 0;
    renderFlashcard();
    
    // Add quick scale pop animation to shuffle button
    btnShuffle.style.transform = 'scale(0.95)';
    setTimeout(() => {
      btnShuffle.style.transform = 'none';
    }, 100);
  });

  // Render initial card
  renderFlashcard();

});
