"use strict";

// ─────────────────────────────────────────────────────────────────────────────
//  CONSTANTS
//  We define all the magic numbers at the top so they're easy to tweak
// ─────────────────────────────────────────────────────────────────────────────

const BOMB_DURATION_MS = 12000; // total time the player has to answer (12 s)
const SHAKE_RAMP_MS    = 6000;  // shaking starts ramping up in the last 6 s
const REVEAL_DELAY_MS  = 1400;  // how long we show the feedback before moving on
const MAX_LIVES        = 3;     // number of wrong answers allowed before game over

// We map internal topic keys to human-readable French labels for the tag shown
// on each question card. This keeps the question data clean and readable.
const TOPIC_LABELS = {
  arithmetic:    "Arithmétique",
  equations:     "Équations",
  algebra:       "Algèbre",
  inequalities:  "Inégalités",
  functions:     "Fonctions",
  limits:        "Limites",
  derivatives:   "Dérivées",
  integrals:     "Intégrales",
  trigonometry:  "Trigonométrie",
  logarithms:    "Logarithmes",
  combinatorics: "Combinatoire",
  probability:   "Probabilités",
};

// ─────────────────────────────────────────────────────────────────────────────
//  GAME STATE
//  We centralise all mutable data in one object so it's easy to reset
//  between games and to debug — just console.log(state) to see everything.
// ─────────────────────────────────────────────────────────────────────────────
let state = {
  difficulty:    "easy",   // chosen in the config screen
  category:      "all",    // question category filter
  questionCount: 10,       // how many questions the player selected (3/5/10/20)
  questions:     [],       // the shuffled pool picked for this game
  index:         0,        // which question we're on right now
  lives:         MAX_LIVES,
  correct:       0,        // number of correct answers so far
  streak:        0,        // current consecutive correct answers
  maxStreak:     0,        // best streak reached during this game
  times:         [],       // response time (ms) per question, for the average stat
  bombStart:     0,        // timestamp when the current question's bomb was armed
  bombRaf:       0,        // requestAnimationFrame id for the shake loop
  bombTimer:     null,     // setTimeout id for the explosion trigger
  answered:      false,    // guard so we don't process two answers for one question
};

// ─────────────────────────────────────────────────────────────────────────────
//  DOM REFERENCES
//  We grab all elements once at startup rather than querying the DOM every time.
//  The $ shorthand keeps the code compact without sacrificing readability.
// ─────────────────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);

// The three "screens" — only one has class="active" at a time
const stateConfig  = $("state-config");
const statePlaying = $("state-playing");
const stateResults = $("state-results");

// Config screen controls
const diffOptions  = $("diff-options");
const countOptions = $("count-options");
const catOptions   = $("cat-options");
const startBtn     = $("start-btn");

// Playing screen header
const progressLabel = $("progress-label");
const livesDisplay  = $("lives-display");

// Bomb animation elements
const bombContainer = $("bomb-container");
const bombSparkle   = $("bomb-sparkle");
const bombExplosion = $("bomb-explosion");

// Question card elements
const questionCard  = $("question-card");
const questionTopic = $("question-topic");
const questionText  = $("question-text");

// Anecdote popup — shown after the player answers
const anecdoteOverlay  = $("anecdote-overlay");
const anecdoteText     = $("anecdote-text");
const anecdoteContinue = $("anecdote-continue");

// Feedback toast ("✓ Correct !" / "✗ Raté !")
const feedbackEl = $("quiz-feedback");

// Answer zones — we show one or the other depending on question type
const answerQcm     = $("answer-qcm");
const answerNumeric = $("answer-numeric");
const numericInput  = $("numeric-input");
const numericSubmit = $("numeric-submit");
const keypadEl      = $("keypad");

// Results screen elements
const resultsScore = $("results-score");
const resultsLabel = $("results-label");
const statStreak   = $("stat-streak");
const statTime     = $("stat-time");
const resultsChart = $("results-chart");
const replayBtn    = $("replay-btn");

// ─────────────────────────────────────────────────────────────────────────────
//  KATEX HELPERS
//  We use KaTeX (loaded from CDN in the HTML) to render LaTeX formulas.
//  The try/catch is here because some questions use raw text, not LaTeX,
//  and we want to fall back gracefully without crashing the whole quiz.
// ─────────────────────────────────────────────────────────────────────────────
function renderLatex(el, latex) {
  try {
    katex.render(latex, el, { throwOnError: false, displayMode: false });
  } catch (_) {
    // If KaTeX can't parse it, we just show the raw string
    el.textContent = latex;
  }
}

// Returns a <span> containing a rendered formula — useful when we need to
// insert a rendered element into a button or container
function renderLatexStr(latex) {
  const span = document.createElement("span");
  renderLatex(span, latex);
  return span;
}

// ─────────────────────────────────────────────────────────────────────────────
//  CONFIG SCREEN LOGIC
//  We use a single reusable function to wire up any group of toggle buttons.
//  It reads the data attribute name and calls a callback with the selected value.
// ─────────────────────────────────────────────────────────────────────────────
function setupConfigButtons(container, attrName, onSelect) {
  // We listen at the container level (event delegation) rather than on each
  // button individually — this is more efficient and handles dynamic buttons
  container.addEventListener("click", e => {
    const btn = e.target.closest("[data-" + attrName + "]");
    if (!btn) return; // clicked somewhere else in the container
    // Deselect all siblings, then mark the clicked one as selected
    container.querySelectorAll(".sk-btn").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    onSelect(btn.dataset[attrName]);
  });
}

// Wire up each config group to update the corresponding state field
setupConfigButtons(diffOptions,  "diff",  v => { state.difficulty    = v; });
setupConfigButtons(countOptions, "count", v => { state.questionCount = parseInt(v, 10); });
setupConfigButtons(catOptions,   "cat",   v => { state.category      = v; });

startBtn.addEventListener("click", startQuiz);

// ─────────────────────────────────────────────────────────────────────────────
//  STARTING THE QUIZ
// ─────────────────────────────────────────────────────────────────────────────
function startQuiz() {
  // "all" maps to null so pickQuestions() knows not to filter by category
  const cat  = state.category === "all" ? null : state.category;
  const pool = pickQuestions({ category: cat, difficulty: state.difficulty, count: state.questionCount });

  // Edge case: the chosen combination might have fewer questions than requested
  if (pool.length === 0) {
    alert("Pas assez de questions pour cette combinaison. Essaie une autre difficulté ou catégorie.");
    return;
  }

  // Reset all counters for a fresh game
  state.questions = pool;
  state.index     = 0;
  state.lives     = MAX_LIVES;
  state.correct   = 0;
  state.streak    = 0;
  state.maxStreak = 0;
  state.times     = [];

  showState("playing");
  showQuestion();
}

// ─────────────────────────────────────────────────────────────────────────────
//  SCREEN SWITCHER
//  We have three screens (config / playing / results). Only one is visible
//  at a time — we toggle the "active" class rather than using display:none
//  directly so CSS transitions can still fire.
// ─────────────────────────────────────────────────────────────────────────────
function showState(name) {
  [stateConfig, statePlaying, stateResults].forEach(el => el.classList.remove("active"));
  if (name === "config")  stateConfig.classList.add("active");
  if (name === "playing") statePlaying.classList.add("active");
  if (name === "results") stateResults.classList.add("active");
}

// ─────────────────────────────────────────────────────────────────────────────
//  DISPLAYING A QUESTION
// ─────────────────────────────────────────────────────────────────────────────
function showQuestion() {
  const q = state.questions[state.index];
  state.answered = false;

  // Update the "Q. 3 / 10" counter and the hearts display
  progressLabel.textContent = `Q. ${state.index + 1} / ${state.questions.length}`;
  updateLives();

  // Show the topic tag (e.g. "Dérivées") above the question
  questionTopic.textContent = TOPIC_LABELS[q.topic] || q.topic;

  // Clear the previous LaTeX render and draw the new formula
  questionText.innerHTML = "";
  renderLatex(questionText, q.question);

  // Trigger the slide-in animation by briefly adding the class
  questionCard.classList.remove("slide-out");
  questionCard.classList.add("slide-in");
  setTimeout(() => questionCard.classList.remove("slide-in"), 300);

  // Clear any leftover feedback from the previous question
  feedbackEl.textContent = "";
  feedbackEl.className   = "quiz-feedback";

  // Build either the MCQ buttons or the numeric input + keypad
  buildAnswerZone(q);

  // Start counting down — the bomb animation begins
  startBomb();
}

// ─────────────────────────────────────────────────────────────────────────────
//  LIVES DISPLAY
//  We toggle the "lost" class on each heart span so CSS handles the styling.
//  Hearts at index >= state.lives are "lost" (greyed out or crossed).
// ─────────────────────────────────────────────────────────────────────────────
function updateLives() {
  const hearts = livesDisplay.querySelectorAll(".quiz-life");
  hearts.forEach((h, i) => {
    h.classList.toggle("lost", i >= state.lives);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  ANSWER ZONE — builds either MCQ buttons or the numeric input + keypad
// ─────────────────────────────────────────────────────────────────────────────
function buildAnswerZone(q) {
  if (q.type === "qcm") {
    answerNumeric.style.display = "none";
    answerQcm.style.display     = "";
    buildQcm(q);
  } else {
    // Numeric mode: hide the MCQ grid, show input + keypad
    answerQcm.style.display     = "none";
    answerNumeric.style.display = "";
    numericInput.value   = "";
    numericInput.disabled = false;
    numericSubmit.disabled = false;
    numericInput.focus();
    buildKeypad();
  }
}

// We create one button per choice and attach a click handler to each
function buildQcm(q) {
  answerQcm.innerHTML = "";
  q.choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.className = "qcm-option";
    btn.appendChild(renderLatexStr(choice)); // render the choice as LaTeX
    btn.dataset.value = choice;
    btn.addEventListener("click", () => handleQcmAnswer(q, btn));
    answerQcm.appendChild(btn);
  });
}

// We build the numeric keypad dynamically so we can control the layout
// via the keys array — empty strings become spacer divs
function buildKeypad() {
  keypadEl.innerHTML = "";
  const keys = ["7","8","9","⌫", "4","5","6","±", "1","2","3",".", "0","","/","✓"];
  keys.forEach(k => {
    if (k === "") {
      keypadEl.appendChild(document.createElement("div")); // layout spacer
      return;
    }
    const btn = document.createElement("button");
    btn.className    = "keypad-btn";
    btn.textContent  = k;
    btn.setAttribute("type", "button"); // prevent accidental form submission

    // We give special CSS classes to a few keys for distinct styling
    if (k === "⌫") btn.classList.add("key-del");
    if (k === "±") btn.classList.add("key-neg");
    if (k === ".") btn.classList.add("key-dot");

    // We bind the ✓ key directly to submitNumeric instead of going through
    // handleKeypad. This avoids a character-encoding mismatch bug where "✓"
    // could be appended to the input string instead of triggering submission.
    if (k === "✓") {
      btn.addEventListener("click", submitNumeric);
    } else {
      btn.addEventListener("click", () => handleKeypad(k));
    }

    keypadEl.appendChild(btn);
  });
}

// Processes a keypad key press: delete, sign toggle, fraction slash, or digit
function handleKeypad(k) {
  if (state.answered) return; // guard: ignore input after the answer is locked
  if (k === "✓") { submitNumeric(); return; } // fallback (shouldn't be reached)
  if (k === "⌫") {
    numericInput.value = numericInput.value.slice(0, -1);
    return;
  }
  if (k === "±") {
    // Toggle the minus sign at the front of the number
    numericInput.value = numericInput.value.startsWith("-")
      ? numericInput.value.slice(1)
      : "-" + numericInput.value;
    return;
  }
  // We only allow one "/" so the player can enter fractions like "1/3"
  if (k === "/" && !numericInput.value.includes("/")) {
    numericInput.value += "/";
    return;
  }
  numericInput.value += k;
}

// ─────────────────────────────────────────────────────────────────────────────
//  ANSWER HANDLING
// ─────────────────────────────────────────────────────────────────────────────

// Called when the player clicks an MCQ option
function handleQcmAnswer(q, btn) {
  if (state.answered) return; // prevent double submission
  state.answered = true;
  stopBomb(); // stop the countdown immediately

  const correct = btn.dataset.value === q.answer;
  markQcm(q, correct ? btn : null); // highlight correct/wrong answers
  processAnswer(correct);
}

// We highlight every button: green for the correct answer, red for wrong ones
function markQcm(q, correctBtn) {
  answerQcm.querySelectorAll(".qcm-option").forEach(b => {
    b.disabled = true; // prevent further clicks
    if (b.dataset.value === q.answer) b.classList.add("correct");
    else if (b !== correctBtn)        b.classList.add("wrong");
  });
}

// Called when the player clicks ✓ or presses Enter in numeric mode
function submitNumeric() {
  if (state.answered) return;
  const q   = state.questions[state.index];
  const raw = numericInput.value.trim();
  if (!raw) return; // don't accept an empty field

  state.answered = true;
  stopBomb();

  const correct = checkNumericAnswer(raw, q.answer, q.acceptedAnswers);
  numericInput.disabled  = true;
  numericSubmit.disabled = true;
  processAnswer(correct);
}

// We also allow keyboard Enter for the numeric input
numericSubmit.addEventListener("click", submitNumeric);
numericInput.addEventListener("keydown", e => { if (e.key === "Enter") submitNumeric(); });

// We normalise both the player's answer and the expected answer before comparing.
// This handles: spaces, commas vs. dots, case, float rounding, and fractions.
function checkNumericAnswer(raw, answer, accepted = []) {
  const normalize = s => s.replace(/\s+/g, "").replace(/,/g, ".").toLowerCase();
  const all = [answer, ...(accepted || [])].map(normalize);
  const n   = normalize(raw);

  // Exact string match first (covers "1/3", "0.5", "-1", etc.)
  if (all.includes(n)) return true;

  // Float comparison with a small epsilon to handle rounding errors
  const pn = parseFloat(n);
  const pa = parseFloat(normalize(answer));
  if (!isNaN(pn) && !isNaN(pa) && Math.abs(pn - pa) < 1e-6) return true;

  // Fraction support: player types "1/3" → we compute 0.333… and compare
  if (raw.includes("/")) {
    const [num, den] = raw.split("/").map(Number);
    if (!isNaN(num) && !isNaN(den) && den !== 0) {
      if (Math.abs(num / den - pa) < 1e-4) return true;
    }
  }

  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
//  PROCESSING THE RESULT OF AN ANSWER
// ─────────────────────────────────────────────────────────────────────────────
function processAnswer(correct) {
  // Record how long the player took — used for the "average time / Q" stat
  const elapsed = Date.now() - state.bombStart;
  state.times.push(elapsed);

  if (correct) {
    state.correct++;
    state.streak++;
    state.maxStreak = Math.max(state.maxStreak, state.streak);
    showFeedback("✓ Correct !", "correct");
  } else {
    state.streak = 0;
    state.lives--;
    updateLives();
    showFeedback("✗ Raté !", "wrong");
  }

  // After a short pause we show the anecdote popup if the question has one,
  // otherwise we go straight to the next question
  const q = state.questions[state.index];
  setTimeout(() => {
    if (q.anecdote) {
      showAnecdotePopup(q.anecdote);
    } else {
      advanceQuestion();
    }
  }, 800);
}

// Show the "did you know?" popup with the historical anecdote
function showAnecdotePopup(text) {
  anecdoteText.textContent = text;
  anecdoteOverlay.classList.add("active"); // CSS handles the fade-in
}

// Move on to the next question (or show results if the game is over)
function advanceQuestion() {
  anecdoteOverlay.classList.remove("active");
  state.index++;
  if (state.index >= state.questions.length || state.lives <= 0) {
    showResults();
  } else {
    showQuestion();
  }
}

// The "Continuer →" button in the anecdote popup closes it and advances
anecdoteContinue.addEventListener("click", advanceQuestion);

// We briefly show a feedback message, then fade it out before the next question
function showFeedback(msg, type) {
  feedbackEl.textContent = msg;
  feedbackEl.className   = `quiz-feedback ${type}`;
  setTimeout(() => {
    feedbackEl.textContent = "";
    feedbackEl.className   = "quiz-feedback";
  }, REVEAL_DELAY_MS - 200);
}

// ─────────────────────────────────────────────────────────────────────────────
//  BOMB — ANIMATION + COUNTDOWN
// ─────────────────────────────────────────────────────────────────────────────

function startBomb() {
  state.bombStart = Date.now();
  bombSparkle.classList.add("armed"); // starts the sparkle CSS animation
  bombExplosion.classList.remove("active");

  // shake() runs on every animation frame and computes the shake amplitude
  // based on how much time is left. We use a squared curve so the shaking
  // stays calm for most of the time and then ramps up sharply near the end.
  function shake() {
    const elapsed  = Date.now() - state.bombStart;
    const timeLeft = BOMB_DURATION_MS - elapsed;

    // Stop shaking if the time is up or the player already answered
    if (timeLeft <= 0 || state.answered) {
      bombContainer.style.transform = "";
      return;
    }

    // intensity goes from 0 (calm) to 1 (max shake) as the deadline approaches
    const intensity = Math.max(0, Math.min(1, 1 - timeLeft / SHAKE_RAMP_MS));
    const amp = 0.4 + intensity * intensity * 5.5;  // pixel amplitude
    const rot = intensity * intensity * 3.2;        // rotation amplitude (degrees)

    const dx = (Math.random() - 0.5) * amp;
    const dy = (Math.random() - 0.5) * amp;
    const r  = (Math.random() - 0.5) * rot;
    bombContainer.style.transform = `translate(${dx.toFixed(2)}px,${dy.toFixed(2)}px) rotate(${r.toFixed(2)}deg)`;

    // Queue the next frame
    state.bombRaf = requestAnimationFrame(shake);
  }
  state.bombRaf = requestAnimationFrame(shake);

  // If the player doesn't answer in time, we trigger the explosion
  state.bombTimer = setTimeout(() => {
    if (!state.answered) {
      state.answered = true;
      triggerExplosion();
    }
  }, BOMB_DURATION_MS);
}

// Cancel both the rAF loop and the explosion timeout
function stopBomb() {
  cancelAnimationFrame(state.bombRaf);
  clearTimeout(state.bombTimer);
  bombContainer.style.transform = "";
  bombSparkle.classList.remove("armed");
}

// Time's up — show the explosion, deduct a life, then show the anecdote
function triggerExplosion() {
  stopBomb();
  const q = state.questions[state.index];
  bombExplosion.classList.add("active"); // triggers the CSS explosion animation

  state.lives--;
  state.streak = 0;
  updateLives();
  showFeedback("💥 Temps écoulé !", "wrong");
  state.times.push(BOMB_DURATION_MS); // count the full time as "time taken"

  // Wait for the explosion animation to play, then continue
  setTimeout(() => {
    bombExplosion.classList.remove("active");
    if (q && q.anecdote) {
      showAnecdotePopup(q.anecdote);
    } else {
      advanceQuestion();
    }
  }, REVEAL_DELAY_MS);
}

// ─────────────────────────────────────────────────────────────────────────────
//  RESULTS SCREEN
// ─────────────────────────────────────────────────────────────────────────────
function showResults() {
  stopBomb(); // safety — make sure no bomb is still ticking
  showState("results");

  const total   = state.questions.length;
  const correct = state.correct;
  const wrong   = total - correct;

  resultsScore.textContent = `${correct}/${total}`;

  // We pick a label based on the score
  if (correct >= 8) {
    resultsLabel.textContent = "🎉 Excellent !";
    spawnConfetti(); // reward the player with a confetti shower
  } else if (correct >= 5) {
    resultsLabel.textContent = "👍 Pas mal !";
  } else {
    resultsLabel.textContent = "💪 Continue à t'entraîner !";
  }

  statStreak.textContent = state.maxStreak;

  // Average response time across all questions
  const avgMs = state.times.length
    ? state.times.reduce((a, b) => a + b, 0) / state.times.length
    : 0;
  statTime.textContent = (avgMs / 1000).toFixed(1) + "s";

  drawPieChart(correct, wrong);
}

// We draw a donut chart on the <canvas> using the Canvas 2D API.
// The chart shows the correct/wrong ratio with a percentage in the centre.
function drawPieChart(correct, wrong) {
  const ctx   = resultsChart.getContext("2d");
  const total = correct + wrong;
  const cx = 90, cy = 90, r = 80; // centre and radius of the donut
  ctx.clearRect(0, 0, 180, 180);

  if (total === 0) return;

  // Helper to draw one slice of the pie
  function arc(start, end, color) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, end);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    // We read the CSS variable so the stroke colour matches the current theme
    ctx.strokeStyle = getComputedStyle(document.documentElement)
      .getPropertyValue("--paper").trim() || "#fafaf7";
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  // We start at the top (−π/2) and go clockwise for the correct slice,
  // then fill the remainder with the wrong slice
  const correctAngle = (correct / total) * Math.PI * 2;
  arc(-Math.PI / 2, -Math.PI / 2 + correctAngle, "#0a8a0a");
  arc(-Math.PI / 2 + correctAngle, -Math.PI / 2 + Math.PI * 2, "#cc3333");

  // Draw a filled circle in the middle to create the donut hole
  ctx.beginPath();
  ctx.arc(cx, cy, 46, 0, Math.PI * 2);
  ctx.fillStyle = getComputedStyle(document.documentElement)
    .getPropertyValue("--paper").trim() || "#fafaf7";
  ctx.fill();

  // Print the percentage inside the hole
  ctx.font         = "bold 24px 'Caveat', cursive";
  ctx.fillStyle    = getComputedStyle(document.documentElement)
    .getPropertyValue("--ink").trim() || "#1a1a1a";
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(Math.round((correct / total) * 100) + "%", cx, cy);
}

// ─────────────────────────────────────────────────────────────────────────────
//  CONFETTI
//  We generate 60 small div elements with randomised positions, sizes, colours,
//  and animation durations, then let a CSS @keyframes handle the falling effect.
//  Each piece removes itself from the DOM when its animation ends.
// ─────────────────────────────────────────────────────────────────────────────
function spawnConfetti() {
  const COLORS = ["#E53935","#0a8a0a","#f5a524","#3b82f6","#a855f7","#ec4899"];
  for (let i = 0; i < 60; i++) {
    const el = document.createElement("div");
    el.className                = "confetti-piece";
    el.style.left               = Math.random() * 100 + "vw";
    el.style.top                = "-10px";
    el.style.background         = COLORS[Math.floor(Math.random() * COLORS.length)];
    el.style.width              = (6 + Math.random() * 8) + "px";
    el.style.height             = (6 + Math.random() * 8) + "px";
    el.style.animationDuration  = (1.5 + Math.random() * 2) + "s";
    el.style.animationDelay     = (Math.random() * 0.8) + "s";
    document.body.appendChild(el);
    // Clean up the DOM automatically once the piece has fallen off-screen
    el.addEventListener("animationend", () => el.remove());
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  MISC LISTENERS
// ─────────────────────────────────────────────────────────────────────────────

// "Play again" just goes back to the config screen; state resets on startQuiz()
replayBtn.addEventListener("click", () => showState("config"));

// Highlight the current page link in the nav
document.querySelectorAll(".sk-nav-links a").forEach(a => {
  if (a.href === location.href) a.classList.add("active");
});
