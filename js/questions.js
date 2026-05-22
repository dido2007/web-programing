"use strict";

// ─────────────────────────────────────────────────────────────────────────────
//  QUESTION BANK
//
//  We store all quiz questions here as a plain array of objects.
//  Each question has:
//    - question  : a LaTeX string rendered by KaTeX in the browser
//    - type      : "qcm" (multiple choice) or "numeric" (free text input)
//    - answer    : the correct answer (string)
//    - choices   : only for qcm — the six answer options shown to the user
//    - difficulty: 1–2 = easy, 3 = medium, 4–5 = hard
//    - topic     : fine-grained subject (equations, derivatives, etc.)
//    - category  : broad grouping used by the category filter
//    - anecdote  : a short historical fact shown after the player answers
// ─────────────────────────────────────────────────────────────────────────────

const QUESTIONS = [
  // ── ARITHMETIC ───────────────────────────────────────────────────────────
  {
    id: 1,
    question: "30\\% \\text{ de } 80",
    type: "numeric",
    answer: "24",
    difficulty: 1,
    topic: "arithmetic",
    category: "algebra",
    anecdote: "Les pourcentages sont apparus en Europe au XVe siècle pour simplifier les calculs commerciaux. Le signe % est une contraction de « per cento » (pour cent) en italien."
  },
  {
    id: 2,
    question: "\\text{Simplifier } \\frac{144}{180}",
    type: "qcm",
    answer: "\\frac{4}{5}",
    choices: ["\\frac{4}{5}", "\\frac{3}{4}", "\\frac{5}{6}", "\\frac{2}{3}", "\\frac{7}{9}", "\\frac{8}{10}"],
    difficulty: 1,
    topic: "arithmetic",
    category: "algebra",
    anecdote: "Euclide (~300 av. J.-C.) a décrit l'algorithme de calcul du PGCD dans ses Éléments — l'un des algorithmes les plus anciens encore utilisés aujourd'hui."
  },
  {
    id: 3,
    question: "\\text{Combien vaut } 2^{10} ?",
    type: "numeric",
    answer: "1024",
    difficulty: 2,
    topic: "arithmetic",
    category: "algebra",
    anecdote: "Les puissances de 2 sont fondamentales en informatique : un octet = 2⁸ = 256 valeurs. Leibniz, co-inventeur du calcul, a aussi inventé le système binaire au XVIIe siècle."
  },

  // ── ALGEBRA ──────────────────────────────────────────────────────────────
  {
    id: 10,
    question: "\\text{Résoudre } 2x + 5 = 13",
    type: "numeric",
    answer: "4",
    difficulty: 1,
    topic: "equations",
    category: "algebra",
    anecdote: "Al-Khwarizmi (IXe siècle) a écrit le premier traité sur la résolution d'équations linéaires. Le mot « algèbre » vient du titre de son livre : Al-Kitāb al-mukhtaṣar fī ḥisāb al-jabr."
  },
  {
    id: 11,
    question: "\\text{Résoudre } x^2 - 5x + 6 = 0",
    type: "qcm",
    answer: "x=2 \\text{ ou } x=3",
    choices: ["x=2 \\text{ ou } x=3", "x=-2 \\text{ ou } x=-3", "x=1 \\text{ ou } x=6", "x=2 \\text{ ou } x=-3", "x=-1 \\text{ ou } x=6", "x=3 \\text{ ou } x=-2"],
    difficulty: 2,
    topic: "equations",
    category: "algebra",
    anecdote: "La formule quadratique (discriminant) était connue des Babyloniens 2000 ans avant J.-C. sous forme géométrique. La notation algébrique moderne date du XVIe siècle avec Viète."
  },
  {
    id: 12,
    question: "\\text{Résoudre } (1-x)(x-3)\\geq 0",
    type: "qcm",
    answer: "[1,3]",
    choices: ["[1,3]", "]-\\infty,1]\\cup[3,+\\infty[", "]1,3[", "]-\\infty,1[\\cup]3,+\\infty[", "\\{1,3\\}", "\\varnothing"],
    difficulty: 4,
    topic: "inequalities",
    category: "algebra",
    anecdote: "L'étude des inégalités a pris son essor au XIXe siècle avec Cauchy et son célèbre lemme. L'inégalité de Cauchy-Schwarz, fondamentale en analyse, porte son nom."
  },
  {
    id: 13,
    question: "\\text{Développer } (a+b)^2",
    type: "qcm",
    answer: "a^2+2ab+b^2",
    choices: ["a^2+2ab+b^2", "a^2+b^2", "a^2-2ab+b^2", "2a^2+2b^2", "a^2+ab+b^2", "2ab+b^2"],
    difficulty: 1,
    topic: "algebra",
    category: "algebra",
    anecdote: "Le triangle de Pascal permet de retrouver les coefficients binomiaux de (a+b)ⁿ. Blaise Pascal (1623-1662) l'a popularisé, mais il était déjà connu en Chine au XIIe siècle."
  },
  {
    id: 14,
    question: "\\text{Factoriser } x^2 - 9",
    type: "qcm",
    answer: "(x-3)(x+3)",
    // We include the swapped version (x+3)(x-3) as a distractor since both
    // are mathematically equal but only one exactly matches our answer string
    choices: ["(x-3)(x+3)", "(x-3)^2", "(x+3)^2", "(x-9)(x+1)", "(x-1)(x+9)", "(x+3)(x-3)"],
    difficulty: 2,
    topic: "algebra",
    category: "algebra",
    anecdote: "L'identité remarquable a²-b² = (a-b)(a+b) était déjà utilisée par les géomètres grecs. Diophante d'Alexandrie (IIIe siècle) l'a formalisée dans son traité Arithmetica."
  },
  {
    id: 15,
    question: "\\text{Si } f(x)=3x^2-2, \\text{ calculer } f(2)",
    type: "numeric",
    answer: "10",
    difficulty: 2,
    topic: "functions",
    category: "algebra",
    anecdote: "La notation f(x) a été introduite par Euler en 1734. Avant lui, les fonctions étaient décrites en langage courant. Euler est aussi à l'origine des notations π, e, i et Σ."
  },

  // ── ANALYSIS ─────────────────────────────────────────────────────────────
  {
    id: 20,
    question: "\\text{Calculer } \\lim_{x\\to\\infty} \\frac{1}{x}",
    type: "numeric",
    answer: "0",
    difficulty: 2,
    topic: "limits",
    category: "analysis",
    anecdote: "La notion rigoureuse de limite a été formalisée par Cauchy vers 1821, puis renforcée par Weierstrass avec la définition epsilon-delta, qui reste la définition standard aujourd'hui."
  },
  {
    id: 21,
    question: "f(x)=x^3. \\text{ Donner } f'(x).",
    type: "qcm",
    answer: "3x^2",
    choices: ["3x^2", "x^2", "3x^3", "2x^3", "x^3", "3"],
    difficulty: 2,
    topic: "derivatives",
    category: "analysis",
    anecdote: "Newton et Leibniz ont inventé le calcul différentiel indépendamment vers 1675. Newton l'appelait « fluxions », Leibniz utilisait la notation dy/dx que nous utilisons encore."
  },
  {
    id: 22,
    question: "f:x\\mapsto \\frac{1}{2x-1}.\\ \\text{Donner } f'(x).",
    type: "qcm",
    answer: "-\\frac{2}{(2x-1)^2}",
    choices: ["-\\frac{2}{(2x-1)^2}", "\\frac{2}{(2x-1)^2}", "-\\frac{1}{(2x-1)^2}", "\\frac{1}{2x-1}", "\\frac{2}{2x-1}", "-\\frac{2}{2x-1}"],
    difficulty: 4,
    topic: "derivatives",
    category: "analysis",
    anecdote: "La règle de dérivation des quotients, dite règle de « la haute moins la basse sur la basse carrée », a été systématisée par l'Hospital dans son traité de 1696 — le premier manuel de calcul infinitésimal."
  },
  {
    id: 23,
    question: "\\text{Calculer } \\int_0^1 x^2\\,dx",
    type: "qcm",
    answer: "\\frac{1}{3}",
    choices: ["\\frac{1}{3}", "\\frac{1}{2}", "1", "\\frac{2}{3}", "\\frac{1}{4}", "0"],
    difficulty: 3,
    topic: "integrals",
    category: "analysis",
    anecdote: "Cavalieri (1598-1647) avait déjà calculé ∫xⁿ par une méthode géométrique avant Newton. Mais c'est le théorème fondamental du calcul intégral — liant dérivée et intégrale — qui a tout révolutionné."
  },
  {
    id: 24,
    question: "\\text{Calculer } \\int \\frac{1}{1+x^2}\\,dx",
    type: "qcm",
    answer: "\\arctan(x) + C",
    choices: ["\\arctan(x) + C", "\\ln(1+x^2) + C", "\\arcsin(x) + C", "-\\arctan(x) + C", "\\frac{1}{(1+x^2)^2} + C", "\\tan(x) + C"],
    difficulty: 5,
    topic: "integrals",
    category: "analysis",
    anecdote: "La primitive de 1/(1+x²) est arctan(x). Cette formule était connue de Leibniz dès 1673, qui en a déduit la série π/4 = 1 - 1/3 + 1/5 - 1/7 + … — une des plus belles formules de l'histoire."
  },
  {
    id: 25,
    question: "\\text{Calculer } \\lim_{x\\to 0} \\frac{\\sin x}{x}",
    type: "numeric",
    answer: "1",
    difficulty: 3,
    topic: "limits",
    category: "analysis",
    anecdote: "Cette limite fondamentale, sin(x)/x → 1, était connue d'Euler. Elle est à la base de toute la trigonométrie infinitésimale et justifie pourquoi on mesure les angles en radians plutôt qu'en degrés."
  },
  {
    id: 26,
    question: "f(x) = e^{2x}. \\text{ Donner } f'(x).",
    type: "qcm",
    answer: "2e^{2x}",
    choices: ["2e^{2x}", "e^{2x}", "2xe^{2x}", "e^{2x+1}", "2e^x", "e^{2}"],
    difficulty: 3,
    topic: "derivatives",
    category: "analysis",
    anecdote: "La constante e = 2,71828… a été introduite par Euler en 1736. Elle est l'unique réel tel que d/dx(eˣ) = eˣ, propriété qui en fait la fonction la plus naturelle du calcul."
  },
  {
    id: 27,
    question: "\\text{Calculer } \\int e^x\\,dx",
    type: "qcm",
    answer: "e^x + C",
    choices: ["e^x + C", "xe^x + C", "e^x \\cdot x + C", "\\frac{e^x}{x} + C", "e^{x+1} + C", "\\ln(e^x) + C"],
    difficulty: 2,
    topic: "integrals",
    category: "analysis",
    anecdote: "La fonction eˣ est sa propre dérivée et sa propre primitive. C'est ce que Euler appelait la « fonction naturelle » — une propriété tellement unique qu'elle définit en fait le nombre e."
  },

  // ── TRIGONOMETRY & LOGARITHMS ─────────────────────────────────────────────
  {
    id: 30,
    question: "\\text{Calculer } \\cos(7\\pi)",
    type: "numeric",
    answer: "-1",
    difficulty: 2,
    topic: "trigonometry",
    category: "trigo",
    anecdote: "La trigonométrie a été développée par les astronomes grecs et indiens. Hipparque (IIe s. av. J.-C.) a dressé la première table de cordes — l'ancêtre de nos tables trigonométriques."
  },
  {
    id: 31,
    question: "\\cos^2(x) + \\sin^2(x) = \\ ?",
    type: "numeric",
    answer: "1",
    difficulty: 1,
    topic: "trigonometry",
    category: "trigo",
    anecdote: "L'identité fondamentale cos²(x)+sin²(x)=1 est une reformulation du théorème de Pythagore sur le cercle unité. Pythagore (~500 av. J.-C.) n'imaginait sans doute pas cette interprétation trigonométrique."
  },
  {
    id: 32,
    question: "\\sin\\left(\\frac{\\pi}{2}\\right) = \\ ?",
    type: "numeric",
    answer: "1",
    difficulty: 1,
    topic: "trigonometry",
    category: "trigo",
    anecdote: "La valeur sin(π/2)=1 correspond à l'angle droit (90°). Les Indiens de l'école Aryabhata (Ve siècle) étaient les premiers à avoir défini le sinus comme une demi-corde d'arc."
  },
  {
    id: 33,
    question: "\\text{Calculer } \\ln(e^3)",
    type: "numeric",
    answer: "3",
    difficulty: 1,
    topic: "logarithms",
    category: "trigo",
    anecdote: "Les logarithmes ont été inventés par John Napier en 1614 pour simplifier les calculs astronomiques — multiplier deux grands nombres revenait à additionner leurs logarithmes. Une révolution pour les matheux de l'époque."
  },
  {
    id: 34,
    question: "\\text{Résoudre } e^x = 5",
    type: "qcm",
    answer: "\\ln(5)",
    choices: ["\\ln(5)", "5", "\\log(5)", "e^5", "5e", "\\frac{5}{e}"],
    difficulty: 3,
    topic: "logarithms",
    category: "trigo",
    anecdote: "L'équation eˣ = a a pour solution x = ln(a). La notation « ln » pour logarithme naturel a été popularisée par le mathématicien Stringham en 1893, bien que la fonction elle-même soit due à Euler."
  },
  {
    id: 35,
    question: "\\text{Simplifier } \\ln(ab)",
    type: "qcm",
    answer: "\\ln a + \\ln b",
    choices: ["\\ln a + \\ln b", "\\ln a \\cdot \\ln b", "\\ln a - \\ln b", "\\frac{\\ln a}{\\ln b}", "\\ln(a+b)", "\\ln^2(ab)"],
    difficulty: 2,
    topic: "logarithms",
    category: "trigo",
    anecdote: "La propriété ln(ab) = ln(a)+ln(b) est précisément ce qui rendait les logarithmes si utiles avant les calculatrices : transformer une multiplication en addition, permettant de calculer à la main des produits colossaux."
  },

  // ── COMBINATORICS ────────────────────────────────────────────────────────
  {
    id: 40,
    question: "\\text{Combien vaut } 5! \\ (5\\text{ factorielle}) ?",
    type: "numeric",
    answer: "120",
    difficulty: 1,
    topic: "combinatorics",
    category: "combinatorics",
    anecdote: "La notation n! a été introduite par le mathématicien français Christian Kramp en 1808. Les factorielles apparaissent naturellement pour compter les permutations — 5! = nombre de façons d'ordonner 5 objets."
  },
  {
    id: 41,
    question: "\\binom{5}{2} = \\ ?",
    type: "numeric",
    answer: "10",
    difficulty: 2,
    topic: "combinatorics",
    category: "combinatorics",
    anecdote: "Le coefficient binomial C(n,k) compte le nombre de façons de choisir k éléments parmi n. Pascal a organisé ces coefficients dans son triangle en 1654, mais Omar Khayyam en avait fait de même au XIe siècle."
  },
  {
    id: 42,
    question: "\\text{Combien de façons d'ordonner les lettres de MATH ?}",
    type: "numeric",
    answer: "24",
    difficulty: 2,
    topic: "combinatorics",
    category: "combinatorics",
    anecdote: "Le nombre d'anagrammes d'un mot de n lettres distinctes est n!. Pour MATH (4 lettres distinctes) : 4! = 24. Si des lettres se répètent, on divise par les factorielles des répétitions."
  },
  {
    id: 43,
    question: "\\text{Probabilité d'obtenir 2 faces en lançant 1 pièce non truquée ?}",
    type: "numeric",
    answer: "0.5",
    difficulty: 1,
    topic: "probability",
    category: "combinatorics",
    anecdote: "Le calcul des probabilités est né au XVIIe siècle d'une correspondance entre Pascal et Fermat sur un problème de jeux de dés. Cette « correspondance de 1654 » a fondé la théorie des probabilités."
  },
  {
    id: 44,
    question: "\\text{Combien de sous-ensembles a un ensemble à 3 éléments ?}",
    type: "numeric",
    answer: "8",
    difficulty: 3,
    topic: "combinatorics",
    category: "combinatorics",
    anecdote: "Un ensemble à n éléments a 2ⁿ sous-ensembles (ensemble des parties). Pour n=3 : 2³=8. Ce résultat lie combinatoire et algèbre booléenne, fondement de la logique des circuits numériques."
  },
  {
    id: 45,
    question: "\\binom{10}{3} = \\ ?",
    type: "numeric",
    answer: "120",
    difficulty: 3,
    topic: "combinatorics",
    category: "combinatorics",
    anecdote: "C(10,3) = 10×9×8 / (3×2×1) = 120. On retrouve ce nombre dans de nombreux contextes : le nombre de façons de choisir 3 joueurs dans une équipe de 10, ou encore le nombre de triangles dans un ensemble de 10 points."
  }
];

// ─────────────────────────────────────────────────────────────────────────────
//  UTILITY FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

// We map difficulty labels to numeric ranges so the config UI (easy/medium/hard)
// can filter the question bank without knowing internal difficulty numbers
function getQuestions({ category = null, difficulty = "medium" } = {}) {
  const ranges = { easy: [1, 2], medium: [3, 3], hard: [4, 6] };
  const [min, max] = ranges[difficulty] || ranges.medium;

  return QUESTIONS.filter(q => {
    const diffOk = q.difficulty >= min && q.difficulty <= max;
    // If no category is selected we accept all questions
    const catOk  = !category || q.category === category;
    return diffOk && catOk;
  });
}

// Fisher-Yates shuffle — we need a random order every time the quiz starts
// so the player doesn't always see the same questions in the same sequence
function shuffle(arr) {
  const a = [...arr]; // we copy the array to avoid mutating the original
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]; // ES6 destructuring swap
  }
  return a;
}

// We combine filtering, shuffling, and slicing into one helper
// so quiz.js only needs to call pickQuestions() once to get its pool
function pickQuestions({ category, difficulty, count = 10 }) {
  const pool = getQuestions({ category, difficulty });
  return shuffle(pool).slice(0, count);
}
