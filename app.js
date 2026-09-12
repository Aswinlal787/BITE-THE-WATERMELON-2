/**
 * Bite the Watermelon — front-end game state machine.
 * Renders every screen into #app based on `state`. No build step,
 * no framework: plain DOM strings + event delegation.
 */
(function () {
  const app = document.getElementById("app");
  const musicToggle = document.getElementById("musicToggle");
  const musicIcon = document.getElementById("musicIcon");

  const state = {
    screen: "intro", // intro -> question -> handoff -> question -> reveal -> results
    players: [
      { name: "", answers: [] },
      { name: "", answers: [] }
    ],
    currentPlayer: 0,
    currentQuestion: 0
  };

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // ---------------------------------------------------------------
  // Music toggle
  // ---------------------------------------------------------------
  musicToggle.addEventListener("click", () => {
    const unmuted = WatermelonAudio.toggle();
    musicIcon.textContent = unmuted ? "🔊" : "🔈";
    musicToggle.setAttribute("aria-pressed", String(unmuted));
  });

  // ---------------------------------------------------------------
  // Screen: Intro / name entry
  // ---------------------------------------------------------------
  function renderIntro() {
    app.innerHTML = `
      <section class="screen">
        <span class="eyebrow-badge">🍉 2-player reflection game</span>
        <h1 class="headline">You don't know what the question is testing —<br>
          <span class="accent">until you bite the watermelon.</span></h1>
        <p class="lede">
          Ten everyday situations, two players, one hidden scoring system.
          Answer honestly — the watermelon reads between the lines.
        </p>
        <ul class="rules">
          <li><span class="glyph">🎲</span> Each player answers the same 10 scenarios, one at a time, without knowing what's being measured.</li>
          <li><span class="glyph">🌱</span> Small patterns become "seeds." A lot of them become a bitter seed score.</li>
          <li><span class="glyph">🍉</span> At the end, both players get a hidden Watermelon Personality — and a side-by-side comparison.</li>
        </ul>
        <div class="name-fields">
          <div class="field">
            <label for="p1name">Player 1 nickname</label>
            <input id="p1name" type="text" maxlength="24" placeholder="e.g. Ammu" autocomplete="off" />
          </div>
          <div class="field">
            <label for="p2name">Player 2 nickname</label>
            <input id="p2name" type="text" maxlength="24" placeholder="e.g. Kunjan" autocomplete="off" />
          </div>
        </div>
        <div class="field-hint" id="introHint"></div>
        <button class="btn btn-primary" id="startBtn" type="button">Start the game 🍉</button>
      </section>
    `;

    const p1 = document.getElementById("p1name");
    const p2 = document.getElementById("p2name");
    const hint = document.getElementById("introHint");
    const startBtn = document.getElementById("startBtn");

    startBtn.addEventListener("click", () => {
      const n1 = p1.value.trim();
      const n2 = p2.value.trim();
      if (!n1 || !n2) {
        hint.textContent = "Both players need a nickname before biting in.";
        return;
      }
      if (n1.toLowerCase() === n2.toLowerCase()) {
        hint.textContent = "Give each player a different nickname so results don't mix up.";
        return;
      }
      WatermelonAudio.start();
      WatermelonAudio.setMuted(false);
      musicIcon.textContent = "🔊";
      musicToggle.setAttribute("aria-pressed", "true");

      state.players[0].name = n1;
      state.players[1].name = n2;
      state.currentPlayer = 0;
      state.currentQuestion = 0;
      state.screen = "question";
      render();
    });
  }

  // ---------------------------------------------------------------
  // Screen: Question
  // ---------------------------------------------------------------
  function renderQuestion() {
    const playerIdx = state.currentPlayer;
    const player = state.players[playerIdx];
    const qIdx = state.currentQuestion;
    const question = QUESTIONS[qIdx];

    const dots = QUESTIONS.map((_, i) => {
      let cls = "seed-dot";
      if (i < qIdx) cls += " filled";
      else if (i === qIdx) cls += " current";
      return `<span class="${cls}"></span>`;
    }).join("");

    app.innerHTML = `
      <section class="screen">
        <span class="player-tag">🍉 ${escapeHtml(player.name)}'s turn — Question ${qIdx + 1} of ${QUESTIONS.length}</span>
        <div class="seed-progress" role="img" aria-label="Question ${qIdx + 1} of ${QUESTIONS.length}">${dots}</div>
        <h2 class="scenario">${escapeHtml(question.scenario)}</h2>
        <div class="choices" id="choiceList">
          ${question.choices
            .map(
              (choice, i) => `
            <button class="choice-btn" type="button" data-index="${i}">
              <span class="letter">${String.fromCharCode(65 + i)}</span>
              <span>${escapeHtml(choice)}</span>
            </button>`
            )
            .join("")}
        </div>
      </section>
    `;

    document.getElementById("choiceList").addEventListener("click", (e) => {
      const btn = e.target.closest(".choice-btn");
      if (!btn) return;
      const choiceIndex = Number(btn.dataset.index);
      player.answers.push({
        questionId: question.id,
        choiceIndex,
        score: question.scores[choiceIndex]
      });
      advanceAfterAnswer();
    });
  }

  function advanceAfterAnswer() {
    const isLastQuestion = state.currentQuestion === QUESTIONS.length - 1;

    if (!isLastQuestion) {
      state.currentQuestion += 1;
      render();
      return;
    }

    // finished this player's question set
    if (state.currentPlayer === 0) {
      state.screen = "handoff";
      render();
    } else {
      state.screen = "reveal";
      render();
    }
  }

  // ---------------------------------------------------------------
  // Screen: Handoff between players
  // ---------------------------------------------------------------
  function renderHandoff() {
    const nextPlayer = state.players[1];
    app.innerHTML = `
      <section class="screen handoff">
        <span class="big-emoji">🤝🍉</span>
        <h2 class="headline" style="font-size: clamp(1.5rem, 6vw, 2rem);">Pass the phone to ${escapeHtml(nextPlayer.name)}</h2>
        <p class="lede" style="margin-left:auto;margin-right:auto;">
          ${escapeHtml(state.players[0].name)}'s answers are locked in and hidden.
          ${escapeHtml(nextPlayer.name)}, answer honestly — no peeking at their choices!
        </p>
        <button class="btn btn-primary" id="continueBtn" type="button">I'm ${escapeHtml(nextPlayer.name)}, let's go 🍉</button>
      </section>
    `;

    document.getElementById("continueBtn").addEventListener("click", () => {
      state.currentPlayer = 1;
      state.currentQuestion = 0;
      state.screen = "question";
      render();
    });
  }

  // ---------------------------------------------------------------
  // Screen: Bite reveal (single orchestrated hero animation)
  // ---------------------------------------------------------------
  function renderReveal() {
    app.innerHTML = `
      <section class="screen" style="text-align:center;">
        <p class="player-tag" style="justify-content:center;">Both players are done. Time to bite in.</p>
        <div class="bite-reveal">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <g class="half-left">
              <path d="M60 10 A50 50 0 0 0 60 110 Z" fill="#1b6b3a" stroke="#0B2417" stroke-width="2"/>
              <path d="M60 20 A40 40 0 0 0 60 100 Z" fill="${'#FF8DA1'}"/>
              <circle cx="45" cy="45" r="2.6" fill="#2B1608"/>
              <circle cx="42" cy="62" r="2.6" fill="#2B1608"/>
              <circle cx="48" cy="78" r="2.6" fill="#2B1608"/>
            </g>
            <g class="half-right">
              <path d="M60 10 A50 50 0 0 1 60 110 Z" fill="#1b6b3a" stroke="#0B2417" stroke-width="2"/>
              <path d="M60 20 A40 40 0 0 1 60 100 Z" fill="#FF8DA1"/>
              <circle cx="75" cy="45" r="2.6" fill="#2B1608"/>
              <circle cx="78" cy="62" r="2.6" fill="#2B1608"/>
              <circle cx="72" cy="78" r="2.6" fill="#2B1608"/>
            </g>
            <text class="seed-fleck" x="60" y="6" font-size="10" style="--fleck-end: translate(-18px,-24px)">🌱</text>
            <text class="seed-fleck" x="60" y="6" font-size="10" style="--fleck-end: translate(18px,-24px); animation-delay: .32s">🌱</text>
            <text class="seed-fleck" x="60" y="6" font-size="10" style="--fleck-end: translate(0,-30px); animation-delay: .4s">🌱</text>
          </svg>
        </div>
        <p class="lede" style="margin: 0 auto 6px;">Revealing both hidden Watermelon Personalities...</p>
        <button class="btn btn-primary" id="seeResultsBtn" type="button">See the results 🍉</button>
      </section>
    `;

    document.getElementById("seeResultsBtn").addEventListener("click", () => {
      state.screen = "results";
      render();
    });
  }

  // ---------------------------------------------------------------
  // Screen: Results
  // ---------------------------------------------------------------
  const METRIC_LIST = [
    ["Sweetness", "sweetness"],
    ["Trust", "trust"],
    ["Communication", "communication"],
    ["Empathy", "empathy"],
    ["Maturity", "maturity"],
    ["Patience", "patience"],
    ["Boundaries", "boundaries"],
    ["Independence", "independence"],
    ["Humor", "humor"],
    ["Accountability", "accountability"]
  ];

  function renderPlayerCard(playerName, result) {
    const metricsHtml = METRIC_LIST.map(
      ([label, key]) => `
      <div class="metric-row">
        <div class="metric-label"><span>${label}</span><span>${result[key]}%</span></div>
        <div class="metric-bar"><span style="width:${result[key]}%"></span></div>
      </div>`
    ).join("");

    const seedEntries = Object.entries(result.seeds);
    const seedsText = seedEntries.length
      ? seedEntries.map(([name, count]) => `${escapeHtml(name)} ×${count}`).join(", ")
      : "None spotted";

    return `
      <div class="player-card">
        <h3>${escapeHtml(playerName)}</h3>
        <div class="personality-badge">${result.personality}</div>
        ${metricsHtml}
        <div class="seed-summary">
          🍉 Green score: <strong>${result.green_score}%</strong> &middot;
          🌶️ Red score: <strong>${result.red_score}%</strong><br>
          🌱 Seeds found: <strong>${result.seed_count}</strong> (${seedsText})<br>
          🌱💥 Bitter seed score: <strong>${result.bitter_seed_score}%</strong><br>
          Biggest pattern: <strong>${escapeHtml(result.biggest_seed)}</strong>
        </div>
      </div>
    `;
  }

  function renderResults() {
    const p1 = state.players[0];
    const p2 = state.players[1];
    const r1 = calculatePlayerScore(p1.answers);
    const r2 = calculatePlayerScore(p2.answers);
    const differences = comparePlayers(r1, r2);
    const predictions = generatePredictions(r1, p1.name, r2, p2.name, 3);

    app.innerHTML = `
      <section class="screen">
        <div class="results-head">
          <span class="eyebrow-badge">🍉 Results are in</span>
          <h2 class="results-title">${escapeHtml(p1.name)} &amp; ${escapeHtml(p2.name)}'s Watermelons</h2>
          <p class="results-sub">Here's what your answers revealed — just for fun.</p>
        </div>

        <div class="player-cards">
          ${renderPlayerCard(p1.name, r1)}
          ${renderPlayerCard(p2.name, r2)}
        </div>

        <h3 class="section-title">🆚 How you compare</h3>
        <ul class="compare-list">
          ${differences.map((d) => `<li>${escapeHtml(d)}</li>`).join("")}
        </ul>

        <h3 class="section-title">🔮 Just-for-fun predictions</h3>
        <ul class="prediction-list">
          ${predictions.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}
        </ul>

        <div class="actions-row">
          <button class="btn btn-ghost" id="restartBtn" type="button">Play again</button>
        </div>
      </section>
    `;

    document.getElementById("restartBtn").addEventListener("click", () => {
      state.players = [
        { name: "", answers: [] },
        { name: "", answers: [] }
      ];
      state.currentPlayer = 0;
      state.currentQuestion = 0;
      state.screen = "intro";
      render();
    });
  }

  // ---------------------------------------------------------------
  // Router
  // ---------------------------------------------------------------
  function render() {
    switch (state.screen) {
      case "intro":
        renderIntro();
        break;
      case "question":
        renderQuestion();
        break;
      case "handoff":
        renderHandoff();
        break;
      case "reveal":
        renderReveal();
        break;
      case "results":
        renderResults();
        break;
      default:
        renderIntro();
    }
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }

  render();
})();
