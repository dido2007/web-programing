"use strict";

// ─────────────────────────────────────────────────────────────────────────────
//  CALCULATOR STATE
//  We keep the current expression as a plain string and rebuild the display
//  from scratch every time it changes. Simple and easy to reason about.
// ─────────────────────────────────────────────────────────────────────────────
let expr    = "";   // the expression string the user is building
let history = [];   // last 10 evaluated expressions
const MAX_HISTORY = 10;

// ─────────────────────────────────────────────────────────────────────────────
//  DOM REFERENCES
// ─────────────────────────────────────────────────────────────────────────────
const exprEl   = document.getElementById("calc-expr");    // small expression preview
const resultEl = document.getElementById("calc-result");  // big result display
const historyEl = document.getElementById("calc-history"); // history list

// ─────────────────────────────────────────────────────────────────────────────
//  EVALUATION
//  We reuse the parse() function from explorer.js (loaded before this script).
//  The calculator doesn't use a variable x, so we call fn(0) — the function
//  with x replaced by 0, which means x never appears in valid calculator expressions.
// ─────────────────────────────────────────────────────────────────────────────
function evaluate(raw) {
  if (!raw.trim()) return null;

  // Clean up the display characters before passing to the parser
  let s = raw
    .replace(/÷/g, "/")  // display ÷ → parser /
    .replace(/×/g, "*")  // display × → parser *
    .replace(/−/g, "-"); // display − → parser -

  // Auto-close any unclosed parentheses so "sin(3" evaluates correctly
  const open  = (s.match(/\(/g) || []).length;
  const close = (s.match(/\)/g) || []).length;
  s += ")".repeat(Math.max(0, open - close));

  try {
    const fn  = parse(s);   // parse() comes from explorer.js
    const val = fn(0);      // evaluate at x=0 (no variable in calculator mode)
    if (!isFinite(val)) return "Erreur";
    return fmt(val);
  } catch (e) {
    return null; // parse error — we show "…" to indicate incomplete input
  }
}

// Format the result: use exponential notation for very large/small numbers
function fmt(n) {
  if (Math.abs(n) > 1e12 || (Math.abs(n) < 1e-8 && n !== 0)) {
    return n.toExponential(6).replace(/\.?0+e/, "e");
  }
  // toPrecision(10) then parseFloat trims trailing zeros cleanly
  return parseFloat(n.toPrecision(10)).toString();
}

// ─────────────────────────────────────────────────────────────────────────────
//  DISPLAY RENDERING
//  We re-render everything from the current `expr` string on every change.
// ─────────────────────────────────────────────────────────────────────────────
function render() {
  exprEl.textContent = expr || "";

  if (!expr) {
    // Empty expression — show 0 as a placeholder
    resultEl.textContent = "0";
    resultEl.classList.remove("error");
    return;
  }

  const val = evaluate(expr);

  if (val === null) {
    // Expression is syntactically incomplete — show a dots placeholder
    resultEl.textContent = "…";
    resultEl.classList.remove("error");
  } else if (val === "Erreur") {
    // Division by zero, asin out of range, etc.
    resultEl.textContent = "Erreur";
    resultEl.classList.add("error");
  } else {
    resultEl.textContent = val;
    resultEl.classList.remove("error");
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  INPUT ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

// Append a string to the current expression (digit, operator, function call…)
function insert(val) {
  expr += val;
  render();
}

// Delete the last character (backspace)
function del() {
  expr = expr.slice(0, -1);
  render();
}

// Clear the whole expression
function clear() {
  expr = "";
  render();
}

// Evaluate and record the result in the history, then start a new expression
// with the result so the user can chain calculations
function evalAndCommit() {
  if (!expr.trim()) return;
  const val = evaluate(expr);
  if (!val || val === "…") return; // don't commit incomplete expressions

  addHistory(expr, val);

  if (val !== "Erreur") {
    expr = val; // the result becomes the start of the next expression
  }
  render();
}

// ─────────────────────────────────────────────────────────────────────────────
//  HISTORY
//  We keep a capped list of the last MAX_HISTORY evaluations.
//  Clicking a history item recalls its result into the current expression.
// ─────────────────────────────────────────────────────────────────────────────
function addHistory(e, v) {
  history.unshift({ expr: e, val: v }); // newest first
  if (history.length > MAX_HISTORY) history.pop(); // keep the list capped
  renderHistory();
}

function renderHistory() {
  historyEl.innerHTML = "";

  if (history.length === 0) {
    const li       = document.createElement("li");
    li.className   = "calc-history-empty";
    li.textContent = "Aucun calcul encore";
    historyEl.appendChild(li);
    return;
  }

  history.forEach(item => {
    const li       = document.createElement("li");
    li.className   = "calc-history-item";
    li.title       = "Cliquer pour réutiliser";
    li.innerHTML   = `
      <span class="calc-history-expr">${escHtml(item.expr)}</span>
      <span class="calc-history-val">= ${escHtml(item.val)}</span>
    `;
    // Clicking a history entry loads its result into the calculator
    li.addEventListener("click", () => {
      expr = item.val;
      render();
    });
    historyEl.appendChild(li);
  });
}

// Escape HTML special characters before inserting user-supplied strings
function escHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ─────────────────────────────────────────────────────────────────────────────
//  BUTTON CLICK HANDLERS
//  Each button has a "data-action" attribute and either "data-val" or "data-fn".
//  We handle all buttons with a single delegated listener at the document level.
// ─────────────────────────────────────────────────────────────────────────────
document.querySelectorAll(".calc-btn").forEach(btn => {
  btn.setAttribute("type", "button"); // prevent form submission
  btn.addEventListener("click", () => {
    const action = btn.dataset.action;
    if      (action === "insert") insert(btn.dataset.val);
    else if (action === "fn")     insert(btn.dataset.fn);
    else if (action === "del")    del();
    else if (action === "clear")  clear();
    else if (action === "eval")   evalAndCommit();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  KEYBOARD SUPPORT
//  We map physical keys to calculator actions so the user can type expressions
//  without using the mouse at all.
// ─────────────────────────────────────────────────────────────────────────────
document.addEventListener("keydown", e => {
  // Ignore shortcuts that involve modifier keys (Ctrl+C, etc.)
  if (e.ctrlKey || e.metaKey || e.altKey) return;

  const key = e.key;
  if ("0123456789.+-*/^%()".includes(key)) { insert(key); return; }
  if (key === "Enter" || key === "=")       { evalAndCommit(); return; }
  if (key === "Backspace")                  { del(); return; }
  if (key === "Escape")                     { clear(); return; }
});

// ─────────────────────────────────────────────────────────────────────────────
//  INIT
// ─────────────────────────────────────────────────────────────────────────────
renderHistory(); // populate the "no calculations yet" placeholder

// Highlight the active nav link
document.querySelectorAll(".sk-nav-links a").forEach(a => {
  if (a.href === location.href) a.classList.add("active");
});
