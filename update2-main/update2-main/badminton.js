// Badminton scoring variables
let currentSet = 1;
let scoreA = 0;
let scoreB = 0;
let setsA = 0;
let setsB = 0;
let setScores = {
  set1: { A: 0, B: 0 },
  set2: { A: 0, B: 0 },
  set3: { A: 0, B: 0 } // For best of 3 sets
};

// Player scores tracking
let playerScores = {
  player1: 0,
  player2: 0,
  player6: 0,
  player7: 0
};

// Timer variables
let timerInterval;
let timerRunning = false;
let minutes = 0;
let seconds = 0;
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
  
  // Update the set display
  updateSetIndicator();
  
  // Setup change court button
  setupChangeCourt();
});

// Setup change court button
function setupChangeCourt() {
  const changeCourt = document.querySelector('.change-court-container');
  changeCourt.addEventListener('click', function() {
    // Swap player positions visually
    const leftTeam = document.querySelector('.left-team');
    const rightTeam = document.querySelector('.right-team');
    
    // Add a transition class for smooth animation
    leftTeam.classList.add('switching');
    rightTeam.classList.add('switching');
    
    // After animation completes, swap the DOM elements
    setTimeout(() => {
      const parent = leftTeam.parentNode;
      const leftPlaceholder = document.createElement('div');
      const rightPlaceholder = document.createElement('div');
      
      parent.replaceChild(leftPlaceholder, leftTeam);
      parent.replaceChild(rightPlaceholder, rightTeam);
      parent.replaceChild(rightTeam, leftPlaceholder);
      parent.replaceChild(leftTeam, rightPlaceholder);
      
      leftTeam.classList.remove('switching');
      rightTeam.classList.remove('switching');
    }, 300);
  });
}

// Update score display
function updateScore(team, points) {
  if (team === "A") {
    scoreA = Math.max(0, scoreA + points);
    document.getElementById("scoreA").textContent = scoreA;
  } else {
    scoreB = Math.max(0, scoreB + points);
    document.getElementById("scoreB").textContent = scoreB;
  }
  
  // Check for set completion
  checkSetCompletion();
}

// Check if a set is complete (21 points or win by 2 after 20-20)
function checkSetCompletion() {
  // Regular win condition (21 points)
  const regularWin = (scoreA >= 21 && scoreA - scoreB >= 2) || 
                     (scoreB >= 21 && scoreB - scoreA >= 2);
  
  // Extended play (30 point cap)
  const extendedWin = (scoreA === 30) || (scoreB === 30);
  
  if (regularWin || extendedWin) {
    // Determine set winner
    const winner = scoreA > scoreB ? "A" : "B";
    
    // Update set scores
    setScores[`set${currentSet}`].A = scoreA;
    setScores[`set${currentSet}`].B = scoreB;
    
    // Update set indicator on the scoreboard
    document.querySelector(`.team:nth-child(1) .foul-tol-counter .tol-count`).textContent = setScores[`set${currentSet}`].A;
    document.querySelector(`.team:nth-child(3) .foul-tol-counter .tol-count`).textContent = setScores[`set${currentSet}`].B;
    
    // Update series score
    if (winner === "A") {
      setsA++;
      document.querySelector('.series-score-counter .team-score1').textContent = setsA;
    } else {
      setsB++;
      document.querySelector('.series-score-counter .team-score2').textContent = setsB;
    }
    
    // Prepare for next set if needed (best of 3)
    if ((setsA < 2 && setsB < 2) && currentSet < 3) {
      // Move to next set
      currentSet++;
      
      // Reset current scores
      scoreA = 0;
      scoreB = 0;
      document.getElementById("scoreA").textContent = scoreA;
      document.getElementById("scoreB").textContent = scoreB;
      
      // Update set indicator
      updateSetIndicator();
      
      // Show set completion message
      alert(`Set ${currentSet-1} complete! ${winner === "A" ? "Team A" : "Team B"} wins the set. Starting Set ${currentSet}.`);
      
      // Suggest court change
      if (currentSet === 2 || currentSet === 3) {
        const changeCourt = confirm("Change court sides?");
        if (changeCourt) {
          document.querySelector('.change-court-container').click();
        }
      }
    } else {
      // Match complete
      const matchWinner = setsA > setsB ? "A" : "B";
      alert(`Match complete! ${matchWinner === "A" ? "Team A" : "Team B"} wins the match!`);
    }
  }
}

// Update the set indicator
function updateSetIndicator() {
  // Update period/set number
  document.querySelector('.periodnum').textContent = currentSet;
  
  // Highlight the current set
  document.querySelectorAll('.set1, .set2').forEach(el => {
    el.classList.remove('active-set');
  });
  
  // Highlight the current set for both teams
  document.querySelectorAll(`.set${currentSet}`).forEach(el => {
    el.classList.add('active-set');
  });
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

  // Point options buttons (1 point for badminton)
  document.querySelectorAll('.add1').forEach(btn => {
    btn.addEventListener('click', function() {
      const team = this.getAttribute('data-team');
      enablePlayerSelection(team, 1);
      this.parentElement.classList.add('hidden');
    });
  });

  // Minus button click event (for score correction)
  document.querySelectorAll('.minus-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const team = this.getAttribute('data-team');
      
      // Prevent negative scores
      if ((team === "A" && scoreA > 0) || (team === "B" && scoreB > 0)) {
        updateScore(team, -1);
        
        // Find player with highest score on this team to reduce their score
        const playerTeam = team === "A" ? [1, 2] : [6, 7];
        let highestScorePlayer = null;
        let highestScore = -1;
        
        playerTeam.forEach(playerNum => {
          const playerId = `player${playerNum}`;
          if (playerScores[playerId] > highestScore) {
            highestScore = playerScores[playerId];
            highestScorePlayer = playerId;
          }
        });
        
        // Reduce player score if found
        if (highestScorePlayer && playerScores[highestScorePlayer] > 0) {
          playerScores[highestScorePlayer]--;
          document.querySelector(`[data-player="${highestScorePlayer}"] .player-score span`).textContent = 
            playerScores[highestScorePlayer];
        }
      }
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
  
  // Create time input
  const timeInput = document.createElement('div');
  timeInput.className = 'time-input';
  timeInput.innerHTML = `
    <input type="number" id="minutes" min="0" max="99" placeholder="00">:
    <input type="number" id="seconds" min="0" max="59" placeholder="00">
    <button id="set-time">Set</button>
  `;
  
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
      // Add a sound or visual effect when timer reaches zero
      alert('Time up!');
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

// Add some CSS for the active set and transitions
document.head.insertAdjacentHTML('beforeend', `
  <style>
    .active-set {
      font-weight: bold;
      color: #ff9900;
    }
    
    .team-players {
      transition: transform 0.3s ease;
    }
    
    .switching {
      transform: translateX(50%);
      opacity: 0.5;
    }
    
    .selectable {
      cursor: pointer;
      box-shadow: 0 0 10px rgba(0, 255, 0, 0.7);
      transform: scale(1.05);
      transition: all 0.3s ease;
    }
    
    .change-court-container {
      cursor: pointer;
      padding: 8px;
      background-color: #2a2a2a;
      border-radius: 5px;
      transition: background-color 0.3s ease;
    }
    
    .change-court-container:hover {
      background-color: #444;
    }
  </style>
`);