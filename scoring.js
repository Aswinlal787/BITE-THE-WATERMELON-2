/**
 * Scoring engine — a faithful JS port of the original backend's scoring.py.
 * Kept as pure functions with no DOM/UI dependency so the logic is easy to
 * audit and unit-test in isolation.
 */

function clampPercent(value) {
  return Math.round(Math.max(0, Math.min(100, value)) * 10) / 10;
}

/**
 * answers: array of { score: { <metric>: number, ... , seed?: string } }
 * (mirrors the Python `answers` list of dicts with a "score" key)
 */
function calculatePlayerScore(answers) {
  const metrics = {};
  const seeds = {};

  const bump = (obj, key, amount) => {
    obj[key] = (obj[key] || 0) + amount;
  };

  for (const answer of answers || []) {
    const score = (answer && answer.score) || {};
    if (typeof score !== "object" || score === null) continue;

    for (const [key, value] of Object.entries(score)) {
      if (key === "seed") {
        bump(seeds, value, 1);
      } else {
        const num = Number(value);
        if (!Number.isNaN(num)) bump(metrics, key, num);
      }
    }
  }

  const m = (key) => metrics[key] || 0;

  const trust = clampPercent(50 + m("trust") * 5);
  const communication = clampPercent(50 + m("communication") * 5);
  const empathy = clampPercent(50 + m("empathy") * 5);
  const sweetness = clampPercent(50 + m("sweetness") * 5);
  const maturity = clampPercent(50 + m("maturity") * 5);
  const patience = clampPercent(50 + m("patience") * 5);
  const boundaries = clampPercent(50 + m("boundaries") * 5);
  const independence = clampPercent(50 + m("independence") * 5);
  const humor = clampPercent(50 + m("humor") * 5);
  const accountability = clampPercent(50 + m("accountability") * 5);

  const green = clampPercent(
    50 +
      (m("trust") +
        m("communication") +
        m("empathy") +
        m("maturity") +
        m("patience") +
        m("boundaries")) *
        2
  );

  const red = clampPercent(
    50 + (m("resentment") + m("jealousy") + m("ego") + m("overthinking")) * 4
  );

  const totalSeeds = Object.values(seeds).reduce((a, b) => a + b, 0);

  const bitterSeedScore = clampPercent(
    totalSeeds * 10 +
      Math.max(0, m("resentment") * 3) +
      Math.max(0, m("ego") * 2) +
      Math.max(0, m("jealousy") * 2) +
      Math.max(0, m("overthinking") * 2)
  );

  let personality;
  if (sweetness >= 75 && totalSeeds <= 2) {
    personality = "PURE WATERMELON 🍉";
  } else if (sweetness >= 65 && totalSeeds <= 5) {
    personality = "SWEET BUT SEEDED 🍉🌱";
  } else if (totalSeeds >= 7) {
    personality = "SEED COLLECTOR 🌱😂";
  } else if (empathy >= 75) {
    personality = "EMOTIONAL WATERMELON ❤️";
  } else if (m("ego") >= 5) {
    personality = "SPICY WATERMELON 🌶️🍉";
  } else if (trust >= 75) {
    personality = "TRUST MELON 🤝🍉";
  } else if (humor >= 75) {
    personality = "FUNNY MELON 😂🍉";
  } else if (boundaries >= 75) {
    personality = "BOUNDARY MELON 🛡️🍉";
  } else {
    personality = "MYSTERY WATERMELON 👀🍉";
  }

  let biggestSeed = "No major seed discovered";
  let biggestSeedCount = 0;
  for (const [seed, count] of Object.entries(seeds)) {
    if (count > biggestSeedCount) {
      biggestSeedCount = count;
      biggestSeed = seed;
    }
  }

  return {
    green_score: green,
    red_score: red,
    sweetness,
    trust,
    communication,
    empathy,
    maturity,
    patience,
    boundaries,
    independence,
    humor,
    accountability,
    seed_count: totalSeeds,
    bitter_seed_score: bitterSeedScore,
    seeds,
    biggest_seed: biggestSeed,
    personality
  };
}

function comparePlayers(player1, player2) {
  const differences = [];
  const metrics = [
    ["Communication", "communication"],
    ["Trust", "trust"],
    ["Empathy", "empathy"],
    ["Sweetness", "sweetness"],
    ["Maturity", "maturity"],
    ["Patience", "patience"],
    ["Boundaries", "boundaries"],
    ["Humor", "humor"]
  ];

  for (const [name, key] of metrics) {
    const diff = Math.abs(player1[key] - player2[key]);
    if (diff >= 20) {
      if (player1[key] > player2[key]) {
        differences.push(`🍉 ${name} — Player 1 is noticeably higher.`);
      } else {
        differences.push(`🍉 ${name} — Player 2 is noticeably higher.`);
      }
    }
  }

  if (differences.length === 0) {
    differences.push("🍉 Same wavelength! Your answers were surprisingly similar.");
  }

  return differences;
}

/**
 * Lighthearted, non-scientific "predictions" — purely for entertainment,
 * loosely nudged by each player's metrics so results feel earned rather
 * than fully random.
 */
const PREDICTION_BANK = [
  { text: (a, b) => `😂 Who will overthink a plain "K" reply? Probably ${a}.`, weight: (p) => p.overthinking },
  { text: (a, b) => `📱 Who checks their phone first thing? Our money's on ${a}.`, weight: (p) => p.independence < 50 ? 10 : 3 },
  { text: (a, b) => `🛌 Who steals the blanket at night? Deffo ${a}.`, weight: () => Math.random() * 10 },
  { text: (a, b) => `🙏 Who apologizes first after a fight? ${a}, most likely.`, weight: (p) => p.accountability },
  { text: (a, b) => `🧠 Who remembers an old argument the longest? ${a}, no contest.`, weight: (p) => p.bitter_seed_score },
  { text: (a, b) => `😂 Who turns a tiny issue into a full debate? ${a}.`, weight: (p) => 100 - p.patience },
  { text: (a, b) => `🍬 Who's the softie who forgives fastest? ${a}, hands down.`, weight: (p) => p.sweetness }
];

function generatePredictions(p1, p1Name, p2, p2Name, count = 3) {
  const shuffled = [...PREDICTION_BANK].sort(() => Math.random() - 0.5).slice(0, count);
  return shuffled.map(({ text, weight }) => {
    const higher = weight(p1) >= weight(p2) ? p1Name : p2Name;
    return text(higher, higher === p1Name ? p2Name : p1Name);
  });
}

if (typeof module !== "undefined") {
  module.exports = { calculatePlayerScore, comparePlayers, generatePredictions, clampPercent };
}
