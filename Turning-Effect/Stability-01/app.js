/* Application Logic - Turning Effect of Forces: Stability & Centre of Gravity */

document.addEventListener('DOMContentLoaded', () => {
  // Navigation State
  let currentSection = 'concept-intro';
  let activeExplorerObject = 'box-tall';
  let explorerTiltAngle = 0;
  
  // Quiz State
  let quizStarted = false;
  let currentQuestionIndex = 0;
  let quizQuestions = [];
  let userScore = 0; // Types A and B
  let selectedOption = null;

  // Flashcards State
  let currentCardIndex = 0;
  let flashcards = [];

  // Theme Constants
  const colors = {
    cyan: '#00f0ff',
    purple: '#8b5cf6',
    pink: '#ff0055',
    green: '#39ff14',
    yellow: '#facc15',
    text: '#f8fafc',
    muted: '#94a3b8'
  };

  // Object Physical Properties
  const objects = {
    'box-tall': {
      name: 'Tall Thin Box',
      width: 60,
      height: 180,
      cgX: 30, // center of base
      cgY: 90, // half height
      cgHeightText: '90 mm',
      baseWidthText: '60 mm',
      stability: 'Low',
      expl: 'Tall thin box: Narrow base and high CG — tips over easily.'
    },
    'box-wide': {
      name: 'Wide Low Box',
      width: 120,
      height: 60,
      cgX: 60,
      cgY: 30,
      cgHeightText: '30 mm',
      baseWidthText: '120 mm',
      stability: 'High',
      expl: 'Wide low box: Wide base and low CG — very stable.'
    },
    'cone': {
      name: 'Cone (resting on base)',
      width: 100, // base diameter
      height: 120,
      cgX: 50,
      cgY: 30, // H/4 for solid cone
      cgHeightText: '30 mm',
      baseWidthText: '100 mm',
      stability: 'Medium',
      expl: 'Cone: Wide base but CG is at one-third height — moderately stable.'
    },
    'racing-car': {
      name: 'Racing Car',
      width: 150,
      height: 30,
      cgX: 75,
      cgY: 10,
      cgHeightText: '10 mm',
      baseWidthText: '150 mm',
      stability: 'High',
      expl: 'Racing car: Wide base and very low CG — extremely stable.'
    }
  };

  // ----------------------------------------------------
  // NAVIGATION & BOOTSTRAP
  // ----------------------------------------------------
  const navButtons = document.querySelectorAll('.nav-btn');
  const sections = document.querySelectorAll('.content-section');

  function switchSection(sectionId) {
    sections.forEach(s => s.classList.remove('active'));
    navButtons.forEach(b => b.classList.remove('active'));

    const activeSec = document.getElementById(sectionId);
    if (activeSec) activeSec.classList.add('active');

    const activeBtn = document.querySelector(`[data-section="${sectionId}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    currentSection = sectionId;

    // Trigger animations or setups per section
    if (sectionId === 'stability-explorer') {
      updateExplorerVisual();
    } else if (sectionId === 'concept-intro') {
      initConceptIntroVisuals();
    } else if (sectionId === 'comparative-analysis') {
      renderComparativePanelStatic();
    }
  }

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      switchSection(btn.getAttribute('data-section'));
    });
  });

  // Step tabs in Concept Intro
  const tabBtns = document.querySelectorAll('.step-tab-btn');
  const stepContents = document.querySelectorAll('.step-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      stepContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const stepId = btn.getAttribute('data-step');
      document.getElementById(stepId).classList.add('active');

      // Stop any running animations if necessary, then trigger corresponding concept drawings
      initConceptIntroVisuals();
    });
  });

  // ----------------------------------------------------
  // MATH & PHYSICS CALCULATIONS
  // ----------------------------------------------------
  function getRotatedPoint(px, py, x, y, angleDeg) {
    const rad = -angleDeg * Math.PI / 180;
    const dx = x - px;
    const dy = y - py;
    return {
      x: px + dx * Math.cos(rad) - dy * Math.sin(rad),
      y: py + dx * Math.sin(rad) + dy * Math.cos(rad)
    };
  }

  // Calculate tipping angle threshold: tan(theta_crit) = (W/2) / CG_height
  function getCriticalAngle(width, cgHeight) {
    return Math.atan((width / 2) / cgHeight) * 180 / Math.PI;
  }

  // ----------------------------------------------------
  // CONCEPT INTRO ANIMATIONS
  // ----------------------------------------------------
  let conceptAnimFrame = null;

  function initConceptIntroVisuals() {
    if (conceptAnimFrame) {
      cancelAnimationFrame(conceptAnimFrame);
      conceptAnimFrame = null;
    }

    // Draw base state of all concept SVGs
    drawConceptPartA(0, 0); // stable boxes side by side
    drawConceptPartB(0);    // Box ready for tilt
    drawConceptPartC(0, 0, 0); // 3 equilibrium types
  }

  // Concept Part A Renderer
  function drawConceptPartA(tiltTall, tiltWide) {
    const svg = document.getElementById('svg-part-a');
    if (!svg) return;
    svg.innerHTML = '';

    const groundY = 200;

    // Ground line
    const ground = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    ground.setAttribute('x1', '20');
    ground.setAttribute('y1', groundY);
    ground.setAttribute('x2', '380');
    ground.setAttribute('y2', groundY);
    ground.setAttribute('stroke', '#334155');
    ground.setAttribute('stroke-width', '4');
    svg.appendChild(ground);

    // Tall Box Setup
    // Width: 40, Height: 120. Pivot at bottom-left corner x=80, y=200
    const pivotTall = { x: 80, y: groundY };
    const wTall = 40;
    const hTall = 120;
    const unrotatedCGTall = { x: 100, y: groundY - 60 };
    const rotCGTall = getRotatedPoint(pivotTall.x, pivotTall.y, unrotatedCGTall.x, unrotatedCGTall.y, tiltTall);

    // Draw tall box group
    const gTall = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    gTall.setAttribute('transform', `rotate(${-tiltTall}, ${pivotTall.x}, ${pivotTall.y})`);
    
    const rectTall = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rectTall.setAttribute('x', '80');
    rectTall.setAttribute('y', `${groundY - hTall}`);
    rectTall.setAttribute('width', `${wTall}`);
    rectTall.setAttribute('height', `${hTall}`);
    rectTall.setAttribute('fill', 'rgba(139, 92, 246, 0.15)');
    rectTall.setAttribute('stroke', colors.purple);
    rectTall.setAttribute('stroke-width', '2');
    gTall.appendChild(rectTall);
    svg.appendChild(gTall);

    // Tall CG and Line
    drawCGElements(svg, rotCGTall, groundY, tiltTall > 20 ? colors.pink : colors.purple);

    // Wide Box Setup
    // Width: 100, Height: 50. Pivot at bottom-left corner x=210, y=200
    const pivotWide = { x: 210, y: groundY };
    const wWide = 100;
    const hWide = 50;
    const unrotatedCGWide = { x: 260, y: groundY - 25 };
    const rotCGWide = getRotatedPoint(pivotWide.x, pivotWide.y, unrotatedCGWide.x, unrotatedCGWide.y, tiltWide);

    // Draw wide box group
    const gWide = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    gWide.setAttribute('transform', `rotate(${-tiltWide}, ${pivotWide.x}, ${pivotWide.y})`);
    
    const rectWide = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rectWide.setAttribute('x', '210');
    rectWide.setAttribute('y', `${groundY - hWide}`);
    rectWide.setAttribute('width', `${wWide}`);
    rectWide.setAttribute('height', `${hWide}`);
    rectWide.setAttribute('fill', 'rgba(0, 240, 255, 0.15)');
    rectWide.setAttribute('stroke', colors.cyan);
    rectWide.setAttribute('stroke-width', '2');
    gWide.appendChild(rectWide);
    svg.appendChild(gWide);

    // Wide CG and Line
    drawCGElements(svg, rotCGWide, groundY, colors.cyan);

    // Labels
    drawText(svg, 100, 70, 'Tall Thin Box', colors.purple, '14px', 'middle');
    drawText(svg, 260, 130, 'Wide Low Box', colors.cyan, '14px', 'middle');
  }

  // Concept Part B Renderer (The Tipping Rule)
  function drawConceptPartB(tilt) {
    const svg = document.getElementById('svg-part-b');
    if (!svg) return;
    svg.innerHTML = '';

    const groundY = 200;
    const pivotX = 170; // Pivot at left edge of the base

    // Ground
    const ground = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    ground.setAttribute('x1', '50');
    ground.setAttribute('y1', groundY);
    ground.setAttribute('x2', '350');
    ground.setAttribute('y2', groundY);
    ground.setAttribute('stroke', '#334155');
    ground.setAttribute('stroke-width', '4');
    svg.appendChild(ground);

    // Base Highlight
    const baseLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    baseLine.setAttribute('x1', '170');
    baseLine.setAttribute('y1', groundY);
    baseLine.setAttribute('x2', '230');
    baseLine.setAttribute('y2', groundY);
    baseLine.setAttribute('stroke', colors.cyan);
    baseLine.setAttribute('stroke-width', '6');
    baseLine.setAttribute('stroke-linecap', 'round');
    svg.appendChild(baseLine);

    // Box dimensions: Width: 60, Height: 150
    // CG initially at (200, 125). Pivot at (170, 200)
    const rotCG = getRotatedPoint(pivotX, groundY, 200, 125, tilt);
    const criticalAngle = Math.atan(30/75) * 180 / Math.PI; // ~21.8 deg

    const gBox = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    gBox.setAttribute('transform', `rotate(${-tilt}, ${pivotX}, ${groundY})`);

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', '170');
    rect.setAttribute('y', '50');
    rect.setAttribute('width', '60');
    rect.setAttribute('height', '150');
    rect.setAttribute('fill', 'rgba(255, 255, 255, 0.05)');
    rect.setAttribute('stroke', tilt > criticalAngle ? colors.pink : colors.cyan);
    rect.setAttribute('stroke-width', '2');
    gBox.appendChild(rect);
    svg.appendChild(gBox);

    // Pivot indicator dot (left corner)
    const pivotDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    pivotDot.setAttribute('cx', pivotX);
    pivotDot.setAttribute('cy', groundY);
    pivotDot.setAttribute('r', '5');
    pivotDot.setAttribute('fill', colors.yellow);
    svg.appendChild(pivotDot);

    // CG elements (topples when CG passes left of pivotX)
    const isToppling = rotCG.x < pivotX;
    drawCGElements(svg, rotCG, groundY, isToppling ? colors.pink : colors.cyan);

    // Dynamic info label
    let statusText = 'Stable: CG line falls inside base';
    let labelColor = colors.cyan;
    if (Math.abs(tilt - criticalAngle) < 0.8) {
      statusText = 'CRITICAL: CG line exactly on edge!';
      labelColor = colors.yellow;
    } else if (isToppling) {
      statusText = 'Unstable: CG line falls outside base → Topples!';
      labelColor = colors.pink;
    }
    drawText(svg, 200, 30, statusText, labelColor, '14px', 'middle');
  }

  // Concept Part C Renderer (Three Equilibriums)
  function drawConceptPartC(tiltStable, tiltUnstable, xNeutral) {
    const drawHemisphere = (id, tilt, type) => {
      const svg = document.getElementById(id);
      if (!svg) return;
      svg.innerHTML = '';
      
      const groundY = 100;
      const pivotX = 65;

      // Ground
      const ground = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      ground.setAttribute('x1', '10');
      ground.setAttribute('y1', groundY);
      ground.setAttribute('x2', '120');
      ground.setAttribute('y2', groundY);
      ground.setAttribute('stroke', '#334155');
      ground.setAttribute('stroke-width', '3');
      svg.appendChild(ground);

      if (type === 'stable') {
        // Flat side down cone/cylinder. Let's make a triangle cone. Width: 50, Height: 50.
        // Pivot at bottom-left corner (x=40)
        const pX = 40;
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `rotate(${-tilt}, ${pX}, ${groundY})`);
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M 40,100 L 90,100 L 65,50 Z`);
        path.setAttribute('fill', 'rgba(0, 240, 255, 0.15)');
        path.setAttribute('stroke', colors.cyan);
        path.setAttribute('stroke-width', '2');
        g.appendChild(path);
        svg.appendChild(g);

        // CG is at 65, 87.5 (1/4 of height for cone is 12.5px up from base)
        const rotCG = getRotatedPoint(pX, groundY, 65, 87.5, tilt);
        drawCGElements(svg, rotCG, groundY, colors.cyan, 3);

      } else if (type === 'unstable') {
        // Balanced on tip. Triangle pointing down.
        // Pivot at bottom tip x=65, y=100
        const pX = 65;
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `rotate(${-tilt}, ${pX}, ${groundY})`);

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M 40,50 L 90,50 L 65,100 Z`);
        path.setAttribute('fill', 'rgba(255, 0, 85, 0.15)');
        path.setAttribute('stroke', colors.pink);
        path.setAttribute('stroke-width', '2');
        g.appendChild(path);
        svg.appendChild(g);

        // CG is at 65, 62.5 (1/4 of height from top base means 62.5px)
        const rotCG = getRotatedPoint(pX, groundY, 65, 62.5, tilt);
        drawCGElements(svg, rotCG, groundY, colors.pink, 3);

      } else if (type === 'neutral') {
        // Sphere. Radius 20. Moving horizontally.
        const radius = 20;
        const sphereX = 65 + xNeutral;
        const sphereY = groundY - radius;

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', sphereX);
        circle.setAttribute('cy', sphereY);
        circle.setAttribute('r', radius);
        circle.setAttribute('fill', 'rgba(139, 92, 246, 0.15)');
        circle.setAttribute('stroke', colors.purple);
        circle.setAttribute('stroke-width', '2');
        svg.appendChild(circle);

        // CG is at exact center
        const cg = { x: sphereX, y: sphereY };
        drawCGElements(svg, cg, groundY, colors.purple, 3);
      }
    };

    drawHemisphere('svg-stable-eq', tiltStable, 'stable');
    drawHemisphere('svg-unstable-eq', tiltUnstable, 'unstable');
    drawHemisphere('svg-neutral-eq', xNeutral, 'neutral');
  }

  // Animation Actions
  document.getElementById('btn-animate-part-a').addEventListener('click', () => {
    let start = null;
    const duration = 1500; // 1.5s animation

    function step(timestamp) {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const t = Math.min(progress / duration, 1);

      // Tilt angles: Wide returns, Tall topples
      let tiltTall, tiltWide;

      if (t < 0.3) {
        // Both tilt together to 18 degrees
        tiltTall = t * (1 / 0.3) * 18;
        tiltWide = t * (1 / 0.3) * 18;
      } else if (t < 0.65) {
        // Wide starts returning back to 0. Tall goes past critical angle (18.4) to topple (e.g. 90)
        const returnT = (t - 0.3) / 0.35;
        tiltWide = 18 * (1 - returnT);
        tiltTall = 18 + (90 - 18) * returnT;
      } else {
        tiltWide = 0;
        tiltTall = 90;
      }

      drawConceptPartA(tiltTall, tiltWide);

      if (t < 1) {
        conceptAnimFrame = requestAnimationFrame(step);
      }
    }
    
    if (conceptAnimFrame) cancelAnimationFrame(conceptAnimFrame);
    conceptAnimFrame = requestAnimationFrame(step);
  });

  document.getElementById('btn-reset-part-a').addEventListener('click', () => {
    if (conceptAnimFrame) cancelAnimationFrame(conceptAnimFrame);
    drawConceptPartA(0, 0);
  });

  document.getElementById('btn-animate-part-b').addEventListener('click', () => {
    let start = null;
    const duration = 3000;

    function step(timestamp) {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const t = Math.min(progress / duration, 1);

      // Tilt slowly from 0 to 45 degrees
      let tilt;
      if (t < 0.5) {
        // Phase 1: slide to critical angle ~21.8 deg
        tilt = t * 2 * 21.8;
      } else if (t < 0.7) {
        // Pause slightly at critical tipping point
        tilt = 21.8;
      } else {
        // Phase 3: continue tilt to fall over to 45 deg
        tilt = 21.8 + ((t - 0.7) / 0.3) * (45 - 21.8);
      }

      drawConceptPartB(tilt);

      if (t < 1) {
        conceptAnimFrame = requestAnimationFrame(step);
      }
    }

    if (conceptAnimFrame) cancelAnimationFrame(conceptAnimFrame);
    conceptAnimFrame = requestAnimationFrame(step);
  });

  document.getElementById('btn-reset-part-b').addEventListener('click', () => {
    if (conceptAnimFrame) cancelAnimationFrame(conceptAnimFrame);
    drawConceptPartB(0);
  });

  document.getElementById('btn-animate-part-c').addEventListener('click', () => {
    let start = null;
    const duration = 2000;

    function step(timestamp) {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const t = Math.min(progress / duration, 1);

      // Stable: tilts and oscillates back to 0
      let tiltStable = 0;
      if (t < 0.25) {
        tiltStable = (t / 0.25) * 15; // displacement
      } else {
        // decaying sine wave oscillation
        const oscT = (t - 0.25) / 0.75;
        tiltStable = 15 * Math.exp(-3 * oscT) * Math.cos(oscT * Math.PI * 4);
      }

      // Unstable: tilts slightly and falls down to 90 degrees
      let tiltUnstable = 0;
      if (t < 0.2) {
        tiltUnstable = (t / 0.2) * 5; // displacement
      } else {
        const fallT = (t - 0.2) / 0.8;
        tiltUnstable = 5 + (90 - 5) * Math.pow(fallT, 2);
      }

      // Neutral: rolls to new position and stays
      let xNeutral = 0;
      if (t < 0.6) {
        xNeutral = (t / 0.6) * 35; // moves from 0 to 35
      } else {
        xNeutral = 35; // stays
      }

      drawConceptPartC(tiltStable, tiltUnstable, xNeutral);

      if (t < 1) {
        conceptAnimFrame = requestAnimationFrame(step);
      }
    }

    if (conceptAnimFrame) cancelAnimationFrame(conceptAnimFrame);
    conceptAnimFrame = requestAnimationFrame(step);
  });

  document.getElementById('btn-reset-part-c').addEventListener('click', () => {
    if (conceptAnimFrame) cancelAnimationFrame(conceptAnimFrame);
    drawConceptPartC(0, 0, 0);
  });

  // SVG Helper Utilities
  function drawCGElements(svg, cgPoint, groundY, accentColor, cgRadius = 5) {
    // Vertical dashed line from CG
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', cgPoint.x);
    line.setAttribute('y1', cgPoint.y);
    line.setAttribute('x2', cgPoint.x);
    line.setAttribute('y2', groundY);
    line.setAttribute('stroke', accentColor);
    line.setAttribute('stroke-width', '2');
    line.setAttribute('stroke-dasharray', '4 4');
    svg.appendChild(line);

    // CG Dot outer ring
    const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ring.setAttribute('cx', cgPoint.x);
    ring.setAttribute('cy', cgPoint.y);
    ring.setAttribute('r', cgRadius + 3);
    ring.setAttribute('fill', 'none');
    ring.setAttribute('stroke', accentColor);
    ring.setAttribute('stroke-width', '1');
    svg.appendChild(ring);

    // CG Dot center
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', cgPoint.x);
    dot.setAttribute('cy', cgPoint.y);
    dot.setAttribute('r', cgRadius);
    dot.setAttribute('fill', accentColor);
    svg.appendChild(dot);

    // Text Label G
    drawText(svg, cgPoint.x + 12, cgPoint.y + 4, 'G', accentColor, '12px', 'start', 'bold');
  }

  function drawText(svg, x, y, text, fill, fontSize, textAnchor = 'start', fontWeight = 'normal') {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    el.setAttribute('x', x);
    el.setAttribute('y', y);
    el.setAttribute('fill', fill);
    el.setAttribute('font-size', fontSize);
    el.setAttribute('font-family', 'Space Grotesk, sans-serif');
    el.setAttribute('text-anchor', textAnchor);
    el.setAttribute('font-weight', fontWeight);
    el.textContent = text;
    svg.appendChild(el);
  }


  // ----------------------------------------------------
  // SECTION 2: STABILITY EXPLORER
  // ----------------------------------------------------
  const explorerTabs = document.querySelectorAll('.explorer-tab');
  const tiltSlider = document.getElementById('tilt-slider');
  const expStatusIndicator = document.getElementById('exp-status');
  const expAngleVal = document.getElementById('exp-angle-val');
  const expBaseVal = document.getElementById('exp-base-val');
  const expCgVal = document.getElementById('exp-cg-val');
  const explorerToast = document.getElementById('explorer-message');
  const btnResetExplorer = document.getElementById('btn-reset-explorer');

  explorerTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      explorerTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeExplorerObject = tab.getAttribute('data-object');
      resetExplorer();
    });
  });

  tiltSlider.addEventListener('input', (e) => {
    explorerTiltAngle = parseFloat(e.target.value);
    updateExplorerVisual();
  });

  btnResetExplorer.addEventListener('click', resetExplorer);

  function resetExplorer() {
    explorerTiltAngle = 0;
    tiltSlider.value = 0;
    explorerToast.classList.add('hide');
    updateExplorerVisual();
  }

  function updateExplorerVisual() {
    const svg = document.getElementById('svg-explorer');
    if (!svg) return;
    svg.innerHTML = '';

    const obj = objects[activeExplorerObject];
    expBaseVal.textContent = obj.baseWidthText;
    expCgVal.textContent = obj.cgHeightText;
    expAngleVal.textContent = `${explorerTiltAngle}°`;

    const groundY = 280;
    const pivotX = 220; // anchor pivot on floor (bottom-left corner)
    const criticalAngle = getCriticalAngle(obj.width, obj.cgY);

    // Background reference arc for CG trajectory
    const unrotatedCGX = pivotX + obj.width / 2;
    const unrotatedCGY = groundY - obj.cgY;
    const cgRadius = Math.sqrt(Math.pow(pivotX - unrotatedCGX, 2) + Math.pow(groundY - unrotatedCGY, 2));
    
    // Draw Arc CG Path (counter-clockwise arc to the left)
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const startArc = getRotatedPoint(pivotX, groundY, unrotatedCGX, unrotatedCGY, 0);
    const endArc = getRotatedPoint(pivotX, groundY, unrotatedCGX, unrotatedCGY, 90);
    path.setAttribute('d', `M ${startArc.x} ${startArc.y} A ${cgRadius} ${cgRadius} 0 0 0 ${endArc.x} ${endArc.y}`);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'rgba(255,255,255,0.04)');
    path.setAttribute('stroke-width', '4');
    path.setAttribute('stroke-dasharray', '2 4');
    svg.appendChild(path);

    // Floor ground line
    const floor = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    floor.setAttribute('x1', '50');
    floor.setAttribute('y1', groundY);
    floor.setAttribute('x2', '450');
    floor.setAttribute('y2', groundY);
    floor.setAttribute('stroke', '#334155');
    floor.setAttribute('stroke-width', '4');
    svg.appendChild(floor);

    // Active Base Footprint highlight (extends right from pivotX)
    const baseHighlight = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    baseHighlight.setAttribute('x1', `${pivotX}`);
    baseHighlight.setAttribute('y1', groundY);
    baseHighlight.setAttribute('x2', `${pivotX + obj.width}`);
    baseHighlight.setAttribute('y2', groundY);
    baseHighlight.setAttribute('stroke', colors.cyan);
    baseHighlight.setAttribute('stroke-width', '6');
    baseHighlight.setAttribute('stroke-linecap', 'round');
    svg.appendChild(baseHighlight);

    // Calculate dynamic CG position
    const currentCG = getRotatedPoint(pivotX, groundY, unrotatedCGX, unrotatedCGY, explorerTiltAngle);
    // Topples if the CG shifts left of the bottom-left pivot point
    const hasToppled = currentCG.x < pivotX;

    // Draw object outline
    const gObj = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    gObj.setAttribute('transform', `rotate(${-explorerTiltAngle}, ${pivotX}, ${groundY})`);

    const strokeColor = hasToppled ? colors.pink : colors.cyan;

    if (activeExplorerObject === 'box-tall' || activeExplorerObject === 'box-wide') {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', pivotX);
      rect.setAttribute('y', groundY - obj.height);
      rect.setAttribute('width', obj.width);
      rect.setAttribute('height', obj.height);
      rect.setAttribute('fill', 'rgba(0, 240, 255, 0.04)');
      rect.setAttribute('stroke', strokeColor);
      rect.setAttribute('stroke-width', '3');
      gObj.appendChild(rect);
    } else if (activeExplorerObject === 'cone') {
      const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      const x1 = pivotX;
      const x2 = pivotX + obj.width;
      const x3 = pivotX + obj.width / 2;
      poly.setAttribute('points', `${x1},${groundY} ${x2},${groundY} ${x3},${groundY - obj.height}`);
      poly.setAttribute('fill', 'rgba(0, 240, 255, 0.04)');
      poly.setAttribute('stroke', strokeColor);
      poly.setAttribute('stroke-width', '3');
      gObj.appendChild(poly);
    } else if (activeExplorerObject === 'racing-car') {
      const carBody = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const baseX = pivotX;
      const pathData = `
        M ${baseX},${groundY - 5}
        L ${baseX + 15},${groundY - 15}
        L ${baseX + 50},${groundY - 15}
        L ${baseX + 70},${groundY - 28}
        L ${baseX + 95},${groundY - 28}
        L ${baseX + 110},${groundY - 8}
        L ${baseX + 140},${groundY - 8}
        L ${baseX + 145},${groundY - 22}
        L ${baseX + 150},${groundY - 22}
        L ${pivotX + obj.width},${groundY - 5}
        Z
      `;
      carBody.setAttribute('d', pathData);
      carBody.setAttribute('fill', 'rgba(0, 240, 255, 0.04)');
      carBody.setAttribute('stroke', strokeColor);
      carBody.setAttribute('stroke-width', '3');
      gObj.appendChild(carBody);

      // Wheels
      const w1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      w1.setAttribute('cx', baseX + 30);
      w1.setAttribute('cy', groundY - 10);
      w1.setAttribute('r', '10');
      w1.setAttribute('fill', '#090d16');
      w1.setAttribute('stroke', strokeColor);
      w1.setAttribute('stroke-width', '2');
      gObj.appendChild(w1);

      const w2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      w2.setAttribute('cx', baseX + 120);
      w2.setAttribute('cy', groundY - 12);
      w2.setAttribute('r', '12');
      w2.setAttribute('fill', '#090d16');
      w2.setAttribute('stroke', strokeColor);
      w2.setAttribute('stroke-width', '2');
      gObj.appendChild(w2);
    }

    svg.appendChild(gObj);

    // Pivot Indicator dot
    const pivotDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    pivotDot.setAttribute('cx', pivotX);
    pivotDot.setAttribute('cy', groundY);
    pivotDot.setAttribute('r', '6');
    pivotDot.setAttribute('fill', colors.yellow);
    svg.appendChild(pivotDot);

    // Draw the dynamic CG dot and line
    drawCGElements(svg, currentCG, groundY, strokeColor, 6);

    // Update Live Status
    if (hasToppled) {
      expStatusIndicator.textContent = 'Toppled!';
      expStatusIndicator.className = 'status-indicator toppling';
      explorerToast.classList.remove('hide');
    } else {
      if (Math.abs(explorerTiltAngle - criticalAngle) < 2) {
        expStatusIndicator.textContent = 'Critical Tipping Point!';
        expStatusIndicator.className = 'status-indicator';
        expStatusIndicator.style.borderColor = colors.yellow;
        expStatusIndicator.style.color = colors.yellow;
        expStatusIndicator.style.textShadow = '0 0 8px rgba(250, 204, 21, 0.4)';
      } else {
        expStatusIndicator.textContent = 'Stable';
        expStatusIndicator.className = 'status-indicator';
        expStatusIndicator.style.borderColor = '';
        expStatusIndicator.style.color = '';
        expStatusIndicator.style.textShadow = '';
      }
      explorerToast.classList.add('hide');
    }
  }


  // ----------------------------------------------------
  // SECTION 3: COMPARATIVE ANALYSIS PANEL
  // ----------------------------------------------------
  function renderComparativePanelStatic() {
    // Fill each small card's SVG dynamically to ensure clean responsive scaling
    Object.keys(objects).forEach(key => {
      const svg = document.getElementById(`comp-svg-${key.split('-')[1] || key}`);
      if (!svg) return;
      svg.innerHTML = '';

      const obj = objects[key];
      const groundY = 85;
      const pivotX = 90 + obj.width / 2.5;

      // Base footprint scale
      const scaleW = obj.width / 1.5;
      const scaleH = obj.height / 1.5;
      const startX = 90 - scaleW / 2;

      // Ground line
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', '10');
      line.setAttribute('y1', groundY);
      line.setAttribute('x2', '170');
      line.setAttribute('y2', groundY);
      line.setAttribute('stroke', '#1e293b');
      line.setAttribute('stroke-width', '2');
      svg.appendChild(line);

      // Object shape
      const color = key === 'racing-car' || key === 'box-wide' ? colors.cyan : (key === 'cone' ? colors.yellow : colors.pink);
      
      if (key.startsWith('box')) {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', startX);
        rect.setAttribute('y', groundY - scaleH);
        rect.setAttribute('width', scaleW);
        rect.setAttribute('height', scaleH);
        rect.setAttribute('fill', 'rgba(255,255,255,0.02)');
        rect.setAttribute('stroke', color);
        rect.setAttribute('stroke-width', '1.5');
        svg.appendChild(rect);
      } else if (key === 'cone') {
        const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        poly.setAttribute('points', `${startX},${groundY} ${startX + scaleW},${groundY} ${90},${groundY - scaleH}`);
        poly.setAttribute('fill', 'none');
        poly.setAttribute('stroke', color);
        poly.setAttribute('stroke-width', '1.5');
        svg.appendChild(poly);
      } else if (key === 'racing-car') {
        const car = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        car.setAttribute('d', `M ${startX},${groundY - 5} L ${startX + 10},${groundY - 10} L ${startX + 35},${groundY - 10} L ${startX + 45},${groundY - 20} L ${startX + 65},${groundY - 20} L ${startX + 75},${groundY - 5} L ${startX + scaleW},${groundY - 5} L ${startX + scaleW},${groundY} Z`);
        car.setAttribute('fill', 'none');
        car.setAttribute('stroke', color);
        car.setAttribute('stroke-width', '1.5');
        svg.appendChild(car);
      }

      // Draw static CG dot (no vector line to ground needed to keep it tidy)
      const scaledCGX = startX + obj.cgX / 1.5;
      const scaledCGY = groundY - obj.cgY / 1.5;

      const cgDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      cgDot.setAttribute('cx', scaledCGX);
      cgDot.setAttribute('cy', scaledCGY);
      cgDot.setAttribute('r', '4');
      cgDot.setAttribute('fill', color);
      svg.appendChild(cgDot);

      drawText(svg, scaledCGX + 8, scaledCGY + 3, 'G', color, '10px');
    });
  }

  // Tapping cards reveals analysis details
  const compCards = document.querySelectorAll('.comp-card');
  compCards.forEach(card => {
    const revealBtn = card.querySelector('.comp-reveal-btn');
    const overlay = card.querySelector('.comp-expl-overlay');
    
    revealBtn.addEventListener('click', () => {
      overlay.classList.remove('hide');
    });

    overlay.addEventListener('click', () => {
      overlay.classList.add('hide');
    });
  });


  // ----------------------------------------------------
  // SECTION 4: PRACTICE & EVALUATION QUIZ
  // ----------------------------------------------------
  const quizIntroCard = document.getElementById('quiz-intro-card');
  const quizGamePanel = document.getElementById('quiz-game-panel');
  const quizResultsCard = document.getElementById('quiz-results-card');
  const btnStartQuiz = document.getElementById('btn-start-quiz');
  const btnRestartQuiz = document.getElementById('btn-restart-quiz');
  const btnSubmitAnswer = document.getElementById('btn-submit-answer');
  const btnNextQuestion = document.getElementById('btn-next-question');
  const quizProgressFill = document.getElementById('quiz-progress-fill');
  const quizQNumText = document.getElementById('quiz-q-num');
  const quizScoreText = document.getElementById('quiz-score-indicator');
  const quizQTypeBadge = document.getElementById('quiz-q-type-badge');
  const quizQText = document.getElementById('quiz-q-text');
  const quizInputArea = document.getElementById('quiz-input-area');
  const quizFeedbackBox = document.getElementById('quiz-feedback');
  const typeCChecklist = document.getElementById('type-c-checklist');
  const checklistItems = document.getElementById('checklist-items');

  btnStartQuiz.addEventListener('click', startQuiz);
  btnRestartQuiz.addEventListener('click', startQuiz);
  btnSubmitAnswer.addEventListener('click', submitAnswer);
  btnNextQuestion.addEventListener('click', nextQuestion);

  function startQuiz() {
    quizQuestions = generateQuizPool();
    currentQuestionIndex = 0;
    userScore = 0;
    quizStarted = true;
    selectedOption = null;

    quizIntroCard.classList.add('hide');
    quizResultsCard.classList.add('hide');
    quizGamePanel.classList.remove('hide');
    quizScoreText.classList.remove('hide');
    quizScoreText.textContent = `Score: ${userScore}`;

    showQuestion();
  }

  function generateQuizPool() {
    const pool = [];
    
    // TYPE A: PREDICT STABILITY (10 questions)
    const objectsList = Object.keys(objects);
    const anglesList = [15, 30, 45, 60];
    
    for (let i = 0; i < 10; i++) {
      const objKey = objectsList[i % objectsList.length];
      const angle = anglesList[Math.floor(Math.random() * anglesList.length)];
      const obj = objects[objKey];
      const critAngle = getCriticalAngle(obj.width, obj.cgY);
      const willTopple = angle > critAngle;

      pool.push({
        type: 'A',
        objectKey: objKey,
        angle: angle,
        question: `If this ${obj.name.toLowerCase()} is tilted by ${angle}°, will it topple or return to upright?`,
        correctOption: willTopple ? 'Topple' : 'Return to upright',
        explanation: `The critical tipping angle of the ${obj.name.toLowerCase()} is about ${critAngle.toFixed(1)}°. Since the tilt angle (${angle}°) is ${willTopple ? 'greater' : 'less'} than this, the vertical line from its CG falls ${willTopple ? 'outside' : 'inside'} the base footprint, making it ${willTopple ? 'topple' : 'return upright'}.`
      });
    }

    // TYPE B: COMPARE TWO OBJECTS (10 questions)
    const typeBQuestions = [
      {
        question: "Object X (Base Width 50mm, CG Height 120mm) and Object Y (Base Width 50mm, CG Height 60mm) are compared. Which is more stable and why?",
        options: [
          "Object Y, because it has a lower centre of gravity.",
          "Object X, because it is taller and can resist tipping.",
          "Both have the same base width, so their stability is equal."
        ],
        correctIndex: 0,
        explanation: "Object Y is more stable because it has a lower CG height. When tilted, a lower CG means the line of action of gravity takes a larger angle to fall outside the base limits.",
        xW: 50, xH: 240, xCG: 120, yW: 50, yH: 120, yCG: 60
      },
      {
        question: "Object X (Base Width 100mm, CG Height 80mm) and Object Y (Base Width 60mm, CG Height 80mm) are tilted. Which will topple first?",
        options: [
          "Object X, because its wider base moves its CG further.",
          "Object Y, because its narrower base gives it a smaller critical tipping angle.",
          "They will topple at the same angle since their CG heights are identical."
        ],
        correctIndex: 1,
        explanation: "Object Y has a narrower base. The critical angle is given by arctan(Base / 2 / CG Height). A smaller base results in a smaller critical tipping angle, so it topples first.",
        xW: 100, xH: 160, xCG: 80, yW: 60, yH: 160, yCG: 80
      },
      {
        question: "A cone resting on its flat base (Base 100mm, CG 30mm) is compared to the same cone resting on its tip (Base 2mm, CG 90mm). Which is more stable?",
        options: [
          "Cone on base because it has a wider base and lower CG.",
          "Cone on tip because it has a higher CG.",
          "Both are equally stable because their mass is identical."
        ],
        correctIndex: 0,
        explanation: "The cone on its base has a wide base of support (100mm) and a low CG (30mm). Balanced on its tip, the base width is practically zero, and the CG is high, making it highly unstable.",
        xW: 100, xH: 120, xCG: 30, yW: 10, yH: 120, yCG: 90,
        xShape: 'cone', yShape: 'cone-inverted'
      },
      {
        question: "If we double the base width of a tall box while keeping its height and CG position unchanged (Original: Base 50mm, CG 100mm. Modified: Base 100mm, CG 100mm), how does this affect its stability?",
        options: [
          "Its stability increases because the critical angle becomes larger.",
          "Its stability decreases because the area increases.",
          "Stability is unaffected since CG height remains unchanged."
        ],
        correctIndex: 0,
        explanation: "Widening the base directly increases stability by requiring a larger tilt angle before the vertical line from the CG falls outside the support base.",
        xW: 50, xH: 200, xCG: 100, yW: 100, yH: 200, yCG: 100
      },
      {
        question: "A solid cone (Base 80mm, CG 20mm) rests on its base. What type of equilibrium does it demonstrate when tipped slightly?",
        options: [
          "Stable equilibrium.",
          "Unstable equilibrium.",
          "Neutral equilibrium."
        ],
        correctIndex: 0,
        explanation: "Stable equilibrium. Tipping the cone pivots it on its base edge, raising its centre of gravity, which creates a restoring torque.",
        xW: 80, xH: 80, xCG: 20, yW: 80, yH: 80, yCG: 20,
        xShape: 'cone', yShape: 'cone'
      },
      {
        question: "Object X has base 60mm and CG height 30mm. Object Y has base 80mm and CG height 50mm. Which has the larger critical tipping angle?",
        options: [
          "Object X (Critical angle: 45.0°)",
          "Object Y (Critical angle: 38.7°)",
          "They both have the same critical angle"
        ],
        correctIndex: 0,
        explanation: "For X, tan(theta) = 30/30 = 1 (theta = 45°). For Y, tan(theta) = 40/50 = 0.8 (theta = 38.7°). Object X has the larger critical angle.",
        xW: 60, xH: 60, xCG: 30, yW: 80, yH: 100, yCG: 50
      },
      {
        question: "Why does a standing passenger on a double-decker bus stand with their feet wider apart (Feet spread width: 70mm vs 30mm)?",
        options: [
          "To lower their centre of gravity.",
          "To increase the width of their base and increase stability.",
          "To align their CG with the bus engine."
        ],
        correctIndex: 1,
        explanation: "Spreading feet increases the base width of support, making it less likely that the vertical line from their CG will fall outside their base during motion.",
        xW: 30, xH: 140, xCG: 80, yW: 70, yH: 140, yCG: 80
      },
      {
        question: "A cylinder (Base 60mm, CG height 30mm) is rolling along a flat horizontal table. What type of equilibrium is it in?",
        options: [
          "Stable equilibrium.",
          "Unstable equilibrium.",
          "Neutral equilibrium."
        ],
        correctIndex: 2,
        explanation: "It is in neutral equilibrium. As it rolls, the height of its centre of gravity above the surface remains completely constant.",
        xW: 60, xH: 60, xCG: 30, yW: 60, yH: 60, yCG: 30,
        xShape: 'cylinder', yShape: 'cylinder'
      },
      {
        question: "Object X has base 40mm and CG 60mm. Object Y has base 80mm and CG 120mm. Which object is more stable?",
        options: [
          "Object X is more stable.",
          "Object Y is more stable.",
          "They have equal stability."
        ],
        correctIndex: 2,
        explanation: "Both have the same ratio of base-to-height (40/60 = 80/120 = 2/3). Consequently, their critical tipping angles are identical (arctan(1/3) = 18.4°).",
        xW: 40, xH: 120, xCG: 60, yW: 80, yH: 240, yCG: 120
      },
      {
        question: "How does placing heavy objects at the bottom of a container (lowering CG from 80mm to 30mm) change its stability?",
        options: [
          "It decreases stability by increasing mass.",
          "It increases stability by lowering the overall centre of gravity.",
          "It has no effect on stability."
        ],
        correctIndex: 1,
        explanation: "Placing heavy components low down shifts the combined centre of gravity closer to the base, which increases the tipping resistance.",
        xW: 60, xH: 160, xCG: 80, yW: 60, yH: 160, yCG: 30
      }
    ];

    typeBQuestions.forEach(q => {
      pool.push({
        type: 'B',
        ...q
      });
    });

    // TYPE C: STRUCTURED SHORT EXPLANATION (10 questions)
    const typeCQuestions = [
      {
        question: "A tall thin box and a wide low box have the same mass. Explain why the wide low box is more stable.",
        checklist: [
          "Wide low box has a wider base width",
          "Wide low box has a lower centre of gravity (CG)",
          "Requires a larger angle of tilt for the vertical line from CG to fall outside its base"
        ],
        explanation: "The wide low box has both a lower centre of gravity and a wider base of support. When tilted, it requires a much larger angle of rotation before its centre of gravity line falls outside its base bounds, making it far harder to topple."
      },
      {
        question: "Suggest two distinct design adjustments to increase the stability of a tall thin cabinet.",
        checklist: [
          "Widen the base of the cabinet (e.g. add support feet)",
          "Lower the centre of gravity (e.g. place heavy items on bottom shelves)"
        ],
        explanation: "To increase stability, you can: 1. Widen the base width (e.g., attaching flat extensions at the bottom) and 2. Lower the CG (e.g., loading heavy masses into the base drawer)."
      },
      {
        question: "A racing car is designed with a very low chassis. Explain how this design improves its stability.",
        checklist: [
          "Lowers the overall centre of gravity (CG) of the vehicle",
          "Reduces the risk of CG line falling outside the wheelbase during sharp turns or slopes"
        ],
        explanation: "A low chassis lowers the car's overall CG. This keeps the vertical line of action from the CG well within the wide wheelbase, preventing rolling and toppling during high lateral forces."
      },
      {
        question: "A cone rests on its flat circular base. Describe what happens to its stability if it is placed upside down on its tip.",
        checklist: [
          "Its stability becomes extremely low / unstable equilibrium",
          "Its base area is reduced to a single point",
          "Its centre of gravity is raised higher",
          "A small displacement causes the CG line to immediately fall outside the pivot point"
        ],
        explanation: "If balanced on its tip, the cone is in unstable equilibrium. Its base width is virtually zero, and its CG is raised. A tiny tilt immediately moves the CG line outside the pivot, causing it to fall."
      },
      {
        question: "Explain why double-decker buses are tested by tilting them to an angle of 28 degrees without tipping over.",
        checklist: [
          "Ensures the CG is low enough to prevent toppling during operations",
          "Validates that the vertical line from CG remains inside the wheelbase at slope extremes"
        ],
        explanation: "Tilt testing validates that the heavy lower engine/chassis keeps the CG low. This ensures the vertical line of action from the CG stays within the track width even on sharp curves or cambered roads."
      },
      {
        question: "Explain the difference between stable and neutral equilibrium in terms of how CG height behaves when tilted.",
        checklist: [
          "In stable equilibrium, the CG rises when displaced",
          "In neutral equilibrium, the CG height remains constant when displaced"
        ],
        explanation: "For stable objects, displacement lifts the CG (creating a restoring force). For neutral objects (like a rolling cylinder), the CG height remains at a constant elevation during motion."
      },
      {
        question: "State the tipping rule regarding the line of action of weight for an object on a surface.",
        checklist: [
          "The object will return upright if the vertical line from CG falls within its base",
          "The object will topple over if the vertical line from CG falls outside its base"
        ],
        explanation: "An object is stable and returns upright as long as the vertical line from its CG lies within its support base. Once it passes outside the base, gravity produces a turning torque that tips it over."
      },
      {
        question: "Explain why a desk lamp is often constructed with a heavy iron base.",
        checklist: [
          "Lowers the overall centre of gravity of the lamp unit",
          "Counteracts the extended neck to keep CG line within the base area"
        ],
        explanation: "The heavy iron base lowers the combined CG of the lamp assembly. When the neck is stretched out, the CG shifts horizontally, but the heavy base ensures the CG line still falls within the footprint."
      },
      {
        question: "Describe what happens to the CG of a cone when it is tilted slightly from its base, and what moment is created.",
        checklist: [
          "The centre of gravity rises",
          "A restoring moment (torque) is created about the pivot edge by weight"
        ],
        explanation: "Tipping the cone slightly on its base edge raises its CG. Since the vertical line of weight still falls inside the pivot, it generates a restoring clockwise/counter-clockwise moment that returns the cone upright."
      },
      {
        question: "Explain why high-rise buildings require deep underground foundations for stability.",
        checklist: [
          "Deep foundations lower the effective centre of gravity",
          "Provides a wide, secure base anchor to resist wind and sway loads"
        ],
        explanation: "Deep foundations anchor the structure firmly and effectively lower the center of gravity relative to the ground pivot point, increasing the wind torque needed to tip the skyscraper."
      }
    ];

    typeCQuestions.forEach(q => {
      pool.push({
        type: 'C',
        ...q
      });
    });

    // Shuffle the pool to randomise question ordering
    return pool.sort(() => Math.random() - 0.5);
  }

  function showQuestion() {
    selectedOption = null;
    btnSubmitAnswer.disabled = true;
    btnSubmitAnswer.classList.remove('hide');
    btnNextQuestion.classList.add('hide');
    quizFeedbackBox.className = 'quiz-feedback-box hide';
    typeCChecklist.classList.add('hide');

    const q = quizQuestions[currentQuestionIndex];
    
    // Progress
    quizQNumText.textContent = `Question ${currentQuestionIndex + 1} of 30`;
    quizProgressFill.style.width = `${((currentQuestionIndex) / 30) * 100}%`;

    const layout = document.querySelector('.quiz-q-layout');

    // Category Badges
    if (q.type === 'A') {
      quizQTypeBadge.textContent = 'Type A: Predict Stability';
      quizQTypeBadge.style.backgroundColor = 'rgba(0, 240, 255, 0.1)';
      quizQTypeBadge.style.color = colors.cyan;
      quizQTypeBadge.style.borderColor = 'rgba(0, 240, 255, 0.2)';
      
      document.getElementById('quiz-visual-box').classList.remove('hide');
      if (layout) layout.style.gridTemplateColumns = '';
      drawQuizSVG(q.objectKey, q.angle);
    } else if (q.type === 'B') {
      quizQTypeBadge.textContent = 'Type B: Compare Objects';
      quizQTypeBadge.style.backgroundColor = 'rgba(139, 92, 246, 0.1)';
      quizQTypeBadge.style.color = colors.purple;
      quizQTypeBadge.style.borderColor = 'rgba(139, 92, 246, 0.2)';
      
      document.getElementById('quiz-visual-box').classList.remove('hide');
      if (layout) layout.style.gridTemplateColumns = '';
      drawQuizComparisonSVG(currentQuestionIndex);
    } else {
      quizQTypeBadge.textContent = 'Type C: Structured Answer';
      quizQTypeBadge.style.backgroundColor = 'rgba(255, 0, 85, 0.1)';
      quizQTypeBadge.style.color = colors.pink;
      quizQTypeBadge.style.borderColor = 'rgba(255, 0, 85, 0.2)';
      
      // No SVG visual needed for structured descriptive questions
      document.getElementById('quiz-visual-box').classList.add('hide');
      if (layout) layout.style.gridTemplateColumns = '1fr';
    }

    quizQText.textContent = q.question;
    quizInputArea.innerHTML = '';

    // Render controls
    if (q.type === 'A') {
      const btnGroup = document.createElement('div');
      btnGroup.style.display = 'flex';
      btnGroup.style.gap = '12px';
      btnGroup.style.width = '100%';

      ['Return to upright', 'Topple'].forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'quiz-btn-option';
        btn.textContent = opt;
        btn.addEventListener('click', () => {
          document.querySelectorAll('.quiz-btn-option').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          selectedOption = opt;
          btnSubmitAnswer.disabled = false;
        });
        btnGroup.appendChild(btn);
      });
      quizInputArea.appendChild(btnGroup);

    } else if (q.type === 'B') {
      q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-btn-option';
        btn.textContent = opt;
        btn.addEventListener('click', () => {
          document.querySelectorAll('.quiz-btn-option').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          selectedOption = idx;
          btnSubmitAnswer.disabled = false;
        });
        quizInputArea.appendChild(btn);
      });
    } else if (q.type === 'C') {
      const textarea = document.createElement('textarea');
      textarea.className = 'quiz-num-input';
      textarea.style.width = '100%';
      textarea.style.height = '100px';
      textarea.style.resize = 'none';
      textarea.placeholder = 'Type your O-Level explanation here...';
      textarea.addEventListener('input', (e) => {
        btnSubmitAnswer.disabled = e.target.value.trim().length === 0;
      });
      quizInputArea.appendChild(textarea);
    }
  }

  // Draw dynamic diagram for Type A
  function drawQuizSVG(objectKey, angle) {
    const svg = document.getElementById('svg-quiz');
    if (!svg) return;
    svg.innerHTML = '';

    const obj = objects[objectKey];
    const groundY = 200;
    const pivotX = 120; // Left-aligned pivot

    // Ground
    const floor = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    floor.setAttribute('x1', '30');
    floor.setAttribute('y1', groundY);
    floor.setAttribute('x2', '320');
    floor.setAttribute('y2', groundY);
    floor.setAttribute('stroke', '#334155');
    floor.setAttribute('stroke-width', '3');
    svg.appendChild(floor);

    // Unrotated base line (extends right from pivotX)
    const baseLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    baseLine.setAttribute('x1', pivotX);
    baseLine.setAttribute('y1', groundY);
    baseLine.setAttribute('x2', pivotX + obj.width);
    baseLine.setAttribute('y2', groundY);
    baseLine.setAttribute('stroke', colors.purple);
    baseLine.setAttribute('stroke-width', '4');
    svg.appendChild(baseLine);

    // Draw object outline
    const gObj = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    gObj.setAttribute('transform', `rotate(${-angle}, ${pivotX}, ${groundY})`);

    const strokeColor = colors.purple;

    if (objectKey === 'box-tall' || objectKey === 'box-wide') {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', pivotX);
      rect.setAttribute('y', groundY - obj.height);
      rect.setAttribute('width', obj.width);
      rect.setAttribute('height', obj.height);
      rect.setAttribute('fill', 'rgba(139, 92, 246, 0.04)');
      rect.setAttribute('stroke', strokeColor);
      rect.setAttribute('stroke-width', '2');
      gObj.appendChild(rect);
    } else if (objectKey === 'cone') {
      const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      poly.setAttribute('points', `${pivotX},${groundY} ${pivotX + obj.width},${groundY} ${pivotX + obj.width/2},${groundY - obj.height}`);
      poly.setAttribute('fill', 'none');
      poly.setAttribute('stroke', strokeColor);
      poly.setAttribute('stroke-width', '2');
      gObj.appendChild(poly);
    } else if (objectKey === 'racing-car') {
      const carBody = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      carBody.setAttribute('x', pivotX);
      carBody.setAttribute('y', groundY - obj.height);
      carBody.setAttribute('width', obj.width);
      carBody.setAttribute('height', obj.height);
      carBody.setAttribute('fill', 'none');
      carBody.setAttribute('stroke', strokeColor);
      carBody.setAttribute('stroke-width', '2');
      gObj.appendChild(carBody);
    }

    svg.appendChild(gObj);

    // CG Dot and Line
    const unrotatedCGX = pivotX + obj.width / 2;
    const unrotatedCGY = groundY - obj.cgY;
    const currentCG = getRotatedPoint(pivotX, groundY, unrotatedCGX, unrotatedCGY, angle);

    drawCGElements(svg, currentCG, groundY, colors.purple, 5);

    // Draw base limit indicator (pivot dot at bottom-left)
    const pivotDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    pivotDot.setAttribute('cx', pivotX);
    pivotDot.setAttribute('cy', groundY);
    pivotDot.setAttribute('r', '4');
    pivotDot.setAttribute('fill', colors.yellow);
    svg.appendChild(pivotDot);
  }

  // Helper for drawing shapes in comparison quiz
  function drawObjectShape(svg, shapeType, x, groundY, w, h, color) {
    if (shapeType === 'cone') {
      const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      poly.setAttribute('points', `${x},${groundY} ${x + w},${groundY} ${x + w/2},${groundY - h}`);
      poly.setAttribute('fill', 'none');
      poly.setAttribute('stroke', color);
      poly.setAttribute('stroke-width', '2');
      svg.appendChild(poly);
    } else if (shapeType === 'cone-inverted') {
      const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      // Tip at bottom (x + w/2, groundY), flat base at top (x to x + w at groundY - h)
      poly.setAttribute('points', `${x},${groundY - h} ${x + w},${groundY - h} ${x + w/2},${groundY}`);
      poly.setAttribute('fill', 'none');
      poly.setAttribute('stroke', color);
      poly.setAttribute('stroke-width', '2');
      svg.appendChild(poly);
    } else if (shapeType === 'cylinder') {
      const r = w / 2;
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', x + r);
      circle.setAttribute('cy', groundY - r);
      circle.setAttribute('r', r);
      circle.setAttribute('fill', 'none');
      circle.setAttribute('stroke', color);
      circle.setAttribute('stroke-width', '2');
      svg.appendChild(circle);
    } else {
      // default rectangle
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', x);
      rect.setAttribute('y', groundY - h);
      rect.setAttribute('width', w);
      rect.setAttribute('height', h);
      rect.setAttribute('fill', 'rgba(255, 255, 255, 0.02)');
      rect.setAttribute('stroke', color);
      rect.setAttribute('stroke-width', '2');
      svg.appendChild(rect);
    }
  }

  // Draw Comparison SVG (Type B)
  function drawQuizComparisonSVG(qIndex) {
    const svg = document.getElementById('svg-quiz');
    if (!svg) return;
    svg.innerHTML = '';

    const q = quizQuestions[qIndex];
    if (!q) return;

    const groundY = 180;
    const scale = 0.55; // Scale down dimensions to fit nicely inside 350x250

    // Properties for X
    const xW = (q.xW || 50) * scale;
    const xH = (q.xH || 100) * scale;
    const xCG = (q.xCG || 50) * scale;
    const xShape = q.xShape || 'rect';

    // Properties for Y
    const yW = (q.yW || 90) * scale;
    const yH = (q.yH || 70) * scale;
    const yCG = (q.yCG || 35) * scale;
    const yShape = q.yShape || 'rect';

    // Draw Ground
    const ground = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    ground.setAttribute('x1', '20');
    ground.setAttribute('y1', groundY);
    ground.setAttribute('x2', '330');
    ground.setAttribute('y2', groundY);
    ground.setAttribute('stroke', '#334155');
    ground.setAttribute('stroke-width', '3');
    svg.appendChild(ground);

    // Draw Object X (centered at x = 80)
    const startX = 80 - xW / 2;
    drawObjectShape(svg, xShape, startX, groundY, xW, xH, colors.cyan);
    
    // Draw Object X CG
    const cgX = { x: 80, y: groundY - xCG };
    drawCGElements(svg, cgX, groundY, colors.cyan, 4);
    drawText(svg, 80, groundY + 22, `X: W=${q.xW}mm, CG=${q.xCG}mm`, colors.cyan, '11px', 'middle');

    // Draw Object Y (centered at x = 240)
    const startY = 240 - yW / 2;
    drawObjectShape(svg, yShape, startY, groundY, yW, yH, colors.purple);

    // Draw Object Y CG
    const cgY = { x: 240, y: groundY - yCG };
    drawCGElements(svg, cgY, groundY, colors.purple, 4);
    drawText(svg, 240, groundY + 22, `Y: W=${q.yW}mm, CG=${q.yCG}mm`, colors.purple, '11px', 'middle');
  }

  function submitAnswer() {
    btnSubmitAnswer.classList.add('hide');
    btnNextQuestion.classList.remove('hide');

    const q = quizQuestions[currentQuestionIndex];
    let isCorrect = false;

    if (q.type === 'A') {
      isCorrect = (selectedOption === q.correctOption);
      if (isCorrect) {
        userScore++;
        triggerConfetti();
        showFeedback(true, 'Correct!', q.explanation);
      } else {
        showFeedback(false, 'Incorrect', q.explanation);
      }
    } else if (q.type === 'B') {
      isCorrect = (selectedOption === q.correctIndex);
      if (isCorrect) {
        userScore++;
        triggerConfetti();
        showFeedback(true, 'Correct!', q.explanation);
      } else {
        showFeedback(false, 'Incorrect', q.explanation);
      }
    } else if (q.type === 'C') {
      // Type C is unscored but checklist based
      showFeedback(null, 'Model Answer Guide', q.explanation);
      renderTypeCChecklist(q.checklist);
    }

    quizScoreText.textContent = `Score: ${userScore}`;
  }

  function showFeedback(status, title, desc) {
    quizFeedbackBox.className = 'quiz-feedback-box';
    const titleEl = document.getElementById('feedback-title');
    const descEl = document.getElementById('feedback-desc');

    titleEl.textContent = title;
    descEl.textContent = desc;

    if (status === true) {
      quizFeedbackBox.classList.add('correct');
    } else if (status === false) {
      quizFeedbackBox.classList.add('incorrect');
    } else {
      quizFeedbackBox.classList.add('neutral');
    }
    quizFeedbackBox.classList.remove('hide');
  }

  function renderTypeCChecklist(items) {
    typeCChecklist.classList.remove('hide');
    checklistItems.innerHTML = '';
    items.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'checklist-item';

      const chk = document.createElement('input');
      chk.type = 'checkbox';
      chk.id = `chk-point-${index}`;

      const label = document.createElement('label');
      label.setAttribute('for', `chk-point-${index}`);
      label.textContent = item;

      div.appendChild(chk);
      div.appendChild(label);
      checklistItems.appendChild(div);
    });
  }

  function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < 30) {
      showQuestion();
    } else {
      endQuiz();
    }
  }

  function endQuiz() {
    quizGamePanel.classList.add('hide');
    quizResultsCard.classList.remove('hide');

    const scoreFraction = document.getElementById('results-score');
    const gradeMsg = document.getElementById('results-grade-msg');
    
    scoreFraction.textContent = `${userScore} / 20`;

    // 3-tier grade boundaries
    if (userScore >= 17) {
      gradeMsg.textContent = 'Excellent — you have mastered stability!';
      gradeMsg.style.color = colors.green;
      triggerConfetti();
    } else if (userScore >= 10) {
      gradeMsg.textContent = 'Good effort — review the explanations and try again.';
      gradeMsg.style.color = colors.yellow;
    } else {
      gradeMsg.textContent = 'Keep practising — revisit the stability explorer in Section 2.';
      gradeMsg.style.color = colors.pink;
    }
  }


  // ----------------------------------------------------
  // SECTION 5: FLASHCARD REVISION MODE
  // ----------------------------------------------------
  const flashcardElement = document.getElementById('flashcard-element');
  const flashcardQ = document.getElementById('flashcard-q');
  const flashcardA = document.getElementById('flashcard-a');
  const btnPrevCard = document.getElementById('btn-prev-card');
  const btnNextCard = document.getElementById('btn-next-card');
  const cardCounter = document.getElementById('card-counter');
  const btnShuffleCards = document.getElementById('btn-shuffle-cards');

  const flashcardData = [
    {
      q: "What is stable equilibrium?",
      a: "An object is in stable equilibrium if it returns to its original position after a slight displacement."
    },
    {
      q: "What is unstable equilibrium?",
      a: "An object is in unstable equilibrium if it topples and moves away from its original position after a slight displacement."
    },
    {
      q: "What is neutral equilibrium?",
      a: "An object is in neutral equilibrium if it remains in its new position when displaced, keeping its CG height constant."
    },
    {
      q: "Name the two primary factors that determine stability.",
      a: "1. The width of the base of support.\n2. The height of the centre of gravity."
    },
    {
      q: "State the Tipping Rule for stability.",
      a: "If the vertical line of action from the centre of gravity falls outside the base, the object will topple. If it falls within, it returns upright."
    },
    {
      q: "Why does a wider base increase stability?",
      a: "A wider base requires a larger angle of tilt before the vertical line from the CG passes beyond the edge of the base."
    },
    {
      q: "Why does a lower Centre of Gravity (CG) increase stability?",
      a: "A lower CG reduces the distance of the CG from the base, increasing the angle of tilt required for the CG line to fall outside the base."
    },
    {
      q: "Explain why racing cars have low centres of gravity.",
      a: "A low CG keeps the vertical line from the CG within the wheel base, preventing toppling when going fast or tilting on sharp turns."
    },
    {
      q: "Why is a cone resting on its base more stable than a cone on its tip?",
      a: "On its base, the cone has a very wide base and a low CG. On its tip, its base is reduced to a single point, and its CG is extremely high."
    },
    {
      q: "Explain how to increase the stability of a tall thin box.",
      a: "1. Add weight at the bottom to lower its CG.\n2. Widen the base width (e.g. by adding base extensions)."
    },
    {
      q: "What path does the CG of a cylinder follow as it rolls?",
      a: "The CG travels horizontally at a constant height above the surface."
    },
    {
      q: "Explain the common mistake: 'Heavy objects are always more stable.'",
      a: "Weight does not determine stability directly. A very heavy object with a high CG and narrow base tips easily (e.g., a tall bookshelf)."
    }
  ];

  function initFlashcards() {
    flashcards = [...flashcardData];
    currentCardIndex = 0;
    showCard();
  }

  function showCard() {
    flashcardElement.classList.remove('flipped');
    setTimeout(() => {
      const card = flashcards[currentCardIndex];
      flashcardQ.textContent = card.q;
      flashcardA.textContent = card.a;
      cardCounter.textContent = `${currentCardIndex + 1} / ${flashcards.length}`;
    }, 150); // short delay to sync during flips
  }

  flashcardElement.addEventListener('click', () => {
    flashcardElement.classList.toggle('flipped');
  });

  btnPrevCard.addEventListener('click', () => {
    if (currentCardIndex > 0) {
      currentCardIndex--;
      showCard();
    }
  });

  btnNextCard.addEventListener('click', () => {
    if (currentCardIndex < flashcards.length - 1) {
      currentCardIndex++;
      showCard();
    }
  });

  btnShuffleCards.addEventListener('click', () => {
    flashcards.sort(() => Math.random() - 0.5);
    currentCardIndex = 0;
    showCard();
  });


  // ----------------------------------------------------
  // CELEBRATION EFFECTS (CONFETTI)
  // ----------------------------------------------------
  const canvas = document.getElementById('particles-overlay');
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
    constructor() {
      this.x = canvas.width / 2 + (Math.random() - 0.5) * 100;
      this.y = canvas.height / 2 + (Math.random() - 0.5) * 50;
      this.vx = (Math.random() - 0.5) * 15;
      this.vy = (Math.random() - 0.8) * 15;
      this.radius = Math.random() * 6 + 4;
      this.color = [colors.green, colors.cyan, colors.purple, colors.yellow][Math.floor(Math.random() * 4)];
      this.alpha = 1;
      this.decay = Math.random() * 0.02 + 0.015;
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;
      ctx.fill();
      ctx.restore();
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.2; // gravity effect
      this.alpha -= this.decay;
    }
  }

  function triggerConfetti() {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    particles = [];
    for (let i = 0; i < 60; i++) {
      particles.push(new Particle());
    }
    animateConfetti();
  }

  function animateConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles = particles.filter(p => p.alpha > 0);
    particles.forEach(p => {
      p.update();
      p.draw();
    });

    if (particles.length > 0) {
      animationFrameId = requestAnimationFrame(animateConfetti);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  // Initial Bootstrapping
  initConceptIntroVisuals();
  initFlashcards();
});
