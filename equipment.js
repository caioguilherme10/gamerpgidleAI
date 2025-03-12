// Equipment system

// Player's collection of equipment
let playerEquipment = [];

// Equipment types
const EQUIPMENT_TYPES = {
    weapon: {
        name: 'Weapon',
        icon: '🗡️',
        statBonus: 'attack',
        slots: 1
    },
    armor: {
        name: 'Armor',
        icon: '🛡️',
        statBonus: 'defense',
        slots: 1
    },
    helmet: {
        name: 'Helmet',
        icon: '⛑️',
        statBonus: 'health',
        slots: 1
    },
    accessory: {
        name: 'Accessory',
        icon: '💍',
        statBonus: 'speed',
        slots: 2 // Can equip 2 accessories
    }
};

// Equipment set bonuses
const EQUIPMENT_SETS = {
    warrior: {
        name: 'Warrior Set',
        pieces: 4, // Need 4 pieces for set bonus
        bonus: {
            attack: 1.2,
            health: 1.1
        }
    },
    mage: {
        name: 'Mage Set',
        pieces: 4,
        bonus: {
            attack: 1.3,
            speed: 1.1
        }
    },
    ranger: {
        name: 'Ranger Set',
        pieces: 4,
        bonus: {
            attack: 1.15,
            speed: 1.2
        }
    },
    guardian: {
        name: 'Guardian Set',
        pieces: 4,
        bonus: {
            defense: 1.3,
            health: 1.2
        }
    }
};

// Generate a random equipment
function generateEquipment(level = 1) {
    // Determine equipment type
    const typeKeys = Object.keys(EQUIPMENT_TYPES);
    const equipType = typeKeys[Math.floor(Math.random() * typeKeys.length)];
    
    // Determine equipment rarity based on chances (using same rarities as heroes)
    const rarityRoll = Math.random();
    let equipRarity;
    let cumulativeChance = 0;
    
    for (const [rarity, data] of Object.entries(RARITIES)) {
        cumulativeChance += data.chance;
        if (rarityRoll <= cumulativeChance) {
            equipRarity = rarity;
            break;
        }
    }
    
    // Determine set type (if epic or legendary)
    let setType = null;
    if (equipRarity === 'epic' || equipRarity === 'legendary') {
        const setKeys = Object.keys(EQUIPMENT_SETS);
        setType = setKeys[Math.floor(Math.random() * setKeys.length)];
    }
    
    // Generate random name
    const prefixes = ['Mighty', 'Glorious', 'Ancient', 'Blessed', 'Cursed', 'Enchanted', 'Mystic', 'Savage'];
    const suffixes = ['of Power', 'of Wisdom', 'of Strength', 'of Agility', 'of Fortune', 'of the Bear', 'of the Eagle'];
    
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = Math.random() > 0.5 ? ` ${suffixes[Math.floor(Math.random() * suffixes.length)]}` : '';
    const equipName = `${prefix} ${EQUIPMENT_TYPES[equipType].name}${suffix}`;
    
    // Calculate stats based on level and rarity
    const baseValue = 5 + (level * 2); // Base stat value
    const rarityMultiplier = RARITIES[equipRarity].multiplier;
    
    // Primary stat (based on equipment type)
    const primaryStat = EQUIPMENT_TYPES[equipType].statBonus;
    const primaryValue = Math.floor(baseValue * rarityMultiplier);
    
    // Secondary stats (random)
    const allStats = ['health', 'attack', 'defense', 'speed'];
    const secondaryStats = {};
    
    // Epic and legendary items get 2 secondary stats, rare gets 1, others get none
    let secondaryStatCount = 0;
    if (equipRarity === 'legendary') secondaryStatCount = 2;
    else if (equipRarity === 'epic') secondaryStatCount = 2;
    else if (equipRarity === 'rare') secondaryStatCount = 1;
    
    // Add secondary stats
    const availableStats = allStats.filter(stat => stat !== primaryStat);
    for (let i = 0; i < secondaryStatCount; i++) {
        if (availableStats.length > 0) {
            const statIndex = Math.floor(Math.random() * availableStats.length);
            const stat = availableStats.splice(statIndex, 1)[0];
            const value = Math.floor((baseValue / 2) * rarityMultiplier * (0.8 + Math.random() * 0.4)); // 80-120% of base value
            secondaryStats[stat] = value;
        }
    }
    
    // Create equipment object
    const equipment = {
        id: Date.now() + Math.floor(Math.random() * 1000), // Unique ID
        name: equipName,
        type: equipType,
        rarity: equipRarity,
        level: level,
        set: setType,
        primaryStat: primaryStat,
        primaryValue: primaryValue,
        secondaryStats: secondaryStats,
        equippedBy: null // ID of hero who has this equipped
    };
    
    return equipment;
}

// Add equipment to player's collection
function addEquipment(equipment) {
    playerEquipment.push(equipment);
    renderEquipmentInventory();
}

// Equip item to hero
function equipItem(equipmentId, heroId) {
    const equipment = playerEquipment.find(e => e.id === equipmentId);
    const hero = playerHeroes.find(h => h.id === heroId);
    
    if (!equipment || !hero) return false;
    
    // Check if hero already has this type of equipment
    const currentEquipped = playerEquipment.find(e => 
        e.equippedBy === heroId && e.type === equipment.type);
    
    // For accessories, check if both slots are filled
    if (equipment.type === 'accessory') {
        const equippedAccessories = playerEquipment.filter(e => 
            e.equippedBy === heroId && e.type === 'accessory');
            
        if (equippedAccessories.length >= EQUIPMENT_TYPES.accessory.slots && !currentEquipped) {
            addBattleLog(`${hero.name} already has maximum accessories equipped!`);
            return false;
        }
    } else if (currentEquipped) {
        // Unequip current item of same type
        unequipItem(currentEquipped.id);
    }
    
    // Equip new item
    equipment.equippedBy = heroId;
    
    // Apply stats to hero
    applyEquipmentStats(hero);
    
    addBattleLog(`${equipment.name} equipped to ${hero.name}!`);
    renderEquipmentInventory();
    renderHeroesGrid();
    return true;
}

// Unequip item from hero
function unequipItem(equipmentId) {
    const equipment = playerEquipment.find(e => e.id === equipmentId);
    if (!equipment || !equipment.equippedBy) return false;
    
    const hero = playerHeroes.find(h => h.id === equipment.equippedBy);
    if (!hero) return false;
    
    // Remove equipped status
    equipment.equippedBy = null;
    
    // Recalculate hero stats
    applyEquipmentStats(hero);
    
    addBattleLog(`${equipment.name} unequipped from ${hero.name}!`);
    renderEquipmentInventory();
    renderHeroesGrid();
    return true;
}

// Apply all equipped items' stats to a hero
function applyEquipmentStats(hero) {
    // Reset hero stats to base values
    const baseStats = HERO_CLASSES[hero.class].baseStats;
    const rarityMultiplier = RARITIES[hero.rarity].multiplier;
    const levelMultiplier = 1 + (hero.level - 1) * 0.1; // 10% increase per level
    
    hero.stats = {
        health: Math.floor(baseStats.health * rarityMultiplier * levelMultiplier),
        attack: Math.floor(baseStats.attack * rarityMultiplier * levelMultiplier),
        defense: Math.floor(baseStats.defense * rarityMultiplier * levelMultiplier),
        speed: Math.floor(baseStats.speed * rarityMultiplier * levelMultiplier)
    };
    
    // Get all equipment for this hero
    const heroEquipment = playerEquipment.filter(e => e.equippedBy === hero.id);
    
    // Apply individual equipment stats
    heroEquipment.forEach(equip => {
        // Apply primary stat
        hero.stats[equip.primaryStat] += equip.primaryValue;
        
        // Apply secondary stats
        for (const [stat, value] of Object.entries(equip.secondaryStats)) {
            hero.stats[stat] += value;
        }
    });
    
    // Check for set bonuses
    const setCount = {};
    heroEquipment.forEach(equip => {
        if (equip.set) {
            setCount[equip.set] = (setCount[equip.set] || 0) + 1;
        }
    });
    
    // Apply set bonuses
    for (const [set, count] of Object.entries(setCount)) {
        const setData = EQUIPMENT_SETS[set];
        if (count >= setData.pieces) {
            // Apply set bonus
            for (const [stat, multiplier] of Object.entries(setData.bonus)) {
                hero.stats[stat] = Math.floor(hero.stats[stat] * multiplier);
            }
            addBattleLog(`${hero.name} activated ${setData.name} bonus!`);
        }
    }
}

// Upgrade equipment
function upgradeEquipment(equipmentId) {
    const equipment = playerEquipment.find(e => e.id === equipmentId);
    if (!equipment) return false;
    
    const goldCost = 50 * equipment.level * RARITIES[equipment.rarity].multiplier;
    const currentGold = parseInt(document.getElementById('gold-amount').textContent);
    
    if (currentGold >= goldCost) {
        // Deduct gold
        document.getElementById('gold-amount').textContent = currentGold - goldCost;
        
        // Upgrade equipment
        equipment.level++;
        equipment.primaryValue = Math.floor(equipment.primaryValue * 1.2); // 20% increase
        
        // Upgrade secondary stats
        for (const stat in equipment.secondaryStats) {
            equipment.secondaryStats[stat] = Math.floor(equipment.secondaryStats[stat] * 1.2);
        }
        
        // If equipped, update hero stats
        if (equipment.equippedBy) {
            const hero = playerHeroes.find(h => h.id === equipment.equippedBy);
            if (hero) {
                applyEquipmentStats(hero);
            }
        }
        
        addBattleLog(`${equipment.name} upgraded to level ${equipment.level}!`);
        renderEquipmentInventory();
        return true;
    } else {
        addBattleLog(`Not enough gold to upgrade ${equipment.name}!`);
        return false;
    }
}

// Render equipment inventory
function renderEquipmentInventory() {
    const equipmentContainer = document.getElementById('equipment-inventory');
    if (!equipmentContainer) return; // Safety check
    
    equipmentContainer.innerHTML = '';
    
    playerEquipment.forEach(equip => {
        const equipCard = document.createElement('div');
        equipCard.className = 'equipment-card';
        equipCard.dataset.equipId = equip.id;
        
        // Style based on rarity
        equipCard.style.borderColor = RARITIES[equip.rarity].color;
        equipCard.style.boxShadow = `0 0 5px ${RARITIES[equip.rarity].color}`;
        
        // Add equipped indicator
        if (equip.equippedBy) {
            equipCard.classList.add('equipped');
            const hero = playerHeroes.find(h => h.id === equip.equippedBy);
            if (hero) {
                const equippedBadge = document.createElement('div');
                equippedBadge.className = 'equipped-badge';
                equippedBadge.textContent = hero.name;
                equipCard.appendChild(equippedBadge);
            }
        }
        
        const equipImage = document.createElement('div');
        equipImage.className = 'equipment-image';
        equipImage.innerHTML = EQUIPMENT_TYPES[equip.type].icon;
        
        const equipName = document.createElement('div');
        equipName.className = 'equipment-name';
        equipName.textContent = equip.name;
        
        const equipLevel = document.createElement('div');
        equipLevel.className = 'equipment-level';
        equipLevel.textContent = `Level ${equip.level}`;
        
        const equipRarity = document.createElement('div');
        equipRarity.className = 'equipment-rarity';
        equipRarity.textContent = RARITIES[equip.rarity].symbol;
        equipRarity.style.color = RARITIES[equip.rarity].color;
        
        // Add set indicator if applicable
        if (equip.set) {
            const setIndicator = document.createElement('div');
            setIndicator.className = 'equipment-set';
            setIndicator.textContent = EQUIPMENT_SETS[equip.set].name;
            equipCard.appendChild(setIndicator);
        }
        
        equipCard.appendChild(equipImage);
        equipCard.appendChild(equipName);
        equipCard.appendChild(equipLevel);
        equipCard.appendChild(equipRarity);
        
        // Add click event to show equipment details
        equipCard.addEventListener('click', () => showEquipmentDetails(equip));
        
        equipmentContainer.appendChild(equipCard);
    });
}

//