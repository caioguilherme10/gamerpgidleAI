// Heroes management system

// Player's collection of heroes
let playerHeroes = [];

// Generate a random hero
function generateHero(level = 1) {
    // Determine hero class
    const classKeys = Object.keys(HERO_CLASSES);
    const heroClass = classKeys[Math.floor(Math.random() * classKeys.length)];
    
    // Determine hero rarity based on chances
    const rarityRoll = Math.random();
    let heroRarity;
    let cumulativeChance = 0;
    
    for (const [rarity, data] of Object.entries(RARITIES)) {
        cumulativeChance += data.chance;
        if (rarityRoll <= cumulativeChance) {
            heroRarity = rarity;
            break;
        }
    }
    
    // Generate random name
    const heroName = HERO_NAMES[Math.floor(Math.random() * HERO_NAMES.length)];
    
    // Calculate stats based on level and rarity
    const baseStats = HERO_CLASSES[heroClass].baseStats;
    const rarityMultiplier = RARITIES[heroRarity].multiplier;
    const levelMultiplier = 1 + (level - 1) * 0.1; // 10% increase per level
    
    const stats = {
        health: Math.floor(baseStats.health * rarityMultiplier * levelMultiplier),
        attack: Math.floor(baseStats.attack * rarityMultiplier * levelMultiplier),
        defense: Math.floor(baseStats.defense * rarityMultiplier * levelMultiplier),
        speed: Math.floor(baseStats.speed * rarityMultiplier * levelMultiplier)
    };
    
    // Create hero object
    const hero = {
        id: Date.now() + Math.floor(Math.random() * 1000), // Unique ID
        name: heroName,
        class: heroClass,
        rarity: heroRarity,
        level: level,
        experience: 0,
        experienceToNextLevel: 100 * level,
        stats: stats,
        abilities: HERO_CLASSES[heroClass].abilities,
        inBattle: false
    };
    
    return hero;
}

// Add hero to player's collection
function addHero(hero) {
    playerHeroes.push(hero);
    renderHeroesGrid();
}

// Summon a new hero (costs gems)
function summonHero() {
    const gemsCost = 100;
    const currentGems = parseInt(document.getElementById('gems-amount').textContent);
    
    if (currentGems >= gemsCost) {
        // Deduct gems
        document.getElementById('gems-amount').textContent = currentGems - gemsCost;
        
        // Generate and add hero
        const newHero = generateHero();
        addHero(newHero);
        
        // Add summoning animation to the new hero card
        setTimeout(() => {
            const heroCard = document.querySelector(`.hero-card[data-hero-id="${newHero.id}"]`);
            if (heroCard) {
                heroCard.classList.add('summoning');
                
                // Remove animation class after animation completes
                setTimeout(() => {
                    heroCard.classList.remove('summoning');
                }, 800);
            }
        }, 10); // Small delay to ensure the DOM has been updated
        
        // Show success message
        addBattleLog(`Summoned a new ${RARITIES[newHero.rarity].name} ${HERO_CLASSES[newHero.class].name}: ${newHero.name}!`);
    } else {
        addBattleLog('Not enough gems to summon a hero!');
    }
}

// Render heroes grid
function renderHeroesGrid() {
    const heroesGrid = document.getElementById('heroes-grid');
    heroesGrid.innerHTML = '';
    
    playerHeroes.forEach(hero => {
        const heroCard = document.createElement('div');
        heroCard.className = 'hero-card';
        heroCard.dataset.heroId = hero.id;
        
        // Style based on rarity
        heroCard.style.borderColor = RARITIES[hero.rarity].color;
        heroCard.style.boxShadow = `0 0 5px ${RARITIES[hero.rarity].color}`;
        
        const heroImage = document.createElement('div');
        heroImage.className = 'hero-image';
        heroImage.style.backgroundColor = HERO_CLASSES[hero.class].color;
        heroImage.innerHTML = HERO_CLASSES[hero.class].icon;
        
        const heroName = document.createElement('div');
        heroName.className = 'hero-name';
        heroName.textContent = hero.name;
        
        const heroLevel = document.createElement('div');
        heroLevel.className = 'hero-level';
        heroLevel.textContent = `Level ${hero.level}`;
        
        const heroRarity = document.createElement('div');
        heroRarity.className = 'hero-rarity';
        heroRarity.textContent = RARITIES[hero.rarity].symbol;
        heroRarity.style.color = RARITIES[hero.rarity].color;
        
        heroCard.appendChild(heroImage);
        heroCard.appendChild(heroName);
        heroCard.appendChild(heroLevel);
        heroCard.appendChild(heroRarity);
        
        // Add click event to show hero details
        heroCard.addEventListener('click', () => showHeroDetails(hero));
        
        heroesGrid.appendChild(heroCard);
    });
}

// Show hero details in modal
function showHeroDetails(hero) {
    const modal = document.getElementById('hero-details-modal');
    const heroDetails = document.getElementById('hero-details');
    
    // Clear previous content
    heroDetails.innerHTML = '';
    
    // Create hero details content
    const heroImage = document.createElement('div');
    heroImage.className = 'hero-details-image';
    heroImage.style.backgroundColor = HERO_CLASSES[hero.class].color;
    heroImage.innerHTML = HERO_CLASSES[hero.class].icon;
    
    const heroName = document.createElement('div');
    heroName.className = 'hero-details-name';
    heroName.textContent = hero.name;
    
    const heroClass = document.createElement('div');
    heroClass.textContent = `${RARITIES[hero.rarity].name} ${HERO_CLASSES[hero.class].name}`;
    heroClass.style.color = RARITIES[hero.rarity].color;
    
    const heroLevel = document.createElement('div');
    heroLevel.textContent = `Level ${hero.level}`;
    
    const heroExp = document.createElement('div');
    heroExp.textContent = `EXP: ${hero.experience}/${hero.experienceToNextLevel}`;
    
    const heroStats = document.createElement('div');
    heroStats.className = 'hero-details-stats';
    
    // Add stats
    for (const [stat, value] of Object.entries(hero.stats)) {
        const statElement = document.createElement('div');
        statElement.className = 'hero-stat';
        
        const statName = document.createElement('div');
        statName.className = 'hero-stat-name';
        statName.textContent = stat.charAt(0).toUpperCase() + stat.slice(1);
        
        const statValue = document.createElement('div');
        statValue.className = 'hero-stat-value';
        statValue.textContent = value;
        
        statElement.appendChild(statName);
        statElement.appendChild(statValue);
        heroStats.appendChild(statElement);
    }
    
    // Add abilities
    const heroAbilities = document.createElement('div');
    heroAbilities.className = 'hero-details-abilities';
    heroAbilities.innerHTML = '<h3>Abilities</h3>';
    
    hero.abilities.forEach(ability => {
        const abilityElement = document.createElement('div');
        abilityElement.className = 'hero-ability';
        abilityElement.innerHTML = `<strong>${ability.name}:</strong> ${ability.description}`;
        heroAbilities.appendChild(abilityElement);
    });
    
    // Add upgrade button
    const upgradeButton = document.createElement('button');
    upgradeButton.className = 'action-button hero-upgrade-button';
    upgradeButton.textContent = `Upgrade (${UPGRADE_COSTS.gold(hero.level)} Gold, ${UPGRADE_COSTS.exp(hero.level)} EXP)`;
    upgradeButton.addEventListener('click', () => upgradeHero(hero.id));
    
    // Add all elements to hero details
    heroDetails.appendChild(heroImage);
    heroDetails.appendChild(heroName);
    heroDetails.appendChild(heroClass);
    heroDetails.appendChild(heroLevel);
    heroDetails.appendChild(heroExp);
    heroDetails.appendChild(heroStats);
    heroDetails.appendChild(heroAbilities);
    heroDetails.appendChild(upgradeButton);
    
    // Show modal
    modal.style.display = 'block';
    
    // Add close functionality
    const closeModal = document.querySelector('.close-modal');
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Upgrade hero
function upgradeHero(heroId) {
    const hero = playerHeroes.find(h => h.id === heroId);
    if (!hero) return;
    
    const goldCost = UPGRADE_COSTS.gold(hero.level);
    const expCost = UPGRADE_COSTS.exp(hero.level);
    
    const currentGold = parseInt(document.getElementById('gold-amount').textContent);
    const currentExp = parseInt(document.getElementById('exp-amount').textContent);
    
    if (currentGold >= goldCost && currentExp >= expCost) {
        // Deduct costs
        document.getElementById('gold-amount').textContent = currentGold - goldCost;
        document.getElementById('exp-amount').textContent = currentExp - expCost;
        
        // Upgrade hero
        hero.level++;
        hero.experienceToNextLevel = 100 * hero.level;
        
        // Increase stats
        for (const stat in hero.stats) {
            hero.stats[stat] = Math.floor(hero.stats[stat] * 1.1); // 10% increase per level
        }
        
        // Update UI
        renderHeroesGrid();
        showHeroDetails(hero);
        addBattleLog(`${hero.name} upgraded to level ${hero.level}!`);
    } else {
        addBattleLog('Not enough resources to upgrade hero!');
    }
}

// Add experience to hero
function addExperienceToHero(heroId, amount) {
    const hero = playerHeroes.find(h => h.id === heroId);
    if (!hero) return;
    
    hero.experience += amount;
    
    // Check if hero can level up
    if (hero.experience >= hero.experienceToNextLevel) {
        hero.experience -= hero.experienceToNextLevel;
        hero.level++;
        hero.experienceToNextLevel = 100 * hero.level;
        
        // Increase stats
        for (const stat in hero.stats) {
            hero.stats[stat] = Math.floor(hero.stats[stat] * 1.1);
        }
        
        addBattleLog(`${hero.name} leveled up to ${hero.level}!`);
    }
    
    renderHeroesGrid();
}

// Initialize with some starter heroes
function initializeHeroes() {
    // Add a starter warrior
    const starterHero = {
        id: Date.now(),
        name: 'Aiden',
        class: 'warrior',
        rarity: 'common',
        level: 1,
        experience: 0,
        experienceToNextLevel: 100,
        stats: {
            health: HERO_CLASSES.warrior.baseStats.health,
            attack: HERO_CLASSES.warrior.baseStats.attack,
            defense: HERO_CLASSES.warrior.baseStats.defense,
            speed: HERO_CLASSES.warrior.baseStats.speed
        },
        abilities: HERO_CLASSES.warrior.abilities,
        inBattle: false
    };
    
    addHero(starterHero);
}