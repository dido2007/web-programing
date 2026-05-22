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
const DEVINETTES = [
  {
    id: 1,
    titre: "La fête d'anniversaire",
    histoire: `Lucas organise une fête d'anniversaire. Il a invité ses amis de classe et ses amis du club de football. Il a invité exactement deux fois plus d'amis de classe que d'amis de football. En comptant les deux groupes, il y a 18 invités au total. Mais Lucas remarque aussi que ses amis de classe sont exactement 6 de plus que ses amis de football.`,
    question: "Combien d'amis de football Lucas a-t-il invités ?",
    reponse: "6",
    indice: "Appelle x le nombre d'amis de football. Les amis de classe = 2x. La somme x + 2x = 18.",
    explication: "Soit x le nombre d'amis de football.\nAmis de classe = 2x\nx + 2x = 18 → 3x = 18 → x = 6\nLucas a invité 6 amis de football (et 12 de classe).",
    difficulte: 1,
    personnages: ["🎂", "⚽"],
    theme: "fête"
  },
  {
    id: 2,
    titre: "Le marché de Marie",
    histoire: `Marie vend des fruits au marché du village. Ce matin, elle avait 120 pommes dans sa cagette. Elle a vendu les trois quarts de ses pommes avant midi. Après la pause déjeuner, elle a vendu encore 12 pommes supplémentaires.`,
    question: "Combien de pommes Marie a-t-il restées à la fin ?",
    reponse: "18",
    indice: "Trois quarts de 120 = ? Puis enlève encore 12.",
    explication: "Marie avait 120 pommes.\nElle vend ¾ × 120 = 90 pommes le matin.\nIl en reste 120 − 90 = 30 pommes.\nElle vend encore 12 → 30 − 12 = 18 pommes restantes.",
    difficulte: 1,
    personnages: ["👩‍🌾", "🍎"],
    theme: "commerce"
  },
  {
    id: 3,
    titre: "Le train d'Ahmed",
    histoire: `Ahmed doit prendre un train qui part à 14h35. Il habite à 8 km de la gare. Il marche à 4 km/h jusqu'à l'arrêt de bus, puis prend le bus qui roule à 30 km/h. L'arrêt de bus est à 2 km de chez lui. Il faut aussi compter 5 minutes d'attente pour le bus.`,
    question: "Combien de minutes de trajet Ahmed a-t-il en tout depuis chez lui jusqu'à la gare ?",
    reponse: "47",
    indice: "Temps à pied (2 km à 4 km/h) + attente 5 min + bus (6 km à 30 km/h).",
    explication: "Temps à pied : 2 ÷ 4 = 0,5 h = 30 min\nAttente bus : 5 min\nTrajet bus : 6 ÷ 30 = 0,2 h = 12 min\nTotal : 30 + 5 + 12 = 47 min\nAhmed doit partir au plus tard 47 minutes avant 14h35, soit à 13h48.",
    difficulte: 2,
    personnages: ["🧑‍💼", "🚌", "🚂"],
    theme: "transport"
  },
  {
    id: 4,
    titre: "Le jardin de Fatima",
    histoire: `Fatima veut clôturer son jardin rectangulaire. La longueur du jardin est le double de sa largeur. Le périmètre total est de 72 mètres. Elle a déjà acheté 50 mètres de clôture en solde.`,
    question: "Combien de mètres de clôture supplémentaires Fatima doit-elle acheter ?",
    reponse: "22",
    indice: "Périmètre = 2 × (longueur + largeur). La longueur = 2 × largeur.",
    explication: "Soit l la largeur. La longueur = 2l.\nPérimètre = 2(l + 2l) = 2 × 3l = 6l = 72\nDonc l = 12 m, longueur = 24 m.\nFatima a 50 m, il lui faut 72 − 50 = 22 m de plus.",
    difficulte: 1,
    personnages: ["👩‍🌱", "🌿"],
    theme: "géométrie"
  },
  {
    id: 5,
    titre: "Le tournoi de Thomas",
    histoire: `Thomas organise un petit tournoi de ping-pong dans son école. Chaque joueur affronte exactement une fois chacun des autres joueurs. À la fin, il y a eu 28 matchs en tout.`,
    question: "Combien de joueurs participaient au tournoi ?",
    reponse: "8",
    indice: "Le nombre de matchs dans un tournoi à n joueurs est n(n−1)/2.",
    explication: "Le nombre de matchs = n(n−1)/2 = 28\nn(n−1) = 56\nn = 8 car 8 × 7 = 56\nIl y avait 8 joueurs.",
    difficulte: 2,
    personnages: ["🏓", "🧑‍🤝‍🧑"],
    theme: "combinatoire"
  },
  {
    id: 6,
    titre: "L'épargne de Yasmine",
    histoire: `Yasmine économise de l'argent chaque semaine. La première semaine elle économise 2 €. Chaque semaine suivante, elle économise 3 € de plus que la semaine précédente. Après 8 semaines, elle regarde son compte.`,
    question: "Combien d'euros Yasmine a-t-elle économisés au total après 8 semaines ?",
    reponse: "100",
    indice: "C'est une suite arithmétique : 2, 5, 8, 11… La somme = n/2 × (premier + dernier terme).",
    explication: "Suite : 2, 5, 8, 11, 14, 17, 20, 23\nDernier terme = 2 + 7×3 = 23\nSomme = 8/2 × (2 + 23) = 4 × 25 = 100 €",
    difficulte: 2,
    personnages: ["👩‍💰", "💰"],
    theme: "suites"
  },
  {
    id: 7,
    titre: "La recette de Noah",
    histoire: `Noah fait des muffins pour toute sa classe. La recette pour 12 muffins demande : 200 g de farine, 3 œufs, 150 g de sucre, 100 ml de lait. Sa classe compte 30 élèves et il veut que chacun ait exactement 2 muffins et demi.`,
    question: "Combien de grammes de farine Noah a-t-il besoin au total ?",
    reponse: "1250",
    indice: "Combien de muffins au total ? Puis calcule le ratio par rapport à 12.",
    explication: "Nombre de muffins = 30 × 2,5 = 75 muffins.\nRatio = 75 / 12 = 6,25\nFarine = 200 × 6,25 = 1250 g",
    difficulte: 2,
    personnages: ["👨‍🍳", "🧁"],
    theme: "proportions"
  },
  {
    id: 8,
    titre: "Le défi de Camille",
    histoire: `Camille joue à un jeu de hasard. Elle lance deux dés à 6 faces équilibrés. Elle gagne si la somme des deux dés est strictement supérieure à 9.`,
    question: "Combien y a-t-il de combinaisons gagnantes sur les 36 possibles ?",
    reponse: "6",
    indice: "Liste les paires (d1, d2) où d1 + d2 > 9 : (4,6), (5,5), (5,6), (6,4), (6,5), (6,6).",
    explication: "Les combinaisons avec somme > 9 :\n(4,6), (6,4) → somme 10\n(5,5) → somme 10\n(5,6), (6,5) → somme 11\n(6,6) → somme 12\nTotal : 6 combinaisons sur 36.\nProbabilité = 6/36 = 1/6 ≈ 16,7%",
    difficulte: 2,
    personnages: ["🎲", "🎯"],
    theme: "probabilités"
  },
  {
    id: 9,
    titre: "La bibliothèque d'Hugo",
    histoire: `Hugo range sa bibliothèque. Il a des livres de maths, de physique et d'histoire. Les livres de physique sont deux fois plus nombreux que les livres d'histoire. Les livres de maths sont 5 de moins que la somme des livres de physique et d'histoire. En tout, il a 55 livres.`,
    question: "Combien Hugo a-t-il de livres de maths ?",
    reponse: "25",
    indice: "Pose x = livres d'histoire. Physique = 2x. Maths = (x + 2x) − 5. Total = 55.",
    explication: "Soit x = livres d'histoire.\nPhysique = 2x\nMaths = (x + 2x) − 5 = 3x − 5\nTotal : x + 2x + (3x − 5) = 55\n6x = 60 → x = 10\nHistoire = 10, Physique = 20, Maths = 3(10) − 5 = 25",
    difficulte: 2,
    personnages: ["📚", "🧑‍🎓"],
    theme: "équations"
  },
  {
    id: 10,
    titre: "Le grand escalier",
    histoire: `Inès monte un grand escalier. Chaque jour, elle monte 3 marches de plus que la veille. Le premier jour elle monte 1 marche. Après un certain nombre de jours, elle a monté 100 marches en tout.`,
    question: "Après combien de jours Inès a-t-elle monté exactement 100 marches ? (La somme des n premiers termes vaut n²)",
    reponse: "10",
    indice: "Le nième jour elle monte 2n−1 marches. La somme des n premiers impairs = n². Trouve n tel que n² = 100.",
    explication: "Le 1er jour : 1 marche, le 2e : 3 marches, le 3e : 5 marches…\nLe n-ième jour : 2n−1 marches (suite des impairs).\nSomme après n jours = 1+3+5+…+(2n−1) = n²\nn² = 100 → n = 10 jours.",
    difficulte: 3,
    personnages: ["🧗‍♀️", "🏛️"],
    theme: "suites"
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
