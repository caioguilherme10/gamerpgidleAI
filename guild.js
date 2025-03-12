// Guild System

// Player's guild information
let playerGuild = null;

// Available guilds
let availableGuilds = [
    {
        id: 'guild1',
        name: 'Phoenix Legion',
        level: 10,
        members: 28,
        maxMembers: 30,
        requirements: { playerLevel: 5 },
        dailyRewards: { gold: 500, gems: 10 },
        description: 'A powerful guild focused on helping new players grow.'
    },
    {
        id: 'guild2',
        name: 'Shadow Covenant',
        level: 15,
        members: 25,
        maxMembers: 30,
        requirements: { playerLevel: 10 },
        dailyRewards: { gold: 800, gems: 15 },
        description: 'An elite guild for experienced players seeking challenges.'
    },
    {
        id: 'guild3',
        name: 'Mystic Circle',
        level: 8,
        members: 20,
        maxMembers: 25,
        requirements: { playerLevel: 3 },
        dailyRewards: { gold: 400, gems: 8 },
        description: 'A friendly guild welcoming all players who enjoy the game.'
    }
];

// Guild benefits by level
const GUILD_BENEFITS = {
    // Gold bonus percentage
    goldBonus: (guildLevel) => Math.floor(guildLevel * 2), // 2% per guild level
    
    // EXP bonus percentage
    expBonus: (guildLevel) => Math.floor(guildLevel * 1.5), // 1.5% per guild level
    
    // Hero EXP bonus percentage
    heroExpBonus: (guildLevel) => Math.floor(guildLevel * 1), // 1% per guild level
    
    // Daily rewards
    dailyGold: (guildLevel) => 200 + (guildLevel * 50),
    dailyGems: (guildLevel) => 5 + Math.floor(guildLevel / 2),
    
    // Guild shop discount percentage
    shopDiscount: (guildLevel) => Math.min(Math.floor(guildLevel * 0.5), 20) // 0.5% per level, max 20%
};

// Guild activities
const GUILD_ACTIVITIES = {
    guildRaid: {
        name: 'Guild Raid',
        description: 'Team up with guild members to defeat powerful bosses',
        minLevel: 5,
        rewards: {
            gold: (guildLevel) => 1000 * guildLevel,
            gems: (guildLevel) => 20 + (guildLevel * 2),
            equipment: (guildLevel) => Math.floor(guildLevel / 3) // Number of equipment pieces
        },
        cooldown: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
    },
    guildDonation: {
        name: 'Guild Donation',
        description: 'Donate resources to help your guild grow',
        minLevel: 1,
        costs: {
            small: { gold: 1000 },
            medium: { gold: 5000 },
            large: { gold: 10000 }
        },
        guildExp: {
            small: 10,
            medium: 50,
            large: 100
        },
        rewards: {
            small: { guildCoins: 10 },
            medium: { guildCoins: 50 },
            large: { guildCoins: 100 }
        },
        cooldown: 12 * 60 * 60 * 1000 // 12 hours in milliseconds
    },
    guildQuest: {
        name: 'Guild Quest',
        description: 'Complete special quests with your guild members',
        minLevel: 3,
        types: [
            { name: 'Defeat 100 enemies', reward: { guildCoins: 50 } },
            { name: 'Collect 10,000 gold', reward: { guildCoins: 40 } },
            { name: 'Summon 5 heroes', reward: { guildCoins: 60 } },
            { name: 'Upgrade 3 heroes', reward: { guildCoins: 45 } }
        ],
        cooldown: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
    }
};

// Guild shop items
const GUILD_SHOP = [
    {
        id: 'gs1',
        name: 'Rare Hero Shard',
        description: 'Collect 50 to summon a rare hero',
        cost: 100, // Guild coins
        limit: 5, // Per week
        stock: 5
    },
    {
        id: 'gs2',
        name: 'Epic Hero Shard',
        description: 'Collect 50 to summon an epic hero',
        cost: 200,
        limit: 3,
        stock: 3
    },
    {
        id: 'gs3',
        name: 'Legendary Hero Shard',
        description: 'Collect 50 to summon a legendary hero',
        cost: 500,
        limit: 1,
        stock: 1
    },
    {
        id: 'gs4',
        name: 'Equipment Chest',
        description: 'Contains random equipment of rare or better quality',
        cost: 150,
        limit: 3,
        stock: 3
    },
    {
        id: 'gs5',
        name: 'Gold Chest',
        description: 'Contains 5,000 gold',
        cost: 50,
        limit: 10,
        stock: 10
    },
    {
        id: 'gs6',
        name: 'Gem Chest',
        description: 'Contains 100 gems',
        cost: 300,
        limit: 2,
        stock: 2
    },
    {
        id: 'gs7',
        name: 'EXP Potion',
        description: 'Grants 1,000 EXP to a hero',
        cost: 100,
        limit: 5,
        stock: 5
    }
];

// Player's guild resources
let guildResources = {
    guildCoins: 0,
    heroShards: {
        rare: 0,
        epic: 0,
        legendary: 0
    },
    lastDailyReward: 0,
    lastGuildRaid: 0,
    lastGuildDonation: 0,
    activeGuildQuests: [],
    completedGuildQuests: []
};

// Join a guild
function joinGuild(guildId) {
    const guild = availableGuilds.find(g => g.id === guildId);
    if (!guild) {
        addBattleLog('Guild not found!');
        return false;
    }
    
    // Check requirements
    if (playerData.level < guild.requirements.playerLevel) {
        addBattleLog(`You need to be level ${guild.requirements.playerLevel} to join this guild!`);
        return false;
    }
    
    // Check if guild is full
    if (guild.members >= guild.maxMembers) {
        addBattleLog('This guild is full!');
        return false;
    }
    
    // Join guild
    playerGuild = {
        id: guild.id,
        name: guild.name,
        level: guild.level,
        joinDate: Date.now()
    };
    
    // Increment member count
    guild.members++;
    
    // Reset guild resources
    guildResources = {
        guildCoins: 100, // Starting coins
        heroShards: {
            rare: 0,
            epic: 0,
            legendary: 0
        },
        lastDailyReward: 0,
        lastGuildRaid: 0,
        lastGuildDonation: 0,
        activeGuildQuests: [],
        completedGuildQuests: []
    };
    
    // Generate initial guild quests
    generateGuildQuests();
    
    addBattleLog(`You have joined the ${guild.name} guild!`);
    renderGuildInfo();
    return true;
}

// Leave current guild
function leaveGuild() {
    if (!playerGuild) {
        addBattleLog('You are not in a guild!');
        return false;
    }
    
    // Find guild and decrement member count
    const guild = availableGuilds.find(g => g.id === playerGuild.id);
    if (guild) {
        guild.members--;
    }
    
    // Reset player guild
    playerGuild = null;
    guildResources = {
        guildCoins: 0,
        heroShards: {
            rare: 0,
            epic: 0,
            legendary: 0
        },
        lastDailyReward: 0,
        lastGuildRaid: 0,
        lastGuildDonation: 0,
        activeGuildQuests: [],
        completedGuildQuests: []
    };
    
    addBattleLog('You have left your guild.');
    renderGuildInfo();
    return true;
}

// Collect daily guild rewards
function collectGuildDailyRewards() {
    if (!playerGuild) {
        addBattleLog('You are not in a guild!');
        return false;
    }
    
    const now = Date.now();
    const lastCollect = guildResources.lastDailyReward;
    const oneDayMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    if (now - lastCollect < oneDayMs) {
        const nextCollectTime = new Date(lastCollect + oneDayMs);
        addBattleLog(`You can collect your next daily guild reward at ${nextCollectTime.toLocaleTimeString()}.`);
        return false;
    }
    
    // Get guild
    const guild = availableGuilds.find(g => g.id === playerGuild.id);
    if (!guild) return false;
    
    // Calculate rewards
    const goldReward = GUILD_BENEFITS.dailyGold(guild.level);
    const gemsReward = GUILD_BENEFITS.dailyGems(guild.level);
    
    // Add rewards to player
    document.getElementById('gold-amount').textContent = 
        parseInt(document.getElementById('gold-amount').textContent) + goldReward;
    
    document.getElementById('gems-amount').textContent = 
        parseInt(document.getElementById('gems-amount').textContent) + gemsReward;
    
    // Update last collect time
    guildResources.lastDailyReward = now;
    
    addBattleLog(`Collected guild daily rewards: ${goldReward} gold and ${gemsReward} gems!`);
    return true;
}

// Participate in guild raid
function participateInGuildRaid() {
    if (!playerGuild) {
        addBattleLog('You are not in a guild!');
        return false;
    }
    
    const guild = availableGuilds.find(g => g.id === playerGuild.id);
    if (!guild) return false;
    
    // Check cooldown
    const now = Date.now();
    const lastRaid = guildResources.lastGuildRaid;
    const cooldown = GUILD_ACTIVITIES.guildRaid.cooldown;
    
    if (now - lastRaid < cooldown) {
        const nextRaidTime = new Date(lastRaid + cooldown);
        addBattleLog(`Guild raid will be available at ${nextRaidTime.toLocaleTimeString()}.`);
        return false;
    }
    
    // Check guild level requirement
    if (guild.level < GUILD_ACTIVITIES.guildRaid.minLevel) {
        addBattleLog(`Your guild needs to be level ${GUILD_ACTIVITIES.guildRaid.minLevel} to participate in raids!`);
        return false;
    }
    
    // Check if player has at least 3 heroes
    if (playerHeroes.length < 3) {
        addBattleLog('You need at least 3 heroes to participate in guild raids!');
        return false;
    }
    
    // Calculate rewards
    const goldReward = GUILD_ACTIVITIES.guildRaid.rewards.gold(guild.level);
    const gemsReward = GUILD_ACTIVITIES.guildRaid.rewards.gems(guild.level);
    const equipmentCount = GUILD_ACTIVITIES.guildRaid.rewards.equipment(guild.level);
    
    // Add gold and gems
    document.getElementById('gold-amount').textContent = 
        parseInt(document.getElementById('gold-amount').textContent) + goldReward;
    
    document.getElementById('gems-amount').textContent = 
        parseInt(document.getElementById('gems-amount').textContent) + gemsReward;
    
    // Add equipment
    for (let i = 0; i < equipmentCount; i++) {
        const equipment = generateEquipment(Math.max(5, Math.floor(guild.level / 2)));
        addEquipment(equipment);
    }
    
    // Add guild coins
    guildResources.guildCoins += 50 + (guild.level * 5);
    
    // Update last raid time
    guildResources.lastGuildRaid = now;
    
    addBattleLog(`Guild raid completed! Earned ${goldReward} gold, ${gemsReward} gems, and ${equipmentCount} equipment items!`);
    renderGuildInfo();
    return true;
}

// Make a guild donation
function makeGuildDonation(size) {
    if (!playerGuild) {
        addBattleLog('You are not in a guild!');
        return false;
    }
    
    // Check cooldown
    const now = Date.now();
    const lastDonation = guildResources.lastGuildDonation;
    const cooldown = GUILD_ACTIVITIES.guildDonation.cooldown;
    
    if (now - lastDonation < cooldown) {
        const nextDonationTime = new Date(lastDonation + cooldown);
        addBattleLog(`You can donate again at ${nextDonationTime.toLocaleTimeString()}.`);
        return false;
    }
    
    // Get donation details
    const donationData = GUILD_ACTIVITIES.guildDonation.costs[size];
    const guildExpGain = GUILD_ACTIVITIES.guildDonation.guildExp[size];
    const rewards = GUILD_ACTIVITIES.guildDonation.rewards[size];
    
    if (!donationData) {
        addBattleLog('Invalid donation size!');
        return false;
    }
    
    // Check if player has enough resources
    const currentGold = parseInt(document.getElementById('gold-amount').textContent);
    
    if (currentGold < donationData.gold) {
        addBattleLog(`Not enough gold to make a ${size} donation!`);
        return false;
    }
    
    // Deduct resources
    document.getElementById('gold-amount').textContent = currentGold - donationData.gold;
    
    // Add guild coins to player
    guildResources.guildCoins += rewards.guildCoins;
    
    // Increase guild level (simplified for this implementation)
    const guild = availableGuilds.find(g => g.id === playerGuild.id);
    if (guild) {
        // Every 1000 exp points increases guild level by 1
        const expNeeded = 1000;
        const currentExp = guild.exp || 0;
        const newExp = currentExp + guildExpGain;
        
        guild.exp = newExp;
        
        // Check if guild leveled up
        if (Math.floor(newExp / expNeeded) > Math.floor(currentExp / expNeeded)) {
            guild.level++;
            playerGuild.level = guild.level;
            addBattleLog(`The guild has reached level ${guild.level}!`);
        }
    }
    
    // Update last donation time
    guildResources.lastGuildDonation = now;
    
    addBattleLog(`You donated ${donationData.gold} gold to the guild and received ${rewards.guildCoins} guild coins!`);
    renderGuildInfo();
    return true;
}

// Generate guild quests
function generateGuildQuests() {
    if (!playerGuild) return;
    
    // Clear previous quests
    guildResources.activeGuildQuests = [];
    
    // Get quest types
    const questTypes = GUILD_ACTIVITIES.guildQuest.types;
    
    // Randomly select 2 quests
    const selectedQuests = [];
    while (selectedQuests.length < 2 && questTypes.length > 0) {
        const randomIndex = Math.floor(Math.random() * questTypes.length);
        const questType = {...questTypes[randomIndex]}; // Clone the quest
        
        // Add progress tracking
        questType.id = `guild_quest_${Date.now()}_${randomIndex}`;
        questType.progress = 0;
        questType.target = Math.floor(Math.random() * 50) + 50; // Random target between 50-100
        questType.completed = false;
        
        selectedQuests.push(questType);
    }
    
    guildResources.activeGuildQuests = selectedQuests;
    renderGuildInfo();
}

// Update guild quest progress
function updateGuildQuestProgress(questType, amount = 1) {
    if (!playerGuild || guildResources.activeGuildQuests.length === 0) return;
    
    let updated = false;
    
    guildResources.activeGuildQuests.forEach(quest => {
        if (quest.name.toLowerCase().includes(questType.toLowerCase()) && !quest.completed) {
            quest.progress += amount;
            
            // Check if completed
            if (quest.progress >= quest.target) {
                quest.progress = quest.target; // Cap at target
                quest.completed = true;
                
                // Add reward
                guildResources.guildCoins += quest.reward.guildCoins;
                
                addBattleLog(`Guild Quest completed: ${quest.name}! Earned ${quest.reward.guildCoins} guild coins.`);
            }
            
            updated = true;
        }
    });
    
    if (updated) {
        renderGuildInfo();
    }
}

// Purchase item from guild shop
function purchaseGuildShopItem(itemId) {
    if (!playerGuild) {
        addBattleLog('You are not in a guild!');
        return false;
    }
    
    // Find item
    const item = GUILD_SHOP.find(i => i.id === itemId);
    if (!item) {
        addBattleLog('Item not found!');
        return false;
    }
    
    // Check if item is in stock
    if (item.stock <= 0) {
        addBattleLog('This item is out of stock!');
        return false;
    }
    
    // Check if player has enough guild coins
    if (guildResources.guildCoins < item.cost) {
        addBattleLog(`Not enough guild coins! You need ${item.cost} coins.`);
        return false;
    }
    
    // Process purchase
    guildResources.guildCoins -= item.cost;
    item.stock--;
    
    // Handle item effects
    switch (item.id) {
        case 'gs1': // Rare Hero Shard
            guildResources.heroShards.rare += 1;
            if (guildResources.heroShards.rare >= 50) {
                guildResources.heroShards.rare -= 50;
                const newHero = generateHero();
                // Force rarity to be at least rare
                if (newHero.rarity === 'common') {
                    newHero.rarity = 'rare';
                    // Recalculate stats based on new rarity
                    const baseStats = HERO_CLASSES[newHero.class].baseStats;
                    const rarityMultiplier = RARITIES[newHero.rarity].multiplier;
                    const levelMultiplier = 1 + (newHero.level - 1) * 0.1;
                    
                    for (const stat in newHero.stats) {
                        newHero.stats[stat] = Math.floor(baseStats[stat] * rarityMultiplier * levelMultiplier);
                    }
                }
                addHero(newHero);
                addBattleLog(`Summoned a ${RARITIES[newHero.rarity].name} ${HERO_CLASSES[newHero.class].name} from hero shards!`);
            } else {
                addBattleLog(`Obtained a Rare Hero Shard (${guildResources.heroShards.rare}/50)`);
            }
            break;
            
        case 'gs2': // Epic Hero Shard
            guildResources.heroShards.epic += 1;
            if (guildResources.heroShards.epic >= 50) {
                guildResources.heroShards.epic -= 50;
                let newHero = generateHero();
                // Force rarity to be at least epic
                if (newHero.rarity !== 'epic' && newHero.rarity !== 'legendary') {
                    newHero.rarity = 'epic';
                    // Recalculate stats
                    const baseStats = HERO_CLASSES[newHero.class].baseStats;
                    const rarityMultiplier = RARITIES[newHero.rarity].multiplier;
                    const levelMultiplier = 1 + (newHero.level - 1) * 0.1;
                    
                    for (const stat in newHero.stats) {
                        newHero.stats[stat] = Math.floor(baseStats[stat] * rarityMultiplier * levelMultiplier);
                    }
                }
                addHero(newHero);
                addBattleLog(`Summoned a ${RARITIES[newHero.rarity].name} ${HERO_CLASSES[newHero.class].name} from hero shards!`);
            } else {
                addBattleLog(`Obtained an Epic Hero Shard (${guildResources.heroShards.epic}/50)`);
            }
            break;
            
        case 'gs3': // Legendary Hero Shard
            guildResources.heroShards.legendary += 1;
            if (guildResources.heroShards.legendary >= 50) {
                guildResources.heroShards.legendary -= 50;
                let newHero = generateHero();
                // Force rarity to be legendary
                newHero.rarity = 'legendary';
                // Recalculate stats
                const baseStats = HERO_CLASSES[newHero.class].baseStats;
                const rarityMultiplier = RARITIES[newHero.rarity].multiplier;
                const levelMultiplier = 1 + (newHero.level - 1) * 0.1;
                
                for (const stat in newHero.stats) {
                    newHero.stats[stat] = Math.floor(baseStats[stat] * rarityMultiplier * levelMultiplier);
                }
                addHero(newHero);
                addBattleLog(`Summoned a ${RARITIES[newHero.rarity].name} ${HERO_CLASSES[newHero.class].name} from hero shards!`);
            } else {
                addBattleLog(`Obtained a Legendary Hero Shard (${guildResources.heroShards.legendary}/50)`);
            }
            break;
            
        case 'gs4': // Equipment Chest
            const equipment = generateEquipment(playerData.level);
            // Force rarity to be at least rare
            if (equipment.rarity === 'common' || equipment.rarity === 'uncommon') {
                equipment.rarity = 'rare';
                // Recalculate stats
                const baseValue = 5 + (equipment.level * 2);
                const rarityMultiplier = RARITIES[equipment.rarity].multiplier;
                equipment.primaryValue = Math.floor(baseValue * rarityMultiplier);
            }
            addEquipment(equipment);
            addBattleLog(`Obtained a ${RARITIES[equipment.rarity].name} ${equipment.name} from equipment chest!`);
            break;
            
        case 'gs5': // Gold Chest
            const goldAmount = 5000;
            document.getElementById('gold-amount').textContent = 
                parseInt(document.getElementById('gold-amount').textContent) + goldAmount;
            addBattleLog(`Obtained ${goldAmount} gold from gold chest!`);
            break;
            
        case 'gs6': // Gem Chest
            const gemAmount = 100;
            document.getElementById('gems-amount').textContent = 
                parseInt(document.getElementById('gems-amount').textContent) + gemAmount;
            addBattleLog(`Obtained ${gemAmount} gems from gem chest!`);
            break;
            
        case 'gs7': // EXP Potion
            // Show hero selection for applying EXP
            showHeroSelectionForExp();
            break;
    }
    
    renderGuildInfo();
    return true;
}

// Show hero selection for applying EXP potion
function showHeroSelectionForExp() {
    // Create modal for hero selection
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    const closeBtn = document.createElement('span');
    closeBtn.className = 'close-modal';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    const title = document.createElement('h3');
    title.textContent = 'Select Hero to Apply EXP Potion';
    
    const heroList = document.createElement('div');
    heroList.className = 'heroes-grid';
    
    // Add heroes to selection
    playerHeroes.forEach(hero => {
        const heroCard = document.createElement('div');
        heroCard.className = 'hero-card';
        
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
        
        heroCard.appendChild(heroImage);
        heroCard.appendChild(heroName);
        heroCard.appendChild(heroLevel);
        
        // Add click event to apply EXP
        heroCard.addEventListener('click', () => {
            applyExpPotion(hero.id);
            document.body.removeChild(modal);
        });
        
        heroList.appendChild(heroCard);
    });
    
    modalContent.appendChild(closeBtn);
    modalContent.appendChild(title);
    modalContent.appendChild(heroList);
    modal.appendChild(modalContent);
    
    document.body.appendChild(modal);
}

// Apply EXP potion to hero
function applyExpPotion(heroId) {
    const hero = playerHeroes.find(h => h.id === heroId);
    if (!hero) return;
    
    const expAmount = 1000;
    addExperienceToHero(heroId, expAmount);
    addBattleLog(`Applied EXP potion to ${hero.name}, gaining ${expAmount} experience!`);
}

// Render guild information
function renderGuildInfo() {
    // Check if guild UI exists, if not create it
    let guildContainer = document.getElementById('guild-container');
    
    if (!guildContainer) {
        // Create guild UI
        guildContainer = document.createElement('div');
        guildContainer.id = 'guild-container';
        guildContainer.className = 'progression-container';
        
        // Insert after progression container
        const progressionContainer = document.querySelector('.progression-container');
        if (progressionContainer && progressionContainer.parentNode) {
            progressionContainer.parentNode.insertBefore(guildContainer, progressionContainer.nextSibling);
        } else {
            // Fallback to appending to game-main
            document.querySelector('.game-main').appendChild(guildContainer);
        }
    }
    
    // Clear container
    guildContainer.innerHTML = '';
    
    // Add title
    const title = document.createElement('h2');
    title.textContent = 'Guild';
    guildContainer.appendChild(title);
    
    if (!playerGuild) {
        // Show available guilds
        const guildList = document.createElement('div');
        guildList.className = 'guild-list';
        
        const guildListTitle = document.createElement('h3');
        guildListTitle.textContent = 'Available Guilds';
        guildList.appendChild(guildListTitle);
        
        availableGuilds.forEach(guild => {
            const guildItem = document.createElement('div');
            guildItem.className = 'guild-item';
            
            const guildName = document.createElement('div');
            guildName.className = 'guild-name';
            guildName.textContent = `${guild.name} (Level ${guild.level})`;
            
            const guildMembers = document.createElement('div');
            guildMembers.className = 'guild-members';
            guildMembers.textContent = `Members: ${guild.members}/${guild.maxMembers}`;
            
            const guildRequirement = document.createElement('div');
            guildRequirement.className = 'guild-requirement';
            guildRequirement.textContent = `Required Level: ${guild.requirements.playerLevel}`;
            
            const guildDescription = document.createElement('div');
            guildDescription.className = 'guild-description';
            guildDescription.textContent = guild.description;
            
            const joinButton = document.createElement('button');
            joinButton.className = 'action-button';
            joinButton.textContent = 'Join Guild';
            joinButton.dataset.guildId = guild.id;
            joinButton.addEventListener('click', () => joinGuild(guild.id));
            
            // Disable button if requirements not met or guild is full
            if (playerData.level < guild.requirements.playerLevel || guild.members >= guild.maxMembers) {
                joinButton.disabled = true;
            }
            
            guildItem.appendChild(guildName);
            guildItem.appendChild(guildMembers);
            guildItem.appendChild(guildRequirement);
            guildItem.appendChild(guildDescription);
            guildItem.appendChild(joinButton);
            
            guildList.appendChild(guildItem);
        });
        
        guildContainer.appendChild(guildList);
    } else {
        // Show guild info
        const guild = availableGuilds.find(g => g.id === playerGuild.id);
        
        const guildInfo = document.createElement('div');
        guildInfo.className = 'guild-info';
        
        const guildName = document.createElement('div');
        guildName.className = 'guild-name';
        guildName.textContent = `${playerGuild.name} (Level ${playerGuild.level})`;
        
        const guildCoins = document.createElement('div');
        guildCoins.className = 'guild-coins';
        guildCoins.textContent = `Guild Coins: ${guildResources.guildCoins}`;
        
        const guildBenefits = document.createElement('div');
        guildBenefits.className = 'guild-benefits';
        guildBenefits.innerHTML = `<strong>Guild Benefits:</strong><br>`;
        guildBenefits.innerHTML += `Gold Bonus: +${GUILD_BENEFITS.goldBonus(playerGuild.level)}%<br>`;
        guildBenefits.innerHTML += `EXP Bonus: +${GUILD_BENEFITS.expBonus(playerGuild.level)}%<br>`;
        guildBenefits.innerHTML += `Hero EXP Bonus: +${GUILD_BENEFITS.heroExpBonus(playerGuild.level)}%<br>`;
        
        const leaveButton = document.createElement('button');
        leaveButton.className = 'action-button';
        leaveButton.textContent = 'Leave Guild';
        leaveButton.addEventListener('click', leaveGuild);
        
        guildInfo.appendChild(guildName);
        guildInfo.appendChild(guildCoins);
        guildInfo.appendChild(guildBenefits);
        
        // Add daily rewards button
        const dailyRewardsButton = document.createElement('button');
        dailyRewardsButton.className = 'action-button';
        dailyRewardsButton.textContent = 'Collect Daily Rewards';
        dailyRewardsButton.addEventListener('click', collectGuildDailyRewards);
        
        // Check if daily rewards are available
        const now = Date.now();
        const lastCollect = guildResources.lastDailyReward;
        const oneDayMs = 24 * 60 * 60 * 1000;
        
        if (now - lastCollect < oneDayMs) {
            dailyRewardsButton.disabled = true;
            const nextCollectTime = new Date(lastCollect + oneDayMs);
            dailyRewardsButton.title = `Available at ${nextCollectTime.toLocaleTimeString()}`;
        }
        
        guildInfo.appendChild(dailyRewardsButton);
        
        // Add guild activities
        const guildActivities = document.createElement('div');
        guildActivities.className = 'guild-activities';
        guildActivities.innerHTML = `<h3>Guild Activities</h3>`;
        
        // Guild Raid
        const raidButton = document.createElement('button');
        raidButton.className = 'action-button';
        raidButton.textContent = 'Participate in Guild Raid';
        raidButton.addEventListener('click', participateInGuildRaid);
        
        // Check if raid is available
        const lastRaid = guildResources.lastGuildRaid;
        const raidCooldown = GUILD_ACTIVITIES.guildRaid.cooldown;
        
        if (now - lastRaid < raidCooldown || guild.level < GUILD_ACTIVITIES.guildRaid.minLevel) {
            raidButton.disabled = true;
            
            if (guild.level < GUILD_ACTIVITIES.guildRaid.minLevel) {
                raidButton.title = `Guild must be level ${GUILD_ACTIVITIES.guildRaid.minLevel}+`;
            } else {
                const nextRaidTime = new Date(lastRaid + raidCooldown);
                raidButton.title = `Available at ${nextRaidTime.toLocaleTimeString()}`;
            }
        }
        
        guildActivities.appendChild(raidButton);
        
        // Guild Donation
        const donationTitle = document.createElement('div');
        donationTitle.innerHTML = `<h4>Make a Donation</h4>`;
        guildActivities.appendChild(donationTitle);
        
        const donationButtons = document.createElement('div');
        donationButtons.className = 'donation-buttons';
        
        // Check if donation is available
        const lastDonation = guildResources.lastGuildDonation;
        const donationCooldown = GUILD_ACTIVITIES.guildDonation.cooldown;
        const donationDisabled = now - lastDonation < donationCooldown;
        
        // Small donation
        const smallDonationButton = document.createElement('button');
        smallDonationButton.className = 'action-button';
        smallDonationButton.textContent = `Small (${GUILD_ACTIVITIES.guildDonation.costs.small.gold} Gold)`;
        smallDonationButton.addEventListener('click', () => makeGuildDonation('small'));
        smallDonationButton.disabled = donationDisabled;
        donationButtons.appendChild(smallDonationButton);
        
        // Medium donation
        const mediumDonationButton = document.createElement('button');
        mediumDonationButton.className = 'action-button';
        mediumDonationButton.textContent = `Medium (${GUILD_ACTIVITIES.guildDonation.costs.medium.gold} Gold)`;
        mediumDonationButton.addEventListener('click', () => makeGuildDonation('medium'));
        mediumDonationButton.disabled = donationDisabled;
        donationButtons.appendChild(mediumDonationButton);
        
        // Large donation
        const largeDonationButton = document.createElement('button');
        largeDonationButton.className = 'action-button';
        largeDonationButton.textContent = `Large (${GUILD_ACTIVITIES.guildDonation.costs.large.gold} Gold)`;
        largeDonationButton.addEventListener('click', () => makeGuildDonation('large'));
        largeDonationButton.disabled = donationDisabled;
        donationButtons.appendChild(largeDonationButton);
        
        if (donationDisabled) {
            const nextDonationTime = new Date(lastDonation + donationCooldown);
            const donationNote = document.createElement('div');
            donationNote.className = 'cooldown-note';
            donationNote.textContent = `Donation available at ${nextDonationTime.toLocaleTimeString()}`;
            donationButtons.appendChild(donationNote);
        }
        
        guildActivities.appendChild(donationButtons);
        
        // Guild Quests
        if (guildResources.activeGuildQuests.length > 0) {
            const questsTitle = document.createElement('div');
            questsTitle.innerHTML = `<h4>Guild Quests</h4>`;
            guildActivities.appendChild(questsTitle);
            
            const questsList = document.createElement('div');
            questsList.className = 'guild-quests';
            
            guildResources.activeGuildQuests.forEach(quest => {
                const questItem = document.createElement('div');
                questItem.className = 'quest-item';
                
                const questName = document.createElement('div');
                questName.className = 'quest-name';
                questName.textContent = quest.name;
                
                const questProgress = document.createElement('div');
                questProgress.className = 'quest-progress';
                questProgress.textContent = `Progress: ${quest.progress}/${quest.target}`;
                
                const questReward = document.createElement('div');
                questReward.className = 'quest-reward';
                questReward.textContent = `Reward: ${quest.reward.guildCoins} Guild Coins`;
                
                questItem.appendChild(questName);
                questItem.appendChild(questProgress);
                questItem.appendChild(questReward);
                
                if (quest.completed) {
                    questItem.classList.add('completed');
                    questItem.innerHTML += '<div class="completed-tag">Completed</div>';
                }
                
                questsList.appendChild(questItem);
            });
            
            guildActivities.appendChild(questsList);
        }
        
        guildContainer.appendChild(guildInfo);
        guildContainer.appendChild(guildActivities);
        guildContainer.appendChild(leaveButton);
    }
}

// Initialize guild system
function initializeGuildSystem() {
    // Add CSS for guild UI
    const style = document.createElement('style');
    style.textContent = `
        .guild-item, .guild-info {
            background-color: rgba(15, 52, 96, 0.5);
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
        }
        
        .guild-name {
            font-size: 1.2em;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .guild-members, .guild-requirement, .guild-coins {
            font-size: 0.9em;
            margin-bottom: 5px;
        }
        
        .guild-description {
            font-style: italic;
            margin-bottom: 10px;
        }
        
        .guild-benefits {
            background-color: rgba(0, 0, 0, 0.2);
            padding: 10px;
            border-radius: 5px;
            margin: 10px 0;
        }
        
        .guild-activities {
            background-color: rgba(15, 52, 96, 0.5);
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
        }
        
        .donation-buttons {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            margin-bottom: 10px;
        }
        
        .cooldown-note {
            font-size: 0.8em;
            color: #e94560;
            width: 100%;
            margin-top: 5px;
        }
        
        .quest-item {
            background-color: rgba(0, 0, 0, 0.2);
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 10px;
            position: relative;
        }
        
        .quest-item.completed {
            opacity: 0.7;
        }
        
        .completed-tag {
            position: absolute;
            top: 5px;
            right: 5px;
            background-color: #4CAF50;
            color: white;
            padding: 2px 5px;
            border-radius: 3px;
            font-size: 0.7em;
        }
    `;
    document.head.appendChild(style);
    
    // Render guild info
    renderGuildInfo();
}

// Call initialization when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    // This will be called after the main game initialization
    setTimeout(initializeGuildSystem, 200);
});