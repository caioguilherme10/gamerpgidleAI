// Hero Ascension System

// Ascension levels and their requirements
const ASCENSION_TIERS = {
    basic: {
        name: 'Basic',
        color: '#a5a5a5',
        requiredLevel: 1,
        statMultiplier: 1.0
    },
    elite: {
        name: 'Elite',
        color: '#55a630',
        requiredLevel: 20,
        statMultiplier: 1.3,
        requiredHeroes: 2 // Need 2 same rarity heroes to ascend
    },
    elite_plus: {
        name: 'Elite+',
        color: '#55a630',
        requiredLevel: 40,
        statMultiplier: 1.6,
        requiredHeroes: 2 // Need 2 elite heroes to ascend
    },
    legendary: {
        name: 'Legendary',
        color: '#ff9e00',
        requiredLevel: 60,
        statMultiplier: 2.0,
        requiredHeroes: 2 // Need 2 elite+ heroes to ascend
    },
    legendary_plus: {
        name: 'Legendary+',
        color: '#ff9e00',
        requiredLevel: 80,
        statMultiplier: 2.5,
        requiredHeroes: 1 // Need 1 legendary hero to ascend
    },
    mythic: {
        name: 'Mythic',
        color: '#9d4edd',
        requiredLevel: 100,
        statMultiplier: 3.0,
        requiredHeroes: 2 // Need 2 legendary+ heroes to ascend
    },
    mythic_plus: {
        name: 'Mythic+',
        color: '#9d4edd',
        requiredLevel: 120,
        statMultiplier: 3.5,
        requiredHeroes: 1 // Need 1 mythic hero to ascend
    },
    ascended: {
        name: 'Ascended',
        color: '#ff9e00',
        requiredLevel: 140,
        statMultiplier: 4.0,
        requiredHeroes: 2 // Need 2 mythic+ heroes to ascend
    }
};

// Initialize hero with ascension tier
function initializeHeroAscension(hero) {
    hero.ascensionTier = 'basic';
    return hero;
}

// Check if hero can be ascended
function canAscendHero(heroId) {
    const hero = playerHeroes.find(h => h.id === heroId);
    if (!hero) return { canAscend: false, reason: 'Hero not found' };
    
    // Get current and next ascension tiers
    const currentTier = hero.ascensionTier || 'basic';
    const tierKeys = Object.keys(ASCENSION_TIERS);
    const currentIndex = tierKeys.indexOf(currentTier);
    
    // Check if already at max ascension
    if (currentIndex === tierKeys.length - 1) {
        return { canAscend: false, reason: 'Hero is already at maximum ascension' };
    }
    
    const nextTier = tierKeys[currentIndex + 1];
    const nextTierData = ASCENSION_TIERS[nextTier];
    
    // Check level requirement
    if (hero.level < nextTierData.requiredLevel) {
        return { 
            canAscend: false, 
            reason: `Hero must be level ${nextTierData.requiredLevel} to ascend to ${nextTierData.name}` 
        };
    }
    
    // Check if we have enough fodder heroes
    if (nextTierData.requiredHeroes) {
        // For elite and elite+, we need same rarity heroes
        if (nextTier === 'elite' || nextTier === 'elite_plus') {
            const fodderHeroes = playerHeroes.filter(h => 
                h.id !== heroId && // Not the same hero
                h.rarity === hero.rarity && // Same rarity
                h.class === hero.class && // Same class
                !h.inBattle && // Not in battle
                (h.ascensionTier || 'basic') === currentTier // Same ascension tier
            );
            
            if (fodderHeroes.length < nextTierData.requiredHeroes) {
                return { 
                    canAscend: false, 
                    reason: `Need ${nextTierData.requiredHeroes} ${hero.rarity} ${hero.class} heroes of ${currentTier} ascension` 
                };
            }
        }
        // For legendary and above, we need heroes of specific ascension tier
        else {
            const requiredTier = nextTier === 'legendary' ? 'elite_plus' : 
                                nextTier === 'legendary_plus' ? 'legendary' :
                                nextTier === 'mythic' ? 'legendary_plus' :
                                nextTier === 'mythic_plus' ? 'mythic' : 'mythic_plus';
            
            const fodderHeroes = playerHeroes.filter(h => 
                h.id !== heroId && // Not the same hero
                !h.inBattle && // Not in battle
                (h.ascensionTier || 'basic') === requiredTier // Required ascension tier
            );
            
            if (fodderHeroes.length < nextTierData.requiredHeroes) {
                return { 
                    canAscend: false, 
                    reason: `Need ${nextTierData.requiredHeroes} heroes of ${ASCENSION_TIERS[requiredTier].name} ascension` 
                };
            }
        }
    }
    
    return { 
        canAscend: true, 
        nextTier: nextTier,
        fodderNeeded: nextTierData.requiredHeroes
    };
}

// Ascend a hero to the next tier
function ascendHero(heroId) {
    const ascensionCheck = canAscendHero(heroId);
    if (!ascensionCheck.canAscend) {
        addBattleLog(ascensionCheck.reason);
        return false;
    }
    
    const hero = playerHeroes.find(h => h.id === heroId);
    const currentTier = hero.ascensionTier || 'basic';
    const nextTier = ascensionCheck.nextTier;
    const nextTierData = ASCENSION_TIERS[nextTier];
    
    // Find fodder heroes
    let fodderHeroes = [];
    
    // For elite and elite+, we need same rarity heroes
    if (nextTier === 'elite' || nextTier === 'elite_plus') {
        fodderHeroes = playerHeroes.filter(h => 
            h.id !== heroId && // Not the same hero
            h.rarity === hero.rarity && // Same rarity
            h.class === hero.class && // Same class
            !h.inBattle && // Not in battle
            (h.ascensionTier || 'basic') === currentTier // Same ascension tier
        ).slice(0, nextTierData.requiredHeroes);
    }
    // For legendary and above, we need heroes of specific ascension tier
    else {
        const requiredTier = nextTier === 'legendary' ? 'elite_plus' : 
                            nextTier === 'legendary_plus' ? 'legendary' :
                            nextTier === 'mythic' ? 'legendary_plus' :
                            nextTier === 'mythic_plus' ? 'mythic' : 'mythic_plus';
        
        fodderHeroes = playerHeroes.filter(h => 
            h.id !== heroId && // Not the same hero
            !h.inBattle && // Not in battle
            (h.ascensionTier || 'basic') === requiredTier // Required ascension tier
        ).slice(0, nextTierData.requiredHeroes);
    }
    
    // Remove fodder heroes from player's collection
    fodderHeroes.forEach(fodder => {
        const index = playerHeroes.findIndex(h => h.id === fodder.id);
        if (index !== -1) {
            playerHeroes.splice(index, 1);
        }
    });
    
    // Ascend the hero
    hero.ascensionTier = nextTier;
    
    // Apply stat multiplier
    for (const stat in hero.stats) {
        hero.stats[stat] = Math.floor(hero.stats[stat] * (nextTierData.statMultiplier / ASCENSION_TIERS[currentTier].statMultiplier));
    }
    
    addBattleLog(`${hero.name} ascended to ${nextTierData.name}!`);
    renderHeroesGrid();
    
    // If hero details modal is open, update it
    if (document.getElementById('hero-details-modal').style.display === 'block') {
        showHeroDetails(hero);
    }
    
    // Track for achievements
    trackHeroAscension();
    
    return true;
}

// Update hero card rendering to show ascension tier
function updateHeroCardWithAscension(heroCard, hero) {
    // Add ascension tier indicator
    if (hero.ascensionTier && hero.ascensionTier !== 'basic') {
        const ascensionData = ASCENSION_TIERS[hero.ascensionTier];
        const ascensionIndicator = document.createElement('div');
        ascensionIndicator.className = 'hero-ascension';
        ascensionIndicator.textContent = ascensionData.name;
        ascensionIndicator.style.color = ascensionData.color;
        heroCard.appendChild(ascensionIndicator);
    }
}

// Update hero details modal to show ascension information
function updateHeroDetailsWithAscension(heroDetails, hero) {
    // Add ascension information
    const ascensionTier = hero.ascensionTier || 'basic';
    const ascensionData = ASCENSION_TIERS[ascensionTier];
    
    const heroAscension = document.createElement('div');
    heroAscension.className = 'hero-details-ascension';
    heroAscension.textContent = `Ascension: ${ascensionData.name}`;
    heroAscension.style.color = ascensionData.color;
    
    // Add ascension button if not at max
    const tierKeys = Object.keys(ASCENSION_TIERS);
    const currentIndex = tierKeys.indexOf(ascensionTier);
    
    if (currentIndex < tierKeys.length - 1) {
        const nextTier = tierKeys[currentIndex + 1];
        const nextTierData = ASCENSION_TIERS[nextTier];
        
        const ascensionButton = document.createElement('button');
        ascensionButton.className = 'action-button hero-ascension-button';
        ascensionButton.textContent = `Ascend to ${nextTierData.name}`;
        ascensionButton.addEventListener('click', () => ascendHero(hero.id));
        
        // Add ascension requirements
        const ascensionReqs = document.createElement('div');
        ascensionReqs.className = 'ascension-requirements';
        ascensionReqs.innerHTML = `<strong>Requirements:</strong><br>`;
        ascensionReqs.innerHTML += `- Level ${nextTierData.requiredLevel}+<br>`;
        
        if (nextTierData.requiredHeroes) {
            if (nextTier === 'elite' || nextTier === 'elite_plus') {
                ascensionReqs.innerHTML += `- ${nextTierData.requiredHeroes} ${hero.rarity} ${hero.class} heroes<br>`;
            } else {
                const requiredTier = nextTier === 'legendary' ? 'elite_plus' : 
                                    nextTier === 'legendary_plus' ? 'legendary' :
                                    nextTier === 'mythic' ? 'legendary_plus' :
                                    nextTier === 'mythic_plus' ? 'mythic' : 'mythic_plus';
                
                ascensionReqs.innerHTML += `- ${nextTierData.requiredHeroes} ${ASCENSION_TIERS[requiredTier].name} heroes<br>`;
            }
        }
        
        // Insert ascension elements after hero level
        const heroLevel = heroDetails.querySelector('.hero-details-level') || heroDetails.children[3];
        heroDetails.insertBefore(heroAscension, heroLevel.nextSibling);
        heroDetails.insertBefore(ascensionReqs, heroAscension.nextSibling);
        
        // Add ascension button before the upgrade button
        const upgradeButton = heroDetails.querySelector('.hero-upgrade-button');
        if (upgradeButton) {
            heroDetails.insertBefore(ascensionButton, upgradeButton);
        } else {
            heroDetails.appendChild(ascensionButton);
        }
    } else {
        // Just show max ascension status
        heroAscension.textContent += ' (Maximum)';
        
        // Insert ascension element after hero level
        const heroLevel = heroDetails.querySelector('.hero-details-level') || heroDetails.children[3];
        heroDetails.insertBefore(heroAscension, heroLevel.nextSibling);
    }
}

// Modify the existing renderHeroesGrid function to include ascension information
function updateRenderHeroesGrid() {
    const originalRenderHeroesGrid = renderHeroesGrid;
    
    renderHeroesGrid = function() {
        originalRenderHeroesGrid();
        
        // Add ascension information to each hero card
        playerHeroes.forEach(hero => {
            const heroCard = document.querySelector(`.hero-card[data-hero-id="${hero.id}"]`);
            if (heroCard) {
                updateHeroCardWithAscension(heroCard, hero);
            }
        });
    };
}

// Modify the existing showHeroDetails function to include ascension information
function updateShowHeroDetails() {
    const originalShowHeroDetails = showHeroDetails;
    
    showHeroDetails = function(hero) {
        originalShowHeroDetails(hero);
        
        // Add ascension information to hero details
        const heroDetails = document.getElementById('hero-details');
        if (heroDetails) {
            updateHeroDetailsWithAscension(heroDetails, hero);
        }
    };
}

// Initialize ascension system
function initializeAscensionSystem() {
    // Update existing heroes with ascension tier
    playerHeroes.forEach(hero => {
        if (!hero.ascensionTier) {
            hero.ascensionTier = 'basic';
        }
    });
    
    // Modify existing functions to include ascension information
    updateRenderHeroesGrid();
    updateShowHeroDetails();
    
    // Modify generateHero function to include ascension tier
    const originalGenerateHero = generateHero;
    generateHero = function(level = 1) {
        const hero = originalGenerateHero(level);
        return initializeHeroAscension(hero);
    };
    
    // Add CSS for ascension display
    const style = document.createElement('style');
    style.textContent = `
        .hero-ascension {
            font-size: 0.7em;
            margin-top: 2px;
            font-weight: bold;
        }
        
        .hero-details-ascension {
            font-size: 1.1em;
            margin: 5px 0;
            font-weight: bold;
        }
        
        .ascension-requirements {
            font-size: 0.9em;
            margin: 5px 0 10px;
            padding: 5px;
            background-color: rgba(0, 0, 0, 0.2);
            border-radius: 5px;
        }
        
        .hero-ascension-button {
            margin: 5px 0;
            background-color: #9d4edd;
        }
        
        .hero-ascension-button:hover {
            background-color: #7b2cbf;
        }
    `;
    document.head.appendChild(style);
}

// Call initialization when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    // This will be called after the main game initialization
    setTimeout(initializeAscensionSystem, 100);
});