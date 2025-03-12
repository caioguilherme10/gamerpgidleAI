// Battle system

// Current battle state
let battleState = {
    inProgress: false,
    playerTeam: [],
    enemyTeam: [],
    turnOrder: [],
    currentTurn: 0,
    effects: [],
    autoBattle: false
};

// Start a battle with the current stage
function startBattle() {
    if (battleState.inProgress) return;
    
    // Get current stage
    const currentStage = document.getElementById('current-stage').textContent;
    const stageData = CAMPAIGN_STAGES[currentStage];
    
    if (!stageData) {
        addBattleLog('Invalid stage!');
        return;
    }
    
    // Check if player has heroes in battle
    if (battleState.playerTeam.length === 0) {
        addBattleLog('You need to add heroes to your team first!');
        return;
    }
    
    // Clear previous battle
    clearBattleState();
    
    // Set battle in progress
    battleState.inProgress = true;
    
    // Generate enemy team
    stageData.enemies.forEach(enemyData => {
        const enemy = generateEnemy(enemyData.class, enemyData.level, enemyData.rarity);
        battleState.enemyTeam.push(enemy);
    });
    
    // Determine turn order based on speed
    determineTurnOrder();
    
    // Render battle
    renderBattle();
    
    // Start battle
    addBattleLog('Battle started!');
    processTurn();
}

// Generate an enemy based on class, level and rarity
function generateEnemy(enemyClass, level, rarity) {
    const baseStats = HERO_CLASSES[enemyClass].baseStats;
    const rarityMultiplier = RARITIES[rarity].multiplier;
    const levelMultiplier = 1 + (level - 1) * 0.1;
    
    const stats = {
        health: Math.floor(baseStats.health * rarityMultiplier * levelMultiplier),
        attack: Math.floor(baseStats.attack * rarityMultiplier * levelMultiplier),
        defense: Math.floor(baseStats.defense * rarityMultiplier * levelMultiplier),
        speed: Math.floor(baseStats.speed * rarityMultiplier * levelMultiplier)
    };
    
    // Create enemy object
    const enemy = {
        id: 'enemy-' + Date.now() + Math.floor(Math.random() * 1000),
        name: HERO_NAMES[Math.floor(Math.random() * HERO_NAMES.length)],
        class: enemyClass,
        rarity: rarity,
        level: level,
        stats: stats,
        currentHealth: stats.health,
        abilities: HERO_CLASSES[enemyClass].abilities,
        isEnemy: true
    };
    
    return enemy;
}

// Clear battle state
function clearBattleState() {
    battleState.inProgress = false;
    battleState.enemyTeam = [];
    battleState.turnOrder = [];
    battleState.currentTurn = 0;
    battleState.effects = [];
    battleState.autoBattle = false;
    
    // Reset player heroes' current health
    battleState.playerTeam.forEach(hero => {
        hero.currentHealth = hero.stats.health;
    });
    
    // Reset pet ability cooldowns
    resetPetAbilityCooldowns();
    
    // Clear battle log
    document.getElementById('battle-log').innerHTML = '';
}

// Determine turn order based on speed
function determineTurnOrder() {
    // Combine player and enemy teams
    const allUnits = [...battleState.playerTeam, ...battleState.enemyTeam];
    
    // Sort by speed (descending)
    allUnits.sort((a, b) => b.stats.speed - a.stats.speed);
    
    battleState.turnOrder = allUnits;
}

// Process a single turn
function processTurn() {
    if (!battleState.inProgress) return;
    
    // Check if battle is over
    if (checkBattleEnd()) return;
    
    // Get current unit
    const currentUnit = battleState.turnOrder[battleState.currentTurn];
    
    // Process effects
    processEffects(currentUnit);
    
    // Check if unit is still alive
    if (currentUnit.currentHealth <= 0) {
        // Skip turn if unit is dead
        nextTurn();
        return;
    }
    
    // Check for pet ability activation (for player heroes)
    if (!currentUnit.isEnemy && Math.random() < 0.3) { // 30% chance to activate pet ability
        const petId = equippedPets[currentUnit.id];
        if (petId) {
            const petAbilityUsed = usePetAbility(currentUnit.id);
            if (petAbilityUsed) {
                // Render battle to show effects
                renderBattle();
                // Small delay before continuing with turn
                setTimeout(() => {
                    continueWithTurn(currentUnit);
                }, 1000);
                return;
            }
        }
    }
    
    // Continue with normal turn
    continueWithTurn(currentUnit);
}

// Continue with turn after pet ability check
function continueWithTurn(currentUnit) {
    // AI decision for enemies or auto-battle
    if (currentUnit.isEnemy || battleState.autoBattle) {
        setTimeout(() => {
            aiAction(currentUnit);
            nextTurn();
        }, 1000); // Delay for visual effect
    } else {
        // Player's turn - wait for input
        // Show action buttons
        document.getElementById('action-buttons').style.display = 'flex';
        document.getElementById('start-battle').style.display = 'none';
        document.getElementById('auto-battle').style.display = 'none';
        
        addBattleLog(`${currentUnit.name}'s turn. Choose an action.`);
    }
}

// Handle basic attack action
function handleBasicAttack() {
    if (!battleState.inProgress) return;
    
    // Get current unit
    const currentUnit = battleState.turnOrder[battleState.currentTurn];
    
    // Get alive enemy targets
    const targets = battleState.enemyTeam.filter(target => target.currentHealth > 0);
    
    if (targets.length === 0) {
        addBattleLog('No targets available!');
        return;
    }
    
    // Show target selection UI
    showTargetSelection(targets, (target) => {
        // Perform basic attack
        basicAttack(currentUnit, target);
        
        // Hide action buttons and target selection
        hideActionButtons();
        hideTargetSelection();
        
        // Move to next turn
        setTimeout(() => {
            nextTurn();
        }, 1000);
    });
}

// Handle special ability action
function handleSpecialAbility() {
    if (!battleState.inProgress) return;
    
    // Get current unit
    const currentUnit = battleState.turnOrder[battleState.currentTurn];
    
    // Check if unit has abilities
    if (!currentUnit.abilities || currentUnit.abilities.length === 0) {
        addBattleLog(`${currentUnit.name} has no special abilities!`);
        return;
    }
    
    // Show ability selection UI if multiple abilities
    if (currentUnit.abilities.length > 1) {
        showAbilitySelection(currentUnit.abilities, (selectedAbility) => {
            handleAbilityTarget(currentUnit, selectedAbility);
        });
    } else {
        handleAbilityTarget(currentUnit, currentUnit.abilities[0]);
    }
}

// Helper function to handle ability target selection
function handleAbilityTarget(currentUnit, ability) {
    // Get alive enemy targets
    const targets = battleState.enemyTeam.filter(target => target.currentHealth > 0);
    
    if (targets.length === 0) {
        addBattleLog('No targets available!');
        return;
    }
    
    // Show target selection UI
    showTargetSelection(targets, (target) => {
        // Use ability
        useAbilityAction(currentUnit, target, ability);
        
        // Hide action buttons and target selection
        hideActionButtons();
        hideTargetSelection();
        
        // Move to next turn
        setTimeout(() => {
            nextTurn();
        }, 1000);
    });
}

// Show target selection UI
function showTargetSelection(targets, onSelect) {
    const targetSelection = document.createElement('div');
    targetSelection.id = 'target-selection';
    targetSelection.className = 'target-selection';
    
    const title = document.createElement('div');
    title.textContent = 'Select a target:';
    title.className = 'target-selection-title';
    targetSelection.appendChild(title);
    
    targets.forEach(target => {
        const targetButton = document.createElement('button');
        targetButton.className = 'target-button action-button';
        targetButton.textContent = `${target.name} (HP: ${target.currentHealth}/${target.stats.health})`;
        targetButton.onclick = () => onSelect(target);
        targetSelection.appendChild(targetButton);
    });
    
    const cancelButton = document.createElement('button');
    cancelButton.className = 'action-button';
    cancelButton.textContent = 'Cancel';
    cancelButton.onclick = () => {
        hideTargetSelection();
        handleCancelAction();
    };
    targetSelection.appendChild(cancelButton);
    
    document.querySelector('.battle-controls').appendChild(targetSelection);
}

// Show ability selection UI
function showAbilitySelection(abilities, onSelect) {
    const abilitySelection = document.createElement('div');
    abilitySelection.id = 'ability-selection';
    abilitySelection.className = 'target-selection';
    
    const title = document.createElement('div');
    title.textContent = 'Select an ability:';
    title.className = 'target-selection-title';
    abilitySelection.appendChild(title);
    
    abilities.forEach(ability => {
        const abilityButton = document.createElement('button');
        abilityButton.className = 'target-button action-button';
        abilityButton.textContent = ability.name;
        abilityButton.onclick = () => {
            hideAbilitySelection();
            onSelect(ability);
        };
        abilitySelection.appendChild(abilityButton);
    });
    
    const cancelButton = document.createElement('button');
    cancelButton.className = 'action-button';
    cancelButton.textContent = 'Cancel';
    cancelButton.onclick = () => {
        hideAbilitySelection();
        handleCancelAction();
    };
    abilitySelection.appendChild(cancelButton);
    
    document.querySelector('.battle-controls').appendChild(abilitySelection);
}

// Hide target selection UI
function hideTargetSelection() {
    const targetSelection = document.getElementById('target-selection');
    if (targetSelection) {
        targetSelection.remove();
    }
}

// Hide ability selection UI
function hideAbilitySelection() {
    const abilitySelection = document.getElementById('ability-selection');
    if (abilitySelection) {
        abilitySelection.remove();
    }
}

// Hide action buttons and show battle controls
function hideActionButtons() {
    document.getElementById('action-buttons').style.display = 'none';
    document.getElementById('start-battle').style.display = 'inline-block';
    document.getElementById('auto-battle').style.display = 'inline-block';
}

// Handle cancel action
function handleCancelAction() {
    // Hide action buttons
    document.getElementById('action-buttons').style.display = 'none';
    document.getElementById('start-battle').style.display = 'inline-block';
    document.getElementById('auto-battle').style.display = 'inline-block';
    
    // Hide target and ability selection if visible
    hideTargetSelection();
    hideAbilitySelection();
    
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

// AI action for enemies or auto-battle
function aiAction(unit) {
    // Determine targets
    const targets = unit.isEnemy ? battleState.playerTeam : battleState.enemyTeam;
    
    // Filter alive targets
    const aliveTargets = targets.filter(target => target.currentHealth > 0);
    
    if (aliveTargets.length === 0) return;
    
    // Choose random target
    const target = aliveTargets[Math.floor(Math.random() * aliveTargets.length)];
    
    // Choose action (basic attack or ability)
    const useAbility = Math.random() > 0.7; // 30% chance to use ability
    
    if (useAbility && unit.abilities && unit.abilities.length > 0) {
        // Choose random ability
        const ability = unit.abilities[Math.floor(Math.random() * unit.abilities.length)];
        
        // Use ability
        useAbilityAction(unit, target, ability);
    } else {
        // Basic attack
        basicAttack(unit, target);
    }
}

// Basic attack
function basicAttack(attacker, defender) {
    // Calculate damage
    let damage = Math.max(1, attacker.stats.attack - defender.stats.defense / 2);
    
    // Apply damage
    defender.currentHealth = Math.max(0, defender.currentHealth - damage);
    
    // Log action
    const actionClass = attacker.isEnemy ? 'enemy-action' : 'player-action';
    addBattleLog(`<span class="${actionClass}">${attacker.name} attacks ${defender.name} for ${damage} damage!</span>`);
    
    // Check if defender is defeated
    if (defender.currentHealth <= 0) {
        addBattleLog(`${defender.name} is defeated!`);
    }
    
    // Update UI
    renderBattle();
}

// Use ability
function useAbilityAction(user, target, ability) {
    // Get DOM elements for animation
    const userElement = document.getElementById(user.id);
    const targetElement = document.getElementById(target.id);
    
    if (userElement) {
        // Add ability cast animation
        userElement.classList.add('casting-ability');
        
        // Remove animation class after animation completes
        setTimeout(() => {
            userElement.classList.remove('casting-ability');
        }, 800);
    }
    
    if (ability.damage) {
        // Damage ability
        let damage = Math.max(1, user.stats.attack * ability.damage - target.stats.defense / 2);
        target.currentHealth = Math.max(0, target.currentHealth - damage);
        
        // Add damage animation with slight delay
        if (targetElement) {
            setTimeout(() => {
                targetElement.classList.add('damaged');
                
                // Remove animation class after animation completes
                setTimeout(() => {
                    targetElement.classList.remove('damaged');
                    
                    // Add defeated animation if applicable
                    if (target.currentHealth <= 0) {
                        targetElement.classList.add('defeated');
                    }
                }, 500);
            }, 300);
        }
        
        const actionClass = user.isEnemy ? 'enemy-action' : 'player-action';
        addBattleLog(`<span class="${actionClass}">${user.name} uses ${ability.name} on ${target.name} for ${damage} damage!</span>`);
        
        if (target.currentHealth <= 0) {
            addBattleLog(`${target.name} is defeated!`);
        }
    } else if (ability.effect) {
        // Effect ability
        const effect = {
            type: ability.effect,
            value: ability.value,
            duration: 2, // Default duration
            target: ability.effect === 'heal' ? target.id : user.id
        };
        
        // Apply immediate effects
        if (ability.effect === 'heal') {
            const healAmount = Math.floor(target.stats.health * ability.value);
            target.currentHealth = Math.min(target.stats.health, target.currentHealth + healAmount);
            
            // Add healing animation with slight delay
            if (targetElement) {
                setTimeout(() => {
                    targetElement.classList.add('healing');
                    
                    // Remove animation class after animation completes
                    setTimeout(() => {
                        targetElement.classList.remove('healing');
                    }, 1000);
                }, 300);
            }
            
            addBattleLog(`${user.name} heals ${target.name} for ${healAmount} health!`);
        } else {
            // Add effect to active effects
            battleState.effects.push(effect);
            addBattleLog(`${user.name} uses ${ability.name}!`);
        }
    }
    
    // Update UI
    renderBattle();
}

// Process active effects
function processEffects(unit) {
    // Filter effects for this unit
    const unitEffects = battleState.effects.filter(effect => effect.target === unit.id);
    
    // Apply effects
    unitEffects.forEach(effect => {
        if (effect.type === 'defense') {
            // Defense buff is applied during damage calculation
        } else if (effect.type === 'attack') {
            // Attack buff is applied during damage calculation
        }
        
        // Decrease duration
        effect.duration--;
    });
    
    // Remove expired effects
    battleState.effects = battleState.effects.filter(effect => effect.duration > 0);
}

// Move to next turn
function nextTurn() {
    battleState.currentTurn = (battleState.currentTurn + 1) % battleState.turnOrder.length;
    
    // Process next turn
    processTurn();
}

// Check if battle is over
function checkBattleEnd() {
    // Check if all player heroes are defeated
    const allPlayerDefeated = battleState.playerTeam.every(hero => hero.currentHealth <= 0);
    
    // Check if all enemies are defeated
    const allEnemiesDefeated = battleState.enemyTeam.every(enemy => enemy.currentHealth <= 0);
    
    if (allPlayerDefeated) {
        // Player lost
        battleState.inProgress = false;
        addBattleLog('You lost the battle!');
        
        // Check if this is a dungeon battle
        if (currentDungeonRun && currentDungeonRun.inProgress) {
            // Handle dungeon battle failure
            handleDungeonBattleComplete(false);
        }
        
        return true;
    } else if (allEnemiesDefeated) {
        // Player won
        battleState.inProgress = false;
        
        // Check if this is a dungeon battle
        if (currentDungeonRun && currentDungeonRun.inProgress) {
            // Handle dungeon battle completion
            handleDungeonBattleComplete(true);
            
            // Add pet experience after battle
            addPetExperienceAfterBattle(true);
        } else {
            // Regular campaign battle
            // Get current stage and rewards
            const currentStage = document.getElementById('current-stage').textContent;
            const stageData = CAMPAIGN_STAGES[currentStage];
            
            // Award rewards
            if (stageData && stageData.rewards) {
                const rewards = stageData.rewards;
                
                // Update resources
                document.getElementById('gold-amount').textContent = 
                    parseInt(document.getElementById('gold-amount').textContent) + rewards.gold;
                
                document.getElementById('exp-amount').textContent = 
                    parseInt(document.getElementById('exp-amount').textContent) + rewards.exp;
                
                document.getElementById('gems-amount').textContent = 
                    parseInt(document.getElementById('gems-amount').textContent) + rewards.gems;
                
                // Log rewards
                addBattleLog(`Victory! You earned ${rewards.gold} gold, ${rewards.exp} EXP, and ${rewards.gems} gems!`);
                
                // Unlock next stage if available
                unlockNextStage(currentStage);
                
                // Add pet experience after battle
                addPetExperienceAfterBattle(true);
                
                // Check for new unlockable pets
                checkForNewPets();
            }
        }
        
        return true;
    }
    
    return false;
}

// Unlock next stage
function unlockNextStage(currentStage) {
    const [chapter, stage] = currentStage.split('-').map(Number);
    
    // Determine next stage
    let nextStage;
    if (stage < 5) {
        nextStage = `${chapter}-${stage + 1}`;
    } else {
        nextStage = `${chapter + 1}-1`;
    }
    
    // Check if next stage exists
    if (CAMPAIGN_STAGES[nextStage]) {
        document.getElementById('current-stage').textContent = nextStage;
        
        // Update stage rewards display
        const rewards = CAMPAIGN_STAGES[nextStage].rewards;
        document.getElementById('stage-rewards').textContent = 
            `${rewards.gold} Gold, ${rewards.exp} EXP, ${rewards.gems} Gems`;
        
        addBattleLog(`Unlocked stage ${nextStage}!`);
    } else {
        addBattleLog('Congratulations! You have completed all available stages!');
    }
}

// Render battle state
function renderBattle() {
    // Render player team
    const playerTeamElement = document.getElementById('player-team');
    playerTeamElement.innerHTML = '';
    
    battleState.playerTeam.forEach(hero => {
        const heroElement = document.createElement('div');
        heroElement.className = 'battle-hero';
        heroElement.id = hero.id; // Add ID for targeting with animations
        heroElement.style.backgroundColor = HERO_CLASSES[hero.class].color;
        heroElement.innerHTML = HERO_CLASSES[hero.class].icon;
        
        // Add health bar
        const healthBar = document.createElement('div');
        healthBar.className = 'battle-hero-health';
        const healthPercent = (hero.currentHealth / hero.stats.health) * 100;
        healthBar.style.width = `${healthPercent}%`;
        
        // Change color based on health
        if (healthPercent < 25) {
            healthBar.style.backgroundColor = '#e74c3c';
        } else if (healthPercent < 50) {
            healthBar.style.backgroundColor = '#f39c12';
        }
        
        // Gray out if defeated
        if (hero.currentHealth <= 0) {
            heroElement.style.opacity = '0.5';
            heroElement.classList.add('defeated');
        }
        
        heroElement.appendChild(healthBar);
        playerTeamElement.appendChild(heroElement);
    });
    
    // Render enemy team
    const enemyTeamElement = document.getElementById('enemy-team');
    enemyTeamElement.innerHTML = '';
    
    battleState.enemyTeam.forEach(enemy => {
        const enemyElement = document.createElement('div');
        enemyElement.className = 'battle-hero';
        enemyElement.id = enemy.id; // Add ID for targeting with animations
        enemyElement.style.backgroundColor = HERO_CLASSES[enemy.class].color;
        enemyElement.innerHTML = HERO_CLASSES[enemy.class].icon;
        
        // Add health bar
        const healthBar = document.createElement('div');
        healthBar.className = 'battle-hero-health';
        const healthPercent = (enemy.currentHealth / enemy.stats.health) * 100;
        healthBar.style.width = `${healthPercent}%`;
        
        // Change color based on health
        if (healthPercent < 25) {
            healthBar.style.backgroundColor = '#e74c3c';
        } else if (healthPercent < 50) {
            healthBar.style.backgroundColor = '#f39c12';
        }
        
        // Gray out if defeated
        if (enemy.currentHealth <= 0) {
            enemyElement.style.opacity = '0.5';
            enemyElement.classList.add('defeated');
        }
        
        enemyElement.appendChild(healthBar);
        enemyTeamElement.appendChild(enemyElement);
    });
    
    // Highlight current turn unit
    if (battleState.inProgress && battleState.turnOrder.length > 0) {
        const currentUnit = battleState.turnOrder[battleState.currentTurn];
        const allHeroes = document.querySelectorAll('.battle-hero');
        
        // Reset all highlights
        allHeroes.forEach(hero => {
            hero.style.boxShadow = 'none';
            hero.style.animation = 'none';
        });
        
        // Highlight current unit
        const unitIndex = currentUnit.isEnemy ? 
            battleState.playerTeam.length + battleState.enemyTeam.indexOf(currentUnit) : 
            battleState.playerTeam.indexOf(currentUnit);
        
        if (allHeroes[unitIndex]) {
            allHeroes[unitIndex].style.boxShadow = '0 0 10px #e94560, 0 0 20px #e94560';
            // Add subtle pulsing animation to current unit
            allHeroes[unitIndex].style.animation = 'ability-cast 2s ease-in-out infinite';
        }
    }
}