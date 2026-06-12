export const cardDeck = [
  {
    q: "What is Pascal's Principle?",
    a: "Pressure applied to an enclosed fluid is transmitted equally and undiminished in all directions."
  },
  {
    q: "What is the formula linking pressure, force, and area for the two pistons?",
    a: "P = F₁ ÷ A₁ = F₂ ÷ A₂"
  },
  {
    q: "How does a hydraulic press multiply force?",
    a: "The output piston has a larger area, so the same fluid pressure acting on a larger area produces a larger output force (F₂ = P × A₂)."
  },
  {
    q: "What type of fluid is used in hydraulic systems?",
    a: "A non-compressible liquid (e.g., mineral oil or specialized hydraulic oil)."
  },
  {
    q: "Why can't gases be used in hydraulic systems?",
    a: "Gases are highly compressible. Pushing the input piston would compress the gas rather than transmitting pressure to move the output piston."
  },
  {
    q: "If output area A₂ is 5 times larger than input area A₁, how does output force F₂ compare to F₁?",
    a: "F₂ = 5 × F₁ (Force is multiplied 5 times)."
  },
  {
    q: "What is the SI unit of pressure in hydraulic calculations?",
    a: "Pascal (Pa), which is equal to 1 Newton per square meter (N/m²)."
  },
  {
    q: "Give two real-world examples of hydraulic systems.",
    a: "Car hydraulic brake systems, hydraulic lifts, dentist chairs, and construction excavator arms."
  },
  {
    q: "If F₁ = 100 N, A₁ = 0.01 m², and A₂ = 0.05 m², find the output force F₂.",
    a: "F₂ = F₁ × (A₂ ÷ A₁) = 100 × (0.05 ÷ 0.01) = 500 N."
  },
  {
    q: "What happens to force and pressure if the output piston is smaller than the input piston?",
    a: "Force is reduced, not multiplied (F₂ < F₁). However, fluid pressure remains the same at both pistons."
  }
];

export const cardState = {
  activeDeck: [],
  currentIndex: 0,
  isFlipped: false
};

let activeCardDOM, questionTextDOM, answerTextDOM, counterDOM, reviewBadgeDOM;

export function initFlashcards() {
  activeCardDOM = document.getElementById('active-card');
  questionTextDOM = document.getElementById('card-question-text');
  answerTextDOM = document.getElementById('card-answer-text');
  counterDOM = document.getElementById('flashcard-counter');
  reviewBadgeDOM = document.getElementById('review-badge');

  // Add click to flip
  activeCardDOM.addEventListener('click', () => {
    cardState.isFlipped = !cardState.isFlipped;
    if (cardState.isFlipped) {
      activeCardDOM.classList.add('flipped');
    } else {
      activeCardDOM.classList.remove('flipped');
    }
  });

  // Action Buttons
  document.getElementById('btn-card-gotit').addEventListener('click', () => {
    handleCardAction(true);
  });

  document.getElementById('btn-card-review').addEventListener('click', () => {
    handleCardAction(false);
  });

  resetDeck();
}

export function resetDeck() {
  // Deep copy cards
  cardState.activeDeck = cardDeck.map(c => ({ ...c }));
  cardState.currentIndex = 0;
  cardState.isFlipped = false;
  activeCardDOM.classList.remove('flipped');

  renderCard();
}

function renderCard() {
  if (cardState.activeDeck.length === 0) {
    questionTextDOM.textContent = "All cards mastered! 🎉";
    answerTextDOM.textContent = "Click navigation to review or try the quiz.";
    counterDOM.textContent = "0 of 0";
    reviewBadgeDOM.textContent = "0";
    return;
  }

  // Cap index
  if (cardState.currentIndex >= cardState.activeDeck.length) {
    cardState.currentIndex = 0;
  }

  const current = cardState.activeDeck[cardState.currentIndex];
  questionTextDOM.textContent = current.q;
  answerTextDOM.textContent = current.a;
  counterDOM.textContent = `${cardState.currentIndex + 1} of ${cardState.activeDeck.length}`;
  
  // Count how many are in the review queue
  reviewBadgeDOM.textContent = cardState.activeDeck.length - (cardState.currentIndex + 1);
}

function handleCardAction(isGotIt) {
  if (cardState.activeDeck.length === 0) return;

  // Re-orient card first
  cardState.isFlipped = false;
  activeCardDOM.classList.remove('flipped');

  setTimeout(() => {
    if (isGotIt) {
      // Remove from deck
      cardState.activeDeck.splice(cardState.currentIndex, 1);
    } else {
      // Move to end of deck
      const [card] = cardState.activeDeck.splice(cardState.currentIndex, 1);
      cardState.activeDeck.push(card);
    }
    
    renderCard();
  }, 150); // wait briefly for flip-back transition
}
