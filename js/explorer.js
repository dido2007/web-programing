"use strict";

// ─────────────────────────────────────────────────────────────────────────────
//  MATHEMATICAL EXPRESSION PARSER  (no eval — safe by design)
//
//  We wrote a recursive descent parser that converts a string like "sin(x)^2"
//  into a JavaScript function. The grammar has four levels of precedence:
//
//    expr   →  term   (('+' | '−') term)*       lowest precedence
//    term   →  factor (('*' | '/') factor)*
//    factor →  base   ('^' factor)?             right-associative
//    base   →  '-' base | '(' expr ')' | func '(' expr ')' | number | 'x'
//
//  Each parsing function returns a compiled JS function f(x) → number,
//  so we can evaluate the expression at thousands of x values very quickly.
// ─────────────────────────────────────────────────────────────────────────────

function parse(src) {
  // Pre-process the input: normalise spacing, ** → ^, implicit multiplication
  let s = src
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/\*\*/g, "^")           // Python-style ** becomes ^
    .replace(/(\d)(x|\()/g, "$1*$2") // "2x" → "2*x", "2(" → "2*("
    .replace(/(x)(\()/g,  "$1*$2");  // "x(" → "x*("

  let pos = 0; // current position in the string

  function peek()    { return s[pos]; }
  function consume() { return s[pos++]; }
  function expect(c) {
    if (s[pos] !== c) throw new Error(`Attendu '${c}', trouvé '${s[pos] || "fin"}'`);
    pos++;
  }

  // --- Grammar rules, from lowest to highest precedence ---

  function parseExpr() {
    let left = parseTerm();
    // We loop to handle chains like "a + b - c + d"
    while (pos < s.length && (peek() === "+" || peek() === "-")) {
      const op    = consume();
      const right = parseTerm();
      const l     = left; // capture in closure before reassigning
      if (op === "+") left = x => l(x) + right(x);
      else            left = x => l(x) - right(x);
    }
    return left;
  }

  function parseTerm() {
    let left = parseFactor();
    while (pos < s.length && (peek() === "*" || peek() === "/")) {
      const op    = consume();
      const right = parseFactor();
      const l     = left;
      if (op === "*") left = x => l(x) * right(x);
      // Division: we return NaN for x/0 to avoid crashing the draw loop
      else            left = x => { const d = right(x); return d === 0 ? NaN : l(x) / d; };
    }
    return left;
  }

  function parseFactor() {
    const base = parseBase();
    // ^ is right-associative: "2^3^2" = "2^(3^2)" = 512
    if (pos < s.length && peek() === "^") {
      consume();
      const exp = parseFactor(); // recursive call for right-associativity
      return x => Math.pow(base(x), exp(x));
    }
    return base;
  }

  // All supported built-in functions mapped to their Math equivalents
  const FUNCS = {
    sin: Math.sin, cos: Math.cos, tan: Math.tan,
    asin: Math.asin, acos: Math.acos, atan: Math.atan,
    exp: Math.exp,
    log: Math.log,  // we treat log as ln (natural log)
    ln:  Math.log,
    log10: Math.log10,
    sqrt: Math.sqrt, abs: Math.abs,
    floor: Math.floor, ceil: Math.ceil, round: Math.round, sign: Math.sign,
  };

  function parseBase() {
    if (pos >= s.length) throw new Error("Expression incomplète");

    // Unary minus: "-sin(x)" → negate whatever comes next
    if (peek() === "-") {
      consume();
      const inner = parseBase();
      return x => -inner(x);
    }

    // Parenthesised sub-expression
    if (peek() === "(") {
      consume();
      const inner = parseExpr();
      expect(")");
      return inner;
    }

    // Named constants and function calls
    if (/[a-z]/.test(peek())) {
      let name = "";
      while (pos < s.length && /[a-z0-9_]/.test(peek())) name += consume();

      if (name === "x")                    return _x => _x;          // the variable
      if (name === "pi" || name === "π")  return ()  => Math.PI;
      if (name === "e")                    return ()  => Math.E;

      // Function call: name must be in FUNCS and must be followed by "("
      if (FUNCS[name]) {
        expect("(");
        const arg = parseExpr();
        expect(")");
        const fn = FUNCS[name];
        return x => fn(arg(x));
      }
      throw new Error(`Fonction inconnue : ${name}`);
    }

    // Numeric literal (integer or decimal)
    if (/[\d.]/.test(peek())) {
      let num = "";
      while (pos < s.length && /[\d.]/.test(peek())) num += consume();
      const val = parseFloat(num);
      if (isNaN(val)) throw new Error(`Nombre invalide : ${num}`);
      return () => val; // constant function
    }

    throw new Error(`Caractère inattendu : '${peek()}'`);
  }

  const fn = parseExpr();
  // Make sure we consumed the whole string — leftover characters mean a syntax error
  if (pos < s.length) throw new Error(`Caractère inattendu : '${s[pos]}'`);
  return fn;
}

// ─────────────────────────────────────────────────────────────────────────────
//  PLOTTER STATE
// ─────────────────────────────────────────────────────────────────────────────

const canvas   = document.getElementById("graph-canvas");
const ctx      = canvas.getContext("2d");
const errorEl  = document.getElementById("explorer-error");
const coordsEl = document.getElementById("canvas-coords");
const fnList   = document.getElementById("fn-list");      // container for function rows
const addFnBtn = document.getElementById("add-fn-btn");   // "+ Add function" button

// The default view window — [-5, 5] on both axes.
// We keep it in a constant so the Reset button can always return to it.
const DEFAULT_VIEW = { xMin: -5, xMax: 5, yMin: -3.5, yMax: 3.5 };
let view = { ...DEFAULT_VIEW };

// Six distinct colours for the function curves — one per function slot
const PALETTE = ["#E53935", "#1976D2", "#388E3C", "#F57C00", "#7B1FA2", "#00838F"];

// Each entry: { expr: string, color: string, fn: compiled function | null }
let functions = [];

let debounceTimer = null; // used to avoid compiling on every keystroke

// ─────────────────────────────────────────────────────────────────────────────
//  COORDINATE CONVERSION
//  We need to convert between "math space" (x, y) and "canvas pixel space"
//  constantly — for drawing and for the mouse coordinate display.
// ─────────────────────────────────────────────────────────────────────────────
function toCanvasX(x) { return (x - view.xMin) / (view.xMax - view.xMin) * canvas.width; }
function toCanvasY(y) { return (1 - (y - view.yMin) / (view.yMax - view.yMin)) * canvas.height; }
function toMathX(cx)  { return view.xMin + (cx / canvas.width)  * (view.xMax - view.xMin); }
function toMathY(cy)  { return view.yMin + (1 - cy / canvas.height) * (view.yMax - view.yMin); }

// Helper to read a CSS variable value — used for theme-aware colours
function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

// ─────────────────────────────────────────────────────────────────────────────
//  DRAW — redraws the entire canvas from scratch every time anything changes
// ─────────────────────────────────────────────────────────────────────────────
function draw() {
  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  // Read colours from CSS variables so we respect the current light/dark theme
  const ink      = cssVar("--ink")       || "#1a1a1a";
  const inkMuted = cssVar("--ink-muted") || "#888";
  const paper    = cssVar("--paper")     || "#fafaf7";

  // Fill the background
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, W, H);

  // ── Grid ──────────────────────────────────────────────────────────────────
  // We compute a "nice" step so the grid lines always land on round numbers
  ctx.strokeStyle = cssVar("--paper-2") || "#f2f0e8";
  ctx.lineWidth   = 1;

  const xStep = niceStep(view.xMax - view.xMin);
  const yStep = niceStep(view.yMax - view.yMin);

  for (let x = Math.ceil(view.xMin / xStep) * xStep; x <= view.xMax; x += xStep) {
    const cx = toCanvasX(x);
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke();
  }
  for (let y = Math.ceil(view.yMin / yStep) * yStep; y <= view.yMax; y += yStep) {
    const cy = toCanvasY(y);
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();
  }

  // ── Axes ──────────────────────────────────────────────────────────────────
  ctx.strokeStyle = inkMuted;
  ctx.lineWidth   = 1.5;

  // We clamp the axis position so it stays on-screen even when scrolled far away
  const axisY = Math.max(0, Math.min(H, toCanvasY(0)));
  ctx.beginPath(); ctx.moveTo(0, axisY); ctx.lineTo(W, axisY); ctx.stroke();

  const axisX = Math.max(0, Math.min(W, toCanvasX(0)));
  ctx.beginPath(); ctx.moveTo(axisX, 0); ctx.lineTo(axisX, H); ctx.stroke();

  // ── Tick marks and labels ─────────────────────────────────────────────────
  ctx.fillStyle    = inkMuted;
  ctx.font         = `11px 'JetBrains Mono', monospace`;
  ctx.textAlign    = "center";
  ctx.textBaseline = "top";

  // X-axis labels (skip the origin to avoid clutter)
  for (let x = Math.ceil(view.xMin / xStep) * xStep; x <= view.xMax; x += xStep) {
    if (Math.abs(x) < xStep * 0.01) continue;
    const cx = toCanvasX(x);
    ctx.beginPath(); ctx.moveTo(cx, axisY - 4); ctx.lineTo(cx, axisY + 4);
    ctx.strokeStyle = inkMuted; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillText(fmt(x), cx, axisY + 6);
  }

  // Y-axis labels
  ctx.textAlign    = "right";
  ctx.textBaseline = "middle";
  for (let y = Math.ceil(view.yMin / yStep) * yStep; y <= view.yMax; y += yStep) {
    if (Math.abs(y) < yStep * 0.01) continue;
    const cy = toCanvasY(y);
    ctx.beginPath(); ctx.moveTo(axisX - 4, cy); ctx.lineTo(axisX + 4, cy);
    ctx.strokeStyle = inkMuted; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillText(fmt(y), axisX - 7, cy);
  }

  // Origin label
  ctx.textAlign = "right"; ctx.textBaseline = "top";
  ctx.fillText("0", axisX - 5, axisY + 4);

  // ── Curves — one per function ──────────────────────────────────────────────
  functions.forEach(entry => {
    if (!entry.fn) return; // skip functions that failed to compile
    drawCurve(entry.fn, entry.color);
  });
}

// Plots a single function curve in the given colour
function drawCurve(fn, color) {
  const W     = canvas.width;
  const STEPS = W * 2; // we oversample (2 points per pixel) for a smooth curve

  ctx.strokeStyle = color;
  ctx.lineWidth   = 2.5;
  ctx.lineJoin    = "round";
  ctx.lineCap     = "round";

  let drawing = false; // whether we've started the current path segment
  let prevY   = null;  // previous y value — used for discontinuity detection

  ctx.beginPath();
  for (let i = 0; i <= STEPS; i++) {
    const mathX = toMathX(i / STEPS * W);
    let mathY;
    try { mathY = fn(mathX); } catch (_) { mathY = NaN; }

    // If the value is undefined/infinite we lift the pen (discontinuity)
    if (!isFinite(mathY) || isNaN(mathY)) {
      drawing = false; prevY = null; continue;
    }

    // We also lift the pen for very large jumps (e.g. tan asymptotes, 1/x)
    if (prevY !== null && Math.abs(mathY - prevY) > (view.yMax - view.yMin) * 1.5) {
      drawing = false;
    }
    prevY = mathY;

    const cy = toCanvasY(mathY);
    if (!drawing) { ctx.moveTo(i / STEPS * W, cy); drawing = true; }
    else          { ctx.lineTo(i / STEPS * W, cy); }
  }
  ctx.stroke();
}

// Format a number for axis labels: integers stay as-is, decimals get 2 places
function fmt(n) {
  if (Number.isInteger(n)) return String(n);
  return parseFloat(n.toFixed(2)).toString();
}

// Pick a "nice" grid step for a given range (e.g. range=10 → step=1 or 2)
function niceStep(range) {
  const raw  = range / 8; // we want roughly 8 grid lines across the screen
  const mag  = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  if (norm < 1.5) return mag;
  if (norm < 3.5) return 2 * mag;
  if (norm < 7.5) return 5 * mag;
  return 10 * mag;
}

// ─────────────────────────────────────────────────────────────────────────────
//  FUNCTION LIST MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

// Try to compile an expression; return null on error (we handle errors in the UI)
function compileFn(expr) {
  if (!expr.trim()) return null;
  try { return parse(expr); }
  catch (_) { return null; }
}

function showError(msg) {
  errorEl.textContent = msg ? "⚠ " + msg : "";
}

// Add a new function entry to the array and create its UI row
function addFunction(expr = "", color = null) {
  const idx   = functions.length;
  const clr   = color || PALETTE[idx % PALETTE.length];
  const entry = { expr, color: clr, fn: compileFn(expr) };
  functions.push(entry);
  renderFnRow(idx);
  draw();
}

// Rebuild all rows from scratch (called after removing a function)
function renderFnList() {
  fnList.innerHTML = "";
  functions.forEach((_, i) => renderFnRow(i));
}

// Create the DOM row for a function at index idx:
//   [● colour dot]  [f(x) =]  [input field]  [✕ delete]
function renderFnRow(idx) {
  // Remove an existing row for this index if we're updating it
  const existing = fnList.querySelector(`[data-fn-idx="${idx}"]`);
  if (existing) existing.remove();

  const entry = functions[idx];
  const row   = document.createElement("div");
  row.className    = "fn-row";
  row.dataset.fnIdx = idx;

  // Colour dot — clicking it cycles to the next colour in the palette
  const dot = document.createElement("button");
  dot.className        = "fn-color-dot";
  dot.style.background = entry.color;
  dot.title            = "Changer la couleur";
  dot.type             = "button";
  dot.addEventListener("click", () => {
    const current = PALETTE.indexOf(entry.color);
    entry.color   = PALETTE[(current + 1) % PALETTE.length];
    dot.style.background = entry.color;
    draw(); // re-render with the new curve colour
  });

  // "f(x) =" label
  const label       = document.createElement("span");
  label.className   = "fn-label";
  label.textContent = "f(x) =";

  // Expression input — we debounce compilation so we don't parse on every keystroke
  const input        = document.createElement("input");
  input.type         = "text";
  input.className    = "fn-input";
  input.value        = entry.expr;
  input.placeholder  = "sin(x)";
  input.autocomplete = "off";
  input.spellcheck   = false;
  input.addEventListener("input", () => {
    entry.expr = input.value;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      showError("");
      try {
        entry.fn = compileFn(entry.expr);
        draw();
      } catch (e) {
        entry.fn = null;
        draw();
        showError(e.message);
      }
    }, 200); // 200 ms debounce
  });

  // Delete button — removes this function from the array and rebuilds the UI
  const del     = document.createElement("button");
  del.className = "fn-delete";
  del.type      = "button";
  del.title     = "Supprimer";
  del.textContent = "✕";
  del.addEventListener("click", () => {
    functions.splice(idx, 1);
    renderFnList(); // rebuild all rows because indices shifted
    draw();
  });

  row.appendChild(dot);
  row.appendChild(label);
  row.appendChild(input);
  row.appendChild(del);
  fnList.appendChild(row);
}

// "+ Add a function" button — uses the next colour in the palette
addFnBtn.addEventListener("click", () => {
  addFunction("", PALETTE[functions.length % PALETTE.length]);
});

// Example chips: clicking one replaces the last function's expression
document.querySelectorAll(".example-chip").forEach(chip => {
  chip.addEventListener("click", () => {
    if (functions.length === 0) {
      addFunction(chip.dataset.fn, PALETTE[0]);
    } else {
      const idx           = functions.length - 1;
      functions[idx].expr = chip.dataset.fn;
      functions[idx].fn   = compileFn(chip.dataset.fn);
      renderFnList(); // refresh the input fields to show the new expression
      draw();
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  ZOOM + PAN
// ─────────────────────────────────────────────────────────────────────────────

// Zoom by a factor around an optional pivot point (math coordinates).
// If no pivot is given, we zoom around the centre of the view.
function zoom(factor, pivotMathX, pivotMathY) {
  const mx = pivotMathX !== undefined ? pivotMathX : (view.xMin + view.xMax) / 2;
  const my = pivotMathY !== undefined ? pivotMathY : (view.yMin + view.yMax) / 2;
  // We scale each edge relative to the pivot so the pivot stays fixed on screen
  view = {
    xMin: mx - (mx - view.xMin) * factor,
    xMax: mx + (view.xMax - mx) * factor,
    yMin: my - (my - view.yMin) * factor,
    yMax: my + (view.yMax - my) * factor,
  };
  draw();
}

document.getElementById("zoom-in").addEventListener("click",    () => zoom(0.65));
document.getElementById("zoom-out").addEventListener("click",   () => zoom(1.55));
document.getElementById("zoom-reset").addEventListener("click", () => {
  view = { ...DEFAULT_VIEW };
  draw();
});

// Mouse wheel zoom — we zoom around the point under the cursor so that
// the point doesn't jump, which feels much more natural than zooming to centre
canvas.addEventListener("wheel", e => {
  e.preventDefault();
  const factor = e.deltaY > 0 ? 1.15 : 0.87;
  const rect   = canvas.getBoundingClientRect();
  // Convert mouse position to math coordinates before we change the view
  const mx = toMathX((e.clientX - rect.left)  * (canvas.width  / rect.width));
  const my = toMathY((e.clientY - rect.top)   * (canvas.height / rect.height));
  zoom(factor, mx, my);
}, { passive: false }); // we need preventDefault so the page doesn't scroll

// ── Pan (click and drag) ──────────────────────────────────────────────────────
let dragging  = false;
let dragStart = null; // stores the initial mouse position and view state

canvas.addEventListener("mousedown", e => {
  dragging  = true;
  dragStart = { x: e.offsetX, y: e.offsetY, view: { ...view } };
});

canvas.addEventListener("mousemove", e => {
  // Always show coordinates under the cursor
  const mx = toMathX(e.offsetX * (canvas.width  / canvas.offsetWidth));
  const my = toMathY(e.offsetY * (canvas.height / canvas.offsetHeight));
  coordsEl.textContent = `x = ${mx.toFixed(3)},  y = ${my.toFixed(3)}`;

  if (!dragging || !dragStart) return;

  // Compute how many math units the mouse has moved since drag started
  const dx = (e.offsetX - dragStart.x) / canvas.offsetWidth  * (view.xMax - view.xMin);
  const dy = (e.offsetY - dragStart.y) / canvas.offsetHeight * (view.yMax - view.yMin);

  // We shift from the saved view state (not the current one) to avoid drift
  view = {
    xMin: dragStart.view.xMin - dx,
    xMax: dragStart.view.xMax - dx,
    yMin: dragStart.view.yMin + dy, // y is inverted: dragging down increases yMin
    yMax: dragStart.view.yMax + dy,
  };
  draw();
});

canvas.addEventListener("mouseup",    () => { dragging = false; });
canvas.addEventListener("mouseleave", () => { dragging = false; coordsEl.textContent = ""; });

// ─────────────────────────────────────────────────────────────────────────────
//  RESPONSIVE CANVAS
//  We size the canvas to match its container width and keep a 3:2 aspect ratio.
//  We also account for devicePixelRatio so the canvas stays sharp on Retina
//  screens (we render at double resolution and scale down with CSS).
// ─────────────────────────────────────────────────────────────────────────────
function resizeCanvas() {
  const rect  = canvas.parentElement.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  const w     = Math.floor(rect.width);
  const h     = Math.floor(w * (2 / 3)); // 3:2 aspect ratio

  // Internal resolution (high-DPI)
  canvas.width  = w * ratio;
  canvas.height = h * ratio;

  // CSS display size (what the user sees)
  canvas.style.width  = w + "px";
  canvas.style.height = h + "px";

  ctx.scale(ratio, ratio); // scale context so our coordinates stay in CSS pixels
  draw();
}

// Debounce the resize handler so we don't redraw on every pixel of resizing
window.addEventListener("resize", () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(resizeCanvas, 100);
});

// When the user toggles dark/light mode, we need to redraw with the new colours
const themeBtn = document.getElementById("theme-toggle");
if (themeBtn) themeBtn.addEventListener("click", () => setTimeout(draw, 50));

// ─────────────────────────────────────────────────────────────────────────────
//  INIT
// ─────────────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  resizeCanvas();
  // Start with one function (sin) in the first palette colour
  addFunction("sin(x)", PALETTE[0]);

  // Highlight the active nav link
  document.querySelectorAll(".sk-nav-links a").forEach(a => {
    if (a.href === location.href) a.classList.add("active");
  });
});
