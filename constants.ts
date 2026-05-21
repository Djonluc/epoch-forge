
import { Boost, BoostCategory, CivPower, Heading, GamePhase, MapType, PresetMode, PointUsageMode, Archetype, SynergyRule, MapInfo, MapSize, Resources, GameSpeed, DoctrineTemplate } from './types';

export const EPOCHS = [
    { id: 1, name: "Stone Age" },
    { id: 2, name: "Tool Age" },
    { id: 3, name: "Copper Age" },
    { id: 4, name: "Bronze Age" },
    { id: 5, name: "Dark Age" },
    { id: 6, name: "Middle Ages" },
    { id: 7, name: "Renaissance" },
    { id: 8, name: "Imperial Age" },
    { id: 9, name: "Enlightenment Age" },
    { id: 10, name: "Industrial Age" },
    { id: 11, name: "Atomic Age" },
    { id: 12, name: "Information Age" },
    { id: 13, name: "Nano Age" },
    { id: 14, name: "Space Age" },
    { id: 15, name: "Digital Age" },
];

export interface MapStrategicWeights {
    categoryWeights: Partial<Record<BoostCategory, number>>;
    tagWeights: Record<string, number>;
}

export const MAP_TYPES_INFO: Record<MapType, MapInfo & { strategic: MapStrategicWeights }> = {
    'Continental': {
        id: 'Continental', label: 'Continental', description: 'Large landmasses separated by oceans.', category: 'land', navalSupport: false,
        strategic: {
            categoryWeights: { "Infantry – Ranged": 1.2, "Infantry – Sword / Spear": 1.2, "Tanks": 1.2, "Ships": 0 },
            tagWeights: { "Land": 1.5, "Naval": 0, "Expansion": 1.2 }
        }
    },
    'Mediterranean': {
        id: 'Mediterranean', label: 'Mediterranean', description: 'Inland sea surrounded by land.', category: 'mixed', navalSupport: true,
        strategic: {
            categoryWeights: { "Ships": 1.5, "Infantry – Ranged": 1.1 },
            tagWeights: { "Naval": 1.4, "Amphibious": 1.5 }
        }
    },
    'Highlands': {
        id: 'Highlands', label: 'Highlands', description: 'Mountainous terrain with chokepoints.', category: 'land', navalSupport: false,
        strategic: {
            categoryWeights: { "Civ – Buildings, Walls & Towers": 1.4, "Siege Weapons & Mobile AA": 1.3 },
            tagWeights: { "Defensive": 1.4, "Chokepoint": 1.5 }
        }
    },
    'Plains': {
        id: 'Plains', label: 'Plains', description: 'Open flatlands ideal for cavalry.', category: 'land', navalSupport: false,
        strategic: {
            categoryWeights: { "Cavalry – Ranged": 1.4, "Cavalry – Melee": 1.4 },
            tagWeights: { "Mobility": 1.5, "Open": 1.4 }
        }
    },
    'Large Islands': {
        id: 'Large Islands', label: 'Large Islands', description: 'Multiple large islands.', category: 'mixed', navalSupport: true,
        strategic: {
            categoryWeights: { "Ships": 1.8, "Aircraft": 1.3 },
            tagWeights: { "Naval": 1.6, "Expansion": 1.4 }
        }
    },
    'Small Islands': {
        id: 'Small Islands', label: 'Small Islands', description: 'Archipelago of small islands.', category: 'water', navalSupport: true,
        strategic: {
            categoryWeights: { "Ships": 2.5, "Civ – Economy": 1.2 },
            tagWeights: { "Naval": 2.0, "Resourceful": 1.3 }
        }
    },
    'Tournament Islands': {
        id: 'Tournament Islands', label: 'Tournament Islands', description: 'Mirrored islands for fair competitive play.', category: 'mixed', navalSupport: true,
        strategic: {
            categoryWeights: { "Ships": 1.6, "Aircraft": 1.3 },
            tagWeights: { "Naval": 1.5, "Expansion": 1.4 }
        }
    },
    'Neo Continental': {
        id: 'Neo Continental', label: 'Neo Continental', description: 'Updated Continental for competitive balance.', category: 'land', navalSupport: false,
        strategic: {
            categoryWeights: { "Infantry – Ranged": 1.2, "Infantry – Sword / Spear": 1.2, "Tanks": 1.2, "Ships": 0 },
            tagWeights: { "Land": 1.5, "Naval": 0, "Expansion": 1.2 }
        }
    },
    'Neo Islands': {
        id: 'Neo Islands', label: 'Neo Islands', description: 'Updated Islands map for competitive balance.', category: 'mixed', navalSupport: true,
        strategic: {
            categoryWeights: { "Ships": 1.7, "Aircraft": 1.3 },
            tagWeights: { "Naval": 1.6, "Expansion": 1.4 }
        }
    },
    'Planets – Earth': {
        id: 'Planets – Earth', label: 'Planets – Earth', description: 'The homeworld.', category: 'space', navalSupport: false, minEpoch: 14,
        strategic: {
            categoryWeights: { "Aircraft": 1.5, "Cyber": 1.4, "Tanks": 1.3, "Ships": 0 },
            tagWeights: { "Space": 1.5, "Technical": 1.3 }
        }
    },
    'Planets – Large': {
        id: 'Planets – Large', label: 'Planets – Large', description: 'A massive alien world.', category: 'space', navalSupport: false, minEpoch: 14,
        strategic: {
            categoryWeights: { "Aircraft": 1.4, "Tanks": 1.5, "Ships": 0 },
            tagWeights: { "Space": 1.4, "Industrial": 1.3 }
        }
    },
    'Planets – Small': {
        id: 'Planets – Small', label: 'Planets – Small', description: 'A small rocky planetoid.', category: 'space', navalSupport: false, minEpoch: 14,
        strategic: {
            categoryWeights: { "Cyber": 1.5, "Infantry – Ranged": 1.3, "Ships": 0 },
            tagWeights: { "Space": 1.5, "Fast": 1.3 }
        }
    },
    'Planets – Mars': {
        id: 'Planets – Mars', label: 'Planets – Mars', description: 'The red planet.', category: 'space', navalSupport: false, minEpoch: 14,
        strategic: {
            categoryWeights: { "Tanks": 1.4, "Siege Weapons & Mobile AA": 1.4, "Ships": 0 },
            tagWeights: { "Space": 1.4, "Attrition": 1.3 }
        }
    },
    'Planets – Satellite': {
        id: 'Planets – Satellite', label: 'Planets – Satellite', description: 'Orbital station warfare.', category: 'space', navalSupport: false, minEpoch: 14,
        strategic: {
            categoryWeights: { "Cyber": 1.8, "Aircraft": 1.5, "Ships": 0 },
            tagWeights: { "Space": 1.8, "Electronic": 1.5 }
        }
    }
};

export const DOCTRINES: DoctrineTemplate[] = [
    {
        id: 'infantry_rush',
        name: 'Infantry Rush',
        description: 'Overwhelm enemies early with massive waves of cheap infantry.',
        preferredTags: ['Rush', 'Cheap', 'Infantry', 'Early'],
        forbiddenTags: ['Late', 'Greedy', 'Turtle'],
        priorityCategories: ['Infantry – Sword / Spear', 'Infantry – Ranged', 'Citizens & Fishing Boats'],
        ecoFocus: 'Aggressive',
        militaryIdentity: 'Swarm',
        mapPreference: ['land', 'mixed'],
        winCondition: 'Early Domination'
    },
    {
        id: 'defensive_turtle',
        name: 'Defensive Turtle',
        description: 'Build an impenetrable fortress and outlast your opponents.',
        preferredTags: ['Turtle', 'Defensive', 'Late', 'Armor'],
        forbiddenTags: ['Rush', 'Mobility'],
        priorityCategories: ['Civ – Buildings, Walls & Towers', 'Siege Weapons & Mobile AA', 'Religion'],
        ecoFocus: 'Stable',
        militaryIdentity: 'Heavy',
        mapPreference: ['land', 'mixed', 'space'],
        winCondition: 'Attrition'
    },
    {
        id: 'economic_boom',
        name: 'Economic Boom',
        description: 'Sacrifice early military for a massive late-game technological advantage.',
        preferredTags: ['Boom', 'Scaling', 'Late', 'Greedy'],
        forbiddenTags: ['Rush', 'Cheap'],
        priorityCategories: ['Civ – Economy', 'Citizens & Fishing Boats', 'Cyber'],
        ecoFocus: 'Greedy',
        militaryIdentity: 'Elite',
        mapPreference: ['land', 'mixed', 'space'],
        winCondition: 'Technological Superiority'
    },
    {
        id: 'naval_domination',
        name: 'Naval Domination',
        description: 'Control the seas and choke off enemy trade and expansion.',
        preferredTags: ['Naval', 'Amphibious', 'Expansion'],
        forbiddenTags: ['Space'],
        priorityCategories: ['Ships', 'Civ – Economy', 'Aircraft'],
        ecoFocus: 'Stable',
        militaryIdentity: 'Heavy',
        mapPreference: ['water', 'mixed'],
        winCondition: 'Maritime Hegemony'
    },
    {
        id: 'guerilla_warfare',
        name: 'Guerilla Warfare',
        description: 'Hit-and-run tactics focused on mobility and sabotage.',
        preferredTags: ['Mobility', 'Stealth', 'Raiding', 'Fast'],
        forbiddenTags: ['Heavy', 'Armor'],
        priorityCategories: ['Cavalry – Ranged', 'Infantry – Ranged', 'Aircraft'],
        ecoFocus: 'Aggressive',
        militaryIdentity: 'Technical',
        mapPreference: ['land', 'mixed'],
        winCondition: 'Economic Sabotage'
    },
    {
        id: 'siege_attrition',
        name: 'Siege Attrition',
        description: 'Break enemy spirits with long-range bombardment and persistent pressure.',
        preferredTags: ['Attrition', 'Range', 'Siege', 'Slow'],
        forbiddenTags: ['Fast', 'Rush'],
        priorityCategories: ['Siege Weapons & Mobile AA', 'Tanks', 'Civ – Buildings, Walls & Towers'],
        ecoFocus: 'Stable',
        militaryIdentity: 'Heavy',
        mapPreference: ['land', 'mixed'],
        winCondition: 'Total Destruction'
    },
    {
        id: 'air_superiority',
        name: 'Air Superiority',
        description: 'Rule the skies and strike anywhere on the map with impunity.',
        preferredTags: ['Air', 'Range', 'Technical', 'Late'],
        forbiddenTags: ['Early', 'Melee'],
        priorityCategories: ['Aircraft', 'Cyber', 'Siege Weapons & Mobile AA'],
        ecoFocus: 'Greedy',
        militaryIdentity: 'Elite',
        mapPreference: ['land', 'mixed', 'space'],
        winCondition: 'Strategic Bombing'
    },
    {
        id: 'mechanized_assault',
        name: 'Mechanized Assault',
        description: 'Deploy overwhelming armored force for a decisive mid-game push.',
        preferredTags: ['Heavy', 'Armor', 'Military', 'Industrial'],
        forbiddenTags: ['Stealth', 'Magic'],
        priorityCategories: ['Tanks', 'Siege Weapons & Mobile AA', 'Civ – Economy'],
        ecoFocus: 'Stable',
        militaryIdentity: 'Heavy',
        mapPreference: ['land', 'mixed', 'space'],
        winCondition: 'Armored Breakthrough'
    }
];

export const PRESET_MODES_INFO: Record<PresetMode, { description: string }> = {
    'Casual': { description: 'Focus on flavor and fun over rigid balance.' },
    'Tournament': { description: 'Strict balance rules and no individual rerolls.' },
    'Chaos': { description: 'Highly varied power levels and strange combinations.' },
    'Historical': { description: 'Attempts to match real-world historical archetypes.' }
};

export const POINT_MODES_INFO: Record<PointUsageMode, { description: string }> = {
    'Efficient': { description: 'AI tries to squeeze maximum value from every point.' },
    'Exact': { description: 'AI targets exactly 100 points, even if suboptimal.' },
    'Loose': { description: 'AI prioritizes flavor, potentially leaving points unspent.' }
};

export const MAP_SIZES_INFO: Record<MapSize, { description: string }> = {
    'Tiny': { description: 'Extremely cramped. Fast early engagements. Highly lethal.' },
    'Small': { description: 'Limited space. Forces early expansion and border friction.' },
    'Medium': { description: 'Standard strategic layout. Balanced for all playstyles.' },
    'Large': { description: 'Abundant space. Favors booming and late-game scaling.' },
    'Huge': { description: 'Massive theater. Extremely difficult to conquer quickly.' }
};

export const RESOURCES_INFO: Record<Resources, { description: string }> = {
    'Low': { description: 'Scarcity. Forces aggressive map control and early skirmishes.' },
    'Standard': { description: 'Balanced economy. Supports both rushing and booming.' },
    'High': { description: 'Abundance. Massive armies, fast tech, and defensive stalemates.' }
};

export const GAME_SPEEDS_INFO: Record<GameSpeed, { description: string }> = {
    'Slow': { description: 'Extended epochs. Emphasizes unit micro and map control.' },
    'Standard': { description: 'Normal pacing. Balanced strategic windows.' },
    'Fast': { description: 'Rapid progression. Forgives early mistakes, rewards fast APM.' }
};

export const MAP_TYPES: MapType[] = Object.keys(MAP_TYPES_INFO) as MapType[];
export const PRESET_MODES: PresetMode[] = Object.keys(PRESET_MODES_INFO) as PresetMode[];
export const POINT_MODES: PointUsageMode[] = Object.keys(POINT_MODES_INFO) as PointUsageMode[];
export const MAP_SIZES: MapSize[] = ['Tiny', 'Small', 'Medium', 'Large', 'Huge'];
export const RESOURCES: Resources[] = ['Low', 'Standard', 'High'];
export const GAME_SPEEDS: GameSpeed[] = ['Slow', 'Standard', 'Fast'];

export const ARCHETYPES: Archetype[] = [
    'Random', 'Economic', 'Aggressive', 'Defensive', 'Naval', 'Balanced'
];

export const DEFAULT_NAMES = [
    'Taco', 'Piert', 'DjonLuc', 'Justin', 'Naldo', 'Pash', 'Kuban', "Player 8", "Player 9", "Player 10"
];

// Headings with their inflation costs (Multiple Bonus Cost)
export const HEADINGS: Heading[] = [
    { name: "Civ – Economy", bonusCost: 6, minEpoch: 1 },
    { name: "Civ – Buildings, Walls & Towers", bonusCost: 3, minEpoch: 1 },
    { name: "Civ – General", bonusCost: 0, minEpoch: 1 },
    { name: "Citizens & Fishing Boats", bonusCost: 2, minEpoch: 1 },
    { name: "Infantry – Ranged", bonusCost: 5, minEpoch: 1 },
    { name: "Infantry – Sword / Spear", bonusCost: 3, minEpoch: 1 },
    { name: "Cavalry – Ranged", bonusCost: 4, minEpoch: 3 },
    { name: "Cavalry – Melee", bonusCost: 4, minEpoch: 3 },
    { name: "Siege Weapons & Mobile AA", bonusCost: 2, minEpoch: 3 },
    { name: "Ships", bonusCost: 4, minEpoch: 2 },
    { name: "Tanks", bonusCost: 5, minEpoch: 10 },
    { name: "Aircraft", bonusCost: 5, minEpoch: 10 },
    { name: "Cyber", bonusCost: 6, minEpoch: 13 },
    { name: "Religion", bonusCost: 2, minEpoch: 3 },
];

// Boosts Data - Expanded for Map Filtering
export const BOOSTS: Boost[] = [
    // Civ – Economy
    { name: "20% Farming", baseCost: 9, category: "Civ – Economy", tags: [GamePhase.EARLY], meta: { strategyTags: ["Boom", "Food"], terrainAffinity: ["land"], doctrineAffinity: ["economic_boom", "infantry_rush"], antiSynergyTags: ["Naval"], role: "Core", unitFocus: ["Infantry"] } },
    { name: "20% Fishing", baseCost: 9, category: "Civ – Economy", tags: [GamePhase.EARLY], meta: { strategyTags: ["Boom", "Food", "Naval"], terrainAffinity: ["water", "mixed"], doctrineAffinity: ["naval_domination", "economic_boom"], antiSynergyTags: ["Space"], role: "Core" } },
    { name: "15% Gold Mining", baseCost: 11, category: "Civ – Economy", tags: [GamePhase.EARLY, GamePhase.MID], meta: { strategyTags: ["Boom", "Wealth", "Tech"], terrainAffinity: ["land", "mixed", "space"], doctrineAffinity: ["economic_boom", "air_superiority"], antiSynergyTags: [], role: "Core" } },
    { name: "20% Hunting & Foraging", baseCost: 11, category: "Civ – Economy", tags: [GamePhase.EARLY], meta: { strategyTags: ["Rush", "Food"], terrainAffinity: ["land"], doctrineAffinity: ["infantry_rush"], antiSynergyTags: ["Late"], role: "Support" } },
    { name: "15% Iron Mining", baseCost: 11, category: "Civ – Economy", tags: [GamePhase.MID, GamePhase.LATE], meta: { strategyTags: ["Military", "Heavy"], terrainAffinity: ["land", "mixed", "space"], doctrineAffinity: ["siege_attrition", "defensive_turtle"], antiSynergyTags: [], role: "Core", unitFocus: ["Tanks", "Siege"] } },
    { name: "20% Stone Mining", baseCost: 9, category: "Civ – Economy", tags: [GamePhase.EARLY, GamePhase.MID], meta: { strategyTags: ["Turtle", "Defensive"], terrainAffinity: ["land", "mixed", "space"], doctrineAffinity: ["defensive_turtle"], antiSynergyTags: ["Rush"], role: "Support" } },
    { name: "15% Wood Cutting", baseCost: 13, category: "Civ – Economy", tags: [GamePhase.EARLY], meta: { strategyTags: ["Expansion", "Naval", "Cheap"], terrainAffinity: ["land", "mixed"], doctrineAffinity: ["infantry_rush", "naval_domination"], antiSynergyTags: ["Space"], role: "Core" } },

    // Civ – Buildings
    { name: "20% Attack (Buildings)", baseCost: 3, category: "Civ – Buildings, Walls & Towers", tags: [GamePhase.EARLY], meta: { strategyTags: ["Turtle", "Defensive"], terrainAffinity: ["land", "mixed", "space"], doctrineAffinity: ["defensive_turtle"], antiSynergyTags: ["Rush"], role: "Support" } },
    { name: "30% Build Time Decrease (Buildings)", baseCost: 4, category: "Civ – Buildings, Walls & Towers", tags: [GamePhase.EARLY], meta: { strategyTags: ["Expansion", "Fast"], terrainAffinity: ["land", "mixed", "space"], doctrineAffinity: ["economic_boom", "defensive_turtle"], antiSynergyTags: [], role: "Support" } },
    { name: "15% Cost Reduction (Buildings)", baseCost: 11, category: "Civ – Buildings, Walls & Towers", tags: [GamePhase.EARLY, GamePhase.MID], meta: { strategyTags: ["Expansion", "Cheap"], terrainAffinity: ["land", "mixed", "space"], doctrineAffinity: ["economic_boom", "defensive_turtle"], antiSynergyTags: [], role: "Support" } },
    { name: "50% Hit Points (Buildings)", baseCost: 11, category: "Civ – Buildings, Walls & Towers", tags: [GamePhase.MID], meta: { strategyTags: ["Turtle", "Defensive", "Heavy"], terrainAffinity: ["land", "mixed", "space"], doctrineAffinity: ["defensive_turtle", "siege_attrition"], antiSynergyTags: ["Rush"], role: "Core" } },
    { name: "20% Range (Buildings)", baseCost: 4, category: "Civ – Buildings, Walls & Towers", tags: [GamePhase.MID], meta: { strategyTags: ["Turtle", "Defensive", "Range"], terrainAffinity: ["land", "mixed", "space"], doctrineAffinity: ["defensive_turtle"], antiSynergyTags: ["Rush"], role: "Support" } },

    // Civ – General
    { name: "50% Conversion Resistance", baseCost: 10, category: "Civ – General", tags: [GamePhase.MID, GamePhase.LATE], meta: { strategyTags: ["Defensive", "Stability"], terrainAffinity: ["land", "mixed", "space"], doctrineAffinity: ["defensive_turtle"], antiSynergyTags: [], role: "Tech" } },
    { name: "20% Mountain Combat Bonus", baseCost: 4, category: "Civ – General", tags: [GamePhase.MID], meta: { strategyTags: ["Tactical", "Highlands"], terrainAffinity: ["land"], doctrineAffinity: ["guerilla_warfare"], antiSynergyTags: [], role: "Support" } },
    { name: "15% Population Cap", baseCost: 9, category: "Civ – General", tags: [GamePhase.LATE], meta: { strategyTags: ["Boom", "Swarm", "Late"], terrainAffinity: ["land", "mixed", "space"], doctrineAffinity: ["economic_boom", "infantry_rush"], antiSynergyTags: [], role: "Scaling" } },

    // Citizens
    { name: "30% Attack (Citizens)", baseCost: 1, category: "Citizens & Fishing Boats", tags: [GamePhase.EARLY], meta: { strategyTags: ["Rush", "Defensive"], terrainAffinity: ["land", "mixed", "space"], doctrineAffinity: ["infantry_rush", "defensive_turtle"], antiSynergyTags: [], role: "Support" } },
    { name: "10% Build Time Decrease (Citizens)", baseCost: 20, category: "Citizens & Fishing Boats", tags: [GamePhase.EARLY], meta: { strategyTags: ["Boom", "Expansion"], terrainAffinity: ["land", "mixed", "space"], doctrineAffinity: ["economic_boom", "fast_expansion"], antiSynergyTags: [], role: "Core" } },
    { name: "20% Cost Reduction (Citizens)", baseCost: 25, category: "Citizens & Fishing Boats", tags: [GamePhase.EARLY], meta: { strategyTags: ["Boom", "Swarm"], terrainAffinity: ["land", "mixed", "space"], doctrineAffinity: ["economic_boom", "infantry_rush"], antiSynergyTags: [], role: "Core" } },
    { name: "30% Hit Points (Citizens)", baseCost: 3, category: "Citizens & Fishing Boats", tags: [GamePhase.EARLY], meta: { strategyTags: ["Defensive", "Stability"], terrainAffinity: ["land", "mixed", "space"], doctrineAffinity: ["defensive_turtle"], antiSynergyTags: [], role: "Support" } },
    { name: "35% Range (Citizens)", baseCost: 2, category: "Citizens & Fishing Boats", tags: [GamePhase.EARLY], meta: { strategyTags: ["Defensive", "Tactical"], terrainAffinity: ["land", "mixed", "space"], doctrineAffinity: ["defensive_turtle"], antiSynergyTags: [], role: "Support" } },
    { name: "20% Speed (Citizens)", baseCost: 4, category: "Citizens & Fishing Boats", tags: [GamePhase.EARLY], meta: { strategyTags: ["Mobility", "Expansion"], terrainAffinity: ["land", "mixed", "space"], doctrineAffinity: ["economic_boom", "guerilla_warfare"], antiSynergyTags: [], role: "Support" } },

    // Infantry - Ranged
    { name: "20% Armor (Ranged Inf)", baseCost: 3, category: "Infantry – Ranged", tags: [GamePhase.MID], meta: { strategyTags: ["Military", "Armor"], terrainAffinity: ["land", "mixed"], doctrineAffinity: ["defensive_turtle", "infantry_rush"], antiSynergyTags: [], role: "Support", unitFocus: ["Infantry"] } },
    { name: "20% Attack (Ranged Inf)", baseCost: 5, category: "Infantry – Ranged", tags: [GamePhase.EARLY, GamePhase.MID], meta: { strategyTags: ["Military", "Attack", "Range"], terrainAffinity: ["land", "mixed"], doctrineAffinity: ["infantry_rush", "guerilla_warfare"], antiSynergyTags: [], role: "Core", unitFocus: ["Infantry"] } },
    { name: "30% Build Time (Ranged Inf)", baseCost: 4, category: "Infantry – Ranged", tags: [GamePhase.EARLY], meta: { strategyTags: ["Military", "Swarm"], terrainAffinity: ["land", "mixed"], doctrineAffinity: ["infantry_rush"], antiSynergyTags: [], role: "Support", unitFocus: ["Infantry"] } },
    { name: "20% Cost Reduction (Ranged Inf)", baseCost: 9, category: "Infantry – Ranged", tags: [GamePhase.EARLY], meta: { strategyTags: ["Military", "Cheap", "Swarm"], terrainAffinity: ["land", "mixed"], doctrineAffinity: ["infantry_rush"], antiSynergyTags: [], role: "Core", unitFocus: ["Infantry"] } },
    { name: "25% Hit Points (Ranged Inf)", baseCost: 5, category: "Infantry – Ranged", tags: [GamePhase.MID], meta: { strategyTags: ["Military", "Durability"], terrainAffinity: ["land", "mixed"], doctrineAffinity: ["defensive_turtle", "infantry_rush"], antiSynergyTags: [], role: "Support", unitFocus: ["Infantry"] } },
    { name: "20% Range (Ranged Inf)", baseCost: 6, category: "Infantry – Ranged", tags: [GamePhase.MID, GamePhase.LATE], meta: { strategyTags: ["Military", "Range"], terrainAffinity: ["land", "mixed", "space"], doctrineAffinity: ["siege_attrition", "guerilla_warfare"], antiSynergyTags: [], role: "Core", unitFocus: ["Infantry"] } },
    { name: "20% Speed (Ranged Inf)", baseCost: 5, category: "Infantry – Ranged", tags: [GamePhase.MID], meta: { strategyTags: ["Military", "Mobility"], terrainAffinity: ["land", "mixed"], doctrineAffinity: ["guerilla_warfare", "infantry_rush"], antiSynergyTags: [], role: "Support", unitFocus: ["Infantry"] } },

    // Infantry - Sword/Spear
    { name: "20% Armor (Melee Inf)", baseCost: 2, category: "Infantry – Sword / Spear", tags: [GamePhase.MID], meta: { strategyTags: ["Military", "Armor"], terrainAffinity: ["land", "mixed"], doctrineAffinity: ["defensive_turtle", "infantry_rush"], antiSynergyTags: [], role: "Support", unitFocus: ["Infantry"] } },
    { name: "20% Attack (Melee Inf)", baseCost: 3, category: "Infantry – Sword / Spear", tags: [GamePhase.EARLY, GamePhase.MID], meta: { strategyTags: ["Military", "Attack"], terrainAffinity: ["land", "mixed"], doctrineAffinity: ["infantry_rush"], antiSynergyTags: [], role: "Core", unitFocus: ["Infantry"] } },
    { name: "30% Build Time (Melee Inf)", baseCost: 2, category: "Infantry – Sword / Spear", tags: [GamePhase.EARLY], meta: { strategyTags: ["Military", "Swarm", "Rush"], terrainAffinity: ["land", "mixed"], doctrineAffinity: ["infantry_rush"], antiSynergyTags: [], role: "Support", unitFocus: ["Infantry"] } },
    { name: "20% Cost Reduction (Melee Inf)", baseCost: 7, category: "Infantry – Sword / Spear", tags: [GamePhase.EARLY], meta: { strategyTags: ["Military", "Cheap", "Swarm"], terrainAffinity: ["land", "mixed"], doctrineAffinity: ["infantry_rush"], antiSynergyTags: [], role: "Core", unitFocus: ["Infantry"] } },
    { name: "25% Hit Points (Melee Inf)", baseCost: 3, category: "Infantry – Sword / Spear", tags: [GamePhase.MID], meta: { strategyTags: ["Military", "Durability"], terrainAffinity: ["land", "mixed"], doctrineAffinity: ["defensive_turtle", "infantry_rush"], antiSynergyTags: [], role: "Support", unitFocus: ["Infantry"] } },
    { name: "20% Range (Melee Inf)", baseCost: 3, category: "Infantry – Sword / Spear", tags: [GamePhase.MID], meta: { strategyTags: ["Military", "Tactical"], terrainAffinity: ["land", "mixed"], doctrineAffinity: ["infantry_rush"], antiSynergyTags: [], role: "Support", unitFocus: ["Infantry"] } },
    { name: "20% Speed (Melee Inf)", baseCost: 3, category: "Infantry – Sword / Spear", tags: [GamePhase.MID], meta: { strategyTags: ["Military", "Mobility"], terrainAffinity: ["land", "mixed"], doctrineAffinity: ["infantry_rush", "guerilla_warfare"], antiSynergyTags: [], role: "Support", unitFocus: ["Infantry"] } },

    // Cavalry - Ranged
    { name: "20% Armor (Cav Ranged)", baseCost: 2, category: "Cavalry – Ranged", tags: [GamePhase.MID], meta: { strategyTags: ["Military", "Mobility", "Armor"], terrainAffinity: ["land", "mixed"], doctrineAffinity: ["guerilla_warfare"], antiSynergyTags: [], role: "Support", unitFocus: ["Cavalry"] } },
    { name: "20% Attack (Cav Ranged)", baseCost: 4, category: "Cavalry – Ranged", tags: [GamePhase.MID], meta: { strategyTags: ["Military", "Attack", "Range"], terrainAffinity: ["land", "mixed"], doctrineAffinity: ["guerilla_warfare"], antiSynergyTags: [], role: "Core", unitFocus: ["Cavalry"] } },
    { name: "30% Build Time (Cav Ranged)", baseCost: 3, category: "Cavalry – Ranged", tags: [GamePhase.MID], meta: { strategyTags: ["Military", "Mobility", "Swarm"], terrainAffinity: ["land", "mixed"], doctrineAffinity: ["guerilla_warfare"], antiSynergyTags: [], role: "Support", unitFocus: ["Cavalry"] } },
    { name: "20% Cost Reduction (Cav Ranged)", baseCost: 8, category: "Cavalry – Ranged", tags: [GamePhase.MID], meta: { strategyTags: ["Military", "Mobility", "Cheap"], terrainAffinity: ["land", "mixed"], doctrineAffinity: ["guerilla_warfare"], antiSynergyTags: [], role: "Core", unitFocus: ["Cavalry"] } },
    { name: "25% Hit Points (Cav Ranged)", baseCost: 4, category: "Cavalry – Ranged", tags: [GamePhase.MID], meta: { strategyTags: ["Military", "Mobility", "Durability"], terrainAffinity: ["land", "mixed"], doctrineAffinity: ["guerilla_warfare"], antiSynergyTags: [], role: "Support", unitFocus: ["Cavalry"] } },
    { name: "20% Range (Cav Ranged)", baseCost: 5, category: "Cavalry – Ranged", tags: [GamePhase.MID], meta: { strategyTags: ["Military", "Mobility", "Range"], terrainAffinity: ["land", "mixed"], doctrineAffinity: ["guerilla_warfare"], antiSynergyTags: [], role: "Core", unitFocus: ["Cavalry"] } },
    { name: "20% Speed (Cav Ranged)", baseCost: 4, category: "Cavalry – Ranged", tags: [GamePhase.MID], meta: { strategyTags: ["Military", "Mobility", "Fast"], terrainAffinity: ["land", "mixed"], doctrineAffinity: ["guerilla_warfare"], antiSynergyTags: [], role: "Core", unitFocus: ["Cavalry"] } },

    // Cavalry - Melee
    { name: "20% Armor (Cav Melee)", baseCost: 2, category: "Cavalry – Melee", tags: [GamePhase.MID], meta: { strategyTags: ["Military", "Mobility", "Armor"], terrainAffinity: ["land", "mixed"], doctrineAffinity: ["guerilla_warfare"], antiSynergyTags: [], role: "Support", unitFocus: ["Cavalry"] } },
    { name: "20% Attack (Cav Melee)", baseCost: 4, category: "Cavalry – Melee", tags: [GamePhase.MID], meta: { strategyTags: ["Military", "Attack"], terrainAffinity: ["land", "mixed"], doctrineAffinity: ["guerilla_warfare"], antiSynergyTags: [], role: "Core", unitFocus: ["Cavalry"] } },
    { name: "30% Build Time (Cav Melee)", baseCost: 3, category: "Cavalry – Melee", tags: [GamePhase.MID], meta: { strategyTags: ["Military", "Mobility", "Swarm"], terrainAffinity: ["land", "mixed"], doctrineAffinity: ["guerilla_warfare"], antiSynergyTags: [], role: "Support", unitFocus: ["Cavalry"] } },
    { name: "20% Cost Reduction (Cav Melee)", baseCost: 8, category: "Cavalry – Melee", tags: [GamePhase.MID], meta: { strategyTags: ["Military", "Mobility", "Cheap"], terrainAffinity: ["land", "mixed"], doctrineAffinity: ["guerilla_warfare"], antiSynergyTags: [], role: "Core", unitFocus: ["Cavalry"] } },
    { name: "25% Hit Points (Cav Melee)", baseCost: 4, category: "Cavalry – Melee", tags: [GamePhase.MID], meta: { strategyTags: ["Military", "Mobility", "Durability"], terrainAffinity: ["land", "mixed"], doctrineAffinity: ["guerilla_warfare"], antiSynergyTags: [], role: "Support", unitFocus: ["Cavalry"] } },
    { name: "20% Speed (Cav Melee)", baseCost: 4, category: "Cavalry – Melee", tags: [GamePhase.MID], meta: { strategyTags: ["Military", "Mobility", "Fast"], terrainAffinity: ["land", "mixed"], doctrineAffinity: ["guerilla_warfare"], antiSynergyTags: [], role: "Core", unitFocus: ["Cavalry"] } },

    // Siege
    { name: "20% Area Effect (Siege)", baseCost: 5, category: "Siege Weapons & Mobile AA", tags: [GamePhase.LATE], meta: { strategyTags: ["Military", "Siege", "Area"], terrainAffinity: ["land", "mixed", "space"], doctrineAffinity: ["siege_attrition"], antiSynergyTags: ["Rush"], role: "Core", unitFocus: ["Siege"] } },
    { name: "20% Armor (Siege)", baseCost: 1, category: "Siege Weapons & Mobile AA", tags: [GamePhase.LATE], meta: { strategyTags: ["Military", "Siege", "Armor"], terrainAffinity: ["land", "mixed", "space"], doctrineAffinity: ["siege_attrition"], antiSynergyTags: [], role: "Support", unitFocus: ["Siege"] } },
    { name: "20% Attack (Siege)", baseCost: 2, category: "Siege Weapons & Mobile AA", tags: [GamePhase.LATE], meta: { strategyTags: ["Military", "Siege", "Attack"], terrainAffinity: ["land", "mixed", "space"], doctrineAffinity: ["siege_attrition"], antiSynergyTags: [], role: "Core", unitFocus: ["Siege"] } },
    { name: "30% Build Time (Siege)", baseCost: 1, category: "Siege Weapons & Mobile AA", tags: [GamePhase.MID], meta: { strategyTags: ["Military", "Siege", "Swarm"], terrainAffinity: ["land", "mixed", "space"], doctrineAffinity: ["siege_attrition"], antiSynergyTags: [], role: "Support", unitFocus: ["Siege"] } },
    { name: "20% Cost Reduction (Siege)", baseCost: 3, category: "Siege Weapons & Mobile AA", tags: [GamePhase.MID], meta: { strategyTags: ["Military", "Siege", "Cheap"], terrainAffinity: ["land", "mixed", "space"], doctrineAffinity: ["siege_attrition"], antiSynergyTags: [], role: "Core", unitFocus: ["Siege"] } },
    { name: "25% Hit Points (Siege)", baseCost: 2, category: "Siege Weapons & Mobile AA", tags: [GamePhase.LATE], meta: { strategyTags: ["Military", "Siege", "Durability"], terrainAffinity: ["land", "mixed", "space"], doctrineAffinity: ["siege_attrition"], antiSynergyTags: [], role: "Support", unitFocus: ["Siege"] } },
    { name: "20% Range (Siege)", baseCost: 2, category: "Siege Weapons & Mobile AA", tags: [GamePhase.LATE], meta: { strategyTags: ["Military", "Siege", "Range"], terrainAffinity: ["land", "mixed", "space"], doctrineAffinity: ["siege_attrition", "defensive_turtle"], antiSynergyTags: [], role: "Core", unitFocus: ["Siege"] } },
    { name: "25% Rate of Fire (Siege)", baseCost: 2, category: "Siege Weapons & Mobile AA", tags: [GamePhase.LATE], meta: { strategyTags: ["Military", "Siege", "Fast"], terrainAffinity: ["land", "mixed", "space"], doctrineAffinity: ["siege_attrition"], antiSynergyTags: [], role: "Support", unitFocus: ["Siege"] } },
    { name: "20% Speed (Siege)", baseCost: 2, category: "Siege Weapons & Mobile AA", tags: [GamePhase.LATE], meta: { strategyTags: ["Military", "Siege", "Mobility"], terrainAffinity: ["land", "mixed", "space"], doctrineAffinity: ["siege_attrition"], antiSynergyTags: [], role: "Support", unitFocus: ["Siege"] } },

    // Tanks
    { name: "20% Armor (Tanks)", baseCost: 3, category: "Tanks", tags: [GamePhase.LATE], meta: { strategyTags: ["Military", "Armor", "Heavy"], terrainAffinity: ["land", "mixed", "space"], doctrineAffinity: ["mechanized_assault"], antiSynergyTags: [], role: "Support", unitFocus: ["Tanks"] } },
    { name: "20% Attack (Tanks)", baseCost: 5, category: "Tanks", tags: [GamePhase.LATE], meta: { strategyTags: ["Military", "Attack", "Heavy"], terrainAffinity: ["land", "mixed", "space"], doctrineAffinity: ["mechanized_assault"], antiSynergyTags: [], role: "Core", unitFocus: ["Tanks"] } },
    { name: "20% Cost Reduction (Tanks)", baseCost: 9, category: "Tanks", tags: [GamePhase.LATE], meta: { strategyTags: ["Military", "Cheap", "Heavy"], terrainAffinity: ["land", "mixed", "space"], doctrineAffinity: ["mechanized_assault"], antiSynergyTags: [], role: "Core", unitFocus: ["Tanks"] } },
    { name: "25% Hit Points (Tanks)", baseCost: 5, category: "Tanks", tags: [GamePhase.LATE], meta: { strategyTags: ["Military", "Durability", "Heavy"], terrainAffinity: ["land", "mixed", "space"], doctrineAffinity: ["mechanized_assault", "defensive_turtle"], antiSynergyTags: [], role: "Support", unitFocus: ["Tanks"] } },

    // Aircraft
    { name: "20% Attack (Bombers)", baseCost: 5, category: "Aircraft", tags: [GamePhase.LATE], meta: { strategyTags: ["Military", "Air", "Area"], terrainAffinity: ["land", "mixed", "space"], doctrineAffinity: ["air_superiority"], antiSynergyTags: ["Rush"], role: "Core", unitFocus: ["Aircraft"] } },
    { name: "20% Attack (Fighters)", baseCost: 5, category: "Aircraft", tags: [GamePhase.LATE], meta: { strategyTags: ["Military", "Air", "Tactical"], terrainAffinity: ["land", "mixed", "space"], doctrineAffinity: ["air_superiority"], antiSynergyTags: [], role: "Core", unitFocus: ["Aircraft"] } },
    { name: "30% Build Time (Fighters)", baseCost: 4, category: "Aircraft", tags: [GamePhase.LATE], meta: { strategyTags: ["Military", "Air", "Swarm"], terrainAffinity: ["land", "mixed", "space"], doctrineAffinity: ["air_superiority"], antiSynergyTags: [], role: "Support", unitFocus: ["Aircraft"] } },
    { name: "25% Hit Points (Bombers)", baseCost: 5, category: "Aircraft", tags: [GamePhase.LATE], meta: { strategyTags: ["Military", "Air", "Durability"], terrainAffinity: ["land", "mixed", "space"], doctrineAffinity: ["air_superiority"], antiSynergyTags: [], role: "Support", unitFocus: ["Aircraft"] } },

    // Ships
    { name: "20% Speed (Ships)", baseCost: 4, category: "Ships", tags: [GamePhase.MID], meta: { strategyTags: ["Military", "Naval", "Mobility"], terrainAffinity: ["water", "mixed"], doctrineAffinity: ["naval_domination"], antiSynergyTags: ["Space"], role: "Support", unitFocus: ["Ships"] } },
    { name: "20% Attack (Ships)", baseCost: 5, category: "Ships", tags: [GamePhase.MID], meta: { strategyTags: ["Military", "Naval", "Attack"], terrainAffinity: ["water", "mixed"], doctrineAffinity: ["naval_domination"], antiSynergyTags: ["Space"], role: "Core", unitFocus: ["Ships"] } },
    { name: "20% Range (Ships)", baseCost: 6, category: "Ships", tags: [GamePhase.MID], meta: { strategyTags: ["Military", "Naval", "Range"], terrainAffinity: ["water", "mixed"], doctrineAffinity: ["naval_domination"], antiSynergyTags: ["Space"], role: "Core", unitFocus: ["Ships"] } },
    { name: "25% Hit Points (Ships)", baseCost: 5, category: "Ships", tags: [GamePhase.MID], meta: { strategyTags: ["Military", "Naval", "Durability"], terrainAffinity: ["water", "mixed"], doctrineAffinity: ["naval_domination"], antiSynergyTags: ["Space"], role: "Support", unitFocus: ["Ships"] } },
    { name: "20% Cost Reduction (Ships)", baseCost: 9, category: "Ships", tags: [GamePhase.EARLY], meta: { strategyTags: ["Military", "Naval", "Cheap"], terrainAffinity: ["water", "mixed"], doctrineAffinity: ["naval_domination"], antiSynergyTags: ["Space"], role: "Core", unitFocus: ["Ships"] } },

    // Cyber
    { name: "20% Attack (Cyber)", baseCost: 5, category: "Cyber", tags: [GamePhase.LATE], meta: { strategyTags: ["Military", "Tech", "Attack"], terrainAffinity: ["land", "mixed", "space"], doctrineAffinity: ["air_superiority", "economic_boom"], antiSynergyTags: [], role: "Core" } },
    { name: "20% Hit Points (Cyber)", baseCost: 5, category: "Cyber", tags: [GamePhase.LATE], meta: { strategyTags: ["Military", "Tech", "Durability"], terrainAffinity: ["land", "mixed", "space"], doctrineAffinity: ["air_superiority", "economic_boom"], antiSynergyTags: [], role: "Support" } },

    // Religion
    { name: "20% Range (Priests)", baseCost: 4, category: "Religion", tags: [GamePhase.MID], meta: { strategyTags: ["Utility", "Range", "Tactical"], terrainAffinity: ["land", "mixed"], doctrineAffinity: ["defensive_turtle"], antiSynergyTags: [], role: "Support" } },
    { name: "30% Hit Points (Priests)", baseCost: 4, category: "Religion", tags: [GamePhase.MID], meta: { strategyTags: ["Utility", "Durability"], terrainAffinity: ["land", "mixed"], doctrineAffinity: ["defensive_turtle"], antiSynergyTags: [], role: "Support" } },
    { name: "50% Conversion Area", baseCost: 10, category: "Religion", tags: [GamePhase.MID], meta: { strategyTags: ["Utility", "Area", "Tactical"], terrainAffinity: ["land", "mixed"], doctrineAffinity: ["defensive_turtle"], antiSynergyTags: [], role: "Core" } },
];

export const CIV_POWERS: CivPower[] = [
    { name: "Expansionism", cost: 30, minEpoch: 1, maxEpoch: 15, tags: [GamePhase.EARLY], description: "Grants a second starting settler and reduced colony costs.", meta: { strategyTags: ["Expansion", "Boom", "Early"], terrainAffinity: ["land", "mixed"], doctrineAffinity: ["economic_boom", "infantry_rush"], antiSynergyTags: [], role: "Core" } },
    { name: "Advanced Mining", cost: 25, minEpoch: 1, maxEpoch: 15, tags: [GamePhase.EARLY, GamePhase.MID], description: "Deep-crust extraction increases all ore income by 25%.", meta: { strategyTags: ["Boom", "Wealth", "Industrial"], terrainAffinity: ["land", "mixed", "space"], doctrineAffinity: ["economic_boom", "siege_attrition"], antiSynergyTags: [], role: "Core" } },
    { name: "Just-In-Time Manufacturing", cost: 20, minEpoch: 1, maxEpoch: 15, tags: [GamePhase.MID], description: "Global 30% reduction in all unit training times.", meta: { strategyTags: ["Military", "Swarm", "Production"], terrainAffinity: ["land", "mixed", "space"], doctrineAffinity: ["infantry_rush", "guerilla_warfare"], antiSynergyTags: [], role: "Core" } },
    { name: "Market", cost: 20, minEpoch: 10, maxEpoch: 15, tags: [GamePhase.LATE], description: "Enables global resource trading and 15% luxury tax income.", meta: { strategyTags: ["Boom", "Wealth", "Late"], terrainAffinity: ["land", "mixed", "space"], doctrineAffinity: ["economic_boom"], antiSynergyTags: ["Rush"], role: "Tech" } },
    { name: "Missile Base", cost: 15, minEpoch: 13, maxEpoch: 15, tags: [GamePhase.LATE], description: "Strategic long-range strike capability with high collateral damage.", meta: { strategyTags: ["Military", "Range", "Destruction"], terrainAffinity: ["land", "mixed", "space"], doctrineAffinity: ["siege_attrition", "air_superiority"], antiSynergyTags: ["Rush"], role: "Tech" } },
    { name: "Adaptation", cost: 15, minEpoch: 3, maxEpoch: 15, tags: [GamePhase.MID], description: "Switches production focus instantly based on enemy unit types.", meta: { strategyTags: ["Military", "Tactical", "Counter"], terrainAffinity: ["land", "mixed", "space"], doctrineAffinity: ["guerilla_warfare"], antiSynergyTags: [], role: "Support" } },
    { name: "Slavery", cost: 10, minEpoch: 1, maxEpoch: 15, tags: [GamePhase.EARLY], description: "Extreme labor efficiency at the cost of global stability.", meta: { strategyTags: ["Boom", "Production", "Evil"], terrainAffinity: ["land", "mixed"], doctrineAffinity: ["economic_boom", "infantry_rush"], antiSynergyTags: [], role: "Support" } },
    { name: "Priest Tower", cost: 30, minEpoch: 1, maxEpoch: 15, tags: [GamePhase.MID], description: "Radiates a conversion aura that periodically claims nearby units.", meta: { strategyTags: ["Defensive", "Area", "Magic"], terrainAffinity: ["land", "mixed"], doctrineAffinity: ["defensive_turtle"], antiSynergyTags: ["Rush"], role: "Core" } },
    { name: "Pathfinding", cost: 25, minEpoch: 1, maxEpoch: 15, tags: [GamePhase.EARLY], description: "All units ignore terrain penalties and move 15% faster.", meta: { strategyTags: ["Mobility", "Fast", "Exploration"], terrainAffinity: ["land", "mixed"], doctrineAffinity: ["guerilla_warfare", "infantry_rush"], antiSynergyTags: [], role: "Support" } },
    { name: "SAS Commando", cost: 15, minEpoch: 10, maxEpoch: 15, tags: [GamePhase.LATE], description: "Specialized elite infantry with stealth and sabotage abilities.", meta: { strategyTags: ["Military", "Stealth", "Special Forces"], terrainAffinity: ["land", "mixed"], doctrineAffinity: ["guerilla_warfare"], antiSynergyTags: [], role: "Core", unitFocus: ["Infantry"] } },
    { name: "Bundeswehr", cost: 5, minEpoch: 10, maxEpoch: 15, tags: [GamePhase.MID, GamePhase.LATE], description: "Citizens instantly turn into Partisans when attacked.", meta: { strategyTags: ["Defensive", "Swarm", "Late"], terrainAffinity: ["land", "mixed"], doctrineAffinity: ["defensive_turtle"], antiSynergyTags: ["Rush"], role: "Support" } },
    { name: "Conquistadors", cost: 5, minEpoch: 3, maxEpoch: 15, tags: [GamePhase.EARLY, GamePhase.MID], description: "Mounted units gain +50% Line of Sight (LOS).", meta: { strategyTags: ["Mobility", "Fast", "Exploration"], terrainAffinity: ["land", "mixed"], doctrineAffinity: ["guerilla_warfare"], antiSynergyTags: [], role: "Support" } },
    { name: "Exploration", cost: 5, minEpoch: 1, maxEpoch: 15, tags: [GamePhase.EARLY], description: "Capitols and Town Centers gain +50% Line of Sight (LOS).", meta: { strategyTags: ["Exploration", "Early", "Defensive"], terrainAffinity: ["land", "mixed"], doctrineAffinity: ["defensive_turtle"], antiSynergyTags: [], role: "Support" } },
    { name: "Crusaders", cost: 15, minEpoch: 4, maxEpoch: 15, tags: [GamePhase.MID], description: "Sword/Spear infantry and Melee cavalry can convert enemy units during battle.", meta: { strategyTags: ["Military", "Magic", "Tactical"], terrainAffinity: ["land", "mixed"], doctrineAffinity: ["infantry_rush"], antiSynergyTags: [], role: "Core" } },
    { name: "Cyber Ninja", cost: 15, minEpoch: 13, maxEpoch: 15, tags: [GamePhase.LATE], description: "Unlocks cloaked cybernetic units capable of disabling enemy structures.", meta: { strategyTags: ["Cyber", "Stealth", "Raiding"], terrainAffinity: ["land", "mixed", "space"], doctrineAffinity: ["guerilla_warfare"], antiSynergyTags: [], role: "Core" } },
    { name: "Emissaries", cost: 20, minEpoch: 3, maxEpoch: 15, tags: [GamePhase.MID], description: "Priests are cloaked/invisible until they attempt a conversion.", meta: { strategyTags: ["Religion", "Stealth", "Magic"], terrainAffinity: ["land", "mixed"], doctrineAffinity: ["defensive_turtle"], antiSynergyTags: [], role: "Support" } },
    { name: "Camouflage", cost: 25, minEpoch: 1, maxEpoch: 15, tags: [GamePhase.EARLY, GamePhase.MID, GamePhase.LATE], description: "Idle units become cloaked/invisible to enemies without detection.", meta: { strategyTags: ["Stealth", "Defensive", "Tactical"], terrainAffinity: ["land", "mixed"], doctrineAffinity: ["guerilla_warfare"], antiSynergyTags: [], role: "Core" } },
    { name: "Cloaking", cost: 25, minEpoch: 1, maxEpoch: 15, tags: [GamePhase.EARLY, GamePhase.MID, GamePhase.LATE], description: "Capitols and Town Centers cloak all friendly units and structures in a wide radius.", meta: { strategyTags: ["Stealth", "Defensive", "Turtle"], terrainAffinity: ["land", "mixed"], doctrineAffinity: ["defensive_turtle"], antiSynergyTags: ["Rush"], role: "Core" } },
];

export const SYNERGIES: SynergyRule[] = [
    {
        name: "Agrarian Empire",
        items: ["20% Farming", "Expansionism"],
        description: "Massive population boom enabled by cheap land and high food yields."
    },
    {
        name: "Iron Fortress",
        items: ["15% Iron Mining", "50% Hit Points (Buildings)"],
        description: "Indestructible structures fueled by massive iron reserves."
    },
    {
        name: "Hussar Rush",
        items: ["20% Speed (Cavalry)", "30% Build Time (Cavalry)"],
        description: "Lightning-fast raids that overwhelm opponents before they can react."
    },
    {
        name: "Siege Master",
        items: ["20% Area Effect (Siege)", "20% Range (Siege)"],
        description: "Demolish entire bases from a safe distance with devastating accuracy."
    },
    {
        name: "Naval Supremacy",
        items: ["20% Range (Ships)", "20% Attack (Ships)"],
        description: "Total control of the seas with superior firepower and reach."
    },
    {
        name: "Blitzkrieg",
        items: ["20% Attack (Tanks)", "20% Speed (Citizens)"],
        description: "Rapid industrial mobilization paired with overwhelming armored force."
    },
    {
        name: "Divine Protection",
        items: ["Priest Tower", "50% Conversion Resistance"],
        description: "A holy sanctuary that is almost impossible to subvert."
    },
    {
        name: "Resource Monopoly",
        items: ["Advanced Mining", "Slavery"],
        description: "Hyper-efficient extraction that outpaces any conventional economy."
    },
    {
        name: "Ninja Sabotage",
        items: ["Cyber Ninja", "20% Attack (Cyber)"],
        description: "Cyber Ninja units gain advanced logic bombs that detonate with double effectiveness."
    },
    {
        name: "Invisible Guerrillas",
        items: ["Camouflage", "20% Speed (Ranged Inf)"],
        description: "Invisible ranged squads that strike from cover and retreat before detection."
    },
    {
        name: "Holy Crusade",
        items: ["Crusaders", "30% Hit Points (Priests)"],
        description: "Crusading knights whose battlefield conversions sweep through entire tight clusters of enemies."
    }
];
