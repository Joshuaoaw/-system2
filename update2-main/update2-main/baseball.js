// Baseball scoring system
// Game state variables
let currentInning = 1;
let topOfInning = true;
let inningScores = {
  teamA: [0, 0, 0, 0, 0, 0, 0, 0, 0],
  teamB: [0, 0, 0, 0, 0, 0, 0, 0, 0]
};
let totals = {
  teamA: { runs: 0, hits: 0, errors: 0 },
  teamB: { runs: 0, hits: 0, errors: 0 }
};
let bases = { first: false, second: false, third: false };
let counts = { balls: 0, strikes: 0, outs: 0 };

// Player statistics
let playerStats = {};

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
  setupGameControls();
  setupPlayerCards();
  setupInningScores();
  highlightCurrentInning();
  
  // Set up the stadium title to be editable
  document.querySelector('.stadium-title').contentEditable = true;
});

// Setup game controls
function setupGameControls() {
  // Add event listeners for the count buttons
  document.querySelectorAll('.count-box button').forEach(button => {
    button.addEventListener('click', function() {
      const action = this.innerText.includes('+') ? 'add' : 'reset';
      const type = this.closest('.count-box').querySelector('label').getAttribute('for');
      
      if (action === 'add') {
        addCount(type);
      } else {
        resetCount(type);
      }
    });
  });
  
  // Add "Next Batter" button
  const countContainer = document.querySelector('.count-tracker');
  const nextBatterBtn = document.createElement('button');
  nextBatterBtn.innerText = 'Next Batter';
  nextBatterBtn.className = 'next-batter-btn';
  nextBatterBtn.addEventListener('click', handleNextBatter);
  countContainer.appendChild(nextBatterBtn);
  
  // Add "End Inning" button
  const endInningBtn = document.createElement('button');
  endInningBtn.innerText = 'End Inning';
  endInningBtn.className = 'end-inning-btn';
  endInningBtn.addEventListener('click', handleEndInning);
  countContainer.appendChild(endInningBtn);
  
  // Add base indicators
  const basesContainer = document.createElement('div');
  basesContainer.className = 'bases-container';
  basesContainer.innerHTML = `
    <h3>Bases</h3>
    <div class="diamond">
      <div class="base first-base" id="first-base"></div>
      <div class="base second-base" id="second-base"></div>
      <div class="base third-base" id="third-base"></div>
      <div class="home-plate"></div>
    </div>
    <div class="base-controls">
      <button id="toggle-first">1st Base</button>
      <button id="toggle-second">2nd Base</button>
      <button id="toggle-third">3rd Base</button>
      <button id="clear-bases">Clear Bases</button>
    </div>
  `;
  countContainer.appendChild(basesContainer);
  
  // Add base toggle events
  document.getElementById('toggle-first').addEventListener('click', () => toggleBase('first'));
  document.getElementById('toggle-second').addEventListener('click', () => toggleBase('second'));
  document.getElementById('toggle-third').addEventListener('click', () => toggleBase('third'));
  document.getElementById('clear-bases').addEventListener('click', clearBases);
  
  // Add hit/error buttons
  const statButtons = document.createElement('div');
  statButtons.className = 'stat-buttons';
  statButtons.innerHTML = `
    <h3>Record Stats</h3>
    <div>
      <button id="add-hit" class="stat-btn">Record Hit</button>
      <button id="add-error" class="stat-btn">Record Error</button>
    </div>
  `;
  countContainer.appendChild(statButtons);
  
  // Add event listeners for stat buttons
  document.getElementById('add-hit').addEventListener('click', () => {
    const team = topOfInning ? 'teamA' : 'teamB';
    totals[team].hits++;
    updateTotals();
    enablePlayerSelection(team, 'hit');
  });
  
  document.getElementById('add-error').addEventListener('click', () => {
    const team = !topOfInning ? 'teamA' : 'teamB'; // Error is assigned to fielding team
    totals[team].errors++;
    updateTotals();
  });
  
  // Add inning indicator
  const inningIndicator = document.createElement('div');
  inningIndicator.className = 'inning-indicator';
  inningIndicator.innerHTML = `
    <h3>Current</h3>
    <div id="inning-display">
      <span id="inning-number">1</span> 
      <span id="inning-half">${topOfInning ? 'Top' : 'Bottom'}</span>
    </div>
  `;
  countContainer.appendChild(inningIndicator);
}

// Add to the count (balls, strikes, outs)
function addCount(type) {
  const el = document.getElementById(type);
  let value = parseInt(el.textContent);
  let maxValue;
  
  // Set max values according to baseball rules
  if (type === 'balls') maxValue = 3;
  else if (type === 'strikes') maxValue = 2;
  else if (type === 'outs') maxValue = 2;
  
  if (value < maxValue) {
    counts[type] = value + 1;
    el.textContent = counts[type];
  } else {
    counts[type] = value + 1;
    el.textContent = counts[type];
    
    // Handle special cases when max is reached
    if (type === 'balls') {
      // Walk - reset counts, advance runners
      alert('Walk! Batter takes first base.');
      advanceRunners('walk');
      resetCount('balls');
      resetCount('strikes');
    } else if (type === 'strikes') {
      // Strikeout - add an out, reset counts
      alert('Strikeout!');
      addCount('outs');
      resetCount('balls');
      resetCount('strikes');
    } else if (type === 'outs') {
      // End of half inning when 3 outs are reached
      alert('Three outs! End of half inning.');
      handleEndInning();
    }
  }
}

// Reset a count
function resetCount(type) {
  document.getElementById(type).textContent = "0";
  counts[type] = 0;
}

// Handle next batter (reset balls and strikes)
function handleNextBatter() {
  resetCount('balls');
  resetCount('strikes');
}

// Handle end of inning
function handleEndInning() {
  // Reset counts
  resetCount('balls');
  resetCount('strikes');
  resetCount('outs');
  clearBases();
  
  // Move to next half-inning
  if (topOfInning) {
    topOfInning = false;
  } else {
    topOfInning = true;
    currentInning++;
    
    // Check if game is over (9 innings completed)
    if (currentInning > 9) {
      alert('Game complete!');
      determineWinner();
      return;
    }
  }
  
  // Update inning display
  document.getElementById('inning-number').textContent = currentInning;
  document.getElementById('inning-half').textContent = topOfInning ? 'Top' : 'Bottom';
  
  highlightCurrentInning();
}

// Determine the winner
function determineWinner() {
  if (totals.teamA.runs > totals.teamB.runs) {
    alert(`Team A wins ${totals.teamA.runs} - ${totals.teamB.runs}!`);
  } else if (totals.teamB.runs > totals.teamA.runs) {
    alert(`Team B wins ${totals.teamB.runs} - ${totals.teamA.runs}!`);
  } else {
    alert(`It's a tie! ${totals.teamA.runs} - ${totals.teamB.runs}`);
  }
}

// Toggle base occupancy
function toggleBase(base) {
  bases[base] = !bases[base];
  const baseElement = document.getElementById(`${base}-base`);
  
  if (bases[base]) {
    baseElement.classList.add('occupied');
  } else {
    baseElement.classList.remove('occupied');
  }
}

// Clear all bases
function clearBases() {
  bases = { first: false, second: false, third: false };
  document.querySelectorAll('.base').forEach(base => {
    base.classList.remove('occupied');
  });
}

// Advance runners based on hit type or walk
function advanceRunners(hitType) {
  // For a walk
  if (hitType === 'walk') {
    if (bases.first && bases.second && bases.third) {
      // Bases loaded - force in a run
      scoreRun();
    }
    if (bases.first && bases.second) {
      // Runners on 1st and 2nd - advance all
      bases.third = true;
    }
    if (bases.first) {
      // Runner on 1st - advance to 2nd
      bases.second = true;
    }
    // Put runner on first
    bases.first = true;
  }
  // For a single
  else if (hitType === 'single') {
    if (bases.third) scoreRun();
    if (bases.second) bases.third = true;
    if (bases.first) bases.second = true;
    bases.first = true;
  }
  // For a double
  else if (hitType === 'double') {
    if (bases.third) scoreRun();
    if (bases.second) scoreRun();
    if (bases.first) bases.third = true;
    bases.first = false;
    bases.second = true;
  }
  // For a triple
  else if (hitType === 'triple') {
    if (bases.third) scoreRun();
    if (bases.second) scoreRun();
    if (bases.first) scoreRun();
    bases.first = false;
    bases.second = false;
    bases.third = true;
  }
  // For a home run
  else if (hitType === 'homerun') {
    if (bases.third) scoreRun();
    if (bases.second) scoreRun();
    if (bases.first) scoreRun();
    scoreRun(); // Batter scores
    bases.first = false;
    bases.second = false;
    bases.third = false;
  }
  
  // Update base display
  updateBaseDisplay();
}

// Update the base display
function updateBaseDisplay() {
  document.getElementById('first-base').classList.toggle('occupied', bases.first);
  document.getElementById('second-base').classList.toggle('occupied', bases.second);
  document.getElementById('third-base').classList.toggle('occupied', bases.third);
}

// Score a run
function scoreRun() {
  const team = topOfInning ? 'teamA' : 'teamB';
  const inningIndex = currentInning - 1;
  
  // Update inning score
  inningScores[team][inningIndex]++;
  
  // Update cell in score table
  const row = team === 'teamA' ? 0 : 1;
  const scoreTable = document.querySelector('.inning-table tbody');
  scoreTable.rows[row].cells[currentInning].textContent = inningScores[team][inningIndex];
  
  // Update total runs
  totals[team].runs++;
  updateTotals();
}

// Update the R/H/E totals display
function updateTotals() {
  document.querySelector('.runs-a').textContent = totals.teamA.runs;
  document.querySelector('.hits-a').textContent = totals.teamA.hits;
  document.querySelector('.errors-a').textContent = totals.teamA.errors;
  
  document.querySelector('.runs-b').textContent = totals.teamB.runs;
  document.querySelector('.hits-b').textContent = totals.teamB.hits;
  document.querySelector('.errors-b').textContent = totals.teamB.errors;
}

// Setup player cards for statistics tracking
function setupPlayerCards() {
  document.querySelectorAll('.player-card').forEach(card => {
    const playerId = card.getAttribute('data-player');
    const playerName = card.querySelector('.player-name').textContent;
    
    // Initialize player stats
    playerStats[playerId] = {
      atBats: 0,
      hits: 0,
      runs: 0,
      rbis: 0,
      avg: '.000'
    };
    
    // Update player card to show baseball stats
    const scoreDiv = card.querySelector('.player-score');
    scoreDiv.innerHTML = `
      <div class="player-baseball-stats">
        <div>AB: <span class="at-bats">0</span></div>
        <div>H: <span class="hits">0</span></div>
        <div>R: <span class="runs">0</span></div>
        <div>RBI: <span class="rbis">0</span></div>
        <div>AVG: <span class="avg">.000</span></div>
      </div>
    `;
    
    // Add double-click event to manually edit stats
    scoreDiv.addEventListener('dblclick', function() {
      const newAtBats = prompt('Enter at-bats:', playerStats[playerId].atBats);
      const newHits = prompt('Enter hits:', playerStats[playerId].hits);
      const newRuns = prompt('Enter runs:', playerStats[playerId].runs);
      const newRbis = prompt('Enter RBIs:', playerStats[playerId].rbis);
      
      if (newAtBats !== null) playerStats[playerId].atBats = parseInt(newAtBats) || 0;
      if (newHits !== null) playerStats[playerId].hits = parseInt(newHits) || 0;
      if (newRuns !== null) playerStats[playerId].runs = parseInt(newRuns) || 0;
      if (newRbis !== null) playerStats[playerId].rbis = parseInt(newRbis) || 0;
      
      // Calculate batting average
      updatePlayerBattingAverage(playerId);
      updatePlayerStatsDisplay(playerId);
    });
  });
}

// Update a player's batting average
function updatePlayerBattingAverage(playerId) {
  const stats = playerStats[playerId];
  stats.avg = stats.atBats > 0 ? (stats.hits / stats.atBats).toFixed(3).substring(1) : '.000';
}

// Update the player stats display
function updatePlayerStatsDisplay(playerId) {
  const card = document.querySelector(`[data-player="${playerId}"]`);
  if (!card) return;
  
  const stats = playerStats[playerId];
  card.querySelector('.at-bats').textContent = stats.atBats;
  card.querySelector('.hits').textContent = stats.hits;
  card.querySelector('.runs').textContent = stats.runs;
  card.querySelector('.rbis').textContent = stats.rbis;
  card.querySelector('.avg').textContent = stats.avg;
}

// Enable player selection for recording stats
function enablePlayerSelection(team, statType) {
  const players = document.querySelectorAll(
    team === 'teamA' ? ".left-player" : ".right-player"
  );

  players.forEach(player => {
    player.classList.add("selectable");
    player.addEventListener("click", function() {
      handlePlayerStat(player, statType);
    });
  });
}

// Handle player stat recording
function handlePlayerStat(playerCard, statType) {
  const playerId = playerCard.getAttribute('data-player');
  
  if (statType === 'hit') {
    // Update player's hitting stats
    playerStats[playerId].hits++;
    playerStats[playerId].atBats++;
    
    // Prompt for hit type
    const hitType = prompt('Enter hit type (single, double, triple, homerun):', 'single');
    if (hitType) {
      advanceRunners(hitType);
      
      // Add RBI if runner scored
      if (hitType === 'homerun') {
        playerStats[playerId].runs++;
        let runnerCount = 0;
        if (bases.first) runnerCount++;
        if (bases.second) runnerCount++;
        if (bases.third) runnerCount++;
        playerStats[playerId].rbis += runnerCount + 1; // +1 for the batter
      }
    }
  } else if (statType === 'run') {
    playerStats[playerId].runs++;
  } else if (statType === 'rbi') {
    playerStats[playerId].rbis++;
  } else if (statType === 'atbat') {
    playerStats[playerId].atBats++;
  }
  
  // Update player's batting average
  updatePlayerBattingAverage(playerId);
  updatePlayerStatsDisplay(playerId);
  
  // Reset selection state
  document.querySelectorAll(".selectable").forEach(player => {
    player.classList.remove("selectable");
    player.removeEventListener("click", handlePlayerStat);
  });
}

// Setup inning scores
function setupInningScores() {
  // Make individual inning cells editable with listeners
  document.querySelectorAll('.inning-table tbody td[contenteditable="true"]').forEach(cell => {
    cell.addEventListener('blur', function() {
      const row = this.parentElement.rowIndex - 1; // 0 for team A, 1 for team B
      const col = this.cellIndex - 1; // -1 because first column is team name
      if (col >= 0 && col < 9) { // Only innings 1-9
        const team = row === 0 ? 'teamA' : 'teamB';
        const value = parseInt(this.textContent) || 0;
        
        // Update inning score
        inningScores[team][col] = value;
        
        // Recalculate total runs
        totals[team].runs = inningScores[team].reduce((sum, score) => sum + score, 0);
        updateTotals();
      }
    });
  });
}

// Highlight the current inning in the scoreboard
function highlightCurrentInning() {
  // Reset all inning columns
  const headerCells = document.querySelectorAll('.inning-table thead th');
  const allCells = document.querySelectorAll('.inning-table td');
  
  headerCells.forEach(cell => cell.classList.remove('current-inning'));
  allCells.forEach(cell => cell.classList.remove('current-inning'));
  
  // Highlight current inning (add 1 because first column is team name)
  const inningCol = currentInning;
  if (inningCol <= 9) {
    headerCells[inningCol].classList.add('current-inning');
    
    // Highlight team row based on top/bottom inning
    const teamRow = topOfInning ? 0 : 1;
    document.querySelector('.inning-table tbody').rows[teamRow].cells[inningCol].classList.add('current-inning');
  }
}

// Add styling for the baseball scoreboard
document.head.insertAdjacentHTML('beforeend', `
  <style>
    /* Baseball scoreboard styles */
    .inning-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      table-layout: fixed;
    }
    
    .inning-table th, .inning-table td {
      border: 1px solid #555;
      text-align: center;
      padding: 8px 5px;
      width: 40px;
    }
    
    .inning-table th:first-child, .inning-table td:first-child {
      width: 120px;
      text-align: left;
    }
    
    .current-inning {
      background-color: #3a3a3a;
      font-weight: bold;
    }
    
    .count-tracker {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 20px;
    }
    
    .count-box {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .count {
      font-size: 24px;
      font-weight: bold;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #222;
      border-radius: 50%;
      border: 2px solid #555;
    }
    
    .btn-group {
      display: flex;
      gap: 5px;
    }
    
    .next-batter-btn, .end-inning-btn {
      margin-top: 10px;
      padding: 8px 12px;
      background-color: #444;
      border: none;
      border-radius: 4px;
      color: white;
      cursor: pointer;
      font-weight: bold;
    }
    
    .next-batter-btn:hover, .end-inning-btn:hover {
      background-color: #666;
    }
    
    .end-inning-btn {
      background-color: #a00;
    }
    
    .end-inning-btn:hover {
      background-color: #c00;
    }
    
    .bases-container {
      margin-top: 20px;
    }
    
    .diamond {
      position: relative;
      width: 120px;
      height: 120px;
      margin: 10px auto;
      transform: rotate(45deg);
    }
    
    .base {
      position: absolute;
      width: 20px;
      height: 20px;
      background-color: white;
      border: 2px solid #555;
    }
    
    .first-base {
      bottom: 0;
      right: 0;
    }
    
    .second-base {
      top: 0;
      right: 0;
    }
    
    .third-base {
      top: 0;
      left: 0;
    }
    
    .home-plate {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 25px;
      height: 25px;
      background-color: #ccc;
      border: 2px solid #333;
    }
    
    .occupied {
      background-color: #ff9900;
    }
    
    .base-controls {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      justify-content: center;
      margin-top: 10px;
    }
    
    .base-controls button {
      padding: 5px 10px;
      background-color: #444;
      border: none;
      border-radius: 4px;
      color: white;
      cursor: pointer;
    }
    
    .base-controls button:hover {
      background-color: #666;
    }
    
    .stat-buttons {
      margin-top: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .stat-buttons div {
      display: flex;
      gap: 10px;
    }
    
    .stat-btn {
      padding: 8px 12px;
      background-color: #006699;
      border: none;
      border-radius: 4px;
      color: white;
      cursor: pointer;
    }
    
    .stat-btn:hover {
      background-color: #0088cc;
    }
    
    .inning-indicator {
      margin-top: 20px;
      text-align: center;
    }
    
    #inning-display {
      font-size: 24px;
      font-weight: bold;
    }
    
    .player-baseball-stats {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      justify-content: center;
      font-size: 14px;
    }
    
    .selectable {
      cursor: pointer;
      box-shadow: 0 0 10px rgba(0, 255, 0, 0.7);
      transform: scale(1.05);
      transition: all 0.3s ease;
    }
  </style>
`);