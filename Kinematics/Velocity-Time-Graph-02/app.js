// Kinematics: velocity-time graph App Logic

let currentMode = 'explore'; // 'explore' or 'test'
let chart = null;

// Sliders and parameter inputs
const sliders = {
  v0: document.getElementById('slide-v0'),
  v1: document.getElementById('slide-v1'),
  v2: document.getElementById('slide-v2'),
  t1: document.getElementById('slide-t1'),
  t2: document.getElementById('slide-t2')
};

// Values displayed in UI
const displays = {
  v0: document.getElementById('val-v0'),
  v1: document.getElementById('val-v1'),
  v2: document.getElementById('val-v2'),
  t1: document.getElementById('val-t1'),
  t2: document.getElementById('val-t2'),
  expA1: document.getElementById('exp-a1'),
  expS1: document.getElementById('exp-s1'),
  expA2: document.getElementById('exp-a2'),
  expS2: document.getElementById('exp-s2')
};

// Test Mode State
let testParams = {
  v0: 0,
  v1: 10,
  v2: 5,
  t1: 8,
  t2: 16,
  a1: 0,
  s1: 0,
  a2: 0,
  s2: 0,
  hiddenSeg1: [], // e.g. ['v0', 'a1']
  hiddenSeg2: []  // e.g. ['s2', 'v2']
};

// Units mapper
const units = {
  v0: 'm/s',
  v1: 'm/s',
  v2: 'm/s',
  t1: 's',
  t2: 's',
  a1: 'm/s2',
  a2: 'm/s2',
  s1: 'm',
  s2: 'm'
};

const fullNames = {
  v0: 'Initial velocity (v₀)',
  v1: 'Mid velocity (v₁)',
  v2: 'Final velocity (v₂)',
  t1: 'Mid time (t₁)',
  t2: 'End time (t₂)',
  a1: 'Acceleration in Segment 1 (a₁)',
  a2: 'Acceleration in Segment 2 (a₂)',
  s1: 'Displacement in Segment 1 (s₁)',
  s2: 'Displacement in Segment 2 (s₂)'
};

// Initialize app
window.addEventListener('DOMContentLoaded', () => {
  initChart();
  setupEventListeners();
  updateSimulation();
});

function initChart() {
  const ctx = document.getElementById('vt-chart').getContext('2d');
  
  // Custom plugin to draw dotted guides and values on the canvas
  const dottedGuidesPlugin = {
    id: 'dottedGuides',
    afterDraw: (chartInstance) => {
      const { ctx, chartArea: { left, right, top, bottom }, scales: { x, y } } = chartInstance;
      ctx.save();
      
      const v0Val = currentMode === 'explore' ? parseFloat(sliders.v0.value) : testParams.v0;
      const v1Val = currentMode === 'explore' ? parseFloat(sliders.v1.value) : testParams.v1;
      const v2Val = currentMode === 'explore' ? parseFloat(sliders.v2.value) : testParams.v2;
      const t1Val = currentMode === 'explore' ? parseInt(sliders.t1.value) : testParams.t1;
      const t2Val = currentMode === 'explore' ? parseInt(sliders.t2.value) : testParams.t2;

      const points = [
        { t: 0, v: v0Val, label: 'v₀', isHidden: currentMode === 'test' && testParams.hiddenSeg1.includes('v0') },
        { t: t1Val, v: v1Val, label: 'v₁', labelT: 't₁', isHiddenV: currentMode === 'test' && (testParams.hiddenSeg1.includes('v1') || testParams.hiddenSeg2.includes('v1')), isHiddenT: currentMode === 'test' && (testParams.hiddenSeg1.includes('t1') || testParams.hiddenSeg2.includes('t1')) },
        { t: t2Val, v: v2Val, label: 'v₂', labelT: 't₂', isHiddenV: currentMode === 'test' && testParams.hiddenSeg2.includes('v2'), isHiddenT: false } // t_2 is never explicitly hidden, but x-axis hides it anyway in test mode
      ];

      // Draw dotted guidelines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      points.forEach((pt, index) => {
        const xPos = x.getPixelForValue(pt.t);
        const yPos = y.getPixelForValue(pt.v);

        // Vertical guide to x-axis
        if (pt.t > 0) {
          ctx.beginPath();
          ctx.moveTo(xPos, yPos);
          ctx.lineTo(xPos, bottom);
          ctx.stroke();
        }

        // Horizontal guide to y-axis
        ctx.beginPath();
        ctx.moveTo(xPos, yPos);
        ctx.lineTo(left, yPos);
        ctx.stroke();

        // Draw labels on axis
        ctx.fillStyle = '#f8fafc';
        ctx.font = '500 12px Outfit, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';

        // Y-axis Label
        let yLabelText = '';
        if (currentMode === 'explore') {
          yLabelText = pt.v.toFixed(1);
        } else {
          // In test mode
          if (index === 0) {
            yLabelText = pt.isHidden ? 'v₀' : `${pt.v}`;
          } else if (index === 1) {
            yLabelText = pt.isHiddenV ? 'v₁' : `${pt.v}`;
          } else {
            yLabelText = pt.isHiddenV ? 'v₂' : `${pt.v}`;
          }
        }
        ctx.fillText(yLabelText, left - 8, yPos);

        // X-axis Label
        if (pt.t > 0) {
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          let xLabelText = '';
          if (currentMode === 'explore') {
            xLabelText = `${pt.t} s`;
          } else {
            if (index === 1) {
              xLabelText = pt.isHiddenT ? 't₁' : `${pt.t}`;
            } else {
              xLabelText = `${pt.t}`;
            }
          }
          ctx.fillText(xLabelText, xPos, bottom + 8);
        }
      });

      // Draw the name of the x-axis "time / s" near the end of the x-axis but below the x-axis
      ctx.fillStyle = '#f8fafc';
      ctx.font = '600 13px Outfit, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      ctx.fillText('time / s', right, bottom + 35);

      ctx.restore();
    }
  };

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [{
        label: 'Velocity-Time Graph',
        data: [],
        borderColor: '#06b6d4',
        borderWidth: 3,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#06b6d4',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        fill: false,
        tension: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          left: 5,
          bottom: 20
        }
      },
      scales: {
        x: {
          type: 'linear',
          min: 0,
          max: 20,
          ticks: {
            stepSize: 0.5,
            color: '#94a3b8',
            font: { family: 'Outfit' },
            maxRotation: 0,
            minRotation: 0,
            callback: function(val) {
              return currentMode === 'explore' ? `${val}` : ''; // hide axis values in test mode
            }
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.05)'
          }
        },
        y: {
          min: 0,
          max: 20,
          ticks: {
            stepSize: 1,
            autoSkip: false,
            color: '#94a3b8',
            font: { family: 'Outfit' },
            callback: function(val) {
              return currentMode === 'explore' ? `${val}` : '         '; // hide axis values but reserve space in test mode
            }
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.05)'
          },
          title: {
            display: true,
            text: 'Velocity v (m/s)',
            color: '#f8fafc',
            font: { family: 'Outfit', size: 14, weight: '600' },
            padding: 20
          }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          callbacks: {
            label: function(context) {
              return `t: ${context.parsed.x} s, v: ${context.parsed.y} m/s`;
            }
          }
        }
      }
    },
    plugins: [dottedGuidesPlugin]
  });
}

function setupEventListeners() {
  Object.keys(sliders).forEach(key => {
    sliders[key].addEventListener('input', () => {
      // Dynamic slider validation constraints
      if (key === 't1') {
        const t1Val = parseInt(sliders.t1.value);
        sliders.t2.min = t1Val + 1;
        if (parseInt(sliders.t2.value) <= t1Val) {
          sliders.t2.value = t1Val + 1;
        }
      }
      updateSimulation();
    });
  });
}

function updateSimulation() {
  if (currentMode !== 'explore') return;

  const v0 = parseFloat(sliders.v0.value);
  const v1 = parseFloat(sliders.v1.value);
  const v2 = parseFloat(sliders.v2.value);
  const t1 = parseInt(sliders.t1.value);
  const t2 = parseInt(sliders.t2.value);

  // Update display values
  displays.v0.innerText = `${v0.toFixed(1)} m/s`;
  displays.v1.innerText = `${v1.toFixed(1)} m/s`;
  displays.v2.innerText = `${v2.toFixed(1)} m/s`;
  displays.t1.innerText = `${t1} s`;
  displays.t2.innerText = `${t2} s`;

  // Calculate segment results
  const a1 = t1 > 0 ? (v1 - v0) / t1 : 0;
  const s1 = 0.5 * (v0 + v1) * t1;

  const dt2 = t2 - t1;
  const a2 = dt2 > 0 ? (v2 - v1) / dt2 : 0;
  const s2 = 0.5 * (v1 + v2) * dt2;

  // Update explores results
  displays.expA1.innerText = `${a1.toFixed(2)} m/s²`;
  displays.expS1.innerText = `${s1.toFixed(2)} m`;
  displays.expA2.innerText = `${a2.toFixed(2)} m/s²`;
  displays.expS2.innerText = `${s2.toFixed(2)} m`;

  // Update graph dataset
  chart.data.datasets[0].data = [
    { x: 0, y: v0 },
    { x: t1, y: v1 },
    { x: t2, y: v2 }
  ];
  chart.update();
}

function resetSliders() {
  sliders.v0.value = 0;
  sliders.v1.value = 10;
  sliders.v2.value = 5;
  sliders.t1.value = 8;
  sliders.t2.value = 16;
  sliders.t2.min = 8;
  updateSimulation();
}

function setMode(mode) {
  currentMode = mode;
  document.getElementById('explore-btn').classList.toggle('active', mode === 'explore');
  document.getElementById('test-btn').classList.toggle('active', mode === 'test');
  
  document.getElementById('explore-panel').style.display = mode === 'explore' ? 'block' : 'none';
  document.getElementById('test-panel').style.display = mode === 'test' ? 'block' : 'none';

  // Toggle tooltip enablement depending on mode
  chart.options.plugins.tooltip.enabled = (mode === 'explore');

  if (mode === 'test') {
    generateNewQuiz();
  } else {
    updateSimulation();
  }
}

function generateNewQuiz() {
  // Randomise parameter values
  // velocity step 0.5 from 0 to 20
  const randVel = () => Math.floor(Math.random() * 41) * 0.5;
  // times: t_1 from 1 to 19, t_2 from t_1 + 1 to 20
  const t1 = Math.floor(Math.random() * 19) + 1; // 1 to 19
  const t2 = Math.floor(Math.random() * (20 - t1)) + t1 + 1; // (t_1 + 1) to 20

  testParams.v0 = randVel();
  testParams.v1 = randVel();
  testParams.v2 = randVel();
  testParams.t1 = t1;
  testParams.t2 = t2;

  // Compute answers
  testParams.a1 = testParams.t1 > 0 ? (testParams.v1 - testParams.v0) / testParams.t1 : 0;
  testParams.s1 = 0.5 * (testParams.v0 + testParams.v1) * testParams.t1;

  const dt2 = testParams.t2 - testParams.t1;
  testParams.a2 = dt2 > 0 ? (testParams.v2 - testParams.v1) / dt2 : 0;
  testParams.s2 = 0.5 * (testParams.v1 + testParams.v2) * dt2;

  // Decide which 2 variables to hide for segment 1 (among v0, v1, t1, a1, s1)
  // Constraint: Never hide both v0 and v1
  const seg1Candidates = ['v0', 'v1', 't1', 'a1', 's1'];
  testParams.hiddenSeg1 = chooseTwoWithConstraint(seg1Candidates, 'v0', 'v1');

  // Coordinated selection for Segment 2 to guarantee exactly 2 unknowns per segment
  const isV1Hidden = testParams.hiddenSeg1.includes('v1');
  const isT1Hidden = testParams.hiddenSeg1.includes('t1');

  testParams.hiddenSeg2 = [];
  if (isV1Hidden) {
    testParams.hiddenSeg2.push('v1');
  }
  if (isT1Hidden) {
    testParams.hiddenSeg2.push('t1');
  }

  // Fill the rest of Segment 2 hidden parameters to make exactly 2 unknowns
  const seg2RemainingCandidates = ['v2', 'a2', 's2'];
  const shuffledCandidates = seg2RemainingCandidates.sort(() => 0.5 - Math.random());
  
  while (testParams.hiddenSeg2.length < 2) {
    const candidate = shuffledCandidates.pop();
    // Constraint: Never hide both v2 and v1 together
    if (candidate === 'v2' && testParams.hiddenSeg2.includes('v1')) {
      continue; 
    }
    testParams.hiddenSeg2.push(candidate);
  }

  // Draw chart in quiz mode
  chart.data.datasets[0].data = [
    { x: 0, y: testParams.v0 },
    { x: testParams.t1, y: testParams.v1 },
    { x: testParams.t2, y: testParams.v2 }
  ];
  chart.update();

  // Reset feedback
  const feedbackBox = document.getElementById('quiz-feedback-box');
  feedbackBox.style.display = 'none';
  feedbackBox.className = 'quiz-feedback';

  // Render question textboxes
  renderQuizInputs();
}

function chooseTwoWithConstraint(list, forbiddenA, forbiddenB) {
  let chosen = [];
  while (chosen.length < 2) {
    const item = list[Math.floor(Math.random() * list.length)];
    if (!chosen.includes(item)) {
      chosen.push(item);
    }
    // Check constraint
    if (chosen.includes(forbiddenA) && chosen.includes(forbiddenB)) {
      chosen = []; // Reset and try again
    }
  }
  return chosen;
}

function renderQuizInputs() {
  const qGroup1 = document.getElementById('q-group-1');
  const qGroup2 = document.getElementById('q-group-2');

  qGroup1.innerHTML = '';
  qGroup2.innerHTML = '';

  const isV1Hidden = testParams.hiddenSeg1.includes('v1') || testParams.hiddenSeg2.includes('v1');
  const isT1Hidden = testParams.hiddenSeg1.includes('t1') || testParams.hiddenSeg2.includes('t1');

  // Helper function to build question row
  const buildRow = (param, segNum, forceHidden = null) => {
    let isHidden = segNum === 1 ? testParams.hiddenSeg1.includes(param) : testParams.hiddenSeg2.includes(param);
    if (forceHidden !== null) {
      isHidden = forceHidden;
    }

    if (!isHidden) {
      // Just show static known info
      let displayVal = '';
      if (param.startsWith('v')) {
        displayVal = `${testParams[param]} m/s`;
      } else if (param.startsWith('t')) {
        displayVal = `${testParams[param]} s`;
      } else if (param.startsWith('a')) {
        displayVal = `${testParams[param].toFixed(2)} m/s²`;
      } else {
        displayVal = `${testParams[param].toFixed(2)} m`;
      }
      return `
        <div class="question-item">
          <div class="question-text" style="color: var(--text-secondary); font-weight: normal;">
            ${fullNames[param]}: <strong>${displayVal}</strong>
          </div>
        </div>
      `;
    }

    // Interactive input for hidden values
    return `
      <div class="question-item">
        <label class="question-text" for="input-${param}">Calculate ${fullNames[param]}:</label>
        <div class="input-row">
          <input type="text" id="input-${param}" class="answer-input" placeholder="e.g. 5.5 ${units[param]}">
          <button class="icon-btn" onclick="showWorking('${param}', ${segNum})" title="Show Working">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
          </button>
        </div>
      </div>
    `;
  };

  // Populate Segment 1
  ['v0', 'v1', 't1', 'a1', 's1'].forEach(p => {
    let forceHidden = null;
    if (p === 'v1') forceHidden = isV1Hidden;
    if (p === 't1') forceHidden = isT1Hidden;
    qGroup1.innerHTML += buildRow(p, 1, forceHidden);
  });

  // Populate Segment 2
  ['v1', 'v2', 't1', 'a2', 's2'].forEach(p => {
    if (p === 't1' && isT1Hidden) {
      qGroup2.innerHTML += `
        <div class="question-item">
          <div class="question-text" style="color: var(--text-muted); font-style: italic;">
            t₁ is input above in Segment 1.
          </div>
        </div>
      `;
    } else if (p === 'v1' && isV1Hidden) {
      qGroup2.innerHTML += `
        <div class="question-item">
          <div class="question-text" style="color: var(--text-muted); font-style: italic;">
            v₁ is input above in Segment 1.
          </div>
        </div>
      `;
    } else {
      qGroup2.innerHTML += buildRow(p, 2);
    }
  });
}

function checkAnswers() {
  let allCorrect = true;
  const feedbackList = [];

  const isV1Hidden = testParams.hiddenSeg1.includes('v1') || testParams.hiddenSeg2.includes('v1');
  const isT1Hidden = testParams.hiddenSeg1.includes('t1') || testParams.hiddenSeg2.includes('t1');

  // Combine both segment lists of hidden elements consistently
  const allHidden = [];
  ['v0', 'v1', 't1', 'a1', 's1'].forEach(p => {
    let hidden = false;
    if (p === 'v1') hidden = isV1Hidden;
    else if (p === 't1') hidden = isT1Hidden;
    else hidden = testParams.hiddenSeg1.includes(p);
    
    if (hidden) {
      allHidden.push({ param: p, seg: 1 });
    }
  });

  ['v2', 'a2', 's2'].forEach(p => {
    if (testParams.hiddenSeg2.includes(p)) {
      allHidden.push({ param: p, seg: 2 });
    }
  });

  allHidden.forEach(({ param, seg }) => {
    const inputEl = document.getElementById(`input-${param}`);
    if (!inputEl) return;

    const userVal = inputEl.value.trim();
    const targetVal = testParams[param];
    const unit = units[param];

    // Regex to split value and unit
    // Match optional negative, digits, optional decimal point, followed by optional spaces, then units
    const match = userVal.match(/^([-+]?[0-9]*\.?[0-9]+)\s*([a-zA-Z0-9/²]+)?$/);
    
    if (!match) {
      inputEl.className = 'answer-input incorrect';
      allCorrect = false;
      feedbackList.push(`${fullNames[param]}: Invalid format. Ensure you include a number and the correct unit.`);
      return;
    }

    const numericVal = parseFloat(match[1]);
    const userUnit = match[2] ? match[2].trim() : '';

    // Unit validation: O-Level Physics units are case sensitive (m/s, s, m/s2, m)
    // Note: user might input "m/s2" for m/s²
    let correctUnit = false;
    if (unit === 'm/s2') {
      correctUnit = (userUnit === 'm/s2' || userUnit === 'm/s²');
    } else {
      correctUnit = (userUnit === unit);
    }

    // Value validation (allow margin of error due to rounding, e.g. 0.01)
    const valDiff = Math.abs(numericVal - targetVal);
    const correctValue = valDiff < 0.02;

    if (correctValue && correctUnit) {
      inputEl.className = 'answer-input correct';
    } else {
      inputEl.className = 'answer-input incorrect';
      allCorrect = false;
      if (!correctValue && !correctUnit) {
        feedbackList.push(`${fullNames[param]}: Incorrect value and incorrect unit (expected unit is "${unit}").`);
      } else if (!correctValue) {
        feedbackList.push(`${fullNames[param]}: Incorrect value.`);
      } else {
        feedbackList.push(`${fullNames[param]}: Incorrect unit (expected unit is "${unit}").`);
      }
    }
  });

  const feedbackBox = document.getElementById('quiz-feedback-box');
  if (allCorrect) {
    feedbackBox.innerText = 'Excellent! All answers and units are correct.';
    feedbackBox.className = 'quiz-feedback correct';
  } else {
    feedbackBox.innerHTML = 'Some answers are incorrect. Check details below:<br>' + feedbackList.join('<br>');
    feedbackBox.className = 'quiz-feedback incorrect';
  }
}

function showWorking(param, segNum) {
  const modal = document.getElementById('working-modal');
  const title = document.getElementById('modal-title');
  const body = document.getElementById('modal-body');

  title.innerText = `Working for: ${fullNames[param]}`;
  body.innerHTML = '';

  let htmlContent = '';

  if (segNum === 1) {
    const v0 = testParams.v0;
    const v1 = testParams.v1;
    const t1 = testParams.t1;
    const a1 = testParams.a1;
    const s1 = testParams.s1;

    if (param === 'a1') {
      htmlContent = `
        <div class="working-step">
          <div class="working-title">Step 1: Formula for Acceleration</div>
          <div>According to O-Level Syllabus 6091, the acceleration is the <strong>gradient of the velocity-time graph</strong>.</div>
          <div class="formula">a₁ = gradient = rise / run = (v₁ - v₀) / t₁</div>
        </div>
        <div class="working-step">
          <div class="working-title">Step 2: Substitute values</div>
          <div>Substitute the initial velocity (v₀ = ${v0} m/s), final velocity for segment (v₁ = ${v1} m/s), and time duration (t₁ = ${t1} s):</div>
          <div class="formula">a₁ = (${v1} - ${v0}) / ${t1}</div>
        </div>
        <div class="working-step">
          <div class="working-title">Step 3: Calculate final answer</div>
          <div class="formula">a₁ = ${(v1 - v0).toFixed(2)} / ${t1} = ${a1.toFixed(2)} m/s²</div>
        </div>
      `;
    } else if (param === 's1') {
      const shape = getShapeName(v0, v1);
      htmlContent = `
        <div class="working-step">
          <div class="working-title">Step 1: Formula for Displacement</div>
          <div>According to O-Level Syllabus 6091, the displacement is the <strong>area under the velocity-time graph</strong>.</div>
          <div>For Segment 1, the shape formed under the graph is a <strong>${shape}</strong>.</div>
          <div class="formula">${getAreaFormula(v0, v1, 't₁')}</div>
        </div>
        <div class="working-step">
          <div class="working-title">Step 2: Substitute values</div>
          <div>Substitute the height(s) and base duration (t₁ = ${t1} s):</div>
          <div class="formula">${getAreaSubstitution(v0, v1, t1)}</div>
        </div>
        <div class="working-step">
          <div class="working-title">Step 3: Calculate final answer</div>
          <div class="formula">s₁ = ${s1.toFixed(2)} m</div>
        </div>
      `;
    } else if (param === 'v0') {
      htmlContent = `
        <div class="working-step">
          <div class="working-title">Using Acceleration (Gradient) to find v₀</div>
          <div>Acceleration (a₁) is the gradient of the graph:</div>
          <div class="formula">a₁ = (v₁ - v₀) / t₁</div>
          <div>Rearranging for v₀:</div>
          <div class="formula">v₀ = v₁ - (a₁ &times; t₁)</div>
          <div>Substituting values:</div>
          <div class="formula">v₀ = ${v1} - (${a1.toFixed(2)} &times; ${t1}) = ${v0.toFixed(1)} m/s</div>
        </div>
        <div class="working-step">
          <div class="working-title">Alternative: Using Displacement (Area under graph) to find v₀</div>
          <div>Displacement (s₁) is the area under the graph (trapezium/triangle):</div>
          <div class="formula">s₁ = ½ &times; (v₀ + v₁) &times; t₁</div>
          <div>Rearranging for v₀:</div>
          <div class="formula">v₀ = (2 &times; s₁ / t₁) - v₁</div>
          <div>Substituting values:</div>
          <div class="formula">v₀ = (2 &times; ${s1.toFixed(2)} / ${t1}) - ${v1} = ${v0.toFixed(1)} m/s</div>
        </div>
      `;
    } else if (param === 'v1') {
      htmlContent = `
        <div class="working-step">
          <div class="working-title">Using Acceleration (Gradient) to find v₁</div>
          <div>Acceleration (a₁) is the gradient of the graph:</div>
          <div class="formula">a₁ = (v₁ - v₀) / t₁</div>
          <div>Rearranging for v₁:</div>
          <div class="formula">v₁ = v₀ + (a₁ &times; t₁)</div>
          <div>Substituting values:</div>
          <div class="formula">v₁ = ${v0} + (${a1.toFixed(2)} &times; ${t1}) = ${v1.toFixed(1)} m/s</div>
        </div>
        <div class="working-step">
          <div class="working-title">Alternative: Using Displacement (Area under graph) to find v₁</div>
          <div>Displacement (s₁) is the area under the graph (trapezium/triangle):</div>
          <div class="formula">s₁ = ½ &times; (v₀ + v₁) &times; t₁</div>
          <div>Rearranging for v₁:</div>
          <div class="formula">v₁ = (2 &times; s₁ / t₁) - v₀</div>
          <div>Substituting values:</div>
          <div class="formula">v₁ = (2 &times; ${s1.toFixed(2)} / ${t1}) - ${v0} = ${v1.toFixed(1)} m/s</div>
        </div>
      `;
    } else if (param === 't1') {
      htmlContent = `
        <div class="working-step">
          <div class="working-title">Using Acceleration (Gradient) to find t₁</div>
          <div>Acceleration (a₁) is the gradient of the graph:</div>
          <div class="formula">a₁ = (v₁ - v₀) / t₁</div>
          <div>Rearranging for t₁:</div>
          <div class="formula">t₁ = (v₁ - v₀) / a₁</div>
          <div>Substituting values:</div>
          <div class="formula">t₁ = (${v1} - ${v0}) / ${a1.toFixed(2)} = ${t1} s</div>
        </div>
        <div class="working-step">
          <div class="working-title">Alternative: Using Displacement (Area under graph) to find t₁</div>
          <div>Displacement (s₁) is the area under the graph (trapezium/triangle):</div>
          <div class="formula">s₁ = ½ &times; (v₀ + v₁) &times; t₁</div>
          <div>Rearranging for t₁:</div>
          <div class="formula">t₁ = 2 &times; s₁ / (v₀ + v₁)</div>
          <div>Substituting values:</div>
          <div class="formula">t₁ = 2 &times; ${s1.toFixed(2)} / (${v0} + ${v1}) = ${t1} s</div>
        </div>
      `;
    }
  } else {
    // Segment 2
    const v1 = testParams.v1;
    const v2 = testParams.v2;
    const t1 = testParams.t1;
    const t2 = testParams.t2;
    const dt = t2 - t1;
    const a2 = testParams.a2;
    const s2 = testParams.s2;

    if (param === 'a2') {
      htmlContent = `
        <div class="working-step purple">
          <div class="working-title">Step 1: Formula for Acceleration</div>
          <div>The acceleration is the <strong>gradient of the velocity-time graph</strong>.</div>
          <div class="formula">a₂ = gradient = (v₂ - v₁) / (t₂ - t₁)</div>
        </div>
        <div class="working-step purple">
          <div class="working-title">Step 2: Substitute values</div>
          <div>Substitute initial velocity for segment (v₁ = ${v1} m/s), final velocity (v₂ = ${v2} m/s), and duration (t₂ - t₁ = ${t2} - ${t1} = ${dt} s):</div>
          <div class="formula">a₂ = (${v2} - ${v1}) / ${dt}</div>
        </div>
        <div class="working-step purple">
          <div class="working-title">Step 3: Calculate final answer</div>
          <div class="formula">a₂ = ${(v2 - v1).toFixed(2)} / ${dt} = ${a2.toFixed(2)} m/s²</div>
        </div>
      `;
    } else if (param === 's2') {
      const shape = getShapeName(v1, v2);
      htmlContent = `
        <div class="working-step purple">
          <div class="working-title">Step 1: Formula for Displacement</div>
          <div>Displacement is the <strong>area under the velocity-time graph</strong>.</div>
          <div>For Segment 2, the shape formed under the graph is a <strong>${shape}</strong>.</div>
          <div class="formula">${getAreaFormula(v1, v2, '(t₂ - t₁)')}</div>
        </div>
        <div class="working-step purple">
          <div class="working-title">Step 2: Substitute values</div>
          <div>Substitute the height(s) and base duration (t₂ - t₁ = ${dt} s):</div>
          <div class="formula">${getAreaSubstitution(v1, v2, dt)}</div>
        </div>
        <div class="working-step purple">
          <div class="working-title">Step 3: Calculate final answer</div>
          <div class="formula">s₂ = ${s2.toFixed(2)} m</div>
        </div>
      `;
    } else if (param === 'v1') {
      htmlContent = `
        <div class="working-step purple">
          <div class="working-title">Using Acceleration (Gradient) to find v₁</div>
          <div>Acceleration (a₂) is the gradient of the graph:</div>
          <div class="formula">a₂ = (v₂ - v₁) / (t₂ - t₁)</div>
          <div>Rearranging for v₁:</div>
          <div class="formula">v₁ = v₂ - a₂ &times; (t₂ - t₁)</div>
          <div>Substituting values:</div>
          <div class="formula">v₁ = ${v2} - (${a2.toFixed(2)} &times; ${dt}) = ${v1.toFixed(1)} m/s</div>
        </div>
        <div class="working-step purple">
          <div class="working-title">Alternative: Using Displacement (Area under graph) to find v₁</div>
          <div>Displacement (s₂) is the area under the graph:</div>
          <div class="formula">s₂ = ½ &times; (v₁ + v₂) &times; (t₂ - t₁)</div>
          <div>Rearranging for v₁:</div>
          <div class="formula">v₁ = [2 &times; s₂ / (t₂ - t₁)] - v₂</div>
          <div>Substituting values:</div>
          <div class="formula">v₁ = [2 &times; ${s2.toFixed(2)} / ${dt}] - ${v2} = ${v1.toFixed(1)} m/s</div>
        </div>
      `;
    } else if (param === 'v2') {
      htmlContent = `
        <div class="working-step purple">
          <div class="working-title">Using Acceleration (Gradient) to find v₂</div>
          <div>Acceleration (a₂) is the gradient of the graph:</div>
          <div class="formula">a₂ = (v₂ - v₁) / (t₂ - t₁)</div>
          <div>Rearranging for v₂:</div>
          <div class="formula">v₂ = v₁ + a₂ &times; (t₂ - t₁)</div>
          <div>Substituting values:</div>
          <div class="formula">v₂ = ${v1} + (${a2.toFixed(2)} &times; ${dt}) = ${v2.toFixed(1)} m/s</div>
        </div>
        <div class="working-step purple">
          <div class="working-title">Alternative: Using Displacement (Area under graph) to find v₂</div>
          <div>Displacement (s₂) is the area under the graph:</div>
          <div class="formula">s₂ = ½ &times; (v₁ + v₂) &times; (t₂ - t₁)</div>
          <div>Rearranging for v₂:</div>
          <div class="formula">v₂ = [2 &times; s₂ / (t₂ - t₁)] - v₁</div>
          <div>Substituting values:</div>
          <div class="formula">v₂ = [2 &times; ${s2.toFixed(2)} / ${dt}] - ${v1} = ${v2.toFixed(1)} m/s</div>
        </div>
      `;
    } else if (param === 't1') {
      htmlContent = `
        <div class="working-step purple">
          <div class="working-title">Using Acceleration (Gradient) to find t₁</div>
          <div>Acceleration (a₂) is the gradient of the graph:</div>
          <div class="formula">a₂ = (v₂ - v₁) / (t₂ - t₁)</div>
          <div>Rearranging for (t₂ - t₁):</div>
          <div class="formula">(t₂ - t₁) = (v₂ - v₁) / a₂</div>
          <div>Subtracting from t₂ to get t₁:</div>
          <div class="formula">t₁ = t₂ - [(v₂ - v₁) / a₂]</div>
          <div>Substituting values:</div>
          <div class="formula">t₁ = ${t2} - [(${v2} - ${v1}) / ${a2.toFixed(2)}] = ${t1} s</div>
        </div>
      `;
    }
  }

  body.innerHTML = htmlContent;
  modal.classList.add('active');
}

function getShapeName(valStart, valEnd) {
  if (valStart === 0 || valEnd === 0) return 'Triangle';
  if (valStart === valEnd) return 'Rectangle';
  return 'Trapezium';
}

function getAreaFormula(valStart, valEnd, baseName) {
  if (valStart === 0 || valEnd === 0) {
    return `Area = ½ × base × height`;
  }
  if (valStart === valEnd) {
    return `Area = base × height`;
  }
  return `Area = ½ × (sum of parallel sides) × height`;
}

function getAreaSubstitution(valStart, valEnd, dt) {
  if (valStart === 0) {
    return `Displacement = ½ × ${dt} × ${valEnd}`;
  }
  if (valEnd === 0) {
    return `Displacement = ½ × ${dt} × ${valStart}`;
  }
  if (valStart === valEnd) {
    return `Displacement = ${dt} × ${valStart}`;
  }
  return `Displacement = ½ × (${valStart} + ${valEnd}) × ${dt}`;
}

function closeModal() {
  const modal = document.getElementById('working-modal');
  modal.classList.remove('active');
}
