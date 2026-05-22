"use strict";

// ─────────────────────────────────────────────────────────────────────────────
//  PUZZLE BANK
//  Each puzzle is a self-contained object:
//    - histoire   : the narrative text the player reads
//    - question   : the specific question to answer
//    - reponse    : the expected answer (string, compared after normalisation)
//    - indice     : a hint that reveals the algebraic setup without giving away
//                   the answer
//    - explication: a step-by-step solution shown after the player answers
//    - difficulte : 1 = easy, 2 = medium, 3 = hard
//    - personnages: emoji used in the card header to set the scene
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
//  DIFFICULTY GUIDE
//
//  difficulte = 1  →  Première / Terminale (age 17–18)
//                     Quadratic equations, arithmetic & geometric sequences,
//                     derivatives (tangent slope), exponential models.
//
//  difficulte = 2  →  Advanced Terminale / début L1
//                     Viète's formulas, optimisation with derivatives,
//                     geometric-sequence term count, conditional probability.
//
//  difficulte = 3  →  L1 / L2 university
//                     Integration by parts, L'Hôpital's rule,
//                     function extrema with second derivative.
// ─────────────────────────────────────────────────────────────────────────────
const DEVINETTES = [

  // ── DIFFICULTÉ 1 — Première / Terminale ──────────────────────────────────

  {
    id: 1,
    titre: "Le saut de skateboard",
    histoire: `Axel fait du skateboard sur une rampe de compétition. Son coach modélise la hauteur de sa trajectoire (en mètres) par la fonction h(t) = −5t² + 20t, où t est le temps en secondes depuis le décollage. À t = 0, Axel quitte la rampe au niveau du sol.`,
    question: "Après combien de secondes Axel retouche-t-il le sol ?",
    reponse: "4",
    indice: "Résous h(t) = 0 : factorise −5t² + 20t = −5t(t − ?) = 0.",
    explication: "h(t) = −5t² + 20t = −5t(t − 4) = 0\nt = 0 (décollage) ou t = 4 (atterrissage).\nAxel retouche le sol après 4 secondes.\nAu sommet (t = 2) : h(2) = −20 + 40 = 20 m.",
    difficulte: 1,
    personnages: ["🛹", "🧑‍🎤"],
    theme: "physique"
  },
  {
    id: 2,
    titre: "L'entraînement de Léa",
    histoire: `Léa prépare le marathon de Paris. Le lundi de sa première semaine d'entraînement, elle court 2 km. Chaque jour suivant, elle ajoute 1 km à sa distance. Elle court 7 jours de suite, du lundi au dimanche.`,
    question: "Combien de kilomètres Léa a-t-elle courus au total sur les 7 jours ?",
    reponse: "35",
    indice: "Suite arithmétique de raison 1 et premier terme 2. Somme = n/2 × (u₁ + u₇).",
    explication: "u₁ = 2 km, u₇ = 2 + 6×1 = 8 km.\nSomme = n/2 × (u₁ + uₙ) = 7/2 × (2 + 8) = 7/2 × 10 = 35 km.",
    difficulte: 1,
    personnages: ["🏃‍♀️", "📅"],
    theme: "sport"
  },
  {
    id: 3,
    titre: "La bactérie de Tom",
    histoire: `Le professeur de biologie de Tom montre en TP qu'une bactérie E. coli se divise en deux toutes les heures dans des conditions idéales. À 8h00, Tom observe exactement 1 bactérie dans sa boîte de Petri.`,
    question: "Combien de bactéries Tom observe-t-il à 13h00 ?",
    reponse: "32",
    indice: "Suite géométrique de premier terme 1 et de raison 2. Après 5 heures : 2⁵ = ?",
    explication: "Après n heures : 2ⁿ bactéries.\nDe 8h à 13h → 5 heures.\n2⁵ = 32 bactéries.\nAprès 10h on aurait 2¹⁰ = 1024 — la croissance exponentielle est fulgurante !",
    difficulte: 1,
    personnages: ["🔬", "🧫"],
    theme: "biologie"
  },
  {
    id: 4,
    titre: "La tangente de Mia",
    histoire: `Mia révise pour son bac de Terminale. Dans son devoir maison, elle doit trouver la pente de la droite tangente à la courbe de la fonction f(x) = x² − 4x + 1 au point d'abscisse x = 3.`,
    question: "Quelle est la pente de la tangente à la courbe de f en x = 3 ?",
    reponse: "2",
    indice: "La pente de la tangente en x₀ est f′(x₀). Calcule d'abord la dérivée de f.",
    explication: "f′(x) = 2x − 4  (règle des puissances).\nf′(3) = 2×3 − 4 = 6 − 4 = 2.\nÉquation de la tangente : y − f(3) = 2(x − 3).\nf(3) = 9 − 12 + 1 = −2, donc y = 2x − 8.",
    difficulte: 1,
    personnages: ["📐", "👩‍🎓"],
    theme: "dérivées"
  },

  // ── DIFFICULTÉ 2 — Terminale avancé / début L1 ────────────────────────────

  {
    id: 5,
    titre: "Les formules de Viète",
    histoire: `Paul prépare le concours de Sciences Po. En cours de maths, il tombe sur l'équation 2x² − 7x + 3 = 0 et doit trouver rapidement la somme des deux solutions sans les calculer explicitement. Son professeur lui rappelle les formules de Viète.`,
    question: "Quelle est la somme des deux solutions de 2x² − 7x + 3 = 0 ?",
    reponse: "3.5",
    indice: "Formule de Viète : si ax² + bx + c = 0, alors x₁ + x₂ = −b/a. Ici a = 2, b = −7.",
    explication: "Formule de Viète : x₁ + x₂ = −b/a = −(−7)/2 = 7/2 = 3,5.\nVérification : Δ = 49 − 24 = 25. x₁ = (7+5)/4 = 3, x₂ = (7−5)/4 = 0,5.\n3 + 0,5 = 3,5 ✓",
    difficulte: 2,
    personnages: ["📏", "🧑‍💻"],
    theme: "algèbre"
  },
  {
    id: 6,
    titre: "La start-up de Camille",
    histoire: `La start-up de Camille développe une appli de maths. Son chiffre d'affaires est multiplié par 1,5 chaque trimestre. Au premier trimestre, le CA est de 50 000 €. Les investisseurs veulent savoir à partir de quel trimestre le CA dépassera 250 000 €.`,
    question: "À partir de quel trimestre le CA dépasse-t-il 250 000 € pour la première fois ?",
    reponse: "4",
    indice: "50 000 × 1,5ⁿ > 250 000 → 1,5ⁿ > 5. Teste n = 3 (1,5³ = 3,375) puis n = 4.",
    explication: "n=3 : 50 000 × 1,5³ = 50 000 × 3,375 = 168 750 < 250 000\nn=4 : 50 000 × 1,5⁴ = 50 000 × 5,0625 = 253 125 > 250 000 ✓\nDès le 4ème trimestre.",
    difficulte: 2,
    personnages: ["📈", "💼"],
    theme: "suites géométriques"
  },
  {
    id: 7,
    titre: "La fusée de Mohamed",
    histoire: `Mohamed fait des sciences physiques en Terminale. La position (en mètres) d'un modèle de fusée est donnée par s(t) = 30t − 5t², où t est le temps en secondes. Pour son compte-rendu, il doit trouver l'instant où la fusée atteint son altitude maximale.`,
    question: "Après combien de secondes la fusée atteint-elle son altitude maximale ?",
    reponse: "3",
    indice: "À l'altitude maximale, la vitesse est nulle. La vitesse instantanée = s′(t). Résous s′(t) = 0.",
    explication: "s′(t) = 30 − 10t.\ns′(t) = 0 → t = 3 secondes.\nAltitude maximale : s(3) = 90 − 45 = 45 m.\nAprès t = 3, la fusée redescend car s′(t) < 0.",
    difficulte: 2,
    personnages: ["🚀", "👨‍🔬"],
    theme: "physique"
  },
  {
    id: 8,
    titre: "L'urne de Sophie",
    histoire: `Sophie révise les probabilités pour son bac. Une urne contient 3 boules rouges et 2 boules bleues. On tire deux boules l'une après l'autre sans remise. Elle veut compter les façons d'obtenir deux boules de la même couleur.`,
    question: "Combien y a-t-il de façons d'obtenir 2 boules de la même couleur (parmi les C(5,2)=10 tirages possibles) ?",
    reponse: "4",
    indice: "Paires de même couleur : C(3,2) paires rouges + C(2,2) paires bleues.",
    explication: "C(5,2) = 10 tirages non ordonnés au total.\nPaires rouges : C(3,2) = 3 façons.\nPaires bleues : C(2,2) = 1 façon.\nTotal même couleur : 3 + 1 = 4 façons.\nProbabilité = 4/10 = 2/5.",
    difficulte: 2,
    personnages: ["🔴", "🔵"],
    theme: "probabilités"
  },

  // ── DIFFICULTÉ 3 — L1 / L2 ────────────────────────────────────────────────

  {
    id: 9,
    titre: "L'intégrale de Théo",
    histoire: `Théo est en première année de licence de mathématiques. Son professeur demande de calculer ∫₀¹ x·eˣ dx en utilisant l'intégration par parties. Théo pose u = x et v′ = eˣ (donc u′ = 1 et v = eˣ) et applique la formule ∫ u·v′ = [u·v] − ∫ u′·v.`,
    question: "Quelle est la valeur exacte de ∫₀¹ x·eˣ dx ?",
    reponse: "1",
    indice: "IPP : [x·eˣ]₀¹ − ∫₀¹ eˣ dx. Calcule chaque terme séparément.",
    explication: "∫₀¹ x·eˣ dx = [x·eˣ]₀¹ − ∫₀¹ eˣ dx\n= (1·e − 0·e⁰) − [eˣ]₀¹\n= e − (e − 1) = 1.\nRésultat élégant : l'intégrale vaut exactement 1 !",
    difficulte: 3,
    personnages: ["∫", "👨‍🏫"],
    theme: "intégration par parties"
  },
  {
    id: 10,
    titre: "La règle de L'Hôpital",
    histoire: `Imane est étudiante en L1. Son professeur lui demande de calculer lim(x→0) sin(3x)/x. Elle reconnaît une forme indéterminée 0/0 et se souvient de la règle de L'Hôpital : si la limite donne 0/0, on peut dériver séparément le numérateur et le dénominateur.`,
    question: "Calculer lim(x→0) sin(3x) / x",
    reponse: "3",
    indice: "Applique L'Hôpital (dérive num. et dén.) ou pose u = 3x et utilise la limite fondamentale sin(u)/u → 1.",
    explication: "Méthode 1 (L'Hôpital) : lim sin(3x)/x = lim 3cos(3x)/1 = 3·cos(0) = 3.\nMéthode 2 : sin(3x)/x = 3·[sin(3x)/(3x)] → 3·1 = 3.\nLes deux méthodes donnent 3.",
    difficulte: 3,
    personnages: ["📊", "👩‍🔬"],
    theme: "limites"
  },
  {
    id: 11,
    titre: "L'optimisation de Nina",
    histoire: `Nina est étudiante en L1 d'économie-mathématiques. Elle doit maximiser le profit P(x) = −2x² + 12x − 10 (en milliers d'euros), où x est la quantité produite (en milliers d'unités). Elle cherche la quantité optimale en annulant la dérivée.`,
    question: "Pour quelle valeur de x le profit P(x) est-il maximal ?",
    reponse: "3",
    indice: "Calcule P′(x) et résous P′(x) = 0. Vérifie que P″(x) < 0 pour confirmer que c'est bien un maximum.",
    explication: "P′(x) = −4x + 12.\nP′(x) = 0 → x = 3.\nP″(x) = −4 < 0 → maximum confirmé.\nP(3) = −18 + 36 − 10 = 8 (milliers d'euros de profit maximal).",
    difficulte: 3,
    personnages: ["💹", "👩‍💼"],
    theme: "optimisation"
  }
];

// ─────────────────────────────────────────────────────────────────────────────
//  APP STATE
// ─────────────────────────────────────────────────────────────────────────────
let selectedDiff     = 1;    // currently selected difficulty filter
let currentDevinette = null; // the puzzle the player is solving right now
let hintShown        = false; // whether the hint is currently visible
let answered         = false; // prevents submitting the same puzzle twice

const $ = id => document.getElementById(id);

// ─────────────────────────────────────────────────────────────────────────────
//  DOM REFERENCES
// ─────────────────────────────────────────────────────────────────────────────

// The three "screens" — only one is visible at a time
const devMenu   = $("dev-menu");
const devPlay   = $("dev-play");
const devResult = $("dev-result");

// Menu screen
const diffOptions = $("dev-diff-options");
const devList     = $("dev-list");

// Play screen elements
const devStars      = $("dev-stars");
const devChars      = $("dev-characters");
const devStoryTitle = $("dev-story-title");
const devStoryText  = $("dev-story-text");
const devQText      = $("dev-question-text");

const devInput    = $("dev-input");
const devSubmit   = $("dev-submit");
const devHintBtn  = $("dev-hint-btn");
const devHintText = $("dev-hint-text");
const devFeedback = $("dev-feedback");

// Result screen elements
const devResultIcon  = $("dev-result-icon");
const devResultLabel = $("dev-result-label");
const devResultAns   = $("dev-result-answer");
const devExplText    = $("dev-explication-text");
const devRetryBtn    = $("dev-retry-btn");
const devMenuBtn     = $("dev-menu-btn");
const devBackBtn     = $("dev-back-btn");

// ─────────────────────────────────────────────────────────────────────────────
//  SCREEN SWITCHER
//  We manage three screens with a single "active" class, same pattern as quiz.js
// ─────────────────────────────────────────────────────────────────────────────
function showState(name) {
  [devMenu, devPlay, devResult].forEach(el => el.classList.remove("active"));
  if (name === "menu")   devMenu.classList.add("active");
  if (name === "play")   devPlay.classList.add("active");
  if (name === "result") devResult.classList.add("active");
}

// ─────────────────────────────────────────────────────────────────────────────
//  DIFFICULTY FILTER
//  We listen at the container level (event delegation) so we don't need one
//  listener per button. When a difficulty is selected, we rebuild the list.
// ─────────────────────────────────────────────────────────────────────────────
diffOptions.addEventListener("click", e => {
  const btn = e.target.closest("[data-diff]");
  if (!btn) return;
  diffOptions.querySelectorAll(".sk-btn").forEach(b => b.classList.remove("selected"));
  btn.classList.add("selected");
  selectedDiff = parseInt(btn.dataset.diff, 10);
  renderList();
});

// Build the clickable puzzle list based on the current difficulty filter
function renderList() {
  devList.innerHTML = "";

  // selectedDiff === 0 means "show all"
  const filtered = selectedDiff === 0
    ? DEVINETTES
    : DEVINETTES.filter(d => d.difficulte === selectedDiff);

  if (filtered.length === 0) {
    const li       = document.createElement("li");
    li.style.color = "var(--ink-muted)";
    li.style.fontFamily = "'JetBrains Mono', monospace";
    li.style.fontSize   = "0.85rem";
    li.style.padding    = "12px 0";
    li.textContent = "Aucune devinette pour ce niveau.";
    devList.appendChild(li);
    return;
  }

  filtered.forEach((dev, idx) => {
    const li     = document.createElement("li");
    li.className = "dev-list-item";
    const stars  = "⭐".repeat(dev.difficulte);
    li.innerHTML = `
      <span class="dev-list-num">${idx + 1}</span>
      <div class="dev-list-info">
        <div class="dev-list-title">${escHtml(dev.titre)}</div>
        <div class="dev-list-theme">${escHtml(dev.theme)}</div>
      </div>
      <span class="dev-list-stars">${stars}</span>
    `;
    li.addEventListener("click", () => startDevinette(dev));
    devList.appendChild(li);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  STARTING A PUZZLE
//  We populate the play screen with the selected puzzle's data, then reset
//  all UI state (input, feedback, hint) for a clean slate.
// ─────────────────────────────────────────────────────────────────────────────
function startDevinette(dev) {
  currentDevinette = dev;
  hintShown        = false;
  answered         = false;

  // Fill in the story card content
  devStars.textContent      = "⭐".repeat(dev.difficulte);
  devChars.textContent      = dev.personnages.join(" ");
  devStoryTitle.textContent = dev.titre;
  devStoryText.textContent  = dev.histoire;
  devQText.textContent      = dev.question;

  // Reset the answer zone
  devInput.value     = "";
  devInput.disabled  = false;
  devSubmit.disabled = false;

  // Reset hint and feedback
  devHintText.textContent = "";
  devHintBtn.textContent  = "💡 Indice";
  devFeedback.textContent = "";
  devFeedback.className   = "dev-feedback";

  showState("play");
  devInput.focus(); // let the player start typing immediately
}

// ─────────────────────────────────────────────────────────────────────────────
//  ANSWER CHECKING
//  We normalise both strings (whitespace, commas, case) before comparing
//  so minor formatting differences don't fail a correct answer.
// ─────────────────────────────────────────────────────────────────────────────
function checkAnswer() {
  if (answered) return; // prevent double submission
  const raw = devInput.value.trim();
  if (!raw) return;

  answered           = true;
  devInput.disabled  = true;
  devSubmit.disabled = true;

  const correct = normalizeAnswer(raw) === normalizeAnswer(currentDevinette.reponse);

  if (correct) {
    devFeedback.textContent = "✓ Bonne réponse !";
    devFeedback.className   = "dev-feedback correct";
  } else {
    devFeedback.textContent = `✗ Pas tout à fait… La réponse était ${currentDevinette.reponse}.`;
    devFeedback.className   = "dev-feedback wrong";
  }

  // Wait a moment so the player can read the feedback, then show the full explanation
  setTimeout(() => showResult(correct), 1200);
}

// Strip spaces, replace commas with dots, and lowercase before comparing
function normalizeAnswer(s) {
  return s.replace(/\s+/g, "").replace(/,/g, ".").toLowerCase();
}

// ─────────────────────────────────────────────────────────────────────────────
//  RESULT SCREEN
// ─────────────────────────────────────────────────────────────────────────────
function showResult(correct) {
  devResultIcon.textContent  = correct ? "🎉" : "💡";
  devResultLabel.textContent = correct ? "Bonne réponse !" : "Pas cette fois…";
  devResultLabel.className   = correct
    ? "dev-result-label correct"
    : "dev-result-label wrong";
  devResultAns.textContent  = `Réponse : ${currentDevinette.reponse}`;
  devExplText.textContent   = currentDevinette.explication;
  showState("result");
}

// ─────────────────────────────────────────────────────────────────────────────
//  HINT BUTTON
//  Clicking it toggles the hint text. We change the button label so the
//  player knows they can hide it again.
// ─────────────────────────────────────────────────────────────────────────────
devHintBtn.addEventListener("click", () => {
  if (!currentDevinette) return;
  hintShown               = !hintShown;
  devHintText.textContent = hintShown ? currentDevinette.indice : "";
  devHintBtn.textContent  = hintShown ? "💡 Masquer l'indice" : "💡 Indice";
});

// ─────────────────────────────────────────────────────────────────────────────
//  SUBMISSION EVENTS
// ─────────────────────────────────────────────────────────────────────────────
devSubmit.addEventListener("click", checkAnswer);
devInput.addEventListener("keydown", e => { if (e.key === "Enter") checkAnswer(); });

// ─────────────────────────────────────────────────────────────────────────────
//  NAVIGATION BETWEEN SCREENS
// ─────────────────────────────────────────────────────────────────────────────
devBackBtn.addEventListener("click", () => showState("menu"));

// "Try again" re-launches the same puzzle from scratch
devRetryBtn.addEventListener("click", () => {
  if (currentDevinette) startDevinette(currentDevinette);
});

// "Menu" goes back to the puzzle list
devMenuBtn.addEventListener("click", () => showState("menu"));

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────

// Prevent XSS when inserting user-controlled strings into innerHTML
function escHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ─────────────────────────────────────────────────────────────────────────────
//  INIT
// ─────────────────────────────────────────────────────────────────────────────
renderList(); // populate the menu with the default difficulty filter

// Highlight the current page link in the navigation bar
document.querySelectorAll(".sk-nav-links a").forEach(a => {
  if (a.href === location.href) a.classList.add("active");
});
