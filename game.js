// Main game initialization and logic

// Player data
let playerData = {
    level: 1,
    lastCollectTime: Date.now()
};

// Initialize game
function initializeGame() {
    // Initialize heroes
    initializeHeroes();
    
    // Initialize dungeons
    initializeDungeons();
    
    // Initialize pets
    initializePets();
    
    // Set up event listeners
    setupEventListeners();
    
    // Update idle rewards rates
    updateIdleRates();
    
    // Start idle rewards timer
    startIdleRewardsTimer();
}

// Set up event listeners
function setupEventListeners() {
    // Summon hero button
    document.getElementById('summon-hero').addEventListener('click', summonHero);
    
    // Start battle button
    document.getElementById('start-battle').addEventListener('click', startBattle);
    
    // Auto battle button
    document.getElementById('auto-battle').addEventListener('click', toggleAutoBattle);
    
    // Collect idle rewards button
    document.getElementById('collect-idle').addEventListener('click', collectIdleRewards);
    
    // Battle action buttons - use the functions from battle.js
    document.getElementById('basic-attack').addEventListener('click', window.handleBasicAttack || handleBasicAttack);
    document.getElementById('special-ability').addEventListener('click', window.handleSpecialAbility || handleSpecialAbility);
    document.getElementById('cancel-action').addEventListener('click', window.handleCancelAction || handleCancelAction);
}

// Toggle auto battle
function toggleAutoBattle() {
    if (!battleState.inProgress) {
        addBattleLog('No battle in progress!');
        return;
    }
    
    battleState.autoBattle = !battleState.autoBattle;
    
    if (battleState.autoBattle) {
        addBattleLog('Auto battle enabled!');
        // If it's player's turn, process it automatically
        const currentUnit = battleState.turnOrder[battleState.currentTurn];
        if (!currentUnit.isEnemy) {
            aiAction(currentUnit);
            nextTurn();
        }
    } else {
        addBattleLog('Auto battle disabled!');
    }
}

// Note: handleBasicAttack and handleSpecialAbility functions are now imported from battle.js
// This ensures the target selection UI is properly displayed

// Handle cancel action
function handleCancelAction() {
    // Hide action buttons
    document.getElementById('action-buttons').style.display = 'none';
    document.getElementById('start-battle').style.display = 'inline-block';
    document.getElementById('auto-battle').style.display = 'inline-block';
    
    // Enable auto battle
    battleState.autoBattle = true;
    addBattleLog('Auto battle enabled!');
    
    // Process current turn automatically
    const currentUnit = battleState.turnOrder[battleState.currentTurn];
    aiAction(currentUnit);
    
    // Move to next turn
    setTimeout(() => {
        nextTurn();
    }, 1000);
}

// Add hero to battle team
function addHeroToBattle(heroId) {
    const hero = playerHeroes.find(h => h.id === heroId);
    if (!hero) return;
    
    // Check if hero is already in battle
    if (battleState.playerTeam.some(h => h.id === heroId)) {
        // Remove from battle
        battleState.playerTeam = battleState.playerTeam.filter(h => h.id !== heroId);
        hero.inBattle = false;
        addBattleLog(`${hero.name} removed from battle team.`);
    } else {
        // Add to battle if team is not full (max 5 heroes)
        if (battleState.playerTeam.length < 5) {
            // Create a copy of the hero for battle
            const battleHero = { ...hero, currentHealth: hero.stats.health };
            battleState.playerTeam.push(battleHero);
            hero.inBattle = true;
            addBattleLog(`${hero.name} added to battle team.`);
        } else {
            addBattleLog('Battle team is full! Remove a hero first.');
        }
    }
    
    // Update UI
    renderBattle();
    renderHeroesGrid(); // Update hero cards to show which are in battle
}

// Add message to battle log
function addBattleLog(message) {
    const battleLog = document.getElementById('battle-log');
    const logEntry = document.createElement('p');
    logEntry.innerHTML = message;
    logEntry.classList.add('new-log-entry');
    battleLog.appendChild(logEntry);
    
    // Scroll to bottom
    battleLog.scrollTop = battleLog.scrollHeight;
}

// Update idle rewards rates based on player level and current stage
function updateIdleRates() {
    const playerLevel = playerData.level;
    const currentStage = document.getElementById('current-stage').textContent;
    
    const goldPerMinute = IDLE_RATES.gold(playerLevel, currentStage);
    const expPerMinute = IDLE_RATES.exp(playerLevel, currentStage);
    
    document.getElementById('gold-per-minute').textContent = goldPerMinute;
    document.getElementById('exp-per-minute').textContent = expPerMinute;
}

// Start idle rewards timer
function startIdleRewardsTimer() {
    // Update idle rewards every minute
    setInterval(() => {
        const currentTime = Date.now();
        const elapsedMinutes = (currentTime - playerData.lastCollectTime) / (1000 * 60);
        
        if (elapsedMinutes >= 1) {
            // Auto-collect after 24 hours
            if (elapsedMinutes >= 24 * 60) {
                collectIdleRewards();
            }
        }
    }, 60000); // Check every minute
}

// Collect idle rewards
function collectIdleRewards() {
    const currentTime = Date.now();
    const elapsedMinutes = Math.floor((currentTime - playerData.lastCollectTime) / (1000 * 60));
    
    if (elapsedMinutes < 1) {
        addBattleLog('Not enough time has passed to collect rewards!');
        return;
    }
    
    // Cap at 24 hours (1440 minutes)
    const cappedMinutes = Math.min(elapsedMinutes, 1440);
    
    // Calculate rewards
    const goldPerMinute = parseInt(document.getElementById('gold-per-minute').textContent);
    const expPerMinute = parseInt(document.getElementById('exp-per-minute').textContent);
    
    const goldReward = goldPerMinute * cappedMinutes;
    const expReward = expPerMinute * cappedMinutes;
    
    // Add rewards with animation
    const goldElement = document.getElementById('gold-amount');
    const expElement = document.getElementById('exp-amount');
    
    goldElement.textContent = parseInt(goldElement.textContent) + goldReward;
    expElement.textContent = parseInt(expElement.textContent) + expReward;
    
    // Add animation classes
    goldElement.classList.add('resource-change');
    expElement.classList.add('resource-change');
    
    // Remove animation classes after animation completes
    setTimeout(() => {
        goldElement.classList.remove('resource-change');
        expElement.classList.remove('resource-change');
    }, 500);
    
    // Add animation to the collect button
    const collectButton = document.getElementById('collect-idle');
    collectButton.classList.add('collecting-rewards');
    setTimeout(() => {
        collectButton.classList.remove('collecting-rewards');
    }, 500);
    
    // Update last collect time
    playerData.lastCollectTime = currentTime;
    
    // Log collection
    addBattleLog(`Collected idle rewards: ${goldReward} gold and ${expReward} EXP for ${cappedMinutes} minutes!`);
    
    // Check if player can level up
    checkPlayerLevelUp();
}

// Check if player can level up
function checkPlayerLevelUp() {
    const currentExp = parseInt(document.getElementById('exp-amount').textContent);
    const expNeeded = playerData.level * 100; // 100 EXP per level
    
    if (currentExp >= expNeeded) {
        // Level up
        document.getElementById('exp-amount').textContent = currentExp - expNeeded;
        playerData.level++;
        
        // Add level up animation
        const playerLevelElement = document.getElementById('player-level');
        playerLevelElement.textContent = playerData.level;
        playerLevelElement.classList.add('level-up');
        
        // Remove animation class after animation completes
        setTimeout(() => {
            playerLevelElement.classList.remove('level-up');
        }, 1000);
        
        // Update idle rates
        updateIdleRates();
        
        addBattleLog(`Player leveled up to ${playerData.level}!`);
        
        // Check if can level up again
        checkPlayerLevelUp();
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
    
    // Add click event for hero cards to add/remove from battle
    document.addEventListener('click', (event) => {
        const heroCard = event.target.closest('.hero-card');
        if (heroCard && !battleState.inProgress) {
            const heroId = parseInt(heroCard.dataset.heroId);
            addHeroToBattle(heroId);
        }
    });
});

// Helper function to generate enemy team (used by battle.js)
function generateEnemyTeam(playerLevel) {
    const enemyTemplates = [
        { name: "Goblin", health: 50, attack: 8, defense: 3, speed: 5 },
        { name: "Orc", health: 80, attack: 12, defense: 6, speed: 4 },
        { name: "Dragon", health: 150, attack: 20, defense: 10, speed: 7 }
    ];
    
    return enemyTemplates.map((template, index) => ({
        id: 1000 + index,
        name: template.name,
        stats: { ...template },
        isEnemy: true,
        currentHealth: template.health
    }));
}