// Converging Lens App - O-Level Physics

document.addEventListener('DOMContentLoaded', () => {
  // Navigation
  const navButtons = document.querySelectorAll('.nav-btn');
  const sections = document.querySelectorAll('.app-section');

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetSection = btn.getAttribute('data-section');
      
      navButtons.forEach(b => b.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));
      
      btn.classList.add('active');
      const targetEl = document.getElementById(targetSection);
      targetEl.classList.add('active');
      
      // Trigger section initializations if any
      if (targetSection === 'explore') {
        initSliderMode();
        initDragMode();
      } else if (targetSection === 'examples') {
        initWorkedExamples();
      } else if (targetSection === 'flashcards') {
        initFlashcards();
      } else if (targetSection === 'quiz') {
        initQuiz();
      }
    });
  });

  // Exploration Tabs
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(tc => tc.classList.remove('active'));
      
      btn.classList.add('active');
      document.getElementById(targetTab).classList.add('active');
      
      if (targetTab === 'slider-mode') {
        initSliderMode();
      } else {
        initDragMode();
      }
    });
  });

  // Physics constants
  const F_LENGTH = 100; // Focal length in SVG pixels
  const C_X = 400;      // Center X
  const C_Y = 175;      // Center Y (Principal Axis)
  const OBJ_H = 60;     // Object height in SVG pixels

  // Helper: Get image position and properties
  function calculateImageProperties(uVal) {
    const u = uVal;
    const f = F_LENGTH;
    
    let v, mag, h_img, x_img, y_img;
    let nature = '';
    let orientation = '';
    let size = '';
    let zone = '';

    // Classify zone
    if (u > 2 * f) {
      zone = 'u > 2f';
      nature = 'Real';
      orientation = 'Inverted';
      size = 'Diminished';
    } else if (Math.abs(u - 2 * f) < 2) {
      zone = 'u = 2f';
      nature = 'Real';
      orientation = 'Inverted';
      size = 'Same Size';
    } else if (u > f && u < 2 * f) {
      zone = 'f < u < 2f';
      nature = 'Real';
      orientation = 'Inverted';
      size = 'Magnified';
    } else if (Math.abs(u - f) < 2) {
      zone = 'u = f';
      nature = 'Virtual';
      orientation = 'No image formed';
      size = 'At Infinity';
    } else if (u < f) {
      zone = 'u < f';
      nature = 'Virtual';
      orientation = 'Upright';
      size = 'Magnified';
    }

    if (zone === 'u = F') {
      v = Infinity;
      mag = Infinity;
      h_img = 0;
      x_img = null;
      y_img = null;
    } else {
      v = (u * f) / (u - f);
      mag = -v / u;
      h_img = mag * OBJ_H;
      x_img = C_X + v;
      y_img = C_Y - h_img;
    }

    return { u, v, mag, h_img, x_img, y_img, nature, orientation, size, zone };
  }

  // -------------------------------------------------------------
  // TAB A: SLIDER MODE
  // -------------------------------------------------------------
  const uSlider = document.getElementById('u-slider');
  const sliderUValLabel = document.getElementById('slider-u-val');
  const sliderZoneBadge = document.getElementById('slider-zone-badge');
  const statNature = document.getElementById('stat-nature');
  const statOrientation = document.getElementById('stat-orientation');
  const statSize = document.getElementById('stat-size');

  const sliderObjectGroup = document.getElementById('slider-object');
  const sliderRaysGroup = document.getElementById('slider-rays');
  const sliderImageGroup = document.getElementById('slider-image');

  function initSliderMode() {
    updateSliderVisualization();
  }

  if (uSlider) {
    uSlider.addEventListener('input', updateSliderVisualization);
  }

  function updateSliderVisualization() {
    const uVal = parseInt(uSlider.value);
    const props = calculateImageProperties(uVal);

    // Update labels
    sliderUValLabel.textContent = `u = ${uVal}px (${(uVal/F_LENGTH).toFixed(1)}f)`;
    sliderZoneBadge.textContent = `Zone: ${props.zone}`;
    statNature.textContent = props.nature;
    statOrientation.textContent = props.orientation;
    statSize.textContent = props.size;

    // Render Object
    const objX = C_X - props.u;
    const objTipY = C_Y - OBJ_H;
    sliderObjectGroup.innerHTML = `
      <!-- Object Arrow -->
      <line x1="${objX}" y1="${C_Y}" x2="${objX}" y2="${objTipY}" stroke="#ffd600" stroke-width="4" marker-end="url(#arrow-head)" />
      <text x="${objX}" y="${C_Y - OBJ_H - 12}" class="label-text" fill="#ffd600">Object</text>
    `;

    // Reset paths
    sliderRaysGroup.innerHTML = '';
    sliderImageGroup.innerHTML = '';

    if (props.zone === 'u = f') {
      // Parallel rays to infinity
      sliderRaysGroup.innerHTML = `
        <!-- Ray 1 (Parallel then Focal) -->
        <path d="M ${objX} ${objTipY} L ${C_X} ${objTipY} L ${C_X + 200} ${C_Y + OBJ_H}" class="ray-line" />
        <!-- Ray 2 (Optical Center) -->
        <path d="M ${objX} ${objTipY} L ${C_X + 200} ${C_Y + OBJ_H}" class="ray-line" />
      `;
    } else if (props.u < F_LENGTH) {
      // Virtual image - Virtual/extrapolated rays backwards
      const backX = props.x_img;
      const backY = props.y_img;

      sliderRaysGroup.innerHTML = `
        <!-- Ray 1 (Parallel then Focal forward) -->
        <path d="M ${objX} ${objTipY} L ${C_X} ${objTipY} L 780 ${C_Y + (780 - (C_X + F_LENGTH)) * (OBJ_H/F_LENGTH)}" class="ray-line" />
        <!-- Ray 1 backward extrapolation -->
        <path d="M ${C_X} ${objTipY} L ${backX} ${backY}" class="ray-line ray-virtual" />
        
        <!-- Ray 2 (Optical Center forward) -->
        <path d="M ${objX} ${objTipY} L 780 ${C_Y + (780 - C_X) * (OBJ_H/props.u)}" class="ray-line" />
        <!-- Ray 2 backward extrapolation -->
        <path d="M ${C_X} ${C_Y} L ${backX} ${backY}" class="ray-line ray-virtual" />
      `;

      // Draw Virtual Image (dotted arrow pointing up)
      sliderImageGroup.innerHTML = `
        <line x1="${backX}" y1="${C_Y}" x2="${backX}" y2="${backY}" stroke="#00e5ff" stroke-width="3" stroke-dasharray="3 3" marker-end="url(#arrow-head-inverted)" />
        <text x="${backX}" y="${backY - 12}" class="label-text" fill="#00e5ff">Virtual Image</text>
      `;
    } else {
      // Real image - normal intersecting rays
      const imgX = props.x_img;
      const imgY = props.y_img;

      sliderRaysGroup.innerHTML = `
        <!-- Ray 1 (Parallel then Focal) -->
        <path d="M ${objX} ${objTipY} L ${C_X} ${objTipY} L 750 ${C_Y + (750 - (C_X + F_LENGTH)) * (OBJ_H/F_LENGTH)}" class="ray-line" />
        <!-- Ray 2 (Optical Center) -->
        <path d="M ${objX} ${objTipY} L 750 ${C_Y + (750 - C_X) * (-props.h_img/props.v)}" class="ray-line" />
      `;

      // Draw Real Image (solid arrow pointing down)
      sliderImageGroup.innerHTML = `
        <line x1="${imgX}" y1="${C_Y}" x2="${imgX}" y2="${imgY}" stroke="#00e5ff" stroke-width="3.5" marker-end="url(#arrow-head-inverted)" />
        <text x="${imgX}" y="${imgY + 18}" class="label-text" fill="#00e5ff">Real Image</text>
      `;
    }
  }

  // -------------------------------------------------------------
  // TAB B: DRAG-TO-CONSTRUCT MODE
  // -------------------------------------------------------------
  let dragZone = '';
  let dragU = 200; // default (u = 2F)
  let ray1Part1Done = false;
  let ray1Part2Done = false;
  let ray2Done = false;
  let activeDrawingType = ''; // 'ray1_1', 'ray1_2', 'ray2'
  let drawStartX = 0, drawStartY = 0;

  const dragSvg = document.getElementById('drag-svg');
  const dragObjGroup = document.getElementById('drag-object');
  const dragFeedbackRays = document.getElementById('drag-feedback-rays');
  const dragHotspots = document.getElementById('drag-hotspots');
  const dragResultImage = document.getElementById('drag-result-image');
  const activeDrawLine = document.getElementById('active-draw-line');
  const btnHint = document.getElementById('btn-hint');
  const btnResetDrag = document.getElementById('btn-reset-drag');
  const dragTaskText = document.getElementById('drag-task-text');

  const dragZonesList = [
    { zone: 'u > 2f', u: 260, text: 'Draw construction rays for an object placed beyond 2f (u > 2f).' },
    { zone: 'f < u < 2f', u: 150, text: 'Draw construction rays for an object placed between f and 2f (f < u < 2f).' },
    { zone: 'u < f', u: 50, text: 'Draw construction rays for an object placed within f (u < f).' }
  ];

  function initDragMode() {
    // Pick random zone
    const chosen = dragZonesList[Math.floor(Math.random() * dragZonesList.length)];
    dragZone = chosen.zone;
    dragU = chosen.u;
    dragTaskText.textContent = chosen.text;

    ray1Part1Done = false;
    ray1Part2Done = false;
    ray2Done = false;
    activeDrawingType = '';
    
    dragFeedbackRays.innerHTML = '';
    dragResultImage.innerHTML = '';
    dragResultImage.setAttribute('display', 'none');

    // Draw object
    const objX = C_X - dragU;
    const objTipY = C_Y - OBJ_H;
    dragObjGroup.innerHTML = `
      <line x1="${objX}" y1="${C_Y}" x2="${objX}" y2="${objTipY}" stroke="#ffd600" stroke-width="4" marker-end="url(#arrow-head)" />
      <text x="${objX}" y="${objTipY - 12}" class="label-text" fill="#ffd600">Object</text>
    `;

    setupDragHotspots();
  }

  function setupDragHotspots() {
    const objX = C_X - dragU;
    const objTipY = C_Y - OBJ_H;

    // Draw target snap targets (interactive circles)
    dragHotspots.innerHTML = `
      <!-- Object Tip Start/Hotspot -->
      <circle cx="${objX}" cy="${objTipY}" r="12" class="snap-hotspot" id="hs-obj-tip" data-point="tip" />
      <!-- Lens intersection height of parallel ray -->
      <circle cx="${C_X}" cy="${objTipY}" r="12" class="snap-hotspot" id="hs-lens-parallel" data-point="lens-parallel" />
      <!-- Focal Point (right) -->
      <circle cx="${C_X + F_LENGTH}" cy="${C_Y}" r="12" class="snap-hotspot" id="hs-focus" data-point="focus" />
      <!-- Optical Center -->
      <circle cx="${C_X}" cy="${C_Y}" r="12" class="snap-hotspot" id="hs-optical-center" data-point="center" />
    `;

    // Hotspot event listeners
    const hotspots = dragHotspots.querySelectorAll('.snap-hotspot');
    hotspots.forEach(hs => {
      hs.addEventListener('mousedown', startDrawingRay);
      hs.addEventListener('touchstart', startDrawingRay, { passive: false });
    });
  }

  function startDrawingRay(e) {
    e.preventDefault();
    const touch = e.type === 'touchstart' ? e.touches[0] : e;
    const rect = dragSvg.getBoundingClientRect();
    const scaleX = 800 / rect.width;
    const scaleY = 350 / rect.height;

    const clickX = (touch.clientX - rect.left) * scaleX;
    const clickY = (touch.clientY - rect.top) * scaleY;

    const sourcePoint = e.target.getAttribute('data-point');
    const objTipX = C_X - dragU;
    const objTipY = C_Y - OBJ_H;

    // Determine what ray is being drawn
    if (sourcePoint === 'tip') {
      // Can draw either Ray 1 (part 1) to Lens Parallel or Ray 2 to Optical Center
      drawStartX = objTipX;
      drawStartY = objTipY;
      activeDrawingType = 'from_tip';
    } else if (sourcePoint === 'lens-parallel' && ray1Part1Done && !ray1Part2Done) {
      // Part 2 of Ray 1
      drawStartX = C_X;
      drawStartY = objTipY;
      activeDrawingType = 'ray1_2';
    } else {
      return; // invalid start
    }

    activeDrawLine.setAttribute('x1', drawStartX);
    activeDrawLine.setAttribute('y1', drawStartY);
    activeDrawLine.setAttribute('x2', clickX);
    activeDrawLine.setAttribute('y2', clickY);
    activeDrawLine.setAttribute('display', 'block');

    window.addEventListener('mousemove', moveDrawingRay);
    window.addEventListener('mouseup', stopDrawingRay);
    window.addEventListener('touchmove', moveDrawingRay, { passive: false });
    window.addEventListener('touchend', stopDrawingRay);
  }

  function moveDrawingRay(e) {
    if (!activeDrawingType) return;
    const touch = e.type === 'touchmove' ? e.touches[0] : e;
    const rect = dragSvg.getBoundingClientRect();
    const scaleX = 800 / rect.width;
    const scaleY = 350 / rect.height;

    const currentX = (touch.clientX - rect.left) * scaleX;
    const currentY = (touch.clientY - rect.top) * scaleY;

    activeDrawLine.setAttribute('x2', currentX);
    activeDrawLine.setAttribute('y2', currentY);
  }

  function stopDrawingRay(e) {
    if (!activeDrawingType) return;
    
    const rect = dragSvg.getBoundingClientRect();
    const scaleX = 800 / rect.width;
    const scaleY = 350 / rect.height;

    // Get end coordinates from mouseup/touchend
    let endX, endY;
    if (e.type === 'touchend') {
      endX = parseFloat(activeDrawLine.getAttribute('x2'));
      endY = parseFloat(activeDrawLine.getAttribute('y2'));
    } else {
      endX = (e.clientX - rect.left) * scaleX;
      endY = (e.clientY - rect.top) * scaleY;
    }

    activeDrawLine.setAttribute('display', 'none');
    window.removeEventListener('mousemove', moveDrawingRay);
    window.removeEventListener('mouseup', stopDrawingRay);
    window.removeEventListener('touchmove', moveDrawingRay);
    window.removeEventListener('touchend', stopDrawingRay);

    // Find if endpoint is close to any key hotspots
    const objTipY = C_Y - OBJ_H;
    const targets = {
      'lens-parallel': { x: C_X, y: objTipY },
      'center': { x: C_X, y: C_Y },
      'focus': { x: C_X + F_LENGTH, y: C_Y }
    };

    let matchedTarget = null;
    for (const [key, target] of Object.entries(targets)) {
      const dist = Math.hypot(endX - target.x, endY - target.y);
      if (dist < 25) { // Snapping threshold
        matchedTarget = key;
        break;
      }
    }

    if (activeDrawingType === 'from_tip') {
      if (matchedTarget === 'lens-parallel' && !ray1Part1Done) {
        // Successful Ray 1 part 1
        ray1Part1Done = true;
        dragFeedbackRays.innerHTML += `<line x1="${C_X - dragU}" y1="${objTipY}" x2="${C_X}" y2="${objTipY}" class="ray-line" />`;
        // Make snap visual indicator
        document.getElementById('hs-lens-parallel').classList.add('snap-success');
      } else if (matchedTarget === 'center' && !ray2Done) {
        // Successful Ray 2
        ray2Done = true;
        // Extend line through optical center
        const extendX = 750;
        const extendY = C_Y + (extendX - C_X) * (OBJ_H / dragU);
        dragFeedbackRays.innerHTML += `<line x1="${C_X - dragU}" y1="${objTipY}" x2="${extendX}" y2="${extendY}" class="ray-line" />`;
        document.getElementById('hs-optical-center').classList.add('snap-success');
      }
    } else if (activeDrawingType === 'ray1_2') {
      if (matchedTarget === 'focus' && !ray1Part2Done) {
        // Successful Ray 1 part 2
        ray1Part2Done = true;
        const extendX = 750;
        const extendY = C_Y + (extendX - (C_X + F_LENGTH)) * (OBJ_H / F_LENGTH);
        dragFeedbackRays.innerHTML += `<line x1="${C_X}" y1="${objTipY}" x2="${extendX}" y2="${extendY}" class="ray-line" />`;
        document.getElementById('hs-focus').classList.add('snap-success');
      }
    }

    activeDrawingType = '';
    checkDragSuccess();
  }

  function checkDragSuccess() {
    if (ray1Part1Done && ray1Part2Done && ray2Done) {
      // Complete! Reveal Image and trigger confetti celebration
      const props = calculateImageProperties(dragU);
      const isVirtual = dragU < F_LENGTH;

      if (isVirtual) {
        // Draw virtual extrapolations and virtual image
        dragFeedbackRays.innerHTML += `
          <!-- Extrapolations -->
          <path d="M ${C_X} ${C_Y - OBJ_H} L ${props.x_img} ${props.y_img}" class="ray-line ray-virtual" />
          <path d="M ${C_X} ${C_Y} L ${props.x_img} ${props.y_img}" class="ray-line ray-virtual" />
        `;
        dragResultImage.innerHTML = `
          <line x1="${props.x_img}" y1="${C_Y}" x2="${props.x_img}" y2="${props.y_img}" stroke="#00e5ff" stroke-width="3" stroke-dasharray="3 3" marker-end="url(#arrow-head-inverted)" />
          <text x="${props.x_img}" y="${props.y_img - 12}" class="label-text" fill="#00e5ff">Virtual Image</text>
        `;
      } else {
        dragResultImage.innerHTML = `
          <line x1="${props.x_img}" y1="${C_Y}" x2="${props.x_img}" y2="${props.y_img}" stroke="#00e5ff" stroke-width="3.5" marker-end="url(#arrow-head-inverted)" />
          <text x="${props.x_img}" y="${props.y_img + 18}" class="label-text" fill="#00e5ff">Real Image</text>
        `;
      }

      dragResultImage.setAttribute('display', 'block');
      
      // Remove all snap circles
      dragHotspots.innerHTML = '';

      // Confetti celebration
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#00e5ff', '#ffd600', '#ffffff']
      });
    }
  }

  if (btnHint) {
    btnHint.addEventListener('click', () => {
      // Force render standard rays as visual help
      const objTipY = C_Y - OBJ_H;
      const extendX = 750;
      const r1ExtendY = C_Y + (extendX - (C_X + F_LENGTH)) * (OBJ_H / F_LENGTH);
      const r2ExtendY = C_Y + (extendX - C_X) * (OBJ_H / dragU);

      dragFeedbackRays.innerHTML = `
        <line x1="${C_X - dragU}" y1="${objTipY}" x2="${C_X}" y2="${objTipY}" class="ray-line" stroke-dasharray="3 3" />
        <line x1="${C_X}" y1="${objTipY}" x2="${extendX}" y2="${r1ExtendY}" class="ray-line" stroke-dasharray="3 3" />
        <line x1="${C_X - dragU}" y1="${objTipY}" x2="${extendX}" y2="${r2ExtendY}" class="ray-line" stroke-dasharray="3 3" />
      `;
    });
  }

  if (btnResetDrag) {
    btnResetDrag.addEventListener('click', initDragMode);
  }


  // -------------------------------------------------------------
  // SECTION 3: WORKED EXAMPLES
  // -------------------------------------------------------------
  let currentExample = 1;
  let currentStep = 1;
  const totalSteps = 4;

  const exampleSvg = document.getElementById('example-svg');
  const exElementsGroup = document.getElementById('ex-elements');
  const currentStepNum = document.getElementById('current-step-num');
  const stepDescription = document.getElementById('step-description');
  const btnPrevStep = document.getElementById('btn-prev-step');
  const btnNextStep = document.getElementById('btn-next-step');
  const exampleButtons = document.querySelectorAll('.ex-btn');

  const examplesData = {
    1: {
      u: 250,
      title: 'Object beyond 2f (u > 2f)',
      steps: [
        { desc: 'Place the object beyond 2f (u = 2.5f). A real object is drawn pointing upwards.', code: (u) => drawExampleStep1(u) },
        { desc: 'Draw Ray 1: Runs parallel to the principal axis to the lens plane, then refracts down through the principal focus (f).', code: (u) => drawExampleStep2(u) },
        { desc: 'Draw Ray 2: Passes straight through the optical center (C) without bending.', code: (u) => drawExampleStep3(u) },
        { desc: 'The real image is formed at the intersection of the rays. It is <strong>Real, Inverted, and Diminished</strong>.', code: (u) => drawExampleStep4(u) }
      ]
    },
    2: {
      u: 150,
      title: 'Object between f and 2f (f < u < 2f)',
      steps: [
        { desc: 'Place the object between f and 2f (u = 1.5f). A real object is drawn pointing upwards.', code: (u) => drawExampleStep1(u) },
        { desc: 'Draw Ray 1: Parallel to principal axis, then refracts down through the focus (f).', code: (u) => drawExampleStep2(u) },
        { desc: 'Draw Ray 2: Passes straight through the optical center (C).', code: (u) => drawExampleStep3(u) },
        { desc: 'The real image forms where the rays meet. It is <strong>Real, Inverted, and Magnified</strong>.', code: (u) => drawExampleStep4(u) }
      ]
    },
    3: {
      u: 50,
      title: 'Object within f (u < f)',
      steps: [
        { desc: 'Place the object within the focal length (u = 0.5f). A real object is drawn pointing upwards.', code: (u) => drawExampleStep1(u) },
        { desc: 'Draw Ray 1: Parallel to the axis, then refracts through f. Extrapolate this ray backward (dashed line).', code: (u) => drawExampleStep1Virtual(u, 1) },
        { desc: 'Draw Ray 2: Passes through C. Extrapolate this ray backward (dashed line) to meet the first virtual ray.', code: (u) => drawExampleStep1Virtual(u, 2) },
        { desc: 'The virtual image forms where the extrapolated lines intersect. It is <strong>Virtual, Upright, and Magnified</strong>.', code: (u) => drawExampleStep1Virtual(u, 3) }
      ]
    }
  };

  function initWorkedExamples() {
    renderExampleStep();
  }

  exampleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      exampleButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentExample = parseInt(btn.getAttribute('data-ex'));
      currentStep = 1;
      renderExampleStep();
    });
  });

  if (btnNextStep) {
    btnNextStep.addEventListener('click', () => {
      if (currentStep < totalSteps) {
        currentStep++;
        renderExampleStep();
      }
    });
  }

  if (btnPrevStep) {
    btnPrevStep.addEventListener('click', () => {
      if (currentStep > 1) {
        currentStep--;
        renderExampleStep();
      }
    });
  }

  function renderExampleStep() {
    const ex = examplesData[currentExample];
    const step = ex.steps[currentStep - 1];

    currentStepNum.textContent = currentStep;
    stepDescription.innerHTML = step.desc;

    // Enable/disable navigation buttons
    btnPrevStep.disabled = currentStep === 1;
    btnNextStep.disabled = currentStep === totalSteps;

    // Render step geometry
    exElementsGroup.innerHTML = '';
    step.code(ex.u);
  }

  // Worked Example Drawing Actions
  function drawExampleStep1(u) {
    const objX = C_X - u;
    const objTipY = C_Y - OBJ_H;
    exElementsGroup.innerHTML = `
      <line x1="${objX}" y1="${C_Y}" x2="${objX}" y2="${objTipY}" stroke="#ffd600" stroke-width="4" marker-end="url(#arrow-head)" />
      <text x="${objX}" y="${objTipY - 12}" class="label-text" fill="#ffd600">Object</text>
    `;
  }

  function drawExampleStep2(u) {
    drawExampleStep1(u);
    const objTipY = C_Y - OBJ_H;
    const extendX = 750;
    const extendY = C_Y + (extendX - (C_X + F_LENGTH)) * (OBJ_H / F_LENGTH);
    exElementsGroup.innerHTML += `
      <path d="M ${C_X - u} ${objTipY} L ${C_X} ${objTipY} L ${extendX} ${extendY}" class="ray-line" />
    `;
  }

  function drawExampleStep3(u) {
    drawExampleStep2(u);
    const objTipY = C_Y - OBJ_H;
    const extendX = 750;
    const extendY = C_Y + (extendX - C_X) * (OBJ_H / u);
    exElementsGroup.innerHTML += `
      <path d="M ${C_X - u} ${objTipY} L ${extendX} ${extendY}" class="ray-line" />
    `;
  }

  function drawExampleStep4(u) {
    drawExampleStep3(u);
    const props = calculateImageProperties(u);
    exElementsGroup.innerHTML += `
      <line x1="${props.x_img}" y1="${C_Y}" x2="${props.x_img}" y2="${props.y_img}" stroke="#00e5ff" stroke-width="3.5" marker-end="url(#arrow-head-inverted)" />
      <text x="${props.x_img}" y="${props.y_img + (props.h_img < 0 ? 18 : -12)}" class="label-text" fill="#00e5ff">Real Image</text>
    `;
  }

  function drawExampleStep1Virtual(u, phase) {
    const objTipY = C_Y - OBJ_H;
    const props = calculateImageProperties(u);
    const backX = props.x_img;
    const backY = props.y_img;

    // Draw object
    drawExampleStep1(u);

    if (phase >= 1) {
      // Draw ray 1 forward and backward
      exElementsGroup.innerHTML += `
        <path d="M ${C_X - u} ${objTipY} L ${C_X} ${objTipY} L 750 ${C_Y + (750 - (C_X + F_LENGTH)) * (OBJ_H/F_LENGTH)}" class="ray-line" />
        <path d="M ${C_X} ${objTipY} L ${backX} ${backY}" class="ray-line ray-virtual" />
      `;
    }
    if (phase >= 2) {
      // Draw ray 2 forward and backward
      exElementsGroup.innerHTML += `
        <path d="M ${C_X - u} ${objTipY} L 750 ${C_Y + (750 - C_X) * (OBJ_H/u)}" class="ray-line" />
        <path d="M ${C_X} ${C_Y} L ${backX} ${backY}" class="ray-line ray-virtual" />
      `;
    }
    if (phase === 3) {
      // Draw virtual image
      exElementsGroup.innerHTML += `
        <line x1="${backX}" y1="${C_Y}" x2="${backX}" y2="${backY}" stroke="#00e5ff" stroke-width="3" stroke-dasharray="3 3" marker-end="url(#arrow-head-inverted)" />
        <text x="${backX}" y="${backY - 12}" class="label-text" fill="#00e5ff">Virtual Image</text>
      `;
    }
  }


  // -------------------------------------------------------------
  // SECTION 4: FLASHCARDS
  // -------------------------------------------------------------
  let flashcards = [
    { cat: 'Definition', q: 'What is the focal length (f) of a lens?', a: 'The distance between the optical center of the lens and its principal focal point (f).' },
    { cat: 'Definition', q: 'What is the object distance (u)?', a: 'The distance from the object to the optical center (C) of the lens.' },
    { cat: 'Definition', q: 'What is the image distance (v)?', a: 'The distance from the formed image to the optical center (C) of the lens.' },
    { cat: 'Converging Lens action', q: 'How does a converging lens affect parallel rays of light?', a: 'It refracts/bends them inward so that they converge at a single point (f).' },
    { cat: 'Image Nature', q: 'What is a "real image"?', a: 'An image formed by light rays that actually meet. It can be projected onto a screen.' },
    { cat: 'Image Nature', q: 'What is a "virtual image"?', a: 'An image formed by light rays that only appear to diverge from a point. It cannot be projected onto a screen.' },
    { cat: 'Zone: u > 2f', q: 'What are the image characteristics when the object is beyond 2f?', a: 'Real, Inverted, Diminished (typically used in cameras and human eyes).' },
    { cat: 'Zone: u = 2f', q: 'What are the image characteristics when the object is exactly at 2f?', a: 'Real, Inverted, Same Size (typically used in photocopiers).' },
    { cat: 'Zone: f < u < 2f', q: 'What are the image characteristics when the object is between f and 2f?', a: 'Real, Inverted, Magnified (typically used in projectors).' },
    { cat: 'Zone: u = f', q: 'What happens to the image when the object is placed at f?', a: 'No image is formed (or it is formed at infinity). Light rays emerge parallel.' },
    { cat: 'Zone: u < f', q: 'What are the image characteristics when the object is within f?', a: 'Virtual, Upright, Magnified (typically used in magnifying glasses).' }
  ];

  let currentCardIndex = 0;
  const activeCard = document.getElementById('active-card');
  const cardQ = document.getElementById('card-q');
  const cardA = document.getElementById('card-a');
  const cardCatFront = document.getElementById('card-cat-front');
  const cardCatBack = document.getElementById('card-cat-back');
  const btnShuffle = document.getElementById('btn-shuffle-cards');
  const btnPrevCard = document.getElementById('btn-prev-card');
  const btnNextCard = document.getElementById('btn-next-card');
  const cardProgress = document.getElementById('card-progress');

  function initFlashcards() {
    currentCardIndex = 0;
    showCard();
  }

  function showCard() {
    if (activeCard.classList.contains('flipped')) {
      activeCard.classList.remove('flipped');
      // Small timeout to allow flipping back animation before content swap
      setTimeout(populateCardContent, 150);
    } else {
      populateCardContent();
    }
  }

  function populateCardContent() {
    const card = flashcards[currentCardIndex];
    cardQ.textContent = card.q;
    cardA.textContent = card.a;
    cardCatFront.textContent = card.cat;
    cardCatBack.textContent = card.cat;
    cardProgress.textContent = `${currentCardIndex + 1} / ${flashcards.length}`;
  }

  if (activeCard) {
    activeCard.addEventListener('click', () => {
      activeCard.classList.toggle('flipped');
    });
  }

  if (btnShuffle) {
    btnShuffle.addEventListener('click', () => {
      flashcards.sort(() => Math.random() - 0.5);
      initFlashcards();
    });
  }

  if (btnPrevCard) {
    btnPrevCard.addEventListener('click', (e) => {
      e.stopPropagation();
      currentCardIndex = (currentCardIndex - 1 + flashcards.length) % flashcards.length;
      showCard();
    });
  }

  if (btnNextCard) {
    btnNextCard.addEventListener('click', (e) => {
      e.stopPropagation();
      currentCardIndex = (currentCardIndex + 1) % flashcards.length;
      showCard();
    });
  }


  // -------------------------------------------------------------
  // SECTION 5: QUIZ
  // -------------------------------------------------------------
  // 30-Question Pool (O-Level Physics 6091 conceptual questions)
  const questionPool = [
    // Zone -> Characteristics
    {
      q: 'An object is placed at a distance greater than twice the focal length (u > 2f) of a converging lens. What are the image characteristics?',
      options: ['Real, Inverted, Diminished', 'Real, Inverted, Magnified', 'Virtual, Upright, Magnified', 'Real, Inverted, Same Size'],
      answer: 0,
      zone: 'u > 2f',
      sol: 'When the object is placed beyond 2f, the light rays converge between f and 2f on the other side, forming a real, inverted, and diminished image (e.g., camera).'
    },
    {
      q: 'An object is placed exactly at 2f. What are the image characteristics?',
      options: ['Real, Inverted, Diminished', 'Real, Inverted, Same Size', 'Real, Inverted, Magnified', 'Virtual, Upright, Magnified'],
      answer: 1,
      zone: 'u = 2f',
      sol: 'When u = 2f, the image is formed exactly at 2f on the opposite side. The image is real, inverted, and the same size as the object.'
    },
    {
      q: 'An object is placed between f and 2f. What are the image characteristics?',
      options: ['Real, Inverted, Diminished', 'Real, Inverted, Magnified', 'Virtual, Upright, Magnified', 'Virtual, Upright, Diminished'],
      answer: 1,
      zone: 'f < u < 2f',
      sol: 'With the object between f and 2f, the rays converge beyond 2f on the other side. The image is real, inverted, and magnified (e.g., projector).'
    },
    {
      q: 'An object is placed within the focal length (u < f) of a converging lens. What are the image characteristics?',
      options: ['Real, Inverted, Magnified', 'Virtual, Upright, Magnified', 'Virtual, Upright, Diminished', 'No image is formed'],
      answer: 1,
      zone: 'u < f',
      sol: 'When u < f, the refracted rays diverge. Backwards extrapolation forms a virtual, upright, and magnified image on the same side as the object (e.g., magnifying glass).'
    },
    {
      q: 'An object is placed exactly at the focal point (u = f). What is the outcome?',
      options: ['Real, inverted, same size image is formed', 'Virtual, upright, diminished image is formed', 'No image is formed (or formed at infinity)', 'Real, inverted, magnified image is formed'],
      answer: 2,
      zone: 'u = f',
      sol: 'When the object is at f, the refracted rays emerge parallel to each other. They never meet, so no image is formed (or it is formed at infinity).'
    },

    // Characteristics -> Zone
    {
      q: 'To use a converging lens as a magnifying glass, where must the object be placed?',
      options: ['At f', 'Between f and 2f', 'Within f (u < f)', 'Beyond 2f'],
      answer: 2,
      zone: 'u < f',
      sol: 'A magnifying glass produces a virtual, upright, and magnified image. This is only possible when the object is placed within the focal length (u < f).'
    },
    {
      q: 'A lens is used in a slide projector to produce a large, inverted image on a screen. Where should the slide be placed?',
      options: ['At 2f', 'Between f and 2f', 'Within f', 'Beyond 2f'],
      answer: 1,
      zone: 'f < u < 2f',
      sol: 'Projectors require a real, inverted, and magnified image. Thus, the slide (object) must be positioned between f and 2f.'
    },
    {
      q: 'Which object distance produces an image that is real, inverted, and the same size as the object?',
      options: ['u = f', 'u = 2f', 'u > 2f', 'f < u < 2f'],
      answer: 1,
      zone: 'u = 2f',
      sol: 'Only at u = 2f does the lens create a real image that is exactly the same size as the object (magnification = 1).'
    },
    {
      q: 'If a converging lens produces a real, inverted, and diminished image, where is the object located?',
      options: ['u < f', 'f < u < 2f', 'u > 2f', 'u = 2f'],
      answer: 2,
      zone: 'u > 2f',
      sol: 'A real, inverted, and diminished image is formed only when the object is located beyond 2f (u > 2f).'
    },
    {
      q: 'Which application uses a converging lens with object distance u > 2f?',
      options: ['Magnifying Glass', 'Slide Projector', 'Photocopier (for same size copy)', 'Camera'],
      answer: 3,
      zone: 'u > 2f',
      sol: 'A camera needs to fit a large scene onto a small film/sensor, which requires a diminished, real image. Therefore, u > 2f.'
    },

    // Diagram / Zone mapping
    {
      q: 'In a ray diagram, if the object is placed at 1.5 times the focal length, which zone is this?',
      options: ['u > 2f', 'u = 2f', 'f < u < 2f', 'u < f'],
      answer: 2,
      zone: 'f < u < 2f',
      sol: '1.5f lies between 1.0f and 2.0f, which falls under the f < u < 2f zone.'
    },
    {
      q: 'In a ray diagram, if the object is placed at 0.5 times the focal length, which zone is this?',
      options: ['u > 2f', 'f < u < 2f', 'u < f', 'u = f'],
      answer: 2,
      zone: 'u < f',
      sol: '0.5f is less than 1.0f, which represents the object placed within the focal point (u < f).'
    },
    {
      q: 'In a ray diagram, if the object is placed at 2.5 times the focal length, which zone is this?',
      options: ['u > 2f', 'u = 2f', 'f < u < 2f', 'u < f'],
      answer: 0,
      zone: 'u > 2f',
      sol: '2.5f is greater than 2f, which represents the u > 2f zone.'
    },
    {
      q: 'Where do parallel light rays from a very distant star converge after passing through a converging lens?',
      options: ['At 2f', 'At the optical center C', 'At the focal point f', 'Between f and 2f'],
      answer: 2,
      zone: 'u = f',
      sol: 'Parallel rays from a very distant source (u at infinity) converge precisely at the principal focus (f) after passing through a converging lens.'
    },

    // True/False on Lens behavior
    {
      q: 'True or False: A virtual image can be projected directly onto a screen.',
      options: ['True', 'False'],
      answer: 1,
      zone: 'u < f',
      sol: 'False. A virtual image is formed by diverging rays that do not actually intersect; therefore, it cannot be projected onto a screen.'
    },
    {
      q: 'True or False: The rays of light passing through the optical center (C) of a thin converging lens are refracted through the principal focus.',
      options: ['True', 'False'],
      answer: 1,
      zone: 'u = 2f',
      sol: 'False. Rays passing through the optical center (C) pass straight through without any bending or refraction.'
    },
    {
      q: 'True or False: Real images are always inverted for a single lens system.',
      options: ['True', 'False'],
      answer: 0,
      zone: 'f < u < 2f',
      sol: 'True. Any real image formed by a single converging lens is always inverted relative to the object.'
    },
    {
      q: 'True or False: Virtual images formed by a converging lens are always upright and magnified.',
      options: ['True', 'False'],
      answer: 0,
      zone: 'u < f',
      sol: 'True. Unlike diverging lenses (which form diminished virtual images), a converging lens only forms a virtual image when u < f, and it is always upright and magnified.'
    },
    {
      q: 'True or False: A lens that is thicker in the middle than at the edges is a converging lens.',
      options: ['True', 'False'],
      answer: 0,
      zone: 'u = 2f',
      sol: 'True. This is the physical definition of a converging (convex) lens.'
    },
    {
      q: 'True or False: If an object is moved closer to a converging lens from a very far distance (remaining beyond f), the real image moves closer to the lens.',
      options: ['True', 'False'],
      answer: 1,
      zone: 'u > 2f',
      sol: 'False. As the object moves closer to the lens, the image moves further away from the lens and increases in size.'
    },

    // General conceptual questions
    {
      q: 'Which of the following describes the linear magnification of an object placed at 2f?',
      options: ['Magnification is greater than 1', 'Magnification is less than 1', 'Magnification is exactly 1', 'Magnification is 0'],
      answer: 2,
      zone: 'u = 2f',
      sol: 'At u = 2f, the image size equals the object size, meaning the magnification is exactly 1.'
    },
    {
      q: 'What type of image is formed on the retina of the human eye?',
      options: ['Real, inverted, diminished', 'Virtual, upright, magnified', 'Real, inverted, magnified', 'Virtual, upright, diminished'],
      answer: 0,
      zone: 'u > 2f',
      sol: 'The eye behaves like a camera. It forms a real, inverted, and diminished image on the retina for distant objects.'
    },
    {
      q: 'Which zone has no image formed because light rays refract and emerge parallel?',
      options: ['u < f', 'u = f', 'f < u < 2f', 'u = 2f'],
      answer: 1,
      zone: 'u = f',
      sol: 'When the object is placed at the focus (u = f), the rays refract and travel parallel to each other, forming no image.'
    },
    {
      q: 'If we want to create a parallel beam of light (e.g. in a searchlight or spotlight) using a small bulb and a converging lens, where should the bulb be placed?',
      options: ['At f', 'Between f and 2f', 'Beyond 2f', 'At C'],
      answer: 0,
      zone: 'u = f',
      sol: 'Placing the light source at f causes the rays to refract and exit the lens parallel to each other, forming a spotlight beam.'
    },
    {
      q: 'A virtual image is formed by a converging lens. What must be true about the object distance u?',
      options: ['u > f', 'u < f', 'u = 2f', 'u > 2f'],
      answer: 1,
      zone: 'u < f',
      sol: 'A virtual image is only formed by a converging lens when the object is placed within the focal length (u < f).'
    },
    {
      q: 'What happens to the image size as a real object is moved from 3f towards 2f?',
      options: ['It decreases', 'It increases', 'It remains the same', 'It disappears'],
      answer: 1,
      zone: 'u > 2f',
      sol: 'As the object moves closer to the lens, the image moves further away and its size increases (though it remains diminished compared to the object until it reaches 2f).'
    },
    {
      q: 'Which of the following describes a real image?',
      options: ['It cannot be caught on a screen', 'It is always upright', 'It is formed by the actual intersection of light rays', 'It is formed on the same side of the lens as the object'],
      answer: 2,
      zone: 'f < u < 2f',
      sol: 'Real images are formed where actual light rays intersect after passing through the lens. They can be projected onto a screen.'
    },
    {
      q: 'A slide projector needs to project a upright image onto a screen. How should the slide be placed in the projector?',
      options: ['Upright', 'Upside down', 'Sideways', 'Any orientation'],
      answer: 1,
      zone: 'f < u < 2f',
      sol: 'Since the lens forms an inverted image of the slide, the slide itself must be placed upside down so the projected image appears upright to the audience.'
    },
    {
      q: 'What is the principal axis of a lens?',
      options: ['The vertical line passing through the lens', 'The horizontal line passing through the optical center and perpendicular to the lens', 'The path taken by the parallel rays', 'The boundary of the lens'],
      answer: 1,
      zone: 'u = 2f',
      sol: 'The principal axis is the horizontal line of symmetry passing through the optical center C and perpendicular to the vertical plane of the lens.'
    },
    {
      q: 'If a converging lens with focal length 10cm has an object placed 15cm away, what are the image characteristics?',
      options: ['Real, Inverted, Diminished', 'Real, Inverted, Magnified', 'Virtual, Upright, Magnified', 'Virtual, Inverted, Same Size'],
      answer: 1,
      zone: 'f < u < 2f',
      sol: 'Since f = 10cm, 15cm is between f (10cm) and 2f (20cm). Therefore, the image is Real, Inverted, and Magnified.'
    }
  ];

  let quizQuestions = [];
  let currentQuizIndex = 0;
  let quizScore = 0;
  const questionsPerSession = 5;

  const quizLanding = document.getElementById('quiz-landing');
  const quizActive = document.getElementById('quiz-active');
  const quizResults = document.getElementById('quiz-results');
  const btnStartQuiz = document.getElementById('btn-start-quiz');
  const quizProgress = document.getElementById('quiz-progress');
  const quizScoreLabel = document.getElementById('quiz-score');
  const quizQuestionText = document.getElementById('quiz-question-text');
  const quizOptionsContainer = document.getElementById('quiz-options-container');
  const quizSolutionBox = document.getElementById('quiz-solution-box');
  const quizSolutionStatus = document.getElementById('quiz-solution-status');
  const quizSolutionText = document.getElementById('quiz-solution-text');
  const quizSolutionDiagramElements = document.getElementById('quiz-solution-diagram-elements');
  const btnNextQuestion = document.getElementById('btn-next-question');
  const btnRestartQuiz = document.getElementById('btn-restart-quiz');

  // Results elements
  const resultsScorePercent = document.getElementById('results-score-percent');
  const resultsGradeFeedback = document.getElementById('results-grade-feedback');
  const resultsScoreRaw = document.getElementById('results-score-raw');

  function initQuiz() {
    quizLanding.style.display = 'block';
    quizActive.style.display = 'none';
    quizResults.style.display = 'none';
  }

  if (btnStartQuiz) {
    btnStartQuiz.addEventListener('click', startQuiz);
  }

  if (btnRestartQuiz) {
    btnRestartQuiz.addEventListener('click', startQuiz);
  }

  function startQuiz() {
    // Shuffle and pick 5 questions from the pool
    quizQuestions = [...questionPool].sort(() => Math.random() - 0.5).slice(0, questionsPerSession);
    currentQuizIndex = 0;
    quizScore = 0;

    quizLanding.style.display = 'none';
    quizResults.style.display = 'none';
    quizActive.style.display = 'block';

    showQuizQuestion();
  }

  function showQuizQuestion() {
    quizSolutionBox.style.display = 'none';
    
    const q = quizQuestions[currentQuizIndex];
    quizProgress.textContent = `Question ${currentQuizIndex + 1} of ${questionsPerSession}`;
    quizScoreLabel.textContent = `Score: ${quizScore}`;
    quizQuestionText.textContent = q.q;

    // Render Options
    quizOptionsContainer.innerHTML = '';
    q.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.innerHTML = `<span>${opt}</span>`;
      btn.addEventListener('click', () => handleOptionSelection(idx));
      quizOptionsContainer.appendChild(btn);
    });
  }

  function handleOptionSelection(selectedIdx) {
    const q = quizQuestions[currentQuizIndex];
    const optionBtns = quizOptionsContainer.querySelectorAll('.option-btn');

    // Disable all options
    optionBtns.forEach(btn => btn.disabled = true);

    const isCorrect = (selectedIdx === q.answer);
    if (isCorrect) {
      quizScore++;
      quizScoreLabel.textContent = `Score: ${quizScore}`;
      quizSolutionStatus.textContent = '🎉 Correct!';
      quizSolutionStatus.className = 'solution-status correct-text';
      optionBtns[selectedIdx].classList.add('correct');

      // Trigger standard confetti
      confetti({
        particleCount: 40,
        spread: 45,
        origin: { y: 0.8 },
        colors: ['#00e5ff', '#ffd600']
      });
    } else {
      quizSolutionStatus.textContent = '💡 Review Concept';
      quizSolutionStatus.className = 'solution-status wrong-text';
      optionBtns[selectedIdx].classList.add('wrong');
      optionBtns[q.answer].classList.add('correct');
    }

    // Populate solution
    quizSolutionText.textContent = q.sol;

    // Draw ray diagram solution based on zone
    drawQuizSolutionDiagram(q.zone);

    quizSolutionBox.style.display = 'block';
  }

  function drawQuizSolutionDiagram(zone) {
    quizSolutionDiagramElements.innerHTML = '';
    
    // Set parameters
    const qC_X = 300;
    const qC_Y = 110;
    const qF = 75; // smaller focal length for quiz box
    const qOBJ_H = 40;

    let u;
    if (zone === 'u > 2f') u = 180;
    else if (zone === 'u = 2f') u = 150;
    else if (zone === 'f < u < 2f') u = 110;
    else u = 50; // u < f

    const props = calculateImagePropertiesForQuiz(u, qF, qC_X, qC_Y, qOBJ_H);
    const objX = qC_X - u;
    const objTipY = qC_Y - qOBJ_H;

    // Draw object
    quizSolutionDiagramElements.innerHTML += `
      <line x1="${objX}" y1="${qC_Y}" x2="${objX}" y2="${objTipY}" stroke="#ffd600" stroke-width="3" marker-end="url(#arrow-head)" />
    `;

    if (zone === 'u < f') {
      // Virtual image setup
      quizSolutionDiagramElements.innerHTML += `
        <path d="M ${objX} ${objTipY} L ${qC_X} ${objTipY} L 550 ${qC_Y + (550 - (qC_X + qF)) * (qOBJ_H/qF)}" class="ray-line" stroke-width="1.5" />
        <path d="M ${qC_X} ${objTipY} L ${props.x_img} ${props.y_img}" class="ray-line ray-virtual" />
        <path d="M ${objX} ${objTipY} L 550 ${qC_Y + (550 - qC_X) * (qOBJ_H/u)}" class="ray-line" stroke-width="1.5" />
        <path d="M ${qC_X} ${qC_Y} L ${props.x_img} ${props.y_img}" class="ray-line ray-virtual" />
        <line x1="${props.x_img}" y1="${qC_Y}" x2="${props.x_img}" y2="${props.y_img}" stroke="#00e5ff" stroke-width="2" stroke-dasharray="2 2" marker-end="url(#arrow-head-inverted)" />
      `;
    } else {
      // Real image setup
      quizSolutionDiagramElements.innerHTML += `
        <path d="M ${objX} ${objTipY} L ${qC_X} ${objTipY} L 550 ${qC_Y + (550 - (qC_X + qF)) * (qOBJ_H/qF)}" class="ray-line" stroke-width="1.5" />
        <path d="M ${objX} ${objTipY} L 550 ${qC_Y + (550 - qC_X) * (-props.h_img/props.v)}" class="ray-line" stroke-width="1.5" />
        <line x1="${props.x_img}" y1="${qC_Y}" x2="${props.x_img}" y2="${props.y_img}" stroke="#00e5ff" stroke-width="2.5" marker-end="url(#arrow-head-inverted)" />
      `;
    }
  }

  function calculateImagePropertiesForQuiz(u, f, cx, cy, h) {
    const v = (u * f) / (u - f);
    const mag = -v / u;
    const h_img = mag * h;
    return {
      v,
      h_img,
      x_img: cx + v,
      y_img: cy - h_img
    };
  }

  if (btnNextQuestion) {
    btnNextQuestion.addEventListener('click', () => {
      currentQuizIndex++;
      if (currentQuizIndex < questionsPerSession) {
        showQuizQuestion();
      } else {
        showQuizResults();
      }
    });
  }

  function showQuizResults() {
    quizActive.style.display = 'none';
    quizResults.style.display = 'block';

    const percent = Math.round((quizScore / questionsPerSession) * 100);
    resultsScorePercent.textContent = `${percent}%`;
    resultsScoreRaw.textContent = `You scored ${quizScore} out of ${questionsPerSession}.`;

    // Grade feedback
    if (percent === 100) {
      resultsGradeFeedback.textContent = '🏆 Perfect Score! You are a Lens Master!';
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
    } else if (percent >= 80) {
      resultsGradeFeedback.textContent = '🌟 Excellent understanding!';
    } else if (percent >= 50) {
      resultsGradeFeedback.textContent = '👍 Good effort, keep reviewing!';
    } else {
      resultsGradeFeedback.textContent = '📚 Review the concepts and try again!';
    }
  }
});
