// Game assets and constants

// Hero classes with their base stats and abilities
const HERO_CLASSES = {
    warrior: {
        name: 'Warrior',
        icon: '⚔️',
        baseStats: {
            health: 150,
            attack: 15,
            defense: 10,
            speed: 8
        },
        abilities: [
            { name: 'Slash', damage: 1.2, description: 'A powerful slash dealing 120% damage' },
            { name: 'Shield Wall', effect: 'defense', value: 1.5, description: 'Increases defense by 50% for 2 turns' }
        ],
        color: '#e74c3c'
    },
    mage: {
        name: 'Mage',
        icon: '🔮',
        baseStats: {
            health: 100,
            attack: 20,
            defense: 5,
            speed: 10
        },
        abilities: [
            { name: 'Fireball', damage: 1.5, description: 'A powerful fireball dealing 150% damage' },
            { name: 'Arcane Shield', effect: 'defense', value: 1.3, description: 'Increases defense by 30% for 2 turns' }
        ],
        color: '#3498db'
    },
    archer: {
        name: 'Archer',
        icon: '🏹',
        baseStats: {
            health: 110,
            attack: 18,
            defense: 6,
            speed: 12
        },
        abilities: [
            { name: 'Precise Shot', damage: 1.3, description: 'A precise shot dealing 130% damage' },
            { name: 'Quick Dodge', effect: 'dodge', value: 0.3, description: '30% chance to dodge attacks for 2 turns' }
        ],
        color: '#2ecc71'
    },
    healer: {
        name: 'Healer',
        icon: '💖',
        baseStats: {
            health: 120,
            attack: 10,
            defense: 8,
            speed: 9
        },
        abilities: [
            { name: 'Heal', effect: 'heal', value: 0.2, description: 'Heals ally for 20% of max health' },
            { name: 'Blessing', effect: 'attack', value: 1.2, description: 'Increases attack by 20% for 2 turns' }
        ],
        color: '#9b59b6'
    },
    tank: {
        name: 'Tank',
        icon: '🛡️',
        baseStats: {
            health: 200,
            attack: 10,
            defense: 15,
            speed: 6
        },
        abilities: [
            { name: 'Taunt', effect: 'taunt', value: 2, description: 'Forces enemies to attack this hero for 2 turns' },
            { name: 'Fortify', effect: 'defense', value: 2, description: 'Doubles defense for 1 turn' }
        ],
        color: '#f39c12'
    }
};

// Hero names pool for random generation
const HERO_NAMES = [
    'Aiden', 'Lyra', 'Thorne', 'Elara', 'Garrick', 'Seraphina', 'Kael', 'Isolde',
    'Riven', 'Orion', 'Freya', 'Zephyr', 'Aria', 'Darius', 'Lilith', 'Gideon',
    'Nova', 'Silas', 'Athena', 'Rowan', 'Selene', 'Varian', 'Morgana', 'Talon',
    'Ember', 'Lucian', 'Celeste', 'Alaric', 'Sylvia', 'Bastian', 'Iris', 'Dorian'
];

// Rarity levels with their multipliers and colors
const RARITIES = {
    common: { name: 'Common', multiplier: 1.0, color: '#a5a5a5', chance: 0.6, symbol: '★' },
    uncommon: { name: 'Uncommon', multiplier: 1.2, color: '#55a630', chance: 0.25, symbol: '★★' },
    rare: { name: 'Rare', multiplier: 1.5, color: '#4895ef', chance: 0.1, symbol: '★★★' },
    epic: { name: 'Epic', multiplier: 2.0, color: '#9d4edd', chance: 0.04, symbol: '★★★★' },
    legendary: { name: 'Legendary', multiplier: 3.0, color: '#ff9e00', chance: 0.01, symbol: '★★★★★' }
};

// Campaign stages with enemies and rewards
const CAMPAIGN_STAGES = {
    '1-1': {
        enemies: [
            { class: 'warrior', level: 1, rarity: 'common' },
            { class: 'archer', level: 1, rarity: 'common' }
        ],
        rewards: { gold: 100, exp: 10, gems: 5 }
    },
    '1-2': {
        enemies: [
            { class: 'warrior', level: 2, rarity: 'common' },
            { class: 'mage', level: 2, rarity: 'common' },
            { class: 'archer', level: 1, rarity: 'common' }
        ],
        rewards: { gold: 150, exp: 15, gems: 5 }
    },
    '1-3': {
        enemies: [
            { class: 'tank', level: 3, rarity: 'uncommon' },
            { class: 'warrior', level: 3, rarity: 'common' },
            { class: 'healer', level: 2, rarity: 'common' }
        ],
        rewards: { gold: 200, exp: 20, gems: 10 }
    },
    '1-4': {
        enemies: [
            { class: 'warrior', level: 4, rarity: 'uncommon' },
            { class: 'mage', level: 4, rarity: 'uncommon' },
            { class: 'archer', level: 3, rarity: 'common' },
            { class: 'healer', level: 3, rarity: 'common' }
        ],
        rewards: { gold: 250, exp: 25, gems: 10 }
    },
    '1-5': {
        enemies: [
            { class: 'tank', level: 5, rarity: 'rare' },
            { class: 'warrior', level: 5, rarity: 'uncommon' },
            { class: 'mage', level: 4, rarity: 'uncommon' },
            { class: 'healer', level: 4, rarity: 'uncommon' }
        ],
        rewards: { gold: 300, exp: 30, gems: 15 }
    },
    '2-1': {
        enemies: [
            { class: 'warrior', level: 6, rarity: 'rare' },
            { class: 'mage', level: 6, rarity: 'rare' },
            { class: 'archer', level: 5, rarity: 'uncommon' }
        ],
        rewards: { gold: 350, exp: 35, gems: 15 }
    }
};

// Upgrade costs by level
const UPGRADE_COSTS = {
    gold: level => Math.floor(50 * Math.pow(1.1, level - 1)),
    exp: level => Math.floor(10 * Math.pow(1.2, level - 1))
};

// Idle rewards rates based on player level and stage
const IDLE_RATES = {
    gold: (playerLevel, stage) => 10 * playerLevel + (parseInt(stage.split('-')[0]) * 5),
    exp: (playerLevel, stage) => 5 * playerLevel + (parseInt(stage.split('-')[0]) * 2)
};

// Export all assets
const ASSETS = {
    HERO_CLASSES,
    HERO_NAMES,
    RARITIES,
    CAMPAIGN_STAGES,
    UPGRADE_COSTS,
    IDLE_RATES
};