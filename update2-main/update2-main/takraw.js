// Score tracking
let scoreA = 0;
let scoreB = 0;

// Player scores tracking
let playerScores = {
  player1: 0,
  player2: 0,
  player3: 0,
  player4: 0,
  player5: 0,
  player6: 0,
  player7: 0,
  player8: 0,
  player9: 0,
  player10: 0
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

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
  setupScoreButtons();
  setupTimerControls();
  setupPlayerCards();
  updateTimerDisplay();
  
  // Initialize score displays
  document.getElementById("scoreA").textContent = scoreA;
  document.getElementById("scoreB").textContent = scoreB;
});

// Update score display
function updateScore(team, points) {
  if (team === "A") {
    scoreA = Math.max(0, scoreA + points);
    document.getElementById("scoreA").textContent = scoreA;
  } else {
    scoreB = Math.max(0, scoreB + points);
    document.getElementById("scoreB").textContent = scoreB;
  }
}

// Setup score buttons
function setupScoreButtons() {
  // Plus button click event
  document.querySelectorAll('.plus-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const team = this.getAttribute('data-team');
      const pointOptions = this.parentElement.querySelector('.point-options');
      
      // Close all other point options first
      document.querySelectorAll('.point-options').forEach(opt => {
        if (opt !== pointOptions) {
          opt.classList.add('hidden');
        }
      });
      
      // Toggle the point options visibility
      pointOptions.classList.toggle('hidden');
    });
  });

  // Point options buttons (1, 2, 3 points)
  document.querySelectorAll('.add1').forEach(btn => {
    btn.addEventListener('click', function() {
      const team = this.getAttribute('data-team');
      enablePlayerSelection(team, 1);
      this.parentElement.classList.add('hidden');
    });
  });

  document.querySelectorAll('.add2').forEach(btn => {
    btn.addEventListener('click', function() {
      const team = this.getAttribute('data-team');
      enablePlayerSelection(team, 2);
      this.parentElement.classList.add('hidden');
    });
  });

  document.querySelectorAll('.add3').forEach(btn => {
    btn.addEventListener('click', function() {
      const team = this.getAttribute('data-team');
      enablePlayerSelection(team, 3);
      this.parentElement.classList.add('hidden');
    });
  });

  // Minus button click event
  document.querySelectorAll('.minus-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const team = this.getAttribute('data-team');
      updateScore(team, -1);
    });
  });
}

// Enable player selection for scoring
function enablePlayerSelection(team, points) {
  pendingPoints = points;
  pendingTeam = team;

  const players = document.querySelectorAll(
    team === "A" ? ".left-player" : ".right-player"
  );

  players.forEach(player => {
    player.classList.add("selectable");
    player.addEventListener("click", handlePlayerSelect);
  });
}

// Handle player selection for scoring
function handlePlayerSelect(e) {
  const playerCard = e.currentTarget;
  const playerId = playerCard.getAttribute('data-player');
  const scoreSpan = playerCard.querySelector(".player-score span");
  
  // Update player score
  playerScores[playerId] = (playerScores[playerId] || 0) + pendingPoints;
  scoreSpan.textContent = playerScores[playerId];
  
  // Update team score
  updateScore(pendingTeam, pendingPoints);
  
  // Reset selection state
  document.querySelectorAll(".selectable").forEach(player => {
    player.classList.remove("selectable");
    player.removeEventListener("click", handlePlayerSelect);
  });

  pendingPoints = null;
  pendingTeam = null;
}

// Setup player cards
function setupPlayerCards() {
  document.querySelectorAll('.player-card').forEach(card => {
    const playerId = card.getAttribute('data-player');
    const scoreSpan = card.querySelector('.player-score span');
    scoreSpan.textContent = playerScores[playerId];
  });
}

// Setup timer controls
function setupTimerControls() {
  const controlsDiv = document.querySelector('.controls');
  

  
  // Create play/pause and reset buttons
  const timerButtons = document.createElement('div');
  timerButtons.className = 'timer-buttons';
  timerButtons.innerHTML = `
    <button id="play-pause">▶️ Play</button>
    <button id="reset">↺ Reset</button>
  `;
  
  // Add to controls
  controlsDiv.appendChild(timeInput);
  controlsDiv.appendChild(timerButtons);
  
  // Set time button event
  document.getElementById('set-time').addEventListener('click', function() {
    const mins = parseInt(document.getElementById('minutes').value) || 0;
    const secs = parseInt(document.getElementById('seconds').value) || 0;
    
    minutes = mins;
    seconds = secs;
    totalSeconds = mins * 60 + secs;
    
    updateTimerDisplay();
  });
  
  // Play/pause button event
  document.getElementById('play-pause').addEventListener('click', function() {
    if (timerRunning) {
      pauseTimer();
      this.textContent = '▶️ Play';
    } else {
      startTimer();
      this.textContent = '⏸️ Pause';
    }
  });
  
  // Reset button event
  document.getElementById('reset').addEventListener('click', function() {
    resetTimer();
    document.getElementById('play-pause').textContent = '▶️ Play';
  });
}

// Start the timer
function startTimer() {
  if (timerRunning) return;
  
  if (totalSeconds <= 0) {
    resetTimer();
  }
  
  timerRunning = true;
  timerInterval = setInterval(function() {
    totalSeconds--;
    
    if (totalSeconds <= 0) {
      clearInterval(timerInterval);
      timerRunning = false;
      document.getElementById('play-pause').textContent = '▶️ Play';
      // Optional: Add a sound or visual effect when timer reaches zero
    }
    
    updateTimerDisplay();
  }, 1000);
}

// Pause the timer
function pauseTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
}

// Reset the timer
function resetTimer() {
  pauseTimer();
  totalSeconds = minutes * 60 + seconds;
  updateTimerDisplay();
}

// Update the timer display
function updateTimerDisplay() {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  
  document.querySelector('.clock').textContent = 
    `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Close point options when clicking outside
document.addEventListener('click', function(event) {
  if (!event.target.closest('.plus-wrapper')) {
    document.querySelectorAll('.point-options').forEach(opt => {
      opt.classList.add('hidden');
    });
  }
});