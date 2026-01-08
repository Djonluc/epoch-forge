
import { Boost, CivPower, Heading, GamePhase, MapType, PresetMode, PointUsageMode, Archetype } from './types';

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

export const MAP_TYPES: MapType[] = [
    'Land', 'Water', 'Mixed', 'Islands', 'Coastal', 'Rivers', 'Space', 'Random'
];

export const PRESET_MODES: PresetMode[] = [
    'Casual', 'Tournament', 'Chaos', 'Historical'
];

export const POINT_MODES: PointUsageMode[] = [
    'Efficient', 'Exact', 'Loose'
];

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
    { name: "20% Farming", baseCost: 9, category: "Civ – Economy", tags: [GamePhase.EARLY] },
    { name: "20% Fishing", baseCost: 9, category: "Civ – Economy", tags: [GamePhase.EARLY] },
    { name: "15% Gold Mining", baseCost: 11, category: "Civ – Economy", tags: [GamePhase.EARLY, GamePhase.MID] },
    { name: "20% Hunting & Foraging", baseCost: 11, category: "Civ – Economy", tags: [GamePhase.EARLY] },
    { name: "15% Iron Mining", baseCost: 11, category: "Civ – Economy", tags: [GamePhase.MID, GamePhase.LATE] },
    { name: "20% Stone Mining", baseCost: 9, category: "Civ – Economy", tags: [GamePhase.EARLY, GamePhase.MID] },
    { name: "15% Wood Cutting", baseCost: 13, category: "Civ – Economy", tags: [GamePhase.EARLY] },

    // Civ – Buildings
    { name: "20% Attack (Buildings)", baseCost: 3, category: "Civ – Buildings, Walls & Towers", tags: [GamePhase.EARLY] },
    { name: "30% Build Time Decrease (Buildings)", baseCost: 4, category: "Civ – Buildings, Walls & Towers", tags: [GamePhase.EARLY] },
    { name: "15% Cost Reduction (Buildings)", baseCost: 11, category: "Civ – Buildings, Walls & Towers", tags: [GamePhase.EARLY, GamePhase.MID] },
    { name: "50% Hit Points (Buildings)", baseCost: 11, category: "Civ – Buildings, Walls & Towers", tags: [GamePhase.MID] },
    { name: "20% Range (Buildings)", baseCost: 4, category: "Civ – Buildings, Walls & Towers", tags: [GamePhase.MID] },

    // Civ – General
    { name: "50% Conversion Resistance", baseCost: 10, category: "Civ – General", tags: [GamePhase.MID, GamePhase.LATE] },
    { name: "20% Mountain Combat Bonus", baseCost: 4, category: "Civ – General", tags: [GamePhase.MID] },
    { name: "15% Population Cap", baseCost: 9, category: "Civ – General", tags: [GamePhase.LATE] },

    // Citizens
    { name: "30% Attack (Citizens)", baseCost: 1, category: "Citizens & Fishing Boats", tags: [GamePhase.EARLY] },
    { name: "10% Build Time Decrease (Citizens)", baseCost: 20, category: "Citizens & Fishing Boats", tags: [GamePhase.EARLY] },
    { name: "20% Cost Reduction (Citizens)", baseCost: 25, category: "Citizens & Fishing Boats", tags: [GamePhase.EARLY] },
    { name: "30% Hit Points (Citizens)", baseCost: 3, category: "Citizens & Fishing Boats", tags: [GamePhase.EARLY] },
    { name: "35% Range (Citizens)", baseCost: 2, category: "Citizens & Fishing Boats", tags: [GamePhase.EARLY] },
    { name: "20% Speed (Citizens)", baseCost: 4, category: "Citizens & Fishing Boats", tags: [GamePhase.EARLY] },

    // Infantry - Ranged
    { name: "20% Armor (Ranged Inf)", baseCost: 3, category: "Infantry – Ranged", tags: [GamePhase.MID] },
    { name: "20% Attack (Ranged Inf)", baseCost: 5, category: "Infantry – Ranged", tags: [GamePhase.EARLY, GamePhase.MID] },
    { name: "30% Build Time (Ranged Inf)", baseCost: 4, category: "Infantry – Ranged", tags: [GamePhase.EARLY] },
    { name: "20% Cost Reduction (Ranged Inf)", baseCost: 9, category: "Infantry – Ranged", tags: [GamePhase.EARLY] },
    { name: "25% Hit Points (Ranged Inf)", baseCost: 5, category: "Infantry – Ranged", tags: [GamePhase.MID] },
    { name: "20% Range (Ranged Inf)", baseCost: 6, category: "Infantry – Ranged", tags: [GamePhase.MID, GamePhase.LATE] },
    { name: "20% Speed (Ranged Inf)", baseCost: 5, category: "Infantry – Ranged", tags: [GamePhase.MID] },

    // Infantry - Sword/Spear
    { name: "20% Armor (Melee Inf)", baseCost: 2, category: "Infantry – Sword / Spear", tags: [GamePhase.MID] },
    { name: "20% Attack (Melee Inf)", baseCost: 3, category: "Infantry – Sword / Spear", tags: [GamePhase.EARLY, GamePhase.MID] },
    { name: "30% Build Time (Melee Inf)", baseCost: 2, category: "Infantry – Sword / Spear", tags: [GamePhase.EARLY] },
    { name: "20% Cost Reduction (Melee Inf)", baseCost: 7, category: "Infantry – Sword / Spear", tags: [GamePhase.EARLY] },
    { name: "25% Hit Points (Melee Inf)", baseCost: 3, category: "Infantry – Sword / Spear", tags: [GamePhase.MID] },
    { name: "20% Range (Melee Inf)", baseCost: 3, category: "Infantry – Sword / Spear", tags: [GamePhase.MID] },
    { name: "20% Speed (Melee Inf)", baseCost: 3, category: "Infantry – Sword / Spear", tags: [GamePhase.MID] },

    // Cavalry - Ranged
    { name: "20% Armor (Cav Ranged)", baseCost: 2, category: "Cavalry – Ranged", tags: [GamePhase.MID] },
    { name: "20% Attack (Cav Ranged)", baseCost: 4, category: "Cavalry – Ranged", tags: [GamePhase.MID] },
    { name: "30% Build Time (Cav Ranged)", baseCost: 3, category: "Cavalry – Ranged", tags: [GamePhase.MID] },
    { name: "20% Cost Reduction (Cav Ranged)", baseCost: 8, category: "Cavalry – Ranged", tags: [GamePhase.MID] },
    { name: "25% Hit Points (Cav Ranged)", baseCost: 4, category: "Cavalry – Ranged", tags: [GamePhase.MID] },
    { name: "20% Range (Cav Ranged)", baseCost: 5, category: "Cavalry – Ranged", tags: [GamePhase.MID] },
    { name: "20% Speed (Cav Ranged)", baseCost: 4, category: "Cavalry – Ranged", tags: [GamePhase.MID] },

     // Siege
    { name: "20% Area Effect (Siege)", baseCost: 5, category: "Siege Weapons & Mobile AA", tags: [GamePhase.LATE] },
    { name: "20% Armor (Siege)", baseCost: 1, category: "Siege Weapons & Mobile AA", tags: [GamePhase.LATE] },
    { name: "20% Attack (Siege)", baseCost: 2, category: "Siege Weapons & Mobile AA", tags: [GamePhase.LATE] },
    { name: "30% Build Time (Siege)", baseCost: 1, category: "Siege Weapons & Mobile AA", tags: [GamePhase.MID] },
    { name: "20% Cost Reduction (Siege)", baseCost: 3, category: "Siege Weapons & Mobile AA", tags: [GamePhase.MID] },
    { name: "25% Hit Points (Siege)", baseCost: 2, category: "Siege Weapons & Mobile AA", tags: [GamePhase.LATE] },
    { name: "20% Range (Siege)", baseCost: 2, category: "Siege Weapons & Mobile AA", tags: [GamePhase.LATE] },
    { name: "25% Rate of Fire (Siege)", baseCost: 2, category: "Siege Weapons & Mobile AA", tags: [GamePhase.LATE] },
    { name: "20% Speed (Siege)", baseCost: 2, category: "Siege Weapons & Mobile AA", tags: [GamePhase.LATE] },
    
    // Tanks
    { name: "20% Armor (Tanks)", baseCost: 3, category: "Tanks", tags: [GamePhase.LATE] },
    { name: "20% Attack (Tanks)", baseCost: 5, category: "Tanks", tags: [GamePhase.LATE] },
    { name: "20% Cost Reduction (Tanks)", baseCost: 9, category: "Tanks", tags: [GamePhase.LATE] },
    { name: "25% Hit Points (Tanks)", baseCost: 5, category: "Tanks", tags: [GamePhase.LATE] },
    
    // Aircraft
    { name: "20% Attack (Bombers)", baseCost: 5, category: "Aircraft", tags: [GamePhase.LATE] },
    { name: "20% Attack (Fighters)", baseCost: 5, category: "Aircraft", tags: [GamePhase.LATE] },
    { name: "30% Build Time (Fighters)", baseCost: 4, category: "Aircraft", tags: [GamePhase.LATE] },
    { name: "25% Hit Points (Bombers)", baseCost: 5, category: "Aircraft", tags: [GamePhase.LATE] },
    
    // Ships
    { name: "20% Speed (Ships)", baseCost: 4, category: "Ships", tags: [GamePhase.MID] },
    { name: "20% Attack (Ships)", baseCost: 5, category: "Ships", tags: [GamePhase.MID] },
    { name: "20% Range (Ships)", baseCost: 6, category: "Ships", tags: [GamePhase.MID] },
    { name: "25% Hit Points (Ships)", baseCost: 5, category: "Ships", tags: [GamePhase.MID] },
    { name: "20% Cost Reduction (Ships)", baseCost: 9, category: "Ships", tags: [GamePhase.EARLY] },
    
    // Cyber
    { name: "20% Attack (Cyber)", baseCost: 5, category: "Cyber", tags: [GamePhase.LATE] },
    { name: "20% Hit Points (Cyber)", baseCost: 5, category: "Cyber", tags: [GamePhase.LATE] },

    // Religion
    { name: "20% Range (Priests)", baseCost: 4, category: "Religion", tags: [GamePhase.MID] },
    { name: "30% Hit Points (Priests)", baseCost: 4, category: "Religion", tags: [GamePhase.MID] },
    { name: "50% Conversion Area", baseCost: 10, category: "Religion", tags: [GamePhase.MID] },
];

export const CIV_POWERS: CivPower[] = [
    { name: "Expansionism", cost: 30, minEpoch: 1, maxEpoch: 15, tags: [GamePhase.EARLY] },
    { name: "Advanced Mining", cost: 25, minEpoch: 1, maxEpoch: 15, tags: [GamePhase.EARLY, GamePhase.MID] },
    { name: "Just-In-Time Manufacturing", cost: 20, minEpoch: 1, maxEpoch: 15, tags: [GamePhase.MID] },
    { name: "Market", cost: 20, minEpoch: 10, maxEpoch: 15, tags: [GamePhase.LATE] },
    { name: "Missile Base", cost: 15, minEpoch: 13, maxEpoch: 15, tags: [GamePhase.LATE] },
    { name: "Adaptation", cost: 15, minEpoch: 3, maxEpoch: 15, tags: [GamePhase.MID] },
    { name: "Slavery", cost: 10, minEpoch: 1, maxEpoch: 15, tags: [GamePhase.EARLY] },
    { name: "Priest Tower", cost: 30, minEpoch: 1, maxEpoch: 15, tags: [GamePhase.MID] },
    { name: "Pathfinding", cost: 25, minEpoch: 1, maxEpoch: 15, tags: [GamePhase.EARLY] },
    { name: "SAS Commando", cost: 15, minEpoch: 10, maxEpoch: 15, tags: [GamePhase.LATE] },
];
