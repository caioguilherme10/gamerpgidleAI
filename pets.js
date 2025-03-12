// Pet System

// Pet types with their abilities and stat bonuses
const PET_TYPES = {
    wolf: {
        name: 'Wolf',
        icon: '🐺',
        description: 'A loyal wolf that boosts attack',
        baseStats: {
            attack: 5,
            defense: 2,
            health: 30,
            speed: 8
        },
        statBonus: {
            attack: 0.1 // 10% attack bonus to hero
        },
        ability: {
            name: 'Howl',
            description: 'Increases team attack by 5% for 2 turns',
            effect: 'attack',
            value: 0.05,
            duration: 2,
            cooldown: 3
        },
        unlockLevel: 5
    },
    owl: {
        name: 'Owl',
        icon: '🦉',
        description: 'A wise owl that increases critical chance',
        baseStats: {
            attack: 3,
            defense: 1,
            health: 20,
            speed: 10
        },
        statBonus: {
            critChance: 0.05 // 5% crit chance bonus to hero
        },
        ability: {
            name: 'Foresight',
            description: 'Increases dodge chance by 10% for 2 turns',
            effect: 'dodge',
            value: 0.1,
            duration: 2,
            cooldown: 3
        },
        unlockLevel: 8
    },
    turtle: {
        name: 'Turtle',
        icon: '🐢',
        description: 'A sturdy turtle that boosts defense',
        baseStats: {
            attack: 1,
            defense: 8,
            health: 50,
            speed: 3
        },
        statBonus: {
            defense: 0.1 // 10% defense bonus to hero
        },
        ability: {
            name: 'Shell Shield',
            description: 'Reduces damage taken by 15% for 2 turns',
            effect: 'damageReduction',
            value: 0.15,
            duration: 2,
            cooldown: 4
        },
        unlockLevel: 10
    },
    rabbit: {
        name: 'Rabbit',
        icon: '🐰',
        description: 'A quick rabbit that increases speed',
        baseStats: {
            attack: 2,
            defense: 2,
            health: 25,
            speed: 12
        },
        statBonus: {
            speed: 0.1 // 10% speed bonus to hero
        },
        ability: {
            name: 'Quick Hop',
            description: 'Increases team speed by 8% for 2 turns',
            effect: 'speed',
            value: 0.08,
            duration: 2,
            cooldown: 3
        },
        unlockLevel: 12
    },
    dragon: {
        name: 'Baby Dragon',
        icon: '🐉',
        description: 'A rare baby dragon with balanced stats',
        baseStats: {
            attack: 7,
            defense: 5,
            health: 40,
            speed: 7
        },
        statBonus: {
            attack: 0.07,
            defense: 0.07,
            health: 0.07
        },
        ability: {
            name: 'Dragon Breath',
            description: 'Deals 20% of pet\'s attack as damage to all enemies',
            effect: 'damage',
            value: 0.2,
            isAOE: true,
            cooldown: 4
        },
        unlockLevel: 20,
        isRare: true
    },
    phoenix: {
        name: 'Phoenix Chick',
        icon: '🔥',
        description: 'A legendary phoenix chick with resurrection ability',
        baseStats: {
            attack: 6,
            defense: 4,
            health: 35,
            speed: 9
        },
        statBonus: {
            health: 0.1,
            healingBonus: 0.15
        },
        ability: {
            name: 'Rebirth',
            description: 'Once per battle, revives a fallen hero with 30% health',
            effect: 'revive',
            value: 0.3,
            cooldown: 0, // Once per battle
            usesPerBattle: 1
        },
        unlockLevel: 30,
        isRare: true
    }
};

// Player's pet collection
let playerPets = [];

// Currently equipped pets (one per hero)
let equippedPets = {}; // heroId -> petId mapping

// Initialize pet system
function initializePets() {
    // Check if player has unlocked any pets based on level
    const playerLevel = parseInt(document.getElementById('player-level').textContent);
    
    // Unlock starter pet if player is high enough level
    if (playerLevel >= PET_TYPES.wolf.unlockLevel && !playerPets.some(pet => pet.type === 'wolf')) {
        const starterPet = generatePet('wolf', 1);
        addPet(starterPet);
        addBattleLog(`You've unlocked your first pet: ${starterPet.name}!`);
    }
    
    // Render pet UI
    renderPetUI();
}

// Generate a pet of specified type and level
function generatePet(petType, level = 1) {
    const petData = PET_TYPES[petType];
    if (!petData) return null;
    
    // Calculate stats based on level
    const levelMultiplier = 1 + (level - 1) * 0.1; // 10% increase per level
    
    const stats = {
        attack: Math.floor(petData.baseStats.attack * levelMultiplier),
        defense: Math.floor(petData.baseStats.defense * levelMultiplier),
        health: Math.floor(petData.baseStats.health * levelMultiplier),
        speed: Math.floor(petData.baseStats.speed * levelMultiplier)
    };
    
    // Create pet object
    const pet = {
        id: 'pet-' + Date.now() + Math.floor(Math.random() * 1000),
        type: petType,
        name: petData.name,
        level: level,
        experience: 0,
        experienceToNextLevel: 50 * level,
        stats: stats,
        ability: petData.ability,
        isEquipped: false
    };
    
    return pet;
}

// Add pet to player's collection
function addPet(pet) {
    playerPets.push(pet);
    renderPetUI();
}

// Render pet UI
function renderPetUI() {
    const petContainer = document.getElementById('pet-container');
    if (!petContainer) return;
    
    petContainer.innerHTML = '';
    
    // Create pet collection section
    const petCollection = document.createElement('div');
    petCollection.className = 'pet-collection';
    petCollection.innerHTML = '<h3>Your Pets</h3>';
    
    // Add pet cards
    if (playerPets.length === 0) {
        petCollection.innerHTML += '<p>You don\'t have any pets yet. Reach higher levels to unlock pets!</p>';
    } else {
        const petsGrid = document.createElement('div');
        petsGrid.className = 'pets-grid';
        
        playerPets.forEach(pet => {
            const petData = PET_TYPES[pet.type];
            const petCard = document.createElement('div');
            petCard.className = `pet-card ${pet.isEquipped ? 'equipped' : ''}`;
            petCard.dataset.petId = pet.id;
            
            petCard.innerHTML = `
                <div class="pet-icon">${petData.icon}</div>
                <div class="pet-info">
                    <div class="pet-name">${pet.name} ${petData.isRare ? '⭐' : ''}</div>
                    <div class="pet-level">Level ${pet.level}</div>
                    <div class="pet-stats">
                        <div>ATK: ${pet.stats.attack}</div>
                        <div>DEF: ${pet.stats.defense}</div>
                        <div>HP: ${pet.stats.health}</div>
                        <div>SPD: ${pet.stats.speed}</div>
                    </div>
                    <div class="pet-ability">${pet.ability.name}: ${pet.ability.description}</div>
                    <div class="pet-exp">EXP: ${pet.experience}/${pet.experienceToNextLevel}</div>
                </div>
            `;
            
            // Add click event to select pet for equipping
            petCard.addEventListener('click', () => selectPet(pet.id));
            
            petsGrid.appendChild(petCard);
        });
        
        petCollection.appendChild(petsGrid);
    }
    
    petContainer.appendChild(petCollection);
    
    // Create pet actions section
    const petActions = document.createElement('div');
    petActions.className = 'pet-actions';
    
    // Add equip button
    const equipPetBtn = document.createElement('button');
    equipPetBtn.id = 'equip-pet';
    equipPetBtn.className = 'action-button';
    equipPetBtn.textContent = 'Equip Pet';
    equipPetBtn.addEventListener('click', equipSelectedPet);
    equipPetBtn.disabled = true; // Disabled until a pet and hero are selected
    
    // Add train button
    const trainPetBtn = document.createElement('button');
    trainPetBtn.id = 'train-pet';
    trainPetBtn.className = 'action-button';
    trainPetBtn.textContent = 'Train Pet (50 Gold)';
    trainPetBtn.addEventListener('click', trainSelectedPet);
    trainPetBtn.disabled = true; // Disabled until a pet is selected
    
    petActions.appendChild(equipPetBtn);
    petActions.appendChild(trainPetBtn);
    
    petContainer.appendChild(petActions);
}

// Currently selected pet and hero for equipping
let selectedPetId = null;
let selectedHeroId = null;

// Select a pet
function selectPet(petId) {
    selectedPetId = petId;
    
    // Update UI to show selected pet
    const petCards = document.querySelectorAll('.pet-card');
    petCards.forEach(card => {
        card.classList.remove('selected');
    });
    
    const selectedCard = document.querySelector(`.pet-card[data-pet-id="${petId}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
    }
    
    // Enable train button
    const trainPetBtn = document.getElementById('train-pet');
    if (trainPetBtn) {
        trainPetBtn.disabled = false;
    }
    
    // Check if both pet and hero are selected to enable equip button
    updateEquipButtonState();
}

// Select a hero for equipping a pet
function selectHeroForPet(heroId) {
    selectedHeroId = heroId;
    
    // Update UI to show selected hero
    const heroCards = document.querySelectorAll('.hero-card');
    heroCards.forEach(card => {
        card.classList.remove('pet-target');
    });
    
    const selectedHeroCard = document.querySelector(`.hero-card[data-hero-id="${heroId}"]`);
    if (selectedHeroCard) {
        selectedHeroCard.classList.add('pet-target');
    }
    
    // Check if both pet and hero are selected to enable equip button
    updateEquipButtonState();
}

// Update equip button state
function updateEquipButtonState() {
    const equipPetBtn = document.getElementById('equip-pet');
    if (equipPetBtn) {
        equipPetBtn.disabled = !(selectedPetId && selectedHeroId);
    }
}

// Equip selected pet to selected hero
function equipSelectedPet() {
    if (!selectedPetId || !selectedHeroId) return;
    
    const pet = playerPets.find(p => p.id === selectedPetId);
    const hero = playerHeroes.find(h => h.id === selectedHeroId);
    
    if (!pet || !hero) return;
    
    // Unequip pet from current hero if it's equipped
    if (pet.isEquipped) {
        const currentHeroId = Object.keys(equippedPets).find(heroId => equippedPets[heroId] === pet.id);
        if (currentHeroId) {
            delete equippedPets[currentHeroId];
        }
    }
    
    // Unequip any pet currently equipped to the selected hero
    if (equippedPets[selectedHeroId]) {
        const currentPet = playerPets.find(p => p.id === equippedPets[selectedHeroId]);
        if (currentPet) {
            currentPet.isEquipped = false;
        }
    }
    
    // Equip the pet to the hero
    equippedPets[selectedHeroId] = selectedPetId;
    pet.isEquipped = true;
    
    // Apply pet bonuses to hero
    applyPetBonusesToHero(hero, pet);
    
    // Update UI
    renderPetUI();
    renderHeroesGrid();
    
    addBattleLog(`${pet.name} has been equipped to ${hero.name}!`);
    
    // Reset selection
    selectedPetId = null;
    selectedHeroId = null;
}

// Apply pet stat bonuses to hero
function applyPetBonusesToHero(hero, pet) {
    const petData = PET_TYPES[pet.type];
    if (!petData || !petData.statBonus) return;
    
    // Store original stats if not already stored
    if (!hero.originalStats) {
        if (stat in hero.stats) {
            hero.stats[stat] = Math.floor(hero.stats[stat] * (1 + bonus));
        } else if (stat === 'critChance' || stat === 'healingBonus') {
            // Add these as special properties if they don't exist
            hero[stat] = (hero[stat] || 0) + bonus;
        }
    }
    
    // Update current health if max health changed
    if (petData.statBonus.health) {
        hero.currentHealth = hero.stats.health;
    }
}

// Train a pet to gain experience
function trainSelectedPet() {
    if (!selectedPetId) return;
    
    const pet = playerPets.find(p => p.id === selectedPetId);
    if (!pet) return;
    
    const goldCost = 50;
    const currentGold = parseInt(document.getElementById('gold-amount').textContent);
    
    if (currentGold >= goldCost) {
        // Deduct gold
        document.getElementById('gold-amount').textContent = currentGold - goldCost;
        
        // Add experience
        const expGain = 10 + pet.level * 2;
        pet.experience += expGain;
        
        // Check for level up
        if (pet.experience >= pet.experienceToNextLevel) {
            levelUpPet(pet);
        }
        
        // Update UI
        renderPetUI();
        
        addBattleLog(`${pet.name} gained ${expGain} experience from training!`);
    } else {
        addBattleLog('Not enough gold to train pet!');
    }
}

// Level up a pet
function levelUpPet(pet) {
    pet.level++;
    pet.experience = 0;
    pet.experienceToNextLevel = 50 * pet.level;
    
    // Increase stats
    const petData = PET_TYPES[pet.type];
    pet.stats.attack = Math.floor(petData.baseStats.attack * (1 + (pet.level - 1) * 0.1));
    pet.stats.defense = Math.floor(petData.baseStats.defense * (1 + (pet.level - 1) * 0.1));
    pet.stats.health = Math.floor(petData.baseStats.health * (1 + (pet.level - 1) * 0.1));
    pet.stats.speed = Math.floor(petData.baseStats.speed * (1 + (pet.level - 1) * 0.1));
    
    // If pet is equipped, update hero stats
    const heroId = Object.keys(equippedPets).find(id => equippedPets[id] === pet.id);
    if (heroId) {
        const hero = playerHeroes.find(h => h.id === heroId);
        if (hero) {
            applyPetBonusesToHero(hero, pet);
        }
    }
    
    addBattleLog(`${pet.name} leveled up to level ${pet.level}!`);
}

// Add pet experience after battle
function addPetExperienceAfterBattle(battleVictory) {
    if (!battleVictory) return;
    
    // Get pets equipped to heroes in battle
    battleState.playerTeam.forEach(hero => {
        const petId = equippedPets[hero.id];
        if (petId) {
            const pet = playerPets.find(p => p.id === petId);
            if (pet) {
                // Calculate experience based on battle difficulty
                const expGain = 5 + Math.floor(Math.random() * 5);
                pet.experience += expGain;
                
                // Check for level up
                if (pet.experience >= pet.experienceToNextLevel) {
                    levelUpPet(pet);
                }
                
                addBattleLog(`${pet.name} gained ${expGain} experience!`);
            }
        }
    });
    
    // Update UI
    renderPetUI();
}

// Use pet ability in battle
function usePetAbility(heroId) {
    const petId = equippedPets[heroId];
    if (!petId) return false;
    
    const pet = playerPets.find(p => p.id === petId);
    if (!pet) return false;
    
    // Check if ability is on cooldown
    if (pet.abilityCooldown > 0) {
        return false;
    }
    
    // Get pet data
    const petData = PET_TYPES[pet.type];
    const ability = pet.ability;
    
    // Apply ability effect based on type
    switch (ability.effect) {
        case 'attack':
            // Increase team attack
            battleState.playerTeam.forEach(hero => {
                const effect = {
                    target: hero.id,
                    effect: 'attack',
                    value: ability.value,
                    duration: ability.duration,
                    source: `${pet.name}'s ${ability.name}`
                };
                battleState.effects.push(effect);
            });
            addBattleLog(`${pet.name} used ${ability.name}, increasing team attack by ${ability.value * 100}%!`);
            break;
            
        case 'defense':
            // Increase team defense
            battleState.playerTeam.forEach(hero => {
                const effect = {
                    target: hero.id,
                    effect: 'defense',
                    value: ability.value,
                    duration: ability.duration,
                    source: `${pet.name}'s ${ability.name}`
                };
                battleState.effects.push(effect);
            });
            addBattleLog(`${pet.name} used ${ability.name}, increasing team defense by ${ability.value * 100}%!`);
            break;
            
        case 'speed':
            // Increase team speed
            battleState.playerTeam.forEach(hero => {
                const effect = {
                    target: hero.id,
                    effect: 'speed',
                    value: ability.value,
                    duration: ability.duration,
                    source: `${pet.name}'s ${ability.name}`
                };
                battleState.effects.push(effect);
            });
            addBattleLog(`${pet.name} used ${ability.name}, increasing team speed by ${ability.value * 100}%!`);
            break;
            
        case 'dodge':
            // Increase dodge chance
            battleState.playerTeam.forEach(hero => {
                const effect = {
                    target: hero.id,
                    effect: 'dodge',
                    value: ability.value,
                    duration: ability.duration,
                    source: `${pet.name}'s ${ability.name}`
                };
                battleState.effects.push(effect);
            });
            addBattleLog(`${pet.name} used ${ability.name}, increasing team dodge chance by ${ability.value * 100}%!`);
            break;
            
        case 'damageReduction':
            // Reduce damage taken
            battleState.playerTeam.forEach(hero => {
                const effect = {
                    target: hero.id,
                    effect: 'damageReduction',
                    value: ability.value,
                    duration: ability.duration,
                    source: `${pet.name}'s ${ability.name}`
                };
                battleState.effects.push(effect);
            });
            addBattleLog(`${pet.name} used ${ability.name}, reducing damage taken by ${ability.value * 100}%!`);
            break;
            
        case 'damage':
            // Deal damage to enemies
            const damageAmount = Math.floor(pet.stats.attack * ability.value);
            if (ability.isAOE) {
                // Damage all enemies
                battleState.enemyTeam.forEach(enemy => {
                    enemy.currentHealth -= damageAmount;
                    if (enemy.currentHealth < 0) enemy.currentHealth = 0;
                });
                addBattleLog(`${pet.name} used ${ability.name}, dealing ${damageAmount} damage to all enemies!`);
            } else {
                // Damage single enemy
                const target = battleState.enemyTeam[0]; // Target first enemy by default
                if (target) {
                    target.currentHealth -= damageAmount;
                    if (target.currentHealth < 0) target.currentHealth = 0;
                    addBattleLog(`${pet.name} used ${ability.name}, dealing ${damageAmount} damage to ${target.name}!`);
                }
            }
            break;
            
        case 'revive':
            // Find a fallen hero to revive
            const fallenHero = battleState.playerTeam.find(hero => hero.currentHealth <= 0);
            if (fallenHero) {
                fallenHero.currentHealth = Math.floor(fallenHero.stats.health * ability.value);
                addBattleLog(`${pet.name} used ${ability.name}, reviving ${fallenHero.name} with ${ability.value * 100}% health!`);
            } else {
                addBattleLog(`${pet.name} tried to use ${ability.name}, but there are no fallen heroes!`);
                return false; // Ability not used
            }
            break;
    }
    
    // Set cooldown
    pet.abilityCooldown = ability.cooldown;
    
    // If ability has uses per battle, decrement
    if (ability.usesPerBattle) {
        pet.abilityUsesLeft = (pet.abilityUsesLeft || ability.usesPerBattle) - 1;
        if (pet.abilityUsesLeft <= 0) {
            pet.abilityCooldown = Infinity; // Can't use again this battle
        }
    }
    
    return true;
}

// Reset pet ability cooldowns at start of battle
function resetPetAbilityCooldowns() {
    playerPets.forEach(pet => {
        pet.abilityCooldown = 0;
        if (pet.ability.usesPerBattle) {
            pet.abilityUsesLeft = pet.ability.usesPerBattle;
        }
    });
}

// Decrease pet ability cooldowns at end of turn
function decreasePetAbilityCooldowns() {
    playerPets.forEach(pet => {
        if (pet.abilityCooldown > 0 && pet.abilityCooldown !== Infinity) {
            pet.abilityCooldown--;
        }
    });
}

// Check for new unlockable pets based on player level
function checkForNewPets() {
    const playerLevel = parseInt(document.getElementById('player-level').textContent);
    
    // Check each pet type
    Object.keys(PET_TYPES).forEach(petType => {
        const petData = PET_TYPES[petType];
        
        // If player level meets requirement and doesn't have this pet type yet
        if (playerLevel >= petData.unlockLevel && !playerPets.some(pet => pet.type === petType)) {
            // For rare pets, add a chance to not get them immediately
            if (petData.isRare) {
                const chanceToGet = 0.3; // 30% chance
                if (Math.random() > chanceToGet) return;
            }
            
            const newPet = generatePet(petType, 1);
            addPet(newPet);
            addBattleLog(`You've unlocked a new pet: ${newPet.name}!`);
        }
    });
}

// Add CSS styles for pet UI
document.addEventListener('DOMContentLoaded', () => {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        .pet-container {
            margin-top: 20px;
            padding: 15px;
            background-color: #2c3e50;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        
        .pet-collection {
            margin-bottom: 15px;
        }
        
        .pets-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 10px;
            margin-top: 10px;
        }
        
        .pet-card {
            background-color: #34495e;
            border-radius: 5px;
            padding: 10px;
            display: flex;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .pet-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }
        
        .pet-card.selected {
            background-color: #2980b9;
            border: 2px solid #3498db;
        }
        
        .pet-card.equipped {
            border: 2px solid #27ae60;
        }
        
        .pet-icon {
            font-size: 2.5em;
            margin-right: 10px;
            display: flex;
            align-items: center;
        }
        
        .pet-info {
            flex: 1;
        }
        
        .pet-name {
            font-weight: bold;
            font-size: 1.1em;
            margin-bottom: 3px;
        }
        
        .pet-level {
            font-size: 0.9em;
            color: #bdc3c7;
            margin-bottom: 5px;
        }
        
        .pet-stats {
            display: grid;
            grid-template-columns: 1fr 1fr;
            font-size: 0.8em;
            margin-bottom: 5px;
        }
        
        .pet-ability {
            font-size: 0.8em;
            color: #3498db;
            margin-bottom: 3px;
        }
        
        .pet-exp {
            font-size: 0.8em;
            color: #f39c12;
        }
        
        .pet-actions {
            display: flex;
            gap: 10px;
        }
        
        .hero-card.pet-target {
            border: 2px solid #f39c12;
        }
    `;
    document.head.appendChild(styleSheet);
});