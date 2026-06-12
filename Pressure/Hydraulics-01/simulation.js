// Simulation State
export const simState = {
  f1: 50,      // Input Force (N)
  a1: 0.002,   // Input Area (m^2)
  a2: 0.020,   // Output Area (m^2)
  pressure: 25000, // Pa
  f2: 500,     // Output Force (N)
  mechAdvantage: 10,
  animationTime: 0,
};

// SVG Elements
let svg, fluidChamber, inputPiston, inputShaft, outputPiston, outputShaft;
let labelF1Arrow, labelF2Arrow, textA1, textA2;

// DOM Elements
let bubbleF1, bubbleA1, bubbleA2;
let valPressure, valF2, valMulti, warningLabel;

export function initSimulation() {
  // Bind DOM elements
  svg = document.getElementById('press-svg');
  fluidChamber = document.getElementById('fluid-chamber');
  inputPiston = document.getElementById('input-piston');
  inputShaft = document.getElementById('input-shaft');
  outputPiston = document.getElementById('output-piston');
  outputShaft = document.getElementById('output-shaft');
  labelF1Arrow = document.getElementById('label-f1-arrow');
  labelF2Arrow = document.getElementById('label-f2-arrow');
  textA1 = document.getElementById('text-a1');
  textA2 = document.getElementById('text-a2');

  bubbleF1 = document.getElementById('bubble-f1');
  bubbleA1 = document.getElementById('bubble-a1');
  bubbleA2 = document.getElementById('bubble-a2');

  valPressure = document.getElementById('val-pressure');
  valF2 = document.getElementById('val-f2');
  valMulti = document.getElementById('val-multi');
  warningLabel = document.getElementById('warning-label');

  // Input events
  const inputF1 = document.getElementById('input-f1');
  const inputA1 = document.getElementById('input-a1');
  const inputA2 = document.getElementById('input-a2');

  const updateFromSliders = () => {
    simState.f1 = parseFloat(inputF1.value);
    simState.a1 = parseFloat(inputA1.value);
    simState.a2 = parseFloat(inputA2.value);
    calculatePhysics();
    updateUI();
  };

  inputF1.addEventListener('input', updateFromSliders);
  inputA1.addEventListener('input', updateFromSliders);
  inputA2.addEventListener('input', updateFromSliders);

  // Scenario Buttons
  document.querySelectorAll('[data-scenario]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const scenario = e.currentTarget.getAttribute('data-scenario');
      
      // Remove active from all shortcut buttons
      document.querySelectorAll('[data-scenario]').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');

      if (scenario === 'brake') {
        inputF1.value = 50;
        inputA1.value = 0.002;
        inputA2.value = 0.020;
      } else if (scenario === 'lift') {
        inputF1.value = 200;
        inputA1.value = 0.005;
        inputA2.value = 0.200;
      } else if (scenario === 'dentist') {
        inputF1.value = 80;
        inputA1.value = 0.003;
        inputA2.value = 0.060;
      }
      updateFromSliders();
    });
  });

  // Start animation loop
  requestAnimationFrame(animationLoop);

  // Initial calculation
  calculatePhysics();
  updateUI();
}

function calculatePhysics() {
  // P = F1 / A1
  simState.pressure = simState.f1 / simState.a1;
  // F2 = P * A2
  simState.f2 = simState.pressure * simState.a2;
  // MA = F2 / F1
  simState.mechAdvantage = simState.f2 / simState.f1;
}

function updateUI() {
  // Update bubbles
  bubbleF1.textContent = `${simState.f1} N`;
  bubbleA1.textContent = `${simState.a1.toFixed(3)} m²`;
  bubbleA2.textContent = `${simState.a2.toFixed(3)} m²`;

  // Update readouts
  valPressure.textContent = `${simState.pressure.toLocaleString(undefined, {maximumFractionDigits: 1})} Pa`;
  valF2.textContent = `${simState.f2.toLocaleString(undefined, {maximumFractionDigits: 1})} N`;
  
  if (simState.mechAdvantage >= 1) {
    valMulti.textContent = `× ${simState.mechAdvantage.toFixed(2)}`;
  } else {
    valMulti.textContent = `× ${simState.mechAdvantage.toFixed(2)}`;
  }

  // Handle Warning
  if (simState.a1 > simState.a2) {
    warningLabel.classList.remove('hidden');
  } else {
    warningLabel.classList.add('hidden');
  }
}

// Animation cycle
function animationLoop(timestamp) {
  simState.animationTime += 0.015;

  // Let the left piston cycle down and up
  // Stroke is a value between 0 and 1
  // We use a smooth sine wave that pauses at the peak extension
  const cycle = (Math.sin(simState.animationTime) + 1) / 2; // 0 to 1
  
  // Left piston stroke max depth = 45px
  const leftStroke = cycle * 45;
  const y1 = 60 + leftStroke;

  // Right piston stroke = leftStroke * (A1 / A2)
  // Ensure it scales correctly with Area ratio
  const areaRatio = simState.a1 / simState.a2;
  const rightStroke = leftStroke * areaRatio;
  const y2 = 105 - rightStroke; // Starts lower down, rises up

  // Map widths of cylinders based on areas
  // A1 goes from 0.001 to 0.050 -> width 14 to 54
  const w1 = 14 + (simState.a1 - 0.001) * (40 / 0.049);
  // A2 goes from 0.010 to 0.500 -> width 24 to 114
  const w2 = 24 + (simState.a2 - 0.010) * (90 / 0.490);

  const leftCenter = 80;
  const rightCenter = 280;

  // Update SVG elements positions and sizes
  if (inputPiston && outputPiston) {
    // Left Piston
    inputPiston.setAttribute('x', leftCenter - w1/2);
    inputPiston.setAttribute('y', y1);
    inputPiston.setAttribute('width', w1);

    inputShaft.setAttribute('x1', leftCenter);
    inputShaft.setAttribute('y1', 10);
    inputShaft.setAttribute('x2', leftCenter);
    inputShaft.setAttribute('y2', y1);

    labelF1Arrow.setAttribute('x', leftCenter);
    // Draw left arrow
    const leftArrow = document.querySelector('#input-piston-group path');
    if (leftArrow) {
      leftArrow.setAttribute('d', `M ${leftCenter},22 L ${leftCenter},${y1 - 5} M ${leftCenter - 4},${y1 - 10} L ${leftCenter},${y1 - 5} L ${leftCenter + 4},${y1 - 10}`);
    }
    textA1.setAttribute('x', leftCenter);
    textA1.setAttribute('y', y1 + 25);
    textA1.textContent = `${simState.a1.toFixed(3)} m²`;

    // Right Piston
    outputPiston.setAttribute('x', rightCenter - w2/2);
    outputPiston.setAttribute('y', y2);
    outputPiston.setAttribute('width', w2);

    outputShaft.setAttribute('x1', rightCenter);
    outputShaft.setAttribute('y1', 10);
    outputShaft.setAttribute('x2', rightCenter);
    outputShaft.setAttribute('y2', y2);

    labelF2Arrow.setAttribute('x', rightCenter);
    
    // Output force arrow: goes upwards
    const rightArrow = document.querySelector('#output-piston-group path');
    if (rightArrow) {
      // Dynamic height arrow reflecting F2 size
      const arrowLength = Math.min(30, 10 + (simState.f2 / 500) * 15);
      rightArrow.setAttribute('d', `M ${rightCenter},${y2 - 5} L ${rightCenter},${y2 - 5 - arrowLength} M ${rightCenter - 4},${y2 - arrowLength} L ${rightCenter},${y2 - 5 - arrowLength} L ${rightCenter + 4},${y2 - arrowLength}`);
    }
    textA2.setAttribute('x', rightCenter);
    textA2.setAttribute('y', y2 + 25);
    textA2.textContent = `${simState.a2.toFixed(3)} m²`;

    // Fluid path drawing
    // Chamber bounds
    const leftOuter = leftCenter - w1/2;
    const leftInner = leftCenter + w1/2;
    const rightInner = rightCenter - w2/2;
    const rightOuter = rightCenter + w2/2;
    const bottomY = 215;
    const innerBottomY = 175;

    // Draw U-chamber path containing the fluid
    const pathD = `
      M ${leftOuter},${y1 + 14}
      L ${leftOuter},${bottomY - 15}
      Q ${leftOuter},${bottomY} ${leftOuter + 15},${bottomY}
      L ${rightOuter - 15},${bottomY}
      Q ${rightOuter},${bottomY} ${rightOuter},${bottomY - 15}
      L ${rightOuter},${y2 + 14}
      L ${rightInner},${y2 + 14}
      L ${rightInner},${innerBottomY + 15}
      Q ${rightInner},${innerBottomY} ${rightInner - 15},${innerBottomY}
      L ${leftInner + 15},${innerBottomY}
      Q ${leftInner},${innerBottomY} ${leftInner},${innerBottomY + 15}
      L ${leftInner},${y1 + 14}
      Z
    `.replace(/\s+/g, ' ').trim();

    fluidChamber.setAttribute('d', pathD);
  }

  requestAnimationFrame(animationLoop);
}
