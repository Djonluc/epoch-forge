
export enum GamePhase {
    EARLY = 'Early',
    MID = 'Mid',
    LATE = 'Late'
}

export type BoostCategory = 
    | "Civ – Economy"
    | "Civ – Buildings, Walls & Towers"
    | "Civ – General"
    | "Citizens & Fishing Boats"
    | "Infantry – Ranged"
    | "Infantry – Sword / Spear"
    | "Cavalry – Ranged"
    | "Cavalry – Melee"
    | "Siege Weapons & Mobile AA"
    | "Tanks"
    | "Aircraft"
    | "Ships"
    | "Cyber"
    | "Religion";

export interface Heading {
    name: BoostCategory;
    bonusCost: number;
    minEpoch: number;
}

export interface Boost {
    name: string;
    baseCost: number;
    category: BoostCategory;
    tags: GamePhase[];
}

export interface CivPower {
    name: string;
    cost: number;
    minEpoch: number; // 1 means All usually, but we track specific start
    maxEpoch: number; // 15 means All/up to end
    tags: GamePhase[];
}

export interface GeneratedItem {
    name: string;
    cost: number;
    originalCost: number;
    type: 'boost' | 'power';
    category?: BoostCategory;
    inflationApplied?: number;
}

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type Archetype = 'Random' | 'Economic' | 'Aggressive' | 'Defensive' | 'Naval' | 'Balanced';

export interface PlayerCiv {
    id: string;
    playerName: string;
    pointsSpent: number;
    items: GeneratedItem[];
    ratings: {
        early: number;
        mid: number;
        late: number;
    };
    summary: string;
    powerScore: number;
    seed: string;
    primaryCategory: string; // The dominant category for UI accents
    difficulty: Difficulty;
    reasoning: string;
    warnings: string[]; // Map-aware warnings
    rerollUsed: boolean;
}

export type PresetMode = 'Casual' | 'Tournament' | 'Chaos' | 'Historical';
export type PointUsageMode = 'Efficient' | 'Exact' | 'Loose';
export type MapType = 'Land' | 'Water' | 'Mixed' | 'Islands' | 'Coastal' | 'Rivers' | 'Space' | 'Random';

export interface AppConfig {
    numPlayers: number;
    playerNames: string[];
    playerArchetypes: Archetype[]; // Parallel array to playerNames
    startEpoch: number;
    endEpoch: number;
    seed: string;
    
    // Active / Default Settings
    preset: PresetMode;
    pointUsage: PointUsageMode;
    mapType: MapType;

    // Randomization Settings
    isMapRandom: boolean;
    allowedMaps: MapType[];

    isPresetRandom: boolean;
    allowedPresets: PresetMode[];

    isPointUsageRandom: boolean;
    allowedPointUsages: PointUsageMode[];

    isEndEpochRandom: boolean;
    endEpochMin: number;
    endEpochMax: number;
}
