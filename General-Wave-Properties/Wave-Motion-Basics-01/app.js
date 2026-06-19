/**
 * WAVE MOTION BASICS — Core Application Script
 * O-Level Physics 6091 — Age 16
 * Dark-mode & Colorblind-accessible interactions
 */

function initApp() {
  
  // ==========================================================================
  // NAVIGATION & TAB MANAGEMENT
  // ==========================================================================
  const navButtons = document.querySelectorAll('.nav-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  function switchTab(tabId) {
    tabContents.forEach(content => {
      content.classList.remove('active');
    });
    navButtons.forEach(btn => {
      btn.classList.remove('active');
      if (btn.getAttribute('data-tab') === tabId) {
        btn.classList.add('active');
      }
    });
    
    const targetTab = document.getElementById(`tab-${tabId}`);
    if (targetTab) {
      targetTab.classList.add('active');
    }
    
    // Stop/start loops depending on active section to optimize mobile performance
    if (tabId === 'intro') {
      startIntroLoops();
      stopRippleLoop();
      stopQuizWaveLoop();
    } else if (tabId === 'ripple') {
      stopIntroLoops();
      startRippleLoop();
      stopQuizWaveLoop();
    } else {
      stopIntroLoops();
      stopRippleLoop();
      // Draw standard SVG static path for anatomy tab
      if (tabId === 'anatomy') {
        drawAnatomyStaticWave();
      }
    }
    
    // Auto-draw current card visual if flashcard tab is opened
    if (tabId === 'cards') {
      drawCardVisual();
    }
  }

  navButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabId = button.getAttribute('data-tab');
      switchTab(tabId);
    });
  });


  // ==========================================================================
  // SECTION 1: INTRO ANIMATIONS (CANVAS LOGIC)
  // ==========================================================================
  let ropeCanvas = document.getElementById('rope-canvas');
  let corkCanvas = document.getElementById('cork-canvas');
  let wavefrontCanvas = document.getElementById('wavefront-canvas');
  
  let ropeCtx = ropeCanvas.getContext('2d');
  let corkCtx = corkCanvas.getContext('2d');
  let wavefrontCtx = wavefrontCanvas.getContext('2d');
  
  let animationFrameIds = {};
  let introTime = 0;

  function resizeIntroCanvases() {
    [ropeCanvas, corkCanvas, wavefrontCanvas].forEach(canvas => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
    });
  }

  window.addEventListener('resize', () => {
    resizeIntroCanvases();
    if (document.getElementById('tab-anatomy').classList.contains('active')) {
      drawAnatomyStaticWave();
    }
  });

  // Animation Loop 1: Rope Wave
  function drawRopeAnimation() {
    const ctx = ropeCtx;
    const w = ropeCanvas.width;
    const h = ropeCanvas.height;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    const cw = w / window.devicePixelRatio;
    const ch = h / window.devicePixelRatio;
    
    ctx.clearRect(0, 0, cw, ch);
    
    // Wave Parameters
    const amplitude = 35;
    const frequency = 0.015;
    const speed = 4;
    const waveLength = 120;
    
    // Render Rope Line
    ctx.beginPath();
    ctx.strokeStyle = '#212c4d';
    ctx.lineWidth = 4;
    ctx.moveTo(0, ch/2);
    ctx.lineTo(cw, ch/2);
    ctx.stroke();

    // Shaking hand or source on the left
    const sourceY = ch/2 + Math.sin(introTime * speed * 0.05) * amplitude;
    
    // Draw particles
    const particleCount = 28;
    for (let i = 0; i < particleCount; i++) {
      const x = (cw / (particleCount - 1)) * i;
      
      // Calculate wave displacement (only starts after propagating)
      let y = ch/2;
      // Pulse shape propagating along the rope
      const phase = (introTime * speed - x) / waveLength;
      if (x < introTime * speed * 2.2) {
        y = ch/2 + Math.sin(phase * Math.PI * 2) * amplitude * Math.min(1, x/100);
      }
      
      // Draw connecting wire
      if (i === 0) {
        ctx.beginPath();
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      
      if (i === particleCount - 1) {
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    }

    // Highlight critical O-Level particles in bright yellow to show up/down only vibration
    const highlightIndices = [5, 12, 19];
    for (let i = 0; i < particleCount; i++) {
      const x = (cw / (particleCount - 1)) * i;
      let y = ch/2;
      const phase = (introTime * speed - x) / waveLength;
      if (x < introTime * speed * 2.2) {
        y = ch/2 + Math.sin(phase * Math.PI * 2) * amplitude * Math.min(1, x/100);
      }
      
      ctx.beginPath();
      if (highlightIndices.includes(i)) {
        // Highlight particle bobbing
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.fillStyle = '#ffeb3b';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // Draw dotted path guides showing up/down range
        ctx.beginPath();
        ctx.setLineDash([2, 4]);
        ctx.moveTo(x, ch/2 - amplitude);
        ctx.lineTo(x, ch/2 + amplitude);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }
    }
    
    // Draw source handle on the left
    ctx.beginPath();
    ctx.arc(0, sourceY, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#00e5ff';
    ctx.fill();
    
    ropeCtx.setTransform(1, 0, 0, 1, 0, 0);
  }

  // Animation Loop 2: Cork Bobbing
  function drawCorkAnimation() {
    const ctx = corkCtx;
    const w = corkCanvas.width;
    const h = corkCanvas.height;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    const cw = w / window.devicePixelRatio;
    const ch = h / window.devicePixelRatio;
    
    ctx.clearRect(0, 0, cw, ch);
    
    const amp = 30;
    const speed = 0.05;
    const wavelength = 140;
    
    // Draw Wave Shape
    ctx.beginPath();
    for (let x = 0; x < cw; x++) {
      const y = ch/2 + Math.sin((x - introTime * 4) / wavelength * Math.PI * 2) * amp;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw actual crest lines moving
    ctx.beginPath();
    for (let x = 0; x < cw; x++) {
      const y = ch/2 + Math.sin((x - introTime * 4) / wavelength * Math.PI * 2) * amp;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    // Floating cork in the middle (bobbing up and down in a fixed horizontal position)
    const corkX = cw / 2;
    const corkY = ch/2 + Math.sin((corkX - introTime * 4) / wavelength * Math.PI * 2) * amp;
    
    // Vertical reference line to show the user it doesn't move sideways
    ctx.beginPath();
    ctx.setLineDash([3, 5]);
    ctx.moveTo(corkX, 10);
    ctx.lineTo(corkX, ch - 10);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw Cork
    ctx.beginPath();
    ctx.arc(corkX, corkY, 12, 0, Math.PI*2);
    ctx.fillStyle = '#ffeb3b';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Add indicator arrows showing vertical movement direction
    const velocity = Math.cos((corkX - introTime * 4) / wavelength * Math.PI * 2);
    ctx.beginPath();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    if (velocity < 0) { // Moving up
      ctx.moveTo(corkX, corkY - 20);
      ctx.lineTo(corkX, corkY - 30);
      ctx.lineTo(corkX - 5, corkY - 25);
      ctx.moveTo(corkX, corkY - 30);
      ctx.lineTo(corkX + 5, corkY - 25);
    } else { // Moving down
      ctx.moveTo(corkX, corkY + 20);
      ctx.lineTo(corkX, corkY + 30);
      ctx.lineTo(corkX - 5, corkY + 25);
      ctx.moveTo(corkX, corkY + 30);
      ctx.lineTo(corkX + 5, corkY + 25);
    }
    ctx.stroke();
    
    corkCtx.setTransform(1, 0, 0, 1, 0, 0);
  }

  // Animation Loop 3: Wavefront Ripples
  function drawWavefrontsAnimation() {
    const ctx = wavefrontCtx;
    const w = wavefrontCanvas.width;
    const h = wavefrontCanvas.height;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    const cw = w / window.devicePixelRatio;
    const ch = h / window.devicePixelRatio;
    
    ctx.clearRect(0, 0, cw, ch);
    
    const centerX = cw / 2;
    const centerY = ch / 2;
    const speed = 1.2;
    const maxRadius = Math.max(cw, ch);
    const waveGap = 45;
    
    // Draw central dot (vibrating source)
    ctx.beginPath();
    const sourceRadius = 5 + Math.sin(introTime * 0.2) * 2;
    ctx.arc(centerX, centerY, sourceRadius, 0, Math.PI*2);
    ctx.fillStyle = '#ffeb3b';
    ctx.fill();
    
    // Draw expanding rings
    let startRadius = (introTime * speed) % waveGap;
    for (let r = startRadius; r < maxRadius; r += waveGap) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, Math.PI*2);
      ctx.strokeStyle = '#00e5ff';
      // Fade out as it expands
      const opacity = Math.max(0, 1 - (r / maxRadius));
      ctx.lineWidth = 3 * opacity;
      ctx.strokeStyle = `rgba(0, 229, 255, ${opacity})`;
      ctx.stroke();
      
      // Label the third visible wavefront
      if (r > 80 && r < 130) {
        ctx.beginPath();
        // Label line from wavefront circle to text
        ctx.moveTo(centerX + r * Math.cos(Math.PI/4), centerY - r * Math.sin(Math.PI/4));
        ctx.lineTo(centerX + r * Math.cos(Math.PI/4) + 30, centerY - r * Math.sin(Math.PI/4) - 20);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Outfit';
        ctx.fillText('Wavefront', centerX + r * Math.cos(Math.PI/4) + 35, centerY - r * Math.sin(Math.PI/4) - 20);
      }
    }
    
    wavefrontCtx.setTransform(1, 0, 0, 1, 0, 0);
  }

  function startIntroLoops() {
    introTime++;
    drawRopeAnimation();
    drawCorkAnimation();
    drawWavefrontsAnimation();
    animationFrameIds.intro = requestAnimationFrame(startIntroLoops);
  }

  function stopIntroLoops() {
    cancelAnimationFrame(animationFrameIds.intro);
  }


  // ==========================================================================
  // SECTION 2: RIPPLE TANK SIMULATOR & SYNCHRONIZED GRAPH
  // ==========================================================================
  const rippleTankCanvas = document.getElementById('ripple-tank-canvas');
  const transverseGraphCanvas = document.getElementById('transverse-graph-canvas');
  const freqSlider = document.getElementById('freq-slider');
  const ampSlider = document.getElementById('amp-slider');
  const freqValReadout = document.getElementById('freq-val');
  const ampValReadout = document.getElementById('amp-val');
  
  let rippleCtx = rippleTankCanvas.getContext('2d');
  let graphCtx = transverseGraphCanvas.getContext('2d');
  
  let rippleTime = 0;
  
  function resizeSimulationCanvases() {
    const parent1 = rippleTankCanvas.parentElement;
    rippleTankCanvas.width = parent1.clientWidth * window.devicePixelRatio;
    rippleTankCanvas.height = parent1.clientHeight * window.devicePixelRatio;
    rippleTankCanvas.style.width = '100%';
    rippleTankCanvas.style.height = '100%';
    
    const parent2 = transverseGraphCanvas.parentElement;
    transverseGraphCanvas.width = parent2.clientWidth * window.devicePixelRatio;
    transverseGraphCanvas.height = parent2.clientHeight * window.devicePixelRatio;
    transverseGraphCanvas.style.width = '100%';
    transverseGraphCanvas.style.height = '100%';
  }
  
  // Dynamic labels for amplitude slider
  const ampLabels = { 1: "Low", 2: "Medium", 3: "High" };
  const ampScaleFactors = { 1: 0.5, 2: 1.0, 3: 1.5 };
  
  freqSlider.addEventListener('input', (e) => {
    freqValReadout.textContent = parseFloat(e.target.value).toFixed(1);
  });
  
  ampSlider.addEventListener('input', (e) => {
    ampValReadout.textContent = ampLabels[e.target.value];
  });
  
  // Main Ripple Tank simulation ticks
  function runRippleTankSimulation() {
    const f = parseFloat(freqSlider.value); // Frequency (1 - 10 Hz)
    const aVal = parseInt(ampSlider.value); // Amp factor index
    const baseAmp = 35 * ampScaleFactors[aVal];
    
    // Wave calculations
    // Speed is constant in a uniform medium (O-Level fact). v = f * lambda.
    // So if frequency increases, wavelength MUST decrease: lambda = v / f.
    const waveSpeed = 200; // pixels per sec equivalent
    const wavelength = waveSpeed / f; 
    
    // 1. Draw 2D Ripple Tank (Top Down)
    const rw = rippleTankCanvas.width;
    const rh = rippleTankCanvas.height;
    rippleCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
    const rcw = rw / window.devicePixelRatio;
    const rch = rh / window.devicePixelRatio;
    
    rippleCtx.clearRect(0, 0, rcw, rch);
    
    // Source point: Center of tank
    const sourceX = rcw / 2;
    const sourceY = rch / 2;
    
    // Draw concentric ripples representing wavefronts (crests are bright, troughs are dark)
    // Draw background color gradients
    rippleCtx.fillStyle = '#0c1224';
    rippleCtx.fillRect(0, 0, rcw, rch);
    
    // We render wavefronts using expanding radial circular gradients or discrete rings to make it look like a physical tank
    const maxDist = Math.max(rcw, rch);
    for (let r = 5; r < maxDist; r += 2) {
      // Calculate phase at distance r
      // displacement y = A * sin(2*pi * (f*t - r/lambda))
      const phase = 2 * Math.PI * (f * (rippleTime / 60) - r / wavelength);
      const val = Math.sin(phase);
      
      // Map val [-1, 1] to light contrast: values near 1 are crests (bright), values near -1 are troughs (dark)
      if (val > 0.6) {
        rippleCtx.beginPath();
        rippleCtx.arc(sourceX, sourceY, r, 0, Math.PI*2);
        // Alpha represents intensity
        const intensity = (val - 0.6) / 0.4 * 0.4 * Math.max(0, 1 - (r / maxDist));
        rippleCtx.strokeStyle = `rgba(0, 229, 255, ${intensity})`;
        rippleCtx.lineWidth = 4;
        rippleCtx.stroke();
      }
    }
    
    // Draw water droplet source pulsating
    rippleCtx.beginPath();
    const pulseRadius = 6 + Math.sin(2 * Math.PI * f * (rippleTime / 60)) * 2;
    rippleCtx.arc(sourceX, sourceY, pulseRadius, 0, Math.PI*2);
    rippleCtx.fillStyle = '#ffeb3b';
    rippleCtx.fill();
    
    rippleTankCanvas.getContext('2d').setTransform(1, 0, 0, 1, 0, 0);
    
    // 2. Draw Transverse wave graph below
    const gw = transverseGraphCanvas.width;
    const gh = transverseGraphCanvas.height;
    graphCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
    const gcw = gw / window.devicePixelRatio;
    const gch = gh / window.devicePixelRatio;
    
    graphCtx.clearRect(0, 0, gcw, gch);
    
    // Draw axis lines
    graphCtx.beginPath();
    graphCtx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    graphCtx.lineWidth = 1.5;
    graphCtx.moveTo(40, gch/2);
    graphCtx.lineTo(gcw - 20, gch/2); // Horizontal axis
    graphCtx.moveTo(40, 20);
    graphCtx.lineTo(40, gch - 20); // Vertical axis
    graphCtx.stroke();
    
    // Graph labels
    graphCtx.fillStyle = '#90a4ae';
    graphCtx.font = '11px Outfit';
    graphCtx.fillText('+y', 15, 25);
    graphCtx.fillText('-y', 15, gch - 15);
    graphCtx.fillText('Distance (x)', gcw - 85, gch/2 + 20);
    
    // Draw sine wave representing the graph matching simulator frequency
    graphCtx.beginPath();
    for (let x = 40; x < gcw - 20; x++) {
      // Calculate corresponding point matching the circular ripple tank's properties
      const distance = x - 40;
      const phase = 2 * Math.PI * (f * (rippleTime / 60) - distance / wavelength);
      const y = gch/2 + Math.sin(phase) * baseAmp;
      
      if (x === 40) graphCtx.moveTo(x, y);
      else graphCtx.lineTo(x, y);
    }
    graphCtx.strokeStyle = '#00e5ff';
    graphCtx.lineWidth = 3.5;
    graphCtx.stroke();
    
    transverseGraphCanvas.getContext('2d').setTransform(1, 0, 0, 1, 0, 0);
    
    rippleTime++;
    animationFrameIds.ripple = requestAnimationFrame(runRippleTankSimulation);
  }
  
  function startRippleLoop() {
    resizeSimulationCanvases();
    rippleTime = 0;
    runRippleTankSimulation();
  }
  
  function stopRippleLoop() {
    cancelAnimationFrame(animationFrameIds.ripple);
  }


  // ==========================================================================
  // SECTION 3: WAVE ANATOMY CHALLENGE (DRAG & DROP)
  // ==========================================================================
  const anatomySvg = document.getElementById('anatomy-svg');
  const labelsTray = document.getElementById('labels-tray');
  const btnCheckAnatomy = document.getElementById('btn-check-anatomy');
  const btnResetAnatomy = document.getElementById('btn-reset-anatomy');
  const anatomyFeedback = document.getElementById('anatomy-feedback');
  
  // Model state of user matches: { TargetName: HTMLElement or null }
  let anatomyPlacements = {
    Amplitude: null,
    Wavelength: null,
    Crest: null,
    Trough: null
  };
  
  function drawAnatomyStaticWave() {
    const wavePath = document.getElementById('anatomy-wave-path');
    if (!wavePath) return;
    
    // Draw a clean sine wave path across the 800x400 view box
    let d = "M 120 200";
    const startX = 120;
    const endX = 750;
    const amplitude = 100;
    const wavelength = 400; // one cycle is 400px
    
    for (let x = startX; x <= endX; x++) {
      const y = 200 + Math.sin((x - startX) / wavelength * Math.PI * 2) * amplitude;
      d += ` L ${x} ${y}`;
    }
    wavePath.setAttribute('d', d);
  }
  
  // Custom drag and drop handler for mobile (touch) and desktop (mouse)
  const draggableLabels = document.querySelectorAll('.draggable-label');
  const dropzones = document.querySelectorAll('.dropzone-group');
  
  draggableLabels.forEach(label => {
    // Desktop Drag Start
    label.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', label.getAttribute('data-label'));
      e.dataTransfer.setData('source-id', label.id);
      label.classList.add('dragging');
    });
    
    label.addEventListener('dragend', () => {
      label.classList.remove('dragging');
    });

    // Touch support (Mobile)
    let touchStartX = 0;
    let touchStartY = 0;
    let originalLeft = 0;
    let originalTop = 0;
    
    label.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      const rect = label.getBoundingClientRect();
      
      // Temporarily store initial absolute position for dragging
      label.style.position = 'relative';
      label.style.zIndex = '1000';
      label.classList.add('dragging');
      
      originalLeft = parseFloat(label.style.left) || 0;
      originalTop = parseFloat(label.style.top) || 0;
    });
    
    label.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      
      label.style.left = `${originalLeft + deltaX}px`;
      label.style.top = `${originalTop + deltaY}px`;
    });
    
    label.addEventListener('touchend', (e) => {
      label.classList.remove('dragging');
      label.style.zIndex = '';
      
      // Determine what drop target is underneath the touch coordinates
      const touch = e.changedTouches[0];
      const elemUnderTouch = document.elementFromPoint(touch.clientX, touch.clientY);
      
      // Find parent dropzone group
      let dropzoneGroup = null;
      if (elemUnderTouch) {
        dropzoneGroup = elemUnderTouch.closest('.dropzone-group');
      }
      
      if (dropzoneGroup) {
        const targetLabelName = dropzoneGroup.getAttribute('data-target');
        const draggedLabelName = label.getAttribute('data-label');
        
        handleDropPlacement(label, dropzoneGroup, draggedLabelName, targetLabelName);
      } else {
        // Return back to tray
        resetLabelPosition(label);
      }
    });
  });
  
  // HTML5 Drag and Drop events (Desktop)
  dropzones.forEach(zone => {
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.classList.add('drag-hover');
    });
    
    zone.addEventListener('dragleave', () => {
      zone.classList.remove('drag-hover');
    });
    
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('drag-hover');
      
      const labelName = e.dataTransfer.getData('text/plain');
      const labelId = e.dataTransfer.getData('source-id');
      const labelElem = document.getElementById(labelId);
      const targetName = zone.getAttribute('data-target');
      
      if (labelElem) {
        handleDropPlacement(labelElem, zone, labelName, targetName);
      }
    });
  });
  
  function handleDropPlacement(labelElem, dropzoneGroup, labelName, targetName) {
    // If the label matches this slot's name, snap it into place!
    if (labelName === targetName) {
      // Correct Match Snapping
      dropzoneGroup.classList.add('correct');
      // Visual feedback inside SVG
      const rect = dropzoneGroup.querySelector('.drop-rect');
      const txt = dropzoneGroup.querySelector('.drop-text');
      
      rect.style.strokeWidth = '3px';
      txt.textContent = labelName;
      
      // Keep label visible in the tray
      anatomyPlacements[targetName] = labelElem;
      
      // Trigger satisfying pulse glow animation on dropzone
      dropzoneGroup.classList.add('correct-drop-pulse');
      setTimeout(() => {
        dropzoneGroup.classList.remove('correct-drop-pulse');
      }, 500);
    } else {
      // Incorrect Match: Shake and return label to tray
      labelElem.classList.add('shake-neutral');
      resetLabelPosition(labelElem);
      setTimeout(() => {
        labelElem.classList.remove('shake-neutral');
      }, 500);
    }
  }
  
  function resetLabelPosition(labelElem) {
    labelElem.style.position = '';
    labelElem.style.left = '';
    labelElem.style.top = '';
  }
  
  btnCheckAnatomy.addEventListener('click', () => {
    let allPlaced = true;
    let correctCount = 0;
    
    Object.keys(anatomyPlacements).forEach(key => {
      if (anatomyPlacements[key] !== null) {
        correctCount++;
      } else {
        allPlaced = false;
      }
    });
    
    anatomyFeedback.classList.remove('hide');
    if (correctCount === 4) {
      anatomyFeedback.className = "status-banner correct-banner";
      anatomyFeedback.innerHTML = "✓ Outstanding! All wave anatomy terms are perfectly placed.";
      // Trigger global confetti effect
      triggerConfettiBurst();
    } else {
      anatomyFeedback.className = "status-banner warning-banner";
      anatomyFeedback.innerHTML = `Placed ${correctCount} out of 4 correctly. Keep matching the remaining terms!`;
    }
  });
  
  btnResetAnatomy.addEventListener('click', () => {
    anatomyFeedback.classList.add('hide');
    Object.keys(anatomyPlacements).forEach(key => {
      const label = anatomyPlacements[key];
      if (label) {
        label.classList.remove('hide');
        resetLabelPosition(label);
      }
      anatomyPlacements[key] = null;
    });
    
    dropzones.forEach(zone => {
      zone.classList.remove('correct');
      const rect = zone.querySelector('.drop-rect');
      const txt = zone.querySelector('.drop-text');
      rect.style.strokeWidth = '';
      
      // Restore placeholder text in labels
      txt.textContent = "name??";
    });
  });


  // ==========================================================================
  // SECTION 4: FLASHCARDS (STUDY MODE)
  // ==========================================================================
  const flashcardDeck = [
    {
      term: "Wave Motion",
      definition: "A process of transferring energy from one point to another without transferring any physical matter.",
      draw: (ctx, w, h, t) => {
        // Shaking source rendering ripples
        ctx.fillStyle = '#0f1424';
        ctx.fillRect(0, 0, w, h);
        ctx.beginPath();
        ctx.arc(w/2, h/2, 20 + Math.sin(t*0.05)*10, 0, Math.PI*2);
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Outfit';
        ctx.textAlign = 'center';
        ctx.fillText("Energy Transfers Outward ➔", w/2, h/2 + 50);
      }
    },
    {
      term: "Energy vs Matter Transfer",
      definition: "Particles of the medium only vibrate about their equilibrium positions. They do not travel along with the wave.",
      draw: (ctx, w, h, t) => {
        ctx.fillStyle = '#0f1424';
        ctx.fillRect(0, 0, w, h);
        
        // Floating particle vertical path
        const cy = h/2 + Math.sin(t * 0.1) * 30;
        ctx.beginPath();
        ctx.setLineDash([2, 2]);
        ctx.moveTo(w/2, 20);
        ctx.lineTo(w/2, h - 20);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.beginPath();
        ctx.arc(w/2, cy, 10, 0, Math.PI*2);
        ctx.fillStyle = '#ffeb3b';
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Outfit';
        ctx.textAlign = 'center';
        ctx.fillText("Bobs Up/Down Only", w/2, h - 20);
      }
    },
    {
      term: "Wavefront",
      definition: "An imaginary line joining all adjacent points on a wave that are in phase (e.g. joining all adjacent wave crests).",
      draw: (ctx, w, h, t) => {
        ctx.fillStyle = '#0f1424';
        ctx.fillRect(0, 0, w, h);
        
        // Ripple wavefront lines
        ctx.strokeStyle = '#00e5ff';
        for (let i = 0; i < 3; i++) {
          const r = 30 + i * 40 + (t % 40);
          ctx.beginPath();
          ctx.arc(w/2, h/2, r, 0, Math.PI*2);
          ctx.globalAlpha = Math.max(0, 1 - r/150);
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }
        ctx.globalAlpha = 1.0;
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Outfit';
        ctx.textAlign = 'center';
        ctx.fillText("In-phase Crests", w/2, h - 20);
      }
    },
    {
      term: "Amplitude",
      definition: "The maximum displacement of a point on a wave from its rest position. SI Unit: Metre (m).",
      draw: (ctx, w, h, t) => {
        ctx.fillStyle = '#0f1424';
        ctx.fillRect(0, 0, w, h);
        
        // Equilibrium line
        ctx.beginPath();
        ctx.moveTo(10, h/2);
        ctx.lineTo(w - 10, h/2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.stroke();
        
        // Wave
        ctx.beginPath();
        for (let x = 10; x < w - 10; x++) {
          const y = h/2 + Math.sin(x*0.04) * 35;
          if (x === 10) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Amplitude arrow
        const arrowX = w/2 + 20;
        ctx.beginPath();
        ctx.moveTo(arrowX, h/2);
        ctx.lineTo(arrowX, h/2 - 35);
        ctx.strokeStyle = '#ffeb3b';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.fillStyle = '#ffeb3b';
        ctx.font = '12px Outfit';
        ctx.textAlign = 'left';
        ctx.fillText("Amplitude (A)", arrowX + 8, h/2 - 15);
      }
    },
    {
      term: "Wavelength",
      definition: "The shortest distance between any two points in a wave that are in phase (e.g. crest to crest). SI Unit: Metre (m).",
      draw: (ctx, w, h, t) => {
        ctx.fillStyle = '#0f1424';
        ctx.fillRect(0, 0, w, h);
        
        // Draw Wave
        ctx.beginPath();
        for (let x = 10; x < w - 10; x++) {
          const y = h/2 + Math.sin(x * 0.035) * 30;
          if (x === 10) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Marks at two consecutive crests
        const crest1X = 10 + Math.PI / (2 * 0.035);
        const crest2X = crest1X + (2 * Math.PI) / 0.035;
        const crestY = h/2 - 30;
        
        ctx.beginPath();
        ctx.moveTo(crest1X, crestY);
        ctx.lineTo(crest2X, crestY);
        ctx.strokeStyle = '#ffeb3b';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.fillStyle = '#ffeb3b';
        ctx.font = '12px Outfit';
        ctx.textAlign = 'center';
        ctx.fillText("Wavelength (λ)", (crest1X + crest2X)/2, crestY - 10);
      }
    },
    {
      term: "Period",
      definition: "The time taken to generate one complete wave (or for one complete cycle to pass a fixed point). SI Unit: Second (s).",
      draw: (ctx, w, h, t) => {
        ctx.fillStyle = '#0f1424';
        ctx.fillRect(0, 0, w, h);
        
        // Rotating timer graphic
        ctx.beginPath();
        ctx.arc(w/2, h/2 - 10, 30, 0, Math.PI*2);
        ctx.strokeStyle = '#212c4d';
        ctx.lineWidth = 4;
        ctx.stroke();
        
        // Rotating clock hand
        ctx.beginPath();
        ctx.moveTo(w/2, h/2 - 10);
        ctx.lineTo(w/2 + Math.cos(t*0.06)*25, h/2 - 10 + Math.sin(t*0.06)*25);
        ctx.strokeStyle = '#ffeb3b';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Outfit';
        ctx.textAlign = 'center';
        ctx.fillText("Period T = 1 / f", w/2, h - 20);
      }
    },
    {
      term: "Frequency",
      definition: "The number of complete waves generated per second. SI Unit: Hertz (Hz). Formula: f = 1 / T.",
      draw: (ctx, w, h, t) => {
        ctx.fillStyle = '#0f1424';
        ctx.fillRect(0, 0, w, h);
        
        // Oscillating source
        const waves = 1 + Math.floor(t / 20) % 5;
        ctx.fillStyle = '#ffeb3b';
        ctx.font = '16px Outfit';
        ctx.textAlign = 'center';
        ctx.fillText(`${waves} Waves / Second`, w/2, h/2);
        
        ctx.fillStyle = '#00e5ff';
        ctx.font = '12px Outfit';
        ctx.fillText("Frequency (Hz)", w/2, h/2 + 30);
      }
    }
  ];
  
  let currentCardIndex = 0;
  let activeCards = [...flashcardDeck];
  let cardAnimTime = 0;
  let cardAnimFrameId = null;
  
  const mainFlashcard = document.getElementById('main-flashcard');
  const cardIndexIndicator = document.getElementById('card-index-indicator');
  const cardFrontTitle = document.getElementById('card-front-title');
  const cardBackTitle = document.getElementById('card-back-title');
  const cardBackText = document.getElementById('card-back-text');
  const cardVisualCanvas = document.getElementById('card-visual-canvas');
  const cardVisualCtx = cardVisualCanvas.getContext('2d');
  
  const btnPrevCard = document.getElementById('btn-prev-card');
  const btnNextCard = document.getElementById('btn-next-card');
  const btnShuffleCards = document.getElementById('btn-shuffle-cards');
  
  // Flip card handler
  mainFlashcard.addEventListener('click', () => {
    mainFlashcard.classList.toggle('flipped');
  });
  
  // Resize card canvas
  function resizeCardCanvas() {
    const rect = cardVisualCanvas.parentElement.getBoundingClientRect();
    cardVisualCanvas.width = rect.width;
    cardVisualCanvas.height = rect.height;
  }
  
  function drawCardVisual() {
    resizeCardCanvas();
    cancelAnimationFrame(cardAnimFrameId);
    
    function tick() {
      const activeCard = activeCards[currentCardIndex];
      if (activeCard && activeCard.draw) {
        cardVisualCtx.clearRect(0, 0, cardVisualCanvas.width, cardVisualCanvas.height);
        activeCard.draw(cardVisualCtx, cardVisualCanvas.width, cardVisualCanvas.height, cardAnimTime);
      }
      cardAnimTime++;
      cardAnimFrameId = requestAnimationFrame(tick);
    }
    tick();
  }
  
  function updateCardContents() {
    mainFlashcard.classList.remove('flipped');
    const card = activeCards[currentCardIndex];
    cardFrontTitle.textContent = card.term;
    cardBackTitle.textContent = card.term;
    cardBackText.textContent = card.definition;
    cardIndexIndicator.textContent = `${currentCardIndex + 1} / ${activeCards.length}`;
    drawCardVisual();
  }
  
  function navigateCard(indexOffset) {
    currentCardIndex += indexOffset;
    updateCardContents();
  }

  btnNextCard.addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentCardIndex < activeCards.length - 1) {
      if (mainFlashcard.classList.contains('flipped')) {
        mainFlashcard.classList.remove('flipped');
        setTimeout(() => {
          navigateCard(1);
        }, 300);
      } else {
        navigateCard(1);
      }
    }
  });
  
  btnPrevCard.addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentCardIndex > 0) {
      if (mainFlashcard.classList.contains('flipped')) {
        mainFlashcard.classList.remove('flipped');
        setTimeout(() => {
          navigateCard(-1);
        }, 300);
      } else {
        navigateCard(-1);
      }
    }
  });
  
  btnShuffleCards.addEventListener('click', (e) => {
    e.stopPropagation();
    const performShuffle = () => {
      // Fisher-Yates Shuffle
      for (let i = activeCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [activeCards[i], activeCards[j]] = [activeCards[j], activeCards[i]];
      }
      currentCardIndex = 0;
      updateCardContents();
    };

    if (mainFlashcard.classList.contains('flipped')) {
      mainFlashcard.classList.remove('flipped');
      setTimeout(performShuffle, 300);
    } else {
      performShuffle();
    }
  });
  
  // Swipe Gestures for Mobile
  let cardTouchStartX = 0;
  let cardTouchEndX = 0;
  
  mainFlashcard.addEventListener('touchstart', (e) => {
    cardTouchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  
  mainFlashcard.addEventListener('touchend', (e) => {
    cardTouchEndX = e.changedTouches[0].screenX;
    handleCardSwipe();
  }, { passive: true });
  
  function handleCardSwipe() {
    const diff = cardTouchEndX - cardTouchStartX;
    const thresh = 50; // swipe threshold in px
    
    if (diff < -thresh) { // Swipe Left -> Next Card
      if (currentCardIndex < activeCards.length - 1) {
        if (mainFlashcard.classList.contains('flipped')) {
          mainFlashcard.classList.remove('flipped');
          setTimeout(() => {
            navigateCard(1);
          }, 300);
        } else {
          navigateCard(1);
        }
      }
    } else if (diff > thresh) { // Swipe Right -> Prev Card
      if (currentCardIndex > 0) {
        if (mainFlashcard.classList.contains('flipped')) {
          mainFlashcard.classList.remove('flipped');
          setTimeout(() => {
            navigateCard(-1);
          }, 300);
        } else {
          navigateCard(-1);
        }
      }
    }
  }


  // ==========================================================================
  // SECTION 5: RANDOMISED QUIZ SYSTEM (30 QUESTIONS POOL)
  // ==========================================================================
  const quizPool = [
    {
      type: "mcq",
      category: "definitions",
      question: "What is the amplitude of a transverse wave?",
      options: [
        "The maximum displacement of a particle from its rest position.",
        "The distance between two consecutive wave crests.",
        "The time taken to generate one complete wave cycle.",
        "The number of waves produced in one second."
      ],
      correctIndex: 0,
      explanation: "Amplitude is defined as the maximum displacement of a particle/point in the wave from its rest (equilibrium) position."
    },
    {
      type: "mcq",
      category: "definitions",
      question: "What is the definition of wavelength?",
      options: [
        "The shortest distance between any two points that are in phase.",
        "The height of the wave crest from its rest position.",
        "The distance the wave travels in one hour.",
        "The time taken for a wave crest to double in size."
      ],
      correctIndex: 0,
      explanation: "Wavelength (λ) is the shortest distance between any two points in phase (like crest to crest, or trough to trough)."
    },
    {
      type: "mcq",
      category: "definitions",
      question: "What is the period of a wave?",
      options: [
        "The time taken to generate one complete wave cycle.",
        "The number of complete waves generated in one second.",
        "The speed at which the wave crest propagates forward.",
        "The total duration the wave source operates."
      ],
      correctIndex: 0,
      explanation: "Period (T) is the time taken to produce one complete wave or for one complete cycle to pass a fixed reference point."
    },
    {
      type: "mcq",
      category: "definitions",
      question: "How is the frequency of a wave defined?",
      options: [
        "The number of complete wave cycles generated per second.",
        "The time duration of one complete vibration cycle.",
        "The physical distance between two identical points on a wave.",
        "The maximum speed at which water molecules vibrate."
      ],
      correctIndex: 0,
      explanation: "Frequency (f) is the number of complete waves passing a point or generated per unit time (second). Unit is Hertz (Hz)."
    },
    {
      type: "tf",
      category: "energy_transfer",
      question: "True or False: Matter travels along with a wave from the source to the receiver.",
      options: [
        "True — Particles travel directly from source to destination.",
        "False — Only energy is transferred; particles only vibrate in place."
      ],
      correctIndex: 1,
      explanation: "Waves transfer energy from one location to another, NOT matter. The particles of the medium only vibrate about fixed positions."
    },
    {
      type: "mcq",
      category: "energy_transfer",
      question: "A cork floats on pond water. As water waves pass beneath it, the cork bobs up and down but does not travel to the shore. What does this demonstrate?",
      options: [
        "Waves transfer energy, but not matter.",
        "Waves transfer matter, but not energy.",
        "The cork has too much mass to travel with the wave.",
        "Water ripples do not have a defined wavelength."
      ],
      correctIndex: 0,
      explanation: "The cork's lack of horizontal movement demonstrates that the water medium itself (matter) does not travel; only the wave energy propagates."
    },
    {
      type: "mcq",
      category: "wavefronts",
      question: "What is a wavefront?",
      options: [
        "An imaginary line linking all adjacent points that are in phase.",
        "The boundary between water and air in a ripple tank.",
        "The very front crest of a starting wave train.",
        "The direction of travel of a transverse wave."
      ],
      correctIndex: 0,
      explanation: "A wavefront is a line or surface that connects all adjacent points of a wave that are vibrating in step (in phase), such as adjacent crests."
    },
    {
      type: "mcq",
      category: "definitions",
      question: "If the frequency of a wave increases while its propagation speed remains constant, the wavelength will ___.",
      options: [
        "decrease",
        "increase",
        "remain the same",
        "oscillate randomly"
      ],
      correctIndex: 0,
      explanation: "Using the wave equation v = f * λ, if v is constant, frequency (f) is inversely proportional to wavelength (λ). Increasing f decreases λ."
    },
    {
      type: "graph",
      category: "graph_reading",
      question: "Look at the wave graph. Which letter represents the Crest?",
      options: ["A (Peak of the wave)", "B (Equilibrium line)", "C (Lowest point of the wave)", "D (One wave cycle length)"],
      correctIndex: 0,
      explanation: "The crest is the highest point of displacement above the rest position (marked as A)."
    },
    {
      type: "graph",
      category: "graph_reading",
      question: "Look at the wave graph. Which letter represents the Trough?",
      options: ["C (Lowest point of the wave)", "A (Highest point of the wave)", "B (Middle position)", "D (Wavelength marker)"],
      correctIndex: 0,
      explanation: "The trough is the lowest point or maximum negative displacement below the rest position (marked as C)."
    },
    {
      type: "mcq",
      category: "definitions",
      question: "What is the SI unit of frequency?",
      options: [
        "Hertz (Hz)",
        "Second (s)",
        "Metre (m)",
        "Newton (N)"
      ],
      correctIndex: 0,
      explanation: "The SI unit of wave frequency is Hertz (Hz), which corresponds to cycles per second (s^-1)."
    },
    {
      type: "mcq",
      category: "definitions",
      question: "What is the SI unit of wavelength?",
      options: [
        "Metre (m)",
        "Centimetre (cm)",
        "Hertz (Hz)",
        "Second (s)"
      ],
      correctIndex: 0,
      explanation: "Since wavelength represents a physical distance, its standard SI unit is the Metre (m)."
    },
    {
      type: "tf",
      category: "wavefronts",
      question: "True or False: The direction of wave travel is always perpendicular (at 90 degrees) to the wavefronts.",
      options: [
        "True — Rays of propagation are always perpendicular to wavefront lines.",
        "False — Rays run parallel to wavefronts."
      ],
      correctIndex: 0,
      explanation: "The direction of energy propagation (wave rays) is always at right angles (perpendicular) to the wavefront lines."
    },
    {
      type: "mcq",
      category: "definitions",
      question: "A wave has a frequency of 5 Hz. How long does it take for one complete wave to pass a given point?",
      options: [
        "0.2 seconds",
        "5.0 seconds",
        "1.0 second",
        "2.5 seconds"
      ],
      correctIndex: 0,
      explanation: "Period T = 1 / f. Therefore, T = 1 / 5 = 0.2 seconds."
    },
    {
      type: "mcq",
      category: "definitions",
      question: "If a wave's period is 0.5 seconds, what is its frequency?",
      options: [
        "2 Hz",
        "0.5 Hz",
        "5 Hz",
        "10 Hz"
      ],
      correctIndex: 0,
      explanation: "Frequency f = 1 / T. Therefore, f = 1 / 0.5 = 2 Hz."
    },
    {
      type: "tf",
      category: "definitions",
      question: "True or False: Wave speed can be calculated by multiplying frequency by wavelength (v = f * λ).",
      options: [
        "True",
        "False"
      ],
      correctIndex: 0,
      explanation: "Yes, v = f * λ is the fundamental wave equation relating speed, frequency, and wavelength."
    },
    {
      type: "mcq",
      category: "definitions",
      question: "In a transverse wave, the particles of the medium vibrate in a direction that is ___ to the direction of wave travel.",
      options: [
        "perpendicular (at 90°)",
        "parallel",
        "opposite",
        "random"
      ],
      correctIndex: 0,
      explanation: "In transverse waves, particle vibration is perpendicular (90 degrees) to the direction of wave propagation."
    },
    {
      type: "mcq",
      category: "wavefronts",
      question: "A ripple tank source is vibrating with a high frequency. What will you observe on the screen below?",
      options: [
        "Ripples (wavefronts) are closer together.",
        "Ripples (wavefronts) are further apart.",
        "Ripples travel much faster.",
        "Ripples become completely invisible."
      ],
      correctIndex: 0,
      explanation: "A higher frequency means a shorter wavelength (since water speed is constant in uniform depth), causing wavefronts to bunch closer together."
    },
    {
      type: "mcq",
      category: "definitions",
      question: "A leaf floating on a pond bobs up and down 6 times in 3 seconds. What is the frequency of this water wave?",
      options: [
        "2 Hz",
        "0.5 Hz",
        "18 Hz",
        "3 Hz"
      ],
      correctIndex: 0,
      explanation: "Frequency is the number of cycles per second: 6 cycles / 3 seconds = 2 Hz."
    },
    {
      type: "mcq",
      category: "definitions",
      question: "Which wave parameter represents the maximum displacement of a particle from its rest position?",
      options: [
        "Amplitude",
        "Wavelength",
        "Frequency",
        "Crest"
      ],
      correctIndex: 0,
      explanation: "Amplitude is defined as the maximum displacement from the equilibrium/rest position."
    },
    {
      type: "tf",
      category: "wavefronts",
      question: "True or False: A wavefront represents a line linking all adjacent points of the wave that are in phase.",
      options: [
        "True",
        "False"
      ],
      correctIndex: 0,
      explanation: "This is the exact definition of a wavefront: a line connecting points in phase."
    },
    {
      type: "mcq",
      category: "wavefronts",
      question: "Bright and dark bands are observed on the screen below a ripple tank. The bright bands correspond to:",
      options: [
        "Wave crests, which act as converging lenses and focus light.",
        "Wave troughs, which block the light.",
        "Water molecules flowing faster.",
        "Areas where the glass tank is scratched."
      ],
      correctIndex: 0,
      explanation: "Wave crests act as convex (converging) lenses, focusing light from above onto the screen below to produce bright lines."
    },
    {
      type: "mcq",
      category: "energy_transfer",
      question: "If the amplitude of a water wave is doubled, what happens to the energy it transfers?",
      options: [
        "The energy increases by four times.",
        "The energy remains unchanged.",
        "The energy is doubled.",
        "The energy is halved."
      ],
      correctIndex: 0,
      explanation: "The energy (and intensity) of a wave is proportional to the square of its amplitude (E ∝ A^2). Doubling A increases E by 2^2 = 4 times."
    },
    {
      type: "mcq",
      category: "energy_transfer",
      question: "A speaker produces sound waves. How do dust particles in the air behave as the sound travels through the room?",
      options: [
        "They vibrate back and forth in fixed positions.",
        "They are blown forward towards the listener's ears.",
        "They fall immediately to the ground.",
        "They rotate in tiny circles."
      ],
      correctIndex: 0,
      explanation: "Sound is a wave, which transfers energy, not matter. Dust particles in air (medium) vibrate about their equilibrium positions but do not travel."
    },
    {
      type: "mcq",
      category: "definitions",
      question: "Which equation correctly relates wave speed (v), frequency (f), and wavelength (λ)?",
      options: [
        "v = f * λ",
        "f = v * λ",
        "λ = v * f",
        "v = f / λ"
      ],
      correctIndex: 0,
      explanation: "The wave speed equation is v = f * λ (speed equals frequency times wavelength)."
    },
    {
      type: "tf",
      category: "definitions",
      question: "True or False: Water ripples in a shallow pond are longitudinal waves.",
      options: [
        "False — Water waves are transverse/surface waves.",
        "True"
      ],
      correctIndex: 0,
      explanation: "Water ripples are transverse waves. Longitudinal waves consist of compressions and rarefactions, like sound waves."
    },
    {
      type: "mcq",
      category: "definitions",
      question: "The time taken for one complete wave to pass a point is called its ___.",
      options: [
        "period",
        "frequency",
        "amplitude",
        "wavelength"
      ],
      correctIndex: 0,
      explanation: "The time taken for one cycle/wave to pass is the definition of the Period (T)."
    },
    {
      type: "mcq",
      category: "graph_reading",
      question: "In a wave graph, what is the horizontal distance from one crest to the next crest representing?",
      options: [
        "Wavelength",
        "Amplitude",
        "Wave Speed",
        "Period"
      ],
      correctIndex: 0,
      explanation: "The distance from one crest to the next consecutive crest is one Wavelength."
    },
    {
      type: "mcq",
      category: "definitions",
      question: "Which wave property depends solely on the source of vibration and does not change when the wave enters a new medium?",
      options: [
        "Frequency",
        "Wavelength",
        "Speed",
        "Amplitude"
      ],
      correctIndex: 0,
      explanation: "The frequency of a wave is determined entirely by the vibrating source. When transitioning media, wave speed and wavelength change, but frequency remains constant."
    },
    {
      type: "tf",
      category: "energy_transfer",
      question: "True or False: A wave transfers energy away from its source.",
      options: [
        "True — The main physical function of a wave is energy transfer.",
        "False — Energy stays at the source."
      ],
      correctIndex: 0,
      explanation: "Waves propagate energy away from the source of vibration through a medium or vacuum."
    }
  ];

  // Quiz game state variables
  let currentQuestions = [];
  let currentQuestionIndex = 0;
  let quizScore = 0;
  let userSelectedAnswers = []; // to track correctness per category
  let quizWaveTime = 0;
  let quizWaveFrameId = null;

  const quizStartCard = document.getElementById('quiz-start-card');
  const quizPlayCard = document.getElementById('quiz-play-card');
  const quizResultsCard = document.getElementById('quiz-results-card');
  
  const quizCurrIdx = document.getElementById('quiz-curr-idx');
  const quizTotalIdx = document.getElementById('quiz-total-idx');
  const quizProgressFill = document.getElementById('quiz-progress-fill');
  const quizCurrScore = document.getElementById('quiz-curr-score');
  
  const quizQuestionText = document.getElementById('quiz-question-text');
  const quizOptionsGrid = document.getElementById('quiz-options-grid');
  const quizGraphContainer = document.getElementById('quiz-graph-container');
  const quizWaveCanvas = document.getElementById('quiz-wave-canvas');
  
  const quizFeedbackBox = document.getElementById('quiz-feedback-box');
  const feedbackIcon = document.getElementById('feedback-icon');
  const feedbackStatusText = document.getElementById('feedback-status-text');
  const feedbackExplanation = document.getElementById('feedback-explanation');
  
  const btnStartQuiz = document.getElementById('btn-start-quiz');
  const btnNextQuestion = document.getElementById('btn-next-question');
  const btnRestartQuiz = document.getElementById('btn-restart-quiz');
  const btnBackToStudy = document.getElementById('btn-back-to-study');

  btnStartQuiz.addEventListener('click', startQuizSession);
  btnRestartQuiz.addEventListener('click', startQuizSession);
  btnBackToStudy.addEventListener('click', () => {
    switchTab('intro');
  });

  function startQuizSession() {
    quizStartCard.classList.add('hide');
    quizResultsCard.classList.add('hide');
    quizPlayCard.classList.remove('hide');
    
    // Select 10 random questions from the pool
    // Shuffle the pool and slice
    const shuffledPool = [...quizPool].sort(() => 0.5 - Math.random());
    currentQuestions = shuffledPool.slice(0, 10);
    
    currentQuestionIndex = 0;
    quizScore = 0;
    userSelectedAnswers = [];
    
    quizTotalIdx.textContent = currentQuestions.length;
    quizCurrScore.textContent = quizScore;
    
    renderCurrentQuestion();
  }

  // Visual graph animator for graph questions
  function startQuizWaveLoop() {
    cancelAnimationFrame(quizWaveFrameId);
    const ctx = quizWaveCanvas.getContext('2d');
    
    function tick() {
      if (quizGraphContainer.classList.contains('hide')) return;
      
      const w = quizWaveCanvas.width;
      const h = quizWaveCanvas.height;
      ctx.clearRect(0, 0, w, h);
      
      // Draw static axes
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(40, h/2);
      ctx.lineTo(w - 20, h/2);
      ctx.moveTo(40, 20);
      ctx.lineTo(40, h - 20);
      ctx.stroke();
      
      // Draw simple sine wave
      ctx.beginPath();
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 3.5;
      
      const waveStartX = 40;
      const waveEndX = w - 20;
      
      for (let x = waveStartX; x <= waveEndX; x++) {
        // Static wave displacement vs distance
        const y = h/2 + Math.sin((x - waveStartX) / 110 * Math.PI * 2) * 50;
        if (x === waveStartX) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      
      // Label critical spots:
      // A: Crest
      // B: Zero-crossing (period/equilib)
      // C: Trough
      // D: Full cycle length (wavelength)
      
      // Mark A (Crest)
      const crestX = waveStartX + 110 / 4;
      const crestY = h/2 - 50;
      drawMarkedPoint(ctx, crestX, crestY, "A (Crest)");
      
      // Mark B (Center equilibrium)
      const centerY = h/2;
      drawMarkedPoint(ctx, waveStartX + 110 / 2, centerY, "B");
      
      // Mark C (Trough)
      const troughX = waveStartX + 110 * 0.75;
      const troughY = h/2 + 50;
      drawMarkedPoint(ctx, troughX, troughY, "C (Trough)");
      
      // Mark D (Wavelength helper)
      drawMarkedPoint(ctx, waveStartX + 110, centerY, "D");
      
      quizWaveTime++;
      quizWaveFrameId = requestAnimationFrame(tick);
    }
    
    // Set internal dimensions matching view
    const rect = quizWaveCanvas.parentElement.getBoundingClientRect();
    quizWaveCanvas.width = rect.width;
    quizWaveCanvas.height = rect.height;
    
    tick();
  }
  
  function drawMarkedPoint(ctx, x, y, label) {
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI*2);
    ctx.fillStyle = '#ffeb3b';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Outfit';
    ctx.fillText(label, x - 10, y - 12);
  }
  
  function stopQuizWaveLoop() {
    cancelAnimationFrame(quizWaveFrameId);
  }

  function renderCurrentQuestion() {
    // Reset state
    quizFeedbackBox.classList.add('hide');
    quizOptionsGrid.innerHTML = '';
    
    // Update progress bar
    quizCurrIdx.textContent = currentQuestionIndex + 1;
    const progressPercent = (currentQuestionIndex / currentQuestions.length) * 100;
    quizProgressFill.style.width = `${progressPercent}%`;
    
    const question = currentQuestions[currentQuestionIndex];
    quizQuestionText.textContent = question.question;
    
    // Check if graphical category
    if (question.type === "graph") {
      quizGraphContainer.classList.remove('hide');
      startQuizWaveLoop();
    } else {
      quizGraphContainer.classList.add('hide');
      stopQuizWaveLoop();
    }
    
    // Build options with randomized index pairing to maintain correctness checks
    // We map options into a structured array, then shuffle them
    const optionsWithMapping = question.options.map((opt, index) => {
      return { text: opt, isCorrect: index === question.correctIndex };
    });
    
    // Shuffle options array
    const shuffledOptions = optionsWithMapping.sort(() => 0.5 - Math.random());
    
    shuffledOptions.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.textContent = opt.text;
      
      btn.addEventListener('click', () => {
        // Disable other options immediately after clicking
        const allBtns = quizOptionsGrid.querySelectorAll('.option-btn');
        allBtns.forEach(b => b.disabled = true);
        
        handleOptionSelection(opt, btn, allBtns);
      });
      
      quizOptionsGrid.appendChild(btn);
    });
  }

  function handleOptionSelection(option, clickedBtn, allBtns) {
    const question = currentQuestions[currentQuestionIndex];
    const isCorrect = option.isCorrect;
    
    // Record user answer category stats
    userSelectedAnswers.push({
      category: question.category,
      correct: isCorrect
    });
    
    if (isCorrect) {
      quizScore++;
      quizCurrScore.textContent = quizScore;
      clickedBtn.classList.add('selected-correct');
      
      // Setup feedback banner
      quizFeedbackBox.className = "feedback-box correct-fb";
      feedbackIcon.textContent = "✓";
      feedbackStatusText.textContent = "Correct!";
    } else {
      clickedBtn.classList.add('selected-incorrect');
      
      // Highlight correct answer
      allBtns.forEach(btn => {
        // Find which button contains correct text
        const correctText = question.options[question.correctIndex];
        if (btn.textContent === correctText) {
          btn.classList.add('correct-reveal');
        }
      });
      
      quizFeedbackBox.className = "feedback-box incorrect-fb";
      feedbackIcon.textContent = "✗";
      feedbackStatusText.textContent = "Incorrect";
    }
    
    feedbackExplanation.textContent = question.explanation;
    quizFeedbackBox.classList.remove('hide');
  }

  btnNextQuestion.addEventListener('click', () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      currentQuestionIndex++;
      renderCurrentQuestion();
    } else {
      // End of quiz, show scoreboard details
      showScoreboardResults();
    }
  });


  // ==========================================================================
  // SECTION 6: SCORING & DIAGNOSTIC FEEDBACK
  // ==========================================================================
  const resultsScoreNum = document.getElementById('results-score-num');
  const resultsTierTitle = document.getElementById('results-tier-title');
  const resultsTierMsg = document.getElementById('results-tier-msg');
  const diagnosticsList = document.getElementById('diagnostics-list');
  const confettiCanvas = document.getElementById('confetti-canvas');
  
  let confettiCtx = confettiCanvas.getContext('2d');
  let confettiFrameId = null;

  function showScoreboardResults() {
    quizPlayCard.classList.add('hide');
    quizResultsCard.classList.remove('hide');
    
    const finalScore = quizScore;
    const totalCount = currentQuestions.length;
    const scorePercentage = (finalScore / totalCount) * 100;
    
    resultsScoreNum.textContent = `${finalScore}/${totalCount}`;
    
    // Diagnostics grouping by concept category
    const categories = {
      definitions: { name: "Definitions & Units", correct: 0, total: 0 },
      energy_transfer: { name: "Energy & Matter Transfer", correct: 0, total: 0 },
      wavefronts: { name: "Wavefront Concepts", correct: 0, total: 0 },
      graph_reading: { name: "Graph Interpretation", correct: 0, total: 0 }
    };
    
    userSelectedAnswers.forEach(ans => {
      if (categories[ans.category]) {
        categories[ans.category].total++;
        if (ans.correct) categories[ans.category].correct++;
      }
    });
    
    // Render categories diagnostics list
    diagnosticsList.innerHTML = '';
    Object.keys(categories).forEach(key => {
      const cat = categories[key];
      if (cat.total > 0) {
        const percent = Math.round((cat.correct / cat.total) * 100);
        
        const item = document.createElement('div');
        item.className = 'diag-item';
        item.innerHTML = `
          <span class="diag-name">${cat.name}</span>
          <div class="diag-right-col">
            <div class="diag-bar-bg">
              <div class="diag-bar-fill" style="width: ${percent}%"></div>
            </div>
            <span class="diag-score">${percent}%</span>
          </div>
        `;
        diagnosticsList.appendChild(item);
      }
    });
    
    // Set 3-tier feedback messaging
    if (scorePercentage >= 80) {
      resultsTierTitle.textContent = "Outstanding Mastery!";
      resultsTierMsg.textContent = "You've shown a solid understanding of Wave Motion Basics. Excellent work!";
      // Trigger confetti celebration
      triggerConfettiBurst();
    } else if (scorePercentage >= 50) {
      resultsTierTitle.textContent = "Good Effort!";
      resultsTierMsg.textContent = "You did well, but could benefit from revising the highlighted concept areas above.";
    } else {
      resultsTierTitle.textContent = "Let's Review the Basics";
      resultsTierMsg.innerHTML = `You had some trouble with the questions. We recommend reading through <a href="#" id="study-basics-link" style="color: var(--accent-cyan); font-weight: bold;">Section 1: Concept Introduction</a> again.`;
      
      // Add quick action link helper
      setTimeout(() => {
        const link = document.getElementById('study-basics-link');
        if (link) {
          link.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab('intro');
          });
        }
      }, 100);
    }
  }

  // Confetti Particle System
  let particles = [];
  function triggerConfettiBurst() {
    cancelAnimationFrame(confettiFrameId);
    
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
    
    particles = [];
    const colors = ['#00e5ff', '#ffeb3b', '#ffffff', '#212c4d'];
    
    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * confettiCanvas.width,
        y: Math.random() * confettiCanvas.height - confettiCanvas.height,
        r: Math.random() * 6 + 4,
        d: Math.random() * confettiCanvas.height,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.random() * 10 - 5,
        tiltAngleIncremental: Math.random() * 0.07 + 0.02,
        tiltAngle: 0
      });
    }
    
    let duration = 180; // frames
    
    function drawConfetti() {
      confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      
      particles.forEach((p, idx) => {
        p.tiltAngle += p.tiltAngleIncremental;
        p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
        p.x += Math.sin(p.tiltAngle);
        p.tilt = Math.sin(p.tiltAngle - idx/3) * 15;
        
        confettiCtx.beginPath();
        confettiCtx.lineWidth = p.r;
        confettiCtx.strokeStyle = p.color;
        confettiCtx.moveTo(p.x + p.tilt + p.r / 2, p.y);
        confettiCtx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
        confettiCtx.stroke();
      });
      
      duration--;
      if (duration > 0) {
        confettiFrameId = requestAnimationFrame(drawConfetti);
      } else {
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      }
    }
    
    drawConfetti();
  }


  // ==========================================================================
  // INITIALIZATION HANDLER
  // ==========================================================================
  resizeIntroCanvases();
  startIntroLoops();
  
  // Set starting flashcard content
  updateCardContents();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
