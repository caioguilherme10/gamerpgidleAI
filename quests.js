// Daily Quests and Achievements System

// Player's quest and achievement progress
let playerQuests = {
    daily: [],
    achievements: []
};

// Daily quest types
const DAILY_QUEST_TYPES = {
    summonHeroes: {
        name: 'Summon Heroes',
        description: 'Summon {target} heroes',
        targets: [1, 3, 5],
        rewards: {
            gems: [20, 50, 100]
        },
        trackFunction: (progress, amount = 1) => {
            progress.current += amount;
            return progress;
        }
    },
    winBattles: {
        name: 'Win Battles',
        description: 'Win {target} battles',
        targets: [3, 5, 10],
        rewards: {
            gold: [500, 1000, 2000],
            exp: [50, 100, 200]
        },
        trackFunction: (progress, amount = 1) => {
            progress.current += amount;
            return progress;
        }
    },
    collectIdleRewards: {
        name: 'Collect Idle Rewards',
        description: 'Collect idle rewards {target} times',
        targets: [1, 3, 5],
        rewards: {
            gold: [200, 500, 1000]
        },
        trackFunction: (progress, amount = 1) => {
            progress.current += amount;
            return progress;
        }
    },
    upgradeHeroes: {
        name: 'Upgrade Heroes',
        description: 'Upgrade heroes {target} times',
        targets: [1, 3, 5],
        rewards: {
            exp: [100, 200, 500]
        },
        trackFunction: (progress, amount = 1) => {
            progress.current += amount;
            return progress;
        }
    },
    equipItems: {
        name: 'Equip Items',
        description: 'Equip {target} items to your heroes',
        targets: [1, 3, 5],
        rewards: {
            gold: [300, 600, 1200]
        },
        trackFunction: (progress, amount = 1) => {
            progress.current += amount;
            return progress;
        }
    }
};

// Achievement types
const ACHIEVEMENT_TYPES = {
    reachLevel: {
        name: 'Player Level',
        description: 'Reach player level {target}',
        targets: [5, 10, 20, 50, 100],
        rewards: {
            gems: [50, 100, 200, 500, 1000]
        },
        checkFunction: (playerLevel) => {
            return playerLevel;
        }
    },
    heroCollection: {
        name: 'Hero Collection',
        description: 'Collect {target} heroes',
        targets: [5, 10, 20, 50, 100],
        rewards: {
            gems: [50, 100, 200, 500, 1000]
        },
        checkFunction: (heroCount) => {
            return heroCount;
        }
    },
    rareHeroes: {
        name: 'Rare Heroes',
        description: 'Collect {target} rare or better heroes',
        targets: [1, 5, 10, 20, 50],
        rewards: {
            gems: [100, 200, 500, 1000, 2000]
        },
        checkFunction: (rareHeroCount) => {
            return rareHeroCount;
        }
    },
    epicHeroes: {
        name: 'Epic Heroes',
        description: 'Collect {target} epic or better heroes',
        targets: [1, 3, 5, 10, 20],
        rewards: {
            gems: [200, 500, 1000, 2000, 5000]
        },
        checkFunction: (epicHeroCount) => {
            return epicHeroCount;
        }
    },
    legendaryHeroes: {
        name: 'Legendary Heroes',
        description: 'Collect {target} legendary heroes',
        targets: [1, 2, 5, 10, 15],
        rewards: {
            gems: [500, 1000, 2000, 5000, 10000]
        },
        checkFunction: (legendaryHeroCount) => {
            return legendaryHeroCount;
        }
    },
    campaignProgress: {
        name: 'Campaign Progress',
        description: 'Complete campaign stage {target}',
        targets: ['1-10', '2-10', '3-10', '4-10', '5-10'],
        rewards: {
            gems: [100, 200, 500, 1000, 2000],
            gold: [1000, 2000, 5000, 10000, 20000]
        },
        checkFunction: (currentStage) => {
            return currentStage;
        }
    },
    equipmentCollection: {
        name: 'Equipment Collection',
        description: 'Collect {target} equipment items',
        targets: [5, 10, 20, 50, 100],
        rewards: {
            gems: [50, 100, 200, 500, 1000]
        },
        checkFunction: (equipmentCount) => {
            return equipmentCount;
        }
    },
    ascendHeroes: {
        name: 'Hero Ascension',
        description: 'Ascend heroes {target} times',
        targets: [1, 5, 10, 20, 50],
        rewards: {
            gems: [100, 200, 500, 1000, 2000]
        },
        checkFunction: (ascensionCount) => {
            return ascensionCount;
        }
    }
};

// Generate daily quests
function generateDailyQuests() {
    // Clear previous daily quests
    playerQuests.daily = [];
    
    // Get all quest types
    const questTypes = Object.keys(DAILY_QUEST_TYPES);
    
    // Randomly select 3 quest types
    const selectedTypes = [];
    while (selectedTypes.length < 3 && questTypes.length > 0) {
        const randomIndex = Math.floor(Math.random() * questTypes.length);
        const questType = questTypes.splice(randomIndex, 1)[0];
        selectedTypes.push(questType);
    }
    
    // Create quests for each selected type
    selectedTypes.forEach(type => {
        const questData = DAILY_QUEST_TYPES[type];
        
        // Create a quest for each target level
        questData.targets.forEach((target, index) => {
            const quest = {
                id: `${type}_${index}`,
                type: type,
                name: questData.name,
                description: questData.description.replace('{target}', target),
                target: target,
                current: 0,
                level: index,
                completed: false,
                claimed: false,
                rewards: {}
            };
            
            // Add rewards
            for (const [rewardType, amounts] of Object.entries(questData.rewards)) {
                quest.rewards[rewardType] = amounts[index];
            }
            
            playerQuests.daily.push(quest);
        });
    });
    
    // Save quests to local storage
    saveQuestsToStorage();
    
    // Render quests
    renderDailyQuests();
}

// Initialize achievements
function initializeAchievements() {
    // Clear previous achievements
    playerQuests.achievements = [];
    
    // Create achievements for each type and level
    for (const [type, achievementData] of Object.entries(ACHIEVEMENT_TYPES)) {
        achievementData.targets.forEach((target, index) => {
            const achievement = {
                id: `${type}_${index}`,
                type: type,
                name: achievementData.name,
                description: achievementData.description.replace('{target}', target),
                target: target,
                level: index,
                completed: false,
                claimed: false,
                rewards: {}
            };
            
            // Add rewards
            for (const [rewardType, amounts] of Object.entries(achievementData.rewards)) {
                achievement.rewards[rewardType] = amounts[index];
            }
            
            playerQuests.achievements.push(achievement);
        });
    }
    
    // Save achievements to local storage
    saveQuestsToStorage();
    
    // Render achievements
    renderAchievements();
}

// Update quest progress
function updateQuestProgress(questType, amount = 1) {
    let updated = false;
    
    // Update daily quests
    playerQuests.daily.forEach(quest => {
        if (quest.type === questType && !quest.completed) {
            const questData = DAILY_QUEST_TYPES[questType];
            const newProgress = questData.trackFunction({
                current: quest.current
            }, amount);
            
            quest.current = newProgress.current;
            
            // Check if completed
            if (quest.current >= quest.target) {
                quest.current = quest.target; // Cap at target
                quest.completed = true;
                addBattleLog(`Daily Quest completed: ${quest.description}!`);
            }
            
            updated = true;
        }
    });
    
    if (updated) {
        saveQuestsToStorage();
        renderDailyQuests();
    }
}

// Check achievement progress
function checkAchievements() {
    let updated = false;
    
    // Check each achievement type
    for (const [type, achievementData] of Object.entries(ACHIEVEMENT_TYPES)) {
        // Get current value based on achievement type
        let currentValue;
        
        switch (type) {
            case 'reachLevel':
                currentValue = playerData.level;
                break;
            case 'heroCollection':
                currentValue = playerHeroes.length;
                break;
            case 'rareHeroes':
                currentValue = playerHeroes.filter(h => 
                    ['rare', 'epic', 'legendary'].includes(h.rarity)
                ).length;
                break;
            case 'epicHeroes':
                currentValue = playerHeroes.filter(h => 
                    ['epic', 'legendary'].includes(h.rarity)
                ).length;
                break;
            case 'legendaryHeroes':
                currentValue = playerHeroes.filter(h => 
                    h.rarity === 'legendary'
                ).length;
                break;
            case 'campaignProgress':
                currentValue = document.getElementById('current-stage').textContent;
                break;
            case 'equipmentCollection':
                currentValue = playerEquipment.length;
                break;
            case 'ascendHeroes':
                // This is tracked separately when heroes are ascended
                continue;
            default:
                continue;
        }
        
        // Check each achievement of this type
        playerQuests.achievements.forEach(achievement => {
            if (achievement.type === type && !achievement.completed) {
                // Compare current value with target
                let completed = false;
                
                if (type === 'campaignProgress') {
                    // Special handling for campaign stages
                    const currentStage = currentValue.split('-').map(Number);
                    const targetStage = achievement.target.split('-').map(Number);
                    
                    if (currentStage[0] > targetStage[0] || 
                        (currentStage[0] === targetStage[0] && currentStage[1] >= targetStage[1])) {
                        completed = true;
                    }
                } else {
                    // Numeric comparison
                    completed = currentValue >= achievement.target;
                }
                
                if (completed) {
                    achievement.completed = true;
                    addBattleLog(`Achievement unlocked: ${achievement.description}!`);
                    updated = true;
                }
            }
        });
    }
    
    if (updated) {
        saveQuestsToStorage();
        renderAchievements();
    }
}

// Track hero ascension for achievements
function trackHeroAscension() {
    // Find the ascendHeroes achievement type
    const ascensionAchievements = playerQuests.achievements.filter(a => 
        a.type === 'ascendHeroes' && !a.completed
    );
    
    if (ascensionAchievements.length > 0) {
        // Get player's ascension count from storage or initialize
        let ascensionCount = parseInt(localStorage.getItem('heroAscensionCount') || '0');
        ascensionCount++;
        localStorage.setItem('heroAscensionCount', ascensionCount.toString());
        
        // Update achievements
        let updated = false;
        ascensionAchievements.forEach(achievement => {
            if (ascensionCount >= achievement.target) {
                achievement.completed = true;
                addBattleLog(`Achievement unlocked: ${achievement.description}!`);
                updated = true;
            }
        });
        
        if (updated) {
            saveQuestsToStorage();
            renderAchievements();
        }
    }
}

// Claim quest or achievement reward
function claimReward(id, isAchievement = false) {
    const collection = isAchievement ? playerQuests.achievements : playerQuests.daily;
    const item = collection.find(i => i.id === id);
    
    if (!item || !item.completed || item.claimed) {
        return false;
    }
    
    // Add rewards to player
    for (const [rewardType, amount] of Object.entries(item.rewards)) {
        switch (rewardType) {
            case 'gold':
                document.getElementById('gold-amount').textContent = 
                    parseInt(document.getElementById('gold-amount').textContent) + amount;
                break;
            case 'gems':
                document.getElementById('gems-amount').textContent = 
                    parseInt(document.getElementById('gems-amount').textContent) + amount;
                break;
            case 'exp':
                document.getElementById('exp-amount').textContent = 
                    parseInt(document.getElementById('exp-amount').textContent) + amount;
                // Check if player can level up
                checkPlayerLevelUp();
                break;
        }
    }
    
    // Mark as claimed
    item.claimed = true;
    
    // Save to storage
    saveQuestsToStorage();
    
    // Update UI
    if (isAchievement) {
        renderAchievements();
    } else {
        renderDailyQuests();
    }
    
    addBattleLog(`Claimed rewards for ${item.description}!`);
    return true;
}

// Save quests and achievements to local storage
function saveQuestsToStorage() {
    localStorage.setItem('playerQuests', JSON.stringify(playerQuests));
}

// Load quests and achievements from local storage
function loadQuestsFromStorage() {
    const savedQuests = localStorage.getItem('playerQuests');
    if (savedQuests) {
        playerQuests = JSON.parse(savedQuests);
    } else {
        // Initialize if not found
        generateDailyQuests();
        initializeAchievements();
    }
}

// Render daily quests
function renderDailyQuests() {
    // Check if quests UI exists, if not create it
    let questsContainer = document.getElementById('quests-container');
    
    if (!questsContainer) {
        // Create quests UI
        questsContainer = document.createElement('div');
        questsContainer.id = 'quests-container';
        questsContainer.className = 'progression-container';
        
        // Insert after progression container
        const progressionContainer = document.querySelector('.progression-container');
        if (progressionContainer && progressionContainer.parentNode) {
            progressionContainer.parentNode.insertBefore(questsContainer, progressionContainer.nextSibling);
        } else {
            // Fallback to appending to game-main
            document.querySelector('.game-main').appendChild(questsContainer);
        }
    }
    
    // Clear container
    questsContainer.innerHTML = '';
    
    // Add title
    const title = document.createElement('h2');
    title.textContent = 'Daily Quests';
    questsContainer.appendChild(title);
    
    // Add quests
    const questsList = document.createElement('div');
    questsList.className = 'quests-list';
    
    playerQuests.daily.forEach(quest => {
        const questItem = document.createElement('div');
        questItem.className = 'quest-item';
        
        const questName = document.createElement('div');
        questName.className = 'quest-name';
        questName.textContent = quest.description;
        
        const questProgress = document.createElement('div');
        questProgress.className = 'quest-progress';
        questProgress.textContent = `Progress: ${quest.current}/${quest.target}`;
        
        const questRewards = document.createElement('div');
        questRewards.className = 'quest-rewards';
        questRewards.innerHTML = '<strong>Rewards:</strong> ';
        
        for (const [rewardType, amount] of Object.entries(quest.rewards)) {
            questRewards.innerHTML += `${amount} ${rewardType}, `;
        }
        // Remove trailing comma and space
        questRewards.innerHTML = questRewards.innerHTML.slice(0, -2);
        
        questItem.appendChild(questName);
        questItem.appendChild(questProgress);
        questItem.appendChild(questRewards);
        
        // Add claim button if completed and not claimed
        if (quest.completed && !quest.claimed) {
            const claimButton = document.createElement('button');
            claimButton.className = 'action-button';
            claimButton.textContent = 'Claim Rewards';
            claimButton.addEventListener('click', () => claimReward(quest.id));
            questItem.appendChild(claimButton);
        } else if (quest.claimed) {
            const claimedTag = document.createElement('div');
            claimedTag.className = 'claimed-tag';
            claimedTag.textContent = 'Claimed';
            questItem.appendChild(claimedTag);
        }
        
        questsList.appendChild(questItem);
    });
    
    questsContainer.appendChild(questsList);
    
    // Add refresh button (only available once per day)
    const refreshButton = document.createElement('button');
    refreshButton.className = 'action-button';
    refreshButton.textContent = 'Refresh Quests';
    refreshButton.addEventListener('click', refreshDailyQuests);
    
    // Check if refresh is available
    const lastRefresh = localStorage.getItem('lastQuestRefresh');
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    if (lastRefresh && now - parseInt(lastRefresh) < oneDayMs) {
        refreshButton.disabled = true;
        const nextRefreshTime = new Date(parseInt(lastRefresh) + oneDayMs);
        refreshButton.title = `Available at ${nextRefreshTime.toLocaleTimeString()}`;
    }
    
    questsContainer.appendChild(refreshButton);
    
    // Add achievements button
    const achievementsButton = document.createElement('button');
    achievementsButton.className = 'action-button';
    achievementsButton.textContent = 'View Achievements';
    achievementsButton.addEventListener('click', showAchievements);
    questsContainer.appendChild(achievementsButton);
}

// Render achievements
function renderAchievements() {
    // Check if achievements UI exists, if not create it
    let achievementsContainer = document.getElementById('achievements-container');
    
    if (!achievementsContainer) {
        // Create achievements UI
        achievementsContainer = document.createElement('div');
        achievementsContainer.id = 'achievements-container';
        achievementsContainer.className = 'modal';
        
        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        
        // Add close button
        const closeBtn = document.createElement('span');
        closeBtn.className = 'close-modal';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', () => {
            achievementsContainer.style.display = 'none';
        });
        
        modalContent.appendChild(closeBtn);
        
        // Add title
        const title = document.createElement('h2');
        title.textContent = 'Achievements';
        modalContent.appendChild(title);
        
        // Create achievements list container
        const achievementsList = document.createElement('div');
        achievementsList.className = 'achievements-list';
        modalContent.appendChild(achievementsList);
        
        achievementsContainer.appendChild(modalContent);
        document.body.appendChild(achievementsContainer);
    }
    
    // Get achievements list container
    const achievementsList = document.querySelector('#achievements-container .achievements-list');
    achievementsList.innerHTML = '';
    
    // Group achievements by type
    const achievementsByType = {};
    playerQuests.achievements.forEach(achievement => {
        if (!achievementsByType[achievement.type]) {
            achievementsByType[achievement.type] = [];
        }
        achievementsByType[achievement.type].push(achievement);
    });
    
    // Add achievements by type
    for (const [type, achievements] of Object.entries(achievementsByType)) {
        // Add type header
        const typeHeader = document.createElement('h3');
        typeHeader.textContent = ACHIEVEMENT_TYPES[type].name;
        achievementsList.appendChild(typeHeader);
        
        // Sort achievements by level
        achievements.sort((a, b) => a.level - b.level);
        
        // Add achievements
        achievements.forEach(achievement => {
            const achievementItem = document.createElement('div');
            achievementItem.className = 'achievement-item';
            
            if (achievement.completed) {
                achievementItem.classList.add('completed');
            }
            
            const achievementName = document.createElement('div');
            achievementName.className = 'achievement-name';
            achievementName.textContent = achievement.description;
            
            const achievementRewards = document.createElement('div');
            achievementRewards.className = 'achievement-rewards';
            achievementRewards.innerHTML = '<strong>Rewards:</strong> ';
            
            for (const [rewardType, amount] of Object.entries(achievement.rewards)) {
                achievementRewards.innerHTML += `${amount} ${rewardType}, `;
            }
            // Remove trailing comma and space
            achievementRewards.innerHTML = achievementRewards.innerHTML.slice(0, -2);
            
            achievementItem.appendChild(achievementName);
            achievementItem.appendChild(achievementRewards);
            
            // Add claim button if completed and not claimed
            if (achievement.completed && !achievement.claimed) {
                const claimButton = document.createElement('button');
                claimButton.className = 'action-button';
                claimButton.textContent = 'Claim Rewards';
                claimButton.addEventListener('click', () => claimReward(achievement.id, true));
                achievementItem.appendChild(claimButton);
            } else if (achievement.claimed) {
                const claimedTag = document.createElement('div');
                claimedTag.className = 'claimed-tag';
                claimedTag.textContent = 'Claimed';
                achievementItem.appendChild(claimedTag);
            }
            
            achievementsList.appendChild(achievementItem);
        });
    }
}

// Show achievements modal
function showAchievements() {
    const achievementsContainer = document.getElementById('achievements-container');
    if (achievementsContainer) {
        achievementsContainer.style.display = 'block';
    }
}

// Refresh daily quests
function refreshDailyQuests() {
    const lastRefresh = localStorage.getItem('lastQuestRefresh');
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    if (lastRefresh && now - parseInt(lastRefresh) < oneDayMs) {
        addBattleLog('You can only refresh quests once per day!');
        return false;
    }
    
    // Generate new quests
    generateDailyQuests();
    
    // Update last refresh time
    localStorage.setItem('lastQuestRefresh', now.toString());
    
    addBattleLog('Daily quests refreshed!');
    return true;
}

// Initialize quest system
function initializeQuestSystem() {
    // Add CSS for quests UI
    const style = document.createElement('style');
    style.textContent = `
        .quest-item, .achievement-item {
            background-color: rgba(15, 52, 96, 0.5);
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 10px;
            position: relative;
        }
        
        .quest-name, .achievement-name {
            font-size: 1.1em;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .quest-progress {
            font-size: 0.9em;
            margin-bottom: 5px;
        }
        
        .quest-rewards, .achievement-rewards {
            font-size: 0.9em;
            margin-bottom: 10px;
        }
        
        .claimed-tag {
            position: absolute;
            top: 5px;
            right: 5px;
            background-color: #4CAF50;
            color: white;
            padding: 2px 5px;
            border-radius: 3px;
            font-size: 0.7em;
        }
        
        .achievement-item.completed {
            border: 1px solid #4CAF50;
        }
        
        .achievement-item:not(.completed) {
            opacity: 0.7;
        }
        
        .achievements-list {
            max-height: 500px;
            overflow-y: auto;
            padding-right: 10px;
        }
        
        .achievements-list h3 {
            margin-top: 15px;
            padding-bottom: 5px;
            border-bottom: 1px solid #e94560;
        }
    `;
    document.head.appendChild(style);
    
    // Load quests from storage or initialize new ones
    loadQuestsFromStorage();
    
    // Render quests
    renderDailyQuests();
    
    // Check achievements
    checkAchievements();
    
    // Hook into game events to track quest progress
    hookQuestEvents();
}

// Hook into game events to track quest progress
function hookQuestEvents() {
    // Hook into summon hero
    const originalSummonHero = summonHero;
    summonHero = function() {
        const result = originalSummonHero.apply(this, arguments);
        updateQuestProgress('summonHeroes');
        return result;
    };
    
    // Hook into battle end
    const originalCheckBattleEnd = checkBattleEnd;
    checkBattleEnd = function() {
        const result = originalCheckBattleEnd.apply(this, arguments);
        
        // If battle ended and player won
        if (result && !battleState.inProgress && battleState.enemyTeam.every(enemy => enemy.currentHealth <= 0)) {
            updateQuestProgress('winBattles');
        }
        
        return result;
    };
    
    // Hook into collect idle rewards
    const originalCollectIdleRewards = collectIdleRewards;
    collectIdleRewards = function() {
        const result = originalCollectIdleRewards.apply(this, arguments);
        updateQuestProgress('collectIdleRewards');
        return result;
    };
    
    // Hook into upgrade hero
    const originalUpgradeHero = upgradeHero;
    upgradeHero = function() {
        const result = originalUpgradeHero.apply(this, arguments);
        if (result) {
            updateQuestProgress('upgradeHeroes');
        }
        return result;
    };
    
    // Hook into equip item
    const originalEquipItem = equipItem;
    equipItem = function() {
        const result = originalEquipItem.apply(this, arguments);
        if (result) {
            updateQuestProgress('equipItems');
        }
        return result;
    };
    
    // Check achievements periodically
    setInterval(checkAchievements, 60000); // Check every minute
}

// Call initialization when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    // This will be called after the main game initialization
    setTimeout(initializeQuestSystem, 300);
});