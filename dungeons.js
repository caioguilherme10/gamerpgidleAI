// Dungeon System

// Dungeon types with their difficulty levels and rewards multipliers
const DUNGEON_TYPES = {
    easy: {
        name: 'Easy Dungeon',
        icon: '🏰',
        description: 'A beginner-friendly dungeon with moderate rewards',
        levelRequirement: 5,
        goldMultiplier: 1.5,
        expMultiplier: 1.5,
        gemMultiplier: 1.2,
        enemyLevelBonus: 2,
        enemyRarityChance: {
            uncommon: 0.6,
            rare: 0.3,
            epic: 0.09,
            legendary: 0.01
        }
    },
    medium: {
        name: 'Medium Dungeon',
        icon: '🏯',
        description: 'A challenging dungeon with good rewards',
        levelRequirement: 15,
        goldMultiplier: 2.0,
        expMultiplier: 2.0,
        gemMultiplier: 1.5,
        enemyLevelBonus: 5,
        enemyRarityChance: {
            rare: 0.6,
            epic: 0.3,
            legendary: 0.1
        }
    },
    hard: {
        name: 'Hard Dungeon',
        icon: '🗼',
        description: 'A difficult dungeon with excellent rewards',
        levelRequirement: 30,
        goldMultiplier: 3.0,
        expMultiplier: 3.0,
        gemMultiplier: 2.0,
        enemyLevelBonus: 10,
        enemyRarityChance: {
            epic: 0.7,
            legendary: 0.3
        }
    }
};

// Dungeon floors with specific enemy compositions
const DUNGEON_FLOORS = {
    easy: [
        {
            enemies: [
                { class: 'warrior', levelMultiplier: 1.0 },
                { class: 'archer', levelMultiplier: 1.0 }
            ],
            bossFloor: false
        },
        {
            enemies: [
                { class: 'tank', levelMultiplier: 1.0 },
                { class: 'mage', levelMultiplier: 1.0 },
                { class: 'healer', levelMultiplier: 1.0 }
            ],
            bossFloor: false
        },
        {
            enemies: [
                { class: 'warrior', levelMultiplier: 1.5 },
                { class: 'mage', levelMultiplier: 1.2 },
                { class: 'archer', levelMultiplier: 1.2 },
                { class: 'healer', levelMultiplier: 1.0 }
            ],
            bossFloor: true
        }
    ],
    medium: [
        {
            enemies: [
                { class: 'warrior', levelMultiplier: 1.0 },
                { class: 'warrior', levelMultiplier: 1.0 },
                { class: 'mage', levelMultiplier: 1.0 }
            ],
            bossFloor: false
        },
        {
            enemies: [
                { class: 'tank', levelMultiplier: 1.2 },
                { class: 'archer', levelMultiplier: 1.0 },
                { class: 'healer', levelMultiplier: 1.0 },
                { class: 'mage', levelMultiplier: 1.0 }
            ],
            bossFloor: false
        },
        {
            enemies: [
                { class: 'tank', levelMultiplier: 1.5 },
                { class: 'warrior', levelMultiplier: 1.3 },
                { class: 'mage', levelMultiplier: 1.3 },
                { class: 'healer', levelMultiplier: 1.2 }
            ],
            bossFloor: true
        }
    ],
    hard: [
        {
            enemies: [
                { class: 'tank', levelMultiplier: 1.2 },
                { class: 'warrior', levelMultiplier: 1.2 },
                { class: 'mage', levelMultiplier: 1.2 },
                { class: 'archer', levelMultiplier: 1.2 }
            ],
            bossFloor: false
        },
        {
            enemies: [
                { class: 'tank', levelMultiplier: 1.3 },
                { class: 'warrior', levelMultiplier: 1.3 },
                { class: 'healer', levelMultiplier: 1.3 },
                { class: 'healer', levelMultiplier: 1.3 }
            ],
            bossFloor: false
        },
        {
            enemies: [
                { class: 'tank', levelMultiplier: 1.8 },
                { class: 'warrior', levelMultiplier: 1.6 },
                { class: 'mage', levelMultiplier: 1.6 },
                { class: 'healer', levelMultiplier: 1.5 },
                { class: 'archer', levelMultiplier: 1.5 }
            ],
            bossFloor: true
        }
    ]
};

// Player's dungeon progress
let playerDungeonProgress = {
    easy: {
        unlocked: false,
        highestFloor: 0,
        completedRuns: 0
    },
    medium: {
        unlocked: false,
        highestFloor: 0,
        completedRuns: 0
    },
    hard: {
        unlocked: false,
        highestFloor: 0,
        completedRuns: 0
    }
};

// Current dungeon run state
let currentDungeonRun = {
    inProgress: false,
    type: null,
    currentFloor: 0,
    playerTeam: [],
    floorCleared: false
};

// Initialize dungeons based on player level
function initializeDungeons() {
    const playerLevel = parseInt(document.getElementById('player-level').textContent);
    
    // Unlock dungeons based on player level
    Object.keys(DUNGEON_TYPES).forEach(type => {
        if (playerLevel >= DUNGEON_TYPES[type].levelRequirement) {
            playerDungeonProgress[type].unlocked = true;
        }
    });
    
    // Render dungeon UI
    renderDungeonUI();
}

// Render dungeon UI
function renderDungeonUI() {
    const dungeonContainer = document.getElementById('dungeon-container');
    if (!dungeonContainer) return;
    
    dungeonContainer.innerHTML = '';
    
    // Create dungeon selection
    const dungeonSelection = document.createElement('div');
    dungeonSelection.className = 'dungeon-selection';
    dungeonSelection.innerHTML = '<h3>Select Dungeon</h3>';
    
    // Add dungeon options
    Object.keys(DUNGEON_TYPES).forEach(type => {
        const dungeon = DUNGEON_TYPES[type];
        const dungeonOption = document.createElement('div');
        dungeonOption.className = `dungeon-option ${playerDungeonProgress[type].unlocked ? '' : 'locked'}`;
        
        dungeonOption.innerHTML = `
            <div class="dungeon-icon">${dungeon.icon}</div>
            <div class="dungeon-info">
                <div class="dungeon-name">${dungeon.name}</div>
                <div class="dungeon-description">${dungeon.description}</div>
                <div class="dungeon-requirement">Required Level: ${dungeon.levelRequirement}</div>
                <div class="dungeon-progress">Highest Floor: ${playerDungeonProgress[type].highestFloor}/3</div>
                <div class="dungeon-completed">Completed Runs: ${playerDungeonProgress[type].completedRuns}</div>
            </div>
        `;
        
        if (playerDungeonProgress[type].unlocked) {
            dungeonOption.addEventListener('click', () => selectDungeon(type));
        } else {
            dungeonOption.innerHTML += `<div class="dungeon-locked">Locked</div>`;
        }
        
        dungeonSelection.appendChild(dungeonOption);
    });
    
    dungeonContainer.appendChild(dungeonSelection);
    
    // Add enter dungeon button
    const enterDungeonBtn = document.createElement('button');
    enterDungeonBtn.id = 'enter-dungeon';
    enterDungeonBtn.className = 'action-button';
    enterDungeonBtn.textContent = 'Enter Dungeon';
    enterDungeonBtn.addEventListener('click', startDungeonRun);
    enterDungeonBtn.disabled = !currentDungeonRun.type;
    
    dungeonContainer.appendChild(enterDungeonBtn);
}

// Select a dungeon type
function selectDungeon(type) {
    currentDungeonRun.type = type;
    
    // Update UI to show selected dungeon
    const dungeonOptions = document.querySelectorAll('.dungeon-option');
    dungeonOptions.forEach(option => {
        option.classList.remove('selected');
    });
    
    const selectedOption = document.querySelector(`.dungeon-option:nth-child(${Object.keys(DUNGEON_TYPES).indexOf(type) + 1})`);
    if (selectedOption) {
        selectedOption.classList.add('selected');
    }
    
    // Enable enter dungeon button
    const enterDungeonBtn = document.getElementById('enter-dungeon');
    if (enterDungeonBtn) {
        enterDungeonBtn.disabled = false;
    }
}

// Start a dungeon run
function startDungeonRun() {
    if (!currentDungeonRun.type || currentDungeonRun.inProgress) return;
    
    // Check if player has heroes in battle team
    if (battleState.playerTeam.length === 0) {
        addBattleLog('You need to add heroes to your team first!');
        return;
    }
    
    // Initialize dungeon run
    currentDungeonRun.inProgress = true;
    currentDungeonRun.currentFloor = 0;
    currentDungeonRun.playerTeam = [...battleState.playerTeam];
    currentDungeonRun.floorCleared = false;
    
    // Start first floor
    startDungeonFloor();
}

// Start a dungeon floor battle
function startDungeonFloor() {
    if (!currentDungeonRun.inProgress) return;
    
    // Get current floor data
    const floorData = DUNGEON_FLOORS[currentDungeonRun.type][currentDungeonRun.currentFloor];
    if (!floorData) {
        completeDungeonRun();
        return;
    }
    
    // Clear previous battle
    clearBattleState();
    
    // Set battle in progress
    battleState.inProgress = true;
    
    // Get player level for enemy scaling
    const playerLevel = parseInt(document.getElementById('player-level').textContent);
    const dungeonType = DUNGEON_TYPES[currentDungeonRun.type];
    
    // Generate enemy team
    floorData.enemies.forEach(enemyData => {
        // Calculate enemy level based on player level, dungeon difficulty, and floor multiplier
        const enemyLevel = Math.floor(playerLevel * enemyData.levelMultiplier) + dungeonType.enemyLevelBonus;
        
        // Determine enemy rarity based on dungeon difficulty
        const rarityRoll = Math.random();
        let enemyRarity = 'common';
        let cumulativeChance = 0;
        
        for (const [rarity, chance] of Object.entries(dungeonType.enemyRarityChance)) {
            cumulativeChance += chance;
            if (rarityRoll <= cumulativeChance) {
                enemyRarity = rarity;
                break;
            }
        }
        
        const enemy = generateEnemy(enemyData.class, enemyLevel, enemyRarity);
        
        // If it's a boss floor, enhance the last enemy
        if (floorData.bossFloor && enemyData === floorData.enemies[floorData.enemies.length - 1]) {
            enemy.name = `Boss ${enemy.name}`;
            enemy.stats.health *= 1.5;
            enemy.stats.attack *= 1.3;
            enemy.stats.defense *= 1.3;
            enemy.currentHealth = enemy.stats.health;
        }
        
        battleState.enemyTeam.push(enemy);
    });
    
    // Update battle UI to show dungeon floor info
    const stageInfoElement = document.getElementById('current-stage');
    if (stageInfoElement) {
        stageInfoElement.textContent = `${dungeonType.name} - Floor ${currentDungeonRun.currentFloor + 1}${floorData.bossFloor ? ' (Boss)' : ''}`;
    }
    
    // Determine turn order and render battle
    determineTurnOrder();
    renderBattle();
    
    // Start battle
    addBattleLog(`Dungeon floor ${currentDungeonRun.currentFloor + 1} battle started!`);
    processTurn();
}

// Handle dungeon battle completion
function handleDungeonBattleComplete(victory) {
    if (!currentDungeonRun.inProgress) return;
    
    if (victory) {
        // Mark floor as cleared
        currentDungeonRun.floorCleared = true;
        
        // Calculate rewards based on dungeon type and floor
        const dungeonType = DUNGEON_TYPES[currentDungeonRun.type];
        const floorBonus = currentDungeonRun.currentFloor + 1;
        const isBossFloor = DUNGEON_FLOORS[currentDungeonRun.type][currentDungeonRun.currentFloor].bossFloor;
        
        // Base rewards from current campaign stage
        const currentStage = document.getElementById('current-stage').textContent.split(' - ')[0];
        const stageData = CAMPAIGN_STAGES[currentStage] || CAMPAIGN_STAGES['1-1'];
        
        // Calculate rewards with multipliers
        const goldReward = Math.floor(stageData.rewards.gold * dungeonType.goldMultiplier * floorBonus);
        const expReward = Math.floor(stageData.rewards.exp * dungeonType.expMultiplier * floorBonus);
        const gemReward = Math.floor(stageData.rewards.gems * dungeonType.gemMultiplier * (isBossFloor ? 2 : 1));
        
        // Add rewards with animation
        const goldElement = document.getElementById('gold-amount');
        const expElement = document.getElementById('exp-amount');
        const gemsElement = document.getElementById('gems-amount');
        
        goldElement.textContent = parseInt(goldElement.textContent) + goldReward;
        expElement.textContent = parseInt(expElement.textContent) + expReward;
        gemsElement.textContent = parseInt(gemsElement.textContent) + gemReward;
        
        // Add animation classes
        goldElement.classList.add('resource-change');
        expElement.classList.add('resource-change');
        gemsElement.classList.add('resource-change');
        
        // Remove animation classes after animation completes
        setTimeout(() => {
            goldElement.classList.remove('resource-change');
            expElement.classList.remove('resource-change');
            gemsElement.classList.remove('resource-change');
        }, 500);
        
        // Show rewards message
        addBattleLog(`Dungeon rewards: ${goldReward} Gold, ${expReward} EXP, ${gemReward} Gems`);
        
        // Move to next floor or complete dungeon
        if (currentDungeonRun.currentFloor < DUNGEON_FLOORS[currentDungeonRun.type].length - 1) {
            currentDungeonRun.currentFloor++;
            
            // Update highest floor reached if needed
            if (currentDungeonRun.currentFloor > playerDungeonProgress[currentDungeonRun.type].highestFloor) {
                playerDungeonProgress[currentDungeonRun.type].highestFloor = currentDungeonRun.currentFloor;
            }
            
            // Add continue button
            const battleControls = document.querySelector('.battle-controls');
            const continueBtn = document.createElement('button');
            continueBtn.id = 'continue-dungeon';
            continueBtn.className = 'action-button';
            continueBtn.textContent = 'Continue to Next Floor';
            continueBtn.addEventListener('click', () => {
                battleControls.removeChild(continueBtn);
                startDungeonFloor();
            });
            battleControls.appendChild(continueBtn);
            
            addBattleLog(`Floor ${currentDungeonRun.currentFloor} cleared! Continue to the next floor.`);
        } else {
            // Dungeon completed
            completeDungeonRun();
        }
    } else {
        // Battle lost
        addBattleLog('Dungeon run failed!');
        currentDungeonRun.inProgress = false;
    }
}

// Complete a dungeon run
function completeDungeonRun() {
    if (!currentDungeonRun.inProgress) return;
    
    // Update completed runs counter
    playerDungeonProgress[currentDungeonRun.type].completedRuns++;
    
    // Add bonus rewards for completing the entire dungeon
    const dungeonType = DUNGEON_TYPES[currentDungeonRun.type];
    const bonusGold = 500 * dungeonType.goldMultiplier;
    const bonusExp = 100 * dungeonType.expMultiplier;
    const bonusGems = 20 * dungeonType.gemMultiplier;
    
    // Add rewards
    const goldElement = document.getElementById('gold-amount');
    const expElement = document.getElementById('exp-amount');
    const gemsElement = document.getElementById('gems-amount');
    
    goldElement.textContent = parseInt(goldElement.textContent) + bonusGold;
    expElement.textContent = parseInt(expElement.textContent) + bonusExp;
    gemsElement.textContent = parseInt(gemsElement.textContent) + bonusGems;
    
    // Add animation classes
    goldElement.classList.add('resource-change');
    expElement.classList.add('resource-change');
    gemsElement.classList.add('resource-change');
    
    // Remove animation classes after animation completes
    setTimeout(() => {
        goldElement.classList.remove('resource-change');
        expElement.classList.remove('resource-change');
        gemsElement.classList.remove('resource-change');
    }, 500);
    
    addBattleLog(`Dungeon completed! Bonus rewards: ${bonusGold} Gold, ${bonusExp} EXP, ${bonusGems} Gems`);
    
    // Reset dungeon run state
    currentDungeonRun.inProgress = false;
    currentDungeonRun.currentFloor = 0;
    currentDungeonRun.playerTeam = [];
    
    // Update UI
    renderDungeonUI();
    
    // Reset stage info
    const stageInfoElement = document.getElementById('current-stage');
    if (stageInfoElement) {
        // Get current campaign stage
        const campaignStage = Object.keys(CAMPAIGN_STAGES)[0]; // Default to first stage
        stageInfoElement.textContent = campaignStage;
    }
}

// Add CSS styles for dungeon UI
document.addEventListener('DOMContentLoaded', () => {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        .dungeon-container {
            margin-top: 20px;
            padding: 15px;
            background-color: #2c3e50;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        
        .dungeon-selection {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-bottom: 15px;
        }
        
        .dungeon-option {
            display: flex;
            padding: 10px;
            background-color: #34495e;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.3s;
        }
        
        .dungeon-option:hover {
            background-color: #3d566e;
        }
        
        .dungeon-option.selected {
            background-color: #2980b9;
            border: 2px solid #3498db;
        }
        
        .dungeon-option.locked {
            opacity: 0.7;
            cursor: not-allowed;
        }
        
        .dungeon-icon {
            font-size: 2em;
            margin-right: 15px;
            display: flex;
            align-items: center;
        }
        
        .dungeon-info {
            flex: 1;
        }
        
        .dungeon-name {
            font-weight: bold;
            font-size: 1.2em;
            margin-bottom: 5px;
        }
        
        .dungeon-description {
            font-size: 0.9em;
            margin-bottom: 5px;
            color: #bdc3c7;
        }
        
        .dungeon-requirement, .dungeon-progress, .dungeon-completed {
            font-size: 0.8em;
            color: #95a5a6;
        }
        
        .dungeon-locked {
            color: #e74c3c;
            font-weight: bold;
            margin-top: 5px;
        }
    `;
    document.head.appendChild(styleSheet);
});