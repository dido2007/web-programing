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
  },

  // ── EASY ANALYSIS (diff 1–2) — extra questions so every category reaches 10
  {
    id: 70,
    question: "\\text{Quelle est la dérivée de } f(x) = 5x ?",
    type: "numeric",
    answer: "5",
    difficulty: 1,
    topic: "derivatives",
    category: "analysis",
    anecdote: "La dérivée d'une fonction affine f(x) = ax + b est la constante a — la pente de la droite. C'est l'idée centrale du calcul différentiel : la dérivée généralise la notion de pente à toute courbe."
  },
  {
    id: 71,
    question: "f(x)=x^2+3x.\\ \\text{Calculer } f'(1).",
    type: "numeric",
    answer: "5",
    difficulty: 2,
    topic: "derivatives",
    category: "analysis",
    anecdote: "f'(x) = 2x + 3, donc f'(1) = 5. La dérivée en un point représente géométriquement la pente de la tangente à la courbe en ce point — une interprétation due à Newton et Leibniz."
  },
  {
    id: 72,
    question: "\\text{Calculer } \\int_0^2 3\\,dx",
    type: "numeric",
    answer: "6",
    difficulty: 1,
    topic: "integrals",
    category: "analysis",
    anecdote: "L'intégrale d'une constante c sur [a,b] vaut c(b−a). Géométriquement, c'est l'aire du rectangle de base (b−a) et de hauteur c. Ici : 3×2 = 6."
  },
  {
    id: 73,
    question: "\\text{Calculer } \\lim_{x\\to 2} (x^2+1)",
    type: "numeric",
    answer: "5",
    difficulty: 1,
    topic: "limits",
    category: "analysis",
    anecdote: "Quand une fonction est continue en un point, sa limite en ce point vaut simplement sa valeur. Les polynômes sont continus partout, donc lim(x→2)(x²+1) = 4+1 = 5."
  },
  {
    id: 74,
    question: "f(x) = 4x^3.\\ \\text{Donner } f'(x).",
    type: "qcm",
    answer: "12x^2",
    choices: ["12x^2", "4x^2", "12x^3", "8x^2", "4x^4", "3x^2"],
    difficulty: 2,
    topic: "derivatives",
    category: "analysis",
    anecdote: "La règle des puissances : (axⁿ)' = n·a·xⁿ⁻¹. Pour f(x) = 4x³ : f'(x) = 3·4·x² = 12x². Newton et Leibniz ont découvert cette règle indépendamment vers 1675."
  },
  {
    id: 75,
    question: "\\text{Calculer } \\int_0^1 2x\\,dx",
    type: "numeric",
    answer: "1",
    difficulty: 2,
    topic: "integrals",
    category: "analysis",
    anecdote: "∫₀¹ 2x dx = [x²]₀¹ = 1 − 0 = 1. Géométriquement, c'est l'aire du triangle de base 1 et de hauteur 2 — exactement la moitié du rectangle de même base et hauteur."
  },
  {
    id: 76,
    question: "\\text{Trouver } x \\text{ tel que } f'(x)=0 \\text{ pour } f(x)=x^2-6x+5",
    type: "numeric",
    answer: "3",
    difficulty: 2,
    topic: "derivatives",
    category: "analysis",
    anecdote: "f'(x) = 2x − 6 = 0 → x = 3. Ce point est un minimum de f car f''(x) = 2 > 0. Trouver les extrema par la dérivée est l'une des applications les plus importantes du calcul."
  },

  // ── EASY ALGEBRA (diff 1–2) — extra questions
  {
    id: 80,
    question: "\\text{Résoudre } 5x - 3 = 12",
    type: "numeric",
    answer: "3",
    difficulty: 1,
    topic: "equations",
    category: "algebra",
    anecdote: "Al-Khwarizmi (IXe s.) a développé les premières méthodes systématiques de résolution d'équations linéaires. Le mot « algorithme » vient de la translittération latine de son propre nom."
  },
  {
    id: 81,
    question: "\\text{Calculer } (-3)^4",
    type: "numeric",
    answer: "81",
    difficulty: 1,
    topic: "arithmetic",
    category: "algebra",
    anecdote: "(-3)⁴ = (-3)×(-3)×(-3)×(-3) = 9×9 = 81. Un exposant pair donne toujours un résultat positif, quel que soit le signe de la base — règle fondamentale des puissances."
  },

  // ── EASY TRIGO (diff 1–2) — extra questions
  {
    id: 85,
    question: "\\sin(0) = \\ ?",
    type: "numeric",
    answer: "0",
    difficulty: 1,
    topic: "trigonometry",
    category: "trigo",
    anecdote: "sin(0) = 0 car à l'angle nul, la composante verticale du vecteur sur le cercle trigonométrique est nulle. Les valeurs remarquables sin(0)=0, sin(π/6)=1/2, sin(π/2)=1 sont à connaître par cœur."
  },
  {
    id: 86,
    question: "\\cos(0) = \\ ?",
    type: "numeric",
    answer: "1",
    difficulty: 1,
    topic: "trigonometry",
    category: "trigo",
    anecdote: "cos(0) = 1 car à l'angle 0, le vecteur pointe vers (1, 0) sur le cercle unité. Le cosinus représente toujours la coordonnée x — c'est son interprétation géométrique fondamentale."
  },
  {
    id: 87,
    question: "\\tan\\left(\\frac{\\pi}{4}\\right) = \\ ?",
    type: "numeric",
    answer: "1",
    difficulty: 2,
    topic: "trigonometry",
    category: "trigo",
    anecdote: "tan(π/4) = sin(π/4)/cos(π/4) = (√2/2)/(√2/2) = 1. La tangente de 45° vaut 1, ce qui signifie qu'une pente de 100% correspond exactement à un angle de 45°."
  },
  {
    id: 88,
    question: "\\text{Résoudre } \\ln(x) = 0",
    type: "numeric",
    answer: "1",
    difficulty: 2,
    topic: "logarithms",
    category: "trigo",
    anecdote: "ln(x) = 0 ↔ x = e⁰ = 1. Le logarithme de 1 est nul dans toute base — c'est la propriété fondamentale du logarithme. John Napier l'a établi en 1614 en inventant les logarithmes."
  },
  {
    id: 89,
    question: "\\text{Simplifier } \\frac{\\ln(e^5)}{5}",
    type: "numeric",
    answer: "1",
    difficulty: 1,
    topic: "logarithms",
    category: "trigo",
    anecdote: "ln(eˣ) = x pour tout réel x — ln et exp sont inverses l'une de l'autre. Donc ln(e⁵) = 5, et 5/5 = 1. Cette propriété réciproque est utilisée constamment en physique et économie."
  },

  // ── EASY COMBINATORICS (diff 1–2) — extra questions
  {
    id: 90,
    question: "3! = \\ ?",
    type: "numeric",
    answer: "6",
    difficulty: 1,
    topic: "combinatorics",
    category: "combinatorics",
    anecdote: "3! = 3×2×1 = 6. Il y a 6 façons d'ordonner 3 objets distincts (ABC, ACB, BAC, BCA, CAB, CBA). La notation n! a été introduite par le mathématicien Kramp en 1808."
  },
  {
    id: 91,
    question: "\\binom{6}{1} = \\ ?",
    type: "numeric",
    answer: "6",
    difficulty: 1,
    topic: "combinatorics",
    category: "combinatorics",
    anecdote: "C(6,1) = 6 : il y a 6 façons de choisir 1 élément parmi 6. En général C(n,1) = n — une des propriétés de base du triangle de Pascal."
  },
  {
    id: 92,
    question: "\\text{Probabilité d'obtenir pile sur une pièce équilibrée ?}",
    type: "qcm",
    answer: "\\frac{1}{2}",
    choices: ["\\frac{1}{2}", "\\frac{1}{4}", "\\frac{1}{3}", "1", "\\frac{2}{3}", "0"],
    difficulty: 1,
    topic: "probability",
    category: "combinatorics",
    anecdote: "P(pile) = 1/2 pour une pièce équilibrée. La théorie des probabilités est née en 1654 d'une correspondance entre Pascal et Fermat sur des jeux d'argent."
  },
  {
    id: 93,
    question: "\\text{Combien d'issues possibles en lançant 1 dé à 6 faces ?}",
    type: "numeric",
    answer: "6",
    difficulty: 1,
    topic: "probability",
    category: "combinatorics",
    anecdote: "Un dé standard a 6 faces équiprobables, chacune avec probabilité 1/6. Les dés ont motivé les premiers travaux de Pascal et Fermat sur les probabilités au XVIIe siècle."
  },
  {
    id: 94,
    question: "\\text{Combien de résultats possibles en lançant 2 pièces ?}",
    type: "numeric",
    answer: "4",
    difficulty: 1,
    topic: "probability",
    category: "combinatorics",
    anecdote: "Deux pièces donnent 2² = 4 issues : (P,P),(P,F),(F,P),(F,F). En général, n expériences à k issues donnent kⁿ résultats — le principe fondamental de la combinatoire."
  },
  {
    id: 95,
    question: "\\text{Combien de façons d'ordonner les lettres de VRAI ?}",
    type: "numeric",
    answer: "24",
    difficulty: 2,
    topic: "combinatorics",
    category: "combinatorics",
    anecdote: "VRAI a 4 lettres toutes distinctes, donc 4! = 24 anagrammes. Si des lettres se répètent, on divise par les factorielles des répétitions — ex : ANNA a 4!/2!2! = 6 arrangements."
  },

  // ── MEDIUM (diff 3) — extra questions to reach ≥ 10 medium total
  {
    id: 50,
    question: "\\text{Dériver } f(x) = x^2\\ln(x)",
    type: "qcm",
    answer: "2x\\ln(x)+x",
    choices: ["2x\\ln(x)+x", "2x\\ln(x)", "\\frac{x^2}{x}", "2x+\\frac{1}{x}", "x\\ln(x)+x^2", "2\\ln(x)+x"],
    difficulty: 3,
    topic: "derivatives",
    category: "analysis",
    anecdote: "Règle du produit : (uv)' = u'v + uv'. Ici u = x², v = ln(x) : u' = 2x, v' = 1/x. Donc f'(x) = 2x·ln(x) + x²·(1/x) = 2x·ln(x) + x. Leibniz a formalisé cette règle en 1684."
  },
  {
    id: 51,
    question: "\\text{Calculer } \\int_1^e \\frac{1}{x}\\,dx",
    type: "numeric",
    answer: "1",
    difficulty: 3,
    topic: "integrals",
    category: "analysis",
    anecdote: "La primitive de 1/x est ln(x). Donc ∫₁ᵉ 1/x dx = [ln(x)]₁ᵉ = ln(e) − ln(1) = 1 − 0 = 1. Cette identité peut même servir à définir le nombre e."
  },
  {
    id: 52,
    question: "\\text{Résoudre } \\sin(x)=\\frac{\\sqrt{2}}{2}\\text{ sur }[0,2\\pi]",
    type: "qcm",
    answer: "x=\\frac{\\pi}{4}\\text{ ou }x=\\frac{3\\pi}{4}",
    choices: ["x=\\frac{\\pi}{4}\\text{ ou }x=\\frac{3\\pi}{4}", "x=\\frac{\\pi}{4}\\text{ ou }x=\\frac{5\\pi}{4}", "x=\\frac{\\pi}{3}\\text{ ou }x=\\frac{2\\pi}{3}", "x=\\frac{\\pi}{6}\\text{ ou }x=\\frac{5\\pi}{6}", "x=\\frac{\\pi}{4}\\text{ seulement}", "x=\\frac{\\pi}{2}"],
    difficulty: 3,
    topic: "trigonometry",
    category: "trigo",
    anecdote: "sin(x) = √2/2 correspond à 45° (π/4). Les solutions dans [0,2π] se trouvent par symétrie du cercle : π/4 et π − π/4 = 3π/4."
  },
  {
    id: 53,
    question: "\\text{Résoudre } \\ln(x^2-3)=\\ln(2x)\\text{ (avec }x>0\\text{)}",
    type: "qcm",
    answer: "x=3",
    choices: ["x=3", "x=-1\\text{ ou }x=3", "x=1\\text{ ou }x=3", "x=2", "x=-3", "x=\\sqrt{3}"],
    difficulty: 3,
    topic: "logarithms",
    category: "trigo",
    anecdote: "ln(a) = ln(b) ↔ a = b. Ici x²−3 = 2x → x²−2x−3=0 → (x−3)(x+1) = 0. Pour x > 0, seul x = 3 convient (x = −1 donnerait 2x < 0, hors domaine du log)."
  },
  {
    id: 54,
    question: "\\text{Probabilité d'obtenir au moins un 6 avec 2 dés ?}",
    type: "qcm",
    answer: "\\frac{11}{36}",
    choices: ["\\frac{11}{36}", "\\frac{1}{3}", "\\frac{1}{6}", "\\frac{2}{6}", "\\frac{10}{36}", "\\frac{12}{36}"],
    difficulty: 3,
    topic: "probability",
    category: "combinatorics",
    anecdote: "P(au moins un 6) = 1 − P(aucun 6) = 1 − (5/6)² = 11/36. Passer par le complémentaire simplifie énormément le calcul — une technique popularisée par Pascal et Fermat."
  },
  {
    id: 55,
    question: "\\text{Résoudre } 2^x = 8",
    type: "numeric",
    answer: "3",
    difficulty: 3,
    topic: "logarithms",
    category: "algebra",
    anecdote: "2ˣ = 8 = 2³, donc x = 3. Plus généralement x = log₂(8) = ln(8)/ln(2). Les équations exponentielles sont résolues grâce aux logarithmes inventés par Napier en 1614."
  },
  {
    id: 56,
    question: "\\text{Résoudre } x^2-4x+3=0",
    type: "qcm",
    answer: "x=1\\text{ ou }x=3",
    choices: ["x=1\\text{ ou }x=3", "x=-1\\text{ ou }x=-3", "x=2\\text{ ou }x=3", "x=1\\text{ ou }x=4", "x=0\\text{ ou }x=3", "x=-1\\text{ ou }x=3"],
    difficulty: 3,
    topic: "equations",
    category: "algebra",
    anecdote: "Δ = 16−12 = 4 → x = (4±2)/2 → x=1 ou x=3. La formule discriminante b²−4ac a été systématisée par Viète au XVIe siècle — c'est l'une des formules les plus utilisées au lycée."
  },
  {
    id: 57,
    question: "\\text{Résoudre } \\begin{cases}x+y=10\\\\x-y=4\\end{cases}",
    type: "qcm",
    answer: "x=7,\\;y=3",
    choices: ["x=7,\\;y=3", "x=3,\\;y=7", "x=6,\\;y=4", "x=5,\\;y=5", "x=8,\\;y=2", "x=4,\\;y=6"],
    difficulty: 3,
    topic: "equations",
    category: "algebra",
    anecdote: "En additionnant les deux équations : 2x = 14 → x = 7, puis y = 3. La méthode d'élimination de Gauss (1777-1855) systématise la résolution des systèmes linéaires."
  },
  {
    id: 58,
    question: "\\text{Calculer } \\log_{10}(1000)",
    type: "numeric",
    answer: "3",
    difficulty: 3,
    topic: "logarithms",
    category: "trigo",
    anecdote: "log₁₀(1000) = 3 car 10³ = 1000. Le logarithme décimal a été inventé par Briggs en 1617 pour simplifier les calculs astronomiques. Avant les calculatrices, les tables de logarithmes étaient indispensables."
  },
  {
    id: 59,
    question: "\\text{Nombre d'arrangements de 3 lettres parmi 5 lettres distinctes}",
    type: "numeric",
    answer: "60",
    difficulty: 3,
    topic: "combinatorics",
    category: "combinatorics",
    anecdote: "Les arrangements ordonnés : A(5,3) = 5×4×3 = 60. On distingue l'arrangement (ordre important) de la combinaison (ordre non important) : C(5,3) = 10, mais A(5,3) = 60."
  },

  // ── HARD (diff 4–5) — extra questions to reach ≥ 10 hard total
  {
    id: 60,
    question: "f(x)=\\frac{x^2+1}{x-1}.\\ \\text{Donner } f'(x).",
    type: "qcm",
    answer: "\\frac{x^2-2x-1}{(x-1)^2}",
    choices: ["\\frac{x^2-2x-1}{(x-1)^2}", "\\frac{x^2+1}{(x-1)^2}", "\\frac{2x}{x-1}", "\\frac{2x(x-1)+(x^2+1)}{(x-1)^2}", "\\frac{2x-2}{(x-1)^2}", "\\frac{x^2-1}{(x-1)^2}"],
    difficulty: 4,
    topic: "derivatives",
    category: "analysis",
    anecdote: "Règle du quotient (u/v)' = (u'v − uv')/v². Ici u'v − uv' = 2x(x−1)−(x²+1) = x²−2x−1. L'Hospital a publié la première formulation rigoureuse dans son traité de 1696."
  },
  {
    id: 61,
    question: "\\text{Calculer } \\int_0^{\\pi}\\sin(x)\\,dx",
    type: "numeric",
    answer: "2",
    difficulty: 4,
    topic: "integrals",
    category: "analysis",
    anecdote: "[−cos(x)]₀^π = −cos(π)+cos(0) = 1+1 = 2. Géométriquement, c'est l'aire de la première arche de la sinusoïde — un résultat central de l'intégration trigonométrique."
  },
  {
    id: 62,
    question: "\\text{Calculer } \\lim_{x\\to 0}\\frac{e^x-1}{x}",
    type: "numeric",
    answer: "1",
    difficulty: 4,
    topic: "limits",
    category: "analysis",
    anecdote: "Cette limite est la définition de la dérivée de eˣ en 0, qui vaut e⁰ = 1. Par Taylor : eˣ = 1+x+x²/2+… donc (eˣ−1)/x → 1. Elle caractérise e comme base de l'exponentielle auto-dérivée."
  },
  {
    id: 63,
    question: "\\text{Résoudre } x^3-3x=0",
    type: "qcm",
    answer: "x=0,\\;x=\\pm\\sqrt{3}",
    choices: ["x=0,\\;x=\\pm\\sqrt{3}", "x=0\\text{ seulement}", "x=\\pm\\sqrt{3}\\text{ seulement}", "x=0,\\;x=\\pm 3", "x=\\pm 1,\\;x=0", "x=\\sqrt{3}\\text{ seulement}"],
    difficulty: 4,
    topic: "equations",
    category: "algebra",
    anecdote: "x³−3x = x(x²−3) = 0 donne x = 0, x = √3 ou x = −√3. Cardano (1545) a publié la première formule générale pour les cubiques — une percée majeure de la Renaissance mathématique."
  },
  {
    id: 64,
    question: "\\text{Dériver } f(x)=\\sin(x^2)",
    type: "qcm",
    answer: "2x\\cos(x^2)",
    choices: ["2x\\cos(x^2)", "\\cos(x^2)", "2\\cos(x^2)", "-2x\\sin(x^2)", "\\sin(2x)", "\\cos(2x)"],
    difficulty: 4,
    topic: "derivatives",
    category: "analysis",
    anecdote: "Règle de composition (chain rule) : (f∘g)'(x) = f'(g(x))·g'(x). Ici g = x², f = sin, donc f'(x) = cos(x²)·2x = 2x·cos(x²). Leibniz notait d(sin u) = cos(u)·du."
  },
  {
    id: 65,
    question: "\\text{Résoudre } \\cos(x)=0\\text{ sur }[0,2\\pi]",
    type: "qcm",
    answer: "x=\\frac{\\pi}{2}\\text{ ou }x=\\frac{3\\pi}{2}",
    choices: ["x=\\frac{\\pi}{2}\\text{ ou }x=\\frac{3\\pi}{2}", "x=0\\text{ ou }x=\\pi", "x=\\frac{\\pi}{4}\\text{ ou }x=\\frac{3\\pi}{4}", "x=\\pi\\text{ seulement}", "x=\\frac{\\pi}{2}\\text{ seulement}", "x=0"],
    difficulty: 4,
    topic: "trigonometry",
    category: "trigo",
    anecdote: "cos(x) = 0 où la projection horizontale sur le cercle est nulle : aux « pôles » π/2 et 3π/2. Ces deux angles correspondent aux points (0,1) et (0,−1) sur le cercle trigonométrique."
  },
  {
    id: 66,
    question: "\\text{Calculer } \\lim_{x\\to+\\infty}\\frac{x^2+1}{x^2-1}",
    type: "numeric",
    answer: "1",
    difficulty: 5,
    topic: "limits",
    category: "analysis",
    anecdote: "Pour les fractions de polynômes de même degré, la limite en ±∞ est le rapport des coefficients dominants. Les deux coefficients de x² sont 1, donc la limite est 1. Weierstrass a formalisé ce calcul avec sa définition ε-δ."
  },
  {
    id: 67,
    question: "\\text{Résoudre } x^4-5x^2+4=0",
    type: "qcm",
    answer: "x=\\pm 1\\text{ ou }x=\\pm 2",
    choices: ["x=\\pm 1\\text{ ou }x=\\pm 2", "x=1\\text{ ou }x=4", "x=\\pm 2\\text{ seulement}", "x=\\pm 1\\text{ seulement}", "x=0\\text{ ou }x=\\pm 2", "x=\\pm\\sqrt{5}"],
    difficulty: 4,
    topic: "equations",
    category: "algebra",
    anecdote: "En posant u = x², l'équation devient u²−5u+4 = (u−1)(u−4) = 0, d'où u=1 ou u=4, puis x = ±1 ou ±2. Cette substitution transforme un polynôme de degré 4 en degré 2."
  },
  {
    id: 68,
    question: "\\text{Résoudre } (1-x)(x-4)\\geq 0",
    type: "qcm",
    answer: "[1,4]",
    choices: ["[1,4]", "]-\\infty,1]\\cup[4,+\\infty[", "]1,4[", "]-\\infty,1[\\cup]4,+\\infty[", "\\{1,4\\}", "\\varnothing"],
    difficulty: 4,
    topic: "inequalities",
    category: "algebra",
    anecdote: "Le produit (1−x)(x−4) ≥ 0 : on dresse un tableau de signes. Les racines 1 et 4 divisent la droite en trois intervalles — sur ]1,4[, les deux facteurs ont des signes opposés, donc le produit est positif."
  },
  {
    id: 69,
    question: "\\binom{8}{3} = \\ ?",
    type: "numeric",
    answer: "56",
    difficulty: 4,
    topic: "combinatorics",
    category: "combinatorics",
    anecdote: "C(8,3) = 8×7×6/(3×2×1) = 336/6 = 56. On retrouve ce nombre dans de nombreux problèmes : mains à 3 cartes parmi 8, sous-comités à 3 membres dans un groupe de 8, etc."
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
// so quiz.js only needs to call pickQuestions() once to get its pool.
// We cap count to pool.length so we never return fewer questions than
// requested due to an empty slice — the caller sees a full set every time.
function pickQuestions({ category, difficulty, count = 10 }) {
  const pool = getQuestions({ category, difficulty });
  return shuffle(pool).slice(0, Math.min(count, pool.length));
}
