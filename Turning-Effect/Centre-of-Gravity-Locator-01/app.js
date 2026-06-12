// Utility: Get Centroid of a Polygon
function getPolygonCentroid(vertices) {
  let area = 0;
  let cx = 0;
  let cy = 0;
  const n = vertices.length;

  for (let i = 0; i < n; i++) {
    const x0 = vertices[i][0];
    const y0 = vertices[i][1];
    const x1 = vertices[(i + 1) % n][0];
    const y1 = vertices[(i + 1) % n][1];

    const factor = (x0 * y1 - x1 * y0);
    area += factor;
    cx += (x0 + x1) * factor;
    cy += (y0 + y1) * factor;
  }

  area = area / 2;
  cx = cx / (6 * area);
  cy = cy / (6 * area);

  return { x: cx, y: cy, area: Math.abs(area) };
}

// Coordinate transforms helper
function toLocal(x, y, pivotX, pivotY, angleRad) {
  const dx = x - pivotX;
  const dy = y - pivotY;
  return {
    x: dx * Math.cos(-angleRad) - dy * Math.sin(-angleRad),
    y: dx * Math.sin(-angleRad) + dy * Math.cos(-angleRad)
  };
}

function toGlobal(lx, ly, pivotX, pivotY, angleRad) {
  return {
    x: pivotX + (lx * Math.cos(angleRad) - ly * Math.sin(angleRad)),
    y: pivotY + (lx * Math.sin(angleRad) + ly * Math.cos(angleRad))
  };
}

// Line-Line Intersection Helper
function getLineIntersection(p1, p2, p3, p4) {
  const d = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
  if (Math.abs(d) < 0.001) return null;

  const t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / d;
  return {
    x: p1.x + t * (p2.x - p1.x),
    y: p1.y + t * (p2.y - p1.y)
  };
}

// --- STATE MANAGEMENT ---
let currentSection = 1;
const state = {
  section1: {
    part: 'A', // 'A' or 'B'
    animFrame: null,
    time: 0
  },
  section2: {
    selectedShapeKey: 'irregular1',
    pivotIndex: 0, // 0 or 1
    drawnLines: [], // lines in local coordinates [{lx1, ly1, lx2, ly2}]
    isDrawing: false,
    drawStartGlobal: null,
    tempLine: null,
    tolerance: 18, // pixels tolerance
    step: 1 // 1, 2, 3
  },
  section3: {
    shapeIndex: 0,
    hasGuessed: false,
    guessPoint: null
  },
  section4: {
    currentIndex: 0,
    score: 0, // Tracks Types A & B
    questions: [],
    userAnswer: null, // index for MCQs
    isSubmitted: false
  },
  section5: {
    cardIndex: 0,
    isFlipped: false,
    deck: []
  }
};

// --- SHAPE DEFINITIONS FOR SIMULATOR AND CHALLENGE ---
const SHAPES = {
  irregular1: {
    name: "Blob A",
    vertices: [[180, 120], [320, 100], [380, 220], [280, 340], [180, 300], [120, 200]],
    pivots: [[180, 120], [320, 100], [280, 340], [120, 200]],
  },
  irregular2: {
    name: "Blob B",
    vertices: [[160, 160], [270, 90], [390, 160], [320, 310], [200, 330], [130, 240]],
    pivots: [[270, 90], [390, 160], [200, 330], [130, 240]],
  },
  irregular3: {
    name: "Blob C",
    vertices: [[210, 110], [310, 130], [360, 260], [240, 330], [140, 270], [150, 170]],
    pivots: [[210, 110], [360, 260], [240, 330], [150, 170]],
  },
  rectangle: {
    name: "Rectangle",
    vertices: [[150, 130], [350, 130], [350, 270], [150, 270]],
    pivots: [[150, 130], [350, 130], [350, 270], [150, 270]],
  },
  triangle: {
    name: "Triangle",
    vertices: [[250, 110], [370, 290], [130, 290]],
    pivots: [[250, 110], [370, 290], [130, 290], [250, 290]],
  }
};

const CHALLENGE_SHAPES = [
  {
    name: "Rectangle (Uniform)",
    vertices: [[120, 140], [280, 140], [280, 260], [120, 260]]
  },
  {
    name: "Triangle (Uniform)",
    vertices: [[200, 110], [300, 290], [100, 290]]
  },
  {
    name: "L-Shape",
    vertices: [[120, 120], [200, 120], [200, 200], [280, 200], [280, 280], [120, 280]]
  },
  {
    name: "T-Shape",
    vertices: [[120, 120], [280, 120], [280, 180], [220, 180], [220, 280], [180, 280], [180, 180], [120, 180]]
  },
  {
    name: "Irregular Blob 1",
    vertices: [[150, 130], [260, 110], [320, 190], [280, 290], [160, 270], [120, 190]]
  },
  {
    name: "Irregular Blob 2",
    vertices: [[180, 140], [280, 120], [310, 220], [230, 300], [150, 260], [140, 190]]
  }
];

// Switch main navigation sections
function switchSection(secNum) {
  document.querySelectorAll('.nav-tab').forEach((tab, index) => {
    tab.classList.toggle('active', index + 1 === secNum);
  });
  document.querySelectorAll('.section-panel').forEach((panel, index) => {
    panel.classList.toggle('active', index + 1 === secNum);
  });
  currentSection = secNum;
  
  // Clean up animation frames
  if (state.section1.animFrame) {
    cancelAnimationFrame(state.section1.animFrame);
    state.section1.animFrame = null;
  }

  // Init section specific code
  if (secNum === 1) {
    initSection1();
  } else if (secNum === 2) {
    initSection2();
  } else if (secNum === 3) {
    initSection3();
  } else if (secNum === 4) {
    initSection5(); // Flashcards
  } else if (secNum === 5) {
    initSection4(); // Quiz
  }
}

// --- SECTION 1: CONCEPT INTRO ---
function initSection1() {
  setIntroPart(state.section1.part);
}

function setIntroPart(part) {
  state.section1.part = part;
  document.querySelectorAll('.intro-controls .step-indicator').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.includes(part));
  });

  const explanation = document.getElementById('intro-explanation-text');
  const detailsA = document.getElementById('part-a-details');
  const detailsB = document.getElementById('part-b-details');

  if (part === 'A') {
    explanation.innerHTML = "<strong>Part A — What is Centre of Gravity?</strong><br>The gravitational pull acts on all parts of an object. However, for calculations and analysis, we can assume the entire weight acts at a <strong>single point</strong> called the <strong>centre of gravity (G)</strong>.";
    detailsA.style.display = 'block';
    detailsB.style.display = 'none';
  } else {
    explanation.innerHTML = "<strong>Part B — Why it Matters</strong><br>An object balances stably if supported exactly at its centre of gravity. If supported or pivoted away from its CG, the weight creates a moment (turning effect) that makes it rotate and fall.";
    detailsA.style.display = 'none';
    detailsB.style.display = 'block';
  }

  if (state.section1.animFrame) cancelAnimationFrame(state.section1.animFrame);
  state.section1.time = 0;
  animateSection1();
}

function animateSection1() {
  const svg = document.getElementById('intro-svg');
  if (!svg) return;
  svg.innerHTML = '';

  state.section1.time += 1.5;
  const cycle = (state.section1.time % 200) / 200; // 0 to 1 loop

  if (state.section1.part === 'A') {
    // Part A: Arrows converging
    // Irregular Shape
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M 100,150 C 120,80 280,70 300,150 C 320,230 250,280 200,280 C 150,280 80,220 100,150 Z");
    path.setAttribute("fill", "rgba(20, 24, 46, 0.9)");
    path.setAttribute("stroke", "var(--neon-cyan)");
    path.setAttribute("stroke-width", "3");
    path.setAttribute("filter", "drop-shadow(0 0 8px rgba(0, 240, 255, 0.3))");
    svg.appendChild(path);

    // CG (G) Point
    const cgX = 200, cgY = 175;

    // Small arrow starts
    const sources = [
      {x: 130, y: 130}, {x: 170, y: 110}, {x: 230, y: 110},
      {x: 270, y: 140}, {x: 260, y: 200}, {x: 210, y: 230},
      {x: 150, y: 220}, {x: 180, y: 160}
    ];

    const transitionPoint = 0.55; // point in cycle where arrows fully merge
    
    if (cycle < transitionPoint) {
      // Small arrows moving towards G
      const progress = cycle / transitionPoint;
      sources.forEach(src => {
        const cx = src.x + (cgX - src.x) * progress;
        const cy = src.y + (cgY - src.y) * progress;
        drawArrow(svg, cx, cy, cx, cy + 25, "var(--neon-purple)", 1.5);
      });
      // Label G is dim
      drawCGMarker(svg, cgX, cgY, 0.3);
    } else {
      // Merged single big arrow from G
      const progress = (cycle - transitionPoint) / (1 - transitionPoint);
      const arrowLen = 15 + progress * 40;
      drawArrow(svg, cgX, cgY, cgX, cgY + arrowLen, "var(--neon-green)", 4, true);
      drawCGMarker(svg, cgX, cgY, 1.0);
    }

  } else {
    // Part B: Side-by-side balanced vs unbalanced
    
    // Balanced Group (Left side)
    const gLeft = document.createElementNS("http://www.w3.org/2000/svg", "g");
    gLeft.setAttribute("transform", "translate(100, 160)");
    
    // Unbalanced Group (Right side)
    const gRight = document.createElementNS("http://www.w3.org/2000/svg", "g");
    
    // Left balanced animation (stays level or small rocking)
    const angleLeft = Math.sin(state.section1.time * 0.05) * 1.5;
    
    // Right unbalanced animation (tips and falls down, then oscillates)
    let angleRight = 0;
    const t = (state.section1.time % 250);
    if (t < 50) {
      angleRight = 0;
    } else if (t < 130) {
      const p = (t - 50) / 80;
      angleRight = p * p * 80; // Falls to 80 deg
    } else {
      const p = (t - 130) / 120;
      angleRight = 80 + Math.sin(p * Math.PI * 4) * 10 * Math.exp(-p * 3);
    }
    
    gRight.setAttribute("transform", `translate(300, 160)`);

    // Helper to draw balanced
    drawBalancingSystem(gLeft, angleLeft, true);
    // Helper to draw unbalanced
    drawBalancingSystem(gRight, angleRight, false);

    svg.appendChild(gLeft);
    svg.appendChild(gRight);
  }

  state.section1.animFrame = requestAnimationFrame(animateSection1);
}

function drawCGMarker(svg, x, y, opacity) {
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("opacity", opacity);
  
  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("cx", x);
  circle.setAttribute("cy", y);
  circle.setAttribute("r", "5");
  circle.setAttribute("fill", "var(--neon-green)");
  circle.setAttribute("filter", "drop-shadow(0 0 6px var(--neon-green-glow))");
  
  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("x", x + 10);
  text.setAttribute("y", y - 8);
  text.setAttribute("fill", "#fff");
  text.setAttribute("font-weight", "bold");
  text.setAttribute("font-size", "14px");
  text.textContent = "G";

  g.appendChild(circle);
  g.appendChild(text);
  svg.appendChild(g);
}

function drawArrow(svg, x1, y1, x2, y2, color, strokeWidth, glow = false) {
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", x1);
  line.setAttribute("y1", y1);
  line.setAttribute("x2", x2);
  line.setAttribute("y2", y2 - 4);
  line.setAttribute("stroke", color);
  line.setAttribute("stroke-width", strokeWidth);
  if (glow) line.setAttribute("filter", `drop-shadow(0 0 6px ${color})`);

  // Head
  const arrowHead = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  const headSize = strokeWidth * 2.5 + 3;
  arrowHead.setAttribute("points", `${x2 - headSize/2},${y2 - 4} ${x2 + headSize/2},${y2 - 4} ${x2},${y2 + headSize/2}`);
  arrowHead.setAttribute("fill", color);
  if (glow) arrowHead.setAttribute("filter", `drop-shadow(0 0 6px ${color})`);

  svg.appendChild(line);
  svg.appendChild(arrowHead);
}

function drawBalancingSystem(group, angle, isBalanced) {
  // Draw Pivot (Triangle)
  const pivot = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  if (isBalanced) {
    pivot.setAttribute("points", "0,0 -12,25 12,25");
  } else {
    pivot.setAttribute("points", "-30,0 -42,25 -18,25");
  }
  pivot.setAttribute("fill", "var(--text-muted)");
  group.appendChild(pivot);

  // Animated Board/Shape Group
  const animG = document.createElementNS("http://www.w3.org/2000/svg", "g");
  
  const angleRad = angle * Math.PI / 180;
  let cgX, cgY;

  if (isBalanced) {
    animG.setAttribute("transform", `rotate(${angle}, 0, 0)`);
    // Local G is (0, -5). Rotation center is (0, 0).
    cgX = -(-5) * Math.sin(angleRad);
    cgY = -5 * Math.cos(angleRad);

    // Rectangle Board
    const board = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    board.setAttribute("x", "-70");
    board.setAttribute("y", "-10");
    board.setAttribute("width", "140");
    board.setAttribute("height", "10");
    board.setAttribute("fill", "rgba(255,255,255,0.05)");
    board.setAttribute("stroke", "var(--neon-cyan)");
    board.setAttribute("stroke-width", "2");
    animG.appendChild(board);
  } else {
    // Pivot is off-center at (-30, -5)
    animG.setAttribute("transform", `rotate(${angle}, -30, -5)`);
    // Local G is (0, -5). Rotation center is (-30, -5).
    cgX = -30 + 30 * Math.cos(angleRad);
    cgY = -5 + 30 * Math.sin(angleRad);

    const board = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    board.setAttribute("x", "-70");
    board.setAttribute("y", "-10");
    board.setAttribute("width", "140");
    board.setAttribute("height", "10");
    board.setAttribute("fill", "rgba(255,255,255,0.05)");
    board.setAttribute("stroke", "var(--neon-pink)");
    board.setAttribute("stroke-width", "2");
    animG.appendChild(board);

    // Draw pivot marker on the board
    const pDot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    pDot.setAttribute("cx", "-30");
    pDot.setAttribute("cy", "-5");
    pDot.setAttribute("r", "3");
    pDot.setAttribute("fill", "var(--neon-cyan)");
    animG.appendChild(pDot);

    // Pivot label
    const pText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    pText.setAttribute("x", "-55");
    pText.setAttribute("y", "-15");
    pText.setAttribute("fill", "var(--neon-cyan)");
    pText.setAttribute("font-size", "9px");
    pText.textContent = "Pivot";
    animG.appendChild(pText);
  }

  group.appendChild(animG);

  // Draw CG G dot in stationary group coordinates
  const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  dot.setAttribute("cx", cgX.toString());
  dot.setAttribute("cy", cgY.toString());
  dot.setAttribute("r", "4");
  dot.setAttribute("fill", "var(--neon-green)");
  group.appendChild(dot);
  
  // Label "G"
  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("x", (cgX + 6).toString());
  text.setAttribute("y", (cgY - 6).toString());
  text.setAttribute("fill", "#fff");
  text.setAttribute("font-size", "10px");
  text.textContent = isBalanced ? "G (at pivot)" : "G";
  group.appendChild(text);

  // Heavy weight arrow pointing vertically downwards
  drawArrow(group, cgX, cgY, cgX, cgY + 45, "var(--neon-green)", 3, true);

  // Status Label
  const status = document.createElementNS("http://www.w3.org/2000/svg", "text");
  status.setAttribute("x", "0");
  status.setAttribute("y", "70");
  status.setAttribute("fill", isBalanced ? "var(--neon-green)" : "var(--neon-pink)");
  status.setAttribute("font-size", "12px");
  status.setAttribute("font-family", "Orbitron");
  status.setAttribute("text-anchor", "middle");
  status.textContent = isBalanced ? "BALANCED" : "TILTS & FALLS";
  group.appendChild(status);
}


// --- SECTION 2: PLUMB-LINE SIMULATOR ---
function initSection2() {
  resetSim();
}

function selectSimShape(shapeKey) {
  state.section2.selectedShapeKey = shapeKey;
  document.querySelectorAll('#section-2 .shape-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.toLowerCase().includes(shapeKey.replace(/\d/g, "")));
  });
  resetSim();
}

function resetSim() {
  state.section2.pivotIndex = 0;
  state.section2.drawnLines = [];
  state.section2.isDrawing = false;
  state.section2.tempLine = null;
  state.section2.step = 1;
  updateSimUI();
  renderSimSVG();
}

function updateSimUI() {
  const numLines = state.section2.drawnLines.length;
  document.getElementById('sim-step-1').classList.toggle('active', numLines === 0);
  document.getElementById('sim-step-2').classList.toggle('active', numLines > 0 && numLines < 4);
  document.getElementById('sim-step-3').classList.toggle('active', numLines >= 2);

  const changePivotBtn = document.getElementById('change-pivot-btn');
  // Allow changing pivot if the student has drawn a line for the current pivot index, and total lines < 4
  changePivotBtn.style.display = (numLines > 0 && numLines < 4 && numLines === state.section2.pivotIndex + 1) ? 'inline-block' : 'none';
}

function changeSimPivot() {
  state.section2.pivotIndex = (state.section2.pivotIndex + 1) % 4;
  updateSimUI();
  renderSimSVG();
}

function renderSimSVG() {
  const svg = document.getElementById('sim-svg');
  if (!svg) return;
  svg.innerHTML = '';

  const shapeData = SHAPES[state.section2.selectedShapeKey];
  const vertices = shapeData.vertices;
  const centroid = getPolygonCentroid(vertices);

  const pivotPoint = shapeData.pivots[state.section2.pivotIndex];

  // Screen Pivot anchor is fixed at (250, 80)
  const screenPivotX = 250;
  const screenPivotY = 80;

  // Compute angle to make the line from Pin to Centroid hang straight down (i.e. angle = 90 deg = pi/2 rad)
  const dx = centroid.x - pivotPoint[0];
  const dy = centroid.y - pivotPoint[1];
  const initialAngle = Math.atan2(dy, dx);
  const targetAngle = Math.PI / 2; // Hanging straight down
  const rotationAngle = targetAngle - initialAngle;

  // SVG Groups
  // 1. Hanging structures (Plumb Line background and pin)
  const linePlumb = document.createElementNS("http://www.w3.org/2000/svg", "line");
  linePlumb.setAttribute("x1", screenPivotX);
  linePlumb.setAttribute("y1", screenPivotY);
  linePlumb.setAttribute("x2", screenPivotX);
  linePlumb.setAttribute("y2", "420");
  linePlumb.setAttribute("stroke", "rgba(0, 240, 255, 0.4)");
  linePlumb.setAttribute("stroke-width", "1.5");
  linePlumb.setAttribute("stroke-dasharray", "4,4");
  svg.appendChild(linePlumb);

  const bob = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  bob.setAttribute("cx", screenPivotX);
  bob.setAttribute("cy", "420");
  bob.setAttribute("r", "8");
  bob.setAttribute("fill", "var(--neon-cyan)");
  bob.setAttribute("filter", "drop-shadow(0 0 6px var(--neon-cyan-glow))");
  svg.appendChild(bob);

  // Group containing the rotating shape
  const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
  // To rotate shape around its pivot vertex:
  // We translate shape to position pivot vertex at (0,0), rotate, then translate to screenPivot
  const transformStr = `translate(${screenPivotX}, ${screenPivotY}) rotate(${rotationAngle * 180 / Math.PI}) translate(${-pivotPoint[0]}, ${-pivotPoint[1]})`;
  group.setAttribute("transform", transformStr);
  group.setAttribute("id", "rotated-shape-group");

  // Shape Polygon
  const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  const ptsString = vertices.map(v => v.join(',')).join(' ');
  polygon.setAttribute("points", ptsString);
  polygon.setAttribute("fill", "rgba(20, 24, 46, 0.85)");
  polygon.setAttribute("stroke", "var(--neon-purple)");
  polygon.setAttribute("stroke-width", "3");
  polygon.setAttribute("filter", "drop-shadow(0 0 10px rgba(208, 0, 255, 0.15))");
  group.appendChild(polygon);

  // Draw previous line inside group if it exists
  state.section2.drawnLines.forEach((line, index) => {
    const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
    l.setAttribute("x1", line.lx1);
    l.setAttribute("y1", line.ly1);
    l.setAttribute("x2", line.lx2);
    l.setAttribute("y2", line.ly2);
    const colors = ["var(--neon-cyan)", "var(--neon-pink)", "var(--neon-yellow)", "var(--neon-purple)"];
    l.setAttribute("stroke", colors[index % colors.length]);
    l.setAttribute("stroke-width", "2");
    l.setAttribute("stroke-dasharray", "2,2");
    group.appendChild(l);
  });

  // If we solved the intersection, display the G dot
  const numLines = state.section2.drawnLines.length;
  if (numLines >= 2) {
    const cgDot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    cgDot.setAttribute("cx", centroid.x);
    cgDot.setAttribute("cy", centroid.y);
    cgDot.setAttribute("r", "6");
    cgDot.setAttribute("fill", "var(--neon-green)");
    cgDot.setAttribute("filter", "drop-shadow(0 0 10px var(--neon-green-glow))");
    group.appendChild(cgDot);

    const cgText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    cgText.setAttribute("x", centroid.x + 12);
    cgText.setAttribute("y", centroid.y - 8);
    cgText.setAttribute("fill", "#fff");
    cgText.setAttribute("font-weight", "bold");
    cgText.setAttribute("font-size", "16px");
    cgText.textContent = "G";
    group.appendChild(cgText);
  }

  svg.appendChild(group);

  // Support click-and-drag drawing
  // Draw overlay listener
  const overlay = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  overlay.setAttribute("width", "100%");
  overlay.setAttribute("height", "100%");
  overlay.setAttribute("fill", "transparent");
  overlay.style.cursor = "crosshair";
  svg.appendChild(overlay);

  // Mouse / Touch Event Listeners for drawing
  overlay.addEventListener('mousedown', (e) => startDraw(e, svg, screenPivotX, screenPivotY, rotationAngle, pivotPoint));
  overlay.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    startDraw(touch, svg, screenPivotX, screenPivotY, rotationAngle, pivotPoint);
  }, { passive: true });
}

function startDraw(e, svg, screenPivotX, screenPivotY, rotationAngle, pivotPoint) {
  if (state.section2.drawnLines.length >= 4) return; // Max 4 lines
  
  const rect = svg.getBoundingClientRect();
  const scaleX = svg.viewBox.baseVal.width / rect.width;
  const scaleY = svg.viewBox.baseVal.height / rect.height;

  const startX = (e.clientX - rect.left) * scaleX;
  const startY = (e.clientY - rect.top) * scaleY;

  // Let the user draw straight down
  state.section2.isDrawing = true;
  state.section2.drawStartGlobal = { x: startX, y: startY };

  // Create temporary visual line
  const tempL = document.createElementNS("http://www.w3.org/2000/svg", "line");
  tempL.setAttribute("stroke", "var(--neon-yellow)");
  tempL.setAttribute("stroke-width", "2");
  svg.appendChild(tempL);
  state.section2.tempLine = tempL;

  const handleMove = (moveEvt) => {
    if (!state.section2.isDrawing) return;
    const clientX = moveEvt.clientX || (moveEvt.touches && moveEvt.touches[0].clientX);
    const clientY = moveEvt.clientY || (moveEvt.touches && moveEvt.touches[0].clientY);
    
    if (clientX === undefined || clientY === undefined) return;

    const mx = (clientX - rect.left) * scaleX;
    const my = (clientY - rect.top) * scaleY;

    state.section2.tempLine.setAttribute("x1", state.section2.drawStartGlobal.x);
    state.section2.tempLine.setAttribute("y1", state.section2.drawStartGlobal.y);
    state.section2.tempLine.setAttribute("x2", mx);
    state.section2.tempLine.setAttribute("y2", my);
  };

  const handleUp = (upEvt) => {
    if (!state.section2.isDrawing) return;
    state.section2.isDrawing = false;
    
    const clientX = upEvt.clientX || (upEvt.changedTouches && upEvt.changedTouches[0].clientX);
    const clientY = upEvt.clientY || (upEvt.changedTouches && upEvt.changedTouches[0].clientY);

    if (clientX !== undefined && clientY !== undefined) {
      const endX = (clientX - rect.left) * scaleX;
      const endY = (clientY - rect.top) * scaleY;

      // Verify alignment with plumb line (X = 250)
      const devStart = Math.abs(state.section2.drawStartGlobal.x - 250);
      const devEnd = Math.abs(endX - 250);

      // Check if vertical length is sufficient
      const length = Math.abs(endY - state.section2.drawStartGlobal.y);

      if (devStart > state.section2.tolerance || devEnd > state.section2.tolerance || length < 40) {
        showSimToast("Trace closer to the plumb line!");
      } else {
        // Successful line draw! Snap line strictly to X = 250 in global coords
        const topY = Math.min(state.section2.drawStartGlobal.y, endY);
        const botY = Math.max(state.section2.drawStartGlobal.y, endY);

        // Convert the snapped vertical line endpoints to local shape coordinates
        const localTop = toLocal(250, topY - 30, screenPivotX, screenPivotY, rotationAngle);
        const localBot = toLocal(250, botY + 30, screenPivotX, screenPivotY, rotationAngle);

        // Save
        state.section2.drawnLines.push({
          lx1: localTop.x + pivotPoint[0],
          ly1: localTop.y + pivotPoint[1],
          lx2: localBot.x + pivotPoint[0],
          ly2: localBot.y + pivotPoint[1]
        });

        if (state.section2.drawnLines.length === 1) {
          state.section2.step = 2;
        } else {
          state.section2.step = 3;
        }
      }
    }

    if (state.section2.tempLine) {
      state.section2.tempLine.remove();
      state.section2.tempLine = null;
    }

    window.removeEventListener('mousemove', handleMove);
    window.removeEventListener('mouseup', handleUp);
    window.removeEventListener('touchmove', handleMove);
    window.removeEventListener('touchend', handleUp);

    updateSimUI();
    renderSimSVG();
  };

  window.addEventListener('mousemove', handleMove);
  window.addEventListener('mouseup', handleUp);
  window.addEventListener('touchmove', handleMove, { passive: true });
  window.addEventListener('touchend', handleUp, { passive: true });
}

function showSimToast(msg) {
  const toast = document.getElementById('sim-toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2000);
}


// --- SECTION 3: CG MARKER CHALLENGE ---
function initSection3() {
  state.section3.hasGuessed = false;
  state.section3.guessPoint = null;
  document.getElementById('challenge-feedback-area').style.display = 'none';
  document.getElementById('challenge-next-btn').style.display = 'none';
  renderChallengeShape();
}

function renderChallengeShape() {
  const svg = document.getElementById('challenge-svg');
  if (!svg) return;
  svg.innerHTML = '';

  const shape = CHALLENGE_SHAPES[state.section3.shapeIndex];
  const vertices = shape.vertices;

  // Outer polygon path
  const poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  const ptsString = vertices.map(v => v.join(',')).join(' ');
  poly.setAttribute("points", ptsString);
  poly.setAttribute("fill", "rgba(20, 24, 46, 0.85)");
  poly.setAttribute("stroke", "var(--neon-cyan)");
  poly.setAttribute("stroke-width", "3");
  poly.setAttribute("filter", "drop-shadow(0 0 10px rgba(0, 240, 255, 0.15))");
  svg.appendChild(poly);

  // If guessed, show true CG and connection line
  if (state.section3.hasGuessed && state.section3.guessPoint) {
    const centroid = getPolygonCentroid(vertices);

    // Line from Guess to True CG
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", state.section3.guessPoint.x);
    line.setAttribute("y1", state.section3.guessPoint.y);
    line.setAttribute("x2", centroid.x);
    line.setAttribute("y2", centroid.y);
    line.setAttribute("stroke", "var(--text-muted)");
    line.setAttribute("stroke-dasharray", "4,4");
    line.setAttribute("stroke-width", "1.5");
    svg.appendChild(line);

    // Correct Dot (Green)
    const correctDot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    correctDot.setAttribute("cx", centroid.x);
    correctDot.setAttribute("cy", centroid.y);
    correctDot.setAttribute("r", "6");
    correctDot.setAttribute("fill", "var(--neon-green)");
    correctDot.setAttribute("filter", "drop-shadow(0 0 8px var(--neon-green-glow))");
    svg.appendChild(correctDot);

    const correctLbl = document.createElementNS("http://www.w3.org/2000/svg", "text");
    correctLbl.setAttribute("x", centroid.x + 10);
    correctLbl.setAttribute("y", centroid.y - 8);
    correctLbl.setAttribute("fill", "#fff");
    correctLbl.setAttribute("font-weight", "bold");
    correctLbl.setAttribute("font-size", "14px");
    correctLbl.textContent = "G";
    svg.appendChild(correctLbl);

    // Guess Dot (Pink/Orange)
    const guessDot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    guessDot.setAttribute("cx", state.section3.guessPoint.x);
    guessDot.setAttribute("cy", state.section3.guessPoint.y);
    guessDot.setAttribute("r", "5");
    guessDot.setAttribute("fill", "var(--neon-pink)");
    guessDot.setAttribute("filter", "drop-shadow(0 0 8px var(--neon-pink-glow))");
    svg.appendChild(guessDot);
  }

  // Click handler wrapper
  const clickOverlay = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  clickOverlay.setAttribute("width", "100%");
  clickOverlay.setAttribute("height", "100%");
  clickOverlay.setAttribute("fill", "transparent");
  svg.appendChild(clickOverlay);

  clickOverlay.addEventListener('click', (e) => {
    if (state.section3.hasGuessed) return;
    const rect = svg.getBoundingClientRect();
    const scaleX = svg.viewBox.baseVal.width / rect.width;
    const scaleY = svg.viewBox.baseVal.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    handleChallengeGuess(x, y);
  });

  document.getElementById('challenge-progress-lbl').textContent = `Shape ${state.section3.shapeIndex + 1} of 6`;
}

function handleChallengeGuess(x, y) {
  state.section3.hasGuessed = true;
  state.section3.guessPoint = { x, y };

  const shape = CHALLENGE_SHAPES[state.section3.shapeIndex];
  const centroid = getPolygonCentroid(shape.vertices);

  // Compute distance
  const dist = Math.sqrt((x - centroid.x) ** 2 + (y - centroid.y) ** 2);

  // Normalise distance to shape scale (using bounding box diagonal)
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  shape.vertices.forEach(v => {
    minX = Math.min(minX, v[0]);
    maxX = Math.max(maxX, v[0]);
    minY = Math.min(minY, v[1]);
    maxY = Math.max(maxY, v[1]);
  });
  const diagonal = Math.sqrt((maxX - minX) ** 2 + (maxY - minY) ** 2);
  const distPercent = (dist / diagonal) * 100;

  // UI display
  const feedbackArea = document.getElementById('challenge-feedback-area');
  const status = document.getElementById('challenge-status');
  const distLbl = document.getElementById('challenge-distance');
  const desc = document.getElementById('challenge-desc');
  const nextBtn = document.getElementById('challenge-next-btn');

  feedbackArea.style.display = 'block';
  nextBtn.style.display = 'inline-block';
  distLbl.textContent = `${distPercent.toFixed(1)}%`;

  if (distPercent <= 5) {
    status.textContent = "Spot on! 🎯";
    status.className = "feedback-text spot-on";
    desc.textContent = "Outstanding precision! You located the geometric centre perfectly.";
    triggerConfetti();
  } else if (distPercent <= 15) {
    status.textContent = "Close! 💡";
    status.className = "feedback-text close";
    desc.textContent = "Very good estimate. Just a tiny bit off center.";
  } else {
    status.textContent = "Try again! 🔄";
    status.className = "feedback-text try-again";
    desc.textContent = "Outside O-Level tolerance. Revisit Section 2's plumb-line method to see how physics helps locate G.";
  }

  renderChallengeShape();
}

function nextChallengeShape() {
  state.section3.shapeIndex = (state.section3.shapeIndex + 1) % CHALLENGE_SHAPES.length;
  initSection3();
}


// --- SECTION 4: RANDOMIZED QUIZ ---
// Question builder pool (30 questions)
function generateQuizPool() {
  const pool = [];
  
  // 10 MCQ TYPE A: Identify CG
  // We represent multiple shapes with marked points A,B,C,D
  const typeAShapes = [
    {
      name: "Uniform Triangle",
      vertices: [[175, 50], [275, 150], [75, 150]],
      options: [
        { label: "A (Apex)", x: 175, y: 65 },
        { label: "B (1/3 height from base - Correct CG)", x: 175, y: 117, correct: true },
        { label: "C (Exact middle height)", x: 175, y: 100 },
        { label: "D (Right corner)", x: 250, y: 140 }
      ],
      explanation: "For a uniform triangle, the Centre of Gravity is located 1/3 of the height upward from its base along the median lines."
    },
    {
      name: "Uniform Rectangle",
      vertices: [[100, 50], [250, 50], [250, 150], [100, 150]],
      options: [
        { label: "A (Geometric Center - Correct CG)", x: 175, y: 100, correct: true },
        { label: "B (Top edge)", x: 175, y: 55 },
        { label: "C (Bottom right)", x: 230, y: 135 },
        { label: "D (Left edge center)", x: 110, y: 100 }
      ],
      explanation: "The Centre of Gravity of any uniform symmetrical flat sheet lies at its geometric center."
    },
    {
      name: "L-shaped Sheet",
      vertices: [[100, 40], [160, 40], [160, 100], [220, 100], [220, 160], [100, 160]],
      options: [
        { label: "A (Outside the shape - Correct CG)", x: 140, y: 120, correct: true },
        { label: "B (Inner corner apex)", x: 155, y: 105 },
        { label: "C (Outer corner apex)", x: 110, y: 150 },
        { label: "D (Right edge center)", x: 210, y: 130 }
      ],
      explanation: "The Centre of Gravity does not have to lie on the material of the object. For an L-shape, G lies outside the physical body."
    },
    {
      name: "Hanging Trapezoid",
      vertices: [[120, 50], [230, 50], [280, 150], [70, 150]],
      options: [
        { label: "A (Near the top edge)", x: 175, y: 65 },
        { label: "B (Closer to the wider base - Correct CG)", x: 175, y: 113, correct: true },
        { label: "C (Exact height midpoint)", x: 175, y: 100 },
        { label: "D (Left corner)", x: 95, y: 140 }
      ],
      explanation: "Since the bottom part of the trapezoid is wider, it contains more mass; therefore, G is shifted downward towards the heavier base."
    },
    {
      name: "T-shaped Board",
      vertices: [[100, 50], [250, 50], [250, 90], [195, 90], [195, 170], [155, 170], [155, 90], [100, 90]],
      options: [
        { label: "A (Geometric center of stem)", x: 175, y: 130 },
        { label: "B (Closer to crossbar - Correct CG)", x: 175, y: 85, correct: true },
        { label: "C (Geometric center of crossbar)", x: 175, y: 70 },
        { label: "D (Bottom edge of stem)", x: 175, y: 160 }
      ],
      explanation: "The crossbar contains more mass, shifting the Centre of Gravity upward toward the top flange."
    },
    {
      name: "Uniform Disc (Circle)",
      isCircle: true,
      options: [
        { label: "A (Geometric center - Correct CG)", x: 175, y: 100, correct: true },
        { label: "B (Top perimeter)", x: 175, y: 55 },
        { label: "C (Midway to edge)", x: 135, y: 100 },
        { label: "D (Bottom right quadrant)", x: 210, y: 135 }
      ],
      explanation: "For a perfectly uniform circular disc, the Centre of Gravity is exactly at its geometric centre."
    },
    {
      name: "Semi-Circular Sheet",
      isSemiCircle: true,
      options: [
        { label: "A (Geometric diameter center)", x: 175, y: 150 },
        { label: "B (Shifted upward - Correct CG)", x: 175, y: 118, correct: true },
        { label: "C (Exact height midpoint)", x: 175, y: 100 },
        { label: "D (Outer arc perimeter)", x: 175, y: 60 }
      ],
      explanation: "For a semicircle, G lies along the line of symmetry at a distance of 4r/(3*pi) above the straight edge."
    },
    {
      name: "Irregular Blob D",
      vertices: [[110, 80], [240, 50], [270, 140], [200, 180], [120, 150]],
      options: [
        { label: "A (Shifted towards heavier end - Correct CG)", x: 190, y: 115, correct: true },
        { label: "B (Left narrower edge)", x: 135, y: 110 },
        { label: "C (Extreme right point)", x: 250, y: 130 },
        { label: "D (Bottom apex)", x: 200, y: 165 }
      ],
      explanation: "An irregular shape has its CG positioned closest to where the bulk of its mass is concentrated."
    },
    {
      name: "Uniform Ring",
      isRing: true,
      options: [
        { label: "A (Empty center space - Correct CG)", x: 175, y: 100, correct: true },
        { label: "B (Inner edge perimeter)", x: 145, y: 100 },
        { label: "C (Outer edge perimeter)", x: 115, y: 100 },
        { label: "D (Any point on the solid ring)", x: 215, y: 135 }
      ],
      explanation: "Like L-shapes, G for a uniform ring is located at its center, which is in empty space containing no actual material."
    },
    {
      name: "Pointy Arrow shape",
      vertices: [[100, 80], [200, 80], [200, 50], [270, 100], [200, 150], [200, 120], [100, 120]],
      options: [
        { label: "A (Centroid of stem)", x: 145, y: 100 },
        { label: "B (Closer to arrowhead - Correct CG)", x: 185, y: 100, correct: true },
        { label: "C (Apex tip)", x: 250, y: 100 },
        { label: "D (Bottom arrow corner)", x: 200, y: 135 }
      ],
      explanation: "The wide arrowhead contributes more weight to the right side, pulling the CG rightward."
    }
  ];

  typeAShapes.forEach((shape, i) => {
    pool.push({
      type: "A",
      title: `Identify the CG: ${shape.name}`,
      shapeData: shape,
      explanation: shape.explanation
    });
  });

  // 10 MCQ TYPE B: Loaded Objects
  const boardNames = ["Uniform Meter Rule", "Rectangular Metal Plate", "Uniform Wooden Board", "Carbon-fiber Bar"];
  for (let i = 0; i < 10; i++) {
    const isLeft = Math.random() < 0.5;
    const item = boardNames[i % boardNames.length];
    const side = isLeft ? "left" : "right";
    const opposite = isLeft ? "right" : "left";

    pool.push({
      type: "B",
      title: "Loaded Objects",
      item: item,
      side: side,
      opposite: opposite,
      questionText: `A heavy block is attached to the ${side} end of a ${item}. How does the Centre of Gravity (CG) shift?`,
      options: [
        { text: `Shifts toward the ${side} (nearer the block)`, correct: true },
        { text: `Shifts away toward the ${opposite} end`, correct: false },
        { text: "Stays exactly at the geometric center", correct: false }
      ],
      explanation: `Adding mass to the ${side} increases the concentration of weight on that side. The Centre of Gravity always shifts towards the added mass.`
    });
  }

  // 10 Structured Explanation TYPE C
  const typeCQuestions = [
    {
      question: "Why can the weight of any complex object be represented by a single downward arrow?",
      checklist: [
        "Mentioned that weight is distributed across all particles",
        "Stated that the CG is the single point where the entire weight appears to act",
        "Explained that a single vector simplifies moment/equilibrium calculations"
      ],
      modelAnswer: "An object is made of many particles, each experiencing a gravitational pull. However, the total weight of the object can be represented by a single downward arrow acting through the Centre of Gravity (CG) because the sum of all individual gravitational forces is statically equivalent to this single resultant force acting at G."
    },
    {
      question: "A student suspends a flat card from two different points and draws plumb lines. Explain how this locates the CG.",
      checklist: [
        "Mentioned the object hangs so its CG is vertically below the suspension point",
        "Stated that each drawn line represents a vertical path passing through the CG",
        "Explained that the intersection of the two lines marks the unique position of the CG"
      ],
      modelAnswer: "When suspended freely, an object always settles with its CG directly below the pivot to produce zero net moment. By drawing plumb lines from two different pivots, we obtain two vertical paths that must both pass through G. The intersection of these lines is the only point common to both paths, locating G."
    },
    {
      question: "The shape is suspended from point X. Describe what you would observe if X is not at the CG.",
      checklist: [
        "Stated that the shape will swing/rotate",
        "Explained that the weight acts at G, creating an unbalanced moment around X",
        "Mentioned that it will come to rest only when G is vertically below X"
      ],
      modelAnswer: "If point X is not at the CG, the line of action of the weight (acting downward from G) will not pass through X. This offset creates a perpendicular distance, causing an unbalanced gravitational moment. The shape will swing/rotate until G rests directly below X, where the moment becomes zero."
    },
    {
      question: "Why does a uniform ring have its CG in empty space, and is this physically valid?",
      checklist: [
        "Explained that CG is a mathematical point representing balance",
        "Stated that symmetrical mass distribution places G at the geometric center",
        "Validated that G does not need to lie on physical matter"
      ],
      modelAnswer: "Yes, this is physically valid. The Centre of Gravity is a mathematical balance point. Since a ring is uniform and circular, its mass is distributed symmetrically around its center. Therefore, the resultant gravity vector acts at the geometric center, which lies in the empty hole."
    },
    {
      question: "Explain the difference between the geometric center and the Centre of Gravity for a non-uniform baseball bat.",
      checklist: [
        "Stated that geometric center is the physical middle point",
        "Mentioned that mass is concentrated more at the thick hitting end",
        "Explained that CG is shifted toward the heavier end"
      ],
      modelAnswer: "The geometric center is simply the spatial midpoint of the bat. However, because a baseball bat is thicker and heavier at one end, the mass is not distributed uniformly. The Centre of Gravity (CG) will be shifted away from the geometric center towards the heavier, wider hitting end."
    },
    {
      question: "Why does lowering the CG of a racing car increase its stability when turning corners?",
      checklist: [
        "Stated that lowering CG keeps the line of action inside the base",
        "Explained that it reduces the tipping moment about the outer wheels",
        "Mentioned that it prevents the car from toppling easily"
      ],
      modelAnswer: "Lowering the CG decreases the perpendicular height of G above the ground. When cornering, this shorter height reduces the overturning moment about the outer wheels. It also makes it harder for the vehicle's weight line of action to fall outside its wheel track, dramatically increasing stability."
    },
    {
      question: "A uniform wooden plank is pivoted at its center. If you place a block on the left end, why does the plank tilt, and how does the CG change?",
      checklist: [
        "Mentioned that block adds mass to the left side",
        "Explained that the new combined CG shifts to the left of the pivot",
        "Stated that gravity now creates a counter-clockwise turning moment"
      ],
      modelAnswer: "Placing a block on the left end shifts the combined Centre of Gravity of the plank-block system to the left of the pivot. Since G is no longer directly above the pivot, the downward force of gravity acts at this offset, producing a counter-clockwise moment that tilts the plank."
    },
    {
      question: "Why is a plumb-line necessary in Section 2's simulator, rather than just guessing a vertical line?",
      checklist: [
        "Stated that gravity aligns the plumb-line perfectly vertical",
        "Explained that human eyes are not precise enough to guess verticality",
        "Mentioned that it ensures the drawn line passes directly through G"
      ],
      modelAnswer: "The plumb-line uses gravity to define a perfectly vertical reference line. Since a freely suspended shape rests only when its CG is directly beneath the pivot, the plumb-line provides a guaranteed vertical path that passes straight through G, eliminating human estimation error."
    },
    {
      question: "Explain why three drawn plumb lines would still intersect at the same point G.",
      checklist: [
        "Mentioned that an object has only one unique Centre of Gravity",
        "Stated that all suspension points produce a vertical line through G",
        "Concluded that any additional lines are redundant but will intersect at G"
      ],
      modelAnswer: "Every rigid object has only one unique Centre of Gravity. Since suspending the object from any point will always result in G settling vertically below the pivot, a third plumb line drawn from a third pivot will also pass through G, intersecting at the exact same point."
    },
    {
      question: "If you cut a uniform L-shaped piece of cardboard, where would its CG be and how can you prove it experimentally?",
      checklist: [
        "Stated that the CG lies in the air outside the cardboard boundaries",
        "Explained you can suspend it and hang a plumb line",
        "Mentioned verifying it by supporting it horizontally on a needle at that empty point"
      ],
      modelAnswer: "The CG of an L-shape lies in the empty space between its arms. You can prove this by suspending it from two points and drawing plumb lines on extensions or finding where they intersect. You can verify it by attaching a light, rigid piece of tape across the gap and balancing G on a pin."
    }
  ];

  typeCQuestions.forEach((q, i) => {
    pool.push({
      type: "C",
      title: "Structured Explanation",
      questionText: q.question,
      checklist: q.checklist,
      modelAnswer: q.modelAnswer
    });
  });

  return pool;
}

// Fisher-Yates Shuffle
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function initSection4() {
  state.section4.questions = shuffleArray(generateQuizPool());
  state.section4.currentIndex = 0;
  state.section4.score = 0;
  state.section4.userAnswer = null;
  state.section4.isSubmitted = false;

  document.getElementById('quiz-play-state').style.display = 'block';
  document.getElementById('quiz-results-state').style.display = 'none';

  loadQuizQuestion();
}

function loadQuizQuestion() {
  state.section4.isSubmitted = false;
  state.section4.userAnswer = null;

  const q = state.section4.questions[state.section4.currentIndex];
  
  // Update header
  document.getElementById('quiz-question-number').textContent = `Question ${state.section4.currentIndex + 1} of 30`;
  const progressPercent = (state.section4.currentIndex / 30) * 100;
  document.getElementById('quiz-progress-bar').style.width = `${progressPercent}%`;
  document.getElementById('quiz-score-display').textContent = `Score: ${state.section4.score}`;

  // Hide conditional boxes
  document.getElementById('quiz-explanation-box').style.display = 'none';
  document.getElementById('quiz-self-assess-box').style.display = 'none';
  document.getElementById('quiz-next-btn').style.display = 'none';

  // Load question content
  const qText = document.getElementById('quiz-question-text');
  const visual = document.getElementById('quiz-visual-container');
  const optContainer = document.getElementById('quiz-options-container');
  const structContainer = document.getElementById('quiz-structured-container');

  if (q.type === 'A') {
    qText.textContent = `Type A: ${q.title}`;
    visual.style.display = 'flex';
    optContainer.style.display = 'grid';
    structContainer.style.display = 'none';
    renderQuizSVG(q.shapeData);
    renderMCQOptions(q.shapeData.options);
  } else if (q.type === 'B') {
    qText.textContent = `Type B: ${q.questionText}`;
    visual.style.display = 'flex';
    optContainer.style.display = 'grid';
    structContainer.style.display = 'none';
    renderQuizLoadedBoardSVG(q);
    renderMCQOptions(q.options);
  } else {
    // Type C
    qText.textContent = `Type C: ${q.questionText}`;
    visual.style.display = 'flex';
    optContainer.style.display = 'none';
    structContainer.style.display = 'block';
    document.getElementById('quiz-structured-input').value = '';
    renderQuizTypeCSVG();
  }
}

function renderQuizSVG(shape) {
  const svg = document.getElementById('quiz-svg');
  svg.innerHTML = '';

  // Draw Shape
  if (shape.isCircle) {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", "175");
    circle.setAttribute("cy", "100");
    circle.setAttribute("r", "45");
    circle.setAttribute("fill", "rgba(20,24,46,0.85)");
    circle.setAttribute("stroke", "var(--neon-cyan)");
    circle.setAttribute("stroke-width", "2.5");
    svg.appendChild(circle);
  } else if (shape.isRing) {
    const ringOut = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    ringOut.setAttribute("cx", "175");
    ringOut.setAttribute("cy", "100");
    ringOut.setAttribute("r", "55");
    ringOut.setAttribute("fill", "rgba(20,24,46,0.85)");
    ringOut.setAttribute("stroke", "var(--neon-cyan)");
    ringOut.setAttribute("stroke-width", "2.5");
    svg.appendChild(ringOut);

    const ringIn = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    ringIn.setAttribute("cx", "175");
    ringIn.setAttribute("cy", "100");
    ringIn.setAttribute("r", "35");
    ringIn.setAttribute("fill", "var(--bg-darker)");
    ringIn.setAttribute("stroke", "var(--neon-cyan)");
    ringIn.setAttribute("stroke-width", "2");
    svg.appendChild(ringIn);
  } else if (shape.isSemiCircle) {
    const semi = document.createElementNS("http://www.w3.org/2000/svg", "path");
    semi.setAttribute("d", "M 120,150 A 55,55 0 0,1 230,150 Z");
    semi.setAttribute("fill", "rgba(20,24,46,0.85)");
    semi.setAttribute("stroke", "var(--neon-cyan)");
    semi.setAttribute("stroke-width", "2.5");
    svg.appendChild(semi);
  } else {
    // Polygon
    const poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    poly.setAttribute("points", shape.vertices.map(v => v.join(',')).join(' '));
    poly.setAttribute("fill", "rgba(20,24,46,0.85)");
    poly.setAttribute("stroke", "var(--neon-cyan)");
    poly.setAttribute("stroke-width", "2.5");
    svg.appendChild(poly);
  }

  // Draw Option Letters
  shape.options.forEach((opt, idx) => {
    const key = ["A", "B", "C", "D"][idx];
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", opt.x);
    circle.setAttribute("cy", opt.y);
    circle.setAttribute("r", "3");
    circle.setAttribute("fill", "var(--neon-purple)");
    svg.appendChild(circle);

    const txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
    txt.setAttribute("x", opt.x + 6);
    txt.setAttribute("y", opt.y + 4);
    txt.setAttribute("fill", "#fff");
    txt.setAttribute("font-size", "11px");
    txt.setAttribute("font-weight", "bold");
    txt.textContent = key;
    svg.appendChild(txt);
  });
}

function renderQuizLoadedBoardSVG(q) {
  const svg = document.getElementById('quiz-svg');
  svg.innerHTML = '';

  // Draw plank
  const board = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  board.setAttribute("x", "50");
  board.setAttribute("y", "90");
  board.setAttribute("width", "250");
  board.setAttribute("height", "15");
  board.setAttribute("fill", "rgba(255,255,255,0.05)");
  board.setAttribute("stroke", "var(--neon-cyan)");
  board.setAttribute("stroke-width", "2");
  svg.appendChild(board);

  // Pivot at centre
  const pivot = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  pivot.setAttribute("points", "175,105 165,125 185,125");
  pivot.setAttribute("fill", "var(--text-muted)");
  svg.appendChild(pivot);

  // Loaded mass
  const block = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  const bx = q.side === "left" ? "80" : "220";
  block.setAttribute("x", bx);
  block.setAttribute("y", "70");
  block.setAttribute("width", "25");
  block.setAttribute("height", "20");
  block.setAttribute("fill", "var(--neon-pink)");
  block.setAttribute("stroke", "#fff");
  svg.appendChild(block);

  const blockLbl = document.createElementNS("http://www.w3.org/2000/svg", "text");
  blockLbl.setAttribute("x", parseInt(bx) + 12);
  blockLbl.setAttribute("y", "83");
  blockLbl.setAttribute("fill", "#fff");
  blockLbl.setAttribute("font-size", "9px");
  blockLbl.setAttribute("text-anchor", "middle");
  blockLbl.textContent = "MASS";
  svg.appendChild(blockLbl);
}

function renderQuizTypeCSVG() {
  const svg = document.getElementById('quiz-svg');
  svg.innerHTML = '';

  // Draw structured helper diagram
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M 120,60 C 180,30 240,60 250,110 C 260,160 180,170 150,160 C 120,150 90,110 120,60 Z");
  path.setAttribute("fill", "rgba(20,24,46,0.85)");
  path.setAttribute("stroke", "var(--neon-purple)");
  path.setAttribute("stroke-width", "2.5");
  svg.appendChild(path);

  // Suspension line
  const pin = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  pin.setAttribute("cx", "175");
  pin.setAttribute("cy", "60");
  pin.setAttribute("r", "4");
  pin.setAttribute("fill", "var(--neon-cyan)");
  svg.appendChild(pin);

  const string = document.createElementNS("http://www.w3.org/2000/svg", "line");
  string.setAttribute("x1", "175");
  string.setAttribute("y1", "60");
  string.setAttribute("x2", "175");
  string.setAttribute("y2", "180");
  string.setAttribute("stroke", "var(--neon-cyan)");
  string.setAttribute("stroke-width", "1");
  string.setAttribute("stroke-dasharray", "3,3");
  svg.appendChild(string);

  const g = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  g.setAttribute("cx", "175");
  g.setAttribute("cy", "110");
  g.setAttribute("r", "5");
  g.setAttribute("fill", "var(--neon-green)");
  svg.appendChild(g);

  const gLbl = document.createElementNS("http://www.w3.org/2000/svg", "text");
  gLbl.setAttribute("x", "185");
  gLbl.setAttribute("y", "114");
  gLbl.setAttribute("fill", "#fff");
  gLbl.setAttribute("font-size", "12px");
  gLbl.setAttribute("font-weight", "bold");
  gLbl.textContent = "G";
  svg.appendChild(gLbl);
}

function renderMCQOptions(options) {
  const container = document.getElementById('quiz-options-container');
  container.innerHTML = '';

  options.forEach((opt, idx) => {
    const key = ["A", "B", "C", "D"][idx];
    const btn = document.createElement('button');
    btn.className = "option-btn";
    btn.innerHTML = `<span class="option-prefix">${key}</span> ${opt.label || opt.text}`;
    btn.onclick = () => submitMCQAnswer(idx);
    container.appendChild(btn);
  });
}

function submitMCQAnswer(index) {
  if (state.section4.isSubmitted) return;
  state.section4.isSubmitted = true;
  state.section4.userAnswer = index;

  const q = state.section4.questions[state.section4.currentIndex];
  const options = q.type === 'A' ? q.shapeData.options : q.options;
  const correctIdx = options.findIndex(o => o.correct);

  const btns = document.querySelectorAll('#quiz-options-container .option-btn');
  
  if (index === correctIdx) {
    btns[index].classList.add('correct');
    state.section4.score++;
    triggerConfetti();
  } else {
    btns[index].classList.add('incorrect');
    btns[correctIdx].classList.add('correct');
  }

  // Explanation
  const expBox = document.getElementById('quiz-explanation-box');
  const expText = document.getElementById('quiz-explanation-text');
  document.getElementById('explanation-title').textContent = index === correctIdx ? "Correct! 🎉" : "Incorrect ❌";
  expText.textContent = q.explanation;
  expBox.style.display = 'block';

  document.getElementById('quiz-next-btn').style.display = 'inline-block';
  document.getElementById('quiz-score-display').textContent = `Score: ${state.section4.score}`;
}

function submitStructuredAnswer() {
  const val = document.getElementById('quiz-structured-input').value.trim();
  if (!val) return;

  const q = state.section4.questions[state.section4.currentIndex];
  
  // Show model answer and self assessment
  const expBox = document.getElementById('quiz-explanation-box');
  const expText = document.getElementById('quiz-explanation-text');
  document.getElementById('explanation-title').textContent = "Model Answer";
  expText.textContent = q.modelAnswer;
  expBox.style.display = 'block';

  const assessBox = document.getElementById('quiz-self-assess-box');
  const checklist = document.getElementById('self-assess-checklist');
  checklist.innerHTML = '';
  
  q.checklist.forEach((item, idx) => {
    const label = document.createElement('label');
    label.className = "checklist-item";
    label.innerHTML = `<input type="checkbox" id="chk-${idx}"> <span>${item}</span>`;
    checklist.appendChild(label);
  });

  assessBox.style.display = 'block';
  document.getElementById('quiz-next-btn').style.display = 'inline-block';
  document.getElementById('quiz-structured-container').querySelector('button').disabled = true;
}

function nextQuizQuestion() {
  document.getElementById('quiz-structured-container').querySelector('button').disabled = false;
  state.section4.currentIndex++;
  if (state.section4.currentIndex < 30) {
    loadQuizQuestion();
  } else {
    showQuizResults();
  }
}

function showQuizResults() {
  document.getElementById('quiz-play-state').style.display = 'none';
  document.getElementById('quiz-results-state').style.display = 'block';

  const finalScore = document.getElementById('quiz-final-score');
  const gradeBadge = document.getElementById('quiz-grade-badge');
  const gradeDesc = document.getElementById('quiz-grade-desc');

  const score = state.section4.score;
  finalScore.textContent = `${score} / 20`;

  if (score >= 17) {
    gradeBadge.textContent = "Excellent";
    gradeBadge.className = "grade-badge grade-excellent";
    gradeDesc.textContent = "Excellent — you have mastered centre of gravity! Your understanding of torque balance and vector resolution is top tier.";
    triggerConfetti();
  } else if (score >= 10) {
    gradeBadge.textContent = "Good Effort";
    gradeBadge.className = "grade-badge grade-good";
    gradeDesc.textContent = "Good effort — review the explanations for any missed questions and try again.";
  } else {
    gradeBadge.textContent = "Keep Practising";
    gradeBadge.className = "grade-badge grade-poor";
    gradeDesc.textContent = "Keep practising — revisit the plumb-line simulator in Section 2 to build stronger intuition.";
  }
}

function restartQuiz() {
  initSection4();
}


// --- SECTION 5: FLASHCARD REVISION MODE ---
const FLASHCARD_DECK = [
  {
    q: "What is the Centre of Gravity (CG)?",
    a: "The Centre of Gravity of an object is the single point at which the entire weight of the object can be taken to act."
  },
  {
    q: "Why can the weight of a multi-particle object be treated as acting at a single point?",
    a: "Because the sum of all individual gravitational forces acting on all particles in the object produces a resultant torque and force equivalent to a single weight vector acting from G."
  },
  {
    q: "Explain how the plumb-line method works step by step.",
    a: "1. Suspend the object freely from a pivot pin. 2. Hang a plumb line from the same pin and draw its vertical path on the object. 3. Suspend from a different pivot and draw the new vertical line. 4. The intersection of the lines is G."
  },
  {
    q: "Why are two suspension points needed rather than just one to find the CG?",
    a: "One suspension point gives a line along which the CG must lie, but we don't know the exact position. A second suspension point gives a second line; the unique intersection point of the two lines is the CG."
  },
  {
    q: "Where is the CG for a uniform rectangular shape?",
    a: "For any uniform symmetrical shape, the Centre of Gravity lies exactly at its geometric center (intersection of diagonals)."
  },
  {
    q: "Where is the CG for a uniform triangular shape?",
    a: "The CG of a uniform triangle lies 1/3 of the vertical height upward from the base along the medians."
  },
  {
    q: "What happens when an additional mass is attached to a uniform object?",
    a: "The Centre of Gravity of the combined system shifts away from the original position, moving directly towards the added mass."
  },
  {
    q: "Why does a freely suspended object always hang with its CG directly below the pivot?",
    a: "If G is not directly below the pivot, the weight creates an unbalanced moment around the pivot, causing it to swing. It stops only when the moment becomes zero, which happens when G is vertically aligned under the pivot."
  },
  {
    q: "How does the position of the CG relate to whether an object balances or topples?",
    a: "An object will remain stable (balance) as long as the vertical line of action of its weight through G falls within its base of support. If this line falls outside the base, an unbalanced moment will cause it to topple."
  },
  {
    q: "What is a common mistake regarding the location of the CG?",
    a: "Assuming that the CG must always lie on the physical material of the shape (like a ring or L-shape), or that it always matches the geometric center of non-uniform shapes."
  }
];

function initSection5() {
  state.section5.deck = [...FLASHCARD_DECK];
  state.section5.cardIndex = 0;
  state.section5.isFlipped = false;
  showFlashcard();
}

function showFlashcard() {
  const card = state.section5.deck[state.section5.cardIndex];
  const elem = document.getElementById('flashcard-element');
  elem.classList.remove('flipped');
  state.section5.isFlipped = false;

  document.getElementById('flashcard-index').textContent = `Card ${state.section5.cardIndex + 1} / 10`;
  document.getElementById('flashcard-front-text').textContent = card.q;
  document.getElementById('flashcard-back-text').textContent = card.a;
}

function flipFlashcard() {
  const elem = document.getElementById('flashcard-element');
  state.section5.isFlipped = !state.section5.isFlipped;
  elem.classList.toggle('flipped', state.section5.isFlipped);
}

function nextFlashcard() {
  state.section5.cardIndex = (state.section5.cardIndex + 1) % state.section5.deck.length;
  showFlashcard();
}

function prevFlashcard() {
  state.section5.cardIndex = (state.section5.cardIndex - 1 + state.section5.deck.length) % state.section5.deck.length;
  showFlashcard();
}

function shuffleFlashcards() {
  state.section5.deck = shuffleArray([...FLASHCARD_DECK]);
  state.section5.cardIndex = 0;
  showFlashcard();
}


// --- CELEBRATION EFFECTS ---
function triggerConfetti() {
  const holder = document.getElementById('confetti-holder');
  if (!holder) return;

  const colors = ['#00f0ff', '#d000ff', '#39ff14', '#ff007f', '#ffea00'];
  for (let i = 0; i < 60; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = `${Math.random() * 100}vw`;
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.width = `${Math.random() * 8 + 6}px`;
    confetti.style.height = confetti.style.width;
    confetti.style.top = `-20px`;
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
    
    const duration = Math.random() * 2 + 1.5;
    confetti.style.animation = `fall ${duration}s linear forwards`;
    
    holder.appendChild(confetti);

    setTimeout(() => {
      confetti.remove();
    }, duration * 1000);
  }
}

// Global initialization on page load
window.addEventListener('load', () => {
  initSection1();
});
