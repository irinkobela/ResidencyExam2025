// Full upgraded script.js with all features implemented

let current = 0;
let data = [];
let reviewSet = new Set();
let isDarkMode = false;
let timerInterval;
let timeLeft = 25 * 60;

fetch('questions.json')
  .then(res => res.json())
  .then(json => {
    data = shuffle(json);
    showCard();
    updateProgress();
    initializeUI();
  });

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function showCard() {
  const q = document.getElementById("question");
  const a = document.getElementById("answer");
  const item = data[current];

  q.innerText = item.question;
  a.innerHTML = `
    <strong>პასუხი:</strong> ${item.correctAnswer}<br/><br/>
    <em>${item.explanation}</em>
  `;

  document.getElementById("card").classList.remove("flipped");
  updateMarkButton();
  updateProgress();
}

function updateProgress() {
  document.getElementById("progress").innerText = `${current + 1} / ${data.length}`;
}

function updateMarkButton() {
  document.getElementById("mark-btn").innerText = reviewSet.has(current) ? "Unmark" : "Mark for Review";
}

function initializeUI() {
  document.getElementById("timer").innerText = "25:00";
  document.getElementById("dark-toggle").innerText = isDarkMode ? "Light Mode" : "Dark Mode";
  updateMarkButton();
  document.getElementById("start-timer").innerText = "Start Timer";
  document.getElementById("toggle-review").innerText = "Toggle Review Mode";
  document.getElementById("toggle-shuffle").innerText = "Shuffle Questions";
  document.getElementById("prev-btn").innerText = "Previous";
  document.getElementById("next-btn").innerText = "Next";
}

function toggleDarkMode() {
  isDarkMode = !isDarkMode;
  document.body.classList.toggle("dark", isDarkMode);
  document.getElementById("dark-toggle").innerText = isDarkMode ? "Light Mode" : "Dark Mode";
}

function toggleShuffle() {
  data = shuffle(data);
  current = 0;
  showCard();
}

function toggleReviewMode() {
  const reviewCards = Array.from(reviewSet).map(index => data[index]);
  if (reviewCards.length > 0) {
    data = reviewCards;
    current = 0;
    reviewSet.clear();
  } else {
    fetch('questions.json')
      .then(res => res.json())
      .then(json => {
        data = shuffle(json);
        current = 0;
        showCard();
      });
    return;
  }
  showCard();
}

function startPomodoro() {
  clearInterval(timerInterval);
  timeLeft = 25 * 60;
  timerInterval = setInterval(() => {
    timeLeft--;
    const min = Math.floor(timeLeft / 60);
    const sec = timeLeft % 60;
    document.getElementById("timer").innerText = `${min}:${sec.toString().padStart(2, '0')}`;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      alert("Pomodoro session ended!");
    }
  }, 1000);
}

function markReview() {
  if (reviewSet.has(current)) {
    reviewSet.delete(current);
  } else {
    reviewSet.add(current);
  }
  updateMarkButton();
}

document.getElementById("card").addEventListener("click", () => {
  document.getElementById("card").classList.toggle("flipped");
});

document.addEventListener("keydown", (e) => {
  if (e.code === "ArrowRight") nextCard();
  else if (e.code === "ArrowLeft") prevCard();
  else if (e.code === "Space") {
    e.preventDefault();
    document.getElementById("card").classList.toggle("flipped");
  }
});

document.getElementById("toggle-dark").addEventListener("click", toggleDarkMode);
document.getElementById("toggle-shuffle").addEventListener("click", toggleShuffle);
document.getElementById("start-pomodoro").addEventListener("click", startPomodoro);
document.getElementById("toggle-review").addEventListener("click", toggleReviewMode);
document.getElementById("prev-btn").addEventListener("click", prevCard);
document.getElementById("next-btn").addEventListener("click", nextCard);
document.getElementById("mark-btn").addEventListener("click", markReview);

function nextCard() {
  current = (current + 1) % data.length;
  showCard();
}

function prevCard() {
  current = (current - 1 + data.length) % data.length;
  showCard();
}
// Add this to track wrong answers
let wrongAnswers = new Set();

function showCard() {
  const q = document.getElementById("question");
  const a = document.getElementById("answer");
  const item = data[current];

  q.innerText = item.question;
  a.innerHTML = `
    <strong>პასუხი:</strong> ${item.correctAnswer}<br/><br/>
    <em>${item.explanation}</em>
    <br/><br/>
    <button onclick="markWrong()">Mark as Wrong</button>
    <button onclick="unmarkWrong()">Unmark Wrong</button>
  `;

  document.getElementById("card").classList.remove("flipped");
  updateMarkButton();
  updateProgress();
}

function markWrong() {
  wrongAnswers.add(current);
  saveWrongAnswers();
  alert("Marked as wrong");
}

function unmarkWrong() {
  wrongAnswers.delete(current);
  saveWrongAnswers();
  alert("Unmarked");
}

function saveWrongAnswers() {
  localStorage.setItem('flashcard-wrong', JSON.stringify([...wrongAnswers]));
}

function loadWrongAnswers() {
  const saved = localStorage.getItem('flashcard-wrong');
  if (saved) wrongAnswers = new Set(JSON.parse(saved));
}

function toggleWrongMode() {
  const wrongCards = Array.from(wrongAnswers).map(index => data[index]);
  if (wrongCards.length > 0) {
    data = wrongCards;
    current = 0;
    showCard();
  } else {
    alert("No wrong answers tracked.");
  }
}

// Load wrong answers on startup
loadWrongAnswers();
// Save current index before unload
window.addEventListener('beforeunload', () => {
  localStorage.setItem('flashcard-current', current);
  localStorage.setItem('flashcard-reviewSet', JSON.stringify([...reviewSet]));
  localStorage.setItem('flashcard-darkMode', JSON.stringify(isDarkMode));
});

// Restore on load
function restoreState() {
  const savedIndex = parseInt(localStorage.getItem('flashcard-current'));
  if (!isNaN(savedIndex)) current = savedIndex;

  const savedReviewSet = localStorage.getItem('flashcard-reviewSet');
  if (savedReviewSet) reviewSet = new Set(JSON.parse(savedReviewSet));

  const savedDark = JSON.parse(localStorage.getItem('flashcard-darkMode'));
  if (savedDark) {
    isDarkMode = true;
    document.body.classList.add('dark');
  }
}

// Call this after loading questions
fetch('questions.json')
  .then(res => res.json())
  .then(json => {
    data = shuffle(json);
    restoreState();
    showCard();
    updateProgress();
    initializeUI();
  });
function filterQuestions(query) {
  query = query.toLowerCase();
  const filtered = data.filter(q => q.question.toLowerCase().includes(query));

  if (filtered.length > 0) {
    data = filtered;
    current = 0;
    showCard();
    updateProgress();
  } else {
    alert("No matching questions found.");
  }
}

document.getElementById("search-btn").addEventListener("click", () => {
  const query = document.getElementById("search-input").value;
  filterQuestions(query);
});

document.getElementById("search-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const query = document.getElementById("search-input").value;
    filterQuestions(query);
  }
});
