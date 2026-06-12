import { initSimulation } from './simulation.js';
import { quizState, generateQuiz, renderActiveQuestion, checkAnswer } from './quiz.js';
import { initFlashcards, resetDeck } from './flashcards.js';

document.addEventListener('DOMContentLoaded', () => {
  // Navigation
  const navItems = document.querySelectorAll('.nav-item');
  const screens = document.querySelectorAll('.screen');

  function showScreen(screenId) {
    screens.forEach(s => s.classList.remove('active'));
    navItems.forEach(n => n.classList.remove('active'));

    const activeScreen = document.getElementById(screenId);
    if (activeScreen) {
      activeScreen.classList.add('active');
    }

    const activeNav = document.querySelector(`[data-target="${screenId}"]`);
    if (activeNav) {
      activeNav.classList.add('active');
    }

    // Custom hook actions on entering specific screens
    if (screenId === 'screen-quiz') {
      // Auto-restart quiz if not started
      if (quizState.questions.length === 0) {
        startQuizSession();
      }
    } else if (screenId === 'screen-flashcards') {
      resetDeck();
    }
  }

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const targetScreen = e.currentTarget.getAttribute('data-target');
      showScreen(targetScreen);
    });
  });

  // Quiz Event Listeners
  const btnQuizAction = document.getElementById('btn-quiz-action');
  btnQuizAction.addEventListener('click', () => {
    if (!quizState.isChecked) {
      checkAnswer();
    } else {
      // Go to next question or show results
      if (quizState.currentIndex < 29) {
        quizState.currentIndex++;
        renderActiveQuestion();
      } else {
        showResults();
      }
    }
  });

  // Restart Quiz
  document.getElementById('btn-restart-quiz').addEventListener('click', () => {
    startQuizSession();
  });

  // Score Screen: Go to Flashcards
  document.getElementById('btn-score-flashcards').addEventListener('click', () => {
    showScreen('screen-flashcards');
  });

  function startQuizSession() {
    generateQuiz();
    showScreen('screen-quiz');
    renderActiveQuestion();
  }

  function showResults() {
    showScreen('screen-score');
    
    // Fill Score
    const scorePoints = document.getElementById('score-points');
    scorePoints.textContent = `${quizState.score} / 30`;

    // Conic gradient percentage ring
    const ring = document.querySelector('.score-display-ring');
    const percent = Math.round((quizState.score / 30) * 100);
    ring.style.setProperty('--percent', `${percent}%`);

    // Stars & Feedback Message
    const starContainer = document.getElementById('score-stars');
    const feedbackMsg = document.getElementById('score-feedback-msg');

    let starsHtml = '';
    let msg = '';

    if (quizState.score <= 14) {
      starsHtml = '<span class="star active">★</span><span class="star">★</span><span class="star">★</span>';
      msg = "Keep practising — go back to the hydraulic diagram and try again.";
    } else if (quizState.score <= 23) {
      starsHtml = '<span class="star active">★</span><span class="star active">★</span><span class="star">★</span>';
      msg = "Good effort! Review the questions you got wrong.";
    } else {
      starsHtml = '<span class="star active">★</span><span class="star active">★</span><span class="star active">★</span>';
      msg = "Excellent! You understand hydraulic systems.";
    }

    starContainer.innerHTML = starsHtml;
    feedbackMsg.textContent = msg;
  }

  // Initialize Modules
  initSimulation();
  initFlashcards();
});
