/**
 * Question bank for Bite the Watermelon.
 * Structure mirrors the original backend's questions.py:
 * each question has a scenario, 4 choices, and a parallel "scores" array
 * where scores[i] is the hidden metric payload for choices[i].
 *
 * A "seed" entry inside a score object represents a small recurring
 * habit/pattern rather than a big flag — see scoring.js.
 */
const QUESTIONS = [
  {
    id: 1,
    scenario: "Your message has been seen, but there is no reply. What do you do?",
    choices: [
      "They might be busy, so I will wait.",
      "I will send a follow-up message.",
      "I will check whether they are online.",
      "I will assume they ignored me and stay silent."
    ],
    scores: [
      { trust: 2, communication: 1, empathy: 2, sweetness: 2 },
      { trust: 1, communication: 2, empathy: 1, sweetness: 1 },
      { trust: -2, jealousy: 2, overthinking: 2, seed: "Overthinking" },
      { resentment: 2, communication: -1, seed: "Silent Resentment" }
    ]
  },
  {
    id: 2,
    scenario: "Your friend invites you to a party, but your partner is not coming. What do you do?",
    choices: [
      "I will go. It's simple.",
      "I will tell my partner and then go.",
      "I will skip it because I might make my partner uncomfortable.",
      "I will decide based on what my partner says."
    ],
    scores: [
      { independence: 2, trust: 1 },
      { communication: 2, trust: 2, sweetness: 1 },
      { independence: -1, overthinking: 2, seed: "Overthinking" },
      { boundaries: -1, communication: -1, seed: "People Pleasing" }
    ]
  },
  {
    id: 3,
    scenario: "Your partner is very excited about a new friend. How do you react?",
    choices: [
      "Nice! I will be happy for them.",
      "I will ask who the friend is.",
      "I will feel a little jealous.",
      "I will say nothing, but keep thinking about it."
    ],
    scores: [
      { trust: 2, empathy: 2, sweetness: 2 },
      { communication: 2, trust: 1 },
      { jealousy: 2, seed: "Jealousy" },
      { resentment: 2, seed: "Silent Resentment" }
    ]
  },
  {
    id: 4,
    scenario: "You have a small argument, and your partner says, 'Let's talk about it later.' What do you do?",
    choices: [
      "Okay, I will give them some space.",
      "After some time, I will talk about it calmly.",
      "Why later? I want to solve it right now.",
      "I will ignore them too."
    ],
    scores: [
      { boundaries: 2, patience: 2, communication: 1 },
      { communication: 2, empathy: 2 },
      { patience: -1, ego: 1, seed: "Impatience" },
      { resentment: 2, communication: -2, seed: "Avoidance" }
    ]
  },
  {
    id: 5,
    scenario: "Your partner forgets your birthday. What do you do?",
    choices: [
      "I will tell them directly that I am hurt.",
      "I will assume they might have been busy.",
      "I will say nothing.",
      "My mood will be ruined for the whole day."
    ],
    scores: [
      { communication: 2, empathy: 1 },
      { empathy: 2, trust: 2 },
      { resentment: 2, seed: "Silent Resentment" },
      { resentment: 2, overthinking: 1, seed: "Overthinking" }
    ]
  },
  {
    id: 6,
    scenario: "Your partner asks for your opinion but then chooses not to follow it. How do you react?",
    choices: [
      "It's their choice. That's okay.",
      "I will discuss why they decided not to accept my opinion.",
      "I will feel like my opinion is not valued.",
      "I will stop giving my opinion next time."
    ],
    scores: [
      { maturity: 2, boundaries: 1 },
      { communication: 2, empathy: 1 },
      { ego: 1, resentment: 1, seed: "Ego" },
      { communication: -2, resentment: 2, seed: "Withdrawal" }
    ]
  },
  {
    id: 7,
    scenario: "Your partner is busy and does not properly reply to you for the whole day. What do you do?",
    choices: [
      "I will understand that they are busy.",
      "I will send one supportive message.",
      "I will keep messaging them repeatedly.",
      "I will deliberately stop replying to them too."
    ],
    scores: [
      { trust: 2, empathy: 2, patience: 2 },
      { sweetness: 2, empathy: 2 },
      { overthinking: 2, seed: "Attention Seeking" },
      { resentment: 2, ego: 1, seed: "Tit for Tat" }
    ]
  },
  {
    id: 8,
    scenario: "Your partner makes a small mistake that is not serious. What do you do?",
    choices: [
      "I will let it go.",
      "I will explain it calmly.",
      "I will tease them about it for days. 😂",
      "I will keep reminding them about their old mistakes."
    ],
    scores: [
      { empathy: 2, sweetness: 2 },
      { communication: 2, maturity: 2 },
      { humor: 2, sweetness: 1 },
      { resentment: 3, seed: "Grudge Collector" }
    ]
  },
  {
    id: 9,
    scenario: "Your partner says, 'I'm fine,' but it is obvious that they are not. What do you do?",
    choices: [
      "Okay, I will give them some space.",
      "I will gently ask, 'Are you sure you're okay?'",
      "I will keep asking them repeatedly.",
      "I will say, 'Okay, fine,' and leave them alone."
    ],
    scores: [
      { boundaries: 2, patience: 2 },
      { empathy: 3, communication: 2, sweetness: 2 },
      { communication: 1, overthinking: 1 },
      { empathy: -1, communication: -1 }
    ]
  },
  {
    id: 10,
    scenario: "Your partner teases you with a joke, and it hurts your feelings a little. What do you do?",
    choices: [
      "I will laugh it off.",
      "Later, I will tell them that it hurt my feelings.",
      "I will get angry immediately.",
      "I will say nothing, but remember it."
    ],
    scores: [
      { humor: 2, patience: 1 },
      { communication: 3, boundaries: 2 },
      { ego: 1, seed: "Ego" },
      { resentment: 2, seed: "Silent Resentment" }
    ]
  }
];

if (typeof module !== "undefined") module.exports = QUESTIONS;
