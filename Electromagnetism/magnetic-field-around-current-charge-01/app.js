/**
 * Magnetic Field Around A Current / Charge - Simulation Controller
 * Designed for Singapore GCE O-Level Physics Syllabus 6091
 */

const canvas = document.getElementById('physics-canvas');
const ctx = canvas.getContext('2d');

// Quaternion Helper Class for unconstrained 3D rotation
class Quaternion {
  constructor(w = 1, x = 0, y = 0, z = 0) {
    this.w = w;
    this.x = x;
    this.y = y;
    this.z = z;
  }

  normalize() {
    const len = Math.sqrt(this.w * this.w + this.x * this.x + this.y * this.y + this.z * this.z);
    if (len === 0) {
      this.w = 1; this.x = 0; this.y = 0; this.z = 0;
    } else {
      this.w /= len; this.x /= len; this.y /= len; this.z /= len;
    }
    return this;
  }

  multiply(q) {
    return new Quaternion(
      this.w * q.w - this.x * q.x - this.y * q.y - this.z * q.z,
      this.w * q.x + this.x * q.w + this.y * q.z - this.z * q.y,
      this.w * q.y - this.x * q.z + this.y * q.w + this.z * q.x,
      this.w * q.z + this.x * q.y - this.y * q.x + this.z * q.w
    );
  }

  static fromAxisAngle(x, y, z, angle) {
    const halfAngle = angle / 2;
    const sinHalf = Math.sin(halfAngle);
    const cosHalf = Math.cos(halfAngle);
    
    // Normalize axis
    const len = Math.sqrt(x * x + y * y + z * z);
    if (len === 0) return new Quaternion();
    
    return new Quaternion(
      cosHalf,
      (x / len) * sinHalf,
      (y / len) * sinHalf,
      (z / len) * sinHalf
    );
  }

  rotateVector(v) {
    const qv = new Quaternion(0, v.x, v.y, v.z);
    const qConj = new Quaternion(this.w, -this.x, -this.y, -this.z);
    const result = this.multiply(qv).multiply(qConj);
    return { x: result.x, y: result.y, z: result.z };
  }
}

// State configuration
const state = {
  viewMode: '3d', // '3d' or '2d'
  currentDirection: 'up', // 'up' (out of page/upwards) or 'down' (into page/downwards)
  flowType: 'conventional', // 'conventional' or 'electron'
  magnitude: 2.0, // range 0 to 5
  showHandRule: true,
  showFieldDots: true,
  numPlanes: 1, // 1 or 10 planes along the wire in 3D
  showFieldDirection: true, // show direction arrows on magnetic field lines
  // Orientation quaternion (Default: angled perspective view)
  orientation: Quaternion.fromAxisAngle(0, 1, 0, -0.5).multiply(Quaternion.fromAxisAngle(1, 0, 0, 0.5)).normalize()
};

// Interaction State
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

// UI Elements
const btnToggleView = document.getElementById('btn-toggle-view');
const viewModeTitle = document.getElementById('view-mode-title');
const currentMagnitudeSlider = document.getElementById('current-magnitude');
const magnitudeVal = document.getElementById('magnitude-val');
const showHandRuleCheckbox = document.getElementById('show-hand-rule');
const showFieldDotsCheckbox = document.getElementById('show-field-dots');
const showFieldDirectionCheckbox = document.getElementById('show-field-direction');
const compassOverlay = document.getElementById('compass-overlay');

// Color palette constants matching CSS variables
const COLORS = {
  wire: '#4b5563',
  wireGlow: 'rgba(75, 85, 99, 0.3)',
  conventional: '#ff3b6f',
  conventionalGlow: 'rgba(255, 59, 111, 0.4)',
  electron: '#ffd23f',
  electronGlow: 'rgba(255, 210, 63, 0.4)',
  magnetic: '#00ffff',
  magneticGlow: 'rgba(0, 255, 255, 0.4)',
  board: 'rgba(30, 41, 59, 0.55)',
  boardStroke: 'rgba(255, 255, 255, 0.15)',
};

// Animation variables
let particles = [];
let animFrameId = null;
const fieldRotationAngle = 0; // Static direction arrows

// Setup resize listener
function resizeCanvas() {
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width * window.devicePixelRatio;
  canvas.height = rect.height * window.devicePixelRatio;
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
}

// 3D coordinate projection using current Quaternion orientation
function project(x, y, z, centerX, centerY) {
  const v = { x, y, z };
  const rotated = state.orientation.rotateVector(v);
  return {
    x: centerX + rotated.x,
    y: centerY + rotated.y,
    z: rotated.z
  };
}

// Particle class for flowing charges along the wire
class ChargeParticle {
  constructor(y, isElectron) {
    this.y = y;
    this.speed = 0;
    this.isElectron = isElectron;
    this.offset = Math.random() * Math.PI * 2;
  }

  update(currentMag, direction, height) {
    let dirMultiplier = direction === 'up' ? -1 : 1;
    if (this.isElectron) {
      dirMultiplier *= -1;
    }
    
    this.speed = currentMag * 1.5 * dirMultiplier;
    this.y += this.speed;

    const halfHeight = height / 2;
    if (this.y < -halfHeight) {
      this.y = halfHeight;
    } else if (this.y > halfHeight) {
      this.y = -halfHeight;
    }
  }

  draw3D(centerX, centerY) {
    const radius = 4.5;
    const rOffset = Math.sin(this.y * 0.05 + this.offset) * 1.5;
    const pt = project(rOffset, this.y, 0, centerX, centerY);

    ctx.save();
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = this.isElectron ? COLORS.electron : COLORS.conventional;
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.isElectron ? COLORS.electron : COLORS.conventional;
    ctx.fill();
    ctx.restore();
  }
}

// Initialize particles
function initParticles() {
  particles = [];
  const particleCount = 20;
  const height = canvas.clientHeight || 500;
  for (let i = 0; i < particleCount; i++) {
    particles.push(new ChargeParticle((Math.random() - 0.5) * height, state.flowType === 'electron'));
  }
}

// Event Listeners Configuration
function setupEventListeners() {
  // View Toggle
  btnToggleView.addEventListener('click', () => {
    state.viewMode = state.viewMode === '3d' ? '2d' : '3d';
    if (state.viewMode === '3d') {
      viewModeTitle.textContent = '3D Perspective View (Drag to Rotate)';
      btnToggleView.textContent = 'Switch to 2D Cross-Section';
      state.orientation = Quaternion.fromAxisAngle(0, 1, 0, -0.5).multiply(Quaternion.fromAxisAngle(1, 0, 0, 0.5)).normalize();
    } else {
      viewModeTitle.textContent = '2D Cross-Section (Top-Down)';
      btnToggleView.textContent = 'Switch to 3D Perspective';
    }
  });

  // Current Direction radio toggles
  document.querySelectorAll('input[name="current-direction"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      state.currentDirection = e.target.value;
      updateCompassOverlay();
    });
  });

  // Flow Type radio toggles
  document.querySelectorAll('input[name="flow-type"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      state.flowType = e.target.value;
      initParticles();
    });
  });

  // Field planes stack toggles
  document.querySelectorAll('input[name="field-planes"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      state.numPlanes = parseInt(e.target.value, 10);
    });
  });

  // Magnitude Slider
  currentMagnitudeSlider.addEventListener('input', (e) => {
    state.magnitude = parseFloat(e.target.value);
    magnitudeVal.textContent = state.magnitude === 0 ? 'Off' : `${state.magnitude.toFixed(1)} A`;
  });

  // Checkboxes
  showHandRuleCheckbox.addEventListener('change', (e) => {
    state.showHandRule = e.target.checked;
  });

  showFieldDotsCheckbox.addEventListener('change', (e) => {
    state.showFieldDots = e.target.checked;
  });

  showFieldDirectionCheckbox.addEventListener('change', (e) => {
    state.showFieldDirection = e.target.checked;
  });

  // Drag interaction math
  canvas.addEventListener('mousedown', (e) => {
    if (state.viewMode !== '3d') return;
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging || state.viewMode !== '3d') return;
    
    const deltaX = e.clientX - previousMousePosition.x;
    const deltaY = e.clientY - previousMousePosition.y;
    
    const dx = deltaX * 0.007;
    const dy = deltaY * 0.007;
    const dragDistance = Math.sqrt(dx * dx + dy * dy);
    
    if (dragDistance > 0) {
      const rotAxisX = dy;
      const rotAxisY = -dx;
      const qIncrement = Quaternion.fromAxisAngle(rotAxisX, rotAxisY, 0, dragDistance);
      state.orientation = qIncrement.multiply(state.orientation).normalize();
    }
    
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Touch screen support
  canvas.addEventListener('touchstart', (e) => {
    if (state.viewMode !== '3d' || e.touches.length === 0) return;
    isDragging = true;
    previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });

  canvas.addEventListener('touchmove', (e) => {
    if (!isDragging || state.viewMode !== '3d' || e.touches.length === 0) return;
    const deltaX = e.touches[0].clientX - previousMousePosition.x;
    const deltaY = e.touches[0].clientY - previousMousePosition.y;
    
    const dx = deltaX * 0.007;
    const dy = deltaY * 0.007;
    const dragDistance = Math.sqrt(dx * dx + dy * dy);
    
    if (dragDistance > 0) {
      const rotAxisX = dy;
      const rotAxisY = -dx;
      const qIncrement = Quaternion.fromAxisAngle(rotAxisX, rotAxisY, 0, dragDistance);
      state.orientation = qIncrement.multiply(state.orientation).normalize();
    }
    
    previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });

  canvas.addEventListener('touchend', () => {
    isDragging = false;
  });
}

function updateCompassOverlay() {
  if (state.currentDirection === 'up') {
    compassOverlay.textContent = 'Right-Hand Grip Rule: Thumb points UP / OUT';
  } else {
    compassOverlay.textContent = 'Right-Hand Grip Rule: Thumb points DOWN / IN';
  }
}

// Main Draw loop
function draw() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  ctx.clearRect(0, 0, width, height);

  if (state.viewMode === '3d') {
    draw3DView(width, height);
  } else {
    draw2DView(width, height);
  }

  animFrameId = requestAnimationFrame(draw);
}

// Dynamically compute concentric ring radii to fill the workspace.
// Spacing is closer near the current/charge and exponentially further apart outwards.
// This visually correctly maps to B ~ 1/r density.
function getFieldRadii(magnitude) {
  if (magnitude === 0) return [];
  
  // Growth factor determines how quickly the lines spread out.
  // High magnitude -> lines stay closer together longer (smaller growth factor).
  // Low magnitude -> lines spread out faster (larger growth factor).
  const growthFactor = 1.35 - (magnitude / 5) * 0.15; // Range: ~1.35 to 1.20
  
  const radii = [];
  let currentRadius = 15; // Start very close to wire
  
  // Keep generating rings until we hit the edge of the visible canvas space (~380px radius)
  while (currentRadius < 380) {
    radii.push(currentRadius);
    currentRadius *= growthFactor;
  }
  
  return radii;
}

// 3D Perspective Draw Mode
function draw3DView(width, height) {
  const centerX = width / 2;
  const centerY = height / 2;
  const halfHeight = height / 2;

  // 1. Draw Horizontal Board Plane (Removed as requested)

  // 2. Draw Back half of vertical wire
  ctx.save();
  const topPt = project(0, -halfHeight, 0, centerX, centerY);
  const midPt = project(0, 0, 0, centerX, centerY);
  ctx.beginPath();
  ctx.moveTo(topPt.x, topPt.y);
  ctx.lineTo(midPt.x, midPt.y);
  ctx.lineWidth = 12;
  ctx.strokeStyle = COLORS.wire;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.restore();

  // 3. Draw intensity glow on board
  if (state.showFieldDots && state.magnitude > 0) {
    const glowRadii = [240, 180, 120, 60, 20];
    glowRadii.forEach((gr, idx) => {
      ctx.save();
      ctx.beginPath();
      const points = [];
      const segs = 32;
      for (let s = 0; s <= segs; s++) {
        const theta = (s / segs) * Math.PI * 2;
        points.push(project(Math.cos(theta) * gr, 0, Math.sin(theta) * gr, centerX, centerY));
      }
      ctx.moveTo(points[0].x, points[0].y);
      for (let s = 1; s <= segs; s++) {
        ctx.lineTo(points[s].x, points[s].y);
      }
      ctx.closePath();
      const intensity = (state.magnitude / 5) * 0.05;
      ctx.fillStyle = `rgba(0, 255, 255, ${intensity})`;
      ctx.fill();
      ctx.restore();
    });
  }

  // 4. Draw Concentric Magnetic Field Rings
  const baseRadii = getFieldRadii(state.magnitude);
  if (baseRadii.length > 0) {
    const planes = [];
    if (state.numPlanes === 10) {
      for (let p = 0; p < 10; p++) {
        planes.push(-225 + p * 50); // 10 planes spaced from -225 to +225
      }
    } else {
      planes.push(0);
    }
    
    planes.forEach((planeY, planeIndex) => {
      // Fade out planes further from the center (y=0) to keep the central focus and depth
      const distanceVal = Math.abs(planeY);
      const maxDist = 225;
      const planeOpacityFade = planeY === 0 ? 1 : 1 - (distanceVal / maxDist) * 0.7;

      for (let i = 0; i < baseRadii.length; i++) {
        const radius = baseRadii[i];
        const segments = 64;
        
        const points = [];
        for (let s = 0; s <= segments; s++) {
          const theta = (s / segments) * Math.PI * 2;
          const rx = Math.cos(theta) * radius;
          const rz = Math.sin(theta) * radius;
          points.push(project(rx, planeY, rz, centerX, centerY));
        }
        
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let s = 1; s <= segments; s++) {
          ctx.lineTo(points[s].x, points[s].y);
        }
        
        const distanceFactor = 1 - (i / baseRadii.length) * 0.8;
        const opacity = (state.magnitude / 5) * 0.85 * distanceFactor * planeOpacityFade;
        ctx.strokeStyle = `rgba(0, 255, 255, ${opacity})`;
        ctx.lineWidth = Math.max(0.6, 2.5 - (i * 0.12)); // Thins out outer rings slowly
        ctx.setLineDash([7, 5]);
        ctx.stroke();

        // Static tangent arrows indicating correct 3D direction
        if (state.showFieldDirection) {
          const arrowCount = Math.max(3, 8 - Math.floor(i / 2));
          const rotationDirection = state.currentDirection === 'up' ? 1 : -1;
          
          for (let j = 0; j < arrowCount; j++) {
            // Offset arrow angles between planes to make them look more organic
            const planeAngleOffset = planeIndex * 0.4;
            const angle = fieldRotationAngle + planeAngleOffset + (j * (Math.PI * 2 / arrowCount));
            
            const ringX = Math.cos(angle) * radius;
            const ringZ = Math.sin(angle) * radius;
            const pCurrent = project(ringX, planeY, ringZ, centerX, centerY);
            
            const deltaAngle = 0.05 * rotationDirection;
            const ringXNext = Math.cos(angle + deltaAngle) * radius;
            const ringZNext = Math.sin(angle + deltaAngle) * radius;
            const pNext = project(ringXNext, planeY, ringZNext, centerX, centerY);
            
            const arrowDir = Math.atan2(pNext.y - pCurrent.y, pNext.x - pCurrent.x);
            
            ctx.save();
            ctx.translate(pCurrent.x, pCurrent.y);
            ctx.rotate(arrowDir);
            
            ctx.beginPath();
            ctx.moveTo(-6, -4);
            ctx.lineTo(4, 0);
            ctx.lineTo(-6, 4);
            ctx.closePath();
            ctx.fillStyle = `rgba(0, 255, 255, ${opacity + 0.2})`;
            ctx.fill();
            ctx.restore();
          }
        }
        ctx.restore();
      }
    });
  }

  // 5. Draw Front half of vertical wire
  ctx.save();
  const bottomPt = project(0, halfHeight, 0, centerX, centerY);
  ctx.beginPath();
  ctx.moveTo(midPt.x, midPt.y);
  ctx.lineTo(bottomPt.x, bottomPt.y);
  ctx.lineWidth = 12;
  ctx.strokeStyle = COLORS.wire;
  ctx.lineCap = 'round';
  ctx.stroke();
  
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();
  ctx.restore();

  // 6. Draw charges flowing down/up the wire center
  if (state.magnitude > 0) {
    particles.forEach(p => {
      p.update(state.magnitude, state.currentDirection, height);
      p.draw3D(centerX, centerY);
    });
  }

  // 7. Right-Hand Grip Rule 3D Guide
  if (state.showHandRule && state.magnitude > 0) {
    draw3DHandRule(centerX, centerY + 115, state.currentDirection === 'up');
  }
}

// 2D Cross-section Draw Mode
function draw2DView(width, height) {
  const centerX = width / 2;
  const centerY = height / 2;

  // 1. Draw Concentric Magnetic Field Rings
  const baseRadii = getFieldRadii(state.magnitude);
  if (baseRadii.length > 0) {
    if (state.showFieldDots) {
      ctx.save();
      const glowGradient = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, 250);
      glowGradient.addColorStop(0, `rgba(0, 255, 255, ${0.35 * (state.magnitude / 5)})`);
      glowGradient.addColorStop(0.4, `rgba(0, 255, 255, ${0.12 * (state.magnitude / 5)})`);
      glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, 250, 0, Math.PI * 2);
      ctx.fillStyle = glowGradient;
      ctx.fill();
      ctx.restore();
    }

    for (let i = 0; i < baseRadii.length; i++) {
      const r = baseRadii[i];
      
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      
      const distanceFactor = 1 - (i / baseRadii.length) * 0.8;
      const opacity = (state.magnitude / 5) * 0.85 * distanceFactor;
      
      ctx.strokeStyle = `rgba(0, 255, 255, ${opacity})`;
      ctx.lineWidth = Math.max(0.6, 2.5 - (i * 0.12));
      ctx.setLineDash([8, 6]);
      ctx.stroke();

      // Static arrows
      if (state.showFieldDirection) {
        const arrowCount = Math.max(3, 8 - Math.floor(i / 2));
        const rotationDirection = state.currentDirection === 'up' ? 1 : -1;
        
        for (let j = 0; j < arrowCount; j++) {
          const angle = fieldRotationAngle + (j * (Math.PI * 2 / arrowCount));
          const ax = centerX + Math.cos(angle) * r;
          const ay = centerY + Math.sin(angle) * r;
          
          const tx = -Math.sin(angle) * rotationDirection;
          const ty = -Math.cos(angle) * rotationDirection;
          const arrowDir = Math.atan2(ty, tx);
          
          ctx.save();
          ctx.translate(ax, ay);
          ctx.rotate(arrowDir);
          
          ctx.beginPath();
          ctx.moveTo(-6, -4);
          ctx.lineTo(4, 0);
          ctx.lineTo(-6, 4);
          ctx.closePath();
          ctx.fillStyle = `rgba(0, 255, 255, ${opacity + 0.15})`;
          ctx.fill();
          ctx.restore();
        }
      }
      ctx.restore();
    }
  }

  // 2. Draw Wire Cross-Section inside the circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, 22, 0, Math.PI * 2);
  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = '#4b5563';
  ctx.lineWidth = 4;
  ctx.fill();
  ctx.stroke();

  // Add inner glow representation
  ctx.beginPath();
  ctx.arc(centerX, centerY, 19, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.fill();
  ctx.restore();

  // 3. Draw direction symbol on the wire
  ctx.save();
  if (state.currentDirection === 'up') {
    ctx.beginPath();
    ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
    ctx.fillStyle = state.flowType === 'electron' ? COLORS.electron : COLORS.conventional;
    ctx.shadowBlur = 12;
    ctx.shadowColor = ctx.fillStyle;
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('OUT (•)', centerX, centerY + 38);
  } else {
    ctx.beginPath();
    const len = 7;
    ctx.moveTo(centerX - len, centerY - len);
    ctx.lineTo(centerX + len, centerY + len);
    ctx.moveTo(centerX + len, centerY - len);
    ctx.lineTo(centerX - len, centerY + len);
    ctx.strokeStyle = state.flowType === 'electron' ? COLORS.electron : COLORS.conventional;
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.stroke();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('IN (✕)', centerX, centerY + 38);
  }
  ctx.restore();

  // 4. Draw curling hand icon overlay
  if (state.showHandRule && state.magnitude > 0) {
    draw2DHandRule(centerX + 60, centerY + 60, state.currentDirection === 'up');
  }
}

// Helper to draw the Right-Hand Grip Rule 3D thumb & fist illustration
function draw3DHandRule(x, y, isUp) {
  ctx.save();
  ctx.translate(x + 50, y);
  
  // Draw glowing sleeve/wrist background
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(-30, 20, 60, 40, 6);
  ctx.fill();
  ctx.stroke();

  // Draw fist cylinder representation
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.beginPath();
  ctx.arc(0, 0, 16, 0, Math.PI * 2);
  ctx.fill();
  
  // Curl indicator (curling finger arrows wrapping around)
  ctx.strokeStyle = COLORS.magnetic;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 22, -Math.PI/2, Math.PI);
  ctx.stroke();

  // Arrowhead for curling fingers depending on rule direction
  ctx.save();
  if (isUp) {
    ctx.translate(0, -22);
    ctx.rotate(-Math.PI);
  } else {
    ctx.translate(0, -22);
    ctx.rotate(0);
  }
  ctx.beginPath();
  ctx.moveTo(-4, -3);
  ctx.lineTo(4, 0);
  ctx.lineTo(-4, 3);
  ctx.closePath();
  ctx.fillStyle = COLORS.magnetic;
  ctx.fill();
  ctx.restore();

  // Draw thumb vector pointing Up or Down
  const thumbY = isUp ? -30 : 30;
  ctx.strokeStyle = state.flowType === 'conventional' ? COLORS.conventional : COLORS.electron;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, thumbY);
  ctx.stroke();

  // Thumb arrowhead
  ctx.save();
  ctx.translate(0, thumbY);
  ctx.rotate(isUp ? -Math.PI / 2 : Math.PI / 2);
  ctx.beginPath();
  ctx.moveTo(-5, -4);
  ctx.lineTo(5, 0);
  ctx.lineTo(-5, 4);
  ctx.closePath();
  ctx.fillStyle = ctx.strokeStyle;
  ctx.fill();
  ctx.restore();

  // Texts
  ctx.fillStyle = '#ffffff';
  ctx.font = '9px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('Fingers = Field', 0, 38);
  ctx.fillStyle = ctx.strokeStyle;
  ctx.fillText(state.flowType === 'conventional' ? 'Thumb = I' : 'Thumb = Electron', 0, isUp ? -40 : 48);

  ctx.restore();
}

// Draw right hand rule helper in 2D View
function draw2DHandRule(x, y, isUp) {
  ctx.save();
  ctx.translate(x, y);

  // Background card
  ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(-45, -35, 90, 70, 8);
  ctx.fill();
  ctx.stroke();

  // Draw central point indicating thumb direction
  ctx.beginPath();
  ctx.arc(-20, 0, 10, 0, Math.PI * 2);
  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.stroke();
  ctx.fill();

  ctx.save();
  ctx.translate(-20, 0);
  if (isUp) {
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fillStyle = state.flowType === 'conventional' ? COLORS.conventional : COLORS.electron;
    ctx.fill();
  } else {
    ctx.strokeStyle = state.flowType === 'conventional' ? COLORS.conventional : COLORS.electron;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-3, -3);
    ctx.lineTo(3, 3);
    ctx.moveTo(3, -3);
    ctx.lineTo(-3, 3);
    ctx.stroke();
  }
  ctx.restore();

  // Draw curl arrows around the thumb point
  ctx.strokeStyle = COLORS.magnetic;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(-20, 0, 14, -Math.PI / 2, Math.PI);
  ctx.stroke();

  // Arrowhead
  ctx.save();
  ctx.translate(-20, 0);
  if (isUp) {
    ctx.translate(-14, 0);
    ctx.rotate(Math.PI / 2);
  } else {
    ctx.translate(-14, 0);
    ctx.rotate(-Math.PI / 2);
  }
  ctx.beginPath();
  ctx.moveTo(-4, -3);
  ctx.lineTo(4, 0);
  ctx.lineTo(-4, 3);
  ctx.closePath();
  ctx.fillStyle = COLORS.magnetic;
  ctx.fill();
  ctx.restore();

  // Text details
  ctx.fillStyle = '#ffffff';
  ctx.font = '8px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('Right-Hand Rule', 15, -10);
  
  ctx.fillStyle = state.flowType === 'conventional' ? COLORS.conventional : COLORS.electron;
  ctx.fillText(state.flowType === 'conventional' ? 'Conventional' : 'Electron', 15, 5);
  ctx.fillText(isUp ? 'Thumb OUT' : 'Thumb IN', 15, 15);

  ctx.restore();
}

// Initialise everything
window.addEventListener('load', () => {
  setupEventListeners();
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  initParticles();
  updateCompassOverlay();
  
  draw();
});
