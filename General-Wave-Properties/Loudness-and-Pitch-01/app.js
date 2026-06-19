document.addEventListener('DOMContentLoaded', () => {
  // --- Navigation & Section Management ---
  const navTabs = document.querySelectorAll('.nav-tab');
  const sections = document.querySelectorAll('.app-section');
  const nextBtns = document.querySelectorAll('.next-section-btn');
  const prevBtns = document.querySelectorAll('.prev-section-btn');

  function switchSection(sectionId) {
    sections.forEach(sec => {
      sec.classList.remove('active');
      if (sec.id === sectionId) {
        sec.classList.add('active');
      }
    });

    navTabs.forEach(tab => {
      tab.classList.remove('active');
      if (tab.dataset.section === sectionId) {
        tab.classList.add('active');
      }
    });

    // Handle initialisations specific to sections
    if (sectionId === 'section1') {
      startIntroWaves();
    } else {
      stopIntroWaves();
    }

    if (sectionId === 'section2') {
      startOscilloscope();
    } else {
      stopOscilloscope();
    }

    if (sectionId === 'section3') {
      initMatchingGame();
    }

    if (sectionId === 'section4') {
      initFlashcards();
    }

    // Scroll to top of section
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      switchSection(tab.dataset.section);
    });
  });

  nextBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      switchSection(btn.dataset.next);
    });
  });

  prevBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      switchSection(btn.dataset.prev);
    });
  });

  // --- Animation Helpers & Wave Painters ---
  function drawWave(ctx, width, height, amplitude, frequency, offset, color = '#2dd4bf', lineWidth = 3.5) {
    ctx.clearRect(0, 0, width, height);
    
    // Draw central axis line
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(34, 47, 84, 0.5)';
    ctx.lineWidth = 1;
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    for (let x = 0; x < width; x++) {
      // Calculate y using sine wave function
      const y = height / 2 + Math.sin((x / width) * Math.PI * 2 * frequency + offset) * amplitude;
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  }

  // --- SECTION 1: Intro Waveforms Animation ---
  let introAnimId = null;
  let introOffset = 0;
  const introCanvases = {
    loud: { el: document.getElementById('introWaveLoud'), amp: 38, freq: 2, col: '#3b82f6' },
    soft: { el: document.getElementById('introWaveSoft'), amp: 12, freq: 2, col: '#94a3b8' },
    high: { el: document.getElementById('introWaveHigh'), amp: 25, freq: 5, col: '#2dd4bf' },
    low: { el: document.getElementById('introWaveLow'), amp: 25, freq: 1.2, col: '#a855f7' }
  };

  function animateIntro() {
    introOffset += 0.05;
    Object.keys(introCanvases).forEach(key => {
      const item = introCanvases[key];
      if (item.el) {
        if (item.el.width !== item.el.clientWidth || item.el.height !== item.el.clientHeight) {
          item.el.width = item.el.clientWidth;
          item.el.height = item.el.clientHeight;
        }
        const ctx = item.el.getContext('2d');
        drawWave(ctx, item.el.width, item.el.height, item.amp, item.freq, introOffset, item.col, 2.5);
      }
    });
    introAnimId = requestAnimationFrame(animateIntro);
  }

  function startIntroWaves() {
    if (!introAnimId) {
      animateIntro();
    }
  }

  function stopIntroWaves() {
    if (introAnimId) {
      cancelAnimationFrame(introAnimId);
      introAnimId = null;
    }
  }

  // --- SECTION 2: Visual Oscilloscope ---
  const scopeCanvas = document.getElementById('oscilloscopeCanvas');
  const amplitudeSlider = document.getElementById('amplitudeSlider');
  const frequencySlider = document.getElementById('frequencySlider');
  const amplitudeVal = document.getElementById('amplitudeVal');
  const frequencyVal = document.getElementById('frequencyVal');
  const readoutLoudness = document.getElementById('readoutLoudness');
  const readoutPitch = document.getElementById('readoutPitch');
  const scopeSummaryText = document.getElementById('scopeSummaryText');

  let scopeAnimId = null;
  let scopeOffset = 0;

  function resizeScopeCanvas() {
    if (scopeCanvas) {
      const rect = scopeCanvas.parentElement.getBoundingClientRect();
      scopeCanvas.width = rect.width;
      scopeCanvas.height = rect.height;
    }
  }

  window.addEventListener('resize', resizeScopeCanvas);

  function startOscilloscope() {
    resizeScopeCanvas();
    if (!scopeAnimId) {
      animateOscilloscope();
    }
  }

  function stopOscilloscope() {
    if (scopeAnimId) {
      cancelAnimationFrame(scopeAnimId);
      scopeAnimId = null;
    }
  }

  function updateScopeReadouts() {
    const amp = parseInt(amplitudeSlider.value);
    const freq = parseFloat(frequencySlider.value);

    // Update Slider Label values
    amplitudeVal.textContent = `${Math.round((amp / 80) * 100)}%`;
    frequencyVal.textContent = `${freq.toFixed(1)} Hz`;

    // Dynamic descriptive texts
    let loudText = "Moderate";
    let loudClass = "text-primary";
    if (amp < 25) { loudText = "Soft (Quiet)"; }
    else if (amp > 55) { loudText = "Loud (Intense)"; }

    let pitchText = "Medium";
    if (freq < 1.5) { pitchText = "Low Pitch (Bass)"; }
    else if (freq > 3.5) { pitchText = "High Pitch (Treble)"; }

    readoutLoudness.textContent = loudText;
    readoutPitch.textContent = pitchText;

    scopeSummaryText.textContent = `Waveform state: A ${loudText.toLowerCase()} sound with a ${pitchText.toLowerCase()} frequency. Amplitude: ${amp}px, Cycles on screen: ~${(freq * 3).toFixed(1)}.`;
  }

  if (amplitudeSlider && frequencySlider) {
    amplitudeSlider.addEventListener('input', updateScopeReadouts);
    frequencySlider.addEventListener('input', updateScopeReadouts);
  }

  function animateOscilloscope() {
    if (scopeCanvas) {
      const ctx = scopeCanvas.getContext('2d');
      const amp = parseInt(amplitudeSlider.value);
      const freq = parseFloat(frequencySlider.value);
      
      scopeOffset += freq * 0.03; // Speed scales with frequency for realistic motion
      
      // Draw gridlines behind
      drawWave(ctx, scopeCanvas.width, scopeCanvas.height, amp, freq * 3, scopeOffset, '#2dd4bf', 3.5);
    }
    scopeAnimId = requestAnimationFrame(animateOscilloscope);
  }

  // --- SECTION 3: Drag & Drop Waveform Matching Game ---
  const descriptions = [
    { id: 'loud-low', label: 'Loud and low-pitched', amp: 38, freq: 1.2, color: '#3b82f6' },
    { id: 'soft-high', label: 'Soft and high-pitched', amp: 12, freq: 4.5, color: '#2dd4bf' },
    { id: 'loud-high', label: 'Loud and high-pitched', amp: 38, freq: 4.5, color: '#a855f7' },
    { id: 'soft-low', label: 'Soft and low-pitched', amp: 12, freq: 1.2, color: '#94a3b8' }
  ];

  let gameMatches = {}; // key: dropzoneId, value: cardId
  let selectedDraggableCard = null; // Touch/Click fallback select state

  function initMatchingGame() {
    const draggablesContainer = document.getElementById('draggablesContainer');
    const targetsGrid = document.getElementById('targetsGrid');
    const banner = document.getElementById('gameFeedbackBanner');
    
    draggablesContainer.innerHTML = '';
    targetsGrid.innerHTML = '';
    banner.textContent = '';
    banner.className = 'game-feedback-banner';
    gameMatches = {};
    selectedDraggableCard = null;

    // 1. Render shuffled draggable cards
    const shuffledDescs = [...descriptions].sort(() => Math.random() - 0.5);
    shuffledDescs.forEach(desc => {
      const card = document.createElement('div');
      card.className = 'draggable-card';
      card.draggable = true;
      card.id = `card-${desc.id}`;
      card.dataset.descId = desc.id;
      card.innerHTML = `☰ ${desc.label}`;
      
      // Drag events
      card.addEventListener('dragstart', dragStart);
      card.addEventListener('dragend', dragEnd);
      
      // Mobile tap fallback
      card.addEventListener('click', () => {
        if (selectedDraggableCard) {
          selectedDraggableCard.classList.remove('selected-active');
        }
        if (selectedDraggableCard === card) {
          selectedDraggableCard = null;
        } else {
          selectedDraggableCard = card;
          card.classList.add('selected-active');
        }
      });

      draggablesContainer.appendChild(card);
    });

    // 2. Render target dropzones (shuffled waveform locations)
    const shuffledTargets = [...descriptions].sort(() => Math.random() - 0.5);
    shuffledTargets.forEach((desc, idx) => {
      const dropzone = document.createElement('div');
      dropzone.className = 'target-dropzone';
      dropzone.id = `zone-${desc.id}`;
      dropzone.dataset.correctId = desc.id;

      // Header label to identify slots visually (A, B, C, D)
      const title = document.createElement('span');
      title.className = 'badge';
      title.textContent = `Waveform ${String.fromCharCode(65 + idx)}`;
      dropzone.appendChild(title);

      // Canvas for drawing target wave
      const canvasWrapper = document.createElement('div');
      canvasWrapper.className = 'target-wave-wrapper';
      const canvas = document.createElement('canvas');
      canvas.width = 250;
      canvas.height = 100;
      canvasWrapper.appendChild(canvas);
      dropzone.appendChild(canvasWrapper);

      // Slot for dropped card
      const slot = document.createElement('div');
      slot.className = 'dropzone-slot';
      slot.id = `slot-${desc.id}`;
      slot.textContent = 'Drop description card here';
      dropzone.appendChild(slot);

      // Drop handlers
      dropzone.addEventListener('dragover', dragOver);
      dropzone.addEventListener('dragleave', dragLeave);
      dropzone.addEventListener('drop', dropCard);

      // Touch tap-to-slot handlers
      dropzone.addEventListener('click', () => {
        if (selectedDraggableCard) {
          placeCardInSlot(selectedDraggableCard, slot, dropzone.id);
          selectedDraggableCard.classList.remove('selected-active');
          selectedDraggableCard = null;
        }
      });

      targetsGrid.appendChild(dropzone);

      // Draw the static representation wave
      setTimeout(() => {
        const ctx = canvas.getContext('2d');
        drawWave(ctx, canvas.width, canvas.height, desc.amp, desc.freq, 0, desc.color, 2.5);
      }, 50);
    });
  }

  // Drag & Drop Handler Functions
  function dragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.id);
    e.target.classList.add('dragging');
  }

  function dragEnd(e) {
    e.target.classList.remove('dragging');
  }

  function dragOver(e) {
    e.preventDefault();
    this.classList.add('drag-over');
  }

  function dragLeave() {
    this.classList.remove('drag-over');
  }

  function dropCard(e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    
    const cardId = e.dataTransfer.getData('text/plain');
    const card = document.getElementById(cardId);
    const slot = this.querySelector('.dropzone-slot');
    
    placeCardInSlot(card, slot, this.id);
  }

  function placeCardInSlot(card, slot, zoneId) {
    if (!card || !slot) return;
    
    // Check if slot already has a card
    const existingCardId = gameMatches[zoneId];
    if (existingCardId) {
      // Return previous card to sandbox container
      const oldCard = document.getElementById(existingCardId);
      if (oldCard) {
        document.getElementById('draggablesContainer').appendChild(oldCard);
        oldCard.classList.remove('hidden');
      }
    }

    // Place new card
    slot.innerHTML = '';
    slot.appendChild(card);
    slot.classList.add('has-card');
    
    // Clean animations
    slot.classList.remove('correct-glow', 'incorrect-shake');
    
    // Track mapping
    gameMatches[zoneId] = card.id;
  }

  // Validate Matches
  document.getElementById('checkGameBtn').addEventListener('click', () => {
    let allPlaced = true;
    let correctCount = 0;
    const targets = document.querySelectorAll('.target-dropzone');
    const banner = document.getElementById('gameFeedbackBanner');

    targets.forEach(zone => {
      const slot = zone.querySelector('.dropzone-slot');
      const matchedCardId = gameMatches[zone.id];

      if (!matchedCardId) {
        allPlaced = false;
        slot.classList.add('incorrect-shake');
        setTimeout(() => slot.classList.remove('incorrect-shake'), 600);
        return;
      }

      const card = document.getElementById(matchedCardId);
      const isCorrect = zone.dataset.correctId === card.dataset.descId;

      slot.classList.remove('correct-glow', 'incorrect-shake');

      if (isCorrect) {
        correctCount++;
        slot.classList.add('correct-glow');
      } else {
        slot.classList.add('incorrect-shake');
        setTimeout(() => {
          // Bounce back to sandbox if wrong (purely neutral grey shake feedback)
          slot.classList.remove('incorrect-shake', 'has-card');
          slot.textContent = 'Drop description card here';
          document.getElementById('draggablesContainer').appendChild(card);
          delete gameMatches[zone.id];
        }, 800);
      }
    });

    if (!allPlaced) {
      banner.textContent = '⚠️ Match all description cards before checking!';
      banner.className = 'game-feedback-banner';
    } else if (correctCount === descriptions.length) {
      banner.textContent = '✨ Excellent Job! All waveforms matched perfectly.';
      banner.className = 'game-feedback-banner success';
    } else {
      banner.textContent = '❌ Some matches were incorrect and returned to dock. Try again!';
      banner.className = 'game-feedback-banner';
    }
  });

  // Reset Game
  document.getElementById('resetGameBtn').addEventListener('click', initMatchingGame);

  // --- SECTION 4: Swipeable Revision Flashcards ---
  const flashcardsData = [
    {
      term: 'Loudness & Amplitude',
      frontText: 'What is the relationship between Amplitude and Loudness?',
      frontGraphic: { amp: 40, freq: 2, col: '#3b82f6' },
      backText: '<strong>Amplitude</strong> is the maximum displacement of a particle from its rest position. <strong>Loudness</strong> is a subjective sensation of sound strength. The larger the amplitude of the wave, the louder the sound.'
    },
    {
      term: 'Pitch & Frequency',
      frontText: 'What is the relationship between Frequency and Pitch?',
      frontGraphic: { amp: 20, freq: 4.5, col: '#2dd4bf' },
      backText: '<strong>Frequency</strong> is the number of complete wave cycles produced per second (measured in Hertz, Hz). <strong>Pitch</strong> describes how high or low a sound sounds. The higher the frequency, the higher the pitch.'
    },
    {
      term: 'Reading Waveform Diagrams',
      frontText: 'How do you read Amplitude and Frequency from a wave graph?',
      frontGraphic: { amp: 30, freq: 1.5, col: '#a855f7' },
      backText: '<ul><li><strong>Amplitude (a):</strong> Measured vertically from the center line to a peak or trough.</li><li><strong>Period (T):</strong> Horizontal width of one complete wave cycle.</li><li><strong>Frequency (f):</strong> Calculated as 1/T.</li></ul>'
    },
    {
      term: 'Wave Comparison Rule',
      frontText: 'If two sound waves have the same pitch but different loudness, what differs?',
      frontGraphic: null, // text scenario card
      backText: 'They have the <strong>same frequency</strong> (same horizontal spacing of cycles) but <strong>different amplitudes</strong> (peaks/troughs have different vertical heights).'
    }
  ];

  let currentCardIndex = 0;
  const cardElement = document.getElementById('flashcard');
  const cardContainer = document.getElementById('flashcardContainer');

  function initFlashcards() {
    currentCardIndex = 0;
    renderFlashcard();
  }

  function renderFlashcard() {
    const data = flashcardsData[currentCardIndex];
    const frontContent = cardElement.querySelector('.flashcard-front .card-content');
    const backContent = cardElement.querySelector('.flashcard-back .card-content');

    // Reset card orientation
    cardElement.classList.remove('flipped');

    // Load front content
    let graphicHTML = '';
    if (data.frontGraphic) {
      graphicHTML = `<div class="card-graphic"><canvas id="flashcardWaveCanvas"></canvas></div>`;
    }
    
    frontContent.innerHTML = `
      <span class="badge">${data.term}</span>
      <p class="flashcard-question">${data.frontText}</p>
      ${graphicHTML}
    `;

    // Load back content
    backContent.innerHTML = `
      <span class="badge">Explanation</span>
      <p class="flashcard-explanation">${data.backText}</p>
    `;

    // Update Counter Labels
    document.getElementById('currentCardIndex').textContent = currentCardIndex + 1;
    document.getElementById('totalCardsCount').textContent = flashcardsData.length;

    // Draw wave if graphic exists
    if (data.frontGraphic) {
      setTimeout(() => {
        const cv = document.getElementById('flashcardWaveCanvas');
        if (cv) {
          const ctx = cv.getContext('2d');
          drawWave(ctx, cv.width, cv.height, data.frontGraphic.amp, data.frontGraphic.freq, 0, data.frontGraphic.col, 2.5);
        }
      }, 50);
    }
  }

  // Flip Actions
  cardContainer.addEventListener('click', () => {
    cardElement.classList.toggle('flipped');
  });

  // Swipe Gestures
  let touchStartX = 0;
  let touchEndX = 0;

  cardContainer.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  cardContainer.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const swipeThreshold = 50;
    if (touchStartX - touchEndX > swipeThreshold) {
      // Swiped Left - Next
      navigateCard(1);
    } else if (touchEndX - touchStartX > swipeThreshold) {
      // Swiped Right - Prev
      navigateCard(-1);
    }
  }

  function navigateCard(direction) {
    currentCardIndex += direction;
    if (currentCardIndex < 0) {
      currentCardIndex = flashcardsData.length - 1;
    } else if (currentCardIndex >= flashcardsData.length) {
      currentCardIndex = 0;
    }
    renderFlashcard();
  }

  document.getElementById('prevCardBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    navigateCard(-1);
  });

  document.getElementById('nextCardBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    navigateCard(1);
  });

  document.getElementById('shuffleCardsBtn').addEventListener('click', () => {
    flashcardsData.sort(() => Math.random() - 0.5);
    currentCardIndex = 0;
    renderFlashcard();
  });


  // --- SECTION 5 & 6: QUIZ & FEEDBACK ---
  // Comprehensive pool of 30 randomized physics questions
  const quizPool = [
    {
      type: 'mcq',
      category: 'loudness',
      question: 'The loudness of a sound is directly related to which waveform property?',
      options: ['Amplitude', 'Frequency', 'Wave speed', 'Wavelength'],
      answerIndex: 0,
      explanation: 'Loudness is determined by amplitude. A larger amplitude represents a higher amount of sound energy, making it sound louder.'
    },
    {
      type: 'mcq',
      category: 'pitch',
      question: 'The pitch of a sound is directly related to which waveform property?',
      options: ['Frequency', 'Amplitude', 'Speed', 'Medium'],
      answerIndex: 0,
      explanation: 'Pitch describes how high or low a sound is, and is determined by frequency. Higher frequency waves lead to a higher pitch.'
    },
    {
      type: 'mcq',
      category: 'loudness',
      question: 'Which of the following is the standard SI unit for wave frequency?',
      options: ['Hertz (Hz)', 'Decibels (dB)', 'Metres (m)', 'Seconds (s)'],
      answerIndex: 0,
      explanation: 'Frequency is measured in Hertz (Hz), representing the number of complete wave cycles per second.'
    },
    {
      type: 'mcq',
      category: 'loudness',
      question: 'If the amplitude of a sound wave is doubled, what happens to its pitch?',
      options: ['It remains unchanged.', 'It becomes twice as high.', 'It becomes half as high.', 'It becomes louder.'],
      answerIndex: 0,
      explanation: 'Amplitude changes only the loudness. Pitch is determined by frequency, which remains unchanged in this scenario.'
    },
    {
      type: 'mcq',
      category: 'pitch',
      question: 'A violin plays a high-pitched note while a bass drum plays a low-pitched boom. How do their frequencies compare?',
      options: ['The violin wave has a higher frequency.', 'The drum wave has a higher frequency.', 'Their frequencies are identical.', 'Frequency is unrelated to musical pitch.'],
      answerIndex: 0,
      explanation: 'A higher pitch corresponds to a higher frequency. Therefore, the violin note has a higher frequency.'
    },
    {
      type: 'mcq',
      category: 'loudness',
      question: 'If the amplitude of a sound wave increases while its frequency remains constant, the sound becomes:',
      options: ['Louder, pitch unchanged', 'Higher pitched, loudness unchanged', 'Quieter, pitch unchanged', 'Lower pitched, loudness unchanged'],
      answerIndex: 0,
      explanation: 'Increasing amplitude makes the sound louder. Pitch is unaffected since frequency remains constant.'
    },
    {
      type: 'mcq',
      category: 'pitch',
      question: 'If the frequency of a sound wave increases while its amplitude remains constant, the sound becomes:',
      options: ['Higher pitched, loudness unchanged', 'Louder, pitch unchanged', 'Lower pitched, loudness unchanged', 'Quieter, pitch unchanged'],
      answerIndex: 0,
      explanation: 'Increasing frequency raises the pitch. Loudness is unaffected since amplitude remains constant.'
    },
    {
      type: 'mcq',
      category: 'pitch',
      question: 'Which definition describes wave frequency correctly?',
      options: ['The number of complete cycles per second', 'The maximum height of a crest from center line', 'The distance between two consecutive peaks', 'The time taken to complete one wave cycle'],
      answerIndex: 0,
      explanation: 'Frequency is the number of complete wave cycles passing a fixed point per unit time (usually one second).'
    },
    {
      type: 'mcq',
      category: 'loudness',
      question: 'What is the amplitude of a transverse wave diagram representing a sound wave?',
      options: ['The height from the center rest line to a peak', 'The height from a trough to a peak', 'The length of one complete wave cycle', 'The speed of the wave propagation'],
      answerIndex: 0,
      explanation: 'Amplitude is measured vertically from the central rest line to either a peak (crest) or a trough.'
    },
    {
      type: 'mcq',
      category: 'pitch',
      question: 'A sound wave has a period of 0.01 seconds. What is its frequency?',
      options: ['100 Hz', '10 Hz', '0.01 Hz', '1000 Hz'],
      answerIndex: 0,
      explanation: 'Frequency (f) is calculated as 1 / Period (T). Here, f = 1 / 0.01 = 100 Hz.'
    },
    {
      type: 'mcq',
      category: 'loudness',
      question: 'If a waveform graph shows very tall peaks and deep troughs, this sound is:',
      options: ['Loud', 'Soft', 'High-pitched', 'Low-pitched'],
      answerIndex: 0,
      explanation: 'Tall peaks and deep troughs represent a large amplitude, which corresponds to a loud sound.'
    },
    {
      type: 'mcq',
      category: 'pitch',
      question: 'If a waveform graph shows cycles packed closely together, this sound has:',
      options: ['A high frequency and high pitch', 'A low frequency and high pitch', 'A large amplitude and low pitch', 'A small amplitude and low pitch'],
      answerIndex: 0,
      explanation: 'Closely packed cycles mean more cycles fit on screen, representing high frequency and high pitch.'
    },
    {
      type: 'mcq',
      category: 'pitch',
      question: 'An O-Level student notices that wave A completes 5 cycles on screen, while wave B completes 2 cycles on the same screen width. Wave A has:',
      options: ['A higher frequency than wave B', 'A lower frequency than wave B', 'A larger amplitude than wave B', 'The same frequency as wave B'],
      answerIndex: 0,
      explanation: 'More wave cycles in the same time interval means wave A has a higher frequency than wave B.'
    },
    {
      type: 'mcq',
      category: 'loudness',
      question: 'Which wave property represents the amount of energy carried by a sound wave?',
      options: ['Amplitude', 'Frequency', 'Wave speed', 'Period'],
      answerIndex: 0,
      explanation: 'The amplitude of a wave is a direct measure of its energy. High amplitude waves carry more energy.'
    },
    {
      type: 'mcq',
      category: 'pitch',
      question: 'Human hearing range is typically between 20 Hz and 20,000 Hz. If a sound wave frequency decreases to 10 Hz, it is:',
      options: ['Infrasound (too low pitched to hear)', 'Ultrasound (too high pitched to hear)', 'Extremely loud', 'Extremely quiet'],
      answerIndex: 0,
      explanation: 'Sounds below 20 Hz are infrasounds, which are too low in frequency (pitch) for humans to hear.'
    },
    // Dynamic waveform comparison questions are generated programmatically (types 3, 4, and 7)
    {
      type: 'dynamic_comp_loudness',
      category: 'loudness',
      question: 'Which waveform represents a LOUDER sound?'
    },
    {
      type: 'dynamic_comp_pitch',
      category: 'pitch',
      question: 'Which waveform represents a HIGHER-PITCHED sound?'
    },
    {
      type: 'dynamic_identify',
      category: 'both',
      question: 'Compared to the standard reference wave, how is this sound wave altered?'
    }
  ];

  // Additional static questions to fill up 30 questions
  for (let i = 16; i <= 30; i++) {
    const isLoud = i % 2 === 0;
    quizPool.push({
      type: 'mcq',
      category: isLoud ? 'loudness' : 'pitch',
      question: isLoud 
        ? `[Q${i}] A sound is modified such that its particles vibrate with lesser displacement from rest position. The sound becomes:` 
        : `[Q${i}] If the time period of a sound wave is increased, how does its pitch change?`,
      options: isLoud 
        ? ['Softer (quieter)', 'Louder', 'Higher pitched', 'Lower pitched'] 
        : ['It becomes lower pitched.', 'It becomes higher pitched.', 'It remains unchanged.', 'It becomes louder.'],
      answerIndex: 0,
      explanation: isLoud 
        ? 'Lesser displacement means a smaller amplitude, resulting in a softer sound.'
        : 'An increased period (longer time per cycle) results in a lower frequency, which corresponds to a lower pitch.'
    });
  }

  let activeQuizQuestions = [];
  let currentQuestionIndex = 0;
  let quizScore = 0;
  let categoryScores = { loudness: { correct: 0, total: 0 }, pitch: { correct: 0, total: 0 } };

  // HTML references
  const quizStartView = document.getElementById('quizStartView');
  const quizQuestionView = document.getElementById('quizQuestionView');
  const quizScoreView = document.getElementById('quizScoreView');
  const quizCurrentNum = document.getElementById('quizCurrentNum');
  const quizTotalNum = document.getElementById('quizTotalNum');
  const quizProgressBar = document.getElementById('quizProgressBar');
  const questionText = document.getElementById('questionText');
  const questionGraphicContainer = document.getElementById('questionGraphicContainer');
  const quizOptions = document.getElementById('quizOptions');
  const quizFeedback = document.getElementById('quizFeedback');
  const feedbackIcon = document.getElementById('feedbackIcon');
  const feedbackTitle = document.getElementById('feedbackTitle');
  const feedbackExplanation = document.getElementById('feedbackExplanation');
  const nextQuestionBtn = document.getElementById('nextQuestionBtn');

  // Trigger Quiz Start
  document.getElementById('startQuizBtn').addEventListener('click', startQuiz);
  
  function startQuiz() {
    quizStartView.classList.add('hidden');
    quizQuestionView.classList.remove('hidden');
    quizScoreView.classList.add('hidden');
    
    currentQuestionIndex = 0;
    quizScore = 0;
    categoryScores = { 
      loudness: { correct: 0, total: 0 }, 
      pitch: { correct: 0, total: 0 } 
    };

    // Draw 8 questions randomly from pool
    activeQuizQuestions = shuffleAndSelectQuizQuestions();
    quizTotalNum.textContent = activeQuizQuestions.length;

    showQuestion();
  }

  function shuffleAndSelectQuizQuestions() {
    // Shuffles pool, extracts 8-10 items
    const shuffled = [...quizPool].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 8); // Select 8 questions per session

    // Hydrate any dynamic templates in the selection
    return selected.map(q => {
      if (q.type === 'dynamic_comp_loudness') {
        const swap = Math.random() > 0.5;
        return {
          type: 'mcq_graphic',
          category: 'loudness',
          question: q.question,
          drawParams: {
            type: 'comp_loudness',
            swap: swap // If swapped, A is soft and B is loud. Otherwise A is loud and B is soft.
          },
          options: swap ? ['Waveform B', 'Waveform A', 'Both sound identical'] : ['Waveform A', 'Waveform B', 'Both sound identical'],
          answerIndex: 0, // Option 0 is always correct
          explanation: swap 
            ? 'Waveform B has larger peaks and troughs (larger amplitude), representing a louder sound.' 
            : 'Waveform A has larger peaks and troughs (larger amplitude), representing a louder sound.'
        };
      }
      else if (q.type === 'dynamic_comp_pitch') {
        const swap = Math.random() > 0.5;
        return {
          type: 'mcq_graphic',
          category: 'pitch',
          question: q.question,
          drawParams: {
            type: 'comp_pitch',
            swap: swap // If swapped, A is low frequency and B is high. Otherwise A is high and B is low.
          },
          options: swap ? ['Waveform B', 'Waveform A', 'Both sound identical'] : ['Waveform A', 'Waveform B', 'Both sound identical'],
          answerIndex: 0,
          explanation: swap 
            ? 'Waveform B has more closely packed wave cycles (higher frequency), which represents a higher-pitched sound.'
            : 'Waveform A has more closely packed wave cycles (higher frequency), which represents a higher-pitched sound.'
        };
      }
      else if (q.type === 'dynamic_identify') {
        const attr = Math.random() > 0.5 ? 'amplitude' : 'frequency';
        const direction = Math.random() > 0.5 ? 'higher' : 'lower';
        
        let targetText = '';
        let options = [];
        let explanation = '';

        if (attr === 'amplitude') {
          if (direction === 'higher') {
            targetText = 'louder';
            options = ['It represents a louder sound (higher amplitude).', 'It represents a softer sound.', 'It represents a higher pitched sound.', 'It represents a lower pitched sound.'];
            explanation = 'The wave peaks/troughs are taller than the reference, meaning amplitude is increased and the sound is louder.';
          } else {
            targetText = 'softer';
            options = ['It represents a softer sound (lower amplitude).', 'It represents a louder sound.', 'It represents a higher pitched sound.', 'It represents a lower pitched sound.'];
            explanation = 'The wave peaks/troughs are shorter than the reference, meaning amplitude is decreased and the sound is softer.';
          }
        } else {
          if (direction === 'higher') {
            targetText = 'higher-pitched';
            options = ['It represents a higher-pitched sound (higher frequency).', 'It represents a lower-pitched sound.', 'It represents a louder sound.', 'It represents a softer sound.'];
            explanation = 'The wave cycles are more closely packed than the reference, meaning frequency is increased and the pitch is higher.';
          } else {
            targetText = 'lower-pitched';
            options = ['It represents a lower-pitched sound (lower frequency).', 'It represents a higher-pitched sound.', 'It represents a louder sound.', 'It represents a softer sound.'];
            explanation = 'The wave cycles are widely spaced compared to the reference, meaning frequency is decreased and the pitch is lower.';
          }
        }

        return {
          type: 'mcq_graphic',
          category: attr === 'amplitude' ? 'loudness' : 'pitch',
          question: `Compared to the reference wave, what is the characteristic of this sound wave?`,
          drawParams: {
            type: 'identify',
            attr: attr,
            direction: direction
          },
          options: options, // Option 0 is correct
          answerIndex: 0,
          explanation: explanation
        };
      }
      
      // For standard static questions, randomize option order
      const opts = [...q.options];
      const correctText = opts[q.answerIndex];
      // Shuffle options
      opts.sort(() => Math.random() - 0.5);
      const newAnswerIdx = opts.indexOf(correctText);

      return {
        ...q,
        options: opts,
        answerIndex: newAnswerIdx
      };
    });
  }

  function showQuestion() {
    // Reset views
    quizFeedback.classList.add('hidden');
    questionGraphicContainer.classList.add('hidden');
    questionGraphicContainer.innerHTML = '';
    quizOptions.innerHTML = '';

    // Set stats
    quizCurrentNum.textContent = currentQuestionIndex + 1;
    const progressPercent = (currentQuestionIndex / activeQuizQuestions.length) * 100;
    quizProgressBar.style.width = `${progressPercent}%`;

    const q = activeQuizQuestions[currentQuestionIndex];
    questionText.textContent = q.question;

    // Handle graphical question canvases
    if (q.type === 'mcq_graphic') {
      questionGraphicContainer.classList.remove('hidden');
      renderQuestionGraphics(q.drawParams);
    }

    // Populate options
    q.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.innerHTML = `<span>${opt}</span>`;
      btn.addEventListener('click', () => submitAnswer(idx));
      quizOptions.appendChild(btn);
    });
  }

  function renderQuestionGraphics(params) {
    if (params.type === 'comp_loudness') {
      const boxA = createWaveContainer('Wave A');
      const boxB = createWaveContainer('Wave B');
      questionGraphicContainer.appendChild(boxA.container);
      questionGraphicContainer.appendChild(boxB.container);

      // Draw waves A and B
      const ampA = params.swap ? 10 : 38; // swapped: A is soft, B is loud
      const ampB = params.swap ? 38 : 10;
      
      drawWave(boxA.ctx, boxA.canvas.width, boxA.canvas.height, ampA, 2, 0, '#3b82f6', 2.5);
      drawWave(boxB.ctx, boxB.canvas.width, boxB.canvas.height, ampB, 2, 0, '#3b82f6', 2.5);
    }
    else if (params.type === 'comp_pitch') {
      const boxA = createWaveContainer('Wave A');
      const boxB = createWaveContainer('Wave B');
      questionGraphicContainer.appendChild(boxA.container);
      questionGraphicContainer.appendChild(boxB.container);

      // Draw waves
      const freqA = params.swap ? 1.2 : 4.5; // swapped: A is low, B is high
      const freqB = params.swap ? 4.5 : 1.2;

      drawWave(boxA.ctx, boxA.canvas.width, boxA.canvas.height, 25, freqA, 0, '#2dd4bf', 2.5);
      drawWave(boxB.ctx, boxB.canvas.width, boxB.canvas.height, 25, freqB, 0, '#2dd4bf', 2.5);
    }
    else if (params.type === 'identify') {
      const refBox = createWaveContainer('Reference Wave');
      const testBox = createWaveContainer('Tested Wave');
      questionGraphicContainer.appendChild(refBox.container);
      questionGraphicContainer.appendChild(testBox.container);

      let refAmp = 25;
      let refFreq = 2.5;
      let testAmp = 25;
      let testFreq = 2.5;

      if (params.attr === 'amplitude') {
        testAmp = params.direction === 'higher' ? 40 : 10;
      } else {
        testFreq = params.direction === 'higher' ? 5.0 : 1.0;
      }

      drawWave(refBox.ctx, refBox.canvas.width, refBox.canvas.height, refAmp, refFreq, 0, '#94a3b8', 2);
      drawWave(testBox.ctx, testBox.canvas.width, testBox.canvas.height, testAmp, testFreq, 0, '#2dd4bf', 2.5);
    }
  }

  function createWaveContainer(labelText) {
    const container = document.createElement('div');
    container.className = 'question-wave-item';

    const label = document.createElement('span');
    label.className = 'question-wave-label';
    label.textContent = labelText;

    const canvas = document.createElement('canvas');
    canvas.width = 180;
    canvas.height = 100;

    container.appendChild(label);
    container.appendChild(canvas);

    return {
      container,
      canvas,
      ctx: canvas.getContext('2d')
    };
  }

  function submitAnswer(selectedIndex) {
    const q = activeQuizQuestions[currentQuestionIndex];
    const optionButtons = quizOptions.querySelectorAll('.option-btn');

    // Disable all options
    optionButtons.forEach(btn => btn.disabled = true);

    const isCorrect = selectedIndex === q.answerIndex;
    
    // Track stats
    if (q.category === 'loudness' || q.category === 'both') {
      categoryScores.loudness.total++;
      if (isCorrect) categoryScores.loudness.correct++;
    }
    if (q.category === 'pitch' || q.category === 'both') {
      categoryScores.pitch.total++;
      if (isCorrect) categoryScores.pitch.correct++;
    }

    if (isCorrect) {
      quizScore++;
      optionButtons[selectedIndex].classList.add('selected');
      
      // Update feedback box
      quizFeedback.className = 'quiz-feedback correct-feedback';
      feedbackIcon.textContent = '🔷'; // color-blind accessible shape icons (no green/red)
      feedbackTitle.textContent = 'Correct!';
    } else {
      // Highlight correct option and show shake
      optionButtons[selectedIndex].classList.add('incorrect-shake');
      optionButtons[q.answerIndex].classList.add('selected'); // point to correct one
      
      quizFeedback.className = 'quiz-feedback incorrect-feedback';
      feedbackIcon.textContent = '🔸';
      feedbackTitle.textContent = 'Incorrect';
    }

    feedbackExplanation.innerHTML = q.explanation;
    quizFeedback.classList.remove('hidden');
  }

  nextQuestionBtn.addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < activeQuizQuestions.length) {
      showQuestion();
    } else {
      showScoreResults();
    }
  });

  function showScoreResults() {
    quizQuestionView.classList.add('hidden');
    quizScoreView.classList.remove('hidden');
    quizProgressBar.style.width = `100%`;

    const scorePercentVal = Math.round((quizScore / activeQuizQuestions.length) * 100);
    document.getElementById('scorePercentage').textContent = `${scorePercentVal}%`;
    document.getElementById('scoreFraction').textContent = `${quizScore}/${activeQuizQuestions.length}`;

    // Fill Radial Progress Bar
    const scoreRadialFill = document.getElementById('scoreRadialFill');
    const radius = scoreRadialFill.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (scorePercentVal / 100) * circumference;
    scoreRadialFill.style.strokeDashoffset = offset;

    // Performance Breakdown bars
    const loudPercent = categoryScores.loudness.total > 0 
      ? Math.round((categoryScores.loudness.correct / categoryScores.loudness.total) * 100) 
      : 100;
    const pitchPercent = categoryScores.pitch.total > 0 
      ? Math.round((categoryScores.pitch.correct / categoryScores.pitch.total) * 100) 
      : 100;

    document.getElementById('masteryLoudnessPct').textContent = `${loudPercent}%`;
    document.getElementById('masteryLoudnessBar').style.width = `${loudPercent}%`;
    
    document.getElementById('masteryPitchPct').textContent = `${pitchPercent}%`;
    document.getElementById('masteryPitchBar').style.width = `${pitchPercent}%`;

    // Grade messages (Three-tier)
    const gradeTitle = document.getElementById('scoreGradeMessage');
    const gradeSub = document.getElementById('scoreSubMessage');

    if (scorePercentVal >= 80) {
      gradeTitle.textContent = '🌟 Excellent Acoustics Mastery!';
      gradeSub.textContent = 'Fantastic! You have thoroughly understood the physics of loudness, pitch, amplitude, and frequency. You are ready for O-Level questions!';
      triggerConfetti();
    } else if (scorePercentVal >= 50) {
      gradeTitle.textContent = '👍 Good Effort!';
      gradeSub.textContent = 'Nice job! You have a solid basic understanding but look at the topic mastery breakdown below to review specific definitions.';
    } else {
      gradeTitle.textContent = '📚 Let\'s Review the Basics';
      gradeSub.textContent = 'Keep trying! Revisit our introductory section and interactive labs to build up your confidence on amplitude and frequency.';
    }
  }

  // Particle bursts / Confetti
  function triggerConfetti() {
    const count = 60;
    const container = document.getElementById('quizCard');

    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.style.position = 'absolute';
      particle.style.width = `${Math.random() * 8 + 4}px`;
      particle.style.height = `${Math.random() * 8 + 4}px`;
      particle.style.borderRadius = '50%';
      particle.style.backgroundColor = Math.random() > 0.5 ? '#2dd4bf' : '#3b82f6';
      particle.style.left = '50%';
      particle.style.top = '50%';
      particle.style.transform = 'translate(-50%, -50%)';
      particle.style.pointerEvents = 'none';
      particle.style.zIndex = '100';

      container.appendChild(particle);

      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 150 + 50;
      const xForce = Math.cos(angle) * velocity;
      const yForce = Math.sin(angle) * velocity;

      particle.animate([
        { transform: `translate(-50%, -50%) translate(0, 0)`, opacity: 1 },
        { transform: `translate(-50%, -50%) translate(${xForce}px, ${yForce}px)`, opacity: 0 }
      ], {
        duration: Math.random() * 800 + 600,
        easing: 'cubic-bezier(0.1, 0.8, 0.3, 1)',
        fill: 'forwards'
      });

      // Cleanup
      setTimeout(() => particle.remove(), 1500);
    }
  }

  // Restart Quiz Action
  document.getElementById('restartQuizBtn').addEventListener('click', startQuiz);
  
  // Return to Study Action
  document.getElementById('returnToStudyBtn').addEventListener('click', () => {
    switchSection('section1');
  });

  // --- Initialise Application ---
  switchSection('section1');
});
