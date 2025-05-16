// Score tracking
let scoreA = 0;
let scoreB = 0;

// Player scores tracking
let playerScores = {
  player1: 0, player2: 0, player3: 0, player4: 0, player5: 0,
  player6: 0, player7: 0, player8: 0, player9: 0, player10: 0
};

// Timer variables
let timerInterval;
let timerRunning = false;
let minutes = 8;
let seconds = 24;
let totalSeconds = minutes * 60 + seconds;

// Selected player and pending points tracking
let selectedPlayer = null;
let pendingPoints = null;
let pendingTeam = null;

document.addEventListener('DOMContentLoaded', function () {
  setupScoreButtons();
  setupTimerControls();
  setupPlayerCards();
  updateTimerDisplay();

  document.getElementById("scoreA").textContent = scoreA;
  document.getElementById("scoreB").textContent = scoreB;
});

function updateScore(team, points) {
  if (team === "A") {
    scoreA = Math.max(0, scoreA + points);
    document.getElementById("scoreA").textContent = scoreA;
  } else {
    scoreB = Math.max(0, scoreB + points);
    document.getElementById("scoreB").textContent = scoreB;
  }
}

function setupScoreButtons() {
  document.querySelectorAll('.plus-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const team = this.getAttribute('data-team');
      const pointOptions = this.parentElement.querySelector('.point-options');

      document.querySelectorAll('.point-options').forEach(opt => {
        if (opt !== pointOptions) opt.classList.add('hidden');
      });

      pointOptions.classList.toggle('hidden');
    });
  });

  document.querySelectorAll('.add1, .add2, .add3').forEach(btn => {
    btn.addEventListener('click', function () {
      const team = this.getAttribute('data-team');
      const points = parseInt(this.getAttribute('data-points')) || 1;
      enablePlayerSelection(team, points);
      this.parentElement.classList.add('hidden');
    });
  });

  document.querySelectorAll('.minus-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const team = this.getAttribute('data-team');
      updateScore(team, -1);
    });
  });
}

function enablePlayerSelection(team, points) {
  pendingPoints = points;
  pendingTeam = team;

  const players = document.querySelectorAll(team === "A" ? ".left-player" : ".right-player");
  players.forEach(player => {
    player.classList.add("selectable");
    player.addEventListener("click", handlePlayerSelect);
  });
}

function handlePlayerSelect(e) {
  const playerCard = e.currentTarget;
  const playerId = playerCard.getAttribute('data-player');
  const scoreSpan = playerCard.querySelector(".player-score span");

  playerScores[playerId] = (playerScores[playerId] || 0) + pendingPoints;
  scoreSpan.textContent = playerScores[playerId];
  updateScore(pendingTeam, pendingPoints);

  document.querySelectorAll(".selectable").forEach(player => {
    player.classList.remove("selectable");
    player.removeEventListener("click", handlePlayerSelect);
  });

  pendingPoints = null;
  pendingTeam = null;
}

function setupPlayerCards() {
  document.querySelectorAll('.player-card').forEach(card => {
    const playerId = card.getAttribute('data-player');
    const scoreSpan = card.querySelector('.player-score span');
    scoreSpan.textContent = playerScores[playerId];
  });
}

function setupTimerControls() {
  const controlsDiv = document.querySelector('.controls');

  const timeInput = document.createElement('div');
  timeInput.className = 'time-input';
  timeInput.innerHTML = `
    <input id="minutes" type="number" min="0" value="${minutes}" /> :
    <input id="seconds" type="number" min="0" max="59" value="${seconds}" />
    <button id="set-time">⏱️ Set Time</button>
  `;

  const timerButtons = document.createElement('div');
  timerButtons.className = 'timer-buttons';
  timerButtons.innerHTML = `
    <button id="play-pause">▶️ Play</button>
    <button id="reset">↺ Reset</button>
  `;

  controlsDiv.appendChild(timeInput);
  controlsDiv.appendChild(timerButtons);

  document.getElementById('set-time').addEventListener('click', function () {
    const mins = parseInt(document.getElementById('minutes').value) || 0;
    const secs = parseInt(document.getElementById('seconds').value) || 0;
    minutes = mins;
    seconds = secs;
    totalSeconds = mins * 60 + secs;
    updateTimerDisplay();
  });

  document.getElementById('play-pause').addEventListener('click', function () {
    if (timerRunning) {
      pauseTimer();
      this.textContent = '▶️ Play';
    } else {
      startTimer();
      this.textContent = '⏸️ Pause';
    }
  });

  document.getElementById('reset').addEventListener('click', function () {
    resetTimer();
    document.getElementById('play-pause').textContent = '▶️ Play';
  });
}

function startTimer() {
  if (timerRunning || totalSeconds <= 0) return;

  timerRunning = true;
  timerInterval = setInterval(() => {
    totalSeconds--;
    if (totalSeconds <= 0) {
      clearInterval(timerInterval);
      timerRunning = false;
      document.getElementById('play-pause').textContent = '▶️ Play';
      alert("⏰ Time's up!");
    }
    updateTimerDisplay();
  }, 1000);
}

function pauseTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
}

function resetTimer() {
  pauseTimer();
  totalSeconds = minutes * 60 + seconds;
  updateTimerDisplay();
}

function updateTimerDisplay() {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  document.querySelector('.clock').textContent =
    `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

document.addEventListener('click', function (event) {
  if (!event.target.closest('.plus-wrapper')) {
    document.querySelectorAll('.point-options').forEach(opt => opt.classList.add('hidden'));
  }
  
});
function setupCardButtons() {
  document.querySelectorAll('.player-card').forEach(card => {
    const playerId = card.getAttribute('data-player');
    
    const yellowBtn = card.querySelector('.yellow-card');
    const redBtn = card.querySelector('.red-card');

    if (yellowBtn) {
      yellowBtn.addEventListener('click', function (e) {
        e.stopPropagation(); // prevent triggering player selection
        toggleYellowCard(card);
      });
    }

    if (redBtn) {
      redBtn.addEventListener('click', function (e) {
        e.stopPropagation(); // prevent triggering player selection
        giveRedCardPenalty(card, playerId);
      });
    }
  });
}

function toggleYellowCard(playerCard) {
  playerCard.classList.toggle('yellow-carded');
}

function giveRedCardPenalty(playerCard, playerId) {
  // Add visual red card indicator
  playerCard.classList.add('red-carded');

  // Determine opposing team and give them +1 point
  const isLeft = playerCard.classList.contains('left-player');
  const opposingTeam = isLeft ? 'B' : 'A';
  updateScore(opposingTeam, 1);
}
document.addEventListener('DOMContentLoaded', function () {
  setupScoreButtons();
  setupTimerControls();
  setupPlayerCards();
  setupCardButtons(); // <--- Add this line!
  updateTimerDisplay();

  document.getElementById("scoreA").textContent = scoreA;
  document.getElementById("scoreB").textContent = scoreB;
});
function toggleYellowCard(card) {
  card.classList.toggle('yellow-carded');
}

function applyRedCard(card, playerId) {
  if (card.classList.contains('red-carded')) {
    alert('Player already penalized with a red card.');
    return;
  }

  card.classList.add('red-carded');

  const isLeftPlayer = card.classList.contains('left-player');
  const opposingTeam = isLeftPlayer ? 'B' : 'A';

  updateScore(opposingTeam, 1);
}
let pendingCardType = null;

document.getElementById('give-card-btn').addEventListener('click', function () {
  document.getElementById('card-options').classList.toggle('hidden');
});

document.querySelectorAll('#card-options button').forEach(btn => {
  btn.addEventListener('click', function () {
    pendingCardType = this.getAttribute('data-card');
    document.getElementById('card-options').classList.add('hidden');
    highlightSelectablePlayers();
  });
});

function highlightSelectablePlayers() {
  document.querySelectorAll('.player-card').forEach(card => {
    card.classList.add('card-selected');
    card.addEventListener('click', handleCardAssignment);
  });
}

function handleCardAssignment(e) {
  const card = e.currentTarget;
  const playerId = card.getAttribute('data-player');

  if (pendingCardType === 'yellow') {
    toggleYellowCard(card);
  } else if (pendingCardType === 'red') {
    applyRedCard(card, playerId);
  }

  // Reset selection mode
  document.querySelectorAll('.card-selected').forEach(c => {
    c.classList.remove('card-selected');
    c.removeEventListener('click', handleCardAssignment);
  });
  
  pendingCardType = null;
}
